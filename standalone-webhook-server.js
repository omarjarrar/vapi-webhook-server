/**
 * Standalone Webhook Server for Vapi
 * Uses ES modules syntax for compatibility with "type": "module" in package.json
 */

import express from 'express';
import pkg from 'pg';
const { Pool } = pkg;

// Create Express app
const app = express();
app.use(express.json());

// Map agent IDs to user IDs
const AGENT_TO_USER_MAPPING = {
  'd91b7d95-2949-490d-b97f-a42da7ad3097': 1 // admin1 user
};

// Create database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for PostgreSQL providers
  }
});

// Test the database connection at startup
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
  } else {
    console.log('✅ Database connected:', res.rows[0].now);
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
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

// Main webhook handler
app.post('/webhook', async (req, res) => {
  try {
    console.log('📩 WEBHOOK RECEIVED:', JSON.stringify({
      headers: req.headers,
      body: req.body
    }, null, 2));
    
    // Extract data
    const webhookType = req.headers['x-vapi-webhook-type'] || 
                         req.body.event || 
                         'unknown';
    
    const callId = req.body.call_id || req.body.callId;
    if (!callId) {
      console.log('❌ Missing call_id in webhook payload');
      return res.status(200).json({ success: false, message: 'Missing call_id' });
    }
    
    // Map agent ID to user ID
    const agentId = req.body.agent_id || req.body.assistant_id || '';
    console.log(`📋 Agent ID: ${agentId}`);
    const userId = AGENT_TO_USER_MAPPING[agentId] || 1;
    console.log(`👤 User ID: ${userId}`);
    
    // Process webhook
    const client = await pool.connect();
    
    try {
      switch(String(webhookType).toLowerCase()) {
        case 'call.started':
          console.log(`📞 Processing call.started for ${callId}`);
          await client.query(
            `INSERT INTO calls 
             (call_id, caller_id, start_time, status, workflow_id, user_id, created_at) 
             VALUES ($1, $2, $3, $4, $5, $6, NOW())
             ON CONFLICT (call_id) 
             DO UPDATE SET 
               caller_id = EXCLUDED.caller_id,
               start_time = EXCLUDED.start_time,
               status = EXCLUDED.status,
               workflow_id = EXCLUDED.workflow_id`,
            [
              callId, 
              req.body.caller_id || 'Unknown', 
              new Date(), 
              'in-progress', 
              agentId, 
              userId
            ]
          );
          console.log(`✅ Processed call.started for ${callId}`);
          break;
        
        case 'call.ended':
          console.log(`📞 Processing call.ended for ${callId}`);
          await client.query(
            `UPDATE calls 
             SET end_time = $1, 
                 duration_seconds = $2, 
                 status = $3
             WHERE call_id = $4`,
            [
              new Date(), 
              parseInt(req.body.duration_seconds || '0', 10), 
              'completed', 
              callId
            ]
          );
          console.log(`✅ Processed call.ended for ${callId}`);
          break;
        
        case 'call.transcription':
          console.log(`📞 Processing call.transcription for ${callId}`);
          await client.query(
            `UPDATE calls SET transcription = $1 WHERE call_id = $2`,
            [req.body.transcription || '', callId]
          );
          console.log(`✅ Processed call.transcription for ${callId}`);
          break;
        
        case 'call.summary':
          console.log(`📞 Processing call.summary for ${callId}`);
          await client.query(
            `UPDATE calls SET summary = $1 WHERE call_id = $2`,
            [req.body.summary || '', callId]
          );
          console.log(`✅ Processed call.summary for ${callId}`);
          break;
          
        default:
          console.log(`⚠️ Unknown webhook type: ${webhookType}`);
      }
    } finally {
      client.release();
    }
    
    // Always return success
    return res.status(200).json({ 
      success: true, 
      message: `Processed ${webhookType} webhook for ${callId}`
    });
    
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    
    // Always return success to Vapi even on error
    return res.status(200).json({ 
      success: false, 
      message: 'Error occurred, but webhook acknowledged'
    });
  }
});

// Root endpoint for testing
app.get('/', (req, res) => {
  res.json({
    message: 'Vapi webhook server is running',
    endpoints: [
      '/webhook - POST - Main webhook endpoint',
      '/health - GET - Health check',
      '/db-check - GET - Database connection check'
    ],
    timestamp: new Date().toISOString()
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
🚀 Vapi Webhook Server running on port ${PORT}
📍 Endpoints:
   * GET  /health - Health check
   * GET  /db-check - Database connection check
   * POST /webhook - Main webhook endpoint
  `);
});