const path = require('path');
const xlsx = require(path.join(__dirname, 'node_modules', 'xlsx'));

console.log('--- AUDITORÍA INTEGRAL DE REGISTROS CON FECHA/MES NULL EN 4 MASTER UNIFICADO.XLSX ---');
const wb = xlsx.readFile('C:/Users/alejandratesara/Desktop/Alejandra T/Costos Alejandra/1 Informe/4 Master Unificado.xlsx');
const sheet = wb.Sheets['Unificada'];
const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });
const headers = rows[0];

const colTipo = headers.indexOf('Tipo');
const colAlmacen = headers.indexOf('Almacen');
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

console.log(`Total filas en Unificada: ${rows.length - 1}`);

const nullDateRowsWithAmount = [];
const nullDateRowsZeroAmount = [];

for (let i = 1; i < rows.length; i++) {
  const row = rows[i];
  if (!row || row.length === 0) continue;

  const fechaVal = row[colFecha];
  const mesVal = row[colMes];
  const anoVal = row[colAno];
  const monto = Number(row[colMonto]) || 0;

  const isFechaEmpty = fechaVal === undefined || fechaVal === null || String(fechaVal).trim() === '';
  const isMesEmpty = mesVal === undefined || mesVal === null || String(mesVal).trim() === '';
  const isAnoEmpty = anoVal === undefined || anoVal === null || String(anoVal).trim() === '';

  if (isFechaEmpty || isMesEmpty || isAnoEmpty) {
    const item = {
      fila: i + 1,
      tipo: row[colTipo] || '',
      almacen: row[colAlmacen] || '',
      fecha: fechaVal,
      mes: mesVal,
      ano: anoVal,
      numero: row[colNumero] || '',
      pedido: row[colPedido] || '',
      cuentaAux: row[colCuentaAux] || '',
      codigo: row[colCodigo] || '',
      descripcion: row[colDesc] || '',
      motivo: row[colMotivo] || '',
      monto: monto
    };

    if (monto > 0) {
      nullDateRowsWithAmount.push(item);
    } else {
      nullDateRowsZeroAmount.push(item);
    }
  }
}

console.log(`\nRegistros con Fecha/Mes/Año vacíos Y Monto > 0: ${nullDateRowsWithAmount.length}`);
console.log(`Registros con Fecha/Mes/Año vacíos Y Monto == 0: ${nullDateRowsZeroAmount.length}`);

// Agrupar los registros con Monto > 0 por Proyecto y Tipo
const porProyecto = {};
nullDateRowsWithAmount.forEach(r => {
  const key = r.cuentaAux || 'SIN_CUENTA';
  if (!porProyecto[key]) porProyecto[key] = [];
  porProyecto[key].push(r);
});

console.log('\n--- RESUMEN POR PROYECTO (REGISTROS HUÉRFANOS CON MONTO > 0) ---');
for (const [pry, list] of Object.entries(porProyecto)) {
  const totalUSD = list.reduce((acc, x) => acc + x.monto, 0);
  console.log(`\n>>> Proyecto [${pry}]: ${list.length} registros | Total: $${totalUSD.toFixed(2)} USD`);
  list.forEach(r => {
    console.log(`  Fila ${r.fila} | SC: ${r.numero} | OC: ${r.pedido} | Tipo: ${r.tipo} | Monto: $${r.monto} | Desc: ${r.descripcion}`);
    if (r.motivo) console.log(`     Motivo: ${r.motivo.replace(/\r?\n/g, ' ')}`);
  });
}
