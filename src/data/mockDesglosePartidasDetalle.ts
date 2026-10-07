// Base de datos estricta de desglose partida por partida (drill-down)
// Modo Estricto: CERO simulaciones, CERO generadores aleatorios, CERO fallbacks sintéticos.
// Si no existen registros reales para una partida o proyecto, retorna lista vacía [].

import { SALIDAS_REALES_AGOSTO_2026 } from './realSalidasUnificada2026';
import { CUENTAS_CORTAS_MAP } from './mockManoObraDiaria';

export interface ItemPartidaDetalle {
  id: string;
  conceptoPadre: string;
  categoria: string;
  proyectoCodigo: string;
  proyectoNombre: string;
  itemDescripcion: string;
  cantidad: number;
  unidad: string;
  precioUnitario: number;
  montoTotal: number;
  motivo: string;
  comprobante: string;
  fecha: string;
  responsable: string;
}

/**
 * Consulta estricta de partidas detalladas.
 * Filtra únicamente sobre los registros reales de la matriz Unificada.
 * Si no existen registros para el concepto/proyecto solicitado, devuelve un arreglo vacío [].
 */
export function obtenerDesgloseSubconcepto(
  concepto: string,
  categoria: string,
  proyectoCodigo?: string
): ItemPartidaDetalle[] {
  const normConcepto = concepto.toLowerCase().trim();
  const normCategoria = categoria.toLowerCase().trim();

  const matching = SALIDAS_REALES_AGOSTO_2026.filter(s => {
    // Excluir normalizaciones
    if (s.isNormalizacion) return false;

    // Filtro por proyecto si se especifica y no es TODOS
    if (proyectoCodigo && proyectoCodigo !== 'TODOS') {
      if (s.cuentaAuxiliarCodigo !== proyectoCodigo) return false;
    }

    // Coincidencia con categoría o subcategoría o descripción
    const cat = (s.categoria || '').toLowerCase().trim();
    const sub = (s.subcategoria || '').toLowerCase().trim();
    const desc = (s.itemDescripcion || '').toLowerCase().trim();

    if (cat === normCategoria || cat.includes(normCategoria)) {
      if (sub === normConcepto || sub.includes(normConcepto) || normConcepto.includes(sub)) return true;
      if (desc.includes(normConcepto)) return true;
    }

    if (sub === normConcepto || sub.includes(normConcepto)) return true;
    if (desc.includes(normConcepto)) return true;

    return false;
  });

  return matching.map((s, idx) => ({
    id: s.id || `det-${idx + 1}`,
    conceptoPadre: concepto,
    categoria: s.categoria || categoria,
    proyectoCodigo: s.cuentaAuxiliarCodigo,
    proyectoNombre: CUENTAS_CORTAS_MAP[s.cuentaAuxiliarCodigo] || s.cuentaAuxiliarNombre || s.proyecto,
    itemDescripcion: s.itemDescripcion,
    cantidad: s.cantidad,
    unidad: s.unidadMedida,
    precioUnitario: s.montoUnitario,
    montoTotal: s.montoTotal,
    motivo: s.motivo,
    comprobante: s.codigoSalida,
    fecha: s.fecha,
    responsable: s.solicitante || s.responsable
  }));
}
