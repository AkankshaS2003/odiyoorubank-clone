const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  try {
    const KnowledgeBase = require('./models/KnowledgeBase');
    const docs = await KnowledgeBase.find({ content: { $regex: 'timing|hour', $options: 'i' } });
    console.log(`Found: ${docs.length}`);
    if (docs.length > 0) {
      console.log(docs[0].content);
    }
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
});
