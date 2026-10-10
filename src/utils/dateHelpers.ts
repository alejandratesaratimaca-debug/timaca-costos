export const MESES_ESP = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// Mapeo oficial de Semanas Operativas TIMACA por Mes (Cortes de Nómina RRHH 2026)
// Este mapa resuelve el desfase donde la Semana 31 tiene "Fecha Desde" a finales de Julio (28-31 Jul)
// pero RRHH y Contabilidad de Costos la imputan 100% a AGOSTO.
export const TIMACA_SEMANAS_MES_MAP_2026: Record<number, { mes: number; mesNombre: string; fechaReferencia: string }> = {
  // Enero
  1: { mes: 1, mesNombre: 'Enero', fechaReferencia: '2026-01-09' },
  2: { mes: 1, mesNombre: 'Enero', fechaReferencia: '2026-01-16' },
  3: { mes: 1, mesNombre: 'Enero', fechaReferencia: '2026-01-23' },
  4: { mes: 1, mesNombre: 'Enero', fechaReferencia: '2026-01-30' },
  // Febrero
  5: { mes: 2, mesNombre: 'Febrero', fechaReferencia: '2026-02-06' },
  6: { mes: 2, mesNombre: 'Febrero', fechaReferencia: '2026-02-13' },
  7: { mes: 2, mesNombre: 'Febrero', fechaReferencia: '2026-02-20' },
  8: { mes: 2, mesNombre: 'Febrero', fechaReferencia: '2026-02-27' },
  // Marzo
  9: { mes: 3, mesNombre: 'Marzo', fechaReferencia: '2026-03-06' },
  10: { mes: 3, mesNombre: 'Marzo', fechaReferencia: '2026-03-13' },
  11: { mes: 3, mesNombre: 'Marzo', fechaReferencia: '2026-03-20' },
  12: { mes: 3, mesNombre: 'Marzo', fechaReferencia: '2026-03-27' },
  13: { mes: 3, mesNombre: 'Marzo', fechaReferencia: '2026-03-31' },
  // Abril
  14: { mes: 4, mesNombre: 'Abril', fechaReferencia: '2026-04-10' },
  15: { mes: 4, mesNombre: 'Abril', fechaReferencia: '2026-04-17' },
  16: { mes: 4, mesNombre: 'Abril', fechaReferencia: '2026-04-24' },
  17: { mes: 4, mesNombre: 'Abril', fechaReferencia: '2026-04-30' },
  // Mayo
  18: { mes: 5, mesNombre: 'Mayo', fechaReferencia: '2026-05-08' },
  19: { mes: 5, mesNombre: 'Mayo', fechaReferencia: '2026-05-15' },
  20: { mes: 5, mesNombre: 'Mayo', fechaReferencia: '2026-05-22' },
  21: { mes: 5, mesNombre: 'Mayo', fechaReferencia: '2026-05-29' },
  // Junio
  22: { mes: 6, mesNombre: 'Junio', fechaReferencia: '2026-06-05' },
  23: { mes: 6, mesNombre: 'Junio', fechaReferencia: '2026-06-12' },
  24: { mes: 6, mesNombre: 'Junio', fechaReferencia: '2026-06-19' },
  25: { mes: 6, mesNombre: 'Junio', fechaReferencia: '2026-06-26' },
  26: { mes: 6, mesNombre: 'Junio', fechaReferencia: '2026-06-30' },
  // Julio
  27: { mes: 7, mesNombre: 'Julio', fechaReferencia: '2026-07-10' },
  28: { mes: 7, mesNombre: 'Julio', fechaReferencia: '2026-07-17' },
  29: { mes: 7, mesNombre: 'Julio', fechaReferencia: '2026-07-24' },
  30: { mes: 7, mesNombre: 'Julio', fechaReferencia: '2026-07-31' },
  // Agosto (Corte exacto RRHH: Semanas 31, 32, 33 y 34)
  31: { mes: 8, mesNombre: 'Agosto', fechaReferencia: '2026-08-07' },
  32: { mes: 8, mesNombre: 'Agosto', fechaReferencia: '2026-08-14' },
  33: { mes: 8, mesNombre: 'Agosto', fechaReferencia: '2026-08-21' },
  34: { mes: 8, mesNombre: 'Agosto', fechaReferencia: '2026-08-28' },
  // Septiembre
  35: { mes: 9, mesNombre: 'Septiembre', fechaReferencia: '2026-09-04' },
  36: { mes: 9, mesNombre: 'Septiembre', fechaReferencia: '2026-09-11' },
  37: { mes: 9, mesNombre: 'Septiembre', fechaReferencia: '2026-09-18' },
  38: { mes: 9, mesNombre: 'Septiembre', fechaReferencia: '2026-09-25' },
  39: { mes: 9, mesNombre: 'Septiembre', fechaReferencia: '2026-09-30' },
  // Octubre
  40: { mes: 10, mesNombre: 'Octubre', fechaReferencia: '2026-10-09' },
  41: { mes: 10, mesNombre: 'Octubre', fechaReferencia: '2026-10-16' },
  42: { mes: 10, mesNombre: 'Octubre', fechaReferencia: '2026-10-23' },
  43: { mes: 10, mesNombre: 'Octubre', fechaReferencia: '2026-10-30' },
  // Noviembre
  44: { mes: 11, mesNombre: 'Noviembre', fechaReferencia: '2026-11-06' },
  45: { mes: 11, mesNombre: 'Noviembre', fechaReferencia: '2026-11-13' },
  46: { mes: 11, mesNombre: 'Noviembre', fechaReferencia: '2026-11-20' },
  47: { mes: 11, mesNombre: 'Noviembre', fechaReferencia: '2026-11-27' },
  // Diciembre
  48: { mes: 12, mesNombre: 'Diciembre', fechaReferencia: '2026-12-04' },
  49: { mes: 12, mesNombre: 'Diciembre', fechaReferencia: '2026-12-11' },
  50: { mes: 12, mesNombre: 'Diciembre', fechaReferencia: '2026-12-18' },
  51: { mes: 12, mesNombre: 'Diciembre', fechaReferencia: '2026-12-24' },
  52: { mes: 12, mesNombre: 'Diciembre', fechaReferencia: '2026-12-31' },
};

export function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

// Analizador de fechas y semanas de nómina / salidas
export function parseFechaToDetails(fechaStr: string, semanaExplicit?: number) {
  // Parse incoming date
  let d: Date | null = null;
  const cleanedStr = (fechaStr || '').trim().toLowerCase();

  if (cleanedStr) {
    // Si es un número serial de Excel de 4 o 5 dígitos (ej: 45890 o 45890.5 que corresponde a 2025/2026)
    if (/^\d{4,5}(\.\d+)?$/.test(cleanedStr)) {
      const serialNum = Math.floor(parseFloat(cleanedStr));
      // 25569 es el offset entre 1899-12-30 y 1970-01-01 en días
      d = new Date(Math.round((serialNum - 25569) * 86400 * 1000));
    }
    // Si es un nombre de mes en español
    else if (/^(ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic)/.test(cleanedStr)) {
      const mesNombresLower = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
      const mIdx = mesNombresLower.findIndex(mn => cleanedStr.startsWith(mn));
      if (mIdx !== -1) {
        d = new Date(2026, mIdx, 15);
      }
    }
    else if (cleanedStr.includes('/')) {
      const parts = cleanedStr.split('/');
      if (parts[0].length === 4) {
        d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      } else if (parseInt(parts[1]) > 12) {
        // DD/MM/YYYY
        d = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      } else {
        // LatAm DD/MM/YYYY
        d = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        if (isNaN(d.getTime())) {
          d = new Date(cleanedStr);
        }
      }
    } else if (cleanedStr.includes('-')) {
      const parts = cleanedStr.split('-');
      if (parts[0].length === 4) {
        d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      } else {
        d = new Date(cleanedStr + 'T00:00:00');
      }
    } else {
      const parsedD = new Date(cleanedStr);
      if (!isNaN(parsedD.getTime()) && parsedD.getFullYear() >= 2020 && parsedD.getFullYear() <= 2030) {
        d = parsedD;
      }
    }
  }

  // Si no hay fecha válida pero sí semana explícita (archivos de nómina con solo columna de semana)
  if ((!d || isNaN(d.getTime())) && semanaExplicit && semanaExplicit >= 1 && semanaExplicit <= 53) {
    const mapping = TIMACA_SEMANAS_MES_MAP_2026[semanaExplicit];
    if (mapping) {
      return {
        fechaStandard: mapping.fechaReferencia,
        ano: 2026,
        mes: mapping.mes,
        mesLabel: `${mapping.mesNombre} 2026`,
        mesNombre: mapping.mesNombre,
        semana: semanaExplicit,
        semanaLabel: `Semana ${semanaExplicit.toString().padStart(2, '0')}`,
        esAjusteNominaRRHH: true
      };
    }
  }

  if (!d || isNaN(d.getTime())) {
    d = new Date(2026, 7, 1); // Default a 01 de Agosto 2026
  }

  const ano = d.getFullYear();
  const rawMes = d.getMonth() + 1;
  const diaNum = d.getDate();
  const computedSemana = getWeekNumber(d);
  const semana = (semanaExplicit && semanaExplicit >= 1 && semanaExplicit <= 53) ? semanaExplicit : computedSemana;

  // Asignación contable de mes:
  // Si la semana es 31 (primera semana de agosto según corte RRHH TIMACA):
  // Aunque el día sea 28, 29, 30, 31 de Julio, se computa contablemente en AGOSTO.
  // Pero preservamos la fechaStandard real o correspondiente.
  let mesContable = rawMes;
  if (semana === 31 && rawMes === 7) {
    mesContable = 8;
  } else if (semanaExplicit && TIMACA_SEMANAS_MES_MAP_2026[semanaExplicit]) {
    mesContable = TIMACA_SEMANAS_MES_MAP_2026[semanaExplicit].mes;
  }

  const mesIndex = mesContable - 1;
  const mesLabel = `${MESES_ESP[mesIndex]} ${ano}`;
  const semanaLabel = `Semana ${semana.toString().padStart(2, '0')}`;

  const yyyy = ano;
  const mm = String(rawMes).padStart(2, '0');
  const dd = String(diaNum).padStart(2, '0');
  const fechaStandard = `${yyyy}-${mm}-${dd}`;

  return {
    fechaStandard,
    ano,
    mes: mesContable,
    mesLabel,
    mesNombre: MESES_ESP[mesIndex],
    semana,
    semanaLabel,
    esAjusteNominaRRHH: (semana === 31 && rawMes === 7)
  };
}

export function formatCurrency(amount: number, currency: 'USD' | 'VES' = 'USD'): string {
  const formatted = new Intl.NumberFormat('es-VE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(amount || 0));
  return currency === 'USD' ? `$ ${formatted}` : `Bs. ${formatted}`;
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('es-VE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(num || 0));
}

export function formatUnitPrice(price: number, currency: 'USD' | 'VES' = 'USD'): string {
  const num = Number(price) || 0;
  const formatted = new Intl.NumberFormat('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
  return currency === 'USD' ? `$ ${formatted}` : `Bs. ${formatted}`;
}

export function formatUnitPriceRaw(price: number): string {
  const num = Number(price) || 0;
  return new Intl.NumberFormat('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

