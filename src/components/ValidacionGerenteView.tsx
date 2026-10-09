import React, { useState, useMemo } from 'react';
import { useCostos } from '../context/CostosContext';
import { UsuarioSistema } from '../types/usuarios';
import { SalidaCosto } from '../types/costos';
import { formatCurrency } from '../utils/dateHelpers';
import { isNormalizacion } from '../utils/normalizacionFilter';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Search, 
  Filter, 
  Briefcase, 
  Layers, 
  FileText, 
  Check, 
  X, 
  AlertCircle, 
  Download, 
  ArrowLeft,
  ChevronDown,
  Info,
  ExternalLink,
  ShieldAlert,
  Building2,
  Wrench,
  PackageCheck,
  Send
} from 'lucide-react';

interface ValidacionGerenteViewProps {
  currentUser: UsuarioSistema;
  onVolver?: () => void;
  onGoToDashboard?: () => void;
}

export const ValidacionGerenteView: React.FC<ValidacionGerenteViewProps> = ({
  currentUser,
  onVolver,
  onGoToDashboard
}) => {
  const { salidas, validarSalida } = useCostos();

  const isGerente = currentUser.rol === 'Gerente de Proyecto';
  const isAdmin = currentUser.rol === 'Administrador';
  const cuentasPermitidas = currentUser.cuentasAsignadas || [];

  // Filtros locales
  const [selectedMes, setSelectedMes] = useState<string>('8'); // Por defecto Agosto (mes de auditoría activa)
  const [selectedRubro, setSelectedRubro] = useState<'todos' | 'Materiales Directos' | 'Servicios'>('todos');
  const [selectedEstado, setSelectedEstado] = useState<'todos' | 'Observado' | 'Conforme' | 'Pendiente'>('todos');
  const [selectedCuenta, setSelectedCuenta] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');

  // Estado del Modal de Observación
  const [modalOpen, setModalOpen] = useState(false);
  const [salidaParaObservar, setSalidaParaObservar] = useState<SalidaCosto | null>(null);
  const [tipoDiscrepancia, setTipoDiscrepancia] = useState('Material pertenece a otro proyecto');
  const [proyectoCorrectoSugerido, setProyectoCorrectoSugerido] = useState('TTE-C-0671 · Segunda Línea PMH');
  const [comentarioGerente, setComentarioGerente] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  // 1. Filtrar el universo según el rol del usuario (Segregación Ciega de Proyecto)
  const salidasPermitidas = useMemo(() => {
    return salidas.filter(s => {
      // Excluir normalizaciones
      if (isNormalizacion(s)) return false;

      // Solo Materiales Directos y Servicios
      const esMaterial = s.tipo === 'Materiales Directos' || s.categoria?.toLowerCase().includes('material') || s.categoria?.toLowerCase().includes('acero') || s.categoria?.toLowerCase().includes('herramienta');
      const esServicio = s.tipo === 'Servicios' || s.categoria?.toLowerCase().includes('servicio');
      if (!esMaterial && !esServicio) return false;

      // Si es Gerente de Proyecto, restringir ESTRICTAMENTE a sus cuentas asignadas
      if (isGerente && cuentasPermitidas.length > 0) {
        return cuentasPermitidas.includes(s.cuentaAuxiliarCodigo);
      }

      return true;
    });
  }, [salidas, isGerente, cuentasPermitidas]);

  // Lista de cuentas disponibles para el selector
  const cuentasDisponibles = useMemo(() => {
    const map = new Map<string, string>();
    salidasPermitidas.forEach(s => {
      map.set(s.cuentaAuxiliarCodigo, s.proyecto || s.cuentaAuxiliarNombre);
    });
    return Array.from(map.entries()).map(([codigo, nombre]) => ({ codigo, nombre }));
  }, [salidasPermitidas]);

  // Manejador centralizado para seleccionar estado y evitar conflictos con filtros restrictivos de rubro
  const handleSelectEstado = (nuevoEstado: 'todos' | 'Observado' | 'Conforme' | 'Pendiente') => {
    setSelectedEstado(nuevoEstado);
    // Si la persona hace clic en Observado o Conforme, desactiva automáticamente cualquier filtro de rubro conflictivo (ej. Solo Servicios)
    if (nuevoEstado === 'Observado' || nuevoEstado === 'Conforme') {
      if (selectedRubro !== 'todos') {
        setSelectedRubro('todos');
      }
    }
  };

  // 2. Aplicar filtros interactivos de la vista
  const salidasFiltradas = useMemo(() => {
    const list = salidasPermitidas.filter(s => {
      // Filtro por mes
      if (selectedMes !== 'todos' && String(s.mes) !== selectedMes) {
        return false;
      }

      // Filtro por Rubro
      if (selectedRubro !== 'todos') {
        const esMaterial = s.tipo === 'Materiales Directos' || s.categoria?.toLowerCase().includes('material') || s.categoria?.toLowerCase().includes('acero') || s.categoria?.toLowerCase().includes('herramienta');
        if (selectedRubro === 'Materiales Directos' && !esMaterial) return false;
        if (selectedRubro === 'Servicios' && esMaterial) return false;
      }

      // Filtro por Cuenta
      if (selectedCuenta !== 'todos' && s.cuentaAuxiliarCodigo !== selectedCuenta) {
        return false;
      }

      // Filtro por Estado de Validación
      const estado = s.estadoValidacion || 'Pendiente';
      if (selectedEstado !== 'todos' && estado !== selectedEstado) {
        return false;
      }

      // Búsqueda en texto
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const match =
          s.codigoSalida.toLowerCase().includes(q) ||
          s.itemDescripcion.toLowerCase().includes(q) ||
          (s.solicitante && s.solicitante.toLowerCase().includes(q)) ||
          (s.motivo && s.motivo.toLowerCase().includes(q)) ||
          (s.observacionGerente && s.observacionGerente.toLowerCase().includes(q));
        if (!match) return false;
      }

      return true;
    });

    // Ordenar con máxima prioridad: Observados (1), Conformes (2), Pendientes (3) por monto descendente
    return list.sort((a, b) => {
      const getPriority = (item: SalidaCosto) => {
        const est = item.estadoValidacion || 'Pendiente';
        if (est === 'Observado') return 1;
        if (est === 'Conforme') return 2;
        return 3;
      };

      const diff = getPriority(a) - getPriority(b);
      if (diff !== 0) return diff;

      // Mayor monto primero para destacar los vales de mayor impacto
      return (b.montoTotal || 0) - (a.montoTotal || 0);
    });
  }, [salidasPermitidas, selectedMes, selectedRubro, selectedCuenta, selectedEstado, searchTerm]);

  // Métricas de estado de validación sincronizadas con los filtros activos
  const metricas = useMemo(() => {
    let totalMonto = 0;
    let montoMateriales = 0;
    let montoServicios = 0;
    let conformesCount = 0;
    let conformesMonto = 0;
    let observadosCount = 0;
    let observadosMonto = 0;
    let pendientesCount = 0;
    let pendientesMonto = 0;

    salidasPermitidas.forEach(s => {
      // Tomamos el universo del mes seleccionado (o todos)
      if (selectedMes !== 'todos' && String(s.mes) !== selectedMes) return;
      if (selectedCuenta !== 'todos' && s.cuentaAuxiliarCodigo !== selectedCuenta) return;

      const monto = s.montoTotal || 0;
      const esMaterial = s.tipo === 'Materiales Directos' || s.categoria?.toLowerCase().includes('material') || s.categoria?.toLowerCase().includes('acero') || s.categoria?.toLowerCase().includes('herramienta');

      // Si hay un rubro activo específico, adaptamos las métricas para que los conteos sean 100% consistentes
      if (selectedRubro === 'Materiales Directos' && !esMaterial) return;
      if (selectedRubro === 'Servicios' && esMaterial) return;

      totalMonto += monto;
      if (esMaterial) montoMateriales += monto;
      else montoServicios += monto;

      const est = s.estadoValidacion || 'Pendiente';
      if (est === 'Conforme') {
        conformesCount++;
        conformesMonto += monto;
      } else if (est === 'Observado') {
        observadosCount++;
        observadosMonto += monto;
      } else {
        pendientesCount++;
        pendientesMonto += monto;
      }
    });

    return {
      totalCount: conformesCount + observadosCount + pendientesCount,
      totalMonto,
      montoMateriales,
      montoServicios,
      conformesCount,
      conformesMonto,
      observadosCount,
      observadosMonto,
      pendientesCount,
      pendientesMonto
    };
  }, [salidasPermitidas, selectedMes, selectedCuenta, selectedRubro]);

  // Manejador para marcar Conforme
  const handleMarcarConforme = (salida: SalidaCosto) => {
    validarSalida(
      salida.id, 
      'Conforme', 
      'Material/Servicio validado satisfactoriamente por el encargado de proyecto.',
      `${currentUser.nombre} (${currentUser.rol})`
    );
    setFeedbackSuccess(`Vale ${salida.codigoSalida} validado como CONFORME.`);
    setTimeout(() => setFeedbackSuccess(null), 3000);
  };

  // Abrir Modal de Observación
  const handleAbrirObservacion = (salida: SalidaCosto) => {
    setSalidaParaObservar(salida);
    setTipoDiscrepancia('Material pertenece a otro proyecto');
    setProyectoCorrectoSugerido('TTE-C-0671 · Segunda Línea PMH');
    setComentarioGerente(salida.observacionGerente || `MALA IMPUTACIÓN: Este material no fue recibido ni consumido en el frente ${salida.proyecto}.`);
    setModalOpen(true);
  };

  // Guardar Observación
  const handleGuardarObservacion = () => {
    if (!salidaParaObservar) return;
    const notaFinal = `[${tipoDiscrepancia.toUpperCase()}] ${comentarioGerente} (Sugerencia: Imputar a ${proyectoCorrectoSugerido})`;
    validarSalida(
      salidaParaObservar.id,
      'Observado',
      notaFinal,
      `${currentUser.nombre} (${currentUser.rol})`
    );
    setModalOpen(false);
    setSalidaParaObservar(null);
    setFeedbackSuccess(`Discrepancia registrada para el vale ${salidaParaObservar.codigoSalida}. Notificado a Costos.`);
    setTimeout(() => setFeedbackSuccess(null), 4000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Banner de Feedback flotante */}
      {feedbackSuccess && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between animate-slide-down">
          <div className="flex items-center gap-2 text-sm font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-200" />
            <span>{feedbackSuccess}</span>
          </div>
          <button onClick={() => setFeedbackSuccess(null)} className="text-emerald-200 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Cabecera Principal */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
                Módulo de Validación de Imputaciones
              </h2>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                isGerente
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-blue-50 text-blue-800 border-blue-200'
              }`}>
                {isGerente ? 'Vista de Gerente de Proyecto' : 'Vista de Administradora (Auditoría Global)'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-600 max-w-3xl leading-relaxed">
              Verificación semanal anticipada de <strong>Materiales Directos</strong> y <strong>Servicios</strong>. Permite a los encargados validar recepciones reales y objetar imputaciones erróneas para que Costos las corrija antes de la presentación de cierre mensual.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start lg:self-center">
            {onGoToDashboard && (
              <button
                onClick={onGoToDashboard}
                className="flex items-center gap-1.5 text-xs font-bold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 px-3.5 py-2 rounded-xl transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver al Resumen</span>
              </button>
            )}
          </div>
        </div>

        {/* Barra de perfil asignado */}
        <div className="mt-4 pt-4 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50/70 p-3 rounded-xl border border-slate-200/60">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-neutral-500 font-medium">Usuario Activo:</span>
            <span className="font-bold text-neutral-900">{currentUser.nombre}</span>
            <span className="text-neutral-400">·</span>
            <span className="text-neutral-600">{currentUser.cargo}</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-500 font-medium flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              Proyectos Asignados:
            </span>
            {isGerente && cuentasPermitidas.length > 0 ? (
              cuentasPermitidas.map(c => (
                <span key={c} className="font-mono font-bold text-blue-800 bg-blue-100/80 px-2 py-0.5 rounded border border-blue-300/80">
                  {c}
                </span>
              ))
            ) : (
              <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Acceso Global a Todos los Proyectos TIMACA (360°)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tarjetas de Métricas de Validación (Interactivas y Filtrables) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* KPI 1: Total Asignado */}
        <div 
          onClick={() => handleSelectEstado('todos')}
          className={`p-4 rounded-xl border transition-all cursor-pointer shadow-2xs group ${
            selectedEstado === 'todos' 
              ? 'bg-white border-blue-500 ring-2 ring-blue-500/20 shadow-xs' 
              : 'bg-white hover:bg-slate-50 border-neutral-200'
          }`}
          title="Ver todos los comprobantes (Pendientes, Conformes y Observados)"
        >
          <div className="flex items-center justify-between text-neutral-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 group-hover:text-blue-700">Total Imputado</span>
            <Briefcase className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-xl font-bold font-mono text-neutral-900 tabular-nums block">
            {formatCurrency(metricas.totalMonto)}
          </span>
          <div className="mt-1 flex items-center justify-between text-[11px] text-neutral-500">
            <span>Mat: {formatCurrency(metricas.montoMateriales)}</span>
            <span>Serv: {formatCurrency(metricas.montoServicios)}</span>
          </div>
        </div>

        {/* KPI 2: Conformes */}
        <div 
          onClick={() => handleSelectEstado('Conforme')}
          className={`p-4 rounded-xl border transition-all cursor-pointer shadow-2xs group ${
            selectedEstado === 'Conforme' 
              ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs' 
              : 'bg-emerald-50/60 hover:bg-emerald-100/70 border-emerald-200'
          }`}
          title="Filtrar por comprobantes validados como CONFORMES"
        >
          <div className="flex items-center justify-between text-emerald-700 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">✓ Conformes</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-xl font-bold font-mono text-emerald-950 tabular-nums block">
            {formatCurrency(metricas.conformesMonto)}
          </span>
          <div className="mt-1 flex items-center justify-between text-[11px] text-emerald-700">
            <span>{metricas.conformesCount} comprobante{metricas.conformesCount !== 1 ? 's' : ''}</span>
            <span className="font-bold">
              {metricas.totalCount > 0 ? `${Math.round((metricas.conformesCount / metricas.totalCount) * 100)}%` : '0%'}
            </span>
          </div>
        </div>

        {/* KPI 3: Observados (Alerta Crítica) */}
        <div 
          onClick={() => handleSelectEstado('Observado')}
          className={`p-4 rounded-xl border transition-all cursor-pointer shadow-2xs group ${
            selectedEstado === 'Observado' 
              ? 'bg-red-50 border-red-500 ring-2 ring-red-500/20 shadow-xs' 
              : 'bg-red-50/70 hover:bg-red-100/80 border-red-200'
          }`}
          title="Filtrar por comprobantes con OBSERVACIÓN o MALA IMPUTACIÓN reportada"
        >
          <div className="flex items-center justify-between text-red-700 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">⚠ Observados / Error</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <span className="text-xl font-bold font-mono text-red-950 tabular-nums block">
            {formatCurrency(metricas.observadosMonto)}
          </span>
          <div className="mt-1 flex items-center justify-between text-[11px] text-red-700">
            <span className="font-bold">{metricas.observadosCount} discrepancia{metricas.observadosCount !== 1 ? 's' : ''}</span>
            <span>Pendiente corrección</span>
          </div>
        </div>

        {/* KPI 4: Pendientes de Revisión */}
        <div 
          onClick={() => handleSelectEstado('Pendiente')}
          className={`p-4 rounded-xl border transition-all cursor-pointer shadow-2xs group ${
            selectedEstado === 'Pendiente' 
              ? 'bg-slate-100 border-slate-500 ring-2 ring-slate-500/20 shadow-xs' 
              : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200'
          }`}
          title="Filtrar por comprobantes pendientes por revisar"
        >
          <div className="flex items-center justify-between text-slate-600 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">○ Pendientes</span>
            <Clock className="w-4 h-4 text-slate-500" />
          </div>
          <span className="text-xl font-bold font-mono text-slate-900 tabular-nums block">
            {formatCurrency(metricas.pendientesMonto)}
          </span>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
            <span>{metricas.pendientesCount.toLocaleString('de-DE')} por revisar</span>
            <span>{metricas.totalCount > 0 ? `${Math.round((metricas.pendientesCount / metricas.totalCount) * 100)}%` : '0%'}</span>
          </div>
        </div>

        {/* KPI 5: Estado de la Auditoría */}
        <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-blue-800 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Avance de Revisión</span>
              <PackageCheck className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-xl font-black font-mono text-blue-950 block">
              {metricas.totalCount > 0 ? Math.round(((metricas.conformesCount + metricas.observadosCount) / metricas.totalCount) * 100) : 0}%
            </span>
          </div>
          <p className="text-[10px] text-blue-800 font-medium">
            {metricas.observadosCount > 0 ? `Atención: ${metricas.observadosCount} vale requiere reclasificación` : 'Imputaciones al día'}
          </p>
        </div>
      </div>

      {/* Barra de Filtros de la Tabla */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Filtros de Mes, Rubro y Estado */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Mes */}
            <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
              <button
                onClick={() => setSelectedMes('todos')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  selectedMes === 'todos' ? 'bg-blue-600 text-white font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Todo el Año
              </button>
              <button
                onClick={() => setSelectedMes('8')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  selectedMes === '8' ? 'bg-blue-600 text-white font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Agosto 2026 (Activo)
              </button>
              <button
                onClick={() => setSelectedMes('7')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  selectedMes === '7' ? 'bg-blue-600 text-white font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Julio 2026
              </button>
            </div>

            {/* Rubro */}
            <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
              <button
                onClick={() => setSelectedRubro('todos')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  selectedRubro === 'todos' ? 'bg-blue-600 text-white font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Materiales & Servicios
              </button>
              <button
                onClick={() => setSelectedRubro('Materiales Directos')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  selectedRubro === 'Materiales Directos' ? 'bg-blue-600 text-white font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Solo Materiales
              </button>
              <button
                onClick={() => setSelectedRubro('Servicios')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  selectedRubro === 'Servicios' ? 'bg-blue-600 text-white font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Solo Servicios
              </button>
            </div>

            {/* Estado de Validación */}
            <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
              <button
                onClick={() => handleSelectEstado('todos')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  selectedEstado === 'todos' ? 'bg-slate-900 text-white font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Todos ({metricas.totalCount.toLocaleString('de-DE')})
              </button>
              <button
                onClick={() => handleSelectEstado('Observado')}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                  selectedEstado === 'Observado' ? 'bg-red-600 text-white font-bold shadow-2xs' : 'text-red-700 hover:bg-red-50'
                }`}
              >
                <AlertTriangle className="w-3 h-3" />
                <span>Observados ({metricas.observadosCount})</span>
              </button>
              <button
                onClick={() => handleSelectEstado('Conforme')}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                  selectedEstado === 'Conforme' ? 'bg-emerald-600 text-white font-bold shadow-2xs' : 'text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                <Check className="w-3 h-3" />
                <span>Conformes ({metricas.conformesCount})</span>
              </button>
              <button
                onClick={() => handleSelectEstado('Pendiente')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  selectedEstado === 'Pendiente' ? 'bg-slate-700 text-white font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pendientes ({metricas.pendientesCount.toLocaleString('de-DE')})
              </button>
            </div>
          </div>

          {/* Buscador */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por vale, material, motivo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Selector de Proyecto/Cuenta Auxiliar Compacto */}
        {cuentasDisponibles.length > 1 && (
          <div className="pt-2.5 border-t border-neutral-100 flex items-center gap-2 flex-wrap text-xs">
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] shrink-0">Filtrar por Frente:</span>
            <button
              onClick={() => setSelectedCuenta('todos')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                selectedCuenta === 'todos'
                  ? 'bg-blue-600 text-white font-bold shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Todos ({cuentasDisponibles.length})
            </button>
            
            {cuentasDisponibles.length <= 6 ? (
              cuentasDisponibles.map(c => (
                <button
                  key={c.codigo}
                  onClick={() => setSelectedCuenta(c.codigo)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                    selectedCuenta === c.codigo
                      ? 'bg-blue-600 text-white font-bold shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {c.codigo} · {c.nombre}
                </button>
              ))
            ) : (
              <>
                {[
                  { codigo: 'TTE-C-0676', nombre: '2da Línea Pellas (con objeción)' },
                  { codigo: 'TTE-C-0671', nombre: '2da Línea PMH' },
                  { codigo: 'TTE-C-0706', nombre: 'Línea 1 Pellas' },
                  { codigo: 'TTE-C-0668', nombre: 'Briquetas Fase 2' },
                  { codigo: 'TTE-C-0656', nombre: 'Bandas PMH' }
                ].filter(p => cuentasDisponibles.some(c => c.codigo === p.codigo)).map(c => (
                  <button
                    key={c.codigo}
                    onClick={() => setSelectedCuenta(c.codigo)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                      selectedCuenta === c.codigo
                        ? 'bg-blue-600 text-white font-bold shadow-2xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {c.codigo} · {c.nombre}
                  </button>
                ))}

                {selectedCuenta !== 'todos' && !['TTE-C-0676', 'TTE-C-0671', 'TTE-C-0706', 'TTE-C-0668', 'TTE-C-0656'].includes(selectedCuenta) && (
                  <span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-900 border border-blue-300 text-xs font-bold px-2.5 py-1 rounded-lg shadow-2xs">
                    <span>{selectedCuenta} · {cuentasDisponibles.find(c => c.codigo === selectedCuenta)?.nombre || selectedCuenta}</span>
                    <button onClick={() => setSelectedCuenta('todos')} className="hover:text-red-600 text-blue-700" title="Quitar filtro de cuenta">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}

                <select
                  value={selectedCuenta === 'todos' ? '' : selectedCuenta}
                  onChange={(e) => setSelectedCuenta(e.target.value || 'todos')}
                  className="bg-white border border-slate-300 text-slate-700 text-xs rounded-lg px-2.5 py-1 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer hover:border-blue-400 font-medium max-w-[280px] truncate"
                >
                  <option value="">+ Seleccionar otro frente ({cuentasDisponibles.length} disponibles)...</option>
                  <option value="todos">Ver todos los proyectos</option>
                  <optgroup label="Todos los Proyectos TIMACA">
                    {cuentasDisponibles.map(c => (
                      <option key={c.codigo} value={c.codigo}>
                        {c.codigo} — {c.nombre}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </>
            )}
          </div>
        )}

        {/* Barra de Filtros Activos y Limpieza Rápida */}
        {(selectedEstado !== 'todos' || selectedRubro !== 'todos' || selectedCuenta !== 'todos' || selectedMes !== '8' || searchTerm.trim()) && (
          <div className="pt-2 border-t border-neutral-100 flex items-center justify-between gap-2 flex-wrap text-xs bg-slate-50/60 p-2 rounded-lg">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Filtros Activos:</span>
              {selectedEstado !== 'todos' && (
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border ${
                  selectedEstado === 'Observado' ? 'bg-red-50 text-red-800 border-red-200' :
                  selectedEstado === 'Conforme' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                  'bg-slate-200 text-slate-800 border-slate-300'
                }`}>
                  <span>Estado: {selectedEstado}</span>
                  <button onClick={() => setSelectedEstado('todos')} className="hover:text-red-600 font-bold ml-0.5">×</button>
                </span>
              )}
              {selectedRubro !== 'todos' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                  <span>Rubro: {selectedRubro}</span>
                  <button onClick={() => setSelectedRubro('todos')} className="hover:text-red-600 font-bold ml-0.5">×</button>
                </span>
              )}
              {selectedCuenta !== 'todos' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-200 text-slate-800 border border-slate-300">
                  <span>Cuenta: {selectedCuenta}</span>
                  <button onClick={() => setSelectedCuenta('todos')} className="hover:text-red-600 font-bold ml-0.5">×</button>
                </span>
              )}
              {selectedMes !== '8' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-200 text-slate-800 border border-slate-300">
                  <span>Mes: {selectedMes === 'todos' ? 'Todo el año' : selectedMes === '7' ? 'Julio' : selectedMes}</span>
                  <button onClick={() => setSelectedMes('8')} className="hover:text-red-600 font-bold ml-0.5">×</button>
                </span>
              )}
              {searchTerm.trim() && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  <span>Buscar: "{searchTerm}"</span>
                  <button onClick={() => setSearchTerm('')} className="hover:text-red-600 font-bold ml-0.5">×</button>
                </span>
              )}
            </div>

            <button
              onClick={() => {
                setSelectedEstado('todos');
                setSelectedRubro('todos');
                setSelectedCuenta('todos');
                setSelectedMes('8');
                setSearchTerm('');
              }}
              className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
            >
              Restablecer filtros
            </button>
          </div>
        )}
      </div>

      {/* Tabla Principal de Vales para Validación */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-neutral-900">
              Comprobantes Sujetos a Verificación ({salidasFiltradas.length.toLocaleString('de-DE')} registros)
            </h3>
            <span className="text-xs text-neutral-500">
              · Suma filtrada: <strong className="font-mono text-blue-900">{formatCurrency(salidasFiltradas.reduce((a, b) => a + b.montoTotal, 0))}</strong>
            </span>
          </div>
          <span className="text-[11px] text-neutral-500 hidden sm:inline">
            Haz clic en <strong>✓ Conforme</strong> o <strong>⚠ Observar</strong> en cada fila
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100/90 text-slate-700 border-b border-slate-200 font-bold uppercase text-[10px] tracking-wider sticky top-0 whitespace-nowrap">
              <tr>
                <th className="py-2.5 px-3 text-center">Estado Validación</th>
                <th className="py-2.5 px-3">Vale / Fecha</th>
                <th className="py-2.5 px-3">Cuenta Auxiliar</th>
                <th className="py-2.5 px-3">Rubro</th>
                <th className="py-2.5 px-4 min-w-[220px]">Descripción del Ítem o Servicio</th>
                <th className="py-2.5 px-3 text-right">Cant.</th>
                <th className="py-2.5 px-3 text-right">Monto USD</th>
                <th className="py-2.5 px-3">Solicitante / Motivo Almacén</th>
                <th className="py-2.5 px-3 text-center min-w-[140px]">Acción del Encargado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {salidasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-neutral-400">
                    <CheckCircle2 className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                    <p className="font-bold text-sm text-neutral-700">No hay vales pendientes con los filtros seleccionados</p>
                    <p className="text-xs text-neutral-500 mt-1">Modifica los filtros de mes, rubro o búsqueda para ver más registros.</p>
                  </td>
                </tr>
              ) : (
                salidasFiltradas.slice(0, 50).map((s) => {
                  const estado = s.estadoValidacion || 'Pendiente';
                  const isObservado = estado === 'Observado';
                  const isConforme = estado === 'Conforme';

                  return (
                    <React.Fragment key={s.id}>
                      <tr className={`transition-colors ${
                        isObservado 
                          ? 'bg-red-50/50 hover:bg-red-50/80 border-l-4 border-l-red-500' 
                          : isConforme 
                          ? 'bg-emerald-50/20 hover:bg-emerald-50/40 border-l-4 border-l-emerald-500' 
                          : 'hover:bg-neutral-50/80'
                      }`}>
                        {/* Estado Badge */}
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          {isObservado ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-300">
                              <AlertTriangle className="w-3 h-3 text-red-600" />
                              <span>Observado</span>
                            </span>
                          ) : isConforme ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>Conforme</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>Pendiente</span>
                            </span>
                          )}
                        </td>

                        {/* Vale / Fecha */}
                        <td className="py-2.5 px-3 whitespace-nowrap font-mono text-neutral-900">
                          <span className="font-bold text-blue-900 block">{s.codigoSalida}</span>
                          <span className="text-[10px] text-neutral-500">{s.fecha}</span>
                        </td>

                        {/* Cuenta Auxiliar */}
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className="font-mono font-bold text-xs text-neutral-800 block">{s.cuentaAuxiliarCodigo}</span>
                          <span className="text-[10px] text-neutral-500 truncate block max-w-[220px]" title={s.proyecto}>
                            {s.proyecto}
                          </span>
                        </td>

                        {/* Rubro */}
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-100 text-neutral-700 border border-neutral-200 inline-block">
                            {s.tipo || s.categoria}
                          </span>
                        </td>

                        {/* Descripción */}
                        <td className="py-2.5 px-4 font-medium text-neutral-900 min-w-[260px]">
                          <span className="block leading-snug">{s.itemDescripcion}</span>
                          {s.subcategoria && (
                            <span className="text-[10px] text-neutral-400 block">{s.subcategoria}</span>
                          )}
                        </td>

                        {/* Cantidad */}
                        <td className="py-2.5 px-3 text-right whitespace-nowrap font-mono tabular-nums text-neutral-700">
                          {s.cantidad?.toLocaleString('de-DE')} <span className="text-[10px] text-neutral-400">{s.unidadMedida === 'USE' ? 'SERV' : s.unidadMedida}</span>
                        </td>

                        {/* Monto USD */}
                        <td className="py-2.5 px-3 text-right whitespace-nowrap font-mono font-bold tabular-nums text-neutral-900">
                          {formatCurrency(s.montoTotal)}
                        </td>

                        {/* Solicitante y Motivo Almacén */}
                        <td className="py-2.5 px-3 min-w-[200px] max-w-[340px]">
                          <span className="text-neutral-800 font-bold block truncate" title={s.solicitante}>
                            {s.solicitante || 'Almacén Central'}
                          </span>
                          <span className="text-[10px] text-neutral-500 block truncate leading-tight" title={s.motivo}>
                            {s.motivo || 'Despacho regular'}
                          </span>
                        </td>

                        {/* Botones de Acción */}
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          {currentUser.permisos?.canValidarImputaciones ? (
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => handleMarcarConforme(s)}
                                className={`p-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                                  isConforme
                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                                    : 'bg-white hover:bg-emerald-50 text-emerald-700 border-emerald-300 hover:border-emerald-500'
                                }`}
                                title="Marcar como CONFORME (recibido y consumido en obra)"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleAbrirObservacion(s)}
                                className={`px-2 py-1.5 rounded-lg border text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                  isObservado
                                    ? 'bg-red-600 text-white border-red-600 shadow-2xs'
                                    : 'bg-white hover:bg-red-50 text-red-700 border-red-300 hover:border-red-500'
                                }`}
                                title="Reportar mala imputación, material no recibido o discrepancia"
                              >
                                <AlertTriangle className="w-3 h-3" />
                                <span>{isObservado ? 'Editar Objeción' : 'Observar'}</span>
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-mono italic px-2 py-1 bg-slate-100/70 rounded-md border border-slate-200/80">
                              Solo Lectura
                            </span>
                          )}
                        </td>
                      </tr>

                      {/* Fila expandida con el detalle de la observación (si está observado) */}
                      {isObservado && s.observacionGerente && (
                        <tr className="bg-red-50/70 border-b border-red-200">
                          <td colSpan={9} className="py-2.5 px-4 text-xs">
                            <div className="flex items-start gap-2 bg-white/90 p-2.5 rounded-xl border border-red-300 shadow-2xs">
                              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                              <div className="space-y-0.5 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-bold text-red-900 text-xs">
                                    Discrepancia Notificada por: {s.validadoPor || 'Gerente de Proyecto'}
                                  </span>
                                  <span className="text-[10px] text-red-700 font-mono">
                                    {s.fechaValidacion || 'Reciente'}
                                  </span>
                                </div>
                                <p className="text-neutral-700 leading-snug">
                                  {s.observacionGerente}
                                </p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {salidasFiltradas.length > 50 && (
          <div className="p-3 text-center text-xs text-neutral-500 bg-neutral-50 border-t border-neutral-200">
            Mostrando los primeros 50 registros de {salidasFiltradas.length.toLocaleString('de-DE')}. Utiliza los filtros o el buscador para acotar.
          </div>
        )}
      </div>

      {/* Modal Interactivo de Observación / Reporte de Mala Imputación */}
      {modalOpen && salidaParaObservar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-scale-up">
            <div className="bg-gradient-to-r from-red-600 to-amber-600 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-200" />
                <h3 className="font-bold text-base">Reportar Discrepancia en Vale</h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* Resumen del Vale */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-sm text-blue-900">{salidaParaObservar.codigoSalida}</span>
                  <span className="font-mono font-bold text-sm text-slate-900">{formatCurrency(salidaParaObservar.montoTotal)}</span>
                </div>
                <div className="font-bold text-slate-800">{salidaParaObservar.itemDescripcion}</div>
                <div className="text-slate-500 flex items-center justify-between text-[11px]">
                  <span>Cuenta Imputada: <strong>{salidaParaObservar.cuentaAuxiliarCodigo} ({salidaParaObservar.proyecto})</strong></span>
                  <span>{salidaParaObservar.fecha}</span>
                </div>
                {salidaParaObservar.motivo && (
                  <div className="text-[11px] text-amber-800 bg-amber-50 p-1.5 rounded border border-amber-200 mt-1">
                    <strong>Motivo en Almacén:</strong> {salidaParaObservar.motivo}
                  </div>
                )}
              </div>

              {/* Selector de Tipo de Discrepancia */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                  Tipo de Discrepancia Observada:
                </label>
                <select
                  value={tipoDiscrepancia}
                  onChange={(e) => setTipoDiscrepancia(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800 text-xs focus:ring-2 focus:ring-red-500"
                >
                  <option value="Material pertenece a otro proyecto">Material pertenece a otro proyecto (Mala imputación)</option>
                  <option value="Material no recibido en el frente">Material no recibido / No ingresó a obra</option>
                  <option value="Cantidad distorsionada">Cantidad o cubicación distorsionada</option>
                  <option value="Servicio no ejecutado por contratista">Servicio no ejecutado / Facturación ajena</option>
                  <option value="Otro motivo de auditoría">Otro motivo de auditoría</option>
                </select>
              </div>

              {/* Proyecto Correcto Sugerido */}
              {tipoDiscrepancia.includes('otro proyecto') && (
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                    ¿A qué proyecto o frente pertenece realmente? (Sugerencia para Costos):
                  </label>
                  <select
                    value={proyectoCorrectoSugerido}
                    onChange={(e) => setProyectoCorrectoSugerido(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800 text-xs focus:ring-2 focus:ring-red-500"
                  >
                    <option value="TTE-C-0671 · Segunda Línea PMH">TTE-C-0671 · Segunda Línea PMH</option>
                    <option value="TTE-C-0656 · Rehabilitación Bandas PMH">TTE-C-0656 · Rehabilitación Bandas PMH</option>
                    <option value="TTE-C-0706 · Recuperación Línea 1 Pellas">TTE-C-0706 · Recuperación Línea 1 Pellas</option>
                    <option value="TTE-C-0676 · 2da Línea Pellas">TTE-C-0676 · 2da Línea Pellas</option>
                    <option value="TTE-C-0668 · Briquetas FMO">TTE-C-0668 · Briquetas FMO</option>
                    <option value="TTE-C-0669 · Grúa Dravo">TTE-C-0669 · Grúa Dravo</option>
                    <option value="TTE-C-0708 · CVG Bauxilum">TTE-C-0708 · CVG Bauxilum</option>
                    <option value="Taller de Fabricación / Soporte Interno">Taller de Fabricación / Soporte Interno</option>
                  </select>
                </div>
              )}

              {/* Comentario Detallado */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                  Explicación Técnica del Encargado:
                </label>
                <textarea
                  rows={3}
                  value={comentarioGerente}
                  onChange={(e) => setComentarioGerente(e.target.value)}
                  placeholder="Escribe el detalle técnico de por qué este ítem no corresponde a tu proyecto..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800 text-xs focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Aviso */}
              <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-[11px] flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  Esta observación se reflejará en la bandeja de auditoría de la <strong>Ing. Alejandra Tesara (Control de Costos)</strong> para proceder a la reclasificación contable oficial.
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleGuardarObservacion}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Registrar Discrepancia</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
