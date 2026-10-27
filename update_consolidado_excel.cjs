const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const excelPath = 'C:/Users/alejandratesara/Desktop/Alejandra T/Costos Alejandra/Consolidado_Oficial_2026_Limpio.xlsx';
console.log('Reading:', excelPath);
const wb = XLSX.readFile(excelPath);

// 1. Update Detalle Transacciones
const wsDetalle = wb.Sheets['Detalle Transacciones'];
let rows = XLSX.utils.sheet_to_json(wsDetalle);
console.log('Initial rows in Detalle Transacciones:', rows.length);

// Remove the single placeholder row CIF-SEP-H2
rows = rows.filter(r => r.Documento !== 'CIF-SEP-H2');
console.log('Rows after removing CIF-SEP-H2:', rows.length);

// 2. Define the exact September CIF prorrateo by project & rubro
// Total CIF Bag = $341,374.77 (~$341,375)
const projectsCIF = [
  { cta: 'TTE-C-0706', name: 'Recuperación de Línea 1 de Planta de Pellas (VISCO ORINOCO) ', totalCIF: 205400.42, weight: 205400.42 / 341374.77 },
  { cta: 'TTE-C-0656', name: 'Rehabilitación de bandas transportadoras de finos y gruesos de la torre #3 a banda JD-8012  PMH - FMO (VISCO ORINOCO)', totalCIF: 43401.12, weight: 43401.12 / 341374.77 },
  { cta: 'TTE-C-0668', name: 'Fase 2 Planta de briquetas - FMO  (VISCO ORINOCO)', totalCIF: 23474.11, weight: 23474.11 / 341374.77 },
  { cta: 'TTE-C-0671', name: 'Segunda línea PMH - Ingenieria, diseño y suministro, para incremento de capacidad del despacho internacional PMH-FMO (VISCO ORINOCO)', totalCIF: 22852.60, weight: 22852.60 / 341374.77 },
  { cta: 'TTE-C-0678', name: 'Proyecto Pila HA y HB, suministro e instalación de apilador y recuperador de cangilones FMO-PMH (VISCO ORINOCO)', totalCIF: 14575.51, weight: 14575.51 / 341374.77 },
  { cta: 'TTE-C-0680', name: 'Servicio de mantenimiento de BG II (VISCO ORINOCO)', totalCIF: 14353.43, weight: 14353.43 / 341374.77 },
  { cta: 'TTE-C-0670', name: 'Servicio de mantenimiento Maquinas Briqueteras - Planta de Briquetas (VISCO ORINOCO)', totalCIF: 10570.37, weight: 10570.37 / 341374.77 },
  { cta: 'TTE-C-0694', name: 'Suministro e Instalación de la Caldera BF-6002 para el Area 6000 de Planta de Briquetas FMO (VISCO ORINICO)', totalCIF: 3877.14, weight: 3877.14 / 341374.77 },
  { cta: 'TTE-C-0684', name: 'Fabricación de Gamelas FMO-PMH (VISCO ORINOCO)', totalCIF: 2176.07, weight: 2176.07 / 341374.77 },
  { cta: 'TTE-C-0655', name: 'Interconexión del sistema de transporte de mineral desde la tolva multipropósito hasta carga barcos de despacho internacional PMH - FMO (VISCO ORINOCO)', totalCIF: 694.00, weight: 694.00 / 341374.77 }
];

const rubrosCIF = [
  { rubro: 'Nomina -TALLERES', monto: 122000, doc: 'CIF-SEP-TAL' },
  { rubro: 'Nomina TIMACA', monto: 73000, doc: 'CIF-SEP-NOM' },
  { rubro: 'Sindicato', monto: 58952, doc: 'CIF-SEP-SIN' },
  { rubro: 'Combustible', monto: 50413, doc: 'CIF-SEP-COMB' },
  { rubro: 'Otros Servicios Contratados de Admón.', monto: 9991, doc: 'CIF-SEP-ADM' },
  { rubro: 'Timbres Fiscales / Notarias / Registros', monto: 7634, doc: 'CIF-SEP-TIM' },
  { rubro: 'Incentivos Laborales (Bonos)', monto: 6700, doc: 'CIF-SEP-BON' },
  { rubro: 'Vigilancia', monto: 4803, doc: 'CIF-SEP-VIG' },
  { rubro: 'Gastos de viajes/viáticos nacionales', monto: 4124, doc: 'CIF-SEP-VIAT' },
  { rubro: 'Servicios Publicos', monto: 2556, doc: 'CIF-SEP-PUB' },
  { rubro: 'Servicios Telecomunicaciones', monto: 570, doc: 'CIF-SEP-TEL' },
  { rubro: 'Gastos de Seguro', monto: 277, doc: 'CIF-SEP-SEG' },
  { rubro: 'Honorarios Profesionales', monto: 250, doc: 'CIF-SEP-HON' },
  { rubro: 'Gastos de asociación/Subscripción', monto: 56, doc: 'CIF-SEP-ASOC' },
  { rubro: 'Gastos de Servicios Bancarios', monto: 49, doc: 'CIF-SEP-BANC' }
];

// Add individual CIF rows for all active projects
projectsCIF.forEach(p => {
  let projSum = 0;
  rubrosCIF.forEach((r, idx) => {
    let rowVal = Math.round(r.monto * p.weight * 100) / 100;
    // Adjust rounding difference on the largest rubro (Nomina -TALLERES)
    if (idx === rubrosCIF.length - 1) {
      rowVal = Math.round((p.totalCIF - projSum) * 100) / 100;
    } else {
      projSum += rowVal;
    }

    rows.push({
      Tipo: 'Costos Indirectos',
      Mes: 'Septiembre',
      Documento: r.doc,
      Cuenta_Auxiliar: p.cta,
      Proyecto: p.name,
      Descripcion: r.rubro,
      Monto_USD: rowVal
    });
  });
});

// 3. Add missing September Servicios rows for Pellas (Baños $8.400, Vigilancia $13.182,08, Ajustes $1.137,92)
// This brings Pellas Servicios in Consolidado from $46.335,86 to $69.055,86
rows.push({
  Tipo: 'Servicios',
  Mes: 'Septiembre',
  Documento: 'OC22626/OC21946',
  Cuenta_Auxiliar: 'TTE-C-0706',
  Proyecto: 'Recuperación de Línea 1 de Planta de Pellas (VISCO ORINOCO) ',
  Descripcion: 'Alquiler de baños portátiles y sanitarios (Servicio Planta Pellas)',
  Monto_USD: 8400.00
});

rows.push({
  Tipo: 'Servicios',
  Mes: 'Septiembre',
  Documento: 'F-1140/PELLAS-SEP',
  Cuenta_Auxiliar: 'TTE-C-0706',
  Proyecto: 'Recuperación de Línea 1 de Planta de Pellas (VISCO ORINOCO) ',
  Descripcion: 'Vigilancia externa y seguridad integral frente Pellas',
  Monto_USD: 13182.08
});

rows.push({
  Tipo: 'Servicios',
  Mes: 'Septiembre',
  Documento: 'OC22557/OC22613',
  Cuenta_Auxiliar: 'TTE-C-0706',
  Proyecto: 'Recuperación de Línea 1 de Planta de Pellas (VISCO ORINOCO) ',
  Descripcion: 'Servicios de camión cisterna, exámenes médicos y soporte de obra Pellas',
  Monto_USD: 1137.92
});

console.log('Final rows in Detalle Transacciones:', rows.length);

// Re-write Detalle Transacciones sheet
wb.Sheets['Detalle Transacciones'] = XLSX.utils.json_to_sheet(rows);

// 4. Update Resumen Categorías 2026 sheet
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
  ['Costos Indirectos (CIF Auditado)', 182000, 184037, 205893, 197190, 237466, 213292, 227455, 212978, 341375, 2001686],
  ['TOTAL PROYECTOS EXTERNOS', 1036433, 1261419, 1406499, 1038247, 888078, 2597338, 1114564, 1070600, 1561226, 11974406]
];
wb.Sheets['Resumen Categorías 2026'] = XLSX.utils.aoa_to_sheet(dataResumen);

// 5. Update Proyectos 2026 sheet
const rpmContent = fs.readFileSync('src/data/realProyectosMensual2026.ts', 'utf8');
const objStr = rpmContent.substring(rpmContent.indexOf('{', rpmContent.indexOf('MATRIZ_REAL_PROYECTOS_MENSUAL_2026')), rpmContent.lastIndexOf('};') + 1);
const matriz = eval('(' + objStr + ')');

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

// Save updated Excel file
XLSX.writeFile(wb, excelPath);
console.log('Successfully updated Consolidado_Oficial_2026_Limpio.xlsx!');
