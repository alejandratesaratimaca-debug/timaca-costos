const fs = require('fs');

const c = fs.readFileSync('src/data/mockDesgloseCategorias.ts', 'utf8');
const idx = c.indexOf('COSTOS_INDIRECTOS_CONSOLIDADO_OFICIAL: FilaDesgloseMensual[]');
const end = c.indexOf('];', idx);
const tableStr = c.substring(c.indexOf('[', idx), end + 1);
const rows = eval('(' + tableStr + ')');

console.log('--- Current COSTOS_INDIRECTOS_CONSOLIDADO_OFICIAL (Agosto & Septiembre) ---');
rows.forEach(r => {
  console.log(`${r.ctaAuxiliar.padEnd(12)} | pct: ${String(r.porcentaje).padStart(5)}% | Ago: ${String(r.ago).padStart(8)} | Sep: ${String(r.sep).padStart(8)}`);
});

const totAgo = rows.reduce((a, r) => a + (r.ago || 0), 0);
const totSep = rows.reduce((a, r) => a + (r.sep || 0), 0);
console.log(`TOTAL AGO: ${totAgo} | TOTAL SEP: ${totSep}`);
