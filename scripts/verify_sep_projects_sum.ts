import { MATRIZ_REAL_PROYECTOS_MENSUAL_2026 } from '../src/data/realProyectosMensual2026';
import { CUENTAS_AUXILIARES_EXACTAS_SEPTIEMBRE_2026 } from '../src/data/mockCostosTimaca';

const projs = Object.values(MATRIZ_REAL_PROYECTOS_MENSUAL_2026);
const activeSep = projs.filter(p => (p.meses[8] || 0) > 0);
console.log('Total active accounts in September:', activeSep.length);

const sumSep = activeSep.reduce((acc, p) => acc + (p.meses[8] || 0), 0);
console.log('Exact sum of September:', sumSep);
console.log('Rounded sum:', Math.round(sumSep));

const top10 = CUENTAS_AUXILIARES_EXACTAS_SEPTIEMBRE_2026.slice(0, 10);
const rest15 = CUENTAS_AUXILIARES_EXACTAS_SEPTIEMBRE_2026.slice(10);

const top10Sum = top10.reduce((acc, p) => acc + p.montoSeptiembre, 0);
const rest15Sum = rest15.reduce((acc, p) => acc + p.montoSeptiembre, 0);

console.log('Top 10 Sum:', top10Sum, 'Round:', Math.round(top10Sum));
console.log('Rest 15 Sum:', rest15Sum, 'Round:', Math.round(rest15Sum));
console.log('Top 10 + Rest 15:', top10Sum + rest15Sum, 'Round:', Math.round(top10Sum + rest15Sum));

console.log('Top 3 concentration:');
const top3 = top10.slice(0, 3).reduce((acc, p) => acc + p.montoSeptiembre, 0);
console.log('Top 3 sum:', top3, 'Pct of 1613225:', ((top3 / 1613225) * 100).toFixed(2) + '%');
