/**
 * Test script for the direct Vapi webhook handler
 * Run with: node test-direct-webhook.js
 */
import fetch from 'node-fetch';

// Local server URL - change this to your deployed URL when testing in production
const SERVER_URL = 'http://localhost:5000';

// Generate a unique test call ID
const TEST_CALL_ID = `test-call-${Math.floor(Math.random() * 10000)}`;
const TEST_PHONE = `+1555${Math.floor(Math.random() * 10000000)}`;

console.log(`🧪 Testing direct webhook handler with call ID: ${TEST_CALL_ID}`);

async function testDirectWebhook() {
  try {
    // First check the health endpoint
    console.log(`\n1️⃣ Testing health endpoint...`);
    const healthResponse = await fetch(`${SERVER_URL}/vapi-webhook-health`);
    const healthData = await healthResponse.json();
    console.log(`Health endpoint response:`, healthData);

    // Then test the database connection
    console.log(`\n2️⃣ Testing database connection...`);
    const dbResponse = await fetch(`${SERVER_URL}/vapi-webhook-db-test`);
    const dbData = await dbResponse.json();
    console.log(`Database connection response:`, dbData);

    // Simulate call.started event
    console.log(`\n3️⃣ Simulating call.started event...`);
    const startResponse = await fetch(`${SERVER_URL}/direct-vapi-webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Vapi-Webhook-Type': 'call.started'
      },
      body: JSON.stringify({
        call_id: TEST_CALL_ID,
        caller_id: TEST_PHONE,
        agent_id: 'd91b7d95-2949-490d-b97f-a42da7ad3097', // Map to admin1
        timestamp: new Date().toISOString()
      })
    });
    
    console.log(`Call started response status:`, startResponse.status);
    console.log(`Call started response:`, await startResponse.json());

    // Wait 1 second
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate call.transcription event
    console.log(`\n4️⃣ Simulating call.transcription event...`);
    const transcriptResponse = await fetch(`${SERVER_URL}/direct-vapi-webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Vapi-Webhook-Type': 'call.transcription'
      },
      body: JSON.stringify({
        call_id: TEST_CALL_ID,
        agent_id: 'd91b7d95-2949-490d-b97f-a42da7ad3097',
        transcription: 'This is a test call made to verify webhook functionality. The system is working properly.',
        timestamp: new Date().toISOString()
      })
    });
    
    console.log(`Transcription response status:`, transcriptResponse.status);
    console.log(`Transcription response:`, await transcriptResponse.json());

    // Wait 1 second
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate call.summary event
    console.log(`\n5️⃣ Simulating call.summary event...`);
    const summaryResponse = await fetch(`${SERVER_URL}/direct-vapi-webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Vapi-Webhook-Type': 'call.summary'
      },
      body: JSON.stringify({
        call_id: TEST_CALL_ID,
        agent_id: 'd91b7d95-2949-490d-b97f-a42da7ad3097',
        summary: 'Test call to verify webhook functionality',
        timestamp: new Date().toISOString()
      })
    });
    
    console.log(`Summary response status:`, summaryResponse.status);
    console.log(`Summary response:`, await summaryResponse.json());

    // Wait 1 second
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate call.ended event
    console.log(`\n6️⃣ Simulating call.ended event...`);
    const endResponse = await fetch(`${SERVER_URL}/direct-vapi-webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Vapi-Webhook-Type': 'call.ended'
      },
      body: JSON.stringify({
        call_id: TEST_CALL_ID,
        agent_id: 'd91b7d95-2949-490d-b97f-a42da7ad3097',
        duration_seconds: 60,
        timestamp: new Date().toISOString()
      })
    });
    
    console.log(`Call ended response status:`, endResponse.status);
    console.log(`Call ended response:`, await endResponse.json());

    console.log(`\n✅ All webhook tests completed successfully!`);
    console.log(`\n📊 Check your dashboard for call ID: ${TEST_CALL_ID}`);
    console.log(`\n🔍 You may need to refresh the dashboard to see the new data`);

  } catch (error) {
    console.error('\n❌ Error during webhook testing:', error);
  }
}

// Run the tests
testDirectWebhook();