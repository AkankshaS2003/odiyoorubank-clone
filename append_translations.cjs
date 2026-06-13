const fs = require('fs');

const newTranslations = {
  "Secure Login": "ಸುರಕ್ಷಿತ ಲಾಗಿನ್",
  "Member Registration": "ಸದಸ್ಯ ನೋಂದಣಿ",
  "Password Recovery": "ಪಾಸ್‌ವರ್ಡ್ ಮರುಪಡೆಯುವಿಕೆ",
  "Set New Password": "ಹೊಸ ಪಾಸ್‌ವರ್ಡ್ ಹೊಂದಿಸಿ",
  "Full Name": "ಪೂರ್ಣ ಹೆಸರು",
  "Password": "ಪಾಸ್‌ವರ್ಡ್",
  "New Password": "ಹೊಸ ಪಾಸ್‌ವರ್ಡ್",
  "Confirm Password": "ಪಾಸ್‌ವರ್ಡ್ ಖಚಿತಪಡಿಸಿ",
  "Remember me": "ನನ್ನನ್ನು ನೆನಪಿಡಿ",
  "Log in Securely": "ಸುರಕ್ಷಿತವಾಗಿ ಲಾಗಿನ್ ಮಾಡಿ",
  "Register Account": "ಖಾತೆ ನೋಂದಾಯಿಸಿ",
  "Send Reset Link": "ಮರುಹೊಂದಿಸುವ ಲಿಂಕ್ ಕಳುಹಿಸಿ",
  "Update Password": "ಪಾಸ್‌ವರ್ಡ್ ನವೀಕರಿಸಿ",
  "Don't have an account?": "ಖಾತೆ ಇಲ್ಲವೇ?",
  "Already have an account?": "ಈಗಾಗಲೇ ಖಾತೆ ಹೊಂದಿದ್ದೀರಾ?",
  "Sign up": "ಸೈನ್ ಅಪ್",
  "Back to Log in": "ಲಾಗಿನ್‌ಗೆ ಹಿಂತಿರುಗಿ",
  "Continue with Google": "ಗೂಗಲ್‌ನೊಂದಿಗೆ ಮುಂದುವರಿಯಿರಿ",
  "Active Customer Portal": "ಸಕ್ರಿಯ ಗ್ರಾಹಕ ಪೋರ್ಟಲ್",
  "Customer ID:": "ಗ್ರಾಹಕ ಐಡಿ:",
  "Customer ID": "ಗ್ರಾಹಕ ಐಡಿ",
  "Return to Website": "ವೆಬ್‌ಸೈಟ್‌ಗೆ ಹಿಂತಿರುಗಿ",
  "View Products": "ಉತ್ಪನ್ನಗಳನ್ನು ವೀಕ್ಷಿಸಿ",
  "Digital Membership Card": "ಡಿಜಿಟಲ್ ಸದಸ್ಯತ್ವ ಕಾರ್ಡ್",
  "Official society shareholder ID. Keep this secure.": "ಅಧಿಕೃತ ಸಂಘದ ಷೇರುದಾರರ ಐಡಿ. ಇದನ್ನು ಸುರಕ್ಷಿತವಾಗಿರಿಸಿ.",
  "Account Details": "ಖಾತೆ ವಿವರಗಳು",
  "Registered Branch": "ನೋಂದಾಯಿತ ಶಾಖೆ",
  "Odiyooru Main Branch": "ಒಡಿಯೂರು ಮುಖ್ಯ ಶಾಖೆ",
  "Need Assistance?": "ಸಹಾಯ ಬೇಕೇ?",
  "Our support team is available 24/7 to help you with your account inquiries, branch details, and general services.": "ನಿಮ್ಮ ಖಾತೆ ವಿಚಾರಣೆಗಳು, ಶಾಖೆಯ ವಿವರಗಳು ಮತ್ತು ಸಾಮಾನ್ಯ ಸೇವೆಗಳ ಬಗ್ಗೆ ನಿಮಗೆ ಸಹಾಯ ಮಾಡಲು ನಮ್ಮ ಬೆಂಬಲ ತಂಡ 24/7 ಲಭ್ಯವಿದೆ.",
  "Contact Support": "ಬೆಂಬಲವನ್ನು ಸಂಪರ್ಕಿಸಿ"
};

let content = fs.readFileSync('src/context/LanguageContext.tsx', 'utf8');

// Find the end of the translations object
const endMarker = "\n};\n\ninterface LanguageContextType {";
const insertionIndex = content.indexOf(endMarker);

if (insertionIndex === -1) {
    console.error("Could not find end of translations object");
    process.exit(1);
}

let newKeysStr = ",\n\n  // --- Dynamic Added ---\n";
for (const [en, kn] of Object.entries(newTranslations)) {
    const safeEn = en.replace(/'/g, "\\'").replace(/\n/g, " ");
    const safeKn = kn.replace(/'/g, "\\'").replace(/\n/g, " ");
    newKeysStr += `  '${safeEn}': {\n    en: '${safeEn}',\n    kn: '${safeKn}'\n  },\n`;
}
// Remove trailing comma
newKeysStr = newKeysStr.slice(0, -2);

const finalContent = content.slice(0, insertionIndex) + newKeysStr + content.slice(insertionIndex);

fs.writeFileSync('src/context/LanguageContext.tsx', finalContent);
console.log("Appended new translations successfully.");
