export type SuiteModulo = 'costos' | 'herramientas' | 'dotacion' | 'sip-pmh' | 'seguridad' | 'certificados' | 'rrhh';

// ==========================================
// 1. HERRAMIENTAS & EQUIPOS DE TALLER
// ==========================================
export type EstadoHerramienta = 'Disponible' | 'En Uso / Asignada' | 'En Calibración' | 'En Reparación' | 'Extraviada';
export type CategoriaHerramienta = 
  | 'Cajas de Herramientas' 
  | 'Torquímetros & Metrología' 
  | 'Equipos de Soldadura' 
  | 'Herramientas Eléctricas' 
  | 'Equipos de Izaje & Tecles' 
  | 'Prensas & Gatos Hidráulicos'
  | 'Equipos de Oxicorte';

export interface Herramienta {
  id: string;
  codigo: string; // ej: CH-01, TORQ-04, SLD-02
  nombre: string;
  marcaModelo: string;
  categoria: CategoriaHerramienta;
  ubicacion: string; // Taller Central, Frente Palúa PMH, Frente Pellas, Pañol Central
  estado: EstadoHerramienta;
  responsableActual?: string;
  cuadrilla?: string;
  fechaAsignacion?: string;
  fechaDevolucionEstimada?: string;
  requiereCalibracion: boolean;
  fechaUltimaCalibracion?: string;
  fechaProximaCalibracion?: string;
  diasParaCalibracion?: number;
  valorReposicionUsd: number;
  cuentaCostoAsociada: string; // ej: TT-A-C-207, EE-H-C-015
  serialFabricante?: string;
  observaciones?: string;
}

export interface PrestamoHerramienta {
  id: string;
  herramientaId: string;
  codigoHerramienta: string;
  nombreHerramienta: string;
  trabajadorNombre: string;
  cedula: string;
  cargo: string;
  frenteDestino: string;
  fechaPrestamo: string;
  fechaDevolucionEstimada: string;
  fechaDevolucionReal?: string;
  estado: 'Activo' | 'Devuelto' | 'Atrasado' | 'Observado';
  entregadoPor: string;
  recibidoPor?: string;
  condicionEntrega: string;
  condicionDevolucion?: string;
}

// ==========================================
// 2. SISTEMA DE DOTACIÓN (EPP & UNIFORMES)
// ==========================================
export type CategoriaEPP = 
  | 'Calzado de Seguridad' 
  | 'Protección Craneana' 
  | 'Indumentaria & Bragas' 
  | 'Protección Visual & Facial' 
  | 'Protección de Manos' 
  | 'Protección Respiratoria' 
  | 'Protección Anticaídas' 
  | 'Protección Auditiva';

export interface CatalogoEPPItem {
  id: string;
  codigo: string; // ej: EPP-BOT-01, EPP-BRG-02
  nombre: string;
  categoria: CategoriaEPP;
  especificacion: string;
  marcaNorma: string; // ANSI Z89.1, COVENIN 39:2003, etc.
  stockActual: number;
  stockMinimo: number;
  costoUnitarioUsd: number;
  vidaUtilDias: number; // 180 días botas, 120 días bragas, 730 días cascos
  tallasDisponibles?: string[];
}

export interface EntregaDotacionRegistro {
  id: string;
  numeroActa: string; // ACT-EPP-2026-089
  trabajadorId: string;
  trabajadorNombre: string;
  cedula: string;
  cargo: string;
  departamento: string;
  frenteAsignado: string; // Taller Central, Muelle Palúa PMH, Pellas, Flota Grúas
  fechaEntrega: string;
  fechaProximaRenovacion: string;
  diasParaRenovacion: number;
  estado: 'Vigente' | 'Por Renovar' | 'Vencida';
  itemsEntregados: {
    itemCodigo: string;
    itemNombre: string;
    talla: string;
    cantidad: number;
    costoTotalUsd: number;
  }[];
  costoTotalUsd: number;
  entregadoPor: string;
  firmaConforme: boolean;
  observaciones?: string;
}

// ==========================================
// 3. SIP DE PMH (PALÚA EN CAMPO)
// ==========================================
export type FrenteTrabajoPMH = 
  | 'Muelle de Carga Palúa (Ship Loader)' 
  | 'Torre de Transferencia TT-201' 
  | 'Línea de Pellas - Secador L1' 
  | 'Línea de Pellas - Horno L2' 
  | 'Sistema de Tolvas & Chutes' 
  | 'Patio de Minerales & Apilador';

export interface ItemValePMH {
  codigoMaterial: string;
  descripcion: string;
  unidad: string;
  cantidad: number;
  costoUnitarioUsd: number;
  totalUsd: number;
  partidaImputacion?: string;
}

export interface ValeSIPPmh {
  id: string;
  numeroVale: string; // VALE-PMH-2026-0412
  fechaHora: string;
  frenteTrabajo: FrenteTrabajoPMH;
  cuentaAuxiliarCodigo: string; // TTE-C-0671, TTE-C-0656, TTE-C-0706
  cuentaAuxiliarNombre: string;
  equipoIntervenido?: string; // e.g. Chute 04, Tambor Motriz CV-02, Bomba B-101
  solicitadoPor: string;
  cargoSolicitante: string;
  supervisorAprobador: string;
  despachadoPor: string;
  estado: 'Despachado en Campo' | 'Pendiente Sincronización' | 'Sincronizado Central' | 'Anulado';
  items: ItemValePMH[];
  montoTotalUsd: number;
  observaciones?: string;
  esOffline: boolean;
  retornoMaterialEstimado?: boolean;
}

// ==========================================
// 4. SEGUIMIENTO DE CERTIFICADOS & CURSOS HSE
// ==========================================
export type EstadoCertificado = 'Vigente' | 'Por Vencer' | 'Vencido';
export type AreaPersonalHSE = 
  | 'Operadores de Grúas' 
  | 'Riggers & Maniobristas' 
  | 'Soldadores Calificados' 
  | 'Mantenimiento Mecánico' 
  | 'Electricistas Industriales' 
  | 'Supervisión HSE & Campo';

export interface CertificadoHSE {
  id: string;
  trabajadorNombre: string;
  cedula: string;
  cargo: string;
  area: AreaPersonalHSE;
  equipoAsignado?: string; // ej: Grúa GR17 Liebherr 160T, Grúa GR15 Grove 70T
  cursoNombre: string;
  entidadEmisora: string; // ASME B30.5, INPSASEL, COVENIN, Bureau Veritas
  numeroCertificado: string;
  fechaEmision: string;
  fechaVencimiento: string;
  diasParaVencer: number;
  estado: EstadoCertificado;
  bloqueaOperacion: boolean; // Si está vencido, no puede operar en campo
  archivoAdjuntoNombre?: string;
  horasFormacion: number;
}
