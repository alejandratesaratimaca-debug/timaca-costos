const XLSX = require('xlsx');
const fs = require('fs');

console.log('=== CHECKING 9 Septiembre.xlsx ===');
const fConsumoSep = 'C:/Users/alejandratesara/Desktop/Alejandra T/Costos Alejandra/3 Inputs/1 Consumos/9 Septiembre.xlsx';
const wbSep = XLSX.readFile(fConsumoSep, { sheetRows: 5 });
console.log('Sheets in 9 Septiembre.xlsx:', wbSep.SheetNames);
const wsSep = wbSep.Sheets[wbSep.SheetNames[0]];
const rowsSep = XLSX.utils.sheet_to_json(wsSep);
console.log('Sample row in 9 Septiembre.xlsx:', rowsSep[0]);

console.log('=== CHECKING Mano de Obra September files ===');
const dirMOD = 'C:/Users/alejandratesara/Desktop/Alejandra T/Costos Alejandra/3 Inputs/3 Mano de obra';
const modFiles = fs.readdirSync(dirMOD).filter(f => f.includes('35') || f.includes('36') || f.includes('37') || f.includes('38') || f.includes('39'));
console.log('MOD September files:', modFiles);

for (const f of modFiles.slice(0, 3)) {
  const wb = XLSX.readFile(dirMOD + '/' + f, { sheetRows: 3 });
  console.log(f + ' sheets:', wb.SheetNames);
}
