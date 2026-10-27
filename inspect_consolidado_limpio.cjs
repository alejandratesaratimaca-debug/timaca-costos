const fs = require('fs');
const XLSX = require('xlsx');

const filePath = 'C:/Users/alejandratesara/Desktop/Alejandra T/Costos Alejandra/Consolidado_Oficial_2026_Limpio.xlsx';
console.log('Exists?', fs.existsSync(filePath));

const wb = XLSX.readFile(filePath);
console.log('Sheets:', wb.SheetNames);

const sheet = wb.Sheets['Detalle Transacciones'];
if (!sheet) {
  console.log('Sheet Detalle Transacciones not found!');
  process.exit(1);
}

const data = XLSX.utils.sheet_to_json(sheet);
console.log('Total rows in Detalle Transacciones:', data.length);

const sepRows = data.filter(r => {
  const mes = String(r['Mes'] || r['mes'] || '').trim().toLowerCase();
  return mes.includes('sep') || mes === '9' || mes === '09';
});

console.log('Rows in Septiembre:', sepRows.length);

const byAccountSep = {};
const byTipoSep = {};
sepRows.forEach(r => {
  const acc = r['Cuenta_Auxiliar'] || r['Cuenta_Auxilia'] || r['Cuenta'] || r['Proyecto'] || 'SIN_CUENTA';
  const tipo = r['Tipo'] || 'SIN_TIPO';
  byAccountSep[acc] = (byAccountSep[acc] || 0) + 1;
  byTipoSep[tipo] = (byTipoSep[tipo] || 0) + 1;
});

console.log('By Account in Septiembre:', byAccountSep);
console.log('By Tipo in Septiembre:', byTipoSep);

console.log('\nFirst 5 Septiembre rows:');
console.log(sepRows.slice(0, 5));
