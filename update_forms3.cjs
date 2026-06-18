const fs = require('fs');
const path = require('path');

const files = [
  'VehicleLoanApplication.tsx',
  'PersonalLoanApplication.tsx',
  'MortgageLoanApplication.tsx',
  'HousingLoanApplication.tsx',
  'GoldLoanApplication.tsx',
  'EducationalLoanApplication.tsx',
  'DepositApplication.tsx'
];

files.forEach(file => {
  const filePath = path.join('e:/odiyoorubank-clone/src/pages', file);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 1. Revert background color
  content = content.replace(
    'className="bg-[#0F4C81] min-h-screen py-8 print:py-0 print:bg-white text-slate-800"',
    'className="bg-slate-50 min-h-screen py-8 print:py-0 print:bg-white text-slate-800"'
  );
  
  // 2. Change text-slate-800 to text-[#0F4C81] capitalize in InputField
  // We can just find the whole className string inside InputField
  // Let's replace 'text-slate-800 bg-white print:border-b' with 'text-[#0F4C81] capitalize bg-white print:border-b'
  content = content.replace(
    /text-slate-800 bg-white print:border-b/g,
    'text-[#0F4C81] capitalize bg-white print:border-b'
  );
  
  fs.writeFileSync(filePath, content);
  console.log('Updated ' + file);
});
