import { MATRIZ_REAL_PROYECTOS_MENSUAL_2026 } from '../src/data/realProyectosMensual2026';

const updates: Record<string, { mod: number, cta: string }> = {
  'TTE-C-0706': { mod: 128161, cta: 'TTE-C-0706' },
  'TTE-C-0671': { mod: 30305, cta: 'TTE-C-0671' },
  'TTE-C-0680': { mod: 11870, cta: 'TTE-C-0680' },
  'TTE-C-0668': { mod: 8392, cta: 'TTE-C-0668' },
  'TTE-C-0669': { mod: 5218, cta: 'TTE-C-0669' },
  'TTE-C-0656': { mod: 3762, cta: 'TTE-C-0656' },
  'TTE-C-0670': { mod: 3420, cta: 'TTE-C-0670' },
  'TTE-C-0694': { mod: 3420, cta: 'TTE-C-0694' },
  'TTE-C-0655': { mod: 1768, cta: 'TTE-C-0655' },
  'TTE-C-0678': { mod: 350, cta: 'TTE-C-0678' },
  'TTE-C-0684': { mod: 0, cta: 'TTE-C-0684' }
};

let totalSep = 0;
const projs = Object.values(MATRIZ_REAL_PROYECTOS_MENSUAL_2026);

const results: any[] = [];

projs.forEach(p => {
  const cat = { ...(p.byCategoriaMes[8] || {}) };
  const u = updates[p.cuentaAuxiliar];
  if (u !== undefined) {
    cat["Mano de Obra Directa"] = u.mod;
  }
  const mat = cat["Materiales Directos"] || 0;
  const serv = cat["Servicios"] || 0;
  const mod = cat["Mano de Obra Directa"] || 0;
  const hm = cat["Horas Maquina"] || 0;
  const cif = cat["Costos Indirectos"] || 0;
  const mes8 = Math.round((mat + serv + mod + hm + cif) * 100) / 100;
  if (mes8 > 0) {
    totalSep += mes8;
    results.push({
      cta: p.cuentaAuxiliar,
      desc: p.descripcion,
      mes8,
      mat,
      serv,
      mod,
      hm,
      cif
    });
  }
});

results.sort((a, b) => b.mes8 - a.mes8);

console.log(`Proyectos en Septiembre: ${results.length}`);
console.log(`Total Septiembre: ${totalSep.toFixed(2)} | Target: 1613225 | Diff: ${(totalSep - 1613225).toFixed(2)}`);

console.log("\nTop 10 Proyectos:");
results.slice(0, 10).forEach((r, idx) => {
  console.log(`${idx + 1}. ${r.cta}: $${r.mes8.toLocaleString('de-DE')} (${((r.mes8 / 1613225) * 100).toFixed(1)}%) - ${r.desc.slice(0, 30)}`);
});

const top10Sum = results.slice(0, 10).reduce((acc, r) => acc + r.mes8, 0);
console.log(`\nSuma Top 10: $${top10Sum.toLocaleString('de-DE')} (${((top10Sum / 1613225) * 100).toFixed(1)}%)`);
const restSum = results.slice(10).reduce((acc, r) => acc + r.mes8, 0);
console.log(`Suma Restantes 15: $${restSum.toLocaleString('de-DE')} (${((restSum / 1613225) * 100).toFixed(1)}%)`);
