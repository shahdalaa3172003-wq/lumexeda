const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. UPDATE TECHNOLOGY WORK IMAGES
html = html.replace(/src="Screenshot 2026-10-01 223946\.png"/g, 'src="Screenshot 2026-10-03 224733.png"');
html = html.replace(/src="Screenshot 2026-10-01 223735\.png"/g, 'src="Screenshot 2026-10-03 224827.png"');
html = html.replace(/src="Screenshot 2026-10-01 222927\.png"/g, 'src="Screenshot 2026-10-03 224919.png"');

// 2. ADD VIEW ALL CONTENT BUTTON under Content Strategy Archive
// Look for closing tag of strategy-list or content-strategy section container
// <div class="strategy-list"> ... </div>
// Let's inject a button after .strategy-list inside .section-container
if (!html.includes('VIEW ALL CONTENT')) {
  html = html.replace(/(\s*)(<\/div>\s*<\/section>\s*<!-- TECHNOLOGY WORK -->)/, `$1  <div style="text-align: center; margin-top: 40px;">$1    <a href="https://drive.google.com/drive/folders/1EovcYjg2WPE-xrsIspb_V2VFsQ61JcqM" target="_blank" class="btn btn-nav" data-magnetic style="display: inline-flex; align-items: center; gap: 8px;">VIEW ALL CONTENT &#8594;</a>$1  </div>$1$2`);
}

// 3. ADD VIEW ALL DESIGNS BUTTON under Social Media Designs
// <div class="live-showcase-grid four-col" id="liveSocialGrid"> ... </div>
if (!html.includes('VIEW ALL DESIGNS')) {
  html = html.replace(/(\s*)(<\/div>\s*<\/section>\s*<!-- ABOUT \/ SERVICES -->)/, `$1  <div style="text-align: center; margin-top: 40px;">$1    <a href="https://drive.google.com/drive/folders/1RtjbY0Jn2Ow-ufc_wzlg56kPThUIjRJb" target="_blank" class="btn btn-nav" data-magnetic style="display: inline-flex; align-items: center; gap: 8px;">VIEW ALL DESIGNS &#8594;</a>$1  </div>$1$2`);
}

fs.writeFileSync('index.html', html, 'utf8');
console.log('Fixed index.html structure');
