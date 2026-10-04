const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Replace the ? and  characters safely
html = html.replace(/\? CREATIVE & TECHNOLOGY STUDIO/g, 'CREATIVE & TECHNOLOGY STUDIO');
html = html.replace(/ CREATIVE & TECHNOLOGY STUDIO/g, 'CREATIVE & TECHNOLOGY STUDIO');

html = html.replace(/VIEW PROJECT\s*[\?]/g, 'VIEW PROJECT &#8599;');
html = html.replace(/START A PROJECT\s*[\?]/g, 'START A PROJECT &#8599;');

// Marquee Text
const marqueeInner = `
          <div class="marquee-inner">
            <span>CREATIVE &middot; MEDIA &middot; TECHNOLOGY &middot; </span>
            <span>CREATIVE &middot; MEDIA &middot; TECHNOLOGY &middot; </span>
            <span>CREATIVE &middot; MEDIA &middot; TECHNOLOGY &middot; </span>
            <span>CREATIVE &middot; MEDIA &middot; TECHNOLOGY &middot; </span>
          </div>`;
html = html.replace(/<div class="marquee-inner">[\s\S]*?<\/div>/, marqueeInner);

const marqueeOuter = `
          <div class="marquee-inner outline">
            <span>CREATIVE &middot; MEDIA &middot; TECHNOLOGY &middot; </span>
            <span>CREATIVE &middot; MEDIA &middot; TECHNOLOGY &middot; </span>
            <span>CREATIVE &middot; MEDIA &middot; TECHNOLOGY &middot; </span>
            <span>CREATIVE &middot; MEDIA &middot; TECHNOLOGY &middot; </span>
          </div>`;
html = html.replace(/<div class="marquee-inner outline">[\s\S]*?<\/div>/, marqueeOuter);

// Footer text
html = html.replace(/CREATIVE\s*[\?]\s*MEDIA\s*[\?]\s*TECHNOLOGY/g, 'CREATIVE &middot; MEDIA &middot; TECHNOLOGY');

// Copyright
html = html.replace(/[\?]\s*2026 Lumexeda/g, '&copy; 2026 Lumexeda');
html = html.replace(/2026 Lumexeda\. All rights reserved\.\s*[\?]/g, '2026 Lumexeda. All rights reserved.');

// Google Drive Links in Content Strategy Archive replacing ? with an arrow
// They look like: <a href="https://drive.google.com/..." class="drive-link" target="_blank">?</a>
html = html.replace(/<a([^>]+class="drive-link"[^>]*)>[\?]<\/a>/g, '<a$1>&#8594;</a>');
html = html.replace(/<a([^>]+target="_blank"[^>]*)>[\?]<\/a>/g, '<a$1>&#8594;</a>'); // Backup if no class

fs.writeFileSync('index.html', html, 'utf8');
console.log('Fixed index.html encoding and text.');
