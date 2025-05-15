import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

// Create a separate express app for webhook testing
export function setupBasicWebhook(app: express.Express) {
  // Log all requests to see what's coming in
  app.use((req, res, next) => {
    console.log(`📥 INCOMING REQUEST: ${req.method} ${req.url}`);
    next();
  });

  // Very simple test endpoint
  app.get('/api/ping', (req, res) => {
    console.log('PING endpoint hit!');
    return res.json({ pong: true, time: new Date().toISOString() });
  });

  // Super simple webhook receiver
  app.post('/api/simple-webhook', (req, res) => {
    try {
      const timestamp = new Date().toISOString();
      console.log(`🪝 SIMPLE WEBHOOK received at ${timestamp}`);
      console.log('Headers:', JSON.stringify(req.headers, null, 2));
      console.log('Body:', JSON.stringify(req.body, null, 2));
      
      return res.json({ 
        success: true, 
        message: 'Webhook received and logged',
        timestamp,
        receivedHeaders: Object.keys(req.headers).length,
        receivedBodyKeys: Object.keys(req.body).length
      });
    } catch (error) {
      console.error('Error in simple webhook:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Error processing webhook'
      });
    }
  });

  // Another webhook endpoint that's even simpler for testing
  app.post('/webhook', (req, res) => {
    console.log('⚡ Basic webhook endpoint hit!');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    return res.status(200).send('OK');
  });
}