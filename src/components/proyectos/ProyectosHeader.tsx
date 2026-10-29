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
  Bell, 
  Key, 
  Calendar,
  Sparkles,
  ExternalLink,
  ChevronRight
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
  const [currentTime, setCurrentTime] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Live Clock matching NÚCLEO ERP ("jue 29/10/2026 09:02:31")
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const dias = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
      const diaNom = dias[now.getDay()];
      const dia = String(now.getDate()).padStart(2, '0');
      const mes = String(now.getMonth() + 1).padStart(2, '0');
      const ano = now.getFullYear();
      const hora = String(now.getHours()).padStart(2, '0');
      const min = String(now.getMinutes()).padStart(2, '0');
      const seg = String(now.getSeconds()).padStart(2, '0');
      setCurrentTime(`${diaNom} ${dia}/${mes}/${ano} ${hora}:${min}:${seg}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

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
    <div className="space-y-3">
      {/* ========================================================================= */}
      {/* 1. TOP BAR NÚCLEO ERP STYLE (AZUL MEDIANOCHE PROFUNDO #06122D)            */}
      {/* ========================================================================= */}
      <div className="bg-[#06122d] text-white rounded-2xl shadow-xl border border-blue-950 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        
        {/* Left: Nav Pill + Module Tag + Title */}
        <div className="flex items-center gap-3 min-w-0">
          {onVolver ? (
            <button
              onClick={onVolver}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all border border-white/15 cursor-pointer shadow-xs shrink-0"
              title="Volver al menú de navegación"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>← Costos</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 text-white text-xs font-semibold border border-white/15">
              <span>SIGMA</span>
            </div>
          )}

          {/* Module Pill (like CV in Núcleo) */}
          <div className="font-mono text-xs font-black px-2 py-1 rounded-lg bg-blue-900/90 text-blue-200 border border-blue-600/60 shadow-xs shrink-0">
            EXT
          </div>

          {/* Main Title */}
          <div className="flex items-center gap-2 min-w-0">
            <h1 className="text-base sm:text-lg font-black tracking-tight text-white truncate">
              {activeCuenta?.proyectoCorto || 'Proyectos Externos'}
            </h1>
            <span className="font-mono text-xs font-bold text-sky-300 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-700/60 shrink-0 hidden sm:inline-block">
              {activeCuenta?.codigo || 'TTE-C'}
            </span>
          </div>
        </div>

        {/* Right: Notification Bell + Clock + Status */}
        <div className="flex items-center gap-3 text-xs text-blue-100">
          {/* Notification icon */}
          <button 
            type="button" 
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-blue-200 transition-colors cursor-pointer border border-white/10"
            title="Notificaciones operativas"
          >
            <Bell className="w-3.5 h-3.5" />
          </button>

          {/* Status pill with live dot */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 border border-white/10">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[11px] font-mono font-medium text-emerald-300">En línea</span>
          </div>

          {/* Live Date and Time matching Núcleo */}
          {currentTime && (
            <span className="font-mono text-[11px] text-blue-200/90 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10 hidden lg:inline-block">
              {currentTime}
            </span>
          )}

          {/* User Avatar */}
          <div className="w-8 h-8 rounded-full bg-blue-600 border-2 border-white/20 flex items-center justify-center text-white font-bold text-xs shadow-xs" title="Alejandra Tesara · Auditoría">
            AT
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SUB-BAR: PROJECT SELECTOR + SEARCH + PILL FILTERS + ACTIONS            */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-3 sm:p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        
        {/* Left: Project Selector Dropdown Button */}
        <div className="relative flex-1 max-w-lg" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full flex items-center justify-between gap-3 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200 transition-all cursor-pointer text-left group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-mono text-[10px] font-bold shrink-0 shadow-xs">
                {activeCuenta?.codigo?.slice(-4) || 'EXT'}
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
                <span className="text-[10px] text-slate-500 font-mono block">
                  {activeCuenta?.cliente} · {safeFormatUSD(activeCuenta?.totalMonto || 0, false)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0 text-slate-400 group-hover:text-slate-700">
              <span className="text-[11px] font-bold hidden sm:inline-block">Cambiar proyecto</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {/* Popover Dropdown */}
          {dropdownOpen && (
            <div className="absolute top-full left-0 mt-1.5 w-full sm:w-[460px] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
              <div className="p-3 border-b border-slate-100 bg-slate-50/70">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Busca por proyecto, cliente o código TTE-C..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                    autoFocus
                  />
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto p-2 space-y-1">
                {filteredCuentas.map((c, idx) => {
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
                          ? 'bg-blue-600 text-white font-bold shadow-xs'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {c.esConsolidado ? (
                          <span className={`font-bold text-xs shrink-0 ${isSelected ? 'text-amber-200' : 'text-amber-500'}`}>★</span>
                        ) : (
                          <span className={`font-mono text-[10px] shrink-0 ${isSelected ? 'text-blue-200' : 'text-slate-400'}`}>
                            #{idx}
                          </span>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className={`font-mono text-xs font-bold ${isSelected ? 'text-white' : 'text-blue-700'}`}>
                              {c.codigo}
                            </span>
                            <span className="truncate font-semibold">
                              {c.proyectoCorto}
                            </span>
                          </div>
                          <span className={`text-[10px] block truncate ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                            {c.cliente}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0 pl-2">
                        <span className={`font-mono font-bold block ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                          {safeFormatUSD(c.totalMonto, false)}
                        </span>
                        <span className={`text-[10px] ${isSelected ? 'text-blue-200' : 'text-slate-400'}`}>
                          {c.porcentaje}% · {c.salidasCount} mov.
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right side: Pill Modes + Period + NÚCLEO Primary Blue Action Button */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Segmented Mode Pill Control */}
          <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setDataMode('cinco_rubros')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                dataMode === 'cinco_rubros'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>5 Rubros ($12.05M)</span>
            </button>
            <button
              onClick={() => setDataMode('sip_compras')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                dataMode === 'sip_compras'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
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
              <option value={0}>Año 2026 (Consolidado)</option>
              <option value={10}>Octubre 2026 (En Curso)</option>
              <option value={9}>Septiembre 2026</option>
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

          {/* Refresh SIP */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl text-slate-600 hover:text-blue-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer disabled:opacity-50"
            title="Sincronizar SIP en vivo sin caché"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          {/* PRIMARY BUTTON: Matching "Entregar un CV" in Núcleo (Vibrant Royal Blue) */}
          <button
            onClick={onExportExcel}
            disabled={!activeCuenta}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-black text-white bg-[#1D4ED8] hover:bg-[#1E40AF] active:bg-[#1E3A8A] shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50 tracking-wide"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar Auditoría (.xlsx)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
