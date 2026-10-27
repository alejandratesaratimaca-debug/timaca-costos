const fs = require('fs');

const filePath = 'src/data/mockDesgloseCategorias.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Update Nomina -TALLERES and Incentivos Laborales in COSTOS_INDIRECTOS_POR_CATEGORIAS
content = content.replace(
  "{ concepto: 'Nomina -TALLERES', ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 0, sep: 122000, total: 122000 },",
  "{ concepto: 'Nomina -TALLERES', ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 122000, sep: 122000, total: 244000 },"
);

content = content.replace(
  "{ concepto: 'Incentivos Laborales (Bonos)', ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 0, sep: 6700, total: 6700 },",
  "{ concepto: 'Incentivos Laborales (Bonos)', ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 6700, sep: 6700, total: 13400 },"
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated Agosto Nomina Talleres and Bonos in mockDesgloseCategorias.ts!');
