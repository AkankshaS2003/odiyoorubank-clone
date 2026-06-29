require('dotenv').config();
const mongoose = require('mongoose');
const AccountApplication = require('./models/AccountApplication');
const User = require('./models/User');

async function testDuplicateAadhar() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  // Create a dummy user
  const dummyUser = await User.create({
    fullName: "Dummy User",
    email: "dummy@test.com",
    phone: "9999999999",
    password: "Password123"
  });

  console.log("Created dummy user:", dummyUser._id);

  // Find an existing application to get a used Aadhar number
  const existing = await AccountApplication.findOne();
  if (existing) {
    console.log("Existing Aadhar:", existing.aadharNumber);
    console.log("Existing PAN:", existing.panNumber);

    // Let's mimic the submit application route's exact logic
    const duplicateAadhar = await AccountApplication.findOne({ aadharNumber: existing.aadharNumber, status: { $ne: 'Rejected' } });
    if (duplicateAadhar && duplicateAadhar.userId.toString() !== dummyUser._id.toString()) {
      console.log("SUCCESS: Blocked duplicate Aadhar");
    } else {
      console.log("FAILURE: Did not block duplicate Aadhar");
    }

    const duplicatePan = await AccountApplication.findOne({ panNumber: existing.panNumber, status: { $ne: 'Rejected' } });
    if (duplicatePan && duplicatePan.userId.toString() !== dummyUser._id.toString()) {
      console.log("SUCCESS: Blocked duplicate PAN");
    } else {
      console.log("FAILURE: Did not block duplicate PAN");
    }
  }

  // Cleanup
  await User.findByIdAndDelete(dummyUser._id);
  mongoose.disconnect();
}

testDuplicateAadhar().catch(console.error);
