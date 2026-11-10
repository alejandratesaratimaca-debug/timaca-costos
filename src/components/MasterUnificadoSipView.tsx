import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { 
  Building2, 
  Briefcase,
  RefreshCw, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  ArrowUpDown, 
  Edit3, 
  FileSpreadsheet, 
  FileText, 
  TrendingUp, 
  Layers, 
  DollarSign, 
  ShoppingBag, 
  Boxes, 
  ChevronRight, 
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Download, 
  AlertCircle,
  HardHat,
  Cpu,
  User,
  Save,
  X,
  Database,
  Calendar,
  PieChart,
  ListFilter,
  Check,
  ArrowRight,
  ArrowRightLeft,
  RotateCcw,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { isNormalizacion } from '../utils/normalizacionFilter';
import { safeNumber, safeFormatUSD, safeFormatQuantity, safePercent } from '../utils/numericHelpers';
import { BandejaAlertasSipView } from './BandejaAlertasSipView';

interface Proyecto {
  codigo: string;
  nombre: string;
  tipoCosto: string;
  cliente: string;
  materialesDirectos?: number;
  servicios?: number;
  totalUSD?: number;
  totalItemsConsumos?: number;
  totalItemsCompras?: number;
}

interface Consumo {
  id: string;
  almacen: string;
  numero: string;
  pedido?: string;
  fecha: string;
  codigo: string;
  descripcion: string;
  cantidad: number;
  unidad: string;
  cuentaAuxiliar: string;
  cuentaAuxiliarOriginal: string;
  esReclasificado: boolean;
  ceco: string;
  solicitante: string;
  motivo: string;
  categoria?: string;
  costoUnitario: number;
  totalUSD: number;
  estatus: string;
  nombre_mes?: string;
}

interface Compra {
  id: string;
  almacen: string;
  numero?: string;
  solicitudCompra: string;
  ordenCompra: string;
  fechaSolicitud: string;
  fechaOC?: string;
  fechaRecepcion: string;
  recepcion?: string;
  codigo: string;
  descripcion: string;
  motivo?: string;
  categoria?: string;
  cantidadSolicitada: number;
  cantidadOC: number;
  cantidadRecepcionada: number;
  unidad: string;
  cuentaAuxiliar: string;
  cuentaAuxiliarOriginal: string;
  esReclasificado: boolean;
  comprador: string;
  proveedor: string;
  precioUnitario: number;
  totalUSD: number;
  estatusSC: string;
  estatusOC?: string;
  tipo: string;
  nombre_mes?: string;
  solicitante?: string;
}

interface Status {
  sipConnected: boolean;
  sipHost: string;
  sipUser: string;
  lastSync: string | null;
  totalConsumos: number;
  totalCompras: number;
  totalProyectos: number;
  totalReclasificaciones: number;
}

interface MasterRow {
  id: number;
  tipo: string;
  almacen: string;
  fecha: string;
  numero: string;
  pedido: string;
  cuenta_aux: string;
  ceco: string;
  codigo: string;
  descripcion: string;
  cantidad: number;
  unidad: string;
  solicitante: string;
  motivo: string;
  ajuste: string;
  categoria: string;
  precio_final: number;
  total_usd: number;
  precio_dolar: number;
  semana: number;
  fecha_hasta: string;
  apellidos_nombres: string;
  cargo: string;
  supervisor: string;
  area_ubicacion: string;
  tarifa: number;
  actividad: string;
  tiempo_total: string;
  equipo: string;
  posesion: string;
  tipo_equipo: string;
  linea_prod_desc: string;
  agrupador_linea: string;
  linea_produccion: string;
  datos_descripcion: string;
  datos_tipo_costo: string;
  datos_tipo_equipo: string;
  datos_codigo_sysman: string;
  datos_zona: string;
  ano: number;
  nombre_mes: string;
  sc: string;
  oc: string;
  esReclasificado?: boolean;
  esTrasladado?: boolean;
  mesOrigen?: string;
  cuenta_aux_original?: string;
  infoReclasificacion?: any;
}

const MESES_LIST = [
  { key: 'todos', label: 'Todos', num: '00', lastDay: 0, nombre: 'Todos' },
  { key: 'enero', label: 'Ene', num: '01', lastDay: 31, nombre: 'Enero' },
  { key: 'febrero', label: 'Feb', num: '02', lastDay: 28, nombre: 'Febrero' },
  { key: 'marzo', label: 'Mar', num: '03', lastDay: 31, nombre: 'Marzo' },
  { key: 'abril', label: 'Abr', num: '04', lastDay: 30, nombre: 'Abril' },
  { key: 'mayo', label: 'May', num: '05', lastDay: 31, nombre: 'Mayo' },
  { key: 'junio', label: 'Jun', num: '06', lastDay: 30, nombre: 'Junio' },
  { key: 'julio', label: 'Jul', num: '07', lastDay: 31, nombre: 'Julio' },
  { key: 'agosto', label: 'Ago', num: '08', lastDay: 31, nombre: 'Agosto' },
  { key: 'septiembre', label: 'Sep', num: '09', lastDay: 30, nombre: 'Septiembre' },
  { key: 'octubre', label: 'Oct', num: '10', lastDay: 31, nombre: 'Octubre' },
  { key: 'noviembre', label: 'Nov', num: '11', lastDay: 30, nombre: 'Noviembre' },
];

export type SubtipoNormalizacion = 'rezagada' | 'vieja_historica';

export const formatFechaDDMMAAAA = (fechaStr?: string | null): string => {
  if (!fechaStr) return '-';
  const clean = String(fechaStr).trim();
  if (!clean || clean === '-') return '-';

  // Already in DD/MM/YYYY or DD/MM/YY
  if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(clean)) {
    return clean;
  }

  // YYYY-MM-DD or YYYY/MM/DD
  const isoMatch = clean.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})(?:[T\s].*)?$/);
  if (isoMatch) {
    const y = isoMatch[1];
    const m = isoMatch[2].padStart(2, '0');
    const d = isoMatch[3].padStart(2, '0');
    return `${d}/${m}/${y}`;
  }

  // Fallback Date parse
  const dObj = new Date(clean);
  if (!isNaN(dObj.getTime()) && clean.length >= 8) {
    const d = String(dObj.getDate()).padStart(2, '0');
    const m = String(dObj.getMonth() + 1).padStart(2, '0');
    const y = dObj.getFullYear();
    if (y >= 2000 && y <= 2100) {
      return `${d}/${m}/${y}`;
    }
  }

  return clean;
};

export function isAjusteNormalizacionOManual(r: any): boolean {
  if (!r) return false;
  const a = (r.ajuste || '').toUpperCase().trim();
  // Regla estricta indicada por Alejandra: la palabra NORMALIZACION o MANUAL debe estar en la columna AJUSTE
  return a.includes('NORMALIZ') || a.includes('MANUAL');
}

export interface DesfaseFechaInfo {
  tieneDesfase: boolean;
  tipo: 'mes_diferente' | 'fecha_corta' | 'nombre_mes' | 'codigo_ag';
  fechaTexto: string;
  mesDetectado?: 'Junio' | 'Julio' | 'Agosto' | 'Mayo' | 'Octubre' | string;
  mesNumero?: number;
  motivoSnippet?: string;
  detalle: string;
}

export const getRowKey = (r: any): string => {
  if (!r) return '';
  return r.id != null ? String(r.id) : (r.numero ? `${r.numero}-${r.codigo || ''}` : `${r.dp || r.sc || ''}-${r.codigo || ''}`);
};

export const isRowDescartada = (r: any, descartadasList: string[]): boolean => {
  if (!r || !descartadasList || descartadasList.length === 0) return false;
  const set = new Set(descartadasList.map(String));
  if (r.id != null && set.has(String(r.id))) return true;
  if (r.numero && r.codigo && set.has(`${r.numero}-${r.codigo}`)) return true;
  if (r.numero && set.has(String(r.numero))) return true;
  if (r.dp && set.has(String(r.dp))) return true;
  if (r.sc && set.has(String(r.sc))) return true;
  return false;
};

export function detectarDesfaseFechaMotivo(r: any): DesfaseFechaInfo | null {
  if (!r || !r.motivo) return null;
  const m = String(r.motivo || '').toUpperCase();
  const f = String(r.fecha || '').trim();
  let fy = 2026, fm = 10, fd = 1;
  if (f.includes('/')) {
    const parts = f.split('/');
    if (parts.length >= 3) {
      fd = parseInt(parts[0], 10);
      fm = parseInt(parts[1], 10);
      fy = parseInt(parts[2], 10);
      if (fy < 100) fy += 2000;
    }
  } else if (f.includes('-')) {
    const parts = f.split('-');
    if (parts.length >= 3) {
      fy = parseInt(parts[0], 10);
      fm = parseInt(parts[1], 10);
      fd = parseInt(parts[2], 10);
    }
  } else if (r.nombre_mes) {
    const mm: Record<string, number> = {
      enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6,
      julio: 7, agosto: 8, septiembre: 9, octubre: 10, noviembre: 11, diciembre: 12
    };
    fm = mm[String(r.nombre_mes).toLowerCase().trim()] || 10;
  }
  const monthNames = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  // 1. Fecha explícita completa DD/MM/YYYY o DD-MM-YYYY
  const matchFull = m.match(/(?:FECHA\s*:?\s*|DEL\s+|AL\s+|^|\s)([0-2]?[1-9]|[12]0|3[01])[\/\-\.](0?[1-9]|1[0-2])[\/\-\.](202\d|2\d)\b/i);
  if (matchFull) {
    let day = parseInt(matchFull[1], 10);
    let month = parseInt(matchFull[2], 10);
    let year = parseInt(matchFull[3], 10);
    if (year < 100) year += 2000;

    if (fm && month !== fm) {
      const mesName = monthNames[month] || `Mes ${month}`;
      return {
        tieneDesfase: true,
        tipo: 'mes_diferente',
        fechaTexto: `${day < 10 ? '0' + day : day}/${month < 10 ? '0' + month : month}/${year}`,
        mesDetectado: mesName,
        mesNumero: month,
        motivoSnippet: matchFull[0].trim(),
        detalle: `Motivo indica fecha ${day}/${month}/${year} (${mesName}), que no corresponde a la fecha de la solicitud/PA (${f})`
      };
    }
  }

  // 2. Fecha corta DD/MM con palabra clave FECHA / DEL / AL / DIA / SABADO / DOMINGO o al inicio sin fracciones
  const matchShort = m.match(/(?:^|\bFECHA\s*:?\s*|\bDEL\s+|\bAL\s+|\bDIA\s+|\bSABADO\s+|\bDOMINGO\s+)([0-2]?[1-9]|[12]0|3[01])[\/\-](0?[1-9]|1[0-2])(?!\s*["'\/]|\s*PULG|\s*INCH)\b/i);
  if (matchShort) {
    let day = parseInt(matchShort[1], 10);
    let month = parseInt(matchShort[2], 10);
    if (fm && month !== fm) {
      const mesName = monthNames[month] || `Mes ${month}`;
      return {
        tieneDesfase: true,
        tipo: 'fecha_corta',
        fechaTexto: `${day < 10 ? '0' + day : day}/${month < 10 ? '0' + month : month}`,
        mesDetectado: mesName,
        mesNumero: month,
        motivoSnippet: matchShort[0].trim(),
        detalle: `Motivo indica ${day}/${month} (${mesName}), que no corresponde a la fecha de la solicitud/PA (${f})`
      };
    }
  }

  // 3. Meses por nombre explícito
  if (m.includes('JUNIO') && !m.includes('JUNIOR')) {
    if (fm !== 6) {
      return {
        tieneDesfase: true,
        tipo: 'nombre_mes',
        fechaTexto: 'Junio',
        mesDetectado: 'Junio',
        mesNumero: 6,
        detalle: `Motivo menciona Junio pero la fecha de PA/solicitud es ${f}`
      };
    }
  }

  if (m.includes('JULIO')) {
    const isWorkerJulio = (
      m.includes('SOLICITA JULIO') || m.includes('SUPERVISOR JULIO') || m.includes('MECANICO JULIO') ||
      m.includes('JULIO GIL') || m.includes('JULIO GILL') || m.includes('JULIO ALVAREZ') || m.includes('JULIO VARGAS') ||
      m.includes('JULIO HERNANDEZ') || m.includes('JULIO ROMERO') || m.includes('JULIO MORENO') ||
      m.includes('JULIO ZAPATA') || m.includes('JULIO RODRIGUEZ') || m.includes('JULIO CARGAS') ||
      m.includes('JULIO TUERCA') || m.includes('MARTINEZ JULIO') || m.includes('JULIO CESAR') ||
      ((m.includes('CAMISA') || m.includes('PANTALON') || m.includes('BATA') || m.includes('BOTAS') || m.includes('CASCO') || m.includes('DOTACION')) && m.includes('JULIO')) ||
      /JULIO\s+[A-Z]{3,}/.test(m)
    );
    if (!isWorkerJulio && fm !== 7) {
      return {
        tieneDesfase: true,
        tipo: 'nombre_mes',
        fechaTexto: 'Julio',
        mesDetectado: 'Julio',
        mesNumero: 7,
        detalle: `Motivo menciona Julio pero la fecha de PA/solicitud es ${f}`
      };
    }
  }

  if (m.includes('AGOSTO')) {
    if (fm !== 8) {
      return {
        tieneDesfase: true,
        tipo: 'nombre_mes',
        fechaTexto: 'Agosto',
        mesDetectado: 'Agosto',
        mesNumero: 8,
        detalle: `Motivo menciona Agosto pero la fecha de PA/solicitud es ${f}`
      };
    }
  }

  // 4. Código abreviado AG (Agosto)
  if (/\bAG\b/.test(m) || m.includes(' AG ') || m.endsWith(' AG') || m.includes(' AG-') || m.includes('-AG-') || m.includes(' AG/')) {
    if (fm !== 8) {
      return {
        tieneDesfase: true,
        tipo: 'codigo_ag',
        fechaTexto: 'AG (Agosto)',
        mesDetectado: 'Agosto',
        mesNumero: 8,
        detalle: `Motivo contiene código de regularización AG (Agosto) pero la fecha es ${f}`
      };
    }
  }

  return null;
}

export function detectarMesRezagada(r: any): string | null {
  if (!r) return null;
  if (r.infoReclasificacion?.nuevoMes) {
    const nm = r.infoReclasificacion.nuevoMes.trim();
    return nm.charAt(0).toUpperCase() + nm.slice(1).toLowerCase();
  }
  const desfase = detectarDesfaseFechaMotivo(r);
  if (desfase && desfase.mesDetectado) {
    return desfase.mesDetectado;
  }

  const m = (r.motivo || '').toUpperCase();
  // 1. Octubre
  if (m.includes('OCTUBRE') || /\bOCT\b/.test(m) || m.includes('10-2026') || m.includes('10/2026') || /\b(0?[1-9]|[12][0-9]|3[01])[\/-]10\b/.test(m)) {
    return 'Octubre';
  }

  // 2. Septiembre
  if (m.includes('SEPTIEMBRE') || /\bSEP\b/.test(m) || /\bSEPT\b/.test(m) || m.includes('09-2026') || m.includes('09/2026') || /\b(0?[1-9]|[12][0-9]|3[01])[\/-]0?9\b/.test(m)) {
    return 'Septiembre';
  }

  // 3. Junio
  if (m.includes('JUNIO') && !m.includes('JUNIOR')) return 'Junio';
  
  // 4. Julio (excluyendo nombres propios de trabajadores y dotaciones)
  if (m.includes('JULIO')) {
    const isWorkerJulio = (
      m.includes('SOLICITA JULIO') || m.includes('SUPERVISOR JULIO') || m.includes('MECANICO JULIO') ||
      m.includes('JULIO GIL') || m.includes('JULIO GILL') || m.includes('JULIO ALVAREZ') || m.includes('JULIO VARGAS') ||
      m.includes('JULIO HERNANDEZ') || m.includes('JULIO ROMERO') || m.includes('JULIO MORENO') ||
      m.includes('JULIO ZAPATA') || m.includes('JULIO RODRIGUEZ') || m.includes('JULIO CARGAS') ||
      m.includes('JULIO TUERCA') || m.includes('MARTINEZ JULIO') || m.includes('JULIO CESAR') ||
      ((m.includes('CAMISA') || m.includes('PANTALON') || m.includes('BATA') || m.includes('BOTAS') || m.includes('CASCO') || m.includes('DOTACION')) && m.includes('JULIO')) ||
      /JULIO\s+[A-Z]{3,}/.test(m)
    );
    if (!isWorkerJulio) {
      return 'Julio';
    }
  }

  // 5. Agosto
  if (
    m.includes('AGOSTO') ||
    /\bAG\b/.test(m) || 
    /\bAGTO\b/.test(m) || 
    /\bAGO\b/.test(m) ||
    m.includes(' AG ') ||
    m.includes(' AG-') ||
    m.includes(' AG.') ||
    m.includes(' AG/') ||
    m.includes('-AG-') ||
    m.endsWith(' AG') ||
    m.includes(' 28/8') ||
    m.includes(' 27-8') ||
    m.includes(' 29-8') ||
    m.includes(' 31/8') ||
    m.includes(' 31-8') ||
    /\b(1[5-9]|2[0-9]|3[01])[\/-]0?8[\/-]2026/.test(m) ||
    /\b(1[5-9]|2[0-9]|3[01])[\/-]8[\/-]2026/.test(m) ||
    /\b(2[0-9]|3[01])[\/-]8\b/.test(m) ||
    /\b(2[0-9]|3[01])-8\b/.test(m) ||
    m.includes('A DESTIEMPO') ||
    m.includes('DESPACHO ANTERIOR')
  ) {
    return 'Agosto';
  }

  return null;
}

export function getMesFromFecha(fechaStr?: string, nombreMes?: string): string {
  if (nombreMes) {
    const clean = nombreMes.trim();
    if (clean) return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
  }
  if (!fechaStr) return 'Octubre';
  const map: Record<string, string> = {
    '01': 'Enero', '02': 'Febrero', '03': 'Marzo', '04': 'Abril',
    '05': 'Mayo', '06': 'Junio', '07': 'Julio', '08': 'Agosto',
    '09': 'Septiembre', '10': 'Octubre', '11': 'Noviembre', '12': 'Diciembre',
    '1': 'Enero', '2': 'Febrero', '3': 'Marzo', '4': 'Abril',
    '5': 'Mayo', '6': 'Junio', '7': 'Julio', '8': 'Agosto',
    '9': 'Septiembre'
  };
  const f = String(fechaStr).trim();
  if (f.includes('/')) {
    const parts = f.split('/');
    if (parts.length >= 2) {
      const m = parts[1];
      if (map[m]) return map[m];
    }
  } else if (f.includes('-')) {
    const parts = f.split('-');
    if (parts.length >= 2) {
      const m = parts[0].length === 4 ? parts[1] : parts[1];
      if (map[m]) return map[m];
    }
  }
  return 'Octubre';
}

export function isRezagadaDestiempo(r: any, descartadasList?: string[]): boolean {
  if (!r) return false;
  if (descartadasList && isRowDescartada(r, descartadasList)) return false;

  const mesActual = getMesFromFecha(r.fecha, r.nombre_mes).toLowerCase();

  // Si tiene infoReclasificacion con nuevoMes explícito asignado por el usuario
  if (r.infoReclasificacion?.nuevoMes) {
    return r.infoReclasificacion.nuevoMes.trim().toLowerCase() !== mesActual;
  }
  if (r.infoReclasificacion?.motivo && String(r.infoReclasificacion.motivo).toLowerCase().includes('rezagad')) {
    return true;
  }

  // 1. Desfase explícito detectado en fecha vs motivo (requiere que el mes detectado sea diferente al asentado)
  const desfase = detectarDesfaseFechaMotivo(r);
  if (desfase && desfase.tieneDesfase && desfase.mesDetectado) {
    if (desfase.mesDetectado.toLowerCase() !== mesActual) {
      return true;
    }
  }

  // 2. Mes detectado por palabras clave en motivo (SOLO si difiere del mes contable donde está asentado)
  const mesDest = detectarMesRezagada(r);
  if (mesDest && mesDest.toLowerCase() !== mesActual) {
    return true;
  }

  return false;
}

export function clasificarNormalizacion(r: any, descartadasList?: string[]): SubtipoNormalizacion | null {
  if (!r) return null;
  if (descartadasList && isRowDescartada(r, descartadasList)) {
    return null;
  }
  // Si pertenece a la base histórica de Enero a Julio 2026, son ajustes contables viejos
  if (r.nombre_mes && ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio'].includes(r.nombre_mes.toLowerCase())) {
    return 'vieja_historica';
  }
  if (isRezagadaDestiempo(r, descartadasList)) {
    return 'rezagada';
  }
  if (isAjusteNormalizacionOManual(r)) {
    return 'vieja_historica';
  }
  return null;
}

export function resolverCodigoCuentaAuxiliar(rawCta?: string, motivo?: string, desc?: string, solicitante?: string): string {
  const c = (rawCta || '').trim().toUpperCase();
  const m = (motivo || '').toUpperCase();
  const d = (desc || '').toUpperCase();
  const sol = (solicitante || '').toUpperCase();

  if (/^[A-Z]{2,4}-[A-Z0-9]+-[A-Z0-9]+/i.test(c)) {
    return c;
  }

  if (m.includes('TTE-C-0706') || m.includes('1LPP') || m.includes('PLANTA DE PELLAS') || m.includes('PLANTA PELLAS') || m.includes('LINEA 1 PELLAS')) {
    return 'TTE-C-0706';
  }
  if (m.includes('TTE-C-0640') || m.includes('PARRILLA MÓVIL') || m.includes('PARRILLA MOVIL')) {
    return 'TTE-C-0640';
  }
  if (m.includes('TTE-C-0671') || m.includes('2DA LINEA PMH') || m.includes('SEGUNDA LINEA PMH') || m.includes('PMH') || m.includes('DRAVO') || m.includes('TH4') || m.includes('VISCO ORINOCO')) {
    return 'TTE-C-0671';
  }
  if (m.includes('TTE-C-0683') || m.includes('BRIQUETAS') || m.includes('REFORMADOR') || m.includes('CALDERA')) {
    return 'TTE-C-0683';
  }
  if (m.includes('BOCA GRANDE') || m.includes('TTE-C-0655')) {
    return 'TTE-C-0655';
  }
  if (m.includes('IMPSA') || m.includes('TTE-C-0652')) {
    return 'TTE-C-0652';
  }

  switch (c) {
    case 'FABRICACIÓN':
    case 'FABRICACION':
      return 'TT-A-C-505';

    case 'OPERACIONES':
      if (sol.includes('ALBERT') || m.includes('VALENCIA') || m.includes('METAL Y ACERO') || m.includes('FABRICAC')) {
        return 'TT-A-C-505';
      }
      return 'TT-A-C-500';

    case 'ADMINISTRATIVO':
    case 'ADMINISTRACION':
      if (m.includes('REPUESTOS ECO')) return 'EE-A-C-511';
      return 'TT-A-C-200';

    case 'GENERAL (GERENTE, ASISTENTE)':
    case 'GENERAL':
    case 'CUENTA SOCIO':
      return 'TT-A-C-100';

    case 'RECURSOS HUMANOS':
    case 'RRHH':
      if (m.includes('EPP')) return 'TT-A-C-601';
      return 'TT-A-C-600';

    case 'EQUIPO MÓVIL':
    case 'EQUIPO MOVIL': {
      const vehMatch = m.match(/\b(BS\d{2}|VH\d{2}|CH\d{2}|CA\d{2}|GR\d{2}|RM\d{2}|TR\d{2}|MC\d{2})\b/);
      if (vehMatch) {
        const vCode = vehMatch[1];
        if (vCode.startsWith('BS')) return `EEA-C-${vCode}`;
        if (vCode.startsWith('VH')) return `EEE-C-${vCode}`;
        if (vCode.startsWith('GR')) return `EEI-C-${vCode}`;
        if (vCode.startsWith('CH')) return `EEM-C-${vCode}`;
        if (vCode.startsWith('CA')) return `EEM-C-${vCode}`;
        if (vCode.startsWith('RM')) return `EEM-C-${vCode}`;
        if (vCode.startsWith('TR')) return `EEE-C-${vCode}`;
        if (vCode.startsWith('MC')) return `EEE-C-${vCode}`;
      }
      return 'EE-A-C-507';
    }

    case 'PLANIFICACIÓN':
    case 'PLANIFICACION':
      return 'TT-A-C-400';

    case 'PELLAS':
    case 'PELLAS 1':
      return 'TTE-C-0706';

    case 'PMH':
      return 'TTE-C-0671';

    case 'BRIQUETAS':
      return 'TTE-C-0683';

    case 'BOCA GRANDE':
      return 'TTE-C-0655';

    case 'SMB':
      return 'TSI-T-0100';

    case 'IMPSA':
      return 'TTE-C-0652';

    case 'VISCO ORINOCO, C.A.':
    case 'VISCO ORINOCO':
      return 'TTE-C-0671';

    case 'TIMACA':
      if (m.includes('BAÑOS') || m.includes('PORTATILES') || m.includes('ALMACEN') || d.includes('IMPORTACION')) {
        return 'TT-A-C-203';
      }
      return 'TT-I-C-033';

    case 'GASOIL':
    case 'GASOLINA':
    case 'EQUIPOS EXTERNOS':
    case 'MOVILIZACIONES':
      return 'EE-A-C-507';

    default:
      if (c.startsWith('AACO')) return 'EE-A-C-509';
      if (['TL04', 'TL05', 'MSEL', 'PH02', 'PH04', 'PH05', 'SI03', 'HEMA'].includes(c)) return 'EE-A-C-510';
      return c || 'SIN-ASIGNAR';
  }
}

const CUENTAS_INFRA_OFICIALES = [
  'TT-I-C-033', 'TT-G-C-032', 'TT-G-C-034', 'EE-G-C-016', 'SS-G-C-025',
  'TT-A-C-207', 'TT-A-C-208', 'TT-H-C-031', 'TT-H-C-033', 'EE-H-C-015',
  'SS-H-C-024', 'TT-A-C-512', 'TT-A-C-513', 'TT-A-C-514', 'TT-A-C-900'
];

export function determinarTipoGasto(cuenta?: string, tipoCostoExistente?: string): string {
  const c = (cuenta || '').toUpperCase().trim();
  if (!c || c === 'SIN-ASIGNAR' || c === 'SIN_CUENTA') return 'Otros-Otros';

  // 1. Proyectos Externos (Facturables a Clientes Comerciales)
  if (c.startsWith('TTE') || c.startsWith('TSE') || c.startsWith('STE') || c.startsWith('ESE') || c.startsWith('ETE') || c.includes('PELLAS') || c.includes('PMH') || c.includes('BRIQUETAS') || c.includes('BOCA GRANDE') || c.includes('VISCO') || c.includes('SMB-EXT') || c.includes('IMPSA')) {
    return 'Externo';
  }

  // 2. Socio
  if ((c.startsWith('TT-S') && !c.includes('854')) || c.startsWith('AE-S') || c.startsWith('EE-S') || c.startsWith('EES-C-VH') || c.includes('SOCIO')) {
    return 'Socio';
  }

  // 3. Proyectos Internos (Inversiones de Capital y Obras Propias TIMACA)
  if (c.startsWith('TTI') || c.startsWith('TSI') || c.startsWith('STI') || c.startsWith('ESI')) {
    return 'Interno';
  }

  // 4. Mantenimiento de Infraestructura y Planta (OPEX)
  // DEBE evaluarse ANTES de Flota (EE) y Admon (TT-A) para que galpones y herramientas no se mezclen
  if (
    CUENTAS_INFRA_OFICIALES.includes(c) ||
    c.startsWith('TT-I') || c.startsWith('TF-I') ||
    c.startsWith('TT-G') || c.startsWith('EE-G') || c.startsWith('SS-G') ||
    c.startsWith('TT-H') || c.startsWith('EE-H') || c.startsWith('SS-H') ||
    c.includes('INFRAESTRUCTURA') || c.includes('GALPON') || c.includes('HERRAMIENTA') || c.includes('ADECUACION')
  ) {
    return 'Mantto Infraestructura (OPEX)';
  }

  // 5. Administración y Departamentos de Soporte
  if (c.startsWith('TT-A') || c.startsWith('AE-A') || c.startsWith('EE-A') || c.startsWith('SS-A') || c.startsWith('AEA-') || c.includes('ADMON') || c.includes('ADMIN') || c.includes('RECURSOS HUMANOS') || c.includes('GERENTE') || c.includes('PLANIFICAC')) {
    return 'Admon';
  }

  // 6. Equipos Móviles, Maquinaria, Grúas y Flota (OPEX)
  if (c.startsWith('EE') || c.startsWith('TT-F') || c.startsWith('TF-') || c.includes('FLOTA') || c.includes('EQUIPO M') || c.includes('GRUA') || c.includes('CAMION') || c.includes('MONTACARGA') || c.includes('AUTOBUS') || c.includes('CHUTO') || c.includes('REMOLQUE')) {
    return 'Mantto Flota (OPEX)';
  }

  if (tipoCostoExistente && tipoCostoExistente !== 'Externo' && tipoCostoExistente !== 'Interno' && tipoCostoExistente !== 'OPEX') {
    return tipoCostoExistente;
  }

  return tipoCostoExistente === 'OPEX' ? 'Mantto Infraestructura (OPEX)' : (tipoCostoExistente || 'Otros-Otros');
}

// Caché en memoria para las sábanas SIP del Master Unificado (evita re-descargas y congelamientos)
const masterStaticCache = new Map<string, any[]>();
let isLanApiAvailable: boolean | null = null;
let cachedReclasificaciones: any[] | null = null;
let reclasificacionesLoadingPromise: Promise<any[]> | null = null;

const ANTI_CACHE_HEADERS = {
  'Cache-Control': 'no-cache, no-store, must-revalidate, proxy-revalidate, max-age=0',
  'Pragma': 'no-cache',
  'Expires': '0'
};

export function clearReclasificacionesCache() {
  cachedReclasificaciones = null;
  reclasificacionesLoadingPromise = null;
}

export function clearMasterStaticCache() {
  masterStaticCache.clear();
  clearReclasificacionesCache();
}

export async function getReclasificacionesData(forceRefresh = false): Promise<any[]> {
  if (forceRefresh) {
    clearReclasificacionesCache();
  }
  if (cachedReclasificaciones && cachedReclasificaciones.length > 0) {
    return cachedReclasificaciones;
  }
  if (reclasificacionesLoadingPromise) {
    return reclasificacionesLoadingPromise;
  }
  reclasificacionesLoadingPromise = (async () => {
    try {
      const res = await fetch(`/data/sip/reclasificaciones.json?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: ANTI_CACHE_HEADERS
      });
      if (res.ok) {
        cachedReclasificaciones = await res.json();
        return cachedReclasificaciones || [];
      }
    } catch (e) {
      console.warn('Error cargando reclasificaciones.json', e);
    } finally {
      reclasificacionesLoadingPromise = null;
    }
    return cachedReclasificaciones || [];
  })();
  return reclasificacionesLoadingPromise;
}

export async function loadStaticMasterItems(mesKey: string, isVerAjustesHistoricos: boolean, forceRefresh = false): Promise<any[]> {
  const cacheKey = `${mesKey || 'todos'}_${isVerAjustesHistoricos}`;
  if (forceRefresh) {
    masterStaticCache.delete(cacheKey);
  }
  if (masterStaticCache.has(cacheKey) && !forceRefresh) {
    return [...masterStaticCache.get(cacheKey)!];
  }

  let items: any[] = [];
  const lowerMes = (mesKey || 'todos').toLowerCase();
  const querySuffix = `_t=${Date.now()}`;

  if (isVerAjustesHistoricos) {
    const res = await fetch(`/data/sip/ajustes_historicos_2026.json?${querySuffix}`, {
      cache: 'no-store',
      headers: ANTI_CACHE_HEADERS
    });
    if (res.ok) {
      const d = await res.json();
      items = d.items || [];
      if (lowerMes !== 'todos') {
        items = items.filter((r: any) => (r.nombre_mes || '').toLowerCase() === lowerMes);
      }
    }
  } else if (lowerMes === 'todos') {
    // CARGAR Y CONSOLIDAR REGISTROS OPERATIVOS DE TODOS LOS MESES
    try {
      const mesesConsolidados = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
      const responses = await Promise.all(mesesConsolidados.map(m => fetch(`/data/sip/unificada_${m}.json?${querySuffix}`, {
        cache: 'no-store',
        headers: ANTI_CACHE_HEADERS
      })));
      const dataSets = await Promise.all(responses.map(r => r.ok ? r.json() : { items: [] }));
      items = dataSets.flatMap(d => d.items || []);
    } catch (e) {
      const resFallback = await fetch(`/data/sip/unificada_septiembre.json?${querySuffix}`, {
        cache: 'no-store',
        headers: ANTI_CACHE_HEADERS
      });
      if (resFallback.ok) {
        const d = await resFallback.json();
        items = d.items || [];
      }
    }
  } else {
    // CARGAR ARCHIVO DEDICADO DEL MES SELECCIONADO (Ene, Feb, Mar, Abr, May, Jun, Jul, Ago, Sep, Oct, Nov, Dic)
    try {
      const res = await fetch(`/data/sip/unificada_${lowerMes}.json?${querySuffix}`, {
        cache: 'no-store',
        headers: ANTI_CACHE_HEADERS
      });
      if (res.ok) {
        const d = await res.json();
        items = d.items || [];
      } else {
        const resFallback = await fetch(`/data/sip/unificada_septiembre.json?${querySuffix}`, {
          cache: 'no-store',
          headers: ANTI_CACHE_HEADERS
        });
        if (resFallback.ok) {
          const d = await resFallback.json();
          items = d.items || [];
        }
      }
    } catch (e) {
      const resFallback = await fetch(`/data/sip/unificada_septiembre.json?${querySuffix}`, {
        cache: 'no-store',
        headers: ANTI_CACHE_HEADERS
      });
      if (resFallback.ok) {
        const d = await resFallback.json();
        items = d.items || [];
      }
    }
  }

  // Normalizar cuentas auxiliares para asegurar que nunca aparezcan palabras como OPERACIONES, FABRICACION, TIMACA
  items = items.map((it: any) => {
    const raw = it.cuenta_aux || it.cuentaAuxiliar || '';
    const resolved = resolverCodigoCuentaAuxiliar(raw, it.motivo, it.descripcion, it.solicitante);
    if (resolved && resolved !== raw) {
      return {
        ...it,
        cuenta_aux_original: it.cuenta_aux_original || raw,
        cuenta_aux: resolved,
        cuentaAuxiliar: resolved
      };
    }
    return it;
  });

  masterStaticCache.set(cacheKey, items);
  return [...items];
}

export function MasterUnificadoSipView({ currentUser }: { currentUser?: any }) {
  const [activeTab, setActiveTab] = useState<'unificada' | 'matriz' | 'consumos' | 'compras' | 'correcciones' | 'cargas' | 'alertas'>('unificada');
  const [status, setStatus] = useState<Status | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Data states
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [consumos, setConsumos] = useState<Consumo[]>([]);
  const [compras, setCompras] = useState<Compra[]>([]);
  const [reclasificaciones, setReclasificaciones] = useState<any[]>([]);
  const [matrizData, setMatrizData] = useState<{
    periodo: string;
    totalMateriales: number;
    totalServicios: number;
    granTotal: number;
    proyectos: Proyecto[];
  } | null>(null);

  const [selectedAno, setSelectedAno] = useState<string>('2026');
  const [selectedMes, setSelectedMes] = useState<string>(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('TIMACA_MASTER_SELECTED_MES') : null;
      return saved || 'noviembre';
    } catch {
      return 'noviembre';
    }
  });
  const [fechaDesde, setFechaDesde] = useState<string>('');
  const [fechaHasta, setFechaHasta] = useState<string>('');

  const formatDateDisplay = (isoStr: string) => {
    if (!isoStr) return '';
    const parts = isoStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return isoStr;
  };

  const getRangeDisplay = () => {
    if (fechaDesde && fechaHasta) {
      return `${formatDateDisplay(fechaDesde)} al ${formatDateDisplay(fechaHasta)}`;
    } else if (fechaDesde) {
      return `Desde ${formatDateDisplay(fechaDesde)}`;
    } else if (fechaHasta) {
      return `Hasta ${formatDateDisplay(fechaHasta)}`;
    }
    return '';
  };
  const [selectedCta, setSelectedCta] = useState<string>('TODAS');
  const [selectedTipo, setSelectedTipo] = useState<string>('TODOS');
  const [selectedClasificacion, setSelectedClasificacion] = useState<string>('TODAS');
  const [selectedCategoria, setSelectedCategoria] = useState<string>('TODAS');
  const [filterNormalizacion, setFilterNormalizacion] = useState<
    'operativos' | 'todos' | 'rezagadas' | 'ajustes_historicos' | 'viejas_historicas' | 'operativas_campo' | 'todas_normalizaciones'
  >('operativos');
  const [filterRezagadaSubmes, setFilterRezagadaSubmes] = useState<string>('todos');
  const [filterEstadoRezagada, setFilterEstadoRezagada] = useState<'pendientes' | 'corregidos' | 'descartadas' | 'todos'>('pendientes');
  const [rezagadasDescartadas, setRezagadasDescartadas] = useState<string[]>(() => {
    try {
      const s = typeof window !== 'undefined' ? localStorage.getItem('timaca_rezagadas_descartadas') : null;
      return s ? JSON.parse(s) : [];
    } catch { return []; }
  });
  const [inputProyecto, setInputProyecto] = useState<string>('');
  const [showProjectSuggestions, setShowProjectSuggestions] = useState<boolean>(false);
  const [searchMaster, setSearchMaster] = useState<string>('');
  const [pageMaster, setPageMaster] = useState<number>(1);
  const [limitMaster, setLimitMaster] = useState<number>(100);
  const [sortMasterBy, setSortMasterBy] = useState<string>('total_usd');
  const [sortMasterOrder, setSortMasterOrder] = useState<'asc' | 'desc'>('desc');

  const [masterRows, setMasterRows] = useState<MasterRow[]>([]);
  const [masterTotales, setMasterTotales] = useState<{
    total_count: number;
    gran_total: number;
    mat_total: number;
    serv_total: number;
    mdo_total: number;
    hm_total: number;
    ind_total: number;
    ext_total?: number;
    int_total?: number;
    opex_total?: number;
    norm_total?: number;
    norm_count?: number;
    norm_rezagadas_total?: number;
    norm_rezagadas_count?: number;
    rezagadas_pendientes_count?: number;
    rezagadas_corregidas_count?: number;
    rezagadas_descartadas_count?: number;
    rezagadas_octubre_count?: number;
    rezagadas_octubre_total?: number;
    rezagadas_octubre_pendientes_count?: number;
    rezagadas_octubre_corregidas_count?: number;
    rezagadas_agosto_count?: number;
    rezagadas_agosto_total?: number;
    rezagadas_agosto_pendientes_count?: number;
    rezagadas_agosto_corregidas_count?: number;
    rezagadas_junio_count?: number;
    rezagadas_junio_total?: number;
    rezagadas_junio_pendientes_count?: number;
    rezagadas_junio_corregidas_count?: number;
    rezagadas_julio_count?: number;
    rezagadas_julio_total?: number;
    rezagadas_julio_pendientes_count?: number;
    rezagadas_julio_corregidas_count?: number;
    norm_viejas_total?: number;
    norm_viejas_count?: number;
  }>({
    total_count: 0,
    gran_total: 0,
    mat_total: 0,
    serv_total: 0,
    mdo_total: 0,
    hm_total: 0,
    ind_total: 0,
    ext_total: 0,
    int_total: 0,
    opex_total: 0,
    norm_total: 0,
    norm_count: 0,
    norm_rezagadas_total: 0,
    norm_rezagadas_count: 0,
    rezagadas_pendientes_count: 0,
    rezagadas_corregidas_count: 0,
    rezagadas_descartadas_count: 0,
    rezagadas_octubre_count: 0,
    rezagadas_octubre_total: 0,
    rezagadas_octubre_pendientes_count: 0,
    rezagadas_octubre_corregidas_count: 0,
    rezagadas_agosto_count: 0,
    rezagadas_agosto_total: 0,
    rezagadas_agosto_pendientes_count: 0,
    rezagadas_agosto_corregidas_count: 0,
    rezagadas_junio_count: 0,
    rezagadas_junio_total: 0,
    rezagadas_junio_pendientes_count: 0,
    rezagadas_junio_corregidas_count: 0,
    rezagadas_julio_count: 0,
    rezagadas_julio_total: 0,
    rezagadas_julio_pendientes_count: 0,
    rezagadas_julio_corregidas_count: 0,
    norm_viejas_total: 0,
    norm_viejas_count: 0
  });
  const [topCuentas, setTopCuentas] = useState<Array<{ cuenta_aux: string; datos_descripcion: string; total: number; rows: number }>>([]);
  const [catalogFiltros, setCatalogFiltros] = useState<{
    anos: number[];
    meses: Array<{ nombre_mes: string; count: number; total: number }>;
    tipos: string[];
    clasificaciones: string[];
    cuentas: Array<{ cuenta_aux: string; datos_descripcion: string; datos_tipo_costo?: string; count: number; total: number }>;
    categorias?: Array<{ categoria: string; count: number; total: number }>;
    categorias_consumos?: string[];
    categorias_compras?: string[];
  }>({
    anos: [2026, 2025, 2024],
    meses: [],
    tipos: [],
    clasificaciones: [],
    cuentas: [],
    categorias: [],
    categorias_consumos: [],
    categorias_compras: []
  });
  const [isLoadingMaster, setIsLoadingMaster] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Filters for Consumos SIP
  const [searchConsumos, setSearchConsumos] = useState('');
  const [filterMesConsumos, setFilterMesConsumos] = useState('todos');
  const [filterCatConsumos, setFilterCatConsumos] = useState('TODAS');
  const [filterCtaConsumos, setFilterCtaConsumos] = useState('TODAS');
  const [pageConsumos, setPageConsumos] = useState(1);
  const [totalConsumosCount, setTotalConsumosCount] = useState(0);
  const [totalConsumosUSD, setTotalConsumosUSD] = useState(0);
  const [isLoadingConsumos, setIsLoadingConsumos] = useState(false);

  // Filters for Compras y Servicios SIP
  const [searchCompras, setSearchCompras] = useState('');
  const [filterMesCompras, setFilterMesCompras] = useState('todos');
  const [filterCatCompras, setFilterCatCompras] = useState('TODAS');
  const [filterTipoCompras, setFilterTipoCompras] = useState('TODOS');
  const [pageCompras, setPageCompras] = useState(1);
  const [totalComprasCount, setTotalComprasCount] = useState(0);
  const [totalComprasUSD, setTotalComprasUSD] = useState(0);
  const [isLoadingCompras, setIsLoadingCompras] = useState(false);

  const [searchMatriz, setSearchMatriz] = useState('');
  const [filterTipoMatriz, setFilterTipoMatriz] = useState<'TODOS' | 'EXTERNOS' | 'INTERNOS'>('TODOS');

  // Módulo de Correcciones States
  const [searchMovimiento, setSearchMovimiento] = useState('');
  const [filtroEstadoCorreccion, setFiltroEstadoCorreccion] = useState<'todos' | 'pendientes' | 'corregidos' | 'consumos' | 'compras'>('todos');
  const [selectedMovimiento, setSelectedMovimiento] = useState<{
    id: string;
    tipo: 'consumo' | 'compra';
    documento: string;
    numero?: string;
    pedido?: string;
    dp?: string;
    pa?: string;
    sc?: string;
    oc?: string;
    fecha: string;
    codigo: string;
    descripcion: string;
    categoria: string;
    cantidad?: number;
    unidad?: string;
    costoUnitario?: number;
    totalUSD: number;
    cuentaAuxiliar: string;
    cuentaAuxiliarOriginal: string;
    esReclasificado: boolean;
    infoReclasificacion?: any;
    solicitante?: string;
    solicitanteOComprador?: string;
    motivo: string;
  } | null>(null);
  const [correccionNuevaCuenta, setCorreccionNuevaCuenta] = useState('');
  const [correccionNuevoProyecto, setCorreccionNuevoProyecto] = useState('');
  const [correccionNuevoMes, setCorreccionNuevoMes] = useState('Agosto');
  const [correccionMotivo, setCorreccionMotivo] = useState('');

  // Lista unificada de todas las cuentas auxiliares y sus proyectos asociados
  const todasLasCuentasDisponibles = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of proyectos) {
      if (p.codigo) map.set(p.codigo.toUpperCase().trim(), p.nombre || '');
    }
    if (catalogFiltros?.cuentas) {
      for (const c of catalogFiltros.cuentas) {
        const code = (c.cuenta_aux || '').toUpperCase().trim();
        if (code && !map.has(code)) {
          map.set(code, c.datos_descripcion || '');
        }
      }
    }
    return Array.from(map.entries())
      .map(([codigo, nombre]) => ({ codigo, nombre }))
      .sort((a, b) => a.codigo.localeCompare(b.codigo));
  }, [proyectos, catalogFiltros]);

  const getDescripcionProyecto = (cuentaCode: string): string => {
    const cClean = (cuentaCode || '').trim().toUpperCase();
    if (!cClean) return '';
    // 1. En proyectos
    const foundP = proyectos.find(p => (p.codigo || '').toUpperCase().trim() === cClean);
    if (foundP && foundP.nombre) return foundP.nombre;
    // 2. En catalogFiltros.cuentas
    const foundC = catalogFiltros?.cuentas?.find(c => (c.cuenta_aux || '').toUpperCase().trim() === cClean);
    if (foundC && foundC.datos_descripcion) return foundC.datos_descripcion;
    return '';
  };

  const handleNuevaCuentaChange = (rawVal: string) => {
    let code = rawVal;
    if (rawVal.includes(' - ')) {
      code = rawVal.split(' - ')[0].trim();
    }
    code = code.trim().toUpperCase();
    setCorreccionNuevaCuenta(code);

    const desc = getDescripcionProyecto(code);
    if (desc) {
      setCorreccionNuevoProyecto(desc);
    }
  };
  const [candidateMovimientos, setCandidateMovimientos] = useState<any[]>([]);
  const [isSearchingMovimientos, setIsSearchingMovimientos] = useState(false);
  const [isSavingCorreccion, setIsSavingCorreccion] = useState(false);
  const [correccionMessage, setCorreccionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isCorreccionModalOpen, setIsCorreccionModalOpen] = useState(false);
  const [globalToast, setGlobalToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // States for Historial de Correcciones (auditoría de las 447 correcciones)
  const [searchHistorialCorrecciones, setSearchHistorialCorrecciones] = useState('');
  const [filtroTipoHistorial, setFiltroTipoHistorial] = useState<'todos' | 'mis_recientes' | 'historicas' | 'recientes' | 'consumos' | 'compras' | 'rezagadas' | 'valorizaciones_pellas' | 'pellas_todas'>('todos');
  const [pageReclasificaciones, setPageReclasificaciones] = useState(1);

  // States for Cargas de Insumos al Cierre (MDO, HM & Costos Indirectos)
  const [archivosCargas, setArchivosCargas] = useState<{ mdo: any[]; hm: any[]; indirectos: any[] }>({ mdo: [], hm: [], indirectos: [] });
  const [activeSubCarga, setActiveSubCarga] = useState<'mdo' | 'hm' | 'indirectos'>('mdo');
  const [searchCargas, setSearchCargas] = useState('');

  const fetchArchivosCargas = async () => {
    try {
      const res = await fetch('/data/sip/archivos_cargas.json');
      if (res.ok) setArchivosCargas(await res.json());
    } catch (e) {}
  };

  // Initial loads
  useEffect(() => {
    fetchStatus();
    fetchProyectos();
    fetchMatriz();
    fetchCatalogFiltros();
    fetchReclasificaciones();
  }, []);

  // Fetch tab-specific data
  useEffect(() => {
    if (activeTab === 'unificada') fetchMasterData();
    if (activeTab === 'consumos') fetchConsumos();
    if (activeTab === 'compras') fetchCompras();
    if (activeTab === 'correcciones') fetchReclasificaciones();
    if (activeTab === 'matriz') fetchMatriz();
    if (activeTab === 'cargas') fetchArchivosCargas();
  }, [activeTab]);

  // Refetch consumos whenever its filters change
  useEffect(() => {
    if (activeTab === 'consumos') {
      fetchConsumos();
    }
  }, [activeTab, filterMesConsumos, filterCatConsumos, filterCtaConsumos, fechaDesde, fechaHasta, pageConsumos]);

  useEffect(() => {
    if (activeTab !== 'consumos') return;
    const timer = setTimeout(() => {
      fetchConsumos();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchConsumos]);

  // Refetch compras whenever its filters change
  useEffect(() => {
    if (activeTab === 'compras') {
      fetchCompras();
    }
  }, [activeTab, filterMesCompras, filterCatCompras, filterTipoCompras, fechaDesde, fechaHasta, pageCompras]);

  useEffect(() => {
    if (activeTab !== 'compras') return;
    const timer = setTimeout(() => {
      fetchCompras();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchCompras]);

  // Refetch master unificado whenever filters change
  useEffect(() => {
    if (activeTab === 'unificada') {
      fetchMasterData();
    }
  }, [selectedAno, selectedMes, selectedCta, selectedTipo, selectedClasificacion, selectedCategoria, filterNormalizacion, filterRezagadaSubmes, filterEstadoRezagada, fechaDesde, fechaHasta, sortMasterBy, sortMasterOrder, pageMaster, limitMaster]);

  // Refetch filter catalogs when selected year changes
  useEffect(() => {
    fetchCatalogFiltros(selectedAno);
  }, [selectedAno]);

  // Debounced search for Master Unificado (text and project)
  useEffect(() => {
    if (activeTab !== 'unificada') return;
    const timer = setTimeout(() => {
      fetchMasterData();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchMaster, inputProyecto]);

  const handleSortMaster = (colKey: string) => {
    if (sortMasterBy === colKey) {
      setSortMasterOrder(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      setSortMasterBy(colKey);
      setSortMasterOrder('desc'); // default mayor a menor
    }
    setPageMaster(1);
  };

  const fetchStatus = async () => {
    let st: any = null;
    const queryBuster = `_t=${Date.now()}`;
    try {
      const res = await fetch(`/api/status?${queryBuster}`, { 
        cache: 'no-store',
        headers: ANTI_CACHE_HEADERS,
        signal: AbortSignal.timeout(1500) 
      });
      if (res.ok) st = await res.json();
    } catch (e) {}
    if (!st) {
      try {
        const res = await fetch(`/data/sip/status.json?${queryBuster}`, { 
          cache: 'no-store',
          headers: ANTI_CACHE_HEADERS
        });
        if (res.ok) st = await res.json();
      } catch (e) {}
    }
    if (st) {
      st.totalReclasificaciones = Math.max(st.totalReclasificaciones || 0, 4138);
      setStatus(st);
    }
  };

  const fetchCatalogFiltros = async (targetAno?: string) => {
    const a = targetAno || selectedAno || '2026';
    const queryBuster = `_t=${Date.now()}`;
    try {
      const res = await fetch(`/api/filtros?ano=${encodeURIComponent(a)}&${queryBuster}`, { 
        cache: 'no-store',
        headers: ANTI_CACHE_HEADERS,
        signal: AbortSignal.timeout(2000) 
      });
      if (res.ok) { setCatalogFiltros(await res.json()); return; }
    } catch (e) {}
    try {
      const res = await fetch(`/data/sip/filtros_2026.json?${queryBuster}`, {
        cache: 'no-store',
        headers: ANTI_CACHE_HEADERS
      });
      if (res.ok) setCatalogFiltros(await res.json());
    } catch (e) {}
  };

  const fetchMasterData = async () => {
    setIsLoadingMaster(true);
    try {
      const params = new URLSearchParams({
        ano: selectedAno,
        mes: selectedMes,
        cta: selectedCta,
        tipo: selectedTipo,
        clasificacion: selectedClasificacion,
        categoria: selectedCategoria,
        proyecto: inputProyecto,
        search: searchMaster,
        normalizacion: filterNormalizacion,
        sort_by: sortMasterBy,
        order: sortMasterOrder,
        page: pageMaster.toString(),
        limit: limitMaster.toString(),
        _t: Date.now().toString()
      });
      if (fechaDesde) params.set('fecha_desde', fechaDesde);
      if (fechaHasta) params.set('fecha_hasta', fechaHasta);
      let res = null;
      if (isLanApiAvailable !== false) {
        try {
          res = await fetch('/api/unificada?' + params.toString(), { 
            cache: 'no-store',
            headers: ANTI_CACHE_HEADERS,
            signal: AbortSignal.timeout(2000) 
          });
          if (!res.ok) isLanApiAvailable = false;
        } catch (e) {
          isLanApiAvailable = false;
        }
      }
      if (res && res.ok) {
        const data = await res.json();
        setMasterRows(data.items || []);
        if (data.totales) setMasterTotales(data.totales);
        if (data.top_cuentas) setTopCuentas(data.top_cuentas);
      } else {
        const isVerAjustesHistoricos = filterNormalizacion === 'ajustes_historicos' || filterNormalizacion === 'viejas_historicas';
        let items: any[] = await loadStaticMasterItems(selectedMes, isVerAjustesHistoricos, true);

          // Si estamos revisando Ajustes Históricos (2.553 registros de Enero a Julio), filtrar por mes si se seleccionó uno
          if (isVerAjustesHistoricos) {
            if (selectedMes !== 'todos') {
              items = items.filter((r: any) => (r.nombre_mes || '').toLowerCase() === selectedMes.toLowerCase());
            }
          }

          // Combinar correcciones de reclasificaciones.json y locales de localStorage para reflejarlas en vivo
          try {
            const baseList: any[] = await getReclasificacionesData();

            const localStr = typeof window !== 'undefined' ? localStorage.getItem('timaca_correcciones_locales') : null;
            const localList = localStr ? JSON.parse(localStr) : [];
            const combinedList = [...baseList, ...localList];

            if (combinedList.length > 0) {
              const corrMap = new Map<string, any>();
              for (const c of combinedList) {
                const doc = String(c.documento || '').trim().toUpperCase();
                const cod = String(c.codigo || '').trim().toUpperCase();
                const k1 = c.recordId ? String(c.recordId).trim() : null;
                const sol = String(c.solicitud || '').trim().toUpperCase();
                const ped = String(c.pedido || '').trim().toUpperCase();

                if (k1 && !k1.startsWith('HIST-SERV--')) {
                  corrMap.set(k1, c);
                  corrMap.set(k1.toUpperCase(), c);
                }
                if (doc && cod) corrMap.set(`${doc}-${cod}`, c);
                if (doc) corrMap.set(doc, c);
                if (sol && cod) corrMap.set(`${sol}-${cod}`, c);
                if (sol) corrMap.set(sol, c);
                if (ped && cod) corrMap.set(`${ped}-${cod}`, c);
                if (ped) corrMap.set(ped, c);

                if (k1 && k1.startsWith('COMP-')) {
                  const parts = k1.split('-');
                  if (parts.length >= 4) {
                    const pSC = parts[1].toUpperCase();
                    const pOC = parts[2].toUpperCase();
                    const pCod = parts[3].toUpperCase();
                    if (pSC && pSC !== 'NOSC') {
                      corrMap.set(pSC, c);
                      corrMap.set(`${pSC}-${pCod}`, c);
                    }
                    if (pOC && pOC !== 'NOOC') {
                      corrMap.set(pOC, c);
                      corrMap.set(`${pOC}-${pCod}`, c);
                    }
                  }
                }
              }

              // 1. Actualizar registros existentes en la sábana cargada (mes, cuenta, proyecto, tipo de gasto)
              items = items.map((r: any) => {
                const doc = String(r.numero || '').trim().toUpperCase();
                const ped = String(r.pedido || '').trim().toUpperCase();
                const sc = String(r.sc || '').trim().toUpperCase();
                const oc = String(r.oc || '').trim().toUpperCase();
                const cod = String(r.codigo || '').trim().toUpperCase();
                const k1 = r.id != null ? String(r.id) : null;
                const candidate = 
                  (k1 && corrMap.get(k1)) ||
                  (k1 && corrMap.get(k1.toUpperCase())) ||
                  (doc && cod && corrMap.get(`${doc}-${cod}`)) ||
                  (ped && cod && corrMap.get(`${ped}-${cod}`)) ||
                  (sc && cod && corrMap.get(`${sc}-${cod}`)) ||
                  (oc && cod && corrMap.get(`${oc}-${cod}`)) ||
                  (doc && corrMap.get(doc)) ||
                  (ped && corrMap.get(ped)) ||
                  (sc && corrMap.get(sc)) ||
                  (oc && corrMap.get(oc));

                let match = null;
                if (candidate) {
                  const candDoc = String(candidate.documento || candidate.numero || candidate.sc || candidate.oc || '').trim().toUpperCase();
                  const candTipo = String(candidate.tipoItem || candidate.tipo || '').toLowerCase();
                  const rowTipo = String(r.tipo || '').toLowerCase();

                  // 1. Coincidencia exacta por ID o por documento+código: match directo garantizado
                  const isExactId = !!(k1 && candidate.recordId && String(candidate.recordId).trim().toUpperCase() === k1.toUpperCase());
                  const isExactDocCod = !!(doc && cod && candDoc === doc && String(candidate.codigo || '').trim().toUpperCase() === cod);

                  if (isExactId || isExactDocCod) {
                    match = candidate;
                  } else {
                    const docMatches = !candDoc || candDoc === doc || candDoc === ped || candDoc === sc || candDoc === oc;
                    const tipoMatches = !candTipo || (candTipo.includes('serv') ? rowTipo.includes('serv') : (candTipo.includes('mat') ? rowTipo.includes('mat') : true));

                    if (docMatches && tipoMatches) {
                      match = candidate;
                    }
                  }
                }

                if (match) {
                  const targetCuenta = (match.nuevaCuenta || r.cuenta_aux || '').toUpperCase().trim();
                  const targetDesc = match.nuevoProyecto || r.datos_descripcion;
                  const targetTipoCosto = determinarTipoGasto(targetCuenta, match.datos_tipo_costo || r.datos_tipo_costo);
                  const targetMes = match.nuevoMes ? match.nuevoMes.toLowerCase() : r.nombre_mes;

                  const isValorizacionZero = String(match.motivo || '').toLowerCase().includes('valorizaci') || Number(r.precio_final || 0) === 0;
                  const newPrecio = isValorizacionZero && (match.precio_final ?? match.costoUnitario) != null 
                    ? Number(match.precio_final ?? match.costoUnitario) 
                    : r.precio_final;
                  const newTotal = isValorizacionZero && (match.precio_final ?? match.costoUnitario) != null
                    ? (newPrecio * (Number(r.cantidad) || 1))
                    : r.total_usd;

                  return {
                    ...r,
                    esReclasificado: true,
                    cuenta_aux_original: r.cuenta_aux_original || r.cuenta_aux,
                    cuenta_aux: targetCuenta,
                    datos_descripcion: targetDesc,
                    datos_tipo_costo: targetTipoCosto,
                    nombre_mes: targetMes,
                    precio_final: newPrecio,
                    total_usd: newTotal,
                    ajuste: 'CORREGIDO',
                    infoReclasificacion: match
                  };
                }
                return r;
              });

              // Si se selecciona un mes específico, filtrar para que movimientos trasladados a otro mes no se queden en este
              // PERO si estamos auditando 'rezagadas', mantenerlos para ver estadísticas de 'Ya Corregidos' vs 'Solo Pendientes'
              if (selectedMes !== 'todos' && !isVerAjustesHistoricos && filterNormalizacion !== 'rezagadas') {
                items = items.filter((r: any) => (r.nombre_mes || '').toLowerCase() === selectedMes.toLowerCase());
              }

              // 2. Si se selecciona un mes específico (ej. Agosto, Junio, Julio, Octubre):
              // Trasladar a este mes los registros corregidos que fueron asignados a él desde otro mes (solo del año 2026)
              if (selectedMes !== 'todos' && !isVerAjustesHistoricos) {
                const matchingTransfers = combinedList.filter((c: any) => 
                  (c.nuevoMes || '').toLowerCase() === selectedMes.toLowerCase() &&
                  (!c.fechaMovimiento || c.fechaMovimiento.startsWith('2026') || c.ano === 2026 || (c.fecha && String(c.fecha).includes('2026')))
                );

                if (matchingTransfers.length > 0) {
                  const existingKeys = new Set(items.map((x: any) => x.id != null ? String(x.id) : `${x.numero}-${x.codigo}`));
                  const existingDocs = new Set(items.map((x: any) => x.numero));

                  // Traer registros de los meses de origen (Septiembre, Noviembre, etc.) para reconstruir las columnas oficiales
                  let sourceMaps = new Map<string, any>();
                  try {
                    const sourceMonths = Array.from(new Set([
                      'septiembre', 
                      'noviembre', 
                      ...matchingTransfers.map((c: any) => (c.mesOrigen || '').toLowerCase()).filter(Boolean)
                    ]));
                    for (const sm of sourceMonths) {
                      const resSrc = await fetch(`/data/sip/unificada_${sm}.json?_t=${Date.now()}`, {
                        cache: 'no-store',
                        headers: ANTI_CACHE_HEADERS
                      });
                      if (resSrc.ok) {
                        const dSrc = await resSrc.json();
                        for (const s of (dSrc.items || [])) {
                          if (s.id != null) sourceMaps.set(String(s.id), s);
                          if (s.numero && s.codigo) sourceMaps.set(`${s.numero}-${s.codigo}`, s);
                          if (s.numero) sourceMaps.set(String(s.numero), s);
                        }
                      }
                    }
                  } catch (e) {}

                  for (const c of matchingTransfers) {
                    const k1 = c.recordId != null ? String(c.recordId) : null;
                    const k2 = `${c.documento}-${c.codigo}`;
                    const doc = c.documento;

                    // Si el registro proviene originalmente de este mismo mes, no agregarlo como traslado (ya pertenece a la base)
                    if ((c.mesOrigen || '').toLowerCase() === selectedMes.toLowerCase()) {
                      continue;
                    }

                    // Si ya existe en la lista de este mes, no duplicar bajo ninguna circunstancia
                    if ((k1 && existingKeys.has(k1)) || existingKeys.has(k2) || (doc && existingDocs.has(doc))) {
                      continue;
                    }

                    const orig = (k1 && sourceMaps.get(k1)) || sourceMaps.get(k2) || (doc && sourceMaps.get(String(doc)));
                    const targetCuenta = (c.nuevaCuenta || orig?.cuenta_aux || '').toUpperCase().trim();
                    const targetDesc = c.nuevoProyecto || c.proyectoAnterior || orig?.datos_descripcion || '';
                    const targetTipoCosto = determinarTipoGasto(targetCuenta, c.datos_tipo_costo || orig?.datos_tipo_costo);

                    let targetFecha = c.fechaConsumoReal || orig?.fechaConsumoReal;
                    if (!targetFecha) {
                      const desfase = orig ? detectarDesfaseFechaMotivo(orig) : null;
                      if (desfase && desfase.fechaTexto && desfase.fechaTexto.includes('/')) {
                        const [d, m, y] = desfase.fechaTexto.split('/');
                        targetFecha = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
                      } else {
                        targetFecha = c.fechaMovimiento || (selectedMes === 'octubre' ? '2026-10-31' : '2026-08-31');
                      }
                    }

                    const baseRow = orig ? { ...orig } : {
                      tipo: c.tipoItem || 'Materiales Directos',
                      almacen: c.almacen || 'ALMPEI',
                      fecha: targetFecha,
                      numero: c.documento,
                      pedido: c.pedido || '',
                      cuenta_aux: targetCuenta,
                      ceco: c.ceco || 'MON-3',
                      codigo: c.codigo,
                      descripcion: c.descripcion,
                      cantidad: c.cantidad || 1,
                      unidad: c.unidad || 'UND',
                      solicitante: c.solicitante || orig?.solicitante || 'S/D',
                      motivo: c.motivo || `Consumo rezagado transferido a ${c.nuevoMes}`,
                      categoria: c.categoria || 'Productos Metalicos Estructurales',
                      precio_final: c.costoUnitario || c.precio_final || (c.cantidad ? (Number(c.totalUSD) / c.cantidad) : Number(c.totalUSD)) || 0,
                      total_usd: Number(c.totalUSD) || 0,
                      datos_descripcion: targetDesc,
                      datos_tipo_costo: targetTipoCosto,
                      ano: 2026,
                      nombre_mes: selectedMes.toLowerCase()
                    };

                    items.push({
                      ...baseRow,
                      id: c.recordId || `trasladado-${c.documento}-${c.codigo}`,
                      cuenta_aux_original: c.cuentaAnterior || baseRow.cuenta_aux,
                      cuenta_aux: targetCuenta,
                      datos_descripcion: targetDesc,
                      datos_tipo_costo: targetTipoCosto,
                      nombre_mes: selectedMes.toLowerCase(),
                      ajuste: 'CORREGIDO',
                      esReclasificado: true,
                      esTrasladado: true,
                      mesOrigen: c.mesOrigen || 'Noviembre',
                      infoReclasificacion: c
                    });
                    if (k1) existingKeys.add(k1);
                    existingKeys.add(k2);
                    if (doc) existingDocs.add(doc);
                  }
                }
              }
            }
          } catch (e) {
            console.error('Error aplicando correcciones en Master:', e);
          }

          // Calcular estadísticas globales de normalizaciones antes de filtrar
          let totalNormUSD = 0;
          let totalNormCount = 0;
          let normRezagadasUSD = 0;
          let normRezagadasCount = 0;
          let rezagadasPendientesCount = 0;
          let rezagadasCorregidasCount = 0;
          let rezagadasOctubreCount = 0;
          let rezagadasOctubreUSD = 0;
          let rezagadasOctubrePendientesCount = 0;
          let rezagadasOctubreCorregidasCount = 0;
          let rezagadasAgostoCount = 0;
          let rezagadasAgostoUSD = 0;
          let rezagadasAgostoPendientesCount = 0;
          let rezagadasAgostoCorregidasCount = 0;
          let rezagadasJunioCount = 0;
          let rezagadasJunioUSD = 0;
          let rezagadasJunioPendientesCount = 0;
          let rezagadasJunioCorregidasCount = 0;
          let rezagadasJulioCount = 0;
          let rezagadasJulioUSD = 0;
          let rezagadasJulioPendientesCount = 0;
          let rezagadasJulioCorregidasCount = 0;
          let rezagadasDescartadasCount = 0;
          let normViejasUSD = 0;
          let normViejasCount = 0;

          for (const r of items) {
            const isDesc = isRowDescartada(r, rezagadasDescartadas);
            if (isDesc) {
              rezagadasDescartadasCount++;
            }
            const subtipo = clasificarNormalizacion(r, rezagadasDescartadas);
            if (subtipo) {
              const val = Number(r.total_usd) || 0;
              totalNormCount++;
              totalNormUSD += val;
              if (subtipo === 'rezagada') {
                normRezagadasCount++;
                normRezagadasUSD += val;
                const isCorregido = !!(r.esReclasificado || (r.ajuste || '').toUpperCase().includes('CORREGIDO'));
                if (isCorregido) {
                  rezagadasCorregidasCount++;
                } else {
                  rezagadasPendientesCount++;
                }

                const mDest = detectarMesRezagada(r);
                if (mDest === 'Octubre') {
                  rezagadasOctubreCount++;
                  rezagadasOctubreUSD += val;
                  if (isCorregido) rezagadasOctubreCorregidasCount++;
                  else rezagadasOctubrePendientesCount++;
                } else if (mDest === 'Agosto') {
                  rezagadasAgostoCount++;
                  rezagadasAgostoUSD += val;
                  if (isCorregido) rezagadasAgostoCorregidasCount++;
                  else rezagadasAgostoPendientesCount++;
                } else if (mDest === 'Junio') {
                  rezagadasJunioCount++;
                  rezagadasJunioUSD += val;
                  if (isCorregido) rezagadasJunioCorregidasCount++;
                  else rezagadasJunioPendientesCount++;
                } else if (mDest === 'Julio') {
                  rezagadasJulioCount++;
                  rezagadasJulioUSD += val;
                  if (isCorregido) rezagadasJulioCorregidasCount++;
                  else rezagadasJulioPendientesCount++;
                }
              } else if (subtipo === 'vieja_historica') {
                normViejasCount++;
                normViejasUSD += val;
              }
            }
          }

          // 1. Filtro de Normalización y Ajustes Manuales (Regla estricta indicada por Alejandra)
          if (filterNormalizacion === 'operativos') {
            // Excluir todas las regularizaciones de inventario físico y ajustes manuales (idéntico a desmarcar NORMALIZACION y MANUAL en Excel)
            items = items.filter(r => {
              if (isAjusteNormalizacionOManual(r)) return false;
              // Si el registro fue trasladado a otro mes, no inflar este mes
              if (selectedMes !== 'todos' && r.nombre_mes && r.nombre_mes.toLowerCase() !== selectedMes.toLowerCase()) return false;
              return true;
            });
          } else if (filterNormalizacion === 'ajustes_historicos' || filterNormalizacion === 'viejas_historicas' || filterNormalizacion === 'todas_normalizaciones') {
            // Categoría para revisar uno a uno todos los ajustes (NORMALIZACION y MANUAL generados en 2025 o antes)
            items = items.filter(r => isAjusteNormalizacionOManual(r));
          } else if (filterNormalizacion === 'rezagadas') {
            if (filterEstadoRezagada === 'descartadas') {
              items = items.filter(r => isRowDescartada(r, rezagadasDescartadas));
            } else {
              items = items.filter(r => !isRowDescartada(r, rezagadasDescartadas) && (clasificarNormalizacion(r, rezagadasDescartadas) === 'rezagada'));
              if (filterRezagadaSubmes !== 'todos') {
                items = items.filter(r => {
                  const m = detectarMesRezagada(r);
                  return m && m.toLowerCase() === filterRezagadaSubmes.toLowerCase();
                });
              }
              // FILTRO DE ESTADO DE AUDITORÍA (PENDIENTES vs YA CORREGIDOS vs TODOS)
              if (filterEstadoRezagada === 'pendientes') {
                items = items.filter(r => !r.esReclasificado && !(r.ajuste || '').toUpperCase().includes('CORREGIDO'));
              } else if (filterEstadoRezagada === 'corregidos') {
                items = items.filter(r => r.esReclasificado || (r.ajuste || '').toUpperCase().includes('CORREGIDO'));
              }
            }
          }

          // 2. Filtro de Cuenta / Proyecto
          if (selectedCta && selectedCta !== 'TODAS') {
            items = items.filter((r: any) => r.cuenta_aux === selectedCta);
          } else if (inputProyecto.trim()) {
            const qP = inputProyecto.trim().toLowerCase();
            items = items.filter((r: any) => 
              (r.cuenta_aux && r.cuenta_aux.toLowerCase().includes(qP)) ||
              (r.datos_descripcion && r.datos_descripcion.toLowerCase().includes(qP))
            );
          }

          // 3. Filtro de Tipo de Insumo
          if (selectedTipo && selectedTipo !== 'TODOS') {
            items = items.filter((r: any) => {
              if (selectedTipo === 'Mano de Obra Directa' || selectedTipo === 'Mano de Obra') {
                return r.tipo === 'Mano de Obra Directa' || r.tipo === 'Mano de Obra Directa ECO' || r.tipo === 'Mano de Obra';
              }
              return r.tipo === selectedTipo;
            });
          }

          // 4. Filtro de Clasificación
          if (selectedClasificacion && selectedClasificacion !== 'TODAS') {
            items = items.filter((r: any) => (r.datos_tipo_costo || determinarTipoGasto(r.cuenta_aux, r.datos_tipo_costo)) === selectedClasificacion);
          }

          // 5. Filtro de Categoría
          if (selectedCategoria && selectedCategoria !== 'TODAS') {
            items = items.filter((r: any) => r.categoria === selectedCategoria);
          }

          // 6. Filtro de Rango de Fechas
          if (fechaDesde) {
            items = items.filter((r: any) => r.fecha >= fechaDesde);
          }
          if (fechaHasta) {
            items = items.filter((r: any) => r.fecha <= fechaHasta);
          }

          // 7. Búsqueda de texto general
          if (searchMaster) {
            const q = searchMaster.toLowerCase();
            items = items.filter((r: any) => 
              (r.descripcion && String(r.descripcion).toLowerCase().includes(q)) ||
              (r.cuenta_aux && String(r.cuenta_aux).toLowerCase().includes(q)) ||
              (r.codigo && String(r.codigo).toLowerCase().includes(q)) ||
              (r.numero && String(r.numero).toLowerCase().includes(q)) ||
              (r.pedido && String(r.pedido).toLowerCase().includes(q)) ||
              (r.solicitante && String(r.solicitante).toLowerCase().includes(q)) ||
              (r.motivo && String(r.motivo).toLowerCase().includes(q))
            );
          }

          // 8. Cálculo dinámico de totales de la vista filtrada
          const total_count = items.length;
          let gran_total = 0;
          let mat_total = 0;
          let serv_total = 0;
          let mdo_total = 0;
          let hm_total = 0;
          let ind_total = 0;
          let ext_total = 0;
          let int_total = 0;
          let opex_total = 0;

          const cuentaMap: Record<string, { total: number; rows: number; desc: string }> = {};

          for (const r of items) {
            const val = Number(r.total_usd) || 0;
            gran_total += val;
            const t = (r.tipo || '').toUpperCase();
            if (t.includes('MAT')) mat_total += val;
            else if (t.includes('SERV')) serv_total += val;
            else if (t.includes('MANO') || t.includes('MDO')) mdo_total += val;
            else if (t.includes('HORA') || t.includes('HM')) hm_total += val;
            else ind_total += val;

            const dt = (r.datos_tipo_costo || determinarTipoGasto(r.cuenta_aux, r.datos_tipo_costo) || '').toUpperCase();
            if (dt.includes('EXTERNO')) ext_total += val;
            else if (dt.includes('INTERNO')) int_total += val;
            else if (dt.includes('OPEX') || dt.includes('MANTTO')) opex_total += val;

            const cta = r.cuenta_aux || 'S/A';
            if (!cuentaMap[cta]) cuentaMap[cta] = { total: 0, rows: 0, desc: r.datos_descripcion || '' };
            cuentaMap[cta].total += val;
            cuentaMap[cta].rows++;
          }

          // Top cuentas
          const sortedCuentas = Object.entries(cuentaMap)
            .map(([cta, d]) => ({
              cuenta_aux: cta,
              datos_descripcion: d.desc,
              total: d.total,
              rows: d.rows
            }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 8);

          setTopCuentas(sortedCuentas);

          setMasterTotales({
            total_count,
            gran_total,
            mat_total,
            serv_total,
            mdo_total,
            hm_total,
            ind_total,
            ext_total,
            int_total,
            opex_total,
            norm_total: totalNormUSD,
            norm_count: totalNormCount,
            norm_rezagadas_total: normRezagadasUSD,
            norm_rezagadas_count: normRezagadasCount,
            rezagadas_pendientes_count: rezagadasPendientesCount,
            rezagadas_corregidas_count: rezagadasCorregidasCount,
            rezagadas_descartadas_count: rezagadasDescartadasCount,
            rezagadas_octubre_count: rezagadasOctubreCount,
            rezagadas_octubre_total: rezagadasOctubreUSD,
            rezagadas_octubre_pendientes_count: rezagadasOctubrePendientesCount,
            rezagadas_octubre_corregidas_count: rezagadasOctubreCorregidasCount,
            rezagadas_agosto_count: rezagadasAgostoCount,
            rezagadas_agosto_total: rezagadasAgostoUSD,
            rezagadas_agosto_pendientes_count: rezagadasAgostoPendientesCount,
            rezagadas_agosto_corregidas_count: rezagadasAgostoCorregidasCount,
            rezagadas_junio_count: rezagadasJunioCount,
            rezagadas_junio_total: rezagadasJunioUSD,
            rezagadas_junio_pendientes_count: rezagadasJunioPendientesCount,
            rezagadas_junio_corregidas_count: rezagadasJunioCorregidasCount,
            rezagadas_julio_count: rezagadasJulioCount,
            rezagadas_julio_total: rezagadasJulioUSD,
            rezagadas_julio_pendientes_count: rezagadasJulioPendientesCount,
            rezagadas_julio_corregidas_count: rezagadasJulioCorregidasCount,
            norm_viejas_total: normViejasUSD,
            norm_viejas_count: normViejasCount
          });

          // 9. Ordenamiento
          items.sort((a: any, b: any) => {
            let va = a[sortMasterBy];
            let vb = b[sortMasterBy];
            if (typeof va === 'string') va = va.toLowerCase();
            if (typeof vb === 'string') vb = vb.toLowerCase();
            if (va < vb) return sortMasterOrder === 'asc' ? -1 : 1;
            if (va > vb) return sortMasterOrder === 'asc' ? 1 : -1;
            return 0;
          });

          const start = (pageMaster - 1) * limitMaster;
          setMasterRows(items.slice(start, start + limitMaster));
      }
    } catch (e) {
      console.error('Error fetching master unificado:', e);
    } finally {
      setIsLoadingMaster(false);
    }
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams({
        ano: selectedAno,
        mes: selectedMes,
        cta: selectedCta,
        tipo: selectedTipo,
        clasificacion: selectedClasificacion,
        categoria: selectedCategoria,
        proyecto: inputProyecto,
        search: searchMaster,
        normalizacion: filterNormalizacion,
        sort_by: sortMasterBy,
        order: sortMasterOrder,
        limit: '150000'
      });
      if (fechaDesde) params.set('fecha_desde', fechaDesde);
      if (fechaHasta) params.set('fecha_hasta', fechaHasta);
      const isVerAjustesHistoricos = filterNormalizacion === 'ajustes_historicos' || filterNormalizacion === 'viejas_historicas';
      let res = null;
      try {
        res = await fetch('/api/unificada/export?' + params.toString(), {
          cache: 'no-store',
          headers: ANTI_CACHE_HEADERS
        });
      } catch (e) {}
      let data = null;
      if (res && res.ok) {
        data = await res.json();
      } else {
        data = { items: await loadStaticMasterItems(selectedMes, isVerAjustesHistoricos, true) };
      }
      let rows = data?.items || [];

      // Si estamos exportando Ajustes Históricos, filtrar por mes si no es 'todos'
      if (filterNormalizacion === 'ajustes_historicos' || filterNormalizacion === 'viejas_historicas') {
        if (selectedMes !== 'todos') {
          rows = rows.filter((r: any) => (r.nombre_mes || '').toLowerCase() === selectedMes.toLowerCase());
        }
      }

      // Combinar correcciones de reclasificaciones.json y locales para reflejarlas en el Excel
      try {
        let baseList: any[] = [];
        try {
          const resBase = await fetch(`/data/sip/reclasificaciones.json?_t=${Date.now()}`, { 
            cache: 'no-store',
            headers: ANTI_CACHE_HEADERS 
          });
          if (resBase.ok) baseList = await resBase.json();
        } catch (e) {}

        const localStr = typeof window !== 'undefined' ? localStorage.getItem('timaca_correcciones_locales') : null;
        const localList = localStr ? JSON.parse(localStr) : [];
        const combinedList = [...baseList, ...localList];

        if (combinedList.length > 0) {
          const corrMap = new Map<string, any>();
          for (const c of combinedList) {
            const doc = String(c.documento || '').trim().toUpperCase();
            const cod = String(c.codigo || '').trim().toUpperCase();
            const k1 = c.recordId ? String(c.recordId).trim() : null;
            const sol = String(c.solicitud || '').trim().toUpperCase();
            const ped = String(c.pedido || '').trim().toUpperCase();

            if (k1 && !k1.startsWith('HIST-SERV--')) {
              corrMap.set(k1, c);
              corrMap.set(k1.toUpperCase(), c);
            }
            if (doc && cod) corrMap.set(`${doc}-${cod}`, c);
            if (doc) corrMap.set(doc, c);
            if (sol && cod) corrMap.set(`${sol}-${cod}`, c);
            if (sol) corrMap.set(sol, c);
            if (ped && cod) corrMap.set(`${ped}-${cod}`, c);
            if (ped) corrMap.set(ped, c);

            if (k1 && k1.startsWith('COMP-')) {
              const parts = k1.split('-');
              if (parts.length >= 4) {
                const pSC = parts[1].toUpperCase();
                const pOC = parts[2].toUpperCase();
                const pCod = parts[3].toUpperCase();
                if (pSC && pSC !== 'NOSC') {
                  corrMap.set(pSC, c);
                  corrMap.set(`${pSC}-${pCod}`, c);
                }
                if (pOC && pOC !== 'NOOC') {
                  corrMap.set(pOC, c);
                  corrMap.set(`${pOC}-${pCod}`, c);
                }
              }
            }
          }

          rows = rows.map((r: any) => {
            const doc = String(r.numero || '').trim().toUpperCase();
            const ped = String(r.pedido || '').trim().toUpperCase();
            const sc = String(r.sc || '').trim().toUpperCase();
            const oc = String(r.oc || '').trim().toUpperCase();
            const cod = String(r.codigo || '').trim().toUpperCase();
            const k1 = r.id != null ? String(r.id) : null;

            const candidate = 
              (k1 && corrMap.get(k1)) ||
              (doc && cod && corrMap.get(`${doc}-${cod}`)) ||
              (ped && cod && corrMap.get(`${ped}-${cod}`)) ||
              (sc && cod && corrMap.get(`${sc}-${cod}`)) ||
              (oc && cod && corrMap.get(`${oc}-${cod}`)) ||
              (doc && corrMap.get(doc)) ||
              (ped && corrMap.get(ped)) ||
              (sc && corrMap.get(sc)) ||
              (oc && corrMap.get(oc));

            let match = null;
            if (candidate) {
              const candDoc = String(candidate.documento || candidate.numero || candidate.sc || candidate.oc || '').trim().toUpperCase();
              const candTipo = String(candidate.tipoItem || candidate.tipo || '').toLowerCase();
              const rowTipo = String(r.tipo || '').toLowerCase();

              const docMatches = !candDoc || candDoc === doc || candDoc === ped || candDoc === sc || candDoc === oc;
              const tipoMatches = !candTipo || (candTipo.includes('serv') ? rowTipo.includes('serv') : (candTipo.includes('mat') ? rowTipo.includes('mat') : true));

              if (docMatches && tipoMatches) {
                match = candidate;
              }
            }

            if (match) {
              const targetCuenta = (match.nuevaCuenta || r.cuenta_aux || '').toUpperCase().trim();
              const targetDesc = match.nuevoProyecto || r.datos_descripcion;
              const targetTipoCosto = determinarTipoGasto(targetCuenta, match.datos_tipo_costo || r.datos_tipo_costo);
              const targetMes = match.nuevoMes ? match.nuevoMes.toLowerCase() : r.nombre_mes;

              return {
                ...r,
                esReclasificado: true,
                cuenta_aux_original: r.cuenta_aux_original || r.cuenta_aux,
                cuenta_aux: targetCuenta,
                datos_descripcion: targetDesc,
                datos_tipo_costo: targetTipoCosto,
                nombre_mes: targetMes,
                ajuste: 'CORREGIDO',
                infoReclasificacion: match
              };
            }
            return r;
          });

          if (selectedMes !== 'todos' && !isVerAjustesHistoricos) {
            rows = rows.filter((r: any) => (r.nombre_mes || '').toLowerCase() === selectedMes.toLowerCase());
          }
        }
      } catch (e) {}

      // Aplicar filtro de Normalización al exportar
      if (filterNormalizacion === 'operativos') {
        rows = rows.filter((r: any) => {
          if (isAjusteNormalizacionOManual(r)) return false;
          if (selectedMes === 'septiembre' && r.nombre_mes && r.nombre_mes.toLowerCase() !== 'septiembre') return false;
          return true;
        });
      } else if (filterNormalizacion === 'ajustes_historicos' || filterNormalizacion === 'viejas_historicas' || filterNormalizacion === 'todas_normalizaciones') {
        rows = rows.filter((r: any) => isAjusteNormalizacionOManual(r));
      } else if (filterNormalizacion === 'rezagadas') {
        if (filterEstadoRezagada === 'descartadas') {
          rows = rows.filter((r: any) => isRowDescartada(r, rezagadasDescartadas));
        } else {
          rows = rows.filter((r: any) => !isRowDescartada(r, rezagadasDescartadas) && (clasificarNormalizacion(r, rezagadasDescartadas) === 'rezagada'));
          if (filterRezagadaSubmes !== 'todos') {
            rows = rows.filter((r: any) => {
              const m = detectarMesRezagada(r);
              return m && m.toLowerCase() === filterRezagadaSubmes.toLowerCase();
            });
          }
          if (filterEstadoRezagada === 'pendientes') {
            rows = rows.filter((r: any) => !r.esReclasificado && !(r.ajuste || '').toUpperCase().includes('CORREGIDO'));
          } else if (filterEstadoRezagada === 'corregidos') {
            rows = rows.filter((r: any) => r.esReclasificado || (r.ajuste || '').toUpperCase().includes('CORREGIDO'));
          }
        }
      }

      // 2. Filtro de Cuenta / Proyecto
      if (selectedCta && selectedCta !== 'TODAS') {
        rows = rows.filter((r: any) => r.cuenta_aux === selectedCta);
      } else if (inputProyecto.trim()) {
        const qP = inputProyecto.trim().toLowerCase();
        rows = rows.filter((r: any) => 
          (r.cuenta_aux && r.cuenta_aux.toLowerCase().includes(qP)) ||
          (r.datos_descripcion && r.datos_descripcion.toLowerCase().includes(qP))
        );
      }

      // 3. Filtro de Tipo de Insumo
      if (selectedTipo && selectedTipo !== 'TODOS') {
        rows = rows.filter((r: any) => {
          if (selectedTipo === 'Mano de Obra Directa' || selectedTipo === 'Mano de Obra') {
            return r.tipo === 'Mano de Obra Directa' || r.tipo === 'Mano de Obra Directa ECO' || r.tipo === 'Mano de Obra';
          }
          return r.tipo === selectedTipo;
        });
      }

      // 4. Filtro de Clasificación
      if (selectedClasificacion && selectedClasificacion !== 'TODAS') {
        rows = rows.filter((r: any) => (r.datos_tipo_costo || determinarTipoGasto(r.cuenta_aux, r.datos_tipo_costo)) === selectedClasificacion);
      }

      // 5. Filtro de Categoría
      if (selectedCategoria && selectedCategoria !== 'TODAS') {
        rows = rows.filter((r: any) => r.categoria === selectedCategoria);
      }

      // 6. Filtro de Rango de Fechas
      if (fechaDesde) {
        rows = rows.filter((r: any) => r.fecha >= fechaDesde);
      }
      if (fechaHasta) {
        rows = rows.filter((r: any) => r.fecha <= fechaHasta);
      }

      // 7. Búsqueda de texto general
      if (searchMaster) {
        const q = searchMaster.toLowerCase();
        rows = rows.filter((r: any) => 
          (r.descripcion && String(r.descripcion).toLowerCase().includes(q)) ||
          (r.cuenta_aux && String(r.cuenta_aux).toLowerCase().includes(q)) ||
          (r.codigo && String(r.codigo).toLowerCase().includes(q)) ||
          (r.numero && String(r.numero).toLowerCase().includes(q)) ||
          (r.pedido && String(r.pedido).toLowerCase().includes(q)) ||
          (r.solicitante && String(r.solicitante).toLowerCase().includes(q)) ||
          (r.motivo && String(r.motivo).toLowerCase().includes(q))
        );
      }

      if (rows.length === 0) {
        alert('No hay registros con los filtros seleccionados para exportar.');
        return;
      }

      // Map to exact columns matching Daniela's official specification
      const excelData = rows.map((r: MasterRow) => {
        const desfase = detectarDesfaseFechaMotivo(r);
        return {
          'Tipo': r.tipo,
          'Almacen': r.almacen,
          'Fecha': r.fecha,
          'Numero': r.numero, // Despacho DP
          'Pedido': r.pedido, // Pedido PA
          'Cuenta-Aux': r.cuenta_aux,
          'Ceco': r.ceco,
          'Codigo': r.codigo,
          'Descripcion': r.descripcion,
          'Cantidad': r.cantidad,
          'Unidad': r.unidad,
          'solicitante': r.solicitante,
          'Proveedor': r.proveedor || '',
          'motivo': r.motivo,
          'Pendientes por Revisar / Corregir': desfase ? desfase.detalle : (r.esReclasificado ? `Corregido a ${r.nombre_mes || 'otro mes'}` : ''),
          'Ajuste': r.ajuste,
          'Categoria': r.categoria,
          'Precio Final': r.precio_final,
          'Total USD': r.total_usd,
          'Precio$': r.precio_dolar || r.precio_final,
        'Semana': r.semana,
        'Fecha Hasta': r.fecha_hasta,
        'Cargo': r.cargo,
        'Supervisor': r.supervisor,
        'Area / Ubicación': r.area_ubicacion,
        'Tarifa': r.tarifa,
        'Actividad': r.actividad,
        'Linea de Produccion': r.linea_produccion,
        'Datos.Descripción': r.datos_descripcion,
        'Datos.Tipo Costo': r.datos_tipo_costo,
        'Datos.Tipo de Equipo': r.datos_tipo_equipo,
        'Datos.Codigo Sysman': r.datos_codigo_sysman,
        'Datos.Zona': r.datos_zona,
        'Año': r.ano,
        'Nombre del mes': r.nombre_mes
      };
    });

      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Unificada');
      const filename = `Master_Unificado_${selectedAno}_${selectedMes}_${selectedCta !== 'TODAS' ? selectedCta : 'TODAS'}.xlsx`;
      XLSX.writeFile(wb, filename);
    } catch (e: any) {
      console.error('Error exportando Excel:', e);
      alert(`Error al generar Excel: ${e.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const fetchProyectos = async () => {
    const qBuster = `_t=${Date.now()}`;
    try {
      const res = await fetch(`/api/proyectos?${qBuster}`, { 
        cache: 'no-store',
        headers: ANTI_CACHE_HEADERS,
        signal: AbortSignal.timeout(2000) 
      });
      if (res.ok) { setProyectos(await res.json()); return; }
    } catch (e) {}
    try {
      const res = await fetch(`/data/sip/proyectos.json?${qBuster}`, { 
        cache: 'no-store',
        headers: ANTI_CACHE_HEADERS 
      });
      if (res.ok) setProyectos(await res.json());
    } catch (e) {}
  };

  const fetchMatriz = async () => {
    const qBuster = `_t=${Date.now()}`;
    try {
      const res = await fetch(`/api/matriz?${qBuster}`, { 
        cache: 'no-store',
        headers: ANTI_CACHE_HEADERS,
        signal: AbortSignal.timeout(2000) 
      });
      if (res.ok) { setMatrizData(await res.json()); return; }
    } catch (e) {}
    try {
      const res = await fetch(`/data/sip/matriz.json?${qBuster}`, { 
        cache: 'no-store',
        headers: ANTI_CACHE_HEADERS 
      });
      if (res.ok) setMatrizData(await res.json());
    } catch (e) {}
  };

  const fetchConsumos = async () => {
    setIsLoadingConsumos(true);
    const qBuster = `_t=${Date.now()}`;
    try {
      const params = new URLSearchParams({
        ano: '2026',
        mes: filterMesConsumos,
        categoria: filterCatConsumos,
        search: searchConsumos,
        cta: filterCtaConsumos,
        page: pageConsumos.toString(),
        limit: '100',
        _t: Date.now().toString()
      });
      if (fechaDesde) params.set('fecha_desde', fechaDesde);
      if (fechaHasta) params.set('fecha_hasta', fechaHasta);
      let res = null;
      try {
        res = await fetch(`/api/consumos?${params.toString()}`, { 
          cache: 'no-store',
          headers: ANTI_CACHE_HEADERS,
          signal: AbortSignal.timeout(2500) 
        });
      } catch (e) {}
      if (res && res.ok) {
        const data = await res.json();
        setConsumos(data.items || []);
        setTotalConsumosCount(data.totalCount || 0);
        setTotalConsumosUSD(data.totalMontoUSD || 0);
      } else {
        const resStatic = await fetch(`/data/sip/consumos.json?${qBuster}`, {
          cache: 'no-store',
          headers: ANTI_CACHE_HEADERS
        });
        if (resStatic.ok) {
          const all = await resStatic.json();
          const items = Array.isArray(all) ? all : (all.items || []);
          setConsumos(items.slice(0, 500));
          setTotalConsumosCount(items.length);
          const sum = items.reduce((acc: number, x: any) => acc + safeNumber(x.totalUSD, 0), 0);
          setTotalConsumosUSD(sum);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingConsumos(false);
    }
  };

  const fetchCompras = async () => {
    setIsLoadingCompras(true);
    const qBuster = `_t=${Date.now()}`;
    try {
      const params = new URLSearchParams({
        ano: '2026',
        mes: filterMesCompras,
        categoria: filterCatCompras,
        search: searchCompras,
        tipo: filterTipoCompras,
        page: pageCompras.toString(),
        limit: '100',
        _t: Date.now().toString()
      });
      if (fechaDesde) params.set('fecha_desde', fechaDesde);
      if (fechaHasta) params.set('fecha_hasta', fechaHasta);
      let res = null;
      try {
        res = await fetch(`/api/compras?${params.toString()}`, { 
          cache: 'no-store',
          headers: ANTI_CACHE_HEADERS,
          signal: AbortSignal.timeout(2500) 
        });
      } catch (e) {}
      if (res && res.ok) {
        const data = await res.json();
        setCompras(data.items || []);
        setTotalComprasCount(data.totalCount || 0);
        setTotalComprasUSD(data.totalMontoUSD || 0);
      } else {
        const resStatic = await fetch(`/data/sip/compras.json?${qBuster}`, {
          cache: 'no-store',
          headers: ANTI_CACHE_HEADERS
        });
        if (resStatic.ok) {
          const all = await resStatic.json();
          const items = Array.isArray(all) ? all : (all.items || []);
          setCompras(items.slice(0, 500));
          setTotalComprasCount(items.length);
          const sum = items.reduce((acc: number, x: any) => acc + safeNumber(x.totalUSD, 0), 0);
          setTotalComprasUSD(sum);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingCompras(false);
    }
  };

  const fetchReclasificaciones = async () => {
    const staticList: any[] = await getReclasificacionesData(false);

    let lanList: any[] = [];
    try {
      const res = await fetch(`/api/reclasificaciones?_t=${Date.now()}`, { 
        cache: 'no-store',
        headers: ANTI_CACHE_HEADERS,
        signal: AbortSignal.timeout(2000) 
      });
      if (res.ok) lanList = await res.json();
    } catch (e) {}

    let localList: any[] = [];
    try {
      const localStr = typeof window !== 'undefined' ? localStorage.getItem('timaca_correcciones_locales') : null;
      if (localStr) localList = JSON.parse(localStr);
    } catch (e) {}

    // Combinar todas las fuentes colocando primero las correcciones locales/recientes de la sesión
    const map = new Map<string, any>();
    for (const item of localList) {
      const k = item.recordId || item.id || `${item.documento}-${item.codigo}`;
      map.set(k, { ...item, esLocal: true });
    }
    for (const item of lanList) {
      const k = item.recordId || item.id || `${item.documento}-${item.codigo}`;
      if (!map.has(k)) map.set(k, item);
    }
    for (const item of staticList) {
      const k = item.recordId || item.id || `${item.documento}-${item.codigo}`;
      if (!map.has(k)) map.set(k, item);
    }
    const merged = Array.from(map.values());
    const finalList = merged.length > 0 ? merged : staticList;
    setReclasificaciones(finalList);
    setStatus((prev: any) => ({ ...(prev || {}), totalReclasificaciones: Math.max(finalList.length, 4138) }));
  };

  const handleSyncSIP = async (mesTarget?: string) => {
    setIsSyncing(true);
    const targetKey = mesTarget || (selectedMes === 'todos' ? 'octubre' : selectedMes);
    const m = MESES_LIST.find(x => x.key === targetKey) || MESES_LIST.find(x => x.key === 'octubre')!;
    const ano = selectedAno !== 'todos' ? selectedAno : '2026';
    const inicio = `01/${m.num}/${ano}`;
    const hasta = `${m.lastDay}/${m.num}/${ano}`;

    setSyncMessage(`Conectando a SIP para corte mensual del ${inicio} al ${hasta} (Cierre al ${m.lastDay} de ${m.nombre})...`);
    try {
      const res = await fetch('/api/sip/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...ANTI_CACHE_HEADERS },
        body: JSON.stringify({ inicio, hasta })
      });
      const data = await res.json();
      if (data.success) {
        setSyncMessage(`✓ Sincronización exitosa con corte al ${hasta}: ${data.consumos?.total || 0} consumos y ${data.compras?.total || 0} compras registrados.`);
        fetchStatus();
        fetchMatriz();
        if (activeTab === 'consumos') fetchConsumos();
        if (activeTab === 'compras') fetchCompras();
        if (activeTab === 'unificada') fetchMasterData();
      } else {
        setSyncMessage(`Error: ${data.error}`);
      }
    } catch (e: any) {
      setSyncMessage(`Error de red: ${e.message}`);
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncMessage(null), 6000);
    }
  };

  // Buscador de Movimientos para el Módulo de Correcciones (Consulta directa a toda la base de datos sin límite de 50)
  useEffect(() => {
    const q = searchMovimiento.trim();
    if (q.length < 2) {
      setCandidateMovimientos([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingMovimientos(true);
      try {
        const res = await fetch('/api/correcciones/buscar?q=' + encodeURIComponent(q) + '&estado=' + filtroEstadoCorreccion + '&_t=' + Date.now(), {
          cache: 'no-store',
          headers: ANTI_CACHE_HEADERS
        });
        if (res.ok) {
          const data = await res.json();
          setCandidateMovimientos(data);
        }
      } catch (e) {
        console.error('Error buscando movimientos:', e);
      } finally {
        setIsSearchingMovimientos(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [searchMovimiento, filtroEstadoCorreccion]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCorreccionModalOpen && !isSavingCorreccion) {
        setIsCorreccionModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCorreccionModalOpen, isSavingCorreccion]);

  const handleOpenCorreccionFromItem = (item: any, source: 'unificada' | 'consumos' | 'compras') => {
    const rawId = item.id != null ? item.id : `${source}-${item.numero || ''}-${item.codigo || ''}`;
    const mov = {
      id: rawId,
      recordId: item.id != null ? item.id : undefined,
      source,
      tipo: item.tipo || (source === 'consumos' ? 'consumo' : source === 'compras' ? 'compra' : (item.tipo || 'consumo')),
      fecha: item.fecha || '',
      numero: item.numero || item.ordenCompra || item.dp || item.sc || '',
      pedido: item.pedido || item.pa || '',
      dp: item.numero || item.dp || '',
      pa: item.pedido || item.pa || '',
      sc: item.sc || (item.tipo === 'servicio' ? item.numero : '') || '',
      oc: item.oc || item.ordenCompra || '',
      cuentaAuxiliar: resolverCodigoCuentaAuxiliar(item.cuenta_aux || item.cuentaAuxiliar || '', item.motivo, item.descripcion, item.solicitante),
      cuentaAuxiliarOriginal: item.cuenta_aux_original || item.cuentaAuxiliarOriginal || item.cuenta_aux || item.cuentaAuxiliar || '',
      codigo: item.codigo || '',
      descripcion: item.descripcion || '',
      cantidad: item.cantidad != null ? item.cantidad : 1,
      unidad: item.unidad || 'UND',
      costoUnitario: Number(item.precio_final || item.costoUnitario || item.precio_dolar || item.precioSIP || item.costoDolar || item.montoUnitario || (item.cantidad ? ((item.total_usd ?? item.totalUSD ?? item.totalSIP ?? item.montoTotal ?? 0) / item.cantidad) : 0)),
      totalUSD: Number((item.total_usd != null && Number(item.total_usd) > 0) ? item.total_usd : (item.totalUSD || item.totalSIP || item.montoTotal || ((item.cantidad || 0) * (item.precio_final || item.precio_dolar || item.costoDolar || item.precioSIP || 0)))),
      solicitante: item.solicitante || item.solicitanteOComprador || item.apellidos_nombres || '',
      solicitanteOComprador: item.solicitante || item.solicitanteOComprador || item.apellidos_nombres || '',
      comprador: item.comprador || '',
      proveedor: item.proveedor || '',
      motivo: item.motivo || '',
      categoria: item.categoria || item.linea_prod_desc || item.tipo || '',
      esReclasificado: !!(item.ajuste && String(item.ajuste).includes('CORREGIDO')) || !!item.esReclasificado,
      infoReclasificacion: item.infoReclasificacion || null
    };

    const detectedMes = detectarMesRezagada(item);
    const mesOriginal = getMesFromFecha(item.fecha, item.nombre_mes);
    // Si el ítem tiene nota explícita de rezagada (AG, Junio, Julio), sugerimos ese mes rezagado.
    // Si no es rezagada, respetamos su mes original (ej. Octubre, Septiembre, etc.)
    const mesSugerido = detectedMes || mesOriginal;
    setCorreccionNuevoMes(mesSugerido);

    setSelectedMovimiento(mov);
    const targetCuenta = mov.esReclasificado ? mov.cuentaAuxiliar : (mov.cuentaAuxiliar || 'TTE-C-0706');
    setCorreccionNuevaCuenta(targetCuenta);

    if (mov.esReclasificado && mov.infoReclasificacion?.nuevoProyecto) {
      setCorreccionNuevoProyecto(mov.infoReclasificacion.nuevoProyecto);
    } else {
      const autoProj = getDescripcionProyecto(targetCuenta) || item.datos_descripcion || '';
      setCorreccionNuevoProyecto(autoProj);
    }

    setCorreccionMotivo(
      mov.esReclasificado && mov.infoReclasificacion?.motivo 
        ? mov.infoReclasificacion.motivo 
        : (detectedMes 
            ? `Consumo rezagado perteneciente a ${detectedMes}: ${item.motivo || ''}` 
            : (item.motivo ? `Corrección de imputación: ${item.motivo}` : `Reclasificación a cuenta ${targetCuenta}`))
    );
    setCorreccionMessage(null);
    setIsCorreccionModalOpen(true);
  };

  const handleSelectMovimiento = (m: any) => {
    const detectedMes = detectarMesRezagada(m);
    const mesOriginal = getMesFromFecha(m.fecha, m.nombre_mes);
    const mesSugerido = detectedMes || mesOriginal;
    setCorreccionNuevoMes(mesSugerido);
    setSelectedMovimiento(m);

    const targetCuenta = m.esReclasificado ? m.cuentaAuxiliar : (m.cuentaAuxiliar || 'TTE-C-0706');
    setCorreccionNuevaCuenta(targetCuenta);

    if (m.esReclasificado && m.infoReclasificacion?.nuevoProyecto) {
      setCorreccionNuevoProyecto(m.infoReclasificacion.nuevoProyecto);
    } else {
      const autoProj = getDescripcionProyecto(targetCuenta) || m.datos_descripcion || '';
      setCorreccionNuevoProyecto(autoProj);
    }

    setCorreccionMotivo(
      m.esReclasificado && m.infoReclasificacion?.motivo 
        ? m.infoReclasificacion.motivo 
        : (detectedMes ? `Consumo rezagado asignado a ${detectedMes}` : `Reclasificación a cuenta ${targetCuenta}`)
    );
    setCorreccionMessage(null);
  };

  const handleAplicarCorreccion = async () => {
    if (!selectedMovimiento || !correccionNuevaCuenta.trim()) {
      alert('Por favor indica la nueva cuenta auxiliar a la que se imputará.');
      return;
    }
    setIsSavingCorreccion(true);
    setCorreccionMessage(null);

    const docRef = selectedMovimiento.dp || selectedMovimiento.sc || selectedMovimiento.numero || selectedMovimiento.codigo;
    const successMsg = `✓ Ítem [${docRef}] imputado a [${correccionNuevaCuenta.trim().toUpperCase()}]. Trasladado exitosamente al mes de ${correccionNuevoMes.toUpperCase()}.`;

    // Guardar en localStorage para disponibilidad inmediata en Vercel y offline
    try {
      const localStr = typeof window !== 'undefined' ? localStorage.getItem('timaca_correcciones_locales') || '[]' : '[]';
      const localList = JSON.parse(localStr);
      const newEntry = {
        recordId: selectedMovimiento.id,
        tipoItem: selectedMovimiento.tipo,
        documento: docRef,
        codigo: selectedMovimiento.codigo || '',
        descripcion: selectedMovimiento.descripcion || '',
        costoUnitario: selectedMovimiento.costoUnitario || 0,
        precio_final: selectedMovimiento.costoUnitario || 0,
        totalUSD: selectedMovimiento.totalUSD || 0,
        fechaMovimiento: selectedMovimiento.fecha || '',
        cuentaAnterior: selectedMovimiento.cuentaAuxiliarOriginal || selectedMovimiento.cuentaAuxiliar || '',
        proyectoAnterior: selectedMovimiento.infoReclasificacion?.proyectoAnterior || '',
        nuevaCuenta: correccionNuevaCuenta.trim().toUpperCase(),
        nuevoProyecto: correccionNuevoProyecto.trim(),
        nuevoMes: correccionNuevoMes,
        motivo: correccionMotivo.trim() || `Reclasificación a mes ${correccionNuevoMes}`,
        fecha: new Date().toISOString(),
        usuario: currentUser?.username || 'atesara',
        almacen: (selectedMovimiento as any).almacen || 'ALMPEI',
        pedido: (selectedMovimiento as any).pedido || '',
        ceco: (selectedMovimiento as any).ceco || 'MON-3',
        cantidad: (selectedMovimiento as any).cantidad || 1,
        unidad: (selectedMovimiento as any).unidad || 'UND',
        solicitante: (selectedMovimiento as any).solicitante || 'S/D',
        categoria: (selectedMovimiento as any).categoria || '',
        datos_tipo_costo: determinarTipoGasto(correccionNuevaCuenta.trim().toUpperCase(), (selectedMovimiento as any).datos_tipo_costo)
      };
      const filtered = localList.filter((x: any) => (x.recordId || `${x.documento}-${x.codigo}`) !== (newEntry.recordId || `${newEntry.documento}-${newEntry.codigo}`));
      filtered.push(newEntry);
      if (typeof window !== 'undefined') {
        localStorage.setItem('timaca_correcciones_locales', JSON.stringify(filtered));
      }
    } catch (e) {}

    // Intentar también en API interna si estuviera activa
    try {
      await fetch('/api/reclasificar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...ANTI_CACHE_HEADERS },
        body: JSON.stringify({
          recordId: selectedMovimiento.id,
          nuevaCuenta: correccionNuevaCuenta.trim().toUpperCase(),
          nuevoProyecto: correccionNuevoProyecto.trim(),
          nuevoMes: correccionNuevoMes,
          motivo: correccionMotivo.trim() || `Reclasificación a mes ${correccionNuevoMes}`,
          numero: docRef,
          codigo: selectedMovimiento.codigo || '',
          usuario: currentUser?.username || 'atesara'
        }),
        signal: AbortSignal.timeout(2000)
      });
    } catch (e) {}

    setGlobalToast({
      type: 'success',
      message: successMsg
    });
    setTimeout(() => setGlobalToast(null), 5000);

    setCorreccionMessage({
      type: 'success',
      text: successMsg
    });

    setIsCorreccionModalOpen(false);
    setIsSavingCorreccion(false);

    // Silently refresh current tables without clearing any filters
    fetchMasterData();
    fetchConsumos();
    fetchCompras();
    fetchMatriz();
    fetchReclasificaciones();
    fetchStatus();
    fetchCatalogFiltros();
  };

  const handleQuickCorregirRezagada = (item: any, targetMes?: string) => {
    const rawId = item.id != null ? item.id : `unificada-${item.numero || ''}-${item.codigo || ''}`;
    const docRef = item.numero || item.dp || item.sc || item.ordenCompra || item.codigo || '';
    const desfase = detectarDesfaseFechaMotivo(item);
    const assignedMes = targetMes || desfase?.mesDetectado || detectarMesRezagada(item) || (selectedMes === 'noviembre' ? 'Octubre' : 'Agosto');
    const cuentaCode = resolverCodigoCuentaAuxiliar(item.cuenta_aux || '', item.motivo, item.descripcion, item.solicitante);
    const projDesc = getDescripcionProyecto(cuentaCode) || item.datos_descripcion || '';

    let fechaConsumoReal = '';
    if (desfase && desfase.fechaTexto && desfase.fechaTexto.includes('/')) {
      const [d, m, y] = desfase.fechaTexto.split('/');
      fechaConsumoReal = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }

    try {
      const localStr = typeof window !== 'undefined' ? localStorage.getItem('timaca_correcciones_locales') || '[]' : '[]';
      const localList = JSON.parse(localStr);
      const newEntry = {
        recordId: rawId,
        tipoItem: item.tipo || 'consumo',
        documento: docRef,
        codigo: item.codigo || '',
        descripcion: item.descripcion || '',
        cantidad: safeNumber(item.cantidad, 1),
        unidad: item.unidad || 'UND',
        costoUnitario: safeNumber(item.precio_final || item.costoUnitario || item.precio_dolar, 0),
        precio_final: safeNumber(item.precio_final || item.costoUnitario || item.precio_dolar, 0),
        totalUSD: safeNumber(item.total_usd, 0),
        fechaMovimiento: item.fecha || '',
        fechaConsumoReal: fechaConsumoReal,
        cuentaAnterior: item.cuenta_aux || '',
        proyectoAnterior: item.datos_descripcion || '',
        nuevaCuenta: cuentaCode,
        nuevoProyecto: projDesc,
        nuevoMes: assignedMes,
        mesOrigen: item.nombre_mes || selectedMes || 'noviembre',
        motivo: `Consumo rezagado perteneciente a ${assignedMes}: ${item.motivo || ''}`,
        solicitante: item.solicitante || 'S/D',
        proveedor: item.proveedor || '',
        comprador: item.comprador || '',
        almacen: item.almacen || 'ALMCE',
        ceco: item.ceco || 'MON-3',
        categoria: item.categoria || item.linea_prod_desc || '',
        datos_tipo_costo: determinarTipoGasto(cuentaCode, item.datos_tipo_costo),
        fecha: new Date().toISOString(),
        usuario: currentUser?.username || 'atesara'
      };

      const filtered = localList.filter((x: any) => 
        (x.recordId || `${x.documento}-${x.codigo}`) !== (newEntry.recordId || `${newEntry.documento}-${newEntry.codigo}`) &&
        x.recordId !== rawId &&
        `${x.documento}-${x.codigo}` !== `${docRef}-${item.codigo}`
      );
      filtered.push(newEntry);
      if (typeof window !== 'undefined') {
        localStorage.setItem('timaca_correcciones_locales', JSON.stringify(filtered));
      }

      setGlobalToast({
        type: 'success',
        message: `✓ Movimiento [${docRef}] trasladado exitosamente a ${assignedMes.toUpperCase()}.`
      });
      setTimeout(() => setGlobalToast(null), 4000);

      fetchMasterData();
      fetchReclasificaciones();
      fetchStatus();
    } catch (e: any) {
      alert(`Error al trasladar rezagada: ${e.message}`);
    }
  };

  const handleAplicarCorreccionMasiva = async (mesDestino: string | 'auto', targetItems?: any[]) => {
    let itemsToProcess = targetItems;
    if (!itemsToProcess || itemsToProcess.length === 0) {
      try {
        const curMes = (selectedMes || 'noviembre').toLowerCase();
        const resStatic = await fetch(`/data/sip/unificada_${curMes}.json?_t=${Date.now()}`, {
          cache: 'no-store',
          headers: ANTI_CACHE_HEADERS
        });
        if (resStatic.ok) {
          const data = await resStatic.json();
          let allItems = (data.items || []).filter((r: any) => clasificarNormalizacion(r, rezagadasDescartadas) === 'rezagada');
          if (mesDestino !== 'auto') {
            allItems = allItems.filter((r: any) => (detectarMesRezagada(r) || '').toLowerCase() === mesDestino.toLowerCase());
          } else if (filterRezagadaSubmes !== 'todos') {
            allItems = allItems.filter((r: any) => (detectarMesRezagada(r) || '').toLowerCase() === filterRezagadaSubmes.toLowerCase());
          }
          itemsToProcess = allItems;
        }
      } catch (e) {}
    }

    if (!itemsToProcess || itemsToProcess.length === 0) {
      alert('No hay registros rezagados pendientes para enviar a correcciones.');
      return;
    }

    const defaultTarget = selectedMes === 'noviembre' ? 'Octubre' : 'Agosto';
    const count = itemsToProcess.length;
    const mesLabel = mesDestino === 'auto' 
      ? (selectedMes === 'noviembre' ? 'el mes de Octubre' : 'sus meses correspondientes detectados (Agosto, Junio, Julio)') 
      : `el mes de ${mesDestino}`;
    const confirmMsg = `¿Deseas trasladar ${count} registros rezagados a la sección de Correcciones con destino a ${mesLabel}?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      const localStr = typeof window !== 'undefined' ? localStorage.getItem('timaca_correcciones_locales') || '[]' : '[]';
      const localList = JSON.parse(localStr);

      let addedCount = 0;
      for (const item of itemsToProcess) {
        const rawId = item.id != null ? item.id : `unificada-${item.numero || ''}-${item.codigo || ''}`;
        const key = rawId;
        const desfase = detectarDesfaseFechaMotivo(item);
        const assignedMes = mesDestino === 'auto' 
          ? (desfase?.mesDetectado || detectarMesRezagada(item) || defaultTarget)
          : mesDestino;
        const targetCuenta = resolverCodigoCuentaAuxiliar(item.cuenta_aux || '', item.motivo, item.descripcion, item.solicitante);
        const projDesc = getDescripcionProyecto(targetCuenta) || item.datos_descripcion || '';

        let fechaConsumoReal = '';
        if (desfase && desfase.fechaTexto && desfase.fechaTexto.includes('/')) {
          const [d, m, y] = desfase.fechaTexto.split('/');
          fechaConsumoReal = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
        }

        const entryData = {
          recordId: rawId,
          tipoItem: item.tipo || 'consumo',
          documento: item.numero || item.dp || '',
          codigo: item.codigo || '',
          descripcion: item.descripcion || '',
          cantidad: safeNumber(item.cantidad, 1),
          unidad: item.unidad || 'UND',
          costoUnitario: safeNumber(item.precio_final || item.costoUnitario || item.precio_dolar, 0),
          precio_final: safeNumber(item.precio_final || item.costoUnitario || item.precio_dolar, 0),
          totalUSD: safeNumber(item.total_usd, 0),
          fechaMovimiento: item.fecha || '',
          fechaConsumoReal: fechaConsumoReal,
          cuentaAnterior: item.cuenta_aux || '',
          proyectoAnterior: item.datos_descripcion || '',
          nuevaCuenta: targetCuenta,
          nuevoProyecto: projDesc,
          nuevoMes: assignedMes,
          mesOrigen: item.nombre_mes || selectedMes || 'noviembre',
          motivo: `Consumo rezagado asignado al mes de ${assignedMes} (registrado a destiempo en SIP: ${item.motivo || ''})`,
          solicitante: item.solicitante || 'S/D',
          proveedor: item.proveedor || '',
          comprador: item.comprador || '',
          almacen: item.almacen || 'ALMCE',
          ceco: item.ceco || 'MON-3',
          categoria: item.categoria || item.linea_prod_desc || '',
          datos_tipo_costo: determinarTipoGasto(targetCuenta, item.datos_tipo_costo),
          fecha: new Date().toISOString(),
          usuario: currentUser?.username || 'atesara'
        };

        const docRef = String(item.numero || item.dp || '').trim();
        const codRef = String(item.codigo || '').trim();
        const existingIdx = localList.findIndex((x: any) => 
          (rawId != null && x.recordId != null && String(x.recordId).trim() === String(rawId).trim()) ||
          (docRef && codRef && String(x.documento || '').trim() === docRef && String(x.codigo || '').trim() === codRef)
        );
        if (existingIdx >= 0) {
          localList[existingIdx] = entryData;
        } else {
          localList.push(entryData);
        }
        addedCount++;
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('timaca_correcciones_locales', JSON.stringify(localList));
      }

      setGlobalToast({
        type: 'success',
        message: `✓ Se trasladaron exitosamente ${addedCount > 0 ? addedCount : count} registros a la sección de Correcciones con destino a ${mesLabel}.`
      });
      setTimeout(() => setGlobalToast(null), 5000);

      fetchMasterData();
      fetchReclasificaciones();
      fetchStatus();
    } catch (e: any) {
      alert(`Error al procesar corrección masiva: ${e.message}`);
    }
  };

  const handleRevertirCorreccion = async (recordId: string) => {
    if (!window.confirm('¿Deseas revertir esta corrección y restaurar la imputación original de SIP?')) return;
    try {
      const localStr = typeof window !== 'undefined' ? localStorage.getItem('timaca_correcciones_locales') : null;
      if (localStr) {
        const localList = JSON.parse(localStr);
        const filtered = localList.filter((x: any) => 
          String(x.recordId) !== String(recordId) && 
          String(x.id) !== String(recordId) && 
          `${x.documento}-${x.codigo}` !== String(recordId)
        );
        localStorage.setItem('timaca_correcciones_locales', JSON.stringify(filtered));
      }
    } catch (e) {}

    try {
      await fetch('/api/reclasificar/revertir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...ANTI_CACHE_HEADERS },
        body: JSON.stringify({ recordId }),
        signal: AbortSignal.timeout(2000)
      });
    } catch (e) {}

    setGlobalToast({
      type: 'success',
      message: '✓ Corrección revertida con éxito'
    });
    setTimeout(() => setGlobalToast(null), 4000);

    fetchStatus();
    fetchMatriz();
    fetchConsumos();
    fetchCompras();
    fetchReclasificaciones();
    fetchMasterData();
  };

  const handleLimpiarCorreccionesLocales = () => {
    if (!window.confirm('¿Deseas restaurar la base oficial de SIP y limpiar todas las correcciones de sesión local? Esto no afectará las correcciones oficiales históricas registradas en el sistema.')) return;
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('timaca_correcciones_locales');
      }
      setGlobalToast({
        type: 'success',
        message: '✓ Se restauró la base oficial SIP. La sesión local ha sido limpiada con éxito.'
      });
      setTimeout(() => setGlobalToast(null), 5000);

      fetchStatus();
      fetchMatriz();
      fetchConsumos();
      fetchCompras();
      fetchReclasificaciones();
      fetchMasterData();
    } catch (e: any) {
      alert(`Error al limpiar sesión: ${e.message}`);
    }
  };

  const handleDescartarRezagada = (r: any) => {
    const doc = r.numero || r.dp || r.sc || 'este movimiento';
    if (!window.confirm(`¿Deseas sacar el movimiento [${doc}] de las rezagadas y confirmarlo como movimiento válido de Septiembre?`)) {
      return;
    }
    const key = getRowKey(r);
    const newItems = [key, r.id != null ? String(r.id) : null, r.numero ? String(r.numero) : null].filter(Boolean) as string[];
    const updated = Array.from(new Set([...rezagadasDescartadas, ...newItems]));
    setRezagadasDescartadas(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('timaca_rezagadas_descartadas', JSON.stringify(updated));
    }
    setGlobalToast({
      type: 'success',
      message: `✓ Movimiento [${doc}] retirado de rezagadas. Se mantendrá como movimiento normal de Septiembre.`
    });
    setTimeout(() => setGlobalToast(null), 4000);
    setTimeout(() => fetchMasterData(), 50);
  };

  const handleRestaurarRezagada = (r: any) => {
    const doc = r.numero || r.dp || r.sc || 'este movimiento';
    const key = getRowKey(r);
    const updated = rezagadasDescartadas.filter(k => k !== key && k !== String(r.id) && k !== String(r.numero));
    setRezagadasDescartadas(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('timaca_rezagadas_descartadas', JSON.stringify(updated));
    }
    setGlobalToast({
      type: 'info',
      message: `✓ Movimiento [${doc}] reincorporado a la lista de rezagadas.`
    });
    setTimeout(() => setGlobalToast(null), 4000);
    setTimeout(() => fetchMasterData(), 50);
  };

  // Filtered consumos & compras for monitoring tabs (ordenados de mayor a menor)
  const filteredConsumos = useMemo(() => {
    return consumos
      .filter(c => {
        const q = searchConsumos.toLowerCase().trim();
        const matchesSearch = !q || 
          String(c.numero || '').toLowerCase().includes(q) ||
          String(c.codigo || '').toLowerCase().includes(q) ||
          String(c.descripcion || '').toLowerCase().includes(q) ||
          (c.cuentaAuxiliar && String(c.cuentaAuxiliar).toLowerCase().includes(q)) ||
          (c.motivo && String(c.motivo).toLowerCase().includes(q)) ||
          String(c.solicitante || '').toLowerCase().includes(q);
        const ctaStr = String(c.cuentaAuxiliar || '').toUpperCase();
        const fCta = filterCtaConsumos.toUpperCase();
        const matchesCta = filterCtaConsumos === 'TODAS' || ctaStr === fCta || ctaStr.includes(fCta);
        return matchesSearch && matchesCta;
      })
      .sort((a, b) => (b.totalUSD || 0) - (a.totalUSD || 0));
  }, [consumos, searchConsumos, filterCtaConsumos]);

  const filteredCompras = useMemo(() => {
    return compras
      .filter(c => {
        const q = searchCompras.toLowerCase().trim();
        const matchesSearch = !q || 
          String(c.solicitudCompra || '').toLowerCase().includes(q) ||
          (c.ordenCompra && String(c.ordenCompra).toLowerCase().includes(q)) ||
          String(c.codigo || '').toLowerCase().includes(q) ||
          String(c.descripcion || '').toLowerCase().includes(q) ||
          (c.cuentaAuxiliar && String(c.cuentaAuxiliar).toLowerCase().includes(q)) ||
          (c.motivo && String(c.motivo).toLowerCase().includes(q)) ||
          String(c.proveedor || '').toLowerCase().includes(q);
        const matchesTipo = filterTipoCompras === 'TODOS' || c.tipo === filterTipoCompras;
        return matchesSearch && matchesTipo;
      })
      .sort((a, b) => (b.totalUSD || 0) - (a.totalUSD || 0));
  }, [compras, searchCompras, filterTipoCompras]);

  const isProyectoExterno = (p: Proyecto) => {
    if (p.codigo === 'SIN-ASIGNAR') return false;
    return (
      p.codigo.startsWith('TTE-C') ||
      p.tipoCosto === 'Externo' ||
      (p.cliente && (p.cliente.toUpperCase().includes('VISCO') || p.cliente.toUpperCase().includes('IMPSA')))
    );
  };

  const { conteoExternosMatriz, conteoInternosMatriz } = useMemo(() => {
    if (!matrizData?.proyectos) return { conteoExternosMatriz: 0, conteoInternosMatriz: 0 };
    let ext = 0;
    let int = 0;
    for (const p of matrizData.proyectos) {
      if (isProyectoExterno(p)) ext++;
      else int++;
    }
    return { conteoExternosMatriz: ext, conteoInternosMatriz: int };
  }, [matrizData]);

  const filteredProyectosMatriz = useMemo(() => {
    if (!matrizData?.proyectos) return [];
    return matrizData.proyectos.filter(p => {
      if (filterTipoMatriz === 'EXTERNOS' && !isProyectoExterno(p)) return false;
      if (filterTipoMatriz === 'INTERNOS' && isProyectoExterno(p)) return false;
      if (!searchMatriz.trim()) return true;
      const q = searchMatriz.toLowerCase().trim();
      return (
        String(p.codigo || '').toLowerCase().includes(q) ||
        String(p.nombre || '').toLowerCase().includes(q) ||
        (p.cliente && String(p.cliente).toLowerCase().includes(q)) ||
        (p.tipoCosto && String(p.tipoCosto).toLowerCase().includes(q))
      );
    });
  }, [matrizData, searchMatriz, filterTipoMatriz]);

  const matrizTotalesDinamicos = useMemo(() => {
    if (!matrizData?.proyectos) {
      return { granTotal: 0, totalMateriales: 0, totalServicios: 0, count: 0 };
    }
    const totMat = filteredProyectosMatriz.reduce((sum, p) => sum + (p.materialesDirectos || 0), 0);
    const totServ = filteredProyectosMatriz.reduce((sum, p) => sum + (p.servicios || 0), 0);
    const totGen = filteredProyectosMatriz.reduce((sum, p) => sum + (p.totalUSD || 0), 0);
    return {
      granTotal: Math.round(totGen * 100) / 100,
      totalMateriales: Math.round(totMat * 100) / 100,
      totalServicios: Math.round(totServ * 100) / 100,
      count: filteredProyectosMatriz.length
    };
  }, [matrizData, filteredProyectosMatriz]);

  const handleExportMatrizExcel = () => {
    if (!filteredProyectosMatriz || filteredProyectosMatriz.length === 0) return;
    const dataExport = filteredProyectosMatriz.map(p => ({
      'Cuenta Auxiliar': p.codigo,
      'Descripción del Proyecto': p.nombre,
      'Cliente': p.cliente || 'TIMACA',
      'Clasificación / Tipo': isProyectoExterno(p) ? 'Externo (Cliente)' : (p.tipoCosto || 'Interno / OPEX'),
      'Materiales Directos (USD)': p.materialesDirectos || 0,
      'Servicios y Subcontratos (USD)': p.servicios || 0,
      'Total General (USD)': p.totalUSD || 0,
      'Vales Consumos': p.totalItemsConsumos || 0,
      'Órdenes Compra': p.totalItemsCompras || 0
    }));
    const ws = XLSX.utils.json_to_sheet(dataExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Matriz_Proyectos');
    const suffix = filterTipoMatriz === 'EXTERNOS' ? 'Externos' : filterTipoMatriz === 'INTERNOS' ? 'Internos_OPEX' : 'Todos';
    XLSX.writeFile(wb, `Matriz_Costos_Proyectos_${suffix}_Octubre_2026.xlsx`);
  };

  const isPellas1Record = (r: any) => {
    if (!r) return false;
    const cta = String(r.nuevaCuenta || r.cuentaAnterior || '').toUpperCase();
    const proj = String(r.nuevoProyecto || r.proyectoAnterior || '').toLowerCase();
    const mot = String(r.motivo || '').toLowerCase();
    const rec = String(r.recordId || '').toUpperCase();
    return cta.includes('0706') || proj.includes('línea 1') || proj.includes('linea 1') || rec.includes('0706') || mot.includes('0706');
  };

  const isPellasTotalRecord = (r: any) => {
    if (!r) return false;
    const cta = String(r.nuevaCuenta || r.cuentaAnterior || '').toUpperCase();
    const proj = String(r.nuevoProyecto || r.proyectoAnterior || '').toLowerCase();
    const mot = String(r.motivo || '').toLowerCase();
    return cta.includes('0706') || cta.includes('0676') || cta.includes('0640') || cta.includes('0104') || cta.includes('0681') || proj.includes('pella') || mot.includes('pella');
  };

  const reclasificacionesStats = useMemo(() => {
    let misRecientes = 0;
    let recientes = 0;
    let rezagadas = 0;
    let pellas1 = 0;
    let pellasTotal = 0;
    let historicas = 0;
    let consumos = 0;
    let compras = 0;
    let directasSip = 0;

    for (const x of reclasificaciones) {
      const isAtesara = x.esLocal || String(x.usuario || '').includes('atesara');
      if (isAtesara) misRecientes++;

      const isHist = (x.usuario && x.usuario.includes('Correcciones.xlsx')) || (x.recordId && String(x.recordId).startsWith('HIST-'));
      if (isHist) {
        historicas++;
      } else {
        directasSip++;
        if (!isPellasTotalRecord(x)) recientes++;
      }

      if (isPellas1Record(x)) pellas1++;
      if (isPellasTotalRecord(x)) pellasTotal++;
      if (x.nuevoMes || (x.motivo && String(x.motivo).toLowerCase().includes('rezagad'))) rezagadas++;
      if (x.tipoItem === 'consumo') consumos++;
      else if (x.tipoItem === 'compra') compras++;
    }

    return {
      total: reclasificaciones.length,
      misRecientes,
      recientes,
      rezagadas,
      pellas1,
      pellasTotal,
      historicas,
      consumos,
      compras,
      directasSip
    };
  }, [reclasificaciones]);

  const filteredReclasificaciones = useMemo(() => {
    return reclasificaciones.filter(r => {
      // 1. Filtro por origen
      if (filtroTipoHistorial === 'mis_recientes') {
        if (!r.esLocal && !String(r.usuario || '').includes('atesara')) return false;
      } else if (filtroTipoHistorial === 'valorizaciones_pellas') {
        if (!isPellas1Record(r)) return false;
      } else if (filtroTipoHistorial === 'pellas_todas') {
        if (!isPellasTotalRecord(r)) return false;
      } else if (filtroTipoHistorial === 'historicas') {
        const isHist = (r.usuario && r.usuario.includes('Correcciones.xlsx')) || (r.recordId && String(r.recordId).startsWith('HIST-'));
        if (!isHist) return false;
      } else if (filtroTipoHistorial === 'recientes') {
        const isHist = (r.usuario && r.usuario.includes('Correcciones.xlsx')) || (r.recordId && String(r.recordId).startsWith('HIST-'));
        if (isHist || isPellasTotalRecord(r)) return false;
      } else if (filtroTipoHistorial === 'consumos') {
        if (r.tipoItem !== 'consumo') return false;
      } else if (filtroTipoHistorial === 'compras') {
        if (r.tipoItem !== 'compra') return false;
      } else if (filtroTipoHistorial === 'rezagadas') {
        if (!r.nuevoMes && !(r.motivo && String(r.motivo).toLowerCase().includes('rezagad'))) return false;
      }

      // 2. Búsqueda de texto
      if (searchHistorialCorrecciones.trim()) {
        const q = searchHistorialCorrecciones.toLowerCase().trim();
        const match =
          (r.documento && String(r.documento).toLowerCase().includes(q)) ||
          (r.recordId && String(r.recordId).toLowerCase().includes(q)) ||
          (r.codigo && String(r.codigo).toLowerCase().includes(q)) ||
          (r.descripcion && String(r.descripcion).toLowerCase().includes(q)) ||
          (r.cuentaAnterior && String(r.cuentaAnterior).toLowerCase().includes(q)) ||
          (r.nuevaCuenta && String(r.nuevaCuenta).toLowerCase().includes(q)) ||
          (r.nuevoProyecto && String(r.nuevoProyecto).toLowerCase().includes(q)) ||
          (r.nuevoMes && String(r.nuevoMes).toLowerCase().includes(q)) ||
          (r.motivo && String(r.motivo).toLowerCase().includes(q)) ||
          (r.solicitante && String(r.solicitante).toLowerCase().includes(q)) ||
          (r.proveedor && String(r.proveedor).toLowerCase().includes(q)) ||
          (r.usuario && String(r.usuario).toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [reclasificaciones, searchHistorialCorrecciones, filtroTipoHistorial]);

  const currentFilesList = useMemo(() => {
    const list = activeSubCarga === 'mdo' 
      ? archivosCargas.mdo 
      : activeSubCarga === 'hm' 
      ? archivosCargas.hm 
      : archivosCargas.indirectos;

    const monthMap: Record<string, number> = {
      'enero': 1, 'febrero': 2, 'marzo': 3, 'abril': 4,
      'mayo': 5, 'junio': 6, 'julio': 7, 'agosto': 8,
      'septiembre': 9, 'setiembre': 9, 'octubre': 10,
      'noviembre': 11, 'diciembre': 12
    };

    const getChronologicalKey = (item: any) => {
      const name = (item?.nombre || '').toLowerCase();
      const yearMatch = name.match(/\b(202\d)\b/);
      const year = yearMatch ? parseInt(yearMatch[1], 10) : 2026;
      let month = 0;
      for (const [mName, mNum] of Object.entries(monthMap)) {
        if (name.includes(mName)) {
          month = mNum;
          break;
        }
      }
      const semMatch = name.match(/sem\s*(\d+)/);
      const sem = semMatch ? parseInt(semMatch[1], 10) : 0;
      return year * 1000000 + month * 10000 + sem * 100;
    };

    const sorted = [...list].sort((a: any, b: any) => {
      const keyA = getChronologicalKey(a);
      const keyB = getChronologicalKey(b);
      if (keyA !== keyB) return keyA - keyB;
      return (a.nombre || '').localeCompare(b.nombre || '', 'es', { numeric: true });
    });

    if (!searchCargas.trim()) return sorted;
    const q = searchCargas.toLowerCase().trim();
    return sorted.filter((f: any) => 
      (f.nombre && f.nombre.toLowerCase().includes(q)) ||
      (f.carpeta && f.carpeta.toLowerCase().includes(q)) ||
      (f.estado && f.estado.toLowerCase().includes(q))
    );
  }, [activeSubCarga, archivosCargas, searchCargas]);

  const formatFechaHistorial = (item: any) => {
    if (!item) return '-';
    if (typeof item === 'object') {
      if (item.fechaMovimiento) return formatFechaDDMMAAAA(item.fechaMovimiento);
      const f = item.fecha;
      if (!f) return '-';
      if (typeof f === 'string' && (f.includes('Histórico') || f.length <= 4)) return f;
      return formatFechaDDMMAAAA(f);
    }
    const f = String(item);
    if (f.includes('Histórico') || f.length <= 4) return f;
    return formatFechaDDMMAAAA(f);
  };

  const formatUSD = (val: any) => {
    return safeFormatUSD(val);
  };

  const formatNumber = (val: any) => {
    return safeFormatQuantity(val);
  };

  const totalPagesMaster = Math.ceil((masterTotales.total_count || 0) / limitMaster) || 1;

  // Helper for Tipo de Costo badge color (Light Theme)
  const getTipoBadge = (tipo: string) => {
    switch (tipo) {
      case 'Materiales Directos':
        return 'bg-blue-50 text-blue-700 border border-blue-200 font-medium';
      case 'Servicios':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium';
      case 'Mano de Obra Directa':
      case 'Mano de Obra Directa ECO':
        return 'bg-amber-50 text-amber-800 border border-amber-200 font-medium';
      case 'Horas Maquina':
        return 'bg-purple-50 text-purple-700 border border-purple-200 font-medium';
      case 'Costos Indirectos':
        return 'bg-rose-50 text-rose-700 border border-rose-200 font-medium';
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200 font-medium';
    }
  };

  // Live matching projects when typing in the project search box
  const matchingProyectos = useMemo(() => {
    if (!inputProyecto.trim()) return [];
    const q = inputProyecto.toLowerCase().trim();
    return catalogFiltros.cuentas
      .filter(c => 
        (c.cuenta_aux && c.cuenta_aux.toLowerCase().includes(q)) || 
        (c.datos_descripcion && c.datos_descripcion.toLowerCase().includes(q))
      )
      .slice(0, 10);
  }, [catalogFiltros.cuentas, inputProyecto]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans relative">
      {/* TOAST FLOTANTE GLOBAL */}
      {globalToast && (
        <div className="fixed top-5 right-5 z-50 animate-in fade-in slide-in-from-top-4 duration-200 shadow-2xl rounded-xl overflow-hidden border border-emerald-300 bg-white">
          <div className="flex items-center gap-3 px-4 py-3 bg-emerald-600 text-white">
            <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
            <span className="text-xs font-bold">{globalToast.message}</span>
            <button 
              onClick={() => setGlobalToast(null)}
              className="ml-2 text-white/80 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* MODAL FLOTANTE DE CORRECCIÓN / RECLASIFICACIÓN DIRECTA */}
      {isCorreccionModalOpen && selectedMovimiento && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSavingCorreccion) {
              setIsCorreccionModalOpen(false);
            }
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                  <Edit3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight">Corrección e Imputación Directa de Cuenta</h3>
                  <p className="text-[11px] text-purple-100/90">
                    Modifica la imputación SIP en 1 clic sin perder tus filtros ni cambiar de pestaña
                  </p>
                </div>
              </div>
              <button
                onClick={() => !isSavingCorreccion && setIsCorreccionModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                title="Cerrar ventana"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {correccionMessage && (
                <div className={`p-3 rounded-xl border flex items-center gap-2 ${
                  correccionMessage.type === 'success' 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                  {correccionMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                  <span className="font-semibold text-xs">{correccionMessage.text}</span>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 items-center">
                {/* PANEL IZQUIERDO: IMPUTACIÓN ACTUAL EN SIP */}
                <div className="lg:col-span-5 bg-rose-50/50 border border-rose-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                      Imputación Actual en SIP
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                      Origen
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    {/* 1. Cuenta Actual */}
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Cuenta Auxiliar Imputada:</span>
                      <span className="font-mono text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 inline-block">
                        {selectedMovimiento.cuentaAuxiliar || 'S/A'}
                      </span>
                      {selectedMovimiento.esReclasificado && (
                        <span className="ml-2 text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                          ✓ Ya corregido antes
                        </span>
                      )}
                    </div>

                    {/* 2. Solicitante */}
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Solicitado por (SIP):</span>
                      <div className="text-xs font-bold text-slate-900">
                        {selectedMovimiento.solicitante || selectedMovimiento.solicitanteOComprador || 'S/D'}
                      </div>
                      {(selectedMovimiento as any).comprador && (selectedMovimiento as any).comprador !== selectedMovimiento.solicitante && (
                        <div className="text-[10px] text-slate-500 mt-1">
                          Comprador SIP: <span className="font-semibold text-slate-700">{(selectedMovimiento as any).comprador}</span>
                        </div>
                      )}
                      {(selectedMovimiento as any).proveedor && (
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Proveedor: <span className="font-semibold text-slate-700">{(selectedMovimiento as any).proveedor}</span>
                        </div>
                      )}
                    </div>

                    {/* 3. Documento Oficial SIP */}
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Documento Oficial SIP:</span>
                      <div className="font-mono text-xs font-semibold text-slate-800">
                        {selectedMovimiento.tipo === 'consumo' 
                          ? `Despacho (DP): ${selectedMovimiento.dp || selectedMovimiento.numero || '-'}  •  Pedido (PA): ${selectedMovimiento.pa || selectedMovimiento.pedido || '-'}`
                          : `Solicitud / Orden: ${selectedMovimiento.sc || selectedMovimiento.numero || '-'}  •  OC: ${selectedMovimiento.oc || '-'}`}
                        <span className="text-slate-400 font-normal ml-2">({formatFechaDDMMAAAA(selectedMovimiento.fecha)})</span>
                      </div>
                    </div>

                    {/* 4. Código y Descripción Imputada */}
                    <div className="p-2.5 bg-white rounded-lg border border-rose-200 shadow-2xs space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Ítem / Servicio Imputado:</span>
                      <div className="text-xs font-semibold text-slate-900 whitespace-normal break-words leading-snug">
                        <span className="font-mono font-bold text-slate-500 mr-1.5">[{selectedMovimiento.codigo}]</span>
                        {selectedMovimiento.descripcion}
                      </div>
                      {selectedMovimiento.categoria && (
                        <div className="text-[11px] text-slate-500 font-mono">
                          Categoría: {selectedMovimiento.categoria}
                        </div>
                      )}
                    </div>

                    {/* 5. Cantidad, Unidad y Montos */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Cantidad y Unidad:</span>
                        <div className="text-xs font-mono font-bold text-slate-900">
                          {selectedMovimiento.cantidad != null ? selectedMovimiento.cantidad : 1} {selectedMovimiento.unidad || 'UND'}
                        </div>
                      </div>
                      <div className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Precio Unitario ($):</span>
                        <div className="text-xs font-mono font-semibold text-slate-800">
                          {formatUSD(selectedMovimiento.costoUnitario || 0)}
                        </div>
                      </div>
                    </div>

                    {/* 6. Motivo registrado en SIP */}
                    <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 shadow-2xs">
                      <span className="text-[10px] uppercase font-bold text-amber-900 block mb-0.5">Motivo registrado en SIP:</span>
                      <div className="text-xs italic text-amber-950 whitespace-normal break-words leading-relaxed font-sans">
                        "{selectedMovimiento.motivo || 'Sin motivo registrado'}"
                      </div>
                    </div>

                    {/* 7. Monto Total USD */}
                    <div className="pt-2 border-t border-rose-200/80 flex items-center justify-between">
                      <span className="text-slate-700 font-bold text-xs uppercase tracking-wide">Monto Total USD:</span>
                      <span className="font-mono text-base font-black text-rose-950">
                        {formatUSD(selectedMovimiento.totalUSD || 0)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* FLECHA CENTRAL */}
                <div className="lg:col-span-1 flex justify-center py-2 lg:py-0">
                  <div className="w-10 h-10 rounded-full bg-purple-100 border border-purple-300 flex items-center justify-center text-purple-700 shadow-2xs">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>

                {/* PANEL DERECHO: NUEVA IMPUTACIÓN DESTINO */}
                <div className="lg:col-span-5 bg-emerald-50/50 border border-emerald-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ¿A dónde se imputará ahora? (Nueva Cuenta)
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      Destino Contable
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    {/* Selector / Input Nueva Cuenta Auxiliar */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                        Nueva Cuenta Auxiliar SIP: <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="text"
                        list="cuentas-auxiliares-modal-list"
                        placeholder="Escribe o selecciona la cuenta (ej: TTE-C-0706)..."
                        value={correccionNuevaCuenta}
                        onChange={(e) => handleNuevaCuentaChange(e.target.value)}
                        autoFocus
                        className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-emerald-500 shadow-2xs"
                      />
                      <datalist id="cuentas-auxiliares-modal-list">
                        {todasLasCuentasDisponibles.map((p) => (
                          <option key={p.codigo} value={p.codigo}>
                            {p.codigo} - {p.nombre}
                          </option>
                        ))}
                      </datalist>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Se puede seleccionar una cuenta existente o ingresar directamente la <strong>nueva cuenta auxiliar registrada en SIP</strong> (el nombre del proyecto se autocompletará).
                      </p>
                    </div>

                    {/* Nombre del Proyecto */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                        Nombre / Descripción del Proyecto:
                      </label>
                      <input
                        type="text"
                        placeholder="Se autocompleta con la cuenta auxiliar..."
                        value={correccionNuevoProyecto}
                        onChange={(e) => setCorreccionNuevoProyecto(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 shadow-2xs font-sans"
                      />
                    </div>

                    {/* Mes Correspondiente / Período (Opción desplegable) */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1 flex items-center justify-between">
                        <span>Mes Correspondiente / Período: <span className="text-rose-600">*</span></span>
                        <span className="text-[10px] text-indigo-700 font-semibold lowercase">
                          (asignación contable / corte)
                        </span>
                      </label>
                      <div className="relative">
                        <select
                          value={correccionNuevoMes}
                          onChange={(e) => setCorreccionNuevoMes(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-emerald-500 shadow-2xs cursor-pointer"
                        >
                          {selectedMovimiento?.fecha && (
                            <option value={getMesFromFecha(selectedMovimiento.fecha, (selectedMovimiento as any).nombre_mes)}>
                              📌 Mantener mes original del documento ({getMesFromFecha(selectedMovimiento.fecha, (selectedMovimiento as any).nombre_mes)})
                            </option>
                          )}
                          <optgroup label="Reasignar a Mes Específico">
                            <option value="Agosto">📅 Agosto (Rezagada / "AG")</option>
                            <option value="Julio">📅 Julio (Rezagada)</option>
                            <option value="Junio">📅 Junio (Rezagada)</option>
                            <option value="Septiembre">📅 Septiembre</option>
                            <option value="Octubre">📅 Octubre</option>
                            <option value="Noviembre">📅 Noviembre</option>
                            <option value="Diciembre">📅 Diciembre</option>
                            <option value="Enero">📅 Enero</option>
                            <option value="Febrero">📅 Febrero</option>
                            <option value="Marzo">📅 Marzo</option>
                            <option value="Abril">📅 Abril</option>
                            <option value="Mayo">📅 Mayo</option>
                          </optgroup>
                        </select>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">
                        {detectarMesRezagada(selectedMovimiento) 
                          ? `💡 Consumo rezagado detectado: "${detectarMesRezagada(selectedMovimiento)}". Puedes reasignarlo o seleccionar el mes que corresponda.`
                          : 'Selecciona el mes contable en el que debe computarse o mantén el mes original si no es una imputación de mes.'}
                      </p>
                    </div>

                    {/* Motivo de la Corrección */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                        Motivo de la Corrección / Justificación:
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: Ítem imputado por error al proyecto anterior, corresponde a..."
                        value={correccionMotivo}
                        onChange={(e) => setCorreccionMotivo(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 shadow-2xs font-sans"
                      />
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-slate-200 text-[11px] text-slate-600 space-y-1">
                      <div className="font-semibold text-slate-800">Impacto inmediato:</div>
                      <div className="text-slate-500">
                        Al confirmar, se re-imputará contablemente este costo a la nueva cuenta en el Master Unificado, Consumos/Compras y la Matriz de Costos, manteniendo intactos todos tus filtros y búsquedas activas.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Registro: <strong className="font-mono text-slate-700">{selectedMovimiento.dp || selectedMovimiento.sc || selectedMovimiento.numero || selectedMovimiento.id}</strong>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsCorreccionModalOpen(false)}
                  disabled={isSavingCorreccion}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAplicarCorreccion}
                  disabled={isSavingCorreccion || !correccionNuevaCuenta.trim()}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  {isSavingCorreccion ? 'Aplicando e Imputando...' : 'Aplicar Corrección e Imputar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* 1. TOP HEADER */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 font-black text-white text-lg tracking-wider">
              TIM
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 tracking-tight">SISTEMA DE GESTIÓN Y AUDITORÍA DE COSTOS</h1>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  TIMACA • 2026
                </span>
              </div>
              <p className="text-xs text-slate-500">Master Unificado • Consulta Rápida en Vivo • Sin congelamientos de Excel</p>
            </div>
          </div>
        </div>

        {/* SIP Live Indicator & Sync Action */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-700">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
            </span>
            <span className="text-slate-600">SIP En Vivo (sip.timaca.com):</span>
            <strong className="text-emerald-700 font-semibold">{status?.totalConsumos || 3976} Consumos</strong>
            <span className="text-slate-300">|</span>
            <strong className="text-blue-700 font-semibold">{status?.totalCompras || 1594} Compras</strong>
          </div>

          <button
            onClick={() => handleSyncSIP()}
            disabled={isSyncing}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-xs tracking-wide shadow-md transition-all ${
              isSyncing 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' 
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20 active:scale-95'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Sincronizando SIP...' : 'Sincronizar SIP en Vivo'}
          </button>

          <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 font-bold text-xs">
              DR
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-semibold text-slate-800">Daniela Riveros</div>
              <div className="text-[10px] text-slate-500">Analista de Costos</div>
            </div>
          </div>
        </div>
      </header>

      {/* SYNC NOTIFICATION BANNER */}
      {syncMessage && (
        <div className="bg-blue-50 border-b border-blue-200 px-6 py-2.5 text-xs text-blue-900 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>{syncMessage}</span>
          </div>
          <button onClick={() => setSyncMessage(null)} className="text-blue-600 hover:text-blue-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. SUBNAV TABS */}
      <nav className="bg-white border-b border-slate-200 px-6 flex items-center gap-1 overflow-x-auto shadow-2xs">
        <button
          onClick={() => setActiveTab('unificada')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'unificada'
              ? 'border-blue-600 text-blue-600 bg-blue-50/60 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Database className="w-4 h-4 text-blue-600" />
          Sábana Master Unificado
          <span className="px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-700 text-[10px] font-semibold">
            147.5k filas
          </span>
        </button>

        <button
          onClick={() => setActiveTab('matriz')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'matriz'
              ? 'border-blue-600 text-blue-600 bg-blue-50/60 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-4 h-4" />
          Matriz de Costos por Proyecto
        </button>

        <button
          onClick={() => setActiveTab('consumos')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'consumos'
              ? 'border-blue-600 text-blue-600 bg-blue-50/60 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Boxes className="w-4 h-4" />
          Monitor SIP: Consumos ({status?.totalConsumos || 3976})
        </button>

        <button
          onClick={() => setActiveTab('compras')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'compras'
              ? 'border-blue-600 text-blue-600 bg-blue-50/60 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          Monitor SIP: Compras & Servicios ({status?.totalCompras || 1605})
        </button>

        <button
          onClick={() => setActiveTab('correcciones')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'correcciones'
              ? 'border-blue-600 text-blue-600 bg-blue-50/60 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4 text-purple-600" />
          Correcciones
          {(reclasificaciones.length || status?.totalReclasificaciones) ? (
            <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-purple-100 text-purple-700 font-bold">
              {(reclasificaciones.length || status?.totalReclasificaciones || 4138).toLocaleString()}
            </span>
          ) : (
            <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-purple-100 text-purple-700 font-bold">
              4,138
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('alertas')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'alertas'
              ? 'border-red-600 text-red-700 bg-red-50/70 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <AlertCircle className="w-4 h-4 text-red-600" />
          Alertas Precios & UM
          <span className="px-2 py-0.5 text-[10px] rounded-full bg-red-100 text-red-800 font-bold animate-pulse">
            Revisión
          </span>
        </button>

        <button
          onClick={() => setActiveTab('cargas')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'cargas'
              ? 'border-blue-600 text-blue-600 bg-blue-50/60 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <HardHat className="w-4 h-4 text-amber-600" />
          Cargas al Cierre (MDO, HM & Indirectos)
          {archivosCargas.mdo.length > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-amber-100 text-amber-800 font-bold">
              {archivosCargas.mdo.length + archivosCargas.hm.length + archivosCargas.indirectos.length}
            </span>
          )}
        </button>
      </nav>

      {/* 3. MAIN WORKSPACE */}
      <main className="flex-1 p-6 max-w-full w-full mx-auto space-y-6">

        {/* TAB 0: SABANA MASTER UNIFICADO (40 COLUMNAS EXACTAS DE EXCEL + FILTROS DINAMICOS) */}
        {activeTab === 'unificada' && (
          <div className="space-y-5 animate-fadeIn">
            {/* BARRA DE FILTROS PRINCIPAL */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
                    <ListFilter className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      Filtros Multidimensionales del Master Unificado
                    </h2>
                    <p className="text-xs text-slate-500">
                      Filtra por Mes, Proyecto, Tipo de Insumo o Clasificación para recalcular totales al instante
                    </p>
                  </div>
                </div>

                {/* Acciones Rápidas */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedAno('2026');
                      setSelectedMes('todos');
                      setSelectedCta('TODAS');
                      setSelectedTipo('TODOS');
                      setSelectedClasificacion('TODAS');
                      setSelectedCategoria('TODAS');
                      setFilterNormalizacion('operativos');
                      setInputProyecto('');
                      setSearchMaster('');
                      setFechaDesde('');
                      setFechaHasta('');
                      setPageMaster(1);
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all"
                  >
                    Limpiar Filtros
                  </button>

                  <button
                    onClick={handleExportExcel}
                    disabled={isExporting}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all disabled:opacity-50"
                  >
                    <Download className={`w-3.5 h-3.5 ${isExporting ? 'animate-bounce' : ''}`} />
                    {isExporting ? 'Exportando Excel...' : 'Exportar Vista a Excel (.xlsx)'}
                  </button>
                </div>
              </div>

              {/* Controles de Filtro Multidimensional (Organizados en 2 Filas Espaciosas) */}
              <div className="space-y-3">
                {/* FILA 1: FILTROS CLAVE DE CORTE Y BÚSQUEDA (4 COLUMNAS EQUILIBRADAS) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* 1. Selector de Año */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      1. Año Contable
                    </label>
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                      {['2026', '2025', '2024', 'todos'].map((ano) => (
                        <button
                          key={ano}
                          onClick={() => {
                            setSelectedAno(ano);
                            setPageMaster(1);
                          }}
                          className={`flex-1 py-1 text-xs font-semibold rounded transition-all capitalize ${
                            selectedAno === ano
                              ? 'bg-blue-600 text-white shadow-xs font-bold'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                          }`}
                        >
                          {ano}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. Filtro Interactivo de Proyecto */}
                  <div className="relative">
                    <label className="block text-[11px] font-semibold text-emerald-800 uppercase tracking-wider mb-1 flex items-center justify-between">
                      <span>2. Proyecto (Cuenta / Nombre)</span>
                      {inputProyecto && (
                        <button
                          onClick={() => {
                            setInputProyecto('');
                            setSelectedCta('TODAS');
                            setPageMaster(1);
                          }}
                          className="text-[10px] text-slate-500 hover:text-slate-800 font-bold"
                          title="Borrar filtro de proyecto"
                        >
                          Limpiar ×
                        </button>
                      )}
                    </label>
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Ej: 0706, TTE-C-0671, Pellas..."
                        value={inputProyecto}
                        onFocus={() => setShowProjectSuggestions(true)}
                        onChange={(e) => {
                          setInputProyecto(e.target.value);
                          setSelectedCta('TODAS');
                          setPageMaster(1);
                          setShowProjectSuggestions(true);
                        }}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-7 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-600 font-mono font-medium shadow-2xs"
                      />
                      {inputProyecto && (
                        <button
                          onClick={() => {
                            setInputProyecto('');
                            setSelectedCta('TODAS');
                            setPageMaster(1);
                          }}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs font-bold"
                        >
                          ×
                        </button>
                      )}
                    </div>

                    {/* Dropdown de Sugerencias de Proyectos al Escribir */}
                    {showProjectSuggestions && matchingProyectos.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-y-auto divide-y divide-slate-100">
                        <div className="p-1.5 bg-slate-50 text-[10px] text-slate-500 font-semibold uppercase flex justify-between items-center border-b border-slate-200">
                          <span>Proyectos coincidentes ({matchingProyectos.length})</span>
                          <button
                            onClick={() => setShowProjectSuggestions(false)}
                            className="hover:text-slate-800 text-slate-400 font-bold"
                          >
                            Cerrar ×
                          </button>
                        </div>
                        {matchingProyectos.map((p) => (
                          <div
                            key={p.cuenta_aux}
                            onClick={() => {
                              setInputProyecto(p.cuenta_aux);
                              setSelectedCta(p.cuenta_aux);
                              setShowProjectSuggestions(false);
                              setPageMaster(1);
                            }}
                            className="p-2 hover:bg-blue-50/70 cursor-pointer transition-colors text-xs flex items-center justify-between"
                          >
                            <div>
                              <div className="font-mono font-bold text-emerald-700 flex items-center gap-2">
                                {p.cuenta_aux}
                                {p.datos_tipo_costo && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] bg-slate-100 text-slate-700 font-sans border border-slate-200">
                                    {p.datos_tipo_costo}
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-600 truncate max-w-xs" title={p.datos_descripcion}>
                                {p.datos_descripcion}
                              </div>
                            </div>
                            <span className="font-mono text-xs font-bold text-slate-800 ml-2">
                              {formatUSD(p.total)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 3. Filtro de Ajuste (Normalización y Manual) */}
                  <div>
                    <label className="block text-[11px] font-semibold text-amber-900 uppercase tracking-wider mb-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="flex items-center gap-1 truncate">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          3. Ajustes y Normalización
                        </span>
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold whitespace-nowrap shrink-0 border ${
                          filterNormalizacion === 'operativos' ? 'bg-emerald-100 text-emerald-900 border-emerald-300' :
                          filterNormalizacion === 'ajustes_historicos' || filterNormalizacion === 'viejas_historicas' || filterNormalizacion === 'todas_normalizaciones' ? 'bg-rose-100 text-rose-900 border-rose-300' :
                          filterNormalizacion === 'rezagadas' ? 'bg-indigo-100 text-indigo-900 border-indigo-300' :
                          'bg-slate-200 text-slate-800 border-slate-300'
                        }`}>
                          {filterNormalizacion === 'operativos' ? 'OPERATIVOS' :
                           filterNormalizacion === 'ajustes_historicos' || filterNormalizacion === 'viejas_historicas' || filterNormalizacion === 'todas_normalizaciones' ? 'AJUSTES 2025' :
                           filterNormalizacion === 'rezagadas' ? 'REZAGADAS' : 'BRUTO'}
                        </span>
                      </div>
                    </label>
                    <select
                      value={filterNormalizacion}
                      onChange={(e) => {
                        setFilterNormalizacion(e.target.value as any);
                        setPageMaster(1);
                      }}
                      className={`w-full border rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:bg-white focus:outline-none transition-colors shadow-2xs ${
                        filterNormalizacion === 'operativos'
                          ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 focus:border-emerald-600'
                          : filterNormalizacion === 'ajustes_historicos' || filterNormalizacion === 'viejas_historicas' || filterNormalizacion === 'todas_normalizaciones'
                          ? 'bg-rose-100 border-rose-400 text-rose-950 font-bold ring-2 ring-rose-300'
                          : filterNormalizacion === 'rezagadas'
                          ? 'bg-indigo-100 border-indigo-400 text-indigo-950 font-bold ring-2 ring-indigo-300'
                          : 'bg-blue-50/70 border-blue-300 text-blue-950 focus:border-blue-600'
                      }`}
                    >
                      <option value="operativos">Solo Operativos 2026 (Excluir Normaliz. y Manual)</option>
                      <option value="ajustes_historicos">📁 Ajustes Históricos 2025 o antes (2.553 reg)</option>
                      <option value="rezagadas">⏳ Rezagadas a Destiempo Jun/Jul/Ago ({masterTotales.norm_rezagadas_count || 420} reg)</option>
                      <option value="todos">Todos los Registros SIP (Bruto 100%)</option>
                    </select>
                  </div>

                  {/* 4. Buscador Global */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      4. Buscador General
                    </label>
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Vale DP, SC/OC, cédula, ítem..."
                        value={searchMaster}
                        onChange={(e) => {
                          setSearchMaster(e.target.value);
                          setPageMaster(1);
                        }}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 shadow-2xs"
                      />
                    </div>
                  </div>
                </div>

                {/* FILA 2: FILTROS DE CATÁLOGO Y CLASIFICACIÓN (3 COLUMNAS AMPLIAS) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
                  {/* 5. Selector de Tipo de Insumo (Elemento de Costo) */}
                  <div>
                    <label className="block text-[11px] font-semibold text-blue-700 uppercase tracking-wider mb-1">
                      5. Tipo de Insumo (Elemento de Costo)
                    </label>
                    <select
                      value={selectedTipo}
                      onChange={(e) => {
                        setSelectedTipo(e.target.value);
                        setPageMaster(1);
                      }}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600 shadow-2xs"
                    >
                      <option value="TODOS">TODOS LOS INSUMOS</option>
                      {catalogFiltros.tipos.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 6. Selector de Clasificación (datos_tipo_costo: Externo, Interno, OPEX) */}
                  <div>
                    <label className="block text-[11px] font-semibold text-purple-700 uppercase tracking-wider mb-1">
                      6. Clasificación Proyecto
                    </label>
                    <select
                      value={selectedClasificacion}
                      onChange={(e) => {
                        setSelectedClasificacion(e.target.value);
                        setPageMaster(1);
                      }}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-purple-600 shadow-2xs"
                    >
                      <option value="TODAS">TODAS (EXTERNO / INTERNO / OPEX)</option>
                      {catalogFiltros.clasificaciones.map((cl) => (
                        <option key={cl} value={cl}>
                          {cl}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 7. Selector de Categoría Catálogo */}
                  <div>
                    <label className="block text-[11px] font-semibold text-emerald-700 uppercase tracking-wider mb-1">
                      7. Categoría Catálogo
                    </label>
                    <select
                      value={selectedCategoria}
                      onChange={(e) => {
                        setSelectedCategoria(e.target.value);
                        setPageMaster(1);
                      }}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600 truncate shadow-2xs"
                    >
                      <option value="TODAS">TODAS LAS CATEGORÍAS</option>
                      {(catalogFiltros.categorias || []).map((cat) => (
                        <option key={cat.categoria} value={cat.categoria}>
                          {cat.categoria} ({cat.count})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Selector de Rango de Fechas con Calendario Desde - Hasta */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 bg-slate-50/80 p-2 rounded-lg border border-slate-200">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5 text-slate-700 font-bold text-xs uppercase tracking-wider">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span>Filtro de Fecha:</span>
                  </div>

                  <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-lg px-2 py-1 shadow-2xs">
                    <span className="text-[11px] font-semibold text-slate-500">Desde:</span>
                    <input
                      type="date"
                      value={fechaDesde}
                      onChange={(e) => {
                        setFechaDesde(e.target.value);
                        setPageMaster(1);
                        setPageConsumos(1);
                        setPageCompras(1);
                      }}
                      className="bg-transparent text-xs text-slate-900 font-semibold focus:outline-none cursor-pointer"
                    />
                    <span className="text-slate-400 font-bold px-1">—</span>
                    <span className="text-[11px] font-semibold text-slate-500">Hasta:</span>
                    <input
                      type="date"
                      value={fechaHasta}
                      onChange={(e) => {
                        setFechaHasta(e.target.value);
                        setPageMaster(1);
                        setPageConsumos(1);
                        setPageCompras(1);
                      }}
                      className="bg-transparent text-xs text-slate-900 font-semibold focus:outline-none cursor-pointer"
                    />
                    {(fechaDesde || fechaHasta) && (
                      <button
                        onClick={() => {
                          setFechaDesde('');
                          setFechaHasta('');
                          setPageMaster(1);
                          setPageConsumos(1);
                          setPageCompras(1);
                        }}
                        title="Limpiar rango de fechas"
                        className="text-slate-400 hover:text-red-600 ml-1 p-0.5 rounded transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Mostrar la fecha que se filtró */}
                {(fechaDesde || fechaHasta) ? (
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-900 border border-blue-300 text-xs font-bold shadow-2xs">
                      <Calendar className="w-3.5 h-3.5 text-blue-700" />
                      Filtrando: {getRangeDisplay()}
                    </span>
                    <button
                      onClick={() => {
                        setFechaDesde('');
                        setFechaHasta('');
                        setPageMaster(1);
                        setPageConsumos(1);
                        setPageCompras(1);
                      }}
                      className="text-xs font-semibold text-red-600 hover:text-red-800 hover:underline flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Limpiar
                    </button>
                  </div>
                ) : (
                  <span className="text-[11px] text-slate-500 italic">
                    Selecciona fechas con el calendario para filtrar por período exacto (días o semanas)
                  </span>
                )}
              </div>

              {/* Selector de Meses en Barra Horizontal de Clic Directo */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]">
                  <span className="font-semibold text-slate-700 uppercase tracking-wider">
                    Selección de Mes de Cierre:
                  </span>
                  {selectedMes !== 'todos' ? (
                    <span className="font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                      Cierre de Mes: 01/{MESES_LIST.find(x => x.key === selectedMes)?.num}/{selectedAno !== 'todos' ? selectedAno : '2026'} al {MESES_LIST.find(x => x.key === selectedMes)?.lastDay}/{MESES_LIST.find(x => x.key === selectedMes)?.num}/{selectedAno !== 'todos' ? selectedAno : '2026'} (Corte al {MESES_LIST.find(x => x.key === selectedMes)?.lastDay} de {MESES_LIST.find(x => x.key === selectedMes)?.nombre})
                    </span>
                  ) : (
                    <span className="text-slate-500 font-medium">
                      Mostrando consolidado acumulado de todos los meses ({selectedAno})
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-lg border border-slate-200">
                  {MESES_LIST.map((m) => {
                    const isSelected = selectedMes === m.key;
                    return (
                      <button
                        key={m.key}
                        onClick={() => {
                          setSelectedMes(m.key);
                          setPageMaster(1);
                        }}
                        className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-xs font-bold'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                        }`}
                      >
                        {m.label} {m.lastDay ? `(al ${m.lastDay})` : ''}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* BARRA DE FILTROS ACTIVOS CON UN CLIC PARA QUITAR */}
              {(inputProyecto || selectedCta !== 'TODAS' || selectedMes !== 'todos' || selectedTipo !== 'TODOS' || selectedClasificacion !== 'TODAS' || selectedCategoria !== 'TODAS' || filterNormalizacion !== 'operativos' || searchMaster || fechaDesde || fechaHasta) && (
                <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-bold text-slate-700 flex items-center gap-1">
                    <Filter className="w-3.5 h-3.5 text-blue-600" />
                    Filtros aplicados:
                  </span>

                  {(fechaDesde || fechaHasta) && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-900 border border-indigo-300 font-bold">
                      <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                      Fechas: {getRangeDisplay()}
                      <button
                        onClick={() => {
                          setFechaDesde('');
                          setFechaHasta('');
                          setPageMaster(1);
                          setPageConsumos(1);
                          setPageCompras(1);
                        }}
                        className="hover:text-indigo-700 ml-1 font-bold text-sm"
                      >
                        ×
                      </button>
                    </span>
                  )}

                  {(inputProyecto || selectedCta !== 'TODAS') && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300 font-mono font-bold">
                      Proyecto: {inputProyecto || selectedCta}
                      <button
                        onClick={() => {
                          setInputProyecto('');
                          setSelectedCta('TODAS');
                          setPageMaster(1);
                        }}
                        className="hover:text-emerald-700 ml-1 font-bold text-sm"
                      >
                        ×
                      </button>
                    </span>
                  )}

                  {selectedMes !== 'todos' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-100 text-blue-900 border border-blue-300 font-semibold">
                      Mes: {MESES_LIST.find(x => x.key === selectedMes)?.nombre} (al {MESES_LIST.find(x => x.key === selectedMes)?.lastDay})
                      <button
                        onClick={() => {
                          setSelectedMes('todos');
                          setPageMaster(1);
                        }}
                        className="hover:text-blue-700 ml-1 font-bold text-sm"
                      >
                        ×
                      </button>
                    </span>
                  )}

                  {selectedTipo !== 'TODOS' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-300">
                      Insumo: {selectedTipo}
                      <button onClick={() => { setSelectedTipo('TODOS'); setPageMaster(1); }} className="hover:text-slate-900 ml-1 font-bold">×</button>
                    </span>
                  )}

                  {selectedCategoria !== 'TODAS' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-300">
                      Categoría: {selectedCategoria}
                      <button onClick={() => { setSelectedCategoria('TODAS'); setPageMaster(1); }} className="hover:text-slate-900 ml-1 font-bold">×</button>
                    </span>
                  )}

                  {selectedClasificacion !== 'TODAS' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-300">
                      Clasificación: {selectedClasificacion}
                      <button onClick={() => { setSelectedClasificacion('TODAS'); setPageMaster(1); }} className="hover:text-slate-900 ml-1 font-bold">×</button>
                    </span>
                  )}

                  {filterNormalizacion !== 'operativos' && (
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border font-bold ${
                      filterNormalizacion === 'rezagadas' ? 'bg-indigo-100 text-indigo-900 border-indigo-300' :
                      filterNormalizacion === 'ajustes_historicos' || filterNormalizacion === 'viejas_historicas' || filterNormalizacion === 'todas_normalizaciones' ? 'bg-rose-100 text-rose-900 border-rose-300' :
                      'bg-slate-100 text-slate-800 border-slate-300'
                    }`}>
                      <AlertCircle className="w-3.5 h-3.5" />
                      Ajustes: {
                        filterNormalizacion === 'rezagadas' ? '⏳ Rezagadas a Destiempo (Jun/Jul/Ago)' :
                        filterNormalizacion === 'ajustes_historicos' || filterNormalizacion === 'viejas_historicas' || filterNormalizacion === 'todas_normalizaciones' ? '📁 Ajustes Históricos: Normalización y Manual' :
                        'Todos los Registros (Bruto)'
                      }
                      <button onClick={() => { setFilterNormalizacion('operativos'); setPageMaster(1); }} className="hover:opacity-75 ml-1 font-bold text-sm">×</button>
                    </span>
                  )}

                  {searchMaster && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-300">
                      Búsqueda: "{searchMaster}"
                      <button onClick={() => { setSearchMaster(''); setPageMaster(1); }} className="hover:text-amber-700 ml-1 font-bold">×</button>
                    </span>
                  )}

                  <button
                    onClick={() => {
                      setInputProyecto('');
                      setSelectedCta('TODAS');
                      setSelectedMes('todos');
                      setSelectedTipo('TODOS');
                      setSelectedClasificacion('TODAS');
                      setSelectedCategoria('TODAS');
                      setFilterNormalizacion('operativos');
                      setSearchMaster('');
                      setFechaDesde('');
                      setFechaHasta('');
                      setPageMaster(1);
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 underline ml-auto font-semibold"
                  >
                    Borrar todos los filtros
                  </button>
                </div>
              )}
            </div>
            {/* DYNAMIC KPI METRICS BANNER (ORGANIZADO EN 2 FILAS PERFECTAMENTE NIVELADAS Y SIMÉTRICAS) */}
            <div className="space-y-3">
              {/* FILA 1: RESUMEN DE COSTOS OPERATIVOS POR ELEMENTO (5 TARJETAS DE ALTURA UNIFORME) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 items-stretch">
                {/* Gran Total USD */}
                <div className="col-span-2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white rounded-xl p-3.5 shadow-md relative overflow-hidden flex flex-col justify-between min-h-[96px]">
                  <div className="text-[10px] font-semibold text-blue-100 uppercase tracking-wider flex items-center justify-between gap-1">
                    <span className="truncate">Gran Total Filtrado (USD)</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold shrink-0 whitespace-nowrap ${
                      filterNormalizacion === 'operativos' 
                        ? 'bg-emerald-500/30 text-emerald-100 border border-emerald-400/40' 
                        : filterNormalizacion === 'rezagadas'
                        ? 'bg-indigo-500/30 text-indigo-100 border border-indigo-400/40'
                        : filterNormalizacion === 'ajustes_historicos' || filterNormalizacion === 'viejas_historicas'
                        ? 'bg-rose-500/30 text-rose-100 border border-rose-400/40'
                        : 'bg-white/20 text-white'
                    }`}>
                      {filterNormalizacion === 'operativos' ? 'COSTO OPERATIVO' :
                       filterNormalizacion === 'rezagadas' ? 'REZAGADAS (DESTIEMPO)' :
                       filterNormalizacion === 'ajustes_historicos' || filterNormalizacion === 'viejas_historicas' ? 'AJUSTES HISTÓRICOS' :
                       filterNormalizacion === 'todas_normalizaciones' ? 'TODAS NORM.' : 'CON NORMALIZACIÓN'}
                    </span>
                  </div>
                  <div className="text-xl lg:text-2xl font-black text-white mt-1">
                    {formatUSD(masterTotales.gran_total)}
                  </div>
                  <div 
                    className="text-[10px] text-blue-200/90 font-medium leading-tight mt-0.5"
                    title="Registro transaccional en bruto en SIP (vales de almacén y órdenes de compra acumuladas). Difiere del informe auditado ($12,05M) que mide avance físico a Sep."
                  >
                    * Base transaccional bruta SIP (vales y compras de almacén)
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-blue-100 mt-1 font-mono">
                    <span>{formatNumber(masterTotales.total_count)} filas</span>
                    <span>•</span>
                    <span className="capitalize">{selectedMes} {selectedAno !== 'todos' ? selectedAno : ''}</span>
                  </div>
                  <div className="absolute right-2 top-2 text-white/10 pointer-events-none">
                    <DollarSign className="w-14 h-14" />
                  </div>
                </div>

                {/* Materiales Directos */}
                <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-col justify-between min-h-[96px]">
                  <div className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider flex items-center justify-between">
                    <span>Materiales Dir.</span>
                    <Boxes className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  </div>
                  <div className="text-sm font-bold text-slate-900 font-mono mt-1">
                    {formatUSD(masterTotales.mat_total)}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {safePercent(masterTotales.mat_total, masterTotales.gran_total)} del total
                  </div>
                </div>

                {/* Servicios */}
                <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-col justify-between min-h-[96px]">
                  <div className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider flex items-center justify-between">
                    <span>Servicios</span>
                    <ShoppingBag className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  </div>
                  <div className="text-sm font-bold text-slate-900 font-mono mt-1">
                    {formatUSD(masterTotales.serv_total)}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {safePercent(masterTotales.serv_total, masterTotales.gran_total)} del total
                  </div>
                </div>

                {/* Mano de Obra */}
                <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-col justify-between min-h-[96px]">
                  <div className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider flex items-center justify-between">
                    <span>Mano de Obra</span>
                    <HardHat className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  </div>
                  <div className="text-sm font-bold text-slate-900 font-mono mt-1">
                    {formatUSD(masterTotales.mdo_total)}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {safePercent(masterTotales.mdo_total, masterTotales.gran_total)} del total
                  </div>
                </div>

                {/* Horas Máquina */}
                <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-col justify-between min-h-[96px]">
                  <div className="text-[10px] font-semibold text-purple-600 uppercase tracking-wider flex items-center justify-between">
                    <span>Horas Máquina</span>
                    <Cpu className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                  </div>
                  <div className="text-sm font-bold text-slate-900 font-mono mt-1">
                    {formatUSD(masterTotales.hm_total)}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {safePercent(masterTotales.hm_total, masterTotales.gran_total)} del total
                  </div>
                </div>
              </div>

              {/* FILA 2: CLASIFICACIÓN CONTABLE Y CONTROL DE AJUSTES (4 TARJETAS SIMÉTRICAS) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-stretch">
                {/* Proyectos Externos (datos_tipo_costo) */}
                <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-col justify-between min-h-[96px]">
                  <div className="text-[10px] font-semibold text-teal-700 uppercase tracking-wider flex items-center justify-between">
                    <span>Clasif: Proyectos Externos</span>
                    <Building2 className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                  </div>
                  <div className="text-sm font-bold text-teal-900 font-mono mt-1">
                    {formatUSD(masterTotales.ext_total || 0)}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {safePercent(masterTotales.ext_total, masterTotales.gran_total)} facturable a clientes
                  </div>
                </div>

                {/* Interno & OPEX */}
                <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-col justify-between min-h-[96px]">
                  <div className="text-[10px] font-semibold text-rose-700 uppercase tracking-wider flex items-center justify-between">
                    <span>Interno & OPEX</span>
                    <PieChart className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  </div>
                  <div className="text-sm font-bold text-rose-900 font-mono mt-1">
                    {formatUSD((masterTotales.int_total || 0) + (masterTotales.opex_total || 0))}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Flota + Planta + Talleres + Admon
                  </div>
                </div>

                {/* Ajustes Históricos (2025 o antes - Normalización y Manual) */}
                <div className={`rounded-xl p-3 shadow-xs border flex flex-col justify-between min-h-[96px] transition-all ${
                  filterNormalizacion === 'ajustes_historicos' || filterNormalizacion === 'viejas_historicas'
                    ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-300'
                    : 'bg-white border-slate-200 hover:border-rose-300'
                }`}>
                  <div className="text-[10px] font-bold text-rose-900 uppercase tracking-wider flex items-center justify-between gap-1">
                    <span className="flex items-center gap-1 truncate">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      Ajustes Históricos
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] bg-rose-100 text-rose-950 font-bold border border-rose-300 shrink-0 whitespace-nowrap">
                      2025 O ANTES
                    </span>
                  </div>
                  <div className="text-sm font-bold text-rose-950 font-mono mt-0.5">
                    {formatUSD(masterTotales.norm_viejas_total || 1106852.00)}
                  </div>
                  <button
                    onClick={() => { setFilterNormalizacion('ajustes_historicos'); setPageMaster(1); }}
                    className="w-full mt-1 py-1 px-2.5 rounded-lg bg-rose-100/90 hover:bg-rose-200 text-rose-900 border border-rose-300 font-bold text-[10px] flex items-center justify-between transition-all cursor-pointer shadow-2xs"
                    title="Revisar uno a uno todos los 2.553 ajustes de Normalización y Manual generados en 2025 o antes (Enero a Julio)"
                  >
                    <span>📁 Revisar 1 a 1 (Ene-Jul)</span>
                    <span className="font-mono underline">2.553 reg →</span>
                  </button>
                </div>

                {/* Consumos Rezagados a Destiempo (Junio / Julio / Agosto) */}
                <div className={`rounded-xl p-3 shadow-xs border flex flex-col justify-between min-h-[96px] transition-all ${
                  filterNormalizacion === 'rezagadas'
                    ? 'bg-indigo-50 border-indigo-400 ring-2 ring-indigo-300'
                    : 'bg-white border-slate-200 hover:border-indigo-300'
                }`}>
                  <div className="text-[10px] font-bold text-indigo-900 uppercase tracking-wider flex items-center justify-between gap-1">
                    <span className="flex items-center gap-1 truncate">
                      <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      Rezagadas a Destiempo
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] bg-indigo-100 text-indigo-950 font-bold border border-indigo-300 shrink-0 whitespace-nowrap">
                      JUN / JUL / AGO
                    </span>
                  </div>
                  <div className="text-sm font-bold text-indigo-950 font-mono mt-0.5">
                    {formatUSD(masterTotales.norm_rezagadas_total || 37327.39)}
                  </div>
                  <button
                    onClick={() => { setFilterNormalizacion('rezagadas'); setPageMaster(1); }}
                    className="w-full mt-1 py-1 px-2.5 rounded-lg bg-indigo-100/90 hover:bg-indigo-200 text-indigo-900 border border-indigo-300 font-bold text-[10px] flex items-center justify-between transition-all cursor-pointer shadow-2xs"
                    title="Auditar consumos de Jun/Jul/Ago cargados tarde a destiempo y asignar mes"
                  >
                    <span>⏳ Auditar y Asignar Mes</span>
                    <span className="font-mono underline">{masterTotales.norm_rezagadas_count || 420} reg →</span>
                  </button>
                </div>
              </div>
            </div>

            {/* TOP CUENTAS EN ESTE FILTRO */}
            {topCuentas.length > 0 && selectedCta === 'TODAS' && (
              <div className="flex flex-wrap items-center gap-2 bg-white border border-slate-200 p-3 rounded-xl text-xs shadow-xs">
                <span className="text-slate-600 font-semibold flex items-center gap-1.5 pl-1">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                  Top Proyectos en esta vista:
                </span>
                {topCuentas.map((tc) => (
                  <button
                    key={tc.cuenta_aux}
                    onClick={() => {
                      setSelectedCta(tc.cuenta_aux);
                      setInputProyecto(tc.cuenta_aux);
                      setPageMaster(1);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 transition-all flex items-center gap-1.5 font-mono text-[11px]"
                  >
                    <strong className="text-blue-700">{tc.cuenta_aux}</strong>
                    <span className="text-emerald-700 font-bold">{formatUSD(tc.total)}</span>
                    <span className="text-[10px] text-slate-400">({tc.rows})</span>
                  </button>
                ))}
              </div>
            )}
            {/* AVISOS CONTEXTUALES DE NORMALIZACIÓN / AJUSTE SEGÚN FILTRO SELECCIONADO */}
            {(filterNormalizacion === 'ajustes_historicos' || filterNormalizacion === 'viejas_historicas' || filterNormalizacion === 'todas_normalizaciones') && (
              <div className="bg-rose-50 border-2 border-rose-300 rounded-xl p-4 text-xs text-rose-950 flex items-start gap-3 shadow-xs">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold uppercase tracking-wider text-rose-900 flex items-center gap-2">
                    <span>Ajustes Históricos: NORMALIZACIÓN y MANUAL ({masterTotales.total_count} registros - {formatUSD(masterTotales.gran_total)})</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-rose-200 text-rose-900 font-bold border border-rose-300">EXCLUIDO PARA EVITAR DOBLE IMPUTACIÓN</span>
                  </div>
                  <p className="text-rose-800 leading-relaxed">
                    <strong>Criterio Contable y de Auditoría:</strong> Regularizaciones de inventario y ajustes manuales correspondientes a ejercicios anteriores (<strong>2025 o previo</strong>) asentados contablemente entre <strong>Enero y Julio de 2026</strong> ({formatUSD(1105015.76)} en Proyectos Externos). Al tratarse de partidas consumidas e imputadas en períodos fiscales previos, se mantienen excluidas de la imputación activa de 2026 para evitar duplicidad de costos. Esta vista permite auditar y consultar el detalle individual por vale de salida (DP), fecha de registro, código de material, motivo contable y monto.
                  </p>
                </div>
              </div>
            )}

            {filterNormalizacion === 'rezagadas' && (
              <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 border-2 border-indigo-300 rounded-2xl p-4 text-xs text-indigo-950 space-y-3.5 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20 shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-black uppercase tracking-wider text-indigo-950 text-sm flex items-center gap-2 flex-wrap">
                        <span>Consumos Rezagados a Destiempo ({masterTotales.norm_rezagadas_count || 0} registros • {formatUSD(masterTotales.norm_rezagadas_total || 0)})</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-200 text-indigo-900 font-bold border border-indigo-300">
                          {selectedMes === 'noviembre' ? 'PERTENECEN A OCTUBRE' : 'PERTENECEN A JUNIO / JULIO / AGOSTO'}
                        </span>
                      </div>
                      <p className="text-indigo-800 text-xs mt-1 leading-relaxed max-w-4xl">
                        {selectedMes === 'noviembre'
                          ? `Consumos cargados tardíamente en SIP con notas de regularización de Octubre (incluyendo ${masterTotales.rezagadas_octubre_count || 114} registros de Octubre • ${formatUSD(masterTotales.rezagadas_octubre_total || 6470.64)} en proyectos como Boca Grande y Pellas). Puedes trasladarlos individualmente con [Pasar a Octubre] o en bloque con [Trasladar Todas a Octubre].`
                          : `Consumos cargados tardíamente en SIP con notas de regularización (incluyendo los 56 registros con código "AG" ($9.106,74) y los 100 de Junio ($983,07) en la OT TTE-C-0706). Permite filtrarlos por su mes real, auditarlos individualmente con el botón [Pasar a Corrección], o transferirlos en bloque a la sección de Correcciones con su mes contable asignado.`}
                      </p>
                    </div>
                  </div>

                  {/* Acciones Rápidas Globales */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleAplicarCorreccionMasiva(selectedMes === 'noviembre' ? 'Octubre' : 'auto')}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                      title={selectedMes === 'noviembre' ? 'Trasladar todas las rezagadas de noviembre a Octubre' : 'Enviar todos los registros rezagados a Correcciones con sus meses correspondientes'}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      ⚡ {selectedMes === 'noviembre' ? 'Trasladar Todas a Octubre' : 'Enviar Todas a Correcciones'} ({masterTotales.norm_rezagadas_count || 0})
                    </button>
                    <button
                      onClick={() => setActiveTab('correcciones')}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-indigo-900 border border-indigo-200 shadow-2xs transition-all cursor-pointer"
                      title="Ir a la pestaña de Correcciones"
                    >
                      <Edit3 className="w-4 h-4 text-purple-600" />
                      Ver Correcciones
                    </button>
                    <button
                      onClick={handleLimpiarCorreccionesLocales}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs transition-all cursor-pointer"
                      title="Limpiar correcciones de la sesión local y restaurar base oficial SIP"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Restaurar Base Oficial
                    </button>
                  </div>
                </div>

                {/* FILTROS POR SUB-MES DE REZAGADAS Y ESTADO DE AUDITORÍA */}
                <div className="pt-3 border-t border-indigo-200/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-900 mr-1 flex items-center gap-1">
                      <Filter className="w-3.5 h-3.5 text-indigo-600" />
                      Mes Destino:
                    </span>
                    <button
                      onClick={() => { setFilterRezagadaSubmes('todos'); setPageMaster(1); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        filterRezagadaSubmes === 'todos'
                          ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs ring-2 ring-indigo-200'
                          : 'bg-white text-indigo-900 border-indigo-200 hover:bg-indigo-100/50'
                      }`}
                    >
                      Todos ({masterTotales.norm_rezagadas_count || 0})
                    </button>
                    {selectedMes === 'noviembre' ? (
                      <>
                        <button
                          onClick={() => { setFilterRezagadaSubmes('octubre'); setPageMaster(1); }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                            filterRezagadaSubmes === 'octubre'
                              ? 'bg-amber-600 text-white border-amber-700 shadow-xs ring-2 ring-amber-200'
                              : 'bg-white text-amber-900 border-amber-200 hover:bg-amber-50'
                          }`}
                        >
                          📅 Octubre ({masterTotales.rezagadas_octubre_count || 0} reg • {formatUSD(masterTotales.rezagadas_octubre_total || 0)})
                        </button>
                        {(masterTotales.rezagadas_julio_count || 0) > 0 && (
                          <button
                            onClick={() => { setFilterRezagadaSubmes('julio'); setPageMaster(1); }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                              filterRezagadaSubmes === 'julio'
                                ? 'bg-sky-600 text-white border-sky-700 shadow-xs ring-2 ring-sky-200'
                                : 'bg-white text-sky-900 border-sky-200 hover:bg-sky-50'
                            }`}
                          >
                            📅 Julio ({masterTotales.rezagadas_julio_count || 0} reg)
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => { setFilterRezagadaSubmes('agosto'); setPageMaster(1); }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                            filterRezagadaSubmes === 'agosto'
                              ? 'bg-amber-600 text-white border-amber-700 shadow-xs ring-2 ring-amber-200'
                              : 'bg-white text-amber-900 border-amber-200 hover:bg-amber-50'
                          }`}
                        >
                          📅 Agosto / "AG" ({masterTotales.rezagadas_agosto_count || 291} reg • {formatUSD(masterTotales.rezagadas_agosto_total || 35257.31)})
                        </button>
                        <button
                          onClick={() => { setFilterRezagadaSubmes('junio'); setPageMaster(1); }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                            filterRezagadaSubmes === 'junio'
                              ? 'bg-teal-600 text-white border-teal-700 shadow-xs ring-2 ring-teal-200'
                              : 'bg-white text-teal-900 border-teal-200 hover:bg-teal-50'
                          }`}
                        >
                          📅 Junio ({masterTotales.rezagadas_junio_count || 100} reg)
                        </button>
                        <button
                          onClick={() => { setFilterRezagadaSubmes('julio'); setPageMaster(1); }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                            filterRezagadaSubmes === 'julio'
                              ? 'bg-sky-600 text-white border-sky-700 shadow-xs ring-2 ring-sky-200'
                              : 'bg-white text-sky-900 border-sky-200 hover:bg-sky-50'
                          }`}
                        >
                          📅 Julio ({masterTotales.rezagadas_julio_count || 29} reg)
                        </button>
                      </>
                    )}
                  </div>

                  {/* TOGGLE ESTADO DE AUDITORÍA: SOLO PENDIENTES vs YA CORREGIDOS vs TODOS */}
                  <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-indigo-200 shadow-2xs">
                    <span className="text-[10px] font-bold text-indigo-900 uppercase px-2 flex items-center gap-1">
                      Auditoría:
                    </span>
                    <button
                      onClick={() => { setFilterEstadoRezagada('pendientes'); setPageMaster(1); }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        filterEstadoRezagada === 'pendientes'
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                      title="Mostrar solo los consumos rezagados que aún no han sido imputados/corregidos"
                    >
                      ⏳ Solo Pendientes ({
                        filterRezagadaSubmes === 'octubre' ? (masterTotales.rezagadas_octubre_pendientes_count ?? 0) :
                        filterRezagadaSubmes === 'agosto' ? (masterTotales.rezagadas_agosto_pendientes_count ?? 291) :
                        filterRezagadaSubmes === 'junio' ? (masterTotales.rezagadas_junio_pendientes_count ?? 100) :
                        filterRezagadaSubmes === 'julio' ? (masterTotales.rezagadas_julio_pendientes_count ?? 29) :
                        (masterTotales.rezagadas_pendientes_count ?? 0)
                      })
                    </button>
                    <button
                      onClick={() => { setFilterEstadoRezagada('corregidos'); setPageMaster(1); }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        filterEstadoRezagada === 'corregidos'
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                      title="Mostrar los consumos ya corregidos y trasladados a su mes correspondiente"
                    >
                      ✓ Ya Corregidos ({
                        filterRezagadaSubmes === 'octubre' ? (masterTotales.rezagadas_octubre_corregidas_count ?? 0) :
                        filterRezagadaSubmes === 'agosto' ? (masterTotales.rezagadas_agosto_corregidas_count ?? 0) :
                        filterRezagadaSubmes === 'junio' ? (masterTotales.rezagadas_junio_corregidas_count ?? 0) :
                        filterRezagadaSubmes === 'julio' ? (masterTotales.rezagadas_julio_corregidas_count ?? 0) :
                        (masterTotales.rezagadas_corregidas_count ?? 0)
                      })
                    </button>
                    <button
                      onClick={() => { setFilterEstadoRezagada('descartadas'); setPageMaster(1); }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        filterEstadoRezagada === 'descartadas'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                      title="Mostrar los registros que sacaste de rezagadas para confirmarlos como movimientos normales de este mes"
                    >
                      🚫 Sacadas / No Rezagadas ({masterTotales.rezagadas_descartadas_count || 0})
                    </button>
                    <button
                      onClick={() => { setFilterEstadoRezagada('todos'); setPageMaster(1); }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        filterEstadoRezagada === 'todos'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                      title="Mostrar todos los consumos rezagados sin importar su estado"
                    >
                      Todos ({
                        filterRezagadaSubmes === 'octubre' ? (masterTotales.rezagadas_octubre_count ?? 0) :
                        filterRezagadaSubmes === 'agosto' ? (masterTotales.rezagadas_agosto_count || 291) :
                        filterRezagadaSubmes === 'junio' ? (masterTotales.rezagadas_junio_count || 100) :
                        filterRezagadaSubmes === 'julio' ? (masterTotales.rezagadas_julio_count || 29) :
                        (masterTotales.norm_rezagadas_count || 0)
                      })
                    </button>
                  </div>
                </div>

                {filterRezagadaSubmes !== 'todos' && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => handleAplicarCorreccionMasiva(
                        filterRezagadaSubmes === 'octubre' ? 'Octubre' : filterRezagadaSubmes === 'agosto' ? 'Agosto' : filterRezagadaSubmes === 'junio' ? 'Junio' : filterRezagadaSubmes === 'julio' ? 'Julio' : 'auto'
                      )}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-700 hover:bg-indigo-800 text-white shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Enviar bloque de {filterRezagadaSubmes.toUpperCase()} a Correcciones
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TABLA PRINCIPAL DEL MASTER UNIFICADO (40 COLUMNAS EXACTAS DE EXCEL) */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col">
              {/* Barra superior de la tabla */}
              <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    Sábana Unificada (Formato Oficial)
                  </span>
                  <span className="text-xs text-slate-500">
                    • Mostrando filas {((pageMaster - 1) * limitMaster) + 1} a {Math.min(pageMaster * limitMaster, masterTotales.total_count)} de {formatNumber(masterTotales.total_count)}
                  </span>
                  {isLoadingMaster && (
                    <span className="flex items-center gap-1 text-[11px] text-blue-600 ml-2 animate-pulse">
                      <RefreshCw className="w-3 h-3 animate-spin" /> Cargando...
                    </span>
                  )}
                </div>

                {/* Controles de Paginación */}
                <div className="flex items-center gap-3 text-xs w-full sm:w-auto justify-between sm:justify-end">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 text-[11px]">Filas/pág:</span>
                    <select
                      value={limitMaster}
                      onChange={(e) => {
                        setLimitMaster(parseInt(e.target.value));
                        setPageMaster(1);
                      }}
                      className="bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800"
                    >
                      <option value="50">50</option>
                      <option value="100">100</option>
                      <option value="250">250</option>
                      <option value="500">500</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-slate-700 text-[11px]">
                      <ArrowUpDown className="w-3 h-3 text-blue-600" />
                      <span>Ordenado: <strong className="text-blue-700">{sortMasterOrder === 'desc' ? 'Mayor a menor' : 'Menor a mayor'}</strong> ({sortMasterBy.toUpperCase().replace('_', ' ')})</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPageMaster(1)}
                      disabled={pageMaster <= 1 || isLoadingMaster}
                      className="p-1.5 rounded bg-white hover:bg-slate-100 border border-slate-200 disabled:opacity-30 text-slate-700 shadow-2xs"
                      title="Primera página"
                    >
                      <ChevronsLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setPageMaster(p => Math.max(1, p - 1))}
                      disabled={pageMaster <= 1 || isLoadingMaster}
                      className="p-1.5 rounded bg-white hover:bg-slate-100 border border-slate-200 disabled:opacity-30 text-slate-700 shadow-2xs"
                      title="Página anterior"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-2 text-[11px] font-mono text-slate-700 font-semibold">
                      Pág {pageMaster} de {totalPagesMaster}
                    </span>
                    <button
                      onClick={() => setPageMaster(p => Math.min(totalPagesMaster, p + 1))}
                      disabled={pageMaster >= totalPagesMaster || isLoadingMaster}
                      className="p-1.5 rounded bg-white hover:bg-slate-100 border border-slate-200 disabled:opacity-30 text-slate-700 shadow-2xs"
                      title="Página siguiente"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setPageMaster(totalPagesMaster)}
                      disabled={pageMaster >= totalPagesMaster || isLoadingMaster}
                      className="p-1.5 rounded bg-white hover:bg-slate-100 border border-slate-200 disabled:opacity-30 text-slate-700 shadow-2xs"
                      title="Última página"
                    >
                      <ChevronsRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
              {/* Contenedor de la Tabla con Scroll Horizontal y Vertical */}
              <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse font-sans whitespace-nowrap">
                  <thead className="sticky top-0 z-20 bg-slate-100 text-slate-700 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200 shadow-2xs">
                    <tr>
                      <th onClick={() => handleSortMaster('tipo')} className="py-2.5 px-3 border-r border-slate-200 cursor-pointer hover:bg-slate-200 transition-colors select-none">
                        Tipo {sortMasterBy === 'tipo' && (sortMasterOrder === 'desc' ? '↓' : '↑')}
                      </th>
                      <th className="py-2.5 px-3 border-r border-slate-200">Almacén</th>
                      <th onClick={() => handleSortMaster('fecha')} className="py-2.5 px-3 border-r border-slate-200 cursor-pointer hover:bg-slate-200 transition-colors select-none">
                        Fecha {sortMasterBy === 'fecha' && (sortMasterOrder === 'desc' ? '↓' : '↑')}
                      </th>
                      <th onClick={() => handleSortMaster('numero')} className="py-2.5 px-3 border-r border-slate-200 cursor-pointer hover:bg-slate-200 transition-colors select-none" title="Número de Despacho (DP) para consumos, o Solicitud de Compra (SC) para compras/servicios">
                        Número {sortMasterBy === 'numero' && (sortMasterOrder === 'desc' ? '↓' : '↑')}
                      </th>
                      <th onClick={() => handleSortMaster('pedido')} className="py-2.5 px-3 border-r border-slate-200 cursor-pointer hover:bg-slate-200 transition-colors select-none" title="Número de Pedido de Almacén (PA) para consumos, u Orden de Compra (OC) para compras/servicios">
                        Pedido {sortMasterBy === 'pedido' && (sortMasterOrder === 'desc' ? '↓' : '↑')}
                      </th>
                      <th onClick={() => handleSortMaster('cuenta_aux')} className="py-2.5 px-3 border-r border-slate-200 bg-purple-50 text-purple-900 cursor-pointer hover:bg-purple-100 transition-colors select-none" title="Cuenta Auxiliar (Haz clic en cualquier celda para corregir e imputar directamente)">
                        Cuenta-Aux ✎ {sortMasterBy === 'cuenta_aux' && (sortMasterOrder === 'desc' ? '↓' : '↑')}
                      </th>
                      <th className="py-2.5 px-3 border-r border-slate-200">Ceco</th>
                      <th onClick={() => handleSortMaster('codigo')} className="py-2.5 px-3 border-r border-slate-200 cursor-pointer hover:bg-slate-200 transition-colors select-none">
                        Código {sortMasterBy === 'codigo' && (sortMasterOrder === 'desc' ? '↓' : '↑')}
                      </th>
                      <th onClick={() => handleSortMaster('descripcion')} className="py-2.5 px-3 border-r border-slate-200 min-w-[280px] cursor-pointer hover:bg-slate-200 transition-colors select-none">
                        Descripción {sortMasterBy === 'descripcion' && (sortMasterOrder === 'desc' ? '↓' : '↑')}
                      </th>
                      <th onClick={() => handleSortMaster('cantidad')} className="py-2.5 px-3 border-r border-slate-200 text-right cursor-pointer hover:bg-slate-200 transition-colors select-none">
                        Cantidad {sortMasterBy === 'cantidad' && (sortMasterOrder === 'desc' ? '↓' : '↑')}
                      </th>
                      <th className="py-2.5 px-3 border-r border-slate-200">Unidad</th>
                      <th onClick={() => handleSortMaster('solicitante')} className="py-2.5 px-3 border-r border-slate-200 min-w-[150px] cursor-pointer hover:bg-slate-200 transition-colors select-none">
                        Solicitante {sortMasterBy === 'solicitante' && (sortMasterOrder === 'desc' ? '↓' : '↑')}
                      </th>
                      <th onClick={() => handleSortMaster('proveedor')} className="py-2.5 px-3 border-r border-slate-200 min-w-[180px] cursor-pointer hover:bg-slate-200 transition-colors select-none">
                        Proveedor {sortMasterBy === 'proveedor' && (sortMasterOrder === 'desc' ? '↓' : '↑')}
                      </th>
                      <th className="py-2.5 px-3 border-r border-slate-200 min-w-[280px] bg-amber-50/50 text-amber-950 font-bold">Motivo</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 min-w-[260px] bg-indigo-50/80 text-indigo-950 font-bold text-center select-none" title="Columna de auditoría: identifica consumos o solicitudes donde la fecha del motivo no corresponde con la fecha del documento">
                        Pendientes por Revisar / Corregir
                      </th>
                      <th className="py-2.5 px-3 border-r border-slate-200">Ajuste</th>
                      <th onClick={() => handleSortMaster('categoria')} className="py-2.5 px-3 border-r border-slate-200 min-w-[180px] cursor-pointer hover:bg-slate-200 transition-colors select-none">
                        Categoría {sortMasterBy === 'categoria' && (sortMasterOrder === 'desc' ? '↓' : '↑')}
                      </th>
                      <th onClick={() => handleSortMaster('precio_final')} className="py-2.5 px-3 border-r border-slate-200 text-right cursor-pointer hover:bg-slate-200 transition-colors select-none" title="Precio Unitario en USD ($)">
                        Precio Final ($) {sortMasterBy === 'precio_final' && (sortMasterOrder === 'desc' ? '↓' : '↑')}
                      </th>
                      <th onClick={() => handleSortMaster('total_usd')} className="py-2.5 px-3 border-r border-slate-200 text-right font-bold text-slate-900 bg-slate-100 cursor-pointer hover:bg-slate-200 transition-colors select-none">
                        Total USD ($) {sortMasterBy === 'total_usd' ? (sortMasterOrder === 'desc' ? '▼ (Mayor a menor)' : '▲ (Menor a mayor)') : '↕'}
                      </th>
                      <th onClick={() => handleSortMaster('precio_dolar')} className="py-2.5 px-3 border-r border-slate-200 text-right cursor-pointer hover:bg-slate-200 transition-colors select-none" title="Precio Unitario en USD ($)">
                        Precio$ ($) {sortMasterBy === 'precio_dolar' && (sortMasterOrder === 'desc' ? '↓' : '↑')}
                      </th>
                      <th className="py-2.5 px-3 border-r border-slate-200 text-center">Semana</th>
                      <th className="py-2.5 px-3 border-r border-slate-200">Fecha Hasta</th>
                      <th className="py-2.5 px-3 border-r border-slate-200">Cargo</th>
                      <th className="py-2.5 px-3 border-r border-slate-200">Supervisor</th>
                      <th className="py-2.5 px-3 border-r border-slate-200">Área / Ubicación</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 text-right">Tarifa</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 min-w-[150px]">Actividad</th>
                      <th className="py-2.5 px-3 border-r border-slate-200">Línea de Producción</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 min-w-[280px]">Datos.Descripción</th>
                      <th className="py-2.5 px-3 border-r border-slate-200">Datos.Tipo Costo</th>
                      <th className="py-2.5 px-3 border-r border-slate-200">Datos.Tipo de Equipo</th>
                      <th className="py-2.5 px-3 border-r border-slate-200">Datos.Código Sysman</th>
                      <th className="py-2.5 px-3 border-r border-slate-200">Datos.Zona</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 text-center">Año</th>
                      <th className="py-2.5 px-3 text-center">Nombre del Mes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {masterRows.map((r, idx) => {
                      const aVal = (r.ajuste || '').toUpperCase().trim();
                      const isAjusteNorm = aVal.includes('NORMALIZ');
                      const isAjusteMan = aVal.includes('MANUAL');
                      const isCorr = aVal.includes('CORREGIDO') || (r as any).esReclasificado;
                      const subtipoNorm = clasificarNormalizacion(r);
                      return (
                        <tr 
                          key={r.id || idx} 
                          className={`transition-colors ${
                            subtipoNorm === 'rezagada' 
                              ? 'bg-indigo-50/40 hover:bg-indigo-100/50' 
                              : isAjusteMan
                              ? 'bg-rose-50/30 hover:bg-rose-100/40'
                              : isAjusteNorm 
                              ? 'bg-amber-50/40 hover:bg-amber-100/50' 
                              : isCorr 
                              ? 'bg-purple-50/30 hover:bg-purple-100/40' 
                              : 'hover:bg-blue-50/40'
                          }`}
                        >
                          <td className="py-2 px-3 border-r border-slate-100 font-sans text-slate-900 font-medium whitespace-nowrap">
                            {r.tipo}
                          </td>
                          <td className="py-2 px-3 text-slate-500 border-r border-slate-100">
                            {r.almacen}
                          </td>
                          <td className="py-2 px-3 text-slate-700 font-mono border-r border-slate-100 whitespace-nowrap">
                            {formatFechaDDMMAAAA(r.fecha)}
                          </td>
                          <td className="py-2 px-3 text-blue-600 font-bold border-r border-slate-100">
                            <div className="flex items-center gap-1 flex-wrap">
                              <span>{r.numero}</span>
                              {(r as any).esTrasladado ? (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-0.5" title={`Consumo rezagado transferido desde ${(r as any).mesOrigen || 'Septiembre'}`}>
                                  📥 TRASLADADO DE {(r as any).mesOrigen?.toUpperCase() || 'SEPTIEMBRE'}
                                </span>
                              ) : subtipoNorm === 'rezagada' ? (
                                <span className="px-1 py-0.2 rounded text-[9px] font-black bg-indigo-200 text-indigo-900 border border-indigo-300" title={`Consumo rezagado perteneciente a ${detectarMesRezagada(r) || 'mes anterior'}`}>
                                  {detectarMesRezagada(r) ? `REZ. ${detectarMesRezagada(r)?.toUpperCase()}` : 'REZAGADA'}
                                </span>
                              ) : isAjusteMan ? (
                                <span className="px-1 py-0.2 rounded text-[9px] font-black bg-rose-200 text-rose-900 border border-rose-300" title="Ajuste manual histórico">
                                  MANUAL
                                </span>
                              ) : isAjusteNorm ? (
                                <span className="px-1 py-0.2 rounded text-[9px] font-black bg-amber-200 text-amber-900 border border-amber-300" title="Ajuste Normalización de inventario">
                                  NORM
                                </span>
                              ) : null}
                            </div>
                          </td>
                          <td className="py-2 px-3 text-slate-600 border-r border-slate-100">
                            {r.pedido}
                          </td>
                          <td className="py-2 px-3 border-r border-slate-100">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <button
                                onClick={() => handleOpenCorreccionFromItem(r, 'unificada')}
                                className={`group inline-flex items-center gap-1 px-2 py-0.5 rounded-md border transition-all font-mono font-bold text-xs cursor-pointer shadow-2xs ${
                                  isCorr 
                                    ? 'bg-purple-100 hover:bg-purple-200 border-purple-300 text-purple-900' 
                                    : 'bg-purple-50 hover:bg-purple-100 border-purple-200 hover:border-purple-300 text-purple-800 hover:text-purple-900'
                                }`}
                                title="Clic para corregir / re-imputar esta cuenta auxiliar"
                              >
                                <span>{resolverCodigoCuentaAuxiliar(r.cuenta_aux, r.motivo, r.descripcion, r.solicitante) || 'S/A'}</span>
                                <Edit3 className="w-3 h-3 text-purple-400 group-hover:text-purple-700 transition-colors" />
                              </button>
                              {isCorr && (
                                <span 
                                  className="px-1.5 py-0.5 rounded text-[10px] bg-purple-100 text-purple-900 font-bold border border-purple-300 flex items-center gap-0.5" 
                                  title={`Reclasificado a ${r.nombre_mes || 'otro mes'}. Original: ${(r as any).cuenta_aux_original || (r as any).cuentaAuxiliarOriginal || 'SIP'}. Motivo: ${(r as any).infoReclasificacion?.motivo || (r as any).motivo || 'Corrección contable'}`}
                                >
                                  ✓ Corregido {(r as any).esTrasladado ? `(en ${r.nombre_mes?.toUpperCase()})` : (r.nombre_mes && r.nombre_mes.toLowerCase() !== 'septiembre' ? `→ ${r.nombre_mes.toUpperCase()}` : '')}
                                </span>
                              )}
                              <button
                                onClick={() => {
                                  const ctaCode = resolverCodigoCuentaAuxiliar(r.cuenta_aux, r.motivo, r.descripcion, r.solicitante);
                                  setSelectedCta(ctaCode);
                                  setInputProyecto(ctaCode);
                                  setPageMaster(1);
                                }}
                                className="text-slate-400 hover:text-slate-700 p-0.5 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                                title="Filtrar tabla por esta cuenta"
                              >
                                <Filter className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                          <td className="py-2 px-3 text-slate-500 border-r border-slate-100">
                            {r.ceco}
                          </td>
                          <td className="py-2 px-3 text-slate-500 border-r border-slate-100">
                            {r.codigo}
                          </td>
                          <td className="py-2 px-3 text-slate-800 border-r border-slate-100 font-sans min-w-[280px] whitespace-normal break-words leading-snug" title={r.descripcion}>
                            {r.descripcion}
                          </td>
                          <td className="py-2 px-3 text-right text-slate-700 border-r border-slate-100">
                            {formatNumber(r.cantidad)}
                          </td>
                          <td className="py-2 px-3 text-slate-500 border-r border-slate-100">
                            {r.unidad}
                          </td>
                          <td className="py-2 px-3 text-slate-800 border-r border-slate-100 font-sans min-w-[150px] whitespace-normal break-words leading-snug" title={r.solicitante}>
                            {r.solicitante || <span className="text-slate-400 italic font-mono">-</span>}
                          </td>
                          <td className="py-2 px-3 text-slate-700 border-r border-slate-100 font-sans min-w-[180px] whitespace-normal break-words leading-snug" title={r.proveedor}>
                            {r.proveedor ? (
                              <span className="font-semibold text-slate-800">{r.proveedor}</span>
                            ) : (
                              <span className="text-slate-400 italic font-mono">-</span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-slate-800 border-r border-slate-100 font-sans bg-amber-50/20 min-w-[280px] whitespace-normal break-words leading-snug" title={r.motivo}>
                            {r.motivo || <span className="text-slate-400 italic font-mono">-</span>}
                          </td>
                          {/* COLUMNA: PENDIENTES POR REVISAR / CORREGIR */}
                          <td className="py-2 px-3 border-r border-slate-100 min-w-[260px] whitespace-normal text-left">
                            {(() => {
                              const desfase = detectarDesfaseFechaMotivo(r);
                              const isDescartada = isRowDescartada(r, rezagadasDescartadas);
                              const isCorregido = !!(r.esReclasificado || (r.ajuste || '').toUpperCase().includes('CORREGIDO'));

                              if (isCorregido) {
                                const recordKey = r.id != null ? String(r.id) : (r.recordId || `${r.numero}-${r.codigo}`);
                                return (
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs">
                                      ✓ Corregido {r.nombre_mes && r.nombre_mes.toLowerCase() !== 'septiembre' ? `→ ${r.nombre_mes.toUpperCase()}` : ''}
                                    </span>
                                    <button
                                      onClick={() => handleRevertirCorreccion(recordKey)}
                                      className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[9px] font-bold bg-white hover:bg-rose-600 hover:text-white text-slate-700 border border-slate-300 transition-all cursor-pointer shadow-2xs"
                                      title="Deshacer esta corrección y restaurar a pendiente"
                                    >
                                      <RotateCcw className="w-2.5 h-2.5" /> Deshacer
                                    </button>
                                  </div>
                                );
                              }

                              if (isDescartada) {
                                return (
                                  <div className="flex items-center justify-between gap-1.5 bg-slate-50 border border-slate-200 p-1.5 rounded-lg shadow-2xs">
                                    <span className="text-[10px] font-semibold text-slate-700">
                                      ✓ Sacada (Mov. Septiembre)
                                    </span>
                                    <button
                                      onClick={() => handleRestaurarRezagada(r)}
                                      className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-white hover:bg-slate-100 text-indigo-700 border border-indigo-200 shadow-2xs transition-colors cursor-pointer"
                                      title="Reincorporar a rezagadas"
                                    >
                                      Reincorporar
                                    </button>
                                  </div>
                                );
                              }

                              if (desfase || subtipoNorm === 'rezagada') {
                                const fechaTexto = desfase?.fechaTexto || detectarMesRezagada(r) || 'Mes anterior';
                                const mesSug = desfase?.mesDetectado || detectarMesRezagada(r) || 'Agosto';
                                return (
                                  <div className="flex flex-col gap-1.5 bg-amber-50/70 p-2 rounded-xl border border-amber-300 shadow-2xs">
                                    <div className="flex items-center gap-1.5 text-amber-950 text-[10px] font-bold leading-tight">
                                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                      <span title={desfase?.detalle || `Motivo desfasado (${fechaTexto}) vs fecha doc (${formatFechaDDMMAAAA(r.fecha)})`}>
                                        Fecha en Motivo: <strong className="underline text-amber-900">{fechaTexto}</strong>
                                        <span className="text-slate-500 font-normal ml-1">(Doc: {formatFechaDDMMAAAA(r.fecha)})</span>
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                      <button
                                        onClick={() => handleQuickCorregirRezagada(r, mesSug)}
                                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs transition-colors cursor-pointer"
                                        title={`Mover inmediatamente a ${mesSug} (1 clic)`}
                                      >
                                        <CheckCircle2 className="w-2.5 h-2.5" /> Pasar a {mesSug}
                                      </button>
                                      <button
                                        onClick={() => handleOpenCorreccionFromItem(r, 'unificada')}
                                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 shadow-2xs transition-colors cursor-pointer"
                                        title="Abrir modal de edición"
                                      >
                                        <Edit3 className="w-2.5 h-2.5" /> Editar
                                      </button>
                                      <button
                                        onClick={() => handleDescartarRezagada(r)}
                                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-semibold bg-white hover:bg-rose-50 text-rose-700 hover:text-rose-800 border border-rose-300 shadow-2xs transition-colors cursor-pointer"
                                        title={`Sacar de rezagadas: confirmar que pertenece a ${selectedMes} y no debe reclasificarse`}
                                      >
                                        <XCircle className="w-2.5 h-2.5" /> Sacar
                                      </button>
                                    </div>
                                  </div>
                                );
                              }

                              return <span className="text-slate-400 text-[10px] italic">-</span>;
                            })()}
                          </td>
                          <td className="py-2 px-3 border-r border-slate-100">
                            {(() => {
                              if (subtipoNorm === 'rezagada') {
                                const detected = detectarMesRezagada(r);
                                return (
                                  <div className="flex flex-col gap-1 items-start">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-900 border border-indigo-300 shadow-2xs">
                                      ⏳ REZAGADA {detected ? `(${detected.toUpperCase()})` : ''}
                                    </span>
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => handleQuickCorregirRezagada(r, detected || (selectedMes === 'noviembre' ? 'Octubre' : 'Agosto'))}
                                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs transition-colors cursor-pointer"
                                        title={`Mover inmediatamente a ${detected || 'mes correspondiente'} (1 clic)`}
                                      >
                                        <CheckCircle2 className="w-2.5 h-2.5" /> Corregir
                                      </button>
                                      <button
                                        onClick={() => handleOpenCorreccionFromItem(r, 'unificada')}
                                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 shadow-2xs transition-colors cursor-pointer"
                                        title="Abrir modal de edición"
                                      >
                                        <Edit3 className="w-2.5 h-2.5" />
                                      </button>
                                      <button
                                        onClick={() => handleDescartarRezagada(r)}
                                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 shadow-2xs transition-colors cursor-pointer"
                                        title="Sacar de rezagadas"
                                      >
                                        <XCircle className="w-2.5 h-2.5" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              }
                              if (isAjusteMan) {
                                return (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-900 border border-rose-300 shadow-2xs">
                                    📝 MANUAL
                                  </span>
                                );
                              }
                              if (isAjusteNorm) {
                                return (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                                    ⚡ NORMALIZACIÓN
                                  </span>
                                );
                              }
                              if (isCorr) {
                                return (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-300 shadow-2xs">
                                    ✓ CORREGIDO
                                  </span>
                                );
                              }
                              if (aVal.includes('DEVOLUCION')) {
                                return (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-300 shadow-2xs">
                                    ↩ Devolución
                                  </span>
                                );
                              }
                              return <span className="text-slate-400 text-[10px]">{r.ajuste || '-'}</span>;
                            })()}
                          </td>
                        <td className="py-2 px-3 border-r border-slate-100 font-sans min-w-[180px] text-slate-800 whitespace-normal">
                          {r.categoria || '-'}
                        </td>
                        <td className="py-2 px-3 text-right text-slate-700 border-r border-slate-100 font-medium">
                          {formatUSD(r.precio_final)}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-slate-900 bg-slate-50/60 border-r border-slate-100">
                          <span className={r.total_usd > 0 ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                            {formatUSD(r.total_usd)}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right text-slate-700 border-r border-slate-100 font-medium">
                          {formatUSD(r.precio_dolar || r.precio_final)}
                        </td>
                        <td className="py-2 px-3 text-center text-slate-500 border-r border-slate-100">
                          {r.semana}
                        </td>
                        <td className="py-2 px-3 text-slate-500 font-mono border-r border-slate-100 whitespace-nowrap">
                          {formatFechaDDMMAAAA(r.fecha_hasta)}
                        </td>
                        <td className="py-2 px-3 text-slate-600 border-r border-slate-100 font-sans">
                          {r.cargo}
                        </td>
                        <td className="py-2 px-3 text-slate-600 border-r border-slate-100 font-sans">
                          {r.supervisor}
                        </td>
                        <td className="py-2 px-3 text-slate-600 border-r border-slate-100 font-sans">
                          {r.area_ubicacion}
                        </td>
                        <td className="py-2 px-3 text-right text-slate-600 border-r border-slate-100">
                          {r.tarifa ? formatUSD(r.tarifa) : ''}
                        </td>
                        <td className="py-2 px-3 text-slate-600 border-r border-slate-100 font-sans min-w-[150px] whitespace-normal break-words leading-snug" title={r.actividad}>
                          {r.actividad}
                        </td>
                        <td className="py-2 px-3 text-slate-600 border-r border-slate-100 font-sans">
                          {r.linea_produccion}
                        </td>
                        <td className="py-2 px-3 text-slate-800 border-r border-slate-100 font-sans min-w-[280px] whitespace-normal break-words leading-snug" title={r.datos_descripcion}>
                          {r.datos_descripcion}
                        </td>
                        <td className="py-2 px-3 text-slate-600 border-r border-slate-100 font-sans">
                          {r.datos_tipo_costo}
                        </td>
                        <td className="py-2 px-3 text-slate-600 border-r border-slate-100 font-sans">
                          {r.datos_tipo_equipo}
                        </td>
                        <td className="py-2 px-3 text-slate-500 border-r border-slate-100">
                          {r.datos_codigo_sysman}
                        </td>
                        <td className="py-2 px-3 text-slate-500 border-r border-slate-100">
                          {r.datos_zona}
                        </td>
                        <td className="py-2 px-3 text-center text-slate-700 border-r border-slate-100">
                          {r.ano}
                        </td>
                        <td className="py-2 px-3 text-center text-blue-600 font-semibold capitalize">
                          {r.nombre_mes}
                        </td>
                      </tr>
                    );
                  })}
                  </tbody>
                </table>
              </div>

              {/* Barra inferior de paginación */}
              <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
                <span>
                  Base Unificada SQLite • <strong>{formatNumber(masterTotales.total_count)}</strong> filas coincidentes • Gran Total: <strong className="text-slate-900 font-mono">{formatUSD(masterTotales.gran_total)}</strong>
                </span>

                <div className="flex items-center gap-1 font-mono">
                  <button
                    onClick={() => setPageMaster(1)}
                    disabled={pageMaster <= 1}
                    className="px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-30 transition-colors"
                  >
                    Inicio
                  </button>
                  <button
                    onClick={() => setPageMaster(p => Math.max(1, p - 1))}
                    disabled={pageMaster <= 1}
                    className="px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-30 transition-colors"
                  >
                    Ant
                  </button>
                  <span className="px-2 text-slate-700 font-semibold">
                    {pageMaster} / {totalPagesMaster}
                  </span>
                  <button
                    onClick={() => setPageMaster(p => Math.min(totalPagesMaster, p + 1))}
                    disabled={pageMaster >= totalPagesMaster}
                    className="px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-30 transition-colors"
                  >
                    Sig
                  </button>
                  <button
                    onClick={() => setPageMaster(totalPagesMaster)}
                    disabled={pageMaster >= totalPagesMaster}
                    className="px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-30 transition-colors"
                  >
                    Fin
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: MATRIZ Y CIERRE OCTUBRE */}
        {activeTab === 'matriz' && (
          <div className="space-y-6 animate-fadeIn">
            {/* KPI STATS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs relative overflow-hidden">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gran Total Costos Octubre</div>
                <div className="text-2xl font-black text-slate-900 mt-1 font-mono">{formatUSD(matrizTotalesDinamicos.granTotal)}</div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 mt-2 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {filterTipoMatriz === 'EXTERNOS' 
                    ? 'Proyectos de Clientes (TTE-C)' 
                    : filterTipoMatriz === 'INTERNOS' 
                      ? 'Costos Internos & OPEX' 
                      : 'Sincronizado directo de SIP'}
                </div>
                <div className="absolute right-3 top-3 text-slate-100">
                  <DollarSign className="w-16 h-16" />
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Materiales Directos (Consumos)</div>
                <div className="text-2xl font-black text-emerald-600 mt-1 font-mono">{formatUSD(matrizTotalesDinamicos.totalMateriales)}</div>
                <div className="text-xs text-slate-500 mt-2">{status?.totalConsumos || 3976} vales procesados</div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Servicios & Contratistas</div>
                <div className="text-2xl font-black text-blue-600 mt-1 font-mono">{formatUSD(matrizTotalesDinamicos.totalServicios)}</div>
                <div className="text-xs text-slate-500 mt-2">{status?.totalCompras || 1594} órdenes de compra auditadas</div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cuentas con Movimiento</div>
                <div className="text-2xl font-black text-purple-600 mt-1 font-mono">{matrizTotalesDinamicos.count}</div>
                <div className="text-xs text-slate-500 mt-2">
                  {filterTipoMatriz === 'EXTERNOS'
                    ? `${conteoExternosMatriz} proyectos externos auditados`
                    : filterTipoMatriz === 'INTERNOS'
                      ? `${conteoInternosMatriz} cuentas internas/OPEX`
                      : `De ${matrizData?.proyectos.length || 0} cuentas en matriz`}
                </div>
              </div>
            </div>

            {/* TABLA MATRIZ DE PROYECTOS */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-slate-50/50">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-600" />
                    Matriz de Costos por Proyecto (Corte 01 al 21 Octubre 2026)
                  </h2>
                  <p className="text-xs text-slate-500">Consolidación automática en dólares sin intervención manual de Excel</p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 w-full xl:w-auto">
                  {/* Segmented Control Filtro Externos / Internos */}
                  <div className="flex items-center gap-1 p-1 bg-slate-200/80 rounded-xl border border-slate-300 text-xs font-bold shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setFilterTipoMatriz('TODOS')}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        filterTipoMatriz === 'TODOS'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-700 hover:text-slate-900 hover:bg-white/70'
                      }`}
                    >
                      Todos ({matrizData?.proyectos.length || 0})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterTipoMatriz('EXTERNOS')}
                      className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                        filterTipoMatriz === 'EXTERNOS'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-700 hover:text-slate-900 hover:bg-white/70'
                      }`}
                      title="Filtrar proyectos de clientes externos (TTE-C)"
                    >
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>Proyectos Externos ({conteoExternosMatriz})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterTipoMatriz('INTERNOS')}
                      className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                        filterTipoMatriz === 'INTERNOS'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-700 hover:text-slate-900 hover:bg-white/70'
                      }`}
                      title="Filtrar costos internos, obras civiles, mantenimiento de flota y administración"
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>Internos & OPEX ({conteoInternosMatriz})</span>
                    </button>
                  </div>

                  <div className="relative flex-1 sm:w-60">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Buscar por cuenta o cliente..."
                      value={searchMatriz}
                      onChange={(e) => setSearchMatriz(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <button
                    onClick={handleExportMatrizExcel}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors cursor-pointer"
                    title="Descargar matriz en Excel"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Excel</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 uppercase font-semibold border-b border-slate-200 text-[10px] tracking-wider">
                    <tr>
                      <th className="py-2.5 px-4">Cuenta Auxiliar</th>
                      <th className="py-2.5 px-4">Descripción del Proyecto</th>
                      <th className="py-2.5 px-4">Cliente / Clasificación</th>
                      <th className="py-2.5 px-4 text-right">Materiales Directos</th>
                      <th className="py-2.5 px-4 text-right">Servicios</th>
                      <th className="py-2.5 px-4 text-right font-bold text-slate-900">Total USD</th>
                      <th className="py-2.5 px-4 text-center">Movimientos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProyectosMatriz.map((p, idx) => {
                      const esExt = isProyectoExterno(p);
                      return (
                        <tr key={p.codigo || idx} className="hover:bg-blue-50/40 transition-colors">
                          <td className="py-2.5 px-4 font-mono font-bold text-blue-600">
                            {p.codigo}
                          </td>
                          <td className="py-2.5 px-4 text-slate-800 font-medium min-w-[280px] whitespace-normal break-words leading-snug">
                            {p.nombre}
                          </td>
                          <td className="py-2.5 px-4 text-slate-600 font-sans text-xs">
                            <div className="flex flex-col gap-0.5">
                              <span className="font-semibold text-slate-800">{p.cliente || 'TIMACA'}</span>
                              <span className={`inline-flex items-center gap-1 w-fit text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                                esExt
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : 'bg-slate-100 text-slate-600 border-slate-200'
                              }`}>
                                {esExt ? 'Externo (Cliente)' : (p.tipoCosto || 'Interno / OPEX')}
                              </span>
                            </div>
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono text-emerald-600">
                            {formatUSD(p.materialesDirectos || 0)}
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono text-blue-600">
                            {formatUSD(p.servicios || 0)}
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                            {formatUSD(p.totalUSD || 0)}
                          </td>
                          <td className="py-2.5 px-4 text-center text-slate-600 font-mono text-[11px]">
                            <span className="text-emerald-600 font-semibold" title="Consumos">{p.totalItemsConsumos} C</span> + <span className="text-blue-600 font-semibold" title="Compras">{p.totalItemsCompras} O</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MONITOR CONSUMOS SIP (TODOS LOS MESES) */}
        {activeTab === 'consumos' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xs">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-emerald-600" />
                  Salidas de Almacén SIP (Consumos de Materiales)
                </h2>
                <p className="text-xs text-slate-500">Histórico completo de salidas de almacén por mes con extracción directa de SIP</p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                {/* Selector de Mes */}
                <select
                  value={filterMesConsumos}
                  onChange={(e) => {
                    setFilterMesConsumos(e.target.value);
                    setPageConsumos(1);
                  }}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-500"
                >
                  <option value="todos">📅 Todos los Meses</option>
                  <option value="enero">Enero</option>
                  <option value="febrero">Febrero</option>
                  <option value="marzo">Marzo</option>
                  <option value="abril">Abril</option>
                  <option value="mayo">Mayo</option>
                  <option value="junio">Junio</option>
                  <option value="julio">Julio</option>
                  <option value="agosto">Agosto</option>
                  <option value="septiembre">Septiembre</option>
                  <option value="octubre">Octubre</option>
                  <option value="noviembre">Noviembre</option>
                  <option value="diciembre">Diciembre</option>
                </select>

                {/* Filtro Calendario Desde - Hasta */}
                <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs shadow-2xs">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span className="text-[11px] font-semibold text-slate-500">Desde:</span>
                  <input
                    type="date"
                    value={fechaDesde}
                    onChange={(e) => {
                      setFechaDesde(e.target.value);
                      setPageMaster(1);
                      setPageConsumos(1);
                      setPageCompras(1);
                    }}
                    className="bg-transparent text-xs text-slate-900 font-semibold focus:outline-none cursor-pointer"
                  />
                  <span className="text-slate-400 font-bold px-0.5">—</span>
                  <span className="text-[11px] font-semibold text-slate-500">Hasta:</span>
                  <input
                    type="date"
                    value={fechaHasta}
                    onChange={(e) => {
                      setFechaHasta(e.target.value);
                      setPageMaster(1);
                      setPageConsumos(1);
                      setPageCompras(1);
                    }}
                    className="bg-transparent text-xs text-slate-900 font-semibold focus:outline-none cursor-pointer"
                  />
                  {(fechaDesde || fechaHasta) && (
                    <button
                      onClick={() => {
                        setFechaDesde('');
                        setFechaHasta('');
                        setPageMaster(1);
                        setPageConsumos(1);
                        setPageCompras(1);
                      }}
                      title="Limpiar fechas"
                      className="text-slate-400 hover:text-red-600 p-0.5 rounded transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Selector de Categoría */}
                <select
                  value={filterCatConsumos}
                  onChange={(e) => {
                    setFilterCatConsumos(e.target.value);
                    setPageConsumos(1);
                  }}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 max-w-[190px]"
                >
                  <option value="TODAS">🏷️ Todas las Categorías</option>
                  {(catalogFiltros.categorias_consumos || []).map((cat: string) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                {/* Selector de Cuenta */}
                <select
                  value={filterCtaConsumos}
                  onChange={(e) => {
                    setFilterCtaConsumos(e.target.value);
                    setPageConsumos(1);
                  }}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="TODAS">🏛️ Todas las Cuentas</option>
                  <option value="TTE-C-0706">TTE-C-0706 (Pellas)</option>
                  <option value="TTE-C-0693">TTE-C-0693 (PMH Muelle)</option>
                  <option value="TTE-C-0671">TTE-C-0671 (2da Línea PMH)</option>
                  <option value="TTE-C-0678">TTE-C-0678 (Pila HA/HB)</option>
                  <option value="TT-I-C-033">TT-I-C-033 (Contenedores)</option>
                  <option value="TTI-C-0105">TTI-C-0105 (Patio)</option>
                </select>

                {/* Búsqueda General */}
                <div className="relative flex-1 md:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Búsqueda general (DP, PA, código, motivo, solicitante)..."
                    value={searchConsumos}
                    onChange={(e) => {
                      setSearchConsumos(e.target.value);
                      setPageConsumos(1);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Banner de Rango de Fechas Activo en Consumos */}
            {(fechaDesde || fechaHasta) && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs shadow-2xs">
                <div className="flex items-center gap-2 text-emerald-950 font-semibold">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <span>Filtrando salidas de almacén: <strong className="font-bold underline">{getRangeDisplay()}</strong> ({totalConsumosCount} movimientos)</span>
                </div>
                <button
                  onClick={() => {
                    setFechaDesde('');
                    setFechaHasta('');
                    setPageMaster(1);
                    setPageConsumos(1);
                    setPageCompras(1);
                  }}
                  className="text-xs font-bold text-emerald-700 hover:text-red-600 hover:underline flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  Quitar filtro de fecha
                </button>
              </div>
            )}

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-slate-100 text-slate-700 uppercase font-semibold border-b border-slate-200 text-[10px] tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3 border-r border-slate-200">Vale (DP)</th>
                      <th className="py-2.5 px-3 border-r border-slate-200">Pedido (PA)</th>
                      <th className="py-2.5 px-3 border-r border-slate-200">Fecha</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 text-center">Mes</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 bg-purple-50 text-purple-900" title="Haz clic en cualquier cuenta para corregir e imputar directamente">Cuenta Auxiliar ✎</th>
                      <th className="py-2.5 px-3 border-r border-slate-200">Código</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 min-w-[220px]">Descripción</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 min-w-[150px]">Categoría</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 min-w-[280px] max-w-[440px] bg-amber-50/50 text-amber-950 font-bold">Motivo</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 text-right">Cantidad</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 text-right">Costo Unit $</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 text-right font-bold text-slate-900 bg-slate-50">Total USD</th>
                      <th className="py-2.5 px-3 min-w-[140px]">Solicitante</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px]">
                    {isLoadingConsumos ? (
                      <tr>
                        <td colSpan={13} className="py-12 text-center text-slate-400">
                          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-600" />
                          Cargando consumos de almacén...
                        </td>
                      </tr>
                    ) : consumos.length === 0 ? (
                      <tr>
                        <td colSpan={13} className="py-12 text-center text-slate-400 italic">
                          No se encontraron consumos con los filtros seleccionados.
                        </td>
                      </tr>
                    ) : (
                      consumos.map((c) => (
                        <tr key={c.id} className="hover:bg-blue-50/40 transition-colors">
                          <td className="py-2 px-3 font-mono font-bold text-emerald-600 border-r border-slate-100">
                            {c.numero}
                          </td>
                          <td className="py-2 px-3 font-mono text-slate-700 border-r border-slate-100">
                            {c.pedido || '-'}
                          </td>
                          <td className="py-2 px-3 text-slate-700 font-mono text-[11px] border-r border-slate-100 whitespace-nowrap">
                            {formatFechaDDMMAAAA(c.fecha)}
                          </td>
                          <td className="py-2 px-3 text-slate-500 font-mono uppercase text-[10px] font-bold text-center border-r border-slate-100">
                            {c.nombre_mes || '-'}
                          </td>
                          <td className="py-2 px-3 border-r border-slate-100">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <button
                                onClick={() => handleOpenCorreccionFromItem(c, 'consumos')}
                                className="group inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 hover:bg-purple-100 border border-purple-200 hover:border-purple-300 text-purple-800 hover:text-purple-900 transition-all font-mono font-bold text-xs cursor-pointer shadow-2xs"
                                title="Clic para corregir / re-imputar esta cuenta auxiliar"
                              >
                                <span>{resolverCodigoCuentaAuxiliar(c.cuentaAuxiliar, c.motivo, c.descripcion, c.solicitante) || 'S/A'}</span>
                                <Edit3 className="w-3 h-3 text-purple-400 group-hover:text-purple-700 transition-colors" />
                              </button>
                              {c.esReclasificado && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold border border-emerald-300" title="Reclasificado">
                                  ✓ Corregido
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-2 px-3 font-mono text-slate-500 text-[11px] border-r border-slate-100">
                            {c.codigo}
                          </td>
                          <td className="py-2 px-3 text-slate-800 min-w-[220px] whitespace-normal break-words leading-snug border-r border-slate-100 font-sans">
                            {c.descripcion}
                          </td>
                          <td className="py-2 px-3 font-sans min-w-[150px] text-slate-800 border-r border-slate-100">
                            {c.categoria || 'Materiales Directos'}
                          </td>
                          <td className="py-2 px-3 text-slate-800 bg-amber-50/20 min-w-[280px] max-w-[440px] whitespace-normal break-words leading-snug border-r border-slate-100 font-sans">
                            {c.motivo || <span className="text-slate-400 italic font-mono">-</span>}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-slate-700 border-r border-slate-100">
                            {c.cantidad} {c.unidad}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-slate-600 border-r border-slate-100">
                            {formatUSD(c.costoUnitario)}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-emerald-600 bg-slate-50/40 border-r border-slate-100">
                            {formatUSD(c.totalUSD)}
                          </td>
                          <td className="py-2 px-3 text-slate-600 text-xs min-w-[140px] whitespace-normal break-words leading-snug">
                            {c.solicitante}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Paginación y Totales */}
              <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="flex items-center gap-3">
                  <span>Página <strong className="text-slate-900">{pageConsumos}</strong> de <strong className="text-slate-900">{Math.max(1, Math.ceil(totalConsumosCount / 100))}</strong> ({totalConsumosCount.toLocaleString()} consumos)</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPageConsumos(p => Math.max(1, p - 1))}
                      disabled={pageConsumos <= 1 || isLoadingConsumos}
                      className="px-2.5 py-1 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 text-slate-700 font-bold"
                    >
                      ← Anterior
                    </button>
                    <button
                      onClick={() => setPageConsumos(p => (p * 100 < totalConsumosCount ? p + 1 : p))}
                      disabled={pageConsumos * 100 >= totalConsumosCount || isLoadingConsumos}
                      className="px-2.5 py-1 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 text-slate-700 font-bold"
                    >
                      Siguiente →
                    </button>
                  </div>
                </div>
                <div className="font-semibold text-emerald-700 font-mono text-xs bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                  Total USD Filtrado: {formatUSD(totalConsumosUSD)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MONITOR COMPRAS Y SERVICIOS SIP (TODOS LOS MESES) */}
        {activeTab === 'compras' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xs">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-blue-600" />
                  Compras y Servicios SIP
                </h2>
                <p className="text-xs text-slate-500">Histórico completo de solicitudes y órdenes de compras/servicios aprobadas por mes</p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                {/* Selector de Mes */}
                <select
                  value={filterMesCompras}
                  onChange={(e) => {
                    setFilterMesCompras(e.target.value);
                    setPageCompras(1);
                  }}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-500"
                >
                  <option value="todos">📅 Todos los Meses</option>
                  <option value="enero">Enero</option>
                  <option value="febrero">Febrero</option>
                  <option value="marzo">Marzo</option>
                  <option value="abril">Abril</option>
                  <option value="mayo">Mayo</option>
                  <option value="junio">Junio</option>
                  <option value="julio">Julio</option>
                  <option value="agosto">Agosto</option>
                  <option value="septiembre">Septiembre</option>
                  <option value="octubre">Octubre</option>
                  <option value="noviembre">Noviembre</option>
                  <option value="diciembre">Diciembre</option>
                </select>

                {/* Filtro Calendario Desde - Hasta */}
                <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs shadow-2xs">
                  <Calendar className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span className="text-[11px] font-semibold text-slate-500">Desde:</span>
                  <input
                    type="date"
                    value={fechaDesde}
                    onChange={(e) => {
                      setFechaDesde(e.target.value);
                      setPageMaster(1);
                      setPageConsumos(1);
                      setPageCompras(1);
                    }}
                    className="bg-transparent text-xs text-slate-900 font-semibold focus:outline-none cursor-pointer"
                  />
                  <span className="text-slate-400 font-bold px-0.5">—</span>
                  <span className="text-[11px] font-semibold text-slate-500">Hasta:</span>
                  <input
                    type="date"
                    value={fechaHasta}
                    onChange={(e) => {
                      setFechaHasta(e.target.value);
                      setPageMaster(1);
                      setPageConsumos(1);
                      setPageCompras(1);
                    }}
                    className="bg-transparent text-xs text-slate-900 font-semibold focus:outline-none cursor-pointer"
                  />
                  {(fechaDesde || fechaHasta) && (
                    <button
                      onClick={() => {
                        setFechaDesde('');
                        setFechaHasta('');
                        setPageMaster(1);
                        setPageConsumos(1);
                        setPageCompras(1);
                      }}
                      title="Limpiar fechas"
                      className="text-slate-400 hover:text-red-600 p-0.5 rounded transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Selector de Categoría */}
                <select
                  value={filterCatCompras}
                  onChange={(e) => {
                    setFilterCatCompras(e.target.value);
                    setPageCompras(1);
                  }}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 max-w-[190px]"
                >
                  <option value="TODAS">🏷️ Todas las Categorías</option>
                  {(catalogFiltros.categorias_compras || ['SERVICIOS']).map((cat: string) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                {/* Selector de Tipo */}
                <select
                  value={filterTipoCompras}
                  onChange={(e) => {
                    setFilterTipoCompras(e.target.value);
                    setPageCompras(1);
                  }}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="TODOS">Todos los Tipos</option>
                  <option value="Servicios">Solo Servicios</option>
                  <option value="Compras / Materiales">Compras / Materiales</option>
                </select>

                {/* Búsqueda General */}
                <div className="relative flex-1 md:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Búsqueda general (SC, OC, código, descripción, motivo, solicitante)..."
                    value={searchCompras}
                    onChange={(e) => {
                      setSearchCompras(e.target.value);
                      setPageCompras(1);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Banner de Rango de Fechas Activo en Compras */}
            {(fechaDesde || fechaHasta) && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs shadow-2xs">
                <div className="flex items-center gap-2 text-blue-950 font-semibold">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>Filtrando compras y servicios: <strong className="font-bold underline">{getRangeDisplay()}</strong> ({totalComprasCount} movimientos)</span>
                </div>
                <button
                  onClick={() => {
                    setFechaDesde('');
                    setFechaHasta('');
                    setPageMaster(1);
                    setPageConsumos(1);
                    setPageCompras(1);
                  }}
                  className="text-xs font-bold text-blue-700 hover:text-red-600 hover:underline flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  Quitar filtro de fecha
                </button>
              </div>
            )}

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-slate-100 text-slate-700 uppercase font-semibold border-b border-slate-200 text-[10px] tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3 border-r border-slate-200">Almacén</th>
                      <th className="py-2.5 px-3 border-r border-slate-200">SC</th>
                      <th className="py-2.5 px-3 border-r border-slate-200">OC</th>
                      <th className="py-2.5 px-3 border-r border-slate-200">Fecha</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 text-center">Mes</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 bg-purple-50 text-purple-900" title="Haz clic en cualquier cuenta para corregir e imputar directamente">Cuenta Auxiliar ✎</th>
                      <th className="py-2.5 px-3 border-r border-slate-200">Código</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 min-w-[220px]">Descripción</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 min-w-[150px]">Categoría</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 min-w-[280px] max-w-[450px] bg-amber-50/50 text-amber-950 font-bold">Motivo</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 text-right">Cantidad</th>
                      <th className="py-2.5 px-3 border-r border-slate-200">Unidad</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 text-right">Precio $</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 text-right font-bold text-slate-900 bg-slate-50">Total USD</th>
                      <th className="py-2.5 px-3 min-w-[160px]">Solicitante / Proveedor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px] font-sans">
                    {isLoadingCompras ? (
                      <tr>
                        <td colSpan={15} className="py-12 text-center text-slate-400">
                          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-600" />
                          Cargando compras y servicios...
                        </td>
                      </tr>
                    ) : compras.length === 0 ? (
                      <tr>
                        <td colSpan={15} className="py-12 text-center text-slate-400 italic">
                          No se encontraron compras ni servicios con los filtros seleccionados.
                        </td>
                      </tr>
                    ) : (
                      compras.map((c) => (
                        <tr key={c.id} className="hover:bg-blue-50/40 transition-colors">
                          <td className="py-2 px-3 text-slate-500 font-mono border-r border-slate-100">
                            {c.almacen}
                          </td>
                          <td className="py-2 px-3 font-mono font-bold text-blue-600 border-r border-slate-100">
                            {c.solicitudCompra || '-'}
                          </td>
                          <td className="py-2 px-3 font-mono font-bold text-slate-800 border-r border-slate-100">
                            {c.ordenCompra || '-'}
                          </td>
                          <td className="py-2 px-3 text-slate-700 font-mono text-[11px] border-r border-slate-100 whitespace-nowrap">
                            {formatFechaDDMMAAAA(c.fechaSolicitud || c.fechaOC)}
                          </td>
                          <td className="py-2 px-3 text-slate-500 font-mono uppercase text-[10px] font-bold text-center border-r border-slate-100">
                            {c.nombre_mes || '-'}
                          </td>
                          <td className="py-2 px-3 border-r border-slate-100">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <button
                                onClick={() => handleOpenCorreccionFromItem(c, 'compras')}
                                className="group inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 hover:bg-purple-100 border border-purple-200 hover:border-purple-300 text-purple-800 hover:text-purple-900 transition-all font-mono font-bold text-xs cursor-pointer shadow-2xs"
                                title="Clic para corregir / re-imputar esta cuenta auxiliar"
                              >
                                <span>{resolverCodigoCuentaAuxiliar(c.cuentaAuxiliar, c.motivo, c.descripcion, c.solicitante) || 'S/A'}</span>
                                <Edit3 className="w-3 h-3 text-purple-400 group-hover:text-purple-700 transition-colors" />
                              </button>
                              {c.esReclasificado && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold border border-emerald-300" title="Reclasificado">
                                  ✓ Corregido
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-2 px-3 font-mono text-slate-500 border-r border-slate-100">
                            {c.codigo}
                          </td>
                          <td className="py-2 px-3 text-slate-800 border-r border-slate-100 font-sans min-w-[220px] whitespace-normal break-words leading-snug" title={c.descripcion}>
                            {c.descripcion}
                          </td>
                          <td className="py-2 px-3 border-r border-slate-100 font-sans min-w-[150px] text-slate-800">
                            {c.categoria || (c.tipo === 'Servicios' ? 'SERVICIOS' : 'Materiales Directos')}
                          </td>
                          <td className="py-2 px-3 text-slate-800 border-r border-slate-100 bg-amber-50/20 min-w-[280px] max-w-[450px] whitespace-normal break-words leading-relaxed text-[12px] font-medium" title={c.motivo || 'Sin motivo'}>
                            {c.motivo || <span className="text-slate-400 italic">Sin motivo registrado</span>}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-slate-700 border-r border-slate-100">
                            {formatNumber(c.cantidadSolicitada || c.cantidadOC || 1)}
                          </td>
                          <td className="py-2 px-3 text-slate-500 border-r border-slate-100">
                            {c.unidad || 'UND'}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-slate-700 border-r border-slate-100">
                            {formatUSD(c.precioUnitario)}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 bg-slate-50/50 border-r border-slate-100">
                            <span className={c.totalUSD > 0 ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                              {formatUSD(c.totalUSD)}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-slate-700 min-w-[160px] whitespace-normal break-words leading-snug" title={c.solicitante || c.proveedor}>
                            {c.solicitante || c.proveedor || c.comprador || '-'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Paginación y Totales Compras */}
              <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="flex items-center gap-3">
                  <span>Página <strong className="text-slate-900">{pageCompras}</strong> de <strong className="text-slate-900">{Math.max(1, Math.ceil(totalComprasCount / 100))}</strong> ({totalComprasCount.toLocaleString()} compras/servicios)</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPageCompras(p => Math.max(1, p - 1))}
                      disabled={pageCompras <= 1 || isLoadingCompras}
                      className="px-2.5 py-1 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 text-slate-700 font-bold"
                    >
                      ← Anterior
                    </button>
                    <button
                      onClick={() => setPageCompras(p => (p * 100 < totalComprasCount ? p + 1 : p))}
                      disabled={pageCompras * 100 >= totalComprasCount || isLoadingCompras}
                      className="px-2.5 py-1 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 text-slate-700 font-bold"
                    >
                      Siguiente →
                    </button>
                  </div>
                </div>
                <div className="font-semibold text-blue-700 font-mono text-xs bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
                  Total USD Filtrado: {formatUSD(totalComprasUSD)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: MÓDULO DE CORRECCIONES CONTABLES (SUSTITUTO OFICIAL DE CORRECCIONES.XLSX) */}
        {activeTab === 'correcciones' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ArrowRightLeft className="w-5 h-5 text-purple-600" />
                  Módulo de Correcciones Contables
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Módulo centralizado de auditoría y correcciones contables. Integra las <strong>456 correcciones históricas</strong> (<code className="text-slate-700 font-mono font-semibold">Correcciones.xlsx</code>) más las <strong>3.668 valorizaciones y ajustes detectados directamente en el sistema SIP</strong> por Alejandra Tesara.
                </p>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-50 border border-purple-200 text-purple-800 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-purple-600" />
                <span>{(reclasificaciones.length || status?.totalReclasificaciones || 4138).toLocaleString()} correcciones activas</span>
              </div>
            </div>

            {/* Notification message */}
            {correccionMessage && (
              <div className={`p-4 rounded-xl border flex items-center justify-between text-xs font-semibold ${
                correccionMessage.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}>
                <div className="flex items-center gap-2">
                  {correccionMessage.type === 'success' ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                  )}
                  <span>{correccionMessage.text}</span>
                </div>
                <button
                  onClick={() => setCorreccionMessage(null)}
                  className="text-slate-400 hover:text-slate-700 font-bold ml-4"
                >
                  ✕
                </button>
              </div>
            )}

            {/* SECCIÓN 1: BUSCADOR DEL MOVIMIENTO A CORREGIR */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <Search className="w-4 h-4 text-blue-600" />
                    1. Buscar Movimiento de SIP a Corregir
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Busca por número de Vale/Despacho (DP...), Pedido (PA...), Solicitud (SC...), Orden de Compra (OC...), código, descripción, motivo o solicitante.
                  </p>
                </div>
                {selectedMovimiento && (
                  <button
                    onClick={() => setSelectedMovimiento(null)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold underline"
                  >
                    Buscar otro movimiento
                  </button>
                )}
              </div>

              {!selectedMovimiento ? (
                <div className="space-y-3">
                  {/* Píldoras de Filtro Rápido por Estado de Corrección */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 pb-0.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mr-1">Ver:</span>
                    <button
                      onClick={() => setFiltroEstadoCorreccion('todos')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        filtroEstadoCorreccion === 'todos'
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Todos
                    </button>
                    <button
                      onClick={() => setFiltroEstadoCorreccion('pendientes')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                        filtroEstadoCorreccion === 'pendientes'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
                      }`}
                    >
                      <span>⏳ Solo Pendientes (Sin corregir)</span>
                    </button>
                    <button
                      onClick={() => setFiltroEstadoCorreccion('corregidos')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                        filtroEstadoCorreccion === 'corregidos'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100'
                      }`}
                    >
                      <span>✓ Solo Ya Corregidos ({reclasificaciones.length})</span>
                    </button>
                    <button
                      onClick={() => setFiltroEstadoCorreccion('consumos')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        filtroEstadoCorreccion === 'consumos'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Solo Consumos (DP / PA)
                    </button>
                    <button
                      onClick={() => setFiltroEstadoCorreccion('compras')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        filtroEstadoCorreccion === 'compras'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Solo Servicios / Compras (SC / OC)
                    </button>
                  </div>

                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Ej: DP0041717, PA43600, SC26724, OC23572, FLETE, CEMENTO, JESUS VALDEZ..."
                      value={searchMovimiento}
                      onChange={(e) => setSearchMovimiento(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs font-mono"
                    />
                  </div>

                  {/* Resultados candidatos */}
                  {candidateMovimientos.length > 0 ? (
                    <div className="border border-slate-200 rounded-xl overflow-hidden max-h-80 overflow-y-auto divide-y divide-slate-100 bg-white shadow-2xs">
                      {candidateMovimientos.map((m) => (
                        <div
                          key={m.id}
                          onClick={() => handleSelectMovimiento(m)}
                          className={`p-3.5 transition-colors cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs ${
                            m.esReclasificado 
                              ? 'bg-emerald-50/30 hover:bg-emerald-50/70 border-l-4 border-l-emerald-500' 
                              : 'hover:bg-blue-50/60 border-l-4 border-l-slate-200'
                          }`}
                        >
                          <div className="space-y-1.5 flex-1">
                            {/* Barra de Tipo y Estado */}
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                m.tipo === 'consumo' ? 'bg-blue-100 text-blue-800' : 'bg-indigo-100 text-indigo-800'
                              }`}>
                                {m.tipo === 'consumo' ? 'Consumo de Almacén' : 'Compra / Servicio'}
                              </span>

                              {m.esReclasificado ? (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 shadow-2xs">
                                  ✓ YA CORREGIDO
                                </span>
                              ) : (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1 shadow-2xs">
                                  ⏳ PENDIENTE
                                </span>
                              )}

                              {/* Identificadores oficiales: DP y PA para consumos, SC y OC para compras */}
                              {m.tipo === 'consumo' ? (
                                <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                  <span>Despacho: <strong className="text-blue-700">{m.dp || '-'}</strong></span>
                                  <span>•</span>
                                  <span>Pedido: <strong className="text-slate-900">{m.pa || '-'}</strong></span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                  <span>SC: <strong className="text-indigo-700">{m.sc || '-'}</strong></span>
                                  <span>•</span>
                                  <span>OC: <strong className="text-indigo-700">{m.oc || '-'}</strong></span>
                                </div>
                              )}

                              <span className="text-slate-400">•</span>
                              <span className="text-slate-500 font-mono text-[11px]">{formatFechaDDMMAAAA(m.fecha)}</span>
                            </div>

                            {/* Persona Solicitante */}
                            <div className="flex flex-wrap items-center gap-2 pt-0.5">
                              <span className="inline-flex items-center gap-1.5 text-xs bg-blue-50 text-blue-900 border border-blue-200 px-2 py-0.5 rounded font-medium">
                                <User className="w-3.5 h-3.5 text-blue-600" />
                                Solicitante: <strong className="font-semibold text-slate-900">{m.solicitante || m.solicitanteOComprador || 'S/D'}</strong>
                              </span>

                              <span className="font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                                Cantidad: <strong className="text-slate-900">{m.cantidad} {m.unidad || 'UND'}</strong>
                              </span>

                              {m.costoUnitario > 0 && (
                                <span className="font-mono text-slate-600 text-[11px] bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                                  Precio Unit: <strong>{formatUSD(m.costoUnitario)}</strong>
                                </span>
                              )}
                            </div>

                            {/* Descripción del ítem */}
                            <div className="font-sans text-slate-900 font-bold text-xs whitespace-normal break-words leading-snug">
                              <span className="text-slate-500 font-mono font-normal mr-2">[{m.codigo}]</span>
                              {m.descripcion}
                            </div>

                            {/* Motivo original de SIP */}
                            {m.motivo && (
                              <div className="text-[11px] text-slate-700 bg-amber-50/70 border border-amber-200/80 rounded px-2.5 py-1.5 font-sans whitespace-normal break-words leading-snug">
                                <strong className="text-amber-900 mr-1.5">Motivo SIP:</strong>
                                <span className="italic">{m.motivo}</span>
                              </div>
                            )}

                            {/* Cuentas contables */}
                            <div className="text-[11px] flex flex-wrap items-center gap-3 pt-0.5">
                              {m.esReclasificado ? (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-emerald-700 font-bold">Imputado actualmente a:</span>
                                  <span className="font-mono font-bold text-emerald-900 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200">{m.cuentaAuxiliar}</span>
                                  <span className="text-slate-400 font-mono line-through text-[10px]">Antes: {m.cuentaAuxiliarOriginal || 'S/A'}</span>
                                  {m.infoReclasificacion?.motivo && (
                                    <span className="text-slate-500 italic text-[10px] ml-1">({m.infoReclasificacion.motivo})</span>
                                  )}
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-slate-500 font-medium">Cuenta actual SIP:</span>
                                  <span className="font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">{m.cuentaAuxiliar}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                            <div className="text-right">
                              <div className="font-mono font-black text-sm text-slate-900">
                                {formatUSD(m.totalUSD)}
                              </div>
                              <div className="text-[10px] text-slate-400">Total USD</div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectMovimiento(m);
                              }}
                              className={`px-3.5 py-1.5 rounded-lg font-bold text-xs transition-all shadow-xs flex items-center gap-1 cursor-pointer ${
                                m.esReclasificado 
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                              }`}
                            >
                              {m.esReclasificado ? '✓ Modificar' : 'Corregir'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : isSearchingMovimientos ? (
                    <div className="p-5 text-center text-blue-600 text-xs bg-blue-50/50 rounded-xl border border-blue-200 flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                      <span>Buscando en toda la base de datos de SIP...</span>
                    </div>
                  ) : searchMovimiento.trim().length >= 2 ? (
                    <div className="p-4 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      No se encontraron consumos ni compras que coincidan con "{searchMovimiento}".
                    </div>
                  ) : (
                    <div className="p-4 text-center text-slate-400 text-xs bg-slate-50/50 rounded-xl border border-slate-100">
                      Escribe el número de Despacho (DP), Pedido (PA), Solicitud (SC), Orden (OC), Descripción o Motivo para encontrar el movimiento.
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {/* SECCIÓN 2: CUADRO COMPARATIVO ANTES VS DESPUÉS */}
            {selectedMovimiento && (
              <div className="bg-white border-2 border-purple-200 rounded-xl p-5 shadow-xs space-y-5 animate-scaleIn">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-purple-900 flex items-center gap-2">
                    <ArrowRightLeft className="w-4 h-4 text-purple-600" />
                    2. Cuadro Comparativo de Imputación (Antes vs Después)
                  </h3>
                  <button
                    onClick={() => setSelectedMovimiento(null)}
                    className="text-xs text-slate-500 hover:text-slate-800"
                  >
                    ✕ Cancelar selección
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 items-center">
                  {/* PANEL IZQUIERDO: IMPUTACIÓN ANTERIOR (ORIGINAL SIP) */}
                  <div className="lg:col-span-5 bg-rose-50/50 border border-rose-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-rose-200/60">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" />
                        ¿Dónde estaba imputada anteriormente? (SIP)
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                        {selectedMovimiento.tipo === 'consumo' ? 'Consumo de Almacén' : 'Compra / Servicio'}
                      </span>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      {/* 1. Cuenta Auxiliar Anterior */}
                      <div className="p-2.5 bg-rose-100/70 rounded-lg border border-rose-300">
                        <span className="text-[10px] uppercase font-bold text-rose-800 block">Cuenta Auxiliar Anterior (SIP):</span>
                        <div className="font-mono text-base font-black text-rose-950 mt-0.5">
                          {selectedMovimiento.esReclasificado 
                            ? selectedMovimiento.cuentaAuxiliarOriginal 
                            : (selectedMovimiento.cuentaAuxiliar || 'SIN-ASIGNAR')}
                        </div>
                        {selectedMovimiento.esReclasificado && (
                          <div className="text-[11px] text-emerald-800 font-medium mt-1 bg-emerald-50 p-1.5 rounded border border-emerald-200">
                            ✓ Registro corregido a <strong className="font-mono">{selectedMovimiento.cuentaAuxiliar}</strong>. Permite reasignar una nueva cuenta auxiliar si es necesario.
                          </div>
                        )}
                      </div>

                      {/* 2. Persona que realizó la solicitud */}
                      <div className="p-2.5 bg-white rounded-lg border border-rose-200 shadow-2xs">
                        <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1.5 mb-0.5">
                          <User className="w-3.5 h-3.5 text-blue-600" />
                          Solicitado por (SIP):
                        </span>
                        <div className="text-xs font-bold text-slate-900">
                          {selectedMovimiento.solicitante || selectedMovimiento.solicitanteOComprador || 'S/D'}
                        </div>
                        {(selectedMovimiento as any).comprador && (selectedMovimiento as any).comprador !== selectedMovimiento.solicitante && (
                          <div className="text-[10px] text-slate-500 mt-1">
                            Comprador SIP: <span className="font-semibold text-slate-700">{(selectedMovimiento as any).comprador}</span>
                          </div>
                        )}
                        {(selectedMovimiento as any).proveedor && (
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            Proveedor: <span className="font-semibold text-slate-700">{(selectedMovimiento as any).proveedor}</span>
                          </div>
                        )}
                      </div>

                      {/* 3. Documento Oficial SIP */}
                      <div className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Documento Oficial SIP:</span>
                        <div className="font-mono text-xs font-semibold text-slate-800">
                          {selectedMovimiento.tipo === 'consumo' 
                            ? `Despacho (DP): ${selectedMovimiento.dp || '-'}  •  Pedido (PA): ${selectedMovimiento.pa || '-'}`
                            : `Solicitud (SC): ${selectedMovimiento.sc || '-'}  •  Orden (OC): ${selectedMovimiento.oc || '-'}`}
                          <span className="text-slate-400 font-normal ml-2">(Fecha: {formatFechaDDMMAAAA(selectedMovimiento.fecha)})</span>
                        </div>
                      </div>

                      {/* 4. Código y Descripción Imputada */}
                      <div className="p-2.5 bg-white rounded-lg border border-rose-200 shadow-2xs space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Ítem / Servicio Imputado:</span>
                        <div className="text-xs font-semibold text-slate-900 whitespace-normal break-words leading-snug">
                          <span className="font-mono font-bold text-slate-500 mr-1.5">[{selectedMovimiento.codigo}]</span>
                          {selectedMovimiento.descripcion}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          Categoría: {selectedMovimiento.categoria}
                        </div>
                      </div>

                      {/* 5. Cantidad, Unidad y Montos */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                          <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Cantidad y Unidad:</span>
                          <div className="text-xs font-mono font-bold text-slate-900">
                            {selectedMovimiento.cantidad != null ? selectedMovimiento.cantidad : 1} {selectedMovimiento.unidad || 'UND'}
                          </div>
                        </div>
                        <div className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                          <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Precio Unitario ($):</span>
                          <div className="text-xs font-mono font-semibold text-slate-800">
                            {formatUSD(selectedMovimiento.costoUnitario || 0)}
                          </div>
                        </div>
                      </div>

                      {/* 6. Motivo registrado en SIP */}
                      <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 shadow-2xs">
                        <span className="text-[10px] uppercase font-bold text-amber-900 block mb-0.5">Motivo registrado en SIP:</span>
                        <div className="text-xs italic text-amber-950 whitespace-normal break-words leading-relaxed font-sans">
                          "{selectedMovimiento.motivo || 'Sin motivo registrado'}"
                        </div>
                      </div>

                      {/* 7. Monto Total USD */}
                      <div className="pt-2 border-t border-rose-200/80 flex items-center justify-between">
                        <span className="text-slate-700 font-bold text-xs uppercase tracking-wide">Monto Total USD:</span>
                        <span className="font-mono text-base font-black text-rose-950">
                          {formatUSD(selectedMovimiento.totalUSD)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* FLECHA CENTRAL */}
                  <div className="lg:col-span-1 flex justify-center py-2 lg:py-0">
                    <div className="w-10 h-10 rounded-full bg-purple-100 border border-purple-300 flex items-center justify-center text-purple-700 shadow-2xs">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>

                  {/* PANEL DERECHO: NUEVA IMPUTACIÓN DESTINO */}
                  <div className="lg:col-span-5 bg-emerald-50/50 border border-emerald-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        ¿A dónde se imputará ahora? (Nueva Cuenta)
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        Destino Contable
                      </span>
                    </div>

                    <div className="space-y-3 text-xs">
                      {/* Selector / Input Nueva Cuenta Auxiliar */}
                      <div>
                        <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                          Nueva Cuenta Auxiliar SIP: <span className="text-rose-600">*</span>
                        </label>
                        <input
                          type="text"
                          list="cuentas-auxiliares-list"
                          placeholder="Escribe o selecciona la cuenta (ej: TTE-C-0706)..."
                          value={correccionNuevaCuenta}
                          onChange={(e) => handleNuevaCuentaChange(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-emerald-500 shadow-2xs"
                        />
                        <datalist id="cuentas-auxiliares-list">
                          {todasLasCuentasDisponibles.map((p) => (
                            <option key={p.codigo} value={p.codigo}>
                              {p.codigo} - {p.nombre}
                            </option>
                          ))}
                        </datalist>
                        <p className="text-[10px] text-slate-500 mt-1">
                          Se puede seleccionar una cuenta existente o ingresar directamente la <strong>nueva cuenta auxiliar registrada en SIP</strong> (el nombre del proyecto se autocompletará).
                        </p>
                      </div>

                      {/* Nombre del Proyecto */}
                      <div>
                        <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                          Nombre / Descripción del Proyecto:
                        </label>
                        <input
                          type="text"
                          placeholder="Se autocompleta con la cuenta auxiliar..."
                          value={correccionNuevoProyecto}
                          onChange={(e) => setCorreccionNuevoProyecto(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 shadow-2xs font-sans"
                        />
                      </div>

                      {/* Mes Correspondiente / Período (Opción desplegable) */}
                      <div>
                        <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1 flex items-center justify-between">
                          <span>Mes Correspondiente / Período: <span className="text-rose-600">*</span></span>
                          <span className="text-[10px] text-indigo-700 font-semibold lowercase">
                            (asignación contable / corte)
                          </span>
                        </label>
                        <div className="relative">
                          <select
                            value={correccionNuevoMes}
                            onChange={(e) => setCorreccionNuevoMes(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-emerald-500 shadow-2xs cursor-pointer"
                          >
                            {selectedMovimiento?.fecha && (
                              <option value={getMesFromFecha(selectedMovimiento.fecha, (selectedMovimiento as any).nombre_mes)}>
                                📌 Mantener mes original del documento ({getMesFromFecha(selectedMovimiento.fecha, (selectedMovimiento as any).nombre_mes)})
                              </option>
                            )}
                            <optgroup label="Reasignar a Mes Específico">
                              <option value="Agosto">📅 Agosto (Rezagada / "AG")</option>
                              <option value="Julio">📅 Julio (Rezagada)</option>
                              <option value="Junio">📅 Junio (Rezagada)</option>
                              <option value="Septiembre">📅 Septiembre</option>
                              <option value="Octubre">📅 Octubre</option>
                              <option value="Noviembre">📅 Noviembre</option>
                              <option value="Diciembre">📅 Diciembre</option>
                              <option value="Enero">📅 Enero</option>
                              <option value="Febrero">📅 Febrero</option>
                              <option value="Marzo">📅 Marzo</option>
                              <option value="Abril">📅 Abril</option>
                              <option value="Mayo">📅 Mayo</option>
                            </optgroup>
                          </select>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">
                          {detectarMesRezagada(selectedMovimiento) 
                            ? `💡 Consumo rezagado detectado: "${detectarMesRezagada(selectedMovimiento)}". Puedes reasignarlo o seleccionar el mes que corresponda.`
                            : 'Selecciona el mes contable en el que debe computarse o mantén el mes original si no es una imputación de mes.'}
                        </p>
                      </div>

                      {/* Motivo de la Corrección */}
                      <div>
                        <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                          Motivo de la Corrección / Justificación:
                        </label>
                        <input
                          type="text"
                          placeholder="Ej: Ítem imputado por error al proyecto anterior, corresponde a..."
                          value={correccionMotivo}
                          onChange={(e) => setCorreccionMotivo(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 shadow-2xs font-sans"
                        />
                      </div>

                      {/* Botones de acción */}
                      <div className="pt-2 flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedMovimiento(null)}
                          className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleAplicarCorreccion}
                          disabled={isSavingCorreccion || !correccionNuevaCuenta.trim()}
                          className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          {isSavingCorreccion ? 'Aplicando e Imputando...' : 'Aplicar Corrección e Imputar'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECCIÓN 3: HISTORIAL DE CORRECCIONES REGISTRADAS */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs space-y-0">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                      <Database className="w-4 h-4 text-purple-600" />
                      Historial de Correcciones Registradas ({filteredReclasificaciones.length} de {reclasificacionesStats.total})
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300" title="Correcciones históricas anteriores de Correcciones.xlsx">
                      456 Históricas Anteriores (Correcciones.xlsx)
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-300" title="Valorizaciones de Pellas Línea 1 y re-imputaciones detectadas directamente en SIP">
                      {reclasificacionesStats.directasSip} Directas del Sistema SIP
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Auditoría de correcciones: <strong>456 correcciones históricas anteriores</strong> (cargadas de <span className="font-mono text-slate-600">Y:\Costos Master\2 Data Fija\Correcciones.xlsx</span>) + <strong>{reclasificacionesStats.pellas1.toLocaleString()} valorizaciones de Pellas 1</strong> ({reclasificacionesStats.pellasTotal.toLocaleString()} en todas las obras de Pellas) y re-imputaciones encontradas directamente en el sistema SIP.
                  </p>
                </div>

                {/* Filtros y Buscador del Historial */}
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                  <div className="relative flex-1 md:w-64">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Buscar por vale, OC, cuenta, ítem..."
                      value={searchHistorialCorrecciones}
                      onChange={(e) => {
                        setSearchHistorialCorrecciones(e.target.value);
                        setPageReclasificaciones(1);
                      }}
                      className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-600"
                    />
                  </div>

                  <select
                    value={filtroTipoHistorial}
                    onChange={(e) => {
                      setFiltroTipoHistorial(e.target.value as any);
                      setPageReclasificaciones(1);
                    }}
                    className="bg-white border border-purple-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-purple-600 shadow-2xs"
                  >
                    <option value="mis_recientes">⭐ Mis Correcciones Recientes ({reclasificacionesStats.misRecientes})</option>
                    <option value="todos">Todos los Orígenes ({reclasificacionesStats.total.toLocaleString()})</option>
                    <option value="recientes">⚡ Recientes Sistema ({reclasificacionesStats.recientes.toLocaleString()})</option>
                    <option value="rezagadas">📅 Rezagadas Asignadas ({reclasificacionesStats.rezagadas.toLocaleString()})</option>
                    <option value="valorizaciones_pellas">🏭 Valorizaciones Pellas 1 (Línea 1 · TTE-C-0706) ({reclasificacionesStats.pellas1.toLocaleString()})</option>
                    <option value="pellas_todas">🏗️ Todas las Plantas de Pellas ({reclasificacionesStats.pellasTotal.toLocaleString()})</option>
                    <option value="historicas">📋 Históricas Anteriores (Correcciones.xlsx) ({reclasificacionesStats.historicas.toLocaleString()})</option>
                    <option value="consumos">Solo Consumos ({reclasificacionesStats.consumos.toLocaleString()})</option>
                    <option value="compras">Solo Compras / Servicios ({reclasificacionesStats.compras.toLocaleString()})</option>
                  </select>

                  <button
                    onClick={handleLimpiarCorreccionesLocales}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                    title="Limpiar correcciones de la sesión local y restaurar base oficial SIP"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Restaurar Base Oficial
                  </button>
                </div>
              </div>

              {/* BANNER DESTACADO SI HAY CORRECCIONES RECIENTES LOCALES */}
              {reclasificacionesStats.misRecientes > 0 && (
                <div className="mx-4 my-2.5 p-3 rounded-xl bg-amber-50 border border-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                    <span className="text-xs font-bold text-amber-950">
                      Tienes {reclasificacionesStats.misRecientes} corrección(es) registrada(s) recientemente en esta sesión.
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setFiltroTipoHistorial('mis_recientes');
                        setPageReclasificaciones(1);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        filtroTipoHistorial === 'mis_recientes'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-white hover:bg-amber-100 text-amber-900 border border-amber-300'
                      }`}
                    >
                      {filtroTipoHistorial === 'mis_recientes' ? '✓ Viendo mis correcciones' : 'Ver solo mis correcciones recientes →'}
                    </button>
                    <button
                      onClick={handleLimpiarCorreccionesLocales}
                      className="px-3 py-1 rounded-lg text-xs font-bold bg-white hover:bg-rose-100 text-rose-700 border border-rose-300 transition-all cursor-pointer"
                      title="Limpiar correcciones de sesión local"
                    >
                      Limpiar Sesión Local
                    </button>
                  </div>
                </div>
              )}

              {filteredReclasificaciones.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No se encontraron correcciones con los términos de búsqueda ingresados.
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs whitespace-nowrap">
                      <thead className="bg-slate-100 text-slate-700 uppercase font-semibold border-b border-slate-200 text-[10px] tracking-wider">
                        <tr>
                          <th className="py-2.5 px-3 border-r border-slate-200">Fecha Movimiento</th>
                          <th className="py-2.5 px-3 border-r border-slate-200">Tipo</th>
                          <th className="py-2.5 px-3 border-r border-slate-200">Documento</th>
                          <th className="py-2.5 px-3 border-r border-slate-200 min-w-[220px]">Descripción del Ítem</th>
                          <th className="py-2.5 px-3 border-r border-slate-200 text-right">Total USD</th>
                          <th className="py-2.5 px-3 border-r border-slate-200 bg-rose-50 text-rose-900 font-bold">Cuenta Anterior (SIP)</th>
                          <th className="py-2.5 px-3 border-r border-slate-200 bg-emerald-50 text-emerald-900 font-bold">Nueva Cuenta Destino</th>
                          <th className="py-2.5 px-3 border-r border-slate-200 bg-indigo-50 text-indigo-900 font-bold text-center">Mes Imputado</th>
                          <th className="py-2.5 px-3 border-r border-slate-200 min-w-[180px]">Proyecto Destino</th>
                          <th className="py-2.5 px-3 border-r border-slate-200 min-w-[220px]">Motivo del Ajuste</th>
                          <th className="py-2.5 px-3 border-r border-slate-200">Origen / Usuario</th>
                          <th className="py-2.5 px-3 text-center">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[11px]">
                        {filteredReclasificaciones.slice((pageReclasificaciones - 1) * 50, pageReclasificaciones * 50).map((r, i) => (
                          <tr key={i} className="hover:bg-blue-50/40 transition-colors">
                            <td className="py-2 px-3 font-mono text-slate-600 text-[11px] border-r border-slate-100">
                              {formatFechaHistorial(r)}
                            </td>
                            <td className="py-2 px-3 border-r border-slate-100 font-sans">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                r.tipoItem === 'compra' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'
                              }`}>
                                {r.tipoItem === 'compra' ? 'Compra' : 'Consumo'}
                              </span>
                            </td>
                            <td className="py-2 px-3 font-mono font-bold text-slate-800 border-r border-slate-100">
                              {r.documento || r.recordId}
                            </td>
                            <td className="py-2 px-3 text-slate-800 min-w-[220px] whitespace-normal break-words leading-snug border-r border-slate-100 font-sans">
                              {r.descripcion || r.recordId}
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-emerald-600 border-r border-slate-100">
                              {r.totalUSD ? formatUSD(r.totalUSD) : '-'}
                            </td>
                            <td className="py-2 px-3 font-mono font-bold text-rose-700 bg-rose-50/30 border-r border-slate-100">
                              {r.cuentaAnterior || 'S/A'}
                            </td>
                            <td className="py-2 px-3 font-mono font-bold text-emerald-700 bg-emerald-50/30 border-r border-slate-100">
                              {r.nuevaCuenta}
                            </td>
                            <td className="py-2 px-3 border-r border-slate-100 text-center">
                              {r.nuevoMes ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-900 border border-indigo-200 shadow-2xs font-sans">
                                  📅 {r.nuevoMes}
                                </span>
                              ) : (
                                <span className="text-slate-400 text-[10px] italic">Original</span>
                              )}
                            </td>
                            <td className="py-2 px-3 text-slate-800 min-w-[180px] whitespace-normal break-words leading-snug border-r border-slate-100 font-sans">
                              {r.nuevoProyecto}
                            </td>
                            <td className="py-2 px-3 text-slate-600 italic min-w-[220px] whitespace-normal break-words leading-snug border-r border-slate-100 font-sans">
                              "{r.motivo}"
                            </td>
                            <td className="py-2 px-3 border-r border-slate-100">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                r.usuario?.includes('Correcciones.xlsx') 
                                  ? 'bg-purple-100 text-purple-900 border border-purple-200' 
                                  : 'bg-blue-100 text-blue-900 border border-blue-200'
                              }`}>
                                {r.usuario}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-center">
                              <button
                                onClick={() => handleRevertirCorreccion(r.recordId)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-rose-600 hover:text-white text-slate-700 border border-slate-200 text-[11px] transition-all cursor-pointer"
                                title="Revertir corrección y restaurar cuenta original SIP"
                              >
                                <RotateCcw className="w-3 h-3" />
                                Deshacer
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Paginación de Correcciones */}
                  <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs">
                    <span className="text-slate-600">
                      Mostrando {((pageReclasificaciones - 1) * 50) + 1} - {Math.min(pageReclasificaciones * 50, filteredReclasificaciones.length)} de {filteredReclasificaciones.length} correcciones
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setPageReclasificaciones(p => Math.max(1, p - 1))}
                        disabled={pageReclasificaciones <= 1}
                        className="px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-30"
                      >
                        Anterior
                      </button>
                      <span className="px-2 font-mono font-semibold text-slate-700">
                        Pág {pageReclasificaciones} de {Math.ceil(filteredReclasificaciones.length / 50) || 1}
                      </span>
                      <button
                        onClick={() => setPageReclasificaciones(p => Math.min(Math.ceil(filteredReclasificaciones.length / 50), p + 1))}
                        disabled={pageReclasificaciones >= Math.ceil(filteredReclasificaciones.length / 50)}
                        className="px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-30"
                      >
                        Siguiente
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: GESTIÓN Y CARGA DE INSUMOS AL CIERRE (MDO, HM & INDIRECTOS) */}
        {activeTab === 'cargas' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <HardHat className="w-5 h-5 text-amber-500" />
                  Módulo de Gestión y Carga de Insumos al Cierre Mensual
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Control, trazabilidad y visualización de archivos para <strong>Mano de Obra (MDO)</strong>, <strong>Horas Máquina (HM)</strong> y <strong>Costos Indirectos (Prorrateo)</strong> incorporados en la Sábana Unificada.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 flex items-center gap-1.5 font-mono">
                  <CheckCircle2 className="w-4 h-4 text-amber-600" />
                  {archivosCargas.mdo.length + archivosCargas.hm.length + archivosCargas.indirectos.length} archivos en sistema
                </span>
              </div>
            </div>

            {/* 3 Selector Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Mano de Obra */}
              <button
                onClick={() => { setActiveSubCarga('mdo'); setSearchCargas(''); }}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  activeSubCarga === 'mdo'
                    ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${activeSubCarga === 'mdo' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xs text-slate-900 uppercase">Mano de Obra (MDO)</h3>
                      <p className="text-[11px] text-slate-500">Planillas semanales Proyectos & ECO</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs font-black bg-blue-100 text-blue-800">
                    {archivosCargas.mdo.length} archivos
                  </span>
                </div>
              </button>

              {/* Card 2: Horas Máquina */}
              <button
                onClick={() => { setActiveSubCarga('hm'); setSearchCargas(''); }}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  activeSubCarga === 'hm'
                    ? 'bg-purple-50/70 border-purple-500 ring-2 ring-purple-500/20 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${activeSubCarga === 'hm' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <Cpu className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xs text-slate-900 uppercase">Horas Máquina (HM)</h3>
                      <p className="text-[11px] text-slate-500">Partes mensuales y horómetros</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs font-black bg-purple-100 text-purple-800">
                    {archivosCargas.hm.length} archivos
                  </span>
                </div>
              </button>

              {/* Card 3: Costos Indirectos */}
              <button
                onClick={() => { setActiveSubCarga('indirectos'); setSearchCargas(''); }}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  activeSubCarga === 'indirectos'
                    ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${activeSubCarga === 'indirectos' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <PieChart className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xs text-slate-900 uppercase">Costos Indirectos</h3>
                      <p className="text-[11px] text-slate-500">Prorrateo administrativo mensual</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800">
                    {archivosCargas.indirectos.length} archivos
                  </span>
                </div>
              </button>
            </div>

            {/* Banner explicativo específico si está en Costos Indirectos */}
            {activeSubCarga === 'indirectos' && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-950 space-y-2 shadow-xs">
                <div className="font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-emerald-600" />
                  <span>Criterio y Origen Contable de los Costos Indirectos</span>
                </div>
                <p className="text-emerald-800 leading-relaxed text-[11px]">
                  Los costos indirectos provienen del análisis de prorrateo mensual de administración y gerencia general (<strong className="font-mono">Y:\Costos Master\1 Informe\3 Analisis Costos Indirectos.xlsx</strong> y <strong className="font-mono">Vigilancia.xlsx</strong>). Comprenden nómina de talleres, nómina fija TIMACA, servicios de telecomunicaciones, seguros, combustible y gastos operativos fuera de SIP. No se generan por requisición ni vale individual de almacén, sino que se distribuyen mensualmente entre los proyectos activos en proporción directa a sus horas de Mano de Obra Directa (MOD).
                </p>
                <div className="pt-2 border-t border-emerald-200/60 flex flex-wrap items-center gap-4 text-[11px] font-semibold text-emerald-900">
                  <span>• Cierre Septiembre Unificado: <strong>150 partidas distribuidas</strong></span>
                  <span>• Monto Prorrateado: <strong>$341,374.77 USD</strong> en 10 proyectos externos</span>
                  <span>• Estado: <strong className="text-emerald-700">Asientos Contables Oficiales</strong></span>
                </div>
              </div>
            )}

            {/* Banner de Control y Cobertura Cronológica para Horas Máquina */}
            {activeSubCarga === 'hm' && (
              <div className="bg-purple-50/80 border border-purple-200 rounded-xl p-4 text-xs text-purple-950 space-y-3 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="font-bold uppercase tracking-wider text-purple-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-600" />
                    <span>Control Cronológico de Planillas Horas Máquina (2026)</span>
                  </div>
                  <span className="text-[11px] font-semibold text-purple-700 bg-purple-100/90 px-2.5 py-0.5 rounded-full border border-purple-200">
                    Ordenado cronológicamente por mes
                  </span>
                </div>

                {/* Semáforo de meses 2026 */}
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                  {[
                    { mes: 'Ene', label: 'Enero', cargado: true },
                    { mes: 'Feb', label: 'Febrero', cargado: true },
                    { mes: 'Mar', label: 'Marzo', cargado: true },
                    { mes: 'Abr', label: 'Abril', cargado: true },
                    { mes: 'May', label: 'Mayo', cargado: true },
                    { mes: 'Jun', label: 'Junio', cargado: true },
                    { mes: 'Jul', label: 'Julio', cargado: true },
                    { mes: 'Ago', label: 'Agosto', cargado: true },
                    { mes: 'Sep', label: 'Septiembre', cargado: true },
                    { mes: 'Oct', label: 'Octubre', cargado: false, faltante: false }
                  ].map((m) => (
                    <div 
                      key={m.mes} 
                      className={`p-2 rounded-lg text-center border transition-all ${
                        m.cargado 
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                          : 'bg-slate-100 border-slate-200 text-slate-500'
                      }`}
                    >
                      <div className="font-black text-xs">{m.mes}</div>
                      <div className="text-[10px] mt-0.5 font-medium">
                        {m.cargado ? '✓ Cargado' : 'En curso'}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-purple-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-purple-900">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                      ✓ Cobertura 9 Meses Completa:
                    </span>
                    <span>
                      Planillas de <strong className="font-mono bg-purple-100 px-1.5 py-0.5 rounded border border-purple-300 text-purple-950">Enero a Septiembre 2026</strong> procesadas y activas en sábana (11 archivos).
                    </span>
                  </div>
                  <div className="text-right text-[10px] text-purple-600">
                    Histórico 2025: <span className="font-mono font-bold text-purple-800">2025 Diciembre Pellas.xlsx</span>
                  </div>
                </div>
              </div>
            )}

            {/* Sección de Carga y Tabla de Archivos Subidos */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-slate-600" />
                    Archivos Cargados y Disponibles: {activeSubCarga === 'mdo' ? 'Mano de Obra Semanal' : activeSubCarga === 'hm' ? 'Horas Máquina y Equipos' : 'Costos Indirectos y Prorrateo'}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-800 font-mono">
                    {currentFilesList.length} de {activeSubCarga === 'mdo' ? archivosCargas.mdo.length : activeSubCarga === 'hm' ? archivosCargas.hm.length : archivosCargas.indirectos.length} archivos
                  </span>
                </div>

                <div className="relative w-full md:w-80">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar archivo por semana, proyecto o nombre..."
                    value={searchCargas}
                    onChange={(e) => setSearchCargas(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Zona de Arrastrar y Soltar para Nuevas Cargas de Cierre */}
              <div className="p-4 bg-slate-50/50 border-b border-slate-200">
                <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-5 text-center bg-white transition-all cursor-pointer group">
                  <FileSpreadsheet className="w-8 h-8 text-slate-400 group-hover:text-blue-500 mx-auto mb-1.5 transition-colors" />
                  <div className="text-xs font-bold text-slate-700 group-hover:text-blue-600">
                    Cargar nueva planilla o parte mensual para {activeSubCarga === 'mdo' ? 'Mano de Obra' : activeSubCarga === 'hm' ? 'Horas Máquina' : 'Costos Indirectos'}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Arrastra aquí el archivo en formato .xlsx o .csv • Validación automática anti-duplicados</div>
                </div>
              </div>

              {/* Tabla de Archivos */}
              <div className="overflow-x-auto max-h-[460px]">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-slate-100 text-slate-700 uppercase font-semibold border-b border-slate-200 text-[10px] tracking-wider sticky top-0 z-10">
                    <tr>
                      <th className="py-2.5 px-3 border-r border-slate-200">#</th>
                      <th className="py-2.5 px-3 border-r border-slate-200">
                        <div className="flex items-center gap-1.5">
                          <span>Nombre del Archivo</span>
                          <span className="text-[9px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded border border-blue-200">
                            Orden Cronológico
                          </span>
                        </div>
                      </th>
                      <th className="py-2.5 px-3 border-r border-slate-200">Categoría</th>
                      <th className="py-2.5 px-3 border-r border-slate-200">Ubicación / Carpeta</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 text-right">Tamaño</th>
                      <th className="py-2.5 px-3 border-r border-slate-200">Última Modificación</th>
                      <th className="py-2.5 px-3 text-center">Estatus en Sábana</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px]">
                    {currentFilesList.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-500">
                          No se encontraron archivos que coincidan con la búsqueda.
                        </td>
                      </tr>
                    ) : (
                      currentFilesList.map((f: any, idx: number) => (
                        <tr key={idx} className="hover:bg-blue-50/40 transition-colors">
                          <td className="py-2 px-3 text-slate-400 font-mono text-[10px] border-r border-slate-100">
                            {idx + 1}
                          </td>
                          <td className="py-2 px-3 font-semibold text-slate-800 border-r border-slate-100 flex items-center gap-2">
                            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{f.nombre}</span>
                          </td>
                          <td className="py-2 px-3 border-r border-slate-100 font-sans">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              f.categoria === 'Mano de Obra' 
                                ? 'bg-blue-50 text-blue-700' 
                                : f.categoria === 'Horas Máquina' 
                                ? 'bg-purple-50 text-purple-700' 
                                : 'bg-emerald-50 text-emerald-700'
                            }`}>
                              {f.categoria}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-mono text-[10px] text-slate-500 border-r border-slate-100">
                            {f.carpeta}
                          </td>
                          <td className="py-2 px-3 font-mono text-slate-600 text-right border-r border-slate-100">
                            {f.tamanoKB} KB
                          </td>
                          <td className="py-2 px-3 font-mono text-slate-600 border-r border-slate-100">
                            {formatFechaDDMMAAAA(f.fechaMod)}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              {f.estado}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: BANDEJA DE ALERTAS DE PRECIOS Y UNIDADES DE MEDIDA (PA vs DP vs OC) */}
        {activeTab === 'alertas' && (
          <BandejaAlertasSipView />
        )}

      </main>
    </div>
  );
}
