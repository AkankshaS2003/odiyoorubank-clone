const fs = require('fs');

let code = fs.readFileSync('backend/controllers/loanController.js', 'utf8');

// 1. Update applyLoan to set status 'Pending Branch Verification' and send email
const applyLoanRegex = /const loan = await Loan\.create\(\{[\s\S]*?applicationDetails\r?\n    \}\);/;
const applyLoanReplace = `
    const loan = await Loan.create({
      userId: req.user._id,
      loanType,
      requestedAmount: amount,
      requestedTenure: tenure,
      income,
      uploadedDocuments,
      applicationDetails,
      status: 'Pending Branch Verification'
    });

    const emailMessage = \`Dear \${req.user.fullName},

Thank you for applying for a loan with Odiyooru Bank.

We have successfully received your loan application.

Before your loan application can be processed further, you are required to visit your selected branch for verification of your identity and original supporting documents.

Please carry the following original documents during your visit:

• Aadhaar Card
• PAN Card
• Income Proof
• Address Proof
• Salary Certificate / Business Documents (as applicable)
• Collateral or Property Documents (if applicable)
• Gold Documents (for Gold Loan)
• Any additional documents submitted with your loan application

Branch Name:
Main Branch

Loan Application Number:
\${loan.loanApplicationId}

Our loan officer will verify your documents and application details. Once the branch verification is completed, your loan application will proceed to the eligibility review and approval process.

You will be notified through email regarding every stage of your loan application.

If you have any questions, please contact your branch or our customer support team.

Thank you for choosing Odiyooru Bank.

Kind Regards,

Loan Processing Department
Odiyooru Bank\`;

    await sendNotification(req.user.email, 'Loan Application Received – Visit Branch for Verification', emailMessage);
`;

code = code.replace(applyLoanRegex, applyLoanReplace.trim());

// Also remove the old sendNotification that might exist
const oldSendNotif = /await sendNotification\(req\.user\.email, 'Loan Application Received', `Your application for \$\{loanType\} is under review\. ID: \$\{loan\.loanApplicationId\}`\);\r?\n/;
code = code.replace(oldSendNotif, '');

// 2. Enforce adminVerifyLoan requires Branch Verification Completed
const verifyLoanReq = /exports\.adminVerifyLoan = async \(req, res, next\) => \{\r?\n  try \{\r?\n    const \{ status, rejectionReason, sanctionAmount, interestRate, processingFee, tenure \} = req\.body;\r?\n\r?\n    const loan = await Loan\.findById\(req\.params\.id\)\.populate\('userId'\);\r?\n    if \(!loan\) return res\.status\(404\)\.json\(\{ success: false, message: 'Loan not found' \}\);/;
const verifyLoanReplace = `
exports.adminVerifyLoan = async (req, res, next) => {
  try {
    const { status, rejectionReason, sanctionAmount, interestRate, processingFee, tenure } = req.body;

    const loan = await Loan.findById(req.params.id).populate('userId');
    if (!loan) return res.status(404).json({ success: false, message: 'Loan not found' });
    
    if (loan.status !== 'Branch Verification Completed') {
      return res.status(400).json({ success: false, message: 'Branch Verification must be completed before reviewing this loan' });
    }
`;

code = code.replace(verifyLoanReq, verifyLoanReplace.trim());


// 3. Add adminCompleteBranchVerification
const adminCompleteBranchVerification = `
// @desc    Complete physical branch verification for Loan
// @route   PUT /api/loans/:id/branch-verification
// @access  Private/Admin
exports.adminCompleteBranchVerification = async (req, res, next) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) return res.status(404).json({ success: false, message: 'Loan not found' });
    
    if (loan.status !== 'Pending Branch Verification') {
      return res.status(400).json({ success: false, message: 'Loan is not pending branch verification' });
    }

    loan.status = 'Branch Verification Completed';
    await loan.save();

    res.status(200).json({ success: true, data: loan });
  } catch (error) {
    next(error);
  }
};
`;

code += '\n' + adminCompleteBranchVerification;

fs.writeFileSync('backend/controllers/loanController.js', code);
console.log("Updated loanController.js");
