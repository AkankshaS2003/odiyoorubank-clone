const fs = require('fs');

let text = fs.readFileSync('src/context/LanguageContext.tsx', 'utf8');

// Replace TranslationDict interface
text = text.replace(/interface TranslationDict \{[\s\S]*?\}/, 'interface TranslationDict {\n  [key: string]: string;\n}');

// Keep only English and flatten structure
// Matches: 
//   key: {
//     en: 'value',
//     kn: '...',
//     hi: '...'
//   }
text = text.replace(/([a-zA-Z0-9_]+):\s*\{\s*en:\s*(`[^`]*`|'[^']*'|"[^"]*")[\s\S]*?\}(,?)/g, '$1: $2$3');

// Update t function
text = text.replace(/const t = \(key: string\): string => \{[\s\S]*?\};/, 'const t = (key: string): string => {\n    return translations[key] || key;\n  };');

fs.writeFileSync('src/context/LanguageContext.tsx', text);
console.log('LanguageContext updated!');
