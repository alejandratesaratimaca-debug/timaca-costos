import React, { useState } from 'react';
import { UsuarioSistema } from '../types/usuarios';
import { SuiteModulo } from '../types/suite';
import { TimacaLogo } from './TimacaLogo';
import { 
  Building2, 
  Wrench, 
  ShieldCheck, 
  HardHat, 
  Award, 
  ChevronDown, 
  ChevronRight, 
  Layers, 
  Clock, 
  FileText, 
  CalendarDays, 
  CalendarRange, 
  TableProperties, 
  FileSpreadsheet, 
  Users, 
  UploadCloud, 
  LogOut, 
  ChevronLeft,
  Briefcase,
  LayoutDashboard,
  FileCheck2
} from 'lucide-react';

interface SidebarProps {
  moduloActivo: SuiteModulo;
  onCambiarModulo: (modulo: SuiteModulo) => void;
  entornoActivo: 'externos' | 'internos';
  onCambiarEntorno: (entorno: 'externos' | 'internos') => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: UsuarioSistema;
  onLogout?: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  moduloActivo,
  onCambiarModulo,
  entornoActivo,
  onCambiarEntorno,
  activeTab,
  setActiveTab,
  currentUser,
  onLogout,
  isCollapsed,
  setIsCollapsed,
  mobileOpen,
  setMobileOpen
}) => {
  // Estados de expansión: Menú de costos completamente comprimido por defecto
  const [costosExpanded, setCostosExpanded] = useState(false);
  const [externosExpanded, setExternosExpanded] = useState(false);
  const [internosExpanded, setInternosExpanded] = useState(false);

  const esInternos = entornoActivo === 'internos';

  const handleSelectModulo = (modulo: SuiteModulo) => {
    onCambiarModulo(modulo);
    if (modulo === 'costos') {
      if (entornoActivo === 'internos') {
        setActiveTab('internos-dashboard');
      } else {
        setActiveTab('dashboard');
      }
    }
    setMobileOpen(false);
  };

  const handleSelectCostosTab = (tabId: string, entorno: 'externos' | 'internos') => {
    onCambiarModulo('costos');
    onCambiarEntorno(entorno);
    setActiveTab(tabId);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Backdrop overlay para móviles */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed md:sticky top-0 left-0 z-50 h-screen flex flex-col bg-[#112238] text-slate-100 border-r border-slate-700/80 transition-all duration-300 shadow-2xl select-none ${
          isCollapsed ? 'w-[76px]' : 'w-[315px]'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* ================= HEADER DEL SIDEBAR: BLANCO CON LOGO CENTRADO ================= */}
        <div className="border-b border-slate-200 shrink-0 bg-white transition-colors relative">
          {!isCollapsed ? (
            <div className="p-3.5 flex flex-col items-center text-center relative">
              {/* Botón Plegar / Comprimir Sidebar en la esquina superior derecha */}
              <button
                onClick={() => setIsCollapsed(true)}
                className="hidden md:flex absolute top-2.5 right-2.5 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Comprimir menú lateral"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Logo Institucional TIMACA Centrado para máxima visibilidad */}
              <div className="py-1 flex items-center justify-center">
                <TimacaLogo size="md" showSubtitle={false} showRif={false} />
              </div>

              {/* Título Oficial de la Suite de Costos */}
              <div className="mt-2 flex flex-col items-center">
                <span className="font-heading font-black text-base text-slate-900 tracking-wider block">
                  SIGMA · TIMACA
                </span>
                <div className="flex items-center justify-center gap-1.5 mt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                  <span className="text-xs text-slate-600 font-medium">
                    Gestión de Materiales y Activos
                  </span>
                  <span className="text-xs font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded ml-1">
                    2026
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-2.5 flex flex-col items-center gap-2">
              {/* Isotipo / Logo TIMACA Centrado cuando está colapsado */}
              <div 
                className="w-11 h-11 rounded-xl bg-white p-1 border border-slate-200 shadow-xs flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                title="Expandir: Control de Costos TIMACA"
                onClick={() => setIsCollapsed(false)}
              >
                <TimacaLogo size="sm" showSubtitle={false} showRif={false} />
              </div>
              
              <button
                onClick={() => setIsCollapsed(false)}
                className="hidden md:flex p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Expandir menú lateral"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* ================= CONTENIDO DE NAVEGACIÓN SCROLLABLE ================= */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-4 scrollbar-thin scrollbar-thumb-slate-700">
          
          {/* ========================================================================= */}
          {/* 1. EL PRIMERO: RECURSOS HUMANOS (RRHH) - TALENTO TIMACA                    */}
          {/* ========================================================================= */}
          <div className="space-y-1">
            {!isCollapsed && (
              <div className="px-2 py-1 text-[11px] font-mono font-bold tracking-wider text-sky-300 uppercase flex items-center justify-between">
                <span>1. Gestión de Personal</span>
                <span className="text-[10px] bg-blue-900/60 text-blue-200 px-1.5 py-0.2 rounded border border-blue-700/60">Prioritario</span>
              </div>
            )}

            <button
              onClick={() => handleSelectModulo('rrhh')}
              className={`w-full flex items-center p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                moduloActivo === 'rrhh'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50 ring-2 ring-blue-300'
                  : 'bg-slate-800/60 text-slate-200 hover:text-white hover:bg-slate-700/70 border border-slate-700/50'
              }`}
              title="Recursos Humanos · Talento TIMACA: Expedientes, Contratos, Asistencia, Cuadrillas y Selección"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <span className={`font-mono text-xs font-black px-2 py-1 rounded shrink-0 self-center ${
                  moduloActivo === 'rrhh' ? 'bg-blue-900 text-white ring-1 ring-white/30' : 'bg-blue-950 text-blue-300 border border-blue-700/50'
                }`}>
                  RRHH
                </span>
                {!isCollapsed && (
                  <div className="flex flex-col min-w-0">
                    <span className="font-black text-sm text-white leading-tight flex items-center gap-1.5">
                      Recursos Humanos
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    </span>
                    <span className={`text-[11px] mt-0.5 ${
                      moduloActivo === 'rrhh' ? 'text-blue-100 font-medium' : 'text-slate-400'
                    }`}>
                      Expedientes, Personal & Asistencia
                    </span>
                  </div>
                )}
              </div>
            </button>
          </div>

          {/* ========================================================================= */}
          {/* 2. DEPARTAMENTO DE COSTOS (TODAS LAS VISTAS ABIERTAS Y VISIBLES)           */}
          {/* ========================================================================= */}
          <div className="space-y-2 pt-1 border-t border-slate-700/60">
            {!isCollapsed ? (
              <button
                type="button"
                onClick={() => setCostosExpanded(!costosExpanded)}
                className={`w-full px-2.5 py-1.5 text-[11px] font-mono font-bold tracking-wider uppercase flex items-center justify-between rounded-xl border transition-all cursor-pointer ${
                  costosExpanded 
                    ? 'bg-amber-950/40 text-amber-300 border-amber-700/60 shadow-xs' 
                    : 'bg-slate-800/40 text-amber-400/90 border-slate-700/60 hover:bg-slate-800/80 hover:text-amber-300'
                }`}
                title={costosExpanded ? "Colapsar departamento de costos" : "Desplegar departamento de costos"}
              >
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>2. Depto. de Costos</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-amber-400 transition-transform duration-200 ${costosExpanded ? 'rotate-180' : ''}`} />
                </div>
                <span className="text-[10px] bg-amber-950/60 text-amber-300 px-1.5 py-0.5 rounded border border-amber-700/60">$13.8M</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsCollapsed(false);
                  setCostosExpanded(true);
                }}
                className={`w-full flex items-center justify-center p-2 rounded-xl transition-all cursor-pointer ${
                  moduloActivo === 'costos'
                    ? 'bg-amber-600 text-white font-bold shadow-md'
                    : 'text-amber-400 hover:text-white hover:bg-slate-800/60'
                }`}
                title="Departamento de Costos ($13.8M)"
              >
                <div className="p-1 rounded bg-amber-950/80 text-amber-300 border border-amber-800/60 font-mono text-[10px] font-bold">
                  CST
                </div>
              </button>
            )}

            {/* SECCIONES DE COSTOS: Sólo visibles cuando el usuario despliega Costos */}
            {costosExpanded && !isCollapsed && (
              <div className="space-y-2">
                {/* SECCIÓN A: PROYECTOS EXTERNOS ($1.29M) */}
                <div className="bg-slate-800/40 rounded-xl p-2 border border-slate-700/60 space-y-1">
              {!isCollapsed ? (
                <div 
                  onClick={() => setExternosExpanded(!externosExpanded)}
                  className="flex items-center justify-between px-1.5 py-1 text-xs font-bold text-blue-300 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>Proyectos Externos (Obras)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-mono bg-blue-950 text-blue-200 px-1.5 py-0.5 rounded border border-blue-800/50">$1.29M</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${externosExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </div>
              ) : (
                <div className="text-center font-mono text-[10px] text-blue-400 font-bold py-1">EXT</div>
              )}

              {(externosExpanded || isCollapsed) && (
                <div className="space-y-0.5 text-xs">
                  <button
                    onClick={() => handleSelectCostosTab('dashboard', 'externos')}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                      moduloActivo === 'costos' && !esInternos && activeTab === 'dashboard'
                        ? 'bg-blue-600 text-white font-bold shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                    }`}
                    title="Resumen General y Tablero Ejecutivo"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
                    {!isCollapsed && <span>Tablero Ejecutivo</span>}
                  </button>

                  <button
                    onClick={() => handleSelectCostosTab('matriz-proyectos', 'externos')}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                      moduloActivo === 'costos' && !esInternos && activeTab === 'matriz-proyectos'
                        ? 'bg-blue-600 text-white font-bold shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                    }`}
                    title="Matriz Proyectos x Categorías (PPT Oficial)"
                  >
                    <TableProperties className="w-3.5 h-3.5 shrink-0" />
                    {!isCollapsed && <span>Matriz Proyectos (PPT)</span>}
                  </button>

                  <button
                    onClick={() => handleSelectCostosTab('proyectos', 'externos')}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                      moduloActivo === 'costos' && !esInternos && activeTab === 'proyectos'
                        ? 'bg-blue-600 text-white font-bold shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                    }`}
                    title="20 Cuentas Auxiliares & 77 Presupuestos"
                  >
                    <Briefcase className="w-3.5 h-3.5 shrink-0" />
                    {!isCollapsed && <span>20 Cuentas Auxiliares</span>}
                  </button>

                  <button
                    onClick={() => handleSelectCostosTab('mano-obra', 'externos')}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                      moduloActivo === 'costos' && !esInternos && activeTab === 'mano-obra'
                        ? 'bg-blue-600 text-white font-bold shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                    }`}
                    title="Mano de Obra Diaria (MOD Cuadrillas)"
                  >
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    {!isCollapsed && <span>Mano de Obra Diaria</span>}
                  </button>

                  <button
                    onClick={() => handleSelectCostosTab('categorias', 'externos')}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                      moduloActivo === 'costos' && !esInternos && activeTab === 'categorias'
                        ? 'bg-blue-600 text-white font-bold shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                    }`}
                    title="Auditoría por Categoría y Partidas"
                  >
                    <Layers className="w-3.5 h-3.5 shrink-0" />
                    {!isCollapsed && <span>Auditoría por Categoría</span>}
                  </button>

                  <button
                    onClick={() => handleSelectCostosTab('tabla', 'externos')}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                      moduloActivo === 'costos' && !esInternos && activeTab === 'tabla'
                        ? 'bg-blue-600 text-white font-bold shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                    }`}
                    title="Registro de Salidas de Almacén SIP"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" />
                    {!isCollapsed && <span>Salidas de Almacén SIP</span>}
                  </button>

                  <button
                    onClick={() => handleSelectCostosTab('informe', 'externos')}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                      moduloActivo === 'costos' && !esInternos && activeTab === 'informe'
                        ? 'bg-blue-600 text-white font-bold shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                    }`}
                    title="Presentación Ejecutiva Oficial (PPT 8 Láminas)"
                  >
                    <FileText className="w-3.5 h-3.5 shrink-0" />
                    {!isCollapsed && <span>Presentación Ejecutiva PPT</span>}
                  </button>

                  <button
                    onClick={() => handleSelectCostosTab('semanas', 'externos')}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                      moduloActivo === 'costos' && !esInternos && activeTab === 'semanas'
                        ? 'bg-blue-600 text-white font-bold shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                    }`}
                    title="Evolución Semana a Semana"
                  >
                    <CalendarRange className="w-3.5 h-3.5 shrink-0" />
                    {!isCollapsed && <span>Semana a Semana</span>}
                  </button>

                  <button
                    onClick={() => handleSelectCostosTab('meses', 'externos')}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                      moduloActivo === 'costos' && !esInternos && activeTab === 'meses'
                        ? 'bg-blue-600 text-white font-bold shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                    }`}
                    title="Comparativa Mes a Mes"
                  >
                    <CalendarDays className="w-3.5 h-3.5 shrink-0" />
                    {!isCollapsed && <span>Mes a Mes</span>}
                  </button>

                  <button
                    onClick={() => handleSelectCostosTab('validacion-gerente', 'externos')}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors border ${
                      moduloActivo === 'costos' && !esInternos && activeTab === 'validacion-gerente'
                        ? 'bg-amber-600 text-white font-bold shadow-xs border-amber-500'
                        : 'text-amber-300 hover:text-white hover:bg-slate-700/60 border-amber-700/40'
                    }`}
                    title="Sesión de Gerente de Proyecto: Revisión y Validación de Imputaciones Contables"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileCheck2 className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                      {!isCollapsed && <span className="font-semibold">Validación Gerencial</span>}
                    </div>
                    {!isCollapsed && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-200 border border-amber-700/60 uppercase">
                        Gerentes
                      </span>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* SECCIÓN B: PROYECTOS INTERNOS ($183K - DANIELA RIVEROS) */}
            <div className="bg-slate-800/40 rounded-xl p-2 border border-slate-700/60 space-y-1">
              {!isCollapsed ? (
                <div 
                  onClick={() => setInternosExpanded(!internosExpanded)}
                  className="flex items-center justify-between px-1.5 py-1 text-xs font-bold text-sky-300 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-sky-400" />
                    <span>Proyectos Internos (Planta & Flota)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-mono bg-sky-950 text-sky-200 px-1.5 py-0.5 rounded border border-sky-800/50">$183K</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${internosExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </div>
              ) : (
                <div className="text-center font-mono text-[10px] text-sky-400 font-bold py-1">INT</div>
              )}

              {(internosExpanded || isCollapsed) && (
                <div className="space-y-0.5 text-xs">
                  <button
                    onClick={() => handleSelectCostosTab('internos-dashboard', 'internos')}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                      moduloActivo === 'costos' && esInternos && activeTab === 'internos-dashboard'
                        ? 'bg-sky-600 text-white font-bold shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                    }`}
                    title="Tablero General de Proyectos Internos (CAPEX vs OPEX)"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
                    {!isCollapsed && <span>Tablero CAPEX vs OPEX</span>}
                  </button>

                  <button
                    onClick={() => handleSelectCostosTab('internos-capex', 'internos')}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                      moduloActivo === 'costos' && esInternos && activeTab === 'internos-capex'
                        ? 'bg-sky-600 text-white font-bold shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                    }`}
                    title="Obras e Infraestructura CAPEX"
                  >
                    <Building2 className="w-3.5 h-3.5 shrink-0" />
                    {!isCollapsed && <span>Obras CAPEX ($60.6K)</span>}
                  </button>

                  <button
                    onClick={() => handleSelectCostosTab('internos-gruas', 'internos')}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                      moduloActivo === 'costos' && esInternos && activeTab === 'internos-gruas'
                        ? 'bg-sky-600 text-white font-bold shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                    }`}
                    title="Flota Móvil y 26 Grúas"
                  >
                    <Wrench className="w-3.5 h-3.5 shrink-0" />
                    {!isCollapsed && <span>Flota de 26 Grúas</span>}
                  </button>

                  <button
                    onClick={() => handleSelectCostosTab('internos-ppt', 'internos')}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                      moduloActivo === 'costos' && esInternos && (activeTab === 'internos-ppt' || activeTab === 'informe')
                        ? 'bg-sky-600 text-white font-bold shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                    }`}
                    title="Dossier Ejecutivo PPT de Internos"
                  >
                    <FileText className="w-3.5 h-3.5 shrink-0" />
                    {!isCollapsed && <span>Dossier PPT (10 Láminas)</span>}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

          {/* ========================================================================= */}
          {/* 3. RESTO DE MÓDULOS OPERATIVOS (TOTALMENTE VISIBLES)                       */}
          {/* ========================================================================= */}
          <div className="space-y-1 pt-1 border-t border-slate-700/60">
            {!isCollapsed && (
              <div className="px-2 py-1 text-[11px] font-mono font-bold tracking-wider text-slate-300 uppercase">
                3. Otros Módulos Operativos
              </div>
            )}

            {/* HERRAMIENTAS */}
            <button
              onClick={() => handleSelectModulo('herramientas')}
              className={`w-full flex items-center p-2 rounded-xl text-left transition-all cursor-pointer ${
                moduloActivo === 'herramientas'
                  ? 'bg-sky-600 text-white shadow-md ring-1 ring-sky-300'
                  : 'text-slate-200 hover:text-white hover:bg-slate-700/50'
              }`}
              title="Sistema de Herramientas: Control de Cajas 01-40"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded shrink-0 ${
                  moduloActivo === 'herramientas' ? 'bg-sky-800 text-white' : 'bg-slate-800 text-sky-300'
                }`}>
                  HRM
                </span>
                {!isCollapsed && (
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-xs text-white truncate">Herramientas & Taller</span>
                    <span className="text-[10px] text-slate-400">40 Cajas Calibradas</span>
                  </div>
                )}
              </div>
            </button>

            {/* DOTACIÓN */}
            <button
              onClick={() => handleSelectModulo('dotacion')}
              className={`w-full flex items-center p-2 rounded-xl text-left transition-all cursor-pointer ${
                moduloActivo === 'dotacion'
                  ? 'bg-indigo-600 text-white shadow-md ring-1 ring-indigo-300'
                  : 'text-slate-200 hover:text-white hover:bg-slate-700/50'
              }`}
              title="Sistema de Dotación: Calzado, Bragas y LOPCYMAT"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded shrink-0 ${
                  moduloActivo === 'dotacion' ? 'bg-indigo-800 text-white' : 'bg-slate-800 text-indigo-300'
                }`}>
                  EPP
                </span>
                {!isCollapsed && (
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-xs text-white truncate">Dotación EPP & Uniformes</span>
                    <span className="text-[10px] text-slate-400">92.4% LOPCYMAT</span>
                  </div>
                )}
              </div>
            </button>

            {/* SIP Campo PMH */}
            <button
              onClick={() => handleSelectModulo('sip-pmh')}
              className={`w-full flex items-center p-2 rounded-xl text-left transition-all cursor-pointer ${
                moduloActivo === 'sip-pmh'
                  ? 'bg-amber-600 text-slate-950 shadow-md ring-1 ring-amber-300 font-bold'
                  : 'text-slate-200 hover:text-white hover:bg-slate-700/50'
              }`}
              title="SIP de PMH: Vales de Campo y Despachos Muelle"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded shrink-0 ${
                  moduloActivo === 'sip-pmh' ? 'bg-amber-800 text-amber-100' : 'bg-slate-800 text-amber-300'
                }`}>
                  PMH
                </span>
                {!isCollapsed && (
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-xs text-white truncate">SIP Campo PMH</span>
                    <span className="text-[10px] text-slate-400">Offline / Muelle</span>
                  </div>
                )}
              </div>
            </button>

            {/* SEGURIDAD INDUSTRIAL */}
            <button
              onClick={() => handleSelectModulo('seguridad')}
              className={`w-full flex items-center p-2 rounded-xl text-left transition-all cursor-pointer ${
                moduloActivo === 'seguridad'
                  ? 'bg-emerald-600 text-white shadow-md ring-1 ring-emerald-300'
                  : 'text-slate-200 hover:text-white hover:bg-slate-700/50'
              }`}
              title="Seguridad Industrial & HSE: PTAR, LOTOTO y Charlas"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded shrink-0 ${
                  moduloActivo === 'seguridad' ? 'bg-emerald-800 text-white' : 'bg-slate-800 text-emerald-300'
                }`}>
                  SEG
                </span>
                {!isCollapsed && (
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-xs text-white truncate">Seguridad Industrial</span>
                    <span className="text-[10px] text-slate-400">842 Días sin accidentes</span>
                  </div>
                )}
              </div>
            </button>

            {/* CERTIFICADOS */}
            <button
              onClick={() => handleSelectModulo('certificados')}
              className={`w-full flex items-center p-2 rounded-xl text-left transition-all cursor-pointer ${
                moduloActivo === 'certificados'
                  ? 'bg-indigo-600 text-white shadow-md ring-1 ring-indigo-300'
                  : 'text-slate-200 hover:text-white hover:bg-slate-700/50'
              }`}
              title="Certificados & Cursos Técnicos: 26 Grúas ASME y Soldadores"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded shrink-0 ${
                  moduloActivo === 'certificados' ? 'bg-indigo-800 text-white' : 'bg-slate-800 text-indigo-300'
                }`}>
                  CRT
                </span>
                {!isCollapsed && (
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-xs text-white truncate">Certificados & Cursos</span>
                    <span className="text-[10px] text-slate-400">26 Grúas · Soldadores</span>
                  </div>
                )}
              </div>
            </button>
          </div>

          {/* ========================================================================= */}
          {/* 4. SECCIÓN ADMINISTRACIÓN Y ARCHIVOS                                       */}
          {/* ========================================================================= */}
          <div className="pt-2 border-t border-slate-700/60 space-y-1">
            {!isCollapsed && (
              <div className="px-2 py-1 text-[11px] font-mono font-bold tracking-wider text-slate-400 uppercase">
                Administración
              </div>
            )}

            <button
              onClick={() => {
                onCambiarModulo('costos');
                setActiveTab('usuarios');
                setMobileOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'usuarios'
                  ? 'bg-slate-700 text-white font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              {!isCollapsed && <span>Usuarios & Permisos</span>}
            </button>

            {currentUser.permisos.canImportFiles && (
              <button
                onClick={() => {
                  onCambiarModulo('costos');
                  setActiveTab('importar');
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  activeTab === 'importar'
                    ? 'bg-slate-700 text-white font-bold shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <UploadCloud className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                {!isCollapsed && <span>Importar Archivos Excel</span>}
              </button>
            )}
          </div>

        </div>

        {/* ================= FOOTER DEL SIDEBAR ================= */}
        <div className="p-3 border-t border-slate-700/80 bg-[#0c1829] shrink-0">
          {!isCollapsed ? (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-8 h-8 rounded-full ${currentUser.avatarColor} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs`}>
                  {currentUser.nombre.slice(0, 1)}
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-xs text-white block truncate leading-tight">
                    {currentUser.nombre}
                  </span>
                  <span className="text-[11px] text-slate-300 block truncate leading-tight mt-0.5">
                    {currentUser.rol}
                  </span>
                </div>
              </div>

              {onLogout && (
                <button
                  onClick={onLogout}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div 
                className={`w-7 h-7 rounded-full ${currentUser.avatarColor} text-white flex items-center justify-center font-bold text-xs shadow-xs cursor-pointer`}
                title={`${currentUser.nombre} (${currentUser.rol})`}
              >
                {currentUser.nombre.slice(0, 1)}
              </div>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="p-1 text-slate-400 hover:text-rose-400 rounded transition-colors"
                  title="Salir"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

      </aside>
    </>
  );
};
