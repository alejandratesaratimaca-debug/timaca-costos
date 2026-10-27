const fs = require('fs');
const file = 'src/components/CategoriaDetalleView.tsx';
let txt = fs.readFileSync(file, 'utf8');
const target = '${Math.round(s.montoTotal).toLocaleString(\'de-DE\')}';
const replacement = '${formatAmountAuto(s.montoTotal)}';
if (txt.includes(target)) {
  txt = txt.replace(target, replacement);
  fs.writeFileSync(file, txt, 'utf8');
  console.log('Replaced successfully in CategoriaDetalleView!');
} else {
  console.log('Target not found in CategoriaDetalleView!');
}
