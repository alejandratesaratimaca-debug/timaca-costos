const fs = require('fs');

const sepPath = 'src/data/realSalidasSeptiembre2026.ts';
const sepContent = fs.readFileSync(sepPath, 'utf8');

const eqSep = sepContent.indexOf('=');
const prefix = sepContent.substring(0, sepContent.indexOf('[', eqSep));
const sepRecords = JSON.parse(sepContent.substring(sepContent.indexOf('[', eqSep), sepContent.lastIndexOf(']') + 1));

console.log('Original records in realSalidasSeptiembre2026:', sepRecords.length);

// Filter out Horas Maquina with 0 cantidad or 0 monto
const cleanRecords = sepRecords.filter(r => {
  if (r.tipo === 'Horas Maquina' && ((r.cantidad === 0) || (r.montoTotal === 0) || ((r.montoTotal || 0) < 0.001))) {
    return false;
  }
  return true;
});

console.log('Clean records in realSalidasSeptiembre2026:', cleanRecords.length);
console.log('Removed zero HM records:', sepRecords.length - cleanRecords.length);

const newContent = `${prefix}${JSON.stringify(cleanRecords, null, 2)};\n`;
fs.writeFileSync(sepPath, newContent, 'utf8');
console.log('realSalidasSeptiembre2026.ts saved successfully without zero HM!');
