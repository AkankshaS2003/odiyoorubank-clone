const mongoose = require('mongoose');
const User = require('./models/User');

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/odiyoorubank');
  
  const users = await User.find({ membershipStatus: { $ne: 'none' } });
  console.log("Users with membership:", users.length);
  users.forEach(u => {
    console.log(`- ${u.fullName}: status=${u.membershipStatus}, address=${u.address}, dob=${u.dob}`);
  });

  await mongoose.disconnect();
}
run().catch(console.error);
