const xlsx = require('xlsx');
const wb = xlsx.readFile('public/Consolidado_Oficial_2026_Limpio.xlsx');
console.log('Sheets in wb:', wb.SheetNames);
for (const name of wb.SheetNames) {
  const ws = wb.Sheets[name];
  console.log(`\n================== Sheet: ${name} ==================`);
  const data = xlsx.utils.sheet_to_json(ws, { header: 1 });
  for (let r = 0; r < Math.min(data.length, 25); r++) {
    if (data[r] && data[r].length > 0) {
      console.log(`Row ${r}:`, JSON.stringify(data[r]));
    }
  }
}
