import { CatalogoEPPItem, EntregaDotacionRegistro } from '../types/suite';

export const MOCK_CATALOGO_EPP: CatalogoEPPItem[] = [
  {
    id: 'epp-001',
    codigo: 'EPP-BOT-01',
    nombre: 'Botas de Seguridad Dieléctricas Cuero Graso (Puntera Composite)',
    categoria: 'Calzado de Seguridad',
    especificacion: 'Suela de poliuretano doble densidad bidensidad, dieléctrica hasta 18.000V. Plantilla anatómica.',
    marcaNorma: 'Saga / COVENIN 39:2003 / ASTM F2413',
    stockActual: 38,
    stockMinimo: 15,
    costoUnitarioUsd: 45,
    vidaUtilDias: 180, // 6 meses
    tallasDisponibles: ['38', '39', '40', '41', '42', '43', '44', '45']
  },
  {
    id: 'epp-002',
    codigo: 'EPP-BRG-01',
    nombre: 'Braga Industrial Gabardina Azul Marino con Cinta Reflectiva 3M',
    categoria: 'Indumentaria & Bragas',
    especificacion: '100% Algodón pesado 280g/m², cierre de bronce de doble vía, bolsillos utilitarios y logo TIMACA bordado.',
    marcaNorma: 'TIMACA Corporativa / COVENIN 2271',
    stockActual: 62,
    stockMinimo: 20,
    costoUnitarioUsd: 32,
    vidaUtilDias: 120, // 4 meses
    tallasDisponibles: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL']
  },
  {
    id: 'epp-003',
    codigo: 'EPP-CSC-01',
    nombre: 'Casco de Seguridad Tipo I Clase E (Dieléctrico) con Barboquejo',
    categoria: 'Protección Craneana',
    especificacion: 'Polietileno de alta densidad con suspensión textil de 4 puntos y ajuste de matraca Fas-Trac III.',
    marcaNorma: 'MSA V-Gard / ANSI/ISEA Z89.1 / COVENIN 815',
    stockActual: 45,
    stockMinimo: 10,
    costoUnitarioUsd: 18,
    vidaUtilDias: 730, // 2 años
    tallasDisponibles: ['Universal Ajustable']
  },
  {
    id: 'epp-004',
    codigo: 'EPP-LEN-01',
    nombre: 'Lentes de Seguridad Anti-empañante UV400 Claros y Oscuros',
    categoria: 'Protección Visual & Facial',
    especificacion: 'Policarbonato de alta resistencia con protección lateral y patillas ergonómicas acolchadas.',
    marcaNorma: 'Jackson Nemesis / ANSI Z87.1+ / COVENIN 955',
    stockActual: 110,
    stockMinimo: 30,
    costoUnitarioUsd: 6.5,
    vidaUtilDias: 60,
    tallasDisponibles: ['Universal']
  },
  {
    id: 'epp-005',
    codigo: 'EPP-GNT-01',
    nombre: 'Guantes de Carnaza Curtida al Cromo Caña Larga (Soldadura)',
    categoria: 'Protección de Manos',
    especificacion: 'Costuras protegidas con hilo Kevlar, forro interno térmico de algodón para altas temperaturas.',
    marcaNorma: 'Weldas / COVENIN 1927 / EN 388',
    stockActual: 84,
    stockMinimo: 25,
    costoUnitarioUsd: 9.8,
    vidaUtilDias: 30,
    tallasDisponibles: ['Talla 10 (L)', 'Talla 11 (XL)']
  },
  {
    id: 'epp-006',
    codigo: 'EPP-GNT-02',
    nombre: 'Guantes de Nitrilo con Palma Anticorte Nivel 5 (Mecánicos)',
    categoria: 'Protección de Manos',
    especificacion: 'Tejido HPPE sin costuras con recubrimiento microporoso de nitrilo arenoso, alta resistencia al aceite.',
    marcaNorma: 'Ansell HyFlex 11-735 / EN 388: 4X42C',
    stockActual: 95,
    stockMinimo: 30,
    costoUnitarioUsd: 7.2,
    vidaUtilDias: 45,
    tallasDisponibles: ['M (8)', 'L (9)', 'XL (10)']
  },
  {
    id: 'epp-007',
    codigo: 'EPP-AUD-01',
    nombre: 'Protector Auditivo Tipo Copa para Casco NRR 27dB',
    categoria: 'Protección Auditiva',
    especificacion: 'Copas pivotantes con almohadillas de gel de alta atenuación para áreas de molienda y calderería.',
    marcaNorma: '3M Peltor Optime 105 / ANSI S3.19',
    stockActual: 24,
    stockMinimo: 8,
    costoUnitarioUsd: 26,
    vidaUtilDias: 365,
    tallasDisponibles: ['Universal Ranurado Casco']
  },
  {
    id: 'epp-008',
    codigo: 'EPP-ARN-01',
    nombre: 'Arnés de Seguridad Integral Multipropósito 4 Argollas en D',
    categoria: 'Protección Anticaídas',
    especificacion: 'Poliéster de alta tenacidad con indicador de impacto y eslinga doble en Y amortiguadora de 1.8m.',
    marcaNorma: 'Miller Revolution / ANSI Z359.11 / COVENIN 1042',
    stockActual: 16,
    stockMinimo: 5,
    costoUnitarioUsd: 145,
    vidaUtilDias: 365,
    tallasDisponibles: ['M/L Ajustable', 'XL/XXL']
  },
  {
    id: 'epp-009',
    codigo: 'EPP-RSP-01',
    nombre: 'Respirador Medio Rostro Serie 6200 con Filtros 2097 P100',
    categoria: 'Protección Respiratoria',
    especificacion: 'Pieza facial de elastómero suave con filtro para partículas sólidas, polvillo de hierro y humos de soldadura.',
    marcaNorma: '3M 6200 / NIOSH 42 CFR 84 / COVENIN 1056',
    stockActual: 28,
    stockMinimo: 10,
    costoUnitarioUsd: 38,
    vidaUtilDias: 180,
    tallasDisponibles: ['Mediano (6200)', 'Grande (6300)']
  }
];

export const MOCK_ENTREGAS_DOTACION: EntregaDotacionRegistro[] = [
  {
    id: 'act-001',
    numeroActa: 'ACT-EPP-2026-0091',
    trabajadorId: 'trb-001',
    trabajadorNombre: 'Carlos Silva',
    cedula: 'V-16.892.401',
    cargo: 'Mecánico Líder de Taller',
    departamento: 'Mantenimiento Planta',
    frenteAsignado: 'Taller Central - Nave 1',
    fechaEntrega: '2026-08-10',
    fechaProximaRenovacion: '2027-02-10',
    diasParaRenovacion: 127,
    estado: 'Vigente',
    itemsEntregados: [
      { itemCodigo: 'EPP-BOT-01', itemNombre: 'Botas de Seguridad Dieléctricas', talla: '42', cantidad: 1, costoTotalUsd: 45 },
      { itemCodigo: 'EPP-BRG-01', itemNombre: 'Braga Industrial Azul Marino TIMACA', talla: 'L', cantidad: 2, costoTotalUsd: 64 },
      { itemCodigo: 'EPP-GNT-02', itemNombre: 'Guantes de Nitrilo Anticorte', talla: 'L', cantidad: 2, costoTotalUsd: 14.4 },
      { itemCodigo: 'EPP-LEN-01', itemNombre: 'Lentes de Seguridad Anti-empañante', talla: 'Universal', cantidad: 2, costoTotalUsd: 13 }
    ],
    costoTotalUsd: 136.4,
    entregadoPor: 'Seguridad Industrial & Almacén (Daniela Riveros)',
    firmaConforme: true,
    observaciones: 'Dotación regular semestral completa. Todo conforme.'
  },
  {
    id: 'act-002',
    numeroActa: 'ACT-EPP-2026-0092',
    trabajadorId: 'trb-002',
    trabajadorNombre: 'Luis Morillo',
    cedula: 'V-19.102.554',
    cargo: 'Soldador Calificado 6G',
    departamento: 'Fabricación Metálica',
    frenteAsignado: 'Frente PMH - Muelle',
    fechaEntrega: '2026-07-25',
    fechaProximaRenovacion: '2026-11-25',
    diasParaRenovacion: 50,
    estado: 'Vigente',
    itemsEntregados: [
      { itemCodigo: 'EPP-BOT-01', itemNombre: 'Botas de Seguridad Dieléctricas', talla: '43', cantidad: 1, costoTotalUsd: 45 },
      { itemCodigo: 'EPP-BRG-01', itemNombre: 'Braga Industrial Azul Marino TIMACA', talla: 'XL', cantidad: 2, costoTotalUsd: 64 },
      { itemCodigo: 'EPP-GNT-01', itemNombre: 'Guantes de Carnaza Soldadura', talla: 'XL', cantidad: 3, costoTotalUsd: 29.4 },
      { itemCodigo: 'EPP-RSP-01', itemNombre: 'Respirador Medio Rostro 3M 6200', talla: 'Grande', cantidad: 1, costoTotalUsd: 38 }
    ],
    costoTotalUsd: 176.4,
    entregadoPor: 'Seguridad Industrial & Almacén (Daniela Riveros)',
    firmaConforme: true,
    observaciones: 'Dotación especial para trabajos en caliente y soldadura estructural en muelle.'
  },
  {
    id: 'act-003',
    numeroActa: 'ACT-EPP-2026-0093',
    trabajadorId: 'trb-003',
    trabajadorNombre: 'Miguelángel López',
    cedula: 'V-18.441.205',
    cargo: 'Líder Montador Estructural',
    departamento: 'Mantenimiento Planta',
    frenteAsignado: 'Frente Pellas - Tolva 2',
    fechaEntrega: '2026-04-05',
    fechaProximaRenovacion: '2026-10-05',
    diasParaRenovacion: -1,
    estado: 'Vencida',
    itemsEntregados: [
      { itemCodigo: 'EPP-BOT-01', itemNombre: 'Botas de Seguridad Dieléctricas', talla: '41', cantidad: 1, costoTotalUsd: 45 },
      { itemCodigo: 'EPP-BRG-01', itemNombre: 'Braga Industrial Azul Marino TIMACA', talla: 'M', cantidad: 2, costoTotalUsd: 64 },
      { itemCodigo: 'EPP-ARN-01', itemNombre: 'Arnés de Seguridad Multipropósito', talla: 'M/L', cantidad: 1, costoTotalUsd: 145 }
    ],
    costoTotalUsd: 254,
    entregadoPor: 'Almacén Central',
    firmaConforme: true,
    observaciones: '¡VENCIDO! Venció el 05-Oct-2026. Requiere entrega urgente de nuevo par de botas y bragas según LOPCYMAT.'
  },
  {
    id: 'act-004',
    numeroActa: 'ACT-EPP-2026-0094',
    trabajadorId: 'trb-004',
    trabajadorNombre: 'José Gregorio Salazar',
    cedula: 'V-15.340.991',
    cargo: 'Mecánico Hidráulico Especialista',
    departamento: 'Operaciones Grúas',
    frenteAsignado: 'Patio de Grúas - Bahía de Servicio',
    fechaEntrega: '2026-09-01',
    fechaProximaRenovacion: '2027-03-01',
    diasParaRenovacion: 146,
    estado: 'Vigente',
    itemsEntregados: [
      { itemCodigo: 'EPP-BOT-01', itemNombre: 'Botas de Seguridad Dieléctricas', talla: '42', cantidad: 1, costoTotalUsd: 45 },
      { itemCodigo: 'EPP-BRG-01', itemNombre: 'Braga Industrial Azul Marino TIMACA', talla: 'L', cantidad: 2, costoTotalUsd: 64 },
      { itemCodigo: 'EPP-GNT-02', itemNombre: 'Guantes de Nitrilo Anticorte', talla: 'L', cantidad: 3, costoTotalUsd: 21.6 }
    ],
    costoTotalUsd: 130.6,
    entregadoPor: 'Almacén Central (Daniela Riveros)',
    firmaConforme: true,
    observaciones: 'Entregado conforme para servicio preventivo de las 26 grúas.'
  },
  {
    id: 'act-005',
    numeroActa: 'ACT-EPP-2026-0095',
    trabajadorId: 'trb-005',
    trabajadorNombre: 'Pedro Rivas',
    cedula: 'V-17.119.803',
    cargo: 'Técnico Mecánico de Campo',
    departamento: 'Mantenimiento Planta',
    frenteAsignado: 'Frente PMH - Muelle',
    fechaEntrega: '2026-05-15',
    fechaProximaRenovacion: '2026-10-15',
    diasParaRenovacion: 9,
    estado: 'Por Renovar',
    itemsEntregados: [
      { itemCodigo: 'EPP-BOT-01', itemNombre: 'Botas de Seguridad Dieléctricas', talla: '44', cantidad: 1, costoTotalUsd: 45 },
      { itemCodigo: 'EPP-BRG-01', itemNombre: 'Braga Industrial Azul Marino TIMACA', talla: 'XL', cantidad: 2, costoTotalUsd: 64 },
      { itemCodigo: 'EPP-CSC-01', itemNombre: 'Casco de Seguridad MSA V-Gard', talla: 'Universal', cantidad: 1, costoTotalUsd: 18 }
    ],
    costoTotalUsd: 127,
    entregadoPor: 'Almacén Central',
    firmaConforme: true,
    observaciones: 'ALERTA: Quedan 9 días para vencimiento de ciclo semestral. Citar a almacén para reposición de calzado.'
  },
  {
    id: 'act-006',
    numeroActa: 'ACT-EPP-2026-0096',
    trabajadorId: 'trb-006',
    trabajadorNombre: 'Alexander Guanipa',
    cedula: 'V-14.789.330',
    cargo: 'Supervisor de Frente de Obra',
    departamento: 'Supervisión HSE & Campo',
    frenteAsignado: 'Frente PMH - Muelle',
    fechaEntrega: '2026-08-18',
    fechaProximaRenovacion: '2027-02-18',
    diasParaRenovacion: 135,
    estado: 'Vigente',
    itemsEntregados: [
      { itemCodigo: 'EPP-BOT-01', itemNombre: 'Botas de Seguridad Dieléctricas', talla: '41', cantidad: 1, costoTotalUsd: 45 },
      { itemCodigo: 'EPP-BRG-01', itemNombre: 'Braga Industrial Azul Marino TIMACA', talla: 'M', cantidad: 2, costoTotalUsd: 64 },
      { itemCodigo: 'EPP-AUD-01', itemNombre: 'Protector Auditivo Copa Peltor', talla: 'Universal', cantidad: 1, costoTotalUsd: 26 },
      { itemCodigo: 'EPP-LEN-01', itemNombre: 'Lentes de Seguridad Claros/Oscuros', talla: 'Universal', cantidad: 2, costoTotalUsd: 13 }
    ],
    costoTotalUsd: 148,
    entregadoPor: 'Almacén Central (Daniela Riveros)',
    firmaConforme: true,
    observaciones: 'Dotación de supervisor en muelle entregada con protector auditivo para área de chancado.'
  },
  {
    id: 'act-007',
    numeroActa: 'ACT-EPP-2026-0097',
    trabajadorId: 'trb-007',
    trabajadorNombre: 'David Centeno',
    cedula: 'V-17.550.812',
    cargo: 'Electricista Industrial',
    departamento: 'Mantenimiento Planta',
    frenteAsignado: 'Patio de Grúas - Taller Eléctrico',
    fechaEntrega: '2026-04-12',
    fechaProximaRenovacion: '2026-10-12',
    diasParaRenovacion: 6,
    estado: 'Por Renovar',
    itemsEntregados: [
      { itemCodigo: 'EPP-BOT-01', itemNombre: 'Botas Dieléctricas 18kV', talla: '40', cantidad: 1, costoTotalUsd: 45 },
      { itemCodigo: 'EPP-BRG-01', itemNombre: 'Braga Gabardina Algodón Antiestática', talla: 'M', cantidad: 2, costoTotalUsd: 64 }
    ],
    costoTotalUsd: 109,
    entregadoPor: 'Almacén Central',
    firmaConforme: true,
    observaciones: 'Próxima renovación de botas dieléctricas en 6 días por vencimiento de rigidez dieléctrica.'
  }
];
