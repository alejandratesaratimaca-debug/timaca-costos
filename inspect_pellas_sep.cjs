const xlsx = require('xlsx');

const filePath = 'C:/Users/alejandratesara/Desktop/Alejandra T/Costos Alejandra/3 Inputs/4 Horas Maquina/HM/2026 Septiembre Pellas.xlsx';
const wb = xlsx.readFile(filePath);
console.log('Sheets in Septiembre Pellas:', wb.SheetNames);

wb.SheetNames.forEach(sheetName => {
  const ws = wb.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(ws, { header: 1 });
  console.log(`\nSheet: ${sheetName}, Total rows: ${data.length}`);
  if (data.length > 0) {
    console.log('Header/First 5 rows:');
    data.slice(0, 5).forEach((r, idx) => console.log(`Row ${idx}:`, JSON.stringify(r).substring(0, 150)));
  }
});
