// Matriz Oficial de Proyectos Externos con sus 5 Categorías de Costo
// Sincronizada directamente con MATRIZ_REAL_PROYECTOS_MENSUAL_2026, 4 Master Unificado y Modelo Estrella TIMACA
// Filtros estrictos: Proyectos Externos (TTE-C), Sin Ajuste (excluye Normalización y MANUAL)
// Totales Oficiales: Agosto = $1.290.177 USD | Anual 2026 = $11.809.472 USD

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

// 1. Matriz Oficial de Agosto 2026 ($1.345.010 USD)
const totalAgostoGeneral = 1345010;

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

// 2. Matriz Oficial de Total Acumulado Anual 2026 ($11.804.998 USD)
const totalAnualGeneral = 11804998;

export const PROYECTOS_CATEGORIAS_ANUAL_2026: FilaProyectoCategoriasPPT[] = proyectosList
  .sort((a, b) => b.totalAnual - a.totalAnual)
  .map((p, idx) => {
    const cat = { 'Materiales Directos': 0, 'Servicios': 0, 'Mano de Obra Directa': 0, 'Horas Maquina': 0, 'Costos Indirectos': 0 };
    for (let m = 0; m < 8; m++) {
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
