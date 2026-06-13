const genAI = require("../config/gemini");

/**
 * Generate AI response using Gemini
 * @param {string} question
 * @param {Array} contextDocs
 * @returns {Promise<string>}
 */
const generateResponse = async (question, contextDocs = []) => {
  try {
    if (!genAI) {
      throw new Error(
        "Gemini API client is not initialized. Check GEMINI_API_KEY."
      );
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const systemPrompt = `
You are an AI Assistant for a Cooperative Bank.

Rules:
1. Answer ONLY using the provided context.
2. If the answer is not available in the context, respond exactly:
   "Sorry, I could not find that information in the bank records."
3. Never make up information.
4. Never provide financial advice beyond the provided documents.
5. Keep answers concise and professional.
`;

    const contextText =
      contextDocs.length > 0
        ? contextDocs
            .map(
              (doc, index) => `
Document ${index + 1}
Title: ${doc.title || "N/A"}
Category: ${doc.category || "N/A"}
Source: ${doc.source || "N/A"}

${doc.content || ""}
`
            )
            .join("\n\n")
        : "No relevant documents found.";

    const prompt = `
${systemPrompt}

BANK CONTEXT:
${contextText}

USER QUESTION:
${question}

ANSWER:
`;

    const result = await model.generateContent(prompt);

    const response = result?.response?.text();

    if (!response) {
      throw new Error("Empty response received from Gemini.");
    }

    return response;
  } catch (error) {
    console.error("Gemini Response Error:", error);
    throw new Error(`Gemini service failed: ${error.message}`);
  }
};

module.exports = { generateResponse };