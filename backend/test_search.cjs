const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });
const RecurringDeposit = require('./models/RecurringDeposit');
const RDInstallment = require('./models/RDInstallment');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/AK')
  .then(async () => {
    const rd = await RecurringDeposit.findOne({ rdNumber: 'RD00001' });
    const installments = await RDInstallment.find({ rdId: rd._id }).sort({ installmentNumber: 1 });
    
    const paidCount = installments.filter(inst => inst.status === 'Paid').length;
    const pendingCount = installments.filter(inst => inst.status === 'Pending').length;
    const nextInstallment = installments.find(inst => inst.status === 'Pending' || inst.status === 'Overdue');
    
    console.log('paidCount:', paidCount);
    console.log('pendingCount:', pendingCount);
    console.log('nextInstallment num:', nextInstallment ? nextInstallment.installmentNumber : 'None');
    console.log('nextInstallment dueDate:', nextInstallment ? nextInstallment.dueDate : 'None');

    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
