const XLSX = require('xlsx');

const pModelo = 'C:/Users/alejandratesara/Desktop/Alejandra T/Costos Alejandra/Modelo_Estrella_Costos_TIMACA/Modelo_Estrella_Costos_TIMACA.xlsx';
const wb = XLSX.readFile(pModelo);
const ws = wb.Sheets['Detalle_Materiales'];
const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });

const header = rows[6];
console.log('Headers:', header);
// 'Cuenta Auxiliar' is col 2 (idx 2)
// 'Mes' is col 1 (idx 1)
// 'Total USD' is col 15 (idx 15)
// 'Precio Unitario USD' is col 14 (idx 14)
// 'Cantidad' is col 10 (idx 10)

let totalAll = 0;
let totalByMonth = {};
let pellasRowsByMonth = {};

for (let r = 7; r < rows.length; r++) {
  const row = rows[r];
  if (!row) continue;
  const cta = String(row[2] || '').trim();
  if (cta === 'TTE-C-0706') {
    const mes = String(row[1] || '').trim().toLowerCase();
    const totalUSD = Number(row[15]) || 0;
    totalAll += totalUSD;
    totalByMonth[mes] = (totalByMonth[mes] || 0) + totalUSD;
    if (!pellasRowsByMonth[mes]) pellasRowsByMonth[mes] = [];
    pellasRowsByMonth[mes].push({
      r: r + 1,
      item: row[9],
      cant: row[10],
      pUnit: row[14],
      totalUSD: row[15]
    });
  }
}

console.log('Total Materiales Directos TTE-C-0706 in Detalle_Materiales:');
console.log('TOTAL ALL MONTHS:', totalAll);
console.log('BY MONTH:', totalByMonth);

if (pellasRowsByMonth['septiembre']) {
  console.log(`\nSEPTEMBER ROWS (count: ${pellasRowsByMonth['septiembre'].length}):`);
  pellasRowsByMonth['septiembre'].slice(-10).forEach(x => {
    console.log(`R${x.r} Cant: ${x.cant} PUnit: ${x.pUnit} Total: ${x.totalUSD} | ${x.item}`);
  });
}
