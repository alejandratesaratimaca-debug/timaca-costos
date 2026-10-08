import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { useCostos } from '../context/CostosContext';
import { formatCurrency, formatNumber } from '../utils/dateHelpers';
import { KPIHeader } from './KPIHeader';
import { isNormalizacion } from '../utils/normalizacionFilter';
import { CUENTAS_CORTAS_MAP, DETALLE_SUBCONCEPTOS_CATEGORIAS, TABLA_PPT_DISTRIBUCION_2026, TOTALES_MESES_PPT } from '../data/mockCostosTimaca';
import { 
  TrendingUp, 
  PieChart as PieIcon, 
  BarChart2, 
  FolderDown, 
  ArrowRight,
  Briefcase,
  FileCheck2,
  FileText,
  Clock,
  Layers,
  Search,
  AlertTriangle,
  Info,
  Download,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Calendar,
  X,
  Eye,
  Edit3,
  ExternalLink
} from 'lucide-react';
import { UsuarioSistema } from '../types/usuarios';
import { SalidaCosto, ResumenMensual } from '../types/costos';

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
  onGoToValidacion?: () => void;
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
  onGoToValidacion,
  currentUser
}) => {
  const {
    salidas: rawSalidas,
    resumenSemanas,
    resumenMeses,
    resumenCategorias,
    resumenProyectos,
    totalMontoGlobal,
  } = useCostos();

  const isGerente = currentUser?.rol === 'Gerente de Proyecto';
  const cuentasAsignadas = currentUser?.cuentasAsignadas || [];

  // Segregación estricta por proyecto para Gerente
  const salidas = useMemo(() => {
    if (isGerente && cuentasAsignadas.length > 0) {
      return rawSalidas.filter(s => cuentasAsignadas.includes(s.cuentaAuxiliarCodigo));
    }
    return rawSalidas;
  }, [rawSalidas, isGerente, cuentasAsignadas]);

  const [hoveredWeek, setHoveredWeek] = useState<number | null>(null);
  const [chartMode, setChartMode] = useState<'mensual' | 'semanal' | 'por-categoria'>('mensual');
  const [selectedCatFocus, setSelectedCatFocus] = useState<string>('Materiales Directos');
  const [filtroTipoProyecto, setFiltroTipoProyecto] = useState<'todos' | 'externos'>('todos');
  const [selectedMesFiltro, setSelectedMesFiltro] = useState<number | 'todos'>('todos');
  const [selectedCuentasFiltro, setSelectedCuentasFiltro] = useState<string[]>([]);
  const [filasAMostrar, setFilasAMostrar] = useState<number | 'todas'>(50);
  const [downloadExcelSuccess, setDownloadExcelSuccess] = useState<boolean>(false);
  const [selectedMesModal, setSelectedMesModal] = useState<ResumenMensual | null>(null);
  const [salidaAuditoria, setSalidaAuditoria] = useState<SalidaCosto | null>(null);
  const [periodoDetalleCategorias, setPeriodoDetalleCategorias] = useState<'anual' | number>('anual');

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

  // Lista de todas las cuentas auxiliares disponibles para filtrar, ordenadas de mayor a menor monto
  const cuentasDisponibles = useMemo(() => {
    const map = new Map<string, { codigo: string; nombre: string; count: number; total: number }>();
    salidas.filter(s => !isNormalizacion(s)).forEach(s => {
      const cod = s.cuentaAuxiliarCodigo;
      const nom = CUENTAS_CORTAS_MAP[cod] || s.cuentaAuxiliarNombre || s.proyecto;
      if (!map.has(cod)) {
        map.set(cod, { codigo: cod, nombre: nom, count: 0, total: 0 });
      }
      const item = map.get(cod)!;
      item.count += 1;
      item.total += s.montoTotal;
    });
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [salidas]);

  const toggleCuentaFiltro = (codigo: string) => {
    setSelectedCuentasFiltro(prev => {
      if (prev.includes(codigo)) {
        return prev.filter(c => c !== codigo);
      } else {
        return [...prev, codigo];
      }
    });
  };

  // Lista ordenada de salidas filtradas (por proyecto externo, por mes y por cuentas auxiliares, purificadas de normalización)
  const salidasFiltradas = useMemo(() => {
    let list = salidas.filter(s => !isNormalizacion(s));
    if (filtroTipoProyecto === 'externos') {
      list = list.filter(s => s.esProyectoExterno ?? s.cuentaAuxiliarCodigo.startsWith('TTE-C-'));
    }
    if (selectedMesFiltro !== 'todos') {
      list = list.filter(s => s.mes === selectedMesFiltro);
    }
    if (selectedCuentasFiltro.length > 0) {
      list = list.filter(s => selectedCuentasFiltro.includes(s.cuentaAuxiliarCodigo));
    }
    return list.sort((a, b) => b.fecha.localeCompare(a.fecha) || b.codigoSalida.localeCompare(a.codigoSalida));
  }, [salidas, filtroTipoProyecto, selectedMesFiltro, selectedCuentasFiltro]);

  // Total monto del mes o período y cuentas seleccionadas
  const totalMontoMesSeleccionado = useMemo(() => {
    return salidasFiltradas.reduce((acc, s) => acc + s.montoTotal, 0);
  }, [salidasFiltradas]);

  // Salidas que se renderizan en la tabla
  const ultimasSalidas = useMemo(() => {
    if (filasAMostrar === 'todas') return salidasFiltradas;
    return salidasFiltradas.slice(0, filasAMostrar);
  }, [salidasFiltradas, filasAMostrar]);

  const totalMontoMostrado = useMemo(() => {
    return ultimasSalidas.reduce((acc, s) => acc + s.montoTotal, 0);
  }, [ultimasSalidas]);

  // Colores oficiales distintivos de las 5 categorías
  const getCategoryBadgeClass = (tipo: string) => {
    switch (tipo) {
      case 'Materiales Directos':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Servicios':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Mano de Obra Directa':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Horas Maquina':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Costos Indirectos':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  // Obtener la categoría macro oficial TIMACA (Materiales Directos, Servicios, Horas Maquina, etc.)
  const getCategoriaOficial = (s: SalidaCosto): string => {
    const tipo = (s.tipo || '').trim();
    if (tipo === 'Materiales Directos' || tipo.toLowerCase().includes('material')) return 'Materiales Directos';
    if (tipo.toUpperCase() === 'SERVICIOS' || tipo.toLowerCase().includes('servicio')) return 'Servicios';
    if (tipo === 'Horas Maquina' || tipo.toLowerCase().includes('hora') || tipo.toLowerCase().includes('maquina')) return 'Horas Maquina';
    if (tipo.includes('Mano de Obra') || tipo.includes('MOD')) return 'Mano de Obra Directa';
    if (tipo.includes('Indirecto')) return 'Costos Indirectos';

    const cat = (s.categoria || '').trim();
    if (cat === 'Materiales Directos' || cat.toLowerCase().includes('material') || cat.toLowerCase().includes('ferreteria') || cat.toLowerCase().includes('pintura') || cat.toLowerCase().includes('acero') || cat.toLowerCase().includes('tubular') || cat.toLowerCase().includes('quimico') || cat.toLowerCase().includes('soldadura') || cat.toLowerCase().includes('herramienta') || cat.toLowerCase().includes('galvanizado') || cat.toLowerCase().includes('mecanico')) {
      return 'Materiales Directos';
    }
    if (cat.toUpperCase() === 'SERVICIOS' || cat.toLowerCase().includes('servicio')) return 'Servicios';
    if (cat === 'Horas Maquina' || cat.toLowerCase().includes('hora') || cat.toLowerCase().includes('maquina')) return 'Horas Maquina';
    if (cat.includes('Mano de Obra') || cat.includes('MOD')) return 'Mano de Obra Directa';
    if (cat.includes('Indirecto')) return 'Costos Indirectos';

    return s.tipo || s.categoria || 'Materiales Directos';
  };

  // Tipo de material o subpartida específica (Materiales de Ferretería, Tintas y Pinturas, etc.)
  const getTipoMaterialDisplay = (s: SalidaCosto): string => {
    const catOficial = getCategoriaOficial(s);
    if (catOficial === 'Materiales Directos') {
      if (s.subcategoria && s.subcategoria !== 'Materiales Directos') return s.subcategoria;
      if (s.categoria && s.categoria !== 'Materiales Directos') return s.categoria;
      return 'Materiales Generales';
    }
    if (catOficial === 'Servicios') {
      if (s.subcategoria && s.subcategoria !== 'SERVICIOS' && s.subcategoria !== 'Servicios') return s.subcategoria;
      return s.itemDescripcion && s.itemDescripcion !== 'Sin descripción' ? s.itemDescripcion : 'Servicios Directos';
    }
    if (catOficial === 'Horas Maquina') {
      if (s.subcategoria && s.subcategoria !== 'Horas Maquina') return s.subcategoria;
      return s.codigoSalida ? `Equipo ${s.codigoSalida}` : 'Horas Maquina';
    }
    if (catOficial === 'Mano de Obra Directa') {
      if (s.subcategoria && !s.subcategoria.includes('Mano de Obra')) return s.subcategoria;
      return 'Nómina Operativa';
    }
    return s.subcategoria || s.categoria || 'General';
  };

  // Exportar salidas actuales a Excel
  const handleExportarExcel = () => {
    const dataExcel = salidasFiltradas.map(s => {
      let fechaFormateada = s.fecha;
      if (s.fecha && s.fecha.includes('-')) {
        const parts = s.fecha.split('-');
        if (parts.length === 3) fechaFormateada = `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return {
        'Fecha': fechaFormateada,
        'Cuenta Auxiliar': s.cuentaAuxiliarCodigo,
        'Proyecto': CUENTAS_CORTAS_MAP[s.cuentaAuxiliarCodigo] || s.proyecto,
        'Categoría': getCategoriaOficial(s),
        'Tipo de Material': getTipoMaterialDisplay(s),
        'Descripción del Ítem': s.itemDescripcion,
        'Cantidad': s.cantidad,
        'Unidad': s.unidadMedida,
        'Precio Unitario (USD)': s.montoUnitario,
        'Monto Total (USD)': s.montoTotal,
        'Motivo': s.motivo || s.observaciones || '-',
        'Solicitante': s.solicitante || s.responsable || '-',
        'Semana': s.semanaLabel || `Semana ${s.semana}`,
        'Mes': s.mesLabel || `Mes ${s.mes}`
      };
    });

    const ws = XLSX.utils.json_to_sheet(dataExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Salidas_Costos_SIP');

    ws['!cols'] = [
      { wch: 12 },
      { wch: 15 },
      { wch: 28 },
      { wch: 22 },
      { wch: 26 },
      { wch: 45 },
      { wch: 12 },
      { wch: 12 },
      { wch: 18 },
      { wch: 18 },
      { wch: 35 },
      { wch: 25 },
      { wch: 14 },
      { wch: 14 }
    ];

    const nombreArchivo = filtroTipoProyecto === 'externos'
      ? `TIMACA_Salidas_SIP_Proyectos_Externos_2026.xlsx`
      : `TIMACA_Salidas_SIP_Costos_2026.xlsx`;

    XLSX.writeFile(wb, nombreArchivo);
    setDownloadExcelSuccess(true);
    setTimeout(() => setDownloadExcelSuccess(false), 3500);
  };

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
          {onGoToValidacion && (
            <button
              onClick={onGoToValidacion}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all whitespace-nowrap self-start md:self-auto flex items-center gap-1.5 cursor-pointer"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Validar Imputaciones del Proyecto</span>
            </button>
          )}
        </div>
      )}

      {/* Information Banner for Local Sync - Modern, clean light gray/slate (Reemplazo del color oscuro) */}
      <div className="bg-slate-50 border border-slate-200 text-slate-800 p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Control de Gestión & Costos Industriales TIMACA
            </span>
          </div>
          {currentUser?.rol === 'Administrador' && (
            <p className="text-sm font-semibold text-slate-900">
              Base de datos conectada a:{' '}
              <code className="text-xs font-mono bg-white px-2 py-0.5 rounded text-blue-900 border border-slate-300 font-bold select-all">
                Modelo_Estrella_Costos_TIMACA_2026
              </code>
            </p>
          )}
          <p className="text-xs text-slate-600 leading-relaxed">
            Auditoría en tiempo real de salidas del SIP (Almacén), contratos de servicios y nómina semanal de Recursos Humanos.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {onGoToManoObra && (
            <button
              onClick={onGoToManoObra}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs"
            >
              <Clock className="w-4 h-4" />
              <span>Auditar MOD Diaria</span>
            </button>
          )}
          {onGoToValidacion && (
            <button
              onClick={onGoToValidacion}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-amber-950 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl transition-colors shadow-xs"
              title="Módulo de Validación de Imputaciones Contables por Gerentes de Proyecto"
            >
              <FileCheck2 className="w-4 h-4 text-amber-800" />
              <span>Validación Gerencial</span>
            </button>
          )}
          <button
            onClick={onGoToInforme}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors whitespace-nowrap shadow-xs"
          >
            <FileText className="w-4 h-4" />
            <span>Informe Mensual PPT</span>
          </button>
          <button
            onClick={onOpenImport}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors whitespace-nowrap shadow-xs"
          >
            <FolderDown className="w-4 h-4 text-slate-600" />
            <span>Cargar Archivos</span>
          </button>
        </div>
      </div>

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
              <span className="text-[11px] font-bold text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                Lámina PPT Oficial TIMACA
              </span>
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
              ? 11804998 
              : (TOTALES_MESES_PPT[mesIdx]?.total || 1345010);
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

      {/* Recent Activity Table (Sección 5: Últimas Salidas Registradas) */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-neutral-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-neutral-50/50">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-base font-bold text-neutral-900 tracking-tight">
                Últimas Salidas Registradas (Ordenadas de la más reciente a la más antigua)
              </h3>
              <span className="text-[11px] font-bold text-blue-800 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                {selectedMesFiltro === 'todos'
                  ? `Vales Auditados Enero - Septiembre 2026 (${salidasFiltradas.length.toLocaleString('de-DE')} comprobantes directos)`
                  : `Corte Contable: ${MESES_CONFIG.find(m => m.num === selectedMesFiltro)?.label} 2026 (${salidasFiltradas.length.toLocaleString('de-DE')} comprobantes)`}
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              {selectedMesFiltro === 'todos'
                ? 'Auditoría integral de salidas del almacén SIP, contratos de servicios y nómina de todo el año 2026'
                : `Auditoría comprobante por comprobante del mes de ${MESES_CONFIG.find(m => m.num === selectedMesFiltro)?.label} 2026`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Filtro interactivo de Proyectos Externos */}
            <div className="inline-flex p-1 bg-white rounded-xl border border-slate-300 text-xs font-semibold shadow-2xs">
              <button
                onClick={() => setFiltroTipoProyecto('todos')}
                className={`px-3 py-1.5 rounded-lg transition-all text-xs ${
                  filtroTipoProyecto === 'todos'
                    ? 'bg-slate-900 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Todos los Proyectos
              </button>
              <button
                onClick={() => setFiltroTipoProyecto('externos')}
                className={`px-3 py-1.5 rounded-lg transition-all text-xs flex items-center gap-1.5 ${
                  filtroTipoProyecto === 'externos'
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-blue-700 hover:bg-slate-50'
                }`}
                title="Filtrar solo proyectos de clientes externos TIMACA (Cuentas Auxiliares TTE-C)"
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Solo Proyectos Externos</span>
              </button>
            </div>

            {/* Selector de cantidad de salidas visibles sin salir de la vista */}
            <div className="inline-flex p-1 bg-white rounded-xl border border-slate-300 text-xs font-semibold shadow-2xs">
              {[25, 50, 100].map((num) => (
                <button
                  key={num}
                  onClick={() => setFilasAMostrar(num)}
                  className={`px-2.5 py-1.5 rounded-lg transition-all ${
                    filasAMostrar === num 
                      ? 'bg-blue-50 text-blue-800 font-bold border border-blue-200' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                  title={`Mostrar ${num} salidas`}
                >
                  {num}
                </button>
              ))}
              <button
                onClick={() => setFilasAMostrar('todas')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                  filasAMostrar === 'todas' 
                    ? 'bg-blue-600 text-white font-bold shadow-xs' 
                    : 'text-slate-700 hover:text-blue-700 hover:bg-slate-50'
                }`}
                title="Explorar todas las salidas del mes o período en esta misma tabla sin salirte a otra vista"
              >
                <span>Ver Todas ({salidasFiltradas.length})</span>
                {filasAMostrar === 'todas' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>

            {/* Botón Descargar en Excel */}
            <button
              onClick={handleExportarExcel}
              className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-3.5 py-2 rounded-xl transition-all shadow-2xs hover:shadow-xs"
              title="Descargar estas salidas directamente en un archivo de Excel (.xlsx)"
            >
              {downloadExcelSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>¡Excel Descargado!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-emerald-600" />
                  <span>Descargar en Excel</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Barra de Filtro Operativo por Meses y Muestra del Total */}
        <div className="px-4 py-3 bg-slate-100/90 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              Período:
            </span>
            <button
              onClick={() => setSelectedMesFiltro('todos')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedMesFiltro === 'todos'
                  ? 'bg-blue-600 text-white shadow-2xs font-bold'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 shadow-2xs'
              }`}
            >
              ★ Todo el Año (Ene - Sep)
            </button>
            {MESES_CONFIG.map((m) => (
              <button
                key={m.num}
                onClick={() => setSelectedMesFiltro(m.num)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedMesFiltro === m.num
                    ? 'bg-blue-600 text-white shadow-2xs font-bold'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 shadow-2xs'
                }`}
                title={`Filtrar comprobantes y salidas de ${m.label} 2026`}
              >
                {m.corto}
              </button>
            ))}
          </div>

          {/* Muestra Destacada del Total */}
          <div className="flex items-center gap-2.5 bg-blue-50/90 border border-blue-200/90 px-3.5 py-1.5 rounded-xl shadow-2xs self-start md:self-auto">
            <span className="text-slate-600 font-medium text-xs">
              Total Vales y Salidas Auditadas ({selectedMesFiltro === 'todos' ? 'Año 2026' : MESES_CONFIG.find(m => m.num === selectedMesFiltro)?.label}
              {filtroTipoProyecto === 'externos' ? ' · Solo Clientes' : ' · Directas'}
              {selectedCuentasFiltro.length > 0 ? ` [${selectedCuentasFiltro.length} cta${selectedCuentasFiltro.length > 1 ? 's' : ''}]` : ''}):
            </span>
            <span className="font-mono text-sm font-extrabold text-blue-900 tabular-nums">
              ${totalMontoMesSeleccionado.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-[11px] font-bold text-blue-700">USD</span>
            </span>
            <span className="text-[11px] text-blue-700 font-bold bg-white/95 px-2 py-0.5 rounded-md border border-blue-200/80 shadow-2xs">
              {salidasFiltradas.length.toLocaleString('de-DE')} {salidasFiltradas.length === 1 ? 'comprobante' : 'comprobantes'}
            </span>
          </div>
        </div>

        {/* Barra de Filtro por Cuentas Auxiliares */}
        <div className="px-4 py-2.5 bg-slate-50/90 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-2.5 text-xs">
          <div className="flex flex-wrap items-center gap-1.5 flex-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1 flex items-center gap-1 shrink-0">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              Filtrar por Cuentas:
            </span>
            <button
              onClick={() => setSelectedCuentasFiltro([])}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedCuentasFiltro.length === 0
                  ? 'bg-blue-600 text-white shadow-2xs font-bold'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300 shadow-2xs'
              }`}
            >
              Todas las Cuentas
            </button>
            {[
              { cod: 'TTE-C-0706', label: '0706 Línea 1 Pellas' },
              { cod: 'TTE-C-0671', label: '0671 2da PMH' },
              { cod: 'TTE-C-0668', label: '0668 Briquetas' },
              { cod: 'TTE-C-0656', label: '0656 Bandas PMH' },
              { cod: 'TTE-C-0669', label: '0669 Dravo' },
              { cod: 'TTE-C-0708', label: '0708 CVG Bauxilum' }
            ].map((p) => {
              const isActive = selectedCuentasFiltro.includes(p.cod);
              return (
                <button
                  key={p.cod}
                  onClick={() => toggleCuentaFiltro(p.cod)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                    isActive
                      ? 'bg-blue-700 text-white shadow-2xs font-bold ring-2 ring-blue-400'
                      : 'bg-white text-slate-700 hover:bg-blue-50 hover:text-blue-700 border border-slate-300 shadow-2xs'
                  }`}
                  title={`Filtrar por cuenta ${p.label}`}
                >
                  <span>{p.label}</span>
                  {isActive && <CheckCircle2 className="w-3 h-3 text-white" />}
                </button>
              );
            })}

            {/* Selector Dropdown para elegir cualquier Cuenta Auxiliar del modelo */}
            <div className="relative inline-block">
              <select
                value=""
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val) return;
                  if (val === '__todas__') {
                    setSelectedCuentasFiltro([]);
                  } else if (!selectedCuentasFiltro.includes(val)) {
                    setSelectedCuentasFiltro([...selectedCuentasFiltro, val]);
                  }
                }}
                className="text-xs bg-white text-slate-700 border border-slate-300 rounded-lg px-2.5 py-1 font-medium hover:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-2xs"
              >
                <option value="">+ Seleccionar otra cuenta ({cuentasDisponibles.length} disponibles)...</option>
                <option value="__todas__">Limpiar selección (Ver todas las cuentas)</option>
                <optgroup label="Cuentas Auxiliares (Mayor a Menor Monto)">
                  {cuentasDisponibles.map(c => (
                    <option key={c.codigo} value={c.codigo}>
                      {c.codigo} — {c.nombre} (${Math.round(c.total).toLocaleString('de-DE')} USD · {c.count} salidas)
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>

          {/* Active Chips si hay cuentas seleccionadas */}
          {selectedCuentasFiltro.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 self-start md:self-auto">
              <span className="text-[10px] text-slate-500 font-semibold">Filtro activo ({selectedCuentasFiltro.length}):</span>
              {selectedCuentasFiltro.map(cod => {
                return (
                  <span
                    key={cod}
                    className="inline-flex items-center gap-1 bg-blue-100 text-blue-900 border border-blue-300 text-[11px] font-bold px-2 py-0.5 rounded-md shadow-2xs"
                  >
                    <span>{cod}</span>
                    <button
                      onClick={() => toggleCuentaFiltro(cod)}
                      className="hover:text-red-600 transition-colors p-0.5"
                      title={`Quitar filtro ${cod}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
              <button
                onClick={() => setSelectedCuentasFiltro([])}
                className="text-[11px] font-bold text-red-600 hover:text-red-700 hover:underline px-1"
                title="Limpiar filtro de cuentas"
              >
                Limpiar
              </button>
            </div>
          )}
        </div>

        <div className={`overflow-x-auto ${filasAMostrar === 'todas' || (typeof filasAMostrar === 'number' && filasAMostrar > 15) ? 'max-h-[640px] overflow-y-auto' : ''}`}>
          <table className="w-full text-left text-xs border-collapse">
            {/* Encabezado claro con todas las columnas auditables */}
            <thead className="bg-slate-100/95 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider whitespace-nowrap sticky top-0 z-10 shadow-2xs">
              <tr>
                <th className="py-3 px-3">Fecha</th>
                <th className="py-3 px-3">Cuenta Auxiliar</th>
                <th className="py-3 px-3 min-w-[150px]">Proyecto</th>
                <th className="py-3 px-3 min-w-[130px]">Categoría</th>
                <th className="py-3 px-3 min-w-[140px]">Tipo de Material</th>
                <th className="py-3 px-4 min-w-[220px]">Descripción</th>
                <th className="py-3 px-3 text-right">Cantidad</th>
                <th className="py-3 px-3">Unidad</th>
                <th className="py-3 px-3 text-right">P. Unitario (USD)</th>
                <th className="py-3 px-3 text-right">Monto Total (USD)</th>
                <th className="py-3 px-3 min-w-[170px]">Motivo</th>
                <th className="py-3 px-3 min-w-[130px]">Solicitante</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 bg-white">
              {ultimasSalidas.map((s) => {
                const pCorto = CUENTAS_CORTAS_MAP[s.cuentaAuxiliarCodigo] || s.proyecto;
                
                // Formatear fecha a DD/MM/YYYY
                let fechaFormateada = s.fecha;
                if (s.fecha && s.fecha.includes('-')) {
                  const parts = s.fecha.split('-');
                  if (parts.length === 3) {
                    fechaFormateada = `${parts[2]}/${parts[1]}/${parts[0]}`;
                  }
                }

                const categoriaDisplay = getCategoriaOficial(s);
                const subcategoriaDisplay = getTipoMaterialDisplay(s);
                const motivoDisplay = s.motivo || s.observaciones || 'Despacho operativo';
                const solicitanteDisplay = s.solicitante || s.responsable || 'Almacén Central SIP';
                const cantDisplay = formatNumber(s.cantidad);
                const unidadDisplay = s.unidadMedida;
                const pUnitVal = s.montoUnitario;

                return (
                  <tr 
                    key={s.id} 
                    onClick={() => setSalidaAuditoria(s)}
                    className="hover:bg-blue-50/70 transition-colors cursor-pointer group"
                    title="Haz clic para auditar todos los 9 datos contables de esta partida"
                  >
                    {/* 1. Fecha */}
                    <td className="py-2.5 px-3 whitespace-nowrap font-mono tabular-nums text-neutral-700 text-xs font-semibold">
                      {fechaFormateada}
                    </td>

                    {/* 2. Cuenta Auxiliar */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="font-mono font-bold text-blue-700 text-xs bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded">
                        {s.cuentaAuxiliarCodigo}
                      </span>
                    </td>

                    {/* 3. Proyecto */}
                    <td className="py-2.5 px-3 whitespace-nowrap font-semibold text-neutral-800 text-xs" title={pCorto}>
                      {pCorto}
                    </td>

                    {/* 4. Categoría (Con color oficial) */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-md border ${getCategoryBadgeClass(categoriaDisplay)}`}>
                        {categoriaDisplay}
                      </span>
                    </td>

                    {/* 5. Tipo de Material (Subcategoría contable/operativa) */}
                    <td className="py-2.5 px-3 whitespace-nowrap font-medium text-neutral-700 text-xs">
                      <span className="font-medium text-slate-800 bg-slate-100/80 border border-slate-200 px-2 py-0.5 rounded text-[11px]">
                        {subcategoriaDisplay}
                      </span>
                    </td>

                    {/* 6. Descripción */}
                    <td className="py-2.5 px-4 font-medium text-neutral-900 text-xs" title={s.itemDescripcion}>
                      {s.itemDescripcion}
                    </td>

                    {/* 7. Cantidad */}
                    <td className="py-2.5 px-3 text-right whitespace-nowrap font-mono font-bold tabular-nums text-neutral-900 text-xs">
                      {cantDisplay}
                    </td>

                    {/* 8. Unidad */}
                    <td className="py-2.5 px-3 whitespace-nowrap text-neutral-700 text-xs font-medium">
                      {unidadDisplay}
                    </td>

                    {/* 9. P. Unitario (USD) */}
                    <td className="py-2.5 px-3 text-right whitespace-nowrap font-mono tabular-nums text-neutral-700 text-xs">
                      ${pUnitVal.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* 10. Monto Total (USD) */}
                    <td className="py-2.5 px-3 text-right whitespace-nowrap font-mono font-bold tabular-nums text-neutral-900 text-xs bg-slate-50/50">
                      ${s.montoTotal.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* 11. Motivo */}
                    <td className="py-2.5 px-3 text-neutral-600 text-xs min-w-[180px] max-w-[340px]" title={motivoDisplay}>
                      <span className="line-clamp-2 italic">{motivoDisplay}</span>
                    </td>

                    {/* 12. Solicitante */}
                    <td className="py-2.5 px-3 whitespace-nowrap text-neutral-800 text-xs font-medium">
                      {solicitanteDisplay}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Pie de tabla con totales exactos */}
            <tfoot className="bg-slate-100 border-t-2 border-slate-300 font-bold text-xs text-neutral-900 sticky bottom-0 z-10">
              <tr>
                <td colSpan={9} className="py-3 px-3 uppercase tracking-wider font-extrabold text-slate-800">
                  Total ({ultimasSalidas.length} registros mostrados):
                </td>
                <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-neutral-950 bg-slate-200/80 text-xs">
                  ${totalMontoMostrado.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
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
            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <button
                onClick={() => {
                  setSelectedMesFiltro(selectedMesModal.mes);
                  setSelectedMesModal(null);
                }}
                className="px-3.5 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-xl transition-colors"
              >
                Filtrar tabla inferior por este mes
              </button>
              <button
                onClick={() => setSelectedMesModal(null)}
                className="px-4 py-1.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AUDIT MODAL DE SALIDA */}
      {salidaAuditoria && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-md">
                    Comprobante {salidaAuditoria.codigoSalida}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    {salidaAuditoria.fecha} · Mes {salidaAuditoria.mes} ({salidaAuditoria.semanaLabel || `Semana ${salidaAuditoria.semana}`})
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-neutral-900 mt-1.5 flex items-center gap-2">
                  <span>Auditoría Contable y Salida SIP</span>
                </h3>
              </div>
              <button
                onClick={() => setSalidaAuditoria(null)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
                title="Cerrar ventana"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 1. Cuenta Auxiliar y Proyecto */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Cuenta Auxiliar / Proyecto
              </span>
              <div className="flex items-center justify-between text-xs gap-3">
                <span className="font-mono font-bold text-blue-700 bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-md text-sm shrink-0">
                  {salidaAuditoria.cuentaAuxiliarCodigo}
                </span>
                <span className="font-bold text-neutral-900 text-sm text-right">
                  {salidaAuditoria.cuentaAuxiliarNombre || salidaAuditoria.proyecto}
                </span>
              </div>
            </div>

            {/* 2. Clasificación Contable: Categoría y Tipo de Material */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs">
              <div>
                <span className="text-neutral-500 text-[11px] block mb-1 font-medium">Categoría:</span>
                <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-md border ${getCategoryBadgeClass(getCategoriaOficial(salidaAuditoria))}`}>
                  {getCategoriaOficial(salidaAuditoria)}
                </span>
              </div>
              <div>
                <span className="text-neutral-500 text-[11px] block mb-1 font-medium">Tipo de Material / Subcategoría:</span>
                <span className="inline-block font-bold text-slate-800 bg-white border border-slate-300 px-2.5 py-1 rounded-md text-xs shadow-2xs">
                  {getTipoMaterialDisplay(salidaAuditoria)}
                </span>
              </div>
            </div>

            {/* 3. Descripción del Ítem o Servicio */}
            <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200 space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-blue-700 tracking-wider block">
                Descripción del Ítem o Servicio
              </span>
              <p className="font-bold text-neutral-900 text-sm leading-snug">
                {salidaAuditoria.itemDescripcion}
              </p>
            </div>

            {/* 4. Cantidad, Precio Unitario y Precio Total */}
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span className="text-neutral-500 block text-[11px]">Cantidad</span>
                  <span className="font-mono font-bold text-neutral-900 text-sm">
                    {formatNumber(salidaAuditoria.cantidad)} {salidaAuditoria.unidadMedida}
                  </span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span className="text-neutral-500 block text-[11px]">Precio Unitario</span>
                  <span className="font-mono font-semibold text-neutral-800 text-sm">
                    ${salidaAuditoria.montoUnitario.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-[10px] text-neutral-500">USD</span>
                  </span>
                </div>
                <div className="bg-blue-50/80 p-2.5 rounded-lg border border-blue-200">
                  <span className="text-blue-700 block text-[11px] font-semibold">Precio Total</span>
                  <span className="font-mono font-black text-blue-900 text-sm sm:text-base">
                    ${salidaAuditoria.montoTotal.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-[10px] text-blue-700">USD</span>
                  </span>
                </div>
              </div>

              {/* Cálculo */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                  Cálculo:
                </span>
                <span className="font-mono text-xs sm:text-sm font-semibold text-slate-800">
                  {formatNumber(salidaAuditoria.cantidad)} {salidaAuditoria.unidadMedida} × ${salidaAuditoria.montoUnitario.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} = ${salidaAuditoria.montoTotal.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                </span>
              </div>
            </div>

            {/* 5. Trazabilidad: Fecha, Solicitante, Responsable y Motivo */}
            <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl space-y-2.5 text-xs text-neutral-800">
              <span className="text-[10px] uppercase font-bold text-neutral-600 tracking-wider block">
                Trazabilidad Operativa
              </span>
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div>
                  <span className="text-neutral-500 block text-[11px]">Fecha del Despacho:</span>
                  <span className="font-mono font-bold text-neutral-800">{salidaAuditoria.fecha}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[11px]">Solicitante:</span>
                  <span className="font-bold text-neutral-900">{salidaAuditoria.solicitante || 'Residencia de Obra'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-neutral-500 block text-[11px]">Responsable Almacén / Caja:</span>
                  <span className="font-medium text-neutral-700">{salidaAuditoria.responsable || 'Almacén Central SIP'}</span>
                </div>
                <div className="col-span-2 pt-1 border-t border-neutral-200">
                  <span className="text-neutral-500 block text-[11px] mb-0.5">Motivo Técnico:</span>
                  <p className="font-medium text-neutral-800 bg-white p-2 rounded-lg border border-neutral-200 text-xs">
                    {salidaAuditoria.motivo || salidaAuditoria.observaciones || 'Despacho operativo para orden de trabajo'}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end pt-2 border-t border-slate-200">
              <button
                onClick={() => setSalidaAuditoria(null)}
                className="px-4 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors shadow-xs"
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
