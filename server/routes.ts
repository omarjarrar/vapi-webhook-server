import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { leadDataSchema, insertCallSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { setupAuth } from "./auth";
import { processMessage, ChatMessage } from "./services/chatbot";
import { WebSocketServer, WebSocket } from "ws";
import { setupBasicWebhook } from "./basic-webhook";

export async function registerRoutes(app: Express): Promise<Server> {
  // Most basic webhook endpoint possible
  app.post("/webhook", (req: Request, res: Response) => {
    console.log("DIRECT WEBHOOK endpoint hit!");
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);
    res.status(200).send("OK");
  });
  
  app.get("/ping", (_req: Request, res: Response) => {
    res.json({ pong: true, time: new Date().toISOString() });
  });
  
  // Set up basic webhook handler
  setupBasicWebhook(app);
  
  // Set up authentication routes
  setupAuth(app);
  
  // Trial signup endpoint
  app.post("/api/trial-signup", async (req: Request, res: Response) => {
    try {
      // Validate the request body using zod schema
      const validatedData = leadDataSchema.safeParse(req.body);
      
      if (!validatedData.success) {
        const validationError = fromZodError(validatedData.error);
        return res.status(400).json({ 
          message: "Invalid form data", 
          errors: validationError.details 
        });
      }
      
      // Store the lead data
      const leadData = await storage.createLead(validatedData.data);
      
      // Return success response
      return res.status(201).json({
        message: "Trial signup successful",
        data: leadData
      });
    } catch (error) {
      console.error("Error in trial signup:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get leads (for admin purposes)
  app.get("/api/leads", async (_req: Request, res: Response) => {
    try {
      const leads = await storage.getLeads();
      return res.status(200).json(leads);
    } catch (error) {
      console.error("Error fetching leads:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Chat API endpoint
  app.post("/api/chat", async (req: Request, res: Response) => {
    try {
      const { message, history } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ 
          message: "Missing or invalid message in request body" 
        });
      }
      
      // Process the message with our OpenAI-powered assistant
      const response = await processMessage(message, history || []);
      
      return res.status(200).json({ message: response });
    } catch (error) {
      console.error("Error in chat processing:", error);
      return res.status(500).json({ 
        message: "Failed to process your request", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Vapi webhook endpoint for call data
  app.post("/api/vapi-webhook", async (req: Request, res: Response) => {
    try {
      // Log the complete incoming webhook data for debugging
      console.log("🔍 VAPI WEBHOOK RECEIVED:", {
        headers: req.headers,
        body: req.body,
        method: req.method,
        url: req.url,
        timestamp: new Date().toISOString()
      });
      
      // Define known Vapi agent IDs and associate with user accounts
      const VAPI_AGENT_MAPPINGS: Record<string, number> = {
        'd91b7d95-2949-490d-b97f-a42da7ad3097': 1 // admin1 user ID
      };
      
      // Try different header variations that Vapi might use
      const eventType = 
        req.headers['x-vapi-webhook-type'] || 
        req.headers['X-Vapi-Webhook-Type'] || 
        req.body.event || 
        req.body.type || 
        '';
      
      console.log("🔍 VAPI EVENT TYPE:", eventType);
      
      // Flexibly extract call_id from different possible locations
      const call_id = req.body.call_id || req.body.callId || req.body.id;
      
      if (!call_id) {
        console.log("❌ ERROR: Missing call_id in webhook payload");
        return res.status(400).json({ message: "Missing call_id in webhook payload" });
      }

      // Log full request details for debugging
      console.log(`Received Vapi webhook: ${eventType}`, { 
        callId: call_id,
        headers: req.headers,
        body: req.body
      });
      
      // Extract agent ID from request (ensure it's a string)
      const agentId = (req.body.assistant_id || req.body.workflow_id || '') as string;
      
      // Default to first user if agent ID not found in mappings
      const userId = agentId && VAPI_AGENT_MAPPINGS.hasOwnProperty(agentId)
        ? VAPI_AGENT_MAPPINGS[agentId] 
        : 1; // Use admin1 as default
      
      // Handle different event types
      switch (eventType) {
        case 'call.started': {
          // Store new call data with user ID and proper workflow ID
          const callData = {
            call_id,
            caller_id: req.body.caller_id || 'Unknown',
            start_time: new Date(),
            workflow_id: agentId || 'd91b7d95-2949-490d-b97f-a42da7ad3097', // Use provided ID or default to Ring Ready agent
            status: 'started'
          };
          
          console.log('Creating new call with data:', callData);
          const newCall = await storage.createCall(callData);
          
          // Broadcast the new call to all connected clients
          broadcastToClients({
            type: 'call_started',
            data: newCall
          });
          
          break;
        }
        
        case 'call.ended': {
          // Update existing call with end time and duration
          const endTime = new Date();
          const callData = await storage.getCall(call_id);
          
          if (!callData) {
            console.log('Call not found for call.ended event, creating new record');
            // Create a new record if the call is not found (webhook events might arrive out of order)
            const newCallData = {
              call_id,
              caller_id: req.body.caller_id || 'Unknown',
              start_time: new Date(endTime.getTime() - 60000), // Default to 1 minute ago
              end_time: endTime,
              workflow_id: agentId || 'd91b7d95-2949-490d-b97f-a42da7ad3097',
              status: 'ended',
              duration_seconds: req.body.duration || 60 // Default to 1 minute
            };
            
            const newCall = await storage.createCall(newCallData);
            
            // Broadcast the new call
            broadcastToClients({
              type: 'call_ended',
              data: newCall
            });
            
            return res.status(200).json({ message: "Webhook processed successfully - created new call record" });
          }
          
          // Calculate duration
          const startTime = callData.start_time || new Date(endTime.getTime() - 60000);
          const durationSeconds = Math.round((endTime.getTime() - startTime.getTime()) / 1000);
          
          console.log('Updating call for call.ended event:', {
            callId: call_id,
            durationSeconds,
            endTime
          });
          
          const updatedCall = await storage.updateCall(call_id, {
            end_time: endTime,
            duration_seconds: durationSeconds,
            status: 'ended'
            // user_id is already in the database from creation
          });
          
          // Broadcast the updated call
          if (updatedCall) {
            broadcastToClients({
              type: 'call_ended',
              data: updatedCall
            });
          }
          
          break;
        }
        
        case 'call.transcription': {
          // Check if call exists first
          const callData = await storage.getCall(call_id);
          
          if (!callData) {
            console.log('Call not found for call.transcription event, creating new record');
            // Create a new record if the call is not found
            const newCallData = {
              call_id,
              caller_id: req.body.caller_id || 'Unknown',
              start_time: new Date(Date.now() - 30000), // Default to 30 seconds ago
              workflow_id: agentId || 'd91b7d95-2949-490d-b97f-a42da7ad3097',
              status: 'in-progress',
              transcription: req.body.transcription || ''
            };
            
            const newCall = await storage.createCall(newCallData);
            
            // Broadcast the new call
            broadcastToClients({
              type: 'call_transcription',
              data: newCall
            });
            
            return res.status(200).json({ message: "Webhook processed successfully - created new call record with transcription" });
          }
          
          // Update call with transcription data
          console.log('Updating call with transcription data');
          const updatedCall = await storage.updateCall(call_id, {
            transcription: req.body.transcription || ''
            // user_id is already in the database from creation
          });
          
          // Broadcast the updated transcription
          if (updatedCall) {
            broadcastToClients({
              type: 'call_transcription',
              data: updatedCall
            });
          }
          
          break;
        }
        
        case 'call.summary': {
          // Check if call exists first
          const callData = await storage.getCall(call_id);
          
          if (!callData) {
            console.log('Call not found for call.summary event, creating new record');
            // Create a new record if the call is not found
            const newCallData = {
              call_id,
              caller_id: req.body.caller_id || 'Unknown',
              start_time: new Date(Date.now() - 60000), // Default to 1 minute ago
              end_time: new Date(),
              workflow_id: agentId || 'd91b7d95-2949-490d-b97f-a42da7ad3097',
              status: 'completed',
              summary: req.body.summary || '',
              duration_seconds: 60 // Default to 1 minute
            };
            
            const newCall = await storage.createCall(newCallData);
            
            // Broadcast the new call
            broadcastToClients({
              type: 'call_summary',
              data: newCall
            });
            
            return res.status(200).json({ message: "Webhook processed successfully - created new call record with summary" });
          }
          
          // Update call with summary data
          console.log('Updating call with summary data');
          const updatedCall = await storage.updateCall(call_id, {
            summary: req.body.summary || '',
            status: 'completed'
            // user_id is already in the database from creation
          });
          
          // Broadcast the updated summary
          if (updatedCall) {
            broadcastToClients({
              type: 'call_summary',
              data: updatedCall
            });
          }
          
          break;
        }
        
        default:
          console.log(`Unhandled webhook event type: ${eventType}`, req.body);
      }
      
      return res.status(200).json({ message: "Webhook processed successfully" });
    } catch (error) {
      console.error("Error processing Vapi webhook:", error);
      return res.status(500).json({ 
        message: "Failed to process webhook", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // Simple test endpoint for webhook debugging
  app.get("/api/webhook-test", (_req: Request, res: Response) => {
    return res.json({ 
      message: "Webhook endpoint is accessible", 
      timestamp: new Date().toISOString(),
      status: "ok" 
    });
  });
  
  // Test webhook POST endpoint for manual testing
  app.post("/api/webhook-test", (req: Request, res: Response) => {
    console.log("🔧 TEST WEBHOOK RECEIVED:", {
      headers: req.headers,
      body: req.body,
      method: req.method,
      url: req.url
    });
    
    return res.json({ 
      message: "Test webhook received successfully",
      receivedData: {
        headers: req.headers,
        body: req.body
      },
      timestamp: new Date().toISOString()
    });
  });

  // Call data API endpoints
  app.get("/api/calls", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const status = req.query.status as string | undefined;
      
      let calls;
      if (status) {
        calls = await storage.getCallsByStatus(status, limit);
      } else {
        calls = await storage.getCalls(limit);
      }
      
      return res.status(200).json(calls);
    } catch (error) {
      console.error("Error fetching calls:", error);
      return res.status(500).json({ message: "Failed to fetch calls" });
    }
  });
  
  app.get("/api/calls/stats", async (_req: Request, res: Response) => {
    try {
      const stats = await storage.getCallStats();
      return res.status(200).json(stats);
    } catch (error) {
      console.error("Error fetching call stats:", error);
      return res.status(500).json({ message: "Failed to fetch call statistics" });
    }
  });
  
  app.get("/api/calls/:callId", async (req: Request, res: Response) => {
    try {
      const call = await storage.getCall(req.params.callId);
      
      if (!call) {
        return res.status(404).json({ message: "Call not found" });
      }
      
      return res.status(200).json(call);
    } catch (error) {
      console.error("Error fetching call:", error);
      return res.status(500).json({ message: "Failed to fetch call data" });
    }
  });
  
  const httpServer = createServer(app);
  
  // Initialize WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Store connected clients
  const clients = new Set<WebSocket>();
  
  // WebSocket connection handling
  wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');
    clients.add(ws);
    
    // Send initial stats to the client
    sendInitialData(ws);
    
    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
      clients.delete(ws);
    });
  });
  
  // Function to broadcast data to all connected WebSocket clients
  function broadcastToClients(data: any) {
    const message = JSON.stringify(data);
    
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
  
  // Function to send initial data when a client connects
  async function sendInitialData(ws: WebSocket) {
    try {
      // Get recent calls and stats
      const recentCalls = await storage.getCalls(10);
      const stats = await storage.getCallStats();
      
      // Send data if the connection is still open
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'initial_data',
          data: {
            recentCalls,
            stats
          }
        }));
      }
    } catch (error) {
      console.error('Error sending initial data to client:', error);
    }
  }

  return httpServer;
}
