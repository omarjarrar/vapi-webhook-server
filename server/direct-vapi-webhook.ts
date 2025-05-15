import { Request, Response, Express } from "express";
import { Pool } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log file for debugging
const logFile = path.join(logsDir, 'vapi-webhook.log');

/**
 * Log data to file and console for debugging
 */
function logData(data: any) {
  const timestamp = new Date().toISOString();
  const logEntry = `${timestamp} - ${JSON.stringify(data)}\n`;
  
  console.log(`🔍 DIRECT VAPI WEBHOOK:`, data);
  
  // Append to log file
  fs.appendFileSync(logFile, logEntry);
}

/**
 * Set up a direct webhook handler for Vapi calls
 * Uses raw SQL queries to avoid ORM issues
 */
export function setupDirectVapiWebhook(app: Express, pool: Pool) {
  // Make sure the logs directory exists
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  
  // Health check endpoint
  app.get("/vapi-webhook-health", (_req: Request, res: Response) => {
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
  });
  
  // Database connection test endpoint
  app.get("/vapi-webhook-db-test", async (_req: Request, res: Response) => {
    try {
      const result = await pool.query('SELECT NOW()');
      res.json({ 
        status: "connected", 
        timestamp: result.rows[0].now,
        message: "Database connection is working properly."
      });
    } catch (error) {
      res.status(500).json({ 
        status: "error", 
        message: "Database connection failed",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Main webhook handler
  app.post("/direct-vapi-webhook", async (req: Request, res: Response) => {
    try {
      // Log the complete incoming webhook for debugging
      logData({
        endpoint: "/direct-vapi-webhook",
        headers: req.headers,
        body: req.body
      });
      
      // Define known Vapi agent IDs and associate with user accounts
      const VAPI_AGENT_MAPPINGS: Record<string, number> = {
        'd91b7d95-2949-490d-b97f-a42da7ad3097': 1 // admin1 user ID
      };
      
      // Get event type from headers or body
      const eventType = 
        req.headers['x-vapi-webhook-type'] || 
        req.headers['X-Vapi-Webhook-Type'] || 
        req.body.event || 
        req.body.type || 
        '';
      
      // Extract call_id from different possible locations
      const call_id = req.body.call_id || req.body.callId || req.body.id;
      
      if (!call_id) {
        console.log("❌ ERROR: Missing call_id in webhook payload");
        return res.status(400).json({ message: "Missing call_id in webhook payload" });
      }
      
      // Extract agent ID from request (ensure it's a string)
      const agentId = String(req.body.agent_id || req.body.assistant_id || req.body.workflow_id || '');
      
      // Default to first user if agent ID not found in mappings
      const userId = agentId && VAPI_AGENT_MAPPINGS.hasOwnProperty(agentId)
        ? VAPI_AGENT_MAPPINGS[agentId] 
        : 1; // Use admin1 as default
      
      // Handle different event types
      switch (String(eventType).toLowerCase()) {
        case 'call.started': {
          // Call started event
          const callData = {
            call_id,
            caller_id: req.body.caller_id || req.body.from || 'Unknown',
            start_time: new Date(),
            status: 'in-progress',
            workflow_id: agentId || null,
            user_id: userId
          };
          
          // Insert new call record using raw SQL
          const insertQuery = `
            INSERT INTO calls (call_id, caller_id, start_time, status, workflow_id, user_id, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, NOW())
            ON CONFLICT (call_id) 
            DO UPDATE SET 
              caller_id = EXCLUDED.caller_id,
              start_time = EXCLUDED.start_time,
              status = EXCLUDED.status,
              workflow_id = EXCLUDED.workflow_id
            RETURNING *
          `;
          
          const result = await pool.query(insertQuery, [
            callData.call_id,
            callData.caller_id,
            callData.start_time,
            callData.status,
            callData.workflow_id,
            callData.user_id
          ]);
          
          console.log("✅ Call started record inserted:", result.rows[0]);
          return res.status(200).json({ success: true, message: "Call started event processed" });
        }
        
        case 'call.ended': {
          // Call ended event
          const duration = parseInt(req.body.duration_seconds || req.body.duration || '0', 10);
          const endTime = new Date();
          
          // Update existing call record
          const updateQuery = `
            UPDATE calls 
            SET 
              end_time = $1,
              duration_seconds = $2,
              status = 'completed'
            WHERE call_id = $3
            RETURNING *
          `;
          
          const result = await pool.query(updateQuery, [endTime, duration, call_id]);
          
          if (result.rowCount === 0) {
            // Call record doesn't exist, create it
            const insertQuery = `
              INSERT INTO calls (
                call_id, end_time, duration_seconds, status, workflow_id, user_id, created_at
              )
              VALUES ($1, $2, $3, $4, $5, $6, NOW())
              RETURNING *
            `;
            
            const insertResult = await pool.query(insertQuery, [
              call_id,
              endTime,
              duration,
              'completed',
              agentId || null,
              userId
            ]);
            
            console.log("✅ Call ended record created:", insertResult.rows[0]);
          } else {
            console.log("✅ Call ended record updated:", result.rows[0]);
          }
          
          return res.status(200).json({ success: true, message: "Call ended event processed" });
        }
        
        case 'call.transcription': {
          // Add transcription to call record
          const transcription = req.body.transcription || req.body.transcript || '';
          
          if (!transcription) {
            return res.status(400).json({ message: "Missing transcription in webhook payload" });
          }
          
          const updateQuery = `
            UPDATE calls 
            SET transcription = $1
            WHERE call_id = $2
            RETURNING *
          `;
          
          const result = await pool.query(updateQuery, [transcription, call_id]);
          
          if (result.rowCount === 0) {
            // Call record doesn't exist, create it
            const insertQuery = `
              INSERT INTO calls (
                call_id, transcription, status, workflow_id, user_id, created_at
              )
              VALUES ($1, $2, $3, $4, $5, NOW())
              RETURNING *
            `;
            
            const insertResult = await pool.query(insertQuery, [
              call_id,
              transcription,
              'completed',
              agentId || null,
              userId
            ]);
            
            console.log("✅ Call transcription record created:", insertResult.rows[0]);
          } else {
            console.log("✅ Call transcription record updated:", result.rows[0]);
          }
          
          return res.status(200).json({ success: true, message: "Call transcription event processed" });
        }
        
        case 'call.summary': {
          // Add summary to call record
          const summary = req.body.summary || '';
          
          if (!summary) {
            return res.status(400).json({ message: "Missing summary in webhook payload" });
          }
          
          const updateQuery = `
            UPDATE calls 
            SET summary = $1
            WHERE call_id = $2
            RETURNING *
          `;
          
          const result = await pool.query(updateQuery, [summary, call_id]);
          
          if (result.rowCount === 0) {
            // Call record doesn't exist, create it
            const insertQuery = `
              INSERT INTO calls (
                call_id, summary, status, workflow_id, user_id, created_at
              )
              VALUES ($1, $2, $3, $4, $5, NOW())
              RETURNING *
            `;
            
            const insertResult = await pool.query(insertQuery, [
              call_id,
              summary,
              'completed',
              agentId || null,
              userId
            ]);
            
            console.log("✅ Call summary record created:", insertResult.rows[0]);
          } else {
            console.log("✅ Call summary record updated:", result.rows[0]);
          }
          
          return res.status(200).json({ success: true, message: "Call summary event processed" });
        }
        
        default: {
          // Unknown event type, log it but still return success
          console.log(`⚠️ Unknown event type: ${eventType}`, req.body);
          return res.status(200).json({ 
            success: true, 
            message: `Unknown event type: ${eventType}`,
            stored: false
          });
        }
      }
    } catch (error) {
      // Log error and return 500
      console.error("❌ ERROR in direct vapi webhook:", error);
      
      // Log error to file
      logData({
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : 'No stack trace',
        body: req.body
      });
      
      return res.status(500).json({ 
        success: false, 
        message: "Error processing webhook", 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
}