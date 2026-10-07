const fs = require('fs');

const code = fs.readFileSync('src/data/realProyectosMensual2026.ts', 'utf8');
const match = code.match(/export const MATRIZ_REAL_PROYECTOS_MENSUAL_2026:[^{]+({[\s\S]+});/);
if (!match) {
  console.log('Not matched');
  process.exit(1);
}

const matriz = eval('(' + match[1] + ')');
const keys = Object.keys(matriz);
console.log('Total projects in MATRIZ_REAL_PROYECTOS_MENSUAL_2026:', keys.length);

let sumMeses = [0, 0, 0, 0, 0, 0, 0, 0];
let totalGrand = 0;

keys.forEach(k => {
  const p = matriz[k];
  totalGrand += p.totalAnual;
  for (let m = 0; m < 8; m++) {
    sumMeses[m] += p.meses[m] || 0;
  }
});

console.log('Monthly sums in current MATRIZ_REAL_PROYECTOS_MENSUAL_2026:');
console.log(sumMeses.map((s, i) => `M${i+1}: ${Math.round(s).toLocaleString('de-DE')}`).join(' | '));
console.log('Grand Total:', Math.round(totalGrand).toLocaleString('de-DE'));

console.log('\nTop 10 projects by totalAnual:');
keys.sort((a,b) => matriz[b].totalAnual - matriz[a].totalAnual).slice(0, 10).forEach(k => {
  const p = matriz[k];
  console.log(`  ${k} (${p.descripcion.slice(0, 40)}): ${Math.round(p.totalAnual).toLocaleString('de-DE')}`);
});
