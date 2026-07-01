const fs = require('fs');

let code = fs.readFileSync('backend/controllers/applicationController.js', 'utf8');

// 1. Update submitApplication
const submitReplaceStr = `
    const application = await AccountApplication.create({
      userId: req.user.id,
      nameAsAadhar,
      permanentAddress,
      currentAddress,
      occupation,
      dob,
      aadharNumber,
      panNumber,
      accountType,
      aadharDocumentUrl,
      panDocumentUrl,
      applicantPhotoBase64,
      formData,
      images,
      status: 'Pending Branch Verification'
    });

    const emailMessage = \`Dear \${req.user.fullName || nameAsAadhar},

Thank you for choosing Odiyooru Bank.

We have successfully received your Savings Account Opening Application.

Before your account can be activated, you are required to visit your selected branch for physical verification of your identity and original documents.

Please carry the following original documents during your visit:

• Aadhaar Card
• PAN Card
• Passport Size Photographs
• Address Proof (if applicable)
• Any additional documents submitted during the application process

Branch Name:
Main Branch

Application Number:
\${application._id}

Our bank representative will verify your documents and complete the account opening process. Once verification is successful, your Customer ID and Savings Account Number will be generated automatically, and you will receive another confirmation email.

If you have any questions, please contact your branch or our customer support team.

Thank you for choosing Odiyooru Bank.

Kind Regards,

Account Opening Department
Odiyooru Bank\`;

    await sendEmail({
      email: req.user.email,
      subject: 'Application Received – Visit Branch for Account Verification',
      message: emailMessage
    });
`;

code = code.replace(/const application = await AccountApplication\.create\(\{[\s\S]*?images\r?\n    \}\);/, submitReplaceStr.trim());

// 2. Add completeBranchVerification
const completeVerificationCode = `
// @desc    Complete physical branch verification
// @route   PUT /api/applications/:id/branch-verification
// @access  Private/Employee
exports.completeBranchVerification = async (req, res, next) => {
  try {
    let application = await AccountApplication.findById(req.params.id);
    if (!application) return res.status(404).json({ success: false, error: 'Application not found' });
    
    if (application.status !== 'Pending Branch Verification') {
      return res.status(400).json({ success: false, error: 'Application is not pending branch verification' });
    }

    application.status = 'Branch Verification Completed';
    await application.save();

    res.status(200).json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
};
`;

code += '\n' + completeVerificationCode;

// 3. Update updateApplicationStatus (Approval) to require Branch Verification Completed
code = code.replace(/if \(application\.status !== 'Pending'\) \{/, `if (application.status !== 'Branch Verification Completed') {`);

fs.writeFileSync('backend/controllers/applicationController.js', code);
console.log("Updated applicationController.js");
