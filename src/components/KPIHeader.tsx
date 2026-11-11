import React, { useState, useMemo } from 'react';
import { useCostos } from '../context/CostosContext';
import { formatCurrency, formatNumber } from '../utils/dateHelpers';
import { safeFormatUSD } from '../utils/numericHelpers';
import { CUENTAS_CORTAS_MAP, TABLA_PPT_DISTRIBUCION_2026, TOTALES_MESES_PPT } from '../data/mockCostosTimaca';
import { MATRIZ_REAL_PROYECTOS_MENSUAL_2026 } from '../data/realProyectosMensual2026';
import { 
  DollarSign, 
  Layers, 
  TrendingUp, 
  Briefcase, 
  Calendar, 
  ArrowRight, 
  TableProperties, 
  CalendarDays,
  X,
  ExternalLink,
  ArrowUpRight,
  Sparkles,
  Activity,
  Award
} from 'lucide-react';

interface KPIHeaderProps {
  onOpenProyectosMatriz?: () => void;
}

export const KPIHeader: React.FC<KPIHeaderProps> = ({ onOpenProyectosMatriz }) => {
  const {
    totalMontoGlobal,
    totalSalidasGlobal,
    totalMontoFiltrado,
    totalSalidasFiltrado,
    promedioSemanal,
    resumenMeses,
    selectedMes,
    selectedSemana,
  } = useCostos();

  const [showQuickMonthlyModal, setShowQuickMonthlyModal] = useState(false);

  const isFiltered = selectedMes !== 'all' || selectedSemana !== 'all';
  const displayMonto = isFiltered ? totalMontoFiltrado : totalMontoGlobal;
  const displaySalidas = isFiltered ? totalSalidasFiltrado : totalSalidasGlobal;

  // Proyecto Dominante: Enfoque estricto en Cuentas Auxiliares de Proyectos de Clientes (TTE-C)
  const topProyectoData = useMemo(() => {
    const proyectosList = Object.values(MATRIZ_REAL_PROYECTOS_MENSUAL_2026);
    if (selectedMes !== 'all') {
      const mesIdx = parseInt(selectedMes, 10) - 1;
      if (mesIdx >= 0 && mesIdx < 10) {
        const sorted = [...proyectosList].sort((a, b) => (b.meses[mesIdx] || 0) - (a.meses[mesIdx] || 0));
        const top = sorted[0];
        const mesTotal = TOTALES_MESES_PPT[mesIdx]?.total || displayMonto;
        const monto = top ? (top.meses[mesIdx] || 0) : 1219526.45;
        return {
          codigo: top?.cuentaAuxiliar || 'TTE-C-0706',
          nombre: top?.descripcion || 'Recuperación de Línea 1 de Planta de Pellas',
          monto,
          porcentaje: mesTotal > 0 ? Math.round((monto / mesTotal) * 1000) / 10 : 59.1
        };
      }
    }
    // Consolidado Anual 2026 (TTE-C-0706: $3.618.605 / 24.5%)
    const sorted = [...proyectosList].sort((a, b) => b.totalAnual - a.totalAnual);
    const top = sorted[0];
    const topMontoAnual = top?.totalAnual || 3618605.21;
    return {
      codigo: top?.cuentaAuxiliar || 'TTE-C-0706',
      nombre: top?.descripcion || 'Recuperación de Línea 1 de Planta de Pellas',
      monto: topMontoAnual,
      porcentaje: displayMonto > 0 ? Math.round((topMontoAnual / displayMonto) * 1000) / 10 : 24.5
    };
  }, [selectedMes, displayMonto]);

  const topCCRaw = topProyectoData.codigo;
  const topCCMonto = topProyectoData.monto;
  const topCCPct = topProyectoData.porcentaje;

  // Mes con mayor costo (mes de mayor desembolso operativo)
  const topMes = [...resumenMeses].sort((a, b) => b.totalMonto - a.totalMonto)[0];

  // Último mes auditado (dinámico)
  const ultimoMes = useMemo(() => {
    if (!resumenMeses || resumenMeses.length === 0) return null;
    return resumenMeses[resumenMeses.length - 1];
  }, [resumenMeses]);

  const mesesHeaders = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct'];

  return (
    <div className="space-y-4">
      {/* ========================================================================= */}
      {/* 3 KPI CARDS: FINTECH EXECUTIVE STANDARD (STRIPE / LINEAR POLISH)          */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* KPI 1: Total Acumulado */}
        <div 
          onClick={onOpenProyectosMatriz}
          className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-blue-500/80 transition-all duration-200 cursor-pointer group relative overflow-hidden flex flex-col justify-between"
          title="Haz clic para abrir la Matriz de Distribución Mensual"
        >
          {/* Top accent line */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500" />

          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-blue-700 transition-colors">
              {isFiltered ? 'Total Acumulado (Filtrado)' : 'Total Acumulado 2026'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 transition-transform">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>

          <div className="my-2">
            <span className="text-2xl sm:text-[26px] font-black tracking-tight text-slate-900 group-hover:text-blue-900 transition-colors font-mono tabular-nums block">
              {safeFormatUSD(displayMonto, false)}
            </span>
            {!isFiltered ? (
              <span className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200/80 rounded-md px-2 py-0.5 inline-block font-semibold mt-1">
                * 10 meses y actual
              </span>
            ) : (
              <span className="text-[10px] text-blue-700 bg-blue-50 border border-blue-200 rounded-md px-2 py-0.5 inline-block font-semibold mt-1">
                Filtro temporal activo
              </span>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-400">
              {!isFiltered ? '10 Proyectos Externos' : `${resumenMeses.length} meses auditados`}
            </span>
            <span className="text-[11px] font-bold text-blue-600 group-hover:text-blue-800 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              <span>Ver distribución</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* KPI 2: Mes Actual (Octubre 2026) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-sky-500/80 transition-all duration-200 group relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-sky-500 via-blue-500 to-sky-600" />

          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-sky-700 transition-colors">
              Mes Actual
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 transition-transform">
              <Calendar className="w-4 h-4" />
            </div>
          </div>

          <div className="my-2">
            <span className="text-2xl sm:text-[26px] font-black tracking-tight text-slate-900 font-mono tabular-nums block">
              {ultimoMes ? safeFormatUSD(ultimoMes.totalMonto, false) : '$ 2,063,059'}
            </span>
            <span className="text-[10px] font-bold text-sky-900 bg-sky-50 border border-sky-200/80 rounded-md px-2 py-0.5 inline-block mt-1">
              {ultimoMes ? ultimoMes.mesLabel : 'Octubre 2026'}
            </span>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-400">Movimientos auditados</span>
            <span className="text-[11px] font-mono font-bold text-slate-700">
              {ultimoMes ? `${ultimoMes.totalSalidas.toLocaleString('de-DE')} salidas` : '10.055 salidas'}
            </span>
          </div>
        </div>

        {/* KPI 3: Mes con Mayor Desembolso */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-amber-500/80 transition-all duration-200 group relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600" />

          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-amber-700 transition-colors">
              Mes con Mayor Desembolso
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 transition-transform">
              <Activity className="w-4 h-4" />
            </div>
          </div>

          <div className="my-2">
            <span className="text-2xl sm:text-[26px] font-black tracking-tight text-slate-900 font-mono tabular-nums block">
              {topMes ? safeFormatUSD(topMes.totalMonto, false) : '$ 0'}
            </span>
            <span className="text-[10px] font-bold text-amber-900 bg-amber-50 border border-amber-200/80 rounded-md px-2 py-0.5 inline-block mt-1">
              {topMes ? `${topMes.mesLabel} (Mes Pico Operativo)` : 'Sin datos'}
            </span>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-400">Pico histórico 2026</span>
            <span className="text-[11px] font-mono font-black text-amber-700">
              {topMes && totalMontoGlobal > 0 ? `${Math.round((topMes.totalMonto / totalMontoGlobal) * 1000) / 10}% del total` : '17.5% del total'}
            </span>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* EXECUTIVE SPOTLIGHT BANNER: PROYECTO DOMINANTE                            */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0a193b] to-slate-900 text-white rounded-2xl p-4 sm:px-5 sm:py-3.5 shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center flex-wrap gap-2.5 text-xs min-w-0">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-blue-600/80 text-white flex items-center justify-center shadow-xs">
              <Award className="w-4 h-4" />
            </div>
            <span className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider">
              Proyecto Dominante:
            </span>
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-900/80 text-blue-200 border border-blue-700">
              {topCCRaw}
            </span>
            <span className="font-bold text-white truncate">
              {CUENTAS_CORTAS_MAP[topCCRaw] || 'Línea 1 Pellas'}
            </span>
          </div>

          <div className="hidden md:flex items-center gap-2 pl-2 text-slate-400 text-xs">
            <span>•</span>
            <span>Corte Ene-Oct: <strong className="text-white font-mono">$3.618.605 USD</strong> (24.5%)</span>
            <span>•</span>
            <span>Octubre: <strong className="text-emerald-400 font-mono">$1.219.526 USD</strong> (59.1%)</span>
            <span>•</span>
            <span>Global TIMACA: <strong className="text-slate-200 font-mono">{safeFormatUSD(ultimoMes?.totalMonto || 2063059, false)}</strong></span>
          </div>
        </div>

        {onOpenProyectosMatriz && (
          <button
            onClick={onOpenProyectosMatriz}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/10 cursor-pointer self-end md:self-center shrink-0"
          >
            <span>Ver Matriz de Proyectos</span>
            <ArrowRight className="w-3.5 h-3.5 text-blue-300" />
          </button>
        )}
      </div>

      {/* Quick Monthly Modal */}
      {showQuickMonthlyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-[#06122d] p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 rounded-xl bg-blue-600 text-white">
                  <CalendarDays className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-bold text-base leading-tight">
                    Distribución Mensual por Categoría de Costo (2026)
                  </h3>
                  <p className="text-xs text-blue-200 mt-0.5">
                    Consolidado oficial en USD · {resumenMeses.length} meses auditados
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowQuickMonthlyModal(false)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-x-auto flex-1">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-2.5 px-3 min-w-[170px]">Categoría</th>
                    {mesesHeaders.map((m) => (
                      <th key={m} className="py-2.5 px-2.5 text-right font-mono capitalize">{m}</th>
                    ))}
                    <th className="py-2.5 px-3 text-right bg-blue-50 text-blue-900 font-black">Total 2026</th>
                    <th className="py-2.5 px-2.5 text-center">Variación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white text-slate-800">
                  {TABLA_PPT_DISTRIBUCION_2026.map((row) => (
                    <tr key={row.categoria} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-slate-900 flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${
                          row.categoria === 'Materiales Directos' ? 'bg-blue-600'
                          : row.categoria === 'Servicios' ? 'bg-orange-500'
                          : row.categoria === 'Mano de Obra Directa' ? 'bg-emerald-600'
                          : row.categoria === 'Horas Maquina' ? 'bg-purple-600'
                          : 'bg-amber-500'
                        }`} />
                        <span>{row.categoria}</span>
                      </td>
                      {row.meses.map((val, idx) => (
                        <td key={idx} className="py-2.5 px-2.5 text-right font-mono tabular-nums text-slate-700">
                          {val.toLocaleString('de-DE')}
                        </td>
                      ))}
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums font-black text-blue-900 bg-blue-50/60 text-sm">
                        ${row.total2026.toLocaleString('de-DE')}
                      </td>
                      <td className="py-2.5 px-2.5 text-center font-mono font-bold text-[11px]">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md ${
                          row.esPositiva ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50'
                        }`}>
                          {row.esPositiva ? '▲ ' : '▼ '}
                          {row.variacion}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                Total consolidado 2026 (Ene - Oct): <strong className="text-slate-900">${TOTALES_MESES_PPT.reduce((a, b) => a + b.total, 0).toLocaleString('de-DE')} USD</strong>
              </span>
              <button
                onClick={() => setShowQuickMonthlyModal(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
