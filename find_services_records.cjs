const fs = require('fs');

function checkFile(p) {
  const c = fs.readFileSync(p, 'utf8');
  const lines = c.split('\n');
  const hits = [];
  lines.forEach((l, idx) => {
    if (/transven|traslado de personal|transporte de personal/i.test(l)) {
      hits.push(`${idx + 1}: ${l.trim()}`);
    }
  });
  console.log(p, 'Hits:', hits.length);
  hits.slice(0, 10).forEach(h => console.log('  ', h));
}

checkFile('src/data/realSalidasSeptiembre2026.ts');
checkFile('src/data/realSalidasUnificada2026.ts');
