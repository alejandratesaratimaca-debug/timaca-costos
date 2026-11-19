const fs = require('fs');

const acordados = JSON.parse(fs.readFileSync('C:/Users/alejandratesara/.gemini/antigravity/scratch/workspace-explorer/public/data/sip/precios_acordados_compras.json', 'utf8'));

// Read alertasMaterialesData.ts
const matFile = fs.readFileSync('C:/Users/alejandratesara/.gemini/antigravity/scratch/workspace-explorer/src/data/alertasMaterialesData.ts', 'utf8');

// Quick extract of objects
const regex = /{\s*"codigo":\s*"([^"]+)",[\s\S]*?"categoria_alerta":\s*"([^"]+)",[\s\S]*?"total_dps":\s*([0-9.]+),[\s\S]*?"total_cant":\s*([0-9.]+),[\s\S]*?"precio_sip":\s*([0-9.]+),[\s\S]*?"precio_oc":\s*([0-9.]+),[\s\S]*?"impacto_total_usd":\s*([0-9.-]+),[\s\S]*?"estatus":\s*"([^"]+)"\s*}/g;

let match;
let totalMaterials = 0;
let matchedMaterials = 0;
let pendingMaterials = 0;
let originalImpact = 0;
let newImpact = 0;
let dpsResolved = 0;
let totalDps = 0;

const catsOriginal = { UM: 0, PRECIO: 0, SIN_OC: 0 };
const catsResolved = { UM: 0, PRECIO: 0, SIN_OC: 0 };

while ((match = regex.exec(matFile)) !== null) {
  totalMaterials++;
  const [_, codigo, cat, dpsStr, cantStr, pSipStr, pOcStr, impStr, estatus] = match;
  const dps = parseFloat(dpsStr) || 0;
  const cant = parseFloat(cantStr) || 0;
  const pSip = parseFloat(pSipStr) || 0;
  const pOc = parseFloat(pOcStr) || 0;
  const imp = parseFloat(impStr) || 0;

  totalDps += dps;
  originalImpact += Math.abs(imp);
  catsOriginal[cat] = (catsOriginal[cat] || 0) + 1;

  const info = acordados[codigo];
  if (info && info.precio > 0) {
    matchedMaterials++;
    dpsResolved += dps;
    catsResolved[cat] = (catsResolved[cat] || 0) + 1;
    const newPrice = info.precio;
    const newDiff = (newPrice - pOc) * cant;
    newImpact += Math.abs(newDiff);
  } else {
    pendingMaterials++;
    newImpact += Math.abs(imp);
  }
}

console.log('Total Materials:', totalMaterials);
console.log('Matched with Acordados (>0):', matchedMaterials);
console.log('Pending Materials:', pendingMaterials);
console.log('Total DPs:', totalDps);
console.log('DPs Resolved:', dpsResolved);
console.log('Original Impact ($):', originalImpact);
console.log('New Impact ($):', newImpact);
console.log('Categories Original:', catsOriginal);
console.log('Categories Resolved:', catsResolved);
