const fs = require('fs');
const https = require('https');
const vm = require('vm');

const SUPABASE_URL = 'https://whbicbjvasvjufgjexxa.supabase.co';
const SUPABASE_KEY = 'sb_publishable_IVbzFr2TLWjMHKLogd4qzw_WU2ZwbNv';

// 1. UPDATE CLIENT FILES
let html = fs.readFileSync('public/trazabilidad.html', 'utf8').replace(/\r\n/g, '\n');

const targetGuardarLocalSolo = `function guardarLocalSolo() {
  try { localStorage.setItem(LS_KEY, JSON.stringify(DB)); } catch (e) { }
}

function guardar() {
  DB = deepCleanDB(DB);
  try {
    DB._actualizadoEn = new Date().toISOString();
    DB._actualizadoPor = (typeof S !== 'undefined' && S && S.u) ? S.u.usuario : 'SISTEMA';
    localStorage.setItem(LS_KEY, JSON.stringify(DB));
  } catch (e) { /* sin almacenamiento disponible */ }
  if (typeof subirANubeDebounced === 'function') {
    subirANubeDebounced();
  }
}`;

const replaceGuardarLocalSolo = `function purgarDuplicadosCorregidos(dbObj) {
  if (!dbObj) return;
  if (Array.isArray(dbObj.vales)) {
    dbObj.vales = dbObj.vales.filter(v => !(v.num === 'DEV-0000002' && (String(v.fecha || '').startsWith('2026-11-03') || v.ref === 'PRH-0000019')));
  }
  if (Array.isArray(dbObj.movs)) {
    dbObj.movs = dbObj.movs.filter(m => !(m.doc === 'DEV-0000002' && (String(m.fecha || '').startsWith('2026-11-03') || m.obs === 'Ref. PRH-0000019')));
  }
}

function guardarLocalSolo() {
  purgarDuplicadosCorregidos(DB);
  try { localStorage.setItem(LS_KEY, JSON.stringify(DB)); } catch (e) { }
}

function guardar() {
  DB = deepCleanDB(DB);
  purgarDuplicadosCorregidos(DB);
  try {
    DB._actualizadoEn = new Date().toISOString();
    DB._actualizadoPor = (typeof S !== 'undefined' && S && S.u) ? S.u.usuario : 'SISTEMA';
    localStorage.setItem(LS_KEY, JSON.stringify(DB));
  } catch (e) { /* sin almacenamiento disponible */ }
  if (typeof subirANubeDebounced === 'function') {
    subirANubeDebounced();
  }
}`;

if (!html.includes(targetGuardarLocalSolo)) {
  console.error('targetGuardarLocalSolo not found!');
  process.exit(1);
}
html = html.replace(targetGuardarLocalSolo, () => replaceGuardarLocalSolo);

// In descargarDeNube:
const targetDescargar = `  DB = Object.assign({}, base, cloudDB);`;
const replaceDescargar = `  purgarDuplicadosCorregidos(cloudDB);
  DB = Object.assign({}, base, cloudDB);
  purgarDuplicadosCorregidos(DB);`;

if (!html.includes(targetDescargar)) {
  console.error('targetDescargar not found!');
  process.exit(1);
}
html = html.replace(targetDescargar, () => replaceDescargar);

// In minute auto-save:
const targetAutoSync = `await sincronizarConNube(true);`;
const replaceAutoSync = `purgarDuplicadosCorregidos(DB);
        await sincronizarConNube(false);`;

if (html.includes(targetAutoSync)) {
  html = html.replace(targetAutoSync, () => replaceAutoSync);
}

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
console.log('✅ Patched HTML files successfully!');

// 2. NOW PURGE FROM SUPABASE DIRECTLY
function fetchSupabase() {
  const url = `${SUPABASE_URL}/rest/v1/herramientas_vales?numero=eq.TIMACA_TRAZABILIDAD_V1_SYNC&select=*`;
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const rows = JSON.parse(data);
          const content = rows[0].lineas;
          resolve(typeof content === 'string' ? JSON.parse(content) : content);
        } catch(e) { reject(e); }
      });
    }).on('error', reject);
  });
}

function updateSupabase(db) {
  const payload = JSON.stringify({
    numero: 'TIMACA_TRAZABILIDAD_V1_SYNC',
    fecha: new Date().toISOString(),
    lineas: db,
    observaciones: 'Purga permanente de DEV-0000002 duplicado del 03/11/2026'
  });

  return new Promise((resolve, reject) => {
    const req = https.request(`${SUPABASE_URL}/rest/v1/herramientas_vales?numero=eq.TIMACA_TRAZABILIDAD_V1_SYNC`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function runSupabase() {
  const db = await fetchSupabase();
  const vBefore = (db.vales || []).length;
  const mBefore = (db.movs || []).length;

  db.vales = (db.vales || []).filter(v => !(v.num === 'DEV-0000002' && (String(v.fecha || '').startsWith('2026-11-03') || v.ref === 'PRH-0000019')));
  db.movs = (db.movs || []).filter(m => !(m.doc === 'DEV-0000002' && (String(m.fecha || '').startsWith('2026-11-03') || m.obs === 'Ref. PRH-0000019')));

  console.log(`Supabase cleaned: ${vBefore - db.vales.length} vales removed, ${mBefore - db.movs.length} movs removed.`);

  db._actualizadoEn = new Date().toISOString();
  db._actualizadoPor = 'drivero';
  await updateSupabase(db);
  console.log('✅ Supabase updated successfully!');
}

runSupabase().catch(console.error);
