const fs = require('fs');
let content = fs.readFileSync('src/components/Products.tsx', 'utf8');

content = content.replace(
  /interestRate: '10\.00% - 14\.50% p\.a\.',/,
  "interestRate: `${systemSettings?.vehicleLoanRate || 10.00}% p.a.`,"
);
content = content.replace(
  /interestRate: '11\.50% p\.a\.',/,
  "interestRate: `${systemSettings?.personalLoanRate || 11.50}% p.a.`,"
);
content = content.replace(
  /interestRate: '7\.90% p\.a\.',/,
  "interestRate: `${systemSettings?.educationalLoanRate || 7.90}% p.a.`,"
);
content = content.replace(
  /interestRate: '8\.25% p\.a\.',/,
  "interestRate: `${systemSettings?.housingLoanRate || 8.25}% p.a.`,"
);
content = content.replace(
  /interestRate: '9\.50% p\.a\.',/,
  "interestRate: `${systemSettings?.mortgageLoanRate || 9.50}% p.a.`,"
);
content = content.replace(
  /interestRate: '8\.50% p\.a\.',/,
  "interestRate: `${systemSettings?.agriculturalLoanRate || 8.50}% p.a.`,"
);

fs.writeFileSync('src/components/Products.tsx', content);
console.log('Products.tsx updated successfully.');
