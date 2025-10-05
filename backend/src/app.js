const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const logger = require('./utils/logger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { requestId, requestLogger } = require('./middleware/validation');

// Import routes
const healthRoutes = require('./routes/health');
const summarizeRoutes = require('./routes/summarize');

// Create Express app
const app = express();

// Trust proxy for accurate IP addresses (important for rate limiting)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for API
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: config.cors.origin,
  credentials: config.cors.credentials,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    success: false,
    error: {
      message: 'Too many requests from this IP, please try again later',
      status: 429,
      retryAfter: Math.ceil(config.rateLimit.windowMs / 1000)
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url
    });
    res.status(429).json({
      success: false,
      error: {
        message: 'Too many requests from this IP, please try again later',
        status: 429,
        retryAfter: Math.ceil(config.rateLimit.windowMs / 1000)
      }
    });
  }
});

app.use(limiter);

// Request ID and logging middleware
app.use(requestId);
app.use(requestLogger);

// Body parsing middleware
app.use(express.json({ 
  limit: '1mb',
  verify: (req, res, buf) => {
    // Store raw body for potential signature verification
    req.rawBody = buf;
  }
}));

app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Health check endpoint (before rate limiting for monitoring)
app.use('/health', healthRoutes);

// API routes
app.use('/summarize', summarizeRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Blog Summarizer API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      summarize: 'POST /summarize'
    },
    documentation: 'https://github.com/your-repo/blog-summarizer'
  });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    api: {
      name: 'Blog Summarizer API',
      version: '1.0.0',
      description: 'AI-powered blog and blog summarization service',
      endpoints: {
        health: {
          method: 'GET',
          path: '/health',
          description: 'Health check and service status'
        },
        summarize: {
          method: 'POST',
          path: '/summarize',
          description: 'Summarize text content',
          body: {
            text: 'string (50-15000 characters)',
            length: 'string (short|medium|long)'
          }
        }
      },
      limits: {
        textLength: {
          min: config.textLimits.minLength,
          max: config.textLimits.maxLength
        },
        rateLimit: {
          windowMs: config.rateLimit.windowMs,
          maxRequests: config.rateLimit.max
        }
      }
    }
  });
});

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// Graceful shutdown handling
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection', {
    reason: reason.toString(),
    stack: reason.stack
  });
});

// Uncaught exception handler
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', {
    error: error.message,
    stack: error.stack
  });
  process.exit(1);
});

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  logger.info(`Blog Summarizer API server started`, {
    port: PORT,
    environment: config.nodeEnv,
    cerebrasModel: config.cerebras.modelName,
    corsOrigin: config.cors.origin
  });
  
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📝 API docs: http://localhost:${PORT}/api`);
});

module.exports = app;
