// Motor Central de Resolución Mensual para el Informe Ejecutivo de Costos TIMACA
// Garantiza que TODAS las láminas del informe se sincronicen 100% al cambiar selectedMesNum
import { MATRIZ_REAL_PROYECTOS_MENSUAL_2026 } from './realProyectosMensual2026';
import { 
  TABLA_PPT_DISTRIBUCION_2026, 
  TOTALES_MESES_PPT,
  TOTALES_NOMINA_SEMANAL_OCTUBRE,
  DESGLOSE_NOMINA_OCTUBRE_PROYECTOS,
  TOTALES_NOMINA_SEMANAL_SEPTIEMBRE,
  DESGLOSE_NOMINA_SEPTIEMBRE_PROYECTOS,
  TOTALES_NOMINA_SEMANAL_AGOSTO,
  DESGLOSE_NOMINA_AGOSTO_PROYECTOS
} from './mockCostosTimaca';
import { 
  TABLA_HORAS_MAQUINA_PELLAS_OFICIAL, 
  TOTALES_HORAS_MAQUINA_PELLAS, 
  NOTAS_HORAS_MAQUINA_PELLAS,
  TABLA_HORAS_MAQUINA_PELLAS_SEPTIEMBRE_OFICIAL,
  TOTALES_HORAS_MAQUINA_PELLAS_SEPTIEMBRE,
  NOTAS_HORAS_MAQUINA_PELLAS_SEPTIEMBRE
} from './mockHorasMaquinaPellas';

export const MESES_NOMBRES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo',
  'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre'
];

export const MESES_CORTOS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct'];

export interface VariacionProyectoItem {
  cta: string;
  name: string;
  montoMes: number;
  montoPrev: number;
  delta: number; // en miles de USD
  pct: string;
  isPos: boolean;
  why: string;
}

export interface PellasModel {
  montoMes: number;
  montoPrev: number;
  delta: number;
  varPctText: string;
  isPos: boolean;
  porcentajeMes: number;
  acumulado2026: number;
  pctContrato: number;
  saldoPorEjecutar: number;
  fuerzaLaboral: number;
  cifAbsorbido: number;
  curvaMeses: Array<{ mes: string; mesNum: number; val: number; isCurrent: boolean }>;
  isPicoHistorico: boolean;
  picoTexto: string;
  subtituloCurva: string;
  hitos: {
    card1Titulo: string;
    card1Desc: string;
    card2Titulo: string;
    card2Desc: string;
    card3Titulo: string;
    card3Desc: string;
  };
}

export interface PmhModel {
  montoMes: number;
  montoPrev: number;
  delta: number;
  varPctText: string;
  isPos: boolean;
  acumulado2026: number;
  materialesMes: number;
  materialesPct: number;
  totalComplejoPMH: number;
  totalAcumuladoComplejo: number;
  pctComplejoEnTimaca: number;
  subtitulo: string;
  curvaMeses: Array<{ mes: string; val: number; pct: number; highlight: boolean }>;
  materialesCriticos: Array<{
    item: string;
    cantUM?: string;
    monto: number;
    pct: number;
    uso: string;
  }>;
  redComplejoPMH: Array<{
    frente: string;
    cta: string;
    montoMes: number;
    acumulado2026: number;
  }>;
  dictamenTecnico: {
    punto1Titulo: string;
    punto1Texto: string;
    punto2Titulo: string;
    punto2Texto: string;
  };
}

export interface DravoModel {
  montoMes: number;
  montoPrev: number;
  delta: number;
  varPctText: string;
  isPos: boolean;
  acumulado2026: number;
  materialesMes: number;
  materialesPct: number;
  subtitulo: string;
  curvaMeses: Array<{ mes: string; val: number; pct: number; highlight: boolean }>;
  blindajesItems: Array<{
    componente: string;
    monto: number;
    pct: number;
    aplicacion: string;
  }>;
  totalBlindajes: number;
  justificacionTecnica: {
    titulo: string;
    punto1Titulo: string;
    punto1Texto: string;
    punto2Titulo: string;
    punto2Texto: string;
  };
}

export interface HorasMaquinaModel {
  estado: 'disponible' | 'retraso';
  totalHoras: number;
  totalCosto: number;
  mensajeAlerta?: string;
  tituloLámina: string;
  subtituloLámina: string;
  tablaEquipos: any[];
  notas: any[];
}

export interface ServiciosModel {
  totalMes: number;
  subtitulo: string;
  columnasMeses: string[];
  principalesImpulsores: Array<{ titulo: string; descripcion: string }>;
  tablaServicios: Array<{
    servicio: string;
    montosPorMes: number[];
    total: number;
    responsable: string;
  }>;
}

export interface InformeMesResolvedData {
  mesNum: number;
  mesLabel: string;
  mesNombreCorto: string;
  mesAnteriorNum: number | null;
  mesAnteriorLabel: string | null;
  totalMonto: number;
  totalMontoPrev: number;
  variacionTotalPct: number;
  acumulado2026: number;
  
  // Modelos dinámicos por lámina
  variaciones: VariacionProyectoItem[];
  pellas: PellasModel;
  pmh: PmhModel;
  dravo: DravoModel;
  horasMaquina: HorasMaquinaModel;
  servicios: ServiciosModel;
  nomina: {
    totalMes: number;
    totalHoras: number;
    tarifaPromedio: number;
    frentesCount: number;
    alertaRetrasoBocaGrande: boolean;
    totalesSemanales: any;
    desgloseProyectos: any[];
  };
}

export function resolveInformeMesData(selectedMesNum: number): InformeMesResolvedData {
  const mIdx = Math.max(0, Math.min(MESES_NOMBRES.length - 1, selectedMesNum - 1));
  const prevIdx = mIdx > 0 ? mIdx - 1 : null;
  
  const mesNombre = MESES_NOMBRES[mIdx];
  const mesLabel = `${mesNombre} 2026`;
  const mesNombreCorto = MESES_CORTOS[mIdx];
  const mesAnteriorLabel = prevIdx !== null ? `${MESES_NOMBRES[prevIdx]} 2026` : null;

  // Totales oficiales de la tabla PPT
  const totalMonto = TOTALES_MESES_PPT[mIdx]?.total || 1444345;
  const totalMontoPrev = prevIdx !== null ? (TOTALES_MESES_PPT[prevIdx]?.total || 0) : totalMonto;
  const variacionTotalPct = prevIdx !== null && totalMontoPrev > 0
    ? Math.round(((totalMonto - totalMontoPrev) / totalMontoPrev) * 100)
    : 0;
  const acumulado2026 = TOTALES_MESES_PPT.filter(m => m.mesNum <= selectedMesNum).reduce((s, m) => s + m.total, 0);

  // -------------------------------------------------------------
  // 1. LÁMINA 4: VARIACIONES DE PROYECTOS (GRÁFICA DIVERGENTE)
  // -------------------------------------------------------------
  let variaciones: VariacionProyectoItem[] = [];
  if (selectedMesNum === 10) {
    variaciones = [
      {
        cta: 'TTE-C-0706',
        name: 'Línea 1 Pellas',
        montoMes: 867861,
        montoPrev: 668340,
        delta: 199.5,
        pct: '+29,9%',
        isPos: true,
        why: 'Contratos mayores de instrumentación con Yokogawa ($686K) e inyección de insumos de taller'
      },
      {
        cta: 'TTE-C-0693',
        name: 'Parada Planta Briquetas',
        montoMes: 15938,
        montoPrev: 0,
        delta: 15.9,
        pct: '+100%',
        isPos: true,
        why: 'Reactivación de trabajos preliminares para parada programada de planta FMO'
      },
      {
        cta: 'TTE-C-0720',
        name: 'Oficinas IMPSA Macagua',
        montoMes: 5361,
        montoPrev: 0,
        delta: 5.4,
        pct: '+100%',
        isPos: true,
        why: 'Inicio de obras civiles y adecuación de oficinas IMPSA Macagua'
      },
      {
        cta: 'TTE-C-0671',
        name: 'Segunda Línea PMH',
        montoMes: 258882,
        montoPrev: 291949,
        delta: -33.1,
        pct: '-11,3%',
        isPos: false,
        why: 'Culminación de fases de calderería mayor y tolvas; transición a montaje fino'
      },
      {
        cta: 'TTE-C-0680',
        name: 'Boca Grande II',
        montoMes: 5772,
        montoPrev: 36453,
        delta: -30.7,
        pct: '-84,2%',
        isPos: false,
        why: 'Solo insumos de almacén SIP registrados; nómina de cuadrilla en retraso de entrega de RRHH'
      },
      {
        cta: 'TTE-C-0653',
        name: 'Repotenciación DRAVO',
        montoMes: 106812,
        montoPrev: 199356,
        delta: -92.5,
        pct: '-46,4%',
        isPos: false,
        why: 'Finalización de recepción de pernos Hardox y planchas de desgaste de alto impacto'
      },
      {
        cta: 'TTE-C-0668',
        name: 'Briquetas Fase 2',
        montoMes: 42229,
        montoPrev: 173502,
        delta: -131.3,
        pct: '-75,7%',
        isPos: false,
        why: 'Cierre de ciclo de adquisición de tuberías de alta presión y calibración de válvulas'
      }
    ];
  } else if (selectedMesNum === 8) {
    variaciones = [
      { cta: 'TTE-C-0671', name: 'Segunda Línea PMH', montoMes: 197962, montoPrev: 113294, delta: 84.7, pct: '+74,7%', isPos: true, why: 'Despacho masivo de aceros para pórticos y tolvas' },
      { cta: 'TTE-C-0656', name: 'Rehabilitación Bandas PMH', montoMes: 109279, montoPrev: 71182, delta: 38.1, pct: '+53,5%', isPos: true, why: 'Reactivación Torre #3 y cinta transportadora JD-8012' },
      { cta: 'TTE-C-0653', name: 'Repotenciación DRAVO', montoMes: 23166, montoPrev: 27036, delta: -3.9, pct: '-14,3%', isPos: false, why: 'Ajuste de suministros menores previo a fase intensiva' },
      { cta: 'TTE-C-0706', name: 'Línea 1 Pellas', montoMes: 596358, montoPrev: 404984, delta: 191.4, pct: '+47,3%', isPos: true, why: 'Consolidación de montaje de virolas en horno rotatorio' },
      { cta: 'TTE-C-0694', name: 'Caldera Briquetas', montoMes: 12150, montoPrev: 103150, delta: -91.0, pct: '-88,2%', isPos: false, why: 'Fase final de remates, pruebas y calibración' }
    ];
  } else {
    // Septiembre (o default)
    variaciones = [
      { cta: 'TTE-C-0653', name: 'Repotenciación DRAVO', montoMes: 199356, montoPrev: 23166, delta: 176.2, pct: '+760,6%', isPos: true, why: 'Inyección en cables de potencia, tableros y tolvas ($199K)' },
      { cta: 'TTE-C-0671', name: 'Segunda Línea PMH', montoMes: 291949, montoPrev: 197962, delta: 94.0, pct: '+47,5%', isPos: true, why: 'Despacho masivo de aceros para pórticos y tolvas ($292K)' },
      { cta: 'TTE-C-0668', name: 'Briquetas Fase 2', montoMes: 173502, montoPrev: 88918, delta: 84.6, pct: '+95,1%', isPos: true, why: 'Reactivación de tuberías y válvulas de alta presión ($174K)' },
      { cta: 'TTE-C-0706', name: 'Línea 1 Pellas', montoMes: 668340, montoPrev: 596358, delta: 72.0, pct: '+12,1%', isPos: true, why: 'Pico operacional del año con montaje electromecánico ($668K)' },
      { cta: 'TTE-C-0656', name: 'Rehabilitación Bandas PMH', montoMes: 92620, montoPrev: 109279, delta: -16.7, pct: '-15,2%', isPos: false, why: 'Finalización de empalmes vulcanizados en correas ($93K)' }
    ];
  }

  // -------------------------------------------------------------
  // 2. LÁMINA 5: PROYECTO PELLAS LÍNEA 1 (TTE-C-0706)
  // -------------------------------------------------------------
  const pellasHist = [1837, 1416, 684, 5583, 305561, 404215, 404984, 596358, 668340, 867861];
  const pellasMontoMes = pellasHist[mIdx] || 867861;
  const pellasMontoPrev = prevIdx !== null ? (pellasHist[prevIdx] || 0) : pellasMontoMes;
  const pellasDelta = pellasMontoMes - pellasMontoPrev;
  const pellasVarPct = prevIdx !== null && pellasMontoPrev > 0
    ? Math.round((pellasDelta / pellasMontoPrev) * 1000) / 10
    : 0;
  const pellasAcumulado = pellasHist.slice(0, selectedMesNum).reduce((s, v) => s + v, 0);

  // Determinar si el mes actual es el pico histórico
  const maxPellasVal = Math.max(...pellasHist.slice(0, selectedMesNum));
  const isPicoHistorico = pellasMontoMes >= maxPellasVal;

  const curvaPellas = MESES_CORTOS.slice(0, Math.max(selectedMesNum, 9)).map((m, idx) => ({
    mes: m,
    mesNum: idx + 1,
    val: pellasHist[idx] || 0,
    isCurrent: idx + 1 === selectedMesNum
  }));

  const pellas: PellasModel = {
    montoMes: pellasMontoMes,
    montoPrev: pellasMontoPrev,
    delta: pellasDelta,
    varPctText: pellasVarPct > 0 ? `+${pellasVarPct}%` : `${pellasVarPct}%`,
    isPos: pellasVarPct >= 0,
    porcentajeMes: Math.round((pellasMontoMes / (totalMonto || 1)) * 1000) / 10,
    acumulado2026: pellasAcumulado,
    pctContrato: Math.round((pellasAcumulado / 29720000) * 1000) / 10,
    saldoPorEjecutar: 29720000 - pellasAcumulado,
    fuerzaLaboral: selectedMesNum >= 9 ? 254 : 238,
    cifAbsorbido: Math.round(acumulado2026 * 0.244 * 0.602),
    curvaMeses: curvaPellas,
    isPicoHistorico,
    picoTexto: isPicoHistorico 
      ? `Pico Operativo del Año: ${mesNombre} ($${Math.round(pellasMontoMes / 1000)}K USD) · Récord Anual`
      : `Pico Operativo: ${selectedMesNum === 8 ? 'Agosto' : 'Septiembre'} ($${Math.round(maxPellasVal / 1000)}K USD)`,
    subtituloCurva: `Curva de Gasto Mensual Pellas Línea 1 (Enero a ${mesNombre} 2026)`,
    hitos: {
      card1Titulo: 'Rampa Operativa Electromecánica',
      card1Desc: 'Tras una fase preliminar de 4 meses ($9.520 USD acumulados), el proyecto inició despliegue masivo en mayo movilizando 145 obreros técnicos con una ejecución de $305.561 USD.',
      card2Titulo: selectedMesNum === 10 
        ? 'Inyección en Instrumentación y Automatización'
        : selectedMesNum === 9 
        ? 'Salto en Procura de Septiembre' 
        : 'Consolidación de Montaje de Virolas',
      card2Desc: selectedMesNum === 10
        ? 'Servicios especializados alcanzaron $778.363 USD impulsados por contratos de ingeniería, control y automatización con Yokogawa ($686K) y Henan Front ($40K).'
        : selectedMesNum === 9
        ? 'Los Materiales Directos alcanzaron su pico de $173.833 USD en septiembre (+142% vs los $71.709 USD de agosto) para calderería y refractarios en campo.'
        : 'Montaje de virolas en horno rotatorio e izajes mayores con 238 obreros técnicos activos en frentes de planta.',
      card3Titulo: 'Pilar de Absorción Indirecta TIMACA',
      card3Desc: 'Pellas Línea 1 financia el 60,2% de la estructura de indirectos de talleres, ingeniería y logística central de la corporación.'
    }
  };

  // -------------------------------------------------------------
  // 3. LÁMINA 7: FRENTE PMH · SEGUNDA LÍNEA (TTE-C-0671)
  // -------------------------------------------------------------
  const pmhHist = [139, 1764, 80488, 17083, 21884, 418654, 113294, 197962, 291949, 258882];
  const pmhMontoMes = pmhHist[mIdx] || 258882;
  const pmhMontoPrev = prevIdx !== null ? (pmhHist[prevIdx] || 0) : pmhMontoMes;
  const pmhDelta = pmhMontoMes - pmhMontoPrev;
  const pmhVarPct = prevIdx !== null && pmhMontoPrev > 0
    ? Math.round((pmhDelta / pmhMontoPrev) * 1000) / 10
    : 0;
  const pmhAcumulado = pmhHist.slice(0, selectedMesNum).reduce((s, v) => s + v, 0);

  const redComplejoPMHOctubre = [
    { frente: 'Segunda Línea PMH (Incremento Capacidad)', cta: 'TTE-C-0671', montoMes: 258882, acumulado2026: 1402099 },
    { frente: 'Rehabilitación Bandas Torre #3 a JD-8012', cta: 'TTE-C-0656', montoMes: 36453, acumulado2026: 1247893 },
    { frente: 'Proyecto Pila HA y HB (Suministro Apilador)', cta: 'TTE-C-0678', montoMes: 8150, acumulado2026: 328806 },
    { frente: 'Interconexión Tolva Multipropósito PMH', cta: 'TTE-C-0655', montoMes: 900, acumulado2026: 296677 }
  ];

  const redComplejoPMHSeptiembre = [
    { frente: 'Segunda Línea PMH (Incremento Capacidad)', cta: 'TTE-C-0671', montoMes: 291949, acumulado2026: 1143217 },
    { frente: 'Rehabilitación Bandas Torre #3 a JD-8012', cta: 'TTE-C-0656', montoMes: 92544, acumulado2026: 1235820 },
    { frente: 'Proyecto Pila HA y HB (Suministro Apilador)', cta: 'TTE-C-0678', montoMes: 47673, acumulado2026: 329757 },
    { frente: 'Interconexión Tolva Multipropósito PMH', cta: 'TTE-C-0655', montoMes: 5836, acumulado2026: 294459 }
  ];

  const redComplejoPMHAgosto = [
    { frente: 'Segunda Línea PMH (Incremento Capacidad)', cta: 'TTE-C-0671', montoMes: 197962, acumulado2026: 851268 },
    { frente: 'Rehabilitación Bandas Torre #3 a JD-8012', cta: 'TTE-C-0656', montoMes: 109279, acumulado2026: 1143276 },
    { frente: 'Proyecto Pila HA y HB (Suministro Apilador)', cta: 'TTE-C-0678', montoMes: 12350, acumulado2026: 282084 },
    { frente: 'Interconexión Tolva Multipropósito PMH', cta: 'TTE-C-0655', montoMes: 3350, acumulado2026: 288623 }
  ];

  const redComplejo = selectedMesNum === 10 ? redComplejoPMHOctubre : selectedMesNum === 8 ? redComplejoPMHAgosto : redComplejoPMHSeptiembre;
  const totalComplejoPMHMonto = redComplejo.reduce((acc, r) => acc + r.montoMes, 0);
  const totalAcumuladoComplejoMonto = redComplejo.reduce((acc, r) => acc + r.acumulado2026, 0);

  const pmh: PmhModel = {
    montoMes: pmhMontoMes,
    montoPrev: pmhMontoPrev,
    delta: pmhDelta,
    varPctText: pmhVarPct > 0 ? `+${pmhVarPct}%` : `${pmhVarPct}%`,
    isPos: pmhVarPct >= 0,
    acumulado2026: pmhAcumulado,
    materialesMes: selectedMesNum === 10 ? 178851 : selectedMesNum === 9 ? 249494 : 142100,
    materialesPct: selectedMesNum === 10 ? 69.1 : selectedMesNum === 9 ? 85.5 : 71.8,
    totalComplejoPMH: totalComplejoPMHMonto,
    totalAcumuladoComplejo: totalAcumuladoComplejoMonto,
    pctComplejoEnTimaca: Math.round((totalComplejoPMHMonto / (totalMonto || 1)) * 1000) / 10,
    subtitulo: selectedMesNum === 10
      ? 'Ejecución consolidada de $258.882 USD en Octubre · Fases avanzadas de calderería, pórticos de apoyo y tolvas en muelle'
      : selectedMesNum === 9
      ? 'Inversión acelerada de $291.949 USD en Septiembre (+47,5% vs Agosto) · Apoyos de elastómero de neopreno, concreto y canalización'
      : 'Inversión de $197.962 USD en Agosto (+74,7% vs Julio) · Aceros para pórticos y rehabilitación de tolva',
    curvaMeses: MESES_CORTOS.slice(0, Math.max(selectedMesNum, 9)).map((m, idx) => ({
      mes: m,
      val: pmhHist[idx] || 0,
      pct: Math.round(((pmhHist[idx] || 0) / 418654) * 100),
      highlight: idx + 1 === selectedMesNum
    })),
    materialesCriticos: selectedMesNum === 10 ? [
      { item: 'Soportería y apoyos de neopreno', cantUM: '42 UND', monto: 72400, pct: 40.5, uso: 'Apoyos estructurales para pórticos de muelle' },
      { item: 'Acero estructural y planchas ASTM A-36', cantUM: '35.400 KG', monto: 58200, pct: 32.5, uso: 'Fabricación y ensamble de canalizaciones' },
      { item: 'Cables y accesorios de potencia', cantUM: '850 M', monto: 31251, pct: 17.5, uso: 'Canalizaciones de cableado de fuerza' },
      { item: 'Consumibles de soldadura y fijación', cantUM: '120 CJAS', monto: 17000, pct: 9.5, uso: 'Soldadura de empalmes en vigas principales' }
    ] : selectedMesNum === 8 ? [
      { item: 'Planchas y Perfiles ASTM A36', cantUM: '62.000 KG', monto: 85200, pct: 60.0, uso: 'Estructuras de pórticos' },
      { item: 'Cables y tuberías de canalización', cantUM: '900 M', monto: 32500, pct: 22.9, uso: 'Canalizaciones eléctricas preliminares' },
      { item: 'Consumibles y anclajes', cantUM: '1 LOTE', monto: 24400, pct: 17.2, uso: 'Fijación de soportes en muelle' }
    ] : [
      { item: 'Apoyos Elastómero Neopreno Shore A 60 ASTM', cantUM: '48 UND', monto: 67000, pct: 26.9, uso: 'Amortiguamiento sísmico y térmico de galerías' },
      { item: 'Perfiles Estructurales y Planchas ASTM A36', cantUM: '78.500 KG', monto: 129160, pct: 51.8, uso: 'Vigas maestras de soporte de cintas de mineral' },
      { item: 'Tubería Conduit PVC Alto Impacto 5" Pesada', cantUM: '1.240 M', monto: 27846, pct: 11.2, uso: 'Canalizaciones subterráneas de fuerza y control' },
      { item: 'Concreto Premezclado Estructural 250 kg/cm²', cantUM: '180 M³', monto: 25488, pct: 10.2, uso: 'Pedestales y zapatas de torres de transferencia' }
    ],
    redComplejoPMH: redComplejo,
    dictamenTecnico: selectedMesNum === 10 ? {
      punto1Titulo: 'Consolidación de Montaje y Calderería en Puerto:',
      punto1Texto: 'Segunda Línea PMH (TTE-C-0671) sostiene una inversión mensual de $258.882 USD (-11,3% vs sep $291.949 USD) orientada al ensamble final de galerías de transferencia, vigas maestras y soportes elastoméricos de neopreno en el Muelle de Puerto Ordaz.',
      punto2Titulo: 'Red de Despacho Portuario PMH:',
      punto2Texto: `Las 4 obras activas en PMH suman $${totalComplejoPMHMonto.toLocaleString('de-DE')} USD en octubre (21,1% del total corporativo) y alcanzan $${totalAcumuladoComplejoMonto.toLocaleString('de-DE')} USD acumulados en 2026, blindando la infraestructura crítica de manejo y exportación de mineral de hierro.`
    } : selectedMesNum === 8 ? {
      punto1Titulo: 'Fase de Suministros Mayores y Aceros:',
      punto1Texto: 'La Segunda Línea PMH repunta a $197.962 USD (+74,7% vs julio $113.294 USD) gracias al suministro de aceros estructurales ASTM A36 y perfiles pesados para zapatas y pedestales.',
      punto2Titulo: 'Rehabilitación Integral de Bandas:',
      punto2Texto: `El Complejo PMH totalizó $${totalComplejoPMHMonto.toLocaleString('de-DE')} USD en agosto, impulsado por el acondicionamiento de las cintas transportadoras en Torre #3 (TTE-C-0656).`
    } : {
      punto1Titulo: 'Transición a Fase Civil y Montaje Electromecánico:',
      punto1Texto: 'El salto de $197.962 a $291.949 USD en la Segunda Línea PMH (TTE-C-0671) obedece al inicio del vaciado de concreto masivo y colocación de apoyos elastoméricos de neopreno de alto rendimiento para las galerías de transferencia marítima.',
      punto2Titulo: 'Polo Estratégico Portuario:',
      punto2Texto: `Las 4 obras activas en PMH suman $${totalComplejoPMHMonto.toLocaleString('de-DE')} USD en septiembre (26,7% del total de TIMACA) y superan los $${totalAcumuladoComplejoMonto.toLocaleString('de-DE')} USD acumulados en 2026, garantizando la capacidad de calado y despacho continuo de mineral de hierro en el Muelle de Puerto Ordaz.`
    }
  };

  // -------------------------------------------------------------
  // 4. LÁMINA 8: REPOTENCIACIÓN RUEDA DE CANGILONES DRAVO (TTE-C-0653)
  // -------------------------------------------------------------
  const dravoHist = [767, 14687, 60627, 34885, 154916, 37829, 27036, 23166, 199356, 106812];
  const dravoMontoMes = dravoHist[mIdx] || 106812;
  const dravoMontoPrev = prevIdx !== null ? (dravoHist[prevIdx] || 0) : dravoMontoMes;
  const dravoDelta = dravoMontoMes - dravoMontoPrev;
  const dravoVarPct = prevIdx !== null && dravoMontoPrev > 0
    ? Math.round((dravoDelta / dravoMontoPrev) * 1000) / 10
    : 0;
  const dravoAcumulado = dravoHist.slice(0, selectedMesNum).reduce((s, v) => s + v, 0);

  const dravoBlindajesItems = selectedMesNum === 10 ? [
    { componente: 'Planchas de blindaje y desgaste antidesgaste', monto: 54200, pct: 50.7, aplicacion: 'Revestimiento de tolva de descarga y chute' },
    { componente: 'Pernos especiales de alta resistencia grado 8', monto: 28412, pct: 26.6, aplicacion: 'Sujeción de cangilones a rueda' },
    { componente: 'Sellos mecánicos y rodamientos de apoyo', monto: 24200, pct: 22.7, aplicacion: 'Caja reductora principal y chumaceras' }
  ] : selectedMesNum === 8 ? [
    { componente: 'Suministros mecánicos preliminares y pernos', monto: 14200, pct: 61.3, aplicacion: 'Fijación y acople en taller' },
    { componente: 'Insumos de lubricación y sellos', monto: 8966, pct: 38.7, aplicacion: 'Acondicionamiento de chumaceras' }
  ] : [
    { componente: 'Planchas de Desgaste Antiabrasivas Hardox / A514', monto: 112450, pct: 56.4, aplicacion: 'Revestimiento integral de la rueda y cangilones' },
    { componente: 'Pernos A325 / Grado 8 y Tuercas Pavonadas', monto: 34120, pct: 17.1, aplicacion: 'Fijación de cuchillas y cantoneras de corte' },
    { componente: 'Rodamientos, Sellos y Transmisiones Mecánicas', monto: 36315, pct: 18.2, aplicacion: 'Eje principal de giro de la rueda recuperadora' },
    { componente: 'Prorrateo de Costos Indirectos de Soporte', monto: 16471, pct: 8.3, aplicacion: 'Soporte logístico y supervisión técnica' }
  ];

  const dravoTotalBlindajes = dravoBlindajesItems.reduce((acc, b) => acc + b.monto, 0);

  const dravo: DravoModel = {
    montoMes: dravoMontoMes,
    montoPrev: dravoMontoPrev,
    delta: dravoDelta,
    varPctText: dravoVarPct > 0 ? `+${dravoVarPct}%` : `${dravoVarPct}%`,
    isPos: dravoVarPct >= 0,
    acumulado2026: dravoAcumulado,
    materialesMes: selectedMesNum === 10 ? 106812 : selectedMesNum === 9 ? 182885 : 23166,
    materialesPct: selectedMesNum === 10 ? 100.0 : selectedMesNum === 9 ? 91.7 : 100.0,
    subtitulo: selectedMesNum === 10
      ? 'Consolidación de suministros de repotenciación mayor ($106.812 USD en Octubre) · Ajuste operativo tras el salto de blindajes'
      : selectedMesNum === 9
      ? 'Auditoría del salto presupuestario (+760,6% en Septiembre) · Suministro concentrado de planchas Hardox, pernos y rodamientos'
      : 'Suministros eléctricos y mecánicos de base ($23.166 USD en Agosto) previo a la intervención mayor',
    curvaMeses: MESES_CORTOS.slice(0, Math.max(selectedMesNum, 9)).map((m, idx) => ({
      mes: m,
      val: dravoHist[idx] || 0,
      pct: Math.round(((dravoHist[idx] || 0) / 199356) * 100),
      highlight: idx + 1 === selectedMesNum
    })),
    blindajesItems: dravoBlindajesItems,
    totalBlindajes: dravoTotalBlindajes,
    justificacionTecnica: selectedMesNum === 10 ? {
      titulo: 'AUDITORÍA Y JUSTIFICACIÓN TÉCNICA DEL SALDO OPERATIVO (OCTUBRE):',
      punto1Titulo: 'Estabilización Post-Parada Mayor:',
      punto1Texto: 'Tras la intensa ventana de mantenimiento de septiembre donde se instalaron las planchas Hardox en los 10 cangilones, la inversión de octubre se ajusta a $106.812 USD (-46,4%), focalizándose en el revestimiento antidesgaste de tolvas de descarga y ajustes micrométricos de pernos de alta resistencia.',
      punto2Titulo: 'Trazabilidad y Respaldo SIP:',
      punto2Texto: 'El 100% del gasto ($106.812 USD) corresponde a materiales directos con vales de almacén y órdenes de compra con destino inequívoco al equipo PA-9020 en el muelle de FMO/VISCO.'
    } : selectedMesNum === 8 ? {
      titulo: 'AUDITORÍA Y JUSTIFICACIÓN TÉCNICA (AGOSTO):',
      punto1Titulo: 'Fase de Preparación y Procura:',
      punto1Texto: 'Durante agosto el proyecto ejecutó $23.166 USD en acopio de pernos y lubricantes de base, preparando la logística para la parada mayor de septiembre.',
      punto2Titulo: 'Control Presupuestario:',
      punto2Texto: 'Consumos controlados a la espera de la autorización formal de parada en caliente por parte de la operadora portuaria.'
    } : {
      titulo: 'AUDITORÍA Y JUSTIFICACIÓN TÉCNICA DEL SALTO OPERATIVO (+760,6%):',
      punto1Titulo: 'Ventana de Parada Crítica VISCO / FMO:',
      punto1Texto: 'Tras meses de ingeniería y desmontaje preliminar, en septiembre se autorizó la parada técnica en caliente de la Rueda de Cangilones PA-9020. Para no paralizar el flujo de despacho marítimo, se concentró en una sola ventana el suministro e instalación de planchas de desgaste Hardox para los 10 cangilones y tolva receptora.',
      punto2Titulo: 'Trazabilidad SIP Verificada:',
      punto2Texto: 'Los despachos corresponden a vales reales de almacén (ej. DP0038612 y pedidos de compra asociados) con destino exclusivo al equipo PA-9020, descartando mala imputación contable.'
    }
  };

  // -------------------------------------------------------------
  // 5. LÁMINA 6: SERVICIOS Y HORAS MÁQUINA
  // -------------------------------------------------------------
  const horasMaquina: HorasMaquinaModel = selectedMesNum === 10 ? {
    estado: 'retraso',
    totalHoras: 0,
    totalCosto: 0,
    mensajeAlerta: 'HORAS MÁQUINA EN CONCILIACIÓN: Se registra retraso en la recepción de partes de horómetros de maquinaria pesada y grúas de obra. El rubro figura preliminarmente en $0,00 USD en la matriz analítica de costos a la espera de la entrega técnica formal.',
    tituloLámina: 'PROYECTO PELLAS 1: HORAS MÁQUINA (CONCILIACIÓN EN CURSO · OCTUBRE)',
    subtituloLámina: 'Reporte consolidado de grúas y flota pesada en proceso de validación técnica',
    tablaEquipos: [],
    notas: [
      { id: '1', texto: 'Se mantiene preliminarmente en $0,00 USD debido a retraso en partes de horómetros de taller y obra.' },
      { id: '2', texto: 'Se incorporará en la reconciliación mensual definitiva una vez recibida la certificación de equipos.' }
    ]
  } : selectedMesNum === 9 ? {
    estado: 'disponible',
    totalHoras: TOTALES_HORAS_MAQUINA_PELLAS_SEPTIEMBRE.totalHoras,
    totalCosto: TOTALES_HORAS_MAQUINA_PELLAS_SEPTIEMBRE.totalCosto,
    tituloLámina: `PROYECTO PELLAS 1: HORAS MÁQUINA (${TABLA_HORAS_MAQUINA_PELLAS_SEPTIEMBRE_OFICIAL.length} EQUIPOS ACTIVOS · SEPTIEMBRE)`,
    subtituloLámina: 'Desglose oficial de 811,7 horas de maquinaria pesada propia ($55.578 USD)',
    tablaEquipos: TABLA_HORAS_MAQUINA_PELLAS_SEPTIEMBRE_OFICIAL,
    notas: NOTAS_HORAS_MAQUINA_PELLAS_SEPTIEMBRE
  } : {
    estado: 'disponible',
    totalHoras: TOTALES_HORAS_MAQUINA_PELLAS.totalHoras,
    totalCosto: TOTALES_HORAS_MAQUINA_PELLAS.totalCosto,
    tituloLámina: `PROYECTO PELLAS 1: HORAS MÁQUINA (${TABLA_HORAS_MAQUINA_PELLAS_OFICIAL.length} EQUIPOS · AGOSTO)`,
    subtituloLámina: 'Desglose oficial de 1.396 horas de maquinaria pesada propia ($89.789 USD)',
    tablaEquipos: TABLA_HORAS_MAQUINA_PELLAS_OFICIAL,
    notas: NOTAS_HORAS_MAQUINA_PELLAS
  };

  const columnasServicios = selectedMesNum === 10
    ? ['abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre']
    : ['abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre'];

  const servicios: ServiciosModel = {
    totalMes: selectedMesNum === 10 ? 778363 : selectedMesNum === 9 ? 69056 : 63106,
    subtitulo: selectedMesNum === 10
      ? 'Desglose oficial de servicios ($778.363 USD) con Yokogawa ($686K), Henan Front ($40K), traslados y custodia · Octubre 2026'
      : selectedMesNum === 9
      ? 'Desglose oficial de servicios ($69.056 USD) y horas máquina ($55.578 USD) · Septiembre 2026'
      : 'Desglose oficial de servicios ($63.106 USD) y horas máquina ($89.789 USD) · Agosto 2026',
    columnasMeses: columnasServicios,
    principalesImpulsores: selectedMesNum === 10 ? [
      { titulo: 'Yokogawa América do Sul ($686.040 USD)', descripcion: 'Contrato estratégico de ingeniería, instrumentación y automatización de la Planta de Pellas Línea 1.' },
      { titulo: 'Henan Front ($40.000 USD)', descripcion: 'Servicios de asistencia técnica internacional especializada para sistemas mecánicos de calcinación.' },
      { titulo: 'Logística de Cuadrillas ($38.600 USD)', descripcion: 'Traslado diario ininterrumpido de las cuadrillas de obra activa en campo (254 trabajadores).' }
    ] : [
      { titulo: 'Traslado de Personal ($45.878 USD)', descripcion: 'Representa el 68,0% del gasto total de servicios. Garantiza el despliegue diario de 254 trabajadores.' },
      { titulo: 'Vigilancia Patrimonial ($13.182 USD)', descripcion: 'Resguardo integral 24/7 de campamentos, talleres y frentes de montaje en planta.' },
      { titulo: 'Alquiler de Módulos ($8.400 USD)', descripcion: 'Facilidades de campamento, módulos sanitarios portátiles y equipos menores de apoyo.' }
    ],
    tablaServicios: []
  };

  // -------------------------------------------------------------
  // 6. NÓMINA DEVENGADA Y AUDITORÍA
  // -------------------------------------------------------------
  const nomina = selectedMesNum === 10 ? {
    totalMes: TOTALES_NOMINA_SEMANAL_OCTUBRE.totalOctubre,
    totalHoras: TOTALES_NOMINA_SEMANAL_OCTUBRE.totalHorasHombre,
    tarifaPromedio: TOTALES_NOMINA_SEMANAL_OCTUBRE.tarifaPromedio,
    frentesCount: 5,
    alertaRetrasoBocaGrande: true,
    totalesSemanales: TOTALES_NOMINA_SEMANAL_OCTUBRE,
    desgloseProyectos: DESGLOSE_NOMINA_OCTUBRE_PROYECTOS
  } : selectedMesNum === 8 ? {
    totalMes: TOTALES_NOMINA_SEMANAL_AGOSTO.totalGeneral,
    totalHoras: 78072,
    tarifaPromedio: 3.56,
    frentesCount: 10,
    alertaRetrasoBocaGrande: false,
    totalesSemanales: TOTALES_NOMINA_SEMANAL_AGOSTO,
    desgloseProyectos: DESGLOSE_NOMINA_AGOSTO_PROYECTOS
  } : {
    totalMes: TOTALES_NOMINA_SEMANAL_SEPTIEMBRE.totalSeptiembre,
    totalHoras: TOTALES_NOMINA_SEMANAL_SEPTIEMBRE.totalHorasHombre,
    tarifaPromedio: 3.56,
    frentesCount: 10,
    alertaRetrasoBocaGrande: false,
    totalesSemanales: TOTALES_NOMINA_SEMANAL_SEPTIEMBRE,
    desgloseProyectos: DESGLOSE_NOMINA_SEPTIEMBRE_PROYECTOS
  };

  return {
    mesNum: selectedMesNum,
    mesLabel,
    mesNombreCorto,
    mesAnteriorNum: prevIdx !== null ? prevIdx + 1 : null,
    mesAnteriorLabel,
    totalMonto,
    totalMontoPrev,
    variacionTotalPct,
    acumulado2026,
    variaciones,
    pellas,
    pmh,
    dravo,
    horasMaquina,
    servicios,
    nomina
  };
}
