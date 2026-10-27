import { TABLA_PPT_DISTRIBUCION_2026, TOTALES_MESES_PPT } from '../src/data/mockCostosTimaca';

console.log("=== CALCULATING EXACT CATEGORIES FOR PERFECT RECONCILIATION ===");

// We want for every month m:
// Materiales + Servicios + MOD + HM + CIF === TOTALES_MESES_PPT[m].total

const mat = [268645, 531944, 565344, 465011, 183689, 473348, 239441, 371927, 868067];
const serv = [128145, 162086, 230866, 91405, 75734, 1639332, 359067, 117970, 99540];
const mod = [312530, 269666, 255366, 229531, 261564, 202303, 212668, 277936, 196665];
const hm = [145113, 113686, 149030, 55110, 129625, 69063, 75933, 89789, 55578];

const cifRecalculated: number[] = [];
for (let i = 0; i < 9; i++) {
  const directSum = mat[i] + serv[i] + mod[i] + hm[i];
  const target = TOTALES_MESES_PPT[i].total;
  const neededCif = target - directSum;
  cifRecalculated.push(neededCif);
  console.log(`Mes ${i+1}: Direct=${directSum.toLocaleString()} | Needed CIF=${neededCif.toLocaleString()} | Target=${target.toLocaleString()} | CheckSum=${(directSum + neededCif).toLocaleString()}`);
}

console.log("\nCIF Recalculated array:", cifRecalculated);
const sumCif = cifRecalculated.reduce((a, b) => a + b, 0);
console.log("Sum CIF:", sumCif.toLocaleString());

const sumMat = mat.reduce((a, b) => a + b, 0);
const sumServ = serv.reduce((a, b) => a + b, 0);
const sumMod = mod.reduce((a, b) => a + b, 0);
const sumHm = hm.reduce((a, b) => a + b, 0);

console.log("\nCategory Totals:");
console.log("Materiales:", sumMat.toLocaleString());
console.log("Servicios:", sumServ.toLocaleString());
console.log("MOD:", sumMod.toLocaleString());
console.log("HM:", sumHm.toLocaleString());
console.log("CIF:", sumCif.toLocaleString());
console.log("GRAND TOTAL:", (sumMat + sumServ + sumMod + sumHm + sumCif).toLocaleString());
console.log("TARGET PPT:", TOTALES_MESES_PPT.reduce((a, b) => a + b.total, 0).toLocaleString());
