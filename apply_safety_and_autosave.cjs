const fs = require('fs');
const vm = require('vm');

let html = fs.readFileSync('public/trazabilidad.html', 'utf8').replace(/\r\n/g, '\n');

// 1. REINICIO_ID V25
html = html.replace("const REINICIO_ID = 'TIMACA_FORCE_RESTORE_V24';", "const REINICIO_ID = 'TIMACA_FORCE_RESTORE_V25';");

// 2. txtCloud header & tooltip
html = html.replace(
  '<span id="txtCloud">☁️ Nube conectada</span>',
  '<span id="txtCloud">☁️ Auto-guardado (1 min) · Al día</span>'
);
html = html.replace(
  'title="Estado de la base de datos central en la nube. Haga clic para sincronizar ahora"',
  'title="Auto-guardado activo cada 60 segundos y fusión continua entre todos los almacenes. Haga clic para sincronizar ya."'
);
html = html.replace(
  "txt.textContent = '☁️ Nube conectada';",
  "txt.textContent = '☁️ Auto-guardado (1 min) · Al día';"
);

// 3. Shield in subirANube()
const oldSubir = `async function subirANube() {
  if (!supabaseClient || !DB) return;
  try {
    DB._actualizadoEn = new Date().toISOString();`;

const newSubir = `async function subirANube() {
  if (!supabaseClient || !DB) return;
  try {
    // ESCUDO DE DATOS: Antes de subir, verificar que no estemos destruyendo datos de la nube
    const { data: checkData } = await supabaseClient
      .from('herramientas_vales')
      .select('lineas')
      .eq('numero', SYNC_DOC_ID)
      .maybeSingle();

    if (checkData && checkData.lineas) {
      const cloudData = checkData.lineas;
      const cloudCat = (cloudData.catalogo || []).length;
      const localCat = (DB.catalogo || []).length;
      const cloudVales = (cloudData.vales || []).length;
      const localVales = (DB.vales || []).length;

      if (cloudCat > localCat || cloudVales > localVales) {
        console.warn(\`🛡️ ESCUDO DE DATOS: La nube tiene \${cloudCat} ítems y \${cloudVales} vales (local: \${localCat} ítems, \${localVales} vales). Bloqueando sobreescritura y adoptando datos de la nube.\`);
        descargarDeNube(cloudData);
        return;
      }
    }

    DB._actualizadoEn = new Date().toISOString();`;

if (!html.includes(oldSubir)) {
  console.error('oldSubir not found!');
  process.exit(1);
}
html = html.replace(oldSubir, () => newSubir);

// 4. Autosave 60s loop
const oldInterval = `  // Sondeo de respaldo cada 15 segundos para asegurar que todos los equipos vean los cambios
  setInterval(() => {
    if (!cloudSyncEnProgreso) sincronizarConNube();
  }, 15000);`;

const newInterval = `  // Sondeo de respaldo cada 15 segundos para asegurar que todos los equipos vean los cambios
  setInterval(() => {
    if (!cloudSyncEnProgreso) sincronizarConNube();
  }, 15000);

  // AUTO-GUARDADO ACTIVO CADA MINUTO (60 SEGUNDOS) - CERO PÉRDIDA DE DATOS
  setInterval(async () => {
    try {
      if (typeof guardarBorradorEntrada === 'function') guardarBorradorEntrada();
      if (typeof guardarBorradorFormulario === 'function') guardarBorradorFormulario();
      if (typeof guardarLocalSolo === 'function') guardarLocalSolo();
      if (supabaseClient && !cloudSyncEnProgreso) {
        console.log('⏰ [AUTO-GUARDADO 1 MIN] Sincronizando y fusionando con la nube...');
        await sincronizarConNube(false);
      }
    } catch (eAuto) {
      console.warn('Advertencia en autoguardado minuto a minuto:', eAuto);
    }
  }, 60000);`;

if (!html.includes(oldInterval)) {
  console.error('oldInterval not found!');
  process.exit(1);
}
html = html.replace(oldInterval, () => newInterval);

// 5. In iniciar(), don't run procesarVencimientos synchronously before cloud connects
const oldIniciarVenc = `  try { cargarDatos(); } catch (e) { console.error('Error cargarDatos:', e); }
  try { iniciarSupabaseCloud(); } catch (e) { console.error('Error iniciarSupabaseCloud:', e); }
  try { procesarVencimientos(); } catch (e) { console.error('Error procesarVencimientos:', e); }`;

const newIniciarVenc = `  try { cargarDatos(); } catch (e) { console.error('Error cargarDatos:', e); }
  try { iniciarSupabaseCloud(); } catch (e) { console.error('Error iniciarSupabaseCloud:', e); }`;

if (!html.includes(oldIniciarVenc)) {
  console.error('oldIniciarVenc not found!');
  process.exit(1);
}
html = html.replace(oldIniciarVenc, () => newIniciarVenc);

// Convert back to CRLF
const finalHtml = html.replace(/\n/g, '\r\n');

// Validate JS syntax
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
console.log('✅ Synchronized all 3 HTML files!');
