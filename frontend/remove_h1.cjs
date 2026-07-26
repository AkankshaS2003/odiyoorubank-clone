const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'src', 'pages');
const files = fs.readdirSync(targetDir).filter(file => file.endsWith('.tsx') && file.endsWith('Application.tsx'));

let changedFiles = 0;

files.forEach(file => {
  const filePath = path.join(targetDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Remove the H1 in the Controls section
  // It usually looks like:
  // <div className="flex justify-between items-center mb-6 print:hidden">
  //   <h1 className="text-2xl font-black text-[#0F4C81]">... Application</h1>
  //   <button ...
  
  // Or in AccountApplication.tsx:
  // <div className="flex justify-between items-center mb-4">
  //   <h1 className="text-2xl font-black text-[#0F4C81]">Account Opening Form</h1>
  
  // We can just find the h1 and remove it, and change justify-between to justify-end

  content = content.replace(/<div className="flex justify-between items-center ([^"]+)">\s*<h1 className="[^"]+">[^<]+<\/h1>/g, '<div className="flex justify-end items-center $1">');

  // For the border:
  // "and for every form add thin border ."
  // The paper container usually has: bg-white p-8 md:p-12 shadow-2xl shadow-slate-200 border border-slate-100
  // Or: bg-white rounded-3xl shadow-xl shadow-[#0F4C81]/5 border border-gray-100
  // Let's replace border-slate-100 with border-slate-300, and border-gray-100 with border-gray-300
  content = content.replace(/border-slate-100/g, 'border-slate-300');
  content = content.replace(/border-gray-100/g, 'border-gray-300');

  // Specifically for the form container:
  // Make sure it has a clear border, e.g. border-2 if border wasn't visible? No, "thin border" means border-1.
  
  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
    changedFiles++;
  }
});
console.log(`Changed ${changedFiles} files`);
