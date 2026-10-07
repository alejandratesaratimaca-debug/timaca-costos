import {
  IndicadoresRRHH,
  UnidadOrganizativa,
  EmpleadoExpediente,
  ContratoRegistro,
  EgresoRegistro,
  RegistroAsistenciaDiaria,
  AsistenciaTransitorio,
  RequerimientoPersonal,
  CandidatoCV,
  EntrevistaRegistro,
  CandidatoEnProceso,
  PlanillaIngresoRegistro,
  CuadrillaProyecto,
  SolicitudPlazaRegistro
} from '../types/rrhh';

// ==========================================
// 1. INDICADORES (KPIs)
// ==========================================
export const MOCK_INDICADORES_RRHH: IndicadoresRRHH = {
  personalActivo: 174,
  enNominaDirecta: 148,
  antiguedadMediaAnios: 4.6,
  antiguedadMedianaAnios: 3.2,
  contratosVigentes: 142,
  contratosPorVencer: 21,
  contratosVencidos: 11,
  candidatosDisponibles: 84,
  candidatosYaTrabajaronAqui: 29,
  candidatosEntrevistados: 38,
  requerimientosEnGestion: 9,
  diasPromedioContratar: 14,
  asistenciaHoyPorcentaje: 93.6,
  ingresosEsperandoEquipo: 4,
  fichasDatosIncompletos: 12,
  contratosSinDecision: 7
};

// ==========================================
// 2. ORGANIGRAMA Y ESTRUCTURA ORGANIZATIVA
// ==========================================
export const MOCK_UNIDADES_ORGANIGRAMA: UnidadOrganizativa[] = [
  {
    id: 'u-presidencia',
    padreId: null,
    nombre: 'Presidencia & Junta Directiva',
    codigo: 'PRE-01',
    nivel: 'direccion',
    jefeNombre: 'Ing. Antonio Galavis',
    jefeCedula: 'V-4.852.119',
    jefeCargo: 'Presidente Ejecutivo',
    tipoJefatura: 'titular',
    plazasAprobadas: 4,
    plazasOcupadas: 4,
    genteTotal: 174,
    oficiosPrincipales: ['Dirección General', 'Planificación Estratégica']
  },
  {
    id: 'u-operaciones',
    padreId: 'u-presidencia',
    nombre: 'Gerencia General de Operaciones & Obras',
    codigo: 'GOP-01',
    nivel: 'gerencia',
    jefeNombre: 'Ing. Carlos Mendoza',
    jefeCedula: 'V-12.441.980',
    jefeCargo: 'Gerente General de Operaciones',
    tipoJefatura: 'titular',
    plazasAprobadas: 110,
    plazasOcupadas: 104,
    genteTotal: 104,
    oficiosPrincipales: ['Montaje Industrial', 'Soldadura 6G', 'Izaje de Cargas', 'Supervisión']
  },
  {
    id: 'u-frente-palua',
    padreId: 'u-operaciones',
    nombre: 'Frente de Obra Palúa (Muelle PMH)',
    codigo: 'OBR-PALUA',
    nivel: 'frente',
    jefeNombre: 'Ing. Pedro Rivas',
    jefeCedula: 'V-14.890.312',
    jefeCargo: 'Coordinador General de Frente',
    tipoJefatura: 'titular',
    plazasAprobadas: 45,
    plazasOcupadas: 42,
    genteTotal: 42,
    oficiosPrincipales: ['Mecánico Montador', 'Soldador Calificado', 'Rigger', 'Capataz']
  },
  {
    id: 'u-frente-pellas',
    padreId: 'u-operaciones',
    nombre: 'Frente de Obra Planta de Pellas',
    codigo: 'OBR-PELLAS',
    nivel: 'frente',
    jefeNombre: 'Ing. Roberto Silva',
    jefeCedula: 'V-15.118.420',
    jefeCargo: 'Coordinador de Frente',
    tipoJefatura: 'encargo',
    tipoJefatura: 'encargo',
    plazasAprobadas: 35,
    plazasOcupadas: 33,
    genteTotal: 33,
    oficiosPrincipales: ['Mantenimiento Mecánico', 'Alineación de Tolvas', 'Electricista']
  },
  {
    id: 'u-taller',
    padreId: 'u-presidencia',
    nombre: 'Gerencia de Taller & Fabricación Metalmecánica',
    codigo: 'GTAL-01',
    nivel: 'gerencia',
    jefeNombre: 'Ing. Luis Hernández',
    jefeCedula: 'V-11.230.904',
    jefeCargo: 'Gerente de Taller Central',
    tipoJefatura: 'titular',
    plazasAprobadas: 40,
    plazasOcupadas: 38,
    genteTotal: 38,
    oficiosPrincipales: ['Pailería Pesada', 'Tornería & Mecanizado', 'Corte CNC', 'Pintura Industrial']
  },
  {
    id: 'u-flota-mantenimiento',
    padreId: 'u-taller',
    nombre: 'Departamento de Mantenimiento de Flota & Equipos',
    codigo: 'DFLT-01',
    nivel: 'departamento',
    jefeNombre: 'Ing. Marcos Gómez',
    jefeCedula: 'V-13.782.551',
    jefeCargo: 'Jefe de Mantenimiento de Flota',
    tipoJefatura: 'titular',
    plazasAprobadas: 18,
    plazasOcupadas: 17,
    genteTotal: 17,
    oficiosPrincipales: ['Mecánico Diesel', 'Operador de Grúa 160T', 'Electromecánico']
  },
  {
    id: 'u-rrhh',
    padreId: 'u-presidencia',
    nombre: 'Gerencia de Talento Humano & Personal',
    codigo: 'GRRH-01',
    nivel: 'gerencia',
    jefeNombre: 'Lic. Mariana Chacón',
    jefeCedula: 'V-16.780.450',
    jefeCargo: 'Gerente de Talento Humano',
    tipoJefatura: 'titular',
    plazasAprobadas: 8,
    plazasOcupadas: 7,
    genteTotal: 7,
    oficiosPrincipales: ['Administración de Personal', 'Reclutamiento & Selección', 'Nómina & Bienestar']
  },
  {
    id: 'u-hse',
    padreId: 'u-presidencia',
    nombre: 'Gerencia de Seguridad Industrial & HSE',
    codigo: 'GHSE-01',
    nivel: 'gerencia',
    jefeNombre: 'Ing. Elena Vásquez',
    jefeCedula: 'V-17.203.991',
    jefeCargo: 'Gerente de Seguridad Industrial (HSE)',
    tipoJefatura: 'titular',
    plazasAprobadas: 10,
    plazasOcupadas: 9,
    genteTotal: 9,
    oficiosPrincipales: ['Inspector HSE', 'Facilitador LOPCYMAT', 'Auditor de Campo']
  },
  {
    id: 'u-costos',
    padreId: 'u-presidencia',
    nombre: 'Departamento de Costos & Planificación Financiera',
    codigo: 'DCST-01',
    nivel: 'departamento',
    jefeNombre: 'Alejandra Tesara',
    jefeCedula: 'V-18.440.120',
    jefeCargo: 'Analista Principal de Costos / Administradora',
    tipoJefatura: 'titular',
    plazasAprobadas: 5,
    plazasOcupadas: 5,
    genteTotal: 5,
    oficiosPrincipales: ['Auditoría de Costos', 'Control Presupuestario', 'Gestión CAPEX/OPEX']
  }
];

// ==========================================
// 3. EXPEDIENTES / EMPLEADOS
// ==========================================
export const MOCK_EMPLEADOS_EXPEDIENTES: EmpleadoExpediente[] = [
  {
    id: 'emp-001',
    codigoEmpleado: 'TIM-1042',
    nombreCompleto: 'José Rafael Castillo Morales',
    cedula: '14.892.301',
    nacionalidad: 'venezolano',
    fechaNacimiento: '1984-05-14',
    edad: 42,
    estadoCivil: 'Casado',
    telefono: '+58 414-882-9011',
    correo: 'jcastillo@timaca.com',
    direccion: 'San Félix, Urb. Manuel Piar, Manzana 14, Casa 08, Ciudad Guayana',
    tallas: { camisa: 'L', pantalon: '34', zapato: '42', braga: 'L' },
    puestoCargo: 'Soldador Especialista 6G / TIG-SMAW',
    nivelJerarquico: 'Operativo Especializado',
    gerencia: 'Gerencia General de Operaciones & Obras',
    departamento: 'Frente Palúa (Muelle PMH)',
    sector: 'Muelle Fluvial',
    sede: 'Palúa',
    frente: 'Palúa PMH',
    proyectoCodigo: 'TTE-C-0706',
    jefeDirecto: 'Ing. Pedro Rivas',
    perteneceSindicato: true,
    tipoNomina: 'nomina_timaca',
    modalidad: 'indefinido',
    fechaIngreso: '2021-02-15',
    antiguedadTexto: '5 años 7 meses',
    estadoLaboral: 'activo',
    cargasFamiliares: [
      { id: 'cfg-1', parentesco: 'Cónyuge', nombreCompleto: 'María Elena Salazar', fechaNacimiento: '1986-09-12', edad: 40 },
      { id: 'cfg-2', parentesco: 'Hijo/a', nombreCompleto: 'José Manuel Castillo Salazar', fechaNacimiento: '2012-04-18', edad: 14 },
      { id: 'cfg-3', parentesco: 'Hijo/a', nombreCompleto: 'Camila Victoria Castillo', fechaNacimiento: '2017-11-03', edad: 8 }
    ],
    sinCargasFamiliaresRegistradas: false,
    documentos: [
      { id: 'doc-1', tipo: 'Cedula', nombreArchivo: 'Cedula_Castillo_Jose_V14892301.pdf', fechaSubida: '2021-02-15', tamanioKb: 245 },
      { id: 'doc-2', tipo: 'RIF', nombreArchivo: 'RIF_Castillo_Jose_Actualizado.pdf', fechaSubida: '2025-01-10', tamanioKb: 180 },
      { id: 'doc-3', tipo: 'Certificado', nombreArchivo: 'Calificacion_Soldadura_6G_ASME_IX.pdf', fechaSubida: '2026-03-12', tamanioKb: 512 },
      { id: 'doc-4', tipo: 'Contrato', nombreArchivo: 'Contrato_Indefinido_TIM1042.pdf', fechaSubida: '2021-02-15', tamanioKb: 720 },
      { id: 'doc-5', tipo: 'Examen Medico', nombreArchivo: 'Aptitud_Medica_Ocupacional_2026.pdf', fechaSubida: '2026-02-10', tamanioKb: 390 }
    ],
    cursosCharlas: [
      { id: 'cur-1', tipo: 'charla_hse', nombre: 'LOTOTO y Aislamiento Seguro de Energía Eléctrica', fecha: '2026-09-18', duracionHoras: 1, facilitador: 'Ing. Elena Vásquez' },
      { id: 'cur-2', tipo: 'curso_tecnico', nombre: 'Procedimiento de Soldadura de Tuberías bajo ASME B31.3', fecha: '2026-05-14', duracionHoras: 8, facilitador: 'Bureau Veritas' },
      { id: 'cur-3', tipo: 'charla_hse', nombre: 'Prevención de Caídas en Trabajos sobre Muelle y Barcaza', fecha: '2026-08-22', duracionHoras: 1, facilitador: 'HSE Campo' }
    ],
    historialEventos: [
      { id: 'ev-1', fecha: '2021-02-15', tipo: 'ingreso', descripcion: 'Ingreso como Soldador 3G en Taller Central', registradoPor: 'Lic. Mariana Chacón' },
      { id: 'ev-2', fecha: '2022-06-01', tipo: 'cambio_puesto', descripcion: 'Promoción a Soldador 6G tras calificación técnica ASME IX', registradoPor: 'Ing. Carlos Mendoza' },
      { id: 'ev-3', fecha: '2024-03-10', tipo: 'traslado', descripcion: 'Traslado al Frente Palúa para Obras de Modernización PMH', registradoPor: 'Ing. Pedro Rivas' }
    ],
    faltanDatos: []
  },
  {
    id: 'emp-002',
    codigoEmpleado: 'TIM-1188',
    nombreCompleto: 'Carlos Eduardo Benítez Rivas',
    cedula: '17.330.841',
    nacionalidad: 'venezolano',
    fechaNacimiento: '1989-11-20',
    edad: 36,
    estadoCivil: 'Soltero',
    telefono: '+58 412-190-4422',
    correo: 'cbenitez@timaca.com',
    direccion: 'Puerto Ordaz, Sector Unare II, Bloque 12, Apto 2-B',
    tallas: { camisa: 'M', pantalon: '32', zapato: '41', braga: 'M' },
    puestoCargo: 'Mecánico Montador / Alineador Láser',
    nivelJerarquico: 'Operativo Técnico',
    gerencia: 'Gerencia General de Operaciones & Obras',
    departamento: 'Frente Palúa (Muelle PMH)',
    sector: 'Tolvas y Galerías',
    sede: 'Palúa',
    frente: 'Palúa PMH',
    proyectoCodigo: 'TTE-C-0706',
    jefeDirecto: 'Ing. Pedro Rivas',
    perteneceSindicato: true,
    tipoNomina: 'nomina_timaca',
    modalidad: 'determinado',
    fechaIngreso: '2024-04-01',
    antiguedadTexto: '2 años 6 meses',
    estadoLaboral: 'activo',
    cargasFamiliares: [],
    sinCargasFamiliaresRegistradas: true,
    documentos: [
      { id: 'doc-6', tipo: 'Cedula', nombreArchivo: 'Cedula_Benitez_Carlos.pdf', fechaSubida: '2024-04-01', tamanioKb: 210 },
      { id: 'doc-7', tipo: 'Contrato', nombreArchivo: 'Contrato_Determinado_Palua.pdf', fechaSubida: '2024-04-01', tamanioKb: 450 }
    ],
    cursosCharlas: [
      { id: 'cur-4', tipo: 'charla_hse', nombre: 'Inspección Pre-uso de Herramientas Eléctricas y Neumáticas', fecha: '2026-09-25', duracionHoras: 1, facilitador: 'HSE Palúa' }
    ],
    historialEventos: [
      { id: 'ev-4', fecha: '2024-04-01', tipo: 'ingreso', descripcion: 'Ingreso temporal para montaje mecánico en Palúa', registradoPor: 'Lic. Mariana Chacón' }
    ],
    faltanDatos: ['Examen Médico Ocupacional Anual']
  },
  {
    id: 'emp-003',
    codigoEmpleado: 'TIM-0914',
    nombreCompleto: 'Miguel Antonio Rondón Flores',
    cedula: '11.890.123',
    nacionalidad: 'venezolano',
    fechaNacimiento: '1976-08-04',
    edad: 50,
    estadoCivil: 'Casado',
    telefono: '+58 416-582-7719',
    correo: 'mrondon@timaca.com',
    direccion: 'Alta Vista Sur, Edif. Roraima, Piso 4, Puerto Ordaz',
    tallas: { camisa: 'XL', pantalon: '38', zapato: '43', braga: 'XL' },
    puestoCargo: 'Operador Certificado de Grúa Móvil Liebherr 160T',
    nivelJerarquico: 'Especialista de Equipos Pesados',
    gerencia: 'Gerencia de Taller & Fabricación Metalmecánica',
    departamento: 'Departamento de Mantenimiento de Flota & Equipos',
    sector: 'Patio de Maniobras',
    sede: 'Taller Central',
    frente: 'Flota Grúas',
    proyectoCodigo: 'TT-A-C-207',
    jefeDirecto: 'Ing. Marcos Gómez',
    perteneceSindicato: false,
    tipoNomina: 'nomina_timaca',
    modalidad: 'indefinido',
    fechaIngreso: '2018-09-01',
    antiguedadTexto: '8 años 1 mes',
    estadoLaboral: 'activo',
    cargasFamiliares: [
      { id: 'cfg-4', parentesco: 'Cónyuge', nombreCompleto: 'Ana Rosa Vielma', fechaNacimiento: '1978-01-20', edad: 48 },
      { id: 'cfg-5', parentesco: 'Hijo/a', nombreCompleto: 'Miguel Andrés Rondón', fechaNacimiento: '2004-07-15', edad: 22 }
    ],
    sinCargasFamiliaresRegistradas: false,
    documentos: [
      { id: 'doc-8', tipo: 'Certificado', nombreArchivo: 'Certificacion_Operador_Grua_ASME_B30_5.pdf', fechaSubida: '2025-08-10', tamanioKb: 890 },
      { id: 'doc-9', tipo: 'Licencia Conducir', nombreArchivo: 'Licencia_5ta_Grado_Vigente.pdf', fechaSubida: '2024-03-15', tamanioKb: 340 }
    ],
    cursosCharlas: [
      { id: 'cur-5', tipo: 'curso_tecnico', nombre: 'Seguridad en Maniobras de Izaje Tándem y Tablas de Carga', fecha: '2026-06-20', duracionHoras: 16, facilitador: 'Certificadora Industrial' }
    ],
    historialEventos: [
      { id: 'ev-5', fecha: '2018-09-01', tipo: 'ingreso', descripcion: 'Ingreso como Operador de Grúa 70T', registradoPor: 'RRHH' },
      { id: 'ev-6', fecha: '2022-01-15', tipo: 'cambio_puesto', descripcion: 'Asignación titular a Grúa GR17 Liebherr 160T', registradoPor: 'Ing. Marcos Gómez' }
    ],
    faltanDatos: []
  },
  {
    id: 'emp-004',
    codigoEmpleado: 'TIM-1304',
    nombreCompleto: 'Daniela Sofía Riveros Maza',
    cedula: '24.119.502',
    nacionalidad: 'venezolano',
    fechaNacimiento: '1997-03-29',
    edad: 29,
    estadoCivil: 'Soltera',
    telefono: '+58 424-912-3004',
    correo: 'drivero@timaca.com',
    direccion: 'Villa Asia, Calle Pekín, Manzana 3, Puerto Ordaz',
    tallas: { camisa: 'S', pantalon: '28', zapato: '37' },
    puestoCargo: 'Analista de Costos Internos (CAPEX & OPEX)',
    nivelJerarquico: 'Profesional Administrativo',
    gerencia: 'Presidencia & Junta Directiva',
    departamento: 'Departamento de Costos & Planificación Financiera',
    sector: 'Administración',
    sede: 'Oficinas Centrales',
    frente: 'Planta & Flota',
    proyectoCodigo: 'TODOS-INTERNOS',
    jefeDirecto: 'Alejandra Tesara',
    perteneceSindicato: false,
    tipoNomina: 'nomina_timaca',
    modalidad: 'indefinido',
    fechaIngreso: '2023-08-01',
    antiguedadTexto: '3 años 2 meses',
    estadoLaboral: 'activo',
    cargasFamiliares: [],
    sinCargasFamiliaresRegistradas: true,
    documentos: [
      { id: 'doc-10', tipo: 'Titulo', nombreArchivo: 'Titulo_Licenciatura_Contaduria.pdf', fechaSubida: '2023-08-01', tamanioKb: 610 }
    ],
    cursosCharlas: [
      { id: 'cur-6', tipo: 'charla_hse', nombre: 'Seguridad en Oficinas y Ergonomía Visual', fecha: '2026-07-11', duracionHoras: 1, facilitador: 'HSE Central' }
    ],
    historialEventos: [
      { id: 'ev-7', fecha: '2023-08-01', tipo: 'ingreso', descripcion: 'Ingreso al equipo de Costos TIMACA', registradoPor: 'Alejandra Tesara' }
    ],
    faltanDatos: []
  }
];

// ==========================================
// 4. CONTRATOS
// ==========================================
export const MOCK_CONTRATOS: ContratoRegistro[] = [
  {
    id: 'cnt-001',
    empleadoId: 'emp-001',
    empleadoNombre: 'José Rafael Castillo Morales',
    cedula: '14.892.301',
    codigoEmpleado: 'TIM-1042',
    cargo: 'Soldador Especialista 6G',
    gerencia: 'Operaciones & Obras',
    jefeDirecto: 'Ing. Pedro Rivas',
    numeroContrato: 'CNT-2021-0089',
    modalidad: 'nomina_timaca',
    tipoDuracion: 'indefinido',
    periodicidad: 'semanal',
    fechaInicio: '2021-02-15',
    fechaFin: null,
    diasParaVencer: null,
    semaforo: 'vigente',
    estado: 'vigente',
    requiereRespuestaJefe: false,
    tieneAddendum: false
  },
  {
    id: 'cnt-002',
    empleadoId: 'emp-002',
    empleadoNombre: 'Carlos Eduardo Benítez Rivas',
    cedula: '17.330.841',
    codigoEmpleado: 'TIM-1188',
    cargo: 'Mecánico Montador / Alineador',
    gerencia: 'Operaciones & Obras',
    jefeDirecto: 'Ing. Pedro Rivas',
    numeroContrato: 'CNT-2024-0341',
    modalidad: 'nomina_timaca',
    tipoDuracion: 'determinado',
    periodicidad: 'semanal',
    fechaInicio: '2024-04-01',
    fechaFin: '2026-10-25',
    diasParaVencer: 18,
    semaforo: 'por_vencer',
    estado: 'vigente',
    requiereRespuestaJefe: true,
    decisionJefe: 'renovar',
    decisionNota: 'Desempeño sobresaliente en montaje de tolvas. Se recomienda extender 6 meses.',
    tieneAddendum: true
  },
  {
    id: 'cnt-003',
    empleadoId: 'emp-003',
    empleadoNombre: 'Miguel Antonio Rondón Flores',
    cedula: '11.890.123',
    codigoEmpleado: 'TIM-0914',
    cargo: 'Operador de Grúa 160T',
    gerencia: 'Taller & Fabricación',
    jefeDirecto: 'Ing. Marcos Gómez',
    numeroContrato: 'CNT-2018-0014',
    modalidad: 'nomina_timaca',
    tipoDuracion: 'indefinido',
    periodicidad: 'semanal',
    fechaInicio: '2018-09-01',
    fechaFin: null,
    diasParaVencer: null,
    semaforo: 'vigente',
    estado: 'vigente',
    requiereRespuestaJefe: false,
    tieneAddendum: false
  },
  {
    id: 'cnt-004',
    empleadoId: 'emp-ext-01',
    empleadoNombre: 'Ramón Alexis Guilarte Peña',
    cedula: '15.602.119',
    codigoEmpleado: 'TIM-1240',
    cargo: 'Inspector de Ensayos No Destructivos (END Nivel II)',
    gerencia: 'Control de Calidad (QA/QC)',
    jefeDirecto: 'Ing. Carlos Mendoza',
    numeroContrato: 'HON-2026-0044',
    modalidad: 'honorarios',
    tipoDuracion: 'determinado',
    periodicidad: 'mensual',
    fechaInicio: '2026-03-01',
    fechaFin: '2026-09-30',
    diasParaVencer: -7,
    semaforo: 'vencido',
    estado: 'vencido',
    requiereRespuestaJefe: true,
    tieneAddendum: false
  }
];

// ==========================================
// 5. HISTORIAL DE EGRESOS
// ==========================================
export const MOCK_EGRESOS: EgresoRegistro[] = [
  {
    id: 'egr-001',
    empleadoId: 'emp-old-01',
    nombreCompleto: 'Gabriel Jesús Marcano',
    cedula: '19.450.811',
    cargoAlSalir: 'Ayudante de Pailería',
    gerenciaAlSalir: 'Taller & Fabricación',
    jefeAlSalir: 'Ing. Luis Hernández',
    fechaEgreso: '2026-07-30',
    tiempoDuracionTexto: '1 año 2 meses',
    motivoEgreso: 'renuncia',
    motivoDetalle: 'Oportunidad de trabajo fuera del estado Bolívar.',
    puedeVolver: true,
    observacionRecontratabilidad: 'Buen desenvolvimiento, puntual y sin sanciones disciplinarias.',
    volvioDespues: false,
    etapaNumero: 1
  },
  {
    id: 'egr-002',
    empleadoId: 'emp-old-02',
    nombreCompleto: 'Franklin José Quijada',
    cedula: '16.120.908',
    cargoAlSalir: 'Mecánico de Mantenimiento',
    gerenciaAlSalir: 'Operaciones & Obras',
    jefeAlSalir: 'Ing. Roberto Silva',
    fechaEgreso: '2025-11-15',
    tiempoDuracionTexto: '8 meses',
    motivoEgreso: 'despido',
    motivoDetalle: 'Incumplimiento reiterado de normas de seguridad HSE y falta injustificada en parada.',
    puedeVolver: false,
    observacionRecontratabilidad: 'VETADO: Negligencia en bloqueo de energía LOTOTO.',
    volvioDespues: false,
    etapaNumero: 1
  },
  {
    id: 'egr-003',
    empleadoId: 'emp-old-03',
    nombreCompleto: 'Andrés Eloy Velásquez',
    cedula: '13.991.024',
    cargoAlSalir: 'Tubero Especialista',
    gerenciaAlSalir: 'Operaciones & Obras',
    jefeAlSalir: 'Ing. Pedro Rivas',
    fechaEgreso: '2024-12-20',
    tiempoDuracionTexto: '2 años',
    motivoEgreso: 'fin_contrato',
    motivoDetalle: 'Culminación de obra de reparación de chimeneas en Sidor.',
    puedeVolver: true,
    observacionRecontratabilidad: 'Excelente oficial tubero. Reingresó luego para la parada de Briquetera.',
    volvioDespues: true,
    etapaNumero: 2
  }
];

// ==========================================
// 6. CONTROL DE ASISTENCIA Y TRANSITORIOS
// ==========================================
export const MOCK_ASISTENCIA_HOY: RegistroAsistenciaDiaria[] = [
  {
    id: 'as-001',
    empleadoId: 'emp-001',
    nombreCompleto: 'José Rafael Castillo Morales',
    cedula: '14.892.301',
    cargo: 'Soldador 6G',
    cuadrillaNombre: 'Cuadrilla Palúa Montaje A',
    frente: 'Palúa PMH',
    obraProyecto: 'TTE-C-0706',
    fecha: '2026-10-07',
    turno: 'diurno',
    marca: 'P',
    horaEntrada: '06:52'
  },
  {
    id: 'as-002',
    empleadoId: 'emp-002',
    nombreCompleto: 'Carlos Eduardo Benítez Rivas',
    cedula: '17.330.841',
    cargo: 'Mecánico Montador',
    cuadrillaNombre: 'Cuadrilla Palúa Montaje A',
    frente: 'Palúa PMH',
    obraProyecto: 'TTE-C-0706',
    fecha: '2026-10-07',
    turno: 'diurno',
    marca: 'T',
    horaEntrada: '07:38',
    motivoTardanza: 'Falla en transporte colectivo en el cruce de San Félix.'
  },
  {
    id: 'as-003',
    empleadoId: 'emp-003',
    nombreCompleto: 'Miguel Antonio Rondón Flores',
    cedula: '11.890.123',
    cargo: 'Operador Grúa 160T',
    cuadrillaNombre: 'Cuadrilla Flota Grúas',
    frente: 'Flota Grúas',
    obraProyecto: 'TT-A-C-207',
    fecha: '2026-10-07',
    turno: 'diurno',
    marca: 'P',
    horaEntrada: '06:48'
  },
  {
    id: 'as-004',
    empleadoId: 'emp-005',
    nombreCompleto: 'Héctor Manuel Subero',
    cedula: '18.904.221',
    cargo: 'Ayudante de Mecánica',
    cuadrillaNombre: 'Cuadrilla Pellas Alineación',
    frente: 'Planta Pellas',
    obraProyecto: 'TT-A-C-207',
    fecha: '2026-10-07',
    turno: 'diurno',
    marca: 'A',
    tipoAusencia: 'pendiente_justificativo'
  }
];

export const MOCK_TRANSITORIOS_ASISTENCIA: AsistenciaTransitorio[] = [
  {
    id: 'trs-001',
    asistenciaId: 'as-004',
    empleadoId: 'emp-005',
    nombreCompleto: 'Héctor Manuel Subero',
    cedula: '18.904.221',
    proyecto: 'Frente Pellas (TT-A-C-207)',
    fechaFalta: '2026-10-07',
    horasParaVencer: 18,
    semaforo: 'amarillo',
    motivoPreliminar: 'Aviso telefónico al capataz por malestar gripal febril.',
    estado: 'en_plazo'
  },
  {
    id: 'trs-002',
    asistenciaId: 'as-old-08',
    empleadoId: 'emp-009',
    nombreCompleto: 'Wilmer José Cardozo',
    cedula: '15.440.119',
    proyecto: 'Taller Central',
    fechaFalta: '2026-10-05',
    horasParaVencer: 0,
    semaforo: 'rojo',
    motivoPreliminar: 'Sin reporte al supervisor ni justificación médica recibida.',
    estado: 'vencido'
  }
];

// ==========================================
// 7. SOLICITUD DE REQUERIMIENTOS
// ==========================================
export const MOCK_REQUERIMIENTOS: RequerimientoPersonal[] = [
  {
    id: 'req-001',
    codigo: 'REQ-2026-051',
    cargo: 'Soldador 6G Especialista TIG / Arco Sumergido',
    cantidad: 4,
    contratados: 2,
    gerencia: 'Operaciones & Obras',
    departamento: 'Frente Palúa (Muelle PMH)',
    frenteObra: 'Muelle Palúa',
    motivo: 'crecimiento',
    solicitanteNombre: 'Ing. Pedro Rivas',
    creadoPorId: 'usr-privas',
    fechaSolicitud: '2026-09-20',
    estado: 'en_proceso',
    aprobadoPor: 'Ing. Carlos Mendoza',
    decidePresidencia: false,
    tomadoPorNombre: 'Lic. Mariana Chacón',
    priorizado: true,
    observaciones: 'Se requiere para reforzar el turno nocturno de soldadura en vigas cajón.'
  },
  {
    id: 'req-002',
    codigo: 'REQ-2026-052',
    cargo: 'Mecánico Montador / Alineador de Equipos Rotativos',
    cantidad: 2,
    contratados: 0,
    gerencia: 'Operaciones & Obras',
    departamento: 'Frente Planta Pellas',
    frenteObra: 'Línea 1 Pellas',
    motivo: 'sustitucion',
    sustituyeA: 'Carlos Benítez (traslado a Palúa)',
    solicitanteNombre: 'Ing. Roberto Silva',
    creadoPorId: 'usr-rsilva',
    fechaSolicitud: '2026-09-28',
    estado: 'pendiente_aprobacion',
    decidePresidencia: false,
    priorizado: false
  },
  {
    id: 'req-003',
    codigo: 'REQ-2026-049',
    cargo: 'Rigger / Maniobrista Certificado de Cargas Críticas',
    cantidad: 2,
    contratados: 2,
    gerencia: 'Taller & Fabricación',
    departamento: 'Flota & Equipos',
    frenteObra: 'Patio de Maniobras',
    motivo: 'nueva_obra',
    solicitanteNombre: 'Ing. Marcos Gómez',
    creadoPorId: 'usr-mgomez',
    fechaSolicitud: '2026-08-15',
    estado: 'cerrada',
    aprobadoPor: 'Ing. Antonio Galavis (Presidencia)',
    decidePresidencia: true,
    tomadoPorNombre: 'Lic. Mariana Chacón',
    priorizado: false
  }
];

// ==========================================
// 8. CARTERA DE CV'S
// ==========================================
export const MOCK_CARTERA_CV: CandidatoCV[] = [
  {
    id: 'cv-001',
    nombreCompleto: 'Alexander Jesús Coronado',
    cedula: '16.892.401',
    telefono: '+58 414-890-1288',
    correo: 'acoronado.soldador@gmail.com',
    profesionOficio: 'Soldador Estructural & Tuberías 6G',
    puestoSugerido: 'Soldador 6G Especialista',
    situacion: 'en_proceso',
    yaTrabajoAqui: true,
    requerimientoAsignadoCodigo: 'REQ-2026-051',
    fechaCarga: '2026-09-22',
    habilidadesDuras: ['SMAW 7018', 'GTAW Argón', 'Corte por Plasma', 'Lectura de Planos Isométricos'],
    habilidadesBlandas: ['Trabajo bajo presión', 'Compromiso con la seguridad', 'Puntualidad'],
    cvNombreArchivo: 'CV_Alexander_Coronado_Soldador6G.pdf',
    observaciones: 'Trabajó en TIMACA en 2023 durante la parada de Ferrominera. Excelente récord.'
  },
  {
    id: 'cv-002',
    nombreCompleto: 'Luis Bernardo Farfán Mata',
    cedula: '18.102.390',
    telefono: '+58 424-904-7711',
    correo: 'lfarfan.mecanico@hotmail.com',
    profesionOficio: 'Técnico Mecánico de Mantenimiento Industrial',
    puestoSugerido: 'Mecánico Montador / Alineador',
    situacion: 'en_cartera',
    yaTrabajoAqui: false,
    fechaCarga: '2026-09-25',
    habilidadesDuras: ['Alineación Láser Easy-Laser', 'Mantenimiento de Reductores', 'Rodamientos SKF', 'Torquímetros'],
    habilidadesBlandas: ['Proactividad', 'Atención al detalle', 'Trabajo en equipo'],
    cvNombreArchivo: 'CV_Luis_Farfan_Mecanico.pdf'
  },
  {
    id: 'cv-003',
    nombreCompleto: 'José Vicente Rivas Calzadilla',
    cedula: '15.340.912',
    telefono: '+58 412-881-3044',
    correo: 'jrivas.rigger@gmail.com',
    profesionOficio: 'Rigger / Señalero de Grúas',
    puestoSugerido: 'Rigger Maniobrista',
    situacion: 'en_cartera',
    yaTrabajoAqui: true,
    fechaCarga: '2026-08-30',
    habilidadesDuras: ['Cálculo de Estrobos y Grilletes', 'Código de Señales ASME B30.5', 'Eslingas Sintéticas'],
    habilidadesBlandas: ['Liderazgo en campo', 'Comunicación asertiva'],
    cvNombreArchivo: 'CV_Jose_Rivas_Rigger.pdf',
    observaciones: 'Certificación vigente Bureau Veritas hasta Noviembre 2026.'
  }
];

// ==========================================
// 9. ENTREVISTAS
// ==========================================
export const MOCK_ENTREVISTAS: EntrevistaRegistro[] = [
  {
    id: 'ent-001',
    candidatoId: 'cv-001',
    candidatoNombre: 'Alexander Jesús Coronado',
    cedula: '16.892.401',
    requerimientoCodigo: 'REQ-2026-051',
    gerencia: 'Operaciones & Obras',
    tipoEntrevista: 'tecnica',
    fechaHora: '2026-09-26 09:30',
    entrevistadorNombre: 'Ing. Pedro Rivas / Mst. Soldadura Taller',
    resultado: 'aprobado',
    habilidadesBlandas: ['Disposición a turnos nocturnos', 'Actitud colaborativa'],
    habilidadesDuras: ['Prueba de probeta 6G aprobada con radiografía 100% limpia'],
    observacionConfidencialRRHH: 'Candidato apto. Conoce los estándares TIMACA y las exigencias del cliente.'
  },
  {
    id: 'ent-002',
    candidatoId: 'cv-002',
    candidatoNombre: 'Luis Bernardo Farfán Mata',
    cedula: '18.102.390',
    requerimientoCodigo: 'REQ-2026-052',
    gerencia: 'Operaciones & Obras',
    tipoEntrevista: 'preseleccion',
    fechaHora: '2026-10-02 14:00',
    entrevistadorNombre: 'Lic. Mariana Chacón',
    resultado: 'aprobado',
    habilidadesBlandas: ['Excelente dicción', 'Ganas de aprender'],
    habilidadesDuras: ['Conocimientos teóricos sólidos de alineación y montaje'],
    observacionConfidencialRRHH: 'Pasa a entrevista técnica con el Coordinador de Pellas.'
  }
];

// ==========================================
// 10. PROCESO DE INGRESO (PIPELINE)
// ==========================================
export const MOCK_CANDIDATOS_PROCESO: CandidatoEnProceso[] = [
  {
    id: 'pip-001',
    postulacionId: 'pst-01',
    candidatoId: 'cv-001',
    nombreCompleto: 'Alexander Jesús Coronado',
    cedula: '16.892.401',
    telefono: '+58 414-890-1288',
    cargoOpta: 'Soldador 6G Especialista',
    requerimientoCodigo: 'REQ-2026-051',
    gerencia: 'Operaciones & Obras',
    departamento: 'Frente Palúa',
    etapaActual: 'por_ingresar',
    fechaInicioProceso: '2026-09-22',
    fechaIngresoPautada: '2026-10-13',
    tienePaseAcceso: true,
    equipoAsignado: true,
    tomadoPorNombre: 'Lic. Mariana Chacón'
  },
  {
    id: 'pip-002',
    postulacionId: 'pst-02',
    candidatoId: 'cv-002',
    nombreCompleto: 'Luis Bernardo Farfán Mata',
    cedula: '18.102.390',
    telefono: '+58 424-904-7711',
    cargoOpta: 'Mecánico Montador',
    requerimientoCodigo: 'REQ-2026-052',
    gerencia: 'Operaciones & Obras',
    departamento: 'Frente Pellas',
    etapaActual: 'en_entrevista',
    fechaInicioProceso: '2026-09-25',
    tienePaseAcceso: false,
    equipoAsignado: false,
    tomadoPorNombre: 'Lic. Mariana Chacón'
  },
  {
    id: 'pip-003',
    postulacionId: 'pst-03',
    candidatoId: 'cv-004',
    nombreCompleto: 'Darwin José Maita Lezama',
    cedula: '20.198.330',
    telefono: '+58 416-782-9011',
    cargoOpta: 'Soldador 6G Especialista',
    requerimientoCodigo: 'REQ-2026-051',
    gerencia: 'Operaciones & Obras',
    departamento: 'Frente Palúa',
    etapaActual: 'en_examen',
    fechaInicioProceso: '2026-09-24',
    tienePaseAcceso: false,
    equipoAsignado: false,
    tomadoPorNombre: 'Lic. Mariana Chacón'
  }
];

// ==========================================
// 11. PLANILLAS DE INGRESO
// ==========================================
export const MOCK_PLANILLAS_INGRESO: PlanillaIngresoRegistro[] = [
  {
    id: 'pln-001',
    candidatoId: 'cv-001',
    nombreCompleto: 'Alexander Jesús Coronado',
    nombreDeclarado: 'Alexander Jesús Coronado',
    cedula: '16.892.401',
    cargoOpta: 'Soldador 6G Especialista',
    requerimientoCodigo: 'REQ-2026-051',
    estado: 'llenada',
    fechaLlenada: '2026-10-04',
    cuentaBancariaDeclarada: '0102-0492-88-0001928374',
    banco: 'Banco de Venezuela',
    direccionDeclarada: 'San Félix, Barrio La Esperanza, Calle Las Flores #22'
  },
  {
    id: 'pln-002',
    candidatoId: 'cv-004',
    nombreCompleto: 'Darwin José Maita Lezama',
    cedula: '20.198.330',
    cargoOpta: 'Soldador 6G Especialista',
    requerimientoCodigo: 'REQ-2026-051',
    estado: 'pendiente'
  }
];

// ==========================================
// 12. CUADRILLAS EN OBRA
// ==========================================
export const MOCK_CUADRILLAS_OBRA: CuadrillaProyecto[] = [
  {
    id: 'cua-01',
    proyectoId: 'TTE-C-0706',
    proyectoNombre: 'Modernización Muelle Palúa (PMH Ferrominera)',
    nombre: 'Cuadrilla Palúa Montaje Mecánico A',
    frente: 'Muelle Fluvial',
    coordinadorNombre: 'Ing. Pedro Rivas',
    operaSinMandosIntermedios: false,
    totalGente: 14,
    oficios: ['Mecánico Montador', 'Alineador', 'Capataz de Obra'],
    miembros: [
      { id: 'mb-01', empleadoId: 'emp-002', nombreCompleto: 'Carlos Eduardo Benítez Rivas', codigoEmpleado: 'TIM-1188', cedula: '17.330.841', cargo: 'Mecánico Montador', rol: 'trabajador', esForaneo: false },
      { id: 'mb-02', empleadoId: 'emp-sup-01', nombreCompleto: 'Víctor José Carrión', codigoEmpleado: 'TIM-0850', cedula: '12.440.119', cargo: 'Supervisor de Montaje', rol: 'supervisor', esForaneo: false }
    ]
  },
  {
    id: 'cua-02',
    proyectoId: 'TTE-C-0706',
    proyectoNombre: 'Modernización Muelle Palúa (PMH Ferrominera)',
    nombre: 'Cuadrilla Palúa Soldadura Especializada B',
    frente: 'Vigas Cajón y Defensas',
    coordinadorNombre: 'Ing. Pedro Rivas',
    operaSinMandosIntermedios: false,
    totalGente: 16,
    oficios: ['Soldador 6G', 'Soldador 3G', 'Esmerilador', 'Armador'],
    miembros: [
      { id: 'mb-03', empleadoId: 'emp-001', nombreCompleto: 'José Rafael Castillo Morales', codigoEmpleado: 'TIM-1042', cedula: '14.892.301', cargo: 'Soldador 6G', rol: 'trabajador', esForaneo: false }
    ]
  },
  {
    id: 'cua-03',
    proyectoId: 'TT-A-C-207',
    proyectoNombre: 'Planta de Pellas - Mantenimiento Mayor y Flota',
    nombre: 'Cuadrilla Flota Grúas & Equipos Pesados',
    frente: 'Patio de Maniobras / Pellas',
    coordinadorNombre: 'Ing. Marcos Gómez',
    operaSinMandosIntermedios: true,
    totalGente: 12,
    oficios: ['Operador de Grúa 160T', 'Operador de Grúa 70T', 'Rigger', 'Mecánico Diesel'],
    miembros: [
      { id: 'mb-04', empleadoId: 'emp-003', nombreCompleto: 'Miguel Antonio Rondón Flores', codigoEmpleado: 'TIM-0914', cedula: '11.890.123', cargo: 'Operador de Grúa 160T', rol: 'trabajador_directo', esForaneo: false }
    ]
  }
];

// ==========================================
// 13. APERTURA DE PLAZAS
// ==========================================
export const MOCK_SOLICITUDES_PLAZAS: SolicitudPlazaRegistro[] = [
  {
    id: 'plz-001',
    codigo: 'PLZ-2026-018',
    cargo: 'Técnico Especialista en Ensayos No Destructivos (Ultrasonido Phased Array)',
    cantidad: 1,
    gerencia: 'Gerencia General de Operaciones & Obras',
    departamento: 'Departamento de Control de Calidad (QA/QC)',
    frenteObra: 'Laboratorio QA/QC y Obras',
    solicitanteNombre: 'Ing. Carlos Mendoza',
    fechaSolicitud: '2026-09-15',
    motivoJustificacion: 'Las exigencias del cliente Ferrominera en juntas soldadas críticas del muelle requieren ensayos PAUT in-house sin subcontratar laboratorios externos de Caracas.',
    estado: 'pendiente_presidencia',
    decidePresidencia: true,
    diferenciaVersiones: {
      antes: 'Se solicitaban 2 inspectores nivel II estándar.',
      ahora: 'Se ajustó a 1 especialista avanzado con equipo Phased Array propio.'
    }
  },
  {
    id: 'plz-002',
    codigo: 'PLZ-2026-019',
    cargo: 'Mecánico Hidráulico para Equipos Pesados de Flota',
    cantidad: 2,
    gerencia: 'Gerencia de Taller & Fabricación Metalmecánica',
    departamento: 'Departamento de Mantenimiento de Flota & Equipos',
    frenteObra: 'Taller Mecánico Central',
    solicitanteNombre: 'Ing. Marcos Gómez',
    fechaSolicitud: '2026-10-01',
    motivoJustificacion: 'Incremento de la disponibilidad operativa de las 26 grúas y montacargas para evitar alquileres externos que costaron $89.789 en agosto.',
    estado: 'pendiente_gerencia',
    decidePresidencia: false
  }
];
