const mongoose = require('mongoose');

const ServiceApplicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  applicationType: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  formData: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  images: {
    type: mongoose.Schema.Types.Mixed, // Storing base64 encoded strings (e.g., signature, aadhaar, pan, photo)
    default: {}
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  processedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  processedAt: {
    type: Date
  }
});

module.exports = mongoose.model('ServiceApplication', ServiceApplicationSchema);
