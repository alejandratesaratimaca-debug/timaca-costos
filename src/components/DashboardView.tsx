import React, { useState } from 'react';
import { useCostos } from '../context/CostosContext';
import { formatCurrency } from '../utils/dateHelpers';
import { safeFormatUSD } from '../utils/numericHelpers';
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
  X,
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { UsuarioSistema } from '../types/usuarios';
import { ResumenMensual } from '../types/costos';

interface DashboardViewProps {
  onGoToProyectos: () => void;
  onGoToSemanas: () => void;
  onGoToMeses: () => void;
  onGoToInforme: () => void;
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
  const [periodoDetalleCategorias, setPeriodoDetalleCategorias] = useState<'anual' | number>(10);

  const MESES_CONFIG = [
    { num: 1, label: 'Enero', corto: 'Ene' },
    { num: 2, label: 'Febrero', corto: 'Feb' },
    { num: 3, label: 'Marzo', corto: 'Mar' },
    { num: 4, label: 'Abril', corto: 'Abr' },
    { num: 5, label: 'Mayo', corto: 'May' },
    { num: 6, label: 'Junio', corto: 'Jun' },
    { num: 7, label: 'Julio', corto: 'Jul' },
    { num: 8, label: 'Agosto', corto: 'Ago' },
    { num: 9, label: 'Septiembre', corto: 'Sep' },
    { num: 10, label: 'Octubre', corto: 'Oct' }
  ];

  const maxWeeklyMonto = Math.max(...resumenSemanas.map((s) => s.totalMonto), 1);
  const maxMonthlyMonto = Math.max(...resumenMeses.map((m) => m.totalMonto), 1);

  // Modern category styling tokens (High-contrast semantic badges)
  const categoryConfig: Record<string, { color: string; bg: string; text: string; border: string }> = {
    'Materiales Directos': { color: '#2563eb', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    'Servicios': { color: '#f97316', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
    'Mano de Obra Directa': { color: '#10b981', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    'Horas Maquina': { color: '#8b5cf6', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    'Costos Indirectos': { color: '#eab308', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' }
  };

  return (
    <div className="space-y-5 animate-fade-in font-sans">
      {/* Gerente de Proyecto Restricted Notice */}
      {isGerente && (
        <div className="bg-amber-50/80 border border-amber-300/80 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-amber-600 text-white rounded-xl font-bold shadow-2xs shrink-0">
              <Briefcase className="w-4 h-4" />
            </span>
            <div className="space-y-0.5">
              <span className="font-bold text-amber-950 text-xs sm:text-sm block">
                Sesión de Gerente de Proyecto · Vista Restringida a Cuentas Asignadas
              </span>
              <p className="text-amber-900/90 text-xs">
                Visualizando costos de tu frente de obra: <strong className="font-mono text-blue-900">{cuentasAsignadas.join(', ')}</strong> ({currentUser?.proyectosNombres?.join(', ') || 'Mis Proyectos'}).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 1. Header con 4 KPI Cards Ejecutivas & Spotlight Banner */}
      <KPIHeader onOpenProyectosMatriz={onOpenProyectosMatriz} />

      {/* 2. Sección Principal: Evolución de Costos por Categoría */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        
        {/* Header of Section with Segmented Capsule Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold shrink-0">
                <BarChart2 className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Evolución de Costos por Categoría (Cifras en USD)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                Consolidado 2026
              </span>
              <span>Distribución oficial de los 5 rubros a lo largo de los meses y semanas operativas</span>
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Capsule Switcher */}
            <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                onClick={() => setChartMode('mensual')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  chartMode === 'mensual'
                    ? 'bg-white text-slate-900 shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Mes a Mes
              </button>
              <button
                onClick={() => setChartMode('por-categoria')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  chartMode === 'por-categoria'
                    ? 'bg-white text-slate-900 shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Por Categoría
              </button>
              <button
                onClick={() => setChartMode('semanal')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  chartMode === 'semanal'
                    ? 'bg-white text-slate-900 shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semanal
              </button>
            </div>

            <button
              onClick={chartMode === 'semanal' ? onGoToSemanas : onGoToMeses}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors px-2 py-1.5 cursor-pointer"
            >
              <span>Ver Matriz</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Legend of the 5 Semantic Category Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            Rubros (Clic para auditar):
          </span>
          {Object.entries(categoryConfig).map(([cat, cfg]) => {
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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-2xs group ${
                  isFocused
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs ring-2 ring-blue-300'
                    : `${cfg.bg} ${cfg.text} ${cfg.border} hover:shadow-xs hover:scale-[1.02]`
                }`}
                title={`Ir al desglose detallado de ${cat}`}
              >
                <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs" style={{ backgroundColor: cfg.color }} />
                <span>{cat}</span>
                <ChevronRight className="w-3 h-3 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        {chartMode === 'por-categoria' ? (
          /* View 1: Por Categoría Individual */
          <div className="space-y-4 pt-2">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">Examinando categoría:</span>
                <select
                  value={selectedCatFocus}
                  onChange={(e) => setSelectedCatFocus(e.target.value)}
                  className="text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500"
                >
                  {Object.keys(categoryConfig).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              {onGoToCategoria && (
                <button
                  onClick={() => onGoToCategoria(selectedCatFocus)}
                  className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 bg-white border border-blue-200 px-3 py-1.5 rounded-lg shadow-2xs transition-colors cursor-pointer"
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
                  <div key={m.mes} className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center flex flex-col justify-between h-48">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block whitespace-nowrap">
                        {m.mesLabel}
                      </span>
                    </div>

                    <div className="flex-1 flex items-end justify-center py-2">
                      <div
                        style={{ height: `${heightPct}%`, backgroundColor: categoryConfig[selectedCatFocus]?.color || '#2563eb' }}
                        className="w-10 rounded-t-lg shadow-xs transition-all hover:opacity-90 cursor-pointer"
                        onClick={() => setSelectedMesModal(m)}
                        title={`${selectedCatFocus} en ${m.mesLabel}: ${safeFormatUSD(montoCat, false)} · Clic para ver mes`}
                      />
                    </div>

                    <div>
                      <span className="text-xs font-black font-mono text-slate-900 block truncate tabular-nums">
                        {safeFormatUSD(montoCat, false)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : chartMode === 'semanal' ? (
          /* View 2: Semana a Semana */
          <div className="pt-2">
            <div className="overflow-x-auto pb-2 border-b border-slate-100">
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
                        <div className="absolute -top-32 z-30 bg-slate-900 text-white text-xs rounded-xl py-2 px-3 shadow-xl whitespace-nowrap pointer-events-none space-y-1">
                          <p className="font-bold text-amber-300">{s.semanaLabel} ({s.mesLabel})</p>
                          <p className="font-mono font-bold text-white text-sm">{safeFormatUSD(s.totalMonto, false)}</p>
                          <div className="text-[10px] space-y-0.5 pt-1 border-t border-slate-700 text-slate-300">
                            <div className="flex justify-between gap-3">
                              <span className="text-blue-400">Materiales:</span>
                              <span className="font-mono">{safeFormatUSD(Math.round(s.totalMonto * matPct), false)}</span>
                            </div>
                            <div className="flex justify-between gap-3">
                              <span className="text-emerald-400">Mano de Obra:</span>
                              <span className="font-mono">{safeFormatUSD(Math.round(s.totalMonto * modPct), false)}</span>
                            </div>
                            <div className="flex justify-between gap-3">
                              <span className="text-orange-400">Servicios:</span>
                              <span className="font-mono">{safeFormatUSD(Math.round(s.totalMonto * srvPct), false)}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Stacked Colored Bar */}
                      <div className="w-full flex flex-col justify-end h-44 rounded-t-lg overflow-hidden shadow-xs transition-transform group-hover:scale-105">
                        <div style={{ height: `${heightPercent}%` }} className="w-full flex flex-col">
                          <div style={{ height: `${indPct * 100}%`, backgroundColor: categoryConfig['Costos Indirectos']?.color }} />
                          <div style={{ height: `${hmPct * 100}%`, backgroundColor: categoryConfig['Horas Maquina']?.color }} />
                          <div style={{ height: `${srvPct * 100}%`, backgroundColor: categoryConfig['Servicios']?.color }} />
                          <div style={{ height: `${modPct * 100}%`, backgroundColor: categoryConfig['Mano de Obra Directa']?.color }} />
                          <div style={{ height: `${matPct * 100}%`, backgroundColor: categoryConfig['Materiales Directos']?.color }} />
                        </div>
                      </div>

                      <span className="text-[9px] font-mono tabular-nums text-slate-500 mt-2 truncate w-full text-center">
                        S{s.semana.toString().padStart(2, '0')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
              <span>← Desplaza horizontalmente para examinar las {resumenSemanas.length} semanas operativas de 2026 →</span>
              <span className="font-mono font-bold text-slate-900">Total Acumulado: {safeFormatUSD(totalMontoGlobal, false)}</span>
            </div>
          </div>
        ) : (
          /* View 3: Mes a Mes (FinTech Table) */
          <div className="space-y-3 pt-2">
            <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3 text-xs text-slate-700 flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                <strong>Consolidación mensual oficial:</strong> Despachos SIP de almacén, compras directas y nómina devengada de frentes de obra. Haz clic en cualquier fila para inspeccionar el desglose del mes.
              </span>
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-2xl border border-slate-200/90 divide-y divide-slate-100 overflow-hidden shadow-xs">
              <div className="hidden md:flex items-center px-4 py-2.5 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <span className="w-56 lg:w-60 shrink-0">Mes / Período</span>
                <span className="flex-1 px-2">Distribución de las 5 Categorías</span>
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
                    className="p-3.5 sm:px-4 sm:py-3 hover:bg-blue-50/60 transition-colors flex flex-col md:flex-row md:items-center gap-2 md:gap-4 cursor-pointer group"
                    title={`Haz clic para ver el desglose oficial de ${m.mesLabel}`}
                  >
                    {/* Col 1: Mes y salidas */}
                    <div className="w-full md:w-56 lg:w-60 shrink-0 flex items-center justify-between md:justify-start gap-2.5">
                      <span className="font-bold text-slate-900 text-xs sm:text-sm whitespace-nowrap group-hover:text-blue-700 transition-colors">
                        {m.mesLabel}
                      </span>
                      <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full border border-slate-200 shrink-0 whitespace-nowrap">
                        {m.totalSalidas} salidas
                      </span>
                    </div>

                    {/* Col 2: Progress bar multi-segmento */}
                    <div className="flex-1 min-w-[140px] py-1">
                      <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-2xs">
                        <div 
                          style={{ width: `${widthPct * matPct}%`, backgroundColor: categoryConfig['Materiales Directos']?.color }} 
                          title={`Materiales Directos: ${safeFormatUSD(matVal, false)} (${Math.round(matPct * 100)}%)`} 
                          className="hover:opacity-80 transition-opacity"
                        />
                        <div 
                          style={{ width: `${widthPct * modPct}%`, backgroundColor: categoryConfig['Mano de Obra Directa']?.color }} 
                          title={`Mano de Obra Directa: ${safeFormatUSD(modVal, false)} (${Math.round(modPct * 100)}%)`} 
                          className="hover:opacity-80 transition-opacity"
                        />
                        <div 
                          style={{ width: `${widthPct * srvPct}%`, backgroundColor: categoryConfig['Servicios']?.color }} 
                          title={`Servicios: ${safeFormatUSD(srvVal, false)} (${Math.round(srvPct * 100)}%)`} 
                          className="hover:opacity-80 transition-opacity"
                        />
                        <div 
                          style={{ width: `${widthPct * hmPct}%`, backgroundColor: categoryConfig['Horas Maquina']?.color }} 
                          title={`Horas Máquina: ${safeFormatUSD(hmVal, false)} (${Math.round(hmPct * 100)}%)`} 
                          className="hover:opacity-80 transition-opacity"
                        />
                        <div 
                          style={{ width: `${widthPct * indPct}%`, backgroundColor: categoryConfig['Costos Indirectos']?.color }} 
                          title={`Costos Indirectos: ${safeFormatUSD(indVal, false)} (${Math.round(indPct * 100)}%)`} 
                          className="hover:opacity-80 transition-opacity"
                        />
                      </div>
                    </div>

                    {/* Col 3: Promedio semanal */}
                    <div className="w-full md:w-36 shrink-0 text-left md:text-right">
                      <span className="text-[10px] text-slate-400 block md:hidden">Promedio semanal:</span>
                      <span className="font-mono tabular-nums text-slate-600 text-xs">
                        {safeFormatUSD(m.promedioSemanal, false)} <span className="text-[10px] text-slate-400 font-sans">/sem</span>
                      </span>
                    </div>

                    {/* Col 4: Total Mes */}
                    <div className="w-full md:w-36 shrink-0 text-left md:text-right">
                      <span className="text-[10px] text-slate-400 block md:hidden">Total mes:</span>
                      <span className="font-mono tabular-nums font-bold text-slate-900 text-sm block">
                        {safeFormatUSD(m.totalMonto, false)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 3. Detalle Técnico de las 5 Categorías Oficiales */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Detalle Técnico de las 5 Categorías Oficiales
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {periodoDetalleCategorias === 'anual'
                ? 'Distribución anual acumulada oficial 2026 (Enero a Octubre: $19.124.069 USD)'
                : `Distribución oficial de ${MESES_CONFIG.find(m => m.num === periodoDetalleCategorias)?.label || ''} 2026`}
            </p>
          </div>

          {/* Period selector */}
          <div className="flex flex-wrap items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold shrink-0 gap-1">
            <button
              type="button"
              onClick={() => setPeriodoDetalleCategorias('anual')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                periodoDetalleCategorias === 'anual'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ⭐ Acumulado Anual
            </button>
            {MESES_CONFIG.map((m) => (
              <button
                key={m.num}
                type="button"
                onClick={() => setPeriodoDetalleCategorias(m.num)}
                className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  periodoDetalleCategorias === m.num
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {m.corto}
              </button>
            ))}
          </div>
        </div>

        {/* 5 Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {Object.entries(DETALLE_SUBCONCEPTOS_CATEGORIAS).map(([catNombre, info]) => {
            const catPPT = TABLA_PPT_DISTRIBUCION_2026.find(t => 
              t.categoria.toLowerCase() === catNombre.toLowerCase() ||
              t.categoria.toLowerCase().includes(catNombre.toLowerCase().split(' ')[0])
            );
            
            const montoAnual = catPPT?.total2026 ?? 0;
            const mesIdx = typeof periodoDetalleCategorias === 'number' 
              ? Math.max(0, Math.min(9, periodoDetalleCategorias - 1)) 
              : 9;
            const montoMes = (catPPT?.meses && catPPT.meses[mesIdx] !== undefined) ? catPPT.meses[mesIdx] : 0;
            const montoActual = periodoDetalleCategorias === 'anual' ? montoAnual : montoMes;
            
            const totalBase = periodoDetalleCategorias === 'anual' 
              ? TOTALES_MESES_PPT.reduce((sum, m) => sum + m.total, 0)
              : (TOTALES_MESES_PPT[mesIdx]?.total || 0);
            const pctActual = totalBase > 0 ? (((montoActual || 0) / totalBase) * 100).toFixed(1) : '0';

            const cfg = categoryConfig[catNombre] || { color: info.color, bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' };

            return (
              <div 
                key={catNombre} 
                className="bg-white p-4 rounded-2xl border border-slate-200/90 flex flex-col justify-between hover:border-blue-400 hover:shadow-xs transition-all space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs" style={{ backgroundColor: info.color }} />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Rubro</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                      {pctActual}%
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{catNombre}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-snug">
                    {info.descripcion}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-2.5">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {periodoDetalleCategorias === 'anual' ? 'Acumulado 2026:' : `Cierre ${MESES_CONFIG.find(m => m.num === periodoDetalleCategorias)?.label}:`}
                    </span>
                    <span className="text-base font-black font-mono text-slate-900 block tabular-nums mt-0.5">
                      {safeFormatUSD(montoActual || 0, false)}
                    </span>
                  </div>

                  {/* Subpartidas */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Subpartidas:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {info.subrubros.slice(0, 3).map((sub, i) => (
                        <span 
                          key={i} 
                          className="inline-block text-[10px] font-medium bg-slate-50 border border-slate-200 text-slate-700 px-1.5 py-0.5 rounded-md truncate max-w-full"
                          title={sub}
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>

                  {onGoToCategoria && (
                    <button
                      onClick={() => onGoToCategoria(catNombre)}
                      className="w-full text-left text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center justify-between pt-1.5 border-t border-slate-100 group transition-colors cursor-pointer"
                    >
                      <span>Auditar partida</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Desglose Mensual */}
      {selectedMesModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-blue-100 text-blue-900 border border-blue-200">
                  Desglose Operativo Mensual
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">
                  {selectedMesModal.mesLabel}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedMesModal.totalSalidas} movimientos contabilizados en este período
                </p>
              </div>
              <button
                onClick={() => setSelectedMesModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Gasto Total del Mes</span>
                <span className="font-mono text-2xl font-black text-slate-900 tabular-nums">{safeFormatUSD(selectedMesModal.totalMonto, false)}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Promedio Semanal</span>
                <span className="font-mono text-lg font-bold text-slate-700 tabular-nums">{safeFormatUSD(selectedMesModal.promedioSemanal, false)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 block">Distribución en las 5 Categorías:</span>
              {Object.entries(categoryConfig).map(([cat, cfg]) => {
                const monto = selectedMesModal.porCategoria?.[cat] || 0;
                const pct = selectedMesModal.totalMonto > 0 ? Math.round((monto / selectedMesModal.totalMonto) * 100) : 0;
                return (
                  <div key={cat} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cfg.color }} />
                      <span className="font-bold text-slate-800">{cat}</span>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 tabular-nums">{safeFormatUSD(monto, false)}</span>
                      <span className="text-[10px] font-bold text-slate-400 w-10 text-right">{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedMesModal(null)}
                className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cerrar Desglose
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

