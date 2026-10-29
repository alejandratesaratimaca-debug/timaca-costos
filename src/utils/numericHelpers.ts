/**
 * Utilidades Numéricas y de Formato Defensivo - TIMACA Costos
 * Protege todas las conversiones numéricas contra NaN, null, undefined,
 * y formatea valores monetarios y cantidades de forma consistente.
 */

/**
 * Convierte de manera segura cualquier valor a un número finito.
 * Maneja cadenas con formatos localizados (comas y puntos decimales).
 */
export function safeNumber(value: unknown, fallback = 0): number {
  if (value === null || value === undefined || value === '') {
    return fallback;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : fallback;
  }

  if (typeof value === 'boolean') {
    return value ? 1 : 0;
  }

  if (typeof value === 'string') {
    const cleanStr = value.trim();
    if (!cleanStr) return fallback;

    // Detectar si usa coma como separador decimal (ej. "1.234,56" o "3500,50")
    // Si contiene coma y punto:
    if (cleanStr.includes(',') && cleanStr.includes('.')) {
      const lastComma = cleanStr.lastIndexOf(',');
      const lastDot = cleanStr.lastIndexOf('.');
      if (lastComma > lastDot) {
        // Formato europeo/latino: 1.234,56 -> 1234.56
        const normalized = cleanStr.replace(/\./g, '').replace(',', '.');
        const parsed = parseFloat(normalized);
        return Number.isFinite(parsed) ? parsed : fallback;
      } else {
        // Formato anglosajón: 1,234.56 -> 1234.56
        const normalized = cleanStr.replace(/,/g, '');
        const parsed = parseFloat(normalized);
        return Number.isFinite(parsed) ? parsed : fallback;
      }
    }

    // Solo contiene coma (ej: "3500,50" o "12,5")
    if (cleanStr.includes(',')) {
      const normalized = cleanStr.replace(',', '.');
      const parsed = parseFloat(normalized);
      return Number.isFinite(parsed) ? parsed : fallback;
    }

    // Solo contiene punto o solo dígitos
    const parsed = parseFloat(cleanStr);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
}

/**
 * Formatea un valor monetario en USD con protección contra NaN y valores nulos.
 * Salida garantizada: "$1,234.56" o "$0.00"
 */
export function safeFormatUSD(value: unknown, showCents = true): string {
  const num = safeNumber(value, 0);
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: showCents ? 2 : 0,
      maximumFractionDigits: showCents ? 2 : 0,
    }).format(num);
  } catch {
    return `$${num.toFixed(2)}`;
  }
}

/**
 * Formatea una cantidad numérica con separador de miles y decimales opcionales.
 * Salida garantizada: "1,234.50" o "0"
 */
export function safeFormatQuantity(value: unknown, maxDecimals = 2): string {
  const num = safeNumber(value, 0);
  try {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: maxDecimals,
    }).format(num);
  } catch {
    return num.toFixed(maxDecimals);
  }
}

/**
 * Calcula un porcentaje de manera segura evitando divisiones por cero o resultados NaN/Infinity.
 * Salida garantizada: "25.4%" o "0.0%"
 */
export function safePercent(numerator: unknown, denominator: unknown, decimals = 1): string {
  const num = safeNumber(numerator, 0);
  const den = safeNumber(denominator, 0);
  if (den <= 0) return '0.0%';
  const pct = (num / den) * 100;
  return `${pct.toFixed(decimals)}%`;
}

/**
 * Realiza una sumatoria segura redondeada a 2 decimales para evitar problemas de coma flotante.
 */
export function safeSum<T>(items: T[], getter: (item: T) => unknown): number {
  if (!items || !Array.isArray(items)) return 0;
  let sum = 0;
  for (const item of items) {
    sum += safeNumber(getter(item), 0);
  }
  return Math.round(sum * 100) / 100;
}
