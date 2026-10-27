const fs = require('fs');
const XLSX = require('xlsx');

// Let's inspect mockCostosTimaca.ts and mockDesgloseCategorias.ts
const mct = fs.readFileSync('src/data/mockCostosTimaca.ts', 'utf8');
const mdc = fs.readFileSync('src/data/mockDesgloseCategorias.ts', 'utf8');

console.log('=== VERIFICACION CON LUPA DE TODAS LAS CATEGORIAS ===\n');

// 1. Resumen de categorias en TABLA_PPT_DISTRIBUCION_2026
const p1 = mct.indexOf('TABLA_PPT_DISTRIBUCION_2026 = [');
const p2 = mct.indexOf('];', p1);
const pptRows = eval(mct.substring(p1 + 'TABLA_PPT_DISTRIBUCION_2026 = '.length, p2 + 1));

console.log('--- TABLA_PPT_DISTRIBUCION_2026 (AGOSTO vs SEPTIEMBRE) ---');
pptRows.forEach(r => {
  const ago = r.meses[7];
  const sep = r.meses[8];
  console.log(`${r.categoria.padEnd(25)} | Ago: $${ago.toLocaleString('de-DE').padStart(10)} | Sep: $${sep.toLocaleString('de-DE').padStart(10)} | Var: ${r.variacion.padStart(6)} | Total 2026: $${r.total2026.toLocaleString('de-DE').padStart(11)}`);
});

const totAgo = pptRows.reduce((a, r) => a + r.meses[7], 0);
const totSep = pptRows.reduce((a, r) => a + r.meses[8], 0);
console.log(`${'TOTAL GENERAL'.padEnd(25)} | Ago: $${totAgo.toLocaleString('de-DE').padStart(10)} | Sep: $${totSep.toLocaleString('de-DE').padStart(10)}`);
