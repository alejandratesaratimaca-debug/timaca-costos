const fs = require('fs');
const JSZip = require('jszip');

async function testZip() {
  const file = 'C:/Users/alejandratesara/Desktop/Alejandra T/Informe_Ejecutivo_Costos_TIMACA_Septiembre_2026.pptx';
  const data = fs.readFileSync(file);
  const zip = await JSZip.loadAsync(data);
  let countLang = 0;
  let countPath = 0;
  for (const [filename, zipEntry] of Object.entries(zip.files)) {
    if (filename.endsWith('.xml') || filename.endsWith('.rels')) {
      const content = await zipEntry.async('string');
      const matchesLang = content.match(/lang="en-US"/g);
      if (matchesLang) countLang += matchesLang.length;
      if (content.includes('alejandratesara') || content.includes('antigravity')) {
        countPath++;
        console.log('Path found in:', filename);
      }
    }
  }
  console.log('Matches lang en-US:', countLang);
  console.log('Files with local path:', countPath);
}
testZip();
