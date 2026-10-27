const path = require('path');
const { SALIDAS_REALES_SEPTIEMBRE_2026 } = require('./src/data/realSalidasSeptiembre2026.ts');

console.log('Total registros en SALIDAS_REALES_SEPTIEMBRE_2026:', SALIDAS_REALES_SEPTIEMBRE_2026.length);

const pellasSalidas = SALIDAS_REALES_SEPTIEMBRE_2026.filter(s => 
  s.cuentaAuxiliarCodigo === 'TTE-C-0706' || 
  (s.proyecto && s.proyecto.includes('Pellas')) ||
  (s.cuentaAuxiliarNombre && s.cuentaAuxiliarNombre.includes('Pellas'))
);

console.log('Total registros Pellas Septiembre:', pellasSalidas.length);

const serviciosPellas = pellasSalidas.filter(s => 
  (s.tipo && s.tipo.toLowerCase().includes('servicio')) ||
  (s.categoria && s.categoria.toLowerCase().includes('servicio'))
);

console.log('Servicios Pellas Septiembre:', serviciosPellas.length);
serviciosPellas.forEach(s => {
  console.log(`- ID: ${s.id}, Codigo: ${s.codigoSalida}, Fecha: ${s.fecha}, Descripcion: ${s.itemDescripcion}, Monto: $${s.montoTotal}`);
});
