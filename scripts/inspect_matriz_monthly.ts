import { MATRIZ_REAL_PROYECTOS_MENSUAL_2026 } from '../src/data/realProyectosMensual2026';
import { TOTALES_MESES_PPT } from '../src/data/mockCostosTimaca';

const projs = Object.values(MATRIZ_REAL_PROYECTOS_MENSUAL_2026);
console.log(`Total proyectos en MATRIZ: ${projs.length}`);

for (let m = 0; m < 9; m++) {
  const sumMonth = projs.reduce((acc, p) => acc + (p.meses[m] || 0), 0);
  console.log(`Mes ${m+1}: Matriz Sum = ${sumMonth.toFixed(2)} | PPT = ${TOTALES_MESES_PPT[m].total} | Diff = ${(sumMonth - TOTALES_MESES_PPT[m].total).toFixed(2)}`);
}

const totalAnualMatriz = projs.reduce((acc, p) => acc + p.totalAnual, 0);
const grandPPT = TOTALES_MESES_PPT.reduce((a, b) => a + b.total, 0);
console.log(`Total Anual Matriz = ${totalAnualMatriz.toFixed(2)} | Grand PPT = ${grandPPT} | Diff = ${(totalAnualMatriz - grandPPT).toFixed(2)}`);
