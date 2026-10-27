const fs = require('fs');
const path = require('path');

function searchDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      searchDir(fullPath);
    } else if (/\.(ts|tsx|js|jsx|json)$/.test(file)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split(/\r?\n/);
      lines.forEach((line, idx) => {
        if (/palua|palúa/i.test(line)) {
          console.log(`${fullPath}:${idx + 1}: ${line.trim()}`);
        }
      });
    }
  }
}
searchDir('src');
searchDir('supabase');
