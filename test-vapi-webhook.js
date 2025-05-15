/**
 * Script to test the Vapi webhook endpoint by simulating webhook events
 * Run with: node test-vapi-webhook.js
 */

async function testVapiWebhook() {
  const WEBHOOK_URL = 'http://localhost:5000/api/vapi-webhook';
  const AGENT_ID = 'd91b7d95-2949-490d-b97f-a42da7ad3097'; // Your Vapi Agent ID
  const CALL_ID = `test-call-${Math.floor(Math.random() * 100000)}`;
  
  console.log(`Testing Vapi webhook integration with call ID: ${CALL_ID}`);
  
  // Simulate call.started event
  console.log('\n1. Simulating call.started event...');
  try {
    const startResponse = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Vapi-Webhook-Type': 'call.started'
      },
      body: JSON.stringify({
        call_id: CALL_ID,
        caller_id: '+1555' + Math.floor(Math.random() * 10000000),
        workflow_id: AGENT_ID,
        assistant_id: AGENT_ID
      })
    });
    
    console.log(`Response: ${startResponse.status} ${startResponse.statusText}`);
    console.log('Response data:', await startResponse.json());
  } catch (error) {
    console.error('Error simulating call.started event:', error);
  }
  
  // Wait 2 seconds
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simulate call.transcription event
  console.log('\n2. Simulating call.transcription event...');
  try {
    const transcriptResponse = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Vapi-Webhook-Type': 'call.transcription'
      },
      body: JSON.stringify({
        call_id: CALL_ID,
        workflow_id: AGENT_ID,
        assistant_id: AGENT_ID,
        transcription: `
User: Hello, I'm interested in your receptionist service.
Assistant: Hi there! Thank you for reaching out about our Ring Ready AI receptionist service. I'd be happy to tell you more about it. How can I help you today?
User: What are the pricing options?
Assistant: Our pricing starts at $99 per month for our basic plan, which includes 100 call minutes. We also have a Professional plan at $199 per month with 300 call minutes, and an Enterprise plan at $399 per month with 700 call minutes. All plans include 24/7 call answering, appointment scheduling, and customer support. Would you like more details about what's included in each plan?
User: Can I try it before buying?
Assistant: Absolutely! We offer a 14-day free trial for all new customers. During the trial, you'll have access to all the features of our Professional plan, so you can fully experience the capabilities of our service. No credit card is required to start the trial. Would you like me to help you set up a trial account today?
`
      })
    });
    
    console.log(`Response: ${transcriptResponse.status} ${transcriptResponse.statusText}`);
    console.log('Response data:', await transcriptResponse.json());
  } catch (error) {
    console.error('Error simulating call.transcription event:', error);
  }
  
  // Wait 2 seconds
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simulate call.ended event
  console.log('\n3. Simulating call.ended event...');
  try {
    const endResponse = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Vapi-Webhook-Type': 'call.ended'
      },
      body: JSON.stringify({
        call_id: CALL_ID,
        workflow_id: AGENT_ID,
        assistant_id: AGENT_ID,
        duration: 145 // 2 minutes and 25 seconds
      })
    });
    
    console.log(`Response: ${endResponse.status} ${endResponse.statusText}`);
    console.log('Response data:', await endResponse.json());
  } catch (error) {
    console.error('Error simulating call.ended event:', error);
  }
  
  // Wait 2 seconds
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simulate call.summary event
  console.log('\n4. Simulating call.summary event...');
  try {
    const summaryResponse = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Vapi-Webhook-Type': 'call.summary'
      },
      body: JSON.stringify({
        call_id: CALL_ID,
        workflow_id: AGENT_ID,
        assistant_id: AGENT_ID,
        summary: 'The caller inquired about Ring Ready pricing options and requested information about trying the service before purchasing. I provided details about our three pricing tiers (Basic: $99/mo with 100 minutes, Professional: $199/mo with 300 minutes, and Enterprise: $399/mo with 700 minutes). I explained that we offer a 14-day free trial with no credit card required, giving access to all Professional plan features. The caller seemed interested in starting a trial.'
      })
    });
    
    console.log(`Response: ${summaryResponse.status} ${summaryResponse.statusText}`);
    console.log('Response data:', await summaryResponse.json());
  } catch (error) {
    console.error('Error simulating call.summary event:', error);
  }
  
  console.log('\nWebhook testing complete! Check your dashboard to view the call data.');
}

// Run the test
testVapiWebhook();