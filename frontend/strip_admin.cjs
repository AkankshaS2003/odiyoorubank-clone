const fs = require('fs');
let lines = fs.readFileSync('src/pages/AdminPanel.tsx', 'utf8').split('\n');
let newLines = [];
let skip = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  if (line.includes("{m.faceVerificationStatus === 'Manual Review Required'")) {
    skip = true;
    continue;
  }
  if (skip && line.includes("}")) {
      // Need to make sure we only skip the block.
      // The block is likely:
      // {m.faceVerificationStatus === 'Manual Review Required' && (
      //    ...
      // )}
  }
  
  if (skip) {
      if (line.trim() === ')}') {
          skip = false;
      }
      continue;
  }

  if (line.includes('faceVerificationThreshold: { value: string };')) continue;
  
  if (line.includes('faceVerificationThreshold: parseFloat')) {
      // Update SystemSettings form
      const newLine = line.replace(/faceVerificationThreshold: parseFloat\(target\.faceVerificationThreshold\.value\)/, '');
      newLines.push(newLine.replace(/,\s*\}/, '}').replace(/\{\s*,/, '{'));
      continue;
  }

  if (line.includes('<label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Face Verification Similarity Threshold')) {
      skip = true;
      continue;
  }
  if (skip && line.includes('</div>')) { // assume it's wrapped in a div
      skip = false;
      continue;
  }

  newLines.push(line);
}

fs.writeFileSync('src/pages/AdminPanel.tsx', newLines.join('\n'));
console.log("Replaced Admin successfully!");
