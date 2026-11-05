const fs = require('fs');
const path = require('path');

// Helpers
function parseDateToIso(dStr) {
  if (!dStr) return '';
  const str = dStr.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  const parts = str.split('/');
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[2].length === 2 ? '20' + parts[2] : parts[2];
    return `${year}-${month}-${day}`;
  }
  return str;
}

function cleanPersonName(raw) {
  if (!raw) return '';
  let str = raw.trim();
  str = str.split(/(?:motivo|fecha|hora|lugar|depto|departamento|tel|tlf|cedula|ci|complemento|reemplazo|anexo|nota)[:\s]/i)[0];
  str = str.replace(/[\(\)\[\]\.,;]/g, ' ').replace(/\s+/g, ' ').trim();
  str = str.replace(/^(?:el\s+)?sr\.?\s+/i, '');
  return str.trim();
}

function getSolicitanteCompra(cp) {
  if (cp.solicitante && cp.solicitante.trim()) return cleanPersonName(cp.solicitante);
  if (cp.comprador && cp.comprador.trim()) return cleanPersonName(cp.comprador);
  return 'S/D';
}

function classifyArticle(cod, desc, catMap) {
  if (catMap.has(cod)) return catMap.get(cod);
  const d = (desc || '').toUpperCase();
  if (d.includes('ELECTR') || d.includes('CABLE') || d.includes('CONTACTOR') || d.includes('TRANSFORMADOR') || d.includes('INTERRUPTOR') || d.includes('REFLECTOR') || d.includes('SENSOR') || d.includes('CONDULET') || d.includes('CONDUIT')) {
    return 'Materiales Electricos';
  }
  if (d.includes('FERRETERIA') || d.includes('TORNILLO') || d.includes('TUERCA') || d.includes('ARANDELA') || d.includes('CLAVO') || d.includes('PERNO')) {
    return 'Materiales De Ferreteria';
  }
  if (d.includes('CORTE') || d.includes('MECHA') || d.includes('MACHO') || d.includes('DISCO') || d.includes('FRESADORA') || d.includes('ELECTRODO')) {
    return 'Herramientas De Corte';
  }
  if (d.includes('GUANTE') || d.includes('LENTE') || d.includes('CASCO') || d.includes('BOTA') || d.includes('FAJA') || d.includes('MASCARILLA') || d.includes('PROTECTOR')) {
    return 'Equipos De Proteccion Personal';
  }
  if (d.includes('HIDR') || d.includes('VALVULA') || d.includes('TUB') || d.includes('CODO') || d.includes('GRIFERIA') || d.includes('BOMBA') || d.includes('BUSHING')) {
    if (d.includes('GALVANIZADO')) return 'Materiales Galvanizados';
    if (d.includes('INOXIDABLE') || d.includes('ESPECIAL')) return 'Materiales Aceros Especiales';
    return 'Materiales Hidroneumaticos';
  }
  if (d.includes('PINTURA') || d.includes('ESMALTE') || d.includes('SOLVENTE') || d.includes('THINNER') || d.includes('FORMULA') || d.includes('GAS PROPANO')) {
    return 'Tintas, Pinturas Y Colorantes';
  }
  if (d.includes('MECANIC') || d.includes('POLIPASTO') || d.includes('RODAMIENTO') || d.includes('ENGRANAJE')) {
    return 'Materiales Mecanicos';
  }
  if (d.includes('ESTRUCTURAL') || d.includes('PERFIL') || d.includes('VIGA') || d.includes('IPN')) {
    return 'Productos Metalicos Estructurales';
  }
  if (d.includes('CARBONO') || d.includes('BARRA LISA') || d.includes('LAMINA NEGRA')) {
    return 'Materiales Acero Al Carbono';
  }
  if (d.includes('HERRAMIENTA') || d.includes('HARAGAN') || d.includes('LLAVE')) {
    return 'Herramientas Manuales';
  }
  if (d.includes('RADIO') || d.includes('COMPUT') || d.includes('TECNOLOG')) {
    return 'Infraestructura Tecnologica';
  }
  if (d.includes('SAND BLASTING')) {
    return 'Eq. Rep. Y Acc De Sandblasting';
  }
  return 'Materiales Directos';
}

function resolverCuentaAuxiliar(rawCta, motivo, desc, solicitante, codigoMat) {
  const c = (rawCta || '').trim().toUpperCase();
  const m = (motivo || '').toUpperCase();
  const d = (desc || '').toUpperCase();
  const sol = (solicitante || '').toUpperCase();

  if (/^[A-Z]{2,4}-[A-Z0-9]+-[A-Z0-9]+/i.test(c)) {
    return c;
  }

  if (m.includes('TTE-C-0706') || m.includes('1LPP') || m.includes('PLANTA DE PELLAS') || m.includes('PLANTA PELLAS') || m.includes('LINEA 1 PELLAS')) {
    return 'TTE-C-0706';
  }
  if (m.includes('TTE-C-0640') || m.includes('PARRILLA MÓVIL') || m.includes('PARRILLA MOVIL')) {
    return 'TTE-C-0640';
  }
  if (m.includes('TTE-C-0671') || m.includes('2DA LINEA PMH') || m.includes('SEGUNDA LINEA PMH') || m.includes('PMH') || m.includes('DRAVO') || m.includes('TH4') || m.includes('VISCO ORINOCO')) {
    return 'TTE-C-0671';
  }
  if (m.includes('TTE-C-0683') || m.includes('BRIQUETAS') || m.includes('REFORMADOR') || m.includes('CALDERA')) {
    return 'TTE-C-0683';
  }
  if (m.includes('BOCA GRANDE') || m.includes('TTE-C-0655')) {
    return 'TTE-C-0655';
  }
  if (m.includes('IMPSA') || m.includes('TTE-C-0652')) {
    return 'TTE-C-0652';
  }

  switch (c) {
    case 'FABRICACIÓN':
    case 'FABRICACION':
      return 'TT-A-C-505';

    case 'OPERACIONES':
      if (sol.includes('ALBERT') || m.includes('VALENCIA') || m.includes('METAL Y ACERO') || m.includes('FABRICAC')) {
        return 'TT-A-C-505';
      }
      return 'TT-A-C-500';

    case 'ADMINISTRATIVO':
    case 'ADMINISTRACION':
      if (m.includes('REPUESTOS ECO')) return 'EE-A-C-511';
      return 'TT-A-C-200';

    case 'GENERAL (GERENTE, ASISTENTE)':
    case 'GENERAL':
    case 'CUENTA SOCIO':
      return 'TT-A-C-100';

    case 'RECURSOS HUMANOS':
    case 'RRHH':
      if (m.includes('EPP')) return 'TT-A-C-601';
      return 'TT-A-C-600';

    case 'EQUIPO MÓVIL':
    case 'EQUIPO MOVIL':
      const vehMatch = m.match(/\b(BS\d{2}|VH\d{2}|CH\d{2}|CA\d{2}|GR\d{2}|RM\d{2}|TR\d{2}|MC\d{2})\b/);
      if (vehMatch) {
        const vCode = vehMatch[1];
        if (vCode.startsWith('BS')) return `EEA-C-${vCode}`;
        if (vCode.startsWith('VH')) return `EEE-C-${vCode}`;
        if (vCode.startsWith('GR')) return `EEI-C-${vCode}`;
        if (vCode.startsWith('CH')) return `EEM-C-${vCode}`;
        if (vCode.startsWith('CA')) return `EEM-C-${vCode}`;
        if (vCode.startsWith('RM')) return `EEM-C-${vCode}`;
        if (vCode.startsWith('TR')) return `EEE-C-${vCode}`;
        if (vCode.startsWith('MC')) return `EEE-C-${vCode}`;
      }
      return 'EE-A-C-507';

    case 'PLANIFICACIÓN':
    case 'PLANIFICACION':
      return 'TT-A-C-400';

    case 'PELLAS':
    case 'PELLAS 1':
      return 'TTE-C-0706';

    case 'PMH':
      return 'TTE-C-0671';

    case 'BRIQUETAS':
      return 'TTE-C-0683';

    case 'BOCA GRANDE':
      return 'TTE-C-0655';

    case 'SMB':
      return 'TSI-T-0100';

    case 'IMPSA':
      return 'TTE-C-0652';

    case 'VISCO ORINOCO, C.A.':
    case 'VISCO ORINOCO':
      return 'TTE-C-0671';

    case 'TIMACA':
      if (m.includes('BAÑOS') || m.includes('PORTATILES') || m.includes('ALMACEN') || d.includes('IMPORTACION')) {
        return 'TT-A-C-203';
      }
      return 'TT-I-C-033';

    default:
      return c || 'SIN-ASIGNAR';
  }
}

async function getSipCookie() {
  const token = 'eyJhbGciOiJFUzI1NiIsImtpZCI6Ijk4MzgyZTNhLTZlZWQtNDU0OC05ZTY2LTM1NmRiNTM2Y2E2OSIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2Fra3p2bXBjeHdsaXFndXhybG9tLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiJkZDQ5NDVjMy0zYTAzLTRlZjctYTcwYS02NTAwMTA2N2Q4NzYiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzkzODMwNTU0LCJpYXQiOjE3OTM4MjY5NTQsImVtYWlsIjoiYWxlamFuZHJhdGVzYXJhQHRpbWFjYS5jb20udmUiLCJwaG9uZSI6IiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIiwicHJvdmlkZXJzIjpbImVtYWlsIl19LCJ1c2VyX21ldGFkYXRhIjp7fSwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJhYWwiOiJhYWwxIiwiYW1yIjpbeyJtZXRob2QiOiJwYXNzd29yZCIsInRpbWVzdGFtcCI6MTc5MzgyNjk1NH1dLCJzZXNzaW9uX2lkIjoiNGQyYjVjNDktYzZmOS00YmQxLWJjZWEtMGVkNWFjNzQ0OGVjIiwiaXNfYW5vbnltb3VzIjpmYWxzZX0.c993lFi4MyGXHjLI_toTlozjvhFfAfFooNDP93CSsn-MyRaDgdXDA3MaIOolNavFbtAOu-VkvujWvAPb45LK2g';

  const valeRes = await fetch('https://nucleo-erp-alpha.vercel.app/api/sip-vale', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const valeData = await valeRes.json();
  if (!valeData.vale) throw new Error('No vale returned from Nucleo ERP');

  const formBody = new URLSearchParams();
  formBody.append('vale', valeData.vale);

  const sipRes = await fetch('http://sip.timaca.com/entrar-por-nucleo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Host': 'sip.timaca.com' },
    body: formBody.toString(),
    redirect: 'manual'
  });

  const cookieHeader = sipRes.headers.get('set-cookie');
  if (!cookieHeader) throw new Error('No cookie returned from SIP');
  return cookieHeader.split(';')[0];
}

async function runSyncNoviembre() {
  console.log('====================================================');
  console.log('TIMACA - SINCRONIZACION NOVIEMBRE 2026 DIRECTO SIP');
  console.log('Fecha ejecución:', new Date().toISOString());
  console.log('====================================================');

  const cookie = await getSipCookie();
  console.log('[SIP] Autenticado exitosamente en sip.timaca.com');

  // 1. Fetch Salidas Nov 1 to Nov 4
  console.log('[SIP] Consultando Salidas de Almacén (01/11/2026 al 04/11/2026 - Todos los almacenes)...');
  const salidasRes = await fetch('http://sip.timaca.com/api/movimientos/salidas?desde=2026-11-01&hasta=2026-11-04&almacen=%25', {
    headers: { 'Host': 'sip.timaca.com', 'Cookie': cookie }
  });
  const rawSalidas = await salidasRes.json();
  console.log(`[SIP] Salidas obtenidas: ${rawSalidas.length}`);

  // 2. Fetch Compras/Servicios Nov 1 to Nov 4
  console.log('[SIP] Consultando Órdenes (01/11/2026 al 04/11/2026)...');
  const ordRes = await fetch('http://sip.timaca.com/api/ordenes/renglones?desde=2026-11-01&hasta=2026-11-04', {
    headers: { 'Host': 'sip.timaca.com', 'Cookie': cookie }
  });
  const rawCompras = await ordRes.json();
  console.log(`[SIP] Órdenes obtenidas: ${rawCompras.length}`);

  // 3. Load catalog
  const proyectosPath = path.join(__dirname, '../public/data/sip/proyectos.json');
  let proyectos = [];
  if (fs.existsSync(proyectosPath)) {
    proyectos = JSON.parse(fs.readFileSync(proyectosPath, 'utf8'));
  }
  const projMap = new Map();
  for (const p of proyectos) {
    projMap.set(p.codigo.toUpperCase(), p);
  }

  // Preload article categories
  const catMap = new Map();
  for (const f of ['unificada_octubre.json', 'unificada_septiembre.json', 'unificada_agosto.json']) {
    const p = path.join(__dirname, '../public/data/sip', f);
    if (fs.existsSync(p)) {
      try {
        const d = JSON.parse(fs.readFileSync(p, 'utf8'));
        for (const item of (d.items || [])) {
          if (item.codigo && item.categoria && !catMap.has(item.codigo)) {
            catMap.set(item.codigo, item.categoria);
          }
        }
      } catch (e) {}
    }
  }

  // 4. Map Salidas
  console.log('\nProcesando Salidas de Noviembre...');
  let seqId = 440000;
  const itemsConsumos = [];

  for (const r of rawSalidas) {
    seqId++;
    const num = (r.numero || '').trim();
    const cod = (r.material || r.codigo || '').trim();
    const alm = (r.almacen || 'ALMCE').trim();
    const ctaAux = (r.cuentaAuxiliar || r.ctaauxi || '').trim().toUpperCase();

    const proj = projMap.get(ctaAux) || {
      nombre: (r.descripcionCuenta || ctaAux).trim(),
      tipoCosto: 'Externo'
    };

    const cant = typeof r.cantidad === 'number' ? r.cantidad : parseFloat(r.cantidad || 0);
    const cUnit = typeof r.costoDolar === 'number' ? r.costoDolar : parseFloat(r.costoDolar || 0);
    const totalUSD = Math.round(cant * cUnit * 100) / 100;
    const desc = (r.descripcion || '').trim();
    const categoria = classifyArticle(cod, desc, catMap);

    itemsConsumos.push({
      id: seqId,
      tipo: 'Materiales Directos',
      almacen: alm,
      fecha: parseDateToIso(r.fecha),
      numero: num,
      pedido: (r.pedido || '').trim(),
      cuenta_aux: ctaAux,
      ceco: (r.centroCosto || r.ceco || '').trim(),
      codigo: cod,
      descripcion: desc,
      cantidad: cant,
      unidad: (r.cuentaGasto || r.ctagasto || r.unidad || 'UND').trim(),
      solicitante: (r.solicitante || 'S/D').trim(),
      motivo: (r.motivo || '').trim(),
      ajuste: '',
      categoria: categoria,
      precio_final: cUnit,
      total_usd: totalUSD,
      precio_dolar: cUnit,
      precio_sip_original: cUnit,
      total_sip_original: totalUSD,
      semana: null,
      fecha_hasta: '',
      apellidos_nombres: '',
      cargo: '',
      supervisor: '',
      area_ubicacion: '',
      tarifa: 0,
      actividad: '',
      tiempo_total: '',
      equipo: '',
      posesion: '',
      tipo_equipo: '',
      linea_prod_desc: '',
      agrupador_linea: '',
      linea_produccion: '',
      datos_descripcion: proj.nombre || r.descripcionCuenta || ctaAux,
      datos_tipo_costo: proj.tipoCosto || 'Externo',
      datos_tipo_equipo: '',
      datos_codigo_sysman: '',
      datos_zona: '',
      ano: 2026,
      nombre_mes: 'noviembre',
      sc: '',
      oc: r.odt || ''
    });
  }

  // 5. Map Servicios from Compras
  console.log('\nProcesando Órdenes y Servicios de Noviembre...');
  const itemsServicios = [];

  for (const r of rawCompras) {
    const desc = (r.descripcion || '').trim().toUpperCase();
    const esServicio = desc.includes('SERVICIO') || 
      desc.includes('ALQUILER') || 
      desc.includes('TRANSPORTE') || 
      desc.includes('FLETE') || 
      desc.includes('MANTENIMIENTO') || 
      desc.includes('REPARACION') || 
      desc.includes('HONORARIOS') ||
      (r.tipo || '').toUpperCase().includes('SERVICIO');

    if (!esServicio) continue;

    seqId++;
    const sc = (r.solicitud || r.SC || '').trim();
    const oc = (r.numero || r.OC || '').trim();
    const cod = (r.material || r.codigo || '').trim();
    let ctaAux = (r.descripcionCuenta || r.cuenta || '').trim().toUpperCase();
    ctaAux = resolverCuentaAuxiliar(ctaAux, r.motivo, r.descripcion, r.solicitante || r.comprador, cod);

    const proj = projMap.get(ctaAux) || {
      nombre: (r.descripcionCuenta || ctaAux).trim(),
      tipoCosto: 'Externo'
    };

    const cant = typeof r.cantidad === 'number' ? r.cantidad : parseFloat(r.cantidad || 0);
    const totalUSD = typeof r.total === 'number' ? r.total : parseFloat(r.total || 0);
    let precioUnitUSD = cant > 0 ? Math.round((totalUSD / cant) * 10000) / 10000 : (r.precio || 0);

    itemsServicios.push({
      id: seqId,
      tipo: 'Servicios',
      almacen: 'ALMSE',
      fecha: parseDateToIso(r.fecha),
      numero: sc || oc,
      pedido: oc || sc,
      cuenta_aux: ctaAux,
      ceco: '',
      codigo: cod,
      descripcion: (r.descripcion || '').trim(),
      cantidad: cant,
      unidad: 'USE',
      solicitante: getSolicitanteCompra(r),
      proveedor: (r.nombreProveedor || r.proveedor || '').trim(),
      motivo: (r.motivo || '').trim(),
      ajuste: '',
      categoria: 'SERVICIOS',
      precio_final: precioUnitUSD,
      total_usd: totalUSD,
      precio_dolar: precioUnitUSD,
      semana: null,
      fecha_hasta: '',
      apellidos_nombres: '',
      cargo: '',
      supervisor: '',
      area_ubicacion: '',
      tarifa: 0,
      actividad: '',
      tiempo_total: '',
      equipo: '',
      posesion: '',
      tipo_equipo: '',
      linea_prod_desc: '',
      agrupador_linea: '',
      linea_produccion: '',
      datos_descripcion: proj.nombre || r.descripcionCuenta || ctaAux,
      datos_tipo_costo: proj.tipoCosto || 'Externo',
      datos_tipo_equipo: '',
      datos_codigo_sysman: '',
      datos_zona: '',
      ano: 2026,
      nombre_mes: 'noviembre',
      sc: sc,
      oc: oc,
      proveedor: (r.nombreProveedor || r.proveedor || '').trim(),
      comprador: (r.comprador || '').trim()
    });
  }

  const allNovItems = [...itemsConsumos, ...itemsServicios];
  console.log(`\nConsolidado Noviembre:`);
  console.log(` - Materiales Directos (Salidas SIP): ${itemsConsumos.length}`);
  console.log(` - Servicios: ${itemsServicios.length}`);
  console.log(` - Total Transacciones: ${allNovItems.length}`);

  // Calculate totals
  let granTotal = 0;
  let matTotal = 0;
  let servTotal = 0;
  let extTotal = 0;
  let intTotal = 0;
  let opexTotal = 0;
  let admonTotal = 0;

  const cuentasSummary = new Map();

  for (const r of allNovItems) {
    const usd = Number(r.total_usd) || 0;
    granTotal += usd;

    if (r.tipo === 'Materiales Directos') matTotal += usd;
    if (r.tipo === 'Servicios') servTotal += usd;

    const tc = (r.datos_tipo_costo || '').toLowerCase();
    if (tc.includes('externo')) extTotal += usd;
    else if (tc.includes('interno') || tc.includes('transferencia')) intTotal += usd;
    else if (tc.includes('opex') || tc.includes('flota') || tc.includes('infraestructura')) opexTotal += usd;
    else if (tc.includes('admon') || tc.includes('socio') || tc.includes('representac')) admonTotal += usd;
    else extTotal += usd;

    const cta = r.cuenta_aux || 'SIN-ASIGNAR';
    if (!cuentasSummary.has(cta)) {
      cuentasSummary.set(cta, {
        cuenta_aux: cta,
        datos_descripcion: r.datos_descripcion || cta,
        datos_tipo_costo: r.datos_tipo_costo || 'Externo',
        total: 0,
        rows: 0
      });
    }
    const acc = cuentasSummary.get(cta);
    acc.total += usd;
    acc.rows += 1;
  }

  const topCuentas = Array.from(cuentasSummary.values())
    .map(c => ({ ...c, total: Math.round(c.total * 100) / 100 }))
    .sort((a, b) => b.total - a.total);

  const totales = {
    total_count: allNovItems.length,
    gran_total: Math.round(granTotal * 100) / 100,
    mat_total: Math.round(matTotal * 100) / 100,
    serv_total: Math.round(servTotal * 100) / 100,
    mdo_total: 0,
    hm_total: 0,
    ind_total: 0,
    ext_total: Math.round(extTotal * 100) / 100,
    int_total: Math.round(intTotal * 100) / 100,
    opex_total: Math.round(opexTotal * 100) / 100,
    admon_total: Math.round(admonTotal * 100) / 100
  };

  const payload = {
    totales: totales,
    top_cuentas: topCuentas.slice(0, 10),
    page: 1,
    limit: allNovItems.length,
    items: allNovItems
  };

  // Write to public/data/sip/unificada_noviembre.json and dist/data/sip/unificada_noviembre.json
  const publicFile = path.join(__dirname, '../public/data/sip/unificada_noviembre.json');
  fs.writeFileSync(publicFile, JSON.stringify(payload, null, 2), 'utf8');
  console.log(`[OK] Guardado en: ${publicFile}`);

  const distDir = path.join(__dirname, '../dist/data/sip');
  if (fs.existsSync(distDir)) {
    const distFile = path.join(distDir, 'unificada_noviembre.json');
    fs.writeFileSync(distFile, JSON.stringify(payload, null, 2), 'utf8');
    console.log(`[OK] Guardado en: ${distFile}`);
  }

  // Summary for Pellas
  const pellasRows = allNovItems.filter(r => r.cuenta_aux === 'TTE-C-0706');
  console.log('\n====================================================');
  console.log('RESUMEN NOVIEMBRE - PELLAS (TTE-C-0706):');
  console.log('Filas Pellas en Noviembre:', pellasRows.length);
  const pellasTotalUSD = pellasRows.reduce((a, b) => a + (b.total_usd || 0), 0);
  console.log('Monto USD Pellas en Noviembre:', pellasTotalUSD.toFixed(2));
  console.log('Gran Total Noviembre USD (4 días):', granTotal.toFixed(2));
  console.log('====================================================\n');
}

runSyncNoviembre().catch(console.error);
