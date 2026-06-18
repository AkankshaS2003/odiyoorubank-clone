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
    /className="bg-\\[#0F4C81\\] min-h-screen py-8 print:py-0 print:bg-white text-slate-800"/g,
    'className="bg-slate-50 min-h-screen py-8 print:py-0 print:bg-white text-slate-800"'
  );
  
  // 2. Change text-slate-800 to text-[#0F4C81] in InputField and SelectField
  const inputClassSearch = `className=\`w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0F4C81] outline-none transition-all text-sm font-medium text-slate-800 bg-white print:border-b print:border-t-0 print:border-l-0 print:border-r-0 print:rounded-none print:px-0 print:py-1 print:bg-transparent capitalize \${readOnly ? 'bg-slate-50' : ''}\``;
  const inputClassReplace = `className=\`w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0F4C81] outline-none transition-all text-sm font-medium text-[#0F4C81] bg-white print:border-b print:border-t-0 print:border-l-0 print:border-r-0 print:rounded-none print:px-0 print:py-1 print:bg-transparent capitalize \${readOnly ? 'bg-slate-50' : ''}\``;
  content = content.replace(inputClassSearch, inputClassReplace);

  const selectClassSearch = `className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0F4C81] outline-none transition-all text-sm font-medium text-slate-800 bg-white print:border-b print:border-t-0 print:border-l-0 print:border-r-0 print:rounded-none print:px-0 print:py-1 print:appearance-none print:bg-transparent"`;
  const selectClassReplace = `className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0F4C81] outline-none transition-all text-sm font-medium text-[#0F4C81] bg-white print:border-b print:border-t-0 print:border-l-0 print:border-r-0 print:rounded-none print:px-0 print:py-1 print:appearance-none print:bg-transparent"`;
  content = content.replace(selectClassSearch, selectClassReplace);
  
  fs.writeFileSync(filePath, content);
  console.log('Updated ' + file);
});
