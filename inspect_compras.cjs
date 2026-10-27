const fs = require('fs');

function inspect() {
  const code = fs.readFileSync('BaseCentral-Section1.m', 'utf8');
  const startIdx = code.indexOf('shared #"2 Compras"');
  if (startIdx >= 0) {
    const endIdx = code.indexOf('shared ', startIdx + 20);
    console.log(code.substring(startIdx, endIdx > 0 ? endIdx : undefined));
  } else {
    console.log('Query #"2 Compras" not found');
  }
}

inspect();
