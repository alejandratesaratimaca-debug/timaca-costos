const XLSX = require('xlsx');

const pModelo = 'C:/Users/alejandratesara/Desktop/Alejandra T/Costos Alejandra/Modelo_Estrella_Costos_TIMACA/Modelo_Estrella_Costos_TIMACA.xlsx';
const wb = XLSX.readFile(pModelo);

for (const name of wb.SheetNames) {
  const ws = wb.Sheets[name];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    if (!row) continue;
    for (let c = 0; c < row.length; c++) {
      const val = row[c];
      if (val === 799 || val === 799000 || val === 15.98 || val === 159800 || (typeof val === 'string' && (val.includes('799') || val.includes('15.98')))) {
        console.log(`Found in [${name}] R${r+1}C${c+1}:`, val, 'row snippet:', row.slice(Math.max(0, c - 2), c + 5));
      }
    }
  }
}
