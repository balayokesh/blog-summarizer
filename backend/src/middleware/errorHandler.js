const logger = require('../utils/logger');
const config = require('../config');

/**
 * Centralized error handling middleware
 */
function errorHandler(err, req, res, next) {
  // Log the error
  logger.error('Request error', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Default error response
  let status = 500;
  let message = 'Internal server error';
  let details = null;

  // Handle different error types
  if (err.name === 'ValidationError') {
    status = 400;
    message = 'Validation error';
    details = err.details || err.message;
  } else if (err.name === 'UnauthorizedError') {
    status = 401;
    message = 'Unauthorized';
  } else if (err.status) {
    status = err.status;
    message = err.message;
  } else if (err.message.includes('timeout')) {
    status = 408;
    message = 'Request timeout';
  } else if (err.message.includes('rate limit')) {
    status = 429;
    message = 'Too many requests';
  } else if (err.message.includes('API key') || err.message.includes('authentication')) {
    status = 401;
    message = 'Authentication failed';
  } else if (err.message.includes('Cerebras API')) {
    status = 502;
    message = 'External service unavailable';
  }

  // Don't expose internal errors in production
  if (config.nodeEnv === 'production' && status === 500) {
    message = 'Internal server error';
    details = null;
  }

  // Send error response
  const errorResponse = {
    success: false,
    error: {
      message,
      status,
      timestamp: new Date().toISOString(),
      requestId: req.id || 'unknown'
    }
  };

  if (details && config.nodeEnv !== 'production') {
    errorResponse.error.details = details;
  }

  res.status(status).json(errorResponse);
}

/**
 * 404 handler for undefined routes
 */
function notFoundHandler(req, res) {
  logger.warn('Route not found', {
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  res.status(404).json({
    success: false,
    error: {
      message: 'Route not found',
      status: 404,
      timestamp: new Date().toISOString(),
      path: req.url
    }
  });
}

/**
 * Async error wrapper for route handlers
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler
};
