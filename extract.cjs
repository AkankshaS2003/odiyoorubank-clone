const fs = require('fs');
const content = fs.readFileSync('src/context/LanguageContext.tsx', 'utf8');
const matches = [...content.matchAll(/en:\s*(['"`])(.*?)\1/g)];
console.log(JSON.stringify(matches.map(m => m[2])));
