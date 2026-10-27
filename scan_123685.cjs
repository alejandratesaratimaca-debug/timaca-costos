const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const baseDir = 'C:/Users/alejandratesara/Desktop/Alejandra T/Costos Alejandra';

function findFiles(dir, filter) {
  let results = [];
  try {
    const list = fs.readdirSync(dir);
    for (const file of list) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        if (!file.includes('_Respaldos') && !file.includes('_Stage')) {
          results = results.concat(findFiles(fullPath, filter));
        }
      } else if (filter(file)) {
        results.push(fullPath);
      }
    }
  } catch (e) {}
  return results;
}

const files = findFiles(baseDir, f => f.endsWith('.xlsx'));
console.log(`Found ${files.length} xlsx files to scan.`);

for (const f of files) {
  try {
    const wb = XLSX.readFile(f, { sheetRows: 500 });
    for (const sheet of wb.SheetNames) {
      const ws = wb.Sheets[sheet];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
      for (let r = 0; r < data.length; r++) {
        const row = data[r];
        if (!row) continue;
        for (let c = 0; c < row.length; c++) {
          const val = row[c];
          if (typeof val === 'number') {
            if (Math.abs(val - 123685) < 1 || Math.abs(val - 123.685) < 0.01) {
              console.log(`MATCH in [${path.basename(f)}] Sheet [${sheet}] R${r+1}C${c+1}: ${val}`);
            }
          } else if (typeof val === 'string' && val.includes('123.685')) {
            console.log(`STR MATCH in [${path.basename(f)}] Sheet [${sheet}] R${r+1}C${c+1}: ${val}`);
          }
        }
      }
    }
  } catch (err) {}
}
console.log('Done scanning.');
