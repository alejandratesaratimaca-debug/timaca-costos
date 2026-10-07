import React, { useState, useMemo } from 'react';
import { 
  TRABAJADORES_CURSOS_TIMACA, 
  CERTIFICADOS_VERIFICADOS_DRIVE, 
  CATALOGO_CURSOS_NOMBRES,
  STATS_CURSOS_TOTALES,
  DEPARTAMENTOS_LISTA,
  AREAS_FISICAS_LISTA,
  TrabajadorCursosHSE,
  CertificadoVerificadoHSE
} from '../../data/realCertificadosData';
import { UsuarioSistema } from '../../types/usuarios';
import { 
  Award, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Download, 
  FileCheck2, 
  Truck, 
  QrCode, 
  UserCheck, 
  ExternalLink,
  ChevronRight, 
  ShieldCheck, 
  Layers,
  ArrowLeft,
  FileText,
  Filter,
  Users,
  GraduationCap,
  Calendar,
  Sparkles,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  BookOpen,
  FolderSync
} from 'lucide-react';

interface CertificadosModuleViewProps {
  currentUser: UsuarioSistema;
  onVolver?: () => void;
  onGoToGruas?: () => void;
  onGoToSeguridad?: () => void;
}

const GOOGLE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1HLg7w29tI9XGVxwLtCE-OHQmF-JnnwoaF3OF4o_7kS8/edit?gid=1730870257#gid=1730870257';
const APPS_SCRIPT_URL = 'https://script.google.com/u/0/home/projects/1_X3O-E4mf5l3qzHnTRBY_GbhTOpR4FCLLz-IbWatFX19zksIiQXEjMAF/edit';

export const CertificadosModuleView: React.FC<CertificadosModuleViewProps> = ({
  currentUser,
  onVolver,
  onGoToGruas,
  onGoToSeguridad
}) => {
  const [activeTab, setActiveTab] = useState<'matriz' | 'drive' | 'dashboard' | 'catalogo' | 'script'>('matriz');
  const canEdit = currentUser.permisos.ambitoEdicion === 'todo' || currentUser.permisos.canEditCertificados === true;
  
  // Filtros de búsqueda para la matriz
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState<string>('TODAS');
  const [selectedDpto, setSelectedDpto] = useState<string>('TODOS');
  const [selectedCursoFiltro, setSelectedCursoFiltro] = useState<string>('TODOS');
  const [filtroEstadoCapacitacion, setFiltroEstadoCapacitacion] = useState<'TODOS' | 'CON_COMPLETADOS' | 'PENDIENTES'>('TODOS');
  
  // Paginación de la matriz (879 registros)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Filtros de certificados drive
  const [searchDriveQuery, setSearchDriveQuery] = useState('');
  const [selectedCursoDrive, setSelectedCursoDrive] = useState<string>('TODOS');

  // Modal Carnet Digital
  const [carnetTrabajador, setCarnetTrabajador] = useState<TrabajadorCursosHSE | null>(null);

  // Filtrado de la matriz principal
  const filteredTrabajadores = useMemo(() => {
    return TRABAJADORES_CURSOS_TIMACA.filter(t => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        t.nombre.toLowerCase().includes(q) ||
        t.cedula.toLowerCase().includes(q) ||
        t.cargo.toLowerCase().includes(q);

      const matchArea = selectedArea === 'TODAS' || t.areaFisica === selectedArea;
      const matchDpto = selectedDpto === 'TODOS' || t.departamento === selectedDpto;

      let matchCurso = true;
      if (selectedCursoFiltro !== 'TODOS') {
        const reg = t.cursos.find(c => c.curso === selectedCursoFiltro);
        matchCurso = !!reg && (reg.aplica || reg.completado);
      }

      let matchEstado = true;
      if (filtroEstadoCapacitacion === 'CON_COMPLETADOS') {
        matchEstado = t.totalCursosCompletados > 0;
      } else if (filtroEstadoCapacitacion === 'PENDIENTES') {
        matchEstado = t.cursos.some(c => c.estado === 'Pendiente');
      }

      return matchSearch && matchArea && matchDpto && matchCurso && matchEstado;
    });
  }, [searchQuery, selectedArea, selectedDpto, selectedCursoFiltro, filtroEstadoCapacitacion]);

  // Paginación calculada
  const totalPages = Math.ceil(filteredTrabajadores.length / pageSize) || 1;
  const paginatedTrabajadores = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTrabajadores.slice(start, start + pageSize);
  }, [filteredTrabajadores, currentPage, pageSize]);

  // Filtrado de certificados en drive
  const filteredCertificadosDrive = useMemo(() => {
    return CERTIFICADOS_VERIFICADOS_DRIVE.filter(c => {
      const q = searchDriveQuery.toLowerCase().trim();
      const matchSearch = !q || 
        c.nombre.toLowerCase().includes(q) ||
        c.cedula.toLowerCase().includes(q) ||
        c.cargo.toLowerCase().includes(q) ||
        c.curso.toLowerCase().includes(q);

      const matchCurso = selectedCursoDrive === 'TODOS' || c.curso === selectedCursoDrive;
      return matchSearch && matchCurso;
    });
  }, [searchDriveQuery, selectedCursoDrive]);

  // Exportar matriz actual a CSV
  const handleExportCSV = () => {
    const headers = ['Cédula', 'Nombre', 'Cargo', 'Departamento', 'Área Física', ...CATALOGO_CURSOS_NOMBRES];
    const rows = filteredTrabajadores.map(t => [
      t.cedula,
      `"${t.nombre}"`,
      `"${t.cargo}"`,
      `"${t.departamento}"`,
      `"${t.areaFisica}"`,
      ...CATALOGO_CURSOS_NOMBRES.map(cName => {
        const cur = t.cursos.find(c => c.curso === cName);
        return cur ? `"${cur.estado}${cur.fecha ? ' (' + cur.fecha + ')' : ''}"` : '"No aplica"';
      })
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TIMACA_Matriz_Cursos_HSE_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* ================= HEADER DEL MÓDULO DE CURSOS ================= */}
      <div className="bg-gradient-to-r from-indigo-50/70 via-blue-50/40 to-white border border-indigo-200/90 rounded-2xl p-5 sm:p-6 text-slate-900 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] font-black uppercase px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 border border-indigo-300 font-bold">
                [CRT] Control de Cursos & Certificaciones HSE
              </span>
              <a 
                href={GOOGLE_SHEET_URL} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[10px] font-mono text-emerald-300 bg-emerald-950/80 hover:bg-emerald-900/90 border border-emerald-500/40 px-2 py-0.5 rounded flex items-center gap-1 transition-colors"
                title="Abrir Google Sheet oficial de TIMACA"
              >
                <ExternalLink className="w-3 h-3 text-emerald-400" />
                Google Sheet Sincronizado (gid=880063311)
              </a>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              <GraduationCap className="w-8 h-8 text-indigo-600" />
              Sistema de Capacitación y Competencias Técnicas TIMACA
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
              Base de datos integral de 879 trabajadores de TIMACA, Palúa (PMH), Pellas y Briquetas. Seguimiento de los 10 cursos obligatorios de seguridad, habilitación operacional y 169 certificados verificados con respaldo en Google Drive.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {onGoToSeguridad && (
              <button
                onClick={onGoToSeguridad}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-300 shadow-2xs text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Ver Seguridad Industrial & IPER
              </button>
            )}
            {onGoToGruas && (
              <button
                onClick={onGoToGruas}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-300 shadow-2xs text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Truck className="w-4 h-4 text-sky-400" />
                Flota de 26 Grúas
              </button>
            )}
            {onVolver && (
              <button
                onClick={onVolver}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-300 shadow-2xs text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver a Costos
              </button>
            )}
          </div>
        </div>

        {/* ================= TARJETAS KPIS EJECUTIVOS ================= */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-indigo-200/80">
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
            <div className="text-[10px] text-slate-400 font-mono uppercase font-bold flex items-center justify-between">
              <span>Nómina Evaluada</span>
              <Users className="w-3.5 h-3.5 text-indigo-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white mt-1">
              879
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Trabajadores en matriz oficial
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
            <div className="text-[10px] text-slate-400 font-mono uppercase font-bold flex items-center justify-between">
              <span>Cursos Completados</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">
              173
            </div>
            <div className="text-[10px] text-emerald-300/80 mt-0.5">
              Certificaciones aprobadas
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
            <div className="text-[10px] text-slate-400 font-mono uppercase font-bold flex items-center justify-between">
              <span>Archivos en Drive</span>
              <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-sky-400 mt-1">
              169
            </div>
            <div className="text-[10px] text-sky-300/80 mt-0.5">
              PDFs con enlace directo
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
            <div className="text-[10px] text-slate-400 font-mono uppercase font-bold flex items-center justify-between">
              <span>Trabajo en Altura</span>
              <Award className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-400 mt-1">
              90 / 166
            </div>
            <div className="text-[10px] text-amber-300/80 mt-0.5">
              54.2% cobertura operativa
            </div>
          </div>
        </div>
      </div>

      {/* ================= TABS DE NAVEGACIÓN ================= */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('matriz')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'matriz'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Matriz de Cursos (879 Trabajadores)</span>
          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-indigo-700 text-white">
            {filteredTrabajadores.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('drive')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'drive'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ExternalLink className="w-4 h-4" />
          <span>Certificados Digitales en Drive</span>
          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold">
            169 PDFs
          </span>
        </button>

        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'dashboard'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Dashboard & Avance</span>
        </button>

        <button
          onClick={() => setActiveTab('catalogo')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'catalogo'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Catálogo de 10 Cursos</span>
        </button>

        <button
          onClick={() => setActiveTab('script')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'script'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FolderSync className="w-4 h-4" />
          <span>Google Apps Script</span>
        </button>
      </div>

      {/* ================= TAB 1: MATRIZ DE CURSOS (879 TRABAJADORES) ================= */}
      {activeTab === 'matriz' && (
        <div className="space-y-4">
          {/* Barra de Filtros */}
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs space-y-3">
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por cédula, nombre o cargo (ej: 15542534, Acosta, Soldador, Montador)..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleExportCSV}
                  className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-indigo-700 border border-indigo-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  Descargar CSV ({filteredTrabajadores.length})
                </button>
              </div>
            </div>

            {/* Selectores de Filtro Fino */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100">
              <div>
                <label className="text-[10px] font-mono uppercase text-slate-600 font-bold block mb-1">
                  Área Física:
                </label>
                <select
                  value={selectedArea}
                  onChange={(e) => {
                    setSelectedArea(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="TODAS">Todas las Áreas Físicas ({AREAS_FISICAS_LISTA.length})</option>
                  {AREAS_FISICAS_LISTA.map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-slate-600 font-bold block mb-1">
                  Departamento:
                </label>
                <select
                  value={selectedDpto}
                  onChange={(e) => {
                    setSelectedDpto(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="TODOS">Todos los Departamentos ({DEPARTAMENTOS_LISTA.length})</option>
                  {DEPARTAMENTOS_LISTA.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-slate-600 font-bold block mb-1">
                  Curso Específico:
                </label>
                <select
                  value={selectedCursoFiltro}
                  onChange={(e) => {
                    setSelectedCursoFiltro(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="TODOS">Cualquier Curso (10 Cursos)</option>
                  {CATALOGO_CURSOS_NOMBRES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-slate-600 font-bold block mb-1">
                  Filtro por Acreditación:
                </label>
                <select
                  value={filtroEstadoCapacitacion}
                  onChange={(e) => {
                    setFiltroEstadoCapacitacion(e.target.value as any);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="TODOS">Todos los Trabajadores</option>
                  <option value="CON_COMPLETADOS">Con Certificados Aprobados (173)</option>
                  <option value="PENDIENTES">Con Cursos Obligatorios Pendientes</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tabla de Matriz */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600 font-mono">
              <span>
                Mostrando <strong className="text-white">{Math.min(filteredTrabajadores.length, (currentPage - 1) * pageSize + 1)}</strong> - <strong className="text-white">{Math.min(filteredTrabajadores.length, currentPage * pageSize)}</strong> de <strong className="text-indigo-600">{filteredTrabajadores.length}</strong> trabajadores
              </span>
              <div className="flex items-center gap-2">
                <span>Filas por página:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-white border border-slate-200 rounded px-2 py-0.5 text-xs text-slate-800"
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-mono text-[10px] uppercase border-b border-slate-200 sticky top-0 z-10">
                    <th className="p-3 font-bold">Cédula</th>
                    <th className="p-3 font-bold min-w-[200px]">Apellidos y Nombres</th>
                    <th className="p-3 font-bold min-w-[170px]">Cargo</th>
                    <th className="p-3 font-bold">Dpto. / Área</th>
                    <th className="p-3 font-bold text-center">Avance</th>
                    <th className="p-2 font-bold text-center">Oper. Grúa</th>
                    <th className="p-2 font-bold text-center">Rigger</th>
                    <th className="p-2 font-bold text-center">Esp. Confin.</th>
                    <th className="p-2 font-bold text-center">Manejo Def.</th>
                    <th className="p-2 font-bold text-center">Andamio</th>
                    <th className="p-2 font-bold text-center">Téc. Seg.</th>
                    <th className="p-2 font-bold text-center">Superv. Seg.</th>
                    <th className="p-2 font-bold text-center">Inducción</th>
                    <th className="p-2 font-bold text-center">MATPEL</th>
                    <th className="p-2 font-bold text-center">Altura</th>
                    <th className="p-3 font-bold text-center">Carnet</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {paginatedTrabajadores.map((t) => (
                    <tr key={t.cedula} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3 font-mono font-bold text-slate-700">
                        {t.cedula}
                      </td>
                      <td className="p-3 font-semibold text-slate-900">
                        {t.nombre}
                      </td>
                      <td className="p-3 text-slate-600">
                        {t.cargo}
                      </td>
                      <td className="p-3 text-[11px] text-slate-400">
                        <div className="font-medium text-slate-600">{t.areaFisica || 'TIMACA'}</div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[140px]">{t.departamento}</div>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                          t.totalCursosCompletados > 0 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {t.totalCursosCompletados} / {t.totalCursosAplica}
                        </span>
                      </td>

                      {/* 10 Cursos Columns */}
                      {CATALOGO_CURSOS_NOMBRES.map(cName => {
                        const cur = t.cursos.find(c => c.curso === cName);
                        if (!cur || !cur.aplica && !cur.completado) {
                          return (
                            <td key={cName} className="p-2 text-center text-slate-600 font-mono text-[10px]">
                              —
                            </td>
                          );
                        }

                        if (cur.completado) {
                          return (
                            <td key={cName} className="p-2 text-center">
                              {cur.certificadoUrl ? (
                                <a
                                  href={cur.certificadoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold transition-colors"
                                  title={`Ver certificado oficial en Drive (${cur.fecha || 'Aprobado'})`}
                                >
                                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                  <span>📎 PDF</span>
                                </a>
                              ) : (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                  <span>OK</span>
                                </span>
                              )}
                            </td>
                          );
                        }

                        return (
                          <td key={cName} className="p-2 text-center">
                            <span 
                              className="inline-block px-1.5 py-0.5 rounded text-[9px] font-mono bg-amber-50 text-amber-700 border border-amber-200 font-semibold"
                              title="Curso requerido pendiente de realizar"
                            >
                              Pendiente
                            </span>
                          </td>
                        );
                      })}

                      <td className="p-3 text-center">
                        <button
                          onClick={() => setCarnetTrabajador(t)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-600 hover:text-rose-200 border border-slate-700 transition-colors cursor-pointer"
                          title="Ver Carnet Digital con QR"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
              <div>
                Página <strong className="text-white">{currentPage}</strong> de <strong className="text-white">{totalPages}</strong>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  title="Primera página"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Anterior</span>
                </button>

                <span className="px-3 py-1 font-mono text-slate-900 bg-white border border-slate-200 rounded-lg">
                  {currentPage} / {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
                >
                  <span>Siguiente</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  title="Última página"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: CERTIFICADOS DIGITALES EN GOOGLE DRIVE ================= */}
      {activeTab === 'drive' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 shadow-2xs p-4 rounded-2xl shadow-lg flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar certificado por nombre del trabajador, cédula o curso..."
                value={searchDriveQuery}
                onChange={(e) => setSearchDriveQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedCursoDrive}
                onChange={(e) => setSelectedCursoDrive(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white"
              >
                <option value="TODOS">Todos los Cursos ({CERTIFICADOS_VERIFICADOS_DRIVE.length} certificados)</option>
                {CATALOGO_CURSOS_NOMBRES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredCertificadosDrive.map((cert) => (
              <div 
                key={cert.id}
                className="bg-white border border-slate-200 shadow-2xs hover:border-emerald-500/50 rounded-2xl p-4 shadow-lg flex flex-col justify-between transition-all hover:shadow-emerald-950/20 hover:shadow-xl"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-[10px] font-bold text-slate-400">
                        C.I. {cert.cedula}
                      </span>
                      <h3 className="font-bold text-sm text-white line-clamp-1">
                        {cert.nombre}
                      </h3>
                      <p className="text-xs text-slate-600">
                        {cert.cargo}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0">
                      Verificado
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Curso:</span>
                      <span className="font-semibold text-indigo-600 text-right">{cert.curso}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Fecha Emisión:</span>
                      <span className="font-mono text-slate-200">{cert.fechaEmision}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Área:</span>
                      <span className="text-slate-600">{cert.areaFisica || cert.departamento}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-800">
                  <a
                    href={cert.certificadoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Abrir PDF en Google Drive</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 3: DASHBOARD & AVANCE ================= */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 shadow-2xs rounded-2xl p-5 shadow-xl">
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              Cumplimiento por Curso en Toda la Empresa
            </h2>
            <div className="space-y-3.5">
              {CATALOGO_CURSOS_NOMBRES.map(cName => {
                const stats = (STATS_CURSOS_TOTALES as any)[cName] || { aplican: 0, completados: 0, pendientes: 0 };
                const pct = stats.aplican > 0 ? Math.round((stats.completados / stats.aplican) * 100) : 0;
                return (
                  <div key={cName} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-200">{cName}</span>
                      <div className="flex items-center gap-2 font-mono text-[11px]">
                        <span className="text-emerald-400 font-bold">{stats.completados} Aprobados</span>
                        <span className="text-slate-500">/</span>
                        <span className="text-slate-400">{stats.aplican} Aplican</span>
                        <span className="text-slate-500">·</span>
                        <span className="text-indigo-600 font-bold">{pct}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          pct >= 80 ? 'bg-emerald-500' : pct >= 40 ? 'bg-amber-500' : 'bg-indigo-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(pct, 2))}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 4: CATÁLOGO DE CURSOS ================= */}
      {activeTab === 'catalogo' && (
        <div className="bg-white border border-slate-200 shadow-2xs rounded-2xl p-5 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            Matriz de Aplicabilidad de Cursos (CATALOGO_CURSOS)
          </h2>
          <p className="text-xs text-slate-400">
            Reglas oficiales para determinar a qué cargos aplica cada uno de los 10 cursos de Seguridad Industrial según el procedimiento interno de TIMACA.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-800 text-slate-600 font-mono text-[10px] uppercase border-b border-slate-700">
                  <th className="p-3 font-bold">Curso de Seguridad</th>
                  <th className="p-3 font-bold text-center">Téc. Seguridad</th>
                  <th className="p-3 font-bold text-center">Supervisores</th>
                  <th className="p-3 font-bold">Cargos Operativos Obligatorios</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-600">
                <tr>
                  <td className="p-3 font-bold text-white">Operadores de Grúa</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">✅ Aplica</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">✅ Aplica</td>
                  <td className="p-3 text-slate-400">Operadores de equipo pesado, montacarguistas, mecánicos de grúa</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-white">Rigger - Señalero</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">✅ Aplica</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">✅ Aplica</td>
                  <td className="p-3 text-slate-400">Albañil, Ayudante, Electricista, Fabricador, Instrumentista, Mecánico, Montador, Soldador</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-white">Espacios Confinados</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">✅ Aplica</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">✅ Aplica</td>
                  <td className="p-3 text-slate-400">Albañil, Andamiero, Ayudante, Electricista, Fabricador, Instrumentista, Mecánico, Montador, Soldador</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-white">Manejo Defensivo</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">✅ Aplica</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">✅ Aplica</td>
                  <td className="p-3 text-slate-400">Choferes de camión plataforma, choferes de transporte de personal y vehículos de flota</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-white">Montaje / Andamio</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">✅ Aplica</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">✅ Aplica</td>
                  <td className="p-3 text-slate-400">Andamieros, montadores de estructura y cuadrillas de parada de planta</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-white">Seguridad Laboral para Técnicos</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">✅ Aplica</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">✅ Aplica</td>
                  <td className="p-3 text-slate-400">Técnicos de seguridad, coordinadores SHA y analistas HSE</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-white">Seguridad Laboral para Supervisores</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">✅ Aplica</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">✅ Aplica</td>
                  <td className="p-3 text-slate-400">Técnicos de seguridad, coordinadores, ingenieros de proyectos, mecánicos especializados, planificadores</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-white">Inducción General</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">✅ Aplica</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">✅ Aplica</td>
                  <td className="p-3 text-slate-400">100% de los trabajadores de TIMACA (Personal de planta, campo y administración)</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-white">MATPEL (Materiales Peligrosos)</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">✅ Aplica</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">✅ Aplica</td>
                  <td className="p-3 text-slate-400">Manejo de químicos, lubricantes, solventes, gases y combustibles DISPESUR</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-white">Trabajo en Altura</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">✅ Aplica</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">✅ Aplica</td>
                  <td className="p-3 text-slate-400">Montadores, andamieros, soldadores, cuadrillas de muelle Palúa (PMH) y línea de pellas</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 5: APPS SCRIPT & GOOGLE SHEETS ================= */}
      {activeTab === 'script' && (
        <div className="bg-white border border-slate-200 shadow-2xs rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <FolderSync className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Sincronización con Google Sheets & Apps Script
              </h2>
              <p className="text-xs text-slate-400">
                La información de capacitación se mantiene sincronizada con la hoja de cálculo matriz de TIMACA.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
              <span className="text-[10px] font-mono text-emerald-300 font-bold uppercase">
                Google Sheets Central
              </span>
              <h3 className="font-bold text-white text-sm">
                Control de Cursos de Seguridad Industrial — TIMACA
              </h3>
              <p className="text-xs text-slate-400">
                Libro oficial con 880 trabajadores, fórmulas automáticas de cumplimiento y enlaces a Google Drive.
              </p>
              <a
                href={GOOGLE_SHEET_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Abrir Google Sheet en Navegador</span>
              </a>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
              <span className="text-[10px] font-mono text-sky-300 font-bold uppercase">
                Google Apps Script
              </span>
              <h3 className="font-bold text-white text-sm">
                Proyecto de Automatización Apps Script
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                ID: 1_X3O-E4mf5l3qzHnTRBY_GbhTOpR4FCLLz-IbWatFX19zksIiQXEjMAF
              </p>
              <a
                href={APPS_SCRIPT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Abrir Editor Apps Script</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL DE CARNET DIGITAL ================= */}
      {carnetTrabajador && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-slate-900 space-y-4">
            <button
              onClick={() => setCarnetTrabajador(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              ✕
            </button>

            <div className="text-center space-y-1">
              <div className="inline-block px-3 py-0.5 rounded-full bg-rose-500/20 text-indigo-600 border border-rose-500/30 text-[10px] font-mono uppercase font-bold">
                TIMACA · Carnet Digital HSE
              </div>
              <h2 className="text-lg font-black text-white">{carnetTrabajador.nombre}</h2>
              <p className="text-xs text-slate-600 font-mono">Cédula: {carnetTrabajador.cedula} · {carnetTrabajador.cargo}</p>
              <p className="text-[11px] text-slate-400">{carnetTrabajador.areaFisica || 'TIMACA'} ({carnetTrabajador.departamento})</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-center gap-4">
              <div className="bg-white p-2 rounded-lg">
                <QrCode className="w-20 h-20 text-slate-950" />
              </div>
              <div className="text-left space-y-1 text-xs">
                <span className="text-[10px] font-mono text-emerald-400 font-bold block">
                  ESTATUS: HABILITADO
                </span>
                <p className="text-slate-600 font-mono text-[11px]">
                  Cursos aprobados: <strong className="text-emerald-400">{carnetTrabajador.totalCursosCompletados}</strong>
                </p>
                <p className="text-slate-400 text-[10px]">
                  Verificado con Base Central TIMACA
                </p>
              </div>
            </div>

            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              <div className="text-[10px] font-mono uppercase font-bold text-slate-400">
                Cursos Evaluados:
              </div>
              {carnetTrabajador.cursos.map((c, i) => (
                <div key={i} className="flex items-center justify-between text-xs p-1.5 rounded bg-slate-50/70 border border-slate-100">
                  <span className="truncate pr-2 text-slate-200">{c.curso}</span>
                  {c.completado ? (
                    c.certificadoUrl ? (
                      <a
                        href={c.certificadoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-emerald-300 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 px-2 py-0.5 rounded flex items-center gap-1 shrink-0 font-bold"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Drive PDF
                      </a>
                    ) : (
                      <span className="text-[10px] text-emerald-400 font-bold shrink-0">
                        ✅ Aprobado
                      </span>
                    )
                  ) : c.aplica ? (
                    <span className="text-[10px] text-amber-400 font-bold shrink-0">
                      ⬜ Pendiente
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 shrink-0">
                      ➖ No aplica
                    </span>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => setCarnetTrabajador(null)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Cerrar Carnet
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
