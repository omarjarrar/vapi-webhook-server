/**
 * Test script for the improved Vapi webhook handler
 * Run with: node test-improved-webhook.js
 */

const fetch = require('node-fetch');

// Replace this with your webhook URL
const WEBHOOK_URL = 'http://localhost:3000'; // Update this to your deployed URL

// Test database connection
async function testDatabaseConnection() {
  try {
    console.log('Testing database connection...');
    const response = await fetch(`${WEBHOOK_URL}/test-db`);
    const result = await response.json();
    console.log('Database connection test result:', result);
    return result.success;
  } catch (error) {
    console.error('Database connection test failed:', error.message);
    return false;
  }
}

// Simulate call.started event
async function simulateCallStarted() {
  const callId = `test-call-${Math.floor(Math.random() * 10000)}`;
  
  console.log(`\nSimulating call.started event for call_id: ${callId}`);
  
  const response = await fetch(`${WEBHOOK_URL}/vapi-webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Vapi-Webhook-Type': 'call.started'
    },
    body: JSON.stringify({
      call_id: callId,
      caller_id: '+15551234567',
      agent_id: 'd91b7d95-2949-490d-b97f-a42da7ad3097'
    })
  });
  
  const result = await response.json();
  console.log('Response:', result);
  
  return callId;
}

// Simulate call.transcription event
async function simulateCallTranscription(callId) {
  console.log(`\nSimulating call.transcription event for call_id: ${callId}`);
  
  const response = await fetch(`${WEBHOOK_URL}/vapi-webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Vapi-Webhook-Type': 'call.transcription'
    },
    body: JSON.stringify({
      call_id: callId,
      agent_id: 'd91b7d95-2949-490d-b97f-a42da7ad3097',
      transcription: `
User: Hello, I'm interested in your AI receptionist service.
Assistant: Hi there! I'd be happy to tell you about our Ring Ready AI receptionist service. What would you like to know?
User: What are your pricing options?
Assistant: We have three tiers: Basic at $99/month for 100 minutes, Professional at $199/month for 300 minutes, and Enterprise at $399/month for 700 minutes. All plans include 24/7 answering, appointment booking, and message delivery. Would you like me to explain what else is included in each plan?
User: Do you offer a free trial?
Assistant: Yes, we absolutely do! We offer a 14-day free trial with full access to all features so you can experience the benefits firsthand before committing. Would you like me to help you set up a trial?
`
    })
  });
  
  const result = await response.json();
  console.log('Response:', result);
}

// Simulate call.ended event
async function simulateCallEnded(callId) {
  console.log(`\nSimulating call.ended event for call_id: ${callId}`);
  
  const response = await fetch(`${WEBHOOK_URL}/vapi-webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Vapi-Webhook-Type': 'call.ended'
    },
    body: JSON.stringify({
      call_id: callId,
      agent_id: 'd91b7d95-2949-490d-b97f-a42da7ad3097',
      duration_seconds: 180 // 3 minutes
    })
  });
  
  const result = await response.json();
  console.log('Response:', result);
}

// Simulate call.summary event
async function simulateCallSummary(callId) {
  console.log(`\nSimulating call.summary event for call_id: ${callId}`);
  
  const response = await fetch(`${WEBHOOK_URL}/vapi-webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Vapi-Webhook-Type': 'call.summary'
    },
    body: JSON.stringify({
      call_id: callId,
      agent_id: 'd91b7d95-2949-490d-b97f-a42da7ad3097',
      summary: "The caller inquired about Ring Ready's AI receptionist service, specifically about pricing options and free trial availability. I explained our three-tier pricing structure (Basic: $99/mo, Professional: $199/mo, Enterprise: $399/mo) and confirmed that we offer a 14-day free trial with full access to all features."
    })
  });
  
  const result = await response.json();
  console.log('Response:', result);
}

// Run all tests sequentially
async function runAllTests() {
  try {
    console.log('🧪 RUNNING WEBHOOK TESTS\n');
    
    // Test database connection first
    const dbConnected = await testDatabaseConnection();
    if (!dbConnected) {
      console.error('Database connection failed. Aborting tests.');
      return;
    }
    
    // Run through a complete call sequence
    const callId = await simulateCallStarted();
    
    // Wait between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await simulateCallTranscription(callId);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await simulateCallEnded(callId);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await simulateCallSummary(callId);
    
    console.log('\n✅ All tests completed successfully!');
    console.log('Check your dashboard to see if the call appears.');
  } catch (error) {
    console.error('Error running tests:', error);
  }
}

// Start the tests
runAllTests();