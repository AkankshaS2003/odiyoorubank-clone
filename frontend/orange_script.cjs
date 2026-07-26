const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'src', 'pages');
const files = fs.readdirSync(targetDir).filter(file => file.endsWith('.tsx') && (file.endsWith('Application.tsx') || file === 'FDDetailsPage.tsx'));

let changedFiles = 0;

files.forEach(file => {
  const filePath = path.join(targetDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  if (file === 'FDDetailsPage.tsx') {
    // It currently has `<div className="w-full text-[#0F4C81]">`
    // And in the FD certificate: `space-x-3 md:space-x-4 mx-auto mb-8 text-[#0F4C81]">`
    // We should replace text-[#0F4C81] with text-[#ED7F1E] in these specific headers.
    
    // Header 1
    content = content.replace(/<div className="w-full text-\[#0F4C81\]">/g, '<div className="w-full text-[#ED7F1E]">');
    
    // Header 2 (Certificate)
    content = content.replace(/mx-auto mb-8 text-\[#0F4C81\]">/g, 'mx-auto mb-8 text-[#ED7F1E]">');
  } else if (file === 'AccountApplication.tsx') {
    // Change print text color
    content = content.replace(/print:text-\[#0F4C81\]">([\s\S]*?)Odiyooru Souharda/g, 'print:text-[#ED7F1E]">$1Odiyooru Souharda');
    // Change background of the header block to orange to match the navbar!
    content = content.replace(/<div className="bg-\[#0F4C81\] p-6 text-white text-center print:bg-white print:text-\[#0F4C81\] print:border-b-2 print:border-\[#0F4C81\]">/, '<div className="bg-[#ED7F1E] p-6 text-white text-center print:bg-white print:text-[#ED7F1E] print:border-b-2 print:border-[#ED7F1E]">');
  } else {
    // Other forms have `<div className="flex-grow px-4 text-[#0F4C81]">`
    content = content.replace(/<div className="flex-grow px-4 text-\[#0F4C81\]">/g, '<div className="flex-grow px-4 text-[#ED7F1E]">');
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
    changedFiles++;
  }
});
console.log(`Changed ${changedFiles} files`);
