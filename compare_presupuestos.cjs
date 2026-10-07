const fs = require('fs');
const XLSX = require('xlsx');

console.log('Comparing Presupuestos.xlsx with presupuestosOficiales.ts...');
const p = 'C:/Users/alejandratesara/Desktop/Alejandra T/Costos Alejandra/Modelo_Estrella_Costos_TIMACA/Presupuestos.xlsx';
const wb = XLSX.readFile(p);
const sheet = wb.Sheets['Presupuestos'];
const pData = XLSX.utils.sheet_to_json(sheet);

console.log('Total rows in Presupuestos.xlsx:', pData.length);
let totalPresupuestoExcel = 0;
pData.forEach(r => {
  const tot = Number(r['Total']) || 0;
  totalPresupuestoExcel += tot;
});
console.log('Total Presupuesto in Excel:', Math.round(totalPresupuestoExcel).toLocaleString('de-DE'));

// Compare with presupuestosOficiales.ts
const pFile = fs.readFileSync('src/data/presupuestosOficiales.ts', 'utf8');
const match = pFile.match(/export const PRESUPUESTOS_OFICIALES_TIMACA: PresupuestoProyecto\[\] = (\[[\s\S]+?\]);/);
if (match) {
  const pList = eval('(' + match[1] + ')');
  console.log('Total projects in presupuestosOficiales.ts:', pList.length);
  let totalTs = 0;
  pList.forEach(p => { totalTs += p.totalPresupuesto; });
  console.log('Total Presupuesto in TS:', Math.round(totalTs).toLocaleString('de-DE'));
  console.log('Diff:', Math.round(totalPresupuestoExcel - totalTs));
}
