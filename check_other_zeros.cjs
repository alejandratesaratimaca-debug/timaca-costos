const fs = require('fs');

// Check August 2026 zero records
const agoContent = fs.readFileSync('src/data/realUnificadaAugust2026.ts', 'utf8');
const eqIdxAgo = agoContent.indexOf('=');
const startAgo = agoContent.indexOf('[', eqIdxAgo);
const endAgo = agoContent.lastIndexOf(']');
const agoRecords = JSON.parse(agoContent.substring(startAgo, endAgo + 1));
const agoZeros = agoRecords.filter(r => r.cantidad === 0 || r.montoTotal === 0);
console.log('August zero records:', agoZeros.length);
agoZeros.forEach(r => {
  console.log(`Ago Zero -> ID: ${r.id}, Code: ${r.codigoSalida}, Item: ${r.itemDescripcion}, Tipo: ${r.tipo}, Cant: ${r.cantidad}, Monto: ${r.montoTotal}`);
});

// Check September 2026 extra zero record (21 vs 20)
const sepContent = fs.readFileSync('src/data/realSalidasSeptiembre2026.ts', 'utf8');
const eqIdxSep = sepContent.indexOf('=');
const startSep = sepContent.indexOf('[', eqIdxSep);
const endSep = sepContent.lastIndexOf(']');
const sepRecords = JSON.parse(sepContent.substring(startSep, endSep + 1));
const sepNonHmZeros = sepRecords.filter(r => r.tipo !== 'Horas Maquina' && (r.cantidad === 0 || r.montoTotal === 0));
console.log('\nSeptember Non-HM zero records:', sepNonHmZeros.length);
sepNonHmZeros.forEach(r => {
  console.log(`Sep Non-HM Zero -> ID: ${r.id}, Code: ${r.codigoSalida}, Item: ${r.itemDescripcion}, Tipo: ${r.tipo}, Cant: ${r.cantidad}, Monto: ${r.montoTotal}`);
});
