import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import {
  Zap,
  Boxes,
  Briefcase,
  ShoppingBag,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Download,
  RefreshCw,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
  Layers,
  Building2,
  DollarSign,
  FileSpreadsheet,
  Info,
  RotateCcw
} from 'lucide-react';
import { safeNumber, safeFormatUSD, safeFormatQuantity } from '../utils/numericHelpers';
import { CUENTAS_CORTAS_OFICIALES } from '../services/sipDataService';
import { UsuarioSistema } from '../types/usuarios';

export interface SigmaRecord {
  id: string | number;
  origen: 'ALMACEN' | 'SERVICIO' | 'COMPRA';
  documento: string; // DP..., SC..., OC...
  ocAsociada?: string;
  fecha: string;
  cuentaAuxiliar: string;
  proyectoNombre: string;
  tipoCosto: 'Externo' | 'CAPEX' | 'OPEX' | 'General';
  codigo: string;
  descripcion: string;
  categoria: string;
  cantidad: number;
  unidad: string;
  precioUnitario: number;
  totalUSD: number;
  solicitante: string;
  proveedorOAlmacen: string;
  motivo: string;
  estadoRC: 'CON_RC' | 'SIN_RC' | 'NO_APLICA';
  cantidadOC?: number;
  cantidadRecepcionada?: number;
  mes: string;
}

interface SigmaSipViewProps {
  currentUser?: UsuarioSistema;
}

export const SigmaSipView: React.FC<SigmaSipViewProps> = () => {
  const [mesSeleccionado, setMesSeleccionado] = useState<string>('octubre');
  const [origenFiltro, setOrigenFiltro] = useState<'TODOS' | 'ALMACEN' | 'SERVICIO'>('TODOS');
  const [estadoRcFiltro, setEstadoRcFiltro] = useState<'TODOS' | 'CON_RC' | 'SIN_RC'>('TODOS');
  const [tipoCostoFiltro, setTipoCostoFiltro] = useState<string>('TODAS');
  const [cuentaFiltro, setCuentaFiltro] = useState<string>('TODAS');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(true);
  const [rawData, setRawData] = useState<SigmaRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<SigmaRecord | null>(null);

  // Paginación
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(50);

  // Carga de datos SIP puros
  const loadSipData = async (mes: string) => {
    setLoading(true);
    try {
      const records: SigmaRecord[] = [];
      const cacheBust = `?_t=${Date.now()}`;

      // 1. Cargar Vales de Almacén y Servicios de unificada_[mes].json
      try {
        const resUnificada = await fetch(`/data/sip/unificada_${mes}.json${cacheBust}`);
        if (resUnificada.ok) {
          const json = await resUnificada.json();
          const items: any[] = json.items || (Array.isArray(json) ? json : []);

          items.forEach((item, idx) => {
            const numStr = String(item.numero || '').trim().toUpperCase();
            const idStr = String(item.id || `unif-${idx}`);

            // Descartar registros sintéticos generados artificialmente
            if (idStr.startsWith('DOC-') || numStr.startsWith('DOC-') || numStr.startsWith('REP-') || numStr.startsWith('SEM-')) {
              return;
            }

            const cta = (item.cuenta_aux || '').trim().toUpperCase();
            const desc = item.descripcion || '';
            const cod = (item.codigo || '').toUpperCase();
            const isServicio = (item.tipo || '').toLowerCase().includes('serv') || 
                               (item.categoria || '').toLowerCase().includes('serv') ||
                               cod.startsWith('SE') ||
                               numStr.startsWith('SC');

            let tipoCosto: 'Externo' | 'CAPEX' | 'OPEX' | 'General' = 'Externo';
            const tcStr = (item.datos_tipo_costo || '').toLowerCase();
            if (tcStr.includes('opex') || cta.startsWith('EE') || cta.startsWith('TT-I') || cta.startsWith('TT-A')) {
              tipoCosto = 'OPEX';
            } else if (tcStr.includes('capex') || cta.includes('CAPEX')) {
              tipoCosto = 'CAPEX';
            } else if (cta.startsWith('TTE-C-')) {
              tipoCosto = 'Externo';
            }

            const nomProyecto = CUENTAS_CORTAS_OFICIALES[cta] || item.datos_descripcion || cta || 'Sin Asignar';

            if (isServicio) {
              // Servicio de Procura
              records.push({
                id: item.id || `serv-${idx}`,
                origen: 'SERVICIO',
                documento: numStr || `SC-${idx}`,
                ocAsociada: item.oc || item.pedido || '',
                fecha: item.fecha || '',
                cuentaAuxiliar: cta,
                proyectoNombre: nomProyecto,
                tipoCosto,
                codigo: item.codigo || 'SE-VARIOS',
                descripcion: desc,
                categoria: item.categoria || 'SERVICIOS',
                cantidad: safeNumber(item.cantidad, 1),
                unidad: item.unidad || 'USE',
                precioUnitario: safeNumber(item.precio_final || item.precio_dolar, 0),
                totalUSD: safeNumber(item.total_usd, 0),
                solicitante: item.solicitante || 'S/D',
                proveedorOAlmacen: item.proveedor || item.almacen || 'Procura SIP',
                motivo: item.motivo || '',
                estadoRC: item.total_usd > 0 ? 'CON_RC' : 'SIN_RC',
                mes
              });
            } else if (numStr.startsWith('DP') || item.almacen) {
              // Vale de Almacén (Consumo de Stock a Cuenta Auxiliar)
              records.push({
                id: item.id || `alm-${idx}`,
                origen: 'ALMACEN',
                documento: numStr || `DP-${idx}`,
                ocAsociada: item.oc || item.pedido || '',
                fecha: item.fecha || '',
                cuentaAuxiliar: cta,
                proyectoNombre: nomProyecto,
                tipoCosto,
                codigo: item.codigo || 'RP-VARIOS',
                descripcion: desc,
                categoria: item.categoria || 'Materiales Directos',
                cantidad: safeNumber(item.cantidad, 0),
                unidad: item.unidad || 'UND',
                precioUnitario: safeNumber(item.precio_final || item.precio_dolar, 0),
                totalUSD: safeNumber(item.total_usd, 0),
                solicitante: item.solicitante || 'S/D',
                proveedorOAlmacen: item.almacen || 'ALMCE',
                motivo: item.motivo || '',
                estadoRC: 'CON_RC', // Consumo de almacén ya salió físicamente y fue entregado en obra
                mes
              });
            }
          });
        }
      } catch (errUnif) {
        console.warn('Error cargando unificada:', errUnif);
      }

      setRawData(records);
    } catch (e) {
      console.error('Error global cargando SIGMA SIP:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSipData(mesSeleccionado);
  }, [mesSeleccionado]);

  // Lista de cuentas auxiliares únicas para filtro
  const cuentasUnicas = useMemo(() => {
    const set = new Set<string>();
    rawData.forEach(r => {
      if (r.cuentaAuxiliar) set.add(r.cuentaAuxiliar);
    });
    return Array.from(set).sort();
  }, [rawData]);

  // 1. Ámbito Base: Filtrado por Tipo de Costo, Cuenta Auxiliar y Buscador
  // Los KPIs superiores se calculan de este ámbito base para que NUNCA se pongan en cero
  // al hacer clic en una tarjeta o cambiar de pestaña de origen.
  const baseData = useMemo(() => {
    return rawData.filter(item => {
      // Filtro Tipo de Costo
      if (tipoCostoFiltro !== 'TODAS' && item.tipoCosto !== tipoCostoFiltro) return false;

      // Filtro Cuenta Auxiliar
      if (cuentaFiltro !== 'TODAS' && item.cuentaAuxiliar !== cuentaFiltro) return false;

      // Buscador
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const doc = (item.documento || '').toLowerCase();
        const oc = (item.ocAsociada || '').toLowerCase();
        const desc = (item.descripcion || '').toLowerCase();
        const cod = (item.codigo || '').toLowerCase();
        const sol = (item.solicitante || '').toLowerCase();
        const prov = (item.proveedorOAlmacen || '').toLowerCase();
        const mot = (item.motivo || '').toLowerCase();
        const cta = (item.cuentaAuxiliar || '').toLowerCase();
        const proy = (item.proyectoNombre || '').toLowerCase();

        return (
          doc.includes(q) ||
          oc.includes(q) ||
          desc.includes(q) ||
          cod.includes(q) ||
          sol.includes(q) ||
          prov.includes(q) ||
          mot.includes(q) ||
          cta.includes(q) ||
          proy.includes(q)
        );
      }

      return true;
    });
  }, [rawData, tipoCostoFiltro, cuentaFiltro, searchTerm]);

  // 2. KPIs superiores: calculados desde baseData (mantienen siempre visibles los totales reales de cada categoría)
  const kpis = useMemo(() => {
    let totalUSD = 0;
    let totalAlmacenUSD = 0;
    let countAlmacen = 0;
    let totalServiciosUSD = 0;
    let countServicios = 0;
    let totalExternosUSD = 0;
    let countExternos = 0;
    let totalOpexUSD = 0;
    let countOpex = 0;
    let totalConRCUSD = 0;
    let totalSinRCUSD = 0;

    baseData.forEach(r => {
      totalUSD += r.totalUSD;
      if (r.origen === 'ALMACEN') {
        totalAlmacenUSD += r.totalUSD;
        countAlmacen++;
        totalConRCUSD += r.totalUSD; // Los vales ya son consumos entregados físicamente en obra
      } else if (r.origen === 'SERVICIO') {
        totalServiciosUSD += r.totalUSD;
        countServicios++;
        if (r.estadoRC === 'CON_RC') totalConRCUSD += r.totalUSD;
        if (r.estadoRC === 'SIN_RC') totalSinRCUSD += r.totalUSD;
      }

      if (r.tipoCosto === 'Externo') {
        totalExternosUSD += r.totalUSD;
        countExternos++;
      } else if (r.tipoCosto === 'OPEX') {
        totalOpexUSD += r.totalUSD;
        countOpex++;
      }
    });

    return {
      totalUSD,
      totalAlmacenUSD,
      countAlmacen,
      totalServiciosUSD,
      countServicios,
      totalExternosUSD,
      countExternos,
      totalOpexUSD,
      countOpex,
      totalConRCUSD,
      totalSinRCUSD,
      totalItems: baseData.length
    };
  }, [baseData]);

  // 3. Filtrado para la tabla de abajo (aplica pestaña de origen y filtro de RC sobre baseData)
  const filteredData = useMemo(() => {
    return baseData.filter(item => {
      // Filtro Origen
      if (origenFiltro !== 'TODOS' && item.origen !== origenFiltro) return false;

      // Filtro Estado RC (Recepción formal para Servicios/Compras; Vales de almacén siempre están entregados/ejecutados)
      if (estadoRcFiltro !== 'TODOS') {
        if (item.origen === 'ALMACEN') {
          // Si el usuario filtra por "SIN_RC", excluye los vales (porque los vales ya fueron entregados físicamente)
          if (estadoRcFiltro === 'SIN_RC') return false;
        } else {
          if (estadoRcFiltro === 'CON_RC' && item.estadoRC !== 'CON_RC') return false;
          if (estadoRcFiltro === 'SIN_RC' && item.estadoRC !== 'SIN_RC') return false;
        }
      }

      return true;
    });
  }, [baseData, origenFiltro, estadoRcFiltro]);

  // Resetear página al filtrar
  useEffect(() => {
    setCurrentPage(1);
  }, [origenFiltro, estadoRcFiltro, tipoCostoFiltro, cuentaFiltro, searchTerm]);

  // Paginación
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  // Exportar a Excel limpio
  const handleExportExcel = () => {
    const rows = filteredData.map(r => ({
      'Mes': r.mes.toUpperCase(),
      'Origen SIP': r.origen,
      'Documento': r.documento,
      'OC Asociada': r.ocAsociada || '',
      'Fecha': r.fecha,
      'Cuenta Auxiliar': r.cuentaAuxiliar,
      'Nombre Proyecto / Ceco': r.proyectoNombre,
      'Clasificación': r.tipoCosto,
      'Código': r.codigo,
      'Descripción': r.descripcion,
      'Categoría': r.categoria,
      'Cantidad': r.cantidad,
      'Unidad': r.unidad,
      'Precio Unitario USD': r.precioUnitario,
      'Total USD': r.totalUSD,
      'Estado Recepción (RC)': r.estadoRC === 'CON_RC' ? 'CON RC' : r.estadoRC === 'SIN_RC' ? 'SIN RC' : 'CONSUMIDO EN ALMACÉN',
      'Cant. OC': r.cantidadOC ?? '',
      'Cant. Recepcionada': r.cantidadRecepcionada ?? '',
      'Solicitante': r.solicitante,
      'Proveedor / Almacén': r.proveedorOAlmacen,
      'Justificación / Motivo': r.motivo
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `SIGMA_${mesSeleccionado.toUpperCase()}`);
    XLSX.writeFile(wb, `SIGMA_SIP_Puro_${mesSeleccionado}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="w-full max-w-[1920px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6 select-none">
      
      {/* 1. HEADER PRINCIPAL DE SIGMA */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-indigo-900/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold tracking-wide border border-indigo-400/30">
              <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              Módulo de Auditoría Pura SIP • Modelo Estrella TIMACA
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
              ⚡ SIGMA: Extracción Directa SIP
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
              Consolidación limpia y 100% auditable de consumos reales de almacén, órdenes de procura de servicios y compras directas. Sin agregados sintéticos ni reclasificaciones artificiales.
            </p>
          </div>

          {/* Selector de Mes + Botón Refrescar + Exportar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center bg-slate-800/80 rounded-2xl p-1.5 border border-slate-700/80 shadow-inner">
              {(['agosto', 'septiembre', 'octubre', 'noviembre'] as const).map(mes => (
                <button
                  key={mes}
                  onClick={() => setMesSeleccionado(mes)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                    mesSeleccionado === mes
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  {mes}
                </button>
              ))}
            </div>

            <button
              onClick={() => loadSipData(mesSeleccionado)}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 border border-slate-700 transition cursor-pointer"
              title="Recargar datos directamente desde SIP"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
              Sincronizar
            </button>

            <button
              onClick={handleExportExcel}
              disabled={filteredData.length === 0}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg transition cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              Exportar Excel
            </button>
          </div>
        </div>
      </div>

      {/* 2. TARJETAS KPI RESUMEN */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        
        {/* KPI: Gran Total */}
        <div 
          onClick={() => {
            setOrigenFiltro('TODOS');
            setEstadoRcFiltro('TODOS');
          }}
          className={`rounded-2xl p-4 border transition cursor-pointer flex flex-col justify-between ${
            origenFiltro === 'TODOS' && estadoRcFiltro === 'TODOS'
              ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900/20'
              : 'bg-white border-slate-200 hover:border-slate-400'
          }`}
          title="Ver todos los movimientos del mes"
        >
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className={origenFiltro === 'TODOS' && estadoRcFiltro === 'TODOS' ? 'text-indigo-200' : 'text-slate-500'}>
              Gran Total SIP
            </span>
            <DollarSign className={`w-4 h-4 ${origenFiltro === 'TODOS' && estadoRcFiltro === 'TODOS' ? 'text-amber-400' : 'text-indigo-600'}`} />
          </div>
          <div className="mt-2">
            <div className={`text-lg sm:text-xl font-bold tracking-tight ${origenFiltro === 'TODOS' && estadoRcFiltro === 'TODOS' ? 'text-white' : 'text-slate-900'}`}>
              {safeFormatUSD(kpis.totalUSD)}
            </div>
            <div className={`text-[11px] mt-0.5 ${origenFiltro === 'TODOS' && estadoRcFiltro === 'TODOS' ? 'text-slate-300' : 'text-slate-400'}`}>
              {kpis.totalItems.toLocaleString()} movimientos totales
            </div>
          </div>
        </div>

        {/* KPI: Vales Almacén */}
        <div 
          onClick={() => {
            const next = origenFiltro === 'ALMACEN' ? 'TODOS' : 'ALMACEN';
            setOrigenFiltro(next);
            if (next === 'ALMACEN' && estadoRcFiltro === 'SIN_RC') setEstadoRcFiltro('TODOS');
          }}
          className={`rounded-2xl p-4 border transition cursor-pointer flex flex-col justify-between ${
            origenFiltro === 'ALMACEN'
              ? 'bg-blue-50/70 border-blue-400 ring-2 ring-blue-500/20'
              : 'bg-white border-slate-200 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between text-blue-600 text-xs font-semibold">
            <span>Vales Almacén (Consumo)</span>
            <Boxes className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2">
            <div className="text-lg sm:text-xl font-bold text-blue-950 tracking-tight">
              {safeFormatUSD(kpis.totalAlmacenUSD)}
            </div>
            <div className="text-[11px] text-blue-600/80 mt-0.5">
              {kpis.countAlmacen.toLocaleString()} vales DP... en obra
            </div>
          </div>
        </div>

        {/* KPI: Servicios */}
        <div 
          onClick={() => setOrigenFiltro('SERVICIO')}
          className={`rounded-2xl p-4 border transition cursor-pointer flex flex-col justify-between ${
            origenFiltro === 'SERVICIO'
              ? 'bg-purple-50/70 border-purple-400 ring-2 ring-purple-500/20'
              : 'bg-white border-slate-200 hover:border-purple-300'
          }`}
        >
          <div className="flex items-center justify-between text-purple-600 text-xs font-semibold">
            <span>Servicios Procura</span>
            <Briefcase className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2">
            <div className="text-lg sm:text-xl font-bold text-purple-950 tracking-tight">
              {safeFormatUSD(kpis.totalServiciosUSD)}
            </div>
            <div className="text-[11px] text-purple-600/80 mt-0.5">
              {kpis.countServicios.toLocaleString()} órdenes SC/SE
            </div>
          </div>
        </div>

        {/* KPI: Obras Clientes (Externos) */}
        <div 
          onClick={() => setTipoCostoFiltro(tipoCostoFiltro === 'Externo' ? 'TODAS' : 'Externo')}
          className={`rounded-2xl p-4 border transition cursor-pointer flex flex-col justify-between ${
            tipoCostoFiltro === 'Externo'
              ? 'bg-emerald-50/70 border-emerald-400 ring-2 ring-emerald-500/20'
              : 'bg-white border-slate-200 hover:border-emerald-300'
          }`}
          title="Filtrar por Obras de Clientes (PMH, Pellas, Briquetas, etc.)"
        >
          <div className="flex items-center justify-between text-emerald-700 text-xs font-semibold">
            <span>Obras Clientes (Externos)</span>
            <Building2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2">
            <div className="text-lg sm:text-xl font-bold text-emerald-950 tracking-tight">
              {safeFormatUSD(kpis.totalExternosUSD)}
            </div>
            <div className="text-[11px] text-emerald-700/80 mt-0.5">
              {kpis.countExternos.toLocaleString()} movimientos en obra
            </div>
          </div>
        </div>

        {/* KPI: OPEX Flota & Taller */}
        <div 
          onClick={() => setTipoCostoFiltro(tipoCostoFiltro === 'OPEX' ? 'TODAS' : 'OPEX')}
          className={`rounded-2xl p-4 border transition cursor-pointer flex flex-col justify-between ${
            tipoCostoFiltro === 'OPEX'
              ? 'bg-amber-50/70 border-amber-400 ring-2 ring-amber-500/20'
              : 'bg-white border-slate-200 hover:border-amber-300'
          }`}
          title="Filtrar por Mantenimiento de Flota Pesada, Grúas e Infraestructura"
        >
          <div className="flex items-center justify-between text-amber-700 text-xs font-semibold">
            <span>OPEX Flota & Taller</span>
            <Layers className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2">
            <div className="text-lg sm:text-xl font-bold text-amber-950 tracking-tight">
              {safeFormatUSD(kpis.totalOpexUSD)}
            </div>
            <div className="text-[11px] text-amber-700/80 mt-0.5">
              {kpis.countOpex.toLocaleString()} movimientos internos
            </div>
          </div>
        </div>

        {/* KPI: Con Recepción (RC) */}
        <div 
          onClick={() => setEstadoRcFiltro(estadoRcFiltro === 'CON_RC' ? 'TODOS' : 'CON_RC')}
          className={`rounded-2xl p-4 border transition cursor-pointer flex flex-col justify-between ${
            estadoRcFiltro === 'CON_RC'
              ? 'bg-cyan-50/70 border-cyan-400 ring-2 ring-cyan-500/20'
              : 'bg-white border-slate-200 hover:border-cyan-300'
          }`}
        >
          <div className="flex items-center justify-between text-cyan-700 text-xs font-semibold">
            <span>Confirmado en SIP</span>
            <CheckCircle2 className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="mt-2">
            <div className="text-lg sm:text-xl font-bold text-cyan-950 tracking-tight">
              {safeFormatUSD(kpis.totalConRCUSD)}
            </div>
            <div className="text-[11px] text-cyan-700/80 mt-0.5">
              100% Auditado SIP Puro
            </div>
          </div>
        </div>

      </div>

      {/* 3. BARRA DE FILTROS SUPERIOR */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          
          {/* Selector de Origen Tabs */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setOrigenFiltro('TODOS')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                origenFiltro === 'TODOS' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Todos ({kpis.totalItems.toLocaleString()})
            </button>
            <button
              onClick={() => {
                setOrigenFiltro('ALMACEN');
                if (estadoRcFiltro === 'SIN_RC') setEstadoRcFiltro('TODOS');
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                origenFiltro === 'ALMACEN' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Boxes className="w-3.5 h-3.5" />
              Almacén (Vales DP)
            </button>
            <button
              onClick={() => setOrigenFiltro('SERVICIO')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                origenFiltro === 'SERVICIO' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              Servicios de Procura (SC/OC)
            </button>
          </div>

          {/* Filtros Dropdown: Clasificación + Cuenta Auxiliar */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Clasificación */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold">Tipo:</span>
              <select
                value={tipoCostoFiltro}
                onChange={e => setTipoCostoFiltro(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="TODAS">Todas las Clasificaciones</option>
                <option value="Externo">Externos (Clientes / Obras)</option>
                <option value="CAPEX">CAPEX (Inversiones)</option>
                <option value="OPEX">OPEX (Flota & Taller)</option>
              </select>
            </div>

            {/* Cuenta Auxiliar */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold">Cuenta:</span>
              <select
                value={cuentaFiltro}
                onChange={e => setCuentaFiltro(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500 cursor-pointer max-w-[220px] truncate"
              >
                <option value="TODAS">Todas las Cuentas ({cuentasUnicas.length})</option>
                {cuentasUnicas.map(cta => (
                  <option key={cta} value={cta}>
                    {cta} - {CUENTAS_CORTAS_OFICIALES[cta] || 'Sin Nombre'}
                  </option>
                ))}
              </select>
            </div>

            {/* Estado RC */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold">RC:</span>
              <select
                value={estadoRcFiltro}
                onChange={e => setEstadoRcFiltro(e.target.value as any)}
                disabled={origenFiltro === 'ALMACEN'}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                title={origenFiltro === 'ALMACEN' ? 'Los vales de almacén son consumos físicos ya despachados en obra' : undefined}
              >
                {origenFiltro === 'ALMACEN' ? (
                  <option value="TODOS">Despachados / Entregados en Obra</option>
                ) : (
                  <>
                    <option value="TODOS">Todos los Estados</option>
                    <option value="CON_RC">Con Recepción (RC)</option>
                    <option value="SIN_RC">Sin Recepción (Pendiente)</option>
                  </>
                )}
              </select>
            </div>

          </div>

          {/* Buscador en tiempo real */}
          <div className="relative min-w-[260px] lg:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar Vale, SC, OC, artículo..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:bg-white transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

        </div>
      </div>

      {/* 4. TABLA PRINCIPAL DE DATOS REALES */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-sm font-semibold text-slate-700">Cargando registros reales desde SIP ({mesSeleccionado})...</p>
            <p className="text-xs text-slate-400">Filtrando consumos puros de almacén, órdenes de procura y compras.</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-center space-y-3">
            <Info className="w-8 h-8 text-slate-400" />
            <p className="text-sm font-bold text-slate-700">No se encontraron registros con los filtros seleccionados</p>
            <p className="text-xs text-slate-400">Intenta cambiar el origen, la cuenta auxiliar o el término de búsqueda.</p>
          </div>
        ) : (
          <>
            {/* Banner de resumen de lo mostrado en tabla */}
            <div className="bg-slate-50/90 px-4 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs select-none">
              <div className="flex items-center gap-2 text-slate-700">
                <span className="text-slate-500 font-semibold">Mostrando en tabla:</span>
                <span className="font-bold text-slate-900 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 shadow-2xs">
                  {origenFiltro === 'TODOS' ? '🌐 Todos los Movimientos SIP' : origenFiltro === 'ALMACEN' ? '📦 Vales de Almacén (Consumo Físico)' : '💼 Servicios de Procura (SC/OC)'}
                </span>
                {estadoRcFiltro !== 'TODOS' && (
                  <span className={`px-2 py-0.5 rounded-lg font-bold border shadow-2xs ${estadoRcFiltro === 'CON_RC' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'}`}>
                    {estadoRcFiltro === 'CON_RC' ? '✓ Con Recepción / Despachados' : '⚠️ Sin Recepción Formal'}
                  </span>
                )}
                <span className="text-slate-400">•</span>
                <span className="font-mono font-bold text-indigo-950 text-sm">
                  {safeFormatUSD(filteredData.reduce((acc, r) => acc + r.totalUSD, 0))}
                </span>
                <span className="text-slate-500">
                  ({filteredData.length.toLocaleString()} movimientos)
                </span>
              </div>

              {(origenFiltro !== 'TODOS' || estadoRcFiltro !== 'TODOS' || tipoCostoFiltro !== 'TODAS' || cuentaFiltro !== 'TODAS' || searchTerm) && (
                <button
                  onClick={() => {
                    setOrigenFiltro('TODOS');
                    setEstadoRcFiltro('TODOS');
                    setTipoCostoFiltro('TODAS');
                    setCuentaFiltro('TODAS');
                    setSearchTerm('');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white hover:bg-slate-100 text-indigo-600 hover:text-indigo-800 font-bold border border-slate-200 shadow-2xs transition cursor-pointer text-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Restablecer a Todo ({kpis.totalItems.toLocaleString()} movs • {safeFormatUSD(kpis.totalUSD)})
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">Fecha</th>
                  <th className="py-3 px-3">Origen</th>
                  <th className="py-3 px-3">Documento</th>
                  <th className="py-3 px-3">Cuenta Auxiliar</th>
                  <th className="py-3 px-3">Código</th>
                  <th className="py-3 px-3 min-w-[220px]">Descripción</th>
                  <th className="py-3 px-3 text-right">Cantidad</th>
                  <th className="py-3 px-3 text-right">Precio USD</th>
                  <th className="py-3 px-3 text-right">Total USD</th>
                  <th className="py-3 px-3 text-center">Estado RC</th>
                  <th className="py-3 px-3">Solicitante</th>
                  <th className="py-3 px-3 text-center">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {paginatedData.map((row, idx) => (
                  <tr 
                    key={row.id || idx}
                    className="hover:bg-indigo-50/40 transition-colors"
                  >
                    <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap text-[11px]">
                      {row.fecha || 'S/F'}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {row.origen === 'ALMACEN' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          <Boxes className="w-2.5 h-2.5" /> Almacén
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                          <Briefcase className="w-2.5 h-2.5" /> Servicio
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {row.documento}
                      {row.ocAsociada && row.ocAsociada !== row.documento && (
                        <span className="block text-[10px] font-normal text-slate-400">
                          {row.ocAsociada}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="font-bold text-slate-900 font-mono">{row.cuentaAuxiliar}</span>
                      <span className="block text-[10px] text-slate-500 truncate max-w-[150px]" title={row.proyectoNombre}>
                        {row.proyectoNombre}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                      {row.codigo}
                    </td>
                    <td className="py-2.5 px-3 text-slate-900">
                      <div className="line-clamp-2" title={row.descripcion}>
                        {row.descripcion}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono whitespace-nowrap">
                      {safeFormatQuantity(row.cantidad)} <span className="text-slate-400 text-[10px]">{row.unidad}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600 whitespace-nowrap">
                      {safeFormatUSD(row.precioUnitario)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-indigo-950 whitespace-nowrap">
                      {safeFormatUSD(row.totalUSD)}
                    </td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      {row.estadoRC === 'CON_RC' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Con RC
                        </span>
                      ) : row.estadoRC === 'SIN_RC' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <AlertTriangle className="w-2.5 h-2.5" /> Sin RC
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                          Despachado
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 truncate max-w-[120px]" title={row.solicitante}>
                      {row.solicitante}
                    </td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <button
                        onClick={() => setSelectedRecord(row)}
                        className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-indigo-600 transition cursor-pointer"
                        title="Ver detalle de justificación SIP"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
        )}

        {/* Paginador */}
        <div className="p-4 bg-slate-50/70 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span>Mostrando {((currentPage - 1) * pageSize) + 1} a {Math.min(currentPage * pageSize, filteredData.length)} de {filteredData.length.toLocaleString()} registros</span>
            <select
              value={pageSize}
              onChange={e => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs outline-none cursor-pointer"
            >
              <option value={25}>25 por pág.</option>
              <option value={50}>50 por pág.</option>
              <option value={100}>100 por pág.</option>
              <option value={200}>200 por pág.</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
              title="Primera página"
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
              title="Página anterior"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-3 py-1 font-bold text-slate-900">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
              title="Página siguiente"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
              title="Última página"
            >
              <ChevronsRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* 5. MODAL DE DETALLE / AUDITORÍA PROFUNDA */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 relative animate-in fade-in zoom-in duration-150">
            
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {selectedRecord.origen}
                  </span>
                  <span className="font-mono text-sm font-bold text-slate-900">
                    {selectedRecord.documento}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  {selectedRecord.descripcion}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Fecha Documento</span>
                <span className="font-bold text-slate-800">{selectedRecord.fecha || 'N/A'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Cuenta Auxiliar</span>
                <span className="font-mono font-bold text-indigo-600">{selectedRecord.cuentaAuxiliar}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Proyecto</span>
                <span className="font-bold text-slate-800 truncate block">{selectedRecord.proyectoNombre}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Código Artículo / Servicio</span>
                <span className="font-mono font-bold text-slate-800">{selectedRecord.codigo}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Cantidad & Unidad</span>
                <span className="font-bold text-slate-800">{safeFormatQuantity(selectedRecord.cantidad)} {selectedRecord.unidad}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Total USD</span>
                <span className="font-bold text-emerald-600 text-sm">{safeFormatUSD(selectedRecord.totalUSD)}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Solicitante Real</span>
                <span className="font-bold text-slate-800">{selectedRecord.solicitante}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Proveedor / Almacén</span>
                <span className="font-bold text-slate-800 truncate block">{selectedRecord.proveedorOAlmacen}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Estado Recepción</span>
                <span className="font-bold text-slate-800">
                  {selectedRecord.estadoRC === 'CON_RC' ? 'Con Recepción Confirmada' : selectedRecord.estadoRC === 'SIN_RC' ? 'Pendiente de Recepción (Sin RC)' : 'Despachado en Almacén'}
                </span>
              </div>
            </div>

            {/* Motivo de justificación en SIP */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1.5">
              <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wide flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-amber-600" />
                Motivo / Justificación Registrada en SIP:
              </span>
              <p className="text-xs text-amber-950 leading-relaxed italic">
                "{selectedRecord.motivo || 'Sin justificación textual registrada en la orden/vale SIP.'}"
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
              >
                Cerrar Detalle
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
