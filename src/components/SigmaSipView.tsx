import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import {
  Zap,
  Boxes,
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  Search,
  Download,
  RefreshCw,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
  DollarSign,
  Info,
  RotateCcw,
  Clock,
  ArrowUpDown
} from 'lucide-react';
import { safeNumber, safeFormatUSD, safeFormatQuantity } from '../utils/numericHelpers';
import { CUENTAS_CORTAS_OFICIALES } from '../services/sipDataService';
import { UsuarioSistema } from '../types/usuarios';

export type PilarOperativo =
  | 'MATERIAL_DESPACHADO'
  | 'SERVICIO_EJECUTADO'
  | 'MATERIAL_SIN_RECEPCION'
  | 'SERVICIO_SIN_FINIQUITO';

export interface SigmaRecord {
  id: string | number;
  pilar: PilarOperativo;
  fecha: string;
  // Documentos cruzados
  solicitud: string;            // SC... o Pedido PA...
  ordenCompra: string;          // OC... o Vale DP...
  recepcionRC: string;          // Número de RC o estado
  tieneRC: boolean;
  // Imputación contable
  cuentaAuxiliar: string;       // ej. TTE-C-0671, TTE-C-0706, etc.
  proyectoNombre: string;       // Nombre oficial del proyecto TIMACA
  tipoCosto: 'Externo' | 'CAPEX' | 'OPEX' | 'General';
  // Detalle del ítem
  codigo: string;               // Código RP... / SE... / CO...
  descripcion: string;
  categoria: string;
  // Cantidades y precios
  cantidadPedida: number;       // Cantidad solicitada / de la OC
  cantidadRecepcionada: number; // Cantidad recibida formalmente en SIP
  unidad: string;
  precioUnitario: number;
  totalUSD: number;
  // Personas y proveedores
  solicitante: string;
  comprador: string;
  proveedorOAlmacen: string;
  motivo: string;
  mes: string;
}

interface SigmaSipViewProps {
  currentUser?: UsuarioSistema;
}

export const SigmaSipView: React.FC<SigmaSipViewProps> = () => {
  const [mesSeleccionado, setMesSeleccionado] = useState<string>('octubre');
  const [pilarFiltro, setPilarFiltro] = useState<'TODOS' | PilarOperativo>('TODOS');
  const [tipoCostoFiltro, setTipoCostoFiltro] = useState<string>('TODAS');
  const [cuentaFiltro, setCuentaFiltro] = useState<string>('TODAS');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(true);
  const [rawData, setRawData] = useState<SigmaRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<SigmaRecord | null>(null);

  // Ordenamiento
  const [sortField, setSortField] = useState<'fecha' | 'totalUSD' | 'cuentaAuxiliar'>('totalUSD');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Paginación
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(50);

  // Carga de datos SIP puros organizados en los 4 pilares
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
              const rcNum = item.recepcion || item.rc || item.numRecepcion || '';
              const hasRC = Boolean(rcNum);
              const cantPedida = safeNumber(item.cantidad, 1);

              if (hasRC) {
                // PILAR 2: SERVICIO EJECUTADO (Con RC formal en SIP)
                records.push({
                  id: item.id || `serv-con-rc-${idx}`,
                  pilar: 'SERVICIO_EJECUTADO',
                  fecha: item.fecha || '',
                  solicitud: item.sc || numStr || `SC-${idx}`,
                  ordenCompra: item.oc || item.pedido || '',
                  recepcionRC: String(rcNum),
                  tieneRC: true,
                  cuentaAuxiliar: cta,
                  proyectoNombre: nomProyecto,
                  tipoCosto,
                  codigo: cod || 'SE-VARIOS',
                  descripcion: desc,
                  categoria: item.categoria || 'SERVICIOS',
                  cantidadPedida: cantPedida,
                  cantidadRecepcionada: cantPedida,
                  unidad: item.unidad || 'USE',
                  precioUnitario: safeNumber(item.precio_final || item.precio_dolar, 0),
                  totalUSD: safeNumber(item.total_usd, 0),
                  solicitante: item.solicitante || 'S/D',
                  comprador: item.comprador || item.creadaPor || 'Procura SIP',
                  proveedorOAlmacen: item.proveedor || 'Procura SIP',
                  motivo: item.motivo || '',
                  mes
                });
              } else {
                // PILAR 4: SERVICIO NO EJECUTADO (Sin Finiquito / Sin RC en SIP)
                records.push({
                  id: item.id || `serv-sin-rc-${idx}`,
                  pilar: 'SERVICIO_SIN_FINIQUITO',
                  fecha: item.fecha || '',
                  solicitud: item.sc || numStr || `SC-${idx}`,
                  ordenCompra: item.oc || item.pedido || '',
                  recepcionRC: 'Sin Finiquito SIP',
                  tieneRC: false,
                  cuentaAuxiliar: cta,
                  proyectoNombre: nomProyecto,
                  tipoCosto,
                  codigo: cod || 'SE-VARIOS',
                  descripcion: desc,
                  categoria: item.categoria || 'SERVICIOS',
                  cantidadPedida: cantPedida,
                  cantidadRecepcionada: 0,
                  unidad: item.unidad || 'USE',
                  precioUnitario: safeNumber(item.precio_final || item.precio_dolar, 0),
                  totalUSD: safeNumber(item.total_usd, 0),
                  solicitante: item.solicitante || 'S/D',
                  comprador: item.comprador || item.creadaPor || 'Procura SIP',
                  proveedorOAlmacen: item.proveedor || 'Procura SIP',
                  motivo: item.motivo || '',
                  mes
                });
              }
            } else if (numStr.startsWith('DP') || item.almacen) {
              // PILAR 1: MATERIAL DESPACHADO (Vale de Almacén DP entregado físicamente a la cuenta)
              const cant = safeNumber(item.cantidad, 0);
              records.push({
                id: item.id || `alm-${idx}`,
                pilar: 'MATERIAL_DESPACHADO',
                fecha: item.fecha || '',
                solicitud: item.pedido || item.sc || '',
                ordenCompra: numStr || `DP-${idx}`,
                recepcionRC: item.oc ? `OC: ${item.oc}` : 'Despachado en Obra',
                tieneRC: true,
                cuentaAuxiliar: cta,
                proyectoNombre: nomProyecto,
                tipoCosto,
                codigo: cod || 'RP-VARIOS',
                descripcion: desc,
                categoria: item.categoria || 'Materiales Directos',
                cantidadPedida: cant,
                cantidadRecepcionada: cant,
                unidad: item.unidad || 'UND',
                precioUnitario: safeNumber(item.precio_final || item.precio_dolar, 0),
                totalUSD: safeNumber(item.total_usd, 0),
                solicitante: item.solicitante || 'S/D',
                comprador: item.creadaPor || item.solicitante || 'Almacén TIMACA',
                proveedorOAlmacen: item.almacen || 'ALMCE',
                motivo: item.motivo || '',
                mes
              });
            }
          });
        }
      } catch (errUnif) {
        console.warn('Error cargando unificada:', errUnif);
      }

      // 2. Cargar PILAR 3: Compras de Materiales NO Recepcionadas en Almacén (Sin RC)
      try {
        const resCompras = await fetch(`/data/sip/compras_materiales_${mes}.json${cacheBust}`);
        if (resCompras.ok) {
          const comprasMats = await resCompras.json();
          comprasMats.forEach((item, idx) => {
            const cta = (item.cuentaAuxiliar || '').trim().toUpperCase();
            let tipoCosto = 'Externo';
            if (cta.startsWith('EE') || cta.startsWith('TT-I') || cta.startsWith('TT-A') || cta.includes('INTERNO')) {
              tipoCosto = 'OPEX';
            } else if (cta.includes('CAPEX')) {
              tipoCosto = 'CAPEX';
            } else {
              tipoCosto = 'Externo';
            }

            const nomProyecto = CUENTAS_CORTAS_OFICIALES[cta] || cta;
            const cantOC = safeNumber(item.cantidadOC || item.cantidadSolicitada, 1);
            const cantRec = safeNumber(item.cantidadRecepcionada, 0);

            records.push({
              id: item.id || `comp-mat-${idx}`,
              pilar: 'MATERIAL_SIN_RECEPCION',
              fecha: item.fecha || '',
              solicitud: item.solicitud || item.solicitudCompra || '',
              ordenCompra: item.documento || item.ordenCompra || `OC-${idx}`,
              recepcionRC: cantRec > 0 ? `Recibido: ${cantRec}` : 'Sin Recepción Almacén',
              tieneRC: cantRec > 0,
              cuentaAuxiliar: cta,
              proyectoNombre: nomProyecto,
              tipoCosto,
              codigo: item.codigo || 'MAT-PROCURA',
              descripcion: item.descripcion,
              categoria: item.categoria || 'Materiales Directos',
              cantidadPedida: cantOC,
              cantidadRecepcionada: cantRec,
              unidad: item.unidad || 'UND',
              precioUnitario: safeNumber(item.precioUnitario, 0),
              totalUSD: safeNumber(item.totalUSD, 0),
              solicitante: item.solicitante || item.comprador || 'Procura SIP',
              comprador: item.comprador || 'Procura SIP',
              proveedorOAlmacen: item.proveedor || 'Procura SIP',
              motivo: item.motivo || 'Orden de compra de material emitida en Procura SIP',
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

  // 1. Ámbito Base: Filtrado por Tipo de Costo, Cuenta Auxiliar y Buscador Universal
  // Los KPIs se calculan de este ámbito base para que NUNCA se pongan en cero
  // al hacer clic en las tarjetas de pilares.
  const baseData = useMemo(() => {
    return rawData.filter(item => {
      // Filtro Tipo de Costo
      if (tipoCostoFiltro !== 'TODAS' && item.tipoCosto !== tipoCostoFiltro) return false;

      // Filtro Cuenta Auxiliar
      if (cuentaFiltro !== 'TODAS' && item.cuentaAuxiliar !== cuentaFiltro) return false;

      // Buscador Universal
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const sol = (item.solicitud || '').toLowerCase();
        const oc = (item.ordenCompra || '').toLowerCase();
        const rc = (item.recepcionRC || '').toLowerCase();
        const desc = (item.descripcion || '').toLowerCase();
        const cod = (item.codigo || '').toLowerCase();
        const solPers = (item.solicitante || '').toLowerCase();
        const comp = (item.comprador || '').toLowerCase();
        const prov = (item.proveedorOAlmacen || '').toLowerCase();
        const mot = (item.motivo || '').toLowerCase();
        const cta = (item.cuentaAuxiliar || '').toLowerCase();
        const proy = (item.proyectoNombre || '').toLowerCase();

        return (
          sol.includes(q) ||
          oc.includes(q) ||
          rc.includes(q) ||
          desc.includes(q) ||
          cod.includes(q) ||
          solPers.includes(q) ||
          comp.includes(q) ||
          prov.includes(q) ||
          mot.includes(q) ||
          cta.includes(q) ||
          proy.includes(q)
        );
      }

      return true;
    });
  }, [rawData, tipoCostoFiltro, cuentaFiltro, searchTerm]);

  // 2. KPIs de los 4 Pilares Operativos SIP
  const kpis = useMemo(() => {
    let totalGeneralUSD = 0;

    // Pilar 1: Materiales Despachados
    let p1Monto = 0;
    let p1Count = 0;

    // Pilar 2: Servicios Ejecutados
    let p2Monto = 0;
    let p2Count = 0;

    // Pilar 3: Materiales Comprados Sin Recepción
    let p3Monto = 0;
    let p3Count = 0;

    // Pilar 4: Servicios Sin Finiquito
    let p4Monto = 0;
    let p4Count = 0;

    baseData.forEach(r => {
      totalGeneralUSD += r.totalUSD;
      if (r.pilar === 'MATERIAL_DESPACHADO') {
        p1Monto += r.totalUSD;
        p1Count++;
      } else if (r.pilar === 'SERVICIO_EJECUTADO') {
        p2Monto += r.totalUSD;
        p2Count++;
      } else if (r.pilar === 'MATERIAL_SIN_RECEPCION') {
        p3Monto += r.totalUSD;
        p3Count++;
      } else if (r.pilar === 'SERVICIO_SIN_FINIQUITO') {
        p4Monto += r.totalUSD;
        p4Count++;
      }
    });

    const consumoObraMonto = p1Monto + p2Monto;
    const consumoObraCount = p1Count + p2Count;

    return {
      totalGeneralUSD,
      totalRegistros: baseData.length,
      p1Monto,
      p1Count,
      p2Monto,
      p2Count,
      p3Monto,
      p3Count,
      p4Monto,
      p4Count,
      consumoObraMonto,
      consumoObraCount
    };
  }, [baseData]);

  // 3. Filtrado para la tabla de abajo (aplica el pilar seleccionado sobre baseData)
  const filteredData = useMemo(() => {
    const data = baseData.filter(item => {
      if (pilarFiltro !== 'TODOS' && item.pilar !== pilarFiltro) return false;
      return true;
    });

    // Ordenamiento
    return data.sort((a, b) => {
      if (sortField === 'totalUSD') {
        return sortAsc ? a.totalUSD - b.totalUSD : b.totalUSD - a.totalUSD;
      }
      if (sortField === 'fecha') {
        return sortAsc ? a.fecha.localeCompare(b.fecha) : b.fecha.localeCompare(a.fecha);
      }
      if (sortField === 'cuentaAuxiliar') {
        return sortAsc ? a.cuentaAuxiliar.localeCompare(b.cuentaAuxiliar) : b.cuentaAuxiliar.localeCompare(a.cuentaAuxiliar);
      }
      return 0;
    });
  }, [baseData, pilarFiltro, sortField, sortAsc]);

  // Resetear página al filtrar
  useEffect(() => {
    setCurrentPage(1);
  }, [pilarFiltro, tipoCostoFiltro, cuentaFiltro, searchTerm]);

  // Paginación
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  // Exportar a Excel limpio con cruce de documentos SC, OC, Cantidades y Estado
  const handleExportExcel = () => {
    const rows = filteredData.map(r => ({
      'Mes': r.mes.toUpperCase(),
      'Pilar SIP': r.pilar === 'MATERIAL_DESPACHADO'
        ? '1. MATERIAL DESPACHADO (VALE DP)'
        : r.pilar === 'SERVICIO_EJECUTADO'
        ? '2. SERVICIO EJECUTADO (CON RC)'
        : r.pilar === 'MATERIAL_SIN_RECEPCION'
        ? '3. MATERIAL COMPRADO SIN RECEPCIÓN'
        : '4. SERVICIO PENDIENTE SIN FINIQUITO',
      'Fecha': r.fecha,
      'Solicitud (SC / Pedido)': r.solicitud,
      'Orden Compra (OC / Vale)': r.ordenCompra,
      'Recepción (RC)': r.recepcionRC,
      'Cuenta Auxiliar': r.cuentaAuxiliar,
      'Nombre Proyecto': r.proyectoNombre,
      'Clasificación': r.tipoCosto,
      'Código': r.codigo,
      'Descripción': r.descripcion,
      'Categoría': r.categoria,
      'Cant. Pedida': r.cantidadPedida,
      'Cant. Recepcionada': r.cantidadRecepcionada,
      'Unidad': r.unidad,
      'Precio Unitario USD': r.precioUnitario,
      'Total USD': r.totalUSD,
      'Proveedor / Almacén': r.proveedorOAlmacen,
      'Solicitante': r.solicitante,
      'Comprador': r.comprador,
      'Justificación / Motivo': r.motivo
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    const sheetName = pilarFiltro === 'MATERIAL_DESPACHADO'
      ? 'MATERIALES_DESPACHADOS'
      : pilarFiltro === 'SERVICIO_EJECUTADO'
      ? 'SERVICIOS_CON_RC'
      : pilarFiltro === 'MATERIAL_SIN_RECEPCION'
      ? 'MATERIALES_SIN_RC'
      : pilarFiltro === 'SERVICIO_SIN_FINIQUITO'
      ? 'SERVICIOS_SIN_RC'
      : `SIGMA_${mesSeleccionado.toUpperCase()}`;

    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    const fileName = `SIGMA_SIP_Auditoria_${sheetName}_${mesSeleccionado}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  return (
    <div className="w-full max-w-[1920px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6 select-none">

      {/* 1. HEADER PRINCIPAL */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-indigo-900/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold tracking-wide border border-indigo-400/30">
              <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              Auditoría Pura SIP • Los 4 Pilares Operativos
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
              ⚡ SIGMA: Extracción Directa SIP
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
              Información real extraída de SIP sin agrupaciones artificiales ni datos inventados: Materiales despachados, Servicios ejecutados, Compras pendientes de recepción y Servicios sin finiquito.
            </p>
          </div>

          {/* Selector de Mes + Refrescar + Exportar */}
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
              title="Descargar datos actuales cruzados en Excel"
            >
              <Download className="w-3.5 h-3.5" />
              Exportar Excel
            </button>
          </div>
        </div>
      </div>

      {/* 2. TARJETAS KPI DE LOS 4 PILARES REALES */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">

        {/* TARJETA 1: TOTAL GENERAL SIP */}
        <div
          onClick={() => setPilarFiltro('TODOS')}
          className={`rounded-2xl p-4 border transition cursor-pointer flex flex-col justify-between ${
            pilarFiltro === 'TODOS'
              ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900/20'
              : 'bg-white border-slate-200 hover:border-slate-400'
          }`}
          title="Total general de todos los movimientos SIP del mes"
        >
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className={pilarFiltro === 'TODOS' ? 'text-indigo-200' : 'text-slate-500'}>
              Total General SIP
            </span>
            <DollarSign className={`w-4 h-4 ${pilarFiltro === 'TODOS' ? 'text-amber-400' : 'text-slate-500'}`} />
          </div>
          <div className="mt-2">
            <div className={`text-lg sm:text-xl font-bold tracking-tight ${pilarFiltro === 'TODOS' ? 'text-white' : 'text-slate-900'}`}>
              {safeFormatUSD(kpis.totalGeneralUSD)}
            </div>
            <div className={`text-[11px] mt-0.5 ${pilarFiltro === 'TODOS' ? 'text-slate-300' : 'text-slate-400'}`}>
              {kpis.totalRegistros.toLocaleString()} movimientos
            </div>
          </div>
        </div>

        {/* TARJETA 2: PILAR 1 - MATERIALES DESPACHADOS (VALES DP) */}
        <div
          onClick={() => setPilarFiltro(pilarFiltro === 'MATERIAL_DESPACHADO' ? 'TODOS' : 'MATERIAL_DESPACHADO')}
          className={`rounded-2xl p-4 border transition cursor-pointer flex flex-col justify-between ${
            pilarFiltro === 'MATERIAL_DESPACHADO'
              ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-500/30'
              : 'bg-white border-slate-200 hover:border-blue-300'
          }`}
          title="Pilar 1: Materiales entregados físicamente en obra/taller mediante vales de almacén DP"
        >
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className={pilarFiltro === 'MATERIAL_DESPACHADO' ? 'text-blue-100' : 'text-blue-700 font-bold'}>
              1. Materiales Despachados
            </span>
            <Boxes className={`w-4 h-4 ${pilarFiltro === 'MATERIAL_DESPACHADO' ? 'text-white' : 'text-blue-600'}`} />
          </div>
          <div className="mt-2">
            <div className={`text-lg sm:text-xl font-bold tracking-tight ${pilarFiltro === 'MATERIAL_DESPACHADO' ? 'text-white' : 'text-blue-950'}`}>
              {safeFormatUSD(kpis.p1Monto)}
            </div>
            <div className={`text-[11px] mt-0.5 ${pilarFiltro === 'MATERIAL_DESPACHADO' ? 'text-blue-100' : 'text-blue-600'}`}>
              {kpis.p1Count.toLocaleString()} vales DP entregados
            </div>
          </div>
        </div>

        {/* TARJETA 3: PILAR 2 - SERVICIOS EJECUTADOS (CON RC) */}
        <div
          onClick={() => setPilarFiltro(pilarFiltro === 'SERVICIO_EJECUTADO' ? 'TODOS' : 'SERVICIO_EJECUTADO')}
          className={`rounded-2xl p-4 border transition cursor-pointer flex flex-col justify-between ${
            pilarFiltro === 'SERVICIO_EJECUTADO'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-500/30'
              : 'bg-white border-slate-200 hover:border-emerald-300'
          }`}
          title="Pilar 2: Servicios de Procura que cuentan con recepción formal o finiquito en SIP"
        >
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className={pilarFiltro === 'SERVICIO_EJECUTADO' ? 'text-emerald-100' : 'text-emerald-700 font-bold'}>
              2. Servicios Ejecutados
            </span>
            <CheckCircle2 className={`w-4 h-4 ${pilarFiltro === 'SERVICIO_EJECUTADO' ? 'text-white' : 'text-emerald-600'}`} />
          </div>
          <div className="mt-2">
            <div className={`text-lg sm:text-xl font-bold tracking-tight ${pilarFiltro === 'SERVICIO_EJECUTADO' ? 'text-white' : 'text-emerald-950'}`}>
              {safeFormatUSD(kpis.p2Monto)}
            </div>
            <div className={`text-[11px] mt-0.5 ${pilarFiltro === 'SERVICIO_EJECUTADO' ? 'text-emerald-100' : 'text-emerald-600'}`}>
              {kpis.p2Count.toLocaleString()} con finiquito/RC
            </div>
          </div>
        </div>

        {/* TARJETA 4: PILAR 3 - MATERIALES COMPRADOS SIN RECEPCIÓN */}
        <div
          onClick={() => setPilarFiltro(pilarFiltro === 'MATERIAL_SIN_RECEPCION' ? 'TODOS' : 'MATERIAL_SIN_RECEPCION')}
          className={`rounded-2xl p-4 border transition cursor-pointer flex flex-col justify-between ${
            pilarFiltro === 'MATERIAL_SIN_RECEPCION'
              ? 'bg-amber-600 text-white border-amber-600 shadow-md ring-2 ring-amber-500/30'
              : 'bg-white border-slate-200 hover:border-amber-300'
          }`}
          title="Pilar 3: Órdenes de compra de materiales emitidas en Procura pendientes de ingreso físico a almacén"
        >
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className={pilarFiltro === 'MATERIAL_SIN_RECEPCION' ? 'text-amber-100' : 'text-amber-800 font-bold'}>
              3. Mat. Comprados (Sin RC)
            </span>
            <Clock className={`w-4 h-4 ${pilarFiltro === 'MATERIAL_SIN_RECEPCION' ? 'text-white' : 'text-amber-600'}`} />
          </div>
          <div className="mt-2">
            <div className={`text-lg sm:text-xl font-bold tracking-tight ${pilarFiltro === 'MATERIAL_SIN_RECEPCION' ? 'text-white' : 'text-amber-950'}`}>
              {safeFormatUSD(kpis.p3Monto)}
            </div>
            <div className={`text-[11px] mt-0.5 ${pilarFiltro === 'MATERIAL_SIN_RECEPCION' ? 'text-amber-100' : 'text-amber-700'}`}>
              {kpis.p3Count.toLocaleString()} órdenes pendientes
            </div>
          </div>
        </div>

        {/* TARJETA 5: PILAR 4 - SERVICIOS NO EJECUTADOS (SIN FINIQUITO) */}
        <div
          onClick={() => setPilarFiltro(pilarFiltro === 'SERVICIO_SIN_FINIQUITO' ? 'TODOS' : 'SERVICIO_SIN_FINIQUITO')}
          className={`rounded-2xl p-4 border transition cursor-pointer flex flex-col justify-between ${
            pilarFiltro === 'SERVICIO_SIN_FINIQUITO'
              ? 'bg-rose-600 text-white border-rose-600 shadow-md ring-2 ring-rose-500/30'
              : 'bg-white border-slate-200 hover:border-rose-300'
          }`}
          title="Pilar 4: Órdenes de servicio emitidas en Procura sin finiquito ni recepción formal en SIP"
        >
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className={pilarFiltro === 'SERVICIO_SIN_FINIQUITO' ? 'text-rose-100' : 'text-rose-700 font-bold'}>
              4. Serv. Sin Finiquito
            </span>
            <AlertTriangle className={`w-4 h-4 ${pilarFiltro === 'SERVICIO_SIN_FINIQUITO' ? 'text-white' : 'text-rose-600'}`} />
          </div>
          <div className="mt-2">
            <div className={`text-lg sm:text-xl font-bold tracking-tight ${pilarFiltro === 'SERVICIO_SIN_FINIQUITO' ? 'text-white' : 'text-rose-950'}`}>
              {safeFormatUSD(kpis.p4Monto)}
            </div>
            <div className={`text-[11px] mt-0.5 ${pilarFiltro === 'SERVICIO_SIN_FINIQUITO' ? 'text-rose-100' : 'text-rose-600'}`}>
              {kpis.p4Count.toLocaleString()} por auditar
            </div>
          </div>
        </div>

        {/* TARJETA 6: CONSUMO REAL IMPUTADO A OBRA (P1 + P2) */}
        <div
          className="rounded-2xl p-4 border border-slate-200 bg-slate-50 flex flex-col justify-between"
          title="Consumo físico imputado directamente a cuentas auxiliares (Pilar 1 + Pilar 2)"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>Consumo en Obra (P1+P2)</span>
            <Briefcase className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2">
            <div className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              {safeFormatUSD(kpis.consumoObraMonto)}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {kpis.consumoObraCount.toLocaleString()} entregas reales
            </div>
          </div>
        </div>

      </div>

      {/* 3. BARRA DE FILTROS Y SELECTOR DE PILARES */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">

          {/* Pestañas de Pilares */}
          <div className="flex flex-wrap items-center p-1 bg-slate-100 rounded-xl gap-1">
            <button
              onClick={() => setPilarFiltro('TODOS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                pilarFiltro === 'TODOS' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos ({kpis.totalRegistros.toLocaleString()})
            </button>

            <button
              onClick={() => setPilarFiltro('MATERIAL_DESPACHADO')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                pilarFiltro === 'MATERIAL_DESPACHADO' ? 'bg-blue-600 text-white shadow-xs' : 'text-blue-700 hover:bg-blue-50'
              }`}
            >
              <Boxes className="w-3.5 h-3.5" />
              1. Materiales Despachados ({kpis.p1Count.toLocaleString()})
            </button>

            <button
              onClick={() => setPilarFiltro('SERVICIO_EJECUTADO')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                pilarFiltro === 'SERVICIO_EJECUTADO' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              2. Servicios Ejecutados ({kpis.p2Count.toLocaleString()})
            </button>

            <button
              onClick={() => setPilarFiltro('MATERIAL_SIN_RECEPCION')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                pilarFiltro === 'MATERIAL_SIN_RECEPCION' ? 'bg-amber-600 text-white shadow-xs' : 'text-amber-800 hover:bg-amber-50'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              3. Mat. Comprados Sin RC ({kpis.p3Count.toLocaleString()})
            </button>

            <button
              onClick={() => setPilarFiltro('SERVICIO_SIN_FINIQUITO')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                pilarFiltro === 'SERVICIO_SIN_FINIQUITO' ? 'bg-rose-600 text-white shadow-xs' : 'text-rose-700 hover:bg-rose-50'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              4. Serv. Sin Finiquito ({kpis.p4Count.toLocaleString()})
            </button>
          </div>

          {/* Filtros Dropdown: Tipo Costo + Cuenta Auxiliar */}
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

          </div>

          {/* Buscador Universal */}
          <div className="relative min-w-[260px] lg:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar SC, OC, DP, artículo, persona..."
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

      {/* 4. TABLA AUDITABLE SIP */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">

        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-sm font-semibold text-slate-700">Cargando registros reales desde SIP ({mesSeleccionado})...</p>
            <p className="text-xs text-slate-400">Consolidando vales de almacén, órdenes de procura y compras.</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-center space-y-3">
            <Info className="w-8 h-8 text-slate-400" />
            <p className="text-sm font-bold text-slate-700">No se encontraron registros con los filtros seleccionados</p>
            <p className="text-xs text-slate-400">Intenta cambiar el pilar operativo, la cuenta auxiliar o el término de búsqueda.</p>
          </div>
        ) : (
          <>
            {/* Banner de resumen de la vista actual */}
            <div className="bg-slate-50/90 px-4 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs select-none">
              <div className="flex items-center gap-2 text-slate-700">
                <span className="text-slate-500 font-semibold">Mostrando en tabla:</span>
                <span className="font-bold text-slate-900 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 shadow-2xs">
                  {pilarFiltro === 'TODOS'
                    ? '🌐 Todos los Registros SIP'
                    : pilarFiltro === 'MATERIAL_DESPACHADO'
                    ? '📦 1. Materiales Despachados (Vales DP)'
                    : pilarFiltro === 'SERVICIO_EJECUTADO'
                    ? '💼 2. Servicios Ejecutados (Con RC)'
                    : pilarFiltro === 'MATERIAL_SIN_RECEPCION'
                    ? '⏳ 3. Materiales Comprados Sin Recepción'
                    : '🚨 4. Servicios Pendientes Sin Finiquito'}
                </span>
                <span className="text-slate-400">•</span>
                <span className="font-mono font-bold text-indigo-950 text-sm">
                  {safeFormatUSD(filteredData.reduce((acc, r) => acc + r.totalUSD, 0))}
                </span>
                <span className="text-slate-500">
                  ({filteredData.length.toLocaleString()} movimientos)
                </span>
              </div>

              {(pilarFiltro !== 'TODOS' || tipoCostoFiltro !== 'TODAS' || cuentaFiltro !== 'TODAS' || searchTerm) && (
                <button
                  onClick={() => {
                    setPilarFiltro('TODOS');
                    setTipoCostoFiltro('TODAS');
                    setCuentaFiltro('TODAS');
                    setSearchTerm('');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white hover:bg-slate-100 text-indigo-600 hover:text-indigo-800 font-bold border border-slate-200 shadow-2xs transition cursor-pointer text-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Restablecer Filtros ({kpis.totalRegistros.toLocaleString()} movs • {safeFormatUSD(kpis.totalGeneralUSD)})
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                    <th
                      className="py-3 px-3 cursor-pointer hover:bg-slate-100/70"
                      onClick={() => {
                        if (sortField === 'fecha') setSortAsc(!sortAsc);
                        else { setSortField('fecha'); setSortAsc(false); }
                      }}
                    >
                      <div className="flex items-center gap-1">
                        <span>Fecha</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th className="py-3 px-3">Pilar Operativo</th>
                    <th className="py-3 px-3">Documentos (SC ⇄ OC)</th>
                    <th
                      className="py-3 px-3 cursor-pointer hover:bg-slate-100/70"
                      onClick={() => {
                        if (sortField === 'cuentaAuxiliar') setSortAsc(!sortAsc);
                        else { setSortField('cuentaAuxiliar'); setSortAsc(true); }
                      }}
                    >
                      <div className="flex items-center gap-1">
                        <span>Cuenta Auxiliar</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th className="py-3 px-3">Código</th>
                    <th className="py-3 px-3 min-w-[220px]">Descripción</th>
                    <th className="py-3 px-3 text-right">Cant. Pedida</th>
                    <th className="py-3 px-3 text-right">Cant. Recibida</th>
                    <th className="py-3 px-3 text-right">Precio USD</th>
                    <th
                      className="py-3 px-3 text-right cursor-pointer hover:bg-slate-100/70"
                      onClick={() => {
                        if (sortField === 'totalUSD') setSortAsc(!sortAsc);
                        else { setSortField('totalUSD'); setSortAsc(false); }
                      }}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>Total USD</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th className="py-3 px-3">Proveedor / Almacén</th>
                    <th className="py-3 px-3">Encargado / Solicitante</th>
                    <th className="py-3 px-3 text-center">Estatus Real SIP</th>
                    <th className="py-3 px-3 text-center">Detalle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {paginatedData.map((row, idx) => (
                    <tr
                      key={row.id || idx}
                      className="hover:bg-indigo-50/40 transition-colors"
                    >
                      {/* Fecha */}
                      <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap text-[11px]">
                        {row.fecha || 'S/F'}
                      </td>

                      {/* Pilar Operativo */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {row.pilar === 'MATERIAL_DESPACHADO' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            <Boxes className="w-2.5 h-2.5" /> 1. Despachado
                          </span>
                        ) : row.pilar === 'SERVICIO_EJECUTADO' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-2.5 h-2.5" /> 2. Ejecutado
                          </span>
                        ) : row.pilar === 'MATERIAL_SIN_RECEPCION' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <Clock className="w-2.5 h-2.5" /> 3. Comprado Sin RC
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertTriangle className="w-2.5 h-2.5" /> 4. Sin Finiquito
                          </span>
                        )}
                      </td>

                      {/* Cruce de Documentos: SC cruzada con OC */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-mono font-bold text-slate-900 text-[11px]">
                            {row.ordenCompra || 'S/OC'}
                          </span>
                          {row.solicitud && row.solicitud !== row.ordenCompra && (
                            <span className="text-[10px] font-mono text-slate-400">
                              SC: {row.solicitud}
                            </span>
                          )}
                          {row.tieneRC && row.recepcionRC && !row.recepcionRC.includes('Despachado') && (
                            <span className="text-[9px] font-mono text-emerald-600 font-semibold">
                              RC: {row.recepcionRC}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Cuenta Auxiliar y Proyecto */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="font-bold text-slate-900 font-mono">{row.cuentaAuxiliar}</span>
                        <span className="block text-[10px] text-slate-500 truncate max-w-[160px]" title={row.proyectoNombre}>
                          {row.proyectoNombre}
                        </span>
                      </td>

                      {/* Código */}
                      <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                        {row.codigo}
                      </td>

                      {/* Descripción */}
                      <td className="py-2.5 px-3 text-slate-900">
                        <div className="line-clamp-2 max-w-sm" title={row.descripcion}>
                          {row.descripcion}
                        </div>
                      </td>

                      {/* Cantidad Pedida */}
                      <td className="py-2.5 px-3 text-right font-mono whitespace-nowrap">
                        {safeFormatQuantity(row.cantidadPedida)} <span className="text-slate-400 text-[10px]">{row.unidad}</span>
                      </td>

                      {/* Cantidad Recibida */}
                      <td className="py-2.5 px-3 text-right font-mono whitespace-nowrap">
                        <span className={row.cantidadRecepcionada > 0 ? 'text-emerald-700 font-semibold' : 'text-slate-400'}>
                          {safeFormatQuantity(row.cantidadRecepcionada)}
                        </span> <span className="text-slate-400 text-[10px]">{row.unidad}</span>
                      </td>

                      {/* Precio Unitario */}
                      <td className="py-2.5 px-3 text-right font-mono text-slate-600 whitespace-nowrap">
                        {safeFormatUSD(row.precioUnitario)}
                      </td>

                      {/* Total USD */}
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-indigo-950 whitespace-nowrap">
                        {safeFormatUSD(row.totalUSD)}
                      </td>

                      {/* Proveedor / Almacén */}
                      <td className="py-2.5 px-3 text-slate-600 truncate max-w-[140px]" title={row.proveedorOAlmacen}>
                        {row.proveedorOAlmacen}
                      </td>

                      {/* Solicitante / Encargado */}
                      <td className="py-2.5 px-3 text-slate-600 truncate max-w-[130px]" title={`Solicitante: ${row.solicitante} | Comprador: ${row.comprador}`}>
                        {row.solicitante}
                      </td>

                      {/* Estatus Real SIP */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        {row.pilar === 'MATERIAL_DESPACHADO' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-800 border border-blue-200">
                            Despachado en Obra
                          </span>
                        ) : row.pilar === 'SERVICIO_EJECUTADO' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Finiquitado (Con RC)
                          </span>
                        ) : row.pilar === 'MATERIAL_SIN_RECEPCION' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-900 border border-amber-200">
                            Sin Entrada Almacén
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                            Sin Finiquito SIP
                          </span>
                        )}
                      </td>

                      {/* Detalle */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <button
                          onClick={() => setSelectedRecord(row)}
                          className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-indigo-600 transition cursor-pointer"
                          title="Ver cruce de documentos y justificación completa"
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
            <span>
              Mostrando {filteredData.length === 0 ? 0 : ((currentPage - 1) * pageSize) + 1} a {Math.min(currentPage * pageSize, filteredData.length)} de {filteredData.length.toLocaleString()} registros
            </span>
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

      {/* 5. MODAL DE AUDITORÍA Y CRUCE DE DOCUMENTOS */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 relative animate-in fade-in zoom-in duration-150">

            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    selectedRecord.pilar === 'MATERIAL_DESPACHADO'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : selectedRecord.pilar === 'SERVICIO_EJECUTADO'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : selectedRecord.pilar === 'MATERIAL_SIN_RECEPCION'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    {selectedRecord.pilar === 'MATERIAL_DESPACHADO'
                      ? '1. Material Despachado'
                      : selectedRecord.pilar === 'SERVICIO_EJECUTADO'
                      ? '2. Servicio Ejecutado'
                      : selectedRecord.pilar === 'MATERIAL_SIN_RECEPCION'
                      ? '3. Material Comprado Sin Recepción'
                      : '4. Servicio Sin Finiquito'}
                  </span>
                  <span className="font-mono text-sm font-bold text-slate-900">
                    {selectedRecord.ordenCompra}
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

            {/* Cruce de Documentos SIP */}
            <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                Cruce de Documentos SIP
              </span>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">Solicitud / Pedido (SC/PA):</span>
                  <span className="font-mono font-bold text-slate-900">{selectedRecord.solicitud || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Orden de Compra / Vale (OC/DP):</span>
                  <span className="font-mono font-bold text-slate-900">{selectedRecord.ordenCompra || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Recepción / Finiquito (RC):</span>
                  <span className="font-mono font-bold text-slate-900">{selectedRecord.recepcionRC || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Grid de Datos Técnicos */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Fecha</span>
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
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Código Artículo</span>
                <span className="font-mono font-bold text-slate-800">{selectedRecord.codigo}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Cant. Pedida vs Recibida</span>
                <span className="font-bold text-slate-800">
                  {safeFormatQuantity(selectedRecord.cantidadPedida)} / {safeFormatQuantity(selectedRecord.cantidadRecepcionada)} {selectedRecord.unidad}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Total USD</span>
                <span className="font-bold text-emerald-600 text-sm">{safeFormatUSD(selectedRecord.totalUSD)}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Solicitante en Obra</span>
                <span className="font-bold text-slate-800">{selectedRecord.solicitante}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Comprador Procura</span>
                <span className="font-bold text-slate-800">{selectedRecord.comprador}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Proveedor / Almacén</span>
                <span className="font-bold text-slate-800 truncate block">{selectedRecord.proveedorOAlmacen}</span>
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
