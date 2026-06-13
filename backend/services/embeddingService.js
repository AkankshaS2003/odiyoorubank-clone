const genAI = require('../config/gemini');

/**
 * Generate 768-dimensional vector embedding for the input text using Gemini API
 * @param {string} text The text to embed
 * @returns {Promise<number[]>} The vector embedding
 */
const getEmbedding = async (text) => {
  if (!genAI) {
    throw new Error('Gemini API client is not initialized. Please verify your GEMINI_API_KEY in your .env file.');
  }

  try {
    // gemini-embedding-2 is the standard embedding model for Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-embedding-2' });
    const result = await model.embedContent({
      content: { parts: [{ text }] },
      taskType: 'RETRIEVAL_DOCUMENT',
      outputDimensionality: 768
    });
    
    if (result && result.embedding && result.embedding.values) {
      return result.embedding.values;
    } else {
      throw new Error('Failed to retrieve embedding values from the Google Gemini response.');
    }
  } catch (error) {
    console.error('Error in getEmbedding service:', error);
    throw new Error(`Failed to generate text embedding: ${error.message}`);
  }
};

module.exports = { getEmbedding };
