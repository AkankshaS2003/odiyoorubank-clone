const fs = require('fs');
let lines = fs.readFileSync('src/pages/AccountApplication.tsx', 'utf8').split('\n');
let newLines = [];
let skip = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  if (line.includes('const [verificationResult, setVerificationResult]')) {
    skip = true;
  }
  if (skip && line.includes('aadhaarFaceImage')) {
    // skip this line
    continue;
  }
  if (skip && line.includes('} | null>(null);')) {
    skip = false;
    continue;
  }
  if (skip) continue;

  if (line.includes('const [threshold, setThreshold]')) continue;
  if (line.includes('faceVerificationThreshold')) continue;
  if (line.includes('setThreshold(')) continue;

  // handleSubmit checks
  if (line.includes('if (!verificationResult) {')) {
    skip = true;
    continue;
  }
  if (skip && line.includes('}')) {
    skip = false;
    continue;
  }

  if (line.includes("if (verificationResult.status !== 'Face Verified') {")) {
    skip = true;
    continue;
  }

  if (line.includes('await api.post(\'/account/verify-face\',')) {
    // Wait, this is wrapped in try-catch. I'll just remove the whole try-catch
    skip = true;
    // Walk backwards and remove `try {`
    if (newLines[newLines.length-1].includes('try {')) {
        newLines.pop();
    }
    continue;
  }
  if (skip && line.includes('alert("Account created')) {
      // keep skipping
      continue;
  }
  if (skip && line.includes('}')) {
      skip = false;
      continue;
  }

  if (line.includes('{/* PAGE 4: FACE VERIFICATION */}')) {
      skip = true;
      continue;
  }
  if (skip && line.includes('<div className="flex justify-between mt-8">')) {
      skip = false;
      newLines.push(line);
      continue;
  }

  if (line.includes('<button type="submit"')) {
      // clean up button class
      let btnLine = line.replace(/disabled=\{!verificationResult\}/g, '');
      btnLine = btnLine.replace(/\$\{\!verificationResult \? 'bg-gray-400 cursor-not-allowed' : 'bg-\\[#ED7F1E\\] hover:bg-\\[#d66a10\\]'\}/g, 'bg-[#ED7F1E] hover:bg-[#d66a10]');
      newLines.push(btnLine);
      continue;
  }

  newLines.push(line);
}

fs.writeFileSync('src/pages/AccountApplication.tsx', newLines.join('\n'));
console.log("Replaced successfully!");
