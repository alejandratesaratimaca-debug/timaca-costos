import React, { useState, useMemo } from 'react';
import { 
  MOCK_VALES_SIP_PMH, 
  CUENTAS_CAMPO_PMH 
} from '../../data/mockSIPPmhData';
import { ValeSIPPmh, FrenteTrabajoPMH, ItemValePMH } from '../../types/suite';
import { UsuarioSistema } from '../../types/usuarios';
import { formatUnitPriceRaw } from '../../utils/dateHelpers';
import { 
  Building2, 
  Search, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Layers, 
  Truck, 
  Package, 
  Send, 
  Check, 
  MapPin, 
  Printer, 
  HardHat,
  Sparkles
} from 'lucide-react';

interface SIPPmhModuleViewProps {
  currentUser: UsuarioSistema;
  onVolver?: () => void;
  onGoToProyecto?: (cuentaCodigo: string) => void;
}

export const SIPPmhModuleView: React.FC<SIPPmhModuleViewProps> = ({
  currentUser,
  onVolver,
  onGoToProyecto
}) => {
  const [vales, setVales] = useState<ValeSIPPmh[]>(MOCK_VALES_SIP_PMH);
  const [activeTab, setActiveTab] = useState<'vales' | 'nuevo-vale' | 'cuentas' | 'materiales'>('vales');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFrente, setSelectedFrente] = useState<string>('TODOS');
  const [selectedCuenta, setSelectedCuenta] = useState<string>('TODAS');

  // Estado de sincronización Offline / Online
  const [isSincronizando, setIsSincronizando] = useState(false);
  const [notificacion, setNotificacion] = useState<string | null>(null);
  const [valeParaImprimir, setValeParaImprimir] = useState<ValeSIPPmh | null>(null);

  // Formulario de emisión rápida de vale en campo
  const [nuevoValeForm, setNuevoValeForm] = useState({
    frenteTrabajo: 'Muelle de Carga PMH (Ship Loader)' as FrenteTrabajoPMH,
    cuentaAuxiliarCodigo: 'TTE-C-0706',
    equipoIntervenido: 'Cinta Transportadora CV-02 / Chute Central',
    solicitadoPor: currentUser.nombre,
    cargoSolicitante: currentUser.cargo,
    supervisorAprobador: 'Ing. Carlos Mendoza',
    observaciones: 'Despacho urgente para reparación de tolva en frente de trabajo.',
    material1: { codigo: 'MAT-EST-041', desc: 'Plancha Antidesgaste Hardox 400 1/2"', cant: 1, unidad: 'PZA', precio: 1240 },
    material2: { codigo: 'CON-SLD-019', desc: 'Electrodo Revestido E7018 1/8" (Caja 20 Kg)', cant: 2, unidad: 'CJA', precio: 65 }
  });

  const canCreateVales = currentUser.permisos.ambitoEdicion === 'todo' || 
                         currentUser.permisos.canCreateSalidas || 
                         currentUser.permisos.canEditSIPPmh;

  // Calculo de pendientes offline
  const valesPendientesOffline = useMemo(() => {
    return vales.filter(v => v.estado === 'Pendiente Sincronización');
  }, [vales]);

  // KPIs
  const stats = useMemo(() => {
    const totalVales = vales.length;
    const montoTotalDespachadoUsd = vales.reduce((acc, v) => acc + v.montoTotalUsd, 0);
    const sincronizados = vales.filter(v => v.estado === 'Sincronizado Central').length;
    const pendientesOffline = valesPendientesOffline.length;
    const cuentasActivas = new Set(vales.map(v => v.cuentaAuxiliarCodigo)).size;

    return {
      totalVales,
      montoTotalDespachadoUsd,
      sincronizados,
      pendientesOffline,
      cuentasActivas
    };
  }, [vales, valesPendientesOffline]);

  // Filtered vales
  const filteredVales = useMemo(() => {
    return vales.filter(v => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q ||
                          String(v.numeroVale || '').toLowerCase().includes(q) ||
                          String(v.solicitadoPor || '').toLowerCase().includes(q) ||
                          String(v.equipoIntervenido || '').toLowerCase().includes(q) ||
                          String(v.cuentaAuxiliarCodigo || '').toLowerCase().includes(q);
      const matchFrente = selectedFrente === 'TODOS' || v.frenteTrabajo === selectedFrente;
      const matchCta = selectedCuenta === 'TODAS' || v.cuentaAuxiliarCodigo === selectedCuenta;
      return matchSearch && matchFrente && matchCta;
    });
  }, [vales, searchQuery, selectedFrente, selectedCuenta]);

  // Sincronizar cola offline con Almacén Central TIMACA
  const handleSincronizarCentral = () => {
    setIsSincronizando(true);
    setTimeout(() => {
      setVales(prev => prev.map(v => {
        if (v.estado === 'Pendiente Sincronización') {
          return {
            ...v,
            estado: 'Sincronizado Central',
            esOffline: false
          };
        }
        return v;
      }));
      setIsSincronizando(false);
      setNotificacion('¡Sincronización completada! Todos los vales de campo han sido registrados en el Almacén Central TIMACA.');
      setTimeout(() => setNotificacion(null), 4500);
    }, 1200);
  };

  const handleCrearValeCampo = (e: React.FormEvent) => {
    e.preventDefault();

    const cuentaInfo = CUENTAS_CAMPO_PMH.find(c => c.codigo === nuevoValeForm.cuentaAuxiliarCodigo);
    const items: ItemValePMH[] = [
      {
        codigoMaterial: nuevoValeForm.material1.codigo,
        descripcion: nuevoValeForm.material1.desc,
        unidad: nuevoValeForm.material1.unidad,
        cantidad: nuevoValeForm.material1.cant,
        costoUnitarioUsd: nuevoValeForm.material1.precio,
        totalUsd: nuevoValeForm.material1.cant * nuevoValeForm.material1.precio,
        partidaImputacion: 'Materiales Directos'
      }
    ];

    if (nuevoValeForm.material2.cant > 0) {
      items.push({
        codigoMaterial: nuevoValeForm.material2.codigo,
        descripcion: nuevoValeForm.material2.desc,
        unidad: nuevoValeForm.material2.unidad,
        cantidad: nuevoValeForm.material2.cant,
        costoUnitarioUsd: nuevoValeForm.material2.precio,
        totalUsd: nuevoValeForm.material2.cant * nuevoValeForm.material2.precio,
        partidaImputacion: 'Consumibles de Taller'
      });
    }

    const totalMonto = items.reduce((acc, it) => acc + it.totalUsd, 0);
    const ahora = new Date();
    const fechaHoraStr = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}-${String(ahora.getDate()).padStart(2, '0')} ${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;

    const nuevoVale: ValeSIPPmh = {
      id: `sip-${Date.now()}`,
      numeroVale: `VALE-PMH-2026-0${416 + vales.length}`,
      fechaHora: fechaHoraStr,
      frenteTrabajo: nuevoValeForm.frenteTrabajo,
      cuentaAuxiliarCodigo: nuevoValeForm.cuentaAuxiliarCodigo,
      cuentaAuxiliarNombre: cuentaInfo?.nombre || 'Mantenimiento de Campo',
      equipoIntervenido: nuevoValeForm.equipoIntervenido,
      solicitadoPor: nuevoValeForm.solicitadoPor,
      cargoSolicitante: nuevoValeForm.cargoSolicitante,
      supervisorAprobador: nuevoValeForm.supervisorAprobador,
      despachadoPor: `Caseta de Campo PMH (${currentUser.nombre})`,
      estado: 'Despachado en Campo',
      esOffline: false,
      items: items,
      montoTotalUsd: totalMonto,
      observaciones: nuevoValeForm.observaciones
    };

    setVales(prev => [nuevoVale, ...prev]);
    setActiveTab('vales');
    setNotificacion(`¡Vale ${nuevoVale.numeroVale} emitido exitosamente por $${Math.round(totalMonto).toLocaleString()} USD!`);
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

      {/* Top Banner Corporativo TIMACA */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-lg border border-amber-900/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono text-[11px] font-bold tracking-wider px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-400/30">
                [PMH] SIP CAMPO OPERATIVO
              </span>
              <span className="text-slate-400 text-xs">·</span>
              <span className="text-slate-300 text-xs font-medium">Muelle PMH & Planta de Pellas Ferrominera</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <HardHat className="w-7 h-7 text-amber-400" />
              <span>SIP de PMH · Despacho y Vales en Campo</span>
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
              Módulo de campo que resuelve la ausencia de terminales SIP en muelle y tolvas. Emisión digital de vales de salida con sincronización automática a los servidores centrales de TIMACA.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
            {stats.pendientesOffline > 0 && (
              <button
                onClick={handleSincronizarCentral}
                disabled={isSincronizando}
                className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer animate-pulse hover:animate-none"
                title="Subir vales locales a la base de datos central"
              >
                <RefreshCw className={`w-4 h-4 ${isSincronizando ? 'animate-spin' : ''}`} />
                <span>Sincronizar Central ({stats.pendientesOffline} en cola)</span>
              </button>
            )}

            {canCreateVales ? (
              <button
                onClick={() => setActiveTab('nuevo-vale')}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Emitir Vale Digital en Campo</span>
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
            <span>Antena Caseta Muelle: <strong>En Línea / 4G Industrial</strong></span>
          </div>
          <span>·</span>
          <div>
            Frentes Cubiertos: <strong className="text-amber-300">Muelle PMH, TT-201, Pellas L1 & L2</strong>
          </div>
          <span>·</span>
          <div>
            Total Despachado: <strong className="text-white font-mono">${stats.montoTotalDespachadoUsd.toLocaleString()} USD</strong>
          </div>
        </div>
      </div>

      {/* Alerta de Sincronización si hay vales en cola offline */}
      {stats.pendientesOffline > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-center justify-between gap-3 text-xs text-amber-900 bg-amber-50">
          <div className="flex items-center gap-2.5">
            <WifiOff className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <strong>Hay {stats.pendientesOffline} vale(s) emitidos sin conexión en el muelle de carga:</strong>
              <p className="text-amber-800 text-[11px] mt-0.5">
                Los datos están guardados localmente de forma segura. Pulsa "Sincronizar Central" para asentar los costos en el balance oficial de cuentas auxiliares.
              </p>
            </div>
          </div>
          <button
            onClick={handleSincronizarCentral}
            disabled={isSincronizando}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors cursor-pointer shrink-0"
          >
            Sincronizar Ahora
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        
        {/* KPI 1: Vales Emitidos */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider">Vales en Campo</span>
            <span className="p-1.5 bg-slate-100 rounded-lg text-slate-700">
              <FileSpreadsheet className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {stats.totalVales} <span className="text-xs font-bold text-slate-500">Vales</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-600 flex items-center justify-between">
            <span>Sincronizados:</span>
            <strong className="font-mono text-emerald-700">{stats.sincronizados} aprobados</strong>
          </div>
        </div>

        {/* KPI 2: Total Despachado USD */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between text-amber-600 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider">Monto Total Despachado</span>
            <span className="p-1.5 bg-amber-50 rounded-lg text-amber-600">
              <Package className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 tracking-tight">
            ${stats.montoTotalDespachadoUsd.toLocaleString()} <span className="text-xs font-bold text-slate-500">USD</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-600 flex items-center justify-between">
            <span>Promedio por Vale:</span>
            <strong className="font-mono text-slate-900">${Math.round(stats.montoTotalDespachadoUsd / stats.totalVales)} USD</strong>
          </div>
        </div>

        {/* KPI 3: Cuentas Auxiliares */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between text-blue-600 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider">Cuentas FMO Activas</span>
            <span className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
              <Building2 className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-900 tracking-tight">
            {stats.cuentasActivas} <span className="text-xs font-bold text-slate-500">Proyectos</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-600 flex items-center justify-between">
            <span>Principal Imputación:</span>
            <strong className="font-mono text-blue-700">TTE-C-0706</strong>
          </div>
        </div>

        {/* KPI 4: Estado de Red en Frente */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between text-emerald-600 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider">Disponibilidad Sistema</span>
            <span className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
              <Wifi className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight">
            100% <span className="text-xs font-bold text-slate-500">Operativo</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-600 flex items-center justify-between">
            <span>Cola Offline:</span>
            <strong className="font-mono text-slate-900">{stats.pendientesOffline} pendientes</strong>
          </div>
        </div>
      </div>

      {/* Tabs Principales */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        
        {/* Tab Buttons */}
        <div className="border-b border-slate-200 px-4 sm:px-6 pt-3 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-2 sm:pb-0">
            <button
              onClick={() => setActiveTab('vales')}
              className={`px-3.5 py-2.5 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'vales'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Vales de Campo Emitidos ({vales.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('cuentas')}
              className={`px-3.5 py-2.5 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'cuentas'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Cuentas de Frente PMH / Pellas</span>
            </button>

            {canCreateVales && (
              <button
                onClick={() => setActiveTab('nuevo-vale')}
                className={`px-3.5 py-2.5 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'nuevo-vale'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Emisión Rápida de Vale</span>
              </button>
            )}
          </div>

          <div className="text-xs text-slate-500 font-mono hidden md:block pb-2 sm:pb-0">
            Filtrados: <span className="font-bold text-slate-800">{filteredVales.length} registros</span>
          </div>
        </div>

        {/* Tab 1: Tabla de Vales */}
        {activeTab === 'vales' && (
          <div className="p-4 sm:p-6 space-y-4">
            
            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por número de vale, solicitante, equipo o cuenta..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                />
              </div>

              <div className="flex gap-2">
                <select
                  value={selectedFrente}
                  onChange={(e) => setSelectedFrente(e.target.value)}
                  className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:bg-white focus:outline-none cursor-pointer"
                >
                  <option value="TODOS">Todos los Frentes</option>
                  <option value="Muelle de Carga PMH (Ship Loader)">Muelle PMH (Ship Loader)</option>
                  <option value="Torre de Transferencia TT-201">Torre TT-201</option>
                  <option value="Línea de Pellas - Horno L2">Línea de Pellas Horno L2</option>
                  <option value="Sistema de Tolvas & Chutes">Sistema de Tolvas & Chutes</option>
                </select>

                <select
                  value={selectedCuenta}
                  onChange={(e) => setSelectedCuenta(e.target.value)}
                  className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:bg-white focus:outline-none cursor-pointer"
                >
                  <option value="TODAS">Todas las Cuentas</option>
                  <option value="TTE-C-0706">TTE-C-0706 (Cargador PMH)</option>
                  <option value="TTE-C-0656">TTE-C-0656 (Tolvas & Chutes)</option>
                  <option value="TTE-C-0671">TTE-C-0671 (Parada Pellas)</option>
                  <option value="TTE-C-0714">TTE-C-0714 (Cintas CV)</option>
                </select>
              </div>
            </div>

            {/* Tabla de Vales de Campo */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs text-slate-700 border-collapse">
                <thead className="bg-slate-100/80 text-slate-600 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3.5">N° Vale / Fecha</th>
                    <th className="py-3 px-3.5">Frente de Trabajo</th>
                    <th className="py-3 px-3.5">Cuenta Auxiliar</th>
                    <th className="py-3 px-3.5">Equipo Intervenido</th>
                    <th className="py-3 px-3.5">Solicitante</th>
                    <th className="py-3 px-3.5 text-center">Estado Sinc.</th>
                    <th className="py-3 px-3.5 text-right">Total USD</th>
                    <th className="py-3 px-3.5 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredVales.map((v) => {
                    const isPendiente = v.estado === 'Pendiente Sincronización';

                    return (
                      <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3.5 whitespace-nowrap">
                          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {v.numeroVale}
                          </span>
                          <span className="block text-[10px] text-slate-500 font-mono mt-0.5">
                            {v.fechaHora}
                          </span>
                        </td>

                        <td className="py-2.5 px-3.5 font-medium text-slate-900">
                          {v.frenteTrabajo}
                        </td>

                        <td className="py-2.5 px-3.5 whitespace-nowrap">
                          <span className="font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                            {v.cuentaAuxiliarCodigo}
                          </span>
                          <span className="block text-[10px] text-slate-500 truncate max-w-xs">
                            {v.cuentaAuxiliarNombre}
                          </span>
                        </td>

                        <td className="py-2.5 px-3.5 text-slate-800">
                          {v.equipoIntervenido || 'No especificado'}
                        </td>

                        <td className="py-2.5 px-3.5">
                          <div className="font-semibold text-slate-900">{v.solicitadoPor}</div>
                          <div className="text-[10px] text-slate-500">{v.cargoSolicitante}</div>
                        </td>

                        <td className="py-2.5 px-3.5 text-center whitespace-nowrap">
                          {isPendiente ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                              <WifiOff className="w-3 h-3 text-amber-600" />
                              En Cola Local
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Sincronizado
                            </span>
                          )}
                        </td>

                        <td className="py-2.5 px-3.5 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                          ${Math.round(v.montoTotalUsd).toLocaleString()} USD
                        </td>

                        <td className="py-2.5 px-3.5 text-center whitespace-nowrap">
                          <button
                            onClick={() => setValeParaImprimir(v)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                            title="Ver Comprobante Oficial de Vale de Campo"
                          >
                            <FileText className="w-3.5 h-3.5 text-amber-600" />
                            <span>Ver Vale</span>
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

        {/* Tab 2: Emisión Rápida de Vale en Campo */}
        {activeTab === 'nuevo-vale' && (
          <div className="p-4 sm:p-6 space-y-5 max-w-3xl mx-auto">
            <div className="border-b pb-3">
              <h3 className="text-base font-bold text-slate-900">Formulario Rápido de Salida SIP en Campo</h3>
              <p className="text-xs text-slate-500">Diseñado para casetas de obra en muelle y tolvas. Genera comprobante instantáneo.</p>
            </div>

            <form onSubmit={handleCrearValeCampo} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Frente de Trabajo en Obra:</label>
                  <select
                    value={nuevoValeForm.frenteTrabajo}
                    onChange={(e) => setNuevoValeForm({ ...nuevoValeForm, frenteTrabajo: e.target.value as FrenteTrabajoPMH })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none"
                    required
                  >
                    <option value="Muelle de Carga PMH (Ship Loader)">Muelle de Carga PMH (Ship Loader)</option>
                    <option value="Torre de Transferencia TT-201">Torre de Transferencia TT-201</option>
                    <option value="Línea de Pellas - Horno L2">Línea de Pellas - Horno L2</option>
                    <option value="Línea de Pellas - Secador L1">Línea de Pellas - Secador L1</option>
                    <option value="Sistema de Tolvas & Chutes">Sistema de Tolvas & Chutes</option>
                    <option value="Patio de Minerales & Apilador">Patio de Minerales & Apilador</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cuenta Auxiliar / Proyecto Cliente:</label>
                  <select
                    value={nuevoValeForm.cuentaAuxiliarCodigo}
                    onChange={(e) => setNuevoValeForm({ ...nuevoValeForm, cuentaAuxiliarCodigo: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none"
                    required
                  >
                    {CUENTAS_CAMPO_PMH.map(c => (
                      <option key={c.codigo} value={c.codigo}>
                        [{c.codigo}] {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Equipo / Componente Intervenido:</label>
                <input
                  type="text"
                  placeholder="Ej. Pluma Ship Loader / Chute 02 / Cinta CV-01"
                  value={nuevoValeForm.equipoIntervenido}
                  onChange={(e) => setNuevoValeForm({ ...nuevoValeForm, equipoIntervenido: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Solicitado Por (Técnico / Capataz):</label>
                  <input
                    type="text"
                    value={nuevoValeForm.solicitadoPor}
                    onChange={(e) => setNuevoValeForm({ ...nuevoValeForm, solicitadoPor: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Supervisor Aprobador en Campo:</label>
                  <input
                    type="text"
                    value={nuevoValeForm.supervisorAprobador}
                    onChange={(e) => setNuevoValeForm({ ...nuevoValeForm, supervisorAprobador: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Selector de Materiales de Alta Rotación */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <span className="font-bold text-slate-800 block">Materiales a Despachar de Caseta:</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3 rounded-lg border border-slate-200">
                  <div className="sm:col-span-2">
                    <label className="text-[10px] text-slate-500 font-bold uppercase">Ítem 1 (Principal):</label>
                    <input
                      type="text"
                      value={nuevoValeForm.material1.desc}
                      onChange={(e) => setNuevoValeForm({
                        ...nuevoValeForm,
                        material1: { ...nuevoValeForm.material1, desc: e.target.value }
                      })}
                      className="w-full p-1.5 bg-slate-50 border rounded text-xs mt-0.5"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold uppercase">Cantidad ({nuevoValeForm.material1.unidad}):</label>
                    <input
                      type="number"
                      min="1"
                      value={nuevoValeForm.material1.cant}
                      onChange={(e) => setNuevoValeForm({
                        ...nuevoValeForm,
                        material1: { ...nuevoValeForm.material1, cant: Number(e.target.value) }
                      })}
                      className="w-full p-1.5 bg-slate-50 border rounded text-xs mt-0.5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3 rounded-lg border border-slate-200">
                  <div className="sm:col-span-2">
                    <label className="text-[10px] text-slate-500 font-bold uppercase">Ítem 2 (Consumible Opcional):</label>
                    <input
                      type="text"
                      value={nuevoValeForm.material2.desc}
                      onChange={(e) => setNuevoValeForm({
                        ...nuevoValeForm,
                        material2: { ...nuevoValeForm.material2, desc: e.target.value }
                      })}
                      className="w-full p-1.5 bg-slate-50 border rounded text-xs mt-0.5"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold uppercase">Cantidad ({nuevoValeForm.material2.unidad}):</label>
                    <input
                      type="number"
                      min="0"
                      value={nuevoValeForm.material2.cant}
                      onChange={(e) => setNuevoValeForm({
                        ...nuevoValeForm,
                        material2: { ...nuevoValeForm.material2, cant: Number(e.target.value) }
                      })}
                      className="w-full p-1.5 bg-slate-50 border rounded text-xs mt-0.5"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Motivo / Justificación Técnica:</label>
                <textarea
                  rows={2}
                  value={nuevoValeForm.observaciones}
                  onChange={(e) => setNuevoValeForm({ ...nuevoValeForm, observaciones: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('vales')}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-colors shadow-xs flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Emitir Vale y Despachar Material</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 3: Cuentas de Frente PMH / Pellas */}
        {activeTab === 'cuentas' && (
          <div className="p-4 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CUENTAS_CAMPO_PMH.map((cta) => {
                const valesDeEstaCuenta = vales.filter(v => v.cuentaAuxiliarCodigo === cta.codigo);
                const totalGastado = valesDeEstaCuenta.reduce((acc, v) => acc + v.montoTotalUsd, 0);

                return (
                  <div key={cta.codigo} className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-xs px-2.5 py-1 rounded bg-blue-100 text-blue-900 border border-blue-200">
                        {cta.codigo}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {valesDeEstaCuenta.length} Vales Emitidos
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{cta.nombre}</h4>
                      <p className="text-xs text-slate-600 mt-1">Responsable: <strong>{cta.responsable}</strong></p>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Presupuesto Asignado:</span>
                        <strong className="font-mono text-slate-900">${cta.presupuestoUsd.toLocaleString()} USD</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Despachos SIP en Campo:</span>
                        <strong className="font-mono text-amber-700">${Math.round(totalGastado).toLocaleString()} USD</strong>
                      </div>
                    </div>

                    {onGoToProyecto && (
                      <button
                        onClick={() => onGoToProyecto(cta.codigo)}
                        className="w-full py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        Ver Auditoría de Costos de Esta Cuenta
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modal: Vista Oficial de Vale SIP Imprimible */}
      {valeParaImprimir && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900">Vale de Salida SIP en Campo · TIMACA</h3>
              </div>
              <button
                onClick={() => setValeParaImprimir(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Documento Estilo Membrete SIP */}
            <div className="border border-slate-300 rounded-xl p-5 bg-neutral-50/50 space-y-4 text-xs font-sans">
              <div className="flex items-center justify-between border-b pb-3 border-slate-200">
                <div>
                  <h4 className="font-black text-sm text-[#0b2545]">TALLER INDUSTRIAL METALÚRGICO ANTONIO, C.A.</h4>
                  <p className="text-[10px] text-slate-500 font-mono">SISTEMA DE INFORMACIÓN DE PRODUCCIÓN (SIP) · Frente PMH / PELLAS</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-slate-900 bg-slate-200 px-2.5 py-1 rounded">
                    {valeParaImprimir.numeroVale}
                  </span>
                  <div className="text-[10px] text-slate-500 mt-1">Fecha: {valeParaImprimir.fechaHora}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-white p-3 rounded-lg border border-slate-200">
                <div><strong>Frente Operativo:</strong> {valeParaImprimir.frenteTrabajo}</div>
                <div><strong>Cuenta Auxiliar:</strong> {valeParaImprimir.cuentaAuxiliarCodigo}</div>
                <div><strong>Equipo Intervenido:</strong> {valeParaImprimir.equipoIntervenido}</div>
                <div><strong>Solicitado Por:</strong> {valeParaImprimir.solicitadoPor} ({valeParaImprimir.cargoSolicitante})</div>
                <div><strong>Supervisor Frente:</strong> {valeParaImprimir.supervisorAprobador}</div>
                <div><strong>Despachado Por:</strong> {valeParaImprimir.despachadoPor}</div>
              </div>

              <div>
                <span className="font-bold text-slate-800 block mb-1.5">Materiales Despachados en Campo:</span>
                <table className="w-full text-left border border-slate-200 bg-white rounded-lg">
                  <thead className="bg-slate-100 text-[10px] font-bold text-slate-600">
                    <tr>
                      <th className="p-2">Código</th>
                      <th className="p-2">Descripción</th>
                      <th className="p-2 text-center">Unidad</th>
                      <th className="p-2 text-center">Cantidad</th>
                      <th className="p-2 text-right">Precio Unit.</th>
                      <th className="p-2 text-right">Total USD</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {valeParaImprimir.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="p-2 font-mono text-[11px] text-slate-700">{it.codigoMaterial}</td>
                        <td className="p-2 font-medium">{it.descripcion}</td>
                        <td className="p-2 text-center font-mono">{it.unidad}</td>
                        <td className="p-2 text-center font-mono">{it.cantidad}</td>
                        <td className="p-2 text-right font-mono">${formatUnitPriceRaw(it.costoUnitarioUsd)}</td>
                        <td className="p-2 text-right font-mono font-bold">${Math.round(it.totalUsd).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {valeParaImprimir.observaciones && (
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-slate-600 text-[11px]">
                  <strong>Observaciones:</strong> {valeParaImprimir.observaciones}
                </div>
              )}

              <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-200 text-center text-[11px]">
                <div className="border-t border-dashed border-slate-400 pt-1">
                  <strong>Entregado Por (Almacén Campo)</strong>
                  <div className="text-slate-500 text-[10px]">{valeParaImprimir.despachadoPor}</div>
                </div>
                <div className="border-t border-dashed border-slate-400 pt-1">
                  <strong>Recibido y Conforme (Supervisor)</strong>
                  <div className="text-slate-500 text-[10px]">{valeParaImprimir.solicitadoPor}</div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-slate-500 font-mono">
                Total Vale: <strong>${Math.round(valeParaImprimir.montoTotalUsd).toLocaleString()} USD</strong>
              </span>

              <button
                onClick={() => setValeParaImprimir(null)}
                className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors"
              >
                Cerrar Vale
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
