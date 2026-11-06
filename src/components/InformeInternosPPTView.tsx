import React, { useState } from 'react';
import { 
  FileText, 
  ChevronLeft, 
  ChevronRight, 
  Presentation, 
  Printer, 
  ArrowLeft,
  Building2,
  Truck,
  Wrench,
  TrendingUp,
  TrendingDown,
  Layers,
  Cpu,
  Clock,
  ShieldCheck,
  Info,
  Calendar,
  Sparkles,
  BarChart3,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { TimacaLogo } from './TimacaLogo';
import { 
  EVOLUTIVO_INTERNOS_2026, 
  TOTALES_ACUMULADOS_INTERNOS_2026, 
  CUENTAS_CAPEX_INTERNOS, 
  VARIACIONES_CAPEX_JUL_AGO, 
  VARIACIONES_CAPEX_AGO_SEP,
  TOP_VOCES_CAPEX_AGOSTO,
  TOP_VOCES_CAPEX_SEPTIEMBRE,
  TOP_10_EQUIPOS_OPEX_AGOSTO,
  TOP_10_EQUIPOS_OPEX_SEPTIEMBRE,
  TIPOS_EQUIPOS_OPEX_MENSUAL,
  VOCES_GASTO_OPEX_FLOTA_AGOSTO,
  VOCES_GASTO_OPEX_FLOTA_SEPTIEMBRE,
  MOD_MANTENIMIENTO_FLOTA_AGOSTO,
  MOD_MANTENIMIENTO_FLOTA_SEPTIEMBRE,
  MANTTO_INFRAESTRUCTURA_2026,
  FLOTA_GRUAS_TIMACA_2026,
  ACTIVOS_PRODUCTIVOS_CAPEX_NIC16_SEPTIEMBRE
} from '../data/proyectosInternosData';
import { EVOLUTIVO_SEMANAL_MOD_SEPTIEMBRE_2026 } from '../data/horasHombreSeptiembreData';
import { formatCurrency, formatUnitPriceRaw } from '../utils/dateHelpers';

interface InformeInternosPPTViewProps {
  onVolver?: () => void;
}

export const InformeInternosPPTView: React.FC<InformeInternosPPTViewProps> = ({ onVolver }) => {
  const [selectedMonth, setSelectedMonth] = useState<'septiembre' | 'agosto'>('septiembre');
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'diapositivas' | 'documento'>('diapositivas');

  const slidesSeptiembre = [
    { id: 'portada', title: 'Portada · Proyectos Internos Septiembre 2026' },
    { id: 'resumen', title: '1. Resumen Ejecutivo (CAPEX vs OPEX)' },
    { id: 'capex-tabla', title: '2. Proyectos Internos – CAPEX Septiembre 2026' },
    { id: 'capex-variacion', title: '3. Variación Por Proyecto – Agosto vs Septiembre 2026' },
    { id: 'capex-voces', title: '4. Top Voces de Gastos | CAPEX Obras Civiles' },
    { id: 'capex-activos', title: '5. Activos Productivos CAPEX (NIC 16)' },
    { id: 'opex-flota', title: '6. Mantto. Activos Productivos – OPEX Septiembre' },
    { id: 'opex-voces', title: '7. Top Voces de Gasto | OPEX Flota' },
    { id: 'infraestructura', title: '8. Mantto. Infraestructura – OPEX Septiembre' },
    { id: 'gruas', title: '9. Detalle Grúas con Mayor Variación' },
    { id: 'opex-mod', title: '10. OPEX: Mano de Obra Directa ECO (5.963 HH)' }
  ];

  const slidesAgosto = [
    { id: 'portada', title: 'Portada · Proyectos Internos Agosto 2026' },
    { id: 'resumen', title: '1. Resumen Ejecutivo (CAPEX vs OPEX)' },
    { id: 'capex-tabla', title: '2. Proyectos Internos – CAPEX Agosto 2026' },
    { id: 'capex-variacion', title: '3. Variación Por Proyecto – Julio vs Agosto 2026' },
    { id: 'capex-voces', title: '4. Top Voces de Gastos | CAPEX' },
    { id: 'opex-flota', title: '5. Mantto. Activos Productivos – OPEX Agosto' },
    { id: 'opex-voces', title: '6. Top Voces de Gasto | OPEX Flota' },
    { id: 'opex-mod', title: '7. OPEX: Mano de Obra Directa (4.697 HH)' },
    { id: 'infraestructura', title: '8. Mantto. Infraestructura – OPEX Agosto' },
    { id: 'gruas', title: '9. Mantto. Grúas – Flota de 26 Grúas TIMACA' }
  ];

  const slides = selectedMonth === 'septiembre' ? slidesSeptiembre : slidesAgosto;

  const handleMonthChange = (month: 'septiembre' | 'agosto') => {
    setSelectedMonth(month);
    setCurrentSlide(0);
  };

  return (
    <div className="space-y-5 animate-fade-in text-slate-800">
      
      {/* Barra de Control de la Presentación */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-xl border border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onVolver && (
            <button
              onClick={onVolver}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700"
              title="Volver al Tablero"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs text-sky-400 font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Dossier Ejecutivo Oficial · TIMACA 2026</span>
            </div>
            <h2 className="text-lg font-black text-white tracking-tight">
              Informe Gestión de Costos — Proyectos Internos ({selectedMonth === 'septiembre' ? 'Septiembre 2026' : 'Agosto 2026'})
            </h2>
          </div>
        </div>

        {/* Controles: Selector de Mes, Modos y Exportar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Selector de Mes */}
          <div className="bg-slate-800 p-1 rounded-xl border border-slate-700 flex items-center text-xs">
            <button
              onClick={() => handleMonthChange('septiembre')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                selectedMonth === 'septiembre' ? 'bg-sky-500 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Septiembre 2026
            </button>
            <button
              onClick={() => handleMonthChange('agosto')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                selectedMonth === 'agosto' ? 'bg-sky-500 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Agosto 2026
            </button>
          </div>

          <div className="bg-slate-800 p-1 rounded-xl border border-slate-700 flex items-center text-xs">
            <button
              onClick={() => setViewMode('diapositivas')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'diapositivas' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Presentation className="w-3.5 h-3.5" />
              <span>Diapositivas</span>
            </button>
            <button
              onClick={() => setViewMode('documento')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'documento' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Documento</span>
            </button>
          </div>

          <button
            onClick={() => window.print()}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 cursor-pointer"
            title="Imprimir / Exportar a PDF"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Selector Rápido de Lámina */}
      {viewMode === 'diapositivas' && (
        <div className="bg-white/95 rounded-2xl p-2.5 border border-slate-300/80 shadow-xs flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentSlide(idx)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                currentSlide === idx
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {idx === 0 ? 'Portada' : `Lámina ${idx}`}
            </button>
          ))}
        </div>
      )}

      {/* ===================== CONTENEDOR DE LA DIAPOSITIVA ===================== */}
      <div className="bg-white rounded-3xl border border-slate-300 shadow-xl overflow-hidden min-h-[640px] flex flex-col justify-between p-6 sm:p-10 relative">
        
        {/* ========================================================================= */}
        {/* SECCIÓN SEPTIEMBRE 2026 */}
        {/* ========================================================================= */}
        {selectedMonth === 'septiembre' ? (
          <>
            {/* LÁMINA 0: PORTADA SEPTIEMBRE 2026 */}
            {currentSlide === 0 && (
              <div className="my-auto text-center space-y-8 max-w-4xl mx-auto py-8">
                <div className="flex justify-center">
                  <TimacaLogo size="lg" />
                </div>

                <div className="space-y-3">
                  <div className="inline-block px-4 py-1.5 rounded-full bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs uppercase tracking-widest font-mono">
                    TALLER INDUSTRIAL METALÚRGICO ANTONIO, C.A. · RIF: J-09500315-9
                  </div>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight uppercase leading-tight">
                    INFORME GESTIÓN DE COSTOS
                  </h1>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-sky-700 tracking-wider uppercase">
                    PROYECTOS INTERNOS
                  </h2>
                  <div className="text-lg font-bold text-slate-500 uppercase tracking-widest pt-2">
                    SEPTIEMBRE 2026
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 max-w-2xl mx-auto text-xs text-slate-600 leading-relaxed font-medium">
                  Consolidación de inversiones en obras civiles, galpones y patios (CAPEX), incorporación de Activos Productivos bajo NIC 16 ($28,3K USD), junto al programa integral de mantenimiento de flota operativa (OPEX) y 5.963 Horas Hombre ejecutadas.
                </div>

                <div className="pt-4 flex items-center justify-center gap-2 text-xs font-mono text-slate-400">
                  <span>Elaborado por:</span>
                  <strong className="text-slate-800 font-bold">Daniela Rivero · Analista de Costos TIMACA</strong>
                </div>
              </div>
            )}

            {/* LÁMINA 1: RESUMEN EJECUTIVO SEPTIEMBRE 2026 */}
            {currentSlide === 1 && (
              <div className="space-y-6 my-auto">
                <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                      Resumen Ejecutivo – Septiembre 2026
                    </h2>
                    <p className="text-xs text-slate-500">
                      Consolidación macro de desembolsos en Planta: CAPEX vs OPEX y reclasificación NIC 16.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold bg-slate-100 px-3 py-1 rounded-lg text-slate-700">
                    Lámina 1
                  </span>
                </div>

                {/* Tarjetas Principales Septiembre (Exactas de la Hoja General) */}
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 text-center">
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Proyectos Internos (CAPEX)</div>
                    <div className="text-xl font-black text-slate-900 font-mono mt-1">$34.995</div>
                    <div className="text-[10px] text-emerald-600 font-bold mt-1">20,4% del total</div>
                  </div>
                  <div className="p-3 rounded-xl border border-sky-300 bg-sky-50/70">
                    <div className="text-[10px] font-bold text-sky-800 uppercase">Activos Prod. (CAPEX)</div>
                    <div className="text-xl font-black text-sky-900 font-mono mt-1">$28.329</div>
                    <div className="text-[10px] text-sky-700 font-bold mt-1">16,5% del total</div>
                  </div>
                  <div className="p-3 rounded-xl border border-indigo-700 bg-indigo-900 text-white shadow-sm">
                    <div className="text-[10px] font-bold text-indigo-200 uppercase">TOTAL INVERSIONES CAPEX</div>
                    <div className="text-xl font-black text-amber-300 font-mono mt-1">$63.324</div>
                    <div className="text-[10px] text-emerald-400 font-bold mt-1">▲ 118% vs Agosto ($29.017)</div>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Mantto. Activos Prod (OPEX)</div>
                    <div className="text-xl font-black text-slate-900 font-mono mt-1">$65.757</div>
                    <div className="text-[10px] text-blue-600 font-bold mt-1">▼ 42% vs Agosto ($113.450)</div>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Mantto. Infraestructura (OPEX)</div>
                    <div className="text-xl font-black text-slate-900 font-mono mt-1">$42.819</div>
                    <div className="text-[10px] text-emerald-600 font-bold mt-1">▲ 6% vs Agosto ($40.545)</div>
                  </div>
                  <div className="p-3 rounded-xl border border-amber-400 bg-amber-50 text-amber-950">
                    <div className="text-[10px] font-bold text-amber-800 uppercase">TOTAL SEPTIEMBRE (CAPEX+OPEX)</div>
                    <div className="text-xl font-black text-amber-950 font-mono mt-1">$171.900</div>
                    <div className="text-[10px] text-amber-800 font-bold mt-1">Acum 2026: $2.187.455</div>
                  </div>
                </div>

                {/* Nota Ejecutiva Septiembre */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed font-medium">
                  <strong>• Resumen Ejecutivo de Variaciones:</strong> El incremento de +118% en CAPEX total ($63,2K USD) responde a la capitalización de <strong>$28,3K USD en Activos Productivos bajo NIC 16</strong> (overhauls mayores de Grúa Puente GP02, camión lubricador CA06 y chutos pesados), absorbiendo el 60% de la disminución del gasto de flota en OPEX ($65,7K USD).
                </div>

                {/* Tabla Comparativa Mensual Ene-Sep */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-slate-800 text-white font-bold">
                        <th className="py-2.5 px-3 rounded-l-lg">Descripción</th>
                        <th className="py-2.5 px-2 text-right">Ene</th>
                        <th className="py-2.5 px-2 text-right">Feb</th>
                        <th className="py-2.5 px-2 text-right">Mar</th>
                        <th className="py-2.5 px-2 text-right">Abr</th>
                        <th className="py-2.5 px-2 text-right">May</th>
                        <th className="py-2.5 px-2 text-right">Jun</th>
                        <th className="py-2.5 px-2 text-right">Jul</th>
                        <th className="py-2.5 px-2 text-right">Ago</th>
                        <th className="py-2.5 px-2 text-right bg-sky-900 text-sky-200">Sep</th>
                        <th className="py-2.5 px-3 text-right rounded-r-lg font-mono">Total 2026 ($)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      <tr>
                        <td className="py-2 px-3 font-bold text-slate-800">Proyectos Internos (CAPEX Base)</td>
                        <td className="py-2 px-2 text-right font-mono">$162.467</td>
                        <td className="py-2 px-2 text-right font-mono">$326.380</td>
                        <td className="py-2 px-2 text-right font-mono">$149.039</td>
                        <td className="py-2 px-2 text-right font-mono">$92.865</td>
                        <td className="py-2 px-2 text-right font-mono">$77.901</td>
                        <td className="py-2 px-2 text-right font-mono">$32.585</td>
                        <td className="py-2 px-2 text-right font-mono">$45.087</td>
                        <td className="py-2 px-2 text-right font-mono">$29.017</td>
                        <td className="py-2 px-2 text-right font-mono font-bold bg-sky-50 text-sky-900">$34.995</td>
                        <td className="py-2 px-3 text-right font-mono font-black text-slate-900">$950.271</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-bold text-slate-800">Mantto. Activos Productivos (OPEX)</td>
                        <td className="py-2 px-2 text-right font-mono">$143.581</td>
                        <td className="py-2 px-2 text-right font-mono">$102.274</td>
                        <td className="py-2 px-2 text-right font-mono">$83.194</td>
                        <td className="py-2 px-2 text-right font-mono">$59.543</td>
                        <td className="py-2 px-2 text-right font-mono">$68.409</td>
                        <td className="py-2 px-2 text-right font-mono">$72.213</td>
                        <td className="py-2 px-2 text-right font-mono">$97.727</td>
                        <td className="py-2 px-2 text-right font-mono">$113.450</td>
                        <td className="py-2 px-2 text-right font-mono font-bold bg-indigo-50 text-indigo-900">$65.757</td>
                        <td className="py-2 px-3 text-right font-mono font-black text-slate-900">$806.126</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-bold text-slate-800">Mantto. Infraestructura (OPEX)</td>
                        <td className="py-2 px-2 text-right font-mono">$145.197</td>
                        <td className="py-2 px-2 text-right font-mono">$50.329</td>
                        <td className="py-2 px-2 text-right font-mono">$20.149</td>
                        <td className="py-2 px-2 text-right font-mono">$25.926</td>
                        <td className="py-2 px-2 text-right font-mono">$20.031</td>
                        <td className="py-2 px-2 text-right font-mono">$15.748</td>
                        <td className="py-2 px-2 text-right font-mono">$41.898</td>
                        <td className="py-2 px-2 text-right font-mono">$40.545</td>
                        <td className="py-2 px-2 text-right font-mono font-bold bg-teal-50 text-teal-900">$40.545</td>
                        <td className="py-2 px-3 text-right font-mono font-black text-slate-900">$400.368</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-bold text-slate-800">Gastos Administrativos (ADMON)</td>
                        <td className="py-2 px-2 text-right font-mono">$63.209</td>
                        <td className="py-2 px-2 text-right font-mono">$28.720</td>
                        <td className="py-2 px-2 text-right font-mono">$86.208</td>
                        <td className="py-2 px-2 text-right font-mono">$28.640</td>
                        <td className="py-2 px-2 text-right font-mono">$67.895</td>
                        <td className="py-2 px-2 text-right font-mono">$37.742</td>
                        <td className="py-2 px-2 text-right font-mono">$40.086</td>
                        <td className="py-2 px-2 text-right font-mono">$53.325</td>
                        <td className="py-2 px-2 text-right font-mono font-bold bg-purple-50 text-purple-900">$31.340</td>
                        <td className="py-2 px-3 text-right font-mono font-black text-slate-900">$437.165</td>
                      </tr>
                      <tr className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-300">
                        <td className="py-2.5 px-3">Total Consolidado con ADMON</td>
                        <td className="py-2.5 px-2 text-right font-mono">$514.453</td>
                        <td className="py-2.5 px-2 text-right font-mono">$507.703</td>
                        <td className="py-2.5 px-2 text-right font-mono">$338.590</td>
                        <td className="py-2.5 px-2 text-right font-mono">$206.974</td>
                        <td className="py-2.5 px-2 text-right font-mono">$234.236</td>
                        <td className="py-2.5 px-2 text-right font-mono">$158.288</td>
                        <td className="py-2.5 px-2 text-right font-mono">$224.798</td>
                        <td className="py-2.5 px-2 text-right font-mono">$236.338</td>
                        <td className="py-2.5 px-2 text-right font-mono bg-slate-200 text-sky-950 font-extrabold">$171.900</td>
                        <td className="py-2.5 px-3 text-right font-mono text-sky-950 font-extrabold">$2.187.455</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Evolutivo Gráfico Ene-Sep */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <BarChart3 className="w-3.5 h-3.5 text-sky-600" />
                      <span>Evolutivo Mensual Ene - Sep 2026 ($ USD)</span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-500 font-bold">Total Acumulado: $2.613K USD</span>
                  </div>

                  <div className="grid grid-cols-9 gap-2 items-end h-36 pt-4 pb-2 px-1 border-b border-slate-200">
                    {EVOLUTIVO_INTERNOS_2026.map((m, idx) => {
                      const maxVal = 520000;
                      const hTot = (m.totalConAdmon || m.totalGeneral) / maxVal * 110;
                      const isSep = idx === 8;

                      return (
                        <div key={m.mesCorto} className="flex flex-col items-center h-full justify-end group">
                          <span className={`text-[10px] font-mono font-bold mb-1 ${isSep ? 'text-sky-900 font-black' : 'text-slate-500'}`}>
                            ${Math.round((m.totalConAdmon || m.totalGeneral) / 1000)}k
                          </span>
                          <div 
                            style={{ height: `${hTot}px` }} 
                            className={`w-full max-w-[28px] rounded-t-md transition-all ${
                              isSep ? 'bg-sky-600 shadow-md ring-2 ring-sky-400' : 'bg-slate-300'
                            }`}
                            title={`${m.mesLabel}: $${(m.totalConAdmon || m.totalGeneral).toLocaleString()}`}
                          />
                          <span className={`text-[11px] font-bold mt-1.5 ${isSep ? 'text-sky-900 bg-sky-100 px-1.5 py-0.2 rounded font-black' : 'text-slate-600'}`}>
                            {m.mesCorto}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* LÁMINA 2: PROYECTOS INTERNOS CAPEX SEPTIEMBRE */}
            {currentSlide === 2 && (
              <div className="space-y-5 my-auto">
                <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                      Proyectos Internos – CAPEX Septiembre 2026
                    </h2>
                    <p className="text-xs text-slate-500">
                      Desglose mensual de las 12 cuentas auxiliares de inversión en planta y obras civiles.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold bg-slate-100 px-3 py-1 rounded-lg text-slate-700">
                    Lámina 2
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Total Septiembre</div>
                    <div className="text-xl font-black text-slate-900 font-mono mt-0.5">$34.995</div>
                    <div className="text-[10px] text-rose-600 font-bold">▲ 20% vs Agosto ($29.017)</div>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Total Acumulado 2026</div>
                    <div className="text-xl font-black text-slate-900 font-mono mt-0.5">$950.271</div>
                    <div className="text-[10px] text-slate-500 font-medium">Enero - Septiembre 2026</div>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Proyecto con Mayor Gasto</div>
                    <div className="text-xl font-black text-sky-800 font-mono mt-0.5">TSI-T-0108 ($13.498)</div>
                    <div className="text-[10px] text-rose-600 font-bold">Galpones Cant. 04 (38.6%)</div>
                  </div>
                </div>

                <div className="overflow-x-auto max-h-[380px] scrollbar-thin">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-slate-800 text-white font-bold sticky top-0">
                        <th className="py-2 px-2.5">Cuenta Auxiliar</th>
                        <th className="py-2 px-2.5">Proyecto</th>
                        <th className="py-2 px-2 text-right">Jul</th>
                        <th className="py-2 px-2 text-right">Ago</th>
                        <th className="py-2 px-2 text-right bg-sky-900 text-sky-200">Sep</th>
                        <th className="py-2 px-2.5 text-right font-mono">Total 2026</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {CUENTAS_CAPEX_INTERNOS.map((c) => (
                        <tr key={c.cuentaAuxiliar} className="hover:bg-slate-50">
                          <td className="py-1.5 px-2.5 font-mono font-bold text-sky-800">{c.cuentaAuxiliar}</td>
                          <td className="py-1.5 px-2.5 font-bold text-slate-800 truncate max-w-[280px]" title={c.proyecto}>{c.proyecto}</td>
                          <td className="py-1.5 px-2 text-right font-mono text-slate-600">{c.jul > 0 ? formatCurrency(c.jul) : '-'}</td>
                          <td className="py-1.5 px-2 text-right font-mono text-slate-600">{c.ago > 0 ? formatCurrency(c.ago) : '-'}</td>
                          <td className="py-1.5 px-2 text-right font-mono font-bold bg-sky-50 text-sky-900">{c.sep > 0 ? formatCurrency(c.sep) : '-'}</td>
                          <td className="py-1.5 px-2.5 text-right font-mono font-black text-slate-900">{formatCurrency(c.total2026)}</td>
                        </tr>
                      ))}
                      <tr className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-300">
                        <td colSpan={2} className="py-2 px-2.5">Total CAPEX Obras Civiles</td>
                        <td className="py-2 px-2 text-right font-mono">$45.087</td>
                        <td className="py-2 px-2 text-right font-mono">$29.017</td>
                        <td className="py-2 px-2 text-right font-mono bg-sky-100 text-sky-900 font-bold">$34.995</td>
                        <td className="py-2 px-2.5 text-right font-mono text-sky-950 font-extrabold">$950.271</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* LÁMINA 3: VARIACIÓN POR PROYECTO CAPEX (AGOSTO VS SEPTIEMBRE) */}
            {currentSlide === 3 && (
              <div className="space-y-6 my-auto">
                <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                      Variación Por Proyecto – Agosto vs Septiembre 2026
                    </h2>
                    <p className="text-xs text-slate-500">
                      Causas técnicas de incrementos y disminuciones en las 5 obras civiles principales.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold bg-slate-100 px-3 py-1 rounded-lg text-slate-700">
                    Lámina 3
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {VARIACIONES_CAPEX_AGO_SEP.map((v) => (
                    <div key={v.cuenta} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-mono font-bold text-slate-500">{v.cuenta}</span>
                          <span className={`text-sm font-black flex items-center gap-0.5 ${v.esSubida ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {v.esSubida ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                            {v.porcentaje}
                          </span>
                        </div>
                        <h3 className="font-extrabold text-sm text-slate-900">{v.proyecto}</h3>
                        <div className="text-2xl font-black text-slate-900 font-mono mt-1">
                          {formatCurrency(v.actual)}
                        </div>
                        <div className="text-xs text-slate-500 font-mono">Agosto: {formatCurrency(v.anterior)}</div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-700 leading-relaxed italic">
                        "{v.explicacion}"
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* LÁMINA 4: TOP VOCES DE GASTO CAPEX OBRAS CIVILES */}
            {currentSlide === 4 && (
              <div className="space-y-6 my-auto">
                <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                      Top Voces de Gastos | Costos Proyectos Internos (CAPEX) Septiembre 2026
                    </h2>
                    <p className="text-xs text-slate-500">
                      Desglose por proyecto de las compras de perfiles estructurales, electricidad y acabados civiles.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold bg-slate-100 px-3 py-1 rounded-lg text-slate-700">
                    Lámina 4
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Matriz y Gráfica de Voces de Gasto</h3>
                    <div className="space-y-2.5">
                      {TOP_VOCES_CAPEX_SEPTIEMBRE.map((v) => {
                        const pct = Math.round((v.monto / 34930.08) * 1000) / 10;
                        return (
                          <div key={v.rubro} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 shadow-2xs">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-xs font-bold text-slate-800">{v.rubro}</div>
                                <div className="text-[10px] text-sky-700 font-medium">{v.categoria}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-black text-slate-900 font-mono">{formatCurrency(v.monto)}</div>
                                <div className="text-[10px] text-sky-600 font-bold">{pct}%</div>
                              </div>
                            </div>
                            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                              <div style={{ width: `${pct}%` }} className="h-full bg-sky-600 rounded-full transition-all" />
                            </div>
                          </div>
                        );
                      })}
                      <div className="p-3 rounded-xl bg-slate-800 text-white flex items-center justify-between font-bold text-xs">
                        <span>TOTAL CAPEX OBRAS CIVILES</span>
                        <span className="font-mono text-amber-300 text-sm">$34.995,08 (100%)</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Detalle de las Principales Voces de Gasto</h3>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-3 leading-relaxed">
                      <p><strong>• CONSTRUCCIÓN GALPONES ($13.498,06 USD - 38.6%):</strong> Perfiles estructurales, tubos de 140x60 y 100x100, planchas de anclaje ASTM A-36, pintura anticorrosiva y consumibles de soldadura para cierre de los 4 galpones.</p>
                      <p><strong>• ADECUACIÓN PATIO EXTERNO ($9.050,80 USD - 25.9%):</strong> Canalizaciones eléctricas para postes de alumbrado, reflectores LED de alta potencia, cemento Portland y materiales de ferretería.</p>
                      <p><strong>• EDIFICIO ADMINISTRATIVO ($6.617,15 USD - 18.9%):</strong> Materiales de acabado civil, cableado eléctrico, breakers termomagnéticos, tuberías y pintura para pasillos y oficinas.</p>
                      <p><strong>• BANCO DE PRUEBAS MOTORES 440V ($3.759,16 USD - 10.8%):</strong> Componentes eléctricos de potencia y control, contactores, transformadores de mando y servicio técnico especializado.</p>
                      <p><strong>• GRÚAS TORRES LIEBHERR ($1.951,95 USD - 5.6%):</strong> Servicios de reacondicionamiento técnico ($1.030 USD) y repuestos mecánicos/eléctricos ($922 USD).</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* LÁMINA 5: ACTIVOS PRODUCTIVOS CAPEX (NIC 16) */}
            {currentSlide === 5 && (
              <div className="space-y-5 my-auto">
                <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                      Activos Productivos CAPEX – Reclasificación NIC 16 (Septiembre 2026)
                    </h2>
                    <p className="text-xs text-slate-500">
                      Total Capitalizado: $28.328,84 USD · 5 Activos Estratégicos con Overhauls Mayores de Vida Útil.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold bg-sky-100 text-sky-800 px-3 py-1 rounded-lg">
                    Lámina 5 (NIC 16)
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-900 leading-relaxed font-medium">
                  <strong>• Fundamento Normativo NIC 16:</strong> Se capitalizan erogaciones por overhauls y reemplazo de componentes mayores que aumentan la vida útil operativa de los activos productivos de TIMACA, absorbiendo el 60% de la disminución en el gasto de mantenimiento de flota.
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {ACTIVOS_PRODUCTIVOS_CAPEX_NIC16_SEPTIEMBRE.equipos.map((eq) => (
                    <div key={eq.codigo} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 flex flex-col justify-between shadow-2xs">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-black text-sky-800 bg-sky-100 px-2 py-0.5 rounded">{eq.codigo}</span>
                          <span className="font-mono text-sm font-black text-slate-900">{formatCurrency(eq.montoUsd)}</span>
                        </div>
                        <h3 className="font-bold text-xs text-slate-900 mt-1">{eq.nombre}</h3>
                        <span className="text-[10px] text-slate-500 font-semibold">{eq.tipo}</span>
                        <p className="text-[11px] text-slate-700 mt-2 leading-relaxed">
                          <strong>Intervención:</strong> {eq.intervencionMayor}
                        </p>
                      </div>
                      <div className="pt-2 border-t border-slate-200 text-[10px] text-sky-800 font-medium italic">
                        {eq.criterioNIC16}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* LÁMINA 6: MANTTO ACTIVOS PRODUCTIVOS OPEX SEPTIEMBRE */}
            {currentSlide === 6 && (
              <div className="space-y-5 my-auto">
                <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                      Mantto. Activos Productivos – OPEX Septiembre 2026
                    </h2>
                    <p className="text-xs text-slate-500">
                      Total Septiembre: $65.757,04 USD (▼ 42% vs Agosto $113.450 USD) | Absorción del 60% por reclasificación CAPEX NIC 16.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold bg-slate-100 px-3 py-1 rounded-lg text-slate-700">
                    Lámina 6
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed font-medium">
                  <strong>• Causa de la Disminución:</strong> El mantenimiento de flota bajó de $113,4K a $65,7K USD (-42%). El 60% de esta reducción se debió a la capitalización de $28,3K USD bajo NIC 16 a CAPEX, junto a una normalización en compras mayores de cauchos y repuestos correctivos pesados frente al mes anterior.
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Top Equipos OPEX Septiembre */}
                  <div className="lg:col-span-5 space-y-2">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                      <span>Ranking Equipos Móviles OPEX</span>
                      <span className="font-mono text-indigo-700 font-bold">Líder GR23 / GR13</span>
                    </h3>
                    <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                      {TOP_10_EQUIPOS_OPEX_SEPTIEMBRE.slice(0, 8).map((eq, i) => (
                        <div key={eq.codigo} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 shadow-2xs">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="font-mono text-[11px] font-black px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-800">
                                #{i + 1} {eq.codigo}
                              </span>
                              <span className="truncate max-w-[150px] font-bold text-slate-800" title={eq.nombre}>{eq.nombre}</span>
                            </div>
                            <div className="text-right font-mono font-black text-slate-900 shrink-0">
                              {formatCurrency(eq.montoSeptiembre)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tabla Familias OPEX Septiembre */}
                  <div className="lg:col-span-7 space-y-2">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Desglose por Tipo de Equipo (Ene - Sep)</h3>
                    <div className="overflow-x-auto max-h-[360px] overflow-y-auto">
                      <table className="w-full text-[11px] text-left">
                        <thead>
                          <tr className="bg-slate-800 text-white font-bold sticky top-0">
                            <th className="py-2 px-2.5">Tipo</th>
                            <th className="py-2 px-1 text-right">Jul</th>
                            <th className="py-2 px-1 text-right">Ago</th>
                            <th className="py-2 px-1 text-right bg-indigo-900 text-indigo-200">Sep</th>
                            <th className="py-2 px-2 text-right">Total 2026</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {TIPOS_EQUIPOS_OPEX_MENSUAL.slice(0, 8).map((t) => (
                            <tr key={t.tipo} className="hover:bg-slate-50">
                              <td className="py-1.5 px-2.5 font-bold text-slate-800">{t.tipo}</td>
                              <td className="py-1.5 px-1 text-right font-mono text-slate-500">${Math.round(t.jul / 1000)}k</td>
                              <td className="py-1.5 px-1 text-right font-mono text-slate-500">${Math.round(t.ago / 1000)}k</td>
                              <td className="py-1.5 px-1 text-right font-mono font-bold bg-indigo-50 text-indigo-900">${Math.round(t.sep / 1000)}k</td>
                              <td className="py-1.5 px-2 text-right font-mono font-black text-slate-900">{formatCurrency(t.total)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* LÁMINA 7: TOP VOCES DE GASTO OPEX FLOTA SEPTIEMBRE */}
            {currentSlide === 7 && (
              <div className="space-y-6 my-auto">
                <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                      Top Voces de Gasto | Mantto. Activos Productivos (OPEX) Septiembre 2026
                    </h2>
                    <p className="text-xs text-slate-500">
                      Desglose de compras de repuestos de tren motriz, cauchos, lubricantes y mecanizados.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold bg-slate-100 px-3 py-1 rounded-lg text-slate-700">
                    Lámina 7
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                    {VOCES_GASTO_OPEX_FLOTA_SEPTIEMBRE.map((v) => {
                      const maxVoz = 19412.5;
                      const barWidth = Math.max(8, Math.round((v.monto / maxVoz) * 100));

                      return (
                        <div key={v.rubro} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 shadow-2xs">
                          <div className="flex items-center justify-between text-xs">
                            <div>
                              <div className="font-bold text-slate-900">{v.rubro}</div>
                              <div className="text-[10px] text-slate-500 font-medium">{v.grupo}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-black text-slate-900 font-mono">{formatCurrency(v.monto)}</div>
                            </div>
                          </div>
                          <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                            <div style={{ width: `${barWidth}%` }} className="h-full bg-indigo-600 rounded-full transition-all" />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2.5 leading-relaxed overflow-y-auto max-h-[380px]">
                    <h3 className="font-bold text-slate-900 uppercase">Detalle de las Principales Voces de Gasto</h3>
                    <p>• <strong>REP. Y ACC TREN MOTRIZ ($19,4K USD):</strong> Cubos mozo para retroexcavadora Case RE01 ($2.300 USD), componentes de embrague y repuestos de transmisión.</p>
                    <p>• <strong>CAUCHOS Y TRIPAS ($14,3K USD):</strong> Caucho 29.5R25 para Grúa GR13 ($4.500 USD), cauchos radiales 16.00R25 para Grúa GR24 ($3.600 USD) y reposición en flota pesada.</p>
                    <p>• <strong>MATERIALES HIDRONEUMÁTICOS Y MECÁNICOS ($11,9K USD):</strong> Bomba hidráulica de freno Hyundai PA01 ($2.072 USD), mangueras de alta presión, acoples y sellos.</p>
                    <p>• <strong>SERVICIOS DE MECANIZADO Y SELLOS ($16,1K USD):</strong> Mecanizado de vástago telescópico Grúa 400TN GR23 ($9.000 USD), cromado de vástagos en Grúa GR25 ($2.000 USD) y fabricación de sellos hidráulicos ($5.101 USD).</p>
                    <p>• <strong>ACEITE HIDRÁULICO Y LUBRICANTES ($6,3K USD):</strong> Aceite ISO 68 para grúas GR17 y GR24 ($1,3K USD) y aceite de motor para camiones y buses.</p>
                  </div>
                </div>
              </div>
            )}

            {/* LÁMINA 8: MANTTO INFRAESTRUCTURA SEPTIEMBRE */}
            {currentSlide === 8 && (
              <div className="space-y-5 my-auto">
                <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                      Mantto. Infraestructura – OPEX Septiembre 2026
                    </h2>
                    <p className="text-xs text-slate-500">
                      Total Septiembre: $42.818,77 USD | Acumulado 2026: $402.641,72 USD.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold bg-slate-100 px-3 py-1 rounded-lg text-slate-700">
                    Lámina 8
                  </span>
                </div>

                {/* Tabla de Cuentas */}
                <div className="overflow-x-auto max-h-[300px]">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-slate-800 text-white font-bold sticky top-0">
                        <th className="py-2 px-2.5">Cuenta Auxiliar</th>
                        <th className="py-2 px-2.5">Proyecto / Galpón</th>
                        <th className="py-2 px-2 text-right">Julio</th>
                        <th className="py-2 px-2 text-right">Agosto</th>
                        <th className="py-2 px-2 text-right bg-teal-900 text-teal-200">Septiembre</th>
                        <th className="py-2 px-2.5 text-right font-mono">Total 2026</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {MANTTO_INFRAESTRUCTURA_2026.cuentas.map((c) => (
                        <tr key={c.cuenta} className="hover:bg-slate-50">
                          <td className="py-1.5 px-2.5 font-mono font-bold text-teal-800">{c.cuenta}</td>
                          <td className="py-1.5 px-2.5 font-bold text-slate-800 truncate max-w-[220px]" title={c.descripcion}>{c.descripcion}</td>
                          <td className="py-1.5 px-2 text-right font-mono text-slate-600">{formatCurrency(c.jul)}</td>
                          <td className="py-1.5 px-2 text-right font-mono text-slate-600">{formatCurrency(c.ago)}</td>
                          <td className="py-1.5 px-2 text-right font-mono font-bold bg-teal-50 text-teal-900">{formatCurrency(c.sep)}</td>
                          <td className="py-1.5 px-2.5 text-right font-mono font-black text-slate-900">{formatCurrency(c.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* NOTA AL PIE CORRIDA DE 2 LÍNEAS (EXACTA DE DANIELA) */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1.5 leading-relaxed">
                  <p>
                    <strong>• Incrementos: TT-A-C-207:</strong> materiales eléctricos para armado de extensiones 220V y cable soldador para almacén (1,6K USD) y reparación de esmeriles (410 USD), <strong>TT-G-C-032:</strong> tubos estructurales para oficinas y vestidores de fabricación (2,3K USD) y guaya para grúa GP02 (552 USD) <strong>• Disminuciones: EE-H-C-015:</strong> disminuyó tras el servicio de fabricación de sellos hidráulicos para martillo (900 USD) y electrodos de níquel para reparación de punta de eje (800 USD) en agosto, quedando en septiembre 555 USD en electrodos de níquel y acoples neumáticos, <strong>TT-A-C-208:</strong> disminuyó tras compra de reflectores LED de patio en agosto (462 USD), quedando en el mes actual 586 USD en cable UTP para alarma de almacén.
                  </p>
                </div>
              </div>
            )}

            {/* LÁMINA 9: DETALLE GRÚAS CON MAYOR VARIACIÓN SEPTIEMBRE */}
            {currentSlide === 9 && (
              <div className="space-y-5 my-auto">
                <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                      Detalle Grúas con Mayor Variación – Septiembre 2026
                    </h2>
                    <p className="text-xs text-slate-500">
                      Flota de 26 Grúas TIMACA · Análisis de variaciones agosto vs septiembre.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold bg-slate-100 px-3 py-1 rounded-lg text-slate-700">
                    Lámina 9
                  </span>
                </div>

                {/* Tabla de 6 Grúas con Mayor Variación */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-slate-800 text-white font-bold">
                        <th className="py-2.5 px-3 rounded-l-lg">Cta Auxiliar</th>
                        <th className="py-2.5 px-3">Proyecto / Grúa</th>
                        <th className="py-2.5 px-2 text-right">Ene</th>
                        <th className="py-2.5 px-2 text-right">Feb</th>
                        <th className="py-2.5 px-2 text-right">Abr</th>
                        <th className="py-2.5 px-2 text-right">May</th>
                        <th className="py-2.5 px-2 text-right">Jun</th>
                        <th className="py-2.5 px-2 text-right">Jul</th>
                        <th className="py-2.5 px-2 text-right">Ago</th>
                        <th className="py-2.5 px-2 text-right bg-sky-900 text-sky-200">Sep</th>
                        <th className="py-2.5 px-3 text-right rounded-r-lg font-mono">Variación</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {FLOTA_GRUAS_TIMACA_2026.detalleGruasMayorVariacion.map((g) => (
                        <tr key={g.codigo} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-mono font-bold text-sky-800">{g.codigo}</td>
                          <td className="py-2 px-3 font-bold text-slate-800 truncate max-w-[240px]" title={g.proyecto}>{g.proyecto}</td>
                          <td className="py-2 px-2 text-right font-mono text-slate-500">{g.ene > 0 ? formatCurrency(g.ene) : '-'}</td>
                          <td className="py-2 px-2 text-right font-mono text-slate-500">{g.feb > 0 ? formatCurrency(g.feb) : '-'}</td>
                          <td className="py-2 px-2 text-right font-mono text-slate-500">{g.abr > 0 ? formatCurrency(g.abr) : '-'}</td>
                          <td className="py-2 px-2 text-right font-mono text-slate-500">{g.may > 0 ? formatCurrency(g.may) : '-'}</td>
                          <td className="py-2 px-2 text-right font-mono text-slate-500">{g.jun > 0 ? formatCurrency(g.jun) : '-'}</td>
                          <td className="py-2 px-2 text-right font-mono text-slate-500">{g.jul > 0 ? formatCurrency(g.jul) : '-'}</td>
                          <td className="py-2 px-2 text-right font-mono text-slate-500">{g.ago > 0 ? formatCurrency(g.ago) : '-'}</td>
                          <td className="py-2 px-2 text-right font-mono font-bold bg-sky-50 text-sky-900">{formatCurrency(g.sep)}</td>
                          <td className={`py-2 px-3 text-right font-mono font-bold ${g.variacion.includes('▲') ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {g.variacion}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* NOTA AL PIE CORRIDA DE GRÚAS (EXACTA DE DANIELA) */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed font-medium">
                  <strong>Subieron: GR13 y GR24:</strong> reemplazo de cauchos (4,5K y 3,6K USD); <strong>GR25:</strong> servicio de cromado de vástago (2,0K USD) y fabricación de sellos hidráulicos (1,9K USD); <strong>GR15 y GR12:</strong> sellos de cilindro telescópico (1,8K USD) y kit de sellos para motor winche (1,8K USD). <strong>Bajaron: GR17:</strong> en agosto se ejecutó reemplazo de cauchos (12,6K USD) y sellos hidráulicos (7,3K USD) que no se repitieron en septiembre, quedando 2,8K USD principalmente en aceite hidráulico (1,0K USD) y mantenimiento menor.
                </div>
              </div>
            )}

            {/* LÁMINA 10: MANO DE OBRA DIRECTA ECO (5.963 HH) */}
            {currentSlide === 10 && (
              <div className="space-y-5 my-auto">
                <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                      Mantto. Activos Productivos – OPEX: Mano de Obra Directa ECO Septiembre 2026
                    </h2>
                    <p className="text-xs text-slate-500">
                      32 Técnicos y Mecánicos · 5.963 Horas Hombre Auditadas · Costo Total MOD: $12.224 USD (Tarifa $2,05/h).
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold bg-slate-100 px-3 py-1 rounded-lg text-slate-700">
                    Lámina 10
                  </span>
                </div>

                {/* Gráfica de 5 Barras Semanales */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Evolutivo Mano de Obra Directa (5.963 HH Totales)
                    </span>
                    <span className="font-mono text-indigo-700 font-bold text-xs">Picos: Sem 37 (1.441H) y Sem 38 (1.401H)</span>
                  </div>

                  <div className="grid grid-cols-5 gap-3 items-end h-32 pt-2 pb-1 border-b border-slate-200">
                    {EVOLUTIVO_SEMANAL_MOD_SEPTIEMBRE_2026.map((s) => {
                      const maxH = 1500;
                      const hBar = Math.max(12, (s.horas / maxH) * 95);
                      const isPico = s.horas >= 1400;

                      return (
                        <div key={s.semana} className="flex flex-col items-center justify-end h-full">
                          <span className={`text-[11px] font-mono font-bold mb-1 ${isPico ? 'text-indigo-900 font-black' : 'text-slate-600'}`}>
                            {s.horas}Hrs
                          </span>
                          <div 
                            style={{ height: `${hBar}px` }} 
                            className={`w-full max-w-[48px] rounded-t-md transition-all ${
                              isPico ? 'bg-sky-700 shadow-xs ring-2 ring-sky-500' : 'bg-slate-400'
                            }`}
                            title={`${s.semana} (${s.periodo}): ${s.horas} horas hombre`}
                          />
                          <span className="text-[10px] font-bold text-slate-700 mt-1.5 text-center truncate max-w-full">
                            {s.periodo}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Análisis Explicativo de Horas Hombre */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed italic">
                  "{MOD_MANTENIMIENTO_FLOTA_SEPTIEMBRE.analisisTexto}"
                </div>

                {/* Tabla Desglose por Tipo de Equipo */}
                <div className="overflow-x-auto max-h-[220px]">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-slate-800 text-white font-bold sticky top-0">
                        <th className="py-2 px-3">Tipo de Equipo</th>
                        <th className="py-2 px-3 text-center">Trabajadores</th>
                        <th className="py-2 px-3 text-right">Total HH</th>
                        <th className="py-2 px-3 text-right">Tarifa ($/H)</th>
                        <th className="py-2 px-3 text-right">Costo Total ($)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {MOD_MANTENIMIENTO_FLOTA_SEPTIEMBRE.desglosePorTipoEquipo.slice(0, 6).map((eq) => (
                        <tr key={eq.tipo} className="hover:bg-slate-50">
                          <td className="py-1.5 px-3 font-bold text-slate-800">{eq.tipo}</td>
                          <td className="py-1.5 px-3 text-center font-mono">{eq.trabajadores}</td>
                          <td className="py-1.5 px-3 text-right font-mono">{eq.totalHH} Hrs</td>
                          <td className="py-1.5 px-3 text-right font-mono">${formatUnitPriceRaw(eq.tarifaPromedio)}</td>
                          <td className="py-1.5 px-3 text-right font-mono font-bold text-slate-900">{formatCurrency(eq.costoTotalMOD)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        ) : (
          /* ========================================================================= */
          /* SECCIÓN AGOSTO 2026 (ORIGINAL) */
          /* ========================================================================= */
          <>
            {/* LÁMINA 0: PORTADA AGOSTO */}
            {currentSlide === 0 && (
              <div className="my-auto text-center space-y-8 max-w-4xl mx-auto py-8">
                <div className="flex justify-center">
                  <TimacaLogo size="lg" />
                </div>

                <div className="space-y-3">
                  <div className="inline-block px-4 py-1.5 rounded-full bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs uppercase tracking-widest font-mono">
                    TALLER INDUSTRIAL METALÚRGICO ANTONIO, C.A. · RIF: J-09500315-9
                  </div>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight uppercase leading-tight">
                    INFORME GESTIÓN DE COSTOS
                  </h1>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-sky-700 tracking-wider uppercase">
                    PROYECTOS INTERNOS
                  </h2>
                  <div className="text-lg font-bold text-slate-500 uppercase tracking-widest pt-2">
                    AGOSTO 2026
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 max-w-2xl mx-auto text-xs text-slate-600 leading-relaxed font-medium">
                  Consolidación de inversiones en obras civiles, galpones y patios (CAPEX), junto al programa integral de mantenimiento operativo de la flota de 26 grúas, camiones, autobuses y maquinaria de talleres (OPEX).
                </div>

                <div className="pt-4 flex items-center justify-center gap-2 text-xs font-mono text-slate-400">
                  <span>Elaborado por:</span>
                  <strong className="text-slate-800 font-bold">Ing. Alejandra Tesara · Analista de Costos TIMACA</strong>
                </div>
              </div>
            )}

            {/* LÁMINA 1: RESUMEN EJECUTIVO AGOSTO */}
            {currentSlide === 1 && (
              <div className="space-y-6 my-auto">
                <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                      Resumen Ejecutivo – Agosto 2026
                    </h2>
                    <p className="text-xs text-slate-500">
                      Consolidación macro de desembolsos en Planta: CAPEX vs OPEX.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold bg-slate-100 px-3 py-1 rounded-lg text-slate-700">
                    Lámina 1
                  </span>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 text-center">
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Proyectos Internos (CAPEX)</div>
                    <div className="text-xl font-black text-slate-900 font-mono mt-1">$29.017</div>
                    <div className="text-[10px] text-emerald-600 font-bold mt-1">▼ 36% vs Julio</div>
                  </div>
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Mantto. Activos Prod (OPEX)</div>
                    <div className="text-xl font-black text-slate-900 font-mono mt-1">$113.450</div>
                    <div className="text-[10px] text-rose-600 font-bold mt-1">▲ 16% vs Julio</div>
                  </div>
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Mantto. Infraestructura (OPEX)</div>
                    <div className="text-xl font-black text-slate-900 font-mono mt-1">$40.545</div>
                    <div className="text-[10px] text-emerald-600 font-bold mt-1">▼ 3% vs Julio</div>
                  </div>
                  <div className="p-3.5 rounded-xl border border-slate-700 bg-slate-800 text-white">
                    <div className="text-[10px] font-bold text-slate-300 uppercase">TOTAL OPEX</div>
                    <div className="text-xl font-black text-white font-mono mt-1">$153.995</div>
                    <div className="text-[10px] text-amber-400 font-bold mt-1">▲ 10% vs Julio</div>
                  </div>
                  <div className="p-3.5 rounded-xl border border-sky-800 bg-sky-950 text-white">
                    <div className="text-[10px] font-bold text-sky-200 uppercase">TOTAL AGOSTO</div>
                    <div className="text-xl font-black text-amber-300 font-mono mt-1">$183.013</div>
                    <div className="text-[10px] text-emerald-400 font-bold mt-1">▼ 1% vs Julio</div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-slate-800 text-white font-bold">
                        <th className="py-2.5 px-3 rounded-l-lg">Descripción</th>
                        <th className="py-2.5 px-2 text-right">Ene</th>
                        <th className="py-2.5 px-2 text-right">Feb</th>
                        <th className="py-2.5 px-2 text-right">Mar</th>
                        <th className="py-2.5 px-2 text-right">Abr</th>
                        <th className="py-2.5 px-2 text-right">May</th>
                        <th className="py-2.5 px-2 text-right">Jun</th>
                        <th className="py-2.5 px-2 text-right">Jul</th>
                        <th className="py-2.5 px-2 text-right bg-sky-900 text-sky-200">Ago</th>
                        <th className="py-2.5 px-3 text-right rounded-r-lg font-mono">Acum. 2026 ($)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      <tr>
                        <td className="py-2 px-3 font-bold text-slate-800">Proyectos Internos (CAPEX)</td>
                        <td className="py-2 px-2 text-right font-mono">$162.467</td>
                        <td className="py-2 px-2 text-right font-mono">$326.380</td>
                        <td className="py-2 px-2 text-right font-mono">$149.039</td>
                        <td className="py-2 px-2 text-right font-mono">$92.865</td>
                        <td className="py-2 px-2 text-right font-mono">$77.901</td>
                        <td className="py-2 px-2 text-right font-mono">$32.585</td>
                        <td className="py-2 px-2 text-right font-mono">$45.087</td>
                        <td className="py-2 px-2 text-right font-mono font-bold bg-sky-50 text-sky-900">$29.017</td>
                        <td className="py-2 px-3 text-right font-mono font-black text-slate-900">$915.341</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-bold text-slate-800">Mantto. Activos Productivos (OPEX)</td>
                        <td className="py-2 px-2 text-right font-mono">$143.581</td>
                        <td className="py-2 px-2 text-right font-mono">$102.274</td>
                        <td className="py-2 px-2 text-right font-mono">$83.194</td>
                        <td className="py-2 px-2 text-right font-mono">$59.543</td>
                        <td className="py-2 px-2 text-right font-mono">$68.409</td>
                        <td className="py-2 px-2 text-right font-mono">$72.213</td>
                        <td className="py-2 px-2 text-right font-mono">$97.727</td>
                        <td className="py-2 px-2 text-right font-mono font-bold bg-indigo-50 text-indigo-900">$113.450</td>
                        <td className="py-2 px-3 text-right font-mono font-black text-slate-900">$740.391</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-bold text-slate-800">Mantto. Infraestructura (OPEX)</td>
                        <td className="py-2 px-2 text-right font-mono">$145.197</td>
                        <td className="py-2 px-2 text-right font-mono">$50.329</td>
                        <td className="py-2 px-2 text-right font-mono">$20.149</td>
                        <td className="py-2 px-2 text-right font-mono">$25.926</td>
                        <td className="py-2 px-2 text-right font-mono">$20.031</td>
                        <td className="py-2 px-2 text-right font-mono">$15.748</td>
                        <td className="py-2 px-2 text-right font-mono">$41.898</td>
                        <td className="py-2 px-2 text-right font-mono font-bold bg-teal-50 text-teal-900">$40.545</td>
                        <td className="py-2 px-3 text-right font-mono font-black text-slate-900">$359.823</td>
                      </tr>
                      <tr className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-300">
                        <td className="py-2.5 px-3">Total General</td>
                        <td className="py-2.5 px-2 text-right font-mono">$451.244</td>
                        <td className="py-2.5 px-2 text-right font-mono">$478.983</td>
                        <td className="py-2.5 px-2 text-right font-mono">$252.382</td>
                        <td className="py-2.5 px-2 text-right font-mono">$178.334</td>
                        <td className="py-2.5 px-2 text-right font-mono">$166.341</td>
                        <td className="py-2.5 px-2 text-right font-mono">$120.546</td>
                        <td className="py-2.5 px-2 text-right font-mono">$184.712</td>
                        <td className="py-2.5 px-2 text-right font-mono bg-slate-200 text-sky-950">$183.013</td>
                        <td className="py-2.5 px-3 text-right font-mono text-sky-950 font-extrabold">$2.015.555</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* LÁMINA 2: PROYECTOS INTERNOS CAPEX AGOSTO */}
            {currentSlide === 2 && (
              <div className="space-y-5 my-auto">
                <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                      Proyectos Internos – CAPEX Agosto 2026
                    </h2>
                    <p className="text-xs text-slate-500">
                      Desglose mensual de las 11 cuentas auxiliares de inversión en planta.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold bg-slate-100 px-3 py-1 rounded-lg text-slate-700">
                    Lámina 2
                  </span>
                </div>

                <div className="overflow-x-auto max-h-[360px] scrollbar-thin">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-slate-800 text-white font-bold sticky top-0">
                        <th className="py-2 px-2.5">Cuenta Auxiliar</th>
                        <th className="py-2 px-2.5">Proyecto</th>
                        <th className="py-2 px-2 text-right">Ene</th>
                        <th className="py-2 px-2 text-right">Feb</th>
                        <th className="py-2 px-2 text-right">Mar</th>
                        <th className="py-2 px-2 text-right">Abr</th>
                        <th className="py-2 px-2 text-right">May</th>
                        <th className="py-2 px-2 text-right">Jun</th>
                        <th className="py-2 px-2 text-right">Jul</th>
                        <th className="py-2 px-2 text-right bg-sky-900 text-sky-200">Ago</th>
                        <th className="py-2 px-2.5 text-right font-mono">Total 2026</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {CUENTAS_CAPEX_INTERNOS.map((c) => (
                        <tr key={c.cuentaAuxiliar} className="hover:bg-slate-50">
                          <td className="py-1.5 px-2.5 font-mono font-bold text-sky-800">{c.cuentaAuxiliar}</td>
                          <td className="py-1.5 px-2.5 font-bold text-slate-800 truncate max-w-[220px]" title={c.proyecto}>{c.proyecto}</td>
                          <td className="py-1.5 px-2 text-right font-mono text-slate-600">{c.ene > 0 ? formatCurrency(c.ene) : '-'}</td>
                          <td className="py-1.5 px-2 text-right font-mono text-slate-600">{c.feb > 0 ? formatCurrency(c.feb) : '-'}</td>
                          <td className="py-1.5 px-2 text-right font-mono text-slate-600">{c.mar > 0 ? formatCurrency(c.mar) : '-'}</td>
                          <td className="py-1.5 px-2 text-right font-mono text-slate-600">{c.abr > 0 ? formatCurrency(c.abr) : '-'}</td>
                          <td className="py-1.5 px-2 text-right font-mono text-slate-600">{c.may > 0 ? formatCurrency(c.may) : '-'}</td>
                          <td className="py-1.5 px-2 text-right font-mono text-slate-600">{c.jun > 0 ? formatCurrency(c.jun) : '-'}</td>
                          <td className="py-1.5 px-2 text-right font-mono text-slate-600">{c.jul > 0 ? formatCurrency(c.jul) : '-'}</td>
                          <td className="py-1.5 px-2 text-right font-mono font-bold bg-sky-50 text-sky-900">{c.ago > 0 ? formatCurrency(c.ago) : '-'}</td>
                          <td className="py-1.5 px-2.5 text-right font-mono font-black text-slate-900">{formatCurrency(c.total2026)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* LÁMINA 3: VARIACIÓN POR PROYECTO CAPEX (JULIO VS AGOSTO) */}
            {currentSlide === 3 && (
              <div className="space-y-6 my-auto">
                <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                      Variación Por Proyecto – Julio vs Agosto 2026
                    </h2>
                    <p className="text-xs text-slate-500">
                      Causas técnicas de incrementos y disminuciones en obras civiles y planta.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold bg-slate-100 px-3 py-1 rounded-lg text-slate-700">
                    Lámina 3
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {VARIACIONES_CAPEX_JUL_AGO.map((v) => (
                    <div key={v.cuenta} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-mono font-bold text-slate-500">{v.cuenta}</span>
                          <span className={`text-sm font-black flex items-center gap-0.5 ${v.esSubida ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {v.esSubida ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                            {v.porcentaje}
                          </span>
                        </div>
                        <h3 className="font-extrabold text-sm text-slate-900">{v.proyecto}</h3>
                        <div className="text-2xl font-black text-slate-900 font-mono mt-1">
                          {formatCurrency(v.agosto)}
                        </div>
                        <div className="text-xs text-slate-500 font-mono">Julio: {formatCurrency(v.julio)}</div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-700 leading-relaxed italic">
                        "{v.explicacion}"
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* LÁMINA 4: TOP VOCES CAPEX AGOSTO */}
            {currentSlide === 4 && (
              <div className="space-y-6 my-auto">
                <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                      Top Voces de Gastos | Costos Proyectos Internos (CAPEX) Agosto 2026
                    </h2>
                    <p className="text-xs text-slate-500">
                      Desglose de compras directas de aceros, electricidad y suministros de obra.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold bg-slate-100 px-3 py-1 rounded-lg text-slate-700">
                    Lámina 4
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="space-y-2.5">
                      {TOP_VOCES_CAPEX_AGOSTO.map((v) => (
                        <div key={v.rubro} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 shadow-2xs">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-xs font-bold text-slate-800">{v.rubro}</div>
                              <div className="text-[10px] text-sky-700 font-medium">{v.categoria}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-black text-slate-900 font-mono">{formatCurrency(v.monto)}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-3 leading-relaxed">
                    <h3 className="font-bold text-slate-900 uppercase">Detalle de Principales Voces</h3>
                    <p>• <strong>MATERIALES ACERO AL CARBONO ($12.242 USD):</strong> Edif. Admin: 6,5K USD en Perfil HEA 200 y Perfiles IPN. Galpones: 5,1K USD en Cabilla Estriada 3/4" (1.560 M).</p>
                    <p>• <strong>MATERIALES ELÉCTRICOS ($6.468 USD):</strong> Patio Externo: 2,4K USD en Cable THWN 4 AWG. Banco de Pruebas: 3,2K USD en transformador y componentes de mando.</p>
                    <p>• <strong>OTROS MATERIALES DE CONSTRUCCIÓN ($5.045 USD):</strong> Edif. Admin: 4,6K USD en 11 Láminas de piedra sinterizada.</p>
                  </div>
                </div>
              </div>
            )}

            {/* LÁMINA 5: OPEX FLOTA AGOSTO */}
            {currentSlide === 5 && (
              <div className="space-y-5 my-auto">
                <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                      Mantto. Activos Productivos – OPEX Agosto 2026
                    </h2>
                    <p className="text-xs text-slate-500">
                      Total Agosto: $113.450 USD (▲ 16% vs Julio $97.727 USD).
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold bg-slate-100 px-3 py-1 rounded-lg text-slate-700">
                    Lámina 5
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                    {TOP_10_EQUIPOS_OPEX_AGOSTO.map((eq, i) => (
                      <div key={eq.codigo} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 shadow-2xs">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800">#{i + 1} {eq.codigo} - {eq.nombre}</span>
                          <span className="font-mono font-black text-slate-900">{formatCurrency(eq.montoAgosto)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2 leading-relaxed">
                    <h3 className="font-bold text-slate-900 uppercase">Detalle Operativo</h3>
                    <p>En agosto el gasto se concentró en el reemplazo de cauchos y sellos de la grúa GR17 ($23,2K USD) y transmisiones de buses.</p>
                  </div>
                </div>
              </div>
            )}

            {/* LÁMINA 6: TOP VOCES OPEX AGOSTO */}
            {currentSlide === 6 && (
              <div className="space-y-6 my-auto">
                <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                      Top Voces de Gasto | OPEX Flota Agosto 2026
                    </h2>
                    <p className="text-xs text-slate-500">
                      Materiales Directos 61% ($69.659) · Servicios 30% ($34.148) · MOD 9% ($9.644).
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold bg-slate-100 px-3 py-1 rounded-lg text-slate-700">
                    Lámina 6
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                    {VOCES_GASTO_OPEX_FLOTA_AGOSTO.map((v) => (
                      <div key={v.rubro} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 shadow-2xs">
                        <div className="flex items-center justify-between text-xs">
                          <div>
                            <div className="font-bold text-slate-900">{v.rubro}</div>
                            <div className="text-[10px] text-slate-500">{v.grupo}</div>
                          </div>
                          <div className="text-sm font-black text-slate-900 font-mono">{formatCurrency(v.monto)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2 leading-relaxed">
                    <h3 className="font-bold text-slate-900 uppercase">Detalle Principales Voces</h3>
                    <p>• <strong>CAUCHOS Y TRIPAS ($22,4K USD):</strong> GR17 ($12,6K) y Manlift ML03 ($5,7K).</p>
                    <p>• <strong>TREN MOTRIZ ($20,8K USD):</strong> Autobuses BS13 y BS10 ($14,8K USD).</p>
                    <p>• <strong>METALMECÁNICA ($14,4K USD):</strong> Plataformas para camiones Ford Cargo.</p>
                  </div>
                </div>
              </div>
            )}

            {/* LÁMINA 7: MOD FLOTA AGOSTO */}
            {currentSlide === 7 && (
              <div className="space-y-6 my-auto">
                <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                      OPEX: Mano de Obra Directa Agosto 2026
                    </h2>
                    <p className="text-xs text-slate-500">
                      27 Trabajadores · 4.697 Horas Hombre · Costo Total MOD: $9.644 USD.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold bg-slate-100 px-3 py-1 rounded-lg text-slate-700">
                    Lámina 7
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed italic">
                  "Del total de 4.697 HH del mes, dos semanas destacaron por su carga: 03 al 08 (1.114H) en Equipos Especiales y Grúas (GR17 con 108H en cauchos y cilindros); y 24 al 29 (1.121H) en Equipos Especiales, autobuses (BS14) y grúas (GR17)."
                </div>

                <div className="overflow-x-auto max-h-[260px]">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-slate-800 text-white font-bold sticky top-0">
                        <th className="py-2 px-3">Tipo de Equipo</th>
                        <th className="py-2 px-3 text-center">Trabajadores</th>
                        <th className="py-2 px-3 text-right">Total HH</th>
                        <th className="py-2 px-3 text-right">Tarifa ($/H)</th>
                        <th className="py-2 px-3 text-right">Costo Total ($)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {MOD_MANTENIMIENTO_FLOTA_AGOSTO.desglosePorTipoEquipo.slice(0, 6).map((eq) => (
                        <tr key={eq.tipo} className="hover:bg-slate-50">
                          <td className="py-1.5 px-3 font-bold text-slate-800">{eq.tipo}</td>
                          <td className="py-1.5 px-3 text-center font-mono">{eq.trabajadores}</td>
                          <td className="py-1.5 px-3 text-right font-mono">{eq.totalHH} Hrs</td>
                          <td className="py-1.5 px-3 text-right font-mono">${formatUnitPriceRaw(eq.tarifaPromedio)}</td>
                          <td className="py-1.5 px-3 text-right font-mono font-bold text-slate-900">{formatCurrency(eq.costoTotalMOD)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* LÁMINA 8: MANTTO INFRAESTRUCTURA AGOSTO */}
            {currentSlide === 8 && (
              <div className="space-y-5 my-auto">
                <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                      Mantto. Infraestructura – OPEX Agosto 2026
                    </h2>
                    <p className="text-xs text-slate-500">
                      Total Agosto: $40.545 USD | Acumulado 2026: $359.823 USD.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold bg-slate-100 px-3 py-1 rounded-lg text-slate-700">
                    Lámina 8
                  </span>
                </div>

                <div className="overflow-x-auto max-h-[260px]">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-slate-800 text-white font-bold sticky top-0">
                        <th className="py-2 px-2.5">Cuenta Auxiliar</th>
                        <th className="py-2 px-2.5">Proyecto / Galpón</th>
                        <th className="py-2 px-2 text-right">Julio</th>
                        <th className="py-2 px-2 text-right bg-teal-900 text-teal-200">Agosto</th>
                        <th className="py-2 px-2.5 text-right font-mono">Total 2026</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {MANTTO_INFRAESTRUCTURA_2026.cuentas.slice(0, 6).map((c) => (
                        <tr key={c.cuenta} className="hover:bg-slate-50">
                          <td className="py-1.5 px-2.5 font-mono font-bold text-teal-800">{c.cuenta}</td>
                          <td className="py-1.5 px-2.5 font-bold text-slate-800 truncate max-w-[180px]">{c.descripcion}</td>
                          <td className="py-1.5 px-2 text-right font-mono text-slate-600">{formatCurrency(c.jul)}</td>
                          <td className="py-1.5 px-2 text-right font-mono font-bold bg-teal-50 text-teal-900">{formatCurrency(c.ago)}</td>
                          <td className="py-1.5 px-2.5 text-right font-mono font-black text-slate-900">{formatCurrency(c.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2 leading-relaxed">
                  <p><strong>• Incrementos:</strong> TT-I-C-033 adecuación de contenedores en Pellas 1 (22K USD en acero al carbono, 1,2K en materiales de construcción y 1,2K eléctricos). TT-G-C-032: cajas de distribución ($761 USD) y aire acondicionado para el comedor ($550 USD).</p>
                  <p><strong>• Disminuciones:</strong> TT-A-C-207: disminuyó tras la fabricación de 40 cajas de herramientas en el mes anterior (12,4K USD en láminas), quedando en el mes actual $443,58 USD.</p>
                </div>
              </div>
            )}

            {/* LÁMINA 9: MANTTO GRÚAS AGOSTO */}
            {currentSlide === 9 && (
              <div className="space-y-5 my-auto">
                <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                      Mantto. Grúas – OPEX Agosto 2026
                    </h2>
                    <p className="text-xs text-slate-500">
                      Total Agosto: $32.364 USD | Acumulado 2026: $333.471 USD | Flota Activa: 26 Grúas TIMACA.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold bg-slate-100 px-3 py-1 rounded-lg text-slate-700">
                    Lámina 9
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2 leading-relaxed">
                  <h3 className="font-bold text-slate-900 uppercase">Auditoría Técnica de Grúas en Taller</h3>
                  <p>• <strong>Subieron:</strong> GR17 ($23.206 USD): reemplazo de cauchos ($12,6K USD) y fabricación de sello hidráulico ($7,3K USD). GR07 y GR03: fabricación de sellos hidráulicos.</p>
                  <p>• <strong>Bajaron:</strong> GR16 y GR24: en julio se ejecutó fabricación de sello hidráulico que concluyó y no se repitió en agosto. GR08: solo servicio menor de cristalería por $110 USD.</p>
                </div>
              </div>
            )}
          </>
        )}

        {/* Footer de Navegación de Diapositiva */}
        <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>TIMACA 2026</span>
            <span>•</span>
            <span className="font-mono font-bold text-slate-700">{slides[currentSlide].title}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-slate-700">
              {currentSlide + 1} de {slides.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={currentSlide === 0}
                onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                title="Anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={currentSlide === slides.length - 1}
                onClick={() => setCurrentSlide(prev => Math.min(slides.length - 1, prev + 1))}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                title="Siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
