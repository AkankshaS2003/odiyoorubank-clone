require('mongoose').connect('mongodb://127.0.0.1:27017/AK').then(async () => {
  const User = require('./models/User');
  await User.updateOne({_id: '6a377e3d1ccc45284f950401'}, { $set: { fdBalance: 15000, savingsBalance: 35000 } });
  console.log('Balance updated');
  process.exit(0);
}).catch(console.error);
