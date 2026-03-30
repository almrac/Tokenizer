const fs = require('fs');
const path = require('path');

// File writes are synchronous to keep the CLI flow simple and predictable.
function ensureDirExists(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function cleanOutputDir(dirPath, targetFileName) {
  const targetPath = path.join(dirPath, targetFileName);

  if (fs.existsSync(targetPath)) {
    fs.unlinkSync(targetPath);
    return true;
  }

  return false;
}

function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
}

module.exports = {
  cleanOutputDir: cleanOutputDir,
  ensureDirExists: ensureDirExists,
  writeFile: writeFile,
};
