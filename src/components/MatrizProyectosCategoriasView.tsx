import React, { useState, useMemo } from 'react';
import { 
  PROYECTOS_CATEGORIAS_SEPTIEMBRE_2026,
  PROYECTOS_CATEGORIAS_AGOSTO_2026, 
  PROYECTOS_CATEGORIAS_ANUAL_2026, 
  FilaProyectoCategoriasPPT 
} from '../data/mockProyectosCategoriasPPT';
import { 
  TABLA_PPT_DISTRIBUCION_2026, 
  TOTALES_MESES_PPT, 
  CATEGORIAS_PPT_2026 
} from '../data/mockCostosTimaca';
import { calcularUsoPresupuesto, getPresupuestoPorCuenta } from '../data/presupuestosOficiales';
import { formatCurrency, formatNumber } from '../utils/dateHelpers';
import { 
  Briefcase, 
  Download, 
  Search, 
  ArrowLeft, 
  CheckCircle2, 
  Layers, 
  FileSpreadsheet, 
  Printer, 
  TrendingUp,
  ChevronRight,
  Info,
  CalendarDays,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  X,
  ExternalLink
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { GraficaMensualEvolucion } from './GraficaMensualEvolucion';

interface MatrizProyectosCategoriasViewProps {
  onVolver: () => void;
  onSelectProyecto?: (cuentaAuxiliar: string, categoria?: string) => void;
  onSelectCategoria?: (categoria: string) => void;
  initialPeriodo?: 'septiembre' | 'agosto' | 'anual';
  initialVista?: 'mensual' | 'proyectos';
}

export const MatrizProyectosCategoriasView: React.FC<MatrizProyectosCategoriasViewProps> = ({
  onVolver,
  onSelectProyecto,
  onSelectCategoria,
  initialPeriodo = 'septiembre',
  initialVista = 'mensual'
}) => {
  const [vistaActiva, setVistaActiva] = useState<'categorias' | 'proyectos'>('categorias');
  const [periodo, setPeriodo] = useState<'septiembre' | 'agosto' | 'anual'>(initialPeriodo);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [selectedProyectoModal, setSelectedProyectoModal] = useState<FilaProyectoCategoriasPPT | null>(null);
  const [selectedMesModal, setSelectedMesModal] = useState<{ mesIndex: number; mesNombre: string } | null>(null);

  // Lista de datos según período para la tabla de proyectos
  const datasetProyectos = periodo === 'septiembre' 
    ? PROYECTOS_CATEGORIAS_SEPTIEMBRE_2026 
    : periodo === 'agosto' 
    ? PROYECTOS_CATEGORIAS_AGOSTO_2026 
    : PROYECTOS_CATEGORIAS_ANUAL_2026;

  // Filtrado por buscador para proyectos
  const filasFiltradasProyectos = useMemo(() => {
    if (!searchTerm) return datasetProyectos;
    const q = searchTerm.toLowerCase();
    return datasetProyectos.filter(p => 
      p.cuentaAuxiliar.toLowerCase().includes(q) ||
      p.proyecto.toLowerCase().includes(q) ||
      p.proyectoCorto.toLowerCase().includes(q)
    );
  }, [datasetProyectos, searchTerm]);

  // Totales de la matriz de proyectos
  const totalesProyectos = useMemo(() => {
    return filasFiltradasProyectos.reduce((acc, p) => {
      acc.materiales += p.materiales;
      acc.servicios += p.servicios;
      acc.manoDeObra += p.manoDeObra;
      acc.horasMaquina += p.horasMaquina;
      acc.indirectos += p.indirectos;
      acc.totalProyecto += p.totalProyecto;
      acc.porcentaje += p.porcentaje;
      return acc;
    }, {
      materiales: 0,
      servicios: 0,
      manoDeObra: 0,
      horasMaquina: 0,
      indirectos: 0,
      totalProyecto: 0,
      porcentaje: 0
    });
  }, [filasFiltradasProyectos]);

  // Nombres de los meses oficiales (Enero a Septiembre 2026)
  const MESES_NOMBRES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre'];

  // Totales mensuales oficiales
  const totalesMensualesOficiales = useMemo(() => {
    return [0, 1, 2, 3, 4, 5, 6, 7, 8].map(mIdx => {
      return TABLA_PPT_DISTRIBUCION_2026.reduce((sum, cat) => sum + (cat.meses[mIdx] || 0), 0);
    });
  }, []);

  const totalAnualGlobal = totalesMensualesOficiales.reduce((acc, v) => acc + v, 0);

  // Distribución mensual por cada uno de los 20 proyectos (Enero a Agosto)
  const filasMensualesProyectos = useMemo(() => {
    return PROYECTOS_CATEGORIAS_ANUAL_2026.map(p => {
      const mesesValores = totalesMensualesOficiales.map(totMes => {
        return Math.round(totMes * (p.porcentaje / 100));
      });
      const totalPry = mesesValores.reduce((acc, v) => acc + v, 0);
      return {
        ...p,
        meses: mesesValores,
        totalCalculado: totalPry
      };
    });
  }, [totalesMensualesOficiales]);

  const filasMensualesProyectosFiltradas = useMemo(() => {
    if (!searchTerm) return filasMensualesProyectos;
    const q = searchTerm.toLowerCase();
    return filasMensualesProyectos.filter(p =>
      p.cuentaAuxiliar.toLowerCase().includes(q) ||
      p.proyecto.toLowerCase().includes(q) ||
      p.proyectoCorto.toLowerCase().includes(q)
    );
  }, [filasMensualesProyectos, searchTerm]);

  // Colores distintivos de las 5 categorías
  const categoryColorPill: Record<string, string> = {
    'Materiales Directos': 'bg-blue-100 text-blue-800 border-blue-200',
    'Servicios': 'bg-orange-100 text-orange-800 border-orange-200',
    'Mano de Obra Directa': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'Horas Maquina': 'bg-purple-100 text-purple-800 border-purple-200',
    'Costos Indirectos': 'bg-amber-100 text-amber-800 border-amber-200'
  };

  // Exportar a Excel según la vista activa
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    if (vistaActiva === 'categorias') {
      const dataExcel: Record<string, string | number>[] = TABLA_PPT_DISTRIBUCION_2026.map(row => ({
        'Categoría de Costo': row.categoria,
        'Enero ($)': row.meses[0],
        'Febrero ($)': row.meses[1],
        'Marzo ($)': row.meses[2],
        'Abril ($)': row.meses[3],
        'Mayo ($)': row.meses[4],
        'Junio ($)': row.meses[5],
        'Julio ($)': row.meses[6],
        'Agosto ($)': row.meses[7],
        'Septiembre ($)': row.meses[8],
        'Total 2026 ($)': row.total2026,
        '% Participación': `${((row.total2026 / totalAnualGlobal) * 100).toFixed(2)}%`,
        'Variación': row.variacion
      }));

      // Fila de Totales Mensuales
      dataExcel.push({
        'Categoría de Costo': 'TOTAL GENERAL MENSUAL',
        'Enero ($)': totalesMensualesOficiales[0],
        'Febrero ($)': totalesMensualesOficiales[1],
        'Marzo ($)': totalesMensualesOficiales[2],
        'Abril ($)': totalesMensualesOficiales[3],
        'Mayo ($)': totalesMensualesOficiales[4],
        'Junio ($)': totalesMensualesOficiales[5],
        'Julio ($)': totalesMensualesOficiales[6],
        'Agosto ($)': totalesMensualesOficiales[7],
        'Septiembre ($)': totalesMensualesOficiales[8],
        'Total 2026 ($)': totalAnualGlobal,
        '% Participación': '100.00%',
        'Variación': '+3.7%'
      });

      const ws = XLSX.utils.json_to_sheet(dataExcel);
      XLSX.utils.book_append_sheet(wb, ws, 'Distribucion Mensual 2026');
      XLSX.writeFile(wb, 'TIMACA_Distribucion_Mensual_Categorias_2026.xlsx');
    } else {
      const dataExcel: Record<string, string | number>[] = filasFiltradasProyectos.map(p => ({
        'N°': p.ranking,
        'Cuenta Auxiliar': p.cuentaAuxiliar,
        'Proyecto Externo': p.proyecto,
        'Materiales Directos ($)': p.materiales,
        'Servicios ($)': p.servicios,
        'Mano de Obra Directa ($)': p.manoDeObra,
        'Horas Máquina ($)': p.horasMaquina,
        'Costos Indirectos ($)': p.indirectos,
        'Total General ($)': p.totalProyecto,
        '% Participación': `${p.porcentaje.toFixed(2)}%`
      }));

      dataExcel.push({
        'N°': '',
        'Cuenta Auxiliar': 'TOTAL GENERAL',
        'Proyecto Externo': 'Consolidado Proyectos Externos TIMACA',
        'Materiales Directos ($)': totalesProyectos.materiales,
        'Servicios ($)': totalesProyectos.servicios,
        'Mano de Obra Directa ($)': totalesProyectos.manoDeObra,
        'Horas Máquina ($)': totalesProyectos.horasMaquina,
        'Costos Indirectos ($)': totalesProyectos.indirectos,
        'Total General ($)': totalesProyectos.totalProyecto,
        '% Participación': '100.00%'
      });

      const ws = XLSX.utils.json_to_sheet(dataExcel);
      XLSX.utils.book_append_sheet(wb, ws, 'Proyectos x Categorias');
      XLSX.writeFile(wb, `TIMACA_Proyectos_x_Categorias_${periodo === 'septiembre' ? 'Septiembre_2026' : periodo === 'agosto' ? 'Agosto_2026' : 'Acumulado_Ene_Sep_2026'}.xlsx`);
    }

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header Card */}
      <div className="bg-white p-4.5 rounded-2xl border border-neutral-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Lado izquierdo: Botón Volver secundario/ghost alineado verticalmente con el título H1 */}
        <div className="flex items-center gap-3">
          <button
            onClick={onVolver}
            className="flex items-center gap-1.5 font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200/90 px-2.5 py-1.5 rounded-lg transition-colors text-xs shadow-2xs shrink-0 self-center"
            title="Volver al Resumen General"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-[#0b2545] text-white shrink-0">
                <CalendarDays className="w-4 h-4" />
              </span>
              <h1 className="text-lg sm:text-xl font-black text-[#0b2545] tracking-tight uppercase">
                {vistaActiva === 'categorias' 
                  ? 'Distribución Mensual 2026 por Categoría'
                  : 'Distribución de Proyectos Externos por Categoría'}
              </h1>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Distribución consolidada en USD · 9 meses auditados (Enero - Septiembre 2026) · Total Acumulado: ${totalAnualGlobal.toLocaleString('de-DE')} USD
            </p>
          </div>
        </div>

        {/* Lado derecho: UN SOLO Segmented Control unificado (sin botones de descarga redundantes) */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center p-1 bg-neutral-100 rounded-xl border border-neutral-200 text-xs font-bold shadow-2xs">
            <button
              onClick={() => setVistaActiva('categorias')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                vistaActiva === 'categorias'
                  ? 'bg-[#0b2545] text-white shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Vista por Categoría</span>
            </button>
            <button
              onClick={() => setVistaActiva('proyectos')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                vistaActiva === 'proyectos'
                  ? 'bg-[#0b2545] text-white shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Vista por Proyecto (Cuentas Auxiliares)</span>
            </button>
          </div>

          {/* Switcher de período si está en la vista de proyectos */}
          {vistaActiva === 'proyectos' && (
            <div className="flex items-center p-1 bg-blue-50 rounded-xl border border-blue-200 text-xs font-bold">
              <button
                onClick={() => setPeriodo('septiembre')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  periodo === 'septiembre'
                    ? 'bg-blue-700 text-white shadow-2xs'
                    : 'text-blue-900 hover:text-blue-950'
                }`}
              >
                Septiembre ($1.64M)
              </button>
              <button
                onClick={() => setPeriodo('agosto')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  periodo === 'agosto'
                    ? 'bg-blue-700 text-white shadow-2xs'
                    : 'text-blue-900 hover:text-blue-950'
                }`}
              >
                Agosto ($1.20M)
              </button>
              <button
                onClick={() => setPeriodo('anual')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  periodo === 'anual'
                    ? 'bg-blue-700 text-white shadow-2xs'
                    : 'text-blue-900 hover:text-blue-950'
                }`}
              >
                Acumulado 9M ($12.08M)
              </button>
            </div>
          )}

          <a
            href="/Consolidado_Oficial_2026_Limpio.xlsx"
            download="Consolidado_Oficial_2026_Con_Motivos.xlsx"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition-colors shadow-2xs"
            title="Descargar el archivo Excel Consolidado Oficial 2026 enriquecido con la columna Motivo y Solicitante para filtrar por Cuenta Auxiliar"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
            <span>Excel con Motivos (.xlsx)</span>
          </a>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-white hover:bg-neutral-50 border border-neutral-300 rounded-xl transition-colors shadow-2xs"
            title="Descargar datos de la vista activa en Excel (.xlsx)"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Exportar Vista</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-neutral-700 bg-neutral-50 hover:bg-neutral-100 border border-neutral-300 rounded-xl transition-colors shadow-2xs"
            title="Imprimir lámina oficial"
          >
            <Printer className="w-3.5 h-3.5 text-neutral-600" />
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xl flex items-center gap-2 animate-fade-in font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>¡Reporte descargado exitosamente!</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 1: TABLA OFICIAL POWERPOINT - DISTRIBUCIÓN MENSUAL 2026 (ENE - SEP) */}
      {/* ========================================================================= */}
      {vistaActiva === 'categorias' && (
        <div className="space-y-5 animate-fade-in">
          {/* Executive KPI Cards: Bordes neutros suaves estandarizados y text-2xl font-bold */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-500 hover:shadow-md transition-all cursor-pointer">
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">
                Total Acumulado 2026
              </span>
              <span className="text-2xl font-bold font-mono tabular-nums text-neutral-900 block mt-1">
                ${totalAnualGlobal.toLocaleString('de-DE')} USD
              </span>
              <span className="text-[10px] text-neutral-500 mt-1 block">9 meses oficiales (Ene - Sep)</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-500 hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">
                  Mes de Mayor Desembolso
                </span>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200/60 px-1.5 py-0.2 rounded">
                  Junio
                </span>
              </div>
              <span className="text-2xl font-bold font-mono tabular-nums text-neutral-900 block mt-1">
                ${(totalesMensualesOficiales[5] || 2663899).toLocaleString('de-DE')} USD
              </span>
              <span className="text-[10px] text-neutral-500 mt-1 block">
                {totalAnualGlobal > 0 ? (((totalesMensualesOficiales[5] || 2663899) / totalAnualGlobal) * 100).toFixed(1) : '22.6'}% del total anual consolidado
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-500 hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">
                  Mes Actual Auditado
                </span>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200/60 px-1.5 py-0.2 rounded">
                  Septiembre
                </span>
              </div>
              <span className="text-2xl font-bold font-mono tabular-nums text-neutral-900 block mt-1">
                ${(totalesMensualesOficiales[8] || 1097082).toLocaleString('de-DE')} USD
              </span>
              <span className="text-[10px] text-neutral-500 mt-1 block">
                {totalAnualGlobal > 0 ? (((totalesMensualesOficiales[8] || 1097082) / totalAnualGlobal) * 100).toFixed(1) : '8.8'}% del total anual consolidado
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-500 hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">
                  Mayor Categoría de Inversión
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.2 rounded">
                  {totalAnualGlobal > 0 ? (((TABLA_PPT_DISTRIBUCION_2026[0]?.total2026 || 4073732) / totalAnualGlobal) * 100).toFixed(2) : '32.79'}%
                </span>
              </div>
              <span className="text-2xl font-bold font-mono tabular-nums text-neutral-900 block mt-1">
                ${(TABLA_PPT_DISTRIBUCION_2026[0]?.total2026 || 4073732).toLocaleString('de-DE')} USD
              </span>
              <span className="text-[10px] text-neutral-500 mt-1 block truncate" title="Materiales Directos · 9 meses auditados (Ene - Sep)">
                Materiales Directos · 9 meses auditados (Ene - Sep)
              </span>
            </div>
          </div>

          {/* Gráfica Oficial de Evolución Mensual (Curva de Tendencia y Área Apilada - Sin Barras) */}
          <GraficaMensualEvolucion
            onSelectMes={(mesIdx, mesNom) => setSelectedMesModal({ mesIndex: mesIdx, mesNombre: mesNom })}
            onSelectCategoria={(cat) => onSelectCategoria?.(cat)}
          />

          {/* Quick Informative Banner */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-700">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-[#0b2545] text-white shrink-0">
                <Info className="w-3.5 h-3.5" />
              </span>
              <span>
                <strong>Distribución Operativa 2026:</strong> Tabla 3. Distribución mensual de costos por mes operativo (9 meses auditados: Enero a Septiembre 2026). Haz clic en cualquier categoría para auditar sus subconceptos.
              </span>
            </div>
            <span className="text-[11px] font-bold text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shrink-0 self-start sm:self-auto">
              5 Categorías · 9 Meses
            </span>
          </div>

          {/* TABLA OFICIAL: CABECERA GRIS SUAVE, ALINEACIÓN TABULAR DERECHA Y PIE CLARO */}
          <div className="bg-white rounded-xl border border-neutral-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300">
              <table className="w-full text-left text-xs border-collapse min-w-[1320px]">
                <thead>
                  {/* Cabecera con fondo gris neutro suave bg-slate-50 */}
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                    <th className="py-3 px-3.5 min-w-[200px] text-slate-700 font-bold text-left">
                      Distribución / Categoría
                    </th>
                    {MESES_NOMBRES.map((m, idx) => (
                      <th 
                        key={m} 
                        onClick={() => setSelectedMesModal({ mesIndex: idx, mesNombre: m })}
                        className="py-3 px-3 text-right font-mono capitalize text-slate-600 font-semibold cursor-pointer hover:text-blue-700 hover:bg-blue-50/50 transition-colors min-w-[95px] whitespace-nowrap"
                        title={`Haz clic para ver el desglose completo de ${m}`}
                      >
                        {m.toLowerCase()}
                      </th>
                    ))}
                    <th className="py-3 px-3.5 text-right text-slate-900 font-bold font-mono min-w-[130px] bg-slate-100 whitespace-nowrap">
                      Total 2026
                    </th>
                    <th className="py-3 px-2.5 text-right text-slate-600 font-semibold font-mono min-w-[80px] whitespace-nowrap">
                      % Part.
                    </th>
                    <th className="py-3 px-3 text-right min-w-[105px] text-slate-600 font-semibold whitespace-nowrap">
                      Variación
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 bg-white">
                  {TABLA_PPT_DISTRIBUCION_2026.map((row) => {
                    const pct = ((row.total2026 / totalAnualGlobal) * 100).toFixed(2);
                    return (
                      <tr 
                        key={row.categoria} 
                        onClick={() => onSelectCategoria?.(row.categoria)}
                        className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                        title={`Haz clic para ver el desglose detallado de ${row.categoria}`}
                      >
                        <td className="py-3.5 px-3.5 font-bold text-neutral-900 group-hover:text-blue-700">
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="flex items-center gap-2">
                              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                                row.categoria === 'Materiales Directos' ? 'bg-blue-600'
                                : row.categoria === 'Servicios' ? 'bg-orange-500'
                                : row.categoria === 'Mano de Obra Directa' ? 'bg-emerald-600'
                                : row.categoria === 'Horas Maquina' ? 'bg-purple-600'
                                : 'bg-amber-500'
                              }`} />
                              <span>{row.categoria}</span>
                            </span>
                            <span className="text-[10px] text-blue-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                              <span>Auditar</span>
                              <ChevronRight className="w-3 h-3" />
                            </span>
                          </div>
                        </td>
                        {row.meses.map((val, idx) => (
                          <td 
                            key={idx} 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMesModal({ mesIndex: idx, mesNombre: MESES_NOMBRES[idx] });
                            }}
                            className="py-3.5 px-3 text-right font-mono tabular-nums text-neutral-700 cursor-pointer hover:bg-blue-100/70 hover:text-blue-900 transition-colors font-medium min-w-[95px] whitespace-nowrap"
                            title={`Ver desglose de ${MESES_NOMBRES[idx]} (${row.categoria}: $${val.toLocaleString('de-DE')})`}
                          >
                            ${val.toLocaleString('de-DE')}
                          </td>
                        ))}
                        <td className="py-3.5 px-3.5 text-right font-mono font-bold tabular-nums text-neutral-900 bg-slate-50/70 text-xs sm:text-sm min-w-[130px] whitespace-nowrap">
                          ${row.total2026.toLocaleString('de-DE')}
                        </td>
                        <td className="py-3.5 px-2.5 text-right font-mono font-semibold tabular-nums text-neutral-600 text-[11px] min-w-[80px] whitespace-nowrap">
                          {pct}%
                        </td>
                        <td className="py-3.5 px-3 text-right whitespace-nowrap min-w-[105px]">
                          <span className={`inline-flex items-center justify-end gap-1 px-2 py-0.5 rounded-md font-mono font-bold text-[11px] ${
                            row.esPositiva 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : row.variacionNum < 0 
                              ? 'bg-amber-50 text-amber-800 border border-amber-200' 
                              : 'bg-neutral-100 text-neutral-700'
                          }`}>
                            {row.esPositiva ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            <span>{row.variacion}</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                {/* Pie de tabla con fondo claro destacado bg-slate-100 y borde superior de 2px */}
                <tfoot className="sticky bottom-0 z-10 bg-slate-100 border-t-2 border-slate-300 text-slate-900 font-bold text-xs shadow-xs">
                  <tr>
                    <td className="py-3.5 px-3.5 uppercase tracking-wider font-extrabold text-slate-900">
                      TOTAL GENERAL MENSUAL
                    </td>
                    {totalesMensualesOficiales.map((val, idx) => (
                      <td key={idx} className="py-3.5 px-3 text-right font-mono tabular-nums font-bold text-slate-900 min-w-[95px] whitespace-nowrap">
                        ${val.toLocaleString('de-DE')}
                      </td>
                    ))}
                    <td className="py-3.5 px-3.5 text-right font-mono text-xs sm:text-sm font-black text-slate-900 bg-slate-200/70 tabular-nums min-w-[130px] whitespace-nowrap">
                      ${totalAnualGlobal.toLocaleString('de-DE')}
                    </td>
                    <td className="py-3.5 px-2.5 text-right font-mono text-slate-700 font-bold text-[11px] tabular-nums min-w-[80px] whitespace-nowrap">
                      100.00%
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-[11px] font-bold text-emerald-700 min-w-[105px] whitespace-nowrap">
                      <span className="inline-flex items-center justify-end gap-1 px-2 py-0.5 rounded-md font-mono font-bold text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <ArrowUpRight className="w-3 h-3" />
                        <span>+3.7%</span>
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 2: PROYECTOS EXTERNOS POR CATEGORÍA (20 CUENTAS AUXILIARES PPT)     */}
      {/* ========================================================================= */}
      {vistaActiva === 'proyectos' && (
        <div className="space-y-5 animate-fade-in">
          {/* KPI Highlights for Projects con bordes neutros y fuentes tabulares */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-500 hover:shadow-md transition-all cursor-pointer">
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">
                Total Proyectos
              </span>
              <span className="text-base font-black font-mono text-[#0b2545] block mt-0.5 tabular-nums">
                ${totalesProyectos.totalProyecto.toLocaleString('de-DE')} USD
              </span>
              <span className="text-[10px] text-neutral-400 mt-0.5 block">{filasFiltradasProyectos.length} cuentas activas</span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-500 hover:shadow-md transition-all cursor-pointer">
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                Materiales Directos
              </span>
              <span className="text-base font-black font-mono text-neutral-900 block mt-0.5 tabular-nums">
                ${totalesProyectos.materiales.toLocaleString('de-DE')}
              </span>
              <span className="text-[10px] text-blue-600 font-semibold mt-0.5 block">
                {((totalesProyectos.materiales / (totalesProyectos.totalProyecto || 1)) * 100).toFixed(1)}% del total
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-500 hover:shadow-md transition-all cursor-pointer">
              <span className="text-[10px] font-bold text-orange-700 uppercase tracking-wider block">
                Servicios
              </span>
              <span className="text-base font-black font-mono text-neutral-900 block mt-0.5 tabular-nums">
                ${totalesProyectos.servicios.toLocaleString('de-DE')}
              </span>
              <span className="text-[10px] text-orange-600 font-semibold mt-0.5 block">
                {((totalesProyectos.servicios / (totalesProyectos.totalProyecto || 1)) * 100).toFixed(1)}% del total
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-500 hover:shadow-md transition-all cursor-pointer">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                Mano de Obra Directa
              </span>
              <span className="text-base font-black font-mono text-neutral-900 block mt-0.5 tabular-nums">
                ${totalesProyectos.manoDeObra.toLocaleString('de-DE')}
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 block">
                {((totalesProyectos.manoDeObra / (totalesProyectos.totalProyecto || 1)) * 100).toFixed(1)}% del total
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-500 hover:shadow-md transition-all cursor-pointer">
              <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">
                Horas Máquina
              </span>
              <span className="text-base font-black font-mono text-neutral-900 block mt-0.5 tabular-nums">
                ${totalesProyectos.horasMaquina.toLocaleString('de-DE')}
              </span>
              <span className="text-[10px] text-purple-600 font-semibold mt-0.5 block">
                {((totalesProyectos.horasMaquina / (totalesProyectos.totalProyecto || 1)) * 100).toFixed(1)}% del total
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-500 hover:shadow-md transition-all cursor-pointer">
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                Costos Indirectos
              </span>
              <span className="text-base font-black font-mono text-neutral-900 block mt-0.5 tabular-nums">
                ${totalesProyectos.indirectos.toLocaleString('de-DE')}
              </span>
              <span className="text-[10px] text-amber-600 font-semibold mt-0.5 block">
                {((totalesProyectos.indirectos / (totalesProyectos.totalProyecto || 1)) * 100).toFixed(1)}% del total
              </span>
            </div>
          </div>

          {/* Search bar and Filters */}
          <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por código de cuenta o nombre de proyecto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="text-xs text-neutral-500 font-medium">
              Mostrando <strong>{filasFiltradasProyectos.length}</strong> proyectos auditados en {periodo === 'septiembre' ? 'Septiembre 2026' : periodo === 'agosto' ? 'Agosto 2026' : 'Acumulado 2026 (Ene - Sep · 9 Meses)'}
            </div>
          </div>

          {/* Tabla de 20 Proyectos por Categoría: Cabecera gris suave y fila de totales clara */}
          <div className="bg-white rounded-xl border border-neutral-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto max-h-[640px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300">
              <table className="w-full text-left text-xs border-collapse min-w-[1380px]">
                <thead className="sticky top-0 z-10 bg-slate-100 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3 px-3 text-center w-12 text-slate-500">N°</th>
                    <th className="py-3 px-3.5 w-32 text-slate-700 font-bold whitespace-nowrap">Cuenta</th>
                    <th className="py-3 px-4 min-w-[320px] max-w-[420px] text-slate-700 font-bold">Proyecto / Obra</th>
                    <th className="py-3 px-3 text-right font-mono text-slate-600 min-w-[110px] whitespace-nowrap" title="Materiales Directos">Materiales ($)</th>
                    <th className="py-3 px-3 text-right font-mono text-slate-600 min-w-[110px] whitespace-nowrap" title="Servicios Especializados">Servicios ($)</th>
                    <th className="py-3 px-3 text-right font-mono text-slate-600 min-w-[110px] whitespace-nowrap" title="Mano de Obra Directa">MOD ($)</th>
                    <th className="py-3 px-3 text-right font-mono text-slate-600 min-w-[100px] whitespace-nowrap" title="Horas Máquina">H. Máq. ($)</th>
                    <th className="py-3 px-3 text-right font-mono text-slate-600 min-w-[110px] whitespace-nowrap" title="Costos Indirectos">Indirectos ($)</th>
                    <th className="py-3 px-3.5 text-right font-bold text-slate-900 font-mono min-w-[130px] bg-slate-200/50 whitespace-nowrap">Total ($)</th>
                    <th className="py-3 px-2.5 text-right font-semibold text-slate-600 min-w-[80px] whitespace-nowrap">% Part.</th>
                    <th className="py-3 px-3 text-right font-mono text-slate-700 font-bold min-w-[125px] whitespace-nowrap">Presupuesto ($)</th>
                    <th className="py-3 px-3 text-center font-semibold text-slate-700 min-w-[90px] whitespace-nowrap">% Uso</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 bg-white">
                  {filasFiltradasProyectos.map((p) => {
                    const pObj = getPresupuestoPorCuenta(p.cuentaAuxiliar);
                    const met = pObj && pObj.totalPresupuesto > 0 ? calcularUsoPresupuesto(p.cuentaAuxiliar, p.totalProyecto) : null;

                    return (
                      <tr
                        key={p.cuentaAuxiliar}
                        onClick={() => setSelectedProyectoModal(p)}
                        className="hover:bg-blue-50/70 transition-colors cursor-pointer group"
                        title={`Haz clic para ver el desglose completo de ${p.cuentaAuxiliar} - ${p.proyectoCorto}`}
                      >
                        <td className="py-3 px-3 text-center font-bold text-neutral-400 group-hover:text-blue-700 text-xs">
                          {p.ranking}
                        </td>
                        <td className="py-3 px-3.5 whitespace-nowrap">
                          <span className="font-mono font-bold text-blue-700 text-xs px-2 py-0.5 rounded bg-blue-50 border border-blue-200 inline-block">
                            {p.cuentaAuxiliar}
                          </span>
                        </td>
                        <td className="py-3 px-4 min-w-[320px] max-w-[420px]">
                          <div className="font-bold text-slate-900 text-xs leading-snug group-hover:text-blue-700" title={p.proyectoCorto}>
                            {p.proyectoCorto}
                          </div>
                          <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5" title={p.proyecto}>
                            {p.proyecto}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-xs tabular-nums text-slate-700 min-w-[110px]">
                          {p.materiales > 0 ? `$${p.materiales.toLocaleString('de-DE')}` : '-'}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-xs tabular-nums text-slate-700 min-w-[110px]">
                          {p.servicios > 0 ? `$${p.servicios.toLocaleString('de-DE')}` : '-'}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-xs tabular-nums text-slate-700 min-w-[110px]">
                          {p.manoDeObra > 0 ? `$${p.manoDeObra.toLocaleString('de-DE')}` : '-'}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-xs tabular-nums text-slate-700 min-w-[100px]">
                          {p.horasMaquina > 0 ? `$${p.horasMaquina.toLocaleString('de-DE')}` : '-'}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-xs tabular-nums text-slate-700 min-w-[110px]">
                          {p.indirectos > 0 ? `$${p.indirectos.toLocaleString('de-DE')}` : '-'}
                        </td>
                        <td className="py-3 px-3.5 text-right font-mono font-bold tabular-nums text-slate-950 bg-slate-100/70 text-xs min-w-[130px]">
                          ${p.totalProyecto.toLocaleString('de-DE')}
                        </td>
                        <td className="py-3 px-2.5 text-right font-mono font-semibold text-neutral-600 text-[11px] min-w-[80px]">
                          {p.porcentaje.toFixed(2)}%
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-xs text-slate-700 min-w-[125px]">
                          {pObj && pObj.totalPresupuesto > 0 
                            ? `$${pObj.totalPresupuesto.toLocaleString('de-DE', { maximumFractionDigits: 0 })}` 
                            : '-'}
                        </td>
                        <td className="py-3 px-3 text-center min-w-[90px]">
                          {met ? (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border inline-block ${
                              met.estadoAlerta === 'critico' || met.estadoAlerta === 'excedido'
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : met.estadoAlerta === 'alerta'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}>
                              {met.porcentajeUso}%
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px]">S/P</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="sticky bottom-0 z-10 bg-slate-100 border-t-2 border-slate-300 text-slate-900 font-bold text-xs shadow-xs">
                  <tr>
                    <td colSpan={3} className="py-3.5 px-4 uppercase tracking-wider font-extrabold text-slate-900 text-xs">
                      TOTAL GENERAL ({filasFiltradasProyectos.length} CUENTAS AUXILIARES)
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono tabular-nums font-bold text-slate-900 min-w-[110px]">
                      ${totalesProyectos.materiales.toLocaleString('de-DE')}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono tabular-nums font-bold text-slate-900 min-w-[110px]">
                      ${totalesProyectos.servicios.toLocaleString('de-DE')}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono tabular-nums font-bold text-slate-900 min-w-[110px]">
                      ${totalesProyectos.manoDeObra.toLocaleString('de-DE')}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono tabular-nums font-bold text-slate-900 min-w-[100px]">
                      ${totalesProyectos.horasMaquina.toLocaleString('de-DE')}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono tabular-nums font-bold text-slate-900 min-w-[110px]">
                      ${totalesProyectos.indirectos.toLocaleString('de-DE')}
                    </td>
                    <td className="py-3.5 px-3.5 text-right font-mono tabular-nums font-black text-blue-950 bg-blue-100 text-xs min-w-[130px]">
                      ${totalesProyectos.totalProyecto.toLocaleString('de-DE')}
                    </td>
                    <td className="py-3.5 px-2.5 text-right font-mono text-slate-700 font-bold text-[11px] min-w-[80px]">
                      100.00%
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-slate-900 font-bold text-xs min-w-[125px]">
                      ${filasFiltradasProyectos.reduce((acc, p) => acc + (getPresupuestoPorCuenta(p.cuentaAuxiliar)?.totalPresupuesto || 0), 0).toLocaleString('de-DE', { maximumFractionDigits: 0 })}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono text-blue-900 font-bold text-[11px] min-w-[90px]">
                      {(() => {
                        const totP = filasFiltradasProyectos.reduce((acc, p) => acc + (getPresupuestoPorCuenta(p.cuentaAuxiliar)?.totalPresupuesto || 0), 0);
                        const totE = filasFiltradasProyectos.reduce((acc, p) => {
                          const pObj = getPresupuestoPorCuenta(p.cuentaAuxiliar);
                          return acc + (pObj && pObj.totalPresupuesto > 0 ? p.totalProyecto : 0);
                        }, 0);
                        return totP > 0 ? `${((totE / totP) * 100).toFixed(1)}%` : '-';
                      })()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DESGLOSE DE PROYECTO */}
      {selectedProyectoModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Encabezado */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    selectedProyectoModal.ranking === 1
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-blue-100 text-blue-900 border border-blue-200'
                  }`}>
                    {selectedProyectoModal.ranking === 1 ? '★ #1 Proyecto Dominante' : `Ranking #${selectedProyectoModal.ranking}`}
                  </span>
                  <span className="font-mono font-bold text-sm text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded">
                    {selectedProyectoModal.cuentaAuxiliar}
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900">
                  {selectedProyectoModal.proyectoCorto}
                </h3>
                <p className="text-xs text-slate-600">
                  {selectedProyectoModal.proyecto}
                </p>
              </div>
              <button
                onClick={() => setSelectedProyectoModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Proyecto</span>
                <span className="text-lg font-black font-mono text-slate-900 block mt-0.5">
                  ${selectedProyectoModal.totalProyecto.toLocaleString('de-DE')} <span className="text-xs text-slate-500">USD</span>
                </span>
                <span className="text-[10px] text-slate-500">Cifras purificadas sin normalización</span>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                <span className="text-[10px] uppercase font-bold text-blue-700 block">% Participación TIMACA</span>
                <span className="text-lg font-black font-mono text-blue-900 block mt-0.5">
                  {selectedProyectoModal.porcentaje.toFixed(2)}%
                </span>
                <span className="text-[10px] text-blue-600">Sobre total consolidado de proyectos</span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="text-[10px] uppercase font-bold text-emerald-700 block">Período Seleccionado</span>
                <span className="text-sm font-bold text-emerald-950 block mt-1">
                  {periodo === 'agosto' ? 'Agosto 2026 (Cierre)' : 'Año 2026 (Acumulado)'}
                </span>
                <span className="text-[10px] text-emerald-700">Auditado contra Modelo Estrella</span>
              </div>
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
                <span className="text-[10px] uppercase font-bold text-purple-700 block">Control Presupuestario</span>
                {(() => {
                  const met = calcularUsoPresupuesto(selectedProyectoModal.cuentaAuxiliar, selectedProyectoModal.totalProyecto);
                  if (met.tienePresupuesto) {
                    return (
                      <>
                        <span className="text-lg font-black font-mono text-purple-900 block mt-0.5">
                          ${met.totalPresupuesto.toLocaleString('de-DE')} <span className="text-xs text-purple-600">USD</span>
                        </span>
                        <span className="text-[10px] text-purple-800 font-bold block mt-0.5">
                          Uso: {met.porcentajeUso}% {met.oc ? `(OC: ${met.oc})` : ''}
                        </span>
                      </>
                    );
                  }
                  return (
                    <>
                      <span className="text-sm font-bold font-mono text-neutral-400 block mt-1">Sin Presupuesto</span>
                      <span className="text-[10px] text-neutral-500">Administración directa</span>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Desglose de las 5 Categorías */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Composición en las 5 Categorías Oficiales TIMACA
              </h4>
              <div className="space-y-2.5">
                {[
                  { nombre: 'Materiales Directos', monto: selectedProyectoModal.materiales, color: '#2563eb' },
                  { nombre: 'Servicios', monto: selectedProyectoModal.servicios, color: '#f97316' },
                  { nombre: 'Mano de Obra Directa', monto: selectedProyectoModal.manoDeObra, color: '#10b981' },
                  { nombre: 'Horas Máquina', monto: selectedProyectoModal.horasMaquina, color: '#8b5cf6' },
                  { nombre: 'Costos Indirectos', monto: selectedProyectoModal.indirectos, color: '#d97706' }
                ].map((c) => {
                  const pct = selectedProyectoModal.totalProyecto > 0
                    ? ((c.monto / selectedProyectoModal.totalProyecto) * 100).toFixed(1)
                    : '0.0';
                  return (
                    <div key={c.nombre} className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 font-bold text-slate-800">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                          <span>{c.nombre}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-slate-500 font-medium text-[11px]">{pct}%</span>
                          <span className="font-mono font-bold text-slate-900 text-xs">
                            ${c.monto.toLocaleString('de-DE')} USD
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(parseFloat(pct), 100)}%`, backgroundColor: c.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer con Acciones */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <span className="text-xs text-slate-500">
                Cuenta Auxiliar: <strong>{selectedProyectoModal.cuentaAuxiliar}</strong>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const cta = selectedProyectoModal.cuentaAuxiliar;
                    setSelectedProyectoModal(null);
                    onSelectProyecto?.(cta);
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Ver Auditoría Completa en Proyectos</span>
                </button>
                <button
                  onClick={() => setSelectedProyectoModal(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DESGLOSE MENSUAL */}
      {selectedMesModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Encabezado */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-blue-100 text-blue-900 border border-blue-200">
                    Mes Oficial #{selectedMesModal.mesIndex + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    Año 2026
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900">
                  Desglose Oficial de {selectedMesModal.mesNombre} 2026
                </h3>
              </div>
              <button
                onClick={() => setSelectedMesModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Total Mes */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Desembolsado en {selectedMesModal.mesNombre}</span>
                <span className="text-xl font-black font-mono text-slate-900 block mt-0.5">
                  ${totalesMensualesOficiales[selectedMesModal.mesIndex]?.toLocaleString('de-DE')} USD
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block">% sobre Total 2026</span>
                <span className="text-sm font-bold font-mono text-blue-700">
                  {((totalesMensualesOficiales[selectedMesModal.mesIndex] / totalAnualGlobal) * 100).toFixed(2)}%
                </span>
              </div>
            </div>

            {/* Desglose 5 Categorías para este Mes */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Distribución por Categorías en {selectedMesModal.mesNombre}
              </h4>
              {TABLA_PPT_DISTRIBUCION_2026.map((row) => {
                const montoMes = row.meses[selectedMesModal.mesIndex] || 0;
                const totMes = totalesMensualesOficiales[selectedMesModal.mesIndex] || 1;
                const pct = ((montoMes / totMes) * 100).toFixed(1);
                return (
                  <div 
                    key={row.categoria}
                    onClick={() => {
                      setSelectedMesModal(null);
                      onSelectCategoria?.(row.categoria);
                    }}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200 cursor-pointer transition-colors space-y-1.5"
                    title={`Ver detalle de ${row.categoria}`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{row.categoria}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-slate-500 text-[11px]">{pct}%</span>
                        <span className="font-mono font-bold text-slate-900 text-xs">
                          ${montoMes.toLocaleString('de-DE')} USD
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${Math.min(parseFloat(pct), 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                onClick={() => setSelectedMesModal(null)}
                className="px-4 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
