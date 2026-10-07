const fs = require('fs');
const content = fs.readFileSync('src/data/realSalidasUnificada2026.ts', 'utf8');
const counts = {};
const matches = content.match(/"cuentaAuxiliarCodigo":\s*"([^"]+)"/g) || [];
matches.forEach(m => {
  const code = m.split(':')[1].replace(/[" ]/g, '');
  counts[code] = (counts[code] || 0) + 1;
});
console.log('Sample account counts in SALIDAS_REALES_AGOSTO_2026:');
Object.entries(counts)
  .filter(([k, v]) => k.startsWith('TTI') || k.startsWith('TSI') || k.startsWith('EEI') || k.startsWith('TT-') || k.startsWith('EE-') || k.startsWith('SS-'))
  .slice(0, 20)
  .forEach(([k, v]) => console.log(k, v));
