/**
 * Test utility for simulating Vapi webhook events
 * Run with: npx tsx server/test-webhook.ts
 */

import fetch from 'node-fetch';

// Base URL for the webhook endpoint (change if needed)
const WEBHOOK_URL = 'http://localhost:5000/api/vapi-webhook';

// Generate a random call ID
const generateCallId = () => `test-call-${Math.floor(Math.random() * 100000)}`;
const CALL_ID = generateCallId();
const CALLER_ID = '+1555123' + Math.floor(Math.random() * 10000);
const WORKFLOW_ID = 'workflow-123456';

// Simulate call.started event
async function simulateCallStarted() {
  console.log('Simulating call.started event...');
  
  const response = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Vapi-Webhook-Type': 'call.started'
    },
    body: JSON.stringify({
      call_id: CALL_ID,
      caller_id: CALLER_ID,
      workflow_id: WORKFLOW_ID
    })
  });
  
  console.log(`Response: ${response.status} ${response.statusText}`);
  if (!response.ok) {
    console.error(await response.text());
  } else {
    console.log(await response.text());
  }
  
  return response.ok;
}

// Simulate call.ended event
async function simulateCallEnded() {
  console.log('Simulating call.ended event...');
  
  const response = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Vapi-Webhook-Type': 'call.ended'
    },
    body: JSON.stringify({
      call_id: CALL_ID
    })
  });
  
  console.log(`Response: ${response.status} ${response.statusText}`);
  if (!response.ok) {
    console.error(await response.text());
  } else {
    console.log(await response.text());
  }
  
  return response.ok;
}

// Simulate call.transcription event
async function simulateCallTranscription() {
  console.log('Simulating call.transcription event...');
  
  const response = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Vapi-Webhook-Type': 'call.transcription'
    },
    body: JSON.stringify({
      call_id: CALL_ID,
      transcription: `
User: Hello, I'd like to schedule a consultation.
Assistant: Hi there! I'd be happy to help you schedule a consultation. May I have your name, please?
User: My name is John Smith.
Assistant: Great, thank you John. What type of service are you interested in?
User: I need help with my project planning.
Assistant: Perfect. We offer project planning consultations on weekdays between 9am and 5pm. Do you have a preferred day and time?
User: Maybe next Tuesday at 2pm?
Assistant: Tuesday at 2pm works great. I've scheduled your project planning consultation for next Tuesday at 2pm. You'll receive a confirmation email shortly with all the details. Is there anything else you need help with today?
User: No, that's all. Thank you.
Assistant: You're welcome, John! We look forward to speaking with you on Tuesday. Have a great day!
      `
    })
  });
  
  console.log(`Response: ${response.status} ${response.statusText}`);
  if (!response.ok) {
    console.error(await response.text());
  } else {
    console.log(await response.text());
  }
  
  return response.ok;
}

// Simulate call.summary event
async function simulateCallSummary() {
  console.log('Simulating call.summary event...');
  
  const response = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json', 
      'X-Vapi-Webhook-Type': 'call.summary'
    },
    body: JSON.stringify({
      call_id: CALL_ID,
      summary: 'John Smith called to schedule a project planning consultation. Appointment scheduled for next Tuesday at 2:00 PM. Caller confirmed the appointment time and thanked the assistant.'
    })
  });
  
  console.log(`Response: ${response.status} ${response.statusText}`);
  if (!response.ok) {
    console.error(await response.text());
  } else {
    console.log(await response.text());
  }
  
  return response.ok;
}

// Run the simulation sequence
async function runSimulation() {
  try {
    // First simulate the call started event
    const startedOk = await simulateCallStarted();
    if (!startedOk) {
      console.error('Failed to simulate call.started event');
      return;
    }
    
    // Wait 2 seconds
    console.log('Waiting 2 seconds...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate transcription coming in
    const transcriptionOk = await simulateCallTranscription();
    if (!transcriptionOk) {
      console.error('Failed to simulate call.transcription event');
      return;
    }
    
    // Wait 2 seconds
    console.log('Waiting 2 seconds...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate call ended
    const endedOk = await simulateCallEnded();
    if (!endedOk) {
      console.error('Failed to simulate call.ended event');
      return;
    }
    
    // Wait 2 seconds
    console.log('Waiting 2 seconds...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate summary
    const summaryOk = await simulateCallSummary();
    if (!summaryOk) {
      console.error('Failed to simulate call.summary event');
      return;
    }
    
    console.log('\nSimulation completed successfully!');
    console.log(`Call ID: ${CALL_ID}`);
    console.log(`Caller ID: ${CALLER_ID}`);
    console.log('Check your dashboard to view the call details');
  } catch (error) {
    console.error('Error during simulation:', error);
  }
}

// Run the simulation
runSimulation();