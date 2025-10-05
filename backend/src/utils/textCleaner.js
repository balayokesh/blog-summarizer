/**
 * Text cleaning and normalization utilities
 */

/**
 * Clean and normalize input text
 * @param {string} text - Raw input text
 * @returns {string} - Cleaned text
 */
function cleanText(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('Text must be a non-empty string');
  }

  let cleaned = text;

  // Remove HTML tags
  cleaned = cleaned.replace(/<[^>]*>/g, '');
  
  // Remove excessive whitespace and normalize line breaks
  cleaned = cleaned.replace(/\s+/g, ' ');
  cleaned = cleaned.replace(/\n\s*\n/g, '\n\n');
  
  // Remove common tracking/analytics junk
  cleaned = cleaned.replace(/\[ad\]|\[advertisement\]|\[sponsored\]/gi, '');
  cleaned = cleaned.replace(/follow us on|subscribe to|click here|read more/gi, '');
  
  // Normalize punctuation
  cleaned = cleaned.replace(/[""]/g, '"');
  cleaned = cleaned.replace(/['']/g, "'");
  cleaned = cleaned.replace(/…/g, '...');
  
  // Remove excessive punctuation
  cleaned = cleaned.replace(/[.]{3,}/g, '...');
  cleaned = cleaned.replace(/[!]{2,}/g, '!');
  cleaned = cleaned.replace(/[?]{2,}/g, '?');
  
  // Trim and ensure UTF-8 safety
  cleaned = cleaned.trim();
  
  // Remove null bytes and control characters (except newlines and tabs)
  cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  return cleaned;
}

/**
 * Remove duplicate content and normalize structure
 * @param {string} text - Cleaned text
 * @returns {string} - Deduplicated text
 */
function deduplicateContent(text) {
  const lines = text.split('\n');
  const seen = new Set();
  const uniqueLines = [];
  
  for (const line of lines) {
    const normalized = line.trim().toLowerCase();
    if (normalized && !seen.has(normalized) && normalized.length > 10) {
      seen.add(normalized);
      uniqueLines.push(line);
    }
  }
  
  return uniqueLines.join('\n');
}

/**
 * Split text into chunks if it's too long
 * @param {string} text - Text to chunk
 * @param {number} maxChunkSize - Maximum chunk size in characters
 * @returns {string[]} - Array of text chunks
 */
function chunkText(text, maxChunkSize = 2000) {
  if (text.length <= maxChunkSize) {
    return [text];
  }
  
  const chunks = [];
  const sentences = text.split(/[.!?]+/);
  let currentChunk = '';
  
  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;
    
    if (currentChunk.length + trimmed.length > maxChunkSize && currentChunk) {
      chunks.push(currentChunk.trim());
      currentChunk = trimmed;
    } else {
      currentChunk += (currentChunk ? '. ' : '') + trimmed;
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

/**
 * Validate text length and content
 * @param {string} text - Text to validate
 * @param {number} minLength - Minimum length
 * @param {number} maxLength - Maximum length
 * @returns {object} - Validation result
 */
function validateText(text, minLength = 50, maxLength = 15000) {
  const errors = [];
  
  if (!text || typeof text !== 'string') {
    errors.push('Text must be a non-empty string');
  } else {
    if (text.length < minLength) {
      errors.push(`Text must be at least ${minLength} characters long`);
    }
    if (text.length > maxLength) {
      errors.push(`Text must be no more than ${maxLength} characters long`);
    }
    
    // Check for meaningful content (not just whitespace/punctuation)
    const meaningfulChars = text.replace(/[\s\W]/g, '').length;
    if (meaningfulChars < minLength * 0.5) {
      errors.push('Text must contain meaningful content');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  cleanText,
  deduplicateContent,
  chunkText,
  validateText
};
