/**
 * A simple test script for the webhook endpoints
 * Run with: node test-webhook.js
 */

async function testEndpoints() {
  console.log('Testing the simple webhook endpoints...');
  
  try {
    // Test the ping endpoint
    console.log('\n1. Testing /api/ping endpoint:');
    const pingResponse = await fetch('https://ring-ready-ai-receptionist.replit.app/api/ping');
    console.log('Status:', pingResponse.status);
    if (pingResponse.status === 200) {
      console.log('Response:', await pingResponse.json());
    } else {
      console.log('Response text:', await pingResponse.text());
    }
  } catch (error) {
    console.error('Error testing ping endpoint:', error.message);
  }
  
  try {
    // Test the simple webhook endpoint with call.started event
    console.log('\n2. Testing /api/simple-webhook endpoint with call.started:');
    const webhookResponse = await fetch('https://ring-ready-ai-receptionist.replit.app/api/simple-webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Vapi-Webhook-Type': 'call.started'
      },
      body: JSON.stringify({
        call_id: 'test-123',
        caller_id: '+18005551234',
        type: 'call.started',
        timestamp: new Date().toISOString()
      })
    });
    
    console.log('Status:', webhookResponse.status);
    if (webhookResponse.status === 200) {
      console.log('Response:', await webhookResponse.json());
    } else {
      console.log('Response text:', await webhookResponse.text());
    }
  } catch (error) {
    console.error('Error testing webhook endpoint:', error.message);
  }
  
  try {
    // Test the root webhook endpoint
    console.log('\n3. Testing /webhook endpoint:');
    const rootWebhookResponse = await fetch('https://ring-ready-ai-receptionist.replit.app/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        call_id: 'simple-test',
        caller_id: '+18005551234',
        type: 'test',
        timestamp: new Date().toISOString()
      })
    });
    
    console.log('Status:', rootWebhookResponse.status);
    console.log('Response text:', await rootWebhookResponse.text());
  } catch (error) {
    console.error('Error testing root webhook endpoint:', error.message);
  }
  
  try {
    // Test a local endpoint for comparison
    console.log('\n4. Testing local endpoint:');
    const localResponse = await fetch('http://localhost:5000/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        call_id: 'local-test',
        timestamp: new Date().toISOString()
      })
    });
    
    console.log('Status:', localResponse.status);
    console.log('Response text:', await localResponse.text());
  } catch (error) {
    console.error('Error testing local endpoint:', error.message);
  }
}

testEndpoints().catch(console.error);