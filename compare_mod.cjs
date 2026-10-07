const XLSX = require('xlsx');

const pBaseCentral = 'C:/Users/alejandratesara/Desktop/Alejandra T/Costos Alejandra/1 Informe/1 Base Central Inputs.xlsx';
const wbBase = XLSX.readFile(pBaseCentral, { sheetRows: 5 });
const wsMOD = wbBase.Sheets['3 Mano de obra'];
const headersMOD = XLSX.utils.sheet_to_json(wsMOD, { header: 1 })[0];
console.log('Headers in Base Central [3 Mano de obra]:', headersMOD);

const pSepMOD = 'C:/Users/alejandratesara/Desktop/Alejandra T/Costos Alejandra/3 Inputs/3 Mano de obra/2026 - Pellas sem 35.xlsx';
const wbSepMOD = XLSX.readFile(pSepMOD, { sheetRows: 5 });
const wsSepMOD = wbSepMOD.Sheets[wbSepMOD.SheetNames[0]];
const headersSepMOD = XLSX.utils.sheet_to_json(wsSepMOD, { header: 1 })[0];
console.log('Headers in Pellas sem 35.xlsx:', headersSepMOD);
