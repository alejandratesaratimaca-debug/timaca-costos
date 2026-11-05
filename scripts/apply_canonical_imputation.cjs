const fs = require('fs');
const path = require('path');

const proyectos = JSON.parse(fs.readFileSync(path.join(__dirname, '../public/data/sip/proyectos.json'), 'utf8'));
const projMap = new Map();
for (const p of proyectos) {
  projMap.set(p.codigo.toUpperCase(), p);
}

function resolverCuentaAuxiliar(rawCta, motivo, desc, solicitante, codigoMat) {
  const c = (rawCta || '').trim().toUpperCase();
  const m = (motivo || '').toUpperCase();
  const d = (desc || '').toUpperCase();
  const sol = (solicitante || '').toUpperCase();

  // 1. If it's already a valid code (like TT-A-C-505, TTE-C-0706, etc.), keep it
  if (/^[A-Z]{2,4}-[A-Z0-9]+-[A-Z0-9]+/i.test(c)) {
    return c;
  }

  // 2. Check if the motif mentions an explicit project code or project name
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

  // 3. Map based on account name
  switch (c) {
    case 'FABRICACIÓN':
    case 'FABRICACION':
      return 'TT-A-C-505';

    case 'OPERACIONES':
      if (sol.includes('ALBERT') || m.includes('VALENCIA') || m.includes('METAL Y ACERO') || m.includes('FABRICAC')) {
        return 'TT-A-C-505';
      }
      return 'TT-A-C-500'; // Gerencia de Operaciones

    case 'ADMINISTRATIVO':
    case 'ADMINISTRACION':
      if (m.includes('REPUESTOS ECO')) return 'EE-A-C-511';
      return 'TT-A-C-200'; // Gerencia de Administración

    case 'GENERAL (GERENTE, ASISTENTE)':
    case 'GENERAL':
    case 'CUENTA SOCIO':
      return 'TT-A-C-100'; // Gerencia General

    case 'RECURSOS HUMANOS':
    case 'RRHH':
      if (m.includes('EPP')) return 'TT-A-C-601'; // Seguridad y Salud Laboral
      return 'TT-A-C-600'; // Gerencia de Recursos Humanos

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
      return 'EE-A-C-507'; // Sección Operación Equipos Móviles

    case 'PLANIFICACIÓN':
    case 'PLANIFICACION':
      return 'TT-A-C-400'; // Gerencia de Planificación

    case 'PELLAS':
    case 'PELLAS 1':
      return 'TTE-C-0706'; // Planta de Pellas Línea 1

    case 'PMH':
      return 'TTE-C-0671'; // Segunda Línea PMH

    case 'BRIQUETAS':
      return 'TTE-C-0683'; // Fase 3 Planta de Briquetas

    case 'BOCA GRANDE':
      return 'TTE-C-0655'; // Embarcación Boca Grande

    case 'SMB':
      return 'TSI-T-0100'; // Taller SMB

    case 'IMPSA':
      return 'TTE-C-0652'; // IMPSA

    case 'VISCO ORINOCO, C.A.':
    case 'VISCO ORINOCO':
      return 'TTE-C-0671';

    case 'TIMACA':
      if (m.includes('BAÑOS') || m.includes('PORTATILES') || m.includes('ALMACEN') || d.includes('IMPORTACION')) {
        return 'TT-A-C-203'; // Sección de Almacén
      }
      return 'TT-I-C-033'; // Adecuaciones Planta Timaca

    default:
      return c || 'SIN-ASIGNAR';
  }
}

function processFile(relPath) {
  const filePath = path.join(__dirname, '..', relPath);
  if (!fs.existsSync(filePath)) return;
  console.log(`\nProcesando ${relPath}...`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let changed = 0;

  for (const item of data.items) {
    const orig = item.cuenta_aux;
    const resolved = resolverCuentaAuxiliar(orig, item.motivo, item.descripcion, item.solicitante, item.codigo);

    if (resolved !== orig) {
      changed++;
      item.cuenta_aux = resolved;
      const proj = projMap.get(resolved);
      if (proj) {
        item.datos_descripcion = proj.nombre;
        item.datos_tipo_costo = proj.tipoCosto;
      }
    }
  }

  // Recalculate top_cuentas and totales
  let granTotal = 0;
  let matTotal = 0;
  let servTotal = 0;
  let extTotal = 0;
  let intTotal = 0;
  let opexTotal = 0;
  let admonTotal = 0;

  const cuentasSummary = new Map();

  for (const r of data.items) {
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

  data.totales = {
    total_count: data.items.length,
    gran_total: Math.round(granTotal * 100) / 100,
    mat_total: Math.round(matTotal * 100) / 100,
    serv_total: Math.round(servTotal * 100) / 100,
    mdo_total: data.totales?.mdo_total || 0,
    hm_total: data.totales?.hm_total || 0,
    ind_total: data.totales?.ind_total || 0,
    ext_total: Math.round(extTotal * 100) / 100,
    int_total: Math.round(intTotal * 100) / 100,
    opex_total: Math.round(opexTotal * 100) / 100,
    admon_total: Math.round(admonTotal * 100) / 100
  };

  data.top_cuentas = topCuentas.slice(0, 10);

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`[OK] ${relPath} actualizado: ${changed} filas normalizadas a código de cuenta auxiliar.`);

  // Also write to dist/ if present
  const distPath = filePath.replace('public\\', 'dist\\').replace('public/', 'dist/');
  if (fs.existsSync(path.dirname(distPath))) {
    fs.writeFileSync(distPath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`[OK] ${distPath} actualizado.`);
  }
}

processFile('public/data/sip/unificada_octubre.json');
processFile('public/data/sip/unificada_noviembre.json');
console.log('\nSincronización de imputaciones completada.');
