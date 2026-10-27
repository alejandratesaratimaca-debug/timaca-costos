import { TABLA_PPT_DISTRIBUCION_2026, TOTALES_MESES_PPT, CUENTAS_AUXILIARES_EXACTAS_SEPTIEMBRE_2026 } from '../src/data/mockCostosTimaca';
import { MATRIZ_REAL_PROYECTOS_MENSUAL_2026 } from '../src/data/realProyectosMensual2026';

console.log("=== 1. TABLA DISTRIBUCION 2026 VS TOTALES MESES ===");
const mesesNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep'];
for (let i = 0; i < 9; i++) {
  const sumCat = TABLA_PPT_DISTRIBUCION_2026.reduce((acc, c) => acc + c.meses[i], 0);
  const pptTot = TOTALES_MESES_PPT[i].total;
  console.log(`${mesesNames[i]} (Mes ${i+1}): SumCat = ${sumCat.toLocaleString()} | PPT = ${pptTot.toLocaleString()} | Diff = ${(sumCat - pptTot).toLocaleString()}`);
}

console.log("\n=== SUMA DE CADA CATEGORIA ===");
TABLA_PPT_DISTRIBUCION_2026.forEach(c => {
  const sum = c.meses.reduce((a, b) => a + b, 0);
  console.log(`${c.categoria}: Sum Meses = ${sum.toLocaleString()} | Reported = ${c.total2026.toLocaleString()} | Diff = ${(sum - c.total2026).toLocaleString()}`);
});

const grandSumCat = TABLA_PPT_DISTRIBUCION_2026.reduce((acc, c) => acc + c.meses.reduce((a, b) => a + b, 0), 0);
const grandPPT = TOTALES_MESES_PPT.reduce((a, b) => a + b.total, 0);
console.log(`\nGrand Sum Categories: ${grandSumCat.toLocaleString()} | Grand PPT: ${grandPPT.toLocaleString()} | Diff = ${(grandSumCat - grandPPT).toLocaleString()}`);

console.log("\n=== 2. PROYECTOS SEPTIEMBRE (LAMINA 4) ===");
const projs = CUENTAS_AUXILIARES_EXACTAS_SEPTIEMBRE_2026;
console.log(`Cantidad proyectos en CUENTAS_AUXILIARES_EXACTAS_SEPTIEMBRE_2026: ${projs.length}`);
const sumProjs = projs.reduce((acc, p) => acc + p.montoSeptiembre, 0);
console.log(`Suma CUENTAS_AUXILIARES_EXACTAS_SEPTIEMBRE_2026: ${sumProjs.toLocaleString()} (Sep Total = 1,613,225)`);
projs.forEach((p, idx) => {
  console.log(`  ${idx+1}. ${p.cuentaAuxiliar} - ${p.proyectoCorto}: ${p.montoSeptiembre.toLocaleString()} (${p.porcentaje}%)`);
});

console.log("\n=== 3. PELLAS LINEA 1 MATRIZ VS REPORTADO ===");
const pellas = MATRIZ_REAL_PROYECTOS_MENSUAL_2026['TTE-C-0706'];
console.log("Pellas TTE-C-0706 meses:", pellas?.meses);
console.log("Pellas totalAnual:", pellas?.totalAnual);
console.log("Pellas sum meses:", pellas?.meses.reduce((a, b) => a + b, 0));
console.log("Pellas sep:", pellas?.meses[8]);
