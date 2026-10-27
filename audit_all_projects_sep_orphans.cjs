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

// Buscar todos los registros en el Master Unificado donde Fecha/Mes/Año es NULL, Monto > 0,
// y cuyo motivo, SC (>= SC25800), OC o texto indica claramente que corresponde a SEPTIEMBRE 2026
const allSepOrphans = [];

for (let i = 1; i < rows.length; i++) {
  const row = rows[i];
  if (!row) continue;
  
  const f = row[colFecha];
  const m = row[colMes];
  const a = row[colAno];
  const monto = Number(row[colMonto]) || 0;

  if ((!f || !m || !a) && monto > 0) {
    const sc = String(row[colNumero] || '');
    const oc = String(row[colPedido] || '');
    const desc = String(row[colDesc] || '');
    const motivo = String(row[colMotivo] || '');
    const cta = String(row[colCuentaAux] || '');
    const tipo = String(row[colTipo] || '');
    
    const combined = `${sc} ${oc} ${desc} ${motivo}`.toLowerCase();
    
    // Filtro estricto para Septiembre 2026
    const hasSepDate = combined.includes('/09/2026') || combined.includes('/09/26') || combined.includes('septiembre') || combined.includes(' 09/26');
    const scMatch = sc.match(/sc(\d+)/i);
    const scNum = scMatch ? parseInt(scMatch[1]) : 0;
    const isRecentSC = scNum >= 25800 && !combined.includes('/08/26') && !combined.includes('/08/2026') && !combined.includes('/07/26') && !combined.includes('/06/26');

    if (hasSepDate || isRecentSC) {
      allSepOrphans.push({
        fila: i + 1,
        cta,
        tipo,
        sc,
        oc,
        desc,
        motivo,
        monto
      });
    }
  }
}

console.log(`=== TOTAL REGISTROS HUÉRFANOS DE SEPTIEMBRE 2026 ENCONTRADOS: ${allSepOrphans.length} ===`);
const totalMonto = allSepOrphans.reduce((a, b) => a + b.monto, 0);
console.log(`MONTO TOTAL HUÉRFANO: $${totalMonto.toFixed(2)} USD\n`);

// Agrupar por Proyecto / Cuenta-Aux
const porCta = {};
allSepOrphans.forEach(r => {
  if (!porCta[r.cta]) porCta[r.cta] = [];
  porCta[r.cta].push(r);
});

for (const [cta, list] of Object.entries(porCta)) {
  const sum = list.reduce((a, b) => a + b.monto, 0);
  console.log(`\n======================================================`);
  console.log(`PROYECTO: [${cta}] · ${list.length} registros · Total: $${sum.toFixed(2)} USD`);
  console.log(`======================================================`);
  list.forEach(r => {
    console.log(`Fila ${r.fila} | SC: ${r.sc} | OC: ${r.oc} | Tipo: ${r.tipo} | Monto: $${r.monto} | Desc: ${r.desc}`);
    console.log(`   Motivo: ${r.motivo.replace(/\r?\n/g, ' ').substring(0, 130)}`);
  });
}
