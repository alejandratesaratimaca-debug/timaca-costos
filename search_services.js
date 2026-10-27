import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

const searchFiles = [
  'C:\\Users\\alejandratesara\\Downloads\\Servicios-Ejecutados (3).xlsx',
  'C:\\Users\\alejandratesara\\Downloads\\Servicios-Ejecutados (2).xlsx',
  'C:\\Users\\alejandratesara\\Downloads\\Servicios-Ejecutados.xlsx',
  'C:\\Users\\alejandratesara\\Desktop\\Alejandra T\\Costos Alejandra\\1 Informe\\1 Base Central Inputs.xlsx',
  'C:\\Users\\alejandratesara\\Desktop\\Alejandra T\\Costos Alejandra\\1 Informe\\4 Master Unificado.xlsx'
];

searchFiles.forEach(fp => {
  if (fs.existsSync(fp)) {
    try {
      console.log(`\n=== Buscando en: ${fp} ===`);
      const wb = XLSX.readFile(fp);
      wb.SheetNames.forEach(sheetName => {
        const ws = wb.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
        data.forEach((row, idx) => {
          const rowStr = JSON.stringify(row);
          if (rowStr.includes('SC26299') || rowStr.includes('SC25773') || rowStr.includes('SC25774') || rowStr.includes('TRANSVEN')) {
            console.log(`[${sheetName}] Fila ${idx}:`, rowStr);
          }
        });
      });
    } catch (e) {
      console.log(`Error leyendo ${fp}:`, e.message);
    }
  } else {
    console.log(`No existe: ${fp}`);
  }
});
