const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });
const Branch = require('./models/Branch');

const originalBranches = [
  { name: 'Odiyoor (Head Office)', address: 'Shree Gurudevadatta Samsthana, Odiyoor, Bantwal.', type: 'Head Office', phone: '08255-266950', isPublished: true },
  { name: 'Bejai', address: 'Near Deepa Arcade, Bejai, Kapikad, Mangaluru.', type: 'Branch', phone: '0824-2210114', isPublished: true },
  { name: 'B.C. Road', address: '1st Floor, Dr. Srinivas Rao Complex, Main Road, B.C. Road.', type: 'Branch', phone: '08255-231377', isPublished: true },
  { name: 'Puttur', address: '1st Floor, Shan Complex, Main Road, Puttur.', type: 'Branch', phone: '08251-232011', isPublished: true },
  { name: 'Vittla', address: '1st Floor, Rajashree Complex, Main Road, Vittla.', type: 'Branch', phone: '08255-238124', isPublished: true },
  { name: 'Pumpwell', address: '1st Floor, Bhagavati Complex, Opposite Capitanio School, Pumpwell.', type: 'Branch', phone: '0824-2438114', isPublished: true },
  { name: 'Kanyana', address: 'Shree Gurudeva Krupanidhi Samiti Samucchaya Building, Kanyana, Bantwal.', type: 'Branch', phone: '08255-266655', isPublished: true },
  { name: 'Surathkal', address: '1st Floor, Nava Towers, Shashila Rice Mills, Opposite Market Complex, Surathkal.', type: 'Branch', phone: '0824-2475051', isPublished: true },
  { name: 'Thokkottu', address: '1st Floor, Pragathi Complex, Opposite Bus Stand, Thokkottu.', type: 'Branch', phone: '0824-2989977', isPublished: true },
  { name: 'Sullia', address: '1st Floor, Ashirvad Complex, APMC Road, Sullia.', type: 'Branch', phone: '08257-230011', isPublished: true },
  { name: 'Uppinangady', address: '1st Floor, Parijatha Complex, Near Bus Stand, Uppinangady.', type: 'Branch', phone: '0824-252111', isPublished: true },
  { name: 'Belthangady', address: '1st Floor, Royal Complex, Ramanagara, Santhekatte, Belthangady.', type: 'Branch', phone: '08256-233111', isPublished: true },
  { name: 'Kavoor', address: '1st Floor, Ever Shine Complex, Near Police Station, Kavoor.', type: 'Branch', phone: '0824-2972274', isPublished: true },
  { name: 'Kadaba', address: '1st Floor, Shalom Towers, Main Road, Kadaba.', type: 'Branch', phone: '08251-295811', isPublished: true },
  { name: 'Mulki', address: 'Poonja Arcade, Karnad, Mulki.', type: 'Branch', phone: '0824-2955111', isPublished: true },
  { name: 'Moodabidri', address: 'Shashwath Complex, Vijayanagar, Moodabidri.', type: 'Branch', phone: '08258-295611', isPublished: true },
  { name: 'Eshwaramangala', address: 'Om Sankeerna, Eshwaramangala.', type: 'Branch', phone: '08023902074', isPublished: true },
  { name: 'Belman', address: '1st Floor, Sooraj Hills Belman, Karkala Taluk.', type: 'Branch', phone: '08258-200514', isPublished: true },
  { name: 'Udupi', address: 'Vishal Arcade, 1st Floor, Vidyasamudra Road, Near Ammunje Petrol Bunk, Kalsanka-Geethanjali Road, Udupi.', type: 'Branch', phone: '0820-2009114', isPublished: true }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');
    
    // Clear all existing branches to replace them
    await Branch.deleteMany({});
    console.log('Cleared existing branches.');

    await Branch.insertMany(originalBranches);
    console.log(`Successfully seeded ${originalBranches.length} actual branches in English!`);
    
  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    mongoose.connection.close();
  }
}

seed();
