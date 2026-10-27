const fs = require('fs');

function checkFile(path, name) {
  if (!fs.existsSync(path)) {
    console.log(`${name}: File does not exist (${path})`);
    return;
  }
  const content = fs.readFileSync(path, 'utf8');
  const hmCount = (content.match(/"tipo":\s*"Horas Maquina"/g) || []).length;
  const zeroCant = (content.match(/"cantidad":\s*0(\.0+)?([^\d\.]|$)/g) || []).length;
  const zeroMonto = (content.match(/"montoTotal":\s*0(\.0+)?([^\d\.]|$)/g) || []).length;
  console.log(`${name}: Total chars ${content.length}, HM: ${hmCount}, zeroCant: ${zeroCant}, zeroMonto: ${zeroMonto}`);
}

checkFile('src/data/realUnificadaAugust2026.ts', 'August 2026');
checkFile('src/data/realConsolidadoMeses2026.ts', 'Meses 1-7 (Jan-Jul 2026)');
checkFile('src/data/realSalidasSeptiembre2026.ts', 'September 2026');
