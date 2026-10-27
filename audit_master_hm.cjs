const xlsx = require('xlsx');

const masterPath = 'C:/Users/alejandratesara/Desktop/Alejandra T/Costos Alejandra/1 Informe/4 Master Unificado.xlsx';
console.log('Reading 4 Master Unificado.xlsx...');
const wb = xlsx.readFile(masterPath);
const ws = wb.Sheets['Unificada'];

const range = xlsx.utils.decode_range(ws['!ref']);
console.log('Rows:', range.e.r + 1);

// We want to find Horas Maquina rows across the whole sheet
let hmCount = 0;
let hmZeroCount = 0;
let hmSeptCount = 0;
let hmSeptZero = 0;
const monthsHM = {};

for (let r = 1; r <= range.e.r; r++) {
  const tipoCell = ws[xlsx.utils.encode_cell({ r, c: 0 })]; // Tipo
  const tipoVal = tipoCell ? String(tipoCell.v).trim() : '';

  if (tipoVal.toLowerCase().includes('maquina') || tipoVal.toLowerCase().includes('hora')) {
    hmCount++;
    const mesCell = ws[xlsx.utils.encode_cell({ r, c: 39 })]; // Nombre del mes
    const mesVal = mesCell ? String(mesCell.v).trim().toLowerCase() : 'desconocido';
    monthsHM[mesVal] = (monthsHM[mesVal] || 0) + 1;

    const cantCell = ws[xlsx.utils.encode_cell({ r, c: 9 })]; // Cantidad
    const cantVal = cantCell ? Number(cantCell.v) : 0;
    const tiempoCell = ws[xlsx.utils.encode_cell({ r, c: 25 })]; // TIEMPO TOTAL
    const tiempoVal = tiempoCell ? Number(tiempoCell.v) : 0;

    const isZero = (cantVal === 0 && tiempoVal === 0);
    if (isZero) hmZeroCount++;

    if (mesVal === 'septiembre') {
      hmSeptCount++;
      if (isZero) hmSeptZero++;
    }
  }
}

console.log(`Total HM rows in Unificada: ${hmCount}`);
console.log(`Total HM rows with zero: ${hmZeroCount}`);
console.log(`HM breakdown by month:`, monthsHM);
console.log(`September HM total: ${hmSeptCount}, zeros: ${hmSeptZero}`);
