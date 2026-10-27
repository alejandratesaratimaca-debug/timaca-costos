const fs = require('fs');
const XLSX = require('xlsx');

console.log('=== SINCRONIZANDO EXACTAMENTE LA MOD Y EL PRORRATEO DE SEPTIEMBRE ===\n');

// Exact values from Alejandra's screenshot
const TABLA_ALEJANDRA = [
  { cta: 'TTE-C-0706', nombre: 'Recuperación Línea 1 Pellas', mod: 133185.00, pct: 60.2, cif: 236688.09 },
  { cta: 'TTE-C-0656', nombre: 'Rehabilitación de Bandas PMH', mod: 28142.00, pct: 12.7, cif: 50012.21 },
  { cta: 'TTE-C-0671', nombre: 'Segunda Línea PMH', mod: 14818.00, pct: 6.7, cif: 26333.63 },
  { cta: 'TTE-C-0668', nombre: 'Fase 2 Planta Briquetas', mod: 15221.00, pct: 6.9, cif: 27049.81 },
  { cta: 'TTE-C-0678', nombre: 'Proyecto Pila HA y HB', mod: 9451.00, pct: 4.3, cif: 16795.73 },
  { cta: 'TTE-C-0680', nombre: 'Mantenimiento BG II', mod: 9307.00, pct: 4.2, cif: 16539.82 },
  { cta: 'TTE-C-0670', nombre: 'Mantenimiento Briqueteras', mod: 6854.00, pct: 3.1, cif: 12180.50 },
  { cta: 'TTE-C-0694', nombre: 'Suministro Caldera Briquetas', mod: 2514.00, pct: 1.1, cif: 4467.72 },
  { cta: 'TTE-C-0684', nombre: 'Fabricación de Gamelas', mod: 1411.00, pct: 0.6, cif: 2507.54 },
  { cta: 'TTE-C-0655', nombre: 'Interconexión PMH', mod: 450.00, pct: 0.2, cif: 799.71 }
];

const totalMOD_Sep = TABLA_ALEJANDRA.reduce((a, b) => a + b.mod, 0);
const totalCIF_Sep = TABLA_ALEJANDRA.reduce((a, b) => a + b.cif, 0);

console.log('Total MOD Septiembre:', totalMOD_Sep);
console.log('Total CIF Septiembre:', totalCIF_Sep.toFixed(2));

// 1. UPDATE realProyectosMensual2026.ts
const rpmPath = 'src/data/realProyectosMensual2026.ts';
const rpmContent = fs.readFileSync(rpmPath, 'utf8');
const objStr = rpmContent.substring(rpmContent.indexOf('{', rpmContent.indexOf('MATRIZ_REAL_PROYECTOS_MENSUAL_2026')), rpmContent.lastIndexOf('};') + 1);
const matriz = eval('(' + objStr + ')');

// Clear September MOD for all projects first to zero, then set the exact ones from Alejandra
for (const [cta, p] of Object.entries(matriz)) {
  if (p.byCategoriaMes && p.byCategoriaMes[8]) {
    p.byCategoriaMes[8]['Mano de Obra Directa'] = 0;
  }
}

TABLA_ALEJANDRA.forEach(item => {
  if (matriz[item.cta]) {
    matriz[item.cta].byCategoriaMes[8]['Mano de Obra Directa'] = item.mod;
    matriz[item.cta].byCategoriaMes[8]['Costos Indirectos'] = item.cif;
    
    // Recalculate September total
    const cats = matriz[item.cta].byCategoriaMes[8];
    const sepTotal = (cats['Materiales Directos'] || 0) +
                     (cats['Servicios'] || 0) +
                     (cats['Mano de Obra Directa'] || 0) +
                     (cats['Horas Maquina'] || 0) +
                     (cats['Costos Indirectos'] || 0);
    matriz[item.cta].meses[8] = Math.round(sepTotal * 100) / 100;
    
    // Recalculate annual total
    matriz[item.cta].totalAnual = Math.round(matriz[item.cta].meses.reduce((a, b) => a + b, 0) * 100) / 100;
  }
});

// For any other project that had MOD set in sep, recompute their month 8 total
for (const [cta, p] of Object.entries(matriz)) {
  if (!TABLA_ALEJANDRA.find(x => x.cta === cta) && p.meses[8] > 0) {
    const cats = p.byCategoriaMes[8];
    const sepTotal = (cats['Materiales Directos'] || 0) +
                     (cats['Servicios'] || 0) +
                     (cats['Mano de Obra Directa'] || 0) +
                     (cats['Horas Maquina'] || 0) +
                     (cats['Costos Indirectos'] || 0);
    p.meses[8] = Math.round(sepTotal * 100) / 100;
    p.totalAnual = Math.round(p.meses.reduce((a, b) => a + b, 0) * 100) / 100;
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
console.log('1. realProyectosMensual2026.ts actualizado con MOD y CIF exactos.');

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
    meses: [312530, 269666, 255366, 229531, 261564, 202303, 212668, 277936, 221353],
    total2026: 2242917,
    variacion: '-20%',
    variacionNum: -20,
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
console.log('2. mockCostosTimaca.ts actualizado (MOD Sep = 221.353, Total Sep = 1.637.913).');

// 3. UPDATE Consolidado_Oficial_2026_Limpio.xlsx
const excelPath = 'C:/Users/alejandratesara/Desktop/Alejandra T/Costos Alejandra/Consolidado_Oficial_2026_Limpio.xlsx';
try {
  const wb = XLSX.readFile(excelPath);
  
  const mesesNombres = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre'];
  const dataResumen = [
    ['TIMACA - CONTROL GERENCIAL DE COSTOS 2026'],
    ['Matriz Oficial Consolidada de Proyectos Externos (Enero - Septiembre 2026)'],
    [],
    ['Categoría de Costo', ...mesesNombres, 'Total Acumulado 2026'],
    ['Materiales Directos (sin Normalización)', 268645, 531944, 565344, 465011, 183689, 473348, 239441, 371927, 868067, 3967416],
    ['Servicios de Obra y Subcontratos', 128145, 162086, 230866, 91405, 75734, 1639332, 359067, 117970, 99540, 2904145],
    ['Mano de Obra Directa (Nómina + Staff)', 312530, 269666, 255366, 229531, 261564, 202303, 212668, 277936, 221353, 2242917],
    ['Horas Máquina (Equipos en obra)', 145113, 113686, 149030, 55110, 129625, 69063, 75933, 89789, 55578, 882929],
    ['Costos Indirectos (CIF Auditado)', 182000, 184037, 205893, 197190, 237466, 213292, 227455, 339978, 393375, 2180686],
    ['TOTAL PROYECTOS EXTERNOS', 1036433, 1261419, 1406499, 1038247, 888078, 2597338, 1114564, 1197600, 1637913, 12178093]
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

  XLSX.writeFile(wb, excelPath);
  console.log('3. Consolidado_Oficial_2026_Limpio.xlsx actualizado.');
} catch (e) {
  console.log('Excel file error:', e.message);
}
