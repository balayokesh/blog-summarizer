require('dotenv').config();

const config = {
  // Server configuration
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Cerebras API configuration
  cerebras: {
    apiKey: process.env.CEREBRAS_API_KEY,
    modelName: process.env.MODEL_NAME || 'llama-3.3-70b',
    timeout: 30000, // 30 seconds
  },
  
  // CORS configuration
  cors: {
    origin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // requests per window
  },
  
  // Text processing limits
  textLimits: {
    minLength: 50,
    maxLength: 15000,
    chunkSize: 2000, // tokens
  },
  
  // Summary length configurations
  summaryLengths: {
    short: {
      wordTarget: 120,
      maxTokens: 200,
      description: 'Brief overview with key points'
    },
    medium: {
      wordTarget: 240,
      maxTokens: 400,
      description: 'Balanced summary with context'
    },
    long: {
      wordTarget: 420,
      maxTokens: 600,
      description: 'Comprehensive summary with details'
    }
  },
  
  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  }
};

// Validation
if (!config.cerebras.apiKey) {
  throw new Error('CEREBRAS_API_KEY environment variable is required');
}

module.exports = config;
