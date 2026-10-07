const XLSX = require('xlsx');

const pathBase = 'C:/Users/alejandratesara/Desktop/Alejandra T/Costos Alejandra/1 Informe/1 Base Central Inputs.xlsx';
const wbBase = XLSX.readFile(pathBase, { dense: true });
const ws = wbBase.Sheets['3 Mano de obra'];
const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

console.log('=== Checking 1 Base Central Inputs: 3 Mano de obra ===');
console.log('Total rows:', data.length);
console.log('Header:', data[0]);

// Look for Cta Auxiliar column (index 9 in data[0]), Monto (index 15 or 10), Fecha (index 2 or 3), Semana (index 1)
// Let's inspect data[0] columns
data[0].forEach((col, idx) => console.log(`Col ${idx}: ${col}`));

// Inspect rows for TTE-C-0706 and TTE-C-0676
const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre'];

// Function to convert Excel serial to Date
function excelDateToMonth(serial) {
  if (!serial || typeof serial !== 'number') return 'DESCONOCIDO';
  const d = new Date((serial - 25569) * 86400 * 1000);
  return months[d.getUTCMonth()] || 'OTRO';
}

const summary0706 = {};
const summary0676 = {};

for (let i = 1; i < data.length; i++) {
  const row = data[i];
  if (!row) continue;
  const cta = String(row[9] || '').trim();
  const monto = parseFloat(row[15]) || parseFloat(row[10]) || 0;
  const cargo = String(row[6] || '').trim();
  const worker = String(row[5] || '').trim();
  const sem = row[1];
  const fecha = row[2];
  const m = excelDateToMonth(fecha);

  const isStaff = cargo.toUpperCase().includes('STAFF') || worker.toUpperCase().includes('HONORARIOS');

  if (cta === 'TTE-C-0706') {
    if (!summary0706[m]) summary0706[m] = { obreros: 0, staff: 0, countObreros: 0, countStaff: 0, details: [] };
    if (isStaff) {
      summary0706[m].staff += monto;
      summary0706[m].countStaff++;
      summary0706[m].details.push({ row: i, sem, fecha, worker, cargo, monto });
    } else {
      summary0706[m].obreros += monto;
      summary0706[m].countObreros++;
    }
  }

  if (cta === 'TTE-C-0676') {
    if (!summary0676[m]) summary0676[m] = { obreros: 0, staff: 0, countObreros: 0, countStaff: 0, details: [] };
    if (isStaff) {
      summary0676[m].staff += monto;
      summary0676[m].countStaff++;
      summary0676[m].details.push({ row: i, sem, fecha, worker, cargo, monto });
    } else {
      summary0676[m].obreros += monto;
      summary0676[m].countObreros++;
    }
  }
}

console.log('\n--- Summary TTE-C-0706 (Pellas Línea 1) ---');
for (const m in summary0706) {
  console.log(`Month [${m}]: Obreros = $${summary0706[m].obreros.toFixed(2)} (${summary0706[m].countObreros} recs) | Staff = $${summary0706[m].staff.toFixed(2)} (${summary0706[m].countStaff} recs) | Total = $${(summary0706[m].obreros + summary0706[m].staff).toFixed(2)}`);
  if (summary0706[m].details.length > 0) {
    console.log('   Staff details:', summary0706[m].details);
  }
}

console.log('\n--- Summary TTE-C-0676 (Pellas Línea 2) ---');
for (const m in summary0676) {
  console.log(`Month [${m}]: Obreros = $${summary0676[m].obreros.toFixed(2)} (${summary0676[m].countObreros} recs) | Staff = $${summary0676[m].staff.toFixed(2)} (${summary0676[m].countStaff} recs) | Total = $${(summary0676[m].obreros + summary0676[m].staff).toFixed(2)}`);
}
