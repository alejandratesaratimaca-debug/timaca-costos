const fs = require('fs');

const c = fs.readFileSync('src/data/mockDesgloseCategorias.ts', 'utf8');

// Find all project rubros for Costos Indirectos
const cifObjIdx = c.indexOf('\'Costos Indirectos\': {');
if (cifObjIdx !== -1) {
  const cifEnd = c.indexOf('// 1. Matriz Oficial de Costos Indirectos a Prorratear', cifObjIdx);
  const block = c.substring(cifObjIdx, cifEnd);
  
  // Sum ago for Nomina -TALLERES and Incentivos Laborales across projects
  let talleresAgo = 0;
  let bonosAgo = 0;
  let nominaTimacaAgo = 0;
  
  const lines = block.split('\n');
  lines.forEach(l => {
    if (l.includes('Nomina -TALLERES')) {
      const match = l.match(/ago:\s*(\d+)/);
      if (match) talleresAgo += parseInt(match[1]);
    }
    if (l.includes('Incentivos Laborales')) {
      const match = l.match(/ago:\s*(\d+)/);
      if (match) bonosAgo += parseInt(match[1]);
    }
    if (l.includes('Nomina Interna TIMACA') || l.includes('Nomina TIMACA')) {
      const match = l.match(/ago:\s*(\d+)/);
      if (match) nominaTimacaAgo += parseInt(match[1]);
    }
  });
  
  console.log('Sum in project breakdown for Agosto:');
  console.log('  Nomina -TALLERES ago sum:', talleresAgo);
  console.log('  Incentivos Laborales ago sum:', bonosAgo);
  console.log('  Nomina Interna TIMACA ago sum:', nominaTimacaAgo);
}
