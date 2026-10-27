const fs = require('fs');

const sepContent = fs.readFileSync('src/data/realSalidasSeptiembre2026.ts', 'utf8');
const eqSep = sepContent.indexOf('=');
const sepRecords = JSON.parse(sepContent.substring(sepContent.indexOf('[', eqSep), sepContent.lastIndexOf(']') + 1));

const checkCodes = ['TTE-C-0680', 'TTE-C-0656', 'TTE-C-0671', 'TTE-C-0694', 'TTE-C-0688', 'TTE-C-0706'];

checkCodes.forEach(code => {
  console.log(`\n=== ${code} ===`);
  const recs = sepRecords.filter(r => r.cuentaAuxiliarCodigo === code && r.tipo === 'Servicios');
  recs.forEach(r => {
    console.log(`  ID: ${r.id} | Desc: ${r.descripcionPartida} | Fecha: ${r.fecha} | Total: $${r.montoTotal} | Prov: ${r.proveedor}`);
  });
});
