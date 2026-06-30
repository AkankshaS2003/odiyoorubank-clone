const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/odiyooru').then(async () => {
  const AccountApplication = require('./models/AccountApplication');
  const app = await AccountApplication.findOne().sort({ createdAt: -1 });
  console.dir(app, { depth: null });
  process.exit(0);
});
