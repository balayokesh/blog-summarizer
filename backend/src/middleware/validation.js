const Joi = require('joi');

/**
 * Validation schemas
 */
const schemas = {
  summarize: Joi.object({
    text: Joi.string()
      .min(50)
      .max(15000)
      .required()
      .messages({
        'string.min': 'Text must be at least 50 characters long',
        'string.max': 'Text must be no more than 15,000 characters long',
        'any.required': 'Text is required'
      }),
    length: Joi.string()
      .valid('short', 'medium', 'long')
      .default('medium')
      .messages({
        'any.only': 'Length must be one of: short, medium, long'
      })
  })
};

/**
 * Validation middleware factory
 * @param {string} schemaName - Name of the schema to use
 * @returns {function} - Express middleware function
 */
function validate(schemaName) {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    if (!schema) {
      return res.status(500).json({
        success: false,
        error: {
          message: 'Invalid validation schema',
          status: 500
        }
      });
    }

    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          status: 400,
          details: errorDetails
        }
      });
    }

    // Replace req.body with validated and sanitized data
    req.body = value;
    next();
  };
}

/**
 * Request ID middleware for tracking
 */
function requestId(req, res, next) {
  req.id = req.headers['x-request-id'] || 
           req.headers['x-correlation-id'] || 
           `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  res.setHeader('X-Request-ID', req.id);
  next();
}

/**
 * Request logging middleware
 */
function requestLogger(req, res, next) {
  const startTime = Date.now();
  
  // Log request
  console.log(`${req.method} ${req.url} - ${req.ip} - ${new Date().toISOString()}`);
  
  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = Date.now() - startTime;
    console.log(`${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
}

module.exports = {
  validate,
  requestId,
  requestLogger
};
