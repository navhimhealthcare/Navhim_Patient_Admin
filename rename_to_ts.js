import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

walkDir('./src', (filePath) => {
  if (filePath.endsWith('.jsx')) {
    const newPath = filePath.slice(0, -4) + '.tsx';
    fs.renameSync(filePath, newPath);
    console.log(`Renamed: ${filePath} -> ${newPath}`);
  } else if (filePath.endsWith('.js')) {
    const newPath = filePath.slice(0, -3) + '.ts';
    fs.renameSync(filePath, newPath);
    console.log(`Renamed: ${filePath} -> ${newPath}`);
  }
});
