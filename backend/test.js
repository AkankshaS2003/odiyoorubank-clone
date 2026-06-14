const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/odiyoorubank').then(async () => {
  const allUsers = await User.find();
  console.log('All users:', allUsers.map(u => u.memberId));
  
  const allMatched = await User.find({ memberId: { $regex: /^ODI-M-\d+$/ } }).select('memberId');
  console.log('Matched users:', allMatched.map(u => u.memberId));
  
  process.exit();
}).catch(console.error);
