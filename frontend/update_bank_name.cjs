const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'src', 'pages');

const files = fs.readdirSync(targetDir).filter(file => file.endsWith('Application.tsx') || file === 'FDDetailsPage.tsx');

const searchStr1 = /<h1 className="text-xl md:text-2xl font-black tracking-wider text-\[#0F4C81\] uppercase">ODIYOORU CREDIT CO-OPERATIVE SOCIETY LTD.<\/h1>\s*<p className="text-\[#0F4C81\](\/80)? text-(xs|\[10px\]) font-bold tracking-widest mt-1( uppercase)?">.*?<\/p>/g;

const replacement1 = `<h1 className="text-xl md:text-2xl font-black tracking-wider text-[#0F4C81] uppercase leading-tight">ODIYOORU SOUHARDA<br/>COOPERATIVE SOCIETY LTD</h1>
                <p className="text-[#0F4C81] text-[10px] font-bold tracking-widest mt-1 uppercase">DRP:S.9:88:RGN:520:2010-11</p>`;

// Also catch the specific header in AccountApplication
const searchStr2 = /<h1 className="text-2xl font-black tracking-wide">ODIYOORU CREDIT CO-OPERATIVE SOCIETY LTD.<\/h1>\s*<p className="text-blue-200 text-sm tracking-widest mt-1">MAIN BRANCH • ESTD 1998<\/p>/g;
const replacement2 = `<h1 className="text-2xl font-black tracking-wide leading-tight">ODIYOORU SOUHARDA<br/>COOPERATIVE SOCIETY LTD</h1>
                <p className="text-blue-200 text-sm tracking-widest mt-1">DRP:S.9:88:RGN:520:2010-11</p>`;

// Catch the FD Certificate specific text
const searchStr3 = /<h3 className="text-2xl font-black text-\[#0F4C81\] uppercase tracking-widest mb-1">Odiyooru Credit Co-Operative Society Ltd.<\/h3>\s*<p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-8">Certificate of Fixed Deposit<\/p>/g;
const replacement3 = `<h3 className="text-2xl font-black text-[#0F4C81] uppercase tracking-widest mb-1 leading-tight">ODIYOORU SOUHARDA<br/>COOPERATIVE SOCIETY LTD</h3>
              <p className="text-xs font-bold text-[#0F4C81] uppercase tracking-widest mt-1 mb-8">DRP:S.9:88:RGN:520:2010-11 <span className="mx-2 text-slate-300">|</span> <span className="text-slate-500">Certificate of Fixed Deposit</span></p>`;

// Catch the Account Application signature table header
const searchStr4 = /<h2 className="text-lg font-black tracking-widest uppercase">ODIYOORU CREDIT CO-OPERATIVE SOCIETY LTD.<\/h2>/g;
const replacement4 = `<h2 className="text-lg font-black tracking-widest uppercase leading-tight text-center">ODIYOORU SOUHARDA<br/>COOPERATIVE SOCIETY LTD</h2>\n                    <p className="text-xs font-bold text-gray-500 mt-1 text-center">DRP:S.9:88:RGN:520:2010-11</p>`;

files.forEach(file => {
  const filePath = path.join(targetDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  content = content.replace(searchStr1, replacement1);
  content = content.replace(searchStr2, replacement2);
  content = content.replace(searchStr3, replacement3);
  content = content.replace(searchStr4, replacement4);

  // General text replacements in declarations
  content = content.replace(/ODIYOORU CREDIT CO-OPERATIVE SOCIETY LTD\./g, "ODIYOORU SOUHARDA COOPERATIVE SOCIETY LTD");

  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  }
});
