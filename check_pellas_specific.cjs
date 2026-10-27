const path = require('path');
const xlsx = require(path.join(__dirname, 'node_modules', 'xlsx'));

const wb = xlsx.readFile('C:/Users/alejandratesara/Desktop/Alejandra T/Costos Alejandra/1 Informe/4 Master Unificado.xlsx');
const sheet = wb.Sheets['Unificada'];
const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

const headers = rows[0];
console.log('Cabeceras principales:');
headers.forEach((h, idx) => {
  if (h) console.log(`Col ${idx}: ${h}`);
});

console.log('\n--- BÚSQUEDA ESPECÍFICA SC25774, SC26299, SC25773 ---');
const codes = ['SC25774', 'SC26299', 'SC25773', 'OC23120', 'OC22575', 'OC22576'];

for (let i = 1; i < rows.length; i++) {
  const row = rows[i];
  const str = JSON.stringify(row);
  for (const c of codes) {
    if (str && str.includes(c)) {
      console.log(`\n>>> Fila ${i + 1} contiene [${c}]:`);
      row.forEach((val, colIdx) => {
        if (val !== undefined && val !== null && val !== '') {
          console.log(`  [${colIdx}] ${headers[colIdx] || 'COL_'+colIdx}: ${val}`);
        }
      });
      break;
    }
  }
}
