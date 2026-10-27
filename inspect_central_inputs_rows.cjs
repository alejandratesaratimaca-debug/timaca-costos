const xlsx = require('./node_modules/xlsx');

console.log('=== INSPECCIÓN DETALLADA DE 1 Base Central Inputs.xlsx (Hoja 2 Compras) ===');
const wbCentral = xlsx.readFile('C:/Users/alejandratesara/Desktop/Alejandra T/Costos Alejandra/1 Informe/1 Base Central Inputs.xlsx');
const sheetCompras = wbCentral.Sheets['2 Compras'];
const dataCompras = xlsx.utils.sheet_to_json(sheetCompras, { header: 1 });

const headersCompras = dataCompras[0];
console.log('Cabeceras en [2 Compras]:');
headersCompras.forEach((h, i) => console.log(`  Col ${i}: ${h}`));

console.log('\n--- FILA 285 (SC26299) en [2 Compras] ---');
const row285 = dataCompras[284]; // index 284 is fila 285
headersCompras.forEach((h, i) => {
  if (row285[i] !== undefined) console.log(`  ${h}: ${row285[i]}`);
});

console.log('\n--- FILA 277 (SC25774) en [2 Compras] ---');
const row277 = dataCompras[276];
headersCompras.forEach((h, i) => {
  if (row277[i] !== undefined) console.log(`  ${h}: ${row277[i]}`);
});

console.log('\n--- FILA 2424 (SC25795 Baños PMH) en [2 Compras] ---');
const row2424 = dataCompras[2423];
headersCompras.forEach((h, i) => {
  if (row2424[i] !== undefined) console.log(`  ${h}: ${row2424[i]}`);
});
