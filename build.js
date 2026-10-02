const fs = require('fs');
const path = require('path');

console.log('Building production bundle for Vercel...');

// Ensure dist directory exists
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });

// Copy index.html
fs.copyFileSync(path.join(__dirname, 'index.html'), path.join(distDir, 'index.html'));

// Copy config.js if exists
if (fs.existsSync(path.join(__dirname, 'config.js'))) {
  fs.copyFileSync(path.join(__dirname, 'config.js'), path.join(distDir, 'config.js'));
}

// Copy screenshots
['Screenshot 2026-10-01 222927.png', 'Screenshot 2026-10-01 223735.png', 'Screenshot 2026-10-01 223946.png'].forEach(file => {
  if (fs.existsSync(path.join(__dirname, file))) {
    fs.copyFileSync(path.join(__dirname, file), path.join(distDir, file));
  }
});

// Helper function to recursively copy directories
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  fs.readdirSync(src).forEach(file => {
    const srcFile = path.join(src, file);
    const destFile = path.join(dest, file);
    if (fs.statSync(srcFile).isDirectory()) {
      copyDir(srcFile, destFile);
    } else {
      fs.copyFileSync(srcFile, destFile);
    }
  });
}

// Copy posts-carousels
if (fs.existsSync(path.join(__dirname, 'posts-carousels'))) {
  copyDir(path.join(__dirname, 'posts-carousels'), path.join(distDir, 'posts-carousels'));
}

// Copy public if exists
if (fs.existsSync(path.join(__dirname, 'public'))) {
  copyDir(path.join(__dirname, 'public'), path.join(distDir, 'public'));
}

console.log('✅ Build succeeded! All production assets copied to dist/');

if (fs.existsSync(path.join(__dirname, 'styles.css'))) { fs.copyFileSync(path.join(__dirname, 'styles.css'), path.join(distDir, 'styles.css')); }
if (fs.existsSync(path.join(__dirname, 'scripts.js'))) { fs.copyFileSync(path.join(__dirname, 'scripts.js'), path.join(distDir, 'scripts.js')); }
