const xlsx = require('xlsx');
const wb = xlsx.readFile('public/Consolidado_Oficial_2026_Limpio.xlsx');
const ws = wb.Sheets['Tabla Dinamica Categorias'];
const data = xlsx.utils.sheet_to_json(ws, { header: 1 });
data.forEach((r, idx) => {
  if (r && r.length > 0) {
    console.log(`Row ${idx}:`, r);
  }
});
