const mongoose = require('mongoose');
const User = require('./models/User');
const RecurringDeposit = require('./models/RecurringDeposit');

async function run() {
  await mongoose.connect('mongodb://localhost:27017/AK');
  console.log('Connected to DB');

  const activeRD = await RecurringDeposit.findOne({ status: 'Active' }).populate('userId');
  if (activeRD) {
    console.log('FOUND ACTIVE RD:');
    console.log('Customer ID:', activeRD.userId?.customerId);
    console.log('Customer Name:', activeRD.userId?.fullName);
    console.log('Customer Email:', activeRD.userId?.email);
    console.log('RD ID:', activeRD._id);
    console.log('RD Number:', activeRD.rdNumber);
    console.log('Monthly Amount:', activeRD.monthlyAmount);
  } else {
    console.log('No active RD found. Listing all RDs:');
    const rds = await RecurringDeposit.find().populate('userId');
    for (const rd of rds) {
      console.log(`RD ID: ${rd._id}, status: ${rd.status}, customerId: ${rd.userId?.customerId}, name: ${rd.userId?.fullName}`);
    }
  }

  await mongoose.disconnect();
}

run();
