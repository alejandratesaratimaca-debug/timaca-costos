/**
 * Datos Oficiales de Seguridad Industrial & Salud Laboral TIMACA
 * Basado en Procedimiento CORP-035-P03 Rev. 3 · LOPCYMAT Art. 56 · NT-01-2008
 * Google Sheet: https://docs.google.com/spreadsheets/d/1-KEmOouFYYnFxayq3uQGJgZrYCgsRFfhv1CXNKmFtX4/edit?gid=716332079
 */

export interface PeligroCatalogo {
  codigo: number | string;
  categoria: string;
  peligro: string;
}

export type NivelJerarquiaControl = 
  | '1 · Eliminación'
  | '2 · Sustitución'
  | '3 · Control de ingeniería'
  | '4 · Control administrativo'
  | '5 · Equipo de protección personal (EPP)';

export type NivelIntervencion = 'I — Intolerable' | 'II — Importante' | 'III — Moderado' | 'IV — Tolerable';

export interface PlanControlRiesgo {
  idPlan: string;
  idRiesgo: string;
  area: string;
  puestoActividad: string;
  peligro: string;
  nrInicial: number;
  niInicial: NivelIntervencion;
  nivelJerarquia: NivelJerarquiaControl;
  medidaControl: string;
  responsable: string;
  recursosRequeridos: string;
  fechaCompromiso: string;
  estado: 'Pendiente' | 'En ejecución' | 'Ejecutado' | 'Verificado' | 'Vencido';
  fechaEjecucion?: string;
  ndResidual: number;
  neResidual: number;
  ncResidual: number;
  nrResidual: number;
  niResidual: NivelIntervencion;
  evidencia?: string;
  verificadoPor?: string;
}

export interface EvaluacionIPER {
  id: string;
  fecha: string;
  area: string;
  puestoActividad: string;
  tipo: 'Rutinaria' | 'No Rutinaria';
  expuestos: number;
  codigoPeligro: number | string;
  peligroIdentificado: string;
  controlesExistentes: string;
  nd: number; // 10, 6, 2, 0
  ne: number; // 4, 3, 2, 1
  np: number; // nd * ne
  probabilidadTexto: 'Muy Alto' | 'Alto' | 'Medio' | 'Bajo';
  nc: number; // 100, 60, 25, 10
  nr: number; // np * nc
  ni: NivelIntervencion;
  aceptabilidad: 'No Aceptable' | 'Aceptable con control específico' | 'Aceptable';
  evaluador: string;
  supervisor: string;
  estadoPlan: 'Con Plan Asignado' | 'Pendiente Plan' | 'No Requiere Plan';
}

export const CATALOGO_PELIGROS_OFICIAL: PeligroCatalogo[] = [
  {
    "codigo": 46023,
    "categoria": "A · Condiciones de seguridad",
    "peligro": "Caída de persona a distinto nivel"
  },
  {
    "codigo": 46054,
    "categoria": "A · Condiciones de seguridad",
    "peligro": "Caída de persona al mismo nivel"
  },
  {
    "codigo": 46082,
    "categoria": "A · Condiciones de seguridad",
    "peligro": "Caída de objeto por derrumbe"
  },
  {
    "codigo": 46113,
    "categoria": "A · Condiciones de seguridad",
    "peligro": "Caída de objeto por desprendimiento"
  },
  {
    "codigo": 46143,
    "categoria": "A · Condiciones de seguridad",
    "peligro": "Caída de objeto en manipulación"
  },
  {
    "codigo": 46174,
    "categoria": "A · Condiciones de seguridad",
    "peligro": "Pisada de objeto"
  },
  {
    "codigo": 46024,
    "categoria": "A · Condiciones de seguridad",
    "peligro": "Atrapamiento por o entre objetos"
  },
  {
    "codigo": 46055,
    "categoria": "A · Condiciones de seguridad",
    "peligro": "Atrapamiento por vuelco de maquinaria"
  },
  {
    "codigo": 46025,
    "categoria": "A · Condiciones de seguridad",
    "peligro": "Golpes contra objetos inmóviles"
  },
  {
    "codigo": 46056,
    "categoria": "A · Condiciones de seguridad",
    "peligro": "Golpes contra objetos móviles"
  },
  {
    "codigo": 46084,
    "categoria": "A · Condiciones de seguridad",
    "peligro": "Golpes por objetos o herramientas"
  },
  {
    "codigo": 46026,
    "categoria": "A · Condiciones de seguridad",
    "peligro": "Perforado por objetos cortantes o punzantes"
  },
  {
    "codigo": 46057,
    "categoria": "A · Condiciones de seguridad",
    "peligro": "Cortado por o con cuchillas"
  },
  {
    "codigo": 46027,
    "categoria": "A · Condiciones de seguridad",
    "peligro": "Contacto térmico extremo"
  },
  {
    "codigo": 46028,
    "categoria": "A · Condiciones de seguridad",
    "peligro": "Contacto eléctrico"
  },
  {
    "codigo": 46029,
    "categoria": "A · Condiciones de seguridad",
    "peligro": "Proyección de partículas"
  },
  {
    "codigo": 46030,
    "categoria": "B · Condiciones ambientales de trabajo",
    "peligro": "Exposición a ruido ocupacional"
  },
  {
    "codigo": 46031,
    "categoria": "B · Condiciones ambientales de trabajo",
    "peligro": "Exposición a vibraciones"
  },
  {
    "codigo": 46032,
    "categoria": "B · Condiciones ambientales de trabajo",
    "peligro": "Estrés térmico"
  },
  {
    "codigo": 46033,
    "categoria": "B · Condiciones ambientales de trabajo",
    "peligro": "Radiaciones ionizantes: rayos X"
  },
  {
    "codigo": 46064,
    "categoria": "B · Condiciones ambientales de trabajo",
    "peligro": "Radiaciones ionizantes: rayos gamma"
  },
  {
    "codigo": 46034,
    "categoria": "B · Condiciones ambientales de trabajo",
    "peligro": "Radiaciones no ionizantes: ultravioleta"
  },
  {
    "codigo": 46065,
    "categoria": "B · Condiciones ambientales de trabajo",
    "peligro": "Radiaciones no ionizantes: infrarrojo"
  },
  {
    "codigo": 46093,
    "categoria": "B · Condiciones ambientales de trabajo",
    "peligro": "Radiaciones no ionizantes: microondas"
  },
  {
    "codigo": 46124,
    "categoria": "B · Condiciones ambientales de trabajo",
    "peligro": "Radiaciones no ionizantes: ondas de radio"
  },
  {
    "codigo": 46154,
    "categoria": "B · Condiciones ambientales de trabajo",
    "peligro": "Campos eléctricos"
  },
  {
    "codigo": 46035,
    "categoria": "B · Condiciones ambientales de trabajo",
    "peligro": "Disconfort térmico"
  },
  {
    "codigo": 46036,
    "categoria": "B · Condiciones ambientales de trabajo",
    "peligro": "Humedad"
  },
  {
    "codigo": 46037,
    "categoria": "B · Condiciones ambientales de trabajo",
    "peligro": "Ventilación deficiente"
  },
  {
    "codigo": 46038,
    "categoria": "B · Condiciones ambientales de trabajo",
    "peligro": "Exposición al polvo"
  },
  {
    "codigo": 46039,
    "categoria": "B · Condiciones ambientales de trabajo",
    "peligro": "Deslumbramientos"
  },
  {
    "codigo": 46070,
    "categoria": "B · Condiciones ambientales de trabajo",
    "peligro": "Pérdida de agudeza visual"
  },
  {
    "codigo": 46098,
    "categoria": "B · Condiciones ambientales de trabajo",
    "peligro": "Fatiga visual"
  },
  {
    "codigo": 46040,
    "categoria": "B · Condiciones ambientales de trabajo",
    "peligro": "Contaminantes químicos: gases"
  },
  {
    "codigo": 46071,
    "categoria": "B · Condiciones ambientales de trabajo",
    "peligro": "Contaminantes químicos: humo"
  },
  {
    "codigo": 46099,
    "categoria": "B · Condiciones ambientales de trabajo",
    "peligro": "Contaminantes químicos: vapores"
  },
  {
    "codigo": 46130,
    "categoria": "B · Condiciones ambientales de trabajo",
    "peligro": "Contaminantes químicos: líquidos agresivos"
  },
  {
    "codigo": 46041,
    "categoria": "B · Condiciones ambientales de trabajo",
    "peligro": "Virus, hongos, bacterias o parásitos"
  },
  {
    "codigo": 46072,
    "categoria": "B · Condiciones ambientales de trabajo",
    "peligro": "Condiciones sanitarias de baños"
  },
  {
    "codigo": 46100,
    "categoria": "B · Condiciones ambientales de trabajo",
    "peligro": "Infecciones por aguas estancadas"
  },
  {
    "codigo": 46131,
    "categoria": "B · Condiciones ambientales de trabajo",
    "peligro": "Mordeduras o picaduras de animales e insectos"
  },
  {
    "codigo": 46042,
    "categoria": "C · Condiciones ergonómicas",
    "peligro": "Superficie y volumen del área de trabajo"
  },
  {
    "codigo": 46043,
    "categoria": "C · Condiciones ergonómicas",
    "peligro": "Espacios físicos reducidos"
  },
  {
    "codigo": 46044,
    "categoria": "C · Condiciones ergonómicas",
    "peligro": "Trabajo sedentario"
  },
  {
    "codigo": 46075,
    "categoria": "C · Condiciones ergonómicas",
    "peligro": "Movilidad restringida"
  },
  {
    "codigo": 46103,
    "categoria": "C · Condiciones ergonómicas",
    "peligro": "Esfuerzos o sobreesfuerzos"
  },
  {
    "codigo": 46134,
    "categoria": "C · Condiciones ergonómicas",
    "peligro": "Posturas forzadas"
  },
  {
    "codigo": 46164,
    "categoria": "C · Condiciones ergonómicas",
    "peligro": "Manipulación de carga"
  },
  {
    "codigo": 46195,
    "categoria": "C · Condiciones ergonómicas",
    "peligro": "Movimientos repetitivos"
  },
  {
    "codigo": 46045,
    "categoria": "C · Condiciones ergonómicas",
    "peligro": "Carga dinámica: trabajo ligero"
  },
  {
    "codigo": 46076,
    "categoria": "C · Condiciones ergonómicas",
    "peligro": "Carga dinámica: trabajo moderado"
  },
  {
    "codigo": 46104,
    "categoria": "C · Condiciones ergonómicas",
    "peligro": "Carga dinámica: trabajo fuerte"
  },
  {
    "codigo": 46046,
    "categoria": "C · Condiciones ergonómicas",
    "peligro": "Grado de atención exigido"
  },
  {
    "codigo": 46047,
    "categoria": "C · Condiciones ergonómicas",
    "peligro": "Complejidad de la tarea"
  },
  {
    "codigo": 46048,
    "categoria": "D · Organización del trabajo",
    "peligro": "Uso inadecuado de mobiliario, artefactos o equipos"
  },
  {
    "codigo": 46049,
    "categoria": "D · Organización del trabajo",
    "peligro": "Cantidad inadecuada de tareas asignadas"
  },
  {
    "codigo": 46050,
    "categoria": "D · Organización del trabajo",
    "peligro": "Velocidad inadecuada para realizar la tarea"
  },
  {
    "codigo": 46051,
    "categoria": "D · Organización del trabajo",
    "peligro": "Monotonía y repetitividad de las tareas"
  },
  {
    "codigo": 46052,
    "categoria": "E · Aspectos psicosociales",
    "peligro": "Desgaste profesional (síndrome de burnout)"
  },
  {
    "codigo": 46053,
    "categoria": "E · Aspectos psicosociales",
    "peligro": "Inseguridad en las decisiones"
  },
  {
    "codigo": "32.1",
    "categoria": "E · Aspectos psicosociales",
    "peligro": "Hábitos"
  },
  {
    "codigo": "33.1",
    "categoria": "E · Aspectos psicosociales",
    "peligro": "Manejo de las emociones"
  },
  {
    "codigo": "34.1",
    "categoria": "E · Aspectos psicosociales",
    "peligro": "Intimidación"
  },
  {
    "codigo": "35.1",
    "categoria": "F · Aspectos del comportamiento",
    "peligro": "Ambigüedad del rol: incumplimiento de estándares"
  },
  {
    "codigo": "36.1",
    "categoria": "F · Aspectos del comportamiento",
    "peligro": "Conflicto de rol: falta de competencias"
  },
  {
    "codigo": "37.1",
    "categoria": "F · Aspectos del comportamiento",
    "peligro": "Adaptación a tareas nuevas o inusuales"
  },
  {
    "codigo": "38.1",
    "categoria": "F · Aspectos del comportamiento",
    "peligro": "Falta de atención: distracciones o descuidos"
  },
  {
    "codigo": "39.1",
    "categoria": "G · Incendios y explosiones",
    "peligro": "Almacenamiento de combustibles: incendio o explosión"
  },
  {
    "codigo": "40.1",
    "categoria": "G · Incendios y explosiones",
    "peligro": "Cortocircuitos: incendio"
  },
  {
    "codigo": "41.1",
    "categoria": "H · Fenómenos naturales",
    "peligro": "Terremoto"
  },
  {
    "codigo": "42.1",
    "categoria": "H · Fenómenos naturales",
    "peligro": "Inundaciones"
  },
  {
    "codigo": "43.1",
    "categoria": "I · Público",
    "peligro": "Delincuencia y desorden público"
  }
];

export const MATRIZ_IPER_INICIAL: EvaluacionIPER[] = [
  {
    id: 'RSG-PMH-001',
    fecha: '2026-09-15',
    area: 'Muelle PMH (PMH)',
    puestoActividad: 'Operación de Izaje Tándem y Maniobra en Muelle',
    tipo: 'No Rutinaria',
    expuestos: 8,
    codigoPeligro: 46023,
    peligroIdentificado: 'Caída de persona a distinto nivel durante acceso a pluma y cabina',
    controlesExistentes: 'Uso de arnés de cuerpo entero, charla de 5 min pre-turno',
    nd: 6,
    ne: 3,
    np: 18,
    probabilidadTexto: 'Alto',
    nc: 60,
    nr: 1080,
    ni: 'I — Intolerable',
    aceptabilidad: 'No Aceptable',
    evaluador: 'Ing. Carlos Mendoza (Inspector HSE)',
    supervisor: 'Ing. Nelson Rondón',
    estadoPlan: 'Con Plan Asignado'
  },
  {
    id: 'RSG-PMH-002',
    fecha: '2026-09-18',
    area: 'Muelle PMH (PMH)',
    puestoActividad: 'Montaje Estructural en Pasarela Ship Loader',
    tipo: 'Rutinaria',
    expuestos: 6,
    codigoPeligro: 46113,
    peligroIdentificado: 'Caída de objeto por desprendimiento durante izaje de vigas',
    controlesExistentes: 'Casco de seguridad con barbuquejo, señalero en tierra',
    nd: 6,
    ne: 3,
    np: 18,
    probabilidadTexto: 'Alto',
    nc: 25,
    nr: 450,
    ni: 'II — Importante',
    aceptabilidad: 'Aceptable con control específico',
    evaluador: 'Ing. Carlos Mendoza (Inspector HSE)',
    supervisor: 'Téc. Alexander Guanipa',
    estadoPlan: 'Con Plan Asignado'
  },
  {
    id: 'RSG-PELLAS-001',
    fecha: '2026-09-20',
    area: 'Planta de Pellas - Horno L2',
    puestoActividad: 'Limpieza y Desincrustación de Tolva de Descarga 04',
    tipo: 'No Rutinaria',
    expuestos: 4,
    codigoPeligro: 46040,
    peligroIdentificado: 'Contaminantes químicos: gases tóxicos y deficiencia de oxígeno en espacio confinado',
    controlesExistentes: 'Medición de gases esporádica previa a la entrada',
    nd: 10,
    ne: 2,
    np: 20,
    probabilidadTexto: 'Alto',
    nc: 100,
    nr: 2000,
    ni: 'I — Intolerable',
    aceptabilidad: 'No Aceptable',
    evaluador: 'Téc. Yaritza Bolívar (Supervisora SHA)',
    supervisor: 'Franklin Morales',
    estadoPlan: 'Con Plan Asignado'
  },
  {
    id: 'RSG-PELLAS-002',
    fecha: '2026-09-22',
    area: 'Planta de Pellas - Secador L1',
    puestoActividad: 'Mantenimiento Mecánico de Reductores y Chumaceras',
    tipo: 'Rutinaria',
    expuestos: 5,
    codigoPeligro: 46024,
    peligroIdentificado: 'Atrapamiento por o entre objetos móviles durante inspección de transmisiones',
    controlesExistentes: 'Parada de emergencia, señalización de peligro',
    nd: 6,
    ne: 3,
    np: 18,
    probabilidadTexto: 'Alto',
    nc: 25,
    nr: 450,
    ni: 'II — Importante',
    aceptabilidad: 'Aceptable con control específico',
    evaluador: 'Ing. Carlos Mendoza (Inspector HSE)',
    supervisor: 'Franklin Morales',
    estadoPlan: 'Con Plan Asignado'
  },
  {
    id: 'RSG-TALLER-001',
    fecha: '2026-09-25',
    area: 'Taller Central TIMACA (Bahía 1)',
    puestoActividad: 'Conformado de Planchas en Prensa Hidráulica 400T',
    tipo: 'Rutinaria',
    expuestos: 3,
    codigoPeligro: 46024,
    peligroIdentificado: 'Atrapamiento por elementos motrices y cilindro de alta presión',
    controlesExistentes: 'Botón de doble mando bimanual',
    nd: 6,
    ne: 3,
    np: 18,
    probabilidadTexto: 'Alto',
    nc: 60,
    nr: 1080,
    ni: 'I — Intolerable',
    aceptabilidad: 'No Aceptable',
    evaluador: 'Ing. Carlos Mendoza (Inspector HSE)',
    supervisor: 'Ing. Javier Arreaza',
    estadoPlan: 'Con Plan Asignado'
  },
  {
    id: 'RSG-TALLER-002',
    fecha: '2026-09-26',
    area: 'Taller Central TIMACA (Bahía 2)',
    puestoActividad: 'Soldadura de Vigas Carrileras y Unión de Planchones',
    tipo: 'Rutinaria',
    expuestos: 12,
    codigoPeligro: 46029,
    peligroIdentificado: 'Proyección de partículas incandescentes y radiaciones no ionizantes UV',
    controlesExistentes: 'Careta para soldar, delantal de cuero y guantes de carnaza',
    nd: 2,
    ne: 4,
    np: 8,
    probabilidadTexto: 'Medio',
    nc: 10,
    nr: 80,
    ni: 'III — Moderado',
    aceptabilidad: 'Aceptable',
    evaluador: 'Téc. Yaritza Bolívar',
    supervisor: 'Edgar Quijada',
    estadoPlan: 'No Requiere Plan'
  },
  {
    id: 'RSG-ELEC-001',
    fecha: '2026-09-28',
    area: 'Patio & Subestación Secundaria',
    puestoActividad: 'Intervención de Celda de Transformador 4.160V a 480V',
    tipo: 'No Rutinaria',
    expuestos: 3,
    codigoPeligro: 46028,
    peligroIdentificado: 'Contacto eléctrico directo y arco eléctrico por energía residual',
    controlesExistentes: 'Protocolo verbal de desenergización',
    nd: 10,
    ne: 2,
    np: 20,
    probabilidadTexto: 'Alto',
    nc: 100,
    nr: 2000,
    ni: 'I — Intolerable',
    aceptabilidad: 'No Aceptable',
    evaluador: 'Ing. Carlos Mendoza (Inspector HSE)',
    supervisor: 'Ing. Javier Arreaza',
    estadoPlan: 'Con Plan Asignado'
  },
  {
    id: 'RSG-GRUA-001',
    fecha: '2026-10-02',
    area: 'Flota Grúas Móviles (26 Equipos)',
    puestoActividad: 'Traslado y Posicionamiento de Grúa GR17 Liebherr 160T en Terreno',
    tipo: 'Rutinaria',
    expuestos: 4,
    codigoPeligro: 46055,
    peligroIdentificado: 'Atrapamiento o vuelco de maquinaria por falla de estabilizadores o compactación',
    controlesExistentes: 'Placas de apoyo de madera en estabilizadores, nivel de burbuja',
    nd: 6,
    ne: 2,
    np: 12,
    probabilidadTexto: 'Alto',
    nc: 60,
    nr: 720,
    ni: 'I — Intolerable',
    aceptabilidad: 'No Aceptable',
    evaluador: 'Ing. Carlos Mendoza (Inspector HSE)',
    supervisor: 'Nelson Rondón',
    estadoPlan: 'Con Plan Asignado'
  }
];

export const PLANES_CONTROL_INICIALES: PlanControlRiesgo[] = [
  {
    idPlan: 'PLC-2026-001',
    idRiesgo: 'RSG-PMH-001',
    area: 'Muelle PMH (PMH)',
    puestoActividad: 'Operación de Izaje Tándem y Maniobra en Muelle',
    peligro: 'Caída de persona a distinto nivel durante acceso a pluma y cabina',
    nrInicial: 1080,
    niInicial: 'I — Intolerable',
    nivelJerarquia: '3 · Control de ingeniería',
    medidaControl: 'Instalación de línea de vida horizontal certificada EN 795 y sistema retráctil anticaídas en escala de pluma de grúas GR17 y GR15.',
    responsable: 'Ing. Carlos Mendoza / Dpto. Mantenimiento',
    recursosRequeridos: '2 Cables de acero inoxidable 3/8", 4 absorbedores de impacto, kit de anclaje certificado',
    fechaCompromiso: '2026-10-15',
    estado: 'En ejecución',
    fechaEjecucion: undefined,
    ndResidual: 2,
    neResidual: 2,
    ncResidual: 25,
    nrResidual: 100,
    niResidual: 'III — Moderado',
    evidencia: 'Orden de compra de líneas retráctiles OC-TIM-9942 en tránsito',
    verificadoPor: 'Ing. Alejandra Tesara (Analista HSE)'
  },
  {
    idPlan: 'PLC-2026-002',
    idRiesgo: 'RSG-PMH-002',
    area: 'Muelle PMH (PMH)',
    puestoActividad: 'Montaje Estructural en Pasarela Ship Loader',
    peligro: 'Caída de objeto por desprendimiento durante izaje de vigas',
    nrInicial: 450,
    niInicial: 'II — Importante',
    nivelJerarquia: '4 · Control administrativo',
    medidaControl: 'Implementación de protocolo obligatorio de radiofrecuencia exclusiva canal 4, delimitación perimetral rígida a 25m y uso de mallas de retención bajo carga suspendida.',
    responsable: 'Téc. Alexander Guanipa (Rigger Nivel II)',
    recursosRequeridos: 'Radios VHF intrínsecamente seguros, mallas de protección de carga de alta resistencia',
    fechaCompromiso: '2026-10-05',
    estado: 'Verificado',
    fechaEjecucion: '2026-10-04',
    ndResidual: 2,
    neResidual: 2,
    ncResidual: 10,
    nrResidual: 40,
    niResidual: 'III — Moderado',
    evidencia: 'Acta de entrega de radios e inspección de izaje conforme REG-PMH-2026-44',
    verificadoPor: 'Ing. Carlos Mendoza'
  },
  {
    idPlan: 'PLC-2026-003',
    idRiesgo: 'RSG-PELLAS-001',
    area: 'Planta de Pellas - Horno L2',
    puestoActividad: 'Limpieza y Desincrustación de Tolva de Descarga 04',
    peligro: 'Contaminantes químicos: gases tóxicos y deficiencia de oxígeno en espacio confinado',
    nrInicial: 2000,
    niInicial: 'I — Intolerable',
    nivelJerarquia: '3 · Control de ingeniería',
    medidaControl: 'Adquisición de extractor/inyector forzado a prueba de explosión de 3.000 CFM y detector multigás 4 vías calibrado con bomba de succión continua remota.',
    responsable: 'Téc. Yaritza Bolívar / Procura TIMACA',
    recursosRequeridos: 'Ventilador neumático axial, detector Altair 4XR calibrado, trípode de rescate vertical',
    fechaCompromiso: '2026-10-10',
    estado: 'En ejecución',
    fechaEjecucion: undefined,
    ndResidual: 2,
    neResidual: 2,
    ncResidual: 25,
    nrResidual: 100,
    niResidual: 'III — Moderado',
    evidencia: 'Equipo detector calibrado en planta y vigía certificado en espacio confinado',
    verificadoPor: 'Ing. Alejandra Tesara (Analista HSE)'
  },
  {
    idPlan: 'PLC-2026-004',
    idRiesgo: 'RSG-PELLAS-002',
    area: 'Planta de Pellas - Secador L1',
    puestoActividad: 'Mantenimiento Mecánico de Reductores y Chumaceras',
    peligro: 'Atrapamiento por o entre objetos móviles durante inspección de transmisiones',
    nrInicial: 450,
    niInicial: 'II — Importante',
    nivelJerarquia: '3 · Control de ingeniería',
    medidaControl: 'Instalación de guardas metálicas perimetrales con microinterruptor de seguridad de parada automática por enclavamiento mecánico.',
    responsable: 'Franklin Morales (Mecánico Jefe)',
    recursosRequeridos: 'Malla electrosoldada galvanizada, perfiles tubulares 2", finales de carrera IP67',
    fechaCompromiso: '2026-10-18',
    estado: 'Pendiente',
    fechaEjecucion: undefined,
    ndResidual: 2,
    neResidual: 2,
    ncResidual: 10,
    nrResidual: 40,
    niResidual: 'III — Moderado',
    evidencia: 'Planos de fabricación en taller F-SEC-2026 aprobados',
    verificadoPor: 'Ing. Carlos Mendoza'
  },
  {
    idPlan: 'PLC-2026-005',
    idRiesgo: 'RSG-TALLER-001',
    area: 'Taller Central TIMACA (Bahía 1)',
    puestoActividad: 'Conformado de Planchas en Prensa Hidráulica 400T',
    peligro: 'Atrapamiento por elementos motrices y cilindro de alta presión',
    nrInicial: 1080,
    niInicial: 'I — Intolerable',
    nivelJerarquia: '3 · Control de ingeniería',
    medidaControl: 'Instalación de barrera fotoeléctrica (cortina de luz infrarroja Categoría 4) con paro instantáneo de ciclo de bajada ante intrusión en zona de troquelado.',
    responsable: 'Ing. Javier Arreaza / Dpto. Electricidad',
    recursosRequeridos: 'Cortina de seguridad Sick M4000, relé de seguridad Pilz, cableado apantallado',
    fechaCompromiso: '2026-10-12',
    estado: 'En ejecución',
    fechaEjecucion: undefined,
    ndResidual: 2,
    neResidual: 1,
    ncResidual: 25,
    nrResidual: 50,
    niResidual: 'III — Moderado',
    evidencia: 'Componentes recibidos en pañol central, montaje programado para fin de semana',
    verificadoPor: 'Ing. Alejandra Tesara (Analista HSE)'
  },
  {
    idPlan: 'PLC-2026-006',
    idRiesgo: 'RSG-ELEC-001',
    area: 'Patio & Subestación Secundaria',
    puestoActividad: 'Intervención de Celda de Transformador 4.160V a 480V',
    peligro: 'Contacto eléctrico directo y arco eléctrico por energía residual',
    nrInicial: 2000,
    niInicial: 'I — Intolerable',
    nivelJerarquia: '4 · Control administrativo',
    medidaControl: 'Aplicación estricta y documentada del procedimiento LOTOTO con bloqueo físico de cuchillas, bloqueo con aldaba de 6 candados, descarga a tierra con pértiga certificada y traje ignífugo anti-arco 40 cal/cm².',
    responsable: 'Ing. Javier Arreaza (Supervisor Alta Tensión)',
    recursosRequeridos: 'Kit de candados rojos numerados, pértiga dieléctrica 36kV, puesta a tierra portátil, EPP anti-arc flash',
    fechaCompromiso: '2026-10-02',
    estado: 'Verificado',
    fechaEjecucion: '2026-10-02',
    ndResidual: 2,
    neResidual: 1,
    ncResidual: 25,
    nrResidual: 50,
    niResidual: 'III — Moderado',
    evidencia: 'Tarjeta LOTOTO-2026-042 firmada y archivada con permiso de alto riesgo',
    verificadoPor: 'Ing. Carlos Mendoza'
  },
  {
    idPlan: 'PLC-2026-007',
    idRiesgo: 'RSG-GRUA-001',
    area: 'Flota Grúas Móviles (26 Equipos)',
    puestoActividad: 'Traslado y Posicionamiento de Grúa GR17 Liebherr 160T en Terreno',
    peligro: 'Atrapamiento o vuelco de maquinaria por falla de estabilizadores o compactación',
    nrInicial: 720,
    niInicial: 'I — Intolerable',
    nivelJerarquia: '4 · Control administrativo',
    medidaControl: 'Certificación obligatoria de estudio de suelo y compactación antes de extender estabilizadores al 100%. Uso de tapetes poliméricos de reparto de carga de 1.200x1.200 mm y verificación de indicador digital de carga Liccon.',
    responsable: 'Nelson Rondón (Operador Principal Grúas)',
    recursosRequeridos: 'Juego de tapetes de alta densidad para 160T, densímetro nuclear o prueba de penetración en sitio',
    fechaCompromiso: '2026-10-06',
    estado: 'Ejecutado',
    fechaEjecucion: '2026-10-05',
    ndResidual: 2,
    neResidual: 2,
    ncResidual: 25,
    nrResidual: 100,
    niResidual: 'III — Moderado',
    evidencia: 'Checklist pre-izaje GR17 y memoria de cálculo de presiones sobre terreno archivada',
    verificadoPor: 'Ing. Alejandra Tesara (Analista HSE)'
  }
];
