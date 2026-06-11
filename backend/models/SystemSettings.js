const mongoose = require('mongoose');

const SystemSettingsSchema = new mongoose.Schema({
  fdRate: { type: Number, default: 8.50 },
  goldLoanRate: { type: Number, default: 8.50 },
  savingsRate: { type: Number, default: 4.50 },
  rdRate: { type: Number, default: 7.75 },
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
  contactEmail: { type: String, default: 'support@odiyoorubank.in' }
}, { timestamps: true });

module.exports = mongoose.model('SystemSettings', SystemSettingsSchema);
