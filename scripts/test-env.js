// scripts/test-env.js - Run this to test your environment variables
// Save this as test-env.js and run with: node test-env.js

const fs = require('fs');
const path = require('path');

console.log('🔧 VitaShifa Environment Test\n');

// Check if .env file exists
const envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found!');
  console.log('Please create a .env file in your project root directory.');
  process.exit(1);
}

// Read .env file
const envContent = fs.readFileSync(envPath, 'utf8');
console.log('✅ .env file found');

// Parse environment variables
const envLines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
const envVars = {};

envLines.forEach((line, index) => {
  const [key, ...valueParts] = line.split('=');
  const value = valueParts.join('=');
  
  if (!key || !value) {
    console.warn(`⚠️  Line ${index + 1}: Invalid format - "${line}"`);
    return;
  }
  
  envVars[key.trim()] = value.trim();
});

console.log(`\n📋 Found ${Object.keys(envVars).length} environment variables:\n`);

// Required variables
const requiredVars = [
  'VITE_GEMINI_API_KEY',
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

let allGood = true;

requiredVars.forEach(varName => {
  const value = envVars[varName];
  if (value) {
    if (varName === 'VITE_GEMINI_API_KEY') {
      if (value === 'your_gemini_api_key_here') {
        console.log(`❌ ${varName}: Placeholder value (replace with real key)`);
        allGood = false;
      } else if (value.length < 30) {
        console.log(`⚠️  ${varName}: Seems too short (${value.length} chars)`);
      } else {
        console.log(`✅ ${varName}: ${value.substring(0, 10)}... (${value.length} chars)`);
      }
    } else {
      console.log(`✅ ${varName}: ${value.substring(0, 15)}... (${value.length} chars)`);
    }
  } else {
    console.log(`❌ ${varName}: Missing`);
    allGood = false;
  }
});

// Check for extra variables that might be typos
Object.keys(envVars).forEach(key => {
  if (!requiredVars.includes(key) && key.startsWith('VITE_')) {
    console.log(`❓ ${key}: Extra variable (typo?)`);
  }
});

console.log('\n' + '='.repeat(50));

if (allGood) {
  console.log('✅ All environment variables look good!');
  console.log('\nNext steps:');
  console.log('1. Save this .env file');
  console.log('2. Restart your development server');
  console.log('3. Check the app for any remaining errors');
} else {
  console.log('❌ Some environment variables need attention.');
  console.log('\nTo fix:');
  console.log('1. Update the missing/incorrect variables in .env');
  console.log('2. Ensure each variable is on a separate line');
  console.log('3. No spaces around the = sign');
  console.log('4. Restart your development server');
}

console.log('\nSample correct .env format:');
console.log('VITE_GEMINI_API_KEY=AIzaSyAbc123...');
console.log('VITE_FIREBASE_API_KEY=AIzaSyDef456...');
console.log('VITE_FIREBASE_PROJECT_ID=your-project-id');
console.log('...(and so on)');

process.exit(allGood ? 0 : 1);