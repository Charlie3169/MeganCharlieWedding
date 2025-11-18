const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');
const srcDir = path.join(__dirname, '..', 'src');
const publicDir = path.join(__dirname, '..', 'public');

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyFile(src, dest) {
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

function copyFolder(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.readdirSync(src, { withFileTypes: true }).forEach((entry) => {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyFolder(srcPath, destPath);
    } else {
      copyFile(srcPath, destPath);
    }
  });
}

fs.rmSync(distDir, { recursive: true, force: true });
ensureDir(distDir);

copyFile(path.join(srcDir, 'index.html'), path.join(distDir, 'index.html'));
copyFile(path.join(srcDir, 'styles', 'main.css'), path.join(distDir, 'assets', 'css', 'main.css'));
copyFile(path.join(srcDir, 'scripts', 'main.js'), path.join(distDir, 'assets', 'js', 'main.js'));
copyFolder(publicDir, path.join(distDir, 'public'));

console.log('Build complete.');
