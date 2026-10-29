import React, { useState, useMemo } from 'react';
import { Search, Filter, X, ChevronRight, FileSpreadsheet, Eye, ArrowUpDown } from 'lucide-react';
import { SipItem, getMacroCategoriaSip } from '../../services/sipDataService';
import { getMacroCategoryBadge, getComprobanteBadge } from './proyectosTypes';
import { safeFormatUSD, safeFormatQuantity } from '../../utils/numericHelpers';

interface ProyectosDataTableProps {
  items: SipItem[];
  selectedCategoryFilter: string;
  onClearCategoryFilter: () => void;
  onSelectItem: (item: SipItem) => void;
  cuentaCodigo: string;
  proyectoCorto?: string;
  onExportExcel: () => void;
}

export const ProyectosDataTable: React.FC<ProyectosDataTableProps> = ({
  items,
  selectedCategoryFilter,
  onClearCategoryFilter,
  onSelectItem,
  cuentaCodigo,
  proyectoCorto,
  onExportExcel
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'fecha' | 'total_usd' | 'numero'>('fecha');
  const [sortAsc, setSortAsc] = useState(false);

  // Filter items by search term
  const filteredItems = useMemo(() => {
    let list = items;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter(it => 
        (it.numero && String(it.numero).toLowerCase().includes(q)) ||
        (it.codigo && String(it.codigo).toLowerCase().includes(q)) ||
        (it.descripcion && String(it.descripcion).toLowerCase().includes(q)) ||
        (it.motivo && String(it.motivo).toLowerCase().includes(q)) ||
        (it.solicitante && String(it.solicitante).toLowerCase().includes(q)) ||
        (it.almacen && String(it.almacen).toLowerCase().includes(q))
      );
    }

    // Sort items
    return [...list].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'total_usd') {
        comparison = (Number(a.total_usd) || 0) - (Number(b.total_usd) || 0);
      } else if (sortField === 'fecha') {
        comparison = String(a.fecha || '').localeCompare(String(b.fecha || ''));
      } else if (sortField === 'numero') {
        comparison = String(a.numero || '').localeCompare(String(b.numero || ''));
      }
      return sortAsc ? comparison : -comparison;
    });
  }, [items, searchTerm, sortField, sortAsc]);

  const handleSort = (field: 'fecha' | 'total_usd' | 'numero') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false); // Default to desc (most recent or highest first)
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden space-y-3">
      {/* Table Toolbar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
              Auditoría Detallada Línea a Línea
            </h3>
            <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
              {filteredItems.length} {filteredItems.length === 1 ? 'registro' : 'registros'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            {cuentaCodigo} {proyectoCorto ? `· ${proyectoCorto}` : ''}
          </p>
        </div>

        {/* Filter Chips & Search Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {selectedCategoryFilter !== 'todas' && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
              <span>Rubro: <strong>{selectedCategoryFilter}</strong></span>
              <button 
                onClick={onClearCategoryFilter}
                className="hover:bg-blue-200/60 p-0.5 rounded-md transition-colors cursor-pointer"
                title="Quitar filtro de rubro"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Search Input */}
          <div className="relative min-w-[260px] sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por material, comprobante, DP..."
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-2 p-0.5 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* High-density Data Table */}
      <div className="overflow-x-auto max-h-[560px] scrollbar-thin scrollbar-thumb-slate-300">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-xs text-slate-600 font-bold border-b border-slate-200 z-10 select-none">
            <tr>
              <th 
                onClick={() => handleSort('numero')}
                className="py-2.5 px-3.5 text-[11px] tracking-wider uppercase font-semibold cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Comprobante</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th 
                onClick={() => handleSort('fecha')}
                className="py-2.5 px-3 text-[11px] tracking-wider uppercase font-semibold cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Fecha</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-2.5 px-3 text-[11px] tracking-wider uppercase font-semibold">
                Código SIP
              </th>
              <th className="py-2.5 px-3 text-[11px] tracking-wider uppercase font-semibold">
                Descripción del Material o Servicio
              </th>
              <th className="py-2.5 px-3 text-[11px] tracking-wider uppercase font-semibold">
                Rubro Contable
              </th>
              <th className="py-2.5 px-3 text-[11px] tracking-wider uppercase font-semibold text-right">
                Cantidad
              </th>
              <th className="py-2.5 px-3 text-[11px] tracking-wider uppercase font-semibold text-right">
                Precio Unit.
              </th>
              <th 
                onClick={() => handleSort('total_usd')}
                className="py-2.5 px-3.5 text-[11px] tracking-wider uppercase font-semibold text-right cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Total USD</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-2.5 px-3.5 text-[11px] tracking-wider uppercase font-semibold">
                Solicitante / Almacén
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-16 text-center text-xs text-slate-400 space-y-2">
                  <FileSpreadsheet className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="font-semibold text-slate-600">No se encontraron movimientos registrados</p>
                  <p className="text-[11px] text-slate-400">Prueba con otro término de búsqueda o limpia los filtros activos.</p>
                  {(searchTerm || selectedCategoryFilter !== 'todas') && (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        onClearCategoryFilter();
                      }}
                      className="text-xs text-blue-600 font-bold hover:underline cursor-pointer pt-1"
                    >
                      Restablecer todos los filtros
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              filteredItems.slice(0, 300).map((it, idx) => {
                const macroCat = getMacroCategoriaSip(it);
                const catBadge = getMacroCategoryBadge(macroCat);
                const compBadge = getComprobanteBadge(it.numero || '');
                const precioUnit = it.precio_final || (it.cantidad ? (it.total_usd / it.cantidad) : 0);

                return (
                  <tr
                    key={`${it.id || idx}-${it.numero || ''}`}
                    onClick={() => onSelectItem(it)}
                    className="hover:bg-blue-50/50 cursor-pointer transition-colors group"
                  >
                    {/* Comprobante con badge distintivo */}
                    <td className="py-2 px-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${compBadge.bg} ${compBadge.text} ${compBadge.border}`}>
                          {compBadge.prefix}
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                          {it.numero || `SIP-${it.id}`}
                        </span>
                      </div>
                    </td>

                    {/* Fecha */}
                    <td className="py-2 px-3 font-mono text-slate-500 whitespace-nowrap text-[11px] tabular-nums">
                      {it.fecha || '-'}
                    </td>

                    {/* Código */}
                    <td className="py-2 px-3 font-mono text-slate-600 whitespace-nowrap text-[11px]">
                      {it.codigo || '-'}
                    </td>

                    {/* Descripción */}
                    <td className="py-2 px-3 text-slate-800 max-w-[280px] sm:max-w-[340px] truncate font-medium" title={it.descripcion}>
                      {it.descripcion || '-'}
                    </td>

                    {/* Categoría Macro con badge semántico */}
                    <td className="py-2 px-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${catBadge.bg} ${catBadge.text} ${catBadge.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${catBadge.dot}`} />
                        {macroCat}
                      </span>
                    </td>

                    {/* Cantidad alineada estrictamente a la derecha */}
                    <td className="py-2 px-3 font-mono text-right text-slate-700 tabular-nums">
                      {safeFormatQuantity(it.cantidad)} <span className="text-[10px] text-slate-400">{it.unidad || 'UND'}</span>
                    </td>

                    {/* Precio Unitario alineado a la derecha */}
                    <td className="py-2 px-3 font-mono text-right text-slate-600 tabular-nums">
                      {safeFormatUSD(precioUnit, true)}
                    </td>

                    {/* Total USD en negrita alineado a la derecha */}
                    <td className="py-2 px-3.5 font-mono font-bold text-right text-slate-900 tabular-nums">
                      {safeFormatUSD(it.total_usd, true)}
                    </td>

                    {/* Solicitante / Almacén */}
                    <td className="py-2 px-3.5 text-slate-600 max-w-[150px] truncate text-[11px]" title={`${it.solicitante || ''} · ${it.almacen || ''}`}>
                      <span className="block truncate font-medium text-slate-700">{it.solicitante || '-'}</span>
                      <span className="block truncate text-[10px] text-slate-400 font-mono">{it.almacen || ''}</span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Notice */}
      {filteredItems.length > 300 && (
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <span>
            Mostrando los primeros 300 movimientos de un total de {filteredItems.length.toLocaleString('de-DE')}.
          </span>
          <button
            onClick={onExportExcel}
            className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
          >
            Descargar la totalidad en Excel (.xlsx)
          </button>
        </div>
      )}
    </div>
  );
};
