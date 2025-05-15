/**
 * Webhook handler for Vapi calls - Deploy to Render.com
 * 
 * This server receives webhooks from Vapi and stores them in the database
 * with the proper user_id association.
 */

import express from 'express';
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { eq } from 'drizzle-orm';

// Express server setup
const app = express();
app.use(express.json());

// Map agent_id to user_id (hardcoded for now)
// The agent with ID d91b7d95-2949-490d-b97f-a42da7ad3097 belongs to user with ID 1 (admin1)
const agentToUserMap = {
  'd91b7d95-2949-490d-b97f-a42da7ad3097': 1
};

// Database connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

// Simple schema for inserting calls
const calls = {
  id: { name: 'id' },
  call_id: { name: 'call_id' },
  caller_id: { name: 'caller_id' },
  start_time: { name: 'start_time' },
  end_time: { name: 'end_time' },
  duration_seconds: { name: 'duration_seconds' },
  workflow_id: { name: 'workflow_id' },
  transcription: { name: 'transcription' },
  summary: { name: 'summary' },
  status: { name: 'status' },
  user_id: { name: 'user_id' }
};

// Root endpoint for testing
app.get('/', (req, res) => {
  res.send('Vapi webhook server is running');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Webhook handler
app.post('/webhook', async (req, res) => {
  console.log('Received webhook:', req.headers['x-vapi-webhook-type']);
  console.log('Payload:', JSON.stringify(req.body, null, 2));
  
  try {
    const webhookType = req.headers['x-vapi-webhook-type'];
    const data = req.body;
    
    // Determine the user ID based on the agent ID
    const agent_id = data.agent_id || data.workflow_id || data.assistant_id;
    const user_id = agentToUserMap[agent_id] || null;
    
    if (!user_id) {
      console.warn(`No user ID found for agent: ${agent_id}`);
    }
    
    console.log(`Mapped agent ${agent_id} to user ${user_id}`);
    
    // Process different webhook types
    if (webhookType === 'call.started') {
      // Create a new call record
      await db.insert(calls).values({
        call_id: data.call_id,
        caller_id: data.caller_id || '+18005551234',
        start_time: new Date().toISOString(),
        status: 'in-progress',
        workflow_id: agent_id,
        user_id: user_id
      });
      
      console.log(`Created new call record for call_id: ${data.call_id}`);
    } 
    else if (webhookType === 'call.ended') {
      // Update the call with end time and duration
      const duration = data.duration_seconds || 0;
      const end_time = new Date().toISOString();
      
      await db.update(calls)
        .set({ 
          end_time: end_time,
          duration_seconds: duration,
          status: 'completed'
        })
        .where(eq(calls.call_id, data.call_id));
      
      console.log(`Updated call record with end time for call_id: ${data.call_id}`);
    }
    else if (webhookType === 'call.transcription') {
      // Update the call with the transcription
      await db.update(calls)
        .set({ transcription: data.transcription || '' })
        .where(eq(calls.call_id, data.call_id));
      
      console.log(`Updated call record with transcription for call_id: ${data.call_id}`);
    }
    else if (webhookType === 'call.summary') {
      // Update the call with the summary
      await db.update(calls)
        .set({ summary: data.summary || '' })
        .where(eq(calls.call_id, data.call_id));
      
      console.log(`Updated call record with summary for call_id: ${data.call_id}`);
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Webhook server listening on port ${PORT}`);
});