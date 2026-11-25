const fs = require('fs');
const path = require('path');
const http = require('http');

function postJson(urlStr, data) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const postData = JSON.stringify(data);
    const req = http.request({
      hostname: url.hostname,
      port: url.port || 80,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Host': url.hostname
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        const cookie = (res.headers['set-cookie'] || [])[0];
        resolve({ statusCode: res.statusCode, body, cookie });
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function getJson(urlStr, cookie) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const req = http.request({
      hostname: url.hostname,
      port: url.port || 80,
      path: url.pathname + url.search,
      method: 'GET',
      headers: {
        'Host': url.hostname,
        'Cookie': (cookie || '').split(';')[0]
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(new Error('Failed to parse JSON: ' + e.message));
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function parseDateToIso(dStr) {
  if (!dStr) return '';
  const str = dStr.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  const parts = str.split('/');
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[2].length === 2 ? '20' + parts[2] : parts[2];
    return year + '-' + month + '-' + day;
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

function classifyArticle(cod, desc, catMap) {
  if (catMap && catMap.has(cod)) return catMap.get(cod);
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
        if (vCode.startsWith('BS')) return 'EEA-C-' + vCode;
        if (vCode.startsWith('VH')) return 'EEE-C-' + vCode;
        if (vCode.startsWith('GR')) return 'EEI-C-' + vCode;
        if (vCode.startsWith('CH')) return 'EEM-C-' + vCode;
        if (vCode.startsWith('CA')) return 'EEM-C-' + vCode;
        if (vCode.startsWith('RM')) return 'EEM-C-' + vCode;
        if (vCode.startsWith('TR')) return 'EEE-C-' + vCode;
        if (vCode.startsWith('MC')) return 'EEE-C-' + vCode;
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

async function main() {
  console.log('=== SINCRONIZACIÓN OFICIAL SIP: COMPRAS DE PROCURA ===');
  
  const loginRes = await postJson('http://sip.timaca.com/api/acceso/entrar', {
    login: 'drivero',
    clave: '070717'
  });
  if (!loginRes.cookie) {
    throw new Error('No se pudo autenticar en SIP');
  }
  const cookie = loginRes.cookie;
  console.log('[SIP] Conectado exitosamente como drivero.');

  const basePath = path.resolve(__dirname, '..');
  const proyectosPath = path.join(basePath, 'public/data/sip/proyectos.json');
  let proyectos = [];
  if (fs.existsSync(proyectosPath)) {
    try { proyectos = JSON.parse(fs.readFileSync(proyectosPath, 'utf8')); } catch (e) {}
  }
  const projMap = new Map();
  for (const p of proyectos) {
    if (p.codigo) projMap.set(p.codigo.toUpperCase().trim(), p);
  }

  const catMap = new Map();
  for (const f of ['unificada_octubre.json', 'unificada_septiembre.json', 'unificada_agosto.json']) {
    const p = path.join(basePath, 'public/data/sip', f);
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

  const months = [
    { key: 'octubre', name: 'Octubre', desde: '2026-10-01', hasta: '2026-10-31', baseId: 350000 },
    { key: 'noviembre', name: 'Noviembre', desde: '2026-11-01', hasta: '2026-11-25', baseId: 460000 },
    { key: 'septiembre', name: 'Septiembre', desde: '2026-09-01', hasta: '2026-09-30', baseId: 250000 },
    { key: 'agosto', name: 'Agosto', desde: '2026-08-01', hasta: '2026-08-31', baseId: 150000 }
  ];

  const allComprasCatalog = [];

  for (const m of months) {
    console.log('\n----------------------------------------------------');
    console.log('Procesando mes: ' + m.name + ' (' + m.desde + ' al ' + m.hasta + ')');
    
    const scUrl = 'http://sip.timaca.com/api/solicitud-compras?desde=' + m.desde + '&hasta=' + m.hasta;
    const rawList = await getJson(scUrl, cookie);
    console.log('[SIP] Registros brutos SC: ' + rawList.length);

    const withOC = rawList.filter(r => r.ordenCompra);
    console.log('[SIP] Con Orden de Compra (OC): ' + withOC.length);

    const matsSinRC = withOC.filter(r => {
      const isServ = r.categoria === 'SERVICIOS' || String(r.material || '').toUpperCase().startsWith('SE');
      const hasRC = Boolean(r.recepcion || r.rc) || Number(r.cantidadRecepcionada || 0) > 0;
      return !isServ && !hasRC;
    });

    const servsSinFiniquito = withOC.filter(r => {
      const isServ = r.categoria === 'SERVICIOS' || String(r.material || '').toUpperCase().startsWith('SE');
      const hasRC = Boolean(r.recepcion || r.rc) || Number(r.cantidadRecepcionada || 0) > 0;
      return isServ && !hasRC;
    });

    const servsConFiniquito = withOC.filter(r => {
      const isServ = r.categoria === 'SERVICIOS' || String(r.material || '').toUpperCase().startsWith('SE');
      const hasRC = Boolean(r.recepcion || r.rc) || Number(r.cantidadRecepcionada || 0) > 0;
      return isServ && hasRC;
    });

    console.log('[SIP] -> Materiales con OC sin RC: ' + matsSinRC.length);
    console.log('[SIP] -> Servicios con OC sin Finiquito: ' + servsSinFiniquito.length);
    console.log('[SIP] -> Servicios con Finiquito (Ejecutados): ' + servsConFiniquito.length);
    console.log('[SIP] -> TOTAL PENDIENTES AUDITORÍA PROCURA: ' + (matsSinRC.length + servsSinFiniquito.length));

    const allServiciosSip = [...servsSinFiniquito, ...servsConFiniquito];
    let servSeqId = m.baseId + 10000;
    const mappedServicios = allServiciosSip.map(r => {
      servSeqId++;
      const sc = (r.solicitud || r.SC || '').trim();
      const oc = (r.ordenCompra || r.OC || '').trim();
      const cod = (r.material || r.codigo || '').trim();
      const ctaAux = resolverCuentaAuxiliar(r.cuenta, r.motivo, r.descripcion, r.creadaPor || r.solicitante, cod);
      const proj = projMap.get(ctaAux) || { nombre: r.descripcionCuenta || ctaAux, tipoCosto: 'Externo' };
      const cant = typeof r.cantidadOC === 'number' ? r.cantidadOC : (typeof r.cantidad === 'number' ? r.cantidad : parseFloat(r.cantidadOC || r.cantidad || 1));
      const totalUSD = typeof r.totalDolar === 'number' ? r.totalDolar : (typeof r.total === 'number' ? r.total : parseFloat(r.totalDolar || r.total || 0));
      const precioUnitUSD = cant > 0 ? Math.round((totalUSD / cant) * 100) / 100 : (Number(r.precioDolar) || 0);

      const recepcionVal = (r.recepcion || r.rc || '').trim();

      return {
        id: servSeqId,
        tipo: 'Servicios',
        almacen: (r.almacen || 'ALMSE').trim(),
        fecha: parseDateToIso(r.fechaSolicitud || r.fechaOC || r.fecha),
        numero: sc || oc,
        pedido: oc || sc,
        cuenta_aux: ctaAux,
        ceco: (r.ceco || '').trim(),
        codigo: cod,
        descripcion: (r.descripcion || '').trim(),
        cantidad: cant,
        unidad: (r.unidad || 'USE').trim(),
        solicitante: cleanPersonName(r.creadaPor || r.solicitante || 'S/D'),
        proveedor: (r.proveedor || r.nombreProveedor || '').trim(),
        motivo: (r.motivo || '').trim(),
        recepcion: recepcionVal,
        rc: recepcionVal,
        fechaRecepcion: (r.fechaRecepcion || '').trim(),
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
        nombre_mes: m.key,
        sc: sc,
        oc: oc,
        comprador: cleanPersonName(r.comprador || ''),
        creadaPor: cleanPersonName(r.creadaPor || r.solicitante || '')
      };
    });

    let matSeqId = m.baseId + 20000;
    const mappedCompras = matsSinRC.map(r => {
      matSeqId++;
      const sc = (r.solicitud || r.SC || '').trim();
      const oc = (r.ordenCompra || r.OC || '').trim();
      const cod = (r.material || r.codigo || '').trim();
      const desc = (r.descripcion || '').trim();
      const ctaAux = resolverCuentaAuxiliar(r.cuenta, r.motivo, desc, r.creadaPor || r.solicitante, cod);
      const proj = projMap.get(ctaAux) || { nombre: r.descripcionCuenta || ctaAux, tipoCosto: 'Externo' };
      const cant = typeof r.cantidadOC === 'number' ? r.cantidadOC : (typeof r.cantidad === 'number' ? r.cantidad : parseFloat(r.cantidadOC || r.cantidad || 1));
      const totalUSD = typeof r.totalDolar === 'number' ? r.totalDolar : (typeof r.total === 'number' ? r.total : parseFloat(r.totalDolar || r.total || 0));
      const precioUnitUSD = cant > 0 ? Math.round((totalUSD / cant) * 100) / 100 : (Number(r.precioDolar) || 0);

      const catArt = classifyArticle(cod, desc, catMap);

      return {
        id: matSeqId,
        tipo: 'Compras',
        almacen: (r.almacen || 'ALMCE').trim(),
        fecha: parseDateToIso(r.fechaSolicitud || r.fechaOC || r.fecha),
        numero: sc || oc,
        pedido: oc || sc,
        cuenta_aux: ctaAux,
        ceco: (r.ceco || '').trim(),
        codigo: cod,
        descripcion: desc,
        cantidad: cant,
        unidad: (r.unidad || 'UND').trim(),
        solicitante: cleanPersonName(r.creadaPor || r.solicitante || 'S/D'),
        proveedor: (r.proveedor || r.nombreProveedor || '').trim(),
        motivo: (r.motivo || '').trim(),
        recepcion: '',
        rc: '',
        fechaRecepcion: '',
        ajuste: '',
        categoria: catArt,
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
        nombre_mes: m.key,
        sc: sc,
        oc: oc,
        comprador: cleanPersonName(r.comprador || ''),
        creadaPor: cleanPersonName(r.creadaPor || r.solicitante || '')
      };
    });

    for (const s of mappedServicios) {
      allComprasCatalog.push({
        id: s.id,
        almacen: s.almacen,
        solicitudCompra: s.sc,
        ordenCompra: s.oc,
        fechaSolicitud: s.fecha,
        fechaOC: s.fecha,
        nombre_mes: m.key,
        codigo: s.codigo,
        descripcion: s.descripcion,
        motivo: s.motivo,
        categoria: 'SERVICIOS',
        cantidadSolicitada: s.cantidad,
        cantidadOC: s.cantidad,
        cantidadRecepcionada: s.recepcion ? s.cantidad : 0,
        unidad: s.unidad,
        cuentaAuxiliar: s.cuenta_aux,
        proveedor: s.proveedor,
        comprador: s.comprador,
        solicitante: s.solicitante,
        precioUnitario: s.precio_final,
        totalUSD: s.total_usd,
        tipo: 'Servicios',
        recepcion: s.recepcion,
        rc: s.rc,
        esReclasificado: false
      });
    }

    for (const c of mappedCompras) {
      allComprasCatalog.push({
        id: c.id,
        almacen: c.almacen,
        solicitudCompra: c.sc,
        ordenCompra: c.oc,
        fechaSolicitud: c.fecha,
        fechaOC: c.fecha,
        nombre_mes: m.key,
        codigo: c.codigo,
        descripcion: c.descripcion,
        motivo: c.motivo,
        categoria: c.categoria,
        cantidadSolicitada: c.cantidad,
        cantidadOC: c.cantidad,
        cantidadRecepcionada: 0,
        unidad: c.unidad,
        cuentaAuxiliar: c.cuenta_aux,
        proveedor: c.proveedor,
        comprador: c.comprador,
        solicitante: c.solicitante,
        precioUnitario: c.precio_final,
        totalUSD: c.total_usd,
        tipo: 'Compras / Materiales',
        recepcion: '',
        rc: '',
        esReclasificado: false
      });
    }

    const unificadaPath = path.join(basePath, 'public/data/sip', 'unificada_' + m.key + '.json');
    if (fs.existsSync(unificadaPath)) {
      const origData = JSON.parse(fs.readFileSync(unificadaPath, 'utf8'));
      const origItems = origData.items || [];
      
      const baseItems = origItems.filter(r => r.tipo !== 'Compras' && r.tipo !== 'Servicios');
      const newItems = [...baseItems, ...mappedServicios, ...mappedCompras];

      newItems.sort((a, b) => {
        const ta = new Date(a.fecha).getTime() || 0;
        const tb = new Date(b.fecha).getTime() || 0;
        if (ta !== tb) return tb - ta;
        return String(b.numero || '').localeCompare(String(a.numero || ''));
      });

      let granTotal = 0;
      let matTotal = 0;
      let servTotal = 0;
      let mdoTotal = 0;
      let extTotal = 0;
      let intTotal = 0;
      let opexTotal = 0;
      let admonTotal = 0;
      let sinRcCount = 0;
      let sinRcTotal = 0;
      let conRcCount = 0;
      let conRcTotal = 0;

      const isCandidateRC = (r) => {
        const t = String(r.tipo || '').toUpperCase();
        const p = String(r.pedido || '').toUpperCase();
        const num = String(r.numero || '').toUpperCase();
        const alm = String(r.almacen || '').toUpperCase();
        if (p.startsWith('PA') || num.startsWith('DP')) return false;
        return t.includes('SERV') || t.includes('COMP') || p.startsWith('OC') || num.startsWith('SC') || alm === 'ALMSE';
      };

      const cuentasMap = new Map();

      for (const r of newItems) {
        const val = Number(r.total_usd) || 0;
        granTotal += val;

        const t = (r.tipo || '').toUpperCase();
        if (t === 'MATERIALES DIRECTOS' || t === 'COMPRAS') matTotal += val;
        else if (t === 'SERVICIOS') servTotal += val;
        else if (t.includes('MANO DE OBRA')) mdoTotal += val;

        const tc = (r.datos_tipo_costo || '').toLowerCase();
        if (tc.includes('externo')) extTotal += val;
        else if (tc.includes('interno') || tc.includes('transferencia')) intTotal += val;
        else if (tc.includes('opex') || tc.includes('flota') || tc.includes('infra')) opexTotal += val;
        else if (tc.includes('admon') || tc.includes('socio') || tc.includes('representac')) admonTotal += val;
        else extTotal += val;

        const hasRC = Boolean(r.recepcion || r.rc);
        if (hasRC) {
          conRcCount++;
          conRcTotal += val;
        } else if (isCandidateRC(r)) {
          sinRcCount++;
          sinRcTotal += val;
        }

        const cta = r.cuenta_aux || 'SIN-ASIGNAR';
        if (!cuentasMap.has(cta)) {
          cuentasMap.set(cta, {
            cuenta_aux: cta,
            datos_descripcion: r.datos_descripcion || cta,
            datos_tipo_costo: r.datos_tipo_costo || 'Externo',
            total: 0,
            rows: 0
          });
        }
        const acc = cuentasMap.get(cta);
        acc.total += val;
        acc.rows += 1;
      }

      const topCuentas = Array.from(cuentasMap.values())
        .map(c => ({ ...c, total: Math.round(c.total * 100) / 100 }))
        .sort((a, b) => b.total - a.total);

      const updatedData = {
        ...origData,
        totalItems: newItems.length,
        totalMateriales: Math.round(matTotal * 100) / 100,
        totalServicios: Math.round(servTotal * 100) / 100,
        granTotal: Math.round(granTotal * 100) / 100,
        fecha_actualizacion: new Date().toISOString(),
        version_cache: Date.now().toString(),
        items: newItems,
        totales: {
          total_count: newItems.length,
          gran_total: Math.round(granTotal * 100) / 100,
          mat_total: Math.round(matTotal * 100) / 100,
          serv_total: Math.round(servTotal * 100) / 100,
          mdo_total: Math.round(mdoTotal * 100) / 100,
          hm_total: 0,
          ind_total: 0,
          ext_total: Math.round(extTotal * 100) / 100,
          int_total: Math.round(intTotal * 100) / 100,
          opex_total: Math.round(opexTotal * 100) / 100,
          admon_total: Math.round(admonTotal * 100) / 100,
          sin_rc_count: sinRcCount,
          sin_rc_total: Math.round(sinRcTotal * 100) / 100,
          con_rc_count: conRcCount,
          con_rc_total: Math.round(conRcTotal * 100) / 100
        },
        top_cuentas: topCuentas
      };

      const targets = [
        path.join(basePath, 'public/data/sip', 'unificada_' + m.key + '.json'),
        path.join(basePath, 'dist/data/sip', 'unificada_' + m.key + '.json'),
        path.join(basePath, '../timaca-costos/public/data/sip', 'unificada_' + m.key + '.json'),
        path.join(basePath, '../timaca-costos/dist/data/sip', 'unificada_' + m.key + '.json')
      ];

      for (const t of targets) {
        const dir = path.dirname(t);
        if (fs.existsSync(dir)) {
          fs.writeFileSync(t, JSON.stringify(updatedData, null, 2), 'utf8');
        }
      }

      console.log('[OK] ' + m.name + ' sincronizado: ' + newItems.length + ' filas | Sin RC: ' + sinRcCount + ' ($' + sinRcTotal.toLocaleString() + ') | Con RC: ' + conRcCount);
    }
  }

  console.log('\nActualizando compras.json con ' + allComprasCatalog.length + ' partidas de Procura...');
  const comprasTargets = [
    path.join(basePath, 'public/data/sip/compras.json'),
    path.join(basePath, 'dist/data/sip/compras.json'),
    path.join(basePath, '../timaca-costos/public/data/sip/compras.json'),
    path.join(basePath, '../timaca-costos/dist/data/sip/compras.json')
  ];

  for (const t of comprasTargets) {
    const dir = path.dirname(t);
    if (fs.existsSync(dir)) {
      fs.writeFileSync(t, JSON.stringify(allComprasCatalog, null, 2), 'utf8');
    }
  }
  console.log('[OK] compras.json guardado exitosamente.');
  console.log('\n=== SINCRONIZACIÓN EXITOSA ===\n');
}

main().catch(err => {
  console.error('[ERROR]', err);
  process.exit(1);
});
