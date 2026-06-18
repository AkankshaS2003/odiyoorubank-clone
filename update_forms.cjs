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
  
  // 1. Capitalize input
  const searchClass = `className=\`w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0F4C81] outline-none transition-all text-sm font-medium text-slate-800 bg-white print:border-b print:border-t-0 print:border-l-0 print:border-r-0 print:rounded-none print:px-0 print:py-1 print:bg-transparent \${readOnly ? 'bg-slate-50' : ''}\``;
  const replaceClass = `className=\`w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0F4C81] outline-none transition-all text-sm font-medium text-slate-800 bg-white print:border-b print:border-t-0 print:border-l-0 print:border-r-0 print:rounded-none print:px-0 print:py-1 print:bg-transparent capitalize \${readOnly ? 'bg-slate-50' : ''}\``;
  content = content.replace(searchClass, replaceClass);
  
  // 2. Background color
  content = content.replace(
    /className="bg-slate-50 min-h-screen py-8 print:py-0 print:bg-white text-slate-800"/g,
    'className="bg-[#0F4C81] min-h-screen py-8 print:py-0 print:bg-white text-slate-800"'
  );
  
  // 3. Photo validation
  if (content.includes('photoFile')) {
    const submitRegex = /(const handleSubmit = async \(e: React\.FormEvent\) => \{\s+e\.preventDefault\(\);)/;
    content = content.replace(submitRegex, '$1\n    if (!photoFile) {\n      alert("Please upload the required photo.");\n      return;\n    }');
  }
  
  fs.writeFileSync(filePath, content);
  console.log('Updated ' + file);
});
