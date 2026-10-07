const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// In Windows, PowerShell can extract zip
const pptxPath = 'C:\\Users\\alejandratesara\\Desktop\\Alejandra T\\Costos Alejandra\\Informe_Costos_corregido.pptx';
const outDir = path.join(__dirname, 'public', 'ppt-assets');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Let's copy pptx to temp.zip and extract ppt/media/*
const tempZip = path.join(__dirname, 'temp_pptx.zip');
fs.copyFileSync(pptxPath, tempZip);

const psCmd = `powershell -ExecutionPolicy Bypass -Command "Expand-Archive -Path '${tempZip}' -DestinationPath '${path.join(__dirname, 'temp_extracted')}' -Force"`;
console.log('Extracting archive...');
execSync(psCmd);

const mediaDir = path.join(__dirname, 'temp_extracted', 'ppt', 'media');
if (fs.existsSync(mediaDir)) {
  const files = fs.readdirSync(mediaDir);
  console.log(`Found ${files.length} media files`);
  files.forEach(f => {
    fs.copyFileSync(path.join(mediaDir, f), path.join(outDir, f));
  });
  console.log('Copied all media files to public/ppt-assets');
}

// Cleanup
fs.unlinkSync(tempZip);
fs.rmSync(path.join(__dirname, 'temp_extracted'), { recursive: true, force: true });
console.log('Done!');
