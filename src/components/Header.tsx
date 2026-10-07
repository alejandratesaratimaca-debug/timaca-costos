import React, { useState } from 'react';
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
  Users
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
  'tabla': 'Salidas de Almacén SIP',
  'informe': 'Informe Mensual',
  'semanas': 'Control Semanal',
  'meses': 'Evolución Mensual',
  'usuarios': 'Usuarios & Permisos',
  'internos-dashboard': 'Dashboard General Interno',
  'internos-capex': 'Inversiones CAPEX & Obras Civiles',
  'internos-gruas': 'Flota Pesada & Grúas OPEX',
  'internos-infra': 'Mantenimiento & Taller',
  'internos-ppt': 'Informe Gerencial PPT',
};

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
          
          {/* LADO IZQUIERDO: Menú Hamburguesa Móvil + Contexto de Vista + Selector Primario */}
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

            {/* MÓDULO COSTOS: Indicador de Vista Activa + Switch Externos/Internos */}
            {moduloActivo === 'costos' ? (
              <div className="flex items-center gap-3 min-w-0">
                {/* Título de la Sección Activa (Desktop) */}
                <div className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl border shrink-0 text-xs ${
                  esInternos 
                    ? 'bg-slate-800/90 border-slate-700 text-slate-200 shadow-xs' 
                    : 'bg-slate-100/90 border-slate-200 text-slate-800 shadow-xs'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${esInternos ? 'bg-sky-400' : 'bg-blue-600'}`}></span>
                  <span className="font-bold tracking-tight">
                    {TITULOS_VISTAS[activeTab] || 'Control de Costos'}
                  </span>
                </div>

                {/* Switch elegante de Proyectos Externos vs Internos */}
                <div 
                  className="flex items-center p-1 rounded-xl border shadow-inner transition-colors shrink-0"
                  style={{
                    backgroundColor: esInternos ? '#0f172a' : '#f1f5f9',
                    borderColor: esInternos ? '#334155' : '#cbd5e1'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => onCambiarEntorno?.('externos')}
                    className={`px-3 sm:px-4 py-1.5 rounded-lg font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                      !esInternos
                        ? 'bg-blue-600 text-white shadow-xs ring-1 ring-blue-400'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                    title="Ir a Proyectos Externos ($1.29M)"
                  >
                    <Building2 className={`w-3.5 h-3.5 ${!esInternos ? 'text-white' : 'text-slate-400'}`} />
                    <span className="tracking-tight">PROYECTOS EXTERNOS</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded hidden sm:inline ${
                      !esInternos ? 'bg-blue-700 text-blue-100' : 'bg-slate-800 text-slate-400'
                    }`}>
                      $1.29M
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onCambiarEntorno?.('internos')}
                    className={`px-3 sm:px-4 py-1.5 rounded-lg font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                      esInternos
                        ? 'bg-slate-700 text-white shadow-xs ring-1 ring-sky-400'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                    title="Ir a Proyectos Internos ($183K)"
                  >
                    <Wrench className={`w-3.5 h-3.5 ${esInternos ? 'text-sky-300' : 'text-slate-500'}`} />
                    <span className="tracking-tight">PROYECTOS INTERNOS</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded hidden sm:inline ${
                      esInternos ? 'bg-slate-800 text-sky-300' : 'bg-slate-300 text-slate-700'
                    }`}>
                      $183K
                    </span>
                  </button>
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
                    {moduloActivo === 'sip-pmh' && 'SIP Campo Palúa · Despacho Muelle'}
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

            {/* Botón Descargar Excel */}
            {currentUser.permisos.canExportExcel && !esInternos && moduloActivo === 'costos' && (
              <button
                onClick={handleExport}
                title="Descargar base de datos completa y resúmenes en Excel (.xlsx)"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-white hover:bg-neutral-50 border border-neutral-300 rounded-lg transition-colors shadow-2xs whitespace-nowrap cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Descargar Excel</span>
              </button>
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

            {/* Pastilla de Usuario Activo */}
            <div className="flex items-center gap-1.5">
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
    </header>
  );
};
