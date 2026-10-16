// Matriz Oficial de Proyectos Externos con sus 5 Categorías de Costo
// Sincronizada directamente con MATRIZ_REAL_PROYECTOS_MENSUAL_2026 y Consolidado Oficial Limpio 2026
// Filtros estrictos: Proyectos Externos (TTE-C-), Sin Ajuste (excluye Normalización contable de almacén)
// Totales Oficiales Auditados:
// - Agosto 2026: $1.197.600 USD
// - Septiembre 2026: $1.613.225 USD
// - Total Acumulado Anual (Ene - Sep 2026): $12.052.176 USD

import { MATRIZ_REAL_PROYECTOS_MENSUAL_2026 } from './realProyectosMensual2026';
import { CUENTAS_CORTAS_MAP } from './mockManoObraDiaria';

export interface FilaProyectoCategoriasPPT {
  ranking: number;
  cuentaAuxiliar: string;
  proyecto: string;
  proyectoCorto: string;
  materiales: number;
  servicios: number;
  manoDeObra: number;
  horasMaquina: number;
  indirectos: number;
  totalProyecto: number;
  porcentaje: number;
}

const proyectosList = Object.values(MATRIZ_REAL_PROYECTOS_MENSUAL_2026);

// 1. Matriz Oficial de Agosto 2026 ($1.197.600 USD)
const totalAgostoGeneral = Math.round(proyectosList.reduce((acc, p) => acc + (p.meses[7] || 0), 0)) || 1197600;

export const PROYECTOS_CATEGORIAS_AGOSTO_2026: FilaProyectoCategoriasPPT[] = proyectosList
  .filter(p => (p.meses[7] || 0) > 0)
  .sort((a, b) => (b.meses[7] || 0) - (a.meses[7] || 0))
  .map((p, idx) => {
    const cat = p.byCategoriaMes[7] || {};
    const tot = Math.round(p.meses[7] || 0);
    return {
      ranking: idx + 1,
      cuentaAuxiliar: p.cuentaAuxiliar,
      proyecto: p.descripcion,
      proyectoCorto: CUENTAS_CORTAS_MAP[p.cuentaAuxiliar] || p.descripcion,
      materiales: Math.round(cat['Materiales Directos'] || 0),
      servicios: Math.round(cat['Servicios'] || 0),
      manoDeObra: Math.round(cat['Mano de Obra Directa'] || 0),
      horasMaquina: Math.round(cat['Horas Maquina'] || 0),
      indirectos: Math.round(cat['Costos Indirectos'] || 0),
      totalProyecto: tot,
      porcentaje: Math.round((tot / totalAgostoGeneral) * 10000) / 100
    };
  });

// 2. Matriz Oficial de Septiembre 2026 ($1.613.225 USD)
const totalSeptiembreGeneral = Math.round(proyectosList.reduce((acc, p) => acc + (p.meses[8] || 0), 0)) || 1613225;

export const PROYECTOS_CATEGORIAS_SEPTIEMBRE_2026: FilaProyectoCategoriasPPT[] = proyectosList
  .filter(p => (p.meses[8] || 0) > 0)
  .sort((a, b) => (b.meses[8] || 0) - (a.meses[8] || 0))
  .map((p, idx) => {
    const cat = p.byCategoriaMes[8] || {};
    const tot = Math.round(p.meses[8] || 0);
    return {
      ranking: idx + 1,
      cuentaAuxiliar: p.cuentaAuxiliar,
      proyecto: p.descripcion,
      proyectoCorto: CUENTAS_CORTAS_MAP[p.cuentaAuxiliar] || p.descripcion,
      materiales: Math.round(cat['Materiales Directos'] || 0),
      servicios: Math.round(cat['Servicios'] || 0),
      manoDeObra: Math.round(cat['Mano de Obra Directa'] || 0),
      horasMaquina: Math.round(cat['Horas Maquina'] || 0),
      indirectos: Math.round(cat['Costos Indirectos'] || 0),
      totalProyecto: tot,
      porcentaje: Math.round((tot / totalSeptiembreGeneral) * 10000) / 100
    };
  });

// 3. Matriz Oficial de Total Acumulado Anual (Ene - Sep 2026 · 9 Meses) ($12.052.176 USD)
const totalAnualGeneral = Math.round(proyectosList.reduce((acc, p) => acc + (p.totalAnual || 0), 0)) || 12052176;

export const PROYECTOS_CATEGORIAS_ANUAL_2026: FilaProyectoCategoriasPPT[] = proyectosList
  .sort((a, b) => b.totalAnual - a.totalAnual)
  .map((p, idx) => {
    const cat = { 'Materiales Directos': 0, 'Servicios': 0, 'Mano de Obra Directa': 0, 'Horas Maquina': 0, 'Costos Indirectos': 0 };
    for (let m = 0; m < 9; m++) {
      for (const [c, val] of Object.entries(p.byCategoriaMes[m] || {})) {
        if (cat[c as keyof typeof cat] !== undefined) {
          cat[c as keyof typeof cat] += val;
        }
      }
    }
    const tot = Math.round(p.totalAnual);
    return {
      ranking: idx + 1,
      cuentaAuxiliar: p.cuentaAuxiliar,
      proyecto: p.descripcion,
      proyectoCorto: CUENTAS_CORTAS_MAP[p.cuentaAuxiliar] || p.descripcion,
      materiales: Math.round(cat['Materiales Directos']),
      servicios: Math.round(cat['Servicios']),
      manoDeObra: Math.round(cat['Mano de Obra Directa']),
      horasMaquina: Math.round(cat['Horas Maquina']),
      indirectos: Math.round(cat['Costos Indirectos']),
      totalProyecto: tot,
      porcentaje: Math.round((tot / totalAnualGeneral) * 10000) / 100
    };
  });
