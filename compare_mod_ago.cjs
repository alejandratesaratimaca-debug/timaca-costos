const XLSX = require('xlsx');

const pathNuevas = 'C:/Users/alejandratesara/Desktop/Alejandra T/Costos Alejandra/1 Informe/Nuevas Tablas Informesssssssssssss.xlsx';
const pathEstrella = 'C:/Users/alejandratesara/Desktop/Alejandra T/Costos Alejandra/Modelo_Estrella_Costos_TIMACA/Modelo_Estrella_Costos_TIMACA.xlsx';

const wbNuevas = XLSX.readFile(pathNuevas);
const wbEstrella = XLSX.readFile(pathEstrella);

// In Modelo Estrella, Detalle_ManoDeObra
const wsMdoEstrella = wbEstrella.Sheets['Detalle_ManoDeObra'];
const rowsEstrella = XLSX.utils.sheet_to_json(wsMdoEstrella, { range: 6 });
const agoEstrella = {};
rowsEstrella.forEach(r => {
  if (String(r['Mes'] || '').toLowerCase() === 'agosto') {
    const cAux = String(r['Cuenta Auxiliar'] || '').trim();
    const costo = Number(r['Total USD'] || 0);
    agoEstrella[cAux] = (agoEstrella[cAux] || 0) + costo;
  }
});

// In Nuevas Tablas, let's look at 4 Master Unificado or MDO Directa
const pathMaster = 'C:/Users/alejandratesara/Desktop/Alejandra T/Costos Alejandra/1 Informe/4 Master Unificado.xlsx';
const wbMaster = XLSX.readFile(pathMaster);
const wsMaster = wbMaster.Sheets['Unificada'];
const rowsMaster = XLSX.utils.sheet_to_json(wsMaster);
const agoMaster = {};
rowsMaster.forEach(r => {
  if (String(r['Nombre del mes'] || '').toLowerCase() === 'agosto' && String(r['Tipo'] || '').includes('Mano de Obra Directa')) {
    const cAux = String(r['Cuenta-Aux'] || '').trim();
    const costo = Number(r['Total USD'] || 0);
    agoMaster[cAux] = (agoMaster[cAux] || 0) + costo;
  }
});

console.log('--- COMPARACION MOD AGOSTO POR CUENTA AUXILIAR ---');
const allKeys = new Set([...Object.keys(agoEstrella), ...Object.keys(agoMaster)]);
const comp = [];
let totEst = 0, totMas = 0;
allKeys.forEach(k => {
  const e = agoEstrella[k] || 0;
  const m = agoMaster[k] || 0;
  totEst += e;
  totMas += m;
  if (Math.abs(e - m) > 0.01 || true) {
    comp.push({ Cuenta: k, ModeloEstrella: e.toFixed(2), MasterUnificado_NuevasTablas: m.toFixed(2), Diff: (m - e).toFixed(2) });
  }
});

console.table(comp);
console.log('Total Modelo Estrella MOD Agosto:', totEst.toFixed(2));
console.log('Total Master/Nuevas Tablas MOD Agosto:', totMas.toFixed(2));
