const mongoose = require('mongoose');

const KnowledgeBaseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a document title']
  },
  category: {
    type: String,
    required: [true, 'Please add a category']
  },
  content: {
    type: String,
    required: [true, 'Please add text content']
  },
  source: {
    type: String,
    required: [true, 'Please add source file/identifier']
  },
  embedding: {
    type: [Number],
    required: [true, 'Please add embedding vectors']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('KnowledgeBase', KnowledgeBaseSchema);
