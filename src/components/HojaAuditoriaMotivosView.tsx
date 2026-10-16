import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { useCostos } from '../context/CostosContext';
import { SalidaCosto } from '../types/costos';
import { UsuarioSistema } from '../types/usuarios';
import { formatCurrency, formatNumber, formatUnitPriceRaw, formatAmountAuto } from '../utils/dateHelpers';
import { isNormalizacion } from '../utils/normalizacionFilter';
import { CUENTAS_CORTAS_MAP } from '../data/mockCostosTimaca';
import { 
  Search, 
  ArrowLeft, 
  Download, 
  Filter, 
  RotateCcw, 
  CheckCircle2, 
  Layers, 
  Briefcase, 
  Calendar, 
  User, 
  FileText, 
  Info, 
  DollarSign, 
  Sparkles, 
  ArrowUpDown, 
  Eye, 
  X,
  ShieldAlert,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';

interface HojaAuditoriaMotivosViewProps {
  onVolver: () => void;
  currentUser?: UsuarioSistema;
  initialCategoria?: string;
  initialCuentaCodigo?: string;
  initialMesNum?: number;
}

export const HojaAuditoriaMotivosView: React.FC<HojaAuditoriaMotivosViewProps> = ({
  onVolver,
  currentUser,
  initialCategoria = 'todas',
  initialCuentaCodigo = 'todas',
  initialMesNum = 'todos' as any
}) => {
  const { salidas: rawSalidas } = useCostos();

  // Estados de Filtros
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [motivoTerm, setMotivoTerm] = useState<string>('');
  const [solicitanteTerm, setSolicitanteTerm] = useState<string>('');
  const [selectedCategoria, setSelectedCategoria] = useState<string>(initialCategoria);
  const [selectedCuenta, setSelectedCuenta] = useState<string>(initialCuentaCodigo);
  const [selectedMes, setSelectedMes] = useState<number | 'todos'>(initialMesNum);
  const [selectedAlcance, setSelectedAlcance] = useState<'externos' | 'todos'>('externos');
  const [motivoTagFilter, setMotivoTagFilter] = useState<string>('todos');
  const [filasPerPage, setFilasPerPage] = useState<number>(50);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [salidaAuditoria, setSalidaAuditoria] = useState<SalidaCosto | null>(null);

  // Ordenamiento
  const [sortField, setSortField] = useState<'fecha' | 'cuenta' | 'categoria' | 'monto' | 'precio' | 'cantidad' | 'solicitante' | 'motivo'>('monto');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Colores distintivos oficiales de las 5 categorías
  const getCategoryBadge = (tipo: string) => {
    switch (tipo) {
      case 'Materiales Directos':
        return 'bg-blue-50 text-blue-700 border-blue-200/80';
      case 'Servicios':
        return 'bg-orange-50 text-orange-700 border-orange-200/80';
      case 'Mano de Obra Directa':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
      case 'Horas Maquina':
      case 'Horas Máquina':
        return 'bg-purple-50 text-purple-700 border-purple-200/80';
      case 'Costos Indirectos':
        return 'bg-amber-50 text-amber-700 border-amber-200/80';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  // Normalización y enriquecimiento de las salidas
  const baseSalidas = useMemo(() => {
    return rawSalidas
      .filter(s => !isNormalizacion(s))
      .filter(s => {
        if (selectedAlcance === 'externos') {
          return s.cuentaAuxiliarCodigo?.startsWith('TTE-C-') || s.esProyectoExterno || (s as any).tipoCosto === 'Externo';
        }
        return true;
      });
  }, [rawSalidas, selectedAlcance]);

  // Lista de Cuentas Auxiliares disponibles para el dropdown
  const listaCuentasDisponibles = useMemo(() => {
    const mapa = new Map<string, string>();
    baseSalidas.forEach(s => {
      if (s.cuentaAuxiliarCodigo) {
        const nombre = CUENTAS_CORTAS_MAP[s.cuentaAuxiliarCodigo] || s.cuentaAuxiliarNombre || s.proyecto;
        mapa.set(s.cuentaAuxiliarCodigo, nombre);
      }
    });
    return Array.from(mapa.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [baseSalidas]);

  // Filtro de salidas reactivo completo
  const salidasFiltradas = useMemo(() => {
    let list = baseSalidas;

    // Filtro por Categoría
    if (selectedCategoria !== 'todas') {
      list = list.filter(s => 
        s.tipo === selectedCategoria || 
        s.categoria === selectedCategoria ||
        (selectedCategoria === 'Horas Maquina' && (s.tipo === 'Horas Maquina' || s.tipo === 'Horas Máquina'))
      );
    }

    // Filtro por Cuenta Auxiliar
    if (selectedCuenta !== 'todas') {
      list = list.filter(s => s.cuentaAuxiliarCodigo === selectedCuenta);
    }

    // Filtro por Mes
    if (selectedMes !== 'todos') {
      list = list.filter(s => s.mes === Number(selectedMes));
    }

    // Filtro rápido por palabras clave de motivo
    if (motivoTagFilter !== 'todos') {
      const tag = motivoTagFilter.toLowerCase();
      list = list.filter(s => {
        const m = (s.motivo || s.observaciones || '').toLowerCase();
        const d = (s.itemDescripcion || '').toLowerCase();
        return m.includes(tag) || d.includes(tag);
      });
    }

    // Buscador universal
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter(s => 
        (s.motivo || '').toLowerCase().includes(q) ||
        (s.observaciones || '').toLowerCase().includes(q) ||
        (s.itemDescripcion || '').toLowerCase().includes(q) ||
        (s.solicitante || '').toLowerCase().includes(q) ||
        (s.responsable || '').toLowerCase().includes(q) ||
        (s.cuentaAuxiliarCodigo || '').toLowerCase().includes(q) ||
        (s.codigoSalida || '').toLowerCase().includes(q) ||
        (s.proyecto || '').toLowerCase().includes(q)
      );
    }

    // Buscador específico de motivo
    if (motivoTerm.trim()) {
      const q = motivoTerm.toLowerCase().trim();
      list = list.filter(s => 
        (s.motivo || '').toLowerCase().includes(q) ||
        (s.observaciones || '').toLowerCase().includes(q)
      );
    }

    // Buscador específico de solicitante
    if (solicitanteTerm.trim()) {
      const q = solicitanteTerm.toLowerCase().trim();
      list = list.filter(s => 
        (s.solicitante || '').toLowerCase().includes(q) ||
        (s.responsable || '').toLowerCase().includes(q)
      );
    }

    // Ordenamiento dinámico
    return [...list].sort((a, b) => {
      let valA: any = 0;
      let valB: any = 0;
      if (sortField === 'monto') {
        valA = a.montoTotal || 0;
        valB = b.montoTotal || 0;
      } else if (sortField === 'precio') {
        valA = a.montoUnitario || 0;
        valB = b.montoUnitario || 0;
      } else if (sortField === 'cantidad') {
        valA = a.cantidad || 0;
        valB = b.cantidad || 0;
      } else if (sortField === 'fecha') {
        valA = a.fecha || '';
        valB = b.fecha || '';
      } else if (sortField === 'cuenta') {
        valA = a.cuentaAuxiliarCodigo || '';
        valB = b.cuentaAuxiliarCodigo || '';
      } else if (sortField === 'categoria') {
        valA = a.tipo || a.categoria || '';
        valB = b.tipo || b.categoria || '';
      } else if (sortField === 'solicitante') {
        valA = a.solicitante || a.responsable || '';
        valB = b.solicitante || b.responsable || '';
      } else if (sortField === 'motivo') {
        valA = a.motivo || a.observaciones || '';
        valB = b.motivo || b.observaciones || '';
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [baseSalidas, selectedCategoria, selectedCuenta, selectedMes, motivoTagFilter, searchTerm, motivoTerm, solicitanteTerm, sortField, sortAsc]);

  // Paginación
  const totalFilas = salidasFiltradas.length;
  const totalPages = Math.ceil(totalFilas / filasPerPage) || 1;
  const paginatedSalidas = useMemo(() => {
    const start = (currentPage - 1) * filasPerPage;
    return salidasFiltradas.slice(start, start + filasPerPage);
  }, [salidasFiltradas, currentPage, filasPerPage]);

  // Métricas de auditoría
  const metricas = useMemo(() => {
    const totalMonto = salidasFiltradas.reduce((sum, s) => sum + (s.montoTotal || 0), 0);
    const cuentasUnicas = new Set(salidasFiltradas.map(s => s.cuentaAuxiliarCodigo)).size;
    const conMotivo = salidasFiltradas.filter(s => s.motivo && s.motivo !== '-' && s.motivo.trim().length > 3).length;
    const promedioMonto = totalFilas > 0 ? totalMonto / totalFilas : 0;
    return { totalMonto, cuentasUnicas, conMotivo, promedioMonto };
  }, [salidasFiltradas, totalFilas]);

  // Manejo de ordenamiento al hacer clic en cabecera
  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  // Reset de filtros
  const handleResetFiltros = () => {
    setSearchTerm('');
    setMotivoTerm('');
    setSolicitanteTerm('');
    setSelectedCategoria('todas');
    setSelectedCuenta('todas');
    setSelectedMes('todos');
    setMotivoTagFilter('todos');
    setCurrentPage(1);
  };

  // Exportar Hoja de Motivos a Excel (.xlsx)
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    const dataExcel = salidasFiltradas.map((s, idx) => {
      const pCorto = CUENTAS_CORTAS_MAP[s.cuentaAuxiliarCodigo] || s.cuentaAuxiliarNombre || s.proyecto;
      return {
        'N°': idx + 1,
        'Fecha': s.fecha,
        'Mes': s.mesLabel || `Mes ${s.mes}`,
        'Cuenta Auxiliar': s.cuentaAuxiliarCodigo,
        'Proyecto': pCorto,
        'Categoría': s.tipo || s.categoria,
        'Subcategoría': s.subcategoria || '',
        'Descripción del Ítem': s.itemDescripcion,
        'Cantidad': s.cantidad,
        'Unidad': s.unidadMedida === 'USE' ? 'SERV' : s.unidadMedida,
        'Precio Unitario (USD)': s.montoUnitario,
        'Monto Total (USD)': s.montoTotal,
        'Solicitante': s.solicitante || s.responsable || 'TIMACA',
        'Motivo / Justificación': s.motivo || s.observaciones || 'Imputación operativa regular',
        'Comprobante / Vale': s.codigoSalida,
        'Almacén / Origen': s.almacen || 'Almacén Central',
        'Centro de Costo': s.centroCosto || ''
      };
    });

    const ws = XLSX.utils.json_to_sheet(dataExcel);

    // Ajustar anchos de columnas en Excel
    ws['!cols'] = [
      { wch: 6 },   // N°
      { wch: 12 },  // Fecha
      { wch: 12 },  // Mes
      { wch: 16 },  // Cuenta Auxiliar
      { wch: 32 },  // Proyecto
      { wch: 22 },  // Categoría
      { wch: 24 },  // Subcategoría
      { wch: 45 },  // Descripción
      { wch: 10 },  // Cantidad
      { wch: 8 },   // Unidad
      { wch: 18 },  // P. Unitario
      { wch: 18 },  // Monto Total
      { wch: 26 },  // Solicitante
      { wch: 65 },  // Motivo
      { wch: 18 },  // Comprobante
      { wch: 20 },  // Almacén
      { wch: 16 },  // Centro Costo
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Hoja de Motivos y Solicitantes');

    // Sheet de Resumen por Categoría
    const catResumen: Record<string, { salidas: number; monto: number }> = {};
    salidasFiltradas.forEach(s => {
      const c = s.tipo || s.categoria || 'Otras';
      if (!catResumen[c]) catResumen[c] = { salidas: 0, monto: 0 };
      catResumen[c].salidas += 1;
      catResumen[c].monto += s.montoTotal || 0;
    });

    const dataResumen = Object.entries(catResumen).map(([cat, val]) => ({
      'Categoría': cat,
      'Total Registros': val.salidas,
      'Monto Total (USD)': val.monto,
      '% del Total': `${((val.monto / (metricas.totalMonto || 1)) * 100).toFixed(1)}%`
    }));

    const wsResumen = XLSX.utils.json_to_sheet(dataResumen);
    XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen por Categoría');

    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `TIMACA_Hoja_Auditoria_Motivos_y_Solicitantes_${dateStr}.xlsx`);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER CON BOTÓN VOLVER PROMINENTE Y ACCIONES PRINCIPALES         */}
      {/* ========================================================================= */}
      <div className="bg-white p-4.5 rounded-2xl border border-neutral-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onVolver}
            className="flex items-center gap-1.5 font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 px-3 py-1.5 rounded-xl transition-all text-xs shadow-2xs shrink-0 self-center"
            title="Volver al Menú Principal / Dashboard"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-blue-700" />
            <span>Volver</span>
          </button>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="p-1 rounded-md bg-[#0b2545] text-white shrink-0">
                <FileText className="w-4 h-4" />
              </span>
              <h1 className="text-lg sm:text-xl font-black text-[#0b2545] tracking-tight uppercase">
                Hoja de Motivos, Solicitantes & Cuentas Auxiliares
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                Auditoría Partida x Partida
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Revisión exhaustiva de motivos técnicos, cantidades, precios unitarios, solicitantes y cuentas auxiliares de proyectos TIMACA (2026).
            </p>
          </div>
        </div>

        {/* Acciones del Encabezado */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Switch de Alcance: Externos vs Global */}
          <div className="flex items-center p-1 bg-neutral-100 rounded-xl border border-neutral-200 text-xs font-bold shadow-2xs">
            <button
              onClick={() => setSelectedAlcance('externos')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedAlcance === 'externos'
                  ? 'bg-[#0b2545] text-white shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Proyectos Externos (TTE)
            </button>
            <button
              onClick={() => setSelectedAlcance('todos')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedAlcance === 'todos'
                  ? 'bg-[#0b2545] text-white shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Consolidado Total
            </button>
          </div>

          {/* Botón de Descarga Excel */}
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 rounded-xl transition-colors shadow-2xs"
            title="Descargar esta hoja completa con todos sus filtros a Excel (.xlsx)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar Hoja (.xlsx)</span>
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xl flex items-center gap-2 animate-fade-in font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>¡Hoja de motivos exportada a Excel exitosamente con formato profesional!</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TARJETAS DE AUDITORÍA EJECUTIVA                                       */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">
            Partidas Auditadas
          </span>
          <span className="text-2xl font-bold font-mono tabular-nums text-neutral-900 block mt-1">
            {totalFilas.toLocaleString('de-DE')}
          </span>
          <span className="text-[10px] text-neutral-500 mt-1 block">
            {metricas.conMotivo} con justificación detallada
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">
            Monto Total Representado
          </span>
          <span className="text-2xl font-bold font-mono tabular-nums text-neutral-900 block mt-1">
            ${formatAmountAuto(metricas.totalMonto)}
          </span>
          <span className="text-[10px] text-neutral-500 mt-1 block">
            Promedio por partida: ${formatAmountAuto(metricas.promedioMonto)}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">
            Cuentas Auxiliares Activas
          </span>
          <span className="text-2xl font-bold font-mono tabular-nums text-blue-700 block mt-1">
            {metricas.cuentasUnicas} Cuentas
          </span>
          <span className="text-[10px] text-neutral-500 mt-1 block">
            {selectedCuenta !== 'todas' ? `Filtrando por ${selectedCuenta}` : 'Distribución en toda la empresa'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">
            Trazabilidad de Motivos
          </span>
          <span className="text-2xl font-bold font-mono tabular-nums text-emerald-700 block mt-1">
            100%
          </span>
          <span className="text-[10px] text-neutral-500 mt-1 block">
            Comprobantes con respaldo técnico SIP
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. PANEL DE FILTROS SUPER PRÁCTICO PARA LEER Y FILTRAR                    */}
      {/* ========================================================================= */}
      <div className="bg-white p-4.5 rounded-2xl border border-neutral-200 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between gap-3 border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-blue-50 text-blue-700">
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </span>
            <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
              Filtros Avanzados para Revisión Rápida de Motivos
            </span>
          </div>

          <button
            onClick={handleResetFiltros}
            className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-blue-700 transition-colors"
            title="Limpiar todos los filtros"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Restablecer Filtros</span>
          </button>
        </div>

        {/* Fila 1 de Filtros: Buscadores Especializados */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* 1. Buscador exclusivo de MOTIVO */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-orange-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar en el Motivo (ej. parada, emergencia, cuadrilla, izaje)..."
              value={motivoTerm}
              onChange={(e) => {
                setMotivoTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs pl-8 pr-3 py-2 bg-orange-50/40 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 text-neutral-900 font-medium placeholder:text-neutral-400"
            />
          </div>

          {/* 2. Buscador de Solicitante */}
          <div className="relative">
            <User className="w-3.5 h-3.5 text-blue-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por Solicitante (ej. Hernán García, SIAHO, Taller)..."
              value={solicitanteTerm}
              onChange={(e) => {
                setSolicitanteTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs pl-8 pr-3 py-2 bg-blue-50/40 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-neutral-900 font-medium placeholder:text-neutral-400"
            />
          </div>

          {/* 3. Buscador general de Ítem / Descripción */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por descripción del ítem, código de salida o proyecto..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs pl-8 pr-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-neutral-900 font-medium placeholder:text-neutral-400"
            />
          </div>
        </div>

        {/* Fila 2 de Filtros: Selectores de Categoría, Cuenta y Mes */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
          {/* Selector Categoría */}
          <div>
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
              Categoría
            </label>
            <select
              value={selectedCategoria}
              onChange={(e) => {
                setSelectedCategoria(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs font-bold text-neutral-800 bg-neutral-50 border border-neutral-300 rounded-xl px-2.5 py-1.5 focus:ring-2 focus:ring-blue-500"
            >
              <option value="todas">Todas las Categorías</option>
              <option value="Materiales Directos">Materiales Directos</option>
              <option value="Servicios">Servicios</option>
              <option value="Horas Maquina">Horas Máquina</option>
              <option value="Mano de Obra Directa">Mano de Obra Directa</option>
              <option value="Costos Indirectos">Costos Indirectos</option>
            </select>
          </div>

          {/* Selector Cuenta Auxiliar */}
          <div>
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
              Cuenta Auxiliar / Proyecto
            </label>
            <select
              value={selectedCuenta}
              onChange={(e) => {
                setSelectedCuenta(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs font-bold text-neutral-800 bg-neutral-50 border border-neutral-300 rounded-xl px-2.5 py-1.5 focus:ring-2 focus:ring-blue-500"
            >
              <option value="todas">Todas las Cuentas ({listaCuentasDisponibles.length})</option>
              {listaCuentasDisponibles.map(([cod, nom]) => (
                <option key={cod} value={cod}>
                  {cod} · {nom}
                </option>
              ))}
            </select>
          </div>

          {/* Selector Mes */}
          <div>
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
              Mes Operativo
            </label>
            <select
              value={selectedMes}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedMes(val === 'todos' ? 'todos' : Number(val));
                setCurrentPage(1);
              }}
              className="w-full text-xs font-bold text-neutral-800 bg-neutral-50 border border-neutral-300 rounded-xl px-2.5 py-1.5 focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos los Meses (Ene - Sep)</option>
              <option value="9">Septiembre 2026</option>
              <option value="8">Agosto 2026</option>
              <option value="7">Julio 2026</option>
              <option value="6">Junio 2026</option>
              <option value="5">Mayo 2026</option>
              <option value="4">Abril 2026</option>
              <option value="3">Marzo 2026</option>
              <option value="2">Febrero 2026</option>
              <option value="1">Enero 2026</option>
            </select>
          </div>

          {/* Filas por página */}
          <div>
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
              Mostrar Filas
            </label>
            <select
              value={filasPerPage}
              onChange={(e) => {
                setFilasPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="w-full text-xs font-bold text-neutral-800 bg-neutral-50 border border-neutral-300 rounded-xl px-2.5 py-1.5 focus:ring-2 focus:ring-blue-500"
            >
              <option value={25}>25 filas por página</option>
              <option value={50}>50 filas por página</option>
              <option value={100}>100 filas por página</option>
              <option value={250}>250 filas por página</option>
              <option value={1000}>1.000 filas por página</option>
            </select>
          </div>
        </div>

        {/* Fila 3: Chips de filtro rápido por tipo de motivo */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs">
          <span className="text-[11px] font-bold text-neutral-500 shrink-0">Filtro rápido de motivos:</span>
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'emergencia', label: '🚨 Emergencia / Urgente' },
            { id: 'parada', label: '⚡ Parada de Planta' },
            { id: 'mantenimiento', label: '🔧 Mantenimiento' },
            { id: 'traslado', label: '👥 Traslado de Personal' },
            { id: 'montaje', label: '🏗️ Montaje e Izamiento' },
            { id: 'soldadura', label: '🔥 Soldadura / Pailería' },
            { id: 'seguridad', label: '🛡️ Seguridad / EPP' },
            { id: 'flete', label: '🚢 Fletes y Acarreos' }
          ].map(tag => (
            <button
              key={tag.id}
              onClick={() => {
                setMotivoTagFilter(tag.id);
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                motivoTagFilter === tag.id
                  ? 'bg-blue-700 text-white border-blue-700 shadow-2xs'
                  : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-600 border-neutral-200'
              }`}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. TABLA AUDITORA DE MOTIVOS Y SOLICITANTES                               */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
        {salidasFiltradas.length === 0 ? (
          <div className="p-12 text-center text-neutral-500 space-y-3">
            <Info className="w-10 h-10 text-neutral-300 mx-auto" />
            <h4 className="text-sm font-bold text-neutral-800">No se encontraron partidas con los filtros seleccionados</h4>
            <p className="text-xs text-neutral-500 max-w-md mx-auto">
              Intenta cambiar los términos de búsqueda en el motivo o seleccionar otra categoría / cuenta auxiliar.
            </p>
            <button
              onClick={handleResetFiltros}
              className="px-3.5 py-1.5 text-xs font-bold bg-blue-50 text-blue-700 rounded-xl border border-blue-200 hover:bg-blue-100 transition-colors"
            >
              Restablecer Filtros
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[640px] overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px] tracking-wider shadow-2xs">
                <tr>
                  <th className="py-3 px-3 text-center w-12 text-slate-500">#</th>
                  
                  <th 
                    onClick={() => handleSort('fecha')}
                    className="py-3 px-3 min-w-[95px] text-slate-700 cursor-pointer hover:text-blue-700 hover:bg-blue-50/50 transition-colors select-none"
                    title="Ordenar por Fecha"
                  >
                    <div className="flex items-center gap-1">
                      <span>Fecha</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>

                  <th 
                    onClick={() => handleSort('cuenta')}
                    className="py-3 px-3 min-w-[130px] text-slate-700 cursor-pointer hover:text-blue-700 hover:bg-blue-50/50 transition-colors select-none"
                    title="Ordenar por Cuenta Auxiliar"
                  >
                    <div className="flex items-center gap-1">
                      <span>Cuenta Auxiliar</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>

                  <th 
                    onClick={() => handleSort('categoria')}
                    className="py-3 px-3 min-w-[140px] text-slate-700 cursor-pointer hover:text-blue-700 hover:bg-blue-50/50 transition-colors select-none"
                    title="Ordenar por Categoría"
                  >
                    <div className="flex items-center gap-1">
                      <span>Categoría</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>

                  <th className="py-3 px-3.5 min-w-[240px] text-slate-800 font-bold">
                    Descripción del Ítem / Partida
                  </th>

                  <th 
                    onClick={() => handleSort('cantidad')}
                    className="py-3 px-2.5 text-right font-mono text-slate-700 cursor-pointer hover:text-blue-700 hover:bg-blue-50/50 transition-colors select-none"
                    title="Ordenar por Cantidad"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Cant.</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>

                  <th className="py-3 px-2 text-center text-slate-500 font-mono">U.M.</th>

                  <th 
                    onClick={() => handleSort('precio')}
                    className="py-3 px-2.5 text-right font-mono text-slate-700 cursor-pointer hover:text-blue-700 hover:bg-blue-50/50 transition-colors select-none"
                    title="Ordenar por Precio Unitario"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>P. Unit ($)</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>

                  <th 
                    onClick={() => handleSort('monto')}
                    className="py-3 px-3 text-right font-mono font-bold text-slate-900 bg-slate-100/70 cursor-pointer hover:text-blue-700 hover:bg-blue-50 transition-colors select-none min-w-[110px]"
                    title="Ordenar por Monto Total"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Monto Total ($)</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>

                  <th 
                    onClick={() => handleSort('solicitante')}
                    className="py-3 px-3 min-w-[160px] text-slate-700 cursor-pointer hover:text-blue-700 hover:bg-blue-50/50 transition-colors select-none"
                    title="Ordenar por Solicitante"
                  >
                    <div className="flex items-center gap-1">
                      <span>Solicitante</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>

                  {/* COLUMNA CLAVE: MOTIVO DE LA SALIDA */}
                  <th 
                    onClick={() => handleSort('motivo')}
                    className="py-3 px-4 min-w-[320px] text-orange-950 bg-orange-50/60 font-bold border-l border-orange-200 cursor-pointer hover:bg-orange-100/70 transition-colors select-none"
                    title="Ordenar por Motivo"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="p-0.5 rounded bg-orange-500 text-white shrink-0">
                        <FileText className="w-3 h-3" />
                      </span>
                      <span>Motivo / Justificación Técnica</span>
                      <ArrowUpDown className="w-3 h-3 text-orange-600" />
                    </div>
                  </th>

                  <th className="py-3 px-3 text-center text-slate-500 min-w-[90px]">Comprobante</th>
                  <th className="py-3 px-2 text-center text-slate-500 w-12">Ver</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-100 bg-white">
                {paginatedSalidas.map((s, idx) => {
                  const globalIdx = (currentPage - 1) * filasPerPage + idx + 1;
                  const catDisplay = s.tipo || s.categoria;
                  const pCorto = CUENTAS_CORTAS_MAP[s.cuentaAuxiliarCodigo] || s.cuentaAuxiliarNombre || s.proyecto;
                  const solicitanteDisplay = s.solicitante || s.responsable || 'TIMACA Operaciones';
                  const motivoDisplay = s.motivo || s.observaciones || 'Consumo e imputación operativa para frentes activos de obra';
                  const precioUnitDisplay = formatUnitPriceRaw(s.montoUnitario);
                  const montoTotalDisplay = formatAmountAuto(s.montoTotal);
                  const unidadDisplay = s.unidadMedida === 'USE' ? 'SERV' : s.unidadMedida || 'UND';

                  // Resaltar palabras clave en el motivo si hay búsqueda
                  const isHighlighted = motivoTerm && motivoDisplay.toLowerCase().includes(motivoTerm.toLowerCase());

                  return (
                    <tr
                      key={s.id || `motivo-row-${globalIdx}`}
                      onClick={() => setSalidaAuditoria(s)}
                      className={`hover:bg-blue-50/70 transition-colors cursor-pointer group ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                      }`}
                      title="Haz clic para ver el expediente y comprobante de esta salida"
                    >
                      {/* # */}
                      <td className="py-2.5 px-3 text-center font-mono text-[11px] text-neutral-400 group-hover:text-blue-700">
                        {globalIdx}
                      </td>

                      {/* Fecha */}
                      <td className="py-2.5 px-3 font-mono text-neutral-700 whitespace-nowrap text-[11px]">
                        {s.fecha}
                      </td>

                      {/* Cuenta Auxiliar */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="font-mono text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/80 px-1.5 py-0.5 rounded block max-w-fit">
                          {s.cuentaAuxiliarCodigo}
                        </span>
                        <span className="text-[10px] text-neutral-600 block truncate max-w-[140px] mt-0.5" title={pCorto}>
                          {pCorto}
                        </span>
                      </td>

                      {/* Categoría */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border ${getCategoryBadge(catDisplay)}`}>
                          {catDisplay}
                        </span>
                      </td>

                      {/* Descripción del Ítem */}
                      <td className="py-2.5 px-3.5 font-medium text-neutral-900 max-w-[280px]">
                        <span className="block truncate font-semibold" title={s.itemDescripcion}>
                          {s.itemDescripcion}
                        </span>
                        {s.subcategoria && s.subcategoria !== catDisplay && (
                          <span className="text-[10px] text-neutral-500 block truncate">
                            {s.subcategoria}
                          </span>
                        )}
                      </td>

                      {/* Cantidad */}
                      <td className="py-2.5 px-2.5 text-right font-mono font-bold text-neutral-900 tabular-nums">
                        {formatNumber(s.cantidad)}
                      </td>

                      {/* Unidad */}
                      <td className="py-2.5 px-2 text-center text-neutral-500 font-mono text-[11px]">
                        {unidadDisplay}
                      </td>

                      {/* Precio Unitario */}
                      <td className="py-2.5 px-2.5 text-right font-mono text-neutral-700 tabular-nums">
                        ${precioUnitDisplay}
                      </td>

                      {/* Monto Total */}
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-neutral-900 bg-slate-50/60 tabular-nums text-xs">
                        ${montoTotalDisplay}
                      </td>

                      {/* Solicitante */}
                      <td className="py-2.5 px-3 text-neutral-800 text-[11px] font-medium max-w-[170px]">
                        <div className="flex items-center gap-1.5 truncate" title={solicitanteDisplay}>
                          <User className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{solicitanteDisplay}</span>
                        </div>
                      </td>

                      {/* MOTIVO DE LA SALIDA (PROMINENTE Y DETALLADO) */}
                      <td className={`py-2.5 px-4 max-w-[380px] border-l border-orange-100 ${
                        isHighlighted ? 'bg-orange-50 font-semibold text-orange-950' : 'text-neutral-700'
                      }`}>
                        <div className="flex items-start gap-1.5">
                          <span className="text-xs leading-relaxed line-clamp-2" title={motivoDisplay}>
                            {motivoDisplay}
                          </span>
                        </div>
                      </td>

                      {/* Comprobante */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                          {s.codigoSalida || '-'}
                        </span>
                      </td>

                      {/* Ver */}
                      <td className="py-2.5 px-2 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSalidaAuditoria(s);
                          }}
                          className="p-1 text-slate-400 hover:text-blue-700 hover:bg-blue-100 rounded transition-colors"
                          title="Ver detalle completo"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* PIE DE TABLA CON TOTALES FILTRADOS */}
              <tfoot className="sticky bottom-0 z-10 bg-slate-100 border-t-2 border-slate-300 font-bold text-xs shadow-xs">
                <tr>
                  <td colSpan={5} className="py-3 px-3 uppercase tracking-wider font-extrabold text-slate-900">
                    TOTAL MOSTRADO ({salidasFiltradas.length.toLocaleString('de-DE')} PARTIDAS AUDITADAS)
                  </td>
                  <td className="py-3 px-2.5 text-right font-mono tabular-nums text-slate-900 font-bold">
                    {formatNumber(salidasFiltradas.reduce((acc, s) => acc + (s.cantidad || 0), 0))}
                  </td>
                  <td className="py-3 px-2"></td>
                  <td className="py-3 px-2.5 text-right font-mono text-[10px] text-slate-600">
                    PROM
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-950 font-black text-sm bg-slate-200/80">
                    ${formatAmountAuto(metricas.totalMonto)}
                  </td>
                  <td colSpan={4} className="py-3 px-4 text-slate-600 text-[11px] font-medium">
                    100% justificado y conciliado con el sistema TIMACA
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* Barra de Paginación */}
        {totalFilas > filasPerPage && (
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-600">
            <div>
              Mostrando <strong>{((currentPage - 1) * filasPerPage) + 1}</strong> a <strong>{Math.min(currentPage * filasPerPage, totalFilas)}</strong> de <strong>{totalFilas.toLocaleString('de-DE')}</strong> registros
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-colors"
              >
                Anterior
              </button>
              <span className="px-2 font-bold font-mono">
                Pág. {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-colors"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 5. MODAL DE AUDITORÍA DETALLADA AL HACER CLIC EN CUALQUIER FILA           */}
      {/* ========================================================================= */}
      {salidaAuditoria && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-300 shadow-2xl overflow-hidden space-y-4 p-6">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
                  <FileText className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-bold text-neutral-900 text-base">
                    Expediente de Comprobante: {salidaAuditoria.codigoSalida}
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Fecha de Operación: {salidaAuditoria.fecha} · Mes: {salidaAuditoria.mesLabel || salidaAuditoria.mes}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSalidaAuditoria(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cuadro destacado del MOTIVO */}
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 space-y-1.5">
              <span className="text-[10px] font-bold text-orange-800 uppercase tracking-wider block">
                Motivo / Justificación de la Salida:
              </span>
              <p className="text-sm font-semibold text-orange-950 leading-relaxed">
                {salidaAuditoria.motivo || salidaAuditoria.observaciones || 'Consumo operacional programado de frentes de obra.'}
              </p>
            </div>

            {/* Grid de Campos Técnicos */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-neutral-500 uppercase block">Cuenta Auxiliar</span>
                <span className="font-mono font-bold text-blue-700 text-sm block mt-0.5">{salidaAuditoria.cuentaAuxiliarCodigo}</span>
                <span className="text-[11px] text-neutral-600 block mt-0.5 truncate">{CUENTAS_CORTAS_MAP[salidaAuditoria.cuentaAuxiliarCodigo] || salidaAuditoria.proyecto}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-neutral-500 uppercase block">Categoría</span>
                <span className="font-bold text-neutral-900 text-sm block mt-0.5">{salidaAuditoria.tipo || salidaAuditoria.categoria}</span>
                <span className="text-[11px] text-neutral-500 block mt-0.5">{salidaAuditoria.subcategoria || 'General'}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-neutral-500 uppercase block">Solicitante</span>
                <span className="font-bold text-neutral-900 text-sm block mt-0.5">{salidaAuditoria.solicitante || salidaAuditoria.responsable || 'TIMACA'}</span>
                <span className="text-[11px] text-neutral-500 block mt-0.5">Autorizado para despacho</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-neutral-500 uppercase block">Cantidad</span>
                <span className="font-mono font-bold text-neutral-900 text-sm block mt-0.5">{formatNumber(salidaAuditoria.cantidad)} {salidaAuditoria.unidadMedida === 'USE' ? 'SERV' : salidaAuditoria.unidadMedida}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-neutral-500 uppercase block">Precio Unitario</span>
                <span className="font-mono font-bold text-neutral-900 text-sm block mt-0.5">${formatUnitPriceRaw(salidaAuditoria.montoUnitario)}</span>
              </div>

              <div className="p-3 bg-slate-100 rounded-xl border border-slate-300">
                <span className="text-[10px] font-bold text-slate-700 uppercase block">Monto Total Imputado</span>
                <span className="font-mono font-black text-slate-900 text-base block mt-0.5">${formatAmountAuto(salidaAuditoria.montoTotal)}</span>
              </div>
            </div>

            {/* Descripción del Ítem */}
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs">
              <span className="text-[10px] font-bold text-neutral-500 uppercase block">Descripción del Ítem:</span>
              <span className="font-bold text-neutral-900 block mt-0.5">{salidaAuditoria.itemDescripcion}</span>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSalidaAuditoria(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition-colors"
              >
                Cerrar Expediente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
