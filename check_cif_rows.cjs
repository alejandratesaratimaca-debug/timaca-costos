const XLSX = require('xlsx');

const filePath = 'C:/Users/alejandratesara/Desktop/Alejandra T/Costos Alejandra/Consolidado_Oficial_2026_Limpio.xlsx';
const wb = XLSX.readFile(filePath);
const sheet = wb.Sheets['Detalle Transacciones'];
const data = XLSX.utils.sheet_to_json(sheet);

console.log('Row 398:', data[397]);
console.log('Row 399:', data[398]);
console.log('Row 400:', data[399]);
console.log('Row 401:', data[400]);

// Find all rows where Mes is Septiembre and what their row index is
const sepIndices = [];
data.forEach((r, idx) => {
  if (r['Mes'] === 'Septiembre') {
    sepIndices.push({ idx: idx + 2, tipo: r['Tipo'], cta: r['Cuenta_Auxiliar'] });
  }
});

console.log('Total Septiembre rows:', sepIndices.length);
console.log('First 10 Septiembre rows with line numbers:');
console.log(sepIndices.slice(0, 10));

// Check Costos Indirectos across all months
const cifRows = data.filter(r => r['Tipo'] === 'Costos Indirectos');
console.log('\nTotal Costos Indirectos rows across entire sheet:', cifRows.length);
cifRows.forEach((r, i) => {
  console.log(`CIF row ${i+1}: Mes=${r['Mes']}, Cta=${r['Cuenta_Auxiliar']}, Monto=${r['Monto_USD']}, Desc=${r['Descripcion']}`);
});
