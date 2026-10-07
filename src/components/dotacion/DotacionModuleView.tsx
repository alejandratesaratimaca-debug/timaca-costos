import React, { useState, useMemo } from 'react';
import { 
  MOCK_CATALOGO_EPP, 
  MOCK_ENTREGAS_DOTACION 
} from '../../data/mockDotacionData';
import { CatalogoEPPItem, EntregaDotacionRegistro } from '../../types/suite';
import { UsuarioSistema } from '../../types/usuarios';
import { 
  ShieldCheck, 
  Search, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Download, 
  FileCheck, 
  FileText, 
  Users, 
  Package, 
  Printer, 
  Sparkles,
  Info,
  Calendar,
  Check,
  Building2
} from 'lucide-react';

interface DotacionModuleViewProps {
  currentUser: UsuarioSistema;
  onVolver?: () => void;
}

export const DotacionModuleView: React.FC<DotacionModuleViewProps> = ({
  currentUser,
  onVolver
}) => {
  const [catalogo, setCatalogo] = useState<CatalogoEPPItem[]>(MOCK_CATALOGO_EPP);
  const [entregas, setEntregas] = useState<EntregaDotacionRegistro[]>(MOCK_ENTREGAS_DOTACION);
  
  const [activeTab, setActiveTab] = useState<'entregas' | 'catalogo' | 'semaforo' | 'acta'>('entregas');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepto, setSelectedDepto] = useState<string>('TODOS');
  const [selectedEstado, setSelectedEstado] = useState<string>('TODOS');

  // Modal states
  const [isNuevaEntregaModalOpen, setIsNuevaEntregaModalOpen] = useState(false);
  const [actaParaVer, setActaParaVer] = useState<EntregaDotacionRegistro | null>(null);
  const [notificacion, setNotificacion] = useState<string | null>(null);

  const [entregaForm, setEntregaForm] = useState({
    trabajadorNombre: '',
    cedula: '',
    cargo: '',
    departamento: 'Mantenimiento Planta',
    frenteAsignado: 'Taller Central - Nave 1',
    botasTalla: '42',
    bragasTalla: 'L',
    incluirBotas: true,
    incluirBragas: true,
    incluirLentes: true,
    incluirGuantes: true,
    observaciones: 'Dotación regular semestral.'
  });

  const canEdit = currentUser.permisos.ambitoEdicion === 'todo' || 
                  currentUser.permisos.ambitoEdicion === 'internos' || 
                  currentUser.permisos.canEditDotacion === true;

  // KPIs
  const stats = useMemo(() => {
    const totalEntregas = entregas.length;
    const vigentes = entregas.filter(e => e.estado === 'Vigente').length;
    const porRenovar = entregas.filter(e => e.estado === 'Por Renovar').length;
    const vencidas = entregas.filter(e => e.estado === 'Vencida').length;
    const costoTotalMes = entregas.reduce((acc, e) => acc + e.costoTotalUsd, 0);
    const cumplimientoLOPCYMAT = totalEntregas > 0 ? Math.round(((vigentes + porRenovar) / totalEntregas) * 100) : 100;
    
    const stockBajo = catalogo.filter(c => c.stockActual <= c.stockMinimo).length;

    return {
      totalEntregas,
      vigentes,
      porRenovar,
      vencidas,
      costoTotalMes,
      cumplimientoLOPCYMAT,
      stockBajo
    };
  }, [entregas, catalogo]);

  // Filtered entregas
  const filteredEntregas = useMemo(() => {
    return entregas.filter(e => {
      const matchSearch = e.trabajadorNombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.cedula.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.cargo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.numeroActa.toLowerCase().includes(searchQuery.toLowerCase());
      const matchDepto = selectedDepto === 'TODOS' || e.departamento === selectedDepto;
      const matchEst = selectedEstado === 'TODOS' || e.estado === selectedEstado;
      return matchSearch && matchDepto && matchEst;
    });
  }, [entregas, searchQuery, selectedDepto, selectedEstado]);

  const handleRegistrarEntrega = (e: React.FormEvent) => {
    e.preventDefault();
    if (!entregaForm.trabajadorNombre || !entregaForm.cedula) {
      alert('Por favor ingrese el nombre y cédula del trabajador.');
      return;
    }

    const items = [];
    let costoTotal = 0;

    if (entregaForm.incluirBotas) {
      items.push({
        itemCodigo: 'EPP-BOT-01',
        itemNombre: 'Botas de Seguridad Dieléctricas Cuero Graso',
        talla: entregaForm.botasTalla,
        cantidad: 1,
        costoTotalUsd: 45
      });
      costoTotal += 45;
    }

    if (entregaForm.incluirBragas) {
      items.push({
        itemCodigo: 'EPP-BRG-01',
        itemNombre: 'Braga Industrial Azul Marino TIMACA (Gabardina)',
        talla: entregaForm.bragasTalla,
        cantidad: 2,
        costoTotalUsd: 64
      });
      costoTotal += 64;
    }

    if (entregaForm.incluirLentes) {
      items.push({
        itemCodigo: 'EPP-LEN-01',
        itemNombre: 'Lentes de Seguridad Nemesis Claros/Oscuros',
        talla: 'Universal',
        cantidad: 2,
        costoTotalUsd: 13
      });
      costoTotal += 13;
    }

    if (entregaForm.incluirGuantes) {
      items.push({
        itemCodigo: 'EPP-GNT-02',
        itemNombre: 'Guantes de Nitrilo con Palma Anticorte Nivel 5',
        talla: 'L',
        cantidad: 2,
        costoTotalUsd: 14.4
      });
      costoTotal += 14.4;
    }

    const hoy = new Date().toISOString().split('T')[0];
    const fechaRenovacion = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const nuevaEntrega: EntregaDotacionRegistro = {
      id: `act-${Date.now()}`,
      numeroActa: `ACT-EPP-2026-0${100 + entregas.length}`,
      trabajadorId: `trb-${Date.now()}`,
      trabajadorNombre: entregaForm.trabajadorNombre,
      cedula: entregaForm.cedula,
      cargo: entregaForm.cargo || 'Técnico Mecánico',
      departamento: entregaForm.departamento,
      frenteAsignado: entregaForm.frenteAsignado,
      fechaEntrega: hoy,
      fechaProximaRenovacion: fechaRenovacion,
      diasParaRenovacion: 180,
      estado: 'Vigente',
      itemsEntregados: items,
      costoTotalUsd: costoTotal,
      entregadoPor: `Seguridad y Salud Laboral (${currentUser.nombre})`,
      firmaConforme: true,
      observaciones: entregaForm.observaciones
    };

    setEntregas(prev => [nuevaEntrega, ...prev]);
    setIsNuevaEntregaModalOpen(false);
    setNotificacion(`¡Acta ${nuevaEntrega.numeroActa} emitida y registrada para ${entregaForm.trabajadorNombre}!`);
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
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-lg border border-blue-900/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono text-[11px] font-bold tracking-wider px-2.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-400/30">
                [EPP] MÓDULO OPERACIONAL
              </span>
              <span className="text-slate-400 text-xs">·</span>
              <span className="text-slate-300 text-xs font-medium">Cumplimiento LOPCYMAT Art. 237 & COVENIN</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <ShieldCheck className="w-7 h-7 text-blue-400" />
              <span>Sistema de Dotación de EPP & Uniformes</span>
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
              Control digital de actas de entrega, registro de calzado y bragas industriales, stock de almacén general y ciclo de reposición semestral obligatorio para taller y frentes de obra.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
            {canEdit ? (
              <button
                onClick={() => setIsNuevaEntregaModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer hover:shadow-blue-500/20"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Registrar Entrega de Dotación</span>
              </button>
            ) : (
              <div className="px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-slate-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Modo Observador (Solo Lectura)</span>
              </div>
            )}
          </div>
        </div>

        {/* Mini Breadcrumb Status */}
        <div className="mt-5 pt-4 border-t border-slate-700/60 flex flex-wrap items-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Índice de Cobertura LOPCYMAT: <strong className="text-emerald-300">{stats.cumplimientoLOPCYMAT}%</strong></span>
          </div>
          <span>·</span>
          <div>
            Entregas Registradas: <strong className="text-slate-200">{stats.totalEntregas} trabajadores</strong>
          </div>
          <span>·</span>
          <div>
            Inversión EPP Activa: <strong className="text-sky-300 font-mono">${stats.costoTotalMes.toFixed(2)} USD</strong>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        
        {/* KPI 1: Cobertura LOPCYMAT */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider">Cumplimiento LOPCYMAT</span>
            <span className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight">
            {stats.cumplimientoLOPCYMAT}%
          </div>
          <div className="mt-2 text-[11px] text-slate-600 flex items-center justify-between">
            <span>Dotaciones Vigentes:</span>
            <strong className="font-mono text-emerald-800">{stats.vigentes} de {stats.totalEntregas}</strong>
          </div>
        </div>

        {/* KPI 2: Por Renovar */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between text-amber-600 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider">Por Renovar (&lt;15d)</span>
            <span className="p-1.5 bg-amber-50 rounded-lg text-amber-600">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 tracking-tight">
            {stats.porRenovar} <span className="text-xs font-bold text-slate-500">Trabajadores</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-600 flex items-center justify-between">
            <span>Alerta de Reposición:</span>
            <strong className="font-mono text-amber-700">Botas y Calzado</strong>
          </div>
        </div>

        {/* KPI 3: Vencidas */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between text-rose-600 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider">Vencidas / No Conforme</span>
            <span className="p-1.5 bg-rose-50 rounded-lg text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-600 tracking-tight">
            {stats.vencidas} <span className="text-xs font-bold text-slate-500">Alerta Roja</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-600 flex items-center justify-between">
            <span>Requiere Entrega Inmediata:</span>
            <strong className="font-mono text-rose-700">100% Crítico</strong>
          </div>
        </div>

        {/* KPI 4: Stock Almacén */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between text-blue-600 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider">Ítems en Catálogo</span>
            <span className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
              <Package className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {catalogo.length} <span className="text-xs font-bold text-slate-500">Tipos de EPP</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-600 flex items-center justify-between">
            <span>Alertas Stock Mínimo:</span>
            <strong className="font-mono text-emerald-700">0 quiebres</strong>
          </div>
        </div>
      </div>

      {/* Tabs Principales */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        
        {/* Tab Buttons */}
        <div className="border-b border-slate-200 px-4 sm:px-6 pt-3 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-2 sm:pb-0">
            <button
              onClick={() => setActiveTab('entregas')}
              className={`px-3.5 py-2.5 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'entregas'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Padrón de Entregas & Actas ({entregas.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('catalogo')}
              className={`px-3.5 py-2.5 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'catalogo'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Catálogo EPP & Stock ({catalogo.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('semaforo')}
              className={`px-3.5 py-2.5 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'semaforo'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Semáforo de Vencimiento LOPCYMAT</span>
            </button>
          </div>

          <div className="text-xs text-slate-500 font-mono hidden md:block pb-2 sm:pb-0">
            Filtrados: <span className="font-bold text-slate-800">{filteredEntregas.length} registros</span>
          </div>
        </div>

        {/* Tab 1: Padrón de Entregas */}
        {activeTab === 'entregas' && (
          <div className="p-4 sm:p-6 space-y-4">
            
            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por trabajador, cédula, cargo o número de acta..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              <div className="flex gap-2">
                <select
                  value={selectedDepto}
                  onChange={(e) => setSelectedDepto(e.target.value)}
                  className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:bg-white focus:outline-none cursor-pointer"
                >
                  <option value="TODOS">Todos los Departamentos</option>
                  <option value="Mantenimiento Planta">Mantenimiento Planta</option>
                  <option value="Fabricación Metálica">Fabricación Metálica</option>
                  <option value="Operaciones Grúas">Operaciones Grúas</option>
                  <option value="Supervisión HSE & Campo">Supervisión HSE & Campo</option>
                </select>

                <select
                  value={selectedEstado}
                  onChange={(e) => setSelectedEstado(e.target.value)}
                  className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:bg-white focus:outline-none cursor-pointer"
                >
                  <option value="TODOS">Todos los Estados</option>
                  <option value="Vigente">Vigente</option>
                  <option value="Por Renovar">Por Renovar</option>
                  <option value="Vencida">Vencida</option>
                </select>
              </div>
            </div>

            {/* Tabla de Entregas */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs text-slate-700 border-collapse">
                <thead className="bg-slate-100/80 text-slate-600 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3.5">N° Acta / Fecha</th>
                    <th className="py-3 px-3.5">Trabajador & Cédula</th>
                    <th className="py-3 px-3.5">Cargo & Área</th>
                    <th className="py-3 px-3.5">Frente Operativo</th>
                    <th className="py-3 px-3.5">Ítems Entregados</th>
                    <th className="py-3 px-3.5 text-center">Estado / Días</th>
                    <th className="py-3 px-3.5 text-right">Costo Total</th>
                    <th className="py-3 px-3.5 text-center">Acta Digital</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEntregas.map((entrega) => {
                    const esVencida = entrega.estado === 'Vencida';
                    const esPorRenovar = entrega.estado === 'Por Renovar';

                    return (
                      <tr key={entrega.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3.5 whitespace-nowrap">
                          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {entrega.numeroActa}
                          </span>
                          <span className="block text-[10px] text-slate-500 font-mono mt-0.5">
                            {entrega.fechaEntrega}
                          </span>
                        </td>

                        <td className="py-2.5 px-3.5">
                          <div className="font-bold text-slate-900">{entrega.trabajadorNombre}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{entrega.cedula}</div>
                        </td>

                        <td className="py-2.5 px-3.5">
                          <div className="text-slate-800 font-medium">{entrega.cargo}</div>
                          <div className="text-[10px] text-slate-500">{entrega.departamento}</div>
                        </td>

                        <td className="py-2.5 px-3.5 whitespace-nowrap text-slate-700 font-medium">
                          {entrega.frenteAsignado}
                        </td>

                        <td className="py-2.5 px-3.5">
                          <div className="text-[11px] text-slate-700 space-y-0.5">
                            {entrega.itemsEntregados.map((it, idx) => (
                              <span key={idx} className="inline-block bg-slate-100 px-1.5 py-0.5 rounded mr-1 text-[10px] text-slate-800">
                                {it.itemNombre.split(' ')[0]} (T:{it.talla})
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="py-2.5 px-3.5 text-center whitespace-nowrap">
                          {esVencida && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                              Vencida ({entrega.diasParaRenovacion}d)
                            </span>
                          )}
                          {esPorRenovar && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              Renovar en {entrega.diasParaRenovacion}d
                            </span>
                          )}
                          {!esVencida && !esPorRenovar && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              Vigente ({entrega.diasParaRenovacion}d)
                            </span>
                          )}
                        </td>

                        <td className="py-2.5 px-3.5 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                          ${entrega.costoTotalUsd.toFixed(2)} USD
                        </td>

                        <td className="py-2.5 px-3.5 text-center whitespace-nowrap">
                          <button
                            onClick={() => setActaParaVer(entrega)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                            title="Ver Acta Oficial de Entrega firmada"
                          >
                            <FileText className="w-3.5 h-3.5 text-blue-600" />
                            <span>Ver Acta</span>
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

        {/* Tab 2: Catálogo de EPP */}
        {activeTab === 'catalogo' && (
          <div className="p-4 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {catalogo.map((item) => (
                <div key={item.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-white border border-slate-300 text-slate-900">
                      {item.codigo}
                    </span>
                    <span className="text-[10px] font-mono text-slate-600 bg-slate-200 px-2 py-0.5 rounded">
                      {item.categoria}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">{item.nombre}</h4>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{item.especificacion}</p>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-[11px] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Norma Certificada:</span>
                      <strong className="text-slate-800">{item.marcaNorma}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Stock Actual:</span>
                      <strong className="font-mono text-emerald-700">{item.stockActual} unidades</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Costo Unitario:</span>
                      <strong className="font-mono text-slate-900">${item.costoUnitarioUsd.toFixed(2)} USD</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Ciclo Reposición:</span>
                      <strong className="text-blue-700">{item.vidaUtilDias} días</strong>
                    </div>
                  </div>

                  {item.tallasDisponibles && (
                    <div className="text-[10px] text-slate-600">
                      <strong>Tallas disponibles:</strong> {item.tallasDisponibles.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Semáforo de Renovación */}
        {activeTab === 'semaforo' && (
          <div className="p-4 sm:p-6 space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 space-y-1">
              <strong className="font-bold">Ciclo Obligatorio de Reposición LOPCYMAT (Art. 237):</strong>
              <p>
                Todo el personal de campo y planta debe recibir reposición de calzado de seguridad con puntera dieléctrica cada 6 meses (180 días) y bragas industriales cada 4 meses (120 días). Los equipos vencidos deben ser reemplazados de inmediato para evitar paralizaciones por fiscalización de INPSASEL.
              </p>
            </div>

            <div className="space-y-3">
              {entregas.map((e) => {
                const dias = e.diasParaRenovacion;
                const isCritico = dias <= 0;
                const isAlerta = dias > 0 && dias <= 15;

                return (
                  <div key={e.id} className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    isCritico 
                      ? 'bg-rose-50/70 border-rose-200' 
                      : isAlerta 
                      ? 'bg-amber-50/70 border-amber-200' 
                      : 'bg-white border-slate-200'
                  }`}>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{e.trabajadorNombre}</span>
                        <span className="text-[11px] text-slate-500 font-mono">({e.cedula})</span>
                        <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">{e.cargo}</span>
                      </div>
                      <div className="text-[11px] text-slate-600">
                        Frente: <strong>{e.frenteAsignado}</strong> · Entrega: {e.fechaEntrega} · Próxima: {e.fechaProximaRenovacion}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-mono font-bold text-xs">
                          {isCritico ? (
                            <span className="text-rose-700">Vencido hace {Math.abs(dias)} días</span>
                          ) : (
                            <span className={isAlerta ? 'text-amber-700' : 'text-emerald-700'}>{dias} días para reposición</span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 font-medium">Ciclo Semestral</span>
                      </div>

                      {canEdit && (
                        <button
                          onClick={() => {
                            setEntregaForm({
                              ...entregaForm,
                              trabajadorNombre: e.trabajadorNombre,
                              cedula: e.cedula,
                              cargo: e.cargo,
                              departamento: e.departamento,
                              frenteAsignado: e.frenteAsignado
                            });
                            setIsNuevaEntregaModalOpen(true);
                          }}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                        >
                          Renovar Ahora
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modal: Registrar Entrega */}
      {isNuevaEntregaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <span>Registrar Entrega de Dotación (Acta Digital)</span>
              </div>
              <button
                onClick={() => setIsNuevaEntregaModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegistrarEntrega} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nombre Trabajador:</label>
                  <input
                    type="text"
                    placeholder="Ej. Pedro Rivas"
                    value={entregaForm.trabajadorNombre}
                    onChange={(e) => setEntregaForm({ ...entregaForm, trabajadorNombre: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cédula:</label>
                  <input
                    type="text"
                    placeholder="V-17.119.803"
                    value={entregaForm.cedula}
                    onChange={(e) => setEntregaForm({ ...entregaForm, cedula: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cargo:</label>
                  <input
                    type="text"
                    placeholder="Mecánico / Soldador"
                    value={entregaForm.cargo}
                    onChange={(e) => setEntregaForm({ ...entregaForm, cargo: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Departamento:</label>
                  <select
                    value={entregaForm.departamento}
                    onChange={(e) => setEntregaForm({ ...entregaForm, departamento: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none"
                  >
                    <option value="Mantenimiento Planta">Mantenimiento Planta</option>
                    <option value="Fabricación Metálica">Fabricación Metálica</option>
                    <option value="Operaciones Grúas">Operaciones Grúas</option>
                    <option value="Supervisión HSE & Campo">Supervisión HSE & Campo</option>
                  </select>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block mb-1">Ítems de Dotación a Entregar:</span>
                
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={entregaForm.incluirBotas}
                      onChange={(e) => setEntregaForm({ ...entregaForm, incluirBotas: e.target.checked })}
                    />
                    <span>Botas Dieléctricas ($45)</span>
                  </label>
                  <select
                    value={entregaForm.botasTalla}
                    onChange={(e) => setEntregaForm({ ...entregaForm, botasTalla: e.target.value })}
                    className="p-1 bg-white border border-slate-300 rounded text-[11px]"
                    disabled={!entregaForm.incluirBotas}
                  >
                    <option value="39">Talla 39</option>
                    <option value="40">Talla 40</option>
                    <option value="41">Talla 41</option>
                    <option value="42">Talla 42</option>
                    <option value="43">Talla 43</option>
                    <option value="44">Talla 44</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={entregaForm.incluirBragas}
                      onChange={(e) => setEntregaForm({ ...entregaForm, incluirBragas: e.target.checked })}
                    />
                    <span>Bragas TIMACA (2x $64)</span>
                  </label>
                  <select
                    value={entregaForm.bragasTalla}
                    onChange={(e) => setEntregaForm({ ...entregaForm, bragasTalla: e.target.value })}
                    className="p-1 bg-white border border-slate-300 rounded text-[11px]"
                    disabled={!entregaForm.incluirBragas}
                  >
                    <option value="S">Talla S</option>
                    <option value="M">Talla M</option>
                    <option value="L">Talla L</option>
                    <option value="XL">Talla XL</option>
                    <option value="XXL">Talla XXL</option>
                  </select>
                </div>

                <div className="flex items-center gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={entregaForm.incluirLentes}
                      onChange={(e) => setEntregaForm({ ...entregaForm, incluirLentes: e.target.checked })}
                    />
                    <span>Lentes Nemesis ($13)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={entregaForm.incluirGuantes}
                      onChange={(e) => setEntregaForm({ ...entregaForm, incluirGuantes: e.target.checked })}
                    />
                    <span>Guantes Anticorte ($14.4)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Observaciones:</label>
                <input
                  type="text"
                  value={entregaForm.observaciones}
                  onChange={(e) => setEntregaForm({ ...entregaForm, observaciones: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsNuevaEntregaModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-xs"
                >
                  Generar Acta y Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Vista Oficial de Acta de Entrega con Formato TIMACA */}
      {actaParaVer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">Acta Oficial de Entrega de Dotación Individual</h3>
              </div>
              <button
                onClick={() => setActaParaVer(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Documento Estilo Membrete TIMACA */}
            <div className="border border-slate-300 rounded-xl p-5 bg-neutral-50/50 space-y-4 text-xs font-sans">
              <div className="flex items-center justify-between border-b pb-3 border-slate-200">
                <div>
                  <h4 className="font-black text-sm text-[#0b2545]">TALLER INDUSTRIAL METALÚRGICO ANTONIO, C.A.</h4>
                  <p className="text-[10px] text-slate-500 font-mono">RIF J-09500315-9 · DEPARTAMENTO DE SEGURIDAD Y SALUD LABORAL</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-slate-900 bg-slate-200 px-2 py-0.5 rounded">
                    {actaParaVer.numeroActa}
                  </span>
                  <div className="text-[10px] text-slate-500 mt-1">Fecha: {actaParaVer.fechaEntrega}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-white p-3 rounded-lg border border-slate-200">
                <div><strong>Trabajador:</strong> {actaParaVer.trabajadorNombre}</div>
                <div><strong>Cédula:</strong> {actaParaVer.cedula}</div>
                <div><strong>Cargo:</strong> {actaParaVer.cargo}</div>
                <div><strong>Departamento:</strong> {actaParaVer.departamento}</div>
                <div><strong>Frente Asignado:</strong> {actaParaVer.frenteAsignado}</div>
                <div><strong>Próxima Renovación:</strong> {actaParaVer.fechaProximaRenovacion}</div>
              </div>

              <div>
                <span className="font-bold text-slate-800 block mb-1.5">Detalle de Equipos de Protección Entregados:</span>
                <table className="w-full text-left border border-slate-200 bg-white rounded-lg">
                  <thead className="bg-slate-100 text-[10px] font-bold text-slate-600">
                    <tr>
                      <th className="p-2">Ítem / Descripción</th>
                      <th className="p-2 text-center">Talla</th>
                      <th className="p-2 text-center">Cantidad</th>
                      <th className="p-2 text-right">Valor USD</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {actaParaVer.itemsEntregados.map((it, idx) => (
                      <tr key={idx}>
                        <td className="p-2 font-medium">{it.itemNombre}</td>
                        <td className="p-2 text-center font-mono">{it.talla}</td>
                        <td className="p-2 text-center font-mono">{it.cantidad}</td>
                        <td className="p-2 text-right font-mono">${it.costoTotalUsd.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="text-[10px] text-slate-500 italic leading-tight">
                "Hago constar que he recibido en perfecto estado de funcionamiento los Equipos de Protección Personal arriba señalados, comprometiéndome a usarlos obligatoriamente durante toda la jornada laboral conforme a la LOPCYMAT y normativas internas de TIMACA."
              </p>

              <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-200 text-center text-[11px]">
                <div className="border-t border-dashed border-slate-400 pt-1">
                  <strong>Entregado Por (HSE / Almacén)</strong>
                  <div className="text-slate-500 text-[10px]">{actaParaVer.entregadoPor}</div>
                </div>
                <div className="border-t border-dashed border-slate-400 pt-1">
                  <strong>Firma del Trabajador</strong>
                  <div className="text-slate-500 text-[10px]">{actaParaVer.trabajadorNombre} ({actaParaVer.cedula})</div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-slate-500 font-mono">
                Costo Total Asignado: <strong>${actaParaVer.costoTotalUsd.toFixed(2)} USD</strong>
              </span>

              <button
                onClick={() => setActaParaVer(null)}
                className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors"
              >
                Cerrar Documento
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
