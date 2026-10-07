const XLSX = require('xlsx');

const pCompras = 'C:/Users/alejandratesara/Desktop/Alejandra T/Costos Alejandra/3 Inputs/2 Compras/2026.xlsx';
console.log('Loading 2 Compras/2026.xlsx...');
const wb = XLSX.readFile(pCompras);
const ws = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(ws);
console.log('Total rows in Compras 2026:', rows.length);
if (rows.length > 0) {
  console.log('Headers:', Object.keys(rows[0]));
  console.log('Sample row:', rows[0]);
  
  // Find dates
  const dateKeys = Object.keys(rows[0]).filter(k => /fecha/i.test(k));
  console.log('Date columns:', dateKeys);
  for (const dk of dateKeys) {
    const vals = rows.map(r => r[dk]).filter(Boolean);
    console.log(`Column ${dk} sample:`, vals.slice(-5));
  }
}
