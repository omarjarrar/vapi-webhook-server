// Simple webhook handler for Vapi
const express = require('express');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Create app
const app = express();
app.use(express.json());

// Create logs directory
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log function
function logData(data) {
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
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for some PostgreSQL providers
  }
});

// Agent to user ID mapping
const AGENT_TO_USER_MAPPING = {
  'd91b7d95-2949-490d-b97f-a42da7ad3097': 1 // admin1 user
};

// Main webhook handler
app.post('/webhook', async (req, res) => {
  try {
    // Log the request
    logData({ 
      headers: req.headers, 
      body: req.body, 
      time: new Date().toISOString() 
    });
    
    // Extract data
    const webhookType = req.headers['x-vapi-webhook-type'] || 
                         req.body.event || 
                         'unknown';
    
    const callId = req.body.call_id || req.body.callId;
    if (!callId) {
      return res.status(200).json({ success: false, message: 'Missing call_id' });
    }
    
    // Map agent ID to user ID
    const agentId = req.body.agent_id || req.body.assistant_id || '';
    const userId = AGENT_TO_USER_MAPPING[agentId] || 1;
    
    // Process webhook
    const client = await pool.connect();
    
    try {
      switch(String(webhookType).toLowerCase()) {
        case 'call.started':
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
          break;
        
        case 'call.ended':
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
          break;
        
        case 'call.transcription':
          await client.query(
            `UPDATE calls SET transcription = $1 WHERE call_id = $2`,
            [req.body.transcription || '', callId]
          );
          break;
        
        case 'call.summary':
          await client.query(
            `UPDATE calls SET summary = $1 WHERE call_id = $2`,
            [req.body.summary || '', callId]
          );
          break;
      }
    } finally {
      client.release();
    }
    
    // Always return success
    return res.status(200).json({ 
      success: true, 
      message: `Processed ${webhookType} webhook`
    });
    
  } catch (error) {
    console.error('Error processing webhook:', error);
    
    // Always return success to Vapi even on error
    return res.status(200).json({ 
      success: false, 
      message: 'Error occurred, but webhook acknowledged'
    });
  }
});

// Health endpoint
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

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Webhook URL: http://your-domain.com/webhook`);
});

// Handle shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  pool.end();
  process.exit(0);
});