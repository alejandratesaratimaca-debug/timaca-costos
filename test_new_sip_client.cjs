const http = require('http');

const SIP_HOST = '192.168.11.168';
const SIP_PORT = 8087;
const SIP_USER = 'drivero';
const SIP_PASS = '070717';

let cachedCookie = null;

function toISODate(dStr) {
  if (!dStr) return '';
  if (dStr.includes('-')) return dStr;
  const parts = dStr.split('/');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  }
  return dStr;
}

function request(path, method = 'GET', payload = null) {
  return new Promise((resolve, reject) => {
    const dataString = payload ? JSON.stringify(payload) : null;
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) TIMACA SIGMA Realtime',
      'Accept': 'application/json'
    };

    if (payload) {
      headers['Content-Type'] = 'application/json; charset=utf-8';
      headers['Content-Length'] = Buffer.byteLength(dataString);
    }
    if (cachedCookie) {
      headers['Cookie'] = cachedCookie;
    }

    const options = {
      hostname: SIP_HOST,
      port: SIP_PORT,
      path: path,
      method: method,
      headers: headers,
      timeout: 30000
    };

    const req = http.request(options, (res) => {
      const setCookies = res.headers['set-cookie'];
      if (setCookies && setCookies.length > 0) {
        cachedCookie = setCookies.map(c => c.split(';')[0]).join('; ');
      }

      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            resolve(body);
          }
        } else {
          reject(new Error(`SIP Error [${res.statusCode}]: ${body.slice(0, 300)}`));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('SIP Timeout'));
    });

    if (dataString) req.write(dataString);
    req.end();
  });
}

async function login() {
  console.log(`[Nuevo SIP] Conectando a ${SIP_HOST}:${SIP_PORT} para usuario: ${SIP_USER}...`);
  const resLogin = await request('/api/acceso/entrar', 'POST', {
    login: SIP_USER,
    clave: SIP_PASS
  });

  if (!resLogin.ok) {
    throw new Error(`Error de autenticación: ${resLogin.mensaje}`);
  }

  // Set default warehouse ALMCE
  await request('/api/acceso/almacen/ALMCE', 'PUT');
  console.log(`[Nuevo SIP] Sesión activa exitosamente: ${resLogin.sesion.nombre}`);
  return true;
}

async function getConsumos(inicio = '01/10/2026', hasta = '31/10/2026', almacen = 'ALMCE') {
  await login();
  const desde = toISODate(inicio);
  const al = toISODate(hasta);
  console.log(`[Nuevo SIP] Consultando consumos de ${desde} a ${al} (Almacén: ${almacen})...`);
  
  const rawData = await request(`/api/movimientos/salidas?desde=${desde}&hasta=${al}&almacen=${encodeURIComponent(almacen)}`);
  if (!Array.isArray(rawData)) return [];

  return rawData.map(r => ({
    almacen: r.almacen || almacen,
    numero: r.numero || '',
    fecha: r.fecha || '',
    codigo: r.material || r.codigo || '',
    material: r.material || r.codigo || '',
    descripcion: r.descripcion || '',
    cantidad: typeof r.cantidad === 'number' ? r.cantidad : parseFloat(r.cantidad || 0),
    unidad: r.cuentaGasto || r.ctagasto || r.unidad || 'UND',
    ctaauxi: r.cuentaAuxiliar || r.ctaauxi || '',
    cuentaAuxiliar: r.cuentaAuxiliar || r.ctaauxi || '',
    ceco: r.centroCosto || r.ceco || '',
    centroCosto: r.centroCosto || r.ceco || '',
    costoDolar: typeof r.costoDolar === 'number' ? r.costoDolar : parseFloat(r.costoDolar || 0),
    costoprom: r.costoPromedio || r.costoprom || 0,
    solicitante: r.solicitante || '',
    motivo: r.motivo || '',
    pedido: r.pedido || '',
    estatus: r.estatus || 'FINALIZADO',
    descripcionCuenta: r.descripcionCuenta || ''
  }));
}

async function getCompras(inicio = '01/10/2026', hasta = '31/10/2026') {
  await login();
  const desde = toISODate(inicio);
  const al = toISODate(hasta);
  console.log(`[Nuevo SIP] Consultando compras de ${desde} a ${al}...`);

  const rawData = await request(`/api/ordenes/renglones?desde=${desde}&hasta=${al}`);
  if (!Array.isArray(rawData)) return [];

  return rawData.map(r => ({
    SC: r.solicitud || r.SC || '',
    solicitud: r.solicitud || r.SC || '',
    OC: r.numero || r.OC || '',
    numero: r.numero || r.OC || '',
    fecha: r.fecha || '',
    posicion: r.posicion || 1,
    renglon: (r.renglon || '1').toString(),
    codigo: r.material || r.codigo || '',
    material: r.material || r.codigo || '',
    descripcion: r.descripcion || '',
    cantidad: typeof r.cantidad === 'number' ? r.cantidad : parseFloat(r.cantidad || 0),
    cantOC: typeof r.cantidad === 'number' ? r.cantidad : parseFloat(r.cantidad || 0),
    precioBs: typeof r.precio === 'number' ? r.precio : parseFloat(r.precio || 0),
    precio: typeof r.precio === 'number' ? r.precio : parseFloat(r.precio || 0),
    TotalD: typeof r.total === 'number' ? r.total : parseFloat(r.total || 0),
    total: typeof r.total === 'number' ? r.total : parseFloat(r.total || 0),
    proveedor: r.nombreProveedor || r.proveedor || '',
    codigoProveedor: r.proveedor || '',
    comprador: r.comprador || '',
    condicion: r.condicion || '',
    estatus: r.siglas || '',
    estatusOC: r.siglas || '',
    siglas: r.siglas || '',
    descripcionCuenta: r.descripcionCuenta || '',
    cuenta: r.descripcionCuenta || '',
    tipo: r.tipo || 'NACIONAL'
  }));
}

async function getDevoluciones(inicio = '01/10/2026', hasta = '31/10/2026', almacen = 'ALMCE') {
  await login();
  const desde = toISODate(inicio);
  const al = toISODate(hasta);
  console.log(`[Nuevo SIP] Consultando devoluciones de ${desde} a ${al}...`);

  const rawMat = await request(`/api/devoluciones-consulta/material?desde=${desde}&hasta=${al}&almacen=${encodeURIComponent(almacen)}`);
  const rawOC = await request(`/api/devoluciones-consulta/orden-compra?desde=${desde}&hasta=${al}&almacen=${encodeURIComponent(almacen)}`);

  return {
    material: Array.isArray(rawMat) ? rawMat : [],
    ordenCompra: Array.isArray(rawOC) ? rawOC : []
  };
}

module.exports = {
  login,
  getConsumos,
  getCompras,
  getDevoluciones
};

// Self test
if (require.main === module) {
  (async () => {
    try {
      console.log('=== TEST NUEVO SIP CLIENT ===');
      const consumos = await getConsumos('01/10/2026', '05/10/2026');
      console.log(`Consumos obtenidos (1-5 Oct): ${consumos.length}`);
      if (consumos.length > 0) console.log('Muestra consumo 0:', consumos[0]);

      const compras = await getCompras('01/10/2026', '05/10/2026');
      console.log(`Compras obtenidas (1-5 Oct): ${compras.length}`);
      if (compras.length > 0) console.log('Muestra compra 0:', compras[0]);

      console.log('=== TEST EXITOSO ===');
    } catch (err) {
      console.error('Test fallido:', err);
    }
  })();
}
