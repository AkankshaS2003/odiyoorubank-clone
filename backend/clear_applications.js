const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/odiyooru').then(async () => {
  console.log('MongoDB Connected');
  try {
    await mongoose.connection.db.collection('accountapplications').deleteMany({});
    console.log('Account applications cleared successfully.');
  } catch (err) {
    console.log('Error:', err);
  }
  process.exit(0);
});
