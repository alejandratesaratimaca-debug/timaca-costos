import React, { useState, useRef, useEffect } from 'react';
import { 
  Briefcase, 
  Layers, 
  Boxes, 
  RefreshCw, 
  Download, 
  ArrowLeft, 
  ChevronDown, 
  Search, 
  Check, 
  Calendar,
  Sparkles
} from 'lucide-react';
import { SipCuentaSummary } from '../../services/sipDataService';
import { safeFormatUSD } from '../../utils/numericHelpers';

interface ProyectosHeaderProps {
  onVolver?: () => void;
  dataMode: 'cinco_rubros' | 'sip_compras';
  setDataMode: (mode: 'cinco_rubros' | 'sip_compras') => void;
  selectedMesNum: number;
  setSelectedMesNum: (mes: number) => void;
  selectedCuentaCodigo: string;
  setSelectedCuentaCodigo: (codigo: string) => void;
  cuentasRanking: SipCuentaSummary[];
  activeCuenta: SipCuentaSummary | null;
  onRefresh: () => void;
  isRefreshing: boolean;
  onExportExcel: () => void;
  mesLabel?: string;
}

export const ProyectosHeader: React.FC<ProyectosHeaderProps> = ({
  onVolver,
  dataMode,
  setDataMode,
  selectedMesNum,
  setSelectedMesNum,
  selectedCuentaCodigo,
  setSelectedCuentaCodigo,
  cuentasRanking,
  activeCuenta,
  onRefresh,
  isRefreshing,
  onExportExcel,
  mesLabel
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCuentas = cuentasRanking.filter(c => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase().trim();
    return (
      (c.codigo && c.codigo.toLowerCase().includes(q)) ||
      (c.proyectoCorto && c.proyectoCorto.toLowerCase().includes(q)) ||
      (c.cliente && c.cliente.toLowerCase().includes(q)) ||
      (c.nombre && c.nombre.toLowerCase().includes(q))
    );
  });

  return (
    <header className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-5 space-y-4">
      {/* Top Bar: Breadcrumb + Action Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Left: Breadcrumb & Title */}
        <div className="flex items-start sm:items-center gap-3">
          {onVolver && (
            <button
              onClick={onVolver}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer shrink-0 mt-0.5 sm:mt-0"
              title="Volver al Tablero Ejecutivo"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
              <span>Volver</span>
            </button>
          )}

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
              <span className="hover:text-slate-800 transition-colors">Costos</span>
              <span className="text-slate-300">/</span>
              <span className="hover:text-slate-800 transition-colors">Proyectos Externos</span>
              <span className="text-slate-300">/</span>
              <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {activeCuenta?.codigo || 'TTE-C-0671'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
                {activeCuenta?.proyectoCorto || activeCuenta?.nombre || 'Proyectos & Cuentas Auxiliares'}
              </h1>
              {activeCuenta?.cliente && activeCuenta.cliente !== 'Todos los Clientes' && (
                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                  {activeCuenta.cliente}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Actions (Sync & Excel) */}
        <div className="flex items-center gap-2.5 self-end lg:self-center">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200/90 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
            title="Revalidar datos directamente desde el SIP sin caché"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Sincronizando...' : 'Sincronizar SIP'}</span>
          </button>

          <button
            onClick={onExportExcel}
            disabled={!activeCuenta}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs hover:shadow transition-all cursor-pointer disabled:opacity-50"
            title="Exportar auditoría detallada a Microsoft Excel (.xlsx)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar Excel</span>
          </button>
        </div>
      </div>

      {/* Control Strip: Project Dropdown + Mode Switcher + Period Selector */}
      <div className="pt-3 border-t border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Project Selector with Custom Popover */}
        <div className="relative flex-1 max-w-md" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl text-left transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Briefcase className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-bold text-blue-700">
                    {activeCuenta?.codigo}
                  </span>
                  <span className="text-xs font-bold text-slate-900 truncate">
                    {activeCuenta?.proyectoCorto}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono block">
                  {safeFormatUSD(activeCuenta?.totalMonto || 0, false)} ({activeCuenta?.salidasCount || 0} mov.)
                </span>
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute top-full left-0 mt-1.5 w-full sm:w-[420px] bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
              <div className="p-2.5 border-b border-slate-100 bg-slate-50/50">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Filtrar por código o nombre..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                </div>
              </div>

              <div className="max-h-72 overflow-y-auto p-1.5 space-y-1">
                {filteredCuentas.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    No se encontraron proyectos auxiliares
                  </div>
                ) : (
                  filteredCuentas.map((c, idx) => {
                    const isSelected = c.codigo === selectedCuentaCodigo;
                    return (
                      <div
                        key={c.codigo}
                        onClick={() => {
                          setSelectedCuentaCodigo(c.codigo);
                          setDropdownOpen(false);
                          setSearchFilter('');
                        }}
                        className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-xs transition-colors ${
                          isSelected
                            ? 'bg-blue-50 text-blue-900 font-bold border border-blue-200/80'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {c.esConsolidado ? (
                            <span className="text-amber-500 font-bold text-xs shrink-0">★</span>
                          ) : (
                            <span className="font-mono text-[10px] text-slate-400 shrink-0">
                              #{idx}
                            </span>
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-xs font-bold text-blue-700">
                                {c.codigo}
                              </span>
                              <span className="truncate font-semibold">
                                {c.proyectoCorto}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 block truncate">
                              {c.cliente}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0 pl-2">
                          <span className="font-mono font-bold text-slate-900 block">
                            {safeFormatUSD(c.totalMonto, false)}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {c.porcentaje}% · {c.salidasCount} mov.
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right side controls: Mode Toggle & Period Selector */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Segmented Mode Control */}
          <div className="inline-flex bg-slate-100/90 p-1 rounded-xl border border-slate-200 shadow-2xs">
            <button
              onClick={() => setDataMode('cinco_rubros')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                dataMode === 'cinco_rubros'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Consolidado auditado con Materiales, Servicios, MOD, Horas Máquina y CIF"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>5 Rubros ($12.05M)</span>
            </button>
            <button
              onClick={() => setDataMode('sip_compras')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                dataMode === 'sip_compras'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Compras directas y consumos de inventario desde el SIP"
            >
              <Boxes className="w-3.5 h-3.5" />
              <span>Compras SIP ($4.95M)</span>
            </button>
          </div>

          {/* Period Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedMesNum}
              onChange={(e) => setSelectedMesNum(Number(e.target.value))}
              className="text-xs font-bold text-slate-900 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value={0}>
                {dataMode === 'cinco_rubros' ? 'Año 2026 (Consolidado: $12.05M)' : 'Año 2026 (Ene - Oct SIP)'}
              </option>
              <option value={10}>Octubre 2026 (En Curso · SIP en Vivo)</option>
              <option value={9}>Septiembre 2026 (Cierre Operativo)</option>
              <option value={8}>Agosto 2026</option>
              <option value={7}>Julio 2026</option>
              <option value={6}>Junio 2026</option>
              <option value={5}>Mayo 2026</option>
              <option value={4}>Abril 2026</option>
              <option value={3}>Marzo 2026</option>
              <option value={2}>Febrero 2026</option>
              <option value={1}>Enero 2026</option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};
