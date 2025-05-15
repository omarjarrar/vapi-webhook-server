# Improved Vapi Webhook Setup Guide

This guide will help you set up the improved webhook handler for Vapi that will correctly store call data in your PostgreSQL database with the proper user association.

## Files

This package includes:

1. `improved-vapi-webhook.js` - The main webhook handler
2. `improved-package.json` - The package.json file with required dependencies
3. `test-improved-webhook.js` - A test script to verify webhook functionality

## Setup Steps

### 1. Deploy to Render.com

1. Log in to your Render.com account
2. Create a new Web Service
3. Select "Deploy from GitHub" or manually upload the files
4. Configure the following settings:
   - **Name**: vapi-webhook-handler (or any name you prefer)
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node improved-vapi-webhook.js`

### 2. Configure Environment Variables

In the Render dashboard, add the following environment variables:

1. `DATABASE_URL`: Your PostgreSQL connection string
   - This should be the same as the one in your Replit application
   - Format: `postgres://username:password@hostname:port/database_name`

### 3. Configure Vapi Webhooks

In your Vapi dashboard:

1. Navigate to your assistant/agent configuration
2. Update the webhook URL to: `https://your-render-app.onrender.com/vapi-webhook`
3. Make sure to enable all webhook events:
   - call.started
   - call.ended
   - call.transcription
   - call.summary

### 4. Test the Webhook Handler

1. After deployment is complete, visit:
   - `https://your-render-app.onrender.com/health` to check health
   - `https://your-render-app.onrender.com/test-db` to verify database connection
   
2. If everything is working, modify the test script with your webhook URL:
   ```js
   const WEBHOOK_URL = 'https://your-render-app.onrender.com';
   ```

3. Run the test script locally:
   ```
   node test-improved-webhook.js
   ```

4. Check your dashboard to see if the test call appears

## Important Notes

### Database Schema Compatibility

The webhook handler is designed to be compatible with the existing database schema from your Replit application. It will:

1. Insert new call records with the correct fields
2. Update existing records when new data arrives (transcription, summary, etc.)
3. Associate calls with user ID 1 (admin1) when the agent ID is `d91b7d95-2949-490d-b97f-a42da7ad3097`

### Debugging

If calls don't appear in your dashboard:

1. Check the logs in your Render dashboard
2. Look for any SQL errors or database connection issues
3. Verify that the `DATABASE_URL` environment variable is set correctly
4. Check the `logs/vapi-webhook.log` file for the raw webhook data

### Security

This webhook handler does not include authentication. For production use, consider adding:

1. API key authentication
2. IP whitelisting
3. HTTPS enforcement

## Webhooks Format

For reference, here's what a typical Vapi webhook looks like:

```json
// call.started event
{
  "call_id": "some-unique-id",
  "caller_id": "+15551234567",
  "agent_id": "d91b7d95-2949-490d-b97f-a42da7ad3097"
}

// call.ended event
{
  "call_id": "some-unique-id",
  "duration_seconds": 180,
  "agent_id": "d91b7d95-2949-490d-b97f-a42da7ad3097"
}

// call.transcription event
{
  "call_id": "some-unique-id",
  "transcription": "Full conversation transcript...",
  "agent_id": "d91b7d95-2949-490d-b97f-a42da7ad3097"
}

// call.summary event
{
  "call_id": "some-unique-id",
  "summary": "Brief summary of the call...",
  "agent_id": "d91b7d95-2949-490d-b97f-a42da7ad3097"
}
```

The webhook handler inspects the `X-Vapi-Webhook-Type` header to determine the event type and processes accordingly.