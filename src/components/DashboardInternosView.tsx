import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { 
  Building2, 
  Truck, 
  Wrench, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Layers, 
  FileText, 
  BarChart3, 
  DollarSign, 
  ShieldCheck, 
  ChevronRight, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight,
  Info,
  CheckCircle2,
  HardHat,
  Cpu,
  Sparkles,
  ArrowRight,
  Eye,
  Download,
  X,
  Search,
  ExternalLink
} from 'lucide-react';
import { 
  EVOLUTIVO_INTERNOS_2026, 
  TOTALES_ACUMULADOS_INTERNOS_2026, 
  CUENTAS_CAPEX_INTERNOS, 
  VARIACIONES_CAPEX_JUL_AGO, 
  TOP_VOCES_CAPEX_AGOSTO,
  TOP_10_EQUIPOS_OPEX_AGOSTO,
  TIPOS_EQUIPOS_OPEX_MENSUAL,
  VOCES_GASTO_OPEX_FLOTA_AGOSTO,
  MOD_MANTENIMIENTO_FLOTA_AGOSTO,
  MANTTO_INFRAESTRUCTURA_2026,
  FLOTA_GRUAS_TIMACA_2026
} from '../data/proyectosInternosData';
import { 
  DESGLOSE_DETALLE_INTERNOS, 
  getDesgloseInterno, 
  DetalleCuentaOActivo, 
  ItemDesgloseInterno 
} from '../data/desgloseDetalleInternos';
import { formatCurrency, formatNumber } from '../utils/dateHelpers';
import { UsuarioSistema } from '../types/usuarios';

interface DashboardInternosViewProps {
  onGoToPPT?: () => void;
  currentUser?: UsuarioSistema;
  activeSubTab?: 'resumen' | 'capex' | 'flota' | 'gruas' | 'mod' | 'infra';
  onSelectSubTab?: (tab: 'resumen' | 'capex' | 'flota' | 'gruas' | 'mod' | 'infra') => void;
}

export const DashboardInternosView: React.FC<DashboardInternosViewProps> = ({ 
  onGoToPPT,
  currentUser,
  activeSubTab,
  onSelectSubTab
}) => {
  const [subTab, setSubTab] = useState<'resumen' | 'capex' | 'flota' | 'gruas' | 'mod' | 'infra'>(activeSubTab || 'resumen');
  const [selectedMesIdx, setSelectedMesIdx] = useState<number>(7); // Agosto (index 7)
  const [filtroTipoEquipo, setFiltroTipoEquipo] = useState<string>('todos');
  const [selectedActivoParaDesglose, setSelectedActivoParaDesglose] = useState<DetalleCuentaOActivo | null>(null);

  // Sincronización automática de pestañas con el Menú del Header
  useEffect(() => {
    if (activeSubTab && activeSubTab !== subTab) {
      setSubTab(activeSubTab);
    }
  }, [activeSubTab]);

  const handleTabChange = (newTab: 'resumen' | 'capex' | 'flota' | 'gruas' | 'mod' | 'infra') => {
    setSubTab(newTab);
    onSelectSubTab?.(newTab);
  };

  const handleAbrirDesglose = (codigo: string, tituloFallback?: string, montoFallback?: number) => {
    const detalle = getDesgloseInterno(codigo);
    if (detalle) {
      setSelectedActivoParaDesglose(detalle);
    } else {
      setSelectedActivoParaDesglose({
        codigo,
        titulo: tituloFallback || `Activo / Cuenta ${codigo}`,
        tipo: 'CAPEX',
        montoAgosto: montoFallback || 0,
        responsableArea: 'Planta Industrial TIMACA',
        descripcionGeneral: 'Registro contable consolidado en el sistema de costos SIP de Planta.',
        items: []
      });
    }
  };

  const handleDescargarDesgloseExcel = (detalle: DetalleCuentaOActivo) => {
    const data = detalle.items.map((item, idx) => ({
      'N°': idx + 1,
      'Código Ítem': item.codigo,
      'Descripción del Ítem': item.descripcion,
      'Especificación Técnica': item.especificacion || '',
      'Categoría': item.categoria,
      'Rubro Contable': item.rubro || '',
      'Cantidad': item.cantidad || '',
      'Unidad': item.unidadMedida || '',
      'Precio Unitario ($)': item.montoUnitario || '',
      'Total USD ($)': item.montoTotal,
      'Proveedor / Destino': item.proveedor || '',
      'Comprobante SIP': item.comprobanteSIP || '',
      'Fecha': item.fecha || '',
      'Solicitante': item.solicitante || '',
      'Motivo Operativo': item.motivo || ''
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Desglose');
    XLSX.writeFile(wb, `Desglose_${detalle.codigo}_Agosto2026.xlsx`);
  };

  const mesActivo = EVOLUTIVO_INTERNOS_2026[selectedMesIdx];

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      
      {/* Banner Superior Distintivo: Modo Azul Grisáceo / Gestión Interna */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-xl border border-slate-700/80 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-600/20 via-slate-700/10 to-transparent pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/90 border border-slate-600 text-sky-300 text-xs font-semibold shadow-xs">
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                <span>GESTIÓN INTERNA CORPORATIVA · PLANTA & ACTIVOS TIMACA</span>
              </div>
              {currentUser?.permisos.canEditInternos ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-xs font-bold shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Edición Habilitada ({currentUser.nombre.split(' ')[0]})</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-700/60 text-slate-400 border border-slate-600 text-xs font-medium shadow-xs">
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  <span>Modo Observador (Solo Lectura)</span>
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>Proyectos Internos, Flota & Infraestructura</span>
              <span className="text-xs px-2.5 py-0.5 rounded-md bg-sky-950 text-sky-300 border border-sky-700/60 font-mono">
                CAPEX + OPEX
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl">
              Consolidación auditada de inversiones en activos fijos (CAPEX) y gastos operativos de mantenimiento propio de talleres, galpones y flota pesada (OPEX). Conciliado con el informe oficial de Agosto 2026.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {onGoToPPT && (
              <button
                onClick={onGoToPPT}
                className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer group"
              >
                <FileText className="w-4 h-4" />
                <span>Presentación Oficial PPT (10 Láminas)</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}
          </div>
        </div>

        {/* Indicador contextual de Auditoría Activa */}
        {subTab !== 'resumen' && (
          <div className="pt-4 mt-4 border-t border-slate-700/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Auditoría Especializada:</span>
              <span className="font-bold text-sky-300 bg-sky-950/80 px-2.5 py-1 rounded-lg border border-sky-700/60 font-mono">
                {subTab === 'capex' && 'Inversiones CAPEX (Obras Civiles)'}
                {subTab === 'flota' && 'Flota & Equipos (OPEX Mantenimiento)'}
                {subTab === 'gruas' && 'Control de 26 Grúas TIMACA'}
                {subTab === 'mod' && 'Mano de Obra Directa (MOD 4.697 HH)'}
                {subTab === 'infra' && 'Infraestructura & Talleres'}
              </span>
            </div>
            <button
              onClick={() => handleTabChange('resumen')}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs border border-slate-600 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>← Volver al Tablero Ejecutivo</span>
            </button>
          </div>
        )}
      </div>

      {/* Selector de Mes */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-200/90 backdrop-blur-md p-3 rounded-2xl border border-slate-300 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <Calendar className="w-4 h-4 text-slate-500" />
          <span>Periodo en Visualización:</span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {EVOLUTIVO_INTERNOS_2026.map((m, idx) => (
            <button
              key={m.mesCorto}
              onClick={() => setSelectedMesIdx(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedMesIdx === idx
                  ? 'bg-slate-800 text-white shadow-xs ring-1 ring-slate-700'
                  : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-300'
              }`}
            >
              {m.mesCorto}
            </button>
          ))}
        </div>
      </div>

      {/* 5 KPIs Ejecutivos Oficiales de Agosto (Idénticos a Lámina 2 del Informe) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        
        {/* KPI 1: CAPEX */}
        <div className="bg-white/95 rounded-2xl p-4 border border-slate-300/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1 font-semibold uppercase tracking-wider">
            <span>Proyectos Internos (CAPEX)</span>
            <Building2 className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {formatCurrency(mesActivo.capex)}
          </div>
          <div className="flex items-center justify-between text-[11px] mt-2 pt-2 border-t border-slate-100">
            <span className="text-emerald-600 font-bold flex items-center gap-0.5">
              <TrendingDown className="w-3.5 h-3.5" /> 36% vs Julio
            </span>
            <span className="text-slate-400 font-medium">16% del total</span>
          </div>
        </div>

        {/* KPI 2: OPEX Activos Productivos */}
        <div className="bg-white/95 rounded-2xl p-4 border border-slate-300/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1 font-semibold uppercase tracking-wider">
            <span>Mantto. Activos Prod (OPEX)</span>
            <Truck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {formatCurrency(mesActivo.opexActivos)}
          </div>
          <div className="flex items-center justify-between text-[11px] mt-2 pt-2 border-t border-slate-100">
            <span className="text-rose-600 font-bold flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> 16% vs Julio
            </span>
            <span className="text-slate-400 font-medium">62% del total</span>
          </div>
        </div>

        {/* KPI 3: OPEX Infraestructura */}
        <div className="bg-white/95 rounded-2xl p-4 border border-slate-300/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1 font-semibold uppercase tracking-wider">
            <span>Mantto. Infraestructura (OPEX)</span>
            <Wrench className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {formatCurrency(mesActivo.opexInfraestructura)}
          </div>
          <div className="flex items-center justify-between text-[11px] mt-2 pt-2 border-t border-slate-100">
            <span className="text-emerald-600 font-bold flex items-center gap-0.5">
              <TrendingDown className="w-3.5 h-3.5" /> 3% vs Julio
            </span>
            <span className="text-slate-400 font-medium">22% del total</span>
          </div>
        </div>

        {/* KPI 4: Total OPEX */}
        <div className="bg-slate-800 text-white rounded-2xl p-4 border border-slate-700 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-xs text-slate-300 mb-1 font-semibold uppercase tracking-wider">
            <span>Total Mantenimiento (OPEX)</span>
            <Layers className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {formatCurrency(mesActivo.totalOpex)}
          </div>
          <div className="flex items-center justify-between text-[11px] mt-2 pt-2 border-t border-slate-700 text-slate-300">
            <span className="text-amber-400 font-bold flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> 10% vs Julio
            </span>
            <span className="font-mono text-sky-300">84% del mes</span>
          </div>
        </div>

        {/* KPI 5: Total General Internos */}
        <div className="bg-gradient-to-br from-slate-900 to-sky-950 text-white rounded-2xl p-4 border border-sky-800/80 shadow-md">
          <div className="flex items-center justify-between text-xs text-sky-200 mb-1 font-semibold uppercase tracking-wider">
            <span>Total General {mesActivo.mesLabel}</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-300 font-mono">
            {formatCurrency(mesActivo.totalGeneral)}
          </div>
          <div className="flex items-center justify-between text-[11px] mt-2 pt-2 border-t border-sky-900 text-slate-300">
            <span className="text-emerald-400 font-bold flex items-center gap-0.5">
              <TrendingDown className="w-3.5 h-3.5" /> 1% vs Julio
            </span>
            <span className="font-mono text-slate-300">Acum: $2.015.555</span>
          </div>
        </div>

      </div>

      {/* ===================== CONTENIDO POR SUB-PESTAÑA ===================== */}

      {/* PESTAÑA 1: RESUMEN EJECUTIVO */}
      {subTab === 'resumen' && (
        <div className="space-y-6">
          
          {/* Fila: Evolutivo Mensual + Distribución de Torta */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Gráfico / Evolutivo General Mensual Ene-Ago */}
            <div className="lg:col-span-8 bg-white/95 rounded-2xl p-5 border border-slate-300/80 shadow-sm">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">
                    Evolutivo General Mensual (Ene - Ago 2026)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Comportamiento histórico de inversiones en Planta (CAPEX) vs Mantenimiento Operativo (OPEX).
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                  Acumulado: {formatCurrency(TOTALES_ACUMULADOS_INTERNOS_2026.totalGeneral)}
                </span>
              </div>

              {/* Barras de Evolución */}
              <div className="h-64 flex items-end justify-between gap-3 pt-6 pb-2 px-2">
                {EVOLUTIVO_INTERNOS_2026.map((m, idx) => {
                  const maxVal = 500000;
                  const hCapex = Math.max(8, (m.capex / maxVal) * 100);
                  const hActivos = Math.max(8, (m.opexActivos / maxVal) * 100);
                  const hInfra = Math.max(8, (m.opexInfraestructura / maxVal) * 100);
                  const isSelected = selectedMesIdx === idx;

                  return (
                    <div 
                      key={m.mesCorto} 
                      onClick={() => setSelectedMesIdx(idx)}
                      className={`flex-1 flex flex-col items-center cursor-pointer group p-1 rounded-xl transition-all ${
                        isSelected ? 'bg-slate-100/90 ring-2 ring-slate-700' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-[10px] font-mono font-bold text-slate-700 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        ${Math.round(m.totalGeneral / 1000)}k
                      </div>
                      
                      <div className="w-full max-w-[32px] flex flex-col-reverse gap-0.5 items-center justify-end h-44">
                        {/* Infraestructura */}
                        <div 
                          style={{ height: `${hInfra}%` }} 
                          className="w-full bg-teal-500 rounded-t-xs hover:brightness-110 transition-all"
                          title={`OPEX Infra: ${formatCurrency(m.opexInfraestructura)}`}
                        />
                        {/* Activos Productivos */}
                        <div 
                          style={{ height: `${hActivos}%` }} 
                          className="w-full bg-indigo-600 rounded-t-xs hover:brightness-110 transition-all"
                          title={`OPEX Flota: ${formatCurrency(m.opexActivos)}`}
                        />
                        {/* CAPEX */}
                        <div 
                          style={{ height: `${hCapex}%` }} 
                          className="w-full bg-sky-500 rounded-t-xs hover:brightness-110 transition-all"
                          title={`CAPEX: ${formatCurrency(m.capex)}`}
                        />
                      </div>

                      <div className={`text-xs font-bold mt-2 ${isSelected ? 'text-slate-900' : 'text-slate-500'}`}>
                        {m.mesCorto}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Leyenda de Colores */}
              <div className="flex flex-wrap items-center justify-center gap-5 pt-3 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-sky-500" />
                  <span className="font-medium text-slate-700">Proyectos Internos (CAPEX)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-indigo-600" />
                  <span className="font-medium text-slate-700">Mantto. Activos Productivos (OPEX Flota)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-teal-500" />
                  <span className="font-medium text-slate-700">Mantto. Infraestructura (OPEX Planta)</span>
                </div>
              </div>
            </div>

            {/* Distribución de Costos Agosto (Torta / Tarjetas) */}
            <div className="lg:col-span-4 bg-white/95 rounded-2xl p-5 border border-slate-300/80 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  Distribución CAPEX vs OPEX
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Participación en el gasto de {mesActivo.mesLabel} 2026.
                </p>

                {/* Barra de Distribución Porcentual */}
                <div className="h-4 w-full rounded-full overflow-hidden flex bg-slate-100 shadow-inner mb-4">
                  <div style={{ width: '16%' }} className="bg-sky-500" title="CAPEX: 16%" />
                  <div style={{ width: '62%' }} className="bg-indigo-600" title="Activos Prod: 62%" />
                  <div style={{ width: '22%' }} className="bg-teal-500" title="Infraestructura: 22%" />
                </div>

                {/* Desglose en Tarjetas */}
                <div className="space-y-2.5">
                  <div 
                    onClick={() => handleTabChange('capex')}
                    className="p-3 rounded-xl bg-sky-50/60 border border-sky-200 flex items-center justify-between hover:bg-sky-100 hover:border-sky-300 cursor-pointer transition-all group"
                    title="Clic para ver Inversiones CAPEX"
                  >
                    <div>
                      <div className="text-xs font-bold text-sky-950 group-hover:text-sky-900 flex items-center gap-1.5">
                        <span>Proyectos Internos (CAPEX)</span>
                        <ArrowRight className="w-3 h-3 text-sky-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="text-[11px] text-sky-700 font-medium">Inversión en Edificio, Galpones y Patios</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-sky-900 font-mono">$29.017</div>
                      <div className="text-[10px] font-bold text-sky-600">16%</div>
                    </div>
                  </div>

                  <div 
                    onClick={() => handleTabChange('flota')}
                    className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-200 flex items-center justify-between hover:bg-indigo-100 hover:border-indigo-300 cursor-pointer transition-all group"
                    title="Clic para ver Flota & Equipos (OPEX)"
                  >
                    <div>
                      <div className="text-xs font-bold text-indigo-950 group-hover:text-indigo-900 flex items-center gap-1.5">
                        <span>Mantto. Activos Prod. (OPEX)</span>
                        <ArrowRight className="w-3 h-3 text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="text-[11px] text-indigo-700 font-medium">Flota de 26 Grúas, Camiones y Buses</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-indigo-900 font-mono">$113.450</div>
                      <div className="text-[10px] font-bold text-indigo-600">62%</div>
                    </div>
                  </div>

                  <div 
                    onClick={() => handleTabChange('infra')}
                    className="p-3 rounded-xl bg-teal-50/60 border border-teal-200 flex items-center justify-between hover:bg-teal-100 hover:border-teal-300 cursor-pointer transition-all group"
                    title="Clic para ver Infraestructura (OPEX)"
                  >
                    <div>
                      <div className="text-xs font-bold text-teal-950 group-hover:text-teal-900 flex items-center gap-1.5">
                        <span>Mantto. Infraestructura (OPEX)</span>
                        <ArrowRight className="w-3 h-3 text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="text-[11px] text-teal-700 font-medium">Adecuaciones, galpones y talleres</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-teal-900 font-mono">$40.545</div>
                      <div className="text-[10px] font-bold text-teal-600">22%</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botón de Acceso a Presentación */}
              <div className="pt-4 border-t border-slate-100 mt-4">
                <button
                  onClick={onGoToPPT}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
                >
                  <FileText className="w-3.5 h-3.5 text-sky-400" />
                  <span>Ver Diapositivas Oficiales (10 Láminas)</span>
                </button>
              </div>
            </div>

          </div>

          {/* Tabla Resumen Mensual Ene - Ago (Idéntica a Lámina 2 del PDF) */}
          <div className="bg-white/95 rounded-2xl p-5 border border-slate-300/80 shadow-sm overflow-x-auto">
            <h3 className="text-base font-black text-slate-900 mb-3 tracking-tight">
              Matriz Comparativa Mensual Enero a Agosto 2026 ($ USD)
            </h3>
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-800 text-white font-bold">
                  <th className="py-2.5 px-3 rounded-l-lg">Descripción</th>
                  <th className="py-2.5 px-3 text-right">Ene</th>
                  <th className="py-2.5 px-3 text-right">Feb</th>
                  <th className="py-2.5 px-3 text-right">Mar</th>
                  <th className="py-2.5 px-3 text-right">Abr</th>
                  <th className="py-2.5 px-3 text-right">May</th>
                  <th className="py-2.5 px-3 text-right">Jun</th>
                  <th className="py-2.5 px-3 text-right">Jul</th>
                  <th className="py-2.5 px-3 text-right bg-sky-900 text-sky-200">Ago</th>
                  <th className="py-2.5 px-3 text-right rounded-r-lg font-mono">Acum. 2026 ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                <tr className="hover:bg-sky-50/40">
                  <td className="py-2.5 px-3 font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sky-500" />
                    Proyectos Internos (CAPEX)
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono">$162.467</td>
                  <td className="py-2.5 px-3 text-right font-mono">$326.380</td>
                  <td className="py-2.5 px-3 text-right font-mono">$149.039</td>
                  <td className="py-2.5 px-3 text-right font-mono">$92.865</td>
                  <td className="py-2.5 px-3 text-right font-mono">$77.901</td>
                  <td className="py-2.5 px-3 text-right font-mono">$32.585</td>
                  <td className="py-2.5 px-3 text-right font-mono">$45.087</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold bg-sky-50 text-sky-900">$29.017</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">$915.341</td>
                </tr>
                <tr className="hover:bg-indigo-50/40">
                  <td className="py-2.5 px-3 font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-600" />
                    Mantto. Activos Productivos (OPEX Flota)
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono">$143.581</td>
                  <td className="py-2.5 px-3 text-right font-mono">$102.274</td>
                  <td className="py-2.5 px-3 text-right font-mono">$83.194</td>
                  <td className="py-2.5 px-3 text-right font-mono">$59.543</td>
                  <td className="py-2.5 px-3 text-right font-mono">$68.409</td>
                  <td className="py-2.5 px-3 text-right font-mono">$72.213</td>
                  <td className="py-2.5 px-3 text-right font-mono">$97.727</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold bg-indigo-50 text-indigo-900">$113.450</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">$740.391</td>
                </tr>
                <tr className="hover:bg-teal-50/40">
                  <td className="py-2.5 px-3 font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-teal-500" />
                    Mantto. Infraestructura (OPEX Planta)
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono">$145.197</td>
                  <td className="py-2.5 px-3 text-right font-mono">$50.329</td>
                  <td className="py-2.5 px-3 text-right font-mono">$20.149</td>
                  <td className="py-2.5 px-3 text-right font-mono">$25.926</td>
                  <td className="py-2.5 px-3 text-right font-mono">$20.031</td>
                  <td className="py-2.5 px-3 text-right font-mono">$15.748</td>
                  <td className="py-2.5 px-3 text-right font-mono">$41.898</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold bg-teal-50 text-teal-900">$40.545</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">$359.823</td>
                </tr>
                <tr className="bg-slate-100/90 font-black text-slate-900 border-t-2 border-slate-300">
                  <td className="py-3 px-3">TOTAL GENERAL CONSOLIDADO</td>
                  <td className="py-3 px-3 text-right font-mono">$451.244</td>
                  <td className="py-3 px-3 text-right font-mono">$478.983</td>
                  <td className="py-3 px-3 text-right font-mono">$252.382</td>
                  <td className="py-3 px-3 text-right font-mono">$178.334</td>
                  <td className="py-3 px-3 text-right font-mono">$166.341</td>
                  <td className="py-3 px-3 text-right font-mono">$120.546</td>
                  <td className="py-3 px-3 text-right font-mono">$184.712</td>
                  <td className="py-3 px-3 text-right font-mono bg-slate-200 text-sky-950 text-sm">$183.013</td>
                  <td className="py-3 px-3 text-right font-mono text-sm text-sky-900 font-extrabold">$2.015.555</td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* PESTAÑA 2: INVERSIONES CAPEX */}
      {subTab === 'capex' && (
        <div className="space-y-6">
          
          {/* Tarjetas de Variaciones Jul vs Ago con las notas explicativas exactas */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Building2 className="w-4 h-4 text-sky-600" />
                <span>Variación por Proyecto CAPEX (Julio vs Agosto 2026)</span>
              </h3>
              <span className="text-xs text-slate-500 font-medium">Justificaciones técnicas de obra</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {VARIACIONES_CAPEX_JUL_AGO.map((v) => (
                <div 
                  key={v.cuenta} 
                  onClick={() => handleAbrirDesglose(v.cuenta, v.proyecto, v.agosto)}
                  className="bg-white/95 rounded-2xl p-4 border border-slate-300/80 shadow-sm flex flex-col justify-between hover:border-sky-400 hover:shadow-md cursor-pointer transition-all group"
                  title={`Clic para ver desglose de ${v.proyecto}`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-bold group-hover:bg-sky-100 group-hover:text-sky-800 transition-colors">
                        {v.cuenta}
                      </span>
                      <span className={`text-xs font-black flex items-center gap-0.5 ${v.esSubida ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {v.esSubida ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        {v.porcentaje}
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-slate-900 group-hover:text-sky-950 leading-snug">
                      {v.proyecto}
                    </h4>
                    <div className="text-lg font-black text-slate-900 font-mono mt-1 flex items-baseline justify-between">
                      <span>{formatCurrency(v.agosto)}</span>
                      <span className="text-[10px] text-sky-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">Ver 🔍</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Julio: {formatCurrency(v.julio)}
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-600 leading-relaxed italic">
                    "{v.explicacion}"
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Matriz Completa de Cuentas Auxiliares CAPEX */}
          <div className="bg-white/95 rounded-2xl p-5 border border-slate-300/80 shadow-sm overflow-x-auto">
            <h3 className="text-base font-black text-slate-900 mb-3 tracking-tight">
              Cuentas Auxiliares de Inversiones CAPEX (Enero - Agosto 2026)
            </h3>
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-800 text-white font-bold">
                  <th className="py-2.5 px-3 rounded-l-lg">Cuenta Auxiliar</th>
                  <th className="py-2.5 px-3">Proyecto / Obra</th>
                  <th className="py-2.5 px-2 text-right">Ene</th>
                  <th className="py-2.5 px-2 text-right">Feb</th>
                  <th className="py-2.5 px-2 text-right">Mar</th>
                  <th className="py-2.5 px-2 text-right">Abr</th>
                  <th className="py-2.5 px-2 text-right">May</th>
                  <th className="py-2.5 px-2 text-right">Jun</th>
                  <th className="py-2.5 px-2 text-right">Jul</th>
                  <th className="py-2.5 px-2 text-right bg-sky-900 text-sky-200">Ago</th>
                  <th className="py-2.5 px-3 text-right rounded-r-lg font-mono">Total 2026 ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {CUENTAS_CAPEX_INTERNOS.map((c) => (
                  <tr 
                    key={c.cuentaAuxiliar} 
                    onClick={() => handleAbrirDesglose(c.cuentaAuxiliar, c.proyecto, c.ago)}
                    className="hover:bg-sky-50/80 cursor-pointer transition-colors group"
                    title={`Hacer clic para ver el desglose analítico de ${c.proyecto}`}
                  >
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-sky-800">{c.cuentaAuxiliar}</span>
                        <Eye className="w-3.5 h-3.5 text-sky-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-800 group-hover:text-sky-950 flex items-center justify-between">
                      <span>{c.proyecto}</span>
                      <span className="text-[10px] text-sky-600 bg-sky-100 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity font-semibold">
                        Ver Desglose 🔍
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono text-slate-600">{c.ene > 0 ? formatCurrency(c.ene) : '-'}</td>
                    <td className="py-2.5 px-2 text-right font-mono text-slate-600">{c.feb > 0 ? formatCurrency(c.feb) : '-'}</td>
                    <td className="py-2.5 px-2 text-right font-mono text-slate-600">{c.mar > 0 ? formatCurrency(c.mar) : '-'}</td>
                    <td className="py-2.5 px-2 text-right font-mono text-slate-600">{c.abr > 0 ? formatCurrency(c.abr) : '-'}</td>
                    <td className="py-2.5 px-2 text-right font-mono text-slate-600">{c.may > 0 ? formatCurrency(c.may) : '-'}</td>
                    <td className="py-2.5 px-2 text-right font-mono text-slate-600">{c.jun > 0 ? formatCurrency(c.jun) : '-'}</td>
                    <td className="py-2.5 px-2 text-right font-mono text-slate-600">{c.jul > 0 ? formatCurrency(c.jul) : '-'}</td>
                    <td className="py-2.5 px-2 text-right font-mono font-bold bg-sky-50 text-sky-900">{c.ago > 0 ? formatCurrency(c.ago) : '-'}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900">{formatCurrency(c.total2026)}</td>
                  </tr>
                ))}
                <tr className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-300">
                  <td colSpan={2} className="py-3 px-3">TOTAL PROYECTOS INTERNOS (CAPEX)</td>
                  <td className="py-3 px-2 text-right font-mono">$162.467</td>
                  <td className="py-3 px-2 text-right font-mono">$326.380</td>
                  <td className="py-3 px-2 text-right font-mono">$149.039</td>
                  <td className="py-3 px-2 text-right font-mono">$92.865</td>
                  <td className="py-3 px-2 text-right font-mono">$77.901</td>
                  <td className="py-3 px-2 text-right font-mono">$32.585</td>
                  <td className="py-3 px-2 text-right font-mono">$45.087</td>
                  <td className="py-3 px-2 text-right font-mono bg-sky-100 text-sky-900">$29.017</td>
                  <td className="py-3 px-3 text-right font-mono text-sky-950 font-extrabold">$915.341</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Top Voces de Gastos CAPEX Agosto */}
          <div className="bg-white/95 rounded-2xl p-5 border border-slate-300/80 shadow-sm">
            <h3 className="text-base font-black text-slate-900 mb-3 tracking-tight">
              Top Voces de Gasto en Inversiones CAPEX (Agosto 2026)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {TOP_VOCES_CAPEX_AGOSTO.map((v) => (
                <div key={v.rubro} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-sky-700 uppercase">{v.categoria}</span>
                    <span className="font-mono font-black text-slate-900 text-sm">{formatCurrency(v.monto)}</span>
                  </div>
                  <div className="font-bold text-xs text-slate-800 mb-1">{v.rubro}</div>
                  <div className="text-[11px] text-slate-500 leading-snug">{v.detalle}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* PESTAÑA 3: FLOTA & EQUIPOS OPEX */}
      {subTab === 'flota' && (
        <div className="space-y-6">
          
          {/* Top 10 Equipos Móviles con Mayor Gasto */}
          <div className="bg-white/95 rounded-2xl p-5 border border-slate-300/80 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Truck className="w-4 h-4 text-indigo-600" />
                  <span>Top 10 Equipos Móviles con Mayor Gasto (Agosto 2026)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Total de los 10 equipos: $64.839 USD (57% de todo el gasto de flota en agosto).
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-lg">
                Equipo Líder: GR17 ($23.206 USD)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {TOP_10_EQUIPOS_OPEX_AGOSTO.map((eq, idx) => (
                <div 
                  key={eq.codigo} 
                  onClick={() => handleAbrirDesglose(eq.codigo, eq.nombre, eq.montoAgosto)}
                  className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 flex flex-col justify-between hover:border-indigo-400 hover:shadow-md cursor-pointer transition-all group"
                  title={`Clic para ver desglose de repuestos y servicios de ${eq.nombre}`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded group-hover:bg-indigo-100 transition-colors">
                        #{idx + 1} · {eq.codigo}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">{eq.tipo}</span>
                    </div>
                    <h4 className="font-bold text-xs text-slate-900 group-hover:text-indigo-950 mt-1 line-clamp-1" title={eq.nombre}>
                      {eq.nombre}
                    </h4>
                    <div className="text-lg font-black text-slate-900 font-mono mt-1 flex items-baseline justify-between">
                      <span>{formatCurrency(eq.montoAgosto)}</span>
                      <span className="text-[10px] text-indigo-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">Ver 🔍</span>
                    </div>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-slate-200 text-[10px] text-slate-600 leading-snug">
                    {eq.detalle}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tabla Mensual por Tipo de Activo Productivo */}
          <div className="bg-white/95 rounded-2xl p-5 border border-slate-300/80 shadow-sm overflow-x-auto">
            <h3 className="text-base font-black text-slate-900 mb-3 tracking-tight">
              Evolución Mensual por Familia de Activos Móviles (Ene - Ago 2026)
            </h3>
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-800 text-white font-bold">
                  <th className="py-2.5 px-3 rounded-l-lg">Tipo de Equipo</th>
                  <th className="py-2.5 px-2 text-right">Ene</th>
                  <th className="py-2.5 px-2 text-right">Feb</th>
                  <th className="py-2.5 px-2 text-right">Mar</th>
                  <th className="py-2.5 px-2 text-right">Abr</th>
                  <th className="py-2.5 px-2 text-right">May</th>
                  <th className="py-2.5 px-2 text-right">Jun</th>
                  <th className="py-2.5 px-2 text-right">Jul</th>
                  <th className="py-2.5 px-2 text-right bg-indigo-900 text-indigo-200">Ago</th>
                  <th className="py-2.5 px-3 text-right rounded-r-lg font-mono">Total 2026 ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {TIPOS_EQUIPOS_OPEX_MENSUAL.map((t) => (
                  <tr key={t.tipo} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-bold text-slate-800">{t.tipo}</td>
                    <td className="py-2 px-2 text-right font-mono text-slate-600">{t.ene > 0 ? formatCurrency(t.ene) : '-'}</td>
                    <td className="py-2 px-2 text-right font-mono text-slate-600">{t.feb > 0 ? formatCurrency(t.feb) : '-'}</td>
                    <td className="py-2 px-2 text-right font-mono text-slate-600">{t.mar > 0 ? formatCurrency(t.mar) : '-'}</td>
                    <td className="py-2 px-2 text-right font-mono text-slate-600">{t.abr > 0 ? formatCurrency(t.abr) : '-'}</td>
                    <td className="py-2 px-2 text-right font-mono text-slate-600">{t.may > 0 ? formatCurrency(t.may) : '-'}</td>
                    <td className="py-2 px-2 text-right font-mono text-slate-600">{t.jun > 0 ? formatCurrency(t.jun) : '-'}</td>
                    <td className="py-2 px-2 text-right font-mono text-slate-600">{t.jul > 0 ? formatCurrency(t.jul) : '-'}</td>
                    <td className="py-2 px-2 text-right font-mono font-bold bg-indigo-50 text-indigo-900">{formatCurrency(t.ago)}</td>
                    <td className="py-2 px-3 text-right font-mono font-black text-slate-900">{formatCurrency(t.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Voces de Gasto de Flota */}
          <div className="bg-white/95 rounded-2xl p-5 border border-slate-300/80 shadow-sm">
            <h3 className="text-base font-black text-slate-900 mb-3 tracking-tight">
              Voces de Gasto en Mantenimiento de Flota (Agosto 2026)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {VOCES_GASTO_OPEX_FLOTA_AGOSTO.map((v) => (
                <div key={v.rubro} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-indigo-700 uppercase">{v.grupo}</span>
                    <span className="font-mono font-black text-slate-900 text-sm">{formatCurrency(v.monto)}</span>
                  </div>
                  <div className="font-bold text-xs text-slate-800 mb-1">{v.rubro}</div>
                  <div className="text-[11px] text-slate-500 leading-snug">{v.detalle}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* PESTAÑA 4: FLOTA DE 26 GRÚAS */}
      {subTab === 'gruas' && (
        <div className="space-y-6">
          <div className="bg-white/95 rounded-2xl p-5 border border-slate-300/80 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-sky-600" />
                  <span>Control de Flota: 26 Grúas TIMACA (Agosto 2026)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Gasto total en grúas: $32.364 USD en agosto | $333.471 USD acumulado Ene-Ago 2026.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold bg-sky-50 text-sky-800 border border-sky-200 px-3 py-1 rounded-lg">
                  26 Grúas Operativas
                </span>
              </div>
            </div>

            {/* Top 5 Grúas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 mb-6">
              {FLOTA_GRUAS_TIMACA_2026.top5GruasAgosto.map((g) => (
                <div 
                  key={g.codigo} 
                  onClick={() => handleAbrirDesglose(g.codigo, g.descripcion, g.monto)}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-sky-400 hover:shadow-md cursor-pointer transition-all group"
                  title={`Clic para ver desglose de ${g.descripcion}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-500 group-hover:text-sky-700">{g.codigo}</span>
                    <span className="text-[10px] text-sky-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">Ver 🔍</span>
                  </div>
                  <div className="text-base font-black text-slate-900 font-mono mt-0.5">{formatCurrency(g.monto)}</div>
                  <div className="text-[11px] text-slate-600 font-medium truncate mt-1" title={g.descripcion}>{g.descripcion}</div>
                  <div className="text-[10px] font-bold text-sky-600 mt-1">{g.variacion} vs Jul</div>
                </div>
              ))}
            </div>

            {/* Tabla Detalle Grúas con Mayor Variación */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-800 text-white font-bold">
                    <th className="py-2.5 px-3 rounded-l-lg">Código Grúa</th>
                    <th className="py-2.5 px-3">Modelo / Serial</th>
                    <th className="py-2.5 px-2 text-right">Ene</th>
                    <th className="py-2.5 px-2 text-right">Feb</th>
                    <th className="py-2.5 px-2 text-right">Mar</th>
                    <th className="py-2.5 px-2 text-right">Abr</th>
                    <th className="py-2.5 px-2 text-right">May</th>
                    <th className="py-2.5 px-2 text-right">Jun</th>
                    <th className="py-2.5 px-2 text-right">Jul</th>
                    <th className="py-2.5 px-2 text-right bg-sky-900 text-sky-200">Ago</th>
                    <th className="py-2.5 px-3 text-right rounded-r-lg">Variación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {FLOTA_GRUAS_TIMACA_2026.detalleGruasMayorVariacion.map((gr) => (
                    <tr 
                      key={gr.codigo} 
                      onClick={() => handleAbrirDesglose(gr.codigo, gr.proyecto, gr.ago)}
                      className="hover:bg-sky-50/80 cursor-pointer transition-colors group"
                      title={`Hacer clic para ver el desglose analítico de ${gr.proyecto}`}
                    >
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-sky-800">{gr.codigo}</span>
                          <Eye className="w-3.5 h-3.5 text-sky-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-800 group-hover:text-sky-950 flex items-center justify-between">
                        <span>{gr.proyecto}</span>
                        <span className="text-[10px] text-sky-600 bg-sky-100 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity font-semibold">
                          Ver Desglose 🔍
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono text-slate-600">{gr.ene > 0 ? formatCurrency(gr.ene) : '-'}</td>
                      <td className="py-2.5 px-2 text-right font-mono text-slate-600">{gr.feb > 0 ? formatCurrency(gr.feb) : '-'}</td>
                      <td className="py-2.5 px-2 text-right font-mono text-slate-600">{gr.mar > 0 ? formatCurrency(gr.mar) : '-'}</td>
                      <td className="py-2.5 px-2 text-right font-mono text-slate-600">{gr.abr > 0 ? formatCurrency(gr.abr) : '-'}</td>
                      <td className="py-2.5 px-2 text-right font-mono text-slate-600">{gr.may > 0 ? formatCurrency(gr.may) : '-'}</td>
                      <td className="py-2.5 px-2 text-right font-mono text-slate-600">{gr.jun > 0 ? formatCurrency(gr.jun) : '-'}</td>
                      <td className="py-2.5 px-2 text-right font-mono text-slate-600">{gr.jul > 0 ? formatCurrency(gr.jul) : '-'}</td>
                      <td className="py-2.5 px-2 text-right font-mono font-bold bg-sky-50 text-sky-900">{formatCurrency(gr.ago)}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-700">{gr.variacion}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Notas Técnicas de Taller */}
            <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1.5">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-sky-600" />
                <span>Auditoría de Variaciones Técnicas en Grúas (Agosto 2026):</span>
              </div>
              {FLOTA_GRUAS_TIMACA_2026.analisisCausas.map((c, i) => (
                <p key={i} className="text-slate-600 pl-5 leading-relaxed">• {c}</p>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* PESTAÑA 5: MOD MANTENIMIENTO */}
      {subTab === 'mod' && (
        <div className="space-y-6">
          <div className="bg-white/95 rounded-2xl p-5 border border-slate-300/80 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>Mano de Obra Directa (MOD) - Taller Mecánico & Mantenimiento</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Nómina operativa de 27 técnicos y mecánicos dedicados al mantenimiento interno.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-lg">
                  Total MOD: $9.644 USD | 4.697 Horas Hombre
                </span>
              </div>
            </div>

            {/* Evolutivo de Horas por Semana */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
              {MOD_MANTENIMIENTO_FLOTA_AGOSTO.evolutivoSemanas.map((s) => (
                <div key={s.periodo} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-500">{s.periodo}</div>
                  <div className="text-xl font-black text-slate-900 font-mono mt-0.5">{s.horas}h</div>
                  <div className="text-[10px] text-slate-600 line-clamp-2 mt-1" title={s.detalle}>{s.detalle}</div>
                </div>
              ))}
            </div>

            {/* Tabla por Tipo de Equipo */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-800 text-white font-bold">
                    <th className="py-2.5 px-3 rounded-l-lg">Tipo de Equipo</th>
                    <th className="py-2.5 px-3 text-center">Cant. Trabajadores</th>
                    <th className="py-2.5 px-3 text-right">Total Horas Hombre</th>
                    <th className="py-2.5 px-3 text-right">Tarifa Promedio ($/HR)</th>
                    <th className="py-2.5 px-3 text-right rounded-r-lg font-mono">Costo Total MOD ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {MOD_MANTENIMIENTO_FLOTA_AGOSTO.desglosePorTipoEquipo.map((eq) => (
                    <tr key={eq.tipo} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-bold text-slate-800">{eq.tipo}</td>
                      <td className="py-2 px-3 text-center font-mono text-slate-700">{eq.trabajadores}</td>
                      <td className="py-2 px-3 text-right font-mono text-slate-700">{eq.totalHH} Hrs</td>
                      <td className="py-2 px-3 text-right font-mono text-slate-600">${Math.round(eq.tarifaPromedio).toLocaleString('de-DE')}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">{formatCurrency(eq.costoTotalMOD)}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-300">
                    <td className="py-3 px-3">TOTAL GENERAL MOD FLOTA</td>
                    <td className="py-3 px-3 text-center font-mono">27 Trabajadores</td>
                    <td className="py-3 px-3 text-right font-mono">4.697 Hrs</td>
                    <td className="py-3 px-3 text-right font-mono">$2,05 / hr</td>
                    <td className="py-3 px-3 text-right font-mono text-emerald-800 font-extrabold">$9.644 USD</td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}

      {/* PESTAÑA 6: MANTTO INFRAESTRUCTURA */}
      {subTab === 'infra' && (
        <div className="space-y-6">
          <div className="bg-white/95 rounded-2xl p-5 border border-slate-300/80 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-teal-600" />
                  <span>Mantenimiento de Infraestructura & Galpones (OPEX)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Agosto 2026: $40.545 USD (▼ 3% vs Julio) | Acumulado 2026: $359.823 USD.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold bg-teal-50 text-teal-800 border border-teal-200 px-3 py-1 rounded-lg">
                  1.145 HH · MOD: $2.127 USD
                </span>
              </div>
            </div>

            {/* Tabla de Cuentas Auxiliares de Infraestructura */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-800 text-white font-bold">
                    <th className="py-2.5 px-3 rounded-l-lg">Cuenta Auxiliar</th>
                    <th className="py-2.5 px-3">Proyecto / Galpón</th>
                    <th className="py-2.5 px-2 text-right">Ene</th>
                    <th className="py-2.5 px-2 text-right">Feb</th>
                    <th className="py-2.5 px-2 text-right">Mar</th>
                    <th className="py-2.5 px-2 text-right">Abr</th>
                    <th className="py-2.5 px-2 text-right">May</th>
                    <th className="py-2.5 px-2 text-right">Jun</th>
                    <th className="py-2.5 px-2 text-right">Jul</th>
                    <th className="py-2.5 px-2 text-right bg-teal-900 text-teal-200">Ago</th>
                    <th className="py-2.5 px-3 text-right rounded-r-lg font-mono">Total 2026 ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {MANTTO_INFRAESTRUCTURA_2026.cuentas.map((c) => (
                    <tr 
                      key={c.cuenta} 
                      onClick={() => handleAbrirDesglose(c.cuenta, c.descripcion, c.ago)}
                      className="hover:bg-teal-50/80 cursor-pointer transition-colors group"
                      title={`Hacer clic para ver el desglose analítico de ${c.descripcion}`}
                    >
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-teal-800">{c.cuenta}</span>
                          <Eye className="w-3.5 h-3.5 text-teal-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-800 group-hover:text-teal-950 flex items-center justify-between">
                        <span>{c.descripcion}</span>
                        <span className="text-[10px] text-teal-600 bg-teal-100 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity font-semibold">
                          Ver Desglose 🔍
                        </span>
                      </td>
                      <td className="py-2 px-2 text-right font-mono text-slate-600">{c.ene > 0 ? formatCurrency(c.ene) : '-'}</td>
                      <td className="py-2 px-2 text-right font-mono text-slate-600">{c.feb > 0 ? formatCurrency(c.feb) : '-'}</td>
                      <td className="py-2 px-2 text-right font-mono text-slate-600">{c.mar > 0 ? formatCurrency(c.mar) : '-'}</td>
                      <td className="py-2 px-2 text-right font-mono text-slate-600">{c.abr > 0 ? formatCurrency(c.abr) : '-'}</td>
                      <td className="py-2 px-2 text-right font-mono text-slate-600">{c.may > 0 ? formatCurrency(c.may) : '-'}</td>
                      <td className="py-2 px-2 text-right font-mono text-slate-600">{c.jun > 0 ? formatCurrency(c.jun) : '-'}</td>
                      <td className="py-2 px-2 text-right font-mono text-slate-600">{c.jul > 0 ? formatCurrency(c.jul) : '-'}</td>
                      <td className="py-2 px-2 text-right font-mono font-bold bg-teal-50 text-teal-900">{formatCurrency(c.ago)}</td>
                      <td className="py-2 px-3 text-right font-mono font-black text-slate-900">{formatCurrency(c.total)}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-300">
                    <td colSpan={2} className="py-3 px-3">TOTAL INFRAESTRUCTURA (OPEX)</td>
                    <td className="py-3 px-2 text-right font-mono">$145.197</td>
                    <td className="py-3 px-2 text-right font-mono">$50.329</td>
                    <td className="py-3 px-2 text-right font-mono">$20.149</td>
                    <td className="py-3 px-2 text-right font-mono">$25.926</td>
                    <td className="py-3 px-2 text-right font-mono">$20.031</td>
                    <td className="py-3 px-2 text-right font-mono">$15.748</td>
                    <td className="py-3 px-2 text-right font-mono">$41.898</td>
                    <td className="py-3 px-2 text-right font-mono bg-teal-100 text-teal-900">$40.545</td>
                    <td className="py-3 px-3 text-right font-mono text-teal-950 font-extrabold">$359.823</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Notas Explicativas */}
            <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1.5">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-teal-600" />
                <span>Auditoría de Variaciones en Infraestructura:</span>
              </div>
              {MANTTO_INFRAESTRUCTURA_2026.notasExplicativas.map((n, i) => (
                <p key={i} className="text-slate-600 pl-5 leading-relaxed">• {n}</p>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* ===================== MODAL DE DESGLOSE Y AUDITORÍA DE MONTOS ===================== */}
      {selectedActivoParaDesglose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-300 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-scale-up">
            
            {/* Header del Modal */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-5 flex items-start justify-between gap-4 border-b border-slate-700">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="font-mono text-xs font-black bg-sky-500/20 text-sky-300 border border-sky-400/30 px-2.5 py-0.5 rounded-lg">
                    {selectedActivoParaDesglose.codigo}
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 bg-slate-800 px-2.5 py-0.5 rounded-lg border border-slate-700">
                    {selectedActivoParaDesglose.tipo === 'CAPEX' ? 'Inversión en Activo Fijo (CAPEX)' :
                     selectedActivoParaDesglose.tipo === 'GRUA' ? 'Flota de Grúas TIMACA (OPEX)' :
                     selectedActivoParaDesglose.tipo === 'OPEX_FLOTA' ? 'Mantenimiento de Flota (OPEX)' :
                     selectedActivoParaDesglose.tipo === 'OPEX_INFRA' ? 'Infraestructura & Talleres (OPEX)' : 'Mano de Obra Directa (MOD)'}
                  </span>
                  {selectedActivoParaDesglose.variacionJulio && (
                    <span className={`text-[11px] font-black font-mono px-2 py-0.5 rounded-lg border ${
                      selectedActivoParaDesglose.variacionJulio.startsWith('+') 
                        ? 'bg-rose-950/80 text-rose-300 border-rose-800' 
                        : 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                    }`}>
                      {selectedActivoParaDesglose.variacionJulio} vs Julio
                    </span>
                  )}
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  <span>{selectedActivoParaDesglose.titulo}</span>
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  {selectedActivoParaDesglose.descripcionGeneral}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {selectedActivoParaDesglose.items.length > 0 && (
                  <button
                    onClick={() => handleDescargarDesgloseExcel(selectedActivoParaDesglose)}
                    className="p-2 sm:px-3 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    title="Exportar este desglose a archivo Excel"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Exportar Excel</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedActivoParaDesglose(null)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700"
                  title="Cerrar modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Fila de Tarjetas KPI */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-100/90 border-b border-slate-200 text-xs">
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <div className="text-[10px] uppercase font-bold text-slate-400">Total Ejecutado Agosto</div>
                <div className="text-lg font-black text-slate-900 font-mono mt-0.5">
                  {formatCurrency(selectedActivoParaDesglose.montoAgosto)}
                </div>
              </div>
              {selectedActivoParaDesglose.montoAcumulado2026 && (
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Acumulado Ene - Ago 2026</div>
                  <div className="text-lg font-black text-sky-900 font-mono mt-0.5">
                    {formatCurrency(selectedActivoParaDesglose.montoAcumulado2026)}
                  </div>
                </div>
              )}
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <div className="text-[10px] uppercase font-bold text-slate-400">Ítems Auditados</div>
                <div className="text-lg font-black text-indigo-900 font-mono mt-0.5">
                  {selectedActivoParaDesglose.items.length} Componentes
                </div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <div className="text-[10px] uppercase font-bold text-slate-400">Área Responsable</div>
                <div className="text-xs font-bold text-slate-800 mt-1 line-clamp-1" title={selectedActivoParaDesglose.responsableArea}>
                  {selectedActivoParaDesglose.responsableArea}
                </div>
              </div>
            </div>

            {/* Tabla Detallada de Materiales, Servicios y Mano de Obra */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-sky-600" />
                  <span>Desglose Analítico de Materiales, Piezas, Servicios y Despachos:</span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">
                  Conciliado con Comprobantes Oficiales SIP 2026
                </span>
              </div>

              {selectedActivoParaDesglose.items.length > 0 ? (
                <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-2xs">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-slate-800 text-white font-bold">
                        <th className="py-2.5 px-3">Código</th>
                        <th className="py-2.5 px-3">Descripción e Ítem Técnico</th>
                        <th className="py-2.5 px-2">Rubro / Categoría</th>
                        <th className="py-2.5 px-2 text-right">Cant.</th>
                        <th className="py-2.5 px-2 text-right">P. Unit ($)</th>
                        <th className="py-2.5 px-3 text-right bg-sky-900 text-sky-200 font-mono">Monto Total ($)</th>
                        <th className="py-2.5 px-3">Comprobante SIP</th>
                        <th className="py-2.5 px-3">Proveedor / Destino</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium bg-white">
                      {selectedActivoParaDesglose.items.map((item) => (
                        <tr key={item.id} className="hover:bg-sky-50/50">
                          <td className="py-2.5 px-3 font-mono font-bold text-sky-700">{item.codigo}</td>
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-slate-900">{item.descripcion}</div>
                            {item.especificacion && (
                              <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">{item.especificacion}</div>
                            )}
                            {item.motivo && (
                              <div className="text-[10px] text-sky-800 bg-sky-50 border border-sky-100 px-2 py-0.5 rounded mt-1 inline-block">
                                Motivo: {item.motivo}
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-2">
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                              {item.rubro || item.categoria}
                            </span>
                          </td>
                          <td className="py-2.5 px-2 text-right font-mono text-slate-700">
                            {item.cantidad ? `${formatNumber(item.cantidad)} ${item.unidadMedida || ''}` : '-'}
                          </td>
                          <td className="py-2.5 px-2 text-right font-mono text-slate-600">
                            {item.montoUnitario ? `$${formatNumber(item.montoUnitario)}` : '-'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900 bg-sky-50/50">
                            {formatCurrency(item.montoTotal)}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-mono text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded">
                              {item.comprobanteSIP || 'SIP-2026-REG'}
                            </span>
                            {item.fecha && <span className="block text-[10px] text-slate-400 mt-0.5">{item.fecha}</span>}
                          </td>
                          <td className="py-2.5 px-3 text-[11px] text-slate-600">
                            <div>{item.proveedor || 'Almacén Central TIMACA'}</div>
                            {item.solicitante && <div className="text-[10px] text-slate-400 mt-0.5">Sol: {item.solicitante}</div>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500">
                  <Info className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold">
                    El detalle específico de materiales para esta cuenta auxiliar se encuentra consolidado en el comprobante general de Planta.
                  </p>
                </div>
              )}
            </div>

            {/* Footer del Modal */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-mono text-[11px]">
                Auditoría Contable TIMACA · Conciliado al 100% con Almacén SIP y Nómina Taller
              </span>
              <button
                onClick={() => setSelectedActivoParaDesglose(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors cursor-pointer shadow-xs"
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
