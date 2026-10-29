import React from 'react';
import { BarChart3, TrendingUp, CalendarDays, Award } from 'lucide-react';
import { EvolutivoSummary } from './proyectosTypes';
import { safeFormatUSD } from '../../utils/numericHelpers';

interface ProyectosEvolutivoChartProps {
  evolutivoData: EvolutivoSummary | null;
  selectedMesNum: number;
  setSelectedMesNum: (mes: number) => void;
  activeCuentaCodigo: string;
  activeCuentaNombre: string;
}

export const ProyectosEvolutivoChart: React.FC<ProyectosEvolutivoChartProps> = ({
  evolutivoData,
  selectedMesNum,
  setSelectedMesNum,
  activeCuentaCodigo,
  activeCuentaNombre
}) => {
  if (!evolutivoData) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs h-72 flex items-center justify-center text-slate-400 text-xs">
        Cargando evolutivo mensual...
      </div>
    );
  }

  const { meses, totalAnual, promedioMensual, mesPico, mayorCategoria } = evolutivoData;
  const maxTotal = Math.max(...meses.map(m => m.total || 0), 1);

  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold shrink-0">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
              Evolutivo Mensual 2026: {activeCuentaCodigo}
            </h3>
            <p className="text-[11px] text-slate-500">
              Curva real de desembolsos mes a mes desde el SIP (Enero a Octubre)
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="font-mono text-xs font-bold text-slate-900 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 inline-block tabular-nums">
            Total Anual: {safeFormatUSD(totalAnual, false)}
          </span>
        </div>
      </div>

      {/* Mini-KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            Acumulado Anual
          </span>
          <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm tabular-nums block mt-0.5">
            {safeFormatUSD(totalAnual, false)}
          </span>
          <span className="text-[10px] text-slate-400">10 meses 2026</span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            Mes de Mayor Gasto
          </span>
          <span className="font-mono font-bold text-blue-700 text-xs sm:text-sm tabular-nums block mt-0.5">
            {safeFormatUSD(mesPico?.total || 0, false)}
          </span>
          <span className="text-[10px] text-blue-600 font-medium">
            {mesPico?.mesLabel || '-'}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            Promedio Mensual
          </span>
          <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm tabular-nums block mt-0.5">
            {safeFormatUSD(promedioMensual || 0, false)}
          </span>
          <span className="text-[10px] text-slate-400">Media activa</span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            Rubro Preponderante
          </span>
          <span className="font-bold text-emerald-700 text-xs sm:text-sm truncate block mt-0.5">
            {mayorCategoria?.categoria || 'Materiales'}
          </span>
          <span className="font-mono text-[10px] text-slate-400 tabular-nums">
            {safeFormatUSD(mayorCategoria?.total || 0, false)}
          </span>
        </div>
      </div>

      {/* Bar Chart Area */}
      <div className="pt-2">
        <div className="h-44 sm:h-48 flex items-end gap-1.5 sm:gap-2 border-b border-slate-200 pb-2 px-1 relative">
          
          {/* Subtle horizontal guideline at 50% and 100% */}
          <div className="absolute inset-x-0 top-0 border-b border-dashed border-slate-100 pointer-events-none" />
          <div className="absolute inset-x-0 top-1/2 border-b border-dashed border-slate-100 pointer-events-none" />

          {meses.map((m) => {
            const pctHeight = Math.max(6, Math.round(((m.total || 0) / maxTotal) * 100));
            const isSelected = m.mesNum === selectedMesNum;
            const isAnual = selectedMesNum === 0;

            const formatBarLabel = (val: number) => {
              if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`;
              if (val >= 1000) return `$${Math.round(val / 1000)}k`;
              if (val > 0) return `$${Math.round(val)}`;
              return '$0';
            };

            return (
              <div
                key={m.mesNum}
                onClick={() => setSelectedMesNum(m.mesNum)}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer transition-all z-10"
                title={`${m.mesLabel}: ${safeFormatUSD(m.total, false)} (${m.movimientosCount} movimientos)`}
              >
                {/* Amount Label on top */}
                <span
                  className={`text-[9px] sm:text-[10px] font-mono mb-1 transition-all text-center leading-tight tabular-nums ${
                    isSelected
                      ? 'text-blue-700 font-extrabold scale-105'
                      : m.total > 0
                      ? 'text-slate-600 font-semibold group-hover:text-blue-600'
                      : 'text-slate-300 font-normal'
                  }`}
                >
                  {formatBarLabel(m.total)}
                </span>

                {/* The Bar */}
                <div
                  className={`w-full rounded-t-lg transition-all duration-200 ${
                    isSelected
                      ? 'bg-blue-600 shadow-md ring-2 ring-blue-300'
                      : isAnual
                      ? 'bg-blue-400 hover:bg-blue-500'
                      : m.total > 0
                      ? 'bg-slate-300 group-hover:bg-blue-500'
                      : 'bg-slate-100 group-hover:bg-slate-200'
                  }`}
                  style={{ height: `${pctHeight}%` }}
                />

                {/* Month Name & movements count */}
                <div className="flex flex-col items-center mt-1.5">
                  <span
                    className={`text-[10px] font-bold ${
                      isSelected ? 'text-blue-700 font-black' : 'text-slate-700'
                    }`}
                  >
                    {m.mesNombre?.slice(0, 3)}
                  </span>
                  <span className="text-[9px] font-mono text-slate-400 hidden sm:block">
                    {m.movimientosCount > 0 ? `${m.movimientosCount}m` : '-'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
