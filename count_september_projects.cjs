const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'data', 'realSalidasSeptiembre2026.ts');
const content = fs.readFileSync(filePath, 'utf8');

const cuentaMatches = content.matchAll(/"cuentaAuxiliarCodigo":\s*"([^"]+)"/g);
const proyectoMatches = content.matchAll(/"proyecto":\s*"([^"]+)"/g);
const tipoMatches = content.matchAll(/"tipo":\s*"([^"]+)"/g);

const cuentas = new Map();
const tteCuentas = new Map();

for (const m of cuentaMatches) {
  const cod = m[1];
  cuentas.set(cod, (cuentas.get(cod) || 0) + 1);
  if (cod.startsWith('TTE-C-')) {
    tteCuentas.set(cod, (tteCuentas.get(cod) || 0) + 1);
  }
}

const proyectos = new Set();
for (const m of proyectoMatches) {
  proyectos.add(m[1]);
}

console.log('Total distinct cuentas auxiliares (all prefixes):', cuentas.size);
console.log('Total distinct TTE-C- (Proyectos Externos):', tteCuentas.size);
console.log('Distinct proyectos:', proyectos.size);
console.log('\nTTE-C- cuentas list with record counts:');
for (const [cod, count] of Array.from(tteCuentas.entries()).sort()) {
  console.log(`  ${cod}: ${count} salidas`);
}

console.log('\nOther cuentas prefix breakdown:');
const prefixes = {};
for (const cod of cuentas.keys()) {
  const pref = cod.substring(0, 5);
  prefixes[pref] = (prefixes[pref] || 0) + 1;
}
console.log(prefixes);
