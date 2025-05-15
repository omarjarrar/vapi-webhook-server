/**
 * A standalone webhook server for testing
 * Run with: node webhook-server.js
 */

const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Simple ping endpoint
app.get('/ping', (req, res) => {
  console.log('Ping endpoint hit!');
  res.json({ pong: true, time: new Date().toISOString() });
});

// Simple webhook receiver
app.post('/webhook', (req, res) => {
  const timestamp = new Date().toISOString();
  console.log(`Webhook received at ${timestamp}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body:', JSON.stringify(req.body, null, 2));
  
  res.status(200).send('OK');
});

// Root endpoint for testing
app.get('/', (req, res) => {
  res.send('Webhook server is running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Webhook server listening on port ${PORT}`);
});