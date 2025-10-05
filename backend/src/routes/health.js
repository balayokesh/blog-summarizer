const express = require('express');
const router = express.Router();
const config = require('../config');
const cerebrasService = require('../services/cerebrasService');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Health check endpoint
 */
router.get('/', asyncHandler(async (req, res) => {
  const startTime = Date.now();
  
  // Basic health check
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    environment: config.nodeEnv,
    services: {
      database: 'not_implemented', // Placeholder for future DB
      cerebras: 'checking'
    }
  };

  // Check Cerebras API connectivity
  try {
    const isConnected = await cerebrasService.testConnection();
    health.services.cerebras = isConnected ? 'healthy' : 'unhealthy';
  } catch (error) {
    health.services.cerebras = 'unhealthy';
    health.warnings = health.warnings || [];
    health.warnings.push('Cerebras API connectivity issue');
  }

  // Determine overall status
  const allServicesHealthy = Object.values(health.services).every(
    status => status === 'healthy' || status === 'not_implemented'
  );
  
  if (!allServicesHealthy) {
    health.status = 'degraded';
  }

  const duration = Date.now() - startTime;
  health.responseTime = `${duration}ms`;

  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
}));

/**
 * Detailed health check with more information
 */
router.get('/detailed', asyncHandler(async (req, res) => {
  const startTime = Date.now();
  
  const detailedHealth = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    environment: config.nodeEnv,
    nodeVersion: process.version,
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      external: Math.round(process.memoryUsage().external / 1024 / 1024)
    },
    services: {}
  };

  // Check Cerebras API
  try {
    const isConnected = await cerebrasService.testConnection();
    detailedHealth.services.cerebras = {
      status: isConnected ? 'healthy' : 'unhealthy',
      model: config.cerebras.modelName,
      baseUrl: config.cerebras.baseUrl
    };
  } catch (error) {
    detailedHealth.services.cerebras = {
      status: 'unhealthy',
      error: error.message,
      model: config.cerebras.modelName
    };
  }

  const duration = Date.now() - startTime;
  detailedHealth.responseTime = `${duration}ms`;

  const statusCode = detailedHealth.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(detailedHealth);
}));

module.exports = router;
