import { COSTOS_INDIRECTOS_CONSOLIDADO_OFICIAL, COSTOS_INDIRECTOS_POR_CATEGORIAS } from './src/data/mockDesgloseCategorias.js';

console.log('COSTOS_INDIRECTOS_CONSOLIDADO_OFICIAL (Proyectos):');
let totAgo = 0;
let totSep = 0;
COSTOS_INDIRECTOS_CONSOLIDADO_OFICIAL.forEach(c => {
  totAgo += c.ago || 0;
  totSep += c.sep || 0;
  console.log(`- ${c.ctaAuxiliar}: Ago $${c.ago}, Sep $${c.sep} (${c.porcentaje}%)`);
});

console.log(`TOTAL AGOSTO: $${totAgo.toLocaleString()} USD`);
console.log(`TOTAL SEPTIEMBRE: $${totSep.toLocaleString()} USD`);
