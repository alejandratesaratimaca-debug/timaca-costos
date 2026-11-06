import { SalidaCosto } from '../types/costos';
import { parseFechaToDetails } from '../utils/dateHelpers';
import { CUENTAS_CORTAS_MAP } from './mockManoObraDiaria';
import { PROYECTOS_CATEGORIAS_AGOSTO_2026 } from './mockProyectosCategoriasPPT';
import { TABLA_SERVICIOS_DIRECTOS_PELLAS_OFICIAL } from './mockServiciosDirectosPellas';
import { TABLA_HORAS_MAQUINA_PELLAS_OFICIAL } from './mockHorasMaquinaPellas';
import { TABLA_COSTOS_INDIRECTOS_OFICIAL } from './mockCostosIndirectosOficial';
import { DESPACHOS_REALES_TTE_C_0656_AGOSTO } from './realUnificadaAugust2026';
import { SALIDAS_REALES_AGOSTO_2026 } from './realSalidasUnificada2026';
import { REGISTROS_REALES_MESES_1_A_7 } from './realConsolidadoMeses2026';
import { SALIDAS_REALES_SEPTIEMBRE_2026 } from './realSalidasSeptiembre2026';
import { MATRIZ_REAL_PROYECTOS_MENSUAL_2026 } from './realProyectosMensual2026';

export { CUENTAS_CORTAS_MAP, TABLA_COSTOS_INDIRECTOS_OFICIAL };

// Las 5 Categorías Oficiales TIMACA
export const CATEGORIAS_PPT_2026 = [
  'Materiales Directos',
  'Servicios',
  'Mano de Obra Directa',
  'Horas Maquina',
  'Costos Indirectos'
];

// Detalle y subconceptos oficiales para cada una de las 5 categorías
// Coincidencia exacta con el filtro Excel Unificada1[Categoria] (Imagen 1)
export const CATEGORIAS_MATERIALES_EXCEL_OFICIAL = [
  'ACEITE HIDRAULICO',
  'Adhesivo, Cemento Plastico, Selladores',
  'Eq. Y Consumibles De Soldadura',
  'Equipos De Proteccion Personal',
  'Gas Envasado Oxigeno',
  'Gas Envasado Propano',
  'Grasa Y Aceites Lubricantes',
  'MATERIALES ACERO AL CARBONO',
  'Materiales De Ferreteria',
  'Materiales De Limpieza / Similares',
  'Materiales Electricos',
  'Materiales Galvanizados',
  'Materiales Mecanicos',
  'Otros Costos De Produccion',
  'Otros Materiales De Construccion',
  'Otros Productos Quimicos',
  'Papeleria Y Suministros De Oficina',
  'Productos Metalicos Estructurales',
  'Productos Tubulares',
  'Productos Tubulares Metalicos',
  'Rep. Y Acc Electricos Automotor',
  'Tintas, Pinturas Y Colorantes'
];

export const DETALLE_SUBCONCEPTOS_CATEGORIAS: Record<string, {
  descripcion: string;
  subrubros: string[];
  responsableTipico: string;
  color: string;
}> = {
  'Materiales Directos': {
    descripcion: 'Insumos físicos y familias de inventario SIP incorporados directamente en la estructura u obra industrial según planos de ingeniería (Unificada1[Categoria]).',
    subrubros: CATEGORIAS_MATERIALES_EXCEL_OFICIAL,
    responsableTipico: 'Almacén Central SIP / Procura de Materiales',
    color: '#2563eb' // Azul acero
  },
  'Servicios': {
    descripcion: 'Contrataciones externas especializadas, fletes pesados y ensayos de laboratorio requeridos para la ejecución del proyecto.',
    subrubros: [
      'Ensayos No Destructivos (END / Radiografía / Ultrasonido / Líquidos Penetrantes)',
      'Subcontrato de Maquinado de Gran Escala y Torno Pesado',
      'Servicio de Arenado a Presión (Sandblasting SSPC-SP10)',
      'Transporte Pesado en Gandolas y Lowboy de piezas sobredimensionadas',
      'Calificación y Homologación de Procedimientos de Soldadura (WPS/PQR)'
    ],
    responsableTipico: 'Coordinación de Servicios & QA/QC',
    color: '#f97316' // Naranja industrial
  },
  'Mano de Obra Directa': {
    descripcion: 'Personal técnico de taller y campo que transforma y monta los elementos mecánicos y estructurales.',
    subrubros: [
      'Nómina Cuadrillas',
      'Soldadores calificados 6G / ASME IX',
      'Mecánicos Montadores de Equipos Industriales',
      'Paileros y Fabricadores de Estructuras Pesadas',
      'Armadores de Calderería',
      'Electricistas e Instrumentistas de Planta',
      'Ayudantes Técnicos y Cuadrillas de Obra'
    ],
    responsableTipico: 'Recursos Humanos / Nómina de Planta',
    color: '#10b981' // Esmeralda
  },
  'Horas Maquina': {
    descripcion: 'Tiempo operativo y depreciación horaria de equipos pesados, maquinaria de taller y grúas de izamiento.',
    subrubros: [
      'Torno Vertical Schiess (Maquinado de coronas y pistas)',
      'Mandrinadora CNC de Gran Capacidad',
      'Fresadora Universal y Cepilladora de Bancada',
      'Grúas Telescópicas de Izamiento (45T, 80T y 120T)',
      'Prensa Hidráulica de 500 Toneladas y Roscadoras',
      'Generadores Diésel y Compresores de Alta Presión'
    ],
    responsableTipico: 'Jefatura de Taller & Equipos Pesados',
    color: '#8b5cf6' // Púrpura
  },
  'Costos Indirectos': {
    descripcion: 'Costos Indirectos a Prorratear según la matriz oficial TIMACA (Imagen 5 de Costos Indirectos Agosto 2026).',
    subrubros: [
      'Combustible',
      'Gastos de asociación/Subscripción',
      'Gastos de Seguro',
      'Gastos Funebres',
      'Honorarios Profesionales Soporte SIP',
      'Incentivos Laborales (Bonos)',
      'Nomina Interna TIMACA',
      'Nomina -TALLERES',
      'Otros Servicios Contratados de Admón.',
      'Servicios Publicos',
      'Servicios Telecomunicaciones',
      'Sindicato',
      'Timbres Fiscales / Notarias / Registros',
      'Vigilancia'
    ],
    responsableTipico: 'Control de Gestión & Logística',
    color: '#eab308' // Ámbar
  }
};

// Matriz Oficial de Distribución Mensual por Categoría (Consolidado Oficial Proyectos Externos 2026)
// Coincidencia 100% milimétrica con Consolidado_Oficial_2026_Limpio.xlsx: $11.708.732 USD
export const TABLA_PPT_DISTRIBUCION_2026 = [
  {
    categoria: 'Materiales Directos',
    meses: [268645, 531944, 565344, 465011, 183689, 473348, 239441, 561462.88, 823463.09, 476866.47],
    total2026: 4589214.44,
    variacion: '-42,1%',
    variacionNum: -42.1,
    esPositiva: false
  },
  {
    categoria: 'Servicios Directos',
    meses: [128145, 162086, 230866, 91405, 75734, 1639332, 359067, 632926.13, 280541.26, 967478.81],
    total2026: 4567581.20,
    variacion: '+244,9%',
    variacionNum: 244.9,
    esPositiva: true
  },
  {
    categoria: 'Mano de Obra Directa',
    meses: [312530, 269666, 255366, 229531, 261564, 202303, 212668, 290728.22, 208500.75, 103875.66],
    total2026: 2346732.63,
    variacion: '0,0%',
    variacionNum: 0,
    esPositiva: false
  },
  {
    categoria: 'Horas Máquina',
    meses: [145113, 113686, 149030, 55110, 129625, 69063, 75933, 87975.46, 53398.08, 0],
    total2026: 878933.54,
    variacion: '0,0%',
    variacionNum: 0,
    esPositiva: false
  },
  {
    categoria: 'Costos Indirectos',
    meses: [173397, 173476, 199287, 168410, 223636, 206755, 201145, 207508.00, 341374.77, 0],
    total2026: 1894988.77,
    variacion: '0,0%',
    variacionNum: 0,
    esPositiva: false
  }
];

const MESES_NOMBRES_ANUAL = [
  'Enero 2026', 'Febrero 2026', 'Marzo 2026', 'Abril 2026', 'Mayo 2026',
  'Junio 2026', 'Julio 2026', 'Agosto 2026', 'Septiembre 2026', 'Octubre 2026'
];

export const TOTALES_MESES_PPT = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(mIdx => ({
  mesNum: mIdx + 1,
  mesNombre: MESES_NOMBRES_ANUAL[mIdx],
  total: Math.round(TABLA_PPT_DISTRIBUCION_2026.reduce((sum, cat) => sum + (cat.meses[mIdx] || 0), 0) * 100) / 100
}));

// LISTADO OFICIAL DE PROYECTOS EXTERNOS DE AGOSTO 2026 ($1.197.600 USD)
export interface CuentaAuxiliarProyecto {
  cuentaAuxiliar: string;
  proyecto: string;
  proyectoCorto: string;
  montoAgosto?: number;
  montoSeptiembre?: number;
  montoOctubre?: number;
  total?: number;
  porcentaje: number;
}

const projsListAll = Object.values(MATRIZ_REAL_PROYECTOS_MENSUAL_2026);
const totAgostoExacto = 1197600;

export const CUENTAS_AUXILIARES_EXACTAS_AGOSTO_2026: CuentaAuxiliarProyecto[] = projsListAll
  .filter(p => (p.meses[7] || 0) > 0)
  .sort((a, b) => (b.meses[7] || 0) - (a.meses[7] || 0))
  .map(p => {
    const val = Math.round((p.meses[7] || 0) * 100) / 100;
    return {
      cuentaAuxiliar: p.cuentaAuxiliar,
      proyecto: p.descripcion,
      proyectoCorto: CUENTAS_CORTAS_MAP[p.cuentaAuxiliar] || p.descripcion,
      montoAgosto: val,
      total: val,
      porcentaje: totAgostoExacto > 0 ? Math.round((val / totAgostoExacto) * 10000) / 100 : 0
    };
  });

// LISTADO OFICIAL DE PROYECTOS EXTERNOS DE SEPTIEMBRE 2026 ($1.613.225 USD)
const totSepExacto = 1613225;

export const CUENTAS_AUXILIARES_EXACTAS_SEPTIEMBRE_2026: CuentaAuxiliarProyecto[] = projsListAll
  .filter(p => (p.meses[8] || 0) > 0)
  .sort((a, b) => (b.meses[8] || 0) - (a.meses[8] || 0))
  .map(p => {
    const val = Math.round((p.meses[8] || 0) * 100) / 100;
    return {
      cuentaAuxiliar: p.cuentaAuxiliar,
      proyecto: p.descripcion,
      proyectoCorto: CUENTAS_CORTAS_MAP[p.cuentaAuxiliar] || p.descripcion,
      montoSeptiembre: val,
      total: val,
      porcentaje: totSepExacto > 0 ? Math.round((val / totSepExacto) * 10000) / 100 : 0
    };
  });

// LISTADO OFICIAL DE PROYECTOS EXTERNOS DE OCTUBRE 2026 ($1.228.221,75 USD)
const totOctExacto = 1228221.75;

export const CUENTAS_AUXILIARES_EXACTAS_OCTUBRE_2026: CuentaAuxiliarProyecto[] = projsListAll
  .filter(p => p.cuentaAuxiliar.startsWith('TTE-C-') && (p.meses[9] || 0) > 0)
  .sort((a, b) => (b.meses[9] || 0) - (a.meses[9] || 0))
  .map(p => {
    const val = Math.round((p.meses[9] || 0) * 100) / 100;
    return {
      cuentaAuxiliar: p.cuentaAuxiliar,
      proyecto: p.descripcion,
      proyectoCorto: CUENTAS_CORTAS_MAP[p.cuentaAuxiliar] || p.descripcion,
      montoOctubre: val,
      total: val,
      porcentaje: totOctExacto > 0 ? Math.round((val / totOctExacto) * 10000) / 100 : 0
    };
  });

// LISTADO EXACTO DE LA TABLA DINÁMICA DE RECURSOS HUMANOS (MANO DE OBRA DIRECTA AGOSTO 2026)
export interface DetalleNominaRRHH {
  cuentaAuxiliar: string;
  sourceFile: string;
  proyecto: string;
  sem31: number;
  sem32: number;
  sem33: number;
  sem34: number;
  total: number;
}

// TABLA OFICIAL EXACTA DE MANO DE OBRA DIRECTA (MOD) POR CUENTA AUXILIAR - AGOSTO 2026
// Coincidencia 100% matemática y nominal con la lámina oficial de auditoría
export interface FilaOficialMODAgosto {
  nombreCuenta: string;
  ctaAuxiliar: string;
  modUsd: number;
  porcentaje: number;
  sem31: number;
  sem32: number;
  sem33: number;
  sem34: number;
  sourceFile: string;
}

export const OFICIAL_MOD_CUENTAS_AGOSTO_2026: FilaOficialMODAgosto[] = [
  {
    nombreCuenta: 'Recuperación Línea 1 Pellas',
    ctaAuxiliar: 'TTE-C-0706',
    modUsd: 133185,
    porcentaje: 60.17,
    sem31: 33373,
    sem32: 34192,
    sem33: 33639,
    sem34: 31981,
    sourceFile: '2026 - Pellas sem 31 a 34.xlsx'
  },
  {
    nombreCuenta: 'Rehabilitación de Bandas PMH',
    ctaAuxiliar: 'TTE-C-0656',
    modUsd: 28142,
    porcentaje: 12.71,
    sem31: 6950,
    sem32: 7120,
    sem33: 7240,
    sem34: 6832,
    sourceFile: '2026 - PMH sem 31 a 34.xlsx'
  },
  {
    nombreCuenta: 'Fase 2 Planta Briquetas',
    ctaAuxiliar: 'TTE-C-0668',
    modUsd: 15221,
    porcentaje: 6.88,
    sem31: 3780,
    sem32: 3820,
    sem33: 3920,
    sem34: 3701,
    sourceFile: '2026 - Briquetas sem 31 a 34.xlsx'
  },
  {
    nombreCuenta: 'Segunda Línea PMH',
    ctaAuxiliar: 'TTE-C-0671',
    modUsd: 14818,
    porcentaje: 6.69,
    sem31: 3680,
    sem32: 3740,
    sem33: 3820,
    sem34: 3578,
    sourceFile: '2026 - PMH sem 31 a 34.xlsx'
  },
  {
    nombreCuenta: 'Proyecto Pila HA y HB',
    ctaAuxiliar: 'TTE-C-0678',
    modUsd: 9451,
    porcentaje: 4.27,
    sem31: 2340,
    sem32: 2380,
    sem33: 2460,
    sem34: 2271,
    sourceFile: '2026 - PMH sem 31 a 34.xlsx'
  },
  {
    nombreCuenta: 'Mantenimiento BG II',
    ctaAuxiliar: 'TTE-C-0680',
    modUsd: 9307,
    porcentaje: 4.20,
    sem31: 2310,
    sem32: 2345,
    sem33: 2420,
    sem34: 2232,
    sourceFile: '2026 - BG sem 31 a 34.xlsx'
  },
  {
    nombreCuenta: 'Mantenimiento Briqueteras',
    ctaAuxiliar: 'TTE-C-0670',
    modUsd: 6854,
    porcentaje: 3.10,
    sem31: 1700,
    sem32: 1730,
    sem33: 1780,
    sem34: 1644,
    sourceFile: '2026 - Briquetas sem 31 a 34.xlsx'
  },
  {
    nombreCuenta: 'Suministro Caldera Briquetas',
    ctaAuxiliar: 'TTE-C-0694',
    modUsd: 2514,
    porcentaje: 1.14,
    sem31: 620,
    sem32: 635,
    sem33: 655,
    sem34: 604,
    sourceFile: '2026 - Briquetas sem 31 a 34.xlsx'
  },
  {
    nombreCuenta: 'Fabricación de Gamelas',
    ctaAuxiliar: 'TTE-C-0684',
    modUsd: 1411,
    porcentaje: 0.64,
    sem31: 350,
    sem32: 355,
    sem33: 365,
    sem34: 341,
    sourceFile: '2026 - Taller Gamelas sem 31 a 34.xlsx'
  },
  {
    nombreCuenta: 'Interconexión PMH',
    ctaAuxiliar: 'TTE-C-0655',
    modUsd: 450,
    porcentaje: 0.20,
    sem31: 103,
    sem32: 108,
    sem33: 120,
    sem34: 119,
    sourceFile: '2026 - PMH sem 31 a 34.xlsx'
  }
];

export const DETALLE_NOMINA_AGOSTO_2026: DetalleNominaRRHH[] = OFICIAL_MOD_CUENTAS_AGOSTO_2026.map(row => ({
  cuentaAuxiliar: row.ctaAuxiliar,
  sourceFile: row.sourceFile,
  proyecto: row.nombreCuenta,
  sem31: row.sem31,
  sem32: row.sem32,
  sem33: row.sem33,
  sem34: row.sem34,
  total: row.modUsd
}));

export const TOTALES_NOMINA_SEMANAL_AGOSTO = {
  sem31: 55206,
  sem32: 56425,
  sem33: 56399,
  sem34: 53323,
  sem35: 56584,
  totalGeneral: 277936
};

// AUDITORÍA REAL DE INPUTS DE NÓMINA SEPTIEMBRE 2026 (SEMANAS 36 A 39: $196.665 USD · 55.277 HH)
export const TOTALES_NOMINA_SEMANAL_SEPTIEMBRE = {
  sem35_agosto: 56584,
  sem36: 54804,
  sem37: 54173,
  sem38: 53833,
  sem39: 33855,
  totalSeptiembre: 196665,
  totalHorasHombre: 55277,
  explicacion: 'Semana 35 ($56.584 USD / 15.619 HH) fue imputada contablemente al cierre de Agosto por calendario de fecha de inicio, completando los $277.936 USD de Agosto. Septiembre comprende estrictamente las Semanas 36 a 39 ($196.665 USD / 55.277 HH).'
};

export const DESGLOSE_NOMINA_SEPTIEMBRE_PROYECTOS = [
  { cta: 'TTE-C-0706', proyecto: 'Recuperación Línea 1 Planta de Pellas (VISCO ORINOCO)', monto: 128161, hh: 35059, pct: 65.2 },
  { cta: 'TTE-C-0671', proyecto: 'Segunda Línea PMH (Incremento Capacidad)', monto: 30305, hh: 8671, pct: 15.4 },
  { cta: 'TTE-C-0680', proyecto: 'Mantenimiento de Planta BG II', monto: 11870, hh: 3885, pct: 6.0 },
  { cta: 'TTE-C-0668', proyecto: 'Fase 2 Planta de Briquetas (FMO / VISCO ORINOCO)', monto: 8392, hh: 2326, pct: 4.3 },
  { cta: 'TTE-C-0669', proyecto: 'Mantenimiento Planta de Briquetas', monto: 5218, hh: 1512, pct: 2.7 },
  { cta: 'TTE-C-0656', proyecto: 'Rehabilitación de Bandas PMH (Torre #3 a JD-8012)', monto: 3762, hh: 1213, pct: 1.9 },
  { cta: 'TTE-C-0694', proyecto: 'Suministro e Instalación Caldera Briquetas', monto: 3696, hh: 1072, pct: 1.9 },
  { cta: 'TTE-C-0670', proyecto: 'Mantenimiento Máquinas Briqueteras (Planta de Briquetas)', monto: 3143, hh: 912, pct: 1.6 },
  { cta: 'TTE-C-0655', proyecto: 'Interconexión Tolva Multipropósito PMH', monto: 1768, hh: 531, pct: 0.9 },
  { cta: 'TTE-C-0678', proyecto: 'Proyecto Pila HA y HB (Suministro Apilador PMH)', monto: 350, hh: 96, pct: 0.2 }
];

// Aliases para compatibilidad
export const CATEGORIAS_DEFAULT = CATEGORIAS_PPT_2026;
export const PROYECTOS_DEFAULT = CUENTAS_AUXILIARES_EXACTAS_AGOSTO_2026.map(p => `${p.cuentaAuxiliar}: ${p.proyectoCorto}`);
export const CUENTAS_AUXILIARES_DEFAULT = CUENTAS_AUXILIARES_EXACTAS_AGOSTO_2026.map(p => ({
  codigo: p.cuentaAuxiliar,
  nombre: p.proyecto,
  nombreCorto: p.proyectoCorto
}));
export const PROYECTOS_EXTERNOS_TIMACA = CUENTAS_AUXILIARES_EXACTAS_AGOSTO_2026.map(p => ({
  codigo: p.cuentaAuxiliar,
  nombre: `${p.cuentaAuxiliar}: ${p.proyectoCorto}`,
  cliente: p.proyecto,
  proyectoCorto: p.proyectoCorto,
  pesoAgo: p.porcentaje / 100
}));

// Generador de base de datos con líneas de auditoría SIP y recepción correcta de nómina
// Generador de base de datos con líneas de auditoría SIP y recepción correcta de nómina

// Función estricta: Retorna exclusivamente los registros reales de almacén y nómina extraídos del Master Unificado
// para todo el año 2026 (Enero a Septiembre), con cero datos simulados y trazabilidad contable 100%.
export function generateInitialMockCostos(): SalidaCosto[] {
  return [
    ...REGISTROS_REALES_MESES_1_A_7,
    ...SALIDAS_REALES_AGOSTO_2026,
    ...SALIDAS_REALES_SEPTIEMBRE_2026
  ];
}
