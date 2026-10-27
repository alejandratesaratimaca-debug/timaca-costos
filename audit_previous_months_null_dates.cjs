const path = require('path');
const xlsx = require('./node_modules/xlsx');

console.log('=== AUDITORÍA HISTÓRICA: CELDAS NULL EN MESES ANTERIORES A SEPTIEMBRE 2026 ===');

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

console.log(`Total filas en la hoja Unificada: ${rows.length - 1}`);

// Vamos a recopilar TODOS los registros donde (Fecha is empty OR Mes is empty OR Ano is empty) AND Monto > 0
const allNullWithAmount = [];

for (let i = 1; i < rows.length; i++) {
  const row = rows[i];
  if (!row) continue;

  const f = row[colFecha];
  const m = row[colMes];
  const a = row[colAno];
  const monto = Number(row[colMonto]) || 0;

  const isFEmpty = f === undefined || f === null || String(f).trim() === '';
  const isMEmpty = m === undefined || m === null || String(m).trim() === '';
  const isAEmpty = a === undefined || a === null || String(a).trim() === '';

  if ((isFEmpty || isMEmpty || isAEmpty) && monto > 0) {
    allNullWithAmount.push({
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

console.log(`Total registros con Fecha/Mes/Año vacíos y Monto > 0 en todo el archivo: ${allNullWithAmount.length}`);

// Clasificar por período según fechas en el motivo, número de SC, o contenido textual
const clasificacion = {
  septiembre2026: [],
  agosto2026: [],
  julio2026: [],
  junio2026: [],
  mayo2026: [],
  abril2026: [],
  primerTrimestre2026: [],
  ano2025_o_anterior: [],
  regularizaciones_grandes_sin_periodo_claro: [],
  otros: []
};

allNullWithAmount.forEach(r => {
  const text = `${r.sc} ${r.oc} ${r.desc} ${r.motivo}`.toLowerCase();
  const scMatch = r.sc.match(/sc(\d+)/i);
  const scNum = scMatch ? parseInt(scMatch[1]) : 0;

  // Detectar fechas textuales específicas
  const match2025 = text.match(/\b(2025|25)\b/);
  const is2025 = text.includes('/2025') || text.includes('/25') || text.includes('2025');

  if (text.includes('/09/2026') || text.includes('/09/26') || text.includes('septiembre') || (scNum >= 25800 && !text.includes('/08/26') && !text.includes('/08/2026') && !text.includes('/07/26') && !text.includes('/06/26'))) {
    clasificacion.septiembre2026.push(r);
  } else if (text.includes('/08/2026') || text.includes('/08/26') || text.includes('agosto') || (scNum >= 24600 && scNum < 25800)) {
    clasificacion.agosto2026.push(r);
  } else if (text.includes('/07/2026') || text.includes('/07/26') || text.includes('julio') || (scNum >= 23700 && scNum < 24600)) {
    clasificacion.julio2026.push(r);
  } else if (text.includes('/06/2026') || text.includes('/06/26') || text.includes('junio') || (scNum >= 22500 && scNum < 23700)) {
    clasificacion.junio2026.push(r);
  } else if (text.includes('/05/2026') || text.includes('/05/26') || text.includes('mayo') || (scNum >= 21500 && scNum < 22500)) {
    clasificacion.mayo2026.push(r);
  } else if (text.includes('/04/2026') || text.includes('/04/26') || text.includes('abril') || (scNum >= 20000 && scNum < 21500)) {
    clasificacion.abril2026.push(r);
  } else if (scNum >= 18000 && scNum < 20000) {
    clasificacion.primerTrimestre2026.push(r);
  } else if (scNum > 0 && scNum < 18000) {
    clasificacion.ano2025_o_anterior.push(r);
  } else if (text.includes('regularizacion') || text.includes('oc internacional')) {
    clasificacion.regularizaciones_grandes_sin_periodo_claro.push(r);
  } else {
    clasificacion.otros.push(r);
  }
});

console.log('\n--- RESUMEN POR PERÍODO ESTIMADO DE LOS REGISTROS CON FECHA/MES NULL ---');
for (const [periodo, list] of Object.entries(clasificacion)) {
  const sum = list.reduce((a, b) => a + b.monto, 0);
  console.log(`> [${periodo}]: ${list.length} registros | Total: $${sum.toLocaleString('de-DE', { minimumFractionDigits: 2 })} USD`);
}
