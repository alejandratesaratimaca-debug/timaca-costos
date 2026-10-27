const fs = require('fs');
const JSZip = require('jszip');

async function cleanPptx(filePath) {
  const data = fs.readFileSync(filePath);
  const zip = await JSZip.loadAsync(data);
  let modifiedCount = 0;
  let langReplaced = 0;
  let pathReplaced = 0;

  for (const [filename, fileEntry] of Object.entries(zip.files)) {
    if (filename.endsWith('.xml') || filename.endsWith('.rels')) {
      let content = await fileEntry.async('string');
      let changed = false;

      // 1. Reemplazar lang="en-US" por lang="es-VE"
      const langMatches = content.match(/lang="en-US"/g);
      if (langMatches) {
        langReplaced += langMatches.length;
        content = content.replace(/lang="en-US"/g, 'lang="es-VE"');
        changed = true;
      }

      // 2. Reemplazar cualquier ruta local en descr o texto
      if (content.includes('alejandratesara') || content.includes('antigravity')) {
        pathReplaced++;
        content = content.replace(/descr="[^"]*timaca-logo\.png"/g, 'descr="Logotipo Oficial TIMACA"');
        content = content.replace(/C:\\Users\\alejandratesara[^\s"<]*/g, 'TIMACA_Assets/timaca-logo.png');
        content = content.replace(/C:\/Users\/alejandratesara[^\s"<]*/g, 'TIMACA_Assets/timaca-logo.png');
        changed = true;
      }

      if (changed) {
        zip.file(filename, content);
        modifiedCount++;
      }
    }
  }

  const newBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(filePath, newBuffer);
  console.log(`Cleaned ${filePath}:`);
  console.log(`- Files modified: ${modifiedCount}`);
  console.log(`- Language tags replaced (en-US -> es-VE): ${langReplaced}`);
  console.log(`- Local path occurrences cleaned: ${pathReplaced}`);
}

async function run() {
  const file = 'C:/Users/alejandratesara/Desktop/Alejandra T/Informe_Ejecutivo_Costos_TIMACA_Septiembre_2026.pptx';
  await cleanPptx(file);
}

run();
