/**
 * Enhanced Webhook Server with Debugging Tools
 * Uses ES modules syntax for compatibility with "type": "module" in package.json
 */

import express from 'express';
import pkg from 'pg';
const { Pool } = pkg;

// Create Express app
const app = express();
app.use(express.json());

// Map agent IDs to user IDs - ADD YOUR ACTUAL AGENT ID HERE
const AGENT_TO_USER_MAPPING = {
  '3d5850ac-77c1-473f-b03a-7ea64447ad99': 1, // admin1 user
  'all-agents': 1 // Fallback for testing
};

// Create database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Store all received webhooks for debugging
const webhookHistory = [];

// Debug endpoint to see all received webhooks
app.get('/debug/webhooks', (req, res) => {
  res.json({
    count: webhookHistory.length,
    webhooks: webhookHistory
  });
});

// Debug endpoint to manually trigger a test call
app.get('/debug/test-call', async (req, res) => {
  const testCallId = `test-call-${Math.floor(Math.random() * 10000)}`;
  const testPhone = `+1555${Math.floor(Math.random() * 10000000)}`;
  
  try {
    // Create a test call in the database
    const client = await pool.connect();
    try {
      // Insert test call
      await client.query(
        `INSERT INTO calls 
         (call_id, caller_id, start_time, end_time, duration_seconds, status, workflow_id, user_id, created_at, transcription, summary) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), $9, $10)`,
        [
          testCallId,
          testPhone,
          new Date(Date.now() - 300000), // 5 minutes ago
          new Date(),
          180, // 3 minutes
          'completed',
          'test-workflow', 
          1, // user_id 1 (admin1)
          'This is a test call transcription created via the debug endpoint.',
          'Test call summary for debugging purposes.'
        ]
      );
      
      res.json({
        success: true,
        message: 'Test call created successfully',
        callId: testCallId,
        callerId: testPhone,
        userId: 1
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating test call:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating test call',
      error: error.message
    });
  }
});

// Debug endpoint to list all calls in the database
app.get('/debug/list-calls', async (req, res) => {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM calls ORDER BY created_at DESC LIMIT 20');
      res.json({
        count: result.rows.length,
        calls: result.rows
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error listing calls:', error);
    res.status(500).json({
      success: false,
      message: 'Error listing calls',
      error: error.message
    });
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
  const timestamp = new Date().toISOString();
  
  // Store webhook for debugging
  webhookHistory.unshift({
    timestamp,
    headers: req.headers,
    body: req.body
  });
  
  // Keep only the last 20 webhooks
  if (webhookHistory.length > 20) {
    webhookHistory.pop();
  }
  
  try {
    console.log(`📩 WEBHOOK RECEIVED at ${timestamp}:`, JSON.stringify({
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
    const agentId = req.body.agent_id || req.body.assistant_id || 'all-agents';
    console.log(`📋 Agent ID: ${agentId}`);
    
    // Use default user ID 1 if agent ID not found
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
      '/db-check - GET - Database connection check',
      '/debug/webhooks - GET - View received webhooks',
      '/debug/test-call - GET - Create a test call',
      '/debug/list-calls - GET - List calls in database'
    ],
    timestamp: new Date().toISOString()
  });
});

// Handle errors
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
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
   * GET  /debug/webhooks - View received webhooks
   * GET  /debug/test-call - Create a test call
   * GET  /debug/list-calls - List calls in database
  `);
});
