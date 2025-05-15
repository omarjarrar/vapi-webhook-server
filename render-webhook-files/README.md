# VAPI Webhook Handler

This is a production-ready webhook handler for Vapi call data. It correctly stores call data in your PostgreSQL database with proper user association.

## Features

- Handles all Vapi webhook events (call.started, call.ended, call.transcription, call.summary)
- Maps agent ID `d91b7d95-2949-490d-b97f-a42da7ad3097` to user ID 1 (admin1)
- Uses direct SQL queries for maximum reliability
- Includes comprehensive error handling and logging
- Provides health check and database connection test endpoints

## Endpoints

- **POST /webhook** - Main webhook endpoint for Vapi to send events to
- **GET /health** - Health check endpoint
- **GET /db-check** - Tests database connection

## Deployment on Render

1. **Environment Variables**:
   - Set `DATABASE_URL` to your PostgreSQL connection string.
   - Example: `postgres://username:password@hostname:port/database`

2. **Build Command**:
   ```
   npm install
   ```

3. **Start Command**:
   ```
   npm start
   ```

## Vapi Configuration

In your Vapi dashboard, set your webhook URL to:
```
https://your-render-service.onrender.com/webhook
```

Make sure all webhook events are enabled.

## Troubleshooting

If you encounter issues:

1. Check the logs in Render dashboard
2. Visit `/health` to confirm the service is running
3. Visit `/db-check` to test database connectivity 
4. Verify the DATABASE_URL environment variable is correctly set