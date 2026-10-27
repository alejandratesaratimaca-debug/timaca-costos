const fs = require('fs');

const orphans = JSON.parse(fs.readFileSync('new_september_orphans.json', 'utf8'));
console.log(`Leídos ${orphans.length} registros para anexar.`);

const tsPath = 'src/data/realSalidasSeptiembre2026.ts';
let content = fs.readFileSync(tsPath, 'utf8');

// Encontrar el último '];'
const lastClosingBracket = content.lastIndexOf('];');
if (lastClosingBracket === -1) {
  throw new Error('No se encontró el cierre ];');
}

// Formatear los nuevos registros
const newRecordsString = orphans.map(r => `  ,\n` + JSON.stringify(r, null, 4).split('\n').map(l => '  ' + l).join('\n')).join('\n');

const updatedContent = content.substring(0, lastClosingBracket) + newRecordsString + '\n];\n';

fs.writeFileSync(tsPath, updatedContent, 'utf8');
console.log(`Actualizado ${tsPath} con éxito.`);
