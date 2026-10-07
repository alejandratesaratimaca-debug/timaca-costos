import React, { useState, useMemo } from 'react';
import { useCostos } from '../context/CostosContext';
import { formatCurrency, formatNumber } from '../utils/dateHelpers';
import { 
  CalendarRange, 
  ArrowUpRight, 
  ArrowDownRight, 
  Filter, 
  TrendingUp, 
  FileText,
  DollarSign,
  Package,
  ArrowLeft
} from 'lucide-react';

interface SemanaSemanaViewProps {
  onVolver?: () => void;
}

export const SemanaSemanaView: React.FC<SemanaSemanaViewProps> = ({ onVolver }) => {
  const { salidas, resumenSemanas, resumenMeses } = useCostos();

  // Selected week (defaults to latest available week)
  const defaultWeek = resumenSemanas[resumenSemanas.length - 1]?.semana || 1;
  const [selectedSemanaNum, setSelectedSemanaNum] = useState<number>(defaultWeek);
  const [filtroMes, setFiltroMes] = useState<string>('all');

  // Filtered weeks list based on month dropdown
  const semanasFiltradas = useMemo(() => {
    if (filtroMes === 'all') return resumenSemanas;
    return resumenSemanas.filter(w => w.mesLabel.includes(filtroMes));
  }, [resumenSemanas, filtroMes]);

  // Current active week object
  const activeWeekSummary = useMemo(() => {
    return resumenSemanas.find(w => w.semana === selectedSemanaNum) || resumenSemanas[resumenSemanas.length - 1];
  }, [resumenSemanas, selectedSemanaNum]);

  // Salidas of the active week
  const salidasDeSemana = useMemo(() => {
    if (!activeWeekSummary) return [];
    return salidas.filter(s => s.semana === activeWeekSummary.semana);
  }, [salidas, activeWeekSummary]);

  // Max monto for visual bar sizing
  const maxWeeklyMonto = Math.max(...resumenSemanas.map(s => s.totalMonto), 1);

  return (
    <div className="space-y-6">
      {/* Title & Controls Bar */}
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
              <CalendarRange className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-neutral-900 tracking-tight">
                Análisis de Salidas Semana a Semana
              </h2>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Supervisión continua del flujo de costos, materiales despachados y variaciones semanales
            </p>
          </div>
        </div>

        {/* Filter selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-neutral-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Filtrar por Mes:
          </span>
          <select
            value={filtroMes}
            onChange={(e) => setFiltroMes(e.target.value)}
            className="text-xs font-semibold text-neutral-800 bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todas las Semanas del Año</option>
            {resumenMeses.map(m => (
              <option key={`${m.ano}-${m.mes}`} value={m.mesLabel.split(' ')[0]}>
                {m.mesLabel}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Week Selector Ribbon */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200">
        <div className="text-xs font-bold text-neutral-700 uppercase tracking-wider mb-3">
          Línea de Tiempo Operativa ({semanasFiltradas.length} Semanas)
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {semanasFiltradas.map((w) => {
            const isSelected = activeWeekSummary?.semana === w.semana;
            const barHeightPct = Math.max((w.totalMonto / maxWeeklyMonto) * 100, 10);
            return (
              <button
                key={w.semana}
                onClick={() => setSelectedSemanaNum(w.semana)}
                className={`flex-shrink-0 w-28 p-3 rounded-lg border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20 shadow-xs'
                    : 'border-neutral-200 hover:border-neutral-300 bg-white'
                }`}
              >
                <div>
                  <span className={`text-[11px] font-bold block ${isSelected ? 'text-blue-700' : 'text-neutral-600'}`}>
                    {w.semanaLabel}
                  </span>
                  <span className="text-[10px] text-neutral-400 block truncate">
                    {w.mesLabel}
                  </span>
                </div>

                <div className="my-2 h-10 flex items-end">
                  <div
                    style={{ height: `${barHeightPct}%` }}
                    className={`w-full rounded-xs transition-all ${
                      isSelected ? 'bg-blue-600' : 'bg-neutral-300'
                    }`}
                  />
                </div>

                <div>
                  <span className="text-xs font-mono font-bold tabular-nums text-neutral-900 block truncate">
                    {formatCurrency(w.totalMonto)}
                  </span>
                  <span className="text-[10px] text-neutral-500 block">
                    {w.totalSalidas} salidas
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Week Details Spotlight */}
      {activeWeekSummary && (
        <div className="space-y-4">
          <div className="bg-neutral-900 text-white p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-600 text-white uppercase tracking-wider">
                  Semana Seleccionada
                </span>
                <span className="text-xs text-neutral-400">{activeWeekSummary.mesLabel}</span>
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-white mt-1">
                {activeWeekSummary.semanaLabel}
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-left">
              <div>
                <span className="text-[11px] text-neutral-400 block">Monto Total Salidas</span>
                <span className="text-xl font-bold font-mono tabular-nums text-amber-300">
                  {formatCurrency(activeWeekSummary.totalMonto)}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-neutral-400 block">Transacciones / Salidas</span>
                <span className="text-xl font-bold font-mono tabular-nums text-white">
                  {formatNumber(activeWeekSummary.totalSalidas)}
                </span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-[11px] text-neutral-400 block">Vs. Semana Previa</span>
                <div className="flex items-center gap-1">
                  {activeWeekSummary.porcentajeVariacion !== undefined && activeWeekSummary.porcentajeVariacion !== 0 ? (
                    <>
                      {activeWeekSummary.porcentajeVariacion > 0 ? (
                        <ArrowUpRight className="w-4 h-4 text-amber-400" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-emerald-400" />
                      )}
                      <span className={`text-base font-bold font-mono tabular-nums ${
                        activeWeekSummary.porcentajeVariacion > 0 ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {activeWeekSummary.porcentajeVariacion > 0 ? '+' : ''}
                        {activeWeekSummary.porcentajeVariacion}%
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-neutral-400">Sin datos previos</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* List of Salidas for Active Week */}
          <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-bold text-neutral-900 tracking-tight">
                  Salidas Despachadas en {activeWeekSummary.semanaLabel}
                </h4>
                <p className="text-xs text-neutral-500">
                  Desglose individual de materiales, ítems y servicios imputados
                </p>
              </div>
              <span className="text-xs font-semibold text-neutral-700 bg-neutral-100 px-3 py-1 rounded-md">
                Subtotal Semana: <strong className="font-mono tabular-nums text-neutral-900">{formatCurrency(activeWeekSummary.totalMonto)}</strong>
              </span>
            </div>

            {salidasDeSemana.length === 0 ? (
              <div className="p-12 text-center text-neutral-500">
                <Package className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                <p className="text-sm font-medium">No hay salidas registradas en esta semana.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 text-neutral-600 border-b border-neutral-200 font-semibold">
                    <tr>
                      <th className="py-2.5 px-4">Código Salida</th>
                      <th className="py-2.5 px-4">Fecha</th>
                      <th className="py-2.5 px-4">Centro de Costo / OT</th>
                      <th className="py-2.5 px-4">Categoría</th>
                      <th className="py-2.5 px-4">Descripción del Material</th>
                      <th className="py-2.5 px-4 text-right">Cant.</th>
                      <th className="py-2.5 px-4 text-right">P. Unitario</th>
                      <th className="py-2.5 px-4 text-right">Monto Total</th>
                      <th className="py-2.5 px-4">Destino / Proveedor</th>
                      <th className="py-2.5 px-4">Responsable</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {salidasDeSemana.map((s) => (
                      <tr key={s.id} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="py-2.5 px-4 font-mono font-bold text-neutral-900 whitespace-nowrap">
                          {s.codigoSalida}
                        </td>
                        <td className="py-2.5 px-4 whitespace-nowrap font-mono tabular-nums text-neutral-600">
                          {s.fecha}
                        </td>
                        <td className="py-2.5 px-4 max-w-[180px] truncate font-medium text-neutral-900" title={s.centroCosto}>
                          {s.centroCosto}
                        </td>
                        <td className="py-2.5 px-4 whitespace-nowrap text-neutral-600">
                          {s.categoria}
                        </td>
                        <td className="py-2.5 px-4 font-medium text-neutral-900 max-w-[220px] truncate" title={s.itemDescripcion}>
                          {s.itemDescripcion}
                        </td>
                        <td className="py-2.5 px-4 text-right whitespace-nowrap font-mono tabular-nums text-neutral-700">
                          {formatNumber(s.cantidad)} {s.unidadMedida}
                        </td>
                        <td className="py-2.5 px-4 text-right whitespace-nowrap font-mono tabular-nums text-neutral-600">
                          {formatCurrency(s.montoUnitario)}
                        </td>
                        <td className="py-2.5 px-4 text-right whitespace-nowrap font-mono tabular-nums font-bold text-neutral-900">
                          {formatCurrency(s.montoTotal)}
                        </td>
                        <td className="py-2.5 px-4 max-w-[160px] truncate text-neutral-600" title={s.proveedorODestino}>
                          {s.proveedorODestino}
                        </td>
                        <td className="py-2.5 px-4 whitespace-nowrap text-neutral-600">
                          {s.responsable}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-neutral-50 border-t-2 border-neutral-300 font-bold text-xs text-neutral-900">
                    <tr>
                      <td colSpan={5} className="py-3 px-4">
                        TOTAL DE {activeWeekSummary.semanaLabel.toUpperCase()}:
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums whitespace-nowrap">
                        {salidasDeSemana.reduce((acc, c) => acc + c.cantidad, 0)} uds
                      </td>
                      <td className="py-3 px-4"></td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-blue-700 text-sm font-black whitespace-nowrap min-w-[150px]">
                        {formatCurrency(activeWeekSummary.totalMonto)}
                      </td>
                      <td colSpan={2} className="py-3 px-4 text-neutral-500 font-normal whitespace-nowrap">
                        {salidasDeSemana.length} movimientos
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Global Weekly Comparison Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-neutral-200">
          <h3 className="text-sm font-bold text-neutral-900 tracking-tight">
            Tabla Comparativa Semana a Semana
          </h3>
          <p className="text-xs text-neutral-500">
            Resumen consolidado de todas las semanas del período
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 text-neutral-600 border-b border-neutral-200 font-semibold">
              <tr>
                <th className="py-2.5 px-4">Semana</th>
                <th className="py-2.5 px-4">Mes Corespondiente</th>
                <th className="py-2.5 px-4 text-center">Salidas</th>
                <th className="py-2.5 px-4 text-right">Monto Total (USD)</th>
                <th className="py-2.5 px-4 text-right">Diferencia Neta</th>
                <th className="py-2.5 px-4 text-right">Variación %</th>
                <th className="py-2.5 px-4 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {resumenSemanas.map((w) => {
                const isCurrent = activeWeekSummary?.semana === w.semana;
                const hasDiff = w.diferenciaPrevia !== undefined && w.diferenciaPrevia !== 0;
                const isInc = (w.diferenciaPrevia || 0) > 0;

                return (
                  <tr
                    key={w.semana}
                    className={`transition-colors ${isCurrent ? 'bg-blue-50/40 font-semibold' : 'hover:bg-neutral-50'}`}
                  >
                    <td className="py-2.5 px-4 whitespace-nowrap font-bold text-neutral-900">
                      {w.semanaLabel}
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap text-neutral-600">
                      {w.mesLabel}
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono tabular-nums text-neutral-700">
                      {w.totalSalidas}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono tabular-nums font-bold text-neutral-900">
                      {formatCurrency(w.totalMonto)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono tabular-nums text-neutral-700 whitespace-nowrap">
                      {hasDiff ? `${isInc ? '+' : ''}${formatCurrency(w.diferenciaPrevia!)}` : '—'}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono tabular-nums whitespace-nowrap">
                      {w.porcentajeVariacion !== undefined && w.porcentajeVariacion !== 0 ? (
                        <span className={isInc ? 'text-amber-600 font-semibold' : 'text-emerald-600 font-semibold'}>
                          {isInc ? '+' : ''}{w.porcentajeVariacion}%
                        </span>
                      ) : (
                        <span className="text-neutral-400">—</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <button
                        onClick={() => setSelectedSemanaNum(w.semana)}
                        className={`text-xs px-2.5 py-1 rounded transition-colors ${
                          isCurrent
                            ? 'bg-blue-600 text-white font-medium'
                            : 'text-neutral-700 bg-neutral-100 hover:bg-neutral-200'
                        }`}
                      >
                        {isCurrent ? 'Inspeccionando' : 'Ver Salidas'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
