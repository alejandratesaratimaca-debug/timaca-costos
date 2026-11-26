import React, { useState, useEffect } from 'react';
import { useCostos } from '../context/CostosContext';
import { exportSalidasToExcel } from '../utils/excelHandler';
import { UsuarioSistema } from '../types/usuarios';
import { 
  Plus, 
  Menu, 
  LogOut, 
  Building2, 
  Wrench, 
  ShieldCheck, 
  HardHat, 
  Award, 
  Users, 
  Clock, 
  Calendar, 
  ArrowLeft, 
  LayoutDashboard, 
  TableProperties, 
  Briefcase, 
  Layers, 
  FileText, 
  Truck, 
  Database, 
  DollarSign,
  Presentation
} from 'lucide-react';
import { SuiteModulo } from '../types/suite';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenNewSalida: () => void;
  onOpenImport: () => void;
  currentUser: UsuarioSistema;
  onLogout?: () => void;
  entornoActivo?: 'externos' | 'internos';
  onCambiarEntorno?: (entorno: 'externos' | 'internos') => void;
  moduloActivo?: SuiteModulo;
  onCambiarModulo?: (modulo: SuiteModulo) => void;
  onToggleMobileSidebar?: () => void;
}

const MENU_EXTERNOS = [
  { id: 'dashboard', label: 'Tablero Ejecutivo', icon: LayoutDashboard, title: 'Resumen General, Evolución Mes a Mes y Control Semanal' },
  { id: 'unificada-sip', label: 'Sábana Master Unificado', icon: Database, title: 'Consolidado Maestro 35 Columnas & SIP en Vivo', badge: '147.5k filas' },
  { id: 'proyectos', label: 'Matriz de Costos por Proyecto', icon: TableProperties, title: 'Cuentas Auxiliares, Matriz de Proyectos y Auditoría por Categoría' },
  { id: 'mano-obra', label: 'Mano de Obra (MOD)', icon: Clock, title: 'Mano de Obra Directa, Devengo 30/31 Días y Carga RRHH' },
  { id: 'informe', label: 'Presentación PPT', icon: Presentation, title: 'Presentación Ejecutiva PPT' }
];

const MENU_INTERNOS = [
  { id: 'internos-dashboard', label: 'Resumen CAPEX & OPEX', icon: LayoutDashboard, title: 'Control CAPEX & OPEX Octubre 2026' },
  { id: 'unificada-sip', label: 'Sábana Master Unificado', icon: Database, title: 'Consolidado Maestro 35 Columnas & SIP en Vivo', badge: '147.5k filas' },
  { id: 'catalogo-precios', label: 'Catálogo de Precios', icon: DollarSign, title: 'Catálogo & Auditoría de Precios SIP (OC vs Despachos)', badge: 'Precios' },
  { id: 'internos-capex', label: 'Inversiones CAPEX', icon: Building2, title: 'Inversiones CAPEX & Obras Civiles' },
  { id: 'internos-gruas', label: 'Flota Pesada & Grúas', icon: Truck, title: 'Flota Pesada & Grúas OPEX' },
  { id: 'internos-infra', label: 'Mantenimiento & Taller', icon: Wrench, title: 'Mantenimiento & Taller' },
  { id: 'internos-ppt', label: 'Dossier Gerencial PPT', icon: Presentation, title: 'Dossier Gerencial PPT' }
];

export const Header: React.FC<HeaderProps> = ({
  activeTab = 'dashboard',
  setActiveTab,
  onOpenNewSalida,
  currentUser,
  onLogout,
  entornoActivo = 'externos',
  onCambiarEntorno,
  moduloActivo = 'costos',
  onCambiarModulo,
  onToggleMobileSidebar
}) => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = currentDateTime.toLocaleTimeString('es-VE', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    hour12: true 
  });

  const formattedDate = currentDateTime.toLocaleDateString('es-VE', { 
    weekday: 'short', 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  });

  const esInternos = entornoActivo === 'internos';

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/90 shadow-xs select-none">
      {/* 1. FILA SUPERIOR: LOGO OFICIAL TIMACA + TÍTULO DEL SISTEMA (ESTILO DANIELA RIVEROS) */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2.5 gap-4">
          
          {/* LADO IZQUIERDO: LOGO INSTITUCIONAL + TÍTULO OFICIAL */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Botón menú móvil */}
            <button
              onClick={onToggleMobileSidebar}
              className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
              title="Abrir menú de navegación"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Logotipo Oficial TIMACA con subtítulo como Daniela Riveros */}
            <div className="flex items-center gap-3 min-w-0">
              <img
                src="/timaca-logo.png"
                alt="TIMACA"
                className="h-10 sm:h-12 w-auto object-contain shrink-0 drop-shadow-xs"
              />
              <div className="h-9 w-px bg-slate-300 hidden sm:block shrink-0" />
              <div className="hidden sm:flex flex-col justify-center min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-sm sm:text-base lg:text-lg font-black text-slate-900 tracking-tight leading-tight whitespace-nowrap">
                    SISTEMA DE GESTIÓN Y AUDITORÍA DE COSTOS
                  </h1>
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                    2026
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium leading-tight truncate">
                  Master Unificado • Consulta Rápida en Vivo • Sin congelamientos de Excel
                </p>
              </div>
            </div>
          </div>

          {/* LADO DERECHO: HORA/FECHA + USUARIO + NUEVA SALIDA */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Switch de Entorno: Externos vs Internos */}
            {onCambiarEntorno && (
              <div className="hidden xl:inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
                <button
                  onClick={() => onCambiarEntorno('externos')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    !esInternos 
                      ? 'bg-white text-slate-900 shadow-xs font-black' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Proyectos Externos
                </button>
                <button
                  onClick={() => onCambiarEntorno('internos')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    esInternos 
                      ? 'bg-white text-slate-900 shadow-xs font-black' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Proyectos Internos
                </button>
              </div>
            )}

            {/* Reloj y Fecha */}
            <div 
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono text-slate-700 shadow-2xs select-none"
              title="Hora oficial de Venezuela y fecha actual"
            >
              <div className="flex items-center gap-1.5 font-bold text-blue-700">
                <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>{formattedTime}</span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1.5 font-semibold text-slate-600">
                <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{formattedDate}</span>
              </div>
            </div>

            {/* Botón Nueva Salida */}
            {currentUser.permisos.canCreateSalidas && !esInternos && moduloActivo === 'costos' && (
              <button
                onClick={onOpenNewSalida}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-xs whitespace-nowrap cursor-pointer active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 text-white" />
                <span className="hidden sm:inline">Nueva Salida</span>
              </button>
            )}

            {/* Usuario Activo */}
            <button
              onClick={() => setActiveTab('usuarios')}
              title="Ver perfil y permisos"
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs cursor-pointer shadow-2xs transition-colors"
            >
              <div className={`w-6 h-6 rounded-full ${currentUser.avatarColor || 'bg-blue-600'} text-white flex items-center justify-center font-bold text-[10px]`}>
                {currentUser.nombre.slice(0, 1)}
              </div>
              <span className="font-semibold hidden sm:inline">{currentUser.nombre}</span>
              <span className="text-[10px] hidden md:inline text-slate-400">({currentUser.rol})</span>
            </button>

            {/* Cerrar Sesión */}
            {onLogout && (
              <button
                onClick={onLogout}
                title="Cerrar sesión"
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 shadow-2xs transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-600" />
                <span className="hidden md:inline">Salir</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. FILA INFERIOR: SUBNAV TABS IDÉNTICO A DANIELA RIVEROS */}
      {moduloActivo === 'costos' && (
        <div className="border-t border-slate-200 bg-white shadow-2xs">
          <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth">
            {(!esInternos ? MENU_EXTERNOS : MENU_INTERNOS).map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id || 
                (item.id === 'dashboard' && (activeTab === 'semanas' || activeTab === 'meses')) ||
                (item.id === 'proyectos' && (activeTab === 'matriz-proyectos' || activeTab === 'categorias' || activeTab === 'desglose-partida')) ||
                (item.id === 'informe' && activeTab === 'catalogo-precios');

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold whitespace-nowrap transition-all border-b-2 cursor-pointer shrink-0 ${
                    isActive
                      ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                  title={item.title}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full uppercase ${
                      isActive 
                        ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
