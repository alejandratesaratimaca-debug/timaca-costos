const fs = require('fs');

const filesToUpdate = [
  'src/components/sip-pmh/SIPPmhModuleView.tsx',
  'src/components/ValidacionGerenteView.tsx',
  'src/context/CostosContext.tsx',
  'src/types/usuarios.ts',
  'src/types/suite.ts',
  'src/data/mockSIPPmhData.ts',
  'src/data/mockRRHHData.ts',
  'src/data/mockHerramientasData.ts',
  'src/data/mockDotacionData.ts',
  'src/data/mockCertificadosData.ts',
  'src/data/mockSeguridadData.ts',
  'src/data/realSeguridadData.ts',
  'src/components/seguridad/SeguridadModuleView.tsx',
  'supabase/perfiles_iniciales.sql'
];

for (const f of filesToUpdate) {
  if (!fs.existsSync(f)) {
    console.log('File does not exist:', f);
    continue;
  }
  let content = fs.readFileSync(f, 'utf8');
  const original = content;

  // Specific compound phrases first
  content = content.replace(/PMH\s+Pal[úu]a/gi, 'PMH');
  content = content.replace(/Pal[úu]a\s+PMH/gi, 'PMH');
  content = content.replace(/Muelle\s+Pal[úu]a/gi, 'Muelle PMH');
  content = content.replace(/Frente\s+Pal[úu]a/gi, 'Frente PMH');
  content = content.replace(/Cargador\s+Pal[úu]a/gi, 'Cargador PMH');
  content = content.replace(/OBR-PALUA/gi, 'OBR-PMH');
  content = content.replace(/u-frente-palua/gi, 'u-frente-pmh');
  content = content.replace(/RSG-PALUA/gi, 'RSG-PMH');
  content = content.replace(/Contrato_Determinado_Palua/gi, 'Contrato_Determinado_PMH');
  content = content.replace(/HSE\s+Pal[úu]a/gi, 'HSE PMH');
  
  // Any remaining "Palúa" or "Palua" or "PALUA"
  content = content.replace(/Pal[úu]a/g, 'PMH');
  content = content.replace(/PALUA/g, 'PMH');

  // Clean up any accidental double PMH e.g. "PMH PMH"
  content = content.replace(/PMH\s+PMH/g, 'PMH');

  if (content !== original) {
    fs.writeFileSync(f, content, 'utf8');
    console.log('Updated:', f);
  } else {
    console.log('No changes in:', f);
  }
}
