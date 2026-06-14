const fs = require('fs');
const path = require('path');

// 1. App.tsx
const appPath = path.join(__dirname, '../src/App.tsx');
let appContent = fs.readFileSync(appPath, 'utf8');
appContent = appContent.replace(/<LanguageProvider>/g, '');
appContent = appContent.replace(/<\/LanguageProvider>/g, '');
fs.writeFileSync(appPath, appContent, 'utf8');

// 2. Navbar.tsx
const navPath = path.join(__dirname, '../src/components/Navbar.tsx');
let navContent = fs.readFileSync(navPath, 'utf8');

// Remove language state
navContent = navContent.replace(/const \[isLangDropdownOpen, setIsLangDropdownOpen\] = useState\(false\);\r?\n?/g, '');
navContent = navContent.replace(/const handleLanguageChange = \(lang: Language\) => \{[\s\S]*?setIsLangDropdownOpen\(false\);\r?\n\s*\};\r?\n?/g, '');
navContent = navContent.replace(/}, \[language\]\);/g, '}, []);');

// Remove Desktop Language Switcher
navContent = navContent.replace(/\{\/\* Language Switcher \*\/\}\s*<div className="relative group hidden sm:block">[\s\S]*?<\/div>\s*<\/div>\s*\{\/\* Notifications \*\/\}/g, '{/* Notifications */}');

// Remove Mobile Language Switcher
navContent = navContent.replace(/\{\/\* Mobile Language Switcher \*\/\}\s*<div className="mt-4 pt-4 border-t border-slate-100">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<div className="pt-6 border-t border-slate-100 flex flex-col space-y-3">/g, '</div></div><div className="pt-6 border-t border-slate-100 flex flex-col space-y-3">');

fs.writeFileSync(navPath, navContent, 'utf8');

// 3. Delete LanguageContext.tsx
const contextPath = path.join(__dirname, '../src/context/LanguageContext.tsx');
if (fs.existsSync(contextPath)) {
  fs.unlinkSync(contextPath);
}

// 4. Fix BranchLocator hoursKey
const branchPath = path.join(__dirname, '../src/components/BranchLocator.tsx');
let branchContent = fs.readFileSync(branchPath, 'utf8');
branchContent = branchContent.replace(/\{"hours_val"\}/g, '"Monday - Saturday: 09:30 AM - 04:30 PM (Closed on Sundays, 2nd & 4th Saturdays)"');
fs.writeFileSync(branchPath, branchContent, 'utf8');
