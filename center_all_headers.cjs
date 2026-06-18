const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'src', 'pages');
const files = fs.readdirSync(targetDir).filter(file => file.endsWith('Application.tsx') || file === 'FDDetailsPage.tsx');

files.forEach(file => {
  const filePath = path.join(targetDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Let's find the header container
  // It usually looks like this:
  // <div className="flex items-start justify-between border-b-2 border-[#0F4C81] pb-4 mb-6">
  // OR
  // <div className="flex items-start justify-between border-b-2 border-[#0F4C81] pb-4 mb-8">
  // Inside, there's <div className="text-center flex-grow px-4">
  // And then the right side: <div className="text-right text-[10px] font-bold space-y-2 w-40 shrink-0">
  // We need to find the w-XX of the right side and put a matching empty div before the center text.

  const rightDivRegex = /<div className="[^"]*w-(\d+)[^"]*shrink-0[^"]*">/;
  
  // We will split the file by the text-center div
  const parts = content.split(/<div className="text-center flex-grow px-4">/);
  
  if (parts.length === 2 && !parts[0].includes('<div className="w-')) {
    // Look at parts[1] to find the w-XX of the right side
    const match = parts[1].match(rightDivRegex);
    if (match) {
      const width = match[1];
      const emptyDiv = `<div className="w-${width} shrink-0 hidden md:block"></div>\n            `;
      content = parts[0] + emptyDiv + '<div className="text-center flex-grow px-4">' + parts[1];
    } else {
       // If no shrink-0 on the right, just add a generic w-48
       content = parts[0] + '<div className="w-48 shrink-0 hidden md:block"></div>\n            <div className="text-center flex-grow px-4">' + parts[1];
    }
  }

  // Handle FDDetailsPage again if it didn't center
  // The FDDetailsPage top header was:
  // <div className="flex items-center justify-between border-b-4 border-[#0F4C81] pb-6 mb-8">
  //   <div className="text-center w-full">
  if (file === 'FDDetailsPage.tsx') {
    content = content.replace(/<div className="flex items-center justify-between border-b-4 border-\[#0F4C81\] pb-6 mb-8">\s*<div className="text-center w-full">/, '<div className="flex items-center justify-center border-b-4 border-[#0F4C81] pb-6 mb-8">\n            <div className="text-center w-full">');
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated alignment in ${file}`);
  }
});
