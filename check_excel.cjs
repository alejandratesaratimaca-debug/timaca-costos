const XLSX = require('xlsx');
const fs = require('fs');

const pBaseCentral = 'C:/Users/alejandratesara/Desktop/Alejandra T/Costos Alejandra/1 Informe/1 Base Central Inputs.xlsx';
console.log('Loading 1 Base Central Inputs.xlsx...');
const wbBase = XLSX.readFile(pBaseCentral);

for (const name of ['1 Consumos', '2 Compras', '3 Mano de obra', '4 Horas Maquina', 'Mano de Obra ECO']) {
  const ws = wbBase.Sheets[name];
  if (!ws) continue;
  const data = XLSX.utils.sheet_to_json(ws, { defval: '' });
  console.log('Sheet [' + name + ']: ' + data.length + ' rows');
  if (data.length > 0) {
    const keys = Object.keys(data[0]);
    console.log('  Headers:', keys.slice(0, 8));
    const mesCol = keys.find(k => /mes/i.test(k));
    const fechaCol = keys.find(k => /fecha/i.test(k));
    if (mesCol) {
      const meses = Array.from(new Set(data.map(r => r[mesCol]))).sort();
      console.log('  Unique ' + mesCol + ':', meses);
    } else if (fechaCol) {
      console.log('  Sample dates:', data.slice(-3).map(r => r[fechaCol]));
    }
  }
}
