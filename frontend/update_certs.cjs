const fs = require('fs');

const fdReplacementStr = `              <div className="flex justify-between items-end mt-16 px-12">
                {/* Depositor Signature */}
                <div className="text-center w-40">
                  <div className="h-16 flex items-end justify-center mb-1">
                    {fdData.documents?.signature ? (
                      <img src={fdData.documents.signature} alt="Depositor Signature" className="max-h-16 object-contain mix-blend-multiply" />
                    ) : (
                      <div className="h-8"></div>
                    )}
                  </div>
                  <div className="w-40 border-b border-slate-800 mb-2 mx-auto"></div>
                  <p className="text-[10px] font-bold text-slate-600 uppercase">Depositor Signature</p>
                </div>
                
                {/* Bank Seal */}
                <div className="text-center relative">
                  <div className="w-28 h-28 border-2 border-indigo-200 rounded-full flex items-center justify-center mx-auto mb-2 relative overflow-hidden bg-indigo-50/20 mix-blend-multiply">
                    <div className="absolute inset-[3px] border border-dashed border-indigo-200 rounded-full"></div>
                    <svg viewBox="0 0 100 100" className="w-full h-full absolute inset-0 text-indigo-700/40" style={{ transform: 'rotate(-20deg)' }}>
                      <path id="curve" d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" fill="transparent" />
                      <text className="text-[9px] font-bold uppercase tracking-widest" fill="currentColor">
                        <textPath href="#curve" startOffset="0%">
                          ODIYOORU SOUHARDA COOPERATIVE SOCIETY LTD •
                        </textPath>
                      </text>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-indigo-700/40 font-bold rotate-[-15deg] leading-tight">
                      <span className="text-[10px]">BANK</span>
                      <span className="text-[10px]">SEAL</span>
                      <span className="text-[6px] mt-0.5">HEAD OFFICE</span>
                    </div>
                  </div>
                </div>

                {/* Manager Signature */}
                <div className="text-center w-40">
                  <div className="h-16 flex items-end justify-center mb-1">
                    <span className="text-4xl text-indigo-900/80 -rotate-[10deg] pb-2" style={{ fontFamily: "'Brush Script MT', 'Caveat', 'Dancing Script', cursive" }}>Manoj</span>
                  </div>
                  <div className="w-40 border-b border-slate-800 mb-2 mx-auto"></div>
                  <p className="text-[10px] font-bold text-slate-600 uppercase">Manager / Secretary</p>
                </div>
              </div>`;

const rdReplacementStr = fdReplacementStr.replace(/fdData/g, 'rdData');

function processFile(filePath, replacement) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Create a regex to match the old HTML block exactly regardless of minor whitespace differences
  const regex = /<div className="flex justify-between items-end mt-16 px-12">[\s\S]*?<div className="w-40 border-b border-slate-800 mb-2"><\/div>\s*<p className="text-\[10px\] font-bold text-slate-600 uppercase">Manager \/ Secretary<\/p>\s*<\/div>\s*<\/div>/;

  if (regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync(filePath, content);
    console.log('Successfully updated: ' + filePath);
  } else {
    console.log('Pattern not found in: ' + filePath);
  }
}

processFile('src/pages/FDDetailsPage.tsx', fdReplacementStr);
processFile('src/pages/RDDetailsPage.tsx', rdReplacementStr);
