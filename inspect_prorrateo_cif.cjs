const fs = require('fs');

// Check mockDesgloseCategorias.ts for September prorrateo percentages and amounts
const c = fs.readFileSync('src/data/mockDesgloseCategorias.ts', 'utf8');

const sIdx = c.indexOf('COSTOS_INDIRECTOS_CONSOLIDADO_OFICIAL: FilaDesgloseMensual[]');
if (sIdx !== -1) {
  const endIdx = c.indexOf('];', sIdx);
  console.log(c.substring(sIdx, endIdx + 2));
}

const rubrosIdx = c.indexOf('COSTOS_INDIRECTOS_POR_CATEGORIAS: FilaDesgloseMensual[]');
if (rubrosIdx !== -1) {
  const endRubros = c.indexOf('];', rubrosIdx);
  console.log('\n--- RUBROS CIF ---');
  console.log(c.substring(rubrosIdx, endRubros + 2));
}
