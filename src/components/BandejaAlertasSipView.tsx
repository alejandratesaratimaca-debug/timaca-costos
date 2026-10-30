import React, { useState, useMemo } from 'react';
import { 
  AlertTriangle, 
  Search, 
  Download, 
  CheckCircle2, 
  Clock, 
  X, 
  Check, 
  Filter,
  Layers,
  ArrowRightLeft,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Info,
  Boxes,
  FileSpreadsheet
} from 'lucide-react';
import { ALERTAS_MONTHLY_KPIS, ALERTAS_SIP_RECORDS, AlertaItem } from '../data/alertasSipData';
import { ALERTAS_MATERIALES_CONSOLIDADOS, MaterialConsolidadoItem } from '../data/alertasMaterialesData';
import * as XLSX from 'xlsx';

export const BandejaAlertasSipView: React.FC = () => {
  const [viewMode, setViewMode] = useState<'MATERIALES' | 'TRANSACCIONES'>('MATERIALES');
  const [records, setRecords] = useState<AlertaItem[]>(ALERTAS_SIP_RECORDS);
  const [materials, setMaterials] = useState<MaterialConsolidadoItem[]>(ALERTAS_MATERIALES_CONSOLIDADOS);
  const [selectedMonth, setSelectedMonth] = useState<string>('TODOS');
  const [selectedAlertType, setSelectedAlertType] = useState<string>('TODAS');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 25;

  // Modal de decisión por transacción
  const [modalItem, setModalItem] = useState<AlertaItem | null>(null);
  // Modal de decisión masiva por material (para compras)
  const [modalMaterial, setModalMaterial] = useState<MaterialConsolidadoItem | null>(null);
  const [decisionType, setDecisionType] = useState<'MANTENER_SIP' | 'APROBAR_OC' | 'MANUAL'>('MANTENER_SIP');
  const [manualPrice, setManualPrice] = useState<string>('');

  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre'];

  // KPIs calculados
  const kpiStats = useMemo(() => {
    let totalCasos = 0;
    let umConflicts = 0;
    let desfasePrecio = 0;
    let sinOC = 0;
    let impactoUSD = 0;

    if (selectedMonth === 'TODOS') {
      Object.values(ALERTAS_MONTHLY_KPIS).forEach(k => {
        totalCasos += k.total_casos;
        umConflicts += k.um_conflicts;
        desfasePrecio += k.desfase_precio;
        sinOC += k.sin_oc;
        impactoUSD += k.impacto_total_usd;
      });
    } else if (ALERTAS_MONTHLY_KPIS[selectedMonth]) {
      const k = ALERTAS_MONTHLY_KPIS[selectedMonth];
      totalCasos = k.total_casos;
      umConflicts = k.um_conflicts;
      desfasePrecio = k.desfase_precio;
      sinOC = k.sin_oc;
      impactoUSD = k.impacto_total_usd;
    }

    return { totalCasos, umConflicts, desfasePrecio, sinOC, impactoUSD };
  }, [selectedMonth]);

  // Filtrado de registros por transacción
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      if (selectedMonth !== 'TODOS' && r.mes !== selectedMonth) return false;
      if (selectedAlertType === 'UM' && r.categoria_alerta !== 'UM') return false;
      if (selectedAlertType === 'PRECIO' && r.categoria_alerta !== 'PRECIO') return false;
      if (selectedAlertType === 'SIN_OC' && r.categoria_alerta !== 'SIN_OC') return false;

      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const haystack = `${r.dp} ${r.pa} ${r.oc} ${r.codigo} ${r.descripcion} ${r.proveedor} ${r.proyecto}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
  }, [records, selectedMonth, selectedAlertType, searchTerm]);

  // Filtrado de materiales consolidados (para compras) con totales acordes al mes seleccionado
  const filteredMaterials = useMemo(() => {
    return materials
      .filter(m => {
        if (selectedMonth !== 'TODOS' && !m.meses.includes(selectedMonth)) return false;
        if (selectedAlertType === 'UM' && m.categoria_alerta !== 'UM') return false;
        if (selectedAlertType === 'PRECIO' && m.categoria_alerta !== 'PRECIO') return false;
        if (selectedAlertType === 'SIN_OC' && m.categoria_alerta !== 'SIN_OC') return false;

        if (searchTerm.trim()) {
          const query = searchTerm.toLowerCase();
          const haystack = `${m.codigo} ${m.descripcion} ${m.proveedor} ${m.ultima_oc}`.toLowerCase();
          if (!haystack.includes(query)) return false;
        }
        return true;
      })
      .map(m => {
        if (selectedMonth !== 'TODOS') {
          const dps = (m.dps_por_mes && m.dps_por_mes[selectedMonth] !== undefined) ? m.dps_por_mes[selectedMonth] : m.total_dps;
          const cant = (m.cant_por_mes && m.cant_por_mes[selectedMonth] !== undefined) ? m.cant_por_mes[selectedMonth] : m.total_cant;
          const impacto = (m.impacto_por_mes && m.impacto_por_mes[selectedMonth] !== undefined) ? m.impacto_por_mes[selectedMonth] : m.impacto_total_usd;
          return {
            ...m,
            total_dps: dps,
            total_cant: cant,
            impacto_total_usd: impacto
          };
        }
        return m;
      });
  }, [materials, selectedMonth, selectedAlertType, searchTerm]);

  // Paginación dinámica según el modo de vista
  const totalPages = viewMode === 'MATERIALES'
    ? Math.ceil(filteredMaterials.length / pageSize) || 1
    : Math.ceil(filteredRecords.length / pageSize) || 1;

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage]);

  const paginatedMaterials = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredMaterials.slice(start, start + pageSize);
  }, [filteredMaterials, currentPage]);

  const handleOpenModal = (item: AlertaItem) => {
    setModalItem(item);
    setDecisionType('MANTENER_SIP');
    setManualPrice(item.precio_oc > 0 ? item.precio_oc.toFixed(2) : item.precio_sip.toFixed(2));
  };

  const handleOpenMaterialModal = (m: MaterialConsolidadoItem) => {
    setModalMaterial(m);
    setDecisionType('MANTENER_SIP');
    setManualPrice(m.precio_oc > 0 ? m.precio_oc.toFixed(2) : m.precio_sip.toFixed(2));
  };

  const handleSaveDecision = () => {
    if (!modalItem) return;

    setRecords(prev => prev.map(r => {
      if (r.id === modalItem.id) {
        if (decisionType === 'MANTENER_SIP') {
          return { ...r, estatus: 'APROBADO (Precio SIP)' };
        } else if (decisionType === 'APROBAR_OC') {
          return { ...r, precio_sip: r.precio_oc, var_pct: 0, estatus: 'APROBADO (Precio OC)' };
        } else if (decisionType === 'MANUAL') {
          const val = parseFloat(manualPrice) || r.precio_sip;
          return { ...r, precio_sip: val, estatus: `APROBADO (Manual $${val.toFixed(2)})` };
        }
      }
      return r;
    }));

    setModalItem(null);
  };

  const handleSaveMaterialDecision = () => {
    if (!modalMaterial) return;

    let newPrice = modalMaterial.precio_sip;
    let newStatus = 'APROBADO (Precio SIP)';

    if (decisionType === 'MANTENER_SIP') {
      newPrice = modalMaterial.precio_sip;
      newStatus = 'APROBADO (Precio SIP)';
    } else if (decisionType === 'APROBAR_OC') {
      newPrice = modalMaterial.precio_oc;
      newStatus = 'APROBADO (Precio OC)';
    } else if (decisionType === 'MANUAL') {
      newPrice = parseFloat(manualPrice) || modalMaterial.precio_sip;
      newStatus = `VALIDADO CON COMPRAS ($${newPrice.toFixed(2)})`;
    }

    // Actualizar material consolidado
    setMaterials(prev => prev.map(m => {
      if (m.codigo === modalMaterial.codigo) {
        return {
          ...m,
          precio_sip: newPrice,
          var_pct: m.precio_oc > 0 ? ((newPrice - m.precio_oc) / m.precio_oc) * 100 : 0,
          impacto_total_usd: (newPrice - m.precio_oc) * m.total_cant,
          estatus: newStatus
        };
      }
      return m;
    }));

    // Actualizar todas las transacciones vinculadas a ese material
    setRecords(prev => prev.map(r => {
      if (r.codigo === modalMaterial.codigo) {
        return {
          ...r,
          precio_sip: newPrice,
          var_pct: r.precio_oc > 0 ? ((newPrice - r.precio_oc) / r.precio_oc) * 100 : 0,
          impacto_usd: (newPrice - r.precio_oc) * r.cant,
          estatus: newStatus
        };
      }
      return r;
    }));

    setModalMaterial(null);
  };

  const handleExportExcel = () => {
    if (viewMode === 'MATERIALES') {
      const wsData = filteredMaterials.map(m => ({
        'Código': m.codigo,
        'Descripción del Material': m.descripcion,
        'Categoría Alerta': m.categoria_alerta,
        'N° DPs Afectadas': m.total_dps,
        'Cantidad Total Despachada': m.total_cant,
        'UM Salida': m.um_salida,
        'UM Compra': m.um_compra,
        'Precio Almacén SIP ($)': m.precio_sip,
        'Precio OC ($)': m.precio_oc,
        'Última OC': m.ultima_oc,
        'Proveedor': m.proveedor,
        'Impacto Financiero Total ($)': m.impacto_total_usd,
        'PRECIO ACORDADO CON COMPRAS ($)': '',
        'OBSERVACIONES': ''
      }));

      const ws = XLSX.utils.json_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Matriz_Precios_Compras');
      XLSX.writeFile(wb, `TIMACA_Matriz_Precios_Compras_${selectedMonth}_2026.xlsx`);
    } else {
      const wsData = filteredRecords.map(r => ({
        'N° DP': r.dp,
        'N° PA': r.pa,
        'Fecha': r.fecha,
        'Mes': r.mes,
        'Proyecto': r.proyecto,
        'Código': r.codigo,
        'Descripción': r.descripcion,
        'N° OC': r.oc,
        'Proveedor': r.proveedor,
        'UM Salida': r.um_salida,
        'UM Compra': r.um_compra,
        'Cantidad': r.cant,
        'Precio DP (SIP)': r.precio_sip,
        'Precio OC': r.precio_oc,
        'Variación (%)': `${r.var_pct}%`,
        'Impacto USD': r.impacto_usd,
        'Tipo de Alerta': r.tipo_alerta,
        'Estado de Decisión': r.estatus
      }));

      const ws = XLSX.utils.json_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, `Alertas_${selectedMonth}`);
      XLSX.writeFile(wb, `TIMACA_Alertas_SIP_${selectedMonth}_2026.xlsx`);
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 rounded-2xl shadow-md border border-blue-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider bg-red-500/30 text-red-200 px-2.5 py-0.5 rounded-full border border-red-400/40 flex items-center gap-1.5">
                <AlertTriangle className="w-3 h-3 text-red-300" />
                Módulo de Control y Validación en Vivo
              </span>
              <span className="text-xs text-blue-200">Corte Operativo 2026 (Enero a Octubre)</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight">Bandeja de Alertas SIP: PA vs. DP vs. OC</h2>
            <p className="text-xs text-blue-200 mt-0.5">
              Detección de inconsistencias de Unidad de Medida (UM) y Precios de Despacho antes del Cierre Contable
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/15 text-right">
            <div className="text-[10px] uppercase text-blue-200 font-bold tracking-wider">Criterio Activo</div>
            <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5 justify-end mt-0.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              Opción 1: Preservar Precio SIP
            </div>
          </div>
        </div>
      </div>

      {/* SELECTOR DE MESES (ENERO A OCTUBRE) */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-blue-700" />
              Filtro de Mes de Operación
            </span>
            <span className="text-xs font-semibold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
              {selectedMonth === 'TODOS' ? 'Todos los Meses (Ene - Oct)' : `Mes Seleccionado: ${selectedMonth}`}
            </span>
          </div>
          <span className="text-xs text-slate-400 italic">Haz clic en un mes para filtrar instantáneamente</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => { setSelectedMonth('TODOS'); setCurrentPage(1); }}
            className={`px-3 py-1.5 text-xs rounded-lg font-semibold border transition-all ${
              selectedMonth === 'TODOS'
                ? 'bg-blue-800 text-white border-blue-900 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Todos los Meses (Ene-Oct)
          </button>
          {months.map(m => (
            <button
              key={m}
              onClick={() => { setSelectedMonth(m); setCurrentPage(1); }}
              className={`px-3 py-1.5 text-xs rounded-lg font-semibold border transition-all ${
                selectedMonth === m
                  ? 'bg-blue-800 text-white border-blue-900 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* KPI CARDS (FILTROS RÁPIDOS INTERACTIVOS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* TOTAL */}
        <div 
          onClick={() => { setSelectedAlertType('TODAS'); setCurrentPage(1); }}
          className={`bg-white p-3.5 rounded-xl border transition-all cursor-pointer shadow-xs hover:shadow-md ${
            selectedAlertType === 'TODAS' ? 'ring-2 ring-slate-800 border-slate-800' : 'border-slate-200'
          }`}
        >
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total en Revisión</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{kpiStats.totalCasos.toLocaleString('es-ES')}</div>
          <div className="text-[11px] text-amber-700 font-bold mt-1 flex items-center gap-1.5 truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
            Pendiente Corrección/Aprobación
          </div>
        </div>

        {/* 1. FACTOR / UNIDAD */}
        <div 
          onClick={() => { setSelectedAlertType('UM'); setCurrentPage(1); }}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer shadow-xs hover:shadow-md bg-red-50/30 ${
            selectedAlertType === 'UM' ? 'ring-2 ring-red-600 border-red-500' : 'border-red-200'
          }`}
        >
          <div className="text-[11px] font-semibold text-red-700 uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
            1. Factor / Unidad
          </div>
          <div className="text-2xl font-bold text-red-700 mt-1">{kpiStats.umConflicts.toLocaleString('es-ES')}</div>
          <div className="text-[11px] text-red-600 mt-1 truncate" title="Planchas vs Kg · Barras vs M">
            Planchas vs Kg · Barras vs M
          </div>
        </div>

        {/* 2. DESFASES COMERCIALES */}
        <div 
          onClick={() => { setSelectedAlertType('PRECIO'); setCurrentPage(1); }}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer shadow-xs hover:shadow-md bg-amber-50/30 ${
            selectedAlertType === 'PRECIO' ? 'ring-2 ring-amber-600 border-amber-500' : 'border-amber-200'
          }`}
        >
          <div className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider truncate">
            2. Desfase Comercial
          </div>
          <div className="text-2xl font-bold text-amber-900 mt-1">{kpiStats.desfasePrecio.toLocaleString('es-ES')}</div>
          <div className="text-[11px] text-amber-700 mt-1 truncate" title="Grava, Pinturas, Insumos">
            5% - 200% (Grava, Insumos)
          </div>
        </div>

        {/* 3. STOCK ALMACÉN / SIN OC DIRECTA */}
        <div 
          onClick={() => { setSelectedAlertType('SIN_OC'); setCurrentPage(1); }}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer shadow-xs hover:shadow-md bg-indigo-50/30 ${
            selectedAlertType === 'SIN_OC' ? 'ring-2 ring-indigo-600 border-indigo-500' : 'border-indigo-200'
          }`}
        >
          <div className="text-[11px] font-semibold text-indigo-700 uppercase tracking-wider flex items-center gap-1">
            <Boxes className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            3. Stock Almacén / Inv. Previo
          </div>
          <div className="text-2xl font-bold text-indigo-800 mt-1">{kpiStats.sinOC.toLocaleString('es-ES')}</div>
          <div className="text-[11px] text-indigo-600 mt-1 truncate" title="Consumos de inventario existente sin OC directa en 2026">
            Salidas de existencias en almacén
          </div>
        </div>

        {/* IMPACTO FINANCIERO */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Impacto Financiero</div>
          <div className="text-xl font-bold text-slate-900 mt-1.5 truncate">
            ${Math.abs(kpiStats.impactoUSD).toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} USD
          </div>
          <div className="text-[11px] text-slate-500 mt-1 truncate" title="Brecha acumulada entre SIP y OC">
            Brecha total SIP vs OC
          </div>
        </div>
      </div>

      {/* SELECTOR DE MODO DE VISTA: POR MATERIAL (PARA COMPRAS) vs POR TRANSACCIÓN */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-100 p-2 rounded-xl border border-slate-200">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => { setViewMode('MATERIALES'); setCurrentPage(1); }}
            className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
              viewMode === 'MATERIALES'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-300'
            }`}
          >
            <Boxes className="w-4 h-4 text-amber-300" />
            Matriz Consolidada por Material ({filteredMaterials.length.toLocaleString('es-ES')} Materiales - Para Compras)
          </button>
          <button
            onClick={() => { setViewMode('TRANSACCIONES'); setCurrentPage(1); }}
            className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
              viewMode === 'TRANSACCIONES'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-300'
            }`}
          >
            <Layers className="w-4 h-4 text-blue-400" />
            Detalle por Transacción ({filteredRecords.length.toLocaleString('es-ES')} DPs)
          </button>
        </div>

        <a
          href="/TIMACA_Matriz_Precios_Para_Compras_2026.xlsx"
          download="TIMACA_Matriz_Precios_Para_Compras_2026.xlsx"
          className="w-full sm:w-auto text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-3.5 py-2 rounded-lg flex items-center justify-center gap-1.5 transition shadow-xs whitespace-nowrap"
          title="Descarga la planilla Excel condensada de 5.111 materiales con columnas resaltadas en verde para llevar a Compras"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-200" />
          Descargar Matriz Excel para Compras (.xlsx)
        </a>
      </div>

      {/* CONTROLES Y BUSCADOR */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            placeholder={viewMode === 'MATERIALES' ? "Buscar por Código, Descripción, Proveedor u OC..." : "Buscar por DP, PA, OC, Código, Proveedor o Material..."}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Tipo Alerta:</span>
          <select
            value={selectedAlertType}
            onChange={(e) => { setSelectedAlertType(e.target.value); setCurrentPage(1); }}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="TODAS">Todas las Alertas ({kpiStats.totalCasos.toLocaleString('es-ES')})</option>
            <option value="UM">🚨 1. Errores de Unidad / Factor ({kpiStats.umConflicts.toLocaleString('es-ES')} casos - Planchas, Perfiles)</option>
            <option value="PRECIO">⚠️ 2. Desfases Comerciales 5%-200% ({kpiStats.desfasePrecio.toLocaleString('es-ES')} casos - Grava, Insumos)</option>
            <option value="SIN_OC">📦 3. Stock Almacén / Inv. Previo ({kpiStats.sinOC.toLocaleString('es-ES')} casos)</option>
          </select>

          <button
            onClick={handleExportExcel}
            className="text-xs bg-blue-900 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-800 transition flex items-center gap-1.5 whitespace-nowrap shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            {viewMode === 'MATERIALES' ? 'Exportar Vista Materiales' : 'Exportar Vista DPs'}
          </button>
        </div>
      </div>

      {/* TABLA DE ALERTAS */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              {viewMode === 'MATERIALES' ? (
                <>
                  <Boxes className="w-4 h-4 text-blue-700" />
                  Materiales Consolidados para Conciliar con Compras
                </>
              ) : (
                <>
                  <Layers className="w-4 h-4 text-blue-700" />
                  Transacciones Retenidas para Validación
                </>
              )}
            </h3>
            <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full text-[11px]">
              {viewMode === 'MATERIALES'
                ? `${filteredMaterials.length.toLocaleString('es-ES')} materiales en vista`
                : `${filteredRecords.length.toLocaleString('es-ES')} transacciones en vista`
              }
            </span>
          </div>
          <span className="text-xs text-slate-500 italic">
            {viewMode === 'MATERIALES'
              ? 'Haz clic en "Definir Precio" para aplicar la corrección a todas las DPs de ese material'
              : 'Haz clic en "Decidir" para registrar tu validación de precio individual'
            }
          </span>
        </div>

        <div className="overflow-x-auto max-h-[550px]">
          {viewMode === 'MATERIALES' ? (
            /* TABLA CONSOLIDADA POR MATERIAL (IDEAL PARA COMPRAS) */
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] sticky top-0 border-b border-slate-200 z-10 shadow-xs">
                <tr>
                  <th className="py-3 px-3.5">Código & Material</th>
                  <th className="py-3 px-3.5">Categoría Alerta</th>
                  <th className="py-3 px-3.5 text-center">Transacciones (DPs)</th>
                  <th className="py-3 px-3.5 text-right">Cant. Total Despachada</th>
                  <th className="py-3 px-3.5 text-center">UM Salida vs Compra</th>
                  <th className="py-3 px-3.5 text-right">Precio Almacén (SIP)</th>
                  <th className="py-3 px-3.5 text-right">Precio OC</th>
                  <th className="py-3 px-3.5 text-center">Variación</th>
                  <th className="py-3 px-3.5 text-right">Impacto Total ($)</th>
                  <th className="py-3 px-3.5">Última OC & Prov.</th>
                  <th className="py-3 px-3.5 text-center">Estado</th>
                  <th className="py-3 px-3.5 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedMaterials.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="text-center py-10 text-slate-400 font-medium">
                      No se encontraron materiales con los filtros seleccionados
                    </td>
                  </tr>
                ) : (
                  paginatedMaterials.map(m => {
                    const isUmConflict = m.categoria_alerta === 'UM';
                    const isAprobado = m.estatus.includes('VALIDADO') || m.estatus.includes('APROBADO');

                    return (
                      <tr key={m.codigo} className="hover:bg-blue-50/40 transition">
                        <td className="py-2.5 px-3.5">
                          <div className="font-bold text-blue-950 font-mono">{m.codigo}</div>
                          <div className="text-[11px] text-slate-600 max-w-sm truncate" title={m.descripcion}>
                            {m.descripcion}
                          </div>
                        </td>
                        <td className="py-2.5 px-3.5 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            isUmConflict 
                              ? 'bg-red-100 text-red-800 border border-red-300' 
                              : m.categoria_alerta === 'SIN_OC'
                              ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}>
                            {m.tipo_alerta}
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5 text-center whitespace-nowrap">
                          <span className="bg-slate-200 text-slate-800 font-bold px-2 py-0.5 rounded-full text-[11px]">
                            {m.total_dps.toLocaleString('es-ES')} DPs
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5 text-right font-medium text-slate-800 whitespace-nowrap">
                          {m.total_cant.toLocaleString('es-ES')} <span className="text-[11px] text-slate-500 font-mono">{m.um_salida}</span>
                        </td>
                        <td className="py-2.5 px-3.5 text-center whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[11px] ${
                            isUmConflict 
                              ? 'bg-red-50 text-red-700 font-bold border border-red-200' 
                              : 'text-slate-600 font-medium'
                          }`}>
                            {m.um_salida || 'N/D'} vs {m.um_compra || 'N/D'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5 text-right font-bold text-slate-900 whitespace-nowrap">
                          ${m.precio_sip.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                          {m.categoria_alerta === 'SIN_OC' ? (
                            <div>
                              <span className="font-bold text-slate-700">${m.precio_sip.toFixed(2)}</span>
                              <span className="ml-1 text-[10px] text-indigo-700 bg-indigo-50 px-1 py-0.5 rounded font-medium">Stock</span>
                            </div>
                          ) : (
                            <span className="font-bold text-blue-700">${m.precio_oc.toFixed(2)}</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3.5 text-center whitespace-nowrap">
                          {m.categoria_alerta === 'SIN_OC' ? (
                            <span className="font-semibold text-slate-500 text-[11px] bg-slate-100 px-2 py-0.5 rounded">
                              Costo Base
                            </span>
                          ) : (
                            <span className={`font-bold text-xs ${m.var_pct < 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                              {m.var_pct > 0 ? '+' : ''}{m.var_pct}%
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3.5 text-right font-bold text-slate-900 whitespace-nowrap">
                          ${Math.abs(m.impacto_total_usd).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3.5 whitespace-nowrap">
                          {m.categoria_alerta === 'SIN_OC' ? (
                            <div>
                              <span className="font-semibold text-indigo-900 text-[11px] bg-indigo-50 px-1.5 py-0.5 rounded">
                                📦 Stock Almacén
                              </span>
                              <div className="text-[10px] text-slate-500 mt-0.5">
                                Inv. Previo (Sin OC 2026)
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="font-bold text-slate-800">{m.ultima_oc}</div>
                              <div className="text-[11px] text-slate-500 max-w-[130px] truncate" title={m.proveedor}>
                                {m.proveedor}
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 px-3.5 text-center whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-tight inline-block ${
                            isAprobado 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                              : 'bg-amber-50 text-amber-800 border border-amber-300'
                          }`}>
                            {m.estatus}
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5 text-center whitespace-nowrap">
                          <button
                            onClick={() => handleOpenMaterialModal(m)}
                            className="px-3 py-1 text-xs font-bold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 rounded-md transition shadow-2xs whitespace-nowrap"
                          >
                            Definir Precio
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          ) : (
            /* TABLA DETALLADA POR TRANSACCIÓN */
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] sticky top-0 border-b border-slate-200 z-10 shadow-xs">
                <tr>
                  <th className="py-3 px-3.5">N° DP / PA</th>
                  <th className="py-3 px-3.5">Fecha</th>
                  <th className="py-3 px-3.5">Proyecto</th>
                  <th className="py-3 px-3.5">Material</th>
                  <th className="py-3 px-3.5">N° OC / Prov.</th>
                  <th className="py-3 px-3.5 text-center">UM Salida vs OC</th>
                  <th className="py-3 px-3.5 text-right">Cant.</th>
                  <th className="py-3 px-3.5 text-right">Precio DP (SIP)</th>
                  <th className="py-3 px-3.5 text-right">Precio OC</th>
                  <th className="py-3 px-3.5 text-center">Variación</th>
                  <th className="py-3 px-3.5">Alerta</th>
                  <th className="py-3 px-3.5 text-center">Estado Decisión</th>
                  <th className="py-3 px-3.5 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="text-center py-10 text-slate-400 font-medium">
                      No se encontraron transacciones con los filtros seleccionados
                    </td>
                  </tr>
                ) : (
                  paginatedData.map(r => {
                    const isUmConflict = r.categoria_alerta === 'UM';
                    const isAprobado = r.estatus.includes('APROBADO') || r.estatus.includes('VALIDADO');

                    return (
                      <tr key={r.id} className="hover:bg-blue-50/40 transition">
                        <td className="py-2.5 px-3.5 whitespace-nowrap">
                          <div className="font-bold text-blue-950">{r.dp}</div>
                          <div className="text-[11px] text-slate-500 font-mono">PA: {r.pa}</div>
                        </td>
                        <td className="py-2.5 px-3.5 whitespace-nowrap text-slate-600">{r.fecha}</td>
                        <td className="py-2.5 px-3.5 whitespace-nowrap font-medium text-slate-700">{r.proyecto}</td>
                        <td className="py-2.5 px-3.5">
                          <div className="font-bold text-slate-900">{r.codigo}</div>
                          <div className="text-[11px] text-slate-500 max-w-xs truncate" title={r.descripcion}>
                            {r.descripcion}
                          </div>
                        </td>
                        <td className="py-2.5 px-3.5 whitespace-nowrap">
                          <div className="font-bold text-slate-800">{r.oc}</div>
                          <div className="text-[11px] text-slate-500 max-w-[130px] truncate" title={r.proveedor}>
                            {r.proveedor}
                          </div>
                        </td>
                        <td className="py-2.5 px-3.5 text-center whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[11px] ${
                            isUmConflict 
                              ? 'bg-red-50 text-red-700 font-bold border border-red-200' 
                              : 'text-slate-600 font-medium'
                          }`}>
                            {r.um_salida || 'N/D'} vs {r.um_compra || 'N/D'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5 text-right font-medium text-slate-800">
                          {r.cant.toLocaleString('es-ES')}
                        </td>
                        <td className="py-2.5 px-3.5 text-right font-bold text-slate-900">
                          ${r.precio_sip.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                          {r.categoria_alerta === 'SIN_OC' ? (
                            <span className="font-bold text-slate-700">${r.precio_oc.toFixed(2)} <span className="text-[10px] text-indigo-700 bg-indigo-50 px-1 py-0.5 rounded font-medium">Stock</span></span>
                          ) : (
                            <span className="font-bold text-blue-700">${r.precio_oc.toFixed(2)}</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3.5 text-center whitespace-nowrap">
                          {r.categoria_alerta === 'SIN_OC' ? (
                            <span className="font-semibold text-slate-500 text-[11px] bg-slate-100 px-1.5 py-0.5 rounded">Costo Base</span>
                          ) : (
                            <>
                              <span className={`font-bold text-xs ${r.var_pct < 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                                {r.var_pct > 0 ? '+' : ''}{r.var_pct}%
                              </span>
                              <div className="text-[10px] text-slate-400">
                                (${Math.abs(r.impacto_usd).toLocaleString('es-ES', { maximumFractionDigits: 0 })})
                              </div>
                            </>
                          )}
                        </td>
                        <td className="py-2.5 px-3.5 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            isUmConflict 
                              ? 'bg-red-100 text-red-800 border border-red-300' 
                              : r.categoria_alerta === 'SIN_OC'
                              ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}>
                            {r.tipo_alerta}
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5 text-center whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-tight inline-block ${
                            isAprobado 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                              : 'bg-amber-50 text-amber-800 border border-amber-300'
                          }`}>
                            {r.estatus}
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5 text-center whitespace-nowrap">
                          <button
                            onClick={() => handleOpenModal(r)}
                            className="px-3 py-1 text-xs font-bold text-blue-900 bg-blue-100 hover:bg-blue-200 rounded-md transition shadow-2xs"
                          >
                            Decidir
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Paginación */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
          <span>
            Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong> ({viewMode === 'MATERIALES' ? filteredMaterials.length.toLocaleString('es-ES') + ' materiales' : filteredRecords.length.toLocaleString('es-ES') + ' transacciones'})
          </span>
          <div className="flex gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-white border border-slate-300 rounded hover:bg-slate-100 font-medium disabled:opacity-50 flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Anterior
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="px-3 py-1 bg-white border border-slate-300 rounded hover:bg-slate-100 font-medium disabled:opacity-50 flex items-center gap-1"
            >
              Siguiente <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL DE DECISIÓN INDIVIDUAL (POR TRANSACCIÓN) */}
      {modalItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4 animate-scaleIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-700" />
                Decisión de Corrección / Aprobación
              </h3>
              <button onClick={() => setModalItem(null)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-slate-500 font-medium">Documento DP:</span> <span className="font-bold text-slate-800">{modalItem.dp}</span></div>
              <div className="flex justify-between"><span className="text-slate-500 font-medium">Pedido PA:</span> <span className="font-bold text-slate-800">{modalItem.pa}</span></div>
              <div className="flex justify-between"><span className="text-slate-500 font-medium">Material:</span> <span className="font-bold text-blue-900">{modalItem.codigo} - {modalItem.descripcion}</span></div>
              <div className="flex justify-between"><span className="text-slate-500 font-medium">Orden de Compra:</span> <span className="font-bold text-slate-800">{modalItem.oc} ({modalItem.proveedor})</span></div>
              <div className="flex justify-between border-t border-slate-200 pt-2"><span className="text-slate-500 font-medium">Precio Actual Almacén (SIP):</span> <span className="font-bold text-amber-700">${modalItem.precio_sip.toFixed(2)} USD ({modalItem.um_salida || 'N/D'})</span></div>
              <div className="flex justify-between"><span className="text-slate-500 font-medium">Precio Pactado en OC:</span> <span className="font-bold text-blue-700">${modalItem.precio_oc.toFixed(2)} USD ({modalItem.um_compra || 'N/D'})</span></div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Selecciona la decisión a aplicar:
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="radio"
                  name="decisionOption"
                  value="MANTENER_SIP"
                  checked={decisionType === 'MANTENER_SIP'}
                  onChange={() => setDecisionType('MANTENER_SIP')}
                  className="mt-0.5 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="text-xs font-bold text-slate-800">1. Mantener Precio de Almacén SIP</div>
                  <div className="text-[11px] text-slate-500">Ratificar el precio de catálogo de almacén para este despacho.</div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="radio"
                  name="decisionOption"
                  value="APROBAR_OC"
                  checked={decisionType === 'APROBAR_OC'}
                  onChange={() => setDecisionType('APROBAR_OC')}
                  className="mt-0.5 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="text-xs font-bold text-slate-800">2. Aprobar Precio de la Orden de Compra (OC)</div>
                  <div className="text-[11px] text-slate-500">Actualizar el consumo al costo real negociado en la OC.</div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="radio"
                  name="decisionOption"
                  value="MANUAL"
                  checked={decisionType === 'MANUAL'}
                  onChange={() => setDecisionType('MANUAL')}
                  className="mt-0.5 text-blue-600 focus:ring-blue-500"
                />
                <div className="w-full">
                  <div className="text-xs font-bold text-slate-800">3. Fijar Precio Manual Validado ($)</div>
                  <input
                    type="number"
                    step="0.01"
                    value={manualPrice}
                    onChange={(e) => setManualPrice(e.target.value)}
                    placeholder="Ej: 75.00"
                    className="mt-1.5 w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </label>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                onClick={() => setModalItem(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveDecision}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow-xs transition"
              >
                Guardar Decisión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE DECISIÓN MASIVA POR MATERIAL (PARA COMPRAS) */}
      {modalMaterial && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4 animate-scaleIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Boxes className="w-5 h-5 text-blue-700" />
                Definición de Precio con Compras (Masivo)
              </h3>
              <button onClick={() => setModalMaterial(null)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">
                ✕
              </button>
            </div>

            <div className="bg-blue-50/60 p-3.5 rounded-xl border border-blue-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Material:</span>
                <span className="font-bold text-blue-950 font-mono">{modalMaterial.codigo}</span>
              </div>
              <div className="text-[12px] font-bold text-slate-800">{modalMaterial.descripcion}</div>
              <div className="flex justify-between border-t border-blue-200/60 pt-2">
                <span className="text-slate-600 font-medium">Transacciones afectadas:</span>
                <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  {modalMaterial.total_dps.toLocaleString('es-ES')} DPs vinculados
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 font-medium">Volumen total despachado:</span>
                <span className="font-bold text-slate-800">{modalMaterial.total_cant.toLocaleString('es-ES')} {modalMaterial.um_salida}</span>
              </div>
              <div className="flex justify-between border-t border-blue-200/60 pt-2">
                <span className="text-slate-500 font-medium">Precio Actual Almacén (SIP):</span>
                <span className="font-bold text-amber-700">${modalMaterial.precio_sip.toFixed(2)} USD ({modalMaterial.um_salida || 'N/D'})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">
                  {modalMaterial.categoria_alerta === 'SIN_OC' ? 'Costo Base de Inventario:' : 'Último Precio Compra OC:'}
                </span>
                <span className="font-bold text-blue-700">
                  ${modalMaterial.precio_oc.toFixed(2)} USD {modalMaterial.categoria_alerta === 'SIN_OC' ? '(Stock Almacén)' : `(${modalMaterial.um_compra || 'N/D'})`}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Selecciona la decisión a aplicar a los {modalMaterial.total_dps} despachos:
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="radio"
                  name="decisionOptionMaterial"
                  value="MANTENER_SIP"
                  checked={decisionType === 'MANTENER_SIP'}
                  onChange={() => setDecisionType('MANTENER_SIP')}
                  className="mt-0.5 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="text-xs font-bold text-slate-800">1. Mantener Precio de Almacén SIP (${modalMaterial.precio_sip.toFixed(2)})</div>
                  <div className="text-[11px] text-slate-500">Ratificar el precio de catálogo de almacén para todos los despachos de este material.</div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="radio"
                  name="decisionOptionMaterial"
                  value="APROBAR_OC"
                  checked={decisionType === 'APROBAR_OC'}
                  onChange={() => setDecisionType('APROBAR_OC')}
                  className="mt-0.5 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="text-xs font-bold text-slate-800">
                    {modalMaterial.categoria_alerta === 'SIN_OC'
                      ? `2. Ratificar Costo Base de Almacén ($${modalMaterial.precio_sip.toFixed(2)})`
                      : `2. Aprobar Precio de Orden de Compra ($${modalMaterial.precio_oc.toFixed(2)})`}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {modalMaterial.categoria_alerta === 'SIN_OC'
                      ? 'Inventario en existencias sin OC directa en 2026. Mantener valoración de inventario actual.'
                      : 'Actualizar todas las salidas de este material al costo negociado en OC.'}
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="radio"
                  name="decisionOptionMaterial"
                  value="MANUAL"
                  checked={decisionType === 'MANUAL'}
                  onChange={() => setDecisionType('MANUAL')}
                  className="mt-0.5 text-blue-600 focus:ring-blue-500"
                />
                <div className="w-full">
                  <div className="text-xs font-bold text-slate-800">3. Fijar Precio Acordado con Compras ($)</div>
                  <input
                    type="number"
                    step="0.01"
                    value={manualPrice}
                    onChange={(e) => setManualPrice(e.target.value)}
                    placeholder="Ej: 75.00"
                    className="mt-1.5 w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  />
                  <div className="text-[10px] text-slate-400 mt-0.5">Se aplicará uniformemente a las {modalMaterial.total_dps} salidas.</div>
                </div>
              </label>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                onClick={() => setModalMaterial(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveMaterialDecision}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow-xs transition"
              >
                Aplicar a las {modalMaterial.total_dps} Transacciones
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default BandejaAlertasSipView;
