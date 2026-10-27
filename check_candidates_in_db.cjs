const { SALIDAS_REALES_SEPTIEMBRE_2026 } = require('./src/data/realSalidasSeptiembre2026.ts');

const scList = [
  'SC26181', 'SC26002', 'SC26250', 
  'SC26014', 'SC26012', 'SC26291', 'SC26292', 'SC26288', 'SC26289', 'SC26290', 
  'SC26231', 'SC26124', 'SC26278', 'SC26277'
];

console.log('--- VERIFICANDO SI LOS 14 REGISTROS ESTÁN YA EN realSalidasSeptiembre2026.ts ---');
scList.forEach(sc => {
  const found = SALIDAS_REALES_SEPTIEMBRE_2026.filter(s => s.codigoSalida === sc);
  if (found.length > 0) {
    console.log(`[PRESENTE] ${sc}: ${found.length} registros (Monto: $${found.reduce((a,b)=>a+b.montoTotal,0)})`);
  } else {
    console.log(`[FALTANTE/HUÉRFANO] ${sc}`);
  }
});
