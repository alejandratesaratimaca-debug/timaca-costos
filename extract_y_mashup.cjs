const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

// We have Y-MasterUnificado-item1.xml
const xmlContent = fs.readFileSync('Y-MasterUnificado-item1.xml', 'utf8');
const match = xmlContent.match(/<DataMashup[^>]*>([\s\S]*?)<\/DataMashup>/);
if (!match) {
  console.error('DataMashup not found in XML!');
  process.exit(1);
}

const b64 = match[1].trim();
const buffer = Buffer.from(b64, 'base64');

// Search for ZIP signature (0x50, 0x4B, 0x03, 0x04)
let zipOffset = -1;
for (let i = 0; i < buffer.length - 4; i++) {
  if (buffer[i] === 0x50 && buffer[i+1] === 0x4B && buffer[i+2] === 0x03 && buffer[i+3] === 0x04) {
    zipOffset = i;
    break;
  }
}

console.log('Zip offset:', zipOffset);
if (zipOffset < 0) {
  console.error('Zip signature not found in DataMashup binary!');
  process.exit(1);
}

const zipBuffer = buffer.subarray(zipOffset);
fs.writeFileSync('Y-MasterUnificado-mashup.zip', zipBuffer);
console.log('Saved Y-MasterUnificado-mashup.zip (' + zipBuffer.length + ' bytes)');

// Now inspect entries
const zip = new AdmZip(zipBuffer);
const entries = zip.getEntries();
for (const entry of entries) {
  console.log('Entry:', entry.entryName);
  if (entry.entryName.includes('Section1.m')) {
    const mCode = entry.getData().toString('utf8');
    fs.writeFileSync('Y-MasterUnificado-Section1.m', mCode, 'utf8');
    console.log('Wrote Y-MasterUnificado-Section1.m (' + mCode.length + ' chars)');
  }
}
