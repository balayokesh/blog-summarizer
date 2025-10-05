/**
 * Setup script for Blog Summarizer Backend
 * Run with: node setup.js
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Blog Summarizer Backend...\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, 'env.example');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    console.log('📝 Creating .env file from template...');
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env file created!');
    console.log('⚠️  Please edit .env file and add your Cerebras API key\n');
  } else {
    console.log('❌ env.example file not found');
    process.exit(1);
  }
} else {
  console.log('✅ .env file already exists');
}

// Check if node_modules exists
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('📦 Installing dependencies...');
  console.log('   Run: npm install');
  console.log('');
} else {
  console.log('✅ Dependencies already installed');
}

// Create logs directory
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  console.log('📁 Creating logs directory...');
  fs.mkdirSync(logsDir);
  console.log('✅ Logs directory created');
} else {
  console.log('✅ Logs directory already exists');
}

console.log('\n🎯 Next steps:');
console.log('1. Edit .env file and add your Cerebras API key');
console.log('2. Run: npm install (if not done already)');
console.log('3. Run: npm run dev (to start development server)');
console.log('4. Test the API: node test-api.js');
console.log('\n📚 Documentation: README.md');
console.log('🔗 API endpoints:');
console.log('   - Health: http://localhost:3001/health');
console.log('   - API info: http://localhost:3001/api');
console.log('   - Summarize: POST http://localhost:3001/summarize');
console.log('\n✨ Setup complete!');
