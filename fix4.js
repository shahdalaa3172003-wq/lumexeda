const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace('href="https://www.facebook.com/lumexeda"', 'href="https://www.facebook.com/share/1PmubSH96R/?mibextid=wwXIfr"');
fs.writeFileSync('index.html', html, 'utf8');
console.log('Fixed FB link');
