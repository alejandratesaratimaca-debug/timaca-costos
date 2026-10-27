const XLSX = require('xlsx');

const pModelo = 'C:/Users/alejandratesara/Desktop/Alejandra T/Costos Alejandra/Modelo_Estrella_Costos_TIMACA/Modelo_Estrella_Costos_TIMACA.xlsx';
const wb = XLSX.readFile(pModelo);
const ws = wb.Sheets['Detalle_Materiales'];
const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });

console.log('Headers:', rows[6]);
for (let r = 29055; r < Math.min(rows.length, 29080); r++) {
  console.log(`Row ${r+1}:`, rows[r]);
}
