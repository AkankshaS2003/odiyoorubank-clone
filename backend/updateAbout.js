const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
mongoose.connect(process.env.MONGO_URI).then(async () => {
  const db = mongoose.connection.db;
  await db.collection('systemsettings').updateOne({}, { $set: { aboutText: 'Odiyooru Souharda Cooperative Society Ltd is a premier cooperative financial institution established on 20-04-2011, dedicated to empowering communities and micro-merchants through reliable deposits, gold loans, and absolute financial security. Guided by values of trust, progress, and co-ownership, we have been a trusted partner in rural growth and self-reliance for over a decade.' } });
  console.log('Updated DB text');
  process.exit(0);
}).catch(console.error);
