import React, { useState, useMemo, useEffect } from 'react';
import { 
  MOCK_HERRAMIENTAS, 
  MOCK_PRESTAMOS_HERRAMIENTAS 
} from '../../data/mockHerramientasData';
import { Herramienta, PrestamoHerramienta, CategoriaHerramienta, EstadoHerramienta } from '../../types/suite';
import { UsuarioSistema } from '../../types/usuarios';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { 
  Wrench, 
  Search, 
  Filter, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Building2, 
  Download, 
  ShieldAlert, 
  Sparkles, 
  Layers, 
  Calendar, 
  UserCheck, 
  Archive,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';

interface HerramientasModuleViewProps {
  currentUser: UsuarioSistema;
  onVolver?: () => void;
  onGoToCostosInternos?: () => void;
}

export const HerramientasModuleView: React.FC<HerramientasModuleViewProps> = ({
  currentUser,
  onVolver,
  onGoToCostosInternos
}) => {
  const [herramientas, setHerramientas] = useState<Herramienta[]>(MOCK_HERRAMIENTAS);
  const [prestamos, setPrestamos] = useState<PrestamoHerramienta[]>(MOCK_PRESTAMOS_HERRAMIENTAS);
  const [supabaseSyncActive, setSupabaseSyncActive] = useState<boolean>(false);

  // Sincronización en tiempo real desde Supabase Cloud
  useEffect(() => {
    if (isSupabaseConfigured() && supabase) {
      setSupabaseSyncActive(true);
      supabase
        .from('herramientas_vales')
        .select('*')
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (!error && data && data.length > 0) {
            const valesMapeados: PrestamoHerramienta[] = data.map((v: any) => ({
              id: v.numero,
              herramientaId: v.lineas?.[0]?.codigo || 'HERR-SUPABASE',
              codigoHerramienta: v.lineas?.[0]?.codigo || v.numero,
              nombreHerramienta: v.lineas?.[0]?.descripcion || v.observaciones || 'Vale TIMACA Trazabilidad',
              trabajadorNombre: v.responsable_nombre || 'Personal TIMACA',
              cedula: v.responsable_cedula || 'V-00.000.000',
              cargo: v.responsable_cargo || 'Personal Técnico',
              frenteDestino: v.destino || 'Planta Matriz',
              fechaPrestamo: v.fecha ? v.fecha.split('T')[0] : '2026-10-01',
              fechaDevolucionEstimada: v.fecha_devolucion || '2026-10-31',
              estado: v.estatus === 'CERRADO' ? 'Devuelto' : 'Activo',
              entregadoPor: `Almacén ${v.origen || 'TALLER'} (Supabase Cloud)`,
              condicionEntrega: v.observaciones || 'Inspeccionada conforme.'
            }));

            setPrestamos(prev => {
              const idsExistentes = new Set(prev.map(p => p.id));
              const nuevos = valesMapeados.filter(v => !idsExistentes.has(v.id));
              return [...nuevos, ...prev];
            });
          }
        });
    }
  }, []);
  
  const [activeTab, setActiveTab] = useState<'trazabilidad' | 'catalogo' | 'prestamos' | 'calibracion' | 'cajas'>('trazabilidad');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState<string>('TODAS');
  const [selectedEstado, setSelectedEstado] = useState<string>('TODOS');
  
  // Modal states
  const [isNewPrestamoModalOpen, setIsNewPrestamoModalOpen] = useState(false);
  const [selectedHerramientaParaDetalle, setSelectedHerramientaParaDetalle] = useState<Herramienta | null>(null);
  const [prestamoForm, setPrestamoForm] = useState({
    herramientaId: '',
    trabajadorNombre: '',
    cedula: '',
    cargo: '',
    frenteDestino: 'Frente Palúa PMH - Muelle',
    fechaDevolucionEstimada: '2026-10-31'
  });
  const [notificacion, setNotificacion] = useState<string | null>(null);

  const canEdit = currentUser.permisos.ambitoEdicion === 'todo' || 
                  currentUser.permisos.ambitoEdicion === 'internos' || 
                  currentUser.permisos.canEditHerramientas === true;

  // KPIs
  const stats = useMemo(() => {
    const total = herramientas.length;
    const valorTotalUsd = herramientas.reduce((acc, h) => acc + h.valorReposicionUsd, 0);
    const enUso = herramientas.filter(h => h.estado === 'En Uso / Asignada').length;
    const disponibles = herramientas.filter(h => h.estado === 'Disponible').length;
    const enCalibracion = herramientas.filter(h => h.estado === 'En Calibración' || (h.requiereCalibracion && (h.diasParaCalibracion ?? 99) <= 0)).length;
    const proximasCalibrar = herramientas.filter(h => h.requiereCalibracion && (h.diasParaCalibracion ?? 99) > 0 && (h.diasParaCalibracion ?? 99) <= 30).length;
    const cajasCuadrilla = herramientas.filter(h => h.categoria === 'Cajas de Herramientas').length;

    return {
      total,
      valorTotalUsd,
      enUso,
      disponibles,
      enCalibracion,
      proximasCalibrar,
      cajasCuadrilla,
      porcentajeEnUso: total > 0 ? Math.round((enUso / total) * 100) : 0
    };
  }, [herramientas]);

  // Filtered tools
  const filteredHerramientas = useMemo(() => {
    return herramientas.filter(h => {
      const matchSearch = h.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          h.codigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (h.responsableActual && h.responsableActual.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          h.ubicacion.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = selectedCategoria === 'TODAS' || h.categoria === selectedCategoria;
      const matchEst = selectedEstado === 'TODOS' || h.estado === selectedEstado;
      return matchSearch && matchCat && matchEst;
    });
  }, [herramientas, searchQuery, selectedCategoria, selectedEstado]);

  // Herramientas con calibración
  const herramientasCalibracion = useMemo(() => {
    return herramientas.filter(h => h.requiereCalibracion);
  }, [herramientas]);

  // Cajas de Herramientas
  const cajasHerramientas = useMemo(() => {
    return herramientas.filter(h => h.categoria === 'Cajas de Herramientas');
  }, [herramientas]);

  const handleRegistrarPrestamo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prestamoForm.herramientaId || !prestamoForm.trabajadorNombre) {
      alert('Por favor complete todos los datos del formulario.');
      return;
    }

    const herramientaEncontrada = herramientas.find(h => h.id === prestamoForm.herramientaId);
    if (!herramientaEncontrada) return;

    const nuevoPrestamo: PrestamoHerramienta = {
      id: `pst-${Date.now()}`,
      herramientaId: herramientaEncontrada.id,
      codigoHerramienta: herramientaEncontrada.codigo,
      nombreHerramienta: herramientaEncontrada.nombre,
      trabajadorNombre: prestamoForm.trabajadorNombre,
      cedula: prestamoForm.cedula || 'V-00.000.000',
      cargo: prestamoForm.cargo || 'Técnico de Taller',
      frenteDestino: prestamoForm.frenteDestino,
      fechaPrestamo: new Date().toISOString().split('T')[0],
      fechaDevolucionEstimada: prestamoForm.fechaDevolucionEstimada,
      estado: 'Activo',
      entregadoPor: `Almacén Central (${currentUser.nombre})`,
      condicionEntrega: 'Inspeccionada conforme para operaciones de campo.'
    };

    // Update tool state
    setHerramientas(prev => prev.map(h => {
      if (h.id === herramientaEncontrada.id) {
        return {
          ...h,
          estado: 'En Uso / Asignada',
          responsableActual: prestamoForm.trabajadorNombre,
          fechaAsignacion: new Date().toISOString().split('T')[0],
          fechaDevolucionEstimada: prestamoForm.fechaDevolucionEstimada,
          ubicacion: prestamoForm.frenteDestino
        };
      }
      return h;
    }));

    setPrestamos(prev => [nuevoPrestamo, ...prev]);

    // Persistir en Supabase Cloud
    if (isSupabaseConfigured() && supabase) {
      supabase.from('herramientas_vales').insert({
        numero: nuevoPrestamo.id,
        tipo: 'PRH',
        origen: 'TALLER',
        destino: nuevoPrestamo.frenteDestino,
        responsable_nombre: nuevoPrestamo.trabajadorNombre,
        responsable_cedula: nuevoPrestamo.cedula,
        responsable_cargo: nuevoPrestamo.cargo,
        supervisor: currentUser.nombre,
        fecha_requerida: nuevoPrestamo.fechaPrestamo,
        fecha_devolucion: nuevoPrestamo.fechaDevolucionEstimada,
        estatus: 'VIGENTE',
        observaciones: `Entregado por: ${nuevoPrestamo.entregadoPor}`,
        lineas: [
          { codigo: nuevoPrestamo.codigoHerramienta, descripcion: nuevoPrestamo.nombreHerramienta, cantidad: 1 }
        ]
      }).then(({ error }) => {
        if (error) console.warn('Supabase insert warning:', error.message);
      });
    }

    setIsNewPrestamoModalOpen(false);
    setNotificacion(`¡Custodia asignada y sincronizada en Supabase con éxito para ${prestamoForm.trabajadorNombre}!`);
    setTimeout(() => setNotificacion(null), 4000);
  };

  const handleDevolverHerramienta = (prestamoId: string) => {
    const prestamo = prestamos.find(p => p.id === prestamoId);
    if (!prestamo) return;

    setPrestamos(prev => prev.map(p => {
      if (p.id === prestamoId) {
        return {
          ...p,
          estado: 'Devuelto',
          fechaDevolucionReal: new Date().toISOString().split('T')[0],
          recibidoPor: currentUser.nombre,
          condicionDevolucion: 'Devuelto a pañol en condiciones operativas.'
        };
      }
      return p;
    }));

    setHerramientas(prev => prev.map(h => {
      if (h.id === prestamo.herramientaId) {
        return {
          ...h,
          estado: 'Disponible',
          responsableActual: undefined,
          ubicacion: 'Pañol Central de Herramientas'
        };
      }
      return h;
    }));

    setNotificacion(`Herramienta ${prestamo.codigoHerramienta} devuelta al pañol central.`);
    setTimeout(() => setNotificacion(null), 3500);
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

      {/* Top Banner Corporativo TIMACA */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-6 sm:p-7 shadow-lg border border-slate-700/60 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-500/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono text-[11px] font-bold tracking-wider px-2.5 py-0.5 rounded-md bg-sky-500/20 text-sky-300 border border-sky-400/30">
                [HRM] MÃDULO OPERACIONAL
              </span>
              <span className="text-slate-400 text-xs">·</span>
              <span className="text-slate-300 text-xs font-medium">Custodia, Préstamos y Metrología SENCAMER</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <Wrench className="w-7 h-7 text-sky-400" />
              <span>Sistema de Control y Custodia de Herramientas</span>
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
              Gestión de cajas de cuadrilla (<strong className="text-sky-200">TT-A-C-207</strong>), trazabilidad de préstamos en naves y frentes de obra, y control de calibración de torquímetros e instrumentos.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
            {canEdit ? (
              <button
                onClick={() => setIsNewPrestamoModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer hover:shadow-sky-500/20"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Asignar / Prestar Herramienta</span>
              </button>
            ) : (
              <div className="px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-slate-400 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>Modo Observador (Solo Lectura)</span>
              </div>
            )}

            {onGoToCostosInternos && (
              <button
                onClick={onGoToCostosInternos}
                className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-600 transition-colors cursor-pointer"
                title="Ver imputación contable en Proyectos Internos"
              >
                <Building2 className="w-3.5 h-3.5 text-sky-400" />
                <span>Ver Cuenta TT-A-C-207</span>
              </button>
            )}
          </div>
        </div>

        {/* Mini Breadcrumb Status */}
        <div className="mt-5 pt-4 border-t border-slate-700/60 flex flex-wrap items-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Pañol Central Operativo</span>
          </div>
          <span>·</span>
          <div>
            Responsable: <strong className="text-slate-200">{currentUser.nombre}</strong> ({currentUser.rol})
          </div>
          <span>·</span>
          <div>
            Cajas de Cuadrilla: <strong className="text-sky-300">40 unidades fabricadas</strong>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        
        {/* KPI 1: Total Inventario */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider">Total Equipos & Cajas</span>
            <span className="p-1.5 bg-slate-100 rounded-lg text-slate-700">
              <Archive className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {stats.total} <span className="text-xs font-bold text-slate-500">Unidades</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-600 flex items-center justify-between">
            <span>Valor Reposición:</span>
            <strong className="font-mono text-slate-900">${stats.valorTotalUsd.toLocaleString()} USD</strong>
          </div>
        </div>

        {/* KPI 2: En Uso / Custodia */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between text-blue-600 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider">En Uso / En Cuadrillas</span>
            <span className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
              <UserCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-700 tracking-tight">
            {stats.enUso} <span className="text-xs font-bold text-slate-500">({stats.porcentajeEnUso}%)</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-600 flex items-center justify-between">
            <span>Disponibles en Pañol:</span>
            <strong className="font-mono text-emerald-700">{stats.disponibles} unid.</strong>
          </div>
        </div>

        {/* KPI 3: Calibración SENCAMER */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between text-amber-600 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider">Control Calibración</span>
            <span className="p-1.5 bg-amber-50 rounded-lg text-amber-600">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 tracking-tight">
            {stats.enCalibracion} <span className="text-xs font-bold text-slate-500">Vencidas / En Lab</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-600 flex items-center justify-between">
            <span>Próximas a vencer (&lt;30d):</span>
            <strong className="font-mono text-amber-700">{stats.proximasCalibrar} unid.</strong>
          </div>
        </div>

        {/* KPI 4: Cajas de Cuadrilla TT-A-C-207 */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between text-indigo-600 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider">Cajas Cuadrilla TIMACA</span>
            <span className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-indigo-900 tracking-tight">
            {stats.cajasCuadrilla} / 40 <span className="text-xs font-bold text-slate-500">Asignadas</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-600 flex items-center justify-between">
            <span>Inversión Fabricación:</span>
            <strong className="font-mono text-indigo-700">$12.441 USD</strong>
          </div>
        </div>
      </div>

      {/* Tabs Principales del Módulo */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        
        {/* Tab Header Buttons */}
        <div className="border-b border-slate-200 px-4 sm:px-6 pt-3 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-2 sm:pb-0">
            <button
              onClick={() => setActiveTab('trazabilidad')}
              className={`px-4 py-2.5 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap shadow-xs ${
                activeTab === 'trazabilidad'
                  ? 'bg-sky-600 text-white shadow-sky-900/30 ring-1 ring-sky-300'
                  : 'text-slate-700 bg-sky-50/80 hover:text-sky-900 hover:bg-sky-100 border border-sky-200/60'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300/30" />
              <span>Sistema de Trazabilidad TIMACA</span>
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-sky-900/40 text-sky-200 uppercase tracking-wider">
                Almacenes & Vales
              </span>
            </button>

            <button
              onClick={() => setActiveTab('catalogo')}
              className={`px-3.5 py-2.5 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'catalogo'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Inventario General ({herramientas.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('prestamos')}
              className={`px-3.5 py-2.5 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'prestamos'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Custodia & Préstamos Activos ({prestamos.filter(p => p.estado === 'Activo').length})</span>
            </button>

            <button
              onClick={() => setActiveTab('calibracion')}
              className={`px-3.5 py-2.5 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'calibracion'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Control Metrología SENCAMER ({herramientasCalibracion.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('cajas')}
              className={`px-3.5 py-2.5 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'cajas'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Cajas de Cuadrilla TT-A-C-207</span>
            </button>
          </div>

          <div className="text-xs text-slate-500 font-mono hidden md:block pb-2 sm:pb-0">
            Filtro Activo: <span className="font-bold text-slate-800">{filteredHerramientas.length} registros</span>
          </div>
        </div>

        {/* Tab 0: Sistema de Trazabilidad TIMACA Completo */}
        {activeTab === 'trazabilidad' && (
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-5 rounded-2xl border border-indigo-800/40 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300 font-bold shrink-0">
                  <Wrench className="w-5 h-5 text-sky-400" />
                </div>
                <div>
                  <h3 className="font-black text-sm sm:text-base text-white flex items-center gap-2 flex-wrap">
                    <span>Sistema de Trazabilidad de Herramientas, Cilindros y EPP</span>
                    <span className="text-[10.5px] bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-400/30 font-semibold">
                      Control Operativo Central & Satlites
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Gestin de Almacenes (Central, Pellas, ECO, Fabricacin, SMB, PMH, Boca Grande, Briquetas)  Vales PRH/ASI, Transferencias con cronmetro de 12h, Daos, Extravos y Auditora.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                <a
                  href="/trazabilidad.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer hover:shadow-sky-500/20"
                >
                  <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Abrir en Pantalla Completa</span>
                </a>
              </div>
            </div>

            {/* Iframe Interactivo Embebido */}
            <div className="w-full bg-slate-50 rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm">
              <iframe
                src="/trazabilidad.html"
                title="Sistema de Trazabilidad TIMACA"
                className="w-full h-[920px] border-0"
              />
            </div>
          </div>
        )}

        {/* Tab 1: Catálogo General */}
        {activeTab === 'catalogo' && (
          <div className="p-4 sm:p-6 space-y-4">
            
            {/* Barra de Filtros */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por código, nombre, responsable o ubicación..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                />
              </div>

              <div className="flex gap-2">
                <select
                  value={selectedCategoria}
                  onChange={(e) => setSelectedCategoria(e.target.value)}
                  className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:bg-white focus:outline-none cursor-pointer"
                >
                  <option value="TODAS">Todas las Categorías</option>
                  <option value="Cajas de Herramientas">Cajas de Herramientas</option>
                  <option value="Torquímetros & Metrología">Torquímetros & Metrología</option>
                  <option value="Equipos de Soldadura">Equipos de Soldadura</option>
                  <option value="Herramientas Eléctricas">Herramientas Eléctricas</option>
                  <option value="Equipos de Izaje & Tecles">Equipos de Izaje & Tecles</option>
                  <option value="Prensas & Gatos Hidráulicos">Prensas & Gatos Hidráulicos</option>
                  <option value="Equipos de Oxicorte">Equipos de Oxicorte</option>
                </select>

                <select
                  value={selectedEstado}
                  onChange={(e) => setSelectedEstado(e.target.value)}
                  className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:bg-white focus:outline-none cursor-pointer"
                >
                  <option value="TODOS">Todos los Estados</option>
                  <option value="Disponible">Disponible</option>
                  <option value="En Uso / Asignada">En Uso / Asignada</option>
                  <option value="En Calibración">En Calibración</option>
                  <option value="En Reparación">En Reparación</option>
                </select>
              </div>
            </div>

            {/* Tabla de Herramientas */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs text-slate-700 border-collapse">
                <thead className="bg-slate-100/80 text-slate-600 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3.5">Código / Serie</th>
                    <th className="py-3 px-3.5">Descripción & Modelo</th>
                    <th className="py-3 px-3.5">Categoría</th>
                    <th className="py-3 px-3.5">Ubicación / Frente</th>
                    <th className="py-3 px-3.5">Estado</th>
                    <th className="py-3 px-3.5">Custodio Actual</th>
                    <th className="py-3 px-3.5 text-right">Valor Reposición</th>
                    <th className="py-3 px-3.5 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredHerramientas.map((h) => {
                    const isVencida = h.requiereCalibracion && (h.diasParaCalibracion ?? 99) <= 0;
                    const isProxima = h.requiereCalibracion && (h.diasParaCalibracion ?? 99) > 0 && (h.diasParaCalibracion ?? 99) <= 30;

                    return (
                      <tr key={h.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3.5 whitespace-nowrap">
                          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {h.codigo}
                          </span>
                          {h.cuentaCostoAsociada && (
                            <span className="block text-[10px] font-mono text-slate-600 mt-0.5">
                              Cta: {h.cuentaCostoAsociada}
                            </span>
                          )}
                        </td>

                        <td className="py-2.5 px-3.5 font-medium text-slate-900 max-w-xs">
                          <div>{h.nombre}</div>
                          <div className="text-[10px] text-slate-600">{h.marcaModelo}</div>
                        </td>

                        <td className="py-2.5 px-3.5 whitespace-nowrap">
                          <span className="text-slate-600 bg-slate-100/70 px-2 py-0.5 rounded text-[11px]">
                            {h.categoria}
                          </span>
                        </td>

                        <td className="py-2.5 px-3.5 whitespace-nowrap">
                          <span className="text-slate-700 font-medium">
                            {h.ubicacion}
                          </span>
                        </td>

                        <td className="py-2.5 px-3.5 whitespace-nowrap">
                          {h.estado === 'Disponible' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                              Disponible
                            </span>
                          )}
                          {h.estado === 'En Uso / Asignada' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                              En Uso
                            </span>
                          )}
                          {h.estado === 'En Calibración' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                              En Calibración
                            </span>
                          )}
                          {h.estado === 'En Reparación' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
                              En Reparación
                            </span>
                          )}
                        </td>

                        <td className="py-2.5 px-3.5">
                          {h.responsableActual ? (
                            <div>
                              <span className="font-semibold text-slate-800">{h.responsableActual}</span>
                              {h.cuadrilla && <span className="block text-[10px] text-slate-600">{h.cuadrilla}</span>}
                            </div>
                          ) : (
                            <span className="text-slate-600 italic">En custodia de almacén</span>
                          )}
                        </td>

                        <td className="py-2.5 px-3.5 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                          ${h.valorReposicionUsd.toLocaleString()} USD
                        </td>

                        <td className="py-2.5 px-3.5 text-center whitespace-nowrap">
                          <button
                            onClick={() => setSelectedHerramientaParaDetalle(h)}
                            className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                            title="Ver ficha técnica completa"
                          >
                            <Info className="w-4 h-4" />
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

        {/* Tab 2: Préstamos & Custodia Activa */}
        {activeTab === 'prestamos' && (
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Registro Histórico y Activo de Custodia</h3>
                <p className="text-xs text-slate-500">Trazabilidad de herramientas entregadas a mecánicos y frentes de obra.</p>
              </div>

              {canEdit && (
                <button
                  onClick={() => setIsNewPrestamoModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nuevo Préstamo</span>
                </button>
              )}
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs text-slate-700 border-collapse">
                <thead className="bg-slate-100/80 text-slate-600 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3.5">ID / Herramienta</th>
                    <th className="py-3 px-3.5">Trabajador Responsable</th>
                    <th className="py-3 px-3.5">Frente de Destino</th>
                    <th className="py-3 px-3.5">Fecha Entrega</th>
                    <th className="py-3 px-3.5">Fecha Prevista</th>
                    <th className="py-3 px-3.5">Estado</th>
                    <th className="py-3 px-3.5">Entregado Por</th>
                    <th className="py-3 px-3.5 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {prestamos.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3.5">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                          {p.codigoHerramienta}
                        </span>
                        <div className="text-[11px] text-slate-700 font-medium mt-0.5 max-w-xs truncate">
                          {p.nombreHerramienta}
                        </div>
                      </td>

                      <td className="py-2.5 px-3.5 whitespace-nowrap">
                        <div className="font-bold text-slate-900">{p.trabajadorNombre}</div>
                        <div className="text-[10px] text-slate-600">{p.cedula} · {p.cargo}</div>
                      </td>

                      <td className="py-2.5 px-3.5 font-medium text-slate-800 whitespace-nowrap">
                        {p.frenteDestino}
                      </td>

                      <td className="py-2.5 px-3.5 font-mono text-slate-700 whitespace-nowrap">
                        {p.fechaPrestamo}
                      </td>

                      <td className="py-2.5 px-3.5 font-mono text-slate-700 whitespace-nowrap">
                        {p.fechaDevolucionEstimada}
                      </td>

                      <td className="py-2.5 px-3.5 whitespace-nowrap">
                        {p.estado === 'Activo' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                            En Custodia
                          </span>
                        )}
                        {p.estado === 'Devuelto' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Devuelto
                          </span>
                        )}
                        {p.estado === 'Observado' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            Observado
                          </span>
                        )}
                      </td>

                      <td className="py-2.5 px-3.5 text-slate-600 text-[11px]">
                        {p.entregadoPor}
                      </td>

                      <td className="py-2.5 px-3.5 text-center">
                        {p.estado === 'Activo' && canEdit && (
                          <button
                            onClick={() => handleDevolverHerramienta(p.id)}
                            className="px-2.5 py-1 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors cursor-pointer"
                          >
                            Recibir
                          </button>
                        )}
                        {p.estado === 'Devuelto' && (
                          <span className="text-[10px] text-slate-600 font-mono">OK</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Control de Calibración SENCAMER */}
        {activeTab === 'calibracion' && (
          <div className="p-4 sm:p-6 space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 space-y-1">
                <strong className="font-bold">Normativa de Aseguramiento Metrológico Industrial:</strong>
                <p>
                  Los torquímetros, manómetros de oxicorte y equipos de izaje deben contar con calibración periódica certificada por SENCAMER o laboratorio acreditado ISO 17025 para validar torques en pernos de cargadores de barcos y chutes de mineral.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs text-slate-700 border-collapse">
                <thead className="bg-slate-100/80 text-slate-600 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3.5">Código / Equipo</th>
                    <th className="py-3 px-3.5">Ãltima Calibración</th>
                    <th className="py-3 px-3.5">Próximo Vencimiento</th>
                    <th className="py-3 px-3.5 text-center">Días Restantes</th>
                    <th className="py-3 px-3.5">Semáforo</th>
                    <th className="py-3 px-3.5">Observaciones de Auditoría</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {herramientasCalibracion.map((h) => {
                    const dias = h.diasParaCalibracion ?? 0;
                    const esVencido = dias <= 0;
                    const esProximo = dias > 0 && dias <= 30;

                    return (
                      <tr key={h.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3.5">
                          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                            {h.codigo}
                          </span>
                          <div className="font-semibold text-slate-900 mt-1">{h.nombre}</div>
                          <div className="text-[10px] text-slate-600 font-mono">Serial: {h.serialFabricante}</div>
                        </td>

                        <td className="py-3 px-3.5 font-mono text-slate-700">
                          {h.fechaUltimaCalibracion || 'Pendiente'}
                        </td>

                        <td className="py-3 px-3.5 font-mono text-slate-700">
                          {h.fechaProximaCalibracion || 'Sin fecha'}
                        </td>

                        <td className="py-3 px-3.5 text-center font-mono font-bold">
                          {esVencido ? (
                            <span className="text-rose-600">Vencido hace {Math.abs(dias)}d</span>
                          ) : (
                            <span className={esProximo ? 'text-amber-600' : 'text-emerald-600'}>{dias} días</span>
                          )}
                        </td>

                        <td className="py-3 px-3.5">
                          {esVencido && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1 w-max">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse"></span>
                              VENCIDO - NO USAR
                            </span>
                          )}
                          {esProximo && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1 w-max">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                              POR VENCER (&lt;30d)
                            </span>
                          )}
                          {!esVencido && !esProximo && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1 w-max">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                              VIGENTE
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3.5 text-slate-600 text-[11px] max-w-sm">
                          {h.observaciones}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Cajas de Cuadrilla TT-A-C-207 */}
        {activeTab === 'cajas' && (
          <div className="p-4 sm:p-6 space-y-4">
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-200 text-indigo-900">
                  CUENTA DE COSTOS INTERNOS: TT-A-C-207
                </span>
                <h3 className="text-sm font-bold text-indigo-950 mt-1">
                  Fabricación & Asignación de 40 Cajas de Herramientas para Cuadrillas
                </h3>
                <p className="text-xs text-indigo-800 mt-1 leading-relaxed">
                  Proyecto ejecutado e imputado en Julio 2026 por un total de <strong>$12.441 USD</strong>. Cada caja cuenta con placa de identificación soldada, candado maestro con combinación única y juego de herramientas estandarizado de 85 a 142 piezas.
                </p>
              </div>

              {onGoToCostosInternos && (
                <button
                  onClick={onGoToCostosInternos}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
                >
                  Ver en Costos Internos
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cajasHerramientas.map((caja) => (
                <div key={caja.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-slate-900 bg-white px-2 py-1 rounded border border-slate-300 text-xs">
                      {caja.codigo}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      caja.estado === 'En Uso / Asignada' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {caja.estado}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">{caja.nombre}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{caja.marcaModelo}</p>
                  </div>

                  <div className="text-[11px] text-slate-600 space-y-1 bg-white p-2.5 rounded-lg border border-slate-200/80">
                    <div><strong>Ubicación:</strong> {caja.ubicacion}</div>
                    {caja.responsableActual && <div><strong>Responsable:</strong> {caja.responsableActual}</div>}
                    {caja.cuadrilla && <div><strong>Cuadrilla:</strong> {caja.cuadrilla}</div>}
                    <div><strong>Valor Inventario:</strong> ${caja.valorReposicionUsd} USD</div>
                  </div>

                  <p className="text-[10px] text-slate-500 leading-tight">
                    {caja.observaciones}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal: Asignar Nuevo Préstamo */}
      {isNewPrestamoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                <Wrench className="w-5 h-5 text-sky-600" />
                <span>Asignar Custodia / Préstamo de Herramienta</span>
              </div>
              <button
                onClick={() => setIsNewPrestamoModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegistrarPrestamo} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Seleccionar Herramienta / Caja:</label>
                <select
                  value={prestamoForm.herramientaId}
                  onChange={(e) => setPrestamoForm({ ...prestamoForm, herramientaId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none"
                  required
                >
                  <option value="">-- Seleccione una herramienta disponible --</option>
                  {herramientas.map(h => (
                    <option key={h.id} value={h.id}>
                      [{h.codigo}] {h.nombre} ({h.estado})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nombre del Trabajador:</label>
                  <input
                    type="text"
                    placeholder="Ej. Carlos Silva"
                    value={prestamoForm.trabajadorNombre}
                    onChange={(e) => setPrestamoForm({ ...prestamoForm, trabajadorNombre: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cédula de Identidad:</label>
                  <input
                    type="text"
                    placeholder="V-16.892.401"
                    value={prestamoForm.cedula}
                    onChange={(e) => setPrestamoForm({ ...prestamoForm, cedula: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cargo / Especialidad:</label>
                  <input
                    type="text"
                    placeholder="Mecánico Líder / Soldador"
                    value={prestamoForm.cargo}
                    onChange={(e) => setPrestamoForm({ ...prestamoForm, cargo: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Frente de Destino:</label>
                  <select
                    value={prestamoForm.frenteDestino}
                    onChange={(e) => setPrestamoForm({ ...prestamoForm, frenteDestino: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none"
                  >
                    <option value="Almacén Central">Almacén Central</option>
                    <option value="Almacén Pellas">Almacén Pellas</option>
                    <option value="Almacén Boca Grande">Almacén Boca Grande</option>
                    <option value="Almacén PMH">Almacén PMH</option>
                    <option value="Almacén Briquetas">Almacén Briquetas</option>
                    <option value="Almacén ECO">Almacén ECO</option>
                    <option value="Almacén SMB">Almacén SMB</option>
                    <option value="Almacén Fabricación">Almacén Fabricación</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Fecha Estimada de Devolución:</label>
                <input
                  type="date"
                  value={prestamoForm.fechaDevolucionEstimada}
                  onChange={(e) => setPrestamoForm({ ...prestamoForm, fechaDevolucionEstimada: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none"
                  required
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsNewPrestamoModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-xs"
                >
                  Guardar y Emitir Vale
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Ficha Detallada */}
      {selectedHerramientaParaDetalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                  {selectedHerramientaParaDetalle.codigo}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">{selectedHerramientaParaDetalle.nombre}</h3>
              </div>
              <button
                onClick={() => setSelectedHerramientaParaDetalle(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="text-xs space-y-2.5 text-slate-700">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div><strong>Modelo:</strong> {selectedHerramientaParaDetalle.marcaModelo}</div>
                <div><strong>Categoría:</strong> {selectedHerramientaParaDetalle.categoria}</div>
                <div><strong>Ubicación:</strong> {selectedHerramientaParaDetalle.ubicacion}</div>
                <div><strong>Estado:</strong> {selectedHerramientaParaDetalle.estado}</div>
                <div><strong>Valor Reposición:</strong> ${selectedHerramientaParaDetalle.valorReposicionUsd} USD</div>
                <div><strong>Cta Costo:</strong> {selectedHerramientaParaDetalle.cuentaCostoAsociada}</div>
              </div>

              {selectedHerramientaParaDetalle.requiereCalibracion && (
                <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-900">
                  <strong>Control Metrológico:</strong>
                  <div className="mt-1">Ãltima: {selectedHerramientaParaDetalle.fechaUltimaCalibracion}</div>
                  <div>Próxima: {selectedHerramientaParaDetalle.fechaProximaCalibracion}</div>
                  <div>Días: {selectedHerramientaParaDetalle.diasParaCalibracion} días</div>
                </div>
              )}

              <div>
                <strong>Notas / Historial:</strong>
                <p className="mt-1 text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  {selectedHerramientaParaDetalle.observaciones || 'Sin observaciones registradas.'}
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedHerramientaParaDetalle(null)}
                className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors"
              >
                Cerrar Ficha
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
