import XLSX from 'xlsx';

const fp = 'C:\\Users\\alejandratesara\\Desktop\\Alejandra T\\Costos Alejandra\\1 Informe\\4 Master Unificado.xlsx';
const wb = XLSX.readFile(fp);
const ws = wb.Sheets['Unificada'];
const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

const header = data[0];
console.log('Headers en Unificada:');
header.forEach((h, i) => console.log(`Col ${i}: ${h}`));

[97653, 97654, 97655, 97656].forEach(idx => {
  const r = data[idx];
  console.log(`\n=== Fila ${idx} ===`);
  header.forEach((h, i) => {
    if (r[i] !== null && r[i] !== undefined && r[i] !== '') {
      console.log(`  [${i}] ${h}: ${r[i]}`);
    }
  });
});
