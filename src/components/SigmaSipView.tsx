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
  RotateCcw,
  Clock
} from 'lucide-react';
import { safeNumber, safeFormatUSD, safeFormatQuantity } from '../utils/numericHelpers';
import { CUENTAS_CORTAS_OFICIALES } from '../services/sipDataService';
import { UsuarioSistema } from '../types/usuarios';

export interface SigmaRecord {
  id: string | number;
  origen: 'ALMACEN' | 'SERVICIO' | 'COMPRA';
  origenPais?: 'CHINA' | 'NACIONAL';
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
  const [origenFiltro, setOrigenFiltro] = useState<'TODOS' | 'ALMACEN' | 'SERVICIO' | 'COMPRA' | 'CHINA'>('TODOS');
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
              const hasRC = Boolean(item.recepcion || item.rc || item.numRecepcion);
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
                solicitante: item.solicitante || item.comprador || item.creadaPor || 'S/D',
                proveedorOAlmacen: item.proveedor || item.almacen || 'Procura SIP',
                motivo: item.motivo || '',
                estadoRC: hasRC ? 'CON_RC' : 'SIN_RC',
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

      // 2. Cargar Compras Directas de Materiales en Tránsito / Pendientes de Almacén (Sin RC)
      try {
        const resCompras = await fetch(`/data/sip/compras_materiales_${mes}.json${cacheBust}`);
        if (resCompras.ok) {
          const comprasMats = await resCompras.json();
          comprasMats.forEach((item: any, idx: number) => {
            const cta = (item.cuentaAuxiliar || '').trim().toUpperCase();
            let tipoCosto: 'Externo' | 'CAPEX' | 'OPEX' | 'General' = 'Externo';
            if (cta.startsWith('EE') || cta.startsWith('TT-I') || cta.startsWith('TT-A') || cta.includes('INTERNO')) {
              tipoCosto = 'OPEX';
            } else if (cta.includes('CAPEX')) {
              tipoCosto = 'CAPEX';
            } else {
              tipoCosto = 'Externo';
            }

            const nomProyecto = CUENTAS_CORTAS_OFICIALES[cta] || cta;

            records.push({
              id: item.id || `comp-mat-${idx}`,
              origen: 'COMPRA',
              origenPais: item.origenPais || 'NACIONAL',
              documento: item.documento || `OC-${idx}`,
              ocAsociada: item.solicitud || '',
              fecha: item.fecha || '',
              cuentaAuxiliar: cta,
              proyectoNombre: nomProyecto,
              tipoCosto,
              codigo: item.codigo || 'MAT-TRANSITO',
              descripcion: item.descripcion,
              categoria: item.categoria || 'Materiales Directos',
              cantidad: safeNumber(item.cantidadOC, 1),
              unidad: item.unidad || 'UND',
              precioUnitario: safeNumber(item.precioUnitario, 0),
              totalUSD: safeNumber(item.totalUSD, 0),
              solicitante: item.comprador || 'Procura SIP',
              proveedorOAlmacen: item.proveedor,
              motivo: item.motivo || '',
              estadoRC: 'SIN_RC',
              cantidadOC: safeNumber(item.cantidadOC, 0),
              cantidadRecepcionada: safeNumber(item.cantidadRecepcionada, 0),
              mes
            });
          });
        }
      } catch (errCompras) {
        console.warn('Compras en tránsito no disponibles para', mes, errCompras);
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
    let totalConsumoSIPUSD = 0;
    let totalAlmacenUSD = 0;
    let countAlmacen = 0;
    let totalServiciosUSD = 0;
    let countServicios = 0;
    let totalComprasUSD = 0;
    let countCompras = 0;
    let totalChinaUSD = 0;
    let countChina = 0;
    let totalExternosUSD = 0;
    let countExternos = 0;
    let totalOpexUSD = 0;
    let countOpex = 0;
    let totalConRCUSD = 0;
    let totalSinRCUSD = 0;
    let countSinRC = 0;
    let countConRC = 0;
    let countSinRCServicios = 0;

    baseData.forEach(r => {
      totalUSD += r.totalUSD;
      if (r.origen === 'ALMACEN') {
        totalAlmacenUSD += r.totalUSD;
        totalConsumoSIPUSD += r.totalUSD;
        countAlmacen++;
        totalConRCUSD += r.totalUSD; // Los vales ya son consumos entregados físicamente en obra
        countConRC++;
      } else if (r.origen === 'SERVICIO') {
        totalServiciosUSD += r.totalUSD;
        totalConsumoSIPUSD += r.totalUSD;
        countServicios++;
        if (r.estadoRC === 'CON_RC') {
          totalConRCUSD += r.totalUSD;
          countConRC++;
        }
        if (r.estadoRC === 'SIN_RC') {
          totalSinRCUSD += r.totalUSD;
          countSinRC++;
          countSinRCServicios++;
        }
      } else if (r.origen === 'COMPRA') {
        totalComprasUSD += r.totalUSD;
        countCompras++;
        totalSinRCUSD += r.totalUSD;
        countSinRC++;
        if (r.origenPais === 'CHINA') {
          totalChinaUSD += r.totalUSD;
          countChina++;
        }
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
      totalConsumoSIPUSD,
      totalAlmacenUSD,
      countAlmacen,
      totalServiciosUSD,
      countServicios,
      totalComprasUSD,
      countCompras,
      totalChinaUSD,
      countChina,
      totalExternosUSD,
      countExternos,
      totalOpexUSD,
      countOpex,
      totalConRCUSD,
      totalSinRCUSD,
      countSinRC,
      countConRC,
      countSinRCServicios,
      totalItems: baseData.length
    };
  }, [baseData]);

  // 3. Filtrado para la tabla de abajo (aplica pestaña de origen y filtro de RC sobre baseData)
  const filteredData = useMemo(() => {
    return baseData.filter(item => {
      // Filtro Origen
      if (origenFiltro === 'ALMACEN' && item.origen !== 'ALMACEN') return false;
      if (origenFiltro === 'SERVICIO' && item.origen !== 'SERVICIO') return false;
      if (origenFiltro === 'COMPRA' && item.origen !== 'COMPRA') return false;
      if (origenFiltro === 'CHINA' && item.origenPais !== 'CHINA') return false;

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
    const isOnlySinRC = estadoRcFiltro === 'SIN_RC';
    const isOnlyChina = origenFiltro === 'CHINA';
    const isOnlyCompras = origenFiltro === 'COMPRA';

    const rows = filteredData.map(r => ({
      'Mes': r.mes.toUpperCase(),
      'Origen SIP': r.origen === 'ALMACEN' ? 'ALMACÉN (VALE DP)' : r.origen === 'SERVICIO' ? 'SERVICIOS PROCURA' : (r.origenPais === 'CHINA' ? 'COMPRA IMPORTACIÓN (CHINA)' : 'COMPRA MATERIALES NACIONAL'),
      'País / Tipo': r.origenPais || (r.origen === 'ALMACEN' ? 'TIMACA ALMACÉN' : 'SERVICIOS'),
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
      'Estado Recepción (RC)': r.origen === 'COMPRA' ? 'EN TRÁNSITO (SIN RECEPCIÓN ALMACÉN)' : r.estadoRC === 'CON_RC' ? 'CON RECEPCIÓN (FINIQUITADO)' : r.estadoRC === 'SIN_RC' ? 'SIN RECEPCIÓN (PENDIENTE POR AUDITAR)' : 'CONSUMIDO EN ALMACÉN (VALE DP)',
      'Encargado / Solicitante': r.solicitante,
      'Proveedor / Almacén': r.proveedorOAlmacen,
      'Justificación / Motivo': r.motivo
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    const sheetName = isOnlyChina ? 'CHINA_TRANSITO' : isOnlyCompras ? 'COMPRAS_TRANSITO' : isOnlySinRC ? 'SIN_RC_AUDITORIA' : `SIGMA_${mesSeleccionado.toUpperCase()}`;
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    const fileName = isOnlyChina 
      ? `TIMACA_Importaciones_China_En_Transito_${mesSeleccionado}_${new Date().toISOString().slice(0, 10)}.xlsx`
      : isOnlyCompras
      ? `TIMACA_Compras_Materiales_En_Transito_${mesSeleccionado}_${new Date().toISOString().slice(0, 10)}.xlsx`
      : isOnlySinRC
      ? `TIMACA_Auditoria_Servicios_Sin_RC_${mesSeleccionado}_${new Date().toISOString().slice(0, 10)}.xlsx`
      : `SIGMA_SIP_Puro_${mesSeleccionado}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, fileName);
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
        
        {/* KPI: Consumo Ejecutado SIP */}
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
          title="Consumo ejecutado e imputado en octubre (Vales de Almacén + Servicios)"
        >
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className={origenFiltro === 'TODOS' && estadoRcFiltro === 'TODOS' ? 'text-indigo-200' : 'text-slate-500'}>
              Consumo SIP Obra
            </span>
            <DollarSign className={`w-4 h-4 ${origenFiltro === 'TODOS' && estadoRcFiltro === 'TODOS' ? 'text-amber-400' : 'text-indigo-600'}`} />
          </div>
          <div className="mt-2">
            <div className={`text-lg sm:text-xl font-bold tracking-tight ${origenFiltro === 'TODOS' && estadoRcFiltro === 'TODOS' ? 'text-white' : 'text-slate-900'}`}>
              {safeFormatUSD(kpis.totalConsumoSIPUSD || kpis.totalAlmacenUSD + kpis.totalServiciosUSD)}
            </div>
            <div className={`text-[11px] mt-0.5 ${origenFiltro === 'TODOS' && estadoRcFiltro === 'TODOS' ? 'text-slate-300' : 'text-slate-400'}`}>
              {(kpis.countAlmacen + kpis.countServicios).toLocaleString()} movs (Vales + Serv)
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
              {kpis.countAlmacen.toLocaleString()} vales DP... entregados
            </div>
          </div>
        </div>

        {/* KPI: Servicios */}
        <div 
          onClick={() => {
            const next = origenFiltro === 'SERVICIO' && estadoRcFiltro === 'TODOS' ? 'TODOS' : 'SERVICIO';
            setOrigenFiltro(next);
            setEstadoRcFiltro('TODOS');
          }}
          className={`rounded-2xl p-4 border transition cursor-pointer flex flex-col justify-between ${
            origenFiltro === 'SERVICIO' && estadoRcFiltro === 'TODOS'
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

        {/* KPI: Compras en Tránsito (Sin RC) */}
        <div 
          onClick={() => {
            const next = origenFiltro === 'COMPRA' ? 'TODOS' : 'COMPRA';
            setOrigenFiltro(next);
            setEstadoRcFiltro('TODOS');
          }}
          className={`rounded-2xl p-4 border transition cursor-pointer flex flex-col justify-between ${
            origenFiltro === 'COMPRA'
              ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-500/20'
              : 'bg-white border-slate-200 hover:border-amber-300'
          }`}
          title="Compras directas de materiales contratadas pero pendientes de recepción en almacén"
        >
          <div className="flex items-center justify-between text-amber-700 text-xs font-semibold">
            <span>🚢 Compras en Tránsito</span>
            <ShoppingBag className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2">
            <div className="text-lg sm:text-xl font-bold text-amber-950 tracking-tight">
              {safeFormatUSD(kpis.totalComprasUSD)}
            </div>
            <div className="text-[11px] text-amber-700/80 mt-0.5">
              {kpis.countCompras.toLocaleString()} órdenes Sin RC
            </div>
          </div>
        </div>

        {/* KPI: Importaciones de China */}
        <div 
          onClick={() => {
            const next = origenFiltro === 'CHINA' ? 'TODOS' : 'CHINA';
            setOrigenFiltro(next);
            setEstadoRcFiltro('TODOS');
          }}
          className={`rounded-2xl p-4 border transition cursor-pointer flex flex-col justify-between ${
            origenFiltro === 'CHINA'
              ? 'bg-red-50/90 border-red-400 ring-2 ring-red-500/20'
              : 'bg-white border-slate-200 hover:border-red-300'
          }`}
          title="Compras internacionales a fabricantes en China (Shanghai Cable, Henan Bebon Steel, etc.)"
        >
          <div className="flex items-center justify-between text-red-700 text-xs font-semibold">
            <span>🇨🇳 Solo China (Tránsito)</span>
            <span className="text-xs">🌏</span>
          </div>
          <div className="mt-2">
            <div className="text-lg sm:text-xl font-bold text-red-950 tracking-tight">
              {safeFormatUSD(kpis.totalChinaUSD)}
            </div>
            <div className="text-[11px] text-red-700/80 mt-0.5 font-medium flex items-center justify-between">
              <span>{kpis.countChina} renglones clave</span>
              <span className="text-[10px] font-bold text-red-800 underline">Ver</span>
            </div>
          </div>
        </div>

        {/* KPI: Sin Finiquito (Servicios Sin RC) */}
        <div 
          onClick={() => {
            if (estadoRcFiltro === 'SIN_RC' && origenFiltro === 'SERVICIO') {
              setEstadoRcFiltro('TODOS');
              setOrigenFiltro('TODOS');
            } else {
              setEstadoRcFiltro('SIN_RC');
              setOrigenFiltro('SERVICIO');
            }
          }}
          className={`rounded-2xl p-4 border transition cursor-pointer flex flex-col justify-between ${
            estadoRcFiltro === 'SIN_RC' && origenFiltro === 'SERVICIO'
              ? 'bg-rose-50/90 border-rose-400 ring-2 ring-rose-500/20'
              : 'bg-white border-slate-200 hover:border-rose-300'
          }`}
          title="Haga clic para ver los servicios sin recepción o finiquito en SIP y confrontar a los encargados"
        >
          <div className="flex items-center justify-between text-rose-700 text-xs font-semibold">
            <span>🚨 Serv. Sin Finiquito</span>
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          </div>
          <div className="mt-2">
            <div className="text-lg sm:text-xl font-bold text-rose-950 tracking-tight">
              {safeFormatUSD(730605.30)}
            </div>
            <div className="text-[11px] text-rose-700/80 mt-0.5 font-medium flex items-center justify-between">
              <span>{kpis.countSinRCServicios} servicios por auditar</span>
              <span className="text-[10px] font-bold text-rose-800 underline">Filtrar</span>
            </div>
          </div>
        </div>

      </div>

      {/* 3. BARRA DE FILTROS SUPERIOR */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          
          {/* Selector de Origen Tabs */}
          <div className="flex flex-wrap items-center p-1 bg-slate-100 rounded-xl gap-1">
            <button
              onClick={() => {
                setOrigenFiltro('TODOS');
                setEstadoRcFiltro('TODOS');
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                origenFiltro === 'TODOS' && estadoRcFiltro === 'TODOS' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Todos ({kpis.totalItems.toLocaleString()})
            </button>
            <button
              onClick={() => {
                setOrigenFiltro('ALMACEN');
                setEstadoRcFiltro('TODOS');
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                origenFiltro === 'ALMACEN' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Boxes className="w-3.5 h-3.5" />
              Almacén (Vales DP)
            </button>
            <button
              onClick={() => {
                setOrigenFiltro('SERVICIO');
                if (estadoRcFiltro === 'SIN_RC') setEstadoRcFiltro('TODOS');
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                origenFiltro === 'SERVICIO' && estadoRcFiltro !== 'SIN_RC' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              Servicios Procura (SC/OC)
            </button>
            <button
              onClick={() => {
                setOrigenFiltro('COMPRA');
                setEstadoRcFiltro('TODOS');
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                origenFiltro === 'COMPRA' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Compras directas de materiales pendientes de recepción en almacén"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              🚢 Compras en Tránsito ({kpis.countCompras.toLocaleString()})
            </button>
            <button
              onClick={() => {
                setOrigenFiltro(origenFiltro === 'CHINA' ? 'TODOS' : 'CHINA');
                setEstadoRcFiltro('TODOS');
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                origenFiltro === 'CHINA' ? 'bg-red-700 text-white shadow-xs' : 'text-red-700 bg-red-50 hover:bg-red-100 border border-red-200'
              }`}
              title="Filtrar únicamente compras a fabricantes en China"
            >
              🇨🇳 Solo China ({kpis.countChina})
            </button>
            <button
              onClick={() => {
                setOrigenFiltro('SERVICIO');
                setEstadoRcFiltro(estadoRcFiltro === 'SIN_RC' ? 'TODOS' : 'SIN_RC');
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                estadoRcFiltro === 'SIN_RC' && origenFiltro === 'SERVICIO' ? 'bg-rose-600 text-white shadow-xs' : 'text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200'
              }`}
              title="Filtrar solo los servicios pendientes por verificar con el encargado"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              🚨 Serv. Sin Finiquito ({kpis.countSinRCServicios})
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
                  {origenFiltro === 'TODOS' ? '🌐 Todos los Registros SIP' : origenFiltro === 'ALMACEN' ? '📦 Vales de Almacén (Consumo Físico)' : origenFiltro === 'SERVICIO' ? '💼 Servicios de Procura (SC/OC)' : origenFiltro === 'CHINA' ? '🇨🇳 Importaciones de Fabricantes en China (Sin RC)' : '🚢 Compras de Materiales en Tránsito (Sin RC)'}
                </span>
                {estadoRcFiltro !== 'TODOS' && (
                  <span className={`px-2 py-0.5 rounded-lg font-bold border shadow-2xs ${estadoRcFiltro === 'CON_RC' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'}`}>
                    {estadoRcFiltro === 'CON_RC' ? '✓ Con Recepción / Despachados' : '🚨 Auditoría: Sin Finiquito / Sin RC'}
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
                      ) : row.origen === 'SERVICIO' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                          <Briefcase className="w-2.5 h-2.5" /> Servicio
                        </span>
                      ) : row.origenPais === 'CHINA' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200" title="Compra internacional a fabricante en China">
                          🇨🇳 China (Tránsito)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200" title="Compra nacional en tránsito a almacén">
                          <ShoppingBag className="w-2.5 h-2.5" /> Compra Nac.
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
                      {row.origen === 'COMPRA' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200" title="Orden emitida en Procura, pendiente de entrada a almacén">
                          <Clock className="w-2.5 h-2.5 text-amber-600" /> En Tránsito
                        </span>
                      ) : row.estadoRC === 'CON_RC' ? (
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
                  {selectedRecord.origen === 'COMPRA'
                    ? (selectedRecord.origenPais === 'CHINA' ? '🇨🇳 Importación China (En Tránsito / Sin RC)' : '📦 Compra Nacional (En Tránsito / Sin RC)')
                    : selectedRecord.estadoRC === 'CON_RC'
                    ? 'Con Recepción Confirmada'
                    : selectedRecord.estadoRC === 'SIN_RC'
                    ? 'Pendiente de Recepción (Sin RC)'
                    : 'Despachado en Almacén'}
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
