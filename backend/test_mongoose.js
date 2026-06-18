const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({ name: String });
const TestModel = mongoose.model('Test', testSchema);

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/testdb');
  
  const doc = await TestModel.create({ name: 'Hello' });
  
  console.log(typeof doc.constructor.findByIdAndUpdate);
  
  await mongoose.disconnect();
}
run().catch(console.dir);
