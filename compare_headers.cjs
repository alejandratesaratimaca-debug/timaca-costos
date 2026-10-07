const XLSX = require('xlsx');

const pBaseCentral = 'C:/Users/alejandratesara/Desktop/Alejandra T/Costos Alejandra/1 Informe/1 Base Central Inputs.xlsx';
const wbBase = XLSX.readFile(pBaseCentral, { sheetRows: 5 });
const wsConsumosBase = wbBase.Sheets['1 Consumos'];
const headersBaseConsumos = XLSX.utils.sheet_to_json(wsConsumosBase, { header: 1 })[0];
console.log('Headers in Base Central [1 Consumos]:', headersBaseConsumos);

const pSepConsumos = 'C:/Users/alejandratesara/Desktop/Alejandra T/Costos Alejandra/3 Inputs/1 Consumos/9 Septiembre.xlsx';
const wbSep = XLSX.readFile(pSepConsumos, { sheetRows: 5 });
const wsSep = wbSep.Sheets[wbSep.SheetNames[0]];
const headersSep = XLSX.utils.sheet_to_json(wsSep, { header: 1 })[0];
console.log('Headers in 9 Septiembre.xlsx:', headersSep);
