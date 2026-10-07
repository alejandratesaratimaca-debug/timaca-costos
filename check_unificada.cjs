const XLSX = require('xlsx');

const pMaster = 'C:/Users/alejandratesara/Desktop/Alejandra T/Costos Alejandra/1 Informe/4 Master Unificado.xlsx';
console.log('Reading sample of Unificada...');
const wb = XLSX.readFile(pMaster, { sheetRows: 50 });
const ws = wb.Sheets['Unificada'];
const rows = XLSX.utils.sheet_to_json(ws);
console.log('Sample row:', rows[0]);

// Let's check the date of the last rows of Unificada
const wbFull = XLSX.readFile(pMaster);
const wsFull = wbFull.Sheets['Unificada'];
const allRows = XLSX.utils.sheet_to_json(wsFull);
console.log('Total rows in Unificada:', allRows.length);

const tipos = {};
allRows.forEach(r => {
  tipos[r['Tipo']] = (tipos[r['Tipo']] || 0) + 1;
});
console.log('Counts by Tipo:', tipos);

const fechas = allRows.map(r => r['Fecha']).filter(f => typeof f === 'number' || (typeof f === 'string' && f.length > 5));
console.log('Max fecha:', Math.max(...fechas.filter(f => typeof f === 'number')));
// In Excel, 46279 is 2026-08-31
console.log('Any dates >= 46280 (Sept 2026)?', fechas.filter(f => f >= 46280).length);
