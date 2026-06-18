const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'src', 'pages');
const files = fs.readdirSync(targetDir).filter(file => file.endsWith('.tsx') && (file.endsWith('Application.tsx') || file === 'FDDetailsPage.tsx'));

const replacement = `          {/* HEADER SECTION */}
          <div className="bg-[#ED7F1E] rounded-t-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between mb-8 -mt-8 md:-mt-12 -mx-8 md:-mx-12 print:m-0 print:p-4 print:rounded-none gap-4 md:gap-0">
            <div className="flex-grow flex items-center justify-center md:justify-start space-x-4 md:space-x-6 mx-auto md:mx-0 w-full md:w-auto">
              <img src="/logo-bg.png" alt="Odiyooru Souharda Logo" className="h-16 w-16 md:h-20 md:w-20 object-contain shrink-0" />
              <div className="text-white leading-tight text-left">
                <span className="text-xl md:text-3xl font-black tracking-tight uppercase block leading-none font-heading">
                  Odiyooru Souharda
                </span>
                <span className="text-sm md:text-lg font-bold uppercase tracking-widest leading-none block mt-1 md:mt-2">
                  Cooperative Society Ltd
                </span>
                <span className="text-[10px] md:text-xs font-bold block mt-1 md:mt-2 font-mono leading-none text-white/90">
                  DRP:S.9:88:RGN:520:2010-11
                </span>
              </div>
            </div>
            
            <div className="text-right text-white text-[10px] md:text-xs font-bold space-y-3 w-full md:w-56 shrink-0 flex flex-col items-end mt-4 md:mt-0">
              <div className="flex justify-end items-center gap-2 w-full">
                <span className="opacity-90">Branch:</span> 
                <div className="w-32 border-b border-white/40 text-center pb-0.5 opacity-80">Main Branch</div>
              </div>
              <div className="flex flex-col items-end gap-1 w-full">
                <span className="opacity-90 pr-2">Customer ID:</span> 
                <div className="w-32 bg-white/20 rounded px-2 py-1 text-center border border-white/10">{user?.customerId || ''}</div>
              </div>
              <div className="flex justify-end items-center gap-2 w-full">
                <span className="opacity-90">Account No:</span> 
                <div className="w-32 border-b border-white/40 text-center pb-0.5 tracking-widest">{user?.accountNumber || '— — — —'}</div>
              </div>
            </div>
          </div>`;

files.forEach(file => {
  const filePath = path.join(targetDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Match {/* HEADER SECTION */} to the closing div of the header section
  const headerRegex = /\{\/\*\s*HEADER SECTION\s*\*\/\}\s*<div[\s\S]*?(?=\{\/\*\s*[A-Z ]+\s*\*\/\})/g;
  
  content = content.replace(headerRegex, (match) => {
    return replacement + '\n\n          ';
  });

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${file}`);
});
