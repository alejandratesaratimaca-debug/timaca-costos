const fs = require('fs');

// 1. Read CUENTAS_AUXILIARES_EXACTAS_AGOSTO_2026
const file = fs.readFileSync('src/data/mockCostosTimaca.ts', 'utf8');
const pStart = file.indexOf('export const CUENTAS_AUXILIARES_EXACTAS_AGOSTO_2026');
const pEnd = file.indexOf('];', pStart);
const arrayStr = file.substring(pStart + 'export const CUENTAS_AUXILIARES_EXACTAS_AGOSTO_2026: CuentaAuxiliarProyecto[] = '.length, pEnd + 1);
const proyectos = eval(arrayStr);

console.log('--- CUENTAS_AUXILIARES_EXACTAS_AGOSTO_2026 (Total:', proyectos.length, ') ---');
proyectos.forEach((p, i) => {
  console.log(`${i + 1}. [${p.cuentaAuxiliar}] ${p.proyectoCorto} - Monto Total Agosto: $${p.montoAgosto.toLocaleString('de-DE')} (${p.porcentaje}%)`);
});

// 2. Check MATRIZ_REAL_PROYECTOS_MENSUAL_2026 for Servicios in Agosto (month index 7)
const matFile = fs.readFileSync('src/data/realProyectosMensual2026.ts', 'utf8');
const matStart = matFile.indexOf('export const MATRIZ_REAL_PROYECTOS_MENSUAL_2026');
const matEnd = matFile.lastIndexOf('};');
const matStr = matFile.substring(matStart + 'export const MATRIZ_REAL_PROYECTOS_MENSUAL_2026: Record<string, ProyectoEvolutivoMensual> = '.length, matEnd + 1);
const matriz = eval('(' + matStr + ')');

console.log('\n--- MATRIZ_REAL_PROYECTOS_MENSUAL_2026 ---');
console.log('Total proyectos en matriz:', Object.keys(matriz).length);

console.log('\n--- Proyectos de Agosto con imputación en SERVICIOS ---');
let countSrv = 0;
let sumSrv = 0;
const srvList = [];
const noSrvList = [];

proyectos.forEach(p => {
  const cod = p.cuentaAuxiliar;
  const pData = matriz[cod];
  const srvMonto = pData ? (pData.byCategoriaMes[7]?.['Servicios'] || 0) : 0;
  if (srvMonto > 0) {
    countSrv++;
    sumSrv += srvMonto;
    srvList.push({ cod, nombre: p.proyectoCorto, srvMonto, totalAgo: p.montoAgosto });
  } else {
    noSrvList.push({ cod, nombre: p.proyectoCorto, totalAgo: p.montoAgosto });
  }
});

console.log(`Proyectos con Servicios en Agosto: ${countSrv} (Suma Servicios: $${sumSrv.toLocaleString('de-DE')})`);
srvList.forEach((p, i) => console.log(`  ${i+1}. [${p.cod}] ${p.nombre}: $${p.srvMonto.toLocaleString('de-DE')} de Servicios (Total mes: $${p.totalAgo.toLocaleString('de-DE')})`));

console.log(`\nProyectos SIN Servicios en Agosto (los otros ${noSrvList.length}):`);
noSrvList.forEach((p, i) => console.log(`  ${i+1}. [${p.cod}] ${p.nombre}: $0 en Servicios (Total mes: $${p.totalAgo.toLocaleString('de-DE')})`));
