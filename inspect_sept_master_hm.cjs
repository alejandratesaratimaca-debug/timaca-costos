const xlsx = require('xlsx');

const masterPath = 'C:/Users/alejandratesara/Desktop/Alejandra T/Costos Alejandra/1 Informe/4 Master Unificado.xlsx';
const wb = xlsx.readFile(masterPath);
const ws = wb.Sheets['Unificada'];

const range = xlsx.utils.decode_range(ws['!ref']);

// Let's find rows with HM in September and inspect columns
const septHmRows = [];

for (let r = 1; r <= range.e.r; r++) {
  const tipoCell = ws[xlsx.utils.encode_cell({ r, c: 0 })]; // Tipo
  const tipoVal = tipoCell ? String(tipoCell.v).trim().toLowerCase() : '';
  const mesCell = ws[xlsx.utils.encode_cell({ r, c: 39 })]; // Nombre del mes
  const mesVal = mesCell ? String(mesCell.v).trim().toLowerCase() : '';

  if (tipoVal.includes('maquina') && mesVal === 'septiembre') {
    const rowObj = {};
    for (let c = 0; c <= range.e.c; c++) {
      const cell = ws[xlsx.utils.encode_cell({ r, c })];
      if (cell && cell.v !== undefined) {
        rowObj[`col_${c}`] = cell.v;
      }
    }
    septHmRows.push(rowObj);
  }
}

console.log(`Found ${septHmRows.length} September HM rows in Master Unificado.`);
if (septHmRows.length > 0) {
  // Let's inspect columns for row 0 and row with 0 or Item 333 / 334
  console.log('Sample row col keys:', Object.keys(septHmRows[0]));
  // Let's print first 3 rows and last 3 rows
  septHmRows.slice(0, 3).forEach((r, i) => console.log(`Row ${i}:`, JSON.stringify(r)));
  septHmRows.slice(-3).forEach((r, i) => console.log(`Last Row ${i}:`, JSON.stringify(r)));
}
