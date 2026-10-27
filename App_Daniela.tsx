import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { 
  Building2, 
  RefreshCw, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  ArrowUpDown, 
  Edit3, 
  FileSpreadsheet, 
  FileText, 
  TrendingUp, 
  Layers, 
  DollarSign, 
  ShoppingBag, 
  Boxes, 
  ChevronRight, 
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Download, 
  AlertCircle,
  HardHat,
  Cpu,
  User,
  Save,
  X,
  Database,
  Calendar,
  PieChart,
  ListFilter,
  Check,
  ArrowRight,
  ArrowRightLeft,
  RotateCcw,
  CheckCircle
} from 'lucide-react';

interface Proyecto {
  codigo: string;
  nombre: string;
  tipoCosto: string;
  cliente: string;
  materialesDirectos?: number;
  servicios?: number;
  totalUSD?: number;
  totalItemsConsumos?: number;
  totalItemsCompras?: number;
}

interface Consumo {
  id: string;
  almacen: string;
  numero: string;
  fecha: string;
  codigo: string;
  descripcion: string;
  cantidad: number;
  unidad: string;
  cuentaAuxiliar: string;
  cuentaAuxiliarOriginal: string;
  esReclasificado: boolean;
  ceco: string;
  solicitante: string;
  motivo: string;
  categoria?: string;
  costoUnitario: number;
  totalUSD: number;
  estatus: string;
}

interface Compra {
  id: string;
  almacen: string;
  solicitudCompra: string;
  ordenCompra: string;
  fechaSolicitud: string;
  fechaOC?: string;
  fechaRecepcion: string;
  recepcion?: string;
  codigo: string;
  descripcion: string;
  motivo?: string;
  categoria?: string;
  cantidadSolicitada: number;
  cantidadOC: number;
  cantidadRecepcionada: number;
  unidad: string;
  cuentaAuxiliar: string;
  cuentaAuxiliarOriginal: string;
  esReclasificado: boolean;
  comprador: string;
  proveedor: string;
  precioUnitario: number;
  totalUSD: number;
  estatusSC: string;
  estatusOC?: string;
  tipo: string;
}

interface Status {
  sipConnected: boolean;
  sipHost: string;
  sipUser: string;
  lastSync: string | null;
  totalConsumos: number;
  totalCompras: number;
  totalProyectos: number;
  totalReclasificaciones: number;
}

interface MasterRow {
  id: number;
  tipo: string;
  almacen: string;
  fecha: string;
  numero: string;
  pedido: string;
  cuenta_aux: string;
  ceco: string;
  codigo: string;
  descripcion: string;
  cantidad: number;
  unidad: string;
  solicitante: string;
  motivo: string;
  ajuste: string;
  categoria: string;
  precio_final: number;
  total_usd: number;
  precio_dolar: number;
  semana: number;
  fecha_hasta: string;
  apellidos_nombres: string;
  cargo: string;
  supervisor: string;
  area_ubicacion: string;
  tarifa: number;
  actividad: string;
  tiempo_total: string;
  equipo: string;
  posesion: string;
  tipo_equipo: string;
  linea_prod_desc: string;
  agrupador_linea: string;
  linea_produccion: string;
  datos_descripcion: string;
  datos_tipo_costo: string;
  datos_tipo_equipo: string;
  datos_codigo_sysman: string;
  datos_zona: string;
  ano: number;
  nombre_mes: string;
  sc: string;
  oc: string;
}

const MESES_LIST = [
  { key: 'todos', label: 'Todos', num: '00', lastDay: 0, nombre: 'Todos' },
  { key: 'enero', label: 'Ene', num: '01', lastDay: 31, nombre: 'Enero' },
  { key: 'febrero', label: 'Feb', num: '02', lastDay: 28, nombre: 'Febrero' },
  { key: 'marzo', label: 'Mar', num: '03', lastDay: 31, nombre: 'Marzo' },
  { key: 'abril', label: 'Abr', num: '04', lastDay: 30, nombre: 'Abril' },
  { key: 'mayo', label: 'May', num: '05', lastDay: 31, nombre: 'Mayo' },
  { key: 'junio', label: 'Jun', num: '06', lastDay: 30, nombre: 'Junio' },
  { key: 'julio', label: 'Jul', num: '07', lastDay: 31, nombre: 'Julio' },
  { key: 'agosto', label: 'Ago', num: '08', lastDay: 31, nombre: 'Agosto' },
  { key: 'septiembre', label: 'Sep', num: '09', lastDay: 30, nombre: 'Septiembre' },
  { key: 'octubre', label: 'Oct', num: '10', lastDay: 31, nombre: 'Octubre' },
  { key: 'noviembre', label: 'Nov', num: '11', lastDay: 30, nombre: 'Noviembre' },
  { key: 'diciembre', label: 'Dic', num: '12', lastDay: 31, nombre: 'Diciembre' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'unificada' | 'matriz' | 'consumos' | 'compras' | 'correcciones' | 'cargas'>('unificada');
  const [status, setStatus] = useState<Status | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Data states
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [consumos, setConsumos] = useState<Consumo[]>([]);
  const [compras, setCompras] = useState<Compra[]>([]);
  const [reclasificaciones, setReclasificaciones] = useState<any[]>([]);
  const [matrizData, setMatrizData] = useState<{
    periodo: string;
    totalMateriales: number;
    totalServicios: number;
    granTotal: number;
    proyectos: Proyecto[];
  } | null>(null);

  // MASTER UNIFICADO STATE
  const [selectedAno, setSelectedAno] = useState<string>('2026');
  const [selectedMes, setSelectedMes] = useState<string>('todos');
  const [fechaDesde, setFechaDesde] = useState<string>('');
  const [fechaHasta, setFechaHasta] = useState<string>('');

  const formatDateDisplay = (isoStr: string) => {
    if (!isoStr) return '';
    const parts = isoStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return isoStr;
  };

  const getRangeDisplay = () => {
    if (fechaDesde && fechaHasta) {
      return `${formatDateDisplay(fechaDesde)} al ${formatDateDisplay(fechaHasta)}`;
    } else if (fechaDesde) {
      return `Desde ${formatDateDisplay(fechaDesde)}`;
    } else if (fechaHasta) {
      return `Hasta ${formatDateDisplay(fechaHasta)}`;
    }
    return '';
  };
  const [selectedCta, setSelectedCta] = useState<string>('TODAS');
  const [selectedTipo, setSelectedTipo] = useState<string>('TODOS');
  const [selectedClasificacion, setSelectedClasificacion] = useState<string>('TODAS');
  const [selectedCategoria, setSelectedCategoria] = useState<string>('TODAS');
  const [inputProyecto, setInputProyecto] = useState<string>('');
  const [showProjectSuggestions, setShowProjectSuggestions] = useState<boolean>(false);
  const [searchMaster, setSearchMaster] = useState<string>('');
  const [pageMaster, setPageMaster] = useState<number>(1);
  const [limitMaster, setLimitMaster] = useState<number>(100);
  const [sortMasterBy, setSortMasterBy] = useState<string>('total_usd');
  const [sortMasterOrder, setSortMasterOrder] = useState<'asc' | 'desc'>('desc');

  const [masterRows, setMasterRows] = useState<MasterRow[]>([]);
  const [masterTotales, setMasterTotales] = useState<{
    total_count: number;
    gran_total: number;
    mat_total: number;
    serv_total: number;
    mdo_total: number;
    hm_total: number;
    ind_total: number;
    ext_total?: number;
    int_total?: number;
    opex_total?: number;
  }>({
    total_count: 0,
    gran_total: 0,
    mat_total: 0,
    serv_total: 0,
    mdo_total: 0,
    hm_total: 0,
    ind_total: 0,
    ext_total: 0,
    int_total: 0,
    opex_total: 0
  });
  const [topCuentas, setTopCuentas] = useState<Array<{ cuenta_aux: string; datos_descripcion: string; total: number; rows: number }>>([]);
  const [catalogFiltros, setCatalogFiltros] = useState<{
    anos: number[];
    meses: Array<{ nombre_mes: string; count: number; total: number }>;
    tipos: string[];
    clasificaciones: string[];
    cuentas: Array<{ cuenta_aux: string; datos_descripcion: string; datos_tipo_costo?: string; count: number; total: number }>;
    categorias?: Array<{ categoria: string; count: number; total: number }>;
  }>({
    anos: [2026, 2025, 2024],
    meses: [],
    tipos: [],
    clasificaciones: [],
    cuentas: [],
    categorias: [],
    categorias_consumos: [],
    categorias_compras: []
  });
  const [isLoadingMaster, setIsLoadingMaster] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Filters for Consumos SIP
  const [searchConsumos, setSearchConsumos] = useState('');
  const [filterMesConsumos, setFilterMesConsumos] = useState('todos');
  const [filterCatConsumos, setFilterCatConsumos] = useState('TODAS');
  const [filterCtaConsumos, setFilterCtaConsumos] = useState('TODAS');
  const [pageConsumos, setPageConsumos] = useState(1);
  const [totalConsumosCount, setTotalConsumosCount] = useState(0);
  const [totalConsumosUSD, setTotalConsumosUSD] = useState(0);
  const [isLoadingConsumos, setIsLoadingConsumos] = useState(false);

  // Filters for Compras y Servicios SIP
  const [searchCompras, setSearchCompras] = useState('');
  const [filterMesCompras, setFilterMesCompras] = useState('todos');
  const [filterCatCompras, setFilterCatCompras] = useState('TODAS');
  const [filterTipoCompras, setFilterTipoCompras] = useState('TODOS');
  const [pageCompras, setPageCompras] = useState(1);
  const [totalComprasCount, setTotalComprasCount] = useState(0);
  const [totalComprasUSD, setTotalComprasUSD] = useState(0);
  const [isLoadingCompras, setIsLoadingCompras] = useState(false);

  const [searchMatriz, setSearchMatriz] = useState('');

  // Módulo de Correcciones States
  const [searchMovimiento, setSearchMovimiento] = useState('');
  const [filtroEstadoCorreccion, setFiltroEstadoCorreccion] = useState<'todos' | 'pendientes' | 'corregidos' | 'consumos' | 'compras'>('todos');
  const [selectedMovimiento, setSelectedMovimiento] = useState<{
    id: string;
    tipo: 'consumo' | 'compra';
    documento: string;
    dp?: string;
    pa?: string;
    sc?: string;
    oc?: string;
    fecha: string;
    codigo: string;
    descripcion: string;
    categoria: string;
    cantidad?: number;
    unidad?: string;
    costoUnitario?: number;
    totalUSD: number;
    cuentaAuxiliar: string;
    cuentaAuxiliarOriginal: string;
    esReclasificado: boolean;
    infoReclasificacion?: any;
    solicitante?: string;
    solicitanteOComprador?: string;
    motivo: string;
  } | null>(null);
  const [correccionNuevaCuenta, setCorreccionNuevaCuenta] = useState('');
  const [correccionNuevoProyecto, setCorreccionNuevoProyecto] = useState('');
  const [correccionMotivo, setCorreccionMotivo] = useState('');
  const [candidateMovimientos, setCandidateMovimientos] = useState<any[]>([]);
  const [isSearchingMovimientos, setIsSearchingMovimientos] = useState(false);
  const [isSavingCorreccion, setIsSavingCorreccion] = useState(false);
  const [correccionMessage, setCorreccionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isCorreccionModalOpen, setIsCorreccionModalOpen] = useState(false);
  const [globalToast, setGlobalToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Initial loads
  useEffect(() => {
    fetchStatus();
    fetchProyectos();
    fetchMatriz();
    fetchCatalogFiltros();
  }, []);

  // Fetch tab-specific data
  useEffect(() => {
    if (activeTab === 'unificada') fetchMasterData();
    if (activeTab === 'consumos') fetchConsumos();
    if (activeTab === 'compras') fetchCompras();
    if (activeTab === 'correcciones') fetchReclasificaciones();
    if (activeTab === 'matriz') fetchMatriz();
  }, [activeTab]);

  // Refetch consumos whenever its filters change
  useEffect(() => {
    if (activeTab === 'consumos') {
      fetchConsumos();
    }
  }, [activeTab, filterMesConsumos, filterCatConsumos, filterCtaConsumos, fechaDesde, fechaHasta, pageConsumos]);

  useEffect(() => {
    if (activeTab !== 'consumos') return;
    const timer = setTimeout(() => {
      fetchConsumos();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchConsumos]);

  // Refetch compras whenever its filters change
  useEffect(() => {
    if (activeTab === 'compras') {
      fetchCompras();
    }
  }, [activeTab, filterMesCompras, filterCatCompras, filterTipoCompras, fechaDesde, fechaHasta, pageCompras]);

  useEffect(() => {
    if (activeTab !== 'compras') return;
    const timer = setTimeout(() => {
      fetchCompras();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchCompras]);

  // Refetch master unificado whenever filters change
  useEffect(() => {
    if (activeTab === 'unificada') {
      fetchMasterData();
    }
  }, [selectedAno, selectedMes, selectedCta, selectedTipo, selectedClasificacion, selectedCategoria, fechaDesde, fechaHasta, sortMasterBy, sortMasterOrder, pageMaster, limitMaster]);

  // Refetch filter catalogs when selected year changes
  useEffect(() => {
    fetchCatalogFiltros(selectedAno);
  }, [selectedAno]);

  // Debounced search for Master Unificado (text and project)
  useEffect(() => {
    if (activeTab !== 'unificada') return;
    const timer = setTimeout(() => {
      fetchMasterData();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchMaster, inputProyecto]);

  const handleSortMaster = (colKey: string) => {
    if (sortMasterBy === colKey) {
      setSortMasterOrder(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      setSortMasterBy(colKey);
      setSortMasterOrder('desc'); // default mayor a menor
    }
    setPageMaster(1);
  };

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/status');
      if (res.ok) setStatus(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCatalogFiltros = async (targetAno?: string) => {
    try {
      const a = targetAno || selectedAno || '2026';
      const res = await fetch(`/api/filtros?ano=${encodeURIComponent(a)}`);
      if (res.ok) {
        const data = await res.json();
        setCatalogFiltros(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMasterData = async () => {
    setIsLoadingMaster(true);
    try {
      const params = new URLSearchParams({
        ano: selectedAno,
        mes: selectedMes,
        cta: selectedCta,
        tipo: selectedTipo,
        clasificacion: selectedClasificacion,
        categoria: selectedCategoria,
        proyecto: inputProyecto,
        search: searchMaster,
        sort_by: sortMasterBy,
        order: sortMasterOrder,
        page: pageMaster.toString(),
        limit: limitMaster.toString()
      });
      if (fechaDesde) params.set('fecha_desde', fechaDesde);
      if (fechaHasta) params.set('fecha_hasta', fechaHasta);
      const res = await fetch(`/api/unificada?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setMasterRows(data.items || []);
        if (data.totales) setMasterTotales(data.totales);
        if (data.top_cuentas) setTopCuentas(data.top_cuentas);
      }
    } catch (e) {
      console.error('Error fetching master unificado:', e);
    } finally {
      setIsLoadingMaster(false);
    }
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams({
        ano: selectedAno,
        mes: selectedMes,
        cta: selectedCta,
        tipo: selectedTipo,
        clasificacion: selectedClasificacion,
        categoria: selectedCategoria,
        proyecto: inputProyecto,
        search: searchMaster,
        sort_by: sortMasterBy,
        order: sortMasterOrder,
        limit: '150000'
      });
      if (fechaDesde) params.set('fecha_desde', fechaDesde);
      if (fechaHasta) params.set('fecha_hasta', fechaHasta);
      const res = await fetch(`/api/unificada/export?${params.toString()}`);
      const data = await res.json();
      const rows = data.items || [];

      if (rows.length === 0) {
        alert('No hay registros con los filtros seleccionados para exportar.');
        return;
      }

      // Map to exact 35 columns matching Daniela's official specification
      const excelData = rows.map((r: MasterRow) => ({
        'Tipo': r.tipo,
        'Almacen': r.almacen,
        'Fecha': r.fecha,
        'Numero': r.numero, // Despacho DP
        'Pedido': r.pedido, // Pedido PA
        'Cuenta-Aux': r.cuenta_aux,
        'Ceco': r.ceco,
        'Codigo': r.codigo,
        'Descripcion': r.descripcion,
        'Cantidad': r.cantidad,
        'Unidad': r.unidad,
        'solicitante': r.solicitante,
        'motivo': r.motivo,
        'Ajuste': r.ajuste,
        'Categoria': r.categoria,
        'Precio Final': r.precio_final,
        'Total USD': r.total_usd,
        'Precio$': r.precio_dolar || r.precio_final,
        'Semana': r.semana,
        'Fecha Hasta': r.fecha_hasta,
        'Cargo': r.cargo,
        'Supervisor': r.supervisor,
        'Area / Ubicación': r.area_ubicacion,
        'Tarifa': r.tarifa,
        'Actividad': r.actividad,
        'Linea de Produccion': r.linea_produccion,
        'Datos.Descripción': r.datos_descripcion,
        'Datos.Tipo Costo': r.datos_tipo_costo,
        'Datos.Tipo de Equipo': r.datos_tipo_equipo,
        'Datos.Codigo Sysman': r.datos_codigo_sysman,
        'Datos.Zona': r.datos_zona,
        'Año': r.ano,
        'Nombre del mes': r.nombre_mes
      }));

      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Unificada');
      const filename = `Master_Unificado_${selectedAno}_${selectedMes}_${selectedCta !== 'TODAS' ? selectedCta : 'TODAS'}.xlsx`;
      XLSX.writeFile(wb, filename);
    } catch (e: any) {
      console.error('Error exportando Excel:', e);
      alert(`Error al generar Excel: ${e.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const fetchProyectos = async () => {
    try {
      const res = await fetch('/api/proyectos');
      if (res.ok) setProyectos(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMatriz = async () => {
    try {
      const res = await fetch('/api/matriz');
      if (res.ok) setMatrizData(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchConsumos = async () => {
    setIsLoadingConsumos(true);
    try {
      const params = new URLSearchParams({
        ano: '2026',
        mes: filterMesConsumos,
        categoria: filterCatConsumos,
        search: searchConsumos,
        cta: filterCtaConsumos,
        page: pageConsumos.toString(),
        limit: '100'
      });
      if (fechaDesde) params.set('fecha_desde', fechaDesde);
      if (fechaHasta) params.set('fecha_hasta', fechaHasta);
      const res = await fetch(`/api/consumos?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setConsumos(data.items || []);
        setTotalConsumosCount(data.totalCount || 0);
        setTotalConsumosUSD(data.totalMontoUSD || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingConsumos(false);
    }
  };

  const fetchCompras = async () => {
    setIsLoadingCompras(true);
    try {
      const params = new URLSearchParams({
        ano: '2026',
        mes: filterMesCompras,
        categoria: filterCatCompras,
        search: searchCompras,
        tipo: filterTipoCompras,
        page: pageCompras.toString(),
        limit: '100'
      });
      if (fechaDesde) params.set('fecha_desde', fechaDesde);
      if (fechaHasta) params.set('fecha_hasta', fechaHasta);
      const res = await fetch(`/api/compras?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCompras(data.items || []);
        setTotalComprasCount(data.totalCount || 0);
        setTotalComprasUSD(data.totalMontoUSD || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingCompras(false);
    }
  };

  const fetchReclasificaciones = async () => {
    try {
      const res = await fetch('/api/reclasificaciones');
      if (res.ok) setReclasificaciones(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const handleSyncSIP = async (mesTarget?: string) => {
    setIsSyncing(true);
    const targetKey = mesTarget || (selectedMes === 'todos' ? 'octubre' : selectedMes);
    const m = MESES_LIST.find(x => x.key === targetKey) || MESES_LIST.find(x => x.key === 'octubre')!;
    const ano = selectedAno !== 'todos' ? selectedAno : '2026';
    const inicio = `01/${m.num}/${ano}`;
    const hasta = `${m.lastDay}/${m.num}/${ano}`;

    setSyncMessage(`Conectando a SIP para corte mensual del ${inicio} al ${hasta} (Cierre al ${m.lastDay} de ${m.nombre})...`);
    try {
      const res = await fetch('/api/sip/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inicio, hasta })
      });
      const data = await res.json();
      if (data.success) {
        setSyncMessage(`✓ Sincronización exitosa con corte al ${hasta}: ${data.consumos.total} consumos y ${data.compras.total} compras registrados.`);
        fetchStatus();
        fetchMatriz();
        if (activeTab === 'consumos') fetchConsumos();
        if (activeTab === 'compras') fetchCompras();
        if (activeTab === 'unificada') fetchMasterData();
      } else {
        setSyncMessage(`Error: ${data.error}`);
      }
    } catch (e: any) {
      setSyncMessage(`Error de red: ${e.message}`);
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncMessage(null), 6000);
    }
  };

  // Buscador de Movimientos para el Módulo de Correcciones (Consulta directa a toda la base de datos sin límite de 50)
  useEffect(() => {
    const q = searchMovimiento.trim();
    if (q.length < 2) {
      setCandidateMovimientos([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingMovimientos(true);
      try {
        const res = await fetch(`/api/correcciones/buscar?q=${encodeURIComponent(q)}&estado=${filtroEstadoCorreccion}`);
        if (res.ok) {
          const data = await res.json();
          setCandidateMovimientos(data);
        }
      } catch (e) {
        console.error('Error buscando movimientos:', e);
      } finally {
        setIsSearchingMovimientos(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [searchMovimiento, filtroEstadoCorreccion]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCorreccionModalOpen && !isSavingCorreccion) {
        setIsCorreccionModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCorreccionModalOpen, isSavingCorreccion]);

  const handleOpenCorreccionFromItem = (item: any, source: 'unificada' | 'consumos' | 'compras') => {
    const rawId = item.id != null ? item.id : `${source}-${item.numero || ''}-${item.codigo || ''}`;
    const mov = {
      id: rawId,
      recordId: item.id != null ? item.id : undefined,
      source,
      tipo: item.tipo || (source === 'consumos' ? 'consumo' : source === 'compras' ? 'compra' : (item.tipo || 'consumo')),
      fecha: item.fecha || '',
      numero: item.numero || item.ordenCompra || item.dp || item.sc || '',
      pedido: item.pedido || item.pa || '',
      dp: item.numero || item.dp || '',
      pa: item.pedido || item.pa || '',
      sc: item.sc || (item.tipo === 'servicio' ? item.numero : '') || '',
      oc: item.oc || item.ordenCompra || '',
      cuentaAuxiliar: item.cuenta_aux || item.cuentaAuxiliar || '',
      cuentaAuxiliarOriginal: item.cuenta_aux || item.cuentaAuxiliar || '',
      codigo: item.codigo || '',
      descripcion: item.descripcion || '',
      cantidad: item.cantidad != null ? item.cantidad : 1,
      unidad: item.unidad || 'UND',
      costoUnitario: item.precio_final || item.costoUnitario || item.precio_dolar || (item.cantidad ? ((item.total_usd ?? item.totalUSD ?? 0) / item.cantidad) : 0),
      totalUSD: item.total_usd != null ? item.total_usd : (item.totalUSD != null ? item.totalUSD : 0),
      solicitante: item.solicitante || item.solicitanteOComprador || item.apellidos_nombres || '',
      solicitanteOComprador: item.solicitante || item.solicitanteOComprador || item.apellidos_nombres || '',
      motivo: item.motivo || '',
      categoria: item.categoria || item.linea_prod_desc || item.tipo || '',
      esReclasificado: !!(item.ajuste && String(item.ajuste).includes('CORREGIDO')) || !!item.esReclasificado,
      infoReclasificacion: item.infoReclasificacion || null
    };

    setSelectedMovimiento(mov);
    setCorreccionNuevaCuenta(mov.esReclasificado ? mov.cuentaAuxiliar : '');
    setCorreccionNuevoProyecto(mov.esReclasificado && mov.infoReclasificacion?.nuevoProyecto ? mov.infoReclasificacion.nuevoProyecto : '');
    setCorreccionMotivo(mov.esReclasificado && mov.infoReclasificacion?.motivo ? mov.infoReclasificacion.motivo : '');
    setCorreccionMessage(null);
    setIsCorreccionModalOpen(true);
  };

  const handleSelectMovimiento = (m: any) => {
    setSelectedMovimiento(m);
    setCorreccionNuevaCuenta(m.esReclasificado ? m.cuentaAuxiliar : '');
    setCorreccionNuevoProyecto(m.esReclasificado && m.infoReclasificacion?.nuevoProyecto ? m.infoReclasificacion.nuevoProyecto : '');
    setCorreccionMotivo(m.esReclasificado && m.infoReclasificacion?.motivo ? m.infoReclasificacion.motivo : '');
    setCorreccionMessage(null);
  };

  const handleAplicarCorreccion = async () => {
    if (!selectedMovimiento || !correccionNuevaCuenta.trim()) {
      alert('Por favor indica la nueva cuenta auxiliar a la que se imputará.');
      return;
    }
    setIsSavingCorreccion(true);
    setCorreccionMessage(null);
    try {
      const res = await fetch('/api/reclasificar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recordId: selectedMovimiento.id,
          nuevaCuenta: correccionNuevaCuenta.trim().toUpperCase(),
          nuevoProyecto: correccionNuevoProyecto.trim(),
          motivo: correccionMotivo.trim() || 'Corrección de imputación contable',
          numero: selectedMovimiento.numero || selectedMovimiento.dp || selectedMovimiento.sc || '',
          codigo: selectedMovimiento.codigo || '',
          usuario: 'drivero'
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const docRef = selectedMovimiento.dp || selectedMovimiento.sc || selectedMovimiento.numero || selectedMovimiento.codigo;
        const successMsg = `✓ Ítem [${docRef}] re-imputado exitosamente a la cuenta ${correccionNuevaCuenta.toUpperCase()}`;

        setGlobalToast({
          type: 'success',
          message: successMsg
        });
        setTimeout(() => setGlobalToast(null), 5000);

        setCorreccionMessage({
          type: 'success',
          text: successMsg
        });

        // Close floating modal
        setIsCorreccionModalOpen(false);

        // Silently refresh current tables without clearing any filters
        fetchMasterData();
        fetchConsumos();
        fetchCompras();
        fetchMatriz();
        fetchReclasificaciones();
        fetchStatus();
        fetchCatalogFiltros();
      } else {
        setCorreccionMessage({ type: 'error', text: data.error || 'Error al guardar la corrección' });
      }
    } catch (e: any) {
      setCorreccionMessage({ type: 'error', text: `Error de red: ${e.message}` });
    } finally {
      setIsSavingCorreccion(false);
    }
  };

  const handleRevertirCorreccion = async (recordId: string) => {
    if (!window.confirm('¿Deseas revertir esta corrección y restaurar la imputación original de SIP?')) return;
    try {
      const res = await fetch('/api/reclasificar/revertir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recordId })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchStatus();
        fetchMatriz();
        fetchConsumos();
        fetchCompras();
        fetchReclasificaciones();
        fetchMasterData();
        fetchCatalogFiltros();
      } else {
        alert(data.error || 'Error al revertir corrección');
      }
    } catch (e: any) {
      alert(`Error de red: ${e.message}`);
    }
  };

  // Filtered consumos & compras for monitoring tabs (ordenados de mayor a menor)
  const filteredConsumos = useMemo(() => {
    return consumos
      .filter(c => {
        const q = searchConsumos.toLowerCase().trim();
        const matchesSearch = !q || 
          c.numero.toLowerCase().includes(q) ||
          c.codigo.toLowerCase().includes(q) ||
          c.descripcion.toLowerCase().includes(q) ||
          (c.cuentaAuxiliar && c.cuentaAuxiliar.toLowerCase().includes(q)) ||
          (c.motivo && c.motivo.toLowerCase().includes(q)) ||
          c.solicitante.toLowerCase().includes(q);
        const matchesCta = filterCtaConsumos === 'TODAS' || c.cuentaAuxiliar.toUpperCase() === filterCtaConsumos.toUpperCase() || c.cuentaAuxiliar.toUpperCase().includes(filterCtaConsumos.toUpperCase());
        return matchesSearch && matchesCta;
      })
      .sort((a, b) => (b.totalUSD || 0) - (a.totalUSD || 0));
  }, [consumos, searchConsumos, filterCtaConsumos]);

  const filteredCompras = useMemo(() => {
    return compras
      .filter(c => {
        const q = searchCompras.toLowerCase().trim();
        const matchesSearch = !q || 
          c.solicitudCompra.toLowerCase().includes(q) ||
          (c.ordenCompra && c.ordenCompra.toLowerCase().includes(q)) ||
          c.codigo.toLowerCase().includes(q) ||
          c.descripcion.toLowerCase().includes(q) ||
          (c.cuentaAuxiliar && c.cuentaAuxiliar.toLowerCase().includes(q)) ||
          (c.motivo && c.motivo.toLowerCase().includes(q)) ||
          c.proveedor.toLowerCase().includes(q);
        const matchesTipo = filterTipoCompras === 'TODOS' || c.tipo === filterTipoCompras;
        return matchesSearch && matchesTipo;
      })
      .sort((a, b) => (b.totalUSD || 0) - (a.totalUSD || 0));
  }, [compras, searchCompras, filterTipoCompras]);

  const filteredProyectosMatriz = useMemo(() => {
    if (!matrizData) return [];
    return matrizData.proyectos.filter(p => 
      !searchMatriz ||
      p.codigo.toLowerCase().includes(searchMatriz.toLowerCase()) ||
      p.nombre.toLowerCase().includes(searchMatriz.toLowerCase()) ||
      (p.cliente && p.cliente.toLowerCase().includes(searchMatriz.toLowerCase()))
    );
  }, [matrizData, searchMatriz]);

  const formatUSD = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);
  };

  const formatNumber = (val: number) => {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(val || 0);
  };

  const totalPagesMaster = Math.ceil((masterTotales.total_count || 0) / limitMaster) || 1;

  // Helper for Tipo de Costo badge color (Light Theme)
  const getTipoBadge = (tipo: string) => {
    switch (tipo) {
      case 'Materiales Directos':
        return 'bg-blue-50 text-blue-700 border border-blue-200 font-medium';
      case 'Servicios':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium';
      case 'Mano de Obra Directa':
      case 'Mano de Obra Directa ECO':
        return 'bg-amber-50 text-amber-800 border border-amber-200 font-medium';
      case 'Horas Maquina':
        return 'bg-purple-50 text-purple-700 border border-purple-200 font-medium';
      case 'Costos Indirectos':
        return 'bg-rose-50 text-rose-700 border border-rose-200 font-medium';
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200 font-medium';
    }
  };

  // Live matching projects when typing in the project search box
  const matchingProyectos = useMemo(() => {
    if (!inputProyecto.trim()) return [];
    const q = inputProyecto.toLowerCase().trim();
    return catalogFiltros.cuentas
      .filter(c => 
        (c.cuenta_aux && c.cuenta_aux.toLowerCase().includes(q)) || 
        (c.datos_descripcion && c.datos_descripcion.toLowerCase().includes(q))
      )
      .slice(0, 10);
  }, [catalogFiltros.cuentas, inputProyecto]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans relative">
      {/* TOAST FLOTANTE GLOBAL */}
      {globalToast && (
        <div className="fixed top-5 right-5 z-50 animate-in fade-in slide-in-from-top-4 duration-200 shadow-2xl rounded-xl overflow-hidden border border-emerald-300 bg-white">
          <div className="flex items-center gap-3 px-4 py-3 bg-emerald-600 text-white">
            <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
            <span className="text-xs font-bold">{globalToast.message}</span>
            <button 
              onClick={() => setGlobalToast(null)}
              className="ml-2 text-white/80 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* MODAL FLOTANTE DE CORRECCIÓN / RECLASIFICACIÓN DIRECTA */}
      {isCorreccionModalOpen && selectedMovimiento && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSavingCorreccion) {
              setIsCorreccionModalOpen(false);
            }
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                  <Edit3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight">Corrección e Imputación Directa de Cuenta</h3>
                  <p className="text-[11px] text-purple-100/90">
                    Modifica la imputación SIP en 1 clic sin perder tus filtros ni cambiar de pestaña
                  </p>
                </div>
              </div>
              <button
                onClick={() => !isSavingCorreccion && setIsCorreccionModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                title="Cerrar ventana"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {correccionMessage && (
                <div className={`p-3 rounded-xl border flex items-center gap-2 ${
                  correccionMessage.type === 'success' 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                  {correccionMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                  <span className="font-semibold text-xs">{correccionMessage.text}</span>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 items-center">
                {/* PANEL IZQUIERDO: IMPUTACIÓN ACTUAL EN SIP */}
                <div className="lg:col-span-5 bg-rose-50/50 border border-rose-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                      Imputación Actual en SIP
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                      Origen
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    {/* 1. Cuenta Actual */}
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Cuenta Auxiliar Imputada:</span>
                      <span className="font-mono text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 inline-block">
                        {selectedMovimiento.cuentaAuxiliar || 'S/A'}
                      </span>
                      {selectedMovimiento.esReclasificado && (
                        <span className="ml-2 text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                          ✓ Ya corregido antes
                        </span>
                      )}
                    </div>

                    {/* 2. Solicitante */}
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Solicitante / Persona:</span>
                      <div className="text-xs font-bold text-slate-900">
                        {selectedMovimiento.solicitante || selectedMovimiento.solicitanteOComprador || 'S/D'}
                      </div>
                    </div>

                    {/* 3. Documento Oficial SIP */}
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Documento Oficial SIP:</span>
                      <div className="font-mono text-xs font-semibold text-slate-800">
                        {selectedMovimiento.tipo === 'consumo' 
                          ? `Despacho (DP): ${selectedMovimiento.dp || selectedMovimiento.numero || '-'}  •  Pedido (PA): ${selectedMovimiento.pa || selectedMovimiento.pedido || '-'}`
                          : `Solicitud / Orden: ${selectedMovimiento.sc || selectedMovimiento.numero || '-'}  •  OC: ${selectedMovimiento.oc || '-'}`}
                        <span className="text-slate-400 font-normal ml-2">({selectedMovimiento.fecha})</span>
                      </div>
                    </div>

                    {/* 4. Código y Descripción Imputada */}
                    <div className="p-2.5 bg-white rounded-lg border border-rose-200 shadow-2xs space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Ítem / Servicio Imputado:</span>
                      <div className="text-xs font-semibold text-slate-900 whitespace-normal break-words leading-snug">
                        <span className="font-mono font-bold text-slate-500 mr-1.5">[{selectedMovimiento.codigo}]</span>
                        {selectedMovimiento.descripcion}
                      </div>
                      {selectedMovimiento.categoria && (
                        <div className="text-[11px] text-slate-500 font-mono">
                          Categoría: {selectedMovimiento.categoria}
                        </div>
                      )}
                    </div>

                    {/* 5. Cantidad, Unidad y Montos */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Cantidad y Unidad:</span>
                        <div className="text-xs font-mono font-bold text-slate-900">
                          {selectedMovimiento.cantidad != null ? selectedMovimiento.cantidad : 1} {selectedMovimiento.unidad || 'UND'}
                        </div>
                      </div>
                      <div className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Precio Unitario ($):</span>
                        <div className="text-xs font-mono font-semibold text-slate-800">
                          {formatUSD(selectedMovimiento.costoUnitario || 0)}
                        </div>
                      </div>
                    </div>

                    {/* 6. Motivo registrado en SIP */}
                    <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 shadow-2xs">
                      <span className="text-[10px] uppercase font-bold text-amber-900 block mb-0.5">Motivo registrado en SIP:</span>
                      <div className="text-xs italic text-amber-950 whitespace-normal break-words leading-relaxed font-sans">
                        "{selectedMovimiento.motivo || 'Sin motivo registrado'}"
                      </div>
                    </div>

                    {/* 7. Monto Total USD */}
                    <div className="pt-2 border-t border-rose-200/80 flex items-center justify-between">
                      <span className="text-slate-700 font-bold text-xs uppercase tracking-wide">Monto Total USD:</span>
                      <span className="font-mono text-base font-black text-rose-950">
                        {formatUSD(selectedMovimiento.totalUSD || 0)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* FLECHA CENTRAL */}
                <div className="lg:col-span-1 flex justify-center py-2 lg:py-0">
                  <div className="w-10 h-10 rounded-full bg-purple-100 border border-purple-300 flex items-center justify-center text-purple-700 shadow-2xs">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>

                {/* PANEL DERECHO: NUEVA IMPUTACIÓN DESTINO */}
                <div className="lg:col-span-5 bg-emerald-50/50 border border-emerald-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ¿A dónde se imputará ahora? (Nueva Cuenta)
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      Destino Contable
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    {/* Selector / Input Nueva Cuenta Auxiliar */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                        Nueva Cuenta Auxiliar SIP: <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="text"
                        list="cuentas-auxiliares-modal-list"
                        placeholder="Escribe o selecciona la cuenta (ej: TTE-C-0706)..."
                        value={correccionNuevaCuenta}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCorreccionNuevaCuenta(val);
                          const found = proyectos.find(p => p.codigo.toUpperCase() === val.trim().toUpperCase());
                          if (found && !correccionNuevoProyecto) {
                            setCorreccionNuevoProyecto(found.nombre);
                          }
                        }}
                        autoFocus
                        className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-emerald-500 shadow-2xs"
                      />
                      <datalist id="cuentas-auxiliares-modal-list">
                        {proyectos.map((p) => (
                          <option key={p.codigo} value={p.codigo}>
                            {p.codigo} - {p.nombre}
                          </option>
                        ))}
                      </datalist>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Puedes seleccionar una existente o escribir directamente la <strong>nueva cuenta auxiliar que creaste en SIP</strong>.
                      </p>
                    </div>

                    {/* Nombre del Proyecto */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                        Nombre / Descripción del Proyecto:
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: Mantenimiento Mayor Planta de Pellas..."
                        value={correccionNuevoProyecto}
                        onChange={(e) => setCorreccionNuevoProyecto(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 shadow-2xs font-sans"
                      />
                    </div>

                    {/* Motivo de la Corrección */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                        Motivo de la Corrección / Justificación:
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: Ítem imputado por error al proyecto anterior, corresponde a..."
                        value={correccionMotivo}
                        onChange={(e) => setCorreccionMotivo(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 shadow-2xs font-sans"
                      />
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-slate-200 text-[11px] text-slate-600 space-y-1">
                      <div className="font-semibold text-slate-800">Impacto inmediato:</div>
                      <div className="text-slate-500">
                        Al confirmar, se re-imputará contablemente este costo a la nueva cuenta en el Master Unificado, Consumos/Compras y la Matriz de Costos, manteniendo intactos todos tus filtros y búsquedas activas.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Registro: <strong className="font-mono text-slate-700">{selectedMovimiento.dp || selectedMovimiento.sc || selectedMovimiento.numero || selectedMovimiento.id}</strong>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsCorreccionModalOpen(false)}
                  disabled={isSavingCorreccion}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAplicarCorreccion}
                  disabled={isSavingCorreccion || !correccionNuevaCuenta.trim()}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  {isSavingCorreccion ? 'Aplicando e Imputando...' : 'Aplicar Corrección e Imputar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* 1. TOP HEADER */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 font-black text-white text-lg tracking-wider">
              TIM
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 tracking-tight">SISTEMA DE GESTIÓN Y AUDITORÍA DE COSTOS</h1>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  TIMACA • 2026
                </span>
              </div>
              <p className="text-xs text-slate-500">Master Unificado • Consulta Rápida en Vivo • Sin congelamientos de Excel</p>
            </div>
          </div>
        </div>

        {/* SIP Live Indicator & Sync Action */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-700">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
            </span>
            <span className="text-slate-600">SIP En Vivo (192.168.10.147):</span>
            <strong className="text-emerald-700 font-semibold">{status?.totalConsumos || 3976} Consumos</strong>
            <span className="text-slate-300">|</span>
            <strong className="text-blue-700 font-semibold">{status?.totalCompras || 1594} Compras</strong>
          </div>

          <button
            onClick={handleSyncSIP}
            disabled={isSyncing}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-xs tracking-wide shadow-md transition-all ${
              isSyncing 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' 
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20 active:scale-95'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Sincronizando SIP...' : 'Sincronizar SIP en Vivo'}
          </button>

          <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 font-bold text-xs">
              DR
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-semibold text-slate-800">Daniela Riveros</div>
              <div className="text-[10px] text-slate-500">Analista de Costos</div>
            </div>
          </div>
        </div>
      </header>

      {/* SYNC NOTIFICATION BANNER */}
      {syncMessage && (
        <div className="bg-blue-50 border-b border-blue-200 px-6 py-2.5 text-xs text-blue-900 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>{syncMessage}</span>
          </div>
          <button onClick={() => setSyncMessage(null)} className="text-blue-600 hover:text-blue-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. SUBNAV TABS */}
      <nav className="bg-white border-b border-slate-200 px-6 flex items-center gap-1 overflow-x-auto shadow-2xs">
        <button
          onClick={() => setActiveTab('unificada')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'unificada'
              ? 'border-blue-600 text-blue-600 bg-blue-50/60 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Database className="w-4 h-4 text-blue-600" />
          Sábana Master Unificado
          <span className="px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-700 text-[10px] font-semibold">
            147.5k filas
          </span>
        </button>

        <button
          onClick={() => setActiveTab('matriz')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'matriz'
              ? 'border-blue-600 text-blue-600 bg-blue-50/60 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-4 h-4" />
          Matriz de Costos por Proyecto
        </button>

        <button
          onClick={() => setActiveTab('consumos')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'consumos'
              ? 'border-blue-600 text-blue-600 bg-blue-50/60 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Boxes className="w-4 h-4" />
          Monitor SIP: Consumos ({status?.totalConsumos || 3976})
        </button>

        <button
          onClick={() => setActiveTab('compras')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'compras'
              ? 'border-blue-600 text-blue-600 bg-blue-50/60 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          Monitor SIP: Compras & Servicios ({status?.totalCompras || 1605})
        </button>

        <button
          onClick={() => setActiveTab('correcciones')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'correcciones'
              ? 'border-blue-600 text-blue-600 bg-blue-50/60 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4 text-purple-600" />
          Correcciones
          {status?.totalReclasificaciones ? (
            <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-purple-100 text-purple-700 font-bold">
              {status.totalReclasificaciones}
            </span>
          ) : null}
        </button>

        <button
          onClick={() => setActiveTab('cargas')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'cargas'
              ? 'border-blue-600 text-blue-600 bg-blue-50/60 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <HardHat className="w-4 h-4" />
          MDO & Horas Máquina (Al Cierre)
        </button>
      </nav>

      {/* 3. MAIN WORKSPACE */}
      <main className="flex-1 p-6 max-w-full w-full mx-auto space-y-6">

        {/* TAB 0: SABANA MASTER UNIFICADO (40 COLUMNAS EXACTAS DE EXCEL + FILTROS DINAMICOS) */}
        {activeTab === 'unificada' && (
          <div className="space-y-5 animate-fadeIn">
            {/* BARRA DE FILTROS PRINCIPAL */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
                    <ListFilter className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      Filtros Multidimensionales del Master Unificado
                    </h2>
                    <p className="text-xs text-slate-500">
                      Filtra por Mes, Proyecto, Tipo de Insumo o Clasificación para recalcular totales al instante
                    </p>
                  </div>
                </div>

                {/* Acciones Rápidas */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedAno('2026');
                      setSelectedMes('todos');
                      setSelectedCta('TODAS');
                      setSelectedTipo('TODOS');
                      setSelectedClasificacion('TODAS');
                      setSelectedCategoria('TODAS');
                      setInputProyecto('');
                      setSearchMaster('');
                      setPageMaster(1);
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all"
                  >
                    Limpiar Filtros
                  </button>

                  <button
                    onClick={handleExportExcel}
                    disabled={isExporting}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all disabled:opacity-50"
                  >
                    <Download className={`w-3.5 h-3.5 ${isExporting ? 'animate-bounce' : ''}`} />
                    {isExporting ? 'Exportando Excel...' : 'Exportar Vista a Excel (.xlsx)'}
                  </button>
                </div>
              </div>

              {/* Controles de Filtro Multidimensional */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                {/* 1. Selector de Año */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    1. Año Contable
                  </label>
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                    {['2026', '2025', '2024', 'todos'].map((ano) => (
                      <button
                        key={ano}
                        onClick={() => {
                          setSelectedAno(ano);
                          setPageMaster(1);
                        }}
                        className={`flex-1 py-1 text-xs font-semibold rounded transition-all capitalize ${
                          selectedAno === ano
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                        }`}
                      >
                        {ano}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Filtro Interactivo de Proyecto (Escribe Cuenta Auxiliar o Nombre) */}
                <div className="relative">
                  <label className="block text-[11px] font-semibold text-emerald-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>2. Proyecto (Cuenta / Nombre)</span>
                    {inputProyecto && (
                      <button
                        onClick={() => {
                          setInputProyecto('');
                          setSelectedCta('TODAS');
                          setPageMaster(1);
                        }}
                        className="text-[10px] text-slate-500 hover:text-slate-800"
                        title="Borrar filtro de proyecto"
                      >
                        Limpiar ×
                      </button>
                    )}
                  </label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Ej: 0706, TTE-C-0671, Pellas..."
                      value={inputProyecto}
                      onFocus={() => setShowProjectSuggestions(true)}
                      onChange={(e) => {
                        setInputProyecto(e.target.value);
                        setSelectedCta('TODAS');
                        setPageMaster(1);
                        setShowProjectSuggestions(true);
                      }}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-7 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-600 font-mono font-medium"
                    />
                    {inputProyecto && (
                      <button
                        onClick={() => {
                          setInputProyecto('');
                          setSelectedCta('TODAS');
                          setPageMaster(1);
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs font-bold"
                      >
                        ×
                      </button>
                    )}
                  </div>

                  {/* Dropdown de Sugerencias de Proyectos al Escribir */}
                  {showProjectSuggestions && matchingProyectos.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-y-auto divide-y divide-slate-100">
                      <div className="p-1.5 bg-slate-50 text-[10px] text-slate-500 font-semibold uppercase flex justify-between items-center border-b border-slate-200">
                        <span>Proyectos coincidentes ({matchingProyectos.length})</span>
                        <button
                          onClick={() => setShowProjectSuggestions(false)}
                          className="hover:text-slate-800 text-slate-400 font-bold"
                        >
                          Cerrar ×
                        </button>
                      </div>
                      {matchingProyectos.map((p) => (
                        <div
                          key={p.cuenta_aux}
                          onClick={() => {
                            setInputProyecto(p.cuenta_aux);
                            setSelectedCta(p.cuenta_aux);
                            setShowProjectSuggestions(false);
                            setPageMaster(1);
                          }}
                          className="p-2 hover:bg-blue-50/70 cursor-pointer transition-colors text-xs flex items-center justify-between"
                        >
                          <div>
                            <div className="font-mono font-bold text-emerald-700 flex items-center gap-2">
                              {p.cuenta_aux}
                              {p.datos_tipo_costo && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] bg-slate-100 text-slate-700 font-sans border border-slate-200">
                                  {p.datos_tipo_costo}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-600 truncate max-w-xs" title={p.datos_descripcion}>
                              {p.datos_descripcion}
                            </div>
                          </div>
                          <span className="font-mono text-xs font-bold text-slate-800 ml-2">
                            {formatUSD(p.total)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3. Selector de Tipo de Insumo (Elemento de Costo) */}
                <div>
                  <label className="block text-[11px] font-semibold text-blue-700 uppercase tracking-wider mb-1">
                    3. Tipo de Insumo (Elemento)
                  </label>
                  <select
                    value={selectedTipo}
                    onChange={(e) => {
                      setSelectedTipo(e.target.value);
                      setPageMaster(1);
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600"
                  >
                    <option value="TODOS">TODOS LOS INSUMOS</option>
                    {catalogFiltros.tipos.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 4. Selector de Clasificación (datos_tipo_costo: Externo, Interno, OPEX) */}
                <div>
                  <label className="block text-[11px] font-semibold text-purple-700 uppercase tracking-wider mb-1">
                    4. Clasificación Proyecto
                  </label>
                  <select
                    value={selectedClasificacion}
                    onChange={(e) => {
                      setSelectedClasificacion(e.target.value);
                      setPageMaster(1);
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-purple-600"
                  >
                    <option value="TODAS">TODAS (EXTERNO/INTERNO/OPEX)</option>
                    {catalogFiltros.clasificaciones.map((cl) => (
                      <option key={cl} value={cl}>
                        {cl}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 5. Selector de Categoría Catálogo (Mecánicos, Eléctricos, Ferretería, etc.) */}
                <div>
                  <label className="block text-[11px] font-semibold text-emerald-700 uppercase tracking-wider mb-1">
                    5. Categoría Catálogo
                  </label>
                  <select
                    value={selectedCategoria}
                    onChange={(e) => {
                      setSelectedCategoria(e.target.value);
                      setPageMaster(1);
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600 truncate"
                  >
                    <option value="TODAS">TODAS LAS CATEGORÍAS</option>
                    {(catalogFiltros.categorias || []).map((cat) => (
                      <option key={cat.categoria} value={cat.categoria}>
                        {cat.categoria} ({cat.count})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 6. Buscador Global */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    6. Buscador General
                  </label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Vale, SC/OC, cédula, trabajador..."
                      value={searchMaster}
                      onChange={(e) => {
                        setSearchMaster(e.target.value);
                        setPageMaster(1);
                      }}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>
              </div>

              {/* Selector de Rango de Fechas con Calendario Desde - Hasta */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 bg-slate-50/80 p-2 rounded-lg border border-slate-200">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5 text-slate-700 font-bold text-xs uppercase tracking-wider">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span>Filtro de Fecha:</span>
                  </div>

                  <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-lg px-2 py-1 shadow-2xs">
                    <span className="text-[11px] font-semibold text-slate-500">Desde:</span>
                    <input
                      type="date"
                      value={fechaDesde}
                      onChange={(e) => {
                        setFechaDesde(e.target.value);
                        setPageMaster(1);
                        setPageConsumos(1);
                        setPageCompras(1);
                      }}
                      className="bg-transparent text-xs text-slate-900 font-semibold focus:outline-none cursor-pointer"
                    />
                    <span className="text-slate-400 font-bold px-1">—</span>
                    <span className="text-[11px] font-semibold text-slate-500">Hasta:</span>
                    <input
                      type="date"
                      value={fechaHasta}
                      onChange={(e) => {
                        setFechaHasta(e.target.value);
                        setPageMaster(1);
                        setPageConsumos(1);
                        setPageCompras(1);
                      }}
                      className="bg-transparent text-xs text-slate-900 font-semibold focus:outline-none cursor-pointer"
                    />
                    {(fechaDesde || fechaHasta) && (
                      <button
                        onClick={() => {
                          setFechaDesde('');
                          setFechaHasta('');
                          setPageMaster(1);
                          setPageConsumos(1);
                          setPageCompras(1);
                        }}
                        title="Limpiar rango de fechas"
                        className="text-slate-400 hover:text-red-600 ml-1 p-0.5 rounded transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Mostrar la fecha que se filtró */}
                {(fechaDesde || fechaHasta) ? (
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-900 border border-blue-300 text-xs font-bold shadow-2xs">
                      <Calendar className="w-3.5 h-3.5 text-blue-700" />
                      Filtrando: {getRangeDisplay()}
                    </span>
                    <button
                      onClick={() => {
                        setFechaDesde('');
                        setFechaHasta('');
                        setPageMaster(1);
                        setPageConsumos(1);
                        setPageCompras(1);
                      }}
                      className="text-xs font-semibold text-red-600 hover:text-red-800 hover:underline flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Limpiar
                    </button>
                  </div>
                ) : (
                  <span className="text-[11px] text-slate-500 italic">
                    Selecciona fechas con el calendario para filtrar por período exacto (días o semanas)
                  </span>
                )}
              </div>

              {/* Selector de Meses en Barra Horizontal de Clic Directo */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]">
                  <span className="font-semibold text-slate-700 uppercase tracking-wider">
                    Selección de Mes de Cierre:
                  </span>
                  {selectedMes !== 'todos' ? (
                    <span className="font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                      Cierre de Mes: 01/{MESES_LIST.find(x => x.key === selectedMes)?.num}/{selectedAno !== 'todos' ? selectedAno : '2026'} al {MESES_LIST.find(x => x.key === selectedMes)?.lastDay}/{MESES_LIST.find(x => x.key === selectedMes)?.num}/{selectedAno !== 'todos' ? selectedAno : '2026'} (Corte al {MESES_LIST.find(x => x.key === selectedMes)?.lastDay} de {MESES_LIST.find(x => x.key === selectedMes)?.nombre})
                    </span>
                  ) : (
                    <span className="text-slate-500 font-medium">
                      Mostrando consolidado acumulado de todos los meses ({selectedAno})
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-lg border border-slate-200">
                  {MESES_LIST.map((m) => {
                    const isSelected = selectedMes === m.key;
                    return (
                      <button
                        key={m.key}
                        onClick={() => {
                          setSelectedMes(m.key);
                          setPageMaster(1);
                        }}
                        className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-xs font-bold'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                        }`}
                      >
                        {m.label} {m.lastDay ? `(al ${m.lastDay})` : ''}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* BARRA DE FILTROS ACTIVOS CON UN CLIC PARA QUITAR */}
              {(inputProyecto || selectedCta !== 'TODAS' || selectedMes !== 'todos' || selectedTipo !== 'TODOS' || selectedClasificacion !== 'TODAS' || selectedCategoria !== 'TODAS' || searchMaster || fechaDesde || fechaHasta) && (
                <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-bold text-slate-700 flex items-center gap-1">
                    <Filter className="w-3.5 h-3.5 text-blue-600" />
                    Filtros aplicados:
                  </span>

                  {(fechaDesde || fechaHasta) && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-900 border border-indigo-300 font-bold">
                      <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                      Fechas: {getRangeDisplay()}
                      <button
                        onClick={() => {
                          setFechaDesde('');
                          setFechaHasta('');
                          setPageMaster(1);
                          setPageConsumos(1);
                          setPageCompras(1);
                        }}
                        className="hover:text-indigo-700 ml-1 font-bold text-sm"
                      >
                        ×
                      </button>
                    </span>
                  )}

                  {(inputProyecto || selectedCta !== 'TODAS') && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300 font-mono font-bold">
                      Proyecto: {inputProyecto || selectedCta}
                      <button
                        onClick={() => {
                          setInputProyecto('');
                          setSelectedCta('TODAS');
                          setPageMaster(1);
                        }}
                        className="hover:text-emerald-700 ml-1 font-bold text-sm"
                      >
                        ×
                      </button>
                    </span>
                  )}

                  {selectedMes !== 'todos' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-100 text-blue-900 border border-blue-300 font-semibold">
                      Mes: {MESES_LIST.find(x => x.key === selectedMes)?.nombre} (al {MESES_LIST.find(x => x.key === selectedMes)?.lastDay})
                      <button
                        onClick={() => {
                          setSelectedMes('todos');
                          setPageMaster(1);
                        }}
                        className="hover:text-blue-700 ml-1 font-bold text-sm"
                      >
                        ×
                      </button>
                    </span>
                  )}

                  {selectedTipo !== 'TODOS' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-300">
                      Insumo: {selectedTipo}
                      <button onClick={() => { setSelectedTipo('TODOS'); setPageMaster(1); }} className="hover:text-slate-900 ml-1 font-bold">×</button>
                    </span>
                  )}

                  {selectedCategoria !== 'TODAS' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-300">
                      Categoría: {selectedCategoria}
                      <button onClick={() => { setSelectedCategoria('TODAS'); setPageMaster(1); }} className="hover:text-slate-900 ml-1 font-bold">×</button>
                    </span>
                  )}

                  {selectedClasificacion !== 'TODAS' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-300">
                      Clasificación: {selectedClasificacion}
                      <button onClick={() => { setSelectedClasificacion('TODAS'); setPageMaster(1); }} className="hover:text-slate-900 ml-1 font-bold">×</button>
                    </span>
                  )}

                  {searchMaster && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-300">
                      Búsqueda: "{searchMaster}"
                      <button onClick={() => { setSearchMaster(''); setPageMaster(1); }} className="hover:text-amber-700 ml-1 font-bold">×</button>
                    </span>
                  )}

                  <button
                    onClick={() => {
                      setInputProyecto('');
                      setSelectedCta('TODAS');
                      setSelectedMes('todos');
                      setSelectedTipo('TODOS');
                      setSelectedClasificacion('TODAS');
                      setSelectedCategoria('TODAS');
                      setSearchMaster('');
                      setPageMaster(1);
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 underline ml-auto font-semibold"
                  >
                    Borrar todos los filtros
                  </button>
                </div>
              )}
            </div>
            {/* DYNAMIC KPI METRICS BANNER (TOTALES CALCULADOS EN TIEMPO REAL) */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2.5">
              {/* Gran Total USD */}
              <div className="col-span-2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white rounded-xl p-4 shadow-md relative overflow-hidden">
                <div className="text-[10px] font-semibold text-blue-100 uppercase tracking-wider">
                  Gran Total Filtrado (USD)
                </div>
                <div className="text-xl lg:text-2xl font-black text-white mt-1">
                  {formatUSD(masterTotales.gran_total)}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-blue-100 mt-1.5 font-mono">
                  <span>{formatNumber(masterTotales.total_count)} filas</span>
                  <span>•</span>
                  <span className="capitalize">{selectedMes} {selectedAno !== 'todos' ? selectedAno : ''}</span>
                </div>
                <div className="absolute right-2 top-2 text-white/10 pointer-events-none">
                  <DollarSign className="w-14 h-14" />
                </div>
              </div>

              {/* Materiales Directos */}
              <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
                <div className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider flex items-center justify-between">
                  <span>Materiales Dir.</span>
                  <Boxes className="w-3.5 h-3.5 text-blue-500" />
                </div>
                <div className="text-sm font-bold text-slate-900 mt-1 font-mono">
                  {formatUSD(masterTotales.mat_total)}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {masterTotales.gran_total > 0 
                    ? `${((masterTotales.mat_total / masterTotales.gran_total) * 100).toFixed(1)}%` 
                    : '0%'}
                </div>
              </div>

              {/* Servicios */}
              <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
                <div className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider flex items-center justify-between">
                  <span>Servicios</span>
                  <ShoppingBag className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <div className="text-sm font-bold text-slate-900 mt-1 font-mono">
                  {formatUSD(masterTotales.serv_total)}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {masterTotales.gran_total > 0 
                    ? `${((masterTotales.serv_total / masterTotales.gran_total) * 100).toFixed(1)}%` 
                    : '0%'}
                </div>
              </div>

              {/* Mano de Obra */}
              <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
                <div className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider flex items-center justify-between">
                  <span>Mano de Obra</span>
                  <HardHat className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <div className="text-sm font-bold text-slate-900 mt-1 font-mono">
                  {formatUSD(masterTotales.mdo_total)}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {masterTotales.gran_total > 0 
                    ? `${((masterTotales.mdo_total / masterTotales.gran_total) * 100).toFixed(1)}%` 
                    : '0%'}
                </div>
              </div>

              {/* Horas Máquina */}
              <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
                <div className="text-[10px] font-semibold text-purple-600 uppercase tracking-wider flex items-center justify-between">
                  <span>Horas Máquina</span>
                  <Cpu className="w-3.5 h-3.5 text-purple-500" />
                </div>
                <div className="text-sm font-bold text-slate-900 mt-1 font-mono">
                  {formatUSD(masterTotales.hm_total)}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {masterTotales.gran_total > 0 
                    ? `${((masterTotales.hm_total / masterTotales.gran_total) * 100).toFixed(1)}%` 
                    : '0%'}
                </div>
              </div>

              {/* Proyectos Externos (datos_tipo_costo) */}
              <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
                <div className="text-[10px] font-semibold text-teal-600 uppercase tracking-wider flex items-center justify-between">
                  <span>Clasif: Externo</span>
                  <Building2 className="w-3.5 h-3.5 text-teal-500" />
                </div>
                <div className="text-sm font-bold text-teal-800 mt-1 font-mono">
                  {formatUSD(masterTotales.ext_total || 0)}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {masterTotales.gran_total > 0 
                    ? `${(((masterTotales.ext_total || 0) / masterTotales.gran_total) * 100).toFixed(1)}%` 
                    : '0%'}
                </div>
              </div>

              {/* Interno & OPEX */}
              <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
                <div className="text-[10px] font-semibold text-rose-600 uppercase tracking-wider flex items-center justify-between">
                  <span>Interno / OPEX</span>
                  <PieChart className="w-3.5 h-3.5 text-rose-500" />
                </div>
                <div className="text-sm font-bold text-rose-800 mt-1 font-mono">
                  {formatUSD((masterTotales.int_total || 0) + (masterTotales.opex_total || 0))}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Flota + Planta + Admon
                </div>
              </div>
            </div>

            {/* TOP CUENTAS EN ESTE FILTRO */}
            {topCuentas.length > 0 && selectedCta === 'TODAS' && (
              <div className="flex flex-wrap items-center gap-2 bg-white border border-slate-200 p-3 rounded-xl text-xs shadow-xs">
                <span className="text-slate-600 font-semibold flex items-center gap-1.5 pl-1">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                  Top Proyectos en esta vista:
                </span>
                {topCuentas.map((tc) => (
                  <button
                    key={tc.cuenta_aux}
                    onClick={() => {
                      setSelectedCta(tc.cuenta_aux);
                      setInputProyecto(tc.cuenta_aux);
                      setPageMaster(1);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 transition-all flex items-center gap-1.5 font-mono text-[11px]"
                  >
                    <strong className="text-blue-700">{tc.cuenta_aux}</strong>
                    <span className="text-emerald-700 font-bold">{formatUSD(tc.total)}</span>
                    <span className="text-[10px] text-slate-400">({tc.rows})</span>
                  </button>
                ))}
              </div>
            )}
            {/* TABLA PRINCIPAL DEL MASTER UNIFICADO (40 COLUMNAS EXACTAS DE EXCEL) */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col">
              {/* Barra superior de la tabla */}
              <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    Sábana Unificada (Formato Oficial)
                  </span>
                  <span className="text-xs text-slate-500">
                    • Mostrando filas {((pageMaster - 1) * limitMaster) + 1} a {Math.min(pageMaster * limitMaster, masterTotales.total_count)} de {formatNumber(masterTotales.total_count)}
                  </span>
                  {isLoadingMaster && (
                    <span className="flex items-center gap-1 text-[11px] text-blue-600 ml-2 animate-pulse">
                      <RefreshCw className="w-3 h-3 animate-spin" /> Cargando...
                    </span>
                  )}
                </div>

                {/* Controles de Paginación */}
                <div className="flex items-center gap-3 text-xs w-full sm:w-auto justify-between sm:justify-end">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 text-[11px]">Filas/pág:</span>
                    <select
                      value={limitMaster}
                      onChange={(e) => {
                        setLimitMaster(parseInt(e.target.value));
                        setPageMaster(1);
                      }}
                      className="bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800"
                    >
                      <option value="50">50</option>
                      <option value="100">100</option>
                      <option value="250">250</option>
                      <option value="500">500</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-slate-700 text-[11px]">
                      <ArrowUpDown className="w-3 h-3 text-blue-600" />
                      <span>Ordenado: <strong className="text-blue-700">{sortMasterOrder === 'desc' ? 'Mayor a menor' : 'Menor a mayor'}</strong> ({sortMasterBy.toUpperCase().replace('_', ' ')})</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPageMaster(1)}
                      disabled={pageMaster <= 1 || isLoadingMaster}
                      className="p-1.5 rounded bg-white hover:bg-slate-100 border border-slate-200 disabled:opacity-30 text-slate-700 shadow-2xs"
                      title="Primera página"
                    >
                      <ChevronsLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setPageMaster(p => Math.max(1, p - 1))}
                      disabled={pageMaster <= 1 || isLoadingMaster}
                      className="p-1.5 rounded bg-white hover:bg-slate-100 border border-slate-200 disabled:opacity-30 text-slate-700 shadow-2xs"
                      title="Página anterior"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-2 text-[11px] font-mono text-slate-700 font-semibold">
                      Pág {pageMaster} de {totalPagesMaster}
                    </span>
                    <button
                      onClick={() => setPageMaster(p => Math.min(totalPagesMaster, p + 1))}
                      disabled={pageMaster >= totalPagesMaster || isLoadingMaster}
                      className="p-1.5 rounded bg-white hover:bg-slate-100 border border-slate-200 disabled:opacity-30 text-slate-700 shadow-2xs"
                      title="Página siguiente"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setPageMaster(totalPagesMaster)}
                      disabled={pageMaster >= totalPagesMaster || isLoadingMaster}
                      className="p-1.5 rounded bg-white hover:bg-slate-100 border border-slate-200 disabled:opacity-30 text-slate-700 shadow-2xs"
                      title="Última página"
                    >
                      <ChevronsRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
              {/* Contenedor de la Tabla con Scroll Horizontal y Vertical */}
              <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse font-sans whitespace-nowrap">
                  <thead className="sticky top-0 z-20 bg-slate-100 text-slate-700 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200 shadow-2xs">
                    <tr>
                      <th onClick={() => handleSortMaster('tipo')} className="py-2.5 px-3 border-r border-slate-200 cursor-pointer hover:bg-slate-200 transition-colors select-none">
                        Tipo {sortMasterBy === 'tipo' && (sortMasterOrder === 'desc' ? '↓' : '↑')}
                      </th>
                      <th className="py-2.5 px-3 border-r border-slate-200">Almacén</th>
                      <th onClick={() => handleSortMaster('fecha')} className="py-2.5 px-3 border-r border-slate-200 cursor-pointer hover:bg-slate-200 transition-colors select-none">
                        Fecha {sortMasterBy === 'fecha' && (sortMasterOrder === 'desc' ? '↓' : '↑')}
                      </th>
                      <th onClick={() => handleSortMaster('numero')} className="py-2.5 px-3 border-r border-slate-200 cursor-pointer hover:bg-slate-200 transition-colors select-none" title="Número de Despacho (DP) para consumos, o Solicitud de Compra (SC) para compras/servicios">
                        Número {sortMasterBy === 'numero' && (sortMasterOrder === 'desc' ? '↓' : '↑')}
                      </th>
                      <th onClick={() => handleSortMaster('pedido')} className="py-2.5 px-3 border-r border-slate-200 cursor-pointer hover:bg-slate-200 transition-colors select-none" title="Número de Pedido de Almacén (PA) para consumos, u Orden de Compra (OC) para compras/servicios">
                        Pedido {sortMasterBy === 'pedido' && (sortMasterOrder === 'desc' ? '↓' : '↑')}
                      </th>
                      <th onClick={() => handleSortMaster('cuenta_aux')} className="py-2.5 px-3 border-r border-slate-200 bg-purple-50 text-purple-900 cursor-pointer hover:bg-purple-100 transition-colors select-none" title="Cuenta Auxiliar (Haz clic en cualquier celda para corregir e imputar directamente)">
                        Cuenta-Aux ✎ {sortMasterBy === 'cuenta_aux' && (sortMasterOrder === 'desc' ? '↓' : '↑')}
                      </th>
                      <th className="py-2.5 px-3 border-r border-slate-200">Ceco</th>
                      <th onClick={() => handleSortMaster('codigo')} className="py-2.5 px-3 border-r border-slate-200 cursor-pointer hover:bg-slate-200 transition-colors select-none">
                        Código {sortMasterBy === 'codigo' && (sortMasterOrder === 'desc' ? '↓' : '↑')}
                      </th>
                      <th onClick={() => handleSortMaster('descripcion')} className="py-2.5 px-3 border-r border-slate-200 min-w-[280px] cursor-pointer hover:bg-slate-200 transition-colors select-none">
                        Descripción {sortMasterBy === 'descripcion' && (sortMasterOrder === 'desc' ? '↓' : '↑')}
                      </th>
                      <th onClick={() => handleSortMaster('cantidad')} className="py-2.5 px-3 border-r border-slate-200 text-right cursor-pointer hover:bg-slate-200 transition-colors select-none">
                        Cantidad {sortMasterBy === 'cantidad' && (sortMasterOrder === 'desc' ? '↓' : '↑')}
                      </th>
                      <th className="py-2.5 px-3 border-r border-slate-200">Unidad</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 min-w-[150px]">Solicitante</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 min-w-[280px] bg-amber-50/50 text-amber-950 font-bold">Motivo</th>
                      <th className="py-2.5 px-3 border-r border-slate-200">Ajuste</th>
                      <th onClick={() => handleSortMaster('categoria')} className="py-2.5 px-3 border-r border-slate-200 min-w-[180px] cursor-pointer hover:bg-slate-200 transition-colors select-none">
                        Categoría {sortMasterBy === 'categoria' && (sortMasterOrder === 'desc' ? '↓' : '↑')}
                      </th>
                      <th onClick={() => handleSortMaster('precio_final')} className="py-2.5 px-3 border-r border-slate-200 text-right cursor-pointer hover:bg-slate-200 transition-colors select-none" title="Precio Unitario en USD ($)">
                        Precio Final ($) {sortMasterBy === 'precio_final' && (sortMasterOrder === 'desc' ? '↓' : '↑')}
                      </th>
                      <th onClick={() => handleSortMaster('total_usd')} className="py-2.5 px-3 border-r border-slate-200 text-right font-bold text-slate-900 bg-slate-100 cursor-pointer hover:bg-slate-200 transition-colors select-none">
                        Total USD ($) {sortMasterBy === 'total_usd' ? (sortMasterOrder === 'desc' ? '▼ (Mayor a menor)' : '▲ (Menor a mayor)') : '↕'}
                      </th>
                      <th onClick={() => handleSortMaster('precio_dolar')} className="py-2.5 px-3 border-r border-slate-200 text-right cursor-pointer hover:bg-slate-200 transition-colors select-none" title="Precio Unitario en USD ($)">
                        Precio$ ($) {sortMasterBy === 'precio_dolar' && (sortMasterOrder === 'desc' ? '↓' : '↑')}
                      </th>
                      <th className="py-2.5 px-3 border-r border-slate-200 text-center">Semana</th>
                      <th className="py-2.5 px-3 border-r border-slate-200">Fecha Hasta</th>
                      <th className="py-2.5 px-3 border-r border-slate-200">Cargo</th>
                      <th className="py-2.5 px-3 border-r border-slate-200">Supervisor</th>
                      <th className="py-2.5 px-3 border-r border-slate-200">Área / Ubicación</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 text-right">Tarifa</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 min-w-[150px]">Actividad</th>
                      <th className="py-2.5 px-3 border-r border-slate-200">Línea de Producción</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 min-w-[280px]">Datos.Descripción</th>
                      <th className="py-2.5 px-3 border-r border-slate-200">Datos.Tipo Costo</th>
                      <th className="py-2.5 px-3 border-r border-slate-200">Datos.Tipo de Equipo</th>
                      <th className="py-2.5 px-3 border-r border-slate-200">Datos.Código Sysman</th>
                      <th className="py-2.5 px-3 border-r border-slate-200">Datos.Zona</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 text-center">Año</th>
                      <th className="py-2.5 px-3 text-center">Nombre del Mes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {masterRows.map((r, idx) => (
                      <tr key={r.id || idx} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-2 px-3 border-r border-slate-100 font-sans text-slate-900 font-medium whitespace-nowrap">
                          {r.tipo}
                        </td>
                        <td className="py-2 px-3 text-slate-500 border-r border-slate-100">
                          {r.almacen}
                        </td>
                        <td className="py-2 px-3 text-slate-600 border-r border-slate-100">
                          {r.fecha}
                        </td>
                        <td className="py-2 px-3 text-blue-600 font-bold border-r border-slate-100">
                          {r.numero}
                        </td>
                        <td className="py-2 px-3 text-slate-600 border-r border-slate-100">
                          {r.pedido}
                        </td>
                        <td className="py-2 px-3 border-r border-slate-100">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <button
                              onClick={() => handleOpenCorreccionFromItem(r, 'unificada')}
                              className="group inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 hover:bg-purple-100 border border-purple-200 hover:border-purple-300 text-purple-800 hover:text-purple-900 transition-all font-mono font-bold text-xs cursor-pointer shadow-2xs"
                              title="Clic para corregir / re-imputar esta cuenta auxiliar"
                            >
                              <span>{r.cuenta_aux || 'S/A'}</span>
                              <Edit3 className="w-3 h-3 text-purple-400 group-hover:text-purple-700 transition-colors" />
                            </button>
                            {r.ajuste && r.ajuste.includes('CORREGIDO') && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold border border-emerald-300" title={r.ajuste}>
                                ✓ Corregido
                              </span>
                            )}
                            <button
                              onClick={() => {
                                setSelectedCta(r.cuenta_aux);
                                setInputProyecto(r.cuenta_aux);
                                setPageMaster(1);
                              }}
                              className="text-slate-400 hover:text-slate-700 p-0.5 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                              title="Filtrar tabla por esta cuenta"
                            >
                              <Filter className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                        <td className="py-2 px-3 text-slate-500 border-r border-slate-100">
                          {r.ceco}
                        </td>
                        <td className="py-2 px-3 text-slate-500 border-r border-slate-100">
                          {r.codigo}
                        </td>
                        <td className="py-2 px-3 text-slate-800 border-r border-slate-100 font-sans min-w-[280px] whitespace-normal break-words leading-snug" title={r.descripcion}>
                          {r.descripcion}
                        </td>
                        <td className="py-2 px-3 text-right text-slate-700 border-r border-slate-100">
                          {formatNumber(r.cantidad)}
                        </td>
                        <td className="py-2 px-3 text-slate-500 border-r border-slate-100">
                          {r.unidad}
                        </td>
                        <td className="py-2 px-3 text-slate-700 border-r border-slate-100 font-sans min-w-[150px] whitespace-normal break-words leading-snug" title={r.solicitante}>
                          {r.solicitante}
                        </td>
                        <td className="py-2 px-3 text-slate-800 border-r border-slate-100 font-sans bg-amber-50/20 min-w-[280px] whitespace-normal break-words leading-snug" title={r.motivo}>
                          {r.motivo || <span className="text-slate-400 italic font-mono">-</span>}
                        </td>
                        <td className="py-2 px-3 text-slate-500 border-r border-slate-100">
                          {r.ajuste}
                        </td>
                        <td className="py-2 px-3 border-r border-slate-100 font-sans min-w-[180px] text-slate-800 whitespace-normal">
                          {r.categoria || '-'}
                        </td>
                        <td className="py-2 px-3 text-right text-slate-700 border-r border-slate-100 font-medium">
                          {formatUSD(r.precio_final)}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-slate-900 bg-slate-50/60 border-r border-slate-100">
                          <span className={r.total_usd > 0 ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                            {formatUSD(r.total_usd)}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right text-slate-700 border-r border-slate-100 font-medium">
                          {formatUSD(r.precio_dolar || r.precio_final)}
                        </td>
                        <td className="py-2 px-3 text-center text-slate-500 border-r border-slate-100">
                          {r.semana}
                        </td>
                        <td className="py-2 px-3 text-slate-500 border-r border-slate-100">
                          {r.fecha_hasta}
                        </td>
                        <td className="py-2 px-3 text-slate-600 border-r border-slate-100 font-sans">
                          {r.cargo}
                        </td>
                        <td className="py-2 px-3 text-slate-600 border-r border-slate-100 font-sans">
                          {r.supervisor}
                        </td>
                        <td className="py-2 px-3 text-slate-600 border-r border-slate-100 font-sans">
                          {r.area_ubicacion}
                        </td>
                        <td className="py-2 px-3 text-right text-slate-600 border-r border-slate-100">
                          {r.tarifa ? formatUSD(r.tarifa) : ''}
                        </td>
                        <td className="py-2 px-3 text-slate-600 border-r border-slate-100 font-sans min-w-[150px] whitespace-normal break-words leading-snug" title={r.actividad}>
                          {r.actividad}
                        </td>
                        <td className="py-2 px-3 text-slate-600 border-r border-slate-100 font-sans">
                          {r.linea_produccion}
                        </td>
                        <td className="py-2 px-3 text-slate-800 border-r border-slate-100 font-sans min-w-[280px] whitespace-normal break-words leading-snug" title={r.datos_descripcion}>
                          {r.datos_descripcion}
                        </td>
                        <td className="py-2 px-3 text-slate-600 border-r border-slate-100 font-sans">
                          {r.datos_tipo_costo}
                        </td>
                        <td className="py-2 px-3 text-slate-600 border-r border-slate-100 font-sans">
                          {r.datos_tipo_equipo}
                        </td>
                        <td className="py-2 px-3 text-slate-500 border-r border-slate-100">
                          {r.datos_codigo_sysman}
                        </td>
                        <td className="py-2 px-3 text-slate-500 border-r border-slate-100">
                          {r.datos_zona}
                        </td>
                        <td className="py-2 px-3 text-center text-slate-700 border-r border-slate-100">
                          {r.ano}
                        </td>
                        <td className="py-2 px-3 text-center text-blue-600 font-semibold capitalize">
                          {r.nombre_mes}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Barra inferior de paginación */}
              <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
                <span>
                  Base Unificada SQLite • <strong>{formatNumber(masterTotales.total_count)}</strong> filas coincidentes • Gran Total: <strong className="text-slate-900 font-mono">{formatUSD(masterTotales.gran_total)}</strong>
                </span>

                <div className="flex items-center gap-1 font-mono">
                  <button
                    onClick={() => setPageMaster(1)}
                    disabled={pageMaster <= 1}
                    className="px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-30 transition-colors"
                  >
                    Inicio
                  </button>
                  <button
                    onClick={() => setPageMaster(p => Math.max(1, p - 1))}
                    disabled={pageMaster <= 1}
                    className="px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-30 transition-colors"
                  >
                    Ant
                  </button>
                  <span className="px-2 text-slate-700 font-semibold">
                    {pageMaster} / {totalPagesMaster}
                  </span>
                  <button
                    onClick={() => setPageMaster(p => Math.min(totalPagesMaster, p + 1))}
                    disabled={pageMaster >= totalPagesMaster}
                    className="px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-30 transition-colors"
                  >
                    Sig
                  </button>
                  <button
                    onClick={() => setPageMaster(totalPagesMaster)}
                    disabled={pageMaster >= totalPagesMaster}
                    className="px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-30 transition-colors"
                  >
                    Fin
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: MATRIZ Y CIERRE OCTUBRE */}
        {activeTab === 'matriz' && (
          <div className="space-y-6 animate-fadeIn">
            {/* KPI STATS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs relative overflow-hidden">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gran Total Costos Octubre</div>
                <div className="text-2xl font-black text-slate-900 mt-1 font-mono">{formatUSD(matrizData?.granTotal || 0)}</div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 mt-2 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Sincronizado directo de SIP
                </div>
                <div className="absolute right-3 top-3 text-slate-100">
                  <DollarSign className="w-16 h-16" />
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Materiales Directos (Consumos)</div>
                <div className="text-2xl font-black text-emerald-600 mt-1 font-mono">{formatUSD(matrizData?.totalMateriales || 0)}</div>
                <div className="text-xs text-slate-500 mt-2">{status?.totalConsumos || 3976} vales procesados sin duplicados</div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Servicios & Contratistas</div>
                <div className="text-2xl font-black text-blue-600 mt-1 font-mono">{formatUSD(matrizData?.totalServicios || 0)}</div>
                <div className="text-xs text-slate-500 mt-2">{status?.totalCompras || 1594} órdenes de compra auditadas</div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Proyectos con Movimiento</div>
                <div className="text-2xl font-black text-purple-600 mt-1 font-mono">{matrizData?.proyectos.length || 0}</div>
                <div className="text-xs text-slate-500 mt-2">De {status?.totalProyectos || 1578} cuentas activas en catálogo</div>
              </div>
            </div>

            {/* TABLA MATRIZ DE PROYECTOS */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-600" />
                    Matriz de Costos por Proyecto (Corte 01 al 21 Octubre 2026)
                  </h2>
                  <p className="text-xs text-slate-500">Consolidación automática en dólares sin intervención manual de Excel</p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Buscar por cuenta o cliente..."
                      value={searchMatriz}
                      onChange={(e) => setSearchMatriz(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 uppercase font-semibold border-b border-slate-200 text-[10px] tracking-wider">
                    <tr>
                      <th className="py-2.5 px-4">Cuenta Auxiliar</th>
                      <th className="py-2.5 px-4">Descripción del Proyecto</th>
                      <th className="py-2.5 px-4">Cliente / Tipo</th>
                      <th className="py-2.5 px-4 text-right">Materiales Directos</th>
                      <th className="py-2.5 px-4 text-right">Servicios</th>
                      <th className="py-2.5 px-4 text-right font-bold text-slate-900">Total USD</th>
                      <th className="py-2.5 px-4 text-center">Movimientos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProyectosMatriz.map((p, idx) => (
                      <tr key={p.codigo || idx} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-2.5 px-4 font-mono font-bold text-blue-600">
                          {p.codigo}
                        </td>
                        <td className="py-2.5 px-4 text-slate-800 font-medium min-w-[280px] whitespace-normal break-words leading-snug">
                          {p.nombre}
                        </td>
                        <td className="py-2.5 px-4 text-slate-600 font-sans text-xs">
                          {p.cliente || p.tipoCosto || 'N/A'}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono text-emerald-600">
                          {formatUSD(p.materialesDirectos || 0)}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono text-blue-600">
                          {formatUSD(p.servicios || 0)}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                          {formatUSD(p.totalUSD || 0)}
                        </td>
                        <td className="py-2.5 px-4 text-center text-slate-600 font-mono text-[11px]">
                          <span className="text-emerald-600 font-semibold" title="Consumos">{p.totalItemsConsumos} C</span> + <span className="text-blue-600 font-semibold" title="Compras">{p.totalItemsCompras} O</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MONITOR CONSUMOS SIP (TODOS LOS MESES) */}
        {activeTab === 'consumos' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xs">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-emerald-600" />
                  Salidas de Almacén SIP (Consumos de Materiales)
                </h2>
                <p className="text-xs text-slate-500">Histórico completo de salidas de almacén por mes con extracción directa de SIP</p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                {/* Selector de Mes */}
                <select
                  value={filterMesConsumos}
                  onChange={(e) => {
                    setFilterMesConsumos(e.target.value);
                    setPageConsumos(1);
                  }}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-500"
                >
                  <option value="todos">📅 Todos los Meses</option>
                  <option value="enero">Enero</option>
                  <option value="febrero">Febrero</option>
                  <option value="marzo">Marzo</option>
                  <option value="abril">Abril</option>
                  <option value="mayo">Mayo</option>
                  <option value="junio">Junio</option>
                  <option value="julio">Julio</option>
                  <option value="agosto">Agosto</option>
                  <option value="septiembre">Septiembre</option>
                  <option value="octubre">Octubre</option>
                  <option value="noviembre">Noviembre</option>
                  <option value="diciembre">Diciembre</option>
                </select>

                {/* Filtro Calendario Desde - Hasta */}
                <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs shadow-2xs">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span className="text-[11px] font-semibold text-slate-500">Desde:</span>
                  <input
                    type="date"
                    value={fechaDesde}
                    onChange={(e) => {
                      setFechaDesde(e.target.value);
                      setPageMaster(1);
                      setPageConsumos(1);
                      setPageCompras(1);
                    }}
                    className="bg-transparent text-xs text-slate-900 font-semibold focus:outline-none cursor-pointer"
                  />
                  <span className="text-slate-400 font-bold px-0.5">—</span>
                  <span className="text-[11px] font-semibold text-slate-500">Hasta:</span>
                  <input
                    type="date"
                    value={fechaHasta}
                    onChange={(e) => {
                      setFechaHasta(e.target.value);
                      setPageMaster(1);
                      setPageConsumos(1);
                      setPageCompras(1);
                    }}
                    className="bg-transparent text-xs text-slate-900 font-semibold focus:outline-none cursor-pointer"
                  />
                  {(fechaDesde || fechaHasta) && (
                    <button
                      onClick={() => {
                        setFechaDesde('');
                        setFechaHasta('');
                        setPageMaster(1);
                        setPageConsumos(1);
                        setPageCompras(1);
                      }}
                      title="Limpiar fechas"
                      className="text-slate-400 hover:text-red-600 p-0.5 rounded transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Selector de Categoría */}
                <select
                  value={filterCatConsumos}
                  onChange={(e) => {
                    setFilterCatConsumos(e.target.value);
                    setPageConsumos(1);
                  }}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 max-w-[190px]"
                >
                  <option value="TODAS">🏷️ Todas las Categorías</option>
                  {(catalogFiltros.categorias_consumos || []).map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                {/* Selector de Cuenta */}
                <select
                  value={filterCtaConsumos}
                  onChange={(e) => {
                    setFilterCtaConsumos(e.target.value);
                    setPageConsumos(1);
                  }}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="TODAS">🏛️ Todas las Cuentas</option>
                  <option value="TTE-C-0706">TTE-C-0706 (Pellas)</option>
                  <option value="TTE-C-0693">TTE-C-0693 (PMH Muelle)</option>
                  <option value="TTE-C-0671">TTE-C-0671 (2da Línea PMH)</option>
                  <option value="TTE-C-0678">TTE-C-0678 (Pila HA/HB)</option>
                  <option value="TT-I-C-033">TT-I-C-033 (Contenedores)</option>
                  <option value="TTI-C-0105">TTI-C-0105 (Patio)</option>
                </select>

                {/* Búsqueda General */}
                <div className="relative flex-1 md:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Búsqueda general (DP, PA, código, motivo, solicitante)..."
                    value={searchConsumos}
                    onChange={(e) => {
                      setSearchConsumos(e.target.value);
                      setPageConsumos(1);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Banner de Rango de Fechas Activo en Consumos */}
            {(fechaDesde || fechaHasta) && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs shadow-2xs">
                <div className="flex items-center gap-2 text-emerald-950 font-semibold">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <span>Filtrando salidas de almacén: <strong className="font-bold underline">{getRangeDisplay()}</strong> ({totalConsumosCount} movimientos)</span>
                </div>
                <button
                  onClick={() => {
                    setFechaDesde('');
                    setFechaHasta('');
                    setPageMaster(1);
                    setPageConsumos(1);
                    setPageCompras(1);
                  }}
                  className="text-xs font-bold text-emerald-700 hover:text-red-600 hover:underline flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  Quitar filtro de fecha
                </button>
              </div>
            )}

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-slate-100 text-slate-700 uppercase font-semibold border-b border-slate-200 text-[10px] tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3 border-r border-slate-200">Vale (DP)</th>
                      <th className="py-2.5 px-3 border-r border-slate-200">Pedido (PA)</th>
                      <th className="py-2.5 px-3 border-r border-slate-200">Fecha</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 text-center">Mes</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 bg-purple-50 text-purple-900" title="Haz clic en cualquier cuenta para corregir e imputar directamente">Cuenta Auxiliar ✎</th>
                      <th className="py-2.5 px-3 border-r border-slate-200">Código</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 min-w-[220px]">Descripción</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 min-w-[150px]">Categoría</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 min-w-[280px] max-w-[440px] bg-amber-50/50 text-amber-950 font-bold">Motivo</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 text-right">Cantidad</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 text-right">Costo Unit $</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 text-right font-bold text-slate-900 bg-slate-50">Total USD</th>
                      <th className="py-2.5 px-3 min-w-[140px]">Solicitante</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px]">
                    {isLoadingConsumos ? (
                      <tr>
                        <td colSpan={13} className="py-12 text-center text-slate-400">
                          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-600" />
                          Cargando consumos de almacén...
                        </td>
                      </tr>
                    ) : consumos.length === 0 ? (
                      <tr>
                        <td colSpan={13} className="py-12 text-center text-slate-400 italic">
                          No se encontraron consumos con los filtros seleccionados.
                        </td>
                      </tr>
                    ) : (
                      consumos.map((c) => (
                        <tr key={c.id} className="hover:bg-blue-50/40 transition-colors">
                          <td className="py-2 px-3 font-mono font-bold text-emerald-600 border-r border-slate-100">
                            {c.numero}
                          </td>
                          <td className="py-2 px-3 font-mono text-slate-700 border-r border-slate-100">
                            {c.pedido || '-'}
                          </td>
                          <td className="py-2 px-3 text-slate-600 font-mono text-[11px] border-r border-slate-100">
                            {c.fecha}
                          </td>
                          <td className="py-2 px-3 text-slate-500 font-mono uppercase text-[10px] font-bold text-center border-r border-slate-100">
                            {c.nombre_mes || '-'}
                          </td>
                          <td className="py-2 px-3 border-r border-slate-100">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <button
                                onClick={() => handleOpenCorreccionFromItem(c, 'consumos')}
                                className="group inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 hover:bg-purple-100 border border-purple-200 hover:border-purple-300 text-purple-800 hover:text-purple-900 transition-all font-mono font-bold text-xs cursor-pointer shadow-2xs"
                                title="Clic para corregir / re-imputar esta cuenta auxiliar"
                              >
                                <span>{c.cuentaAuxiliar || 'S/A'}</span>
                                <Edit3 className="w-3 h-3 text-purple-400 group-hover:text-purple-700 transition-colors" />
                              </button>
                              {c.esReclasificado && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold border border-emerald-300" title="Reclasificado">
                                  ✓ Corregido
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-2 px-3 font-mono text-slate-500 text-[11px] border-r border-slate-100">
                            {c.codigo}
                          </td>
                          <td className="py-2 px-3 text-slate-800 min-w-[220px] whitespace-normal break-words leading-snug border-r border-slate-100 font-sans">
                            {c.descripcion}
                          </td>
                          <td className="py-2 px-3 font-sans min-w-[150px] text-slate-800 border-r border-slate-100">
                            {c.categoria || 'Materiales Directos'}
                          </td>
                          <td className="py-2 px-3 text-slate-800 bg-amber-50/20 min-w-[280px] max-w-[440px] whitespace-normal break-words leading-snug border-r border-slate-100 font-sans">
                            {c.motivo || <span className="text-slate-400 italic font-mono">-</span>}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-slate-700 border-r border-slate-100">
                            {c.cantidad} {c.unidad}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-slate-600 border-r border-slate-100">
                            {formatUSD(c.costoUnitario)}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-emerald-600 bg-slate-50/40 border-r border-slate-100">
                            {formatUSD(c.totalUSD)}
                          </td>
                          <td className="py-2 px-3 text-slate-600 text-xs min-w-[140px] whitespace-normal break-words leading-snug">
                            {c.solicitante}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Paginación y Totales */}
              <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="flex items-center gap-3">
                  <span>Página <strong className="text-slate-900">{pageConsumos}</strong> de <strong className="text-slate-900">{Math.max(1, Math.ceil(totalConsumosCount / 100))}</strong> ({totalConsumosCount.toLocaleString()} consumos)</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPageConsumos(p => Math.max(1, p - 1))}
                      disabled={pageConsumos <= 1 || isLoadingConsumos}
                      className="px-2.5 py-1 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 text-slate-700 font-bold"
                    >
                      ← Anterior
                    </button>
                    <button
                      onClick={() => setPageConsumos(p => (p * 100 < totalConsumosCount ? p + 1 : p))}
                      disabled={pageConsumos * 100 >= totalConsumosCount || isLoadingConsumos}
                      className="px-2.5 py-1 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 text-slate-700 font-bold"
                    >
                      Siguiente →
                    </button>
                  </div>
                </div>
                <div className="font-semibold text-emerald-700 font-mono text-xs bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                  Total USD Filtrado: {formatUSD(totalConsumosUSD)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MONITOR COMPRAS Y SERVICIOS SIP (TODOS LOS MESES) */}
        {activeTab === 'compras' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xs">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-blue-600" />
                  Compras y Servicios SIP
                </h2>
                <p className="text-xs text-slate-500">Histórico completo de solicitudes y órdenes de compras/servicios aprobadas por mes</p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                {/* Selector de Mes */}
                <select
                  value={filterMesCompras}
                  onChange={(e) => {
                    setFilterMesCompras(e.target.value);
                    setPageCompras(1);
                  }}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-500"
                >
                  <option value="todos">📅 Todos los Meses</option>
                  <option value="enero">Enero</option>
                  <option value="febrero">Febrero</option>
                  <option value="marzo">Marzo</option>
                  <option value="abril">Abril</option>
                  <option value="mayo">Mayo</option>
                  <option value="junio">Junio</option>
                  <option value="julio">Julio</option>
                  <option value="agosto">Agosto</option>
                  <option value="septiembre">Septiembre</option>
                  <option value="octubre">Octubre</option>
                  <option value="noviembre">Noviembre</option>
                  <option value="diciembre">Diciembre</option>
                </select>

                {/* Filtro Calendario Desde - Hasta */}
                <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs shadow-2xs">
                  <Calendar className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span className="text-[11px] font-semibold text-slate-500">Desde:</span>
                  <input
                    type="date"
                    value={fechaDesde}
                    onChange={(e) => {
                      setFechaDesde(e.target.value);
                      setPageMaster(1);
                      setPageConsumos(1);
                      setPageCompras(1);
                    }}
                    className="bg-transparent text-xs text-slate-900 font-semibold focus:outline-none cursor-pointer"
                  />
                  <span className="text-slate-400 font-bold px-0.5">—</span>
                  <span className="text-[11px] font-semibold text-slate-500">Hasta:</span>
                  <input
                    type="date"
                    value={fechaHasta}
                    onChange={(e) => {
                      setFechaHasta(e.target.value);
                      setPageMaster(1);
                      setPageConsumos(1);
                      setPageCompras(1);
                    }}
                    className="bg-transparent text-xs text-slate-900 font-semibold focus:outline-none cursor-pointer"
                  />
                  {(fechaDesde || fechaHasta) && (
                    <button
                      onClick={() => {
                        setFechaDesde('');
                        setFechaHasta('');
                        setPageMaster(1);
                        setPageConsumos(1);
                        setPageCompras(1);
                      }}
                      title="Limpiar fechas"
                      className="text-slate-400 hover:text-red-600 p-0.5 rounded transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Selector de Categoría */}
                <select
                  value={filterCatCompras}
                  onChange={(e) => {
                    setFilterCatCompras(e.target.value);
                    setPageCompras(1);
                  }}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 max-w-[190px]"
                >
                  <option value="TODAS">🏷️ Todas las Categorías</option>
                  {(catalogFiltros.categorias_compras || ['SERVICIOS']).map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                {/* Selector de Tipo */}
                <select
                  value={filterTipoCompras}
                  onChange={(e) => {
                    setFilterTipoCompras(e.target.value);
                    setPageCompras(1);
                  }}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="TODOS">Todos los Tipos</option>
                  <option value="Servicios">Solo Servicios</option>
                  <option value="Compras / Materiales">Compras / Materiales</option>
                </select>

                {/* Búsqueda General */}
                <div className="relative flex-1 md:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Búsqueda general (SC, OC, código, descripción, motivo, solicitante)..."
                    value={searchCompras}
                    onChange={(e) => {
                      setSearchCompras(e.target.value);
                      setPageCompras(1);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Banner de Rango de Fechas Activo en Compras */}
            {(fechaDesde || fechaHasta) && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs shadow-2xs">
                <div className="flex items-center gap-2 text-blue-950 font-semibold">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>Filtrando compras y servicios: <strong className="font-bold underline">{getRangeDisplay()}</strong> ({totalComprasCount} movimientos)</span>
                </div>
                <button
                  onClick={() => {
                    setFechaDesde('');
                    setFechaHasta('');
                    setPageMaster(1);
                    setPageConsumos(1);
                    setPageCompras(1);
                  }}
                  className="text-xs font-bold text-blue-700 hover:text-red-600 hover:underline flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  Quitar filtro de fecha
                </button>
              </div>
            )}

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-slate-100 text-slate-700 uppercase font-semibold border-b border-slate-200 text-[10px] tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3 border-r border-slate-200">Almacén</th>
                      <th className="py-2.5 px-3 border-r border-slate-200">SC</th>
                      <th className="py-2.5 px-3 border-r border-slate-200">OC</th>
                      <th className="py-2.5 px-3 border-r border-slate-200">Fecha</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 text-center">Mes</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 bg-purple-50 text-purple-900" title="Haz clic en cualquier cuenta para corregir e imputar directamente">Cuenta Auxiliar ✎</th>
                      <th className="py-2.5 px-3 border-r border-slate-200">Código</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 min-w-[220px]">Descripción</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 min-w-[150px]">Categoría</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 min-w-[280px] max-w-[450px] bg-amber-50/50 text-amber-950 font-bold">Motivo</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 text-right">Cantidad</th>
                      <th className="py-2.5 px-3 border-r border-slate-200">Unidad</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 text-right">Precio $</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 text-right font-bold text-slate-900 bg-slate-50">Total USD</th>
                      <th className="py-2.5 px-3 min-w-[160px]">Solicitante / Proveedor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px] font-sans">
                    {isLoadingCompras ? (
                      <tr>
                        <td colSpan={15} className="py-12 text-center text-slate-400">
                          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-600" />
                          Cargando compras y servicios...
                        </td>
                      </tr>
                    ) : compras.length === 0 ? (
                      <tr>
                        <td colSpan={15} className="py-12 text-center text-slate-400 italic">
                          No se encontraron compras ni servicios con los filtros seleccionados.
                        </td>
                      </tr>
                    ) : (
                      compras.map((c) => (
                        <tr key={c.id} className="hover:bg-blue-50/40 transition-colors">
                          <td className="py-2 px-3 text-slate-500 font-mono border-r border-slate-100">
                            {c.almacen}
                          </td>
                          <td className="py-2 px-3 font-mono font-bold text-blue-600 border-r border-slate-100">
                            {c.solicitudCompra || '-'}
                          </td>
                          <td className="py-2 px-3 font-mono font-bold text-slate-800 border-r border-slate-100">
                            {c.ordenCompra || '-'}
                          </td>
                          <td className="py-2 px-3 text-slate-600 font-mono text-[11px] border-r border-slate-100">
                            {c.fechaSolicitud || c.fechaOC || '-'}
                          </td>
                          <td className="py-2 px-3 text-slate-500 font-mono uppercase text-[10px] font-bold text-center border-r border-slate-100">
                            {c.nombre_mes || '-'}
                          </td>
                          <td className="py-2 px-3 border-r border-slate-100">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <button
                                onClick={() => handleOpenCorreccionFromItem(c, 'compras')}
                                className="group inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 hover:bg-purple-100 border border-purple-200 hover:border-purple-300 text-purple-800 hover:text-purple-900 transition-all font-mono font-bold text-xs cursor-pointer shadow-2xs"
                                title="Clic para corregir / re-imputar esta cuenta auxiliar"
                              >
                                <span>{c.cuentaAuxiliar || 'S/A'}</span>
                                <Edit3 className="w-3 h-3 text-purple-400 group-hover:text-purple-700 transition-colors" />
                              </button>
                              {c.esReclasificado && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold border border-emerald-300" title="Reclasificado">
                                  ✓ Corregido
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-2 px-3 font-mono text-slate-500 border-r border-slate-100">
                            {c.codigo}
                          </td>
                          <td className="py-2 px-3 text-slate-800 border-r border-slate-100 font-sans min-w-[220px] whitespace-normal break-words leading-snug" title={c.descripcion}>
                            {c.descripcion}
                          </td>
                          <td className="py-2 px-3 border-r border-slate-100 font-sans min-w-[150px] text-slate-800">
                            {c.categoria || (c.tipo === 'Servicios' ? 'SERVICIOS' : 'Materiales Directos')}
                          </td>
                          <td className="py-2 px-3 text-slate-800 border-r border-slate-100 bg-amber-50/20 min-w-[280px] max-w-[450px] whitespace-normal break-words leading-relaxed text-[12px] font-medium" title={c.motivo || 'Sin motivo'}>
                            {c.motivo || <span className="text-slate-400 italic">Sin motivo registrado</span>}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-slate-700 border-r border-slate-100">
                            {formatNumber(c.cantidadSolicitada || c.cantidadOC || 1)}
                          </td>
                          <td className="py-2 px-3 text-slate-500 border-r border-slate-100">
                            {c.unidad || 'UND'}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-slate-700 border-r border-slate-100">
                            {formatUSD(c.precioUnitario)}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 bg-slate-50/50 border-r border-slate-100">
                            <span className={c.totalUSD > 0 ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                              {formatUSD(c.totalUSD)}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-slate-700 min-w-[160px] whitespace-normal break-words leading-snug" title={c.solicitante || c.proveedor}>
                            {c.solicitante || c.proveedor || c.comprador || '-'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Paginación y Totales Compras */}
              <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="flex items-center gap-3">
                  <span>Página <strong className="text-slate-900">{pageCompras}</strong> de <strong className="text-slate-900">{Math.max(1, Math.ceil(totalComprasCount / 100))}</strong> ({totalComprasCount.toLocaleString()} compras/servicios)</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPageCompras(p => Math.max(1, p - 1))}
                      disabled={pageCompras <= 1 || isLoadingCompras}
                      className="px-2.5 py-1 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 text-slate-700 font-bold"
                    >
                      ← Anterior
                    </button>
                    <button
                      onClick={() => setPageCompras(p => (p * 100 < totalComprasCount ? p + 1 : p))}
                      disabled={pageCompras * 100 >= totalComprasCount || isLoadingCompras}
                      className="px-2.5 py-1 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 text-slate-700 font-bold"
                    >
                      Siguiente →
                    </button>
                  </div>
                </div>
                <div className="font-semibold text-blue-700 font-mono text-xs bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
                  Total USD Filtrado: {formatUSD(totalComprasUSD)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: MÓDULO DE CORRECCIONES CONTABLES (SUSTITUTO OFICIAL DE CORRECCIONES.XLSX) */}
        {activeTab === 'correcciones' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ArrowRightLeft className="w-5 h-5 text-purple-600" />
                  Módulo de Correcciones Contables
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Reemplazo oficial y centralizado de <code className="text-slate-700 font-mono font-semibold">Correcciones.xlsx</code>. Permite re-imputar consumos y servicios/compras a las cuentas auxiliares creadas en SIP con auditoría completa y sincronización en vivo.
                </p>
              </div>

              {status?.totalReclasificaciones ? (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-50 border border-purple-200 text-purple-800 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-purple-600" />
                  <span>{status.totalReclasificaciones} correcciones activas</span>
                </div>
              ) : null}
            </div>

            {/* Notification message */}
            {correccionMessage && (
              <div className={`p-4 rounded-xl border flex items-center justify-between text-xs font-semibold ${
                correccionMessage.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}>
                <div className="flex items-center gap-2">
                  {correccionMessage.type === 'success' ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                  )}
                  <span>{correccionMessage.text}</span>
                </div>
                <button
                  onClick={() => setCorreccionMessage(null)}
                  className="text-slate-400 hover:text-slate-700 font-bold ml-4"
                >
                  ✕
                </button>
              </div>
            )}

            {/* SECCIÓN 1: BUSCADOR DEL MOVIMIENTO A CORREGIR */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <Search className="w-4 h-4 text-blue-600" />
                    1. Buscar Movimiento de SIP a Corregir
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Busca por número de Vale/Despacho (DP...), Pedido (PA...), Solicitud (SC...), Orden de Compra (OC...), código, descripción, motivo o solicitante.
                  </p>
                </div>
                {selectedMovimiento && (
                  <button
                    onClick={() => setSelectedMovimiento(null)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold underline"
                  >
                    Buscar otro movimiento
                  </button>
                )}
              </div>

              {!selectedMovimiento ? (
                <div className="space-y-3">
                  {/* Píldoras de Filtro Rápido por Estado de Corrección */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 pb-0.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mr-1">Ver:</span>
                    <button
                      onClick={() => setFiltroEstadoCorreccion('todos')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        filtroEstadoCorreccion === 'todos'
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Todos
                    </button>
                    <button
                      onClick={() => setFiltroEstadoCorreccion('pendientes')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                        filtroEstadoCorreccion === 'pendientes'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
                      }`}
                    >
                      <span>⏳ Solo Pendientes (Sin corregir)</span>
                    </button>
                    <button
                      onClick={() => setFiltroEstadoCorreccion('corregidos')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                        filtroEstadoCorreccion === 'corregidos'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100'
                      }`}
                    >
                      <span>✓ Solo Ya Corregidos ({reclasificaciones.length})</span>
                    </button>
                    <button
                      onClick={() => setFiltroEstadoCorreccion('consumos')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        filtroEstadoCorreccion === 'consumos'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Solo Consumos (DP / PA)
                    </button>
                    <button
                      onClick={() => setFiltroEstadoCorreccion('compras')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        filtroEstadoCorreccion === 'compras'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Solo Servicios / Compras (SC / OC)
                    </button>
                  </div>

                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Ej: DP0041717, PA43600, SC26724, OC23572, FLETE, CEMENTO, JESUS VALDEZ..."
                      value={searchMovimiento}
                      onChange={(e) => setSearchMovimiento(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs font-mono"
                    />
                  </div>

                  {/* Resultados candidatos */}
                  {candidateMovimientos.length > 0 ? (
                    <div className="border border-slate-200 rounded-xl overflow-hidden max-h-80 overflow-y-auto divide-y divide-slate-100 bg-white shadow-2xs">
                      {candidateMovimientos.map((m) => (
                        <div
                          key={m.id}
                          onClick={() => handleSelectMovimiento(m)}
                          className={`p-3.5 transition-colors cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs ${
                            m.esReclasificado 
                              ? 'bg-emerald-50/30 hover:bg-emerald-50/70 border-l-4 border-l-emerald-500' 
                              : 'hover:bg-blue-50/60 border-l-4 border-l-slate-200'
                          }`}
                        >
                          <div className="space-y-1.5 flex-1">
                            {/* Barra de Tipo y Estado */}
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                m.tipo === 'consumo' ? 'bg-blue-100 text-blue-800' : 'bg-indigo-100 text-indigo-800'
                              }`}>
                                {m.tipo === 'consumo' ? 'Consumo de Almacén' : 'Compra / Servicio'}
                              </span>

                              {m.esReclasificado ? (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 shadow-2xs">
                                  ✓ YA CORREGIDO
                                </span>
                              ) : (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1 shadow-2xs">
                                  ⏳ PENDIENTE
                                </span>
                              )}

                              {/* Identificadores oficiales: DP y PA para consumos, SC y OC para compras */}
                              {m.tipo === 'consumo' ? (
                                <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                  <span>Despacho: <strong className="text-blue-700">{m.dp || '-'}</strong></span>
                                  <span>•</span>
                                  <span>Pedido: <strong className="text-slate-900">{m.pa || '-'}</strong></span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                  <span>SC: <strong className="text-indigo-700">{m.sc || '-'}</strong></span>
                                  <span>•</span>
                                  <span>OC: <strong className="text-indigo-700">{m.oc || '-'}</strong></span>
                                </div>
                              )}

                              <span className="text-slate-400">•</span>
                              <span className="text-slate-500 font-mono text-[11px]">{m.fecha}</span>
                            </div>

                            {/* Persona Solicitante */}
                            <div className="flex flex-wrap items-center gap-2 pt-0.5">
                              <span className="inline-flex items-center gap-1.5 text-xs bg-blue-50 text-blue-900 border border-blue-200 px-2 py-0.5 rounded font-medium">
                                <User className="w-3.5 h-3.5 text-blue-600" />
                                Solicitante: <strong className="font-semibold text-slate-900">{m.solicitante || m.solicitanteOComprador || 'S/D'}</strong>
                              </span>

                              <span className="font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                                Cantidad: <strong className="text-slate-900">{m.cantidad} {m.unidad || 'UND'}</strong>
                              </span>

                              {m.costoUnitario > 0 && (
                                <span className="font-mono text-slate-600 text-[11px] bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                                  Precio Unit: <strong>{formatUSD(m.costoUnitario)}</strong>
                                </span>
                              )}
                            </div>

                            {/* Descripción del ítem */}
                            <div className="font-sans text-slate-900 font-bold text-xs whitespace-normal break-words leading-snug">
                              <span className="text-slate-500 font-mono font-normal mr-2">[{m.codigo}]</span>
                              {m.descripcion}
                            </div>

                            {/* Motivo original de SIP */}
                            {m.motivo && (
                              <div className="text-[11px] text-slate-700 bg-amber-50/70 border border-amber-200/80 rounded px-2.5 py-1.5 font-sans whitespace-normal break-words leading-snug">
                                <strong className="text-amber-900 mr-1.5">Motivo SIP:</strong>
                                <span className="italic">{m.motivo}</span>
                              </div>
                            )}

                            {/* Cuentas contables */}
                            <div className="text-[11px] flex flex-wrap items-center gap-3 pt-0.5">
                              {m.esReclasificado ? (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-emerald-700 font-bold">Imputado actualmente a:</span>
                                  <span className="font-mono font-bold text-emerald-900 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200">{m.cuentaAuxiliar}</span>
                                  <span className="text-slate-400 font-mono line-through text-[10px]">Antes: {m.cuentaAuxiliarOriginal || 'S/A'}</span>
                                  {m.infoReclasificacion?.motivo && (
                                    <span className="text-slate-500 italic text-[10px] ml-1">({m.infoReclasificacion.motivo})</span>
                                  )}
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-slate-500 font-medium">Cuenta actual SIP:</span>
                                  <span className="font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">{m.cuentaAuxiliar}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                            <div className="text-right">
                              <div className="font-mono font-black text-sm text-slate-900">
                                {formatUSD(m.totalUSD)}
                              </div>
                              <div className="text-[10px] text-slate-400">Total USD</div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectMovimiento(m);
                              }}
                              className={`px-3.5 py-1.5 rounded-lg font-bold text-xs transition-all shadow-xs flex items-center gap-1 cursor-pointer ${
                                m.esReclasificado 
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                              }`}
                            >
                              {m.esReclasificado ? '✓ Modificar' : 'Corregir'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : isSearchingMovimientos ? (
                    <div className="p-5 text-center text-blue-600 text-xs bg-blue-50/50 rounded-xl border border-blue-200 flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                      <span>Buscando en toda la base de datos de SIP...</span>
                    </div>
                  ) : searchMovimiento.trim().length >= 2 ? (
                    <div className="p-4 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      No se encontraron consumos ni compras que coincidan con "{searchMovimiento}".
                    </div>
                  ) : (
                    <div className="p-4 text-center text-slate-400 text-xs bg-slate-50/50 rounded-xl border border-slate-100">
                      Escribe el número de Despacho (DP), Pedido (PA), Solicitud (SC), Orden (OC), Descripción o Motivo para encontrar el movimiento.
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {/* SECCIÓN 2: CUADRO COMPARATIVO ANTES VS DESPUÉS */}
            {selectedMovimiento && (
              <div className="bg-white border-2 border-purple-200 rounded-xl p-5 shadow-xs space-y-5 animate-scaleIn">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-purple-900 flex items-center gap-2">
                    <ArrowRightLeft className="w-4 h-4 text-purple-600" />
                    2. Cuadro Comparativo de Imputación (Antes vs Después)
                  </h3>
                  <button
                    onClick={() => setSelectedMovimiento(null)}
                    className="text-xs text-slate-500 hover:text-slate-800"
                  >
                    ✕ Cancelar selección
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 items-center">
                  {/* PANEL IZQUIERDO: IMPUTACIÓN ANTERIOR (ORIGINAL SIP) */}
                  <div className="lg:col-span-5 bg-rose-50/50 border border-rose-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-rose-200/60">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" />
                        ¿Dónde estaba imputada anteriormente? (SIP)
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                        {selectedMovimiento.tipo === 'consumo' ? 'Consumo de Almacén' : 'Compra / Servicio'}
                      </span>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      {/* 1. Cuenta Auxiliar Anterior */}
                      <div className="p-2.5 bg-rose-100/70 rounded-lg border border-rose-300">
                        <span className="text-[10px] uppercase font-bold text-rose-800 block">Cuenta Auxiliar Anterior (SIP):</span>
                        <div className="font-mono text-base font-black text-rose-950 mt-0.5">
                          {selectedMovimiento.esReclasificado 
                            ? selectedMovimiento.cuentaAuxiliarOriginal 
                            : (selectedMovimiento.cuentaAuxiliar || 'SIN-ASIGNAR')}
                        </div>
                        {selectedMovimiento.esReclasificado && (
                          <div className="text-[11px] text-emerald-800 font-medium mt-1 bg-emerald-50 p-1.5 rounded border border-emerald-200">
                            ✓ Este movimiento ya fue corregido a <strong className="font-mono">{selectedMovimiento.cuentaAuxiliar}</strong>. Puedes cambiarle la cuenta nuevamente si lo deseas.
                          </div>
                        )}
                      </div>

                      {/* 2. Persona que realizó la solicitud */}
                      <div className="p-2.5 bg-white rounded-lg border border-rose-200 shadow-2xs">
                        <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1.5 mb-0.5">
                          <User className="w-3.5 h-3.5 text-blue-600" />
                          Persona que hizo la solicitud:
                        </span>
                        <div className="text-xs font-bold text-slate-900">
                          {selectedMovimiento.solicitante || selectedMovimiento.solicitanteOComprador || 'S/D'}
                        </div>
                      </div>

                      {/* 3. Documento Oficial SIP */}
                      <div className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Documento Oficial SIP:</span>
                        <div className="font-mono text-xs font-semibold text-slate-800">
                          {selectedMovimiento.tipo === 'consumo' 
                            ? `Despacho (DP): ${selectedMovimiento.dp || '-'}  •  Pedido (PA): ${selectedMovimiento.pa || '-'}`
                            : `Solicitud (SC): ${selectedMovimiento.sc || '-'}  •  Orden (OC): ${selectedMovimiento.oc || '-'}`}
                          <span className="text-slate-400 font-normal ml-2">(Fecha: {selectedMovimiento.fecha})</span>
                        </div>
                      </div>

                      {/* 4. Código y Descripción Imputada */}
                      <div className="p-2.5 bg-white rounded-lg border border-rose-200 shadow-2xs space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Ítem / Servicio Imputado:</span>
                        <div className="text-xs font-semibold text-slate-900 whitespace-normal break-words leading-snug">
                          <span className="font-mono font-bold text-slate-500 mr-1.5">[{selectedMovimiento.codigo}]</span>
                          {selectedMovimiento.descripcion}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          Categoría: {selectedMovimiento.categoria}
                        </div>
                      </div>

                      {/* 5. Cantidad, Unidad y Montos */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                          <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Cantidad y Unidad:</span>
                          <div className="text-xs font-mono font-bold text-slate-900">
                            {selectedMovimiento.cantidad != null ? selectedMovimiento.cantidad : 1} {selectedMovimiento.unidad || 'UND'}
                          </div>
                        </div>
                        <div className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                          <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Precio Unitario ($):</span>
                          <div className="text-xs font-mono font-semibold text-slate-800">
                            {formatUSD(selectedMovimiento.costoUnitario)}
                          </div>
                        </div>
                      </div>

                      {/* 6. Motivo registrado en SIP */}
                      <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 shadow-2xs">
                        <span className="text-[10px] uppercase font-bold text-amber-900 block mb-0.5">Motivo registrado en SIP:</span>
                        <div className="text-xs italic text-amber-950 whitespace-normal break-words leading-relaxed font-sans">
                          "{selectedMovimiento.motivo || 'Sin motivo registrado'}"
                        </div>
                      </div>

                      {/* 7. Monto Total USD */}
                      <div className="pt-2 border-t border-rose-200/80 flex items-center justify-between">
                        <span className="text-slate-700 font-bold text-xs uppercase tracking-wide">Monto Total USD:</span>
                        <span className="font-mono text-base font-black text-rose-950">
                          {formatUSD(selectedMovimiento.totalUSD)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* FLECHA CENTRAL */}
                  <div className="lg:col-span-1 flex justify-center py-2 lg:py-0">
                    <div className="w-10 h-10 rounded-full bg-purple-100 border border-purple-300 flex items-center justify-center text-purple-700 shadow-2xs">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>

                  {/* PANEL DERECHO: NUEVA IMPUTACIÓN DESTINO */}
                  <div className="lg:col-span-5 bg-emerald-50/50 border border-emerald-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        ¿A dónde se imputará ahora? (Nueva Cuenta)
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        Destino Contable
                      </span>
                    </div>

                    <div className="space-y-3 text-xs">
                      {/* Selector / Input Nueva Cuenta Auxiliar */}
                      <div>
                        <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                          Nueva Cuenta Auxiliar SIP: <span className="text-rose-600">*</span>
                        </label>
                        <input
                          type="text"
                          list="cuentas-auxiliares-list"
                          placeholder="Escribe o selecciona la cuenta (ej: TTE-C-0706)..."
                          value={correccionNuevaCuenta}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCorreccionNuevaCuenta(val);
                            const found = proyectos.find(p => p.codigo.toUpperCase() === val.trim().toUpperCase());
                            if (found && !correccionNuevoProyecto) {
                              setCorreccionNuevoProyecto(found.nombre);
                            }
                          }}
                          className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-emerald-500 shadow-2xs"
                        />
                        <datalist id="cuentas-auxiliares-list">
                          {proyectos.map((p) => (
                            <option key={p.codigo} value={p.codigo}>
                              {p.codigo} - {p.nombre}
                            </option>
                          ))}
                        </datalist>
                        <p className="text-[10px] text-slate-500 mt-1">
                          Puedes seleccionar una cuenta existente o escribir directamente la <strong>nueva cuenta auxiliar que creaste en SIP</strong>.
                        </p>
                      </div>

                      {/* Nombre del Proyecto */}
                      <div>
                        <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                          Nombre / Descripción del Proyecto:
                        </label>
                        <input
                          type="text"
                          placeholder="Ej: Mantenimiento Mayor Planta de Pellas..."
                          value={correccionNuevoProyecto}
                          onChange={(e) => setCorreccionNuevoProyecto(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 shadow-2xs font-sans"
                        />
                      </div>

                      {/* Motivo de la Corrección */}
                      <div>
                        <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                          Motivo de la Corrección / Justificación:
                        </label>
                        <input
                          type="text"
                          placeholder="Ej: Ítem imputado por error al proyecto anterior, corresponde a..."
                          value={correccionMotivo}
                          onChange={(e) => setCorreccionMotivo(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 shadow-2xs font-sans"
                        />
                      </div>

                      {/* Botones de acción */}
                      <div className="pt-2 flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedMovimiento(null)}
                          className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleAplicarCorreccion}
                          disabled={isSavingCorreccion || !correccionNuevaCuenta.trim()}
                          className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          {isSavingCorreccion ? 'Aplicando e Imputando...' : 'Aplicar Corrección e Imputar'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECCIÓN 3: HISTORIAL DE CORRECCIONES REGISTRADAS */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs space-y-0">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                    <Database className="w-4 h-4 text-purple-600" />
                    Historial de Correcciones Registradas ({reclasificaciones.length})
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Auditoría de todas las re-imputaciones aplicadas. Puedes revertir cualquier corrección con el botón "Deshacer".
                  </p>
                </div>
              </div>

              {reclasificaciones.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No hay correcciones registradas todavía. Busca un consumo o compra arriba para realizar tu primera corrección contable.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead className="bg-slate-100 text-slate-700 uppercase font-semibold border-b border-slate-200 text-[10px] tracking-wider">
                      <tr>
                        <th className="py-2.5 px-3 border-r border-slate-200">Fecha y Hora</th>
                        <th className="py-2.5 px-3 border-r border-slate-200">Tipo</th>
                        <th className="py-2.5 px-3 border-r border-slate-200">Documento</th>
                        <th className="py-2.5 px-3 border-r border-slate-200 min-w-[220px]">Descripción del Ítem</th>
                        <th className="py-2.5 px-3 border-r border-slate-200 text-right">Total USD</th>
                        <th className="py-2.5 px-3 border-r border-slate-200 bg-rose-50 text-rose-900 font-bold">Cuenta Anterior (SIP)</th>
                        <th className="py-2.5 px-3 border-r border-slate-200 bg-emerald-50 text-emerald-900 font-bold">Nueva Cuenta Destino</th>
                        <th className="py-2.5 px-3 border-r border-slate-200 min-w-[180px]">Proyecto Destino</th>
                        <th className="py-2.5 px-3 border-r border-slate-200 min-w-[220px]">Motivo del Ajuste</th>
                        <th className="py-2.5 px-3 border-r border-slate-200">Usuario</th>
                        <th className="py-2.5 px-3 text-center">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[11px]">
                      {reclasificaciones.map((r, i) => (
                        <tr key={i} className="hover:bg-blue-50/40 transition-colors">
                          <td className="py-2 px-3 font-mono text-slate-600 text-[11px] border-r border-slate-100">
                            {r.fecha ? new Date(r.fecha).toLocaleString() : '-'}
                          </td>
                          <td className="py-2 px-3 border-r border-slate-100 font-sans">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              r.tipoItem === 'compra' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'
                            }`}>
                              {r.tipoItem === 'compra' ? 'Compra' : 'Consumo'}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-mono font-bold text-slate-800 border-r border-slate-100">
                            {r.documento || r.recordId}
                          </td>
                          <td className="py-2 px-3 text-slate-800 min-w-[220px] whitespace-normal break-words leading-snug border-r border-slate-100 font-sans">
                            {r.descripcion || r.recordId}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-emerald-600 border-r border-slate-100">
                            {r.totalUSD ? formatUSD(r.totalUSD) : '-'}
                          </td>
                          <td className="py-2 px-3 font-mono font-bold text-rose-700 bg-rose-50/30 border-r border-slate-100">
                            {r.cuentaAnterior || 'S/A'}
                          </td>
                          <td className="py-2 px-3 font-mono font-bold text-emerald-700 bg-emerald-50/30 border-r border-slate-100">
                            {r.nuevaCuenta}
                          </td>
                          <td className="py-2 px-3 text-slate-800 min-w-[180px] whitespace-normal break-words leading-snug border-r border-slate-100 font-sans">
                            {r.nuevoProyecto}
                          </td>
                          <td className="py-2 px-3 text-slate-600 italic min-w-[220px] whitespace-normal break-words leading-snug border-r border-slate-100 font-sans">
                            "{r.motivo}"
                          </td>
                          <td className="py-2 px-3 text-purple-700 font-medium border-r border-slate-100">
                            {r.usuario}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <button
                              onClick={() => handleRevertirCorreccion(r.recordId)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-rose-600 hover:text-white text-slate-700 border border-slate-200 text-[11px] transition-all cursor-pointer"
                              title="Revertir corrección y restaurar cuenta original SIP"
                            >
                              <RotateCcw className="w-3 h-3" />
                              Deshacer
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: CARGA DE INSUMOS MDO Y HM (PARA EL CIERRE) */}
        {activeTab === 'cargas' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <HardHat className="w-4 h-4 text-amber-500" />
                Módulo Preparado para Nómina y Horas Máquina (Mes de Octubre)
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Tal como mencionaste, estos insumos se consolidan al finalizar el mes. Cuando RRHH y Operaciones emitan las semanas de octubre, simplemente se cargarán aquí con validación automática anti-duplicados.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card Mano de Obra */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-600" />
                      Mano de Obra Semanal (Proyectos & ECO)
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                      Pendiente Cierre Mes
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Validación automática por cédula y semana para evitar la duplicación que ocurrió en la semana 6.
                  </p>
                </div>

                <div className="mt-6 border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-8 text-center bg-slate-50/80 hover:bg-blue-50/20 transition-all cursor-pointer">
                  <FileSpreadsheet className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                  <div className="text-xs font-semibold text-slate-700">Arrastra aquí la planilla semanal de MDO</div>
                  <div className="text-[11px] text-slate-500 mt-1">Formato .xlsx o .csv • Verificación automática</div>
                </div>
              </div>

              {/* Card Horas Máquina */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-purple-600" />
                      Horas Máquina y Equipos
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                      Pendiente Cierre Mes
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Cruce con tarifario oficial de equipos de taller, grúas y compresores.
                  </p>
                </div>

                <div className="mt-6 border-2 border-dashed border-slate-200 hover:border-purple-400 rounded-xl p-8 text-center bg-slate-50/80 hover:bg-purple-50/20 transition-all cursor-pointer">
                  <FileSpreadsheet className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                  <div className="text-xs font-semibold text-slate-700">Arrastra aquí los partes de Horas Máquina</div>
                  <div className="text-[11px] text-slate-500 mt-1">Cálculo de horómetros automáticos</div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
