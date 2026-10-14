// Matriz Oficial de Costos Indirectos a Prorratear (Enero - Septiembre 2026)
// Coincidencia exacta con 3 Analisis Costos Indirectos.xlsx y Modelo Estrella TIMACA

export interface FilaCostoIndirectoOficial {
  id: string;
  concepto: string;
  ene: number;
  feb: number;
  mar: number;
  abr: number;
  may: number;
  jun: number;
  jul: number;
  ago: number;
  sep?: number;
  total: number;
  esDirectoPellas?: boolean;
}

export const TABLA_COSTOS_INDIRECTOS_OFICIAL: FilaCostoIndirectoOficial[] = [
  {
    id: 'ind-01',
    concepto: 'Combustible',
    ene: 22074,
    feb: 27425,
    mar: 32224,
    abr: 7353,
    may: 6392,
    jun: 8628,
    jul: 9875,
    ago: 19239,
    sep: 50413,
    total: 183623
  },
  {
    id: 'ind-02',
    concepto: 'Gastos de asociación/Subscripción',
    ene: 56,
    feb: 102,
    mar: 123,
    abr: 116,
    may: 56,
    jun: 55,
    jul: 0,
    ago: 0,
    sep: 56,
    total: 564
  },
  {
    id: 'ind-03',
    concepto: 'Gastos de Seguro',
    ene: 0,
    feb: 92,
    mar: 0,
    abr: 165,
    may: 30,
    jun: 318,
    jul: 0,
    ago: 0,
    sep: 277,
    total: 882
  },
  {
    id: 'ind-04',
    concepto: 'Gastos Funebres',
    ene: 0,
    feb: 0,
    mar: 0,
    abr: 2176,
    may: 0,
    jun: 0,
    jul: 0,
    ago: 0,
    sep: 0,
    total: 2176
  },
  {
    id: 'ind-05',
    concepto: 'Honorarios Profesionales Soporte SIP',
    ene: 120,
    feb: 116,
    mar: 120,
    abr: 120,
    may: 120,
    jun: 120,
    jul: 120,
    ago: 120,
    sep: 250,
    total: 1206
  },
  {
    id: 'ind-06',
    concepto: 'Incentivos Laborales (Bonos)',
    ene: 0,
    feb: 0,
    mar: 0,
    abr: 0,
    may: 0,
    jun: 0,
    jul: 0,
    ago: 0,
    sep: 6700,
    total: 6700
  },
  {
    id: 'ind-07',
    concepto: 'Nomina Interna TIMACA',
    ene: 88000,
    feb: 87000,
    mar: 104000,
    abr: 95000,
    may: 153000,
    jun: 132000,
    jul: 128000,
    ago: 125000,
    sep: 73000,
    total: 985000
  },
  {
    id: 'ind-08',
    concepto: 'Nomina -TALLERES',
    ene: 0,
    feb: 0,
    mar: 0,
    abr: 0,
    may: 0,
    jun: 0,
    jul: 0,
    ago: 0,
    sep: 122000,
    total: 122000
  },
  {
    id: 'ind-09',
    concepto: 'Otros Servicios Contratados de Admón.',
    ene: 0,
    feb: 0,
    mar: 0,
    abr: 0,
    may: 0,
    jun: 14,
    jul: 0,
    ago: 0,
    sep: 0,
    total: 14
  },
  {
    id: 'ind-10',
    concepto: 'Servicios Publicos',
    ene: 2467,
    feb: 268,
    mar: 1344,
    abr: 1549,
    may: 1542,
    jun: 1562,
    jul: 1562,
    ago: 1562,
    sep: 2556,
    total: 14413
  },
  {
    id: 'ind-11',
    concepto: 'Servicios Telecomunicaciones',
    ene: 159,
    feb: 184,
    mar: 596,
    abr: 717,
    may: 589,
    jun: 614,
    jul: 0,
    ago: 0,
    sep: 570,
    total: 3429
  },
  {
    id: 'ind-12',
    concepto: 'Sindicato',
    ene: 57000,
    feb: 54898,
    mar: 57000,
    abr: 57000,
    may: 57000,
    jun: 57000,
    jul: 57000,
    ago: 57000,
    sep: 58952,
    total: 512850
  },
  {
    id: 'ind-13',
    concepto: 'Timbres Fiscales / Notarias / Registros',
    ene: 0,
    feb: 0,
    mar: 0,
    abr: 0,
    may: 0,
    jun: 726,
    jul: 0,
    ago: 0,
    sep: 7634,
    total: 8360
  },
  {
    id: 'ind-14',
    concepto: 'Vigilancia',
    ene: 3521,
    feb: 3391,
    mar: 3880,
    abr: 4214,
    may: 4907,
    jun: 5718,
    jul: 4588,
    ago: 4587,
    sep: 4803,
    total: 39609
  },
  {
    id: 'ind-15',
    concepto: 'Gastos de viajes/viáticos nacionales',
    ene: 351,
    feb: 393,
    mar: 2353,
    abr: 3964,
    may: 1940,
    jun: 1523,
    jul: 2267,
    ago: 1259,
    sep: 4124,
    total: 18174
  }
];

export const TOTALES_COSTOS_INDIRECTOS_OFICIAL = {
  ene: 173397,
  feb: 173476,
  mar: 199287,
  abr: 168410,
  may: 223636,
  jun: 206755,
  jul: 201145,
  ago: 212978,
  sep: 341375,
  total: 1900458
};
