const fs = require('fs');

console.log('Reading realSalidasSeptiembre2026.ts...');
const content = fs.readFileSync('src/data/realSalidasSeptiembre2026.ts', 'utf8');

const marker = 'SALIDAS_REALES_SEPTIEMBRE_2026: SalidaCosto[] =';
const idx = content.indexOf(marker);
if (idx === -1) {
  console.error('Marker not found!');
  process.exit(1);
}

const eqIdx = content.indexOf('=', idx);
const arrayStart = content.indexOf('[', eqIdx);
const arrayEnd = content.lastIndexOf(']');
const jsonStr = content.substring(arrayStart, arrayEnd + 1);

// Parse JSON safely
let records;
try {
  records = JSON.parse(jsonStr);
} catch (e) {
  // Try fixing trailing commas or similar
  const cleaned = jsonStr.replace(/,\s*([\]}])/g, '$1');
  records = JSON.parse(cleaned);
}

console.log(`Successfully parsed ${records.length} records.`);

// 1. Horas Maquina analysis
const hmRecords = records.filter(r => r.tipo === 'Horas Maquina');
console.log(`\n=== HORAS MAQUINA ANALYSIS (Total: ${hmRecords.length}) ===`);

const zeroCant = hmRecords.filter(r => r.cantidad === 0);
const zeroMonto = hmRecords.filter(r => r.montoTotal === 0);
const fractionalCant = hmRecords.filter(r => r.cantidad % 1 !== 0);

console.log(`HM with cantidad === 0: ${zeroCant.length}`);
console.log(`HM with montoTotal === 0: ${zeroMonto.length}`);
console.log(`HM with fractional hours: ${fractionalCant.length}`);

// Breakdown of zero Cantidad
const zeroByCat = {};
const zeroByDesc = {};
zeroCant.forEach(r => {
  zeroByCat[r.categoria] = (zeroByCat[r.categoria] || 0) + 1;
  const descKey = r.itemDescripcion.substring(0, 50);
  zeroByDesc[descKey] = (zeroByDesc[descKey] || 0) + 1;
});

console.log('\nZero HM by Categoria:', zeroByCat);
console.log('\nTop item descriptions for 0 hours:', Object.entries(zeroByDesc).slice(0, 10));

// Breakdown of non-zero HM
const activeHm = hmRecords.filter(r => r.cantidad > 0);
console.log(`\nActive HM records (> 0 hrs): ${activeHm.length}`);
const activeByCat = {};
activeHm.forEach(r => {
  activeByCat[r.categoria] = (activeByCat[r.categoria] || 0) + 1;
});
console.log('Active HM by Categoria:', activeByCat);

// 2. All records analysis (check for any other zeros across the whole dataset)
console.log('\n=== ALL TYPES ZERO ANALYSIS ===');
const allZeroCant = records.filter(r => r.cantidad === 0);
const allZeroMonto = records.filter(r => r.montoTotal === 0);

const zerosByType = {};
records.forEach(r => {
  if (r.cantidad === 0 || r.montoTotal === 0) {
    zerosByType[r.tipo] = zerosByType[r.tipo] || { zeroCant: 0, zeroMonto: 0, bothZero: 0 };
    if (r.cantidad === 0 && r.montoTotal === 0) zerosByType[r.tipo].bothZero++;
    else if (r.cantidad === 0) zerosByType[r.tipo].zeroCant++;
    else if (r.montoTotal === 0) zerosByType[r.tipo].zeroMonto++;
  }
});
console.log('Zero records summary by tipo:', zerosByType);

// 3. Rounding / calculation discrepancies across all records:
// where Math.abs(cantidad * montoUnitario - montoTotal) > 0.05
const mathDiscrepancies = records.filter(r => {
  const expected = r.cantidad * r.montoUnitario;
  return Math.abs(expected - r.montoTotal) > 0.1;
});
console.log(`\nTotal records where (cantidad * montoUnitario !== montoTotal): ${mathDiscrepancies.length}`);
if (mathDiscrepancies.length > 0) {
  console.log('Samples of math discrepancies:');
  mathDiscrepancies.slice(0, 5).forEach(r => {
    console.log(`ID: ${r.id}, Tipo: ${r.tipo}, Cant: ${r.cantidad}, Unit: ${r.montoUnitario}, Total: ${r.montoTotal}, Expected: ${(r.cantidad * r.montoUnitario).toFixed(2)}`);
  });
}
