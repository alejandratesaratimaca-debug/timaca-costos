const http = require('http');

const SIP_HOST = 'sip.timaca.com';
const SIP_IP = '192.168.10.147';
const SIP_USER = 'drivero';
const SIP_PASS = '070717';

let cachedCookie = null;

function requestSip(path, payload = null) {
  return new Promise((resolve, reject) => {
    const dataString = payload ? JSON.stringify(payload) : null;
    const headers = {
      'Host': SIP_HOST,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) TIMACA Costos System',
    };

    if (payload) {
      headers['Content-Type'] = 'application/json; charset=utf-8';
      headers['Content-Length'] = Buffer.byteLength(dataString);
    }
    if (cachedCookie) {
      headers['Cookie'] = cachedCookie;
    }

    const options = {
      hostname: SIP_IP,
      port: 80,
      path: path,
      method: payload ? 'POST' : 'GET',
      headers: headers,
      timeout: 30000
    };

    const req = http.request(options, (res) => {
      // Capture set-cookie
      const setCookies = res.headers['set-cookie'];
      if (setCookies && setCookies.length > 0) {
        cachedCookie = setCookies.map(c => c.split(';')[0]).join('; ');
      }

      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const parsed = JSON.parse(body);
            resolve(parsed.d !== undefined ? parsed.d : parsed);
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
      reject(new Error('SIP Timeout after 30s'));
    });

    if (dataString) {
      req.write(dataString);
    }
    req.end();
  });
}

async function login() {
  console.log(`[SIP] Iniciando sesión para usuario: ${SIP_USER}...`);
  // 1. Validar
  const resVal = await requestSip('/catalogo/Materiales.aspx/Validar', {
    usuario: SIP_USER,
    passwd: SIP_PASS
  });
  
  if (!resVal || (Array.isArray(resVal) && resVal[0]?.estatus !== 'OK')) {
    throw new Error('Credenciales inválidas en SIP');
  }

  // 2. Actualizar Session
  await requestSip('/catalogo/Materiales.aspx/actualizasession', { usuario: SIP_USER });
  console.log('[SIP] Sesión activa exitosamente.');
  return true;
}

async function getConsumos(inicio = '01/10/2026', hasta = '31/10/2026') {
  await login();
  console.log(`[SIP] Obteniendo consumos del ${inicio} al ${hasta}...`);
  const payload = {
    inicio: inicio,
    hasta: hasta,
    almacen: '%',
    codigo: '%',
    descripcion: '%',
    cuenta: '%'
  };
  const data = await requestSip('/Consultas/ConsultasSer.aspx/GetConsultaSalidas', payload);
  return Array.isArray(data) ? data : [];
}

async function getCompras(inicio = '01/10/2026', hasta = '31/10/2026') {
  await login();
  console.log(`[SIP] Obteniendo compras del ${inicio} al ${hasta}...`);
  const payload = {
    inicio: inicio,
    hasta: hasta,
    almacen: '%',
    comprador: '%',
    cuenta: '%',
    OC: '%'
  };
  const data = await requestSip('/consultas/ConsultasSer.aspx/GetConsultaCompras', payload);
  return Array.isArray(data) ? data : [];
}

module.exports = {
  login,
  getConsumos,
  getCompras
};
