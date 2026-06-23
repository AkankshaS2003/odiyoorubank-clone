const fs = require('fs');
let content = fs.readFileSync('src/pages/SavingsDepositApplication.tsx', 'utf8');

// Remove first useEffect (profile prefill)
content = content.replace(/useEffect\(\(\) => \{\s*\/\/ Attempt to load the current logged in user's savings profile by default[\s\S]*?\}, \[user\]\);/, '');

// Remove second useEffect (debounce auto-fetch)
content = content.replace(/useEffect\(\(\) => \{\s*const timer = setTimeout\(\(\) => \{\s*if \(customerIdInput && customerIdInput\.length >= 3\) \{\s*handleCustomerLookup\(\);\s*\}\s*\}, 500\);\s*return \(\) => clearTimeout\(timer\);\s*\}, \[customerIdInput\]\);/, '');

// Fix value assignment
content = content.replace(
  /value=\{customerIdInput \? \(customerInfo\?\.savingsAccountNumber \|\| ''\) : \(savingsAccount\?\.accountNumber \|\| ''\)\}/g,
  "value={customerInfo?.savingsAccountNumber || ''}"
);

fs.writeFileSync('src/pages/SavingsDepositApplication.tsx', content);
console.log('Removed auto-fetch and pre-fill from SavingsDepositApplication');
