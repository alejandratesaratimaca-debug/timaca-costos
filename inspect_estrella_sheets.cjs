const XLSX = require('xlsx');

const pModelo = 'C:/Users/alejandratesara/Desktop/Alejandra T/Costos Alejandra/Modelo_Estrella_Costos_TIMACA/Modelo_Estrella_Costos_TIMACA.xlsx';
const wb = XLSX.readFile(pModelo);

for (const name of ['Tablero_Ejecutivo_2026', 'Detalle_Proyectos_2026', 'Detalle_Materiales']) {
  const ws = wb.Sheets[name];
  if (!ws) continue;
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
  console.log(`\n=== SHEET: ${name} (rows: ${rows.length}) ===`);
  for (let r = 0; r < Math.min(25, rows.length); r++) {
    const row = rows[r];
    if (row && row.some(cell => cell !== undefined && cell !== null && cell !== '')) {
      console.log(`Row ${r+1}:`, row.slice(0, 10));
    }
  }
}
