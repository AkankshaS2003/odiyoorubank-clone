const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'src', 'pages');
const files = fs.readdirSync(targetDir).filter(file => file.endsWith('.tsx') && (file.endsWith('Application.tsx') || file === 'FDDetailsPage.tsx'));

files.forEach(file => {
  const filePath = path.join(targetDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Look for `<div className="bg-white rounded-something shadow-something ...">`
  // that do NOT have `border` in them.
  // Actually, let's just find the first occurrence of `<div className="bg-white ` that is NOT followed by `border ` before the closing quote.
  
  content = content.replace(/<div className="bg-white ([^"]*?shadow-[^"]*?)"/g, (match, classes) => {
    if (!classes.includes('border ')) {
      return `<div className="bg-white ${classes} border border-slate-300"`;
    }
    return match;
  });

  // Also catch variations without bg-white at the start
  content = content.replace(/<div className="([^"]*?bg-white[^"]*?shadow-[^"]*?)"/g, (match, classes) => {
    if (!classes.includes('border ')) {
      return `<div className="${classes} border border-slate-300"`;
    }
    return match;
  });

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${file}`);
});
