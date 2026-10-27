const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

console.log('=== APLICANDO CORRECCION OFICIAL DE COSTOS INDIRECTOS (OCT 15 2026) ===\n');

// 1. UPDATE mockDesgloseCategorias.ts
const mdcPath = 'src/data/mockDesgloseCategorias.ts';
let mdcContent = fs.readFileSync(mdcPath, 'utf8');

// Replacement for COSTOS_INDIRECTOS_POR_CATEGORIAS
const oldCifRubrosRegex = /export const COSTOS_INDIRECTOS_POR_CATEGORIAS: FilaDesgloseMensual\[\] = \[[\s\S]*?\];/;
const newCifRubros = `export const COSTOS_INDIRECTOS_POR_CATEGORIAS: FilaDesgloseMensual[] = [
  { concepto: 'Servicios Publicos', ene: 3389, feb: 3257, mar: 2450, abr: 2611, may: 2491, jun: 2485, jul: 2182, ago: 2393, sep: 2556, total: 23814 },
  { concepto: 'Nomina TIMACA', ene: 88000, feb: 87000, mar: 104000, abr: 95000, may: 153000, jun: 132000, jul: 128000, ago: 128000, sep: 125000, total: 1040000 },
  { concepto: 'Nomina -TALLERES', ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 120000, sep: 122000, total: 242000 },
  { concepto: 'Incentivos Laborales (Bonos)', ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 4000, sep: 6700, total: 10700 },
  { concepto: 'Servicios Telecomunicaciones', ene: 554, feb: 586, mar: 596, abr: 717, may: 589, jun: 614, jul: 570, ago: 598, sep: 570, total: 5394 },
  { concepto: 'Combustible', ene: 22074, feb: 28475, mar: 32224, abr: 7424, may: 6392, jun: 12136, jul: 13959, ago: 24651, sep: 50413, total: 197748 },
  { concepto: 'Sindicato', ene: 57000, feb: 58840, mar: 58314, abr: 77076, may: 64858, jun: 57916, jul: 72018, ago: 49630, sep: 58952, total: 554604 },
  { concepto: 'Vigilancia', ene: 3521, feb: 3521, mar: 3880, abr: 4214, may: 4235, jun: 4803, jul: 4803, ago: 4803, sep: 4803, total: 38583 },
  { concepto: 'Gastos de asociación/Subscripción', ene: 56, feb: 106, mar: 123, abr: 116, may: 56, jun: 86, jul: 55, ago: 116, sep: 56, total: 770 },
  { concepto: 'Gastos de Servicios Bancarios', ene: 35, feb: 42, mar: 120, abr: 36, may: 46, jun: 48, jul: 49, ago: 50, sep: 49, total: 475 },
  { concepto: 'Gastos de Seguro', ene: 0, feb: 95, mar: 0, abr: 165, may: 30, jun: 318, jul: 386, ago: 436, sep: 277, total: 1707 },
  { concepto: 'Honorarios Profesionales', ene: 870, feb: 650, mar: 240, abr: 120, may: 435, jun: 420, jul: 1322, ago: 120, sep: 250, total: 4427 },
  { concepto: 'Gastos Funebres', ene: 0, feb: 0, mar: 0, abr: 2176, may: 0, jun: 0, jul: 0, ago: 0, sep: 0, total: 2176 },
  { concepto: 'Timbres Fiscales / Notarias / Registros', ene: 1219, feb: 500, mar: 70, abr: 1070, may: 890, jun: 726, jul: 1843, ago: 3445, sep: 7634, total: 17397 },
  { concepto: 'Gastos de viajes/viáticos nacionales', ene: 351, feb: 393, mar: 2353, abr: 3964, may: 1940, jun: 1523, jul: 2267, ago: 1259, sep: 4124, total: 18174 },
  { concepto: 'Otros Servicios Contratados de Admón.', ene: 4930, feb: 571, mar: 1523, abr: 2503, may: 2504, jun: 217, jul: 0, ago: 478, sep: 9991, total: 22717 },
];`;

mdcContent = mdcContent.replace(oldCifRubrosRegex, newCifRubros);

// Replacement for COSTOS_INDIRECTOS_CONSOLIDADO_OFICIAL (Agosto total = 339.978, Sept total = 393.375)
const oldProrrateoRegex = /export const COSTOS_INDIRECTOS_CONSOLIDADO_OFICIAL: FilaDesgloseMensual\[\] = \[[\s\S]*?\];/;
const newProrrateo = `export const COSTOS_INDIRECTOS_CONSOLIDADO_OFICIAL: FilaDesgloseMensual[] = [
  { ctaAuxiliar: 'TTE-C-0706', concepto: 'TTE-C-0706 · Línea 1 Pellas (Recuperación Línea 1 Planta de Pellas)', porcentaje: 38.30, ene: 0, feb: 0, mar: 0, abr: 0, may: 116389, jun: 135147, jul: 107485, ago: 204561, sep: 236688, total: 800270 },
  { ctaAuxiliar: 'TTE-C-0676', concepto: 'TTE-C-0676 · 2da Línea Pellas (Segunda Línea Planta de Pellas)', porcentaje: 18.72, ene: 109790, feb: 88858, mar: 85824, abr: 90209, may: 0, jun: 0, jul: 0, ago: 0, sep: 0, total: 374680 },
  { ctaAuxiliar: 'TTE-C-0656', concepto: 'TTE-C-0656 · Bandas Transp. PMH (Rehabilitación de Bandas Transportadoras PMH)', porcentaje: 12.67, ene: 21121, feb: 25237, mar: 34806, abr: 27397, may: 18767, jun: 14129, jul: 26055, ago: 43223, sep: 50012, total: 260747 },
  { ctaAuxiliar: 'TTE-C-0668', concepto: 'TTE-C-0668 · Briquetas Fase 2 (Fase 2 Planta de Briquetas - FMO)', porcentaje: 8.10, ene: 13655, feb: 12675, mar: 17862, abr: 26676, may: 14875, jun: 11458, jul: 18280, ago: 23378, sep: 27050, total: 165909 },
  { ctaAuxiliar: 'TTE-C-0680', concepto: 'TTE-C-0680 · Mantenimiento BG II (Servicio de Mantenimiento de BG II)', porcentaje: 4.83, ene: 8561, feb: 6641, mar: 11610, abr: 7982, may: 15560, jun: 8250, jul: 9550, ago: 14295, sep: 16539, total: 98988 },
  { ctaAuxiliar: 'TTE-C-0678', concepto: 'TTE-C-0678 · Pila HA y HB PMH (Proyecto Pila HA y HB Suministro e Instalación)', porcentaje: 4.08, ene: 583, feb: 2987, mar: 9791, abr: 9479, may: 4722, jun: 14879, jul: 10244, ago: 14516, sep: 16796, total: 84997 },
  { ctaAuxiliar: 'TTE-C-0671', concepto: 'TTE-C-0671 · 2da Línea PMH (Segunda Línea PMH - Ingeniería y Suministro)', porcentaje: 3.74, ene: 0, feb: 0, mar: 0, abr: 198, may: 2407, jun: 10040, jul: 16865, ago: 22759, sep: 26334, total: 78603 },
  { ctaAuxiliar: 'TTE-C-0653', concepto: 'TTE-C-0653 · Rueda Cangilones PMH (Repotenciación Rueda Cangilones DRAVO)', porcentaje: 2.31, ene: 0, feb: 0, mar: 0, abr: 0, may: 41590, jun: 4734, jul: 0, ago: 0, sep: 0, total: 46324 },
  { ctaAuxiliar: 'TTE-C-0670', concepto: 'TTE-C-0670 · Mtto Briqueteras (Servicio Mtto. Máquinas Briqueteras)', porcentaje: 2.30, ene: 3654, feb: 3690, mar: 4005, abr: 2473, may: 3319, jun: 1646, jul: 6256, ago: 10527, sep: 12181, total: 47941 },
  { ctaAuxiliar: 'TTE-C-0693', concepto: 'TTE-C-0693 · Parada Planta Briquetas (Trabajos para Parada de Planta)', porcentaje: 2.03, ene: 1742, feb: 12953, mar: 24937, abr: 969, may: 0, jun: 0, jul: 0, ago: 0, sep: 0, total: 40601 },
  { ctaAuxiliar: 'TTE-C-0682', concepto: 'TTE-C-0682 · Personal Zona 60 (Suministro de Personal para Zona 60)', porcentaje: 1.41, ene: 4412, feb: 4910, mar: 5041, abr: 3027, may: 6006, jun: 4883, jul: 0, ago: 0, sep: 0, total: 28280 },
  { ctaAuxiliar: 'TTE-C-0669', concepto: 'TTE-C-0669 · Mtto Dravo (Servicio de Mantenimiento de Dravo)', porcentaje: 0.72, ene: 4274, feb: 4816, mar: 5411, abr: 0, may: 0, jun: 0, jul: 0, ago: 0, sep: 0, total: 14500 },
  { ctaAuxiliar: 'TTE-C-0694', concepto: 'TTE-C-0694 · Caldera Briquetas (Suministro e Instalación Caldera Briquetas)', porcentaje: 0.65, ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 0, jul: 5296, ago: 3861, sep: 4468, total: 13625 },
  { ctaAuxiliar: 'TTE-C-0688', concepto: 'TTE-C-0688 · Carga Barcos Wellman (Desmantelamiento Carga Barcos Wellman)', porcentaje: 0.38, ene: 821, feb: 6706, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 0, sep: 0, total: 7527 },
  { ctaAuxiliar: 'TTE-C-0655', concepto: 'TTE-C-0655 · Tolva PMH (Interconexión Sistema Transporte Tolva PMH)', porcentaje: 0.36, ene: 4784, feb: 956, mar: 0, abr: 0, may: 0, jun: 0, jul: 150, ago: 691, sep: 799, total: 7380 },
  { ctaAuxiliar: 'TTE-C-0684', concepto: 'TTE-C-0684 · Gamelas FMO-PMH (Fabricación de Gamelas FMO-PMH)', porcentaje: 0.26, ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 0, jul: 965, ago: 2167, sep: 2508, total: 5640 },
  { ctaAuxiliar: 'TTE-C-0654', concepto: 'TTE-C-0654 · Cinta JD-9021 (Proyecto 5B: Cinta JD-9021)', porcentaje: 0.15, ene: 0, feb: 3049, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 0, sep: 0, total: 3049 },
  { ctaAuxiliar: 'TTE-C-0711', concepto: 'TTE-C-0711 · Módulos Eléctricos TH4 (Retirada Módulos Eléctricos TH4 PMH)', porcentaje: 0.08, ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 1589, jul: 0, ago: 0, sep: 0, total: 1589 },
];`;

mdcContent = mdcContent.replace(oldProrrateoRegex, newProrrateo);
fs.writeFileSync(mdcPath, mdcContent, 'utf8');
console.log('1. mockDesgloseCategorias.ts actualizado.');

// 2. UPDATE mockCostosTimaca.ts
const mctPath = 'src/data/mockCostosTimaca.ts';
let mctContent = fs.readFileSync(mctPath, 'utf8');

const oldTablePptRegex = /export const TABLA_PPT_DISTRIBUCION_2026[\s\S]*?\];/;
const newTablePpt = `export const TABLA_PPT_DISTRIBUCION_2026 = [
  {
    categoria: 'Materiales Directos',
    meses: [268645, 531944, 565344, 465011, 183689, 473348, 239441, 371927, 868067],
    total2026: 3967415,
    variacion: '+133%',
    variacionNum: 133,
    esPositiva: true
  },
  {
    categoria: 'Servicios',
    meses: [128145, 162086, 230866, 91405, 75734, 1639332, 359067, 117970, 99540],
    total2026: 2904145,
    variacion: '-16%',
    variacionNum: -16,
    esPositiva: false
  },
  {
    categoria: 'Mano de Obra Directa',
    meses: [312530, 269666, 255366, 229531, 261564, 202303, 212668, 277936, 196666],
    total2026: 2218230,
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
    meses: [182000, 184037, 205893, 197190, 237466, 213292, 227455, 339978, 393375],
    total2026: 2180686,
    variacion: '+16%',
    variacionNum: 16,
    esPositiva: true
  }
];`;

mctContent = mctContent.replace(oldTablePptRegex, newTablePpt);
fs.writeFileSync(mctPath, mctContent, 'utf8');
console.log('2. mockCostosTimaca.ts actualizado.');

// 3. UPDATE realProyectosMensual2026.ts
const rpmPath = 'src/data/realProyectosMensual2026.ts';
const rpmContent = fs.readFileSync(rpmPath, 'utf8');
const objStr = rpmContent.substring(rpmContent.indexOf('{', rpmContent.indexOf('MATRIZ_REAL_PROYECTOS_MENSUAL_2026')), rpmContent.lastIndexOf('};') + 1);
const matriz = eval('(' + objStr + ')');

// Define project adjustments for Agosto (idx 7) and Septiembre (idx 8)
const projCIFUpdates = {
  'TTE-C-0706': { ago: 204561.00, sep: 236688.38 },
  'TTE-C-0656': { ago: 43223.00,  sep: 50012.23 },
  'TTE-C-0668': { ago: 23378.00,  sep: 27049.77 },
  'TTE-C-0671': { ago: 22759.00,  sep: 26334.17 },
  'TTE-C-0678': { ago: 14516.00,  sep: 16796.35 },
  'TTE-C-0680': { ago: 14295.00,  sep: 16539.37 },
  'TTE-C-0670': { ago: 10527.00,  sep: 12180.55 },
  'TTE-C-0694': { ago: 3861.00,   sep: 4467.58 },
  'TTE-C-0684': { ago: 2167.00,   sep: 2507.54 },
  'TTE-C-0655': { ago: 691.00,    sep: 799.06 }
};

for (const [cta, vals] of Object.entries(projCIFUpdates)) {
  if (matriz[cta]) {
    // Update Agosto
    const oldCifAgo = matriz[cta].byCategoriaMes[7]['Costos Indirectos'] || 0;
    matriz[cta].byCategoriaMes[7]['Costos Indirectos'] = vals.ago;
    matriz[cta].meses[7] = Math.round((matriz[cta].meses[7] - oldCifAgo + vals.ago) * 100) / 100;
    
    // Update Septiembre
    const oldCifSep = matriz[cta].byCategoriaMes[8]['Costos Indirectos'] || 0;
    matriz[cta].byCategoriaMes[8]['Costos Indirectos'] = vals.sep;
    matriz[cta].meses[8] = Math.round((matriz[cta].meses[8] - oldCifSep + vals.sep) * 100) / 100;
    
    // Recompute total anual
    matriz[cta].totalAnual = Math.round(matriz[cta].meses.reduce((a, b) => a + b, 0) * 100) / 100;
  }
}

const grandTotalAnual = Object.values(matriz).reduce((a, p) => a + p.totalAnual, 0);

const newTsCode = `// Matriz Oficial Real 2026 de Desembolsos Mensuales por Proyecto Externo (Enero a Septiembre 2026)
// 100% PROYECTOS EXTERNOS (TTE-C-) - SIN CAPEX NI OPEX
// GENERADA AUTOMÁTICAMENTE: TOTAL ACUMULADO: $${Math.round(grandTotalAnual).toLocaleString('en-US')} USD

export interface ProyectoEvolutivoMensual {
  cuentaAuxiliar: string;
  descripcion: string;
  meses: number[];
  byCategoriaMes: Array<Record<string, number>>;
  totalAnual: number;
}

export const MATRIZ_REAL_PROYECTOS_MENSUAL_2026: Record<string, ProyectoEvolutivoMensual> = ${JSON.stringify(matriz, null, 2)};
`;
fs.writeFileSync(rpmPath, newTsCode, 'utf8');
console.log('3. realProyectosMensual2026.ts actualizado.');

// 4. UPDATE Consolidado_Oficial_2026_Limpio.xlsx
const excelPath = 'C:/Users/alejandratesara/Desktop/Alejandra T/Costos Alejandra/Consolidado_Oficial_2026_Limpio.xlsx';
try {
  const wb = XLSX.readFile(excelPath);
  
  // Update Resumen Categorias 2026
  const mesesNombres = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre'];
  const dataResumen = [
    ['TIMACA - CONTROL GERENCIAL DE COSTOS 2026'],
    ['Matriz Oficial Consolidada de Proyectos Externos (Enero - Septiembre 2026)'],
    [],
    ['Categoría de Costo', ...mesesNombres, 'Total Acumulado 2026'],
    ['Materiales Directos (sin Normalización)', 268645, 531944, 565344, 465011, 183689, 473348, 239441, 371927, 868067, 3967416],
    ['Servicios de Obra y Subcontratos', 128145, 162086, 230866, 91405, 75734, 1639332, 359067, 117970, 99540, 2904145],
    ['Mano de Obra Directa (Nómina + Staff)', 312530, 269666, 255366, 229531, 261564, 202303, 212668, 277936, 196666, 2218230],
    ['Horas Máquina (Equipos en obra)', 145113, 113686, 149030, 55110, 129625, 69063, 75933, 89789, 55578, 882929],
    ['Costos Indirectos (CIF Auditado)', 182000, 184037, 205893, 197190, 237466, 213292, 227455, 339978, 393375, 2180686],
    ['TOTAL PROYECTOS EXTERNOS', 1036433, 1261419, 1406499, 1038247, 888078, 2597338, 1114564, 1197600, 1613226, 12153406]
  ];
  wb.Sheets['Resumen Categorías 2026'] = XLSX.utils.aoa_to_sheet(dataResumen);

  // Update Proyectos 2026
  const dataProyectos = [
    ['LISTADO DE PROYECTOS EXTERNOS 2026 - DESGLOSE MES A MES'],
    ['Valores netos mensuales expresados en Dólares Americanos (USD)'],
    [],
    ['Cuenta Auxiliar', 'Descripción del Proyecto', ...mesesNombres, 'Total General USD']
  ];
  Object.values(matriz)
    .sort((a,b) => b.totalAnual - a.totalAnual)
    .forEach(p => {
      dataProyectos.push([
        p.cuentaAuxiliar,
        p.descripcion,
        ...p.meses.map(v => Math.round(v * 100) / 100),
        Math.round(p.totalAnual * 100) / 100
      ]);
    });
  wb.Sheets['Proyectos 2026'] = XLSX.utils.aoa_to_sheet(dataProyectos);

  // Update Detalle Transacciones CIF rows for September (scaling to $393.375)
  let transRows = XLSX.utils.sheet_to_json(wb.Sheets['Detalle Transacciones']);
  
  // Re-scale September CIF rows by factor (393375 / 341374.77)
  const factor = 393375 / 341374.77;
  transRows.forEach(r => {
    if (r.Mes === 'Septiembre' && r.Tipo === 'Costos Indirectos') {
      r.Monto_USD = Math.round((Number(r.Monto_USD) || 0) * factor * 100) / 100;
    }
  });
  wb.Sheets['Detalle Transacciones'] = XLSX.utils.json_to_sheet(transRows);

  XLSX.writeFile(wb, excelPath);
  console.log('4. Consolidado_Oficial_2026_Limpio.xlsx actualizado.');
} catch (e) {
  console.log('Error actualizando Excel (posiblemente abierto):', e.message);
}
