const XLSX = require('xlsx');

function verifyFile(path, sname) {
  console.log(`\n=== Verifying [${sname}] in ${path} ===`);
  const wb = XLSX.readFile(path, { dense: true });
  const ws = wb.Sheets[sname];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
  for (let i = 0; i < data.length; i++) {
    const r = data[i];
    if (!r) continue;
    const s = JSON.stringify(r);
    if (s.includes('STAFF PELLAS') || s.includes('Honorarios Profesionales - Pellas')) {
      console.log(`Excel Row ${i + 1}:`, r);
    }
  }
}

verifyFile('C:/Users/alejandratesara/Desktop/Alejandra T/Costos Alejandra/1 Informe/1 Base Central Inputs.xlsx', '3 Mano de obra');
verifyFile('C:/Users/alejandratesara/Desktop/Alejandra T/Costos Alejandra/Modelo_Estrella_Costos_TIMACA/Modelo_Estrella_Costos_TIMACA.xlsx', 'Detalle_ManoDeObra');
