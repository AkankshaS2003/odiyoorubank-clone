const axios = require('axios');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const User = require('./models/User');

async function test() {
  await mongoose.connect('mongodb://127.0.0.1:27017/odiyoorubank');
  
  // Create a dummy user
  let user = await User.findOne({ email: 'testmembership@example.com' });
  if (!user) {
    user = await User.create({
      fullName: 'Test Memb',
      email: 'testmembership@example.com',
      phone: '9999999999',
      password: 'password',
      customerId: 'CUST9999'
    });
  }

  // Generate token
  const jwt = require('jsonwebtoken');
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

  try {
    const res = await axios.post('http://localhost:5000/api/account/membership/apply', {
      address: 'Test Address 123',
      dob: '1990-01-01'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Success:', res.data.success);
    console.log('Updated User:', res.data.data.address, res.data.data.dob, res.data.data.membershipStatus);
  } catch(e) {
    console.error('Error:', e.response ? e.response.data : e.message);
  }

  await mongoose.disconnect();
}

test();
