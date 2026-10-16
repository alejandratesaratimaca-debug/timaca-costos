import { MATRIZ_REAL_PROYECTOS_MENSUAL_2026 } from '../src/data/realProyectosMensual2026';

const projs = Object.values(MATRIZ_REAL_PROYECTOS_MENSUAL_2026).map(p => {
  const ago = Math.round((p.meses[7] || 0) * 100) / 100;
  const sep = Math.round((p.meses[8] || 0) * 100) / 100;
  const delta = Math.round((sep - ago) * 100) / 100;
  const pct = ago > 0 ? Math.round(((sep - ago) / ago) * 100) : (sep > 0 ? 100 : 0);
  return {
    cta: p.cuentaAuxiliar,
    desc: p.descripcion.substring(0, 40),
    ago,
    sep,
    delta,
    pct
  };
});

projs.sort((a,b) => b.delta - a.delta);
console.log('--- TOP ACELERACIONES Y DESACELERACIONES (AGOSTO -> SEPTIEMBRE) ---');
console.table(projs.filter(p => p.ago > 0 || p.sep > 0));
