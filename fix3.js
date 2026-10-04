const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/\uFFFD/g, '');
fs.writeFileSync('index.html', html, 'utf8');
console.log('Removed all uFFFD');
