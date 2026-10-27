const XLSX = require('xlsx');

const pModelo = 'C:/Users/alejandratesara/Desktop/Alejandra T/Costos Alejandra/Modelo_Estrella_Costos_TIMACA/Modelo_Estrella_Costos_TIMACA.xlsx';
console.log('Loading Modelo_Estrella_Costos_TIMACA.xlsx...');
const wb = XLSX.readFile(pModelo);
console.log('Sheet Names:', wb.SheetNames);

for (const sheetName of wb.SheetNames) {
  const ws = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    if (!row) continue;
    for (let c = 0; c < row.length; c++) {
      const val = row[c];
      if (typeof val === 'number') {
        if (Math.round(val) === 123685 || Math.round(val) === 219531 || Math.round(val) === 166893) {
          console.log(`FOUND in sheet [${sheetName}] row ${r+1} col ${c+1}: val=${val}`);
          console.log('Row context:', row.slice(Math.max(0, c - 2), c + 5));
        }
      } else if (typeof val === 'string') {
        if (val.includes('123.685') || val.includes('123685') || val.includes('219.531') || val.includes('166.893')) {
          console.log(`FOUND STR in sheet [${sheetName}] row ${r+1} col ${c+1}: val=${val}`);
        }
      }
    }
  }
}
