#!/usr/bin/env node

/**
 * Setup Script to Create Superuser
 * This script calls the API endpoint to create the Brandon Randall superuser
 * 
 * Usage: node scripts/setup-superuser.js
 * 
 * Requirements:
 * - The application must be running (npm run dev)
 * - SETUP_SECRET environment variable must be set
 */

const https = require('https');

// Get environment variables
const setupSecret = process.env.SETUP_SECRET || 'dev-setup-secret';
const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

console.log('\n========================================');
console.log('UCSP Tuna - Superuser Setup');
console.log('========================================\n');

console.log('Configuration:');
console.log(`  Base URL: ${baseUrl}`);
console.log(`  Setup Secret: ${setupSecret}\n`);

// Parse URL
const url = new URL(`${baseUrl}/api/setup/create-superuser`);
const isHttps = url.protocol === 'https:';

console.log('Creating superuser: Brandon Randall Valencia Calderon');
console.log('Email: brandon.valencia.calderon@gmail.com');
console.log('Sending request...\n');

// Make the request
const requestOptions = {
  hostname: url.hostname,
  port: url.port || (isHttps ? 443 : 80),
  path: url.pathname + url.search,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-setup-secret': setupSecret,
  },
};

const req = (isHttps ? https : require('http')).request(requestOptions, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);

      if (res.statusCode === 201 || res.statusCode === 200) {
        console.log('✓ SUCCESS: Superuser created successfully!\n');
        console.log('User Details:');
        console.log(`  ID: ${response.user.id}`);
        console.log(`  Email: ${response.user.email}`);
        console.log(`  Name: ${response.user.first_name} ${response.user.last_name}`);
        console.log(`  Mote: ${response.user.mote}`);
        console.log(`  Role: ${response.user.role}\n`);
        console.log('You can now login with:');
        console.log(`  Email: brandon.valencia.calderon@gmail.com`);
        console.log(`  Password: TUCSP2026.\n`);
      } else {
        console.error('✗ ERROR: Failed to create superuser');
        console.error(`  Status: ${res.statusCode}`);
        console.error(`  Message: ${response.error || response.message}\n`);
        process.exit(1);
      }
    } catch (error) {
      console.error('✗ ERROR: Failed to parse response');
      console.error(`  ${error.message}`);
      console.error(`  Response: ${data}\n`);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('✗ ERROR: Failed to connect to the application');
  console.error(`  ${error.message}`);
  console.error('\nMake sure the application is running:');
  console.error('  npm run dev\n');
  process.exit(1);
});

req.write(JSON.stringify({}));
req.end();
