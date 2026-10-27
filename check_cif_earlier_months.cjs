const XLSX = require('xlsx');

const filePath = 'C:/Users/alejandratesara/Desktop/Alejandra T/Costos Alejandra/Consolidado_Oficial_2026_Limpio.xlsx';
const wb = XLSX.readFile(filePath);
const sheet = wb.Sheets['Detalle Transacciones'];
const data = XLSX.utils.sheet_to_json(sheet);

const cifRows = data.filter(r => r.Tipo === 'Costos Indirectos');
console.log('Total CIF rows in Detalle Transacciones:', cifRows.length);

const months = {};
cifRows.forEach(r => {
  months[r.Mes] = (months[r.Mes] || 0) + 1;
});
console.log('CIF rows by month:', months);

const augCIF = cifRows.filter(r => r.Mes === 'Agosto');
console.log('\nSample Agosto CIF rows (first 10):');
console.log(augCIF.slice(0, 10));

const augByProject = {};
augCIF.forEach(r => {
  augByProject[r.Cuenta_Auxiliar] = (augByProject[r.Cuenta_Auxiliar] || 0) + (r.Monto_USD || 0);
});
console.log('\nAgosto CIF sum by Project:', augByProject);
