const fs = require('fs');

const c = fs.readFileSync('src/data/realProyectosMensual2026.ts', 'utf8');
const objStr = c.substring(c.indexOf('{', c.indexOf('MATRIZ_REAL_PROYECTOS_MENSUAL_2026')), c.lastIndexOf('};') + 1);

// Safely evaluate
const matriz = eval('(' + objStr + ')');

console.log('Total accounts in MATRIZ_REAL_PROYECTOS_MENSUAL_2026:', Object.keys(matriz).length);

console.log('\n--- SEPTEMBER AMOUNTS BY PROJECT ---');
let grandTotalSep = 0;
const catTotalsSep = {
  'Materiales Directos': 0,
  'Servicios': 0,
  'Mano de Obra Directa': 0,
  'Horas Maquina': 0,
  'Costos Indirectos': 0
};

for (const [cta, p] of Object.entries(matriz)) {
  const sepVal = p.meses[8];
  if (sepVal > 0) {
    const cats = p.byCategoriaMes[8] || {};
    for (const [catName, catVal] of Object.entries(cats)) {
      catTotalsSep[catName] = (catTotalsSep[catName] || 0) + (catVal || 0);
    }
    grandTotalSep += sepVal;
    console.log(`${cta.padEnd(12)}: Total Sep = $${sepVal.toFixed(2).padStart(11)} | MAT: $${(cats['Materiales Directos'] || 0).toFixed(2).padStart(9)} | SRV: $${(cats['Servicios'] || 0).toFixed(2).padStart(9)} | MOD: $${(cats['Mano de Obra Directa'] || 0).toFixed(2).padStart(9)} | HM: $${(cats['Horas Maquina'] || 0).toFixed(2).padStart(8)} | CIF: $${(cats['Costos Indirectos'] || 0).toFixed(2).padStart(9)}`);
  }
}

console.log('\n--- TOTALES CATEGORIA SEPTIEMBRE ---');
for (const [k, v] of Object.entries(catTotalsSep)) {
  console.log(`  ${k.padEnd(25)}: $${v.toFixed(2)}`);
}
console.log(`  TOTAL GENERAL SEPTIEMBRE : $${grandTotalSep.toFixed(2)}`);
