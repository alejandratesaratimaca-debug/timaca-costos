const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '../public/data/sip/reclasificaciones.json');
const distPath = path.join(__dirname, '../dist/data/sip/reclasificaciones.json');
const archivePath = path.join(__dirname, '../public/data/sip/valorizaciones_sip_historicas.json');

console.log('Reading reclasificaciones.json...');
const all = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
console.log('Total entries:', all.length);

const valSip = all.filter(r => String(r.recordId || '').startsWith('VAL-SIP-'));
const genuine = all.filter(r => !String(r.recordId || '').startsWith('VAL-SIP-'));

console.log('VAL-SIP entries to archive:', valSip.length);
console.log('Genuine active human corrections to keep:', genuine.length);

// 1. Write archive
console.log('Saving archive to valorizaciones_sip_historicas.json...');
fs.writeFileSync(archivePath, JSON.stringify(valSip));

// 2. Write genuine active human corrections to public and dist
console.log('Updating reclasificaciones.json with active genuine corrections...');
fs.writeFileSync(targetPath, JSON.stringify(genuine, null, 2));

if (fs.existsSync(path.dirname(distPath))) {
  fs.writeFileSync(distPath, JSON.stringify(genuine, null, 2));
}

const newSizePublic = fs.statSync(targetPath).size;
console.log(`Success! New reclasificaciones.json size: ${(newSizePublic / 1024).toFixed(2)} KB (reduced from ~27 MB)`);
