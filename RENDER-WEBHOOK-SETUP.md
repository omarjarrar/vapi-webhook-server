# Vapi Webhook Setup on Render

This guide will help you set up a standalone webhook handler for Vapi on Render.com. The webhook handler will receive events from Vapi, process them, and store them in your PostgreSQL database.

## Prerequisites

- A Render.com account
- Your PostgreSQL database connection string (the same one used in your Replit app)
- Your Vapi agent ID: `d91b7d95-2949-490d-b97f-a42da7ad3097`

## Step 1: Create a New Web Service on Render

1. Log into your Render.com account
2. Click "New" and select "Web Service"
3. Choose "Deploy from GitHub" or "Create manually and deploy via Git" (whichever you prefer)
4. If using GitHub, connect to your repository

## Step 2: Configure the Web Service

- **Name**: `vapi-webhook-handler` (or any name you prefer)
- **Runtime**: Node
- **Build Command**: `npm install`
- **Start Command**: `node render-webhook.js`

## Step 3: Add Environment Variables

Add the following environment variable:

- `DATABASE_URL`: Your PostgreSQL connection string (the same one used in your Replit app)

## Step 4: Deploy the Service

1. Copy the files we've created to your repository:
   - `render-webhook.js` → `webhook.js`
   - `render-package.json` → `package.json`

2. Deploy the service using Render's dashboard

## Step 5: Configure Vapi Webhooks

After your service is deployed, you'll get a URL like `https://vapi-webhook-handler.onrender.com`

In your Vapi dashboard:

1. Go to the webhook configuration for your assistant/agent
2. Update the webhook URL to: `https://vapi-webhook-handler.onrender.com/webhook`
3. Make sure to enable the following webhook events:
   - call.started
   - call.ended
   - call.transcription
   - call.summary

## Step 6: Testing

1. Edit the `render-test.js` file to use your Render webhook URL
2. Run the test script with: `node render-test.js`
3. Check your Replit dashboard to see if the calls appear

## Troubleshooting

If calls don't appear in your dashboard:

1. Check the Render logs to see if the webhooks are being received
2. Verify that the database connection is working
3. Make sure the agent ID is correct in the webhook handler
4. Try making a real call to your Vapi assistant

## Notes on the Implementation

The webhook handler in `render-webhook.js`:

1. Receives events from Vapi via the `/webhook` endpoint
2. Maps the agent ID to user ID 1 (admin1)
3. Creates or updates call records in the database
4. Handles all four event types: started, ended, transcription, and summary

The database schema is compatible with the one in your Replit app, so all calls will appear in the dashboard once properly stored.