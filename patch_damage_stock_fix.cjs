const fs = require('fs');
const vm = require('vm');

let html = fs.readFileSync('public/trazabilidad.html', 'utf8').replace(/\r\n/g, '\n');

// 1. Update lineaDe to use estDe
const oldLineaDe = `function lineaDe(it, cant, cond) {
  const est = cond === 'DAÑADO' ? 'DAN' : ((it.mod === 'CILINDRO' && cond === 'VACÍO') ? 'VACIO' : 'DISP');
  return { id: it.id, cod: it.cod, desc: it.desc, marca: it.marca, modelo: it.modelo, serial: it.serial || '', cat: it.cat, umb: it.umb, mod: it.mod, cond, est, cant: Number(cant), dev: 0 };
}`;

const newLineaDe = `function lineaDe(it, cant, cond) {
  const est = typeof estDe === 'function' ? estDe(it, cond) : (cond === 'DAÑADO' ? 'DAN' : ((it.mod === 'CILINDRO' && cond === 'VACÍO') ? 'VACIO' : 'DISP'));
  return { id: it.id, cod: it.cod, desc: it.desc, marca: it.marca, modelo: it.modelo, serial: it.serial || '', cat: it.cat, umb: it.umb, mod: it.mod, cond, est, cant: Number(cant), dev: 0 };
}`;

if (!html.includes(oldLineaDe)) {
  console.error('oldLineaDe not found!');
  process.exit(1);
}
html = html.replace(oldLineaDe, () => newLineaDe);

// 2. Update validarStock to accept tipo
const oldValidarStock = `function validarStock(alm, lineas) {
  const req = {};
  lineas.forEach(l => { const k = l.id + '|' + l.est; req[k] = (req[k] || 0) + Number(l.cant); });
  Object.keys(req).forEach(k => {
    const [id, est] = k.split('|'); const e = exi(alm, +id); const it = item(+id);
    const d = est === 'VACIO' ? (e.vacio || 0) : (est === 'DAN' ? ((e.dan || 0) + (e.rep || 0)) : (e.disp || 0));
    if (req[k] > d) throw new Error(\`Existencia insuficiente en \${almNombre(alm)} para \${it.cod} · \${it.desc}\${it.serial ? ' (' + it.serial + ')' : ''} [\${nomBucket[est] || est}]: disponible \${d}, requerido \${req[k]}.\`);
  });
}`;

const newValidarStock = `function validarStock(alm, lineas, tipo) {
  const req = {};
  lineas.forEach(l => {
    const targetEst = (tipo === 'DAN' || tipo === 'EXT') ? (l.est === 'VACIO' ? 'VACIO' : 'DISP') : l.est;
    const k = l.id + '|' + targetEst;
    req[k] = (req[k] || 0) + Number(l.cant);
  });
  Object.keys(req).forEach(k => {
    const [id, est] = k.split('|'); const e = exi(alm, +id); const it = item(+id);
    let d;
    if (tipo === 'DAN' || tipo === 'EXT') {
      d = est === 'VACIO' ? (e.vacio || 0) : (e.disp || 0);
    } else {
      d = est === 'VACIO' ? (e.vacio || 0) : (est === 'DAN' ? ((e.dan || 0) + (e.rep || 0)) : (e.disp || 0));
    }
    if (req[k] > d) throw new Error(\`Existencia insuficiente en \${almNombre(alm)} para \${it.cod} · \${it.desc}\${it.serial ? ' (' + it.serial + ')' : ''} [\${nomBucket[est] || est}]: disponible \${d}, requerido \${req[k]}.\`);
  });
}`;

if (!html.includes(oldValidarStock)) {
  console.error('oldValidarStock not found!');
  process.exit(1);
}
html = html.replace(oldValidarStock, () => newValidarStock);

// 3. Update registrarIncidencia to pass tipo and set estAnt correctly
const oldRegInc = `  } else validarStock(d.origen, d.lineas);`;
const newRegInc = `  } else validarStock(d.origen, d.lineas, tipo);`;

if (!html.includes(oldRegInc)) {
  console.error('oldRegInc not found!');
  process.exit(1);
}
html = html.replace(oldRegInc, () => newRegInc);

const oldRegLoop = `    else { if (l.est === 'VACIO') e.vacio -= l.cant; else e.disp -= l.cant; estAnt = nomBucket[l.est]; }`;
const newRegLoop = `    else { if (l.est === 'VACIO') { e.vacio -= l.cant; estAnt = 'VACÍO'; } else { e.disp -= l.cant; estAnt = 'DISPONIBLE'; } }`;

if (!html.includes(oldRegLoop)) {
  console.error('oldRegLoop not found!');
  process.exit(1);
}
html = html.replace(oldRegLoop, () => newRegLoop);

// 4. Update dispItem
const oldDispItem = `function dispItem(alm, id, est) { const e = exi(alm, id); return est === 'VACIO' ? (e.vacio || 0) : (est === 'DAN' ? ((e.dan || 0) + (e.rep || 0)) : (e.disp || 0)); }`;

const newDispItem = `function dispItem(alm, id, est) {
  const e = exi(alm, id);
  if (typeof F !== 'undefined' && F && (F.tipo === 'DAN' || F.tipo === 'EXT')) {
    return est === 'VACIO' ? (e.vacio || 0) : (e.disp || 0);
  }
  return est === 'VACIO' ? (e.vacio || 0) : (est === 'DAN' ? ((e.dan || 0) + (e.rep || 0)) : (e.disp || 0));
}`;

if (!html.includes(oldDispItem)) {
  console.error('oldDispItem not found!');
  process.exit(1);
}
html = html.replace(oldDispItem, () => newDispItem);

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
