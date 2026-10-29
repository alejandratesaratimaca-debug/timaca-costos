import React from 'react';
import { DollarSign, Clock, Boxes, Activity, TrendingUp, Layers } from 'lucide-react';
import { SipCuentaSummary } from '../../services/sipDataService';
import { safeFormatUSD, safePercent } from '../../utils/numericHelpers';

interface ProyectosKpiGridProps {
  activeCuenta: SipCuentaSummary;
  totalCorporativoPeriodo: number;
  mesLabel?: string;
}

export const ProyectosKpiGrid: React.FC<ProyectosKpiGridProps> = ({
  activeCuenta,
  totalCorporativoPeriodo,
  mesLabel
}) => {
  const totalMonto = activeCuenta.totalMonto || 0;
  const modMonto = activeCuenta.porCategoria?.['Mano de Obra Directa'] || 0;
  const matMonto = activeCuenta.porCategoria?.['Materiales Directos'] || 0;
  const servMonto = activeCuenta.porCategoria?.['Servicios'] || 0;
  const count = activeCuenta.salidasCount || 0;
  const ticketPromedio = count > 0 ? totalMonto / count : 0;

  const pctMOD = safePercent(modMonto, totalMonto);
  const pctMat = safePercent(matMonto, totalMonto);
  const pctCorp = activeCuenta.porcentaje || safePercent(totalMonto, totalCorporativoPeriodo);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* KPI 1: Costo Total Imputado */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs border-l-4 border-l-blue-600 transition-all hover:shadow-sm">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-semibold uppercase tracking-wider text-[10px]">
            Costo Total Imputado
          </span>
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-2">
          <span className="font-mono text-xl sm:text-2xl font-black text-slate-900 tabular-nums tracking-tight block">
            {safeFormatUSD(totalMonto, false)}
          </span>
        </div>

        <div className="mt-2.5 flex items-center gap-1.5 text-xs">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            {pctCorp}% TIMACA
          </span>
          <span className="text-slate-400 text-[11px] truncate">
            {mesLabel || 'Período en curso'}
          </span>
        </div>
      </div>

      {/* KPI 2: Mano de Obra Directa (MOD) - Ámbar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs border-l-4 border-l-amber-500 transition-all hover:shadow-sm">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-semibold uppercase tracking-wider text-[10px]">
            Mano de Obra (MOD)
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-2">
          <span className="font-mono text-xl sm:text-2xl font-black text-amber-900 tabular-nums tracking-tight block">
            {safeFormatUSD(modMonto, false)}
          </span>
        </div>

        <div className="mt-2.5 flex items-center gap-1.5 text-xs">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            {pctMOD}% del proyecto
          </span>
          <span className="text-slate-400 text-[11px]">
            Cuadrilla en obra
          </span>
        </div>
      </div>

      {/* KPI 3: Materiales Directos & Insumos - Azul */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs border-l-4 border-l-blue-500 transition-all hover:shadow-sm">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-semibold uppercase tracking-wider text-[10px]">
            Materiales Directos
          </span>
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Boxes className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-2">
          <span className="font-mono text-xl sm:text-2xl font-black text-slate-900 tabular-nums tracking-tight block">
            {safeFormatUSD(matMonto, false)}
          </span>
        </div>

        <div className="mt-2.5 flex items-center gap-1.5 text-xs">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            {pctMat}% del proyecto
          </span>
          <span className="text-slate-400 text-[11px]">
            Almacén & Compras
          </span>
        </div>
      </div>

      {/* KPI 4: Intensidad & Ticket Promedio - Esmeralda */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs border-l-4 border-l-emerald-500 transition-all hover:shadow-sm">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-semibold uppercase tracking-wider text-[10px]">
            Auditoría de Vales
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <Activity className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-2">
          <span className="font-mono text-xl sm:text-2xl font-black text-slate-900 tabular-nums tracking-tight block">
            {count.toLocaleString('de-DE')} <span className="text-xs font-sans font-semibold text-slate-400">movimientos</span>
          </span>
        </div>

        <div className="mt-2.5 flex items-center gap-1.5 text-xs">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            {safeFormatUSD(ticketPromedio, false)}
          </span>
          <span className="text-slate-400 text-[11px]">
            Promedio / comprobante
          </span>
        </div>
      </div>
    </div>
  );
};
