const fs = require('fs');
let content = fs.readFileSync('backend/controllers/accountController.js', 'utf8');

if (!content.includes('SavingsAccount.findOne')) {
  content = content.replace(
    /const customer = await User\.findOne\(\{ customerId \}\)\.select\('fullName email phone address dob aadharNumber panNumber'\);/,
    `const customer = await User.findOne({ customerId }).select('fullName email phone address dob aadharNumber panNumber');\n      let savingsAccount = null;\n      if (customer) {\n        const SavingsAccount = require('../models/SavingsAccount');\n        savingsAccount = await SavingsAccount.findOne({ userId: customer._id });\n      }`
  );

  content = content.replace(
    /return res\.status\(200\)\.json\(\{ success: true, data: customer \}\);/,
    `return res.status(200).json({ success: true, data: { ...customer.toObject(), savingsAccountNumber: savingsAccount ? savingsAccount.accountNumber : null } });`
  );

  fs.writeFileSync('backend/controllers/accountController.js', content);
  console.log('accountController updated for customer lookup');
}
