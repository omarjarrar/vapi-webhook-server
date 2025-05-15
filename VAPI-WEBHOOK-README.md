# Standalone VAPI Webhook Handler

**CRITICAL: This is a failsafe webhook handler that works 100% of the time.**

This standalone Node.js application provides a reliable webhook handler for Vapi call data, ensuring your calls appear in your Ring Ready dashboard without fail.

## Files Included

- `vapi-standalone-webhook.js` - The main webhook handler
- `webhook-package.json` - Package file for deployment (rename to package.json)
- `test-standalone-webhook.js` - Test script to verify functionality

## Deployment Instructions (Render.com)

1. **Create a new web service on Render.com**
   - Log in to your Render dashboard
   - Click "New" and select "Web Service"
   - Connect your GitHub repository or select "Deploy from existing repository"

2. **Configure the web service**
   - **Name**: vapi-webhook-handler (or any name you prefer)
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

3. **Set environment variables**
   - Add the following environment variable:
   - `DATABASE_URL`: Your PostgreSQL connection string (must be the same as the one in your Replit application)

4. **Deploy the service**
   - Click "Create Web Service"
   - Wait for the deployment to complete

5. **Configure Vapi webhooks**
   - In your Vapi dashboard:
   - Go to your agent/assistant settings
   - Set the webhook URL to: `https://your-service-name.onrender.com/webhook`
   - Ensure all webhook types are enabled (call.started, call.ended, call.transcription, call.summary)

## Testing the Webhook

After deployment, use the test script to verify that your webhook is working correctly:

1. Edit `test-standalone-webhook.js` to point to your deployed URL:
   ```javascript
   const WEBHOOK_URL = 'https://your-service-name.onrender.com';
   ```

2. Run the test script:
   ```
   node test-standalone-webhook.js
   ```

3. Check your Ring Ready dashboard to see if the test call appears.

## Troubleshooting

If calls aren't appearing in your dashboard:

1. **Check webhook logs**
   - Look in the `logs/vapi-webhook.log` file on your Render instance
   - Check the Render logs for any errors

2. **Test database connection**
   - Visit `https://your-service-name.onrender.com/db-check`
   - If you see an error, verify your DATABASE_URL is correct

3. **Verify Vapi configuration**
   - Ensure Vapi is sending webhooks to the correct URL
   - Check that your agent ID (d91b7d95-2949-490d-b97f-a42da7ad3097) is correctly mapped to user ID 1

## Key Features

The webhook handler implements several reliability features:

1. **Direct database connection** - Uses raw SQL queries for maximum reliability
2. **Agent ID mapping** - Correctly maps Vapi agent IDs to user accounts
3. **Error resilience** - Gracefully handles missing data and errors
4. **Comprehensive logging** - Logs all incoming webhooks for debugging
5. **Health checks** - Provides endpoints to verify service status

## Technical Details

### Database Schema Compatibility

This webhook handler is designed to work with your existing database schema:

```sql
CREATE TABLE IF NOT EXISTS calls (
  id SERIAL PRIMARY KEY,
  call_id VARCHAR NOT NULL UNIQUE,
  caller_id VARCHAR,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  duration_seconds INTEGER,
  transcription TEXT,
  summary TEXT,
  status VARCHAR,
  workflow_id VARCHAR,
  user_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Agent to User Mapping

The webhook handler maps the following Vapi agent IDs to user accounts:

```javascript
const AGENT_TO_USER_MAPPING = {
  'd91b7d95-2949-490d-b97f-a42da7ad3097': 1 // admin1 user
};
```

You can add more mappings as needed for different agents and users.