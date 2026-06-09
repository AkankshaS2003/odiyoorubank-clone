const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const appFile = path.join(srcDir, 'App.tsx');
const contextDir = path.join(srcDir, 'context');
const langContextFile = path.join(contextDir, 'LanguageContext.tsx');

// 1. Read App.tsx
let appContent = fs.readFileSync(appFile, 'utf8');

// 2. Extract LanguageContext parts
// We'll extract from `export type Language = 'en';` (around line 19) down to `export const useLanguage = () => { ... };` (around line 990)
const startIndex = appContent.indexOf('export type Language');
const endIndex = appContent.indexOf('const AppContent: React.FC = () => {');

if (startIndex === -1 || endIndex === -1) {
  console.error("Could not find start or end index for LanguageContext in App.tsx");
  process.exit(1);
}

const extractedCode = appContent.slice(startIndex, endIndex);
appContent = appContent.slice(0, startIndex) + 
  "import { LanguageProvider, useLanguage } from './context/LanguageContext';\n\n" + 
  appContent.slice(endIndex);

// 3. Write LanguageContext.tsx
const langContextCode = `import React, { useState, createContext, useContext } from 'react';\n\n` + extractedCode;
if (!fs.existsSync(contextDir)) {
  fs.mkdirSync(contextDir);
}
fs.writeFileSync(langContextFile, langContextCode, 'utf8');

// 4. Update App.tsx
fs.writeFileSync(appFile, appContent, 'utf8');

// 5. Update imports in all other files
function replaceImports(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceImports(fullPath);
    } else if (fullPath.endsWith('.tsx') && fullPath !== appFile && fullPath !== langContextFile) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      
      // Calculate relative path to context/LanguageContext
      const relativePathToContext = path.relative(path.dirname(fullPath), langContextFile).replace(/\\/g, '/').replace('.tsx', '');
      const importPath = relativePathToContext.startsWith('.') ? relativePathToContext : './' + relativePathToContext;

      if (content.includes("from '../App'")) {
        content = content.replace(/from '\.\.\/App'/g, `from '${importPath}'`);
        changed = true;
      }
      if (content.includes("from '../../App'")) {
        content = content.replace(/from '\.\.\/\.\.\/App'/g, `from '${importPath}'`);
        changed = true;
      }
      if (content.includes("from './App'")) {
        content = content.replace(/from '\.\/App'/g, `from '${importPath}'`);
        changed = true;
      }
      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
      }
    }
  }
}

replaceImports(srcDir);
console.log("Refactoring complete!");
