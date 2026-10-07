/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CostosProvider } from './context/CostosContext';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { DashboardInternosView } from './components/DashboardInternosView';
import { InformeInternosPPTView } from './components/InformeInternosPPTView';
import { ProyectosView } from './components/ProyectosView';
import { SemanaSemanaView } from './components/SemanaSemanaView';
import { MesMesView } from './components/MesMesView';
import { InformeMensualView } from './components/InformeMensualView';
import { CategoriaDetalleView } from './components/CategoriaDetalleView';
import { MatrizProyectosCategoriasView } from './components/MatrizProyectosCategoriasView';
import { DesglosePartidaView } from './components/DesglosePartidaView';
import { SalidasTableView } from './components/SalidasTableView';
import { ManoObraDiariaView } from './components/ManoObraDiariaView';
import { UsuariosView } from './components/UsuariosView';
import { ImportModal } from './components/ImportModal';
import { SalidaFormModal } from './components/SalidaFormModal';
import { LoginPortadaView } from './components/LoginPortadaView';
import { ValidacionGerenteView } from './components/ValidacionGerenteView';
import { HerramientasModuleView } from './components/herramientas/HerramientasModuleView';
import { DotacionModuleView } from './components/dotacion/DotacionModuleView';
import { SeguridadModuleView } from './components/seguridad/SeguridadModuleView';
import { CertificadosModuleView } from './components/certificados/CertificadosModuleView';
import { SIPPmhModuleView } from './components/sip-pmh/SIPPmhModuleView';
import { RRHHModuleView } from './components/rrhh/RRHHModuleView';
import { Sidebar } from './components/Sidebar';
import { SalidaCosto } from './types/costos';
import { UsuarioSistema, USUARIOS_INICIALES_TIMACA } from './types/usuarios';
import { SuiteModulo } from './types/suite';
import { FolderCheck, ArrowLeft, AlertTriangle } from 'lucide-react';

const AUTH_STATE_STORAGE_KEY = 'TIMACA_AUTH_STATE_ACTIVE_V1';
const ACTIVE_USER_STORAGE_KEY = 'TIMACA_ACTIVE_USER_ID_V7_PERMISOS_HSE';
const ACTIVE_TAB_STORAGE_KEY = 'TIMACA_ACTIVE_TAB_NAV';
const ACTIVE_CAT_STORAGE_KEY = 'TIMACA_ACTIVE_CAT_NAV';
const ACTIVE_PARTIDA_STORAGE_KEY = 'TIMACA_ACTIVE_PARTIDA_NAV';
const ENTORNO_STORAGE_KEY = 'TIMACA_ENTORNO_ACTIVO';
const MODULO_STORAGE_KEY = 'TIMACA_MODULO_SUITE_ACTIVO';

function AppContent() {
  // Estado del Menú Lateral (Sidebar)
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('TIMACA_SIDEBAR_COLLAPSED') === 'true';
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
    localStorage.setItem(ENTORNO_STORAGE_KEY, nuevoEntorno);
    setEntornoActivoState(nuevoEntorno);
    if (nuevoEntorno === 'internos') {
      setActiveTab('internos-dashboard');
    } else {
      setActiveTab('dashboard');
    }
  };

  const [activeTab, setActiveTabState] = useState<string>(() => {
    const saved = localStorage.getItem(ACTIVE_TAB_STORAGE_KEY);
    const savedEntorno = localStorage.getItem(ENTORNO_STORAGE_KEY);
    if (savedEntorno === 'internos') {
      return saved && saved.startsWith('internos-') ? saved : 'internos-dashboard';
    }
    return saved || 'dashboard';
  });

  const setActiveTab = (tab: string) => {
    localStorage.setItem(ACTIVE_TAB_STORAGE_KEY, tab);
    setActiveTabState(tab);
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
    return localStorage.getItem(AUTH_STATE_STORAGE_KEY) === 'true';
  });

  const handleLoginSuccess = (user: UsuarioSistema, entorno?: 'externos' | 'internos') => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem(AUTH_STATE_STORAGE_KEY, 'true');
    localStorage.setItem(ACTIVE_USER_STORAGE_KEY, user.id);
    
    let chosen = entorno || entornoActivo;
    if (user.rol === 'Analista de Costos Internos') {
      chosen = 'internos';
    }
    setEntornoActivoState(chosen);
    localStorage.setItem(ENTORNO_STORAGE_KEY, chosen);

    if (user.rol === 'Analista de Costos Internos') {
      setActiveTab('internos-dashboard');
    } else if (chosen === 'internos') {
      setActiveTab('internos-dashboard');
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleLogout = () => {
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

  // Si no está autenticado, mostrar Portada con Separación Primaria
  if (!isAuthenticated) {
    return (
      <LoginPortadaView 
        onLoginSuccess={handleLoginSuccess}
        entornoInicial={entornoActivo}
      />
    );
  }

  const esInternos = entornoActivo === 'internos';

  return (
    <div className={`min-h-screen font-sans antialiased flex flex-row transition-colors duration-500 ${
      esInternos 
        ? 'bg-[#cbd5e1]/75 text-slate-900 selection:bg-sky-500 selection:text-white' 
        : 'bg-neutral-100/70 text-neutral-900 selection:bg-blue-600 selection:text-white'
    }`}>
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

        {/* ================= MÓDULO 3: SIP DE PMH PALÚA EN CAMPO ================= */}
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
          esInternos ? (
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
          /* ================= SECCIÓN PROYECTOS EXTERNOS ================= */
          <>
            {activeTab === 'dashboard' && (
              <DashboardView
                onGoToProyectos={() => setActiveTab('proyectos')}
                onGoToSemanas={() => setActiveTab('semanas')}
                onGoToMeses={() => setActiveTab('meses')}
                onGoToInforme={() => setActiveTab('informe')}
                onGoToTabla={() => setActiveTab('tabla')}
                onOpenImport={() => setIsImportOpen(true)}
                onGoToManoObra={() => setActiveTab('mano-obra')}
                onGoToCategoria={(cat) => {
                  setSelectedCategoriaParaDetalle(cat);
                  setActiveTab('categorias');
                }}
                onOpenProyectosMatriz={() => setActiveTab('matriz-proyectos')}
                onSelectProyecto={(cuentaAux) => {
                  setSelectedProyectoParaDetalle(cuentaAux);
                  setActiveTab('proyectos');
                }}
                onGoToValidacion={() => setActiveTab('validacion-gerente')}
                currentUser={currentUser}
              />
            )}

            {activeTab === 'validacion-gerente' && (
              <ValidacionGerenteView
                currentUser={currentUser}
                onVolver={() => setActiveTab('dashboard')}
                onGoToDashboard={() => setActiveTab('dashboard')}
              />
            )}

            {activeTab === 'matriz-proyectos' && (
              <MatrizProyectosCategoriasView
                initialPeriodo="anual"
                initialVista="mensual"
                onVolver={() => setActiveTab('dashboard')}
                onSelectProyecto={(cuentaAux) => {
                  setSelectedProyectoParaDetalle(cuentaAux);
                  setActiveTab('proyectos');
                }}
                onSelectCategoria={(cat) => {
                  setSelectedCategoriaParaDetalle(cat);
                  setActiveTab('categorias');
                }}
              />
            )}

            {activeTab === 'categorias' && (
              <CategoriaDetalleView 
                initialCategoria={selectedCategoriaParaDetalle}
                onVolver={() => setActiveTab('dashboard')}
                onOpenDesglosePartida={(concepto, categoria, proyectoCodigo, mesNum) => {
                  setSelectedPartidaDetalle({ concepto, categoria, proyectoCodigo, mesNum });
                  setActiveTab('desglose-partida');
                }}
              />
            )}

            {activeTab === 'desglose-partida' && (
              <DesglosePartidaView
                concepto={selectedPartidaDetalle?.concepto || 'Planchas estructurales ASTM A36 / Hardox 400'}
                categoria={selectedPartidaDetalle?.categoria || 'Materiales Directos'}
                proyectoCodigo={selectedPartidaDetalle?.proyectoCodigo || 'TODOS'}
                mesNum={selectedPartidaDetalle?.mesNum}
                onVolver={() => setActiveTab('categorias')}
              />
            )}

            {activeTab === 'proyectos' && (
              <ProyectosView 
                initialCuentaCodigo={selectedProyectoParaDetalle}
                onVolver={() => setActiveTab('dashboard')} 
              />
            )}

            {activeTab === 'mano-obra' && <ManoObraDiariaView onVolver={() => setActiveTab('dashboard')} />}

            {activeTab === 'semanas' && <SemanaSemanaView onVolver={() => setActiveTab('dashboard')} />}

            {activeTab === 'informe' && (
              <InformeMensualView 
                onVolver={() => setActiveTab('dashboard')} 
                onSwitchToInternos={() => {
                  handleCambiarEntorno('internos');
                  setActiveTab('internos-ppt');
                }}
              />
            )}

            {activeTab === 'tabla' && (
              <SalidasTableView
                onOpenNewSalida={handleOpenNewSalida}
                onEditSalida={handleEditSalida}
                onVolver={() => setActiveTab('dashboard')}
                currentUser={currentUser}
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
      </main>

      {/* Modals */}
      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
      />

      <SalidaFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSalidaToEdit(null);
        }}
        salidaToEdit={salidaToEdit}
      />

      {/* Footer Adaptativo */}
      <footer className={`py-4 mt-8 transition-colors duration-300 border-t ${
        esInternos 
          ? 'bg-slate-900 text-slate-400 border-slate-700/80' 
          : 'bg-white text-neutral-500 border-neutral-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className={`font-black ${esInternos ? 'text-white' : 'text-[#0b2545]'}`}>TIMACA</span>
            <span aria-hidden="true">·</span>
            <span>Taller Industrial Metalúrgico Antonio, C.A.</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-[11px]">RIF J-09500315-9</span>
            <span aria-hidden="true">·</span>
            <span className={esInternos ? 'text-sky-300' : 'text-neutral-500'}>
              {esInternos ? 'Gestión Interna · CAPEX & OPEX 2026' : 'Modelo Estrella de Costos Industriales 2026'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span>Sesión: <strong className={esInternos ? 'text-white' : 'text-neutral-800'}>{currentUser.nombre}</strong> ({currentUser.rol})</span>
            <span aria-hidden="true">·</span>
            <span>Ciudad Guayana, Venezuela</span>
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
    console.error('Error capturado por ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full border border-slate-200 shadow-xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Se ha detectado una observación en la vista</h2>
            <p className="text-sm text-slate-600">
              Ocurrió un error inesperado al renderizar este componente. Puedes recargar el sistema de costos para restablecer el estado.
            </p>
            {this.state.error && (
              <div className="bg-slate-100 p-3 rounded-lg text-left text-xs font-mono text-slate-700 overflow-x-auto max-h-32">
                {this.state.error.message}
              </div>
            )}
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-xs"
              >
                Recargar Sistema
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
