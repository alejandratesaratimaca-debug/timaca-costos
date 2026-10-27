const path = require('path');
const xlsx = require(path.join(__dirname, 'node_modules', 'xlsx'));

console.log('--- BUSCANDO EN 4 Master Unificado.xlsx ---');
const wb = xlsx.readFile('C:/Users/alejandratesara/Desktop/Alejandra T/Costos Alejandra/1 Informe/4 Master Unificado.xlsx');
console.log('Hojas disponibles:', wb.SheetNames);
const sheet = wb.Sheets['Unificada'];
const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });
console.log('Total filas en Unificada:', rows.length);

const headers = rows[0];
console.log('Cabeceras:', headers);

const pellasServices = [];
for (let i = 1; i < rows.length; i++) {
  const row = rows[i];
  const rowStr = JSON.stringify(row);
  if (rowStr && (rowStr.includes('SC25774') || rowStr.includes('SC26299') || rowStr.includes('SC25773') || (rowStr.includes('TTE-C-0706') && (rowStr.includes('Servicio') || rowStr.includes('SERVICIO'))))) {
    pellasServices.push({ filaIdx: i + 1, row });
  }
}

console.log(`Encontrados ${pellasServices.length} registros relevantes:`);
for (const item of pellasServices) {
  console.log(`Fila ${item.filaIdx}:`, item.row);
}
