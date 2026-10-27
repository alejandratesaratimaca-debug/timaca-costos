import { MATRIZ_REAL_PROYECTOS_MENSUAL_2026 } from '../src/data/realProyectosMensual2026';

const updates: Record<string, number> = {
  'TTE-C-0706': 128161,
  'TTE-C-0671': 30305,
  'TTE-C-0680': 11870,
  'TTE-C-0668': 8392,
  'TTE-C-0669': 5218,
  'TTE-C-0656': 3762,
  'TTE-C-0670': 3420,
  'TTE-C-0694': 3420,
  'TTE-C-0655': 1768,
  'TTE-C-0678': 350,
  'TTE-C-0684': 0
};

const projs = Object.values(MATRIZ_REAL_PROYECTOS_MENSUAL_2026);

console.log("=== EXACT VARIATIONS (SEPTIEMBRE VS AGOSTO) ===");
const diffs: any[] = [];

projs.forEach(p => {
  const cat = { ...(p.byCategoriaMes[8] || {}) };
  if (updates[p.cuentaAuxiliar] !== undefined) {
    cat["Mano de Obra Directa"] = updates[p.cuentaAuxiliar];
  }
  const mat = cat["Materiales Directos"] || 0;
  const serv = cat["Servicios"] || 0;
  const mod = cat["Mano de Obra Directa"] || 0;
  const hm = cat["Horas Maquina"] || 0;
  const cif = cat["Costos Indirectos"] || 0;
  const sep = Math.round((mat + serv + mod + hm + cif) * 100) / 100;
  const ago = p.meses[7] || 0;

  if (sep > 0 || ago > 0) {
    const delta = sep - ago;
    const pct = ago > 0 ? (delta / ago) * 100 : 100;
    diffs.push({
      cta: p.cuentaAuxiliar,
      desc: p.descripcion,
      ago,
      sep,
      delta,
      pct
    });
  }
});

diffs.sort((a, b) => b.delta - a.delta);

diffs.slice(0, 10).forEach(d => {
  console.log(`${d.cta} (${d.desc.slice(0, 30)}): Ago=$${d.ago.toLocaleString('de-DE')} | Sep=$${d.sep.toLocaleString('de-DE')} | Delta=+$${Math.round(d.delta).toLocaleString('de-DE')} (${d.pct.toFixed(1)}%)`);
});

console.log("\nTop Decreases:");
diffs.slice(-7).reverse().forEach(d => {
  console.log(`${d.cta} (${d.desc.slice(0, 30)}): Ago=$${d.ago.toLocaleString('de-DE')} | Sep=$${d.sep.toLocaleString('de-DE')} | Delta=$${Math.round(d.delta).toLocaleString('de-DE')} (${d.pct.toFixed(1)}%)`);
});
