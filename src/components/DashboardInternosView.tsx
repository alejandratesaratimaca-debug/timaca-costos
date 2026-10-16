import React, { useState, useMemo, useEffect } from 'react';
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
  BarChart2,
  FolderDown,
  Search,
  Filter,
  Check,
  RotateCcw,
  AlertTriangle
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
  TOTALES_MOD_SEPTIEMBRE_2026,
  HORAS_HOMBRE_POR_CUENTA_SEPTIEMBRE,
  HORAS_HOMBRE_SIN_CUENTA_SEPTIEMBRE,
  HORAS_HOMBRE_POR_FAMILIA_SEPTIEMBRE,
  HORAS_HOMBRE_POR_TRABAJADOR_SEPTIEMBRE,
  EVOLUTIVO_SEMANAL_MOD_SEPTIEMBRE_2026,
  HorasHombreCuentaSep,
  HorasHombrePendienteConciliacion
} from '../data/horasHombreSeptiembreData';
import { 
  getDesgloseInterno, 
  DetalleCuentaOActivo, 
  ItemDesgloseInterno 
} from '../data/desgloseDetalleInternos';
import { SALIDAS_REALES_SEPTIEMBRE_2026 } from '../data/realSalidasSeptiembre2026';
import { formatCurrency, formatNumber } from '../utils/dateHelpers';
import { UsuarioSistema } from '../types/usuarios';

export type SubTabInternos = 'resumen' | 'mod' | 'capex' | 'flota' | 'infra' | 'reclasificacion' | 'admon' | 'gruas';

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
  
  // Por regla contable: ÚNICAMENTE el autobús con motor Cummins ($8.500) pasa a CAPEX. Los demás ("periquitos") quedan en OPEX Flota.
  const [idsVidaUtilActivos, setIdsVidaUtilActivos] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    INTERVENCIONES_VIDA_UTIL_SEPTIEMBRE_2026.forEach(item => {
      map[item.id] = item.activoPorDefecto;
    });
    return map;
  });

  // Filtros de búsqueda en tablas
  const [busquedaMOD, setBusquedaMOD] = useState<string>('');
  const [filtroFamiliaMOD, setFiltroFamiliaMOD] = useState<string>('todos');
  const [busquedaConciliacion, setBusquedaConciliacion] = useState<string>('');
  const [selectedActivoParaDesglose, setSelectedActivoParaDesglose] = useState<DetalleCuentaOActivo | null>(null);

  useEffect(() => {
    if (activeSubTab && activeSubTab !== subTab) {
      setSubTab(activeSubTab as SubTabInternos);
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

  // Montos oficiales de la presentación ejecutiva y tablas dinámicas de TIMACA
  const capexEfectivoMes = esSeptiembre ? 63323.92 : mesActivoRaw.capex;
  const opexFlotaEfectivoMes = esSeptiembre ? 65757.04 : mesActivoRaw.opexActivos;
  const opexInfraEfectivoMes = esSeptiembre ? 42818.77 : mesActivoRaw.opexInfraestructura;
  const totalOpexEfectivoMes = opexFlotaEfectivoMes + opexInfraEfectivoMes;
  const totalGeneralConAdmonMes = esSeptiembre ? 171899.73 : (capexEfectivoMes + totalOpexEfectivoMes);

  const formatExact = (val: number) => {
    return '$' + val.toLocaleString('de-DE', { minimumFractionDigits: val % 1 !== 0 ? 2 : 0, maximumFractionDigits: 2 });
  };

  // Filtrado de cuentas de Horas Hombre Septiembre
  const cuentasMODFiltradas = useMemo(() => {
    return HORAS_HOMBRE_POR_CUENTA_SEPTIEMBRE.filter(item => {
      const matchBusqueda = busquedaMOD === '' || 
        item.cuenta.toLowerCase().includes(busquedaMOD.toLowerCase()) ||
        item.equipo.toLowerCase().includes(busquedaMOD.toLowerCase()) ||
        item.tipo.toLowerCase().includes(busquedaMOD.toLowerCase()) ||
        item.principalesLabores.toLowerCase().includes(busquedaMOD.toLowerCase());
      
      const matchFamilia = filtroFamiliaMOD === 'todos' || item.tipo === filtroFamiliaMOD;
      return matchBusqueda && matchFamilia;
    });
  }, [busquedaMOD, filtroFamiliaMOD]);

  // Filtrado de ítems sin cuenta auxiliar para conciliación
  const sinCuentaMODFiltrados = useMemo(() => {
    return HORAS_HOMBRE_SIN_CUENTA_SEPTIEMBRE.filter(item => {
      return busquedaConciliacion === '' ||
        item.trabajador.toLowerCase().includes(busquedaConciliacion.toLowerCase()) ||
        item.motivoLabor.toLowerCase().includes(busquedaConciliacion.toLowerCase()) ||
        item.tipoEquipo.toLowerCase().includes(busquedaConciliacion.toLowerCase());
    });
  }, [busquedaConciliacion]);

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

  const handleDescargarExcelConciliacion = () => {
    const dataExcel = HORAS_HOMBRE_POR_CUENTA_SEPTIEMBRE.map((item, idx) => ({
      '#': idx + 1,
      'Cuenta Auxiliar': item.cuenta,
      'Equipo / Activo': item.equipo,
      'Familia / Tipo': item.tipo,
      'Total Horas Hombre (HH)': item.totalHoras,
      'Órdenes / Registros': item.registros,
      'N° Técnicos': item.cantTrabajadores,
      'Técnicos Intervinientes': item.trabajadores.join(', '),
      'Principales Labores / Motivos': item.principalesLabores
    }));

    const ws = XLSX.utils.json_to_sheet(dataExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'MOD_Septiembre_5963_HH');
    XLSX.writeFile(wb, 'TIMACA_MOD_Mantenimiento_ECO_Septiembre_2026_5963HH.xlsx');
  };

  const pctCapex = totalGeneralConAdmonMes > 0 ? Math.round((capexEfectivoMes / totalGeneralConAdmonMes) * 1000) / 10 : 0;
  const pctFlota = totalGeneralConAdmonMes > 0 ? Math.round((opexFlotaEfectivoMes / totalGeneralConAdmonMes) * 1000) / 10 : 0;
  const pctInfra = totalGeneralConAdmonMes > 0 ? Math.round((opexInfraEfectivoMes / totalGeneralConAdmonMes) * 1000) / 10 : 0;
  const pctAdmon = totalGeneralConAdmonMes > 0 ? Math.round((admonEfectivoMes / totalGeneralConAdmonMes) * 1000) / 10 : 0;

  return (
    <div className="space-y-6">
      
      {/* ========================================================================= */}
      {/* 1. TOP INFORMATION BANNER (IDÉNTICO A PROYECTOS EXTERNOS)                 */}
      {/* ========================================================================= */}
      <div className="bg-slate-50 border border-slate-200 text-slate-800 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl shadow-2xs transition-all">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Control de Gestión & Costos Industriales TIMACA
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  Proyectos Internos & Flota
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Consolidación oficial (CAPEX · Mantto. Flota OPEX · Infraestructura · Administrativo · MOD ECO).
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => handleTabChange('mod')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors shadow-2xs cursor-pointer"
              title="Ver Horas Hombre de Mantenimiento Equipos Septiembre"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>MOD Septiembre (5.963 HH)</span>
            </button>

            <button
              onClick={() => handleTabChange('reclasificacion')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-950 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-lg transition-colors shadow-2xs cursor-pointer"
              title="Separación contable CAPEX vs OPEX"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-700" />
              <span>Simulador Reclasificación</span>
            </button>

            {onGoToPPT && (
              <button
                onClick={onGoToPPT}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap shadow-2xs cursor-pointer"
                title="Dossier Ejecutivo de Internos"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Informe PPT</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. KPI HEADER DE INTERNOS (MISMA ESTRUCTURA Y ESTÉTICA DE EXTERNOS)       */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* KPI 1: CAPEX Proyectos Internos */}
        <div 
          onClick={() => handleTabChange('capex')}
          className="bg-white p-4.5 rounded-xl border border-neutral-200/90 shadow-2xs hover:shadow-md hover:border-indigo-500 transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between h-full min-h-[148px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              1. Inversiones CAPEX
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="my-1.5">
            <div className="text-2xl font-black text-neutral-900 font-mono tracking-tight">
              {formatExact(capexEfectivoMes)}
            </div>
            <div className="text-[11px] text-neutral-500 mt-0.5 truncate">
              {esSeptiembre 
                ? 'Proyectos $34.995 + Activos $28.329' 
                : 'Obras civiles, galpones y patios'}
            </div>
          </div>
          <div className="flex items-center justify-between text-xs pt-2 border-t border-neutral-100">
            <span className="text-emerald-700 font-bold flex items-center gap-0.5 text-[11px]">
              {esSeptiembre ? '▲ +118% vs Ago ($29.017)' : '▼ 36% vs Jul'}
            </span>
            <span className="font-bold text-neutral-500 text-[11px]">{pctCapex}% del total</span>
          </div>
        </div>

        {/* KPI 2: Mantto. Flota (OPEX) */}
        <div 
          onClick={() => handleTabChange('flota')}
          className="bg-white p-4.5 rounded-xl border border-neutral-200/90 shadow-2xs hover:shadow-md hover:border-blue-500 transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between h-full min-h-[148px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              2. Mantto. Flota (OPEX)
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="my-1.5">
            <div className="text-2xl font-black text-neutral-900 font-mono tracking-tight">
              {formatExact(opexFlotaEfectivoMes)}
            </div>
            <div className="text-[11px] text-neutral-500 mt-0.5 truncate">
              {esSeptiembre 
                ? 'Equipos móviles y activos productivos' 
                : 'Flota pesada, grúas y livianos'}
            </div>
          </div>
          <div className="flex items-center justify-between text-xs pt-2 border-t border-neutral-100">
            <span className="text-blue-700 font-bold flex items-center gap-0.5 text-[11px]">
              {esSeptiembre ? '▼ 42% vs Ago ($113.450)' : '▲ 16% vs Jul'}
            </span>
            <span className="font-bold text-neutral-500 text-[11px]">{pctFlota}% del total</span>
          </div>
        </div>

        {/* KPI 3: Mantto. Infraestructura (OPEX) */}
        <div 
          onClick={() => handleTabChange('infra')}
          className="bg-white p-4.5 rounded-xl border border-neutral-200/90 shadow-2xs hover:shadow-md hover:border-emerald-500 transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between h-full min-h-[148px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              3. Infraestructura (OPEX)
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Wrench className="w-5 h-5" />
            </div>
          </div>
          <div className="my-1.5">
            <div className="text-2xl font-black text-neutral-900 font-mono tracking-tight">
              {formatExact(opexInfraEfectivoMes)}
            </div>
            <div className="text-[11px] text-neutral-500 mt-0.5 truncate">
              TT-I-C-033 Adecuaciones: $29.172
            </div>
          </div>
          <div className="flex items-center justify-between text-xs pt-2 border-t border-neutral-100">
            <span className="text-emerald-700 font-bold flex items-center gap-0.5 text-[11px]">
              {esSeptiembre ? '▲ +6% vs Ago ($40.545)' : '▼ 3% vs Jul'}
            </span>
            <span className="font-bold text-neutral-500 text-[11px]">{pctInfra}% del total</span>
          </div>
        </div>

        {/* KPI 4: Mano de Obra Directa (MOD ECO) */}
        <div 
          onClick={() => handleTabChange('mod')}
          className="bg-white p-4.5 rounded-xl border border-neutral-200/90 shadow-2xs hover:shadow-md hover:border-purple-500 transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between h-full min-h-[148px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              4. Mano de Obra (MOD)
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="my-1.5">
            <div className="text-2xl font-black text-purple-950 font-mono tracking-tight">
              {TOTALES_MOD_SEPTIEMBRE_2026.totalHorasHombre.toLocaleString('de-DE')} HH
            </div>
            <div className="text-[11px] text-neutral-500 mt-0.5 truncate">
              1.336 registros de trabajo · 162 cuentas auxiliares
            </div>
          </div>
          <div className="flex items-center justify-between text-xs pt-2 border-t border-neutral-100">
            <span className="text-purple-700 font-bold flex items-center gap-0.5 text-[11px]">
              30 Mecánicos ECO
            </span>
            <span className="font-mono text-neutral-600 font-bold text-[11px]">
              ~${TOTALES_MOD_SEPTIEMBRE_2026.costoEstimadoTotalUSD.toLocaleString('de-DE')} USD
            </span>
          </div>
        </div>

        {/* KPI 5: Total General Consolidado */}
        <div className="bg-white p-4.5 rounded-xl border border-amber-300/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between h-full min-h-[148px] bg-gradient-to-br from-white to-amber-50/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
              Total {mesActivoRaw.mesLabel}
            </span>
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="my-1.5">
            <div className="text-2xl font-black text-neutral-900 font-mono tracking-tight">
              {formatExact(totalGeneralConAdmonMes)}
            </div>
            <div className="text-[11px] text-neutral-600 mt-0.5 truncate">
              CAPEX ($63.324) + OPEX ($108.576)
            </div>
          </div>
          <div className="flex items-center justify-between text-xs pt-2 border-t border-neutral-200">
            <span className="text-amber-800 font-bold text-[11px]">
              OPEX: {formatExact(totalOpexEfectivoMes)}
            </span>
            <span className="font-mono text-neutral-600 font-bold text-[11px]">
              {esSeptiembre ? 'Acum. $2.187.455' : 'Conciliado'}
            </span>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. BARRA DE CONTROL: SELECTOR DE MES Y SUB-PESTAÑAS (ESTILO SAAS)         */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-neutral-200 shadow-2xs">
        
        {/* Selector de Meses */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-700 mr-1">
            <Calendar className="w-4 h-4 text-neutral-500" />
            <span>Mes:</span>
          </div>
          {EVOLUTIVO_INTERNOS_2026.map((m, idx) => {
            const isSelected = selectedMesIdx === idx;
            return (
              <button
                key={m.mesCorto}
                onClick={() => setSelectedMesIdx(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900'
                }`}
              >
                {m.mesCorto}
                {idx === 8 && <span className="ml-1 text-[9px] bg-amber-400 text-slate-950 px-1 rounded font-black">NUEVO</span>}
              </button>
            );
          })}
        </div>

        {/* Sub-Pestañas en Estilo Pill de Proyectos Externos */}
        <div className="flex items-center bg-neutral-100 p-1 rounded-xl text-xs font-bold overflow-x-auto">
          {[
            { id: 'resumen', label: 'Tablero General' },
            { id: 'mod', label: 'Mano de Obra (5.963 HH)' },
            { id: 'capex', label: 'Inversiones CAPEX' },
            { id: 'flota', label: 'Mantto. Flota (OPEX)' },
            { id: 'infra', label: 'Infraestructura' },
            { id: 'reclasificacion', label: 'Separación CAPEX/OPEX' },
            { id: 'admon', label: 'Administrativo ($31,3k)' },
            { id: 'gruas', label: 'Flota 26 Grúas' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => handleTabChange(t.id as SubTabInternos)}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                subTab === t.id
                  ? 'bg-white text-neutral-900 shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

      </div>

      {/* ========================================================================= */}
      {/* VISTA 1: TABLERO GENERAL (RESUMEN EJECUTIVO CON GRÁFICO MULTI-COLOR)      */}
      {/* ========================================================================= */}
      {subTab === 'resumen' && (
        <div className="space-y-6">
          
          {/* Main Multi-Colored Interactive Chart */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-blue-600" />
                  <h3 className="text-base font-bold text-neutral-900 tracking-tight">
                    Evolución Mensual de Costos Internos (Enero – Septiembre 2026)
                  </h3>
                </div>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Distribución mensual de los 4 bloques: Inversiones CAPEX, Mantto. Flota, Infraestructura y Administrativo.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-neutral-700 bg-neutral-100 px-2.5 py-1 rounded-lg">
                  Acumulado Total: {formatCurrency(TOTALES_ACUMULADOS_INTERNOS_2026.totalConAdmon)}
                </span>
              </div>
            </div>

            {/* Barras de Evolución Mensual */}
            <div className="h-64 flex items-end justify-between gap-2.5 pt-6 pb-2 px-2">
              {EVOLUTIVO_INTERNOS_2026.map((m, idx) => {
                const maxVal = 520000;
                const capexMes = idx === 8 ? capexEfectivoMes : m.capex;
                const flotaMes = idx === 8 ? opexFlotaEfectivoMes : m.opexActivos;
                const infraMes = m.opexInfraestructura;
                const admonMes = m.admon || 0;
                const totalBarra = capexMes + flotaMes + infraMes + admonMes;

                const hCapex = Math.max(6, (capexMes / maxVal) * 100);
                const hFlota = Math.max(6, (flotaMes / maxVal) * 100);
                const hInfra = Math.max(6, (infraMes / maxVal) * 100);
                const hAdmon = Math.max(4, (admonMes / maxVal) * 100);
                const isSelected = selectedMesIdx === idx;

                return (
                  <div 
                    key={m.mesCorto} 
                    onClick={() => setSelectedMesIdx(idx)}
                    className={`flex-1 flex flex-col items-center cursor-pointer group p-1 rounded-xl transition-all ${
                      isSelected ? 'bg-blue-50/80 ring-2 ring-blue-600' : 'hover:bg-neutral-50'
                    }`}
                  >
                    <div className="text-[10px] font-mono font-bold text-neutral-700 mb-1">
                      ${Math.round(totalBarra / 1000)}k
                    </div>
                    
                    <div className="w-full max-w-[34px] flex flex-col-reverse gap-0.5 items-center justify-end h-44">
                      {/* Admon: Amber */}
                      <div 
                        style={{ height: `${hAdmon}%` }} 
                        className="w-full bg-amber-500 rounded-t-xs hover:brightness-110 transition-all"
                        title={`Administrativo: ${formatExact(admonMes)}`}
                      />
                      {/* Infra: Emerald */}
                      <div 
                        style={{ height: `${hInfra}%` }} 
                        className="w-full bg-emerald-500 rounded-t-xs hover:brightness-110 transition-all"
                        title={`Infraestructura: ${formatExact(infraMes)}`}
                      />
                      {/* Flota: Blue */}
                      <div 
                        style={{ height: `${hFlota}%` }} 
                        className="w-full bg-blue-600 rounded-t-xs hover:brightness-110 transition-all"
                        title={`Mantto. Flota: ${formatExact(flotaMes)}`}
                      />
                      {/* CAPEX: Indigo */}
                      <div 
                        style={{ height: `${hCapex}%` }} 
                        className="w-full bg-indigo-600 rounded-t-xs hover:brightness-110 transition-all"
                        title={`Inversiones CAPEX: ${formatExact(capexMes)}`}
                      />
                    </div>

                    <div className={`text-xs font-bold mt-2 ${isSelected ? 'text-blue-900 font-black' : 'text-neutral-500'}`}>
                      {m.mesCorto}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Leyenda idéntica a Proyectos Externos */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-3 border-t border-neutral-100 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-indigo-600" />
                <span className="font-medium text-neutral-700">1. Inversiones CAPEX</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-blue-600" />
                <span className="font-medium text-neutral-700">2. Mantto. Flota (OPEX)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-emerald-500" />
                <span className="font-medium text-neutral-700">3. Mantto. Infraestructura (OPEX)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-amber-500" />
                <span className="font-medium text-neutral-700">4. Administrativo (Admon)</span>
              </div>
            </div>
          </div>

          {/* Matriz Comparativa Mensual Enero a Septiembre 2026 */}
          <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs overflow-x-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="text-base font-bold text-neutral-900 tracking-tight">
                  Matriz Comparativa Mensual Enero a Septiembre 2026 ($ USD)
                </h3>
                <p className="text-xs text-neutral-500">
                  Conciliación de cuentas de materiales, servicios y costos departamentales.
                </p>
              </div>
              <span className="text-xs font-semibold text-blue-800 bg-blue-50 border border-blue-200 px-3 py-1 rounded-lg">
                {modoReclasificadoSep 
                  ? `Septiembre Reclasificado (Motor Bus $8.500 a CAPEX)` 
                  : 'Septiembre en Base Master Original'}
              </span>
            </div>

            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-neutral-50 text-neutral-700 font-bold border-b border-neutral-200">
                  <th className="py-2.5 px-3 rounded-l-lg">Descripción del Bloque</th>
                  <th className="py-2.5 px-2 text-right">Ene</th>
                  <th className="py-2.5 px-2 text-right">Feb</th>
                  <th className="py-2.5 px-2 text-right">Mar</th>
                  <th className="py-2.5 px-2 text-right">Abr</th>
                  <th className="py-2.5 px-2 text-right">May</th>
                  <th className="py-2.5 px-2 text-right">Jun</th>
                  <th className="py-2.5 px-2 text-right">Jul</th>
                  <th className="py-2.5 px-2 text-right">Ago</th>
                  <th className="py-2.5 px-3 text-right bg-blue-50 text-blue-900 font-bold">Sep 2026</th>
                  <th className="py-2.5 px-3 text-right rounded-r-lg font-mono font-bold text-neutral-900">Acumulado ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-medium">
                <tr className="hover:bg-neutral-50/80">
                  <td className="py-2.5 px-3 font-semibold text-neutral-800 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                    <span>1. Inversiones CAPEX</span>
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono text-neutral-600">$162.467</td>
                  <td className="py-2.5 px-2 text-right font-mono text-neutral-600">$326.380</td>
                  <td className="py-2.5 px-2 text-right font-mono text-neutral-600">$149.039</td>
                  <td className="py-2.5 px-2 text-right font-mono text-neutral-600">$92.865</td>
                  <td className="py-2.5 px-2 text-right font-mono text-neutral-600">$77.901</td>
                  <td className="py-2.5 px-2 text-right font-mono text-neutral-600">$32.585</td>
                  <td className="py-2.5 px-2 text-right font-mono text-neutral-600">$45.087</td>
                  <td className="py-2.5 px-2 text-right font-mono text-neutral-600">$29.017</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold bg-blue-50/60 text-blue-900">
                    {formatExact(capexEfectivoMes)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-neutral-900">
                    {formatExact(950271.43 + (modoReclasificadoSep ? montoReclasificadoSep : 0))}
                  </td>
                </tr>

                <tr className="hover:bg-neutral-50/80">
                  <td className="py-2.5 px-3 font-semibold text-neutral-800 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    <span>2. Mantto. Flota (OPEX)</span>
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono text-neutral-600">$143.581</td>
                  <td className="py-2.5 px-2 text-right font-mono text-neutral-600">$102.274</td>
                  <td className="py-2.5 px-2 text-right font-mono text-neutral-600">$83.194</td>
                  <td className="py-2.5 px-2 text-right font-mono text-neutral-600">$59.543</td>
                  <td className="py-2.5 px-2 text-right font-mono text-neutral-600">$68.409</td>
                  <td className="py-2.5 px-2 text-right font-mono text-neutral-600">$72.213</td>
                  <td className="py-2.5 px-2 text-right font-mono text-neutral-600">$97.727</td>
                  <td className="py-2.5 px-2 text-right font-mono text-neutral-600">$113.450</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold bg-blue-50/60 text-blue-900">
                    {formatExact(opexFlotaEfectivoMes)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-neutral-900">
                    {formatExact(824120.75 - (modoReclasificadoSep ? montoReclasificadoSep : 0))}
                  </td>
                </tr>

                <tr className="hover:bg-neutral-50/80">
                  <td className="py-2.5 px-3 font-semibold text-neutral-800 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>3. Mantto. Infraestructura (OPEX)</span>
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono text-neutral-600">$145.197</td>
                  <td className="py-2.5 px-2 text-right font-mono text-neutral-600">$50.329</td>
                  <td className="py-2.5 px-2 text-right font-mono text-neutral-600">$20.149</td>
                  <td className="py-2.5 px-2 text-right font-mono text-neutral-600">$25.926</td>
                  <td className="py-2.5 px-2 text-right font-mono text-neutral-600">$20.031</td>
                  <td className="py-2.5 px-2 text-right font-mono text-neutral-600">$15.748</td>
                  <td className="py-2.5 px-2 text-right font-mono text-neutral-600">$41.898</td>
                  <td className="py-2.5 px-2 text-right font-mono text-neutral-600">$40.545</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold bg-blue-50/60 text-blue-900">$41.739,91</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-neutral-900">$401.562,86</td>
                </tr>

                <tr className="hover:bg-neutral-50/80">
                  <td className="py-2.5 px-3 font-semibold text-neutral-800 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span>4. Gastos Administrativos (Admon)</span>
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono text-neutral-600">$63.209</td>
                  <td className="py-2.5 px-2 text-right font-mono text-neutral-600">$28.720</td>
                  <td className="py-2.5 px-2 text-right font-mono text-neutral-600">$86.208</td>
                  <td className="py-2.5 px-2 text-right font-mono text-neutral-600">$28.640</td>
                  <td className="py-2.5 px-2 text-right font-mono text-neutral-600">$67.895</td>
                  <td className="py-2.5 px-2 text-right font-mono text-neutral-600">$37.742</td>
                  <td className="py-2.5 px-2 text-right font-mono text-neutral-600">$40.086</td>
                  <td className="py-2.5 px-2 text-right font-mono text-neutral-600">$53.325</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold bg-blue-50/60 text-blue-900">$31.339,57</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-neutral-900">$437.164,57</td>
                </tr>

                <tr className="bg-neutral-100/80 font-black text-neutral-900 border-t-2 border-neutral-300">
                  <td className="py-3 px-3">TOTAL GENERAL (4 BLOQUES CONCILIADOS)</td>
                  <td className="py-3 px-2 text-right font-mono">$514.453</td>
                  <td className="py-3 px-2 text-right font-mono">$507.703</td>
                  <td className="py-3 px-2 text-right font-mono">$338.590</td>
                  <td className="py-3 px-2 text-right font-mono">$206.974</td>
                  <td className="py-3 px-2 text-right font-mono">$234.236</td>
                  <td className="py-3 px-2 text-right font-mono">$158.288</td>
                  <td className="py-3 px-2 text-right font-mono">$224.798</td>
                  <td className="py-3 px-2 text-right font-mono">$236.338</td>
                  <td className="py-3 px-3 text-right font-mono bg-blue-100 text-blue-950 font-bold">$191.739,35</td>
                  <td className="py-3 px-3 text-right font-mono text-neutral-950 font-bold">$2.613.119,61</td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 2: MANO DE OBRA DIRECTA (MOD ECO) - HORAS HOMBRES SEPTIEMBRE        */}
      {/* ========================================================================= */}
      {subTab === 'mod' && (
        <div className="space-y-6">
          
          {/* Banner de Sincronización del Archivo */}
          <div className="bg-purple-50/80 border border-purple-200 p-4.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-purple-950 shadow-2xs">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-sm block text-purple-950">
                  Mano de Obra Directa (MOD) — Mantenimiento de Flota & Equipos ECO (Septiembre 2026)
                </span>
                <p className="text-purple-900/90 mt-0.5 leading-relaxed">
                  Consolidado directamente desde <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-purple-200 font-bold">horas hombres eco septiembre.xlsx</code>.
                  Total verificado: <strong>5.963 Horas Hombre</strong> distribuidas en <strong>1.336 registros de intervención</strong>, <strong>32 mecánicos y técnicos</strong> de planta y <strong>162 cuentas auxiliares</strong> de activos y talleres.
                </p>
              </div>
            </div>
            <button
              onClick={handleDescargarExcelConciliacion}
              className="shrink-0 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Download className="w-4 h-4" />
              <span>Exportar 162 Cuentas MOD (Excel)</span>
            </button>
          </div>

          {/* 4 Métricas Clave de MOD */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4.5 rounded-xl border border-purple-200 shadow-2xs">
              <div className="text-xs font-bold text-purple-700 uppercase tracking-wider">Total Horas Hombre Septiembre</div>
              <div className="text-2xl font-black text-purple-950 font-mono mt-1">
                {TOTALES_MOD_SEPTIEMBRE_2026.totalHorasHombre.toLocaleString('de-DE')} HH
              </div>
              <div className="text-xs text-neutral-500 mt-1">
                1.336 registros de órdenes de trabajo
              </div>
            </div>

            <div className="bg-white p-4.5 rounded-xl border border-neutral-200 shadow-2xs">
              <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Técnicos & Mecánicos Planta</div>
              <div className="text-2xl font-black text-neutral-900 font-mono mt-1">
                {TOTALES_MOD_SEPTIEMBRE_2026.totalTecnicosPlanta} Técnicos
              </div>
              <div className="text-xs text-neutral-500 mt-1">
                Personal operativo de mantenimiento ECO
              </div>
            </div>

            <div className="bg-white p-4.5 rounded-xl border border-neutral-200 shadow-2xs">
              <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Cuentas Auxiliares Atendidas</div>
              <div className="text-2xl font-black text-neutral-900 font-mono mt-1">
                {TOTALES_MOD_SEPTIEMBRE_2026.cuentasAuxiliaresImpactadas} Activos
              </div>
              <div className="text-xs text-neutral-500 mt-1">
                Grúas, camiones, autobuses, galpones y equipos
              </div>
            </div>

            <div className="bg-white p-4.5 rounded-xl border border-emerald-200 bg-emerald-50/30 shadow-2xs">
              <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Costo Estimado MOD Septiembre</div>
              <div className="text-2xl font-black text-emerald-700 font-mono mt-1">
                ${TOTALES_MOD_SEPTIEMBRE_2026.costoEstimadoTotalUSD.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-emerald-800 mt-1">
                Tarifa promedio estimada: ~${TOTALES_MOD_SEPTIEMBRE_2026.tarifaPromedioEstimadaHora} / HH
              </div>
            </div>
          </div>

          {/* EVOLUCIÓN SEMANAL MOD (5 SEMANAS - ANÁLISIS DE PICOS Y CIERRE) */}
          <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs space-y-4">
            <div className="border-b border-neutral-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-neutral-900 tracking-tight flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  <span>Evolución Semanal de Horas Hombre — Septiembre 2026 (5 Semanas)</span>
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Comportamiento técnico por semana laborable según análisis de la hoja de costos ECO.
                </p>
              </div>
              <div className="text-xs font-bold px-3 py-1 bg-purple-100 text-purple-900 rounded-lg shrink-0">
                Total Acumulado: 5.963 HH
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5">
              {EVOLUTIVO_SEMANAL_MOD_SEPTIEMBRE_2026.map((s, idx) => {
                const esPicoMax = idx === 1;
                const esSegundoPico = idx === 2;
                const esCierre = idx === 4;

                return (
                  <div 
                    key={s.semana}
                    className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                      esPicoMax 
                        ? 'bg-purple-50/70 border-purple-300 shadow-2xs' 
                        : esSegundoPico
                        ? 'bg-blue-50/60 border-blue-200'
                        : esCierre
                        ? 'bg-amber-50/50 border-amber-200'
                        : 'bg-neutral-50/80 border-neutral-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-neutral-900">{s.semana}</span>
                        {esPicoMax && (
                          <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-purple-600 text-white">
                            Pico Máx
                          </span>
                        )}
                        {esSegundoPico && (
                          <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-blue-600 text-white">
                            Pico 2
                          </span>
                        )}
                        {esCierre && (
                          <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-600 text-white">
                            3 Días
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-neutral-500">{s.periodo}</div>
                      <div className="text-2xl font-black font-mono text-neutral-900 mt-2">
                        {s.horas.toLocaleString('de-DE')} <span className="text-xs font-normal text-neutral-500">HH</span>
                      </div>
                      <div className="text-[11px] font-semibold text-neutral-600 mt-0.5">
                        {s.intervenciones} intervenciones
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-neutral-200/80 text-[11px] text-neutral-700 leading-relaxed italic">
                      "{s.detalle}"
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* DISTRIBUCIÓN POR FAMILIA & TOP TÉCNICOS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* Familias de Equipos */}
            <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-neutral-900 tracking-tight flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>Horas Hombre por Familia de Activo</span>
              </h3>
              <div className="space-y-2">
                {HORAS_HOMBRE_POR_FAMILIA_SEPTIEMBRE.slice(0, 7).map((f) => {
                  const pct = Math.round((f.totalHoras / TOTALES_MOD_SEPTIEMBRE_2026.totalHorasHombre) * 100);
                  return (
                    <div key={f.tipo} className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-neutral-800">{f.tipo}</span>
                        <span className="font-mono font-black text-purple-950">{f.totalHoras.toLocaleString('de-DE')} HH ({pct}%)</span>
                      </div>
                      <div className="w-full bg-neutral-200 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-purple-600 h-1.5 rounded-full" 
                          style={{ width: `${Math.min(100, Math.max(5, pct * 2.5))}%` }}
                        ></div>
                      </div>
                      <div className="text-[10px] text-neutral-500 mt-1 font-mono">
                        {f.registros} órdenes registradas
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Técnicos / Mecánicos */}
            <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-neutral-900 tracking-tight flex items-center gap-2">
                <Wrench className="w-4 h-4 text-emerald-600" />
                <span>Top Técnicos & Mecánicos con Mayor Carga Horaria</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {HORAS_HOMBRE_POR_TRABAJADOR_SEPTIEMBRE.slice(0, 8).map((t, idx) => (
                  <div key={t.trabajador} className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                        <span className="text-[10px] font-mono text-neutral-400">#{idx + 1}</span>
                        <span>{t.trabajador}</span>
                      </div>
                      <div className="text-[11px] text-neutral-500 font-mono mt-0.5">{t.registros} intervenciones</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black font-mono text-emerald-800">{t.totalHoras} HH</div>
                      <div className="text-[10px] font-bold text-neutral-400">Paquete ${t.paquete}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* TABLA PRINCIPAL DE 162 CUENTAS AUXILIARES */}
          <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-neutral-900 tracking-tight flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600" />
                  <span>Distribución de Horas Hombre por Cuenta Auxiliar (162 Cuentas — 5.963 HH)</span>
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Horas de trabajo vinculadas a cada activo, grúa, vehículo y galpón en Septiembre 2026.
                </p>
              </div>

              {/* Filtros */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar cuenta o equipo..."
                    value={busquedaMOD}
                    onChange={(e) => setBusquedaMOD(e.target.value)}
                    className="pl-8 pr-3 py-1.5 rounded-lg border border-neutral-200 text-xs focus:ring-1 focus:ring-purple-500 w-44 sm:w-56"
                  />
                </div>

                <select
                  value={filtroFamiliaMOD}
                  onChange={(e) => setFiltroFamiliaMOD(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-neutral-200 text-xs bg-white text-neutral-700 font-medium"
                >
                  <option value="todos">Todas las Familias ({cuentasMODFiltradas.length})</option>
                  <option value="Grúas">Grúas</option>
                  <option value="Camiones">Camiones</option>
                  <option value="Autobuses">Autobuses</option>
                  <option value="Vehículos">Vehículos</option>
                  <option value="Equipos Especiales">Equipos Especiales</option>
                  <option value="Mantenimiento y Adecuaciones">Adecuaciones & Galpones</option>
                  <option value="Montacargas">Montacargas</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full text-xs text-left">
                <thead className="sticky top-0 bg-neutral-100 z-10 shadow-2xs">
                  <tr className="text-neutral-700 font-bold border-b border-neutral-200">
                    <th className="py-2.5 px-3">Cuenta Auxiliar</th>
                    <th className="py-2.5 px-3">Equipo / Obra</th>
                    <th className="py-2.5 px-2">Familia</th>
                    <th className="py-2.5 px-2 text-center">Registros</th>
                    <th className="py-2.5 px-2 text-center">Técnicos</th>
                    <th className="py-2.5 px-3 text-right bg-purple-100 text-purple-950 font-bold font-mono">Total Horas (HH)</th>
                    <th className="py-2.5 px-3">Principales Labores / Motivos</th>
                    <th className="py-2.5 px-2 text-center">Auditar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-medium">
                  {cuentasMODFiltradas.map((c) => (
                    <tr key={c.cuenta} className="hover:bg-neutral-50/80">
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{c.cuenta}</td>
                      <td className="py-2.5 px-3 font-semibold text-neutral-900">{c.equipo}</td>
                      <td className="py-2.5 px-2">
                        <span className="px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 text-[10px] font-semibold">
                          {c.tipo}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono text-neutral-600">{c.registros}</td>
                      <td className="py-2.5 px-2 text-center font-mono text-neutral-600">{c.cantTrabajadores}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-purple-950 bg-purple-50/60">
                        {c.totalHoras.toLocaleString('de-DE')} HH
                      </td>
                      <td className="py-2.5 px-3 text-[11px] text-neutral-500 max-w-md truncate" title={c.principalesLabores}>
                        {c.principalesLabores || 'Mantenimiento preventivo / correctivo'}
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <button
                          onClick={() => handleAbrirDesglose(c.cuenta, c.equipo)}
                          className="px-2 py-1 rounded bg-neutral-100 hover:bg-blue-100 text-blue-700 font-bold text-[11px] cursor-pointer"
                        >
                          Ver 🔍
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="text-center text-xs text-neutral-500 pt-2 border-t border-neutral-100 font-mono">
              Mostrando {cuentasMODFiltradas.length} cuentas auxiliares auditadas (Total: {cuentasMODFiltradas.reduce((a, b) => a + b.totalHoras, 0).toLocaleString('de-DE')} HH).
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 3: INVERSIONES CAPEX (OBRAS CIVILES & PLANTA)                       */}
      {/* ========================================================================= */}
      {subTab === 'capex' && (
        <div className="space-y-6">
          
          {/* Tarjetas de Variaciones Clave */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-neutral-900 tracking-tight">
                  Proyectos Clave CAPEX ({mesActivoRaw.mesLabel} 2026)
                </h3>
                <p className="text-xs text-neutral-500">
                  Variaciones más relevantes en obras civiles, galpones y adecuaciones de planta.
                </p>
              </div>
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
                  className="bg-neutral-50/70 rounded-xl p-3.5 border border-neutral-200 hover:border-blue-400 hover:shadow-xs cursor-pointer transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[10px] text-neutral-500 font-bold bg-white px-1.5 py-0.5 rounded border border-neutral-200">
                        {v.cuenta}
                      </span>
                      <span className={`text-xs font-bold flex items-center gap-0.5 ${v.esSubida ? 'text-emerald-700' : 'text-neutral-700'}`}>
                        {v.esSubida ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        {v.porcentaje}
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-neutral-900 mt-1 line-clamp-2">
                      {v.proyecto}
                    </h4>
                    <div className="text-base font-black text-neutral-900 font-mono mt-1">
                      {formatExact(v.actual)}
                    </div>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-neutral-200 text-[11px] text-neutral-600 italic line-clamp-3">
                    "{v.explicacion}"
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tabla de Cuentas Auxiliares CAPEX */}
          <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs overflow-x-auto">
            <h3 className="text-base font-bold text-neutral-900 tracking-tight mb-3">
              Cuentas Auxiliares de Inversiones CAPEX (Enero – Septiembre 2026)
            </h3>
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-neutral-50 text-neutral-700 font-bold border-b border-neutral-200">
                  <th className="py-2.5 px-3">Cuenta Auxiliar</th>
                  <th className="py-2.5 px-3">Proyecto / Obra</th>
                  <th className="py-2.5 px-2 text-right">Ene</th>
                  <th className="py-2.5 px-2 text-right">Feb</th>
                  <th className="py-2.5 px-2 text-right">Mar</th>
                  <th className="py-2.5 px-2 text-right">Abr</th>
                  <th className="py-2.5 px-2 text-right">May</th>
                  <th className="py-2.5 px-2 text-right">Jun</th>
                  <th className="py-2.5 px-2 text-right">Jul</th>
                  <th className="py-2.5 px-2 text-right">Ago</th>
                  <th className="py-2.5 px-2.5 text-right bg-blue-50 text-blue-900 font-bold">Sep</th>
                  <th className="py-2.5 px-3 text-right font-mono font-bold text-neutral-900">Total 2026 ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-medium">
                {CUENTAS_CAPEX_INTERNOS.map((c) => (
                  <tr 
                    key={c.cuentaAuxiliar} 
                    onClick={() => handleAbrirDesglose(c.cuentaAuxiliar, c.proyecto, esSeptiembre ? c.sep : c.ago)}
                    className="hover:bg-neutral-50/80 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{c.cuentaAuxiliar}</td>
                    <td className="py-2.5 px-3 font-semibold text-neutral-800">{c.proyecto}</td>
                    <td className="py-2.5 px-2 text-right font-mono text-neutral-600">{c.ene > 0 ? formatNumber(c.ene) : '-'}</td>
                    <td className="py-2.5 px-2 text-right font-mono text-neutral-600">{c.feb > 0 ? formatNumber(c.feb) : '-'}</td>
                    <td className="py-2.5 px-2 text-right font-mono text-neutral-600">{c.mar > 0 ? formatNumber(c.mar) : '-'}</td>
                    <td className="py-2.5 px-2 text-right font-mono text-neutral-600">{c.abr > 0 ? formatNumber(c.abr) : '-'}</td>
                    <td className="py-2.5 px-2 text-right font-mono text-neutral-600">{c.may > 0 ? formatNumber(c.may) : '-'}</td>
                    <td className="py-2.5 px-2 text-right font-mono text-neutral-600">{c.jun > 0 ? formatNumber(c.jun) : '-'}</td>
                    <td className="py-2.5 px-2 text-right font-mono text-neutral-600">{c.jul > 0 ? formatNumber(c.jul) : '-'}</td>
                    <td className="py-2.5 px-2 text-right font-mono text-neutral-600">{c.ago > 0 ? formatNumber(c.ago) : '-'}</td>
                    <td className="py-2.5 px-2.5 text-right font-mono font-bold bg-blue-50/50 text-blue-900">{c.sep > 0 ? formatExact(c.sep) : '-'}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-neutral-900">{formatExact(c.total2026)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 4: MANTTO. FLOTA (OPEX ACTIVOS PRODUCTIVOS)                         */}
      {/* ========================================================================= */}
      {subTab === 'flota' && (
        <div className="space-y-6">
          
          {/* Top 10 Equipos Móviles con Mayor Gasto */}
          <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-neutral-900 tracking-tight">
                  Top 10 Equipos Móviles con Mayor Gasto ({mesActivoRaw.mesLabel} 2026)
                </h3>
                <p className="text-xs text-neutral-500">
                  {esSeptiembre 
                    ? 'Total de los 10 equipos en Master Septiembre: $44.957,33 USD (53,7% del total de flota).'
                    : 'Total de los 10 equipos en Agosto: $64.839 USD (57% de todo el gasto de flota).'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {(esSeptiembre ? TOP_10_EQUIPOS_OPEX_SEPTIEMBRE : TOP_10_EQUIPOS_OPEX_AGOSTO).map((eq, idx) => (
                <div 
                  key={eq.codigo} 
                  onClick={() => handleAbrirDesglose((eq as any).cuentaCompleta || eq.codigo, eq.nombre, (eq as any).montoSeptiembre || (eq as any).montoAgosto)}
                  className="p-3.5 rounded-xl bg-neutral-50/80 border border-neutral-200 hover:border-blue-400 hover:shadow-xs cursor-pointer transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-neutral-200">
                        #{idx + 1} · {eq.codigo}
                      </span>
                      <span className="text-[10px] font-semibold text-neutral-500">{eq.tipo}</span>
                    </div>
                    <h4 className="font-bold text-xs text-neutral-900 mt-1 line-clamp-1" title={eq.nombre}>
                      {eq.nombre}
                    </h4>
                    <div className="text-base font-black text-neutral-900 font-mono mt-1">
                      {formatExact((eq as any).montoSeptiembre || (eq as any).montoAgosto)}
                    </div>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-neutral-200 text-[10px] text-neutral-600 line-clamp-2">
                    {eq.detalle}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tabla Mensual por Tipo de Activo Productivo */}
          <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs overflow-x-auto">
            <h3 className="text-base font-bold text-neutral-900 tracking-tight mb-3">
              Evolución Mensual por Familia de Activos Móviles (Enero – Septiembre 2026)
            </h3>
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-neutral-50 text-neutral-700 font-bold border-b border-neutral-200">
                  <th className="py-2.5 px-3">Tipo de Equipo</th>
                  <th className="py-2.5 px-2 text-right">Ene</th>
                  <th className="py-2.5 px-2 text-right">Feb</th>
                  <th className="py-2.5 px-2 text-right">Mar</th>
                  <th className="py-2.5 px-2 text-right">Abr</th>
                  <th className="py-2.5 px-2 text-right">May</th>
                  <th className="py-2.5 px-2 text-right">Jun</th>
                  <th className="py-2.5 px-2 text-right">Jul</th>
                  <th className="py-2.5 px-2 text-right">Ago</th>
                  <th className="py-2.5 px-2.5 text-right bg-blue-50 text-blue-900 font-bold">Sep</th>
                  <th className="py-2.5 px-3 text-right font-mono font-bold text-neutral-900">Total 2026 ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-medium">
                {TIPOS_EQUIPOS_OPEX_MENSUAL.map((t) => (
                  <tr key={t.tipo} className="hover:bg-neutral-50/80">
                    <td className="py-2 px-3 font-semibold text-neutral-800">{t.tipo}</td>
                    <td className="py-2 px-2 text-right font-mono text-neutral-600">{t.ene > 0 ? formatNumber(t.ene) : '-'}</td>
                    <td className="py-2 px-2 text-right font-mono text-neutral-600">{t.feb > 0 ? formatNumber(t.feb) : '-'}</td>
                    <td className="py-2 px-2 text-right font-mono text-neutral-600">{t.mar > 0 ? formatNumber(t.mar) : '-'}</td>
                    <td className="py-2 px-2 text-right font-mono text-neutral-600">{t.abr > 0 ? formatNumber(t.abr) : '-'}</td>
                    <td className="py-2 px-2 text-right font-mono text-neutral-600">{t.may > 0 ? formatNumber(t.may) : '-'}</td>
                    <td className="py-2 px-2 text-right font-mono text-neutral-600">{t.jun > 0 ? formatNumber(t.jun) : '-'}</td>
                    <td className="py-2 px-2 text-right font-mono text-neutral-600">{t.jul > 0 ? formatNumber(t.jul) : '-'}</td>
                    <td className="py-2 px-2 text-right font-mono text-neutral-600">{t.ago > 0 ? formatNumber(t.ago) : '-'}</td>
                    <td className="py-2 px-2.5 text-right font-mono font-bold bg-blue-50/50 text-blue-900">{t.sep > 0 ? formatExact(t.sep) : '-'}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-neutral-900">{formatExact(t.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 5: MANTTO. INFRAESTRUCTURA (OPEX)                                  */}
      {/* ========================================================================= */}
      {subTab === 'infra' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs overflow-x-auto">
            <h3 className="text-base font-bold text-neutral-900 tracking-tight mb-3">
              Mantenimiento de Infraestructura & Galpones (Enero – Septiembre 2026)
            </h3>
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-neutral-50 text-neutral-700 font-bold border-b border-neutral-200">
                  <th className="py-2.5 px-3">Cuenta Auxiliar</th>
                  <th className="py-2.5 px-3">Proyecto / Galpón</th>
                  <th className="py-2.5 px-2 text-right">Ene</th>
                  <th className="py-2.5 px-2 text-right">Feb</th>
                  <th className="py-2.5 px-2 text-right">Mar</th>
                  <th className="py-2.5 px-2 text-right">Abr</th>
                  <th className="py-2.5 px-2 text-right">May</th>
                  <th className="py-2.5 px-2 text-right">Jun</th>
                  <th className="py-2.5 px-2 text-right">Jul</th>
                  <th className="py-2.5 px-2 text-right">Ago</th>
                  <th className="py-2.5 px-2.5 text-right bg-blue-50 text-blue-900 font-bold">Sep</th>
                  <th className="py-2.5 px-3 text-right font-mono font-bold text-neutral-900">Total 2026 ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-medium">
                {MANTTO_INFRAESTRUCTURA_2026.cuentas.map((c) => (
                  <tr 
                    key={c.cuenta} 
                    onClick={() => handleAbrirDesglose(c.cuenta, c.descripcion, esSeptiembre ? c.sep : c.ago)}
                    className="hover:bg-neutral-50/80 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">{c.cuenta}</td>
                    <td className="py-2.5 px-3 font-semibold text-neutral-800">{c.descripcion}</td>
                    <td className="py-2 px-2 text-right font-mono text-neutral-600">{c.ene > 0 ? formatNumber(c.ene) : '-'}</td>
                    <td className="py-2 px-2 text-right font-mono text-neutral-600">{c.feb > 0 ? formatNumber(c.feb) : '-'}</td>
                    <td className="py-2 px-2 text-right font-mono text-neutral-600">{c.mar > 0 ? formatNumber(c.mar) : '-'}</td>
                    <td className="py-2 px-2 text-right font-mono text-neutral-600">{c.abr > 0 ? formatNumber(c.abr) : '-'}</td>
                    <td className="py-2 px-2 text-right font-mono text-neutral-600">{c.may > 0 ? formatNumber(c.may) : '-'}</td>
                    <td className="py-2 px-2 text-right font-mono text-neutral-600">{c.jun > 0 ? formatNumber(c.jun) : '-'}</td>
                    <td className="py-2 px-2 text-right font-mono text-neutral-600">{c.jul > 0 ? formatNumber(c.jul) : '-'}</td>
                    <td className="py-2 px-2 text-right font-mono text-neutral-600">{formatNumber(c.ago)}</td>
                    <td className="py-2 px-2.5 text-right font-mono font-bold bg-blue-50/50 text-blue-900">{formatExact(c.sep)}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-neutral-900">{formatExact(c.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 6: SEPARACIÓN CONTABLE (CAPEX vs OPEX EN SEPTIEMBRE 2026)           */}
      {/* ========================================================================= */}
      {subTab === 'reclasificacion' && (
        <div className="space-y-6">
          
          <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-neutral-900 tracking-tight flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-emerald-600" />
                  <span>Criterio Contable de Vida Útil: Solo Motor Bus a CAPEX ($8.500 USD)</span>
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Conforme a tu instrucción, solo el motor diésel nuevo instalado en el Autobús Encava BS03 pasa a CAPEX. Todos los demás componentes menores quedan en OPEX Flota.
                </p>
              </div>

              <button
                onClick={() => {
                  const map: Record<string, boolean> = {};
                  INTERVENCIONES_VIDA_UTIL_SEPTIEMBRE_2026.forEach(it => {
                    map[it.id] = (it.id === 'CAPEX-VU-SEP-01');
                  });
                  setIdsVidaUtilActivos(map);
                }}
                className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restablecer Criterio</span>
              </button>
            </div>

            {/* Escenario Comparativo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                <div className="font-bold text-neutral-500 uppercase text-[10px]">1. Base Master Original</div>
                <div className="mt-2 space-y-1.5 font-medium">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">CAPEX Proyectos Internos:</span>
                    <span className="font-mono font-bold text-neutral-900">$34.930,08</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Mantto. Flota (OPEX):</span>
                    <span className="font-mono font-bold text-neutral-900">$83.729,79</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Mantto. Infraestructura:</span>
                    <span className="font-mono font-bold text-neutral-900">$41.739,91</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Administrativo (Admon):</span>
                    <span className="font-mono font-bold text-neutral-900">$31.339,57</span>
                  </div>
                  <div className="pt-2 border-t border-neutral-200 flex justify-between font-black text-neutral-900">
                    <span>Total Master Septiembre:</span>
                    <span className="font-mono">$191.739,35</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-300">
                <div className="font-bold text-emerald-800 uppercase text-[10px]">2. Reclasificado (Regla Usuario)</div>
                <div className="mt-2 space-y-1.5 font-medium text-emerald-950">
                  <div className="flex justify-between">
                    <span>+ Motor Cummins Bus BS03:</span>
                    <span className="font-mono font-black text-emerald-700">+$8.500,00</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>• Demás periquitos menores:</span>
                    <span className="font-mono font-bold text-neutral-700">$0,00 (en OPEX)</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>• Equipos Nuevos llegada Sep:</span>
                    <span className="font-mono font-bold text-neutral-700">{incluirEquiposNuevosCapex ? `+$${totalEquiposNuevosSep.toLocaleString('de-DE')}` : '$0,00'}</span>
                  </div>
                  <div className="pt-2 border-t border-emerald-300 flex justify-between font-black text-emerald-900">
                    <span>Total Reclasificado a CAPEX:</span>
                    <span className="font-mono">{formatExact(montoReclasificadoSep)}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-neutral-900 text-white border border-neutral-800">
                <div className="font-bold text-amber-300 uppercase text-[10px]">3. Cierre Efectivo de Septiembre</div>
                <div className="mt-2 space-y-1.5 font-medium">
                  <div className="flex justify-between">
                    <span className="text-neutral-300">Nuevo CAPEX Septiembre:</span>
                    <span className="font-mono font-black text-emerald-300">{formatExact(capexEfectivoMes)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-300">Nuevo Mantto. Flota (OPEX):</span>
                    <span className="font-mono font-black text-amber-300">{formatExact(opexFlotaEfectivoMes)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-300">Mantto. Infraestructura:</span>
                    <span className="font-mono font-bold text-white">$41.739,91</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-300">Administrativo:</span>
                    <span className="font-mono font-bold text-white">$31.339,57</span>
                  </div>
                  <div className="pt-2 border-t border-neutral-700 flex justify-between font-black text-white">
                    <span>Total Conciliado:</span>
                    <span className="font-mono">$191.739,35</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabla de Intervenciones con Checkbox */}
            <div className="overflow-x-auto pt-2">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-neutral-50 text-neutral-700 font-bold border-b border-neutral-200">
                    <th className="py-2.5 px-3 text-center">Pasa a CAPEX</th>
                    <th className="py-2.5 px-3">Equipo</th>
                    <th className="py-2.5 px-3">Intervención / Repuesto</th>
                    <th className="py-2.5 px-2">Categoría</th>
                    <th className="py-2.5 px-3 text-right">Monto ($)</th>
                    <th className="py-2.5 px-4">Destino Contable</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-medium">
                  {INTERVENCIONES_VIDA_UTIL_SEPTIEMBRE_2026.map((it) => {
                    const isActivo = !!idsVidaUtilActivos[it.id];
                    return (
                      <tr key={it.id} className={isActivo ? 'bg-emerald-50/50' : 'hover:bg-neutral-50'}>
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={isActivo}
                            onChange={() => toggleItemVidaUtil(it.id)}
                            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-mono font-bold text-blue-700">{it.codigoEquipo}</div>
                          <div className="text-[11px] text-neutral-500">{it.nombreEquipo}</div>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-neutral-900">{it.descripcionItem}</div>
                          <div className="text-[10px] text-neutral-500">Motivo: {it.motivo}</div>
                        </td>
                        <td className="py-2.5 px-2 text-neutral-600">{it.categoria}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-neutral-900">
                          {formatExact(it.montoItemUsd)}
                        </td>
                        <td className="py-2.5 px-4">
                          {isActivo ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              CAPEX (Extiende vida útil autobús)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-600 font-semibold text-[10px]">
                              OPEX Flota (Mantenimiento operativo)
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 7: GASTOS ADMINISTRATIVOS ($31.339,57 USD)                          */}
      {/* ========================================================================= */}
      {subTab === 'admon' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs overflow-x-auto">
            <h3 className="text-base font-bold text-neutral-900 tracking-tight mb-3">
              Gastos Administrativos y Departamentales (Septiembre 2026 — $31.339,57 USD)
            </h3>
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-neutral-50 text-neutral-700 font-bold border-b border-neutral-200">
                  <th className="py-2.5 px-3">Cuenta Auxiliar</th>
                  <th className="py-2.5 px-3">Departamento / Gerencia</th>
                  <th className="py-2.5 px-2.5 text-right">Materiales ($)</th>
                  <th className="py-2.5 px-2.5 text-right">Servicios ($)</th>
                  <th className="py-2.5 px-3 text-right bg-blue-50 text-blue-900 font-mono font-bold">Total Sep ($)</th>
                  <th className="py-2.5 px-3">Principales Consumos y Servicios</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-medium">
                {CUENTAS_ADMON_SEPTIEMBRE_2026.map((a) => (
                  <tr key={a.cuenta} className="hover:bg-neutral-50/80">
                    <td className="py-2.5 px-3 font-mono font-bold text-amber-700">{a.cuenta}</td>
                    <td className="py-2.5 px-3 font-semibold text-neutral-900">{a.departamento}</td>
                    <td className="py-2.5 px-2.5 text-right font-mono text-neutral-600">{formatExact(a.materialesUsd)}</td>
                    <td className="py-2.5 px-2.5 text-right font-mono text-neutral-600">{formatExact(a.serviciosUsd)}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-black text-amber-950 bg-amber-50/40">{formatExact(a.totalSepUsd)}</td>
                    <td className="py-2.5 px-3 text-[11px] text-neutral-600">{a.principalesConsumos}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 8: FLOTA 26 GRÚAS                                                   */}
      {/* ========================================================================= */}
      {subTab === 'gruas' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-neutral-900 tracking-tight">
              Control de Flota: 26 Grúas TIMACA (Enero – Septiembre 2026)
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
              {(esSeptiembre ? FLOTA_GRUAS_TIMACA_2026.top5GruasSeptiembre : FLOTA_GRUAS_TIMACA_2026.top5GruasAgosto).map((g) => (
                <div key={g.codigo} className="p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                  <div className="text-[10px] font-mono font-bold text-neutral-500">{g.codigo}</div>
                  <div className="text-base font-black text-neutral-900 font-mono mt-0.5">{formatExact(g.monto)}</div>
                  <div className="text-[11px] text-neutral-600 truncate mt-1" title={g.descripcion}>{g.descripcion}</div>
                  <div className="text-[10px] font-bold text-blue-700 mt-1">{g.variacion}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DE AUDITORÍA Y DESGLOSE                                             */}
      {/* ========================================================================= */}
      {selectedActivoParaDesglose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-neutral-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-scale-up">
            
            <div className="bg-slate-900 text-white p-5 flex items-start justify-between gap-4 border-b border-slate-800">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="font-mono text-xs font-black bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2.5 py-0.5 rounded-lg">
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

              <button
                onClick={() => setSelectedActivoParaDesglose(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-neutral-50 border-b border-neutral-200 text-xs">
              <div className="bg-white p-3 rounded-xl border border-neutral-200 shadow-2xs">
                <div className="text-[10px] uppercase font-bold text-neutral-400">Total Auditado ({mesActivoRaw.mesLabel})</div>
                <div className="text-lg font-black text-neutral-900 font-mono mt-0.5">
                  {formatExact(selectedActivoParaDesglose.montoAgosto)}
                </div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-neutral-200 shadow-2xs">
                <div className="text-[10px] uppercase font-bold text-neutral-400">Registros Auditados</div>
                <div className="text-lg font-black text-blue-900 font-mono mt-0.5">
                  {selectedActivoParaDesglose.items.length} Ítems
                </div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-neutral-200 shadow-2xs">
                <div className="text-[10px] uppercase font-bold text-neutral-400">Bloque Contable</div>
                <div className="text-xs font-bold text-neutral-800 mt-1">
                  {selectedActivoParaDesglose.responsableArea}
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
              {selectedActivoParaDesglose.items.length > 0 ? (
                <div className="overflow-x-auto border border-neutral-200 rounded-2xl shadow-2xs">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-neutral-50 text-neutral-700 font-bold border-b border-neutral-200">
                        <th className="py-2.5 px-3">Comprobante</th>
                        <th className="py-2.5 px-3">Descripción e Ítem Técnico</th>
                        <th className="py-2.5 px-2">Categoría / Rubro</th>
                        <th className="py-2.5 px-2 text-right">Cant.</th>
                        <th className="py-2.5 px-2 text-right">P. Unit ($)</th>
                        <th className="py-2.5 px-3 text-right bg-blue-50 text-blue-900 font-mono">Monto Total ($)</th>
                        <th className="py-2.5 px-3">Fecha / Solicitante</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 font-medium bg-white">
                      {selectedActivoParaDesglose.items.map((item) => (
                        <tr key={item.id} className="hover:bg-neutral-50/60">
                          <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{item.comprobanteSIP || item.codigo}</td>
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-neutral-900">{item.descripcion}</div>
                            {item.motivo && (
                              <div className="text-[10px] text-blue-800 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded mt-1 inline-block">
                                Motivo: {item.motivo}
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-2">
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-100 text-neutral-700">
                              {item.rubro || item.categoria}
                            </span>
                          </td>
                          <td className="py-2.5 px-2 text-right font-mono text-neutral-700">
                            {item.cantidad ? `${formatNumber(item.cantidad)} ${item.unidadMedida === 'USE' ? 'SERV' : (item.unidadMedida || '')}` : '-'}
                          </td>
                          <td className="py-2.5 px-2 text-right font-mono text-neutral-600">
                            {item.montoUnitario ? formatExact(item.montoUnitario) : '-'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-black text-neutral-900 bg-blue-50/40">
                            {formatExact(item.montoTotal)}
                          </td>
                          <td className="py-2.5 px-3 text-[11px] text-neutral-600">
                            <div>{item.fecha || '-'}</div>
                            {item.solicitante && <div className="text-[10px] text-neutral-400">Sol: {item.solicitante}</div>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center bg-neutral-50 rounded-2xl border border-dashed border-neutral-200 text-neutral-500">
                  <Info className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold">
                    Sin despachos facturados bajo este código en el corte actual.
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between text-xs">
              <span className="text-neutral-500 font-mono text-[11px]">
                Auditoría Contable TIMACA · Conciliado con Almacén SIP y Master Unificado
              </span>
              <button
                onClick={() => setSelectedActivoParaDesglose(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-colors cursor-pointer"
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
