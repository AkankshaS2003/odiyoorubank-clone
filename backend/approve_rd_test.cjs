const mongoose = require('mongoose');
const User = require('./models/User');
const RecurringDeposit = require('./models/RecurringDeposit');
const RDInstallment = require('./models/RDInstallment');

async function run() {
  await mongoose.connect('mongodb://localhost:27017/AK');
  console.log('Connected to DB');

  const rd = await RecurringDeposit.findById('6a3e1d79d2ed4be8b20ba479');
  if (!rd) {
    console.log('RD not found');
    await mongoose.disconnect();
    return;
  }

  if (rd.status !== 'Pending Approval') {
    console.log('RD is already approved or not pending');
    await mongoose.disconnect();
    return;
  }

  const count = await RecurringDeposit.countDocuments({ status: { $ne: 'Pending Approval' } });
  const rdNumber = `RD${String(count + 1).padStart(5, '0')}`;
  
  rd.rdNumber = rdNumber;
  rd.status = 'Active';
  
  const today = new Date();
  rd.depositDate = today;
  const maturityDate = new Date(today);
  maturityDate.setMonth(maturityDate.getMonth() + rd.tenureMonths);
  rd.maturityDate = maturityDate;

  // Generate schedule
  const installments = [];
  for (let i = 1; i <= rd.tenureMonths; i++) {
    const dueDate = new Date(today);
    dueDate.setMonth(dueDate.getMonth() + (i - 1));
    installments.push({
      rdId: rd._id,
      installmentNumber: i,
      dueDate,
      amount: rd.monthlyAmount
    });
  }
  
  await RDInstallment.insertMany(installments);
  await rd.save();

  console.log('RD APPROVED AND ACTIVE!');
  console.log('RD Number:', rd.rdNumber);
  console.log('Installments generated:', installments.length);

  await mongoose.disconnect();
}

run();
