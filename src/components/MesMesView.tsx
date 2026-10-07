import React, { useState, useMemo } from 'react';
import { useCostos } from '../context/CostosContext';
import { formatCurrency, formatNumber } from '../utils/dateHelpers';
import { CATEGORIAS_PPT_2026, CUENTAS_CORTAS_MAP } from '../data/mockCostosTimaca';
import { MATRIZ_REAL_PROYECTOS_MENSUAL_2026 } from '../data/realProyectosMensual2026';
import { CalendarDays, ArrowUpRight, ArrowDownRight, Layers, Briefcase, FileSpreadsheet, ArrowLeft } from 'lucide-react';

interface MesMesViewProps {
  onVolver?: () => void;
}

export const MesMesView: React.FC<MesMesViewProps> = ({ onVolver }) => {
  const {
    resumenMeses,
    totalMontoGlobal,
    resumenCategorias,
    resumenCentrosCosto,
    salidas,
  } = useCostos();

  const [activeTabSub, setActiveTabSub] = useState<'categorias' | 'centros'>('categorias');

  // Compute monthly average
  const promedioMensual = resumenMeses.length > 0 
    ? Math.round((totalMontoGlobal / resumenMeses.length) * 100) / 100 
    : 0;

  // Build matrix for categories across all months (5 Official PPT Categories)
  const allCategoriasNames = CATEGORIAS_PPT_2026;
  const allCentrosNames = useMemo(() => {
    return Object.values(MATRIZ_REAL_PROYECTOS_MENSUAL_2026)
      .sort((a, b) => b.totalAnual - a.totalAnual)
      .map(p => `${p.cuentaAuxiliar} · ${CUENTAS_CORTAS_MAP[p.cuentaAuxiliar] || p.descripcion}`);
  }, []);

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="bg-white p-5 rounded-xl border border-neutral-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onVolver && (
            <button
              onClick={onVolver}
              className="flex items-center gap-1.5 font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200/90 px-2.5 py-1.5 rounded-lg transition-colors text-xs shadow-2xs shrink-0 self-center"
              title="Volver al Resumen General"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver</span>
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-neutral-900 tracking-tight">
                Análisis Consolidado Mes a Mes
              </h2>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Matriz financiera de desembolsos, distribución por rubros y comparativa mensual acumulada
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] text-neutral-500 block">Promedio Mensual</span>
            <span className="text-base font-bold font-mono tabular-nums text-neutral-900">
              {formatCurrency(promedioMensual)}
            </span>
          </div>
          <div className="h-8 w-px bg-neutral-200" />
          <div className="text-right">
            <span className="text-[11px] text-neutral-500 block">Total Acumulado</span>
            <span className="text-base font-bold font-mono tabular-nums text-blue-600">
              {formatCurrency(totalMontoGlobal)}
            </span>
          </div>
        </div>
      </div>

      {/* Monthly Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {resumenMeses.map((m) => {
          const isInc = (m.porcentajeVariacion || 0) > 0;
          const hasVar = m.porcentajeVariacion !== undefined && m.porcentajeVariacion !== 0;

          // Find top category for this month
          const topCat = Object.entries(m.porCategoria).sort((a, b) => b[1] - a[1])[0];
          // Find top CC for this month
          const topCC = Object.entries(m.porCentroCosto).filter(([k]) => k.startsWith('TTE-C-') && k.includes(' · ')).sort((a, b) => b[1] - a[1])[0];

          return (
            <div
              key={`${m.ano}-${m.mes}`}
              className="bg-white p-5 rounded-xl border border-neutral-200 hover:border-neutral-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                  <span className="text-sm font-bold text-neutral-900">{m.mesLabel}</span>
                  {hasVar ? (
                    <span className={`flex items-center text-xs font-mono font-bold tabular-nums ${
                      isInc ? 'text-amber-600' : 'text-emerald-600'
                    }`}>
                      {isInc ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
                      {isInc ? '+' : ''}{m.porcentajeVariacion}%
                    </span>
                  ) : (
                    <span className="text-xs text-neutral-400 font-mono">Mes base</span>
                  )}
                </div>

                <div className="py-4 space-y-1">
                  <span className="text-xs text-neutral-500 block">Monto Total Salidas</span>
                  <span className="text-2xl font-bold font-mono tabular-nums text-neutral-900 block">
                    {formatCurrency(m.totalMonto)}
                  </span>
                  <span className="text-xs text-neutral-500 block font-mono tabular-nums">
                    {m.totalSalidas} salidas registradas
                  </span>
                </div>

                <div className="pt-3 border-t border-neutral-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Promedio semanal:</span>
                    <span className="font-mono tabular-nums font-semibold text-neutral-800">
                      {formatCurrency(m.promedioSemanal)}
                    </span>
                  </div>

                  {topCat && (
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-neutral-500 shrink-0">Mayor rubro:</span>
                      <span className="font-medium text-neutral-800 truncate text-right" title={topCat[0]}>
                        {topCat[0]} ({formatCurrency(topCat[1])})
                      </span>
                    </div>
                  )}

                  {topCC && (
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-neutral-500 shrink-0">Mayor OT:</span>
                      <span className="font-medium text-neutral-800 truncate text-right" title={topCC[0]}>
                        {topCC[0]} ({formatCurrency(topCC[1])})
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Monthly Comparative Matrix */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 tracking-tight">
              Matriz Comparativa Mes a Mes
            </h3>
            <p className="text-xs text-neutral-500">
              Desglose cruzado de costos por mes de operación
            </p>
          </div>

          {/* Toggle between Categorías vs Centros de Costo */}
          <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTabSub('categorias')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                activeTabSub === 'categorias'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Por Categoría</span>
            </button>
            <button
              onClick={() => setActiveTabSub('centros')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                activeTabSub === 'centros'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Por Proyecto (Cuenta Auxiliar)</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 text-neutral-600 border-b border-neutral-200 font-semibold">
              <tr>
                <th className="py-2.5 px-4 min-w-[200px]">
                  {activeTabSub === 'categorias' ? 'Categoría / Rubro' : 'Proyecto (Cuenta Auxiliar)'}
                </th>
                {resumenMeses.map((m) => (
                  <th key={`${m.ano}-${m.mes}`} className="py-2.5 px-4 text-right min-w-[130px]">
                    {m.mesLabel}
                  </th>
                ))}
                <th className="py-2.5 px-4 text-right min-w-[140px] bg-neutral-100/70 font-bold text-neutral-900">
                  Total Acumulado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {activeTabSub === 'categorias' ? (
                allCategoriasNames.map((catName) => {
                  let totalCatAcumulado = 0;
                  return (
                    <tr key={catName} className="hover:bg-neutral-50 transition-colors">
                      <td className="py-2.5 px-4 font-semibold text-neutral-900">
                        {catName}
                      </td>
                      {resumenMeses.map((m) => {
                        const val = m.porCategoria[catName] || 0;
                        totalCatAcumulado += val;
                        return (
                          <td key={`${m.ano}-${m.mes}`} className="py-2.5 px-4 text-right font-mono tabular-nums text-neutral-700 whitespace-nowrap">
                            {val > 0 ? formatCurrency(val) : '—'}
                          </td>
                        );
                      })}
                      <td className="py-2.5 px-4 text-right font-mono tabular-nums font-bold text-neutral-900 bg-neutral-50/50 whitespace-nowrap">
                        {formatCurrency(totalCatAcumulado)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                allCentrosNames.map((ccName) => {
                  let totalCCAcumulado = 0;
                  return (
                    <tr key={ccName} className="hover:bg-neutral-50 transition-colors">
                      <td className="py-2.5 px-4 font-semibold text-neutral-900 max-w-[280px] truncate" title={ccName}>
                        {ccName}
                      </td>
                      {resumenMeses.map((m) => {
                        const val = m.porCentroCosto[ccName] || 0;
                        totalCCAcumulado += val;
                        return (
                          <td key={`${m.ano}-${m.mes}`} className="py-2.5 px-4 text-right font-mono tabular-nums text-neutral-700 whitespace-nowrap">
                            {val > 0 ? formatCurrency(val) : '—'}
                          </td>
                        );
                      })}
                      <td className="py-2.5 px-4 text-right font-mono tabular-nums font-bold text-neutral-900 bg-neutral-50/50 whitespace-nowrap">
                        {formatCurrency(totalCCAcumulado)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            <tfoot className="bg-neutral-100 border-t-2 border-neutral-300 font-bold text-xs text-neutral-900 sticky bottom-0">
              <tr>
                <td className="py-3 px-4 font-black uppercase tracking-wider text-slate-900">
                  TOTAL GENERAL ACUMULADO (TODOS LOS MESES):
                </td>
                {resumenMeses.map((m) => (
                  <td key={`${m.ano}-${m.mes}`} className="py-3 px-4 text-right font-mono tabular-nums text-blue-700 text-sm font-black whitespace-nowrap">
                    {formatCurrency(m.totalMonto)}
                  </td>
                ))}
                <td className="py-3 px-4 text-right font-mono tabular-nums text-blue-900 text-sm font-black bg-blue-100/70 whitespace-nowrap min-w-[150px]">
                  {formatCurrency(totalMontoGlobal)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
