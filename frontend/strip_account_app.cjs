const fs = require('fs');
let code = fs.readFileSync('src/pages/AccountApplication.tsx', 'utf8');

// 1. Remove import
code = code.replace(/import \{ FaceVerification \} from '\.\.\/components\/FaceVerification';\r?\n/, '');

// 2. Remove state
code = code.replace(/const \[verificationResult, setVerificationResult\] = useState<\{[\s\S]*?\} \| null>\(null\);\r?\n/, '');
code = code.replace(/const \[threshold, setThreshold\] = useState\(0\.45\);\r?\n/, '');

// 3. Remove fetch threshold inside useEffect
code = code.replace(/api\.get\('\/admin\/system-settings'\)[\s\S]*?\.catch\(err => console\.error\("Failed to load settings", err\)\);\r?\n/, '');

// 4. Remove verificationResult checks in handleSubmit
const check1 = `
    if (!verificationResult) {
      alert("Please complete Face Verification before submitting.");
      return;
    }

    if (verificationResult.status !== 'Face Verified') {
      alert("Face verification failed. Please try again or visit a branch for manual verification. Application cannot be submitted online.");
      return;
    }
`;
code = code.replace(check1, '');
const check2 = `    if (!verificationResult) {
      alert("Please complete Face Verification before submitting.");
      return;
    }

    if (verificationResult.status !== 'Face Verified') {
      alert("Face verification failed. Please try again or visit a branch for manual verification. Application cannot be submitted online.");
      return;
    }`;
code = code.replace(check2, '');

// Also fallback check
const check3 = `    if (!verificationResult) {\n      alert("Please complete Face Verification before submitting.");\n      return;\n    }\n\n    if (verificationResult.status !== 'Face Verified') {\n      alert("Face verification failed. Please try again or visit a branch for manual verification. Application cannot be submitted online.");\n      return;\n    }`;
code = code.replace(check3, '');

// 5. Remove verify-face API call
const verifyApi = `      try {
        await api.post('/account/verify-face', {
          faceVerificationStatus: verificationResult.status,
          similarityScore: verificationResult.score,
          aadhaarFaceImage: verificationResult.aadhaarFaceImage,
          selfieImage: verificationResult.selfieImage
        });
      } catch (err) {
        console.error("Failed to save face verification result", err);
        // We don't fail the whole submission if this fails, but maybe flag it.
        alert("Account created, but failed to securely save face verification. Admin review flagged.");
      }`;
code = code.replace(verifyApi, '');

// 6. Remove Step 4 (FACE VERIFICATION) UI
// I will use regex to find from {/* PAGE 4: FACE VERIFICATION */} to just before {/* PAGE 5: REVIEW */} or the <div className="flex justify-between mt-8"> block
code = code.replace(/\{\/\* PAGE 4: FACE VERIFICATION \*\/\}(.|\n)*?(?=\{\/\* PAGE 5: REVIEW \*\/\})/g, '');
code = code.replace(/\{\/\* PAGE 4: FACE VERIFICATION \*\/\}(.|\n)*?(?=\<div className="flex justify-between mt-8"\>)/g, '');

// 7. Update button disabled state
code = code.replace(/disabled=\{!verificationResult\}/g, '');
code = code.replace(/\$\{\!verificationResult \? 'bg-gray-400 cursor-not-allowed' : 'bg-\\[#ED7F1E\\] hover:bg-\\[#d66a10\\]'\}/g, 'bg-[#ED7F1E] hover:bg-[#d66a10]');

fs.writeFileSync('src/pages/AccountApplication.tsx', code);
console.log("Replaced successfully!");
