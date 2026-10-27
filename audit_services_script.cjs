const fs = require('fs');

const sepContent = fs.readFileSync('src/data/realSalidasSeptiembre2026.ts', 'utf8');
const eqSep = sepContent.indexOf('=');
const sepRecords = JSON.parse(sepContent.substring(sepContent.indexOf('[', eqSep), sepContent.lastIndexOf(']') + 1));

const servicios = sepRecords.filter(r => r.tipo === 'Servicios');
console.log('Total Servicios records in sep:', servicios.length);
const totalMonto = servicios.reduce((acc, r) => acc + (r.montoTotal || 0), 0);
console.log('Total Servicios Monto:', totalMonto.toFixed(2));

const byAccount = {};
servicios.forEach(r => {
  const c = r.cuentaAuxiliarCodigo || 'OTRO';
  byAccount[c] = (byAccount[c] || 0) + (r.montoTotal || 0);
});

console.log('\nBy Account:');
for (const [k, v] of Object.entries(byAccount).sort((a,b) => b[1] - a[1])) {
  console.log(`  ${k}: $${v.toFixed(2)}`);
}

console.log('\n--- Details of All Non-Pellas Services ---');
servicios.filter(r => r.cuentaAuxiliarCodigo !== 'TTE-C-0706').forEach(r => {
  console.log(`${r.cuentaAuxiliarCodigo} | ${r.descripcionPartida} | $${r.montoTotal}`);
});
