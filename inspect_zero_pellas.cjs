const xlsx = require('xlsx');

const filePath = 'C:/Users/alejandratesara/Desktop/Alejandra T/Costos Alejandra/3 Inputs/4 Horas Maquina/HM/2026 Septiembre Pellas.xlsx';
const wb = xlsx.readFile(filePath);
const ws = wb.Sheets['BD_Horas_Maq'];
const rows = xlsx.utils.sheet_to_json(ws, { header: 1 });

const headers = rows[4];
console.log('Headers:', headers);

const dataRows = rows.slice(5).filter(r => r && r[0] !== undefined);
console.log(`Total data rows: ${dataRows.length}`);

// Find rows where Horas de Op Total (column 11 or 12) is 0 or empty
dataRows.forEach((r, idx) => {
  const itemNum = r[0];
  const fecha = r[1];
  const actividad = r[2];
  const tiempoTotal = r[5];
  const cuentaAux = r[6];
  const numEq = r[7];
  const equipo = r[8];
  const horoIni = r[9];
  const horoFin = r[10];
  const horasOp = r[11];
  const combustible = r[12];
  const operador = r[13];

  if (Number(horasOp) === 0 || horasOp === null || horasOp === undefined) {
    console.log(`[ZERO ROW] Item: ${itemNum}, Fecha: ${fecha}, Eq: ${numEq} - ${equipo}, HorasOp: ${horasOp}, Actividad: "${actividad}", Operador: "${operador}"`);
  }
});
