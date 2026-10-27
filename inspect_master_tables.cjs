const fs = require('fs');
const zlib = require('zlib');

function inspectZipEntries(filePath) {
  const buf = fs.readFileSync(filePath);
  let offset = 0;
  const entries = [];
  while (offset < buf.length - 4) {
    if (buf.readUInt32LE(offset) === 0x04034b50) {
      const compMethod = buf.readUInt16LE(offset + 8);
      const compSize = buf.readUInt32LE(offset + 18);
      const nameLen = buf.readUInt16LE(offset + 26);
      const extraLen = buf.readUInt16LE(offset + 28);
      const name = buf.subarray(offset + 30, offset + 30 + nameLen).toString('utf8');
      entries.push({ name, compMethod, compSize, offset: offset + 30 + nameLen + extraLen });
      offset += 30 + nameLen + extraLen + compSize;
    } else {
      offset++;
    }
  }
  return { buf, entries };
}

function getEntry(zip, name) {
  const e = zip.entries.find(x => x.name === name);
  if (!e) return null;
  const data = zip.buf.subarray(e.offset, e.offset + e.compSize);
  return e.compMethod === 8 ? zlib.inflateRawSync(data) : data;
}

const masterZip = inspectZipEntries('C:\\Users\\alejandratesara\\Desktop\\Alejandra T\\Costos Alejandra\\1 Informe\\4 Master Unificado.xlsx');
const content = getEntry(masterZip, 'xl/tables/table1.xml').toString('utf8');
const cols = content.match(/<tableColumn [^>]+>/g) || [];
console.log('Columns in table1 of 4 Master Unificado:');
cols.forEach(c => console.log('  ' + c));
