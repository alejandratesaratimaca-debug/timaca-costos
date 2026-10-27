const { SALIDAS_REALES_SEPTIEMBRE_2026 } = require('./src/data/realSalidasSeptiembre2026.ts');
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

const existingIds = new Set(SALIDAS_REALES_SEPTIEMBRE_2026.map(s => s.codigoSalida));

const missingSeptemberRecords = [];

for (let i = 1; i < rows.length; i++) {
  const row = rows[i];
  if (!row) continue;
  
  const f = row[colFecha];
  const m = row[colMes];
  const a = row[colAno];
  const monto = Number(row[colMonto]) || 0;

  if ((!f || !m || !a) && monto > 0) {
    const sc = String(row[colNumero] || '').trim();
    const oc = String(row[colPedido] || '').trim();
    const desc = String(row[colDesc] || '').trim();
    const motivo = String(row[colMotivo] || '').trim();
    const cta = String(row[colCuentaAux] || '').trim();
    const tipo = String(row[colTipo] || '').trim();
    
    const combined = `${sc} ${oc} ${desc} ${motivo}`.toLowerCase();
    
    const hasSepDate = combined.includes('/09/2026') || combined.includes('/09/26') || combined.includes('septiembre') || combined.includes(' 09/26');
    const scMatch = sc.match(/sc(\d+)/i);
    const scNum = scMatch ? parseInt(scMatch[1]) : 0;
    const isRecentSC = scNum >= 25800 && !combined.includes('/08/26') && !combined.includes('/08/2026') && !combined.includes('/07/26');

    if (hasSepDate || isRecentSC) {
      if (!existingIds.has(sc)) {
        missingSeptemberRecords.push({
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
}

console.log(`De los 94 registros candidatos de Septiembre:`);
console.log(`- Faltantes absolutos en SALIDAS_REALES_SEPTIEMBRE_2026: ${missingSeptemberRecords.length}`);
const missingTotal = missingSeptemberRecords.reduce((a, b) => a + b.monto, 0);
console.log(`- Monto total faltante: $${missingTotal.toFixed(2)} USD`);

// Resumen por categoría de servicio/compra
const porCat = {};
missingSeptemberRecords.forEach(r => {
  const cat = r.tipo || 'Sin Tipo';
  porCat[cat] = (porCat[cat] || 0) + r.monto;
});
console.log('\nPor Categoría:');
for (const [k, v] of Object.entries(porCat)) {
  console.log(`- ${k}: $${v.toFixed(2)} USD`);
}
