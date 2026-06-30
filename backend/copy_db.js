const mongoose = require('mongoose');

async function copyDatabase() {
  try {
    const srcUri = 'mongodb://127.0.0.1:27017/odiyoorubank';
    const destUri = 'mongodb://127.0.0.1:27017/AK';

    const srcConn = await mongoose.createConnection(srcUri).asPromise();
    const destConn = await mongoose.createConnection(destUri).asPromise();

    console.log('Connected to both databases. Dropping AK...');
    await destConn.dropDatabase();
    console.log('AK database dropped.');

    const collections = await srcConn.db.listCollections().toArray();
    
    for (const c of collections) {
      const collName = c.name;
      const docs = await srcConn.db.collection(collName).find({}).toArray();
      
      if (docs.length > 0) {
        await destConn.db.collection(collName).insertMany(docs);
        console.log(`Copied ${docs.length} documents for collection: ${collName}`);
      } else {
        console.log(`Skipped empty collection: ${collName}`);
      }
    }

    console.log('Database copy completed successfully.');
    await srcConn.close();
    await destConn.close();
  } catch (err) {
    console.error('Error during copy:', err);
  }
}

copyDatabase();
