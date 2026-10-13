import React, { useState, useEffect, useMemo } from 'react';
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
  DollarSign, 
  ShieldCheck, 
  ChevronRight, 
  Calendar, 
  Info,
  CheckCircle2,
  Cpu,
  Sparkles,
  ArrowRight,
  Eye,
  Download,
  X,
  Briefcase,
  AlertCircle,
  SlidersHorizontal,
  BarChart3,
  Check,
  RotateCcw
} from 'lucide-react';
import { 
  EVOLUTIVO_INTERNOS_2026, 
  TOTALES_ACUMULADOS_INTERNOS_2026, 
  CUENTAS_CAPEX_INTERNOS, 
  VARIACIONES_CAPEX_JUL_AGO,
  VARIACIONES_CAPEX_AGO_SEP,
  TOP_VOCES_CAPEX_AGOSTO,
  TOP_VOCES_CAPEX_SEPTIEMBRE,
  TOP_10_EQUIPOS_OPEX_AGOSTO,
  TOP_10_EQUIPOS_OPEX_SEPTIEMBRE,
  TIPOS_EQUIPOS_OPEX_MENSUAL,
  VOCES_GASTO_OPEX_FLOTA_AGOSTO,
  VOCES_GASTO_OPEX_FLOTA_SEPTIEMBRE,
  MOD_MANTENIMIENTO_FLOTA_AGOSTO,
  MANTTO_INFRAESTRUCTURA_2026,
  FLOTA_GRUAS_TIMACA_2026,
  EQUIPOS_NUEVOS_SEPTIEMBRE_2026,
  INTERVENCIONES_VIDA_UTIL_SEPTIEMBRE_2026,
  CUENTAS_ADMON_SEPTIEMBRE_2026
} from '../data/proyectosInternosData';
import { 
  getDesgloseInterno, 
  DetalleCuentaOActivo, 
  ItemDesgloseInterno 
} from '../data/desgloseDetalleInternos';
import { SALIDAS_REALES_SEPTIEMBRE_2026 } from '../data/realSalidasSeptiembre2026';
import { formatCurrency, formatNumber, formatUnitPriceRaw } from '../utils/dateHelpers';
import { UsuarioSistema } from '../types/usuarios';

export type SubTabInternos = 'resumen' | 'capex' | 'variaciones' | 'flota' | 'infra' | 'reclasificacion' | 'admon' | 'gruas' | 'mod';

interface DashboardInternosViewProps {
  onGoToPPT?: () => void;
  currentUser?: UsuarioSistema;
  activeSubTab?: 'resumen' | 'capex' | 'variaciones' | 'flota' | 'gruas' | 'mod' | 'infra';
  onSelectSubTab?: (tab: 'resumen' | 'capex' | 'variaciones' | 'flota' | 'gruas' | 'mod' | 'infra') => void;
}

export const DashboardInternosView: React.FC<DashboardInternosViewProps> = ({ 
  onGoToPPT,
  currentUser,
  activeSubTab,
  onSelectSubTab
}) => {
  const [subTab, setSubTab] = useState<SubTabInternos>(activeSubTab || 'resumen');
  // Mes 7 = Agosto (mes base de las diapositivas de referencia), Mes 8 = Septiembre (cierre con Master y reclasificación)
  const [selectedMesIdx, setSelectedMesIdx] = useState<number>(7); 
  const [modoReclasificadoSep, setModoReclasificadoSep] = useState<boolean>(true);
  const [incluirEquiposNuevosCapex, setIncluirEquiposNuevosCapex] = useState<boolean>(true);
  const [variacionPeriodo, setVariacionPeriodo] = useState<'jul-ago' | 'ago-sep'>('jul-ago');
  
  // Por defecto, solo el autobús Encava con motor diésel Cummins ($8.500) pasa a CAPEX. Los demás ("periquitos") quedan en OPEX Flota.
  const [idsVidaUtilActivos, setIdsVidaUtilActivos] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    INTERVENCIONES_VIDA_UTIL_SEPTIEMBRE_2026.forEach(item => {
      map[item.id] = item.activoPorDefecto;
    });
    return map;
  });
  
  const [selectedActivoParaDesglose, setSelectedActivoParaDesglose] = useState<DetalleCuentaOActivo | null>(null);

  useEffect(() => {
    if (activeSubTab && activeSubTab !== subTab) {
      setSubTab(activeSubTab);
    }
  }, [activeSubTab]);

  const handleTabChange = (newTab: SubTabInternos) => {
    setSubTab(newTab);
    if (newTab === 'resumen' || newTab === 'capex' || newTab === 'variaciones' || newTab === 'flota' || newTab === 'gruas' || newTab === 'mod' || newTab === 'infra') {
      onSelectSubTab?.(newTab);
    }
  };

  // Cálculo dinámico de la reclasificación OPEX Flota -> CAPEX en Septiembre 2026
  const totalEquiposNuevosSep = useMemo(() => {
    if (!incluirEquiposNuevosCapex) return 0;
    return EQUIPOS_NUEVOS_SEPTIEMBRE_2026.reduce((acc, eq) => acc + eq.totalSepUsd, 0);
  }, [incluirEquiposNuevosCapex]);

  const totalVidaUtilSep = useMemo(() => {
    return INTERVENCIONES_VIDA_UTIL_SEPTIEMBRE_2026.reduce((acc, item) => {
      return acc + (idsVidaUtilActivos[item.id] ? item.montoItemUsd : 0);
    }, 0);
  }, [idsVidaUtilActivos]);

  const montoReclasificadoSep = (selectedMesIdx === 8 && modoReclasificadoSep)
    ? (totalEquiposNuevosSep + totalVidaUtilSep)
    : 0;

  const toggleItemVidaUtil = (id: string) => {
    setIdsVidaUtilActivos(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const mesActivoRaw = EVOLUTIVO_INTERNOS_2026[selectedMesIdx] || EVOLUTIVO_INTERNOS_2026[7];
  const esSeptiembre = selectedMesIdx === 8;
  const esAgosto = selectedMesIdx === 7;

  // Montos efectivos del mes activo (aplicando reclasificación si estamos en Septiembre y el modo está activo)
  const capexEfectivoMes = mesActivoRaw.capex + (esSeptiembre ? montoReclasificadoSep : 0);
  const opexFlotaEfectivoMes = Math.max(0, mesActivoRaw.opexActivos - (esSeptiembre ? montoReclasificadoSep : 0));
  const opexInfraEfectivoMes = mesActivoRaw.opexInfraestructura;
  const admonEfectivoMes = mesActivoRaw.admon || 0;
  const totalOpexEfectivoMes = opexFlotaEfectivoMes + opexInfraEfectivoMes;
  const totalGeneralSinAdmon = capexEfectivoMes + totalOpexEfectivoMes;
  const totalGeneralConAdmonMes = totalGeneralSinAdmon + admonEfectivoMes;

  const formatExact = (val: number) => {
    return '$' + val.toLocaleString('de-DE', { minimumFractionDigits: val % 1 !== 0 ? 2 : 0, maximumFractionDigits: 2 });
  };

  const formatSinDecimales = (val: number) => {
    return '$' + Math.round(val).toLocaleString('de-DE');
  };

  // Apertura de desglose con lectura directa de datos
  const handleAbrirDesglose = (codigo: string, tituloFallback?: string, montoFallback?: number) => {
    if (esSeptiembre) {
      const registrosSep = SALIDAS_REALES_SEPTIEMBRE_2026.filter(r => 
        r.cuentaAuxiliarCodigo === codigo || 
        r.cuentaAuxiliarCodigo.endsWith(`-${codigo}`) ||
        (codigo === 'GR23' && r.cuentaAuxiliarCodigo.includes('GR23')) ||
        (codigo === 'BS03' && r.cuentaAuxiliarCodigo.includes('BS03')) ||
        (codigo === 'BS15' && r.cuentaAuxiliarCodigo.includes('BS15'))
      );
      if (registrosSep.length > 0) {
        const itemsSep: ItemDesgloseInterno[] = registrosSep
          .sort((a, b) => b.montoTotal - a.montoTotal)
          .map((r, i) => ({
            id: r.id || `SEP-${codigo}-${i}`,
            codigo: r.codigoSalida || `SEP-${i + 1}`,
            descripcion: r.itemDescripcion,
            especificacion: `${r.proyecto || r.cuentaAuxiliarNombre}`,
            categoria: (r.tipo as ItemDesgloseInterno['categoria']) || 'Materiales Directos',
            rubro: r.categoria || r.subcategoria,
            cantidad: r.cantidad,
            unidadMedida: r.unidad,
            montoUnitario: r.precioUnitario,
            montoTotal: r.montoTotal,
            comprobanteSIP: r.codigoSalida,
            fecha: r.fecha,
            solicitante: r.solicitante,
            motivo: r.observaciones
          }));

        setSelectedActivoParaDesglose({
          codigo,
          titulo: tituloFallback || `Cuenta ${codigo} - Septiembre 2026`,
          descripcionGeneral: `Desglose de compras y despachos de almacén registrados en Septiembre 2026.`,
          responsableArea: 'Auditoría Almacén & Proyectos',
          montoAgosto: itemsSep.reduce((acc, it) => acc + it.montoTotal, 0),
          items: itemsSep
        });
        return;
      }
    }

    const detalle = getDesgloseInterno(codigo);
    if (detalle) {
      setSelectedActivoParaDesglose(detalle);
    } else {
      setSelectedActivoParaDesglose({
        codigo,
        titulo: tituloFallback || `Detalle ${codigo}`,
        descripcionGeneral: `Información de auditoría contable para ${codigo}.`,
        responsableArea: 'Gestión de Costos TIMACA',
        montoAgosto: montoFallback || 0,
        items: []
      });
    }
  };

  const handleDescargarDesgloseExcel = (detalle: DetalleCuentaOActivo) => {
    const data = detalle.items.map((item, idx) => ({
      '#': idx + 1,
      'Comprobante': item.comprobanteSIP || item.codigo,
      'Fecha': item.fecha || '',
      'Descripción': item.descripcion,
      'Especificación': item.especificacion || '',
      'Categoría': item.categoria,
      'Rubro': item.rubro || '',
      'Cantidad': item.cantidad || '',
      'Unidad': item.unidadMedida === 'USE' ? 'SERV' : (item.unidadMedida || ''),
      'Precio Unitario ($)': item.montoUnitario || '',
      'Total USD ($)': item.montoTotal,
      'Solicitante': item.solicitante || '',
      'Motivo Operativo': item.motivo || ''
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Desglose');
    XLSX.writeFile(wb, `Desglose_${detalle.codigo}_${mesActivoRaw.mesLabel}2026.xlsx`);
  };

  const pctCapex = totalGeneralSinAdmon > 0 ? Math.round((capexEfectivoMes / totalGeneralSinAdmon) * 100) : 0;
  const pctFlota = totalGeneralSinAdmon > 0 ? Math.round((opexFlotaEfectivoMes / totalGeneralSinAdmon) * 100) : 0;
  const pctInfra = totalGeneralSinAdmon > 0 ? Math.round((opexInfraEfectivoMes / totalGeneralSinAdmon) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in text-slate-800 bg-slate-50/60 p-1 sm:p-2 rounded-2xl">
      
      {/* ========================================================================= */}
      {/* 1. HEADER CORPORATIVO EJECUTIVO (CLARO, ELEGANTE Y PROFESIONAL)          */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0f2e5a] via-sky-600 to-[#0f2e5a]" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0f2e5a]/10 text-[#0f2e5a] text-xs font-bold tracking-wide">
                <span className="w-2 h-2 rounded-full bg-[#0f2e5a]" />
                GESTIÓN DE COSTOS INTERNOS · TIMACA 2026
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                Mes Base: <strong className="text-slate-900 ml-1">{mesActivoRaw.mesLabel} 2026</strong>
              </span>
              {esSeptiembre && modoReclasificadoSep && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  Solo Motor Bus Encava ($8.500) en CAPEX · Demás en OPEX
                </span>
              )}
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black text-[#0f2e5a] tracking-tight">
              Proyectos Internos, Flota & Infraestructura
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-4xl leading-relaxed">
              Consolidación ejecutiva oficial (CAPEX · OPEX Activos Productivos · OPEX Infraestructura · Administrativo).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => handleTabChange('reclasificacion')}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-[#0f2e5a] font-bold text-xs border border-slate-300 shadow-2xs hover:shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4 text-sky-600" />
              <span>Criterio Vida Útil / Equipos</span>
            </button>
            {onGoToPPT && (
              <button
                onClick={onGoToPPT}
                className="px-4 py-2.5 rounded-xl bg-[#0f2e5a] hover:bg-[#163a6f] text-white font-bold text-xs shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer group"
              >
                <FileText className="w-4 h-4 text-sky-300" />
                <span>Presentación PPT</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}
          </div>
        </div>

        {/* Barra de Navegación por Pestañas (Estructura de las 5 Láminas) */}
        <div className="pt-4 mt-4 border-t border-slate-200 flex flex-wrap items-center gap-2 text-xs">
          {[
            { id: 'resumen', label: '1. Resumen Ejecutivo (Introducción)', icon: BarChart3 },
            { id: 'capex', label: '2. Proyectos Internos – CAPEX', icon: Building2 },
            { id: 'variaciones', label: '3. Variación Por Proyecto', icon: TrendingUp },
            { id: 'flota', label: '4. Mantto. Activos Prod. (OPEX Flota)', icon: Truck },
            { id: 'infra', label: '5. Mantto. Infraestructura (OPEX)', icon: Wrench },
            { id: 'reclasificacion', label: '6. Cierre Sep & Reclasificación', icon: SlidersHorizontal },
            { id: 'admon', label: '7. Administrativo ($31,3k)', icon: Briefcase },
            { id: 'gruas', label: '8. Flota 26 Grúas', icon: Cpu },
            { id: 'mod', label: '9. Mano de Obra (MOD)', icon: Clock },
          ].map((t) => {
            const Icon = t.icon;
            const isAct = subTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => handleTabChange(t.id as SubTabInternos)}
                className={`px-3 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isAct
                    ? 'bg-[#0f2e5a] text-white shadow-sm ring-1 ring-[#0f2e5a]'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isAct ? 'text-sky-300' : 'text-slate-500'}`} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SELECTOR DE MES Y VISTA CONTABLE (CON ACCESO DIRECTO A AGOSTO Y SEP)   */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mr-1">
            <Calendar className="w-4 h-4 text-[#0f2e5a]" />
            <span>Mes a Visualizar:</span>
          </div>
          <div className="flex items-center gap-1 overflow-x-auto">
            {EVOLUTIVO_INTERNOS_2026.map((m, idx) => {
              const isSelected = selectedMesIdx === idx;
              return (
                <button
                  key={m.mesCorto}
                  onClick={() => setSelectedMesIdx(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#0f2e5a] text-white shadow-2xs ring-2 ring-sky-400'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  {m.mesCorto}
                  {idx === 7 && <span className="ml-1 text-[9px] bg-sky-200 text-[#0f2e5a] px-1 rounded font-bold">LÁMINAS</span>}
                  {idx === 8 && <span className="ml-1 text-[9px] bg-emerald-200 text-emerald-950 px-1 rounded font-bold">CIERRE</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Switch Interactivo Contable para Septiembre */}
        {esSeptiembre && (
          <div className="flex flex-wrap items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
            <span className="font-bold text-slate-600 text-[11px]">Criterio Sep:</span>
            <button
              onClick={() => setModoReclasificadoSep(false)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                !modoReclasificadoSep
                  ? 'bg-slate-800 text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Base Master Original ($34.930 CAPEX)
            </button>
            <button
              onClick={() => setModoReclasificadoSep(true)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                modoReclasificadoSep
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-white text-emerald-800 hover:bg-emerald-50 border border-emerald-300'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>Con Reclasificación (CAPEX {formatExact(capexEfectivoMes)} | Flota {formatExact(opexFlotaEfectivoMes)})</span>
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SUB-PESTAÑA 1: RESUMEN EJECUTIVO (IDÉNTICO A LA LÁMINA 1)                 */}
      {/* ========================================================================= */}
      {subTab === 'resumen' && (
        <div className="space-y-6">
          
          {/* TÍTULO EJECUTIVO DE LA LÁMINA */}
          <div className="flex items-baseline justify-between border-b border-slate-200 pb-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Resumen Ejecutivo – {mesActivoRaw.mesLabel} 2026
            </h2>
            <span className="text-xs text-slate-500 font-semibold">
              Cifras expresadas en Dólares Estadounidenses ($ USD)
            </span>
          </div>

          {/* 5 TARJETAS KPI CON EL RIBETE AZUL MARINO DE LA LÁMINA 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            
            {/* KPI 1: CAPEX */}
            <div 
              onClick={() => handleTabChange('capex')}
              className="bg-white rounded-xl border border-slate-300 shadow-2xs hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between overflow-hidden group"
            >
              <div className="h-1.5 bg-[#0f2e5a]" />
              <div className="p-4 text-center flex-1 flex flex-col justify-between">
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-tight">
                  PROYECTOS INTERNOS (CAPEX)
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono my-2">
                  {esAgosto ? '$29.017' : formatExact(capexEfectivoMes)}
                </div>
                <div className="text-xs font-bold text-slate-600 flex items-center justify-center gap-1">
                  {esAgosto ? (
                    <>
                      <span className="text-slate-800">▼ 36%</span>
                      <span className="text-slate-500 font-normal">vs Julio</span>
                    </>
                  ) : esSeptiembre ? (
                    <>
                      <span className="text-emerald-700">▲ +20,4%</span>
                      <span className="text-slate-500 font-normal">vs Agosto</span>
                    </>
                  ) : (
                    <span className="text-slate-500 font-normal">Gasto mensual</span>
                  )}
                </div>
              </div>
            </div>

            {/* KPI 2: OPEX ACTIVOS PRODUCTIVOS */}
            <div 
              onClick={() => handleTabChange('flota')}
              className="bg-white rounded-xl border border-slate-300 shadow-2xs hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between overflow-hidden group"
            >
              <div className="h-1.5 bg-[#0f2e5a]" />
              <div className="p-4 text-center flex-1 flex flex-col justify-between">
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-tight">
                  MANTTO. ACTIVOS. PROD (OPEX)
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono my-2">
                  {esAgosto ? '$113.450' : formatExact(opexFlotaEfectivoMes)}
                </div>
                <div className="text-xs font-bold text-slate-600 flex items-center justify-center gap-1">
                  {esAgosto ? (
                    <>
                      <span className="text-slate-800">▲ 16%</span>
                      <span className="text-slate-500 font-normal">vs Julio</span>
                    </>
                  ) : esSeptiembre ? (
                    <>
                      <span className="text-emerald-700">▼ 26,2%</span>
                      <span className="text-slate-500 font-normal">vs Agosto</span>
                    </>
                  ) : (
                    <span className="text-slate-500 font-normal">Flota & Equipos</span>
                  )}
                </div>
              </div>
            </div>

            {/* KPI 3: OPEX INFRAESTRUCTURA */}
            <div 
              onClick={() => handleTabChange('infra')}
              className="bg-white rounded-xl border border-slate-300 shadow-2xs hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between overflow-hidden group"
            >
              <div className="h-1.5 bg-[#0f2e5a]" />
              <div className="p-4 text-center flex-1 flex flex-col justify-between">
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-tight">
                  MANTTO. INFRAESTRUCTURA (OPEX)
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono my-2">
                  {esAgosto ? '$40.545' : formatExact(opexInfraEfectivoMes)}
                </div>
                <div className="text-xs font-bold text-slate-600 flex items-center justify-center gap-1">
                  {esAgosto ? (
                    <>
                      <span className="text-slate-800">▼ 3%</span>
                      <span className="text-slate-500 font-normal">vs Julio</span>
                    </>
                  ) : esSeptiembre ? (
                    <>
                      <span className="text-rose-700">▲ 2,9%</span>
                      <span className="text-slate-500 font-normal">vs Agosto</span>
                    </>
                  ) : (
                    <span className="text-slate-500 font-normal">Galpones & Talleres</span>
                  )}
                </div>
              </div>
            </div>

            {/* KPI 4: TOTAL OPEX */}
            <div className="bg-white rounded-xl border border-slate-300 shadow-2xs flex flex-col justify-between overflow-hidden">
              <div className="h-1.5 bg-[#0f2e5a]" />
              <div className="p-4 text-center flex-1 flex flex-col justify-between">
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-tight">
                  TOTAL OPEX
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono my-2">
                  {esAgosto ? '$153.995' : formatExact(totalOpexEfectivoMes)}
                </div>
                <div className="text-xs font-bold text-slate-600 flex items-center justify-center gap-1">
                  {esAgosto ? (
                    <>
                      <span className="text-slate-800">▲ 10%</span>
                      <span className="text-slate-500 font-normal">vs Julio</span>
                    </>
                  ) : esSeptiembre ? (
                    <>
                      <span className="text-emerald-700">▼ 18,5%</span>
                      <span className="text-slate-500 font-normal">vs Agosto</span>
                    </>
                  ) : (
                    <span className="text-slate-500 font-normal">Flota + Infra</span>
                  )}
                </div>
              </div>
            </div>

            {/* KPI 5: TOTAL DEL MES */}
            <div className="bg-white rounded-xl border border-slate-300 shadow-2xs flex flex-col justify-between overflow-hidden">
              <div className="h-1.5 bg-[#0f2e5a]" />
              <div className="p-4 text-center flex-1 flex flex-col justify-between">
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-tight">
                  TOTAL {mesActivoRaw.mesCorto.toUpperCase()}
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono my-2">
                  {esAgosto ? '$183.013' : formatExact(totalGeneralSinAdmon)}
                </div>
                <div className="text-xs font-bold text-slate-600 flex items-center justify-center gap-1">
                  {esAgosto ? (
                    <>
                      <span className="text-slate-800">▼ 1%</span>
                      <span className="text-slate-500 font-normal">vs Julio</span>
                    </>
                  ) : esSeptiembre ? (
                    <>
                      <span className="text-emerald-700">▼ 12,4%</span>
                      <span className="text-slate-500 font-normal">vs Agosto</span>
                    </>
                  ) : (
                    <span className="text-slate-500 font-normal">CAPEX + OPEX</span>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* ===================================================================== */}
          {/* GRÁFICAS DE LA LÁMINA 1: EVOLUTIVO GENERAL Y DISTRIBUCIÓN CAPEX/OPEX  */}
          {/* ===================================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* EVOLUTIVO GENERAL (CURVA SVG SUAVE CON 3 LÍNEAS) */}
            <div className="lg:col-span-8 bg-white rounded-2xl p-5 border border-slate-300/90 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  EVOLUTIVO GENERAL
                </h3>
                <span className="text-xs font-semibold text-slate-400">Enero – Septiembre 2026</span>
              </div>

              {/* GRÁFICO SVG PROFESIONAL Y NÍTIDO */}
              <div className="relative w-full h-64 mt-2">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 650 200" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="gradCapex" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0f4c81" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#0f4c81" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Líneas de cuadrícula horizontales tenues */}
                  <line x1="40" y1="30" x2="630" y2="30" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="40" y1="80" x2="630" y2="80" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="40" y1="130" x2="630" y2="130" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="40" y1="170" x2="630" y2="170" stroke="#e2e8f0" strokeWidth="1" />

                  {/* Línea 1: Proyectos Internos (CAPEX) - Curva Azul Petróleo Oscuro (#0f4c81) */}
                  {/* Puntos: Ene (162k), Feb (326k-pico), Mar (149k), Abr (92k), May (77k), Jun (32k), Jul (45k), Ago (29k), Sep (35k) */}
                  <path
                    d="M 50 110 C 80 80, 100 25, 120 25 C 145 25, 170 100, 190 115 C 220 135, 240 148, 260 152 C 290 158, 310 162, 330 165 C 360 170, 380 183, 400 185 C 430 186, 450 178, 470 176 C 500 174, 520 186, 540 187 C 570 188, 590 183, 610 182"
                    fill="none"
                    stroke="#0f4c81"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  {/* Marcadores circulares CAPEX */}
                  <circle cx="50" cy="110" r="4" fill="#0f4c81" />
                  <circle cx="120" cy="25" r="4.5" fill="#0f4c81" />
                  <circle cx="190" cy="115" r="4" fill="#0f4c81" />
                  <circle cx="260" cy="152" r="4" fill="#0f4c81" />
                  <circle cx="330" cy="165" r="4" fill="#0f4c81" />
                  <circle cx="400" cy="185" r="4" fill="#0f4c81" />
                  <circle cx="470" cy="176" r="4" fill="#0f4c81" />
                  <circle cx="540" cy="187" r="4" fill="#0f4c81" />
                  <circle cx="610" cy="182" r="4" fill="#0f4c81" />

                  {/* Línea 2: Mantto. Activos Productivos (OPEX) - Curva Azul Celeste (#38bdf8 / #0284c7) */}
                  {/* Puntos: Ene (143k), Feb (102k), Mar (83k), Abr (59k), May (68k), Jun (72k), Jul (97k), Ago (113k), Sep (83k) */}
                  <path
                    d="M 50 120 C 80 135, 100 145, 120 148 C 145 151, 170 158, 190 160 C 220 163, 240 173, 260 174 C 290 175, 310 170, 330 169 C 360 168, 380 167, 400 166 C 430 165, 450 152, 470 150 C 500 148, 520 142, 540 140 C 570 138, 590 156, 610 157"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  {/* Marcadores circulares Activos */}
                  <circle cx="50" cy="120" r="4" fill="#38bdf8" />
                  <circle cx="120" cy="148" r="4" fill="#38bdf8" />
                  <circle cx="190" cy="160" r="4" fill="#38bdf8" />
                  <circle cx="260" cy="174" r="4" fill="#38bdf8" />
                  <circle cx="330" cy="169" r="4" fill="#38bdf8" />
                  <circle cx="400" cy="166" r="4" fill="#38bdf8" />
                  <circle cx="470" cy="150" r="4" fill="#38bdf8" />
                  <circle cx="540" cy="140" r="4" fill="#38bdf8" />
                  <circle cx="610" cy="157" r="4" fill="#38bdf8" />

                  {/* Línea 3: Mantto. Infraestructura (OPEX) - Curva Gris / Slate (#94a3b8) */}
                  {/* Puntos: Ene (145k), Feb (50k), Mar (20k), Abr (25k), May (20k), Jun (15k), Jul (41k), Ago (40k), Sep (41k) */}
                  <path
                    d="M 50 118 C 80 150, 100 174, 120 175 C 145 176, 170 189, 190 190 C 220 191, 240 188, 260 187 C 290 186, 310 189, 330 190 C 360 191, 380 192, 400 192 C 430 192, 450 178, 470 178 C 500 178, 520 180, 540 180 C 570 180, 590 179, 610 179"
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  {/* Marcadores circulares Infra */}
                  <circle cx="50" cy="118" r="4" fill="#94a3b8" />
                  <circle cx="120" cy="175" r="4" fill="#94a3b8" />
                  <circle cx="190" cy="190" r="4" fill="#94a3b8" />
                  <circle cx="260" cy="187" r="4" fill="#94a3b8" />
                  <circle cx="330" cy="190" r="4" fill="#94a3b8" />
                  <circle cx="400" cy="192" r="4" fill="#94a3b8" />
                  <circle cx="470" cy="178" r="4" fill="#94a3b8" />
                  <circle cx="540" cy="180" r="4" fill="#94a3b8" />
                  <circle cx="610" cy="179" r="4" fill="#94a3b8" />

                  {/* Etiquetas de meses en el eje X */}
                  {['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep'].map((m, idx) => {
                    const xPositions = [50, 120, 190, 260, 330, 400, 470, 540, 610];
                    return (
                      <text
                        key={m}
                        x={xPositions[idx]}
                        y="198"
                        textAnchor="middle"
                        className="text-[10px] font-bold fill-slate-500 font-sans"
                      >
                        {m}
                      </text>
                    );
                  })}
                </svg>
              </div>

              {/* Leyenda idéntica a la Lámina 1 */}
              <div className="flex flex-wrap items-center justify-center gap-6 mt-4 pt-3 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-1 bg-[#0f4c81] rounded-full inline-block" />
                  <span className="w-2 h-2 rounded-full bg-[#0f4c81] -ml-3.5 inline-block" />
                  <span className="text-slate-700 font-medium ml-1">Proyectos Internos (CAPEX)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-1 bg-[#38bdf8] rounded-full inline-block" />
                  <span className="w-2 h-2 rounded-full bg-[#38bdf8] -ml-3.5 inline-block" />
                  <span className="text-slate-700 font-medium ml-1">Mantto. Activos Productivos (OPEX)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-1 bg-[#94a3b8] rounded-full inline-block" />
                  <span className="w-2 h-2 rounded-full bg-[#94a3b8] -ml-3.5 inline-block" />
                  <span className="text-slate-700 font-medium ml-1">Mantto. Infraestructura (OPEX)</span>
                </div>
              </div>
            </div>

            {/* DISTRIBUCIÓN CAPEX Y OPEX (GRÁFICO CIRCULAR DE LA LÁMINA 1) */}
            <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-300/90 shadow-2xs flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-2">
                  DISTRIBUCIÓN CAPEX Y OPEX – {mesActivoRaw.mesCorto.toUpperCase()}
                </h3>

                {/* Gráfico circular con proporciones de Agosto (16% CAPEX, 62% Flota, 22% Infra) */}
                <div className="flex flex-col items-center justify-center py-4">
                  <div className="relative w-48 h-48">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                      {/* Segmento 1: CAPEX (16%) -> Color #0f4c81 */}
                      <circle
                        cx="50"
                        cy="50"
                        r="35"
                        fill="transparent"
                        stroke="#0f4c81"
                        strokeWidth="30"
                        strokeDasharray={`${pctCapex * 2.2} 220`}
                        strokeDashoffset="0"
                      />
                      {/* Segmento 2: Flota (62%) -> Color #38bdf8 */}
                      <circle
                        cx="50"
                        cy="50"
                        r="35"
                        fill="transparent"
                        stroke="#38bdf8"
                        strokeWidth="30"
                        strokeDasharray={`${pctFlota * 2.2} 220`}
                        strokeDashoffset={`-${pctCapex * 2.2}`}
                      />
                      {/* Segmento 3: Infra (22%) -> Color #94a3b8 */}
                      <circle
                        cx="50"
                        cy="50"
                        r="35"
                        fill="transparent"
                        stroke="#94a3b8"
                        strokeWidth="30"
                        strokeDasharray={`${pctInfra * 2.2} 220`}
                        strokeDashoffset={`-${(pctCapex + pctFlota) * 2.2}`}
                      />
                    </svg>

                    {/* Etiquetas de porcentaje flotantes */}
                    <div className="absolute top-6 right-8 text-white font-bold text-xs drop-shadow-sm">
                      {pctCapex}%
                    </div>
                    <div className="absolute bottom-6 right-12 text-white font-bold text-sm drop-shadow-sm">
                      {pctFlota}%
                    </div>
                    <div className="absolute top-10 left-8 text-white font-bold text-xs drop-shadow-sm">
                      {pctInfra}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Leyenda lateral con colores corporativos */}
              <div className="space-y-2 text-xs pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-xs bg-[#0f4c81] shrink-0" />
                    <span className="text-slate-700 font-medium">Proyectos Internos (CAPEX)</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900">{formatExact(capexEfectivoMes)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-xs bg-[#38bdf8] shrink-0" />
                    <span className="text-slate-700 font-medium">Mantto. Activos Productivos (OPEX)</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900">{formatExact(opexFlotaEfectivoMes)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-xs bg-[#94a3b8] shrink-0" />
                    <span className="text-slate-700 font-medium">Mantto. Infraestructura (OPEX)</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900">{formatExact(opexInfraEfectivoMes)}</span>
                </div>
              </div>
            </div>

          </div>

          {/* ===================================================================== */}
          {/* TABLA MENSUAL EXACTA DE LA LÁMINA 1 (CON ENCABEZADO AZUL MARINO)     */}
          {/* ===================================================================== */}
          <div className="bg-white rounded-2xl border border-slate-300 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-[#0f2e5a] text-white font-bold">
                    <th className="py-2.5 px-4 text-left font-semibold">Descripción</th>
                    <th className="py-2.5 px-3 text-right">Ene</th>
                    <th className="py-2.5 px-3 text-right">Feb</th>
                    <th className="py-2.5 px-3 text-right">Mar</th>
                    <th className="py-2.5 px-3 text-right">Abr</th>
                    <th className="py-2.5 px-3 text-right">May</th>
                    <th className="py-2.5 px-3 text-right">Jun</th>
                    <th className="py-2.5 px-3 text-right">Jul</th>
                    <th className="py-2.5 px-3 text-right">Ago</th>
                    <th className="py-2.5 px-3 text-right bg-[#163a6f] text-sky-200">Sep</th>
                    <th className="py-2.5 px-4 text-right font-mono bg-[#0c2447]">Acum. 2026 ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {/* Fila 1: CAPEX */}
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-semibold text-slate-900">
                      Proyectos Internos (CAPEX)
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700">162.467</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700">326.380</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700">149.039</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700">92.865</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700">77.901</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700">32.585</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700">45.087</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700 font-bold">29.017</td>
                    <td className="py-2.5 px-3 text-right font-mono text-sky-950 font-bold bg-sky-50">
                      {Math.round(capexEfectivoMes).toLocaleString('de-DE')}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900 bg-slate-50">
                      {Math.round(915341 + (esSeptiembre ? capexEfectivoMes : 0)).toLocaleString('de-DE')}
                    </td>
                  </tr>

                  {/* Fila 2: OPEX Activos Productivos */}
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-semibold text-slate-900">
                      Mantto. Activos Productivos (OPEX)
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700">143.581</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700">102.274</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700">83.194</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700">59.543</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700">68.409</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700">72.213</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700">97.727</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700 font-bold">113.450</td>
                    <td className="py-2.5 px-3 text-right font-mono text-indigo-950 font-bold bg-indigo-50">
                      {Math.round(opexFlotaEfectivoMes).toLocaleString('de-DE')}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900 bg-slate-50">
                      {Math.round(740391 + (esSeptiembre ? opexFlotaEfectivoMes : 0)).toLocaleString('de-DE')}
                    </td>
                  </tr>

                  {/* Fila 3: Mantto Infraestructura */}
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-semibold text-slate-900">
                      Mantto. Infraestructura (OPEX)
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700">145.197</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700">50.329</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700">20.149</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700">25.926</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700">20.031</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700">15.748</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700">41.898</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700 font-bold">40.545</td>
                    <td className="py-2.5 px-3 text-right font-mono text-teal-950 font-bold bg-teal-50">
                      {Math.round(opexInfraEfectivoMes).toLocaleString('de-DE')}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900 bg-slate-50">
                      {Math.round(359823 + (esSeptiembre ? opexInfraEfectivoMes : 0)).toLocaleString('de-DE')}
                    </td>
                  </tr>

                  {/* Fila Total */}
                  <tr className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-300">
                    <td className="py-3 px-4 font-bold">Total</td>
                    <td className="py-3 px-3 text-right font-mono">451.244</td>
                    <td className="py-3 px-3 text-right font-mono">478.983</td>
                    <td className="py-3 px-3 text-right font-mono">252.382</td>
                    <td className="py-3 px-3 text-right font-mono">178.334</td>
                    <td className="py-3 px-3 text-right font-mono">166.341</td>
                    <td className="py-3 px-3 text-right font-mono">120.546</td>
                    <td className="py-3 px-3 text-right font-mono">184.712</td>
                    <td className="py-3 px-3 text-right font-mono">183.013</td>
                    <td className="py-3 px-3 text-right font-mono bg-sky-100 text-sky-950">
                      {Math.round(totalGeneralSinAdmon).toLocaleString('de-DE')}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-[#0f2e5a] bg-slate-200">
                      {Math.round(2015555 + (esSeptiembre ? totalGeneralSinAdmon : 0)).toLocaleString('de-DE')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-PESTAÑA 2: PROYECTOS INTERNOS – CAPEX (IDÉNTICO A LA LÁMINA 2)        */}
      {/* ========================================================================= */}
      {subTab === 'capex' && (
        <div className="space-y-6">
          
          <div className="flex items-baseline justify-between border-b border-slate-200 pb-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Proyectos Internos – CAPEX {mesActivoRaw.mesLabel} 2026
            </h2>
            <span className="text-xs text-slate-500 font-semibold">
              Obras civiles, infraestructura, galpones y bancos de prueba
            </span>
          </div>

          {/* 3 KPI CARDS DE LA LÁMINA 2 CON RIBETE AZUL MARINO */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            <div className="bg-white rounded-xl border border-slate-300 shadow-2xs overflow-hidden flex flex-col justify-between">
              <div className="h-1.5 bg-[#0f2e5a]" />
              <div className="p-5 text-center flex-1 flex flex-col justify-between">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-tight">
                  TOTAL {mesActivoRaw.mesCorto.toUpperCase()}
                </div>
                <div className="text-3xl sm:text-4xl font-black text-slate-900 font-mono my-2">
                  {esAgosto ? '$29.017' : formatExact(capexEfectivoMes)}
                </div>
                <div className="text-xs font-medium text-slate-600">
                  {esAgosto ? '▼ 36% vs Julio ($45.087)' : '▲ +20,4% vs Agosto ($29.017)'}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-300 shadow-2xs overflow-hidden flex flex-col justify-between">
              <div className="h-1.5 bg-[#0f2e5a]" />
              <div className="p-5 text-center flex-1 flex flex-col justify-between">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-tight">
                  TOTAL ACUMULADO 2026
                </div>
                <div className="text-3xl sm:text-4xl font-black text-slate-900 font-mono my-2">
                  {esAgosto ? '$915.341' : formatExact(950271.43 + (modoReclasificadoSep ? montoReclasificadoSep : 0))}
                </div>
                <div className="text-xs font-medium text-slate-500">
                  Enero - {mesActivoRaw.mesLabel} 2026
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-300 shadow-2xs overflow-hidden flex flex-col justify-between">
              <div className="h-1.5 bg-[#0f2e5a]" />
              <div className="p-5 text-center flex-1 flex flex-col justify-between">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-tight">
                  PROYECTO CON MAYOR GASTO {mesActivoRaw.mesCorto.toUpperCase()}
                </div>
                <div className="text-2xl sm:text-3xl font-black text-[#0f2e5a] font-mono my-2">
                  {esAgosto ? 'TTI-C-0095' : 'TSI-T-0108'}
                </div>
                <div className="text-xs font-medium text-slate-600">
                  {esAgosto 
                    ? '▼ 38% vs Julio ($21.319) · Edif. Administrativo' 
                    : '▲ +141% vs Agosto ($5.596) · Construcción Galpones ($13.498,06)'}
                </div>
              </div>
            </div>

          </div>

          {/* EVOLUTIVO PROYECTOS INTERNOS (CURVA CON ETIQUETAS FLOTANTES SOBRE CADA PUNTO) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-300/90 shadow-2xs">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider text-center mb-1">
              EVOLUTIVO PROYECTOS INTERNOS
            </h3>
            
            <div className="relative w-full h-56 mt-4">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 650 170" preserveAspectRatio="none">
                {/* Cuadrícula tenue */}
                <line x1="30" y1="140" x2="620" y2="140" stroke="#e2e8f0" strokeWidth="1" />

                {/* Curva Suave Azul Petróleo */}
                <path
                  d="M 50 80 C 80 50, 100 15, 120 15 C 145 15, 170 75, 190 90 C 220 110, 240 120, 260 125 C 290 130, 310 134, 330 135 C 360 138, 380 148, 400 150 C 430 151, 450 140, 470 139 C 500 138, 520 150, 540 152 C 570 153, 590 145, 610 144"
                  fill="none"
                  stroke="#0f4c81"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* Marcadores circulares y etiquetas numéricas arriba de cada punto */}
                {[
                  { x: 50, y: 80, val: '162.467', mes: 'ENE' },
                  { x: 120, y: 15, val: '326.380', mes: 'FEB' },
                  { x: 190, y: 90, val: '149.039', mes: 'MAR' },
                  { x: 260, y: 125, val: '92.865', mes: 'ABR' },
                  { x: 330, y: 135, val: '77.901', mes: 'MAY' },
                  { x: 400, y: 150, val: '32.585', mes: 'JUN' },
                  { x: 470, y: 139, val: '45.087', mes: 'JUL' },
                  { x: 540, y: 152, val: '29.017', mes: 'AGO' },
                  { x: 610, y: 144, val: esSeptiembre ? (modoReclasificadoSep ? Math.round(capexEfectivoMes).toLocaleString('de-DE') : '34.930') : '34.930', mes: 'SEP' }
                ].map((pt) => (
                  <g key={pt.mes}>
                    <circle cx={pt.x} cy={pt.y} r="4.5" fill="#0f4c81" />
                    <text
                      x={pt.x}
                      y={pt.y - 10}
                      textAnchor="middle"
                      className="text-[10px] font-bold fill-slate-700 font-mono"
                    >
                      {pt.val}
                    </text>
                    <text
                      x={pt.x}
                      y="160"
                      textAnchor="middle"
                      className="text-[10px] font-bold fill-slate-500 font-sans"
                    >
                      {pt.mes}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>

          {/* TABLA OFICIAL DE CUENTAS AUXILIARES CAPEX (LÁMINA 2) */}
          <div className="bg-white rounded-2xl border border-slate-300 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-[#0f2e5a] text-white font-bold">
                    <th className="py-2.5 px-3">Cuenta Auxiliar</th>
                    <th className="py-2.5 px-3">Proyectos</th>
                    <th className="py-2.5 px-2 text-right">2025</th>
                    <th className="py-2.5 px-2 text-right">Ajuste 2025</th>
                    <th className="py-2.5 px-2 text-right">Ene</th>
                    <th className="py-2.5 px-2 text-right">Feb</th>
                    <th className="py-2.5 px-2 text-right">Mar</th>
                    <th className="py-2.5 px-2 text-right">Abr</th>
                    <th className="py-2.5 px-2 text-right">May</th>
                    <th className="py-2.5 px-2 text-right">Jun</th>
                    <th className="py-2.5 px-2 text-right">Jul</th>
                    <th className="py-2.5 px-2 text-right bg-[#163a6f]">Ago</th>
                    <th className="py-2.5 px-2 text-right bg-[#163a6f] text-sky-200">Sep</th>
                    <th className="py-2.5 px-3 text-right bg-[#0c2447] font-mono">Total 2026</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {CUENTAS_CAPEX_INTERNOS.map((c) => (
                    <tr 
                      key={c.cuentaAuxiliar}
                      onClick={() => handleAbrirDesglose(c.cuentaAuxiliar, c.proyecto, esSeptiembre ? c.sep : c.ago)}
                      className="hover:bg-sky-50/70 cursor-pointer transition-colors"
                    >
                      <td className="py-2 px-3 font-mono font-bold text-[#0f2e5a]">{c.cuentaAuxiliar}</td>
                      <td className="py-2 px-3 font-semibold text-slate-800">{c.proyecto}</td>
                      <td className="py-2 px-2 text-right font-mono text-slate-500">{c.ajuste2025 ? formatNumber(c.ajuste2025 * 3) : ''}</td>
                      <td className="py-2 px-2 text-right font-mono text-slate-500">{c.ajuste2025 ? formatNumber(c.ajuste2025) : ''}</td>
                      <td className="py-2 px-2 text-right font-mono text-slate-600">{c.ene > 0 ? formatNumber(c.ene) : ''}</td>
                      <td className="py-2 px-2 text-right font-mono text-slate-600">{c.feb > 0 ? formatNumber(c.feb) : ''}</td>
                      <td className="py-2 px-2 text-right font-mono text-slate-600">{c.mar > 0 ? formatNumber(c.mar) : ''}</td>
                      <td className="py-2 px-2 text-right font-mono text-slate-600">{c.abr > 0 ? formatNumber(c.abr) : ''}</td>
                      <td className="py-2 px-2 text-right font-mono text-slate-600">{c.may > 0 ? formatNumber(c.may) : ''}</td>
                      <td className="py-2 px-2 text-right font-mono text-slate-600">{c.jun > 0 ? formatNumber(c.jun) : ''}</td>
                      <td className="py-2 px-2 text-right font-mono text-slate-600">{c.jul > 0 ? formatNumber(c.jul) : ''}</td>
                      <td className="py-2 px-2 text-right font-mono text-slate-900 font-bold bg-slate-50">{c.ago > 0 ? formatNumber(c.ago) : ''}</td>
                      <td className="py-2 px-2 text-right font-mono text-sky-950 font-bold bg-sky-50">{c.sep > 0 ? formatNumber(Math.round(c.sep)) : ''}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">{formatNumber(Math.round(c.total2026))}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-300">
                    <td colSpan={2} className="py-3 px-3">Total</td>
                    <td className="py-3 px-2 text-right font-mono">624.894</td>
                    <td className="py-3 px-2 text-right font-mono">77.666</td>
                    <td className="py-3 px-2 text-right font-mono">162.467</td>
                    <td className="py-3 px-2 text-right font-mono">326.380</td>
                    <td className="py-3 px-2 text-right font-mono">149.039</td>
                    <td className="py-3 px-2 text-right font-mono">92.865</td>
                    <td className="py-3 px-2 text-right font-mono">77.901</td>
                    <td className="py-3 px-2 text-right font-mono">32.585</td>
                    <td className="py-3 px-2 text-right font-mono">45.087</td>
                    <td className="py-3 px-2 text-right font-mono font-black text-[#0f2e5a]">29.017</td>
                    <td className="py-3 px-2 text-right font-mono font-black text-sky-950 bg-sky-100">
                      {Math.round(capexEfectivoMes).toLocaleString('de-DE')}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-black text-[#0f2e5a] bg-slate-200">
                      {Math.round(915341 + (esSeptiembre ? capexEfectivoMes : 0)).toLocaleString('de-DE')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-PESTAÑA 3: VARIACIÓN POR PROYECTO (IDÉNTICO A LA LÁMINA 3)            */}
      {/* ========================================================================= */}
      {subTab === 'variaciones' && (
        <div className="space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-slate-200 pb-2">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Variación Por Proyecto – {variacionPeriodo === 'jul-ago' ? 'Julio vs Agosto 2026' : 'Agosto vs Septiembre 2026'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Comparativa cuantitativa de variaciones y causas técnicas que originaron el incremento o disminución.
              </p>
            </div>
            
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold border border-slate-200">
              <button
                onClick={() => setVariacionPeriodo('jul-ago')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  variacionPeriodo === 'jul-ago' ? 'bg-[#0f2e5a] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Julio vs Agosto (Lámina)
              </button>
              <button
                onClick={() => setVariacionPeriodo('ago-sep')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  variacionPeriodo === 'ago-sep' ? 'bg-[#0f2e5a] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Agosto vs Septiembre (Master)
              </button>
            </div>
          </div>

          {/* GRID DE DOS COLUMNAS: IZQUIERDA GRÁFICA DE BARRAS HORIZONTALES / DERECHA 5 FICHAS EJECUTIVAS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* COLUMNA IZQUIERDA: GRÁFICO COMPARATIVO DE BARRAS HORIZONTALES (LÁMINA 3) */}
            <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-300/90 shadow-2xs space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-500 uppercase">Proyecto</span>
                <div className="flex items-center gap-4 text-xs font-bold">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <span className="w-3 h-3 bg-[#94a3b8] rounded-xs inline-block" />
                    {variacionPeriodo === 'jul-ago' ? 'Julio' : 'Agosto'}
                  </span>
                  <span className="flex items-center gap-1.5 text-[#0f2e5a]">
                    <span className="w-3 h-3 bg-[#0f2e5a] rounded-xs inline-block" />
                    {variacionPeriodo === 'jul-ago' ? 'Agosto' : 'Septiembre'}
                  </span>
                </div>
              </div>

              {/* BARRAS HORIZONTALES PARA LOS 5 PROYECTOS CLAVE */}
              {[
                { 
                  nombre: 'Obra civil Edificio Administrativo',
                  anterior: variacionPeriodo === 'jul-ago' ? 21319 : 13164,
                  actual: variacionPeriodo === 'jul-ago' ? 13164 : 6617.15,
                  label: variacionPeriodo === 'jul-ago' ? '13.164 ▼ 38%' : '6.617 ▼ 50%',
                  esSubida: false,
                  maxVal: 22000
                },
                { 
                  nombre: 'Construcción Galpones TIMACA Cant. 04',
                  anterior: variacionPeriodo === 'jul-ago' ? 1628 : 5596,
                  actual: variacionPeriodo === 'jul-ago' ? 5596 : 13498.06,
                  label: variacionPeriodo === 'jul-ago' ? '5.596 ▲ 244%' : '13.498 ▲ 141%',
                  esSubida: true,
                  maxVal: 22000
                },
                { 
                  nombre: 'Adecuación patio externo Timaca',
                  anterior: variacionPeriodo === 'jul-ago' ? 14225 : 5371,
                  actual: variacionPeriodo === 'jul-ago' ? 5371 : 9050.80,
                  label: variacionPeriodo === 'jul-ago' ? '5.371 ▼ 62%' : '9.051 ▲ 69%',
                  esSubida: variacionPeriodo === 'ago-sep',
                  maxVal: 22000
                },
                { 
                  nombre: 'Adecuación de banco de pruebas de motores eléctricos 440v',
                  anterior: variacionPeriodo === 'jul-ago' ? 5575 : 3289,
                  actual: variacionPeriodo === 'jul-ago' ? 3289 : 3759.16,
                  label: variacionPeriodo === 'jul-ago' ? '3.289 ▼ 41%' : '3.759 ▲ 14%',
                  esSubida: variacionPeriodo === 'ago-sep',
                  maxVal: 22000
                },
                { 
                  nombre: 'Reacondicionamiento Grúas Torres Liebherr (Pellas 2)*',
                  anterior: variacionPeriodo === 'jul-ago' ? 1891 : 1528,
                  actual: variacionPeriodo === 'jul-ago' ? 1528 : 1951.95,
                  label: variacionPeriodo === 'jul-ago' ? '1.528 ▼ 19%' : '1.952 ▲ 28%',
                  esSubida: variacionPeriodo === 'ago-sep',
                  maxVal: 22000
                }
              ].map((item) => (
                <div key={item.nombre} className="space-y-1.5">
                  <div className="text-xs font-bold text-slate-800">{item.nombre}</div>
                  
                  {/* Barra del mes anterior (Gris #94a3b8) */}
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-slate-100 h-5 rounded-xs overflow-hidden flex items-center">
                      <div 
                        style={{ width: `${Math.min(100, Math.max(4, (item.anterior / item.maxVal) * 100))}%` }}
                        className="bg-[#94a3b8] h-full"
                      />
                    </div>
                    <span className="w-16 text-right font-mono text-[11px] text-slate-400 font-medium">
                      ${Math.round(item.anterior).toLocaleString('de-DE')}
                    </span>
                  </div>

                  {/* Barra del mes actual (Azul Marino #0f2e5a con etiqueta de variación) */}
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-slate-100 h-5 rounded-xs overflow-hidden flex items-center">
                      <div 
                        style={{ width: `${Math.min(100, Math.max(4, (item.actual / item.maxVal) * 100))}%` }}
                        className="bg-[#0f2e5a] h-full"
                      />
                    </div>
                    <span className={`w-28 text-right font-mono text-xs font-bold ${item.esSubida ? 'text-emerald-700' : 'text-slate-800'}`}>
                      {item.label}
                    </span>
                  </div>
                </div>
              ))}

              <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-500 font-medium">
                ■ {variacionPeriodo === 'jul-ago' ? 'Julio' : 'Agosto'} (Gris) &nbsp;&nbsp;&nbsp;&nbsp; ■ {variacionPeriodo === 'jul-ago' ? 'Agosto' : 'Septiembre'} (Azul Marino)
              </div>
            </div>

            {/* COLUMNA DERECHA: 5 TARJETAS EJECUTIVAS IDÉNTICAS A LA LÁMINA 3 */}
            <div className="lg:col-span-6 space-y-3.5">
              {(variacionPeriodo === 'jul-ago' ? VARIACIONES_CAPEX_JUL_AGO : VARIACIONES_CAPEX_AGO_SEP).map((v) => {
                const anteriorMonto = 'julio' in v ? (v as any).julio : (v as any).anterior;
                const actualMonto = 'agosto' in v ? (v as any).agosto : (v as any).actual;
                return (
                  <div 
                    key={v.cuenta}
                    className="bg-white rounded-xl border border-slate-300 p-4 shadow-2xs hover:shadow-xs transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {v.esSubida ? (
                          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                            <TrendingUp className="w-6 h-6 stroke-[2.5]" />
                          </div>
                        ) : (
                          <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
                            <TrendingDown className="w-6 h-6 stroke-[2.5]" />
                          </div>
                        )}
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{v.proyecto}</h4>
                          <div className="text-xl font-black text-slate-900 font-mono mt-0.5">
                            {formatExact(actualMonto)}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`text-base font-black ${v.esSubida ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {v.porcentaje}
                        </span>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          Ant: {formatCurrency(anteriorMonto)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 text-[11px] text-slate-600 italic leading-relaxed">
                      "{v.explicacion}"
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-PESTAÑA 4: MANTTO. ACTIVOS PROD. – OPEX FLOTA (LÁMINA 4)             */}
      {/* ========================================================================= */}
      {subTab === 'flota' && (
        <div className="space-y-6">
          
          <div className="flex items-baseline justify-between border-b border-slate-200 pb-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Mantto. Activos Productivos – OPEX {mesActivoRaw.mesLabel} 2026
            </h2>
            <span className="text-xs text-slate-500 font-semibold">
              Flota de equipos móviles pesados, livianos, grúas y maquinaria de planta
            </span>
          </div>

          {/* 3 KPI CARDS DE LA LÁMINA 4 CON RIBETE AZUL MARINO */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            <div className="bg-white rounded-xl border border-slate-300 shadow-2xs overflow-hidden flex flex-col justify-between">
              <div className="h-1.5 bg-[#0f2e5a]" />
              <div className="p-5 text-center flex-1 flex flex-col justify-between">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-tight">
                  TOTAL {mesActivoRaw.mesCorto.toUpperCase()}
                </div>
                <div className="text-3xl sm:text-4xl font-black text-slate-900 font-mono my-2">
                  {esAgosto ? '$113.450' : formatExact(opexFlotaEfectivoMes)}
                </div>
                <div className="text-xs font-medium text-slate-600">
                  {esAgosto ? '▲ 16% vs Julio ($97.727)' : '▼ 26,2% vs Agosto ($113.450)'}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-300 shadow-2xs overflow-hidden flex flex-col justify-between">
              <div className="h-1.5 bg-[#0f2e5a]" />
              <div className="p-5 text-center flex-1 flex flex-col justify-between">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-tight">
                  TOTAL ACUMULADO 2026
                </div>
                <div className="text-3xl sm:text-4xl font-black text-slate-900 font-mono my-2">
                  {esAgosto ? '$740.391' : formatExact(824120.75 - (modoReclasificadoSep ? montoReclasificadoSep : 0))}
                </div>
                <div className="text-xs font-medium text-slate-500">
                  Enero - {mesActivoRaw.mesLabel} 2026 (Incluye Horas Hombres)
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-300 shadow-2xs overflow-hidden flex flex-col justify-between">
              <div className="h-1.5 bg-[#0f2e5a]" />
              <div className="p-5 text-center flex-1 flex flex-col justify-between">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-tight">
                  EQUIPO CON MAYOR VARIACIÓN {mesActivoRaw.mesCorto.toUpperCase()}
                </div>
                <div className="text-2xl sm:text-3xl font-black text-[#0f2e5a] font-mono my-2">
                  {esAgosto ? 'Autobuses' : 'Grúas'}
                </div>
                <div className="text-xs font-medium text-slate-600">
                  {esAgosto 
                    ? '▲ 183% vs Julio ($7.371)' 
                    : 'Líder en volumen de intervenciones ($32.984,63)'}
                </div>
              </div>
            </div>

          </div>

          {/* GRID DE GRÁFICAS DE LA LÁMINA 4: 2 CURVAS A LA IZQUIERDA Y TOP 10 A LA DERECHA */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* IZQUIERDA: 2 CURVAS EVOLUTIVAS */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* CURVA 1: EVOLUTIVO EQUIPOS MÓVILES */}
              <div className="bg-white rounded-2xl p-5 border border-slate-300/90 shadow-2xs">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider text-center mb-1">
                  EVOLUTIVO EQUIPOS MÓVILES
                </h3>
                
                <div className="relative w-full h-44 mt-3">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 600 130" preserveAspectRatio="none">
                    <line x1="20" y1="110" x2="580" y2="110" stroke="#e2e8f0" strokeWidth="1" />
                    
                    {/* Curva Azul */}
                    <path
                      d="M 30 25 C 60 50, 80 65, 100 70 C 130 78, 150 95, 170 98 C 200 102, 220 90, 240 88 C 270 85, 290 80, 310 78 C 340 75, 360 55, 380 50 C 410 45, 430 35, 450 32 C 480 30, 510 65, 540 68"
                      fill="none"
                      stroke="#0f4c81"
                      strokeWidth="3"
                    />

                    {[
                      { x: 30, y: 25, val: '143.581', mes: 'Ene' },
                      { x: 100, y: 70, val: '102.274', mes: 'Feb' },
                      { x: 170, y: 98, val: '83.194', mes: 'Mar' },
                      { x: 240, y: 88, val: '59.543', mes: 'Abr' },
                      { x: 310, y: 78, val: '68.409', mes: 'May' },
                      { x: 380, y: 50, val: '72.213', mes: 'Jun' },
                      { x: 450, y: 32, val: '97.727', mes: 'Jul' },
                      { x: 500, y: 28, val: '113.450', mes: 'Ago' },
                      { x: 550, y: 68, val: esSeptiembre ? Math.round(opexFlotaEfectivoMes).toLocaleString('de-DE') : '83.730', mes: 'Sep' }
                    ].map((p) => (
                      <g key={p.mes}>
                        <circle cx={p.x} cy={p.y} r="3.5" fill="#0f4c81" />
                        <text x={p.x} y={p.y - 7} textAnchor="middle" className="text-[9px] font-bold fill-slate-700 font-mono">
                          {p.val}
                        </text>
                        <text x={p.x} y="125" textAnchor="middle" className="text-[9px] font-bold fill-slate-500">
                          {p.mes}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>
              </div>

              {/* CURVA 2: EVOLUTIVO GRÚAS VS OTROS EQUIPOS */}
              <div className="bg-white rounded-2xl p-5 border border-slate-300/90 shadow-2xs">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    EVOLUTIVO COMPARATIVO
                  </h3>
                  <div className="flex items-center gap-3 text-[11px] font-bold">
                    <span className="flex items-center gap-1 text-[#0f4c81]">
                      <span className="w-2.5 h-2.5 bg-[#0f4c81] rounded-full inline-block" /> GRÚAS
                    </span>
                    <span className="flex items-center gap-1 text-rose-600">
                      <span className="w-2.5 h-2.5 bg-rose-600 rounded-full inline-block" /> OTROS EQUIPOS
                    </span>
                  </div>
                </div>

                <div className="relative w-full h-36 mt-2">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 600 110" preserveAspectRatio="none">
                    <line x1="20" y1="95" x2="580" y2="95" stroke="#e2e8f0" strokeWidth="1" />
                    
                    {/* Grúas (Azul) */}
                    <path
                      d="M 30 20 C 70 50, 110 70, 160 72 C 220 74, 270 65, 320 66 C 380 67, 430 63, 490 62 C 530 61, 560 60, 580 60"
                      fill="none"
                      stroke="#0f4c81"
                      strokeWidth="2.5"
                    />

                    {/* Otros Equipos (Rojo) */}
                    <path
                      d="M 30 75 C 70 68, 110 80, 160 82 C 220 84, 270 78, 320 76 C 380 72, 430 45, 490 35 C 530 40, 560 55, 580 56"
                      fill="none"
                      stroke="#e11d48"
                      strokeWidth="2.5"
                    />
                  </svg>
                </div>
              </div>

            </div>

            {/* DERECHA: TOP 10 EQUIPOS CON MAYOR GASTO (BARRAS HORIZONTALES LÁMINA 4) */}
            <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-300/90 shadow-2xs flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                  TOP 10 EQUIPOS CON MAYOR GASTO ({mesActivoRaw.mesLabel.toUpperCase()})
                </h3>

                <div className="space-y-3">
                  {(esAgosto ? TOP_10_EQUIPOS_OPEX_AGOSTO : TOP_10_EQUIPOS_OPEX_SEPTIEMBRE.map(e => ({
                    codigo: e.codigo,
                    nombre: e.nombre,
                    monto: e.montoSeptiembre
                  }))).map((eq: any) => {
                    const monto = eq.montoAgosto || eq.monto;
                    const maxTop = 25000;
                    const pct = Math.min(100, Math.max(8, (monto / maxTop) * 100));
                    return (
                      <div key={eq.codigo} className="space-y-1">
                        <div className="flex items-baseline justify-between text-xs">
                          <span className="font-bold text-slate-800 truncate pr-2">
                            {eq.codigo} <span className="font-normal text-slate-500">{eq.nombre}</span>
                          </span>
                          <span className="font-mono font-bold text-slate-900 shrink-0">
                            {formatExact(monto)}
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-4 rounded-xs overflow-hidden">
                          <div 
                            style={{ width: `${pct}%` }}
                            className="bg-[#0f2e5a] h-full hover:bg-sky-700 transition-colors"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 text-right">
                Concentración del Top 10: <strong>~55%</strong> del gasto operativo total del mes
              </div>
            </div>

          </div>

          {/* TABLA POR TIPO DE EQUIPO (LÁMINA 4) */}
          <div className="bg-white rounded-2xl border border-slate-300 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-[#0f2e5a] text-white font-bold">
                    <th className="py-2.5 px-3">Descripción / Familia</th>
                    <th className="py-2.5 px-2 text-right">Ene</th>
                    <th className="py-2.5 px-2 text-right">Feb</th>
                    <th className="py-2.5 px-2 text-right">Mar</th>
                    <th className="py-2.5 px-2 text-right">Abr</th>
                    <th className="py-2.5 px-2 text-right">May</th>
                    <th className="py-2.5 px-2 text-right">Jun</th>
                    <th className="py-2.5 px-2 text-right">Jul</th>
                    <th className="py-2.5 px-2 text-right bg-[#163a6f]">Ago</th>
                    <th className="py-2.5 px-2 text-right bg-[#163a6f] text-sky-200">Sep</th>
                    <th className="py-2.5 px-3 text-right bg-[#0c2447] font-mono">Total 2026</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {TIPOS_EQUIPOS_OPEX_MENSUAL.map((t) => (
                    <tr key={t.tipo} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-semibold text-slate-800">{t.tipo}</td>
                      <td className="py-2 px-2 text-right font-mono text-slate-600">{t.ene > 0 ? formatNumber(t.ene) : '-'}</td>
                      <td className="py-2 px-2 text-right font-mono text-slate-600">{t.feb > 0 ? formatNumber(t.feb) : '-'}</td>
                      <td className="py-2 px-2 text-right font-mono text-slate-600">{t.mar > 0 ? formatNumber(t.mar) : '-'}</td>
                      <td className="py-2 px-2 text-right font-mono text-slate-600">{t.abr > 0 ? formatNumber(t.abr) : '-'}</td>
                      <td className="py-2 px-2 text-right font-mono text-slate-600">{t.may > 0 ? formatNumber(t.may) : '-'}</td>
                      <td className="py-2 px-2 text-right font-mono text-slate-600">{t.jun > 0 ? formatNumber(t.jun) : '-'}</td>
                      <td className="py-2 px-2 text-right font-mono text-slate-600">{t.jul > 0 ? formatNumber(t.jul) : '-'}</td>
                      <td className="py-2 px-2 text-right font-mono font-bold text-slate-900 bg-slate-50">{t.ago > 0 ? formatNumber(t.ago) : '-'}</td>
                      <td className="py-2 px-2 text-right font-mono font-bold text-sky-950 bg-sky-50">{t.sep > 0 ? formatNumber(Math.round(t.sep)) : '-'}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">{formatNumber(Math.round(t.total))}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-300">
                    <td className="py-3 px-3">Total Flota</td>
                    <td className="py-3 px-2 text-right font-mono">143.581</td>
                    <td className="py-3 px-2 text-right font-mono">102.274</td>
                    <td className="py-3 px-2 text-right font-mono">83.194</td>
                    <td className="py-3 px-2 text-right font-mono">59.543</td>
                    <td className="py-3 px-2 text-right font-mono">68.409</td>
                    <td className="py-3 px-2 text-right font-mono">72.213</td>
                    <td className="py-3 px-2 text-right font-mono">97.727</td>
                    <td className="py-3 px-2 text-right font-mono font-black text-[#0f2e5a]">113.450</td>
                    <td className="py-3 px-2 text-right font-mono font-black text-sky-950 bg-sky-100">
                      {Math.round(opexFlotaEfectivoMes).toLocaleString('de-DE')}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-black text-[#0f2e5a] bg-slate-200">
                      {Math.round(740391 + (esSeptiembre ? opexFlotaEfectivoMes : 0)).toLocaleString('de-DE')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-PESTAÑA 5: MANTTO. INFRAESTRUCTURA – OPEX (IDÉNTICO A LA LÁMINA 5)     */}
      {/* ========================================================================= */}
      {subTab === 'infra' && (
        <div className="space-y-6">
          
          <div className="flex items-baseline justify-between border-b border-slate-200 pb-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Mantto. Infraestructura – OPEX {mesActivoRaw.mesLabel} 2026
            </h2>
            <span className="text-xs text-slate-500 font-semibold">
              Galpones, adecuaciones, herramientas de talleres y almacén
            </span>
          </div>

          {/* 5 KPI CARDS DE LA LÁMINA 5 CON RIBETE AZUL MARINO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            
            <div className="bg-white rounded-xl border border-slate-300 shadow-2xs overflow-hidden flex flex-col justify-between">
              <div className="h-1.5 bg-[#0f2e5a]" />
              <div className="p-4 text-center flex-1 flex flex-col justify-between">
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-tight">
                  TOTAL {mesActivoRaw.mesCorto.toUpperCase()}
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono my-2">
                  {esAgosto ? '$40.545' : formatExact(opexInfraEfectivoMes)}
                </div>
                <div className="text-xs font-medium text-slate-600">
                  {esAgosto ? '▼ 3% vs Julio ($41.898)' : '▲ 2,9% vs Agosto ($40.545)'}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-300 shadow-2xs overflow-hidden flex flex-col justify-between">
              <div className="h-1.5 bg-[#0f2e5a]" />
              <div className="p-4 text-center flex-1 flex flex-col justify-between">
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-tight">
                  TOTAL ACUMULADO 2026
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono my-2">
                  {esAgosto ? '$359.823' : formatExact(401562.86)}
                </div>
                <div className="text-[10px] text-slate-500">
                  Enero - {mesActivoRaw.mesLabel} 2026 (Incluye HH)
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-300 shadow-2xs overflow-hidden flex flex-col justify-between">
              <div className="h-1.5 bg-[#0f2e5a]" />
              <div className="p-4 text-center flex-1 flex flex-col justify-between">
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-tight">
                  MAYOR INCREMENTO {mesActivoRaw.mesCorto.toUpperCase()}
                </div>
                <div className="text-sm font-black text-[#0f2e5a] my-1">
                  Adecuaciones y/o mejoras
                </div>
                <div className="text-xs font-mono font-bold text-slate-800">
                  $31.297 <span className="text-emerald-700 font-bold">▲ 59% vs Julio</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-300 shadow-2xs overflow-hidden flex flex-col justify-between">
              <div className="h-1.5 bg-[#0f2e5a]" />
              <div className="p-4 text-center flex-1 flex flex-col justify-between">
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-tight">
                  HH MANTTO INFRAESTRUCTURA
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono my-2">
                  1145Hrs
                </div>
                <div className="text-[10px] text-slate-500">
                  Horas Hombre ejecutadas
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-300 shadow-2xs overflow-hidden flex flex-col justify-between">
              <div className="h-1.5 bg-[#0f2e5a]" />
              <div className="p-4 text-center flex-1 flex flex-col justify-between">
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-tight">
                  COSTO TOTAL MOD
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono my-2">
                  $2.127
                </div>
                <div className="text-[10px] text-slate-500">
                  Mano de obra directa asignada
                </div>
              </div>
            </div>

          </div>

          {/* GRID DE DOS GRÁFICAS: EVOLUTIVO Y VARIACIÓN POR CUENTA AUXILIAR */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* IZQUIERDA: EVOLUTIVO CURVO CON PUNTOS (LÁMINA 5) */}
            <div className="lg:col-span-6 bg-white rounded-2xl p-5 border border-slate-300/90 shadow-2xs">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider text-center mb-1">
                EVOLUTIVO
              </h3>
              
              <div className="relative w-full h-52 mt-3">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 600 130" preserveAspectRatio="none">
                  <line x1="20" y1="110" x2="580" y2="110" stroke="#e2e8f0" strokeWidth="1" />
                  
                  {/* Curva Azul */}
                  <path
                    d="M 30 15 C 60 70, 80 88, 100 90 C 130 92, 150 95, 170 96 C 200 97, 220 92, 240 91 C 270 90, 290 94, 310 95 C 340 96, 360 97, 380 98 C 410 98, 430 75, 450 72 C 480 70, 510 73, 540 73"
                    fill="none"
                    stroke="#0f4c81"
                    strokeWidth="3"
                  />

                  {[
                    { x: 30, y: 15, val: '145.197', mes: 'Ene' },
                    { x: 100, y: 90, val: '50.329', mes: 'Feb' },
                    { x: 170, y: 96, val: '20.149', mes: 'Mar' },
                    { x: 240, y: 91, val: '25.926', mes: 'Abr' },
                    { x: 310, y: 95, val: '20.031', mes: 'May' },
                    { x: 380, y: 98, val: '15.748', mes: 'Jun' },
                    { x: 450, y: 72, val: '41.898', mes: 'Jul' },
                    { x: 500, y: 73, val: '40.545', mes: 'Ago' },
                    { x: 550, y: 72, val: '41.740', mes: 'Sep' }
                  ].map((p) => (
                    <g key={p.mes}>
                      <circle cx={p.x} cy={p.y} r="3.5" fill="#0f4c81" />
                      <text x={p.x} y={p.y - 7} textAnchor="middle" className="text-[9px] font-bold fill-slate-700 font-mono">
                        {p.val}
                      </text>
                      <text x={p.x} y="125" textAnchor="middle" className="text-[9px] font-bold fill-slate-500">
                        {p.mes}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            </div>

            {/* DERECHA: VARIACIÓN POR CTA AUXILIAR (BARRAS HORIZONTALES CON % DE LÁMINA 5) */}
            <div className="lg:col-span-6 bg-white rounded-2xl p-5 border border-slate-300/90 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  VARIACIÓN POR CTA AUXILIAR
                </h3>
                <div className="flex items-center gap-3 text-[11px] font-bold">
                  <span className="flex items-center gap-1 text-[#94a3b8]">
                    <span className="w-2.5 h-2.5 bg-[#94a3b8] rounded-xs inline-block" /> JULIO
                  </span>
                  <span className="flex items-center gap-1 text-[#0f2e5a]">
                    <span className="w-2.5 h-2.5 bg-[#0f2e5a] rounded-xs inline-block" /> AGOSTO
                  </span>
                </div>
              </div>

              <div className="space-y-2 mt-3">
                {[
                  { cuenta: 'TT-I-C-033', variacion: '▲ 59%', jul: 19651, ago: 31297, max: 32000 },
                  { cuenta: 'EE-H-C-015', variacion: '▼ 15%', jul: 2516, ago: 2141, max: 32000 },
                  { cuenta: 'TT-G-C-032', variacion: '▲ 2387%', jul: 73, ago: 1809, max: 32000 },
                  { cuenta: 'EE-G-C-016', variacion: '▲ 59%', jul: 855, ago: 1361, max: 32000 },
                  { cuenta: 'SS-G-C-025', variacion: '▲ 148%', jul: 438, ago: 1085, max: 32000 },
                  { cuenta: 'TT-H-C-031', variacion: '▲ 0%', jul: 3063, ago: 1051, max: 32000 },
                  { cuenta: 'TT-A-C-208', variacion: '▲ 132%', jul: 448, ago: 1040, max: 32000 },
                  { cuenta: 'TT-A-C-207', variacion: '▼ 97%', jul: 14107, ago: 444, max: 32000 },
                  { cuenta: 'TT-H-C-033', variacion: '▼ 70%', jul: 690, ago: 205, max: 32000 },
                  { cuenta: 'TT-G-C-034', variacion: '▲ 596%', jul: 14, ago: 94, max: 32000 },
                  { cuenta: 'SS-H-C-024', variacion: '▼ 60%', jul: 45, ago: 18, max: 32000 }
                ].map((item) => (
                  <div key={item.cuenta} className="flex items-center gap-2 text-[11px]">
                    <span className="w-20 font-mono font-bold text-slate-700 shrink-0">{item.cuenta}</span>
                    <div className="flex-1 bg-slate-100 h-3.5 rounded-xs overflow-hidden flex items-center">
                      <div 
                        style={{ width: `${Math.min(100, Math.max(3, (item.ago / item.max) * 100))}%` }}
                        className="bg-[#0f2e5a] h-full"
                      />
                    </div>
                    <span className={`w-16 text-right font-bold text-[10px] ${item.variacion.includes('▲') ? 'text-emerald-700' : 'text-slate-600'}`}>
                      {item.variacion}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* TABLA DE CUENTAS DE INFRAESTRUCTURA (LÁMINA 5) */}
          <div className="bg-white rounded-2xl border border-slate-300 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-[#0f2e5a] text-white font-bold">
                    <th className="py-2.5 px-3">Cuenta Auxiliar</th>
                    <th className="py-2.5 px-3">Proyecto</th>
                    <th className="py-2.5 px-2 text-right">Ajuste 2025</th>
                    <th className="py-2.5 px-2 text-right">Ene</th>
                    <th className="py-2.5 px-2 text-right">Feb</th>
                    <th className="py-2.5 px-2 text-right">Mar</th>
                    <th className="py-2.5 px-2 text-right">Abr</th>
                    <th className="py-2.5 px-2 text-right">May</th>
                    <th className="py-2.5 px-2 text-right">Jun</th>
                    <th className="py-2.5 px-2 text-right">Jul</th>
                    <th className="py-2.5 px-2 text-right bg-[#163a6f]">Ago</th>
                    <th className="py-2.5 px-2 text-right bg-[#163a6f] text-sky-200">Sep</th>
                    <th className="py-2.5 px-3 text-right bg-[#0c2447] font-mono">Total 2026</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {MANTTO_INFRAESTRUCTURA_2026.cuentas.map((c) => (
                    <tr 
                      key={c.cuenta}
                      onClick={() => handleAbrirDesglose(c.cuenta, c.descripcion, esSeptiembre ? c.sep : c.ago)}
                      className="hover:bg-teal-50/70 cursor-pointer transition-colors"
                    >
                      <td className="py-2 px-3 font-mono font-bold text-[#0f2e5a]">{c.cuenta}</td>
                      <td className="py-2 px-3 font-semibold text-slate-800">{c.descripcion}</td>
                      <td className="py-2 px-2 text-right font-mono text-slate-500">{(c as any).ajuste2025 ? formatNumber((c as any).ajuste2025) : ''}</td>
                      <td className="py-2 px-2 text-right font-mono text-slate-600">{c.ene > 0 ? formatNumber(c.ene) : '-'}</td>
                      <td className="py-2 px-2 text-right font-mono text-slate-600">{c.feb > 0 ? formatNumber(c.feb) : '-'}</td>
                      <td className="py-2 px-2 text-right font-mono text-slate-600">{c.mar > 0 ? formatNumber(c.mar) : '-'}</td>
                      <td className="py-2 px-2 text-right font-mono text-slate-600">{c.abr > 0 ? formatNumber(c.abr) : '-'}</td>
                      <td className="py-2 px-2 text-right font-mono text-slate-600">{c.may > 0 ? formatNumber(c.may) : '-'}</td>
                      <td className="py-2 px-2 text-right font-mono text-slate-600">{c.jun > 0 ? formatNumber(c.jun) : '-'}</td>
                      <td className="py-2 px-2 text-right font-mono text-slate-600">{c.jul > 0 ? formatNumber(c.jul) : '-'}</td>
                      <td className="py-2 px-2 text-right font-mono font-bold text-slate-900 bg-slate-50">{formatNumber(c.ago)}</td>
                      <td className="py-2 px-2 text-right font-mono font-bold text-sky-950 bg-sky-50">{formatNumber(Math.round(c.sep))}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">{formatNumber(Math.round(c.total))}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-300">
                    <td colSpan={2} className="py-3 px-3">Total</td>
                    <td className="py-3 px-2 text-right font-mono">209.615</td>
                    <td className="py-3 px-2 text-right font-mono">145.197</td>
                    <td className="py-3 px-2 text-right font-mono">50.329</td>
                    <td className="py-3 px-2 text-right font-mono">20.149</td>
                    <td className="py-3 px-2 text-right font-mono">25.926</td>
                    <td className="py-3 px-2 text-right font-mono">20.031</td>
                    <td className="py-3 px-2 text-right font-mono">15.748</td>
                    <td className="py-3 px-2 text-right font-mono">41.898</td>
                    <td className="py-3 px-2 text-right font-mono font-black text-[#0f2e5a]">40.545</td>
                    <td className="py-3 px-2 text-right font-mono font-black text-sky-950 bg-sky-100">41.740</td>
                    <td className="py-3 px-3 text-right font-mono font-black text-[#0f2e5a] bg-slate-200">401.563</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* BULLET NOTES DE LA LÁMINA 5 (INCREMENTOS Y DISMINUCIONES) */}
          <div className="bg-white rounded-2xl p-4 border border-slate-300 text-xs text-slate-700 space-y-1.5 shadow-2xs">
            <p className="leading-relaxed">
              • <strong className="text-slate-900 underline">Incrementos:</strong> <strong>TT-I-C-033</strong> adecuación de contenedores en Pellas 1 (22K USD en acero al carbono, 1,2K USD en materiales de construcción y 1,2K en materiales eléctricos), <strong>TT-G-C-032</strong> : materiales eléctricos para cajas de distribución (761 USD) y aire acondicionado para el comedor de fabricación (550 USD).
            </p>
            <p className="leading-relaxed">
              • <strong className="text-slate-900 underline">Disminuciones:</strong> <strong>TT-A-C-207</strong> : disminuyó tras la fabricación de 40 cajas de herramientas en el mes anterior (12,4K USD en láminas estriadas), quedando en el mes actual 443,58 USD, principalmente un servicio de recarga y mantenimiento de extintores (279,89 USD).
            </p>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-PESTAÑA 6: CIERRE SEPTIEMBRE & RECLASIFICACIÓN CONTABLE              */}
      {/* ========================================================================= */}
      {subTab === 'reclasificacion' && (
        <div className="space-y-6">
          
          <div className="bg-white rounded-2xl p-5 border border-slate-300 shadow-2xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>CRITERIO OFICIAL APLICADO: SOLO MOTOR DE AUTOBÚS A CAPEX</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  Separación Contable de Mantto. Flota (OPEX) hacia CAPEX en Septiembre 2026
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
                  Conforme a tu instrucción contable: Cuando se colocó un motor o repuesto que aumenta la vida útil, 
                  <strong> solo pasa a CAPEX el autobús con ese motor ($8.500 USD)</strong>. Todos los demás componentes menores ("periquitos") se mantienen en <strong>OPEX Flota</strong>.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const resetMap: Record<string, boolean> = {};
                    INTERVENCIONES_VIDA_UTIL_SEPTIEMBRE_2026.forEach(it => {
                      resetMap[it.id] = (it.id === 'CAPEX-VU-SEP-01'); // Solo motor bus
                    });
                    setIdsVidaUtilActivos(resetMap);
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restablecer (Solo Motor Bus)</span>
                </button>
              </div>
            </div>

            {/* 3 TARJETAS COMPARATIVAS ANTES VS DESPUÉS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-500 uppercase text-[10px]">1. Base Master Original (Sin Reclasificar)</div>
                <div className="mt-2 space-y-1.5 font-medium">
                  <div className="flex justify-between">
                    <span className="text-slate-600">CAPEX Proyectos Internos:</span>
                    <span className="font-mono font-bold text-slate-900">$34.930,08</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Mantto. Flota (OPEX):</span>
                    <span className="font-mono font-bold text-slate-900">$83.729,79</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Mantto. Infraestructura:</span>
                    <span className="font-mono font-bold text-slate-900">$41.739,91</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Administrativo (Admon):</span>
                    <span className="font-mono font-bold text-slate-900">$31.339,57</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-slate-900">
                    <span>Total Septiembre:</span>
                    <span className="font-mono">$191.739,35</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-300">
                <div className="font-bold text-emerald-800 uppercase text-[10px]">2. Reclasificado (Solo Motor Bus $8.500)</div>
                <div className="mt-2 space-y-1.5 font-medium text-emerald-950">
                  <div className="flex justify-between">
                    <span>+ Motor Cummins en Bus BS03:</span>
                    <span className="font-mono font-black text-emerald-700">+$8.500,00</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>• Demás repuestos menores:</span>
                    <span className="font-mono font-bold text-slate-700">$0,00 (en OPEX)</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>• Equipos nuevos ingreso Sep:</span>
                    <span className="font-mono font-bold text-slate-700">{incluirEquiposNuevosCapex ? `+$${totalEquiposNuevosSep.toLocaleString('de-DE')}` : '$0,00'}</span>
                  </div>
                  <div className="pt-2 border-t border-emerald-300 flex justify-between font-black text-emerald-900">
                    <span>Total Reclasificado a CAPEX:</span>
                    <span className="font-mono">{formatExact(montoReclasificadoSep)}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0f2e5a] text-white border border-[#0f2e5a]">
                <div className="font-bold text-sky-300 uppercase text-[10px]">3. Cierre Efectivo de Septiembre</div>
                <div className="mt-2 space-y-1.5 font-medium">
                  <div className="flex justify-between">
                    <span className="text-sky-200">Nuevo CAPEX Septiembre:</span>
                    <span className="font-mono font-black text-emerald-300">{formatExact(capexEfectivoMes)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sky-200">Nuevo Mantto. Flota (OPEX):</span>
                    <span className="font-mono font-black text-amber-300">{formatExact(opexFlotaEfectivoMes)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Mantto. Infraestructura:</span>
                    <span className="font-mono font-bold text-white">$41.739,91</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Administrativo:</span>
                    <span className="font-mono font-bold text-white">$31.339,57</span>
                  </div>
                  <div className="pt-2 border-t border-sky-800 flex justify-between font-black text-white">
                    <span>Total Septiembre Conciliado:</span>
                    <span className="font-mono">$191.739,35</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* TABLA DETALLADA DE ÍTEMS DE VIDA ÚTIL: SE VE EXACTAMENTE QUE SOLO EL MOTOR DEL BUS ESTÁ MARCADO */}
          <div className="bg-white rounded-2xl p-5 border border-slate-300 shadow-2xs overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Wrench className="w-4 h-4 text-[#0f2e5a]" />
                <span>Auditoría de Intervenciones: Vida Útil vs Repuestos Menores (Flota Existente)</span>
              </h3>
              <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                Pasa a CAPEX: {formatExact(totalVidaUtilSep)} USD
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-[#0f2e5a] text-white font-bold">
                    <th className="py-2.5 px-3 text-center">Pasa a CAPEX</th>
                    <th className="py-2.5 px-3">Equipo</th>
                    <th className="py-2.5 px-3">Intervención / Repuesto</th>
                    <th className="py-2.5 px-2">Categoría</th>
                    <th className="py-2.5 px-3 text-right">Monto ($)</th>
                    <th className="py-2.5 px-4">Destino Contable</th>
                    <th className="py-2.5 px-2 text-center">Auditar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {INTERVENCIONES_VIDA_UTIL_SEPTIEMBRE_2026.map((it) => {
                    const isActivo = !!idsVidaUtilActivos[it.id];
                    return (
                      <tr key={it.id} className={isActivo ? 'bg-emerald-50/50 hover:bg-emerald-50' : 'hover:bg-slate-50'}>
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={isActivo}
                            onChange={() => toggleItemVidaUtil(it.id)}
                            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-mono font-bold text-[#0f2e5a]">{it.codigoEquipo}</div>
                          <div className="text-[11px] text-slate-500">{it.nombreEquipo}</div>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900">{it.descripcionItem}</div>
                          <div className="text-[10px] text-slate-500">Motivo: {it.motivo}</div>
                        </td>
                        <td className="py-2.5 px-2 text-slate-600">{it.categoria}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                          {formatExact(it.montoItemUsd)}
                        </td>
                        <td className="py-2.5 px-4">
                          {isActivo ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              CAPEX (Extiende vida útil autobús)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold text-[10px]">
                              OPEX Flota (Repuesto menor / Mantenimiento)
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <button
                            onClick={() => handleAbrirDesglose(it.codigoEquipo, it.nombreEquipo, it.montoTotalEquipoMesUsd)}
                            className="px-2 py-1 rounded bg-slate-100 hover:bg-sky-100 text-[#0f2e5a] font-bold text-[11px] cursor-pointer"
                          >
                            Ver 🔍
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* EQUIPOS NUEVOS INCORPORADOS EN SEPTIEMBRE */}
          <div className="bg-white rounded-2xl p-5 border border-slate-300 shadow-2xs overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <span>Equipos Nuevos Incorporados en Septiembre 2026</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Regla contable: Pasan a CAPEX en Septiembre por intervenciones de acondicionamiento de llegada. En Octubre pasarán a OPEX si son mantenimientos mínimos.
                </p>
              </div>
              <label className="inline-flex items-center gap-2 text-xs font-bold bg-emerald-50 text-emerald-900 border border-emerald-300 px-3 py-1.5 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={incluirEquiposNuevosCapex}
                  onChange={(e) => setIncluirEquiposNuevosCapex(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>Incluir en CAPEX Sep (+{formatExact(totalEquiposNuevosSep)})</span>
              </label>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-800 text-white font-bold">
                    <th className="py-2.5 px-3">Código</th>
                    <th className="py-2.5 px-3">Equipo Nuevo</th>
                    <th className="py-2.5 px-2">Familia</th>
                    <th className="py-2.5 px-2 text-right">Materiales ($)</th>
                    <th className="py-2.5 px-2 text-right">Servicios ($)</th>
                    <th className="py-2.5 px-3 text-right bg-emerald-900 text-emerald-200">Total Sep ($)</th>
                    <th className="py-2.5 px-3">Intervención de Ingreso / Criterio</th>
                    <th className="py-2.5 px-2 text-center">Ver</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {EQUIPOS_NUEVOS_SEPTIEMBRE_2026.map((eq) => (
                    <tr key={eq.codigo} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-bold text-emerald-800">{eq.codigo}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{eq.nombre}</td>
                      <td className="py-2.5 px-2 text-slate-600">{eq.familia}</td>
                      <td className="py-2.5 px-2 text-right font-mono text-slate-600">{formatExact(eq.materialesUsd)}</td>
                      <td className="py-2.5 px-2 text-right font-mono text-slate-600">{formatExact(eq.serviciosUsd)}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-black text-emerald-900 bg-emerald-50/50">
                        {formatExact(eq.totalSepUsd)}
                      </td>
                      <td className="py-2.5 px-3 text-[11px] text-slate-600 max-w-sm">
                        {eq.detalleIntervencion}
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        {eq.totalSepUsd > 0 && (
                          <button
                            onClick={() => handleAbrirDesglose(eq.codigo, eq.nombre, eq.totalSepUsd)}
                            className="px-2 py-1 rounded bg-slate-100 hover:bg-sky-100 text-sky-700 font-bold text-[11px] cursor-pointer"
                          >
                            Ver 🔍
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-PESTAÑA 7: ADMINISTRATIVO ($31.339,57 USD)                            */}
      {/* ========================================================================= */}
      {subTab === 'admon' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-300 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-amber-600" />
                  <span>Gastos Administrativos y Departamentales (Septiembre 2026)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Total conciliado con Master Unificado Septiembre: <strong>$31.339,57 USD</strong> (Materiales: $24.629,10 · Servicios: $6.710,47).
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1 rounded-lg">
                Total Admon: $31.339,57 USD
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-[#0f2e5a] text-white font-bold">
                    <th className="py-2.5 px-3">Cuenta Auxiliar</th>
                    <th className="py-2.5 px-3">Departamento / Gerencia</th>
                    <th className="py-2.5 px-2.5 text-right">Materiales ($)</th>
                    <th className="py-2.5 px-2.5 text-right">Servicios ($)</th>
                    <th className="py-2.5 px-3 text-right bg-[#163a6f] text-amber-300 font-mono">Total Septiembre ($)</th>
                    <th className="py-2.5 px-3">Principales Consumos y Servicios</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {CUENTAS_ADMON_SEPTIEMBRE_2026.map((a) => (
                    <tr 
                      key={a.cuenta}
                      onClick={() => a.cuenta !== 'OTRAS-ADMON' && handleAbrirDesglose(a.cuenta, a.departamento, a.totalSepUsd)}
                      className="hover:bg-amber-50/50 cursor-pointer transition-colors"
                    >
                      <td className="py-2.5 px-3 font-mono font-bold text-[#0f2e5a]">{a.cuenta}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{a.departamento}</td>
                      <td className="py-2.5 px-2.5 text-right font-mono text-slate-600">{formatExact(a.materialesUsd)}</td>
                      <td className="py-2.5 px-2.5 text-right font-mono text-slate-600">{formatExact(a.serviciosUsd)}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-black text-amber-950 bg-amber-50/50">{formatExact(a.totalSepUsd)}</td>
                      <td className="py-2.5 px-3 text-[11px] text-slate-600">{a.principalesConsumos}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-300">
                    <td colSpan={2} className="py-3 px-3">TOTAL GASTOS ADMINISTRATIVOS</td>
                    <td className="py-3 px-2.5 text-right font-mono">$24.629,10</td>
                    <td className="py-3 px-2.5 text-right font-mono">$6.710,47</td>
                    <td className="py-3 px-3 text-right font-mono text-[#0f2e5a] text-sm bg-amber-100">$31.339,57</td>
                    <td className="py-3 px-3 text-[11px] text-slate-500">Conciliado al 100% con Master Septiembre 2026</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-PESTAÑA 8: FLOTA 26 GRÚAS                                             */}
      {/* ========================================================================= */}
      {subTab === 'gruas' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-300 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[#0f2e5a]" />
                  <span>Control de Flota: 26 Grúas TIMACA (Enero – Septiembre 2026)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Septiembre: $32.984,63 USD | Acumulado 2026: $366.456,10 USD.
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-sky-50 text-[#0f2e5a] border border-sky-200 px-3 py-1 rounded-lg">
                26 Grúas Operativas
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 mb-6">
              {(esSeptiembre ? FLOTA_GRUAS_TIMACA_2026.top5GruasSeptiembre : FLOTA_GRUAS_TIMACA_2026.top5GruasAgosto).map((g) => (
                <div 
                  key={g.codigo} 
                  onClick={() => g.codigo !== 'OTRAS' && handleAbrirDesglose(g.codigo, g.descripcion, g.monto)}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-sky-500 cursor-pointer transition-all"
                >
                  <div className="text-[10px] font-mono font-bold text-slate-500">{g.codigo}</div>
                  <div className="text-base font-black text-slate-900 font-mono mt-0.5">{formatExact(g.monto)}</div>
                  <div className="text-[11px] text-slate-600 truncate mt-1" title={g.descripcion}>{g.descripcion}</div>
                  <div className="text-[10px] font-bold text-sky-700 mt-1">{g.variacion}</div>
                </div>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-[#0f2e5a] text-white font-bold">
                    <th className="py-2.5 px-3">Código Grúa</th>
                    <th className="py-2.5 px-3">Modelo / Serial</th>
                    <th className="py-2.5 px-2 text-right">Ene</th>
                    <th className="py-2.5 px-2 text-right">Feb</th>
                    <th className="py-2.5 px-2 text-right">Mar</th>
                    <th className="py-2.5 px-2 text-right">Abr</th>
                    <th className="py-2.5 px-2 text-right">May</th>
                    <th className="py-2.5 px-2 text-right">Jun</th>
                    <th className="py-2.5 px-2 text-right">Jul</th>
                    <th className="py-2.5 px-2 text-right">Ago</th>
                    <th className="py-2.5 px-2.5 text-right bg-[#163a6f] text-sky-200">Sep</th>
                    <th className="py-2.5 px-3 text-right">Variación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {FLOTA_GRUAS_TIMACA_2026.detalleGruasMayorVariacion.map((gr) => (
                    <tr 
                      key={gr.codigo} 
                      onClick={() => handleAbrirDesglose(gr.codigo, gr.proyecto, esSeptiembre ? gr.sep : gr.ago)}
                      className="hover:bg-sky-50/70 cursor-pointer transition-colors"
                    >
                      <td className="py-2.5 px-3 font-mono font-bold text-[#0f2e5a]">{gr.codigo}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{gr.proyecto}</td>
                      <td className="py-2.5 px-2 text-right font-mono text-slate-600">{gr.ene > 0 ? formatNumber(gr.ene) : '-'}</td>
                      <td className="py-2.5 px-2 text-right font-mono text-slate-600">{gr.feb > 0 ? formatNumber(gr.feb) : '-'}</td>
                      <td className="py-2.5 px-2 text-right font-mono text-slate-600">{gr.mar > 0 ? formatNumber(gr.mar) : '-'}</td>
                      <td className="py-2.5 px-2 text-right font-mono text-slate-600">{gr.abr > 0 ? formatNumber(gr.abr) : '-'}</td>
                      <td className="py-2.5 px-2 text-right font-mono text-slate-600">{gr.may > 0 ? formatNumber(gr.may) : '-'}</td>
                      <td className="py-2.5 px-2 text-right font-mono text-slate-600">{gr.jun > 0 ? formatNumber(gr.jun) : '-'}</td>
                      <td className="py-2.5 px-2 text-right font-mono text-slate-600">{gr.jul > 0 ? formatNumber(gr.jul) : '-'}</td>
                      <td className="py-2.5 px-2 text-right font-mono text-slate-600">{gr.ago > 0 ? formatNumber(gr.ago) : '-'}</td>
                      <td className="py-2.5 px-2.5 text-right font-mono font-bold bg-sky-50 text-sky-950">{formatExact(gr.sep)}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-700">{gr.variacion}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-PESTAÑA 9: MANO DE OBRA (MOD FLOTA)                                   */}
      {/* ========================================================================= */}
      {subTab === 'mod' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-300 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#0f2e5a]" />
                  <span>Mano de Obra Directa (MOD) - Taller Mecánico & Mantenimiento</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Nómina operativa de 27 técnicos y mecánicos dedicados al mantenimiento interno (Base: 4.697 HH · $9.644 USD).
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-slate-100 text-[#0f2e5a] border border-slate-200 px-3 py-1 rounded-lg">
                4.697 HH · $9.644 USD
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-[#0f2e5a] text-white font-bold">
                    <th className="py-2.5 px-3">Tipo de Equipo</th>
                    <th className="py-2.5 px-3 text-center">Cant. Trabajadores</th>
                    <th className="py-2.5 px-3 text-right">Total Horas Hombre</th>
                    <th className="py-2.5 px-3 text-right">Tarifa Promedio ($/HR)</th>
                    <th className="py-2.5 px-3 text-right font-mono">Costo Total MOD ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {MOD_MANTENIMIENTO_FLOTA_AGOSTO.desglosePorTipoEquipo.map((eq) => (
                    <tr key={eq.tipo} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-semibold text-slate-800">{eq.tipo}</td>
                      <td className="py-2 px-3 text-center font-mono text-slate-700">{eq.trabajadores}</td>
                      <td className="py-2 px-3 text-right font-mono text-slate-700">{eq.totalHH} Hrs</td>
                      <td className="py-2 px-3 text-right font-mono text-slate-600">${formatUnitPriceRaw(eq.tarifaPromedio)}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">{formatCurrency(eq.costoTotalMOD)}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-300">
                    <td className="py-3 px-3">TOTAL GENERAL MOD FLOTA</td>
                    <td className="py-3 px-3 text-center font-mono">27 Trabajadores</td>
                    <td className="py-3 px-3 text-right font-mono">4.697 Hrs</td>
                    <td className="py-3 px-3 text-right font-mono">$2,05 / hr</td>
                    <td className="py-3 px-3 text-right font-mono text-[#0f2e5a] font-extrabold">$9.644 USD</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DE DESGLOSE Y AUDITORÍA DE REGISTROS                                */}
      {/* ========================================================================= */}
      {selectedActivoParaDesglose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-scale-up">
            
            <div className="bg-[#0f2e5a] text-white p-5 flex items-start justify-between gap-4 border-b border-[#0c2447]">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="font-mono text-xs font-black bg-white/20 text-sky-200 px-2.5 py-0.5 rounded-lg">
                    {selectedActivoParaDesglose.codigo}
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 bg-white/10 px-2.5 py-0.5 rounded-lg">
                    {selectedActivoParaDesglose.responsableArea}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {selectedActivoParaDesglose.titulo}
                </h3>
                <p className="text-xs text-sky-200 mt-1 max-w-2xl leading-relaxed">
                  {selectedActivoParaDesglose.descripcionGeneral}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {selectedActivoParaDesglose.items.length > 0 && (
                  <button
                    onClick={() => handleDescargarDesgloseExcel(selectedActivoParaDesglose)}
                    className="p-2 sm:px-3 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Exportar Excel</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedActivoParaDesglose(null)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-50 border-b border-slate-200 text-xs">
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <div className="text-[10px] uppercase font-bold text-slate-400">Total Auditado ({mesActivoRaw.mesLabel})</div>
                <div className="text-lg font-black text-slate-900 font-mono mt-0.5">
                  {formatExact(selectedActivoParaDesglose.montoAgosto)}
                </div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <div className="text-[10px] uppercase font-bold text-slate-400">Registros Auditados</div>
                <div className="text-lg font-black text-[#0f2e5a] font-mono mt-0.5">
                  {selectedActivoParaDesglose.items.length} Ítems
                </div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <div className="text-[10px] uppercase font-bold text-slate-400">Bloque Contable</div>
                <div className="text-xs font-bold text-slate-800 mt-1">
                  {selectedActivoParaDesglose.responsableArea}
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
              {selectedActivoParaDesglose.items.length > 0 ? (
                <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-2xs">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-[#0f2e5a] text-white font-bold">
                        <th className="py-2.5 px-3">Comprobante</th>
                        <th className="py-2.5 px-3">Descripción e Ítem Técnico</th>
                        <th className="py-2.5 px-2">Categoría / Rubro</th>
                        <th className="py-2.5 px-2 text-right">Cant.</th>
                        <th className="py-2.5 px-2 text-right">P. Unit ($)</th>
                        <th className="py-2.5 px-3 text-right bg-[#163a6f] text-sky-200 font-mono">Monto Total ($)</th>
                        <th className="py-2.5 px-3">Fecha / Solicitante</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium bg-white">
                      {selectedActivoParaDesglose.items.map((item) => (
                        <tr key={item.id} className="hover:bg-sky-50/50">
                          <td className="py-2.5 px-3 font-mono font-bold text-sky-700">{item.comprobanteSIP || item.codigo}</td>
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-slate-900">{item.descripcion}</div>
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
                            {item.cantidad ? `${formatNumber(item.cantidad)} ${item.unidadMedida === 'USE' ? 'SERV' : (item.unidadMedida || '')}` : '-'}
                          </td>
                          <td className="py-2.5 px-2 text-right font-mono text-slate-600">
                            {item.montoUnitario ? `$${formatUnitPriceRaw(item.montoUnitario)}` : '-'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900 bg-sky-50/50">
                            {formatExact(item.montoTotal)}
                          </td>
                          <td className="py-2.5 px-3 text-[11px] text-slate-600">
                            <div>{item.fecha || '-'}</div>
                            {item.solicitante && <div className="text-[10px] text-slate-400">Sol: {item.solicitante}</div>}
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
                    Sin despachos facturados bajo este código en el corte actual.
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-mono text-[11px]">
                Auditoría Contable TIMACA · Conciliado con Almacén SIP y Master Unificado
              </span>
              <button
                onClick={() => setSelectedActivoParaDesglose(null)}
                className="px-5 py-2 rounded-xl bg-[#0f2e5a] hover:bg-[#163a6f] text-white font-bold transition-colors cursor-pointer shadow-xs"
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
