const path = require('path');
const xlsx = require('./node_modules/xlsx');

const wb = xlsx.readFile('C:/Users/alejandratesara/Desktop/Alejandra T/Costos Alejandra/1 Informe/4 Master Unificado.xlsx');
const sheet = wb.Sheets['Unificada'];
const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });
const headers = rows[0];

const colTipo = headers.indexOf('Tipo');
const colFecha = headers.indexOf('Fecha');
const colNumero = headers.indexOf('Numero');
const colPedido = headers.indexOf('Pedido');
const colCuentaAux = headers.indexOf('Cuenta-Aux');
const colDesc = headers.indexOf('Descripcion');
const colMotivo = headers.indexOf('motivo');
const colMonto = headers.indexOf('Total USD');
const colMes = headers.indexOf('Nombre del mes');
const colAno = headers.indexOf('Año');

// Extraer todos los registros con fecha/mes vacíos
const nullRecords = [];
for (let i = 1; i < rows.length; i++) {
  const row = rows[i];
  if (!row) continue;
  const f = row[colFecha];
  const m = row[colMes];
  const a = row[colAno];
  const monto = Number(row[colMonto]) || 0;

  if ((!f || !m || !a) && monto > 0) {
    nullRecords.push({
      fila: i + 1,
      tipo: String(row[colTipo] || '').trim(),
      cuenta: String(row[colCuentaAux] || '').trim(),
      sc: String(row[colNumero] || '').trim(),
      oc: String(row[colPedido] || '').trim(),
      desc: String(row[colDesc] || '').trim(),
      motivo: String(row[colMotivo] || '').trim(),
      monto: monto,
      fecha: f,
      mes: m,
      ano: a
    });
  }
}

console.log('=== 1. ANÁLISIS DE REGISTROS CON FECHA/MES NULL EN AGOSTO 2026 ===');
const agoNull = nullRecords.filter(r => {
  const text = `${r.sc} ${r.oc} ${r.desc} ${r.motivo}`.toLowerCase();
  const scMatch = r.sc.match(/sc(\d+)/i);
  const scNum = scMatch ? parseInt(scMatch[1]) : 0;
  return text.includes('/08/2026') || text.includes('/08/26') || text.includes('agosto') || (scNum >= 24600 && scNum < 25800 && !text.includes('/09/'));
});
console.log(`Total registros asociados a Agosto 2026: ${agoNull.length} | Monto: $${agoNull.reduce((a,b)=>a+b.monto,0).toFixed(2)} USD`);

// Agrupar Agosto por Tipo y Proyecto
const agoByTipo = {};
const agoByPry = {};
agoNull.forEach(r => {
  agoByTipo[r.tipo] = (agoByTipo[r.tipo] || 0) + r.monto;
  agoByPry[r.cuenta] = (agoByPry[r.cuenta] || 0) + r.monto;
});
console.log('Agosto por Tipo:', agoByTipo);
console.log('Agosto por Proyecto (Top 5):');
Object.entries(agoByPry).sort((a,b)=>b[1]-a[1]).slice(0, 5).forEach(([p, m]) => {
  console.log(`  - ${p}: $${m.toFixed(2)} USD`);
});
console.log('\nCasos principales de Agosto:');
agoNull.sort((a,b)=>b.monto-a.monto).slice(0, 15).forEach(r => {
  console.log(`  Fila ${r.fila} | Cta: [${r.cuenta}] | SC: ${r.sc} | Monto: $${r.monto} | Desc: ${r.desc} | Motivo: ${r.motivo.substring(0, 80)}`);
});

console.log('\n=== 2. ANÁLISIS DE REGISTROS CON FECHA/MES NULL EN JULIO 2026 ===');
const julNull = nullRecords.filter(r => {
  const text = `${r.sc} ${r.oc} ${r.desc} ${r.motivo}`.toLowerCase();
  const scMatch = r.sc.match(/sc(\d+)/i);
  const scNum = scMatch ? parseInt(scMatch[1]) : 0;
  return text.includes('/07/2026') || text.includes('/07/26') || text.includes('julio') || (scNum >= 23700 && scNum < 24600 && !text.includes('/08/') && !text.includes('/09/'));
});
console.log(`Total registros asociados a Julio 2026: ${julNull.length} | Monto: $${julNull.reduce((a,b)=>a+b.monto,0).toFixed(2)} USD`);
julNull.sort((a,b)=>b.monto-a.monto).slice(0, 10).forEach(r => {
  console.log(`  Fila ${r.fila} | Cta: [${r.cuenta}] | SC: ${r.sc} | Monto: $${r.monto} | Desc: ${r.desc} | Motivo: ${r.motivo.substring(0, 80)}`);
});

console.log('\n=== 3. ANÁLISIS DE REGISTROS CON FECHA/MES NULL EN JUNIO Y ANTERIORES ===');
const junNull = nullRecords.filter(r => {
  const text = `${r.sc} ${r.oc} ${r.desc} ${r.motivo}`.toLowerCase();
  const scMatch = r.sc.match(/sc(\d+)/i);
  const scNum = scMatch ? parseInt(scMatch[1]) : 0;
  return text.includes('/06/2026') || text.includes('/06/26') || text.includes('junio') || (scNum >= 22500 && scNum < 23700);
});
console.log(`Total registros asociados a Junio 2026: ${junNull.length} | Monto: $${junNull.reduce((a,b)=>a+b.monto,0).toFixed(2)} USD`);
junNull.sort((a,b)=>b.monto-a.monto).slice(0, 10).forEach(r => {
  console.log(`  Fila ${r.fila} | Cta: [${r.cuenta}] | SC: ${r.sc} | Monto: $${r.monto} | Desc: ${r.desc} | Motivo: ${r.motivo.substring(0, 80)}`);
});

console.log('\n=== 4. LAS GRANDES ÓRDENES SIN FECHA EN ABRIL Y MESES PREVIOS ===');
nullRecords.filter(r => r.monto >= 100000).forEach(r => {
  console.log(`  Fila ${r.fila} | Cta: [${r.cuenta}] | SC: ${r.sc} | OC: ${r.oc} | Monto: $${r.monto.toLocaleString('de-DE')} USD | Desc: ${r.desc} | Motivo: ${r.motivo.substring(0, 100)}`);
});
