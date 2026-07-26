const fs = require('fs');

const svgSignature = `<svg width="90" height="40" viewBox="0 0 100 40" className="text-indigo-900/80 -rotate-6 mb-1">
                      <path d="M10 25 C 10 10, 15 10, 20 25 C 25 5, 30 5, 35 30 C 40 25, 45 20, 50 25 C 55 30, 60 15, 65 20 C 70 25, 80 25, 90 20 M 15 35 Q 50 40 85 30" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>`;

let fd = fs.readFileSync('src/pages/FDDetailsPage.tsx', 'utf8');
fd = fd.replace(/<span className="text-4xl text-indigo-900\/80 -rotate-\[10deg\] pb-2" style=\{\{ fontFamily: "'Brush Script MT', 'Caveat', 'Dancing Script', cursive" \}\}>Manoj<\/span>/g, svgSignature);
fs.writeFileSync('src/pages/FDDetailsPage.tsx', fd);

let rd = fs.readFileSync('src/pages/RDDetailsPage.tsx', 'utf8');
rd = rd.replace(/<span className="text-4xl text-indigo-900\/80 -rotate-\[10deg\] pb-2" style=\{\{ fontFamily: "'Brush Script MT', 'Caveat', 'Dancing Script', cursive" \}\}>Manoj<\/span>/g, svgSignature);
fs.writeFileSync('src/pages/RDDetailsPage.tsx', rd);

console.log('Signature updated to SVG scribble');
