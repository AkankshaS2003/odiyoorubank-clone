const fs = require('fs');
let content = fs.readFileSync('src/pages/SavingsDepositApplication.tsx', 'utf8');

// 1. Remove purpose from createDepositOrder
content = content.replace(
  /amountInWords: numberToWords\(Number\(amount\)\),\s*purpose,\s*signature:/,
  `amountInWords: numberToWords(Number(amount)),
        purpose: 'Personal Savings',
        signature:`
);

// 2. Remove Purpose UI section completely
const purposeStartStr = `              <div>\n                <label className="block text-[10px] font-bold text-[#0F4C81] mb-1 uppercase tracking-wider">Purpose of Deposit <span className="text-rose-500">*</span></label>`;
const purposeStartIndex = content.indexOf(purposeStartStr);
if (purposeStartIndex !== -1) {
  const purposeEndIndex = content.indexOf('</div>', purposeStartIndex) + 6;
  const outerEndIndex = content.indexOf('</div>', purposeEndIndex) + 6; 
  // Wait, the block is exactly:
  // <div> <label... > <select... > <option...> ... </select> </div>
  // Let me just replace by regex:
  content = content.replace(/<div>\s*<label className="block text-\[10px\] font-bold text-\[#0F4C81\] mb-1 uppercase tracking-wider">Purpose of Deposit <span className="text-rose-500">\*<\/span><\/label>\s*<select[\s\S]*?<\/select>\s*<\/div>/, '');
}

fs.writeFileSync('src/pages/SavingsDepositApplication.tsx', content);
console.log('SavingsDepositApplication updated purpose');
