import fs from 'fs';

// Let's inspect realSalidasSeptiembre2026.ts for TTE-C-0706 and tipo = Servicios
const fileStr = fs.readFileSync('src/data/realSalidasSeptiembre2026.ts', 'utf8');

const regex = /"cuentaAuxiliarCodigo":\s*"TTE-C-0706"[\s\S]*?"tipo":\s*"Servicios"[\s\S]*?"montoTotal":\s*([0-9.]+)/g;
let match;
let count = 0;
let total = 0;
while ((match = regex.exec(fileStr)) !== null) {
  count++;
  total += parseFloat(match[1]);
  console.log(`Match ${count}: Monto = ${match[1]}`);
}

console.log(`Total servicios TTE-C-0706 en realSalidasSeptiembre: count=${count}, total=${total}`);
