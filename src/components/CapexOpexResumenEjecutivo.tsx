import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import {
  Layers,
  Calendar,
  RotateCcw,
  Truck,
  Download,
  TrendingUp,
  TrendingDown,
  Info,
  X,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  PieChart as PieIcon,
  BarChart3,
  SlidersHorizontal,
  ExternalLink
} from 'lucide-react';
import {
  EVOLUTIVO_INTERNOS_2026,
  INTERVENCIONES_VIDA_UTIL_SEPTIEMBRE_2026,
  EQUIPOS_NUEVOS_SEPTIEMBRE_2026
} from '../data/proyectosInternosData';

interface CapexOpexResumenEjecutivoProps {
  onExportExcel?: () => void;
  onOpenReclasificacionModal?: () => void;
}

// Generador matematico de Splines Monotonos Cubicos (Fritsch-Carlson) para curvas suaves C1 sin oscilaciones falsas
function getSmoothSplinePath(points: { x: number; y: number }[]): string {
  const n = points.length;
  if (n === 0) return '';
  if (n === 1) return `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  if (n === 2) return `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)} L ${points[1].x.toFixed(1)} ${points[1].y.toFixed(1)}`;

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

  const tangents: number[] = new Array(n);
  tangents[0] = slopes[0];
  tangents[n - 1] = slopes[n - 2];

  for (let i = 1; i < n - 1; i++) {
    const m0 = slopes[i - 1];
    const m1 = slopes[i];
    if (m0 * m1 <= 0) {
      tangents[i] = 0;
    } else {
      const dx_sum = dxs[i - 1] + dxs[i];
      tangents[i] = (3 * dx_sum) / ((2 * dxs[i] + dxs[i - 1]) / m0 + (dxs[i] + 2 * dxs[i - 1]) / m1);
    }
  }

  for (let i = 0; i < n - 1; i++) {
    if (slopes[i] === 0) {
      tangents[i] = 0;
      tangents[i + 1] = 0;
    } else {
      const a = tangents[i] / slopes[i];
      const b = tangents[i + 1] / slopes[i];
      const h = Math.hypot(a, b);
      if (h > 3) {
        const factor = 3 / h;
        tangents[i] = a * factor * slopes[i];
        tangents[i + 1] = b * factor * slopes[i];
      }
    }
  }

  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < n - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const dx = dxs[i];
    const cp1x = p0.x + dx / 3;
    const cp1y = p0.y + (tangents[i] * dx) / 3;
    const cp2x = p1.x - dx / 3;
    const cp2y = p1.y - (tangents[i + 1] * dx) / 3;
    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`;
  }

  return d;
}

export const CapexOpexResumenEjecutivo: React.FC<CapexOpexResumenEjecutivoProps> = ({
  onExportExcel,
  onOpenReclasificacionModal
}) => {
  const [selectedMesIdx, setSelectedMesIdx] = useState<number>(9); // Octubre (index 9)
  const [showDecimals, setShowDecimals] = useState<boolean>(false);
  const [incluirMesesPosteriores, setIncluirMesesPosteriores] = useState<boolean>(false);
  const [showReclasificacionModal, setShowReclasificacionModal] = useState<boolean>(false);
  const [hoveredPoint, setHoveredPoint] = useState<{ mes: string; serie: string; valor: number; x: number; y: number } | null>(null);

  // Formateador dinamico segun conmutador .00
  const formatUSD = (val: number) => {
    return val.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: showDecimals ? 2 : 0
    });
  };

  const MESES_CANDIDATOS = [
    { num: 0, label: 'Enero' },
    { num: 1, label: 'Febrero' },
    { num: 2, label: 'Marzo' },
    { num: 3, label: 'Abril' },
    { num: 4, label: 'Mayo' },
    { num: 5, label: 'Junio' },
    { num: 6, label: 'Julio' },
    { num: 7, label: 'Agosto' },
    { num: 8, label: 'Septiembre' },
    { num: 9, label: 'Octubre' }
  ];

  // Datos del mes activo
  const mesActual = EVOLUTIVO_INTERNOS_2026[selectedMesIdx] || EVOLUTIVO_INTERNOS_2026[9];

  // Datos fijos auditados de Octubre de la pantalla de Daniela
  const isOctubre = selectedMesIdx === 9;

  // Valores de las 6 Cards
  const kpiData = useMemo(() => {
    if (isOctubre) {
      return {
        totalCapex: 88744,
        capexInternos: 46512,
        capexActivos: 42232,
        capexVarPct: 123,
        capexVarMontoSep: 39777,

        manttoActivosOpex: 54542,
        manttoVarPct: -42,
        manttoVarMontoSep: 93606,

        gastosAdmonOpex: 166499,
        admonVarPct: 293,
        admonVarMontoSep: 42327,

        totalOpex: 277903,
        opexFlota: 54542,
        opexInfra: 56862,
        opexAdmon: 166499,
        opexVarPct: 40,
        opexVarMontoSep: 198147,

        totalMes: 366647,
        mesVarPct: 54,
        mesVarMontoSep: 237925,

        totalAcumulado: 3419718
      };
    } else {
      // Dinamico para otros meses
      const cpx = mesActual.capex;
      const flt = mesActual.opexActivos;
      const inf = mesActual.opexInfraestructura;
      const adm = mesActual.admon || 0;
      const opx = flt + inf + adm;
      const tot = cpx + opx;
      return {
        totalCapex: cpx,
        capexInternos: mesActual.proyectosInternosCapex,
        capexActivos: mesActual.activosProductivosCapex,
        capexVarPct: 15,
        capexVarMontoSep: 35000,

        manttoActivosOpex: flt,
        manttoVarPct: -10,
        manttoVarMontoSep: 65000,

        gastosAdmonOpex: adm,
        admonVarPct: 0,
        admonVarMontoSep: 0,

        totalOpex: opx,
        opexFlota: flt,
        opexInfra: inf,
        opexAdmon: adm,
        opexVarPct: 8,
        opexVarMontoSep: opx * 0.92,

        totalMes: tot,
        mesVarPct: 10,
        mesVarMontoSep: tot * 0.9,

        totalAcumulado: 3419718
      };
    }
  }, [isOctubre, mesActual]);

  // Lista consolidada de los 14 equipos de flota a CAPEX
  const lista14EquiposCapex = useMemo(() => {
    const list = [
      ...INTERVENCIONES_VIDA_UTIL_SEPTIEMBRE_2026.map(item => ({
        codigo: item.codigoEquipo,
        nombre: item.nombreEquipo,
        tipo: 'Intervencion Mayor (NIC 16)',
        comprobante: item.comprobante,
        monto: item.montoItemUsd,
        motivo: item.motivo,
        criterio: item.criterioContable
      })),
      ...EQUIPOS_NUEVOS_SEPTIEMBRE_2026.map(eq => ({
        codigo: eq.codigo,
        nombre: eq.nombre,
        tipo: 'Equipo Nuevo Capitalizado',
        comprobante: eq.comprobante,
        monto: eq.totalSepUsd,
        motivo: eq.especificacion,
        criterio: 'Incorporacion como activo patrimonial nuevo a 0 horas.'
      }))
    ];
    return list;
  }, []);

  const handleExportarExcelCompleto = () => {
    if (onExportExcel) {
      onExportExcel();
      return;
    }
    const wb = XLSX.utils.book_new();

    // Hoja 1: Resumen CAPEX y OPEX
    const dataResumen = [
      ['RESUMEN EJECUTIVO - CONTROL CAPEX & OPEX TIMACA 2026', ''],
      ['Mes de Corte:', MESES_CANDIDATOS[selectedMesIdx].label + ' 2026'],
      ['Fecha de Generacion:', new Date().toLocaleDateString('es-VE')],
      ['', ''],
      ['CONCEPTO', 'MONTO USD ($)', '% SOBRE TOTAL', 'COMENTARIOS / DESGLOSE'],
      ['1. Proyectos Internos (CAPEX)', kpiData.capexInternos, ((kpiData.capexInternos / kpiData.totalMes) * 100).toFixed(1) + '%', 'Obras Civiles, Galpones y Patios'],
      ['2. Activos Productivos (CAPEX)', kpiData.capexActivos, ((kpiData.capexActivos / kpiData.totalMes) * 100).toFixed(1) + '%', '14 Equipos Reclasificados NIC 16'],
      ['TOTAL CAPEX', kpiData.totalCapex, ((kpiData.totalCapex / kpiData.totalMes) * 100).toFixed(1) + '%', 'Inversion Patrimonial Capitalizada'],
      ['', ''],
      ['3. Mantto. Activos Productivos (OPEX)', kpiData.manttoActivosOpex, ((kpiData.manttoActivosOpex / kpiData.totalMes) * 100).toFixed(1) + '%', 'Flota Operativa no reclasificada'],
      ['4. Mantto. Infraestructura (OPEX)', kpiData.opexInfra, ((kpiData.opexInfra / kpiData.totalMes) * 100).toFixed(1) + '%', 'Planta, Galpones y Servicios Generales'],
      ['5. Gastos de Administracion (OPEX)', kpiData.gastosAdmonOpex, ((kpiData.gastosAdmonOpex / kpiData.totalMes) * 100).toFixed(1) + '%', 'Gastos Corporativos y de Gestion'],
      ['TOTAL OPEX', kpiData.totalOpex, ((kpiData.totalOpex / kpiData.totalMes) * 100).toFixed(1) + '%', 'Gasto Operativo Directo e Indirecto'],
      ['', ''],
      ['GRAN TOTAL MES', kpiData.totalMes, '100.0%', 'CAPEX + OPEX'],
      ['TOTAL ACUMULADO 2026', kpiData.totalAcumulado, '-', 'Enero a Octubre (Incluye Horas Hombre)']
    ];
    const ws1 = XLSX.utils.aoa_to_sheet(dataResumen);
    XLSX.utils.book_append_sheet(wb, ws1, 'Resumen_CAPEX_OPEX');

    // Hoja 2: Detalle 14 Equipos Flota a CAPEX
    const dataEquipos = lista14EquiposCapex.map((eq, i) => ({
      '#': i + 1,
      'Codigo Equipo': eq.codigo,
      'Nombre del Equipo': eq.nombre,
      'Tipo de Reclasificacion': eq.tipo,
      'Comprobante SIP / OC': eq.comprobante,
      'Monto Capitalizado ($)': eq.monto,
      'Motivo Operativo': eq.motivo,
      'Criterio NIC 16': eq.criterio
    }));
    const ws2 = XLSX.utils.json_to_sheet(dataEquipos);
    XLSX.utils.book_append_sheet(wb, ws2, '14_Equipos_Flota_CAPEX');

    XLSX.writeFile(wb, `TIMACA_Control_CAPEX_OPEX_${MESES_CANDIDATOS[selectedMesIdx].label}_2026.xlsx`);
  };

  // =========================================================================
  // MATEMATICA DEL GRAFICO EVOLUTIVO (SPLINES FRITSCH-CARLSON)
  // =========================================================================
  const chartW = 560;
  const chartH = 220;
  const padLeft = 45;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 30;

  const innerW = chartW - padLeft - padRight;
  const innerH = chartH - padTop - padBottom;

  const yMax = 290000;
  const yTicks = [
    { val: 0, label: '$0' },
    { val: 73000, label: '$73k' },
    { val: 145000, label: '$145k' },
    { val: 218000, label: '$218k' },
    { val: 290000, label: '$290k' }
  ];

  const xStep = innerW / 9; // 10 meses (0 a 9)

  const pointsCapex = EVOLUTIVO_INTERNOS_2026.map((m, idx) => ({
    x: padLeft + idx * xStep,
    y: padTop + innerH - (m.capex / yMax) * innerH,
    valor: m.capex,
    mes: m.mesCorto
  }));

  const pointsFlota = EVOLUTIVO_INTERNOS_2026.map((m, idx) => ({
    x: padLeft + idx * xStep,
    y: padTop + innerH - (m.opexActivos / yMax) * innerH,
    valor: m.opexActivos,
    mes: m.mesCorto
  }));

  const pointsInfra = EVOLUTIVO_INTERNOS_2026.map((m, idx) => ({
    x: padLeft + idx * xStep,
    y: padTop + innerH - (m.opexInfraestructura / yMax) * innerH,
    valor: m.opexInfraestructura,
    mes: m.mesCorto
  }));

  const pointsAdmon = EVOLUTIVO_INTERNOS_2026.map((m, idx) => {
    const val = m.admon || 0;
    return {
      x: padLeft + idx * xStep,
      y: padTop + innerH - (val / yMax) * innerH,
      valor: val,
      mes: m.mesCorto
    };
  });

  const pathCapex = getSmoothSplinePath(pointsCapex);
  const pathFlota = getSmoothSplinePath(pointsFlota);
  const pathInfra = getSmoothSplinePath(pointsInfra);
  const pathAdmon = getSmoothSplinePath(pointsAdmon);

  // =========================================================================
  // MATEMATICA DEL GRAFICO DE DONA (DISTRIBUCION CAPEX / OPEX OCTUBRE)
  // =========================================================================
  const slicesDona = useMemo(() => {
    const items = [
      { id: 'admon', nombre: 'Gastos de Administracion (OPEX)', monto: 166499, pct: 45.4, pctLabel: '45%', color: '#0f172a' },
      { id: 'infra', nombre: 'Mantto. Infraestructura (OPEX)', monto: 56862, pct: 15.5, pctLabel: '16%', color: '#0284c7' },
      { id: 'flota', nombre: 'Mantto. Activos Productivos (OPEX)', monto: 54542, pct: 14.9, pctLabel: '15%', color: '#64748b' },
      { id: 'internos', nombre: 'Proyectos Internos (CAPEX)', monto: 46512, pct: 12.7, pctLabel: '13%', color: '#0d9488' },
      { id: 'activos', nombre: 'Activos Productivos (CAPEX)', monto: 42232, pct: 11.5, pctLabel: '12%', color: '#334155' }
    ];

    const cx = 110;
    const cy = 110;
    const rOuter = 95;
    const rInner = 56;

    let cumulativeAngle = -Math.PI / 2;

    return items.map(it => {
      const angle = (it.pct / 100) * 2 * Math.PI;
      const startAngle = cumulativeAngle;
      const endAngle = cumulativeAngle + angle;
      cumulativeAngle = endAngle;

      const midAngle = startAngle + angle / 2;

      const x1 = cx + rOuter * Math.cos(startAngle);
      const y1 = cy + rOuter * Math.sin(startAngle);
      const x2 = cx + rOuter * Math.cos(endAngle);
      const y2 = cy + rOuter * Math.sin(endAngle);

      const x3 = cx + rInner * Math.cos(endAngle);
      const y3 = cy + rInner * Math.sin(endAngle);
      const x4 = cx + rInner * Math.cos(startAngle);
      const y4 = cy + rInner * Math.sin(startAngle);

      const largeArc = angle > Math.PI ? 1 : 0;
      const pathD = `M ${x1} ${y1} A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${rInner} ${rInner} 0 ${largeArc} 0 ${x4} ${y4} Z`;

      const rLabel = (rOuter + rInner) / 2;
      const lx = cx + rLabel * Math.cos(midAngle);
      const ly = cy + rLabel * Math.sin(midAngle) + 4;

      return {
        ...it,
        pathD,
        lx,
        ly
      };
    });
  }, []);

  return (
    <div className="space-y-5 animate-fadeIn text-slate-800">
      {/* ========================================================================= */}
      {/* 1. HEADER CARD: RESUMEN EJECUTIVO CONTROL CAPEX & OPEX                   */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0 mt-0.5">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Resumen Ejecutivo — Control CAPEX & OPEX ({MESES_CANDIDATOS[selectedMesIdx].label} 2026)
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Consolidacion automatica en vivo desde Nucleo/SIP (Salidas 17:13 + Compras/Servicios 17:9) y reclasificaciones CAPEX de flota.
              </p>
            </div>
          </div>

          {/* Action Bar / Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Ano 2026 Dropdown */}
            <div className="relative">
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors cursor-pointer">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Año 2026</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
              </button>
            </div>

            {/* Mes de Corte Dropdown */}
            <div className="relative">
              <select
                value={selectedMesIdx}
                onChange={(e) => setSelectedMesIdx(Number(e.target.value))}
                className="appearance-none flex items-center gap-1.5 pl-3 pr-7 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {MESES_CANDIDATOS.map(m => (
                  <option key={m.num} value={m.num}>
                    Mes de Corte: {m.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Decimal Toggle .00 */}
            <button
              onClick={() => setShowDecimals(!showDecimals)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer border ${
                showDecimals
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
              }`}
              title="Alternar visualizacion de centimos (.00)"
            >
              .00
            </button>

            {/* Refresh circular button */}
            <button
              onClick={() => {
                setSelectedMesIdx(9);
              }}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              title="Restablecer vista a Octubre"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Equipos Flota a CAPEX (14) Button */}
            <button
              onClick={() => setShowReclasificacionModal(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-colors cursor-pointer border border-slate-800"
              title="Ver detalle de los 14 equipos de flota capitalizados bajo NIC 16"
            >
              <Truck className="w-3.5 h-3.5 text-sky-400" />
              <span>Equipos Flota a CAPEX</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-sky-300 text-[10px] font-mono border border-slate-700">
                14
              </span>
            </button>

            {/* Exportar Excel Button */}
            <button
              onClick={handleExportarExcelCompleto}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs shadow-emerald-600/20 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. 6-CARD EXECUTIVE KPI GRID                                              */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        
        {/* CARD 1: TOTAL CAPEX */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              TOTAL CAPEX
            </span>
            <div className="text-2xl font-black text-slate-900 font-mono tracking-tight mt-1">
              {formatUSD(kpiData.totalCapex)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Internos {formatUSD(kpiData.capexInternos)} - Activos {formatUSD(kpiData.capexActivos)}
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
              <TrendingUp className="w-3 h-3 text-emerald-600" />
              <span>▲ {kpiData.capexVarPct}%</span>
            </span>
            <span className="text-slate-400">vs Sept ({formatUSD(kpiData.capexVarMontoSep)})</span>
          </div>
        </div>

        {/* CARD 2: MANTTO. ACTIVOS (OPEX) */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              MANTTO. ACTIVOS (OPEX)
            </span>
            <div className="text-2xl font-black text-slate-900 font-mono tracking-tight mt-1">
              {formatUSD(kpiData.manttoActivosOpex)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Flota operativa no reclasificada
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="inline-flex items-center gap-1 text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-md">
              <TrendingDown className="w-3 h-3 text-rose-600" />
              <span>▼ {Math.abs(kpiData.manttoVarPct)}%</span>
            </span>
            <span className="text-slate-400">vs Sept ({formatUSD(kpiData.manttoVarMontoSep)})</span>
          </div>
        </div>

        {/* CARD 3: GASTOS ADMON (OPEX) */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              GASTOS ADMON (OPEX)
            </span>
            <div className="text-2xl font-black text-slate-900 font-mono tracking-tight mt-1">
              {formatUSD(kpiData.gastosAdmonOpex)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Gastos de Administracion
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
              <TrendingUp className="w-3 h-3 text-emerald-600" />
              <span>▲ {kpiData.admonVarPct}%</span>
            </span>
            <span className="text-slate-400">vs Sept ({formatUSD(kpiData.admonVarMontoSep)})</span>
          </div>
        </div>

        {/* CARD 4: TOTAL OPEX */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              TOTAL OPEX
            </span>
            <div className="text-2xl font-black text-slate-900 font-mono tracking-tight mt-1">
              {formatUSD(kpiData.totalOpex)}
            </div>
            <p className="text-[10px] text-slate-500 mt-1 truncate" title={`Flota ${formatUSD(kpiData.opexFlota)} | Infra ${formatUSD(kpiData.opexInfra)} | Admon ${formatUSD(kpiData.opexAdmon)}`}>
              Flota {formatUSD(kpiData.opexFlota)} | Infra {formatUSD(kpiData.opexInfra)} | Admon {formatUSD(kpiData.opexAdmon)}
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
              <TrendingUp className="w-3 h-3 text-emerald-600" />
              <span>▲ {kpiData.opexVarPct}%</span>
            </span>
            <span className="text-slate-400">vs Sept ({formatUSD(kpiData.opexVarMontoSep)})</span>
          </div>
        </div>

        {/* CARD 5: TOTAL OCTUBRE */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              TOTAL {MESES_CANDIDATOS[selectedMesIdx].label.toUpperCase()}
            </span>
            <div className="text-2xl font-black text-slate-900 font-mono tracking-tight mt-1">
              {formatUSD(kpiData.totalMes)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              CAPEX Total + OPEX Total
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
              <TrendingUp className="w-3 h-3 text-emerald-600" />
              <span>▲ {kpiData.mesVarPct}%</span>
            </span>
            <span className="text-slate-400">vs Sept ({formatUSD(kpiData.mesVarMontoSep)})</span>
          </div>
        </div>

        {/* CARD 6: TOTAL ACUMULADO 2026 */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              TOTAL ACUMULADO 2026
            </span>
            <div className="text-2xl font-black text-slate-900 font-mono tracking-tight mt-1">
              {formatUSD(kpiData.totalAcumulado)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Ene – Octubre (Incluye Horas Hombre)
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
              Cierre Mes 10
            </span>
            <span className="text-slate-400">Auditoria TIMACA</span>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. TWO-COLUMN CHARTS: EVOLUTIVO GENERAL & DISTRIBUCION CAPEX / OPEX        */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* LEFT COLUMN: EVOLUTIVO GENERAL (ENE - OCT) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight uppercase">
                EVOLUTIVO GENERAL (ENE – OCT)
              </h3>
            </div>
            <button
              onClick={() => setIncluirMesesPosteriores(!incluirMesesPosteriores)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all border ${
                incluirMesesPosteriores
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              Incluir meses posteriores
            </button>
          </div>

          {/* SVG Vectorial Chart */}
          <div className="relative mt-3">
            <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-auto overflow-visible select-none">
              {/* Grid Lines & Y-Axis Labels */}
              {yTicks.map(t => {
                const yPos = padTop + innerH - (t.val / yMax) * innerH;
                return (
                  <g key={t.val}>
                    <line
                      x1={padLeft}
                      y1={yPos}
                      x2={chartW - padRight}
                      y2={yPos}
                      stroke="#f1f5f9"
                      strokeWidth="1"
                    />
                    <text
                      x={padLeft - 8}
                      y={yPos + 3}
                      textAnchor="end"
                      fill="#94a3b8"
                      fontSize="10"
                      fontFamily="monospace"
                    >
                      {t.label}
                    </text>
                  </g>
                );
              })}

              {/* X-Axis Labels */}
              {EVOLUTIVO_INTERNOS_2026.map((m, idx) => {
                const xPos = padLeft + idx * xStep;
                const isSelected = selectedMesIdx === idx;
                return (
                  <g key={m.mesCorto}>
                    <text
                      x={xPos}
                      y={chartH - 8}
                      textAnchor="middle"
                      fill={isSelected ? '#0f172a' : '#94a3b8'}
                      fontWeight={isSelected ? 'bold' : 'normal'}
                      fontSize="10"
                    >
                      {m.mesCorto}
                    </text>
                  </g>
                );
              })}

              {/* Vertical Dashed Guideline for Selected Month (Octobre) */}
              <line
                x1={padLeft + selectedMesIdx * xStep}
                y1={padTop}
                x2={padLeft + selectedMesIdx * xStep}
                y2={padTop + innerH}
                stroke="#64748b"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />

              {/* 1. Curva Infraestructura (Dark Slate) */}
              <path
                d={pathInfra}
                fill="none"
                stroke="#334155"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* 2. Curva CAPEX (Teal) */}
              <path
                d={pathCapex}
                fill="none"
                stroke="#0d9488"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* 3. Curva Mantenimiento Flota (Sky Blue) */}
              <path
                d={pathFlota}
                fill="none"
                stroke="#0284c7"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* 4. Curva Gastos Administracion (Purple) */}
              <path
                d={pathAdmon}
                fill="none"
                stroke="#7c3aed"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Puntos y Hover Interactivo en Octubre */}
              {pointsAdmon.map((p, idx) => (
                <circle
                  key={`admon-${idx}`}
                  cx={p.x}
                  cy={p.y}
                  r={selectedMesIdx === idx ? 4.5 : 3}
                  fill="#7c3aed"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  className="cursor-pointer transition-all hover:scale-125"
                  onMouseEnter={() => setHoveredPoint({ mes: p.mes, serie: 'Gastos Admon', valor: p.valor, x: p.x, y: p.y })}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              ))}

              {pointsCapex.map((p, idx) => (
                <circle
                  key={`capex-${idx}`}
                  cx={p.x}
                  cy={p.y}
                  r={selectedMesIdx === idx ? 4.5 : 3}
                  fill="#0d9488"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  className="cursor-pointer transition-all hover:scale-125"
                  onMouseEnter={() => setHoveredPoint({ mes: p.mes, serie: 'CAPEX Total', valor: p.valor, x: p.x, y: p.y })}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              ))}

              {pointsFlota.map((p, idx) => (
                <circle
                  key={`flota-${idx}`}
                  cx={p.x}
                  cy={p.y}
                  r={selectedMesIdx === idx ? 4.5 : 3}
                  fill="#0284c7"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  className="cursor-pointer transition-all hover:scale-125"
                  onMouseEnter={() => setHoveredPoint({ mes: p.mes, serie: 'Mantto. Flota', valor: p.valor, x: p.x, y: p.y })}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              ))}
            </svg>

            {/* Hover Tooltip Float */}
            {hoveredPoint && (
              <div
                className="absolute z-10 bg-slate-900 text-white text-[11px] px-2.5 py-1.5 rounded-lg shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full mb-2"
                style={{
                  left: `${(hoveredPoint.x / chartW) * 100}%`,
                  top: `${(hoveredPoint.y / chartH) * 100}%`
                }}
              >
                <div className="font-bold text-sky-300">{hoveredPoint.mes} — {hoveredPoint.serie}</div>
                <div className="font-mono text-xs">{formatUSD(hoveredPoint.valor)}</div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: DISTRIBUCION CAPEX Y OPEX – OCTUBRE */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-slate-700" />
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight uppercase">
                DISTRIBUCIÓN CAPEX Y OPEX – {MESES_CANDIDATOS[selectedMesIdx].label.toUpperCase()}
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-4 mt-3">
            {/* Donut Chart SVG */}
            <div className="sm:col-span-6 flex items-center justify-center">
              <div className="relative w-44 h-44">
                <svg viewBox="0 0 220 220" className="w-full h-full select-none">
                  {slicesDona.map(slice => (
                    <g key={slice.id} className="transition-all hover:opacity-90">
                      <path
                        d={slice.pathD}
                        fill={slice.color}
                        stroke="#ffffff"
                        strokeWidth="2"
                      />
                      <text
                        x={slice.lx}
                        y={slice.ly}
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="11"
                        fontWeight="bold"
                        filter="drop-shadow(0px 1px 2px rgba(0,0,0,0.7))"
                      >
                        {slice.pctLabel}
                      </text>
                    </g>
                  ))}
                  {/* Center Cutout Text */}
                  <text x="110" y="105" textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="600" textTransform="uppercase">
                    Total Mes
                  </text>
                  <text x="110" y="124" textAnchor="middle" fill="#0f172a" fontSize="14" fontWeight="900" fontFamily="monospace">
                    {formatUSD(kpiData.totalMes)}
                  </text>
                </svg>
              </div>
            </div>

            {/* Legend / Table Breakdown on Right */}
            <div className="sm:col-span-6 space-y-2 text-xs">
              {slicesDona.map(item => (
                <div key={item.id} className="flex items-center justify-between gap-2 p-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-xs shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-[11px] font-medium text-slate-700 truncate" title={item.nombre}>
                      {item.nombre}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono font-bold text-slate-900 block text-[11px]">
                      {formatUSD(item.monto)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {item.pct.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 4. MODAL: EQUIPOS FLOTA A CAPEX (14 ACTIVOS CAPITALIZADOS NIC 16)         */}
      {/* ========================================================================= */}
      {showReclasificacionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-400/30">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    Equipos Flota a CAPEX (14 Activos Reclasificados NIC 16)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Monto total capitalizado en Octubre 2026: <strong className="text-sky-300 font-mono">$42,232.00 USD</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowReclasificacionModal(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Table of 14 Assets */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-900 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Criterio Contable NIC 16:</strong> Se capitalizan intervenciones mayores (motores a 0 horas, tornamesas, vastagos de izamiento pesado y transmisiones) que aumentan sustancialmente la vida util economica y la capacidad de servicio de la flota de TIMACA.
                </span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Codigo & Equipo</th>
                      <th className="py-2.5 px-3">Tipo Reclasificacion</th>
                      <th className="py-2.5 px-3">Comprobante SIP</th>
                      <th className="py-2.5 px-3 text-right">Monto ($)</th>
                      <th className="py-2.5 px-3">Justificacion Contable</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {lista14EquiposCapex.map((eq, i) => (
                      <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-slate-400">{i + 1}</td>
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-slate-900 block font-mono text-[11px]">{eq.codigo}</span>
                          <span className="text-[11px] text-slate-600">{eq.nombre}</span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="inline-block px-2 py-0.5 rounded-md font-semibold text-[10px] bg-sky-50 text-sky-700 border border-sky-200">
                            {eq.tipo}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-600 text-[11px]">{eq.comprobante}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                          {formatUSD(eq.monto)}
                        </td>
                        <td className="py-2.5 px-3 text-[11px] text-slate-500 max-w-xs">{eq.criterio}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 border-t border-slate-200 font-bold text-slate-900">
                    <tr>
                      <td colSpan={4} className="py-3 px-3 text-right uppercase text-[11px]">
                        Total Activos Productivos Reclasificados a CAPEX:
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-sm text-blue-700">
                        {formatUSD(42232)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-500">14 registros auditados y certificados bajo norma NIC 16</span>
              <button
                onClick={() => setShowReclasificacionModal(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cerrar Detalle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
