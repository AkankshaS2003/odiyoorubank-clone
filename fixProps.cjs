const fs = require('fs');
let content = fs.readFileSync('src/pages/AccountApplication.tsx', 'utf8');

content = content.replace(/<InputField([^>]+)name=\"([^\"]+)\"([^>]*)\/>/g, (match, p1, name, p3) => {
  return `<InputField${p1}name="${name}"${p3} formData={formData} handleChange={handleChange} error={errors['${name}']} />`;
});

content = content.replace(/<FileUploadBox([^>]+)field=\"([^\"]+)\"([^>]*)\/>/g, (match, p1, field, p3) => {
  return `<FileUploadBox${p1}field="${field}"${p3} uploads={uploads} handleFileUpload={handleFileUpload} error={errors['${field}']} />`;
});

fs.writeFileSync('src/pages/AccountApplication.tsx', content);
console.log('Fixed props');
