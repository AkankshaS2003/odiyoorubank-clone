const fs = require('fs');
const path = require('path');
const dir = 'e:/odiyoorubank-clone/src/pages';
const files = fs.readdirSync(dir).filter(f => f.includes('LoanApplication'));

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace labels
  content = content.replace(/label="Loan Tenure"/g, 'label="Loan Tenure (in Years)"');
  content = content.replace(/label="Tenure"/g, 'label="Tenure (in Years)"');
  content = content.replace(/label="Course Duration"/g, 'label="Course Duration (in Years)"');

  // Replace placeholders
  content = content.replace(/e\.g\., \d+ Months/g, 'e.g., 5 Years');
  content = content.replace(/e\.g\., \d+ months/g, 'e.g., 5 Years');

  // Replace AgriculturalLoan options array
  content = content.replace(/options=\{\['6 Months', '12 Months', '24 Months', '36 Months', '60 Months'\]\}/g, 
                            "options={['1 Year', '2 Years', '3 Years', '4 Years', '5 Years']}");

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated ' + file);
});
