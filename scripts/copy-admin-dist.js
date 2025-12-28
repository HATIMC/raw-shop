const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const adminDist = path.join(root, 'admin', 'dist');
const dest = path.join(root, 'dist', 'admin');

function removeDir(dir) {
  if (!fs.existsSync(dir)) return;
  fs.rmSync(dir, { recursive: true, force: true });
}

function copyDir(src, dst) {
  if (!fs.existsSync(src)) {
    console.error(`Source not found: ${src}`);
    process.exit(1);
  }

  fs.mkdirSync(dst, { recursive: true });

  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const dstPath = path.join(dst, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, dstPath);
    } else {
      fs.copyFileSync(srcPath, dstPath);
    }
  }
}

try {
  console.log('Preparing to copy admin build into shop dist...');
  removeDir(dest);
  copyDir(adminDist, dest);
  console.log('Admin build copied to dist/admin successfully.');
} catch (err) {
  console.error('Failed to copy admin build:', err);
  process.exit(1);
}
