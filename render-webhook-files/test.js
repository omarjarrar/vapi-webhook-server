/**
 * Test script for the Vapi webhook handler
 * This can be run from your local machine after the webhook is deployed
 * 
 * Run with: node test.js
 */

// Replace with your actual deployed webhook URL
const WEBHOOK_URL = 'https://your-deployed-webhook.onrender.com';

// Generate test data
const TEST_CALL_ID = `test-call-${Math.floor(Math.random() * 10000)}`;
const TEST_PHONE = `+1555${Math.floor(Math.random() * 10000000)}`;

// Run full test sequence
async function runTests() {
  console.log(`\n🧪 TESTING WEBHOOK WITH CALL ID: ${TEST_CALL_ID}\n`);
  
  try {
    // Test health endpoint
    console.log('1️⃣ Testing health endpoint...');
    const healthResponse = await fetch(`${WEBHOOK_URL}/health`);
    console.log(`Status: ${healthResponse.status}`);
    console.log(await healthResponse.json());
    
    // Test database connection
    console.log('\n2️⃣ Testing database connection...');
    const dbResponse = await fetch(`${WEBHOOK_URL}/db-check`);
    console.log(`Status: ${dbResponse.status}`);
    console.log(await dbResponse.json());
    
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
        agent_id: 'd91b7d95-2949-490d-b97f-a42da7ad3097',
        timestamp: new Date().toISOString()
      })
    });
    console.log(`Status: ${startResponse.status}`);
    console.log(await startResponse.json());
    
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
        transcription: 'This is a test transcription to verify webhook functionality.',
        timestamp: new Date().toISOString()
      })
    });
    console.log(`Status: ${transcriptResponse.status}`);
    console.log(await transcriptResponse.json());
    
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
        summary: 'Test call summary to verify webhook functionality.',
        timestamp: new Date().toISOString()
      })
    });
    console.log(`Status: ${summaryResponse.status}`);
    console.log(await summaryResponse.json());
    
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
    console.log(`Status: ${endedResponse.status}`);
    console.log(await endedResponse.json());
    
    console.log('\n✅ ALL TESTS COMPLETED SUCCESSFULLY!');
    console.log(`📊 CHECK YOUR DASHBOARD FOR CALL ID: ${TEST_CALL_ID}\n`);
    
  } catch (error) {
    console.error('\n❌ ERROR DURING TESTING:', error);
  }
}

// Run the tests
runTests();