export interface SalidaCosto {
  id: string;
  codigoSalida: string;
  fecha: string; // YYYY-MM-DD
  semana: number; // 1 - 53
  semanaLabel: string; // e.g. "Semana 12"
  mes: number; // 1 - 12
  mesLabel: string; // e.g. "Marzo 2026"
  ano: number; // 2026
  proyecto: string; // e.g. "Bandas Transportadoras PMH"
  cuentaAuxiliarCodigo: string; // e.g. "TTE-C-0656"
  cuentaAuxiliarNombre: string; // e.g. "Rehabilitación de Bandas PMH"
  centroCosto: string; // e.g. "Taller Principal / Calderería"
  categoria: string; // e.g. "Materiales Directos"
  tipo?: string; // e.g. "Materiales Directos", "Servicios"
  subcategoria?: string; // e.g. "Pernos / Fijaciones", "Perfiles / Estructura"
  itemDescripcion: string;
  proveedorODestino?: string;
  cantidad: number;
  unidadMedida: string;
  montoUnitario: number;
  montoTotal: number;
  moneda?: 'USD' | 'VES';
  responsable: string;
  solicitante?: string; // e.g. "Carlos Giraldo"
  motivo?: string; // e.g. "Montaje estructural tramo motriz"
  ajuste?: string; // e.g. "Operativo", "Normalización", etc.
  precioSIP?: number;
  totalSIP?: number;
  estado?: 'Procesado' | 'Pendiente' | 'Verificado';
  observaciones?: string;
  estadoValidacion?: 'Pendiente' | 'Conforme' | 'Observado';
  observacionGerente?: string;
  fechaValidacion?: string;
  validadoPor?: string;
  esProyectoExterno?: boolean;
  tipoCosto?: string;
  isNormalizacion?: boolean;
}

export type PeriodoFiltro = 'todos' | 'mes' | 'semana' | 'rango';

export interface ResumenSemanal {
  semana: number;
  semanaLabel: string;
  ano: number;
  mesLabel: string;
  totalMonto: number;
  totalSalidas: number;
  porCategoria: Record<string, number>;
  porCentroCosto: Record<string, number>;
  porProyecto?: Record<string, number>;
  diferenciaPrevia?: number;
  porcentajeVariacion?: number;
}

export interface ResumenMensual {
  mes: number;
  mesLabel: string;
  ano: number;
  totalMonto: number;
  totalSalidas: number;
  porCategoria: Record<string, number>;
  porCentroCosto: Record<string, number>;
  porProyecto?: Record<string, number>;
  promedioSemanal: number;
  porcentajeVariacion?: number;
}

export interface CentroCostoResumen {
  nombre: string;
  totalMonto: number;
  totalSalidas: number;
  porcentaje: number;
}

export interface CategoriaResumen {
  nombre: string;
  totalMonto: number;
  totalSalidas: number;
  porcentaje: number;
  color: string;
}

export interface CuentaAuxiliarDetalle {
  codigo: string;
  nombre: string;
  totalMonto: number;
  totalSalidas: number;
  porcentaje: number;
  salidas: SalidaCosto[];
}

export interface ProyectoResumen {
  nombre: string;
  totalMonto: number;
  totalSalidas: number;
  porcentajeDelTotal: number;
  cuentasAuxiliares: CuentaAuxiliarDetalle[];
  totalSemanas: Record<number, number>;
  totalMeses: Record<number, number>;
}
