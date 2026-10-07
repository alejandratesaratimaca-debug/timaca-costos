const XLSX = require('xlsx');

const pathNuevas = 'C:/Users/alejandratesara/Desktop/Alejandra T/Costos Alejandra/1 Informe/Nuevas Tablas Informesssssssssssss.xlsx';
const pathEstrella = 'C:/Users/alejandratesara/Desktop/Alejandra T/Costos Alejandra/Modelo_Estrella_Costos_TIMACA/Modelo_Estrella_Costos_TIMACA.xlsx';

const wbNuevas = XLSX.readFile(pathNuevas);
const wbEstrella = XLSX.readFile(pathEstrella);

const wsTablero = wbEstrella.Sheets['Tablero_Ejecutivo_2026'];
const rowsTablero = XLSX.utils.sheet_to_json(wsTablero, { header: 1 });

const wsExt = wbNuevas.Sheets['Externos 2026'];
const rowsExt = XLSX.utils.sheet_to_json(wsExt, { header: 1 });

console.log('--- AGOSTO 2026 COMPARISON ---');
console.log('Concepto | Modelo Estrella | Nuevas Tablas | Diff');

// In Tablero_Ejecutivo_2026, row 13 is agosto
const rAgoEstrella = rowsTablero[12]; // 0-indexed 12 is row 13
console.log('Row 13 Estrella:', rAgoEstrella);

// In Externos 2026, column index for agosto:
// row 8: [Etiquetas de fila, enero, febrero, marzo, abril, mayo, junio, julio, agosto, Total general]
// agosto is index 8 (col I)
const catNames = ['Materiales Directos', 'Servicios', 'Mano de Obra Directa', 'Horas Maquina', 'Costos Indirectos', 'Total general'];
const extAgo = {};
rowsExt.slice(8, 14).forEach(r => {
  extAgo[r[0]] = r[8];
});

console.log('Estrella Agosto:', {
  Materiales: rAgoEstrella[1],
  Servicios: rAgoEstrella[2],
  MOD: rAgoEstrella[3],
  HM: rAgoEstrella[4],
  Indirectos: rAgoEstrella[5],
  Total: rAgoEstrella[6]
});

console.log('Nuevas Tablas Agosto:', extAgo);
