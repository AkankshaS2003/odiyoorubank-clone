const fs = require('fs');
const path = require('path');

const contextFile = fs.readFileSync(path.join(__dirname, '../src/context/LanguageContext.tsx'), 'utf8');
const translations = {};
const regex = /([a-zA-Z0-9_]+):\s*\{\s*en:\s*(['"])([\s\S]*?)\2,/g;
let match;
while ((match = regex.exec(contextFile)) !== null) {
  translations[match[1]] = match[3];
}

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      results.push(file);
    }
  });
  return results;
}

const files = walk(path.join(__dirname, '../src'));
let modifiedCount = 0;

function formatString(str) {
  if (translations[str]) return translations[str];
  return str;
}

files.filter(f => f.endsWith('.tsx') || f.endsWith('.ts')).forEach(file => {
  if (file.includes('LanguageContext.tsx')) return;
  
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  // Remove imports
  content = content.replace(/import\s+\{.*useLanguage.*\}\s+from\s+['"].*LanguageContext['"];?\r?\n?/g, '');
  content = content.replace(/import\s+type\s+\{.*Language.*\}\s+from\s+['"].*LanguageContext['"];?\r?\n?/g, '');
  
  // Remove hooks
  content = content.replace(/[ \t]*const\s+\{\s*(?:language,\s*setLanguage,\s*)?t\s*\}\s*=\s*useLanguage\(\);\r?\n?/g, '');
  content = content.replace(/[ \t]*const\s+\{\s*t\s*\}\s*=\s*useLanguage\(\);\r?\n?/g, '');
  
  // Replace t('key') with "Text"
  content = content.replace(/\bt\(['"](.*?)['"]\)/g, (m, key) => {
    const text = formatString(key);
    return '"' + text.replace(/"/g, '\\"') + '"';
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    modifiedCount++;
  }
});

console.log('Modified ' + modifiedCount + ' files.');
