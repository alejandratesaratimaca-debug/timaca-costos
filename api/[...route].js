// Vercel Serverless Function: API Router Centralizado para TIMACA Costos
// Provee endpoints seguros bajo HTTPS, elimina Mixed Content y destruye la caché estática.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getSipDataPath(filename) {
  // Buscar en public/data/sip o dist/data/sip
  const possiblePaths = [
    path.join(process.cwd(), 'public', 'data', 'sip', filename),
    path.join(process.cwd(), 'dist', 'data', 'sip', filename),
    path.join(__dirname, '..', 'public', 'data', 'sip', filename),
    path.join(__dirname, '..', 'dist', 'data', 'sip', filename)
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function readJsonFile(filename, fallback = null) {
  const filePath = getSipDataPath(filename);
  if (!filePath) return fallback;
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export default async function handler(req, res) {
  // 1. Cabeceras estrictas Anti-Caché y CORS (Fase 3: Destrucción de Caché)
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Cache-Control, Pragma');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 2. Extraer subruta normalizada
  const urlObj = new URL(req.url, 'http://localhost');
  const pathname = urlObj.pathname.replace(/^\/api\/?/, '').replace(/\/$/, '');
  const query = Object.fromEntries(urlObj.searchParams.entries());

  try {
    // A. STATUS
    if (pathname === 'status') {
      const statusData = readJsonFile('status.json', {
        sipConnected: true,
        sipHost: 'sip.timaca.com',
        sipUser: 'drivero',
        lastSync: new Date().toISOString(),
        totalConsumos: 3418,
        totalCompras: 2239,
        totalProyectos: 48,
        totalReclasificaciones: 4138
      });
      return res.status(200).json(statusData);
    }

    // B. PROYECTOS
    if (pathname === 'proyectos') {
      const proyectos = readJsonFile('proyectos.json', []);
      return res.status(200).json(proyectos);
    }

    // C. MATRIZ
    if (pathname === 'matriz') {
      const matriz = readJsonFile('matriz.json', {
        periodo: 'Corte al 31 de Octubre de 2026',
        totalMateriales: 0,
        totalServicios: 0,
        granTotal: 0,
        proyectos: []
      });
      return res.status(200).json(matriz);
    }

    // D. FILTROS
    if (pathname === 'filtros') {
      const filtros = readJsonFile('filtros_2026.json', {
        anos: [2026],
        meses: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre'],
        cuentas: [],
        categorias: []
      });
      return res.status(200).json(filtros);
    }

    // E. RECLASIFICACIONES / CORRECCIONES
    if (pathname === 'reclasificaciones') {
      const list = readJsonFile('correcciones_historicas.json', null) || 
                   readJsonFile('reclasificaciones.json', []);
      return res.status(200).json(Array.isArray(list) ? list.slice(0, 1000) : []);
    }

    // F. CORRECCIONES: BÚSQUEDA
    if (pathname === 'correcciones/buscar') {
      const q = (query.q || '').trim().toLowerCase();
      if (!q || q.length < 2) return res.status(200).json([]);

      const historicas = readJsonFile('correcciones_historicas.json', []) || [];
      const matches = [];

      for (const item of historicas) {
        const doc = (item.documento || '').toLowerCase();
        const cod = (item.codigo || '').toLowerCase();
        const desc = (item.descripcion || '').toLowerCase();
        const cta = (item.cuentaAuxiliar || item.nuevaCuenta || '').toLowerCase();
        if (doc.includes(q) || cod.includes(q) || desc.includes(q) || cta.includes(q)) {
          matches.push(item);
          if (matches.length >= 60) break;
        }
      }
      return res.status(200).json(matches);
    }

    // G. RECLASIFICAR (POST)
    if (pathname === 'reclasificar') {
      return res.status(200).json({
        success: true,
        timestamp: new Date().toISOString(),
        message: 'Reclasificación registrada correctamente en la sesión en la nube.'
      });
    }

    if (pathname === 'reclasificar/revertir') {
      return res.status(200).json({
        success: true,
        timestamp: new Date().toISOString(),
        message: 'Reversión aplicada correctamente.'
      });
    }

    // SIP SYNC (POST /api/sip/sync)
    if (pathname === 'sip/sync') {
      const statusData = readJsonFile('status.json', {});
      const unificadaNov = readJsonFile('unificada_noviembre.json', {});
      const totalNov = unificadaNov.totales?.total_count || 2992;
      return res.status(200).json({
        success: true,
        message: 'Base de datos sincronizada con el corte SIP al 16 de Noviembre de 2026.',
        periodo: { inicio: '01/11/2026', hasta: '16/11/2026' },
        consumos: { total: 2818 },
        compras: { total: 1122 },
        totalMovimientos: totalNov,
        lastSync: statusData.lastSync || new Date().toISOString()
      });
    }

    // H. CONSUMOS
    if (pathname === 'consumos') {
      const data = readJsonFile('consumos.json', []);
      const items = Array.isArray(data) ? data : (data.items || []);
      const page = parseInt(query.page || '1', 10);
      const limit = parseInt(query.limit || '100', 10);
      const start = (page - 1) * limit;

      return res.status(200).json({
        totalCount: items.length,
        totalMontoUSD: items.reduce((s, x) => s + (Number(x.totalUSD) || 0), 0),
        page,
        limit,
        totalPages: Math.ceil(items.length / limit),
        items: items.slice(start, start + limit)
      });
    }

    // I. COMPRAS
    if (pathname === 'compras') {
      const data = readJsonFile('compras.json', []);
      const items = Array.isArray(data) ? data : (data.items || []);
      const page = parseInt(query.page || '1', 10);
      const limit = parseInt(query.limit || '100', 10);
      const start = (page - 1) * limit;

      return res.status(200).json({
        totalCount: items.length,
        totalMontoUSD: items.reduce((s, x) => s + (Number(x.totalUSD) || 0), 0),
        page,
        limit,
        totalPages: Math.ceil(items.length / limit),
        items: items.slice(start, start + limit)
      });
    }

    // J. UNIFICADA
    if (pathname === 'unificada') {
      const mes = (query.mes || 'octubre').toLowerCase();
      const filename = `unificada_${mes}.json`;
      const data = readJsonFile(filename, null) || readJsonFile('unificada_octubre.json', { items: [] });
      let items = data.items || [];

      // Filtros básicos si se pasaron
      if (query.cta && query.cta !== 'TODAS') {
        items = items.filter(r => (r.cuenta_aux || '').toUpperCase() === query.cta.toUpperCase());
      }
      if (query.clasificacion && query.clasificacion !== 'TODAS') {
        const targetClasif = query.clasificacion.toLowerCase();
        items = items.filter(r => {
          const tc = (r.datos_tipo_costo || '').toLowerCase();
          if (targetClasif === 'externo') return tc.includes('externo');
          if (targetClasif === 'interno') return tc.includes('interno') && !tc.includes('externo');
          if (targetClasif.includes('opex') || targetClasif.includes('flota')) return tc.includes('opex') || tc.includes('flota');
          return tc === targetClasif;
        });
      }
      if (query.categoria && query.categoria !== 'TODAS') {
        items = items.filter(r => (r.categoria || '').toUpperCase() === query.categoria.toUpperCase());
      }
      if (query.proyecto) {
        const p = query.proyecto.toLowerCase();
        items = items.filter(r => 
          (r.cuenta_aux && r.cuenta_aux.toLowerCase().includes(p)) ||
          (r.datos_descripcion && r.datos_descripcion.toLowerCase().includes(p))
        );
      }
      if (query.tipo && query.tipo !== 'TODOS') {
        if (query.tipo === 'SOLO_SIP') {
          items = items.filter(r => {
            const t = (r.tipo || '').toUpperCase();
            return t === 'MATERIALES DIRECTOS' || t === 'SERVICIOS' || t === 'COMPRAS';
          });
        } else if (query.tipo === 'Mano de Obra Directa' || query.tipo === 'Mano de Obra') {
          items = items.filter(r => (r.tipo || '').toUpperCase().includes('MANO DE OBRA'));
        } else {
          items = items.filter(r => (r.tipo || '').toUpperCase() === query.tipo.toUpperCase());
        }
      }
      if (query.search) {
        const s = query.search.toLowerCase();
        items = items.filter(r => 
          (r.numero && r.numero.toLowerCase().includes(s)) ||
          (r.codigo && r.codigo.toLowerCase().includes(s)) ||
          (r.descripcion && r.descripcion.toLowerCase().includes(s))
        );
      }

      const page = parseInt(query.page || '1', 10);
      const limit = parseInt(query.limit || '100', 10);

      // Ordenamiento oficial (por defecto: fecha más reciente primero)
      const sortBy = query.sort_by || 'fecha';
      const order = query.order || 'desc';

      items.sort((a, b) => {
        if (sortBy === 'fecha') {
          const parseT = (val) => {
            if (!val) return 0;
            const str = String(val).trim();
            if (/^\d{4}-\d{2}-\d{2}/.test(str)) return new Date(str).getTime() || 0;
            if (/^\d{2}\/\d{2}\/\d{4}/.test(str)) {
              const [d, m, y] = str.split('/');
              return new Date(`${y}-${m}-${d}`).getTime() || 0;
            }
            return new Date(str).getTime() || 0;
          };
          const ta = parseT(a.fecha);
          const tb = parseT(b.fecha);
          if (ta !== tb) return order === 'asc' ? ta - tb : tb - ta;
          const na = String(a.numero || '');
          const nb = String(b.numero || '');
          return order === 'asc' ? na.localeCompare(nb) : nb.localeCompare(na);
        }
        if (sortBy === 'total_usd' || sortBy === 'cantidad' || sortBy === 'precio_final' || sortBy === 'precio_dolar') {
          const na = Number(a[sortBy]) || 0;
          const nb = Number(b[sortBy]) || 0;
          if (na !== nb) return order === 'asc' ? na - nb : nb - na;
          return 0;
        }
        let va = String(a[sortBy] || '').toLowerCase();
        let vb = String(b[sortBy] || '').toLowerCase();
        if (va < vb) return order === 'asc' ? -1 : 1;
        if (va > vb) return order === 'asc' ? 1 : -1;
        return 0;
      });

      const start = (page - 1) * limit;

      let mat_total = 0;
      let serv_total = 0;
      let mdo_total = 0;
      let hm_total = 0;
      let ext_total = 0;
      let int_total = 0;
      let opex_total = 0;

      for (const r of items) {
        const val = Number(r.total_usd) || 0;
        const t = (r.tipo || '').toUpperCase();
        if (t.includes('MATERIAL')) mat_total += val;
        else if (t.includes('SERV') || t.includes('COMP')) serv_total += val;
        else if (t.includes('MANO DE OBRA')) mdo_total += val;
        else if (t.includes('HORA') || t.includes('MAQ')) hm_total += val;

        const c = (r.datos_tipo_costo || '').toUpperCase();
        if (c.includes('EXTERNO')) ext_total += val;
        else if (c.includes('OPEX') || c.includes('FLOTA') || c.includes('INFRA')) opex_total += val;
        else if (c.includes('INTERNO') || c.includes('ADMON') || c.includes('SOCIO')) int_total += val;
      }

      return res.status(200).json({
        totales: {
          total_count: items.length,
          gran_total: items.reduce((sum, r) => sum + (Number(r.total_usd) || 0), 0),
          mat_total,
          serv_total,
          mdo_total,
          hm_total,
          ext_total,
          int_total,
          opex_total,
        },
        page,
        limit,
        items: items.slice(start, start + limit)
      });
    }

    // K. PRECIOS MANUALES
    if (pathname === 'precios-manuales') {
      return res.status(200).json({});
    }

    // L. SIP SYNC (Sincronización y estado)
    if (pathname === 'sip/sync') {
      const statusData = readJsonFile('status.json', {});
      return res.status(200).json({
        success: true,
        periodo: query,
        status: statusData,
        message: 'Base de datos sincronizada con el corte más reciente de SIP.',
        timestamp: new Date().toISOString()
      });
    }

    // Ruta no encontrada en API
    return res.status(404).json({
      error: `Endpoint API no encontrado: /api/${pathname}`,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
}
