const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });
const Branch = require('./backend/models/Branch');

const originalBranches = [
  { name: 'Odiyoor (Head Office)', address: 'Odiyoor Shree Vividhoddesha Sowhardha Sahakari Ltd, Odiyoor', type: 'Head Office', phone: '+91 0000000000', isPublished: true },
  { name: 'Pumpwell, Mangaluru', address: 'Regional Office, Pumpwell, Mangaluru', type: 'Regional Office', phone: '+91 0000000000', isPublished: true },
  { name: 'Bejai', address: 'Bejai Branch, Mangaluru', type: 'Branch', phone: '+91 0000000000', isPublished: true },
  { name: 'B.C. Road', address: 'B.C. Road Branch', type: 'Branch', phone: '+91 0000000000', isPublished: true },
  { name: 'Puttur', address: 'Puttur Branch', type: 'Branch', phone: '+91 0000000000', isPublished: true },
  { name: 'Vittla', address: 'Vittla Branch', type: 'Branch', phone: '+91 0000000000', isPublished: true },
  { name: 'Kanyana', address: 'Kanyana Branch', type: 'Branch', phone: '+91 0000000000', isPublished: true },
  { name: 'Surathkal', address: 'Surathkal Branch', type: 'Branch', phone: '+91 0000000000', isPublished: true },
  { name: 'Thokkottu', address: 'Thokkottu Branch', type: 'Branch', phone: '+91 0000000000', isPublished: true },
  { name: 'Sullia', address: 'Sullia Branch', type: 'Branch', phone: '+91 0000000000', isPublished: true },
  { name: 'Kadaba', address: 'Kadaba Branch', type: 'Branch', phone: '+91 0000000000', isPublished: true },
  { name: 'Uppinangady', address: 'Uppinangady Branch', type: 'Branch', phone: '+91 0000000000', isPublished: true }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');
    
    const count = await Branch.countDocuments();
    if (count === 0) {
      await Branch.insertMany(originalBranches);
      console.log('Successfully seeded original branches!');
    } else {
      console.log('Branches already exist, skipping seed.');
    }
  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    mongoose.connection.close();
  }
}

seed();
