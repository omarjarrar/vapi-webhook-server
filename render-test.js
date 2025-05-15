/**
 * Test script for the Vapi webhook handler
 * This simulates Vapi sending webhook events
 */

import fetch from 'node-fetch';

const WEBHOOK_URL = 'YOUR_RENDER_WEBHOOK_URL'; // Replace with your Render URL

async function simulateCallStarted() {
  const payload = {
    call_id: `test-call-${Math.floor(Math.random() * 10000)}`,
    caller_id: '+15551234567',
    agent_id: 'd91b7d95-2949-490d-b97f-a42da7ad3097'
  };
  
  console.log('Simulating call.started event...');
  const response = await fetch(`${WEBHOOK_URL}/webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Vapi-Webhook-Type': 'call.started'
    },
    body: JSON.stringify(payload)
  });
  
  const result = await response.text();
  console.log(`Status: ${response.status}`);
  console.log(`Response: ${result}`);
  
  return payload.call_id;
}

async function simulateCallEnded(callId) {
  const payload = {
    call_id: callId,
    duration_seconds: Math.floor(Math.random() * 300) + 60, // 1-5 minutes
    agent_id: 'd91b7d95-2949-490d-b97f-a42da7ad3097'
  };
  
  console.log('Simulating call.ended event...');
  const response = await fetch(`${WEBHOOK_URL}/webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Vapi-Webhook-Type': 'call.ended'
    },
    body: JSON.stringify(payload)
  });
  
  const result = await response.text();
  console.log(`Status: ${response.status}`);
  console.log(`Response: ${result}`);
}

async function simulateCallTranscription(callId) {
  const payload = {
    call_id: callId,
    transcription: `
User: Hello, I'm interested in your AI receptionist service.
Assistant: Hi there! I'd be happy to tell you about our Ring Ready AI receptionist service. What would you like to know?
User: What are your pricing options?
Assistant: We have three tiers: Basic at $99/month for 100 minutes, Professional at $199/month for 300 minutes, and Enterprise at $399/month for 700 minutes. All plans include 24/7 answering, appointment booking, and message delivery. Would you like me to explain what else is included in each plan?
User: Do you offer a free trial?
Assistant: Yes, we absolutely do! We offer a 14-day free trial with full access to all features so you can experience the benefits firsthand before committing. Would you like me to help you set up a trial?
`,
    agent_id: 'd91b7d95-2949-490d-b97f-a42da7ad3097'
  };
  
  console.log('Simulating call.transcription event...');
  const response = await fetch(`${WEBHOOK_URL}/webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Vapi-Webhook-Type': 'call.transcription'
    },
    body: JSON.stringify(payload)
  });
  
  const result = await response.text();
  console.log(`Status: ${response.status}`);
  console.log(`Response: ${result}`);
}

async function simulateCallSummary(callId) {
  const payload = {
    call_id: callId,
    summary: "The caller inquired about Ring Ready's AI receptionist service, specifically about pricing options and free trial availability. I explained our three-tier pricing structure (Basic: $99/mo, Professional: $199/mo, Enterprise: $399/mo) and confirmed that we offer a 14-day free trial with full access to all features.",
    agent_id: 'd91b7d95-2949-490d-b97f-a42da7ad3097'
  };
  
  console.log('Simulating call.summary event...');
  const response = await fetch(`${WEBHOOK_URL}/webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Vapi-Webhook-Type': 'call.summary'
    },
    body: JSON.stringify(payload)
  });
  
  const result = await response.text();
  console.log(`Status: ${response.status}`);
  console.log(`Response: ${result}`);
}

async function runSimulation() {
  try {
    // Check if server is running
    const healthCheck = await fetch(`${WEBHOOK_URL}/health`);
    console.log(`Server health: ${healthCheck.status}`);
    
    // Run the full simulation
    const callId = await simulateCallStarted();
    
    // Wait a bit between events to simulate a real call flow
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await simulateCallTranscription(callId);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await simulateCallEnded(callId);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await simulateCallSummary(callId);
    
    console.log('Simulation completed successfully!');
  } catch (error) {
    console.error('Error running simulation:', error);
  }
}

// Run the simulation
runSimulation().catch(console.error);