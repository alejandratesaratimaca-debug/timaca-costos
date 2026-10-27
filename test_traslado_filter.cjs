const fs = require('fs');

const content = fs.readFileSync('src/data/realSalidasSeptiembre2026.ts', 'utf8');
const scRegex = /"codigoSalida":\s*"([^"]+)"[\s\S]*?"categoria":\s*"([^"]+)"[\s\S]*?"itemDescripcion":\s*"([^"]+)"[\s\S]*?"montoTotal":\s*([0-9.]+)[\s\S]*?"motivo":\s*"([^"]+)"/g;

let m;
const hits = [];
while ((m = scRegex.exec(content)) !== null) {
  const [_, sc, cat, desc, monto, motivo] = m;
  if (/traslado|transporte|transven/i.test(desc) || /traslado|transporte|transven/i.test(motivo)) {
    if (cat.toLowerCase().includes('servicio')) {
      hits.push({ sc, cat, desc, monto: parseFloat(monto), motivo: motivo.substring(0, 90) });
    }
  }
}

console.log('Traslado hits in September:', hits.length);
hits.forEach(h => console.log(h.sc, '$' + h.monto, h.desc, '|', h.motivo));
