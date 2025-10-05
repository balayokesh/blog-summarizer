const Cerebras = require('@cerebras/cerebras_cloud_sdk');
const config = require('../config');
const logger = require('../utils/logger');

/**
 * Cerebras LLM API service using the official SDK
 */
class CerebrasService {
  constructor() {
    this.apiKey = config.cerebras.apiKey;
    this.modelName = config.cerebras.modelName;
    this.timeout = config.cerebras.timeout;
    
    // Initialize Cerebras SDK
    this.cerebras = new Cerebras({
      apiKey: this.apiKey
    });
  }

  /**
   * Generate completion using Cerebras SDK
   * @param {object} prompt - Prompt object with messages and parameters
   * @returns {Promise<object>} - API response
   */
  async generateCompletion(prompt) {
    const startTime = Date.now();
    
    try {
      logger.info('Making request to Cerebras API', {
        model: this.modelName,
        messagesCount: prompt.messages.length,
        maxTokens: prompt.max_tokens
      });

      // Create completion using the SDK
      const completion = await this.cerebras.chat.completions.create({
        messages: prompt.messages,
        model: this.modelName,
        stream: false,
        max_completion_tokens: prompt.max_tokens,
        temperature: prompt.temperature,
        top_p: prompt.top_p,
      });

      const duration = Date.now() - startTime;
      
      logger.info('Cerebras API response received', {
        duration: `${duration}ms`,
        tokensUsed: completion.usage?.total_tokens || 'unknown',
        model: completion.model
      });

      return {
        success: true,
        content: completion.choices[0]?.message?.content || '',
        usage: completion.usage || {},
        model: completion.model,
        duration
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      
      logger.error('Cerebras API error', {
        error: error.message,
        status: error.status,
        duration: `${duration}ms`
      });

      // Handle different types of errors
      if (error.status) {
        // API returned an error response
        const status = error.status;
        
        if (status === 401) {
          throw new Error('Invalid API key or authentication failed');
        } else if (status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        } else if (status === 400) {
          throw new Error(`Invalid request: ${error.message || 'Bad request'}`);
        } else if (status >= 500) {
          throw new Error('Cerebras API is currently unavailable. Please try again later.');
        } else {
          throw new Error(`API error: ${error.message || 'Unknown error'}`);
        }
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new Error('Request timeout. The API took too long to respond.');
      } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        throw new Error('Unable to connect to Cerebras API. Please check your internet connection.');
      } else {
        throw new Error(`Network error: ${error.message}`);
      }
    }
  }

  /**
   * Test API connectivity
   * @returns {Promise<boolean>} - Whether API is accessible
   */
  async testConnection() {
    try {
      // Make a minimal request to test connectivity
      const completion = await this.cerebras.chat.completions.create({
        messages: [{ role: 'user', content: 'Hello' }],
        model: this.modelName,
        stream: false,
        max_completion_tokens: 10
      });
      
      logger.info('Cerebras API connection test successful');
      return true;
    } catch (error) {
      logger.error('Cerebras API connection test failed', {
        error: error.message
      });
      return false;
    }
  }

  /**
   * Get available models (Note: SDK may not have direct models endpoint)
   * @returns {Promise<array>} - List of available models
   */
  async getModels() {
    try {
      // The SDK might not expose a models endpoint directly
      // Return the configured model for now
      return [{
        id: this.modelName,
        object: 'model',
        created: Date.now(),
        owned_by: 'cerebras'
      }];
    } catch (error) {
      logger.error('Failed to fetch models', { error: error.message });
      throw new Error('Unable to fetch available models');
    }
  }
}

module.exports = new CerebrasService();
