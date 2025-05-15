// Simple script to test voice assistant endpoint
import fetch from 'node-fetch';

async function testVoiceEndpoint() {
  try {
    console.log('Testing voice assistant endpoint...');
    
    // Test the /api/test-voice endpoint
    const response = await fetch('http://localhost:5000/api/test-voice');
    
    if (!response.ok) {
      console.error('Error:', response.status, response.statusText);
      return;
    }
    
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testVoiceEndpoint();