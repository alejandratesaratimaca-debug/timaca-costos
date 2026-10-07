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
  Truck,
  Cpu,
  Lock,
  Plus,
  RefreshCw,
  Archive,
  UserCheck,
  Package,
  QrCode
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
  // Estados para desplegar/colapsar submenús en el sidebar (Por defecto colapsados a petición del usuario)
  const [costosExpanded, setCostosExpanded] = useState(false);
  const [externosSubExpanded, setExternosSubExpanded] = useState(false);
  const [internosSubExpanded, setInternosSubExpanded] = useState(false);

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

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    setMobileOpen(false);
  };

  const handleSwitchEntorno = (entorno: 'externos' | 'internos') => {
    onCambiarModulo('costos');
    onCambiarEntorno(entorno);
    if (entorno === 'internos') {
      setActiveTab('internos-dashboard');
    } else {
      setActiveTab('dashboard');
    }
    setMobileOpen(false);
  };

  return (
    <>
      {/* Backdrop overlay para pantallas móviles */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Container: Aclarado a un elegante navy acero (#14243b) con tipografía más grande */}
      <aside 
        className={`fixed md:sticky top-0 left-0 z-50 h-screen flex flex-col bg-[#14243b] text-slate-100 border-r border-slate-700/70 transition-all duration-300 shadow-2xl select-none ${
          isCollapsed ? 'w-[78px]' : 'w-[305px]'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* ================= HEADER DEL SIDEBAR ================= */}
        <div className="p-4 border-b border-slate-700/70 flex items-center justify-between gap-2 shrink-0 bg-[#0e1b2d]">
          {!isCollapsed ? (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="bg-white/95 px-2 py-1 rounded-xl shadow-xs shrink-0">
                <TimacaLogo size="sm" showSubtitle={false} showRif={false} />
              </div>
              <div className="min-w-0">
                <span className="font-black text-sm text-white tracking-wider block truncate">
                  TIMACA OPERACIONES
                </span>
                <span className="text-xs text-sky-300 font-mono flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Suite 100% Operativa
                </span>
              </div>
            </div>
          ) : (
            <div className="mx-auto bg-white/95 p-1 rounded-lg shadow-xs">
              <div className="w-7 h-7 flex items-center justify-center font-black text-[#0b2545] text-sm">
                T
              </div>
            </div>
          )}

          {/* Botón Plegar / Desplegar Sidebar (Desktop) */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/60 transition-colors cursor-pointer"
            title={isCollapsed ? 'Expandir menú lateral' : 'Colapsar menú lateral'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* ================= CONTENIDO DE NAVEGACIÓN SCROLLABLE ================= */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-4.5 scrollbar-thin scrollbar-thumb-slate-700">
          
          {/* SECCIÓN 1: MÓDULOS DE LA SUITE OPERACIONAL */}
          <div className="space-y-1.5">
            {!isCollapsed && (
              <div className="px-2.5 py-1 text-xs font-mono font-bold tracking-wider text-slate-300 uppercase flex items-center justify-between">
                <span>Módulos de la Suite</span>
                <span className="text-emerald-400 font-bold">7 Activos</span>
              </div>
            )}

            {/* 1. MÓDULO RECURSOS HUMANOS [RRH] - NÚCLEO ERP */}
            <button
              onClick={() => handleSelectModulo('rrhh')}
              className={`w-full flex items-center p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                moduloActivo === 'rrhh'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40 ring-1 ring-blue-300'
                  : 'text-slate-200 hover:text-white hover:bg-slate-700/50'
              }`}
              title="Recursos Humanos · Núcleo ERP: Expedientes, Contratos, Asistencia, Cuadrillas y Selección"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <span className={`font-mono text-xs font-black px-2 py-1 rounded shrink-0 self-center ${
                  moduloActivo === 'rrhh' ? 'bg-blue-800 text-blue-100' : 'bg-slate-800/80 text-blue-300'
                }`}>
                  RRH
                </span>
                {!isCollapsed && (
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-sm text-white leading-tight">
                      Recursos Humanos
                    </span>
                    <span className={`text-[10.5px] font-mono mt-0.5 ${
                      moduloActivo === 'rrhh' ? 'text-blue-100' : 'text-blue-300/80'
                    }`}>
                      Núcleo ERP · 14 Vistas
                    </span>
                  </div>
                )}
              </div>
            </button>

            {/* 2. MÓDULO COSTOS [CST] */}
            <div className="space-y-1">
              <button
                onClick={() => {
                  if (isCollapsed) setIsCollapsed(false);
                  handleSelectModulo('costos');
                  setCostosExpanded(!costosExpanded);
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                  moduloActivo === 'costos'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40 ring-1 ring-blue-300'
                    : 'text-slate-200 hover:text-white hover:bg-slate-700/50'
                }`}
                title="Departamento de Costos: Proyectos Externos ($1.29M) e Internos ($183K)"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <span className={`font-mono text-xs font-black px-2 py-1 rounded shrink-0 self-center ${
                    moduloActivo === 'costos' ? 'bg-blue-800 text-blue-100' : 'bg-slate-800/80 text-blue-300'
                  }`}>
                    CST
                  </span>
                  {!isCollapsed && (
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-sm text-white leading-tight">
                        Costos TIMACA
                      </span>
                      <span className={`text-[10.5px] font-mono mt-0.5 ${
                        moduloActivo === 'costos' ? 'text-blue-100' : 'text-blue-300/80'
                      }`}>
                        $13.8M Acumulado
                      </span>
                    </div>
                  )}
                </div>

                {!isCollapsed && (
                  <ChevronDown className={`w-4 h-4 text-slate-300 transition-transform duration-200 shrink-0 ${costosExpanded ? 'rotate-180' : ''}`} />
                )}
              </button>

              {/* Sub-árbol de Costos (Externos vs Internos) */}
              {!isCollapsed && costosExpanded && (
                <div className="ml-3 pl-3 border-l-2 border-blue-400/40 space-y-2 py-1 text-xs">
                  
                  {/* Sub-grupo A: Proyectos Externos */}
                  <div className="space-y-1">
                    <div 
                      onClick={() => {
                        handleSwitchEntorno('externos');
                        setExternosSubExpanded(!externosSubExpanded);
                      }}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer font-bold text-xs ${
                        moduloActivo === 'costos' && !esInternos
                          ? 'text-blue-200 bg-blue-950/60'
                          : 'text-slate-300 hover:text-white hover:bg-slate-700/40'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-blue-400" />
                        <span>Proyectos Externos</span>
                      </div>
                      <span className="text-[11px] font-mono text-blue-300">$1.29M</span>
                    </div>

                    {externosSubExpanded && (
                      <div className="space-y-0.5 pl-3 border-l border-slate-700/60 text-xs">
                        <button
                          onClick={() => { onCambiarModulo('costos'); onCambiarEntorno('externos'); handleSelectTab('dashboard'); }}
                          className={`w-full text-left px-2.5 py-1.5 rounded transition-colors text-[12.5px] ${
                            activeTab === 'dashboard' && moduloActivo === 'costos' && !esInternos
                              ? 'text-white font-bold bg-slate-700/80 shadow-2xs'
                              : 'text-slate-300 hover:text-white hover:bg-slate-700/40'
                          }`}
                        >
                          Tablero Ejecutivo
                        </button>
                        <button
                          onClick={() => { onCambiarModulo('costos'); onCambiarEntorno('externos'); handleSelectTab('matriz-proyectos'); }}
                          className={`w-full text-left px-2.5 py-1.5 rounded transition-colors text-[12.5px] ${
                            activeTab === 'matriz-proyectos' && moduloActivo === 'costos'
                              ? 'text-white font-bold bg-slate-700/80 shadow-2xs'
                              : 'text-slate-300 hover:text-white hover:bg-slate-700/40'
                          }`}
                        >
                          Matriz Proyectos (PPT)
                        </button>
                        <button
                          onClick={() => { onCambiarModulo('costos'); onCambiarEntorno('externos'); handleSelectTab('proyectos'); }}
                          className={`w-full text-left px-2.5 py-1.5 rounded transition-colors text-[12.5px] ${
                            activeTab === 'proyectos' && moduloActivo === 'costos'
                              ? 'text-white font-bold bg-slate-700/80 shadow-2xs'
                              : 'text-slate-300 hover:text-white hover:bg-slate-700/40'
                          }`}
                        >
                          20 Cuentas Auxiliares
                        </button>
                        <button
                          onClick={() => { onCambiarModulo('costos'); onCambiarEntorno('externos'); handleSelectTab('mano-obra'); }}
                          className={`w-full text-left px-2.5 py-1.5 rounded transition-colors text-[12.5px] ${
                            activeTab === 'mano-obra' && moduloActivo === 'costos'
                              ? 'text-white font-bold bg-slate-700/80 shadow-2xs'
                              : 'text-slate-300 hover:text-white hover:bg-slate-700/40'
                          }`}
                        >
                          Mano de Obra Diaria
                        </button>
                        <button
                          onClick={() => { onCambiarModulo('costos'); onCambiarEntorno('externos'); handleSelectTab('informe'); }}
                          className={`w-full text-left px-2.5 py-1.5 rounded transition-colors text-[12.5px] ${
                            activeTab === 'informe' && moduloActivo === 'costos' && !esInternos
                              ? 'text-white font-bold bg-slate-700/80 shadow-2xs'
                              : 'text-slate-300 hover:text-white hover:bg-slate-700/40'
                          }`}
                        >
                          Presentación PPT (8 Láminas)
                        </button>
                        <button
                          onClick={() => { onCambiarModulo('costos'); onCambiarEntorno('externos'); handleSelectTab('tabla'); }}
                          className={`w-full text-left px-2.5 py-1.5 rounded transition-colors text-[12.5px] ${
                            activeTab === 'tabla' && moduloActivo === 'costos'
                              ? 'text-white font-bold bg-slate-700/80 shadow-2xs'
                              : 'text-slate-300 hover:text-white hover:bg-slate-700/40'
                          }`}
                        >
                          Salidas de Almacén SIP
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Sub-grupo B: Proyectos Internos */}
                  <div className="space-y-1 pt-1">
                    <div 
                      onClick={() => {
                        handleSwitchEntorno('internos');
                        setInternosSubExpanded(!internosSubExpanded);
                      }}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer font-bold text-xs ${
                        moduloActivo === 'costos' && esInternos
                          ? 'text-sky-200 bg-slate-700/60'
                          : 'text-slate-300 hover:text-white hover:bg-slate-700/40'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-sky-400" />
                        <span>Proyectos Internos</span>
                      </div>
                      <span className="text-[11px] font-mono text-sky-300">$183K</span>
                    </div>

                    {internosSubExpanded && (
                      <div className="space-y-0.5 pl-3 border-l border-slate-700/60 text-xs">
                        <button
                          onClick={() => { onCambiarModulo('costos'); onCambiarEntorno('internos'); handleSelectTab('internos-dashboard'); }}
                          className={`w-full text-left px-2.5 py-1.5 rounded transition-colors text-[12.5px] ${
                            activeTab === 'internos-dashboard' && moduloActivo === 'costos' && esInternos
                              ? 'text-white font-bold bg-slate-700/80 shadow-2xs'
                              : 'text-slate-300 hover:text-white hover:bg-slate-700/40'
                          }`}
                        >
                          Tablero CAPEX vs OPEX
                        </button>
                        <button
                          onClick={() => { onCambiarModulo('costos'); onCambiarEntorno('internos'); handleSelectTab('internos-capex'); }}
                          className={`w-full text-left px-2.5 py-1.5 rounded transition-colors text-[12.5px] ${
                            activeTab === 'internos-capex'
                              ? 'text-white font-bold bg-slate-700/80 shadow-2xs'
                              : 'text-slate-300 hover:text-white hover:bg-slate-700/40'
                          }`}
                        >
                          Obras CAPEX ($60.6K)
                        </button>
                        <button
                          onClick={() => { onCambiarModulo('costos'); onCambiarEntorno('internos'); handleSelectTab('internos-gruas'); }}
                          className={`w-full text-left px-2.5 py-1.5 rounded transition-colors text-[12.5px] ${
                            activeTab === 'internos-gruas'
                              ? 'text-white font-bold bg-slate-700/80 shadow-2xs'
                              : 'text-slate-300 hover:text-white hover:bg-slate-700/40'
                          }`}
                        >
                          Flota de 26 Grúas
                        </button>
                        <button
                          onClick={() => { onCambiarModulo('costos'); onCambiarEntorno('internos'); handleSelectTab('internos-mod'); }}
                          className={`w-full text-left px-2.5 py-1.5 rounded transition-colors text-[12.5px] ${
                            activeTab === 'internos-mod'
                              ? 'text-white font-bold bg-slate-700/80 shadow-2xs'
                              : 'text-slate-300 hover:text-white hover:bg-slate-700/40'
                          }`}
                        >
                          MOD Taller (4.697 HH)
                        </button>
                        <button
                          onClick={() => { onCambiarModulo('costos'); onCambiarEntorno('internos'); handleSelectTab('internos-ppt'); }}
                          className={`w-full text-left px-2.5 py-1.5 rounded transition-colors text-[12.5px] ${
                            activeTab === 'internos-ppt'
                              ? 'text-white font-bold bg-slate-700/80 shadow-2xs'
                              : 'text-slate-300 hover:text-white hover:bg-slate-700/40'
                          }`}
                        >
                          Dossier PPT (10 Láminas)
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>

            {/* 3. MÓDULO HERRAMIENTAS [HRM] */}
            <button
              onClick={() => handleSelectModulo('herramientas')}
              className={`w-full flex items-center p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                moduloActivo === 'herramientas'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-900/40 ring-1 ring-sky-300'
                  : 'text-slate-200 hover:text-white hover:bg-slate-700/50'
              }`}
              title="Sistema de Herramientas: Control de Cajas 01-40 y Calibración SENCAMER"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <span className={`font-mono text-xs font-black px-2 py-1 rounded shrink-0 self-center ${
                  moduloActivo === 'herramientas' ? 'bg-sky-800 text-sky-100' : 'bg-slate-800/80 text-sky-300'
                }`}>
                  HRM
                </span>
                {!isCollapsed && (
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-sm text-white leading-tight">
                      Herramientas & Taller
                    </span>
                    <span className={`text-[10.5px] font-mono mt-0.5 ${
                      moduloActivo === 'herramientas' ? 'text-sky-100' : 'text-amber-300/80'
                    }`}>
                      40 Cajas Calibradas
                    </span>
                  </div>
                )}
              </div>
            </button>

            {/* 4. MÓDULO DOTACIÓN [EPP] */}
            <button
              onClick={() => handleSelectModulo('dotacion')}
              className={`w-full flex items-center p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                moduloActivo === 'dotacion'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40 ring-1 ring-indigo-300'
                  : 'text-slate-200 hover:text-white hover:bg-slate-700/50'
              }`}
              title="Sistema de Dotación: Calzado, Bragas Gabardina y LOPCYMAT"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <span className={`font-mono text-xs font-black px-2 py-1 rounded shrink-0 self-center ${
                  moduloActivo === 'dotacion' ? 'bg-indigo-800 text-indigo-100' : 'bg-slate-800/80 text-indigo-300'
                }`}>
                  EPP
                </span>
                {!isCollapsed && (
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-sm text-white leading-tight">
                      Dotación EPP & Uniformes
                    </span>
                    <span className={`text-[10.5px] font-mono mt-0.5 ${
                      moduloActivo === 'dotacion' ? 'text-indigo-100' : 'text-emerald-300/80'
                    }`}>
                      92.4% LOPCYMAT
                    </span>
                  </div>
                )}
              </div>
            </button>

            {/* 5. MÓDULO SIP CAMPO PMH [PMH] */}
            <button
              onClick={() => handleSelectModulo('sip-pmh')}
              className={`w-full flex items-center p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                moduloActivo === 'sip-pmh'
                  ? 'bg-amber-600 text-slate-950 shadow-md shadow-amber-900/40 ring-1 ring-amber-300'
                  : 'text-slate-200 hover:text-white hover:bg-slate-700/50'
              }`}
              title="SIP de PMH Palúa: Vales de Campo, Despachos Muelle y Cola Offline"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <span className={`font-mono text-xs font-black px-2 py-1 rounded shrink-0 self-center ${
                  moduloActivo === 'sip-pmh' ? 'bg-amber-800 text-amber-100' : 'bg-slate-800/80 text-amber-300'
                }`}>
                  PMH
                </span>
                {!isCollapsed && (
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-sm text-white leading-tight">
                      SIP Campo Palúa/Pellas
                    </span>
                    <span className={`text-[10.5px] font-mono mt-0.5 ${
                      moduloActivo === 'sip-pmh' ? 'text-slate-950 font-bold' : 'text-amber-300/80'
                    }`}>
                      Offline / Muelle Palúa
                    </span>
                  </div>
                )}
              </div>
            </button>

            {/* 6. MÓDULO SEGURIDAD INDUSTRIAL & HSE [SEG] */}
            <button
              onClick={() => handleSelectModulo('seguridad')}
              className={`w-full flex items-center p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                moduloActivo === 'seguridad'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40 ring-1 ring-emerald-300'
                  : 'text-slate-200 hover:text-white hover:bg-slate-700/50'
              }`}
              title="Seguridad Industrial & HSE: PTAR, LOTOTO, Charlas 5 Minutos y LOPCYMAT"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <span className={`font-mono text-xs font-black px-2 py-1 rounded shrink-0 self-center ${
                  moduloActivo === 'seguridad' ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-800/80 text-emerald-300'
                }`}>
                  SEG
                </span>
                {!isCollapsed && (
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-sm text-white leading-tight">
                      Seguridad Industrial
                    </span>
                    <span className={`text-[10.5px] font-mono mt-0.5 ${
                      moduloActivo === 'seguridad' ? 'text-emerald-100' : 'text-emerald-300/80'
                    }`}>
                      842 Días sin accidentes
                    </span>
                  </div>
                )}
              </div>
            </button>

            {/* 7. MÓDULO CERTIFICADOS & CURSOS [CRT] */}
            <button
              onClick={() => handleSelectModulo('certificados')}
              className={`w-full flex items-center p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                moduloActivo === 'certificados'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40 ring-1 ring-indigo-300'
                  : 'text-slate-200 hover:text-white hover:bg-slate-700/50'
              }`}
              title="Certificados & Cursos Técnicos: 26 Grúas ASME, Soldadores 6G e integración Google Apps Script"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <span className={`font-mono text-xs font-black px-2 py-1 rounded shrink-0 self-center ${
                  moduloActivo === 'certificados' ? 'bg-indigo-800 text-indigo-100' : 'bg-slate-800/80 text-indigo-300'
                }`}>
                  CRT
                </span>
                {!isCollapsed && (
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-sm text-white leading-tight">
                      Certificados & Cursos
                    </span>
                    <span className={`text-[10.5px] font-mono mt-0.5 ${
                      moduloActivo === 'certificados' ? 'text-indigo-100' : 'text-indigo-300/80'
                    }`}>
                      26 Grúas · Apps Script
                    </span>
                  </div>
                )}
              </div>
            </button>
          </div>

          {/* SECCIÓN 2: AJUSTES & ADMINISTRACIÓN */}
          <div className="pt-3 border-t border-slate-700/60 space-y-1.5">
            {!isCollapsed && (
              <div className="px-2.5 py-1 text-xs font-mono font-bold tracking-wider text-slate-300 uppercase">
                Administración
              </div>
            )}

            <button
              onClick={() => handleSelectTab('usuarios')}
              className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'usuarios'
                  ? 'bg-slate-700 text-white font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
              title="Gestión de Usuarios y Roles del Sistema"
            >
              <Users className="w-4 h-4 text-slate-300 shrink-0" />
              {!isCollapsed && <span>Usuarios & Permisos</span>}
            </button>

            {currentUser.permisos.canImportFiles && (
              <button
                onClick={() => handleSelectTab('importar')}
                className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  activeTab === 'importar'
                    ? 'bg-slate-700 text-white font-bold shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
                title="Carga de Archivos Excel y Vales SIP"
              >
                <UploadCloud className="w-4 h-4 text-blue-400 shrink-0" />
                {!isCollapsed && <span>Importar Archivos SIP</span>}
              </button>
            )}
          </div>

        </div>

        {/* ================= FOOTER DEL SIDEBAR: USUARIO ACTIVO ================= */}
        <div className="p-3.5 border-t border-slate-700/70 bg-[#0e1b2d] shrink-0">
          {!isCollapsed ? (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-8 h-8 rounded-full ${currentUser.avatarColor} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs`}>
                  {currentUser.nombre.slice(0, 1)}
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-sm text-white block truncate leading-tight">
                    {currentUser.nombre}
                  </span>
                  <span className="text-xs text-slate-300 block truncate leading-tight mt-0.5">
                    {currentUser.permisos.ambitoEdicion === 'todo' && 'Control Total (Admin)'}
                    {currentUser.permisos.ambitoEdicion === 'internos' && 'Solo Internos'}
                    {currentUser.permisos.ambitoEdicion === 'ninguno' && 'Observador'}
                  </span>
                </div>
              </div>

              {onLogout && (
                <button
                  onClick={onLogout}
                  className="p-2 text-slate-300 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div 
                className={`w-8 h-8 rounded-full ${currentUser.avatarColor} text-white flex items-center justify-center font-bold text-xs shadow-xs cursor-pointer`}
                title={`${currentUser.nombre} (${currentUser.rol})`}
              >
                {currentUser.nombre.slice(0, 1)}
              </div>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="p-1.5 text-slate-300 hover:text-rose-400 rounded transition-colors"
                  title="Salir"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>

      </aside>
    </>
  );
};
