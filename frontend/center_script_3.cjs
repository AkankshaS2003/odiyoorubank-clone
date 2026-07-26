const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'src', 'pages');
const files = fs.readdirSync(targetDir).filter(file => file.endsWith('.tsx'));

let changedFiles = 0;

files.forEach(file => {
  const filePath = path.join(targetDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Let's find exactly:
  // <div className="flex items-start justify-between border-b-2 border-[#0F4C81] pb-4 mb-X">
  //   <div className="text-center flex-grow px-4">
  // and replace it with:
  // <div className="flex items-start justify-between border-b-2 border-[#0F4C81] pb-4 mb-X relative">
  //   <div className="absolute left-1/2 -translate-x-1/2 w-full max-w-lg text-center flex flex-col justify-center items-center pointer-events-none">
  // And the title text will perfectly center. But wait, we have buttons/inputs on the right side.
  // Actually, if the center text is absolute, it takes it out of the flex flow, so the right side would just float right.
  // Wait, if it's absolute, it might overlap the right side if the screen is small.
  // The better way is to add an empty div with the EXACT same width class as the right div.

  // First, find the right div width:
  // Usually it is: <div className="text-right text-[10px] font-bold space-y-2 w-40 shrink-0">
  // or w-48 or w-32.
  // Let's use a regex to replace the header start.

  const rightDivRegex = /<div className="[^"]*w-(\d+)[^"]*shrink-0[^"]*">/g;
  let match;
  let widthClass = '40'; // default
  
  // Find all matches for right div in the file to guess width. 
  // It's a bit hacky. Let's just do a string replace for the start of the header.

  const headerStarts = [
    '<div className="flex items-start justify-between border-b-2 border-[#0F4C81] pb-4 mb-6">',
    '<div className="flex items-start justify-between border-b-2 border-[#0F4C81] pb-4 mb-8">',
    '<div className="flex items-center justify-between border-b-2 border-[#0F4C81] pb-4 mb-6">',
    '<div className="flex items-center justify-between max-w-4xl mx-auto">',
  ];

  headerStarts.forEach(start => {
    if (content.includes(start)) {
      // Find what's after this.
      const index = content.indexOf(start);
      // find the right div width after this
      const sub = content.substring(index, index + 1000);
      const m = sub.match(/w-(\d+) shrink-0/);
      let w = '40';
      if (m) w = m[1];

      // Remove any existing empty divs we might have added earlier
      const emptyDivPattern = new RegExp(`<div className="w-\\d+ shrink-0 hidden md:block"><\\/div>\\s*`, 'g');
      content = content.replace(emptyDivPattern, '');

      // Add the empty div
      const newStart = `${start}\n            <div className="w-${w} shrink-0 hidden md:block"></div>`;
      content = content.split(start).join(newStart);
    }
  });

  // For FDDetailsPage.tsx
  if (file === 'FDDetailsPage.tsx') {
    content = content.replace(
      '<div className="flex items-center justify-between border-b-4 border-[#0F4C81] pb-6 mb-8">',
      '<div className="flex items-center justify-center border-b-4 border-[#0F4C81] pb-6 mb-8">'
    );
    // Remove the w-16 h-16 logo entirely if it's still there
    content = content.replace(/<div className="w-16 h-16 bg-\[#0F4C81\] text-white rounded-full flex items-center justify-center print:border-2 print:border-\[#0F4C81\] print:bg-transparent print:text-\[#0F4C81\]">\s*<Landmark className="w-8 h-8" \/>\s*<\/div>/g, '');
    
    // also remove the wrapper <div className="flex items-center gap-4"> if it exists
    content = content.replace(/<div className="flex items-center gap-4">\s*<div>/g, '<div className="text-center w-full">');
    content = content.replace(/<\/div>\s*<\/div>\s*<\/div>\s*<div className="text-center mb-8">/g, '</div>\n          </div>\n          <div className="text-center mb-8">');
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
    changedFiles++;
  }
});
console.log(`Changed ${changedFiles} files`);
