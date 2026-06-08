const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'context', 'LanguageContext.tsx');
let text = fs.readFileSync(filePath, 'utf8');

// Make kn and hi optional in TranslationDict
text = text.replace(/kn:\s*string;/g, 'kn?: string;');
text = text.replace(/hi:\s*string;/g, 'hi?: string;');

const lines = text.split('\n');
const newLines = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Skip lines that define the translations for 'kn' and 'hi'
  if (line.match(/^\s*(kn|hi):\s*['"`]/)) {
    continue;
  }
  
  newLines.push(line);
}

fs.writeFileSync(filePath, newLines.join('\n'));
console.log('Successfully cleaned LanguageContext.tsx');
