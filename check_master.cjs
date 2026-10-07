const XLSX = require('xlsx');

const pMaster = 'C:/Users/alejandratesara/Desktop/Alejandra T/Costos Alejandra/1 Informe/4 Master Unificado.xlsx';
console.log('Loading 4 Master Unificado.xlsx...');
const wbMaster = XLSX.readFile(pMaster);

for (const name of wbMaster.SheetNames) {
  const ws = wbMaster.Sheets[name];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
  console.log('Sheet [' + name + ']: ' + data.length + ' rows');
  if (data.length > 0) {
    console.log('  Row 0 (headers):', data[0].slice(0, 15));
    if (data.length > 1) {
      console.log('  Row 1:', data[1].slice(0, 10));
    }
  }
}
