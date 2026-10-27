const fs = require('fs');

// Let's inspect where 219.531 or 166.893 comes from in CategoriaDetalleView.tsx or mock data
const files = [
  'src/data/mockDesgloseCategorias.ts',
  'src/data/mockCostosTimaca.ts',
  'src/data/realProyectosMensual2026.ts',
  'src/components/CategoriaDetalleView.tsx'
];

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  if (content.includes('219531') || content.includes('219.531') || content.includes('166893') || content.includes('166.893')) {
    console.log(`Found amount in ${f}`);
  }
});
