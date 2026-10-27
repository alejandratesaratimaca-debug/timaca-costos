const fs = require('fs');
const XLSX = require('xlsx');

// Let's verify what the prorrateo by active accounts in September should look like
const excelPath = 'C:/Users/alejandratesara/Desktop/Alejandra T/Costos Alejandra/Consolidado_Oficial_2026_Limpio.xlsx';
const wb = XLSX.readFile(excelPath);
const data = XLSX.utils.sheet_to_json(wb.Sheets['Detalle Transacciones']);

// Get MOD in September for all active TTE accounts
const modSep = {};
let totalModSep = 0;
data.filter(r => r.Mes === 'Septiembre' && r.Tipo === 'Mano de Obra Directa' && (r.Cuenta_Auxiliar || '').startsWith('TTE-C-')).forEach(r => {
  const cta = r.Cuenta_Auxiliar;
  const val = Number(r.Monto_USD) || 0;
  modSep[cta] = (modSep[cta] || 0) + val;
  totalModSep += val;
});

console.log('=== MOD Septiembre by Project ===');
console.log('Total MOD Sep:', totalModSep.toFixed(2));
for (const [cta, val] of Object.entries(modSep).sort((a,b) => b[1] - a[1])) {
  const pct = (val / totalModSep) * 100;
  console.log(`${cta}: $${val.toFixed(2)} (${pct.toFixed(2)}%)`);
}
