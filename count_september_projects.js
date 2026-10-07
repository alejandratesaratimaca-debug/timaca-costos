const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'data', 'realSalidasSeptiembre2026.ts');
const content = fs.readFileSync(filePath, 'utf8');

const cuentaMatches = content.matchAll(/cuentaAuxiliarCodigo:\s*'([^']+)'/g);
const proyectoMatches = content.matchAll(/proyecto:\s*'([^']+)'/g);

const cuentas = new Set();
for (const m of cuentaMatches) {
  cuentas.add(m[1]);
}

const proyectos = new Set();
for (const m of proyectoMatches) {
  proyectos.add(m[1]);
}

console.log('Distinct cuentas auxiliares in realSalidasSeptiembre2026:', cuentas.size);
console.log('Distinct proyectos in realSalidasSeptiembre2026:', proyectos.size);
console.log('List of cuentas:', Array.from(cuentas).sort());
