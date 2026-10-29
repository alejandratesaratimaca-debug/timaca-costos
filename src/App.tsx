/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { CostosProvider } from './context/CostosContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LoginPortadaView } from './components/LoginPortadaView';
import { VersionUpdateNotifier } from './components/VersionUpdateNotifier';
import { SalidaCosto } from './types/costos';
import { UsuarioSistema, USUARIOS_INICIALES_TIMACA } from './types/usuarios';
import { SuiteModulo } from './types/suite';
import { 
  FolderCheck, 
  ArrowLeft, 
  AlertTriangle,
  LayoutDashboard,
  CalendarDays,
  CalendarRange,
  Briefcase,
  TableProperties,
  Layers,
  FileText,
  DollarSign,
  Clock
} from 'lucide-react';
import { restaurarSesion, cerrarSesion } from './lib/auth';

// Lazy loaded views for ultra-fast bundle load and isolated memory consumption
const DashboardView = lazy(() => import('./components/DashboardView').then(m => ({ default: m.DashboardView })));
const DashboardInternosView = lazy(() => import('./components/DashboardInternosView').then(m => ({ default: m.DashboardInternosView })));
const InformeInternosPPTView = lazy(() => import('./components/InformeInternosPPTView').then(m => ({ default: m.InformeInternosPPTView })));
const ProyectosView = lazy(() => import('./components/ProyectosView').then(m => ({ default: m.ProyectosView })));
const SemanaSemanaView = lazy(() => import('./components/SemanaSemanaView').then(m => ({ default: m.SemanaSemanaView })));
const MesMesView = lazy(() => import('./components/MesMesView').then(m => ({ default: m.MesMesView })));
const InformeMensualView = lazy(() => import('./components/InformeMensualView').then(m => ({ default: m.InformeMensualView })));
const CategoriaDetalleView = lazy(() => import('./components/CategoriaDetalleView').then(m => ({ default: m.CategoriaDetalleView })));
const MatrizProyectosCategoriasView = lazy(() => import('./components/MatrizProyectosCategoriasView').then(m => ({ default: m.MatrizProyectosCategoriasView })));
const DesglosePartidaView = lazy(() => import('./components/DesglosePartidaView').then(m => ({ default: m.DesglosePartidaView })));
const ManoObraDiariaView = lazy(() => import('./components/ManoObraDiariaView').then(m => ({ default: m.ManoObraDiariaView })));
const UsuariosView = lazy(() => import('./components/UsuariosView').then(m => ({ default: m.UsuariosView })));
const MasterUnificadoSipView = lazy(() => import('./components/MasterUnificadoSipView').then(m => ({ default: m.MasterUnificadoSipView })));
const CatalogoPreciosView = lazy(() => import('./components/CatalogoPreciosView').then(m => ({ default: m.CatalogoPreciosView })));
const HerramientasModuleView = lazy(() => import('./components/herramientas/HerramientasModuleView').then(m => ({ default: m.HerramientasModuleView })));
const DotacionModuleView = lazy(() => import('./components/dotacion/DotacionModuleView').then(m => ({ default: m.DotacionModuleView })));
const SeguridadModuleView = lazy(() => import('./components/seguridad/SeguridadModuleView').then(m => ({ default: m.SeguridadModuleView })));
const CertificadosModuleView = lazy(() => import('./components/certificados/CertificadosModuleView').then(m => ({ default: m.CertificadosModuleView })));
const SIPPmhModuleView = lazy(() => import('./components/sip-pmh/SIPPmhModuleView').then(m => ({ default: m.SIPPmhModuleView })));
const RRHHModuleView = lazy(() => import('./components/rrhh/RRHHModuleView').then(m => ({ default: m.RRHHModuleView })));
const ImportModal = lazy(() => import('./components/ImportModal').then(m => ({ default: m.ImportModal })));
const SalidaFormModal = lazy(() => import('./components/SalidaFormModal').then(m => ({ default: m.SalidaFormModal })));

function ViewLoader({ message = 'Cargando módulo...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[380px] p-8 text-center animate-fadeIn">
      <div className="w-10 h-10 rounded-full border-3 border-blue-100 border-t-blue-600 animate-spin mb-3" />
      <p className="text-xs font-bold text-slate-700 tracking-tight">{message}</p>
      <p className="text-[11px] text-slate-400 mt-0.5">Preparando datos del sistema TIMACA</p>
    </div>
  );
}

interface ContentErrorBoundaryProps {
  children: React.ReactNode;
  activeKey: string;
  onResetToDashboard: () => void;
}

interface ContentErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorKey: string;
}

class ContentErrorBoundary extends React.Component<ContentErrorBoundaryProps, ContentErrorBoundaryState> {
  constructor(props: ContentErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorKey: props.activeKey };
  }

  static getDerivedStateFromError(error: Error): Partial<ContentErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error capturado en vista:', error, errorInfo);
  }

  componentDidUpdate(prevProps: ContentErrorBoundaryProps) {
    if (prevProps.activeKey !== this.props.activeKey && this.state.hasError) {
      this.setState({ hasError: false, error: null, errorKey: this.props.activeKey });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-amber-200 shadow-sm max-w-2xl mx-auto my-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Observación en la vista seleccionada</h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Ocurrió un detalle al procesar los datos de esta sección. Puedes reintentar o regresar al menú principal; los demás módulos continúan operativos.
            </p>
          </div>
          {this.state.error && (
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-left text-xs font-mono text-slate-700 overflow-x-auto max-h-36 select-all">
              {this.state.error.message}
            </div>
          )}
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-slate-300"
            >
              Reintentar Vista
            </button>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                this.props.onResetToDashboard();
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer"
            >
              Volver al Dashboard Principal
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const AUTH_STATE_STORAGE_KEY = 'TIMACA_AUTH_STATE_ACTIVE_V1';
const ACTIVE_USER_STORAGE_KEY = 'TIMACA_ACTIVE_USER_ID_V7_PERMISOS_HSE';
const ACTIVE_TAB_STORAGE_KEY = 'TIMACA_ACTIVE_TAB_NAV';
const ACTIVE_CAT_STORAGE_KEY = 'TIMACA_ACTIVE_CAT_NAV';
const ACTIVE_PARTIDA_STORAGE_KEY = 'TIMACA_ACTIVE_PARTIDA_NAV';
const ENTORNO_STORAGE_KEY = 'TIMACA_ENTORNO_ACTIVO';
const MODULO_STORAGE_KEY = 'TIMACA_MODULO_SUITE_ACTIVO';

function AppContent() {
  // Estado del Menú Lateral (Sidebar): Inicia comprimido por defecto al entrar al sistema
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    const saved = localStorage.getItem('TIMACA_SIDEBAR_COLLAPSED');
    return saved !== null ? saved === 'true' : true;
  });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleToggleSidebarCollapsed = (collapsed: boolean) => {
    localStorage.setItem('TIMACA_SIDEBAR_COLLAPSED', String(collapsed));
    setSidebarCollapsed(collapsed);
  };

  // Separador de Suite Macro (Costos, Herramientas, Dotación, SIP PMH, Seguridad)
  const [moduloActivo, setModuloActivoState] = useState<SuiteModulo>(() => {
    return (localStorage.getItem(MODULO_STORAGE_KEY) as SuiteModulo) || 'costos';
  });

  const handleCambiarModulo = (nuevoModulo: SuiteModulo) => {
    localStorage.setItem(MODULO_STORAGE_KEY, nuevoModulo);
    setModuloActivoState(nuevoModulo);
  };

  // Separación Primaria: Proyectos Externos (Obras/Clientes) vs Proyectos Internos (Planta/Flota)
  const [entornoActivo, setEntornoActivoState] = useState<'externos' | 'internos'>(() => {
    return (localStorage.getItem(ENTORNO_STORAGE_KEY) as 'externos' | 'internos') || 'externos';
  });

  const handleCambiarEntorno = (nuevoEntorno: 'externos' | 'internos') => {
    if (currentUser?.permisos?.ambitoEdicion === 'externos' && nuevoEntorno === 'internos') {
      return; // Bloqueado: acceso restringido a proyectos externos
    }
    if (currentUser?.permisos?.ambitoEdicion === 'internos' && nuevoEntorno === 'externos') {
      return; // Bloqueado: acceso restringido a proyectos internos
    }
    localStorage.setItem(ENTORNO_STORAGE_KEY, nuevoEntorno);
    setEntornoActivoState(nuevoEntorno);
    if (nuevoEntorno === 'internos') {
      setActiveTab('internos-dashboard');
    } else {
      setActiveTab('dashboard');
    }
  };

  // Subtabs para vistas agrupadas en Costos Externos
  const [dashboardSubTab, setDashboardSubTab] = useState<'resumen' | 'meses' | 'semanas'>(() => {
    const saved = localStorage.getItem(ACTIVE_TAB_STORAGE_KEY);
    if (saved === 'semanas') return 'semanas';
    if (saved === 'meses') return 'meses';
    return 'resumen';
  });

  const [proyectosSubTab, setProyectosSubTab] = useState<'cuentas' | 'matriz' | 'categorias' | 'desglose'>(() => {
    const saved = localStorage.getItem(ACTIVE_TAB_STORAGE_KEY);
    if (saved === 'matriz-proyectos') return 'matriz';
    if (saved === 'categorias') return 'categorias';
    if (saved === 'desglose-partida') return 'desglose';
    return 'cuentas';
  });

  const [informeSubTab, setInformeSubTab] = useState<'ppt' | 'catalogo'>(() => {
    const saved = localStorage.getItem(ACTIVE_TAB_STORAGE_KEY);
    if (saved === 'catalogo-precios') return 'catalogo';
    return 'ppt';
  });

  const [activeTab, setActiveTabState] = useState<string>(() => {
    const saved = localStorage.getItem(ACTIVE_TAB_STORAGE_KEY);
    const savedEntorno = localStorage.getItem(ENTORNO_STORAGE_KEY);
    if (savedEntorno === 'internos') {
      return saved && saved.startsWith('internos-') ? saved : 'internos-dashboard';
    }
    if (saved === 'hoja-motivos') return 'unificada-sip';
    if (saved === 'semanas' || saved === 'meses') return 'dashboard';
    if (saved === 'matriz-proyectos' || saved === 'categorias' || saved === 'desglose-partida') return 'proyectos';
    if (saved === 'catalogo-precios') return 'informe';
    return saved || 'dashboard';
  });

  const setActiveTab = (tab: string) => {
    if (tab === 'semanas') {
      localStorage.setItem(ACTIVE_TAB_STORAGE_KEY, 'dashboard');
      setActiveTabState('dashboard');
      setDashboardSubTab('semanas');
    } else if (tab === 'meses') {
      localStorage.setItem(ACTIVE_TAB_STORAGE_KEY, 'dashboard');
      setActiveTabState('dashboard');
      setDashboardSubTab('meses');
    } else if (tab === 'matriz-proyectos') {
      localStorage.setItem(ACTIVE_TAB_STORAGE_KEY, 'proyectos');
      setActiveTabState('proyectos');
      setProyectosSubTab('matriz');
    } else if (tab === 'categorias') {
      localStorage.setItem(ACTIVE_TAB_STORAGE_KEY, 'proyectos');
      setActiveTabState('proyectos');
      setProyectosSubTab('categorias');
    } else if (tab === 'desglose-partida') {
      localStorage.setItem(ACTIVE_TAB_STORAGE_KEY, 'proyectos');
      setActiveTabState('proyectos');
      setProyectosSubTab('desglose');
    } else if (tab === 'catalogo-precios') {
      localStorage.setItem(ACTIVE_TAB_STORAGE_KEY, 'informe');
      setActiveTabState('informe');
      setInformeSubTab('catalogo');
    } else {
      localStorage.setItem(ACTIVE_TAB_STORAGE_KEY, tab);
      setActiveTabState(tab);
    }
  };

  const [selectedCategoriaParaDetalle, setSelectedCategoriaParaDetalleState] = useState<string>(() => {
    return localStorage.getItem(ACTIVE_CAT_STORAGE_KEY) || 'Materiales Directos';
  });

  const setSelectedCategoriaParaDetalle = (cat: string) => {
    localStorage.setItem(ACTIVE_CAT_STORAGE_KEY, cat);
    setSelectedCategoriaParaDetalleState(cat);
  };

  const [selectedPartidaDetalle, setSelectedPartidaDetalleState] = useState<{ concepto: string; categoria: string; proyectoCodigo?: string; mesNum?: number } | null>(() => {
    try {
      const saved = localStorage.getItem(ACTIVE_PARTIDA_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const setSelectedPartidaDetalle = (detalle: { concepto: string; categoria: string; proyectoCodigo?: string; mesNum?: number } | null) => {
    if (detalle) {
      localStorage.setItem(ACTIVE_PARTIDA_STORAGE_KEY, JSON.stringify(detalle));
    } else {
      localStorage.removeItem(ACTIVE_PARTIDA_STORAGE_KEY);
    }
    setSelectedPartidaDetalleState(detalle);
  };

  const [selectedProyectoParaDetalle, setSelectedProyectoParaDetalle] = useState<string>('TTE-C-0706');
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [salidaToEdit, setSalidaToEdit] = useState<SalidaCosto | null>(null);

  // Active User State
  const [currentUser, setCurrentUser] = useState<UsuarioSistema>(() => {
    const savedId = localStorage.getItem(ACTIVE_USER_STORAGE_KEY);
    if (savedId) {
      const found = USUARIOS_INICIALES_TIMACA.find(u => u.id === savedId);
      if (found) return found;
    }
    return USUARIOS_INICIALES_TIMACA[0];
  });

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return false;
  });

  // La sesión real la guarda Supabase Auth: al abrir SIGMA se valida y se carga el perfil.
  const [verificandoSesion, setVerificandoSesion] = useState(true);
  useEffect(() => {
    let activo = true;
    restaurarSesion()
      .then((usuario) => {
        if (activo && usuario) {
          setCurrentUser(usuario);
          setIsAuthenticated(true);
        }
      })
      .finally(() => {
        if (activo) setVerificandoSesion(false);
      });
    return () => {
      activo = false;
    };
  }, []);

  const handleLoginSuccess = (
    user: UsuarioSistema, 
    entorno?: 'externos' | 'internos', 
    modulo?: SuiteModulo,
    targetTab?: string
  ) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    
    // Si el usuario seleccionó un módulo o departamento específico al iniciar sesión
    const chosenModulo = modulo || 'costos';
    setModuloActivoState(chosenModulo);
    localStorage.setItem(MODULO_STORAGE_KEY, chosenModulo);

    let chosen = entorno || entornoActivo;
    if (user.rol === 'Analista de Costos Internos' || user.permisos?.ambitoEdicion === 'internos') {
      chosen = 'internos';
    } else if (user.permisos?.ambitoEdicion === 'externos') {
      chosen = 'externos';
    }
    setEntornoActivoState(chosen);
    localStorage.setItem(ENTORNO_STORAGE_KEY, chosen);

    // Iniciar con el menú comprimido según requerimiento
    setSidebarCollapsed(true);
    localStorage.setItem('TIMACA_SIDEBAR_COLLAPSED', 'true');

    if (targetTab) {
      setActiveTab(targetTab);
    } else if (chosenModulo === 'costos') {
      if (chosen === 'internos') {
        setActiveTab('internos-dashboard');
      } else {
        setActiveTab('dashboard');
      }
    }
  };

  // Salvaguarda: Bloquear acceso a internos si el usuario tiene ámbito restringido a externos
  useEffect(() => {
    if (currentUser?.permisos?.ambitoEdicion === 'externos') {
      if (entornoActivo !== 'externos') {
        setEntornoActivoState('externos');
        localStorage.setItem(ENTORNO_STORAGE_KEY, 'externos');
      }
      if (activeTab.startsWith('internos-') || activeTab === 'usuarios') {
        setActiveTab('dashboard');
      }
    }
  }, [currentUser, entornoActivo, activeTab]);

  const handleLogout = () => {
    void cerrarSesion();
    setIsAuthenticated(false);
    localStorage.removeItem(AUTH_STATE_STORAGE_KEY);
    setActiveTab(entornoActivo === 'internos' ? 'internos-dashboard' : 'dashboard');
  };

  const handleOpenNewSalida = () => {
    setSalidaToEdit(null);
    setIsFormOpen(true);
  };

  const handleEditSalida = (salida: SalidaCosto) => {
    setSalidaToEdit(salida);
    setIsFormOpen(true);
  };

  if (verificandoSesion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020C54] text-white text-sm">
        Verificando sesión…
      </div>
    );
  }

  // Si no está autenticado, mostrar Portada con Separación Primaria
  if (!isAuthenticated) {
    return (
      <>
        <VersionUpdateNotifier />
        <LoginPortadaView 
          onLoginSuccess={handleLoginSuccess}
          entornoInicial={entornoActivo}
          moduloInicial={moduloActivo}
        />
      </>
    );
  }

  const esInternos = entornoActivo === 'internos';

  return (
    <div className={`min-h-screen font-sans antialiased flex flex-row transition-colors duration-500 text-[13px] ${
      esInternos 
        ? 'bg-[#cbd5e1]/75 text-slate-900 selection:bg-sky-500 selection:text-white' 
        : 'bg-[#F8FAFC] text-[#1E293B] selection:bg-[#020C54] selection:text-white'
    }`}>
      <VersionUpdateNotifier />
      {/* Menú Lateral (Sidebar Empresarial TIMACA) */}
      <Sidebar
        moduloActivo={moduloActivo}
        onCambiarModulo={handleCambiarModulo}
        entornoActivo={entornoActivo}
        onCambiarEntorno={handleCambiarEntorno}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogout={handleLogout}
        isCollapsed={sidebarCollapsed}
        setIsCollapsed={handleToggleSidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* Contenedor Principal (TopBar Header + Contenido + Footer) */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenNewSalida={handleOpenNewSalida}
          onOpenImport={() => setIsImportOpen(true)}
          currentUser={currentUser}
          onLogout={handleLogout}
          entornoActivo={entornoActivo}
          onCambiarEntorno={handleCambiarEntorno}
          moduloActivo={moduloActivo}
          onCambiarModulo={handleCambiarModulo}
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        />

        {/* Main Container */}
        <main className="flex-1 max-w-[1920px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-5">
          <ContentErrorBoundary
            activeKey={`${moduloActivo}-${entornoActivo}-${activeTab}-${dashboardSubTab}-${proyectosSubTab}-${informeSubTab}`}
            onResetToDashboard={() => {
              handleCambiarModulo('costos');
              handleCambiarEntorno('externos');
              setActiveTab('dashboard');
              setDashboardSubTab('resumen');
            }}
          >
            <Suspense fallback={<ViewLoader />}>
        
        {/* ================= MÓDULO 1: SISTEMA DE HERRAMIENTAS ================= */}
        {moduloActivo === 'herramientas' && (
          <HerramientasModuleView
            currentUser={currentUser}
            onVolver={() => handleCambiarModulo('costos')}
            onGoToCostosInternos={() => {
              handleCambiarModulo('costos');
              handleCambiarEntorno('internos');
              setActiveTab('internos-infra');
            }}
          />
        )}

        {/* ================= MÓDULO 2: SISTEMA DE DOTACIÓN ================= */}
        {moduloActivo === 'dotacion' && (
          <DotacionModuleView
            currentUser={currentUser}
            onVolver={() => handleCambiarModulo('costos')}
          />
        )}

        {/* ================= MÓDULO 3: SIP DE PMH EN CAMPO ================= */}
        {moduloActivo === 'sip-pmh' && (
          <SIPPmhModuleView
            currentUser={currentUser}
            onVolver={() => handleCambiarModulo('costos')}
            onGoToProyecto={(cuenta: string) => {
              handleCambiarModulo('costos');
              handleCambiarEntorno('externos');
              setSelectedProyectoParaDetalle(cuenta);
              setActiveTab('proyectos');
            }}
          />
        )}

        {/* ================= MÓDULO 5: SEGURIDAD INDUSTRIAL & HSE ================= */}
        {moduloActivo === 'seguridad' && (
          <SeguridadModuleView
            currentUser={currentUser}
            onVolver={() => handleCambiarModulo('costos')}
            onGoToCertificados={() => handleCambiarModulo('certificados')}
          />
        )}

        {/* ================= MÓDULO 6: CERTIFICADOS & CURSOS TÉCNICOS ================= */}
        {moduloActivo === 'certificados' && (
          <CertificadosModuleView
            currentUser={currentUser}
            onVolver={() => handleCambiarModulo('costos')}
            onGoToSeguridad={() => handleCambiarModulo('seguridad')}
            onGoToGruas={() => {
              handleCambiarModulo('costos');
              handleCambiarEntorno('internos');
              setActiveTab('internos-gruas');
            }}
          />
        )}

        {/* ================= MÓDULO 7: RECURSOS HUMANOS (TIMACA) ================= */}
        {moduloActivo === 'rrhh' && (
          <RRHHModuleView
            currentUser={currentUser}
            onVolver={() => handleCambiarModulo('costos')}
          />
        )}

        {/* ================= MÓDULO PRINCIPAL: DEPARTAMENTO DE COSTOS ================= */}
        {moduloActivo === 'costos' && (
          activeTab === 'unificada-sip' ? (
            <MasterUnificadoSipView currentUser={currentUser} />
          ) : activeTab === 'catalogo-precios' ? (
            <CatalogoPreciosView currentUser={currentUser} onVolver={() => setActiveTab('unificada-sip')} />
          ) : esInternos ? (
          <>
            {(activeTab === 'internos-dashboard' || activeTab === 'dashboard' || activeTab === 'internos-capex' || activeTab === 'internos-flota' || activeTab === 'internos-gruas' || activeTab === 'internos-mod' || activeTab === 'internos-infra') && (
              <DashboardInternosView 
                onGoToPPT={() => setActiveTab('internos-ppt')}
                currentUser={currentUser}
                activeSubTab={
                  activeTab === 'internos-capex' ? 'capex' :
                  activeTab === 'internos-flota' ? 'flota' :
                  activeTab === 'internos-gruas' ? 'gruas' :
                  activeTab === 'internos-mod' ? 'mod' :
                  activeTab === 'internos-infra' ? 'infra' : 'resumen'
                }
                onSelectSubTab={(newSubTab) => {
                  if (newSubTab === 'resumen') {
                    setActiveTab('internos-dashboard');
                  } else {
                    setActiveTab(`internos-${newSubTab}`);
                  }
                }}
              />
            )}

            {(activeTab === 'internos-ppt' || activeTab === 'informe') && (
              <InformeInternosPPTView onVolver={() => setActiveTab('internos-dashboard')} />
            )}

            {activeTab === 'usuarios' && (
              <UsuariosView
                currentUser={currentUser}
                setCurrentUser={setCurrentUser}
                onVolver={() => setActiveTab('internos-dashboard')}
              />
            )}
          </>
        ) : (
          /* ================= SECCIÓN PROYECTOS EXTERNOS (5 MÓDULOS CONSOLIDADOS) ================= */
          <>
            {/* 1. MÓDULO TABLERO EJECUTIVO (Resumen, Meses, Semanas) */}
            {activeTab === 'dashboard' && (
              <div className="space-y-4">
                <div className="bg-white border border-slate-200/90 rounded-2xl p-2 shadow-xs flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 overflow-x-auto">
                    <button
                      onClick={() => setDashboardSubTab('resumen')}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        dashboardSubTab === 'resumen'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      <span>Resumen General</span>
                    </button>
                    <button
                      onClick={() => setDashboardSubTab('meses')}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        dashboardSubTab === 'meses'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <CalendarDays className="w-3.5 h-3.5" />
                      <span>Evolución Mes a Mes</span>
                    </button>
                    <button
                      onClick={() => setDashboardSubTab('semanas')}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        dashboardSubTab === 'semanas'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <CalendarRange className="w-3.5 h-3.5" />
                      <span>Control Semana a Semana</span>
                    </button>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-mono pr-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Consolidado Obras 2026</span>
                  </div>
                </div>

                {dashboardSubTab === 'resumen' && (
                  <DashboardView
                    onGoToProyectos={() => {
                      setProyectosSubTab('cuentas');
                      setActiveTab('proyectos');
                    }}
                    onGoToSemanas={() => setDashboardSubTab('semanas')}
                    onGoToMeses={() => setDashboardSubTab('meses')}
                    onGoToInforme={() => {
                      setInformeSubTab('ppt');
                      setActiveTab('informe');
                    }}
                    onOpenImport={() => setIsImportOpen(true)}
                    onGoToManoObra={() => setActiveTab('mano-obra')}
                    onGoToCategoria={(cat) => {
                      setSelectedCategoriaParaDetalle(cat);
                      setProyectosSubTab('categorias');
                      setActiveTab('proyectos');
                    }}
                    onOpenProyectosMatriz={() => {
                      setProyectosSubTab('matriz');
                      setActiveTab('proyectos');
                    }}
                    onSelectProyecto={(cuentaAux) => {
                      setSelectedProyectoParaDetalle(cuentaAux);
                      setProyectosSubTab('cuentas');
                      setActiveTab('proyectos');
                    }}
                    currentUser={currentUser}
                  />
                )}

                {dashboardSubTab === 'meses' && (
                  <MesMesView onVolver={() => setDashboardSubTab('resumen')} />
                )}

                {dashboardSubTab === 'semanas' && (
                  <SemanaSemanaView onVolver={() => setDashboardSubTab('resumen')} />
                )}
              </div>
            )}

            {/* 2. MÓDULO PROYECTOS & CATEGORÍAS (Cuentas, Matriz, Categorías, Desglose) */}
            {activeTab === 'proyectos' && (
              <div className="space-y-4">
                <div className="bg-white border border-slate-200/90 rounded-2xl p-2 shadow-xs flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 overflow-x-auto">
                    <button
                      onClick={() => setProyectosSubTab('cuentas')}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        proyectosSubTab === 'cuentas'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>Cuentas Auxiliares & Presupuestos</span>
                    </button>
                    <button
                      onClick={() => setProyectosSubTab('matriz')}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        proyectosSubTab === 'matriz'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <TableProperties className="w-3.5 h-3.5" />
                      <span>Matriz Proyectos × Categorías</span>
                    </button>
                    <button
                      onClick={() => setProyectosSubTab('categorias')}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        proyectosSubTab === 'categorias' || proyectosSubTab === 'desglose'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Auditoría por Categoría</span>
                    </button>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-mono pr-2">
                    <span>4 Proyectos Principales + Varios</span>
                  </div>
                </div>

                {proyectosSubTab === 'cuentas' && (
                  <ProyectosView 
                    initialCuentaCodigo={selectedProyectoParaDetalle}
                    onVolver={() => setActiveTab('dashboard')} 
                  />
                )}

                {proyectosSubTab === 'matriz' && (
                  <MatrizProyectosCategoriasView
                    initialPeriodo="anual"
                    initialVista="mensual"
                    onVolver={() => setProyectosSubTab('cuentas')}
                    onSelectProyecto={(cuentaAux) => {
                      setSelectedProyectoParaDetalle(cuentaAux);
                      setProyectosSubTab('cuentas');
                    }}
                    onSelectCategoria={(cat) => {
                      setSelectedCategoriaParaDetalle(cat);
                      setProyectosSubTab('categorias');
                    }}
                  />
                )}

                {proyectosSubTab === 'categorias' && (
                  <CategoriaDetalleView 
                    initialCategoria={selectedCategoriaParaDetalle}
                    onVolver={() => setProyectosSubTab('cuentas')}
                    onOpenDesglosePartida={(concepto, categoria, proyectoCodigo, mesNum) => {
                      setSelectedPartidaDetalle({ concepto, categoria, proyectoCodigo, mesNum });
                      setProyectosSubTab('desglose');
                    }}
                  />
                )}

                {proyectosSubTab === 'desglose' && (
                  <DesglosePartidaView
                    concepto={selectedPartidaDetalle?.concepto || 'Planchas estructurales ASTM A36 / Hardox 400'}
                    categoria={selectedPartidaDetalle?.categoria || 'Materiales Directos'}
                    proyectoCodigo={selectedPartidaDetalle?.proyectoCodigo || 'TODOS'}
                    mesNum={selectedPartidaDetalle?.mesNum}
                    onVolver={() => setProyectosSubTab('categorias')}
                  />
                )}
              </div>
            )}

            {/* 3. MÓDULO MANO DE OBRA (MOD) */}
            {activeTab === 'mano-obra' && (
              <ManoObraDiariaView onVolver={() => setActiveTab('dashboard')} />
            )}

            {/* 4. MÓDULO PRESENTACIÓN & PRECIOS (PPT, Catálogo de Precios SIP) */}
            {activeTab === 'informe' && (
              <div className="space-y-4">
                <div className="bg-white border border-slate-200/90 rounded-2xl p-2 shadow-xs flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 overflow-x-auto">
                    <button
                      onClick={() => setInformeSubTab('ppt')}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        informeSubTab === 'ppt'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Presentación Ejecutiva PPT</span>
                    </button>
                    <button
                      onClick={() => setInformeSubTab('catalogo')}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        informeSubTab === 'catalogo'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>Catálogo de Precios SIP</span>
                    </button>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-mono pr-2">
                    <span>Auditoría & Conciliación</span>
                  </div>
                </div>

                {informeSubTab === 'ppt' && (
                  <InformeMensualView 
                    onVolver={() => setActiveTab('dashboard')} 
                    onSwitchToInternos={() => {
                      handleCambiarEntorno('internos');
                      setActiveTab('internos-ppt');
                    }}
                  />
                )}

                {informeSubTab === 'catalogo' && (
                  <CatalogoPreciosView 
                    currentUser={currentUser} 
                    onVolver={() => setInformeSubTab('ppt')} 
                  />
                )}
              </div>
            )}

            {/* Fallbacks para compatibilidad con rutas o llamadas heredadas */}
            {activeTab === 'semanas' && (
              <SemanaSemanaView onVolver={() => setActiveTab('dashboard')} />
            )}
            {activeTab === 'meses' && (
              <MesMesView onVolver={() => setActiveTab('dashboard')} />
            )}
            {activeTab === 'matriz-proyectos' && (
              <MatrizProyectosCategoriasView
                initialPeriodo="anual"
                initialVista="mensual"
                onVolver={() => setActiveTab('proyectos')}
                onSelectProyecto={(cuentaAux) => {
                  setSelectedProyectoParaDetalle(cuentaAux);
                  setActiveTab('proyectos');
                }}
                onSelectCategoria={(cat) => {
                  setSelectedCategoriaParaDetalle(cat);
                  setActiveTab('proyectos');
                }}
              />
            )}
            {activeTab === 'categorias' && (
              <CategoriaDetalleView 
                initialCategoria={selectedCategoriaParaDetalle}
                onVolver={() => setActiveTab('proyectos')}
                onOpenDesglosePartida={(concepto, categoria, proyectoCodigo, mesNum) => {
                  setSelectedPartidaDetalle({ concepto, categoria, proyectoCodigo, mesNum });
                  setActiveTab('proyectos');
                  setProyectosSubTab('desglose');
                }}
              />
            )}
            {activeTab === 'desglose-partida' && (
              <DesglosePartidaView
                concepto={selectedPartidaDetalle?.concepto || 'Planchas estructurales ASTM A36 / Hardox 400'}
                categoria={selectedPartidaDetalle?.categoria || 'Materiales Directos'}
                proyectoCodigo={selectedPartidaDetalle?.proyectoCodigo || 'TODOS'}
                mesNum={selectedPartidaDetalle?.mesNum}
                onVolver={() => setActiveTab('proyectos')}
              />
            )}

            {activeTab === 'usuarios' && (
              <UsuariosView
                currentUser={currentUser}
                setCurrentUser={setCurrentUser}
                onVolver={() => setActiveTab('dashboard')}
              />
            )}

            {activeTab === 'importar' && (
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-neutral-200 shadow-xs max-w-3xl mx-auto space-y-6">
                <div className="border-b border-neutral-100 pb-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setActiveTab('dashboard')}
                      className="flex items-center gap-1.5 font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200/90 px-2.5 py-1.5 rounded-lg transition-colors text-xs shadow-2xs shrink-0 self-center"
                      title="Volver al Resumen General"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Volver</span>
                    </button>
                    <div>
                      <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
                        Gestión y Actualización de Archivos
                      </h2>
                      <p className="text-xs text-neutral-500 mt-1">
                        Conexión y sincronización de datos desde tu carpeta local en la computadora
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 text-xs space-y-2">
                  <span className="font-bold text-neutral-800 block">Ruta de origen en tu equipo:</span>
                  <code className="block bg-neutral-900 text-amber-300 p-2.5 rounded-lg font-mono text-[11px] select-all overflow-x-auto">
                    C:\Users\alejandratesara\Desktop\Alejandra T\Costos Alejandra\Modelo_Estrella_Costos_TIMACA
                  </code>
                  <p className="text-neutral-600 leading-relaxed pt-1">
                    Para actualizar esta aplicación con los archivos de esa carpeta, puedes pulsar el botón a continuación para abrir el selector o arrastrar tus hojas de cálculo directamente. La aplicación calculará automáticamente las semanas, meses, proyectos y cuentas auxiliares.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  {currentUser.permisos.canImportFiles ? (
                    <button
                      onClick={() => setIsImportOpen(true)}
                      className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <FolderCheck className="w-4 h-4" />
                      <span>Abrir Asistente de Importación Excel</span>
                    </button>
                  ) : (
                    <div className="flex-1 p-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-700 text-xs font-medium text-center">
                      Solo la Administradora (Alejandra Tesara) tiene autorización para importar nuevos archivos y recalcular la base de datos.
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )
      )}
            </Suspense>
          </ContentErrorBoundary>
        </main>

        {/* Modals con carga diferida */}
        <Suspense fallback={null}>
          {isImportOpen && (
            <ImportModal
              isOpen={isImportOpen}
              onClose={() => setIsImportOpen(false)}
            />
          )}

          {isFormOpen && (
            <SalidaFormModal
              isOpen={isFormOpen}
              onClose={() => {
                setIsFormOpen(false);
                setSalidaToEdit(null);
              }}
              salidaToEdit={salidaToEdit}
            />
          )}
        </Suspense>

      {/* Footer Adaptativo */}
      <footer className={`py-3.5 mt-8 transition-colors duration-300 border-t ${
        esInternos 
          ? 'bg-slate-900 text-slate-400 border-slate-700/80' 
          : 'bg-white text-neutral-500 border-neutral-200'
      }`}>
        <div className="w-full px-4 sm:px-6 lg:px-8 flex flex-col xl:flex-row items-center justify-between gap-3 text-xs">
          {/* Izquierda: Empresa y RIF */}
          <div className="flex flex-wrap items-center justify-center xl:justify-start gap-2">
            <span className={`font-black tracking-tight ${esInternos ? 'text-white' : 'text-[#0b2545]'}`}>TIMACA</span>
            <span aria-hidden="true" className="text-slate-400">·</span>
            <span className="font-medium">Taller Industrial Metalúrgico Antonio, C.A.</span>
            <span aria-hidden="true" className="text-slate-400">·</span>
            <span className="font-mono text-[11px] font-semibold">RIF J-09500315-9</span>
            <span aria-hidden="true" className="text-slate-400">·</span>
            <span className={esInternos ? 'text-sky-300 font-medium' : 'text-slate-600 font-medium'}>
              {esInternos ? 'Gestión Interna · CAPEX & OPEX 2026' : 'Modelo Estrella de Costos Industriales 2026'}
            </span>
          </div>

          {/* Derecha: Sesión, Creadores y Ubicación aprovechando todo el ancho */}
          <div className="flex flex-wrap items-center justify-center xl:justify-end gap-x-4 gap-y-1.5 text-xs">
            <div className="flex items-center gap-1.5 text-slate-500">
              <span>Sesión:</span>
              <strong className={esInternos ? 'text-white' : 'text-neutral-900'}>{currentUser.nombre}</strong>
              <span className="text-slate-400">({currentUser.rol})</span>
            </div>
            <span aria-hidden="true" className="hidden sm:inline text-slate-300">|</span>
            <div className="flex items-center gap-1.5 text-slate-600">
              <span className="text-slate-500">Sistema creado por:</span>
              <strong className={esInternos ? 'text-slate-100 font-bold' : 'text-slate-800 font-bold'}>Alejandra Tesara</strong>
              <span className="text-slate-400">·</span>
              <strong className={esInternos ? 'text-slate-100 font-bold' : 'text-slate-800 font-bold'}>Daniela Riveros</strong>
              <span className="text-slate-400">·</span>
              <strong className={esInternos ? 'text-slate-100 font-bold' : 'text-slate-800 font-bold'}>Jessica Navarro</strong>
            </div>
            <span aria-hidden="true" className="hidden sm:inline text-slate-300">|</span>
            <span className="text-slate-400 text-[11px]">Ciudad Guayana, Venezuela</span>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error global capturado por ErrorBoundary:', error, errorInfo);
  }

  handleResetAndReload = () => {
    try {
      localStorage.removeItem('TIMACA_ACTIVE_TAB_NAV');
      localStorage.removeItem('TIMACA_ACTIVE_CAT_NAV');
      localStorage.removeItem('TIMACA_ACTIVE_PARTIDA_NAV');
      localStorage.removeItem('TIMACA_MODULO_SUITE_ACTIVO');
      localStorage.removeItem('TIMACA_ENTORNO_ACTIVO');
    } catch {
      // ignore
    }
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full border border-slate-200 shadow-xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Se ha detectado una observación en el sistema</h2>
            <p className="text-sm text-slate-600">
              Ocurrió un error inesperado al renderizar la aplicación. Puedes reintentar o volver al inicio con la navegación restablecida.
            </p>
            {this.state.error && (
              <div className="bg-slate-100 p-3 rounded-lg text-left text-xs font-mono text-slate-700 overflow-x-auto max-h-32 select-all">
                {this.state.error.message}
              </div>
            )}
            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors cursor-pointer border border-slate-300"
              >
                Reintentar
              </button>
              <button
                onClick={this.handleResetAndReload}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
              >
                Volver al Inicio y Recargar
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function App() {
  return (
    <ErrorBoundary>
      <CostosProvider>
        <AppContent />
      </CostosProvider>
    </ErrorBoundary>
  );
}

export default App;
