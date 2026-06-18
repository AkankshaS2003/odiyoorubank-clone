const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'src', 'pages');
const files = fs.readdirSync(targetDir).filter(file => file.endsWith('Application.tsx') || file === 'FDDetailsPage.tsx');

const searchStrBuilding = /<div className="w-20 h-20 bg-white\/10 rounded-full flex items-center justify-center print:bg-gray-100">\s*<Building2 className="w-10 h-10 text-white print:text-gray-400" \/>\s*<\/div>/g;

const searchStrLandmark = /<div className="w-16 h-16 bg-\[#0F4C81\] text-white rounded-full flex items-center justify-center print:border-2 print:border-\[#0F4C81\] print:bg-transparent print:text-\[#0F4C81\]">\s*<Landmark className="w-8 h-8" \/>\s*<\/div>/g;

files.forEach(file => {
  const filePath = path.join(targetDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Remove the Building2 logo div
  content = content.replace(searchStrBuilding, '');

  // For FDDetailsPage top header, remove Landmark logo div and center the text div
  if (file === 'FDDetailsPage.tsx') {
    content = content.replace(searchStrLandmark, '');
    
    // The parent div of the top header is <div className="flex items-center gap-4">
    // We should change it to center the text
    content = content.replace(/<div className="flex items-center gap-4">/g, '<div className="text-center w-full">');
  } else {
    // In other forms, ensure the text container doesn't have flex constraints that uncenter it if we remove the logo
    // Some forms have <div className="text-center flex-grow px-4">
    // Wait, let's just make sure it's `<div className="text-center flex-grow px-4">` or similar
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  }
});
