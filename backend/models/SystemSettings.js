const mongoose = require('mongoose');

const SystemSettingsSchema = new mongoose.Schema({
  fdRate: { type: Number, default: 8.50 },
  goldLoanRate: { type: Number, default: 8.50 },
  savingsRate: { type: Number, default: 4.50 },
  rdRate: { type: Number, default: 7.75 },
  vehicleLoanRate: { type: Number, default: 10.00 },
  personalLoanRate: { type: Number, default: 11.50 },
  educationalLoanRate: { type: Number, default: 7.90 },
  housingLoanRate: { type: Number, default: 8.25 },
  mortgageLoanRate: { type: Number, default: 9.50 },
  agriculturalLoanRate: { type: Number, default: 8.50 },
  faceVerificationThreshold: { type: Number, default: 0.45 },
  marqueeText: { 
    type: String, 
    default: '• State Best Souharda Cooperative Society Award in the 69th All India Cooperative Week • Cooperative Fixed Deposit Rates Increased to 8.50% • New Digital Doorstep Banking Service Sanctioned' 
  },
  heroTitle: { type: String, default: 'Odiyooru Souharda' },
  heroDesc: { type: String, default: 'Cooperative Society Ltd' },
  aboutText: { 
    type: String, 
    default: '"We, Odiyoor Sree Vividhodesha Souharda Sahakari Sanga has an efficient and experienced team of Board of Directors, to assist and guide the entire society."' 
  },
  contactPhone: { type: String, default: '+91 824 2441234' },
  contactEmail: { type: String, default: 'support@odiyoorubank.in' },
  announcements: [{
    title: String,
    desc: String,
    publishedAt: { type: Date, default: Date.now },
    isPublished: { type: Boolean, default: true }
  }]
}, { timestamps: true });

module.exports = mongoose.model('SystemSettings', SystemSettingsSchema);
