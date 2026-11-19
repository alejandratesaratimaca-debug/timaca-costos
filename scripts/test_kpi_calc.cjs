const fs = require('fs');

const acordados = JSON.parse(fs.readFileSync('C:/Users/alejandratesara/.gemini/antigravity/scratch/workspace-explorer/public/data/sip/precios_acordados_compras.json', 'utf8'));
const matData = fs.readFileSync('C:/Users/alejandratesara/.gemini/antigravity/scratch/workspace-explorer/src/data/alertasMaterialesData.ts', 'utf8');

const marker = 'export const ALERTAS_MATERIALES_CONSOLIDADOS: MaterialConsolidadoItem[] = ';
const idx = matData.indexOf(marker);
let jsonStr = matData.substring(idx + marker.length).trim();
if (jsonStr.endsWith(';')) jsonStr = jsonStr.substring(0, jsonStr.length - 1);

const materials = JSON.parse(jsonStr);
console.log('Total materials loaded:', materials.length);

function calcKPIs(mats, selectedMonth = 'TODOS') {
  let totalCasos = 0;
  let validadosCasos = 0;
  let umConflicts = 0;
  let desfasePrecio = 0;
  let sinOC = 0;
  let impactoUSD = 0;
  let impactoResidualUSD = 0;

  let totalMaterialsCount = mats.length;
  let validadosMaterials = 0;

  mats.forEach(m => {
    const isVal = (m.estatus || '').includes('VALIDADO') || (m.estatus || '').includes('APROBADO');
    if (isVal) validadosMaterials++;

    const inMonth = selectedMonth === 'TODOS' || (m.meses && m.meses.includes(selectedMonth));
    if (!inMonth) return;

    const dps = (selectedMonth !== 'TODOS' && m.dps_por_mes && m.dps_por_mes[selectedMonth] !== undefined)
      ? m.dps_por_mes[selectedMonth]
      : (m.total_dps || 0);

    const impacto = (selectedMonth !== 'TODOS' && m.impacto_por_mes && m.impacto_por_mes[selectedMonth] !== undefined)
      ? m.impacto_por_mes[selectedMonth]
      : (m.impacto_total_usd || 0);

    totalCasos += dps;
    if (isVal) {
      validadosCasos += dps;
    } else {
      impactoResidualUSD += Math.abs(impacto);
    }

    if (m.categoria_alerta === 'UM') umConflicts += dps;
    else if (m.categoria_alerta === 'PRECIO') desfasePrecio += dps;
    else if (m.categoria_alerta === 'SIN_OC') sinOC += dps;

    impactoUSD += Math.abs(impacto);
  });

  const pendientesCasos = Math.max(0, totalCasos - validadosCasos);
  const pendientesMaterials = Math.max(0, totalMaterialsCount - validadosMaterials);

  return {
    totalCasos,
    validadosCasos,
    pendientesCasos,
    totalMaterials: totalMaterialsCount,
    validadosMaterials,
    pendientesMaterials,
    umConflicts,
    desfasePrecio,
    sinOC,
    impactoUSD: Math.round(impactoUSD),
    impactoResidualUSD: Math.round(impactoResidualUSD)
  };
}

console.log('Initial KPIs:', calcKPIs(materials));

const nextMaterials = materials.map(m => {
  const info = acordados[m.codigo];
  if (info && info.precio > 0) {
    return {
      ...m,
      precio_sip: info.precio,
      estatus: `VALIDADO CON COMPRAS ($${info.precio.toFixed(2)})`,
      impacto_total_usd: (info.precio - m.precio_oc) * m.total_cant
    };
  }
  return m;
});

console.log('KPIs After Applying Acordados:', calcKPIs(nextMaterials));
