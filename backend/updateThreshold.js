require('dotenv').config();
const mongoose = require('mongoose');
const SystemSettings = require('./models/SystemSettings');

async function updateThreshold() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  const settings = await SystemSettings.findOne();
  if (settings) {
    if (settings.faceVerificationThreshold > 0.45) {
      settings.faceVerificationThreshold = 0.45;
      await settings.save();
      console.log("Updated existing settings face verification threshold to 0.60");
    } else {
      console.log("Threshold is already 0.60 or higher");
    }
  } else {
    console.log("No settings found, skipping.");
  }

  mongoose.disconnect();
}

updateThreshold().catch(err => {
  console.error(err);
  mongoose.disconnect();
});
