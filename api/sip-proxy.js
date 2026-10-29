// Vercel Serverless Function: Proxy Servidor-a-Servidor para SIP TIMACA
// Resuelve el problema crítico de Mixed Content (HTTPS -> HTTP) en Vercel
import http from 'http';

const SIP_HOST = process.env.SIP_HOST || 'sip.timaca.com';
const SIP_PORT = process.env.SIP_PORT || 80;
const TIMEOUT_MS = 15000;

export default async function handler(req, res) {
  // 1. Cabeceras estrictas Anti-Caché y CORS
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 2. Extraer ruta destino SIP
  const targetPath = req.query.path || req.url.replace('/api/sip-proxy', '');
  if (!targetPath || targetPath === '/') {
    return res.status(400).json({
      error: 'Debe especificar el parámetro "path" para consultar el servidor SIP',
      example: '/api/sip-proxy?path=/consultas/ConsultasSer.aspx/GetConsultaSalidas'
    });
  }

  const payload = req.method === 'POST' ? JSON.stringify(req.body || {}) : null;

  const headers = {
    'Host': SIP_HOST,
    'User-Agent': 'Mozilla/5.0 TIMACA Costos Vercel-Server-Proxy',
  };

  if (payload) {
    headers['Content-Type'] = 'application/json; charset=utf-8';
    headers['Content-Length'] = Buffer.byteLength(payload);
  }

  const options = {
    hostname: SIP_HOST,
    port: SIP_PORT,
    path: targetPath.startsWith('/') ? targetPath : `/${targetPath}`,
    method: req.method,
    headers: headers,
    timeout: TIMEOUT_MS
  };

  try {
    const sipData = await new Promise((resolve, reject) => {
      const clientReq = http.request(options, (clientRes) => {
        let body = '';
        clientRes.on('data', chunk => { body += chunk; });
        clientRes.on('end', () => {
          if (clientRes.statusCode >= 200 && clientRes.statusCode < 300) {
            try {
              const parsed = JSON.parse(body);
              resolve({
                status: clientRes.statusCode,
                data: parsed.d !== undefined ? parsed.d : parsed
              });
            } catch {
              resolve({ status: clientRes.statusCode, data: body });
            }
          } else {
            reject(new Error(`SIP respondió con HTTP ${clientRes.statusCode}: ${body.slice(0, 300)}`));
          }
        });
      });

      clientReq.on('error', (err) => {
        reject(err);
      });

      clientReq.on('timeout', () => {
        clientReq.destroy();
        reject(new Error(`Timeout de conexión a SIP (${TIMEOUT_MS}ms)`));
      });

      if (payload) {
        clientReq.write(payload);
      }
      clientReq.end();
    });

    return res.status(200).json({
      success: true,
      proxyTime: new Date().toISOString(),
      data: sipData.data
    });
  } catch (error) {
    return res.status(502).json({
      success: false,
      isSipOffline: true,
      error: error.message,
      message: 'No se pudo conectar al servidor SIP interno desde Vercel (Red aislada). Usando datos sincronizados de respaldo.'
    });
  }
}
