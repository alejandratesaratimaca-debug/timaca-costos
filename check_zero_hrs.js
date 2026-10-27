const fs = require('fs');
const content = fs.readFileSync('src/data/realSalidasSeptiembre2026.ts', 'utf8');
const count0 = (content.match(/"cantidad": 0,/g) || []).length;
const matches = content.match(/"itemDescripcion": "[^"]*0\.0 hrs[^"]*"/g) || [];
console.log('Total cantidad: 0 records:', count0);
console.log('Total 0.0 hrs descriptions:', matches.length);
if (matches.length > 0) {
  console.log('Sample 0.0 hrs records:');
  matches.slice(0, 5).forEach(m => console.log(' -', m));
}
