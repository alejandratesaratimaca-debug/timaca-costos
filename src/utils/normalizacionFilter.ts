/**
 * Regla de filtro para clasificar o excluir Ajustes Históricos (Normalización y Manual).
 * 
 * Requisitos estrictos (confirmados por Alejandra Tesara):
 * 1. La palabra 'NORMALIZACION' o 'MANUAL' DEBE estar en la columna 'Ajuste'.
 * 2. NUNCA se debe evaluar el campo 'Motivo' ni 'Descripción', ya que las descripciones
 *    de mantenimiento técnico (ej: "se normalizó la falla", "revisión manual") son
 *    actividades operativas reales y NO ajustes de regularización patrimonial.
 */

export function isNormalizacion(
  record: {
    ajuste?: string;
    tipoAjuste?: string;
    tipo_ajuste?: string;
    motivoAjuste?: string;
    conceptoAjuste?: string;
    clasificacionAjuste?: string;
  } | Record<string, any> | null | undefined
): boolean {
  if (!record || typeof record !== 'object') return false;

  const normalizeStr = (val: any): string => {
    if (val === null || val === undefined) return '';
    return String(val)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  };

  // 1. Campos específicos directos de Ajuste (ESTRICTO: columna AJUSTE)
  const directFields = [
    (record as any).ajuste,
    (record as any).tipoAjuste,
    (record as any).tipo_ajuste,
    (record as any).clasificacionAjuste,
  ];

  for (const field of directFields) {
    if (field !== undefined && field !== null && field !== '') {
      const norm = normalizeStr(field);
      if (
        norm === 'normalizacion' || 
        norm.includes('normaliz') || 
        norm === 'manual' || 
        norm.includes('manual')
      ) {
        return true;
      }
    }
  }

  // 2. Búsqueda dinámica EXCLUSIVAMENTE en cualquier propiedad cuyo nombre sea o contenga 'ajuste' (NUNCA motivo)
  for (const [key, val] of Object.entries(record)) {
    if (typeof val === 'string' && val.trim() !== '') {
      const normKey = normalizeStr(key);
      if (normKey === 'ajuste' || normKey.includes('ajuste')) {
        const normVal = normalizeStr(val);
        if (
          normVal === 'normalizacion' || 
          normVal.includes('normaliz') || 
          normVal === 'manual' || 
          normVal.includes('manual')
        ) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Filtra un arreglo de registros excluyendo cualquier elemento identificado como Normalización o Manual
 */
export function filterSinNormalizacion<T extends Record<string, any>>(records: T[]): T[] {
  if (!Array.isArray(records)) return [];
  return records.filter(r => !isNormalizacion(r));
}
