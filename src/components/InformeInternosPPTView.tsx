import React, { useState } from 'react';
import { 
  FileText, 
  ChevronLeft, 
  ChevronRight, 
  Presentation, 
  Printer, 
  Download, 
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
  BarChart3
} from 'lucide-react';
import { TimacaLogo } from './TimacaLogo';
import { 
  EVOLUTIVO_INTERNOS_2026, 
  TOTALES_ACUMULADOS_INTERNOS_2026, 
  CUENTAS_CAPEX_INTERNOS, 
  VARIACIONES_CAPEX_JUL_AGO, 
  TOP_VOCES_CAPEX_AGOSTO,
  TOP_10_EQUIPOS_OPEX_AGOSTO,
  TIPOS_EQUIPOS_OPEX_MENSUAL,
  VOCES_GASTO_OPEX_FLOTA_AGOSTO,
  MOD_MANTENIMIENTO_FLOTA_AGOSTO,
  MANTTO_INFRAESTRUCTURA_2026,
  FLOTA_GRUAS_TIMACA_2026
} from '../data/proyectosInternosData';
import { formatCurrency, formatNumber } from '../utils/dateHelpers';

interface InformeInternosPPTViewProps {
  onVolver?: () => void;
}

export const InformeInternosPPTView: React.FC<InformeInternosPPTViewProps> = ({ onVolver }) => {
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'diapositivas' | 'documento'>('diapositivas');

  const slides = [
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
              Informe Gestión de Costos — Proyectos Internos (Agosto 2026)
            </h2>
          </div>
        </div>

        {/* Controles de Navegación y Modos */}
        <div className="flex items-center gap-2.5">
          <div className="bg-slate-800 p-1 rounded-xl border border-slate-700 flex items-center text-xs">
            <button
              onClick={() => setViewMode('diapositivas')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'diapositivas' ? 'bg-sky-500 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Presentation className="w-3.5 h-3.5" />
              <span>Diapositivas</span>
            </button>
            <button
              onClick={() => setViewMode('documento')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'documento' ? 'bg-sky-500 text-white shadow-xs' : 'text-slate-400 hover:text-white'
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
        
        {/* LÁMINA 0: PORTADA OFICIAL */}
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

            {/* Collage Representativo de Equipos / Talleres */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 max-w-2xl mx-auto text-xs text-slate-600 leading-relaxed font-medium">
              Consolidación de inversiones en obras civiles, galpones y patios (CAPEX), junto al programa integral de mantenimiento operativo de la flota de 26 grúas, camiones, autobuses y maquinaria de talleres (OPEX).
            </div>

            <div className="pt-4 flex items-center justify-center gap-2 text-xs font-mono text-slate-400">
              <span>Elaborado por:</span>
              <strong className="text-slate-800 font-bold">Ing. Alejandra Tesara · Analista de Costos TIMACA</strong>
            </div>
          </div>
        )}

        {/* LÁMINA 1: RESUMEN EJECUTIVO AGOSTO 2026 */}
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

            {/* Tarjetas Principales */}
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

            {/* Tabla Comparativa Mensual Ene-Ago */}
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

            {/* Gráficas Lámina 1: Evolutivo Mensual + Donut de Participación Agosto */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-1">
              
              {/* Gráfica 1: Evolutivo Mensual Ene-Ago (Barras Apiladas) */}
              <div className="lg:col-span-8 p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5 text-sky-600" />
                    <span>Evolutivo Mensual de Desembolsos Ene - Ago ($ USD)</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 font-bold">Pico en Feb ($479K) · Cierre Ago ($183K)</span>
                </div>

                <div className="grid grid-cols-8 gap-2 items-end h-40 pt-4 pb-2 px-1 border-b border-slate-200">
                  {EVOLUTIVO_INTERNOS_2026.map((m, idx) => {
                    const maxVal = 480000;
                    const hCapex = (m.capex / maxVal) * 110;
                    const hFlota = (m.opexActivos / maxVal) * 110;
                    const hInfra = (m.opexInfraestructura / maxVal) * 110;
                    const isAgo = idx === 7;

                    return (
                      <div key={m.mesCorto} className="flex flex-col items-center h-full justify-end group">
                        <span className={`text-[10px] font-mono font-bold mb-1 ${isAgo ? 'text-sky-900 font-black' : 'text-slate-500'}`}>
                          ${Math.round(m.totalGeneral / 1000)}k
                        </span>
                        <div className={`w-full max-w-[26px] flex flex-col-reverse rounded-t-md overflow-hidden ${isAgo ? 'ring-2 ring-sky-500 shadow-md' : 'opacity-90'}`}>
                          <div style={{ height: `${hInfra}px` }} className="bg-teal-500" title={`Infra: $${m.opexInfraestructura.toLocaleString()}`} />
                          <div style={{ height: `${hFlota}px` }} className="bg-indigo-600" title={`Flota: $${m.opexActivos.toLocaleString()}`} />
                          <div style={{ height: `${hCapex}px` }} className="bg-sky-500" title={`CAPEX: $${m.capex.toLocaleString()}`} />
                        </div>
                        <span className={`text-[11px] font-bold mt-1.5 ${isAgo ? 'text-sky-900 bg-sky-100 px-1.5 py-0.2 rounded font-black' : 'text-slate-600'}`}>
                          {m.mesCorto}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-center gap-6 pt-3 text-[11px] font-medium text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-sky-500" />
                    <span>Inversiones CAPEX</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-indigo-600" />
                    <span>Flota & Equipos (OPEX)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-teal-500" />
                    <span>Infraestructura (OPEX)</span>
                  </div>
                </div>
              </div>

              {/* Gráfica 2: Donut Chart de Distribución Agosto */}
              <div className="lg:col-span-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs flex flex-col justify-between">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Participación en Agosto 2026
                </div>

                <div className="relative flex items-center justify-center my-auto py-2">
                  <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="36" stroke="#f1f5f9" strokeWidth="15" fill="transparent" />
                    {/* Flota OPEX: 62% */}
                    <circle cx="50" cy="50" r="36" stroke="#4f46e5" strokeWidth="15" fill="transparent"
                      strokeDasharray="226.19" strokeDashoffset={`${226.19 * (1 - 0.62)}`} />
                    {/* Infraestructura OPEX: 22% */}
                    <circle cx="50" cy="50" r="36" stroke="#14b8a6" strokeWidth="15" fill="transparent"
                      strokeDasharray="226.19" strokeDashoffset={`${226.19 * (1 - 0.22)}`}
                      style={{ transform: 'rotate(223.2deg)', transformOrigin: '50% 50%' }} />
                    {/* CAPEX: 16% */}
                    <circle cx="50" cy="50" r="36" stroke="#0ea5e9" strokeWidth="15" fill="transparent"
                      strokeDasharray="226.19" strokeDashoffset={`${226.19 * (1 - 0.16)}`}
                      style={{ transform: 'rotate(302.4deg)', transformOrigin: '50% 50%' }} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Agosto</span>
                    <span className="text-base font-black text-slate-900 font-mono">$183K</span>
                    <span className="text-[9px] text-slate-500 font-semibold">Consolidado</span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-200 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-bold text-indigo-900">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                      Flota & Equipos
                    </span>
                    <span className="font-mono font-black text-indigo-700">62% ($113K)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-bold text-teal-900">
                      <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                      Infraestructura
                    </span>
                    <span className="font-mono font-black text-teal-700">22% ($40K)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-bold text-sky-900">
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                      Proyectos CAPEX
                    </span>
                    <span className="font-mono font-black text-sky-700">16% ($29K)</span>
                  </div>
                </div>
              </div>

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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Total Agosto</div>
                <div className="text-xl font-black text-slate-900 font-mono mt-0.5">$29.017</div>
                <div className="text-[10px] text-emerald-600 font-bold">▼ 36% vs Julio ($45.087)</div>
              </div>
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Total Acumulado 2026</div>
                <div className="text-xl font-black text-slate-900 font-mono mt-0.5">$915.341</div>
                <div className="text-[10px] text-slate-500 font-medium">Enero - Agosto 2026</div>
              </div>
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Proyecto con Mayor Gasto</div>
                <div className="text-xl font-black text-sky-800 font-mono mt-0.5">TTI-C-0095 ($13.164)</div>
                <div className="text-[10px] text-emerald-600 font-bold">▼ 38% vs Julio ($21.319)</div>
              </div>
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
                  <tr className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-300">
                    <td colSpan={2} className="py-2 px-2.5">Total CAPEX</td>
                    <td className="py-2 px-2 text-right font-mono">$162.467</td>
                    <td className="py-2 px-2 text-right font-mono">$326.380</td>
                    <td className="py-2 px-2 text-right font-mono">$149.039</td>
                    <td className="py-2 px-2 text-right font-mono">$92.865</td>
                    <td className="py-2 px-2 text-right font-mono">$77.901</td>
                    <td className="py-2 px-2 text-right font-mono">$32.585</td>
                    <td className="py-2 px-2 text-right font-mono">$45.087</td>
                    <td className="py-2 px-2 text-right font-mono bg-sky-100 text-sky-900">$29.017</td>
                    <td className="py-2 px-2.5 text-right font-mono text-sky-950 font-extrabold">$915.341</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Gráfica de Distribución de Inversiones CAPEX Agosto */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs">
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                <span>Concentración del Presupuesto CAPEX en Agosto ($29.017 USD)</span>
                <span className="font-mono text-sky-700 font-bold">Edif. Admin + Galpones = 64.7%</span>
              </div>
              <div className="space-y-2">
                {[
                  { cod: 'TTI-C-0095', nom: 'Obra civil Edificio Administrativo', monto: 13164, pct: 45.4, col: 'bg-sky-600' },
                  { cod: 'TSI-T-0108', nom: 'Construcción Galpones TIMACA Cant. 04', monto: 5596, pct: 19.3, col: 'bg-sky-500' },
                  { cod: 'TTI-C-0105', nom: 'Adecuación patio externo Timaca', monto: 5371, pct: 18.5, col: 'bg-teal-500' },
                  { cod: 'TTI-C-0108', nom: 'Adecuación banco de pruebas motores 440v', monto: 3289, pct: 11.3, col: 'bg-indigo-500' },
                  { cod: 'TTI-C-0104', nom: 'Reacondicionamiento Grúas Torres Liebherr', monto: 1528, pct: 5.3, col: 'bg-amber-500' },
                  { cod: 'OTROS', nom: 'Otros Proyectos Menores', monto: 69, pct: 0.2, col: 'bg-slate-400' }
                ].map((item) => (
                  <div key={item.cod} className="space-y-0.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <span className="font-mono text-sky-800 font-bold">{item.cod}</span>
                        <span className="truncate max-w-sm">{item.nom}</span>
                      </span>
                      <span className="font-mono font-bold text-slate-900">
                        {formatCurrency(item.monto)} <span className="text-[10px] text-slate-500 font-normal">({item.pct}%)</span>
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div style={{ width: `${item.pct}%` }} className={`h-full ${item.col} rounded-full transition-all`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* LÁMINA 3: VARIACIÓN POR PROYECTO CAPEX */}
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

            {/* Gráfica Comparativa: Julio vs Agosto */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between mb-3 text-xs font-bold text-slate-800 uppercase tracking-wider">
                <span>Comparativa Gráfica de Proyectos CAPEX: Julio vs Agosto ($ USD)</span>
                <div className="flex items-center gap-4 text-[11px] font-medium text-slate-600">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-slate-400 rounded-sm" /> Julio</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-sky-600 rounded-sm" /> Agosto</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {VARIACIONES_CAPEX_JUL_AGO.map((v) => {
                  const maxVal = 22000;
                  const hJul = Math.max(12, (v.julio / maxVal) * 90);
                  const hAgo = Math.max(12, (v.agosto / maxVal) * 90);

                  return (
                    <div key={v.cuenta} className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col justify-between shadow-2xs">
                      <div className="text-center">
                        <span className="font-mono text-[10px] font-bold text-slate-500">{v.cuenta}</span>
                        <div className="font-bold text-xs text-slate-800 truncate" title={v.proyecto}>{v.proyecto}</div>
                      </div>

                      <div className="flex items-end justify-center gap-2 h-24 my-2 pt-2 border-b border-slate-100">
                        {/* Barra Julio */}
                        <div className="flex flex-col items-center">
                          <span className="text-[9px] font-mono font-semibold text-slate-500 mb-0.5">${Math.round(v.julio / 1000)}k</span>
                          <div style={{ height: `${hJul}px` }} className="w-5 bg-slate-300 rounded-t-sm" title={`Julio: $${v.julio}`} />
                          <span className="text-[9px] text-slate-400 font-bold mt-0.5">Jul</span>
                        </div>
                        {/* Barra Agosto */}
                        <div className="flex flex-col items-center">
                          <span className="text-[9px] font-mono font-bold text-sky-900 mb-0.5">${Math.round(v.agosto / 1000)}k</span>
                          <div style={{ height: `${hAgo}px` }} className={`w-5 ${v.esSubida ? 'bg-rose-500' : 'bg-sky-600'} rounded-t-sm`} title={`Agosto: $${v.agosto}`} />
                          <span className="text-[9px] text-sky-900 font-bold mt-0.5">Ago</span>
                        </div>
                      </div>

                      <div className={`text-center font-mono font-black text-xs ${v.esSubida ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {v.porcentaje}
                      </div>
                    </div>
                  );
                })}
              </div>
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

        {/* LÁMINA 4: TOP VOCES DE GASTO CAPEX */}
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
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Matriz y Gráfica de Voces de Gasto</h3>
                <div className="space-y-2.5">
                  {TOP_VOCES_CAPEX_AGOSTO.map((v) => {
                    const pct = Math.round((v.monto / 29017) * 1000) / 10;
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
                    <span>TOTAL GENERAL CAPEX AGOSTO</span>
                    <span className="font-mono text-amber-300 text-sm">$29.017 (100%)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Detalle de las Principales Voces de Gasto</h3>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-3 leading-relaxed">
                  <p><strong>• MATERIALES ACERO AL CARBONO ($12.242 USD):</strong> Edif. Admin: 6,5K USD en Perfil HEA 200 S275JR (120 M) y Perfiles IPN 200. Construcción Galpones: 5,1K USD en Cabilla Estriada 3/4" (1.560 M) para nuevos galpones en zona de hangares.</p>
                  <p><strong>• MATERIALES ELÉCTRICOS ($6.468 USD):</strong> Adecuación Patio Externo: 2,4K USD en Cable THWN 4 AWG (388 M). Banco de Pruebas: 3,2K USD en transformador de mando, motor ventilador trifásico y tablero impermeable.</p>
                  <p><strong>• OTROS MATERIALES DE CONSTRUCCIÓN ($5.045 USD):</strong> Edif. Admin: 4,6K USD en 11 Láminas de piedra sinterizada 3200 x 1600 x 12 mm.</p>
                  <p><strong>• SERVICIOS - FLETE INTERNACIONAL ($1.235 USD):</strong> Reacondicionamiento Grúas Torres Liebherr: Traslado desde Europa de materiales y repuestos para Grúa MERCURIUS.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LÁMINA 5: MANTTO ACTIVOS PRODUCTIVOS OPEX */}
        {currentSlide === 5 && (
          <div className="space-y-5 my-auto">
            <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Mantto. Activos Productivos– OPEX Agosto 2026
                </h2>
                <p className="text-xs text-slate-500">
                  Total Agosto: $113.450 USD (▲ 16% vs Julio $97.727 USD) | Acumulado 2026: $740.391 USD.
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-slate-100 px-3 py-1 rounded-lg text-slate-700">
                Lámina 5
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Top 10 Equipos */}
              <div className="lg:col-span-5 space-y-2">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                  <span>Ranking Top 10 Equipos Móviles</span>
                  <span className="font-mono text-indigo-700 font-bold">Líder GR17 ($23.2K)</span>
                </h3>
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {TOP_10_EQUIPOS_OPEX_AGOSTO.map((eq, i) => {
                    const maxEq = 23206;
                    const pctBar = Math.max(10, Math.round((eq.montoAgosto / maxEq) * 100));
                    const isTop1 = i === 0;

                    return (
                      <div key={eq.codigo} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 shadow-2xs">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className={`font-mono text-[11px] font-black px-1.5 py-0.2 rounded ${
                              isTop1 ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-indigo-50 text-indigo-800'
                            }`}>
                              #{i + 1} {eq.codigo}
                            </span>
                            <span className="truncate max-w-[150px] font-bold text-slate-800" title={eq.nombre}>{eq.nombre}</span>
                          </div>
                          <div className="text-right font-mono font-black text-slate-900 shrink-0">
                            {formatCurrency(eq.montoAgosto)}
                          </div>
                        </div>
                        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            style={{ width: `${pctBar}%` }} 
                            className={`h-full rounded-full transition-all ${
                              isTop1 ? 'bg-amber-500 shadow-xs' : 'bg-indigo-600'
                            }`} 
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tabla Familias de Equipos */}
              <div className="lg:col-span-7 space-y-2">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Desglose por Tipo de Equipo (Ene - Ago)</h3>
                <div className="overflow-x-auto max-h-[380px] overflow-y-auto">
                  <table className="w-full text-[11px] text-left">
                    <thead>
                      <tr className="bg-slate-800 text-white font-bold sticky top-0">
                        <th className="py-2 px-2.5">Tipo</th>
                        <th className="py-2 px-1 text-right">Ene</th>
                        <th className="py-2 px-1 text-right">Mar</th>
                        <th className="py-2 px-1 text-right">May</th>
                        <th className="py-2 px-1 text-right">Jul</th>
                        <th className="py-2 px-1 text-right bg-indigo-900 text-indigo-200">Ago</th>
                        <th className="py-2 px-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {TIPOS_EQUIPOS_OPEX_MENSUAL.slice(0, 9).map((t) => (
                        <tr key={t.tipo} className="hover:bg-slate-50">
                          <td className="py-1.5 px-2.5 font-bold text-slate-800">{t.tipo}</td>
                          <td className="py-1.5 px-1 text-right font-mono text-slate-500">${Math.round(t.ene / 1000)}k</td>
                          <td className="py-1.5 px-1 text-right font-mono text-slate-500">${Math.round(t.mar / 1000)}k</td>
                          <td className="py-1.5 px-1 text-right font-mono text-slate-500">${Math.round(t.may / 1000)}k</td>
                          <td className="py-1.5 px-1 text-right font-mono text-slate-500">${Math.round(t.jul / 1000)}k</td>
                          <td className="py-1.5 px-1 text-right font-mono font-bold bg-indigo-50 text-indigo-900">${Math.round(t.ago / 1000)}k</td>
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

        {/* LÁMINA 6: TOP VOCES DE GASTO OPEX FLOTA */}
        {currentSlide === 6 && (
          <div className="space-y-6 my-auto">
            <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Top Voces de Gasto| Costos Mantto. Activos Productivos (OPEX) - Agosto 2026
                </h2>
                <p className="text-xs text-slate-500">
                  Distribución: Materiales Directos 61% ($69.659) · Servicios 30% ($34.148) · MOD 9% ($9.644).
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-slate-100 px-3 py-1 rounded-lg text-slate-700">
                Lámina 6
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {VOCES_GASTO_OPEX_FLOTA_AGOSTO.map((v) => {
                  const maxVoz = 22447;
                  const pct = Math.round((v.monto / 113450) * 1000) / 10;
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
                          <div className="text-[10px] text-indigo-600 font-bold">{pct}%</div>
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
                <p>• <strong>CAUCHOS Y TRIPAS ($22,4K USD):</strong> 12,6K USD en reemplazo de cauchos 14.00R20 para la grúa GR17 y 5,7K USD en estabilizadores 18-625 para el Manlift ML03.</p>
                <p>• <strong>REP. Y ACC TREN MOTRIZ ($20,8K USD):</strong> 14,8K USD en autobuses (Motor diésel Isuzu BS13 - $8K y transmisión Eaton Fuller BS10 - $6,7K), 2,5K transmisión Mazda VH37 y 1,3K cámara Cummins CA02.</p>
                <p>• <strong>SERVICIO METALMECÁNICA ($14,4K USD):</strong> Fabricación e instalación de plataformas para camiones Ford Cargo (CA14, CA15 y CA17).</p>
                <p>• <strong>SELLOS HIDRÁULICOS ($12,8K USD):</strong> Concentrado en grúas GR17 y GR25 ($9,1K USD); resto en equipos especiales y montacargas.</p>
                <p>• <strong>ACEITE HIDRÁULICO ($6,4K USD):</strong> Aceite ISO 68 en equipos especiales ($3,1K) y grúas ($2,2K).</p>
              </div>
            </div>
          </div>
        )}

        {/* LÁMINA 7: MOD MANTENIMIENTO */}
        {currentSlide === 7 && (
          <div className="space-y-6 my-auto">
            <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Mantto. Activos Productivos– OPEX: Mano de Obra Directa
                </h2>
                <p className="text-xs text-slate-500">
                  27 Trabajadores · 4.697 Horas Hombre Totales · Costo Total MOD: $9.644 USD (Tarifa $2,05/h).
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-slate-100 px-3 py-1 rounded-lg text-slate-700">
                Lámina 7
              </span>
            </div>

            {/* Gráfica de Curva Semanal de Horas Hombre */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Curva Semanal de Carga de Trabajo (4.697 HH Totales)
                </span>
                <span className="font-mono text-indigo-700 font-bold text-xs">Picos: Sem 2 (1.114H) y Sem 5 (1.121H)</span>
              </div>
              <div className="grid grid-cols-6 gap-2 items-end h-28 pt-2 pb-1 border-b border-slate-200">
                {MOD_MANTENIMIENTO_FLOTA_AGOSTO.evolutivoSemanas.map((s) => {
                  const maxH = 1200;
                  const hBar = Math.max(8, (s.horas / maxH) * 80);
                  const isPico = s.horas > 1100;

                  return (
                    <div key={s.periodo} className="flex flex-col items-center justify-end h-full">
                      <span className={`text-[10px] font-mono font-bold mb-1 ${isPico ? 'text-indigo-900 font-black' : 'text-slate-500'}`}>
                        {s.horas}h
                      </span>
                      <div 
                        style={{ height: `${hBar}px` }} 
                        className={`w-full max-w-[36px] rounded-t-md transition-all ${
                          isPico ? 'bg-indigo-600 shadow-xs ring-1 ring-indigo-400' : 'bg-slate-300'
                        }`} 
                        title={`${s.periodo}: ${s.horas} horas hombre`}
                      />
                      <span className="text-[10px] font-bold text-slate-600 mt-1 truncate max-w-full">
                        {s.periodo}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed italic">
              "Del total de 4.697 HH del mes, dos semanas destacaron por su carga: 03 al 08 (1.114H) en Equipos Especiales y Grúas (GR17 con 108H en cauchos y cilindros); y 24 al 29 (1.121H) en Equipos Especiales, autobuses (BS14 - cambio de ballestas) y grúas (GR17 - cilindros estabilizadores)."
            </div>

            {/* Tabla resumen por Tipo */}
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
                  {MOD_MANTENIMIENTO_FLOTA_AGOSTO.desglosePorTipoEquipo.slice(0, 6).map((eq) => (
                    <tr key={eq.tipo} className="hover:bg-slate-50">
                      <td className="py-1.5 px-3 font-bold text-slate-800">{eq.tipo}</td>
                      <td className="py-1.5 px-3 text-center font-mono">{eq.trabajadores}</td>
                      <td className="py-1.5 px-3 text-right font-mono">{eq.totalHH} Hrs</td>
                      <td className="py-1.5 px-3 text-right font-mono">${eq.tarifaPromedio.toFixed(2)}</td>
                      <td className="py-1.5 px-3 text-right font-mono font-bold text-slate-900">{formatCurrency(eq.costoTotalMOD)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* LÁMINA 8: MANTTO INFRAESTRUCTURA */}
        {currentSlide === 8 && (
          <div className="space-y-5 my-auto">
            <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Mantto. Infraestructura – OPEX Agosto 2026
                </h2>
                <p className="text-xs text-slate-500">
                  Total Agosto: $40.545 USD (▼ 3% vs Julio) | Acumulado 2026: $359.823 USD | HH: 1.145 Hrs (MOD $2.127 USD).
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-slate-100 px-3 py-1 rounded-lg text-slate-700">
                Lámina 8
              </span>
            </div>

            {/* Tarjetas KPI Rápidas */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Total Agosto</div>
                <div className="text-xl font-black text-slate-900 font-mono mt-0.5">$40.545</div>
                <div className="text-[10px] text-emerald-600 font-bold">▼ 3% vs Julio ($41.898)</div>
              </div>
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Acumulado 2026</div>
                <div className="text-xl font-black text-slate-900 font-mono mt-0.5">$359.823</div>
                <div className="text-[10px] text-slate-500 font-medium">Enero - Agosto 2026</div>
              </div>
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Mano de Obra Directa</div>
                <div className="text-xl font-black text-teal-800 font-mono mt-0.5">1.145 HH</div>
                <div className="text-[10px] text-teal-600 font-bold">$2.127 USD (Tarifa $1,86/h)</div>
              </div>
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Cuenta Principal</div>
                <div className="text-xl font-black text-teal-800 font-mono mt-0.5">TT-I-C-033</div>
                <div className="text-[10px] text-teal-700 font-bold">$31.297 (77.2% del total)</div>
              </div>
            </div>

            {/* Gráfica de Concentración y Desglose */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Gráfica de Barras de Concentración */}
              <div className="lg:col-span-5 p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs space-y-3">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                  <span>Concentración Presupuestaria Agosto</span>
                  <span className="font-mono text-teal-700 font-bold">TT-I-C-033 = 77.2%</span>
                </div>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {[
                    { cta: 'TT-I-C-033', desc: 'Adecuaciones Pellas 1 (Contenedores)', m: 31297, pct: 77.2, color: 'bg-teal-600' },
                    { cta: 'EE-H-C-015', desc: 'Mantto herramientas - Mantto', m: 2141, pct: 5.3, color: 'bg-teal-500' },
                    { cta: 'TT-G-C-032', desc: 'Galpones Fab (Cajas & Comedor)', m: 1809, pct: 4.5, color: 'bg-emerald-500' },
                    { cta: 'EE-G-C-016', desc: 'Galpones Mantto', m: 1361, pct: 3.4, color: 'bg-sky-500' },
                    { cta: 'SS-G-C-025', desc: 'Galpones SMB', m: 1085, pct: 2.7, color: 'bg-indigo-500' },
                    { cta: 'TT-H-C-031', desc: 'Herramientas Fab', m: 1051, pct: 2.6, color: 'bg-amber-500' },
                    { cta: 'TT-A-C-208', desc: 'Galpones Almacén', m: 1040, pct: 2.6, color: 'bg-purple-500' },
                    { cta: 'OTRAS', desc: 'Extintores y Sandblasting', m: 761, pct: 1.7, color: 'bg-slate-400' }
                  ].map((item) => (
                    <div key={item.cta} className="p-2 bg-white rounded-xl border border-slate-200 space-y-1 shadow-2xs">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="font-mono text-[10px] font-bold text-teal-900 bg-teal-50 px-1 py-0.5 rounded border border-teal-200">{item.cta}</span>
                          <span className="font-bold text-slate-800 truncate max-w-[170px]" title={item.desc}>{item.desc}</span>
                        </div>
                        <div className="text-right font-mono font-black text-slate-900 shrink-0">
                          {formatCurrency(item.m)} <span className="text-[10px] text-slate-500 font-normal">({item.pct}%)</span>
                        </div>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div style={{ width: `${Math.min(100, item.pct * 1.2)}%` }} className={`h-full ${item.color} rounded-full transition-all`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tabla de Cuentas y Notas Técnicas */}
              <div className="lg:col-span-7 space-y-3">
                <div className="overflow-x-auto max-h-[220px]">
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
                          <td className="py-1.5 px-2.5 font-bold text-slate-800 truncate max-w-[180px]" title={c.descripcion}>{c.descripcion}</td>
                          <td className="py-1.5 px-2 text-right font-mono text-slate-600">{formatCurrency(c.jul)}</td>
                          <td className="py-1.5 px-2 text-right font-mono font-bold bg-teal-50 text-teal-900">{formatCurrency(c.ago)}</td>
                          <td className="py-1.5 px-2.5 text-right font-mono font-black text-slate-900">{formatCurrency(c.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2 leading-relaxed">
                  <h3 className="font-bold text-slate-900 uppercase">Notas Explicativas Oficiales</h3>
                  <p><strong>• Incrementos:</strong> TT-I-C-033 adecuación de contenedores en Pellas 1 (22K USD en acero al carbono, 1,2K en materiales de construcción y 1,2K eléctricos). TT-G-C-032: cajas de distribución ($761 USD) y aire acondicionado para el comedor ($550 USD).</p>
                  <p><strong>• Disminuciones:</strong> TT-A-C-207: disminuyó tras la fabricación de 40 cajas de herramientas en el mes anterior (12,4K USD en láminas), quedando en el mes actual $443,58 USD.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LÁMINA 9: MANTTO GRÚAS */}
        {currentSlide === 9 && (
          <div className="space-y-5 my-auto">
            <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Mantto. Grúas – OPEX Agosto 2026
                </h2>
                <p className="text-xs text-slate-500">
                  Total Agosto: $32.364 USD (▼ 1% vs Jul $32.748) | Acumulado 2026: $333.471 USD | Flota Activa: 26 Grúas TIMACA.
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-slate-100 px-3 py-1 rounded-lg text-slate-700">
                Lámina 9
              </span>
            </div>

            {/* Tarjetas Top 5 Grúas */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-2.5 text-center">
              {FLOTA_GRUAS_TIMACA_2026.top5GruasAgosto.map((g) => (
                <div key={g.codigo} className={`p-3 rounded-xl border ${g.codigo === 'EEI-C-GR17' ? 'bg-amber-50 border-amber-300 ring-1 ring-amber-300' : 'bg-slate-50 border-slate-200'}`}>
                  <div className={`text-[10px] font-mono font-bold ${g.codigo === 'EEI-C-GR17' ? 'text-amber-800' : 'text-slate-500'}`}>{g.codigo}</div>
                  <div className="text-base font-black text-slate-900 font-mono mt-0.5">{formatCurrency(g.monto)}</div>
                  <div className="text-[10px] text-sky-700 font-bold truncate mt-1" title={g.descripcion}>{g.descripcion}</div>
                  <div className={`text-[10px] font-bold ${g.variacion.startsWith('+') ? 'text-rose-600' : 'text-emerald-600'}`}>{g.variacion} vs Jul</div>
                </div>
              ))}
            </div>

            {/* Gráfica de Concentración y Comparativa de Variaciones */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Gráfica de Concentración de Gasto */}
              <div className="lg:col-span-5 p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs space-y-3">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                  <span>Concentración de Costos en Grúas</span>
                  <span className="font-mono text-amber-700 font-bold">GR17 = 71.7%</span>
                </div>
                <div className="space-y-2">
                  {[
                    { cod: 'GR17', nom: 'Grove TM 890 (90TN)', m: 23206, pct: 71.7, col: 'bg-amber-500' },
                    { cod: 'GR25', nom: 'Grove RT750 (50TN)', m: 1546, pct: 4.8, col: 'bg-sky-500' },
                    { cod: 'GR13', nom: 'Grove RT 75S (50TN)', m: 1490, pct: 4.6, col: 'bg-indigo-500' },
                    { cod: 'GR20', nom: 'Demag AC-200 (200TN)', m: 1254, pct: 3.9, col: 'bg-teal-500' },
                    { cod: 'GR07', nom: 'P&H R200 (20TN)', m: 1118, pct: 3.5, col: 'bg-purple-500' },
                    { cod: 'RESTO', nom: '21 Grúas Restantes', m: 3750, pct: 11.5, col: 'bg-slate-400' }
                  ].map((item) => (
                    <div key={item.cod} className="space-y-0.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800 flex items-center gap-1.5">
                          <span className="font-mono text-sky-800 font-bold">{item.cod}</span>
                          <span className="truncate max-w-[160px]">{item.nom}</span>
                        </span>
                        <span className="font-mono font-bold text-slate-900">
                          {formatCurrency(item.m)} <span className="text-[10px] text-slate-500 font-normal">({item.pct}%)</span>
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div style={{ width: `${item.pct}%` }} className={`h-full ${item.col} rounded-full transition-all`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gráfica Comparativa de Cambios Técnicos */}
              <div className="lg:col-span-7 space-y-3">
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                    <span>Grúas con Mayor Variación Técnica (Julio vs Agosto)</span>
                    <span className="text-[11px] font-mono text-slate-500 font-bold">Auditoría Taller</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {FLOTA_GRUAS_TIMACA_2026.detalleGruasMayorVariacion.map((dg) => (
                      <div key={dg.codigo} className="p-2 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-mono font-black text-slate-800">{dg.codigo.replace('EEI-C-', '')}</span>
                          <span className={`font-mono font-bold text-[10px] ${dg.variacion.includes('▲') ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {dg.variacion}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="text-slate-500">Jul: ${Math.round(dg.jul / 1000)}k</span>
                          <span className="font-bold text-slate-900">Ago: ${Math.round(dg.ago / 1000)}k</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2 leading-relaxed">
                  <h3 className="font-bold text-slate-900 uppercase">Auditoría Técnica de Grúas en Taller</h3>
                  <p>• <strong>Subieron:</strong> GR17 (Grove TM 890 - 90TN, $23.206 USD): reemplazo de cauchos ($12,6K USD) y fabricación de sello hidráulico ($7,3K USD). GR07 y GR03: fabricación de sellos hidráulicos.</p>
                  <p>• <strong>Bajaron:</strong> GR16 y GR24: en julio se ejecutó fabricación de sello hidráulico ($1,1K y $1,6K USD) que concluyó y no se repitió en agosto. GR08: solo servicio menor de cristalería por $110 USD.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer de Navegación de Diapositiva */}
        <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>TIMACA 2026</span>
            <span>•</span>
            <span className="font-mono">{slides[currentSlide].title}</span>
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
