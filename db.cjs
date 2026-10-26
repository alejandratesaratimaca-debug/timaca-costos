const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const DATA_DIR = path.join(__dirname, 'data');
const STORE_PATH = path.join(DATA_DIR, 'store.json');
const CATALOGO_PATH = path.join(DATA_DIR, 'catalogo.json');

let catalogoMap = null;
function getCatalogo() {
  if (!catalogoMap && fs.existsSync(CATALOGO_PATH)) {
    try {
      catalogoMap = JSON.parse(fs.readFileSync(CATALOGO_PATH, 'utf-8'));
    } catch (e) {
      catalogoMap = {};
    }
  }
  return catalogoMap || {};
}

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const defaultState = {
  lastSync: null,
  consumos: [],        // Raw/enriched consumos from SIP
  compras: [],         // Raw/enriched compras from SIP
  proyectos: [],       // List of official project codes & names
  reclasificaciones: {}, // key: recordId -> { nuevaCuenta, nuevoProyecto, motivo, fecha, usuario }
  preciosManuales: {},   // key: codigo -> { precioManual, motivo, fecha, usuario }
  manoDeObra: [],
  horasMaquina: [],
  costosIndirectos: []
};

function loadStore() {
  if (fs.existsSync(STORE_PATH)) {
    try {
      const content = fs.readFileSync(STORE_PATH, 'utf-8');
      return { ...defaultState, ...JSON.parse(content) };
    } catch (e) {
      console.error('[DB] Error reading store, using default:', e.message);
    }
  }
  return { ...defaultState };
}

function saveStore(store) {
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf-8');
}

// Load official project master from Base Consultas.xlsx
function syncProyectosFromMaster() {
  const store = loadStore();
  const pathConsultas = 'Y:/Costos Master/2 Data Fija/Base Consultas.xlsx';
  
  if (fs.existsSync(pathConsultas)) {
    try {
      const wb = XLSX.readFile(pathConsultas);
      const ws = wb.Sheets['Datos'];
      if (ws) {
        const rows = XLSX.utils.sheet_to_json(ws);
        const map = new Map();
        
        for (const r of rows) {
          const cta = (r['Cta Auxiliar'] || r['Cuenta Auxiliar'] || '').toString().trim().toUpperCase();
          if (cta && !map.has(cta)) {
            map.set(cta, {
              codigo: cta,
              nombre: (r['Descripción'] || r['Descripcion'] || r['Depto / Area / Cliente'] || cta).toString().trim(),
              tipoCosto: (r['Tipo Costo'] || r['Tipo'] || 'Operativo').toString().trim(),
              cliente: (r['Depto / Area / Cliente'] || r['Filial'] || '').toString().trim(),
              ceco: (r['CeCo'] || '').toString().trim()
            });
          }
        }
        store.proyectos = Array.from(map.values());
        saveStore(store);
        console.log(`[DB] Cargados ${store.proyectos.length} proyectos oficiales desde Base Consultas.`);
        return store.proyectos;
      }
    } catch (e) {
      console.error('[DB] Error loading Base Consultas:', e.message);
    }
  }
  
  // Fallback defaults if network is offline
  if (store.proyectos.length === 0) {
    store.proyectos = [
      { codigo: 'TTE-C-0706', nombre: 'Mantenimiento Planta de Pellas 2026', tipoCosto: 'Directo', cliente: 'FERROMINERA' },
      { codigo: 'TTE-C-0693', nombre: 'Reparación Estructural Muelle PMH', tipoCosto: 'Directo', cliente: 'FERROMINERA' },
      { codigo: 'TTE-C-0697', nombre: 'Generador Eléctrico Briquetas', tipoCosto: 'Directo', cliente: 'BRIQUETERA' },
      { codigo: 'TTE-C-0656', nombre: 'Bandas Transportadoras PMH', tipoCosto: 'Directo', cliente: 'FERROMINERA' },
      { codigo: 'TTE-C-0676', nombre: 'Servicio Mecanizado Pesado Pellas', tipoCosto: 'Directo', cliente: 'FERROMINERA' },
      { codigo: 'TT-I-C-033', nombre: 'Adecuación Contenedores Planta', tipoCosto: 'Interno', cliente: 'TIMACA' },
      { codigo: 'TT-S-C-800', nombre: 'Servicios Administrativos / Socios', tipoCosto: 'Indirecto', cliente: 'TIMACA' }
    ];
    saveStore(store);
  }
  return store.proyectos;
}

// Ingest Consumos from SIP with deduplication and reclassification check
function ingestConsumos(rawItems) {
  const store = loadStore();
  const existingMap = new Map();
  
  // Index existing items
  for (const item of store.consumos) {
    existingMap.set(item.id, item);
  }

  let added = 0;
  let updated = 0;

  for (const r of rawItems) {
    const num = (r.numero || '').trim();
    const cod = (r.codigo || '').trim();
    const fecha = (r.fecha || '').trim();
    const cant = typeof r.cantidad === 'number' ? r.cantidad : parseFloat(r.cantidad || 0);
    const costoUnit = typeof r.costoDolar === 'number' ? r.costoDolar : parseFloat(r.costoDolar || 0);
    const totalUSD = Math.round(cant * costoUnit * 100) / 100;

    // Unique transaction key
    const id = `CONS-${num}-${cod}-${r.almacen || ''}`;
    
    // Check if reclassified
    let ctaAuxOriginal = (r.ctaauxi || '').trim().toUpperCase();
    let ctaAuxFinal = ctaAuxOriginal;
    let esReclasificado = false;
    let infoReclasificacion = null;

    if (store.reclasificaciones[id]) {
      ctaAuxFinal = store.reclasificaciones[id].nuevaCuenta;
      esReclasificado = true;
      infoReclasificacion = store.reclasificaciones[id];
    }

    const catInfo = getCatalogo()[cod.toUpperCase()] || {};
    const categoria = catInfo.categoria || 'Materiales Directos';

    const item = {
      id: id,
      almacen: r.almacen || '',
      numero: num,
      fecha: fecha,
      codigo: cod,
      descripcion: (r.descripcion || '').trim(),
      cantidad: cant,
      unidad: (r.ctagasto || 'UND').trim(),
      cuentaAuxiliarOriginal: ctaAuxOriginal,
      cuentaAuxiliar: ctaAuxFinal,
      esReclasificado: esReclasificado,
      infoReclasificacion: infoReclasificacion,
      ceco: (r.ceco || '').trim(),
      solicitante: (r.solicitante || '').trim(),
      motivo: (r.motivo || '').trim(),
      pedido: (r.pedido || '').trim(),
      costoUnitario: costoUnit,
      costoPromedio: r.costoprom || 0,
      totalUSD: totalUSD,
      estatus: r.estatus || 'FINALIZADO',
      tipo: 'Materiales Directos',
      categoria: categoria
    };

    if (existingMap.has(id)) {
      // Preserve local reclasification if re-syncing
      if (existingMap.get(id).esReclasificado) {
        item.cuentaAuxiliar = existingMap.get(id).cuentaAuxiliar;
        item.esReclasificado = true;
        item.infoReclasificacion = existingMap.get(id).infoReclasificacion;
      }
      existingMap.set(id, item);
      updated++;
    } else {
      existingMap.set(id, item);
      added++;
    }
  }

  store.consumos = Array.from(existingMap.values());
  store.lastSync = new Date().toISOString();
  saveStore(store);
  console.log(`[DB] Consumos procesados: ${added} nuevos, ${updated} actualizados. Total en BD: ${store.consumos.length}`);
  return { added, updated, total: store.consumos.length };
}

// Ingest Compras from SIP with deduplication
function ingestCompras(rawItems) {
  const store = loadStore();
  const existingMap = new Map();

  for (const item of store.compras) {
    existingMap.set(item.id, item);
  }

  let added = 0;
  let updated = 0;

  for (const r of rawItems) {
    const sc = (r.SC || '').trim();
    const oc = (r.OC || r.numero || '').trim();
    const cod = (r.codigo || '').trim();
    const renglon = (r.renglon || '1').trim();
    const cant = typeof r.cantidad === 'number' ? r.cantidad : parseFloat(r.cantidad || 0);
    const cantOC = typeof r.cantOC === 'number' ? r.cantOC : parseFloat(r.cantOC || 0);
    const cantRec = typeof r.CantRec === 'string' ? parseFloat(r.CantRec.replace(',', '.') || 0) : (r.CantRec || 0);
    const totalUSD = typeof r.TotalD === 'number' ? r.TotalD : parseFloat(r.TotalD || 0);
    const effectiveCant = cantOC > 0 ? cantOC : cant;

    // En SIP: TotalD es total USD, precioBs es precio unitario USD, y precioD son Bolívares (VES)
    let precioUnitUSD = 0;
    if (effectiveCant > 0 && totalUSD > 0) {
      precioUnitUSD = Math.round((totalUSD / effectiveCant) * 10000) / 10000;
    } else if (typeof r.precioBs === 'number' && r.precioBs > 0) {
      precioUnitUSD = r.precioBs;
    } else if (typeof r.precioBs === 'string' && parseFloat(r.precioBs) > 0) {
      precioUnitUSD = parseFloat(r.precioBs);
    }
    const finalTotalUSD = totalUSD > 0 ? totalUSD : (effectiveCant > 0 ? Math.round(effectiveCant * precioUnitUSD * 100) / 100 : 0);

    const id = `COMP-${sc || 'NOSC'}-${oc || 'NOOC'}-${cod}-${renglon}`;
    
    let ctaAuxOriginal = (r.cuenta || '').trim().toUpperCase();
    let ctaAuxFinal = ctaAuxOriginal;
    let esReclasificado = false;
    let infoReclasificacion = null;

    if (store.reclasificaciones[id]) {
      ctaAuxFinal = store.reclasificaciones[id].nuevaCuenta;
      esReclasificado = true;
      infoReclasificacion = store.reclasificaciones[id];
    }

    // Determine category: Servicios vs Compras / Materiales
    const desc = (r.descripcion || '').toUpperCase();
    const grupo = (r.grupo || '').toUpperCase();
    const esServicio = grupo.includes('SERVICIO') || 
      desc.includes('SERVICIO') || 
      desc.includes('ALQUILER') || 
      desc.includes('TRANSPORTE') || 
      desc.includes('FLETE') || 
      desc.includes('IMPORTACION') ||
      desc.includes('MANTENIMIENTO') ||
      desc.includes('REPARACION') ||
      desc.includes('HONORARIOS');
    
    let tipo = esServicio ? 'Servicios' : 'Compras / Materiales';
    let categoria = esServicio ? 'SERVICIOS' : 'Materiales Directos';
    if (!esServicio) {
      const catInfo = getCatalogo()[cod.toUpperCase()] || {};
      categoria = catInfo.categoria || 'Materiales Directos';
    }

    const item = {
      id: id,
      almacen: r.almacen || '',
      solicitudCompra: sc,
      ordenCompra: oc,
      fechaOC: (r.fecha || '').trim(),
      fechaSolicitud: r.fechaS || r.fechareq || '',
      fechaRecepcion: r.fechaR || '',
      recepcion: (r.recepcion || '').trim(),
      codigo: cod,
      descripcion: (r.descripcion || '').trim(),
      cantidadSolicitada: cant,
      cantidadOC: cantOC,
      cantidadRecepcionada: cantRec,
      unidad: (r.unidad || 'UND').trim(),
      cuentaAuxiliarOriginal: ctaAuxOriginal,
      cuentaAuxiliar: ctaAuxFinal,
      esReclasificado: esReclasificado,
      infoReclasificacion: infoReclasificacion,
      comprador: (r.comprador || '').trim(),
      proveedor: (r.proveedor || '').trim(),
      precioUnitario: precioUnitUSD,
      totalUSD: finalTotalUSD,
      precioBs: typeof r.precioD === 'number' ? r.precioD : parseFloat(r.precioD || 0),
      estatusSC: (r.estatus || '').trim(),
      estatusOC: (r.estatusOC || '').trim(),
      motivo: (r.motivo || '').trim(),
      tipo: tipo,
      categoria: categoria,
      grupo: (r.grupo || '').trim()
    };

    if (existingMap.has(id)) {
      if (existingMap.get(id).esReclasificado) {
        item.cuentaAuxiliar = existingMap.get(id).cuentaAuxiliar;
        item.esReclasificado = true;
        item.infoReclasificacion = existingMap.get(id).infoReclasificacion;
      }
      existingMap.set(id, item);
      updated++;
    } else {
      existingMap.set(id, item);
      added++;
    }
  }

  store.compras = Array.from(existingMap.values());
  saveStore(store);
  console.log(`[DB] Compras procesadas: ${added} nuevas, ${updated} actualizadas. Total en BD: ${store.compras.length}`);
  return { added, updated, total: store.compras.length };
}

// Reclassify / Correct record (update Cta Auxiliar with full audit trail)
function reclasificar(recordId, nuevaCuenta, motivo = '', usuario = 'Daniela Riveros', nuevoProyectoNombre = '') {
  const store = loadStore();
  const timestamp = new Date().toISOString();

  // Look up item in consumos or compras
  let itemFound = null;
  let tipoItem = 'consumo';
  const consIndex = store.consumos.findIndex(c => c.id === recordId);
  if (consIndex !== -1) {
    itemFound = store.consumos[consIndex];
    tipoItem = 'consumo';
  } else {
    const compIndex = store.compras.findIndex(c => c.id === recordId);
    if (compIndex !== -1) {
      itemFound = store.compras[compIndex];
      tipoItem = 'compra';
    }
  }

  const cuentaAnterior = itemFound ? (itemFound.cuentaAuxiliarOriginal || itemFound.cuentaAuxiliar || 'S/A') : 'S/A';
  const projAnt = store.proyectos.find(p => p.codigo === cuentaAnterior.toUpperCase());
  const proyectoAnterior = projAnt ? projAnt.nombre : cuentaAnterior;

  // Destination project name
  const projDest = store.proyectos.find(p => p.codigo === nuevaCuenta.toUpperCase());
  const finalProyectoNombre = nuevoProyectoNombre || (projDest ? projDest.nombre : nuevaCuenta);

  // If newly created account is not in store.proyectos, register it!
  if (!projDest && nuevaCuenta) {
    store.proyectos.push({
      codigo: nuevaCuenta.toUpperCase(),
      nombre: finalProyectoNombre,
      tipoCosto: 'Directo',
      cliente: 'TIMACA'
    });
  }

  store.reclasificaciones[recordId] = {
    recordId,
    tipoItem,
    documento: itemFound ? (itemFound.numero || itemFound.ordenCompra || itemFound.solicitudCompra || '-') : '-',
    codigo: itemFound ? itemFound.codigo : '',
    descripcion: itemFound ? itemFound.descripcion : '',
    totalUSD: itemFound ? itemFound.totalUSD : 0,
    fechaMovimiento: itemFound ? (itemFound.fecha || itemFound.fechaSolicitud || '') : '',
    cuentaAnterior: cuentaAnterior.toUpperCase(),
    proyectoAnterior: proyectoAnterior,
    nuevaCuenta: nuevaCuenta.toUpperCase(),
    nuevoProyecto: finalProyectoNombre,
    motivo: motivo || 'Corrección de imputación contable',
    fecha: timestamp,
    usuario: usuario
  };

  // Update in consumos
  if (consIndex !== -1) {
    store.consumos[consIndex].cuentaAuxiliar = nuevaCuenta.toUpperCase();
    store.consumos[consIndex].esReclasificado = true;
    store.consumos[consIndex].infoReclasificacion = store.reclasificaciones[recordId];
  }

  // Update in compras
  const compIndex = store.compras.findIndex(c => c.id === recordId);
  if (compIndex !== -1) {
    store.compras[compIndex].cuentaAuxiliar = nuevaCuenta.toUpperCase();
    store.compras[compIndex].esReclasificado = true;
    store.compras[compIndex].infoReclasificacion = store.reclasificaciones[recordId];
  }

  saveStore(store);
  console.log(`[DB] Registro ${recordId} corregido de ${cuentaAnterior} a ${nuevaCuenta}`);
  return store.reclasificaciones[recordId];
}

// Revert correction back to original SIP account
function revertirReclasificacion(recordId) {
  const store = loadStore();
  if (!store.reclasificaciones[recordId]) {
    return false;
  }
  
  delete store.reclasificaciones[recordId];

  const consIndex = store.consumos.findIndex(c => c.id === recordId);
  if (consIndex !== -1) {
    store.consumos[consIndex].cuentaAuxiliar = store.consumos[consIndex].cuentaAuxiliarOriginal || '';
    store.consumos[consIndex].esReclasificado = false;
    delete store.consumos[consIndex].infoReclasificacion;
  }

  const compIndex = store.compras.findIndex(c => c.id === recordId);
  if (compIndex !== -1) {
    store.compras[compIndex].cuentaAuxiliar = store.compras[compIndex].cuentaAuxiliarOriginal || '';
    store.compras[compIndex].esReclasificado = false;
    delete store.compras[compIndex].infoReclasificacion;
  }

  saveStore(store);
  console.log(`[DB] Corrección revertida para registro ${recordId}`);
  return true;
}

// Compute Cost Matrix by Project
function getMatrizCostos() {
  const store = loadStore();
  const proyectosMap = new Map();

  // Seed with all official projects
  for (const p of store.proyectos) {
    proyectosMap.set(p.codigo, {
      codigo: p.codigo,
      nombre: p.nombre,
      tipoCosto: p.tipoCosto,
      cliente: p.cliente,
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

  // Add Consumos
  for (const c of store.consumos) {
    const cta = (c.cuentaAuxiliar || 'SIN-ASIGNAR').toUpperCase();
    if (!proyectosMap.has(cta)) {
      proyectosMap.set(cta, {
        codigo: cta,
        nombre: `Proyecto ${cta}`,
        tipoCosto: 'Por clasificar',
        cliente: 'Varios',
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
    const p = proyectosMap.get(cta);
    p.materialesDirectos += c.totalUSD;
    p.totalUSD += c.totalUSD;
    p.totalItemsConsumos += 1;
  }

  // Add Compras
  for (const comp of store.compras) {
    const cta = (comp.cuentaAuxiliar || 'SIN-ASIGNAR').toUpperCase();
    if (!proyectosMap.has(cta)) {
      proyectosMap.set(cta, {
        codigo: cta,
        nombre: `Proyecto ${cta}`,
        tipoCosto: 'Por clasificar',
        cliente: 'Varios',
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
    const p = proyectosMap.get(cta);
    if (comp.tipo === 'Servicios') {
      p.servicios += comp.totalUSD;
    } else {
      p.materialesDirectos += comp.totalUSD;
    }
    p.totalUSD += comp.totalUSD;
    p.totalItemsCompras += 1;
  }

  // Round values
  const matrix = Array.from(proyectosMap.values())
    .map(p => ({
      ...p,
      materialesDirectos: Math.round(p.materialesDirectos * 100) / 100,
      servicios: Math.round(p.servicios * 100) / 100,
      totalUSD: Math.round(p.totalUSD * 100) / 100
    }))
    .filter(p => p.totalUSD > 0 || p.totalItemsConsumos > 0 || p.totalItemsCompras > 0)
    .sort((a, b) => b.totalUSD - a.totalUSD);

  return matrix;
}

function guardarPrecioManual(codigo, precioManual, motivo = '', usuario = 'Alejandra Tesara') {
  const store = loadStore();
  if (!store.preciosManuales) store.preciosManuales = {};
  const cod = codigo.trim().toUpperCase();
  store.preciosManuales[cod] = {
    precio: Math.round(precioManual * 100) / 100,
    motivo: motivo.trim(),
    fecha: new Date().toLocaleDateString('es-VE'),
    usuario: usuario.trim()
  };
  saveStore(store);
  return store.preciosManuales[cod];
}

function eliminarPrecioManual(codigo) {
  const store = loadStore();
  if (store.preciosManuales) {
    const cod = codigo.trim().toUpperCase();
    delete store.preciosManuales[cod];
    saveStore(store);
  }
}

function getPreciosManuales() {
  const store = loadStore();
  return store.preciosManuales || {};
}

module.exports = {
  loadStore,
  saveStore,
  syncProyectosFromMaster,
  ingestConsumos,
  ingestCompras,
  reclasificar,
  revertirReclasificacion,
  getMatrizCostos,
  guardarPrecioManual,
  eliminarPrecioManual,
  getPreciosManuales
};
