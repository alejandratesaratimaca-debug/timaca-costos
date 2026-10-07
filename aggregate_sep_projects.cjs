const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'data', 'realSalidasSeptiembre2026.ts');
const content = fs.readFileSync(filePath, 'utf8');

// Parse items
const records = [];
const itemRegex = /\{[^{}]*"cuentaAuxiliarCodigo":\s*"([^"]+)"[^{}]*"cuentaAuxiliarNombre":\s*"([^"]+)"[^{}]*"proyecto":\s*"([^"]+)"[^{}]*"tipo":\s*"([^"]+)"[^{}]*"montoTotal":\s*([\d.]+)[^{}]*\}/gs;

// Alternative: let's load or parse JSON-like objects
const lines = content.split('\n');
let cur = {};
for (const line of lines) {
  const mId = line.match(/"id":\s*"([^"]+)"/);
  if (mId) { cur = { id: mId[1] }; }
  const mCod = line.match(/"cuentaAuxiliarCodigo":\s*"([^"]+)"/);
  if (mCod) { cur.cuentaAuxiliarCodigo = mCod[1]; }
  const mNom = line.match(/"cuentaAuxiliarNombre":\s*"([^"]+)"/);
  if (mNom) { cur.cuentaAuxiliarNombre = mNom[1]; }
  const mProy = line.match(/"proyecto":\s*"([^"]+)"/);
  if (mProy) { cur.proyecto = mProy[1]; }
  const mTipo = line.match(/"tipo":\s*"([^"]+)"/);
  if (mTipo) { cur.tipo = mTipo[1]; }
  const mTotal = line.match(/"montoTotal":\s*([\d.]+)/);
  if (mTotal) { cur.montoTotal = parseFloat(mTotal[1]); }
  if (line.trim() === '},' || line.trim() === '}') {
    if (cur.cuentaAuxiliarCodigo) {
      records.push(cur);
    }
    cur = {};
  }
}

console.log('Parsed records:', records.length);

const projectMap = new Map();
let totalTTE = 0;
let totalGeneral = 0;

for (const r of records) {
  const cod = r.cuentaAuxiliarCodigo || 'SIN_CUENTA';
  totalGeneral += r.montoTotal || 0;
  
  if (cod.startsWith('TTE-C-')) {
    totalTTE += r.montoTotal || 0;
    const curP = projectMap.get(cod) || {
      cuentaAuxiliar: cod,
      proyecto: r.cuentaAuxiliarNombre || r.proyecto,
      salidasCount: 0,
      montoTotal: 0
    };
    curP.salidasCount++;
    curP.montoTotal += (r.montoTotal || 0);
    projectMap.set(cod, curP);
  }
}

console.log('Total general salidas Sep:', totalGeneral);
console.log('Total TTE-C- salidas Sep:', totalTTE);
console.log('Total TTE-C- projects count:', projectMap.size);

const sorted = Array.from(projectMap.values()).sort((a, b) => b.montoTotal - a.montoTotal);

console.log('\nAll 25 TTE-C- Projects in September 2026:');
sorted.forEach((p, i) => {
  const pct = (p.montoTotal / 1041504) * 100;
  console.log(`${(i+1).toString().padStart(2)}. ${p.cuentaAuxiliar}: ${p.proyecto} | $${Math.round(p.montoTotal).toLocaleString('de-DE')} (${pct.toFixed(2)}%) | ${p.salidasCount} salidas`);
});
