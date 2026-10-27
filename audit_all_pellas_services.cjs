const path = require('path');
const xlsx = require(path.join(__dirname, 'node_modules', 'xlsx'));

const wb = xlsx.readFile('C:/Users/alejandratesara/Desktop/Alejandra T/Costos Alejandra/1 Informe/4 Master Unificado.xlsx');
const sheet = wb.Sheets['Unificada'];
const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });
const headers = rows[0];

const colTipo = headers.indexOf('Tipo');
const colFecha = headers.indexOf('Fecha');
const colNumero = headers.indexOf('Numero');
const colPedido = headers.indexOf('Pedido');
const colCuentaAux = headers.indexOf('Cuenta-Aux');
const colCodigo = headers.indexOf('Codigo');
const colDesc = headers.indexOf('Descripcion');
const colMotivo = headers.indexOf('motivo');
const colMonto = headers.indexOf('Total USD');
const colMes = headers.indexOf('Nombre del mes');
const colAno = headers.indexOf('Año');

console.log(`Indices: Tipo=${colTipo}, CuentaAux=${colCuentaAux}, Mes=${colMes}, Monto=${colMonto}`);

const allPellasServices = [];

for (let i = 1; i < rows.length; i++) {
  const row = rows[i];
  const cta = String(row[colCuentaAux] || '');
  const tipo = String(row[colTipo] || '');
  if (cta.includes('TTE-C-0706') && tipo.toLowerCase().includes('servicio')) {
    allPellasServices.push({
      fila: i + 1,
      fechaRaw: row[colFecha],
      numero: row[colNumero],
      pedido: row[colPedido],
      codigo: row[colCodigo],
      descripcion: row[colDesc],
      motivo: row[colMotivo],
      monto: row[colMonto],
      mes: row[colMes],
      ano: row[colAno]
    });
  }
}

console.log(`Total servicios Pellas encontrados en Master Unificado: ${allPellasServices.length}`);
console.log('\n--- LISTADO COMPLETO DE SERVICIOS PELLAS ---');
allPellasServices.forEach(s => {
  console.log(`Fila ${s.fila} | SC: ${s.numero} | OC: ${s.pedido} | Mes: ${s.mes || 'NULL'} | Fecha: ${s.fechaRaw || 'NULL'} | Monto: $${s.monto} | Desc: ${s.descripcion}`);
  if (s.motivo) console.log(`   Motivo: ${s.motivo}`);
});
