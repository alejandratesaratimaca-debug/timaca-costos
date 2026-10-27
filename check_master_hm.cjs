const xlsx = require('xlsx');

// Let's check 4 Master Unificado.xlsx
const masterPath = 'C:/Users/alejandratesara/Desktop/Alejandra T/Costos Alejandra/2 Master/4 Master Unificado.xlsx';
console.log('Reading 4 Master Unificado.xlsx...');
const wb = xlsx.readFile(masterPath, { sheetRows: 50000 }); // or find where Horas Maquina are
// Let's check sheet names
console.log('Sheet names:', wb.SheetNames);
