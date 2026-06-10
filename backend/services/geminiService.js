const genAI = require('../config/gemini');

/**
 * Generate assistant response using Gemini 2.5 Flash and prompt instructions
 * @param {string} question The user question
 * @param {any[]} contextDocs The retrieved relevant documents
 * @returns {Promise<string>} Generated response text
 */
const generateResponse = async (question, contextDocs) => {
  if (!genAI) {
    throw new Error('Gemini API client is not initialized. Please verify your GEMINI_API_KEY in your .env file.');
  }

  try {
    const systemPrompt = `You are an AI Assistant for a Cooperative Bank.

Answer only from the provided context.

If information is not found in context, politely respond:
'Sorry, I could not find that information in the bank records.'

Never hallucinate.
Never generate financial information that is not present in retrieved documents.`;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: systemPrompt
    });

    // Format retrieved documents as context
    const contextText = contextDocs && contextDocs.length > 0
      ? contextDocs.map((doc, idx) => `Document [${idx + 1}]: Title: ${doc.title}\nCategory: ${doc.category}\nSource: ${doc.source}\nContent: ${doc.content}`).join('\n\n')
      : "No context documents provided.";

    const prompt = `Context Information:\n${contextText}\n\nUser Question: ${question}\n\nAssistant Response:`;

    const result = await model.generateContent(prompt);
    
    if (result && result.response) {
      return result.response.text();
    } else {
      throw new Error('Empty response received from Gemini Generative API.');
    }
  } catch (error) {
    console.error('Error generating AI answer:', error);
    throw new Error(`Gemini service failed to generate response: ${error.message}`);
  }
};

module.exports = { generateResponse };
