const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'src', 'pages');
const files = fs.readdirSync(targetDir).filter(file => file.endsWith('.tsx') && (file.endsWith('Application.tsx') || file === 'FDDetailsPage.tsx'));

let changedFiles = 0;

files.forEach(file => {
  const filePath = path.join(targetDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Let's create the new header replacement
  const newHeaderInner = `
              <div className="flex items-center justify-center space-x-3 md:space-x-4 mx-auto">
                <img src="/logo-bg.png" alt="Odiyooru Souharda Logo" className="h-16 w-16 md:h-20 md:w-20 object-contain shrink-0" />
                <div className="leading-tight text-left">
                  <span className="text-xl md:text-2xl font-black tracking-tight uppercase block leading-none font-heading">
                    Odiyooru Souharda
                  </span>
                  <span className="text-sm md:text-base font-bold uppercase tracking-widest leading-none block mt-1">
                    Cooperative Society Ltd
                  </span>
                  <span className="text-[10px] md:text-xs font-bold block mt-1 font-mono leading-none">
                    DRP:S.9:88:RGN:520:2010-11
                  </span>
                </div>
              </div>`;

  if (file === 'FDDetailsPage.tsx') {
    // Replace the FDDetailsPage header
    const regex = /<div className="text-center w-full">([\s\S]*?)<\/div>\s*<\/div>\s*<div className="text-center mb-8">/;
    // We will replace the text-center w-full div content with the newHeaderInner (but with text-[#0F4C81] for the inner spans since it's on a white background)
    
    let replacement = `<div className="w-full text-[#0F4C81]">` + newHeaderInner + `</div>\n          </div>\n          <div className="text-center mb-8">`;
    content = content.replace(regex, replacement);
  } else if (file === 'AccountApplication.tsx') {
    // AccountApplication uses bg-[#0F4C81] text-white
    const regex = /<div className="text-center flex-grow px-4">([\s\S]*?)<\/div>\s*<div className="text-right/;
    let replacement = `<div className="flex-grow px-4 text-white print:text-[#0F4C81]">` + newHeaderInner + `</div>\n              <div className="text-right`;
    content = content.replace(regex, replacement);
  } else {
    // Other forms use white background with text-[#0F4C81]
    const regex = /<div className="text-center flex-grow px-4">([\s\S]*?)<\/div>\s*<div className="text-right/;
    let replacement = `<div className="flex-grow px-4 text-[#0F4C81]">` + newHeaderInner + `</div>\n              <div className="text-right`;
    content = content.replace(regex, replacement);
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
    changedFiles++;
  }
});
console.log(`Changed ${changedFiles} files`);
