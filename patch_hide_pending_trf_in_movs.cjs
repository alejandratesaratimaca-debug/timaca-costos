const fs = require('fs');
const vm = require('vm');

let html = fs.readFileSync('public/trazabilidad.html', 'utf8').replace(/\r\n/g, '\n');

// 1. In VISTAS.cVales: hide TRF not RECIBIDA
const oldCVales = `  let rows = DB.vales.filter(v => {
    // Almacén: solo mostrar vales correspondientes a este almacén`;

const newCVales = `  let rows = DB.vales.filter(v => {
    // Las transferencias pendientes de recepción no deben mostrarse hasta que hayan sido aceptadas
    if (v.tipo === 'TRF' && v.estatus !== 'RECIBIDA') return false;
    // Almacén: solo mostrar vales correspondientes a este almacén`;

if (!html.includes(oldCVales)) {
  console.error('oldCVales not found!');
  process.exit(1);
}
html = html.replace(oldCVales, () => newCVales);

// 2. In VISTAS.cValesDet: hide TRF not RECIBIDA
const oldCValesDet = `  let rows = [];
  (DB.vales || []).forEach(v => {
    // Almacén destino / origen`;

const newCValesDet = `  let rows = [];
  (DB.vales || []).forEach(v => {
    // Las transferencias pendientes de recepción no deben mostrarse hasta que hayan sido aceptadas
    if (v.tipo === 'TRF' && v.estatus !== 'RECIBIDA') return;
    // Almacén destino / origen`;

if (!html.includes(oldCValesDet)) {
  console.error('oldCValesDet not found!');
  process.exit(1);
}
html = html.replace(oldCValesDet, () => newCValesDet);

// 3. In VISTAS.cKardex: hide pending TRF movs
const oldCKardex = `VISTAS.cKardex = p => {
  const q = ((p && p.q) || '').trim().toUpperCase();
  let rows = DB.movs.filter(m => m.origen === S.ctx || m.destino === S.ctx);`;

const newCKardex = `VISTAS.cKardex = p => {
  const q = ((p && p.q) || '').trim().toUpperCase();
  let rows = DB.movs.filter(m => (m.origen === S.ctx || m.destino === S.ctx) && !(m.tipo === 'TRF' && m.estNue === 'PENDIENTE DE RECEPCIÓN'));`;

if (!html.includes(oldCKardex)) {
  console.error('oldCKardex not found!');
  process.exit(1);
}
html = html.replace(oldCKardex, () => newCKardex);

// Convert back to CRLF
const finalHtml = html.replace(/\n/g, '\r\n');

// VALIDATE JS SYNTAX
const scriptStart = finalHtml.indexOf('<script>');
const scriptEnd = finalHtml.lastIndexOf('</script>');
const js = finalHtml.substring(scriptStart + 8, scriptEnd);
try {
  new vm.Script(js, { filename: 'trazabilidad_inline.js' });
  console.log('✅ JavaScript syntax PASSED with 0 errors!');
} catch (err) {
  console.error('❌ JS SYNTAX ERROR:', err);
  process.exit(1);
}

fs.writeFileSync('public/trazabilidad.html', finalHtml, 'utf8');
fs.writeFileSync('public/index.html', finalHtml, 'utf8');
fs.writeFileSync('public/200.html', finalHtml, 'utf8');

console.log('✅ Synchronized all 3 HTML files successfully!');
