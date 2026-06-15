require('dotenv').config();
const { retrieveDocuments } = require('./services/retrievalService');

async function test() {
  try {
    console.log("Testing with ?");
    await retrieveDocuments([0.1, 0.2], 5, "What is the interest rate for FD deposits?");
    console.log("SUCCESS");
  } catch(e) {
    console.error("FAIL:", e);
  }
}
test().catch(console.error);
