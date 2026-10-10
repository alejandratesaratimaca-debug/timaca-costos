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
  SlidersHorizontal
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
import { formatCurrency, formatNumber } from '../utils/dateHelpers';
import { UsuarioSistema } from '../types/usuarios';

type SubTabInternos = 'resumen' | 'reclasificacion' | 'capex' | 'flota' | 'gruas' | 'mod' | 'infra' | 'admon';

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
  const [subTab, setSubTab] = useState<SubTabInternos>(activeSubTab || 'resumen');
  const [selectedMesIdx, setSelectedMesIdx] = useState<number>(8); // Septiembre por defecto (index 8)
  const [modoReclasificadoSep, setModoReclasificadoSep] = useState<boolean>(true);
  const [incluirEquiposNuevosCapex, setIncluirEquiposNuevosCapex] = useState<boolean>(true);
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
    if (newTab === 'resumen' || newTab === 'capex' || newTab === 'flota' || newTab === 'gruas' || newTab === 'mod' || newTab === 'infra') {
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

  const mesActivoRaw = EVOLUTIVO_INTERNOS_2026[selectedMesIdx] || EVOLUTIVO_INTERNOS_2026[8];
  const esSeptiembre = selectedMesIdx === 8;

  // Montos efectivos del mes activo (aplicando reclasificación si estamos en Septiembre y el modo está activo)
  const capexEfectivoMes = mesActivoRaw.capex + montoReclasificadoSep;
  const opexFlotaEfectivoMes = Math.max(0, mesActivoRaw.opexActivos - montoReclasificadoSep);
  const opexInfraEfectivoMes = mesActivoRaw.opexInfraestructura;
  const admonEfectivoMes = mesActivoRaw.admon || 0;
  const totalOpexEfectivoMes = opexFlotaEfectivoMes + opexInfraEfectivoMes;
  const totalGeneralConAdmonMes = capexEfectivoMes + opexFlotaEfectivoMes + opexInfraEfectivoMes + admonEfectivoMes;

  const formatExact = (val: number) => {
    return '$' + val.toLocaleString('de-DE', { minimumFractionDigits: val % 1 !== 0 ? 2 : 0, maximumFractionDigits: 2 });
  };

  // Apertura de desglose con lectura directa de SALIDAS_REALES_SEPTIEMBRE_2026 cuando es Septiembre
  const handleAbrirDesglose = (codigo: string, tituloFallback?: string, montoFallback?: number) => {
    if (esSeptiembre) {
      const registrosSep = SALIDAS_REALES_SEPTIEMBRE_2026.filter(r => 
        r.cuentaAuxiliarCodigo === codigo || 
        r.cuentaAuxiliarCodigo.endsWith(`-${codigo}`)
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
            unidadMedida: r.unidadMedida,
            montoUnitario: r.montoUnitario,
            montoTotal: r.montoTotal,
            proveedor: r.responsable || 'Almacén Central SIP',
            solicitante: r.solicitante,
            motivo: r.motivo,
            comprobanteSIP: r.codigoSalida,
            fecha: r.fecha
          }));
        const sumaReal = registrosSep.reduce((s, r) => s + (r.montoTotal || 0), 0);
        setSelectedActivoParaDesglose({
          codigo: registrosSep[0].cuentaAuxiliarCodigo,
          titulo: tituloFallback || registrosSep[0].cuentaAuxiliarNombre || `Cuenta ${codigo}`,
          tipo: registrosSep[0].tipoCosto === 'Interno' ? 'CAPEX' :
                registrosSep[0].tipoCosto === 'Mantto Infraestructura (OPEX)' ? 'OPEX_INFRA' : 'OPEX_FLOTA',
          montoAgosto: montoFallback ?? sumaReal,
          responsableArea: registrosSep[0].tipoCosto || 'Gestión Interna TIMACA',
          descripcionGeneral: `Desglose real de Septiembre 2026 extraído de Master Unificado (${registrosSep.length} registros procesados).`,
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
      'Comprobante / Despacho': item.comprobanteSIP || item.codigo,
      'Fecha': item.fecha || '',
      'Descripción del Ítem / Servicio': item.descripcion,
      'Categoría': item.categoria,
      'Rubro Contable': item.rubro || '',
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

  const pctCapex = totalGeneralConAdmonMes > 0 ? Math.round((capexEfectivoMes / totalGeneralConAdmonMes) * 1000) / 10 : 0;
  const pctFlota = totalGeneralConAdmonMes > 0 ? Math.round((opexFlotaEfectivoMes / totalGeneralConAdmonMes) * 1000) / 10 : 0;
  const pctInfra = totalGeneralConAdmonMes > 0 ? Math.round((opexInfraEfectivoMes / totalGeneralConAdmonMes) * 1000) / 10 : 0;
  const pctAdmon = totalGeneralConAdmonMes > 0 ? Math.round((admonEfectivoMes / totalGeneralConAdmonMes) * 1000) / 10 : 0;

  return (
    <div className="space-y-5 animate-fade-in text-slate-800">
      
      {/* Banner Superior Distintivo: Gestión Interna */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-xl border border-slate-700/80 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-600/20 via-slate-700/10 to-transparent pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/90 border border-slate-600 text-sky-300 text-xs font-semibold shadow-xs">
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                <span>GESTIÓN INTERNA CORPORATIVA · CORTE SEPTIEMBRE 2026</span>
              </div>
              {currentUser?.permisos.canEditInternos ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-xs font-bold shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Edición Habilitada ({currentUser.nombre.split(' ')[0]})</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-700/60 text-slate-400 border border-slate-600 text-xs font-medium shadow-xs">
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  <span>Modo Consulta Ejecutiva</span>
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex flex-wrap items-center gap-3">
              <span>Proyectos Internos, Flota, Infraestructura & Admon</span>
              <span className="text-xs px-2.5 py-0.5 rounded-md bg-sky-950 text-sky-300 border border-sky-700/60 font-mono">
                CAPEX + OPEX + ADMON
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-4xl">
              Consolidación oficial Enero–Septiembre 2026 con separación contable de <strong className="text-sky-300">Equipos Nuevos incorporados en el mes</strong> e <strong className="text-emerald-300">Intervenciones que aumentan la vida útil (Motores / Overhauls Mayores)</strong> desde Mantto. Flota (OPEX) hacia CAPEX.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => handleTabChange('reclasificacion')}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Simulador Reclasificación CAPEX/OPEX</span>
            </button>
            {onGoToPPT && (
              <button
                onClick={onGoToPPT}
                className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer group"
              >
                <FileText className="w-4 h-4" />
                <span>Presentación PPT</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}
          </div>
        </div>

        {/* Sub-Navegación Interna Rápida */}
        <div className="pt-4 mt-4 border-t border-slate-700/80 flex flex-wrap items-center gap-1.5 text-xs">
          {[
            { id: 'resumen', label: '1. Tablero General' },
            { id: 'reclasificacion', label: '2. Separación CAPEX vs OPEX (Sep)' },
            { id: 'capex', label: '3. Inversiones CAPEX' },
            { id: 'flota', label: '4. Mantto. Flota (OPEX)' },
            { id: 'gruas', label: '5. Flota 26 Grúas' },
            { id: 'infra', label: '6. Mantto. Infraestructura' },
            { id: 'admon', label: '7. Administrativo ($31,3k)' },
            { id: 'mod', label: '8. Horas Hombre (MOD)' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => handleTabChange(t.id as SubTabInternos)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                subTab === t.id
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Selector de Mes + Switch Maestro Base vs Reclasificado */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-200/90 backdrop-blur-md p-3.5 rounded-2xl border border-slate-300 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mr-1">
            <Calendar className="w-4 h-4 text-slate-600" />
            <span>Mes Activo:</span>
          </div>
          <div className="flex items-center gap-1 overflow-x-auto">
            {EVOLUTIVO_INTERNOS_2026.map((m, idx) => (
              <button
                key={m.mesCorto}
                onClick={() => setSelectedMesIdx(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedMesIdx === idx
                    ? idx === 8
                      ? 'bg-sky-700 text-white shadow-xs ring-2 ring-sky-400'
                      : 'bg-slate-800 text-white shadow-xs ring-1 ring-slate-700'
                    : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-300'
                }`}
              >
                {m.mesCorto}
                {idx === 8 && <span className="ml-1 text-[9px] bg-amber-400 text-slate-950 px-1 rounded font-black">NUEVO</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Switch Interactivo de Criterio Contable para Septiembre */}
        {esSeptiembre && (
          <div className="flex flex-wrap items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-300 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-600">Vista Contable Septiembre:</span>
            <button
              onClick={() => setModoReclasificadoSep(false)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                !modoReclasificadoSep
                  ? 'bg-slate-800 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Base Master Original (CAPEX $34.930,08 | Flota $83.729,79)
            </button>
            <button
              onClick={() => setModoReclasificadoSep(true)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                modoReclasificadoSep
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Reclasificado Vida Útil + Equipos Nuevos (CAPEX {formatExact(capexEfectivoMes)} | Flota {formatExact(opexFlotaEfectivoMes)})</span>
            </button>
          </div>
        )}
      </div>

      {/* Aviso de Estado de Cierre Septiembre (Pendientes HH y Reimputaciones) */}
      {esSeptiembre && (
        <div className="bg-amber-50/90 border border-amber-300 rounded-2xl p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-amber-950 shadow-2xs">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-black">Estado del Cierre Septiembre 2026 (Materiales + Servicios = $191.739,35 USD): </span>
              <span>
                Los montos base están conciliados al 100% con el Master ($34.930,08 CAPEX · $83.729,79 Flota · $41.739,91 Infraestructura · $31.339,57 Administrativo). 
                Queda lista la estructura para sumar las <strong>Horas Hombre (MOD) de Flota y Proyectos</strong> y aplicar las <strong>correcciones de cuentas mal imputadas</strong> en cuanto las tengas listas.
              </span>
            </div>
          </div>
          <button
            onClick={() => handleTabChange('reclasificacion')}
            className="shrink-0 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Ajustar CAPEX / OPEX →
          </button>
        </div>
      )}

      {/* 5 KPIs Ejecutivos Oficiales (4 Bloques del Master + Total General) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        
        {/* KPI 1: CAPEX */}
        <div 
          onClick={() => handleTabChange('capex')}
          className="bg-white/95 rounded-2xl p-4 border border-sky-300 shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1 font-semibold uppercase tracking-wider">
            <span>1. Proyectos Internos (CAPEX)</span>
            <Building2 className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {esSeptiembre ? formatExact(capexEfectivoMes) : formatCurrency(mesActivoRaw.capex)}
          </div>
          {esSeptiembre && modoReclasificadoSep && montoReclasificadoSep > 0 ? (
            <div className="mt-1.5 text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-1 rounded font-semibold">
              Base: $34.930,08 + Reclasif: {formatExact(montoReclasificadoSep)}
            </div>
          ) : (
            <div className="mt-1.5 text-[10px] text-slate-500 font-mono">
              Obras civiles, galpones y adecuaciones
            </div>
          )}
          <div className="flex items-center justify-between text-[11px] mt-2 pt-2 border-t border-slate-100">
            <span className="text-sky-700 font-bold flex items-center gap-0.5">
              {esSeptiembre ? '▲ +20,4% Base vs Ago' : '▼ 36% vs Julio'}
            </span>
            <span className="text-slate-500 font-bold">{pctCapex}% del total</span>
          </div>
        </div>

        {/* KPI 2: Mantto Flota (OPEX) */}
        <div 
          onClick={() => handleTabChange('flota')}
          className="bg-white/95 rounded-2xl p-4 border border-indigo-300 shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1 font-semibold uppercase tracking-wider">
            <span>2. Mantto. Flota (OPEX)</span>
            <Truck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {esSeptiembre ? formatExact(opexFlotaEfectivoMes) : formatCurrency(mesActivoRaw.opexActivos)}
          </div>
          {esSeptiembre && modoReclasificadoSep && montoReclasificadoSep > 0 ? (
            <div className="mt-1.5 text-[10px] bg-indigo-50 text-indigo-800 border border-indigo-200 px-2 py-1 rounded font-semibold">
              Master: $83.729,79 − CAPEX: {formatExact(montoReclasificadoSep)}
            </div>
          ) : (
            <div className="mt-1.5 text-[10px] text-slate-500 font-mono">
              Mat: $59.297,30 · Serv: $24.432,49
            </div>
          )}
          <div className="flex items-center justify-between text-[11px] mt-2 pt-2 border-t border-slate-100">
            <span className="text-emerald-600 font-bold flex items-center gap-0.5">
              {esSeptiembre ? '▼ 26,2% Base vs Ago' : '▲ 16% vs Julio'}
            </span>
            <span className="text-slate-500 font-bold">{pctFlota}% del total</span>
          </div>
        </div>

        {/* KPI 3: Mantto Infraestructura (OPEX) */}
        <div 
          onClick={() => handleTabChange('infra')}
          className="bg-white/95 rounded-2xl p-4 border border-teal-300 shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1 font-semibold uppercase tracking-wider">
            <span>3. Mantto. Infraestructura</span>
            <Wrench className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {esSeptiembre ? formatExact(opexInfraEfectivoMes) : formatCurrency(mesActivoRaw.opexInfraestructura)}
          </div>
          <div className="mt-1.5 text-[10px] text-slate-500 font-mono">
            TT-I-C-033 Adecuaciones: $27.701,47
          </div>
          <div className="flex items-center justify-between text-[11px] mt-2 pt-2 border-t border-slate-100">
            <span className="text-rose-600 font-bold flex items-center gap-0.5">
              {esSeptiembre ? '▲ +2,9% vs Ago ($40.545)' : '▼ 3% vs Julio'}
            </span>
            <span className="text-slate-500 font-bold">{pctInfra}% del total</span>
          </div>
        </div>

        {/* KPI 4: Gastos Administrativos (Admon) */}
        <div 
          onClick={() => handleTabChange('admon')}
          className="bg-white/95 rounded-2xl p-4 border border-amber-300 shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1 font-semibold uppercase tracking-wider">
            <span>4. Administrativo (Admon)</span>
            <Briefcase className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {esSeptiembre ? formatExact(admonEfectivoMes) : formatCurrency(admonEfectivoMes)}
          </div>
          <div className="mt-1.5 text-[10px] text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-semibold">
            Gerencias, Dpto. Fab, TI, Procura y Almacén
          </div>
          <div className="flex items-center justify-between text-[11px] mt-2 pt-2 border-t border-slate-100">
            <span className="text-emerald-600 font-bold flex items-center gap-0.5">
              {esSeptiembre ? 'Conciliado Master Sep' : 'Gasto Departamental'}
            </span>
            <span className="text-slate-500 font-bold">{pctAdmon}% del total</span>
          </div>
        </div>

        {/* KPI 5: Total General Consolidado */}
        <div className="bg-gradient-to-br from-slate-900 to-sky-950 text-white rounded-2xl p-4 border border-sky-800/80 shadow-md">
          <div className="flex items-center justify-between text-xs text-sky-200 mb-1 font-semibold uppercase tracking-wider">
            <span>Total {mesActivoRaw.mesLabel} (4 Bloques)</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-300 font-mono">
            {esSeptiembre ? formatExact(totalGeneralConAdmonMes) : formatCurrency(totalGeneralConAdmonMes)}
          </div>
          <div className="mt-1.5 text-[10px] text-sky-200 font-mono">
            Sin Admon (3 bloques): {esSeptiembre ? formatExact(capexEfectivoMes + totalOpexEfectivoMes) : formatCurrency(mesActivoRaw.totalGeneral)}
          </div>
          <div className="flex items-center justify-between text-[11px] mt-2 pt-2 border-t border-sky-900 text-slate-300">
            <span className="text-emerald-400 font-bold">
              OPEX Total: {esSeptiembre ? formatExact(totalOpexEfectivoMes) : formatCurrency(mesActivoRaw.totalOpex)}
            </span>
            <span className="font-mono text-slate-300">Ene-Sep</span>
          </div>
        </div>

      </div>

      {/* ===================== CONTENIDO POR SUB-PESTAÑA ===================== */}

      {/* PESTAÑA 1: RESUMEN EJECUTIVO */}
      {subTab === 'resumen' && (
        <div className="space-y-6">
          
          {/* Tarjeta Destacada: Resumen de Separación CAPEX vs OPEX en Septiembre */}
          {esSeptiembre && (
            <div className="bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-5 border border-sky-700/70 shadow-lg">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-700/80 pb-4 mb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[11px] font-bold mb-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>CRITERIO DE VIDA ÚTIL E INCORPORACIÓN DE ACTIVOS (SEPTIEMBRE 2026)</span>
                  </div>
                  <h3 className="text-lg font-black text-white">
                    Separación Contable de Mantenimiento de Flota (OPEX) hacia CAPEX
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Los equipos nuevos ingresados en septiembre pasan a CAPEX únicamente por sus intervenciones de puesta en marcha en este mes (en octubre su mantenimiento mínimo irá a OPEX). Asimismo, los motores y overhauls mayores que extienden la vida útil se reclasifican a CAPEX.
                  </p>
                </div>
                <button
                  onClick={() => handleTabChange('reclasificacion')}
                  className="shrink-0 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all cursor-pointer shadow-md"
                >
                  Configurar Ítems CAPEX / OPEX →
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5 text-xs">
                <div className="bg-slate-800/90 p-3.5 rounded-xl border border-slate-700">
                  <div className="text-slate-400 font-bold uppercase text-[10px]">1. CAPEX Obras / Planta (Master)</div>
                  <div className="text-xl font-black text-sky-300 font-mono mt-1">$34.930,08</div>
                  <div className="text-[11px] text-slate-300 mt-1">10 cuentas de obra civil, galpones, patio externo y bancos de prueba.</div>
                </div>

                <div className="bg-slate-800/90 p-3.5 rounded-xl border border-emerald-700/60">
                  <div className="text-emerald-300 font-bold uppercase text-[10px]">2. + Equipos Nuevos (Ingreso Sep)</div>
                  <div className="text-xl font-black text-emerald-400 font-mono mt-1">+{formatExact(totalEquiposNuevosSep)}</div>
                  <div className="text-[11px] text-slate-300 mt-1">
                    6 equipos nuevos (<span className="font-mono text-white">BS15, TR01, VH52, PA03, CO19, CO20</span>). En Oct pasan a OPEX si es mantto mínimo.
                  </div>
                </div>

                <div className="bg-slate-800/90 p-3.5 rounded-xl border border-amber-600/60">
                  <div className="text-amber-300 font-bold uppercase text-[10px]">3. + Extensión Vida Útil Flota</div>
                  <div className="text-xl font-black text-amber-300 font-mono mt-1">+{formatExact(totalVidaUtilSep)}</div>
                  <div className="text-[11px] text-slate-300 mt-1">
                    Motor Cummins <span className="font-mono text-white">BS03</span> ($8,5k), Telescópico <span className="font-mono text-white">GR23</span> ($9k), Protección <span className="font-mono text-white">PC05</span> ($2,6k) y Motor <span className="font-mono text-white">VH09</span> ($0,6k).
                  </div>
                </div>

                <div className="bg-sky-950/90 p-3.5 rounded-xl border border-sky-500/60">
                  <div className="text-sky-200 font-bold uppercase text-[10px]">= Nuevo Balance Septiembre</div>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-slate-300">CAPEX Total:</span>
                    <span className="text-base font-black text-emerald-300 font-mono">{formatExact(capexEfectivoMes)}</span>
                  </div>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-slate-300">Mantto Flota OPEX:</span>
                    <span className="text-base font-black text-indigo-300 font-mono">{formatExact(opexFlotaEfectivoMes)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Fila: Evolutivo Mensual + Distribución del Mes */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Gráfico / Evolutivo General Mensual Ene-Sep */}
            <div className="lg:col-span-8 bg-white/95 rounded-2xl p-5 border border-slate-300/80 shadow-sm">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">
                    Evolutivo General Mensual (Enero – Septiembre 2026)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Comportamiento histórico de inversiones (CAPEX), Mantenimiento Operativo (OPEX) y Administrativo.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                  Acum. Ene-Sep: {formatCurrency(TOTALES_ACUMULADOS_INTERNOS_2026.totalConAdmon)}
                </span>
              </div>

              {/* Barras de Evolución */}
              <div className="h-64 flex items-end justify-between gap-2.5 pt-6 pb-2 px-2">
                {EVOLUTIVO_INTERNOS_2026.map((m, idx) => {
                  const maxVal = 520000;
                  const capexMes = idx === 8 ? capexEfectivoMes : m.capex;
                  const activosMes = idx === 8 ? opexFlotaEfectivoMes : m.opexActivos;
                  const infraMes = m.opexInfraestructura;
                  const admonMes = m.admon || 0;
                  const totalBarra = capexMes + activosMes + infraMes + admonMes;

                  const hCapex = Math.max(6, (capexMes / maxVal) * 100);
                  const hActivos = Math.max(6, (activosMes / maxVal) * 100);
                  const hInfra = Math.max(6, (infraMes / maxVal) * 100);
                  const hAdmon = Math.max(4, (admonMes / maxVal) * 100);
                  const isSelected = selectedMesIdx === idx;

                  return (
                    <div 
                      key={m.mesCorto} 
                      onClick={() => setSelectedMesIdx(idx)}
                      className={`flex-1 flex flex-col items-center cursor-pointer group p-1 rounded-xl transition-all ${
                        isSelected ? 'bg-sky-50/90 ring-2 ring-sky-700' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-[10px] font-mono font-bold text-slate-700 mb-1">
                        ${Math.round(totalBarra / 1000)}k
                      </div>
                      
                      <div className="w-full max-w-[32px] flex flex-col-reverse gap-0.5 items-center justify-end h-44">
                        <div 
                          style={{ height: `${hAdmon}%` }} 
                          className="w-full bg-amber-500 rounded-t-xs hover:brightness-110 transition-all"
                          title={`Administrativo: ${formatExact(admonMes)}`}
                        />
                        <div 
                          style={{ height: `${hInfra}%` }} 
                          className="w-full bg-teal-500 rounded-t-xs hover:brightness-110 transition-all"
                          title={`OPEX Infra: ${formatExact(infraMes)}`}
                        />
                        <div 
                          style={{ height: `${hActivos}%` }} 
                          className="w-full bg-indigo-600 rounded-t-xs hover:brightness-110 transition-all"
                          title={`OPEX Flota: ${formatExact(activosMes)}`}
                        />
                        <div 
                          style={{ height: `${hCapex}%` }} 
                          className="w-full bg-sky-500 rounded-t-xs hover:brightness-110 transition-all"
                          title={`CAPEX: ${formatExact(capexMes)}`}
                        />
                      </div>

                      <div className={`text-xs font-bold mt-2 ${isSelected ? 'text-sky-900 font-black' : 'text-slate-500'}`}>
                        {m.mesCorto}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Leyenda de Colores */}
              <div className="flex flex-wrap items-center justify-center gap-4 pt-3 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-sky-500" />
                  <span className="font-medium text-slate-700">Proyectos Internos (CAPEX)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-indigo-600" />
                  <span className="font-medium text-slate-700">Mantto. Flota (OPEX)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-teal-500" />
                  <span className="font-medium text-slate-700">Mantto. Infraestructura (OPEX)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-amber-500" />
                  <span className="font-medium text-slate-700">Administrativo (Admon)</span>
                </div>
              </div>
            </div>

            {/* Distribución de Costos del Mes Seleccionado */}
            <div className="lg:col-span-4 bg-white/95 rounded-2xl p-5 border border-slate-300/80 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  Distribución {mesActivoRaw.mesLabel} 2026
                </h3>
                <p className="text-xs text-slate-500 mb-3">
                  Participación de los 4 bloques ({formatExact(totalGeneralConAdmonMes)} USD).
                </p>

                {/* Barra de Distribución Porcentual */}
                <div className="h-4 w-full rounded-full overflow-hidden flex bg-slate-100 shadow-inner mb-4">
                  <div style={{ width: `${pctCapex}%` }} className="bg-sky-500" title={`CAPEX: ${pctCapex}%`} />
                  <div style={{ width: `${pctFlota}%` }} className="bg-indigo-600" title={`Flota: ${pctFlota}%`} />
                  <div style={{ width: `${pctInfra}%` }} className="bg-teal-500" title={`Infraestructura: ${pctInfra}%`} />
                  <div style={{ width: `${pctAdmon}%` }} className="bg-amber-500" title={`Administrativo: ${pctAdmon}%`} />
                </div>

                {/* Desglose en Tarjetas */}
                <div className="space-y-2">
                  <div 
                    onClick={() => handleTabChange('capex')}
                    className="p-2.5 rounded-xl bg-sky-50/60 border border-sky-200 flex items-center justify-between hover:bg-sky-100 cursor-pointer transition-all group"
                  >
                    <div>
                      <div className="text-xs font-bold text-sky-950 flex items-center gap-1.5">
                        <span>1. Proyectos Internos (CAPEX)</span>
                        <ArrowRight className="w-3 h-3 text-sky-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="text-[10px] text-sky-700 font-medium">
                        {esSeptiembre && modoReclasificadoSep ? 'Obras + Equipos Nuevos + Vida Útil' : 'Obras civiles, galpones y patios'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-sky-900 font-mono">{formatExact(capexEfectivoMes)}</div>
                      <div className="text-[10px] font-bold text-sky-600">{pctCapex}%</div>
                    </div>
                  </div>

                  <div 
                    onClick={() => handleTabChange('flota')}
                    className="p-2.5 rounded-xl bg-indigo-50/60 border border-indigo-200 flex items-center justify-between hover:bg-indigo-100 cursor-pointer transition-all group"
                  >
                    <div>
                      <div className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                        <span>2. Mantto. Flota (OPEX)</span>
                        <ArrowRight className="w-3 h-3 text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="text-[10px] text-indigo-700 font-medium">
                        {esSeptiembre && modoReclasificadoSep ? 'Mantenimiento rutinario depurado' : 'Total Master Flota y Equipos'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-indigo-900 font-mono">{formatExact(opexFlotaEfectivoMes)}</div>
                      <div className="text-[10px] font-bold text-indigo-600">{pctFlota}%</div>
                    </div>
                  </div>

                  <div 
                    onClick={() => handleTabChange('infra')}
                    className="p-2.5 rounded-xl bg-teal-50/60 border border-teal-200 flex items-center justify-between hover:bg-teal-100 cursor-pointer transition-all group"
                  >
                    <div>
                      <div className="text-xs font-bold text-teal-950 flex items-center gap-1.5">
                        <span>3. Mantto. Infraestructura (OPEX)</span>
                        <ArrowRight className="w-3 h-3 text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="text-[10px] text-teal-700 font-medium">Adecuaciones, galpones y talleres</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-teal-900 font-mono">{formatExact(opexInfraEfectivoMes)}</div>
                      <div className="text-[10px] font-bold text-teal-600">{pctInfra}%</div>
                    </div>
                  </div>

                  <div 
                    onClick={() => handleTabChange('admon')}
                    className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200 flex items-center justify-between hover:bg-amber-100 cursor-pointer transition-all group"
                  >
                    <div>
                      <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                        <span>4. Administrativo (Admon)</span>
                        <ArrowRight className="w-3 h-3 text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="text-[10px] text-amber-700 font-medium">Departamentos y áreas de soporte</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-amber-900 font-mono">{formatExact(admonEfectivoMes)}</div>
                      <div className="text-[10px] font-bold text-amber-700">{pctAdmon}%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Matriz Comparativa Mensual Enero a Septiembre 2026 */}
          <div className="bg-white/95 rounded-2xl p-5 border border-slate-300/80 shadow-sm overflow-x-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                Matriz Comparativa Mensual Enero a Septiembre 2026 ($ USD)
              </h3>
              <span className="text-xs font-semibold text-sky-800 bg-sky-50 border border-sky-200 px-3 py-1 rounded-lg">
                {modoReclasificadoSep 
                  ? `Septiembre con Reclasificación Activa (${formatExact(montoReclasificadoSep)} de OPEX Flota a CAPEX)` 
                  : 'Septiembre en Vista Base Master Original'}
              </span>
            </div>
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-800 text-white font-bold">
                  <th className="py-2.5 px-3 rounded-l-lg">Descripción del Bloque</th>
                  <th className="py-2.5 px-2.5 text-right">Ene</th>
                  <th className="py-2.5 px-2.5 text-right">Feb</th>
                  <th className="py-2.5 px-2.5 text-right">Mar</th>
                  <th className="py-2.5 px-2.5 text-right">Abr</th>
                  <th className="py-2.5 px-2.5 text-right">May</th>
                  <th className="py-2.5 px-2.5 text-right">Jun</th>
                  <th className="py-2.5 px-2.5 text-right">Jul</th>
                  <th className="py-2.5 px-2.5 text-right">Ago</th>
                  <th className="py-2.5 px-3 text-right bg-sky-900 text-amber-300">Sep 2026</th>
                  <th className="py-2.5 px-3 text-right rounded-r-lg font-mono">Acum. 2026 ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                <tr className="hover:bg-sky-50/40">
                  <td className="py-2.5 px-3 font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sky-500" />
                    <span>1. Proyectos Internos (CAPEX)</span>
                  </td>
                  <td className="py-2.5 px-2.5 text-right font-mono">$162.467</td>
                  <td className="py-2.5 px-2.5 text-right font-mono">$326.380</td>
                  <td className="py-2.5 px-2.5 text-right font-mono">$149.039</td>
                  <td className="py-2.5 px-2.5 text-right font-mono">$92.865</td>
                  <td className="py-2.5 px-2.5 text-right font-mono">$77.901</td>
                  <td className="py-2.5 px-2.5 text-right font-mono">$32.585</td>
                  <td className="py-2.5 px-2.5 text-right font-mono">$45.087</td>
                  <td className="py-2.5 px-2.5 text-right font-mono">$29.017</td>
                  <td className="py-2.5 px-3 text-right font-mono font-black bg-sky-50 text-sky-900">
                    {formatExact(34930.08 + (modoReclasificadoSep ? montoReclasificadoSep : 0))}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                    {formatExact(950271.43 + (modoReclasificadoSep ? montoReclasificadoSep : 0))}
                  </td>
                </tr>
                <tr className="hover:bg-indigo-50/40">
                  <td className="py-2.5 px-3 font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-600" />
                    <span>2. Mantto. Flota y Equipos (OPEX)</span>
                  </td>
                  <td className="py-2.5 px-2.5 text-right font-mono">$143.581</td>
                  <td className="py-2.5 px-2.5 text-right font-mono">$102.274</td>
                  <td className="py-2.5 px-2.5 text-right font-mono">$83.194</td>
                  <td className="py-2.5 px-2.5 text-right font-mono">$59.543</td>
                  <td className="py-2.5 px-2.5 text-right font-mono">$68.409</td>
                  <td className="py-2.5 px-2.5 text-right font-mono">$72.213</td>
                  <td className="py-2.5 px-2.5 text-right font-mono">$97.727</td>
                  <td className="py-2.5 px-2.5 text-right font-mono">$113.450</td>
                  <td className="py-2.5 px-3 text-right font-mono font-black bg-indigo-50 text-indigo-900">
                    {formatExact(83729.79 - (modoReclasificadoSep ? montoReclasificadoSep : 0))}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                    {formatExact(824120.75 - (modoReclasificadoSep ? montoReclasificadoSep : 0))}
                  </td>
                </tr>
                <tr className="hover:bg-teal-50/40">
                  <td className="py-2.5 px-3 font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-teal-500" />
                    <span>3. Mantto. Infraestructura (OPEX)</span>
                  </td>
                  <td className="py-2.5 px-2.5 text-right font-mono">$145.197</td>
                  <td className="py-2.5 px-2.5 text-right font-mono">$50.329</td>
                  <td className="py-2.5 px-2.5 text-right font-mono">$20.149</td>
                  <td className="py-2.5 px-2.5 text-right font-mono">$25.926</td>
                  <td className="py-2.5 px-2.5 text-right font-mono">$20.031</td>
                  <td className="py-2.5 px-2.5 text-right font-mono">$15.748</td>
                  <td className="py-2.5 px-2.5 text-right font-mono">$41.898</td>
                  <td className="py-2.5 px-2.5 text-right font-mono">$40.545</td>
                  <td className="py-2.5 px-3 text-right font-mono font-black bg-teal-50 text-teal-900">$41.739,91</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">$401.562,86</td>
                </tr>
                <tr className="hover:bg-amber-50/40">
                  <td className="py-2.5 px-3 font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>4. Gastos Administrativos (Admon)</span>
                  </td>
                  <td className="py-2.5 px-2.5 text-right font-mono">$63.209</td>
                  <td className="py-2.5 px-2.5 text-right font-mono">$28.720</td>
                  <td className="py-2.5 px-2.5 text-right font-mono">$86.208</td>
                  <td className="py-2.5 px-2.5 text-right font-mono">$28.640</td>
                  <td className="py-2.5 px-2.5 text-right font-mono">$67.895</td>
                  <td className="py-2.5 px-2.5 text-right font-mono">$37.742</td>
                  <td className="py-2.5 px-2.5 text-right font-mono">$40.086</td>
                  <td className="py-2.5 px-2.5 text-right font-mono">$53.325</td>
                  <td className="py-2.5 px-3 text-right font-mono font-black bg-amber-50 text-amber-900">$31.339,57</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">$437.164,57</td>
                </tr>
                <tr className="bg-slate-100/90 font-black text-slate-900 border-t-2 border-slate-300">
                  <td className="py-3 px-3">TOTAL GENERAL CONSOLIDADO (4 BLOQUES)</td>
                  <td className="py-3 px-2.5 text-right font-mono">$514.453</td>
                  <td className="py-3 px-2.5 text-right font-mono">$507.703</td>
                  <td className="py-3 px-2.5 text-right font-mono">$338.590</td>
                  <td className="py-3 px-2.5 text-right font-mono">$206.974</td>
                  <td className="py-3 px-2.5 text-right font-mono">$234.236</td>
                  <td className="py-3 px-2.5 text-right font-mono">$158.288</td>
                  <td className="py-3 px-2.5 text-right font-mono">$224.798</td>
                  <td className="py-3 px-2.5 text-right font-mono">$236.338</td>
                  <td className="py-3 px-3 text-right font-mono bg-slate-200 text-sky-950 text-sm">$191.739,35</td>
                  <td className="py-3 px-3 text-right font-mono text-sm text-sky-900 font-extrabold">$2.613.119,61</td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* PESTAÑA 2: SEPARACIÓN CONTABLE CAPEX vs OPEX (SEPTIEMBRE 2026) */}
      {subTab === 'reclasificacion' && (
        <div className="space-y-6">
          
          {/* Resumen Comparativo Antes vs Después */}
          <div className="bg-white/95 rounded-2xl p-5 border border-slate-300 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-5">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-emerald-600" />
                  <span>Separación CAPEX vs. OPEX en Mantenimiento de Flota (Septiembre 2026)</span>
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Marca o desmarca las intervenciones que deseas pasar de <strong>Mantto. Flota (OPEX)</strong> a <strong>CAPEX</strong> en el mes de Septiembre.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <label className="inline-flex items-center gap-2 text-xs font-bold bg-emerald-50 text-emerald-900 border border-emerald-300 px-3 py-2 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={incluirEquiposNuevosCapex}
                    onChange={(e) => setIncluirEquiposNuevosCapex(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Pasar Equipos Nuevos de Sep a CAPEX (+$3.786,83)</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-xs font-bold text-slate-500 uppercase">Escenario 1: Base Master Original</div>
                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Proyectos Internos (CAPEX):</span>
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
                    <span>Total Master Septiembre:</span>
                    <span className="font-mono">$191.739,35</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-300">
                <div className="text-xs font-bold text-emerald-800 uppercase">Monto Reclasificado (OPEX → CAPEX)</div>
                <div className="text-2xl font-black text-emerald-700 font-mono mt-2">
                  {formatExact(totalEquiposNuevosSep + totalVidaUtilSep)}
                </div>
                <div className="mt-2 space-y-1.5 text-xs text-emerald-900">
                  <div className="flex justify-between">
                    <span>• Equipos Nuevos (Ingreso Sep):</span>
                    <span className="font-mono font-bold">{formatExact(totalEquiposNuevosSep)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• Aumento de Vida Útil (Motores/Overhaul):</span>
                    <span className="font-mono font-bold">{formatExact(totalVidaUtilSep)}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-sky-950 text-white border border-sky-800">
                <div className="text-xs font-bold text-sky-300 uppercase">Escenario 2: Cierre Reclasificado Sep</div>
                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-sky-200">Nuevo CAPEX Total Sep:</span>
                    <span className="font-mono font-black text-emerald-300">{formatExact(34930.08 + totalEquiposNuevosSep + totalVidaUtilSep)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sky-200">Nuevo Mantto. Flota (OPEX):</span>
                    <span className="font-mono font-black text-amber-300">{formatExact(83729.79 - (totalEquiposNuevosSep + totalVidaUtilSep))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Mantto. Infraestructura:</span>
                    <span className="font-mono font-bold text-white">$41.739,91</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Administrativo (Admon):</span>
                    <span className="font-mono font-bold text-white">$31.339,57</span>
                  </div>
                  <div className="pt-2 border-t border-sky-800 flex justify-between font-black text-white">
                    <span>Total Master Septiembre:</span>
                    <span className="font-mono">$191.739,35</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SUB-BLOQUE A: 6 EQUIPOS NUEVOS INCORPORADOS EN SEPTIEMBRE */}
          <div className="bg-white/95 rounded-2xl p-5 border border-slate-300 shadow-sm overflow-x-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <span>A. Equipos Nuevos Incorporados en Septiembre 2026 (Pasan a CAPEX en Septiembre)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Como ingresaron en Septiembre, todas sus intervenciones de puesta a punto de este mes van a <strong>CAPEX</strong>. A partir de <strong>Octubre</strong>, si reciben mantenimientos mínimos o preventivos, irán a <strong>OPEX</strong>.
                </p>
              </div>
              <span className="text-xs font-mono font-black bg-emerald-100 text-emerald-900 border border-emerald-300 px-3 py-1 rounded-lg">
                Subtotal Equipos Nuevos Sep: $3.786,83 USD
              </span>
            </div>

            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-800 text-white font-bold">
                  <th className="py-2.5 px-3 rounded-l-lg">Código</th>
                  <th className="py-2.5 px-3">Equipo Nuevo Incorporado</th>
                  <th className="py-2.5 px-2">Familia</th>
                  <th className="py-2.5 px-2 text-center">Despachos Sep</th>
                  <th className="py-2.5 px-2 text-right">Materiales ($)</th>
                  <th className="py-2.5 px-2 text-right">Servicios ($)</th>
                  <th className="py-2.5 px-3 text-right bg-emerald-900 text-emerald-200">Total CAPEX Sep ($)</th>
                  <th className="py-2.5 px-3">Intervenciones Realizadas en Septiembre / Regla Octubre</th>
                  <th className="py-2.5 px-2 text-center rounded-r-lg">Auditar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {EQUIPOS_NUEVOS_SEPTIEMBRE_2026.map((eq) => (
                  <tr key={eq.codigo} className="hover:bg-emerald-50/40">
                    <td className="py-2.5 px-3 font-mono font-black text-emerald-800">{eq.codigo}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{eq.nombre}</td>
                    <td className="py-2.5 px-2 text-slate-600">{eq.familia}</td>
                    <td className="py-2.5 px-2 text-center font-mono">
                      {eq.registrosSep > 0 ? (
                        <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">{eq.registrosSep} reg.</span>
                      ) : (
                        <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded">0 reg.</span>
                      )}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono">{formatExact(eq.materialesUsd)}</td>
                    <td className="py-2.5 px-2 text-right font-mono">{formatExact(eq.serviciosUsd)}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-black bg-emerald-50 text-emerald-900">
                      {formatExact(eq.totalSepUsd)}
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-slate-600 max-w-md">
                      <div>{eq.detalleIntervencion}</div>
                      <div className="text-[10px] text-sky-700 font-semibold mt-0.5">→ {eq.reglaOctubre}</div>
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      {eq.registrosSep > 0 && (
                        <button
                          onClick={() => handleAbrirDesglose(eq.codigo, eq.nombre, eq.totalSepUsd)}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-sky-100 text-sky-700 font-bold text-[11px] cursor-pointer"
                        >
                          Ver ítems 🔍
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* SUB-BLOQUE B: INTERVENCIONES QUE AUMENTAN LA VIDA ÚTIL EN FLOTA EXISTENTE */}
          <div className="bg-white/95 rounded-2xl p-5 border border-slate-300 shadow-sm overflow-x-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-amber-600" />
                  <span>B. Consumos y Servicios en Mantto. Flota (OPEX) que Aumentan la Vida Útil (Capitalizables a CAPEX)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Activa o desactiva cada intervención para incluirla o excluirla de CAPEX en Septiembre.
                </p>
              </div>
              <span className="text-xs font-mono font-black bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1 rounded-lg">
                Seleccionado Vida Útil: {formatExact(totalVidaUtilSep)} USD
              </span>
            </div>

            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-800 text-white font-bold">
                  <th className="py-2.5 px-3 rounded-l-lg text-center">Incluir CAPEX</th>
                  <th className="py-2.5 px-2">Nivel</th>
                  <th className="py-2.5 px-2.5">Equipo</th>
                  <th className="py-2.5 px-3">Ítem / Servicio Capitalizable (Vida Útil)</th>
                  <th className="py-2.5 px-2">Comprobante</th>
                  <th className="py-2.5 px-2">Categoría</th>
                  <th className="py-2.5 px-3 text-right bg-amber-900 text-amber-200">Monto a CAPEX ($)</th>
                  <th className="py-2.5 px-3">Criterio Técnico / Contable</th>
                  <th className="py-2.5 px-2 text-center rounded-r-lg">Auditar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {INTERVENCIONES_VIDA_UTIL_SEPTIEMBRE_2026.map((item) => {
                  const checked = !!idsVidaUtilActivos[item.id];
                  return (
                    <tr key={item.id} className={checked ? 'bg-amber-50/40 hover:bg-amber-50/80' : 'hover:bg-slate-50 opacity-75'}>
                      <td className="py-2.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleItemVidaUtil(item.id)}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                      </td>
                      <td className="py-2.5 px-2">
                        {item.nivel === 'NIVEL_1_DIRECTO' ? (
                          <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-black text-[10px]">
                            Nivel 1 · Directo
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-bold text-[10px]">
                            Nivel 2 · Opcional
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-2.5">
                        <div className="font-mono font-black text-indigo-800">{item.codigoEquipo}</div>
                        <div className="text-[11px] text-slate-600">{item.nombreEquipo}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900">{item.descripcionItem}</div>
                        <div className="text-[10px] text-slate-500">Motivo: {item.motivo}</div>
                      </td>
                      <td className="py-2.5 px-2 font-mono text-[11px] text-slate-700">{item.comprobante}</td>
                      <td className="py-2.5 px-2 text-[11px] text-slate-600">{item.categoria}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900 bg-amber-50/60">
                        {formatExact(item.montoItemUsd)}
                      </td>
                      <td className="py-2.5 px-3 text-[11px] text-slate-600 max-w-xs">
                        {item.criterioContable}
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <button
                          onClick={() => handleAbrirDesglose(item.codigoEquipo, item.nombreEquipo, item.montoTotalEquipoMesUsd)}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-sky-100 text-sky-700 font-bold text-[11px] cursor-pointer"
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
      )}

      {/* PESTAÑA 3: INVERSIONES CAPEX */}
      {subTab === 'capex' && (
        <div className="space-y-6">
          
          {/* Tarjetas de Variaciones CAPEX */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Building2 className="w-4 h-4 text-sky-600" />
                <span>
                  {esSeptiembre 
                    ? 'Principales Proyectos CAPEX de Planta en Septiembre 2026 (vs Agosto)' 
                    : 'Variación por Proyecto CAPEX (Julio vs Agosto 2026)'}
                </span>
              </h3>
              <span className="text-xs text-slate-500 font-medium">Hacer clic en cualquier tarjeta para auditar sus despachos</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {(esSeptiembre ? VARIACIONES_CAPEX_AGO_SEP : VARIACIONES_CAPEX_JUL_AGO.map(v => ({
                cuenta: v.cuenta,
                proyecto: v.proyecto,
                anterior: v.julio,
                actual: v.agosto,
                porcentaje: v.porcentaje,
                esSubida: v.esSubida,
                explicacion: v.explicacion
              }))).map((v) => (
                <div 
                  key={v.cuenta} 
                  onClick={() => handleAbrirDesglose(v.cuenta, v.proyecto, v.actual)}
                  className="bg-white/95 rounded-2xl p-4 border border-slate-300/80 shadow-sm flex flex-col justify-between hover:border-sky-400 hover:shadow-md cursor-pointer transition-all group"
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
                      <span>{formatExact(v.actual)}</span>
                      <span className="text-[10px] text-sky-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">Ver 🔍</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Mes ant.: {formatCurrency(v.anterior)}
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-600 leading-relaxed italic">
                    "{v.explicacion}"
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Matriz Completa de Cuentas Auxiliares CAPEX (Enero - Septiembre 2026) */}
          <div className="bg-white/95 rounded-2xl p-5 border border-slate-300/80 shadow-sm overflow-x-auto">
            <h3 className="text-base font-black text-slate-900 mb-3 tracking-tight">
              Cuentas Auxiliares de Inversiones CAPEX (Enero – Septiembre 2026)
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
                  <th className="py-2.5 px-2 text-right">Ago</th>
                  <th className="py-2.5 px-2.5 text-right bg-sky-900 text-amber-300">Sep</th>
                  <th className="py-2.5 px-3 text-right rounded-r-lg font-mono">Total 2026 ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {CUENTAS_CAPEX_INTERNOS.map((c) => (
                  <tr 
                    key={c.cuentaAuxiliar} 
                    onClick={() => handleAbrirDesglose(c.cuentaAuxiliar, c.proyecto, esSeptiembre ? c.sep : c.ago)}
                    className="hover:bg-sky-50/80 cursor-pointer transition-colors group"
                  >
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-sky-800">{c.cuentaAuxiliar}</span>
                        <Eye className="w-3.5 h-3.5 text-sky-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-800 group-hover:text-sky-950">
                      {c.proyecto}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono text-slate-600">{c.ene > 0 ? formatCurrency(c.ene) : '-'}</td>
                    <td className="py-2.5 px-2 text-right font-mono text-slate-600">{c.feb > 0 ? formatCurrency(c.feb) : '-'}</td>
                    <td className="py-2.5 px-2 text-right font-mono text-slate-600">{c.mar > 0 ? formatCurrency(c.mar) : '-'}</td>
                    <td className="py-2.5 px-2 text-right font-mono text-slate-600">{c.abr > 0 ? formatCurrency(c.abr) : '-'}</td>
                    <td className="py-2.5 px-2 text-right font-mono text-slate-600">{c.may > 0 ? formatCurrency(c.may) : '-'}</td>
                    <td className="py-2.5 px-2 text-right font-mono text-slate-600">{c.jun > 0 ? formatCurrency(c.jun) : '-'}</td>
                    <td className="py-2.5 px-2 text-right font-mono text-slate-600">{c.jul > 0 ? formatCurrency(c.jul) : '-'}</td>
                    <td className="py-2.5 px-2 text-right font-mono text-slate-600">{c.ago > 0 ? formatCurrency(c.ago) : '-'}</td>
                    <td className="py-2.5 px-2.5 text-right font-mono font-bold bg-sky-50 text-sky-900">{c.sep > 0 ? formatExact(c.sep) : '-'}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900">{formatExact(c.total2026)}</td>
                  </tr>
                ))}
                <tr className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-300">
                  <td colSpan={2} className="py-3 px-3">SUBTOTAL CAPEX OBRAS / PLANTA (MASTER)</td>
                  <td className="py-3 px-2 text-right font-mono">$162.467</td>
                  <td className="py-3 px-2 text-right font-mono">$326.380</td>
                  <td className="py-3 px-2 text-right font-mono">$149.039</td>
                  <td className="py-3 px-2 text-right font-mono">$92.865</td>
                  <td className="py-3 px-2 text-right font-mono">$77.901</td>
                  <td className="py-3 px-2 text-right font-mono">$32.585</td>
                  <td className="py-3 px-2 text-right font-mono">$45.087</td>
                  <td className="py-3 px-2 text-right font-mono">$29.017</td>
                  <td className="py-3 px-2.5 text-right font-mono bg-sky-100 text-sky-900">$34.930,08</td>
                  <td className="py-3 px-3 text-right font-mono text-sky-950 font-extrabold">$950.271,43</td>
                </tr>
                {modoReclasificadoSep && (
                  <>
                    <tr className="bg-emerald-50/70 font-bold text-emerald-950">
                      <td colSpan={2} className="py-2.5 px-3">+ CAPEX Equipos Nuevos Incorporados en Septiembre (6 Equipos)</td>
                      <td colSpan={8} className="py-2.5 px-2 text-right text-[11px] text-emerald-700 italic">Acondicionamiento de ingreso en Sep (en Oct pasan a OPEX)</td>
                      <td className="py-2.5 px-2.5 text-right font-mono font-black text-emerald-800">{formatExact(totalEquiposNuevosSep)}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-black text-emerald-800">{formatExact(totalEquiposNuevosSep)}</td>
                    </tr>
                    <tr className="bg-amber-50/70 font-bold text-amber-950">
                      <td colSpan={2} className="py-2.5 px-3">+ CAPEX Extensión de Vida Útil en Flota (Motores / Overhauls)</td>
                      <td colSpan={8} className="py-2.5 px-2 text-right text-[11px] text-amber-800 italic">Intervenciones capitalizables desde Mantto. Flota</td>
                      <td className="py-2.5 px-2.5 text-right font-mono font-black text-amber-900">{formatExact(totalVidaUtilSep)}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-black text-amber-900">{formatExact(totalVidaUtilSep)}</td>
                    </tr>
                    <tr className="bg-sky-950 text-white font-black">
                      <td colSpan={2} className="py-3 px-3">TOTAL CAPEX CONSOLIDADO (OBRAS + FLOTA CAPITALIZABLE)</td>
                      <td className="py-3 px-2 text-right font-mono">$162.467</td>
                      <td className="py-3 px-2 text-right font-mono">$326.380</td>
                      <td className="py-3 px-2 text-right font-mono">$149.039</td>
                      <td className="py-3 px-2 text-right font-mono">$92.865</td>
                      <td className="py-3 px-2 text-right font-mono">$77.901</td>
                      <td className="py-3 px-2 text-right font-mono">$32.585</td>
                      <td className="py-3 px-2 text-right font-mono">$45.087</td>
                      <td className="py-3 px-2 text-right font-mono">$29.017</td>
                      <td className="py-3 px-2.5 text-right font-mono text-amber-300">{formatExact(34930.08 + totalEquiposNuevosSep + totalVidaUtilSep)}</td>
                      <td className="py-3 px-3 text-right font-mono text-emerald-300">{formatExact(950271.43 + totalEquiposNuevosSep + totalVidaUtilSep)}</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>

          {/* Top Voces de Gastos CAPEX */}
          <div className="bg-white/95 rounded-2xl p-5 border border-slate-300/80 shadow-sm">
            <h3 className="text-base font-black text-slate-900 mb-3 tracking-tight">
              Top Rubros y Proyectos en Inversiones CAPEX ({mesActivoRaw.mesLabel} 2026)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {(esSeptiembre ? TOP_VOCES_CAPEX_SEPTIEMBRE : TOP_VOCES_CAPEX_AGOSTO).map((v) => (
                <div key={v.rubro} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-sky-700 uppercase">{v.categoria}</span>
                    <span className="font-mono font-black text-slate-900 text-sm">{formatExact(v.monto)}</span>
                  </div>
                  <div className="font-bold text-xs text-slate-800 mb-1">{v.rubro}</div>
                  <div className="text-[11px] text-slate-500 leading-snug">{v.detalle}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* PESTAÑA 4: FLOTA & EQUIPOS OPEX */}
      {subTab === 'flota' && (
        <div className="space-y-6">
          
          {/* Top 10 Equipos Móviles con Mayor Gasto */}
          <div className="bg-white/95 rounded-2xl p-5 border border-slate-300/80 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Truck className="w-4 h-4 text-indigo-600" />
                  <span>Top 10 Equipos Móviles con Mayor Gasto ({mesActivoRaw.mesLabel} 2026)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  {esSeptiembre 
                    ? 'Total de los 10 equipos en Master Septiembre: $44.957,33 USD (53,7% del total de flota).'
                    : 'Total de los 10 equipos en Agosto: $64.839 USD (57% de todo el gasto de flota).'}
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-lg">
                {esSeptiembre ? 'Equipo Líder Sep: GR23 ($10.031,68)' : 'Equipo Líder Ago: GR17 ($23.206)'}
              </span>
            </div>

            {esSeptiembre ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
                {TOP_10_EQUIPOS_OPEX_SEPTIEMBRE.map((eq, idx) => (
                  <div 
                    key={eq.codigo} 
                    onClick={() => handleAbrirDesglose(eq.cuentaCompleta, eq.nombre, eq.montoSeptiembre)}
                    className={`p-3.5 rounded-xl border flex flex-col justify-between hover:shadow-md cursor-pointer transition-all group ${
                      eq.esEquipoNuevo
                        ? 'bg-emerald-50/70 border-emerald-300 hover:border-emerald-500'
                        : eq.esCapexVidaUtil
                          ? 'bg-amber-50/60 border-amber-300 hover:border-amber-500'
                          : 'bg-slate-50/80 border-slate-200 hover:border-indigo-400'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs font-black text-indigo-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                          #{idx + 1} · {eq.codigo}
                        </span>
                        {eq.esEquipoNuevo ? (
                          <span className="text-[9px] font-black bg-emerald-600 text-white px-1.5 py-0.5 rounded">EQUIPO NUEVO → CAPEX</span>
                        ) : eq.esCapexVidaUtil ? (
                          <span className="text-[9px] font-black bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded">VIDA ÚTIL → CAPEX</span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-500">{eq.tipo}</span>
                        )}
                      </div>
                      <h4 className="font-bold text-xs text-slate-900 mt-1 line-clamp-1" title={eq.nombre}>
                        {eq.nombre}
                      </h4>
                      <div className="text-lg font-black text-slate-900 font-mono mt-1 flex items-baseline justify-between">
                        <span>{formatExact(eq.montoSeptiembre)}</span>
                        <span className="text-[10px] text-indigo-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">Auditar 🔍</span>
                      </div>
                      {modoReclasificadoSep && eq.montoCapexReclasificado > 0 && (
                        <div className="text-[10px] font-bold text-emerald-800 mt-0.5">
                          Pasa a CAPEX: {formatExact(eq.montoCapexReclasificado)} | Queda OPEX: {formatExact(eq.montoSeptiembre - eq.montoCapexReclasificado)}
                        </div>
                      )}
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-slate-200/80 text-[10px] text-slate-600 leading-snug">
                      {eq.detalle}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
                {TOP_10_EQUIPOS_OPEX_AGOSTO.map((eq, idx) => (
                  <div 
                    key={eq.codigo} 
                    onClick={() => handleAbrirDesglose(eq.codigo, eq.nombre, eq.montoAgosto)}
                    className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 flex flex-col justify-between hover:border-indigo-400 hover:shadow-md cursor-pointer transition-all group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                          #{idx + 1} · {eq.codigo}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500">{eq.tipo}</span>
                      </div>
                      <h4 className="font-bold text-xs text-slate-900 mt-1 line-clamp-1" title={eq.nombre}>
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
            )}
          </div>

          {/* Tabla Mensual por Tipo de Activo Productivo (Ene - Sep 2026) */}
          <div className="bg-white/95 rounded-2xl p-5 border border-slate-300/80 shadow-sm overflow-x-auto">
            <h3 className="text-base font-black text-slate-900 mb-3 tracking-tight">
              Evolución Mensual por Familia de Activos Móviles (Enero – Septiembre 2026)
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
                  <th className="py-2.5 px-2 text-right">Ago</th>
                  <th className="py-2.5 px-2.5 text-right bg-indigo-900 text-amber-300">Sep (Master)</th>
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
                    <td className="py-2 px-2 text-right font-mono text-slate-600">{t.ago > 0 ? formatCurrency(t.ago) : '-'}</td>
                    <td className="py-2 px-2.5 text-right font-mono font-bold bg-indigo-50 text-indigo-900">{t.sep > 0 ? formatExact(t.sep) : '-'}</td>
                    <td className="py-2 px-3 text-right font-mono font-black text-slate-900">{formatExact(t.total)}</td>
                  </tr>
                ))}
                <tr className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-300">
                  <td className="py-3 px-3">TOTAL MANTTO. FLOTA MASTER (SIN RECLASIFICAR)</td>
                  <td className="py-3 px-2 text-right font-mono">$143.581</td>
                  <td className="py-3 px-2 text-right font-mono">$102.274</td>
                  <td className="py-3 px-2 text-right font-mono">$83.194</td>
                  <td className="py-3 px-2 text-right font-mono">$59.543</td>
                  <td className="py-3 px-2 text-right font-mono">$68.409</td>
                  <td className="py-3 px-2 text-right font-mono">$72.213</td>
                  <td className="py-3 px-2 text-right font-mono">$97.727</td>
                  <td className="py-3 px-2 text-right font-mono">$113.450</td>
                  <td className="py-3 px-2.5 text-right font-mono bg-indigo-100 text-indigo-950">$83.729,79</td>
                  <td className="py-3 px-3 text-right font-mono text-indigo-950">$824.120,75</td>
                </tr>
                {modoReclasificadoSep && (
                  <>
                    <tr className="bg-rose-50/70 font-bold text-rose-900">
                      <td className="py-2.5 px-3">− Reclasificado a CAPEX en Septiembre (Equipos Nuevos + Vida Útil)</td>
                      <td colSpan={8} className="py-2.5 px-2 text-right text-[11px] italic">Se traslada al bloque CAPEX de Septiembre</td>
                      <td className="py-2.5 px-2.5 text-right font-mono font-black text-rose-700">−{formatExact(montoReclasificadoSep)}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-black text-rose-700">−{formatExact(montoReclasificadoSep)}</td>
                    </tr>
                    <tr className="bg-indigo-950 text-white font-black">
                      <td className="py-3 px-3">TOTAL MANTTO. FLOTA DEPURADO (OPEX PURO)</td>
                      <td className="py-3 px-2 text-right font-mono">$143.581</td>
                      <td className="py-3 px-2 text-right font-mono">$102.274</td>
                      <td className="py-3 px-2 text-right font-mono">$83.194</td>
                      <td className="py-3 px-2 text-right font-mono">$59.543</td>
                      <td className="py-3 px-2 text-right font-mono">$68.409</td>
                      <td className="py-3 px-2 text-right font-mono">$72.213</td>
                      <td className="py-3 px-2 text-right font-mono">$97.727</td>
                      <td className="py-3 px-2 text-right font-mono">$113.450</td>
                      <td className="py-3 px-2.5 text-right font-mono text-amber-300">{formatExact(opexFlotaEfectivoMes)}</td>
                      <td className="py-3 px-3 text-right font-mono text-emerald-300">{formatExact(824120.75 - montoReclasificadoSep)}</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>

          {/* Voces de Gasto de Flota */}
          <div className="bg-white/95 rounded-2xl p-5 border border-slate-300/80 shadow-sm">
            <h3 className="text-base font-black text-slate-900 mb-3 tracking-tight">
              Voces de Gasto en Mantenimiento de Flota ({mesActivoRaw.mesLabel} 2026)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {(esSeptiembre ? VOCES_GASTO_OPEX_FLOTA_SEPTIEMBRE : VOCES_GASTO_OPEX_FLOTA_AGOSTO).map((v) => (
                <div key={v.rubro} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-indigo-700 uppercase">{v.grupo}</span>
                    <span className="font-mono font-black text-slate-900 text-sm">{formatExact(v.monto)}</span>
                  </div>
                  <div className="font-bold text-xs text-slate-800 mb-1">{v.rubro}</div>
                  <div className="text-[11px] text-slate-500 leading-snug">{v.detalle}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* PESTAÑA 5: FLOTA DE 26 GRÚAS */}
      {subTab === 'gruas' && (
        <div className="space-y-6">
          <div className="bg-white/95 rounded-2xl p-5 border border-slate-300/80 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-sky-600" />
                  <span>Control de Flota: 26 Grúas TIMACA (Enero – Septiembre 2026)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Septiembre 2026: $32.984,63 USD (▲ 1,9% vs Agosto $32.364) | Acumulado Ene-Sep 2026: $366.456,10 USD.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold bg-sky-50 text-sky-800 border border-sky-200 px-3 py-1 rounded-lg">
                  26 Grúas Operativas
                </span>
              </div>
            </div>

            {/* Top 5 Grúas del Mes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 mb-6">
              {(esSeptiembre ? FLOTA_GRUAS_TIMACA_2026.top5GruasSeptiembre : FLOTA_GRUAS_TIMACA_2026.top5GruasAgosto).map((g) => (
                <div 
                  key={g.codigo} 
                  onClick={() => g.codigo !== 'OTRAS' && handleAbrirDesglose(g.codigo, g.descripcion, g.monto)}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-sky-400 hover:shadow-md cursor-pointer transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-500 group-hover:text-sky-700">{g.codigo}</span>
                    <span className="text-[10px] text-sky-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">Ver 🔍</span>
                  </div>
                  <div className="text-base font-black text-slate-900 font-mono mt-0.5">{formatExact(g.monto)}</div>
                  <div className="text-[11px] text-slate-600 font-medium truncate mt-1" title={g.descripcion}>{g.descripcion}</div>
                  <div className="text-[10px] font-bold text-sky-600 mt-1">{g.variacion}</div>
                </div>
              ))}
            </div>

            {/* Tabla Detalle Grúas con Mayor Movimiento */}
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
                    <th className="py-2.5 px-2 text-right">Ago</th>
                    <th className="py-2.5 px-2.5 text-right bg-sky-900 text-amber-300">Sep</th>
                    <th className="py-2.5 px-3 text-right rounded-r-lg">Variación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {FLOTA_GRUAS_TIMACA_2026.detalleGruasMayorVariacion.map((gr) => (
                    <tr 
                      key={gr.codigo} 
                      onClick={() => handleAbrirDesglose(gr.codigo, gr.proyecto, esSeptiembre ? gr.sep : gr.ago)}
                      className="hover:bg-sky-50/80 cursor-pointer transition-colors group"
                    >
                      <td className="py-2.5 px-3 font-mono font-bold text-sky-800">{gr.codigo}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-800">{gr.proyecto}</td>
                      <td className="py-2.5 px-2 text-right font-mono text-slate-600">{gr.ene > 0 ? formatCurrency(gr.ene) : '-'}</td>
                      <td className="py-2.5 px-2 text-right font-mono text-slate-600">{gr.feb > 0 ? formatCurrency(gr.feb) : '-'}</td>
                      <td className="py-2.5 px-2 text-right font-mono text-slate-600">{gr.mar > 0 ? formatCurrency(gr.mar) : '-'}</td>
                      <td className="py-2.5 px-2 text-right font-mono text-slate-600">{gr.abr > 0 ? formatCurrency(gr.abr) : '-'}</td>
                      <td className="py-2.5 px-2 text-right font-mono text-slate-600">{gr.may > 0 ? formatCurrency(gr.may) : '-'}</td>
                      <td className="py-2.5 px-2 text-right font-mono text-slate-600">{gr.jun > 0 ? formatCurrency(gr.jun) : '-'}</td>
                      <td className="py-2.5 px-2 text-right font-mono text-slate-600">{gr.jul > 0 ? formatCurrency(gr.jul) : '-'}</td>
                      <td className="py-2.5 px-2 text-right font-mono text-slate-600">{gr.ago > 0 ? formatCurrency(gr.ago) : '-'}</td>
                      <td className="py-2.5 px-2.5 text-right font-mono font-bold bg-sky-50 text-sky-900">{formatExact(gr.sep)}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-700">{gr.variacion}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1.5">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-sky-600" />
                <span>Auditoría de Variaciones Técnicas en Grúas:</span>
              </div>
              {FLOTA_GRUAS_TIMACA_2026.analisisCausas.map((c, i) => (
                <p key={i} className="text-slate-600 pl-5 leading-relaxed">• {c}</p>
              ))}
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
                  <span>Mantenimiento de Infraestructura & Galpones (Enero – Septiembre 2026)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Septiembre 2026: $41.739,91 USD (▲ 2,9% vs Agosto $40.545) | Acumulado Ene-Sep 2026: $401.562,86 USD.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold bg-teal-50 text-teal-800 border border-teal-200 px-3 py-1 rounded-lg">
                  Master Sep: $41.739,91 USD
                </span>
              </div>
            </div>

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
                    <th className="py-2.5 px-2 text-right">Ago</th>
                    <th className="py-2.5 px-2.5 text-right bg-teal-900 text-amber-300">Sep</th>
                    <th className="py-2.5 px-3 text-right rounded-r-lg font-mono">Total 2026 ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {MANTTO_INFRAESTRUCTURA_2026.cuentas.map((c) => (
                    <tr 
                      key={c.cuenta} 
                      onClick={() => handleAbrirDesglose(c.cuenta, c.descripcion, esSeptiembre ? c.sep : c.ago)}
                      className="hover:bg-teal-50/80 cursor-pointer transition-colors group"
                    >
                      <td className="py-2.5 px-3 font-mono font-bold text-teal-800">{c.cuenta}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-800">{c.descripcion}</td>
                      <td className="py-2 px-2 text-right font-mono text-slate-600">{c.ene > 0 ? formatCurrency(c.ene) : '-'}</td>
                      <td className="py-2 px-2 text-right font-mono text-slate-600">{c.feb > 0 ? formatCurrency(c.feb) : '-'}</td>
                      <td className="py-2 px-2 text-right font-mono text-slate-600">{c.mar > 0 ? formatCurrency(c.mar) : '-'}</td>
                      <td className="py-2 px-2 text-right font-mono text-slate-600">{c.abr > 0 ? formatCurrency(c.abr) : '-'}</td>
                      <td className="py-2 px-2 text-right font-mono text-slate-600">{c.may > 0 ? formatCurrency(c.may) : '-'}</td>
                      <td className="py-2 px-2 text-right font-mono text-slate-600">{c.jun > 0 ? formatCurrency(c.jun) : '-'}</td>
                      <td className="py-2 px-2 text-right font-mono text-slate-600">{c.jul > 0 ? formatCurrency(c.jul) : '-'}</td>
                      <td className="py-2 px-2 text-right font-mono text-slate-600">{formatCurrency(c.ago)}</td>
                      <td className="py-2 px-2.5 text-right font-mono font-bold bg-teal-50 text-teal-900">{formatExact(c.sep)}</td>
                      <td className="py-2 px-3 text-right font-mono font-black text-slate-900">{formatExact(c.total)}</td>
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
                    <td className="py-3 px-2 text-right font-mono">$40.545</td>
                    <td className="py-3 px-2.5 text-right font-mono bg-teal-100 text-teal-900">$41.739,91</td>
                    <td className="py-3 px-3 text-right font-mono text-teal-950 font-extrabold">$401.562,86</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 7: GASTOS ADMINISTRATIVOS (ADMON - $31.339,57) */}
      {subTab === 'admon' && (
        <div className="space-y-6">
          <div className="bg-white/95 rounded-2xl p-5 border border-slate-300/80 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-amber-600" />
                  <span>Gastos Administrativos y Departamentales (Admon — Septiembre 2026)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Total conciliado con Master Septiembre 2026: <strong>$31.339,57 USD</strong>. Haz clic en cualquier cuenta para auditar sus despachos y servicios.
                </p>
              </div>
              <span className="text-xs font-mono font-black bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1 rounded-lg">
                Total Admon Sep: $31.339,57 USD
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-800 text-white font-bold">
                    <th className="py-2.5 px-3 rounded-l-lg">Cuenta Auxiliar</th>
                    <th className="py-2.5 px-3">Departamento / Gerencia</th>
                    <th className="py-2.5 px-2.5 text-right">Materiales ($)</th>
                    <th className="py-2.5 px-2.5 text-right">Servicios ($)</th>
                    <th className="py-2.5 px-3 text-right bg-amber-900 text-amber-200">Total Septiembre ($)</th>
                    <th className="py-2.5 px-3 rounded-r-lg">Principales Consumos y Servicios del Mes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {CUENTAS_ADMON_SEPTIEMBRE_2026.map((a) => (
                    <tr 
                      key={a.cuenta}
                      onClick={() => a.cuenta !== 'OTRAS-ADMON' && handleAbrirDesglose(a.cuenta, a.departamento, a.totalSepUsd)}
                      className="hover:bg-amber-50/60 cursor-pointer transition-colors"
                    >
                      <td className="py-2.5 px-3 font-mono font-bold text-amber-800">{a.cuenta}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{a.departamento}</td>
                      <td className="py-2.5 px-2.5 text-right font-mono text-slate-600">{formatExact(a.materialesUsd)}</td>
                      <td className="py-2.5 px-2.5 text-right font-mono text-slate-600">{formatExact(a.serviciosUsd)}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-black bg-amber-50 text-amber-950">{formatExact(a.totalSepUsd)}</td>
                      <td className="py-2.5 px-3 text-[11px] text-slate-600">{a.principalesConsumos}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-300">
                    <td colSpan={2} className="py-3 px-3">TOTAL GASTOS ADMINISTRATIVOS (ADMON SEPTIEMBRE)</td>
                    <td className="py-3 px-2.5 text-right font-mono">$24.629,10</td>
                    <td className="py-3 px-2.5 text-right font-mono">$6.710,47</td>
                    <td className="py-3 px-3 text-right font-mono bg-amber-200 text-amber-950 text-sm">$31.339,57</td>
                    <td className="py-3 px-3 text-[11px] text-slate-500">Conciliado con Master Septiembre 2026</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 8: MOD MANTENIMIENTO */}
      {subTab === 'mod' && (
        <div className="space-y-6">
          {esSeptiembre && (
            <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 text-xs text-sky-950 flex items-start gap-3">
              <Clock className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-black text-sm">Horas Hombre (MOD) de Flota y Proyectos — Septiembre 2026 (En espera de carga definitiva)</div>
                <p className="mt-1 text-slate-600">
                  Cuando tengas lista la sábana definitiva de Horas Hombre de Septiembre para Flota y Proyectos Internos, la integraremos aquí para que sume automáticamente al costo de cada equipo y proyecto. Debajo puedes consultar la estructura base de Agosto (4.697 HH · $9.644 USD).
                </p>
              </div>
            </div>
          )}

          <div className="bg-white/95 rounded-2xl p-5 border border-slate-300/80 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>Mano de Obra Directa (MOD) - Taller Mecánico & Mantenimiento (Base Agosto 2026)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Nómina operativa de 27 técnicos y mecánicos dedicados al mantenimiento interno.
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-lg">
                Total MOD Ago: $9.644 USD | 4.697 Horas Hombre
              </span>
            </div>

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

      {/* ===================== MODAL DE DESGLOSE Y AUDITORÍA DE MONTOS ===================== */}
      {selectedActivoParaDesglose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-300 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-scale-up">
            
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-5 flex items-start justify-between gap-4 border-b border-slate-700">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="font-mono text-xs font-black bg-sky-500/20 text-sky-300 border border-sky-400/30 px-2.5 py-0.5 rounded-lg">
                    {selectedActivoParaDesglose.codigo}
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 bg-slate-800 px-2.5 py-0.5 rounded-lg border border-slate-700">
                    {selectedActivoParaDesglose.responsableArea}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {selectedActivoParaDesglose.titulo}
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
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Exportar Excel</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedActivoParaDesglose(null)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-100/90 border-b border-slate-200 text-xs">
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <div className="text-[10px] uppercase font-bold text-slate-400">Total Ejecutado ({mesActivoRaw.mesLabel})</div>
                <div className="text-lg font-black text-slate-900 font-mono mt-0.5">
                  {formatExact(selectedActivoParaDesglose.montoAgosto)}
                </div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <div className="text-[10px] uppercase font-bold text-slate-400">Ítems Auditados</div>
                <div className="text-lg font-black text-indigo-900 font-mono mt-0.5">
                  {selectedActivoParaDesglose.items.length} Registros
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
                      <tr className="bg-slate-800 text-white font-bold">
                        <th className="py-2.5 px-3">Comprobante</th>
                        <th className="py-2.5 px-3">Descripción e Ítem Técnico</th>
                        <th className="py-2.5 px-2">Categoría / Rubro</th>
                        <th className="py-2.5 px-2 text-right">Cant.</th>
                        <th className="py-2.5 px-2 text-right">P. Unit ($)</th>
                        <th className="py-2.5 px-3 text-right bg-sky-900 text-sky-200 font-mono">Monto Total ($)</th>
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
                            {item.montoUnitario ? formatExact(item.montoUnitario) : '-'}
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
