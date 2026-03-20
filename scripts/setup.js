#!/usr/bin/env node

/**
 * UCSP Tuna - Superuser Setup Script
 * Creates the Brandon Randall superuser account
 * 
 * Requirements:
 * 1. SETUP_SECRET environment variable set to 'dev-setup-secret'
 * 2. SUPABASE_SERVICE_ROLE_KEY environment variable set
 * 3. Application running (npm run dev)
 */

const http = require('http');

const SETUP_SECRET = process.env.SETUP_SECRET || 'dev-setup-secret';
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

console.log('\n' + '='.repeat(50));
console.log('  UCSP Tuna - Superuser Setup');
console.log('='.repeat(50) + '\n');

console.log('Creating superuser account...');
console.log('Email: brandon.valencia.calderon@gmail.com');
console.log('Password: TUCSP2026.');
console.log('Name: Brandon Randall Valencia Calderon\n');

// Parse URL
const url = new URL(`${BASE_URL}/api/setup/superuser`);

// Prepare request options
const options = {
  hostname: url.hostname,
  port: url.port || 3000,
  path: url.pathname,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-setup-secret': SETUP_SECRET,
  },
};

// Make the request
const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);

      if (res.statusCode === 201 || res.statusCode === 200) {
        console.log('✓ SUCCESS!\n');
        console.log('Superuser created successfully:');
        console.log(`  ID: ${response.user.id}`);
        console.log(`  Email: ${response.user.email}`);
        console.log(`  Name: ${response.user.first_name} ${response.user.last_name}`);
        console.log(`  Mote: ${response.user.mote}`);
        console.log(`  Role: ${response.user.role}\n`);
        console.log('You can now login at /auth/login with:');
        console.log(`  Email: brandon.valencia.calderon@gmail.com`);
        console.log(`  Password: TUCSP2026.\n`);
        process.exit(0);
      } else {
        console.error('✗ ERROR\n');
        console.error(`Status: ${res.statusCode}`);
        console.error(`Message: ${response.error || response.message}\n`);
        process.exit(1);
      }
    } catch (error) {
      console.error('✗ ERROR: Failed to parse response\n');
      console.error(`Error: ${error.message}`);
      console.error(`Response: ${data}\n`);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('✗ ERROR: Connection failed\n');
  console.error(`Message: ${error.message}\n`);
  console.error('Make sure:');
  console.error('  1. The application is running (npm run dev)');
  console.error('  2. The app is accessible at http://localhost:3000\n');
  process.exit(1);
});

// Send request
req.write(JSON.stringify({}));
req.end();
