const fs = require('fs');
const path = require('path');

const files = [
  'backend/services/TransferService.js',
  'backend/controllers/accountController.js',
  'backend/controllers/fdController.js',
  'backend/controllers/membershipController.js'
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    console.log('Not found:', file);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  content = content.replace(/const session = await mongoose\.startSession\(\);/g, '// const session = await mongoose.startSession();');
  content = content.replace(/let session;/g, '// let session;');
  content = content.replace(/session = await mongoose\.startSession\(\);/g, '// session = await mongoose.startSession();');
  content = content.replace(/session\.startTransaction\(\);/g, '// session.startTransaction();');
  content = content.replace(/\.session\(session\)/g, '');
  content = content.replace(/\{ session \}/g, '{}');
  content = content.replace(/await session\.commitTransaction\(\);/g, '// await session.commitTransaction();');
  content = content.replace(/session\.endSession\(\);/g, '// session.endSession();');
  content = content.replace(/await session\.abortTransaction\(\);/g, '// await session.abortTransaction();');
  content = content.replace(/if \(session\) session\.endSession\(\);/g, '// if (session) session.endSession();');
  content = content.replace(/if \(session\) await session\.abortTransaction\(\);/g, '// if (session) await session.abortTransaction();');
  content = content.replace(/,\s*session\s*\}/g, '}');
  content = content.replace(/\{\s*session,\s*/g, '{');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Processed', file);
});
