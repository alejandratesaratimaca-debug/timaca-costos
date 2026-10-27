const XLSX = require('xlsx');

const excelPath = 'C:/Users/alejandratesara/Desktop/Alejandra T/Costos Alejandra/Consolidado_Oficial_2026_Limpio.xlsx';
console.log('Reading Excel file:', excelPath);

const wb = XLSX.readFile(excelPath);
const wsDetalle = wb.Sheets['Detalle Transacciones'];
const rows = XLSX.utils.sheet_to_json(wsDetalle);

console.log('Total rows before:', rows.length);

const cleanRows = rows.filter(r => {
  if (r.Tipo === 'Horas Maquina' && (Number(r.Monto_USD) === 0 || Number(r.Monto_USD) < 0.001)) {
    return false;
  }
  return true;
});

console.log('Total rows after removing zero Horas Maquina:', cleanRows.length);
console.log('Zero HM rows removed:', rows.length - cleanRows.length);

wb.Sheets['Detalle Transacciones'] = XLSX.utils.json_to_sheet(cleanRows);
XLSX.writeFile(wb, excelPath);
console.log('Successfully saved Consolidado_Oficial_2026_Limpio.xlsx without zero Horas Maquina!');
