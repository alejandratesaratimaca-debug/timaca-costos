const xlsx = require('xlsx');
const p = 'C:/Users/alejandratesara/Desktop/Alejandra T/Costos Alejandra/1 Informe/1 Base Central Inputs.xlsx';
const wb = xlsx.readFile(p, { bookSheets: true });
console.log('Sheets in 1 Base Central Inputs:', wb.SheetNames);
