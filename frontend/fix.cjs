const fs = require('fs');
const content = fs.readFileSync('e:\\odiyoorubank-clone\\backend\\controllers\\accountController.js', 'utf8');
// Handle both CRLF and LF
const lines = content.replace(/\r\n/g, '\n').split('\n');
const fixedContent = lines.slice(137).join('\n');
fs.writeFileSync('e:\\odiyoorubank-clone\\backend\\controllers\\accountController.js', fixedContent);
