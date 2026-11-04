import React, { useState, useMemo, useEffect } from 'react';
import { useCostos } from '../context/CostosContext';
import { formatCurrency, formatNumber, formatUnitPriceRaw } from '../utils/dateHelpers';
import { TABLA_PPT_DISTRIBUCION_2026, TOTALES_MESES_PPT, CUENTAS_AUXILIARES_EXACTAS_AGOSTO_2026, CUENTAS_AUXILIARES_EXACTAS_SEPTIEMBRE_2026, CUENTAS_AUXILIARES_EXACTAS_OCTUBRE_2026, TOTALES_NOMINA_SEMANAL_SEPTIEMBRE, DESGLOSE_NOMINA_SEPTIEMBRE_PROYECTOS } from '../data/mockCostosTimaca';
import { exportSalidasToExcel } from '../utils/excelHandler';
import { exportInformeToPPTX } from '../utils/exportInformeToPPTX';
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
  Info,
  TableProperties,
  Square,
  RectangleHorizontal,
  LayoutGrid
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
  NOTAS_HORAS_MAQUINA_PELLAS,
  TABLA_HORAS_MAQUINA_PELLAS_SEPTIEMBRE_OFICIAL,
  TOTALES_HORAS_MAQUINA_PELLAS_SEPTIEMBRE,
  NOTAS_HORAS_MAQUINA_PELLAS_SEPTIEMBRE
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

  // Active month for the report (defaults to latest month = Octubre)
  const [selectedMesNum, setSelectedMesNum] = useState<number>(10);
  const [viewMode, setViewMode] = useState<'diapositivas' | 'documento'>('diapositivas');
  const [currentSlide, setCurrentSlide] = useState<number>(0); // Default to Slide 0 (Portada Oficial)
  const [slide1Tab, setSlide1Tab] = useState<'grafica' | 'tabla'>('grafica');
  const [slide2Tab, setSlide2Tab] = useState<'distribucion' | 'waterfall' | 'kpi' | 'nomina'>('distribucion');
  const [slide3Tab, setSlide3Tab] = useState<'pareto' | 'tabla'>('pareto');
  const [slide4Tab, setSlide4Tab] = useState<'variaciones' | 'mixProcura'>('variaciones');
  const [slide5Tab, setSlide5Tab] = useState<'contrato' | 'evolucion' | 'tabla-evolutivo'>('contrato');
  const [slide6Tab, setSlide6Tab] = useState<'servicios' | 'horasMaquina'>('servicios');
  const [slidePmhTab, setSlidePmhTab] = useState<'ambos' | 'materiales' | 'obras'>('ambos');
  const [slideDravoTab, setSlideDravoTab] = useState<'evolucion' | 'blindajes'>('evolucion');
  const [slide7Tab, setSlide7Tab] = useState<'prorrateo' | 'subconceptos'>('prorrateo');
  const [slide8Tab, setSlide8Tab] = useState<'semaforo' | 'notas'>('semaforo');

  // Aspect ratio mode: '4:3' (Cuadrada, más balanceada y ejecutiva) o '16:9' (Panorámica estándar)
  const [aspectMode, setAspectMode] = useState<'4:3' | '16:9'>(() => {
    try {
      const saved = localStorage.getItem('TIMACA_INFORME_ASPECT_MODE');
      if (saved === '16:9') return '16:9';
      return '4:3';
    } catch {
      return '4:3';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('TIMACA_INFORME_ASPECT_MODE', aspectMode);
    } catch {}
  }, [aspectMode]);

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
    if (selectedMesNum === 10) {
      return CUENTAS_AUXILIARES_EXACTAS_OCTUBRE_2026.map((item, idx) => ({
        idx: idx + 1,
        codigo: item.cuentaAuxiliar,
        proyecto: item.proyecto,
        total: item.montoOctubre || item.total || 0,
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

  // Proyecto Pellas Línea 1 metrics for the selected month
  const pellasMesData = useMemo(() => {
    if (selectedMesNum === 8) {
      return {
        montoMes: 596358,
        porcentajeMes: 49.8,
        acumulado2026: 1720638,
        cuadrilla: 238,
        nominaMes: 167193,
        horasMaquina: 1396
      };
    }
    if (selectedMesNum === 9) {
      return {
        montoMes: 668340,
        porcentajeMes: 40.8,
        acumulado2026: 2388978,
        cuadrilla: 254,
        nominaMes: 133185,
        horasMaquina: 812
      };
    }
    if (selectedMesNum === 10) {
      return {
        montoMes: 867861.15,
        porcentajeMes: 60.1,
        acumulado2026: 3256839.15,
        cuadrilla: 254,
        nominaMes: 0,
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
          `Para el mes de agosto de 2026, el gasto consolidado oficial en proyectos externos cerró en $1.197.600,00 USD, manteniendo una rigurosa disciplina de costos y avance en 51 frentes activos.\n\n` +
          `La ejecución estuvo fuertemente liderada por Línea 1 Pellas ($596.358 USD), Segunda Línea PMH ($197.962 USD), Bandas PMH ($109.279 USD) y Briquetas Fase 2 ($88.918 USD).\n\n` +
          `En cuanto a las categorías: Materiales Directos totalizó $371.927 USD, Costos Indirectos $339.978 USD, Mano de Obra Directa $277.936 USD, Servicios $117.970 USD y Horas Máquina $89.789 USD.`
        );
      } else if (selectedMesNum === 9) {
        setNotasGestion(
          `Para el mes de septiembre de 2026, el gasto consolidado oficial en proyectos externos cerró en $1.613.225,00 USD (+36,8% vs agosto de $1.197.600 USD), acumulando un total anual consolidado de $12.178.093,00 USD en los 9 meses de 2026.\n\n` +
          `La ejecución estuvo liderada por el proyecto Recuperación de Línea 1 de Planta de Pellas (TTE-C-0706) con $668.340 USD (40,8% del mes), Segunda Línea PMH ($291.949 USD / 17,8%), Repotenciación de Rueda de Cangilones DRAVO ($199.356 USD / 12,2%), Briquetas Fase 2 ($173.502 USD / 10,6%) y Caldera BF-600 ($68.651 USD / 4,2%).\n\n` +
          `La categoría Materiales Directos creció a $868.067 USD (+133% vs agosto) por inyección masiva en procura de aceros y tolvas, Costos Indirectos se situó en $393.375 USD (+15,7%), Mano de Obra Directa en $196.665 USD (-20,4%), Servicios en $99.540 USD (-15,6%) y Horas Máquina en $55.578 USD (-38,1%).`
        );
      } else if (selectedMesNum === 10) {
        setNotasGestion(
          `Para el mes de octubre de 2026, el gasto consolidado oficial en proyectos externos cerró en $1.444.345,28 USD, acumulando un total anual consolidado de $13.496.521,32 USD en los 10 meses de 2026.\n\n` +
          `La ejecución estuvo ampliamente liderada por el proyecto Recuperación de Línea 1 de Planta de Pellas (TTE-C-0706) con $867.861,15 USD (60,1% del total mensual), impulsado por contratos estratégicos de instrumentación y automatización con Yokogawa ($686.040 USD), Henan Front ($40.000 USD), Mamusa ($4.920 USD) y compras de insumos directos de taller.\n\n` +
          `Le siguen Segunda Línea PMH (TTE-C-0671) con $258.881,82 USD (17,9%), Repotenciación Rueda de Cangilones DRAVO (TTE-C-0653) con $106.811,57 USD (7,4%) y Fase 2 Planta de Briquetas (TTE-C-0668) con $42.228,88 USD (2,9%).\n\n` +
          `Por categorías operativas: Servicios Directos totalizó $967.478,81 USD (67,0%) y Materiales Directos alcanzó $476.866,47 USD (33,0%). Los conceptos de Mano de Obra Directa y Costos Indirectos se encuentran en proceso de conciliación final con RRHH y Administración.`
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
    { id: 'pellas-general', title: `5. Proyecto Pellas Línea 1 (TTE-C-0706) · ${activeMonth?.mesLabel}` },
    { id: 'pellas-servicios-equipos', title: '6. Pellas Línea 1 · Servicios Directos y Horas Máquina' },
    { id: 'pmh-despacho-segunda-linea', title: `7. Frente PMH · Segunda Línea (TTE-C-0671) & Red de Transporte` },
    { id: 'dravo-rueda-cangilones', title: `8. Repotenciación Rueda de Cangilones DRAVO (TTE-C-0653)` },
    { id: 'costos-indirectos-prorrateo', title: `9. Costos Indirectos y Prorrateo por Área (${activeMonth?.mesLabel})` },
    { id: 'conclusiones', title: '10. Conclusiones y Control de Gestión' }
  ], [activeMonth]);

  const [isExportingPPTX, setIsExportingPPTX] = useState(false);

  const handleExportPPTX = async () => {
    try {
      setIsExportingPPTX(true);
      await exportInformeToPPTX({
        selectedMesNum,
        mesLabel: activeMonth?.mesLabel || `Mes ${selectedMesNum}`,
        totalMes: activeMonth?.totalMonto || 1613225,
        cuentasAuxiliaresMes: cuentasPresupuestoMetrics.items,
        categoriasMesAnalisis,
        pellasMesData,
        notasGestion
      });
    } catch (error) {
      console.error('Error al exportar PowerPoint:', error);
    } finally {
      setIsExportingPPTX(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const mesesHeaders = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct'];

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

          {/* Download PowerPoint (.pptx) Button */}
          <button
            onClick={handleExportPPTX}
            disabled={isExportingPPTX}
            title="Descargar presentación oficial en formato Microsoft PowerPoint (.pptx)"
            className="flex items-center gap-2 px-4 py-2 text-xs font-black text-white bg-[#002060] hover:bg-[#0B2545] border border-blue-900 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
          >
            <Presentation className="w-4 h-4 text-amber-300 shrink-0" />
            <span className="tracking-wide">
              {isExportingPPTX ? 'Generando PowerPoint...' : 'Descargar PowerPoint (.pptx)'}
            </span>
          </button>

          {/* Download Excel Button */}
          <button
            onClick={() => exportSalidasToExcel(salidas, resumenSemanas, resumenMeses, resumenProyectos)}
            title="Descargar datos del informe en formato Excel (.xlsx)"
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 rounded-lg hover:bg-emerald-100 transition-colors shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-700" />
            <span>Descargar Excel</span>
          </button>

          {/* Print / PDF Button */}
          <button
            onClick={handlePrint}
            title="Imprimir informe o guardar como PDF"
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-neutral-800 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors shadow-xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-neutral-600" />
            <span>Imprimir / PDF</span>
          </button>
        </div>
      </div>

      {/* VIEW MODE 1: MODO DIAPOSITIVAS (PRESENTACIÓN EXACTA POWERPOINT) */}
      {viewMode === 'diapositivas' ? (
        <div className={`transition-all duration-300 mx-auto w-full space-y-3.5 ${
          aspectMode === '4:3' 
            ? 'max-w-[1040px]' 
            : 'max-w-[1400px]'
        }`}>
          {/* Selector Rápido de Lámina y Selector de Formato Cuadrada / Panorámica */}
          <div className="bg-white rounded-2xl p-2.5 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
            {/* Quick Slide Numbers */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 pb-1 sm:pb-0 min-w-0 flex-1">
              {slides.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => setCurrentSlide(idx)}
                  className={`px-2.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer text-xs shrink-0 ${
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

            {/* Selector de Proporción / Aspecto de Diapositiva */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
              <span className="text-[10px] font-bold text-slate-500 uppercase px-1.5 hidden md:inline">Aspecto:</span>
              <button
                onClick={() => setAspectMode('4:3')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  aspectMode === '4:3'
                    ? 'bg-[#0b2545] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
                title="Formato Cuadrado (4:3) - Estructura balanceada y compacta, menos rectangular"
              >
                <Square className="w-3.5 h-3.5 text-amber-400" />
                <span>Cuadrada (4:3)</span>
              </button>
              <button
                onClick={() => setAspectMode('16:9')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  aspectMode === '16:9'
                    ? 'bg-[#0b2545] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
                title="Formato Panorámico (16:9) - Ancho estándar"
              >
                <RectangleHorizontal className="w-3.5 h-3.5 text-blue-400" />
                <span>Panorámica (16:9)</span>
              </button>
            </div>
          </div>

          <div className={`bg-slate-50 text-slate-800 rounded-2xl p-5 sm:p-7 min-h-[640px] flex flex-col justify-between shadow-md border border-slate-200 relative transition-all ${
            aspectMode === '4:3' ? 'shadow-xl ring-1 ring-slate-900/5' : ''
          }`}>
            <div id="informe-slide-capture-area" className="flex-1 flex flex-col justify-between">
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
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleExportPPTX}
                      disabled={isExportingPPTX}
                      title="Descargar presentación editable en formato Microsoft PowerPoint (.pptx)"
                      className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-full bg-[#002060] text-white hover:bg-[#0B2545] shadow-xs transition-all cursor-pointer"
                    >
                      <Presentation className="w-3.5 h-3.5 text-amber-300" />
                      <span>{isExportingPPTX ? 'Generando...' : 'Descargar PPTX'}</span>
                    </button>
                    <span className="hidden sm:inline-block text-xs font-mono font-bold px-3.5 py-1.5 rounded-full bg-slate-100 text-[#002060] border border-slate-300 shadow-2xs">
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
                      Cifras consolidadas en USD · Modelo Estrella TIMACA · Total Acumulado Oficial: <strong className="text-[#0b2545]">${TOTALES_MESES_PPT.reduce((a, b) => a + b.total, 0).toLocaleString('de-DE')} USD</strong> · Mes Activo: <strong className="text-amber-600 font-bold">{activeMonth?.mesLabel}</strong>
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
                      <span>Matriz Oficial (10 Meses)</span>
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
                          Materiales Directos ({selectedMesNum === 10 ? '$476.866 USD · 33,0%' : '$3.967.415 USD · 32,6%'})
                        </strong>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          {selectedMesNum === 10 
                            ? 'Procura sostenida de aceros, planchas antidesgaste, tuberías y suministros directos en taller y campo, acumulando un total anual consolidado de $4.444.281 USD en 2026.'
                            : 'Columna vertebral de la inversión física. En septiembre alcanzó su máximo anual de $868.067 USD (+133% vs agosto), impulsado por procura mayor de aceros, tolvas y componentes eléctricos para Segunda Línea PMH, DRAVO y Pellas.'}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-orange-50/70 border border-orange-200 space-y-1">
                        <strong className="text-orange-950 block font-bold flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                          Servicios Especializados ({selectedMesNum === 10 ? '$967.479 USD · 67,0%' : '$2.904.145 USD · 23,8%'})
                        </strong>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          {selectedMesNum === 10
                            ? 'Salto presupuestario (+872% vs septiembre) por la inyección estratégica en servicios de ingeniería, instrumentación y control en Pellas Línea 1 con Yokogawa ($686K) y Henan Front ($40K).'
                            : 'Concentró un pico en junio ($1.639.332 USD) por importaciones marítimas mayores. En septiembre se sitúa en $99.540 USD (-16%), concentrado un 69,4% en Pellas Línea 1 ($69.056 USD) para traslado diario de personal y vigilancia patrimonial.'}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                        <strong className="text-emerald-950 block font-bold flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                          {selectedMesNum === 10 ? 'Total Proyectos Externos ($1.444.345 USD)' : 'Mano de Obra Directa ($2.242.917 USD · 18,4%)'}
                        </strong>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          {selectedMesNum === 10
                            ? 'Ejecución auditada al centavo en 35 frentes activos. Conceptos de Mano de Obra y Costos Indirectos se encuentran en proceso de conciliación final con RRHH y Administración.'
                            : 'Fuerza laboral técnica devengada en frentes de obra. En septiembre cerró en $196.665 USD en 10 proyectos externos, liderada por Pellas Línea 1 ($133.185 USD · 60,2%) y Rehabilitación Bandas PMH ($28.142 USD · 12,7%).'}
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
                        <>Gasto mensual auditado de <strong className="text-[#0b2545]">$1,20M USD ($1.197.600 USD)</strong> con frentes activos y tracción sostenida en Línea 1 Pellas ($596K) y 2da Línea PMH ($198K).</>
                      ) : selectedMesNum === 9 ? (
                        <>Cierre Consolidado Oficial (<strong className="text-emerald-700">+34,7%</strong>): El gasto del mes se situó en <strong className="text-[#0b2545]">$1,61M USD ($1.613.225 USD)</strong>, acumulando <strong className="text-blue-900">$12.052.176 USD</strong> en el ejercicio 2026 con aceleración en Línea 1 Pellas ($668K), 2da Línea PMH ($292K) y DRAVO ($199K).</>
                      ) : selectedMesNum === 10 ? (
                        <>Cierre Auditado Proyectos Externos: Gasto mensual de <strong className="text-[#0b2545]">$1,44M USD ($1.444.345,28 USD)</strong>, acumulando <strong className="text-blue-900">$13.496.521,32 USD</strong> en el ejercicio 2026 con fuerte tracción en Línea 1 Pellas ($867.861 USD · 60,1%), 2da Línea PMH ($258.882 USD · 17,9%) y DRAVO ($106.812 USD · 7,4%).</>
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
                    <button
                      onClick={() => setSlide2Tab('nomina')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        slide2Tab === 'nomina'
                          ? 'bg-[#0b2545] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Auditoría de Nómina ($196K)</span>
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

                    {/* Strategic Key takeaway: Explicación detallada de en qué se desglosa y a dónde va */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-950 flex items-start gap-2.5">
                        <Sparkles className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                        <div className="space-y-1.5">
                          <strong className="block font-bold text-sm text-[#002060]">
                            Focalización en Costos Directos ({selectedMesNum === 9 ? '75,6% · $1.219.850 USD' : selectedMesNum === 8 ? '71,6% · $857.622 USD' : 'Costos Directos de Obra'}):
                          </strong>
                          <p className="text-[11.5px] leading-relaxed text-slate-700">
                            <strong>En qué se desglosa:</strong> {
                              selectedMesNum === 9 ? (
                                'Materiales Directos ($868.067 USD · 53,0%), Mano de Obra Directa ($196.665 USD · 13,5%), Servicios Directos ($99.540 USD · 6,1%) y Horas Máquina ($55.578 USD · 3,4%).'
                              ) : (
                                'Materiales Directos ($371.927 USD), Mano de Obra Directa ($277.936 USD), Servicios ($117.970 USD) y Horas Máquina ($89.789 USD).'
                              )
                            }
                          </p>
                          <p className="text-[11.5px] leading-relaxed text-slate-700">
                            <strong>A dónde va:</strong> {
                              selectedMesNum === 9 ? (
                                'Se asigna 100% a la ejecución en frentes de obra física: Pellas Línea 1 ($431.652 USD directos), Segunda Línea PMH ($281.082 USD directos), Repotenciación DRAVO ($199.117 USD directos en materiales puros) y Briquetas Fase 2 ($140.245 USD directos).'
                              ) : (
                                'Concentrado en frentes de taller y campo: Pellas Línea 1 ($391.797 USD directos), Segunda Línea PMH ($184.238 USD directos), Bandas PMH ($75.405 USD directos) y Briquetas Fase 2 ($71.306 USD directos).'
                              )
                            }
                          </p>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 flex items-start gap-2.5">
                        <Target className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                        <div className="space-y-1.5">
                          <strong className="block font-bold text-sm text-emerald-950">
                            Estructura de Soporte y Prorrateo CIF ({selectedMesNum === 9 ? '24,4% · $393.375 USD' : selectedMesNum === 8 ? '28,4% · $339.978 USD' : 'Costos Indirectos Corporativos'}):
                          </strong>
                          <p className="text-[11.5px] leading-relaxed text-slate-700">
                            <strong>En qué se desglosa:</strong> {
                              selectedMesNum === 9 ? (
                                'Nómina TIMACA Staff Fijo ($125.000 USD), Nómina Talleres Centrales ($122.000 USD), Aporte Sindical ($58.952 USD), Combustible ($50.413 USD), Bonos ($6.700 USD), Vigilancia ($4.803 USD) y Otros ($25.507 USD).'
                              ) : (
                                'Nómina TIMACA ($128.000 USD), Nómina Talleres ($120.000 USD), Sindicato ($49.630 USD), Combustible ($24.651 USD), Vigilancia ($4.803 USD), Bonos ($4.000 USD) y Otros ($8.894 USD).'
                              )
                            }
                          </p>
                          <p className="text-[11.5px] leading-relaxed text-slate-700">
                            <strong>A dónde va:</strong> {
                              selectedMesNum === 9 ? (
                                'Se prorratea matemáticamente entre los 10 proyectos externos según su proporción de Mano de Obra Directa (MOD): Pellas Línea 1 absorbe $236.688 USD (60,17%), Bandas PMH $50.012 USD (12,71%), Briquetas Fase 2 $27.050 USD (6,88%) y Segunda Línea PMH $26.334 USD (6,69%).'
                              ) : (
                                'Prorrateado hacia proyectos externos según MOD devengada: Pellas Línea 1 absorbe $204.561 USD (60,16%), Bandas PMH $33.874 USD (9,96%) y Briquetas Fase 2 $17.612 USD (5,18%).'
                              )
                            }
                          </p>
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
                          const prevTotal = mesAnterior?.totalMonto || 1197600;
                          const currTotal = activeMonth?.totalMonto || 1613225;

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
                        <strong className="text-slate-900 block font-bold mb-1">
                          {selectedMesNum === 9 ? 'Inyección Masiva en Procura (+ $496K):' : 'Impacto Procura (+ $133K):'}
                        </strong>
                        <p className="text-slate-600 text-[11px] leading-relaxed">
                          {selectedMesNum === 9 ? (
                            'Materiales Directos subió a $868.067 USD (+133% vs agosto) por despacho mayor de aceros, tolvas de transferencia y componentes eléctricos para Segunda Línea PMH, DRAVO y Pellas.'
                          ) : (
                            'Materiales Directos subió a $371.927 USD impulsado por aceros estructurales para 2da Línea PMH y repuestos eléctricos de la rueda de cangilones DRAVO.'
                          )}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <strong className="text-slate-900 block font-bold mb-1">
                          {selectedMesNum === 9 ? 'Variación de Nómina y Servicios (- $75K):' : 'Consolidación de Nómina (+ $65K):'}
                        </strong>
                        <p className="text-slate-600 text-[11px] leading-relaxed">
                          {selectedMesNum === 9 ? (
                            'Mano de Obra Directa cerró en $196.665 USD (-$57K) en 10 proyectos con 5 semanas (Sem 35 a 39). Servicios Directos se normalizó a $99.540 USD (-$18K) con Pellas concentrando el 69%.'
                          ) : (
                            'La Mano de Obra se situó en $277.936 USD debido a la incorporación de la nómina de la semana 31 y el staff técnico continuo de Pellas Línea 1.'
                          )}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <strong className="text-slate-900 block font-bold mb-1">
                          {selectedMesNum === 9 ? 'Soporte y Horas Máquina (+ $19K):' : 'Ajuste CIF y HM (+ $127K):'}
                        </strong>
                        <p className="text-slate-600 text-[11px] leading-relaxed">
                          {selectedMesNum === 9 ? (
                            'Los Costos Indirectos (CIF) subieron a $393.375 USD (+$53K) por combustible y sindicato, mientras Horas Máquina ajustó a $55.578 USD (-$34K) optimizada en izajes críticos de Pellas.'
                          ) : (
                            'Estructura de costos indirectos oficial de $339.978 USD y uso intensivo de maquinaria pesada ($89.789 USD) en montajes estructurales.'
                          )}
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
                              'Estructura de costos indirectos del mes ($339.978 USD), integrando Nómina Interna ($128.000 USD), Nómina Talleres ($120.000 USD) y Sindicato ($49.630 USD).'
                            ) : selectedMesNum === 9 ? (
                              idx === 0 ? 'Despachos de procura focalizados en acero estructural, tolvas, cables y componentes para Segunda Línea PMH ($266K), DRAVO ($183K), Pellas ($174K) y Briquetas ($125K).' :
                              idx === 1 ? 'Servicios operativos de traslado diario de cuadrillas ($45,9K), vigilancia patrimonial externa ($13,2K) y alquiler de equipos de apoyo ($8,4K), concentrados en Pellas.' :
                              idx === 2 ? 'Nómina devengada en 5 semanas (Sem 35 a 39) en 10 proyectos externos ($196.665 USD), liderada por Pellas Línea 1 ($133.185 USD · 60,2%) y Bandas PMH ($28.142 USD · 12,7%).' :
                              idx === 3 ? '811,7 horas de maquinaria pesada propia ($55.578 USD), asignadas 100% a maniobras críticas de izaje y acarreo en Pellas Línea 1 (Grúa Demag AC200).' :
                              'Costos indirectos y soporte corporativo de operaciones ($393.375 USD), integrando Nómina TIMACA ($125K), Talleres ($122K), Sindicato ($59K) y Combustible ($50K).'
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
                            'Cierre consolidado con ejecución de $1.613.225 USD (+36,8% vs agosto de $1.197.600 USD), concentrado un 75,6% ($1.219.850 USD) en costos directos de obra y un 24,4% ($393.375 USD) en soporte corporativo.'
                          ) : (
                            `Ejecución mensual total de ${formatCurrency(activeMonth?.totalMonto || 0)}, con ${categoriasMesAnalisis[0].categoria} ($${categoriasMesAnalisis[0].monto.toLocaleString('de-DE')}) y ${categoriasMesAnalisis[2].categoria} ($${categoriasMesAnalisis[2].monto.toLocaleString('de-DE')}) como principales impulsores operativos.`
                          )
                        }
                      </span>
                    </div>
                  </div>
                )}

                {/* TAB 4: AUDITORÍA DE NÓMINA (MOD) */}
                {slide2Tab === 'nomina' && (
                  <div className="space-y-4 animate-fade-in">
                    {/* 4 KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Total Nómina Septiembre</span>
                        <span className="text-2xl font-black font-mono text-[#002060] block mt-1">$196.665 USD</span>
                        <span className="text-[11px] text-emerald-700 font-semibold block mt-0.5">Semanas 36 a 39 · Auditada al centavo</span>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Horas-Hombre Devengadas</span>
                        <span className="text-2xl font-black font-mono text-slate-900 block mt-1">55.277 HH</span>
                        <span className="text-[11px] text-blue-700 font-semibold block mt-0.5">Promedio 13.819 HH/semana</span>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Tarifa Promedio Efectiva</span>
                        <span className="text-2xl font-black font-mono text-slate-900 block mt-1">$3,56 USD/HH</span>
                        <span className="text-[11px] text-slate-500 font-semibold block mt-0.5">Costo integral de mano de obra</span>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Proyectos con Cuadrilla</span>
                        <span className="text-2xl font-black font-mono text-slate-900 block mt-1">10 Proyectos</span>
                        <span className="text-[11px] text-amber-700 font-semibold block mt-0.5">65,2% en Pellas Línea 1</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                      {/* Left: Criterio de Corte Contable */}
                      <div className="lg:col-span-5 bg-blue-50/70 p-5 rounded-2xl border border-blue-200 space-y-3">
                        <div className="flex items-center gap-2 text-[#002060]">
                          <Info className="w-5 h-5 shrink-0" />
                          <h4 className="font-black text-sm uppercase tracking-wide">Criterio de Corte Contable y Trazabilidad</h4>
                        </div>
                        <div className="text-xs text-slate-700 space-y-2.5 leading-relaxed">
                          <p>
                            <strong className="text-[#002060]">Semana 35 ($56.584 USD / 15.619 HH):</strong> Tuvo fecha de inicio el 22/08/2026. Siguiendo el principio de devengo por fecha de inicio en el Master de Costos TIMACA, fue imputada contablemente al cierre de Agosto 2026, completando los <strong>$277.936 USD</strong> devengados en ese mes.
                          </p>
                          <div className="bg-white p-3 rounded-xl border border-blue-100 space-y-1 font-mono text-[11px]">
                            <span className="font-bold text-[#002060] block font-sans text-xs mb-1">Semanas de Septiembre (Calendario Estricto):</span>
                            <div className="flex justify-between"><span>Semana 36 (05/09):</span><strong className="text-slate-900">$54.804 USD (15.433 HH)</strong></div>
                            <div className="flex justify-between"><span>Semana 37 (12/09):</span><strong className="text-slate-900">$54.173 USD (15.216 HH)</strong></div>
                            <div className="flex justify-between"><span>Semana 38 (19/09):</span><strong className="text-slate-900">$53.833 USD (15.091 HH)</strong></div>
                            <div className="flex justify-between"><span>Semana 39 (26/09):</span><strong className="text-slate-900">$33.856 USD (9.537 HH)</strong></div>
                            <div className="border-t border-slate-200 pt-1 mt-1 flex justify-between font-bold text-[#002060]">
                              <span>Total Septiembre:</span><span>$196.665 USD (55.277 HH)</span>
                            </div>
                          </div>
                          <p className="text-[11px] text-slate-600">
                            <strong>Conciliación Oficial:</strong> La sumatoria arroja exactamente <strong>$196.665,65 USD</strong>, coincidiendo con la tabla dinámica de Excel (<strong>$196.665,16 USD</strong>) y sirve de ancla proporcional para la asignación de los <strong>$393.375 USD</strong> de costos indirectos.
                          </p>
                        </div>
                      </div>

                      {/* Right: Tabla de los 10 Proyectos */}
                      <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                        <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">Desglose de Nómina por Proyecto (10 Frentes Activos)</span>
                          <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">55.277 Horas Totales</span>
                        </div>
                        <div className="overflow-x-auto max-h-[360px] overflow-y-auto">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-[#0b2545] text-white font-bold sticky top-0 z-10">
                              <tr>
                                <th className="py-2 px-3">Cuenta</th>
                                <th className="py-2 px-3">Proyecto / Frente</th>
                                <th className="py-2 px-3 text-right">Monto (USD)</th>
                                <th className="py-2 px-3 text-right">Horas (HH)</th>
                                <th className="py-2 px-3 text-right">% MOD</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                              {DESGLOSE_NOMINA_SEPTIEMBRE_PROYECTOS.map((p) => (
                                <tr key={p.cta} className="hover:bg-blue-50/40 transition-colors">
                                  <td className="py-2 px-3 font-mono font-bold text-[#002060]">{p.cta}</td>
                                  <td className="py-2 px-3 font-medium text-slate-900">{p.proyecto}</td>
                                  <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">${p.monto.toLocaleString('de-DE')}</td>
                                  <td className="py-2 px-3 text-right font-mono text-slate-600">{p.hh.toLocaleString('de-DE')}</td>
                                  <td className="py-2 px-3 text-right font-mono font-bold text-blue-700">{p.pct}%</td>
                                </tr>
                              ))}
                              <tr className="bg-slate-100 font-black text-[#002060] border-t-2 border-slate-300">
                                <td colSpan={2} className="py-2.5 px-3">TOTAL NÓMINA DIRECTA SEPTIEMBRE</td>
                                <td className="py-2.5 px-3 text-right font-mono">$196.665 USD</td>
                                <td className="py-2.5 px-3 text-right font-mono">55.277 HH</td>
                                <td className="py-2.5 px-3 text-right font-mono">100,0%</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
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
                          {selectedMesNum === 9 ? (
                            'El 81,4% del gasto mensual se concentra en solo 4 proyectos (Línea 1 Pellas $668K, Segunda Línea PMH $292K, DRAVO $199K y Briquetas Fase 2 $174K). Auditar estos 4 frentes asegura el control de $1.333.147 USD.'
                          ) : (
                            'El 76,3% del gasto mensual se concentra en solo 4 cuentas auxiliares (Línea 1 Pellas, Segunda Línea PMH, Bandas PMH y Briquetas Fase 2). Auditar estas cuentas asegura el control efectivo de la inversión.'
                          )}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-950">
                        <strong className="block font-bold mb-1 flex items-center gap-1.5">
                          <Target className="w-4 h-4 text-emerald-700" />
                          Proyecto Pellas Línea 1
                        </strong>
                        <p className="text-[11px] leading-relaxed text-slate-700">
                          {selectedMesNum === 9 ? (
                            'Continúa como el contrato de mayor envergadura con $668.340 USD en el mes (40,8%) y un acumulado de $2.388.978 USD (8,0% sobre el contrato total de $29,72M USD).'
                          ) : (
                            'Continúa como el contrato de mayor envergadura con $596.358 USD en el mes (49,8%) y un acumulado de $1.720.638 USD sobre el compromiso contractual total.'
                          )}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-950">
                        <strong className="block font-bold mb-1 flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-amber-700" />
                          Tracción de Proyectos Secundarios
                        </strong>
                        <p className="text-[11px] leading-relaxed text-slate-700">
                          {selectedMesNum === 9 ? (
                            'Repotenciación DRAVO repuntó a $199.356 USD (+761% vs agosto) por insumos y cables, mientras Briquetas Fase 2 alcanzó $173.502 USD (+95%), acelerando el montaje electromecánico.'
                          ) : (
                            'Segunda Línea PMH alcanzó $197.962 USD y Bandas PMH $109.279 USD, sosteniendo un avance sostenido en calderería y cintas transportadoras.'
                          )}
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
                            { name: 'Línea 1 Pellas', delta: -20.0, pct: '-4%', why: 'Nivel operativo alto sostenido ($596K USD)' },
                            { name: 'Caldera Briquetas', delta: -91.0, pct: '-89%', why: 'Fase final de remates, pruebas y calibración' }
                          ] : [
                            { name: 'Repotenciación DRAVO', delta: 176.2, pct: '+761%', why: 'Inyección en cables de potencia, tableros y tolvas ($199K)' },
                            { name: 'Segunda Línea PMH', delta: 94.0, pct: '+47%', why: 'Despacho masivo de aceros para pórticos y tolvas ($292K)' },
                            { name: 'Briquetas Fase 2', delta: 84.6, pct: '+95%', why: 'Reactivación de tuberías y válvulas de alta presión ($174K)' },
                            { name: 'Línea 1 Pellas', delta: 72.0, pct: '+12%', why: 'Pico operacional del año con montaje electromecánico ($668K)' },
                            { name: 'Rehabilitación Bandas PMH', delta: -16.7, pct: '-15%', why: 'Finalización de empalmes vulcanizados en correas ($93K)' },
                            { name: 'Mantenimiento BG II', delta: -20.5, pct: '-38%', why: 'Cierre de parada mayor programada y paso a preventiva ($34K)' },
                            { name: 'Interconexión PMH', delta: -27.0, pct: '-82%', why: 'Conclusión de obras civiles y tendido mecánico ($6K)' }
                          ];

                          const maxDelta = 190;
                          const chartWidth = 720;
                          const chartHeight = items.length * 36;
                          const zeroX = chartWidth / 2;

                          return (
                            <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 25}`} className="w-full h-64 text-xs font-mono">
                              {/* Central Zero Axis Line */}
                              <line x1={zeroX} y1="10" x2={zeroX} y2={chartHeight + 5} stroke="#94a3b8" strokeWidth="2" strokeDasharray="3 3" />
                              <text x={zeroX} y={chartHeight + 20} textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="bold">
                                Eje 0 (Variación Neta)
                              </text>

                              {/* Reference scale markers */}
                              <text x={zeroX - 100} y="15" textAnchor="middle" fill="#94a3b8" fontSize="9">-$100k</text>
                              <text x={zeroX - 200} y="15" textAnchor="middle" fill="#94a3b8" fontSize="9">-$200k</text>
                              <text x={zeroX + 100} y="15" textAnchor="middle" fill="#94a3b8" fontSize="9">+$100k</text>
                              <text x={zeroX + 200} y="15" textAnchor="middle" fill="#94a3b8" fontSize="9">+$200k</text>

                              {items.map((it, idx) => {
                                const y = 25 + idx * 34;
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
                                      height="19"
                                      rx="5"
                                      fill={color}
                                      className="shadow-2xs"
                                    />

                                    {/* Project label */}
                                    <text
                                      x={isPositive ? zeroX - 10 : zeroX + 10}
                                      y={y + 13}
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
                                      y={y + 13}
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
                          <strong>Rueda de Cangilones DRAVO (+761% / +$176K):</strong> Reactivación agresiva con suministro de cables de potencia, tableros de control y ensamblaje de tolvas de transferencia ($199.356 USD).
                        </p>
                        <p className="text-[11px] text-slate-700 leading-relaxed">
                          <strong>Segunda Línea PMH (+47% / +$94K):</strong> Despacho intensivo de aceros estructurales y chapas en taller central para pórticos y tolvas de transferencia ($291.949 USD).
                        </p>
                        <p className="text-[11px] text-slate-700 leading-relaxed">
                          <strong>Briquetas Fase 2 (+95% / +$85K):</strong> Reactivación de compras de tuberías y válvulas de alta presión para montaje en frentes de planta ($173.502 USD).
                        </p>
                        <p className="text-[11px] text-slate-700 leading-relaxed">
                          <strong>Línea 1 Pellas (+12% / +$72K):</strong> Pico operacional del año alcanzando $668.340 USD en el mes, impulsado por refractarios y montaje electromecánico.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1.5">
                        <strong className="text-amber-950 font-bold block flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
                          Desaceleraciones Controladas & Cierres
                        </strong>
                        <p className="text-[11px] text-slate-700 leading-relaxed">
                          <strong>Interconexión PMH (-82% / -$27K):</strong> Conclusión exitosa de obras civiles y tendido mecánico de interconexión ($5.836 USD).
                        </p>
                        <p className="text-[11px] text-slate-700 leading-relaxed">
                          <strong>Mantenimiento BG II (-38% / -$20K):</strong> Cierre de parada mayor programada y estabilización en guardia técnica preventiva ($33.890 USD).
                        </p>
                        <p className="text-[11px] text-slate-700 leading-relaxed">
                          <strong>Bandas PMH (-15% / -$17K):</strong> Conclusión de trabajos mayores de vulcanización y alineación de cintas en torre de transferencia ($92.544 USD).
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
                      Proyecto Pellas Línea 1 (TTE-C-0706) · {activeMonth?.mesLabel}
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
                      onClick={() => setSlide5Tab('tabla-evolutivo')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        slide5Tab === 'tabla-evolutivo'
                          ? 'bg-[#0b2545] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                      }`}
                    >
                      <TableProperties className="w-3.5 h-3.5 text-blue-600" />
                      <span>Tabla Evolutivo Mensual</span>
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
                            Pico Operativo: Septiembre ($668K USD) · Mes Anterior: Agosto ($596K USD)
                          </span>
                        </div>

                        {(() => {
                          const mesesPellas = [
                            { mes: 'Ene', val: 1837 },
                            { mes: 'Feb', val: 1416 },
                            { mes: 'Mar', val: 684 },
                            { mes: 'Abr', val: 5583 },
                            { mes: 'May', val: 305561 },
                            { mes: 'Jun', val: 404215 },
                            { mes: 'Jul', val: 404984 },
                            { mes: 'Ago', val: 596358 },
                            { mes: 'Sep', val: 668340 },
                            { mes: 'Oct', val: 867861 }
                          ];

                          const maxVal = 900000;
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
                                const x = 20 + idx * colWidth + 8;
                                const y = chartHeight - barH;
                                const barW = colWidth - 16;

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

                        {/* Compact Monthly Evolution Summary Table */}
                        <div className="mt-4 pt-3 border-t border-slate-100 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300">
                          <table className="w-full text-xs text-left min-w-[860px]">
                            <thead>
                              <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                                <th className="py-2.5 px-3">Concepto</th>
                                {['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct'].map((m, idx) => (
                                  <th key={m} className={`py-2.5 px-2.5 text-right ${idx + 1 === selectedMesNum ? 'text-amber-700 bg-amber-50/70 font-black' : ''}`}>
                                    {m}
                                  </th>
                                ))}
                                <th className="py-2.5 px-3.5 text-right font-black text-[#0b2545] bg-blue-50/70">Total 2026</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                              <tr className="hover:bg-slate-50/60">
                                <td className="py-2 px-2.5 font-sans font-bold text-slate-800 flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-blue-700"></span>
                                  Gasto Mensual
                                </td>
                                <td className={`py-2 px-2 text-right ${selectedMesNum === 1 ? 'font-bold text-amber-700 bg-amber-50/40' : 'text-slate-800'}`}>$1.837</td>
                                <td className={`py-2 px-2 text-right ${selectedMesNum === 2 ? 'font-bold text-amber-700 bg-amber-50/40' : 'text-slate-800'}`}>$1.416</td>
                                <td className={`py-2 px-2 text-right ${selectedMesNum === 3 ? 'font-bold text-amber-700 bg-amber-50/40' : 'text-slate-800'}`}>$684</td>
                                <td className={`py-2 px-2 text-right ${selectedMesNum === 4 ? 'font-bold text-amber-700 bg-amber-50/40' : 'text-slate-800'}`}>$5.583</td>
                                <td className={`py-2 px-2 text-right ${selectedMesNum === 5 ? 'font-bold text-amber-700 bg-amber-50/40' : 'text-slate-800'}`}>$305.561</td>
                                <td className={`py-2 px-2 text-right ${selectedMesNum === 6 ? 'font-bold text-amber-700 bg-amber-50/40' : 'text-slate-800'}`}>$404.215</td>
                                <td className={`py-2 px-2 text-right ${selectedMesNum === 7 ? 'font-bold text-amber-700 bg-amber-50/40' : 'text-slate-800'}`}>$404.984</td>
                                <td className={`py-2 px-2 text-right ${selectedMesNum === 8 ? 'font-bold text-amber-700 bg-amber-50/40' : 'text-slate-800'}`}>$596.358</td>
                                <td className={`py-2 px-2 text-right ${selectedMesNum === 9 ? 'font-bold text-amber-700 bg-amber-50/40' : 'text-slate-800'}`}>$668.340</td>
                                <td className={`py-2 px-2 text-right ${selectedMesNum === 10 ? 'font-bold text-amber-700 bg-amber-50/40' : 'text-slate-800'}`}>$867.861</td>
                                <td className="py-2 px-3 text-right font-black text-blue-900 bg-blue-50/50">$3.256.839</td>
                              </tr>
                              <tr className="hover:bg-slate-50/60 bg-slate-50/20 text-slate-600">
                                <td className="py-2 px-2.5 font-sans font-medium text-slate-700 flex items-center gap-1.5">
                                  <Users className="w-3.5 h-3.5 text-emerald-600" />
                                  Cuadrilla Activa
                                </td>
                                {['—', '—', '—', '12', '145', '180', '215', '238', '254', '254'].map((c, idx) => (
                                  <td key={idx} className={`py-2 px-2 text-right ${idx + 1 === selectedMesNum ? 'font-bold text-amber-700 bg-amber-50/40' : ''}`}>
                                    {c} {c !== '—' ? 'trab.' : ''}
                                  </td>
                                ))}
                                <td className="py-2 px-3 text-right font-bold text-emerald-800 bg-blue-50/50">254 trab. (pico)</td>
                              </tr>
                              <tr className="hover:bg-slate-50/60 text-slate-500">
                                <td className="py-2 px-2.5 font-sans font-medium text-slate-700 flex items-center gap-1.5">
                                  <Target className="w-3.5 h-3.5 text-amber-600" />
                                  Avance Contrato
                                </td>
                                {['0,01%', '0,01%', '0,01%', '0,03%', '1,06%', '2,42%', '3,78%', '5,79%', '8,04%', '10,96%'].map((pct, idx) => (
                                  <td key={idx} className={`py-2 px-2 text-right ${idx + 1 === selectedMesNum ? 'font-bold text-amber-700 bg-amber-50/40' : ''}`}>
                                    {pct}
                                  </td>
                                ))}
                                <td className="py-2 px-3 text-right font-bold text-emerald-700 bg-blue-50/50">10,96% ($29,72M)</td>
                              </tr>
                            </tbody>
                          </table>
                          <div className="flex items-center justify-between pt-2 px-1 text-[11px] text-slate-500">
                            <span>* Cifras oficiales conciliadas con contabilidad analítica TTE-C-0706</span>
                            <button
                              onClick={() => setSlide5Tab('tabla-evolutivo')}
                              className="text-blue-700 font-bold hover:underline inline-flex items-center gap-1"
                            >
                              Ver matriz completa de 5 rubros mensuales →
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 3 Strategic Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-950">
                        <strong className="block font-bold mb-1">Capacidad Instalada y Proyección:</strong>
                        <p className="text-[11px] leading-relaxed text-slate-700">
                          El avance financiero de ${pellasMesData.acumulado2026.toLocaleString('de-DE')} USD ({Math.round((pellasMesData.acumulado2026 / 29720000) * 1000) / 10}% sobre contrato) consolida la rampa de montaje electromecánico y refractario para el cierre de 2026.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-950">
                        <strong className="block font-bold mb-1">Concentración de Fuerza Laboral:</strong>
                        <p className="text-[11px] leading-relaxed text-slate-700">
                          Mantiene {pellasMesData.cuadrilla} trabajadores activos en campo, garantizando la cobertura de frentes en jornadas rotativas continuas de calderería y montaje estructural.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-950">
                        <strong className="block font-bold mb-1">Absorción Indirecta Primaria:</strong>
                        <p className="text-[11px] leading-relaxed text-slate-700">
                          Absorbe ${selectedMesNum === 9 ? '236.688' : '204.561'} USD (60,2% del CIF corporativo), apalancando la infraestructura de supervisión técnica, talleres e ingeniería de TIMACA.
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
                            <>Nómina devengada del mes de <strong>$133.185 USD</strong> en Línea 1 Pellas (60,2% del total de MOD de la empresa), devengada en 5 semanas operativas (Semanas 35 a 39), con una cuadrilla promedio activa de <strong>254 trabajadores</strong>.</>
                          ) : (
                            <>Nómina mensual de <strong>$167.193 USD</strong> distribuida en 4 semanas operativas (Semanas 31 a 34), con una cuadrilla estabilizada en <strong>238 trabajadores promedio</strong> que garantiza la continuidad ininterrumpida en los frentes de montaje mecánico, refractario y estructuras.</>
                          )}
                        </p>
                        <p className="text-xs text-slate-600 leading-relaxed pt-1">
                          {selectedMesNum === 9 ? (
                            <>Pellas Línea 1 representa el <strong>40,8% de la ejecución total de septiembre</strong> ($668.340 USD de $1.613.225 USD), consolidando su posición como el proyecto principal de TIMACA.</>
                          ) : (
                            <>Pellas Línea 1 representó el <strong>49,8% de la ejecución total de agosto</strong> ($596.358 USD), liderando el avance operacional de la empresa.</>
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
                            <>El proyecto acumula un total de <strong>$2.388.978 USD</strong> ejecutados en 2026, lo que representa un <strong>8,0% de avance financiero</strong> sobre el monto contractual global de $29,72M USD (saldo por ejecutar: $27.331.022 USD).</>
                          ) : (
                            <>El proyecto acumulaba a agosto un total de <strong>$1.720.638 USD</strong> (5,8% de avance sobre el contrato marco de $29,72M USD).</>
                          )}
                        </p>
                        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 mt-2 text-[11px] text-slate-700">
                          <strong>Indirectos Asignados:</strong> Pellas absorbe <strong>{selectedMesNum === 9 ? '$236.688 USD' : '$204.561 USD'}</strong> de la estructura corporativa oficial de indirectos en {activeMonth?.mesLabel?.split(' ')[0]} ({selectedMesNum === 9 ? '60,2%' : '60,2%'} de absorción).
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: TABLA EVOLUTIVO MENSUAL (ENERO A SEPTIEMBRE 2026) */}
                {slide5Tab === 'tabla-evolutivo' && (
                  <div className="space-y-4 animate-fade-in">
                    {/* Top KPI Strip */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-[11px] font-bold text-slate-500 uppercase block">Total Acumulado 2026</span>
                        <span className="text-2xl font-black font-mono text-blue-700 block">$2.388.978</span>
                        <span className="text-[10px] text-slate-500 font-semibold">8,04% del contrato marco global</span>
                      </div>
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-[11px] font-bold text-slate-500 uppercase block">Contrato Marco Total</span>
                        <span className="text-2xl font-black font-mono text-[#0b2545] block">$29.720.000</span>
                        <span className="text-[10px] text-emerald-700 font-semibold">Saldo: $27.331.022 USD</span>
                      </div>
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-[11px] font-bold text-slate-500 uppercase block">Fuerza Laboral (Pico Sep)</span>
                        <span className="text-2xl font-black font-mono text-emerald-700 block">254 trab.</span>
                        <span className="text-[10px] text-slate-500">60,2% de la nómina TIMACA</span>
                      </div>
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-[11px] font-bold text-slate-500 uppercase block">CIF Absorbido Acumulado</span>
                        <span className="text-2xl font-black font-mono text-amber-600 block">$800.270</span>
                        <span className="text-[10px] text-slate-500">60,2% de indirectos corporativos</span>
                      </div>
                    </div>

                    {/* Master Evolution Table */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-100">
                        <div>
                          <h3 className="text-sm font-black text-[#0b2545] uppercase tracking-wider flex items-center gap-1.5">
                            <TableProperties className="w-4 h-4 text-blue-600" />
                            Matriz Oficial de Evolución Mensual Pellas Línea 1 (TTE-C-0706)
                          </h3>
                          <p className="text-xs text-slate-500">
                            Desglose financiero consolidado por categoría de costo de Enero a Septiembre 2026 (Valores en USD)
                          </p>
                        </div>
                        <span className="text-xs font-mono font-bold px-2.5 py-1 bg-blue-50 text-blue-900 border border-blue-200 rounded-lg self-start sm:self-auto">
                          100% Cifras Conciliadas Analíticas
                        </span>
                      </div>

                      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300">
                        <table className="w-full text-xs text-left border-collapse min-w-[1160px]">
                          <thead>
                            <tr className="bg-[#0b2545] text-white text-[10.5px] uppercase font-bold tracking-wider">
                              <th className="py-3 px-3.5 rounded-tl-lg min-w-[260px]">Categoría / Rubro de Costo</th>
                              <th className="py-3 px-2 text-right min-w-[65px]">Ene</th>
                              <th className="py-3 px-2 text-right min-w-[65px]">Feb</th>
                              <th className="py-3 px-2 text-right min-w-[65px]">Mar</th>
                              <th className="py-3 px-2 text-right min-w-[65px]">Abr</th>
                              <th className="py-3 px-2 text-right min-w-[65px]">May</th>
                              <th className="py-3 px-2 text-right min-w-[65px]">Jun</th>
                              <th className="py-3 px-2 text-right min-w-[65px]">Jul</th>
                              <th className="py-3 px-2 text-right min-w-[65px]">Ago</th>
                              <th className={`py-3 px-2 text-right min-w-[70px] ${selectedMesNum === 9 ? 'bg-amber-600 font-black' : ''}`}>Sep</th>
                              <th className={`py-3 px-2 text-right min-w-[75px] ${selectedMesNum === 10 ? 'bg-amber-600 font-black' : ''}`}>Oct</th>
                              <th className="py-3 px-3 text-right bg-blue-950 font-black min-w-[110px]">Total 2026</th>
                              <th className="py-3 px-2 text-right rounded-tr-lg min-w-[65px]">% Part.</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                            {/* Row 1: Materiales Directos */}
                            <tr className="hover:bg-slate-50/70 transition-colors">
                              <td className="py-2.5 px-3.5 font-sans font-bold text-slate-800 flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0"></span>
                                <div>
                                  <span className="block font-bold">Materiales Directos</span>
                                  <span className="text-[10px] text-slate-500 font-normal">Tuberías, acero, refractario, soldadura</span>
                                </div>
                              </td>
                              <td className="py-2.5 px-2 text-right text-slate-400">$0</td>
                              <td className="py-2.5 px-2 text-right text-slate-400">$0</td>
                              <td className="py-2.5 px-2 text-right text-slate-400">$0</td>
                              <td className="py-2.5 px-2 text-right text-slate-700">$782</td>
                              <td className="py-2.5 px-2 text-right text-slate-700">$9.704</td>
                              <td className="py-2.5 px-2 text-right text-slate-700">$38.108</td>
                              <td className="py-2.5 px-2 text-right text-slate-700">$50.489</td>
                              <td className="py-2.5 px-2 text-right text-slate-700">$71.709</td>
                              <td className="py-2.5 px-2 text-right text-slate-700">$173.833</td>
                              <td className={`py-2.5 px-2 text-right font-bold ${selectedMesNum === 10 ? 'text-amber-700 bg-amber-50/50' : 'text-slate-800'}`}>$89.498</td>
                              <td className="py-2.5 px-3 text-right font-black text-blue-900 bg-blue-50/40">$434.124</td>
                              <td className="py-2.5 px-2 text-right font-bold text-slate-600">13,3%</td>
                            </tr>

                            {/* Row 2: Servicios Especializados */}
                            <tr className="hover:bg-slate-50/70 transition-colors">
                              <td className="py-2.5 px-3 font-sans font-bold text-slate-800 flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-purple-600 shrink-0"></span>
                                <div>
                                  <span className="block font-bold">Servicios Especializados</span>
                                  <span className="text-[10px] text-slate-500 font-normal">Yokogawa, Henan Front, traslados, izajes</span>
                                </div>
                              </td>
                              <td className="py-2.5 px-2 text-right text-slate-400">$0</td>
                              <td className="py-2.5 px-2 text-right text-slate-400">$0</td>
                              <td className="py-2.5 px-2 text-right text-slate-400">$0</td>
                              <td className="py-2.5 px-2 text-right text-slate-700">$48</td>
                              <td className="py-2.5 px-2 text-right text-slate-700">$5.105</td>
                              <td className="py-2.5 px-2 text-right text-slate-700">$60.101</td>
                              <td className="py-2.5 px-2 text-right text-slate-700">$56.907</td>
                              <td className="py-2.5 px-2 text-right text-slate-700">$63.106</td>
                              <td className="py-2.5 px-2 text-right text-slate-700">$69.056</td>
                              <td className={`py-2.5 px-2 text-right font-bold ${selectedMesNum === 10 ? 'text-amber-700 bg-amber-50/50' : 'text-slate-800'}`}>$778.363</td>
                              <td className="py-2.5 px-3 text-right font-black text-blue-900 bg-blue-50/40">$1.032.686</td>
                              <td className="py-2.5 px-2 text-right font-bold text-slate-600">31,7%</td>
                            </tr>

                            {/* Row 3: Mano de Obra Directa */}
                            <tr className="hover:bg-slate-50/70 transition-colors">
                              <td className="py-2.5 px-3 font-sans font-bold text-slate-800 flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0"></span>
                                <div>
                                  <span className="block font-bold">Mano de Obra Directa (MOD)</span>
                                  <span className="text-[10px] text-slate-500 font-normal">Cuadrilla mecánica, calderería y refractario</span>
                                </div>
                              </td>
                              <td className="py-2.5 px-2 text-right text-slate-400">$0</td>
                              <td className="py-2.5 px-2 text-right text-slate-400">$0</td>
                              <td className="py-2.5 px-2 text-right text-slate-400">$0</td>
                              <td className="py-2.5 px-2 text-right text-slate-400">$0</td>
                              <td className="py-2.5 px-2 text-right text-slate-700">$121.093</td>
                              <td className="py-2.5 px-2 text-right text-slate-700">$109.550</td>
                              <td className="py-2.5 px-2 text-right text-slate-700">$126.977</td>
                              <td className="py-2.5 px-2 text-right text-slate-700">$167.193</td>
                              <td className="py-2.5 px-2 text-right text-slate-700">$133.185</td>
                              <td className={`py-2.5 px-2 text-right italic ${selectedMesNum === 10 ? 'text-amber-700 bg-amber-50/50' : 'text-slate-400'}`}>Pendiente</td>
                              <td className="py-2.5 px-3 text-right font-black text-blue-900 bg-blue-50/40">$657.998</td>
                              <td className="py-2.5 px-2 text-right font-bold text-slate-600">20,2%</td>
                            </tr>

                            {/* Row 4: Horas Máquina */}
                            <tr className="hover:bg-slate-50/70 transition-colors">
                              <td className="py-2.5 px-3 font-sans font-bold text-slate-800 flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-600 shrink-0"></span>
                                <div>
                                  <span className="block font-bold">Horas Máquina (Equipos Propios)</span>
                                  <span className="text-[10px] text-slate-500 font-normal">Grúas telescópicas, plantas de soldar, compresores</span>
                                </div>
                              </td>
                              <td className="py-2.5 px-2 text-right text-slate-700">$1.837</td>
                              <td className="py-2.5 px-2 text-right text-slate-700">$1.416</td>
                              <td className="py-2.5 px-2 text-right text-slate-700">$684</td>
                              <td className="py-2.5 px-2 text-right text-slate-700">$4.753</td>
                              <td className="py-2.5 px-2 text-right text-slate-700">$53.269</td>
                              <td className="py-2.5 px-2 text-right text-slate-700">$61.309</td>
                              <td className="py-2.5 px-2 text-right text-slate-700">$63.126</td>
                              <td className="py-2.5 px-2 text-right text-slate-700">$89.789</td>
                              <td className="py-2.5 px-2 text-right text-slate-700">$55.578</td>
                              <td className={`py-2.5 px-2 text-right italic ${selectedMesNum === 10 ? 'text-amber-700 bg-amber-50/50' : 'text-slate-400'}`}>Pendiente</td>
                              <td className="py-2.5 px-3 text-right font-black text-blue-900 bg-blue-50/40">$331.762</td>
                              <td className="py-2.5 px-2 text-right font-bold text-slate-600">10,2%</td>
                            </tr>

                            {/* Row 5: Costos Indirectos CIF */}
                            <tr className="hover:bg-slate-50/70 transition-colors">
                              <td className="py-2.5 px-3 font-sans font-bold text-slate-800 flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 shrink-0"></span>
                                <div>
                                  <span className="block font-bold">Costos Indirectos (CIF 60,2%)</span>
                                  <span className="text-[10px] text-slate-500 font-normal">Supervisión técnica, ingeniería, soporte central</span>
                                </div>
                              </td>
                              <td className="py-2.5 px-2 text-right text-slate-400">$0</td>
                              <td className="py-2.5 px-2 text-right text-slate-400">$0</td>
                              <td className="py-2.5 px-2 text-right text-slate-400">$0</td>
                              <td className="py-2.5 px-2 text-right text-slate-400">$0</td>
                              <td className="py-2.5 px-2 text-right text-slate-700">$116.389</td>
                              <td className="py-2.5 px-2 text-right text-slate-700">$135.147</td>
                              <td className="py-2.5 px-2 text-right text-slate-700">$107.485</td>
                              <td className="py-2.5 px-2 text-right text-slate-700">$204.561</td>
                              <td className="py-2.5 px-2 text-right text-slate-700">$236.688</td>
                              <td className={`py-2.5 px-2 text-right italic ${selectedMesNum === 10 ? 'text-amber-700 bg-amber-50/50' : 'text-slate-400'}`}>Pendiente</td>
                              <td className="py-2.5 px-3 text-right font-black text-blue-900 bg-blue-50/40">$800.270</td>
                              <td className="py-2.5 px-2 text-right font-bold text-slate-600">24,6%</td>
                            </tr>

                            {/* Row 6: TOTAL MENSUAL */}
                            <tr className="bg-blue-50/80 font-black text-[#0b2545] border-t-2 border-slate-300">
                              <td className="py-2.5 px-3 font-sans uppercase tracking-wider">
                                TOTAL EJECUCIÓN MENSUAL
                              </td>
                              <td className="py-2.5 px-2 text-right">$1.837</td>
                              <td className="py-2.5 px-2 text-right">$1.416</td>
                              <td className="py-2.5 px-2 text-right">$684</td>
                              <td className="py-2.5 px-2 text-right">$5.583</td>
                              <td className="py-2.5 px-2 text-right">$305.561</td>
                              <td className="py-2.5 px-2 text-right">$404.215</td>
                              <td className="py-2.5 px-2 text-right">$404.984</td>
                              <td className="py-2.5 px-2 text-right">$596.358</td>
                              <td className="py-2.5 px-2 text-right">$668.340</td>
                              <td className={`py-2.5 px-2 text-right text-xs ${selectedMesNum === 10 ? 'text-amber-800 bg-amber-100/70 font-black' : 'text-slate-900'}`}>$867.861</td>
                              <td className="py-2.5 px-3 text-right text-blue-950 bg-blue-100 text-xs">$3.256.839</td>
                              <td className="py-2.5 px-2 text-right">100,0%</td>
                            </tr>

                            {/* Row 7: Acumulado Progresivo */}
                            <tr className="bg-slate-50/60 text-slate-700 font-bold">
                              <td className="py-2 px-3 font-sans flex items-center gap-1.5 text-slate-600">
                                <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                                Acumulado Progresivo (USD)
                              </td>
                              <td className="py-2 px-2 text-right">$1.837</td>
                              <td className="py-2 px-2 text-right">$3.253</td>
                              <td className="py-2 px-2 text-right">$3.937</td>
                              <td className="py-2 px-2 text-right">$9.520</td>
                              <td className="py-2 px-2 text-right">$315.081</td>
                              <td className="py-2 px-2 text-right">$719.296</td>
                              <td className="py-2 px-2 text-right">$1.124.280</td>
                              <td className="py-2 px-2 text-right">$1.720.638</td>
                              <td className="py-2 px-2 text-right">$2.388.978</td>
                              <td className={`py-2 px-2 text-right ${selectedMesNum === 10 ? 'text-amber-800 bg-amber-50/50 font-black' : 'text-slate-800'}`}>$3.256.839</td>
                              <td className="py-2 px-3 text-right text-blue-900 bg-blue-50/50">$3.256.839</td>
                              <td className="py-2 px-2 text-right text-emerald-700">10,96%</td>
                            </tr>

                            {/* Row 8: Cuadrilla Activa */}
                            <tr className="hover:bg-slate-50/50 text-slate-600">
                              <td className="py-2 px-3 font-sans font-medium flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5 text-emerald-600" />
                                Cuadrilla Activa en Campo
                              </td>
                              <td className="py-2 px-2 text-right text-slate-400">—</td>
                              <td className="py-2 px-2 text-right text-slate-400">—</td>
                              <td className="py-2 px-2 text-right text-slate-400">—</td>
                              <td className="py-2 px-2 text-right text-slate-700">12 trab.</td>
                              <td className="py-2 px-2 text-right text-slate-700">145 trab.</td>
                              <td className="py-2 px-2 text-right text-slate-700">180 trab.</td>
                              <td className="py-2 px-2 text-right text-slate-700">215 trab.</td>
                              <td className="py-2 px-2 text-right text-slate-700">238 trab.</td>
                              <td className="py-2 px-2 text-right text-slate-700">254 trab.</td>
                              <td className={`py-2 px-2 text-right font-bold ${selectedMesNum === 10 ? 'text-amber-700 bg-amber-50/50' : 'text-slate-700'}`}>254 trab.</td>
                              <td className="py-2 px-3 text-right font-bold text-emerald-800 bg-blue-50/50">254 trab. (pico)</td>
                              <td className="py-2 px-2 text-right text-slate-400">—</td>
                            </tr>

                            {/* Row 9: Participación en Gasto TIMACA */}
                            <tr className="hover:bg-slate-50/50 text-slate-500 text-[10px]">
                              <td className="py-2 px-3 font-sans font-medium flex items-center gap-1.5">
                                <Activity className="w-3.5 h-3.5 text-purple-600" />
                                % sobre Gasto Total TIMACA
                              </td>
                              <td className="py-2 px-2 text-right">0,5%</td>
                              <td className="py-2 px-2 text-right">0,2%</td>
                              <td className="py-2 px-2 text-right">0,1%</td>
                              <td className="py-2 px-2 text-right">0,6%</td>
                              <td className="py-2 px-2 text-right">23,2%</td>
                              <td className="py-2 px-2 text-right">31,4%</td>
                              <td className="py-2 px-2 text-right">30,5%</td>
                              <td className="py-2 px-2 text-right">49,8%</td>
                              <td className="py-2 px-2 text-right">40,8%</td>
                              <td className={`py-2 px-2 text-right font-bold ${selectedMesNum === 10 ? 'text-amber-700 bg-amber-50/50' : 'text-slate-600'}`}>60,1%</td>
                              <td className="py-2 px-3 text-right font-bold text-blue-900 bg-blue-50/50">36,8% (prom)</td>
                              <td className="py-2 px-2 text-right text-slate-400">—</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* 3 Analytical Insights Beneath Table */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-950 space-y-1.5 shadow-2xs">
                        <div className="flex items-center gap-1.5 font-bold">
                          <TrendingUp className="w-4 h-4 text-blue-700" />
                          <span>Rampa Operativa Electromecánica</span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-slate-700">
                          Tras una fase preliminar de 4 meses ($9.520 USD acumulados), el proyecto inició despliegue masivo en mayo movilizando 145 obreros técnicos con una ejecución de $305.561 USD que marcó el inicio de la curva acelerada.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-950 space-y-1.5 shadow-2xs">
                        <div className="flex items-center gap-1.5 font-bold">
                          <Truck className="w-4 h-4 text-amber-700" />
                          <span>Salto en Procura de Septiembre</span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-slate-700">
                          Los Materiales Directos alcanzaron su pico de $173.833 USD en septiembre (+142% vs los $71.709 USD de agosto), impulsados por recepción de suministros para calderería, refractario y tuberías de proceso requeridos en campo.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 space-y-1.5 shadow-2xs">
                        <div className="flex items-center gap-1.5 font-bold">
                          <ShieldCheck className="w-4 h-4 text-emerald-700" />
                          <span>Pilar de Absorción Indirecta TIMACA</span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-slate-700">
                          Con $800.270 USD acumulados de costos indirectos (33,5% del costo del proyecto), Pellas Línea 1 financia el 60,2% de la estructura de talleres, ingeniería y logística central de la corporación.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SLIDE 6: PROYECTO PELLAS 1 · SERVICIOS DIRECTOS Y HORAS MÁQUINA */}
            {currentSlide === 6 && (
              <div className="py-2 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                  <div>
                    <h2 className="text-2xl font-black text-[#0b2545] tracking-tight">
                      PROYECTO PELLAS 1: SERVICIOS DIRECTOS Y HORAS MÁQUINA
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {selectedMesNum === 10
                        ? 'Desglose oficial de servicios ($778.363 USD con Yokogawa, Henan Front, traslados y custodia) · Octubre 2026'
                        : selectedMesNum === 9 
                        ? 'Desglose oficial de servicios ($69.056 USD) y horas máquina ($55.578 USD) · Septiembre 2026' 
                        : 'Desglose oficial de servicios ($63.106 USD) y horas máquina ($89.789 USD) · Agosto 2026'}
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
                      {selectedMesNum === 9 ? 'Horas Máquina (812h · $55.578)' : 'Horas Máquina (1.396h · $89.789)'}
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
                                <th className="py-2.5 px-2 text-right font-mono">abril</th>
                                <th className="py-2.5 px-2 text-right font-mono">mayo</th>
                                <th className="py-2.5 px-2 text-right font-mono">junio</th>
                                <th className="py-2.5 px-2 text-right font-mono">julio</th>
                                <th className={`py-2.5 px-2 text-right font-mono ${selectedMesNum === 8 ? 'bg-amber-500/80 font-black text-white' : ''}`}>
                                  agosto
                                </th>
                                <th className={`py-2.5 px-2 text-right font-mono ${selectedMesNum === 9 ? 'bg-amber-500/80 font-black text-white' : ''}`}>
                                  septiembre
                                </th>
                                <th className="py-2.5 px-3 text-right font-mono bg-slate-900">Total</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium">
                              {TABLA_SERVICIOS_DIRECTOS_PELLAS_OFICIAL.map((srv, idx) => (
                                <tr key={srv.id} className={idx % 2 === 0 ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/50 hover:bg-slate-50'}>
                                  <td className="py-1.5 px-3 text-slate-800 font-semibold">{srv.servicio}</td>
                                  <td className="py-1.5 px-2 text-right font-mono text-slate-600">{srv.abril > 0 ? `$${srv.abril.toLocaleString('de-DE')}` : '-'}</td>
                                  <td className="py-1.5 px-2 text-right font-mono text-slate-600">{srv.mayo > 0 ? `$${srv.mayo.toLocaleString('de-DE')}` : '-'}</td>
                                  <td className="py-1.5 px-2 text-right font-mono text-slate-600">{srv.junio > 0 ? `$${srv.junio.toLocaleString('de-DE')}` : '-'}</td>
                                  <td className="py-1.5 px-2 text-right font-mono text-slate-600">{srv.julio > 0 ? `$${srv.julio.toLocaleString('de-DE')}` : '-'}</td>
                                  <td className={`py-1.5 px-2 text-right font-mono font-bold ${selectedMesNum === 8 ? 'text-amber-900 bg-amber-50/60' : 'text-slate-700'}`}>
                                    {srv.agosto > 0 ? `$${srv.agosto.toLocaleString('de-DE')}` : '-'}
                                  </td>
                                  <td className={`py-1.5 px-2 text-right font-mono font-bold ${selectedMesNum === 9 ? 'text-amber-900 bg-amber-50/60' : 'text-slate-700'}`}>
                                    {srv.septiembre && srv.septiembre > 0 ? `$${srv.septiembre.toLocaleString('de-DE')}` : '-'}
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
                                <td className="py-2.5 px-2 text-right font-mono">${TOTALES_SERVICIOS_DIRECTOS_PELLAS.abril.toLocaleString('de-DE')}</td>
                                <td className="py-2.5 px-2 text-right font-mono">${TOTALES_SERVICIOS_DIRECTOS_PELLAS.mayo.toLocaleString('de-DE')}</td>
                                <td className="py-2.5 px-2 text-right font-mono">${TOTALES_SERVICIOS_DIRECTOS_PELLAS.junio.toLocaleString('de-DE')}</td>
                                <td className="py-2.5 px-2 text-right font-mono">${TOTALES_SERVICIOS_DIRECTOS_PELLAS.julio.toLocaleString('de-DE')}</td>
                                <td className={`py-2.5 px-2 text-right font-mono ${selectedMesNum === 8 ? 'text-amber-900 bg-amber-200/80 font-black' : ''}`}>
                                  ${TOTALES_SERVICIOS_DIRECTOS_PELLAS.agosto.toLocaleString('de-DE')}
                                </td>
                                <td className={`py-2.5 px-2 text-right font-mono ${selectedMesNum === 9 ? 'text-amber-900 bg-amber-200/80 font-black' : ''}`}>
                                  ${(TOTALES_SERVICIOS_DIRECTOS_PELLAS.septiembre || 69056).toLocaleString('de-DE')}
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
                            <span className="text-[10px] font-mono text-slate-500 font-bold">Abr - Sep 2026</span>
                          </div>

                          {/* Evolutivo Line / Stepped Chart */}
                          <div className="h-44 pt-4 pb-2 px-2 flex items-end justify-between gap-1.5 bg-slate-50/70 rounded-lg border border-slate-100">
                            {[
                              { mes: 'Abr', val: TOTALES_SERVICIOS_DIRECTOS_PELLAS.abril, num: 4 },
                              { mes: 'May', val: TOTALES_SERVICIOS_DIRECTOS_PELLAS.mayo, num: 5 },
                              { mes: 'Jun', val: TOTALES_SERVICIOS_DIRECTOS_PELLAS.junio, num: 6 },
                              { mes: 'Jul', val: TOTALES_SERVICIOS_DIRECTOS_PELLAS.julio, num: 7 },
                              { mes: 'Ago', val: TOTALES_SERVICIOS_DIRECTOS_PELLAS.agosto, num: 8 },
                              { mes: 'Sep', val: TOTALES_SERVICIOS_DIRECTOS_PELLAS.septiembre || 69056, num: 9 }
                            ].map((p) => {
                              const pct = Math.max(10, Math.round((p.val / 75000) * 100));
                              const isCur = selectedMesNum === p.num;
                              return (
                                <div key={p.mes} className="flex-1 flex flex-col items-center justify-end h-full group">
                                  <span className={`text-[9.5px] font-mono font-bold mb-1 ${isCur ? 'text-amber-800' : 'text-slate-600'}`}>
                                    {p.val >= 1000 ? `$${Math.round(p.val / 1000)}K` : `$${p.val}`}
                                  </span>
                                  <div
                                    style={{ height: `${pct}%` }}
                                    className={`w-full max-w-[32px] rounded-t-lg transition-all ${
                                      isCur
                                        ? 'bg-amber-500 ring-2 ring-amber-300'
                                        : 'bg-blue-600 group-hover:bg-blue-500'
                                    }`}
                                  />
                                  <span className={`text-[10.5px] font-bold mt-1.5 ${isCur ? 'text-amber-800 underline' : 'text-slate-600'}`}>
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
                              <span className="text-[10px] text-blue-600">6 meses ejecutados</span>
                            </div>
                            <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200">
                              <span className="text-[10px] text-amber-800 block font-semibold uppercase">Cierre {activeMonth?.mesLabel?.split(' ')[0]}</span>
                              <strong className="text-sm font-black font-mono text-amber-950 block">
                                ${selectedMesNum === 9 ? '69.056' : '63.106'}
                              </strong>
                              <span className="text-[10px] text-amber-700">{selectedMesNum === 9 ? 'Pico operativo' : '10 subcategorías'}</span>
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
                    {(() => {
                      const tablaHM = selectedMesNum === 9 
                        ? TABLA_HORAS_MAQUINA_PELLAS_SEPTIEMBRE_OFICIAL 
                        : TABLA_HORAS_MAQUINA_PELLAS_OFICIAL;
                      const totalesHM = selectedMesNum === 9 
                        ? TOTALES_HORAS_MAQUINA_PELLAS_SEPTIEMBRE 
                        : TOTALES_HORAS_MAQUINA_PELLAS;
                      const notasHM = selectedMesNum === 9 
                        ? NOTAS_HORAS_MAQUINA_PELLAS_SEPTIEMBRE 
                        : NOTAS_HORAS_MAQUINA_PELLAS;

                      return (
                        <>
                          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                            <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div>
                                <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">
                                  LÁMINA OFICIAL DE LA PRESENTACIÓN DE COSTOS
                                </span>
                                <h4 className="text-xs font-black text-slate-900 uppercase">
                                  {selectedMesNum === 9 
                                    ? `PROYECTO PELLAS 1: HORAS MÁQUINA (DESGLOSE DE ${tablaHM.length} EQUIPOS ACTIVOS)` 
                                    : `PROYECTO PELLAS 1: HORAS MÁQUINA (DESGLOSE DE ${tablaHM.length} EQUIPOS)`}
                                </h4>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono font-bold px-2.5 py-1 bg-purple-50 text-purple-900 border border-purple-200 rounded-lg">
                                  Total Horas: {totalesHM.totalHoras.toLocaleString('de-DE')} H/M
                                </span>
                                <span className="text-xs font-mono font-bold px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-300 rounded-lg">
                                  Costo Total: ${totalesHM.totalCosto.toLocaleString('de-DE')} USD
                                </span>
                              </div>
                            </div>

                            {/* Equipment Table matching Slide exactly */}
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
                                  {tablaHM.map((eq, idx) => (
                                    <tr 
                                      key={idx} 
                                      className={
                                        eq.codigo === 'GR20'
                                          ? 'bg-amber-50/70 hover:bg-amber-100/70 font-semibold'
                                          : idx % 2 === 0 ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/50 hover:bg-slate-50'
                                      }
                                    >
                                      <td className="py-2 px-3 font-mono text-slate-600">{eq.cuentaAux}</td>
                                      <td className="py-2 px-2.5 font-mono font-bold text-blue-700">{eq.codigo}</td>
                                      <td className="py-2 px-3 text-slate-900 font-semibold">
                                        {eq.equipo}
                                        {eq.codigo === 'GR20' && (
                                          <span className="ml-2 text-[10px] font-bold text-amber-800 bg-amber-200/60 px-1.5 py-0.5 rounded">
                                            Equipo Principal Flota
                                          </span>
                                        )}
                                      </td>
                                      <td className="py-2 px-2.5 text-right font-mono text-slate-700">
                                        {formatUnitPriceRaw(eq.tarifa)}
                                      </td>
                                      <td className="py-2 px-2.5 text-right font-mono font-bold text-slate-800">
                                        {Math.round(eq.totalHM * 10) / 10}
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
                                      {totalesHM.totalHoras.toLocaleString('de-DE')}
                                    </td>
                                    <td className="py-2 px-3 text-right font-mono text-purple-900 bg-slate-200 text-sm">
                                      {totalesHM.totalCosto.toLocaleString('de-DE')}
                                    </td>
                                  </tr>
                                </tfoot>
                              </table>
                            </div>
                          </div>

                          {/* Notas de Horas Máquina matching Slide exactly */}
                          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                            <span className="text-xs font-bold text-[#0b2545] uppercase tracking-wider block border-b border-slate-100 pb-2 flex items-center gap-1.5">
                              <Wrench className="w-4 h-4 text-purple-600" />
                              Notas Operativas de Maquinaria y Equipos (Pellas Línea 1)
                            </span>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                              {notasHM.map((n, i) => (
                                <div key={i} className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                                  <strong className="text-slate-900 block font-bold text-xs">{n.titulo}:</strong>
                                  <p className="text-[11px] text-slate-600 leading-relaxed">{n.descripcion}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}

            {/* SLIDE 7: FRENTE DE DESPACHO PMH - SEGUNDA LÍNEA (TTE-C-0671) & RED DE TRANSPORTE */}
            {currentSlide === 7 && (
              <div className="py-2 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200 uppercase tracking-wider">
                        Infraestructura Marítima & Puerto
                      </span>
                      <span className="text-xs text-slate-400 font-mono">TTE-C-0671 · PMH</span>
                    </div>
                    <h2 className="text-2xl font-black text-[#0b2545] tracking-tight mt-1">
                      Frente PMH · Segunda Línea y Complejo de Despacho ({activeMonth?.mesLabel})
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Inversión acelerada de $291.949 USD en Septiembre (+47,5% vs Agosto) · Apoyos de elastómero de neopreno, concreto y canalización eléctrica
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
                    <button
                      onClick={() => setSlidePmhTab('ambos')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        slidePmhTab === 'ambos'
                          ? 'bg-[#0b2545] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                      }`}
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span>Ver Ambos</span>
                    </button>
                    <button
                      onClick={() => setSlidePmhTab('materiales')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        slidePmhTab === 'materiales'
                          ? 'bg-[#0b2545] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Materiales Críticos ($249K)</span>
                    </button>
                    <button
                      onClick={() => setSlidePmhTab('obras')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        slidePmhTab === 'obras'
                          ? 'bg-[#0b2545] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                      }`}
                    >
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>Red Complejo PMH ($438K)</span>
                    </button>
                  </div>
                </div>

                {/* 4 KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Inversión Septiembre (TTE-C-0671)</span>
                    <span className="text-xl font-black text-[#0b2545] block mt-1">$291.949 USD</span>
                    <span className="text-[11px] font-bold text-emerald-600 mt-0.5 inline-flex items-center gap-0.5">
                      <ArrowUpRight className="w-3 h-3" /> +47,5% vs Agosto ($197.962 USD)
                    </span>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Acumulado Anual 2026</span>
                    <span className="text-xl font-black text-[#0b2545] block mt-1">$1.143.217 USD</span>
                    <span className="text-[11px] font-semibold text-blue-600 mt-0.5 block">
                      3er proyecto de mayor volumen en TIMACA
                    </span>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Materiales Directos (Sep)</span>
                    <span className="text-xl font-black text-blue-700 block mt-1">$249.494 USD</span>
                    <span className="text-[11px] font-semibold text-slate-500 mt-0.5 block">
                      85,5% del costo del proyecto en el mes
                    </span>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Complejo PMH (4 Obras)</span>
                    <span className="text-xl font-black text-emerald-700 block mt-1">$438.002 USD</span>
                    <span className="text-[11px] font-semibold text-slate-500 mt-0.5 block">
                      26,7% del total de TIMACA en el mes
                    </span>
                  </div>
                </div>

                {/* Main Content Area */}
                <div className={slidePmhTab === 'ambos' ? "grid grid-cols-1 lg:grid-cols-2 gap-4" : "space-y-4"}>
                  {/* Left Column: Materiales Críticos */}
                  {(slidePmhTab === 'ambos' || slidePmhTab === 'materiales') && (
                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3 animate-fade-in">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-2">
                          <Layers className="w-4 h-4 text-blue-600" />
                          <span>Materiales e Insumos Críticos Despachados</span>
                          {slidePmhTab === 'materiales' && (
                            <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                              Vista Detallada Activa
                            </span>
                          )}
                        </h3>
                        <span className="text-[11px] font-bold font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          $249.494 USD
                        </span>
                      </div>

                      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300">
                        <table className="w-full text-left text-xs border-collapse min-w-[480px]">
                          <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                            <tr>
                              <th className="py-2 px-2.5">Insumo Despachado</th>
                              <th className="py-2 px-2 text-center">Cant / UM</th>
                              <th className="py-2 px-2 text-right">Monto ($)</th>
                              <th className="py-2 px-2.5">Función en Obra</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-[11px]">
                            <tr className="hover:bg-slate-50/70">
                              <td className="py-2 px-2.5 font-medium text-slate-900">Apoyos Elastómero Neopreno Shore A 60 ASTM</td>
                              <td className="py-2 px-2 text-center font-mono">48 UND</td>
                              <td className="py-2 px-2 text-right font-bold text-slate-900 font-mono">$67.000</td>
                              <td className="py-2 px-2.5 text-slate-500">Amortiguamiento sísmico y térmico de galerías</td>
                            </tr>
                            <tr className="hover:bg-slate-50/70">
                              <td className="py-2 px-2.5 font-medium text-slate-900">Tubería Conduit PVC Alto Impacto 5" Pesada</td>
                              <td className="py-2 px-2 text-center font-mono">1.240 M</td>
                              <td className="py-2 px-2 text-right font-bold text-slate-900 font-mono">$27.846</td>
                              <td className="py-2 px-2.5 text-slate-500">Canalizaciones subterráneas de fuerza y control</td>
                            </tr>
                            <tr className="hover:bg-slate-50/70">
                              <td className="py-2 px-2.5 font-medium text-slate-900">Concreto Premezclado Estructural 250 kg/cm²</td>
                              <td className="py-2 px-2 text-center font-mono">180 M³</td>
                              <td className="py-2 px-2 text-right font-bold text-slate-900 font-mono">$25.488</td>
                              <td className="py-2 px-2.5 text-slate-500">Pedestales y zapatas de torres de transferencia</td>
                            </tr>
                            <tr className="hover:bg-slate-50/70">
                              <td className="py-2 px-2.5 font-medium text-slate-900">Perfiles Estructurales y Planchas ASTM A36</td>
                              <td className="py-2 px-2 text-center font-mono">78.500 KG</td>
                              <td className="py-2 px-2 text-right font-bold text-slate-900 font-mono">$129.160</td>
                              <td className="py-2 px-2.5 text-slate-500">Vigas maestras de soporte de cintas de mineral</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Right Column: Red de Proyectos Complejo PMH */}
                  {(slidePmhTab === 'ambos' || slidePmhTab === 'obras') && (
                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3 animate-fade-in">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-emerald-600" />
                          <span>Red de Proyectos del Complejo PMH (FMO / VISCO)</span>
                          {slidePmhTab === 'obras' && (
                            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              Vista Detallada Activa
                            </span>
                          )}
                        </h3>
                        <span className="text-[11px] font-bold font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          $438.002 USD (Sep)
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                            <tr>
                              <th className="py-2 px-2.5">Frente de Trabajo / Obra</th>
                              <th className="py-2 px-2 text-center">Cuenta</th>
                              <th className="py-2 px-2 text-right">Septiembre</th>
                              <th className="py-2 px-2.5 text-right">Acumulado 2026</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-[11px]">
                            <tr className="hover:bg-slate-50/70">
                              <td className="py-2 px-2.5 font-bold text-slate-900">Segunda Línea PMH (Incremento Capacidad)</td>
                              <td className="py-2 px-2 text-center font-mono text-slate-500">TTE-C-0671</td>
                              <td className="py-2 px-2 text-right font-bold text-blue-700 font-mono">$291.949</td>
                              <td className="py-2 px-2.5 text-right font-mono text-slate-700">$1.143.217</td>
                            </tr>
                            <tr className="hover:bg-slate-50/70">
                              <td className="py-2 px-2.5 font-medium text-slate-800">Rehabilitación Bandas Torre #3 a JD-8012</td>
                              <td className="py-2 px-2 text-center font-mono text-slate-500">TTE-C-0656</td>
                              <td className="py-2 px-2 text-right font-bold text-slate-900 font-mono">$92.544</td>
                              <td className="py-2 px-2.5 text-right font-mono text-slate-700">$1.235.820</td>
                            </tr>
                            <tr className="hover:bg-slate-50/70">
                              <td className="py-2 px-2.5 font-medium text-slate-800">Proyecto Pila HA y HB (Suministro Apilador)</td>
                              <td className="py-2 px-2 text-center font-mono text-slate-500">TTE-C-0678</td>
                              <td className="py-2 px-2 text-right font-bold text-slate-900 font-mono">$47.673</td>
                              <td className="py-2 px-2.5 text-right font-mono text-slate-700">$329.757</td>
                            </tr>
                            <tr className="hover:bg-slate-50/70">
                              <td className="py-2 px-2.5 font-medium text-slate-800">Interconexión Tolva Multipropósito PMH</td>
                              <td className="py-2 px-2 text-center font-mono text-slate-500">TTE-C-0655</td>
                              <td className="py-2 px-2 text-right font-bold text-slate-900 font-mono">$5.836</td>
                              <td className="py-2 px-2.5 text-right font-mono text-slate-700">$294.459</td>
                            </tr>
                            <tr className="bg-slate-50/90 font-bold border-t border-slate-200">
                              <td className="py-2 px-2.5 text-slate-900">TOTAL COMPLEJO PMH (4 FRENTES ACTIVOS)</td>
                              <td className="py-2 px-2 text-center font-mono text-slate-600">4 CTAS</td>
                              <td className="py-2 px-2 text-right font-black text-emerald-700 font-mono">$438.002</td>
                              <td className="py-2 px-2.5 text-right font-black text-slate-900 font-mono">$3.003.253</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>

                {/* Callout Box: Dictamen Técnico */}
                <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-900 space-y-1.5 shadow-2xs">
                  <div className="font-bold flex items-center gap-1.5 text-blue-950">
                    <Info className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>DICTAMEN TÉCNICO Y CONTROL DE COSTOS EN PMH:</span>
                  </div>
                  <p className="leading-relaxed text-[11px] text-blue-900/90">
                    • <strong>Transición a Fase Civil y Montaje Electromecánico:</strong> El salto de $197.962 a $291.949 USD en la Segunda Línea PMH (TTE-C-0671) obedece al inicio del vaciado de concreto masivo y colocación de apoyos elastoméricos de neopreno de alto rendimiento para las galerías de transferencia marítima.<br />
                    • <strong>Polo Estratégico Portuario:</strong> Las 4 obras activas en PMH suman $438.002 USD en septiembre (26,7% del total de TIMACA) y superan los $3.003.253 USD acumulados en 2026, garantizando la capacidad de calado y despacho continuo de mineral de hierro en el Muelle de Puerto Ordaz.
                  </p>
                </div>
              </div>
            )}

            {/* SLIDE 8: REPOTENCIACIÓN RUEDA DE CANGILONES DRAVO PA-9020 (TTE-C-0653) */}
            {currentSlide === 8 && (
              <div className="py-2 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 uppercase tracking-wider">
                        Reacondicionamiento Mayor & Blindajes
                      </span>
                      <span className="text-xs text-slate-400 font-mono">TTE-C-0653 · DRAVO</span>
                    </div>
                    <h2 className="text-2xl font-black text-[#0b2545] tracking-tight mt-1">
                      Repotenciación Rueda de Cangilones DRAVO PA-9020 ({activeMonth?.mesLabel})
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Auditoría del salto presupuestario (+760,6% en Septiembre) · Suministro concentrado de planchas de desgaste Hardox, pernos de fijación y rodamientos
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
                    <button
                      onClick={() => setSlideDravoTab('evolucion')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        slideDravoTab === 'evolucion'
                          ? 'bg-[#0b2545] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                      }`}
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                      <span>Evolución Mensual ($553K)</span>
                    </button>
                    <button
                      onClick={() => setSlideDravoTab('blindajes')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        slideDravoTab === 'blindajes'
                          ? 'bg-[#0b2545] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Blindajes y Componentes</span>
                    </button>
                  </div>
                </div>

                {/* 4 KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Inversión en Septiembre</span>
                    <span className="text-xl font-black text-[#0b2545] block mt-1">$199.356 USD</span>
                    <span className="text-[11px] font-bold text-amber-600 mt-0.5 inline-flex items-center gap-0.5">
                      <ArrowUpRight className="w-3 h-3" /> Salto de +$176.191 vs Agosto ($23K)
                    </span>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Variación Mensual</span>
                    <span className="text-xl font-black text-amber-600 block mt-1">+760,6%</span>
                    <span className="text-[11px] font-semibold text-slate-500 mt-0.5 block">
                      Mayor aceleración presupuestaria
                    </span>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Acumulado Anual 2026</span>
                    <span className="text-xl font-black text-[#0b2545] block mt-1">$553.269 USD</span>
                    <span className="text-[11px] font-semibold text-blue-600 mt-0.5 block">
                      36,0% del total anual en Septiembre
                    </span>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Materiales Directos (Sep)</span>
                    <span className="text-xl font-black text-blue-700 block mt-1">$182.885 USD</span>
                    <span className="text-[11px] font-semibold text-slate-500 mt-0.5 block">
                      91,7% de la inversión del mes
                    </span>
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Left Column: Monthly Evolution */}
                  <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-blue-600" />
                        <span>Curva de Desembolsos Ene - Sep 2026 (TTE-C-0653)</span>
                      </h3>
                      <span className="text-[11px] font-bold font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        Ene-Sep: $553.269 USD
                      </span>
                    </div>

                    {/* Visual Bar chart of Dravo months */}
                    <div className="space-y-1.5 pt-1">
                      {[
                        { mes: 'Enero', val: 767, pct: 0.4 },
                        { mes: 'Febrero', val: 14687, pct: 7.4 },
                        { mes: 'Marzo', val: 60627, pct: 30.4 },
                        { mes: 'Abril', val: 34885, pct: 17.5 },
                        { mes: 'Mayo', val: 154916, pct: 77.7 },
                        { mes: 'Junio', val: 37829, pct: 19.0 },
                        { mes: 'Julio', val: 27036, pct: 13.6 },
                        { mes: 'Agosto', val: 23166, pct: 11.6 },
                        { mes: 'Septiembre', val: 199356, pct: 100.0, highlight: true }
                      ].map((m, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs">
                          <span className="w-20 text-[11px] text-slate-600 font-medium shrink-0">{m.mes}:</span>
                          <div className="flex-1 bg-slate-100 rounded-full h-4 overflow-hidden relative">
                            <div 
                              className={`h-full rounded-full transition-all ${m.highlight ? 'bg-amber-500' : 'bg-blue-600'}`} 
                              style={{ width: `${Math.max(m.pct, 2)}%` }} 
                            />
                          </div>
                          <span className={`w-20 text-right font-mono font-bold text-[11px] shrink-0 ${m.highlight ? 'text-amber-700' : 'text-slate-800'}`}>
                            ${m.val.toLocaleString('de-DE')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Breakdown of Components */}
                  <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-2">
                        <Layers className="w-4 h-4 text-amber-600" />
                        <span>Estructura de Componentes en Septiembre</span>
                      </h3>
                      <span className="text-[11px] font-bold font-mono text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        100% Auditado SIP
                      </span>
                    </div>

                    <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300">
                      <table className="w-full text-left text-xs border-collapse min-w-[480px]">
                        <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                          <tr>
                            <th className="py-2 px-2.5">Componente Reacondicionado</th>
                            <th className="py-2 px-2 text-right">Monto ($)</th>
                            <th className="py-2 px-2 text-center">% Part.</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-[11px]">
                          <tr className="hover:bg-slate-50/70">
                            <td className="py-2 px-2.5 font-bold text-slate-900">Planchas de Desgaste Antiabrasivas Hardox / A514</td>
                            <td className="py-2 px-2 text-right font-bold text-slate-900 font-mono">$112.450</td>
                            <td className="py-2 px-2 text-center text-slate-500 font-mono">56,4%</td>
                          </tr>
                          <tr className="hover:bg-slate-50/70">
                            <td className="py-2 px-2.5 font-medium text-slate-800">Pernos A325 / Grado 8 y Tuercas Pavonadas</td>
                            <td className="py-2 px-2 text-right font-bold text-slate-900 font-mono">$34.120</td>
                            <td className="py-2 px-2 text-center text-slate-500 font-mono">17,1%</td>
                          </tr>
                          <tr className="hover:bg-slate-50/70">
                            <td className="py-2 px-2.5 font-medium text-slate-800">Rodamientos, Sellos y Transmisiones Mecánicas</td>
                            <td className="py-2 px-2 text-right font-bold text-slate-900 font-mono">$36.315</td>
                            <td className="py-2 px-2 text-center text-slate-500 font-mono">18,2%</td>
                          </tr>
                          <tr className="hover:bg-slate-50/70">
                            <td className="py-2 px-2.5 font-medium text-slate-800">Prorrateo de Costos Indirectos de Soporte</td>
                            <td className="py-2 px-2 text-right font-bold text-slate-900 font-mono">$16.471</td>
                            <td className="py-2 px-2 text-center text-slate-500 font-mono">8,3%</td>
                          </tr>
                          <tr className="bg-amber-50/80 font-bold border-t border-amber-200">
                            <td className="py-2 px-2.5 text-amber-950">TOTAL IMPUTADO SEPTIEMBRE (TTE-C-0653)</td>
                            <td className="py-2 px-2 text-right font-black text-amber-900 font-mono">$199.356</td>
                            <td className="py-2 px-2 text-center font-mono font-bold text-amber-950">100,0%</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Callout Box: Justificación de Auditoría */}
                <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-950 space-y-1.5 shadow-2xs">
                  <div className="font-bold flex items-center gap-1.5 text-amber-950">
                    <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>AUDITORÍA Y JUSTIFICACIÓN TÉCNICA DEL SALTO OPERATIVO (+760,6%):</span>
                  </div>
                  <p className="leading-relaxed text-[11px] text-amber-900/90">
                    • <strong>Ventana de Parada Crítica VISCO / FMO:</strong> Tras meses de ingeniería y desmontaje preliminar, en septiembre se autorizó la parada técnica en caliente de la Rueda de Cangilones PA-9020. Para no paralizar el flujo de despacho marítimo, se concentró en una sola ventana el suministro e instalación de planchas de desgaste Hardox para los 10 cangilones y tolva receptora.<br />
                    • <strong>Trazabilidad SIP Verificada:</strong> Los despachos corresponden a vales reales de almacén (ej. DP0038612 y pedidos de compra asociados) con destino exclusivo al equipo PA-9020, descartando mala imputación contable.
                  </p>
                </div>
              </div>
            )}

            {/* SLIDE 9: COSTOS INDIRECTOS Y PRORRATEO POR ÁREA */}
            {currentSlide === 9 && (
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
                            const pellasPct = 0.602;
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
                            <span className="w-3 h-3 rounded-full bg-[#002060]" /> Pellas Línea 1 (60,2%)
                          </span>
                          <span className="flex items-center gap-1.5 font-bold text-amber-600">
                            <span className="w-3 h-3 rounded-full bg-[#f59e0b]" /> Resto Proyectos (39,8%)
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
                            El modelo contable de TIMACA distribuye los costos indirectos de soporte técnico, supervisión y logística en estricta proporción a las horas-hombre devengadas por la fuerza laboral directa. Pellas Línea 1, al movilizar más de 250 obreros estables y el 60,2% de la nómina directa ($133.185 USD), absorbe legítimamente el 60,2% de la estructura indirecta ($236.688 USD).
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                            <span className="text-[10.5px] font-bold text-slate-500 uppercase block">Pellas Línea 1</span>
                            <strong className="text-lg font-black font-mono text-[#002060] block">
                              ${Math.round((categoriasMesAnalisis[4]?.monto || 393375) * 0.602).toLocaleString('de-DE')} USD
                            </strong>
                            <span className="text-[10px] text-slate-500">
                              60,2% de absorción corporativa (anclada a MOD)
                            </span>
                          </div>

                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                            <span className="text-[10.5px] font-bold text-slate-500 uppercase block">Resto de Proyectos ({cuentasAuxiliaresMes.length - 1} obras)</span>
                            <strong className="text-lg font-black font-mono text-amber-700 block">
                              ${Math.round((categoriasMesAnalisis[4]?.monto || 393375) * 0.398).toLocaleString('de-DE')} USD
                            </strong>
                            <span className="text-[10px] text-slate-500">
                              39,8% distribuido en frentes activos restantes
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-100 border border-slate-300 text-xs text-slate-800 flex justify-between items-center">
                      <span><strong>Total Indirectos {activeMonth?.mesLabel?.split(' ')[0]}:</strong> ${categoriasMesAnalisis[4]?.monto.toLocaleString('de-DE')} USD</span>
                      <span><strong>Pellas Línea 1 (60,2%):</strong> ${Math.round((categoriasMesAnalisis[4]?.monto || 393375) * 0.602).toLocaleString('de-DE')} USD</span>
                      <span><strong>Demás Proyectos (39,8%):</strong> ${Math.round((categoriasMesAnalisis[4]?.monto || 393375) * 0.398).toLocaleString('de-DE')} USD</span>
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
                        {(selectedMesNum === 9 ? [
                          { concept: 'Nómina Interna y Dirección Técnica TIMACA', monto: 125000, desc: 'Ingenieros residentes, supervisores de seguridad industrial, control de proyectos y gerencia técnica en planta y campo.' },
                          { concept: 'Nómina de Talleres y Mantenimiento Central', monto: 122000, desc: 'Mecánicos, electricistas de planta, torneros, mantenimiento de grúas y soporte de pailería central.' },
                          { concept: 'Aporte y Gestión Sindical', monto: 58952, desc: 'Obligaciones contractuales de convención colectiva, aportes gremiales, dotaciones reglamentarias y bienestar laboral.' },
                          { concept: 'Combustible y Lubricantes de Soporte', monto: 50413, desc: 'Abastecimiento de gasoil y lubricantes para transporte de soporte, generadores auxiliares y logística de planta.' },
                          { concept: 'Otros Costos Indirectos y Operativos', monto: 25507, desc: 'Mantenimiento menor de campamentos, consumibles de oficina de obra, ferretería auxiliar y gastos de soporte.' },
                          { concept: 'Bonificaciones de Productividad y Campo', monto: 6700, desc: 'Incentivos por cumplimiento de metas de producción, paradas de planta y turnos extendidos.' },
                          { concept: 'Seguridad y Vigilancia Perimetral', monto: 4803, desc: 'Custodia patrimonial y seguridad perimetral 24/7 en instalaciones centrales, talleres y almacenes.' }
                        ] : [
                          { concept: 'Nómina Interna y Dirección Técnica de Obra', monto: 125000, desc: 'Ingenieros residentes, supervisores de seguridad, control de calidad y analistas de costo en planta.' },
                          { concept: 'Nómina de Talleres y Mantenimiento Central', monto: 122000, desc: 'Cuadrillas de mantenimiento de maquinaria, puente grúas de talleres y logística interna.' },
                          { concept: 'Aporte y Gestión Sindical', monto: 57000, desc: 'Obligaciones contractuales de convención colectiva y bienestar laboral.' },
                          { concept: 'Combustible y Lubricantes de Flota', monto: 28000, desc: 'Abastecimiento de gasoil y lubricantes para camiones de transporte y generadores auxiliares.' },
                          { concept: 'Seguridad, Vigilancia Integral y Pólizas', monto: 18000, desc: 'Custodia perimetral 24/7 en talleres y frentes de obra de Puerto Ordaz.' }
                        ]).map((sub, idx) => {
                          const totalCif = categoriasMesAnalisis[4]?.monto || 393375;
                          const pctDelTotal = Math.round((sub.monto / totalCif) * 1000) / 10;
                          const maxVal = 130000;
                          const pctBar = Math.min(100, Math.round((sub.monto / maxVal) * 100));

                          return (
                            <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                              <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#002060]" />
                                  <strong className="text-slate-900 font-bold">{sub.concept}</strong>
                                </div>
                                <div className="flex items-center gap-2 font-mono">
                                  <span className="text-[11px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                                    {pctDelTotal}%
                                  </span>
                                  <span className="font-bold text-[#0b2545] text-sm">
                                    ${sub.monto.toLocaleString('de-DE')} USD
                                  </span>
                                </div>
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

            {/* SLIDE 10: CONCLUSIONES Y GESTIÓN */}
            {currentSlide === 10 && (
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
                            <span>{selectedMesNum === 10 
                              ? <><strong>Materiales y Servicios Purificados al 100%:</strong> Base de datos de $1.444.345,28 USD en proyectos externos auditada sin ceros, sin registros a destiempo y con imputación contable al centavo.</>
                              : <><strong>Mano de Obra Directa al día:</strong> $196.665 USD devengados en 10 proyectos externos sin pasivos atrasados ni contingencias, liderada por Pellas Línea 1 ($133.185 USD · 60,2%) y Bandas PMH ($28.142 USD · 12,7%).</>}
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-emerald-600 font-bold">✔</span>
                            <span>{selectedMesNum === 10
                              ? <><strong>Proyecto Pellas Línea 1 superó los $3,25M USD:</strong> Acumulado consolidado de $3.256.839 USD (10,96% sobre contrato marco de $29.720.000 USD), manteniendo 254 trabajadores estables en campo.</>
                              : <><strong>Proyecto Pellas Línea 1 con avance sostenido:</strong> Acumulado consolidado de $2.388.978 USD (8,0% sobre contrato marco de $29.720.000 USD), con 254 trabajadores directos y 812 horas máquina efectivas.</>}
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-emerald-600 font-bold">✔</span>
                            <span>{selectedMesNum === 10
                              ? <><strong>Tracción Operativa en PMH y DRAVO:</strong> Segunda Línea PMH ($258.882 USD) y Repotenciación DRAVO ($106.812 USD) consolidan el segundo y tercer polo de mayor avance físico.</>
                              : <><strong>Aceleración Operativa Oficial:</strong> Cierre de septiembre en $1.613.225 USD (+36,8% vs agosto $1.197.600 USD), impulsado por la inversión en materiales directos ($868.067 USD) para asegurar las metas de avance físico.</>}
                            </span>
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
                            <span>{selectedMesNum === 10
                              ? <><strong>Servicios Especializados ($967.479 USD):</strong> Concentran el 67,0% del gasto de octubre por compras estratégicas en Yokogawa ($686K) y Henan Front ($40K); auditar recepción de hitos técnicos.</>
                              : <><strong>Repunte Rueda DRAVO (+761%):</strong> Cierre en $199.356 USD (vs $23.149 USD en agosto) por reactivación operativa y componentes electromecánicos; auditar recepción física en almacén de obra.</>}
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-amber-600 font-bold">⚠</span>
                            <span>{selectedMesNum === 10
                              ? <><strong>Pendiente Cierre de Nómina MOD y CIF:</strong> Recursos Humanos y Administración están por remitir los libros de mano de obra y costos indirectos de octubre para completar la conciliación global.</>
                              : <><strong>Segunda Línea PMH en expansión (+47%):</strong> Cierre en $291.949 USD (vs $198.053 USD en agosto), consolidándose como el segundo frente de mayor inversión de TIMACA (17,8% del mes).</>}
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-amber-600 font-bold">⚠</span>
                            <span>{selectedMesNum === 10
                              ? <><strong>Techo Presupuestario TTE-C-0656 (Bandas PMH):</strong> Acumula más del 82% de su presupuesto marco; tramitar oportunamente la adenda contractual ante el cliente.</>
                              : <><strong>Contrato TTE-C-0697 (Bandas PMH) al 90%:</strong> Acumula $981.810 USD sobre un presupuesto contractual de $1.091.248 USD; requiere tramitar adenda formal de techo para evitar sobrecostos.</>}
                            </span>
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
                            <span>{selectedMesNum === 10
                              ? <><strong>Alistamiento Preoperativo en Pellas:</strong> Los servicios de instrumentación y control Yokogawa aseguran las condiciones para el comisionamiento y pruebas de vacío del sistema de peletización.</>
                              : <><strong>Cero Tiempos Muertos en Maquinaria:</strong> 16 equipos activos en Pellas Línea 1 sumando 811,7 horas efectivas ($55.578 USD), liderados por la Grúa Demag AC200 (130,6 h · $24.841 USD).</>}
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 font-bold">★</span>
                            <span><strong>Reasignación Dinámica por Cronograma:</strong> Transferir personal técnico y recursos de izaje hacia frentes con metas contractuales perentorias (Segunda Línea PMH y Pellas 1), asegurando el estricto cumplimiento de los tiempos comprometidos con el cliente.</span>
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
                            <span>{selectedMesNum === 10
                              ? <><strong>Incorporación Inmediata de Nómina MOD y CIF:</strong> Cargar los datos de nómina y costos indirectos de octubre en cuanto RRHH y Administración cierren los libros del mes.</>
                              : <><strong>Validación Quincenal por Gerentes:</strong> Formalizar la aprobación técnica previa de materiales directos ($868.067 USD) y servicios ($99.540 USD) por cada responsable de obra antes de comprometer desembolsos.</>}
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-[#002060] font-bold">➜</span>
                            <span>{selectedMesNum === 10
                              ? <><strong>Aprobación de Valuaciones Yokogawa y Henan Front:</strong> Respaldar las órdenes de pago de servicios especializados con los certificados de avance emitidos por la gerencia de obra.</>
                              : <><strong>Adenda Contractual TTE-C-0697:</strong> Elevar a Junta Directiva la solicitud formal de adenda antes de comprometer nuevos despachos en Bandas PMH.</>}
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-[#002060] font-bold">➜</span>
                            <span>{selectedMesNum === 10
                              ? <><strong>Seguimiento a Despachos de Aceros:</strong> Coordinar con almacén central la entrega inmediata de planchas y perfiles para avance de calderería en taller y puerto.</>
                              : <><strong>Control de Costos Indirectos (CIF):</strong> Monitorear la absorción de los $393.375 USD bajo la metodología de ancla MOD (60,2% Pellas = $236.688 USD / 39,8% Resto) y supervisar rendición de nómina corporativa.</>}
                            </span>
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
            </div>

            {/* Bottom Navigation Bar of Slides */}
            <div id="slide-bottom-navigation-bar" className="flex items-center justify-between border-t border-slate-200 pt-3 mt-3">
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
                    <td className="py-2.5 px-3 text-center font-mono text-xs text-emerald-700 font-bold">
                      ▲ 37%
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
