const fs = require('fs');

const content = fs.readFileSync('src/data/realManoObraOctubre2026.ts', 'utf8');

// Extract all JSON-like objects
// Each object starts with { and ends with },
const lines = content.split('\n');
const records = [];
let current = null;

for (let line of lines) {
  line = line.trim();
  if (line.startsWith('{')) {
    current = {};
  } else if (line.startsWith('}')) {
    if (current && current.id) {
      records.push(current);
    }
    current = null;
  } else if (current && line.includes(':')) {
    const colonIdx = line.indexOf(':');
    let key = line.substring(0, colonIdx).trim().replace(/"/g, '');
    let val = line.substring(colonIdx + 1).trim().replace(/,$/, '');
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.substring(1, val.length - 1);
    } else if (!isNaN(Number(val))) {
      val = Number(val);
    }
    current[key] = val;
  }
}

console.log('Total records:', records.length);
const cedulas = new Set(records.map(r => r.cedula));
const nombres = new Set(records.map(r => String(r.trabajador || '').trim().toUpperCase()));
console.log('Cedulas unicas:', cedulas.size);
console.log('Nombres unicos:', nombres.size);

// Sums by project / cuenta
const sums = {};
const counts = {};
for (let r of records) {
  const c = r.cuentaAuxiliar || 'OTRO';
  sums[c] = (sums[c] || 0) + (Number(r.totalPagarUsd) || 0);
  counts[c] = (counts[c] || 0) + 1;
}

console.log('Sums by cuentaAuxiliar:');
for (let c of Object.keys(sums).sort()) {
  console.log(`  ${c}: $${sums[c].toFixed(2)} USD (${counts[c]} records)`);
}

const totalMonto = records.reduce((s, r) => s + (Number(r.totalPagarUsd) || 0), 0);
const totalHoras = records.reduce((s, r) => s + (Number(r.totalHoras) || 0), 0);
const totalExtras = records.reduce((s, r) => s + (Number(r.horasExtras) || 0), 0);
console.log(`Total Monto: $${totalMonto.toFixed(2)} USD`);
console.log(`Total Horas: ${totalHoras.toFixed(2)} hrs`);
console.log(`Total Extras: ${totalExtras.toFixed(2)} hrs`);
