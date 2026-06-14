const mongoose = require('mongoose');
const Branch = require('./models/Branch');

const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/odiyoorubank';

const branchesData = [
  {
    name: 'Odiyooru',
    address: 'Sri Gurudevadatta Samsthanam, Odiyooru, Bantwal.',
    phone: '08255-266950',
    type: 'Head Office',
    isPublished: true
  },
  {
    name: 'Bijai',
    address: 'Near Deepa Arcade, Bijai, Kapikad, Mangaluru.',
    phone: '0824-2210114',
    type: 'Branch',
    isPublished: true
  },
  {
    name: 'B.C. Road',
    address: '1st Floor, Dr. Srinivas Rao Complex, Main Road, B.C. Road.',
    phone: '08255-231377',
    type: 'Branch',
    isPublished: true
  },
  {
    name: 'Puttur',
    address: '1st Floor, Kannan Complex, Main Road, Puttur.',
    phone: '08251-232011',
    type: 'Branch',
    isPublished: true
  },
  {
    name: 'Vitla',
    address: '1st Floor, Radhashree Complex, Main Road, Vitla.',
    phone: '08255-238124',
    type: 'Branch',
    isPublished: true
  },
  {
    name: 'Pumpwell',
    address: '1st Floor, Bhagavathi Complex, Opposite Capitanio School, Pumpwell.',
    phone: '0824-2438114',
    type: 'Branch',
    isPublished: true
  },
  {
    name: 'Kanyana',
    address: 'Sri Gurudeva Industrial Training Complex Building, Kanyana, Bantwal.',
    phone: '08255-266655',
    type: 'Branch',
    isPublished: true
  },
  {
    name: 'Surathkal',
    address: '1st Floor, Suma Towers, Shashikala Rice Mills, Opposite Market Complex, Surathkal.',
    phone: '0824-2475051',
    type: 'Branch',
    isPublished: true
  },
  {
    name: 'Thokkottu',
    address: '1st Floor, Pragathi Complex, Opposite Bus Stand, Thokkottu.',
    phone: '0824-2989977',
    type: 'Branch',
    isPublished: true
  },
  {
    name: 'Sullia',
    address: '1st Floor, Ashirvad Complex, APMC Road, Sullia.',
    phone: '08257-230011',
    type: 'Branch',
    isPublished: true
  },
  {
    name: 'Uppinangady',
    address: '1st Floor, Parijatha Complex, Near Bus Stand, Uppinangady.',
    phone: '0824-252111',
    type: 'Branch',
    isPublished: true
  },
  {
    name: 'Belthangady',
    address: '1st Floor, Royal Complex, Ramanagar, Santhekatte, Belthangady.',
    phone: '08256-233111',
    type: 'Branch',
    isPublished: true
  },
  {
    name: 'Kavoor',
    address: '1st Floor, Ever Shine Complex, Near Police Station, Kavoor.',
    phone: '0824-2972274',
    type: 'Branch',
    isPublished: true
  },
  {
    name: 'Kadaba',
    address: '1st Floor, Shalom Towers, Main Road, Kadaba.',
    phone: '08251-295811',
    type: 'Branch',
    isPublished: true
  },
  {
    name: 'Mulki',
    address: 'Punja Arcade, Karnad, Mulki.',
    phone: '0824-2955111',
    type: 'Branch',
    isPublished: true
  },
  {
    name: 'Moodabidri',
    address: 'Shashwath Complex, Vijayanagar, Moodabidri.',
    phone: '08258-295611',
    type: 'Branch',
    isPublished: true
  },
  {
    name: 'Eshwaramangala',
    address: 'Om Sankirna, Eshwaramangala.',
    phone: '08023902074',
    type: 'Branch',
    isPublished: true
  },
  {
    name: 'Belman',
    address: '1st Floor, Suraj Hills Belman, Karkala Taluk.',
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
