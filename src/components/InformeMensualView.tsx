import React, { useState, useMemo, useEffect } from 'react';
import { useCostos } from '../context/CostosContext';
import { formatCurrency, formatNumber, formatUnitPriceRaw } from '../utils/dateHelpers';
import { TABLA_PPT_DISTRIBUCION_2026, TOTALES_MESES_PPT, CUENTAS_AUXILIARES_EXACTAS_AGOSTO_2026, CUENTAS_AUXILIARES_EXACTAS_SEPTIEMBRE_2026 } from '../data/mockCostosTimaca';
import { exportSalidasToExcel } from '../utils/excelHandler';
import { TimacaLogo } from './TimacaLogo';
import { 
  FileText, 
  Printer, 
  Presentation, 
  ChevronLeft, 
  ChevronRight, 
  TrendingUp, 
  Briefcase, 
  Layers, 
  CalendarRange, 
  AlertTriangle, 
  CheckCircle2,
  Save,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  ArrowLeft,
  Users,
  Truck,
  Wrench,
  ShieldCheck,
  BarChart3,
  BarChart2,
  PieChart as PieIcon,
  Activity,
  Target,
  Sparkles,
  Info
} from 'lucide-react';
import { GraficaMensualEvolucion } from './GraficaMensualEvolucion';
import { 
  TABLA_SERVICIOS_DIRECTOS_PELLAS_OFICIAL, 
  TOTALES_SERVICIOS_DIRECTOS_PELLAS, 
  ANALISIS_SERVICIOS_DIRECTOS_PELLAS 
} from '../data/mockServiciosDirectosPellas';
import { 
  TABLA_HORAS_MAQUINA_PELLAS_OFICIAL, 
  TOTALES_HORAS_MAQUINA_PELLAS, 
  NOTAS_HORAS_MAQUINA_PELLAS 
} from '../data/mockHorasMaquinaPellas';
import { calcularUsoPresupuesto, getPresupuestoPorCuenta } from '../data/presupuestosOficiales';
import { MATRIZ_REAL_PROYECTOS_MENSUAL_2026 } from '../data/realProyectosMensual2026';

interface InformeMensualViewProps {
  onVolver?: () => void;
  onSwitchToInternos?: () => void;
}

export const InformeMensualView: React.FC<InformeMensualViewProps> = ({ onVolver, onSwitchToInternos }) => {
  const {
    resumenMeses,
    resumenProyectos,
    resumenSemanas,
    salidas,
  } = useCostos();

  // Active month for the report (defaults to latest month = Septiembre)
  const [selectedMesNum, setSelectedMesNum] = useState<number>(() => {
    return resumenMeses.length > 0 ? resumenMeses[resumenMeses.length - 1].mes : 9;
  });
  const [viewMode, setViewMode] = useState<'diapositivas' | 'documento'>('diapositivas');
  const [currentSlide, setCurrentSlide] = useState<number>(0); // Default to Slide 0 (Portada Oficial)
  const [slide1Tab, setSlide1Tab] = useState<'grafica' | 'tabla'>('grafica');
  const [slide2Tab, setSlide2Tab] = useState<'distribucion' | 'waterfall' | 'kpi'>('distribucion');
  const [slide3Tab, setSlide3Tab] = useState<'pareto' | 'tabla'>('pareto');
  const [slide4Tab, setSlide4Tab] = useState<'variaciones' | 'mixProcura'>('variaciones');
  const [slide5Tab, setSlide5Tab] = useState<'contrato' | 'evolucion'>('contrato');
  const [slide6Tab, setSlide6Tab] = useState<'servicios' | 'horasMaquina'>('servicios');
  const [slide7Tab, setSlide7Tab] = useState<'prorrateo' | 'subconceptos'>('prorrateo');
  const [slide8Tab, setSlide8Tab] = useState<'semaforo' | 'notas'>('semaforo');

  // Month object
  const activeMonth = useMemo(() => {
    return resumenMeses.find(m => m.mes === selectedMesNum) || resumenMeses[resumenMeses.length - 1];
  }, [resumenMeses, selectedMesNum]);

  // Previous month object for comparative variations
  const mesAnterior = useMemo(() => {
    if (selectedMesNum <= 1) return null;
    return resumenMeses.find(m => m.mes === selectedMesNum - 1) || null;
  }, [resumenMeses, selectedMesNum]);

  // Salidas belonging to the active month
  const salidasMes = useMemo(() => {
    if (!activeMonth) return [];
    return salidas.filter(s => s.mes === activeMonth.mes);
  }, [salidas, activeMonth]);

  // Overall monthly variation % vs previous month
  const variacionTotalMes = useMemo(() => {
    if (!mesAnterior || mesAnterior.totalMonto === 0) return 0;
    return Math.round(((activeMonth.totalMonto - mesAnterior.totalMonto) / mesAnterior.totalMonto) * 100);
  }, [activeMonth, mesAnterior]);

  // Cuentas Auxiliares / Proyectos activos en el mes ordenados por monto de mayor a menor
  const cuentasAuxiliaresMes = useMemo(() => {
    if (selectedMesNum === 8) {
      return CUENTAS_AUXILIARES_EXACTAS_AGOSTO_2026.map((item, idx) => ({
        idx: idx + 1,
        codigo: item.cuentaAuxiliar,
        proyecto: item.proyecto,
        total: item.montoAgosto,
        porcentaje: item.porcentaje,
        salidasCount: 5
      }));
    }
    if (selectedMesNum === 9) {
      return CUENTAS_AUXILIARES_EXACTAS_SEPTIEMBRE_2026.map((item, idx) => ({
        idx: idx + 1,
        codigo: item.cuentaAuxiliar,
        proyecto: item.proyecto,
        total: item.montoSeptiembre,
        porcentaje: item.porcentaje,
        salidasCount: 5
      }));
    }

    const mapa = new Map<string, { codigo: string; proyecto: string; total: number; salidasCount: number }>();
    salidasMes.forEach(s => {
      const cod = s.cuentaAuxiliarCodigo || s.proyecto;
      const cur = mapa.get(cod) || { codigo: cod, proyecto: s.cuentaAuxiliarNombre || s.proyecto, total: 0, salidasCount: 0 };
      cur.total += s.montoTotal;
      cur.salidasCount += 1;
      mapa.set(cod, cur);
    });

    const monthTotal = activeMonth?.totalMonto || 1;
    return Array.from(mapa.values())
      .map((data, idx) => ({
        idx: idx + 1,
        codigo: data.codigo,
        proyecto: data.proyecto,
        total: data.total,
        salidasCount: data.salidasCount,
        porcentaje: Math.round((data.total / monthTotal) * 1000) / 10,
      }))
      .sort((a, b) => b.total - a.total)
      .map((item, idx) => ({ ...item, idx: idx + 1 }));
  }, [salidasMes, activeMonth, selectedMesNum]);

  // Métricas de Presupuesto Oficial TIMACA para cada cuenta auxiliar activa
  const cuentasPresupuestoMetrics = useMemo(() => {
    let totalPresupuestoConsolidado = 0;
    let totalEjecutadoConPresupuesto = 0;

    const items = cuentasAuxiliaresMes.map((c) => {
      const realData = MATRIZ_REAL_PROYECTOS_MENSUAL_2026[c.codigo];
      const acumuladoAnual = realData ? realData.totalAnual : c.total;
      const metricas = calcularUsoPresupuesto(c.codigo, acumuladoAnual);

      if (metricas.tienePresupuesto) {
        totalPresupuestoConsolidado += metricas.totalPresupuesto;
        totalEjecutadoConPresupuesto += acumuladoAnual;
      }

      return {
        ...c,
        acumuladoAnual,
        metricas
      };
    });

    const pctUsoGlobal = totalPresupuestoConsolidado > 0 
      ? Math.round((totalEjecutadoConPresupuesto / totalPresupuestoConsolidado) * 1000) / 10 
      : 0;

    return {
      items,
      totalPresupuestoConsolidado,
      totalEjecutadoConPresupuesto,
      pctUsoGlobal
    };
  }, [cuentasAuxiliaresMes]);

  // 5 Categorías Oficiales calculadas para el mes seleccionado
  const categoriasMesAnalisis = useMemo(() => {
    const mIdx = Math.max(0, Math.min(TABLA_PPT_DISTRIBUCION_2026[0].meses.length - 1, selectedMesNum - 1));
    const prevIdx = mIdx > 0 ? mIdx - 1 : null;
    return TABLA_PPT_DISTRIBUCION_2026.map(cat => {
      const monto = cat.meses[mIdx];
      const montoPrev = prevIdx !== null ? cat.meses[prevIdx] : monto;
      const diff = monto - montoPrev;
      const varPct = prevIdx !== null && montoPrev > 0 ? Math.round((diff / montoPrev) * 100) : 0;
      return {
        categoria: cat.categoria,
        monto,
        montoPrev,
        varPct,
        esPositiva: varPct > 0,
        esNegativa: varPct < 0,
        varText: varPct > 0 ? `+${varPct}%` : `${varPct}%`
      };
    });
  }, [selectedMesNum]);

  // Megaproyecto Pellas Línea 1 metrics for the selected month
  const pellasMesData = useMemo(() => {
    if (selectedMesNum === 8) {
      return {
        montoMes: 516344,
        porcentajeMes: 44.4,
        acumulado2026: 1762730,
        cuadrilla: 238,
        nominaMes: 133184,
        horasMaquina: 1396
      };
    }
    if (selectedMesNum === 9) {
      return {
        montoMes: 305289,
        porcentajeMes: 29.3,
        acumulado2026: 2068019,
        cuadrilla: 254,
        nominaMes: 198950,
        horasMaquina: 0
      };
    }
    const salidasPellas = salidasMes.filter(s => s.cuentaAuxiliarCodigo === 'TTE-C-0706');
    const montoMes = salidasPellas.reduce((acc, s) => acc + s.montoTotal, 0) || Math.round((activeMonth?.totalMonto || 1000000) * 0.44);
    const porcentajeMes = Math.round((montoMes / (activeMonth?.totalMonto || 1)) * 1000) / 10;
    
    // Acumulado hasta el mes seleccionado
    const salidasPellasHastaMes = salidas.filter(s => s.cuentaAuxiliarCodigo === 'TTE-C-0706' && s.mes <= selectedMesNum);
    const acumulado = salidasPellasHastaMes.reduce((acc, s) => acc + s.montoTotal, 0) || Math.round(montoMes * selectedMesNum * 0.95);
    
    return {
      montoMes,
      porcentajeMes,
      acumulado2026: acumulado,
      cuadrilla: Math.round(180 + (selectedMesNum * 7.5)),
      nominaMes: Math.round(montoMes * 0.258),
      horasMaquina: Math.round(1000 + (selectedMesNum * 50))
    };
  }, [selectedMesNum, salidasMes, salidas, activeMonth]);

  // Notes/Observations written by Alejandra for the monthly report (saved per month)
  const storageNoteKey = `TIMACA_INFORME_NOTAS_MES_${selectedMesNum}`;
  const [notasGestion, setNotasGestion] = useState<string>('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(storageNoteKey);
    if (saved) {
      setNotasGestion(saved);
    } else {
      if (selectedMesNum === 8) {
        setNotasGestion(
          `Para el mes de agosto de 2026, el gasto consolidado oficial en proyectos externos cerró en $1.065.130,00 USD, manteniendo una rigurosa disciplina de costos y avance en 51 frentes activos.\n\n` +
          `La ejecución estuvo fuertemente liderada por Línea 1 Pellas ($516.652 USD), Segunda Línea PMH ($189.095 USD), Bandas PMH ($92.438 USD) y Briquetas Fase 2 ($79.809 USD).\n\n` +
          `En cuanto a las categorías: Materiales Directos totalizó $371.927 USD, Mano de Obra Directa $277.936 USD, Costos Indirectos $207.508 USD, Servicios $117.970 USD y Horas Máquina $89.789 USD.`
        );
      } else if (selectedMesNum === 9) {
        setNotasGestion(
          `Para el mes de septiembre de 2026, el gasto consolidado oficial en proyectos externos cerró en $1.402.251,00 USD (+32% vs agosto), acumulando un total anual consolidado de $11.708.732,00 USD en los 9 meses de 2026.\n\n` +
          `La ejecución estuvo liderada por el megaproyecto Recuperación de Línea 1 de Planta de Pellas (TTE-C-0706) con $609.028 USD (43,4% del mes), Segunda Línea PMH ($281.101 USD / 20,0%), Repotenciación de Rueda de Cangilones DRAVO ($199.356 USD / 14,2%), Briquetas Fase 2 ($139.623 USD / 10,0%) y Caldera Briquetas ($65.089 USD / 4,6%).\n\n` +
          `La categoría Materiales Directos creció a $868.067 USD (+133% vs agosto) por intensificación de suministros y acero estructural, Mano de Obra Directa se situó en $196.666 USD, Costos Indirectos auditados en $205.120 USD, Servicios en $76.820 USD y Horas Máquina en $55.578 USD.`
        );
      } else {
        const mesNombre = activeMonth?.mesLabel || `Mes ${selectedMesNum}`;
        const totalFmt = formatCurrency(activeMonth?.totalMonto || 0);
        const top1 = cuentasAuxiliaresMes[0]?.proyecto || 'Línea 1 Pellas';
        const top1Monto = formatCurrency(cuentasAuxiliaresMes[0]?.total || 0);
        const top1Pct = cuentasAuxiliaresMes[0]?.porcentaje || 0;
        const top2 = cuentasAuxiliaresMes[1]?.proyecto || 'Segunda Línea PMH';
        const top2Monto = formatCurrency(cuentasAuxiliaresMes[1]?.total || 0);
        
        setNotasGestion(
          `Para el período correspondiente a ${mesNombre}, el gasto operativo consolidado en proyectos externos se situó en ${totalFmt}, distribuidos en ${cuentasAuxiliaresMes.length} cuentas auxiliares activas.\n\n` +
          `El proyecto con mayor ejecución fue ${top1} con ${top1Monto} (${top1Pct}% del total mensual), seguido por ${top2} (${top2Monto}), manteniendo la tracción operacional requerida según el cronograma de taller y campo.\n\n` +
          `La distribución del costo por categorías se mantuvo alineada con las necesidades de procura y fuerza laboral directa, orientada a la máxima eficiencia operativa y al estricto cumplimiento de los tiempos de entrega e hitos de facturación con el cliente.`
        );
      }
    }
  }, [selectedMesNum, activeMonth, storageNoteKey, cuentasAuxiliaresMes]);

  const handleSaveNotas = () => {
    localStorage.setItem(storageNoteKey, notasGestion);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Slides structure matching user's authentic PowerPoint (dynamically titled)
  const slides = useMemo(() => [
    { id: 'portada', title: 'Portada · Informe Gestión de Costos' },
    { id: 'tabla-matriz', title: '1. Distribución Mensual por Categoría de Costo (Consolidado 2026)' },
    { id: 'analisis-mes', title: `2. Análisis de Costos del Mes (${activeMonth?.mesLabel})` },
    { id: 'proyectos-externos', title: `3. Total Proyectos Externos con Despachos (${activeMonth?.mesLabel})` },
    { id: 'variaciones-materiales', title: `4. Variaciones en Proyectos y Top Despachos (${activeMonth?.mesLabel})` },
    { id: 'pellas-general', title: `5. Megaproyecto Pellas Línea 1 (TTE-C-0706) · ${activeMonth?.mesLabel}` },
    { id: 'pellas-servicios-equipos', title: '6. Pellas Línea 1 · Servicios Directos y Horas Máquina' },
    { id: 'costos-indirectos-prorrateo', title: `7. Costos Indirectos y Prorrateo por Área (${activeMonth?.mesLabel})` },
    { id: 'conclusiones', title: '8. Conclusiones y Control de Gestión' }
  ], [activeMonth]);

  const handlePrint = () => {
    window.print();
  };

  const mesesHeaders = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep'];

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-white p-5 rounded-xl border border-neutral-200 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
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
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900 tracking-tight">
                Informe Ejecutivo Mensual · Modelo Estrella TIMACA
              </h2>
              <p className="text-xs text-neutral-500">
                Estructura oficial del PowerPoint · Pilar en Proyectos Externos y Cuentas Auxiliares
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {onSwitchToInternos && (
            <button
              onClick={onSwitchToInternos}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 font-bold text-xs flex items-center gap-1.5 transition-colors border border-slate-700 cursor-pointer shadow-2xs"
              title="Cambiar al Informe Oficial de Proyectos Internos (10 Láminas)"
            >
              <Presentation className="w-3.5 h-3.5 text-sky-400" />
              <span>Ver PPT Internos (10 Láminas)</span>
            </button>
          )}

          {/* Select month */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-neutral-600">Mes del Informe:</span>
            <select
              value={selectedMesNum}
              onChange={(e) => {
                setSelectedMesNum(Number(e.target.value));
              }}
              className="text-xs font-bold text-neutral-900 bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500"
            >
              {resumenMeses.map((m) => (
                <option key={m.mes} value={m.mes}>
                  {m.mesLabel}
                </option>
              ))}
            </select>
          </div>

          {/* Toggle between Slides view and Document view */}
          <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('diapositivas')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                viewMode === 'diapositivas'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Presentation className="w-3.5 h-3.5" />
              <span>Modo Diapositivas</span>
            </button>
            <button
              onClick={() => setViewMode('documento')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                viewMode === 'documento'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Dossier Completo</span>
            </button>
          </div>

          {/* Download Excel Button */}
          <button
            onClick={() => exportSalidasToExcel(salidas, resumenSemanas, resumenMeses, resumenProyectos)}
            title="Descargar datos del informe en formato Excel (.xlsx)"
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 rounded-lg hover:bg-emerald-100 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-emerald-700" />
            <span>Descargar Excel</span>
          </button>

          {/* Print / PDF Button */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-neutral-800 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-neutral-600" />
            <span>Imprimir / PDF</span>
          </button>
        </div>
      </div>

      {/* VIEW MODE 1: MODO DIAPOSITIVAS (PRESENTACIÓN EXACTA POWERPOINT) */}
      {viewMode === 'diapositivas' ? (
        <div className="space-y-4">
          {/* Selector Rápido de Lámina (Desglosado de Láminas Idéntico a Internos) */}
          <div className="bg-white rounded-2xl p-2.5 border border-slate-200/90 shadow-xs flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
            {slides.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setCurrentSlide(idx)}
                className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                  currentSlide === idx
                    ? 'bg-[#0b2545] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
                title={s.title}
              >
                {idx === 0 ? 'Portada' : `Lámina ${idx}`}
              </button>
            ))}
          </div>

          <div className="bg-slate-50 text-slate-800 rounded-2xl p-5 sm:p-7 min-h-[580px] flex flex-col justify-between shadow-md border border-slate-200 relative">
            
            {/* Top Bar of Slide (visible from Slide 1 onwards) */}
            {currentSlide > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-3 mb-2">
                <div className="flex items-center gap-3">
                  <TimacaLogo size="sm" showSubtitle={false} showRif={false} />
                  <span className="font-bold text-[11px] bg-[#0b2545] px-2.5 py-1 rounded text-white tracking-wider shadow-2xs">
                    DIAPOSITIVA {currentSlide} DE {slides.length - 1}
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    Informe de Costos · {activeMonth?.mesLabel}
                  </span>
                </div>
                <span className="text-sm font-extrabold text-[#0b2545]">
                  {slides[currentSlide].title}
                </span>
              </div>
            )}

            {/* SLIDE 0: PORTADA OFICIAL POWERPOINT TIMACA */}
            {currentSlide === 0 && (
              <div className="relative overflow-hidden rounded-2xl min-h-[520px] flex flex-col justify-between p-6 sm:p-10 text-slate-900 bg-white border border-slate-300 shadow-xl my-auto">
                {/* Header / Brand */}
                <div className="relative z-10 flex items-center justify-between border-b border-slate-200 pb-4">
                  <div className="flex items-center gap-3.5">
                    <TimacaLogo size="md" showSubtitle={false} showRif={false} />
                    <div>
                      <span className="text-xs font-black tracking-widest text-[#002060] uppercase block">
                        TIMACA · Modelo Estrella
                      </span>
                      <span className="text-[11px] text-slate-600 font-semibold">
                        Talleres Industriales Metalúrgicos Antonio C.A.
                      </span>
                    </div>
                  </div>
                  <div className="hidden sm:block text-right">
                    <span className="text-xs font-mono font-bold px-3.5 py-1.5 rounded-full bg-slate-100 text-[#002060] border border-slate-300 shadow-2xs">
                      Presentación Ejecutiva Oficial
                    </span>
                  </div>
                </div>

                {/* Main Title Block (Exacto a la Lámina 1 de PowerPoint) */}
                <div className="relative z-10 py-6 text-center space-y-3 max-w-4xl mx-auto">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-50 border border-blue-200 text-[#002060] text-xs font-bold uppercase tracking-wider shadow-2xs">
                    <CalendarRange className="w-3.5 h-3.5 text-[#002060]" />
                    <span>Período Operativo: {activeMonth?.mesLabel?.toUpperCase() || 'SEPTIEMBRE 2026'}</span>
                  </div>
                  <h1 className="text-3xl sm:text-5xl font-black text-black tracking-tight leading-tight uppercase font-sans">
                    INFORME GESTIÓN DE COSTOS
                  </h1>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-700 tracking-wider uppercase">
                    {activeMonth?.mesLabel?.toUpperCase() || 'SEPTIEMBRE 2026'}
                  </h2>
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs font-mono text-slate-800">
                    <span className="bg-slate-50 px-3.5 py-1.5 rounded-lg border border-slate-300 shadow-2xs">
                      Ejecución del Mes: <strong className="text-[#002060] font-bold">{formatCurrency(activeMonth?.totalMonto || 0)}</strong>
                    </span>
                    <span className="bg-slate-50 px-3.5 py-1.5 rounded-lg border border-slate-300 shadow-2xs">
                      Acumulado 2026: <strong className="text-slate-950 font-bold">${TOTALES_MESES_PPT.filter(m => m.mesNum <= selectedMesNum).reduce((a, b) => a + b.total, 0).toLocaleString('de-DE')} USD</strong>
                    </span>
                    <span className="bg-slate-50 px-3.5 py-1.5 rounded-lg border border-slate-300 shadow-2xs">
                      Proyectos Activos: <strong className="text-slate-950 font-bold">{cuentasAuxiliaresMes.length} Cuentas Auxiliares</strong>
                    </span>
                  </div>
                </div>

                {/* Tira Fotográfica Continua Industrial (Idéntica a la Portada Oficial TIMACA) */}
                <div className="relative z-10 my-2 rounded-xl overflow-hidden border border-slate-300 shadow-md">
                  <img 
                    src="/ppt-assets/portada-banner-industrial.png" 
                    alt="TIMACA Instalaciones Industriales y Talleres" 
                    className="w-full h-auto object-cover max-h-44"
                  />
                </div>

                {/* Footer credits */}
                <div className="relative z-10 pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-700">
                  <div>
                    <span className="text-slate-500">Elaborado por: </span>
                    <strong className="text-slate-950 font-bold">Ing. Civil Alejandra Tesara</strong>
                    <span className="text-slate-500"> (Analista de Costos)</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Destinatario: </span>
                    <strong className="text-slate-950 font-bold">Gerencia de Administración y Finanzas / Departamento de Costos</strong>
                  </div>
                  <div className="text-slate-600 font-medium text-[11px]">
                    Puerto Ordaz, Venezuela
                  </div>
                </div>
              </div>
            )}

            {/* SLIDE 1: TABLA DE DISTRIBUCIÓN MENSUAL 2026 (SEGUNDA LÁMINA - MATRIZ CONSOLIDADA & GRÁFICA EVOLUTIVA) */}
            {currentSlide === 1 && (
              <div className="py-2 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                  <div>
                    <h2 className="text-2xl font-black text-[#0b2545] tracking-tight">
                      Distribución Mensual por Categoría de Costo (2026)
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Cifras consolidadas en USD · Modelo Estrella TIMACA · Total Acumulado Oficial: <strong className="text-[#0b2545]">$12.478.718 USD</strong> · Mes Activo: <strong className="text-amber-600 font-bold">{activeMonth?.mesLabel}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold shrink-0 shadow-2xs">
                    <button
                      onClick={() => setSlide1Tab('grafica')}
                      className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                        slide1Tab === 'grafica' ? 'bg-[#0b2545] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>Gráfica Evolutiva Anual</span>
                    </button>
                    <button
                      onClick={() => setSlide1Tab('tabla')}
                      className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                        slide1Tab === 'tabla' ? 'bg-[#0b2545] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Matriz Oficial (9 Meses)</span>
                    </button>
                  </div>
                </div>

                {slide1Tab === 'grafica' ? (
                  <div className="space-y-3 animate-fade-in">
                    <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs">
                      <GraficaMensualEvolucion onSelectMes={(idx) => setSelectedMesNum(idx + 1)} />
                    </div>

                    {/* 3 Callouts de Análisis Estratégico */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 space-y-1">
                        <strong className="text-[#0b2545] block font-bold flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                          Materiales Directos ($4.431.179 USD · 37,5%)
                        </strong>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          Columna vertebral de la procura física. Se mantiene en un promedio mensual de $492K USD, impulsado fuertemente por aceros estructurales, cables de fuerza e insumos de calderería.
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-orange-50/70 border border-orange-200 space-y-1">
                        <strong className="text-orange-950 block font-bold flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                          Servicios Especializados ($3.059.088 USD · 25,9%)
                        </strong>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          Concentró un pico en junio ($1.645.192 USD) por importaciones marítimas mayores. En agosto y septiembre se normaliza al régimen base operativo ($92K - $118K USD).
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                        <strong className="text-emerald-950 block font-bold flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                          Mano de Obra Directa ($2.773.572 USD · 23,5%)
                        </strong>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          Fuerza laboral técnica devengada sin retrasos de nómina. En septiembre cerró en $351.891 USD (61.866 HH devengadas), respaldada por cuadrillas de taller y montaje.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-xs bg-white animate-fade-in">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-[#0b2545] text-white font-bold border-b border-[#081c33]">
                          <th className="py-2.5 px-3 min-w-[170px]">Distribución</th>
                          {mesesHeaders.map((m, idx) => (
                            <th 
                              key={m} 
                              className={`py-2.5 px-3 text-right transition-colors ${
                                idx + 1 === selectedMesNum 
                                  ? 'bg-amber-400 text-[#0b2545] font-black' 
                                  : ''
                              }`}
                            >
                              {m}
                            </th>
                          ))}
                          <th className="py-2.5 px-3 text-right bg-[#081c33]">Total 2026</th>
                          <th className="py-2.5 px-3 text-center bg-[#081c33]">Variación</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                        {TABLA_PPT_DISTRIBUCION_2026.map((row) => (
                          <tr key={row.categoria} className="hover:bg-blue-50/40 transition-colors">
                            <td className="py-2 px-3 font-bold text-slate-900">{row.categoria}</td>
                            {row.meses.map((val, idx) => (
                              <td 
                                key={idx} 
                                className={`py-2 px-3 text-right font-mono tabular-nums transition-colors ${
                                  idx + 1 === selectedMesNum 
                                    ? 'bg-amber-50 text-[#0b2545] font-black border-x border-amber-200' 
                                    : 'text-slate-700'
                                }`}
                              >
                                {val.toLocaleString('de-DE')}
                              </td>
                            ))}
                            <td className="py-2 px-3 text-right font-mono tabular-nums font-black text-[#0b2545] bg-blue-50/50">
                              {row.total2026.toLocaleString('de-DE')}
                            </td>
                            <td className="py-2 px-3 text-center font-mono font-bold text-xs bg-blue-50/30">
                              <span className={row.esPositiva ? 'text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded' : row.variacionNum < 0 ? 'text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded' : 'text-slate-600'}>
                                {row.variacionNum > 0 ? '▲ ' : row.variacionNum < 0 ? '▼ ' : '▼ '}
                                {row.variacion}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-[#0b2545] text-white font-black border-t-2 border-[#0b2545]">
                          <td className="py-2.5 px-3">Total</td>
                          {TOTALES_MESES_PPT.map((tm, idx) => (
                            <td 
                              key={tm.mesNum} 
                              className={`py-2.5 px-3 text-right font-mono tabular-nums text-xs transition-colors ${
                                idx + 1 === selectedMesNum 
                                  ? 'bg-amber-400 text-[#0b2545] font-black' 
                                  : ''
                              }`}
                            >
                              {tm.total.toLocaleString('de-DE')}
                            </td>
                          ))}
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums text-xs text-amber-300">
                            {TOTALES_MESES_PPT.reduce((a, b) => a + b.total, 0).toLocaleString('de-DE')}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono text-xs text-amber-300">
                            ▼ 2%
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* SLIDE 2: ANÁLISIS DE COSTOS DEL MES Y VARIACIONES */}
            {currentSlide === 2 && (
              <div className="py-2 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div>
                    <h2 className="text-2xl font-black text-[#0b2545] tracking-tight">
                      Costos Proyectos Externos · Análisis de {activeMonth?.mesLabel}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {selectedMesNum === 8 ? (
                        <>Gasto mensual auditado de <strong className="text-[#0b2545]">$1,07M USD ($1.065.130 USD)</strong> con 51 frentes activos y tracción sostenida en Línea 1 Pellas ($517K) y 2da Línea PMH ($189K).</>
                      ) : selectedMesNum === 9 ? (
                        <>Cierre Consolidado (<strong className="text-emerald-700">+32%</strong>): El gasto del mes se situó en <strong className="text-[#0b2545]">$1,40M USD ($1.402.251 USD)</strong>, acumulando <strong className="text-blue-900">$11.708.732 USD</strong> en el ejercicio 2026 con aceleración en Línea 1 Pellas ($609K), 2da Línea PMH ($281K) y DRAVO ($199K).</>
                      ) : selectedMesNum > 1 ? (
                        <>Ejecución mensual de <strong className="text-[#0b2545]">{formatCurrency(activeMonth?.totalMonto || 0)}</strong> ({variacionTotalMes >= 0 ? `+${variacionTotalMes}%` : `${variacionTotalMes}%`} respecto a {mesAnterior?.mesLabel?.split(' ')[0]}) con {cuentasAuxiliaresMes.length} cuentas activas.</>
                      ) : (
                        <>Ejecución mensual de apertura de ejercicio de <strong className="text-[#0b2545]">{formatCurrency(activeMonth?.totalMonto || 0)}</strong> con {cuentasAuxiliaresMes.length} cuentas auxiliares activas.</>
                      )}
                    </p>
                  </div>

                  {/* Tabs Switcher for Slide 2 */}
                  <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
                    <button
                      onClick={() => setSlide2Tab('distribucion')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        slide2Tab === 'distribucion'
                          ? 'bg-[#0b2545] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                      }`}
                    >
                      <PieIcon className="w-3.5 h-3.5" />
                      <span>Distribución Donut</span>
                    </button>
                    <button
                      onClick={() => setSlide2Tab('waterfall')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        slide2Tab === 'waterfall'
                          ? 'bg-[#0b2545] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                      }`}
                    >
                      <Activity className="w-3.5 h-3.5" />
                      <span>Puente Variación (Waterfall)</span>
                    </button>
                    <button
                      onClick={() => setSlide2Tab('kpi')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        slide2Tab === 'kpi'
                          ? 'bg-[#0b2545] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Tarjetas & Banners</span>
                    </button>
                  </div>
                </div>

                {/* TAB 1: DISTRIBUCIÓN POR DONUT CHART & SCORECARD */}
                {slide2Tab === 'distribucion' && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                      {/* Left: SVG Donut Chart */}
                      <div className="lg:col-span-5 flex flex-col items-center justify-center p-3 border-b lg:border-b-0 lg:border-r border-slate-100">
                        <div className="relative w-56 h-56 flex items-center justify-center">
                          {(() => {
                            const total = activeMonth?.totalMonto || 1;
                            const radius = 68;
                            const circ = 2 * Math.PI * radius;
                            let accOffset = 0;
                            const palette = ['#002060', '#ea580c', '#059669', '#d97706', '#6366f1'];

                            return (
                              <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                                <circle
                                  cx="100"
                                  cy="100"
                                  r={radius}
                                  fill="transparent"
                                  stroke="#f1f5f9"
                                  strokeWidth="24"
                                />
                                {categoriasMesAnalisis.map((cat, i) => {
                                  const pct = cat.monto / total;
                                  const dash = pct * circ;
                                  const offset = accOffset;
                                  accOffset += dash;
                                  if (cat.monto <= 0) return null;
                                  return (
                                    <circle
                                      key={cat.categoria}
                                      cx="100"
                                      cy="100"
                                      r={radius}
                                      fill="transparent"
                                      stroke={palette[i % palette.length]}
                                      strokeWidth="24"
                                      strokeDasharray={`${dash} ${circ - dash}`}
                                      strokeDashoffset={-offset}
                                      strokeLinecap="round"
                                      className="transition-all duration-500 hover:opacity-85 cursor-pointer"
                                    />
                                  );
                                })}
                              </svg>
                            );
                          })()}

                          {/* Donut Center Info */}
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                            <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400">Total Mes</span>
                            <span className="text-xl font-black text-[#0b2545] font-mono leading-tight">
                              ${Math.round(activeMonth?.totalMonto || 0).toLocaleString('de-DE')}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500">USD · {activeMonth?.mesLabel?.split(' ')[0]}</span>
                          </div>
                        </div>

                        <div className="mt-3 text-center">
                          <span className="text-xs font-semibold text-slate-500">
                            Estructura de Costo Directo e Indirecto ({activeMonth?.mesLabel})
                          </span>
                        </div>
                      </div>

                      {/* Right: Detailed Breakdown List */}
                      <div className="lg:col-span-7 space-y-2.5">
                        <div className="flex items-center justify-between pb-1 border-b border-slate-100 text-xs font-bold text-slate-500">
                          <span>Categoría de Costo</span>
                          <div className="flex items-center gap-6">
                            <span>Monto USD</span>
                            <span className="w-16 text-right">% Mes</span>
                            <span className="w-16 text-center">Variación</span>
                          </div>
                        </div>

                        {categoriasMesAnalisis.map((cat, i) => {
                          const total = activeMonth?.totalMonto || 1;
                          const pct = Math.round((cat.monto / total) * 1000) / 10;
                          const palette = ['#002060', '#ea580c', '#059669', '#d97706', '#6366f1'];
                          const color = palette[i % palette.length];

                          return (
                            <div 
                              key={cat.categoria}
                              className="p-2.5 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50/50 transition-all flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs" style={{ backgroundColor: color }} />
                                <div>
                                  <strong className="text-xs font-bold text-slate-900 block truncate">
                                    {cat.categoria}
                                  </strong>
                                  <span className="text-[10.5px] text-slate-500">
                                    {i === 0 ? 'Procura de acero, electricidad e insumos' :
                                     i === 1 ? 'Servicios especializados y subcontratistas' :
                                     i === 2 ? 'Fuerza técnica devengada por días hábiles' :
                                     i === 3 ? 'Equipos y grúas de izaje industrial' :
                                     'Nómina soporte, talleres y estructura'}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-6 shrink-0 font-mono">
                                <span className="text-xs font-bold text-slate-900">
                                  ${cat.monto.toLocaleString('de-DE')}
                                </span>
                                <span className="text-xs font-semibold text-slate-600 w-16 text-right">
                                  {pct}%
                                </span>
                                <span className={`text-[11px] font-bold w-16 text-center px-1.5 py-0.5 rounded border ${
                                  cat.esPositiva 
                                    ? 'text-emerald-700 bg-emerald-50 border-emerald-200' 
                                    : cat.esNegativa 
                                    ? 'text-amber-700 bg-amber-50 border-amber-200' 
                                    : 'text-slate-600 bg-slate-100 border-slate-200'
                                }`}>
                                  {selectedMesNum === 1 ? 'Base' : cat.varText}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Strategic Key takeaway */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-950 flex items-start gap-2.5">
                        <Sparkles className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block font-bold mb-0.5">Focalización en Costos Directos (84,1%):</strong>
                          <span>Materiales Directos (${categoriasMesAnalisis[0].monto.toLocaleString('de-DE')} USD · 50,3%) y Mano de Obra Directa (${categoriasMesAnalisis[2].monto.toLocaleString('de-DE')} USD · 33,8%) concentran la casi totalidad del flujo financiero, confirmando que el gasto está estrictamente orientado al avance físico en campo.</span>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 flex items-start gap-2.5">
                        <Target className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block font-bold mb-0.5">Control de Tercerización y Soporte:</strong>
                          <span>Los Servicios Especializados ($92.273 USD · 8,9%) y Costos Indirectos ($73.000 USD · 7,0%) se mantienen en mínimos racionales tras las absorciones de importaciones mayores del primer semestre, optimizando el margen operativo corporativo.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: WATERFALL (PUENTE DE VARIACIÓN MENSUAL) */}
                {slide2Tab === 'waterfall' && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                        <div>
                          <h3 className="text-sm font-black text-[#0b2545] uppercase tracking-wider flex items-center gap-1.5">
                            <Activity className="w-4 h-4 text-blue-600" />
                            Puente de Variación Financiera (Waterfall Chart)
                          </h3>
                          <p className="text-xs text-slate-500">
                            Explicación del delta de ${Math.abs((activeMonth?.totalMonto || 0) - (mesAnterior?.totalMonto || 0)).toLocaleString('de-DE')} USD entre {mesAnterior?.mesLabel?.split(' ')[0] || 'Mes Anterior'} y {activeMonth?.mesLabel?.split(' ')[0]}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 text-xs font-mono">
                          <span className="flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded-xs bg-[#002060]" /> Base / Cierre
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600" /> Incremento (+)
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded-xs bg-amber-600" /> Reducción (-)
                          </span>
                        </div>
                      </div>

                      {/* Pure SVG Waterfall Chart */}
                      <div className="pt-4 overflow-x-auto">
                        {(() => {
                          const prevTotal = mesAnterior?.totalMonto || 1065130;
                          const currTotal = activeMonth?.totalMonto || 1402251;

                          // Compute individual category deltas
                          const steps = [
                            { label: `Base (${mesAnterior?.mesLabel?.split(' ')[0] || 'Ago'})`, delta: prevTotal, isTotal: true, color: '#002060' },
                            ...categoriasMesAnalisis.map(cat => {
                              const delta = cat.monto - cat.montoPrev;
                              return {
                                label: cat.categoria.replace(' Directos', '').replace(' Directa', '').replace(' Indirectos', ''),
                                delta,
                                isTotal: false,
                                color: delta >= 0 ? '#059669' : '#d97706'
                              };
                            }),
                            { label: `Cierre (${activeMonth?.mesLabel?.split(' ')[0]})`, delta: currTotal, isTotal: true, color: '#002060' }
                          ];

                          const maxVal = Math.max(prevTotal, currTotal) * 1.15;
                          const chartHeight = 220;
                          const chartWidth = 720;
                          const barWidth = 64;
                          const colSpacing = chartWidth / steps.length;

                          let currentYVal = 0;

                          return (
                            <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 50}`} className="w-full h-64 text-xs font-mono">
                              {/* Grid lines */}
                              {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                                const y = chartHeight - (pct * chartHeight);
                                const val = Math.round((pct * maxVal) / 1000) * 1000;
                                return (
                                  <g key={idx}>
                                    <line x1="30" y1={y} x2={chartWidth} y2={y} stroke="#f1f5f9" strokeDasharray="3 3" />
                                    <text x="25" y={y + 4} textAnchor="end" fill="#94a3b8" fontSize="9">
                                      ${Math.round(val / 1000)}k
                                    </text>
                                  </g>
                                );
                              })}

                              {steps.map((s, idx) => {
                                const x = 40 + idx * colSpacing;
                                let y = 0;
                                let h = 0;
                                let prevLevel = currentYVal;

                                if (s.isTotal) {
                                  h = (s.delta / maxVal) * chartHeight;
                                  y = chartHeight - h;
                                  currentYVal = s.delta;
                                } else {
                                  const startVal = currentYVal;
                                  currentYVal += s.delta;
                                  const endVal = currentYVal;
                                  
                                  const topVal = Math.max(startVal, endVal);
                                  const bottomVal = Math.min(startVal, endVal);
                                  
                                  y = chartHeight - (topVal / maxVal) * chartHeight;
                                  h = Math.max(4, ((topVal - bottomVal) / maxVal) * chartHeight);
                                }

                                const prevConnectorY = chartHeight - (prevLevel / maxVal) * chartHeight;

                                return (
                                  <g key={idx} className="transition-all hover:opacity-90">
                                    {/* Connector dashed line to previous step */}
                                    {idx > 0 && !s.isTotal && (
                                      <line
                                        x1={x - (colSpacing - barWidth) / 2}
                                        y1={prevConnectorY}
                                        x2={x}
                                        y2={prevConnectorY}
                                        stroke="#cbd5e1"
                                        strokeDasharray="2 2"
                                      />
                                    )}

                                    {/* The Step Bar */}
                                    <rect
                                      x={x}
                                      y={y}
                                      width={barWidth}
                                      height={h}
                                      rx="6"
                                      fill={s.color}
                                      className="shadow-xs cursor-pointer"
                                    />

                                    {/* Value label on top of bar */}
                                    <text
                                      x={x + barWidth / 2}
                                      y={Math.max(16, y - 6)}
                                      textAnchor="middle"
                                      fontWeight="bold"
                                      fontSize="10"
                                      fill={s.isTotal ? '#0b2545' : s.delta >= 0 ? '#047857' : '#b45309'}
                                    >
                                      {s.isTotal 
                                        ? `$${Math.round(s.delta / 1000)}k` 
                                        : `${s.delta >= 0 ? '+' : ''}$${Math.round(s.delta / 1000)}k`}
                                    </text>

                                    {/* Step X-axis label */}
                                    <text
                                      x={x + barWidth / 2}
                                      y={chartHeight + 20}
                                      textAnchor="middle"
                                      fontSize="9"
                                      fontWeight="600"
                                      fill="#475569"
                                    >
                                      {s.label}
                                    </text>
                                  </g>
                                );
                              })}
                            </svg>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Explanatory notes of the waterfall */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <strong className="text-slate-900 block font-bold mb-1">Impacto Procura (+ $18K):</strong>
                        <p className="text-slate-600 text-[11px] leading-relaxed">
                          Materiales Directos subió a $524K impulsado por aceros estructurales para 2da Línea PMH y repuestos eléctricos de la rueda de cangilones DRAVO.
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <strong className="text-slate-900 block font-bold mb-1">Ajuste de Nómina (+ $58K):</strong>
                        <p className="text-slate-600 text-[11px] leading-relaxed">
                          La Mano de Obra subió a $351K debido a 5 semanas operativas devengadas (Sem 35 a 39) y el staff técnico continuo de Pellas Línea 1.
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <strong className="text-slate-900 block font-bold mb-1">Contracción CIF y HM (- $353K):</strong>
                        <p className="text-slate-600 text-[11px] leading-relaxed">
                          Fuerte optimización en soporte corporativo ($73K vs $336K) y cierre contable de horas máquina sin cargos en septiembre.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: TARJETAS & BANNERS OFICIALES */}
                {slide2Tab === 'kpi' && (
                  <div className="space-y-4 animate-fade-in">
                    {/* 4 Banners KPI Oficiales TIMACA */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
                      <div className="rounded-xl border border-slate-300 overflow-hidden shadow-xs">
                        <div className="bg-[#002060] text-white text-center font-bold text-xs py-1.5 px-2">
                          Total {activeMonth?.mesLabel?.split(' ')[0]}
                        </div>
                        <div className="bg-[#f0f4fa] text-center py-2.5 px-2">
                          <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
                            ${Math.round(activeMonth?.totalMonto || 0).toLocaleString('de-DE')}
                          </span>
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-300 overflow-hidden shadow-xs">
                        <div className="bg-[#002060] text-white text-center font-bold text-xs py-1.5 px-2">
                          Variación {activeMonth?.mesLabel?.split(' ')[0]}
                        </div>
                        <div className="bg-[#f0f4fa] text-center py-2.5 px-2">
                          <span className={`text-xl sm:text-2xl font-black font-mono ${
                            variacionTotalMes > 0 ? 'text-emerald-700' : variacionTotalMes < 0 ? 'text-amber-700' : 'text-slate-800'
                          }`}>
                            {variacionTotalMes > 0 ? '▲ +' : variacionTotalMes < 0 ? '▼ ' : ''}{variacionTotalMes}%
                          </span>
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-300 overflow-hidden shadow-xs">
                        <div className="bg-[#002060] text-white text-center font-bold text-xs py-1.5 px-2">
                          Nº Proyectos
                        </div>
                        <div className="bg-[#f0f4fa] text-center py-2.5 px-2">
                          <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
                            {cuentasAuxiliaresMes.length}
                          </span>
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-300 overflow-hidden shadow-xs">
                        <div className="bg-[#002060] text-white text-center font-bold text-xs py-1.5 px-2">
                          Total Acum 2026
                        </div>
                        <div className="bg-[#f0f4fa] text-center py-2.5 px-2">
                          <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
                            ${TOTALES_MESES_PPT.filter(m => m.mesNum <= selectedMesNum).reduce((a, b) => a + b.total, 0).toLocaleString('de-DE')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 5 Categorías Oficiales con variación */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-1">
                      {categoriasMesAnalisis.map((cat, idx) => (
                        <div key={cat.categoria} className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-700 truncate" title={cat.categoria}>{cat.categoria}</span>
                            <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded border ${
                              cat.esPositiva 
                                ? 'text-emerald-700 bg-emerald-50 border-emerald-200' 
                                : cat.esNegativa 
                                ? 'text-amber-700 bg-amber-50 border-amber-200' 
                                : 'text-slate-600 bg-slate-100 border-slate-200'
                            }`}>
                              {selectedMesNum === 1 ? 'Base' : cat.varText}
                            </span>
                          </div>
                          <span className="text-xl font-black font-mono text-[#0b2545] block">
                            ${cat.monto.toLocaleString('de-DE')} USD
                          </span>
                          <p className="text-[11px] text-slate-500 leading-snug">
                            {selectedMesNum === 8 ? (
                              idx === 0 ? 'Compras de Materiales Eléctricos ($133,5K) para repotenciación DRAVO ($53,6K) y Bandas ($44,1K). Acero al Carbono ($68,2K) para Segunda Línea PMH.' :
                              idx === 1 ? 'Fuerte contracción por el cierre de las importaciones mayores extraordinarias de junio y julio. Regresa al nivel base operativo.' :
                              idx === 2 ? 'Volumen estable: consolidación de horas-hombre al incorporar la nómina de la semana 31, manteniendo la fuerza laboral en frentes de montaje.' :
                              idx === 3 ? 'Impulsado por Línea 1 Pellas: mayor requerimiento de grúas y camiones para maniobras de izaje y transporte de estructuras pesadas.' :
                              'Estructura de costos indirectos del mes ($336.208 USD), integrando Nómina Interna ($125.000 USD), Nómina Talleres ($122.000 USD) y Sindicato ($57.000 USD).'
                            ) : selectedMesNum === 9 ? (
                              idx === 0 ? 'Despachos de procura focalizados en acero estructural y componentes para Segunda Línea PMH, Pellas y frentes de montaje ($524.340 USD).' :
                              idx === 1 ? 'Servicios especializados de QA/QC, ensayos no destructivos y fletes de obra para soporte operativo ($92.273 USD).' :
                              idx === 2 ? 'Nómina devengada por días hábiles trabajados ($351.891 USD, 61.866 HH): 5 semanas operativas (Sem 35 a 39) + Staff Pellas Línea 1.' :
                              idx === 3 ? 'Sin cargos de horas máquina en el cierre del mes según reporte consolidado de equipos ($0 USD).' :
                              'Costos indirectos y soporte corporativo de operaciones del período ($73.000 USD).'
                            ) : (
                              `${Math.round((cat.monto / (activeMonth?.totalMonto || 1)) * 100)}% del gasto mensual. ${
                                selectedMesNum > 1 
                                  ? `Mes anterior: $${cat.montoPrev.toLocaleString('de-DE')} USD.` 
                                  : 'Base inicial del presupuesto anual.'
                              }`
                            )}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-700 shrink-0" />
                      <span>
                        <strong>Comportamiento global ({activeMonth?.mesLabel}):</strong> {
                          selectedMesNum === 8 ? (
                            'Fuerte aceleración en suministros (+68%) compensada por una desaceleración planificada en servicios tercerizados (-69%), garantizando la estabilidad operativa del flujo financiero.'
                          ) : selectedMesNum === 9 ? (
                            'Cierre consolidado con ejecución de $1.041.504 USD (-23% vs agosto), con Materiales Directos ($524.340) y Mano de Obra Directa devengada ($351.891) como principales impulsores operativos.'
                          ) : (
                            `Ejecución mensual total de ${formatCurrency(activeMonth?.totalMonto || 0)}, con ${categoriasMesAnalisis[0].categoria} ($${categoriasMesAnalisis[0].monto.toLocaleString('de-DE')}) y ${categoriasMesAnalisis[2].categoria} ($${categoriasMesAnalisis[2].monto.toLocaleString('de-DE')}) como principales impulsores operativos.`
                          )
                        }
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SLIDE 3: TOTAL PROYECTOS EXTERNOS CON DESPACHOS */}
            {currentSlide === 3 && (
              <div className="py-2 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div>
                    <h2 className="text-2xl font-black text-[#0b2545] tracking-tight">
                      Total Proyectos Externos · Despachos {activeMonth?.mesLabel}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Pilar Fundamental TIMACA · Consolidado oficial de {cuentasAuxiliaresMes.length} Cuentas Auxiliares Activas
                    </p>
                  </div>

                  {/* Tabs Switcher for Slide 3 */}
                  <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
                    <button
                      onClick={() => setSlide3Tab('pareto')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        slide3Tab === 'pareto'
                          ? 'bg-[#0b2545] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                      }`}
                    >
                      <BarChart2 className="w-3.5 h-3.5" />
                      <span>Curva Pareto 80/20</span>
                    </button>
                    <button
                      onClick={() => setSlide3Tab('tabla')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        slide3Tab === 'tabla'
                          ? 'bg-[#0b2545] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Matriz de Cuentas & Presupuesto</span>
                    </button>
                  </div>
                </div>

                {/* TAB 1: PARETO 80/20 RANKING CHART */}
                {slide3Tab === 'pareto' && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                        <div>
                          <h3 className="text-sm font-black text-[#0b2545] uppercase tracking-wider flex items-center gap-1.5">
                            <Target className="w-4 h-4 text-amber-500" />
                            Ranking Pareto Top Proyectos ({activeMonth?.mesLabel})
                          </h3>
                          <p className="text-xs text-slate-500">
                            Regla 80/20: Concentración de inversión en los frentes operacionales más intensivos
                          </p>
                        </div>
                        <span className="text-xs font-mono font-bold px-3 py-1 bg-amber-50 text-amber-900 border border-amber-300 rounded-lg self-start sm:self-auto">
                          Top 4 Proyectos = 76,3% del Gasto Mensual
                        </span>
                      </div>

                      {/* Pareto Bars */}
                      <div className="pt-3 space-y-3">
                        {(() => {
                          const totalMes = activeMonth?.totalMonto || 1;
                          const topItems = cuentasAuxiliaresMes.slice(0, 7);
                          let runningAccum = 0;

                          return topItems.map((item, idx) => {
                            runningAccum += item.total;
                            const accumPct = Math.round((runningAccum / totalMes) * 1000) / 10;
                            const singlePct = Math.round((item.total / totalMes) * 1000) / 10;
                            const isUnder80 = accumPct <= 82;

                            return (
                              <div key={item.codigo} className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold text-[10.5px] ${
                                      idx < 3 ? 'bg-[#002060] text-amber-300' : 'bg-slate-200 text-slate-700'
                                    }`}>
                                      {idx + 1}
                                    </span>
                                    <strong className="text-slate-900 font-mono">{item.codigo}</strong>
                                    <span className="text-slate-600 truncate max-w-xs sm:max-w-md" title={item.proyecto}>
                                      {item.proyecto}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-4 shrink-0 font-mono">
                                    <span className="font-bold text-slate-900">${item.total.toLocaleString('de-DE')}</span>
                                    <span className="text-slate-500 text-[11px] w-12 text-right">{singlePct}%</span>
                                    <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded border w-24 text-center ${
                                      isUnder80
                                        ? 'bg-blue-50 text-blue-900 border-blue-200'
                                        : 'bg-slate-100 text-slate-700 border-slate-200'
                                    }`}>
                                      Acum: {accumPct}%
                                    </span>
                                  </div>
                                </div>

                                {/* Bar representing project share */}
                                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                                  <div
                                    style={{ width: `${singlePct}%` }}
                                    className={`h-full rounded-full transition-all duration-500 ${
                                      idx === 0 ? 'bg-[#002060]' :
                                      idx === 1 ? 'bg-blue-600' :
                                      idx === 2 ? 'bg-amber-500' :
                                      idx === 3 ? 'bg-emerald-600' :
                                      'bg-slate-400'
                                    }`}
                                  />
                                </div>
                              </div>
                            );
                          });
                        })()}

                        {/* Rest of projects aggregation */}
                        {(() => {
                          const top7Sum = cuentasAuxiliaresMes.slice(0, 7).reduce((acc, curr) => acc + curr.total, 0);
                          const totalMes = activeMonth?.totalMonto || 1;
                          const restSum = Math.max(0, totalMes - top7Sum);
                          const restPct = Math.round((restSum / totalMes) * 1000) / 10;
                          const restCount = Math.max(0, cuentasAuxiliaresMes.length - 7);

                          return (
                            <div className="space-y-1 pt-2 border-t border-slate-100">
                              <div className="flex items-center justify-between text-xs text-slate-500">
                                <div className="flex items-center gap-2">
                                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-mono text-[10.5px]">
                                    +
                                  </span>
                                  <span className="font-semibold italic">
                                    Resto de Proyectos y Frentes Menores ({restCount} cuentas auxiliares)
                                  </span>
                                </div>
                                <div className="flex items-center gap-4 shrink-0 font-mono">
                                  <span className="font-bold text-slate-700">${restSum.toLocaleString('de-DE')}</span>
                                  <span className="text-[11px] w-12 text-right">{restPct}%</span>
                                  <span className="text-[11px] font-bold px-1.5 py-0.5 rounded border w-24 text-center bg-slate-50 text-slate-600 border-slate-200">
                                    Acum: 100%
                                  </span>
                                </div>
                              </div>
                              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div style={{ width: `${restPct}%` }} className="h-full bg-slate-300 rounded-full" />
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Executive Pareto Insights */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-950">
                        <strong className="block font-bold mb-1 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-blue-700" />
                          Concentración Estratégica (80/20)
                        </strong>
                        <p className="text-[11px] leading-relaxed text-slate-700">
                          El 76,3% del gasto mensual se concentra en solo 4 cuentas auxiliares (Línea 1 Pellas, Segunda Línea PMH, Cangilones DRAVO y 2da Etapa Pellas). Auditar estas 4 cuentas asegura el control efectivo de más de $794K USD.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-950">
                        <strong className="block font-bold mb-1 flex items-center gap-1.5">
                          <Target className="w-4 h-4 text-emerald-700" />
                          Megaproyecto Pellas Línea 1
                        </strong>
                        <p className="text-[11px] leading-relaxed text-slate-700">
                          Continúa como el contrato de mayor envergadura con $305.289 USD en el mes (29,3%) y un acumulado de $2.068.019 USD (7,0% sobre el contrato total de $29,72M USD).
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-950">
                        <strong className="block font-bold mb-1 flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-amber-700" />
                          Tracción de Proyectos Secundarios
                        </strong>
                        <p className="text-[11px] leading-relaxed text-slate-700">
                          Repotenciación Rueda DRAVO repuntó a $154.004 USD (+137%) y Briquetas Fase 2 se estabilizó en $80.528 USD, transitando a fases de pruebas y conexionado final.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: TABLA DE CUENTAS AUXILIARES & PRESUPUESTO */}
                {slide3Tab === 'tabla' && (
                  <div className="space-y-3 animate-fade-in">
                    {/* Tabla idéntica a la diapositiva oficial del PowerPoint */}
                    <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-xs bg-white max-h-[380px] overflow-y-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="sticky top-0 z-10 shadow-xs">
                          <tr className="bg-[#0b2545] text-white font-bold border-b border-[#081c33]">
                            <th className="py-2 px-3 w-10 text-center">#</th>
                            <th className="py-2 px-3 min-w-[110px]">Cuenta Auxiliar</th>
                            <th className="py-2 px-3 min-w-[280px]">Proyecto</th>
                            <th className="py-2 px-3 text-right min-w-[105px]">Monto {activeMonth?.mesLabel?.split(' ')[0]} (USD)</th>
                            <th className="py-2 px-3 text-right w-16">% Mes</th>
                            <th className="py-2 px-3 text-right min-w-[120px]">Presupuesto (USD)</th>
                            <th className="py-2 px-3 text-center min-w-[115px]">% Uso Presup.</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                          {cuentasPresupuestoMetrics.items.map((c) => {
                            const m = c.metricas;
                            return (
                              <tr key={c.codigo} className="hover:bg-blue-50/50 transition-colors">
                                <td className="py-1.5 px-3 text-center font-mono text-slate-400 font-bold">{c.idx}</td>
                                <td className="py-1.5 px-3 font-mono font-bold text-[#0b2545] whitespace-nowrap">
                                  {c.codigo}
                                </td>
                                <td className="py-1.5 px-3 text-slate-800 font-medium">
                                  {c.proyecto}
                                </td>
                                <td className="py-1.5 px-3 text-right font-mono tabular-nums font-bold text-slate-900">
                                  ${c.total.toLocaleString('de-DE')}
                                </td>
                                <td className="py-1.5 px-3 text-right font-mono text-slate-500 font-semibold text-[11px]">
                                  {c.porcentaje}%
                                </td>
                                <td className="py-1.5 px-3 text-right font-mono tabular-nums text-slate-700">
                                  {m.tienePresupuesto ? (
                                    <span className="font-semibold text-slate-900">
                                      ${m.totalPresupuesto.toLocaleString('de-DE', { maximumFractionDigits: 0 })}
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 text-[11px] font-mono">-</span>
                                  )}
                                </td>
                                <td className="py-1.5 px-3 text-center">
                                  {m.tienePresupuesto ? (
                                    <div className="inline-flex flex-col items-center">
                                      <span className={`px-2 py-0.5 rounded text-[10.5px] font-bold border ${
                                        m.estadoAlerta === 'critico' || m.estadoAlerta === 'excedido'
                                          ? 'bg-red-50 text-red-700 border-red-200'
                                          : m.estadoAlerta === 'alerta'
                                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      }`}>
                                        {m.porcentajeUso}%
                                      </span>
                                      <div className="w-14 bg-slate-200 h-1 rounded-full overflow-hidden mt-0.5">
                                        <div 
                                          style={{ width: `${Math.min(m.porcentajeUso, 100)}%` }}
                                          className={`h-full rounded-full ${
                                            m.estadoAlerta === 'critico' || m.estadoAlerta === 'excedido'
                                              ? 'bg-red-600'
                                              : m.estadoAlerta === 'alerta'
                                              ? 'bg-amber-500'
                                              : 'bg-emerald-600'
                                          }`}
                                        />
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-slate-400 font-mono text-[10px]" title="Sin presupuesto asignado en Presupuestos.xlsx">S/P</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot className="sticky bottom-0 z-10 bg-[#0b2545] text-white font-black border-t-2 border-[#0b2545]">
                          <tr>
                            <td className="py-2 px-3 text-center">Σ</td>
                            <td className="py-2 px-3">Total General</td>
                            <td className="py-2 px-3">Consolidado {cuentasAuxiliaresMes.length} Proyectos Activos</td>
                            <td className="py-2 px-3 text-right font-mono tabular-nums text-sm text-amber-300">
                              {formatCurrency(activeMonth?.totalMonto || 0)}
                            </td>
                            <td className="py-2 px-3 text-right font-mono text-xs text-white">
                              100%
                            </td>
                            <td className="py-2 px-3 text-right font-mono tabular-nums text-xs text-amber-300">
                              ${cuentasPresupuestoMetrics.totalPresupuestoConsolidado.toLocaleString('de-DE', { maximumFractionDigits: 0 })}
                            </td>
                            <td className="py-2 px-3 text-center font-mono text-xs text-amber-300">
                              {cuentasPresupuestoMetrics.pctUsoGlobal}% Uso
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SLIDE 4: VARIACIONES EN PROYECTOS Y TOP MATERIALES DIRECTOS */}
            {currentSlide === 4 && (
              <div className="py-2 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div>
                    <h2 className="text-2xl font-black text-[#0b2545] tracking-tight">
                      Variaciones en Proyectos y Top Despachos · {activeMonth?.mesLabel}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Dinámica de obras en campo y compras mayores del mes ({formatCurrency(activeMonth?.totalMonto || 0)})
                    </p>
                  </div>

                  {/* Tabs Switcher for Slide 4 */}
                  <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
                    <button
                      onClick={() => setSlide4Tab('variaciones')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        slide4Tab === 'variaciones'
                          ? 'bg-[#0b2545] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                      }`}
                    >
                      <Activity className="w-3.5 h-3.5" />
                      <span>Gráfica Variaciones (Divergente)</span>
                    </button>
                    <button
                      onClick={() => setSlide4Tab('mixProcura')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        slide4Tab === 'mixProcura'
                          ? 'bg-[#0b2545] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                      }`}
                    >
                      <PieIcon className="w-3.5 h-3.5" />
                      <span>Mix Procura Materiales</span>
                    </button>
                  </div>
                </div>

                {/* TAB 1: GRÁFICA DIVERGENTE DE VARIACIONES */}
                {slide4Tab === 'variaciones' && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                        <div>
                          <h3 className="text-sm font-black text-[#0b2545] uppercase tracking-wider flex items-center gap-1.5">
                            <TrendingUp className="w-4 h-4 text-blue-600" />
                            Aceleración vs Desaceleración de Proyectos (vs Mes Anterior)
                          </h3>
                          <p className="text-xs text-slate-500">
                            Cifras netas de variación mensual en miles de dólares ($ USD)
                          </p>
                        </div>
                        <div className="flex items-center gap-3 text-xs font-mono">
                          <span className="flex items-center gap-1 text-emerald-700 font-bold">
                            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600" /> ▲ Aceleración
                          </span>
                          <span className="flex items-center gap-1 text-amber-700 font-bold">
                            <span className="w-2.5 h-2.5 rounded-xs bg-amber-500" /> ▼ Desaceleración
                          </span>
                        </div>
                      </div>

                      {/* Diverging Bar Chart Pure SVG */}
                      <div className="pt-4 overflow-x-auto">
                        {(() => {
                          const items = selectedMesNum === 8 ? [
                            { name: 'Repotenciación DRAVO', delta: 29.5, pct: '+83%', why: 'Trabajos mayores en rueda de cangilones y tableros' },
                            { name: 'Rehabilitación Bandas PMH', delta: 31.0, pct: '+53%', why: 'Reactivación Torre #3 y cinta transportadora JD-8012' },
                            { name: 'Segunda Línea PMH', delta: 67.0, pct: '+60%', why: 'Despacho masivo de aceros para pórticos y tolvas' },
                            { name: 'Línea 1 Pellas', delta: -20.0, pct: '-4%', why: 'Nivel operativo alto sostenido ($516K USD)' },
                            { name: 'Caldera Briquetas', delta: -91.0, pct: '-89%', why: 'Fase final de remates, pruebas y calibración' }
                          ] : [
                            { name: 'Repotenciación DRAVO', delta: 89.0, pct: '+137%', why: 'Repunte en rueda de cangilones y cableado eléctrico ($154K)' },
                            { name: 'Caldera BF-600', delta: 14.0, pct: '+48%', why: 'Conexionado de vapor e instrumentación ($44K)' },
                            { name: 'Segunda Línea PMH', delta: 6.0, pct: '+3%', why: 'Ritmo sostenido en calderería pesada y tolvas ($194K)' },
                            { name: 'Briquetas Fase 2', delta: -89.0, pct: '-53%', why: 'Transición a calibración y pruebas hidrostáticas ($80K)' },
                            { name: 'Línea 1 Pellas', delta: -211.0, pct: '-41%', why: 'Conclusión de fase civil inicial; montaje de campo ($305K)' }
                          ];

                          const maxDelta = 220;
                          const chartWidth = 720;
                          const chartHeight = 220;
                          const zeroX = chartWidth / 2;
                          const rowHeight = chartHeight / items.length;

                          return (
                            <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 10}`} className="w-full h-56 text-xs font-mono">
                              {/* Central Zero Axis Line */}
                              <line x1={zeroX} y1="10" x2={zeroX} y2={chartHeight - 10} stroke="#94a3b8" strokeWidth="2" strokeDasharray="3 3" />
                              <text x={zeroX} y={chartHeight + 5} textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="bold">
                                Eje 0 (Variación Neta)
                              </text>

                              {/* Reference scale markers */}
                              <text x={zeroX - 100} y="15" textAnchor="middle" fill="#94a3b8" fontSize="9">-$100k</text>
                              <text x={zeroX - 200} y="15" textAnchor="middle" fill="#94a3b8" fontSize="9">-$200k</text>
                              <text x={zeroX + 100} y="15" textAnchor="middle" fill="#94a3b8" fontSize="9">+$100k</text>
                              <text x={zeroX + 200} y="15" textAnchor="middle" fill="#94a3b8" fontSize="9">+$200k</text>

                              {items.map((it, idx) => {
                                const y = 25 + idx * 36;
                                const barLength = (Math.abs(it.delta) / maxDelta) * (zeroX - 40);
                                const isPositive = it.delta >= 0;
                                const barX = isPositive ? zeroX : zeroX - barLength;
                                const color = isPositive ? '#059669' : '#d97706';

                                return (
                                  <g key={it.name} className="transition-all hover:opacity-90">
                                    {/* Bar */}
                                    <rect
                                      x={barX}
                                      y={y}
                                      width={Math.max(4, barLength)}
                                      height="20"
                                      rx="5"
                                      fill={color}
                                      className="shadow-2xs"
                                    />

                                    {/* Project label */}
                                    <text
                                      x={isPositive ? zeroX - 10 : zeroX + 10}
                                      y={y + 14}
                                      textAnchor={isPositive ? 'end' : 'start'}
                                      fontSize="10"
                                      fontWeight="bold"
                                      fill="#1e293b"
                                    >
                                      {it.name}
                                    </text>

                                    {/* Value label */}
                                    <text
                                      x={isPositive ? zeroX + barLength + 8 : zeroX - barLength - 8}
                                      y={y + 14}
                                      textAnchor={isPositive ? 'start' : 'end'}
                                      fontSize="10.5"
                                      fontWeight="bold"
                                      fill={color}
                                    >
                                      {isPositive ? `+$${it.delta}k (${it.pct})` : `-$${Math.abs(it.delta)}k (${it.pct})`}
                                    </text>
                                  </g>
                                );
                              })}
                            </svg>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Operational Engineering Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
                        <strong className="text-emerald-950 font-bold block flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                          Impulsores de Aceleración Operativa
                        </strong>
                        <p className="text-[11px] text-slate-700 leading-relaxed">
                          <strong>Rueda de Cangilones DRAVO (+137% / +$89K):</strong> Reactivación agresiva con suministro de cables de potencia, tableros de control y ensamblaje de tolvas de transferencia.
                        </p>
                        <p className="text-[11px] text-slate-700 leading-relaxed">
                          <strong>Segunda Línea PMH (+3% / +$6K):</strong> Sostiene un ritmo industrial estable ($193.958 USD) en calderería pesada con fabricación de pórticos estructurales en taller central.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1.5">
                        <strong className="text-amber-950 font-bold block flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
                          Desaceleraciones Controladas & Cierres
                        </strong>
                        <p className="text-[11px] text-slate-700 leading-relaxed">
                          <strong>Briquetas Fase 2 (-53% / -$89K):</strong> Finalización de obras civiles mayores y transición técnica a pruebas hidrostáticas y puesta a punto de válvulas de alta presión.
                        </p>
                        <p className="text-[11px] text-slate-700 leading-relaxed">
                          <strong>Pellas Línea 1 (-41% / -$211K):</strong> Estabilización del gasto tras culminar las compras de insumos iniciales, concentrándose en cuadrillas de montaje y soldadura de campo.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: MIX PROCURA MATERIALES DIRECTOS */}
                {slide4Tab === 'mixProcura' && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                        <div>
                          <h3 className="text-sm font-black text-[#0b2545] uppercase tracking-wider flex items-center gap-1.5">
                            <Briefcase className="w-4 h-4 text-blue-600" />
                            Composición de Procura Materiales Directos ({formatCurrency(categoriasMesAnalisis[0].monto)})
                          </h3>
                          <p className="text-xs text-slate-500">
                            Desglose de compras e insumos de almacén por especialidad técnica
                          </p>
                        </div>
                        <span className="text-xs font-mono font-bold px-3 py-1 bg-blue-50 text-blue-900 border border-blue-200 rounded-lg self-start sm:self-auto">
                          50,3% del Gasto Total del Mes
                        </span>
                      </div>

                      {/* Visual Breakdown of Procura */}
                      <div className="pt-4 grid grid-cols-1 md:grid-cols-5 gap-3">
                        {[
                          { rubro: 'Materiales Eléctricos', monto: 154000, pct: '29,4%', desc: 'Cables de potencia, tableros y canalizaciones DRAVO', color: 'border-blue-500 bg-blue-50/50 text-blue-950' },
                          { rubro: 'Acero Estructural', monto: 108700, pct: '20,7%', desc: 'Planchas ASTM A36, perfiles y vigas Segunda Línea PMH', color: 'border-emerald-500 bg-emerald-50/50 text-emerald-950' },
                          { rubro: 'Mecánico e Hidroneumático', monto: 97600, pct: '18,6%', desc: 'Válvulas de presión, cilindros y sellos Briquetas', color: 'border-purple-500 bg-purple-50/50 text-purple-950' },
                          { rubro: 'Soldadura y Gases', monto: 78400, pct: '15,0%', desc: 'Electrodos E7018, argón y alambre tubular talleres', color: 'border-orange-500 bg-orange-50/50 text-orange-950' },
                          { rubro: 'Misceláneos Calderería', monto: 85640, pct: '16,3%', desc: 'Tornillería grado 8, consumibles y accesorios montaje', color: 'border-slate-500 bg-slate-50/50 text-slate-950' }
                        ].map((rub) => (
                          <div key={rub.rubro} className={`p-3.5 rounded-xl border-t-4 border ${rub.color} space-y-1.5 shadow-2xs`}>
                            <div className="flex items-center justify-between text-xs font-bold">
                              <span className="truncate" title={rub.rubro}>{rub.rubro}</span>
                              <span className="font-mono text-slate-600">{rub.pct}</span>
                            </div>
                            <span className="text-xl font-black font-mono block text-[#0b2545]">
                              ${Math.round(rub.monto).toLocaleString('de-DE')}
                            </span>
                            <p className="text-[10.5px] text-slate-600 leading-relaxed">
                              {rub.desc}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Procura Strategy Insight */}
                    <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-950 text-xs flex items-start gap-2.5">
                      <Sparkles className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-bold mb-0.5">Estrategia de Procura y Logística TIMACA:</strong>
                        <span>
                          La concentración del 50,1% de los materiales entre el sector Eléctrico ($154K) y Acero Estructural ($108,7K) responde directamente a los hitos de entrega electromecánica para Ferrominera y Briquetera. Los contratos de suministro con entrega en talleres Puerto Ordaz han mitigado costos de flete internacional.
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SLIDE 5: PROYECTO PELLAS 1 · GENERAL & MOD */}
            {currentSlide === 5 && (
              <div className="py-2 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div>
                    <h2 className="text-2xl font-black text-[#0b2545] tracking-tight">
                      Megaproyecto Pellas Línea 1 (TTE-C-0706) · {activeMonth?.mesLabel}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Contrato Insignia TIMACA ($29,72M USD) · Ejecución mensual de {formatCurrency(pellasMesData.montoMes)} · Cuadrilla de {pellasMesData.cuadrilla} trab.
                    </p>
                  </div>

                  {/* Tabs Switcher for Slide 5 */}
                  <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
                    <button
                      onClick={() => setSlide5Tab('contrato')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        slide5Tab === 'contrato'
                          ? 'bg-[#0b2545] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                      }`}
                    >
                      <Target className="w-3.5 h-3.5" />
                      <span>Avance Contrato & Curva Mensual</span>
                    </button>
                    <button
                      onClick={() => setSlide5Tab('evolucion')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        slide5Tab === 'evolucion'
                          ? 'bg-[#0b2545] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Fuerza Laboral & Operaciones</span>
                    </button>
                  </div>
                </div>

                {/* TAB 1: AVANCE CONTRACTUAL & CURVA DE EJECUCIÓN (BURN-RATE) */}
                {slide5Tab === 'contrato' && (
                  <div className="space-y-4 animate-fade-in">
                    {/* Contract Progress Gauge */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                        <div>
                          <h3 className="text-sm font-black text-[#0b2545] uppercase tracking-wider flex items-center gap-1.5">
                            <Target className="w-4 h-4 text-emerald-600" />
                            Progreso Financiero del Contrato Marco ($29.720.000 USD)
                          </h3>
                          <p className="text-xs text-slate-500">
                            Avance acumulado 2026 frente al compromiso contractual total
                          </p>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-mono">
                          <span className="text-emerald-700 font-bold">
                            Ejecutado: ${pellasMesData.acumulado2026.toLocaleString('de-DE')} ({Math.round((pellasMesData.acumulado2026 / 29720000) * 1000) / 10}%)
                          </span>
                          <span className="text-slate-500">
                            Saldo: ${(29720000 - pellasMesData.acumulado2026).toLocaleString('de-DE')} USD
                          </span>
                        </div>
                      </div>

                      {/* Visual Progress Gauge Bar */}
                      <div className="space-y-2">
                        <div className="w-full bg-slate-100 h-6 rounded-xl p-1 border border-slate-200 overflow-hidden relative">
                          <div
                            style={{ width: `${Math.max(4, (pellasMesData.acumulado2026 / 29720000) * 100)}%` }}
                            className="h-full bg-linear-to-r from-[#002060] to-emerald-600 rounded-lg transition-all duration-700 relative shadow-xs flex items-center justify-end pr-2"
                          >
                            <span className="text-[10px] text-white font-bold font-mono">
                              {Math.round((pellasMesData.acumulado2026 / 29720000) * 1000) / 10}%
                            </span>
                          </div>
                        </div>

                        {/* Milestone ticks */}
                        <div className="flex justify-between text-[10px] font-mono text-slate-400 px-1">
                          <span>0% (Inicio)</span>
                          <span>25% ($7,43M)</span>
                          <span>50% ($14,86M)</span>
                          <span>75% ($22,29M)</span>
                          <span>100% ($29,72M USD)</span>
                        </div>
                      </div>

                      {/* Monthly Burn-rate SVG chart 2026 */}
                      <div className="pt-3 border-t border-slate-100">
                        <div className="flex items-center justify-between pb-2">
                          <span className="text-xs font-bold text-[#0b2545] uppercase tracking-wider">
                            Curva de Gasto Mensual Pellas Línea 1 (Enero a Septiembre 2026)
                          </span>
                          <span className="text-xs font-mono text-slate-500">
                            Pico Operativo: Agosto ($516K USD) · Cierre: Septiembre ($305K USD)
                          </span>
                        </div>

                        {(() => {
                          const mesesPellas = [
                            { mes: 'Ene', val: 145000 },
                            { mes: 'Feb', val: 178000 },
                            { mes: 'Mar', val: 212000 },
                            { mes: 'Abr', val: 238000 },
                            { mes: 'May', val: 264000 },
                            { mes: 'Jun', val: 310000 },
                            { mes: 'Jul', val: 322000 },
                            { mes: 'Ago', val: 516344 },
                            { mes: 'Sep', val: 305289 }
                          ];

                          const maxVal = 600000;
                          const chartWidth = 720;
                          const chartHeight = 140;
                          const colWidth = chartWidth / mesesPellas.length;

                          return (
                            <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 30}`} className="w-full h-44 text-xs font-mono">
                              {/* Grid lines */}
                              {[0, 0.33, 0.66, 1].map((p, idx) => {
                                const y = chartHeight - (p * chartHeight);
                                return (
                                  <line key={idx} x1="20" y1={y} x2={chartWidth - 20} y2={y} stroke="#f1f5f9" strokeDasharray="3 3" />
                                );
                              })}

                              {mesesPellas.map((m, idx) => {
                                const isCurrent = idx + 1 === selectedMesNum;
                                const barH = (m.val / maxVal) * chartHeight;
                                const x = 20 + idx * colWidth + 12;
                                const y = chartHeight - barH;
                                const barW = colWidth - 24;

                                return (
                                  <g key={m.mes} className="transition-all hover:opacity-85">
                                    <rect
                                      x={x}
                                      y={y}
                                      width={barW}
                                      height={barH}
                                      rx="5"
                                      fill={isCurrent ? '#f59e0b' : '#002060'}
                                      className="shadow-2xs cursor-pointer"
                                    />
                                    <text
                                      x={x + barW / 2}
                                      y={Math.max(14, y - 5)}
                                      textAnchor="middle"
                                      fontSize="10"
                                      fontWeight="bold"
                                      fill={isCurrent ? '#b45309' : '#0b2545'}
                                    >
                                      ${Math.round(m.val / 1000)}k
                                    </text>
                                    <text
                                      x={x + barW / 2}
                                      y={chartHeight + 16}
                                      textAnchor="middle"
                                      fontSize="10"
                                      fontWeight={isCurrent ? 'bold' : 'normal'}
                                      fill={isCurrent ? '#0b2545' : '#64748b'}
                                    >
                                      {m.mes}
                                    </text>
                                  </g>
                                );
                              })}
                            </svg>
                          );
                        })()}
                      </div>
                    </div>

                    {/* 3 Strategic Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-950">
                        <strong className="block font-bold mb-1">Capacidad Instalada y Proyección:</strong>
                        <p className="text-[11px] leading-relaxed text-slate-700">
                          El avance financiero del 7,0% ($2.068.019 USD) sienta la plataforma logística para los hitos mayores de montaje electromecánico y refractario previstos en el último trimestre de 2026.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-950">
                        <strong className="block font-bold mb-1">Concentración de Fuerza Laboral:</strong>
                        <p className="text-[11px] leading-relaxed text-slate-700">
                          Mantiene 254 trabajadores activos en campo, garantizando la cobertura de frentes en jornadas rotativas continuas de calderería y montaje estructural.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-950">
                        <strong className="block font-bold mb-1">Absorción Indirecta Primaria:</strong>
                        <p className="text-[11px] leading-relaxed text-slate-700">
                          Absorbe ${selectedMesNum === 9 ? '49.713' : '202.292'} USD ({selectedMesNum === 9 ? '68,1%' : '33,4%'} del CIF corporativo), apalancando la infraestructura de supervisión técnica de TIMACA.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: DETALLES DE FUERZA LABORAL & OPERACIONES */}
                {slide5Tab === 'evolucion' && (
                  <div className="space-y-4 animate-fade-in">
                    {/* KPIs principales de Pellas */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-[11px] font-bold text-slate-500 uppercase block">Mes Operativo</span>
                        <span className="text-2xl font-black font-mono text-[#0b2545] block">${pellasMesData.montoMes.toLocaleString('de-DE')}</span>
                        <span className="text-[10px] text-slate-500">{pellasMesData.porcentajeMes}% del gasto total de {activeMonth?.mesLabel?.split(' ')[0]}</span>
                      </div>
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-[11px] font-bold text-slate-500 uppercase block">Acumulado 2026</span>
                        <span className="text-2xl font-black font-mono text-blue-700 block">${pellasMesData.acumulado2026.toLocaleString('de-DE')}</span>
                        <span className="text-[10px] text-slate-500">{Math.round((pellasMesData.acumulado2026 / 29720000) * 1000) / 10}% de avance sobre contrato $29,72M</span>
                      </div>
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-[11px] font-bold text-slate-500 uppercase block">Cuadrilla en Campo</span>
                        <span className="text-2xl font-black font-mono text-emerald-700 block">{pellasMesData.cuadrilla} trab.</span>
                        <span className="text-[10px] text-emerald-700 font-semibold">Promedio activo estabilizado</span>
                      </div>
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-[11px] font-bold text-slate-500 uppercase block">Nómina {activeMonth?.mesLabel?.split(' ')[0]}</span>
                        <span className="text-2xl font-black font-mono text-slate-900 block">${pellasMesData.nominaMes.toLocaleString('de-DE')}</span>
                        <span className="text-[10px] text-slate-500">Fuerza laboral en frentes de obra</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                        <h3 className="text-xs font-bold text-[#0b2545] uppercase tracking-wider flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-blue-600" />
                          Fuerza Laboral y Continuidad Operativa
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {selectedMesNum === 9 ? (
                            <>Nómina devengada del mes de <strong>$198.950 USD</strong> en Línea 1 Pellas, integrando <strong>$125.000 USD</strong> de Honorarios Profesionales de Staff Fijo más cuadrillas directas devengadas en 5 semanas (Semanas 35 a 39), con una cuadrilla promedio activa de <strong>254 trabajadores</strong>.</>
                          ) : (
                            <>Nómina mensual de <strong>$133.184 USD</strong> distribuida en 4 semanas operativas (Semanas 31 a 34), con una cuadrilla estabilizada en <strong>238 trabajadores promedio</strong> que garantiza la continuidad ininterrumpida en los frentes de montaje mecánico, refractario y estructuras.</>
                          )}
                        </p>
                        <p className="text-xs text-slate-600 leading-relaxed pt-1">
                          {selectedMesNum === 9 ? (
                            <>Pellas Línea 1 representa el <strong>29,3% de la ejecución total de septiembre</strong> ($305.289 USD), consolidando su posición como el megaproyecto insignia de TIMACA.</>
                          ) : (
                            <>El costo de Pellas bajó 4% respecto a julio por menor nómina directa (-$27,2K) y menor despacho de materiales (-$18,9K), compensado en parte por un mayor uso intensivo de maquinaria pesada propia (+ $26,7K).</>
                          )}
                        </p>
                      </div>

                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                        <h3 className="text-xs font-bold text-[#0b2545] uppercase tracking-wider flex items-center gap-1.5">
                          <Wrench className="w-4 h-4 text-amber-600" />
                          Avance Financiero y Absorción Indirecta
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {selectedMesNum === 9 ? (
                            <>El megaproyecto acumula un total de <strong>$2.068.019 USD</strong> ejecutados en 2026, lo que representa un <strong>7,0% de avance financiero</strong> sobre el monto contractual global de $29,72M USD.</>
                          ) : (
                            <>El uso de maquinaria pesada propia alcanzó su pico de <strong>$89.789 USD</strong> en agosto por el montaje intensivo de estructuras mecánicas pesadas y maniobras críticas con la flota de grúas industriales.</>
                          )}
                        </p>
                        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 mt-2 text-[11px] text-slate-700">
                          <strong>Indirectos Asignados:</strong> Pellas absorbe <strong>{selectedMesNum === 9 ? '$49.713 USD' : '$202.292 USD'}</strong> de la estructura corporativa oficial de indirectos en {activeMonth?.mesLabel?.split(' ')[0]} ({selectedMesNum === 9 ? '68,1%' : '33,37%'} de absorción).
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SLIDE 6: PROYECTO PELLAS 1 · SERVICIOS DIRECTOS (LÁMINA OFICIAL PPT) */}
            {currentSlide === 6 && (
              <div className="py-2 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                  <div>
                    <h2 className="text-2xl font-black text-[#0b2545] tracking-tight">
                      PROYECTO PELLAS 1: SERVICIOS DIRECTOS
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Desglose de 19 subcategorías operativas y curva evolutiva de servicios (Abril a Agosto 2026)
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSlide6Tab('servicios')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${
                        slide6Tab === 'servicios'
                          ? 'bg-[#0b2545] text-white border-[#0b2545] shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <Truck className="w-3.5 h-3.5 inline mr-1" />
                      Servicios Directos (Oficial PPT)
                    </button>
                    <button
                      onClick={() => setSlide6Tab('horasMaquina')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${
                        slide6Tab === 'horasMaquina'
                          ? 'bg-[#0b2545] text-white border-[#0b2545] shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <Wrench className="w-3.5 h-3.5 inline mr-1" />
                      Horas Máquina (1.396h)
                    </button>
                  </div>
                </div>

                {slide6Tab === 'servicios' ? (
                  <div className="space-y-4">
                    {/* Top Row: Matrix table (Left) + Line Chart / KPIs (Right) */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                      
                      {/* Left: 19 Subcategories Table */}
                      <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                        <div className="p-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                          <span className="text-[11px] font-bold text-[#0b2545] uppercase tracking-wider">
                            Matriz de Servicios Directos · Proyecto Pellas 1 (TTE-C-0706)
                          </span>
                          <span className="text-[11px] font-mono font-bold text-slate-600">
                            Cifras en USD
                          </span>
                        </div>

                        <div className="overflow-x-auto max-h-[360px] overflow-y-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead className="sticky top-0 z-10 bg-[#0b2545] text-white font-bold">
                              <tr>
                                <th className="py-2.5 px-3 min-w-[200px]">Servicios</th>
                                <th className="py-2.5 px-2.5 text-right font-mono">abril</th>
                                <th className="py-2.5 px-2.5 text-right font-mono">mayo</th>
                                <th className="py-2.5 px-2.5 text-right font-mono">junio</th>
                                <th className="py-2.5 px-2.5 text-right font-mono">julio</th>
                                <th className={`py-2.5 px-2.5 text-right font-mono ${selectedMesNum === 8 ? 'bg-amber-500/80 font-black text-white' : ''}`}>
                                  agosto
                                </th>
                                <th className="py-2.5 px-3 text-right font-mono bg-slate-900">Total</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium">
                              {TABLA_SERVICIOS_DIRECTOS_PELLAS_OFICIAL.map((srv, idx) => (
                                <tr key={srv.id} className={idx % 2 === 0 ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/50 hover:bg-slate-50'}>
                                  <td className="py-1.5 px-3 text-slate-800 font-semibold">{srv.servicio}</td>
                                  <td className="py-1.5 px-2.5 text-right font-mono text-slate-600">{srv.abril > 0 ? `$${srv.abril.toLocaleString('de-DE')}` : '-'}</td>
                                  <td className="py-1.5 px-2.5 text-right font-mono text-slate-600">{srv.mayo > 0 ? `$${srv.mayo.toLocaleString('de-DE')}` : '-'}</td>
                                  <td className="py-1.5 px-2.5 text-right font-mono text-slate-600">{srv.junio > 0 ? `$${srv.junio.toLocaleString('de-DE')}` : '-'}</td>
                                  <td className="py-1.5 px-2.5 text-right font-mono text-slate-600">{srv.julio > 0 ? `$${srv.julio.toLocaleString('de-DE')}` : '-'}</td>
                                  <td className={`py-1.5 px-2.5 text-right font-mono font-bold ${selectedMesNum === 8 ? 'text-amber-900 bg-amber-50/60' : 'text-slate-700'}`}>
                                    {srv.agosto > 0 ? `$${srv.agosto.toLocaleString('de-DE')}` : '-'}
                                  </td>
                                  <td className="py-1.5 px-3 text-right font-mono font-bold text-slate-900 bg-slate-100/70">
                                    ${srv.total.toLocaleString('de-DE')}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot className="sticky bottom-0 z-10 bg-slate-100 font-black border-t-2 border-slate-300 text-slate-900">
                              <tr>
                                <td className="py-2.5 px-3 uppercase tracking-wider">Total general</td>
                                <td className="py-2.5 px-2.5 text-right font-mono">${TOTALES_SERVICIOS_DIRECTOS_PELLAS.abril.toLocaleString('de-DE')}</td>
                                <td className="py-2.5 px-2.5 text-right font-mono">${TOTALES_SERVICIOS_DIRECTOS_PELLAS.mayo.toLocaleString('de-DE')}</td>
                                <td className="py-2.5 px-2.5 text-right font-mono">${TOTALES_SERVICIOS_DIRECTOS_PELLAS.junio.toLocaleString('de-DE')}</td>
                                <td className="py-2.5 px-2.5 text-right font-mono">${TOTALES_SERVICIOS_DIRECTOS_PELLAS.julio.toLocaleString('de-DE')}</td>
                                <td className={`py-2.5 px-2.5 text-right font-mono ${selectedMesNum === 8 ? 'text-amber-900 bg-amber-200/80 font-black' : ''}`}>
                                  ${TOTALES_SERVICIOS_DIRECTOS_PELLAS.agosto.toLocaleString('de-DE')}
                                </td>
                                <td className="py-2.5 px-3 text-right font-mono text-blue-900 bg-slate-200">
                                  ${TOTALES_SERVICIOS_DIRECTOS_PELLAS.total.toLocaleString('de-DE')}
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>

                      {/* Right: Evolutivo de Servicios Curve & Summary */}
                      <div className="lg:col-span-4 space-y-3">
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <span className="text-xs font-bold text-[#0b2545] uppercase tracking-wider flex items-center gap-1.5">
                              <TrendingUp className="w-4 h-4 text-blue-600" />
                              Evolutivo de Servicios
                            </span>
                            <span className="text-[10px] font-mono text-slate-500 font-bold">Abr - Ago 2026</span>
                          </div>

                          {/* Evolutivo Line / Stepped Chart */}
                          <div className="h-44 pt-4 pb-2 px-2 flex items-end justify-between gap-2 bg-slate-50/70 rounded-lg border border-slate-100">
                            {[
                              { mes: 'Abr', val: TOTALES_SERVICIOS_DIRECTOS_PELLAS.abril, num: 4 },
                              { mes: 'May', val: TOTALES_SERVICIOS_DIRECTOS_PELLAS.mayo, num: 5 },
                              { mes: 'Jun', val: TOTALES_SERVICIOS_DIRECTOS_PELLAS.junio, num: 6 },
                              { mes: 'Jul', val: TOTALES_SERVICIOS_DIRECTOS_PELLAS.julio, num: 7 },
                              { mes: 'Ago', val: TOTALES_SERVICIOS_DIRECTOS_PELLAS.agosto, num: 8 }
                            ].map((p) => {
                              const pct = Math.max(10, Math.round((p.val / 65000) * 100));
                              const isCur = selectedMesNum === p.num;
                              return (
                                <div key={p.mes} className="flex-1 flex flex-col items-center justify-end h-full group">
                                  <span className={`text-[10px] font-mono font-bold mb-1 ${isCur ? 'text-amber-800' : 'text-slate-600'}`}>
                                    {p.val >= 1000 ? `$${Math.round(p.val / 1000)}K` : `$${p.val}`}
                                  </span>
                                  <div
                                    style={{ height: `${pct}%` }}
                                    className={`w-full max-w-[36px] rounded-t-lg transition-all ${
                                      isCur
                                        ? 'bg-amber-500 ring-2 ring-amber-300'
                                        : 'bg-blue-600 group-hover:bg-blue-500'
                                    }`}
                                  />
                                  <span className={`text-[11px] font-bold mt-1.5 ${isCur ? 'text-amber-800 underline' : 'text-slate-600'}`}>
                                    {p.mes}
                                  </span>
                                </div>
                              );
                            })}
                          </div>

                          {/* Summary numbers */}
                          <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                            <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200">
                              <span className="text-[10px] text-blue-700 block font-semibold uppercase">Total Acumulado</span>
                              <strong className="text-sm font-black font-mono text-blue-950 block">
                                ${TOTALES_SERVICIOS_DIRECTOS_PELLAS.total.toLocaleString('de-DE')}
                              </strong>
                              <span className="text-[10px] text-blue-600">5 meses ejecutados</span>
                            </div>
                            <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200">
                              <span className="text-[10px] text-amber-800 block font-semibold uppercase">Cierre Agosto</span>
                              <strong className="text-sm font-black font-mono text-amber-950 block">
                                ${TOTALES_SERVICIOS_DIRECTOS_PELLAS.agosto.toLocaleString('de-DE')}
                              </strong>
                              <span className="text-[10px] text-amber-700">10 subcategorías</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom: 3 Analysis Bullets matching official PPT slide */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                      <span className="text-xs font-bold text-[#0b2545] uppercase tracking-wider block border-b border-slate-100 pb-2 flex items-center gap-1.5">
                        <Truck className="w-4 h-4 text-blue-600" />
                        Análisis de Servicios Directos (Pellas Línea 1)
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                        {ANALISIS_SERVICIOS_DIRECTOS_PELLAS.map((a, i) => (
                          <div key={i} className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                            <strong className="text-slate-900 block font-bold text-xs">{a.titulo}:</strong>
                            <p className="text-[11px] text-slate-600 leading-relaxed">{a.descripcion}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Horas Máquina Tab */
                  <div className="space-y-4">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                      <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">
                            LÁMINA OFICIAL DE LA PRESENTACIÓN DE COSTOS
                          </span>
                          <h4 className="text-xs font-black text-slate-900 uppercase">
                            PROYECTO PELLAS 1: HORAS MÁQUINA (DESGLOSE DE 22 EQUIPOS)
                          </h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold px-2.5 py-1 bg-purple-50 text-purple-900 border border-purple-200 rounded-lg">
                            Total Horas: {TOTALES_HORAS_MAQUINA_PELLAS.totalHoras.toLocaleString('de-DE')} H/M
                          </span>
                          <span className="text-xs font-mono font-bold px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-300 rounded-lg">
                            Costo Total: ${TOTALES_HORAS_MAQUINA_PELLAS.totalCosto.toLocaleString('de-DE')} USD
                          </span>
                        </div>
                      </div>

                      {/* 22 Equipment Table matching Slide exactly */}
                      <div className="overflow-x-auto max-h-[360px] overflow-y-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead className="sticky top-0 z-10 bg-[#0b2545] text-white font-bold">
                            <tr>
                              <th className="py-2 px-3 min-w-[75px]">Cuenta-Aux</th>
                              <th className="py-2 px-2.5 min-w-[65px] font-mono">Codigo</th>
                              <th className="py-2 px-3 min-w-[200px]">EQUIPO</th>
                              <th className="py-2 px-2.5 text-right font-mono min-w-[90px]">Tarifa</th>
                              <th className="py-2 px-2.5 text-right font-mono min-w-[85px]">Total H/M</th>
                              <th className="py-2 px-3 text-right font-mono bg-slate-900 min-w-[110px]">Costo Total H/M ($)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-medium">
                            {TABLA_HORAS_MAQUINA_PELLAS_OFICIAL.map((eq, idx) => (
                              <tr 
                                key={idx} 
                                className={
                                  eq.codigo === 'GR20' && eq.tarifa === 190.21 && eq.totalHM === 163.5
                                    ? 'bg-amber-50/70 hover:bg-amber-100/70 font-semibold'
                                    : idx % 2 === 0 ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/50 hover:bg-slate-50'
                                }
                              >
                                <td className="py-2 px-3 font-mono text-slate-600">{eq.cuentaAux}</td>
                                <td className="py-2 px-2.5 font-mono font-bold text-blue-700">{eq.codigo}</td>
                                <td className="py-2 px-3 text-slate-900 font-semibold">
                                  {eq.equipo}
                                  {eq.codigo === 'GR20' && eq.totalHM === 163.5 && (
                                    <span className="ml-2 text-[10px] font-bold text-amber-800 bg-amber-200/60 px-1.5 py-0.5 rounded">
                                      Equipo Principal Flota
                                    </span>
                                  )}
                                </td>
                                <td className="py-2 px-2.5 text-right font-mono text-slate-700">
                                  {formatUnitPriceRaw(eq.tarifa)}
                                </td>
                                <td className="py-2 px-2.5 text-right font-mono font-bold text-slate-800">
                                  {Math.round(eq.totalHM).toLocaleString('de-DE')}
                                </td>
                                <td className="py-2 px-3 text-right font-mono font-bold text-purple-900 bg-purple-50/40">
                                  {eq.costoTotalHM.toLocaleString('de-DE')}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="sticky bottom-0 z-10 bg-slate-100 font-black border-t-2 border-slate-300 text-slate-900">
                            <tr>
                              <td colSpan={4} className="py-2 px-3 uppercase tracking-wider">Total</td>
                              <td className="py-2 px-2.5 text-right font-mono text-slate-900">
                                {TOTALES_HORAS_MAQUINA_PELLAS.totalHoras.toLocaleString('de-DE')}
                              </td>
                              <td className="py-2 px-3 text-right font-mono text-purple-900 bg-slate-200 text-sm">
                                {TOTALES_HORAS_MAQUINA_PELLAS.totalCosto.toLocaleString('de-DE')}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>

                    {/* 3 Notas de Horas Máquina matching Slide exactly */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                      <span className="text-xs font-bold text-[#0b2545] uppercase tracking-wider block border-b border-slate-100 pb-2 flex items-center gap-1.5">
                        <Wrench className="w-4 h-4 text-purple-600" />
                        Notas Operativas de Maquinaria y Equipos (Pellas Línea 1)
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                        {NOTAS_HORAS_MAQUINA_PELLAS.map((n, i) => (
                          <div key={i} className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                            <strong className="text-slate-900 block font-bold text-xs">{n.titulo}:</strong>
                            <p className="text-[11px] text-slate-600 leading-relaxed">{n.descripcion}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SLIDE 7: COSTOS INDIRECTOS Y PRORRATEO POR ÁREA */}
            {currentSlide === 7 && (
              <div className="py-2 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div>
                    <h2 className="text-2xl font-black text-[#0b2545] tracking-tight">
                      Costos Indirectos · Soporte y Prorrateo ({activeMonth?.mesLabel})
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Estructura de ${categoriasMesAnalisis[4]?.monto.toLocaleString('de-DE')} USD · Nómina Interna, Nómina Talleres y Soporte Operativo
                    </p>
                  </div>

                  {/* Tabs Switcher for Slide 7 */}
                  <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
                    <button
                      onClick={() => setSlide7Tab('prorrateo')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        slide7Tab === 'prorrateo'
                          ? 'bg-[#0b2545] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                      }`}
                    >
                      <PieIcon className="w-3.5 h-3.5" />
                      <span>Prorrateo Pellas vs Resto</span>
                    </button>
                    <button
                      onClick={() => setSlide7Tab('subconceptos')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        slide7Tab === 'subconceptos'
                          ? 'bg-[#0b2545] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Subconceptos de Soporte</span>
                    </button>
                  </div>
                </div>

                {/* TAB 1: PRORRATEO Y ABSORCIÓN DONUT */}
                {slide7Tab === 'prorrateo' && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                      {/* Left: SVG Donut Chart for Indirect Absorption */}
                      <div className="lg:col-span-5 flex flex-col items-center justify-center p-3 border-b lg:border-b-0 lg:border-r border-slate-100">
                        <div className="relative w-52 h-52 flex items-center justify-center">
                          {(() => {
                            const radius = 66;
                            const circ = 2 * Math.PI * radius;
                            const pellasPct = selectedMesNum === 9 ? 0.681 : 0.602;
                            const restoPct = 1 - pellasPct;
                            const pellasDash = pellasPct * circ;
                            const restoDash = restoPct * circ;

                            return (
                              <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                                <circle
                                  cx="100"
                                  cy="100"
                                  r={radius}
                                  fill="transparent"
                                  stroke="#f1f5f9"
                                  strokeWidth="24"
                                />
                                {/* Pellas slice */}
                                <circle
                                  cx="100"
                                  cy="100"
                                  r={radius}
                                  fill="transparent"
                                  stroke="#002060"
                                  strokeWidth="24"
                                  strokeDasharray={`${pellasDash} ${circ - pellasDash}`}
                                  strokeDashoffset="0"
                                  strokeLinecap="round"
                                  className="transition-all duration-500 cursor-pointer"
                                />
                                {/* Rest slice */}
                                <circle
                                  cx="100"
                                  cy="100"
                                  r={radius}
                                  fill="transparent"
                                  stroke="#f59e0b"
                                  strokeWidth="24"
                                  strokeDasharray={`${restoDash} ${circ - restoDash}`}
                                  strokeDashoffset={-pellasDash}
                                  strokeLinecap="round"
                                  className="transition-all duration-500 cursor-pointer"
                                />
                              </svg>
                            );
                          })()}

                          {/* Center Info */}
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                            <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400">Total CIF</span>
                            <span className="text-xl font-black text-[#0b2545] font-mono leading-tight">
                              ${categoriasMesAnalisis[4]?.monto.toLocaleString('de-DE')}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500">USD</span>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center gap-4 text-xs font-mono">
                          <span className="flex items-center gap-1.5 font-bold text-[#002060]">
                            <span className="w-3 h-3 rounded-full bg-[#002060]" /> Pellas Línea 1 ({selectedMesNum === 9 ? '68,1%' : '60,2%'})
                          </span>
                          <span className="flex items-center gap-1.5 font-bold text-amber-600">
                            <span className="w-3 h-3 rounded-full bg-[#f59e0b]" /> Resto Proyectos ({selectedMesNum === 9 ? '31,9%' : '39,8%'})
                          </span>
                        </div>
                      </div>

                      {/* Right: Prorrateo Dynamics & Methodology */}
                      <div className="lg:col-span-7 space-y-3">
                        <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 space-y-1.5 text-xs text-blue-950">
                          <strong className="block font-bold flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-blue-700" />
                            Ancla Horas-Hombre MOD (Metodología Oficial TIMACA)
                          </strong>
                          <p className="text-[11px] leading-relaxed text-slate-700">
                            El modelo contable de TIMACA distribuye los costos indirectos de soporte técnico, supervisión y logística en estricta proporción a las horas-hombre devengadas por la fuerza laboral directa. Pellas Línea 1, al movilizar más de 250 obreros estables, absorbe legítimamente el {selectedMesNum === 9 ? '68,1%' : '60,2%'} de la estructura.
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                            <span className="text-[10.5px] font-bold text-slate-500 uppercase block">Pellas Línea 1</span>
                            <strong className="text-lg font-black font-mono text-[#002060] block">
                              ${Math.round((categoriasMesAnalisis[4]?.monto || 73000) * (selectedMesNum === 9 ? 0.681 : 0.602)).toLocaleString('de-DE')} USD
                            </strong>
                            <span className="text-[10px] text-slate-500">
                              {selectedMesNum === 9 ? '68,1%' : '60,2%'} de absorción corporativa
                            </span>
                          </div>

                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                            <span className="text-[10.5px] font-bold text-slate-500 uppercase block">Resto de Proyectos ({cuentasAuxiliaresMes.length - 1} obras)</span>
                            <strong className="text-lg font-black font-mono text-amber-700 block">
                              ${Math.round((categoriasMesAnalisis[4]?.monto || 73000) * (selectedMesNum === 9 ? 0.319 : 0.398)).toLocaleString('de-DE')} USD
                            </strong>
                            <span className="text-[10px] text-slate-500">
                              {selectedMesNum === 9 ? '31,9%' : '39,8%'} distribuido en frentes activos
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-100 border border-slate-300 text-xs text-slate-800 flex justify-between items-center">
                      <span><strong>Total Indirectos {activeMonth?.mesLabel?.split(' ')[0]}:</strong> ${categoriasMesAnalisis[4]?.monto.toLocaleString('de-DE')} USD</span>
                      <span><strong>Pellas Línea 1 ({selectedMesNum === 9 ? '68,1%' : '60,2%'}):</strong> ${Math.round((categoriasMesAnalisis[4]?.monto || 73000) * (selectedMesNum === 9 ? 0.681 : 0.602)).toLocaleString('de-DE')} USD</span>
                      <span><strong>Demás Proyectos ({selectedMesNum === 9 ? '31,9%' : '39,8%'}):</strong> ${Math.round((categoriasMesAnalisis[4]?.monto || 73000) * (selectedMesNum === 9 ? 0.319 : 0.398)).toLocaleString('de-DE')} USD</span>
                    </div>
                  </div>
                )}

                {/* TAB 2: SUBCONCEPTOS DE SOPORTE */}
                {slide7Tab === 'subconceptos' && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <span className="text-xs font-bold text-[#0b2545] uppercase tracking-wider">
                          Composición de Costos Indirectos de Fabricación y Soporte ({activeMonth?.mesLabel})
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-500">
                          Total: ${categoriasMesAnalisis[4]?.monto.toLocaleString('de-DE')} USD
                        </span>
                      </div>

                      <div className="space-y-3 pt-1">
                        {[
                          { concept: 'Nómina Interna y Dirección Técnica de Obra', monto: selectedMesNum === 9 ? 73000 : 125000, desc: 'Ingenieros residentes, supervisores de seguridad, control de calidad y analistas de costo en planta.' },
                          { concept: 'Nómina de Talleres y Mantenimiento Central', monto: selectedMesNum === 9 ? 42000 : 122000, desc: 'Cuadrillas de mantenimiento de maquinaria, puente grúas de talleres y logística interna.' },
                          { concept: 'Aporte y Gestión Sindical', monto: selectedMesNum === 9 ? 28000 : 57000, desc: 'Obligaciones contractuales de convención colectiva y bienestar laboral.' },
                          { concept: 'Combustible y Lubricantes de Flota', monto: 28000, desc: 'Abastecimiento de gasoil y lubricantes para camiones de transporte y generadores auxiliares.' },
                          { concept: 'Seguridad, Vigilancia Integral y Pólizas', monto: 18000, desc: 'Custodia perimetral 24/7 en talleres y frentes de obra de Puerto Ordaz.' }
                        ].map((sub, idx) => {
                          const maxVal = selectedMesNum === 9 ? 75000 : 130000;
                          const pctBar = Math.min(100, Math.round((sub.monto / maxVal) * 100));

                          return (
                            <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                              <div className="flex items-center justify-between text-xs">
                                <strong className="text-slate-900 font-bold">{sub.concept}</strong>
                                <span className="font-mono font-bold text-[#0b2545] text-sm">
                                  ${sub.monto.toLocaleString('de-DE')} USD
                                </span>
                              </div>
                              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                <div style={{ width: `${pctBar}%` }} className="h-full bg-[#002060] rounded-full" />
                              </div>
                              <p className="text-[11px] text-slate-500 leading-snug">
                                {sub.desc}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SLIDE 8: CONCLUSIONES Y GESTIÓN */}
            {currentSlide === 8 && (
              <div className="py-2 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div>
                    <h2 className="text-2xl font-black text-[#0b2545] tracking-tight">
                      Conclusiones de Control & Matriz Semáforo ({activeMonth?.mesLabel})
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Evaluación estratégica y recomendaciones directivas presentadas al Departamento de Costos · TIMACA
                    </p>
                  </div>

                  {/* Tabs Switcher for Slide 8 */}
                  <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
                    <button
                      onClick={() => setSlide8Tab('semaforo')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        slide8Tab === 'semaforo'
                          ? 'bg-[#0b2545] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                      }`}
                    >
                      <Target className="w-3.5 h-3.5" />
                      <span>Matriz Estratégica (Semáforo)</span>
                    </button>
                    <button
                      onClick={() => setSlide8Tab('notas')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        slide8Tab === 'notas'
                          ? 'bg-[#0b2545] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Dictamen Ejecutivo Escrito</span>
                    </button>
                  </div>
                </div>

                {/* TAB 1: 4-QUADRANT STRATEGIC SEMAPHORE MATRIX */}
                {slide8Tab === 'semaforo' && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Quadrant 1: Fortalezas Operativas (Green) */}
                      <div className="bg-white p-4.5 rounded-2xl border-t-4 border-t-emerald-600 border border-slate-200 shadow-xs space-y-2.5">
                        <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                          <strong className="text-emerald-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            1. Fortalezas Operativas & Cumplimiento
                          </strong>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Semáforo Verde
                          </span>
                        </div>
                        <ul className="space-y-2 text-xs text-slate-700 leading-relaxed">
                          <li className="flex items-start gap-2">
                            <span className="text-emerald-600 font-bold">✔</span>
                            <span><strong>Mano de Obra Directa al día:</strong> $351.891 USD devengados en 61.866 HH sin pasivos laborales atrasados ni contingencias de nómina.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-emerald-600 font-bold">✔</span>
                            <span><strong>Megaproyecto Pellas estabilizado:</strong> Acumulado de $2.068.019 USD (7,0% sobre contrato) con 254 trabajadores activos.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-emerald-600 font-bold">✔</span>
                            <span><strong>Desaceleración controlada:</strong> Gasto mensual de $1.041.504 USD (-23% vs agosto), preservando la liquidez corporativa.</span>
                          </li>
                        </ul>
                      </div>

                      {/* Quadrant 2: Puntos de Atención & Alertas (Amber) */}
                      <div className="bg-white p-4.5 rounded-2xl border-t-4 border-t-amber-500 border border-slate-200 shadow-xs space-y-2.5">
                        <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                          <strong className="text-amber-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                            2. Alertas de Costo & Atención Prioritaria
                          </strong>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                            Semáforo Ámbar
                          </span>
                        </div>
                        <ul className="space-y-2 text-xs text-slate-700 leading-relaxed">
                          <li className="flex items-start gap-2">
                            <span className="text-amber-600 font-bold">⚠</span>
                            <span><strong>Repunte Rueda DRAVO (+137%):</strong> Gasto de $154.004 USD en repotenciación eléctrica; auditar componentes de almacén antes de cierre.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-amber-600 font-bold">⚠</span>
                            <span><strong>Contrato TTE-C-0697 al 90%:</strong> Requiere adenda formal de ampliación de techo presupuestario para evitar sobrecostos.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-amber-600 font-bold">⚠</span>
                            <span><strong>Concentración Procura:</strong> 50,1% de suministros concentrados en dos rubros; vigilar fluctuación de precios de acero y cobre.</span>
                          </li>
                        </ul>
                      </div>

                      {/* Quadrant 3: Eficiencia Operativa y Cumplimiento de Tiempos (Blue) */}
                      <div className="bg-white p-4.5 rounded-2xl border-t-4 border-t-blue-600 border border-slate-200 shadow-xs space-y-2.5">
                        <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                          <strong className="text-blue-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-blue-600" />
                            3. Eficiencia Operativa & Cumplimiento de Tiempos
                          </strong>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                            Semáforo Azul · Productividad
                          </span>
                        </div>
                        <ul className="space-y-2 text-xs text-slate-700 leading-relaxed">
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 font-bold">★</span>
                            <span><strong>Acelerar Hitos de Facturación:</strong> Los proyectos externos son el motor de ingresos de TIMACA. El objetivo central no es recortar costos, sino transformar el avance físico en valuaciones contractuales aprobadas y cobradas a tiempo.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 font-bold">★</span>
                            <span><strong>Cero Tiempos Muertos en Obra:</strong> Garantizar la disponibilidad inmediata de acero, cables, soldadura y grúas de izaje para que las cuadrillas técnicas (61.866 HH) trabajen a plena capacidad, eliminando cuellos de botella que retrasen las fechas de entrega.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 font-bold">★</span>
                            <span><strong>Reasignación Dinámica por Cronograma:</strong> Transferir personal especializado desde obras en remate (Briquetas Fase 2) a frentes con metas contractuales exigentes (Segunda Línea PMH y Pellas 1), asegurando el estricto cumplimiento de los tiempos comprometidos con el cliente.</span>
                          </li>
                        </ul>
                      </div>

                      {/* Quadrant 4: Decisiones Directoriales Inmediatas (Navy/Purple) */}
                      <div className="bg-white p-4.5 rounded-2xl border-t-4 border-t-[#002060] border border-slate-200 shadow-xs space-y-2.5">
                        <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                          <strong className="text-slate-900 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                            <Briefcase className="w-4 h-4 text-[#002060]" />
                            4. Decisiones Directoriales Inmediatas
                          </strong>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-300">
                            Acción Inmediata
                          </span>
                        </div>
                        <ul className="space-y-2 text-xs text-slate-700 leading-relaxed">
                          <li className="flex items-start gap-2">
                            <span className="text-[#002060] font-bold">➜</span>
                            <span><strong>Validación Quincenal por Gerentes:</strong> Formalizar la aprobación técnica previa de materiales y servicios por cada responsable de obra.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-[#002060] font-bold">➜</span>
                            <span><strong>Adenda Contractual TTE-C-0697:</strong> Elevar a Junta Directiva la solicitud de adenda antes de comprometer nuevos despachos.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-[#002060] font-bold">➜</span>
                            <span><strong>Desembolso Procura Q4 Pellas 1:</strong> Autorizar los anticipos de acero para garantizar el montaje electromecánico de fin de año.</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: DICTAMEN EJECUTIVO ESCRITO (NOTAS EDITABLES) */}
                {slide8Tab === 'notas' && (
                  <div className="space-y-3 animate-fade-in">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="text-xs font-bold text-[#0b2545] uppercase tracking-wider flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-blue-600" />
                          Dictamen Técnico Oficial · Analista de Costos
                        </span>
                        <div className="flex items-center gap-2">
                          {savedSuccess && (
                            <span className="text-xs text-emerald-700 font-bold flex items-center gap-1 animate-fade-in">
                              <CheckCircle2 className="w-3.5 h-3.5" /> ¡Guardado!
                            </span>
                          )}
                          <button
                            onClick={handleSaveNotas}
                            className="px-3 py-1 bg-[#0b2545] text-white text-xs font-bold rounded-lg hover:bg-[#081c33] transition-colors flex items-center gap-1 shadow-2xs"
                          >
                            <Save className="w-3.5 h-3.5" />
                            Guardar Notas
                          </button>
                        </div>
                      </div>

                      <textarea
                        value={notasGestion}
                        onChange={(e) => setNotasGestion(e.target.value)}
                        rows={9}
                        className="w-full text-xs font-mono text-slate-800 p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#002060]/30 transition-all leading-relaxed"
                        placeholder="Escriba aquí las conclusiones analíticas del informe mensual..."
                      />
                    </div>
                  </div>
                )}

                <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-200">
                  <span>Elaborado por: <strong className="text-slate-700">Ing. Civil Alejandra Tesara</strong> (Analista de Costos)</span>
                  <span>Destinatario: <strong className="text-[#0b2545]">Gerencia de Administración y Finanzas / Departamento de Costos</strong> · TIMACA</span>
                </div>
              </div>
            )}

            {/* Bottom Navigation Bar of Slides */}
            <div className="flex items-center justify-between border-t border-slate-200 pt-3 mt-3">
              <div className="flex items-center gap-1.5 flex-wrap">
                {slides.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-2.5 rounded-full transition-all ${
                      currentSlide === idx ? 'w-7 bg-[#0b2545]' : 'w-2.5 bg-slate-300 hover:bg-slate-400'
                    }`}
                    title={s.title}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={currentSlide === 0}
                  onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 border border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-slate-700 flex items-center gap-1 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Anterior</span>
                </button>
                <button
                  disabled={currentSlide === slides.length - 1}
                  onClick={() => setCurrentSlide(prev => Math.min(slides.length - 1, prev + 1))}
                  className="px-3.5 py-1.5 text-xs font-bold bg-[#0b2545] hover:bg-[#081c33] disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-white flex items-center gap-1 transition-colors shadow-xs"
                >
                  <span>Siguiente</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* VIEW MODE 2: DOSSIER IMPRIMIBLE COMPLETO */
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-10 shadow-xs space-y-8 print:border-none print:shadow-none print:p-0">
          {/* Header oficial */}
          <div className="border-b-2 border-neutral-900 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-extrabold tracking-widest uppercase text-blue-600">
                TALLERES INDUSTRIALES METALÚRGICOS ANTONIO C.A. (TIMACA)
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight mt-1">
                INFORME EJECUTIVO DE COSTOS · {activeMonth?.mesLabel.toUpperCase()}
              </h1>
              <p className="text-sm font-semibold text-neutral-600 mt-1">
                Modelo Estrella de Costos 2026 · {cuentasAuxiliaresMes.length} Cuentas Auxiliares Activas
              </p>
            </div>

            <div className="text-left sm:text-right text-xs text-neutral-500 space-y-1">
              <p><strong className="text-neutral-800">Elaborado por:</strong> Ing. Civil Alejandra Tesara (Analista de Costos)</p>
              <p><strong className="text-neutral-800">Destinatario:</strong> Departamento de Costos</p>
              <p><strong className="text-neutral-800">Moneda base:</strong> Dólares Americanos (USD)</p>
            </div>
          </div>

          {/* 1. Tabla Oficial PPT de Distribución Mensual */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              1. Distribución Mensual por Categoría de Costo (Consolidado 2026)
            </h3>
            <div className="overflow-x-auto rounded-lg border border-neutral-300">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#0b2545] text-white font-bold">
                    <th className="py-2.5 px-3 min-w-[170px]">Distribución</th>
                    {mesesHeaders.map((m) => (
                      <th key={m} className="py-2.5 px-3 text-right">{m}</th>
                    ))}
                    <th className="py-2.5 px-3 text-right bg-[#081c33]">Total 2026</th>
                    <th className="py-2.5 px-3 text-center bg-[#081c33]">Variación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {TABLA_PPT_DISTRIBUCION_2026.map((row) => (
                    <tr key={row.categoria} className="hover:bg-neutral-50">
                      <td className="py-2 px-3 font-semibold text-neutral-900">{row.categoria}</td>
                      {row.meses.map((val, idx) => (
                        <td key={idx} className="py-2 px-3 text-right font-mono tabular-nums text-neutral-700">
                          {val.toLocaleString('de-DE')}
                        </td>
                      ))}
                      <td className="py-2 px-3 text-right font-mono tabular-nums font-bold text-neutral-900 bg-neutral-50">
                        {row.total2026.toLocaleString('de-DE')}
                      </td>
                      <td className="py-2 px-3 text-center font-mono font-bold text-xs bg-neutral-50">
                        <span className={row.esPositiva ? 'text-emerald-700' : row.variacionNum < 0 ? 'text-amber-700' : 'text-neutral-600'}>
                          {row.variacionNum > 0 ? '▲ ' : '▼ '}
                          {row.variacion}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-neutral-100 text-neutral-900 font-bold border-t-2 border-neutral-300">
                    <td className="py-2.5 px-3">Total</td>
                    {TOTALES_MESES_PPT.map((tm) => (
                      <td key={tm.mesNum} className="py-2.5 px-3 text-right font-mono tabular-nums text-xs">
                        {tm.total.toLocaleString('de-DE')}
                      </td>
                    ))}
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-blue-700 font-bold">
                      {TOTALES_MESES_PPT.reduce((a, b) => a + b.total, 0).toLocaleString('de-DE')}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-xs text-amber-700 font-bold">
                      ▼ 2%
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* 2. Total Proyectos Externos con Despachos */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                2. Total Proyectos Externos con Despachos ({activeMonth?.mesLabel})
              </h3>
              <span className="text-xs text-neutral-500">{cuentasAuxiliaresMes.length} Cuentas Auxiliares Activas</span>
            </div>

            <div className="border border-neutral-300 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0b2545] text-white font-bold">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center">#</th>
                    <th className="py-2.5 px-3 min-w-[110px]">Cuenta Auxiliar</th>
                    <th className="py-2.5 px-3 min-w-[280px]">Proyecto Externo (Cliente)</th>
                    <th className="py-2.5 px-3 text-right">Monto {activeMonth?.mesLabel?.split(' ')[0]} (USD)</th>
                    <th className="py-2.5 px-3 text-right">% Mes</th>
                    <th className="py-2.5 px-3 text-right">Presupuesto (USD)</th>
                    <th className="py-2.5 px-3 text-center">% Uso Presup.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {cuentasPresupuestoMetrics.items.map((c, idx) => {
                    const m = c.metricas;
                    return (
                      <tr key={c.codigo} className="hover:bg-neutral-50">
                        <td className="py-2 px-3 text-center font-mono text-neutral-400 font-bold">{idx + 1}</td>
                        <td className="py-2 px-3 font-mono font-bold text-neutral-900">{c.codigo}</td>
                        <td className="py-2 px-3 text-neutral-800 font-medium">{c.proyecto}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-neutral-900">${c.total.toLocaleString('de-DE')}</td>
                        <td className="py-2 px-3 text-right font-mono font-semibold text-neutral-600">{c.porcentaje}%</td>
                        <td className="py-2 px-3 text-right font-mono text-neutral-700">
                          {m.tienePresupuesto ? `$${m.totalPresupuesto.toLocaleString('de-DE', { maximumFractionDigits: 0 })}` : '-'}
                        </td>
                        <td className="py-2 px-3 text-center font-mono font-bold">
                          {m.tienePresupuesto ? (
                            <span className={`px-2 py-0.5 rounded text-[11px] ${
                              m.estadoAlerta === 'critico' || m.estadoAlerta === 'excedido'
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : m.estadoAlerta === 'alerta'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}>
                              {m.porcentajeUso}%
                            </span>
                          ) : (
                            <span className="text-neutral-400 text-[10px]">S/P</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-neutral-100 font-bold border-t-2 border-neutral-300">
                  <tr>
                    <td colSpan={3} className="py-2.5 px-3">TOTAL GENERAL PROYECTOS EXTERNOS:</td>
                    <td className="py-2.5 px-3 text-right font-mono text-blue-700 text-sm">
                      {formatCurrency(activeMonth?.totalMonto || 0)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">100.0%</td>
                    <td className="py-2.5 px-3 text-right font-mono text-blue-900">
                      ${cuentasPresupuestoMetrics.totalPresupuestoConsolidado.toLocaleString('de-DE', { maximumFractionDigits: 0 })}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-blue-900">
                      {cuentasPresupuestoMetrics.pctUsoGlobal}% Uso
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* 3. Conclusiones y Firmas */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                3. Conclusiones de Gestión Operativa
              </h3>
              <div className="flex items-center gap-2 print:hidden">
                {savedSuccess && (
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Guardado
                  </span>
                )}
                <button
                  onClick={handleSaveNotas}
                  className="flex items-center gap-1 text-xs px-2.5 py-1 bg-neutral-900 text-white rounded-md hover:bg-neutral-800 transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Guardar Notas</span>
                </button>
              </div>
            </div>

            <textarea
              rows={4}
              value={notasGestion}
              onChange={(e) => setNotasGestion(e.target.value)}
              className="w-full text-xs p-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-neutral-50 leading-relaxed font-sans"
            />
          </div>

          <div className="pt-10 border-t border-neutral-300 grid grid-cols-2 gap-8 text-center text-xs">
            <div className="space-y-1">
              <div className="border-b border-neutral-400 w-48 mx-auto mb-2 h-12" />
              <p className="font-bold text-neutral-900">Alejandra Tesara</p>
              <p className="text-neutral-500">Analista de Costos · TIMACA</p>
            </div>
            <div className="space-y-1">
              <div className="border-b border-neutral-400 w-48 mx-auto mb-2 h-12" />
              <p className="font-bold text-neutral-900">Departamento de Costos</p>
              <p className="text-neutral-500">Revisión y Control de Gestión</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
