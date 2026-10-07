/**
 * Regla de filtro obligatoria en toda la aplicación para excluir la "Normalización"
 * (traslados patrimoniales y reclasificaciones de balance).
 * 
 * Requisitos:
 * 1. Filtra y excluye todos los registros donde el campo 'Ajuste' (o 'Motivo')
 *    sea igual a 'Normalizacion' o contenga la palabra 'Normaliz'.
 * 2. Case-insensitive y sin distinción de tildes (acentos).
 */

export function isNormalizacion(
  record: {
    ajuste?: string;
    motivo?: string;
    tipoAjuste?: string;
    tipo_ajuste?: string;
    motivoAjuste?: string;
    conceptoAjuste?: string;
    observaciones?: string;
    itemDescripcion?: string;
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

  // 1. Campos específicos directos recomendados por la especificación: 'Ajuste' o 'Motivo'
  const directFields = [
    (record as any).ajuste,
    (record as any).motivo,
    (record as any).tipoAjuste,
    (record as any).tipo_ajuste,
    (record as any).motivoAjuste,
    (record as any).conceptoAjuste,
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

  // 2. Búsqueda dinámica en cualquier propiedad cuyo nombre contenga 'ajuste' o 'motivo'
  for (const [key, val] of Object.entries(record)) {
    if (typeof val === 'string' && val.trim() !== '') {
      const normKey = normalizeStr(key);
      if (normKey === 'ajuste' || normKey === 'motivo' || normKey.includes('ajuste') || normKey.includes('motivo')) {
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
 * Filtra un arreglo de registros excluyendo cualquier elemento identificado como Normalización
 */
export function filterSinNormalizacion<T extends Record<string, any>>(records: T[]): T[] {
  if (!Array.isArray(records)) return [];
  return records.filter(r => !isNormalizacion(r));
}
