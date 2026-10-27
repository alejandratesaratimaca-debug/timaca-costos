import fs from 'fs';

const xml = fs.readFileSync('slide3_raw.xml', 'utf8');
const textRegex = /<a:t>([^<]*)<\/a:t>/g;
let match;
const matches = [];
while ((match = textRegex.exec(xml)) !== null) {
  matches.push(match[1]);
}

console.log('All text nodes in slide 3:');
matches.forEach((t, i) => console.log(`${i}: "${t}"`));
