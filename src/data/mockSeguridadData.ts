export interface PermisoAltoRiesgo {
  id: string;
  numeroPTAR: string; // PTAR-2026-0089
  tipo: 'Trabajo en Altura' | 'Trabajo en Caliente' | 'Espacio Confinado' | 'Izaje Crítico' | 'Energías Peligrosas / Eléctrico';
  frenteTrabajo: string; // Muelle de Carga PMH, Taller Central, Planta de Pellas, etc.
  equipoIntervenido: string;
  solicitanteNombre: string;
  solicitanteCargo: string;
  supervisorHSE: string;
  fechaEmision: string;
  horaInicio: string;
  horaFinEstimada: string;
  estado: 'Activo / En Ejecución' | 'Cerrado / Conforme' | 'Suspendido';
  medidasPreventivas: string[];
  nivelRiesgo: 'Alto' | 'Muy Alto' | 'Medio';
  personalAutorizado: string[];
}

export interface BloqueoSeguridadLOTOTO {
  id: string;
  numeroTarjeta: string; // LOTOTO-2026-042
  puntoBloqueo: string; // Interruptor Principal CCM-02, Válvula de Entrada Gas Propano, etc.
  ubicacion: string;
  equipoAfectado: string;
  responsableBloqueo: string;
  cargo: string;
  fechaBloqueo: string;
  horaBloqueo: string;
  estado: 'Bloqueado / Desenergizado' | 'Liberado / Normalizado';
  motivo: string;
  candadoNumero: string;
}

export interface CharlaSeguridadTDS {
  id: string;
  numeroActa: string; // TDS-2026-145
  fecha: string;
  frenteTrabajo: string;
  temaTratado: string;
  facilitador: string;
  cargoFacilitador: string;
  asistentesCantidad: number;
  observaciones: string;
}

export interface InspeccionHSE {
  id: string;
  numeroInspeccion: string; // INSP-2026-068
  fecha: string;
  frenteTrabajo: string;
  tipo: 'Eslingas y Grilletes de Izaje' | 'Extintores y Red Contra Incendio' | 'Arneses y Líneas de Vida' | 'Orden y Limpieza 5S' | 'Protecciones de Maquinaria';
  inspector: string;
  resultado: 'Conforme' | 'Con Observaciones' | 'No Conforme / Bloqueado';
  noConformidadesTotal: number;
  noConformidadesCerradas: number;
}

export const MOCK_PERMISOS_ALTO_RIESGO: PermisoAltoRiesgo[] = [
  {
    id: 'ptar-001',
    numeroPTAR: 'PTAR-2026-0089',
    tipo: 'Izaje Crítico',
    frenteTrabajo: 'Muelle de Carga PMH (Ship Loader)',
    equipoIntervenido: 'Grúa GR17 Liebherr (160T) + Grúa GR15 Grove (70T)',
    solicitanteNombre: 'Nelson Rondón',
    solicitanteCargo: 'Operador Especialista de Grúas Pesadas',
    supervisorHSE: 'Ing. Carlos Mendoza (Inspector HSE)',
    fechaEmision: '2026-10-06',
    horaInicio: '07:30',
    horaFinEstimada: '16:30',
    estado: 'Activo / En Ejecución',
    nivelRiesgo: 'Muy Alto',
    medidasPreventivas: [
      'Estudio de riggers y memoria de cálculo de izaje tándem aprobada',
      'Verificación de viento < 28 km/h mediante anemómetro digital en pluma',
      'Delimitación perimetral de 25 metros con cinta y conos de seguridad',
      'Inspección al 100% de eslingas de acero y grilletes de 25 toneladas'
    ],
    personalAutorizado: ['Nelson Rondón', 'José Gregorio Salazar', 'Alexander Guanipa (Rigger)', 'Pedro Rivas (Rigger)']
  },
  {
    id: 'ptar-002',
    numeroPTAR: 'PTAR-2026-0090',
    tipo: 'Espacio Confinado',
    frenteTrabajo: 'Línea de Pellas - Horno L2',
    equipoIntervenido: 'Interior de Tolva y Chute de Descarga 04',
    solicitanteNombre: 'Franklin Morales',
    solicitanteCargo: 'Mecánico de Mantenimiento de Planta',
    supervisorHSE: 'Téc. Yaritza Bolívar (Supervisora SHA)',
    fechaEmision: '2026-10-06',
    horaInicio: '08:00',
    horaFinEstimada: '14:00',
    estado: 'Activo / En Ejecución',
    nivelRiesgo: 'Muy Alto',
    medidasPreventivas: [
      'Medición continua de atmósfera (O2: 20.9%, LEL: 0%, CO: 0 ppm, H2S: 0 ppm)',
      'Vigía de seguridad permanente en boca de hombre con radio VHF',
      'Extractor / inyector de aire forzado continuo de 2.500 CFM',
      'Línea de vida retráctil y arnés con anillo dorsal para rescate vertical'
    ],
    personalAutorizado: ['Franklin Morales', 'David Carvajal', 'Yaritza Bolívar (Vigía)']
  },
  {
    id: 'ptar-003',
    numeroPTAR: 'PTAR-2026-0091',
    tipo: 'Trabajo en Caliente',
    frenteTrabajo: 'Taller Central TIMACA (Bahía 2)',
    equipoIntervenido: 'Viga Carrilera Puente Grúa 20T - Soldadura Arco Sumergido',
    solicitanteNombre: 'Edgar Quijada',
    solicitanteCargo: 'Soldador Especialista 6G',
    supervisorHSE: 'Ing. Carlos Mendoza (Inspector HSE)',
    fechaEmision: '2026-10-06',
    horaInicio: '08:30',
    horaFinEstimada: '17:00',
    estado: 'Activo / En Ejecución',
    nivelRiesgo: 'Alto',
    medidasPreventivas: [
      'Extintor de PQS de 20 lbs a menos de 3 metros del punto de chispa',
      'Mantas ignífugas de fibra de vidrio delimitando la proyección de partículas',
      'Verificación de ausencia de materiales combustibles en radio de 10 metros',
      'Monitoreo post-trabajo obligatorio de 30 minutos al concluir la soldadura'
    ],
    personalAutorizado: ['Edgar Quijada', 'Marcos Rondón', 'Jesús Benítez (Ayudante)']
  },
  {
    id: 'ptar-004',
    numeroPTAR: 'PTAR-2026-0092',
    tipo: 'Trabajo en Altura',
    frenteTrabajo: 'Torre de Transferencia TT-201 (PMH)',
    equipoIntervenido: 'Plataforma Superior y Cabezal de Descarga Correa CV-01',
    solicitanteNombre: 'Juan Carlos Brito',
    solicitanteCargo: 'Técnico Montador Estructural',
    supervisorHSE: 'Ing. Carlos Mendoza (Inspector HSE)',
    fechaEmision: '2026-10-06',
    horaInicio: '09:00',
    horaFinEstimada: '15:30',
    estado: 'Activo / En Ejecución',
    nivelRiesgo: 'Alto',
    medidasPreventivas: [
      'Uso obligatorio de arnés de cuerpo entero con doble cabo de vida y absorbedor',
      'Puntos de anclaje certificados con resistencia mínima de 5.000 lbs (22.2 kN)',
      'Línea de vida horizontal de cable de acero instalada por personal calificado',
      'Portaherramientas atadas para prevención de caída de objetos a nivel inferior'
    ],
    personalAutorizado: ['Juan Carlos Brito', 'Luis Morales', 'Carlos Mendoza (Supervisor)']
  },
  {
    id: 'ptar-005',
    numeroPTAR: 'PTAR-2026-0087',
    tipo: 'Energías Peligrosas / Eléctrico',
    frenteTrabajo: 'Patio de Minerales & Apilador',
    equipoIntervenido: 'Tablero Seccionador Principal 4.160V Motor Apilador ST-01',
    solicitanteNombre: 'Ing. Javier Arreaza',
    solicitanteCargo: 'Supervisor Eléctrico de Alta Tensión',
    supervisorHSE: 'Ing. Carlos Mendoza (Inspector HSE)',
    fechaEmision: '2026-10-05',
    horaInicio: '10:00',
    horaFinEstimada: '14:00',
    estado: 'Cerrado / Conforme',
    nivelRiesgo: 'Muy Alto',
    medidasPreventivas: [
      'Aplicación de protocolo LOTOTO y puesta a tierra visible en las 3 fases',
      'Uso de guantes dieléctricos Clase 4 (36 kV) probados y careta anti-arco',
      'Verificación de tensión cero con pértiga detectora antes de contacto'
    ],
    personalAutorizado: ['Ing. Javier Arreaza', 'Manuel Gómez']
  }
];

export const MOCK_BLOQUEOS_LOTOTO: BloqueoSeguridadLOTOTO[] = [
  {
    id: 'loto-001',
    numeroTarjeta: 'LOTOTO-2026-042',
    puntoBloqueo: 'Interruptor QF-03 en Celda 480V Taller Central',
    ubicacion: 'Subestación Secundaria Taller Central',
    equipoAfectado: 'Prensa Hidráulica 400T - Reparación de Sellos del Pistón',
    responsableBloqueo: 'Franklin Morales (Mecánico)',
    cargo: 'Mecánico de Mantenimiento',
    fechaBloqueo: '2026-10-06',
    horaBloqueo: '07:45',
    estado: 'Bloqueado / Desenergizado',
    motivo: 'Mantenimiento mayor correctivo de circuito hidráulico de alta presión',
    candadoNumero: 'CAND-ROJO-018'
  },
  {
    id: 'loto-002',
    numeroTarjeta: 'LOTOTO-2026-043',
    puntoBloqueo: 'Válvula de Corte Manual V-102 Red de Oxígeno / Gas Propano',
    ubicacion: 'Bahía 3 Patio de Prefabricación',
    equipoAfectado: 'Mesa de Oxicorte CNC Koike Aronson',
    responsableBloqueo: 'Edgar Quijada (Soldador)',
    cargo: 'Soldador Especialista 6G',
    fechaBloqueo: '2026-10-06',
    horaBloqueo: '08:15',
    estado: 'Bloqueado / Desenergizado',
    motivo: 'Reemplazo de mangueras y válvulas arrestallamas por inspección técnica',
    candadoNumero: 'CAND-AMARILLO-007'
  },
  {
    id: 'loto-003',
    numeroTarjeta: 'LOTOTO-2026-040',
    puntoBloqueo: 'Desconectador de Cuchillas Alimentación Tambor Motriz CV-02',
    ubicacion: 'Muelle PMH - Pasarela Ship Loader',
    equipoAfectado: 'Correa Transportadora de Mineral CV-02 (PMH)',
    responsableBloqueo: 'Juan Carlos Brito',
    cargo: 'Técnico Montador',
    fechaBloqueo: '2026-10-04',
    horaBloqueo: '14:00',
    estado: 'Liberado / Normalizado',
    motivo: 'Alineación de polea de cola y tensado de banda',
    candadoNumero: 'CAND-AZUL-022'
  }
];

export const MOCK_CHARLAS_TDS: CharlaSeguridadTDS[] = [
  {
    id: 'tds-001',
    numeroActa: 'TDS-2026-145',
    fecha: '2026-10-06',
    frenteTrabajo: 'Muelle de Carga PMH (Frente PMH)',
    temaTratado: 'Procedimiento de Izaje Crítico Tándem y Comunicación Radial con Operador de Grúa',
    facilitador: 'Ing. Carlos Mendoza',
    cargoFacilitador: 'Inspector de Seguridad Industrial HSE',
    asistentesCantidad: 18,
    observaciones: 'Se enfatizó la regla de un único señalero autorizado (Rigger con chaleco naranja reflectivo).'
  },
  {
    id: 'tds-002',
    numeroActa: 'TDS-2026-144',
    fecha: '2026-10-06',
    frenteTrabajo: 'Taller Central TIMACA (Patio y Naves)',
    temaTratado: 'Inspección Pre-Uso de Herramientas de Potencia y Calibración de Torquímetros SENCAMER',
    facilitador: 'Téc. Yaritza Bolívar',
    cargoFacilitador: 'Supervisora de Seguridad y Salud en el Trabajo',
    asistentesCantidad: 24,
    observaciones: 'Participó el personal del pañol central y cuadrillas de calderería pesada.'
  },
  {
    id: 'tds-003',
    numeroActa: 'TDS-2026-143',
    fecha: '2026-10-05',
    frenteTrabajo: 'Línea de Pellas (Secadores y Hornos)',
    temaTratado: 'Riesgos de Asfixia e Intoxicación en Espacios Confinados: Procedimiento de Rescate',
    facilitador: 'Ing. Carlos Mendoza',
    cargoFacilitador: 'Inspector de Seguridad Industrial HSE',
    asistentesCantidad: 14,
    observaciones: 'Simulacro práctico de uso de detector multigás y trípode con rescatador vertical.'
  }
];

export const MOCK_INSPECCIONES_HSE: InspeccionHSE[] = [
  {
    id: 'insp-001',
    numeroInspeccion: 'INSP-2026-068',
    fecha: '2026-10-05',
    frenteTrabajo: 'Flota de 26 Grúas TIMACA',
    tipo: 'Eslingas y Grilletes de Izaje',
    inspector: 'Alexander Guanipa (Rigger Nivel II)',
    resultado: 'Conforme',
    noConformidadesTotal: 2,
    noConformidadesCerradas: 2
  },
  {
    id: 'insp-002',
    numeroInspeccion: 'INSP-2026-067',
    fecha: '2026-10-04',
    frenteTrabajo: 'Taller Central - Naves 1, 2 y 3',
    tipo: 'Extintores y Red Contra Incendio',
    inspector: 'Téc. Yaritza Bolívar',
    resultado: 'Conforme',
    noConformidadesTotal: 1,
    noConformidadesCerradas: 1
  },
  {
    id: 'insp-003',
    numeroInspeccion: 'INSP-2026-066',
    fecha: '2026-10-03',
    frenteTrabajo: 'Muelle PMH y Torres de Transferencia',
    tipo: 'Arneses y Líneas de Vida',
    inspector: 'Ing. Carlos Mendoza',
    resultado: 'Con Observaciones',
    noConformidadesTotal: 3,
    noConformidadesCerradas: 2
  }
];
