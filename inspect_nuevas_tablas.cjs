const XLSX = require('xlsx');

const pFile = 'C:/Users/alejandratesara/Desktop/Alejandra T/Costos Alejandra/1 Informe/Nuevas Tablas Informesssssssssssss.xlsx';
const wb = XLSX.readFile(pFile);
console.log('Sheets:', wb.SheetNames);

const ws = wb.Sheets['Proyectos Mensuales'];
const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });

console.log('--- Proyectos Mensuales around row 19 ---');
for (let r = 10; r < Math.min(30, rows.length); r++) {
  if (rows[r] && rows[r].length) {
    console.log(`Row ${r+1}:`, rows[r]);
  }
}
