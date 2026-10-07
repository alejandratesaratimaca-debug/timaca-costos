const XLSX = require('xlsx');

const pModelo = 'C:/Users/alejandratesara/Desktop/Alejandra T/Costos Alejandra/Modelo_Estrella_Costos_TIMACA/Modelo_Estrella_Costos_TIMACA.xlsx';
console.log('Loading Modelo_Estrella_Costos_TIMACA.xlsx...');
const wb = XLSX.readFile(pModelo, { sheetRows: 5 });
console.log('Sheets in Modelo_Estrella_Costos_TIMACA:', wb.SheetNames);

for (const name of wb.SheetNames) {
  const ws = wb.Sheets[name];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
  console.log(`Sheet [${name}]:`, rows[0] ? rows[0].slice(0, 10) : 'empty');
}
