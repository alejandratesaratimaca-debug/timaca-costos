const XLSX = require('xlsx');

const pathEstrella = 'C:/Users/alejandratesara/Desktop/Alejandra T/Costos Alejandra/Modelo_Estrella_Costos_TIMACA/Modelo_Estrella_Costos_TIMACA.xlsx';
const wb = XLSX.readFile(pathEstrella);
const ws = wb.Sheets['Tablero_Ejecutivo_2026'];

console.log('=== Tablero_Ejecutivo_2026 formulas ===');
for (let r = 4; r <= 14; r++) {
  let rowStr = `R${r+1}: `;
  for (let c = 0; c <= 7; c++) {
    const addr = XLSX.utils.encode_cell({ r, c });
    const cell = ws[addr];
    if (cell) {
      rowStr += `[${addr} = ${cell.f ? '=' + cell.f : cell.v}] `;
    }
  }
  console.log(rowStr);
}
