const fs = require('fs');

console.log('=== END-TO-END AUDIT: ALL EXTERNAL PROJECTS IN WEB APP ===\n');

// 1. Check realProyectosMensual2026.ts
const rpmContent = fs.readFileSync('src/data/realProyectosMensual2026.ts', 'utf8');
const eqRpm = rpmContent.indexOf('=');
const proyectos = JSON.parse(rpmContent.substring(rpmContent.indexOf('[', eqRpm), rpmContent.lastIndexOf(']') + 1));

console.log(`Total Projects in realProyectosMensual2026: ${proyectos.length}`);

// Check active projects in September
const activeSep = proyectos.filter(p => {
  const m = p.meses?.find(x => x.mes === 'Septiembre' || x.mesNum === 9);
  return m && m.totalMes > 0;
});

console.log(`\nActive Projects in September: ${activeSep.length}`);

let totalMOD_sep = 0;
let totalMAT_sep = 0;
let totalSRV_sep = 0;
let totalHM_sep = 0;
let totalCIF_sep = 0;
let totalGeneral_sep = 0;

activeSep.forEach(p => {
  const m = p.meses.find(x => x.mes === 'Septiembre' || x.mesNum === 9);
  totalMOD_sep += m.manoObra;
  totalMAT_sep += m.materiales;
  totalSRV_sep += m.servicios;
  totalHM_sep += m.horasMaquina;
  totalCIF_sep += m.costosIndirectos;
  totalGeneral_sep += m.totalMes;
  console.log(`${p.codigo.padEnd(12)} | MOD: ${m.manoObra.toFixed(2).padStart(10)} | MAT: ${m.materiales.toFixed(2).padStart(10)} | SRV: ${m.servicios.toFixed(2).padStart(10)} | HM: ${m.horasMaquina.toFixed(2).padStart(9)} | CIF: ${m.costosIndirectos.toFixed(2).padStart(10)} | TOTAL: ${m.totalMes.toFixed(2).padStart(11)}`);
});

console.log('\n--- SEPTEMBER TOTALS IN realProyectosMensual2026 ---');
console.log(`Mano de Obra Directa:  $${totalMOD_sep.toFixed(2)}`);
console.log(`Materiales Directos:   $${totalMAT_sep.toFixed(2)}`);
console.log(`Servicios:             $${totalSRV_sep.toFixed(2)}`);
console.log(`Horas Maquina:         $${totalHM_sep.toFixed(2)}`);
console.log(`Costos Indirectos:     $${totalCIF_sep.toFixed(2)}`);
console.log(`TOTAL GENERAL SEP:     $${totalGeneral_sep.toFixed(2)}`);

// 2. Compare with mockCostosTimaca.ts TABLA_PPT_DISTRIBUCION_2026
const mctContent = fs.readFileSync('src/data/mockCostosTimaca.ts', 'utf8');
const pptIdx = mctContent.indexOf('TABLA_PPT_DISTRIBUCION_2026');
if (pptIdx !== -1) {
  console.log('\n--- TABLA_PPT_DISTRIBUCION_2026 in mockCostosTimaca.ts ---');
  const pptEnd = mctContent.indexOf('];', pptIdx);
  console.log(mctContent.substring(pptIdx, pptEnd + 2));
}
