/**
 * Improved webhook handler for Vapi calls
 * 
 * This handler is designed to:
 * 1. Receive Vapi webhook events at /vapi-webhook
 * 2. Connect to PostgreSQL using the DATABASE_URL environment variable
 * 3. Insert the call data with the correct user_id
 * 4. Handle all webhook event types properly
 */

const express = require('express');
const { Pool } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Initialize Express app
const app = express();
app.use(express.json());

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Map Vapi agent ID to user IDs
const AGENT_TO_USER_MAP = {
  'd91b7d95-2949-490d-b97f-a42da7ad3097': 1  // This agent belongs to user 1 (admin1)
};

// Simple error handler
const handleError = (err, res) => {
  console.error('ERROR:', err);
  res.status(500).json({ error: err.message || 'An error occurred' });
};

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log webhook events to file for debugging
const logWebhookToFile = (type, headers, body) => {
  try {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      type,
      headers,
      body
    };
    
    fs.appendFileSync(
      path.join(logsDir, 'vapi-webhook.log'),
      JSON.stringify(logEntry, null, 2) + ',\n'
    );
  } catch (err) {
    console.error('Error logging to file:', err);
  }
};

// Test database connection
app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as time');
    res.json({ 
      success: true, 
      message: 'Database connection successful', 
      time: result.rows[0].time 
    });
  } catch (err) {
    handleError(err, res);
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV,
      dbConfigured: !!process.env.DATABASE_URL
    } 
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.send('Vapi webhook handler is running');
});

// Main webhook endpoint
app.post('/vapi-webhook', async (req, res) => {
  const webhookType = req.headers['x-vapi-webhook-type'] || 'unknown';
  console.log(`Received ${webhookType} webhook`);
  
  // Log webhook data to file
  logWebhookToFile(webhookType, req.headers, req.body);
  
  try {
    const data = req.body;
    
    // Extract the agent ID from the webhook data
    const agentId = data.agent_id || data.workflow_id || data.assistant_id;
    if (!agentId) {
      console.warn('No agent_id found in webhook data');
    }
    
    // Map agent ID to user ID
    const userId = AGENT_TO_USER_MAP[agentId] || null;
    console.log(`Mapped agent ID ${agentId} to user ID ${userId}`);
    
    // Process different webhook types
    if (webhookType === 'call.started') {
      // Insert new call
      const query = `
        INSERT INTO calls (
          call_id, caller_id, start_time, status, workflow_id, user_id, created_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, NOW()
        ) RETURNING *
      `;
      
      const values = [
        data.call_id,
        data.caller_id || '+18005551234',
        new Date().toISOString(),
        'in-progress',
        agentId,
        userId
      ];
      
      const result = await pool.query(query, values);
      console.log('Created new call record:', result.rows[0]);
      
      res.status(200).json({ success: true, message: 'Call started event processed' });
    }
    else if (webhookType === 'call.ended') {
      // Update call with end time and duration
      const query = `
        UPDATE calls 
        SET 
          end_time = $1, 
          duration_seconds = $2, 
          status = 'completed'
        WHERE call_id = $3
        RETURNING *
      `;
      
      const values = [
        new Date().toISOString(),
        data.duration_seconds || 0,
        data.call_id
      ];
      
      const result = await pool.query(query, values);
      
      if (result.rowCount === 0) {
        // Call not found, create a new record
        const insertQuery = `
          INSERT INTO calls (
            call_id, end_time, duration_seconds, status, workflow_id, user_id, created_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, NOW()
          ) RETURNING *
        `;
        
        const insertValues = [
          data.call_id,
          new Date().toISOString(),
          data.duration_seconds || 0,
          'completed',
          agentId,
          userId
        ];
        
        const insertResult = await pool.query(insertQuery, insertValues);
        console.log('Created new call record (from end event):', insertResult.rows[0]);
      } else {
        console.log('Updated call with end time:', result.rows[0]);
      }
      
      res.status(200).json({ success: true, message: 'Call ended event processed' });
    }
    else if (webhookType === 'call.transcription') {
      // Update call with transcription
      const query = `
        UPDATE calls 
        SET transcription = $1
        WHERE call_id = $2
        RETURNING *
      `;
      
      const values = [
        data.transcription || '',
        data.call_id
      ];
      
      const result = await pool.query(query, values);
      
      if (result.rowCount === 0) {
        // Call not found, create a new record
        const insertQuery = `
          INSERT INTO calls (
            call_id, transcription, status, workflow_id, user_id, created_at
          ) VALUES (
            $1, $2, $3, $4, $5, NOW()
          ) RETURNING *
        `;
        
        const insertValues = [
          data.call_id,
          data.transcription || '',
          'in-progress',
          agentId,
          userId
        ];
        
        const insertResult = await pool.query(insertQuery, insertValues);
        console.log('Created new call record (from transcription event):', insertResult.rows[0]);
      } else {
        console.log('Updated call with transcription:', result.rows[0]);
      }
      
      res.status(200).json({ success: true, message: 'Call transcription event processed' });
    }
    else if (webhookType === 'call.summary') {
      // Update call with summary
      const query = `
        UPDATE calls 
        SET summary = $1
        WHERE call_id = $2
        RETURNING *
      `;
      
      const values = [
        data.summary || '',
        data.call_id
      ];
      
      const result = await pool.query(query, values);
      
      if (result.rowCount === 0) {
        // Call not found, create a new record
        const insertQuery = `
          INSERT INTO calls (
            call_id, summary, status, workflow_id, user_id, created_at
          ) VALUES (
            $1, $2, $3, $4, $5, NOW()
          ) RETURNING *
        `;
        
        const insertValues = [
          data.call_id,
          data.summary || '',
          'completed',
          agentId,
          userId
        ];
        
        const insertResult = await pool.query(insertQuery, insertValues);
        console.log('Created new call record (from summary event):', insertResult.rows[0]);
      } else {
        console.log('Updated call with summary:', result.rows[0]);
      }
      
      res.status(200).json({ success: true, message: 'Call summary event processed' });
    }
    else {
      // Unknown webhook type
      console.warn(`Unknown webhook type: ${webhookType}`);
      res.status(200).json({ success: true, message: 'Webhook received but type not recognized' });
    }
  } catch (err) {
    console.error('Error processing webhook:', err);
    
    // Return 200 even on error to prevent Vapi from retrying
    res.status(200).json({ success: false, error: err.message });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Webhook server running on port ${PORT}`);
});