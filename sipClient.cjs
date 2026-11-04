const http = require('http');

/**
 * Cliente Oficial de Integración SIGMA ➔ Nuevo SIP (NÚCLEO)
 * Grupo TIMACA - Gerencia de Costos
 * Conexión en tiempo real directa vía REST API y SSO Núcleo ERP.
 */

const SIP_HOST = 'sip.timaca.com';
const SIP_PORT = 80;
const NUCLEO_TOKEN = 'eyJhbGciOiJFUzI1NiIsImtpZCI6Ijk4MzgyZTNhLTZlZWQtNDU0OC05ZTY2LTM1NmRiNTM2Y2E2OSIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2Fra3p2bXBjeHdsaXFndXhybG9tLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiJkZDQ5NDVjMy0zYTAzLTRlZjctYTcwYS02NTAwMTA2N2Q4NzYiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzkzODMwNTU0LCJpYXQiOjE3OTM4MjY5NTQsImVtYWlsIjoiYWxlamFuZHJhdGVzYXJhQHRpbWFjYS5jb20udmUiLCJwaG9uZSI6IiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIiwicHJvdmlkZXJzIjpbImVtYWlsIl19LCJ1c2VyX21ldGFkYXRhIjp7fSwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJhYWwiOiJhYWwxIiwiYW1yIjpbeyJtZXRob2QiOiJwYXNzd29yZCIsInRpbWVzdGFtcCI6MTc5MzgyNjk1NH1dLCJzZXNzaW9uX2lkIjoiNGQyYjVjNDktYzZmOS00YmQxLWJjZWEtMGVkNWFjNzQ0OGVjIiwiaXNfYW5vbnltb3VzIjpmYWxzZX0.c993lFi4MyGXHjLI_toTlozjvhFfAfFooNDP93CSsn-MyRaDgdXDA3MaIOolNavFbtAOu-VkvujWvAPb45LK2g';

let cachedCookie = null;
let lastLoginTime = 0;

function toISODate(dStr) {
  if (!dStr) return '';
  const s = String(dStr);
  if (s.includes('-')) return s;
  const parts = s.split('/');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  }
  return s;
}

function request(path, method = 'GET', payload = null) {
  return new Promise((resolve, reject) => {
    const dataString = payload ? JSON.stringify(payload) : null;
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) TIMACA SIGMA Realtime Client',
      'Accept': 'application/json',
      'Host': 'sip.timaca.com'
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
      timeout: 35000
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
          reject(new Error(`Nuevo SIP Error [${res.statusCode}]: ${body.slice(0, 300)}`));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Nuevo SIP Timeout (35s)'));
    });

    if (dataString) req.write(dataString);
    req.end();
  });
}

async function login() {
  const now = Date.now();
  if (cachedCookie && (now - lastLoginTime) < 15 * 60 * 1000) {
    return true; // Cookie still fresh (under 15 min)
  }

  console.log(`[Nuevo SIP API] Autenticando vía SSO Núcleo ERP en ${SIP_HOST}:${SIP_PORT}...`);
  try {
    const valeRes = await fetch('https://nucleo-erp-alpha.vercel.app/api/sip-vale', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${NUCLEO_TOKEN}` }
    });
    const valeData = await valeRes.json();
    if (!valeData.vale) throw new Error('No se recibió vale de Núcleo ERP');

    const formBody = new URLSearchParams();
    formBody.append('vale', valeData.vale);

    const sipRes = await fetch('http://sip.timaca.com/entrar-por-nucleo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Host': 'sip.timaca.com' },
      body: formBody.toString(),
      redirect: 'manual'
    });

    const setCookies = sipRes.headers.get('set-cookie');
    if (!setCookies) throw new Error('No se recibió cookie de sesión de sip.timaca.com');
    cachedCookie = setCookies.split(';')[0];
    lastLoginTime = Date.now();
    console.log(`[Nuevo SIP API] Sesión activa exitosamente como Alejandra Tesara (AT)`);
    return true;
  } catch (err) {
    console.warn(`[Nuevo SIP API] Aviso: fallo en SSO Núcleo (${err.message}). Reintentando conexión directa...`);
    // Fallback direct login
    const resLogin = await request('/api/acceso/entrar', 'POST', {
      login: 'drivero',
      clave: '070717'
    });
    if (resLogin.ok) {
      lastLoginTime = Date.now();
      return true;
    }
    throw err;
  }
}

async function getConsumos(inicio = '01/10/2026', hasta = '31/10/2026', almacen = '%') {
  await login();
  const desde = toISODate(inicio);
  const al = toISODate(hasta);
  console.log(`[Nuevo SIP API] Obteniendo consumos / salidas de ${desde} al ${al} (Almacén: ${almacen})...`);

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
  console.log(`[Nuevo SIP API] Obteniendo compras y órdenes de ${desde} al ${al}...`);

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

async function getServicios(inicio = '01/10/2026', hasta = '31/10/2026') {
  const compras = await getCompras(inicio, hasta);
  return compras.filter(c => {
    const desc = (c.descripcion || '').toUpperCase();
    const cod = (c.codigo || '').toUpperCase();
    return cod.startsWith('SE') || desc.includes('SERVICIO') || desc.includes('ALQUILER') || desc.includes('MANTENIMIENTO');
  });
}

async function getDevoluciones(inicio = '01/10/2026', hasta = '31/10/2026', almacen = '%') {
  await login();
  const desde = toISODate(inicio);
  const al = toISODate(hasta);
  console.log(`[Nuevo SIP API] Obteniendo devoluciones de ${desde} al ${al}...`);

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
  getServicios,
  getDevoluciones
};
