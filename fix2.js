const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Fix the typo in css import
html = html.replace('styles.css?v=8?v=6', 'styles.css?v=8');

// Remove the asterisk span containing ? entirely if the user just wants the text
// Or replace it with nothing.
html = html.replace(/<span class="asterisk">\?<\/span>\s*CREATIVE/g, 'CREATIVE');

// And remove big-asterisk ?
html = html.replace(/<span class="asterisk big-asterisk">\?<\/span>/g, '');

// Fix strategy-arrow containing ? to an SVG arrow or &#8594;
html = html.replace(/<div class="strategy-arrow">\?<\/div>/g, '<div class="strategy-arrow">&#8594;</div>');

fs.writeFileSync('index.html', html, 'utf8');
console.log('Fixed remaining ? artifacts.');
