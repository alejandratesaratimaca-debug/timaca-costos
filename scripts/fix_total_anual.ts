import fs from 'fs';
import path from 'path';
import { MATRIZ_REAL_PROYECTOS_MENSUAL_2026 } from '../src/data/realProyectosMensual2026';

const filePath = path.resolve('src/data/realProyectosMensual2026.ts');
let content = fs.readFileSync(filePath, 'utf-8');

const projs = Object.values(MATRIZ_REAL_PROYECTOS_MENSUAL_2026);
let grandTotal = 0;

projs.forEach(p => {
  const sumMeses = p.meses.reduce((a, b) => a + b, 0);
  const roundedSum = Math.round(sumMeses * 100) / 100;
  grandTotal += roundedSum;
  
  // Replace totalAnual for this project
  const regex = new RegExp(`("cuentaAuxiliar":\\s*"${p.cuentaAuxiliar}"[\\s\\S]*?"totalAnual":\\s*)[\\d\\.]+`, 'g');
  content = content.replace(regex, `$1${roundedSum}`);
});

fs.writeFileSync(filePath, content, 'utf-8');
console.log(`Updated all totalAnual! Grand Total: ${grandTotal.toFixed(2)}`);
