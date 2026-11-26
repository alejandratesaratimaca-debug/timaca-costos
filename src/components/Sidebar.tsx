import React, { useState } from 'react';
import { UsuarioSistema } from '../types/usuarios';
import { SuiteModulo } from '../types/suite';
import { 
  Building2, 
  Wrench, 
  ShieldCheck, 
  HardHat, 
  Award, 
  ChevronRight, 
  ChevronLeft,
  ChevronDown,
  Layers, 
  Clock, 
  FileText, 
  TableProperties, 
  Users, 
  LogOut, 
  Briefcase,
  LayoutDashboard,
  Database,
  Truck,
  Presentation,
  Tv,
  CheckCircle2,
  DollarSign,
  Zap
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
  const esInternos = entornoActivo === 'internos';

  // Manejador centralizado de navegación
  const handleNav = (tabId: string, modulo: SuiteModulo = 'costos', entorno?: 'externos' | 'internos') => {
    onCambiarModulo(modulo);
    if (entorno) {
      onCambiarEntorno(entorno);
    }
    setActiveTab(tabId);
    setMobileOpen(false);
  };

  // Ítems de navegación estilo portal Daniela Riveros
  // Cada ítem tiene su paleta de color pastel exacta, ícono squircle y badge
  const NAV_ITEMS = [
    {
      id: 'dashboard',
      label: 'Tablero Ejecutivo',
      sublabel: 'Resumen CAPEX, OPEX y Obras',
      icon: LayoutDashboard,
      color: '#0f1e36',
      bgActive: 'bg-[#0f1e36] text-white shadow-md ring-2 ring-slate-900/10',
      bgInactive: 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/80',
      isActive: moduloActivo === 'costos' && (activeTab === 'dashboard' || activeTab === 'internos-dashboard'),
      onClick: () => handleNav(esInternos ? 'internos-dashboard' : 'dashboard', 'costos')
    },
    {
      id: 'informe',
      label: 'Presentación Gerencial (PPT)',
      sublabel: 'Dossier de Láminas Ejecutivas',
      icon: Presentation,
      color: '#06b6d4',
      bgActive: 'bg-[#0f1e36] text-white shadow-md ring-2 ring-cyan-500/30',
      bgInactive: 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border border-cyan-200/80',
      isActive: moduloActivo === 'costos' && (activeTab === 'informe' || activeTab === 'internos-ppt'),
      onClick: () => handleNav(esInternos ? 'internos-ppt' : 'informe', 'costos')
    },
    {
      id: 'proyectos',
      label: 'Matriz Proyectos & Categorías',
      sublabel: 'Cuentas Auxiliares y 5 Rubros',
      icon: TableProperties,
      color: '#0d9488',
      bgActive: 'bg-[#0f1e36] text-white shadow-md ring-2 ring-teal-500/30',
      bgInactive: 'bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200/80',
      isActive: moduloActivo === 'costos' && (activeTab === 'proyectos' || activeTab === 'matriz-proyectos' || activeTab === 'categorias' || activeTab === 'desglose-partida'),
      onClick: () => handleNav('proyectos', 'costos', 'externos')
    },
    {
      id: 'internos-flota',
      label: 'Control Flota Pesada & Grúas',
      sublabel: 'Activos OPEX y Reclasificación NIC 16',
      icon: Truck,
      color: '#d97706',
      bgActive: 'bg-[#0f1e36] text-white shadow-md ring-2 ring-amber-500/30',
      bgInactive: 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200/80',
      isActive: moduloActivo === 'costos' && (activeTab === 'internos-flota' || activeTab === 'internos-gruas'),
      onClick: () => handleNav('internos-gruas', 'costos', 'internos')
    },
    {
      id: 'herramientas',
      label: 'Herramientas & Taller',
      sublabel: 'Control de 40 Cajas Calibradas',
      icon: Wrench,
      color: '#2563eb',
      bgActive: 'bg-[#0f1e36] text-white shadow-md ring-2 ring-blue-500/30',
      bgInactive: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/80',
      isActive: moduloActivo === 'herramientas',
      onClick: () => handleNav('herramientas', 'herramientas')
    },
    {
      id: 'internos-infra',
      label: 'Infraestructura & Planta',
      sublabel: 'Mantenimiento Mecánico y Civil',
      icon: Building2,
      color: '#059669',
      bgActive: 'bg-[#0f1e36] text-white shadow-md ring-2 ring-emerald-500/30',
      bgInactive: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/80',
      isActive: moduloActivo === 'costos' && activeTab === 'internos-infra',
      onClick: () => handleNav('internos-infra', 'costos', 'internos')
    },
    {
      id: 'seguridad-dotacion',
      label: 'Dotación EPP & Seguridad',
      sublabel: 'LOPCYMAT, HSE y Certificados',
      icon: HardHat,
      color: '#0284c7',
      bgActive: 'bg-[#0f1e36] text-white shadow-md ring-2 ring-sky-500/30',
      bgInactive: 'bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200/80',
      isActive: moduloActivo === 'dotacion' || moduloActivo === 'seguridad' || moduloActivo === 'certificados',
      onClick: () => handleNav('dotacion', 'dotacion')
    },
    {
      id: 'sigma-sip',
      label: '⚡ SIGMA (SIP Real)',
      sublabel: 'Almacén, Servicios y Compras',
      icon: Zap,
      color: '#6366f1',
      bgActive: 'bg-[#0f1e36] text-white shadow-md ring-2 ring-indigo-500/30',
      bgInactive: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200/80',
      isActive: moduloActivo === 'costos' && activeTab === 'sigma-sip',
      onClick: () => handleNav('sigma-sip', 'costos')
    },
    {
      id: 'unificada-sip',
      label: 'Master Unificado SIP',
      sublabel: 'Sábana 147k filas y Vales en Vivo',
      icon: Database,
      color: '#4f46e5',
      bgActive: 'bg-[#0f1e36] text-white shadow-md ring-2 ring-indigo-500/30',
      bgInactive: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200/80',
      isActive: moduloActivo === 'costos' && activeTab === 'unificada-sip',
      onClick: () => handleNav('unificada-sip', 'costos')
    }
  ];

  return (
    <>
      {/* Backdrop overlay para móviles */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Container: Fondo Blanco Limpio idéntico a Daniela Riveros */}
      <aside 
        className={`fixed md:sticky top-0 left-0 z-50 h-screen flex flex-col bg-white text-slate-800 border-r border-slate-200 transition-all duration-300 shadow-sm select-none ${
          isCollapsed ? 'w-[74px]' : 'w-[280px]'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* ================= HEADER DEL SIDEBAR: BOTÓN COLAPSAR/EXPANDIR ================= */}
        <div className="h-14 border-b border-slate-100 flex items-center justify-between px-3.5 shrink-0">
          {!isCollapsed ? (
            <div className="flex items-center justify-between w-full">
              <span className="font-heading font-black text-xs uppercase tracking-wider text-slate-400">
                Menú de Navegación
              </span>
              <button
                onClick={() => setIsCollapsed(true)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Comprimir menú lateral"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="w-full flex items-center justify-center">
              <button
                onClick={() => setIsCollapsed(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Expandir menú lateral"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* ================= LISTADO DE MÓDULOS SQUIRCLE PASTEL ================= */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-2.5 space-y-2 scrollbar-thin scrollbar-thumb-slate-200">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = item.isActive;

            return (
              <button
                key={item.id}
                onClick={item.onClick}
                className={`w-full flex items-center rounded-2xl transition-all cursor-pointer group ${
                  isCollapsed ? 'justify-center p-1' : 'gap-3 p-2 text-left'
                } ${
                  active 
                    ? item.bgActive 
                    : `${item.bgInactive} hover:scale-[1.02]`
                }`}
                title={item.label}
              >
                {/* Ícono Squircle */}
                <div 
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform ${
                    active 
                      ? 'bg-white/10 text-white' 
                      : ''
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                {/* Etiquetas completas cuando está expandido */}
                {!isCollapsed && (
                  <div className="min-w-0 flex-1">
                    <span className={`font-bold text-xs block truncate ${
                      active ? 'text-white' : 'text-slate-900'
                    }`}>
                      {item.label}
                    </span>
                    <span className={`text-[10px] block truncate ${
                      active ? 'text-slate-300' : 'text-slate-500'
                    }`}>
                      {item.sublabel}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* ================= FOOTER DEL SIDEBAR: USUARIO / SESIÓN ================= */}
        <div className="p-2.5 border-t border-slate-100 space-y-1 shrink-0">
          {/* Botón Perfil de Usuario */}
          <button
            onClick={() => handleNav('usuarios', 'costos')}
            className={`w-full flex items-center rounded-xl p-2 transition-all cursor-pointer hover:bg-slate-100 ${
              isCollapsed ? 'justify-center' : 'gap-2.5 text-left'
            } ${activeTab === 'usuarios' ? 'bg-slate-100 ring-1 ring-slate-300' : ''}`}
            title="Administración de Usuarios y Permisos"
          >
            <div className={`w-8 h-8 rounded-full ${currentUser.avatarColor || 'bg-blue-600'} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs`}>
              {currentUser.nombre.slice(0, 1)}
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <span className="font-bold text-xs text-slate-800 block truncate">
                  {currentUser.nombre}
                </span>
                <span className="text-[10px] text-slate-400 block truncate">
                  {currentUser.rol}
                </span>
              </div>
            )}
          </button>

          {/* Botón Salir */}
          {onLogout && (
            <button
              onClick={onLogout}
              className={`w-full flex items-center rounded-xl p-2 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer ${
                isCollapsed ? 'justify-center' : 'gap-2 text-xs font-semibold'
              }`}
              title="Cerrar sesión del sistema"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>Cerrar Sesión</span>}
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
