const fs = require('fs');
const content = fs.readFileSync('C:/Users/alejandratesara/.gemini/antigravity/scratch/workspace-explorer/src/data/realUnificadaAugust2026.ts', 'utf8');

// Count occurrences
const counts = {
  capex: (content.match(/Proyectos Internos \(CAPEX\)/g) || []).length,
  flota: (content.match(/Mantto Flota \(OPEX\)/g) || []).length,
  infra: (content.match(/Mantto Infraestructura \(OPEX\)/g) || []).length,
  gruas: (content.match(/Mantto Gruas/g) || []).length,
};
console.log('August unificada counts:', counts);

// Look at a sample record
const regex = /\{[^{}]*?"tipoCosto":\s*"(Proyectos Internos \(CAPEX\)|Mantto Flota \(OPEX\)|Mantto Infraestructura \(OPEX\))"[^{}]*?\}/g;
let m;
let sampleCount = 0;
while ((m = regex.exec(content)) !== null && sampleCount < 3) {
  sampleCount++;
  console.log(`Sample ${sampleCount}:`, m[0]);
}
