/**
 * Test script to verify Cerebras Cloud SDK integration
 * Run with: node test-sdk.js
 */

require('dotenv').config();
const Cerebras = require('@cerebras/cerebras_cloud_sdk');

async function testSDK() {
  console.log('🧪 Testing Cerebras Cloud SDK Integration...\n');

  // Check if API key is configured
  if (!process.env.CEREBRAS_API_KEY || process.env.CEREBRAS_API_KEY === 'your_cerebras_api_key_here') {
    console.log('❌ CEREBRAS_API_KEY not configured in .env file');
    console.log('💡 Please add your Cerebras API key to the .env file');
    return;
  }

  try {
    // Initialize the SDK
    console.log('1. Initializing Cerebras SDK...');
    const cerebras = new Cerebras({
      apiKey: process.env.CEREBRAS_API_KEY
    });
    console.log('✅ SDK initialized successfully');

    // Test a simple completion
    console.log('\n2. Testing simple completion...');
    const completion = await cerebras.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that provides concise responses.'
        },
        {
          role: 'user',
          content: 'Summarize this in one sentence: Artificial intelligence is transforming many industries through automation and data analysis.'
        }
      ],
      model: process.env.MODEL_NAME || 'qwen-3-235b-a22b-instruct-2507',
      stream: false,
      max_completion_tokens: 100,
      temperature: 0.3
    });

    console.log('✅ Completion successful!');
    console.log('   Model:', completion.model);
    console.log('   Response:', completion.choices[0]?.message?.content);
    console.log('   Tokens used:', completion.usage?.total_tokens);

    // Test streaming (optional)
    console.log('\n3. Testing streaming completion...');
    const stream = await cerebras.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: 'Say hello in exactly 3 words.'
        }
      ],
      model: process.env.MODEL_NAME || 'qwen-3-235b-a22b-instruct-2507',
      stream: true,
      max_completion_tokens: 20,
      temperature: 0.1
    });

    let streamedContent = '';
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      streamedContent += content;
      process.stdout.write(content);
    }
    console.log('\n✅ Streaming successful!');
    console.log('   Streamed content:', streamedContent);

    console.log('\n🎉 All SDK tests passed! The integration is working correctly.');
    console.log('\n📝 Next steps:');
    console.log('   1. Start the server: npm run dev');
    console.log('   2. Test the API: npm run test-api');

  } catch (error) {
    console.error('❌ SDK test failed:', error.message);
    
    if (error.message.includes('API key') || error.message.includes('authentication')) {
      console.log('\n💡 Check your CEREBRAS_API_KEY in the .env file');
    } else if (error.message.includes('model')) {
      console.log('\n💡 Check your MODEL_NAME in the .env file');
    } else {
      console.log('\n💡 Check the error details above and verify your configuration');
    }
  }
}

// Run the test
testSDK();
