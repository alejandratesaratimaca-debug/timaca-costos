var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/data/mockCostosTimaca.ts
var mockCostosTimaca_exports = {};
__export(mockCostosTimaca_exports, {
  CATEGORIAS_DEFAULT: () => CATEGORIAS_DEFAULT,
  CATEGORIAS_MATERIALES_EXCEL_OFICIAL: () => CATEGORIAS_MATERIALES_EXCEL_OFICIAL,
  CATEGORIAS_PPT_2026: () => CATEGORIAS_PPT_2026,
  CUENTAS_AUXILIARES_DEFAULT: () => CUENTAS_AUXILIARES_DEFAULT,
  CUENTAS_AUXILIARES_EXACTAS_AGOSTO_2026: () => CUENTAS_AUXILIARES_EXACTAS_AGOSTO_2026,
  CUENTAS_CORTAS_MAP: () => CUENTAS_CORTAS_MAP,
  DETALLE_NOMINA_AGOSTO_2026: () => DETALLE_NOMINA_AGOSTO_2026,
  DETALLE_SUBCONCEPTOS_CATEGORIAS: () => DETALLE_SUBCONCEPTOS_CATEGORIAS,
  OFICIAL_MOD_CUENTAS_AGOSTO_2026: () => OFICIAL_MOD_CUENTAS_AGOSTO_2026,
  PROYECTOS_DEFAULT: () => PROYECTOS_DEFAULT,
  PROYECTOS_EXTERNOS_TIMACA: () => PROYECTOS_EXTERNOS_TIMACA,
  TABLA_PPT_DISTRIBUCION_2026: () => TABLA_PPT_DISTRIBUCION_2026,
  TOTALES_MESES_PPT: () => TOTALES_MESES_PPT,
  TOTALES_NOMINA_SEMANAL_AGOSTO: () => TOTALES_NOMINA_SEMANAL_AGOSTO2,
  generateInitialMockCostos: () => generateInitialMockCostos
});
module.exports = __toCommonJS(mockCostosTimaca_exports);

// src/data/mockManoObraDiaria.ts
var CUENTAS_CORTAS_MAP = {
  "TTE-C-0706": "L\xEDnea 1 Pellas",
  "TTE-C-0671": "2da L\xEDnea PMH",
  "TTE-C-0668": "Briquetas Fase 2",
  "TTE-C-0656": "Bandas Transp. PMH",
  "TTE-C-0653": "Rueda Cangilones PMH",
  "TTE-C-0680": "Mantenimiento BG II",
  "TTE-C-0655": "Tolva PMH",
  "TTE-C-0678": "Pila HA y HB PMH",
  "TTE-C-0640": "Parrilla M\xF3vil Pellas",
  "TTE-C-0694": "Caldera Briquetas",
  "TTE-C-0669": "Mtto Dravo",
  "TTE-C-0670": "Mtto Briqueteras",
  "TTE-C-0676": "2da L\xEDnea Pellas",
  "TTE-C-0697": "Generador Briquetas",
  "TTE-C-0688": "Carga Barcos Wellman",
  "TTE-C-0663": "Boca Grande 2 Etapa III",
  "TTE-C-0684": "Gamelas FMO-PMH",
  "TTE-C-0642": "Ship Loader FMO",
  "TTE-C-0711": "M\xF3dulos El\xE9ctricos TH4",
  "TTE-C-0654": "Cinta JD-9021"
};

// src/data/mockProyectosCategoriasPPT.ts
var PROYECTOS_CATEGORIAS_AGOSTO_2026 = [
  {
    ranking: 1,
    cuentaAuxiliar: "TTE-C-0706",
    proyecto: "Recuperaci\xF3n de L\xEDnea 1 de Planta de Pellas",
    proyectoCorto: "L\xEDnea 1 Pellas",
    materiales: 192867,
    servicios: 63106,
    manoDeObra: 133185,
    horasMaquina: 25565,
    indirectos: 101621,
    totalProyecto: 516344,
    porcentaje: 44.36
  },
  {
    ranking: 2,
    cuentaAuxiliar: "TTE-C-0671",
    proyecto: "Segunda l\xEDnea PMH - Ingenier\xEDa, dise\xF1o y suministro",
    proyectoCorto: "2da L\xEDnea PMH",
    materiales: 91322,
    servicios: 19500,
    manoDeObra: 14818,
    horasMaquina: 17335,
    indirectos: 35050,
    totalProyecto: 178025,
    porcentaje: 15.3
  },
  {
    ranking: 3,
    cuentaAuxiliar: "TTE-C-0668",
    proyecto: "Fase 2 Planta de briquetas - FMO",
    proyectoCorto: "Briquetas Fase 2",
    materiales: 80100,
    servicios: 17400,
    manoDeObra: 15221,
    horasMaquina: 14901,
    indirectos: 31270,
    totalProyecto: 158892,
    porcentaje: 13.65
  },
  {
    ranking: 4,
    cuentaAuxiliar: "TTE-C-0656",
    proyecto: "Rehabilitaci\xF3n de bandas transportadoras PMH",
    proyectoCorto: "Bandas Transp. PMH",
    materiales: 26400,
    servicios: 9864,
    manoDeObra: 28142,
    horasMaquina: 7906,
    indirectos: 17709,
    totalProyecto: 90021,
    porcentaje: 7.73
  },
  {
    ranking: 5,
    cuentaAuxiliar: "TTE-C-0653",
    proyecto: "Repotenciaci\xF3n de rueda de cangilones (DRAVO) PMH",
    proyectoCorto: "Rueda Cangilones PMH",
    materiales: 28200,
    servicios: 7100,
    manoDeObra: 10898,
    horasMaquina: 6e3,
    indirectos: 12783,
    totalProyecto: 64981,
    porcentaje: 5.58
  },
  {
    ranking: 6,
    cuentaAuxiliar: "TTE-C-0680",
    proyecto: "Servicio de mantenimiento de BG II",
    proyectoCorto: "Mantenimiento BG II",
    materiales: 20100,
    servicios: 2526,
    manoDeObra: 9307,
    horasMaquina: 4e3,
    indirectos: 8798,
    totalProyecto: 44731,
    porcentaje: 3.84
  },
  {
    ranking: 7,
    cuentaAuxiliar: "TTE-C-0655",
    proyecto: "Interconexi\xF3n del sist. de transporte desde tolva PMH",
    proyectoCorto: "Tolva PMH",
    materiales: 18500,
    servicios: 2400,
    manoDeObra: 2681,
    horasMaquina: 2e3,
    indirectos: 6277,
    totalProyecto: 31858,
    porcentaje: 2.74
  },
  {
    ranking: 8,
    cuentaAuxiliar: "TTE-C-0678",
    proyecto: "Proyecto Pila HA y HB, suministro e instalaci\xF3n PMH",
    proyectoCorto: "Pila HA y HB PMH",
    materiales: 6800,
    servicios: 2100,
    manoDeObra: 9451,
    horasMaquina: 1646,
    indirectos: 4903,
    totalProyecto: 24900,
    porcentaje: 2.14
  },
  {
    ranking: 9,
    cuentaAuxiliar: "TTE-C-0640",
    proyecto: "Rehabilitaci\xF3n de la Parrilla M\xF3vil 610TG1 / Pellas",
    proyectoCorto: "Parrilla M\xF3vil Pellas",
    materiales: 2500,
    servicios: 3501,
    manoDeObra: 4e3,
    horasMaquina: 1e3,
    indirectos: 2704,
    totalProyecto: 13705,
    porcentaje: 1.18
  },
  {
    ranking: 10,
    cuentaAuxiliar: "TTE-C-0694",
    proyecto: "Suministro e Instalaci\xF3n de la Caldera - Briquetas",
    proyectoCorto: "Caldera Briquetas",
    materiales: 2400,
    servicios: 3238,
    manoDeObra: 2514,
    horasMaquina: 1e3,
    indirectos: 2246,
    totalProyecto: 11398,
    porcentaje: 0.98
  },
  {
    ranking: 11,
    cuentaAuxiliar: "TTE-C-0669",
    proyecto: "Servicio de mantenimiento de Dravo",
    proyectoCorto: "Mtto Dravo",
    materiales: 1800,
    servicios: 3570,
    manoDeObra: 2e3,
    horasMaquina: 1e3,
    indirectos: 2062,
    totalProyecto: 10432,
    porcentaje: 0.9
  },
  {
    ranking: 12,
    cuentaAuxiliar: "TTE-C-0670",
    proyecto: "Servicio de mtto. Maquinas Briqueteras",
    proyectoCorto: "Mtto Briqueteras",
    materiales: 600,
    servicios: 1567,
    manoDeObra: 4854,
    horasMaquina: 1e3,
    indirectos: 1971,
    totalProyecto: 9992,
    porcentaje: 0.86
  },
  {
    ranking: 13,
    cuentaAuxiliar: "TTE-C-0676",
    proyecto: "Segunda linea de Planta de Pellas",
    proyectoCorto: "2da L\xEDnea Pellas",
    materiales: 1200,
    servicios: 916,
    manoDeObra: 600,
    horasMaquina: 500,
    indirectos: 802,
    totalProyecto: 4018,
    porcentaje: 0.35
  },
  {
    ranking: 14,
    cuentaAuxiliar: "TTE-C-0697",
    proyecto: "Reparaci\xF3n de Generador El\xE9ctrico (Briquetas)",
    proyectoCorto: "Generador Briquetas",
    materiales: 300,
    servicios: 237,
    manoDeObra: 200,
    horasMaquina: 200,
    indirectos: 229,
    totalProyecto: 1166,
    porcentaje: 0.1
  },
  {
    ranking: 15,
    cuentaAuxiliar: "TTE-C-0688",
    proyecto: "Desmantelamiento del Carga Barcos Wellman",
    proyectoCorto: "Carga Barcos Wellman",
    materiales: 200,
    servicios: 239,
    manoDeObra: 200,
    horasMaquina: 200,
    indirectos: 206,
    totalProyecto: 1045,
    porcentaje: 0.09
  },
  {
    ranking: 16,
    cuentaAuxiliar: "TTE-C-0663",
    proyecto: "Reacondicionamiento etapa III en Boca Grande 2",
    proyectoCorto: "Boca Grande 2 Etapa III",
    materiales: 150,
    servicios: 148,
    manoDeObra: 150,
    horasMaquina: 150,
    indirectos: 161,
    totalProyecto: 759,
    porcentaje: 0.07
  },
  {
    ranking: 17,
    cuentaAuxiliar: "TTE-C-0684",
    proyecto: "Fabricaci\xF3n de Gamelas FMO-PMH",
    proyectoCorto: "Gamelas FMO-PMH",
    materiales: 100,
    servicios: 277,
    manoDeObra: 100,
    horasMaquina: 50,
    indirectos: 138,
    totalProyecto: 665,
    porcentaje: 0.06
  },
  {
    ranking: 18,
    cuentaAuxiliar: "TTE-C-0642",
    proyecto: "Rehabilitaci\xF3n de Carga Barco FMO (Ship loader)",
    proyectoCorto: "Ship Loader FMO",
    materiales: 80,
    servicios: 80,
    manoDeObra: 80,
    horasMaquina: 50,
    indirectos: 69,
    totalProyecto: 359,
    porcentaje: 0.03
  },
  {
    ranking: 19,
    cuentaAuxiliar: "TTE-C-0711",
    proyecto: "Servicio de retirada de modulos el\xE9ctricos TH4 PMH",
    proyectoCorto: "M\xF3dulos El\xE9ctricos TH4",
    materiales: 60,
    servicios: 75,
    manoDeObra: 80,
    horasMaquina: 50,
    indirectos: 69,
    totalProyecto: 334,
    porcentaje: 0.03
  },
  {
    ranking: 20,
    cuentaAuxiliar: "TTE-C-0654",
    proyecto: "Proyecto 5B: Cinta JD-9021",
    proyectoCorto: "Cinta JD-9021",
    materiales: 50,
    servicios: 63,
    manoDeObra: 80,
    horasMaquina: 50,
    indirectos: 47,
    totalProyecto: 290,
    porcentaje: 0.02
  }
];
var TOTAL_ANUAL_CONSOLIDADO = 11286944;
var TOTAL_CAT_ANUAL = {
  materiales: 3906839,
  servicios: 2982298,
  manoDeObra: 1964981,
  horasMaquina: 827350,
  indirectos: 1605476
};
var PELLAS_ANUAL = {
  ranking: 1,
  cuentaAuxiliar: "TTE-C-0706",
  proyecto: "Recuperaci\xF3n de L\xEDnea 1 de Planta de Pellas",
  proyectoCorto: "L\xEDnea 1 Pellas",
  materiales: 319860,
  servicios: 226634,
  manoDeObra: 46e4,
  horasMaquina: 259e3,
  indirectos: 497236,
  totalProyecto: 1762730,
  porcentaje: Math.round(1762730 / TOTAL_ANUAL_CONSOLIDADO * 1e4) / 100
};
var otrosProyectosAgo = PROYECTOS_CATEGORIAS_AGOSTO_2026.filter((p) => p.cuentaAuxiliar !== "TTE-C-0706");
var baseMat = otrosProyectosAgo.reduce((s, p) => s + p.materiales, 0);
var baseSrv = otrosProyectosAgo.reduce((s, p) => s + p.servicios, 0);
var baseMod = otrosProyectosAgo.reduce((s, p) => s + p.manoDeObra, 0);
var baseHm = otrosProyectosAgo.reduce((s, p) => s + p.horasMaquina, 0);
var baseInd = otrosProyectosAgo.reduce((s, p) => s + p.indirectos, 0);
var remMat = TOTAL_CAT_ANUAL.materiales - PELLAS_ANUAL.materiales;
var remSrv = TOTAL_CAT_ANUAL.servicios - PELLAS_ANUAL.servicios;
var remMod = TOTAL_CAT_ANUAL.manoDeObra - PELLAS_ANUAL.manoDeObra;
var remHm = TOTAL_CAT_ANUAL.horasMaquina - PELLAS_ANUAL.horasMaquina;
var remInd = TOTAL_CAT_ANUAL.indirectos - PELLAS_ANUAL.indirectos;
var acumuladoMat = PELLAS_ANUAL.materiales;
var acumuladoSrv = PELLAS_ANUAL.servicios;
var acumuladoMod = PELLAS_ANUAL.manoDeObra;
var acumuladoHm = PELLAS_ANUAL.horasMaquina;
var acumuladoInd = PELLAS_ANUAL.indirectos;
var listaOtrosAnual = otrosProyectosAgo.map((p, idx) => {
  const isLast = idx === otrosProyectosAgo.length - 1;
  const mat = isLast ? Math.round((TOTAL_CAT_ANUAL.materiales - acumuladoMat) * 100) / 100 : Math.round(remMat * (p.materiales / baseMat) * 100) / 100;
  const srv = isLast ? Math.round((TOTAL_CAT_ANUAL.servicios - acumuladoSrv) * 100) / 100 : Math.round(remSrv * (p.servicios / baseSrv) * 100) / 100;
  const mod = isLast ? Math.round((TOTAL_CAT_ANUAL.manoDeObra - acumuladoMod) * 100) / 100 : Math.round(remMod * (p.manoDeObra / baseMod) * 100) / 100;
  const hm = isLast ? Math.round((TOTAL_CAT_ANUAL.horasMaquina - acumuladoHm) * 100) / 100 : Math.round(remHm * (p.horasMaquina / baseHm) * 100) / 100;
  const ind = isLast ? Math.round((TOTAL_CAT_ANUAL.indirectos - acumuladoInd) * 100) / 100 : Math.round(remInd * (p.indirectos / baseInd) * 100) / 100;
  acumuladoMat += mat;
  acumuladoSrv += srv;
  acumuladoMod += mod;
  acumuladoHm += hm;
  acumuladoInd += ind;
  const tot = Math.round((mat + srv + mod + hm + ind) * 100) / 100;
  return {
    ranking: 0,
    cuentaAuxiliar: p.cuentaAuxiliar,
    proyecto: p.proyecto,
    proyectoCorto: p.proyectoCorto,
    materiales: mat,
    servicios: srv,
    manoDeObra: mod,
    horasMaquina: hm,
    indirectos: ind,
    totalProyecto: tot,
    porcentaje: Math.round(tot / TOTAL_ANUAL_CONSOLIDADO * 1e4) / 100
  };
});
var PROYECTOS_CATEGORIAS_ANUAL_2026 = [
  PELLAS_ANUAL,
  ...listaOtrosAnual
].sort((a, b) => b.totalProyecto - a.totalProyecto).map((p, idx) => ({ ...p, ranking: idx + 1 }));

// src/data/mockCostosTimaca.ts
var CATEGORIAS_PPT_2026 = [
  "Materiales Directos",
  "Servicios",
  "Mano de Obra Directa",
  "Horas Maquina",
  "Costos Indirectos"
];
var CATEGORIAS_MATERIALES_EXCEL_OFICIAL = [
  "Accesorios De Carroceria",
  "Aceite Hidraulico",
  "Adhesivo, Cemento Plastico, Selladores",
  "Arena, Piedra Y Aditivos Agregados",
  "Bloques",
  "Cauchos Y Tripas Para Vehiculos",
  "Cemento / Pego / Yeso/ Otros",
  "Comestibles / Bebidas",
  "Costo De Hielo Y Agua Potable",
  "Costos De Elevaci\xF3n",
  "Eq. E Instrumentos De Medicion",
  "Eq. Y Acc De Oxicorte",
  "Eq. Y Consumibles De Soldadura",
  "Equipos De Proteccion Personal",
  "Equipos De Seguridad",
  "Gas Envasado Argon",
  "Materiales Mecanicos",
  "Planchas y Perfiles Estructurales",
  "Tuber\xEDas, V\xE1lvulas y Conexiones",
  "Torniller\xEDa y Elementos de Fijaci\xF3n"
];
var DETALLE_SUBCONCEPTOS_CATEGORIAS = {
  "Materiales Directos": {
    descripcion: "Insumos f\xEDsicos y familias de inventario SIP incorporados directamente en la estructura u obra industrial seg\xFAn planos de ingenier\xEDa.",
    subrubros: CATEGORIAS_MATERIALES_EXCEL_OFICIAL,
    responsableTipico: "Almac\xE9n Central SIP / Procura de Materiales",
    color: "#2563eb"
    // Azul acero
  },
  "Servicios": {
    descripcion: "Contrataciones externas especializadas, fletes pesados y ensayos de laboratorio requeridos para la ejecuci\xF3n del proyecto.",
    subrubros: [
      "Ensayos No Destructivos (END / Radiograf\xEDa / Ultrasonido / L\xEDquidos Penetrantes)",
      "Subcontrato de Maquinado de Gran Escala y Torno Pesado",
      "Servicio de Arenado a Presi\xF3n (Sandblasting SSPC-SP10)",
      "Transporte Pesado en Gandolas y Lowboy de piezas sobredimensionadas",
      "Calificaci\xF3n y Homologaci\xF3n de Procedimientos de Soldadura (WPS/PQR)"
    ],
    responsableTipico: "Coordinaci\xF3n de Servicios & QA/QC",
    color: "#f97316"
    // Naranja industrial
  },
  "Mano de Obra Directa": {
    descripcion: "Personal t\xE9cnico de taller y campo que transforma y monta los elementos mec\xE1nicos y estructurales.",
    subrubros: [
      "Soldadores calificados 6G / ASME IX",
      "Mec\xE1nicos Montadores de Equipos Industriales",
      "Paileros y Fabricadores de Estructuras Pesadas",
      "Armadores de Calderer\xEDa",
      "Electricistas e Instrumentistas de Planta",
      "Ayudantes T\xE9cnicos y Cuadrillas de Obra"
    ],
    responsableTipico: "Recursos Humanos / N\xF3mina de Planta",
    color: "#10b981"
    // Esmeralda
  },
  "Horas Maquina": {
    descripcion: "Tiempo operativo y depreciaci\xF3n horaria de equipos pesados, maquinaria de taller y gr\xFAas de izamiento.",
    subrubros: [
      "Torno Vertical Schiess (Maquinado de coronas y pistas)",
      "Mandrinadora CNC de Gran Capacidad",
      "Fresadora Universal y Cepilladora de Bancada",
      "Gr\xFAas Telesc\xF3picas de Izamiento (45T, 80T y 120T)",
      "Prensa Hidr\xE1ulica de 500 Toneladas y Roscadoras",
      "Generadores Di\xE9sel y Compresores de Alta Presi\xF3n"
    ],
    responsableTipico: "Jefatura de Taller & Equipos Pesados",
    color: "#8b5cf6"
    // Púrpura
  },
  "Costos Indirectos": {
    descripcion: "Gastos de soporte operativo, consumibles auxiliares, supervisi\xF3n t\xE9cnica y log\xEDstica indispensables para la obra.",
    subrubros: [
      "Supervisi\xF3n T\xE9cnica de Campo y Residentes de Obra",
      "Consumibles de Taller (Discos de corte Tyrolit, cepillos, desengrasantes)",
      "Gases Industriales (Arg\xF3n 99.9%, Ox\xEDgeno, Acetileno)",
      "Equipos de Protecci\xF3n Personal (EPP, caretas, arneses, botas)",
      "Log\xEDstica, Transporte de Cuadrillas y Mantenimiento de Campamento"
    ],
    responsableTipico: "Control de Gesti\xF3n & Log\xEDstica",
    color: "#eab308"
    // Ámbar
  }
};
var TABLA_PPT_DISTRIBUCION_2026 = [
  {
    categoria: "Materiales Directos",
    meses: [618977, 687830, 652727, 370626, 287963, 480586, 301441, 506689],
    total2026: 3906839,
    variacion: "+68%",
    variacionNum: 68,
    esPositiva: true
  },
  {
    categoria: "Servicios",
    meses: [144566, 178897, 296831, 108933, 115232, 1645192, 374676, 117970],
    total2026: 2982298,
    variacion: "-69%",
    variacionNum: -69,
    esPositiva: false
  },
  {
    categoria: "Mano de Obra Directa",
    meses: [312530, 269666, 255366, 229531, 261564, 202303, 212668, 221353],
    total2026: 1964981,
    variacion: "+4%",
    variacionNum: 4,
    esPositiva: true
  },
  {
    categoria: "Horas Maquina",
    meses: [145113, 113686, 149030, 55110, 129625, 69063, 75933, 89789],
    total2026: 827350,
    variacion: "+18%",
    variacionNum: 18,
    esPositiva: true
  },
  {
    categoria: "Costos Indirectos",
    meses: [195351, 199740, 205241, 183364, 180590, 184709, 228369, 228113],
    total2026: 1605477,
    variacion: "0%",
    variacionNum: 0,
    esPositiva: false
  }
];
var TOTALES_MESES_PPT = [
  { mesNum: 1, mesNombre: "Enero 2026", total: 1416537 },
  { mesNum: 2, mesNombre: "Febrero 2026", total: 1449819 },
  { mesNum: 3, mesNombre: "Marzo 2026", total: 1559195 },
  { mesNum: 4, mesNombre: "Abril 2026", total: 947564 },
  { mesNum: 5, mesNombre: "Mayo 2026", total: 974974 },
  { mesNum: 6, mesNombre: "Junio 2026", total: 2581853 },
  { mesNum: 7, mesNombre: "Julio 2026", total: 1193087 },
  { mesNum: 8, mesNombre: "Agosto 2026", total: 1163915 }
];
var CUENTAS_AUXILIARES_EXACTAS_AGOSTO_2026 = [
  { cuentaAuxiliar: "TTE-C-0706", proyecto: "Recuperaci\xF3n de L\xEDnea 1 de Planta de Pellas", proyectoCorto: "L\xEDnea 1 Pellas", montoAgosto: 516344, porcentaje: 44.36 },
  { cuentaAuxiliar: "TTE-C-0671", proyecto: "Segunda l\xEDnea PMH - Ingenier\xEDa, dise\xF1o y suministro", proyectoCorto: "2da L\xEDnea PMH", montoAgosto: 178025, porcentaje: 15.3 },
  { cuentaAuxiliar: "TTE-C-0668", proyecto: "Fase 2 Planta de briquetas - FMO", proyectoCorto: "Briquetas Fase 2", montoAgosto: 158892, porcentaje: 13.65 },
  { cuentaAuxiliar: "TTE-C-0656", proyecto: "Rehabilitaci\xF3n de bandas transportadoras PMH", proyectoCorto: "Bandas Transp. PMH", montoAgosto: 90021, porcentaje: 7.73 },
  { cuentaAuxiliar: "TTE-C-0653", proyecto: "Repotenciaci\xF3n de rueda de cangilones (DRAVO) PMH", proyectoCorto: "Rueda Cangilones PMH", montoAgosto: 64981, porcentaje: 5.58 },
  { cuentaAuxiliar: "TTE-C-0680", proyecto: "Servicio de mantenimiento de BG II", proyectoCorto: "Mantenimiento BG II", montoAgosto: 44731, porcentaje: 3.84 },
  { cuentaAuxiliar: "TTE-C-0655", proyecto: "Interconexi\xF3n del sist. de transporte desde tolva PMH", proyectoCorto: "Tolva PMH", montoAgosto: 31858, porcentaje: 2.74 },
  { cuentaAuxiliar: "TTE-C-0678", proyecto: "Proyecto Pila HA y HB, suministro e instalaci\xF3n PMH", proyectoCorto: "Pila HA y HB PMH", montoAgosto: 24900, porcentaje: 2.14 },
  { cuentaAuxiliar: "TTE-C-0640", proyecto: "Rehabilitaci\xF3n de la Parrilla M\xF3vil 610TG1 / Pellas", proyectoCorto: "Parrilla M\xF3vil Pellas", montoAgosto: 13705, porcentaje: 1.18 },
  { cuentaAuxiliar: "TTE-C-0694", proyecto: "Suministro e Instalaci\xF3n de la Caldera - Briquetas", proyectoCorto: "Caldera Briquetas", montoAgosto: 11398, porcentaje: 0.98 },
  { cuentaAuxiliar: "TTE-C-0669", proyecto: "Servicio de mantenimiento de Dravo", proyectoCorto: "Mtto Dravo", montoAgosto: 10432, porcentaje: 0.9 },
  { cuentaAuxiliar: "TTE-C-0670", proyecto: "Servicio de mtto. Maquinas Briqueteras", proyectoCorto: "Mtto Briqueteras", montoAgosto: 9992, porcentaje: 0.86 },
  { cuentaAuxiliar: "TTE-C-0676", proyecto: "Segunda linea de Planta de Pellas", proyectoCorto: "2da L\xEDnea Pellas", montoAgosto: 4018, porcentaje: 0.35 },
  { cuentaAuxiliar: "TTE-C-0697", proyecto: "Reparaci\xF3n de Generador El\xE9ctrico (Briquetas)", proyectoCorto: "Generador Briquetas", montoAgosto: 1166, porcentaje: 0.1 },
  { cuentaAuxiliar: "TTE-C-0688", proyecto: "Desmantelamiento del Carga Barcos Wellman", proyectoCorto: "Carga Barcos Wellman", montoAgosto: 1045, porcentaje: 0.09 },
  { cuentaAuxiliar: "TTE-C-0663", proyecto: "Reacondicionamiento etapa III en Boca Grande 2", proyectoCorto: "Boca Grande 2 Etapa III", montoAgosto: 759, porcentaje: 0.07 },
  { cuentaAuxiliar: "TTE-C-0684", proyecto: "Fabricaci\xF3n de Gamelas FMO-PMH", proyectoCorto: "Gamelas FMO-PMH", montoAgosto: 665, porcentaje: 0.06 },
  { cuentaAuxiliar: "TTE-C-0642", proyecto: "Rehabilitaci\xF3n de Carga Barco FMO (Ship loader)", proyectoCorto: "Ship Loader FMO", montoAgosto: 359, porcentaje: 0.03 },
  { cuentaAuxiliar: "TTE-C-0711", proyecto: "Servicio de retirada de modulos el\xE9ctricos TH4 PMH", proyectoCorto: "M\xF3dulos El\xE9ctricos TH4", montoAgosto: 334, porcentaje: 0.03 },
  { cuentaAuxiliar: "TTE-C-0654", proyecto: "Proyecto 5B: Rehabilitaci\xF3n de cinta JD-9021", proyectoCorto: "Cinta JD-9021", montoAgosto: 290, porcentaje: 0.02 }
];
var OFICIAL_MOD_CUENTAS_AGOSTO_2026 = [
  {
    nombreCuenta: "Recuperaci\xF3n L\xEDnea 1 Pellas",
    ctaAuxiliar: "TTE-C-0706",
    modUsd: 133185,
    porcentaje: 60.17,
    sem31: 33373,
    sem32: 34192,
    sem33: 33639,
    sem34: 31981,
    sourceFile: "2026 - Pellas sem 31 a 34.xlsx"
  },
  {
    nombreCuenta: "Rehabilitaci\xF3n de Bandas PMH",
    ctaAuxiliar: "TTE-C-0656",
    modUsd: 28142,
    porcentaje: 12.71,
    sem31: 6950,
    sem32: 7120,
    sem33: 7240,
    sem34: 6832,
    sourceFile: "2026 - PMH sem 31 a 34.xlsx"
  },
  {
    nombreCuenta: "Fase 2 Planta Briquetas",
    ctaAuxiliar: "TTE-C-0668",
    modUsd: 15221,
    porcentaje: 6.88,
    sem31: 3780,
    sem32: 3820,
    sem33: 3920,
    sem34: 3701,
    sourceFile: "2026 - Briquetas sem 31 a 34.xlsx"
  },
  {
    nombreCuenta: "Segunda L\xEDnea PMH",
    ctaAuxiliar: "TTE-C-0671",
    modUsd: 14818,
    porcentaje: 6.69,
    sem31: 3680,
    sem32: 3740,
    sem33: 3820,
    sem34: 3578,
    sourceFile: "2026 - PMH sem 31 a 34.xlsx"
  },
  {
    nombreCuenta: "Proyecto Pila HA y HB",
    ctaAuxiliar: "TTE-C-0678",
    modUsd: 9451,
    porcentaje: 4.27,
    sem31: 2340,
    sem32: 2380,
    sem33: 2460,
    sem34: 2271,
    sourceFile: "2026 - PMH sem 31 a 34.xlsx"
  },
  {
    nombreCuenta: "Mantenimiento BG II",
    ctaAuxiliar: "TTE-C-0680",
    modUsd: 9307,
    porcentaje: 4.2,
    sem31: 2310,
    sem32: 2345,
    sem33: 2420,
    sem34: 2232,
    sourceFile: "2026 - BG sem 31 a 34.xlsx"
  },
  {
    nombreCuenta: "Mantenimiento Briqueteras",
    ctaAuxiliar: "TTE-C-0670",
    modUsd: 6854,
    porcentaje: 3.1,
    sem31: 1700,
    sem32: 1730,
    sem33: 1780,
    sem34: 1644,
    sourceFile: "2026 - Briquetas sem 31 a 34.xlsx"
  },
  {
    nombreCuenta: "Suministro Caldera Briquetas",
    ctaAuxiliar: "TTE-C-0694",
    modUsd: 2514,
    porcentaje: 1.14,
    sem31: 620,
    sem32: 635,
    sem33: 655,
    sem34: 604,
    sourceFile: "2026 - Briquetas sem 31 a 34.xlsx"
  },
  {
    nombreCuenta: "Fabricaci\xF3n de Gamelas",
    ctaAuxiliar: "TTE-C-0684",
    modUsd: 1411,
    porcentaje: 0.64,
    sem31: 350,
    sem32: 355,
    sem33: 365,
    sem34: 341,
    sourceFile: "2026 - Taller Gamelas sem 31 a 34.xlsx"
  },
  {
    nombreCuenta: "Interconexi\xF3n PMH",
    ctaAuxiliar: "TTE-C-0655",
    modUsd: 450,
    porcentaje: 0.2,
    sem31: 103,
    sem32: 108,
    sem33: 120,
    sem34: 119,
    sourceFile: "2026 - PMH sem 31 a 34.xlsx"
  }
];
var DETALLE_NOMINA_AGOSTO_2026 = OFICIAL_MOD_CUENTAS_AGOSTO_2026.map((row) => ({
  cuentaAuxiliar: row.ctaAuxiliar,
  sourceFile: row.sourceFile,
  proyecto: row.nombreCuenta,
  sem31: row.sem31,
  sem32: row.sem32,
  sem33: row.sem33,
  sem34: row.sem34,
  total: row.modUsd
}));
var TOTALES_NOMINA_SEMANAL_AGOSTO2 = {
  sem31: 55206,
  sem32: 56425,
  sem33: 56399,
  sem34: 53323,
  totalGeneral: 221353
};
var CATEGORIAS_DEFAULT = CATEGORIAS_PPT_2026;
var PROYECTOS_DEFAULT = CUENTAS_AUXILIARES_EXACTAS_AGOSTO_2026.map((p) => `${p.cuentaAuxiliar}: ${p.proyectoCorto}`);
var CUENTAS_AUXILIARES_DEFAULT = CUENTAS_AUXILIARES_EXACTAS_AGOSTO_2026.map((p) => ({
  codigo: p.cuentaAuxiliar,
  nombre: p.proyecto,
  nombreCorto: p.proyectoCorto
}));
var PROYECTOS_EXTERNOS_TIMACA = CUENTAS_AUXILIARES_EXACTAS_AGOSTO_2026.map((p) => ({
  codigo: p.cuentaAuxiliar,
  nombre: `${p.cuentaAuxiliar}: ${p.proyectoCorto}`,
  cliente: p.proyecto,
  proyectoCorto: p.proyectoCorto,
  pesoAgo: p.porcentaje / 100
}));
function generateInitialMockCostos() {
  const salidas = [];
  let idCounter = 1;
  const CATALOGO_SIP_MATERIALES = [
    { desc: "Plancha Acero Estructural ASTM A36 12mm x 2400 x 6000mm", um: "plancha", pUnit: 1420, resp: "Almac\xE9n Central SIP - Roberto Ben\xEDtez" },
    { desc: 'Electrodo Soldadura Lincoln Excalibur E7018 1/8" (Caja 20kg)', um: "caja", pUnit: 92, resp: "Almac\xE9n Central SIP - Pedro Infante" },
    { desc: "Viga Estructural IPE 300 x 12 metros Acero Estructural", um: "barra", pUnit: 890, resp: "Almac\xE9n de Perfiles SIP" },
    { desc: "Rodamiento de rodillos esf\xE9ricos SKF 22220 EK/C3", um: "und", pUnit: 640, resp: "Almac\xE9n de Repuestos Mec\xE1nicos SIP" },
    { desc: "Pintura Ep\xF3xica Poliamida Anticorrosiva Gris (Cu\xF1ete 5 Gal)", um: "cu\xF1ete", pUnit: 185, resp: "Almac\xE9n Central SIP" },
    { desc: 'Tuber\xEDa Acero Carb\xF3n Sin Costura ASTM A106 Gr. B 6" Sch 40', um: "tubo", pUnit: 430, resp: "Almac\xE9n de Tuber\xEDas SIP" },
    { desc: 'Pernos Hexagonales ASTM A325 3/4" x 3" con tuerca 2H', um: "ciento", pUnit: 380, resp: "Almac\xE9n de Pernos SIP" },
    { desc: 'Plancha Antidesgaste Hardox 400 1/2" x 1500 x 3000mm', um: "plancha", pUnit: 1980, resp: "Almac\xE9n Central SIP" }
  ];
  const CATALOGO_SERVICIOS = [
    { desc: "Servicio de Supervisi\xF3n T\xE9cnica e Inspecci\xF3n Residente de Obra", um: "semana", pUnit: 850, resp: "Gerencia de Operaciones", subcat: "Supervisi\xF3n e Inspecci\xF3n T\xE9cnica" },
    { desc: "Servicio de Ensayo No Destructivo Radiograf\xEDa Industrial (Gammagraf\xEDa)", um: "servicio", pUnit: 1920, resp: "QA/QC Inspecci\xF3n - Elena Salazar", subcat: "Ensayos No Destructivos (END)" },
    { desc: "Servicio Especializado de Recarga de Gases Industriales: Gas Arg\xF3n 99.99% TIG", um: "cilindro", pUnit: 65, resp: "Almac\xE9n Central SIP", subcat: "Gases Industriales / Recargas" },
    { desc: "Servicio de Torno Pesado Schiess Maquinado de Corona Dentada", um: "servicio", pUnit: 4850, resp: "Jefatura de Taller - Javier Narv\xE1ez", subcat: "Maquinado Externo" },
    { desc: "Servicio de Transporte Pesado Cama Baja Lowboy Planta-FMO", um: "viaje", pUnit: 1250, resp: "Log\xEDstica & Fletes TIMACA", subcat: "Transporte / Flete" },
    { desc: "Servicio de Arenado Sandblasting SSPC-SP10 Estructura Met\xE1lica", um: "lote", pUnit: 2100, resp: "Taller de Pintura TIMACA", subcat: "Tratamiento Superficial" },
    { desc: "Calificaci\xF3n de Procedimiento de Soldadura WPS/PQR seg\xFAn ASME IX", um: "informe", pUnit: 1450, resp: "QA/QC Inspecci\xF3n - Elena Salazar", subcat: "Supervisi\xF3n e Inspecci\xF3n T\xE9cnica" }
  ];
  const CATALOGO_HORAS_MAQUINA = [
    { desc: "Operaci\xF3n Torno Vertical Schiess (Maquinado de Pista de Rodadura)", um: "horas", pUnit: 180, resp: "Coordinaci\xF3n Horas M\xE1quina - Andr\xE9s Morales" },
    { desc: "Servicio de Gr\xFAa Telesc\xF3pica Liebherr 80 Ton en Izamiento de Tolva", um: "horas", pUnit: 240, resp: "Coordinaci\xF3n Horas M\xE1quina - Andr\xE9s Morales" },
    { desc: "Operaci\xF3n Mandrinadora CNC Horas Operativas de Mecanizado", um: "horas", pUnit: 160, resp: "Jefatura de Taller - Javier Narv\xE1ez" },
    { desc: "Prensa Hidr\xE1ulica 500T Conformado de Planchas y Virolas", um: "horas", pUnit: 135, resp: "Jefatura de Taller - Javier Narv\xE1ez" }
  ];
  const CATALOGO_INDIRECTOS = [
    { desc: 'Consumibles de Taller: Discos de Corte Tyrolit 7" x 1/8" (Paq. 50 und)', um: "paquete", pUnit: 210, resp: "Almac\xE9n de Consumibles SIP", subcat: "Consumibles de Taller" },
    { desc: "Dotaci\xF3n EPP Cuadrillas de Obra (Caretas, Guantes de Carnaza, Botas)", um: "kit", pUnit: 120, resp: "Seguridad Industrial - Nelson Gu\xE9dez", subcat: "Seguridad Industrial (SIAHO)" },
    { desc: "Materiales Auxiliares de Montaje: Lijas, Cepillos Circulares y Solventes", um: "lote", pUnit: 175, resp: "Almac\xE9n Central SIP", subcat: "Consumibles de Taller" },
    { desc: "Soporte Log\xEDstico y Mantenimiento Menor de Instalaciones de Campamento", um: "lote", pUnit: 420, resp: "Servicios Generales TIMACA", subcat: "Facilidades de Obra" },
    { desc: "Materiales Auxiliares y Consumibles Operativos de Taller", um: "lote", pUnit: 140, resp: "Almac\xE9n Central SIP", subcat: "Consumibles Operativos" }
  ];
  const RECIENTES_SIP = [
    {
      fecha: "2026-08-31",
      sem: 34,
      cta: "TTE-C-0656",
      nro: "DP-88962",
      cat: "Materiales Directos",
      subcat: "Pernos / Fijaciones",
      descCustom: 'Pernos Hexagonales ASTM A325 3/4" x 3" c/tuerca 2H',
      cant: 2600,
      umCustom: "UND",
      pUnitCustom: 3.766,
      totalCustom: 9791.75,
      motivo: "Montaje estructural tramo motriz",
      solicitante: "Carlos Giraldo"
    },
    {
      fecha: "2026-08-31",
      sem: 34,
      cta: "TTE-C-0669",
      nro: "DP-88926",
      cat: "Materiales Directos",
      subcat: "Perfiles / Estructura",
      descCustom: "Viga Estructural IPE 300 x 12m Acero Estructural",
      cant: 3,
      umCustom: "BARRA (36 metros)",
      pUnitCustom: 760.03,
      totalCustom: 2280.1,
      motivo: "Fabricaci\xF3n vigas carril",
      solicitante: "Jes\xFAs Valdez"
    },
    {
      fecha: "2026-08-29",
      sem: 34,
      cta: "TTE-C-0678",
      nro: "SRV-2026-00061",
      cat: "Servicios",
      subcat: "Transporte / Flete",
      descCustom: "Servicio Transporte Cama Baja Lowboy Planta-FMO",
      cant: 1,
      umCustom: "VIAJE",
      pUnitCustom: 2524.56,
      totalCustom: 2524.56,
      motivo: "Traslado componentes pesados",
      solicitante: "Log\xEDstica TIMACA"
    },
    {
      fecha: "2026-08-30",
      sem: 34,
      cta: "TTE-C-0688",
      nro: "HM-2026-00097",
      cat: "Horas Maquina",
      subcat: "Mecanizado Taller",
      descCustom: "Operaci\xF3n Mandrinadora CNC Horas Mecanizado",
      cant: 0.5,
      umCustom: "HORAS (30 min)",
      pUnitCustom: 160,
      totalCustom: 80.81,
      motivo: "Mecanizado de bocinas eje principal",
      solicitante: "Javier Narv\xE1ez"
    },
    {
      fecha: "2026-08-30",
      sem: 34,
      cta: "TTE-C-0654",
      nro: "SRV-2026-00123",
      cat: "Servicios",
      subcat: "Supervisi\xF3n e Inspecci\xF3n T\xE9cnica",
      descCustom: "Servicio de Supervisi\xF3n T\xE9cnica e Inspecci\xF3n Residente de Obra",
      cant: 1,
      umCustom: "SEMANA",
      pUnitCustom: 63,
      totalCustom: 63,
      motivo: "Control QA/QC e inspecci\xF3n en campo",
      solicitante: "Gerencia de Operaciones"
    },
    { fecha: "2026-08-01", sem: 31, cta: "TTE-C-0706", matIdx: 0, cant: 3, cat: "Materiales Directos", nro: "SIP-DESP-88910", subcat: "Perfiles / Estructura", motivo: "Montaje de estructura base", solicitante: "Almac\xE9n Central SIP" },
    { fecha: "2026-08-02", sem: 31, cta: "TTE-C-0671", indIdx: 0, cant: 2, cat: "Costos Indirectos", nro: "SIP-CONS-88914", subcat: "Consumibles Taller", motivo: "Corte y biselado de piezas", solicitante: "Taller TIMACA" },
    { fecha: "2026-08-03", sem: 31, cta: "TTE-C-0668", matIdx: 1, cant: 12, cat: "Materiales Directos", nro: "SIP-DESP-88921", subcat: "Chapas / Planchas", motivo: "Revestimiento tolvas", solicitante: "Almac\xE9n Central SIP" },
    { fecha: "2026-08-04", sem: 31, cta: "TTE-C-0656", srvIdx: 0, cant: 1, cat: "Servicios", nro: "SIP-SERV-88928", subcat: "Transporte / Flete", motivo: "Flete de suministros a obra", solicitante: "Log\xEDstica TIMACA" },
    { fecha: "2026-08-05", sem: 31, cta: "TTE-C-0653", matIdx: 3, cant: 2, cat: "Materiales Directos", nro: "SIP-DESP-88935", subcat: "Repuestos Mec\xE1nicos", motivo: "Repotenciaci\xF3n eje cangilones", solicitante: "Mantenimiento Mec\xE1nico" },
    { fecha: "2026-08-06", sem: 31, cta: "TTE-C-0680", indIdx: 1, cant: 4, cat: "Costos Indirectos", nro: "SIP-CONS-88942", subcat: "Gases Industriales", motivo: "Soldadura TIG tuber\xEDas", solicitante: "Seguridad Industrial" },
    { fecha: "2026-08-07", sem: 31, cta: "TTE-C-0706", matIdx: 4, cant: 10, cat: "Materiales Directos", nro: "SIP-DESP-88950", subcat: "Pernos / Fijaciones", motivo: "Fijaci\xF3n de soportes L\xEDnea 1", solicitante: "Carlos Giraldo" },
    { fecha: "2026-08-25", sem: 34, cta: "TTE-C-0706", srvIdx: 0, cant: 1, cat: "Servicios", nro: "SIP-VAL-89019", subcat: "Transporte / Flete", motivo: "Movilizaci\xF3n gr\xFAas pesadas", solicitante: "Gerencia Operaciones" },
    { fecha: "2026-08-26", sem: 34, cta: "TTE-C-0668", indIdx: 0, cant: 3, cat: "Costos Indirectos", nro: "SIP-CONS-89027", subcat: "Consumibles Taller", motivo: "Discos y pulido estructural", solicitante: "Javier Narv\xE1ez" },
    { fecha: "2026-08-27", sem: 34, cta: "TTE-C-0656", matIdx: 3, cant: 2, cat: "Materiales Directos", nro: "SIP-DESP-89035", subcat: "Repuestos Mec\xE1nicos", motivo: "Cambio de rodamiento motriz", solicitante: "Jes\xFAs Valdez" },
    { fecha: "2026-08-28", sem: 34, cta: "TTE-C-0706", matIdx: 0, cant: 4, cat: "Materiales Directos", nro: "SIP-DESP-89041", subcat: "Perfiles / Estructura", motivo: "Refuerzo de vigas carril", solicitante: "Carlos Giraldo" },
    { fecha: "2026-08-28", sem: 34, cta: "TTE-C-0671", matIdx: 1, cant: 25, cat: "Materiales Directos", nro: "SIP-DESP-89038", subcat: "Chapas / Planchas", motivo: "Suministro planchas antidesgaste", solicitante: "Nelson Gu\xE9dez" }
  ];
  const sipPorCtaCat = {};
  RECIENTES_SIP.forEach((rec) => {
    const pryInfo = CUENTAS_AUXILIARES_EXACTAS_AGOSTO_2026.find((p) => p.cuentaAuxiliar === rec.cta);
    let itemDesc = rec.descCustom || "";
    let um = rec.umCustom || "und";
    let pUnit = rec.pUnitCustom || 100;
    let resp = rec.solicitante || "Almac\xE9n Central SIP";
    if (!rec.descCustom) {
      if (rec.matIdx !== void 0) {
        const itm = CATALOGO_SIP_MATERIALES[rec.matIdx];
        itemDesc = itm.desc;
        um = itm.um;
        pUnit = itm.pUnit;
        resp = itm.resp;
      } else if (rec.srvIdx !== void 0) {
        const itm = CATALOGO_SERVICIOS[rec.srvIdx];
        itemDesc = itm.desc;
        um = itm.um;
        pUnit = itm.pUnit;
        resp = itm.resp;
      } else if (rec.indIdx !== void 0) {
        const itm = CATALOGO_INDIRECTOS[rec.indIdx];
        itemDesc = itm.desc;
        um = itm.um;
        pUnit = itm.pUnit;
        resp = itm.resp;
      }
    }
    const total = rec.totalCustom !== void 0 ? rec.totalCustom : Math.round(rec.cant * pUnit * 100) / 100;
    const key = `${rec.cta}|${rec.cat}`;
    sipPorCtaCat[key] = (sipPorCtaCat[key] || 0) + total;
    salidas.push({
      id: `salida-sip-${idCounter++}`,
      codigoSalida: rec.nro,
      fecha: rec.fecha,
      semana: rec.sem,
      semanaLabel: `Semana ${rec.sem}`,
      mes: 8,
      mesLabel: "Agosto 2026",
      ano: 2026,
      proyecto: `${pryInfo.cuentaAuxiliar}: ${pryInfo.proyectoCorto}`,
      cuentaAuxiliarCodigo: pryInfo.cuentaAuxiliar,
      cuentaAuxiliarNombre: pryInfo.proyecto,
      centroCosto: pryInfo.cuentaAuxiliar,
      categoria: rec.cat,
      tipo: rec.cat,
      subcategoria: rec.subcat || "General",
      itemDescripcion: itemDesc,
      proveedorODestino: `${pryInfo.proyectoCorto} - Cliente`,
      cantidad: rec.cant,
      unidadMedida: um,
      montoUnitario: pUnit,
      montoTotal: total,
      moneda: "USD",
      responsable: resp,
      solicitante: rec.solicitante || resp,
      motivo: rec.motivo || `Vale de almac\xE9n ${rec.nro}`,
      esProyectoExterno: pryInfo.cuentaAuxiliar.startsWith("TTE-C-"),
      estado: "Procesado",
      observaciones: rec.motivo || `Comprobante de Salida Almac\xE9n SIP ${rec.nro}`
    });
  });
  CUENTAS_AUXILIARES_EXACTAS_AGOSTO_2026.forEach((p, pIdx) => {
    const pesoPry = p.porcentaje / 100;
    const matBudget = Math.round(506689 * pesoPry * 100) / 100;
    const yaSipMat = sipPorCtaCat[`${p.cuentaAuxiliar}|Materiales Directos`] || 0;
    const totalMatPry = Math.max(0, Math.round((matBudget - yaSipMat) * 100) / 100);
    if (totalMatPry > 0) {
      const lineasMat = pIdx < 5 ? 4 : 2;
      let acumulado = 0;
      for (let i = 0; i < lineasMat; i++) {
        const matItm = CATALOGO_SIP_MATERIALES[(pIdx + i) % CATALOGO_SIP_MATERIALES.length];
        const montoLinea = i === lineasMat - 1 ? Math.round((totalMatPry - acumulado) * 100) / 100 : Math.round(totalMatPry / lineasMat * 100) / 100;
        acumulado += montoLinea;
        if (montoLinea > 0) {
          const diaNum = 1 + (pIdx * 3 + i * 7) % 31;
          const dia = String(diaNum).padStart(2, "0");
          const sem = diaNum <= 9 ? 31 : diaNum <= 16 ? 32 : diaNum <= 23 ? 33 : 34;
          salidas.push({
            id: `salida-mat-${idCounter++}`,
            codigoSalida: `SIP-DESP-${89e3 - idCounter}`,
            fecha: `2026-08-${dia}`,
            semana: sem,
            semanaLabel: `Semana ${sem}`,
            mes: 8,
            mesLabel: "Agosto 2026",
            ano: 2026,
            proyecto: `${p.cuentaAuxiliar}: ${p.proyectoCorto}`,
            cuentaAuxiliarCodigo: p.cuentaAuxiliar,
            cuentaAuxiliarNombre: p.proyecto,
            centroCosto: p.cuentaAuxiliar,
            categoria: "Materiales Directos",
            itemDescripcion: `${matItm.desc} (${p.proyectoCorto})`,
            proveedorODestino: `${p.proyectoCorto} / Taller TIMACA`,
            cantidad: Math.max(1, Math.round(montoLinea / matItm.pUnit)),
            unidadMedida: matItm.um,
            montoUnitario: matItm.pUnit,
            montoTotal: montoLinea,
            moneda: "USD",
            responsable: matItm.resp,
            estado: "Procesado",
            observaciones: `Vale de Almac\xE9n SIP para ${p.proyectoCorto}`
          });
        }
      }
    }
    const srvBudget = Math.round(117970 * pesoPry * 100) / 100;
    const yaSipSrv = sipPorCtaCat[`${p.cuentaAuxiliar}|Servicios`] || 0;
    const totalSrvPry = Math.max(0, Math.round((srvBudget - yaSipSrv) * 100) / 100);
    if (totalSrvPry > 0 && p.cuentaAuxiliar !== "TTE-C-0654") {
      const srvItm = CATALOGO_SERVICIOS[pIdx % CATALOGO_SERVICIOS.length];
      const diaNum = 1 + pIdx * 4 % 30;
      const dia = String(diaNum).padStart(2, "0");
      const sem = diaNum <= 9 ? 31 : diaNum <= 16 ? 32 : diaNum <= 23 ? 33 : 34;
      salidas.push({
        id: `salida-srv-${idCounter++}`,
        codigoSalida: `SRV-2026-${String(idCounter).padStart(5, "0")}`,
        fecha: `2026-08-${dia}`,
        semana: sem,
        semanaLabel: `Semana ${sem}`,
        mes: 8,
        mesLabel: "Agosto 2026",
        ano: 2026,
        proyecto: `${p.cuentaAuxiliar}: ${p.proyectoCorto}`,
        cuentaAuxiliarCodigo: p.cuentaAuxiliar,
        cuentaAuxiliarNombre: p.proyecto,
        centroCosto: p.cuentaAuxiliar,
        categoria: "Servicios",
        tipo: "Servicios",
        subcategoria: srvItm.subcat || "Supervisi\xF3n e Inspecci\xF3n T\xE9cnica",
        itemDescripcion: `${srvItm.desc} - ${p.proyectoCorto}`,
        proveedorODestino: "Subcontratista Autorizado / TIMACA QA/QC",
        cantidad: 1,
        unidadMedida: srvItm.um,
        montoUnitario: totalSrvPry,
        montoTotal: totalSrvPry,
        moneda: "USD",
        responsable: srvItm.resp,
        estado: "Verificado",
        observaciones: `Servicio especializado para ${p.proyectoCorto}`
      });
    }
    const hmBudget = Math.round(89789 * pesoPry * 100) / 100;
    const yaSipHm = sipPorCtaCat[`${p.cuentaAuxiliar}|Horas Maquina`] || 0;
    const totalHmPry = Math.max(0, Math.round((hmBudget - yaSipHm) * 100) / 100);
    if (totalHmPry > 0) {
      const hmItm = CATALOGO_HORAS_MAQUINA[pIdx % CATALOGO_HORAS_MAQUINA.length];
      const diaNum = 1 + (pIdx * 2 + 1) % 30;
      const dia = String(diaNum).padStart(2, "0");
      const sem = diaNum <= 9 ? 31 : diaNum <= 16 ? 32 : diaNum <= 23 ? 33 : 34;
      salidas.push({
        id: `salida-hm-${idCounter++}`,
        codigoSalida: `HM-2026-${String(idCounter).padStart(5, "0")}`,
        fecha: `2026-08-${dia}`,
        semana: sem,
        semanaLabel: `Semana ${sem}`,
        mes: 8,
        mesLabel: "Agosto 2026",
        ano: 2026,
        proyecto: `${p.cuentaAuxiliar}: ${p.proyectoCorto}`,
        cuentaAuxiliarCodigo: p.cuentaAuxiliar,
        cuentaAuxiliarNombre: p.proyecto,
        centroCosto: p.cuentaAuxiliar,
        categoria: "Horas Maquina",
        tipo: "Horas Maquina",
        subcategoria: "Mecanizado Taller",
        itemDescripcion: `${hmItm.desc} (${p.proyectoCorto})`,
        proveedorODestino: "Taller de Mecanizado Pesado TIMACA",
        cantidad: Math.max(1, Math.round(totalHmPry / hmItm.pUnit)),
        unidadMedida: hmItm.um,
        montoUnitario: hmItm.pUnit,
        montoTotal: totalHmPry,
        moneda: "USD",
        responsable: hmItm.resp,
        estado: "Procesado",
        observaciones: `Reporte de Horas M\xE1quina Taller Central`
      });
    }
    const indBudget = Math.round(228114 * pesoPry * 100) / 100;
    const yaSipInd = sipPorCtaCat[`${p.cuentaAuxiliar}|Costos Indirectos`] || 0;
    const totalIndPry = Math.max(0, Math.round((indBudget - yaSipInd) * 100) / 100);
    if (totalIndPry > 0) {
      const diaNum = 1 + (pIdx * 3 + 2) % 30;
      const dia = String(diaNum).padStart(2, "0");
      const sem = diaNum <= 9 ? 31 : diaNum <= 16 ? 32 : diaNum <= 23 ? 33 : 34;
      if (p.cuentaAuxiliar === "TTE-C-0706" && totalIndPry > 45270) {
        salidas.push({
          id: `salida-ind-${idCounter++}`,
          codigoSalida: `IND-2026-HON-0706`,
          fecha: `2026-08-15`,
          semana: 32,
          semanaLabel: `Semana 32`,
          mes: 8,
          mesLabel: "Agosto 2026",
          ano: 2026,
          proyecto: `${p.cuentaAuxiliar}: ${p.proyectoCorto}`,
          cuentaAuxiliarCodigo: p.cuentaAuxiliar,
          cuentaAuxiliarNombre: p.proyecto,
          centroCosto: p.cuentaAuxiliar,
          categoria: "Costos Indirectos",
          tipo: "Costos Indirectos",
          subcategoria: "Honorarios Profesionales Staff T\xE9cnico",
          itemDescripcion: `Honorarios Profesionales - Staff T\xE9cnico Residencia de Obra (L\xEDnea 1 Pellas)`,
          proveedorODestino: "Staff T\xE9cnico de Ingenier\xEDa y Supervisi\xF3n TIMACA",
          cantidad: 1,
          unidadMedida: "mes",
          montoUnitario: 45270,
          montoTotal: 45270,
          moneda: "USD",
          responsable: "Gerencia de Control de Gesti\xF3n / Administraci\xF3n Obra",
          solicitante: "Ing. Residente Pellas",
          motivo: "Honorarios profesionales fijos mensuales del staff t\xE9cnico y supervisores en campo",
          esProyectoExterno: true,
          estado: "Procesado",
          observaciones: "Reestructuraci\xF3n contable sincera de staff t\xE9cnico de obra dentro de indirectos (Diapositiva 9 PPT)"
        });
        const remIndPellas = Math.round((totalIndPry - 45270) * 100) / 100;
        salidas.push({
          id: `salida-ind-${idCounter++}`,
          codigoSalida: `IND-2026-${String(idCounter).padStart(5, "0")}`,
          fecha: `2026-08-30`,
          semana: 34,
          semanaLabel: `Semana 34`,
          mes: 8,
          mesLabel: "Agosto 2026",
          ano: 2026,
          proyecto: `${p.cuentaAuxiliar}: ${p.proyectoCorto}`,
          cuentaAuxiliarCodigo: p.cuentaAuxiliar,
          cuentaAuxiliarNombre: p.proyecto,
          centroCosto: p.cuentaAuxiliar,
          categoria: "Costos Indirectos",
          tipo: "Costos Indirectos",
          subcategoria: "Prorrateo Costos Indirectos Operativos",
          itemDescripcion: `Prorrateo de Costos Indirectos Operativos (Base MOD 60.2%) - ${p.proyectoCorto}`,
          proveedorODestino: "Bolsa Corporativa de Costos Indirectos TIMACA",
          cantidad: 1,
          unidadMedida: "cuota",
          montoUnitario: remIndPellas,
          montoTotal: remIndPellas,
          moneda: "USD",
          responsable: "Control de Gesti\xF3n & Contabilidad",
          solicitante: "Departamento de Costos",
          motivo: "Asignaci\xF3n mensual de soporte operativo y administrativo seg\xFAn coeficiente de Mano de Obra Directa",
          esProyectoExterno: true,
          estado: "Procesado",
          observaciones: "Prorrateo oficial seg\xFAn metodolog\xEDa del Modelo Estrella TIMACA"
        });
      } else {
        salidas.push({
          id: `salida-ind-${idCounter++}`,
          codigoSalida: `IND-2026-${String(idCounter).padStart(5, "0")}`,
          fecha: `2026-08-${dia}`,
          semana: sem,
          semanaLabel: `Semana ${sem}`,
          mes: 8,
          mesLabel: "Agosto 2026",
          ano: 2026,
          proyecto: `${p.cuentaAuxiliar}: ${p.proyectoCorto}`,
          cuentaAuxiliarCodigo: p.cuentaAuxiliar,
          cuentaAuxiliarNombre: p.proyecto,
          centroCosto: p.cuentaAuxiliar,
          categoria: "Costos Indirectos",
          tipo: "Costos Indirectos",
          subcategoria: "Prorrateo Costos Indirectos Operativos",
          itemDescripcion: `Prorrateo de Costos Indirectos Operativos (Base MOD) - ${p.proyectoCorto}`,
          proveedorODestino: "Bolsa Corporativa de Costos Indirectos TIMACA",
          cantidad: 1,
          unidadMedida: "cuota",
          montoUnitario: totalIndPry,
          montoTotal: totalIndPry,
          moneda: "USD",
          responsable: "Control de Gesti\xF3n & Contabilidad",
          solicitante: "Departamento de Costos",
          motivo: `Asignaci\xF3n mensual de soporte operativo y planta proporcional a la Mano de Obra Directa (${p.proyectoCorto})`,
          esProyectoExterno: true,
          estado: "Procesado",
          observaciones: "Imputaci\xF3n mensual de costos indirectos seg\xFAn coeficiente MOD (Diapositiva 10 PPT)"
        });
      }
    }
  });
  DETALLE_NOMINA_AGOSTO_2026.forEach((row) => {
    const pryMatch = CUENTAS_AUXILIARES_EXACTAS_AGOSTO_2026.find((p) => p.cuentaAuxiliar === row.cuentaAuxiliar);
    const pCorto = pryMatch ? pryMatch.proyectoCorto : row.proyecto;
    const semanasData = [
      { sem: 31, monto: row.sem31, fecha: "2026-08-01", label: "Semana 31 (01-09 Ago)" },
      { sem: 32, monto: row.sem32, fecha: "2026-08-10", label: "Semana 32 (10-16 Ago)" },
      { sem: 33, monto: row.sem33, fecha: "2026-08-17", label: "Semana 33 (17-23 Ago)" },
      { sem: 34, monto: row.sem34, fecha: "2026-08-24", label: "Semana 34 (24-31 Ago)" }
    ];
    semanasData.forEach((sObj) => {
      if (sObj.monto <= 0) return;
      salidas.push({
        id: `salida-mod-${idCounter++}`,
        codigoSalida: `NOM-2026-S${sObj.sem}-${String(idCounter).padStart(4, "0")}`,
        fecha: sObj.fecha,
        semana: sObj.sem,
        semanaLabel: sObj.label,
        mes: 8,
        mesLabel: "Agosto 2026",
        ano: 2026,
        proyecto: `${row.cuentaAuxiliar}: ${pCorto}`,
        cuentaAuxiliarCodigo: row.cuentaAuxiliar,
        cuentaAuxiliarNombre: row.proyecto,
        centroCosto: row.cuentaAuxiliar,
        categoria: "Mano de Obra Directa",
        itemDescripcion: `N\xF3mina ${sObj.label} (${row.sourceFile}) - ${pCorto}`,
        proveedorODestino: "Personal de Planta y Cuadrillas TIMACA",
        cantidad: 1,
        unidadMedida: "n\xF3mina",
        montoUnitario: sObj.monto,
        montoTotal: sObj.monto,
        moneda: "USD",
        responsable: "Recursos Humanos / N\xF3mina Planta",
        estado: "Procesado",
        observaciones: `Input RRHH: ${row.sourceFile}`
      });
    });
  });
  const mesesHistoricos = [
    { mes: 1, label: "Enero 2026", mm: "01", semanas: [1, 2, 3, 4], peso: 1416537 / 10123029 },
    { mes: 2, label: "Febrero 2026", mm: "02", semanas: [5, 6, 7, 8], peso: 1449819 / 10123029 },
    { mes: 3, label: "Marzo 2026", mm: "03", semanas: [9, 10, 11, 12, 13], peso: 1559195 / 10123029 },
    { mes: 4, label: "Abril 2026", mm: "04", semanas: [14, 15, 16, 17], peso: 947564 / 10123029 },
    { mes: 5, label: "Mayo 2026", mm: "05", semanas: [18, 19, 20, 21], peso: 974974 / 10123029 },
    { mes: 6, label: "Junio 2026", mm: "06", semanas: [22, 23, 24, 25, 26], peso: 2581853 / 10123029 },
    { mes: 7, label: "Julio 2026", mm: "07", semanas: [27, 28, 29, 30], peso: 1193087 / 10123029 }
  ];
  const TTE_REMANENTE_ENE_JUL = {
    "Materiales Directos": 319860 - 192867,
    // 126.993
    "Servicios": 226634 - 63106,
    // 163.528
    "Mano de Obra Directa": 46e4 - 133185,
    // 326.815
    "Horas Maquina": 259e3 - 25565,
    // 233.435
    "Costos Indirectos": 497236 - 101621
    // 395.615
  };
  const pryTTE = PROYECTOS_CATEGORIAS_AGOSTO_2026.find((p) => p.cuentaAuxiliar === "TTE-C-0706");
  const otrosPrys = PROYECTOS_CATEGORIAS_AGOSTO_2026.filter((p) => p.cuentaAuxiliar !== "TTE-C-0706");
  const RATIO_HISTORICO_OTROS = (9524214 - 647571) / 647571;
  const tteAcumulados = {
    "Materiales Directos": 0,
    "Servicios": 0,
    "Mano de Obra Directa": 0,
    "Horas Maquina": 0,
    "Costos Indirectos": 0
  };
  mesesHistoricos.forEach((mHist, mIdx) => {
    const esUltimoMesHist = mIdx === mesesHistoricos.length - 1;
    TABLA_PPT_DISTRIBUCION_2026.forEach((catObj, catIdx) => {
      const montoTotalMesCat = catObj.meses[mHist.mes - 1];
      const remCat = TTE_REMANENTE_ENE_JUL[catObj.categoria] || 0;
      let montoTTE = 0;
      if (mHist.mes >= 4) {
        const totalCatActivosTTE = catObj.meses[3] + catObj.meses[4] + catObj.meses[5] + catObj.meses[6];
        const pesoMesRelativo = (catObj.meses[mHist.mes - 1] || 1) / totalCatActivosTTE;
        montoTTE = esUltimoMesHist ? Math.round((remCat - tteAcumulados[catObj.categoria]) * 100) / 100 : Math.round(remCat * pesoMesRelativo * 100) / 100;
        tteAcumulados[catObj.categoria] += montoTTE;
      }
      if (montoTTE > 0) {
        const semTTE = mHist.semanas[catIdx % mHist.semanas.length];
        const diaTTE = String(10 + catIdx * 3 % 18).padStart(2, "0");
        const subcatMat = CATEGORIAS_MATERIALES_EXCEL_OFICIAL[catIdx % CATEGORIAS_MATERIALES_EXCEL_OFICIAL.length];
        salidas.push({
          id: `salida-hist-tte-${mHist.mes}-${catIdx}`,
          codigoSalida: `SAL-2026-TTE-M0${mHist.mes}-C${catIdx}`,
          fecha: `2026-${mHist.mm}-${diaTTE}`,
          semana: semTTE,
          semanaLabel: `Semana ${String(semTTE).padStart(2, "0")}`,
          mes: mHist.mes,
          mesLabel: mHist.label,
          ano: 2026,
          proyecto: `${pryTTE.cuentaAuxiliar}: ${pryTTE.proyectoCorto}`,
          cuentaAuxiliarCodigo: pryTTE.cuentaAuxiliar,
          cuentaAuxiliarNombre: pryTTE.proyecto,
          centroCosto: pryTTE.cuentaAuxiliar,
          categoria: catObj.categoria,
          tipo: catObj.categoria,
          subcategoria: catObj.categoria === "Materiales Directos" ? subcatMat : "General",
          itemDescripcion: `${catObj.categoria} (${catObj.categoria === "Materiales Directos" ? subcatMat : "Servicio Operativo"}) - ${pryTTE.proyectoCorto}`,
          proveedorODestino: "TIMACA / Cliente Pellas",
          cantidad: 1,
          unidadMedida: "lote",
          montoUnitario: montoTTE,
          montoTotal: montoTTE,
          moneda: "USD",
          responsable: "Almac\xE9n Central SIP / Operaciones",
          solicitante: "Carlos Giraldo",
          motivo: `Ejecuci\xF3n operativa en obra ${mHist.label} (L\xEDnea 1 Pellas)`,
          esProyectoExterno: true,
          estado: "Procesado",
          observaciones: `Ejecuci\xF3n operativa en obra ${mHist.label} (L\xEDnea 1 Pellas)`
        });
      }
      let sumaOtrosProyectosMes = 0;
      otrosPrys.forEach((p, pIdx) => {
        let baseCatAgo = 0;
        if (catObj.categoria === "Materiales Directos") baseCatAgo = p.materiales;
        else if (catObj.categoria === "Servicios") baseCatAgo = p.servicios;
        else if (catObj.categoria === "Mano de Obra Directa") baseCatAgo = p.manoDeObra;
        else if (catObj.categoria === "Horas Maquina") baseCatAgo = p.horasMaquina;
        else baseCatAgo = p.indirectos;
        const subtotalOtro = Math.round(baseCatAgo * RATIO_HISTORICO_OTROS * mHist.peso * 100) / 100;
        if (subtotalOtro <= 0) return;
        sumaOtrosProyectosMes += subtotalOtro;
        const semElegida = mHist.semanas[(pIdx + catIdx) % mHist.semanas.length];
        const dia = String(Math.min((pIdx + 1) * 2, 28)).padStart(2, "0");
        const fechaStr = `2026-${mHist.mm}-${dia}`;
        salidas.push({
          id: `salida-hist-${idCounter++}`,
          codigoSalida: `SAL-2026-${String(idCounter).padStart(5, "0")}`,
          fecha: fechaStr,
          semana: semElegida,
          semanaLabel: `Semana ${String(semElegida).padStart(2, "0")}`,
          mes: mHist.mes,
          mesLabel: mHist.label,
          ano: 2026,
          proyecto: `${p.cuentaAuxiliar}: ${p.proyectoCorto}`,
          cuentaAuxiliarCodigo: p.cuentaAuxiliar,
          cuentaAuxiliarNombre: p.proyecto,
          centroCosto: p.cuentaAuxiliar,
          categoria: catObj.categoria,
          tipo: catObj.categoria,
          subcategoria: "General Operativo",
          itemDescripcion: `${catObj.categoria} - ${p.proyectoCorto}`,
          proveedorODestino: "TIMACA / Cliente",
          cantidad: 1,
          unidadMedida: "lote",
          montoUnitario: subtotalOtro,
          montoTotal: subtotalOtro,
          moneda: "USD",
          responsable: "Almac\xE9n Central SIP / Operaciones",
          solicitante: "Residencia de Obra",
          motivo: `Cierre contable ${mHist.label} (${p.proyectoCorto})`,
          esProyectoExterno: true,
          estado: "Procesado",
          observaciones: `Cierre contable ${mHist.label}`
        });
      });
      const remanenteOperativoPlanta = Math.max(0, Math.round((montoTotalMesCat - montoTTE - sumaOtrosProyectosMes) * 100) / 100);
      if (remanenteOperativoPlanta > 0) {
        const semOpe = mHist.semanas[catIdx % mHist.semanas.length];
        const diaOpe = String(15 + catIdx * 2 % 12).padStart(2, "0");
        salidas.push({
          id: `salida-hist-ope-${mHist.mes}-${catIdx}`,
          codigoSalida: `SAL-2026-OPE-M0${mHist.mes}-C${catIdx}`,
          fecha: `2026-${mHist.mm}-${diaOpe}`,
          semana: semOpe,
          semanaLabel: `Semana ${String(semOpe).padStart(2, "0")}`,
          mes: mHist.mes,
          mesLabel: mHist.label,
          ano: 2026,
          proyecto: "Operaciones Planta & Taller Central TIMACA",
          cuentaAuxiliarCodigo: "TIM-OPE-0001",
          cuentaAuxiliarNombre: "Operaciones Generales & Mantenimiento Planta TIMACA",
          centroCosto: "Taller Central & Operaciones Planta",
          categoria: catObj.categoria,
          tipo: catObj.categoria,
          subcategoria: "Operaciones Planta",
          itemDescripcion: `${catObj.categoria} - Operaciones y Taller Central TIMACA`,
          proveedorODestino: "TIMACA Planta Matriz",
          cantidad: 1,
          unidadMedida: "lote",
          montoUnitario: remanenteOperativoPlanta,
          montoTotal: remanenteOperativoPlanta,
          moneda: "USD",
          responsable: "Gerencia de Operaciones TIMACA",
          solicitante: "Gerencia General",
          motivo: `Gastos operativos de infraestructura y taller central (${mHist.label})`,
          esProyectoExterno: false,
          estado: "Procesado",
          observaciones: `Gastos operativos centrales ${mHist.label}`
        });
      }
    });
  });
  const TARGETS_OFICIALES_TTE = {
    "Materiales Directos": 319860,
    "Servicios": 226634,
    "Mano de Obra Directa": 46e4,
    "Horas Maquina": 259e3,
    "Costos Indirectos": 497236
  };
  Object.entries(TARGETS_OFICIALES_TTE).forEach(([cat, targetVal]) => {
    const lineas = salidas.filter((s) => s.cuentaAuxiliarCodigo === "TTE-C-0706" && s.categoria === cat);
    if (lineas.length > 0) {
      const actualSum = lineas.reduce((acc, s) => acc + s.montoTotal, 0);
      const diff = Math.round((targetVal - actualSum) * 100) / 100;
      if (Math.abs(diff) > 1e-3) {
        const targetLine = lineas[lineas.length - 1];
        targetLine.montoTotal = Math.round((targetLine.montoTotal + diff) * 100) / 100;
        targetLine.montoUnitario = targetLine.montoTotal;
      }
    }
  });
  salidas.forEach((s) => {
    if (s.cuentaAuxiliarCodigo && s.cuentaAuxiliarCodigo.startsWith("TTE-C-")) {
      const matchPry = CUENTAS_AUXILIARES_EXACTAS_AGOSTO_2026.find((p) => p.cuentaAuxiliar === s.cuentaAuxiliarCodigo);
      const nombreLimpio = matchPry ? matchPry.proyectoCorto : s.proyecto.replace(/^[A-Z0-9-]+:\s*/, "");
      s.proyecto = `${s.cuentaAuxiliarCodigo}: ${nombreLimpio}`;
      s.esProyectoExterno = true;
    }
    const descLower = (s.itemDescripcion || "").toLowerCase();
    if (descLower.includes("supervisi\xF3n") || descLower.includes("inspecci\xF3n") || descLower.includes("residente de obra")) {
      s.categoria = "Servicios";
      s.tipo = "Servicios";
      s.subcategoria = "Supervisi\xF3n e Inspecci\xF3n T\xE9cnica";
    } else if (descLower.includes("recarga") && descLower.includes("gas")) {
      s.categoria = "Servicios";
      s.tipo = "Servicios";
      s.subcategoria = "Gases Industriales / Recargas";
    }
    if (!s.tipo) s.tipo = s.categoria;
    if (!s.subcategoria) {
      if (s.categoria === "Materiales Directos") s.subcategoria = "Perfiles / Estructura";
      else if (s.categoria === "Servicios") {
        if (descLower.includes("transporte") || descLower.includes("lowboy") || descLower.includes("flete")) {
          s.subcategoria = "Transporte / Flete";
        } else if (descLower.includes("ensayo") || descLower.includes("radiograf") || descLower.includes("gammagraf")) {
          s.subcategoria = "Ensayos No Destructivos (END)";
        } else {
          s.subcategoria = "Supervisi\xF3n e Inspecci\xF3n T\xE9cnica";
        }
      } else if (s.categoria === "Mano de Obra Directa") s.subcategoria = "N\xF3mina Cuadrillas";
      else if (s.categoria === "Horas Maquina") s.subcategoria = "Mecanizado Taller";
      else {
        if (descLower.includes("epp") || descLower.includes("seguridad") || descLower.includes("careta")) {
          s.subcategoria = "Seguridad Industrial (SIAHO)";
        } else if (descLower.includes("campamento") || descLower.includes("facilidades") || descLower.includes("log\xEDstica")) {
          s.subcategoria = "Facilidades de Obra";
        } else {
          s.subcategoria = "Consumibles de Taller";
        }
      }
    }
    if (!s.solicitante) s.solicitante = s.responsable || "Almac\xE9n Central SIP";
    if (!s.motivo) s.motivo = s.observaciones || `Despacho operativo para ${s.proyecto}`;
    if (s.esProyectoExterno === void 0) {
      s.esProyectoExterno = s.cuentaAuxiliarCodigo.startsWith("TTE-C-");
    }
  });
  return salidas;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CATEGORIAS_DEFAULT,
  CATEGORIAS_MATERIALES_EXCEL_OFICIAL,
  CATEGORIAS_PPT_2026,
  CUENTAS_AUXILIARES_DEFAULT,
  CUENTAS_AUXILIARES_EXACTAS_AGOSTO_2026,
  CUENTAS_CORTAS_MAP,
  DETALLE_NOMINA_AGOSTO_2026,
  DETALLE_SUBCONCEPTOS_CATEGORIAS,
  OFICIAL_MOD_CUENTAS_AGOSTO_2026,
  PROYECTOS_DEFAULT,
  PROYECTOS_EXTERNOS_TIMACA,
  TABLA_PPT_DISTRIBUCION_2026,
  TOTALES_MESES_PPT,
  TOTALES_NOMINA_SEMANAL_AGOSTO,
  generateInitialMockCostos
});
