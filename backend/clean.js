const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/AK').then(async () => {
  const db = mongoose.connection.db;
  await db.collection('users').updateMany({}, { $unset: { memberId: 1 } });
  await db.collection('savingsaccounts').deleteMany({});
  console.log('Cleaned dummy data from AK');
  await mongoose.disconnect();
});
