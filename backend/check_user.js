require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/AK';

const patchUser = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    const user = await User.findOne({ customerId: 'CUST385099' });
    if (user) {
      user.address = "Sample 123 Street, Mangalore, Karnataka 575001";
      user.profileImageBase64 = "https://i.pravatar.cc/150?u=CUST385099"; // just use a fallback URL or base64 so it works for them
      await user.save();
      console.log('Patched CUST385099');
    }
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

patchUser();
