import { SipCuentaSummary, SipItem, SipPeriodoData, MesEvolutivoData } from '../../services/sipDataService';

export interface MacroCategoryBreakdown {
  categoria: string;
  total: number;
  count: number;
  porcentaje: number;
  items: SipItem[];
}

export interface EvolutivoSummary {
  meses: MesEvolutivoData[];
  totalAnual: number;
  promedioMensual: number;
  mesPico: MesEvolutivoData;
  mayorCategoria: { categoria: string; total: number };
}

export function getMacroCategoryBadge(categoria: string) {
  switch (categoria) {
    case 'Materiales Directos':
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        dot: 'bg-blue-500',
        accentBorder: 'border-l-blue-500',
        barColor: 'bg-blue-600',
        label: 'Materiales Directos'
      };
    case 'Servicios':
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        dot: 'bg-emerald-500',
        accentBorder: 'border-l-emerald-500',
        barColor: 'bg-emerald-600',
        label: 'Servicios'
      };
    case 'Mano de Obra Directa':
    case 'Mano de Obra Directa ECO':
    case 'MOD':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-800',
        border: 'border-amber-200',
        dot: 'bg-amber-500',
        accentBorder: 'border-l-amber-500',
        barColor: 'bg-amber-500',
        label: 'Mano de Obra Directa'
      };
    case 'Horas Maquina':
      return {
        bg: 'bg-purple-50',
        text: 'text-purple-700',
        border: 'border-purple-200',
        dot: 'bg-purple-500',
        accentBorder: 'border-l-purple-500',
        barColor: 'bg-purple-600',
        label: 'Horas Máquina'
      };
    case 'Costos Indirectos':
      return {
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        border: 'border-rose-200',
        dot: 'bg-rose-500',
        accentBorder: 'border-l-rose-500',
        barColor: 'bg-rose-500',
        label: 'Costos Indirectos'
      };
    default:
      return {
        bg: 'bg-slate-100',
        text: 'text-slate-700',
        border: 'border-slate-200',
        dot: 'bg-slate-400',
        accentBorder: 'border-l-slate-400',
        barColor: 'bg-slate-500',
        label: categoria || 'General'
      };
  }
}

export function getComprobanteBadge(numero: string) {
  const upper = String(numero || '').toUpperCase();
  if (upper.startsWith('DP')) {
    return {
      bg: 'bg-sky-50',
      text: 'text-sky-700',
      border: 'border-sky-200',
      prefix: 'DP',
      type: 'Almacén'
    };
  }
  if (upper.startsWith('PA') || upper.startsWith('OC')) {
    return {
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      border: 'border-indigo-200',
      prefix: 'PA',
      type: 'Compra Directa'
    };
  }
  if (upper.includes('VAL') || upper.includes('COR')) {
    return {
      bg: 'bg-teal-50',
      text: 'text-teal-700',
      border: 'border-teal-200',
      prefix: 'VAL',
      type: 'Valorizado SIP'
    };
  }
  return {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    prefix: 'SIP',
    type: 'Comprobante'
  };
}
