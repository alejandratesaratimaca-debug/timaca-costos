import fs from 'fs';

const original = fs.readFileSync('src/data/mockCostosTimaca.ts', 'utf8');
const lines = original.split(/\r?\n/);
const header = lines.slice(0, 366).join('\n');

const newFunction = `// Generador de base de datos con líneas de auditoría SIP y recepción correcta de nómina
export function generateInitialMockCostos(): SalidaCosto[] {
  const salidas: SalidaCosto[] = [];
  let idCounter = 1;

  // Catálogo de ítems físicos reales del SIP para que la auditoría línea por línea sea verídica
  const CATALOGO_SIP_MATERIALES = [
    { desc: 'Plancha Acero Estructural ASTM A36 12mm x 2400 x 6000mm', subcat: 'Chapas / Planchas', um: 'plancha', pUnit: 1420.00, resp: 'Almacén Central SIP - Roberto Benítez' },
    { desc: 'Electrodo Soldadura Lincoln Excalibur E7018 1/8" (Caja 20kg)', subcat: 'Consumibles de Soldadura', um: 'caja', pUnit: 92.00, resp: 'Almacén Central SIP - Pedro Infante' },
    { desc: 'Viga Estructural IPE 300 x 12 metros Acero Estructural', subcat: 'Perfiles / Estructura', um: 'barra', pUnit: 890.00, resp: 'Almacén de Perfiles SIP' },
    { desc: 'Rodamiento de rodillos esféricos SKF 22220 EK/C3', subcat: 'Repuestos Mecánicos', um: 'und', pUnit: 640.00, resp: 'Almacén de Repuestos Mecánicos SIP' },
    { desc: 'Pintura Epóxica Poliamida Anticorrosiva Gris (Cuñete 5 Gal)', subcat: 'Pinturas y Recubrimientos', um: 'cuñete', pUnit: 185.00, resp: 'Almacén Central SIP' },
    { desc: 'Tubería Acero Carbón Sin Costura ASTM A106 Gr. B 6" Sch 40', subcat: 'Tuberías y Accesorios', um: 'tubo', pUnit: 430.00, resp: 'Almacén de Tuberías SIP' },
    { desc: 'Pernos Hexagonales ASTM A325 3/4" x 3" con tuerca 2H', subcat: 'Pernos / Fijaciones', um: 'und', pUnit: 3.75, resp: 'Almacén de Pernos SIP' },
    { desc: 'Plancha Antidesgaste Hardox 400 1/2" x 1500 x 3000mm', subcat: 'Chapas / Planchas', um: 'plancha', pUnit: 1980.00, resp: 'Almacén Central SIP' }
  ];

  const CATALOGO_SERVICIOS = [
    { desc: 'Servicio de Supervisión Técnica e Inspección Residente de Obra', um: 'semana', pUnit: 850.00, resp: 'Gerencia de Operaciones', subcat: 'Supervisión e Inspección Técnica' },
    { desc: 'Servicio de Ensayo No Destructivo Radiografía Industrial (Gammagrafía)', um: 'servicio', pUnit: 1920.00, resp: 'QA/QC Inspección - Elena Salazar', subcat: 'Ensayos No Destructivos (END)' },
    { desc: 'Servicio Especializado de Recarga de Gases Industriales: Gas Argón 99.99% TIG', um: 'cilindro', pUnit: 65.00, resp: 'Almacén Central SIP', subcat: 'Gases Industriales / Recargas' },
    { desc: 'Servicio de Torno Pesado Schiess Maquinado de Corona Dentada', um: 'servicio', pUnit: 4850.00, resp: 'Jefatura de Taller - Javier Narváez', subcat: 'Maquinado Externo' },
    { desc: 'Servicio de Transporte Pesado Cama Baja Lowboy Planta-FMO', um: 'viaje', pUnit: 1250.00, resp: 'Logística & Fletes TIMACA', subcat: 'Transporte / Flete' },
    { desc: 'Servicio de Arenado Sandblasting SSPC-SP10 Estructura Metálica', um: 'lote', pUnit: 2100.00, resp: 'Taller de Pintura TIMACA', subcat: 'Tratamiento Superficial' },
    { desc: 'Calificación de Procedimiento de Soldadura WPS/PQR según ASME IX', um: 'informe', pUnit: 1450.00, resp: 'QA/QC Inspección - Elena Salazar', subcat: 'Supervisión e Inspección Técnica' }
  ];

  const CATALOGO_HORAS_MAQUINA = [
    { desc: 'Operación Torno Vertical Schiess (Maquinado de Pista de Rodadura)', um: 'horas', pUnit: 180.00, resp: 'Coordinación Horas Máquina - Andrés Morales' },
    { desc: 'Servicio de Grúa Telescópica Liebherr 80 Ton en Izamiento de Tolva', um: 'horas', pUnit: 240.00, resp: 'Coordinación Horas Máquina - Andrés Morales' },
    { desc: 'Operación Mandrinadora CNC Horas Operativas de Mecanizado', um: 'horas', pUnit: 160.00, resp: 'Jefatura de Taller - Javier Narváez' },
    { desc: 'Prensa Hidráulica 500T Conformado de Planchas y Virolas', um: 'horas', pUnit: 135.00, resp: 'Jefatura de Taller - Javier Narváez' }
  ];

  const CATALOGO_INDIRECTOS = [
    { desc: 'Consumibles de Taller: Discos de Corte Tyrolit 7" x 1/8" (Paq. 50 und)', um: 'paquete', pUnit: 210.00, resp: 'Almacén de Consumibles SIP', subcat: 'Consumibles de Taller' },
    { desc: 'Dotación EPP Cuadrillas de Obra (Caretas, Guantes de Carnaza, Botas)', um: 'kit', pUnit: 120.00, resp: 'Seguridad Industrial - Nelson Guédez', subcat: 'Seguridad Industrial (SIAHO)' },
    { desc: 'Materiales Auxiliares de Montaje: Lijas, Cepillos Circulares y Solventes', um: 'lote', pUnit: 175.00, resp: 'Almacén Central SIP', subcat: 'Consumibles de Taller' },
    { desc: 'Soporte Logístico y Mantenimiento Menor de Instalaciones de Campamento', um: 'lote', pUnit: 420.00, resp: 'Servicios Generales TIMACA', subcat: 'Facilidades de Obra' },
    { desc: 'Materiales Auxiliares y Consumibles Operativos de Taller', um: 'lote', pUnit: 140.00, resp: 'Almacén Central SIP', subcat: 'Consumibles Operativos' }
  ];

  // Helper para generar salidas desagregadas y realistas con estricta consistencia aritmética
  function splitIntoOperationalSalidas(params: {
    proyectoCodigo: string;
    proyectoNombre: string;
    proyectoCorto: string;
    categoria: string;
    montoTotal: number;
    mesNum: number;
    mesLabel: string;
    mm: string;
    semanas: number[];
    pIdx: number;
    idStart: number;
  }): SalidaCosto[] {
    const {
      proyectoCodigo,
      proyectoNombre,
      proyectoCorto,
      categoria,
      montoTotal,
      mesNum,
      mesLabel,
      mm,
      semanas,
      pIdx,
      idStart
    } = params;

    const result: SalidaCosto[] = [];
    if (montoTotal <= 0) return result;

    let numPieces = 1;
    if (categoria === 'Mano de Obra Directa') {
      numPieces = montoTotal > 12000 ? Math.min(4, semanas.length) : (montoTotal > 4000 ? 2 : 1);
    } else if (categoria === 'Materiales Directos') {
      numPieces = montoTotal > 30000 ? 4 : (montoTotal > 8000 ? 3 : (montoTotal > 2000 ? 2 : 1));
    } else if (categoria === 'Costos Indirectos') {
      numPieces = montoTotal > 35000 ? 3 : (montoTotal > 5000 ? 2 : 1);
    } else {
      numPieces = montoTotal > 15000 ? 3 : (montoTotal > 3000 ? 2 : 1);
    }

    let acumulado = 0;
    for (let i = 0; i < numPieces; i++) {
      const isLast = (i === numPieces - 1);
      const montoPieza = isLast
        ? Math.round((montoTotal - acumulado) * 100) / 100
        : Math.round((montoTotal / numPieces) * 100) / 100;
      
      acumulado += montoPieza;
      if (montoPieza <= 0) continue;

      const sem = semanas[i % semanas.length];
      const diaNum = Math.min(28, 2 + ((pIdx * 5 + i * 7) % 26));
      const dia = String(diaNum).padStart(2, '0');
      const fecha = \`2026-\${mm}-\${dia}\`;

      let itemDesc = '';
      let subcat = 'General';
      let um = 'lote';
      let cant = 1;
      let pUnit = montoPieza;
      let resp = 'Almacén Central SIP';
      let solicitante = \`Ing. Residente \${proyectoCorto}\`;
      let motivo = \`Ejecución operativa en obra \${mesLabel} (\${proyectoCorto})\`;
      let codigoSalida = \`SAL-2026-M\${mm}-\${proyectoCodigo.replace('TTE-C-', '')}-\${i+1}\`;

      if (categoria === 'Materiales Directos') {
        const mat = CATALOGO_SIP_MATERIALES[(pIdx + i) % CATALOGO_SIP_MATERIALES.length];
        subcat = mat.subcat;
        resp = mat.resp;
        itemDesc = \`\${mat.desc} (\${proyectoCorto})\`;
        motivo = \`Suministro de materiales para montaje y estructura (\${proyectoCorto})\`;
        codigoSalida = \`SIP-DESP-M\${mm}-\${proyectoCodigo.replace('TTE-C-', '')}-\${i+1}\`;

        if (montoPieza >= mat.pUnit * 0.7) {
          cant = Math.max(1, Math.round(montoPieza / mat.pUnit));
          pUnit = Math.round((montoPieza / cant) * 100) / 100;
          um = mat.um;
        } else {
          um = 'lote';
          cant = 1;
          pUnit = montoPieza;
        }
      } else if (categoria === 'Mano de Obra Directa') {
        subcat = 'Nómina Cuadrillas';
        um = 'nómina';
        cant = 1;
        pUnit = montoPieza;
        itemDesc = \`Nómina Semanal Cuadrillas Operativas en Obra (Semana \${sem}) - \${proyectoCorto}\`;
        solicitante = 'Recursos Humanos / Nómina Planta';
        resp = 'Supervisión de Obra / RRHH';
        motivo = \`Liquidación semanal de mano de obra cuadrillas en obra\`;
        codigoSalida = \`NOM-2026-M\${mm}-S\${sem}-\${proyectoCodigo.replace('TTE-C-', '')}\`;
      } else if (categoria === 'Servicios') {
        const srv = CATALOGO_SERVICIOS[(pIdx + i) % CATALOGO_SERVICIOS.length];
        subcat = srv.subcat;
        resp = srv.resp;
        itemDesc = \`\${srv.desc} (\${proyectoCorto})\`;
        motivo = \`Servicio técnico especializado en obra (\${proyectoCorto})\`;
        codigoSalida = \`SRV-2026-M\${mm}-\${proyectoCodigo.replace('TTE-C-', '')}-\${i+1}\`;

        if (montoPieza >= srv.pUnit * 0.7) {
          cant = Math.max(1, Math.round(montoPieza / srv.pUnit));
          pUnit = Math.round((montoPieza / cant) * 100) / 100;
          um = srv.um;
        } else {
          um = 'servicio';
          cant = 1;
          pUnit = montoPieza;
        }
      } else if (categoria === 'Horas Maquina') {
        const hm = CATALOGO_HORAS_MAQUINA[(pIdx + i) % CATALOGO_HORAS_MAQUINA.length];
        subcat = 'Mecanizado Taller';
        resp = hm.resp;
        itemDesc = \`\${hm.desc} (\${proyectoCorto})\`;
        motivo = \`Horas máquina operativas en taller central (\${proyectoCorto})\`;
        codigoSalida = \`HM-2026-M\${mm}-\${proyectoCodigo.replace('TTE-C-', '')}-\${i+1}\`;

        if (montoPieza >= hm.pUnit * 0.5) {
          cant = Math.max(1, Math.round(montoPieza / hm.pUnit));
          pUnit = Math.round((montoPieza / cant) * 100) / 100;
          um = hm.um;
        } else {
          um = 'fracción';
          cant = 1;
          pUnit = montoPieza;
        }
      } else {
        // Costos Indirectos
        if (proyectoCodigo === 'TTE-C-0706' && i === 0 && montoPieza >= 30000) {
          subcat = 'Honorarios Profesionales Staff Técnico';
          um = 'mes';
          cant = 1;
          pUnit = montoPieza;
          itemDesc = \`Honorarios Profesionales - Staff Técnico Residencia de Obra (Línea 1 Pellas)\`;
          solicitante = 'Ing. Residente Pellas';
          resp = 'Gerencia de Control de Gestión / Administración Obra';
          motivo = 'Honorarios profesionales fijos mensuales staff técnico de obra';
          codigoSalida = \`IND-2026-HON-M\${mm}-0706\`;
        } else {
          const ind = CATALOGO_INDIRECTOS[(pIdx + i) % CATALOGO_INDIRECTOS.length];
          subcat = ind.subcat;
          resp = ind.resp;
          itemDesc = \`\${ind.desc} (\${proyectoCorto})\`;
          solicitante = 'Departamento de Costos';
          motivo = \`Asignación mensual soporte operativo y de planta (\${proyectoCorto})\`;
          codigoSalida = \`IND-2026-M\${mm}-\${proyectoCodigo.replace('TTE-C-', '')}-\${i+1}\`;
          um = ind.um;
          cant = 1;
          pUnit = montoPieza;
        }
      }

      // STRICT INVARIANT: cant * pUnit === finalMonto
      const finalMonto = Math.round(cant * pUnit * 100) / 100;

      result.push({
        id: \`salida-\${idStart + i}\`,
        codigoSalida,
        fecha,
        semana: sem,
        semanaLabel: \`Semana \${String(sem).padStart(2, '0')}\`,
        mes: mesNum,
        mesLabel,
        ano: 2026,
        proyecto: \`\${proyectoCodigo}: \${proyectoCorto}\`,
        cuentaAuxiliarCodigo: proyectoCodigo,
        cuentaAuxiliarNombre: proyectoNombre,
        centroCosto: proyectoCodigo,
        categoria,
        tipo: categoria,
        subcategoria: subcat,
        itemDescripcion: itemDesc,
        proveedorODestino: \`\${proyectoCorto} / Taller TIMACA\`,
        cantidad: cant,
        unidadMedida: um,
        montoUnitario: pUnit,
        montoTotal: finalMonto,
        moneda: 'USD',
        responsable: resp,
        solicitante,
        motivo,
        esProyectoExterno: true,
        estado: 'Procesado',
        observaciones: motivo
      });
    }

    return result;
  }

  // 1. GENERAR LÍNEAS REALES Y RECIENTES DEL SIP DE AGOSTO 2026
  const RECIENTES_SIP = [
    { 
      fecha: '2026-08-31', 
      sem: 34, 
      cta: 'TTE-C-0656', 
      nro: 'DP-88962', 
      cat: 'Materiales Directos', 
      subcat: 'Pernos / Fijaciones', 
      descCustom: 'Pernos Hexagonales ASTM A325 3/4" x 3" c/tuerca 2H', 
      cant: 2600, 
      umCustom: 'UND', 
      pUnitCustom: 3.766, 
      totalCustom: 9791.60, 
      motivo: 'Montaje estructural tramo motriz', 
      solicitante: 'Carlos Giraldo' 
    },
    { 
      fecha: '2026-08-31', 
      sem: 34, 
      cta: 'TTE-C-0669', 
      nro: 'DP-88926', 
      cat: 'Materiales Directos', 
      subcat: 'Perfiles / Estructura', 
      descCustom: 'Viga Estructural IPE 300 x 12m Acero Estructural', 
      cant: 3, 
      umCustom: 'BARRA (36 metros)', 
      pUnitCustom: 760.03, 
      totalCustom: 2280.09, 
      motivo: 'Fabricación vigas carril', 
      solicitante: 'Jesús Valdez' 
    },
    { 
      fecha: '2026-08-29', 
      sem: 34, 
      cta: 'TTE-C-0678', 
      nro: 'SRV-2026-00061', 
      cat: 'Servicios', 
      subcat: 'Transporte / Flete', 
      descCustom: 'Servicio Transporte Cama Baja Lowboy Planta-FMO', 
      cant: 1, 
      umCustom: 'VIAJE', 
      pUnitCustom: 2109.60, 
      totalCustom: 2109.60, 
      motivo: 'Traslado componentes pesados', 
      solicitante: 'Logística TIMACA' 
    },
    { 
      fecha: '2026-08-30', 
      sem: 34, 
      cta: 'TTE-C-0688', 
      nro: 'HM-2026-00097', 
      cat: 'Horas Maquina', 
      subcat: 'Mecanizado Taller', 
      descCustom: 'Operación Mandrinadora CNC Horas Mecanizado', 
      cant: 0.5, 
      umCustom: 'HORAS (30 min)', 
      pUnitCustom: 161.62, 
      totalCustom: 80.81, 
      motivo: 'Mecanizado de bocinas eje principal', 
      solicitante: 'Javier Narváez' 
    },
    { 
      fecha: '2026-08-30', 
      sem: 34, 
      cta: 'TTE-C-0654', 
      nro: 'SRV-2026-00123', 
      cat: 'Servicios', 
      subcat: 'Supervisión e Inspección Técnica', 
      descCustom: 'Servicio de Supervisión Técnica e Inspección Residente de Obra', 
      cant: 1, 
      umCustom: 'SEMANA', 
      pUnitCustom: 24.54, 
      totalCustom: 24.54, 
      motivo: 'Control QA/QC e inspección en campo', 
      solicitante: 'Gerencia de Operaciones' 
    },
    { fecha: '2026-08-01', sem: 31, cta: 'TTE-C-0706', matIdx: 0, cant: 3, cat: 'Materiales Directos', nro: 'SIP-DESP-88910', subcat: 'Perfiles / Estructura', motivo: 'Montaje de estructura base', solicitante: 'Almacén Central SIP' },
    { fecha: '2026-08-02', sem: 31, cta: 'TTE-C-0671', indIdx: 0, cant: 2, cat: 'Costos Indirectos', nro: 'SIP-CONS-88914', subcat: 'Consumibles Taller', motivo: 'Corte y biselado de piezas', solicitante: 'Taller TIMACA' },
    { fecha: '2026-08-03', sem: 31, cta: 'TTE-C-0668', matIdx: 1, cant: 12, cat: 'Materiales Directos', nro: 'SIP-DESP-88921', subcat: 'Chapas / Planchas', motivo: 'Revestimiento tolvas', solicitante: 'Almacén Central SIP' },
    { fecha: '2026-08-04', sem: 31, cta: 'TTE-C-0656', srvIdx: 0, cant: 1, cat: 'Servicios', nro: 'SIP-SERV-88928', subcat: 'Transporte / Flete', motivo: 'Flete de suministros a obra', solicitante: 'Logística TIMACA' },
    { fecha: '2026-08-05', sem: 31, cta: 'TTE-C-0653', matIdx: 3, cant: 2, cat: 'Materiales Directos', nro: 'SIP-DESP-88935', subcat: 'Repuestos Mecánicos', motivo: 'Repotenciación eje cangilones', solicitante: 'Mantenimiento Mecánico' },
    { fecha: '2026-08-06', sem: 31, cta: 'TTE-C-0680', indIdx: 1, cant: 4, cat: 'Costos Indirectos', nro: 'SIP-CONS-88942', subcat: 'Gases Industriales', motivo: 'Soldadura TIG tuberías', solicitante: 'Seguridad Industrial' },
    { fecha: '2026-08-07', sem: 31, cta: 'TTE-C-0706', matIdx: 4, cant: 10, cat: 'Materiales Directos', nro: 'SIP-DESP-88950', subcat: 'Pernos / Fijaciones', motivo: 'Fijación de soportes Línea 1', solicitante: 'Carlos Giraldo' },
    { fecha: '2026-08-25', sem: 34, cta: 'TTE-C-0706', srvIdx: 0, cant: 1, cat: 'Servicios', nro: 'SIP-VAL-89019', subcat: 'Transporte / Flete', motivo: 'Movilización grúas pesadas', solicitante: 'Gerencia Operaciones' },
    { fecha: '2026-08-26', sem: 34, cta: 'TTE-C-0668', indIdx: 0, cant: 3, cat: 'Costos Indirectos', nro: 'SIP-CONS-89027', subcat: 'Consumibles Taller', motivo: 'Discos y pulido estructural', solicitante: 'Javier Narváez' },
    { fecha: '2026-08-27', sem: 34, cta: 'TTE-C-0656', matIdx: 3, cant: 2, cat: 'Materiales Directos', nro: 'SIP-DESP-89035', subcat: 'Repuestos Mecánicos', motivo: 'Cambio de rodamiento motriz', solicitante: 'Jesús Valdez' },
    { fecha: '2026-08-28', sem: 34, cta: 'TTE-C-0706', matIdx: 0, cant: 4, cat: 'Materiales Directos', nro: 'SIP-DESP-89041', subcat: 'Perfiles / Estructura', motivo: 'Refuerzo de vigas carril', solicitante: 'Carlos Giraldo' },
    { fecha: '2026-08-28', sem: 34, cta: 'TTE-C-0671', matIdx: 1, cant: 25, cat: 'Materiales Directos', nro: 'SIP-DESP-89038', subcat: 'Chapas / Planchas', motivo: 'Suministro planchas antidesgaste', solicitante: 'Nelson Guédez' },
  ];

  const sipPorCtaCat: Record<string, number> = {};

  RECIENTES_SIP.forEach((rec) => {
    const pryInfo = CUENTAS_AUXILIARES_EXACTAS_AGOSTO_2026.find(p => p.cuentaAuxiliar === rec.cta)!;
    let itemDesc = (rec as any).descCustom || '';
    let um = (rec as any).umCustom || 'und';
    let pUnit = (rec as any).pUnitCustom || 100;
    let resp = (rec as any).solicitante || 'Almacén Central SIP';
    let subcat = (rec as any).subcat || 'General';

    if (!(rec as any).descCustom) {
      if (rec.matIdx !== undefined) {
        const itm = CATALOGO_SIP_MATERIALES[rec.matIdx];
        itemDesc = itm.desc;
        um = itm.um;
        pUnit = itm.pUnit;
        resp = itm.resp;
        subcat = itm.subcat;
      } else if (rec.srvIdx !== undefined) {
        const itm = CATALOGO_SERVICIOS[rec.srvIdx];
        itemDesc = itm.desc;
        um = itm.um;
        pUnit = itm.pUnit;
        resp = itm.resp;
        subcat = itm.subcat;
      } else if (rec.indIdx !== undefined) {
        const itm = CATALOGO_INDIRECTOS[rec.indIdx];
        itemDesc = itm.desc;
        um = itm.um;
        pUnit = itm.pUnit;
        resp = itm.resp;
        subcat = itm.subcat;
      }
    }

    const total = (rec as any).totalCustom !== undefined 
      ? (rec as any).totalCustom 
      : Math.round(rec.cant * pUnit * 100) / 100;

    const key = \`\${rec.cta}|\${rec.cat}\`;
    sipPorCtaCat[key] = (sipPorCtaCat[key] || 0) + total;

    salidas.push({
      id: \`salida-sip-\${idCounter++}\`,
      codigoSalida: rec.nro,
      fecha: rec.fecha,
      semana: rec.sem,
      semanaLabel: \`Semana \${rec.sem}\`,
      mes: 8,
      mesLabel: 'Agosto 2026',
      ano: 2026,
      proyecto: \`\${pryInfo.cuentaAuxiliar}: \${pryInfo.proyectoCorto}\`,
      cuentaAuxiliarCodigo: pryInfo.cuentaAuxiliar,
      cuentaAuxiliarNombre: pryInfo.proyecto,
      centroCosto: pryInfo.cuentaAuxiliar,
      categoria: rec.cat,
      tipo: rec.cat,
      subcategoria: subcat,
      itemDescripcion: itemDesc,
      proveedorODestino: \`\${pryInfo.proyectoCorto} - Cliente\`,
      cantidad: rec.cant,
      unidadMedida: um,
      montoUnitario: pUnit,
      montoTotal: total,
      moneda: 'USD',
      responsable: resp,
      solicitante: (rec as any).solicitante || resp,
      motivo: (rec as any).motivo || \`Vale de almacén \${rec.nro}\`,
      esProyectoExterno: pryInfo.cuentaAuxiliar.startsWith('TTE-C-'),
      estado: 'Procesado',
      observaciones: (rec as any).motivo || \`Comprobante de Salida Almacén SIP \${rec.nro}\`
    });
  });

  // 2. GENERAR LÍNEAS DETALLADAS PARA CADA CUENTA AUXILIAR Y CATEGORÍA (AGOSTO 2026)
  const SUM_OTROS_AGOSTO = 647571;
  const REM_MAT_OTROS = 313822;
  const REM_SRV_OTROS = 54864;
  const REM_HM_OTROS = 64224;
  const REM_IND_OTROS = 126493;

  let acumMatOtros = 0;
  let acumSrvOtros = 0;
  let acumHmOtros = 0;
  let acumIndOtros = 0;

  const otrosProysAgosto = CUENTAS_AUXILIARES_EXACTAS_AGOSTO_2026.filter(p => p.cuentaAuxiliar !== 'TTE-C-0706');

  CUENTAS_AUXILIARES_EXACTAS_AGOSTO_2026.forEach((p, pIdx) => {
    let matBudget = 0;
    let srvBudget = 0;
    let hmBudget = 0;
    let indBudget = 0;

    if (p.cuentaAuxiliar === 'TTE-C-0706') {
      matBudget = 192867.00;
      srvBudget = 63106.00;
      hmBudget = 25565.00;
      indBudget = 101621.00;
    } else {
      const idxEnOtros = otrosProysAgosto.findIndex(o => o.cuentaAuxiliar === p.cuentaAuxiliar);
      const isLastOtro = idxEnOtros === otrosProysAgosto.length - 1;
      const pesoOtro = p.montoAgosto / SUM_OTROS_AGOSTO;

      matBudget = isLastOtro ? Math.round((REM_MAT_OTROS - acumMatOtros) * 100) / 100 : Math.round(REM_MAT_OTROS * pesoOtro * 100) / 100;
      srvBudget = isLastOtro ? Math.round((REM_SRV_OTROS - acumSrvOtros) * 100) / 100 : Math.round(REM_SRV_OTROS * pesoOtro * 100) / 100;
      hmBudget = isLastOtro ? Math.round((REM_HM_OTROS - acumHmOtros) * 100) / 100 : Math.round(REM_HM_OTROS * pesoOtro * 100) / 100;
      indBudget = isLastOtro ? Math.round((REM_IND_OTROS - acumIndOtros) * 100) / 100 : Math.round(REM_IND_OTROS * pesoOtro * 100) / 100;

      acumMatOtros += matBudget;
      acumSrvOtros += srvBudget;
      acumHmOtros += hmBudget;
      acumIndOtros += indBudget;
    }

    // A) Materiales Directos
    const yaSipMat = sipPorCtaCat[\`\${p.cuentaAuxiliar}|Materiales Directos\`] || 0;
    const totalMatPry = Math.max(0, Math.round((matBudget - yaSipMat) * 100) / 100);
    if (totalMatPry > 0) {
      const lineasMat = pIdx < 5 ? 4 : 2;
      let acumulado = 0;
      for (let i = 0; i < lineasMat; i++) {
        const matItm = CATALOGO_SIP_MATERIALES[(pIdx + i) % CATALOGO_SIP_MATERIALES.length];
        const montoLinea = i === lineasMat - 1 
          ? Math.round((totalMatPry - acumulado) * 100) / 100
          : Math.round((totalMatPry / lineasMat) * 100) / 100;
        acumulado += montoLinea;

        if (montoLinea > 0) {
          const diaNum = 1 + ((pIdx * 3 + i * 7) % 31);
          const dia = String(diaNum).padStart(2, '0');
          const sem = diaNum <= 9 ? 31 : diaNum <= 16 ? 32 : diaNum <= 23 ? 33 : 34;

          let cant = 1;
          let pUnit = montoLinea;
          let um = matItm.um;

          if (montoLinea >= matItm.pUnit * 0.7) {
            cant = Math.max(1, Math.round(montoLinea / matItm.pUnit));
            pUnit = Math.round((montoLinea / cant) * 100) / 100;
          } else {
            um = 'lote';
            cant = 1;
            pUnit = montoLinea;
          }
          const finalMontoLinea = Math.round(cant * pUnit * 100) / 100;

          salidas.push({
            id: \`salida-mat-\${idCounter++}\`,
            codigoSalida: \`SIP-DESP-\${89000 - idCounter}\`,
            fecha: \`2026-08-\${dia}\`,
            semana: sem,
            semanaLabel: \`Semana \${sem}\`,
            mes: 8,
            mesLabel: 'Agosto 2026',
            ano: 2026,
            proyecto: \`\${p.cuentaAuxiliar}: \${p.proyectoCorto}\`,
            cuentaAuxiliarCodigo: p.cuentaAuxiliar,
            cuentaAuxiliarNombre: p.proyecto,
            centroCosto: p.cuentaAuxiliar,
            categoria: 'Materiales Directos',
            tipo: 'Materiales Directos',
            subcategoria: matItm.subcat,
            itemDescripcion: \`\${matItm.desc} (\${p.proyectoCorto})\`,
            proveedorODestino: \`\${p.proyectoCorto} / Taller TIMACA\`,
            cantidad: cant,
            unidadMedida: um,
            montoUnitario: pUnit,
            montoTotal: finalMontoLinea,
            moneda: 'USD',
            responsable: matItm.resp,
            solicitante: \`Ing. Residente \${p.proyectoCorto}\`,
            motivo: \`Vale de Almacén SIP para \${p.proyectoCorto}\`,
            esProyectoExterno: true,
            estado: 'Procesado',
            observaciones: \`Vale de Almacén SIP para \${p.proyectoCorto}\`
          });
        }
      }
    }

    // B) Servicios
    const yaSipSrv = sipPorCtaCat[\`\${p.cuentaAuxiliar}|Servicios\`] || 0;
    const totalSrvPry = Math.max(0, Math.round((srvBudget - yaSipSrv) * 100) / 100);
    if (totalSrvPry > 0) {
      const srvItm = CATALOGO_SERVICIOS[pIdx % CATALOGO_SERVICIOS.length];
      const diaNum = 1 + ((pIdx * 4) % 30);
      const dia = String(diaNum).padStart(2, '0');
      const sem = diaNum <= 9 ? 31 : diaNum <= 16 ? 32 : diaNum <= 23 ? 33 : 34;

      salidas.push({
        id: \`salida-srv-\${idCounter++}\`,
        codigoSalida: \`SRV-2026-\${String(idCounter).padStart(5, '0')}\`,
        fecha: \`2026-08-\${dia}\`,
        semana: sem,
        semanaLabel: \`Semana \${sem}\`,
        mes: 8,
        mesLabel: 'Agosto 2026',
        ano: 2026,
        proyecto: \`\${p.cuentaAuxiliar}: \${p.proyectoCorto}\`,
        cuentaAuxiliarCodigo: p.cuentaAuxiliar,
        cuentaAuxiliarNombre: p.proyecto,
        centroCosto: p.cuentaAuxiliar,
        categoria: 'Servicios',
        tipo: 'Servicios',
        subcategoria: srvItm.subcat || 'Supervisión e Inspección Técnica',
        itemDescripcion: \`\${srvItm.desc} - \${p.proyectoCorto}\`,
        proveedorODestino: 'Subcontratista Autorizado / TIMACA QA/QC',
        cantidad: 1,
        unidadMedida: srvItm.um,
        montoUnitario: totalSrvPry,
        montoTotal: totalSrvPry,
        moneda: 'USD',
        responsable: srvItm.resp,
        solicitante: 'Gerencia de Operaciones',
        motivo: \`Servicio especializado para \${p.proyectoCorto}\`,
        esProyectoExterno: true,
        estado: 'Verificado',
        observaciones: \`Servicio especializado para \${p.proyectoCorto}\`
      });
    }

    // C) Horas Máquina
    const yaSipHm = sipPorCtaCat[\`\${p.cuentaAuxiliar}|Horas Maquina\`] || 0;
    const totalHmPry = Math.max(0, Math.round((hmBudget - yaSipHm) * 100) / 100);
    if (totalHmPry > 0) {
      const hmItm = CATALOGO_HORAS_MAQUINA[pIdx % CATALOGO_HORAS_MAQUINA.length];
      const diaNum = 1 + ((pIdx * 2 + 1) % 30);
      const dia = String(diaNum).padStart(2, '0');
      const sem = diaNum <= 9 ? 31 : diaNum <= 16 ? 32 : diaNum <= 23 ? 33 : 34;

      let cantHm = 1;
      let pUnitHm = totalHmPry;
      let umHm = hmItm.um;

      if (totalHmPry >= hmItm.pUnit * 0.5) {
        cantHm = Math.max(1, Math.round(totalHmPry / hmItm.pUnit));
        pUnitHm = Math.round((totalHmPry / cantHm) * 100) / 100;
      } else {
        umHm = 'fracción';
        cantHm = 1;
        pUnitHm = totalHmPry;
      }
      const finalMontoHm = Math.round(cantHm * pUnitHm * 100) / 100;

      salidas.push({
        id: \`salida-hm-\${idCounter++}\`,
        codigoSalida: \`HM-2026-\${String(idCounter).padStart(5, '0')}\`,
        fecha: \`2026-08-\${dia}\`,
        semana: sem,
        semanaLabel: \`Semana \${sem}\`,
        mes: 8,
        mesLabel: 'Agosto 2026',
        ano: 2026,
        proyecto: \`\${p.cuentaAuxiliar}: \${p.proyectoCorto}\`,
        cuentaAuxiliarCodigo: p.cuentaAuxiliar,
        cuentaAuxiliarNombre: p.proyecto,
        centroCosto: p.cuentaAuxiliar,
        categoria: 'Horas Maquina',
        tipo: 'Horas Maquina',
        subcategoria: 'Mecanizado Taller',
        itemDescripcion: \`\${hmItm.desc} (\${p.proyectoCorto})\`,
        proveedorODestino: 'Taller de Mecanizado Pesado TIMACA',
        cantidad: cantHm,
        unidadMedida: umHm,
        montoUnitario: pUnitHm,
        montoTotal: finalMontoHm,
        moneda: 'USD',
        responsable: hmItm.resp,
        solicitante: 'Coordinación Horas Máquina',
        motivo: \`Mecanizado y conformado de piezas (\${p.proyectoCorto})\`,
        esProyectoExterno: true,
        estado: 'Procesado',
        observaciones: 'Reporte de Horas Máquina Taller Central'
      });
    }

    // D) Costos Indirectos
    const yaSipInd = sipPorCtaCat[\`\${p.cuentaAuxiliar}|Costos Indirectos\`] || 0;
    const totalIndPry = Math.max(0, Math.round((indBudget - yaSipInd) * 100) / 100);

    if (totalIndPry > 0) {
      const diaNum = 1 + ((pIdx * 3 + 2) % 30);
      const dia = String(diaNum).padStart(2, '0');
      const sem = diaNum <= 9 ? 31 : diaNum <= 16 ? 32 : diaNum <= 23 ? 33 : 34;

      if (p.cuentaAuxiliar === 'TTE-C-0706') {
        salidas.push({
          id: \`salida-ind-\${idCounter++}\`,
          codigoSalida: 'IND-2026-HON-0706',
          fecha: '2026-08-15',
          semana: 32,
          semanaLabel: 'Semana 32',
          mes: 8,
          mesLabel: 'Agosto 2026',
          ano: 2026,
          proyecto: \`\${p.cuentaAuxiliar}: \${p.proyectoCorto}\`,
          cuentaAuxiliarCodigo: p.cuentaAuxiliar,
          cuentaAuxiliarNombre: p.proyecto,
          centroCosto: p.cuentaAuxiliar,
          categoria: 'Costos Indirectos',
          tipo: 'Costos Indirectos',
          subcategoria: 'Honorarios Profesionales Staff Técnico',
          itemDescripcion: 'Honorarios Profesionales - Staff Técnico Residencia de Obra (Línea 1 Pellas)',
          proveedorODestino: 'Staff Técnico de Ingeniería y Supervisión TIMACA',
          cantidad: 1,
          unidadMedida: 'mes',
          montoUnitario: 45270.00,
          montoTotal: 45270.00,
          moneda: 'USD',
          responsable: 'Gerencia de Control de Gestión / Administración Obra',
          solicitante: 'Ing. Residente Pellas',
          motivo: 'Honorarios profesionales fijos mensuales del staff técnico y supervisores en campo',
          esProyectoExterno: true,
          estado: 'Procesado',
          observaciones: 'Reestructuración contable sincera de staff técnico de obra dentro de indirectos (Diapositiva 9 PPT)'
        });

        const remIndPellas = Math.round((totalIndPry - 45270) * 100) / 100;
        salidas.push({
          id: \`salida-ind-\${idCounter++}\`,
          codigoSalida: \`IND-2026-\${String(idCounter).padStart(5, '0')}\`,
          fecha: '2026-08-30',
          semana: 34,
          semanaLabel: 'Semana 34',
          mes: 8,
          mesLabel: 'Agosto 2026',
          ano: 2026,
          proyecto: \`\${p.cuentaAuxiliar}: \${p.proyectoCorto}\`,
          cuentaAuxiliarCodigo: p.cuentaAuxiliar,
          cuentaAuxiliarNombre: p.proyecto,
          centroCosto: p.cuentaAuxiliar,
          categoria: 'Costos Indirectos',
          tipo: 'Costos Indirectos',
          subcategoria: 'Prorrateo Costos Indirectos Operativos',
          itemDescripcion: \`Prorrateo de Costos Indirectos Operativos (Base MOD 60.2%) - \${p.proyectoCorto}\`,
          proveedorODestino: 'Bolsa Corporativa de Costos Indirectos TIMACA',
          cantidad: 1,
          unidadMedida: 'cuota',
          montoUnitario: remIndPellas,
          montoTotal: remIndPellas,
          moneda: 'USD',
          responsable: 'Control de Gestión & Contabilidad',
          solicitante: 'Departamento de Costos',
          motivo: 'Asignación mensual de soporte operativo y administrativo según coeficiente de Mano de Obra Directa',
          esProyectoExterno: true,
          estado: 'Procesado',
          observaciones: 'Prorrateo oficial según metodología del Modelo Estrella TIMACA'
        });
      } else {
        salidas.push({
          id: \`salida-ind-\${idCounter++}\`,
          codigoSalida: \`IND-2026-\${String(idCounter).padStart(5, '0')}\`,
          fecha: \`2026-08-\${dia}\`,
          semana: sem,
          semanaLabel: \`Semana \${sem}\`,
          mes: 8,
          mesLabel: 'Agosto 2026',
          ano: 2026,
          proyecto: \`\${p.cuentaAuxiliar}: \${p.proyectoCorto}\`,
          cuentaAuxiliarCodigo: p.cuentaAuxiliar,
          cuentaAuxiliarNombre: p.proyecto,
          centroCosto: p.cuentaAuxiliar,
          categoria: 'Costos Indirectos',
          tipo: 'Costos Indirectos',
          subcategoria: 'Prorrateo Costos Indirectos Operativos',
          itemDescripcion: \`Prorrateo de Costos Indirectos Operativos (Base MOD) - \${p.proyectoCorto}\`,
          proveedorODestino: 'Bolsa Corporativa de Costos Indirectos TIMACA',
          cantidad: 1,
          unidadMedida: 'cuota',
          montoUnitario: totalIndPry,
          montoTotal: totalIndPry,
          moneda: 'USD',
          responsable: 'Control de Gestión & Contabilidad',
          solicitante: 'Departamento de Costos',
          motivo: \`Asignación mensual de soporte operativo y planta proporcional a la Mano de Obra Directa (\${p.proyectoCorto})\`,
          esProyectoExterno: true,
          estado: 'Procesado',
          observaciones: 'Imputación mensual de costos indirectos según coeficiente MOD (Diapositiva 10 PPT)'
        });
      }
    }
  });

  // 3. GENERAR MANO DE OBRA DIRECTA DE AGOSTO 2026 (DESDE ARCHIVOS DE NÓMINA RRHH)
  DETALLE_NOMINA_AGOSTO_2026.forEach((row) => {
    const pryMatch = CUENTAS_AUXILIARES_EXACTAS_AGOSTO_2026.find(p => p.cuentaAuxiliar === row.cuentaAuxiliar);
    const pCorto = pryMatch ? pryMatch.proyectoCorto : row.proyecto;

    const semanasData = [
      { sem: 31, monto: row.sem31, fecha: '2026-08-01', label: 'Semana 31 (01-09 Ago)' },
      { sem: 32, monto: row.sem32, fecha: '2026-08-10', label: 'Semana 32 (10-16 Ago)' },
      { sem: 33, monto: row.sem33, fecha: '2026-08-17', label: 'Semana 33 (17-23 Ago)' },
      { sem: 34, monto: row.sem34, fecha: '2026-08-24', label: 'Semana 34 (24-31 Ago)' },
    ];

    semanasData.forEach((sObj) => {
      if (sObj.monto <= 0) return;

      salidas.push({
        id: \`salida-mod-\${idCounter++}\`,
        codigoSalida: \`NOM-2026-S\${sObj.sem}-\${String(idCounter).padStart(4, '0')}\`,
        fecha: sObj.fecha,
        semana: sObj.sem,
        semanaLabel: sObj.label,
        mes: 8,
        mesLabel: 'Agosto 2026',
        ano: 2026,
        proyecto: \`\${row.cuentaAuxiliar}: \${pCorto}\`,
        cuentaAuxiliarCodigo: row.cuentaAuxiliar,
        cuentaAuxiliarNombre: row.proyecto,
        centroCosto: row.cuentaAuxiliar,
        categoria: 'Mano de Obra Directa',
        tipo: 'Mano de Obra Directa',
        subcategoria: 'Nómina Cuadrillas',
        itemDescripcion: \`Nómina \${sObj.label} (\${row.sourceFile}) - \${pCorto}\`,
        proveedorODestino: 'Personal de Planta y Cuadrillas TIMACA',
        cantidad: 1,
        unidadMedida: 'nómina',
        montoUnitario: sObj.monto,
        montoTotal: sObj.monto,
        moneda: 'USD',
        responsable: 'Recursos Humanos / Nómina Planta',
        solicitante: 'Recursos Humanos / Nómina Planta',
        motivo: \`Liquidación semanal de nómina (\${sObj.label})\`,
        esProyectoExterno: true,
        estado: 'Procesado',
        observaciones: \`Input RRHH: \${row.sourceFile}\`
      });
    });
  });

  // 4. MESES HISTÓRICOS (ENERO A JULIO 2026) CON DESGLOSE OPERATIVO REALISTA
  const mesesHistoricos = [
    { mes: 1, label: 'Enero 2026', mm: '01', semanas: [1, 2, 3, 4] },
    { mes: 2, label: 'Febrero 2026', mm: '02', semanas: [5, 6, 7, 8] },
    { mes: 3, label: 'Marzo 2026', mm: '03', semanas: [9, 10, 11, 12, 13] },
    { mes: 4, label: 'Abril 2026', mm: '04', semanas: [14, 15, 16, 17] },
    { mes: 5, label: 'Mayo 2026', mm: '05', semanas: [18, 19, 20, 21] },
    { mes: 6, label: 'Junio 2026', mm: '06', semanas: [22, 23, 24, 25, 26] },
    { mes: 7, label: 'Julio 2026', mm: '07', semanas: [27, 28, 29, 30] },
  ];

  const TTE_REMANENTE_ENE_JUL: Record<string, number> = {
    'Materiales Directos': 319860 - 192867,    // 126.993
    'Servicios': 226634 - 63106,              // 163.528
    'Mano de Obra Directa': 460000 - 133185,  // 326.815
    'Horas Maquina': 259000 - 25565,          // 233.435
    'Costos Indirectos': 497236 - 101621      // 395.615
  };

  const REAL_PROYS_HISTORICOS = [
    { cta: 'TTE-C-0656', mat: 878623, serv: 172421, mod: 249877, hm: 42327, ind: 192197, total: 1535445, nombreCorto: 'Bandas Transp. PMH', nombre: 'Rehabilitación de bandas transportadoras PMH' },
    { cta: 'TTE-C-0676', mat: 120000, serv: 160000, mod: 350000, hm: 220000, ind: 280000, total: 1130000, nombreCorto: '2da Línea Pellas', nombre: 'Segunda linea de Planta de Pellas' },
    { cta: 'TTE-C-0694', mat: 36697, serv: 1427962, mod: 9550, hm: 0, ind: 6897, total: 1481106, nombreCorto: 'Caldera Briquetas', nombre: 'Suministro e Instalación de la Caldera - Briquetas' },
    { cta: 'TTE-C-0668', mat: 788396, serv: 193773, mod: 160557, hm: 0, ind: 128342, total: 1271068, nombreCorto: 'Briquetas Fase 2', nombre: 'Fase 2 Planta de briquetas - FMO' },
    { cta: 'TTE-C-0671', mat: 415185, serv: 418557, mod: 59260, hm: 394, ind: 38720, total: 932116, nombreCorto: '2da Línea PMH', nombre: 'Segunda línea PMH - Ingeniería, diseño y suministro' },
    { cta: 'TTE-C-0655', mat: 733569, serv: 134069, mod: 9758, hm: 0, ind: 6959, total: 884355, nombreCorto: 'Tolva PMH', nombre: 'Interconexión del sist. de transporte desde tolva PMH' },
    { cta: 'TTE-C-0654', mat: 497994, serv: 80612, mod: 250, hm: 0, ind: 3381, total: 582236, nombreCorto: 'Cinta JD-9021', nombre: 'Proyecto 5B: Rehabilitación de cinta JD-9021' },
    { cta: 'TTE-C-0653', mat: 327243, serv: 62595, mod: 44333, hm: 29138, ind: 37814, total: 501123, nombreCorto: 'Rueda Cangilones PMH', nombre: 'Repotenciación de rueda de cangilones (DRAVO) PMH' },
    { cta: 'TTE-C-0680', mat: 104195, serv: 201754, mod: 120518, hm: 0, ind: 73974, total: 500441, nombreCorto: 'Mantenimiento BG II', nombre: 'Servicio de mantenimiento de BG II' },
    { cta: 'TTE-C-0678', mat: 97107, serv: 4426, mod: 82302, hm: 47852, ind: 58610, total: 290297, nombreCorto: 'Pila HA y HB PMH', nombre: 'Proyecto Pila HA y HB, suministro e instalación PMH' },
    { cta: 'TTE-C-0640', mat: 102323, serv: 452, mod: 0, hm: 0, ind: 0, total: 102775, nombreCorto: 'Parrilla Móvil Pellas', nombre: 'Rehabilitación de la Parrilla Móvil 610TG1 / Pellas' },
    { cta: 'TTE-C-0670', mat: 13639, serv: 85, mod: 38221, hm: 0, ind: 30532, total: 82477, nombreCorto: 'Mtto Briqueteras', nombre: 'Servicio de mtto. Maquinas Briqueteras' },
    { cta: 'TTE-C-0669', mat: 9420, serv: 296, mod: 31169, hm: 0, ind: 15728, total: 56612, nombreCorto: 'Mtto Dravo', nombre: 'Servicio de mantenimiento de Dravo' },
    { cta: 'TTE-C-0697', mat: 4029, serv: 26616, mod: 0, hm: 0, ind: 0, total: 30645, nombreCorto: 'Generador Briquetas', nombre: 'Reparación de Generador Eléctrico (Briquetas)' },
    { cta: 'TTE-C-0688', mat: 2869, serv: 3269, mod: 15580, hm: 0, ind: 8361, total: 30079, nombreCorto: 'Carga Barcos Wellman', nombre: 'Desmantelamiento del Carga Barcos Wellman' },
    { cta: 'TTE-C-0711', mat: 4656, serv: 0, mod: 1470, hm: 0, ind: 1419, total: 7546, nombreCorto: 'Módulos Eléctricos TH4', nombre: 'Servicio de retirada de modulos eléctricos TH4 PMH' },
    { cta: 'TTE-C-0642', mat: 3345, serv: 0, mod: 0, hm: 0, ind: 0, total: 3345, nombreCorto: 'Ship Loader FMO', nombre: 'Rehabilitación de Carga Barco FMO (Ship loader)' },
    { cta: 'TTE-C-0684', mat: 0, serv: 0, mod: 930, hm: 0, ind: 2044, total: 2974, nombreCorto: 'Gamelas FMO-PMH', nombre: 'Fabricación de Gamelas FMO-PMH' },
    { cta: 'TTE-C-0663', mat: 221, serv: 750, mod: 0, hm: 0, ind: 0, total: 971, nombreCorto: 'Boca Grande 2 Etapa III', nombre: 'Reacondicionamiento etapa III en Boca Grande 2' }
  ];

  const catProps: Record<string, keyof typeof REAL_PROYS_HISTORICOS[0]> = {
    'Materiales Directos': 'mat',
    'Servicios': 'serv',
    'Mano de Obra Directa': 'mod',
    'Horas Maquina': 'hm',
    'Costos Indirectos': 'ind'
  };

  const tteAcumulados: Record<string, number> = {
    'Materiales Directos': 0,
    'Servicios': 0,
    'Mano de Obra Directa': 0,
    'Horas Maquina': 0,
    'Costos Indirectos': 0
  };

  const pryTTE = CUENTAS_AUXILIARES_EXACTAS_AGOSTO_2026.find(p => p.cuentaAuxiliar === 'TTE-C-0706')!;

  mesesHistoricos.forEach((mHist, mIdx) => {
    const esUltimoMesHist = mIdx === mesesHistoricos.length - 1;

    TABLA_PPT_DISTRIBUCION_2026.forEach((catObj, catIdx) => {
      const montoTotalMesCat = catObj.meses[mHist.mes - 1];
      const remCat = TTE_REMANENTE_ENE_JUL[catObj.categoria] || 0;

      // 1. Asignar porción exacta a TTE-C-0706 (Línea 1 Pellas) en meses 4 a 7
      let montoTTE = 0;
      if (mHist.mes >= 4) {
        const totalCatActivosTTE = catObj.meses[3] + catObj.meses[4] + catObj.meses[5] + catObj.meses[6];
        const pesoMesRelativo = (catObj.meses[mHist.mes - 1] || 1) / totalCatActivosTTE;
        
        montoTTE = esUltimoMesHist
          ? Math.round((remCat - tteAcumulados[catObj.categoria]) * 100) / 100
          : Math.round(remCat * pesoMesRelativo * 100) / 100;
        
        tteAcumulados[catObj.categoria] += montoTTE;
      }

      if (montoTTE > 0) {
        const ttePieces = splitIntoOperationalSalidas({
          proyectoCodigo: pryTTE.cuentaAuxiliar,
          proyectoNombre: pryTTE.proyecto,
          proyectoCorto: pryTTE.proyectoCorto,
          categoria: catObj.categoria,
          montoTotal: montoTTE,
          mesNum: mHist.mes,
          mesLabel: mHist.label,
          mm: mHist.mm,
          semanas: mHist.semanas,
          pIdx: catIdx,
          idStart: idCounter
        });
        idCounter += ttePieces.length;
        salidas.push(...ttePieces);
      }

      // 2. Asignar el remanente exacto de la categoría para este mes entre los demás proyectos
      const remOtros = Math.round((montoTotalMesCat - montoTTE) * 100) / 100;
      const propKey = catProps[catObj.categoria];
      const activeProys = REAL_PROYS_HISTORICOS.filter(p => ((p[propKey] as number) || 0) > 0);
      const totalOtrosProp = activeProys.reduce((sum, p) => sum + ((p[propKey] as number) || 0), 0);

      let acumuladoOtrosMes = 0;
      activeProys.forEach((p, pIdx) => {
        const isLast = (pIdx === activeProys.length - 1);
        const subtotalOtro = isLast
          ? Math.round((remOtros - acumuladoOtrosMes) * 100) / 100
          : Math.round(remOtros * (((p[propKey] as number) || 0) / totalOtrosProp) * 100) / 100;
        
        acumuladoOtrosMes += subtotalOtro;
        if (subtotalOtro <= 0) return;

        const piezas = splitIntoOperationalSalidas({
          proyectoCodigo: p.cta,
          proyectoNombre: p.nombre,
          proyectoCorto: p.nombreCorto,
          categoria: catObj.categoria,
          montoTotal: subtotalOtro,
          mesNum: mHist.mes,
          mesLabel: mHist.label,
          mm: mHist.mm,
          semanas: mHist.semanas,
          pIdx: pIdx + catIdx,
          idStart: idCounter
        });
        idCounter += piezas.length;
        salidas.push(...piezas);
      });
    });
  });

  // 5. CALIBRACIÓN PRIMERO PARA TTE-C-0706 (Línea 1 Pellas - EXACTO $1.762.730,00 USD)
  const TARGETS_OFICIALES_TTE: Record<string, number> = {
    'Materiales Directos': 319860.00,
    'Servicios': 226634.00,
    'Mano de Obra Directa': 460000.00,
    'Horas Maquina': 259000.00,
    'Costos Indirectos': 497236.00
  };

  Object.entries(TARGETS_OFICIALES_TTE).forEach(([cat, targetVal]) => {
    const lineas = salidas.filter(s => s.cuentaAuxiliarCodigo === 'TTE-C-0706' && s.categoria === cat);
    if (lineas.length > 0) {
      const actualSum = Math.round(lineas.reduce((acc, s) => acc + s.montoTotal, 0) * 100) / 100;
      const diff = Math.round((targetVal - actualSum) * 100) / 100;
      if (Math.abs(diff) > 0.001) {
        let candidate = lineas.slice().reverse().find(s => s.cantidad === 1);
        if (!candidate) {
          candidate = lineas[lineas.length - 1];
          candidate.cantidad = 1;
          candidate.unidadMedida = 'lote';
        }
        candidate.montoTotal = Math.round((candidate.montoTotal + diff) * 100) / 100;
        candidate.montoUnitario = candidate.montoTotal;
      }
    }
  });

  // 6. CALIBRACIÓN EXACTA POR CATEGORÍA Y POR MES (Garantiza $0,00 en cada celda de la matriz PPT)
  TABLA_PPT_DISTRIBUCION_2026.forEach(catObj => {
    TOTALES_MESES_PPT.forEach(m => {
      const targetCelda = catObj.meses[m.mesNum - 1];
      const lineasCelda = salidas.filter(s => s.mes === m.mesNum && s.categoria === catObj.categoria);
      const actualCelda = Math.round(lineasCelda.reduce((a, b) => a + b.montoTotal, 0) * 100) / 100;
      const diffCelda = Math.round((targetCelda - actualCelda) * 100) / 100;

      if (Math.abs(diffCelda) > 0.001) {
        let candidate = lineasCelda.slice().reverse().find(s => s.cantidad === 1 && s.cuentaAuxiliarCodigo !== 'TTE-C-0706');
        if (!candidate) {
          candidate = lineasCelda.find(s => s.cuentaAuxiliarCodigo !== 'TTE-C-0706');
          if (candidate) {
            candidate.cantidad = 1;
            candidate.unidadMedida = 'lote';
          }
        }
        if (candidate) {
          candidate.montoTotal = Math.round((candidate.montoTotal + diffCelda) * 100) / 100;
          candidate.montoUnitario = candidate.montoTotal;
        }
      }
    });
  });

  // Garantizar tipo, subcategoria, proyecto uniforme, solicitante, motivo y esProyectoExterno en el 100% de las salidas
  salidas.forEach(s => {
    if (s.cuentaAuxiliarCodigo && s.cuentaAuxiliarCodigo.startsWith('TTE-C-')) {
      const matchPry = CUENTAS_AUXILIARES_EXACTAS_AGOSTO_2026.find(p => p.cuentaAuxiliar === s.cuentaAuxiliarCodigo);
      const nombreLimpio = matchPry ? matchPry.proyectoCorto : s.proyecto.replace(/^[A-Z0-9-]+:\\s*/, '');
      s.proyecto = \`\${s.cuentaAuxiliarCodigo}: \${nombreLimpio}\`;
      s.esProyectoExterno = true;
    }

    if (!s.tipo) s.tipo = s.categoria;
    if (!s.subcategoria) {
      if (s.categoria === 'Materiales Directos') s.subcategoria = 'Perfiles / Estructura';
      else if (s.categoria === 'Servicios') s.subcategoria = 'Supervisión e Inspección Técnica';
      else if (s.categoria === 'Mano de Obra Directa') s.subcategoria = 'Nómina Cuadrillas';
      else if (s.categoria === 'Horas Maquina') s.subcategoria = 'Mecanizado Taller';
      else s.subcategoria = 'Consumibles de Taller';
    }
    if (!s.solicitante) s.solicitante = s.responsable || 'Almacén Central SIP';
    if (!s.motivo) s.motivo = s.observaciones || \`Despacho operativo para \${s.proyecto}\`;
    if (s.esProyectoExterno === undefined) {
      s.esProyectoExterno = s.cuentaAuxiliarCodigo.startsWith('TTE-C-');
    }
  });

  return salidas;
}
`;

fs.writeFileSync('src/data/mockCostosTimaca.ts', header + '\n' + newFunction, 'utf8');
console.log('src/data/mockCostosTimaca.ts updated successfully!');
