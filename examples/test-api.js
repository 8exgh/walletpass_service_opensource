/**
 * Simple test script for the Apple Wallet Pass API
 * 
 * Usage: node examples/test-api.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const API_HOST = 'localhost';
const API_PORT = 3000;
const API_KEY = 'test_api_key_1'; // Update this with your API key

// Load sample requests
const samples = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'sample-requests.json'), 'utf-8')
);

/**
 * Make HTTP request to the API
 */
function makeRequest(endpoint, method, data, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: API_HOST,
      port: API_PORT,
      path: endpoint,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (data) {
      const jsonData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(jsonData);
    }

    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

/**
 * Test health endpoint
 */
async function testHealth() {
  console.log('\n📍 Testing Health Endpoint...');
  
  try {
    const response = await makeRequest('/api/v1/health', 'GET');
    
    if (response.status === 200) {
      console.log('✅ Health check passed');
      console.log('   Status:', response.data.status);
      console.log('   Certificate valid:', response.data.certificate?.valid || false);
    } else {
      console.log('❌ Health check failed');
      console.log('   Status:', response.status);
    }
  } catch (error) {
    console.log('❌ Health check error:', error.message);
  }
}

/**
 * Test pass generation
 */
async function testGeneratePass(passType, passData) {
  console.log(`\n📍 Testing ${passType} Generation...`);
  
  try {
    const response = await makeRequest(
      '/api/v1/passes/generate',
      'POST',
      passData,
      { 'x-bundle-id': API_KEY }
    );
    
    if (response.status === 200 && response.data.success) {
      console.log(`✅ ${passType} generated successfully`);
      console.log('   Pass ID:', response.data.data.passId);
      console.log('   Serial Number:', response.data.data.serialNumber);
      console.log('   Download URL:', response.data.data.passUrl);
      
      return response.data.data.passId;
    } else {
      console.log(`❌ ${passType} generation failed`);
      console.log('   Error:', response.data.error?.message || 'Unknown error');
    }
  } catch (error) {
    console.log(`❌ ${passType} generation error:`, error.message);
  }
  
  return null;
}

/**
 * Test pass download
 */
async function testDownloadPass(passId) {
  console.log(`\n📍 Testing Pass Download...`);
  
  if (!passId) {
    console.log('❌ No pass ID provided');
    return;
  }
  
  try {
    const response = await makeRequest(
      `/api/v1/passes/download/${passId}`,
      'GET'
    );
    
    if (response.status === 200) {
      console.log('✅ Pass download successful');
      console.log('   Content received (truncated):', 
        typeof response.data === 'string' 
          ? response.data.substring(0, 50) + '...' 
          : 'Binary data'
      );
    } else {
      console.log('❌ Pass download failed');
      console.log('   Status:', response.status);
    }
  } catch (error) {
    console.log('❌ Pass download error:', error.message);
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('🚀 Starting Apple Wallet Pass API Tests');
  console.log('=====================================');
  console.log(`Server: http://${API_HOST}:${API_PORT}`);
  console.log(`API Key: ${API_KEY}`);
  
  // Test health endpoint
  await testHealth();
  
  // Test minimal pass generation
  console.log('\n--- Testing Pass Generation ---');
  const minimalPassId = await testGeneratePass('Minimal Pass', samples.minimalPass);
  
  // Test event ticket generation
  const eventPassId = await testGeneratePass('Event Ticket', samples.eventTicket);
  
  // Test membership card generation
  const membershipPassId = await testGeneratePass('Membership Card', samples.membershipCard);
  
  // Test pass download
  if (minimalPassId) {
    await testDownloadPass(minimalPassId);
  }
  
  console.log('\n=====================================');
  console.log('✨ Tests completed!');
  
  if (eventPassId || membershipPassId) {
    console.log('\n💡 Tip: You can download the generated passes using:');
    if (eventPassId) {
      console.log(`   curl -O http://${API_HOST}:${API_PORT}/api/v1/passes/download/${eventPassId}`);
    }
  }
}

// Run tests
runTests().catch(console.error);