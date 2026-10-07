const XLSX = require('xlsx');
const wbEst = XLSX.readFile('C:/Users/alejandratesara/Desktop/Alejandra T/Costos Alejandra/Modelo_Estrella_Costos_TIMACA/Modelo_Estrella_Costos_TIMACA.xlsx');
const wsEst = wbEst.Sheets['Detalle_ManoDeObra'];
const rowsEst = XLSX.utils.sheet_to_json(wsEst, { range: 6 });

const wbMas = XLSX.readFile('C:/Users/alejandratesara/Desktop/Alejandra T/Costos Alejandra/1 Informe/4 Master Unificado.xlsx');
const wsMas = wbMas.Sheets['Unificada'];
const rowsMas = XLSX.utils.sheet_to_json(wsMas);

// Compare July and August MOD by account between Modelo Estrella and Master/Nuevas Tablas
const julEst = {}, agoEst = {};
rowsEst.forEach(r => {
  const m = String(r['Mes'] || '').toLowerCase();
  const c = String(r['Cuenta Auxiliar'] || '').trim();
  const val = Number(r['Total USD'] || 0);
  if (m === 'julio') julEst[c] = (julEst[c] || 0) + val;
  if (m === 'agosto') agoEst[c] = (agoEst[c] || 0) + val;
});

const julMas = {}, agoMas = {};
rowsMas.forEach(r => {
  if (!String(r['Tipo'] || '').includes('Mano de Obra Directa')) return;
  const m = String(r['Nombre del mes'] || '').toLowerCase();
  const c = String(r['Cuenta-Aux'] || '').trim();
  const val = Number(r['Total USD'] || 0);
  if (m === 'julio') julMas[c] = (julMas[c] || 0) + val;
  if (m === 'agosto') agoMas[c] = (agoMas[c] || 0) + val;
});

console.log('--- CUENTAS CON DIFERENCIA EN JULIO O AGOSTO ---');
const allC = new Set([...Object.keys(julEst), ...Object.keys(julMas), ...Object.keys(agoEst), ...Object.keys(agoMas)]);
allC.forEach(c => {
  const jE = julEst[c] || 0;
  const jM = julMas[c] || 0;
  const aE = agoEst[c] || 0;
  const aM = agoMas[c] || 0;
  const diffJ = jM - jE;
  const diffA = aM - aE;
  if (Math.abs(diffJ) > 1 || Math.abs(diffA) > 1) {
    console.log(`Cuenta: ${c} | Jul: Est=${jE.toFixed(2)}, Mas=${jM.toFixed(2)} (Diff: ${diffJ.toFixed(2)}) | Ago: Est=${aE.toFixed(2)}, Mas=${aM.toFixed(2)} (Diff: ${diffA.toFixed(2)})`);
  }
});
