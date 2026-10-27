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

console.log('=== AUDITORÍA DE DESFASE EN TRASLADO DE PERSONAL Y BAÑOS A LO LARGO DE 2026 ===');

const trasladosYBanos = [];

for (let i = 1; i < rows.length; i++) {
  const row = rows[i];
  if (!row) continue;
  const desc = String(row[colDesc] || '').toLowerCase();
  const motivo = String(row[colMotivo] || '').toLowerCase();
  const cta = String(row[colCuentaAux] || '');

  const isTraslado = desc.includes('traslado de personal') || desc.includes('servicio traslado de personal');
  const isBano = desc.includes('baño') || desc.includes('sanitario') || motivo.includes('baño portátil') || motivo.includes('baños portatiles') || motivo.includes('modulo sanitario') || motivo.includes('módulo sanitario');

  if (isTraslado || isBano) {
    trasladosYBanos.push({
      fila: i + 1,
      cta,
      sc: String(row[colNumero] || ''),
      oc: String(row[colPedido] || ''),
      desc: row[colDesc],
      monto: Number(row[colMonto]) || 0,
      fechaSerial: row[colFecha],
      mes: row[colMes],
      motivo: row[colMotivo]
    });
  }
}

// Filtrar los más relevantes con montos mayores a $500 USD
console.log(`\nTotal órdenes mayores a $500 USD en transporte y módulos sanitarios: ${trasladosYBanos.filter(x => x.monto >= 500).length}`);

trasladosYBanos.filter(x => x.monto >= 500).forEach(r => {
  // Extraer fecha del motivo si existe
  const dateMatch = String(r.motivo).match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](2026|26|2025|25)/);
  const dateStr = dateMatch ? dateMatch[0] : 'Sin fecha en texto';
  console.log(`Fila ${r.fila} | Cta: [${r.cta}] | SC: ${r.sc} | OC: ${r.oc} | Monto: $${r.monto} | Mes Excel: [${r.mes || 'NULL'}] | Fecha Excel: [${r.fechaSerial || 'NULL'}]`);
  console.log(`   Fecha detectada en Motivo: [${dateStr}]`);
  console.log(`   Motivo: ${String(r.motivo).substring(0, 110)}`);
});
