const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });
const RecurringDeposit = require('./models/RecurringDeposit');
const RDInstallment = require('./models/RDInstallment');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/AK')
  .then(async () => {
    const rd = await RecurringDeposit.findOne({ rdNumber: 'RD00001' });
    console.log('RD installmentsPaid:', rd.installmentsPaid, 'pendingInstallments:', rd.pendingInstallments);
    
    const installments = await RDInstallment.find({ rdId: rd._id }).sort({ installmentNumber: 1 });
    installments.forEach(inst => {
      console.log(`Installment ${inst.installmentNumber}: ${inst.status}`);
    });
    
    // Fix it to 1 paid, 11 pending
    for (let i = 0; i < installments.length; i++) {
        const inst = installments[i];
        if (i === 0) {
            inst.status = 'Paid';
        } else {
            inst.status = 'Pending';
            inst.paidDate = null;
        }
        await inst.save();
    }
    
    rd.installmentsPaid = 1;
    rd.pendingInstallments = 11;
    rd.totalDeposited = rd.monthlyAmount;
    await rd.save();
    
    console.log('Fixed to 1 paid, 11 pending.');

    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
