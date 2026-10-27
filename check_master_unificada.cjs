const xlsx = require('xlsx');

const masterPath = 'C:/Users/alejandratesara/Desktop/Alejandra T/Costos Alejandra/1 Informe/4 Master Unificado.xlsx';
console.log('Reading 4 Master Unificado.xlsx (this may take a few seconds)...');
const wb = xlsx.readFile(masterPath);
console.log('Sheet names:', wb.SheetNames);

const ws = wb.Sheets['Unificada'];
if (ws) {
  // Let's inspect headers
  const range = xlsx.utils.decode_range(ws['!ref']);
  console.log(`Unificada range: ${ws['!ref']}, total rows: ${range.e.r + 1}`);

  // Let's read row 1 (headers)
  const headers = [];
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const cell = ws[xlsx.utils.encode_cell({ r: 0, c: C })];
    headers.push(cell ? cell.v : `col_${C}`);
  }
  console.log('Headers:', headers);

  // Let's see what unique values exist for Tipo (or similar column)
  const tipoColIdx = headers.findIndex(h => String(h).toLowerCase().includes('tipo') || String(h).toLowerCase().includes('origen') || String(h).toLowerCase().includes('categoria'));
  console.log('tipoColIdx:', tipoColIdx, headers[tipoColIdx]);
}
