const https = require('https');

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
    observaciones: 'Restablecidas transferencias Pellas a Central (TRF 1, 2 y 4) como ACEPTADAS por Jackson Cubillán'
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

async function run() {
  const DB = await fetchSupabase();

  // Helper Jackson
  const jackson = {
    cargo: 'Encargado de Almacén Central',
    cedula: 'V-16.789.012',
    nombre: 'Jackson Cubillán',
    usuario: 'jcubillan'
  };

  // 1. TRF-0000001 (MEDIDOR DE RESISTENCIA)
  const t1 = (DB.vales || []).find(v => v.tipo === 'TRF' && v.num === 'TRF-0000001' && v.origen === 'PELLAS');
  if (t1) {
    t1.estatus = 'RECIBIDA';
    t1.procesadoEn = '2026-11-02T17:57:28.003Z';
    t1.procesadoPor = jackson;
    t1.hist = (t1.hist || []).filter(h => h.ev !== 'Vencida');
    if (!t1.hist.some(h => h.ev === 'Aceptada')) {
      t1.hist.push({ ev: 'Aceptada', fecha: '2026-11-02T17:57:28.003Z', usr: 'Jackson Cubillán', color: 'verde' });
    }
  }

  // 2. TRF-0000002 (GENERADOR PORTATIL 3KW)
  const t2 = (DB.vales || []).find(v => v.tipo === 'TRF' && v.num === 'TRF-0000002' && v.origen === 'PELLAS');
  if (t2) {
    t2.estatus = 'RECIBIDA';
    t2.procesadoEn = '2026-11-02T17:57:38.978Z';
    t2.procesadoPor = jackson;
    t2.hist = (t2.hist || []).filter(h => h.ev !== 'Vencida');
    if (!t2.hist.some(h => h.ev === 'Aceptada')) {
      t2.hist.push({ ev: 'Aceptada', fecha: '2026-11-02T17:57:38.978Z', usr: 'Jackson Cubillán', color: 'verde' });
    }
  }

  // 3. TRF-0000004 (COMPRESOR DE AIRE PORTATIL EQ0004819)
  const t4 = (DB.vales || []).find(v => v.tipo === 'TRF' && v.num === 'TRF-0000004' && v.origen === 'PELLAS');
  if (t4) {
    t4.estatus = 'RECIBIDA';
    t4.procesadoEn = '2026-11-03T19:30:00.000Z';
    t4.procesadoPor = jackson;
    t4.hist = (t4.hist || []).filter(h => h.ev !== 'Vencida');
    if (!t4.hist.some(h => h.ev === 'Aceptada')) {
      t4.hist.push({ ev: 'Aceptada', fecha: '2026-11-03T19:30:00.000Z', usr: 'Jackson Cubillán', color: 'verde' });
    }

    // Incidencia del compresor en Pellas y Central
    const incComp = (DB.incid || []).find(i => i.id === 627 && (i.alm === 'PELLAS' || i.alm === 'CENTRAL'));
    if (incComp) {
      incComp.alm = 'CENTRAL';
      incComp.estado = 'EN TALLER';
      incComp.hist = incComp.hist || [];
      incComp.hist.push({
        ev: 'RECIBIDO EN CENTRAL',
        fecha: '2026-11-03T19:30:00.000Z',
        usr: 'Jackson Cubillán',
        det: 'Recibido en Central mediante transferencia TRF-0000004 para reparación'
      });
    }
  }

  // 4. Update config plazoHoras to 72 hours (3 business days) so it never expires overnight
  DB.config = DB.config || {};
  DB.config.plazoHoras = 72;

  // 5. Update stock existences
  DB.exi = DB.exi || {};
  DB.exi.PELLAS = DB.exi.PELLAS || {};
  DB.exi.CENTRAL = DB.exi.CENTRAL || {};

  // Medidor ID 527
  DB.exi.PELLAS[527] = DB.exi.PELLAS[527] || {};
  DB.exi.PELLAS[527].disp = 0;
  DB.exi.PELLAS[527].pend = 0;
  DB.exi.CENTRAL[527] = DB.exi.CENTRAL[527] || { disp: 0, prest: 0, asig: 0, dan: 0, rep: 0, ext: 0, vacio: 0, pend: 0, baja: 0, entregado: 0 };
  DB.exi.CENTRAL[527].disp = 1;

  // Generador ID 528
  DB.exi.PELLAS[528] = DB.exi.PELLAS[528] || {};
  DB.exi.PELLAS[528].disp = 0;
  DB.exi.PELLAS[528].pend = 0;
  DB.exi.CENTRAL[528] = DB.exi.CENTRAL[528] || { disp: 0, prest: 0, asig: 0, dan: 0, rep: 0, ext: 0, vacio: 0, pend: 0, baja: 0, entregado: 0 };
  DB.exi.CENTRAL[528].disp = 1;

  // Compresor ID 627
  DB.exi.PELLAS[627] = DB.exi.PELLAS[627] || {};
  DB.exi.PELLAS[627].disp = 0;
  DB.exi.PELLAS[627].dan = 0;
  DB.exi.PELLAS[627].rep = 0;
  DB.exi.PELLAS[627].pend = 0;
  DB.exi.CENTRAL[627] = DB.exi.CENTRAL[627] || { disp: 0, prest: 0, asig: 0, dan: 0, rep: 0, ext: 0, vacio: 0, pend: 0, baja: 0, entregado: 0 };
  DB.exi.CENTRAL[627].rep = 1;

  // 6. Movements
  // Clean up any "Vencida: sin respuesta" movements for these 3
  DB.movs = (DB.movs || []).filter(m => !(m.tipo === 'TRF' && ['TRF-0000001', 'TRF-0000002', 'TRF-0000004'].includes(m.doc) && m.origen === 'PELLAS' && m.obs && m.obs.includes('Vencida')));

  // Add acceptance movements if not present
  const checkAddMov = (doc, id, desc, estNue, cant, fecha, obs) => {
    const exists = DB.movs.some(m => m.doc === doc && m.id === id && m.origen === 'PELLAS' && m.destino === 'CENTRAL' && m.estNue.includes('RECIBIDO'));
    if (!exists) {
      DB.movs.push({
        n: (DB.seq ? ++DB.seq.mov : Date.now()),
        doc,
        tipo: 'TRF',
        id,
        desc,
        cant,
        origen: 'PELLAS',
        destino: 'CENTRAL',
        estAnt: 'PENDIENTE DE RECEPCIÓN',
        estNue,
        resp: 'Jackson Cubillán',
        cedula: 'V-16.789.012',
        usr: 'jcubillan',
        fecha,
        obs
      });
    }
  };

  checkAddMov('TRF-0000001', 527, 'MEDIDOR DE RESISTENCIA', 'RECIBIDO EN Almacén Central', 1, '2026-11-02T17:57:28.003Z', 'Transferencia aceptada');
  checkAddMov('TRF-0000002', 528, 'GENERADOR PORTATIL 3KW', 'RECIBIDO EN Almacén Central', 1, '2026-11-02T17:57:38.978Z', 'Transferencia aceptada');
  checkAddMov('TRF-0000004', 627, 'COMPRESOR DE AIRE PORTATIL', 'RECIBIDO EN Almacén Central (DAÑADO)', 1, '2026-11-03T19:30:00.000Z', 'Transferencia aceptada (DAÑADO)');

  DB._actualizadoEn = new Date().toISOString();
  DB._actualizadoPor = 'drivero';

  const res = await updateSupabase(DB);
  console.log('Update result status:', res.statusCode);
  console.log('🎉 Successfully restored TRF 1, 2, and 4 as RECIBIDA in Supabase!');
}

run().catch(console.error);
