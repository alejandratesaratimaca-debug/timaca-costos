const fs = require('fs');
const vm = require('vm');

let html = fs.readFileSync('public/trazabilidad.html', 'utf8').replace(/\r\n/g, '\n');

// 1. Plazo horas default 72
html = html.replace(
  "rif: 'J095003159', plazoHoras: 12",
  "rif: 'J095003159', plazoHoras: 72"
);

// 2. Header Tiempo restante
html = html.replace(
  "{ t: 'Tiempo restante (12 h)',",
  "{ t: 'Tiempo restante',",
);

// Convert back to CRLF
const finalHtml = html.replace(/\n/g, '\r\n');

// VALIDATE JS SYNTAX
const scriptStart = finalHtml.indexOf('<script>');
const scriptEnd = finalHtml.lastIndexOf('</script>');
const js = finalHtml.substring(scriptStart + 8, scriptEnd);
try {
  new vm.Script(js, { filename: 'trazabilidad_inline.js' });
  console.log('✅ JavaScript syntax PASSED with 0 errors!');
} catch (err) {
  console.error('❌ JS SYNTAX ERROR:', err);
  process.exit(1);
}

fs.writeFileSync('public/trazabilidad.html', finalHtml, 'utf8');
fs.writeFileSync('public/index.html', finalHtml, 'utf8');
fs.writeFileSync('public/200.html', finalHtml, 'utf8');

console.log('✅ Successfully updated plazoHoras to 72 and validated all HTML files!');
