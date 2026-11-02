const fs = require('fs');
const path = require('path');
const sipClient = require('../sipClient.cjs');
const db = require('../db.cjs');

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
  
  if (cp.motivo) {
    const match = cp.motivo.match(/solicit(?:ad[oa]|ante)\s*(?:por)?[:\s]+([^\n\r,–-]+)/i);
    if (match && match[1]) {
      const cleaned = cleanPersonName(match[1]);
      if (cleaned.length >= 3 && cleaned.length <= 40 && !/^\d+$/.test(cleaned)) {
        return cleaned;
      }
    }
  }

  if (cp.asignado && cp.asignado.trim() && cp.asignado.trim().toUpperCase() !== 'PROCESO ANULADO') {
    return cleanPersonName(cp.asignado);
  }

  return cleanPersonName(cp.comprador) || 'S/D';
}

function classifyArticle(cod, desc, catMap) {
  if (catMap.has(cod)) return catMap.get(cod);
  const d = (desc || '').toUpperCase();
  const c = (cod || '').toUpperCase();

  if (d.includes('ELECTR') || d.includes('CABLE') || d.includes('CONTACTOR') || d.includes('TRANSFORMADOR') || d.includes('INTERRUPTOR') || d.includes('REFLECTOR') || d.includes('SENSOR') || d.includes('CONDULET') || d.includes('CONDUIT')) {
    return 'Materiales Electricos';
  }
  if (d.includes('FERRETERIA') || d.includes('TORNILLO') || d.includes('TUERCA') || d.includes('ARANDELA') || d.includes('CLAVO') || d.includes('PERNO')) {
    return 'Materiales De Ferreteria';
  }
  if (d.includes('CORTE') || d.includes('MECHA') || d.includes('MACHO') || d.includes('DISCO') || d.includes('FRESADORA')) {
    return 'Herramientas De Corte';
  }
  if (d.includes('GUANTE') || d.includes('LENTE') || d.includes('CASCO') || d.includes('BOTA') || d.includes('FAJA') || d.includes('MASCARILLA') || d.includes('PROTECTOR')) {
    return 'Equipos De Proteccion Personal';
  }
  if (d.includes('HIDR') || d.includes('VALVULA') || d.includes('TUB') || d.includes('CODO') || d.includes('GRIFERIA') || d.includes('BOMBA')) {
    if (d.includes('GALVANIZADO')) return 'Materiales Galvanizados';
    if (d.includes('INOXIDABLE') || d.includes('ESPECIAL')) return 'Materiales Aceros Especiales';
    return 'Materiales Hidroneumaticos';
  }
  if (d.includes('PINTURA') || d.includes('ESMALTE') || d.includes('SOLVENTE') || d.includes('THINNER')) {
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

async function runSync() {
  console.log('====================================================');
  console.log('TIMACA - SINCRONIZACION COMPLETA OCTUBRE DESDE SIP');
  console.log('Fecha ejecución:', new Date().toISOString());
  console.log('====================================================');

  const inicio = '01/10/2026';
  const hasta = '31/10/2026';

  // 1. Fetch live data from SIP
  console.log(`\n1. Conectando a Nuevo SIP (192.168.11.168:8087)...`);
  const rawConsumos = await sipClient.getConsumos(inicio, hasta);
  console.log(`[SIP] Consumos obtenidos: ${rawConsumos.length}`);

  const rawCompras = await sipClient.getCompras(inicio, hasta);
  console.log(`[SIP] Compras obtenidas: ${rawCompras.length}`);

  const rawServicios = await sipClient.getServicios(inicio, hasta);
  console.log(`[SIP] Servicios Ejecutados obtenidos: ${rawServicios.length}`);
  const servExecMap = new Map();
  for (const s of rawServicios) {
    if (s.numero) servExecMap.set(s.numero.trim().toUpperCase(), s);
    if (s.OC) servExecMap.set(s.OC.trim().toUpperCase(), s);
  }

  // 2. Load Proyectos
  const proyectosPath = path.join(__dirname, '../public/data/sip/proyectos.json');
  let proyectos = [];
  if (fs.existsSync(proyectosPath)) {
    proyectos = JSON.parse(fs.readFileSync(proyectosPath, 'utf8'));
  }
  const projMap = new Map();
  for (const p of proyectos) {
    projMap.set(p.codigo.toUpperCase(), p);
  }

  // 3. Load Reclasificaciones
  const recPath = path.join(__dirname, '../public/data/sip/reclasificaciones.json');
  let reclasificacionesRaw = [];
  if (fs.existsSync(recPath)) {
    const parsed = JSON.parse(fs.readFileSync(recPath, 'utf8'));
    reclasificacionesRaw = Array.isArray(parsed) ? parsed : (parsed.items || Object.values(parsed));
  }
  const reclasificacionesMap = new Map();
  for (const r of reclasificacionesRaw) {
    if (r.recordId) reclasificacionesMap.set(r.recordId.trim(), r);
    const doc = String(r.documento || '').trim().toUpperCase();
    const cod = String(r.codigo || '').trim().toUpperCase();
    const sol = String(r.solicitud || '').trim().toUpperCase();
    if (doc && cod) reclasificacionesMap.set(`${doc}-${cod}`, r);
    if (doc) reclasificacionesMap.set(doc, r);
    if (sol && cod) reclasificacionesMap.set(`${sol}-${cod}`, r);
    if (sol) reclasificacionesMap.set(sol, r);
    if (r.recordId && r.recordId.startsWith('COMP-')) {
      const parts = r.recordId.split('-');
      if (parts.length >= 4) {
        const pSC = parts[1].toUpperCase();
        const pOC = parts[2].toUpperCase();
        const pCod = parts[3].toUpperCase();
        if (pSC && pSC !== 'NOSC') {
          reclasificacionesMap.set(pSC, r);
          reclasificacionesMap.set(`${pSC}-${pCod}`, r);
        }
        if (pOC && pOC !== 'NOOC') {
          reclasificacionesMap.set(pOC, r);
          reclasificacionesMap.set(`${pOC}-${pCod}`, r);
        }
      }
    }
  }

  // 4. Build Article Category Catalog
  const catMap = new Map();
  for (const f of ['unificada_septiembre.json', 'unificada_agosto.json', 'unificada_octubre.json']) {
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
  console.log(`[Catalog] Códigos de artículos precargados: ${catMap.size}`);

  // 5. Build Materiales Directos from Consumos
  console.log(`\n2. Procesando ${rawConsumos.length} Consumos de Octubre...`);
  const itemsConsumos = [];
  let seqId = 330000;

  for (const r of rawConsumos) {
    seqId++;
    const num = (r.numero || '').trim();
    const cod = (r.codigo || '').trim();
    const alm = (r.almacen || 'ALMCE').trim();
    const recId = `CONS-${num}-${cod}-${alm}`;

    let ctaAux = (r.ctaauxi || '').trim().toUpperCase();
    let esReclasificado = false;
    let ajuste = '';

    const match = reclasificacionesMap.get(recId) || 
                  reclasificacionesMap.get(`${num}-${cod}`) || 
                  (num && reclasificacionesMap.get(num));
    if (match) {
      ctaAux = match.nuevaCuenta.toUpperCase();
      esReclasificado = true;
      ajuste = 'CORREGIDO';
    }

    const motivo = (r.motivo || '').trim();
    const desc = (r.descripcion || '').trim();
    const isNorm = motivo.toUpperCase().includes('NORMALIZ') || 
                   desc.toUpperCase().includes('NORMALIZ') || 
                   motivo.toUpperCase().includes('MANUAL') || 
                   ajuste === 'NORMALIZACION';

    if (isNorm && !ajuste) {
      ajuste = 'NORMALIZACION';
    }

    const proj = projMap.get(ctaAux) || {
      nombre: (r.descripcionC || ctaAux).trim(),
      tipoCosto: 'Externo'
    };

    const cant = typeof r.cantidad === 'number' ? r.cantidad : parseFloat(r.cantidad || 0);
    const cUnit = typeof r.costoDolar === 'number' ? r.costoDolar : parseFloat(r.costoDolar || 0);
    const totalUSD = Math.round(cant * cUnit * 100) / 100;

    const categoria = classifyArticle(cod, desc, catMap);

    itemsConsumos.push({
      id: seqId,
      tipo: 'Materiales Directos',
      almacen: alm,
      fecha: parseDateToIso(r.fecha),
      numero: num,
      pedido: (r.pedido || '').trim(),
      cuenta_aux: ctaAux,
      ceco: (r.ceco || '').trim(),
      codigo: cod,
      descripcion: desc,
      cantidad: cant,
      unidad: (r.ctagasto || r.unidad || 'UND').trim(),
      solicitante: (r.solicitante || 'S/D').trim(),
      motivo: motivo,
      ajuste: ajuste,
      categoria: categoria,
      precio_final: cUnit,
      total_usd: totalUSD,
      precio_dolar: cUnit,
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
      datos_descripcion: proj.nombre || '',
      datos_tipo_costo: proj.tipoCosto || 'Externo',
      datos_tipo_equipo: '',
      datos_codigo_sysman: '',
      datos_zona: '',
      ano: 2026,
      nombre_mes: 'octubre',
      sc: '',
      oc: ''
    });
  }

  // 6. Build Servicios from Compras
  console.log(`\n3. Identificando y procesando Servicios desde ${rawCompras.length} Compras...`);
  const itemsServicios = [];

  for (const r of rawCompras) {
    const desc = (r.descripcion || '').trim().toUpperCase();
    const grupo = (r.grupo || '').trim().toUpperCase();
    const esServicio = grupo.includes('SERVICIO') || 
      desc.includes('SERVICIO') || 
      desc.includes('ALQUILER') || 
      desc.includes('TRANSPORTE') || 
      desc.includes('FLETE') || 
      desc.includes('IMPORTACION') || 
      desc.includes('MANTENIMIENTO') || 
      desc.includes('REPARACION') || 
      desc.includes('HONORARIOS');

    if (!esServicio) continue;

    seqId++;
    const sc = (r.SC || '').trim();
    const oc = (r.numero || r.OC || '').trim();
    const cod = (r.codigo || '').trim();
    const renglon = (r.renglon || '1').trim();
    const recId = `COMP-${sc || 'NOSC'}-${oc || 'NOOC'}-${cod}-${renglon}`;

    let ctaAux = (r.cuenta || '').trim().toUpperCase();
    let esReclasificado = false;
    let ajuste = '';

    const match = reclasificacionesMap.get(recId) || 
                  (sc && cod && reclasificacionesMap.get(`${sc}-${cod}`)) || 
                  (oc && cod && reclasificacionesMap.get(`${oc}-${cod}`)) || 
                  (sc && reclasificacionesMap.get(sc)) || 
                  (oc && reclasificacionesMap.get(oc));
    if (match) {
      ctaAux = match.nuevaCuenta.toUpperCase();
      esReclasificado = true;
      ajuste = 'CORREGIDO';
    }

    const proj = projMap.get(ctaAux) || {
      nombre: (r.DescripcionC || ctaAux).trim(),
      tipoCosto: 'Externo'
    };

    const cant = typeof r.cantidad === 'number' ? r.cantidad : parseFloat(r.cantidad || 0);
    const cantOC = typeof r.cantOC === 'number' ? r.cantOC : parseFloat(r.cantOC || 0);
    const effectiveCant = cantOC > 0 ? cantOC : cant;
    const totalUSD = typeof r.TotalD === 'number' ? r.TotalD : parseFloat(r.TotalD || 0);

    let precioUnitUSD = 0;
    if (effectiveCant > 0 && totalUSD > 0) {
      precioUnitUSD = Math.round((totalUSD / effectiveCant) * 10000) / 10000;
    } else if (typeof r.precioBs === 'number' && r.precioBs > 0) {
      precioUnitUSD = r.precioBs;
    }

    const fechaMov = r.fecha ? parseDateToIso(r.fecha) : parseDateToIso(r.fechaS || '2026-10-01');

    const execMatch = (sc ? servExecMap.get(sc.toUpperCase()) : null) || (oc ? servExecMap.get(oc.toUpperCase()) : null);
    const solReal = execMatch?.solicitado?.trim() || getSolicitanteCompra(r);
    const provReal = execMatch?.proveedor?.trim() || (r.proveedor || '').trim();

    itemsServicios.push({
      id: seqId,
      tipo: 'Servicios',
      almacen: (r.almacen || 'ALMSE').trim(),
      fecha: fechaMov,
      numero: sc || oc,
      pedido: oc || sc,
      cuenta_aux: ctaAux,
      ceco: (execMatch?.ceco || '').trim(),
      codigo: cod,
      descripcion: (r.descripcion || '').trim(),
      cantidad: effectiveCant,
      unidad: (r.unidad || 'USE').trim(),
      solicitante: solReal,
      proveedor: provReal,
      motivo: (r.motivo || '').trim(),
      ajuste: ajuste,
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
      datos_descripcion: proj.nombre || '',
      datos_tipo_costo: proj.tipoCosto || 'Externo',
      datos_tipo_equipo: '',
      datos_codigo_sysman: '',
      datos_zona: '',
      ano: 2026,
      nombre_mes: 'octubre',
      sc: sc,
      oc: oc,
      proveedor: (r.proveedor || '').trim(),
      comprador: (r.comprador || '').trim(),
      asignado: (r.asignado || '').trim()
    });
  }

  // Combine Consumos + Servicios into full Unificada dataset
  const allOctubreItems = [...itemsConsumos, ...itemsServicios];
  console.log(`\n4. Consolidado Octubre:`);
  console.log(`   - Materiales Directos: ${itemsConsumos.length}`);
  console.log(`   - Servicios: ${itemsServicios.length}`);
  console.log(`   - Total Transacciones Unificadas: ${allOctubreItems.length}`);

  // 7. Calculate Totales & Top Cuentas
  let granTotal = 0;
  let matTotal = 0;
  let servTotal = 0;
  let extTotal = 0;
  let intTotal = 0;
  let opexTotal = 0;
  let admonTotal = 0;

  const cuentasSummary = new Map();

  for (const r of allOctubreItems) {
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
    .map(c => ({
      ...c,
      total: Math.round(c.total * 100) / 100
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  const totales = {
    total_count: allOctubreItems.length,
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

  const unificadaOctubrePayload = {
    totales: totales,
    top_cuentas: topCuentas,
    page: 1,
    limit: allOctubreItems.length,
    items: allOctubreItems
  };

  // 8. Write public/data/sip/unificada_octubre.json
  const unificadaOctubreFile = path.join(__dirname, '../public/data/sip/unificada_octubre.json');
  fs.writeFileSync(unificadaOctubreFile, JSON.stringify(unificadaOctubrePayload), 'utf8');
  console.log(`[OK] Guardado: ${unificadaOctubreFile} (${(fs.statSync(unificadaOctubreFile).size / 1024 / 1024).toFixed(2)} MB)`);

  // 9. Update public/data/sip/status.json
  const statusFile = path.join(__dirname, '../public/data/sip/status.json');
  const nowIso = new Date().toISOString();
  const statusPayload = {
    sipConnected: true,
    sipHost: '192.168.11.168:8087 (Nuevo SIP NÚCLEO)',
    sipUser: 'drivero',
    lastSync: nowIso,
    totalConsumos: rawConsumos.length,
    totalCompras: rawCompras.length,
    totalProyectos: proyectos.length,
    totalReclasificaciones: reclasificacionesRaw.length
  };
  fs.writeFileSync(statusFile, JSON.stringify(statusPayload), 'utf8');
  console.log(`[OK] Guardado: ${statusFile}`);

  // 10. Update Matriz Costos
  const matrizFile = path.join(__dirname, '../public/data/sip/matriz.json');
  const matrizProyectosMap = new Map();

  for (const r of allOctubreItems) {
    const cta = r.cuenta_aux || 'SIN-ASIGNAR';
    if (!matrizProyectosMap.has(cta)) {
      matrizProyectosMap.set(cta, {
        codigo: cta,
        nombre: r.datos_descripcion || cta,
        tipoCosto: r.datos_tipo_costo || 'Externo',
        cliente: projMap.get(cta)?.cliente || 'TIMACA',
        materialesDirectos: 0,
        servicios: 0,
        manoDeObra: 0,
        horasMaquina: 0,
        costosIndirectos: 0,
        totalUSD: 0,
        totalItemsConsumos: 0,
        totalItemsCompras: 0
      });
    }
    const p = matrizProyectosMap.get(cta);
    const usd = Number(r.total_usd) || 0;
    if (r.tipo === 'Materiales Directos') {
      p.materialesDirectos += usd;
      p.totalItemsConsumos += 1;
    } else {
      p.servicios += usd;
      p.totalItemsCompras += 1;
    }
    p.totalUSD += usd;
  }

  // Also include purchases of materials in project matrix if tracked
  for (const r of rawCompras) {
    const desc = (r.descripcion || '').trim().toUpperCase();
    const grupo = (r.grupo || '').trim().toUpperCase();
    const esServicio = grupo.includes('SERVICIO') || desc.includes('SERVICIO') || desc.includes('ALQUILER') || desc.includes('TRANSPORTE') || desc.includes('FLETE') || desc.includes('IMPORTACION') || desc.includes('MANTENIMIENTO') || desc.includes('REPARACION') || desc.includes('HONORARIOS');
    if (!esServicio) {
      const cta = (r.cuenta || '').trim().toUpperCase();
      if (cta && matrizProyectosMap.has(cta)) {
        const p = matrizProyectosMap.get(cta);
        const tUsd = Number(r.TotalD) || 0;
        p.materialesDirectos += tUsd;
        p.totalUSD += tUsd;
        p.totalItemsCompras += 1;
      }
    }
  }

  const matrizProyectos = Array.from(matrizProyectosMap.values())
    .map(p => ({
      ...p,
      materialesDirectos: Math.round(p.materialesDirectos * 100) / 100,
      servicios: Math.round(p.servicios * 100) / 100,
      totalUSD: Math.round(p.totalUSD * 100) / 100
    }))
    .sort((a, b) => b.totalUSD - a.totalUSD);

  const matrizPayload = {
    periodo: `Corte al 31 de Octubre de 2026 (${inicio} al ${hasta})`,
    totalMateriales: Math.round(matTotal * 100) / 100,
    totalServicios: Math.round(servTotal * 100) / 100,
    granTotal: Math.round(granTotal * 100) / 100,
    proyectos: matrizProyectos
  };
  fs.writeFileSync(matrizFile, JSON.stringify(matrizPayload, null, 2), 'utf8');
  console.log(`[OK] Guardado: ${matrizFile}`);

  // 11. Specifically inspect Pellas (TTE-C-0706)
  const pellasRows = allOctubreItems.filter(r => r.cuenta_aux === 'TTE-C-0706');
  const pellasMat = pellasRows.filter(r => r.tipo === 'Materiales Directos');
  const pellasServ = pellasRows.filter(r => r.tipo === 'Servicios');
  const pellasMatUSD = pellasMat.reduce((a, b) => a + (b.total_usd || 0), 0);
  const pellasServUSD = pellasServ.reduce((a, b) => a + (b.total_usd || 0), 0);
  const pellasDates = {};
  for (const r of pellasRows) {
    pellasDates[r.fecha] = (pellasDates[r.fecha] || 0) + 1;
  }

  console.log('\n====================================================');
  console.log('VERIFICACION DETALLADA DE PELLAS (TTE-C-0706):');
  console.log('Total Registros Unificados:', pellasRows.length);
  console.log(' - Materiales Directos (Consumos):', pellasMat.length, 'filas | USD:', pellasMatUSD.toFixed(2));
  console.log(' - Servicios:', pellasServ.length, 'filas | USD:', pellasServUSD.toFixed(2));
  console.log(' - Total General Pellas USD:', (pellasMatUSD + pellasServUSD).toFixed(2));
  console.log('Desglose de fechas en Pellas:');
  console.log(pellasDates);
  console.log('====================================================\n');
}

runSync().catch(err => {
  console.error('[FATAL ERROR]:', err);
  process.exit(1);
});
