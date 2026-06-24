const mongoose = require('mongoose');
require('dotenv').config();

const ServiceApplication = require('./models/ServiceApplication');
const FixedDeposit = require('./models/FixedDeposit');
const SystemSettings = require('./models/SystemSettings');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('Connected to DB');
  
  // 1. Get system settings for FD rate
  const settings = await SystemSettings.findOne();
  const fdRate = settings ? settings.fdRate : 8.5;
  console.log(`Using FD Rate: ${fdRate}%`);

  // 2. Find approved FD applications
  const apps = await ServiceApplication.find({ applicationType: 'Fixed Deposit', status: 'Approved' });
  console.log(`Found ${apps.length} approved FD applications`);

  let migrated = 0;

  for (let app of apps) {
    // 3. Check if already migrated
    const exists = await FixedDeposit.findOne({ userId: app.userId, depositDate: app.submittedAt });
    if (!exists) {
      // 4. Extract data from application payload
      // Typically payload has: { principal, tenure }
      let principal = 0;
      let tenureMonths = 12; // default
      let nomineeDetails = { name: '', relation: '', age: '' };

      if (app.formData) {
        if (app.formData.principalAmount) principal = Number(app.formData.principalAmount);
        else if (app.formData.amount) principal = Number(app.formData.amount);
        else if (app.formData.depositAmount) principal = Number(app.formData.depositAmount);

        if (app.formData.tenure) tenureMonths = parseInt(app.formData.tenure);
        else if (app.formData.tenureMonths) tenureMonths = parseInt(app.formData.tenureMonths);
        else if (app.formData.depositPeriod) tenureMonths = parseInt(app.formData.depositPeriod); // e.g. "12 Months" -> 12

        if (app.formData.nomineeName) nomineeDetails.name = app.formData.nomineeName;
        if (app.formData.nomineeRelation || app.formData.nomineeRelationship) nomineeDetails.relation = app.formData.nomineeRelation || app.formData.nomineeRelationship;
        if (app.formData.nomineeAge) nomineeDetails.age = app.formData.nomineeAge;
      }

      if (principal === 0) {
        console.log(`Skipping app for user ${app.userId} because principal is 0`);
        continue;
      }

      // Calculate quarterly compound interest
      const r = fdRate / 100;
      const n = 4; // Quarterly
      const t = tenureMonths / 12;
      const maturityAmount = principal * Math.pow(1 + (r / n), n * t);
      const interestEarned = maturityAmount - principal;

      // Dates
      const depositDate = new Date(app.submittedAt);
      const maturityDate = new Date(depositDate);
      maturityDate.setMonth(maturityDate.getMonth() + tenureMonths);

      // Generate FD number
      const fdCount = await FixedDeposit.countDocuments();
      const fdNumber = `FD${new Date().getFullYear()}${String(fdCount + 1).padStart(5, '0')}`;

      // Create new FD record
      const fd = new FixedDeposit({
        fdNumber,
        userId: app.userId,
        principalAmount: principal,
        interestRate: fdRate,
        compoundingFrequency: 'Quarterly',
        tenureMonths,
        depositDate,
        maturityDate,
        interestEarned: Math.round(interestEarned * 100) / 100,
        maturityAmount: Math.round(maturityAmount * 100) / 100,
        status: 'Active',
        nomineeDetails,
        linkedSavingsAccount: app.applicationData?.linkedSavingsAccount || null
      });

      await fd.save();
      console.log(`Migrated FD for user ${app.userId} - Principal: ${principal}, Maturity: ${maturityAmount}`);
      migrated++;
    }
  }

  console.log(`Migration Complete. Migrated ${migrated} records.`);
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
