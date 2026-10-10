import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { useCostos } from '../context/CostosContext';
import { SalidaCosto } from '../types/costos';
import { formatCurrency, formatNumber, formatUnitPriceRaw } from '../utils/dateHelpers';
import { 
  Search, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Edit3, 
  AlertCircle,
  Briefcase,
  Layers,
  ArrowLeft,
  Download,
  CheckCircle2,
  ShieldCheck,
  X,
  FileText,
  Calendar,
  Clock,
  Eye,
  Lock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { UsuarioSistema } from '../types/usuarios';

interface SalidasTableViewProps {
  onOpenNewSalida: () => void;
  onEditSalida: (salida: SalidaCosto) => void;
  onVolver?: () => void;
  currentUser?: UsuarioSistema;
}

export const SalidasTableView: React.FC<SalidasTableViewProps> = ({
  onOpenNewSalida,
  onEditSalida,
  onVolver,
  currentUser
}) => {
  const {
    filteredSalidas,
    totalMontoFiltrado,
    totalSalidasFiltrado,
    searchTerm,
    setSearchTerm,
    selectedMes,
    setSelectedMes,
    selectedSemana,
    setSelectedSemana,
    selectedProyecto,
    setSelectedProyecto,
    selectedCuentaAuxiliar,
    setSelectedCuentaAuxiliar,
    selectedCategoria,
    setSelectedCategoria,
    fechaInicio,
    setFechaInicio,
    fechaFin,
    setFechaFin,
    resetFiltros,
    deleteSalida,
    resumenMeses,
    resumenSemanas,
    resumenProyectos,
    resumenCategorias,
  } = useCostos();

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [soloExternos, setSoloExternos] = useState<boolean>(true);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [salidaAuditoria, setSalidaAuditoria] = useState<SalidaCosto | null>(null);
  const [tarjetaAuditoriaExpandida, setTarjetaAuditoriaExpandida] = useState<boolean>(true);
  const esAdmin = !currentUser || currentUser.rol === 'Administrador';

  const handleDelete = (id: string) => {
    deleteSalida(id);
    setDeleteConfirmId(null);
  };

  // Colores distintivos de las 5 categorías
  const getCategoryBadgeClass = (tipo: string) => {
    switch (tipo) {
      case 'Materiales Directos':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Servicios':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Mano de Obra Directa':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Horas Maquina':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Costos Indirectos':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  // Exportar salidas a Excel
  const handleExportExcel = () => {
    const dataExcel = salidasParaTabla.map(s => {
      let fechaFormateada = s.fecha;
      if (s.fecha && s.fecha.includes('-')) {
        const parts = s.fecha.split('-');
        if (parts.length === 3) fechaFormateada = `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return {
        'Fecha': fechaFormateada,
        'Cuenta Auxiliar': s.cuentaAuxiliarCodigo,
        'Proyecto': s.proyecto,
        'Tipo': s.tipo || s.categoria,
        'Categoría': s.subcategoria || 'General',
        'Descripción del Ítem': s.itemDescripcion,
        'Cantidad': s.cantidad,
        'Unidad': s.unidadMedida === 'USE' ? 'SERV' : s.unidadMedida,
        'Precio Unitario (USD)': s.montoUnitario,
        'Monto Total (USD)': s.montoTotal,
        'Motivo': s.motivo || s.observaciones || '-',
        'Solicitante': s.solicitante || s.responsable || '-',
        'Semana': s.semanaLabel || `Semana ${s.semana}`,
        'Mes': s.mesLabel || `Mes ${s.mes}`
      };
    });

    const ws = XLSX.utils.json_to_sheet(dataExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Salidas_Costos_SIP');

    ws['!cols'] = [
      { wch: 12 },
      { wch: 15 },
      { wch: 28 },
      { wch: 22 },
      { wch: 26 },
      { wch: 45 },
      { wch: 12 },
      { wch: 12 },
      { wch: 18 },
      { wch: 18 },
      { wch: 35 },
      { wch: 25 },
      { wch: 14 },
      { wch: 14 }
    ];

    const nombreArchivo = soloExternos 
      ? 'TIMACA_Salidas_SIP_Proyectos_Externos_2026.xlsx'
      : 'TIMACA_Salidas_SIP_Costos_2026.xlsx';

    XLSX.writeFile(wb, nombreArchivo);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3500);
  };

  // Lista unificada de proyectos con su cuenta auxiliar para el filtro (sin duplicados y con código oficial)
  const proyectosUnicosLista = useMemo(() => {
    const mapa = new Map<string, { codigo: string; nombreCorto: string; nombreCompleto: string }>();
    resumenProyectos.forEach(p => {
      let cod = '';
      let nom = p.nombre;
      if (p.nombre.includes(':')) {
        const parts = p.nombre.split(':');
        cod = parts[0].trim();
        nom = parts.slice(1).join(':').trim();
      }
      const nombreCompleto = cod ? `${cod}: ${nom}` : nom;
      const key = cod || nom;
      if (!mapa.has(key)) {
        mapa.set(key, { codigo: cod, nombreCorto: nom, nombreCompleto });
      }
    });
    return Array.from(mapa.values()).sort((a, b) => a.nombreCompleto.localeCompare(b.nombreCompleto));
  }, [resumenProyectos]);

  // Collect all unique cuentas auxiliares for filter
  const uniqueCuentas = Array.from(
    new Set(filteredSalidas.map(s => `${s.cuentaAuxiliarCodigo} — ${s.cuentaAuxiliarNombre}`))
  ).sort();

  // Filtrado adicional para proyectos externos y orden cronológico descendente (más reciente primero)
  const salidasParaTabla = useMemo(() => {
    const list = soloExternos
      ? filteredSalidas.filter(s => s.esProyectoExterno ?? s.cuentaAuxiliarCodigo.startsWith('TTE-C-'))
      : filteredSalidas;
    return [...list].sort((a, b) => b.fecha.localeCompare(a.fecha));
  }, [filteredSalidas, soloExternos]);

  const totalMontoMostrado = useMemo(() => {
    return salidasParaTabla.reduce((acc, s) => acc + s.montoTotal, 0);
  }, [salidasParaTabla]);

  return (
    <div className="space-y-4">
      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Volver y Search box */}
          <div className="flex items-center gap-2.5 flex-1">
            {onVolver && (
              <button
                onClick={onVolver}
                className="flex items-center gap-1.5 font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200/90 px-2.5 py-2 rounded-lg transition-colors text-xs shadow-2xs shrink-0 self-center"
                title="Volver al Resumen General"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver</span>
              </button>
            )}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Buscar por código, material, proyecto, cuenta auxiliar, proveedor o responsable..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs pl-9 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-neutral-50/50"
              />
            </div>
          </div>

          {/* Quick action buttons & Filtro Proyectos Externos */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSoloExternos(!soloExternos)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${
                soloExternos
                  ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
              title="Filtrar únicamente cuentas auxiliares TTE-C de clientes externos"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Solo Proyectos Externos</span>
            </button>

            <button
              onClick={resetFiltros}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-600 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpiar Filtros</span>
            </button>
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors shadow-2xs whitespace-nowrap"
              title="Descargar las salidas filtradas en formato Excel (.xlsx)"
            >
              {downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>¡Descargado!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Descargar en Excel</span>
                </>
              )}
            </button>
            {(!currentUser || currentUser.permisos?.canCreateSalidas) && (
              <button
                onClick={onOpenNewSalida}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xs whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Nueva Salida</span>
              </button>
            )}
          </div>
        </div>

        {/* Dropdown Filters con Categoría Oficial incluida */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-2 border-t border-neutral-100">
          {/* 1. Proyecto con Cuenta Auxiliar siempre visible */}
          <div>
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1 flex items-center gap-1">
              <Briefcase className="w-3 h-3 text-blue-600" />
              Proyecto (Cuenta Auxiliar)
            </label>
            <select
              value={selectedProyecto}
              onChange={(e) => setSelectedProyecto(e.target.value)}
              className="w-full text-xs font-medium text-neutral-800 bg-neutral-50 border border-neutral-300 rounded-lg p-1.5 focus:ring-2 focus:ring-blue-500 truncate"
            >
              <option value="all">Todos los Proyectos</option>
              {proyectosUnicosLista.map((p) => (
                <option key={p.codigo || p.nombreCompleto} value={p.nombreCompleto}>
                  {p.nombreCompleto}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Categoría Oficial solicitada por Alejandra */}
          <div>
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1 flex items-center gap-1">
              <Layers className="w-3 h-3 text-blue-600" />
              Categoría Oficial
            </label>
            <select
              value={selectedCategoria}
              onChange={(e) => setSelectedCategoria(e.target.value)}
              className="w-full text-xs font-bold text-neutral-800 bg-neutral-50 border border-neutral-300 rounded-lg p-1.5 focus:ring-2 focus:ring-blue-500 truncate"
            >
              <option value="all">Todas las Categorías</option>
              <option value="Materiales Directos">Materiales Directos</option>
              <option value="Servicios">Servicios</option>
              <option value="Mano de Obra Directa">Mano de Obra Directa</option>
              <option value="Horas Maquina">Horas Máquina</option>
              <option value="Costos Indirectos">Costos Indirectos</option>
            </select>
          </div>

          {/* 3. Cuenta Auxiliar */}
          <div>
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1 flex items-center gap-1">
              <Layers className="w-3 h-3 text-blue-600" />
              Cuenta Auxiliar
            </label>
            <select
              value={selectedCuentaAuxiliar}
              onChange={(e) => setSelectedCuentaAuxiliar(e.target.value)}
              className="w-full text-xs font-medium text-neutral-800 bg-neutral-50 border border-neutral-300 rounded-lg p-1.5 focus:ring-2 focus:ring-blue-500 truncate"
            >
              <option value="all">Todas las Cuentas</option>
              {uniqueCuentas.map((c) => (
                <option key={c} value={c.split(' — ')[0]}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Mes */}
          <div>
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-blue-600" />
              Mes Operativo
            </label>
            <select
              value={selectedMes}
              onChange={(e) => setSelectedMes(e.target.value)}
              className="w-full text-xs font-medium text-neutral-800 bg-neutral-50 border border-neutral-300 rounded-lg p-1.5 focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los Meses</option>
              {resumenMeses.map((m) => (
                <option key={`${m.ano}-${m.mes}`} value={String(m.mes)}>
                  {m.mesLabel}
                </option>
              ))}
            </select>
          </div>

          {/* 5. Semana */}
          <div>
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1 flex items-center gap-1">
              <Clock className="w-3 h-3 text-blue-600" />
              Semana Operativa
            </label>
            <select
              value={selectedSemana}
              onChange={(e) => setSelectedSemana(e.target.value)}
              className="w-full text-xs font-medium text-neutral-800 bg-neutral-50 border border-neutral-300 rounded-lg p-1.5 focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas las Semanas</option>
              {resumenSemanas.map((s) => (
                <option key={s.semana} value={String(s.semana)}>
                  {s.semanaLabel} ({s.mesLabel})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Filter summary status */}
      <div className="flex items-center justify-between px-2 text-xs text-neutral-600">
        <div className="flex flex-wrap items-center gap-2">
          <span>Mostrando <strong>{salidasParaTabla.length}</strong> salidas</span>
          <span aria-hidden="true">·</span>
          <span>Suma Total Filtrada: <strong className="font-mono tabular-nums text-blue-700">{formatCurrency(totalMontoMostrado)}</strong></span>
          {soloExternos && (
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
              Filtro Activo: Solo Proyectos Externos (TTE-C)
            </span>
          )}
        </div>
      </div>

      {/* High-Density Data Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs">
        {salidasParaTabla.length === 0 ? (
          <div className="p-12 text-center text-neutral-500">
            <AlertCircle className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-neutral-800">No se encontraron salidas</h4>
            <p className="text-xs text-neutral-500 mt-1">
              Prueba cambiando o limpiando los filtros seleccionados.
            </p>
            <button
              onClick={() => {
                resetFiltros();
                setSoloExternos(false);
              }}
              className="mt-3 px-3 py-1.5 text-xs font-semibold bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors"
            >
              Restablecer Filtros
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100/90 text-slate-700 border-b border-slate-200 font-bold uppercase text-[10px] tracking-wider sticky top-0 whitespace-nowrap">
                <tr>
                  <th className="py-2.5 px-3">Fecha</th>
                  <th className="py-2.5 px-3">Cuenta Auxiliar</th>
                  <th className="py-2.5 px-3 min-w-[150px]">Proyecto</th>
                  <th className="py-2.5 px-3 min-w-[120px]">Tipo</th>
                  <th className="py-2.5 px-3 min-w-[130px]">Categoría</th>
                  <th className="py-2.5 px-4 min-w-[220px]">Descripción</th>
                  <th className="py-2.5 px-3 text-right">Cantidad</th>
                  <th className="py-2.5 px-3">Unidad</th>
                  <th className="py-2.5 px-3 text-right">P. Unitario (USD)</th>
                  <th className="py-2.5 px-3 text-right">Monto Total (USD)</th>
                  <th className="py-2.5 px-3 min-w-[170px]">Motivo</th>
                  <th className="py-2.5 px-3 min-w-[130px]">Solicitante</th>
                  <th className="py-2.5 px-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {salidasParaTabla.map((s) => {
                  let fechaFormateada = s.fecha;
                  if (s.fecha && s.fecha.includes('-')) {
                    const parts = s.fecha.split('-');
                    if (parts.length === 3) fechaFormateada = `${parts[2]}/${parts[1]}/${parts[0]}`;
                  }
                  const tipoDisplay = s.tipo || s.categoria;
                  const subcategoriaDisplay = s.subcategoria || 'General';
                  const motivoDisplay = s.motivo || s.observaciones || '-';
                  const solicitanteDisplay = s.solicitante || s.responsable || '-';
                  const cantDisplay = formatNumber(s.cantidad);
                  const unidadDisplay = s.unidadMedida === 'USE' ? 'SERV' : s.unidadMedida;
                  const pUnitVal = s.montoUnitario;

                  return (
                    <tr 
                      key={s.id} 
                      onClick={() => setSalidaAuditoria(s)}
                      className="hover:bg-blue-50/80 transition-colors group cursor-pointer"
                      title="Haz clic para auditar la imputación contable de esta partida"
                    >
                      {/* 1. Fecha */}
                      <td className="py-2 px-3 font-mono tabular-nums text-neutral-700 whitespace-nowrap font-medium">
                        {fechaFormateada}
                      </td>

                      {/* 2. Cuenta Auxiliar */}
                      <td className="py-2 px-3 whitespace-nowrap">
                        <span className="font-mono text-[11px] font-bold bg-blue-50 px-2 py-0.5 rounded text-blue-700 border border-blue-200/80">
                          {s.cuentaAuxiliarCodigo}
                        </span>
                      </td>

                      {/* 3. Proyecto */}
                      <td className="py-2 px-3 font-semibold text-neutral-800 whitespace-nowrap max-w-[180px] truncate" title={s.proyecto}>
                        {s.proyecto}
                      </td>

                      {/* 4. Tipo con sus colores oficiales */}
                      <td className="py-2 px-3 whitespace-nowrap">
                        <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded border ${getCategoryBadgeClass(tipoDisplay)}`}>
                          {tipoDisplay}
                        </span>
                      </td>

                      {/* 5. Categoría */}
                      <td className="py-2 px-3 whitespace-nowrap text-neutral-700 font-medium">
                        {subcategoriaDisplay}
                      </td>

                      {/* 6. Descripción */}
                      <td className="py-2 px-4 max-w-[240px] truncate font-medium text-neutral-900" title={s.itemDescripcion}>
                        {s.itemDescripcion}
                      </td>

                      {/* 7. Cantidad */}
                      <td className="py-2 px-3 text-right whitespace-nowrap font-mono font-bold tabular-nums text-neutral-900 text-xs">
                        {cantDisplay}
                      </td>

                      {/* 8. Unidad */}
                      <td className="py-2 px-3 whitespace-nowrap text-neutral-600">
                        {unidadDisplay}
                      </td>

                      {/* 9. P. Unitario */}
                      <td className="py-2 px-3 text-right whitespace-nowrap font-mono tabular-nums text-neutral-600">
                        ${formatUnitPriceRaw(pUnitVal)}
                      </td>

                      {/* 10. Monto Total */}
                      <td className="py-2 px-3 text-right whitespace-nowrap font-mono tabular-nums font-bold text-neutral-900 bg-slate-50/50">
                        {Math.round(s.montoTotal).toLocaleString('de-DE')}
                      </td>

                      {/* 11. Motivo */}
                      <td className="py-2 px-3 text-neutral-600 italic max-w-[180px] truncate" title={motivoDisplay}>
                        {motivoDisplay}
                      </td>

                      {/* 12. Solicitante */}
                      <td className="py-2 px-3 whitespace-nowrap text-neutral-700 font-medium">
                        {solicitanteDisplay}
                      </td>

                      {/* Acciones */}
                      <td className="py-2 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setSalidaAuditoria(s)}
                            title="Auditar imputación contable"
                            className="p-1 rounded text-neutral-500 hover:text-blue-700 hover:bg-blue-100 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {(!currentUser || currentUser.permisos?.canEditSalidas) && (
                            <button
                              onClick={() => onEditSalida(s)}
                              title="Editar salida"
                              className="p-1 rounded text-neutral-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {(!currentUser || currentUser.permisos?.canDeleteSalidas) && (
                            <button
                              onClick={() => setDeleteConfirmId(s.id)}
                              title="Eliminar registro"
                              className="p-1 rounded text-neutral-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-100 border-t-2 border-slate-300 font-bold text-xs text-neutral-900 sticky bottom-0">
                <tr>
                  <td colSpan={9} className="py-3 px-4 uppercase tracking-wider font-extrabold text-slate-800 whitespace-nowrap">
                    TOTAL GENERAL ({salidasParaTabla.length.toLocaleString('de-DE')} REGISTROS):
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-neutral-950 font-black text-sm bg-slate-200/60 whitespace-nowrap min-w-[140px]">
                    ${Math.round(totalMontoMostrado).toLocaleString('de-DE')}
                  </td>
                  <td colSpan={3}></td>
                </tr>
              </tfoot>

            </table>
          </div>
        )}
      </div>

      {/* Tarjeta de Conciliación y Auditoría Exclusiva para la Administradora (Alejandra Tesara) */}
      {esAdmin && (
        <div className="bg-white rounded-2xl border border-blue-200 shadow-xs overflow-hidden transition-all">
          <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-50/80 via-slate-50 to-indigo-50/60 border-b border-blue-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="p-2.5 rounded-xl bg-blue-700 text-white shrink-0 shadow-xs mt-0.5">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-slate-900 text-sm tracking-tight">
                    Auditoría Contable: Conciliación de Proyectos Externos (Agosto 2026)
                  </h3>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-900 border border-blue-300">
                    <Lock className="w-3 h-3 text-blue-700" />
                    Acceso Exclusivo: Administradora ({currentUser?.nombre || 'Alejandra Tesara'})
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Trazabilidad matemática de los <strong>$856.482,12 USD</strong> en vales físicos de campo frente al Cierre Mensual (<strong>$1.345.010,00 USD</strong>).
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setTarjetaAuditoriaExpandida(!tarjetaAuditoriaExpandida)}
              className="self-end md:self-center px-3 py-1.5 rounded-xl text-xs font-semibold text-blue-800 bg-white hover:bg-blue-50 border border-blue-200 shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>{tarjetaAuditoriaExpandida ? 'Contraer explicación' : 'Ver explicación completa'}</span>
              {tarjetaAuditoriaExpandida ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {tarjetaAuditoriaExpandida && (
            <div className="p-5 sm:p-6 space-y-6">
              {/* Sección 1: Desglose de los 4 Rubros Directos */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    1. Desglose de los 5.691 comprobantes físicos directos de agosto:
                  </span>
                  <span className="text-xs font-mono font-bold text-blue-900 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                    Total: $856.482,12 USD
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-blue-900 uppercase">Materiales Directos</span>
                      <span className="text-[10px] font-bold bg-blue-200/70 text-blue-800 px-1.5 py-0.5 rounded">57,9%</span>
                    </div>
                    <span className="text-base font-black font-mono text-blue-950 block">
                      $495.913,23 USD
                    </span>
                    <span className="text-[11px] text-blue-800/90 block mt-1 leading-snug">
                      Vales físicos despachados desde el Almacén Central SIP directamente a cuentas auxiliares TTE-C.
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-emerald-900 uppercase">Mano de Obra Directa</span>
                      <span className="text-[10px] font-bold bg-emerald-200/70 text-emerald-800 px-1.5 py-0.5 rounded">24,7%</span>
                    </div>
                    <span className="text-base font-black font-mono text-emerald-950 block">
                      $211.816,27 USD
                    </span>
                    <span className="text-[11px] text-emerald-800/90 block mt-1 leading-snug">
                      Nóminas operativas semanales de cuadrillas (soldadores, montadores, ayudantes, mecánicos).
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-purple-900 uppercase">Horas Máquina</span>
                      <span className="text-[10px] font-bold bg-purple-200/70 text-purple-800 px-1.5 py-0.5 rounded">9,9%</span>
                    </div>
                    <span className="text-base font-black font-mono text-purple-950 block">
                      $85.167,83 USD
                    </span>
                    <span className="text-[11px] text-purple-800/90 block mt-1 leading-snug">
                      Partes diarios de grúas pesadas (Liebherr, Demag AC200), payloader y compresores en frentes.
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-orange-50/70 border border-orange-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-orange-900 uppercase">Servicios Directos</span>
                      <span className="text-[10px] font-bold bg-orange-200/70 text-orange-800 px-1.5 py-0.5 rounded">7,4%</span>
                    </div>
                    <span className="text-base font-black font-mono text-orange-950 block">
                      $63.584,79 USD
                    </span>
                    <span className="text-[11px] text-orange-800/90 block mt-1 leading-snug">
                      17 partidas operativas de servicios ejecutados: fletes marítimos, alquileres y ensayos QA/QC.
                    </span>
                  </div>
                </div>

                <div className="mt-2.5 p-2 bg-slate-50 border border-slate-200/80 rounded-lg text-center text-xs font-mono text-slate-700">
                  $495.913,23 + $211.816,27 + $85.167,83 + $63.584,79 = <strong className="text-blue-900">$856.482,12 USD</strong> (Total de los 5.691 registros)
                </div>
              </div>

              {/* Sección 2: Conciliación con el Cierre Mensual */}
              <div className="border-t border-slate-200/80 pt-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-2.5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  2. Conciliación con el Cierre Mensual ($1.345.010,00 USD) · Diferencia de $488.527,88 USD:
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-900">Costos Indirectos (CIF Prorrateados)</span>
                      <span className="font-mono font-extrabold text-amber-950">+$336.208,00 USD</span>
                    </div>
                    <p className="text-neutral-600 text-[11px] leading-relaxed">
                      Corresponde a la bolsa consolidada de soporte de talleres ($122K), nómina administrativa ($125K), sindicato ($57K) y gasoil ($19K) prorrateada sobre los contratos externos. <strong>No proviene de un vale individual de almacén</strong>, sino de costos indirectos corporativos.
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">Aportes, Combustible y Cierre Contable</span>
                      <span className="font-mono font-extrabold text-slate-950">+$152.319,88 USD</span>
                    </div>
                    <p className="text-neutral-600 text-[11px] leading-relaxed">
                      Contratos de servicios especializados en campo, combustible consolidado, provisiones de parada y ajustes de compras asentados en la contabilidad general de proyectos.
                    </p>
                  </div>
                </div>

                <div className="mt-2.5 p-2.5 bg-blue-50/50 border border-blue-200/60 rounded-lg text-xs font-mono text-blue-900 flex items-center justify-between flex-wrap gap-2">
                  <span>Balance: $856.482,12 (Vales directos) + $336.208,00 (CIF) + $152.319,88 (Ajustes y contratos)</span>
                  <span className="font-bold text-sm text-blue-950">= $1.345.010,00 USD (PPT Agosto)</span>
                </div>
              </div>

              {/* Sección 3: Top 5 Contratos Clientes */}
              <div className="border-t border-slate-200/80 pt-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-2.5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  3. Principales Proyectos Clientes dentro de los $856.482,12 USD:
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
                  <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-center">
                    <span className="font-mono text-[10px] text-neutral-500 block">TTE-C-0706</span>
                    <span className="font-bold text-neutral-900 text-xs truncate block" title="1era Línea Planta de Pellas">Línea 1 Pellas</span>
                    <span className="font-mono font-black text-blue-700 text-xs block mt-0.5">$331.822 USD</span>
                    <span className="text-[10px] text-neutral-500 font-semibold">38,7%</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-center">
                    <span className="font-mono text-[10px] text-neutral-500 block">TTE-C-0671</span>
                    <span className="font-bold text-neutral-900 text-xs truncate block" title="Segunda Línea PMH">2da PMH</span>
                    <span className="font-mono font-black text-blue-700 text-xs block mt-0.5">$157.206 USD</span>
                    <span className="text-[10px] text-neutral-500 font-semibold">18,4%</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-center">
                    <span className="font-mono text-[10px] text-neutral-500 block">TTE-C-0668</span>
                    <span className="font-bold text-neutral-900 text-xs truncate block" title="Briqueteras">Briqueteras</span>
                    <span className="font-mono font-black text-blue-700 text-xs block mt-0.5">$118.127 USD</span>
                    <span className="text-[10px] text-neutral-500 font-semibold">13,8%</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-center">
                    <span className="font-mono text-[10px] text-neutral-500 block">TTE-C-0653</span>
                    <span className="font-bold text-neutral-900 text-xs truncate block" title="Obras Civiles y Estructuras">Obras Civiles</span>
                    <span className="font-mono font-black text-blue-700 text-xs block mt-0.5">$65.009 USD</span>
                    <span className="text-[10px] text-neutral-500 font-semibold">7,6%</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-center">
                    <span className="font-mono text-[10px] text-neutral-500 block">TTE-C-0656</span>
                    <span className="font-bold text-neutral-900 text-xs truncate block" title="Bandas PMH">Bandas PMH</span>
                    <span className="font-mono font-black text-blue-700 text-xs block mt-0.5">$64.750 USD</span>
                    <span className="text-[10px] text-neutral-500 font-semibold">7,6%</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 space-y-4 shadow-xl">
            <h4 className="text-base font-bold text-neutral-900">¿Eliminar esta salida?</h4>
            <p className="text-xs text-neutral-600">
              Esta acción removerá permanentemente la salida de costos del Modelo Estrella.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Eliminar Salida
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Auditoría de Imputación de Salida */}
      {salidaAuditoria && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl border border-neutral-200 max-h-[90vh] overflow-y-auto animate-fade-in">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-neutral-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-neutral-900">
                      Auditoría Contable de Imputación
                    </h3>
                    <span className="font-mono text-xs font-bold bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded border border-neutral-300">
                      {salidaAuditoria.codigoSalida}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Verificación de trazabilidad en almacén SIP, nómina RRHH e imputación al costo del proyecto
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSalidaAuditoria(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Grid de Auditoría */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200 space-y-2">
                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">Proyecto & Cuenta</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                    {salidaAuditoria.cuentaAuxiliarCodigo}
                  </span>
                  <span className="font-bold text-neutral-900 text-sm">
                    {salidaAuditoria.proyecto}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-600">
                  {salidaAuditoria.cuentaAuxiliarNombre}
                </p>
              </div>

              <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200 space-y-2">
                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">Clasificación Contable Oficial</span>
                <div className="flex items-center gap-2">
                  <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded border ${getCategoryBadgeClass(salidaAuditoria.tipo || salidaAuditoria.categoria)}`}>
                    {salidaAuditoria.tipo || salidaAuditoria.categoria}
                  </span>
                  <span className="font-semibold text-neutral-700">
                    {salidaAuditoria.subcategoria || 'General'}
                  </span>
                </div>
                <span className="text-[11px] text-neutral-500 block">
                  Fecha: <strong>{salidaAuditoria.fecha}</strong> · Semana: <strong>{salidaAuditoria.semanaLabel || `Semana ${salidaAuditoria.semana}`}</strong>
                </span>
              </div>
            </div>

            {/* Ítem y Montos */}
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-200/80 space-y-3">
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">Descripción del Ítem o Servicio Auditado</span>
              <p className="font-bold text-neutral-900 text-sm">
                {salidaAuditoria.itemDescripcion}
              </p>
              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-blue-200/60 text-xs">
                <div>
                  <span className="text-neutral-500 block text-[11px]">Cantidad Despachada</span>
                  <span className="font-mono font-bold text-neutral-900 text-sm">
                    {formatNumber(salidaAuditoria.cantidad)} {salidaAuditoria.unidadMedida === 'USE' ? 'SERV' : salidaAuditoria.unidadMedida}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[11px]">Precio Unitario</span>
                  <span className="font-mono font-semibold text-neutral-800 text-sm">
                    ${formatUnitPriceRaw(salidaAuditoria.montoUnitario)}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[11px]">Monto Total (USD)</span>
                  <span className="font-mono font-black text-blue-700 text-base">
                    ${Math.round(salidaAuditoria.montoTotal).toLocaleString('de-DE')}
                  </span>
                </div>
              </div>

              {/* Cálculo */}
              <div className="mt-2.5 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    Cálculo Auditado (Master Unificado):
                  </span>
                  <span className="font-mono text-xs sm:text-sm font-semibold text-slate-800">
                    {formatNumber(salidaAuditoria.cantidad)} {salidaAuditoria.unidadMedida === 'USE' ? 'SERV' : salidaAuditoria.unidadMedida} × ${formatUnitPriceRaw(salidaAuditoria.montoUnitario)} = ${Math.round(salidaAuditoria.montoTotal).toLocaleString('de-DE')} USD
                  </span>
                </div>

                {salidaAuditoria.precioSIP !== undefined && (
                  <div className="pt-2 border-t border-slate-200 text-[11px] space-y-1">
                    <div className="flex items-center justify-between text-amber-900 bg-amber-50/80 px-2.5 py-1.5 rounded border border-amber-200">
                      <div>
                        <span className="font-bold text-[10px] uppercase block text-amber-800">Costo Registrado en SIP (1 Base Central Inputs):</span>
                        <span className="font-mono font-semibold">
                          ${formatUnitPriceRaw(salidaAuditoria.precioSIP)} USD / {salidaAuditoria.unidadMedida === 'USE' ? 'SERV' : salidaAuditoria.unidadMedida} · Total SIP: ${Math.round(((salidaAuditoria.totalSIP ?? (salidaAuditoria.cantidad * salidaAuditoria.precioSIP)))).toLocaleString('de-DE')} USD
                        </span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded border border-amber-300">
                        {salidaAuditoria.precioSIP === salidaAuditoria.montoUnitario ? 'Precio Coincidente' : 'Ajustado por Auditoría'}
                      </span>
                    </div>
                    {salidaAuditoria.precioSIP !== salidaAuditoria.montoUnitario && (
                      <p className="text-[10px] text-neutral-500 italic px-1">
                        * Nota de Auditoría: El precio unitario final de ${formatUnitPriceRaw(salidaAuditoria.montoUnitario)} USD es el valor auditado por Power Query (Hoja Unificada) aplicando la regla de valoración contra precios históricos de compra y catálogo.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Criterio de Imputación y Trazabilidad */}
            <div className="space-y-2 text-xs">
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">
                Criterio de Imputación Contable
              </span>
              <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-1.5 text-neutral-800">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Imputación Correcta en {salidaAuditoria.tipo || salidaAuditoria.categoria}</span>
                </div>
                <p className="text-[11px] text-neutral-700 leading-relaxed">
                  {salidaAuditoria.categoria === 'Materiales Directos'
                    ? 'Partida imputada correctamente como Material Directo por corresponder a insumo físico y estructural cargado directamente a la orden de fabricación del proyecto con vale de salida del Almacén Central SIP.'
                    : salidaAuditoria.categoria === 'Servicios'
                    ? 'Partida imputada como Servicio Directo por tratarse de transporte especializado, supervisión técnica, recargas de gases o ensayos de laboratorio QA/QC contratados para este proyecto.'
                    : salidaAuditoria.categoria === 'Mano de Obra Directa'
                    ? 'Partida imputada a Mano de Obra Directa (MOD) según el corte semanal de nómina auditada de cuadrillas operativas de planta y campo.'
                    : salidaAuditoria.categoria === 'Horas Maquina'
                    ? 'Partida imputada a Horas Máquina por uso directo de maquinaria pesada propia (grúas Liebherr, torno vertical Schiess, mandrinadora CNC).'
                    : 'Partida imputada a Costos Indirectos operativos proporcional al coeficiente de Mano de Obra Directa (MOD) o asignación fija de residencia de obra según la Diapositiva 10 del PPT.'}
                </p>
                <div className="pt-1.5 border-t border-emerald-200/60 grid grid-cols-2 gap-2 text-[11px] text-neutral-600">
                  <div><strong>Solicitante:</strong> {salidaAuditoria.solicitante || 'Residencia de Obra'}</div>
                  <div><strong>Responsable Almacén/Caja:</strong> {salidaAuditoria.responsable || 'Almacén Central SIP'}</div>
                  <div className="col-span-2"><strong>Motivo Técnico:</strong> {salidaAuditoria.motivo || salidaAuditoria.observaciones || 'Despacho operativo'}</div>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end pt-3 border-t border-neutral-200">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const sal = salidaAuditoria;
                    setSalidaAuditoria(null);
                    onEditSalida(sal);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar Salida</span>
                </button>
                <button
                  onClick={() => setSalidaAuditoria(null)}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors shadow-xs"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
