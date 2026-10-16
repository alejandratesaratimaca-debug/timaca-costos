// Matriz Oficial de Servicios Directos para el Proyecto Pellas Línea 1 (TTE-C-0706)
// Coincidencia exacta con la lámina oficial de la Presentación de PowerPoint de Costos TIMACA

export interface SubcategoriaServicioPellas {
  id: string;
  servicio: string;
  abril: number;
  mayo: number;
  junio: number;
  julio: number;
  agosto: number;
  septiembre?: number;
  total: number;
  responsable: string;
  solicitante: string;
  motivoTipico: string;
  descripcionTipica: string;
  um: string;
}

export const TABLA_SERVICIOS_DIRECTOS_PELLAS_OFICIAL: SubcategoriaServicioPellas[] = [
  {
    id: 'traslado-personal',
    servicio: 'Servicio traslado de personal',
    abril: 0,
    mayo: 36340,
    junio: 34720,
    julio: 39995,
    agosto: 44270,
    septiembre: 45878,
    total: 201203,
    responsable: 'Logística & Transporte TIMACA',
    solicitante: 'Coordinación de Logística y Cuadrillas Pellas',
    motivoTipico: 'Traslado diario de cuadrillas operativas en campo (254 trabajadores activos)',
    descripcionTipica: 'Servicio de traslado de personal diario cuadrillas Línea 1 Pellas (254 trabajadores)',
    um: 'mes'
  },
  {
    id: 'alquiler-equipos',
    servicio: 'Alquiler de maquinaria y equipos',
    abril: 0,
    mayo: 4800,
    junio: 18360,
    julio: 4900,
    agosto: 4900,
    septiembre: 8400,
    total: 41360,
    responsable: 'Gerencia de Operaciones',
    solicitante: 'Ing. Residencia de Obra Pellas',
    motivoTipico: 'Tarifa plana operativa alquiler de 12 módulos sanitarios y facilidades de campamento',
    descripcionTipica: 'Alquiler de módulos sanitarios portátiles (12 módulos) y cuota damas',
    um: 'mes'
  },
  {
    id: 'vigilancia-externa',
    servicio: 'Vigilancia externa',
    abril: 0,
    mayo: 0,
    junio: 0,
    julio: 10582,
    agosto: 10582,
    septiembre: 13182,
    total: 34346,
    responsable: 'Seguridad Patrimonial TIMACA',
    solicitante: 'Gerencia de Protección Integral y SIAHO',
    motivoTipico: 'Esquema de resguardo físico y control de accesos Línea 1 Pellas',
    descripcionTipica: 'Servicio de vigilancia externa fija y resguardo patrimonial en obra (Línea 1 Pellas)',
    um: 'mes'
  },
  {
    id: 'fabricacion-puertas',
    servicio: 'Fabricacion de puertas',
    abril: 0,
    mayo: 0,
    junio: 5870,
    julio: 0,
    agosto: 0,
    total: 5870,
    responsable: 'Taller de Carpintería Metálica',
    solicitante: 'Supervisión de Obra Civil',
    motivoTipico: 'Fabricación e instalación de puertas de acceso y cerramientos para frentes',
    descripcionTipica: 'Fabricación de puertas metálicas y cerramientos de seguridad',
    um: 'lote'
  },
  {
    id: 'examenes-medicos',
    servicio: 'Examenes medicos',
    abril: 0,
    mayo: 75,
    junio: 975,
    julio: 1709,
    agosto: 1162,
    total: 3921,
    responsable: 'Servicio Médico Ocupacional',
    solicitante: 'Recursos Humanos / Salud Ocupacional',
    motivoTipico: 'Perfil médico de aptitud física para maniobras en altura y espacios confinados',
    descripcionTipica: 'Evaluaciones médicas periódicas y preempleo para personal técnico de cuadrilla',
    um: 'servicio'
  },
  {
    id: 'servicio-cristaleria',
    servicio: 'Servicio de cristaleria',
    abril: 0,
    mayo: 0,
    junio: 0,
    julio: 1755,
    agosto: 0,
    total: 1755,
    responsable: 'Servicios Generales',
    solicitante: 'Supervisión de Obra Civil',
    motivoTipico: 'Instalación de cristales y vidrios de seguridad en cabinas de mando y oficinas de campo',
    descripcionTipica: 'Servicio de cristalería y ventanería en cabina de control',
    um: 'servicio'
  },
  {
    id: 'inspecciones-tecnicas',
    servicio: 'Servicio de inspecciones tecnicas',
    abril: 0,
    mayo: 0,
    junio: 0,
    julio: 1500,
    agosto: 0,
    total: 1500,
    responsable: 'QA/QC Inspección Técnica',
    solicitante: 'Gerencia de Aseguramiento de Calidad',
    motivoTipico: 'Ensayos no destructivos y calibración metrológica de montaje',
    descripcionTipica: 'Servicio de inspecciones técnicas especializadas QA/QC en campo',
    um: 'informe'
  },
  {
    id: 'servicio-comida',
    servicio: 'Servicio de comida',
    abril: 48,
    mayo: 195,
    junio: 26,
    julio: 104,
    agosto: 825,
    total: 1198,
    responsable: 'Logística de Campamento',
    solicitante: 'Supervisión de Montaje Mecánico',
    motivoTipico: 'Refrigerios y alimentación de apoyo para jornadas continuas de izaje',
    descripcionTipica: 'Servicio de alimentación y refrigerios para cuadrillas en turnos extraordinarios',
    um: 'servicio'
  },
  {
    id: 'camion-cisterna',
    servicio: 'Servicio de camion cisterna',
    abril: 0,
    mayo: 0,
    junio: 100,
    julio: 400,
    agosto: 300,
    total: 800,
    responsable: 'Servicios Generales TIMACA',
    solicitante: 'Supervisión de Obra',
    motivoTipico: 'Abastecimiento de agua para hidrolavado y faenas de campo',
    descripcionTipica: 'Suministro de agua industrial en camión cisterna para limpieza y pruebas de equipos',
    um: 'servicio'
  },
  {
    id: 'servicio-fumigacion',
    servicio: 'Servicio de fumigacion',
    abril: 0,
    mayo: 0,
    junio: 0,
    julio: 600,
    agosto: 0,
    total: 600,
    responsable: 'SIAHO Seguridad Industrial',
    solicitante: 'Inspección Sanitaria SIAHO',
    motivoTipico: 'Fumigación integral y control sanitario de campamentos y frentes de trabajo',
    descripcionTipica: 'Servicio de fumigación y saneamiento ambiental de campamento',
    um: 'servicio'
  },
  {
    id: 'mantenimiento-extintor',
    servicio: 'Servicio mantenimiento de extintor',
    abril: 0,
    mayo: 0,
    junio: 0,
    julio: 0,
    agosto: 448,
    total: 448,
    responsable: 'SIAHO Seguridad Industrial',
    solicitante: 'Inspección de Seguridad SIAHO',
    motivoTipico: 'Certificación de extintores PQS y CO2 en áreas de oxicorte y soldadura',
    descripcionTipica: 'Recarga, mantenimiento y certificación de extintores contra incendio en frentes de obra',
    um: 'servicio'
  },
  {
    id: 'servicios-importacion',
    servicio: 'Servicios de importacion',
    abril: 0,
    mayo: 0,
    junio: 0,
    julio: 0,
    agosto: 439,
    total: 439,
    responsable: 'Procura & Importaciones',
    solicitante: 'Coordinación de Compras y Procura',
    motivoTipico: 'Nacionalización y fletes de importación de repuestos críticos de grúa',
    descripcionTipica: 'Trámites aduanales, agenciamiento y nacionalización de insumos y repuestos',
    um: 'servicio'
  },
  {
    id: 'fabricacion-calcomanias',
    servicio: 'Fabricacion de calcomanias',
    abril: 0,
    mayo: 0,
    junio: 0,
    julio: 229,
    agosto: 0,
    total: 229,
    responsable: 'Seguridad Industrial',
    solicitante: 'Coordinación SIAHO',
    motivoTipico: 'Rotulación y señalética de seguridad industrial en frentes de obra',
    descripcionTipica: 'Fabricación de calcomanías y señalética de seguridad',
    um: 'juego'
  },
  {
    id: 'gastos-viajes',
    servicio: 'Gastos viajes / viáticos nacionales',
    abril: 0,
    mayo: 0,
    junio: 0,
    julio: 127,
    agosto: 0,
    total: 127,
    responsable: 'Administración de Obra',
    solicitante: 'Gerencia de Proyecto Pellas',
    motivoTipico: 'Viáticos y traslados de especialistas técnicos foráneos',
    descripcionTipica: 'Gastos de viaje y viáticos técnicos nacionales para asistencia en campo',
    um: 'servicio'
  },
  {
    id: 'servicio-arborizacion',
    servicio: 'Servicio ambiental de arborizacion',
    abril: 0,
    mayo: 0,
    junio: 0,
    julio: 0,
    agosto: 120,
    total: 120,
    responsable: 'Gestión Ambiental TIMACA',
    solicitante: 'Coordinación de Gestión Ambiental',
    motivoTipico: 'Cumplimiento del plan de adecuación ambiental y reforestación de áreas de obra',
    descripcionTipica: 'Servicio ambiental de arborización y adecuación de áreas perimetrales en campamento',
    um: 'servicio'
  },
  {
    id: 'mantenimiento-equipos-externos',
    servicio: 'Mantenimiento de equipos externos',
    abril: 0,
    mayo: 0,
    junio: 0,
    julio: 0,
    agosto: 60,
    total: 60,
    responsable: 'Mantenimiento Mecánico TIMACA',
    solicitante: 'Taller de Mantenimiento',
    motivoTipico: 'Mantenimiento menor de herramientas calibradas externas',
    descripcionTipica: 'Mantenimiento preventivo de equipos menores y herramientas especiales externas',
    um: 'servicio'
  },
  {
    id: 'honorarios-profesionales',
    servicio: 'Honorarios profesionales',
    abril: 0,
    mayo: 0,
    junio: 50,
    julio: 0,
    agosto: 0,
    total: 50,
    responsable: 'Gerencia Técnica',
    solicitante: 'Ingeniería y Diseño',
    motivoTipico: 'Honorarios profesionales por consulta puntual de ingeniería',
    descripcionTipica: 'Honorarios profesionales especializados',
    um: 'servicio'
  },
  {
    id: 'evento-corporativo',
    servicio: 'Serv. asociados a evento corporativo',
    abril: 0,
    mayo: 35,
    junio: 0,
    julio: 0,
    agosto: 0,
    total: 35,
    responsable: 'Relaciones Institucionales',
    solicitante: 'Gerencia General TIMACA',
    motivoTipico: 'Logística asociada a inspección protocolar de cliente',
    descripcionTipica: 'Servicios asociados a evento corporativo e inducción de obra',
    um: 'servicio'
  },
  {
    id: 'servicio-taxi',
    servicio: 'Servicio de taxi',
    abril: 0,
    mayo: 0,
    junio: 0,
    julio: 34,
    agosto: 0,
    total: 34,
    responsable: 'Logística TIMACA',
    solicitante: 'Coordinación de Compras',
    motivoTipico: 'Traslado de emergencia de repuesto crítico a planta',
    descripcionTipica: 'Servicio de taxi urbano y despacho urgente de repuestos',
    um: 'carrera'
  }
];

export const TOTALES_SERVICIOS_DIRECTOS_PELLAS = {
  abril: 48,
  mayo: 41445,
  junio: 60101,
  julio: 61934,
  agosto: 63106,
  septiembre: 69056,
  total: 295690
};

export const ANALISIS_SERVICIOS_DIRECTOS_PELLAS = [
  {
    titulo: 'Traslado de Personal (Principal Impulsor)',
    descripcion: 'Representa el 68,0% del gasto total acumulado ($201.203 USD). Su nivel en septiembre ($45.878 USD) garantiza el despliegue ininterrumpido de la fuerza laboral activa en campo (254 trabajadores).'
  },
  {
    titulo: 'Vigilancia y Seguridad Patrimonial Externa',
    descripcion: 'Consolidado en $13.182 USD mensuales en septiembre, resguardando integralmente los campamentos, talleres y frentes de montaje de la Línea 1.'
  },
  {
    titulo: 'Alquiler de Módulos Sanitarios y Maquinaria',
    descripcion: 'El alquiler de facilidades de campamento y módulos sanitarios portátiles se complementó en septiembre con equipos menores de apoyo alcanzando $8.400 USD.'
  }
];
