const { SALIDAS_REALES_SEPTIEMBRE_2026 } = require('./src/data/realSalidasSeptiembre2026.ts');

const traslados = SALIDAS_REALES_SEPTIEMBRE_2026.filter(s => 
  s.cuentaAuxiliarCodigo === 'TTE-C-0706' &&
  s.itemDescripcion.includes('TRASLADO DE PERSONAL')
);

console.log('Traslados encontrados en Septiembre:', traslados.length);
let total = 0;
traslados.forEach(t => {
  console.log(`- ${t.codigoSalida} | ${t.fecha} | $${t.montoTotal} | Motivo: ${t.motivo}`);
  total += t.montoTotal;
});
console.log('TOTAL TRASLADO SEPTIEMBRE:', total);
