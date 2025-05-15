/**
 * VAPI Standalone Webhook Handler
 * 
 * This is a minimal, standalone webhook handler for Vapi that works 100% independently.
 * It directly connects to your Postgres database and inserts call data.
 * 
 * Run with: node vapi-standalone-webhook.js
 */

import express from 'express';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create app
const app = express();
app.use(express.json());

// Create logs directory
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create log function
function logWebhook(data) {
  const timestamp = new Date().toISOString();
  const logEntry = `${timestamp} - ${JSON.stringify(data, null, 2)}\n\n`;
  
  console.log(`📩 WEBHOOK:`, JSON.stringify(data));
  
  try {
    fs.appendFileSync(
      path.join(logsDir, 'vapi-webhook.log'),
      logEntry
    );
  } catch (err) {
    console.error('Error writing to log:', err);
  }
}

// Create database connection
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Heroku/Render PostgreSQL
  }
});

// Test the database connection
async function testDbConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✅ Database connected successfully:', result.rows[0].now);
    client.release();
    return true;
  } catch (err) {
    console.error('❌ Database connection error:', err);
    return false;
  }
}

// Map Vapi agent IDs to user IDs
const AGENT_TO_USER_MAPPING = {
  'd91b7d95-2949-490d-b97f-a42da7ad3097': 1 // admin1 user
};

// Webhook handler function
async function handleWebhook(req, res) {
  try {
    // Extract webhook data
    const webhookType = 
      req.headers['x-vapi-webhook-type'] || 
      req.headers['X-Vapi-Webhook-Type'] || 
      req.body.event || 
      req.body.type || 
      'unknown';
    
    // Log the request for debugging
    logWebhook({
      type: webhookType,
      headers: req.headers,
      body: req.body,
      time: new Date().toISOString()
    });
    
    // Extract call_id - this must exist in the webhook payload
    const callId = req.body.call_id || req.body.callId || req.body.id;
    if (!callId) {
      console.log('❌ Missing call_id in webhook payload');
      return res.status(400).json({ error: 'Missing call_id in payload' });
    }
    
    // Extract agent ID and map to user ID
    const agentId = String(req.body.agent_id || req.body.assistant_id || req.body.workflow_id || '');
    const userId = agentId && AGENT_TO_USER_MAPPING.hasOwnProperty(agentId)
      ? AGENT_TO_USER_MAPPING[agentId]
      : 1; // Default to user ID 1 (admin1)
    
    // Handle different webhook types
    const client = await pool.connect();
    
    try {
      switch(String(webhookType).toLowerCase()) {
        case 'call.started': {
          const caller = req.body.caller_id || req.body.from || 'Unknown';
          const startTime = new Date();
          
          // Check if the call already exists
          const checkResult = await client.query(
            'SELECT id FROM calls WHERE call_id = $1',
            [callId]
          );
          
          if (checkResult.rowCount > 0) {
            // Update existing call
            await client.query(
              `UPDATE calls 
               SET caller_id = $1, 
                   start_time = $2, 
                   status = $3,
                   workflow_id = $4
               WHERE call_id = $5`,
              [caller, startTime, 'in-progress', agentId, callId]
            );
            console.log(`✅ Updated existing call: ${callId}`);
          } else {
            // Insert new call
            await client.query(
              `INSERT INTO calls 
               (call_id, caller_id, start_time, status, workflow_id, user_id, created_at) 
               VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
              [callId, caller, startTime, 'in-progress', agentId, userId]
            );
            console.log(`✅ Inserted new call: ${callId}`);
          }
          break;
        }
        
        case 'call.ended': {
          const duration = parseInt(req.body.duration_seconds || req.body.duration || '0', 10);
          const endTime = new Date();
          
          // Check if the call exists
          const checkResult = await client.query(
            'SELECT id FROM calls WHERE call_id = $1',
            [callId]
          );
          
          if (checkResult.rowCount > 0) {
            // Update existing call
            await client.query(
              `UPDATE calls 
               SET end_time = $1, 
                   duration_seconds = $2, 
                   status = $3
               WHERE call_id = $4`,
              [endTime, duration, 'completed', callId]
            );
            console.log(`✅ Updated call with end info: ${callId}`);
          } else {
            // Insert new call with end info
            await client.query(
              `INSERT INTO calls 
               (call_id, end_time, duration_seconds, status, workflow_id, user_id, created_at) 
               VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
              [callId, endTime, duration, 'completed', agentId, userId]
            );
            console.log(`✅ Inserted new call with end info: ${callId}`);
          }
          break;
        }
        
        case 'call.transcription': {
          const transcription = req.body.transcription || req.body.transcript || '';
          
          // Check if the call exists
          const checkResult = await client.query(
            'SELECT id FROM calls WHERE call_id = $1',
            [callId]
          );
          
          if (checkResult.rowCount > 0) {
            // Update existing call
            await client.query(
              `UPDATE calls SET transcription = $1 WHERE call_id = $2`,
              [transcription, callId]
            );
            console.log(`✅ Updated call with transcription: ${callId}`);
          } else {
            // Insert new call with transcription
            await client.query(
              `INSERT INTO calls 
               (call_id, transcription, status, workflow_id, user_id, created_at) 
               VALUES ($1, $2, $3, $4, $5, NOW())`,
              [callId, transcription, 'completed', agentId, userId]
            );
            console.log(`✅ Inserted new call with transcription: ${callId}`);
          }
          break;
        }
        
        case 'call.summary': {
          const summary = req.body.summary || '';
          
          // Check if the call exists
          const checkResult = await client.query(
            'SELECT id FROM calls WHERE call_id = $1',
            [callId]
          );
          
          if (checkResult.rowCount > 0) {
            // Update existing call
            await client.query(
              `UPDATE calls SET summary = $1 WHERE call_id = $2`,
              [summary, callId]
            );
            console.log(`✅ Updated call with summary: ${callId}`);
          } else {
            // Insert new call with summary
            await client.query(
              `INSERT INTO calls 
               (call_id, summary, status, workflow_id, user_id, created_at) 
               VALUES ($1, $2, $3, $4, $5, NOW())`,
              [callId, summary, 'completed', agentId, userId]
            );
            console.log(`✅ Inserted new call with summary: ${callId}`);
          }
          break;
        }
        
        default:
          console.log(`⚠️ Unknown webhook type: ${webhookType}`);
      }
      
      // Always return 200 OK to Vapi
      return res.status(200).json({ 
        success: true, 
        message: `Processed ${webhookType} webhook`
      });
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    logWebhook({
      error: error.message,
      stack: error.stack,
      body: req.body
    });
    
    // Always return 200 OK to Vapi (even on error)
    // This prevents Vapi from retrying webhooks that might fail repeatedly
    return res.status(200).json({ 
      success: false, 
      message: 'Error occurred, but webhook acknowledged'
    });
  }
}

// Define routes
app.post('/webhook', handleWebhook);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    time: new Date().toISOString()
  });
});

// Database check endpoint
app.get('/db-check', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    
    res.json({
      status: 'ok',
      dbTime: result.rows[0].now,
      message: 'Database connection successful'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;

// Test the database connection before starting
testDbConnection().then(dbConnected => {
  // Start server even if DB connection fails
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`
    🚀 VAPI Standalone Webhook Server running!
    
    📡 Server listening on port ${PORT}
    🔗 Webhook URL: http://your-domain.com/webhook
    💾 Database ${dbConnected ? 'connected' : 'connection FAILED'}
    
    Available endpoints:
    - POST /webhook    - Main webhook endpoint for Vapi
    - GET  /health     - Health check endpoint
    - GET  /db-check   - Database connection test
    `);
  });
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down');
  pool.end();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down');
  pool.end();
  process.exit(0);
});