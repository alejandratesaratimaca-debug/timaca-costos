// Estructura oficial de desglose mensual por proyecto y categoría (PowerPoint de Costos TIMACA)
// Coincidencia exacta con la lámina oficial: "PROYECTO PELLAS 1: SERVICIOS DIRECTOS"

export interface FilaDesgloseMensual {
  concepto: string;
  ctaAuxiliar?: string;
  porcentaje?: number;
  ene?: number;
  feb?: number;
  mar?: number;
  abr: number;
  may: number;
  jun: number;
  jul: number;
  ago: number;
  sep?: number;
  total: number;
  detalle?: string;
}

export interface DesgloseProyectoCategoria {
  cuentaAuxiliar: string;
  proyecto: string;
  proyectoCorto: string;
  categoria: string;
  tituloLamina: string;
  filas: FilaDesgloseMensual[];
  totalAbr: number;
  totalMay: number;
  totalJun: number;
  totalJul: number;
  totalAgo: number;
  totalSep?: number;
  totalGeneral: number;
}

// 1. DESGLOSE EXACTO DE SERVICIOS DIRECTOS - PROYECTO PELLAS 1 (LÁMINA OFICIAL ALEJANDRA)
export const SERVICIOS_PELLAS_1_EXACTO: FilaDesgloseMensual[] = [
  { concepto: 'Alquiler de baños portátiles y sanitarios', abr: 0, may: 4800, jun: 18360, jul: 4900, ago: 4900, sep: 8400, total: 41360 },
  { concepto: 'Examenes medicos', abr: 0, may: 75, jun: 975, jul: 1709, ago: 1162, sep: 383, total: 4304 },
  { concepto: 'Fabricacion de calcomanias', abr: 0, may: 0, jun: 0, jul: 229, ago: 0, sep: 0, total: 229 },
  { concepto: 'Fabricacion de puertas', abr: 0, may: 0, jun: 5870, jul: 0, ago: 0, sep: 0, total: 5870 },
  { concepto: 'Gastos viajes / viáticos nacionales', abr: 0, may: 0, jun: 0, jul: 127, ago: 0, sep: 0, total: 127 },
  { concepto: 'Honorarios profesionales', abr: 0, may: 0, jun: 50, jul: 0, ago: 0, sep: 0, total: 50 },
  { concepto: 'Mantenimiento de equipos externos', abr: 0, may: 0, jun: 0, jul: 0, ago: 60, sep: 6, total: 66 },
  { concepto: 'Serv. asociados a evento corporativo', abr: 0, may: 35, jun: 0, jul: 0, ago: 0, sep: 0, total: 35 },
  { concepto: 'Servicio ambiental de arborizacion', abr: 0, may: 0, jun: 0, jul: 0, ago: 120, sep: 0, total: 120 },
  { concepto: 'Servicio de camion cisterna', abr: 0, may: 0, jun: 100, jul: 400, ago: 300, sep: 350, total: 1150 },
  { concepto: 'Servicio de comida', abr: 48, may: 195, jun: 26, jul: 104, ago: 825, sep: 847, total: 2045 },
  { concepto: 'Servicio de cristaleria', abr: 0, may: 0, jun: 0, jul: 1755, ago: 0, sep: 0, total: 1755 },
  { concepto: 'Servicio de fumigacion', abr: 0, may: 0, jun: 0, jul: 600, ago: 0, sep: 0, total: 600 },
  { concepto: 'Servicio de inspecciones tecnicas', abr: 0, may: 0, jun: 0, jul: 1500, ago: 0, sep: 0, total: 1500 },
  { concepto: 'Servicio de taxi', abr: 0, may: 0, jun: 0, jul: 34, ago: 0, sep: 0, total: 34 },
  { concepto: 'Servicio mantenimiento de extintor', abr: 0, may: 0, jun: 0, jul: 0, ago: 448, sep: 0, total: 448 },
  { concepto: 'Servicio traslado de personal', abr: 0, may: 36340, jun: 34720, jul: 39995, ago: 44270, sep: 45878, total: 201203 },
  { concepto: 'Servicios de importacion', abr: 0, may: 0, jun: 0, jul: 0, ago: 439, sep: 0, total: 439 },
  { concepto: 'Vigilancia externa', abr: 0, may: 0, jun: 0, jul: 10582, ago: 10582, sep: 13182, total: 34346 },
  { concepto: 'Otros mantenimientos menores', abr: 0, may: 0, jun: 0, jul: 0, ago: 0, sep: 10, total: 10 }
];

// Generador de desgloses estructurados para cualquier proyecto y categoría
export const DESGLOSE_CATEGORIAS_PROYECTOS: Record<string, Record<string, FilaDesgloseMensual[]>> = {
  'Servicios': {
    // 1. Proyecto Pellas 1 (Lámina oficial exacta: Total Agosto = 63.106)
    'TTE-C-0706': SERVICIOS_PELLAS_1_EXACTO
  },
  'Materiales Directos': {
    'TTE-C-0706': [
      { concepto: 'Planchas y Perfiles Estructurales', abr: 35000, may: 28000, jun: 48000, jul: 32000, ago: 54000, total: 197000 },
      { concepto: 'Eq. Y Consumibles De Soldadura', abr: 18000, may: 15000, jun: 26000, jul: 17000, ago: 29000, total: 105000 },
      { concepto: 'Tuberías, Válvulas y Conexiones', abr: 12000, may: 9500, jun: 16500, jul: 11000, ago: 19000, total: 68000 },
      { concepto: 'Materiales Mecanicos', abr: 8500, may: 7200, jun: 12000, jul: 8000, ago: 13500, total: 49200 },
      { concepto: 'Tornillería y Elementos de Fijación', abr: 5200, may: 4100, jun: 7400, jul: 4900, ago: 8400, total: 30000 },
      { concepto: 'Eq. Y Acc De Oxicorte', abr: 3800, may: 3100, jun: 5200, jul: 3500, ago: 5900, total: 21500 },
      { concepto: 'Gas Envasado Argon', abr: 3100, may: 2500, jun: 4300, jul: 2800, ago: 4800, total: 17500 },
      { concepto: 'Equipos De Proteccion Personal', abr: 2800, may: 2300, jun: 3900, jul: 2600, ago: 4400, total: 16000 },
      { concepto: 'Equipos De Seguridad', abr: 2200, may: 1800, jun: 3100, jul: 2000, ago: 3400, total: 12500 },
      { concepto: 'Aceite Hidraulico', abr: 2100, may: 1700, jun: 2900, jul: 1900, ago: 3200, total: 11800 },
      { concepto: 'Costos De Elevación', abr: 1900, may: 1500, jun: 2600, jul: 1700, ago: 2900, total: 10600 },
      { concepto: 'Eq. E Instrumentos De Medicion', abr: 1500, may: 1200, jun: 2100, jul: 1400, ago: 2300, total: 8500 },
      { concepto: 'Adhesivo, Cemento Plastico, Selladores', abr: 1200, may: 950, jun: 1650, jul: 1100, ago: 1850, total: 6750 },
      { concepto: 'Cemento / Pego / Yeso/ Otros', abr: 950, may: 780, jun: 1350, jul: 900, ago: 1500, total: 5480 },
      { concepto: 'Arena, Piedra Y Aditivos Agregados', abr: 800, may: 650, jun: 1100, jul: 750, ago: 1250, total: 4550 },
      { concepto: 'Accesorios De Carroceria', abr: 650, may: 520, jun: 900, jul: 600, ago: 1020, total: 3690 },
      { concepto: 'Cauchos Y Tripas Para Vehiculos', abr: 550, may: 450, jun: 750, jul: 500, ago: 850, total: 3100 },
      { concepto: 'Bloques', abr: 420, may: 350, jun: 580, jul: 390, ago: 650, total: 2390 },
      { concepto: 'Costo De Hielo Y Agua Potable', abr: 380, may: 310, jun: 520, jul: 350, ago: 590, total: 2150 },
      { concepto: 'Comestibles / Bebidas', abr: 280, may: 230, jun: 390, jul: 260, ago: 440, total: 1600 }
    ],
    'TTE-C-0671': [
      { concepto: 'Planchas y Perfiles Estructurales', abr: 24000, may: 18000, jun: 31000, jul: 21000, ago: 36000, total: 130000 },
      { concepto: 'Eq. Y Consumibles De Soldadura', abr: 12000, may: 9500, jun: 16000, jul: 11000, ago: 19000, total: 67500 },
      { concepto: 'Tuberías, Válvulas y Conexiones', abr: 9000, may: 7200, jun: 12000, jul: 8000, ago: 14000, total: 50200 },
      { concepto: 'Materiales Mecanicos', abr: 6000, may: 4800, jun: 8200, jul: 5500, ago: 9500, total: 34000 },
      { concepto: 'Aceite Hidraulico', abr: 3500, may: 2800, jun: 4800, jul: 3200, ago: 5500, total: 19800 },
      { concepto: 'Gas Envasado Argon', abr: 2500, may: 2000, jun: 3400, jul: 2300, ago: 3900, total: 14100 },
      { concepto: 'Equipos De Proteccion Personal', abr: 2100, may: 1700, jun: 2800, jul: 1900, ago: 3300, total: 11800 }
    ],
    'TTE-C-0668': [
      { concepto: 'Planchas y Perfiles Estructurales', abr: 21000, may: 16000, jun: 28000, jul: 19000, ago: 33000, total: 117000 },
      { concepto: 'Eq. Y Consumibles De Soldadura', abr: 11000, may: 8800, jun: 15000, jul: 10000, ago: 17500, total: 62300 },
      { concepto: 'Materiales Mecanicos', abr: 7500, may: 6000, jun: 10000, jul: 6800, ago: 11800, total: 42100 },
      { concepto: 'Tornillería y Elementos de Fijación', abr: 4200, may: 3400, jun: 5700, jul: 3900, ago: 6600, total: 23800 },
      { concepto: 'Equipos De Seguridad', abr: 2100, may: 1700, jun: 2900, jul: 1900, ago: 3300, total: 11900 }
    ]
  },
  'Mano de Obra Directa': {
    // 1. TTE-C-0706 · Recuperación Línea 1 Planta de Pellas (Oficial Agosto: 133.185 USD · 60.17%)
    'TTE-C-0706': [
      { concepto: 'Cuadrilla Soldadores Calificados 6G / ASME IX', abr: 38400, may: 43800, jun: 33900, jul: 35600, ago: 37100, total: 188800 },
      { concepto: 'Paileros Fabricadores de Taller y Estructuras', abr: 28100, may: 32000, jun: 24800, jul: 26100, ago: 27150, total: 138150 },
      { concepto: 'Mecánicos Montadores de Equipos Rotativos', abr: 21500, may: 24500, jun: 18900, jul: 19900, ago: 20720, total: 105520 },
      { concepto: 'Armadores de Calderería y Virolas de Hornos', abr: 15600, may: 17800, jun: 13700, jul: 14400, ago: 15040, total: 76540 },
      { concepto: 'Electricistas e Instrumentistas de Planta', abr: 13100, may: 14900, jun: 11500, jul: 12100, ago: 12620, total: 64220 },
      { concepto: 'Ayudantes Técnicos de Soldadura y Montaje', abr: 9600, may: 10900, jun: 8400, jul: 8850, ago: 9230, total: 46980 },
      { concepto: 'Supervisores Residentes de Campo TIMACA', abr: 11809, may: 13485, jun: 10525, jul: 11012, ago: 11325, total: 58156 }
    ],
    // 2. TTE-C-0656 · Rehabilitación de Bandas Transportadoras PMH (Oficial Agosto: 28.142 USD · 12.71%)
    'TTE-C-0656': [
      { concepto: 'Cuadrilla Soldadores de Estructura de Bandas', abr: 7100, may: 8100, jun: 6250, jul: 6580, ago: 6850, total: 34880 },
      { concepto: 'Mecánicos Montadores de Rodillos y Polines', abr: 8200, may: 9350, jun: 7200, jul: 7600, ago: 7900, total: 40250 },
      { concepto: 'Paileros de Ajuste de Chasis y Torres', abr: 6400, may: 7300, jun: 5650, jul: 5950, ago: 6200, total: 31500 },
      { concepto: 'Electricistas de Fuerza y Sensores de Banda', abr: 4200, may: 4800, jun: 3700, jul: 3900, ago: 4050, total: 20650 },
      { concepto: 'Ayudantes de Cuadrilla y Seguridad Operativa', abr: 3250, may: 3700, jun: 2850, jul: 3000, ago: 3142, total: 15942 }
    ],
    // 3. TTE-C-0668 · Fase 2 Planta de Briquetas (Oficial Agosto: 15.221 USD · 6.88%)
    'TTE-C-0668': [
      { concepto: 'Cuadrilla Soldadores Especialistas de Briquetas', abr: 4800, may: 5450, jun: 4200, jul: 4420, ago: 4600, total: 23470 },
      { concepto: 'Paileros de Virolas y Planchas Antidesgaste', abr: 4300, may: 4900, jun: 3800, jul: 4000, ago: 4150, total: 21150 },
      { concepto: 'Mecánicos Ajustadores de Prensas Briqueteras', abr: 3900, may: 4450, jun: 3450, jul: 3620, ago: 3750, total: 19170 },
      { concepto: 'Ayudantes Técnicos de Taller y Planta', abr: 2800, may: 3200, jun: 2450, jul: 2600, ago: 2721, total: 13771 }
    ],
    // 4. TTE-C-0671 · Segunda Línea PMH - Ingeniería y Suministro (Oficial Agosto: 14.818 USD · 6.69%)
    'TTE-C-0671': [
      { concepto: 'Cuadrilla Soldadores de Estructura y Tuberías', abr: 5800, may: 6600, jun: 5100, jul: 5400, ago: 5600, total: 28500 },
      { concepto: 'Mecánicos de Montaje de Bandas y Reductores', abr: 4300, may: 4900, jun: 3800, jul: 4000, ago: 4160, total: 21160 },
      { concepto: 'Paileros de Ajuste y Montaje Estructural', abr: 3200, may: 3600, jun: 2800, jul: 3000, ago: 3120, total: 15720 },
      { concepto: 'Ayudantes de Cuadrilla y Seguridad', abr: 2000, may: 2300, jun: 1800, jul: 1900, ago: 1938, total: 9938 }
    ],
    // 5. TTE-C-0678 · Proyecto Pila HA y HB PMH (Oficial Agosto: 9.451 USD · 4.27%)
    'TTE-C-0678': [
      { concepto: 'Cuadrilla de Montaje Estructural Pila HA/HB', abr: 3500, may: 4000, jun: 3100, jul: 3250, ago: 3400, total: 17250 },
      { concepto: 'Mecánicos de Alineación y Tensado', abr: 3300, may: 3750, jun: 2900, jul: 3050, ago: 3200, total: 16200 },
      { concepto: 'Ayudantes Generales de Obra Pila HA/HB', abr: 2900, may: 3300, jun: 2550, jul: 2700, ago: 2851, total: 14301 }
    ],
    // 6. TTE-C-0680 · Mantenimiento Boca Grande II (Oficial Agosto: 9.307 USD · 4.20%)
    'TTE-C-0680': [
      { concepto: 'Mecánicos Navales e Industriales Boca Grande', abr: 3600, may: 4100, jun: 3150, jul: 3300, ago: 3450, total: 17600 },
      { concepto: 'Soldadores de Reparación de Casco y Grúa', abr: 3300, may: 3750, jun: 2900, jul: 3050, ago: 3200, total: 16200 },
      { concepto: 'Ayudantes de Mantenimiento Flotante', abr: 2750, may: 3150, jun: 2420, jul: 2550, ago: 2657, total: 13527 }
    ],
    // 7. TTE-C-0670 · Mantenimiento Máquinas Briqueteras (Oficial Agosto: 6.854 USD · 3.10%)
    'TTE-C-0670': [
      { concepto: 'Mecánicos Ajustadores de Briqueteras', abr: 3100, may: 3500, jun: 2700, jul: 2850, ago: 2980, total: 15130 },
      { concepto: 'Soldadores de Blindaje y Soldadura Dura', abr: 2300, may: 2600, jun: 2000, jul: 2120, ago: 2210, total: 11230 },
      { concepto: 'Ayudantes de Mantenimiento Briquetas', abr: 1700, may: 1950, jun: 1500, jul: 1590, ago: 1664, total: 8404 }
    ],
    // 8. TTE-C-0694 · Suministro Caldera Briquetas (Oficial Agosto: 2.514 USD · 1.14%)
    'TTE-C-0694': [
      { concepto: 'Caldereros y Soldadores de Presión', abr: 1400, may: 1600, jun: 1220, jul: 1290, ago: 1350, total: 6860 },
      { concepto: 'Ayudantes Técnicos de Calderería', abr: 1200, may: 1380, jun: 1050, jul: 1110, ago: 1164, total: 5904 }
    ],
    // 9. TTE-C-0684 · Fabricación de Gamelas FMO-PMH (Oficial Agosto: 1.411 USD · 0.64%)
    'TTE-C-0684': [
      { concepto: 'Paileros Fabricadores de Gamelas en Taller', abr: 850, may: 970, jun: 750, jul: 790, ago: 820, total: 4180 },
      { concepto: 'Soldadores de Estructura de Gamelas', abr: 600, may: 690, jun: 530, jul: 560, ago: 591, total: 2971 }
    ],
    // 10. TTE-C-0655 · Interconexión PMH (Oficial Agosto: 450 USD · 0.20%)
    'TTE-C-0655': [
      { concepto: 'Cuadrilla de Ajuste e Interconexión Eléctrica/Mecánica', abr: 470, may: 530, jun: 410, jul: 430, ago: 450, total: 2290 }
    ]
  },
  'Horas Maquina': {
    'TTE-C-0706': [
      { concepto: 'Torno Vertical Schiess (Maquinado corona y pista)', abr: 16500, may: 14200, jun: 18900, jul: 15400, ago: 19800, total: 84800 },
      { concepto: 'Gruas Telescopicas Liebherr 80T / 120T en Izamiento', abr: 14200, may: 12800, jun: 16500, jul: 13800, ago: 17400, total: 74700 },
      { concepto: 'Mandrinadora CNC Mecanizado de Alojamientos', abr: 11000, may: 9800, jun: 12400, jul: 10200, ago: 13100, total: 56500 },
      { concepto: 'Prensa Hidraulica 500 Toneladas Rolado de Planchas', abr: 8500, may: 7400, jun: 9800, jul: 8100, ago: 10200, total: 44000 },
      { concepto: 'Fresadora de Bancada y Cepillos Industriales', abr: 6200, may: 5400, jun: 7100, jul: 5900, ago: 7500, total: 32100 },
      { concepto: 'Generadores y Plantas Diesel de Obra', abr: 4200, may: 3700, jun: 4800, jul: 4000, ago: 5100, total: 21800 }
    ],
    'TTE-C-0671': [
      { concepto: 'Gruas de Izamiento de Celosias y Torres PMH', abr: 8500, may: 7600, jun: 9800, jul: 8200, ago: 10400, total: 44500 },
      { concepto: 'Torno Mecanico de Ejes y Rodillos de Banda', abr: 6400, may: 5700, jun: 7400, jul: 6100, ago: 7800, total: 33400 },
      { concepto: 'Prensa Hidraulica y Curvadora de Perfiles', abr: 4100, may: 3600, jun: 4700, jul: 3900, ago: 5000, total: 21300 }
    ]
  },
    'Costos Indirectos': {
    'TTE-C-0653': [
      { concepto: 'Nomina Interna TIMACA', ene: 0, feb: 0, mar: 0, abr: 0, may: 28454, jun: 3022, jul: 0, ago: 0, total: 31476 },
      { concepto: 'Sindicato', ene: 0, feb: 0, mar: 0, abr: 0, may: 10600, jun: 1305, jul: 0, ago: 0, total: 11905 },
      { concepto: 'Combustible', ene: 0, feb: 0, mar: 0, abr: 0, may: 1189, jun: 198, jul: 0, ago: 0, total: 1386 },
      { concepto: 'Vigilancia', ene: 0, feb: 0, mar: 0, abr: 0, may: 913, jun: 131, jul: 0, ago: 0, total: 1043 },
      { concepto: 'Servicios Publicos', ene: 0, feb: 0, mar: 0, abr: 0, may: 287, jun: 36, jul: 0, ago: 0, total: 323 },
      { concepto: 'Servicios Telecomunicaciones', ene: 0, feb: 0, mar: 0, abr: 0, may: 110, jun: 14, jul: 0, ago: 0, total: 124 },
      { concepto: 'Honorarios Profesionales Soporte SIP', ene: 0, feb: 0, mar: 0, abr: 0, may: 22, jun: 3, jul: 0, ago: 0, total: 25 },
      { concepto: 'Timbres Fiscales / Notarias / Registros', ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 17, jul: 0, ago: 0, total: 17 },
      { concepto: 'Gastos de Seguro', ene: 0, feb: 0, mar: 0, abr: 0, may: 6, jun: 7, jul: 0, ago: 0, total: 13 },
      { concepto: 'Gastos de asociación/Subscripción', ene: 0, feb: 0, mar: 0, abr: 0, may: 10, jun: 1, jul: 0, ago: 0, total: 12 },
      { concepto: 'Otros Servicios Contratados de Admón.', ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 0, total: 0 },
    ],
    'TTE-C-0654': [
      { concepto: 'Nomina Interna TIMACA', ene: 0, feb: 1529, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 0, total: 1529 },
      { concepto: 'Sindicato', ene: 0, feb: 965, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 0, total: 965 },
      { concepto: 'Combustible', ene: 0, feb: 482, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 0, total: 482 },
      { concepto: 'Vigilancia', ene: 0, feb: 60, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 0, total: 60 },
      { concepto: 'Servicios Publicos', ene: 0, feb: 5, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 0, total: 5 },
      { concepto: 'Servicios Telecomunicaciones', ene: 0, feb: 3, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 0, total: 3 },
      { concepto: 'Honorarios Profesionales Soporte SIP', ene: 0, feb: 2, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 0, total: 2 },
      { concepto: 'Gastos de asociación/Subscripción', ene: 0, feb: 2, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 0, total: 2 },
      { concepto: 'Gastos de Seguro', ene: 0, feb: 2, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 0, total: 2 },
    ],
    'TTE-C-0655': [
      { concepto: 'Nomina Interna TIMACA', ene: 2428, feb: 479, mar: 0, abr: 0, may: 0, jun: 0, jul: 96, ago: 254, total: 3257 },
      { concepto: 'Sindicato', ene: 1573, feb: 303, mar: 0, abr: 0, may: 0, jun: 0, jul: 43, ago: 116, total: 2034 },
      { concepto: 'Combustible', ene: 609, feb: 151, mar: 0, abr: 0, may: 0, jun: 0, jul: 7, ago: 39, total: 807 },
      { concepto: 'Nomina -TALLERES', ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 248, total: 248 },
      { concepto: 'Vigilancia', ene: 97, feb: 19, mar: 0, abr: 0, may: 0, jun: 0, jul: 3, ago: 9, total: 129 },
      { concepto: 'Servicios Publicos', ene: 68, feb: 1, mar: 0, abr: 0, may: 0, jun: 0, jul: 1, ago: 3, total: 74 },
      { concepto: 'Incentivos Laborales (Bonos)', ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 14, total: 14 },
      { concepto: 'Servicios Telecomunicaciones', ene: 4, feb: 1, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 0, total: 5 },
      { concepto: 'Honorarios Profesionales Soporte SIP', ene: 3, feb: 1, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 0, total: 4 },
      { concepto: 'Gastos de asociación/Subscripción', ene: 2, feb: 1, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 0, total: 2 },
      { concepto: 'Gastos de Seguro', ene: 0, feb: 1, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 0, total: 1 },
    ],
    'TTE-C-0656': [
      { concepto: 'Nomina Interna TIMACA', ene: 10719, feb: 12656, mar: 18164, abr: 15455, may: 12839, jun: 9020, jul: 16580, ago: 15892, total: 111326 },
      { concepto: 'Sindicato', ene: 6943, feb: 7986, mar: 9955, abr: 9273, may: 4783, jun: 3895, jul: 7383, ago: 7247, total: 57466 },
      { concepto: 'Combustible', ene: 2689, feb: 3990, mar: 5628, abr: 1196, may: 536, jun: 590, jul: 1279, ago: 2446, total: 18354 },
      { concepto: 'Nomina -TALLERES', ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 15511, total: 15511 },
      { concepto: 'Vigilancia', ene: 429, feb: 493, mar: 678, abr: 686, may: 412, jun: 391, jul: 594, ago: 583, total: 4265 },
      { concepto: 'Servicios Publicos', ene: 301, feb: 39, mar: 235, abr: 252, may: 129, jun: 107, jul: 202, ago: 199, total: 1463 },
      { concepto: 'Incentivos Laborales (Bonos)', ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 852, total: 852 },
      { concepto: 'Servicios Telecomunicaciones', ene: 19, feb: 27, mar: 104, abr: 117, may: 49, jun: 42, jul: 0, ago: 0, total: 358 },
      { concepto: 'Gastos Funebres', ene: 0, feb: 0, mar: 0, abr: 354, may: 0, jun: 0, jul: 0, ago: 0, total: 354 },
      { concepto: 'Honorarios Profesionales Soporte SIP', ene: 15, feb: 17, mar: 21, abr: 20, may: 10, jun: 8, jul: 16, ago: 15, total: 121 },
      { concepto: 'Gastos de asociación/Subscripción', ene: 7, feb: 15, mar: 21, abr: 19, may: 5, jun: 4, jul: 0, ago: 0, total: 71 },
      { concepto: 'Gastos de Seguro', ene: 0, feb: 13, mar: 0, abr: 27, may: 3, jun: 22, jul: 0, ago: 0, total: 64 },
      { concepto: 'Timbres Fiscales / Notarias / Registros', ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 50, jul: 0, ago: 0, total: 50 },
      { concepto: 'Otros Servicios Contratados de Admón.', ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 1, jul: 0, ago: 0, total: 1 },
    ],
    'TTE-C-0668': [
      { concepto: 'Nomina Interna TIMACA', ene: 6930, feb: 6357, mar: 9322, abr: 15048, may: 10177, jun: 7315, jul: 11633, ago: 8595, total: 75377 },
      { concepto: 'Sindicato', ene: 4489, feb: 4011, mar: 5109, abr: 9029, may: 3791, jun: 3159, jul: 5180, ago: 3920, total: 38688 },
      { concepto: 'Combustible', ene: 1738, feb: 2004, mar: 2888, abr: 1165, may: 425, jun: 478, jul: 897, ago: 1323, total: 10919 },
      { concepto: 'Nomina -TALLERES', ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 8389, total: 8389 },
      { concepto: 'Vigilancia', ene: 277, feb: 248, mar: 348, abr: 668, may: 326, jun: 317, jul: 417, ago: 315, total: 2916 },
      { concepto: 'Servicios Publicos', ene: 194, feb: 20, mar: 120, abr: 245, may: 103, jun: 87, jul: 142, ago: 107, total: 1018 },
      { concepto: 'Incentivos Laborales (Bonos)', ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 461, total: 461 },
      { concepto: 'Gastos Funebres', ene: 0, feb: 0, mar: 0, abr: 345, may: 0, jun: 0, jul: 0, ago: 0, total: 345 },
      { concepto: 'Servicios Telecomunicaciones', ene: 13, feb: 13, mar: 53, abr: 114, may: 39, jun: 34, jul: 0, ago: 0, total: 266 },
      { concepto: 'Honorarios Profesionales Soporte SIP', ene: 9, feb: 8, mar: 11, abr: 19, may: 8, jun: 7, jul: 11, ago: 8, total: 81 },
      { concepto: 'Gastos de Seguro', ene: 0, feb: 7, mar: 0, abr: 26, may: 2, jun: 18, jul: 0, ago: 0, total: 52 },
      { concepto: 'Gastos de asociación/Subscripción', ene: 4, feb: 7, mar: 11, abr: 18, may: 4, jun: 3, jul: 0, ago: 0, total: 48 },
      { concepto: 'Timbres Fiscales / Notarias / Registros', ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 40, jul: 0, ago: 0, total: 40 },
      { concepto: 'Otros Servicios Contratados de Admón.', ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 1, jul: 0, ago: 0, total: 1 },
    ],
    'TTE-C-0669': [
      { concepto: 'Nomina Interna TIMACA', ene: 2169, feb: 2415, mar: 2824, abr: 0, may: 0, jun: 0, jul: 0, ago: 0, total: 7408 },
      { concepto: 'Sindicato', ene: 1405, feb: 1524, mar: 1548, abr: 0, may: 0, jun: 0, jul: 0, ago: 0, total: 4477 },
      { concepto: 'Combustible', ene: 544, feb: 761, mar: 875, abr: 0, may: 0, jun: 0, jul: 0, ago: 0, total: 2180 },
      { concepto: 'Vigilancia', ene: 87, feb: 94, mar: 105, abr: 0, may: 0, jun: 0, jul: 0, ago: 0, total: 286 },
      { concepto: 'Servicios Publicos', ene: 61, feb: 7, mar: 36, abr: 0, may: 0, jun: 0, jul: 0, ago: 0, total: 105 },
      { concepto: 'Servicios Telecomunicaciones', ene: 4, feb: 5, mar: 16, abr: 0, may: 0, jun: 0, jul: 0, ago: 0, total: 25 },
      { concepto: 'Honorarios Profesionales Soporte SIP', ene: 3, feb: 3, mar: 3, abr: 0, may: 0, jun: 0, jul: 0, ago: 0, total: 9 },
      { concepto: 'Gastos de asociación/Subscripción', ene: 1, feb: 3, mar: 3, abr: 0, may: 0, jun: 0, jul: 0, ago: 0, total: 8 },
      { concepto: 'Gastos de Seguro', ene: 0, feb: 3, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 0, total: 3 },
    ],
    'TTE-C-0670': [
      { concepto: 'Nomina Interna TIMACA', ene: 1854, feb: 1850, mar: 2090, abr: 1395, may: 2271, jun: 1051, jul: 3981, ago: 3871, total: 18363 },
      { concepto: 'Sindicato', ene: 1201, feb: 1168, mar: 1146, abr: 837, may: 846, jun: 454, jul: 1773, ago: 1765, total: 9189 },
      { concepto: 'Nomina -TALLERES', ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 3778, total: 3778 },
      { concepto: 'Combustible', ene: 465, feb: 583, mar: 648, abr: 108, may: 95, jun: 69, jul: 307, ago: 596, total: 2870 },
      { concepto: 'Vigilancia', ene: 74, feb: 72, mar: 78, abr: 62, may: 73, jun: 46, jul: 143, ago: 142, total: 689 },
      { concepto: 'Servicios Publicos', ene: 52, feb: 6, mar: 27, abr: 23, may: 23, jun: 12, jul: 49, ago: 48, total: 240 },
      { concepto: 'Incentivos Laborales (Bonos)', ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 207, total: 207 },
      { concepto: 'Servicios Telecomunicaciones', ene: 3, feb: 4, mar: 12, abr: 11, may: 9, jun: 5, jul: 0, ago: 0, total: 43 },
      { concepto: 'Gastos Funebres', ene: 0, feb: 0, mar: 0, abr: 32, may: 0, jun: 0, jul: 0, ago: 0, total: 32 },
      { concepto: 'Honorarios Profesionales Soporte SIP', ene: 3, feb: 2, mar: 2, abr: 2, may: 2, jun: 1, jul: 4, ago: 4, total: 19 },
      { concepto: 'Gastos de asociación/Subscripción', ene: 1, feb: 2, mar: 2, abr: 2, may: 1, jun: 0, jul: 0, ago: 0, total: 9 },
      { concepto: 'Gastos de Seguro', ene: 0, feb: 2, mar: 0, abr: 2, may: 0, jun: 3, jul: 0, ago: 0, total: 7 },
      { concepto: 'Timbres Fiscales / Notarias / Registros', ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 6, jul: 0, ago: 0, total: 6 },
      { concepto: 'Otros Servicios Contratados de Admón.', ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 0, total: 0 },
    ],
    'TTE-C-0671': [
      { concepto: 'Nomina Interna TIMACA', ene: 0, feb: 0, mar: 0, abr: 112, may: 1647, jun: 6410, jul: 10732, ago: 8368, total: 27268 },
      { concepto: 'Sindicato', ene: 0, feb: 0, mar: 0, abr: 67, may: 614, jun: 2768, jul: 4779, ago: 3816, total: 12043 },
      { concepto: 'Nomina -TALLERES', ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 8167, total: 8167 },
      { concepto: 'Combustible', ene: 0, feb: 0, mar: 0, abr: 9, may: 69, jun: 419, jul: 828, ago: 1288, total: 2612 },
      { concepto: 'Vigilancia', ene: 0, feb: 0, mar: 0, abr: 5, may: 53, jun: 278, jul: 385, ago: 307, total: 1027 },
      { concepto: 'Incentivos Laborales (Bonos)', ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 449, total: 449 },
      { concepto: 'Servicios Publicos', ene: 0, feb: 0, mar: 0, abr: 2, may: 17, jun: 76, jul: 131, ago: 105, total: 330 },
      { concepto: 'Servicios Telecomunicaciones', ene: 0, feb: 0, mar: 0, abr: 1, may: 6, jun: 30, jul: 0, ago: 0, total: 37 },
      { concepto: 'Timbres Fiscales / Notarias / Registros', ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 35, jul: 0, ago: 0, total: 35 },
      { concepto: 'Honorarios Profesionales Soporte SIP', ene: 0, feb: 0, mar: 0, abr: 0, may: 1, jun: 6, jul: 10, ago: 8, total: 25 },
      { concepto: 'Gastos de Seguro', ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 15, jul: 0, ago: 0, total: 16 },
      { concepto: 'Gastos de asociación/Subscripción', ene: 0, feb: 0, mar: 0, abr: 0, may: 1, jun: 3, jul: 0, ago: 0, total: 3 },
      { concepto: 'Gastos Funebres', ene: 0, feb: 0, mar: 0, abr: 3, may: 0, jun: 0, jul: 0, ago: 0, total: 3 },
      { concepto: 'Otros Servicios Contratados de Admón.', ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 1, jul: 0, ago: 0, total: 1 },
    ],
    'TTE-C-0676': [
      { concepto: 'Nomina Interna TIMACA', ene: 55719, feb: 44563, mar: 44788, abr: 50887, may: 0, jun: 0, jul: 0, ago: 0, total: 195957 },
      { concepto: 'Sindicato', ene: 36091, feb: 28120, mar: 24547, abr: 30532, may: 0, jun: 0, jul: 0, ago: 0, total: 119290 },
      { concepto: 'Combustible', ene: 13977, feb: 14048, mar: 13877, abr: 3939, may: 0, jun: 0, jul: 0, ago: 0, total: 45840 },
      { concepto: 'Vigilancia', ene: 2229, feb: 1737, mar: 1671, abr: 2257, may: 0, jun: 0, jul: 0, ago: 0, total: 7895 },
      { concepto: 'Servicios Publicos', ene: 1562, feb: 137, mar: 579, abr: 830, may: 0, jun: 0, jul: 0, ago: 0, total: 3108 },
      { concepto: 'Gastos Funebres', ene: 0, feb: 0, mar: 0, abr: 1166, may: 0, jun: 0, jul: 0, ago: 0, total: 1166 },
      { concepto: 'Servicios Telecomunicaciones', ene: 101, feb: 94, mar: 257, abr: 384, may: 0, jun: 0, jul: 0, ago: 0, total: 836 },
      { concepto: 'Honorarios Profesionales Soporte SIP', ene: 76, feb: 59, mar: 52, abr: 64, may: 0, jun: 0, jul: 0, ago: 0, total: 251 },
      { concepto: 'Gastos de asociación/Subscripción', ene: 35, feb: 52, mar: 53, abr: 62, may: 0, jun: 0, jul: 0, ago: 0, total: 203 },
      { concepto: 'Gastos de Seguro', ene: 0, feb: 47, mar: 0, abr: 88, may: 0, jun: 0, jul: 0, ago: 0, total: 135 },
    ],
    'TTE-C-0678': [
      { concepto: 'Nomina Interna TIMACA', ene: 296, feb: 1498, mar: 5109, abr: 5347, may: 3231, jun: 9499, jul: 6519, ago: 5337, total: 36836 },
      { concepto: 'Sindicato', ene: 192, feb: 945, mar: 2800, abr: 3208, may: 1204, jun: 4102, jul: 2903, ago: 2434, total: 17788 },
      { concepto: 'Nomina -TALLERES', ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 5209, total: 5209 },
      { concepto: 'Combustible', ene: 74, feb: 472, mar: 1583, abr: 414, may: 135, jun: 621, jul: 503, ago: 821, total: 4624 },
      { concepto: 'Vigilancia', ene: 12, feb: 58, mar: 191, abr: 237, may: 104, jun: 411, jul: 234, ago: 196, total: 1442 },
      { concepto: 'Servicios Publicos', ene: 8, feb: 5, mar: 66, abr: 87, may: 33, jun: 112, jul: 80, ago: 67, total: 457 },
      { concepto: 'Incentivos Laborales (Bonos)', ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 286, total: 286 },
      { concepto: 'Servicios Telecomunicaciones', ene: 1, feb: 3, mar: 29, abr: 40, may: 12, jun: 44, jul: 0, ago: 0, total: 130 },
      { concepto: 'Gastos Funebres', ene: 0, feb: 0, mar: 0, abr: 122, may: 0, jun: 0, jul: 0, ago: 0, total: 122 },
      { concepto: 'Timbres Fiscales / Notarias / Registros', ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 52, jul: 0, ago: 0, total: 52 },
      { concepto: 'Honorarios Profesionales Soporte SIP', ene: 0, feb: 2, mar: 6, abr: 7, may: 3, jun: 9, jul: 6, ago: 5, total: 37 },
      { concepto: 'Gastos de Seguro', ene: 0, feb: 2, mar: 0, abr: 9, may: 1, jun: 23, jul: 0, ago: 0, total: 34 },
      { concepto: 'Gastos de asociación/Subscripción', ene: 0, feb: 2, mar: 6, abr: 7, may: 1, jun: 4, jul: 0, ago: 0, total: 20 },
      { concepto: 'Otros Servicios Contratados de Admón.', ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 1, jul: 0, ago: 0, total: 1 },
    ],
    'TTE-C-0680': [
      { concepto: 'Nomina Interna TIMACA', ene: 4345, feb: 3330, mar: 6059, abr: 4503, may: 10646, jun: 5267, jul: 6077, ago: 5256, total: 45483 },
      { concepto: 'Sindicato', ene: 2814, feb: 2101, mar: 3321, abr: 2702, may: 3966, jun: 2275, jul: 2706, ago: 2397, total: 22281 },
      { concepto: 'Combustible', ene: 1090, feb: 1050, mar: 1877, abr: 349, may: 445, jun: 344, jul: 469, ago: 809, total: 6432 },
      { concepto: 'Nomina -TALLERES', ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 5130, total: 5130 },
      { concepto: 'Vigilancia', ene: 174, feb: 130, mar: 226, abr: 200, may: 341, jun: 228, jul: 218, ago: 193, total: 1710 },
      { concepto: 'Servicios Publicos', ene: 122, feb: 10, mar: 78, abr: 73, may: 107, jun: 62, jul: 74, ago: 66, total: 593 },
      { concepto: 'Incentivos Laborales (Bonos)', ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 282, total: 282 },
      { concepto: 'Servicios Telecomunicaciones', ene: 8, feb: 7, mar: 35, abr: 34, may: 41, jun: 25, jul: 0, ago: 0, total: 149 },
      { concepto: 'Gastos Funebres', ene: 0, feb: 0, mar: 0, abr: 103, may: 0, jun: 0, jul: 0, ago: 0, total: 103 },
      { concepto: 'Honorarios Profesionales Soporte SIP', ene: 6, feb: 4, mar: 7, abr: 6, may: 8, jun: 5, jul: 6, ago: 5, total: 47 },
      { concepto: 'Timbres Fiscales / Notarias / Registros', ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 29, jul: 0, ago: 0, total: 29 },
      { concepto: 'Gastos de Seguro', ene: 0, feb: 4, mar: 0, abr: 8, may: 2, jun: 13, jul: 0, ago: 0, total: 26 },
      { concepto: 'Gastos de asociación/Subscripción', ene: 3, feb: 4, mar: 7, abr: 6, may: 4, jun: 2, jul: 0, ago: 0, total: 25 },
      { concepto: 'Otros Servicios Contratados de Admón.', ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 1, jul: 0, ago: 0, total: 1 },
    ],
    'TTE-C-0682': [
      { concepto: 'Nomina Interna TIMACA', ene: 2239, feb: 2462, mar: 2631, abr: 1707, may: 4109, jun: 3118, jul: 0, ago: 0, total: 16267 },
      { concepto: 'Sindicato', ene: 1450, feb: 1554, mar: 1442, abr: 1024, may: 1531, jun: 1346, jul: 0, ago: 0, total: 8348 },
      { concepto: 'Combustible', ene: 562, feb: 776, mar: 815, abr: 132, may: 172, jun: 204, jul: 0, ago: 0, total: 2661 },
      { concepto: 'Vigilancia', ene: 90, feb: 96, mar: 98, abr: 76, may: 132, jun: 135, jul: 0, ago: 0, total: 626 },
      { concepto: 'Servicios Publicos', ene: 63, feb: 8, mar: 34, abr: 28, may: 41, jun: 37, jul: 0, ago: 0, total: 211 },
      { concepto: 'Servicios Telecomunicaciones', ene: 4, feb: 5, mar: 15, abr: 13, may: 16, jun: 15, jul: 0, ago: 0, total: 68 },
      { concepto: 'Gastos Funebres', ene: 0, feb: 0, mar: 0, abr: 39, may: 0, jun: 0, jul: 0, ago: 0, total: 39 },
      { concepto: 'Honorarios Profesionales Soporte SIP', ene: 3, feb: 3, mar: 3, abr: 2, may: 3, jun: 3, jul: 0, ago: 0, total: 18 },
      { concepto: 'Timbres Fiscales / Notarias / Registros', ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 17, jul: 0, ago: 0, total: 17 },
      { concepto: 'Gastos de Seguro', ene: 0, feb: 3, mar: 0, abr: 3, may: 1, jun: 8, jul: 0, ago: 0, total: 14 },
      { concepto: 'Gastos de asociación/Subscripción', ene: 1, feb: 3, mar: 3, abr: 2, may: 2, jun: 1, jul: 0, ago: 0, total: 12 },
      { concepto: 'Otros Servicios Contratados de Admón.', ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 0, total: 0 },
    ],
    'TTE-C-0684': [
      { concepto: 'Nomina Interna TIMACA', ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 0, jul: 614, ago: 797, total: 1411 },
      { concepto: 'Nomina -TALLERES', ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 778, total: 778 },
      { concepto: 'Sindicato', ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 0, jul: 273, ago: 363, total: 637 },
      { concepto: 'Combustible', ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 0, jul: 47, ago: 123, total: 170 },
      { concepto: 'Vigilancia', ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 0, jul: 22, ago: 29, total: 51 },
      { concepto: 'Incentivos Laborales (Bonos)', ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 43, total: 43 },
      { concepto: 'Servicios Publicos', ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 0, jul: 7, ago: 10, total: 17 },
      { concepto: 'Honorarios Profesionales Soporte SIP', ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 0, jul: 1, ago: 1, total: 1 },
    ],
    'TTE-C-0688': [
      { concepto: 'Nomina Interna TIMACA', ene: 417, feb: 3363, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 0, total: 3780 },
      { concepto: 'Sindicato', ene: 270, feb: 2122, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 0, total: 2392 },
      { concepto: 'Combustible', ene: 105, feb: 1060, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 0, total: 1165 },
      { concepto: 'Vigilancia', ene: 17, feb: 131, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 0, total: 148 },
      { concepto: 'Servicios Publicos', ene: 12, feb: 10, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 0, total: 22 },
      { concepto: 'Servicios Telecomunicaciones', ene: 1, feb: 7, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 0, total: 8 },
      { concepto: 'Honorarios Profesionales Soporte SIP', ene: 1, feb: 4, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 0, total: 5 },
      { concepto: 'Gastos de asociación/Subscripción', ene: 0, feb: 4, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 0, total: 4 },
      { concepto: 'Gastos de Seguro', ene: 0, feb: 4, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 0, total: 4 },
    ],
    'TTE-C-0693': [
      { concepto: 'Nomina Interna TIMACA', ene: 884, feb: 6496, mar: 13013, abr: 547, may: 0, jun: 0, jul: 0, ago: 0, total: 20940 },
      { concepto: 'Sindicato', ene: 573, feb: 4099, mar: 7132, abr: 328, may: 0, jun: 0, jul: 0, ago: 0, total: 12132 },
      { concepto: 'Combustible', ene: 222, feb: 2048, mar: 4032, abr: 42, may: 0, jun: 0, jul: 0, ago: 0, total: 6344 },
      { concepto: 'Vigilancia', ene: 35, feb: 253, mar: 486, abr: 24, may: 0, jun: 0, jul: 0, ago: 0, total: 798 },
      { concepto: 'Servicios Publicos', ene: 25, feb: 20, mar: 168, abr: 9, may: 0, jun: 0, jul: 0, ago: 0, total: 222 },
      { concepto: 'Servicios Telecomunicaciones', ene: 2, feb: 14, mar: 75, abr: 4, may: 0, jun: 0, jul: 0, ago: 0, total: 94 },
      { concepto: 'Honorarios Profesionales Soporte SIP', ene: 1, feb: 9, mar: 15, abr: 1, may: 0, jun: 0, jul: 0, ago: 0, total: 26 },
      { concepto: 'Gastos de asociación/Subscripción', ene: 1, feb: 8, mar: 15, abr: 1, may: 0, jun: 0, jul: 0, ago: 0, total: 24 },
      { concepto: 'Gastos Funebres', ene: 0, feb: 0, mar: 0, abr: 13, may: 0, jun: 0, jul: 0, ago: 0, total: 13 },
      { concepto: 'Gastos de Seguro', ene: 0, feb: 7, mar: 0, abr: 1, may: 0, jun: 0, jul: 0, ago: 0, total: 8 },
    ],
    'TTE-C-0694': [
      { concepto: 'Nomina Interna TIMACA', ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 0, jul: 3370, ago: 1420, total: 4790 },
      { concepto: 'Sindicato', ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 0, jul: 1501, ago: 647, total: 2148 },
      { concepto: 'Nomina -TALLERES', ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 1386, total: 1386 },
      { concepto: 'Combustible', ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 0, jul: 260, ago: 219, total: 479 },
      { concepto: 'Vigilancia', ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 0, jul: 121, ago: 52, total: 173 },
      { concepto: 'Incentivos Laborales (Bonos)', ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 76, total: 76 },
      { concepto: 'Servicios Publicos', ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 0, jul: 41, ago: 18, total: 59 },
      { concepto: 'Honorarios Profesionales Soporte SIP', ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 0, jul: 3, ago: 1, total: 5 },
    ],
    'TTE-C-0706': [
      { concepto: 'Nomina Interna TIMACA', ene: 0, feb: 0, mar: 0, abr: 0, may: 79627, jun: 86283, jul: 68399, ago: 75211, total: 309520 },
      { concepto: 'Sindicato', ene: 0, feb: 0, mar: 0, abr: 0, may: 29665, jun: 37259, jul: 30459, ago: 34296, total: 131679 },
      { concepto: 'Nomina -TALLERES', ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 73406, total: 73406 },
      { concepto: 'Combustible', ene: 0, feb: 0, mar: 0, abr: 0, may: 3327, jun: 5640, jul: 5277, ago: 11576, total: 25819 },
      { concepto: 'Vigilancia', ene: 0, feb: 0, mar: 0, abr: 0, may: 2554, jun: 3737, jul: 2451, ago: 2760, total: 11502 },
      { concepto: 'Incentivos Laborales (Bonos)', ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 4031, total: 4031 },
      { concepto: 'Servicios Publicos', ene: 0, feb: 0, mar: 0, abr: 0, may: 803, jun: 1021, jul: 835, ago: 940, total: 3599 },
      { concepto: 'Servicios Telecomunicaciones', ene: 0, feb: 0, mar: 0, abr: 0, may: 307, jun: 401, jul: 0, ago: 0, total: 708 },
      { concepto: 'Timbres Fiscales / Notarias / Registros', ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 475, jul: 0, ago: 0, total: 475 },
      { concepto: 'Honorarios Profesionales Soporte SIP', ene: 0, feb: 0, mar: 0, abr: 0, may: 62, jun: 78, jul: 64, ago: 72, total: 277 },
      { concepto: 'Gastos de Seguro', ene: 0, feb: 0, mar: 0, abr: 0, may: 16, jun: 208, jul: 0, ago: 0, total: 224 },
      { concepto: 'Gastos de asociación/Subscripción', ene: 0, feb: 0, mar: 0, abr: 0, may: 29, jun: 36, jul: 0, ago: 0, total: 65 },
      { concepto: 'Otros Servicios Contratados de Admón.', ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 9, jul: 0, ago: 0, total: 9 },
    ],
    'TTE-C-0711': [
      { concepto: 'Nomina Interna TIMACA', ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 1014, jul: 0, ago: 0, total: 1014 },
      { concepto: 'Sindicato', ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 438, jul: 0, ago: 0, total: 438 },
      { concepto: 'Combustible', ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 66, jul: 0, ago: 0, total: 66 },
      { concepto: 'Vigilancia', ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 44, jul: 0, ago: 0, total: 44 },
      { concepto: 'Servicios Publicos', ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 12, jul: 0, ago: 0, total: 12 },
      { concepto: 'Timbres Fiscales / Notarias / Registros', ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 6, jul: 0, ago: 0, total: 6 },
      { concepto: 'Servicios Telecomunicaciones', ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 5, jul: 0, ago: 0, total: 5 },
      { concepto: 'Gastos de Seguro', ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 2, jul: 0, ago: 0, total: 2 },
      { concepto: 'Honorarios Profesionales Soporte SIP', ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 1, jul: 0, ago: 0, total: 1 },
      { concepto: 'Gastos de asociación/Subscripción', ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 0, total: 0 },
      { concepto: 'Otros Servicios Contratados de Admón.', ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 0, total: 0 },
    ],
  }
};

// 1. Matriz Oficial de Costos Indirectos a Prorratear (15 Rubros Oficiales de Costos TIMACA)
// Coincidencia 100% exacta con la tabla oficial "Costos Indirectos a Prorratear"
export const COSTOS_INDIRECTOS_POR_CATEGORIAS: FilaDesgloseMensual[] = [
  { concepto: 'Servicios Publicos', ene: 3389, feb: 3257, mar: 2450, abr: 2611, may: 2491, jun: 2485, jul: 2182, ago: 2393, sep: 2556, total: 23814 },
  { concepto: 'Nomina TIMACA', ene: 88000, feb: 87000, mar: 104000, abr: 95000, may: 153000, jun: 132000, jul: 128000, ago: 128000, sep: 125000, total: 1040000 },
  { concepto: 'Nomina -TALLERES', ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 120000, sep: 122000, total: 242000 },
  { concepto: 'Incentivos Laborales (Bonos)', ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 4000, sep: 6700, total: 10700 },
  { concepto: 'Servicios Telecomunicaciones', ene: 554, feb: 586, mar: 596, abr: 717, may: 589, jun: 614, jul: 570, ago: 598, sep: 570, total: 5394 },
  { concepto: 'Combustible', ene: 22074, feb: 28475, mar: 32224, abr: 7424, may: 6392, jun: 12136, jul: 13959, ago: 24651, sep: 50413, total: 197748 },
  { concepto: 'Sindicato', ene: 57000, feb: 58840, mar: 58314, abr: 77076, may: 64858, jun: 57916, jul: 72018, ago: 49630, sep: 58952, total: 554604 },
  { concepto: 'Vigilancia', ene: 3521, feb: 3521, mar: 3880, abr: 4214, may: 4235, jun: 4803, jul: 4803, ago: 4803, sep: 4803, total: 38583 },
  { concepto: 'Gastos de asociación/Subscripción', ene: 56, feb: 106, mar: 123, abr: 116, may: 56, jun: 86, jul: 55, ago: 116, sep: 56, total: 770 },
  { concepto: 'Gastos de Servicios Bancarios', ene: 35, feb: 42, mar: 120, abr: 36, may: 46, jun: 48, jul: 49, ago: 50, sep: 49, total: 475 },
  { concepto: 'Gastos de Seguro', ene: 0, feb: 95, mar: 0, abr: 165, may: 30, jun: 318, jul: 386, ago: 436, sep: 277, total: 1707 },
  { concepto: 'Honorarios Profesionales', ene: 870, feb: 650, mar: 240, abr: 120, may: 435, jun: 420, jul: 1322, ago: 120, sep: 250, total: 4427 },
  { concepto: 'Gastos Funebres', ene: 0, feb: 0, mar: 0, abr: 2176, may: 0, jun: 0, jul: 0, ago: 0, sep: 0, total: 2176 },
  { concepto: 'Timbres Fiscales / Notarias / Registros', ene: 1219, feb: 500, mar: 70, abr: 1070, may: 890, jun: 726, jul: 1843, ago: 3445, sep: 7634, total: 17397 },
  { concepto: 'Gastos de viajes/viáticos nacionales', ene: 351, feb: 393, mar: 2353, abr: 3964, may: 1940, jun: 1523, jul: 2267, ago: 1259, sep: 4124, total: 18174 },
  { concepto: 'Otros Servicios Contratados de Admón.', ene: 4930, feb: 571, mar: 1523, abr: 2503, may: 2504, jun: 217, jul: 0, ago: 478, sep: 9991, total: 22717 },
];

export const COSTOS_INDIRECTOS_A_PRORRATEAR = COSTOS_INDIRECTOS_POR_CATEGORIAS;

// 2. Matriz Oficial de Costos Indirectos DESGLOSADA POR CUENTAS AUXILIARES (% DE PRORRATEO - 9 Meses Oficiales)
export const COSTOS_INDIRECTOS_CONSOLIDADO_OFICIAL: FilaDesgloseMensual[] = [
  { ctaAuxiliar: 'TTE-C-0706', concepto: 'TTE-C-0706 · Línea 1 Pellas (Recuperación Línea 1 Planta de Pellas)', porcentaje: 38.30, ene: 0, feb: 0, mar: 0, abr: 0, may: 116389, jun: 135147, jul: 107485, ago: 204561, sep: 236688, total: 800270 },
  { ctaAuxiliar: 'TTE-C-0676', concepto: 'TTE-C-0676 · 2da Línea Pellas (Segunda Línea Planta de Pellas)', porcentaje: 18.72, ene: 109790, feb: 88858, mar: 85824, abr: 90209, may: 0, jun: 0, jul: 0, ago: 0, sep: 0, total: 374680 },
  { ctaAuxiliar: 'TTE-C-0656', concepto: 'TTE-C-0656 · Bandas Transp. PMH (Rehabilitación de Bandas Transportadoras PMH)', porcentaje: 12.67, ene: 21121, feb: 25237, mar: 34806, abr: 27397, may: 18767, jun: 14129, jul: 26055, ago: 43223, sep: 50012, total: 260747 },
  { ctaAuxiliar: 'TTE-C-0668', concepto: 'TTE-C-0668 · Briquetas Fase 2 (Fase 2 Planta de Briquetas - FMO)', porcentaje: 8.10, ene: 13655, feb: 12675, mar: 17862, abr: 26676, may: 14875, jun: 11458, jul: 18280, ago: 23378, sep: 27050, total: 165909 },
  { ctaAuxiliar: 'TTE-C-0680', concepto: 'TTE-C-0680 · Mantenimiento BG II (Servicio de Mantenimiento de BG II)', porcentaje: 4.83, ene: 8561, feb: 6641, mar: 11610, abr: 7982, may: 15560, jun: 8250, jul: 9550, ago: 14295, sep: 16539, total: 98988 },
  { ctaAuxiliar: 'TTE-C-0678', concepto: 'TTE-C-0678 · Pila HA y HB PMH (Proyecto Pila HA y HB Suministro e Instalación)', porcentaje: 4.08, ene: 583, feb: 2987, mar: 9791, abr: 9479, may: 4722, jun: 14879, jul: 10244, ago: 14516, sep: 16796, total: 84997 },
  { ctaAuxiliar: 'TTE-C-0671', concepto: 'TTE-C-0671 · 2da Línea PMH (Segunda Línea PMH - Ingeniería y Suministro)', porcentaje: 3.74, ene: 0, feb: 0, mar: 0, abr: 198, may: 2407, jun: 10040, jul: 16865, ago: 22759, sep: 26334, total: 78603 },
  { ctaAuxiliar: 'TTE-C-0653', concepto: 'TTE-C-0653 · Rueda Cangilones PMH (Repotenciación Rueda Cangilones DRAVO)', porcentaje: 2.31, ene: 0, feb: 0, mar: 0, abr: 0, may: 41590, jun: 4734, jul: 0, ago: 0, sep: 0, total: 46324 },
  { ctaAuxiliar: 'TTE-C-0670', concepto: 'TTE-C-0670 · Mtto Briqueteras (Servicio Mtto. Máquinas Briqueteras)', porcentaje: 2.30, ene: 3654, feb: 3690, mar: 4005, abr: 2473, may: 3319, jun: 1646, jul: 6256, ago: 10527, sep: 12181, total: 47941 },
  { ctaAuxiliar: 'TTE-C-0693', concepto: 'TTE-C-0693 · Parada Planta Briquetas (Trabajos para Parada de Planta)', porcentaje: 2.03, ene: 1742, feb: 12953, mar: 24937, abr: 969, may: 0, jun: 0, jul: 0, ago: 0, sep: 0, total: 40601 },
  { ctaAuxiliar: 'TTE-C-0682', concepto: 'TTE-C-0682 · Personal Zona 60 (Suministro de Personal para Zona 60)', porcentaje: 1.41, ene: 4412, feb: 4910, mar: 5041, abr: 3027, may: 6006, jun: 4883, jul: 0, ago: 0, sep: 0, total: 28280 },
  { ctaAuxiliar: 'TTE-C-0669', concepto: 'TTE-C-0669 · Mtto Dravo (Servicio de Mantenimiento de Dravo)', porcentaje: 0.72, ene: 4274, feb: 4816, mar: 5411, abr: 0, may: 0, jun: 0, jul: 0, ago: 0, sep: 0, total: 14500 },
  { ctaAuxiliar: 'TTE-C-0694', concepto: 'TTE-C-0694 · Caldera Briquetas (Suministro e Instalación Caldera Briquetas)', porcentaje: 0.65, ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 0, jul: 5296, ago: 3861, sep: 4468, total: 13625 },
  { ctaAuxiliar: 'TTE-C-0688', concepto: 'TTE-C-0688 · Carga Barcos Wellman (Desmantelamiento Carga Barcos Wellman)', porcentaje: 0.38, ene: 821, feb: 6706, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 0, sep: 0, total: 7527 },
  { ctaAuxiliar: 'TTE-C-0655', concepto: 'TTE-C-0655 · Tolva PMH (Interconexión Sistema Transporte Tolva PMH)', porcentaje: 0.36, ene: 4784, feb: 956, mar: 0, abr: 0, may: 0, jun: 0, jul: 150, ago: 691, sep: 799, total: 7380 },
  { ctaAuxiliar: 'TTE-C-0684', concepto: 'TTE-C-0684 · Gamelas FMO-PMH (Fabricación de Gamelas FMO-PMH)', porcentaje: 0.26, ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 0, jul: 965, ago: 2167, sep: 2508, total: 5640 },
  { ctaAuxiliar: 'TTE-C-0654', concepto: 'TTE-C-0654 · Cinta JD-9021 (Proyecto 5B: Cinta JD-9021)', porcentaje: 0.15, ene: 0, feb: 3049, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 0, sep: 0, total: 3049 },
  { ctaAuxiliar: 'TTE-C-0711', concepto: 'TTE-C-0711 · Módulos Eléctricos TH4 (Retirada Módulos Eléctricos TH4 PMH)', porcentaje: 0.08, ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 1589, jul: 0, ago: 0, sep: 0, total: 1589 },
];

// 3. Matriz Oficial de Mano de Obra Directa CONSOLIDADA (100% Empresa TIMACA - 8 Meses Oficiales Ene-Ago)
export const MANO_DE_OBRA_DIRECTA_CONSOLIDADO_OFICIAL: FilaDesgloseMensual[] = [
  { concepto: 'Cuadrillas de Soldadores Calificados 6G / ASME IX', ene: 74200, feb: 64100, mar: 60700, abr: 54300, may: 61800, jun: 47800, jul: 50300, ago: 52350, total: 465550 },
  { concepto: 'Paileros Fabricadores de Taller y Estructuras', ene: 54300, feb: 46900, mar: 44400, abr: 39700, may: 45200, jun: 35000, jul: 36800, ago: 38320, total: 340620 },
  { concepto: 'Mecánicos Montadores de Equipos Rotativos y Bandas', ene: 41500, feb: 35800, mar: 33900, abr: 30300, may: 34500, jun: 26700, jul: 28100, ago: 29240, total: 260040 },
  { concepto: 'Armadores de Calderería y Virolas de Hornos', ene: 30100, feb: 26000, mar: 24600, abr: 22000, may: 25100, jun: 19400, jul: 20400, ago: 21230, total: 188830 },
  { concepto: 'Cuadrillas de Montaje Mecánico PMH y Briquetas', ene: 33100, feb: 28600, mar: 27100, abr: 24200, may: 27600, jun: 21300, jul: 22400, ago: 23330, total: 207630 },
  { concepto: 'Electricistas e Instrumentistas de Planta', ene: 25300, feb: 21800, mar: 20700, abr: 18500, may: 21100, jun: 16300, jul: 17100, ago: 17800, total: 158600 },
  { concepto: 'Paileros de Ajuste y Montaje Estructural', ene: 21400, feb: 18500, mar: 17500, abr: 15600, may: 17800, jun: 13800, jul: 14500, ago: 15100, total: 134200 },
  { concepto: 'Ayudantes Técnicos de Soldadura y Montaje', ene: 18500, feb: 16000, mar: 15100, abr: 13500, may: 15400, jun: 11900, jul: 12500, ago: 13020, total: 115920 },
  { concepto: 'Supervisores Residentes de Campo TIMACA', ene: 14130, feb: 11966, mar: 11366, abr: 11431, may: 13064, jun: 10103, jul: 10568, ago: 10963, total: 93591 }
];

// 4. Matriz Oficial de Servicios CONSOLIDADA (100% Empresa TIMACA - 8 Meses Oficiales Ene-Ago)
export const SERVICIOS_CONSOLIDADO_OFICIAL_8_MESES: FilaDesgloseMensual[] = [
  { concepto: 'Subcontrato de Maquinado de Gran Escala y Torno Pesado', ene: 28000, feb: 36000, mar: 74000, abr: 18500, may: 24800, jun: 980000, jul: 185000, ago: 22000, sep: 12000, total: 1380300 },
  { concepto: 'Alquiler de Grúas Telescópicas de Alto Tonelaje e Izamiento', ene: 24000, feb: 32000, mar: 68000, abr: 16200, may: 21000, jun: 420000, jul: 72000, ago: 18500, sep: 0, total: 671700 },
  { concepto: 'Servicio Integral de Traslado de Personal y Cuadrillas', ene: 42000, feb: 45000, mar: 51000, abr: 38500, may: 42000, jun: 65000, jul: 58000, ago: 48000, sep: 45878, total: 435378 },
  { concepto: 'Vigilancia y Seguridad Externa de Campamento y Frentes', ene: 16000, feb: 17500, mar: 22000, abr: 12800, may: 13500, jun: 24000, jul: 18500, ago: 16000, sep: 17126, total: 157426 },
  { concepto: 'Servicio de Arenado a Presión (Sandblasting SSPC-SP10) y Pintura', ene: 11000, feb: 15000, mar: 26000, abr: 8200, may: 5400, jun: 52000, jul: 8400, ago: 4200, sep: 2000, total: 132200 },
  { concepto: 'Ensayos No Destructivos (END, Radiografía, Gammagrafía y Ultrasonido)', ene: 8500, feb: 12000, mar: 21000, abr: 5100, may: 3200, jun: 38000, jul: 6200, ago: 3100, sep: 500, total: 97600 },
  { concepto: 'Empalmes y Vulcanizado de Bandas Transportadoras', ene: 6200, feb: 8400, mar: 14000, abr: 4100, may: 2100, jun: 28000, jul: 4100, ago: 2100, sep: 250, total: 69250 },
  { concepto: 'Alquiler de Maquinaria Menor, Plataformas Tijera y Compresores', ene: 4200, feb: 6100, mar: 9800, abr: 2800, may: 1800, jun: 19000, jul: 3200, ago: 1600, sep: 2680, total: 51180 },
  { concepto: 'Inspecciones Técnicas, Calificación QA/QC y Laboratorio', ene: 2400, feb: 3200, mar: 5400, abr: 1400, may: 800, jun: 11000, jul: 1800, ago: 900, sep: 563, total: 27463 },
  { concepto: 'Exámenes Médicos de Ingreso, Altura y Salud Ocupacional', ene: 1200, feb: 1800, mar: 2900, abr: 700, may: 400, jun: 4200, jul: 1100, ago: 870, sep: 588, total: 13758 },
  { concepto: 'Servicio de Alimentación y Comida en Frentes de Trabajo', ene: 600, feb: 500, mar: 1400, abr: 433, may: 182, jun: 2800, jul: 644, ago: 500, sep: 1982, total: 9041 },
  { concepto: 'Otros Servicios Operativos (Baños Portátiles, Cisternas, Automatización)', ene: 466, feb: 397, mar: 1331, abr: 200, may: 50, jun: 1192, jul: 250, ago: 200, sep: 15973, total: 21059 }
];

// 5. Matriz Oficial de Materiales Directos CONSOLIDADA (100% Empresa TIMACA - 8 Meses Oficiales Ene-Ago)
export const MATERIALES_CONSOLIDADO_OFICIAL_8_MESES: FilaDesgloseMensual[] = [
  { concepto: 'Planchas y Perfiles Estructurales', ene: 248000, feb: 275000, mar: 261000, abr: 148000, may: 115000, jun: 192000, jul: 120000, ago: 202000, total: 1561000 },
  { concepto: 'Tuberías, Válvulas y Conexiones', ene: 93000, feb: 103000, mar: 98000, abr: 56000, may: 43000, jun: 72000, jul: 45000, ago: 76000, total: 586000 },
  { concepto: 'Eq. Y Consumibles De Soldadura', ene: 65000, feb: 72000, mar: 68000, abr: 40000, may: 32000, jun: 52000, jul: 33000, ago: 55000, total: 417000 },
  { concepto: 'Materiales Mecanicos', ene: 48000, feb: 52000, mar: 49000, abr: 28000, may: 22000, jun: 37000, jul: 23000, ago: 39000, total: 298000 },
  { concepto: 'Tornillería y Elementos de Fijación', ene: 31000, feb: 34000, mar: 33000, abr: 19000, may: 14000, jun: 24000, jul: 15000, ago: 25000, total: 195000 },
  { concepto: 'Aceite Hidraulico', ene: 24000, feb: 26000, mar: 25000, abr: 14500, may: 11200, jun: 19000, jul: 11800, ago: 20000, total: 151500 },
  { concepto: 'Eq. Y Acc De Oxicorte', ene: 21000, feb: 23000, mar: 22000, abr: 12500, may: 9800, jun: 16500, jul: 10200, ago: 17200, total: 132200 },
  { concepto: 'Gas Envasado Argon', ene: 18000, feb: 19500, mar: 18500, abr: 10800, may: 8400, jun: 14000, jul: 8800, ago: 15000, total: 113000 },
  { concepto: 'Equipos De Proteccion Personal', ene: 15000, feb: 16500, mar: 15500, abr: 9200, may: 7100, jun: 12000, jul: 7500, ago: 12800, total: 95600 },
  { concepto: 'Equipos De Seguridad', ene: 12000, feb: 13000, mar: 12500, abr: 7400, may: 5700, jun: 9500, jul: 6000, ago: 10100, total: 76200 },
  { concepto: 'Costos De Elevación', ene: 10500, feb: 11500, mar: 11000, abr: 6500, may: 5100, jun: 8400, jul: 5300, ago: 9000, total: 66800 },
  { concepto: 'Eq. E Instrumentos De Medicion', ene: 8500, feb: 9200, mar: 8800, abr: 5200, may: 4100, jun: 6800, jul: 4200, ago: 7200, total: 54000 },
  { concepto: 'Adhesivo, Cemento Plastico, Selladores', ene: 6500, feb: 7100, mar: 6700, abr: 4000, may: 3100, jun: 5200, jul: 3300, ago: 5600, total: 41500 },
  { concepto: 'Cemento / Pego / Yeso/ Otros', ene: 4800, feb: 5200, mar: 5000, abr: 2900, may: 2300, jun: 3800, jul: 2400, ago: 4100, total: 30500 },
  { concepto: 'Arena, Piedra Y Aditivos Agregados', ene: 3800, feb: 4100, mar: 3900, abr: 2300, may: 1800, jun: 3000, jul: 1900, ago: 3200, total: 24000 },
  { concepto: 'Accesorios De Carroceria', ene: 3100, feb: 3400, mar: 3200, abr: 1900, may: 1500, jun: 2500, jul: 1600, ago: 2700, total: 19900 },
  { concepto: 'Cauchos Y Tripas Para Vehiculos', ene: 2400, feb: 2600, mar: 2500, abr: 1500, may: 1150, jun: 1900, jul: 1200, ago: 2100, total: 15350 },
  { concepto: 'Bloques', ene: 1800, feb: 2000, mar: 1900, abr: 1100, may: 860, jun: 1450, jul: 920, ago: 1550, total: 11580 },
  { concepto: 'Costo De Hielo Y Agua Potable', ene: 1500, feb: 1630, mar: 1527, abr: 926, may: 753, jun: 1236, jul: 821, ago: 1339, total: 9732 },
  { concepto: 'Comestibles / Bebidas', ene: 1077, feb: 1100, mar: 1200, abr: 700, may: 600, jun: 800, jul: 500, ago: 900, total: 6877 }
];

// 6. Matriz Oficial de Horas Máquina CONSOLIDADA (100% Empresa TIMACA - 8 Meses Oficiales Ene-Ago)
export const HORAS_MAQUINA_CONSOLIDADO_OFICIAL_8_MESES: FilaDesgloseMensual[] = [
  { concepto: 'Torno Vertical Schiess (Maquinado corona y pistas)', ene: 49500, feb: 38800, mar: 51000, abr: 18800, may: 44200, jun: 23500, jul: 25900, ago: 30600, total: 282300 },
  { concepto: 'Grúas Telescópicas Liebherr 80T / 120T en Izamiento', ene: 42100, feb: 33000, mar: 43200, abr: 16000, may: 37600, jun: 20100, jul: 22000, ago: 26000, total: 240000 },
  { concepto: 'Mandrinadora CNC Mecanizado de Alojamientos', ene: 24700, feb: 19300, mar: 25300, abr: 9400, may: 22000, jun: 11700, jul: 12900, ago: 15300, total: 140600 },
  { concepto: 'Prensa Hidráulica 500 Toneladas Rolado de Planchas', ene: 14500, feb: 11400, mar: 14900, abr: 5500, may: 13000, jun: 6900, jul: 7600, ago: 9000, total: 82800 },
  { concepto: 'Fresadora Universal de Bancada y Cepillos Industriales', ene: 8700, feb: 6800, mar: 8900, abr: 3300, may: 7800, jun: 4100, jul: 4600, ago: 5400, total: 49600 },
  { concepto: 'Generadores y Plantas Diésel de Obra', ene: 5613, feb: 4386, mar: 5730, abr: 2110, may: 5025, jun: 2763, jul: 2933, ago: 3489, total: 32049 }
];

// Función para obtener las filas consolidadas de todos los proyectos en una categoría (8 meses completos)
export function getConsolidadoCategoria(categoria: string, modoIndirectos: 'categorias' | 'cuentas' = 'categorias'): FilaDesgloseMensual[] {
  if (categoria === 'Costos Indirectos') {
    return modoIndirectos === 'categorias' ? COSTOS_INDIRECTOS_POR_CATEGORIAS : COSTOS_INDIRECTOS_CONSOLIDADO_OFICIAL;
  }
  if (categoria === 'Mano de Obra Directa') {
    return MANO_DE_OBRA_DIRECTA_CONSOLIDADO_OFICIAL;
  }
  if (categoria === 'Servicios') {
    return SERVICIOS_CONSOLIDADO_OFICIAL_8_MESES;
  }
  if (categoria === 'Materiales Directos') {
    return MATERIALES_CONSOLIDADO_OFICIAL_8_MESES;
  }
  if (categoria === 'Horas Maquina') {
    return HORAS_MAQUINA_CONSOLIDADO_OFICIAL_8_MESES;
  }

  const catObj = DESGLOSE_CATEGORIAS_PROYECTOS[categoria];
  if (!catObj) return [];

  const mapConceptos = new Map<string, FilaDesgloseMensual>();

  Object.values(catObj).forEach(filas => {
    filas.forEach(f => {
      if (!mapConceptos.has(f.concepto)) {
        mapConceptos.set(f.concepto, {
          concepto: f.concepto,
          ene: f.ene || 0,
          feb: f.feb || 0,
          mar: f.mar || 0,
          abr: f.abr,
          may: f.may,
          jun: f.jun,
          jul: f.jul,
          ago: f.ago,
          sep: f.sep || 0,
          total: f.total
        });
      } else {
        const cur = mapConceptos.get(f.concepto)!;
        cur.ene = (cur.ene || 0) + (f.ene || 0);
        cur.feb = (cur.feb || 0) + (f.feb || 0);
        cur.mar = (cur.mar || 0) + (f.mar || 0);
        cur.abr += f.abr;
        cur.may += f.may;
        cur.jun += f.jun;
        cur.jul += f.jul;
        cur.ago += f.ago;
        cur.sep = (cur.sep || 0) + (f.sep || 0);
        cur.total += f.total;
      }
    });
  });

  return Array.from(mapConceptos.values()).sort((a, b) => b.total - a.total);
}
