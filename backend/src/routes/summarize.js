const express = require('express');
const router = express.Router();
const config = require('../config');
const logger = require('../utils/logger');
const { cleanText, deduplicateContent, chunkText, validateText } = require('../utils/textCleaner');
const { buildPrompt, parseResponse } = require('../utils/promptBuilder');
const cerebrasService = require('../services/cerebrasService');
const { asyncHandler } = require('../middleware/errorHandler');
const { validate } = require('../middleware/validation');

/**
 * POST /summarize - Main summarization endpoint
 */
router.post('/', validate('summarize'), asyncHandler(async (req, res) => {
  const startTime = Date.now();
  const { text, length } = req.body;
  
  logger.info('Summarization request received', {
    requestId: req.id,
    textLength: text.length,
    summaryLength: length,
    ip: req.ip
  });

  try {
    // Step 1: Clean and validate text
    let cleanedText = cleanText(text);
    cleanedText = deduplicateContent(cleanedText);
    
    const validation = validateText(cleanedText, config.textLimits.minLength, config.textLimits.maxLength);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Text validation failed',
          status: 400,
          details: validation.errors
        }
      });
    }

    // Step 2: Handle chunking if text is too long
    const chunks = chunkText(cleanedText, config.textLimits.chunkSize);
    let finalSummary;

    if (chunks.length === 1) {
      // Single chunk - direct summarization
      finalSummary = await summarizeChunk(chunks[0], length, req.id);
    } else {
      // Multiple chunks - summarize each, then summarize the summaries
      logger.info('Processing multiple chunks', {
        requestId: req.id,
        chunkCount: chunks.length
      });

      const chunkSummaries = [];
      for (let i = 0; i < chunks.length; i++) {
        const chunkSummary = await summarizeChunk(chunks[i], 'short', req.id);
        chunkSummaries.push(`Chunk ${i + 1}: ${chunkSummary.tldr}`);
      }

      // Combine chunk summaries and create final summary
      const combinedText = chunkSummaries.join('\n\n');
      finalSummary = await summarizeChunk(combinedText, length, req.id);
    }

    // Step 3: Prepare response
    const duration = Date.now() - startTime;
    const response = {
      success: true,
      data: {
        bullets: finalSummary.bullets,
        tldr: finalSummary.tldr,
        meta: {
          tokensUsed: finalSummary.tokensUsed || 'unknown',
          model: finalSummary.model || config.cerebras.modelName,
          length: length,
          processingTime: `${duration}ms`,
          originalLength: text.length,
          cleanedLength: cleanedText.length,
          chunksProcessed: chunks.length
        }
      }
    };

    logger.info('Summarization completed successfully', {
      requestId: req.id,
      duration: `${duration}ms`,
      bulletsCount: finalSummary.bullets.length,
      tldrLength: finalSummary.tldr.length
    });

    res.json(response);

  } catch (error) {
    logger.error('Summarization failed', {
      requestId: req.id,
      error: error.message,
      duration: `${Date.now() - startTime}ms`
    });

    // Provide fallback summary for certain errors
    if (error.message.includes('parsing') || error.message.includes('format')) {
      const fallbackSummary = createFallbackSummary(cleanedText, length);
      return res.json({
        success: true,
        data: {
          bullets: fallbackSummary.bullets,
          tldr: fallbackSummary.tldr,
          meta: {
            tokensUsed: 'unknown',
            model: config.cerebras.modelName,
            length: length,
            processingTime: `${Date.now() - startTime}ms`,
            fallback: true
          }
        }
      });
    }

    throw error; // Re-throw to be handled by error middleware
  }
}));

/**
 * Summarize a single chunk of text
 * @param {string} text - Text to summarize
 * @param {string} length - Summary length
 * @param {string} requestId - Request ID for logging
 * @returns {Promise<object>} - Summary result
 */
async function summarizeChunk(text, length, requestId) {
  try {
    // Build prompt
    const prompt = buildPrompt(text, length);
    
    // Call Cerebras API
    const apiResponse = await cerebrasService.generateCompletion(prompt);
    
    if (!apiResponse.success) {
      throw new Error('API call failed');
    }

    // Parse response
    const parsed = parseResponse(apiResponse.content);
    
    return {
      bullets: parsed.bullets,
      tldr: parsed.tldr,
      tokensUsed: apiResponse.usage.total_tokens,
      model: apiResponse.model
    };

  } catch (error) {
    logger.error('Chunk summarization failed', {
      requestId,
      error: error.message,
      textLength: text.length
    });
    throw error;
  }
}

/**
 * Create a fallback summary when parsing fails
 * @param {string} text - Text to summarize
 * @param {string} length - Summary length
 * @returns {object} - Fallback summary
 */
function createFallbackSummary(text, length) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const targetCount = length === 'short' ? 3 : length === 'medium' ? 5 : 7;
  
  const bullets = sentences
    .slice(0, targetCount)
    .map(sentence => sentence.trim())
    .filter(sentence => sentence.length > 0);

  const tldr = sentences.slice(0, 2).join('. ').trim() + '.';

  return {
    bullets: bullets.length > 0 ? bullets : ['Content summary not available'],
    tldr: tldr || 'Summary not available'
  };
}

module.exports = router;
