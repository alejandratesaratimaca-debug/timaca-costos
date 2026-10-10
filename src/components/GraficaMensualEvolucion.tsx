import React, { useState, useMemo } from 'react';
import { TABLA_PPT_DISTRIBUCION_2026 } from '../data/mockCostosTimaca';
import { formatCurrency } from '../utils/dateHelpers';
import { TrendingUp, Layers, Activity, Calendar, ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';

interface GraficaMensualEvolucionProps {
  onSelectMes?: (mesIndex: number, mesNombre: string) => void;
  onSelectCategoria?: (categoria: string) => void;
}

const MESES_NOMBRES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre'];
const MESES_ABR = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep'];

const CATEGORIA_COLORES: Record<string, { stroke: string; fill: string; bg: string; text: string }> = {
  'Materiales Directos': { stroke: '#2563eb', fill: '#3b82f6', bg: 'bg-blue-50', text: 'text-blue-700' },
  'Servicios': { stroke: '#f97316', fill: '#fb923c', bg: 'bg-orange-50', text: 'text-orange-700' },
  'Mano de Obra Directa': { stroke: '#10b981', fill: '#34d399', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  'Horas Maquina': { stroke: '#8b5cf6', fill: '#a78bfa', bg: 'bg-purple-50', text: 'text-purple-700' },
  'Costos Indirectos': { stroke: '#f59e0b', fill: '#fbbf24', bg: 'bg-amber-50', text: 'text-amber-700' }
};

// Generador de curva Spline Monótona (Fritsch-Carlson a Bezier Cúbico)
// Garantiza suavidad matemática C1 sin oscilaciones espurias (overshoot / Runge's phenomenon)
// que antes hundían artificialmente la curva de Servicios entre Abril ($108k) y Mayo ($115k) previo al pico de Junio ($1.64M).
function getSmoothSplinePath(points: { x: number; y: number }[]): string {
  const n = points.length;
  if (n === 0) return '';
  if (n === 1) return `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  if (n === 2) return `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)} L ${points[1].x.toFixed(1)} ${points[1].y.toFixed(1)}`;

  // 1. Calcular pendientes de las secantes consecutivas
  const dxs: number[] = [];
  const dys: number[] = [];
  const slopes: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    const dx = points[i + 1].x - points[i].x;
    const dy = points[i + 1].y - points[i].y;
    dxs.push(dx);
    dys.push(dy);
    slopes.push(dx !== 0 ? dy / dx : 0);
  }

  // 2. Inicializar tangentes en cada nodo
  const m: number[] = new Array(n).fill(0);
  m[0] = slopes[0];
  m[n - 1] = slopes[n - 2];
  for (let i = 1; i < n - 1; i++) {
    if (slopes[i - 1] * slopes[i] <= 0) {
      m[i] = 0; // Extremo local o meseta: tangente horizontal para evitar desbordes
    } else {
      m[i] = (slopes[i - 1] + slopes[i]) / 2;
    }
  }

  // 3. Aplicar límite de monotonía de Fritsch-Carlson
  for (let i = 0; i < n - 1; i++) {
    if (dys[i] === 0) {
      m[i] = 0;
      m[i + 1] = 0;
    } else {
      const alpha = m[i] / slopes[i];
      const beta = m[i + 1] / slopes[i];
      const dist = alpha * alpha + beta * beta;
      if (dist > 9) {
        const tau = 3 / Math.sqrt(dist);
        m[i] = tau * alpha * slopes[i];
        m[i + 1] = tau * beta * slopes[i];
      }
    }
  }

  // 4. Convertir tangentes acotadas a puntos de control Bezier cúbicos (SVG 'C')
  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < n - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    const dx = dxs[i] / 3;
    const cp1x = p1.x + dx;
    const cp1y = p1.y + m[i] * dx;
    const cp2x = p2.x - dx;
    const cp2y = p2.y - m[i + 1] * dx;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

function getStackedAreaPath(topPts: { x: number; y: number }[], bottomPts: { x: number; y: number }[]): string {
  const topPath = getSmoothSplinePath(topPts);
  const revBottom = [...bottomPts].reverse();
  const bottomPath = getSmoothSplinePath(revBottom);
  const bottomSegments = bottomPath.replace(/^M\s*[\d.]+\s*[\d.]+/, '');
  return `${topPath} L ${revBottom[0].x.toFixed(1)} ${revBottom[0].y.toFixed(1)}${bottomSegments} Z`;
}

export const GraficaMensualEvolucion: React.FC<GraficaMensualEvolucionProps> = ({
  onSelectMes,
  onSelectCategoria
}) => {
  const [modo, setModo] = useState<'area' | 'apilada' | 'lineas'>('area');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Cálculos consolidados mensuales
  const { dataMeses, maxTotalMes, maxCatMes, totalConsolidado } = useMemo(() => {
    const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8].map((mIdx) => {
      const nombre = MESES_NOMBRES[mIdx];
      const abr = MESES_ABR[mIdx];
      let total = 0;
      const porCategoria: Record<string, number> = {};

      TABLA_PPT_DISTRIBUCION_2026.forEach((catRow) => {
        const val = catRow.meses[mIdx] || 0;
        porCategoria[catRow.categoria] = val;
        total += val;
      });

      return {
        mesIndex: mIdx,
        mesNum: mIdx + 1,
        nombre,
        abr,
        total,
        porCategoria
      };
    });

    const maxTotal = Math.max(...arr.map(m => m.total));
    const allCatValues = TABLA_PPT_DISTRIBUCION_2026.flatMap(c => c.meses);
    const maxCat = Math.max(...allCatValues);
    const totalGral = arr.reduce((acc, m) => acc + m.total, 0);

    return { dataMeses: arr, maxTotalMes: maxTotal, maxCatMes: maxCat, totalConsolidado: totalGral };
  }, []);

  // Parámetros de lienzo SVG con amplio espacio para el eje vertical
  const svgWidth = 900;
  const svgHeight = 270;
  const padLeft = 85;
  const padRight = 36;
  const padTop = 32;
  const padBottom = 40;
  const plotXStart = padLeft + 35; // Separación generosa para que Ene y sus etiquetas no choquen con el eje Y
  const plotXEnd = svgWidth - padRight - 15;
  const plotWidth = plotXEnd - plotXStart;
  const plotHeight = svgHeight - padTop - padBottom;

  // Escalas
  const ceilingTotal = Math.ceil((maxTotalMes * 1.08) / 500000) * 500000;
  const ceilingCat = Math.ceil((maxCatMes * 1.1) / 300000) * 300000;

  const currentCeiling = modo === 'lineas' ? ceilingCat : ceilingTotal;

  const getX = (idx: number) => plotXStart + (idx / Math.max(1, MESES_NOMBRES.length - 1)) * plotWidth;
  const getY = (val: number) => padTop + (1 - val / currentCeiling) * plotHeight;

  // 1. Puntos para la Curva Total
  const puntosTotal = useMemo(() => {
    return dataMeses.map((m, idx) => ({
      x: getX(idx),
      y: getY(m.total),
      mes: m
    }));
  }, [dataMeses, currentCeiling]);

  const splineTotalPath = useMemo(() => getSmoothSplinePath(puntosTotal), [puntosTotal]);
  const areaTotalPath = useMemo(() => {
    if (puntosTotal.length === 0) return '';
    const bottomY = padTop + plotHeight;
    return `${splineTotalPath} L ${puntosTotal[puntosTotal.length - 1].x.toFixed(1)} ${bottomY.toFixed(1)} L ${puntosTotal[0].x.toFixed(1)} ${bottomY.toFixed(1)} Z`;
  }, [splineTotalPath, puntosTotal, padTop, plotHeight]);

  // 2. Bandas para Área Apilada (5 categorías)
  const stackedBands = useMemo(() => {
    if (modo !== 'apilada') return [];

    let currentBaseline = dataMeses.map((_, i) => ({ x: getX(i), y: padTop + plotHeight }));
    const bands: { categoria: string; path: string; color: string }[] = [];

    TABLA_PPT_DISTRIBUCION_2026.forEach((catRow) => {
      const topPts = dataMeses.map((_, i) => {
        const val = catRow.meses[i] || 0;
        const curY = currentBaseline[i].y;
        const deltaY = (val / currentCeiling) * plotHeight;
        return {
          x: getX(i),
          y: Math.max(padTop, curY - deltaY)
        };
      });

      const bandPath = getStackedAreaPath(topPts, currentBaseline);
      bands.push({
        categoria: catRow.categoria,
        path: bandPath,
        color: CATEGORIA_COLORES[catRow.categoria]?.stroke || '#2563eb'
      });

      currentBaseline = topPts;
    });

    return bands;
  }, [modo, dataMeses, currentCeiling, padTop, plotHeight]);

  // 3. Líneas individuales por Categoría
  const lineasCategorias = useMemo(() => {
    if (modo !== 'lineas') return [];

    return TABLA_PPT_DISTRIBUCION_2026.map((catRow) => {
      const pts = dataMeses.map((_, i) => ({
        x: getX(i),
        y: getY(catRow.meses[i] || 0)
      }));
      return {
        categoria: catRow.categoria,
        path: getSmoothSplinePath(pts),
        color: CATEGORIA_COLORES[catRow.categoria]?.stroke || '#2563eb',
        puntos: pts
      };
    });
  }, [modo, dataMeses, currentCeiling]);

  // Líneas de guía horizontal del eje Y
  const yTicks = useMemo(() => {
    const steps = 4;
    return Array.from({ length: steps + 1 }, (_, i) => {
      const val = (currentCeiling / steps) * i;
      return {
        val,
        y: getY(val),
        label: val === 0 ? '$0' : val >= 1000000 ? `$${(val / 1000000).toFixed(1)}M` : `$${Math.round(val / 1000)}k`
      };
    });
  }, [currentCeiling]);

  const ultimoMes = dataMeses[dataMeses.length - 1];
  const primerMes = dataMeses[0];
  const numMeses = dataMeses.length;
  const mesActivoData = hoverIndex !== null ? dataMeses[hoverIndex] : null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-4">
      {/* Header con Controles y Badges de Resumen */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#0b2545] text-white shadow-2xs">
              <Activity className="w-4 h-4" />
            </span>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Evolución y Curva de Tendencia Mensual ({primerMes?.abr} – {ultimoMes?.abr} 2026)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Visualización continua y proporcional sin barras. Haz clic en cualquier nodo para auditar el mes.
          </p>
        </div>

        {/* Selector de Modo de Gráfica (Sin Barras) */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start lg:self-auto border border-slate-200/80">
          <button
            type="button"
            onClick={() => setModo('area')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              modo === 'area'
                ? 'bg-white text-[#0b2545] shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
            Curva Total
          </button>
          <button
            type="button"
            onClick={() => setModo('apilada')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              modo === 'apilada'
                ? 'bg-white text-[#0b2545] shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-orange-600" />
            Área Apilada (5 Cat.)
          </button>
          <button
            type="button"
            onClick={() => setModo('lineas')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              modo === 'lineas'
                ? 'bg-white text-[#0b2545] shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-purple-600" />
            Líneas por Categoría
          </button>
        </div>
      </div>

      {/* Mini KPIs Informativos Dinámicos */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
          <span className="text-[10px] text-slate-500 uppercase font-bold block">Pico de la Obra</span>
          <span className="text-sm font-bold font-mono text-slate-900 block mt-0.5">
            $2.663.899 <span className="text-[10px] text-orange-600 font-sans font-bold">(Junio)</span>
          </span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
          <span className="text-[10px] text-slate-500 uppercase font-bold block">Mes Actual Auditado</span>
          <span className="text-sm font-bold font-mono text-slate-900 block mt-0.5">
            ${(ultimoMes?.total || 0).toLocaleString('de-DE')} <span className="text-[10px] text-blue-600 font-sans font-bold">({ultimoMes?.nombre})</span>
          </span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
          <span className="text-[10px] text-slate-500 uppercase font-bold block">Promedio Mensual</span>
          <span className="text-sm font-bold font-mono text-slate-900 block mt-0.5">
            ${Math.round(totalConsolidado / (numMeses || 1)).toLocaleString('de-DE')} <span className="text-[10px] text-slate-500 font-sans">USD/mes</span>
          </span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
          <span className="text-[10px] text-slate-500 uppercase font-bold block">Total {numMeses} Meses</span>
          <span className="text-sm font-bold font-mono text-[#0b2545] block mt-0.5">
            ${totalConsolidado.toLocaleString('de-DE')} <span className="text-[10px] text-emerald-600 font-sans font-bold">100%</span>
          </span>
        </div>
      </div>

      {/* LIENZO SVG INTERACTIVO */}
      <div className="relative overflow-x-auto select-none pt-2">
        <svg 
          viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
          className="w-full h-auto min-w-[620px] overflow-visible"
        >
          <defs>
            {/* Gradiente para el Área Total */}
            <linearGradient id="areaGradientTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.38" />
              <stop offset="60%" stopColor="#3b82f6" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.01" />
            </linearGradient>

            {/* Gradiente suave de Junio (Pico) */}
            <linearGradient id="peakHighlight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Líneas horizontales de referencia del eje Y */}
          {yTicks.map(t => (
            <g key={t.val}>
              <line
                x1={padLeft}
                y1={t.y}
                x2={svgWidth - padRight}
                y2={t.y}
                stroke="#e2e8f0"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <text
                x={padLeft - 10}
                y={t.y + 4}
                textAnchor="end"
                className="text-[10px] font-mono fill-slate-400 font-semibold"
              >
                {t.label}
              </text>
            </g>
          ))}

          {/* VISTA 1: CURVA DE ÁREA TOTAL */}
          {modo === 'area' && (
            <>
              {/* Relleno degradado */}
              <path d={areaTotalPath} fill="url(#areaGradientTotal)" />

              {/* Trazo principal de la curva */}
              <path
                d={splineTotalPath}
                fill="none"
                stroke="#0b2545"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Indicador de Pico Máximo en Junio */}
              <circle
                cx={puntosTotal[5]?.x}
                cy={puntosTotal[5]?.y}
                r="11"
                fill="#f97316"
                fillOpacity="0.2"
                className="animate-pulse"
              />
            </>
          )}

          {/* VISTA 2: ÁREA APILADA (5 CATEGORÍAS) */}
          {modo === 'apilada' && (
            <g>
              {stackedBands.map((band) => (
                <path
                  key={band.categoria}
                  d={band.path}
                  fill={band.color}
                  fillOpacity="0.78"
                  stroke="#ffffff"
                  strokeWidth="1"
                  className="transition-opacity hover:opacity-95"
                />
              ))}
            </g>
          )}

          {/* VISTA 3: LÍNEAS COMPARATIVAS */}
          {modo === 'lineas' && (
            <g>
              {lineasCategorias.map((linea) => (
                <g key={linea.categoria}>
                  <path
                    d={linea.path}
                    fill="none"
                    stroke={linea.color}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="hover:stroke-[3.5] transition-all"
                  />
                  {linea.puntos.map((p, pIdx) => (
                    <circle
                      key={pIdx}
                      cx={p.x}
                      cy={p.y}
                      r={hoverIndex === pIdx ? 5 : 3}
                      fill={linea.color}
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                  ))}
                </g>
              ))}
            </g>
          )}

          {/* Columnas y Nodos Interactivos para cada uno de los 8 Meses */}
          {dataMeses.map((m, idx) => {
            const x = getX(idx);
            const y = getY(m.total);
            const isHover = hoverIndex === idx;
            const isJune = idx === 5;
            const isAugust = idx === 7;

            return (
              <g 
                key={m.mesIndex} 
                className="cursor-pointer group"
                onMouseEnter={() => setHoverIndex(idx)}
                onMouseLeave={() => setHoverIndex(null)}
                onClick={() => onSelectMes?.(m.mesIndex, m.nombre)}
              >
                {/* Zona de hover vertical transparente */}
                <rect
                  x={x - (plotWidth / 14)}
                  y={padTop}
                  width={plotWidth / 7}
                  height={plotHeight}
                  fill={isHover ? '#3b82f6' : 'transparent'}
                  fillOpacity={isHover ? 0.06 : 0}
                  className="transition-colors"
                />

                {/* Línea vertical de aguja al hacer hover */}
                {isHover && (
                  <line
                    x1={x}
                    y1={padTop}
                    x2={x}
                    y2={padTop + plotHeight}
                    stroke="#2563eb"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                )}

                {/* Nodo en la curva */}
                {modo === 'area' && (
                  <>
                    <circle
                      cx={x}
                      cy={y}
                      r={isHover ? 7 : isJune || isAugust ? 5.5 : 4}
                      fill={isJune ? '#ea580c' : isAugust ? '#2563eb' : '#0b2545'}
                      stroke="#ffffff"
                      strokeWidth={isHover ? 2.5 : 2}
                      className="transition-all"
                    />
                    {/* Monto flotante encima del nodo con elevación vertical, ligero desvío en laderas y halo blanco anticolisión */}
                    <text
                      x={x + (idx === 4 ? -8 : idx === 6 ? 8 : 0)}
                      y={y - 15}
                      textAnchor="middle"
                      stroke="#ffffff"
                      strokeWidth={4.5}
                      strokeLinejoin="round"
                      paintOrder="stroke fill"
                      className={`text-[10px] font-mono font-bold select-none ${
                        isJune ? 'fill-orange-600' : isAugust ? 'fill-blue-700' : 'fill-slate-800'
                      }`}
                    >
                      ${m.total >= 1000000 ? `${(m.total / 1000000).toFixed(2)}M` : `${Math.round(m.total / 1000)}k`}
                    </text>
                  </>
                )}

                {/* Etiqueta del Mes en el eje X */}
                <text
                  x={x}
                  y={padTop + plotHeight + 18}
                  textAnchor="middle"
                  className={`text-xs font-semibold tracking-tight transition-colors ${
                    isHover 
                      ? 'fill-blue-700 font-bold' 
                      : isAugust 
                        ? 'fill-blue-800 font-black' 
                        : isJune 
                          ? 'fill-orange-700 font-bold' 
                          : 'fill-slate-600'
                  }`}
                >
                  {m.abr}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Tooltip Emergente en Tiempo Real al Pasar el Cursor */}
        {mesActivoData && (
          <div 
            className="absolute z-20 pointer-events-none bg-slate-900 text-white rounded-xl p-3 shadow-xl border border-slate-700 text-xs w-64 -translate-x-1/2 transition-all duration-75"
            style={{
              left: `${(getX(mesActivoData.mesIndex) / svgWidth) * 100}%`,
              top: '8px'
            }}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
              <span className="font-bold text-sm text-amber-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {mesActivoData.nombre} 2026
              </span>
              <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                Mes {mesActivoData.mesNum}/{MESES_NOMBRES.length}
              </span>
            </div>

            <div className="flex items-baseline justify-between mb-2">
              <span className="text-slate-400 text-[11px]">Total Desembolsado:</span>
              <span className="font-mono font-black text-sm text-white">
                ${mesActivoData.total.toLocaleString('de-DE')} USD
              </span>
            </div>

            {/* Desglose por las 5 Categorías Oficiales */}
            <div className="space-y-1 pt-1 border-t border-slate-800/80">
              {TABLA_PPT_DISTRIBUCION_2026.map(cat => {
                const montoCat = mesActivoData.porCategoria[cat.categoria] || 0;
                const pct = mesActivoData.total > 0 ? ((montoCat / mesActivoData.total) * 100).toFixed(1) : '0';
                const col = CATEGORIA_COLORES[cat.categoria]?.stroke || '#3b82f6';
                return (
                  <div key={cat.categoria} className="flex items-center justify-between text-[10px]">
                    <span className="flex items-center gap-1.5 text-slate-300 truncate max-w-[130px]">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: col }} />
                      <span className="truncate">{cat.categoria}</span>
                    </span>
                    <span className="font-mono text-slate-200">
                      ${montoCat.toLocaleString('de-DE')} <span className="text-slate-500">({pct}%)</span>
                    </span>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-2 pt-1 border-t border-slate-800 text-[10px] text-blue-400 text-center font-medium">
              Haz clic para abrir auditoría de {mesActivoData.nombre} →
            </div>
          </div>
        )}
      </div>

      {/* Leyenda de Categorías */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 pt-1 text-xs border-t border-slate-100">
        {TABLA_PPT_DISTRIBUCION_2026.map((cat) => {
          const cfg = CATEGORIA_COLORES[cat.categoria];
          return (
            <button
              key={cat.categoria}
              type="button"
              onClick={() => onSelectCategoria?.(cat.categoria)}
              className="flex items-center gap-1.5 text-slate-700 hover:text-blue-700 transition-colors cursor-pointer group"
              title={`Clic para ver desglose de ${cat.categoria}`}
            >
              <span className="w-2.5 h-2.5 rounded-full shrink-0 group-hover:scale-125 transition-transform" style={{ backgroundColor: cfg.stroke }} />
              <span className="font-medium">{cat.categoria}</span>
              <span className="font-mono text-slate-400 text-[10px]">({formatCurrency(cat.total2026)})</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
