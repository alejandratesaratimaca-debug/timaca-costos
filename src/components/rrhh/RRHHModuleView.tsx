import React, { useState, useMemo } from 'react';
import { UsuarioSistema } from '../../types/usuarios';
import { SeccionRRHH, EmpleadoExpediente } from '../../types/rrhh';
import {
  MOCK_INDICADORES_RRHH,
  MOCK_UNIDADES_ORGANIGRAMA,
  MOCK_EMPLEADOS_EXPEDIENTES,
  MOCK_CONTRATOS,
  MOCK_EGRESOS,
  MOCK_ASISTENCIA_HOY,
  MOCK_TRANSITORIOS_ASISTENCIA,
  MOCK_REQUERIMIENTOS,
  MOCK_CARTERA_CV,
  MOCK_ENTREVISTAS,
  MOCK_CANDIDATOS_PROCESO,
  MOCK_PLANILLAS_INGRESO,
  MOCK_CUADRILLAS_OBRA,
  MOCK_SOLICITUDES_PLAZAS
} from '../../data/mockRRHHData';
import {
  Users,
  Network,
  FolderOpen,
  FileSignature,
  UserMinus,
  CalendarCheck2,
  UserPlus,
  Briefcase,
  FileCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  Plus,
  ArrowLeft,
  Download,
  Building2,
  Eye,
  FileText,
  BadgeAlert,
  HardHat,
  ChevronRight,
  TrendingUp,
  UserCheck,
  XCircle,
  FileSpreadsheet,
  Layers,
  MapPin,
  Calendar,
  Sparkles,
  Award,
  Phone,
  Mail,
  ShieldCheck,
  ExternalLink,
  Save,
  Trash2,
  RefreshCw
} from 'lucide-react';

interface RRHHModuleViewProps {
  currentUser: UsuarioSistema;
  onVolver?: () => void;
}

export const RRHHModuleView: React.FC<RRHHModuleViewProps> = ({
  currentUser,
  onVolver
}) => {
  // Pestaña activa principal
  const [seccionActiva, setSeccionActiva] = useState<SeccionRRHH>('inicio');

  // Estado para el modal de Expediente 360°
  const [selectedEmpleadoExpediente, setSelectedEmpleadoExpediente] = useState<EmpleadoExpediente | null>(null);
  const [expedienteSubTab, setExpedienteSubTab] = useState<'personales' | 'laborales' | 'familia' | 'documentos' | 'cursos' | 'historial'>('personales');

  // Filtros de Expedientes
  const [searchEmpleados, setSearchEmpleados] = useState('');
  const [filtroGerenciaEmpleado, setFiltroGerenciaEmpleado] = useState('TODAS');
  const [filtroSindicatoEmpleado, setFiltroSindicatoEmpleado] = useState('TODOS');

  // Filtros de Contratos
  const [searchContratos, setSearchContratos] = useState('');
  const [filtroSemaforoContrato, setFiltroSemaforoContrato] = useState<string>('TODOS');
  const [filtroTabContratos, setFiltroTabContratos] = useState<'todos' | 'por_responder'>('todos');

  // Filtros de Asistencia
  const [tabAsistencia, setTabAsistencia] = useState<'asistencia' | 'transitorios'>('asistencia');
  const [registrosAsistencia, setRegistrosAsistencia] = useState(MOCK_ASISTENCIA_HOY);
  const [searchAsistencia, setSearchAsistencia] = useState('');

  // Filtros de Requerimientos
  const [tabRequerimientos, setTabRequerimientos] = useState<'bolsa' | 'mias' | 'aprobar' | 'respondidas'>('bolsa');

  // Filtros de Cartera CV
  const [searchCV, setSearchCV] = useState('');
  const [filtroSituacionCV, setFiltroSituacionCV] = useState('TODOS');

  // Filtros de Entrevistas
  const [tabEntrevistas, setTabEntrevistas] = useState<'agenda' | 'realizadas'>('agenda');

  // Pipeline de Candidatos (Etapas)
  const [candidatosPipeline, setCandidatosPipeline] = useState(MOCK_CANDIDATOS_PROCESO);

  // Cuadrillas: Visualización vs Gestión
  const [tabCuadrillas, setTabCuadrillas] = useState<'visualizacion' | 'gestion'>('visualizacion');
  const [filtroAlertaCuadrillas, setFiltroAlertaCuadrillas] = useState<'todas' | 'sin_cuadrilla' | 'repetidos'>('todas');

  // Mensaje flotante de notificación
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // -------------------------------------------------------------
  // ACCIONES RÁPIDAS DE ASISTENCIA
  // -------------------------------------------------------------
  const handleMarcarAsistencia = (id: string, marca: 'P' | 'T' | 'A') => {
    setRegistrosAsistencia(prev =>
      prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            marca,
            horaEntrada: marca === 'P' ? '06:55' : marca === 'T' ? '07:35' : undefined,
            motivoTardanza: marca === 'T' ? 'Reporte de retraso en transporte' : undefined
          };
        }
        return item;
      })
    );
    showToast(`Asistencia actualizada para ${id}`);
  };

  // -------------------------------------------------------------
  // ACCIONES EN PIPELINE DE CANDIDATOS
  // -------------------------------------------------------------
  const handleAvanzarEtapaCandidato = (id: string, nuevaEtapa: any) => {
    setCandidatosPipeline(prev =>
      prev.map(c => (c.id === id ? { ...c, etapaActual: nuevaEtapa } : c))
    );
    showToast(`Candidato movido a la etapa: ${nuevaEtapa}`);
  };

  // -------------------------------------------------------------
  // EMPLEADOS FILTRADOS
  // -------------------------------------------------------------
  const empleadosFiltrados = useMemo(() => {
    return MOCK_EMPLEADOS_EXPEDIENTES.filter(emp => {
      const matchSearch =
        emp.nombreCompleto.toLowerCase().includes(searchEmpleados.toLowerCase()) ||
        emp.cedula.includes(searchEmpleados) ||
        emp.puestoCargo.toLowerCase().includes(searchEmpleados.toLowerCase()) ||
        emp.codigoEmpleado.toLowerCase().includes(searchEmpleados.toLowerCase());

      const matchGerencia =
        filtroGerenciaEmpleado === 'TODAS' || emp.gerencia === filtroGerenciaEmpleado;

      const matchSindicato =
        filtroSindicatoEmpleado === 'TODOS' ||
        (filtroSindicatoEmpleado === 'SI' && emp.perteneceSindicato) ||
        (filtroSindicatoEmpleado === 'NO' && !emp.perteneceSindicato);

      return matchSearch && matchGerencia && matchSindicato;
    });
  }, [searchEmpleados, filtroGerenciaEmpleado, filtroSindicatoEmpleado]);

  // -------------------------------------------------------------
  // CONTRATOS FILTRADOS
  // -------------------------------------------------------------
  const contratosFiltrados = useMemo(() => {
    return MOCK_CONTRATOS.filter(cnt => {
      const matchSearch =
        cnt.empleadoNombre.toLowerCase().includes(searchContratos.toLowerCase()) ||
        cnt.cedula.includes(searchContratos) ||
        cnt.cargo.toLowerCase().includes(searchContratos.toLowerCase());

      const matchSemaforo =
        filtroSemaforoContrato === 'TODOS' || cnt.semaforo === filtroSemaforoContrato;

      const matchTab =
        filtroTabContratos === 'todos' || (filtroTabContratos === 'por_responder' && cnt.requiereRespuestaJefe);

      return matchSearch && matchSemaforo && matchTab;
    });
  }, [searchContratos, filtroSemaforoContrato, filtroTabContratos]);

  // Agrupación de secciones oficiales de RRHH TIMACA
  const CATEGORIAS_RRHH = useMemo(() => [
    {
      id: 'indicadores',
      nombre: 'Indicadores',
      icon: TrendingUp,
      submodulos: [
        { id: 'inicio' as SeccionRRHH, label: 'Tablero Indicadores', icon: TrendingUp }
      ]
    },
    {
      id: 'organizacion',
      nombre: 'Organigrama',
      icon: Network,
      submodulos: [
        { id: 'organizacion' as SeccionRRHH, label: 'Estructura Organizativa', icon: Network }
      ]
    },
    {
      id: 'admin_personal',
      nombre: 'Administración de Personal',
      icon: FolderOpen,
      submodulos: [
        { id: 'empleados' as SeccionRRHH, label: 'Expedientes', icon: FolderOpen, badge: '174' },
        { id: 'contratos' as SeccionRRHH, label: 'Contratos', icon: FileSignature, badge: '4 alertas', badgeColor: 'bg-amber-100 text-amber-800' },
        { id: 'historial_egresos' as SeccionRRHH, label: 'Historial de Egresos', icon: UserMinus },
        { id: 'asistencia' as SeccionRRHH, label: 'Asistencia', icon: CalendarCheck2, badge: '96.8%', badgeColor: 'bg-emerald-100 text-emerald-800' }
      ]
    },
    {
      id: 'nuevos_ingresos',
      nombre: 'Nuevos Ingresos',
      icon: UserPlus,
      submodulos: [
        { id: 'requerimientos' as SeccionRRHH, label: 'Requerimientos', icon: UserPlus, badge: '4' },
        { id: 'cartera_cv' as SeccionRRHH, label: "Cartera CV's", icon: Briefcase, badge: '35' },
        { id: 'entrevistas' as SeccionRRHH, label: 'Entrevistas', icon: Clock, badge: '2 hoy' },
        { id: 'candidatos' as SeccionRRHH, label: 'Pipeline Ingreso', icon: Users, badge: '4' },
        { id: 'planillas' as SeccionRRHH, label: 'Planillas', icon: FileCheck }
      ]
    },
    {
      id: 'proyectos',
      nombre: 'Proyectos',
      icon: HardHat,
      submodulos: [
        { id: 'cuadrillas' as SeccionRRHH, label: 'Cuadrillas', icon: HardHat, badge: '7 activas' }
      ]
    },
    {
      id: 'solicitudes',
      nombre: 'Solicitudes',
      icon: Building2,
      submodulos: [
        { id: 'sol_plazas' as SeccionRRHH, label: 'Apertura de Plazas', icon: Building2, badge: '2' }
      ]
    },
    {
      id: 'mi_ficha',
      nombre: 'Mi Ficha',
      icon: UserCheck,
      submodulos: [
        { id: 'mi_ficha' as SeccionRRHH, label: 'Mi Ficha', icon: UserCheck }
      ]
    }
  ], []);

  // Determinar la categoría activa a partir de seccionActiva
  const categoriaActivaObj = useMemo(() => {
    return CATEGORIAS_RRHH.find(cat => cat.submodulos.some(sub => sub.id === seccionActiva)) || CATEGORIAS_RRHH[0];
  }, [CATEGORIAS_RRHH, seccionActiva]);

  return (
    <div className="space-y-6 pb-16 animate-fadeIn">
      {/* ================= TOAST NOTIFICATION ================= */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2.5 text-xs font-semibold animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ================= HEADER PRINCIPAL DE RRHH (LIMPIO Y SIN CUADRADOS AMUÑUÑADOS) ================= */}
      <div className="bg-gradient-to-r from-[#0b2a63] via-[#0d3fc0] to-[#1e58d8] text-white rounded-2xl p-5 sm:p-6 shadow-xl border border-blue-400/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="bg-white/20 text-blue-100 text-[10px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded-md border border-white/20">
                Talento Humano · TIMACA
              </span>
              <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Sincronizado con Obra & Nómina
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              <Users className="w-7 h-7 text-sky-300" />
              <span>Gestión de Talento Humano & Personal</span>
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 max-w-2xl leading-relaxed">
              Estructura organizativa, expedientes 360°, contratos con semáforo de vencimiento, control diario de asistencia, reclutamiento y asignación de cuadrillas operativas en TIMACA.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center shrink-0">
            {onVolver && (
              <button
                onClick={onVolver}
                className="flex items-center gap-1.5 text-xs font-bold bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-xl border border-white/20 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver a Costos</span>
              </button>
            )}
            <button
              onClick={() => showToast('Datos de personal sincronizados con la base central.')}
              className="flex items-center gap-1.5 text-xs font-bold bg-sky-500 hover:bg-sky-400 text-slate-950 px-3.5 py-2 rounded-xl shadow-md transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sincronizar</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================= BARRA DE SECCIONES PRINCIPALES Y SUB-MÓDULOS DEBAJO ================= */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-xs space-y-2.5">
        {/* Tier 1: Secciones Principales */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {CATEGORIAS_RRHH.map(cat => {
            const Icon = cat.icon;
            const isCatActive = cat.id === categoriaActivaObj.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSeccionActiva(cat.submodulos[0].id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isCatActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20 ring-1 ring-blue-300'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isCatActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{cat.nombre}</span>
              </button>
            );
          })}
        </div>

        {/* Tier 2: Sub-módulos organizados DEBAJO de la sección correspondiente */}
        {categoriaActivaObj.submodulos.length > 1 && (
          <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto">
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider pl-1 pr-2 shrink-0">
              Vistas:
            </span>
            {categoriaActivaObj.submodulos.map(sub => {
              const SubIcon = sub.icon;
              const isSubActive = seccionActiva === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => setSeccionActiva(sub.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    isSubActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/60'
                  }`}
                >
                  <SubIcon className={`w-3 h-3 ${isSubActive ? 'text-blue-300' : 'text-slate-400'}`} />
                  <span>{sub.label}</span>
                  {sub.badge && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                      isSubActive 
                        ? 'bg-blue-500/30 text-blue-200' 
                        : (sub.badgeColor || 'bg-slate-200 text-slate-700')
                    }`}>
                      {sub.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ================= 1. TABLERO DE INDICADORES ================= */}
      {seccionActiva === 'inicio' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Tarjeta 1: Fuerza Laboral */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Fuerza Laboral</span>
                <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                  <Users className="w-4 h-4" />
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-slate-600">Total Trabajadores:</span>
                  <span className="text-xl font-black text-slate-900">{MOCK_INDICADORES_RRHH.personalActivo}</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-slate-500">Nómina TIMACA fija:</span>
                  <span className="text-xs font-bold text-slate-800">{MOCK_INDICADORES_RRHH.enNominaDirecta}</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-slate-500">Honorarios Profesionales:</span>
                  <span className="text-xs font-bold text-slate-800">{MOCK_INDICADORES_RRHH.personalActivo - MOCK_INDICADORES_RRHH.enNominaDirecta}</span>
                </div>
                <div className="pt-2 border-t border-slate-100 flex justify-between items-baseline">
                  <span className="text-xs text-slate-500">Antigüedad mediana:</span>
                  <span className="text-xs font-bold text-blue-600">{MOCK_INDICADORES_RRHH.antiguedadMedianaAnios} años</span>
                </div>
              </div>
            </div>

            {/* Tarjeta 2: Semáforo de Contratos */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Estado de Contratos</span>
                <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                  <FileSignature className="w-4 h-4" />
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    Contratos Vigentes
                  </span>
                  <span className="font-bold text-emerald-700">{MOCK_INDICADORES_RRHH.contratosVigentes}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    Por Vencer (&lt;30 días)
                  </span>
                  <span className="font-bold text-amber-700">{MOCK_INDICADORES_RRHH.contratosPorVencer}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                    Vencidos (Requieren acción)
                  </span>
                  <span className="font-bold text-rose-700">{MOCK_INDICADORES_RRHH.contratosVencidos}</span>
                </div>
                <div className="pt-2 border-t border-slate-100 flex justify-between items-baseline">
                  <span className="text-xs text-slate-500">Esperando respuesta de jefes:</span>
                  <span className="text-xs font-bold text-amber-600">{MOCK_INDICADORES_RRHH.contratosSinDecision}</span>
                </div>
              </div>
            </div>

            {/* Tarjeta 3: Reclutamiento & Eficiencia */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Atracción de Talento</span>
                <span className="p-1.5 rounded-lg bg-sky-50 text-sky-600">
                  <Briefcase className="w-4 h-4" />
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-slate-600">CV's en Cartera:</span>
                  <span className="text-xl font-black text-slate-900">{MOCK_INDICADORES_RRHH.candidatosDisponibles}</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-slate-500">Ex-trabajadores (Reingresos):</span>
                  <span className="text-xs font-bold text-emerald-600">{MOCK_INDICADORES_RRHH.candidatosYaTrabajaronAqui}</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-slate-500">Tiempo medio para contratar:</span>
                  <span className="text-xs font-bold text-slate-800">{MOCK_INDICADORES_RRHH.diasPromedioContratar} días</span>
                </div>
                <div className="pt-2 border-t border-slate-100 flex justify-between items-baseline">
                  <span className="text-xs text-slate-500">Ingresos esperando dotación:</span>
                  <span className="text-xs font-bold text-indigo-600">{MOCK_INDICADORES_RRHH.ingresosEsperandoEquipo} personas</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bandeja de Tareas Críticas del Día */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BadgeAlert className="w-5 h-5 text-amber-500" />
              <span>Pendientes que exigen acción hoy</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/70 space-y-1">
                <span className="text-xs font-bold text-amber-900 block">7 Contratos por Vencer sin Respuesta</span>
                <p className="text-[11px] text-amber-700 leading-relaxed">
                  Los supervisores de obra de PMH y Pellas no han emitido criterio de renovación para el lote de fin de mes.
                </p>
                <button
                  onClick={() => { setSeccionActiva('contratos'); setFiltroTabContratos('por_responder'); }}
                  className="text-[11px] font-bold text-amber-900 underline mt-1 block cursor-pointer"
                >
                  Ir a responder contratos &rarr;
                </button>
              </div>

              <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/70 space-y-1">
                <span className="text-xs font-bold text-blue-900 block">2 Candidatos con Ingreso Pautado</span>
                <p className="text-[11px] text-blue-700 leading-relaxed">
                  Pase de acceso y dotación de bragas/calzado pendientes por coordinar con almacén para el 13 de octubre.
                </p>
                <button
                  onClick={() => setSeccionActiva('candidatos')}
                  className="text-[11px] font-bold text-blue-900 underline mt-1 block cursor-pointer"
                >
                  Ver pipeline de ingreso &rarr;
                </button>
              </div>

              <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/70 space-y-1">
                <span className="text-xs font-bold text-rose-900 block">2 Transitorios de Asistencia por Vencer</span>
                <p className="text-[11px] text-rose-700 leading-relaxed">
                  Héctor Subero y Wilmer Cardozo tienen plazo vencido para consignar justificativo médico de reposo.
                </p>
                <button
                  onClick={() => { setSeccionActiva('asistencia'); setTabAsistencia('transitorios'); }}
                  className="text-[11px] font-bold text-rose-900 underline mt-1 block cursor-pointer"
                >
                  Resolver transitorios &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= 2. ORGANIGRAMA Y ESTRUCTURA ORGANIZATIVA ================= */}
      {seccionActiva === 'organizacion' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Network className="w-5 h-5 text-blue-600" />
                <span>Estructura Organizativa & Jerarquías TIMACA</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Diagrama en tiempo real con plazas aprobadas, plazas ocupadas y estado de las jefaturas.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Titular
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Por Encargo
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Vacante
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {MOCK_UNIDADES_ORGANIGRAMA.map(u => (
              <div
                key={u.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-white transition-all shadow-2xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase">{u.codigo} · {u.nivel}</span>
                    <h4 className="text-sm font-bold text-slate-900 mt-0.5">{u.nombre}</h4>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    u.tipoJefatura === 'titular'
                      ? 'bg-blue-100 text-blue-700'
                      : u.tipoJefatura === 'encargo'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-rose-100 text-rose-700'
                  }`}>
                    {u.tipoJefatura === 'encargo' ? 'Por Encargo' : u.tipoJefatura}
                  </span>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-100 space-y-1 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Quién lidera la unidad</span>
                  <div className="font-bold text-slate-800">{u.jefeNombre}</div>
                  <div className="text-[11px] text-slate-500">{u.jefeCargo} {u.jefeCedula ? `(${u.jefeCedula})` : ''}</div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-blue-50 p-2 rounded-lg">
                    <span className="text-[9px] text-blue-600 block uppercase font-bold">Plazas</span>
                    <span className="font-black text-blue-900">{u.plazasAprobadas}</span>
                  </div>
                  <div className="bg-emerald-50 p-2 rounded-lg">
                    <span className="text-[9px] text-emerald-600 block uppercase font-bold">Ocupadas</span>
                    <span className="font-black text-emerald-900">{u.plazasOcupadas}</span>
                  </div>
                  <div className="bg-slate-100 p-2 rounded-lg">
                    <span className="text-[9px] text-slate-600 block uppercase font-bold">Personal</span>
                    <span className="font-black text-slate-900">{u.genteTotal}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-700">Oficios: </span>
                  {u.oficiosPrincipales.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= 3. EXPEDIENTES DE EMPLEADOS ================= */}
      {seccionActiva === 'empleados' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-blue-600" />
                <span>Expedientes de Personal & Directorio 360°</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Consulta y edición de fichas maestras, cargas familiares, gaveta digital y antecedentes laborales.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => showToast('Exportando directorio de personal a Excel (XLSX)...')}
                className="flex items-center gap-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl border border-slate-200 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar</span>
              </button>
            </div>
          </div>

          {/* Mini-cuadros de indicadores de Personal (Puestos debajo de la sección correspondida) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3">
              <span className="text-[10px] font-bold text-blue-700 uppercase font-mono block">Personal Activo</span>
              <span className="text-sm font-black text-blue-950 mt-0.5 block">{MOCK_INDICADORES_RRHH.personalActivo} trabajadores</span>
            </div>
            <div className="bg-sky-50/70 border border-sky-200/80 rounded-xl p-3">
              <span className="text-[10px] font-bold text-sky-700 uppercase font-mono block">Nómina Directa</span>
              <span className="text-sm font-black text-sky-950 mt-0.5 block">{MOCK_INDICADORES_RRHH.enNominaDirecta} fijos</span>
            </div>
            <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-xl p-3">
              <span className="text-[10px] font-bold text-indigo-700 uppercase font-mono block">Honorarios / Obra</span>
              <span className="text-sm font-black text-indigo-950 mt-0.5 block">{MOCK_INDICADORES_RRHH.personalActivo - MOCK_INDICADORES_RRHH.enNominaDirecta} contratados</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <span className="text-[10px] font-bold text-slate-600 uppercase font-mono block">Antigüedad Media</span>
              <span className="text-sm font-black text-slate-900 mt-0.5 block">{MOCK_INDICADORES_RRHH.antiguedadMediaAnios} años</span>
            </div>
          </div>

          {/* Filtros de Expediente */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Nombre, cédula, cargo o código TIM..."
                value={searchEmpleados}
                onChange={e => setSearchEmpleados(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <select
                value={filtroGerenciaEmpleado}
                onChange={e => setFiltroGerenciaEmpleado(e.target.value)}
                className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="TODAS">Todas las Gerencias</option>
                <option value="Gerencia General de Operaciones & Obras">Operaciones & Obras</option>
                <option value="Gerencia de Taller & Fabricación Metalmecánica">Taller & Fabricación</option>
                <option value="Presidencia & Junta Directiva">Presidencia / Costos</option>
              </select>
            </div>
            <div>
              <select
                value={filtroSindicatoEmpleado}
                onChange={e => setFiltroSindicatoEmpleado(e.target.value)}
                className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="TODOS">Condición Sindical: Todos</option>
                <option value="SI">Sindicalizado</option>
                <option value="NO">No Sindicalizado</option>
              </select>
            </div>
          </div>

          {/* Tabla de Expedientes */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider font-mono">
                <tr>
                  <th className="py-3 px-3">Código</th>
                  <th className="py-3 px-3">Trabajador & Cédula</th>
                  <th className="py-3 px-3">Puesto / Cargo</th>
                  <th className="py-3 px-3">Gerencia / Frente</th>
                  <th className="py-3 px-3">Antigüedad</th>
                  <th className="py-3 px-3">Sindicato</th>
                  <th className="py-3 px-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {empleadosFiltrados.map(emp => (
                  <tr key={emp.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-blue-700">{emp.codigoEmpleado}</td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{emp.nombreCompleto}</div>
                      <div className="text-[11px] text-slate-500 font-mono">V-{emp.cedula}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-slate-800 font-semibold">{emp.puestoCargo}</div>
                      <div className="text-[10px] text-slate-400">{emp.nivelJerarquico}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      <div>{emp.frente}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{emp.gerencia}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-700 font-medium">{emp.antiguedadTexto}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        emp.perteneceSindicato ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {emp.perteneceSindicato ? 'Sindicato' : 'No'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => { setSelectedEmpleadoExpediente(emp); setExpedienteSubTab('personales'); }}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white font-bold transition-all cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver Ficha 360°</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= MODAL DE FICHA 360° DEL EXPEDIENTE ================= */}
      {selectedEmpleadoExpediente && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-fadeIn">
            {/* Header Modal */}
            <div className="p-5 bg-gradient-to-r from-[#0b2a63] to-[#0d3fc0] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/20 border border-white/30 flex items-center justify-center font-black text-lg">
                  {selectedEmpleadoExpediente.nombreCompleto.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-black">{selectedEmpleadoExpediente.nombreCompleto}</h3>
                  <div className="flex items-center gap-2 text-xs text-blue-200 font-mono">
                    <span>V-{selectedEmpleadoExpediente.cedula}</span>
                    <span>·</span>
                    <span>{selectedEmpleadoExpediente.codigoEmpleado}</span>
                    <span>·</span>
                    <span className="bg-white/20 text-white px-2 py-0.2 rounded text-[10px] uppercase font-sans">
                      {selectedEmpleadoExpediente.puestoCargo}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedEmpleadoExpediente(null)}
                className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors cursor-pointer text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Pestañas del Expediente (TIMACA) */}
            <div className="flex items-center gap-1 px-5 pt-3 border-b border-slate-200 bg-slate-50 shrink-0 overflow-x-auto text-xs font-bold">
              {[
                { id: 'personales', label: 'Personales & Tallas' },
                { id: 'laborales', label: 'Puesto & Laborales' },
                { id: 'familia', label: `Cargas Familiares (${selectedEmpleadoExpediente.cargasFamiliares.length})` },
                { id: 'documentos', label: `Gaveta Digital (${selectedEmpleadoExpediente.documentos.length})` },
                { id: 'cursos', label: `Cursos & Charlas HSE (${selectedEmpleadoExpediente.cursosCharlas.length})` },
                { id: 'historial', label: 'Historial Inmutable' }
              ].map(sub => (
                <button
                  key={sub.id}
                  onClick={() => setExpedienteSubTab(sub.id as any)}
                  className={`py-2 px-3 border-b-2 transition-all cursor-pointer ${
                    expedienteSubTab === sub.id
                      ? 'border-blue-600 text-blue-700 font-black'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>

            {/* Contenido del Expediente */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {expedienteSubTab === 'personales' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Identificación</span>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">Cédula:</span>
                      <span className="font-bold text-slate-900 font-mono">V-{selectedEmpleadoExpediente.cedula}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">Fecha de Nacimiento:</span>
                      <span className="font-bold text-slate-900">{selectedEmpleadoExpediente.fechaNacimiento} ({selectedEmpleadoExpediente.edad} años)</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">Estado Civil:</span>
                      <span className="font-bold text-slate-900">{selectedEmpleadoExpediente.estadoCivil}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Teléfono:</span>
                      <span className="font-bold text-slate-900">{selectedEmpleadoExpediente.telefono}</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Dotación & Tallas Oficiales</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center pt-1">
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <span className="text-[9px] text-slate-400 block font-bold uppercase">Camisa</span>
                        <span className="font-black text-sm text-slate-900">{selectedEmpleadoExpediente.tallas.camisa}</span>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <span className="text-[9px] text-slate-400 block font-bold uppercase">Pantalón</span>
                        <span className="font-black text-sm text-slate-900">{selectedEmpleadoExpediente.tallas.pantalon}</span>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <span className="text-[9px] text-slate-400 block font-bold uppercase">Calzado</span>
                        <span className="font-black text-sm text-slate-900">{selectedEmpleadoExpediente.tallas.zapato}</span>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <span className="text-[9px] text-slate-400 block font-bold uppercase">Braga</span>
                        <span className="font-black text-sm text-slate-900">{selectedEmpleadoExpediente.tallas.braga || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="pt-2 text-[11px] text-slate-500">
                      <span className="font-bold text-slate-700">Dirección de habitación: </span>
                      {selectedEmpleadoExpediente.direccion}
                    </div>
                  </div>
                </div>
              )}

              {expedienteSubTab === 'laborales' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Ubicación Estructural</span>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">Gerencia:</span>
                      <span className="font-bold text-slate-900">{selectedEmpleadoExpediente.gerencia}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">Departamento:</span>
                      <span className="font-bold text-slate-900">{selectedEmpleadoExpediente.departamento}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">Frente de Trabajo:</span>
                      <span className="font-bold text-blue-700">{selectedEmpleadoExpediente.frente}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Jefe Directo:</span>
                      <span className="font-bold text-slate-900">{selectedEmpleadoExpediente.jefeDirecto}</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Régimen & Nómina</span>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">Tipo de Nómina:</span>
                      <span className="font-bold text-slate-900">{selectedEmpleadoExpediente.tipoNomina === 'nomina_timaca' ? 'Nómina TIMACA' : 'Honorarios'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">Duración Contrato:</span>
                      <span className="font-bold text-slate-900 uppercase">{selectedEmpleadoExpediente.modalidad}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">Fecha de Ingreso:</span>
                      <span className="font-bold text-slate-900">{selectedEmpleadoExpediente.fechaIngreso} ({selectedEmpleadoExpediente.antiguedadTexto})</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Sindicato:</span>
                      <span className={`font-bold ${selectedEmpleadoExpediente.perteneceSindicato ? 'text-indigo-700' : 'text-slate-500'}`}>
                        {selectedEmpleadoExpediente.perteneceSindicato ? 'Sindicalizado' : 'No Sindicalizado'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {expedienteSubTab === 'familia' && (
                <div className="space-y-3">
                  {selectedEmpleadoExpediente.cargasFamiliares.length === 0 ? (
                    <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center text-slate-500">
                      Sin cargas familiares registradas o declarado como no aplicable.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedEmpleadoExpediente.cargasFamiliares.map(cfg => (
                        <div key={cfg.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                          <div className="flex justify-between items-baseline">
                            <span className="font-bold text-slate-900">{cfg.nombreCompleto}</span>
                            <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">
                              {cfg.parentesco}
                            </span>
                          </div>
                          <div className="text-slate-500 text-[11px]">
                            Nacimiento: {cfg.fechaNacimiento} ({cfg.edad} años)
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {expedienteSubTab === 'documentos' && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center pb-2">
                    <span className="text-[11px] text-slate-500">Gaveta digital de recaudos obligatorios</span>
                    <button
                      onClick={() => showToast('Abriendo selector de archivos para subir documento...')}
                      className="flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:underline cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Subir Documento
                    </button>
                  </div>
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                    {selectedEmpleadoExpediente.documentos.map(doc => (
                      <div key={doc.id} className="p-3 bg-slate-50/70 hover:bg-white flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <div>
                            <div className="font-bold text-slate-800">{doc.nombreArchivo}</div>
                            <div className="text-[10px] text-slate-400">{doc.tipo} · Subido el {doc.fechaSubida} · {doc.tamanioKb} KB</div>
                          </div>
                        </div>
                        <button
                          onClick={() => showToast(`Abriendo visor de ${doc.nombreArchivo}`)}
                          className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                        >
                          Ver ↗
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {expedienteSubTab === 'cursos' && (
                <div className="space-y-2">
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                    {selectedEmpleadoExpediente.cursosCharlas.map(cur => (
                      <div key={cur.id} className="p-3 bg-slate-50/70 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900">{cur.nombre}</div>
                          <div className="text-[10px] text-slate-500">
                            {cur.tipo.toUpperCase()} · {cur.fecha} · Facilitador: {cur.facilitador} ({cur.duracionHoras}h)
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Completado
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {expedienteSubTab === 'historial' && (
                <div className="space-y-3">
                  <div className="text-[11px] text-slate-400 font-mono">
                    * Registro histórico inmutable protegido contra eliminación.
                  </div>
                  <div className="relative pl-4 border-l-2 border-blue-200 space-y-4">
                    {selectedEmpleadoExpediente.historialEventos.map(ev => (
                      <div key={ev.id} className="relative">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-600 absolute -left-[21px] top-1"></div>
                        <span className="text-[10px] font-mono font-bold text-slate-400">{ev.fecha} · {ev.tipo.toUpperCase()}</span>
                        <div className="text-slate-800 font-semibold mt-0.5">{ev.descripcion}</div>
                        <div className="text-[10px] text-slate-400">Por: {ev.registradoPor}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Modal */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
              <button
                onClick={() => setSelectedEmpleadoExpediente(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Cerrar Expediente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= 4. GESTIÓN DE CONTRATOS ================= */}
      {seccionActiva === 'contratos' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileSignature className="w-5 h-5 text-blue-600" />
                <span>Control Contractual & Semáforo de Vencimientos</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Vigencias, alertas preventivas, addendums y respuestas requeridas por los líderes de área.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFiltroTabContratos(filtroTabContratos === 'todos' ? 'por_responder' : 'todos')}
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  filtroTabContratos === 'por_responder'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Te toca responder (1)</span>
              </button>
              <button
                onClick={() => showToast('Abriendo formulario para generar nuevo contrato laboral...')}
                className="flex items-center gap-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Nuevo Contrato</span>
              </button>
            </div>
          </div>

          {/* Mini-cuadros de indicadores de Contratos (Puestos debajo de la sección correspondida) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3">
              <span className="text-[10px] font-bold text-emerald-800 uppercase font-mono block">Vigentes</span>
              <span className="text-sm font-black text-emerald-950 mt-0.5 block">{MOCK_INDICADORES_RRHH.contratosVigentes} contratos</span>
            </div>
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3">
              <span className="text-[10px] font-bold text-amber-800 uppercase font-mono block">Por Vencer (&lt;30d)</span>
              <span className="text-sm font-black text-amber-950 mt-0.5 block">{MOCK_INDICADORES_RRHH.contratosPorVencer} alertas</span>
            </div>
            <div className="bg-rose-50/70 border border-rose-200/80 rounded-xl p-3">
              <span className="text-[10px] font-bold text-rose-800 uppercase font-mono block">Vencidos Urgentes</span>
              <span className="text-sm font-black text-rose-950 mt-0.5 block">{MOCK_INDICADORES_RRHH.contratosVencidos} vencidos</span>
            </div>
            <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3">
              <span className="text-[10px] font-bold text-blue-800 uppercase font-mono block">Por Responder</span>
              <span className="text-sm font-black text-blue-950 mt-0.5 block">{MOCK_INDICADORES_RRHH.contratosSinDecision} pendientes</span>
            </div>
          </div>

          {/* Filtros Contratos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por trabajador, cédula o cargo..."
                value={searchContratos}
                onChange={e => setSearchContratos(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <select
                value={filtroSemaforoContrato}
                onChange={e => setFiltroSemaforoContrato(e.target.value)}
                className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="TODOS">Todos los Semáforos</option>
                <option value="vigente">Vigentes (En fecha)</option>
                <option value="por_vencer">Por Vencer (&lt;30 días)</option>
                <option value="vencido">Vencidos</option>
              </select>
            </div>
          </div>

          {/* Tabla de Contratos */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider font-mono">
                <tr>
                  <th className="py-3 px-3">N° Contrato</th>
                  <th className="py-3 px-3">Trabajador</th>
                  <th className="py-3 px-3">Cargo & Jefe</th>
                  <th className="py-3 px-3">Modalidad</th>
                  <th className="py-3 px-3">Vencimiento</th>
                  <th className="py-3 px-3">Semáforo</th>
                  <th className="py-3 px-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contratosFiltrados.map(cnt => (
                  <tr key={cnt.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-800">{cnt.numeroContrato}</td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{cnt.empleadoNombre}</div>
                      <div className="text-[11px] text-slate-500 font-mono">V-{cnt.cedula}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-slate-800 font-semibold">{cnt.cargo}</div>
                      <div className="text-[10px] text-slate-400">Jefe: {cnt.jefeDirecto}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="capitalize text-slate-700 font-medium">
                        {cnt.modalidad === 'nomina_timaca' ? 'Nómina TIMACA' : 'Honorarios'}
                      </span>
                      <div className="text-[10px] text-slate-400">({cnt.tipoDuracion})</div>
                    </td>
                    <td className="py-3 px-3">
                      {cnt.fechaFin ? (
                        <div>
                          <span className="font-bold text-slate-800">{cnt.fechaFin}</span>
                          <span className="block text-[10px] text-slate-400">
                            {cnt.diasParaVencer! > 0 ? `Quedan ${cnt.diasParaVencer} días` : `Vencido hace ${Math.abs(cnt.diasParaVencer!)} días`}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">Indefinido</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        cnt.semaforo === 'vigente'
                          ? 'bg-emerald-100 text-emerald-800'
                          : cnt.semaforo === 'por_vencer'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {cnt.semaforo === 'por_vencer' ? 'Por Vencer' : cnt.semaforo}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right space-x-1.5">
                      <button
                        onClick={() => showToast(`Renovación iniciada para ${cnt.empleadoNombre}`)}
                        className="px-2 py-1 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white font-bold transition-all cursor-pointer"
                      >
                        Renovar
                      </button>
                      <button
                        onClick={() => showToast(`Generando addendum de extensión para contrato ${cnt.numeroContrato}`)}
                        className="px-2 py-1 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold transition-all cursor-pointer"
                      >
                        Addendum
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= 5. HISTORIAL DE EGRESOS ================= */}
      {seccionActiva === 'historial_egresos' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <UserMinus className="w-5 h-5 text-rose-600" />
                <span>Historial de Egresos & Control de Recontratabilidad</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Archivo histórico de desincorporaciones, causas de retiro, vetos y seguimiento de reingresos.
              </p>
            </div>
            <button
              onClick={() => showToast('Exportando historial completo de egresos a Excel...')}
              className="flex items-center gap-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl border border-slate-200 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Egresos</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
            {MOCK_EGRESOS.map(eg => (
              <div key={eg.id} className="p-4 bg-slate-50/50 hover:bg-white transition-colors space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-sm text-slate-900">{eg.nombreCompleto}</span>
                    <span className="text-slate-500 font-mono ml-2">V-{eg.cedula}</span>
                    <span className="text-slate-400 ml-2">· {eg.cargoAlSalir} ({eg.gerenciaAlSalir})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      eg.puedeVolver ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800 font-black'
                    }`}>
                      {eg.puedeVolver ? 'Sin Objeción' : 'VETADO / NO RECONTRATABLE'}
                    </span>
                    {eg.volvioDespues && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                        Reingresó
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200/80">
                  <div>
                    <span className="font-semibold text-slate-700">Fecha de Egreso: </span>
                    {eg.fechaEgreso} (Duró: {eg.tiempoDuracionTexto})
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Motivo: </span>
                    <span className="capitalize">{eg.motivoEgreso}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Jefe al Salir: </span>
                    {eg.jefeAlSalir}
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 italic">
                  &ldquo;{eg.motivoDetalle}&rdquo; {eg.observacionRecontratabilidad && `— ${eg.observacionRecontratabilidad}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= 6. CONTROL DE ASISTENCIA ================= */}
      {seccionActiva === 'asistencia' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CalendarCheck2 className="w-5 h-5 text-emerald-600" />
                <span>Control Diario de Asistencia en Obra & Turnos</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Pase de lista por frente operativo y resolución de ausencias transitorias.
              </p>
            </div>
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold">
              <button
                onClick={() => setTabAsistencia('asistencia')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  tabAsistencia === 'asistencia' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Pase de Lista (Hoy)
              </button>
              <button
                onClick={() => setTabAsistencia('transitorios')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                  tabAsistencia === 'transitorios' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <span>Transitorios</span>
                <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px]">2</span>
              </button>
            </div>
          </div>

          {/* Mini-cuadros de indicadores de Asistencia (Puestos debajo de la sección correspondida) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3">
              <span className="text-[10px] font-bold text-emerald-800 uppercase font-mono block">Asistencia Hoy</span>
              <span className="text-sm font-black text-emerald-950 mt-0.5 block">{MOCK_INDICADORES_RRHH.asistenciaHoyPorcentaje}%</span>
            </div>
            <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3">
              <span className="text-[10px] font-bold text-blue-800 uppercase font-mono block">Presentes</span>
              <span className="text-sm font-black text-blue-950 mt-0.5 block">168 en sitio</span>
            </div>
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3">
              <span className="text-[10px] font-bold text-amber-800 uppercase font-mono block">Tardanzas</span>
              <span className="text-sm font-black text-amber-950 mt-0.5 block">4 reportes</span>
            </div>
            <div className="bg-purple-50/70 border border-purple-200/80 rounded-xl p-3">
              <span className="text-[10px] font-bold text-purple-800 uppercase font-mono block">Transitorios</span>
              <span className="text-sm font-black text-purple-950 mt-0.5 block">2 justificados</span>
            </div>
          </div>

          {tabAsistencia === 'asistencia' ? (
            <div className="space-y-4">
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider font-mono">
                    <tr>
                      <th className="py-3 px-3">Trabajador</th>
                      <th className="py-3 px-3">Frente & Obra</th>
                      <th className="py-3 px-3">Cuadrilla</th>
                      <th className="py-3 px-3">Turno</th>
                      <th className="py-3 px-3">Marcaje de Hoy</th>
                      <th className="py-3 px-3 text-right">Acción Rápida</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {registrosAsistencia.map(as => (
                      <tr key={as.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900">{as.nombreCompleto}</div>
                          <div className="text-[11px] text-slate-500">{as.cargo}</div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-800">{as.frente}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{as.obraProyecto}</div>
                        </td>
                        <td className="py-3 px-3 text-slate-600">{as.cuadrillaNombre || 'Sin Cuadrilla'}</td>
                        <td className="py-3 px-3 capitalize text-slate-700">{as.turno}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                            as.marca === 'P'
                              ? 'bg-emerald-100 text-emerald-800'
                              : as.marca === 'T'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {as.marca === 'P' ? 'PRESENTE' : as.marca === 'T' ? `TARDE (${as.horaEntrada})` : 'AUSENTE'}
                          </span>
                          {as.motivoTardanza && (
                            <span className="block text-[10px] text-amber-700 mt-1 max-w-[180px] truncate" title={as.motivoTardanza}>
                              {as.motivoTardanza}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right space-x-1">
                          <button
                            onClick={() => handleMarcarAsistencia(as.id, 'P')}
                            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 rounded font-bold cursor-pointer transition-colors"
                          >
                            P
                          </button>
                          <button
                            onClick={() => handleMarcarAsistencia(as.id, 'T')}
                            className="px-2 py-1 bg-amber-50 hover:bg-amber-600 hover:text-white text-amber-700 rounded font-bold cursor-pointer transition-colors"
                          >
                            T
                          </button>
                          <button
                            onClick={() => handleMarcarAsistencia(as.id, 'A')}
                            className="px-2 py-1 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 rounded font-bold cursor-pointer transition-colors"
                          >
                            A
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-xs text-amber-800 leading-relaxed">
                <strong>¿Qué es un Transitorio de Asistencia?</strong> Es una falta registrada sin justificativo inmediato. El sistema otorga una cuenta regresiva para presentar reposo médico o constancia legal antes de consolidar la ausencia como falta injustificada.
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
                {MOCK_TRANSITORIOS_ASISTENCIA.map(tr => (
                  <div key={tr.id} className="p-4 bg-slate-50/50 hover:bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{tr.nombreCompleto}</span>
                        <span className="text-slate-500 font-mono">V-{tr.cedula}</span>
                        <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                          tr.semaforo === 'amarillo' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {tr.horasParaVencer > 0 ? `${tr.horasParaVencer}h restantes` : 'Plazo Vencido'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 mt-1">
                        Proyecto: {tr.proyecto} · Falta el: {tr.fechaFalta}
                      </div>
                      <div className="text-[11px] text-slate-500 italic mt-0.5">
                        {tr.motivoPreliminar}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => showToast(`Justificativo aceptado para ${tr.nombreCompleto}`)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg cursor-pointer"
                      >
                        Justificar
                      </button>
                      <button
                        onClick={() => showToast(`Falta consolidada como injustificada para ${tr.nombreCompleto}`)}
                        className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold rounded-lg cursor-pointer"
                      >
                        Injustificada
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= 7. SOLICITUD DE REQUERIMIENTOS ================= */}
      {seccionActiva === 'requerimientos' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                <span>Requisiciones de Personal (Requerimientos)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Solicitudes de contratación originadas por proyectos y departamentos para cubrir vacantes.
              </p>
            </div>
            <button
              onClick={() => showToast('Abriendo formulario de nueva requisición de personal...')}
              className="flex items-center gap-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Nuevo Requerimiento</span>
            </button>
          </div>

          {/* Mini-cuadros de indicadores de Reclutamiento (Puestos debajo de la sección correspondida) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3">
              <span className="text-[10px] font-bold text-blue-800 uppercase font-mono block">Vacantes Activas</span>
              <span className="text-sm font-black text-blue-950 mt-0.5 block">{MOCK_INDICADORES_RRHH.requerimientosEnGestion} en bolsa</span>
            </div>
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3">
              <span className="text-[10px] font-bold text-amber-800 uppercase font-mono block">Por Aprobar</span>
              <span className="text-sm font-black text-amber-950 mt-0.5 block">2 solicitudes</span>
            </div>
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3">
              <span className="text-[10px] font-bold text-emerald-800 uppercase font-mono block">CVs Disponibles</span>
              <span className="text-sm font-black text-emerald-950 mt-0.5 block">{MOCK_INDICADORES_RRHH.candidatosDisponibles} talentos</span>
            </div>
            <div className="bg-purple-50/70 border border-purple-200/80 rounded-xl p-3">
              <span className="text-[10px] font-bold text-purple-800 uppercase font-mono block">Tiempo Promedio</span>
              <span className="text-sm font-black text-purple-950 mt-0.5 block">{MOCK_INDICADORES_RRHH.diasPromedioContratar} días</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MOCK_REQUERIMIENTOS.map(req => (
              <div key={req.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white transition-all space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-blue-700 block">{req.codigo}</span>
                    <h4 className="font-bold text-sm text-slate-900 mt-0.5">{req.cargo}</h4>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    req.estado === 'en_proceso'
                      ? 'bg-blue-100 text-blue-800'
                      : req.estado === 'pendiente_aprobacion'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {req.estado === 'en_proceso' ? 'En Proceso' : req.estado === 'pendiente_aprobacion' ? 'Por Aprobar' : 'Cerrada'}
                  </span>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-100 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Frente / Obra:</span>
                    <span className="font-bold text-slate-900">{req.frenteObra}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Cantidad requerida:</span>
                    <span className="font-bold text-slate-900">{req.contratados} de {req.cantidad} contratados</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Solicitado por:</span>
                    <span className="font-bold text-slate-900">{req.solicitanteNombre}</span>
                  </div>
                </div>

                {req.observaciones && (
                  <p className="text-[11px] text-slate-500 italic">&ldquo;{req.observaciones}&rdquo;</p>
                )}

                <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                  <span className="text-[10px] font-mono text-slate-400">Fecha: {req.fechaSolicitud}</span>
                  <button
                    onClick={() => { setSeccionActiva('candidatos'); }}
                    className="font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    Ver Candidatos Asignados &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= 8. CARTERA DE CV'S ================= */}
      {seccionActiva === 'cartera_cv' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                <span>Cartera de CV's & Banco de Talento</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Candidatos clasificados por especialidad, detección de reingresos y asignación a solicitudes.
              </p>
            </div>
            <button
              onClick={() => showToast('Abriendo ventana para cargar nuevo CV digitalizado...')}
              className="flex items-center gap-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Cargar CV</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {MOCK_CARTERA_CV.map(cv => (
              <div key={cv.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white transition-all space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{cv.nombreCompleto}</h4>
                    <span className="text-xs text-slate-500 font-mono">V-{cv.cedula}</span>
                  </div>
                  {cv.yaTrabajoAqui && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Ya trabajó aquí
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-700 font-medium">
                  {cv.profesionOficio}
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Habilidades Destacadas</span>
                  <div className="flex flex-wrap gap-1">
                    {cv.habilidadesDuras.map((h, idx) => (
                      <span key={idx} className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-[10px]">
                        {h}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                  <span className="text-slate-500 text-[11px]">{cv.telefono}</span>
                  <button
                    onClick={() => showToast(`Candidato ${cv.nombreCompleto} vinculado a requerimiento`)}
                    className="font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    Asignar &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= 9. ENTREVISTAS ================= */}
      {seccionActiva === 'entrevistas' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span>Agenda & Evaluación de Entrevistas</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Filtros de preselección, entrevistas técnicas y valoración de competencias blandas/duras.
              </p>
            </div>
            <button
              onClick={() => showToast('Abriendo programación de nueva entrevista técnica...')}
              className="flex items-center gap-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Programar Entrevista</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
            {MOCK_ENTREVISTAS.map(ent => (
              <div key={ent.id} className="p-4 bg-slate-50/50 hover:bg-white transition-colors space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-sm text-slate-900">{ent.candidatoNombre}</span>
                    <span className="text-slate-500 font-mono ml-2">V-{ent.cedula}</span>
                    <span className="text-blue-600 font-mono ml-2">[{ent.requerimientoCodigo}]</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    ent.resultado === 'aprobado' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {ent.resultado}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200/80">
                  <div>
                    <span className="font-semibold text-slate-700">Tipo: </span>
                    <span className="capitalize">{ent.tipoEntrevista}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Fecha/Hora: </span>
                    {ent.fechaHora}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Entrevistador: </span>
                    {ent.entrevistadorNombre}
                  </div>
                </div>

                {ent.observacionConfidencialRRHH && (
                  <div className="text-[11px] text-slate-600 italic">
                    &ldquo;{ent.observacionConfidencialRRHH}&rdquo;
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= 10. PIPELINE DE INGRESO (CANDIDATOS) ================= */}
      {seccionActiva === 'candidatos' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span>Pipeline de Contratación (Flujo de Ingreso)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Gestión por etapas: entrevistas, exámenes médicos, pases de acceso y emisión de contrato.
              </p>
            </div>
          </div>

          {/* Tablero Kanban de Etapas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            {[
              { id: 'en_entrevista', label: '1. En Entrevista', color: 'border-blue-500' },
              { id: 'en_decision', label: '2. En Decisión / Oferta', color: 'border-amber-500' },
              { id: 'en_examen', label: '3. En Examen Médico', color: 'border-purple-500' },
              { id: 'por_ingresar', label: '4. Por Ingresar', color: 'border-emerald-500' }
            ].map(col => {
              const items = candidatosPipeline.filter(c => c.etapaActual === col.id);
              return (
                <div key={col.id} className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-3">
                  <div className={`border-b-2 ${col.color} pb-1.5 flex justify-between items-center`}>
                    <span className="font-bold text-slate-800">{col.label}</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">
                      {items.length}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {items.map(item => (
                      <div key={item.id} className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs space-y-2">
                        <div>
                          <div className="font-bold text-slate-900">{item.nombreCompleto}</div>
                          <div className="text-[11px] text-slate-500">{item.cargoOpta}</div>
                        </div>
                        <div className="text-[10px] font-mono text-blue-600">{item.requerimientoCodigo}</div>

                        {item.fechaIngresoPautada && (
                          <div className="text-[10px] text-emerald-700 bg-emerald-50 p-1 rounded font-semibold">
                            Ingreso pautado: {item.fechaIngresoPautada}
                          </div>
                        )}

                        <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                          <button
                            onClick={() => handleAvanzarEtapaCandidato(item.id, col.id === 'en_entrevista' ? 'en_examen' : 'por_ingresar')}
                            className="text-[10px] font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                          >
                            Avanzar &rarr;
                          </button>
                        </div>
                      </div>
                    ))}
                    {items.length === 0 && (
                      <div className="text-center py-6 text-slate-400 italic text-[11px]">
                        Sin candidatos en esta fase
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= 11. PLANILLAS DE INGRESO ================= */}
      {seccionActiva === 'planillas' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-blue-600" />
                <span>Planillas de Ingreso & Recaudos Socioeconómicos</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Digitalización de datos bancarios, residencia y declaración de nuevo ingreso.
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
            {MOCK_PLANILLAS_INGRESO.map(pl => (
              <div key={pl.id} className="p-4 bg-slate-50/50 hover:bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{pl.nombreCompleto}</span>
                    <span className="text-slate-500 font-mono">V-{pl.cedula}</span>
                    <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                      pl.estado === 'llenada' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {pl.estado.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-slate-600 mt-0.5">{pl.cargoOpta} · {pl.requerimientoCodigo}</div>
                  {pl.banco && (
                    <div className="text-[11px] text-slate-500 font-mono mt-1">
                      {pl.banco}: {pl.cuentaBancariaDeclarada}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => showToast(`Imprimiendo planilla digital de ${pl.nombreCompleto}`)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer"
                  >
                    Imprimir Formato
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= 12. CUADRILLAS EN OBRA ================= */}
      {seccionActiva === 'cuadrillas' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <HardHat className="w-5 h-5 text-blue-600" />
                <span>Gestión de Cuadrillas & Frentes Operativos</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Organización de equipos en planta y muelle: coordinadores, supervisores y operarios.
              </p>
            </div>
            <button
              onClick={() => showToast('Abriendo creador de nueva cuadrilla de obra...')}
              className="flex items-center gap-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Nueva Cuadrilla</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {MOCK_CUADRILLAS_OBRA.map(cua => (
              <div key={cua.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white transition-all space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{cua.nombre}</h4>
                    <span className="text-[11px] text-blue-700 font-mono font-bold">{cua.proyectoId}</span>
                  </div>
                  <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {cua.totalGente} miembros
                  </span>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-100 text-xs space-y-1">
                  <div className="text-slate-600">
                    <span className="font-bold text-slate-700">Coordinador: </span>
                    {cua.coordinadorNombre || 'Sin coordinador'}
                  </div>
                  <div className="text-slate-600">
                    <span className="font-bold text-slate-700">Frente: </span>
                    {cua.frente}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Oficios</span>
                  <div className="flex flex-wrap gap-1">
                    {cua.oficios.map((of, idx) => (
                      <span key={idx} className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-[10px]">
                        {of}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                  <span className="text-slate-400 text-[11px]">
                    {cua.operaSinMandosIntermedios ? 'Sin mandos intermedios' : 'Con supervisión directa'}
                  </span>
                  <button
                    onClick={() => showToast(`Gestionando personal de ${cua.nombre}`)}
                    className="font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    Ver Personal &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= 13. APERTURA DE PLAZAS ================= */}
      {seccionActiva === 'sol_plazas' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <span>Solicitudes de Apertura de Plazas (Plantilla Orgánica)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Circuito de aprobación formal para incrementar puestos fijos: Gerencia &rarr; Frente &rarr; Presidencia.
              </p>
            </div>
            <button
              onClick={() => showToast('Abriendo formulario de solicitud de plaza orgánica...')}
              className="flex items-center gap-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Solicitar Plaza</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
            {MOCK_SOLICITUDES_PLAZAS.map(plz => (
              <div key={plz.id} className="p-4 bg-slate-50/50 hover:bg-white transition-colors space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-mono font-bold text-blue-700">{plz.codigo}</span>
                    <span className="font-bold text-sm text-slate-900 ml-2">{plz.cargo}</span>
                    <span className="text-slate-500 ml-2">({plz.cantidad} cupo/s)</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-100 text-purple-800">
                    {plz.estado === 'pendiente_presidencia' ? '◆ DECIDE PRESIDENCIA' : 'Pendiente Gerencia'}
                  </span>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200/80 text-slate-600 space-y-1">
                  <div><strong>Solicitante: </strong>{plz.solicitanteNombre} ({plz.gerencia})</div>
                  <div><strong>Frente/Obra: </strong>{plz.frenteObra}</div>
                  <div className="text-slate-700 italic pt-1">&ldquo;{plz.motivoJustificacion}&rdquo;</div>
                </div>

                {plz.diferenciaVersiones && (
                  <div className="bg-blue-50 p-2.5 rounded-lg border border-blue-200 text-[11px] text-blue-900">
                    <span className="font-bold block">✎ En qué difiere de lo que se pidió:</span>
                    <div><strong>Antes: </strong>{plz.diferenciaVersiones.antes}</div>
                    <div><strong>Ahora: </strong>{plz.diferenciaVersiones.ahora}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= 14. MI FICHA (AUTOSERVICIO) ================= */}
      {seccionActiva === 'mi_ficha' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-blue-600" />
                <span>Mi Ficha de Empleado (Autoservicio)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Consulta y verificación de tus datos personales, cargas familiares y dotación registrada.
              </p>
            </div>
            <button
              onClick={() => showToast('Datos personales guardados satisfactoriamente.')}
              className="flex items-center gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Guardar Cambios</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Datos del Titular</span>
              <div className="space-y-1">
                <label className="text-slate-600 font-semibold block">Nombre Completo:</label>
                <input
                  type="text"
                  defaultValue={currentUser.nombre}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg font-bold text-slate-900"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-600 font-semibold block">Cargo Oficial:</label>
                <input
                  type="text"
                  readOnly
                  defaultValue={currentUser.rol}
                  className="w-full p-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-600 cursor-not-allowed"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-600 font-semibold block">Correo Electrónico:</label>
                <input
                  type="email"
                  defaultValue={currentUser.email}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                />
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Tallas de Dotación Personal</span>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-500 text-[10px] block font-bold uppercase">Camisa</label>
                  <input type="text" defaultValue="M" className="w-full p-2 text-center font-bold bg-white border border-slate-300 rounded-lg" />
                </div>
                <div>
                  <label className="text-slate-500 text-[10px] block font-bold uppercase">Pantalón</label>
                  <input type="text" defaultValue="32" className="w-full p-2 text-center font-bold bg-white border border-slate-300 rounded-lg" />
                </div>
                <div>
                  <label className="text-slate-500 text-[10px] block font-bold uppercase">Calzado</label>
                  <input type="text" defaultValue="39" className="w-full p-2 text-center font-bold bg-white border border-slate-300 rounded-lg" />
                </div>
              </div>
              <p className="text-[11px] text-slate-500 pt-2 leading-relaxed">
                Tus tallas se sincronizan automáticamente con el Sistema de Dotación de EPP y Uniformes para tus actas de entrega semestrales.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
