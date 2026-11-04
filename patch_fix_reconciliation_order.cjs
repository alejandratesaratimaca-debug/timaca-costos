const fs = require('fs');
const https = require('https');
const vm = require('vm');

let html = fs.readFileSync('public/trazabilidad.html', 'utf8').replace(/\r\n/g, '\n');

// Find reconciliarStockAlmacen block
const startTarget = `  // 2. Transferencias RECIBIDAS`;
const endTarget = `  // 5. Incidencias registradas`;

const startIdx = html.indexOf(startTarget);
const endIdx = html.indexOf(endTarget, startIdx);

if (startIdx === -1 || endIdx === -1) {
  console.error('Reconciliation block markers not found!');
  process.exit(1);
}

const currentBlock = html.substring(startIdx, endIdx);

const replacementBlock = `  // 2. Transferencias RECIBIDAS
  (DB.vales || []).filter(v => v.tipo === 'TRF' && v.destino === alm && v.estatus === 'RECIBIDA').forEach(v => {
    (v.lineas || []).forEach(l => {
      init(l.id);
      if (l.est === 'DAN' || l.cond === 'DAÑADO') nuevoExi[l.id].dan += (Number(l.cant) || 0);
      else if (l.est === 'VACIO' || l.cond === 'VACÍO') nuevoExi[l.id].vacio += (Number(l.cant) || 0);
      else nuevoExi[l.id].disp += (Number(l.cant) || 0);
    });
  });

  // 3. Devoluciones recibidas en este almacén (DEV) - Sumar entradas antes de descontar salidas
  (DB.vales || []).filter(v => v.tipo === 'DEV' && (v.destino === alm || (!v.destino && v.origen === alm))).forEach(v => {
    (v.lineas || []).forEach(l => {
      init(l.id);
      const c = Number(l.cant) || 0;
      if (l.cond === 'VACÍO' || l.cond === 'VACIO' || l.est === 'VACIO') {
        nuevoExi[l.id].vacio += c;
      } else if (l.cond === 'DAÑADO' || l.est === 'DAN') {
        nuevoExi[l.id].dan += c;
      } else if (l.cond === 'EXTRAVIADO' || l.est === 'EXT') {
        nuevoExi[l.id].ext += c;
      } else {
        nuevoExi[l.id].disp += c;
      }
    });
  });

  // 4. Asignaciones y préstamos emitidos en este almacén (ASI / PRH)
  (DB.vales || []).filter(v => v.origen === alm && (v.tipo === 'ASI' || v.tipo === 'PRH')).forEach(v => {
    (v.lineas || []).forEach(l => {
      init(l.id);
      const devuelto = Number(l.dev) || 0;
      const cantTotal = Number(l.cant) || 0;
      const saldo = Math.max(0, cantTotal - devuelto);
      const esVacioIni = l.est === 'VACIO' || l.cond === 'VACÍO' || l.cond === 'VACIO';
      if (esVacioIni) nuevoExi[l.id].vacio = Math.max(0, nuevoExi[l.id].vacio - cantTotal);
      else nuevoExi[l.id].disp = Math.max(0, nuevoExi[l.id].disp - cantTotal);
      if (v.tipo === 'ASI') {
        nuevoExi[l.id].asig += saldo;
        if (l.mod === 'EPP' || l.consumo) nuevoExi[l.id].entregado += saldo;
      } else if (v.tipo === 'PRH') {
        nuevoExi[l.id].prest += saldo;
      }
    });
  });

  // 5. Transferencias ENVIADAS (TRF) - Descontar salidas del almacén origen
  (DB.vales || []).filter(v => v.tipo === 'TRF' && v.origen === alm).forEach(v => {
    (v.lineas || []).forEach(l => {
      init(l.id);
      const c = Number(l.cant) || 0;
      if (v.estatus === 'PENDIENTE DE RECEPCIÓN') {
        nuevoExi[l.id].pend += c;
        if (l.est === 'DAN' || l.cond === 'DAÑADO') nuevoExi[l.id].dan = Math.max(0, nuevoExi[l.id].dan - c);
        else if (l.est === 'VACIO' || l.cond === 'VACÍO') nuevoExi[l.id].vacio = Math.max(0, nuevoExi[l.id].vacio - c);
        else nuevoExi[l.id].disp = Math.max(0, nuevoExi[l.id].disp - c);
      } else if (v.estatus === 'RECIBIDA') {
        if (l.est === 'DAN' || l.cond === 'DAÑADO') nuevoExi[l.id].dan = Math.max(0, nuevoExi[l.id].dan - c);
        else if (l.est === 'VACIO' || l.cond === 'VACÍO') nuevoExi[l.id].vacio = Math.max(0, nuevoExi[l.id].vacio - c);
        else nuevoExi[l.id].disp = Math.max(0, nuevoExi[l.id].disp - c);
      }
    });
  });\n\n`;

html = html.replace(currentBlock, () => replacementBlock);

// Remove the old block 4b if it was duplicated
const old4bTarget = `  // 4b. Devoluciones recibidas en este almacén (DEV)`;
const end4bTarget = `  // 5. Incidencias registradas`;
const old4bIdx = html.indexOf(old4bTarget);
if (old4bIdx !== -1) {
  const old4bEndIdx = html.indexOf(end4bTarget, old4bIdx);
  if (old4bEndIdx !== -1) {
    html = html.substring(0, old4bIdx) + html.substring(old4bEndIdx);
  }
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
console.log('✅ Updated all public HTML files with corrected reconciliation order!');

// NOW RECONCILE AND UPDATE SUPABASE
const SUPABASE_URL = 'https://whbicbjvasvjufgjexxa.supabase.co';
const SUPABASE_KEY = 'sb_publishable_IVbzFr2TLWjMHKLogd4qzw_WU2ZwbNv';

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
    observaciones: 'Reconciliación matemática de existencias corregida (descontadas transferencias enviadas de Pellas a Central)'
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
      res.on('end', () => resolve({ statusCode: res.statusCode, data }));
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function runCloud() {
  const DB = await fetchSupabase();

  function recAlm(alm) {
    const nuevoExi = {};
    const init = id => {
      if (!nuevoExi[id]) nuevoExi[id] = { disp: 0, prest: 0, asig: 0, dan: 0, rep: 0, ext: 0, vacio: 0, pend: 0, baja: 0, entregado: 0 };
    };

    // 1. ENT
    (DB.vales || []).filter(v => v.origen === alm && v.tipo === 'ENT').forEach(v => {
      (v.lineas || []).forEach(l => { init(l.id); nuevoExi[l.id].disp += (Number(l.cant) || 0); });
    });

    // 1b. INI
    (DB.movs || []).filter(m => m.origen === alm && m.tipo === 'INI').forEach(m => {
      init(m.id);
      const esVacio = m.estNue === 'VACÍO' || m.estNue === 'VACIO';
      if (esVacio) nuevoExi[m.id].vacio += (Number(m.cant) || 0);
      else nuevoExi[m.id].disp += (Number(m.cant) || 0);
    });

    // 2. TRF RECIBIDAS
    (DB.vales || []).filter(v => v.tipo === 'TRF' && v.destino === alm && v.estatus === 'RECIBIDA').forEach(v => {
      (v.lineas || []).forEach(l => {
        init(l.id);
        if (l.est === 'DAN' || l.cond === 'DAÑADO') nuevoExi[l.id].dan += (Number(l.cant) || 0);
        else if (l.est === 'VACIO' || l.cond === 'VACÍO') nuevoExi[l.id].vacio += (Number(l.cant) || 0);
        else nuevoExi[l.id].disp += (Number(l.cant) || 0);
      });
    });

    // 3. DEV
    (DB.vales || []).filter(v => v.tipo === 'DEV' && (v.destino === alm || (!v.destino && v.origen === alm))).forEach(v => {
      (v.lineas || []).forEach(l => {
        init(l.id);
        const c = Number(l.cant) || 0;
        if (l.cond === 'VACÍO' || l.cond === 'VACIO' || l.est === 'VACIO') nuevoExi[l.id].vacio += c;
        else if (l.cond === 'DAÑADO' || l.est === 'DAN') nuevoExi[l.id].dan += c;
        else if (l.cond === 'EXTRAVIADO' || l.est === 'EXT') nuevoExi[l.id].ext += c;
        else nuevoExi[l.id].disp += c;
      });
    });

    // 4. PRH / ASI
    (DB.vales || []).filter(v => v.origen === alm && (v.tipo === 'ASI' || v.tipo === 'PRH')).forEach(v => {
      (v.lineas || []).forEach(l => {
        init(l.id);
        const devuelto = Number(l.dev) || 0;
        const cantTotal = Number(l.cant) || 0;
        const saldo = Math.max(0, cantTotal - devuelto);
        const esVacioIni = l.est === 'VACIO' || l.cond === 'VACÍO' || l.cond === 'VACIO';
        if (esVacioIni) nuevoExi[l.id].vacio = Math.max(0, nuevoExi[l.id].vacio - cantTotal);
        else nuevoExi[l.id].disp = Math.max(0, nuevoExi[l.id].disp - cantTotal);
        if (v.tipo === 'ASI') {
          nuevoExi[l.id].asig += saldo;
          if (l.mod === 'EPP' || l.consumo) nuevoExi[l.id].entregado += saldo;
        } else if (v.tipo === 'PRH') {
          nuevoExi[l.id].prest += saldo;
        }
      });
    });

    // 5. TRF ENVIADAS
    (DB.vales || []).filter(v => v.tipo === 'TRF' && v.origen === alm).forEach(v => {
      (v.lineas || []).forEach(l => {
        init(l.id);
        const c = Number(l.cant) || 0;
        if (v.estatus === 'PENDIENTE DE RECEPCIÓN') {
          nuevoExi[l.id].pend += c;
          if (l.est === 'DAN' || l.cond === 'DAÑADO') nuevoExi[l.id].dan = Math.max(0, nuevoExi[l.id].dan - c);
          else if (l.est === 'VACIO' || l.cond === 'VACÍO') nuevoExi[l.id].vacio = Math.max(0, nuevoExi[l.id].vacio - c);
          else nuevoExi[l.id].disp = Math.max(0, nuevoExi[l.id].disp - c);
        } else if (v.estatus === 'RECIBIDA') {
          if (l.est === 'DAN' || l.cond === 'DAÑADO') nuevoExi[l.id].dan = Math.max(0, nuevoExi[l.id].dan - c);
          else if (l.est === 'VACIO' || l.cond === 'VACÍO') nuevoExi[l.id].vacio = Math.max(0, nuevoExi[l.id].vacio - c);
          else nuevoExi[l.id].disp = Math.max(0, nuevoExi[l.id].disp - c);
        }
      });
    });

    // 6. Incidencias
    (DB.incid || []).filter(i => i.alm === alm).forEach(i => {
      if (i.id && i.cant) {
        init(i.id);
        const c = Number(i.cant || 0);
        if (i.tipo === 'DAN' && i.estado === 'DAÑADO') nuevoExi[i.id].dan += c;
        else if (i.tipo === 'DAN' && i.estado === 'EN TALLER') nuevoExi[i.id].rep += c;
        else if (i.tipo === 'DAN' && (i.estado === 'BAJA' || i.estado === 'DESINCORPORADO')) nuevoExi[i.id].baja += c;
        else if (i.tipo === 'EXT' && i.estado === 'EN INVESTIGACIÓN') nuevoExi[i.id].ext += c;
        else if (i.tipo === 'EXT' && (i.estado === 'BAJA' || i.estado === 'DESINCORPORADO')) nuevoExi[i.id].baja += c;
      }
    });

    return nuevoExi;
  }

  DB.exi = DB.exi || {};
  ['CENTRAL', 'PELLAS', 'PMH', 'FABRICACION', 'BRIQUETAS'].forEach(alm => {
    DB.exi[alm] = recAlm(alm);
  });

  console.log('Medidor 527 in PELLAS after rec:', DB.exi.PELLAS[527]?.disp);
  console.log('Medidor 527 in CENTRAL after rec:', DB.exi.CENTRAL[527]?.disp);

  DB._actualizadoEn = new Date().toISOString();
  DB._actualizadoPor = 'drivero';

  const res = await updateSupabase(DB);
  console.log('Supabase updated status:', res.statusCode);
  console.log('🎉 Live reconciliation applied to Supabase successfully!');
}

runCloud().catch(console.error);
