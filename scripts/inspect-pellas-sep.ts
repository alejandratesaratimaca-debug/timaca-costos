import { SALIDAS_REALES_SEPTIEMBRE_2026 } from '../src/data/realSalidasSeptiembre2026';

const pellasSep = SALIDAS_REALES_SEPTIEMBRE_2026.filter(s => s.cuentaAuxiliarCodigo === 'TTE-C-0706');
console.log('--- REGISTROS PELLAS SEPTIEMBRE 2026 ---');
console.log('Total registros:', pellasSep.length);

const byTipo: Record<string, { count: number, total: number }> = {};
pellasSep.forEach(s => {
  const t = s.tipo || 'Sin Tipo';
  if (!byTipo[t]) byTipo[t] = { count: 0, total: 0 };
  byTipo[t].count++;
  byTipo[t].total += s.montoTotal;
});

console.table(byTipo);

const hmRecords = pellasSep.filter(s => s.tipo === 'Horas Maquina' || s.categoria === 'Horas Maquina');
console.log('\n--- HORAS MAQUINA PELLAS (tipo o categoria) ---');
console.log('Total HM:', hmRecords.length);
console.table(hmRecords.map(s => ({
  cod: s.codigoSalida,
  desc: (s.itemDescripcion || s.descripcion || '').substring(0, 35),
  horas: s.cantidad,
  tarifa: s.montoUnitario,
  total: s.montoTotal
})));

const srvRecords = pellasSep.filter(s => s.tipo === 'Servicios');
console.log('\n--- SERVICIOS PELLAS ---');
console.log('Total Srv:', srvRecords.length);
console.table(srvRecords.map(s => ({
  cod: s.codigoSalida,
  desc: (s.itemDescripcion || s.descripcion || '').substring(0, 35),
  categoria: s.categoria,
  total: s.montoTotal
})));
