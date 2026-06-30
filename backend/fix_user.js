const mongoose = require('mongoose');

async function fixUser() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/AK');
    const db = mongoose.connection.db;
    
    await db.collection('users').updateOne(
      { email: 'akshuus2003@gmail.com' },
      { $unset: { memberId: 1 } }
    );
    
    const user = await db.collection('users').findOne({ email: 'akshuus2003@gmail.com' });
    if(user) {
      await db.collection('savingsaccounts').deleteMany({ userId: user._id });
      console.log('Cleaned up dummy data for akshuus2003@gmail.com');
    }
    
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

fixUser();
