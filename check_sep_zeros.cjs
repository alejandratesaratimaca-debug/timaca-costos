const fs = require('fs');

const sepContent = fs.readFileSync('src/data/realSalidasSeptiembre2026.ts', 'utf8');
const eqIdxSep = sepContent.indexOf('=');
const startSep = sepContent.indexOf('[', eqIdxSep);
const endSep = sepContent.lastIndexOf(']');
const sepRecords = JSON.parse(sepContent.substring(startSep, endSep + 1));
const sepNonHmZeros = sepRecords.filter(r => r.tipo !== 'Horas Maquina' && (r.cantidad === 0 || r.montoTotal === 0));
console.log('September Non-HM zero records:', sepNonHmZeros.length);
sepNonHmZeros.forEach(r => {
  console.log(`Sep Non-HM Zero -> ID: ${r.id}, Code: ${r.codigoSalida}, Item: ${r.itemDescripcion}, Tipo: ${r.tipo}, Cant: ${r.cantidad}, Monto: ${r.montoTotal}`);
});
