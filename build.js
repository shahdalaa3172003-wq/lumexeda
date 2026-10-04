const fs = require('fs');
const path = require('path');

console.log('Building production bundle for Vercel...');

// Ensure dist directory exists
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });

// Copy root files
const filesToCopy = ['index.html', 'config.js', 'styles.css', 'scripts.js', 'hero-bg-2.jpeg', 'auticare-preview.png', 'shahd-preview.png', 'lumexeda-preview.png'];
filesToCopy.forEach(file => {
  if (fs.existsSync(path.join(__dirname, file))) {
    fs.copyFileSync(path.join(__dirname, file), path.join(distDir, file));
  }
});

// Helper function to recursively copy directories and collect files
function copyDirAndCollectImages(src, dest, publicBaseUrl) {
  let images = [];
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  try {
    fs.readdirSync(src).forEach(file => {
      const srcFile = path.join(src, file);
      const destFile = path.join(dest, file);
      if (fs.statSync(srcFile).isDirectory()) {
        images = images.concat(copyDirAndCollectImages(srcFile, destFile, publicBaseUrl + '/' + file));
      } else {
        fs.copyFileSync(srcFile, destFile);
        if (/\.(jpg|jpeg|png|gif|webp)$/i.test(file)) {
          images.push(publicBaseUrl + '/' + file);
        }
      }
    });
  } catch (e) {}
  return images;
}

// Copy directories
['posts-carousels', 'public'].forEach(dir => {
  if (fs.existsSync(path.join(__dirname, dir))) {
    copyDirAndCollectImages(path.join(__dirname, dir), path.join(distDir, dir), '/' + dir);
  }
});

// Generate APIs for showcase, studio, and social
const apiDir = path.join(distDir, 'api');
if (!fs.existsSync(apiDir)) fs.mkdirSync(apiDir, { recursive: true });

const dynamicDirs = {
  'showcase-images': 'showcase',
  'studio-images': 'studio-images',
  'social-images': 'social-media-designs'
};

for (const [apiEndpoint, folder] of Object.entries(dynamicDirs)) {
  const srcFolder = path.join(__dirname, folder);
  const destFolder = path.join(distDir, folder);
  let imagesList = [];
  if (fs.existsSync(srcFolder)) {
    imagesList = copyDirAndCollectImages(srcFolder, destFolder, '/' + folder);
  }
  
  // Write the JSON response that the frontend expects
  fs.writeFileSync(path.join(apiDir, apiEndpoint + '.json'), JSON.stringify({ images: imagesList }));
}

console.log('✅ Build succeeded! All production assets copied to dist/');