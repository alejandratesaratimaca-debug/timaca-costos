const XLSX = require('xlsx');

const wb = XLSX.readFile('C:/Users/alejandratesara/Desktop/Alejandra T/Costos Alejandra/Modelo_Estrella_Costos_TIMACA/Modelo_Estrella_Costos_TIMACA.xlsx');
const ws = wb.Sheets['Detalle_ManoDeObra'];

// header is at row 7 (0-indexed line 6)
const rows = XLSX.utils.sheet_to_json(ws, { range: 6 });
console.log('Total data rows:', rows.length);

const staffRows = [];
const pellas1 = { enero: 0, febrero: 0, marzo: 0, abril: 0, mayo: 0, junio: 0, julio: 0, agosto: 0 };
const pellas2 = { enero: 0, febrero: 0, marzo: 0, abril: 0, mayo: 0, junio: 0, julio: 0, agosto: 0 };

rows.forEach((row, i) => {
  const cAux = String(row['Cuenta Auxiliar'] || '').trim();
  const mes = String(row['Mes'] || '').trim().toLowerCase();
  const costo = Number(row['Total USD'] || 0);
  const cargo = String(row['Cargo'] || '').trim();

  if (cargo.includes('STAFF')) {
    staffRows.push({ excelRow: i + 8, cAux, mes, costo, cargo, sem: row['Semana'] });
  }

  if (cAux === 'TTE-C-0706') {
    pellas1[mes] = (pellas1[mes] || 0) + costo;
  }
  if (cAux === 'TTE-C-0676') {
    pellas2[mes] = (pellas2[mes] || 0) + costo;
  }
});

console.log('\n--- STAFF ROWS IN MODELO ESTRELLA ---');
console.table(staffRows);

console.log('\n--- PELLAS LINEA 1 (TTE-C-0706) MOD BY MONTH ---');
console.table(pellas1);
const tot1 = Object.values(pellas1).reduce((a, b) => a + b, 0);
console.log('Total Pellas Línea 1 MOD:', tot1.toFixed(2));

console.log('\n--- PELLAS LINEA 2 (TTE-C-0676) MOD BY MONTH ---');
console.table(pellas2);
const tot2 = Object.values(pellas2).reduce((a, b) => a + b, 0);
console.log('Total Pellas Línea 2 MOD:', tot2.toFixed(2));
