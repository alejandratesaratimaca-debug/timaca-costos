const XLSX = require('xlsx');

const pModelo = 'C:/Users/alejandratesara/Desktop/Alejandra T/Costos Alejandra/Modelo_Estrella_Costos_TIMACA/Modelo_Estrella_Costos_TIMACA.xlsx';
const wb = XLSX.readFile(pModelo);
const ws = wb.Sheets['Detalle_Proyectos_2026'];
const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });

for (let r = 0; r < rows.length; r++) {
  const row = rows[r];
  if (!row) continue;
  const first = String(row[0] || '');
  if (first.includes('0706') || first.toLowerCase().includes('pellas')) {
    console.log(`Row ${r+1}:`, row);
  }
}
