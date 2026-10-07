const fs = require('fs');

const mockFile = fs.readFileSync('src/data/mockCostosTimaca.ts', 'utf8');
const pStart = mockFile.indexOf('export const CUENTAS_AUXILIARES_EXACTAS_AGOSTO_2026');
const pEnd = mockFile.indexOf('];', pStart);
const arrayStr = mockFile.substring(pStart + 'export const CUENTAS_AUXILIARES_EXACTAS_AGOSTO_2026: CuentaAuxiliarProyecto[] = '.length, pEnd + 1);
const proyectos20 = eval(arrayStr);

console.log('Total proyectos oficiales 20:', proyectos20.length);

// Read realSalidasUnificada2026.ts
const salidasFile = fs.readFileSync('src/data/realSalidasUnificada2026.ts', 'utf8');
const itemRegex = /"cuentaAuxiliarCodigo":\s*"([^"]+)",[\s\S]*?"proyecto":\s*"([^"]+)",[\s\S]*?"tipo":\s*"([^"]+)",[\s\S]*?"categoria":\s*"([^"]+)"/g;

let m;
const srvCtas = new Set();
const srvProyectos = new Set();
while ((m = itemRegex.exec(salidasFile)) !== null) {
  const cta = m[1];
  const pry = m[2];
  const tipo = m[3];
  const cat = m[4];
  if (tipo.includes('Servicio') || cat.includes('Servicio') || cat === 'SERVICIOS') {
    srvCtas.add(cta);
    srvProyectos.add(pry);
  }
}

console.log('Distinct ctas with Servicios in salidas:', srvCtas.size);
console.log('Ctas found:', Array.from(srvCtas));

console.log('Distinct proyectos with Servicios in salidas:', srvProyectos.size);
console.log('Proyectos found:', Array.from(srvProyectos));

// Missing from the 20 official projects:
const missing = proyectos20.filter(p => !srvCtas.has(p.cuentaAuxiliar));
console.log('\nMissing from 20 official projects (Count: ' + missing.length + '):');
missing.forEach(p => console.log(`  - [${p.cuentaAuxiliar}] ${p.proyectoCorto}: Total mes = $${p.montoAgosto}`));
