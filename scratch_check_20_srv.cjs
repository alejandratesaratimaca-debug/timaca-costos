const fs = require('fs');

const mockFile = fs.readFileSync('src/data/mockCostosTimaca.ts', 'utf8');
const pStart = mockFile.indexOf('export const CUENTAS_AUXILIARES_EXACTAS_AGOSTO_2026');
const pEnd = mockFile.indexOf('];', pStart);
const arrayStr = mockFile.substring(pStart + 'export const CUENTAS_AUXILIARES_EXACTAS_AGOSTO_2026: CuentaAuxiliarProyecto[] = '.length, pEnd + 1);
const proyectos20 = eval(arrayStr);

const matFile = fs.readFileSync('src/data/realProyectosMensual2026.ts', 'utf8');
const matStart = matFile.indexOf('export const MATRIZ_REAL_PROYECTOS_MENSUAL_2026');
const matEnd = matFile.lastIndexOf('};');
const matStr = matFile.substring(matStart + 'export const MATRIZ_REAL_PROYECTOS_MENSUAL_2026: Record<string, ProyectoEvolutivoMensual> = '.length, matEnd + 1);
const matriz = eval('(' + matStr + ')');

console.log('=== 20 PROYECTOS OFICIALES: CONSUMO DE SERVICIOS EN AGOSTO Y ANUAL ===');
let conSrvAnual = 0;
let conSrvAgo = 0;

proyectos20.forEach((p, idx) => {
  const cod = p.cuentaAuxiliar;
  const pData = matriz[cod];
  const srvAgo = pData ? (pData.byCategoriaMes[7]?.['Servicios'] || 0) : 0;
  let srvAnual = 0;
  if (pData) {
    pData.byCategoriaMes.forEach(m => {
      srvAnual += (m['Servicios'] || 0);
    });
  }
  if (srvAgo > 0) conSrvAgo++;
  if (srvAnual > 0) conSrvAnual++;

  console.log(`${idx + 1}. [${cod}] ${p.proyectoCorto}: Srv Ago = $${srvAgo.toLocaleString('de-DE')} | Srv Anual = $${srvAnual.toLocaleString('de-DE')} | Total Proyecto Ago = $${p.montoAgosto.toLocaleString('de-DE')}`);
});

console.log(`\nResumen: ${conSrvAgo} de 20 tuvieron Servicios en Agosto. ${conSrvAnual} de 20 tuvieron Servicios en algún mes del año.`);
