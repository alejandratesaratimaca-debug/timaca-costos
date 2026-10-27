const XLSX = require('xlsx');
const path = require('path');

const excelPath = 'C:/Users/alejandratesara/Desktop/Alejandra T/Costos Alejandra/Consolidado_Oficial_2026_Limpio.xlsx';
const wb = XLSX.readFile(excelPath);

console.log('Sheet names:', wb.SheetNames);
const wsDetalle = wb.Sheets['Detalle Transacciones'];
const rows = XLSX.utils.sheet_to_json(wsDetalle);

console.log('Total rows before:', rows.length);
const lastRow = rows[rows.length - 1];
console.log('Last row:', lastRow);
