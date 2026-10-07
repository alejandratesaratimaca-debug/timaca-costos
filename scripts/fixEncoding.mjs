import fs from 'fs';

function fixMojibake(filePath) {
  if (!fs.existsSync(filePath)) return;
  let text = fs.readFileSync(filePath, 'utf8');
  const original = text;

  // Reemplazar mojibake comunes en español
  text = text
    .replace(/Ã¡/g, 'á')
    .replace(/Ã©/g, 'é')
    .replace(/Ã­/g, 'í')
    .replace(/Ã³/g, 'ó')
    .replace(/Ãº/g, 'ú')
    .replace(/Ã±/g, 'ñ')
    .replace(/Ã‘/g, 'Ñ')
    .replace(/Ã/g, 'Á')
    .replace(/Ã‰/g, 'É')
    .replace(/Ã/g, 'Í')
    .replace(/Ã“/g, 'Ó')
    .replace(/Ãš/g, 'Ú')
    .replace(/â€œ/g, '“')
    .replace(/â€/g, '”')
    .replace(/â€™/g, '’')
    .replace(/â€”/g, '—')
    .replace(/â€“/g, '–')
    .replace(/Â·/g, '·')
    .replace(/â/g, '✕')
    .replace(/â/g, '✔')
    .replace(/â/g, '✔')
    .replace(/MÃ“DULO/g, 'MÓDULO')
    .replace(/MÃ“/g, 'MÓ')
    .replace(/GestiÃ³n/g, 'Gestión')
    .replace(/calibraciÃ³n/g, 'calibración')
    .replace(/CalibraciÃ³n/g, 'Calibración')
    .replace(/NotificaciÃ³n/g, 'Notificación')
    .replace(/paÃ±ol/g, 'pañol')
    .replace(/prÃ©stamos/g, 'préstamos')
    .replace(/PrÃ©stamo/g, 'Préstamo')
    .replace(/PrÃ©stamos/g, 'Préstamos')
    .replace(/torquÃ­metros/g, 'torquímetros')
    .replace(/ReposiciÃ³n/g, 'Reposición')
    .replace(/InversiÃ³n/g, 'Inversión')
    .replace(/FabricaciÃ³n/g, 'Fabricación')
    .replace(/MÃ³dulo/g, 'Módulo')
    .replace(/DescripciÃ³n/g, 'Descripción')
    .replace(/CategorÃ­a/g, 'Categoría')
    .replace(/CategorÃ­as/g, 'Categorías')
    .replace(/UbicaciÃ³n/g, 'Ubicación')
    .replace(/tÃ©cnica/g, 'técnica')
    .replace(/HistÃ³rico/g, 'Histórico')
    .replace(/mecÃ¡nicos/g, 'mecánicos')
    .replace(/AcciÃ³n/g, 'Acción')
    .replace(/MetrolÃ³gico/g, 'Metrológico')
    .replace(/manÃ³metros/g, 'manómetros')
    .replace(/periÃ³dica/g, 'periódica')
    .replace(/CÃ³digo/g, 'Código')
    .replace(/Ãšltima/g, 'Última')
    .replace(/PrÃ³ximo/g, 'Próximo')
    .replace(/PrÃ³xima/g, 'Próxima')
    .replace(/DÃ­as/g, 'Días')
    .replace(/dÃ­as/g, 'días')
    .replace(/SemÃ¡foro/g, 'Semáforo')
    .replace(/AuditorÃ­a/g, 'Auditoría')
    .replace(/AsignaciÃ³n/g, 'Asignación')
    .replace(/identificaciÃ³n/g, 'identificación')
    .replace(/combinaciÃ³n/g, 'combinación')
    .replace(/Ãºnica/g, 'única')
    .replace(/CÃ©dula/g, 'Cédula')
    .replace(/MecÃ¡nico/g, 'Mecánico')
    .replace(/LÃ­der/g, 'Líder')
    .replace(/CaldererÃ­a/g, 'Calderería')
    .replace(/GrÃºas/g, 'Grúas')
    .replace(/BahÃ­a/g, 'Bahía')
    .replace(/DevoluciÃ³n/g, 'Devolución');

  if (text !== original) {
    fs.writeFileSync(filePath, text, 'utf8');
    console.log(`✅ Corregido encoding UTF-8 en: ${filePath}`);
  }
}

const files = [
  'src/components/herramientas/HerramientasModuleView.tsx',
  'src/components/certificados/CertificadosModuleView.tsx',
  'src/components/seguridad/SeguridadModuleView.tsx',
  'src/components/dotacion/DotacionModuleView.tsx',
  'src/components/rrhh/RRHHModuleView.tsx',
  'src/components/DashboardView.tsx',
  'src/components/Sidebar.tsx',
  'src/components/Header.tsx',
  'src/components/UsuariosView.tsx'
];

for (const f of files) {
  fixMojibake(f);
}
