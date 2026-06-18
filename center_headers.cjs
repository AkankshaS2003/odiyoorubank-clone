const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'src', 'pages');
const files = fs.readdirSync(targetDir).filter(file => file.endsWith('Application.tsx') || file === 'FDDetailsPage.tsx');

files.forEach(file => {
  const filePath = path.join(targetDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // In all Application forms, the header usually looks like:
  // <div className="flex items-start justify-between border-b-2 border-[#0F4C81] pb-4 mb-6">
  //   <div className="text-center flex-grow px-4">
  //     ... title
  //   </div>
  //   <div className="text-right text-[10px] font-bold space-y-2 w-40 shrink-0">
  //     ... branch info
  //   </div>
  // </div>
  //
  // To make the center title perfectly centered, we must add an empty div on the left with w-40.
  // We'll replace the `<div className="flex items-start justify-between...` with adding the empty div.

  // Let's use a regex to find the start of the header.
  const headerStartRegex = /<div className="flex items-start justify-between border-b-2 border-\[#0F4C81\] pb-4 mb-6">\s*<div className="text-center/g;
  
  if (content.match(headerStartRegex)) {
    content = content.replace(headerStartRegex, '<div className="flex items-start justify-between border-b-2 border-[#0F4C81] pb-4 mb-6">\n            <div className="w-40 shrink-0 hidden md:block"></div>\n            <div className="text-center');
  }

  // AccountApplication has a slightly different header:
  const accHeaderRegex = /<div className="flex items-center justify-between max-w-4xl mx-auto">\s*<div className="w-20 h-20 bg-white\/10 rounded-full flex items-center justify-center print:bg-gray-100">/g;
  if (content.match(accHeaderRegex)) {
    content = content.replace(accHeaderRegex, '<div className="flex items-center justify-between max-w-4xl mx-auto">\n              <div className="w-32 shrink-0 hidden md:block"></div>');
  }

  const accHeaderNoLogoRegex = /<div className="flex items-center justify-between max-w-4xl mx-auto">\s*<div className="text-center flex-grow px-4">/g;
  if (content.match(accHeaderNoLogoRegex)) {
     content = content.replace(accHeaderNoLogoRegex, '<div className="flex items-center justify-between max-w-4xl mx-auto">\n              <div className="w-32 shrink-0 hidden md:block"></div>\n              <div className="text-center flex-grow px-4">');
  }


  // For FDDetailsPage, the top header was:
  // <div className="flex items-center justify-between border-b-4 border-[#0F4C81] pb-6 mb-8">
  //   <div className="text-center w-full">
  if (file === 'FDDetailsPage.tsx') {
    // If we removed the logo, it's just text-center w-full inside flex items-center justify-between.
    // Let's just make it center the text perfectly without flex justify-between if it's the only child.
    const fdHeaderRegex = /<div className="flex items-center justify-between border-b-4 border-\[#0F4C81\] pb-6 mb-8">\s*<div className="text-center w-full">/g;
    if (content.match(fdHeaderRegex)) {
      content = content.replace(fdHeaderRegex, '<div className="flex items-center justify-center border-b-4 border-[#0F4C81] pb-6 mb-8">\n            <div className="text-center w-full">');
    }
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated alignment in ${file}`);
  }
});
