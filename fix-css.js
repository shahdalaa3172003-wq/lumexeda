const fs = require('fs');

let css = fs.readFileSync('styles.css', 'utf8');

css = css.replace(/\.browser-mockup\s*{[\s\S]*?box-shadow:\s*0\s*20px\s*40px\s*rgba\(0,0,0,0\.5\);\s*}/, 
`.browser-mockup {
  width: 100%;
  height: 90%;
  background: #000;
  border-radius: 8px 8px 0 0;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0,0,0,0.5);
  display: flex;
  flex-direction: column;
}`);

css = css.replace(/\.browser-bar\s*{[\s\S]*?background:\s*#1a1a1a;\s*}/,
`.browser-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px;
  background: #1a1a1a;
  flex-shrink: 0;
}`);

css = css.replace(/\.browser-content\s*{\s*width:\s*100%;\s*height:\s*100%;\s*}/,
`.browser-content {
  flex: 1;
  width: 100%;
  height: 100%;
  background: #000;
  overflow: hidden;
  position: relative;
}`);

css = css.replace(/\.browser-content\s*img\s*{\s*width:\s*100%;\s*height:\s*100%;\s*object-fit:\s*cover;\s*object-position:\s*top;\s*}/,
`.browser-content img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  display: block;
}`);

fs.writeFileSync('styles.css', css, 'utf8');
console.log('CSS replaced successfully');
