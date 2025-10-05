const config = require('../config');

/**
 * Build system prompt for the LLM
 * @returns {string} - System prompt
 */
function buildSystemPrompt() {
  return `You are a precise summarizer for blog and blog content. Your role is to:

1. Extract factual information accurately
2. Maintain neutrality and objectivity
3. Preserve important names, dates, numbers, and locations
4. Avoid speculation or adding facts not present in the source
5. Structure information clearly and concisely

Guidelines:
- Focus on who, what, when, where, why, and how
- Prioritize the most important information first
- Use clear, professional language
- Flag if content appears to be opinion-heavy or biased
- Maintain the original meaning without distortion`;
}

/**
 * Build user prompt with specific instructions
 * @param {string} text - Cleaned input text
 * @param {string} length - Summary length ('short', 'medium', 'long')
 * @returns {string} - User prompt
 */
function buildUserPrompt(text, length) {
  const lengthConfig = config.summaryLengths[length];
  if (!lengthConfig) {
    throw new Error(`Invalid summary length: ${length}`);
  }

  const wordTarget = lengthConfig.wordTarget;
  const description = lengthConfig.description;

  return `Please summarize the following text into a ${description} (target: ~${wordTarget} words).

Requirements:
1. Create 5-7 bullet points that capture the key information
2. Include a 2-3 sentence TL;DR (Too Long; Didn't Read) summary
3. Preserve important names, dates, numbers, and locations
4. Maintain factual accuracy and neutrality
5. Avoid adding information not present in the source

Format your response as:
BULLETS:
• [First key point]
• [Second key point]
• [Third key point]
• [Fourth key point]
• [Fifth key point]
• [Sixth key point]
• [Seventh key point]

TL;DR: [2-3 sentence summary capturing the essence]

Text to summarize:
${text}`;
}

/**
 * Build the complete prompt for the LLM
 * @param {string} text - Input text to summarize
 * @param {string} length - Summary length preference
 * @returns {object} - Complete prompt structure
 */
function buildPrompt(text, length) {
  return {
    messages: [
      {
        role: 'system',
        content: buildSystemPrompt()
      },
      {
        role: 'user',
        content: buildUserPrompt(text, length)
      }
    ],
    temperature: 0.3,
    max_tokens: config.summaryLengths[length].maxTokens,
    top_p: 0.9,
    frequency_penalty: 0.1,
    presence_penalty: 0.1
  };
}

/**
 * Parse the LLM response into structured format
 * @param {string} response - Raw LLM response
 * @returns {object} - Parsed response with bullets and tldr
 */
function parseResponse(response) {
  if (!response || typeof response !== 'string') {
    throw new Error('Invalid response format');
  }

  const bullets = [];
  const lines = response.split('\n');
  let inBulletsSection = false;
  let tldr = '';

  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.toLowerCase().startsWith('bullets:')) {
      inBulletsSection = true;
      continue;
    }
    
    if (trimmed.toLowerCase().startsWith('tldr:')) {
      inBulletsSection = false;
      tldr = trimmed.substring(5).trim();
      continue;
    }
    
    if (inBulletsSection && trimmed.startsWith('•')) {
      const bullet = trimmed.substring(1).trim();
      if (bullet) {
        bullets.push(bullet);
      }
    }
  }

  // Fallback parsing if structured format not followed
  if (bullets.length === 0) {
    const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 10);
    bullets.push(...sentences.slice(0, 7).map(s => s.trim()));
  }

  if (!tldr) {
    // Create a simple TL;DR from the first few sentences
    const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 10);
    tldr = sentences.slice(0, 2).join('. ').trim() + '.';
  }

  // Validate and clean results
  const cleanBullets = bullets
    .filter(bullet => bullet.length > 10 && bullet.length < 200)
    .slice(0, 7);

  if (cleanBullets.length < 3) {
    throw new Error('Insufficient bullet points generated');
  }

  return {
    bullets: cleanBullets,
    tldr: tldr || 'Summary not available'
  };
}

module.exports = {
  buildPrompt,
  parseResponse
};
