const fs = require('fs');
const path = require('path');

const publicDir = path.resolve(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const versionData = {
  version: Date.now(),
  timestamp: new Date().toISOString(),
  buildDate: new Date().toLocaleString('es-VE', { timeZone: 'America/Caracas' })
};

const versionPath = path.join(publicDir, 'version.json');
fs.writeFileSync(versionPath, JSON.stringify(versionData, null, 2), 'utf-8');
console.log('[SIGMA Build] Generated public/version.json:', versionData.buildDate);
