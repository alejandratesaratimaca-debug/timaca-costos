const fs = require('fs');

const sepContent = fs.readFileSync('src/data/realSalidasSeptiembre2026.ts', 'utf8');
const eqSep = sepContent.indexOf('=');
const sepRecords = JSON.parse(sepContent.substring(sepContent.indexOf('[', eqSep), sepContent.lastIndexOf(']') + 1));

const tteServices = sepRecords.filter(r => (r.cuentaAuxiliarCodigo || '').startsWith('TTE-C-') && r.tipo === 'Servicios');

const byTTE = {};
tteServices.forEach(r => {
  const c = r.cuentaAuxiliarCodigo;
  byTTE[c] = (byTTE[c] || 0) + (r.montoTotal || 0);
});

console.log('=== TTE-C- Accounts in September (Servicios) ===');
let total = 0;
for (const [k, v] of Object.entries(byTTE).sort((a,b) => b[1] - a[1])) {
  console.log(`${k}: $${v.toFixed(2)}`);
  total += v;
}
console.log(`TOTAL TTE-C- Servicios: $${total.toFixed(2)}`);
