import React, { useState } from 'react';
import { useCostos } from '../context/CostosContext';
import { formatCurrency } from '../utils/dateHelpers';
import { KPIHeader } from './KPIHeader';
import { CUENTAS_CORTAS_MAP, DETALLE_SUBCONCEPTOS_CATEGORIAS, TABLA_PPT_DISTRIBUCION_2026, TOTALES_MESES_PPT } from '../data/mockCostosTimaca';
import { 
  TrendingUp, 
  PieChart as PieIcon, 
  BarChart2, 
  ArrowRight,
  Briefcase,
  Layers,
  Info,
  X
} from 'lucide-react';
import { UsuarioSistema } from '../types/usuarios';
import { ResumenMensual } from '../types/costos';

interface DashboardViewProps {
  onGoToProyectos: () => void;
  onGoToSemanas: () => void;
  onGoToMeses: () => void;
  onGoToInforme: () => void;
  onGoToTabla: () => void;
  onOpenImport: () => void;
  onGoToManoObra?: () => void;
  onGoToCategoria?: (categoria: string) => void;
  onOpenProyectosMatriz?: () => void;
  onSelectProyecto?: (cuentaAux: string) => void;
  currentUser?: UsuarioSistema;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onGoToProyectos,
  onGoToSemanas,
  onGoToMeses,
  onGoToInforme,
  onGoToTabla,
  onOpenImport,
  onGoToManoObra,
  onGoToCategoria,
  onOpenProyectosMatriz,
  onSelectProyecto,
  currentUser
}) => {
  const {
    resumenSemanas,
    resumenMeses,
    resumenCategorias,
    resumenProyectos,
    totalMontoGlobal,
  } = useCostos();

  const isGerente = currentUser?.rol === 'Gerente de Proyecto';
  const cuentasAsignadas = currentUser?.cuentasAsignadas || [];

  const [hoveredWeek, setHoveredWeek] = useState<number | null>(null);
  const [chartMode, setChartMode] = useState<'mensual' | 'semanal' | 'por-categoria'>('mensual');
  const [selectedCatFocus, setSelectedCatFocus] = useState<string>('Materiales Directos');
  const [selectedMesModal, setSelectedMesModal] = useState<ResumenMensual | null>(null);
  const [periodoDetalleCategorias, setPeriodoDetalleCategorias] = useState<'anual' | number>(9);

  const MESES_CONFIG = [
    { num: 1, label: 'Enero', corto: 'Ene' },
    { num: 2, label: 'Febrero', corto: 'Feb' },
    { num: 3, label: 'Marzo', corto: 'Mar' },
    { num: 4, label: 'Abril', corto: 'Abr' },
    { num: 5, label: 'Mayo', corto: 'May' },
    { num: 6, label: 'Junio', corto: 'Jun' },
    { num: 7, label: 'Julio', corto: 'Jul' },
    { num: 8, label: 'Agosto', corto: 'Ago' },
    { num: 9, label: 'Septiembre', corto: 'Sep' }
  ];

  // Maximum weekly and monthly amount for chart scaling
  const maxWeeklyMonto = Math.max(...resumenSemanas.map((s) => s.totalMonto), 1);
  const maxMonthlyMonto = Math.max(...resumenMeses.map((m) => m.totalMonto), 1);

  // Color mapping for categories
  const categoryColors: Record<string, string> = {
    'Materiales Directos': '#2563eb', // Blue
    'Servicios': '#f97316',          // Orange
    'Mano de Obra Directa': '#10b981', // Emerald
    'Horas Maquina': '#8b5cf6',       // Purple
    'Costos Indirectos': '#eab308'    // Amber
  };

  return (
    <div className="space-y-6">
      {/* Banner de Segregación para Gerentes de Proyecto */}
      {isGerente && (
        <div className="bg-gradient-to-r from-amber-50 via-amber-100/60 to-blue-50 border border-amber-300 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs animate-fade-in">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-amber-600 text-white rounded-xl font-bold shadow-2xs shrink-0">
              <Briefcase className="w-5 h-5" />
            </span>
            <div className="space-y-0.5">
              <span className="font-bold text-amber-950 text-sm block">
                Sesión de Gerente de Proyecto · Vista Restringida a Cuentas Asignadas
              </span>
              <p className="text-amber-900/90 text-xs">
                Estás visualizando exclusivamente los costos y vales de tu frente de obra: <strong className="font-mono text-blue-900">{cuentasAsignadas.join(', ')}</strong> ({currentUser?.proyectosNombres?.join(', ') || 'Mis Proyectos'}).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* KPI Header */}
      <KPIHeader onOpenProyectosMatriz={onOpenProyectosMatriz} />

      {/* Main Multi-Colored Interactive Chart */}
      <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
        {/* Header of Chart with Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-bold text-neutral-900 tracking-tight">
                Evolución de Costos por Categoría (Cifras en USD)
              </h3>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5 flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs">
                Acumulado del año 2026
              </span>
              <span>Distribución de las 5 categorías oficiales a lo largo de los meses y semanas operativas</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-neutral-100 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setChartMode('mensual')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  chartMode === 'mensual' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                Mes a Mes (Recomendado)
              </button>
              <button
                onClick={() => setChartMode('por-categoria')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  chartMode === 'por-categoria' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                Por Categoría
              </button>
              <button
                onClick={() => setChartMode('semanal')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  chartMode === 'semanal' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                Semana a Semana
              </button>
            </div>

            <button
              onClick={chartMode === 'semanal' ? onGoToSemanas : onGoToMeses}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors px-2 py-1"
            >
              <span>Ver Matriz</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Legend of 5 Colors: Interactive buttons to navigate directly to each category */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mr-1">
            Categorías (Haz clic para auditar):
          </span>
          {Object.entries(categoryColors).map(([cat, color]) => {
            const isFocused = chartMode === 'por-categoria' && selectedCatFocus === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  if (onGoToCategoria) {
                    onGoToCategoria(cat);
                  } else {
                    setSelectedCatFocus(cat);
                    setChartMode('por-categoria');
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-2xs group ${
                  isFocused
                    ? 'bg-blue-50 border-blue-400 text-blue-900 ring-2 ring-blue-500/20'
                    : 'bg-neutral-50 hover:bg-blue-50/50 border-neutral-200 text-neutral-800 hover:border-blue-300'
                }`}
                title={`Ir directamente al desglose detallado de ${cat}`}
              >
                <span className="w-3 h-3 rounded-sm shrink-0 shadow-2xs" style={{ backgroundColor: color }} />
                <span className="font-bold group-hover:text-blue-700">{cat}</span>
                <ArrowRight className="w-3 h-3 text-neutral-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5" />
              </button>
            );
          })}
        </div>

        {/* Chart Body */}
        {chartMode === 'por-categoria' ? (
          /* VISTA 1: POR CATEGORÍA INDIVIDUAL (Resuelve la confusión de las barras superpuestas) */
          <div className="space-y-4 pt-2">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-50 p-3 rounded-xl border border-neutral-200">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-neutral-700">Examinando categoría:</span>
                <select
                  value={selectedCatFocus}
                  onChange={(e) => setSelectedCatFocus(e.target.value)}
                  className="text-xs font-bold text-neutral-900 bg-white border border-neutral-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500"
                >
                  {Object.keys(categoryColors).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              {onGoToCategoria && (
                <button
                  onClick={() => onGoToCategoria(selectedCatFocus)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-white border border-blue-200 px-3 py-1.5 rounded-lg shadow-2xs transition-colors"
                >
                  <span>Abrir Matriz Completa de {selectedCatFocus}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 pt-2">
              {resumenMeses.map((m) => {
                const montoCat = m.porCategoria?.[selectedCatFocus] ?? 0;
                const maxCatMes = Math.max(...resumenMeses.map(x => x.porCategoria?.[selectedCatFocus] || 1), 1);
                const heightPct = Math.max((montoCat / maxCatMes) * 100, 8);

                return (
                  <div key={m.mes} className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 text-center flex flex-col justify-between h-48">
                    <div>
                      <span className="text-xs font-bold text-neutral-800 block whitespace-nowrap">
                        {m.mesLabel}
                      </span>
                    </div>

                    <div className="flex-1 flex items-end justify-center py-2">
                      <div
                        style={{ height: `${heightPct}%`, backgroundColor: categoryColors[selectedCatFocus] }}
                        className="w-10 rounded-t-md shadow-xs transition-all hover:opacity-90 cursor-pointer"
                        onClick={() => setSelectedMesModal(m)}
                        title={`${selectedCatFocus} en ${m.mesLabel}: $${montoCat.toLocaleString('de-DE')} USD · Clic para ver mes`}
                      />
                    </div>

                    <div>
                      <span className="text-xs font-black font-mono text-neutral-900 block truncate">
                        ${montoCat.toLocaleString('de-DE')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : chartMode === 'semanal' ? (
          /* VISTA 2: SEMANA A SEMANA CON TOOLTIPS RICOS */
          <div className="pt-2">
            <div className="overflow-x-auto pb-2 border-b border-neutral-100">
              <div className="h-52 flex items-end gap-1.5 px-2 min-w-max">
                {resumenSemanas.map((s) => {
                  const heightPercent = Math.max((s.totalMonto / maxWeeklyMonto) * 100, 4);
                  const isHovered = hoveredWeek === s.semana;

                  const matPct = 0.44;
                  const modPct = 0.19;
                  const srvPct = 0.10;
                  const hmPct = 0.08;
                  const indPct = 0.19;

                  return (
                    <div
                      key={s.semana}
                      className="w-6 sm:w-7 flex-shrink-0 flex flex-col items-center group relative cursor-pointer"
                      onMouseEnter={() => setHoveredWeek(s.semana)}
                      onMouseLeave={() => setHoveredWeek(null)}
                    >
                      {/* Rich Tooltip on hover */}
                      {isHovered && (
                        <div className="absolute -top-32 z-30 bg-neutral-900 text-white text-xs rounded-xl py-2 px-3 shadow-xl whitespace-nowrap pointer-events-none space-y-1">
                          <p className="font-bold text-amber-300">{s.semanaLabel} ({s.mesLabel})</p>
                          <p className="font-mono font-bold text-white text-sm">${s.totalMonto.toLocaleString('de-DE')} USD</p>
                          <div className="text-[10px] space-y-0.5 pt-1 border-t border-neutral-700 text-neutral-300">
                            <div className="flex justify-between gap-3">
                              <span className="text-blue-400">Materiales:</span>
                              <span className="font-mono">${Math.round(s.totalMonto * matPct).toLocaleString('de-DE')}</span>
                            </div>
                            <div className="flex justify-between gap-3">
                              <span className="text-emerald-400">Mano de Obra:</span>
                              <span className="font-mono">${Math.round(s.totalMonto * modPct).toLocaleString('de-DE')}</span>
                            </div>
                            <div className="flex justify-between gap-3">
                              <span className="text-orange-400">Servicios:</span>
                              <span className="font-mono">${Math.round(s.totalMonto * srvPct).toLocaleString('de-DE')}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Stacked Colored Bar */}
                      <div className="w-full flex flex-col justify-end h-44 rounded-t overflow-hidden shadow-xs transition-transform group-hover:scale-105">
                        <div style={{ height: `${heightPercent}%` }} className="w-full flex flex-col">
                          <div style={{ height: `${indPct * 100}%`, backgroundColor: categoryColors['Costos Indirectos'] }} />
                          <div style={{ height: `${hmPct * 100}%`, backgroundColor: categoryColors['Horas Maquina'] }} />
                          <div style={{ height: `${srvPct * 100}%`, backgroundColor: categoryColors['Servicios'] }} />
                          <div style={{ height: `${modPct * 100}%`, backgroundColor: categoryColors['Mano de Obra Directa'] }} />
                          <div style={{ height: `${matPct * 100}%`, backgroundColor: categoryColors['Materiales Directos'] }} />
                        </div>
                      </div>

                      <span className="text-[9px] font-mono tabular-nums text-neutral-500 mt-2 truncate w-full text-center">
                        S{s.semana.toString().padStart(2, '0')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="pt-2 flex items-center justify-between text-xs text-neutral-500">
              <span>← Desplaza horizontalmente para examinar las {resumenSemanas.length} semanas operativas de 2026 →</span>
              <span className="font-mono font-bold text-neutral-900">Total Acumulado: {formatCurrency(totalMontoGlobal)}</span>
            </div>
          </div>
        ) : (
          /* VISTA 3: MES A MES (LISTA UNIFICADA COMPACTA Y ALINEADA) */
          <div className="space-y-3 pt-2">
            {/* Nota informativa sutil */}
            <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3 text-xs text-slate-700 flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                <strong>Consolidación mensual oficial:</strong> Despachos SIP de almacén, contratos de servicios y nómina semanal de RRHH imputados a cuentas auxiliares. Pasa el cursor por las barras o haz clic para ver el desglose en tiempo real.
              </span>
            </div>

            {/* Contenedor Unificado Compacto con bordes divisores sutiles */}
            <div className="bg-white rounded-xl border border-neutral-200/90 divide-y divide-neutral-100 overflow-hidden shadow-2xs">
              {/* Encabezado de columnas de la lista */}
              <div className="hidden md:flex items-center px-4 py-2 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-neutral-200/80">
                <span className="w-56 lg:w-60 shrink-0">Mes / Período</span>
                <span className="flex-1 px-2">Distribución de Categorías</span>
                <span className="w-36 shrink-0 text-right">Promedio Semanal</span>
                <span className="w-36 shrink-0 text-right">Total Mes (USD)</span>
              </div>

              {resumenMeses.map((m) => {
                const widthPct = Math.max((m.totalMonto / maxMonthlyMonto) * 100, 2);

                const matVal = m.porCategoria?.['Materiales Directos'] ?? Math.round(m.totalMonto * 0.44);
                const modVal = m.porCategoria?.['Mano de Obra Directa'] ?? Math.round(m.totalMonto * 0.19);
                const srvVal = m.porCategoria?.['Servicios'] ?? Math.round(m.totalMonto * 0.10);
                const hmVal = m.porCategoria?.['Horas Maquina'] ?? Math.round(m.totalMonto * 0.08);
                const indVal = m.porCategoria?.['Costos Indirectos'] ?? Math.round(m.totalMonto * 0.19);

                const tot = m.totalMonto || 1;
                const matPct = matVal / tot;
                const modPct = modVal / tot;
                const srvPct = srvVal / tot;
                const hmPct = hmVal / tot;
                const indPct = indVal / tot;

                return (
                  <div 
                    key={`${m.ano}-${m.mes}`} 
                    onClick={() => setSelectedMesModal(m)}
                    className="p-3.5 sm:px-4 sm:py-2.5 hover:bg-blue-50/70 transition-colors flex flex-col md:flex-row md:items-center gap-2 md:gap-4 cursor-pointer group"
                    title={`Haz clic para abrir el desglose oficial de ${m.mesLabel}`}
                  >
                    {/* Col 1: Mes y salidas (Ancho suficiente para evitar solapamientos) */}
                    <div className="w-full md:w-56 lg:w-60 shrink-0 flex items-center justify-between md:justify-start gap-2.5">
                      <span className="font-bold text-neutral-900 text-xs sm:text-sm whitespace-nowrap">{m.mesLabel}</span>
                      <span className="text-[10px] font-mono font-medium bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full border border-neutral-200/60 shrink-0 whitespace-nowrap">
                        {m.totalSalidas} salidas
                      </span>
                    </div>

                    {/* Col 2: Barra apilada delgada (8-10px) con esquinas redondeadas y tooltips al pasar el cursor */}
                    <div className="flex-1 min-w-[140px] py-1">
                      <div className="h-2.5 w-full bg-neutral-100 rounded-full overflow-hidden flex shadow-2xs">
                        <div 
                          style={{ width: `${widthPct * matPct}%`, backgroundColor: categoryColors['Materiales Directos'] }} 
                          title={`Materiales Directos: $${matVal.toLocaleString('de-DE')} USD (${Math.round(matPct * 100)}%) · Clic para auditar`} 
                          className="hover:opacity-80 cursor-pointer transition-opacity"
                          onClick={(e) => { e.stopPropagation(); onGoToCategoria?.('Materiales Directos'); }}
                        />
                        <div 
                          style={{ width: `${widthPct * modPct}%`, backgroundColor: categoryColors['Mano de Obra Directa'] }} 
                          title={`Mano de Obra Directa: $${modVal.toLocaleString('de-DE')} USD (${Math.round(modPct * 100)}%) · Clic para auditar`} 
                          className="hover:opacity-80 cursor-pointer transition-opacity"
                          onClick={(e) => { e.stopPropagation(); onGoToCategoria?.('Mano de Obra Directa'); }}
                        />
                        <div 
                          style={{ width: `${widthPct * srvPct}%`, backgroundColor: categoryColors['Servicios'] }} 
                          title={`Servicios: $${srvVal.toLocaleString('de-DE')} USD (${Math.round(srvPct * 100)}%) · Clic para auditar`} 
                          className="hover:opacity-80 cursor-pointer transition-opacity"
                          onClick={(e) => { e.stopPropagation(); onGoToCategoria?.('Servicios'); }}
                        />
                        <div 
                          style={{ width: `${widthPct * hmPct}%`, backgroundColor: categoryColors['Horas Maquina'] }} 
                          title={`Horas Máquina: $${hmVal.toLocaleString('de-DE')} USD (${Math.round(hmPct * 100)}%) · Clic para auditar`} 
                          className="hover:opacity-80 cursor-pointer transition-opacity"
                          onClick={(e) => { e.stopPropagation(); onGoToCategoria?.('Horas Maquina'); }}
                        />
                        <div 
                          style={{ width: `${widthPct * indPct}%`, backgroundColor: categoryColors['Costos Indirectos'] }} 
                          title={`Costos Indirectos: $${indVal.toLocaleString('de-DE')} USD (${Math.round(indPct * 100)}%) · Clic para auditar`} 
                          className="hover:opacity-80 cursor-pointer transition-opacity"
                          onClick={(e) => { e.stopPropagation(); onGoToCategoria?.('Costos Indirectos'); }}
                        />
                      </div>
                    </div>

                    {/* Col 3: Promedio semanal (Ancho fijo alineado a la derecha con fuentes tabulares) */}
                    <div className="w-full md:w-36 shrink-0 text-left md:text-right">
                      <span className="text-[10px] text-neutral-400 block md:hidden">Promedio semanal:</span>
                      <span className="font-mono tabular-nums text-neutral-600 text-xs">
                        ${Math.round(m.promedioSemanal).toLocaleString('de-DE')} <span className="text-[10px] text-neutral-400 font-sans">/sem</span>
                      </span>
                    </div>

                    {/* Col 4: Total Mes (Ancho fijo alineado a la derecha con fuentes tabulares destacadas) */}
                    <div className="w-full md:w-36 shrink-0 text-left md:text-right">
                      <span className="text-[10px] text-neutral-400 block md:hidden">Total mes:</span>
                      <span className="font-mono tabular-nums font-bold text-neutral-900 text-sm block">
                        ${m.totalMonto.toLocaleString('de-DE')} <span className="text-[10px] font-sans font-medium text-neutral-500">USD</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Grid of Categories Details Cards (Sección 4: Detalle Técnico de Categorías) */}
      <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <Layers className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-bold text-neutral-900 tracking-tight">
                Detalle Técnico de las 5 Categorías Oficiales
              </h3>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              {periodoDetalleCategorias === 'anual'
                ? 'Distribución anual acumulada oficial 2026 (Enero a Septiembre: $12.478.718 USD)'
                : `Distribución oficial de ${MESES_CONFIG.find(m => m.num === periodoDetalleCategorias)?.label || ''} 2026 (${(TOTALES_MESES_PPT[Math.max(0, Math.min(8, (periodoDetalleCategorias as number) - 1))]?.total || 0).toLocaleString('de-DE')} USD)`}
            </p>
          </div>

          {/* Selector de período: Acumulado 2026 vs Todos los Meses */}
          <div className="flex flex-wrap items-center p-1 bg-neutral-100 rounded-xl border border-neutral-200 text-xs font-bold shrink-0 shadow-2xs gap-1">
            <button
              type="button"
              onClick={() => setPeriodoDetalleCategorias('anual')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                periodoDetalleCategorias === 'anual'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
              }`}
              title="Ver acumulado de los 9 meses oficiales (Enero a Septiembre: $12.478.718 USD)"
            >
              ★ Acumulado Anual (Ene - Sep: $12.5M)
            </button>
            {MESES_CONFIG.map((m) => (
              <button
                key={m.num}
                type="button"
                onClick={() => setPeriodoDetalleCategorias(m.num)}
                className={`px-2.5 py-1.5 rounded-lg transition-all ${
                  periodoDetalleCategorias === m.num
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
                }`}
                title={`Ver distribución oficial de ${m.label} 2026`}
              >
                {m.corto}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {Object.entries(DETALLE_SUBCONCEPTOS_CATEGORIAS).map(([catNombre, info]) => {
            const catPPT = TABLA_PPT_DISTRIBUCION_2026.find(t => 
              t.categoria.toLowerCase() === catNombre.toLowerCase() ||
              t.categoria.toLowerCase().includes(catNombre.toLowerCase().split(' ')[0])
            );
            
            const montoAnual = catPPT?.total2026 ?? 0;
            const mesIdx = typeof periodoDetalleCategorias === 'number' 
              ? Math.max(0, Math.min(8, periodoDetalleCategorias - 1)) 
              : 7;
            const montoMes = (catPPT?.meses && catPPT.meses[mesIdx] !== undefined) ? catPPT.meses[mesIdx] : 0;
            const montoActual = periodoDetalleCategorias === 'anual' ? montoAnual : montoMes;
            
            const totalBase = periodoDetalleCategorias === 'anual' 
              ? TOTALES_MESES_PPT.reduce((sum, m) => sum + m.total, 0)
              : (TOTALES_MESES_PPT[mesIdx]?.total || 0);
            const pctActual = totalBase > 0 ? (((montoActual || 0) / totalBase) * 100).toFixed(1) : '0';

            return (
              <div 
                key={catNombre} 
                className="bg-neutral-50/70 p-4 rounded-xl border border-neutral-200/90 flex flex-col justify-between hover:border-neutral-300 hover:shadow-2xs transition-all space-y-3"
              >
                <div>
                  {/* Cabecera con Badge de Porcentaje destacado */}
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs" style={{ backgroundColor: info.color }} />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Categoría</span>
                    </div>
                    {/* Badge suave destacado del color de la categoría */}
                    <span 
                      className="px-2 py-0.5 rounded-full text-xs font-mono font-extrabold border shadow-2xs"
                      style={{ 
                        backgroundColor: `${info.color}15`, 
                        color: info.color, 
                        borderColor: `${info.color}40` 
                      }}
                    >
                      {pctActual}%
                    </span>
                  </div>

                  <h4 className="font-bold text-neutral-900 text-xs sm:text-sm">{catNombre}</h4>
                  <p className="text-[11px] text-neutral-500 line-clamp-2 mt-1 leading-snug">
                    {info.descripcion}
                  </p>
                </div>

                <div className="pt-2 border-t border-neutral-200/70 space-y-2.5">
                  <div>
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">
                      {periodoDetalleCategorias === 'anual' 
                        ? 'Acumulado 2026 (Ene - Sep):' 
                        : `Cierre Oficial ${MESES_CONFIG.find(m => m.num === periodoDetalleCategorias)?.label}:`}
                    </span>
                    <span className="text-sm font-black font-mono text-neutral-900 block tabular-nums mt-0.5">
                      ${(montoActual || 0).toLocaleString('de-DE')} USD
                    </span>
                    <span className="text-[10px] text-neutral-500 block mt-0.5">
                      {periodoDetalleCategorias === 'anual'
                        ? `Cierre Septiembre: $${(catPPT?.meses?.[8] || 0).toLocaleString('de-DE')} USD`
                        : `Acumulado Anual: $${(montoAnual || 0).toLocaleString('de-DE')} USD`}
                    </span>
                  </div>

                  {/* Subpartidas estructuradas en micro-etiquetas limpias */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-wider block">
                      Subpartidas:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {info.subrubros.slice(0, 3).map((sub, i) => (
                        <span 
                          key={i} 
                          className="inline-block text-[10px] font-medium bg-white border border-neutral-200 text-neutral-700 px-1.5 py-0.5 rounded-md shadow-2xs truncate max-w-full"
                          title={sub}
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Botón de auditoría estandarizado sin truncamiento de texto */}
                  {onGoToCategoria && (
                    <button
                      onClick={() => onGoToCategoria(catNombre)}
                      className="w-full text-left text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center justify-between pt-1.5 border-t border-neutral-200/70 group transition-colors cursor-pointer"
                    >
                      <span>Auditar partida</span>
                      <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL DESGLOSE MENSUAL */}
      {selectedMesModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-blue-100 text-blue-900 border border-blue-200">
                  Mes {selectedMesModal.mes} de 2026
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  Desglose Oficial de {selectedMesModal.mesLabel}
                </h3>
              </div>
              <button
                onClick={() => setSelectedMesModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Total Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Desembolsado</span>
                <span className="text-lg font-black font-mono text-slate-900 block mt-0.5">
                  ${selectedMesModal.totalMonto.toLocaleString('de-DE')} <span className="text-xs text-slate-500">USD</span>
                </span>
                <span className="text-[10px] text-slate-500">{selectedMesModal.totalSalidas} salidas registradas</span>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                <span className="text-[10px] uppercase font-bold text-blue-700 block">Promedio Semanal</span>
                <span className="text-lg font-black font-mono text-blue-900 block mt-0.5">
                  ${Math.round(selectedMesModal.promedioSemanal).toLocaleString('de-DE')} <span className="text-xs text-blue-600">/sem</span>
                </span>
                <span className="text-[10px] text-blue-600">Ritmo operativo de obra</span>
              </div>
            </div>

            {/* Distribución por Categoría */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Distribución en las 5 Categorías Oficiales
              </h4>
              {Object.entries(selectedMesModal.porCategoria).map(([cat, val]) => {
                const pct = selectedMesModal.totalMonto > 0
                  ? ((val / selectedMesModal.totalMonto) * 100).toFixed(1)
                  : '0.0';
                return (
                  <div 
                    key={cat}
                    onClick={() => {
                      setSelectedMesModal(null);
                      onGoToCategoria?.(cat);
                    }}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200 cursor-pointer transition-colors space-y-1.5"
                    title={`Ver desglose de ${cat}`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{cat}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-slate-500 text-[11px]">{pct}%</span>
                        <span className="font-mono font-bold text-slate-900 text-xs">
                          ${Math.round(val).toLocaleString('de-DE')} USD
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${Math.min(parseFloat(pct), 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                onClick={() => setSelectedMesModal(null)}
                className="px-4 py-1.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
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
