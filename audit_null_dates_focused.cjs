const path = require('path');
const xlsx = require(path.join(__dirname, 'node_modules', 'xlsx'));

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

console.log('=== 1. AUDITORÍA ESPECÍFICA PELLAS (TTE-C-0706) CON FECHA/MES NULL ===');
const pellasNull = [];
for (let i = 1; i < rows.length; i++) {
  const row = rows[i];
  if (!row) continue;
  const cta = String(row[colCuentaAux] || '');
  if (cta.includes('TTE-C-0706')) {
    const f = row[colFecha];
    const m = row[colMes];
    const a = row[colAno];
    const monto = Number(row[colMonto]) || 0;
    if (!f || !m || !a) {
      pellasNull.push({
        fila: i + 1,
        tipo: row[colTipo],
        numero: row[colNumero],
        pedido: row[colPedido],
        codigo: row[colCodigo],
        desc: row[colDesc],
        motivo: row[colMotivo],
        monto: monto,
        fecha: f,
        mes: m,
        ano: a
      });
    }
  }
}

console.log(`Total registros en Pellas con Fecha/Mes/Año NULL: ${pellasNull.length}`);
console.log(`- Con Monto > 0: ${pellasNull.filter(x => x.monto > 0).length}`);
console.log(`- Con Monto == 0: ${pellasNull.filter(x => x.monto === 0).length}`);

console.log('\n--- DETALLE DE REGISTROS PELLAS CON MONTO > 0 Y FECHA/MES NULL ---');
pellasNull.filter(x => x.monto > 0).forEach(r => {
  console.log(`Fila ${r.fila} | Tipo: [${r.tipo}] | SC: [${r.numero}] | OC: [${r.pedido}] | Monto: $${r.monto} | Desc: ${r.desc}`);
  if (r.motivo) console.log(`   Motivo: ${r.motivo.replace(/\r?\n/g, ' ')}`);
});

console.log('\n=== 2. AUDITORÍA DE BAÑOS PORTÁTILES / SANITARIOS (TODAS LAS CUENTAS) ===');
const banosRows = [];
for (let i = 1; i < rows.length; i++) {
  const row = rows[i];
  if (!row) continue;
  const str = JSON.stringify(row).toLowerCase();
  if (str.includes('baño') || str.includes('sanitario') || str.includes('sanitaria') || str.includes('bano')) {
    const f = row[colFecha];
    const m = row[colMes];
    const monto = Number(row[colMonto]) || 0;
    banosRows.push({
      fila: i + 1,
      cuenta: row[colCuentaAux],
      tipo: row[colTipo],
      numero: row[colNumero],
      pedido: row[colPedido],
      codigo: row[colCodigo],
      desc: row[colDesc],
      motivo: row[colMotivo],
      monto: monto,
      fecha: f,
      mes: m,
      ano: row[colAno]
    });
  }
}
console.log(`Total registros de Baños/Sanitarios encontrados: ${banosRows.length}`);
banosRows.forEach(r => {
  console.log(`Fila ${r.fila} | Cta: [${r.cuenta}] | Fecha: [${r.fecha}] | Mes: [${r.mes}] | Monto: $${r.monto} | SC: [${r.numero}] | OC: [${r.pedido}] | Desc: ${r.desc}`);
  if (r.motivo) console.log(`   Motivo: ${r.motivo.replace(/\r?\n/g, ' ')}`);
});

console.log('\n=== 3. AUDITORÍA DE SERVICIOS EN GENERAL CON FECHA/MES NULL (TODAS LAS CUENTAS) ===');
const serviciosNull = [];
for (let i = 1; i < rows.length; i++) {
  const row = rows[i];
  if (!row) continue;
  const tipo = String(row[colTipo] || '').toLowerCase();
  const monto = Number(row[colMonto]) || 0;
  if (tipo.includes('servicio') && monto > 0) {
    const f = row[colFecha];
    const m = row[colMes];
    const a = row[colAno];
    if (!f || !m || !a) {
      serviciosNull.push({
        fila: i + 1,
        cuenta: row[colCuentaAux],
        numero: row[colNumero],
        pedido: row[colPedido],
        codigo: row[colCodigo],
        desc: row[colDesc],
        motivo: row[colMotivo],
        monto: monto,
        fecha: f,
        mes: m,
        ano: a
      });
    }
  }
}
console.log(`Total servicios con Fecha/Mes NULL y Monto > 0: ${serviciosNull.length}`);
serviciosNull.forEach(r => {
  console.log(`Fila ${r.fila} | Cta: [${r.cuenta}] | Monto: $${r.monto} | SC: [${r.numero}] | OC: [${r.pedido}] | Desc: ${r.desc}`);
  if (r.motivo) console.log(`   Motivo: ${r.motivo.replace(/\r?\n/g, ' ')}`);
});

console.log('\n=== 4. AUDITORÍA DE COMPRAS / MATERIALES DIRECTOS CON FECHA/MES NULL Y MONTO > 0 ===');
const comprasNull = [];
for (let i = 1; i < rows.length; i++) {
  const row = rows[i];
  if (!row) continue;
  const tipo = String(row[colTipo] || '').toLowerCase();
  const monto = Number(row[colMonto]) || 0;
  if (!tipo.includes('servicio') && !tipo.includes('mano de obra') && !tipo.includes('horas maquina') && monto > 0) {
    const f = row[colFecha];
    const m = row[colMes];
    const a = row[colAno];
    if (!f || !m || !a) {
      comprasNull.push({
        fila: i + 1,
        tipo: row[colTipo],
        cuenta: row[colCuentaAux],
        numero: row[colNumero],
        pedido: row[colPedido],
        codigo: row[colCodigo],
        desc: row[colDesc],
        motivo: row[colMotivo],
        monto: monto,
        fecha: f,
        mes: m,
        ano: a
      });
    }
  }
}
console.log(`Total compras/materiales con Fecha/Mes NULL y Monto > 0: ${comprasNull.length}`);
comprasNull.slice(0, 30).forEach(r => {
  console.log(`Fila ${r.fila} | Cta: [${r.cuenta}] | Tipo: [${r.tipo}] | Monto: $${r.monto} | SC: [${r.numero}] | OC: [${r.pedido}] | Desc: ${r.desc}`);
  if (r.motivo) console.log(`   Motivo: ${r.motivo ? r.motivo.substring(0, 100) : ''}`);
});
