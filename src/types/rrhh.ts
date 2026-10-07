/**
 * Tipos de datos para el módulo de Recursos Humanos / Talento Humano (TIMACA)
 */

export type SeccionRRHH =
  | 'inicio'            // Indicadores
  | 'organizacion'      // Estructura organizativa / Organigrama
  | 'empleados'         // Expedientes
  | 'contratos'         // Contratos
  | 'historial_egresos' // Historial de egresos
  | 'asistencia'        // Control de asistencia
  | 'requerimientos'    // Solicitud de requerimiento
  | 'cartera_cv'        // Cartera de CV's
  | 'entrevistas'       // Entrevistas
  | 'candidatos'        // Proceso de ingreso (Pipeline)
  | 'planillas'         // Planillas de ingreso
  | 'cuadrillas'        // Cuadrillas en obra
  | 'sol_plazas'        // Apertura de Plazas
  | 'mi_ficha';         // Autoservicio: Mi Ficha

// ==========================================
// 1. INDICADORES (KPIs)
// ==========================================
export interface IndicadoresRRHH {
  personalActivo: number;
  enNominaDirecta: number;
  antiguedadMediaAnios: number;
  antiguedadMedianaAnios: number;
  contratosVigentes: number;
  contratosPorVencer: number;
  contratosVencidos: number;
  candidatosDisponibles: number;
  candidatosYaTrabajaronAqui: number;
  candidatosEntrevistados: number;
  requerimientosEnGestion: number;
  diasPromedioContratar: number;
  asistenciaHoyPorcentaje: number;
  ingresosEsperandoEquipo: number;
  fichasDatosIncompletos: number;
  contratosSinDecision: number;
}

// ==========================================
// 2. ORGANIGRAMA Y ESTRUCTURA ORGANIZATIVA
// ==========================================
export type TipoJefatura = 'titular' | 'encargo' | 'vacante';

export interface UnidadOrganizativa {
  id: string;
  padreId: string | null;
  nombre: string;
  codigo: string;
  nivel: 'direccion' | 'gerencia' | 'departamento' | 'frente' | 'seccion';
  jefeNombre?: string;
  jefeCedula?: string;
  jefeCargo?: string;
  tipoJefatura: TipoJefatura;
  plazasAprobadas: number;
  plazasOcupadas: number;
  genteTotal: number;
  oficiosPrincipales: string[];
}

// ==========================================
// 3. EXPEDIENTES / EMPLEADOS
// ==========================================
export type EstadoLaboral = 'activo' | 'en_pausa' | 'vacaciones' | 'reposo' | 'egresado';
export type TipoNomina = 'nomina_timaca' | 'honorarios';
export type ModalidadContrato = 'determinado' | 'indefinido';

export interface TallasDotacion {
  camisa: string;
  pantalon: string;
  zapato: string;
  braga?: string;
}

export interface CargaFamiliar {
  id: string;
  parentesco: 'Hijo/a' | 'Cónyuge' | 'Padre' | 'Madre';
  nombreCompleto: string;
  cedula?: string;
  fechaNacimiento: string;
  edad: number;
}

export interface DocumentoGaveta {
  id: string;
  tipo: 'Cedula' | 'RIF' | 'Titulo' | 'Certificado' | 'Contrato' | 'Examen Medico' | 'Licencia Conducir';
  nombreArchivo: string;
  fechaSubida: string;
  tamanioKb: number;
}

export interface CursoCharlaEmpleado {
  id: string;
  tipo: 'charla_hse' | 'curso_tecnico' | 'induccion';
  nombre: string;
  fecha: string;
  duracionHoras: number;
  facilitador: string;
}

export interface EventoHistorialEmpleado {
  id: string;
  fecha: string;
  tipo: 'ingreso' | 'cambio_puesto' | 'traslado' | 'aumento' | 'suspension' | 'renovacion';
  descripcion: string;
  registradoPor: string;
}

export interface EmpleadoExpediente {
  id: string;
  codigoEmpleado: string;
  nombreCompleto: string;
  cedula: string;
  nacionalidad: 'venezolano' | 'extranjero';
  fechaNacimiento: string;
  edad: number;
  estadoCivil: string;
  telefono: string;
  correo: string;
  direccion: string;
  tallas: TallasDotacion;
  // Laborales
  puestoCargo: string;
  nivelJerarquico: string;
  gerencia: string;
  departamento: string;
  sector: string;
  sede: string;
  frente: string;
  proyectoCodigo: string;
  jefeDirecto: string;
  perteneceSindicato: boolean;
  tipoNomina: TipoNomina;
  modalidad: ModalidadContrato;
  fechaIngreso: string;
  antiguedadTexto: string;
  estadoLaboral: EstadoLaboral;
  cargasFamiliares: CargaFamiliar[];
  sinCargasFamiliaresRegistradas: boolean;
  documentos: DocumentoGaveta[];
  cursosCharlas: CursoCharlaEmpleado[];
  historialEventos: EventoHistorialEmpleado[];
  faltanDatos: string[];
}

// ==========================================
// 4. CONTRATOS
// ==========================================
export type SemaforoContrato = 'vigente' | 'por_vencer' | 'vencido';

export interface ContratoRegistro {
  id: string;
  empleadoId: string;
  empleadoNombre: string;
  cedula: string;
  codigoEmpleado: string;
  cargo: string;
  gerencia: string;
  jefeDirecto: string;
  numeroContrato: string;
  modalidad: TipoNomina;
  tipoDuracion: ModalidadContrato;
  periodicidad: 'semanal' | 'mensual';
  fechaInicio: string;
  fechaFin: string | null;
  diasParaVencer: number | null;
  semaforo: SemaforoContrato;
  estado: 'vigente' | 'vencido' | 'renovado' | 'en_pausa' | 'rescindido';
  requiereRespuestaJefe: boolean;
  decisionJefe?: 'renovar' | 'no_renovar' | 'espera';
  decisionNota?: string;
  tieneAddendum: boolean;
  urlDocumentoFirmado?: string;
}

// ==========================================
// 5. HISTORIAL DE EGRESOS
// ==========================================
export interface EgresoRegistro {
  id: string;
  empleadoId: string;
  nombreCompleto: string;
  cedula: string;
  cargoAlSalir: string;
  gerenciaAlSalir: string;
  jefeAlSalir: string;
  fechaEgreso: string;
  tiempoDuracionTexto: string; // ej: "2 años 4 meses"
  motivoEgreso: 'renuncia' | 'despido' | 'fin_contrato' | 'mutuo_acuerdo' | 'abandono';
  motivoDetalle: string;
  puedeVolver: boolean; // false = vetado / no recontratable
  observacionRecontratabilidad?: string;
  volvioDespues: boolean;
  etapaNumero: number;
}

// ==========================================
// 6. CONTROL DE ASISTENCIA Y TRANSITORIOS
// ==========================================
export type MarcaAsistencia = 'P' | 'T' | 'A'; // Presente, Tarde, Ausente

export interface RegistroAsistenciaDiaria {
  id: string;
  empleadoId: string;
  nombreCompleto: string;
  cedula: string;
  cargo: string;
  cuadrillaNombre?: string;
  frente: string;
  obraProyecto: string;
  fecha: string;
  turno: 'diurno' | 'nocturno' | 'rotativo';
  marca: MarcaAsistencia;
  horaEntrada?: string;
  motivoTardanza?: string;
  tipoAusencia?: 'permiso_vigente' | 'justificada' | 'injustificada' | 'pendiente_justificativo';
  salidaAnticipada?: {
    horaSalida: string;
    motivo: string;
  };
}

export interface AsistenciaTransitorio {
  id: string;
  asistenciaId: string;
  empleadoId: string;
  nombreCompleto: string;
  cedula: string;
  proyecto: string;
  fechaFalta: string;
  horasParaVencer: number;
  semaforo: 'verde' | 'amarillo' | 'rojo';
  motivoPreliminar: string;
  estado: 'en_plazo' | 'vencido' | 'resuelto';
  resolucion?: 'justificada' | 'injustificada' | 'permiso_creado';
}

// ==========================================
// 7. SOLICITUD DE REQUERIMIENTOS
// ==========================================
export type EstadoRequerimiento = 'pendiente_aprobacion' | 'aprobada' | 'rechazada' | 'en_proceso' | 'cerrada';

export interface RequerimientoPersonal {
  id: string;
  codigo: string; // ej: REQ-2026-042
  cargo: string;
  cantidad: number;
  contratados: number;
  gerencia: string;
  departamento: string;
  frenteObra: string;
  motivo: 'crecimiento' | 'sustitucion' | 'nueva_obra';
  sustituyeA?: string;
  solicitanteNombre: string;
  creadoPorId: string;
  fechaSolicitud: string;
  estado: EstadoRequerimiento;
  aprobadoPor?: string;
  decidePresidencia: boolean;
  tomadoPorNombre?: string; // Reclutador RRHH que tomó la vacante
  priorizado: boolean;
  observaciones?: string;
}

// ==========================================
// 8. CARTERA DE CV'S
// ==========================================
export interface CandidatoCV {
  id: string;
  nombreCompleto: string;
  cedula: string;
  telefono: string;
  correo: string;
  profesionOficio: string;
  puestoSugerido?: string;
  situacion: 'en_cartera' | 'en_proceso' | 'contratado' | 'declino_oferta' | 'descartado';
  yaTrabajoAqui: boolean;
  requerimientoAsignadoCodigo?: string;
  fechaCarga: string;
  habilidadesDuras: string[];
  habilidadesBlandas: string[];
  cvNombreArchivo?: string;
  observaciones?: string;
}

// ==========================================
// 9. ENTREVISTAS
// ==========================================
export type TipoEntrevista = 'preseleccion' | 'tecnica' | 'gerencia' | 'presidencia';
export type ResultadoEntrevista = 'pendiente' | 'aprobado' | 'rechazado' | 'exonerado';

export interface EntrevistaRegistro {
  id: string;
  candidatoId: string;
  candidatoNombre: string;
  cedula: string;
  requerimientoCodigo: string;
  gerencia: string;
  tipoEntrevista: TipoEntrevista;
  fechaHora: string;
  entrevistadorNombre: string;
  resultado: ResultadoEntrevista;
  habilidadesBlandas: string[];
  habilidadesDuras: string[];
  observacionConfidencialRRHH?: string;
  motivoRechazo?: string;
}

// ==========================================
// 10. PROCESO DE INGRESO (PIPELINE)
// ==========================================
export type EtapaIngreso =
  | 'por_entrevistar'
  | 'en_entrevista'
  | 'en_decision'
  | 'en_oferta'
  | 'en_examen'
  | 'por_ingresar'
  | 'ingresado'
  | 'caido';

export interface CandidatoEnProceso {
  id: string;
  postulacionId: string;
  candidatoId: string;
  nombreCompleto: string;
  cedula: string;
  telefono: string;
  cargoOpta: string;
  requerimientoCodigo: string;
  gerencia: string;
  departamento: string;
  etapaActual: EtapaIngreso;
  fechaInicioProceso: string;
  fechaIngresoPautada?: string;
  tienePaseAcceso: boolean;
  equipoAsignado: boolean;
  tomadoPorNombre: string;
  motivoCaido?: string;
}

// ==========================================
// 11. PLANILLAS DE INGRESO
// ==========================================
export interface PlanillaIngresoRegistro {
  id: string;
  candidatoId: string;
  nombreCompleto: string;
  nombreDeclarado?: string;
  cedula: string;
  cargoOpta: string;
  requerimientoCodigo: string;
  estado: 'pendiente' | 'llenada' | 'contratado';
  fechaLlenada?: string;
  cuentaBancariaDeclarada?: string;
  banco?: string;
  direccionDeclarada?: string;
  alertaDiscrepancia?: string;
}

// ==========================================
// 12. CUADRILLAS EN OBRA
// ==========================================
export type RolCuadrilla = 'coordinador' | 'supervisor' | 'trabajador' | 'trabajador_directo';

export interface MiembroCuadrilla {
  id: string;
  empleadoId: string;
  nombreCompleto: string;
  codigoEmpleado: string;
  cedula: string;
  cargo: string;
  rol: RolCuadrilla;
  supervisorInmediatoId?: string;
  esForaneo: boolean;
}

export interface CuadrillaProyecto {
  id: string;
  proyectoId: string;
  proyectoNombre: string;
  nombre: string; // ej: Cuadrilla Montaje Mecánico A
  frente: string;
  coordinadorNombre?: string;
  operaSinMandosIntermedios: boolean;
  totalGente: number;
  oficios: string[];
  miembros: MiembroCuadrilla[];
}

// ==========================================
// 13. APERTURA DE PLAZAS
// ==========================================
export type EstadoSolicitudPlaza =
  | 'pendiente_gerencia'
  | 'pendiente_frente'
  | 'pendiente_presidencia'
  | 'aprobada'
  | 'rechazada';

export interface SolicitudPlazaRegistro {
  id: string;
  codigo: string; // ej: PLZ-2026-015
  cargo: string;
  cantidad: number;
  gerencia: string;
  departamento: string;
  frenteObra: string;
  solicitanteNombre: string;
  fechaSolicitud: string;
  motivoJustificacion: string;
  estado: EstadoSolicitudPlaza;
  decidePresidencia: boolean;
  motivoRechazo?: string;
  diferenciaVersiones?: {
    antes: string;
    ahora: string;
  };
}
