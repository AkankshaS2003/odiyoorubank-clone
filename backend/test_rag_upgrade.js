const dotenv = require('dotenv');
dotenv.config();

const { understandQuery } = require('./services/geminiService');
const { calculateLoanEMI, calculateFD, calculateRD } = require('./services/calculatorService');

const run = async () => {
  console.log("--- TESTING CALCULATION SERVICE ---");
  const emi = calculateLoanEMI(500000, 8.5, 60);
  console.log("Loan EMI (5 lakh, 8.5%, 5 years):", emi);
  
  const fd = calculateFD(200000, 8.5, 24);
  console.log("FD Payout (2 lakh, 8.5%, 2 years):", fd);

  const rd = calculateRD(5000, 7.75, 36);
  console.log("RD Payout (5k/mo, 7.75%, 3 years):", rd);

  console.log("\n--- TESTING GEMINI QUERY UNDERSTANDING ---");
  const test1 = await understandQuery("If I borrow ₹5 lakh for 5 years, what will my EMI be?", []);
  console.log("Test 1 (EMI Query):", JSON.stringify(test1, null, 2));

  const test2 = await understandQuery("Can I put ₹5000 every month for 3 years?", []);
  console.log("Test 2 (RD query):", JSON.stringify(test2, null, 2));

  const test3 = await understandQuery("What if I borrow it for 7 years?", [
    { sender: 'user', text: "What is the home loan interest rate?" },
    { sender: 'assistant', text: "Home Loan interest rate is 8.25% p.a." },
    { sender: 'user', text: "What if I take ₹5 lakh?" },
    { sender: 'assistant', text: "For a Home Loan of ₹5,00,000 at 8.25% interest rate..." }
  ]);
  console.log("Test 3 (Follow up):", JSON.stringify(test3, null, 2));

  process.exit(0);
};

run().catch(err => {
  console.error(err);
  process.exit(1);
});
