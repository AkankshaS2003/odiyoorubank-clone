const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  try {
    const KnowledgeBase = require('./models/KnowledgeBase');
    const rewrittenQuery = "What are the bank timings and operational hours?";
    const words = rewrittenQuery.split(' ').filter(w => w.length > 3 && !['what','when','where','how','are','the','this','that'].includes(w.toLowerCase()));
    
    console.log("Words:", words);
    if (words.length > 0) {
       const regexStr = words.join('|');
       console.log("Regex:", regexStr);
       const fallbackDocs = await KnowledgeBase.find({ content: { $regex: regexStr, $options: 'i' } }).limit(2);
       console.log("Found docs:", fallbackDocs.length);
       if (fallbackDocs.length > 0) {
         console.log("First doc title:", fallbackDocs[0].title);
       }
    }
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
});
