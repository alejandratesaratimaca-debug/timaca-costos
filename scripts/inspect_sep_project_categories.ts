import { MATRIZ_REAL_PROYECTOS_MENSUAL_2026 } from '../src/data/realProyectosMensual2026';

console.log("=== BREAKDOWN OF ALL PROJECTS IN SEPTEMBER ===");
const projs = Object.values(MATRIZ_REAL_PROYECTOS_MENSUAL_2026).filter(p => (p.meses[8] || 0) > 0);

let totMat = 0, totServ = 0, totMod = 0, totHm = 0, totCif = 0, totSum = 0;

projs.forEach(p => {
  const cat = p.byCategoriaMes[8] || {};
  const m = p.meses[8] || 0;
  totMat += (cat["Materiales Directos"] || 0);
  totServ += (cat["Servicios"] || 0);
  totMod += (cat["Mano de Obra Directa"] || 0);
  totHm += (cat["Horas Maquina"] || 0);
  totCif += (cat["Costos Indirectos"] || 0);
  totSum += m;
  const catSum = (cat["Materiales Directos"] || 0) + (cat["Servicios"] || 0) + (cat["Mano de Obra Directa"] || 0) + (cat["Horas Maquina"] || 0) + (cat["Costos Indirectos"] || 0);
  console.log(`${p.cuentaAuxiliar} (${p.descripcion}): mes[8]=${m.toFixed(2)}, catSum=${catSum.toFixed(2)}, diff=${(m - catSum).toFixed(2)} | Mat=${(cat["Materiales Directos"] || 0).toFixed(2)}, Serv=${(cat["Servicios"] || 0).toFixed(2)}, MOD=${(cat["Mano de Obra Directa"] || 0).toFixed(2)}, HM=${(cat["Horas Maquina"] || 0).toFixed(2)}, CIF=${(cat["Costos Indirectos"] || 0).toFixed(2)}`);
});

console.log("\n--- TOTALS ACROSS PROJECTS IN SEPTEMBER ---");
console.log(`Tot Mat: ${totMat.toFixed(2)} (Official: 868.067)`);
console.log(`Tot Serv: ${totServ.toFixed(2)} (Official: 99.540)`);
console.log(`Tot MOD: ${totMod.toFixed(2)} (Official: 196.665)`);
console.log(`Tot HM: ${totHm.toFixed(2)} (Official: 55.578)`);
console.log(`Tot CIF: ${totCif.toFixed(2)} (Official: 393.375)`);
const grandCat = totMat + totServ + totMod + totHm + totCif;
console.log(`Grand Category Sum: ${grandCat.toFixed(2)}`);
console.log(`Grand mes[8] Sum: ${totSum.toFixed(2)}`);
console.log(`Official September: 1613225.00`);
console.log(`Diff: ${(grandCat - 1613225).toFixed(2)}`);
