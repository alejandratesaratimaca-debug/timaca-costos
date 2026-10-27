const fs = require('fs');

const c = fs.readFileSync('src/data/mockDesgloseCategorias.ts', 'utf8');
const idx = c.indexOf('COSTOS_INDIRECTOS_POR_CATEGORIAS: FilaDesgloseMensual[]');
const end = c.indexOf('];', idx);
const tableStr = c.substring(c.indexOf('[', idx), end + 1);
const rows = eval('(' + tableStr + ')');

console.log('--- COSTOS_INDIRECTOS_POR_CATEGORIAS (Monthly Sums) ---');
const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep'];
meses.forEach(m => {
  const sum = rows.reduce((acc, r) => acc + (r[m] || 0), 0);
  console.log(`${m.toUpperCase()}: $${sum.toLocaleString('de-DE')}`);
});

console.log('\n--- Details of Agosto vs Septiembre ---');
rows.forEach(r => {
  console.log(`${r.concepto.padEnd(40)} | AGO: ${String(r.ago || 0).padStart(7)} | SEP: ${String(r.sep || 0).padStart(7)}`);
});
