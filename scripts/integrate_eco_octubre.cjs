const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

function run() {
  console.log('=== INTEGRANDO HORAS HOMBRES ECO OCTUBRE EN LA PAGINA WEB ===');

  const ecoExcelPath = 'Y:/Costos Master/3 Inputs/9 Mano de Obra ECO/horas hombres eco octubre.xlsx';
  if (!fs.existsSync(ecoExcelPath)) {
    throw new Error('No se encontró el archivo: ' + ecoExcelPath);
  }

  // 1. Leer archivo Excel
  console.log('1. Leyendo Excel:', ecoExcelPath);
  const wb = xlsx.readFile(ecoExcelPath);
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  const rawRows = xlsx.utils.sheet_to_json(ws, { raw: true });

  console.log(`   Filas leídas del Excel: ${rawRows.length}`);
  if (rawRows.length === 0) throw new Error('El archivo Excel está vacío.');

  // 2. Mapear filas a formato Unificada
  let maxId = 336722;
  const unificadaOctubrePath = path.join(__dirname, '../public/data/sip/unificada_octubre.json');
  const octData = JSON.parse(fs.readFileSync(unificadaOctubrePath, 'utf8'));

  // Encontrar ID máximo existente
  for (const it of octData.items || []) {
    if (typeof it.id === 'number' && it.id > maxId) {
      maxId = it.id;
    }
  }

  // Filtrar posibles items previos de ECO para idempotencia
  const baseItems = (octData.items || []).filter(it => it.tipo !== 'Mano de Obra Directa ECO');
  console.log(`   Items existentes sin ECO: ${baseItems.length}`);

  let totalHoras = 0;
  let totalUSD = 0;
  let nextId = maxId + 1;

  const newEcoItems = rawRows.map((r, idx) => {
    // Manejar fecha
    let fechaStr = '2026-10-31';
    if (r['Fecha']) {
      if (typeof r['Fecha'] === 'number') {
        const d = xlsx.SSF.parse_date_code(r['Fecha']);
        if (d) {
          const y = d.y;
          const m = String(d.m).padStart(2, '0');
          const day = String(d.d).padStart(2, '0');
          fechaStr = `${y}-${m}-${day}`;
        }
      } else {
        const s = String(r['Fecha']).trim();
        if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
          fechaStr = s.substring(0, 10);
        } else if (/^\d{2}\/\d{2}\/\d{4}/.test(s)) {
          const p = s.split('/');
          fechaStr = `${p[2]}-${p[1].padStart(2, '0')}-${p[0].padStart(2, '0')}`;
        }
      }
    }

    const cta = String(r['Cuenta Auxiliar'] || 'EE-A-C-507').trim().toUpperCase();
    const hrs = Number(r['Horas Trabajadas'] || r['Horas de intervención'] || 0);
    const usd = Number(r['Total a Pagar ($)'] || r['Total USD'] || 0);
    const sem = Number(r['Semana'] || 44);
    const trabajador = String(r['Trabajador (unificado)'] || '').trim();
    const motivo = String(r['Motivo'] || r['Comentarios adicionales'] || '').trim();
    const desc = String(r['Datos.Descripcion'] || r['Datos.Descripción'] || '').trim();
    const tipoCosto = String(r['Tipo de Costo'] || r['Datos.tipo de equipo'] || 'Mantto Flota (OPEX)').trim();
    const tipoEquipo = String(r['Tipo de Equipo'] || r['Clasificación del Equipo'] || '').trim();
    const tarifa = Number(r['Costo Hora Hombre'] || (hrs > 0 ? usd / hrs : 0));
    const comp = String(r['Componentes Intervenidos'] || '').trim();
    const area = String(r['ÁREA'] || 'ECO').trim();
    const statusEq = String(r['Status del Equipo'] || '').trim();
    const cod = String(r['Código'] || '').trim();

    totalHoras += hrs;
    totalUSD += usd;

    return {
      id: nextId++,
      tipo: 'Mano de Obra Directa ECO',
      almacen: '',
      fecha: fechaStr,
      numero: '',
      pedido: '',
      cuenta_aux: cta,
      ceco: '',
      codigo: cod,
      descripcion: motivo || desc || 'TRABAJO MANTENIMIENTO ECO',
      cantidad: hrs,
      unidad: 'HORAS',
      solicitante: '',
      motivo: motivo,
      ajuste: '',
      categoria: 'Mano de Obra Directa ECO',
      precio_final: 0,
      precio_dolar: 0,
      total_usd: Math.round(usd * 100) / 100,
      precio_sip_original: 0,
      total_sip_original: Math.round(usd * 100) / 100,
      oc: '',
      motivo_ajuste: '',
      estatus_auditoria: 'APROBADO',
      semana: sem,
      fecha_hasta: '',
      apellidos_nombres: trabajador,
      cargo: 'PERSONAL ECO',
      supervisor: '',
      area_ubicacion: area,
      tarifa: Math.round(tarifa * 10000) / 10000,
      actividad: comp,
      tiempo_total: '',
      equipo: statusEq,
      posesion: '',
      tipo_equipo: tipoEquipo,
      linea_prod_desc: '',
      agrupador_linea: '',
      linea_produccion: '',
      datos_descripcion: desc,
      datos_tipo_costo: tipoCosto,
      datos_tipo_equipo: tipoEquipo,
      datos_codigo_sysman: '',
      datos_zona: '',
      ano: 2026,
      nombre_mes: 'octubre',
      sc: ''
    };
  });

  console.log(`2. Mapeados ${newEcoItems.length} registros ECO:`);
  console.log(`   - Total Horas: ${totalHoras.toLocaleString('es-VE', { minimumFractionDigits: 2 })} hrs`);
  console.log(`   - Total USD: $${totalUSD.toLocaleString('es-VE', { minimumFractionDigits: 2 })} USD`);

  // 3. Consolidar en unificada_octubre.json
  const allOctubreItems = [...baseItems, ...newEcoItems];
  
  let granTotal = 0;
  let matTotal = 0;
  let servTotal = 0;
  let mdoTotal = 0;
  let extTotal = 0;
  let intTotal = 0;
  let opexTotal = 0;
  let admonTotal = 0;
  const cuentasSummary = new Map();

  for (const r of allOctubreItems) {
    const usd = Number(r.total_usd) || 0;
    granTotal += usd;

    if (r.tipo === 'Materiales Directos') matTotal += usd;
    else if (r.tipo === 'Servicios') servTotal += usd;
    else if (r.tipo.includes('Mano de Obra')) mdoTotal += usd;

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
    mdo_total: Math.round(mdoTotal * 100) / 100,
    hm_total: 0,
    ind_total: 0,
    ext_total: Math.round(extTotal * 100) / 100,
    int_total: Math.round(intTotal * 100) / 100,
    opex_total: Math.round(opexTotal * 100) / 100,
    admon_total: Math.round(admonTotal * 100) / 100
  };

  const unificadaPayload = {
    ...octData,
    totales,
    top_cuentas: topCuentas,
    totalItems: allOctubreItems.length,
    granTotal: totales.gran_total,
    page: 1,
    limit: allOctubreItems.length,
    items: allOctubreItems
  };

  fs.writeFileSync(unificadaOctubrePath, JSON.stringify(unificadaPayload), 'utf8');
  console.log(`3. Guardado unificada_octubre.json (${(fs.statSync(unificadaOctubrePath).size / 1024 / 1024).toFixed(2)} MB)`);

  // 4. Actualizar public/data/sip/matriz.json
  const matrizPath = path.join(__dirname, '../public/data/sip/matriz.json');
  if (fs.existsSync(matrizPath)) {
    const matriz = JSON.parse(fs.readFileSync(matrizPath, 'utf8'));
    const projMap = new Map();
    for (const p of matriz.proyectos || []) {
      projMap.set(p.codigo.toUpperCase(), p);
    }

    for (const it of newEcoItems) {
      const cta = it.cuenta_aux.toUpperCase();
      if (!projMap.has(cta)) {
        const nuevo = {
          codigo: cta,
          nombre: it.datos_descripcion || cta,
          tipoCosto: it.datos_tipo_costo || 'Mantto Flota (OPEX)',
          cliente: 'TIMACA',
          materialesDirectos: 0,
          servicios: 0,
          manoDeObra: 0,
          horasMaquina: 0,
          costosIndirectos: 0,
          totalUSD: 0,
          totalItemsConsumos: 0,
          totalItemsCompras: 0
        };
        projMap.set(cta, nuevo);
        matriz.proyectos.push(nuevo);
      }
      const p = projMap.get(cta);
      p.manoDeObra = Math.round(((p.manoDeObra || 0) + it.total_usd) * 100) / 100;
      p.totalUSD = Math.round(((p.totalUSD || 0) + it.total_usd) * 100) / 100;
    }

    matriz.granTotal = Math.round(((matriz.granTotal || 0) + totalUSD) * 100) / 100;
    matriz.totalManoDeObra = Math.round(totalUSD * 100) / 100;
    matriz.proyectos.sort((a, b) => b.totalUSD - a.totalUSD);

    fs.writeFileSync(matrizPath, JSON.stringify(matriz, null, 2), 'utf8');
    console.log(`4. Guardado matriz.json con Mano de Obra ECO actualizada.`);
  }

  // 5. Actualizar public/data/sip/archivos_cargas.json
  const cargasPath = path.join(__dirname, '../public/data/sip/archivos_cargas.json');
  if (fs.existsSync(cargasPath)) {
    const cargas = JSON.parse(fs.readFileSync(cargasPath, 'utf8'));
    cargas.mdo = cargas.mdo || [];

    // Verificar si ya existe
    const exists = cargas.mdo.some(f => f.nombre === 'horas hombres eco octubre.xlsx');
    if (!exists) {
      cargas.mdo.unshift({
        nombre: 'horas hombres eco octubre.xlsx',
        categoria: 'Mano de Obra',
        carpeta: '3 Inputs\\9 Mano de Obra ECO',
        tamanoKB: Math.round(fs.statSync(ecoExcelPath).size / 1024),
        fechaMod: '2026-11-05',
        estado: 'Carga Mensual Activa'
      });
      console.log('5. Agregado horas hombres eco octubre.xlsx a archivos_cargas.json');
    }
    fs.writeFileSync(cargasPath, JSON.stringify(cargas, null, 2), 'utf8');
  }

  // 6. Copiar archivo a public/data/rrhh/ para acceso web
  const rrhhDest = path.join(__dirname, '../public/data/rrhh/horas hombres eco octubre.xlsx');
  fs.copyFileSync(ecoExcelPath, rrhhDest);
  console.log(`6. Copiado archivo Excel a ${rrhhDest}`);

  console.log('=== INTEGRACION COMPLETADA EXITOSAMENTE ===');
}

run();
