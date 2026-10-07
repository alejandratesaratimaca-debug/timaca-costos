const XLSX = require('xlsx');

const wb = XLSX.readFile('C:/Users/alejandratesara/Desktop/Alejandra T/Costos Alejandra/1 Informe/1 Base Central Inputs.xlsx');
const ws = wb.Sheets['3 Mano de obra'];

if (!ws) {
  console.log('3 Mano de obra not found!');
  process.exit(1);
}

const rows = XLSX.utils.sheet_to_json(ws);
console.log('Total rows in 3 Mano de obra:', rows.length);

const staffRows = [];
const pellas1 = { enero: 0, febrero: 0, marzo: 0, abril: 0, mayo: 0, junio: 0, julio: 0, agosto: 0 };
const pellas2 = { enero: 0, febrero: 0, marzo: 0, abril: 0, mayo: 0, junio: 0, julio: 0, agosto: 0 };

rows.forEach((row, i) => {
  const cAux = String(row['Cuenta Auxiliar'] || row['Cuenta auxiliar'] || '').trim();
  const mes = String(row['Mes'] || '').trim().toLowerCase();
  const costo = Number(row['Monto USD'] || row['Costo USD'] || row['Total USD'] || 0);
  const cargo = String(row['Cargo'] || '').trim();

  if (cargo.includes('STAFF')) {
    staffRows.push({ excelRow: i + 2, cAux, mes, costo, cargo, sem: row['Semana'] });
  }

  if (cAux === 'TTE-C-0706') {
    pellas1[mes] = (pellas1[mes] || 0) + costo;
  }
  if (cAux === 'TTE-C-0676') {
    pellas2[mes] = (pellas2[mes] || 0) + costo;
  }
});

console.log('\n--- STAFF ROWS IN 1 BASE CENTRAL INPUTS ---');
console.table(staffRows);

console.log('\n--- PELLAS LINEA 1 (TTE-C-0706) MOD BY MONTH ---');
console.table(pellas1);
const tot1 = Object.values(pellas1).reduce((a, b) => a + b, 0);
console.log('Total Pellas Línea 1 MOD:', tot1.toFixed(2));

console.log('\n--- PELLAS LINEA 2 (TTE-C-0676) MOD BY MONTH ---');
console.table(pellas2);
const tot2 = Object.values(pellas2).reduce((a, b) => a + b, 0);
console.log('Total Pellas Línea 2 MOD:', tot2.toFixed(2));
