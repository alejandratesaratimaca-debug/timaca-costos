const XLSX = require('xlsx');

const pathEstrella = 'C:/Users/alejandratesara/Desktop/Alejandra T/Costos Alejandra/Modelo_Estrella_Costos_TIMACA/Modelo_Estrella_Costos_TIMACA.xlsx';
const wb = XLSX.readFile(pathEstrella, { dense: true });
const ws = wb.Sheets['Detalle_ManoDeObra'];
const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

console.log('=== Detalle_ManoDeObra in Modelo Estrella ===');
console.log('Total rows:', data.length);
console.log('Header (R6):', data[6]);

for (let i = 13525; i < data.length; i++) {
  console.log(`Row ${i}:`, data[i]);
}
