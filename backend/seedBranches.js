const mongoose = require('mongoose');
const Branch = require('./models/Branch');

// MongoDB connection string - adjusting based on local setup. Let's use the one in server.js or default.
const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/odiyoorubank';

const branchesData = [
  {
    name: 'ಒಡಿಯೂರು',
    address: 'ಶ್ರೀ ಗುರುದೇವದತ್ತ ಸಂಸ್ಥಾನಮ್, ಒಡಿಯೂರು, ಬಂಟ್ವಾಳ.',
    phone: '08255-266950',
    type: 'Head Office',
    isPublished: true
  },
  {
    name: 'ಬಿಜೈ',
    address: 'ದೀಪಾ ಆರ್ಕೇಡ್ ಬಳಿ, ಬಿಜೈ, ಕಾಪಿಕಾಡ್, ಮಂಗಳೂರು.',
    phone: '0824-2210114',
    type: 'Branch',
    isPublished: true
  },
  {
    name: 'ಬಿ.ಸಿ. ರೋಡ್',
    address: '1ನೇ ಮಹಡಿ, ಡಾ. ಶ್ರೀನಿವಾಸ್ ರಾವ್ ಕಾಂಪ್ಲೆಕ್ಸ್, ಮುಖ್ಯರಸ್ತೆ, ಬಿ.ಸಿ.ರೋಡ್.',
    phone: '08255-231377',
    type: 'Branch',
    isPublished: true
  },
  {
    name: 'ಪುತ್ತೂರು',
    address: '1ನೇ ಮಹಡಿ, ಕಣ್ಣನ್ ಕಾಂಪ್ಲೆಕ್ಸ್, ಮುಖ್ಯರಸ್ತೆ, ಪುತ್ತೂರು.',
    phone: '08251-232011',
    type: 'Branch',
    isPublished: true
  },
  {
    name: 'ವಿಟ್ಲ',
    address: '1ನೇ ಮಹಡಿ, ರಾಧಾಶ್ರೀ ಕಾಂಪ್ಲೆಕ್ಸ್, ಮುಖ್ಯರಸ್ತೆ, ವಿಟ್ಲ.',
    phone: '08255-238124',
    type: 'Branch',
    isPublished: true
  },
  {
    name: 'ಪಂಪ್‌ವೆಲ್',
    address: '1ನೇ ಮಹಡಿ, ಭಗವತಿ ಕಾಂಪ್ಲೆಕ್ಸ್, ಕಪಿತಾನಿಯೋ ಶಾಲೆಯ ಎದುರು, ಪಂಪ್‌ವೆಲ್.',
    phone: '0824-2438114',
    type: 'Branch',
    isPublished: true
  },
  {
    name: 'ಕನ್ಯಾನ',
    address: 'ಶ್ರೀ ಗುರುದೇವ ಕೈಗಾರಿಕಾ ತರಬೇತಿ ಸಮುಚ್ಚಯ ಕಟ್ಟಡ, ಕನ್ಯಾನ, ಬಂಟ್ವಾಳ.',
    phone: '08255-266655',
    type: 'Branch',
    isPublished: true
  },
  {
    name: 'ಸುರತ್ಕಲ್',
    address: '1ನೇ ಮಹಡಿ, ಸುಮ ಟವರ್ಸ್, ಶಶಿಕಲಾ ರೈಸ್ ಮಿಲ್ಸ್, ಮಾರುಕಟ್ಟೆ ಕಾಂಪ್ಲೆಕ್ಸ್, ಎದುರುಗಡೆ.',
    phone: '0824-2475051',
    type: 'Branch',
    isPublished: true
  },
  {
    name: 'ತೊಕ್ಕೊಟ್ಟು',
    address: '1ನೇ ಮಹಡಿ, ಪ್ರಗತಿ ಕಾಂಪ್ಲೆಕ್ಸ್ ಬಸ್ ಸ್ಟ್ಯಾಂಡ್ ಎದುರುಗಡೆ, ತೊಕ್ಕೊಟ್ಟು.',
    phone: '0824-2989977',
    type: 'Branch',
    isPublished: true
  },
  {
    name: 'ಸುಳ್ಯ',
    address: '1ನೇ ಮಹಡಿ, ಆಶೀರ್ವಾದ್ ಕಾಂಪ್ಲೆಕ್ಸ್ ಎಪಿಎಂಸಿ ರಸ್ತೆ, ಸುಳ್ಯ.',
    phone: '08257-230011',
    type: 'Branch',
    isPublished: true
  },
  {
    name: 'ಉಪ್ಪಿನಂಗಡಿ',
    address: '1ನೇ ಮಹಡಿ, ಪಾರಿಜಾತ ಕಾಂಪ್ಲೆಕ್ಸ್ ಬಸ್ ನಿಲ್ದಾಣ ಬಳಿ, ಉಪ್ಪಿನಂಗಡಿ.',
    phone: '0824-252111',
    type: 'Branch',
    isPublished: true
  },
  {
    name: 'ಬೆಳ್ತಂಗಡಿ',
    address: '1ನೇ ಮಹಡಿ, ರಾಯಲ್ ಕಾಂಪ್ಲೆಕ್ಸ್ ರಾಮನಗರ, ಸಂತೆಕಟ್ಟೆ, ಬೆಳ್ತಂಗಡಿ.',
    phone: '08256-233111',
    type: 'Branch',
    isPublished: true
  },
  {
    name: 'ಕಾವೂರು',
    address: '1ನೇ ಮಹಡಿ, ಎವರ್ ಶೈನ್ ಕಾಂಪ್ಲೆಕ್ಸ್ ಪೊಲೀಸ್ ಸ್ಟೇಷನ್ ಬಳಿ, ಕಾವೂರು.',
    phone: '0824-2972274',
    type: 'Branch',
    isPublished: true
  },
  {
    name: 'ಕಡಬ',
    address: '1ನೇ ಮಹಡಿ, ಶಾಲೋಮ್ ಟವರ್ಸ್ ಮುಖ್ಯ ರಸ್ತೆ, ಕಡಬ.',
    phone: '08251-295811',
    type: 'Branch',
    isPublished: true
  },
  {
    name: 'ಮುಲ್ಕಿ',
    address: 'ಪುಂಜಾ ಆರ್ಕೇಡ್, ಕಾರ್ನಾಡ್, ಮುಲ್ಕಿ.',
    phone: '0824-2955111',
    type: 'Branch',
    isPublished: true
  },
  {
    name: 'ಮೂಡಬಿದ್ರಿ',
    address: 'ಶಾಶ್ವತ್ ಕಾಂಪ್ಲೆಕ್ಸ್, ವಿಜಯನಗರ, ಮೂಡಬಿದ್ರಿ.',
    phone: '08258-295611',
    type: 'Branch',
    isPublished: true
  },
  {
    name: 'ಈಶ್ವರಮಂಗಲ',
    address: 'ಓಂ ಸಂಕೀರ್ಣ, ಈಶ್ವರಮಂಗಲ.',
    phone: '08023902074',
    type: 'Branch',
    isPublished: true
  },
  {
    name: 'ಬೆಳ್ಮಣ್',
    address: '1ನೇ ಮಹಡಿ, ಸೂರಜ್ ಹಿಲ್ಸ್ ಬೆಳ್ಮಣ್, ಕಾರ್ಕಳ ತಾಲೂಕು.',
    phone: '08258-200514',
    type: 'Branch',
    isPublished: true
  }
];

const seedDB = async () => {
  try {
    require('dotenv').config();
    const uri = process.env.MONGODB_URI || mongoURI;
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    // Clear existing branches
    await Branch.deleteMany({});
    console.log('Cleared existing branches');

    // Insert new branches
    await Branch.insertMany(branchesData);
    console.log('Inserted new branches successfully!');

  } catch (err) {
    console.error('Error seeding DB:', err);
  } finally {
    mongoose.connection.close();
  }
};

seedDB();
