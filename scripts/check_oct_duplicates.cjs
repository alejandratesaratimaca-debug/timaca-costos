const fs = require('fs');

const octData = JSON.parse(fs.readFileSync('public/data/sip/unificada_octubre.json', 'utf8'));
const ids = new Map();
const duplicates = [];

for (const r of octData.items) {
  const k = r.id != null ? String(r.id) : `${r.numero}-${r.codigo}`;
  if (ids.has(k)) {
    duplicates.push({ k, r1: ids.get(k), r2: r });
  } else {
    ids.set(k, r);
  }
}

console.log('Total items in unificada_octubre:', octData.items.length);
console.log('Duplicate IDs found in unificada_octubre:', duplicates.length);
if (duplicates.length > 0) {
  console.log('Sample duplicates:', duplicates.slice(0, 3));
}

// Check by documento / numero
const docs = new Map();
const docDupes = [];
for (const r of octData.items) {
  const doc = r.numero;
  if (!doc) continue;
  const k = `${doc}-${r.codigo}`;
  if (docs.has(k)) {
    docDupes.push({ k, r1: docs.get(k), r2: r });
  } else {
    docs.set(k, r);
  }
}
console.log('Duplicate (documento + codigo) in unificada_octubre:', docDupes.length);

// Also check total sum
const totalUSD = octData.items.reduce((s, r) => s + (Number(r.total_usd) || 0), 0);
console.log('Sum of total_usd in unificada_octubre:', totalUSD.toFixed(2));
console.log('Official gran_total stored in header:', octData.totales.gran_total);
