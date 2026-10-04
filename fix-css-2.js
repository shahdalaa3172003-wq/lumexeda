const fs = require('fs');

let css = fs.readFileSync('styles.css', 'utf8');

css = css.replace(/\.browser-mockup\s*{[\s\S]*?flex-direction:\s*column;\s*}/, 
`.browser-mockup {
  width: 100%;
  height: auto;
  background: #000;
  border-radius: 8px 8px 0 0;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0,0,0,0.5);
  display: flex;
  flex-direction: column;
}`);

css = css.replace(/\.browser-content\s*{[\s\S]*?position:\s*relative;\s*}/,
`.browser-content {
  width: 100%;
  height: auto;
  background: #000;
  overflow: hidden;
  position: relative;
}`);

css = css.replace(/\.browser-content\s*img\s*{[\s\S]*?display:\s*block;\s*}/,
`.browser-content img {
  width: 100%;
  height: auto;
  object-fit: cover;
  object-position: top;
  display: block;
}`);

fs.writeFileSync('styles.css', css, 'utf8');
console.log('CSS replaced successfully');
