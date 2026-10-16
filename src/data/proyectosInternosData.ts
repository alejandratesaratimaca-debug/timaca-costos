/**
 * Base de Datos Oficial: Gestión de Costos TIMACA 2026 - Proyectos Internos (CAPEX / OPEX / ADMON)
 * Extraído y conciliado al 100% con:
 * - 8 Informe Costos Ago 2026 - Proyectos Internos.pdf
 * - Nuevo Dashboard - Proyectos Internos.xlsx (Corte Septiembre 2026)
 * - 4 Master Unificado.xlsx (Cierre Septiembre 2026)
 */

export interface ResumenMensualInterno {
  mesLabel: string;
  mesCorto: string;
  proyectosInternosCapex: number;
  activosProductivosCapex: number;
  capex: number;
  opexActivos: number;
  opexInfraestructura: number;
  admon?: number;
  totalOpex: number;
  totalGeneral: number;
  totalConAdmon?: number;
}

export const EVOLUTIVO_INTERNOS_2026: ResumenMensualInterno[] = [
  { mesLabel: 'Enero', mesCorto: 'Ene', proyectosInternosCapex: 162467.00, activosProductivosCapex: 0, capex: 162467.00, opexActivos: 143580.59, opexInfraestructura: 145196.50, admon: 0, totalOpex: 288777.09, totalGeneral: 451244.09, totalConAdmon: 451244.09 },
  { mesLabel: 'Febrero', mesCorto: 'Feb', proyectosInternosCapex: 326380.08, activosProductivosCapex: 0, capex: 326380.08, opexActivos: 102274.05, opexInfraestructura: 50329.09, admon: 0, totalOpex: 152603.14, totalGeneral: 478983.22, totalConAdmon: 478983.22 },
  { mesLabel: 'Marzo', mesCorto: 'Mar', proyectosInternosCapex: 149039.20, activosProductivosCapex: 0, capex: 149039.20, opexActivos: 83193.99, opexInfraestructura: 20148.88, admon: 0, totalOpex: 103342.87, totalGeneral: 252382.07, totalConAdmon: 252382.07 },
  { mesLabel: 'Abril', mesCorto: 'Abr', proyectosInternosCapex: 92864.54, activosProductivosCapex: 0, capex: 92864.54, opexActivos: 59542.59, opexInfraestructura: 25926.42, admon: 0, totalOpex: 85469.01, totalGeneral: 178333.54, totalConAdmon: 178333.54 },
  { mesLabel: 'Mayo', mesCorto: 'May', proyectosInternosCapex: 77900.75, activosProductivosCapex: 0, capex: 77900.75, opexActivos: 68409.09, opexInfraestructura: 20031.25, admon: 0, totalOpex: 88440.34, totalGeneral: 166341.09, totalConAdmon: 166341.09 },
  { mesLabel: 'Junio', mesCorto: 'Jun', proyectosInternosCapex: 32585.22, activosProductivosCapex: 0, capex: 32585.22, opexActivos: 72213.23, opexInfraestructura: 15747.60, admon: 0, totalOpex: 87960.83, totalGeneral: 120546.05, totalConAdmon: 120546.05 },
  { mesLabel: 'Julio', mesCorto: 'Jul', proyectosInternosCapex: 45087.13, activosProductivosCapex: 0, capex: 45087.13, opexActivos: 97727.42, opexInfraestructura: 41897.82, admon: 0, totalOpex: 139625.24, totalGeneral: 184712.37, totalConAdmon: 184712.37 },
  { mesLabel: 'Agosto', mesCorto: 'Ago', proyectosInternosCapex: 29017.30, activosProductivosCapex: 0, capex: 29017.30, opexActivos: 113450.01, opexInfraestructura: 40545.39, admon: 0, totalOpex: 153995.40, totalGeneral: 183012.70, totalConAdmon: 183012.70 },
  { mesLabel: 'Septiembre', mesCorto: 'Sep', proyectosInternosCapex: 34995.08, activosProductivosCapex: 28328.84, capex: 63323.92, opexActivos: 65757.04, opexInfraestructura: 42818.77, admon: 0, totalOpex: 108575.81, totalGeneral: 171899.73, totalConAdmon: 171899.73 },
];

export const TOTALES_ACUMULADOS_INTERNOS_2026 = {
  proyectosInternosCapex: 950336.30,
  activosProductivosCapex: 28328.84,
  capex: 978665.14,
  opexActivos: 806147.99,
  opexInfraestructura: 402641.72,
  admon: 0,
  totalOpex: 1208789.71,
  totalGeneral: 2187454.85,
  totalConAdmon: 2187454.85,
  distribucionAgosto: {
    capexPorcentaje: 16,
    opexActivosPorcentaje: 62,
    opexInfraPorcentaje: 22,
  },
  distribucionSeptiembre: {
    capexPorcentaje: 36.8, // $63.324 / $171.900 = 36.8%
    opexActivosPorcentaje: 38.3, // $65.757 / $171.900 = 38.3%
    opexInfraPorcentaje: 24.9, // $42.819 / $171.900 = 24.9%
  },
  distribucionSeptiembreBase: {
    capexPorcentaje: 20.4,
    opexActivosPorcentaje: 54.7,
    opexInfraPorcentaje: 24.9,
  },
  variacionesAgostoVsJulio: {
    capex: -36,
    opexActivos: 16,
    opexInfraestructura: -3,
    totalOpex: 10,
    totalGeneral: -1,
  },
  variacionesSeptiembreVsAgosto: {
    capex: 118.2, // $63.324 vs $29.017 = +118.2%
    proyectosInternos: 20.6, // $34.995 vs $29.017 = +20.6%
    opexActivos: -42.0, // $65.757 vs $113.450 = -42.0%
    opexInfraestructura: 5.6, // $42.819 vs $40.545 = +5.6%
    totalOpex: -29.5, // $108.576 vs $153.995 = -29.5%
    totalGeneral: -6.1, // $171.900 vs $183.013 = -6.1%
  }
};

// ============================================================================
// RECLASIFICACIÓN CONTABLE SEPTIEMBRE 2026: OPEX FLOTA -> CAPEX
// Regla Contable (NIC 16):
// 1. Equipos Nuevos Incorporados en Septiembre: Todas las intervenciones de
//    acondicionamiento y puesta a punto del mes de ingreso van a CAPEX.
//    A partir de Octubre, sus mantenimientos mínimos/rutinarios irán a OPEX.
// 2. Intervenciones que Aumentan la Vida Útil (Motores, Overhauls Mayores,
//    Cilindros Telescópicos, Mejoras Tecnológicas): Ese evento puntual va a CAPEX.
// ============================================================================

export interface EquipoNuevoCapexMes {
  codigo: string;
  nombre: string;
  familia: string;
  mesIncorporacion: string;
  registrosSep: number;
  materialesUsd: number;
  serviciosUsd: number;
  totalSepUsd: number;
  detalleIntervencion: string;
  reglaOctubre: string;
}

export const EQUIPOS_NUEVOS_SEPTIEMBRE_2026: EquipoNuevoCapexMes[] = [
  {
    codigo: 'EEA-C-BS15',
    nombre: 'Autobús Encava ENT-3300 - Placa: 6036A1Y',
    familia: 'Autobuses',
    mesIncorporacion: 'Septiembre 2026',
    registrosSep: 18,
    materialesUsd: 2872.11,
    serviciosUsd: 0.00,
    totalSepUsd: 2872.11,
    detalleIntervencion: 'Turbocompresor Holset HX40 Motor Cummins 6CT8.3 ($640,00), 6 Cauchos radiales 315/80R22.5 ($1.326,00), radiador de enfriamiento, mangueras, aceite Dexron III, abrazaderas y filtros.',
    reglaOctubre: 'Pasa a CAPEX en Septiembre por acondicionamiento de ingreso (adquisición). En Octubre sus mantenimientos mínimos irán a OPEX.'
  },
  {
    codigo: 'EEE-C-VH52',
    nombre: 'Pick Up Mazda BT-50 2WD - Placa 04XFAJ',
    familia: 'Vehículos livianos',
    mesIncorporacion: 'Septiembre 2026',
    registrosSep: 12,
    materialesUsd: 544.96,
    serviciosUsd: 0.00,
    totalSepUsd: 544.96,
    detalleIntervencion: 'Aceite transmisión 80W90 ($133,40), Pila gasolina Bosch ($32,00), Correas dentadas ($33,20), Aceite motor 15W40 ($30,05), Cables bujías, tapa distribuidor, filtros y conector bomba.',
    reglaOctubre: 'Pasa a CAPEX en Septiembre por acondicionamiento de ingreso. En Octubre sus mantenimientos mínimos irán a OPEX.'
  },
  {
    codigo: 'EEE-C-PA03',
    nombre: 'Payloader Caterpillar 962G',
    familia: 'Equipos especiales',
    mesIncorporacion: 'Septiembre 2026',
    registrosSep: 3,
    materialesUsd: 259.73,
    serviciosUsd: 0.00,
    totalSepUsd: 259.73,
    detalleIntervencion: 'Filtros de aire primario y secundario, aceites hidráulicos ISO 68 y grasas de alta presión para puesta en servicio.',
    reglaOctubre: 'Pasa a CAPEX en Septiembre por acondicionamiento de ingreso. En Octubre sus mantenimientos mínimos irán a OPEX.'
  },
  {
    codigo: 'EEE-C-TR01',
    nombre: 'Traktor Caterpillar D6R-XL2',
    familia: 'Equipos especiales',
    mesIncorporacion: 'Septiembre 2026',
    registrosSep: 1,
    materialesUsd: 0.00,
    serviciosUsd: 245.14,
    totalSepUsd: 245.14,
    detalleIntervencion: 'Servicio de soldadura y reparación de radiador y tanque compensador de refrigerante para arranque operativo.',
    reglaOctubre: 'Pasa a CAPEX en Septiembre por puesta a punto inicial. En Octubre sus mantenimientos mínimos irán a OPEX.'
  },
  {
    codigo: 'TT-F-CO19',
    nombre: 'Compresor SULLAIR 185 45,5 KW 185 CFM Serial: 201012180072',
    familia: 'Compresores',
    mesIncorporacion: 'Septiembre 2026',
    registrosSep: 2,
    materialesUsd: 55.71,
    serviciosUsd: 0.00,
    totalSepUsd: 55.71,
    detalleIntervencion: 'Aceite sintético de compresión, filtros separadores y acoples rápidos de manguera.',
    reglaOctubre: 'Pasa a CAPEX en Septiembre por puesta en marcha. En Octubre sus mantenimientos mínimos irán a OPEX.'
  },
  {
    codigo: 'TT-F-CO20',
    nombre: 'Compresor SULLAIR 185 45,5 KW 185 CFM Serial: 201112120050',
    familia: 'Compresores',
    mesIncorporacion: 'Septiembre 2026',
    registrosSep: 2,
    materialesUsd: 33.89,
    serviciosUsd: 0.00,
    totalSepUsd: 33.89,
    detalleIntervencion: 'Mangueras de alta presión y acoples universales tipo Chicago para línea neumática.',
    reglaOctubre: 'Pasa a CAPEX en Septiembre por puesta en marcha. En Octubre sus mantenimientos mínimos irán a OPEX.'
  }
];

export interface IntervencionVidaUtilCapex {
  id: string;
  codigoEquipo: string;
  nombreEquipo: string;
  familia: string;
  comprobante: string;
  fecha: string;
  categoria: 'Materiales Directos' | 'Servicios';
  descripcionItem: string;
  motivo: string;
  montoItemUsd: number;
  montoTotalEquipoMesUsd: number;
  materialesUsd?: number;
  serviciosUsd?: number;
  modUsd?: number;
  nivel: 'NIVEL_1_DIRECTO' | 'NIVEL_2_COMPONENTE_MAYOR';
  criterioContable: string;
  activoPorDefecto: boolean;
}

export const INTERVENCIONES_VIDA_UTIL_SEPTIEMBRE_2026: IntervencionVidaUtilCapex[] = [
  {
    id: 'CAPEX-VU-SEP-01',
    codigoEquipo: 'EEI-C-GR23',
    nombreEquipo: 'Grúa Link Belt LS918 400TN Serial 43H7-4300',
    familia: 'Grúas',
    comprobante: 'SC25949 / OC22854',
    fecha: '2026-09-08',
    categoria: 'Servicios',
    descripcionItem: 'SERVICIO MECANIZADO: Mecanizado mayor de vástago de cilindro telescópico principal 400TN ($9.000) y sellos hidráulicos ($1.031,68)',
    motivo: 'Recuperación mayor estructural de cilindro telescópico principal',
    montoItemUsd: 10031.68,
    montoTotalEquipoMesUsd: 10031.68,
    materialesUsd: 1031.68,
    serviciosUsd: 9000.00,
    modUsd: 0.00,
    nivel: 'NIVEL_1_DIRECTO',
    criterioContable: 'Mecanizado mayor de vástago y tornamesa que restaura y extiende sustancialmente la vida útil de izamiento pesado (NIC 16).',
    activoPorDefecto: true
  },
  {
    id: 'CAPEX-VU-SEP-02',
    codigoEquipo: 'EEA-C-BS03',
    nombreEquipo: 'Autobús Encava - Placa: FA160P',
    familia: 'Autobuses',
    comprobante: 'DP0039990',
    fecha: '2026-09-10',
    categoria: 'Materiales Directos',
    descripcionItem: 'MOTOR DIESEL CUMMINS 6CT 8.3 L 6 CILINDROS 225 HP 2200 RPM NUEVO ($8.500) + Repuestos y consumibles instalación ($457,12)',
    motivo: 'BS03 -- MOTOR PARA INSTALACION Y PUESTA A PUNTO TREN MOTRIZ',
    montoItemUsd: 8957.12,
    montoTotalEquipoMesUsd: 8957.12,
    materialesUsd: 8500.00,
    serviciosUsd: 457.12,
    modUsd: 0.00,
    nivel: 'NIVEL_1_DIRECTO',
    criterioContable: 'Reemplazo de motor diésel completo nuevo a 0 horas, prolongando la vida útil operativa del autobús por más de 5 años.',
    activoPorDefecto: true
  },
  {
    id: 'CAPEX-VU-SEP-03',
    codigoEquipo: 'TT-S-C-854',
    nombreEquipo: 'Payloader Hyundai HL760-7 (PA01)',
    familia: 'Equipos especiales',
    comprobante: 'DP0039995',
    fecha: '2026-09-10',
    categoria: 'Materiales Directos',
    descripcionItem: 'BOMBA HIDRAULICA DE FRENO / VENTILADOR 31LD-40500 ($2.071,68), calibración de presiones ($500) y mano de obra técnica ($202,10)',
    motivo: 'PA01 -- REPARACION Y EXTENSION DE VIDA UTIL DE SISTEMA HIDRAULICO CRITICO',
    montoItemUsd: 2773.78,
    montoTotalEquipoMesUsd: 2773.78,
    materialesUsd: 2071.68,
    serviciosUsd: 500.00,
    modUsd: 202.10,
    nivel: 'NIVEL_1_DIRECTO',
    criterioContable: 'Sustitución de bomba hidráulica principal de freno y enfriamiento más calibración mayor de presiones de trabajo.',
    activoPorDefecto: true
  },
  {
    id: 'CAPEX-VU-SEP-04',
    codigoEquipo: 'EEI-C-GR22',
    nombreEquipo: 'Grúa Liebherr LTM1400 - 400TN Serial W09858000NEL05061',
    familia: 'Grúas',
    comprobante: 'SC25305 / DP0040112',
    fecha: '2026-09-15',
    categoria: 'Materiales Directos',
    descripcionItem: 'Válvulas proporcionales electrohidráulicas y mangueras de alta resistencia ($1.854,72) + Servicio de calibración de pluma ($700,00)',
    motivo: 'GR22 -- RECUPERACION MAYOR SISTEMA DE MANDO Y VALVULAS DE PLUMA 400TN',
    montoItemUsd: 2554.72,
    montoTotalEquipoMesUsd: 2554.72,
    materialesUsd: 1854.72,
    serviciosUsd: 700.00,
    modUsd: 0.00,
    nivel: 'NIVEL_1_DIRECTO',
    criterioContable: 'Mantenimiento preventivo mayor y reemplazo de componentes de control en sistema de izamiento de 400TN.',
    activoPorDefecto: true
  }
];

// Cuentas Auxiliares de Inversiones CAPEX (Enero - Septiembre 2026)
export interface CuentaCapexInterno {
  cuentaAuxiliar: string;
  proyecto: string;
  ajuste2025?: number;
  ene: number;
  feb: number;
  mar: number;
  abr: number;
  may: number;
  jun: number;
  jul: number;
  ago: number;
  sep: number;
  total2026: number;
  materialesSep?: number;
  serviciosSep?: number;
  modHorasSep?: number;
  modUsdSep?: number;
  notaAuditoria?: string;
}

export const CUENTAS_CAPEX_INTERNOS: CuentaCapexInterno[] = [
  { 
    cuentaAuxiliar: 'TSI-T-0108', 
    proyecto: 'Construcción Galpones TIMACA Cant. 04', 
    ajuste2025: 54133.92, 
    ene: 19525, 
    feb: 2182, 
    mar: 8369, 
    abr: 2464, 
    may: 1060.62, 
    jun: 2401.50, 
    jul: 1628.04, 
    ago: 5595.75, 
    sep: 13498.06, 
    total2026: 56723.97,
    materialesSep: 13498.06,
    serviciosSep: 0,
    modHorasSep: 0,
    modUsdSep: 0,
    notaAuditoria: 'Estructuras metálicas, correas y perfiles para los 4 galpones industriales (▲ 141% vs Agosto).'
  },
  { 
    cuentaAuxiliar: 'TTI-C-0105', 
    proyecto: 'Adecuación patio externo Timaca', 
    ajuste2025: 4191.35, 
    ene: 44500, 
    feb: 271159, 
    mar: 42537, 
    abr: 49926, 
    may: 63637.99, 
    jun: 3906, 
    jul: 14225.21, 
    ago: 5370.87, 
    sep: 9115.80, 
    total2026: 504377.87,
    materialesSep: 9000.80,
    serviciosSep: 50.00,
    modHorasSep: 65,
    modUsdSep: 65.00,
    notaAuditoria: 'Conciliación exacta oficial: $9.000,80 en materiales directos + $50,00 en servicios de transporte interno + $65,00 por las 65 Horas Hombre (HH) de mano de obra de adecuación.'
  },
  { 
    cuentaAuxiliar: 'TTI-C-0095', 
    proyecto: 'Obra civil Edificio Administrativo', 
    ajuste2025: 6887.03, 
    ene: 2937, 
    feb: 1210, 
    mar: 378, 
    abr: 492, 
    may: 7391.13, 
    jun: 7386, 
    jul: 21318.67, 
    ago: 13163.56, 
    sep: 6617.15, 
    total2026: 60893.51,
    materialesSep: 6617.15,
    serviciosSep: 0,
    modHorasSep: 0,
    modUsdSep: 0,
    notaAuditoria: 'Mampostería, porcelanato, luminarias y cerramientos de sede administrativa (▼ 50% vs Agosto).'
  },
  { 
    cuentaAuxiliar: 'TTI-C-0108', 
    proyecto: 'Adecuación banco de pruebas motores 440v', 
    ajuste2025: 0, 
    ene: 0, 
    feb: 0, 
    mar: 0, 
    abr: 0, 
    may: 139.44, 
    jun: 2.45, 
    jul: 5574.78, 
    ago: 3288.75, 
    sep: 3759.16, 
    total2026: 12764.58,
    materialesSep: 3399.16,
    serviciosSep: 360.00,
    modHorasSep: 0,
    modUsdSep: 0,
    notaAuditoria: 'Materiales eléctricos especializados ($3.399,16) + Servicios de calibración y conexión ($360,00).'
  },
  { 
    cuentaAuxiliar: 'TTI-C-0104', 
    proyecto: 'Reacondicionamiento Grúas Torres Liebherr (Pellas 2)*', 
    ajuste2025: 2685.16, 
    ene: 65420, 
    feb: 7750, 
    mar: 50923, 
    abr: 30908, 
    may: 4334.29, 
    jun: 18625.40, 
    jul: 1891.45, 
    ago: 1527.76, 
    sep: 1951.95, 
    total2026: 183331.85,
    materialesSep: 921.95,
    serviciosSep: 1030.00,
    modHorasSep: 0,
    modUsdSep: 0,
    notaAuditoria: 'Servicio de mantenimiento mecánico en grúas torres Liebherr ($1.030,00) + Repuestos ($921,95).'
  },
  { 
    cuentaAuxiliar: 'TTI-C-0102', 
    proyecto: 'Renovación garita de acceso Timaca', 
    ajuste2025: 5410, 
    ene: 10244, 
    feb: 944, 
    mar: 1294, 
    abr: 552, 
    may: 7.17, 
    jun: 78, 
    jul: 13.20, 
    ago: 0, 
    sep: 20.00, 
    total2026: 13152.37,
    materialesSep: 20.00,
    serviciosSep: 0,
    modHorasSep: 0,
    modUsdSep: 0,
    notaAuditoria: 'Consumibles menores de acabado en garita de vigilancia.'
  },
  { 
    cuentaAuxiliar: 'TTI-C-0111', 
    proyecto: 'Montaje y puesta en marcha de 2 bancos de prueba para motores, bombas y reductores', 
    ajuste2025: 0, 
    ene: 0, 
    feb: 0, 
    mar: 0, 
    abr: 0, 
    may: 0, 
    jun: 0, 
    jul: 0, 
    ago: 0, 
    sep: 16.67, 
    total2026: 16.67,
    materialesSep: 16.67,
    serviciosSep: 0,
    modHorasSep: 0,
    modUsdSep: 0,
    notaAuditoria: 'Accesorios menores de anclaje.'
  },
  { 
    cuentaAuxiliar: 'TTI-C-0107', 
    proyecto: 'Fabricación zona resguardo equipos móviles (Patio almacén central)', 
    ajuste2025: 0, 
    ene: 0, 
    feb: 0, 
    mar: 1757, 
    abr: 3940, 
    may: 0, 
    jun: 0, 
    jul: 274.54, 
    ago: 62.48, 
    sep: 10.00, 
    total2026: 6044.02,
    materialesSep: 10.00,
    serviciosSep: 0,
    modHorasSep: 0,
    modUsdSep: 0,
    notaAuditoria: 'Pintura y señalización de zona de resguardo.'
  },
  { 
    cuentaAuxiliar: 'TTI-C-0099', 
    proyecto: 'Adquisición, instalación y puesta en marcha de pantógrafos', 
    ajuste2025: 16.03, 
    ene: 0, 
    feb: 3064.08, 
    mar: 323.20, 
    abr: 791.54, 
    may: 0, 
    jun: 9, 
    jul: 44.40, 
    ago: 8.13, 
    sep: 5.27, 
    total2026: 4245.62,
    materialesSep: 5.27,
    serviciosSep: 0,
    modHorasSep: 0,
    modUsdSep: 0,
    notaAuditoria: 'Conectores eléctricos para pantógrafo.'
  },
  { 
    cuentaAuxiliar: 'TTI-C-0098', 
    proyecto: 'Adquisición, instalación y puesta en marcha de grúas puente', 
    ajuste2025: 0, 
    ene: 0, 
    feb: 0, 
    mar: 0, 
    abr: 0, 
    may: 0, 
    jun: 0, 
    jul: 34.99, 
    ago: 0, 
    sep: 1.02, 
    total2026: 36.01,
    materialesSep: 1.02,
    serviciosSep: 0,
    modHorasSep: 0,
    modUsdSep: 0,
    notaAuditoria: 'Tornillería galvanizada de fijación.'
  },
  { 
    cuentaAuxiliar: 'TTI-C-0101', 
    proyecto: 'Adquisición máquinas vulcanizadoras en caliente', 
    ajuste2025: 0, 
    ene: 0, 
    feb: 10, 
    mar: 0, 
    abr: 0, 
    may: 1330.11, 
    jun: 0, 
    jul: 46.86, 
    ago: 0, 
    sep: 0, 
    total2026: 1386.97,
    materialesSep: 0,
    serviciosSep: 0,
    modHorasSep: 0,
    modUsdSep: 0,
    notaAuditoria: 'Sin movimientos en Septiembre.'
  },
  { 
    cuentaAuxiliar: 'TTI-C-0106', 
    proyecto: 'Adecuación área de lavado equipos móviles', 
    ajuste2025: 4343, 
    ene: 19841, 
    feb: 40061, 
    mar: 43458, 
    abr: 3791, 
    may: 0, 
    jun: 177, 
    jul: 34.99, 
    ago: 0, 
    sep: 0, 
    total2026: 107362.99,
    materialesSep: 0,
    serviciosSep: 0,
    modHorasSep: 0,
    modUsdSep: 0,
    notaAuditoria: 'Sin movimientos en Septiembre.'
  },
];

export const VARIACIONES_CAPEX_AGO_SEP = [
  {
    cuenta: 'TSI-T-0108',
    proyecto: 'Construcción Galpones TIMACA',
    anterior: 5596,
    actual: 13498.06,
    porcentaje: '+141%',
    esSubida: true,
    explicacion: 'Incremento por suministro de perfiles estructurales, planchas ASTM A-36, pintura epóxica y consumibles de soldadura para cierre estructural de los 4 galpones.'
  },
  {
    cuenta: 'TTI-C-0105',
    proyecto: 'Adec. Patio Externo Timaca',
    anterior: 5371,
    actual: 9050.80,
    porcentaje: '+69%',
    esSubida: true,
    explicacion: 'Avance en canalizaciones eléctricas exteriores, luminarias reflectoras, cemento gris y agregados para áreas de circulación pesada.'
  },
  {
    cuenta: 'TTI-C-0095',
    proyecto: 'Obra Civil Edif. Administrativo',
    anterior: 13164,
    actual: 6617.15,
    porcentaje: '-50%',
    esSubida: false,
    explicacion: 'Disminución tras culminar la compra mayor de perfiles HEA y piedra sinterizada en agosto; en septiembre se ejecutaron acabados eléctricos, tuberías y pintura.'
  },
  {
    cuenta: 'TTI-C-0108',
    proyecto: 'Banco de Pruebas Motores 440V',
    anterior: 3289,
    actual: 3759.16,
    porcentaje: '+14%',
    esSubida: true,
    explicacion: 'Suministro de componentes de instrumentación eléctrica, terminales, contactores, cables de potencia y servicio técnico de montaje.'
  },
  {
    cuenta: 'TTI-C-0104',
    proyecto: 'Grúas Torres Liebherr (Pellas 2)',
    anterior: 1528,
    actual: 1951.95,
    porcentaje: '+28%',
    esSubida: true,
    explicacion: 'Servicios especializados ($1.030 USD) y materiales mecánicos/eléctricos ($921,95 USD) para el reacondicionamiento de grúas torres.'
  }
];

export const VARIACIONES_CAPEX_JUL_AGO = [
  {
    cuenta: 'TSI-T-0108',
    proyecto: 'Construcción Galpones TIMACA',
    julio: 1628,
    agosto: 5596,
    porcentaje: '+244%',
    esSubida: true,
    explicacion: '+5,1K USD en Cabilla Estriada 3/4" (1.560 M) para los nuevos galpones en zona de hangares TIMACA.'
  },
  {
    cuenta: 'TTI-C-0095',
    proyecto: 'Edif. Administrativo',
    julio: 21319,
    agosto: 13164,
    porcentaje: '-38%',
    esSubida: false,
    explicacion: 'Pego Blanco (-10,2K USD) y alivén a granel (-5,2K USD, vaciado de sobrepiso) no se repitieron en agosto, compensado por Perfil HEA 200 (+6,6K USD).'
  },
  {
    cuenta: 'TTI-C-0105',
    proyecto: 'Adec. Patio Externo',
    julio: 14225,
    agosto: 5371,
    porcentaje: '-62%',
    esSubida: false,
    explicacion: 'Cable THWN 2 AWG (800 Mtrs, -7,4K USD) para las torres de alumbrado lado sur no se repitió en Agosto, quedando cable THWN 4 AWG (388 Mtrs, +1,8K USD).'
  },
  {
    cuenta: 'TTI-C-0108',
    proyecto: 'Adec. Banco de Pruebas',
    julio: 5575,
    agosto: 3289,
    porcentaje: '-41%',
    esSubida: false,
    explicacion: 'Arrancador suave (-4,6K USD) y contactor trifásico 300 A (-1,2K USD) no se repitieron en Agosto, quedando materiales eléctricos (+3,2K USD) para adecuación.'
  },
  {
    cuenta: 'TTI-C-0104',
    proyecto: 'Grúas Torres Liebherr',
    julio: 1891,
    agosto: 1528,
    porcentaje: '-19%',
    esSubida: false,
    explicacion: 'Materiales eléctricos para restauración de grúa torre SOIMA disminuyeron; se sumó el flete internacional (+1,2K USD) para trasladar repuestos Grúa MERCURIUS desde Europa.'
  }
];

export const TOP_VOCES_CAPEX_AGOSTO = [
  { rubro: 'MATERIALES ACERO AL CARBONO', categoria: 'Materiales Directos', monto: 12242, detalle: 'Edif. Admin: 6,5K USD Perfil HEA 200 S275JR (120 M) / 480 USD Perfil IPN 200. Construcción Galpones: 5,1K USD Cabilla Estriada 3/4" (1.560 M).' },
  { rubro: 'MATERIALES ELÉCTRICOS', categoria: 'Materiales Directos', monto: 6468, detalle: 'Patio Externo: 2,4K USD Cable THWN 4 AWG (388 M). Banco de Pruebas: 3,2K USD transformador de mando, motor ventilador y gabinete impermeable.' },
  { rubro: 'OTROS MATERIALES DE CONSTRUCCIÓN', categoria: 'Materiales Directos', monto: 5045, detalle: 'Edif. Admin: 4,6K USD 11 Láminas de piedra sinterizada 3200 x 1600 x 12 mm.' },
  { rubro: 'OTROS MATERIALES DIRECTOS', categoria: 'Materiales Directos', monto: 4018, detalle: 'Patio Externo: 2,2K USD Cemento gris Portland Tipo I + materiales de ferretería.' },
  { rubro: 'FLETE INTERNACIONAL', categoria: 'Servicios Directos', monto: 1235, detalle: 'Reacondicionamiento Grúas Torres: Traslado de materiales y repuestos desde Europa hasta TIMACA Venezuela (Proyecto Mercurius, OC TI-MER-011 y 012).' },
  { rubro: 'FLETE NACIONAL', categoria: 'Servicios Directos', monto: 8, detalle: 'Flete de suministros menores a taller.' }
];

export const TOP_VOCES_CAPEX_SEPTIEMBRE = [
  { rubro: 'TINTAS, PINTURAS Y COLORANTES', categoria: 'Materiales Directos', monto: 8119.00, detalle: 'Pintura epóxica y anticorrosiva para estructura de Galpones ($7.980), Patio ($52) y otros ($87).' },
  { rubro: 'MATERIALES ELÉCTRICOS', categoria: 'Materiales Directos', monto: 7901.22, detalle: 'Banco de pruebas 440V ($2.964,52), Patio ($3.685,23), Galpones ($435,10), Garita ($683,70).' },
  { rubro: 'MATERIALES ACERO AL CARBONO', categoria: 'Materiales Directos', monto: 5674.86, detalle: 'Edificio Administrativo ($2.793,24), Patio ($2.762,10) y Banco de pruebas ($119,52).' },
  { rubro: 'OTROS MATERIALES DIRECTOS', categoria: 'Materiales Directos', monto: 4740.89, detalle: 'Patio ($2.089,71), Edif. Admin ($1.553,49), Galpones ($582,96), Banco ($315,12).' },
  { rubro: 'COSTOS DE ELEVACIÓN', categoria: 'Materiales Directos', monto: 4500.00, detalle: 'Servicio de izamiento y grúa para montaje de vigas y techos en los 4 Galpones.' },
  { rubro: 'OTROS MATERIALES DE CONSTRUCCIÓN', categoria: 'Materiales Directos', monto: 2554.11, detalle: 'Edificio Administrativo ($2.137,75), Patio ($411,76) y Grúas Torres ($4,60).' },
  { rubro: 'SERVICIOS DIRECTOS (ELÉCTRICOS, TAPIZADO, DIAGNÓSTICO)', categoria: 'Servicios Directos', monto: 1440.00, detalle: 'Instalación y suministro eléctrico ($1.190), tapizado ($200) y diagnóstico ($50).' },
  { rubro: 'MANO DE OBRA DIRECTA (MOD ECO PROYECTOS)', categoria: 'MOD', monto: 65.00, detalle: 'Horas Hombre dedicadas a adecuación patio externo Timaca.' }
];

// OPEX: Mantenimiento de Activos Productivos (Equipos Móviles y Flota)
export const TOP_10_EQUIPOS_OPEX_AGOSTO = [
  { codigo: 'GR17', cuentaCompleta: 'EEI-C-GR17', tipo: 'Grúas', nombre: 'Grúa Grove TM 890 - 90TN', montoAgosto: 23206, serial: 'Serial 68473', variacionJulio: '+1777%', esSubida: true, detalle: 'Reemplazo de cauchos 14.00R20 ($12,6K USD) y fabricación de sello hidráulico ($7,3K USD).' },
  { codigo: 'BS13', cuentaCompleta: 'EEA-C-BS13', tipo: 'Autobuses', nombre: 'Autobús Encava ENT-900', montoAgosto: 8102, serial: 'Flota Transporte', variacionJulio: '+250%', esSubida: true, detalle: 'Motor diésel Isuzu (reparación mayor y repuestos).' },
  { codigo: 'BS10', cuentaCompleta: 'EEA-C-BS10', tipo: 'Autobuses', nombre: 'Autobús Encava ENT-330063', montoAgosto: 7217, serial: 'Flota Transporte', variacionJulio: '+190%', esSubida: true, detalle: 'Transmisión sincrónica Eaton Fuller ($6,7K USD).' },
  { codigo: 'ML03', cuentaCompleta: 'EEI-C-ML03', tipo: 'Equipos especiales', nombre: 'Manlift JLG 860SJ', montoAgosto: 5740, serial: 'Plataforma Elevadora', variacionJulio: '+45%', esSubida: true, detalle: 'Cauchos estabilizadores 18-625 ($5,7K USD).' },
  { codigo: 'CA15', cuentaCompleta: 'EEM-C-CA15', tipo: 'Camiones', nombre: 'Camión Pickman Ford Cargo 1721', montoAgosto: 5735, serial: 'Camión Plataforma', variacionJulio: '+30%', esSubida: true, detalle: 'Fabricación e instalación de plataforma metalmecánica.' },
  { codigo: 'CA14', cuentaCompleta: 'EEM-C-CA14', tipo: 'Camiones', nombre: 'Camión Pickman Ford Cargo 1721', montoAgosto: 5218, serial: 'Camión Plataforma', variacionJulio: '+25%', esSubida: true, detalle: 'Plataforma metalmecánica y tren delantero.' },
  { codigo: 'CA17', cuentaCompleta: 'EEM-C-CA17', tipo: 'Camiones', nombre: 'Camión Pickman Ford Cargo 815', montoAgosto: 4436, serial: 'Camión Liviano', variacionJulio: '+40%', esSubida: true, detalle: 'Plataforma metalmecánica y componentes de frenos.' },
  { codigo: 'CH02', cuentaCompleta: 'EEM-C-CH02', tipo: 'Chutos', nombre: 'Chuto Ford Cargo 4532E', montoAgosto: 2612, serial: 'Tractor Transporte', variacionJulio: '-10%', esSubida: false, detalle: 'Suministro e instalación de inyectores ($2,6K USD).' },
  { codigo: 'BS14', cuentaCompleta: 'EEA-C-BS14', tipo: 'Autobuses', nombre: 'Autobús Encava ENT-3300', montoAgosto: 2560, serial: 'Flota Transporte', variacionJulio: '+15%', esSubida: true, detalle: 'Cambio de ballestas y sistema eléctrico general.' },
  { codigo: 'VH37', cuentaCompleta: 'EEE-C-VH37', tipo: 'Vehículos livianos', nombre: 'Pick Up Mazda BT-50 2WD', montoAgosto: 2555, serial: 'Vehículo Taller', variacionJulio: '-5%', esSubida: false, detalle: 'Transmisión sincrónica Mazda ($2,5K USD).' },
];

export const TOP_10_EQUIPOS_OPEX_SEPTIEMBRE = [
  { codigo: 'GR23', cuentaCompleta: 'EEI-C-GR23', tipo: 'Grúas', nombre: 'Grúa Link Belt LS918 400TN Serial 43H7-4300', montoSeptiembre: 10031.68, montoCapexReclasificado: 10031.68, esCapexVidaUtil: true, detalle: 'Servicio mayor de mecanizado vástago telescópico ($9.000) y tren motriz ($1.031,68).' },
  { codigo: 'BS03', cuentaCompleta: 'EEA-C-BS03', tipo: 'Autobuses', nombre: 'Autobús Encava - Placa: FA160P', montoSeptiembre: 8957.12, montoCapexReclasificado: 8957.12, esCapexVidaUtil: true, detalle: 'Motor diésel Cummins 6CT 8.3L nuevo ($8.500) y puesta a punto de tren motriz ($457,12).' },
  { codigo: 'GR13', cuentaCompleta: 'EEI-C-GR13', tipo: 'Grúas', nombre: 'Grúa Grove RT 75S - 50TN Serial 39750', montoSeptiembre: 4585.14, montoCapexReclasificado: 0, esCapexVidaUtil: false, detalle: 'Cauchos 29.5R25 ($3.600), reparación de radiador ($700) y lubricantes ($285,14).' },
  { codigo: 'GR25', cuentaCompleta: 'EEI-C-GR25', tipo: 'Grúas', nombre: 'Grúa Grove RT750 50TN Serial: 87167', montoSeptiembre: 4302.27, montoCapexReclasificado: 0, esCapexVidaUtil: false, detalle: 'Cromado de 4 vástagos estabilizadores ($2.000) y sellos hidráulicos ($1.850).' },
  { codigo: 'GR24', cuentaCompleta: 'EEI-C-GR24', tipo: 'Grúas', nombre: 'Grúa Liebherr ITM1100/1 - 100TN Serial W09555000', montoSeptiembre: 4007.77, montoCapexReclasificado: 0, esCapexVidaUtil: false, detalle: 'Aceite ISO 68, filtros, electrodos y componentes hidráulicos.' },
  { codigo: 'RE01', cuentaCompleta: 'EEE-C-RE01', tipo: 'Equipos especiales', nombre: 'Retroexcavadora Case 580M Serie 2 Turbo', montoSeptiembre: 3220.33, montoCapexReclasificado: 0, esCapexVidaUtil: false, detalle: '2 Cubos mozo eje delantero Case ($2.300), mangueras y mantenimiento correctivo.' },
  { codigo: 'PC05', cuentaCompleta: 'TT-F-PC05', tipo: 'Pantógrafos', nombre: 'PC05 Máquina de corte por láser BODOR A12', montoSeptiembre: 2979.07, montoCapexReclasificado: 0, esCapexVidaUtil: false, detalle: 'Descargador contra sobretensiones ($2.635) y consumibles de corte láser.' },
  { codigo: 'BS15', cuentaCompleta: 'EEA-C-BS15', tipo: 'Autobuses', nombre: 'Autobús Encava ENT-3300 - Placa: 6036A1Y', montoSeptiembre: 2872.11, montoCapexReclasificado: 2872.11, esEquipoNuevo: true, esCapexVidaUtil: false, detalle: 'Turbocompresor Holset HX40 ($640), 6 cauchos 315/80R22.5 ($1.326) y radiador ($260).' },
  { codigo: 'GR17', cuentaCompleta: 'EEI-C-GR17', tipo: 'Grúas', nombre: 'Grúa Grove TM 890 - 90TN Serial 68473', montoSeptiembre: 2809.72, montoCapexReclasificado: 0, esCapexVidaUtil: false, detalle: 'Aceite hidráulico ISO 68 ($1.031,68), repuestos eléctricos y filtros.' },
  { codigo: 'PA01', cuentaCompleta: 'TT-S-C-854', tipo: 'Equipos especiales', nombre: 'Payloader Hyundai HL760-7', montoSeptiembre: 2773.78, montoCapexReclasificado: 2773.78, esCapexVidaUtil: true, detalle: 'Bomba hidráulica de freno/ventilador ($2.071,68) y mantenimiento de articulación.' },
];

export const TIPOS_EQUIPOS_OPEX_MENSUAL = [
  { tipo: 'Grúas', ene: 109389, feb: 45615, mar: 25716, abr: 27256, may: 37208, jun: 23305, jul: 32618, ago: 32364, sep: 22779.48, total: 356250.95 },
  { tipo: 'Equipos especiales', ene: 1451, feb: 3260, mar: 6931, abr: 2730, may: 5635, jun: 12720, jul: 19488, ago: 16547, sep: 8330.30, total: 77092.32 },
  { tipo: 'Vehículos livianos', ene: 621, feb: 4396, mar: 950, abr: 3423, may: 4738, jun: 4812, jul: 5561, ago: 8529, sep: 7108.00, total: 40138.54 },
  { tipo: 'Autobuses', ene: 1218, feb: 446, mar: 352, abr: 503, may: 2491, jun: 7645, jul: 7371, ago: 20833, sep: 6841.48, total: 47700.11 },
  { tipo: 'Camiones', ene: 735, feb: 1490, mar: 91, abr: 5201, may: 3433, jun: 8985, jul: 10910, ago: 20864, sep: 5075.63, total: 56783.07 },
  { tipo: 'Pantógrafos', ene: 4866, feb: 6699, mar: 7603, abr: 2973, may: 2162, jun: 100, jul: 1165, ago: 1646, sep: 3264.95, total: 30478.68 },
  { tipo: 'Máquinas de soldar', ene: 0, feb: 17, mar: 3540, abr: 996, may: 1625, jun: 813, jul: 1108, ago: 1086, sep: 2904.32, total: 12088.59 },
  { tipo: 'Semirremolques', ene: 3690, feb: 11291, mar: 4824, abr: 3459, may: 0, jun: 840, jul: 3841, ago: 62, sep: 2566.11, total: 30573.21 },
  { tipo: 'Chutos', ene: 7793, feb: 467, mar: 532, abr: 687, may: 2739, jun: 2709, jul: 2891, ago: 4499, sep: 2275.20, total: 24591.65 },
  { tipo: 'Montacargas', ene: 0, feb: 0, mar: 0, abr: 91, may: 3035, jun: 4906, jul: 1077, ago: 3366, sep: 1608.85, total: 14082.85 },
  { tipo: 'Equipos Taller Fabricación', ene: 2867, feb: 2521, mar: 5485, abr: 1678, may: 45, jun: 263, jul: 39, ago: 457, sep: 1289.13, total: 14644.56 },
  { tipo: 'Equipos de mecanizado', ene: 10, feb: 95, mar: 781, abr: 0, may: 891, jun: 778, jul: 189, ago: 147, sep: 898.34, total: 3789.40 },
  { tipo: 'Compresores', ene: 954, feb: 139, mar: 3896, abr: 555, may: 270, jun: 1165, jul: 8353, ago: 2491, sep: 500.46, total: 18323.01 },
];

export const VOCES_GASTO_OPEX_FLOTA_AGOSTO = [
  { rubro: 'CAUCHOS Y TRIPAS PARA VEHÍCULOS', grupo: 'Materiales Directos', monto: 22447, detalle: '12,6K USD en reemplazo cauchos 14.00R20 para GR17 y 5,7K USD en cauchos estabilizadores 18-625 para ML03.' },
  { rubro: 'REP. Y ACC TREN MOTRIZ AUTOMOTOR', grupo: 'Materiales Directos', monto: 20889, detalle: '14,8K USD en autobuses (Motor Isuzu BS13 - $8K, transmisión Eaton Fuller BS10 - $6,7K), $2,5K transmisión Mazda VH37 y $1,3K cámara Cummins CA02.' },
  { rubro: 'OTROS MATERIALES DIRECTOS', grupo: 'Materiales Directos', monto: 12314, detalle: '12,1K USD repuestos varios hidroneumáticos, eléctricos y mecánicos. Protección eléctrica de pantógrafo ($1,4K) y reparación GR17 ($0,7K).' },
  { rubro: 'ACEITE HIDRÁULICO', grupo: 'Materiales Directos', monto: 6455, detalle: 'Aceite ISO 68 en equipos especiales ($3,1K en EX01 y PA01) y grúas ($2,2K en GR17, GR19 y GR20).' },
  { rubro: 'REP. Y ACC. ELÉCTRICOS AUTOMOTOR', grupo: 'Materiales Directos', monto: 3879, detalle: '3,9K USD baterías y componentes eléctricos en vehículos livianos ($1,2K en VH47 y VH51) y compresores ($600 en CO15 y CO16).' },
  { rubro: 'GRASA Y ACEITES LUBRICANTES', grupo: 'Materiales Directos', monto: 3675, detalle: '3,7K USD aceite de motor y refrigerante, principalmente en grúas ($1,2K) y camiones.' },
  { rubro: 'SERVICIO DE FABRICACIÓN METALMECÁNICA', grupo: 'Servicios', monto: 14400, detalle: '14,4K USD fabricación e instalación de plataformas para camiones Ford Cargo (CA14, CA15 y CA17).' },
  { rubro: 'FABRICACIÓN SELLO HIDRÁULICO', grupo: 'Servicios', monto: 12805, detalle: '12,8K USD concentrado en grúas GR17 y GR25 ($9,1K USD); resto en equipos especiales y montacargas.' },
  { rubro: 'MANTENIMIENTO DE INYECTORES', grupo: 'Servicios', monto: 2600, detalle: '2,6K USD suministro e instalación de inyectores en Chuto Ford Cargo (CH02).' },
  { rubro: 'REPARACIÓN COMPRESOR NEUMÁTICO DE FRENO', grupo: 'Servicios', monto: 1400, detalle: '1,4K USD en grúa ($800 en GR13) y camión ($600 en CA01).' },
  { rubro: 'OTROS SERVICIOS DIRECTOS', grupo: 'Servicios', monto: 2943, detalle: '2,9K USD reparación de radiador (GR11, GR13, CA11) y cilindros hidráulicos (MC06).' },
  { rubro: 'MANO DE OBRA DIRECTA (MOD FLOTA)', grupo: 'MOD', monto: 9644, detalle: '4.697 Horas Hombre ejecutadas por 27 técnicos y mecánicos de planta.' },
];

export const VOCES_GASTO_OPEX_FLOTA_SEPTIEMBRE = [
  { rubro: 'CAUCHOS Y TRIPAS PARA VEHÍCULOS', grupo: 'Materiales Directos', monto: 12152.00, detalle: 'Grúas ($8.100), Vehículos livianos ($1.568,67), Autobuses ($660), Equipos especiales ($175), Otros ($1.648,17).' },
  { rubro: 'OTROS MATERIALES DIRECTOS', grupo: 'Materiales Directos', monto: 7450.16, detalle: 'Insumos varios en autobuses ($1.367,47), grúas ($868,31), vehículos ($738,93) y otros talleres ($3.960).' },
  { rubro: 'REP. HIDRONEUMÁTICO P/AUTOMOTOR', grupo: 'Materiales Directos', monto: 5024.34, detalle: 'Grúas ($2.122,78), Equipos especiales ($696,92), Autobuses ($528,76) y otros ($1.564,02).' },
  { rubro: 'ACEITE HIDRÁULICO', grupo: 'Materiales Directos', monto: 4023.58, detalle: 'Grúas ($1.542,80), Equipos especiales ($1.144,73), Autobuses ($97,20), Otros ($1.238,85).' },
  { rubro: 'GRASA Y ACEITES LUBRICANTES', grupo: 'Materiales Directos', monto: 3381.56, detalle: 'Vehículos ($578,72), Grúas ($567), Autobuses ($472,50), Equipos especiales ($346,50), Otros ($1.416,84).' },
  { rubro: 'REP. Y ACC TREN MOTRIZ AUTOMOTOR', grupo: 'Materiales Directos', monto: 2954.14, detalle: 'Autobuses ($1.095), Vehículos livianos ($865,34), Equipos especiales ($278,80), Otros ($675).' },
  { rubro: 'MATERIALES ELÉCTRICOS', grupo: 'Materiales Directos', monto: 2900.77, detalle: 'Talleres generales ($2.830,07), Grúas ($27,42), Autobuses ($28,67).' },
  { rubro: 'REP. Y ACC TREN RODAJE AUTOMOTOR', grupo: 'Materiales Directos', monto: 2835.46, detalle: 'Equipos especiales ($2.346,12), Autobuses ($400,80), Vehículos livianos ($88,54).' },
  { rubro: 'REP. Y ACC ELÉCTRICOS AUTOMOTOR', grupo: 'Materiales Directos', monto: 2013.00, detalle: 'Grúas ($386,06), Equipos especiales ($366,30), Autobuses ($263,91), Vehículos ($321,22).' },
  { rubro: 'FABRICACIÓN SELLO HIDRÁULICO', grupo: 'Servicios', monto: 5101.00, detalle: 'Sellos hidráulicos para grúas GR17 y GR25 ($3.875) y equipos especiales ($1.226).' },
  { rubro: 'MANTENIMIENTO EQUIPOS SOLDADURA Y OXICORTE', grupo: 'Servicios', monto: 2600.00, detalle: 'Mantenimiento especializado de máquinas de soldar y equipos de oxicorte de taller.' },
  { rubro: 'SERVICIO DE CROMADO DE VÁSTAGOS', grupo: 'Servicios', monto: 2000.00, detalle: 'Cromado duro de vástagos en cilindros estabilizadores Grúa Grove RT750 GR25.' },
  { rubro: 'REPARACIÓN DE RADIADORES', grupo: 'Servicios', monto: 930.00, detalle: 'Reparación de radiadores en Grúa GR13 ($500), camiones ($380) y vehículos ($50).' },
  { rubro: 'CRISTALERÍA Y CÁMARA DE MOTOR', grupo: 'Servicios', monto: 1404.00, detalle: 'Servicio técnico de cámara de motor ($688) y cristalería de cabinas ($716).' },
  { rubro: 'MANO DE OBRA DIRECTA (MOD FLOTA)', grupo: 'MOD', monto: 8679.44, detalle: 'Horas Hombre imputadas a flota: Grúas ($2.344), Camiones ($1.589), Buses ($1.175), Livianos ($1.004).' }
];

// OPEX: Mano de Obra Directa de Mantenimiento (Agosto 2026)
export const MOD_MANTENIMIENTO_FLOTA_AGOSTO = {
  totalTrabajadores: 27,
  totalHorasHombres: 4697,
  tarifaPromedioHora: 2.05,
  costoTotalMOD: 9644,
  evolutivoSemanas: [
    { periodo: '01 Ago', horas: 143, detalle: 'Día suelto: EX01 y PA02 (motor y sistema hidráulico).' },
    { periodo: '03 al 08 Ago', horas: 1114, detalle: 'Alta carga: Equipos Especiales (341H, EX01 y PA02) y Grúas (264H, GR17 con 108H cauchos y cilindros).' },
    { periodo: '10 al 15 Ago', horas: 1098, detalle: 'Mantenimiento preventivo general y camiones.' },
    { periodo: '17 al 22 Ago', horas: 1031, detalle: 'Reparación de transmisiones e inyectores.' },
    { periodo: '24 al 29 Ago', horas: 1121, detalle: 'Pico de trabajo: Equipos especiales (218H), autobuses (203H en BS14) y grúas (165H en GR17).' },
    { periodo: '31 Ago', horas: 190, detalle: 'Cierre de mes: CH10 y CA10 (frenos e iluminación).' },
  ],
  desglosePorTipoEquipo: [
    { tipo: 'Grúas', trabajadores: 16, totalHH: 1062, tarifaPromedio: 2.08, costoTotalMOD: 2207 },
    { tipo: 'Equipos especiales', trabajadores: 18, totalHH: 899, tarifaPromedio: 2.05, costoTotalMOD: 1842 },
    { tipo: 'Vehículos livianos', trabajadores: 14, totalHH: 612, tarifaPromedio: 2.06, costoTotalMOD: 1261 },
    { tipo: 'Autobuses', trabajadores: 22, totalHH: 584, tarifaPromedio: 2.08, costoTotalMOD: 1217 },
    { tipo: 'Camiones', trabajadores: 16, totalHH: 348, tarifaPromedio: 2.05, costoTotalMOD: 714 },
    { tipo: 'Montacargas', trabajadores: 16, totalHH: 265, tarifaPromedio: 2.08, costoTotalMOD: 550 },
    { tipo: 'Chutos', trabajadores: 15, totalHH: 242, tarifaPromedio: 1.96, costoTotalMOD: 474 },
    { tipo: 'Compresores', trabajadores: 10, totalHH: 186, tarifaPromedio: 2.02, costoTotalMOD: 376 },
    { tipo: 'Máquinas de soldar', trabajadores: 8, totalHH: 109, tarifaPromedio: 2.14, costoTotalMOD: 233 },
    { tipo: 'Equipos mecanizado', trabajadores: 3, totalHH: 68, tarifaPromedio: 2.01, costoTotalMOD: 137 },
    { tipo: 'Taller fabricación', trabajadores: 2, totalHH: 66, tarifaPromedio: 2.03, costoTotalMOD: 134 },
    { tipo: 'Otros equipos', trabajadores: 5, totalHH: 265, tarifaPromedio: 1.95, costoTotalMOD: 499 },
  ]
};

// OPEX: Mantenimiento de Infraestructura (Enero - Septiembre 2026)
export const MANTTO_INFRAESTRUCTURA_2026 = {
  totalAgosto: 40545.39,
  totalSeptiembre: 42818.77,
  totalAcumulado2026: 402641.72,
  variacionVsJulio: -3,
  variacionSepVsAgosto: 6.0,
  proyectoMayorIncremento: {
    nombre: 'Adecuaciones y/o mejoras',
    cuenta: 'TT-I-C-033',
    montoAgosto: 31297,
    montoSeptiembre: 27777.02,
    variacionVsJulio: 59,
  },
  horasHombre: 1145,
  costoMOD: 2127,
  cuentas: [
    { cuenta: 'TT-I-C-033', descripcion: 'Adecuaciones y/o mejoras', ene: 50421, feb: 3299, mar: 3920, abr: 827, may: 1072, jun: 5271, jul: 19651, ago: 31297, sep: 27777.02, total: 143534.62, variacionJulAgo: '+59%', variacionAgoSep: '-11%' },
    { cuenta: 'TT-G-C-032', descripcion: 'Mantto y Adecuaciones Galpones - Fab', ene: 22966, feb: 432, mar: 126, abr: 342, may: 2043, jun: 2024, jul: 73, ago: 1809, sep: 5073.57, total: 34887.83, variacionJulAgo: '+2387%', variacionAgoSep: '+180%' },
    { cuenta: 'TT-A-C-207', descripcion: 'Mantto herramientas y accesorios - Almacen', ene: 55775, feb: 14307, mar: 70, abr: 4065, may: 2218, jun: 777, jul: 14107, ago: 444, sep: 4150.98, total: 95914.32, variacionJulAgo: '-97%', variacionAgoSep: '+835%' },
    { cuenta: 'TT-H-C-031', descripcion: 'Mantto herramientas y accesorios - Fab', ene: 3838, feb: 27224, mar: 3935, abr: 1146, may: 7589, jun: 1916, jul: 3063, ago: 1051, sep: 1888.60, total: 51651.12, variacionJulAgo: '-66%', variacionAgoSep: '+80%' },
    { cuenta: 'EE-G-C-016', descripcion: 'Mantto y Adecuaciones Galpones - Mantto', ene: 2803, feb: 87, mar: 224, abr: 736, may: 3235, jun: 1497, jul: 855, ago: 1361, sep: 1547.57, total: 12344.50, variacionJulAgo: '+59%', variacionAgoSep: '+14%' },
    { cuenta: 'SS-G-C-025', descripcion: 'Mantto y Adecuaciones Galpones - SMB', ene: 419, feb: 2052, mar: 919, abr: 4694, may: 1912, jun: 1134, jul: 438, ago: 1085, sep: 972.63, total: 13625.51, variacionJulAgo: '+148%', variacionAgoSep: '-10%' },
    { cuenta: 'TT-A-C-208', descripcion: 'Mantto y Adecuaciones Galpones -  Almacen', ene: 3143, feb: 144, mar: 2482, abr: 3801, may: 1262, jun: 2340, jul: 448, ago: 1040, sep: 585.84, total: 15245.27, variacionJulAgo: '+132%', variacionAgoSep: '-44%' },
    { cuenta: 'EE-H-C-015', descripcion: 'Mantto herramientas y accesorios - Mantto', ene: 5677, feb: 2544, mar: 6452, abr: 10176, may: 85, jun: 203, jul: 2516, ago: 2141, sep: 555.46, total: 30349.08, variacionJulAgo: '-15%', variacionAgoSep: '-74%' },
    { cuenta: 'TT-H-C-033', descripcion: 'Mantto herramientas - Sandblasting', ene: 0, feb: 0, mar: 1, abr: 0, may: 125, jun: 0, jul: 690, ago: 205, sep: 138.46, total: 1159.56, variacionJulAgo: '-70%', variacionAgoSep: '-32%' },
    { cuenta: 'SS-H-C-024', descripcion: 'Mantto herramientas - SMB', ene: 93, feb: 0, mar: 7, abr: 0, may: 261, jun: 575, jul: 45, ago: 18, sep: 81.56, total: 1080.62, variacionJulAgo: '-60%', variacionAgoSep: '+351%' },
    { cuenta: 'TT-G-C-034', descripcion: 'Mantto Galpones - Sandblasting', ene: 63, feb: 240, mar: 2013, abr: 139, may: 229, jun: 10, jul: 14, ago: 94, sep: 47.09, total: 2849.30, variacionJulAgo: '+596%', variacionAgoSep: '-50%' },
  ],
  notasExplicativas: [
    '• Incrementos: TT-A-C-207: se gastó más en materiales eléctricos para cable de armado de extensión y otros de uso de almacén, pero también se hicieron reparaciones de esmeriles; TT-G-C-032: en agosto fue la adquisición de láminas losacero para el techo y en septiembre el pago de la mano de obra por el montaje de esas láminas; TT-H-C-031: mantenimiento y repuestos para herramientas de fabricación.',
    '• Disminuciones: EE-H-C-015: 900$ fueron un servicio de fabricación para un martillo hidráulico y 800,47$ para la reparación de punta de eje donde se usaron 7KG de electrodo ENICL NIQUEL 100 BASICO 1/8" AWS A5.15. En septiembre son 396,37$ en equipos y consumibles de soldadura (se usó ese mismo electrodo pero 4kg y acoples chicago para sistema neumático); TT-A-C-208: servicio de fabricación de sello hidráulico.'
  ]
};

// OPEX: Flota de Grúas TIMACA (26 Grúas Activas)
export const FLOTA_GRUAS_TIMACA_2026 = {
  totalAgosto: 32363.93,
  totalSeptiembre: 22779.48,
  totalAcumulado2026: 356250.93,
  variacionVsJulio: -1,
  variacionSepVsAgosto: -30.0,
  gruasActivas: 26,
  gruaMayorGastoAgosto: {
    codigo: 'EEI-C-GR17',
    nombre: 'Grúa Grove TM 890 - 90TN Serial 68473',
    montoAgosto: 23206.14,
    montoJulio: 1236,
    variacionVsJulio: 1777,
  },
  gruaMayorGastoSeptiembre: {
    codigo: 'EEI-C-GR13',
    nombre: 'GRUA GROVE RT 75S - 50TN SERIAL 39750',
    montoSeptiembre: 4585.14,
    montoAgosto: 1489.60,
    variacionVsAgosto: 208,
  },
  top5GruasAgosto: [
    { codigo: 'EEI-C-GR17', descripcion: 'Grua Grove TM 890 - 90TN Serial 68473', monto: 23206.14, variacion: '+1777%' },
    { codigo: 'EEI-C-GR25', descripcion: 'Grua Grove RT750 50TN Serial: 87167', monto: 1546.40, variacion: '-47%' },
    { codigo: 'EEI-C-GR13', descripcion: 'Grua Grove RT 75S - 50TN Serial 39750', monto: 1489.60, variacion: '+110%' },
    { codigo: 'EEI-C-GR20', descripcion: 'Grua Demag AC-200 - 200TN Serial 74599126', monto: 1253.70, variacion: '-50%' },
    { codigo: 'EEI-C-GR07', descripcion: 'Grua P&H R200 - 20TN Serial 35021', monto: 1117.84, variacion: '+405%' },
    { codigo: 'OTRAS', descripcion: 'Otras Grúas de la Flota', monto: 3750.25, variacion: '-15%' },
  ],
  top5GruasSeptiembre: [
    { codigo: 'EEI-C-GR13', descripcion: 'GRUA GROVE RT 75S - 50TN SERIAL 39750', monto: 4585.14, variacion: '▲ 208% vs Ago', esCapex: false },
    { codigo: 'EEI-C-GR25', descripcion: 'Grua Grove RT750 50TN Serial: 87167', monto: 4302.27, variacion: '▲ 178% vs Ago', esCapex: false },
    { codigo: 'EEI-C-GR24', descripcion: 'Grua Liebherr ITM1100/1 - 100TN Serial W09555000', monto: 4007.77, variacion: '▲ 17325% vs Ago', esCapex: false },
    { codigo: 'EEI-C-GR17', descripcion: 'Grua Grove TM 890 - 90TN Serial 68473', monto: 2809.72, variacion: '▼ 88% vs Ago', esCapex: false },
    { codigo: 'EEI-C-GR15', descripcion: 'Grua Grove AT 865(N) - 65TN Serial 46105', monto: 2203.58, variacion: '▲ Activa', esCapex: false },
    { codigo: 'EEI-C-GR12', descripcion: 'Grua Grove RT 740B - 40TN Serial 84688', monto: 1925.59, variacion: '▲ 11935% vs Ago', esCapex: false },
    { codigo: 'OTRAS', descripcion: 'Otras 20 Grúas de la Flota TIMACA', monto: 4870.48, variacion: 'Mantenimiento Preventivo', esCapex: false },
  ],
  detalleGruasMayorVariacion: [
    { codigo: 'EEI-C-GR13', proyecto: 'GRUA GROVE RT 75S - 50TN SERIAL 39750', ene: 288, feb: 958, mar: 0, abr: 3624, may: 7905, jun: 35, jul: 709, ago: 1490, sep: 4585.14, variacion: '▲ 208%' },
    { codigo: 'EEI-C-GR25', proyecto: 'Grua Grove RT750 50TN Serial: 87167', ene: 0, feb: 0, mar: 0, abr: 3050, may: 355, jun: 238, jul: 2945, ago: 1546, sep: 4302.27, variacion: '▲ 178%' },
    { codigo: 'EEI-C-GR24', proyecto: 'Grua Liebherr ITM1100/1 - 100TN Serial W09555000', ene: 40453, feb: 1, mar: 16717, abr: 113, may: 990, jun: 560, jul: 2429, ago: 23, sep: 4007.77, variacion: '▲ 17325%' },
    { codigo: 'EEI-C-GR17', proyecto: 'Grua Grove TM 890 - 90TN Serial 68473', ene: 0, feb: 1065, mar: 1083, abr: 1630, may: 29, jun: 1081, jul: 1236, ago: 23206, sep: 2809.72, variacion: '▼ 88%' },
    { codigo: 'EEI-C-GR15', proyecto: 'Grua Grove AT 865(N) - 65TN Serial 46105', ene: 18370, feb: 3576, mar: 1176, abr: 2969, may: 525, jun: 1796, jul: 2804, ago: 0, sep: 2203.58, variacion: '▲ Activa' },
    { codigo: 'EEI-C-GR12', proyecto: 'Grua Grove RT 740B - 40TN Serial 84688', ene: 1077, feb: 1478, mar: 569, abr: 1290, may: 123, jun: 27, jul: 0, ago: 16, sep: 1925.59, variacion: '▲ 11935%' },
  ],
  analisisCausas: [
    'Subieron: GR13 y GR24: reemplazo de cauchos (4,5K y 3,6K USD); GR25: servicio de cromado de vástago (2,0K USD) y fabricación de sellos hidráulicos (1,9K USD); GR15 y GR12: sellos de cilindro telescópico (1,8K USD) y kit de sellos para motor winche (1,8K USD). Bajaron: GR17: en agosto se ejecutó reemplazo de cauchos (12,6K USD) y sellos hidráulicos (7,3K USD) que no se repitieron en septiembre, quedando 2,8K USD principalmente en aceite hidráulico (1,0K USD) y mantenimiento menor.',
    'Agosto 2026 ($32.364 USD): GR17 lideró por reemplazo de cauchos 14.00R20 ($12,6K USD) y fabricación de sello hidráulico ($7,3K USD).'
  ]
};

// BLOQUE 4: GASTOS ADMINISTRATIVOS (ADMON) - SEPTIEMBRE 2026 ($31.339,57 USD Master)
export interface CuentaAdmonInterno {
  cuenta: string;
  departamento: string;
  materialesUsd: number;
  serviciosUsd: number;
  totalSepUsd: number;
  principalesConsumos: string;
}

export const CUENTAS_ADMON_SEPTIEMBRE_2026: CuentaAdmonInterno[] = [
  { cuenta: 'TT-A-C-505', departamento: 'Departamento de Fabricación', materialesUsd: 8090.28, serviciosUsd: 1229.42, totalSepUsd: 9319.70, principalesConsumos: 'Señoritas de cadena y rachet ($2.600), cables eléctricos ST/THHW ($810), EPP, oxígeno y exámenes médicos.' },
  { cuenta: 'TT-A-C-205', departamento: 'Departamento de Tecnología', materialesUsd: 4614.24, serviciosUsd: 1790.80, totalSepUsd: 6405.04, principalesConsumos: 'Mini PC i5 16GB ($2.000), actualización de software ($1.366,80), Access Point EAP225 ($660) y monitores Full HD ($540).' },
  { cuenta: 'TT-A-C-202', departamento: 'Departamento de Procura', materialesUsd: 2963.71, serviciosUsd: 131.98, totalSepUsd: 3095.69, principalesConsumos: 'Fletes nacionales de procura, papelería e insumos operativos de compras.' },
  { cuenta: 'TT-A-C-203', departamento: 'Sección de Almacén', materialesUsd: 1318.82, serviciosUsd: 1472.93, totalSepUsd: 2791.75, principalesConsumos: 'Servicio de mantenimiento y recarga de extintores ($1.223,93) y tóner Xerox WorkCentre ($850).' },
  { cuenta: 'TT-A-C-600', departamento: 'Gerencia de Recursos Humanos', materialesUsd: 1312.04, serviciosUsd: 695.92, totalSepUsd: 2007.96, principalesConsumos: 'Dispensadores de agua ($493,98), tóner VersaLink ($490) y servicios de personal.' },
  { cuenta: 'TT-A-C-700', departamento: 'Centro de Recreación', materialesUsd: 1579.58, serviciosUsd: 0, totalSepUsd: 1579.58, principalesConsumos: 'Compresor monofásico 54MBTU R410 de aire acondicionado 5TN ($1.155) y materiales de mantenimiento.' },
  { cuenta: 'TT-A-C-100', departamento: 'Gerencia General', materialesUsd: 879.12, serviciosUsd: 532.48, totalSepUsd: 1411.60, principalesConsumos: 'Insumos de gerencia, suministros de oficina y servicios administrativos.' },
  { cuenta: 'EE-A-C-510', departamento: 'Sección Mantenimiento Mecánico', materialesUsd: 671.27, serviciosUsd: 239.48, totalSepUsd: 910.75, principalesConsumos: 'Piñón de cadena con cojinete ($213), herramientas manuales, EPP y consumibles de taller.' },
  { cuenta: 'EE-A-C-511', departamento: 'Departamento de Servicios ECO', materialesUsd: 906.62, serviciosUsd: 0, totalSepUsd: 906.62, principalesConsumos: 'Equipos de protección personal, hielo/agua potable e insumos de operaciones móviles.' },
  { cuenta: 'TT-A-C-508', departamento: 'Dpto. Ingeniería y Desarrollo', materialesUsd: 583.93, serviciosUsd: 174.00, totalSepUsd: 757.93, principalesConsumos: 'Tóner alta capacidad B7035 ($485), papelería técnica y servicios.' },
  { cuenta: 'OTRAS-ADMON', departamento: 'Otras 14 Cuentas Administrativas (Seguridad, Costos, Admin, Elec, etc.)', materialesUsd: 1709.49, serviciosUsd: 443.46, totalSepUsd: 2152.95, principalesConsumos: 'Coord. Seguridad ($450,56), Estimación de Costos ($438,30), Administración ($377,44), Electricidad ($358,14), Serv. Generales ($331,43), etc.' }
];

// ACTIVOS PRODUCTIVOS CAPEX (NIC 16) - SEPTIEMBRE 2026 ($28.328,84 USD)
export interface ActivoCapitalizadoNIC16 {
  codigo: string;
  nombre: string;
  tipo: string;
  categoriaReclasificacion: 'Extensión de Vida Útil' | 'Nueva Adquisición';
  montoUsd: number;
  materialesUsd: number;
  serviciosUsd: number;
  modUsd: number;
  intervencionMayor: string;
  criterioNIC16: string;
  componentes: string[];
}

export const ACTIVOS_PRODUCTIVOS_CAPEX_NIC16_SEPTIEMBRE = {
  totalCapitalizado: 28328.84,
  totalAcumulado2026: 28328.84,
  totalExtensionVidaUtil: 24317.30,
  totalNuevasAdquisiciones: 4011.54,
  totalesPorVozGasto: {
    materiales: 17489.17,
    servicios: 10637.57,
    mod: 202.10,
    total: 28328.84
  },
  criterioNormativo: 'NIC 16 (Propiedad, Planta y Equipo): Reclasificación por extensión de vida útil operativa ($24.317,30) y nuevas adquisiciones de flota ($4.011,54).',
  impactoOpex: 'Explica la reducción del gasto operativo de flota de $113.450 en Agosto a $65.757 en Septiembre (▼ 42%).',
  equipos: [
    {
      codigo: 'EEI-C-GR23',
      nombre: 'Grúa Link Belt LS918 400TN Serial 43H7-4300',
      tipo: 'Grúas Pesadas',
      categoriaReclasificacion: 'Extensión de Vida Útil' as const,
      montoUsd: 10031.68,
      materialesUsd: 1031.68,
      serviciosUsd: 9000.00,
      modUsd: 0.00,
      intervencionMayor: 'Servicio mayor de mecanizado integral en vástago y tornamesa ($9.000,00) y sellos hidráulicos de alta presión ($1.031,68).',
      criterioNIC16: 'Extensión de vida útil operativa para servicios pesados de izamiento en la grúa de mayor capacidad.',
      componentes: [
        'Servicio especializado de mecanizado de vástago del telescópico y rectificado de rosca: $9.000,00',
        'Aceite hidráulico y sellos de alta presión para tornamesa: $1.031,68'
      ]
    },
    {
      codigo: 'EEA-C-BS03',
      nombre: 'Autobús Encava - Placa: FA160P',
      tipo: 'Transporte de Personal',
      categoriaReclasificacion: 'Extensión de Vida Útil' as const,
      montoUsd: 8957.12,
      materialesUsd: 8500.00,
      serviciosUsd: 457.12,
      modUsd: 0.00,
      intervencionMayor: 'Adquisición e instalación de motor diésel Cummins 6CT 8.3L nuevo ($8.500,00) y puesta a punto de tren motriz ($457,12).',
      criterioNIC16: 'Reemplazo de motor a 0 horas que extiende sustancialmente la vida útil del autobús por más de 5 años.',
      componentes: [
        'Motor Diésel Cummins 6CT 8.3L 6 cil 225 HP nuevo (DP0039990): $8.500,00',
        'Filtros, correas, lubricantes de rodaje y accesorios de acople: $457,12'
      ]
    },
    {
      codigo: 'EEA-C-BS15',
      nombre: 'Autobús Encava ENT-3300 - Placa: 6036A1Y',
      tipo: 'Transporte de Personal',
      categoriaReclasificacion: 'Nueva Adquisición' as const,
      montoUsd: 2872.11,
      materialesUsd: 2872.11,
      serviciosUsd: 0.00,
      modUsd: 0.00,
      intervencionMayor: 'Acondicionamiento general de ingreso: turbocompresor Holset HX40, 6 cauchos radiales 315/80R22.5 y radiador.',
      criterioNIC16: 'Erogación inicial de puesta a punto para habilitación de activo nuevo en flota.',
      componentes: [
        'Turbocompresor Holset HX40 Motor Cummins 6CT: $640,00',
        'Juego de 6 neumáticos radiales 315/80R22.5: $1.326,00',
        'Radiador de enfriamiento, mangueras, aceite transmisión Dexron III y kit de filtros: $906,11'
      ]
    },
    {
      codigo: 'TT-S-C-854',
      nombre: 'Payloader Hyundai HL760-7 (PA01)',
      tipo: 'Movimiento de Tierra',
      categoriaReclasificacion: 'Extensión de Vida Útil' as const,
      montoUsd: 2773.78,
      materialesUsd: 2071.68,
      serviciosUsd: 500.00,
      modUsd: 202.10,
      intervencionMayor: 'Bomba hidráulica de freno/ventilador 31LD-40500 ($2.071,68), calibración de presiones ($500,00) y mano de obra ($202,10).',
      criterioNIC16: 'Intervención mayor que restaura la capacidad de frenado y carga del equipo en operaciones pesadas.',
      componentes: [
        'Bomba hidráulica principal de freno y enfriador 31LD-40500 (DP0039995): $2.071,68',
        'Servicio especializado de calibración electrohidráulica: $500,00',
        'Mano de obra directa técnica especializada: $202,10'
      ]
    },
    {
      codigo: 'EEI-C-GR22',
      nombre: 'Grúa Liebherr LTM1400 - 400TN Serial W09858000NEL05061',
      tipo: 'Grúas Pesadas',
      categoriaReclasificacion: 'Extensión de Vida Útil' as const,
      montoUsd: 2554.72,
      materialesUsd: 1854.72,
      serviciosUsd: 700.00,
      modUsd: 0.00,
      intervencionMayor: 'Válvulas proporcionales y mangueras de alta presión ($1.854,72) más servicio de calibración de sistema de pluma ($700,00).',
      criterioNIC16: 'Garantiza disponibilidad y confiabilidad técnica en grúa insignia de 400TN.',
      componentes: [
        'Válvulas proporcionales electrohidráulicas y conexiones de alta presión: $1.854,72',
        'Servicio técnico especializado de regulación y calibración de presiones de pluma: $700,00'
      ]
    },
    {
      codigo: 'EEE-C-VH52',
      nombre: 'Pick Up Mazda BT-50 2WD - Placa 04XFAJ',
      tipo: 'Vehículos Livianos',
      categoriaReclasificacion: 'Nueva Adquisición' as const,
      montoUsd: 544.96,
      materialesUsd: 544.96,
      serviciosUsd: 0.00,
      modUsd: 0.00,
      intervencionMayor: 'Puesta a punto de ingreso: aceites 80W90 y 15W40, pila de gasolina Bosch, correas dentadas y filtros.',
      criterioNIC16: 'Acondicionamiento de ingreso para unidad de supervisión operativa.',
      componentes: [
        'Aceite de transmisión 80W90 y motor 15W40: $163,45',
        'Pila de gasolina Bosch, conector y cables de bujías: $68,50',
        'Correas de distribución, filtros y consumibles menores: $313,01'
      ]
    },
    {
      codigo: 'EEE-C-PA03',
      nombre: 'Payloader Caterpillar 962G',
      tipo: 'Equipos Especiales',
      categoriaReclasificacion: 'Nueva Adquisición' as const,
      montoUsd: 259.73,
      materialesUsd: 259.73,
      serviciosUsd: 0.00,
      modUsd: 0.00,
      intervencionMayor: 'Inspección técnica inicial y consumibles de lubricación y filtros de aire para habilitación operativa.',
      criterioNIC16: 'Habilitación técnica de equipo incorporado.',
      componentes: [
        'Filtros de aire primario y secundario: $145,00',
        'Aceite hidráulico ISO 68 y grasas de alta presión: $114,73'
      ]
    },
    {
      codigo: 'EEE-C-TR01',
      nombre: 'Traktor Caterpillar D6R-XL2',
      tipo: 'Equipos Especiales',
      categoriaReclasificacion: 'Nueva Adquisición' as const,
      montoUsd: 245.14,
      materialesUsd: 0.00,
      serviciosUsd: 245.14,
      modUsd: 0.00,
      intervencionMayor: 'Servicio de soldadura y reparación de radiador y tanque compensador de refrigerante.',
      criterioNIC16: 'Puesta a punto de activo productivo para arranque en obra.',
      componentes: [
        'Servicio de reparación estructural y prueba de presión en radiador: $245,14'
      ]
    },
    {
      codigo: 'TT-F-CO19',
      nombre: 'Compresor SULLAIR 185 45.5 KW 185 CFM Serial 201012180072',
      tipo: 'Compresores',
      categoriaReclasificacion: 'Nueva Adquisición' as const,
      montoUsd: 55.71,
      materialesUsd: 55.71,
      serviciosUsd: 0.00,
      modUsd: 0.00,
      intervencionMayor: 'Aceite sintético para compresor y acoples rápidos de manguera.',
      criterioNIC16: 'Puesta en marcha de compresor neumático nuevo.',
      componentes: [
        'Aceite sintético de compresión y acoples rápidos: $55,71'
      ]
    },
    {
      codigo: 'TT-F-CO20',
      nombre: 'Compresor SULLAIR 185 45.5 KW 185 CFM Serial 201112120050',
      tipo: 'Compresores',
      categoriaReclasificacion: 'Nueva Adquisición' as const,
      montoUsd: 33.89,
      materialesUsd: 33.89,
      serviciosUsd: 0.00,
      modUsd: 0.00,
      intervencionMayor: 'Mangueras neumáticas y acoples universales tipo Chicago para línea de aire.',
      criterioNIC16: 'Puesta en marcha de compresor neumático nuevo.',
      componentes: [
        'Mangueras neumáticas y acoples universales tipo Chicago: $33,89'
      ]
    }
  ]
};

// MANO DE OBRA DIRECTA (MOD) ECO - SEPTIEMBRE 2026 (5.963 HH AUDITADAS)
export const MOD_MANTENIMIENTO_FLOTA_SEPTIEMBRE = {
  totalTrabajadores: 32,
  totalHorasHombres: 5963,
  tarifaPromedioHora: 2.05,
  costoTotalMOD: 12224.15,
  evolutivoSemanas: [
    { periodo: '01 al 05 Sep', horas: 1164, detalle: 'Arranque regular de mes: Grúas (248H, GR17 con 68H en cauchos y cilindros), mantenimiento de áreas y galpones (209H) y lubricador CA06 (84H en surtido).' },
    { periodo: '07 al 12 Sep', horas: 1441, detalle: 'Pico máximo del mes: Grúas (280H, GR17 con 128H en mangueras de extensiones y estabilizadores) y Camiones (201H, lubricador CA06 con 108H en surtido gasoil TIMACA/FMO/Pellas).' },
    { periodo: '14 al 19 Sep', horas: 1401, detalle: 'Segundo pico de carga: Grúas (249H, GR15 con 87H en winche y fugas), Equipos Especiales (224H, PA03 con 96H y tractor TR01 con 77H en radiador y tejas) y Camiones (209H).' },
    { periodo: '21 al 26 Sep', horas: 1232, detalle: 'Alta intensidad técnica en Autobuses (253H, armado e instalación de motor y transmisión en BS03 con 107H y BS13 con 91H) y Grúas (253H en GR15 y GR20).' },
    { periodo: '28 al 30 Sep', horas: 725, detalle: 'Menor volumen por cierre de mes de solo 3 días laborables (lunes a miércoles); destacaron GR25 (90H en cilindros y vástago) y culminación de motor/transmisión en autobuses (197H).' }
  ],
  analisisTexto: 'Del total de 5.963 HH del mes, dos semanas marcaron los picos de mayor carga: 07 al 12 (1.441H), concentrada en Grúas (280H, GR17 con 128H — mangueras de extensiones y estabilizadores) y Camiones (201H, lubricador CA06 con 108H — surtido continuo de gasoil a equipos de TIMACA, FMO y Pellas); y 14 al 19 (1.401H), por trabajos mayores en Grúas (249H, GR15 con 87H — winche y fugas hidráulicas) y Equipos Especiales (224H, payloader PA03 con 96H — filtros y sistema hidráulico, y tractor TR01 con 77H — radiador y tejas). La semana del 21 al 26 (1.232H) focalizó su esfuerzo en Autobuses (253H, armado e instalación de motor y transmisión en BS03 con 107H y BS13 con 91H). El cierre del 28 al 30 (725H) fue menor por abarcar solo 3 días laborables (lunes a miércoles); aun así destacaron GR25 (90H — cilindros hidráulicos y vástago) y culminación de motor/transmisión en autobuses (197H).',
  desglosePorTipoEquipo: [
    { tipo: 'Grúas', trabajadores: 18, totalHH: 1193, tarifaPromedio: 2.05, costoTotalMOD: 2446 },
    { tipo: 'Autobuses', trabajadores: 16, totalHH: 865, tarifaPromedio: 2.05, costoTotalMOD: 1773 },
    { tipo: 'Camiones', trabajadores: 14, totalHH: 784, tarifaPromedio: 2.05, costoTotalMOD: 1607 },
    { tipo: 'Equipos Especiales', trabajadores: 12, totalHH: 670, tarifaPromedio: 2.05, costoTotalMOD: 1374 },
    { tipo: 'Vehículos livianos', trabajadores: 10, totalHH: 638, tarifaPromedio: 2.05, costoTotalMOD: 1308 },
    { tipo: 'Mantenimiento y Adecuaciones', trabajadores: 8, totalHH: 574, tarifaPromedio: 2.05, costoTotalMOD: 1177 },
    { tipo: 'Chutos', trabajadores: 7, totalHH: 298, tarifaPromedio: 2.05, costoTotalMOD: 611 },
    { tipo: 'Montacargas', trabajadores: 6, totalHH: 245, tarifaPromedio: 2.05, costoTotalMOD: 502 },
    { tipo: 'Semirremolques', trabajadores: 5, totalHH: 185, tarifaPromedio: 2.05, costoTotalMOD: 379 },
    { tipo: 'Máquinas de soldar / Compresores', trabajadores: 6, totalHH: 154, tarifaPromedio: 2.05, costoTotalMOD: 316 },
    { tipo: 'Otros Equipos de Planta', trabajadores: 8, totalHH: 357, tarifaPromedio: 2.05, costoTotalMOD: 732 }
  ]
};

