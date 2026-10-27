const fs = require('fs');

console.log('=== COMPREHENSIVE AUDIT OF ALL ACCOUNTS & DATASETS ===\n');

// 1. Septiembre 2026
const sepContent = fs.readFileSync('src/data/realSalidasSeptiembre2026.ts', 'utf8');
const eqSep = sepContent.indexOf('=');
const sepRecords = JSON.parse(sepContent.substring(sepContent.indexOf('[', eqSep), sepContent.lastIndexOf(']') + 1));

console.log(`--- SETIEMBRE 2026 (Total: ${sepRecords.length} records) ---`);
const byTipoSep = {};
const mathDiscrepanciesSep = [];
const zeroCantSep = [];
const zeroMontoSep = [];

sepRecords.forEach(r => {
  byTipoSep[r.tipo] = (byTipoSep[r.tipo] || 0) + 1;
  const expected = (r.cantidad || 0) * (r.montoUnitario || 0);
  const diff = Math.abs(expected - (r.montoTotal || 0));
  if (diff > 0.05) {
    mathDiscrepanciesSep.push({ id: r.id, tipo: r.tipo, cant: r.cantidad, unit: r.montoUnitario, total: r.montoTotal, expected });
  }
  if (r.cantidad === 0) zeroCantSep.push(r);
  if (r.montoTotal === 0) zeroMontoSep.push(r);
});

console.log('Records by Tipo:', byTipoSep);
console.log('Math discrepancies (|cant * unit - total| > 0.05):', mathDiscrepanciesSep.length);
console.log('Zero cantidad records:', zeroCantSep.length);
console.log('Zero monto records:', zeroMontoSep.length);

// Accounts summary in September
const accountsSep = {};
sepRecords.forEach(r => {
  const code = r.cuentaAuxiliarCodigo || 'SIN_CUENTA';
  if (!accountsSep[code]) {
    accountsSep[code] = { name: r.cuentaAuxiliarNombre || r.proyecto, totalUSD: 0, count: 0, tipos: {} };
  }
  accountsSep[code].totalUSD += (r.montoTotal || 0);
  accountsSep[code].count++;
  accountsSep[code].tipos[r.tipo] = (accountsSep[code].tipos[r.tipo] || 0) + (r.montoTotal || 0);
});

console.log(`\nTotal unique accounts in September: ${Object.keys(accountsSep).length}`);
Object.entries(accountsSep)
  .sort((a, b) => b[1].totalUSD - a[1].totalUSD)
  .slice(0, 10)
  .forEach(([code, acc]) => {
    console.log(`Account ${code} (${acc.name.substring(0, 40)}): $${acc.totalUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD (${acc.count} records)`);
  });

// Check fractional quantities in September
const fractionalQuantities = sepRecords.filter(r => r.cantidad % 1 !== 0);
console.log(`\nRecords with fractional quantities in September: ${fractionalQuantities.length}`);
const fractionalByType = {};
fractionalQuantities.forEach(r => {
  fractionalByType[r.tipo] = (fractionalByType[r.tipo] || 0) + 1;
});
console.log('Fractional quantities by tipo:', fractionalByType);
