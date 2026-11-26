import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import {
  Layers,
  Calendar,
  Download,
  TrendingUp,
  TrendingDown,
  Info,
  X,
  Sparkles,
  PieChart as PieIcon,
  BarChart3,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Package,
  Wrench,
  Users,
  Truck,
  DollarSign,
  Briefcase
} from 'lucide-react';
import {
  TABLA_PPT_DISTRIBUCION_2026,
  CUENTAS_CORTAS_MAP
} from '../data/mockCostosTimaca';
import {
  MATRIZ_REAL_PROYECTOS_MENSUAL_2026
} from '../data/realProyectosMensual2026';

interface ProyectosExternosResumenEjecutivoProps {
  onOpenProyectosMatriz?: () => void;
  onGoToProyectos?: () => void;
  onGoToCategoria?: (cat: string) => void;
  onSelectProyecto?: (cuenta: string) => void;
}

// Algoritmo matematico de Splines Monotonos Cubicos (Fritsch-Carlson) para curvas suaves C1 sin artefactos de overshoot
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

export const ProyectosExternosResumenEjecutivo: React.FC<ProyectosExternosResumenEjecutivoProps> = ({
  onOpenProyectosMatriz,
  onGoToProyectos,
  onGoToCategoria,
  onSelectProyecto
}) => {
  const [selectedMesIdx, setSelectedMesIdx] = useState<number>(9); // Octubre (indice 9)
  const [showDecimals, setShowDecimals] = useState<boolean>(false);
  const [activeSeriesMode, setActiveSeriesMode] = useState<'total' | 'desglose'>('total');
  const [selectedCatModal, setSelectedCatModal] = useState<string | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<{ mes: string; serie: string; valor: number; x: number; y: number } | null>(null);
  const [hoveredDonutIdx, setHoveredDonutIdx] = useState<number | null>(null);

  const MESES_CANDIDATOS = [
    { num: 0, label: 'Enero', corto: 'Ene' },
    { num: 1, label: 'Febrero', corto: 'Feb' },
    { num: 2, label: 'Marzo', corto: 'Mar' },
    { num: 3, label: 'Abril', corto: 'Abr' },
    { num: 4, label: 'Mayo', corto: 'May' },
    { num: 5, label: 'Junio', corto: 'Jun' },
    { num: 6, label: 'Julio', corto: 'Jul' },
    { num: 7, label: 'Agosto', corto: 'Ago' },
    { num: 8, label: 'Septiembre', corto: 'Sep' },
    { num: 9, label: 'Octubre', corto: 'Oct' }
  ];

  // Formato monetario dinamico
  const formatUSD = (val: number) => {
    return val.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: showDecimals ? 2 : 0
    });
  };

  // Configuracion de las 5 categorias oficiales
  const CATEGORIAS_CONFIG: {
    key: string;
    label: string;
    color: string;
    bgBadge: string;
    textBadge: string;
    borderBadge: string;
    icon: React.ComponentType<{ className?: string }>;
    desc: string;
  }[] = [
    {
      key: 'Materiales Directos',
      label: 'Materiales Directos',
      color: '#2563eb', // Blue 600
      bgBadge: 'bg-blue-50',
      textBadge: 'text-blue-700',
      borderBadge: 'border-blue-200',
      icon: Package,
      desc: 'Insumos SIP, aceros, tuberías y consumibles'
    },
    {
      key: 'Servicios Directos',
      label: 'Servicios Directos',
      color: '#f97316', // Orange 500
      bgBadge: 'bg-orange-50',
      textBadge: 'text-orange-700',
      borderBadge: 'border-orange-200',
      icon: Wrench,
      desc: 'Subcontratos de maquinado, fletes y ensayos QA/QC'
    },
    {
      key: 'Mano de Obra Directa',
      label: 'Mano de Obra Directa',
      color: '#10b981', // Emerald 500
      bgBadge: 'bg-emerald-50',
      textBadge: 'text-emerald-700',
      borderBadge: 'border-emerald-200',
      icon: Users,
      desc: 'Cuadrillas mecánicas, soldadores y frentes de obra'
    },
    {
      key: 'Horas Máquina',
      label: 'Horas Máquina',
      color: '#8b5cf6', // Purple 500
      bgBadge: 'bg-purple-50',
      textBadge: 'text-purple-700',
      borderBadge: 'border-purple-200',
      icon: Truck,
      desc: 'Grúas telescópicas, retroexcavadoras y equipos mayores'
    },
    {
      key: 'Costos Indirectos',
      label: 'Costos Indirectos',
      color: '#eab308', // Amber 500
      bgBadge: 'bg-amber-50',
      textBadge: 'text-amber-800',
      borderBadge: 'border-amber-200',
      icon: Layers,
      desc: 'Supervisión técnica, logística y costos asociados'
    }
  ];

  // Matriz de montos mensuales por categoria
  const monthlyData = useMemo(() => {
    return MESES_CANDIDATOS.map((mesObj, idx) => {
      let mesTotal = 0;
      const catMap: Record<string, number> = {};

      CATEGORIAS_CONFIG.forEach(c => {
        const row = TABLA_PPT_DISTRIBUCION_2026.find(t => 
          t.categoria.toLowerCase().trim() === c.key.toLowerCase().trim() ||
          t.categoria.toLowerCase().includes(c.key.toLowerCase().split(' ')[0])
        );
        const val = row?.meses[idx] || 0;
        catMap[c.key] = val;
        mesTotal += val;
      });

      return {
        mesIdx: idx,
        mesLabel: mesObj.label,
        mesCorto: mesObj.corto,
        total: mesTotal,
        ...catMap
      };
    });
  }, []);

  const totalAcumulado2026 = useMemo(() => {
    return monthlyData.reduce((acc, m) => acc + m.total, 0);
  }, [monthlyData]);

  const mesActualData = monthlyData[selectedMesIdx] || monthlyData[9];
  const mesAnteriorData = selectedMesIdx > 0 ? monthlyData[selectedMesIdx - 1] : null;

  // Calculo de KPIs de las 6 Tarjetas
  const cardsData = useMemo(() => {
    return CATEGORIAS_CONFIG.map(cat => {
      const valorActual = (mesActualData as any)[cat.key] || 0;
      const valorAnterior = mesAnteriorData ? ((mesAnteriorData as any)[cat.key] || 0) : valorActual;
      const varPct = valorAnterior > 0 
        ? Math.round(((valorActual - valorAnterior) / valorAnterior) * 100)
        : 0;
      const pctDelMes = mesActualData.total > 0
        ? ((valorActual / mesActualData.total) * 100).toFixed(1)
        : '0';

      return {
        ...cat,
        valorActual,
        valorAnterior,
        varPct,
        pctDelMes
      };
    });
  }, [mesActualData, mesAnteriorData]);

  const totalMesVarPct = useMemo(() => {
    if (!mesAnteriorData || mesAnteriorData.total === 0) return 0;
    return Math.round(((mesActualData.total - mesAnteriorData.total) / mesAnteriorData.total) * 100);
  }, [mesActualData, mesAnteriorData]);

  // Exportar a Excel
  const handleExportarExcel = () => {
    const wsData = [
      ['TIMACA - CONTROL EJECUTIVO DE PROYECTOS EXTERNOS 2026'],
      [`Período auditado: ${mesActualData.mesLabel} 2026 (Consolidado Enero a Octubre)`],
      [''],
      ['Categoría Oficial', ...MESES_CANDIDATOS.map(m => m.label), 'Total Acumulado 2026', '% Participación Oct']
    ];

    CATEGORIAS_CONFIG.forEach(cat => {
      const row = [cat.label];
      let rowTot = 0;
      MESES_CANDIDATOS.forEach((_, idx) => {
        const val = (monthlyData[idx] as any)[cat.key] || 0;
        row.push(val);
        rowTot += val;
      });
      row.push(rowTot);
      const pctOct = mesActualData.total > 0 
        ? `${(((mesActualData as any)[cat.key] / mesActualData.total) * 100).toFixed(1)}%` 
        : '0%';
      row.push(pctOct);
      wsData.push(row);
    });

    // Fila de Total Mes
    const totRow = ['TOTAL CONSOLIDADO MES'];
    MESES_CANDIDATOS.forEach((_, idx) => {
      totRow.push(monthlyData[idx].total);
    });
    totRow.push(totalAcumulado2026);
    totRow.push('100.0%');
    wsData.push(totRow);

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, 'Proyectos_Externos_2026');
    XLSX.writeFile(wb, `TIMACA_Proyectos_Externos_${mesActualData.mesLabel}_2026.xlsx`);
  };

  // SVG Spline Chart Calculations
  const chartW = 760;
  const chartH = 260;
  const padL = 65;
  const padR = 25;
  const padT = 30;
  const padB = 40;
  const innerW = chartW - padL - padR;
  const innerH = chartH - padT - padB;

  const maxValY = useMemo(() => {
    const maxT = Math.max(...monthlyData.map(d => d.total));
    return Math.ceil(maxT * 1.15 / 500000) * 500000;
  }, [monthlyData]);

  const getYPos = (val: number) => {
    return padT + innerH - (val / maxValY) * innerH;
  };

  const getXPos = (idx: number) => {
    return padL + (idx / (MESES_CANDIDATOS.length - 1)) * innerW;
  };

  // Puntos del total mensual
  const totalPoints = useMemo(() => {
    return monthlyData.map((d, i) => ({
      x: getXPos(i),
      y: getYPos(d.total),
      valor: d.total,
      mes: d.mesLabel
    }));
  }, [monthlyData, maxValY]);

  const totalSplineD = useMemo(() => {
    return getSmoothSplinePath(totalPoints);
  }, [totalPoints]);

  const totalAreaD = useMemo(() => {
    if (totalPoints.length === 0) return '';
    const firstX = totalPoints[0].x;
    const lastX = totalPoints[totalPoints.length - 1].x;
    const baseLineY = padT + innerH;
    return `${totalSplineD} L ${lastX.toFixed(1)} ${baseLineY.toFixed(1)} L ${firstX.toFixed(1)} ${baseLineY.toFixed(1)} Z`;
  }, [totalSplineD, totalPoints]);

  // Donut chart calculations
  const donutR = 80;
  const donutHole = 52;
  const donutCX = 110;
  const donutCY = 110;

  const donutSlices = useMemo(() => {
    const totalMes = mesActualData.total || 1;
    let accAngle = -90; // Empezar arriba

    return CATEGORIAS_CONFIG.map((cat, idx) => {
      const val = (mesActualData as any)[cat.key] || 0;
      const pct = (val / totalMes) * 100;
      const angle = (val / totalMes) * 360;

      const startAngleRad = (accAngle * Math.PI) / 180;
      const endAngleRad = ((accAngle + angle) * Math.PI) / 180;
      accAngle += angle;

      const x1 = donutCX + donutR * Math.cos(startAngleRad);
      const y1 = donutCY + donutR * Math.sin(startAngleRad);
      const x2 = donutCX + donutR * Math.cos(endAngleRad);
      const y2 = donutCY + donutR * Math.sin(endAngleRad);

      const ix1 = donutCX + donutHole * Math.cos(startAngleRad);
      const iy1 = donutCY + donutHole * Math.sin(startAngleRad);
      const ix2 = donutCX + donutHole * Math.cos(endAngleRad);
      const iy2 = donutCY + donutHole * Math.sin(endAngleRad);

      const largeArc = angle > 180 ? 1 : 0;
      const pathD = `M ${ix1} ${iy1} L ${x1} ${y1} A ${donutR} ${donutR} 0 ${largeArc} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${donutHole} ${donutHole} 0 ${largeArc} 0 ${ix1} ${iy1} Z`;

      return {
        ...cat,
        valor: val,
        pct: pct.toFixed(1),
        pathD,
        idx
      };
    });
  }, [mesActualData]);

  // Proyectos con mayor desembolso en la categoria seleccionada (para modal de auditoria)
  const proyectosAuditadosCat = useMemo(() => {
    if (!selectedCatModal) return [];

    const list: { cuenta: string; desc: string; monto: number; pct: number }[] = [];
    const catTotalMes = (mesActualData as any)[selectedCatModal] || 0;

    Object.values(MATRIZ_REAL_PROYECTOS_MENSUAL_2026).forEach(p => {
      const catByMes = p.byCategoriaMes[selectedMesIdx];
      let val = 0;
      if (catByMes) {
        val = catByMes[selectedCatModal] || 0;
        if (val === 0 && selectedCatModal === 'Servicios Directos') {
          val = catByMes['Servicios'] || 0;
        }
        if (val === 0 && selectedCatModal === 'Horas Máquina') {
          val = catByMes['Horas Maquina'] || 0;
        }
      }

      if (val > 0) {
        list.push({
          cuenta: p.cuentaAuxiliar,
          desc: p.descripcion,
          monto: val,
          pct: catTotalMes > 0 ? (val / catTotalMes) * 100 : 0
        });
      }
    });

    return list.sort((a, b) => b.monto - a.monto);
  }, [selectedCatModal, selectedMesIdx, mesActualData]);

  return (
    <div className="space-y-4 font-sans animate-fade-in">
      {/* ========================================================================= */}
      {/* 1. CABECERA EJECUTIVA - ESTILO PORTAL DANIELA RIVEROS                     */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                PROYECTOS EXTERNOS · TIMACA 2026
              </span>
              <span className="text-xs text-slate-400 font-mono">Consolidado SIP Oficial</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
              <span>Control de Proyectos Externos</span>
              <span className="text-blue-600 font-normal">|</span>
              <span className="text-slate-600 font-bold text-lg sm:text-xl">
                {mesActualData.mesLabel} 2026
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Desembolsos en obras industriales, contratos con clientes y frentes de taller según 5 categorías auditadas.
            </p>
          </div>

          {/* Controles de Cabecera */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Selector de Mes */}
            <div className="relative">
              <select
                value={selectedMesIdx}
                onChange={(e) => setSelectedMesIdx(Number(e.target.value))}
                className="appearance-none bg-slate-50 hover:bg-slate-100 text-slate-900 font-bold text-xs py-2 pl-3.5 pr-8 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs transition-colors"
              >
                {MESES_CANDIDATOS.map((m) => (
                  <option key={m.num} value={m.num}>
                    {m.label} 2026
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Conmutador de Decimales .00 */}
            <button
              onClick={() => setShowDecimals(!showDecimals)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-2xs ${
                showDecimals
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
              }`}
              title="Alternar visualización de decimales (.00)"
            >
              <span className="font-mono font-black text-[11px]">.00</span>
              <span className="text-[11px] hidden sm:inline">Decimales</span>
            </button>

            {/* Boton Exportar Excel */}
            <button
              onClick={handleExportarExcel}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-2xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Exportar Excel</span>
            </button>

            {/* Acceso Rapido a Matriz Completa */}
            {onOpenProyectosMatriz && (
              <button
                onClick={onOpenProyectosMatriz}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors cursor-pointer"
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Matriz Proyectos</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. PARRILLA DE 6 TARJETAS KPI (ESTILO DANIELA RIVEROS)                    */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {cardsData.map((card) => {
          const IconComp = card.icon;
          const isPositive = card.varPct >= 0;

          return (
            <div
              key={card.key}
              onClick={() => setSelectedCatModal(card.key)}
              className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-blue-400 transition-all duration-200 cursor-pointer group relative overflow-hidden flex flex-col justify-between"
              title={`Haz clic para auditar proyectos con desembolsos en ${card.label}`}
            >
              {/* Linea de acento superior */}
              <div
                className="absolute top-0 inset-x-0 h-1 transition-all group-hover:h-1.5"
                style={{ backgroundColor: card.color }}
              />

              <div>
                <div className="flex items-center justify-between text-slate-500 mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-blue-700 transition-colors">
                    {card.label}
                  </span>
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 transition-transform"
                    style={{ backgroundColor: `${card.color}15`, color: card.color }}
                  >
                    <IconComp className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="my-1">
                  <span className="text-xl sm:text-[22px] font-black tracking-tight text-slate-900 group-hover:text-blue-900 transition-colors font-mono tabular-nums block">
                    {formatUSD(card.valorActual)}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap mt-1">
                  <span
                    className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      isPositive
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {isPositive ? (
                      <TrendingUp className="w-2.5 h-2.5 text-rose-600" />
                    ) : (
                      <TrendingDown className="w-2.5 h-2.5 text-emerald-600" />
                    )}
                    <span>{card.varPct > 0 ? `+${card.varPct}%` : `${card.varPct}%`}</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    vs mes ant.
                  </span>
                </div>
              </div>

              <div className="pt-2.5 mt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-600">
                  {card.pctDelMes}% <span className="font-normal text-slate-400">del mes</span>
                </span>
                <span className="text-blue-600 font-bold group-hover:translate-x-0.5 transition-transform inline-flex items-center">
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}

        {/* TARJETA 6: TOTAL MES & ACUMULADO */}
        <div
          onClick={onOpenProyectosMatriz}
          className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-indigo-400 transition-all duration-200 cursor-pointer group relative overflow-hidden flex flex-col justify-between"
          title="Haz clic para abrir la Matriz Consolidada de Proyectos Externos"
        >
          {/* Linea de acento degradado */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 group-hover:h-1.5 transition-all" />

          <div>
            <div className="flex items-center justify-between text-slate-500 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-indigo-700 transition-colors">
                TOTAL CONSOLIDADO MES
              </span>
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 transition-transform">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="my-1">
              <span className="text-xl sm:text-[22px] font-black tracking-tight text-slate-900 group-hover:text-indigo-900 transition-colors font-mono tabular-nums block">
                {formatUSD(mesActualData.total)}
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap mt-1">
              <span
                className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  totalMesVarPct >= 0
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}
              >
                {totalMesVarPct >= 0 ? (
                  <TrendingUp className="w-2.5 h-2.5 text-rose-600" />
                ) : (
                  <TrendingDown className="w-2.5 h-2.5 text-emerald-600" />
                )}
                <span>{totalMesVarPct > 0 ? `+${totalMesVarPct}%` : `${totalMesVarPct}%`}</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                vs mes ant.
              </span>
            </div>
          </div>

          <div className="pt-2.5 mt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-medium truncate">
              Acum 2026: <strong className="text-slate-800 font-mono">{formatUSD(totalAcumulado2026)}</strong>
            </span>
            <span className="text-indigo-600 font-bold group-hover:translate-x-0.5 transition-transform inline-flex items-center">
              <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. GRID PRINCIPAL: CURVAS SPLINE (IZQ) + DONA DISTRIBUCION (DER)         */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* GRAFICA DE CURVAS SUAVES FRITSCH-CARLSON (8 COLUMNAS) */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  <BarChart3 className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Evolutivo General Ene – Oct (Proyectos Externos)
                </h3>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Curvas continuas Fritsch-Carlson sin distorsión armónica · Pasa el cursor sobre los nodos
              </p>
            </div>

            {/* Alternar modo de serie */}
            <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                onClick={() => setActiveSeriesMode('total')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  activeSeriesMode === 'total'
                    ? 'bg-white text-slate-900 shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Total Mes
              </button>
              <button
                onClick={() => setActiveSeriesMode('desglose')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  activeSeriesMode === 'desglose'
                    ? 'bg-white text-slate-900 shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Por Categoría
              </button>
            </div>
          </div>

          {/* Canvas SVG Interactivo */}
          <div className="relative w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${chartW} ${chartH}`}
              className="w-full h-auto select-none"
              style={{ minWidth: '580px' }}
            >
              <defs>
                <linearGradient id="blueGradientExternos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0.01" />
                </linearGradient>
              </defs>

              {/* Lineas de cuadricula horizontales */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const y = padT + innerH * ratio;
                const val = maxValY * (1 - ratio);
                return (
                  <g key={ratio}>
                    <line
                      x1={padL}
                      y1={y}
                      x2={chartW - padR}
                      y2={y}
                      stroke="#e2e8f0"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />
                    <text
                      x={padL - 10}
                      y={y + 3}
                      textAnchor="end"
                      fontSize="9"
                      fill="#94a3b8"
                      fontFamily="monospace"
                    >
                      ${(val / 1000).toFixed(0)}k
                    </text>
                  </g>
                );
              })}

              {/* Area y Curva Total */}
              {activeSeriesMode === 'total' ? (
                <>
                  <path d={totalAreaD} fill="url(#blueGradientExternos)" />
                  <path
                    d={totalSplineD}
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Nodos del Total */}
                  {totalPoints.map((pt, idx) => {
                    const isSelected = idx === selectedMesIdx;
                    return (
                      <g key={idx}>
                        {isSelected && (
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r="11"
                            fill="#2563eb"
                            fillOpacity="0.2"
                            className="animate-ping"
                          />
                        )}
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={isSelected ? '6.5' : '4.5'}
                          fill={isSelected ? '#2563eb' : '#ffffff'}
                          stroke="#2563eb"
                          strokeWidth="2.5"
                          className="cursor-pointer transition-transform hover:scale-125"
                          onClick={() => setSelectedMesIdx(idx)}
                          onMouseEnter={() =>
                            setHoveredPoint({
                              mes: pt.mes,
                              serie: 'Total Consolidado',
                              valor: pt.valor,
                              x: pt.x,
                              y: pt.y
                            })
                          }
                          onMouseLeave={() => setHoveredPoint(null)}
                        />
                      </g>
                    );
                  })}
                </>
              ) : (
                /* Modo de Desglose por las 5 Categorias */
                CATEGORIAS_CONFIG.map((cat) => {
                  const catPoints = monthlyData.map((d, i) => ({
                    x: getXPos(i),
                    y: getYPos((d as any)[cat.key] || 0),
                    valor: (d as any)[cat.key] || 0,
                    mes: d.mesLabel
                  }));
                  const catSpline = getSmoothSplinePath(catPoints);

                  return (
                    <g key={cat.key}>
                      <path
                        d={catSpline}
                        fill="none"
                        stroke={cat.color}
                        strokeWidth="2.4"
                        strokeLinecap="round"
                      />
                      {catPoints.map((pt, idx) => (
                        <circle
                          key={idx}
                          cx={pt.x}
                          cy={pt.y}
                          r="3.5"
                          fill="#ffffff"
                          stroke={cat.color}
                          strokeWidth="2"
                          className="cursor-pointer hover:scale-125"
                          onClick={() => setSelectedMesIdx(idx)}
                          onMouseEnter={() =>
                            setHoveredPoint({
                              mes: pt.mes,
                              serie: cat.label,
                              valor: pt.valor,
                              x: pt.x,
                              y: pt.y
                            })
                          }
                          onMouseLeave={() => setHoveredPoint(null)}
                        />
                      ))}
                    </g>
                  );
                })
              )}

              {/* Etiquetas del Eje X (Meses) */}
              {MESES_CANDIDATOS.map((m, idx) => {
                const x = getXPos(idx);
                const isSelected = idx === selectedMesIdx;
                return (
                  <g
                    key={m.num}
                    className="cursor-pointer"
                    onClick={() => setSelectedMesIdx(idx)}
                  >
                    <text
                      x={x}
                      y={chartH - 12}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight={isSelected ? 'bold' : 'normal'}
                      fill={isSelected ? '#1d4ed8' : '#64748b'}
                    >
                      {m.corto}
                    </text>
                    {isSelected && (
                      <circle cx={x} cy={chartH - 4} r="2.5" fill="#1d4ed8" />
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Tooltip Flotante */}
            {hoveredPoint && (
              <div
                className="absolute pointer-events-none z-30 bg-slate-900 text-white text-xs rounded-xl py-1.5 px-3 shadow-xl border border-slate-700 whitespace-nowrap transform -translate-x-1/2 -translate-y-full"
                style={{
                  left: `${(hoveredPoint.x / chartW) * 100}%`,
                  top: `${(hoveredPoint.y / chartH) * 100 - 8}%`
                }}
              >
                <div className="font-bold text-amber-300 text-[11px]">
                  {hoveredPoint.mes} · {hoveredPoint.serie}
                </div>
                <div className="font-mono font-black text-sm text-white">
                  {formatUSD(hoveredPoint.valor)}
                </div>
              </div>
            )}
          </div>

          {/* Leyenda interactiva inferior */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              {activeSeriesMode === 'total' ? (
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-1 rounded-full bg-blue-600 inline-block" />
                  <span className="font-bold text-slate-700">Total Desembolsos Obras (USD)</span>
                </div>
              ) : (
                CATEGORIAS_CONFIG.map((c) => (
                  <button
                    key={c.key}
                    onClick={() => setSelectedCatModal(c.key)}
                    className="flex items-center gap-1.5 hover:opacity-80 transition-opacity cursor-pointer"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: c.color }}
                    />
                    <span className="text-[11px] font-bold text-slate-700">{c.label}</span>
                  </button>
                ))
              )}
            </div>

            <span className="text-[11px] text-slate-400">
              Mes actual destacado: <strong className="text-blue-700">{mesActualData.mesLabel}</strong>
            </span>
          </div>
        </div>

        {/* GRAFICA DE DONA DE DISTRIBUCION (4 COLUMNAS) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-3">
          <div className="border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-700 flex items-center justify-center font-bold">
                <PieIcon className="w-3.5 h-3.5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Distribución {mesActualData.mesLabel}
              </h3>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Participación porcentual de las 5 categorías oficiales
            </p>
          </div>

          {/* Dona SVG */}
          <div className="flex items-center justify-center py-1">
            <div className="relative">
              <svg width="220" height="220" viewBox="0 0 220 220" className="select-none">
                {donutSlices.map((slice) => {
                  const isHovered = hoveredDonutIdx === slice.idx;
                  return (
                    <path
                      key={slice.key}
                      d={slice.pathD}
                      fill={slice.color}
                      className="transition-all duration-150 cursor-pointer"
                      style={{
                        transformOrigin: `${donutCX}px ${donutCY}px`,
                        transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                        opacity: hoveredDonutIdx !== null && !isHovered ? 0.6 : 1
                      }}
                      onMouseEnter={() => setHoveredDonutIdx(slice.idx)}
                      onMouseLeave={() => setHoveredDonutIdx(null)}
                      onClick={() => setSelectedCatModal(slice.key)}
                    />
                  );
                })}

                {/* Texto Central */}
                <text
                  x={donutCX}
                  y={donutCY - 8}
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="bold"
                  fill="#94a3b8"
                  className="uppercase tracking-wider"
                >
                  TOTAL MES
                </text>
                <text
                  x={donutCX}
                  y={donutCY + 12}
                  textAnchor="middle"
                  fontSize="13"
                  fontWeight="900"
                  fontFamily="monospace"
                  fill="#0f172a"
                >
                  ${(mesActualData.total / 1000).toFixed(0)}k
                </text>
              </svg>
            </div>
          </div>

          {/* Lista de desglose en la tarjeta derecha */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            {donutSlices.map((slice) => (
              <div
                key={slice.key}
                onMouseEnter={() => setHoveredDonutIdx(slice.idx)}
                onMouseLeave={() => setHoveredDonutIdx(null)}
                onClick={() => setSelectedCatModal(slice.key)}
                className={`flex items-center justify-between p-1.5 rounded-xl text-xs transition-colors cursor-pointer ${
                  hoveredDonutIdx === slice.idx ? 'bg-slate-50' : 'hover:bg-slate-50/70'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: slice.color }}
                  />
                  <span className="font-bold text-slate-800 text-[11px]">
                    {slice.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-900 text-[11px]">
                    {formatUSD(slice.valor)}
                  </span>
                  <span
                    className="font-mono font-bold text-[10px] px-1.5 py-0.5 rounded-md"
                    style={{ backgroundColor: `${slice.color}15`, color: slice.color }}
                  >
                    {slice.pct}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. MODAL DE AUDITORIA DE PROYECTOS POR CATEGORIA (DRILL-DOWN)             */}
      {/* ========================================================================= */}
      {selectedCatModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                  Auditoría de Categoría Oficial
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">
                  {selectedCatModal} — {mesActualData.mesLabel} 2026
                </h3>
                <p className="text-xs text-slate-500">
                  Total desembolsado en este rubro:{' '}
                  <strong className="font-mono text-slate-900">
                    {formatUSD((mesActualData as any)[selectedCatModal] || 0)}
                  </strong>
                </p>
              </div>

              <button
                onClick={() => setSelectedCatModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Lista de proyectos */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Cuentas Auxiliares con desembolsos en {mesActualData.mesLabel}:
              </span>

              {proyectosAuditadosCat.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                  No se registraron movimientos en esta categoría para este mes.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {proyectosAuditadosCat.map((p) => (
                    <div
                      key={p.cuenta}
                      onClick={() => {
                        setSelectedCatModal(null);
                        if (onSelectProyecto) onSelectProyecto(p.cuenta);
                        else if (onGoToProyectos) onGoToProyectos();
                      }}
                      className="p-3 hover:bg-blue-50/60 transition-colors flex items-center justify-between gap-3 cursor-pointer group"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs bg-slate-100 text-blue-700 px-2 py-0.5 rounded-md border border-slate-200 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            {p.cuenta}
                          </span>
                          <span className="text-xs font-bold text-slate-800 truncate">
                            {CUENTAS_CORTAS_MAP[p.cuenta] || p.cuenta}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate max-w-md">
                          {p.desc}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-mono font-black text-slate-900 text-sm block">
                          {formatUSD(p.monto)}
                        </span>
                        <span className="text-[10px] font-mono text-blue-700 font-bold">
                          {p.pct.toFixed(1)}% del rubro
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer del Modal */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
              <span className="text-slate-400 text-[11px]">
                Haz clic en cualquier proyecto para abrir su detalle completo
              </span>
              <button
                onClick={() => setSelectedCatModal(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold transition-colors cursor-pointer"
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
