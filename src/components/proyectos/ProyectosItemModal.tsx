import React from 'react';
import { X, Boxes, FileText, Calendar, User, MapPin, DollarSign, Tag, CheckCircle2 } from 'lucide-react';
import { SipItem, getMacroCategoriaSip } from '../../services/sipDataService';
import { getMacroCategoryBadge, getComprobanteBadge } from './proyectosTypes';
import { safeFormatUSD, safeFormatQuantity } from '../../utils/numericHelpers';

interface ProyectosItemModalProps {
  item: SipItem | null;
  onClose: () => void;
}

export const ProyectosItemModal: React.FC<ProyectosItemModalProps> = ({ item, onClose }) => {
  if (!item) return null;

  const macroCat = getMacroCategoriaSip(item);
  const catBadge = getMacroCategoryBadge(macroCat);
  const compBadge = getComprobanteBadge(item.numero || '');
  const precioUnitario = item.precio_final || (item.cantidad ? (item.total_usd / item.cantidad) : 0);

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold font-mono text-xs border ${compBadge.bg} ${compBadge.text} ${compBadge.border}`}>
              {compBadge.prefix}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-slate-900">
                  {item.numero || `SIP-${item.id}`}
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${compBadge.bg} ${compBadge.text} ${compBadge.border}`}>
                  {compBadge.type}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 block">
                Comprobante de imputación en base de datos SIP
              </span>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            title="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Material / Service Description */}
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Descripción del Material / Servicio
            </span>
            <p className="font-bold text-slate-900 text-sm mt-1 leading-snug">
              {item.descripcion || 'Sin descripción'}
            </p>
          </div>

          {/* Amount Card Highlight */}
          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/80 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-semibold text-blue-700 uppercase tracking-wider block">
                Total Imputado (USD)
              </span>
              <span className="font-mono text-xl font-black text-blue-900 tabular-nums">
                {safeFormatUSD(item.total_usd, true)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                Precio Unitario
              </span>
              <span className="font-mono font-bold text-slate-700 tabular-nums">
                {safeFormatUSD(precioUnitario, true)} / {item.unidad || 'UND'}
              </span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase block">Código de Material</span>
              <span className="font-mono font-bold text-slate-800 text-xs mt-0.5 block">{item.codigo || '-'}</span>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase block">Fecha Contable</span>
              <span className="font-mono font-bold text-slate-800 text-xs mt-0.5 block">{item.fecha || '-'}</span>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase block">Cantidad</span>
              <span className="font-mono font-bold text-slate-800 text-xs mt-0.5 block">
                {safeFormatQuantity(item.cantidad)} {item.unidad || 'UND'}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase block">Categoría Macro</span>
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border mt-0.5 ${catBadge.bg} ${catBadge.text} ${catBadge.border}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${catBadge.dot}`} />
                {macroCat}
              </span>
            </div>
          </div>

          {/* Motivo Registrado */}
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Motivo Textual Registrado
            </span>
            <p className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-700 font-mono text-[11px] mt-1 leading-relaxed">
              {item.motivo || 'Sin observaciones textuales en el registro'}
            </p>
          </div>

          {/* Stakeholders & Warehouse */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 block">Solicitante</span>
                <span className="font-semibold text-slate-800 truncate block text-xs">{item.solicitante || '-'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 block">Almacén / Destino</span>
                <span className="font-semibold text-slate-800 truncate block text-xs">{item.almacen || '-'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Cerrar Ficha Técnica
          </button>
        </div>
      </div>
    </div>
  );
};
