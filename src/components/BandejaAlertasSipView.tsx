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
  Info
} from 'lucide-react';
import { ALERTAS_MONTHLY_KPIS, ALERTAS_SIP_RECORDS, AlertaItem } from '../data/alertasSipData';
import * as XLSX from 'xlsx';

export const BandejaAlertasSipView: React.FC = () => {
  const [records, setRecords] = useState<AlertaItem[]>(ALERTAS_SIP_RECORDS);
  const [selectedMonth, setSelectedMonth] = useState<string>('TODOS');
  const [selectedAlertType, setSelectedAlertType] = useState<string>('TODAS');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 25;

  // Modal de decisión
  const [modalItem, setModalItem] = useState<AlertaItem | null>(null);
  const [decisionType, setDecisionType] = useState<'MANTENER_SIP' | 'APROBAR_OC' | 'MANUAL'>('MANTENER_SIP');
  const [manualPrice, setManualPrice] = useState<string>('');

  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre'];

  // KPIs calculados
  const kpiStats = useMemo(() => {
    let totalCasos = 0;
    let umConflicts = 0;
    let desfasePrecio = 0;
    let impactoUSD = 0;

    if (selectedMonth === 'TODOS') {
      Object.values(ALERTAS_MONTHLY_KPIS).forEach(k => {
        totalCasos += k.total_casos;
        umConflicts += k.um_conflicts;
        desfasePrecio += k.desfase_precio;
        impactoUSD += k.impacto_total_usd;
      });
    } else if (ALERTAS_MONTHLY_KPIS[selectedMonth]) {
      const k = ALERTAS_MONTHLY_KPIS[selectedMonth];
      totalCasos = k.total_casos;
      umConflicts = k.um_conflicts;
      desfasePrecio = k.desfase_precio;
      impactoUSD = k.impacto_total_usd;
    }

    return { totalCasos, umConflicts, desfasePrecio, impactoUSD };
  }, [selectedMonth]);

  // Filtrado de registros
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

  // Paginación
  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage]);

  const handleOpenModal = (item: AlertaItem) => {
    setModalItem(item);
    setDecisionType('MANTENER_SIP');
    setManualPrice(item.precio_oc > 0 ? item.precio_oc.toFixed(2) : item.precio_sip.toFixed(2));
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

  const handleExportExcel = () => {
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
              <span className="text-xs text-blue-200">Corte Operativo 2026 (Enero a Septiembre)</span>
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

      {/* SELECTOR DE MESES (ENERO A SEPTIEMBRE) */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-blue-700" />
              Filtro de Mes de Operación
            </span>
            <span className="text-xs font-semibold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
              {selectedMonth === 'TODOS' ? 'Todos los Meses (Ene - Sep)' : `Mes Seleccionado: ${selectedMonth}`}
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
            Todos los Meses (Ene-Sep)
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

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Casos en Revisión</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{kpiStats.totalCasos.toLocaleString('es-ES')}</div>
          <div className="text-xs text-amber-700 font-bold mt-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Pendiente de Corrección / Aprobación
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-red-200 shadow-xs bg-red-50/20">
          <div className="text-[11px] font-semibold text-red-700 uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
            1. Errores de Unidad / Factor
          </div>
          <div className="text-2xl font-bold text-red-700 mt-1">{kpiStats.umConflicts.toLocaleString('es-ES')}</div>
          <div className="text-xs text-red-600 mt-1">Planchas vs Kg · Barras vs M · Sacos vs Kg</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs bg-amber-50/20">
          <div className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">2. Desfases Comerciales (5% - 200%)</div>
          <div className="text-2xl font-bold text-amber-900 mt-1">{kpiStats.desfasePrecio.toLocaleString('es-ES')}</div>
          <div className="text-xs text-amber-700 mt-1">Grava, Pinturas, Insumos y Consumibles</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Impacto Financiero Neto</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            ${Math.abs(kpiStats.impactoUSD).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
          </div>
          <div className="text-xs text-slate-500 mt-1">Brecha acumulada entre SIP y OC</div>
        </div>
      </div>

      {/* CONTROLES Y BUSCADOR */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            placeholder="Buscar por DP, PA, OC, Código, Proveedor o Material..."
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
            <option value="TODAS">Todas las Alertas</option>
            <option value="UM">🚨 1. Errores de Unidad / Factor (7.642 casos - Planchas, Perfiles)</option>
            <option value="PRECIO">⚠️ 2. Desfases Comerciales 5%-200% (39.378 casos - Grava, Insumos)</option>
            <option value="SIN_OC">ℹ️ 3. Sin OC / Faltantes (1.060 casos)</option>
          </select>

          <button
            onClick={handleExportExcel}
            className="text-xs bg-blue-900 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-800 transition flex items-center gap-1.5 whitespace-nowrap shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            Exportar Excel (.xlsx)
          </button>
        </div>
      </div>

      {/* TABLA DE ALERTAS */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Transacciones Retenidas para Validación
            </h3>
            <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full text-[11px]">
              {filteredRecords.length.toLocaleString('es-ES')} transacciones en vista
            </span>
          </div>
          <span className="text-xs text-slate-500 italic">
            Haz clic en <strong>"Decidir"</strong> para registrar tu validación de precio
          </span>
        </div>

        <div className="overflow-x-auto max-h-[550px]">
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
                  const isAprobado = r.estatus.includes('APROBADO');

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
                      <td className="py-2.5 px-3.5 text-right font-bold text-blue-700">
                        ${r.precio_oc.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3.5 text-center whitespace-nowrap">
                        <span className={`font-bold text-xs ${r.var_pct < 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                          {r.var_pct > 0 ? '+' : ''}{r.var_pct}%
                        </span>
                        <div className="text-[10px] text-slate-400">
                          (${Math.abs(r.impacto_usd).toLocaleString('es-ES', { maximumFractionDigits: 0 })})
                        </div>
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
        </div>

        {/* Paginación */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
          <span>
            Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong> ({filteredRecords.length.toLocaleString('es-ES')} transacciones)
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

      {/* MODAL DE DECISIÓN OPERATIVA */}
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
    </div>
  );
};
export default BandejaAlertasSipView;
