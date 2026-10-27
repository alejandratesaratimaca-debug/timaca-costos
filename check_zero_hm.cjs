const fs = require('fs');

const sepContent = fs.readFileSync('src/data/realSalidasSeptiembre2026.ts', 'utf8');
const eqSep = sepContent.indexOf('=');
const sepRecords = JSON.parse(sepContent.substring(sepContent.indexOf('[', eqSep), sepContent.lastIndexOf(']') + 1));

console.log('Total records in realSalidasSeptiembre2026:', sepRecords.length);

const zeroHM = sepRecords.filter(r => r.tipo === 'Horas Maquina' && (r.cantidad === 0 || r.montoTotal === 0));
console.log('Horas Maquina records with cantidad === 0 or montoTotal === 0:', zeroHM.length);

const nonZeroHM = sepRecords.filter(r => r.tipo === 'Horas Maquina' && r.cantidad > 0 && r.montoTotal > 0);
console.log('Horas Maquina records with cantidad > 0 and montoTotal > 0:', nonZeroHM.length);

const zeroHMTotalSum = zeroHM.reduce((a, b) => a + (b.montoTotal || 0), 0);
console.log('Sum of montoTotal of zeroHM records:', zeroHMTotalSum);

const nonZeroHMSum = nonZeroHM.reduce((a, b) => a + (b.montoTotal || 0), 0);
console.log('Sum of montoTotal of nonZeroHM records:', nonZeroHMSum);
