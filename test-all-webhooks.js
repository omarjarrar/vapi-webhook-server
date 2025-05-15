/**
 * Exhaustive test script that tries all possible webhook endpoints
 * Run with: node test-all-webhooks.js
 */

async function testAllEndpoints() {
  const BASE_URL = 'https://ring-ready-ai-receptionist.replit.app';
  const LOCAL_URL = 'http://localhost:5000';
  
  const ENDPOINTS = [
    '/hook',
    '/raw-webhook',
    '/vapi-webhook',
    '/webhook',
    '/api/simple-webhook',
    '/api/webhook'
  ];
  
  console.log('🔍 TESTING ALL WEBHOOK ENDPOINTS\n');
  
  // Test remote endpoints (deployed app)
  console.log('📡 REMOTE ENDPOINTS:');
  
  for (const endpoint of ENDPOINTS) {
    try {
      console.log(`\nTesting ${endpoint}...`);
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Vapi-Webhook-Type': 'call.started'
        },
        body: JSON.stringify({
          call_id: 'test-' + Math.random().toString(36).substring(7),
          caller_id: '+18005551234',
          type: 'call.started',
          timestamp: new Date().toISOString()
        })
      });
      
      console.log(`Status: ${response.status}`);
      
      const responseText = await response.text();
      console.log(`Response: ${responseText.substring(0, 100)}`);
    } catch (error) {
      console.error(`Error with ${endpoint}:`, error.message);
    }
  }
  
  // Test a few variations
  try {
    console.log("\nTesting GET on /raw-webhook...");
    const getResponse = await fetch(`${BASE_URL}/raw-webhook`, {
      method: 'GET'
    });
    console.log(`Status: ${getResponse.status}`);
    console.log(`Response: ${await getResponse.text()}`);
  } catch (error) {
    console.error("Error with GET /raw-webhook:", error.message);
  }
  
  // Test local endpoints for comparison if available
  console.log('\n\n📍 LOCAL ENDPOINTS:');
  
  try {
    const response = await fetch(`${LOCAL_URL}/hook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        call_id: 'local-test',
        timestamp: new Date().toISOString()
      })
    });
    
    console.log('\nTesting /hook (local)...');
    console.log(`Status: ${response.status}`);
    console.log(`Response: ${await response.text()}`);
  } catch (error) {
    console.log('Local server not available:', error.message);
  }
}

testAllEndpoints().catch(console.error);