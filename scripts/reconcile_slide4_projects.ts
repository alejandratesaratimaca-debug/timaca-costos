import { CUENTAS_AUXILIARES_EXACTAS_SEPTIEMBRE_2026 } from '../src/data/mockCostosTimaca';
import { MATRIZ_REAL_PROYECTOS_MENSUAL_2026 } from '../src/data/realProyectosMensual2026';

console.log("=== INSPECTING SEPTEMBER PROJECTS ===");
const projs = CUENTAS_AUXILIARES_EXACTAS_SEPTIEMBRE_2026;
console.log(`Total projects: ${projs.length}`);
let runningSum = 0;
projs.forEach((p, idx) => {
  runningSum += p.montoSeptiembre;
  console.log(`${idx + 1}. [${p.cuentaAuxiliar}] ${p.proyectoCorto}: $${p.montoSeptiembre.toLocaleString('de-DE')} | RunningSum = $${runningSum.toLocaleString('de-DE')}`);
});

console.log(`\nTotal Sum 25 projs: ${runningSum.toLocaleString('de-DE')}`);
console.log(`Target Month Total: 1.613.225`);
console.log(`Difference (excess): ${(runningSum - 1613225).toLocaleString('de-DE')}`);
