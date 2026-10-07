import React, { useState, useMemo } from 'react';
import { MOCK_CERTIFICADOS_HSE } from '../../data/mockCertificadosData';
import { CertificadoHSE, AreaPersonalHSE, EstadoCertificado } from '../../types/suite';
import { UsuarioSistema } from '../../types/usuarios';
import { 
  ShieldAlert, 
  Search, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Download, 
  FileCheck2, 
  Award, 
  Truck, 
  QrCode, 
  UserX, 
  UserCheck, 
  Sparkles, 
  Flame, 
  Zap, 
  Cpu, 
  Info,
  Calendar,
  Lock,
  XCircle
} from 'lucide-react';

interface SeguridadCertificadosViewProps {
  currentUser: UsuarioSistema;
  onVolver?: () => void;
  onGoToGruas?: () => void;
}

export const SeguridadCertificadosView: React.FC<SeguridadCertificadosViewProps> = ({
  currentUser,
  onVolver,
  onGoToGruas
}) => {
  const [certificados, setCertificados] = useState<CertificadoHSE[]>(MOCK_CERTIFICADOS_HSE);
  const [activeTab, setActiveTab] = useState<'matriz' | 'gruas' | 'bloqueos' | 'soldadores'>('matriz');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState<string>('TODAS');
  const [selectedEstado, setSelectedEstado] = useState<string>('TODOS');

  // Modal states
  const [isNuevoModalOpen, setIsNuevoModalOpen] = useState(false);
  const [carnetSeleccionado, setCarnetSeleccionado] = useState<CertificadoHSE | null>(null);
  const [notificacion, setNotificacion] = useState<string | null>(null);

  const [formCertificado, setFormCertificado] = useState({
    trabajadorNombre: '',
    cedula: '',
    cargo: '',
    area: 'Operadores de Grúas' as AreaPersonalHSE,
    equipoAsignado: 'Grúa GR17 Liebherr (160T)',
    cursoNombre: 'Certificación Operador Grúa Móvil Telescópica (ASME B30.5)',
    entidadEmisora: 'Bureau Veritas Industrial',
    numeroCertificado: `BV-CRN-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    fechaEmision: new Date().toISOString().split('T')[0],
    fechaVencimiento: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    horasFormacion: 40
  });

  const canEdit = currentUser.permisos.ambitoEdicion === 'todo' || 
                  currentUser.permisos.canEditSeguridad === true;

  // KPIs
  const stats = useMemo(() => {
    const total = certificados.length;
    const vigentes = certificados.filter(c => c.estado === 'Vigente').length;
    const porVencer = certificados.filter(c => c.estado === 'Por Vencer').length;
    const vencidos = certificados.filter(c => c.estado === 'Vencido').length;
    const bloqueados = certificados.filter(c => c.bloqueaOperacion).length;
    const operadoresGrua = certificados.filter(c => c.area === 'Operadores de Grúas').length;
    const porcentajeHabilitados = total > 0 ? Math.round((vigentes / total) * 100) : 0;

    return {
      total,
      vigentes,
      porVencer,
      vencidos,
      bloqueados,
      operadoresGrua,
      porcentajeHabilitados
    };
  }, [certificados]);

  // Filtered
  const filteredCertificados = useMemo(() => {
    return certificados.filter(c => {
      const matchSearch = c.trabajadorNombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.cedula.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.cursoNombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.numeroCertificado.toLowerCase().includes(searchQuery.toLowerCase());
      const matchArea = selectedArea === 'TODAS' || c.area === selectedArea;
      const matchEst = selectedEstado === 'TODOS' || c.estado === selectedEstado;
      return matchSearch && matchArea && matchEst;
    });
  }, [certificados, searchQuery, selectedArea, selectedEstado]);

  const handleCrearCertificado = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCertificado.trabajadorNombre || !formCertificado.cedula) {
      alert('Por favor complete los datos obligatorios.');
      return;
    }

    const nuevo: CertificadoHSE = {
      id: `crt-${Date.now()}`,
      trabajadorNombre: formCertificado.trabajadorNombre,
      cedula: formCertificado.cedula,
      cargo: formCertificado.cargo || 'Operador Especialista',
      area: formCertificado.area,
      equipoAsignado: formCertificado.equipoAsignado,
      cursoNombre: formCertificado.cursoNombre,
      entidadEmisora: formCertificado.entidadEmisora,
      numeroCertificado: formCertificado.numeroCertificado,
      fechaEmision: formCertificado.fechaEmision,
      fechaVencimiento: formCertificado.fechaVencimiento,
      diasParaVencer: 365,
      estado: 'Vigente',
      bloqueaOperacion: false,
      horasFormacion: formCertificado.horasFormacion,
      archivoAdjuntoNombre: `CERT-${formCertificado.numeroCertificado}.pdf`
    };

    setCertificados(prev => [nuevo, ...prev]);
    setIsNuevoModalOpen(false);
    setNotificacion(`¡Certificación registrada para ${formCertificado.trabajadorNombre}!`);
    setTimeout(() => setNotificacion(null), 4000);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Toast Notificación */}
      {notificacion && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-700 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-emerald-500 animate-slide-up">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <span className="text-sm font-semibold">{notificacion}</span>
        </div>
      )}

      {/* Top Banner Corporativo Núcleo Style */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-lg border border-rose-900/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-rose-500/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono text-[11px] font-bold tracking-wider px-2.5 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-400/30">
                [SSL] SEGURIDAD & SALUD LABORAL
              </span>
              <span className="text-slate-400 text-xs">·</span>
              <span className="text-slate-300 text-xs font-medium">Normativas ASME B30 · COVENIN · INPSASEL</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <ShieldAlert className="w-7 h-7 text-rose-400" />
              <span>Seguimiento de Certificados y Cursos HSE</span>
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
              Matriz de acreditaciones obligatorias para operadores de las <strong className="text-rose-200">26 Grúas TIMACA</strong>, maniobristas (Riggers), soldadores calificados ASME IX y permisos para trabajos en alturas y espacios confinados.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
            {canEdit ? (
              <button
                onClick={() => setIsNuevoModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer hover:shadow-rose-600/20"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Registrar / Renovar Certificado</span>
              </button>
            ) : (
              <div className="px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-slate-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Modo Observador (Solo Lectura)</span>
              </div>
            )}

            {onGoToGruas && (
              <button
                onClick={onGoToGruas}
                className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-600 transition-colors cursor-pointer"
                title="Ver flota de 26 Grúas en Proyectos Internos"
              >
                <Truck className="w-3.5 h-3.5 text-sky-400" />
                <span>Ver Flota 26 Grúas</span>
              </button>
            )}
          </div>
        </div>

        {/* Mini Breadcrumb Status */}
        <div className="mt-5 pt-4 border-t border-slate-700/60 flex flex-wrap items-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Personal Apto para Operación: <strong className="text-emerald-300">{stats.porcentajeHabilitados}%</strong></span>
          </div>
          <span>·</span>
          <div>
            Personal Bloqueado por Vencimiento: <strong className="text-rose-400">{stats.bloqueados} trabajadores</strong>
          </div>
          <span>·</span>
          <div>
            Operadores de Grúa Auditados: <strong className="text-slate-200">{stats.operadoresGrua} certificados</strong>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        
        {/* KPI 1: Total Certificados */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider">Total Acreditaciones</span>
            <span className="p-1.5 bg-slate-100 rounded-lg text-slate-700">
              <Award className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {stats.total} <span className="text-xs font-bold text-slate-500">Expedientes</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-600 flex items-center justify-between">
            <span>Certificados Vigentes:</span>
            <strong className="font-mono text-emerald-700">{stats.vigentes} aptos</strong>
          </div>
        </div>

        {/* KPI 2: Por Vencer (<30 días) */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between text-amber-600 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider">Por Vencer (&lt;30d)</span>
            <span className="p-1.5 bg-amber-50 rounded-lg text-amber-600">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 tracking-tight">
            {stats.porVencer} <span className="text-xs font-bold text-slate-500">En Alerta</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-600 flex items-center justify-between">
            <span>Programar Recertificación:</span>
            <strong className="font-mono text-amber-700">Urgente</strong>
          </div>
        </div>

        {/* KPI 3: Vencidos / Bloqueo Operativo */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between text-rose-600 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider">Bloqueo de Operación</span>
            <span className="p-1.5 bg-rose-50 rounded-lg text-rose-600">
              <Lock className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-600 tracking-tight">
            {stats.bloqueados} <span className="text-xs font-bold text-slate-500">Bloqueados</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-600 flex items-center justify-between">
            <span>Inhabilitados en Obra:</span>
            <strong className="font-mono text-rose-700">Riesgo Crítico</strong>
          </div>
        </div>

        {/* KPI 4: Operadores 26 Grúas */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between text-blue-600 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider">Flota 26 Grúas TIMACA</span>
            <span className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
              <Truck className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {stats.operadoresGrua} / 26 <span className="text-xs font-bold text-slate-500">Asignados</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-600 flex items-center justify-between">
            <span>Norma Aplicada:</span>
            <strong className="text-blue-700">ASME B30.5</strong>
          </div>
        </div>
      </div>

      {/* Tabs Principales */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        
        {/* Tab Buttons */}
        <div className="border-b border-slate-200 px-4 sm:px-6 pt-3 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-2 sm:pb-0">
            <button
              onClick={() => setActiveTab('matriz')}
              className={`px-3.5 py-2.5 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'matriz'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Matriz General de Certificados ({certificados.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('gruas')}
              className={`px-3.5 py-2.5 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'gruas'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Operadores 26 Grúas TIMACA</span>
            </button>

            <button
              onClick={() => setActiveTab('bloqueos')}
              className={`px-3.5 py-2.5 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'bloqueos'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Alertas de Bloqueo ({stats.bloqueados})</span>
            </button>
          </div>

          <div className="text-xs text-slate-500 font-mono hidden md:block pb-2 sm:pb-0">
            Filtrados: <span className="font-bold text-slate-800">{filteredCertificados.length} registros</span>
          </div>
        </div>

        {/* Tab 1: Matriz de Certificados */}
        {activeTab === 'matriz' && (
          <div className="p-4 sm:p-6 space-y-4">
            
            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por trabajador, cédula, curso o número de certificado..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
                />
              </div>

              <div className="flex gap-2">
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:bg-white focus:outline-none cursor-pointer"
                >
                  <option value="TODAS">Todas las Áreas</option>
                  <option value="Operadores de Grúas">Operadores de Grúas</option>
                  <option value="Riggers & Maniobristas">Riggers & Maniobristas</option>
                  <option value="Soldadores Calificados">Soldadores Calificados</option>
                  <option value="Mantenimiento Mecánico">Mantenimiento Mecánico</option>
                  <option value="Electricistas Industriales">Electricistas Industriales</option>
                </select>

                <select
                  value={selectedEstado}
                  onChange={(e) => setSelectedEstado(e.target.value)}
                  className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:bg-white focus:outline-none cursor-pointer"
                >
                  <option value="TODOS">Todos los Estados</option>
                  <option value="Vigente">Vigente</option>
                  <option value="Por Vencer">Por Vencer (&lt;30d)</option>
                  <option value="Vencido">Vencido</option>
                </select>
              </div>
            </div>

            {/* Tabla de Certificados */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs text-slate-700 border-collapse">
                <thead className="bg-slate-100/80 text-slate-600 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3.5">Trabajador & Cédula</th>
                    <th className="py-3 px-3.5">Área / Equipo</th>
                    <th className="py-3 px-3.5">Curso / Acreditación</th>
                    <th className="py-3 px-3.5">Entidad Emisora</th>
                    <th className="py-3 px-3.5">Vigencia / Vencimiento</th>
                    <th className="py-3 px-3.5 text-center">Estado Semáforo</th>
                    <th className="py-3 px-3.5 text-center">Carnet Digital</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCertificados.map((cert) => {
                    const isVencido = cert.estado === 'Vencido';
                    const isPorVencer = cert.estado === 'Por Vencer';

                    return (
                      <tr key={cert.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3.5">
                          <div className="font-bold text-slate-900">{cert.trabajadorNombre}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{cert.cedula} · {cert.cargo}</div>
                        </td>

                        <td className="py-2.5 px-3.5">
                          <span className="inline-block bg-slate-100 px-2 py-0.5 rounded text-[11px] font-medium text-slate-800">
                            {cert.area}
                          </span>
                          {cert.equipoAsignado && (
                            <span className="block text-[10px] text-blue-700 font-medium mt-0.5 truncate max-w-xs">
                              {cert.equipoAsignado}
                            </span>
                          )}
                        </td>

                        <td className="py-2.5 px-3.5 max-w-xs">
                          <div className="font-semibold text-slate-900">{cert.cursoNombre}</div>
                          <div className="text-[10px] text-slate-500 font-mono">N° {cert.numeroCertificado}</div>
                        </td>

                        <td className="py-2.5 px-3.5 whitespace-nowrap text-slate-700">
                          {cert.entidadEmisora}
                        </td>

                        <td className="py-2.5 px-3.5 font-mono text-slate-700 whitespace-nowrap">
                          <div>{cert.fechaVencimiento}</div>
                          <div className="text-[10px] text-slate-500">
                            {cert.diasParaVencer > 0 ? `${cert.diasParaVencer} días rest.` : `Vencido hace ${Math.abs(cert.diasParaVencer)}d`}
                          </div>
                        </td>

                        <td className="py-2.5 px-3.5 text-center whitespace-nowrap">
                          {isVencido && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                              <Lock className="w-3 h-3 text-rose-600" />
                              BLOQUEADO
                            </span>
                          )}
                          {isPorVencer && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                              <Clock className="w-3 h-3 text-amber-600" />
                              Por Vencer ({cert.diasParaVencer}d)
                            </span>
                          )}
                          {!isVencido && !isPorVencer && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Vigente
                            </span>
                          )}
                        </td>

                        <td className="py-2.5 px-3.5 text-center whitespace-nowrap">
                          <button
                            onClick={() => setCarnetSeleccionado(cert)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                            title="Ver Carnet Digital Oficial con Código QR"
                          >
                            <QrCode className="w-3.5 h-3.5 text-rose-600" />
                            <span>Ver Carnet</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Operadores 26 Grúas */}
        {activeTab === 'gruas' && (
          <div className="p-4 sm:p-6 space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 space-y-1">
              <strong className="font-bold">Protocolo de Operación Segura para Flota de 26 Grúas TIMACA:</strong>
              <p>
                Ninguna grúa (Liebherr GR17, Grove GR15, Link-Belt GR18, etc.) puede iniciar maniobra de izaje en patios o clientes sin la certificación ASME B30.5 / COVENIN 3188 vigente del operador asignado.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certificados.filter(c => c.area === 'Operadores de Grúas').map((c) => (
                <div key={c.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">{c.trabajadorNombre}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      c.estado === 'Vigente' ? 'bg-emerald-100 text-emerald-800' :
                      c.estado === 'Por Vencer' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {c.estado}
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs space-y-1">
                    <div><strong>Equipo Asignado:</strong> <span className="text-blue-700 font-bold">{c.equipoAsignado}</span></div>
                    <div><strong>Cédula:</strong> {c.cedula}</div>
                    <div><strong>Certificado:</strong> {c.numeroCertificado}</div>
                    <div><strong>Vencimiento:</strong> {c.fechaVencimiento} ({c.diasParaVencer} días)</div>
                    <div><strong>Entidad:</strong> {c.entidadEmisora}</div>
                  </div>

                  <div className="flex justify-between items-center pt-1">
                    <span className="text-[10px] text-slate-500 font-mono">Horas de Formación: {c.horasFormacion}h</span>
                    <button
                      onClick={() => setCarnetSeleccionado(c)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      Ver Carnet de Operador
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Alertas de Bloqueo */}
        {activeTab === 'bloqueos' && (
          <div className="p-4 sm:p-6 space-y-4">
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs text-rose-900 space-y-1">
              <strong className="font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Personal Inhabilitado para Labores Operativas en Planta y Campo:</span>
              </strong>
              <p>
                Los siguientes trabajadores tienen certificaciones críticas vencidas. Han sido bloqueados automáticamente para asignación a guardias, frentes de obra y maniobras de izaje hasta que completen su recertificación.
              </p>
            </div>

            <div className="space-y-3">
              {certificados.filter(c => c.bloqueaOperacion).map((c) => (
                <div key={c.id} className="p-4 bg-rose-50/60 border border-rose-200 rounded-xl flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs">{c.trabajadorNombre}</span>
                      <span className="text-[11px] text-slate-500 font-mono">({c.cedula})</span>
                      <span className="text-[10px] bg-rose-200 text-rose-900 font-bold px-2 py-0.5 rounded">
                        BLOQUEADO EN SISTEMA
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 mt-1">
                      Curso: <strong>{c.cursoNombre}</strong>
                    </p>
                    <div className="text-[11px] text-rose-700 font-mono mt-0.5">
                      Venció el {c.fechaVencimiento} (hace {Math.abs(c.diasParaVencer)} días)
                    </div>
                  </div>

                  {canEdit && (
                    <button
                      onClick={() => {
                        setFormCertificado({
                          ...formCertificado,
                          trabajadorNombre: c.trabajadorNombre,
                          cedula: c.cedula,
                          cargo: c.cargo,
                          area: c.area,
                          cursoNombre: c.cursoNombre,
                          equipoAsignado: c.equipoAsignado || ''
                        });
                        setIsNuevoModalOpen(true);
                      }}
                      className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shrink-0"
                    >
                      Renovar Acreditación
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal: Carnet Digital Oficial con QR */}
      {carnetSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-rose-600" />
                <h3 className="text-sm font-bold text-slate-900">Carnet Digital de Habilitación HSE</h3>
              </div>
              <button
                onClick={() => setCarnetSeleccionado(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Carnet Visual TIMACA */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white rounded-2xl p-5 border border-slate-700 shadow-xl space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                <div>
                  <span className="font-black text-xs tracking-wider text-sky-400 block">TIMACA</span>
                  <span className="text-[9px] text-slate-400">Seguridad & Salud Laboral</span>
                </div>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                  carnetSeleccionado.estado === 'Vigente' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40' :
                  carnetSeleccionado.estado === 'Por Vencer' ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40' :
                  'bg-rose-500/20 text-rose-300 border border-rose-400/40'
                }`}>
                  {carnetSeleccionado.estado.toUpperCase()}
                </span>
              </div>

              <div className="flex gap-4 items-center">
                <div className="w-16 h-16 bg-slate-700 rounded-xl flex items-center justify-center font-bold text-lg text-white border border-slate-600 shrink-0">
                  {carnetSeleccionado.trabajadorNombre.slice(0, 1)}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">{carnetSeleccionado.trabajadorNombre}</h4>
                  <div className="text-[11px] text-slate-300 font-mono">{carnetSeleccionado.cedula}</div>
                  <div className="text-[10px] text-sky-300 font-medium">{carnetSeleccionado.cargo}</div>
                </div>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 text-[11px] space-y-1">
                <div><strong>Acreditación:</strong> {carnetSeleccionado.cursoNombre}</div>
                {carnetSeleccionado.equipoAsignado && (
                  <div><strong>Equipo:</strong> {carnetSeleccionado.equipoAsignado}</div>
                )}
                <div><strong>N° Carnet:</strong> <span className="font-mono text-sky-300">{carnetSeleccionado.numeroCertificado}</span></div>
                <div><strong>Vigencia:</strong> Hasta {carnetSeleccionado.fechaVencimiento}</div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-700/60 text-[10px] text-slate-400">
                <span>Emisor: {carnetSeleccionado.entidadEmisora}</span>
                <span className="font-mono">VALIDADO INPSASEL</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setCarnetSeleccionado(null)}
                className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors"
              >
                Cerrar Carnet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Registrar Nueva Certificación */}
      {isNuevoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                <Award className="w-5 h-5 text-rose-600" />
                <span>Registrar / Renovar Certificación HSE</span>
              </div>
              <button
                onClick={() => setIsNuevoModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCrearCertificado} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nombre Trabajador:</label>
                  <input
                    type="text"
                    placeholder="Ej. Nelson Rondón"
                    value={formCertificado.trabajadorNombre}
                    onChange={(e) => setFormCertificado({ ...formCertificado, trabajadorNombre: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cédula:</label>
                  <input
                    type="text"
                    placeholder="V-13.820.194"
                    value={formCertificado.cedula}
                    onChange={(e) => setFormCertificado({ ...formCertificado, cedula: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Área / Especialidad:</label>
                  <select
                    value={formCertificado.area}
                    onChange={(e) => setFormCertificado({ ...formCertificado, area: e.target.value as AreaPersonalHSE })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none"
                  >
                    <option value="Operadores de Grúas">Operadores de Grúas</option>
                    <option value="Riggers & Maniobristas">Riggers & Maniobristas</option>
                    <option value="Soldadores Calificados">Soldadores Calificados</option>
                    <option value="Mantenimiento Mecánico">Mantenimiento Mecánico</option>
                    <option value="Electricistas Industriales">Electricistas Industriales</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Equipo Asignado (Opcional):</label>
                  <input
                    type="text"
                    placeholder="Ej. Grúa GR17 Liebherr 160T"
                    value={formCertificado.equipoAsignado}
                    onChange={(e) => setFormCertificado({ ...formCertificado, equipoAsignado: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Curso / Certificación Obtenida:</label>
                <input
                  type="text"
                  value={formCertificado.cursoNombre}
                  onChange={(e) => setFormCertificado({ ...formCertificado, cursoNombre: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Entidad Certificadora:</label>
                  <input
                    type="text"
                    value={formCertificado.entidadEmisora}
                    onChange={(e) => setFormCertificado({ ...formCertificado, entidadEmisora: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fecha de Vencimiento:</label>
                  <input
                    type="date"
                    value={formCertificado.fechaVencimiento}
                    onChange={(e) => setFormCertificado({ ...formCertificado, fechaVencimiento: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsNuevoModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-colors shadow-xs"
                >
                  Registrar Certificado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
