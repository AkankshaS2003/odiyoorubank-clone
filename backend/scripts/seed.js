const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const KnowledgeBase = require('../models/KnowledgeBase');
const { getEmbedding } = require('../services/embeddingService');

// Load environment variables
dotenv.config();

const initialQA = [
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

const seedData = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('❌ MONGO_URI is missing from environment variables.');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas...');

    // 1. Seed Admin User
    const adminEmail = 'admin@odiyoorubank.in';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      const admin = await User.create({
        fullName: 'System Administrator',
        email: adminEmail,
        phone: '9888877777',
        password: 'adminpassword', // Auto-encrypted by schema pre-save
        role: 'admin',
        accountNumber: 'CB20268888'
      });
      console.log('✅ Admin User created successfully:');
      console.log(`   - Email: ${adminEmail}`);
      console.log(`   - Password: adminpassword`);
    } else {
      console.log('ℹ️ Admin User already exists in database.');
    }

    // 2. Seed Initial RAG Policies
    const count = await KnowledgeBase.countDocuments();
    if (count === 0) {
      console.log('Embedding and seeding bank policy documents...');
      for (const item of initialQA) {
        let embeddingVector;
        try {
          embeddingVector = await getEmbedding(item.content);
        } catch (err) {
          console.warn(`⚠️ Embedding generation failed for "${item.title}". Using fallback zero-vector. Reason: ${err.message}`);
          // Fall back to a mock 768-dimensional zero-vector for local development
          embeddingVector = new Array(768).fill(0);
        }

        await KnowledgeBase.create({
          ...item,
          embedding: embeddingVector
        });
        console.log(`   Indexed chunk: "${item.title}"`);
      }
      console.log('✅ Seeding initial RAG knowledge base completed!');
    } else {
      console.log(`ℹ️ KnowledgeBase already has ${count} items. Skipping policies seed.`);
    }

    console.log('🌱 Seeding process complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding execution failed:', error);
    process.exit(1);
  }
};

seedData();
