import React, { useState, useMemo } from 'react';
import { UsuarioSistema } from '../../types/usuarios';
import { 
  CATALOGO_PELIGROS_OFICIAL,
  MATRIZ_IPER_INICIAL,
  PLANES_CONTROL_INICIALES,
  EvaluacionIPER,
  PlanControlRiesgo,
  PeligroCatalogo,
  NivelJerarquiaControl
} from '../../data/realSeguridadData';
import { 
  MOCK_PERMISOS_ALTO_RIESGO, 
  MOCK_BLOQUEOS_LOTOTO, 
  MOCK_CHARLAS_TDS, 
  MOCK_INSPECCIONES_HSE,
  PermisoAltoRiesgo,
  BloqueoSeguridadLOTOTO,
  CharlaSeguridadTDS,
  InspeccionHSE
} from '../../data/mockSeguridadData';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Lock, 
  Unlock, 
  Flame, 
  Zap, 
  ArrowUpRight, 
  Plus, 
  Search, 
  Filter, 
  FileCheck2, 
  HardHat, 
  Users, 
  Sparkles, 
  ChevronRight, 
  XCircle,
  Eye,
  FileText,
  Activity,
  Layers,
  ArrowLeft,
  ExternalLink,
  Download,
  BookOpen,
  Calendar,
  Truck
} from 'lucide-react';

interface SeguridadModuleViewProps {
  currentUser: UsuarioSistema;
  onVolver?: () => void;
  onGoToCertificados?: () => void;
  onGoToGruas?: () => void;
}

const GOOGLE_SHEET_SEGURIDAD_URL = 'https://docs.google.com/spreadsheets/d/1-KEmOouFYYnFxayq3uQGJgZrYCgsRFfhv1CXNKmFtX4/edit?gid=1489434091#gid=1489434091';

export const SeguridadModuleView: React.FC<SeguridadModuleViewProps> = ({
  currentUser,
  onVolver,
  onGoToCertificados,
  onGoToGruas
}) => {
  const [activeTab, setActiveTab] = useState<'planes' | 'iper' | 'tablero' | 'catalogo' | 'ptar' | 'lototo' | 'tds'>('planes');

  // Estado de Planes de Control (gid=716332079)
  const [planesControl, setPlanesControl] = useState<PlanControlRiesgo[]>(PLANES_CONTROL_INICIALES);
  const [searchPlanes, setSearchPlanes] = useState('');
  const [filtroEstadoPlan, setFiltroEstadoPlan] = useState<string>('TODOS');
  const [selectedPlanDetalle, setSelectedPlanDetalle] = useState<PlanControlRiesgo | null>(null);

  // Estado de Matriz IPER
  const [matrizIPER, setMatrizIPER] = useState<EvaluacionIPER[]>(MATRIZ_IPER_INICIAL);
  const [searchIPER, setSearchIPER] = useState('');
  const [filtroAreaIPER, setFiltroAreaIPER] = useState<string>('TODAS');
  const [filtroNivelIPER, setFiltroNivelIPER] = useState<string>('TODOS');

  // Estado de Catálogo de Peligros
  const [searchPeligros, setSearchPeligros] = useState('');
  const [filtroCategoriaPeligro, setFiltroCategoriaPeligro] = useState<string>('TODAS');

  // Operaciones en campo (PTAR, LOTOTO, TDS, Inspecciones)
  const [permisos, setPermisos] = useState<PermisoAltoRiesgo[]>(MOCK_PERMISOS_ALTO_RIESGO);
  const [bloqueos, setBloqueos] = useState<BloqueoSeguridadLOTOTO[]>(MOCK_BLOQUEOS_LOTOTO);
  const [charlas, setCharlas] = useState<CharlaSeguridadTDS[]>(MOCK_CHARLAS_TDS);
  const [inspecciones, setInspecciones] = useState<InspeccionHSE[]>(MOCK_INSPECCIONES_HSE);

  // Modal Nuevo Plan de Control
  const [isNuevoPlanOpen, setIsNuevoPlanOpen] = useState(false);
  const [formNuevoPlan, setFormNuevoPlan] = useState({
    idRiesgo: 'RSG-PALUA-001',
    area: 'Muelle Palúa (PMH)',
    puestoActividad: 'Operación de Izaje Tándem y Maniobra en Muelle',
    peligro: 'Caída de persona a distinto nivel durante acceso a pluma y cabina',
    nrInicial: 1080,
    niInicial: 'I — Intolerable' as PlanControlRiesgo['niInicial'],
    nivelJerarquia: '3 · Control de ingeniería' as NivelJerarquiaControl,
    medidaControl: '',
    responsable: currentUser.nombre,
    recursosRequeridos: '',
    fechaCompromiso: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    ndResidual: 2,
    neResidual: 2,
    ncResidual: 25,
    evidencia: ''
  });

  const canEdit = currentUser.permisos.ambitoEdicion === 'todo' || currentUser.permisos.canEditSeguridad === true;

  // KPIs del Tablero de Control CORP-035-P03 (LOPCYMAT Art. 56)
  const statsTablero = useMemo(() => {
    const totalPeligros = matrizIPER.length;
    const nivelI = matrizIPER.filter(r => r.ni === 'I — Intolerable').length;
    const nivelII = matrizIPER.filter(r => r.ni === 'II — Importante').length;
    const nivelIII = matrizIPER.filter(r => r.ni === 'III — Moderado').length;
    const nivelIV = matrizIPER.filter(r => r.ni === 'IV — Tolerable').length;

    const totalPlanes = planesControl.length;
    const planesPendientes = planesControl.filter(p => p.estado === 'Pendiente').length;
    const planesEnEjecucion = planesControl.filter(p => p.estado === 'En ejecución').length;
    const planesEjecutados = planesControl.filter(p => p.estado === 'Ejecutado' || p.estado === 'Verificado').length;
    const planesVencidos = planesControl.filter(p => p.estado === 'Vencido').length;

    const riesgosQueExigenPlan = nivelI + nivelII;
    const cobertura = riesgosQueExigenPlan > 0 
      ? Math.round((totalPlanes / riesgosQueExigenPlan) * 100) 
      : 100;

    return {
      totalPeligros,
      nivelI,
      nivelII,
      nivelIII,
      nivelIV,
      totalPlanes,
      planesPendientes,
      planesEnEjecucion,
      planesEjecutados,
      planesVencidos,
      cobertura: `${Math.min(100, cobertura)}%`,
      diasSinAccidentes: 842,
      horasHombreSeguras: 128450
    };
  }, [matrizIPER, planesControl]);

  // Filtro de Planes de Control
  const filteredPlanes = useMemo(() => {
    return planesControl.filter(p => {
      const q = searchPlanes.toLowerCase().trim();
      const matchSearch = !q ||
        p.idPlan.toLowerCase().includes(q) ||
        p.area.toLowerCase().includes(q) ||
        p.puestoActividad.toLowerCase().includes(q) ||
        p.peligro.toLowerCase().includes(q) ||
        p.responsable.toLowerCase().includes(q);

      const matchEstado = filtroEstadoPlan === 'TODOS' || p.estado === filtroEstadoPlan;
      return matchSearch && matchEstado;
    });
  }, [planesControl, searchPlanes, filtroEstadoPlan]);

  // Filtro de Matriz IPER
  const filteredIPER = useMemo(() => {
    return matrizIPER.filter(r => {
      const q = searchIPER.toLowerCase().trim();
      const matchSearch = !q ||
        r.id.toLowerCase().includes(q) ||
        r.area.toLowerCase().includes(q) ||
        r.puestoActividad.toLowerCase().includes(q) ||
        r.peligroIdentificado.toLowerCase().includes(q);

      const matchArea = filtroAreaIPER === 'TODAS' || r.area === filtroAreaIPER;
      const matchNivel = filtroNivelIPER === 'TODOS' || r.ni === filtroNivelIPER;
      return matchSearch && matchArea && matchNivel;
    });
  }, [matrizIPER, searchIPER, filtroAreaIPER, filtroNivelIPER]);

  // Filtro Catálogo Peligros
  const filteredPeligros = useMemo(() => {
    return CATALOGO_PELIGROS_OFICIAL.filter(p => {
      const q = searchPeligros.toLowerCase().trim();
      const matchSearch = !q ||
        String(p.codigo).includes(q) ||
        p.peligro.toLowerCase().includes(q) ||
        p.categoria.toLowerCase().includes(q);

      const matchCat = filtroCategoriaPeligro === 'TODAS' || p.categoria === filtroCategoriaPeligro;
      return matchSearch && matchCat;
    });
  }, [searchPeligros, filtroCategoriaPeligro]);

  const categoriasPeligrosUnicas = useMemo(() => {
    return [...new Set(CATALOGO_PELIGROS_OFICIAL.map(p => p.categoria))];
  }, []);

  const handleCrearPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNuevoPlan.medidaControl) {
      alert('Por favor especifique la medida de control a implementar.');
      return;
    }

    const npRes = formNuevoPlan.ndResidual * formNuevoPlan.neResidual;
    const nrRes = npRes * formNuevoPlan.ncResidual;
    let niRes: PlanControlRiesgo['niResidual'] = 'IV — Tolerable';
    if (nrRes >= 600) niRes = 'I — Intolerable';
    else if (nrRes >= 150) niRes = 'II — Importante';
    else if (nrRes >= 40) niRes = 'III — Moderado';

    const nuevo: PlanControlRiesgo = {
      idPlan: `PLC-2026-00${planesControl.length + 8}`,
      idRiesgo: formNuevoPlan.idRiesgo,
      area: formNuevoPlan.area,
      puestoActividad: formNuevoPlan.puestoActividad,
      peligro: formNuevoPlan.peligro,
      nrInicial: formNuevoPlan.nrInicial,
      niInicial: formNuevoPlan.niInicial,
      nivelJerarquia: formNuevoPlan.nivelJerarquia,
      medidaControl: formNuevoPlan.medidaControl,
      responsable: formNuevoPlan.responsable,
      recursosRequeridos: formNuevoPlan.recursosRequeridos || 'Recursos ordinarios de planta y HSE',
      fechaCompromiso: formNuevoPlan.fechaCompromiso,
      estado: 'En ejecución',
      ndResidual: formNuevoPlan.ndResidual,
      neResidual: formNuevoPlan.neResidual,
      ncResidual: formNuevoPlan.ncResidual,
      nrResidual: nrRes,
      niResidual: niRes,
      evidencia: formNuevoPlan.evidencia || 'Plan aperturado y asignado a responsable',
      verificadoPor: currentUser.nombre
    };

    setPlanesControl([nuevo, ...planesControl]);
    setIsNuevoPlanOpen(false);
  };

  const handleExportPlanesCSV = () => {
    const headers = [
      'ID plan', 'ID riesgo', 'Área', 'Puesto o actividad', 'Peligro',
      'NR inicial', 'NI inicial', 'Nivel de jerarquía', 'Medida de control',
      'Responsable', 'Recursos requeridos', 'Fecha compromiso', 'Estado',
      'NR residual', 'NI residual', 'Evidencia', 'Verificado por'
    ];

    const rows = filteredPlanes.map(p => [
      p.idPlan,
      p.idRiesgo,
      `"${p.area}"`,
      `"${p.puestoActividad}"`,
      `"${p.peligro}"`,
      p.nrInicial,
      `"${p.niInicial}"`,
      `"${p.nivelJerarquia}"`,
      `"${p.medidaControl}"`,
      `"${p.responsable}"`,
      `"${p.recursosRequeridos}"`,
      p.fechaCompromiso,
      `"${p.estado}"`,
      p.nrResidual,
      `"${p.niResidual}"`,
      `"${p.evidencia || ''}"`,
      `"${p.verificadoPor || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TIMACA_Planes_Control_Riesgos_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* ================= HEADER DEL MÓDULO DE SEGURIDAD ================= */}
      <div className="bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-white border border-emerald-200/90 rounded-2xl p-5 sm:p-6 text-slate-900 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                [SEG] Seguridad Industrial & Gestión de Riesgos HSE
              </span>
              <span className="text-[10px] font-mono text-emerald-800 bg-white border border-emerald-300/80 px-2 py-0.5 rounded shadow-2xs">
                Procedimiento CORP-035-P03 Rev. 3 · LOPCYMAT Art. 56 · NT-01-2008
              </span>
              <a 
                href={GOOGLE_SHEET_SEGURIDAD_URL} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[10px] font-mono text-sky-800 bg-white hover:bg-sky-50 border border-sky-300 px-2 py-0.5 rounded flex items-center gap-1 transition-colors shadow-2xs"
                title="Abrir Google Sheet oficial de Seguridad"
              >
                <ExternalLink className="w-3 h-3 text-sky-600" />
                Google Sheet Sincronizado (gid=716332079)
              </a>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-8 h-8 text-emerald-600" />
              Tablero de Control de Riesgos & Matriz IPER TIMACA
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
              Sistema integral de evaluación de riesgos, planes de control jerarquizados y seguimiento normativo para Muelle Palúa (PMH), Planta de Pellas, Taller Central y Flota de Grúas.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {onGoToCertificados && (
              <button
                onClick={onGoToCertificados}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <Users className="w-4 h-4 text-indigo-600" />
                Ver Matriz de Cursos (879)
              </button>
            )}
            {onGoToGruas && (
              <button
                onClick={onGoToGruas}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <Truck className="w-4 h-4 text-sky-600" />
                Flota de 26 Grúas
              </button>
            )}
            {onVolver && (
              <button
                onClick={onVolver}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver a Costos
              </button>
            )}
          </div>
        </div>

        {/* ================= TARJETAS KPIS LOPCYMAT ================= */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-emerald-200/80">
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
            <div className="text-[10px] text-slate-500 font-mono uppercase font-bold flex items-center justify-between">
              <span>Días Sin Accidentes</span>
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-700 mt-1">
              {statsTablero.diasSinAccidentes} Días
            </div>
            <div className="text-[10px] text-emerald-700 font-medium mt-0.5">
              {statsTablero.horasHombreSeguras.toLocaleString()} HH Seguras
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
            <div className="text-[10px] text-slate-500 font-mono uppercase font-bold flex items-center justify-between">
              <span>Riesgos Nivel I y II</span>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-700 mt-1">
              {statsTablero.nivelI + statsTablero.nivelII} Críticos
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {statsTablero.nivelI} Intolerables · {statsTablero.nivelII} Importantes
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
            <div className="text-[10px] text-slate-500 font-mono uppercase font-bold flex items-center justify-between">
              <span>Planes de Control</span>
              <FileCheck2 className="w-3.5 h-3.5 text-sky-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              {statsTablero.totalPlanes} Activos
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {statsTablero.planesEjecutados} Ejecutados / Verificados
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
            <div className="text-[10px] text-slate-500 font-mono uppercase font-bold flex items-center justify-between">
              <span>Cobertura LOPCYMAT</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-700 mt-1">
              {statsTablero.cobertura}
            </div>
            <div className="text-[10px] text-emerald-700 font-medium mt-0.5">
              100% de riesgos I y II con plan
            </div>
          </div>
        </div>
      </div>

      {/* ================= TABS DE NAVEGACIÓN ================= */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('planes')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'planes'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Planes de Control (gid=716332079)</span>
          <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
            activeTab === 'planes' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {filteredPlanes.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('iper')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'iper'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Matriz IPER Interactiva</span>
          <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
            activeTab === 'iper' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {matrizIPER.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('tablero')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'tablero'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Tablero de Control CORP-035</span>
        </button>

        <button
          onClick={() => setActiveTab('catalogo')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'catalogo'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Catálogo de 72 Peligros</span>
        </button>

        <button
          onClick={() => setActiveTab('ptar')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'ptar'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>PTAR en Campo</span>
          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-amber-100 text-amber-800 font-bold border border-amber-200">
            {permisos.filter(p => p.estado === 'Activo / En Ejecución').length} Activos
          </span>
        </button>

        <button
          onClick={() => setActiveTab('lototo')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'lototo'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Bloqueos LOTOTO</span>
        </button>

        <button
          onClick={() => setActiveTab('tds')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'tds'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <HardHat className="w-4 h-4" />
          <span>Charlas TDS & Inspecciones</span>
        </button>
      </div>

      {/* ================= TAB 1: PLANES DE CONTROL (HOJA OFICIAL GID=716332079) ================= */}
      {activeTab === 'planes' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar plan por código, área, peligro o responsable..."
                value={searchPlanes}
                onChange={(e) => setSearchPlanes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filtroEstadoPlan}
                onChange={(e) => setFiltroEstadoPlan(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="TODOS">Todos los Estados</option>
                <option value="En ejecución">En ejecución</option>
                <option value="Verificado">Verificado</option>
                <option value="Ejecutado">Ejecutado</option>
                <option value="Pendiente">Pendiente</option>
              </select>

              <button
                onClick={handleExportPlanesCSV}
                className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-emerald-700 border border-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                Descargar CSV
              </button>

              {canEdit && (
                <button
                  onClick={() => setIsNuevoPlanOpen(true)}
                  className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  Nuevo Plan de Control
                </button>
              )}
            </div>
          </div>

          {/* Tabla de Planes de Control */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-mono text-[10px] uppercase border-b border-slate-200">
                    <th className="p-3 font-bold">ID Plan</th>
                    <th className="p-3 font-bold">Área / Actividad</th>
                    <th className="p-3 font-bold">Peligro Evaluado</th>
                    <th className="p-3 font-bold text-center">NR Inicial</th>
                    <th className="p-3 font-bold">Jerarquía</th>
                    <th className="p-3 font-bold min-w-[280px]">Medida de Control</th>
                    <th className="p-3 font-bold">Responsable</th>
                    <th className="p-3 font-bold text-center">Estado</th>
                    <th className="p-3 font-bold text-center">NR Residual</th>
                    <th className="p-3 font-bold text-center">Detalle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {filteredPlanes.map((plan) => (
                    <tr key={plan.idPlan} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-mono font-bold text-emerald-700">
                        {plan.idPlan}
                        <div className="text-[10px] text-slate-400">{plan.idRiesgo}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-900">{plan.area}</div>
                        <div className="text-[10px] text-slate-500 line-clamp-1">{plan.puestoActividad}</div>
                      </td>
                      <td className="p-3 font-medium text-slate-800 line-clamp-2 max-w-[200px]">
                        {plan.peligro}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                          plan.nrInicial >= 600 
                            ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {plan.nrInicial} ({plan.niInicial.split(' ')[0]})
                        </span>
                      </td>
                      <td className="p-3 text-[11px] text-slate-600">
                        {plan.nivelJerarquia}
                      </td>
                      <td className="p-3 text-slate-800">
                        <p className="line-clamp-2">{plan.medidaControl}</p>
                        <div className="text-[10px] text-slate-500 mt-0.5">Recursos: {plan.recursosRequeridos}</div>
                      </td>
                      <td className="p-3 text-[11px] text-slate-700 whitespace-nowrap">
                        {plan.responsable}
                        <div className="text-[10px] text-slate-500">Compromiso: {plan.fechaCompromiso}</div>
                      </td>
                      <td className="p-3 text-center whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          plan.estado === 'Verificado'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : plan.estado === 'Ejecutado'
                            ? 'bg-sky-50 text-sky-700 border border-sky-200'
                            : plan.estado === 'En ejecución'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {plan.estado}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {plan.nrResidual} ({plan.niResidual.split(' ')[0]})
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => setSelectedPlanDetalle(plan)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200 transition-colors cursor-pointer"
                          title="Ver detalle completo y evidencia"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: MATRIZ IPER INTERACTIVA ================= */}
      {activeTab === 'iper' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 shadow-2xs p-4 rounded-2xl shadow-lg flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar en Matriz IPER por área, actividad o peligro..."
                value={searchIPER}
                onChange={(e) => setSearchIPER(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filtroAreaIPER}
                onChange={(e) => setFiltroAreaIPER(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="TODAS">Todas las Áreas Operativas</option>
                <option value="Muelle Palúa (PMH)">Muelle Palúa (PMH)</option>
                <option value="Planta de Pellas - Horno L2">Planta de Pellas - Horno L2</option>
                <option value="Planta de Pellas - Secador L1">Planta de Pellas - Secador L1</option>
                <option value="Taller Central TIMACA (Bahía 1)">Taller Central (Bahía 1)</option>
                <option value="Taller Central TIMACA (Bahía 2)">Taller Central (Bahía 2)</option>
                <option value="Patio & Subestación Secundaria">Subestación Secundaria</option>
                <option value="Flota Grúas Móviles (26 Equipos)">Flota Grúas Móviles</option>
              </select>

              <select
                value={filtroNivelIPER}
                onChange={(e) => setFiltroNivelIPER(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="TODOS">Todos los Niveles</option>
                <option value="I — Intolerable">Nivel I — Intolerable</option>
                <option value="II — Importante">Nivel II — Importante</option>
                <option value="III — Moderado">Nivel III — Moderado</option>
                <option value="IV — Tolerable">Nivel IV — Tolerable</option>
              </select>
            </div>
          </div>

          <div className="bg-white border border-slate-200 shadow-2xs rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-mono text-[10px] uppercase border-b border-slate-200">
                    <th className="p-3 font-bold">ID</th>
                    <th className="p-3 font-bold">Área / Actividad</th>
                    <th className="p-3 font-bold">Código & Peligro Identificado</th>
                    <th className="p-3 font-bold min-w-[200px]">Controles Existentes</th>
                    <th className="p-2 font-bold text-center">ND</th>
                    <th className="p-2 font-bold text-center">NE</th>
                    <th className="p-2 font-bold text-center">NP</th>
                    <th className="p-2 font-bold text-center">NC</th>
                    <th className="p-2 font-bold text-center">NR</th>
                    <th className="p-3 font-bold text-center">Nivel (NI)</th>
                    <th className="p-3 font-bold text-center">Aceptabilidad</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {filteredIPER.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-mono font-bold text-sky-400">
                        {r.id}
                        <div className="text-[10px] text-slate-500">{r.fecha}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-900">{r.area}</div>
                        <div className="text-[10px] text-slate-400">{r.puestoActividad} ({r.expuestos} expuestos)</div>
                      </td>
                      <td className="p-3">
                        <div className="font-mono text-[10px] text-emerald-400">Código {r.codigoPeligro}</div>
                        <div className="text-slate-800 font-medium">{r.peligroIdentificado}</div>
                      </td>
                      <td className="p-3 text-slate-400 text-[11px]">
                        {r.controlesExistentes}
                      </td>
                      <td className="p-2 text-center font-mono text-slate-300">{r.nd}</td>
                      <td className="p-2 text-center font-mono text-slate-300">{r.ne}</td>
                      <td className="p-2 text-center font-mono text-amber-300 font-bold">{r.np}</td>
                      <td className="p-2 text-center font-mono text-slate-300">{r.nc}</td>
                      <td className="p-2 text-center font-mono font-black text-rose-300">{r.nr}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          r.ni === 'I — Intolerable'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : r.ni === 'II — Importante'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {r.ni}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          r.aceptabilidad === 'No Aceptable'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : r.aceptabilidad === 'Aceptable con control específico'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {r.aceptabilidad}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: TABLERO DE CONTROL CORP-035 (NT-01-2008) ================= */}
      {activeTab === 'tablero' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 shadow-2xs rounded-2xl p-5 shadow-xl space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              Distribución de Peligros por Nivel de Riesgo (NR)
            </h2>
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between">
                <div>
                  <div className="font-bold text-rose-300 text-sm">Nivel I — Intolerable (4000 a 600)</div>
                  <div className="text-[11px] text-slate-400">Peligro inminente. Parada del trabajo. Corrección urgente.</div>
                </div>
                <div className="text-2xl font-black text-rose-400 font-mono">
                  {statsTablero.nivelI}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                <div>
                  <div className="font-bold text-amber-300 text-sm">Nivel II — Importante (500 a 150)</div>
                  <div className="text-[11px] text-slate-400">No iniciar la actividad hasta reducir el riesgo. Exige plan.</div>
                </div>
                <div className="text-2xl font-black text-amber-400 font-mono">
                  {statsTablero.nivelII}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-between">
                <div>
                  <div className="font-bold text-sky-300 text-sm">Nivel III — Moderado (120 a 40)</div>
                  <div className="text-[11px] text-slate-400">Reducir el riesgo en un plazo definido. Controles operativos.</div>
                </div>
                <div className="text-2xl font-black text-sky-400 font-mono">
                  {statsTablero.nivelIII}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <div className="font-bold text-emerald-300 text-sm">Nivel IV — Tolerable (20)</div>
                  <div className="text-[11px] text-slate-400">Mantener los controles existentes y evaluar periódicamente.</div>
                </div>
                <div className="text-2xl font-black text-emerald-400 font-mono">
                  {statsTablero.nivelIV}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 shadow-2xs rounded-2xl p-5 shadow-xl space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Jerarquía de Controles Aplicada (LOPCYMAT Art. 56)
            </h2>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>1 · Eliminación & Sustitución</span>
                  <span className="font-mono text-emerald-400">0%</span>
                </div>
                <p className="text-slate-400 text-[11px]">Suprime el peligro por completo o sustituye materiales peligrosos.</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>2 · Controles de Ingeniería</span>
                  <span className="font-mono text-emerald-400 font-bold">57.1% (4 Planes)</span>
                </div>
                <p className="text-slate-400 text-[11px]">Líneas de vida rígidas, cortinas fotoeléctricas de luz Sick, ventilación forzada en tolvas, guardas mecánicas con microrruptores.</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>3 · Controles Administrativos</span>
                  <span className="font-mono text-emerald-400 font-bold">42.9% (3 Planes)</span>
                </div>
                <p className="text-slate-400 text-[11px]">Procedimientos LOTOTO, permisos PTAR, delimitación perimetral a 25m, estudios de compactación de terreno para grúas.</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>4 · Equipo de Protección Personal (EPP)</span>
                  <span className="font-mono text-sky-400">Barrera Complementaria</span>
                </div>
                <p className="text-slate-400 text-[11px]">Última barrera técnica. Nunca sustituye a los controles de ingeniería ni administrativos.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 4: CATÁLOGO OFICIAL DE 72 PELIGROS ================= */}
      {activeTab === 'catalogo' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 shadow-2xs p-4 rounded-2xl shadow-lg flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar peligro en el catálogo por código o descripción (ej: 46023, caída, ruido, eléctrico)..."
                value={searchPeligros}
                onChange={(e) => setSearchPeligros(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={filtroCategoriaPeligro}
                onChange={(e) => setFiltroCategoriaPeligro(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="TODAS">Todas las Categorías ({categoriasPeligrosUnicas.length})</option>
                {categoriasPeligrosUnicas.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredPeligros.map((peligro) => (
              <div 
                key={String(peligro.codigo)} 
                className="bg-white border border-slate-200 shadow-2xs rounded-xl p-3.5 shadow-md flex items-start gap-3"
              >
                <span className="font-mono text-xs font-black px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                  {peligro.codigo}
                </span>
                <div className="space-y-1 min-w-0">
                  <div className="text-[10px] font-mono text-slate-400 line-clamp-1">
                    {peligro.categoria}
                  </div>
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    {peligro.peligro}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 5: PTAR EN CAMPO ================= */}
      {activeTab === 'ptar' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {permisos.map((p) => (
              <div key={p.id} className="bg-white border border-slate-200 shadow-2xs rounded-2xl p-5 shadow-xl space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-[10px] font-bold text-amber-400">{p.numeroPTAR}</span>
                    <h3 className="font-bold text-sm text-white">{p.tipo}</h3>
                    <p className="text-xs text-slate-300">{p.frenteTrabajo}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    p.estado === 'Activo / En Ejecución' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    {p.estado}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-800 text-xs space-y-1 text-slate-300">
                  <div><strong>Equipo:</strong> {p.equipoIntervenido}</div>
                  <div><strong>Solicitante:</strong> {p.solicitanteNombre} ({p.solicitanteCargo})</div>
                  <div><strong>Supervisor HSE:</strong> {p.supervisorHSE}</div>
                  <div><strong>Horario:</strong> {p.horaInicio} a {p.horaFinEstimada}</div>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-[11px] text-slate-700">
                  <strong className="text-emerald-400 block mb-1">Medidas Preventivas:</strong>
                  <ul className="list-disc list-inside space-y-0.5">
                    {p.medidasPreventivas.map((m, idx) => (
                      <li key={idx} className="line-clamp-2">{m}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 6: LOTOTO ================= */}
      {activeTab === 'lototo' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {bloqueos.map((b) => (
            <div key={b.id} className="bg-white border border-slate-200 shadow-2xs rounded-2xl p-4 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-rose-400">{b.numeroTarjeta}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  b.estado === 'Bloqueado / Desenergizado' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  {b.estado}
                </span>
              </div>
              <div className="text-xs space-y-1 text-slate-300">
                <div className="font-bold text-slate-900">{b.puntoBloqueo}</div>
                <div><strong>Ubicación:</strong> {b.ubicacion}</div>
                <div><strong>Equipo:</strong> {b.equipoAfectado}</div>
                <div><strong>Responsable:</strong> {b.responsableBloqueo} ({b.cargo})</div>
                <div className="text-slate-400 text-[11px]"><strong>Motivo:</strong> {b.motivo}</div>
                <div className="font-mono text-[10px] text-amber-300">Candado: {b.candadoNumero}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= TAB 7: TDS & INSPECCIONES ================= */}
      {activeTab === 'tds' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-3">Charlas Diarias de Seguridad (TDS 5 Minutos)</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {charlas.map((c) => (
                <div key={c.id} className="bg-white border border-slate-200 shadow-2xs rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-emerald-400">
                    <span>{c.numeroActa}</span>
                    <span className="text-slate-400">{c.fecha}</span>
                  </div>
                  <h3 className="font-bold text-xs text-white line-clamp-2">{c.temaTratado}</h3>
                  <div className="text-[11px] text-slate-400">
                    <div>Frente: {c.frenteTrabajo}</div>
                    <div>Facilitador: {c.facilitador} ({c.cargoFacilitador})</div>
                    <div>Asistentes: <strong className="text-white">{c.asistentesCantidad}</strong> trabajadores</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-900 mb-3">Inspecciones de Seguridad HSE</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {inspecciones.map((i) => (
                <div key={i.id} className="bg-white border border-slate-200 shadow-2xs rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-sky-400">
                    <span>{i.numeroInspeccion}</span>
                    <span className="text-slate-400">{i.fecha}</span>
                  </div>
                  <h3 className="font-bold text-xs text-white">{i.tipo}</h3>
                  <div className="text-[11px] text-slate-400">
                    <div>Frente: {i.frenteTrabajo}</div>
                    <div>Inspector: {i.inspector}</div>
                    <div>Resultado: <strong className="text-emerald-400">{i.resultado}</strong> ({i.noConformidadesCerradas}/{i.noConformidadesTotal} NC cerradas)</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL DETALLE DE PLAN DE CONTROL ================= */}
      {selectedPlanDetalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative text-slate-900 space-y-4">
            <button
              onClick={() => setSelectedPlanDetalle(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              ✕
            </button>

            <div className="space-y-1">
              <span className="font-mono text-xs font-bold text-emerald-400">
                {selectedPlanDetalle.idPlan} · {selectedPlanDetalle.idRiesgo}
              </span>
              <h2 className="text-lg font-black text-white">{selectedPlanDetalle.peligro}</h2>
              <p className="text-xs text-slate-400">{selectedPlanDetalle.area} · {selectedPlanDetalle.puestoActividad}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-800/80 p-3 rounded-xl text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">Riesgo Inicial:</span>
                <span className="font-mono font-bold text-rose-300">
                  NR {selectedPlanDetalle.nrInicial} ({selectedPlanDetalle.niInicial})
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Riesgo Residual Esperado:</span>
                <span className="font-mono font-bold text-emerald-300">
                  NR {selectedPlanDetalle.nrResidual} ({selectedPlanDetalle.niResidual})
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div>
                <strong className="text-emerald-400 block">Jerarquía de Control:</strong>
                <p>{selectedPlanDetalle.nivelJerarquia}</p>
              </div>
              <div>
                <strong className="text-emerald-400 block">Medida de Control a Implementar:</strong>
                <p className="bg-slate-800 p-2.5 rounded-lg text-slate-200">{selectedPlanDetalle.medidaControl}</p>
              </div>
              <div>
                <strong className="text-emerald-400 block">Recursos Requeridos:</strong>
                <p>{selectedPlanDetalle.recursosRequeridos}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <strong>Responsable:</strong> {selectedPlanDetalle.responsable}
                </div>
                <div>
                  <strong>Fecha Compromiso:</strong> {selectedPlanDetalle.fechaCompromiso}
                </div>
              </div>
              <div>
                <strong className="text-emerald-400 block">Evidencia de Cumplimiento:</strong>
                <p className="italic text-slate-300">{selectedPlanDetalle.evidencia || 'Pendiente de registrar evidencia'}</p>
              </div>
              <div>
                <strong>Verificado Por:</strong> {selectedPlanDetalle.verificadoPor || 'Pendiente'}
              </div>
            </div>

            <button
              onClick={() => setSelectedPlanDetalle(null)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Cerrar Detalle
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL NUEVO PLAN DE CONTROL ================= */}
      {isNuevoPlanOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative text-slate-900 space-y-4">
            <button
              onClick={() => setIsNuevoPlanOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              ✕
            </button>

            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-400" />
              Aperturar Plan de Control de Riesgo (Hoja gid=716332079)
            </h2>

            <form onSubmit={handleCrearPlan} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Área Operativa:</label>
                <select
                  value={formNuevoPlan.area}
                  onChange={(e) => setFormNuevoPlan({ ...formNuevoPlan, area: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
                >
                  <option value="Muelle Palúa (PMH)">Muelle Palúa (PMH)</option>
                  <option value="Planta de Pellas - Horno L2">Planta de Pellas - Horno L2</option>
                  <option value="Planta de Pellas - Secador L1">Planta de Pellas - Secador L1</option>
                  <option value="Taller Central TIMACA (Bahía 1)">Taller Central (Bahía 1)</option>
                  <option value="Taller Central TIMACA (Bahía 2)">Taller Central (Bahía 2)</option>
                  <option value="Patio & Subestación Secundaria">Subestación Secundaria</option>
                  <option value="Flota Grúas Móviles (26 Equipos)">Flota Grúas Móviles</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Puesto o Actividad:</label>
                <input
                  type="text"
                  value={formNuevoPlan.puestoActividad}
                  onChange={(e) => setFormNuevoPlan({ ...formNuevoPlan, puestoActividad: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Peligro Identificado:</label>
                <input
                  type="text"
                  value={formNuevoPlan.peligro}
                  onChange={(e) => setFormNuevoPlan({ ...formNuevoPlan, peligro: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Jerarquía de Control:</label>
                <select
                  value={formNuevoPlan.nivelJerarquia}
                  onChange={(e) => setFormNuevoPlan({ ...formNuevoPlan, nivelJerarquia: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
                >
                  <option value="1 · Eliminación">1 · Eliminación</option>
                  <option value="2 · Sustitución">2 · Sustitución</option>
                  <option value="3 · Control de ingeniería">3 · Control de ingeniería</option>
                  <option value="4 · Control administrativo">4 · Control administrativo</option>
                  <option value="5 · Equipo de protección personal (EPP)">5 · Equipo de protección personal (EPP)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Medida de Control a Implementar:</label>
                <textarea
                  rows={2}
                  value={formNuevoPlan.medidaControl}
                  onChange={(e) => setFormNuevoPlan({ ...formNuevoPlan, medidaControl: e.target.value })}
                  placeholder="Detalle la acción técnica, procedimiento o instalación requerida..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Responsable:</label>
                  <input
                    type="text"
                    value={formNuevoPlan.responsable}
                    onChange={(e) => setFormNuevoPlan({ ...formNuevoPlan, responsable: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Fecha Compromiso:</label>
                  <input
                    type="date"
                    value={formNuevoPlan.fechaCompromiso}
                    onChange={(e) => setFormNuevoPlan({ ...formNuevoPlan, fechaCompromiso: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNuevoPlanOpen(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 border border-slate-200 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white font-bold shadow-lg shadow-emerald-900/40"
                >
                  Guardar Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
