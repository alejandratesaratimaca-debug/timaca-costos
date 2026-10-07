const XLSX = require('xlsx');

const pathNuevas = 'C:/Users/alejandratesara/Desktop/Alejandra T/Costos Alejandra/1 Informe/Nuevas Tablas Informesssssssssssss.xlsx';
const pathEstrella = 'C:/Users/alejandratesara/Desktop/Alejandra T/Costos Alejandra/Modelo_Estrella_Costos_TIMACA/Modelo_Estrella_Costos_TIMACA.xlsx';

console.log('Loading workbooks for millimetric verification...');
const wbNuevas = XLSX.readFile(pathNuevas);
const wbEstrella = XLSX.readFile(pathEstrella);

// 1. COMPARACION TABLERO EJECUTIVO VS EXTERNOS 2026
const wsEstrellaTablero = wbEstrella.Sheets['Tablero_Ejecutivo_2026'];
const rowsEstrella = XLSX.utils.sheet_to_json(wsEstrellaTablero, { header: 1 });

const wsNuevasExt = wbNuevas.Sheets['Externos 2026'];
const rowsNuevas = XLSX.utils.sheet_to_json(wsNuevasExt, { header: 1 });

console.log('=== 1. COMPARACION MENSUAL POR ELEMENTO DE COSTO ===');
const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'Total general'];
const conceptos = ['Materiales Directos', 'Servicios', 'Mano de Obra Directa', 'Horas Maquina', 'Costos Indirectos', 'Total general'];

// In Modelo Estrella (Tablero_Ejecutivo_2026):
// Row 5 is header: [Etiquetas de fila, Total USD Materiales, Total USD Servicios, Total USD Mano de Obra, Total USD Horas Maquina, Total USD Costos Indirectos, Costo Total 2026]
// Rows 6 to 13 are enero to agosto, row 14 is Total general
const dataEstrella = {};
rowsEstrella.slice(5, 14).forEach(r => {
  const m = String(r[0] || '').trim().toLowerCase();
  dataEstrella[m] = {
    'Materiales Directos': Number(r[1] || 0),
    'Servicios': Number(r[2] || 0),
    'Mano de Obra Directa': Number(r[3] || 0),
    'Horas Maquina': Number(r[4] || 0),
    'Costos Indirectos': Number(r[5] || 0),
    'Total general': Number(r[6] || 0)
  };
});

// In Nuevas Tablas (Externos 2026):
// Row 8 is header: [Etiquetas de fila, enero, febrero, marzo, abril, mayo, junio, julio, agosto, Total general]
// Rows 9 to 13 are concepts, row 14 is Total general
const colNames = rowsNuevas[7].map(c => String(c || '').trim().toLowerCase());
const dataNuevas = {};
meses.forEach(m => dataNuevas[m] = {});

rowsNuevas.slice(8, 14).forEach(r => {
  const concepto = String(r[0] || '').trim();
  for (let c = 1; c < r.length; c++) {
    const mesCol = colNames[c];
    if (dataNuevas[mesCol]) {
      dataNuevas[mesCol][concepto] = Number(r[c] || 0);
    }
  }
});

console.log('\n--- MATRIZ DE COMPARACION MES A MES ---');
meses.forEach(m => {
  console.log(`\n>>> MES: ${m.toUpperCase()} <<<`);
  const table = [];
  conceptos.forEach(conc => {
    const est = (dataEstrella[m] && dataEstrella[m][conc]) || 0;
    const nue = (dataNuevas[m] && dataNuevas[m][conc]) || 0;
    const diff = nue - est;
    table.push({
      Concepto: conc,
      'Modelo Estrella': est.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      'Nuevas Tablas': nue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      'Diferencia (USD)': Math.abs(diff) < 0.005 ? '0.00 (EXACTO)' : diff.toFixed(2)
    });
  });
  console.table(table);
});

// 2. DETALLE PELLAS LINEA 1 Y 2
console.log('\n=== 2. PELLAS LINEA 1 (TTE-C-0706) EN AMBOS ARCHIVOS ===');
// From Modelo Estrella Detalle_ManoDeObra
const wsMdoEst = wbEstrella.Sheets['Detalle_ManoDeObra'];
const rowsMdoEst = XLSX.utils.sheet_to_json(wsMdoEst, { range: 6 });
const mod706Est = { enero: 0, febrero: 0, marzo: 0, abril: 0, mayo: 0, junio: 0, julio: 0, agosto: 0 };
const mod676Est = { enero: 0, febrero: 0, marzo: 0, abril: 0, mayo: 0, junio: 0, julio: 0, agosto: 0 };

rowsMdoEst.forEach(r => {
  const cAux = String(r['Cuenta Auxiliar'] || '').trim();
  const mes = String(r['Mes'] || '').trim().toLowerCase();
  const costo = Number(r['Total USD'] || 0);
  if (cAux === 'TTE-C-0706' && mod706Est[mes] !== undefined) mod706Est[mes] += costo;
  if (cAux === 'TTE-C-0676' && mod676Est[mes] !== undefined) mod676Est[mes] += costo;
});

// From Nuevas Tablas Filtro por C.Aux
const wsFiltro = wbNuevas.Sheets['Filtro por C.Aux'];
const rowsFiltro = XLSX.utils.sheet_to_json(wsFiltro, { header: 1 });
// Let's locate MOD row for 0706
let mod706Nuevas = null;
rowsFiltro.forEach((r, idx) => {
  const line = (r || []).join(' | ');
  if (line.includes('Mano de Obra Directa')) {
    mod706Nuevas = r;
  }
});

console.log('Modelo Estrella Pellas 1 MOD:', mod706Est);
console.log('Nuevas Tablas Filtro por C.Aux MOD row:');
console.log(mod706Nuevas);
