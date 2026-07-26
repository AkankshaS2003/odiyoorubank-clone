const fs = require('fs');

const svgSignatureRegex = /<svg width="90" height="40" viewBox="0 0 100 40" className="text-indigo-900\/80 -rotate-6 mb-1">[\s\S]*?<\/svg>/g;

const newSignature = `<span className="text-[2.5rem] text-indigo-900/80 block" style={{ fontFamily: "'Brush Script MT', 'Caveat', 'Dancing Script', cursive", letterSpacing: "-4px", transform: "rotate(-8deg) skewX(-25deg) scaleY(1.3)", opacity: 0.85, filter: "blur(0.4px)" }}>Manoj</span>`;

function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (svgSignatureRegex.test(content)) {
    content = content.replace(svgSignatureRegex, newSignature);
    fs.writeFileSync(filePath, content);
    console.log('Updated ' + filePath);
  } else {
    console.log('SVG not found in ' + filePath);
  }
}

updateFile('src/pages/FDDetailsPage.tsx');
updateFile('src/pages/RDDetailsPage.tsx');
