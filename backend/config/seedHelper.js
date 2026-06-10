const User = require('../models/User');
const KnowledgeBase = require('../models/KnowledgeBase');
const { getEmbedding } = require('../services/embeddingService');

const initialPolicies = [
  {
    title: "Fixed Deposit Rates",
    category: "Deposits",
    content: "Odiyooru Cooperative Bank offers the following Fixed Deposit (FD) interest rates: Savings Accounts earn 4.50% p.a. Senior Citizens get an additional 0.50% interest on all term deposits. Shareholders of the cooperative society earn a premium rate of 8.25% p.a. on term deposits for tenure above 1 year. Regular customers earn 7.75% p.a. for a 1-year deposit.",
    source: "seed_policies.txt"
  },
  {
    title: "Home Loan Policy",
    category: "Loans",
    content: "Apply for Home Loans at Odiyooru Cooperative Bank. We offer housing loans up to ₹25 Lakhs with attractive interest rates starting at 8.5% p.a. The maximum tenure is 20 years. Required documents include: Aadhaar Card, PAN Card, Income Tax Returns (ITR) for the last 2 years, last 6 months' bank statements, and land/property title deed documents.",
    source: "seed_policies.txt"
  },
  {
    title: "Branch Contact and Timings",
    category: "General",
    content: "Odiyooru Souharda Cooperative Society Ltd is located at Main Road, Odiyooru. Contact our branch at phone number +91 824 2441234 or email support@odiyoorubank.in. The bank operational timings are Monday to Friday from 9:30 AM to 4:30 PM, and Saturday from 9:30 AM to 1:30 PM. The branch is closed on Sundays and public holidays.",
    source: "seed_policies.txt"
  },
  {
    title: "Vehicle Loan Policy",
    category: "Loans",
    content: "We offer Vehicle Loans for both two-wheelers and four-wheelers. The interest rate is 9.5% p.a. with a maximum tenure of 7 years. You can check your eligibility online. Required documents: ID Proof (Aadhaar/PAN), Address Proof, last 3 months salary slips, and the vehicle quotation from the authorized dealer.",
    source: "seed_policies.txt"
  },
  {
    title: "Savings Account Benefits",
    category: "Deposits",
    content: "Odiyooru Cooperative Bank Savings Account benefits include a high interest rate of 4.5% p.a. paid quarterly. There is a low minimum balance requirement of ₹500. Account holders get free mobile banking, SMS alerts, and doorstep banking services for senior citizens.",
    source: "seed_policies.txt"
  }
];

const autoSeed = async () => {
  try {
    // 1. Seed Admin User
    const adminEmail = 'admin@odiyoorubank.in';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      await User.create({
        fullName: 'System Administrator',
        email: adminEmail,
        phone: '9888877777',
        password: 'adminpassword', // automatically encrypted by User schema hook
        role: 'admin'
      });
      console.log('🌱 Seeding: Created default admin user (admin@odiyoorubank.in / adminpassword)');
    }

    // Seed regular member for testing UI demo credentials
    const memberEmail = 'member@odiyoorubank.in';
    const existingMember = await User.findOne({ email: memberEmail });

    if (!existingMember) {
      await User.create({
        fullName: 'Demo Member',
        email: memberEmail,
        phone: '9876543210',
        password: 'password', // matches UI suggestion
        role: 'customer'
      });
      console.log('🌱 Seeding: Created default member user (member@odiyoorubank.in / password)');
    }

    // 2. Seed Initial RAG Policies
    const kbCount = await KnowledgeBase.countDocuments();
    if (kbCount === 0) {
      console.log('🌱 Seeding: Knowledge base is empty, indexing initial policies...');
      for (const policy of initialPolicies) {
        let embeddingVector;
        try {
          embeddingVector = await getEmbedding(policy.content);
        } catch (err) {
          // If offline or API key missing, fall back to mock 768-dimension vector
          embeddingVector = new Array(768).fill(0);
        }

        await KnowledgeBase.create({
          ...policy,
          embedding: embeddingVector
        });
      }
      console.log('🌱 Seeding: Successfully indexed 5 initial banking policies.');
    }
  } catch (error) {
    console.error('❌ Seeding: Auto seeding failed during database connection:', error.message);
  }
};

module.exports = { autoSeed };
