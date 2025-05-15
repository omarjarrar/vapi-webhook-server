/**
 * Test script for the standalone Vapi webhook
 * Run with: node test-standalone-webhook.js
 */
import fetch from 'node-fetch';

// Configure the URL of your deployed webhook
// Change this to the actual URL where your webhook is deployed
const WEBHOOK_URL = 'http://localhost:3000';

// Generate a unique test call ID
const TEST_CALL_ID = `test-call-${Math.floor(Math.random() * 10000)}`;
const TEST_PHONE = `+1555${Math.floor(Math.random() * 10000000)}`;

async function testWebhook() {
  try {
    console.log(`\n🧪 TESTING WEBHOOK WITH CALL ID: ${TEST_CALL_ID}\n`);
    
    // Test health endpoint
    console.log('1️⃣ Testing health endpoint...');
    const healthResponse = await fetch(`${WEBHOOK_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('Health response:', healthData);
    
    // Test database connection
    console.log('\n2️⃣ Testing database connection...');
    const dbResponse = await fetch(`${WEBHOOK_URL}/db-check`);
    const dbData = await dbResponse.json();
    console.log('Database response:', dbData);
    
    if (dbData.status !== 'ok') {
      throw new Error('Database connection failed! Check your DATABASE_URL environment variable.');
    }
    
    // Test call.started webhook
    console.log('\n3️⃣ Testing call.started webhook...');
    const startResponse = await fetch(`${WEBHOOK_URL}/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Vapi-Webhook-Type': 'call.started'
      },
      body: JSON.stringify({
        call_id: TEST_CALL_ID,
        caller_id: TEST_PHONE,
        agent_id: 'd91b7d95-2949-490d-b97f-a42da7ad3097', // admin1 user
        timestamp: new Date().toISOString()
      })
    });
    
    const startData = await startResponse.json();
    console.log('Call started response:', startData);
    
    // Short pause
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test call.transcription webhook
    console.log('\n4️⃣ Testing call.transcription webhook...');
    const transcriptResponse = await fetch(`${WEBHOOK_URL}/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Vapi-Webhook-Type': 'call.transcription'
      },
      body: JSON.stringify({
        call_id: TEST_CALL_ID,
        agent_id: 'd91b7d95-2949-490d-b97f-a42da7ad3097',
        transcription: 'This is a test transcription to verify the webhook handler is working properly.',
        timestamp: new Date().toISOString()
      })
    });
    
    const transcriptData = await transcriptResponse.json();
    console.log('Transcription response:', transcriptData);
    
    // Short pause
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test call.summary webhook
    console.log('\n5️⃣ Testing call.summary webhook...');
    const summaryResponse = await fetch(`${WEBHOOK_URL}/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Vapi-Webhook-Type': 'call.summary'
      },
      body: JSON.stringify({
        call_id: TEST_CALL_ID,
        agent_id: 'd91b7d95-2949-490d-b97f-a42da7ad3097',
        summary: 'Test call to verify webhook integration.',
        timestamp: new Date().toISOString()
      })
    });
    
    const summaryData = await summaryResponse.json();
    console.log('Summary response:', summaryData);
    
    // Short pause
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test call.ended webhook
    console.log('\n6️⃣ Testing call.ended webhook...');
    const endedResponse = await fetch(`${WEBHOOK_URL}/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Vapi-Webhook-Type': 'call.ended'
      },
      body: JSON.stringify({
        call_id: TEST_CALL_ID,
        agent_id: 'd91b7d95-2949-490d-b97f-a42da7ad3097',
        duration_seconds: 120,
        timestamp: new Date().toISOString()
      })
    });
    
    const endedData = await endedResponse.json();
    console.log('Call ended response:', endedData);
    
    console.log('\n✅ ALL WEBHOOK TESTS COMPLETED SUCCESSFULLY!');
    console.log(`\n📊 CHECK YOUR DASHBOARD FOR CALL ID: ${TEST_CALL_ID}\n`);
    
  } catch (error) {
    console.error('\n❌ ERROR DURING TESTING:', error);
    process.exit(1);
  }
}

// Run the tests
testWebhook();