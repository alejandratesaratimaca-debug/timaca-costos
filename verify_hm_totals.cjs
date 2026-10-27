const fs = require('fs');

const sepContent = fs.readFileSync('src/data/realSalidasSeptiembre2026.ts', 'utf8');
const eqIdxSep = sepContent.indexOf('=');
const startSep = sepContent.indexOf('[', eqIdxSep);
const endSep = sepContent.lastIndexOf(']');
const sepRecords = JSON.parse(sepContent.substring(startSep, endSep + 1));

const hmAll = sepRecords.filter(r => r.tipo === 'Horas Maquina');
const hmNonZero = hmAll.filter(r => r.cantidad > 0);
const hmZero = hmAll.filter(r => r.cantidad === 0);

console.log('Total HM records:', hmAll.length);
console.log('HM Zero records:', hmZero.length);
console.log('HM Non-Zero records:', hmNonZero.length);

const sumAllMonto = hmAll.reduce((s, r) => s + r.montoTotal, 0);
const sumNonZeroMonto = hmNonZero.reduce((s, r) => s + r.montoTotal, 0);
const sumAllHours = hmAll.reduce((s, r) => s + r.cantidad, 0);
const sumNonZeroHours = hmNonZero.reduce((s, r) => s + r.cantidad, 0);

console.log(`Sum All Monto: $${sumAllMonto.toFixed(2)}`);
console.log(`Sum Non-Zero Monto: $${sumNonZeroMonto.toFixed(2)}`);
console.log(`Sum All Hours: ${sumAllHours.toFixed(2)}`);
console.log(`Sum Non-Zero Hours: ${sumNonZeroHours.toFixed(2)}`);
