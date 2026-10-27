const fs = require('fs');

const moreFiles = [
  'src/App.tsx',
  'src/components/certificados/CertificadosModuleView.tsx',
  'src/components/Header.tsx',
  'src/components/herramientas/HerramientasModuleView.tsx',
  'src/components/LoginPortadaView.tsx',
  'src/components/rrhh/RRHHModuleView.tsx',
  'src/components/SalidasTableView.tsx',
  'src/components/Sidebar.tsx',
  'src/types/suite.ts'
];

for (const f of moreFiles) {
  if (!fs.existsSync(f)) continue;
  let content = fs.readFileSync(f, 'utf8');
  const original = content;

  content = content.replace(/PMH\s+Pal[úu]a/gi, 'PMH');
  content = content.replace(/Pal[úu]a\s+PMH/gi, 'PMH');
  content = content.replace(/Muelle\s+Pal[úu]a/gi, 'Muelle PMH');
  content = content.replace(/Frente\s+Pal[úu]a/gi, 'Frente PMH');
  content = content.replace(/Campo\s+Pal[úu]a/gi, 'Campo PMH');
  content = content.replace(/Pal[úu]a\s*\(PMH\)/gi, 'PMH');
  content = content.replace(/\(PMH\)\s*Pal[úu]a/gi, 'PMH');
  content = content.replace(/Pal[úu]a/g, 'PMH');
  content = content.replace(/PALUA/g, 'PMH');
  content = content.replace(/PMH\s+PMH/g, 'PMH');

  if (content !== original) {
    fs.writeFileSync(f, content, 'utf8');
    console.log('Updated:', f);
  }
}
