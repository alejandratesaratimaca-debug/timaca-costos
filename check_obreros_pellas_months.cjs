const XLSX = require('xlsx');

const pathEstrella = 'C:/Users/alejandratesara/Desktop/Alejandra T/Costos Alejandra/Modelo_Estrella_Costos_TIMACA/Modelo_Estrella_Costos_TIMACA.xlsx';
const wb = XLSX.readFile(pathEstrella, { dense: true });
const ws = wb.Sheets['Detalle_ManoDeObra'];
const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre'];
const obreros0706 = {};

for (let i = 7; i < data.length; i++) {
  const row = data[i];
  if (!row) continue;
  const cta = String(row[3] || '').trim();
  const mes = String(row[1] || '').toLowerCase().trim();
  const cargo = String(row[7] || '').toUpperCase();
  const worker = String(row[6] || '').toUpperCase();
  const monto = parseFloat(row[10]) || 0;

  if (cta === 'TTE-C-0706') {
    const isStaff = cargo.includes('STAFF') || worker.includes('STAFF') || worker.includes('HONORARIOS');
    if (!isStaff) {
      if (!obreros0706[mes]) obreros0706[mes] = { total: 0, count: 0, cargos: {} };
      obreros0706[mes].total += monto;
      obreros0706[mes].count++;
      obreros0706[mes].cargos[cargo] = (obreros0706[mes].cargos[cargo] || 0) + monto;
    }
  }
}

console.log('=== Pellas Línea 1 (TTE-C-0706) - OBREROS DE CAMPO (Non-Staff) ===');
for (const m in obreros0706) {
  console.log(`\nMonth [${m}]: Total Obreros = $${obreros0706[m].total.toFixed(2)} USD (${obreros0706[m].count} registros)`);
  console.log('Top Cargos:', Object.entries(obreros0706[m].cargos).slice(0, 8));
}
