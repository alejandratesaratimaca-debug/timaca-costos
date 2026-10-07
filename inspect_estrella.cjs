const XLSX = require('xlsx');

const pathEstrella = 'C:/Users/alejandratesara/Desktop/Alejandra T/Costos Alejandra/Modelo_Estrella_Costos_TIMACA/Modelo_Estrella_Costos_TIMACA.xlsx';
const wb = XLSX.readFile(pathEstrella, { dense: true });

console.log('=== SHEETS IN MODELO ESTRELLA ===');
wb.SheetNames.forEach(name => {
  const ws = wb.Sheets[name];
  console.log(`Sheet: "${name}" -> range: ${ws['!ref']}`);
});

function inspectSheet(name, start = 0, count = 20) {
  console.log(`\n=================== [${name}] ===================`);
  const ws = wb.Sheets[name];
  if (!ws) { console.log('Not found'); return; }
  const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
  console.log(`Total rows: ${data.length}`);
  data.slice(start, start + count).forEach((r, idx) => {
    if (r && r.length > 0) {
      const s = r.map(x => (x !== undefined && x !== null ? String(x).trim() : '')).filter(x => x !== '').join(' | ');
      if (s.length > 0) console.log(`R${start + idx}: ${s}`);
    }
  });
}

inspectSheet('Inicio', 0, 15);
inspectSheet('Tablero_Ejecutivo_2026', 0, 20);
inspectSheet('Detalle_Proyectos_2026', 0, 30);
inspectSheet('Fact_Ajustes_Auditoria', 0, 25);
