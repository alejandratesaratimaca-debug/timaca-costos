import { SALIDAS_REALES_SEPTIEMBRE_2026 } from '../src/data/realSalidasSeptiembre2026';

const hmSep = SALIDAS_REALES_SEPTIEMBRE_2026.filter(s => (s.tipo === 'Horas Maquina' || s.categoria === 'Horas Maquina') && s.cuentaAuxiliarCodigo === 'TTE-C-0706');

const byEq: Record<string, { codigo: string, equipo: string, tarifa: number, totalHM: number, costoTotalHM: number }> = {};

hmSep.forEach(s => {
  const code = s.codigoSalida?.replace(/-\d+$/, '') || s.codigo || 'EQ';
  // Let's get clean equipment name from descripcion
  const fullDesc = s.itemDescripcion || s.descripcion || '';
  const eqName = fullDesc.split(' - Placa')[0].split(' - Serial')[0].split(' Serial')[0].trim();
  const tarifa = s.montoUnitario || 0;
  const key = `${eqName}_${tarifa}`;
  
  if (!byEq[key]) {
    byEq[key] = {
      codigo: s.codigoSalida?.slice(0, 10) || '',
      equipo: eqName,
      tarifa: tarifa,
      totalHM: 0,
      costoTotalHM: 0
    };
  }
  byEq[key].totalHM += (s.cantidad || 0);
  byEq[key].costoTotalHM += s.montoTotal;
});

const list = Object.values(byEq).sort((a,b) => b.costoTotalHM - a.costoTotalHM);
console.log('--- RESUMEN EQUIPOS HORAS MAQUINA SEPTIEMBRE (TOTAL: $' + list.reduce((a,b) => a+b.costoTotalHM, 0).toFixed(2) + ') ---');
console.table(list.map(e => ({
  equipo: e.equipo,
  tarifa: Math.round(e.tarifa * 100) / 100,
  horas: Math.round(e.totalHM * 10) / 10,
  costo: Math.round(e.costoTotalHM * 100) / 100
})));
const totalHoras = list.reduce((a,b) => a+b.totalHM, 0);
console.log('TOTAL HORAS:', totalHoras);
