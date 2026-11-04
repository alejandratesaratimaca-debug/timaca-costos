const fs = require('fs');
const vm = require('vm');

let html = fs.readFileSync('public/trazabilidad.html', 'utf8').replace(/\r\n/g, '\n');

const targetSelect = `\${campo('Préstamo o asignación con saldo', \`<select onchange="ir('dev',{vale:this.value})" style="min-width:420px"><option value="">Seleccione…</option>\${vales.map(x => \`<option value="\${x.num}" \${x.num === sel ? 'selected' : ''}>\${x.num} · \${esc(x.resp.nombre)} · \${esc(almNombre(x.destino || x.origen))} · saldo \${saldoVale(x)}</option>\`).join('')}</select>\`)}`;

const replaceSelect = `\${campo('Préstamo o asignación con saldo', \`<select onchange="ir('dev',{vale:this.value})" style="min-width:480px"><option value="">Seleccione…</option>\${vales.map(x => {
      const itemsTxt = (x.lineas || []).map(l => \`\${l.desc}\${l.serial && l.serial !== '—' ? ' [' + l.serial + ']' : ''}\`).join(', ');
      return \`<option value="\${x.num}" \${x.num === sel ? 'selected' : ''}>\${x.num} · \${esc(x.resp.nombre)} · \${esc(itemsTxt)} · saldo \${saldoVale(x)}</option>\`;
    }).join('')}</select>\`)}`;

if (!html.includes(targetSelect)) {
  console.error('targetSelect not found in html!');
  process.exit(1);
}

html = html.replace(targetSelect, () => replaceSelect);

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

console.log('✅ Successfully updated devolution select dropdown with serials!');
