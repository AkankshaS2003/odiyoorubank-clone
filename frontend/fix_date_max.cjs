const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src', 'pages');

fs.readdir(directoryPath, (err, files) => {
  if (err) {
    return console.log('Unable to scan directory: ' + err);
  }
  files.forEach((file) => {
    if (file.endsWith('.tsx')) {
      const filePath = path.join(directoryPath, file);
      let content = fs.readFileSync(filePath, 'utf8');
      
      const searchString = '        type={type}\r\n';
      const searchString2 = '        type={type}\n';
      const replacementString = '        type={type}\n        max={type === \'date\' ? "9999-12-31" : undefined}\n';
      
      let updated = false;
      if (content.includes(searchString) && !content.includes("max={type === 'date'")) {
        content = content.replace(searchString, replacementString);
        updated = true;
      } else if (content.includes(searchString2) && !content.includes("max={type === 'date'")) {
        content = content.replace(searchString2, replacementString);
        updated = true;
      }
      
      if (updated) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${file}`);
      }
    }
  });
});
