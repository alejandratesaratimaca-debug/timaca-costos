/**
 * Base de Datos Oficial: Gestión de Costos TIMACA 2026 - Proyectos Internos (CAPEX / OPEX)
 * Extraído y conciliado al 100% con:
 * - 8 Informe Costos Ago 2026 - Proyectos Internos.pdf
 * - Nuevo Dashboard - Proyectos Internos.xlsx
 */

export interface ResumenMensualInterno {
  mesLabel: string;
  mesCorto: string;
  capex: number;
  opexActivos: number;
  opexInfraestructura: number;
  totalOpex: number;
  totalGeneral: number;
}

export const EVOLUTIVO_INTERNOS_2026: ResumenMensualInterno[] = [
  { mesLabel: 'Enero', mesCorto: 'Ene', capex: 162467, opexActivos: 143581, opexInfraestructura: 145197, totalOpex: 288778, totalGeneral: 451244 },
  { mesLabel: 'Febrero', mesCorto: 'Feb', capex: 326380, opexActivos: 102274, opexInfraestructura: 50329, totalOpex: 152603, totalGeneral: 478983 },
  { mesLabel: 'Marzo', mesCorto: 'Mar', capex: 149039, opexActivos: 83194, opexInfraestructura: 20149, totalOpex: 103343, totalGeneral: 252382 },
  { mesLabel: 'Abril', mesCorto: 'Abr', capex: 92865, opexActivos: 59543, opexInfraestructura: 25926, totalOpex: 85469, totalGeneral: 178334 },
  { mesLabel: 'Mayo', mesCorto: 'May', capex: 77901, opexActivos: 68409, opexInfraestructura: 20031, totalOpex: 88440, totalGeneral: 166341 },
  { mesLabel: 'Junio', mesCorto: 'Jun', capex: 32585, opexActivos: 72213, opexInfraestructura: 15748, totalOpex: 87961, totalGeneral: 120546 },
  { mesLabel: 'Julio', mesCorto: 'Jul', capex: 45087, opexActivos: 97727, opexInfraestructura: 41898, totalOpex: 139625, totalGeneral: 184712 },
  { mesLabel: 'Agosto', mesCorto: 'Ago', capex: 29017, opexActivos: 113450, opexInfraestructura: 40545, totalOpex: 153995, totalGeneral: 183013 },
];

export const TOTALES_ACUMULADOS_INTERNOS_2026 = {
  capex: 915341,
  opexActivos: 740391,
  opexInfraestructura: 359823,
  totalOpex: 1100214,
  totalGeneral: 2015555,
  distribucionAgosto: {
    capexPorcentaje: 16,
    opexActivosPorcentaje: 62,
    opexInfraPorcentaje: 22,
  },
  variacionesAgostoVsJulio: {
    capex: -36,
    opexActivos: 16,
    opexInfraestructura: -3,
    totalOpex: 10,
    totalGeneral: -1,
  }
};

// Cuentas Auxiliares de Inversiones CAPEX
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
  total2026: number;
}

export const CUENTAS_CAPEX_INTERNOS: CuentaCapexInterno[] = [
  { cuentaAuxiliar: 'TTI-C-0095', proyecto: 'Obra civil Edificio Administrativo', ajuste2025: 6887, ene: 2937, feb: 1210, mar: 378, abr: 492, may: 7391, jun: 7386, jul: 21319, ago: 13164, total2026: 54276 },
  { cuentaAuxiliar: 'TSI-T-0108', proyecto: 'Construcción Galpones TIMACA Cant. 04', ajuste2025: 54134, ene: 19525, feb: 2182, mar: 8369, abr: 2464, may: 1061, jun: 2402, jul: 1628, ago: 5596, total2026: 43226 },
  { cuentaAuxiliar: 'TTI-C-0105', proyecto: 'Adecuación patio externo Timaca', ajuste2025: 4191, ene: 44500, feb: 271159, mar: 42537, abr: 49926, may: 63638, jun: 3906, jul: 14225, ago: 5371, total2026: 495262 },
  { cuentaAuxiliar: 'TTI-C-0108', proyecto: 'Adecuación banco de pruebas motores 440v', ajuste2025: 0, ene: 0, feb: 0, mar: 0, abr: 0, may: 139, jun: 2, jul: 5575, ago: 3289, total2026: 9005 },
  { cuentaAuxiliar: 'TTI-C-0104', proyecto: 'Reacondicionamiento Grúas Torres Liebherr (Pellas 2)*', ajuste2025: 2685, ene: 65420, feb: 7750, mar: 50923, abr: 30908, may: 4334, jun: 18625, jul: 1891, ago: 1528, total2026: 181380 },
  { cuentaAuxiliar: 'TTI-C-0107', proyecto: 'Fabricación zona resguardo equipos móviles', ajuste2025: 0, ene: 0, feb: 0, mar: 1757, abr: 3940, may: 0, jun: 0, jul: 275, ago: 62, total2026: 6034 },
  { cuentaAuxiliar: 'TTI-C-0099', proyecto: 'Adquisición e instalación de pantógrafos', ajuste2025: 16, ene: 0, feb: 3064, mar: 323, abr: 792, may: 0, jun: 9, jul: 44, ago: 8, total2026: 4240 },
  { cuentaAuxiliar: 'TTI-C-0101', proyecto: 'Adquisición máquinas vulcanizadoras', ajuste2025: 0, ene: 0, feb: 10, mar: 0, abr: 0, may: 1330, jun: 0, jul: 47, ago: 0, total2026: 1387 },
  { cuentaAuxiliar: 'TTI-C-0106', proyecto: 'Adecuación área de lavado equipos móviles', ajuste2025: 4343, ene: 19841, feb: 40061, mar: 43458, abr: 3791, may: 0, jun: 177, jul: 35, ago: 0, total2026: 107363 },
  { cuentaAuxiliar: 'TTI-C-0098', proyecto: 'Adquisición e instalación de grúas puente', ajuste2025: 0, ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 0, jul: 35, ago: 0, total2026: 35 },
  { cuentaAuxiliar: 'TTI-C-0102', proyecto: 'Renovación garita de acceso Timaca', ajuste2025: 5410, ene: 10244, feb: 944, mar: 1294, abr: 552, may: 7, jun: 78, jul: 13, ago: 0, total2026: 13132 },
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

// OPEX: Mantenimiento de Activos Productivos (Equipos Móviles y Flota)
export const TOP_10_EQUIPOS_OPEX_AGOSTO = [
  { codigo: 'GR17', tipo: 'Grúas', nombre: 'Grúa Grove TM 890 - 90TN', montoAgosto: 23206, serial: 'Serial 68473', variacionJulio: '+1777%', esSubida: true, detalle: 'Reemplazo de cauchos 14.00R20 ($12,6K USD) y fabricación de sello hidráulico ($7,3K USD).' },
  { codigo: 'BS13', tipo: 'Autobuses', nombre: 'Autobús Encava ENT-900', montoAgosto: 8102, serial: 'Flota Transporte', variacionJulio: '+250%', esSubida: true, detalle: 'Motor diésel Isuzu (reparación mayor y repuestos).' },
  { codigo: 'BS10', tipo: 'Autobuses', nombre: 'Autobús Encava ENT-330063', montoAgosto: 7217, serial: 'Flota Transporte', variacionJulio: '+190%', esSubida: true, detalle: 'Transmisión sincrónica Eaton Fuller ($6,7K USD).' },
  { codigo: 'ML03', tipo: 'Equipos especiales', nombre: 'Manlift JLG 860SJ', montoAgosto: 5740, serial: 'Plataforma Elevadora', variacionJulio: '+45%', esSubida: true, detalle: 'Cauchos estabilizadores 18-625 ($5,7K USD).' },
  { codigo: 'CA15', tipo: 'Camiones', nombre: 'Camión Pickman Ford Cargo 1721', montoAgosto: 5735, serial: 'Camión Plataforma', variacionJulio: '+30%', esSubida: true, detalle: 'Fabricación e instalación de plataforma metalmecánica.' },
  { codigo: 'CA14', tipo: 'Camiones', nombre: 'Camión Pickman Ford Cargo 1721', montoAgosto: 5218, serial: 'Camión Plataforma', variacionJulio: '+25%', esSubida: true, detalle: 'Plataforma metalmecánica y tren delantero.' },
  { codigo: 'CA17', tipo: 'Camiones', nombre: 'Camión Pickman Ford Cargo 815', montoAgosto: 4436, serial: 'Camión Liviano', variacionJulio: '+40%', esSubida: true, detalle: 'Plataforma metalmecánica y componentes de frenos.' },
  { codigo: 'CH02', tipo: 'Chutos', nombre: 'Chuto Ford Cargo 4532E', montoAgosto: 2612, serial: 'Tractor Transporte', variacionJulio: '-10%', esSubida: false, detalle: 'Suministro e instalación de inyectores ($2,6K USD).' },
  { codigo: 'BS14', tipo: 'Autobuses', nombre: 'Autobús Encava ENT-3300', montoAgosto: 2560, serial: 'Flota Transporte', variacionJulio: '+15%', esSubida: true, detalle: 'Cambio de ballestas y sistema eléctrico general.' },
  { codigo: 'VH37', tipo: 'Vehículos livianos', nombre: 'Pick Up Mazda BT-50 2WD', montoAgosto: 2555, serial: 'Vehículo Taller', variacionJulio: '-5%', esSubida: false, detalle: 'Transmisión sincrónica Mazda ($2,5K USD).' },
];

export const TIPOS_EQUIPOS_OPEX_MENSUAL = [
  { tipo: 'Grúas', ene: 109389, feb: 45615, mar: 25716, abr: 27256, may: 37208, jun: 23305, jul: 32618, ago: 32364, total: 333471 },
  { tipo: 'Camiones', ene: 735, feb: 1490, mar: 91, abr: 5201, may: 3433, jun: 8985, jul: 10910, ago: 20864, total: 51707 },
  { tipo: 'Autobuses', ene: 1218, feb: 446, mar: 352, abr: 503, may: 2491, jun: 7645, jul: 7371, ago: 20833, total: 40859 },
  { tipo: 'Equipos especiales', ene: 1451, feb: 3260, mar: 6931, abr: 2730, may: 5635, jun: 12720, jul: 19488, ago: 16547, total: 68762 },
  { tipo: 'Vehículos livianos', ene: 621, feb: 4396, mar: 950, abr: 3423, may: 4738, jun: 4812, jul: 5561, ago: 8529, total: 33031 },
  { tipo: 'Chutos', ene: 7793, feb: 467, mar: 532, abr: 687, may: 2739, jun: 2709, jul: 2891, ago: 4499, total: 22316 },
  { tipo: 'Montacargas', ene: 0, feb: 0, mar: 0, abr: 91, may: 3035, jun: 4906, jul: 1077, ago: 3366, total: 12474 },
  { tipo: 'Compresores', ene: 954, feb: 139, mar: 3896, abr: 555, may: 270, jun: 1165, jul: 8353, ago: 2491, total: 17823 },
  { tipo: 'Pantógrafos', ene: 4866, feb: 6699, mar: 7603, abr: 2973, may: 2162, jun: 100, jul: 1165, ago: 1646, total: 27214 },
  { tipo: 'Máquinas de soldar', ene: 0, feb: 17, mar: 3540, abr: 996, may: 1625, jun: 813, jul: 1108, ago: 1086, total: 9184 },
  { tipo: 'Equipos Taller Fabricación', ene: 2867, feb: 2521, mar: 5485, abr: 1678, may: 45, jun: 263, jul: 39, ago: 457, total: 13355 },
  { tipo: 'Semirremolques', ene: 3690, feb: 11291, mar: 4824, abr: 3459, may: 0, jun: 840, jul: 3841, ago: 62, total: 28007 },
  { tipo: 'Generadores', ene: 2240, feb: 4540, mar: 1454, abr: 554, may: 480, jun: 1564, jul: 355, ago: 10, total: 11198 },
  { tipo: 'Sandblasting', ene: 1974, feb: 2985, mar: 1909, abr: 1399, may: 111, jun: 186, jul: 0, ago: 0, total: 8564 },
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

// OPEX: Mantenimiento de Infraestructura (Agosto 2026)
export const MANTTO_INFRAESTRUCTURA_2026 = {
  totalAgosto: 40545,
  totalAcumulado2026: 359823,
  variacionVsJulio: -3,
  proyectoMayorIncremento: {
    nombre: 'Adecuaciones y/o mejoras',
    cuenta: 'TT-I-C-033',
    montoAgosto: 31297,
    variacionVsJulio: 59,
  },
  horasHombre: 1145,
  costoMOD: 2127,
  cuentas: [
    { cuenta: 'TT-I-C-033', descripcion: 'Adecuaciones y/o mejoras', ene: 50421, feb: 3299, mar: 3920, abr: 827, may: 1072, jun: 5271, jul: 19651, ago: 31297, total: 115758, variacionJulAgo: '+59%' },
    { cuenta: 'EE-H-C-015', descripcion: 'Mantto herramientas y accesorios - Mantto', ene: 5677, feb: 2544, mar: 6452, abr: 10176, may: 85, jun: 203, jul: 2516, ago: 2141, total: 29794, variacionJulAgo: '-15%' },
    { cuenta: 'TT-G-C-032', descripcion: 'Mantto y Adecuaciones Galpones - Fab', ene: 22966, feb: 432, mar: 126, abr: 342, may: 2043, jun: 2024, jul: 73, ago: 1809, total: 29814, variacionJulAgo: '+2387%' },
    { cuenta: 'EE-G-C-016', descripcion: 'Mantto y Adecuaciones Galpones - Mantto', ene: 2803, feb: 87, mar: 224, abr: 736, may: 3235, jun: 1497, jul: 855, ago: 1361, total: 10797, variacionJulAgo: '+59%' },
    { cuenta: 'SS-G-C-025', descripcion: 'Mantto y Adecuaciones Galpones - SMB', ene: 419, feb: 2052, mar: 919, abr: 4694, may: 1912, jun: 1134, jul: 438, ago: 1085, total: 12653, variacionJulAgo: '+148%' },
    { cuenta: 'TT-H-C-031', descripcion: 'Mantto herramientas y accesorios - Fab', ene: 3838, feb: 27224, mar: 3935, abr: 1146, may: 7589, jun: 1916, jul: 3063, ago: 1051, total: 49763, variacionJulAgo: '-66%' },
    { cuenta: 'TT-A-C-208', descripcion: 'Mantto y Adecuaciones Galpones - Almacen', ene: 3143, feb: 144, mar: 2482, abr: 3801, may: 1262, jun: 2340, jul: 448, ago: 1040, total: 14659, variacionJulAgo: '+132%' },
    { cuenta: 'TT-A-C-207', descripcion: 'Mantto herramientas y accesorios - Almacen', ene: 55775, feb: 14307, mar: 70, abr: 4065, may: 2218, jun: 777, jul: 14107, ago: 444, total: 91763, variacionJulAgo: '-97%' },
    { cuenta: 'TT-H-C-033', descripcion: 'Mantto herramientas - Sandblasting', ene: 0, feb: 0, mar: 1, abr: 0, may: 125, jun: 0, jul: 690, ago: 205, total: 1021, variacionJulAgo: '-70%' },
    { cuenta: 'TT-G-C-034', descripcion: 'Mantto Galpones - Sandblasting', ene: 63, feb: 240, mar: 2013, abr: 139, may: 229, jun: 10, jul: 14, ago: 94, total: 2802, variacionJulAgo: '+596%' },
    { cuenta: 'SS-H-C-024', descripcion: 'Mantto herramientas - SMB', ene: 93, feb: 0, mar: 7, abr: 0, may: 261, jun: 575, jul: 45, ago: 18, total: 999, variacionJulAgo: '-60%' },
  ],
  notasExplicativas: [
    'Incrementos: TT-I-C-033 adecuación de contenedores en Pellas 1 (22K USD en acero al carbono, 1,2K USD en materiales de construcción y 1,2K en materiales eléctricos). TT-G-C-032: materiales eléctricos para cajas de distribución ($761 USD) y aire acondicionado para el comedor de fabricación ($550 USD).',
    'Disminuciones: TT-A-C-207 disminuyó tras la fabricación de 40 cajas de herramientas en el mes anterior (12,4K USD en láminas estriadas), quedando en el mes actual $443,58 USD (recarga de extintores $279,89 USD).'
  ]
};

// OPEX: Flota de Grúas TIMACA (26 Grúas Activas)
export const FLOTA_GRUAS_TIMACA_2026 = {
  totalAgosto: 32364,
  totalAcumulado2026: 333471,
  variacionVsJulio: -1,
  gruasActivas: 26,
  gruaMayorGastoAgosto: {
    codigo: 'EEI-C-GR17',
    nombre: 'Grúa Grove TM 890 - 90TN Serial 68473',
    montoAgosto: 23206,
    montoJulio: 1236,
    variacionVsJulio: 1777,
  },
  top5GruasAgosto: [
    { codigo: 'EEI-C-GR17', descripcion: 'Grua Grove TM 890 - 90TN Serial 68473', monto: 23206, variacion: '+1777%' },
    { codigo: 'EEI-C-GR25', descripcion: 'Grua Grove RT750 50TN Serial: 87167', monto: 1546, variacion: '-47%' },
    { codigo: 'EEI-C-GR13', descripcion: 'Grua Grove RT 75S - 50TN Serial 39750', monto: 1490, variacion: '+110%' },
    { codigo: 'EEI-C-GR20', descripcion: 'Grua Demag AC-200 - 200TN Serial 74599126', monto: 1254, variacion: '-50%' },
    { codigo: 'EEI-C-GR07', descripcion: 'Grua P&H R200 - 20TN Serial 35021', monto: 1118, variacion: '+405%' },
    { codigo: 'OTRAS', descripcion: 'Otras Grúas de la Flota', monto: 3750, variacion: '-15%' },
  ],
  detalleGruasMayorVariacion: [
    { codigo: 'EEI-C-GR17', proyecto: 'Grua Grove TM 890 - 90TN Serial 68473', ene: 0, feb: 1065, mar: 1083, abr: 1630, may: 29, jun: 1081, jul: 1236, ago: 23206, variacion: '▲ 1777%' },
    { codigo: 'EEI-C-GR07', proyecto: 'Grua P&H R200 - 20TN Serial 35021', ene: 478, feb: 505, mar: 12, abr: 312, may: 0, jun: 413, jul: 221, ago: 1118, variacion: '▲ 405%' },
    { codigo: 'EEI-C-GR03', proyecto: 'Grua P&H R180 - 18TN Serial 37815', ene: 0, feb: 88, mar: 49, abr: 262, may: 893, jun: 256, jul: 64, ago: 1070, variacion: '▲ 1566%' },
    { codigo: 'EEI-C-GR08', proyecto: 'Grua P&H R200 - 20TN Serial 40665', ene: 113, feb: 0, mar: 225, abr: 0, may: 4684, jun: 3877, jul: 4827, ago: 124, variacion: '▼ 97%' },
    { codigo: 'EEI-C-GR16', proyecto: 'Grua Grove RT 865B - 65TN Serial 82898', ene: 2076, feb: 4096, mar: 175, abr: 5033, may: 3998, jun: 6286, jul: 2108, ago: 66, variacion: '▼ 97%' },
    { codigo: 'EEI-C-GR24', proyecto: 'Grua Liebherr ITM1100/1 - 100TN Serial W09555000', ene: 40453, feb: 1, mar: 16717, abr: 113, may: 990, jun: 560, jul: 2429, ago: 23, variacion: '▼ 99%' },
  ],
  analisisCausas: [
    'Subieron: GR17: reemplazo de cauchos ($12,6K USD) y fabricación de sello hidráulico ($7,3K USD). GR07 y GR03: fabricación de sellos hidráulicos.',
    'Bajaron: GR16 y GR24: en julio se ejecutó fabricación mayor de sello hidráulico ($1,1K y $1,6K USD) que concluyó y no se repitió en agosto. GR08: solo se ejecutó cristalería por $110 USD.'
  ]
};
