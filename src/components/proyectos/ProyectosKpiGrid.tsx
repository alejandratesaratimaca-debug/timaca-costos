import React from 'react';
import { DollarSign, Clock, Boxes, Activity, TrendingUp, CheckCircle2 } from 'lucide-react';
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
  const count = activeCuenta.salidasCount || 0;
  const ticketPromedio = count > 0 ? totalMonto / count : 0;

  const pctMOD = safePercent(modMonto, totalMonto);
  const pctMat = safePercent(matMonto, totalMonto);
  const pctCorp = activeCuenta.porcentaje || safePercent(totalMonto, totalCorporativoPeriodo);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
        
        {/* Metric 1: Costo Total Imputado */}
        <div className="p-5 sm:p-6 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Costo Total Ejecutado
            </span>
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
          </div>

          <div className="pt-1">
            <span className="font-mono text-2xl sm:text-3xl font-black text-slate-900 tracking-tight tabular-nums block">
              {safeFormatUSD(totalMonto, false)}
            </span>
          </div>

          <div className="pt-1 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {pctCorp}%
            </span>
            <span className="text-slate-400 text-[11px]">
              del total TIMACA ({mesLabel || '2026'})
            </span>
          </div>
        </div>

        {/* Metric 2: Mano de Obra (MOD) - Ámbar */}
        <div className="p-5 sm:p-6 space-y-1 bg-slate-50/30">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Mano de Obra (MOD)
            </span>
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          </div>

          <div className="pt-1">
            <span className="font-mono text-2xl sm:text-3xl font-black text-amber-600 tracking-tight tabular-nums block">
              {safeFormatUSD(modMonto, false)}
            </span>
          </div>

          <div className="pt-1 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
              {pctMOD}%
            </span>
            <span className="text-slate-400 text-[11px]">
              Fuerza laboral en frentes de obra
            </span>
          </div>
        </div>

        {/* Metric 3: Materiales Directos - Azul Cobalto */}
        <div className="p-5 sm:p-6 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Materiales Directos
            </span>
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          </div>

          <div className="pt-1">
            <span className="font-mono text-2xl sm:text-3xl font-black text-blue-700 tracking-tight tabular-nums block">
              {safeFormatUSD(matMonto, false)}
            </span>
          </div>

          <div className="pt-1 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {pctMat}%
            </span>
            <span className="text-slate-400 text-[11px]">
              Consumos de almacén y compras
            </span>
          </div>
        </div>

        {/* Metric 4: Vales & Movimientos - Verde Esmeralda (Estilo "En la cartera") */}
        <div className="p-5 sm:p-6 space-y-1 bg-slate-50/30">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Vales Imputados SIP
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>

          <div className="pt-1">
            <span className="font-mono text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight tabular-nums block">
              {count.toLocaleString('de-DE')}
            </span>
          </div>

          <div className="pt-1 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span className="text-slate-400 text-[11px]">
              Ticket promedio:
            </span>
            <span className="font-mono font-bold text-slate-800 text-[11px]">
              {safeFormatUSD(ticketPromedio, false)} / vale
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
