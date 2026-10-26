const express = require('express');
const path = require('path');
const sipClient = require('./sipClient.cjs');
const db = require('./db.cjs');

const app = express();
const PORT = process.env.PORT || 3005;

// Native CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});
app.use(express.json());

// Initialize projects from Base Consultas on boot
db.syncProyectosFromMaster();

// 1. System Status
app.get('/api/status', (req, res) => {
  const store = db.loadStore();
  res.json({
    sipConnected: true,
    sipHost: '192.168.10.147',
    sipUser: 'drivero',
    lastSync: store.lastSync,
    totalConsumos: store.consumos.length,
    totalCompras: store.compras.length,
    totalProyectos: store.proyectos.length,
    totalReclasificaciones: Object.keys(store.reclasificaciones).length
  });
});

// 2. Trigger SIP Sync (Consumos & Compras con cierre a fin de mes)
app.post('/api/sip/sync', async (req, res) => {
  const { inicio = '01/10/2026', hasta = '31/10/2026' } = req.body || {};
  try {
    console.log(`[API] Iniciando sincronización SIP de ${inicio} a ${hasta}...`);
    
    // Fetch both in parallel or sequence
    const rawConsumos = await sipClient.getConsumos(inicio, hasta);
    const statsConsumos = db.ingestConsumos(rawConsumos);

    const rawCompras = await sipClient.getCompras(inicio, hasta);
    const statsCompras = db.ingestCompras(rawCompras);

    // Sync October into SQLite Master Unificado
    try {
      const { execSync } = require('child_process');
      const pyScript = path.join(__dirname, 'syncOctubreToMaster.py');
      execSync(`python "${pyScript}"`);
    } catch (e) {
      console.warn('[Sync to SQLite Warning]:', e.message);
    }

    res.json({
      success: true,
      periodo: { inicio, hasta },
      consumos: statsConsumos,
      compras: statsCompras,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[API] Error during SIP sync:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

function getSolicitanteCompra(cp) {
  if (cp.solicitante && cp.solicitante.trim()) return cp.solicitante.trim();
  if (cp.motivo) {
    const match = cp.motivo.match(/solicit(?:ad[oa]|ante)\s*(?:por)?[:\s]+([^\n\r,–-]+)/i);
    if (match && match[1].trim()) return match[1].trim();
  }
  return cp.comprador || cp.proveedor || 'S/D';
}

// 3. Get Consumos with filters across all months from SQLite / unificada
app.get('/api/consumos', async (req, res) => {
  const { search = '', cta = 'TODAS', mes = 'todos', categoria = 'TODAS', fecha_desde = '', fecha_hasta = '', page = 1, limit = 50 } = req.query;

  try {
    const qParams = new URLSearchParams({
      ano: '2026',
      mes: mes.toLowerCase(),
      categoria,
      search,
      cta,
      tipo: 'Materiales Directos',
      page: page.toString(),
      limit: limit.toString()
    });
    if (fecha_desde) qParams.set('fecha_desde', fecha_desde);
    if (fecha_hasta) qParams.set('fecha_hasta', fecha_hasta);

    const resp = await fetch(`http://127.0.0.1:3006/api/unificada?${qParams.toString()}`);
    if (resp.ok) {
      const data = await resp.json();
      const mapped = (data.items || []).map(r => ({
        id: r.id,
        almacen: r.almacen,
        numero: r.numero, // DP
        pedido: r.pedido, // PA
        fecha: r.fecha,
        nombre_mes: r.nombre_mes,
        codigo: r.codigo,
        descripcion: r.descripcion,
        cantidad: r.cantidad,
        unidad: r.unidad,
        cuentaAuxiliar: r.cuenta_aux,
        solicitante: r.solicitante || 'S/D',
        motivo: r.motivo || '',
        categoria: r.categoria || 'Materiales Directos',
        costoUnitario: r.precio_final,
        totalUSD: r.total_usd,
        esReclasificado: !!(r.ajuste && r.ajuste.includes('CORREGIDO'))
      }));

      return res.json({
        totalCount: data.totales?.total_count || mapped.length,
        totalMontoUSD: data.totales?.mat_total || data.totales?.gran_total || 0,
        page: data.page,
        limit: data.limit,
        totalPages: Math.ceil((data.totales?.total_count || mapped.length) / (data.limit || 50)),
        items: mapped
      });
    }
  } catch (err) {
    console.warn('[Consumos SQLite fetch error, fallback to store.json]:', err.message);
  }

  // Fallback to in-memory store.json (October)
  const store = db.loadStore();
  let items = store.consumos;

  if (search) {
    const s = search.toLowerCase();
    items = items.filter(i => 
      (i.numero && i.numero.toLowerCase().includes(s)) ||
      (i.codigo && i.codigo.toLowerCase().includes(s)) ||
      (i.descripcion && i.descripcion.toLowerCase().includes(s)) ||
      (i.solicitante && i.solicitante.toLowerCase().includes(s)) ||
      (i.motivo && i.motivo.toLowerCase().includes(s))
    );
  }

  if (cta && cta !== 'TODAS') {
    items = items.filter(i => i.cuentaAuxiliar === cta.toUpperCase());
  }

  if (categoria && categoria !== 'TODAS') {
    items = items.filter(i => i.categoria === categoria);
  }

  const totalCount = items.length;
  const totalMontoUSD = items.reduce((sum, i) => sum + (i.totalUSD || 0), 0);
  const p = parseInt(page);
  const l = parseInt(limit);

  res.json({
    totalCount,
    totalMontoUSD: Math.round(totalMontoUSD * 100) / 100,
    page: p,
    limit: l,
    totalPages: Math.ceil(totalCount / l),
    items: items.slice((p - 1) * l, p * l)
  });
});

// 4. Get Compras & Servicios with filters across all months
app.get('/api/compras', async (req, res) => {
  const { search = '', cta = 'TODAS', mes = 'todos', categoria = 'TODAS', tipo = 'TODOS', fecha_desde = '', fecha_hasta = '', page = 1, limit = 50 } = req.query;

  try {
    const qParams = new URLSearchParams({
      ano: '2026',
      mes: mes.toLowerCase(),
      categoria,
      search,
      cta,
      tipo: tipo === 'TODOS' ? 'Servicios' : tipo,
      page: page.toString(),
      limit: limit.toString()
    });
    if (fecha_desde) qParams.set('fecha_desde', fecha_desde);
    if (fecha_hasta) qParams.set('fecha_hasta', fecha_hasta);

    const resp = await fetch(`http://127.0.0.1:3006/api/unificada?${qParams.toString()}`);
    if (resp.ok) {
      const data = await resp.json();
      const mapped = (data.items || []).map(r => ({
        id: r.id,
        almacen: r.almacen,
        solicitudCompra: r.numero || r.sc || '',
        ordenCompra: r.pedido || r.oc || '',
        fechaSolicitud: r.fecha,
        fechaOC: r.fecha,
        nombre_mes: r.nombre_mes,
        codigo: r.codigo,
        descripcion: r.descripcion,
        motivo: r.motivo || '',
        categoria: r.categoria || 'SERVICIOS',
        cantidadSolicitada: r.cantidad,
        cantidadOC: r.cantidad,
        cantidadRecepcionada: r.cantidad,
        unidad: r.unidad,
        cuentaAuxiliar: r.cuenta_aux,
        proveedor: r.solicitante || 'S/D',
        comprador: r.solicitante || 'S/D',
        solicitante: r.solicitante || 'S/D',
        precioUnitario: r.precio_final,
        totalUSD: r.total_usd,
        tipo: r.tipo,
        esReclasificado: !!(r.ajuste && r.ajuste.includes('CORREGIDO'))
      }));

      return res.json({
        totalCount: data.totales?.total_count || mapped.length,
        totalMontoUSD: data.totales?.serv_total || data.totales?.gran_total || 0,
        page: data.page,
        limit: data.limit,
        totalPages: Math.ceil((data.totales?.total_count || mapped.length) / (data.limit || 50)),
        items: mapped
      });
    }
  } catch (err) {
    console.warn('[Compras SQLite fetch error, fallback to store.json]:', err.message);
  }

  // Fallback to store.json (October)
  const store = db.loadStore();
  let items = store.compras;

  if (search) {
    const s = search.toLowerCase();
    items = items.filter(i => 
      (i.solicitudCompra && i.solicitudCompra.toLowerCase().includes(s)) ||
      (i.ordenCompra && i.ordenCompra.toLowerCase().includes(s)) ||
      (i.codigo && i.codigo.toLowerCase().includes(s)) ||
      (i.descripcion && i.descripcion.toLowerCase().includes(s)) ||
      (i.proveedor && i.proveedor.toLowerCase().includes(s)) ||
      (i.motivo && i.motivo.toLowerCase().includes(s))
    );
  }

  if (cta && cta !== 'TODAS') {
    items = items.filter(i => i.cuentaAuxiliar === cta.toUpperCase());
  }

  if (categoria && categoria !== 'TODAS') {
    items = items.filter(i => i.categoria === categoria);
  }

  if (tipo && tipo !== 'TODOS') {
    items = items.filter(i => i.tipo === tipo);
  }

  const totalCount = items.length;
  const totalMontoUSD = items.reduce((sum, i) => sum + (i.totalUSD || 0), 0);
  const p = parseInt(page);
  const l = parseInt(limit);

  res.json({
    totalCount,
    totalMontoUSD: Math.round(totalMontoUSD * 100) / 100,
    page: p,
    limit: l,
    totalPages: Math.ceil(totalCount / l),
    items: items.slice((p - 1) * l, p * l)
  });
});

// 4b. Búsqueda directa para el Módulo de Correcciones con los 7 campos completos
app.get('/api/correcciones/buscar', async (req, res) => {
  const { q = '', estado = 'todos' } = req.query;
  const term = q.trim().toLowerCase();
  if (!term || term.length < 2) {
    return res.json([]);
  }

  const store = db.loadStore();
  const results = [];
  const seenIds = new Set();

  // 1. Buscar en consumos de almacén (store.json)
  if (estado !== 'compras') {
    for (const c of store.consumos) {
      const matchNum = c.numero && c.numero.toLowerCase().includes(term);
      const matchPed = c.pedido && c.pedido.toLowerCase().includes(term);
      const matchCod = c.codigo && c.codigo.toLowerCase().includes(term);
      const matchDesc = c.descripcion && c.descripcion.toLowerCase().includes(term);
      const matchCta = (c.cuentaAuxiliar && c.cuentaAuxiliar.toLowerCase().includes(term)) ||
                       (c.cuentaAuxiliarOriginal && c.cuentaAuxiliarOriginal.toLowerCase().includes(term));
      const matchSol = c.solicitante && c.solicitante.toLowerCase().includes(term);
      const matchMot = c.motivo && c.motivo.toLowerCase().includes(term);

      if (matchNum || matchPed || matchCod || matchDesc || matchCta || matchSol || matchMot) {
        if (estado === 'pendientes' && c.esReclasificado) continue;
        if (estado === 'corregidos' && !c.esReclasificado) continue;

        seenIds.add(c.id);
        results.push({
          id: c.id,
          tipo: 'consumo',
          documento: `DP: ${c.numero} • PA: ${c.pedido || 'S/PA'}`,
          dp: c.numero,
          pa: c.pedido,
          fecha: c.fecha,
          codigo: c.codigo,
          descripcion: c.descripcion,
          categoria: c.categoria || 'Materiales Directos',
          cantidad: c.cantidad != null ? c.cantidad : 1,
          unidad: c.unidad || 'UND',
          costoUnitario: c.costoUnitario != null ? c.costoUnitario : (c.cantidad ? c.totalUSD / c.cantidad : 0),
          totalUSD: c.totalUSD != null ? c.totalUSD : 0,
          cuentaAuxiliar: c.cuentaAuxiliar,
          cuentaAuxiliarOriginal: c.cuentaAuxiliarOriginal || c.cuentaAuxiliar,
          esReclasificado: !!c.esReclasificado,
          infoReclasificacion: c.infoReclasificacion,
          solicitante: c.solicitante || 'S/D',
          solicitanteOComprador: c.solicitante || 'S/D',
          motivo: c.motivo || ''
        });
        if (results.length >= 60) break;
      }
    }
  }

  // 2. Buscar en compras y servicios (store.json)
  if (estado !== 'consumos') {
    for (const cp of store.compras) {
      if (results.length >= 120) break;
      const matchSC = cp.solicitudCompra && cp.solicitudCompra.toLowerCase().includes(term);
      const matchOC = cp.ordenCompra && cp.ordenCompra.toLowerCase().includes(term);
      const matchCod = cp.codigo && cp.codigo.toLowerCase().includes(term);
      const matchDesc = cp.descripcion && cp.descripcion.toLowerCase().includes(term);
      const matchCta = (cp.cuentaAuxiliar && cp.cuentaAuxiliar.toLowerCase().includes(term)) ||
                       (cp.cuentaAuxiliarOriginal && cp.cuentaAuxiliarOriginal.toLowerCase().includes(term));
      const matchProv = cp.proveedor && cp.proveedor.toLowerCase().includes(term);
      const matchComp = cp.comprador && cp.comprador.toLowerCase().includes(term);
      const matchMot = cp.motivo && cp.motivo.toLowerCase().includes(term);

      if (matchSC || matchOC || matchCod || matchDesc || matchCta || matchProv || matchComp || matchMot) {
        if (estado === 'pendientes' && cp.esReclasificado) continue;
        if (estado === 'corregidos' && !cp.esReclasificado) continue;

        seenIds.add(cp.id);
        const sol = getSolicitanteCompra(cp);
        results.push({
          id: cp.id,
          tipo: 'compra',
          documento: cp.ordenCompra ? `OC: ${cp.ordenCompra} • SC: ${cp.solicitudCompra || 'S/SC'}` : `SC: ${cp.solicitudCompra}`,
          sc: cp.solicitudCompra,
          oc: cp.ordenCompra,
          fecha: cp.fechaOC || cp.fechaSolicitud,
          codigo: cp.codigo,
          descripcion: cp.descripcion,
          categoria: cp.categoria || (cp.tipo === 'Servicios' ? 'SERVICIOS' : 'Materiales Directos'),
          cantidad: cp.cantidadOC || cp.cantidadSolicitada || cp.cantidadRecepcionada || 1,
          unidad: cp.unidad || 'UND',
          costoUnitario: cp.precioUnitario != null ? cp.precioUnitario : 0,
          totalUSD: cp.totalUSD != null ? cp.totalUSD : 0,
          cuentaAuxiliar: cp.cuentaAuxiliar,
          cuentaAuxiliarOriginal: cp.cuentaAuxiliarOriginal || cp.cuentaAuxiliar,
          esReclasificado: !!cp.esReclasificado,
          infoReclasificacion: cp.infoReclasificacion,
          solicitante: sol,
          solicitanteOComprador: sol,
          motivo: cp.motivo || ''
        });
      }
    }
  }

  // 3. Si hay pocos resultados, consultar también en SQLite master_unificado para encontrar movimientos de otros meses
  if (results.length < 30) {
    try {
      const resp = await fetch(`http://127.0.0.1:3006/api/unificada?search=${encodeURIComponent(term)}&mes=todos&limit=40`);
      if (resp.ok) {
        const sqlData = await resp.json();
        for (const r of (sqlData.items || [])) {
          const docId = r.tipo === 'Materiales Directos' 
            ? `CONS-${r.numero}-${r.codigo}-${r.almacen}`
            : `COMP-${r.numero || r.sc}-${r.pedido || r.oc}-${r.codigo}-1`;

          if (seenIds.has(docId)) continue;
          seenIds.add(docId);

          const isConsumo = r.tipo === 'Materiales Directos';
          if (estado === 'consumos' && !isConsumo) continue;
          if (estado === 'compras' && isConsumo) continue;

          results.push({
            id: docId,
            tipo: isConsumo ? 'consumo' : 'compra',
            documento: isConsumo ? `DP: ${r.numero} • PA: ${r.pedido || 'S/PA'}` : `SC: ${r.numero || r.sc} • OC: ${r.pedido || r.oc}`,
            dp: isConsumo ? r.numero : undefined,
            pa: isConsumo ? r.pedido : undefined,
            sc: !isConsumo ? (r.sc || r.numero) : undefined,
            oc: !isConsumo ? (r.oc || r.pedido) : undefined,
            fecha: r.fecha,
            codigo: r.codigo,
            descripcion: r.descripcion,
            categoria: r.categoria || (isConsumo ? 'Materiales Directos' : 'SERVICIOS'),
            cantidad: r.cantidad != null ? r.cantidad : 1,
            unidad: r.unidad || 'UND',
            costoUnitario: r.precio_final || 0,
            totalUSD: r.total_usd || 0,
            cuentaAuxiliar: r.cuenta_aux,
            cuentaAuxiliarOriginal: r.cuenta_aux,
            esReclasificado: !!(r.ajuste && r.ajuste.includes('CORREGIDO')),
            infoReclasificacion: null,
            solicitante: r.solicitante || 'S/D',
            solicitanteOComprador: r.solicitante || 'S/D',
            motivo: r.motivo || ''
          });

          if (results.length >= 60) break;
        }
      }
    } catch (e) {
      // Ignorar fallback silenciosamente
    }
  }

  res.json(results);
});

// 5. Get Proyectos Master List
app.get('/api/proyectos', (req, res) => {
  const store = db.loadStore();
  res.json(store.proyectos);
});

// 6. Corrección / Reclasificación de registro
app.post('/api/reclasificar', async (req, res) => {
  const { recordId, nuevaCuenta, motivo, usuario, nuevoProyecto, numero, codigo } = req.body;
  if (!recordId || !nuevaCuenta) {
    return res.status(400).json({ error: 'recordId y nuevaCuenta son requeridos' });
  }

  try {
    let rec = null;
    try {
      rec = db.reclasificar(recordId, nuevaCuenta, motivo, usuario, nuevoProyecto);
    } catch (e) {
      console.warn('[Store.json reclasificar notice]:', e.message);
    }

    // Actualizar directamente en SQLite unificada.db (válido para cualquier mes 2026)
    try {
      await fetch('http://127.0.0.1:3006/api/reclasificar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recordId, nuevaCuenta, nuevoProyecto, motivo, numero, codigo })
      });
    } catch (e) {
      console.warn('[Sync to SQLite unificadaService Warning]:', e.message);
    }

    // Sync October to SQLite if in October
    try {
      const { execSync } = require('child_process');
      const pyScript = path.join(__dirname, 'syncOctubreToMaster.py');
      execSync(`python "${pyScript}"`);
    } catch (e) {
      // Ignorar warning
    }

    res.json({ success: true, reclasificacion: rec });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 6b. Revertir Corrección
app.post('/api/reclasificar/revertir', (req, res) => {
  const { recordId } = req.body;
  if (!recordId) {
    return res.status(400).json({ error: 'recordId es requerido' });
  }

  try {
    const ok = db.revertirReclasificacion(recordId);

    // Sync changes to SQLite unificada.db immediately
    try {
      const { execSync } = require('child_process');
      const pyScript = path.join(__dirname, 'syncOctubreToMaster.py');
      execSync(`python "${pyScript}"`);
    } catch (e) {
      console.warn('[Sync to SQLite Warning]:', e.message);
    }

    res.json({ success: ok });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 7. Get all Reclasificaciones / Correcciones
app.get('/api/reclasificaciones', (req, res) => {
  const store = db.loadStore();
  const list = Object.values(store.reclasificaciones).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  res.json(list);
});

// 8. Cost Matrix by Project
app.get('/api/matriz', (req, res) => {
  const matrix = db.getMatrizCostos();
  const totalMateriales = matrix.reduce((s, p) => s + p.materialesDirectos, 0);
  const totalServicios = matrix.reduce((s, p) => s + p.servicios, 0);
  const granTotal = matrix.reduce((s, p) => s + p.totalUSD, 0);

  res.json({
    periodo: 'Corte al 31 de Octubre de 2026 (01/10/2026 al 31/10/2026)',
    totalMateriales: Math.round(totalMateriales * 100) / 100,
    totalServicios: Math.round(totalServicios * 100) / 100,
    granTotal: Math.round(granTotal * 100) / 100,
    proyectos: matrix
  });
});

// 8.1. Precios Manuales & Catálogo de Precios
app.get('/api/precios-manuales', (req, res) => {
  res.json(db.getPreciosManuales());
});

app.post('/api/precios-manuales', (req, res) => {
  const { codigo, precioManual, motivo = '', usuario = 'Alejandra Tesara' } = req.body || {};
  if (!codigo || typeof precioManual !== 'number') {
    return res.status(400).json({ error: 'Código y precioManual numérico requeridos' });
  }
  const result = db.guardarPrecioManual(codigo, precioManual, motivo, usuario);
  res.json({ success: true, item: result });
});

app.delete('/api/precios-manuales/:codigo', (req, res) => {
  const { codigo } = req.params;
  db.eliminarPrecioManual(codigo);
  res.json({ success: true, codigo });
});

// 9. Master Unificado Endpoints (Python SQLite Service Proxy)
app.get('/api/unificada', async (req, res) => {
  try {
    const q = new URLSearchParams(req.query).toString();
    const resp = await fetch(`http://127.0.0.1:3006/api/unificada?${q}`);
    const data = await resp.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/unificada/export', async (req, res) => {
  try {
    const q = new URLSearchParams(req.query).toString();
    const resp = await fetch(`http://127.0.0.1:3006/api/unificada/export?${q}`);
    const data = await resp.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/filtros', async (req, res) => {
  try {
    const q = new URLSearchParams(req.query).toString();
    const resp = await fetch(`http://127.0.0.1:3006/api/filtros${q ? '?' + q : ''}`);
    const data = await resp.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve Vite dist if built
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`  SISTEMA DE CONTROL Y GESTION DE COSTOS TIMACA (BACKEND)`);
  console.log(`  Servidor activo en: http://localhost:${PORT}`);
  console.log(`=======================================================`);
});
