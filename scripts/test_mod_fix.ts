import { MATRIZ_REAL_PROYECTOS_MENSUAL_2026 } from '../src/data/realProyectosMensual2026';
import { DESGLOSE_NOMINA_SEPTIEMBRE_PROYECTOS } from '../src/data/mockCostosTimaca';

console.log("=== SIMULATING PROJECT MATRIX UPDATE WITH OFFICIAL SEPTEMBER MOD ===");

const officialModMap = new Map<string, number>();
DESGLOSE_NOMINA_SEPTIEMBRE_PROYECTOS.forEach(d => officialModMap.set(d.cta, d.monto));

const projs = Object.values(MATRIZ_REAL_PROYECTOS_MENSUAL_2026);

let newTotalSep = 0;
const listSep: { cta: string, desc: string, total: number, mat: number, serv: number, mod: number, hm: number, cif: number }[] = [];

projs.forEach(p => {
  const cat = p.byCategoriaMes[8];
  if (!cat) return;
  const mat = cat["Materiales Directos"] || 0;
  const serv = cat["Servicios"] || 0;
  const mod = officialModMap.get(p.cuentaAuxiliar) || 0;
  const hm = cat["Horas Maquina"] || 0;
  const cif = cat["Costos Indirectos"] || 0;
  const total = mat + serv + mod + hm + cif;
  if (total > 0) {
    newTotalSep += total;
    listSep.push({ cta: p.cuentaAuxiliar, desc: p.descripcion, total, mat, serv, mod, hm, cif });
  }
});

listSep.sort((a, b) => b.total - a.total);

console.log(`Total projects in Sep: ${listSep.length}`);
console.log(`Sum of all projects in Sep: ${newTotalSep.toFixed(2)}`);
console.log(`Target: 1613225.00 | Diff: ${(newTotalSep - 1613225).toFixed(2)}\n`);

console.log("Top 10 projects:");
let top10Sum = 0;
listSep.slice(0, 10).forEach((p, i) => {
  top10Sum += p.total;
  console.log(`${i+1}. [${p.cta}] ${p.desc.slice(0, 35)}: $${p.total.toLocaleString('de-DE')} (${((p.total/1613225)*100).toFixed(1)}%) | MOD=$${p.mod}`);
});

console.log(`\nTop 10 Sum: $${top10Sum.toLocaleString('de-DE')} (${((top10Sum/1613225)*100).toFixed(1)}%)`);
const restSum = listSep.slice(10).reduce((a, b) => a + b.total, 0);
console.log(`Remaining ${listSep.length - 10} projects Sum: $${restSum.toLocaleString('de-DE')}`);
console.log(`Total: $${(top10Sum + restSum).toLocaleString('de-DE')}`);
