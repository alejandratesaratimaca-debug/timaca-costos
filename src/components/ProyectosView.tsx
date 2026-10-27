import React, { useState, useMemo, useEffect } from 'react';
import { formatCurrency, formatNumber } from '../utils/dateHelpers';
import { 
  getSipPeriodoData, 
  getSipEvolutivoMensual, 
  getMacroCategoriaSip, 
  SipCuentaSummary, 
  SipItem, 
  SipPeriodoData,
  MesEvolutivoData,
  CUENTAS_CORTAS_OFICIALES
} from '../services/sipDataService';
import { 
  Briefcase, 
  Layers, 
  Search, 
  Download, 
  CheckCircle2, 
  DollarSign, 
  TrendingUp, 
  Filter, 
  Eye, 
  ArrowLeft, 
  BarChart3, 
  PieChart, 
  CalendarDays, 
  X, 
  Truck, 
  Calendar, 
  ArrowUpDown, 
  ChevronRight, 
  Info,
  Clock,
  HardHat,
  Boxes
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface ProyectosViewProps {
  onVolver?: () => void;
  initialCuentaCodigo?: string;
  initialMesNum?: number;
  initialCategoria?: string;
}

export const ProyectosView: React.FC<ProyectosViewProps> = ({ 
  onVolver,
  initialCuentaCodigo,
  initialMesNum,
  initialCategoria
}) => {
  // Período activo (por defecto Octubre 2026, mes actual en curso en el SIP)
  const [selectedMesNum, setSelectedMesNum] = useState<number>(initialMesNum !== undefined ? initialMesNum : 10);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Cuenta seleccionada (por defecto la primera cuenta activa del período o inicial)
  const [selectedCuentaCodigo, setSelectedCuentaCodigo] = useState<string>(initialCuentaCodigo || 'TTE-C-0671');
  
  // Filtro por categoría dentro del proyecto ('todas' o específica)
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>(initialCategoria || 'todas');
  const [itemSearchTerm, setItemSearchTerm] = useState<string>('');
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [selectedItemModal, setSelectedItemModal] = useState<SipItem | null>(null);

  // Estados de datos SIP en vivo
  const [sipData, setSipData] = useState<SipPeriodoData | null>(null);
  const [evolutivoData, setEvolutivoData] = useState<{
    meses: MesEvolutivoData[];
    totalAnual: number;
    promedioMensual: number;
    mesPico: MesEvolutivoData;
    mayorCategoria: { categoria: string; total: number };
  } | null>(null);
  const [isLoadingSip, setIsLoadingSip] = useState<boolean>(true);
  const [isLoadingEvolutivo, setIsLoadingEvolutivo] = useState<boolean>(false);

  // Cargar datos SIP del período seleccionado
  useEffect(() => {
    let isMounted = true;
    setIsLoadingSip(true);
    getSipPeriodoData(selectedMesNum).then(data => {
      if (isMounted) {
        setSipData(data);
        setIsLoadingSip(false);
      }
    });
    return () => { isMounted = false; };
  }, [selectedMesNum]);

  // Sincronizar cuenta inicial si cambia por navegación externa
  useEffect(() => {
    if (initialCuentaCodigo) {
      setSelectedCuentaCodigo(initialCuentaCodigo);
    }
  }, [initialCuentaCodigo]);

  // Cargar evolución mensual histórica de la cuenta seleccionada
  useEffect(() => {
    let isMounted = true;
    setIsLoadingEvolutivo(true);
    getSipEvolutivoMensual(selectedCuentaCodigo).then(data => {
      if (isMounted) {
        setEvolutivoData(data);
        setIsLoadingEvolutivo(false);
      }
    });
    return () => { isMounted = false; };
  }, [selectedCuentaCodigo]);

  // Lista de cuentas para el ranking lateral
  const cuentasRanking = useMemo(() => {
    if (!sipData) return [];
    const list = sipData.cuentas;
    if (!searchTerm) {
      return [sipData.consolidado, ...list];
    }
    const q = searchTerm.toLowerCase();
    const filtered = list.filter(item => 
      item.codigo.toLowerCase().includes(q) || 
      item.nombre.toLowerCase().includes(q) ||
      item.proyectoCorto.toLowerCase().includes(q) ||
      item.cliente.toLowerCase().includes(q)
    );
    if ('consolidado general timaca todos los proyectos corporativo'.includes(q)) {
      return [sipData.consolidado, ...filtered];
    }
    return filtered;
  }, [sipData, searchTerm]);

  // Cuenta activa actualmente visualizada
  const activeCuenta = useMemo(() => {
    if (cuentasRanking.length === 0) return null;
    const found = cuentasRanking.find(c => c.codigo === selectedCuentaCodigo);
    return found || cuentasRanking[0] || null;
  }, [cuentasRanking, selectedCuentaCodigo]);

  // Categorías de gasto calculadas directamente de las líneas SIP
  const categoriasDesglose = useMemo(() => {
    if (!activeCuenta) return [];
    const totalCuenta = activeCuenta.totalMonto > 0 ? activeCuenta.totalMonto : 1;
    const cats = ['Materiales Directos', 'Servicios', 'Mano de Obra Directa', 'Horas Maquina', 'Costos Indirectos'];
    return cats.map(categoria => {
      const tot = activeCuenta.porCategoria[categoria] || 0;
      const salidasCat = activeCuenta.items.filter(it => getMacroCategoriaSip(it) === categoria);
      return {
        categoria,
        total: tot,
        count: salidasCat.length,
        porcentaje: Math.round((tot / totalCuenta) * 1000) / 10,
        items: salidasCat
      };
    }).sort((a, b) => b.total - a.total);
  }, [activeCuenta]);

  // Líneas de movimientos para la auditoría profunda línea por línea
  const lineasProfundas = useMemo(() => {
    if (!activeCuenta) return [];
    let list = activeCuenta.items;
    if (selectedCategoryFilter !== 'todas') {
      list = list.filter(it => getMacroCategoriaSip(it) === selectedCategoryFilter);
    }
    if (itemSearchTerm) {
      const q = itemSearchTerm.toLowerCase();
      list = list.filter(it => 
        (it.numero && it.numero.toLowerCase().includes(q)) ||
        (it.codigo && it.codigo.toLowerCase().includes(q)) ||
        (it.descripcion && it.descripcion.toLowerCase().includes(q)) ||
        (it.motivo && it.motivo.toLowerCase().includes(q)) ||
        (it.solicitante && it.solicitante.toLowerCase().includes(q)) ||
        (it.almacen && it.almacen.toLowerCase().includes(q))
      );
    }
    return list;
  }, [activeCuenta, selectedCategoryFilter, itemSearchTerm]);

  // Exportar auditoría completa a Excel (.xlsx) desde las líneas SIP reales
  const handleExportProyectos = () => {
    if (!sipData || !activeCuenta) return;
    const wb = XLSX.utils.book_new();

    // Hoja 1: Ranking Cuentas Auxiliares
    const rankingData = cuentasRanking.map((c, idx) => ({
      'Ranking': idx + 1,
      'Cuenta Auxiliar': c.codigo,
      'Proyecto Corto': c.proyectoCorto,
      'Cliente': c.cliente,
      'Nombre Oficial': c.nombre,
      [`Total ${sipData.mesLabel} (USD)`]: c.totalMonto,
      '% Participación': `${c.porcentaje}%`,
      'Total Movimientos SIP': c.salidasCount
    }));
    const wsRanking = XLSX.utils.json_to_sheet(rankingData);
    XLSX.utils.book_append_sheet(wb, wsRanking, 'Ranking Cuentas');

    // Hoja 2: Categorías de la Cuenta Activa
    const catData = categoriasDesglose.map(cd => ({
      'Cuenta Auxiliar': activeCuenta.codigo,
      'Proyecto Corto': activeCuenta.proyectoCorto,
      'Categoría de Costo': cd.categoria,
      'Total Asignado (USD)': cd.total,
      '% en Proyecto': `${cd.porcentaje}%`,
      'N° Registros SIP': cd.count
    }));
    const wsCat = XLSX.utils.json_to_sheet(catData);
    XLSX.utils.book_append_sheet(wb, wsCat, `Categorias_${activeCuenta.codigo.replace(/[^a-zA-Z0-9]/g, '_')}`);

    // Hoja 3: Detalle Línea a Línea Real
    const detData = activeCuenta.items.map((it, idx) => ({
      'N°': idx + 1,
      'Comprobante / Salida': it.numero || `SIP-${it.id}`,
      'Fecha': it.fecha || '-',
      'Código Artículo': it.codigo || '-',
      'Descripción Material / Insumo': it.descripcion || '-',
      'Categoría Macro': getMacroCategoriaSip(it),
      'Cantidad': it.cantidad != null ? Number(it.cantidad) : 1,
      'Unidad': it.unidad || 'UND',
      'Precio Unitario (USD)': it.precio_final || (it.cantidad ? (it.total_usd / it.cantidad) : 0),
      'Total USD': it.total_usd,
      'Solicitante / Origen': it.solicitante || '-',
      'Almacén / Destino': it.almacen || '-',
      'Motivo': it.motivo || '-'
    }));
    const wsDet = XLSX.utils.json_to_sheet(detData);
    XLSX.utils.book_append_sheet(wb, wsDet, `Auditoria_Lineas_${activeCuenta.codigo.replace(/[^a-zA-Z0-9]/g, '_')}`);

    XLSX.writeFile(wb, `TIMACA_Auditoria_SIP_${activeCuenta.codigo}_${sipData.mesNombre}.xlsx`);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* ================= BARRA SUPERIOR DE FILTRO Y CONTROLES ================= */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onVolver && (
            <button
              onClick={onVolver}
              className="flex items-center gap-1.5 font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200/90 px-2.5 py-1.5 rounded-lg transition-colors text-xs shadow-2xs shrink-0 cursor-pointer"
              title="Volver al Tablero Ejecutivo"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver</span>
            </button>
          )}
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-neutral-900 tracking-tight">
                  Cuentas Auxiliares & Proyectos Externos TIMACA
                </h2>
                <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                  SIP EN VIVO
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                Alimentado 100% desde la base de datos SIP · Cuentas maestras, categorías auditadas y detalle por movimiento
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Selector de Cuenta Directo */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-neutral-600">Cuenta:</span>
            <select
              value={selectedCuentaCodigo}
              onChange={(e) => setSelectedCuentaCodigo(e.target.value)}
              className="text-xs font-bold text-neutral-900 bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 max-w-[280px]"
            >
              {cuentasRanking.map((c, idx) => (
                <option key={c.codigo} value={c.codigo}>
                  #{idx + 1} {c.codigo} · {c.proyectoCorto} (${Math.round(c.totalMonto).toLocaleString('de-DE')})
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Período (Todos los meses disponibles en SIP) */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-neutral-600">Período:</span>
            <select
              value={selectedMesNum}
              onChange={(e) => setSelectedMesNum(Number(e.target.value))}
              className="text-xs font-bold text-neutral-900 bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500"
            >
              <option value={10}>Octubre 2026 (En Curso · SIP en Vivo)</option>
              <option value={9}>Septiembre 2026 (Cierre Operativo SIP)</option>
              <option value={8}>Agosto 2026 (Base Oficial SIP)</option>
              <option value={0}>Todo el Año 2026 (Consolidado Ene - Oct SIP)</option>
              <option value={7}>Julio 2026</option>
              <option value={6}>Junio 2026</option>
              <option value={5}>Mayo 2026</option>
              <option value={4}>Abril 2026</option>
              <option value={3}>Marzo 2026</option>
              <option value={2}>Febrero 2026</option>
              <option value={1}>Enero 2026</option>
            </select>
          </div>

          {/* Botón Descargar Excel */}
          <button
            onClick={handleExportProyectos}
            disabled={!activeCuenta}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 rounded-lg hover:bg-emerald-100 transition-colors shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-700" />
            <span>Descargar Auditoría (.xlsx)</span>
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-fade-in font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>¡Descarga completada!</strong> Se ha generado el archivo Excel con las líneas auditadas de <strong>{activeCuenta?.codigo} ({activeCuenta?.proyectoCorto})</strong> desde el SIP.
          </span>
        </div>
      )}

      {/* ================= LAYOUT 2 COLUMNAS: RANKING (IZQUIERDA) vs DETALLE (DERECHA) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* COLUMNA IZQUIERDA: RANKING DE CUENTAS AUXILIARES */}
        <div className="lg:col-span-4 bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5">
            <div>
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block font-mono">
                PILAR FUNDAMENTAL TIMACA
              </span>
              <h3 className="text-xs font-bold text-neutral-900">
                Cuentas Auxiliares (Clientes)
              </h3>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-mono font-bold text-blue-700 block">
                ${Math.round(sipData?.totalMonto || 0).toLocaleString('de-DE')}
              </span>
              <span className="text-[9px] text-neutral-400">
                {sipData?.totalMovimientos || 0} movimientos
              </span>
            </div>
          </div>

          {/* Buscador de cuentas */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar código o proyecto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Lista de cuentas en ranking */}
          <div className="space-y-1.5 max-h-[720px] overflow-y-auto pr-1">
            {isLoadingSip ? (
              <div className="py-12 text-center text-xs text-neutral-500">
                Cargando datos SIP en vivo...
              </div>
            ) : cuentasRanking.length === 0 ? (
              <div className="py-8 text-center text-xs text-neutral-400">
                No se encontraron cuentas para este período
              </div>
            ) : (
              cuentasRanking.map((c, idx) => {
                const isSelected = activeCuenta?.codigo === c.codigo;
                return (
                  <div
                    key={c.codigo}
                    onClick={() => setSelectedCuentaCodigo(c.codigo)}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 shadow-xs ring-1 ring-blue-500/30'
                        : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {c.esConsolidado ? (
                          <span className="text-amber-500 font-black text-xs shrink-0">★</span>
                        ) : (
                          <span className="text-[10px] font-mono font-bold text-neutral-400 shrink-0">
                            #{idx}
                          </span>
                        )}
                        <span className="font-bold text-neutral-900 text-xs truncate">
                          {c.proyectoCorto}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-xs text-neutral-900 shrink-0">
                        ${Math.round(c.totalMonto).toLocaleString('de-DE')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-neutral-500 mt-1">
                      <span className="font-mono text-neutral-400 truncate max-w-[170px]">
                        {c.codigo} {c.cliente !== 'Todos los Clientes' ? `· ${c.cliente}` : ''}
                      </span>
                      <span>
                        {c.porcentaje}% ({c.salidasCount} mov.)
                      </span>
                    </div>

                    {/* Mini barra de progreso */}
                    <div className="w-full h-1 bg-neutral-100 rounded-full mt-1.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${c.esConsolidado ? 'bg-amber-500' : 'bg-blue-600'}`}
                        style={{ width: `${Math.min(100, c.porcentaje)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: TARJETA DE CUENTA + EVOLUTIVO + CATEGORÍAS + AUDITORÍA */}
        <div className="lg:col-span-8 space-y-5">
          {activeCuenta && (
            <>
              {/* TARJETA PRINCIPAL DEL PROYECTO / CUENTA SELECCIONADA */}
              <div className="bg-[#112238] text-white p-5 rounded-2xl shadow-md border border-slate-700/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-900/80 text-blue-200 border border-blue-700/60">
                        {activeCuenta.codigo}
                      </span>
                      <span className="text-xs font-semibold text-slate-300">
                        {activeCuenta.cliente}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white tracking-tight">
                      {activeCuenta.nombre}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Representa el <strong>{activeCuenta.porcentaje}%</strong> del total despachado por TIMACA en {sipData?.mesLabel || 'este período'}.
                    </p>
                  </div>

                  <div className="bg-slate-800/90 border border-slate-700 px-4 py-3 rounded-xl text-right shrink-0">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                      GASTO TOTAL ({sipData?.mesNombre?.toUpperCase() || 'PERÍODO'}):
                    </span>
                    <span className="text-xl sm:text-2xl font-mono font-black text-amber-400">
                      ${Math.round(activeCuenta.totalMonto).toLocaleString('de-DE')} USD
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      {activeCuenta.salidasCount} movimientos auditados en SIP
                    </span>
                  </div>
                </div>
              </div>

              {/* EVOLUTIVO MENSUAL 2026 (ENERO A OCTUBRE EN VIVO) */}
              <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-blue-600" />
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-neutral-900">
                        Evolutivo Mensual 2026: {activeCuenta.codigo} — {activeCuenta.proyectoCorto}
                      </h4>
                      <p className="text-[11px] text-neutral-500">
                        Curva real de desembolsos mes a mes desde el SIP (Enero a Octubre 2026)
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                      Total Anual: ${Math.round(evolutivoData?.totalAnual || 0).toLocaleString('de-DE')} USD
                    </span>
                  </div>
                </div>

                {/* KPI Header Rápido */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                    <span className="text-[10px] text-neutral-500 block">TOTAL ACUMULADO 2026</span>
                    <span className="font-mono font-bold text-neutral-900 text-sm">
                      ${Math.round(evolutivoData?.totalAnual || 0).toLocaleString('de-DE')} USD
                    </span>
                    <span className="text-[10px] text-neutral-400 block mt-0.5">10 meses oficiales</span>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                    <span className="text-[10px] text-neutral-500 block">MES DE MAYOR GASTO</span>
                    <span className="font-mono font-bold text-blue-700 text-sm">
                      ${Math.round(evolutivoData?.mesPico.total || 0).toLocaleString('de-DE')} USD
                    </span>
                    <span className="text-[10px] text-neutral-400 block mt-0.5">
                      {evolutivoData?.mesPico.mesLabel}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                    <span className="text-[10px] text-neutral-500 block">PROMEDIO MENSUAL</span>
                    <span className="font-mono font-bold text-neutral-900 text-sm">
                      ${Math.round(evolutivoData?.promedioMensual || 0).toLocaleString('de-DE')} USD
                    </span>
                    <span className="text-[10px] text-neutral-400 block mt-0.5">Media 10 meses</span>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                    <span className="text-[10px] text-neutral-500 block">MAYOR CATEGORÍA</span>
                    <span className="font-bold text-emerald-700 text-sm truncate block">
                      {evolutivoData?.mayorCategoria.categoria || 'Materiales'}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400 block mt-0.5">
                      ${Math.round(evolutivoData?.mayorCategoria.total || 0).toLocaleString('de-DE')} USD
                    </span>
                  </div>
                </div>

                {/* Gráfica de barras mensual interactiva */}
                {evolutivoData && (
                  <div className="pt-2">
                    <div className="h-44 flex items-end gap-2 border-b border-neutral-200 pb-2 px-1">
                      {evolutivoData.meses.map((m) => {
                        const maxVal = Math.max(...evolutivoData.meses.map(x => x.total), 1);
                        const pctHeight = Math.max(6, Math.round((m.total / maxVal) * 100));
                        const isCurrentMonth = m.mesNum === selectedMesNum;

                        return (
                          <div 
                            key={m.mesNum} 
                            onClick={() => setSelectedMesNum(m.mesNum)}
                            className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                            title={`${m.mesLabel}: $${Math.round(m.total).toLocaleString('de-DE')} USD (${m.movimientosCount} movimientos)`}
                          >
                            <span className="text-[9px] font-mono text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity mb-1 whitespace-nowrap">
                              ${Math.round(m.total / 1000)}k
                            </span>
                            <div 
                              className={`w-full rounded-t-lg transition-all ${
                                isCurrentMonth
                                  ? 'bg-blue-600 ring-2 ring-blue-400'
                                  : 'bg-slate-300 hover:bg-blue-400'
                              }`}
                              style={{ height: `${pctHeight}%` }}
                            />
                            <span className={`text-[10px] font-bold mt-1.5 ${isCurrentMonth ? 'text-blue-700 font-black' : 'text-neutral-500'}`}>
                              {m.mesNombre}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* DISTRIBUCIÓN POR CATEGORÍAS (NIVEL 2) */}
              <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block font-mono">
                      NIVEL 2 · CATEGORIZACIÓN REAL SIP
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-neutral-900">
                      Distribución en las 5 Categorías para {activeCuenta.codigo} ({activeCuenta.proyectoCorto})
                    </h4>
                  </div>
                  <span className="text-[11px] text-neutral-500">
                    Haz clic en una categoría para filtrar las líneas abajo
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {/* Tarjeta Todas */}
                  <div
                    onClick={() => setSelectedCategoryFilter('todas')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedCategoryFilter === 'todas'
                        ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-500/20 shadow-xs'
                        : 'border-neutral-200 hover:border-neutral-300 bg-white'
                    }`}
                  >
                    <span className="font-bold text-neutral-900 text-xs block truncate">
                      Todas las Categorías
                    </span>
                    <span className="text-xs font-mono font-bold text-neutral-900 block mt-1">
                      ${Math.round(activeCuenta.totalMonto).toLocaleString('de-DE')}
                    </span>
                    <div className="flex items-center justify-between text-[10px] text-neutral-500 mt-1">
                      <span>100%</span>
                      <span>{activeCuenta.salidasCount} líneas</span>
                    </div>
                  </div>

                  {/* Cada Categoría Oficial */}
                  {categoriasDesglose.map((cat) => {
                    const isCatSelected = selectedCategoryFilter === cat.categoria;
                    return (
                      <div
                        key={cat.categoria}
                        onClick={() => setSelectedCategoryFilter(cat.categoria)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          isCatSelected
                            ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-500/20 shadow-xs'
                            : 'border-neutral-200 hover:border-neutral-300 bg-white'
                        }`}
                      >
                        <span className="font-bold text-neutral-900 text-xs block truncate" title={cat.categoria}>
                          {cat.categoria}
                        </span>
                        <span className="text-xs font-mono font-bold text-neutral-900 block mt-1">
                          ${Math.round(cat.total).toLocaleString('de-DE')}
                        </span>
                        <div className="flex items-center justify-between text-[10px] text-neutral-500 mt-1">
                          <span>{cat.porcentaje}%</span>
                          <span>{cat.count} líneas</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* AUDITORÍA PROFUNDA LÍNEA POR LÍNEA (NIVEL 3) */}
              <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block font-mono">
                      NIVEL 3 · AUDITORÍA LÍNEA A LÍNEA DESDE SIP
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-neutral-900">
                      Movimientos Reales SIP: {activeCuenta.codigo} · {selectedCategoryFilter === 'todas' ? 'Todas las Categorías' : selectedCategoryFilter}
                    </h4>
                  </div>

                  {/* Buscador de ítems */}
                  <div className="relative min-w-[240px]">
                    <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Buscar por código, comprobante o descripción..."
                      value={itemSearchTerm}
                      onChange={(e) => setItemSearchTerm(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Tabla de movimientos reales */}
                <div className="overflow-x-auto max-h-[520px] rounded-xl border border-neutral-200">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 bg-neutral-100 text-neutral-700 font-bold border-b border-neutral-200 z-10">
                      <tr>
                        <th className="py-2.5 px-3">Comprobante</th>
                        <th className="py-2.5 px-3">Fecha</th>
                        <th className="py-2.5 px-3">Código</th>
                        <th className="py-2.5 px-3">Descripción Material / Servicio</th>
                        <th className="py-2.5 px-3">Categoría</th>
                        <th className="py-2.5 px-3 text-right">Cant.</th>
                        <th className="py-2.5 px-3 text-right">Precio USD</th>
                        <th className="py-2.5 px-3 text-right">Total USD</th>
                        <th className="py-2.5 px-3">Solicitante</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {lineasProfundas.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="py-12 text-center text-xs text-neutral-400">
                            No se encontraron movimientos registrados en el SIP para esta selección
                          </td>
                        </tr>
                      ) : (
                        lineasProfundas.slice(0, 300).map((it, idx) => (
                          <tr 
                            key={`${it.id || idx}-${it.numero || ''}`}
                            onClick={() => setSelectedItemModal(it)}
                            className="hover:bg-blue-50/50 cursor-pointer transition-colors"
                          >
                            <td className="py-2 px-3 font-mono font-bold text-blue-700 whitespace-nowrap">
                              {it.numero || `SIP-${it.id}`}
                            </td>
                            <td className="py-2 px-3 font-mono text-neutral-500 whitespace-nowrap text-[11px]">
                              {it.fecha || '-'}
                            </td>
                            <td className="py-2 px-3 font-mono text-neutral-600 whitespace-nowrap text-[11px]">
                              {it.codigo || '-'}
                            </td>
                            <td className="py-2 px-3 font-medium text-neutral-900 max-w-[280px] truncate" title={it.descripcion}>
                              {it.descripcion || '-'}
                            </td>
                            <td className="py-2 px-3 whitespace-nowrap">
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200">
                                {getMacroCategoriaSip(it)}
                              </span>
                            </td>
                            <td className="py-2 px-3 font-mono text-right text-neutral-700">
                              {it.cantidad != null ? Number(it.cantidad).toLocaleString('de-DE') : 1} {it.unidad || 'UND'}
                            </td>
                            <td className="py-2 px-3 font-mono text-right text-neutral-700">
                              ${(it.precio_final || (it.cantidad ? (it.total_usd / it.cantidad) : 0)).toFixed(2)}
                            </td>
                            <td className="py-2 px-3 font-mono font-bold text-right text-neutral-900">
                              ${Number(it.total_usd).toFixed(2)}
                            </td>
                            <td className="py-2 px-3 text-neutral-600 max-w-[140px] truncate" title={it.solicitante}>
                              {it.solicitante || '-'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {lineasProfundas.length > 300 && (
                  <div className="text-center text-xs text-neutral-500 pt-2 font-medium">
                    Mostrando los primeros 300 movimientos de un total de {lineasProfundas.length}. Para auditar la totalidad, utiliza el botón superior de <strong>Descargar Auditoría (.xlsx)</strong>.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ================= MODAL DE AUDITORÍA DETALLADA DE UN ÍTEM ================= */}
      {selectedItemModal && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedItemModal(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
                  <Boxes className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-neutral-400 block font-bold">
                    COMPROBANTE SIP OFICIAL
                  </span>
                  <h4 className="text-base font-bold text-neutral-900 font-mono">
                    {selectedItemModal.numero || `SIP-${selectedItemModal.id}`}
                  </h4>
                </div>
              </div>
              <button 
                onClick={() => setSelectedItemModal(null)}
                className="p-1 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-neutral-500 block font-semibold">Descripción del Material / Servicio:</span>
                <p className="font-bold text-neutral-900 text-sm mt-0.5">
                  {selectedItemModal.descripcion}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <div>
                  <span className="text-neutral-500 block">Código SIP:</span>
                  <span className="font-mono font-bold text-neutral-900">{selectedItemModal.codigo || '-'}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Fecha Imputación:</span>
                  <span className="font-mono font-bold text-neutral-900">{selectedItemModal.fecha || '-'}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Cantidad & Unidad:</span>
                  <span className="font-mono font-bold text-neutral-900">{selectedItemModal.cantidad} {selectedItemModal.unidad}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Total Imputado USD:</span>
                  <span className="font-mono font-black text-blue-700 text-sm">${Number(selectedItemModal.total_usd).toFixed(2)}</span>
                </div>
              </div>

              <div>
                <span className="text-neutral-500 block font-semibold">Motivo Textual Registrado:</span>
                <p className="p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-700 font-mono text-[11px] mt-1">
                  {selectedItemModal.motivo || 'Sin observaciones registradas'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-neutral-500 block">Solicitante:</span>
                  <span className="font-medium text-neutral-800">{selectedItemModal.solicitante || '-'}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Almacén / Destino:</span>
                  <span className="font-medium text-neutral-800">{selectedItemModal.almacen || '-'}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedItemModal(null)}
                className="px-4 py-2 bg-neutral-900 text-white font-semibold rounded-xl hover:bg-neutral-800 text-xs"
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
