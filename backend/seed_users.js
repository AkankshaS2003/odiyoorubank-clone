require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/AK';

const indianNames = [
  "Aarav Sharma", "Vivaan Patel", "Aditya Singh", "Vihaan Kumar", "Arjun Gupta",
  "Sai Ram", "Ayaan Desai", "Krishna Reddy", "Ishaan Joshi", "Shaurya Mehta"
];

const generateRandomData = () => {
  const users = [];
  for (let i = 0; i < 10; i++) {
    const fullName = indianNames[i];
    const email = `user${i + 200}@example.com`;
    const phone = `98${Math.floor(10000000 + Math.random() * 90000000)}`;
    const password = "password123";

    const savingsBalance = Math.floor(Math.random() * 50000) + 5000;
    const fdBalance = Math.floor(Math.random() * 500000) + 50000;
    const rdBalance = Math.floor(Math.random() * 100000) + 10000;

    const deposits = [
      {
        id: `FD${Math.floor(100000 + Math.random() * 900000)}`,
        type: 'Fixed',
        amount: fdBalance,
        rate: 7.5,
        date: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
        maturityDate: new Date(Date.now() + 265 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Active',
        accruedInterest: fdBalance * 0.05
      },
      {
        id: `RD${Math.floor(100000 + Math.random() * 900000)}`,
        type: 'Recurring',
        amount: rdBalance,
        rate: 6.5,
        date: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
        maturityDate: new Date(Date.now() + 315 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Active',
        accruedInterest: rdBalance * 0.02
      }
    ];

    const loans = [
      {
        id: `LN${Math.floor(100000 + Math.random() * 900000)}`,
        type: 'Personal Loan',
        amount: 200000,
        outstanding: 150000,
        rate: 10.5,
        tenureMonths: 24,
        emi: 9274,
        nextPaymentDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        paidEmis: 6
      }
    ];

    users.push({
      fullName,
      email,
      phone,
      password,
      role: 'customer',
      status: 'Active',
      isKycVerified: true,
      membershipStatus: 'approved',
      savingsBalance,
      fdBalance,
      rdBalance,
      deposits,
      loans,
      memberId: `MBR${Math.floor(10000 + Math.random() * 90000)}`,
      customerId: `CUST${Math.floor(100000 + Math.random() * 900000)}`,
      address: "123 Main St, Bangalore, India",
      dob: "1990-01-01",
      panNumber: `ABCDE${Math.floor(1000 + Math.random() * 9000)}F`,
      aadharNumber: `${Math.floor(100000000000 + Math.random() * 900000000000)}`
    });
  }
  return users;
};

const seedDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Connected to', MONGO_URI);

    const usersData = generateRandomData();
    
    for (const userData of usersData) {
      const user = new User(userData);
      await user.save();
      console.log(`User ${user.fullName} created`);
    }

    console.log('10 Members inserted successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error inserting users:', error);
    process.exit(1);
  }
};

seedDB();
