const fs = require('fs');

const sepContent = fs.readFileSync('src/data/realSalidasSeptiembre2026.ts', 'utf8');
const eqSep = sepContent.indexOf('=');
const sepRecords = JSON.parse(sepContent.substring(sepContent.indexOf('[', eqSep), sepContent.lastIndexOf(']') + 1));

const byTipoZeros = {};
sepRecords.filter(r => (r.montoTotal === 0 || r.cantidad === 0)).forEach(r => {
  byTipoZeros[r.tipo] = (byTipoZeros[r.tipo] || 0) + 1;
});

console.log('Zeros by Tipo in realSalidasSeptiembre2026:', byTipoZeros);

// Check Consolidado_Oficial_2026_Limpio.xlsx
const XLSX = require('xlsx');
const wb = XLSX.readFile('C:/Users/alejandratesara/Desktop/Alejandra T/Costos Alejandra/Consolidado_Oficial_2026_Limpio.xlsx');
const excelRows = XLSX.utils.sheet_to_json(wb.Sheets['Detalle Transacciones']);

const excelZeros = excelRows.filter(r => r.Tipo === 'Horas Maquina' && (Number(r.Monto_USD) === 0));
console.log('Zero HM in Consolidado_Oficial_2026_Limpio.xlsx:', excelZeros.length);
