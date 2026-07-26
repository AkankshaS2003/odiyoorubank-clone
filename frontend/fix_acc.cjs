const fs = require('fs');
let content = fs.readFileSync('backend/controllers/accountController.js', 'utf8');

const correctCode = `      if (customer) {
        const SavingsAccount = require('../models/SavingsAccount');
        savingsAccount = await SavingsAccount.findOne({ userId: customer._id });
      }
    
    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    res.status(200).json({
      success: true,
      data: { ...customer.toObject(), savingsAccountNumber: savingsAccount ? savingsAccount.accountNumber : null }
    });
  } catch (error) {
    next(error);
  }
};`;

content = content.replace(
  /if \(customer\) \{\s*const SavingsAccount = require\('\.\.\/models\/SavingsAccount'\);\s*savingsAccount = await SavingsAccount\.findOne\(\{ userId: customer\._id \}\);\s*/,
  correctCode + '\n\n'
);

fs.writeFileSync('backend/controllers/accountController.js', content);
console.log('Fixed syntax error in accountController.js');
