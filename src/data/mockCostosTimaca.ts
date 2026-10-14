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

// Matriz de Distribución Mensual por Categoría (Tabla 3. Distribución anual de proyectos externos - Oficial 2026)
// Coincidencia 100% milimétrica con Nuevas Tablas Informesssssssssssss.xlsx (Hoja Externos 2026: $24.831.717 USD)
export const TABLA_PPT_DISTRIBUCION_2026 = [
  {
    categoria: 'Materiales Directos',
    meses: [622579, 688287, 652797, 371398, 288539, 554855, 316934, 513081, 822503],
    total2026: 4830974,
    variacion: '+60%',
    variacionNum: 60,
    esPositiva: true
  },
  {
    categoria: 'Servicios',
    meses: [232372, 9713796, 296831, 108933, 428946, 2517047, 1113483, 344155, 229748],
    total2026: 14985312,
    variacion: '-33%',
    variacionNum: -33,
    esPositiva: false
  },
  {
    categoria: 'Mano de Obra Directa',
    meses: [339370, 269666, 255366, 229531, 261564, 202303, 212668, 277936, 196666],
    total2026: 2245070,
    variacion: '-29%',
    variacionNum: -29,
    esPositiva: false
  },
  {
    categoria: 'Horas Maquina',
    meses: [145113, 113686, 149030, 55110, 129625, 69063, 75933, 89789, 55578],
    total2026: 882928,
    variacion: '-38%',
    variacionNum: -38,
    esPositiva: false
  },
  {
    categoria: 'Costos Indirectos',
    meses: [173397, 173476, 199287, 168410, 223636, 206755, 201145, 336208, 205120],
    total2026: 1887434,
    variacion: '-39%',
    variacionNum: -39,
    esPositiva: false
  }
];

export const TOTALES_MESES_PPT = [
  { mesNum: 1, mesNombre: 'Enero 2026', total: 1512831 },
  { mesNum: 2, mesNombre: 'Febrero 2026', total: 10958911 },
  { mesNum: 3, mesNombre: 'Marzo 2026', total: 1553311 },
  { mesNum: 4, mesNombre: 'Abril 2026', total: 933382 },
  { mesNum: 5, mesNombre: 'Mayo 2026', total: 1332311 },
  { mesNum: 6, mesNombre: 'Junio 2026', total: 3550023 },
  { mesNum: 7, mesNombre: 'Julio 2026', total: 1920163 },
  { mesNum: 8, mesNombre: 'Agosto 2026', total: 1561170 },
  { mesNum: 9, mesNombre: 'Septiembre 2026', total: 1509615 }
];

// LISTADO OFICIAL DE LAS 20 CUENTAS AUXILIARES / PROYECTOS EXTERNOS DE AGOSTO 2026 ($1.345.010 USD)
export interface CuentaAuxiliarProyecto {
  cuentaAuxiliar: string;
  proyecto: string;
  proyectoCorto: string;
  montoAgosto: number;
  porcentaje: number;
}

export const CUENTAS_AUXILIARES_EXACTAS_AGOSTO_2026: CuentaAuxiliarProyecto[] = [
  { cuentaAuxiliar: 'TTE-C-0706', proyecto: 'Recuperación de Línea 1 de Planta de Pellas', proyectoCorto: 'Línea 1 Pellas', montoAgosto: 636352, porcentaje: 47.31 },
  { cuentaAuxiliar: 'TTE-C-0671', proyecto: 'Segunda línea PMH - Ingeniería, diseño y suministro', proyectoCorto: '2da Línea PMH', montoAgosto: 187959, porcentaje: 13.97 },
  { cuentaAuxiliar: 'TTE-C-0668', proyecto: 'Fase 2 Planta de briquetas - FMO', proyectoCorto: 'Briquetas Fase 2', montoAgosto: 169771, porcentaje: 12.62 },
  { cuentaAuxiliar: 'TTE-C-0656', proyecto: 'Rehabilitación de bandas transportadoras PMH', proyectoCorto: 'Bandas Transp. PMH', montoAgosto: 109519, porcentaje: 8.14 },
  { cuentaAuxiliar: 'TTE-C-0653', proyecto: 'Repotenciación de rueda de cangilones (DRAVO) PMH', proyectoCorto: 'Rueda Cangilones PMH', montoAgosto: 64981, porcentaje: 4.83 },
  { cuentaAuxiliar: 'TTE-C-0680', proyecto: 'Servicio de mantenimiento de BG II', proyectoCorto: 'Mantenimiento BG II', montoAgosto: 51180, porcentaje: 3.81 },
  { cuentaAuxiliar: 'TTE-C-0655', proyecto: 'Interconexión del sist. de transporte desde tolva PMH', proyectoCorto: 'Tolva PMH', montoAgosto: 32170, porcentaje: 2.39 },
  { cuentaAuxiliar: 'TTE-C-0678', proyecto: 'Proyecto Pila HA y HB, suministro e instalación PMH', proyectoCorto: 'Pila HA y HB PMH', montoAgosto: 31448, porcentaje: 2.34 },
  { cuentaAuxiliar: 'TTE-C-0670', proyecto: 'Servicio de mtto. Maquinas Briqueteras', proyectoCorto: 'Mtto Briqueteras', montoAgosto: 15180, porcentaje: 1.13 },
  { cuentaAuxiliar: 'TTE-C-0640', proyecto: 'Rehabilitación de la Parrilla Móvil 610TG1 / Pellas', proyectoCorto: 'Parrilla Móvil Pellas', montoAgosto: 13705, porcentaje: 1.02 },
  { cuentaAuxiliar: 'TTE-C-0694', proyecto: 'Suministro e Instalación de la Caldera - Briquetas', proyectoCorto: 'Caldera Briquetas', montoAgosto: 13140, porcentaje: 0.98 },
  { cuentaAuxiliar: 'TTE-C-0669', proyecto: 'Servicio de mantenimiento de Dravo', proyectoCorto: 'Mtto Dravo', montoAgosto: 9992, porcentaje: 0.74 },
  { cuentaAuxiliar: 'TTE-C-0676', proyecto: 'Segunda linea de Planta de Pellas', proyectoCorto: '2da Línea Pellas', montoAgosto: 4018, porcentaje: 0.30 },
  { cuentaAuxiliar: 'TTE-C-0684', proyecto: 'Fabricación de Gamelas FMO-PMH', proyectoCorto: 'Gamelas FMO-PMH', montoAgosto: 2143, porcentaje: 0.16 },
  { cuentaAuxiliar: 'TTE-C-0697', proyecto: 'Reparación de Generador Eléctrico (Briquetas)', proyectoCorto: 'Generador Briquetas', montoAgosto: 1045, porcentaje: 0.08 },
  { cuentaAuxiliar: 'TTE-C-0688', proyecto: 'Desmantelamiento del Carga Barcos Wellman', proyectoCorto: 'Carga Barcos Wellman', montoAgosto: 759, porcentaje: 0.06 },
  { cuentaAuxiliar: 'TTE-C-0663', proyecto: 'Reacondicionamiento etapa III en Boca Grande 2', proyectoCorto: 'Boca Grande 2 Etapa III', montoAgosto: 665, porcentaje: 0.05 },
  { cuentaAuxiliar: 'TTE-C-0642', proyecto: 'Rehabilitación de Carga Barco FMO (Ship loader)', proyectoCorto: 'Ship Loader FMO', montoAgosto: 359, porcentaje: 0.03 },
  { cuentaAuxiliar: 'TTE-C-0711', proyecto: 'Servicio de retirada de modulos eléctricos TH4 PMH', proyectoCorto: 'Módulos Eléctricos TH4', montoAgosto: 334, porcentaje: 0.02 },
  { cuentaAuxiliar: 'TTE-C-0654', proyecto: 'Proyecto 5B: Rehabilitación de cinta JD-9021', proyectoCorto: 'Cinta JD-9021', montoAgosto: 290, porcentaje: 0.02 }
];

// LISTADO OFICIAL DE LAS CUENTAS AUXILIARES / PROYECTOS EXTERNOS DE SEPTIEMBRE 2026 ($1.215.432 USD CONSOLIDADO)
export const CUENTAS_AUXILIARES_EXACTAS_SEPTIEMBRE_2026 = [
  {
    "cuentaAuxiliar": "TTE-C-0706",
    "proyecto": "Recuperación Línea 1 de Planta de Pellas",
    "proyectoCorto": "Línea 1 Pellas",
    "montoSeptiembre": 663783.61,
    "porcentaje": 49.89
  },
  {
    "cuentaAuxiliar": "TTE-C-0671",
    "proyecto": "Segunda línea PMH - Ingeniería, diseño y suministro",
    "proyectoCorto": "2da Línea PMH",
    "montoSeptiembre": 207826.76,
    "porcentaje": 15.62
  },
  {
    "cuentaAuxiliar": "TTE-C-0653",
    "proyecto": "Repotenciación de rueda de cangilones (DRAVO) PMH",
    "proyectoCorto": "Rueda Cangilones PMH",
    "montoSeptiembre": 144767.75,
    "porcentaje": 10.88
  },
  {
    "cuentaAuxiliar": "TTE-C-0668",
    "proyecto": "Fase 2 Planta de briquetas - FMO",
    "proyectoCorto": "Briquetas Fase 2",
    "montoSeptiembre": 104230.68,
    "porcentaje": 7.83
  },
  {
    "cuentaAuxiliar": "TTE-C-0656",
    "proyecto": "Rehabilitación de bandas transportadoras PMH",
    "proyectoCorto": "Bandas Transp. PMH",
    "montoSeptiembre": 56059.2,
    "porcentaje": 4.21
  },
  {
    "cuentaAuxiliar": "TTE-C-0694",
    "proyecto": "Suministro e Instalación de la Caldera - Briquetas",
    "proyectoCorto": "Caldera Briquetas",
    "montoSeptiembre": 46735.85,
    "porcentaje": 3.51
  },
  {
    "cuentaAuxiliar": "TTE-C-0680",
    "proyecto": "Servicio de mantenimiento de BG II",
    "proyectoCorto": "Mantenimiento BG II",
    "montoSeptiembre": 31937.11,
    "porcentaje": 2.4
  },
  {
    "cuentaAuxiliar": "TTE-C-0678",
    "proyecto": "Proyecto Pila HA y HB, suministro e instalación PMH",
    "proyectoCorto": "Pila HA y HB PMH",
    "montoSeptiembre": 28997.06,
    "porcentaje": 2.18
  },
  {
    "cuentaAuxiliar": "TTE-C-0670",
    "proyecto": "Servicio de mtto. Maquinas Briqueteras",
    "proyectoCorto": "Mtto Briqueteras",
    "montoSeptiembre": 13990.37,
    "porcentaje": 1.05
  },
  {
    "cuentaAuxiliar": "TTE-C-0640",
    "proyecto": "Rehabilitación de la Parrilla Móvil 610TG1 / Pellas",
    "proyectoCorto": "Parrilla Móvil Pellas",
    "montoSeptiembre": 12020.95,
    "porcentaje": 0.9
  },
  {
    "cuentaAuxiliar": "TTE-C-0655",
    "proyecto": "Interconexión del sist. de transporte desde tolva PMH",
    "proyectoCorto": "Tolva PMH",
    "montoSeptiembre": 5390.96,
    "porcentaje": 0.41
  },
  {
    "cuentaAuxiliar": "TTE-C-0669",
    "proyecto": "Servicio de mantenimiento de Dravo, Shiploader",
    "proyectoCorto": "Mtto Dravo",
    "montoSeptiembre": 5221.84,
    "porcentaje": 0.39
  },
  {
    "cuentaAuxiliar": "TTE-C-0684",
    "proyecto": "Fabricación de Gamelas FMO-PMH",
    "proyectoCorto": "Gamelas FMO-PMH",
    "montoSeptiembre": 2176.07,
    "porcentaje": 0.16
  },
  {
    "cuentaAuxiliar": "TTE-C-0718",
    "proyecto": "Arandela de presión M20 DIN-127 Pavonada",
    "proyectoCorto": "Arandela M20",
    "montoSeptiembre": 1533.2,
    "porcentaje": 0.12
  },
  {
    "cuentaAuxiliar": "TTE-C-0672",
    "proyecto": "Extensión de banda transportadora JD 8016A y B",
    "proyectoCorto": "Extensión JD 8016",
    "montoSeptiembre": 1492.22,
    "porcentaje": 0.11
  },
  {
    "cuentaAuxiliar": "TTE-C-0654",
    "proyecto": "Proyecto 5B: Rehabilitación y extensión de cinta JD-9021",
    "proyectoCorto": "Cinta JD-9021",
    "montoSeptiembre": 1301.77,
    "porcentaje": 0.1
  },
  {
    "cuentaAuxiliar": "TTE-C-0711",
    "proyecto": "Servicio de retirada de modulos eléctricos TH4 PMH",
    "proyectoCorto": "Módulos Eléctricos TH4",
    "montoSeptiembre": 1178.5,
    "porcentaje": 0.09
  },
  {
    "cuentaAuxiliar": "TTE-C-0697",
    "proyecto": "Reparación de Generador Eléctrico para Planta de Briquetas",
    "proyectoCorto": "Generador Briquetas",
    "montoSeptiembre": 855.26,
    "porcentaje": 0.06
  },
  {
    "cuentaAuxiliar": "TTE-C-0676",
    "proyecto": "Segunda linea de Planta de Pellas (VISCO ORINOCO)",
    "proyectoCorto": "2da Línea Pellas",
    "montoSeptiembre": 443.66,
    "porcentaje": 0.03
  },
  {
    "cuentaAuxiliar": "TTE-C-0663",
    "proyecto": "Reacondicionamiento etapa III en Boca Grande 2",
    "proyectoCorto": "Boca Grande 2 Etapa III",
    "montoSeptiembre": 141.24,
    "porcentaje": 0.01
  },
  {
    "cuentaAuxiliar": "TTE-C-0704",
    "proyecto": "Segundo Lote - Fabricación de placas y ancajes",
    "proyectoCorto": "Placas y Anclajes L2",
    "montoSeptiembre": 140,
    "porcentaje": 0.01
  },
  {
    "cuentaAuxiliar": "TTE-C-0641",
    "proyecto": "HIB PLANT/ Rehabilitación de las Máquinas Briqueteras",
    "proyectoCorto": "HIB Plant Briqueteras",
    "montoSeptiembre": 74.71,
    "porcentaje": 0.01
  },
  {
    "cuentaAuxiliar": "TTE-C-0667",
    "proyecto": "Reparaciones principales en Top Gas Scrubber",
    "proyectoCorto": "Top Gas Scrubber",
    "montoSeptiembre": 56.22,
    "porcentaje": 0
  },
  {
    "cuentaAuxiliar": "TTE-C-0578",
    "proyecto": "Reconstrucción de aspas de agitadores del área 41",
    "proyectoCorto": "Aspas Agitadores",
    "montoSeptiembre": 17.1,
    "porcentaje": 0
  },
  {
    "cuentaAuxiliar": "TTE-C-0675",
    "proyecto": "Reparación motor / reductor de polea motriz banda PMH",
    "proyectoCorto": "Motor Reductor PMH",
    "montoSeptiembre": 2.52,
    "porcentaje": 0
  }
];


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
  totalGeneral: 221353
};

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
