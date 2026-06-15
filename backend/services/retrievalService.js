const KnowledgeBase = require('../models/KnowledgeBase');

/**
 * Retrieve top relevant document chunks using Atlas Vector Search with a text search fallback
 * @param {number[]} queryEmbedding The query embedding vector
 * @param {number} limit Maximum documents to return
 * @param {string} queryText The text query for keyword fallback
 * @returns {Promise<any[]>} List of matched document chunks
 */
const retrieveDocuments = async (queryEmbedding, limit = 5, queryText = "") => {
  try {
    const results = await KnowledgeBase.aggregate([
      {
        $vectorSearch: {
          index: "vector_index", // Must match the index name configured on MongoDB Atlas
          path: "embedding",
          queryVector: queryEmbedding,
          numCandidates: 100,
          limit: limit
        }
      },
      {
        $project: {
          title: 1,
          category: 1,
          content: 1,
          source: 1,
          score: { $meta: "vectorSearchScore" }
        }
      }
    ]);
    return results;
  } catch (error) {
    console.warn('⚠️ Atlas Vector Search failed, falling back to keyword text search (ideal for local/memory MongoDB). Error:', error.message);
    
    // Fallback: search by keywords in content and title
    if (!queryText) {
      return await KnowledgeBase.find()
        .limit(limit)
        .select('title category content source')
        .lean();
    }

    const keywords = queryText.split(/\s+/).filter(word => word.trim().length > 2);
    if (keywords.length === 0) {
      return await KnowledgeBase.find()
        .limit(limit)
        .select('title category content source')
        .lean();
    }

    // Create regex matching keywords (case-insensitive) with escaped characters to prevent SyntaxError
    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const searchRegex = new RegExp(keywords.map(escapeRegex).join('|'), 'i');
    
    const fallbackResults = await KnowledgeBase.find({
      $or: [
        { content: { $regex: searchRegex } },
        { title: { $regex: searchRegex } }
      ]
    })
    .limit(limit)
    .select('title category content source')
    .lean();

    return fallbackResults.map(doc => ({
      ...doc,
      score: 1.0 // Dummy score for interface consistency
    }));
  }
};

module.exports = { retrieveDocuments };
