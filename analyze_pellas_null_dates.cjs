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
    if ((!f || !m || !a) && monto > 0) {
      pellasNull.push({
        fila: i + 1,
        tipo: row[colTipo],
        sc: String(row[colNumero] || ''),
        oc: String(row[colPedido] || ''),
        desc: row[colDesc] || '',
        motivo: String(row[colMotivo] || ''),
        monto: monto
      });
    }
  }
}

console.log(`=== ANÁLISIS DE ${pellasNull.length} REGISTROS HUÉRFANOS DE PELLAS (MONTO > 0) ===\n`);

// Clasificar por tipo de caso
const septCandidates = [];
const regularizaciones = [];
const otros = [];

pellasNull.forEach(r => {
  const text = `${r.sc} ${r.oc} ${r.desc} ${r.motivo}`.toLowerCase();
  
  // Detectar si pertenece a septiembre según fechas en motivo o códigos SC recientes (SC259xx - SC26xxx)
  const isSepText = text.includes('/09/2026') || text.includes('/09/26') || text.includes('septiembre') || text.includes('sep');
  const scNumMatch = r.sc.match(/sc(\d+)/i);
  const scNum = scNumMatch ? parseInt(scNumMatch[1]) : 0;
  
  if (isSepText || (scNum >= 25800 && !text.includes('/08/26') && !text.includes('/08/2026') && !text.includes('/07/26'))) {
    septCandidates.push(r);
  } else if (text.includes('regularizacion') || text.includes('oc internacional') || scNum < 25000) {
    regularizaciones.push(r);
  } else {
    otros.push(r);
  }
});

console.log(`1. Candidatos directos a SEPTIEMBRE (Fechas 09/26 o SC >= 25800): ${septCandidates.length} registros | Total: $${septCandidates.reduce((a,b)=>a+b.monto,0).toFixed(2)} USD`);
septCandidates.forEach(r => {
  console.log(`  - Fila ${r.fila} | SC: ${r.sc} | OC: ${r.oc} | Tipo: ${r.tipo} | Monto: $${r.monto} | Desc: ${r.desc}`);
  console.log(`    Motivo: ${r.motivo.substring(0, 120)}`);
});

console.log(`\n2. Regularizaciones / Órdenes Internacionales históricas sin fecha: ${regularizaciones.length} registros | Total: $${regularizaciones.reduce((a,b)=>a+b.monto,0).toFixed(2)} USD`);
regularizaciones.forEach(r => {
  console.log(`  - Fila ${r.fila} | SC: ${r.sc} | OC: ${r.oc} | Monto: $${r.monto} | Desc: ${r.desc} | Motivo: ${r.motivo.substring(0, 90)}`);
});

console.log(`\n3. Otros casos huérfanos: ${otros.length} registros | Total: $${otros.reduce((a,b)=>a+b.monto,0).toFixed(2)} USD`);
otros.forEach(r => {
  console.log(`  - Fila ${r.fila} | SC: ${r.sc} | OC: ${r.oc} | Monto: $${r.monto} | Desc: ${r.desc} | Motivo: ${r.motivo.substring(0, 90)}`);
});
