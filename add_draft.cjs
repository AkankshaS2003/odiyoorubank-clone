const fs = require('fs');
const files = [
  'src/pages/DepositApplication.tsx',
  'src/pages/GoldLoanApplication.tsx',
  'src/pages/VehicleLoanApplication.tsx',
  'src/pages/PersonalLoanApplication.tsx',
  'src/pages/MortgageLoanApplication.tsx',
  'src/pages/HousingLoanApplication.tsx',
  'src/pages/EducationalLoanApplication.tsx',
  'src/pages/AgriculturalLoanApplication.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const compName = file.match(/([^\/]+)\.tsx$/)[1];
  const draftKey = 'draft_' + compName;
  
  if (content.includes(draftKey)) return;

  const hookCode = `
  useEffect(() => {
    const draft = localStorage.getItem('${draftKey}');
    if (draft) {
      try {
        setFormData(JSON.parse(draft));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('${draftKey}', JSON.stringify(formData));
  }, [formData]);

  const handleChange =`;
  
  content = content.replace(/  const handleChange =/g, hookCode);
  content = content.replace(/setSuccess\(true\);/g, `localStorage.removeItem('${draftKey}');\n      setSuccess(true);`);

  fs.writeFileSync(file, content);
  console.log('Updated ' + file);
});
