import React, { useState, useEffect } from 'react';
import { useCostos } from '../context/CostosContext';
import { exportSalidasToExcel } from '../utils/excelHandler';
import { UsuarioSistema } from '../types/usuarios';
import { 
  Plus, 
  Download,
  CheckCircle2,
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
  CalendarRange,
  CalendarDays,
  Truck
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

const TITULOS_VISTAS: Record<string, string> = {
  'dashboard': 'Dashboard General',
  'matriz-proyectos': 'Matriz de Costos por Proyecto',
  'proyectos': 'Cuentas Auxiliares',
  'mano-obra': 'Mano de Obra Directa (MOD)',
  'categorias': 'Categorías de Gasto',
  'hoja-motivos': 'Hoja de Motivos & Solicitantes',
  'informe': 'Informe Mensual',
  'semanas': 'Control Semanal',
  'meses': 'Evolución Mensual',
  'usuarios': 'Usuarios & Permisos',
  'internos-dashboard': 'Dashboard General Interno',
  'internos-capex': 'Inversiones CAPEX & Obras Civiles',
  'internos-gruas': 'Flota Pesada & Grúas OPEX',
  'internos-infra': 'Mantenimiento & Taller',
  'internos-ppt': 'Informe Gerencial PPT'
};

const MENU_EXTERNOS = [
  { id: 'dashboard', label: 'Tablero Ejecutivo', icon: LayoutDashboard, title: 'Resumen General y Tablero Ejecutivo' },
  { id: 'matriz-proyectos', label: 'Matriz de Proyectos', icon: TableProperties, title: 'Matriz Proyectos x Categorías' },
  { id: 'proyectos', label: 'Cuentas Auxiliares', icon: Briefcase, title: 'Cuentas Auxiliares & Presupuestos' },
  { id: 'mano-obra', label: 'Mano de Obra Diaria', icon: Clock, title: 'Mano de Obra Diaria (MOD Cuadrillas)' },
  { id: 'categorias', label: 'Auditoría por Categoría', icon: Layers, title: 'Auditoría por Categoría y Partidas' },
  { id: 'hoja-motivos', label: 'Hoja de Motivos', icon: FileText, title: 'Hoja de Motivos, Solicitantes y Precios', badge: 'Auditoría' },
  { id: 'informe', label: 'Presentación Ejecutiva', icon: FileText, title: 'Presentación Ejecutiva PPT' },
  { id: 'semanas', label: 'Semana a Semana', icon: CalendarRange, title: 'Evolución Semana a Semana' },
  { id: 'meses', label: 'Mes a Mes', icon: CalendarDays, title: 'Comparativa Mes a Mes' }
];

const MENU_INTERNOS = [
  { id: 'internos-dashboard', label: 'Tablero Interno', icon: LayoutDashboard, title: 'Dashboard General Interno' },
  { id: 'internos-capex', label: 'Inversiones CAPEX', icon: Building2, title: 'Inversiones CAPEX & Obras Civiles' },
  { id: 'internos-gruas', label: 'Flota Pesada & Grúas', icon: Truck, title: 'Flota Pesada & Grúas OPEX' },
  { id: 'internos-infra', label: 'Mantenimiento & Taller', icon: Wrench, title: 'Mantenimiento & Taller' },
  { id: 'internos-ppt', label: 'Informe Gerencial PPT', icon: FileText, title: 'Informe Gerencial PPT' }
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
  const { salidas, resumenSemanas, resumenMeses, resumenProyectos } = useCostos();
  const [downloadSuccess, setDownloadSuccess] = useState(false);
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

  const handleExport = () => {
    exportSalidasToExcel(salidas, resumenSemanas, resumenMeses, resumenProyectos);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3500);
  };

  return (
    <header 
      className={`sticky top-0 z-30 transition-colors duration-300 border-b shadow-xs ${
        esInternos 
          ? 'bg-[#1e293b] text-slate-100 border-slate-700/80 shadow-md' 
          : 'bg-white text-neutral-900 border-neutral-200'
      }`} 
    >
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2.5 gap-3 sm:gap-6">
          
          {/* LADO IZQUIERDO: Menú Hamburguesa Móvil + Contexto de Vista */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Botón menú móvil */}
            <button
              onClick={onToggleMobileSidebar}
              className={`md:hidden p-2 rounded-xl transition-colors cursor-pointer shrink-0 ${
                esInternos ? 'text-slate-300 hover:bg-slate-800' : 'text-neutral-700 hover:bg-neutral-100'
              }`}
              title="Abrir menú de navegación"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* MÓDULO COSTOS: Indicador de Vista Activa */}
            {moduloActivo === 'costos' ? (
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                {/* Botón Volver Universal en todas las secciones */}
                {activeTab !== 'dashboard' && activeTab !== 'internos-dashboard' && (
                  <button
                    onClick={() => setActiveTab(esInternos ? 'internos-dashboard' : 'dashboard')}
                    className="flex items-center gap-1.5 font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 hover:border-slate-400 px-3 py-1.5 rounded-xl transition-all text-xs shadow-xs shrink-0 cursor-pointer"
                    title="Volver al Dashboard General"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                    <span className="hidden sm:inline">Volver</span>
                    <span className="sm:hidden">Atrás</span>
                  </button>
                )}

                {/* Título de la Sección Activa */}
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border shrink-0 text-xs ${
                  esInternos 
                    ? 'bg-slate-800/90 border-slate-700 text-slate-200 shadow-xs' 
                    : 'bg-slate-100/90 border-slate-200 text-slate-800 shadow-xs'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${esInternos ? 'bg-sky-400' : 'bg-blue-600'}`}></span>
                  <span className="font-bold tracking-tight text-xs sm:text-sm">
                    {TITULOS_VISTAS[activeTab] || 'Control de Costos'}
                  </span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ml-1 ${
                    esInternos ? 'bg-slate-700 text-sky-300 border-slate-600' : 'bg-blue-50 text-blue-700 border-blue-200 font-bold'
                  }`}>
                    {esInternos ? 'Proyectos Internos' : 'Proyectos Externos'}
                  </span>
                </div>
              </div>
            ) : (
              /* OTROS MÓDULOS: Identificador claro del módulo actual */
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 text-white border border-slate-700 shadow-xs">
                  {moduloActivo === 'rrhh' && <Users className="w-4 h-4 text-blue-400" />}
                  {moduloActivo === 'herramientas' && <Wrench className="w-4 h-4 text-sky-400" />}
                  {moduloActivo === 'dotacion' && <ShieldCheck className="w-4 h-4 text-indigo-400" />}
                  {moduloActivo === 'sip-pmh' && <HardHat className="w-4 h-4 text-amber-400" />}
                  {moduloActivo === 'seguridad' && <Award className="w-4 h-4 text-emerald-400" />}
                  {moduloActivo === 'certificados' && <Award className="w-4 h-4 text-indigo-400" />}
                  <span className="font-bold text-xs">
                    {moduloActivo === 'rrhh' && 'Recursos Humanos · Talento TIMACA'}
                    {moduloActivo === 'herramientas' && 'Herramientas & Taller (40 Cajas)'}
                    {moduloActivo === 'dotacion' && 'Dotación EPP & Uniformes'}
                    {moduloActivo === 'sip-pmh' && 'SIP Campo PMH · Despacho Muelle'}
                    {moduloActivo === 'seguridad' && 'Seguridad Industrial & HSE'}
                    {moduloActivo === 'certificados' && 'Certificados & Cursos Técnicos'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onCambiarModulo?.('costos')}
                  className="text-xs font-semibold text-slate-600 hover:text-blue-700 bg-slate-100 hover:bg-blue-50 px-3 py-1.5 rounded-xl border border-slate-200 transition-colors cursor-pointer flex items-center gap-1"
                  title="Volver al departamento de Costos"
                >
                  <span>← Volver a Costos</span>
                </button>
              </div>
            )}
          </div>

          {/* LADO DERECHO: Acciones Contextuales y Perfil de Usuario */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {downloadSuccess && (
              <span className="hidden lg:flex items-center gap-1 text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200 animate-fade-in">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>¡Excel Descargado!</span>
              </span>
            )}



            {/* Botón Nueva Salida SIP */}
            {currentUser.permisos.canCreateSalidas && !esInternos && moduloActivo === 'costos' && (
              <button
                onClick={onOpenNewSalida}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs whitespace-nowrap cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-white" />
                <span className="hidden sm:inline">Nueva Salida</span>
              </button>
            )}

            {/* Pastilla de Usuario Activo con Hora y Fecha al lado */}
            <div className="flex items-center gap-2">
              {/* Reloj y Fecha en tiempo real al lado del nombre (Siempre visible) */}
              <div 
                className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-mono shadow-xs select-none transition-colors ${
                  esInternos 
                    ? 'bg-slate-800 border-slate-700 text-slate-200' 
                    : 'bg-blue-50/90 border-blue-200 text-slate-800'
                }`}
                title="Hora oficial de Venezuela y fecha actual"
              >
                <div className="flex items-center gap-1.5 font-bold text-blue-700">
                  <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>{formattedTime}</span>
                </div>
                <span className="text-slate-300 hidden sm:inline">|</span>
                <div className="hidden sm:flex items-center gap-1.5 font-semibold text-slate-600">
                  <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{formattedDate}</span>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('usuarios')}
                title="Ver perfil y permisos"
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-colors text-xs cursor-pointer ${
                  esInternos
                    ? 'bg-slate-800/90 hover:bg-slate-750 border-slate-700 text-slate-200'
                    : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-800'
                }`}
              >
                <div className={`w-5 h-5 rounded-full ${currentUser.avatarColor} text-white flex items-center justify-center font-bold text-[10px]`}>
                  {currentUser.nombre.slice(0, 1)}
                </div>
                <span className="font-semibold hidden sm:inline">{currentUser.nombre}</span>
                <span className={`text-[10px] hidden md:inline ${esInternos ? 'text-slate-400' : 'text-neutral-500'}`}>({currentUser.rol})</span>
              </button>

              {onLogout && (
                <button
                  onClick={onLogout}
                  title="Cerrar sesión"
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    esInternos
                      ? 'bg-slate-800/90 hover:bg-rose-950/50 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-700/60 shadow-2xs'
                      : 'bg-rose-50/80 hover:bg-rose-100 text-rose-700 hover:text-rose-800 border border-rose-200 shadow-2xs'
                  }`}
                >
                  <LogOut className={`w-3.5 h-3.5 ${esInternos ? 'text-rose-400' : 'text-rose-600'}`} />
                  <span className="hidden md:inline">Salir</span>
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* MENÚ HORIZONTAL DE NAVEGACIÓN */}
      {moduloActivo === 'costos' && (
        <div className={`border-t transition-colors ${
          esInternos 
            ? 'bg-slate-900/95 border-slate-700/80 shadow-inner' 
            : 'bg-slate-50/95 border-slate-200/90 shadow-2xs'
        }`}>
          <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
            {!esInternos ? (
              <>
                {MENU_EXTERNOS.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                        isActive
                          ? 'bg-blue-600 text-white font-bold shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-300'
                      }`}
                      title={item.title}
                    >
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : item.id === 'hoja-motivos' ? 'text-orange-500' : 'text-slate-500'}`} />
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                          isActive 
                            ? 'bg-blue-800 text-blue-100' 
                            : 'bg-orange-100 text-orange-800 border border-orange-200'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </>
            ) : (
              <>
                {MENU_INTERNOS.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                        isActive
                          ? 'bg-sky-500 text-white font-bold shadow-xs'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700'
                      }`}
                      title={item.title}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
