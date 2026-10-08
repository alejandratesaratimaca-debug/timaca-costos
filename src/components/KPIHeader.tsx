import React, { useState, useMemo } from 'react';
import { useCostos } from '../context/CostosContext';
import { formatCurrency, formatNumber } from '../utils/dateHelpers';
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
  ArrowDownRight
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
    resumenCentrosCosto,
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
      if (mesIdx >= 0 && mesIdx < 9) {
        const sorted = [...proyectosList].sort((a, b) => (b.meses[mesIdx] || 0) - (a.meses[mesIdx] || 0));
        const top = sorted[0];
        const mesTotal = TOTALES_MESES_PPT[mesIdx]?.total || displayMonto;
        const monto = top ? (top.meses[mesIdx] || 0) : 636352;
        return {
          codigo: top?.cuentaAuxiliar || 'TTE-C-0706',
          nombre: top?.descripcion || 'Recuperación de Línea 1 de Planta de Pellas',
          monto,
          porcentaje: mesTotal > 0 ? Math.round((monto / mesTotal) * 1000) / 10 : 47.3
        };
      }
    }
    // Consolidado Anual 2026 (TTE-C-0706: $2.024.563 / 17.1%)
    const sorted = [...proyectosList].sort((a, b) => b.totalAnual - a.totalAnual);
    const top = sorted[0];
    return {
      codigo: top?.cuentaAuxiliar || 'TTE-C-0706',
      nombre: top?.descripcion || 'Recuperación de Línea 1 de Planta de Pellas',
      monto: top?.totalAnual || 2024563.09,
      porcentaje: displayMonto > 0 ? Math.round(((top?.totalAnual || 2024563.09) / displayMonto) * 1000) / 10 : 17.1
    };
  }, [selectedMes, displayMonto]);

  const topCCRaw = topProyectoData.codigo;
  const topCCMonto = topProyectoData.monto;
  const topCCPct = topProyectoData.porcentaje;

  // Resolve human-readable name alongside account code
  const topCCNombre = CUENTAS_CORTAS_MAP[topCCRaw] 
    ? `${topCCRaw} · ${CUENTAS_CORTAS_MAP[topCCRaw]}`
    : `${topCCRaw} · ${topProyectoData.nombre}`;

  // Mes con mayor costo (mes de mayor desembolso operativo)
  const topMes = [...resumenMeses].sort((a, b) => b.totalMonto - a.totalMonto)[0];

  // Último mes auditado (dinámico, avanza progresivamente según los datos disponibles)
  const ultimoMes = useMemo(() => {
    if (!resumenMeses || resumenMeses.length === 0) return null;
    return resumenMeses[resumenMeses.length - 1];
  }, [resumenMeses]);

  const mesesHeaders = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep'];

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Acumulado */}
        <div 
          onClick={onOpenProyectosMatriz}
          className="bg-white p-4.5 rounded-xl border border-neutral-200/90 shadow-2xs hover:shadow-md hover:border-blue-500 transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between h-full min-h-[148px]"
          title="Haz clic para abrir la tabla oficial de Distribución Mensual 2026 de la presentación PowerPoint"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-transparent group-hover:bg-blue-600 transition-colors" />
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-700 group-hover:text-blue-700 transition-colors">
              {isFiltered ? 'Total Acumulado (Filtrado)' : 'Total Acumulado (Cierre Oficial)'}
            </span>
            <span className="w-8 h-8 rounded-lg bg-neutral-100 group-hover:bg-blue-50 group-hover:text-blue-600 flex items-center justify-center text-neutral-600 transition-colors shadow-2xs">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="my-1.5">
            <span className="text-2xl font-bold tracking-tight text-neutral-900 group-hover:text-blue-800 transition-colors font-mono tabular-nums block">
              {formatCurrency(displayMonto)}
            </span>
          </div>
          <div className="pt-2 border-t border-neutral-100 text-xs text-neutral-500 flex items-center justify-between">
            <span className="text-[11px] text-neutral-400">{resumenMeses.length} meses cerrados (PPT)</span>
            <span className="text-[11px] font-semibold text-blue-600 group-hover:text-blue-800 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              <span>Ver distribución</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* KPI 2: Promedio Semanal */}
        <div className="bg-white p-4.5 rounded-xl border border-neutral-200/90 shadow-2xs hover:shadow-md hover:border-blue-500 transition-all group relative overflow-hidden flex flex-col justify-between h-full min-h-[148px]">
          <div className="absolute top-0 left-0 right-0 h-1 bg-transparent group-hover:bg-blue-600 transition-colors" />
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 group-hover:text-blue-700 transition-colors">
              PROMEDIO SEMANAL
            </span>
            <span className="w-8 h-8 rounded-lg bg-neutral-100 group-hover:bg-blue-50 group-hover:text-blue-600 flex items-center justify-center text-neutral-600 transition-colors shadow-2xs">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="my-1.5">
            <span className="text-2xl font-bold tracking-tight text-neutral-900 font-mono tabular-nums block">
              {formatCurrency(promedioSemanal)}
            </span>
            <span className="text-xs font-semibold text-neutral-500 block truncate mt-0.5">
              {isFiltered ? 'En período seleccionado' : `Ritmo mensual: ${formatCurrency(Math.round(displayMonto / (resumenMeses.length || 8)))}`}
            </span>
          </div>
          <div className="pt-2 border-t border-neutral-100 text-xs text-neutral-500 flex items-center justify-between">
            <span className="text-[11px] text-neutral-400">
              {isFiltered ? 'Ritmo operativo' : 'Base: 35 sem. operativas'}
            </span>
            <span className="text-[11px] font-mono tabular-nums text-neutral-600">USD / sem</span>
          </div>
        </div>

        {/* KPI 3: Mes con Mayor Costo (Mes Pico) */}
        <div className="bg-white p-4.5 rounded-xl border border-neutral-200/90 shadow-2xs hover:shadow-md hover:border-blue-500 transition-all group relative overflow-hidden flex flex-col justify-between h-full min-h-[148px]">
          <div className="absolute top-0 left-0 right-0 h-1 bg-transparent group-hover:bg-blue-600 transition-colors" />
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 group-hover:text-blue-700 transition-colors" title="Mes de mayor desembolso operativo del año 2026">
              MES CON MAYOR COSTO
            </span>
            <span className="w-8 h-8 rounded-lg bg-neutral-100 group-hover:bg-blue-50 group-hover:text-blue-600 flex items-center justify-center text-neutral-600 transition-colors shadow-2xs">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="my-1.5">
            <span className="text-2xl font-bold tracking-tight text-neutral-900 font-mono tabular-nums block">
              {topMes ? formatCurrency(topMes.totalMonto) : '$ 0.00'}
            </span>
            <span className="text-xs font-bold text-neutral-700 block truncate mt-0.5">
              {topMes ? `${topMes.mesLabel} (Mes Pico)` : 'Sin datos'}
            </span>
          </div>
          <div className="pt-2 border-t border-neutral-100 text-xs text-neutral-500 flex items-center justify-between">
            <span className="text-[11px] text-neutral-400">Pico operativo del año</span>
            <span className="text-[11px] font-mono tabular-nums font-bold text-blue-700">
              {topMes && totalMontoGlobal > 0 ? `${Math.round((topMes.totalMonto / totalMontoGlobal) * 1000) / 10}% del total` : '22.6%'}
            </span>
          </div>
        </div>

        {/* KPI 4: Último Mes Auditado */}
        <div className="bg-white p-4.5 rounded-xl border border-neutral-200/90 shadow-2xs hover:shadow-md hover:border-blue-500 transition-all group relative overflow-hidden flex flex-col justify-between h-full min-h-[148px]">
          <div className="absolute top-0 left-0 right-0 h-1 bg-transparent group-hover:bg-blue-600 transition-colors" />
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 group-hover:text-blue-700 transition-colors" title="Último mes auditado y consolidado">
              ÚLTIMO MES AUDITADO
            </span>
            <span className="w-8 h-8 rounded-lg bg-neutral-100 group-hover:bg-blue-50 group-hover:text-blue-600 flex items-center justify-center text-neutral-600 transition-colors shadow-2xs">
              <Calendar className="w-4 h-4" />
            </span>
          </div>
          <div className="my-1.5">
            <span className="text-2xl font-bold tracking-tight text-neutral-900 font-mono tabular-nums block">
              {ultimoMes ? formatCurrency(ultimoMes.totalMonto) : '$ 0.00'}
            </span>
            <span className="text-xs font-bold text-neutral-700 block truncate mt-0.5">
              {ultimoMes ? ultimoMes.mesLabel : 'Sin datos'}
            </span>
          </div>
          <div className="pt-2 border-t border-neutral-100 text-xs text-neutral-500 flex items-center justify-between">
            <span className="text-[11px] text-neutral-400">Mes en curso auditado</span>
            <span className="text-[11px] font-mono tabular-nums text-neutral-600">{ultimoMes ? `${ultimoMes.totalSalidas} salidas` : '0 salidas'}</span>
          </div>
        </div>
      </div>

      {/* Sub-barra ejecutiva: Proyecto Dominante (Diferenciado explícitamente del Mes Pico) */}
      <div className="mt-3.5 bg-neutral-50/90 border border-neutral-200 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs">
        <div className="flex items-center flex-wrap gap-2.5">
          <span className="p-1 rounded-md bg-blue-100 text-blue-700 shrink-0">
            <Briefcase className="w-3.5 h-3.5" />
          </span>
          <span className="text-neutral-500 font-medium">Proyecto Dominante:</span>
          <span className="font-bold text-neutral-900">
            <span className="text-blue-700 font-mono">{topCCRaw}</span> · {CUENTAS_CORTAS_MAP[topCCRaw] || 'Línea 1 Pellas'}
          </span>
          <span className="text-neutral-300">|</span>
          <span className="text-neutral-600">
            Corte Ene-Sep (9 meses): <strong className="text-neutral-900 font-mono">$ 2.024.563,00</strong> <span className="text-blue-700 font-semibold">(16.3%)</span>
          </span>
          <span className="text-neutral-300">|</span>
          <span className="text-neutral-600">
            En Septiembre (Proyecto Pellas): <strong className="text-emerald-700 font-mono font-bold">$ 360.867,00</strong> <span className="text-emerald-800 font-semibold">(32.9%)</span>
          </span>
          <span className="text-neutral-300">|</span>
          <span className="text-neutral-500">
            Total Global Mes TIMACA (25 Proyectos): <strong className="text-neutral-900 font-mono">{formatCurrency(ultimoMes?.totalMonto || 1097082)}</strong>
          </span>
        </div>
        {onOpenProyectosMatriz && (
          <button
            onClick={onOpenProyectosMatriz}
            className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 transition-colors text-xs ml-auto cursor-pointer"
          >
            <span>Ver Matriz de Proyectos</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>

    {/* MODAL RÁPIDO DE DISTRIBUCIÓN MENSUAL 2026 (TABLA PPT) */}
    {showQuickMonthlyModal && (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-4xl overflow-hidden max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="bg-[#0b2545] p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-blue-800 text-white">
                <CalendarDays className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-bold text-base leading-tight">
                  Distribución Mensual por Categoría de Costo (2026)
                </h3>
                <p className="text-xs text-blue-200 mt-0.5">
                  Distribución consolidada en USD · {resumenMeses.length} meses auditados hasta {ultimoMes ? ultimoMes.mesLabel : 'Agosto 2026'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowQuickMonthlyModal(false)}
              className="p-1 rounded-lg text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Table */}
          <div className="p-4 overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#0b2545] text-white font-bold border-b border-[#081c33]">
                  <th className="py-2.5 px-3 min-w-[170px]">Distribución</th>
                  {mesesHeaders.map((m) => (
                    <th key={m} className="py-2.5 px-2.5 text-right font-mono capitalize">{m}</th>
                  ))}
                  <th className="py-2.5 px-3 text-right bg-[#081c33] text-amber-300">Total 2026</th>
                  <th className="py-2.5 px-2.5 text-center bg-[#081c33]">Variación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 bg-white text-neutral-800">
                {TABLA_PPT_DISTRIBUCION_2026.map((row) => (
                  <tr key={row.categoria} className="hover:bg-blue-50/50 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-neutral-900 flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${
                        row.categoria === 'Materiales Directos' ? 'bg-blue-600'
                        : row.categoria === 'Servicios' ? 'bg-orange-500'
                        : row.categoria === 'Mano de Obra Directa' ? 'bg-emerald-600'
                        : row.categoria === 'Horas Maquina' ? 'bg-purple-600'
                        : 'bg-amber-500'
                      }`} />
                      <span>{row.categoria}</span>
                    </td>
                    {row.meses.map((val, idx) => (
                      <td key={idx} className="py-2.5 px-2.5 text-right font-mono tabular-nums text-neutral-700">
                        {val.toLocaleString('de-DE')}
                      </td>
                    ))}
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums font-black text-[#0b2545] bg-blue-50/40 text-sm">
                      ${row.total2026.toLocaleString('de-DE')}
                    </td>
                    <td className="py-2.5 px-2.5 text-center font-mono font-bold text-[11px]">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded ${
                        row.esPositiva ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50'
                      }`}>
                        {row.esPositiva ? '▲ ' : '▼ '}
                        {row.variacion}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-[#0b2545] text-white font-black border-t-2 border-[#0b2545]">
                  <td className="py-3 px-3 uppercase tracking-wider">
                    TOTAL GENERAL MENSUAL
                  </td>
                  {TOTALES_MESES_PPT.map((tm) => (
                    <td key={tm.mesNum} className="py-3 px-2.5 text-right font-mono tabular-nums text-xs">
                      ${tm.total.toLocaleString('de-DE')}
                    </td>
                  ))}
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-sm text-amber-300">
                    ${TOTALES_MESES_PPT.reduce((a, b) => a + b.total, 0).toLocaleString('de-DE')}
                  </td>
                  <td className="py-3 px-2.5 text-center font-mono text-[11px] text-emerald-300">
                    +3.7%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Footer */}
          <div className="bg-neutral-50 p-3.5 border-t border-neutral-200 flex items-center justify-between">
            <span className="text-xs text-neutral-500">
              Total acumulado 9 meses (Ene - Sep 2026): <strong>${TOTALES_MESES_PPT.reduce((a, b) => a + b.total, 0).toLocaleString('de-DE')} USD</strong>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowQuickMonthlyModal(false)}
                className="px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-200 rounded-lg transition-colors"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  setShowQuickMonthlyModal(false);
                  onOpenProyectosMatriz?.();
                }}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5"
              >
                <span>Abrir Matriz Completa</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
  </>
  );
};
