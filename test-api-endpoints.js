#!/usr/bin/env node

// API Endpoint Testing Script for MySunshineTales
// Usage: node test-api-endpoints.js

const API_BASE = process.env.API_URL || 'https://luciantales-production.up.railway.app';
const ACCESS_TOKEN = process.env.ACCESS_TOKEN || '';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

async function testEndpoint(method, path, body = null, description = '') {
  const url = `${API_BASE}${path}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(ACCESS_TOKEN && { 'Authorization': `Bearer ${ACCESS_TOKEN}` })
    }
  };
  
  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }
  
  try {
    console.log(`\n${colors.blue}Testing: ${method} ${path}${colors.reset}`);
    if (description) console.log(`Description: ${description}`);
    
    const response = await fetch(url, options);
    const statusColor = response.ok ? colors.green : colors.red;
    console.log(`Status: ${statusColor}${response.status} ${response.statusText}${colors.reset}`);
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log('Response:', JSON.stringify(data, null, 2).substring(0, 200) + '...');
    }
    
    return { success: response.ok, status: response.status };
  } catch (error) {
    console.log(`${colors.red}Error: ${error.message}${colors.reset}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log(`${colors.yellow}=== MySunshineTales API Endpoint Testing ===${colors.reset}`);
  console.log(`API Base: ${API_BASE}`);
  console.log(`Token: ${ACCESS_TOKEN ? 'Set' : 'Not set (public endpoints only)'}\n`);
  
  const results = [];
  
  // Health Check
  results.push(await testEndpoint('GET', '/api/v1/health', null, 'Health check'));
  
  // Auth Endpoints (Public)
  results.push(await testEndpoint('POST', '/api/v1/auth/oauth/login', {
    provider: 'google',
    token: 'demo_token'
  }, 'Demo OAuth login'));
  
  if (ACCESS_TOKEN) {
    // Protected endpoints
    console.log(`\n${colors.yellow}--- Protected Endpoints (Requires Auth) ---${colors.reset}`);
    
    // User Profile
    results.push(await testEndpoint('GET', '/api/v1/auth/me', null, 'Get current user'));
    
    // Sunshine Profiles
    results.push(await testEndpoint('GET', '/api/v1/sunshines', null, 'List sunshine profiles'));
    
    // Create test profile
    const testProfile = {
      name: 'Test Sunshine',
      age: 5,
      gender: 'other',
      interests: ['dinosaurs', 'space'],
      personality_traits: ['curious', 'brave'],
      fears_or_challenges: 'dark',
      favorite_things: 'teddy bear'
    };
    results.push(await testEndpoint('POST', '/api/v1/sunshines', testProfile, 'Create sunshine profile'));
    
    // Stories
    results.push(await testEndpoint('GET', '/api/v2/stories/history', null, 'Get story history'));
    
    // Subscription
    results.push(await testEndpoint('GET', '/api/v1/subscription/plans', null, 'Get subscription plans'));
    results.push(await testEndpoint('GET', '/api/v1/subscription/current', null, 'Get current subscription'));
    results.push(await testEndpoint('GET', '/api/v1/subscription/usage', null, 'Get usage stats'));
  }
  
  // Summary
  console.log(`\n${colors.yellow}=== Test Summary ===${colors.reset}`);
  const passed = results.filter(r => r.success).length;
  const failed = results.length - passed;
  
  console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
  console.log(`Total: ${results.length}`);
  
  if (failed > 0) {
    console.log(`\n${colors.red}Some tests failed. Please check the API configuration.${colors.reset}`);
  } else {
    console.log(`\n${colors.green}All tests passed!${colors.reset}`);
  }
}

// Run tests
runTests().catch(console.error);