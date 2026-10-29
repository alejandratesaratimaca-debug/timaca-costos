import React from 'react';
import { Layers, CheckCircle2, ChevronRight } from 'lucide-react';
import { MacroCategoryBreakdown, getMacroCategoryBadge } from './proyectosTypes';
import { safeFormatUSD } from '../../utils/numericHelpers';

interface ProyectosCategoriasBreakdownProps {
  categorias: MacroCategoryBreakdown[];
  selectedCategoryFilter: string;
  onSelectCategory: (categoria: string) => void;
  totalProyecto: number;
  totalLineas: number;
  proyectoCorto?: string;
}

export const ProyectosCategoriasBreakdown: React.FC<ProyectosCategoriasBreakdownProps> = ({
  categorias,
  selectedCategoryFilter,
  onSelectCategory,
  totalProyecto,
  totalLineas,
  proyectoCorto
}) => {
  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
              Distribución por Rubro Contable (5 Categorías)
            </h3>
            <p className="text-[11px] text-slate-500">
              Haz clic en cualquier categoría para filtrar la auditoría línea por línea
            </p>
          </div>
        </div>

        {selectedCategoryFilter !== 'todas' && (
          <button
            onClick={() => onSelectCategory('todas')}
            className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
          >
            Ver todas
          </button>
        )}
      </div>

      {/* Categories List (Stripe / Linear horizontal progress card list) */}
      <div className="space-y-2">
        {/* "Todas las Categorías" Master Option */}
        <div
          onClick={() => onSelectCategory('todas')}
          className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
            selectedCategoryFilter === 'todas'
              ? 'border-blue-600 bg-blue-50/70 shadow-xs ring-1 ring-blue-500/30'
              : 'border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/60'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-900 shrink-0" />
            <div className="min-w-0">
              <span className="font-bold text-xs text-slate-900 block truncate">
                Total Consolidado del Proyecto
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {totalLineas} movimientos auditados
              </span>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="font-mono text-xs font-black text-slate-900 block tabular-nums">
              {safeFormatUSD(totalProyecto, false)}
            </span>
            <span className="text-[10px] font-bold text-slate-500">
              100%
            </span>
          </div>
        </div>

        {/* The 5 Macro-Categories */}
        {categorias.map((cat) => {
          const badge = getMacroCategoryBadge(cat.categoria);
          const isSelected = selectedCategoryFilter === cat.categoria;

          return (
            <div
              key={cat.categoria}
              onClick={() => onSelectCategory(cat.categoria)}
              className={`p-3 rounded-xl border cursor-pointer transition-all space-y-2 ${
                isSelected
                  ? `border-blue-600 bg-blue-50/60 shadow-xs ring-1 ring-blue-500/30 ${badge.accentBorder}`
                  : `border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/60`
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`w-2.5 h-2.5 rounded-full ${badge.dot} shrink-0`} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-slate-900 truncate">
                        {cat.categoria}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.2 rounded-full border ${badge.bg} ${badge.text} ${badge.border} hidden sm:inline-block`}>
                        {cat.count} mov.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-mono text-xs font-black text-slate-900 block tabular-nums">
                    {safeFormatUSD(cat.total, false)}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">
                    {cat.porcentaje}%
                  </span>
                </div>
              </div>

              {/* Progress bar in semantic color */}
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${badge.barColor}`}
                  style={{ width: `${Math.min(100, Math.max(3, cat.porcentaje))}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
