const fs = require('fs');
const path = require('path');

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
files.filter(f => f.endsWith('.tsx')).forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  // Replace "string" || 'default' with "string"
  content = content.replace(/"([^"]*)" \|\| '[^']*'/g, '""');
  
  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
  }
});

// Also fix Navbar.tsx extra div
const navPath = path.join(__dirname, '../src/components/Navbar.tsx');
let navContent = fs.readFileSync(navPath, 'utf8');
navContent = navContent.replace(/<\/div><\/div><div className="pt-6 border-t border-slate-100 flex flex-col space-y-3">/g, '</div><div className="pt-6 border-t border-slate-100 flex flex-col space-y-3">');
fs.writeFileSync(navPath, navContent, 'utf8');
