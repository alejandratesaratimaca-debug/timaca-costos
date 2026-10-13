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
  capex: number;
  opexActivos: number;
  opexInfraestructura: number;
  admon?: number;
  totalOpex: number;
  totalGeneral: number;
  totalConAdmon?: number;
}

export const EVOLUTIVO_INTERNOS_2026: ResumenMensualInterno[] = [
  { mesLabel: 'Enero', mesCorto: 'Ene', capex: 162467, opexActivos: 143581, opexInfraestructura: 145197, admon: 63209, totalOpex: 288778, totalGeneral: 451244, totalConAdmon: 514453 },
  { mesLabel: 'Febrero', mesCorto: 'Feb', capex: 326380, opexActivos: 102274, opexInfraestructura: 50329, admon: 28720, totalOpex: 152603, totalGeneral: 478983, totalConAdmon: 507703 },
  { mesLabel: 'Marzo', mesCorto: 'Mar', capex: 149039, opexActivos: 83194, opexInfraestructura: 20149, admon: 86208, totalOpex: 103343, totalGeneral: 252382, totalConAdmon: 338590 },
  { mesLabel: 'Abril', mesCorto: 'Abr', capex: 92865, opexActivos: 59543, opexInfraestructura: 25926, admon: 28640, totalOpex: 85469, totalGeneral: 178334, totalConAdmon: 206974 },
  { mesLabel: 'Mayo', mesCorto: 'May', capex: 77901, opexActivos: 68409, opexInfraestructura: 20031, admon: 67895, totalOpex: 88440, totalGeneral: 166341, totalConAdmon: 234236 },
  { mesLabel: 'Junio', mesCorto: 'Jun', capex: 32585, opexActivos: 72213, opexInfraestructura: 15748, admon: 37742, totalOpex: 87961, totalGeneral: 120546, totalConAdmon: 158288 },
  { mesLabel: 'Julio', mesCorto: 'Jul', capex: 45087, opexActivos: 97727, opexInfraestructura: 41898, admon: 40086, totalOpex: 139625, totalGeneral: 184712, totalConAdmon: 224798 },
  { mesLabel: 'Agosto', mesCorto: 'Ago', capex: 29017, opexActivos: 113450, opexInfraestructura: 40545, admon: 53325, totalOpex: 153995, totalGeneral: 183013, totalConAdmon: 236338 },
  { mesLabel: 'Septiembre', mesCorto: 'Sep', capex: 34930.08, opexActivos: 83729.79, opexInfraestructura: 41739.91, admon: 31339.57, totalOpex: 125469.70, totalGeneral: 160399.78, totalConAdmon: 191739.35 },
];

export const TOTALES_ACUMULADOS_INTERNOS_2026 = {
  capex: 950271.43,
  opexActivos: 824120.75,
  opexInfraestructura: 401562.86,
  admon: 437164.57,
  totalOpex: 1225683.61,
  totalGeneral: 2175955.04,
  totalConAdmon: 2613119.61,
  distribucionAgosto: {
    capexPorcentaje: 16,
    opexActivosPorcentaje: 62,
    opexInfraPorcentaje: 22,
  },
  distribucionSeptiembreBase: {
    capexPorcentaje: 18.2,
    opexActivosPorcentaje: 43.7,
    opexInfraPorcentaje: 21.8,
    admonPorcentaje: 16.3,
  },
  variacionesAgostoVsJulio: {
    capex: -36,
    opexActivos: 16,
    opexInfraestructura: -3,
    totalOpex: 10,
    totalGeneral: -1,
  },
  variacionesSeptiembreVsAgosto: {
    capex: 20.4,
    opexActivos: -26.2,
    opexInfraestructura: 2.9,
    admon: -41.2,
    totalOpex: -18.5,
    totalGeneral: -12.4,
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
    materialesUsd: 2387.40,
    serviciosUsd: 390.00,
    totalSepUsd: 2777.40,
    detalleIntervencion: 'Turbocompresor Holset HX40 Motor Cummins 6CT8.3 ($640,00), 6 Cauchos radiales 315/80R22.5 ($1.326,00), Reparación de radiador ($260,00), Servicio de rotulado ($130,00), Aceite transmisión Dexron III ($149,04), Abrazaderas de escape ($100,00), Kit filtro transmisión ($79,00), correa, corneta y cepillos.',
    reglaOctubre: 'Pasa a CAPEX en Septiembre por acondicionamiento de ingreso. En Octubre sus mantenimientos mínimos irán a OPEX.'
  },
  {
    codigo: 'EEE-C-TR01',
    nombre: 'Traktor Caterpillar D6R-XL2',
    familia: 'Equipos especiales',
    mesIncorporacion: 'Septiembre 2026',
    registrosSep: 1,
    materialesUsd: 0,
    serviciosUsd: 700.00,
    totalSepUsd: 700.00,
    detalleIntervencion: 'Servicio de reparación general de radiadores y tanque de agua Tractor CAT D6RXL (SC25849 / OC23022).',
    reglaOctubre: 'Pasa a CAPEX en Septiembre por puesta a punto inicial. En Octubre sus mantenimientos mínimos irán a OPEX.'
  },
  {
    codigo: 'EEE-C-VH52',
    nombre: 'Pick Up Mazda BT-50 2WD - Placa 04XFAJ',
    familia: 'Vehículos livianos',
    mesIncorporacion: 'Septiembre 2026',
    registrosSep: 12,
    materialesUsd: 309.43,
    serviciosUsd: 0,
    totalSepUsd: 309.43,
    detalleIntervencion: 'Aceite transmisión 80W90 ($133,40), Pila gasolina Bosch ($32,00), Correas dentadas ($33,20), Aceite motor 15W40 ($30,05), Cables de bujías ($24,00), Tapa distribuidor ($15,00), Conector bomba ($12,50), filtros, faro LED y relé.',
    reglaOctubre: 'Pasa a CAPEX en Septiembre por acondicionamiento de ingreso. En Octubre sus mantenimientos mínimos irán a OPEX.'
  },
  {
    codigo: 'EEE-C-PA03',
    nombre: 'Payloader Caterpillar 962G',
    familia: 'Equipos especiales',
    mesIncorporacion: 'Septiembre 2026',
    registrosSep: 0,
    materialesUsd: 0,
    serviciosUsd: 0,
    totalSepUsd: 0,
    detalleIntervencion: 'Equipo nuevo incorporado en flota en Septiembre 2026 (Sin despachos de almacén facturados aún bajo este código en el corte preliminar; pendiente cruce de reimputaciones / HH).',
    reglaOctubre: 'Cualquier acondicionamiento inicial de ingreso va a CAPEX; mantenimientos mínimos posteriores en Octubre irán a OPEX.'
  },
  {
    codigo: 'TT-F-CO19',
    nombre: 'Compresor SULLAIR 185 45,5 KW 185 CFM Serial: 201012180072',
    familia: 'Compresores',
    mesIncorporacion: 'Septiembre 2026',
    registrosSep: 0,
    materialesUsd: 0,
    serviciosUsd: 0,
    totalSepUsd: 0,
    detalleIntervencion: 'Equipo nuevo incorporado en Septiembre 2026 (Sin despachos de almacén facturados aún bajo este código en el corte preliminar; pendiente cruce de reimputaciones / HH).',
    reglaOctubre: 'Cualquier acondicionamiento inicial de ingreso va a CAPEX; mantenimientos mínimos posteriores en Octubre irán a OPEX.'
  },
  {
    codigo: 'TT-F-CO20',
    nombre: 'Compresor SULLAIR 185 45,5 KW 185 CFM Serial: 201112120050',
    familia: 'Compresores',
    mesIncorporacion: 'Septiembre 2026',
    registrosSep: 0,
    materialesUsd: 0,
    serviciosUsd: 0,
    totalSepUsd: 0,
    detalleIntervencion: 'Equipo nuevo incorporado en Septiembre 2026 (Sin despachos de almacén facturados aún bajo este código en el corte preliminar; pendiente cruce de reimputaciones / HH).',
    reglaOctubre: 'Cualquier acondicionamiento inicial de ingreso va a CAPEX; mantenimientos mínimos posteriores en Octubre irán a OPEX.'
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
  nivel: 'NIVEL_1_DIRECTO' | 'NIVEL_2_COMPONENTE_MAYOR';
  criterioContable: string;
  activoPorDefecto: boolean;
}

export const INTERVENCIONES_VIDA_UTIL_SEPTIEMBRE_2026: IntervencionVidaUtilCapex[] = [
  {
    id: 'CAPEX-VU-SEP-01',
    codigoEquipo: 'EEA-C-BS03',
    nombreEquipo: 'Autobús Encava - Placa: FA160P',
    familia: 'Autobuses',
    comprobante: 'DP0039990',
    fecha: '2026-09-10',
    categoria: 'Materiales Directos',
    descripcionItem: 'MOTOR DIESEL CUMMINS 6CT 8.3 L 6 CILINDROS 225 HP 2200 RPM (Cant: 1)',
    motivo: 'BS03 -- MOTOR PARA INSTALACION',
    montoItemUsd: 8500.00,
    montoTotalEquipoMesUsd: 8500.00,
    nivel: 'NIVEL_1_DIRECTO',
    criterioContable: 'Instalación de motor diésel completo nuevo que extiende significativamente la vida útil del autobús (100% Capitalizable en CAPEX).',
    activoPorDefecto: true
  },
  {
    id: 'CAPEX-VU-SEP-02',
    codigoEquipo: 'EEI-C-GR23',
    nombreEquipo: 'Grúa Link Belt LS918 400TN Serial 43H7-4300',
    familia: 'Grúas',
    comprobante: 'SC25949 / OC22854',
    fecha: '2026-09-08',
    categoria: 'Servicios',
    descripcionItem: 'SERVICIO MECANIZADO: Mecanizado de vástago del telescópico de grúa 400 TON y rectificado de rosca',
    motivo: 'Recuperación mayor estructural de cilindro telescópico principal',
    montoItemUsd: 9000.00,
    montoTotalEquipoMesUsd: 10031.68,
    nivel: 'NIVEL_1_DIRECTO',
    criterioContable: 'Mecanizado y rectificado de vástago de cilindro. Permanece en OPEX Flota por instrucción de usuario (solo motor de bus pasa a CAPEX).',
    activoPorDefecto: false
  },
  {
    id: 'CAPEX-VU-SEP-03',
    codigoEquipo: 'TT-F-PC05',
    nombreEquipo: 'PC05 Máquina de Corte por Láser BODOR A12',
    familia: 'Pantógrafos',
    comprobante: 'DP0041416',
    fecha: '2026-09-28',
    categoria: 'Materiales Directos',
    descripcionItem: 'DESCARGADOR COMBINADO CONTRA RAYOS Y SOBRETENSIONES FLT-SEC-T1+T2-3S-350/25-FM',
    motivo: 'Sistema de protección para pantógrafo láser BODOR',
    montoItemUsd: 2635.00,
    montoTotalEquipoMesUsd: 2979.07,
    nivel: 'NIVEL_1_DIRECTO',
    criterioContable: 'Dispositivo eléctrico de protección industrial. Permanece en OPEX por instrucción de usuario.',
    activoPorDefecto: false
  },
  {
    id: 'CAPEX-VU-SEP-04',
    codigoEquipo: 'EEE-C-VH09',
    nombreEquipo: 'Pick Up Mazda BT-50 2WD - Placa: A51BO4M',
    familia: 'Vehículos livianos',
    comprobante: 'SC26018 / OC23039',
    fecha: '2026-09-08',
    categoria: 'Servicios',
    descripcionItem: 'SERVICIO MANTENIMIENTO MOTOR COMBUSTIÓN: Bloque, cigüeñal, cámara y pistones motor F2 Mazda BT50 2.2',
    motivo: 'Overhaul / rectificación completa de motor F2',
    montoItemUsd: 600.00,
    montoTotalEquipoMesUsd: 1126.92,
    nivel: 'NIVEL_1_DIRECTO',
    criterioContable: 'Mantenimiento/rectificación de motor combustión. Permanece en OPEX Flota.',
    activoPorDefecto: false
  },
  {
    id: 'CAPEX-VU-SEP-05',
    codigoEquipo: 'EEI-C-GR25',
    nombreEquipo: 'Grúa Grove RT750 50TN Serial: 87167',
    familia: 'Grúas',
    comprobante: 'SC25305 / SC25307',
    fecha: '2026-09-07',
    categoria: 'Servicios',
    descripcionItem: 'Cromado de vástago cilindros estabilizadores (4 Und: $2.000) + Fabricación kit sellos cilindros hidráulicos (4 Und: $1.850)',
    motivo: 'Recuperación mayor de los 4 cilindros estabilizadores de grúa 50TN',
    montoItemUsd: 3850.00,
    montoTotalEquipoMesUsd: 3899.00,
    nivel: 'NIVEL_2_COMPONENTE_MAYOR',
    criterioContable: 'Reconstrucción y cromado completo de los 4 cilindros hidráulicos estabilizadores.',
    activoPorDefecto: false
  },
  {
    id: 'CAPEX-VU-SEP-06',
    codigoEquipo: 'EEE-C-RE01',
    nombreEquipo: 'Retroexcavadora Case 580M Serie 2 Turbo - Serial: N6C400672',
    familia: 'Equipos especiales',
    comprobante: 'DP0041322',
    fecha: '2026-09-26',
    categoria: 'Materiales Directos',
    descripcionItem: 'CUBO MOZO EJE DELANTERO 144466A1 CASE (Cant: 2)',
    motivo: 'RE01 -- REPARACION DE RETROEXCAVADORA',
    montoItemUsd: 2300.00,
    montoTotalEquipoMesUsd: 3191.54,
    nivel: 'NIVEL_2_COMPONENTE_MAYOR',
    criterioContable: 'Reemplazo de ambos cubos mozo del eje delantero de tracción.',
    activoPorDefecto: false
  },
  {
    id: 'CAPEX-VU-SEP-07',
    codigoEquipo: 'TT-S-C-854',
    nombreEquipo: 'Payloader Hyundai HL760-7 (PA01)',
    familia: 'Equipos especiales',
    comprobante: 'DP0039995',
    fecha: '2026-09-10',
    categoria: 'Materiales Directos',
    descripcionItem: 'BOMBA HIDRAULICA DE FRENO / VENTILADOR 31LD-40500 HYUNDAI HL760-7A (Cant: 1)',
    motivo: 'PA01 -- REPARACION DE PAYLOADER',
    montoItemUsd: 2071.68,
    montoTotalEquipoMesUsd: 2516.43,
    nivel: 'NIVEL_2_COMPONENTE_MAYOR',
    criterioContable: 'Sustitución de bomba hidráulica principal de freno y enfriamiento.',
    activoPorDefecto: false
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
}

export const CUENTAS_CAPEX_INTERNOS: CuentaCapexInterno[] = [
  { cuentaAuxiliar: 'TSI-T-0108', proyecto: 'Construcción Galpones TIMACA Cant. 04', ajuste2025: 54134, ene: 19525, feb: 2182, mar: 8369, abr: 2464, may: 1061, jun: 2402, jul: 1628, ago: 5596, sep: 13498.06, total2026: 56723.97 },
  { cuentaAuxiliar: 'TTI-C-0105', proyecto: 'Adecuación patio externo Timaca', ajuste2025: 4191, ene: 44500, feb: 271159, mar: 42537, abr: 49926, may: 63638, jun: 3906, jul: 14225, ago: 5371, sep: 9050.80, total2026: 504312.87 },
  { cuentaAuxiliar: 'TTI-C-0095', proyecto: 'Obra civil Edificio Administrativo', ajuste2025: 6887, ene: 2937, feb: 1210, mar: 378, abr: 492, may: 7391, jun: 7386, jul: 21319, ago: 13164, sep: 6617.15, total2026: 60893.51 },
  { cuentaAuxiliar: 'TTI-C-0108', proyecto: 'Adecuación banco de pruebas motores 440v', ajuste2025: 0, ene: 0, feb: 0, mar: 0, abr: 0, may: 139, jun: 2, jul: 5575, ago: 3289, sep: 3759.16, total2026: 12764.58 },
  { cuentaAuxiliar: 'TTI-C-0104', proyecto: 'Reacondicionamiento Grúas Torres Liebherr (Pellas 2)*', ajuste2025: 2685, ene: 65420, feb: 7750, mar: 50923, abr: 30908, may: 4334, jun: 18625, jul: 1891, ago: 1528, sep: 1951.95, total2026: 183331.85 },
  { cuentaAuxiliar: 'TTI-C-0102', proyecto: 'Renovación garita de acceso Timaca', ajuste2025: 5410, ene: 10244, feb: 944, mar: 1294, abr: 552, may: 7, jun: 78, jul: 13, ago: 0, sep: 20.00, total2026: 13152.37 },
  { cuentaAuxiliar: 'TTI-C-0111', proyecto: 'Montaje y puesta en marcha de 2 bancos de prueba para motores, bombas y reductores', ajuste2025: 0, ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 0, sep: 16.67, total2026: 16.67 },
  { cuentaAuxiliar: 'TTI-C-0107', proyecto: 'Fabricación zona resguardo equipos móviles', ajuste2025: 0, ene: 0, feb: 0, mar: 1757, abr: 3940, may: 0, jun: 0, jul: 275, ago: 62, sep: 10.00, total2026: 6044.02 },
  { cuentaAuxiliar: 'TTI-C-0099', proyecto: 'Adquisición e instalación de pantógrafos', ajuste2025: 16, ene: 0, feb: 3064, mar: 323, abr: 792, may: 0, jun: 9, jul: 44, ago: 8, sep: 5.27, total2026: 4245.62 },
  { cuentaAuxiliar: 'TTI-C-0098', proyecto: 'Adquisición e instalación de grúas puente', ajuste2025: 0, ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 0, jul: 35, ago: 0, sep: 1.02, total2026: 36.01 },
  { cuentaAuxiliar: 'TTI-C-0101', proyecto: 'Adquisición máquinas vulcanizadoras', ajuste2025: 0, ene: 0, feb: 10, mar: 0, abr: 0, may: 1330, jun: 0, jul: 47, ago: 0, sep: 0, total2026: 1386.97 },
  { cuentaAuxiliar: 'TTI-C-0106', proyecto: 'Adecuación área de lavado equipos móviles', ajuste2025: 4343, ene: 19841, feb: 40061, mar: 43458, abr: 3791, may: 0, jun: 177, jul: 35, ago: 0, sep: 0, total2026: 107362.99 },
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
  { rubro: 'CONSTRUCCIÓN GALPONES TIMACA (TSI-T-0108)', categoria: 'Materiales Directos', monto: 13498.06, detalle: 'Perfiles estructurales, láminas de techo, pintura industrial y consumibles de soldadura para los 4 galpones.' },
  { rubro: 'ADECUACIÓN PATIO EXTERNO (TTI-C-0105)', categoria: 'Materiales y Servicios', monto: 9050.80, detalle: '$9.000,80 USD en materiales eléctricos, iluminación y construcción + $50,00 USD en servicios.' },
  { rubro: 'OBRA CIVIL EDIFICIO ADMINISTRATIVO (TTI-C-0095)', categoria: 'Materiales Directos', monto: 6617.15, detalle: 'Materiales eléctricos, acabados civiles, tuberías PVC, ferretería y revestimientos interiores.' },
  { rubro: 'BANCO DE PRUEBAS MOTORES 440V (TTI-C-0108)', categoria: 'Materiales y Servicios', monto: 3759.16, detalle: '$3.399,16 USD en componentes eléctricos de potencia y control + $360,00 USD en servicios técnicos.' },
  { rubro: 'GRÚAS TORRES LIEBHERR PELLAS 2 (TTI-C-0104)', categoria: 'Materiales y Servicios', monto: 1951.95, detalle: '$1.030,00 USD en servicios especializados de reacondicionamiento + $921,95 USD en repuestos y consumibles.' },
  { rubro: 'OTROS PROYECTOS CAPEX PLANTA', categoria: 'Materiales Directos', monto: 52.96, detalle: 'Garita de acceso ($20,00), 2 Bancos de prueba bombas/reductores ($16,67), Zona resguardo ($10,00), Pantógrafos ($5,27) y Grúas puente ($1,02).' }
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
  { codigo: 'GR23', cuentaCompleta: 'EEI-C-GR23', tipo: 'Grúas', nombre: 'Grúa Link Belt LS918 400TN', montoSeptiembre: 10031.68, montoCapexReclasificado: 0, esCapexVidaUtil: false, detalle: 'Mecanizado de vástago del telescópico 400TN ($9.000 USD) + repuestos de tren motriz y filtros ($1.031,68 USD) — Permanece en OPEX Flota.' },
  { codigo: 'BS03', cuentaCompleta: 'EEA-C-BS03', tipo: 'Autobuses', nombre: 'Autobús Encava - Placa: FA160P', montoSeptiembre: 8500.00, montoCapexReclasificado: 8500.00, esCapexVidaUtil: true, detalle: 'Suministro de Motor Diésel Cummins 6CT 8.3L 225HP nuevo ($8.500 USD -> 100% CAPEX por aumento de vida útil del autobús).' },
  { codigo: 'GR13', cuentaCompleta: 'EEI-C-GR13', tipo: 'Grúas', nombre: 'Grúa Grove RT 75S - 50TN', montoSeptiembre: 4561.00, montoCapexReclasificado: 0, esCapexVidaUtil: false, detalle: 'Reemplazo de 2 cauchos 29.5R25 ($3.600 USD), reparación de radiador ($700 USD) y lubricantes ($261 USD).' },
  { codigo: 'GR24', cuentaCompleta: 'EEI-C-GR24', tipo: 'Grúas', nombre: 'Grúa Liebherr ITM1100/1 - 100TN', montoSeptiembre: 3983.63, montoCapexReclasificado: 0, esCapexVidaUtil: false, detalle: 'Mantenimiento hidráulico, aceite ISO 68 ($262,88 USD), filtros y componentes electromecánicos.' },
  { codigo: 'GR25', cuentaCompleta: 'EEI-C-GR25', tipo: 'Grúas', nombre: 'Grúa Grove RT750 50TN Serial 87167', montoSeptiembre: 3899.00, montoCapexReclasificado: 0, esCapexVidaUtil: false, detalle: 'Cromado de 4 vástagos cilindros estabilizadores ($2.000 USD) y fabricación de sellos ($1.850 USD) — Permanece en OPEX Flota.' },
  { codigo: 'RE01', cuentaCompleta: 'EEE-C-RE01', tipo: 'Equipos especiales', nombre: 'Retroexcavadora Case 580M Serie 2', montoSeptiembre: 3191.54, montoCapexReclasificado: 0, esCapexVidaUtil: false, detalle: '2 Cubos mozo eje delantero Case ($2.300 USD), mangueras hidráulicas y mantenimiento correctivo ($891,54 USD) — En OPEX Flota.' },
  { codigo: 'PC05', cuentaCompleta: 'TT-F-PC05', tipo: 'Pantógrafos', nombre: 'Máquina Corte por Láser BODOR A12', montoSeptiembre: 2979.07, montoCapexReclasificado: 0, esCapexVidaUtil: false, detalle: 'Sistema descargador contra rayos y sobretensiones ($2.635 USD) + consumibles láser ($344,07 USD) — En OPEX.' },
  { codigo: 'BS15', cuentaCompleta: 'EEA-C-BS15', tipo: 'Autobuses', nombre: 'Autobús Encava ENT-3300 Placa 6036A1Y', montoSeptiembre: 2777.40, montoCapexReclasificado: 2777.40, esEquipoNuevo: true, esCapexVidaUtil: false, detalle: 'EQUIPO NUEVO SEP: Turbocompresor Holset HX40 ($640), 6 Cauchos 315/80R22.5 ($1.326), radiador ($260) — Pasa a CAPEX en mes de ingreso.' },
  { codigo: 'GR22', cuentaCompleta: 'EEI-C-GR22', tipo: 'Grúas', nombre: 'Grúa Liebherr LTM1400 - 400TN', montoSeptiembre: 2517.58, montoCapexReclasificado: 0, esCapexVidaUtil: false, detalle: 'Baterías, repuestos eléctricos automotor, filtros y mantenimiento preventivo de grúa 400TN.' },
  { codigo: 'PA01', cuentaCompleta: 'TT-S-C-854', tipo: 'Equipos especiales', nombre: 'Payloader Hyundai HL760-7', montoSeptiembre: 2516.43, montoCapexReclasificado: 0, esCapexVidaUtil: false, detalle: 'Bomba hidráulica principal de freno/ventilador ($2.071,68 USD) y lubricantes/filtros ($444,75 USD) — En OPEX Flota.' },
];

export const TIPOS_EQUIPOS_OPEX_MENSUAL = [
  { tipo: 'Grúas', ene: 109389, feb: 45615, mar: 25716, abr: 27256, may: 37208, jun: 23305, jul: 32618, ago: 32364, sep: 32984.63, total: 366456.10 },
  { tipo: 'Camiones', ene: 735, feb: 1490, mar: 91, abr: 5201, may: 3433, jun: 8985, jul: 10910, ago: 20864, sep: 3486.51, total: 55193.96 },
  { tipo: 'Autobuses', ene: 1218, feb: 446, mar: 352, abr: 503, may: 2491, jun: 7645, jul: 7371, ago: 20833, sep: 16943.71, total: 57802.34 },
  { tipo: 'Equipos especiales', ene: 1451, feb: 3260, mar: 6931, abr: 2730, may: 5635, jun: 12720, jul: 19488, ago: 16547, sep: 9997.35, total: 78759.37 },
  { tipo: 'Vehículos livianos', ene: 621, feb: 4396, mar: 950, abr: 3423, may: 4738, jun: 4812, jul: 5561, ago: 8529, sep: 6385.71, total: 39416.25 },
  { tipo: 'Chutos', ene: 7793, feb: 467, mar: 532, abr: 687, may: 2739, jun: 2709, jul: 2891, ago: 4499, sep: 1938.86, total: 24255.31 },
  { tipo: 'Montacargas', ene: 0, feb: 0, mar: 0, abr: 91, may: 3035, jun: 4906, jul: 1077, ago: 3366, sep: 1101.98, total: 13575.98 },
  { tipo: 'Compresores', ene: 954, feb: 139, mar: 3896, abr: 555, may: 270, jun: 1165, jul: 8353, ago: 2491, sep: 455.89, total: 18278.44 },
  { tipo: 'Pantógrafos', ene: 4866, feb: 6699, mar: 7603, abr: 2973, may: 2162, jun: 100, jul: 1165, ago: 1646, sep: 3264.95, total: 30478.68 },
  { tipo: 'Máquinas de soldar', ene: 0, feb: 17, mar: 3540, abr: 996, may: 1625, jun: 813, jul: 1108, ago: 1086, sep: 2835.61, total: 12019.87 },
  { tipo: 'Equipos Taller Fabricación', ene: 2867, feb: 2521, mar: 5485, abr: 1678, may: 45, jun: 263, jul: 39, ago: 457, sep: 1212.72, total: 14568.15 },
  { tipo: 'Semirremolques', ene: 3690, feb: 11291, mar: 4824, abr: 3459, may: 0, jun: 840, jul: 3841, ago: 62, sep: 2358.11, total: 30365.21 },
  { tipo: 'Equipos de mecanizado', ene: 10, feb: 95, mar: 781, abr: 0, may: 891, jun: 778, jul: 189, ago: 147, sep: 729.61, total: 3620.67 },
  { tipo: 'Generadores', ene: 2240, feb: 4540, mar: 1454, abr: 554, may: 480, jun: 1564, jul: 355, ago: 10, sep: 0, total: 11197.89 },
  { tipo: 'Sandblasting', ene: 1974, feb: 2985, mar: 1909, abr: 1399, may: 111, jun: 186, jul: 0, ago: 0, sep: 11.00, total: 8574.72 },
  { tipo: 'Otros Equipos (Grúas Bandera / Hidrolav. / ECM / Taladros)', ene: 5773, feb: 8313, mar: 19982, abr: 8039, may: 3547, jun: 1422, jul: 2762, ago: 551, sep: 23.15, total: 50412.15 }
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
  { rubro: 'REP. Y ACC TREN MOTRIZ AUTOMOTOR', grupo: 'Materiales Directos', monto: 19412.50, detalle: 'Incluye Motor Cummins 6CT 8.3L en BS03 ($8.500 -> CAPEX), Cubos mozo Case RE01 ($2.300), Turbocompresor BS15 ($640 -> CAPEX Equipo Nuevo) y embragues.' },
  { rubro: 'CAUCHOS Y TRIPAS PARA VEHÍCULOS', grupo: 'Materiales Directos', monto: 14280.00, detalle: 'Cauchos 29.5R25 en Grúa GR13 ($3.600), 6 cauchos 315/80R22.5 en Bus nuevo BS15 ($1.326 -> CAPEX) y reposición en flota pesada.' },
  { rubro: 'MATERIALES HIDRONEUMÁTICOS Y MECÁNICOS', grupo: 'Materiales Directos', monto: 11850.40, detalle: 'Bomba hidráulica Hyundai PA01 ($2.071,68), mangueras de alta presión, sellos y rodamientos.' },
  { rubro: 'MATERIALES ELÉCTRICOS Y ELECTRÓNICOS', grupo: 'Materiales Directos', monto: 7420.15, detalle: 'Descargador sobretensiones Láser BODOR PC05 ($2.635 -> CAPEX), baterías y alternadores.' },
  { rubro: 'ACEITE HIDRÁULICO Y LUBRICANTES', grupo: 'Materiales Directos', monto: 6334.25, detalle: 'Aceite hidráulico ISO 68, aceite motor 15W40 y valvulina 80W90 para grúas, autobuses y vehículos.' },
  { rubro: 'SERVICIO MECANIZADO MAYOR', grupo: 'Servicios', monto: 9000.00, detalle: 'Mecanizado de vástago del telescópico y rectificado de rosca en Grúa Link Belt 400TN GR23 ($9.000 USD — Queda en OPEX Flota por instrucción de usuario).' },
  { rubro: 'FABRICACIÓN SELLO HIDRÁULICO Y CROMADO', grupo: 'Servicios', monto: 7101.49, detalle: 'Fabricación de sellos hidráulicos ($5.101,49) y servicio de cromado de vástagos en Grúa GR25 ($2.000).' },
  { rubro: 'MANTTO. EQUIPOS DE SOLDADURA Y TARJETAS', grupo: 'Servicios', monto: 3300.00, detalle: 'Mantenimiento de máquinas de soldar y oxicorte ($2.600) + reparación de tarjetas electrónicas ($700).' },
  { rubro: 'REPARACIÓN DE RADIADORES Y MOTORES', grupo: 'Servicios', monto: 2478.00, detalle: 'Reparación radiadores Tractor nuevo TR01 ($700 -> CAPEX), GR13 ($700), BS15 ($260 -> CAPEX), cámara ($688) y motor VH09 ($600).' },
  { rubro: 'OTROS SERVICIOS DE FLOTA', grupo: 'Servicios', monto: 2553.00, detalle: 'Cristalería ($716), vulcanización bandas de freno ($440), lavandería ($372), cilindros ($260), rotulado BS15 ($130 -> CAPEX) y aire acondicionado.' }
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
  totalAgosto: 40545,
  totalSeptiembre: 41739.91,
  totalAcumulado2026: 401562.86,
  variacionVsJulio: -3,
  variacionSepVsAgosto: 2.9,
  proyectoMayorIncremento: {
    nombre: 'Adecuaciones y/o mejoras',
    cuenta: 'TT-I-C-033',
    montoAgosto: 31297,
    montoSeptiembre: 27701.47,
    variacionVsJulio: 59,
  },
  horasHombre: 1145,
  costoMOD: 2127,
  cuentas: [
    { cuenta: 'TT-I-C-033', descripcion: 'Adecuaciones y/o mejoras', ene: 50421, feb: 3299, mar: 3920, abr: 827, may: 1072, jun: 5271, jul: 19651, ago: 31297, sep: 27701.47, total: 143459.07, variacionJulAgo: '+59%', variacionAgoSep: '-11%' },
    { cuenta: 'TT-A-C-207', descripcion: 'Mantto herramientas y accesorios - Almacen', ene: 55775, feb: 14307, mar: 70, abr: 4065, may: 2218, jun: 777, jul: 14107, ago: 444, sep: 4014.48, total: 95777.48, variacionJulAgo: '-97%', variacionAgoSep: '+804%' },
    { cuenta: 'TT-G-C-032', descripcion: 'Mantto y Adecuaciones Galpones - Fab', ene: 22966, feb: 432, mar: 126, abr: 342, may: 2043, jun: 2024, jul: 73, ago: 1809, sep: 3569.48, total: 33383.74, variacionJulAgo: '+2387%', variacionAgoSep: '+97%' },
    { cuenta: 'SS-G-C-025', descripcion: 'Mantto y Adecuaciones Galpones - SMB', ene: 419, feb: 2052, mar: 919, abr: 4694, may: 1912, jun: 1134, jul: 438, ago: 1085, sep: 2179.15, total: 14832.03, variacionJulAgo: '+148%', variacionAgoSep: '+101%' },
    { cuenta: 'TT-H-C-031', descripcion: 'Mantto herramientas y accesorios - Fab', ene: 3838, feb: 27224, mar: 3935, abr: 1146, may: 7589, jun: 1916, jul: 3063, ago: 1051, sep: 1875.60, total: 51638.60, variacionJulAgo: '-66%', variacionAgoSep: '+78%' },
    { cuenta: 'EE-G-C-016', descripcion: 'Mantto y Adecuaciones Galpones - Mantto', ene: 2803, feb: 87, mar: 224, abr: 736, may: 3235, jun: 1497, jul: 855, ago: 1361, sep: 1261.04, total: 12057.97, variacionJulAgo: '+59%', variacionAgoSep: '-7%' },
    { cuenta: 'EE-H-C-015', descripcion: 'Mantto herramientas y accesorios - Mantto', ene: 5677, feb: 2544, mar: 6452, abr: 10176, may: 85, jun: 203, jul: 2516, ago: 2141, sep: 535.03, total: 30328.65, variacionJulAgo: '-15%', variacionAgoSep: '-75%' },
    { cuenta: 'TT-A-C-208', descripcion: 'Mantto y Adecuaciones Galpones - Almacen', ene: 3143, feb: 144, mar: 2482, abr: 3801, may: 1262, jun: 2340, jul: 448, ago: 1040, sep: 345.84, total: 15004.84, variacionJulAgo: '+132%', variacionAgoSep: '-67%' },
    { cuenta: 'TT-H-C-033', descripcion: 'Mantto herramientas - Sandblasting', ene: 0, feb: 0, mar: 1, abr: 0, may: 125, jun: 0, jul: 690, ago: 205, sep: 138.46, total: 1159.46, variacionJulAgo: '-70%', variacionAgoSep: '-32%' },
    { cuenta: 'SS-H-C-024', descripcion: 'Mantto herramientas - SMB', ene: 93, feb: 0, mar: 7, abr: 0, may: 261, jun: 575, jul: 45, ago: 18, sep: 81.56, total: 1080.56, variacionJulAgo: '-60%', variacionAgoSep: '+353%' },
    { cuenta: 'TT-G-C-034', descripcion: 'Mantto Galpones - Sandblasting', ene: 63, feb: 240, mar: 2013, abr: 139, may: 229, jun: 10, jul: 14, ago: 94, sep: 37.80, total: 2839.80, variacionJulAgo: '+596%', variacionAgoSep: '-60%' },
  ],
  notasExplicativas: [
    'Septiembre 2026 ($41.739,91 USD): El 66,4% se concentra en TT-I-C-033 Adecuaciones y/o mejoras ($27.701,47 USD), seguido por TT-A-C-207 Mantto herramientas Almacén ($4.014,48 USD) y TT-G-C-032 Galpones Fabricación ($3.569,48 USD).',
    'Agosto 2026 ($40.545 USD): TT-I-C-033 adecuación de contenedores en Pellas 1 (22K USD en acero al carbono, 1,2K USD en materiales de construcción y 1,2K en materiales eléctricos).'
  ]
};

// OPEX: Flota de Grúas TIMACA (26 Grúas Activas)
export const FLOTA_GRUAS_TIMACA_2026 = {
  totalAgosto: 32364,
  totalSeptiembre: 32984.63,
  totalAcumulado2026: 366456.10,
  variacionVsJulio: -1,
  variacionSepVsAgosto: 1.9,
  gruasActivas: 26,
  gruaMayorGastoAgosto: {
    codigo: 'EEI-C-GR17',
    nombre: 'Grúa Grove TM 890 - 90TN Serial 68473',
    montoAgosto: 23206,
    montoJulio: 1236,
    variacionVsJulio: 1777,
  },
  gruaMayorGastoSeptiembre: {
    codigo: 'EEI-C-GR23',
    nombre: 'Grúa Link Belt LS918 400TN Serial 43H7-4300',
    montoSeptiembre: 10031.68,
    montoAgosto: 129.40,
    variacionVsAgosto: 7652,
  },
  top5GruasAgosto: [
    { codigo: 'EEI-C-GR17', descripcion: 'Grua Grove TM 890 - 90TN Serial 68473', monto: 23206, variacion: '+1777%' },
    { codigo: 'EEI-C-GR25', descripcion: 'Grua Grove RT750 50TN Serial: 87167', monto: 1546, variacion: '-47%' },
    { codigo: 'EEI-C-GR13', descripcion: 'Grua Grove RT 75S - 50TN Serial 39750', monto: 1490, variacion: '+110%' },
    { codigo: 'EEI-C-GR20', descripcion: 'Grua Demag AC-200 - 200TN Serial 74599126', monto: 1254, variacion: '-50%' },
    { codigo: 'EEI-C-GR07', descripcion: 'Grua P&H R200 - 20TN Serial 35021', monto: 1118, variacion: '+405%' },
    { codigo: 'OTRAS', descripcion: 'Otras Grúas de la Flota', monto: 3750, variacion: '-15%' },
  ],
  top5GruasSeptiembre: [
    { codigo: 'EEI-C-GR23', descripcion: 'Grúa Link Belt LS918 400TN Serial 43H7-4300', monto: 10031.68, variacion: '+7652% vs Ago', esCapex: true },
    { codigo: 'EEI-C-GR13', descripcion: 'Grúa Grove RT 75S - 50TN Serial 39750', monto: 4561.00, variacion: '+206% vs Ago', esCapex: false },
    { codigo: 'EEI-C-GR24', descripcion: 'Grúa Liebherr ITM1100/1 - 100TN Serial W09555000', monto: 3983.63, variacion: '+17220% vs Ago', esCapex: false },
    { codigo: 'EEI-C-GR25', descripcion: 'Grúa Grove RT750 50TN Serial: 87167', monto: 3899.00, variacion: '+152% vs Ago', esCapex: true },
    { codigo: 'EEI-C-GR22', descripcion: 'Grúa Liebherr LTM1400 - 400TN Serial W09858000', monto: 2517.58, variacion: 'Activa en Sep', esCapex: false },
    { codigo: 'OTRAS', descripcion: 'Otras 13 Grúas con Movimiento en Sep', monto: 7991.74, variacion: 'GR17, GR15, GR12...', esCapex: false },
  ],
  detalleGruasMayorVariacion: [
    { codigo: 'EEI-C-GR23', proyecto: 'Grua Link Belt LS918 400TN Serial 43H7-4300', ene: 15216, feb: 2583, mar: 14, abr: 702, may: 4321, jun: 1169, jul: 0, ago: 129, sep: 10031.68, variacion: '▲ 7652%' },
    { codigo: 'EEI-C-GR13', proyecto: 'Grua Grove RT 75S - 50TN Serial 39750', ene: 288, feb: 958, mar: 0, abr: 3624, may: 7905, jun: 35, jul: 709, ago: 1490, sep: 4561.00, variacion: '▲ 206%' },
    { codigo: 'EEI-C-GR24', proyecto: 'Grua Liebherr ITM1100/1 - 100TN Serial W09555000', ene: 40453, feb: 1, mar: 16717, abr: 113, may: 990, jun: 560, jul: 2429, ago: 23, sep: 3983.63, variacion: '▲ 17220%' },
    { codigo: 'EEI-C-GR25', proyecto: 'Grua Grove RT750 50TN Serial: 87167', ene: 0, feb: 0, mar: 0, abr: 3050, may: 355, jun: 238, jul: 2945, ago: 1546, sep: 3899.00, variacion: '▲ 152%' },
    { codigo: 'EEI-C-GR22', proyecto: 'Grua Liebherr LTM1400 - 400TN Serial W09858000', ene: 14623, feb: 12512, mar: 3895, abr: 2625, may: 3957, jun: 503, jul: 219, ago: 0, sep: 2517.58, variacion: '▲ Activa' },
    { codigo: 'EEI-C-GR17', proyecto: 'Grua Grove TM 890 - 90TN Serial 68473', ene: 0, feb: 1065, mar: 1083, abr: 1630, may: 29, jun: 1081, jul: 1236, ago: 23206, sep: 2282.76, variacion: '▼ 90%' },
    { codigo: 'EEI-C-GR15', proyecto: 'Grua Grove AT 865(N) - 65TN Serial 46105', ene: 18370, feb: 3576, mar: 1176, abr: 2969, may: 525, jun: 1796, jul: 2804, ago: 0, sep: 1865.31, variacion: '▲ Activa' },
    { codigo: 'EEI-C-GR12', proyecto: 'Grua Grove RT 740B - 40TN Serial 84688', ene: 1077, feb: 1478, mar: 569, abr: 1290, may: 123, jun: 27, jul: 0, ago: 16, sep: 1809.52, variacion: '▲ 11209%' },
  ],
  analisisCausas: [
    'Septiembre 2026 ($32.984,63 USD): GR23 lidera con $10.031,68 USD por el mecanizado mayor del vástago telescópico ($9.000 USD, reclasificable a CAPEX por extensión de vida útil). GR13 ($4.561 USD) por reemplazo de cauchos 29.5R25 ($3.600) y reparación de radiador ($700). GR25 ($3.899 USD) por cromado de 4 vástagos y sellos de cilindros estabilizadores ($3.850).',
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
