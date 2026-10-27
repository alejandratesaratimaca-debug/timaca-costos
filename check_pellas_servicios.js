import XLSX from 'xlsx';

const fp = 'C:\\Users\\alejandratesara\\Desktop\\Alejandra T\\Costos Alejandra\\1 Informe\\4 Master Unificado.xlsx';
const wb = XLSX.readFile(fp);
const ws = wb.Sheets['Unificada'];
const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

console.log('=== SERVICIOS EN TTE-C-0706 EN 4 MASTER UNIFICADO ===');
data.forEach((r, idx) => {
  const rowStr = JSON.stringify(r);
  if (r && r[0] === 'Servicios' && r[5] === 'TTE-C-0706') {
    console.log(`Fila ${idx}: Fecha=${r[2]}, SC=${r[3]}, OC=${r[4]}, Monto=${r[16]}, Desc=${r[8]}, Motivo=${r[11]}, Mes=${r[38]}, Ano=${r[37]}`);
  }
});
