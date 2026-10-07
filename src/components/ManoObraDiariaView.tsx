import React, { useState, useMemo } from 'react';
import { generateMockManoObraDiaria, CUENTAS_CORTAS_MAP } from '../data/mockManoObraDiaria';
import { formatCurrency, formatNumber } from '../utils/dateHelpers';
import { 
  Users, 
  Calendar, 
  Search, 
  Download, 
  Clock, 
  DollarSign, 
  Briefcase, 
  Filter, 
  CheckCircle2,
  FileSpreadsheet,
  ArrowUpDown,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface ManoObraDiariaViewProps {
  onVolver?: () => void;
}

export const ManoObraDiariaView: React.FC<ManoObraDiariaViewProps> = ({ onVolver }) => {
  const allRegistros = useMemo(() => generateMockManoObraDiaria(), []);

  // Filter states
  const [selectedMes, setSelectedMes] = useState<number>(9); // 9 = Septiembre 2026, 0 = todos
  const [selectedSemana, setSelectedSemana] = useState<number>(0); // 0 = all
  const [selectedFecha, setSelectedFecha] = useState<string>('todas');
  const [selectedCuenta, setSelectedCuenta] = useState<string>('todas');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Available weeks based on selected month
  const semanasDisponibles = useMemo(() => {
    const list = selectedMes === 0 ? allRegistros : allRegistros.filter(r => r.mes === selectedMes);
    const setSem = new Set<number>();
    list.forEach(r => setSem.add(r.semana));
    return Array.from(setSem).sort((a, b) => a - b);
  }, [allRegistros, selectedMes]);

  // List of all dates available for the currently selected month and week (or all)
  const fechasDisponibles = useMemo(() => {
    let list = selectedMes === 0 ? allRegistros : allRegistros.filter(r => r.mes === selectedMes);
    if (selectedSemana !== 0) {
      list = list.filter(r => r.semana === selectedSemana);
    }
    
    const mapFechas = new Map<string, string>();
    list.forEach(r => {
      if (!mapFechas.has(r.fecha)) {
        mapFechas.set(r.fecha, `${r.fecha} (${r.diaSemana} · S${r.semana})`);
      }
    });

    return Array.from(mapFechas.entries()).map(([fecha, label]) => ({
      fecha,
      label
    })).sort((a, b) => a.fecha.localeCompare(b.fecha));
  }, [allRegistros, selectedMes, selectedSemana]);

  // Unique list of cuentas auxiliares in records
  const cuentasDisponibles = useMemo(() => {
    const setC = new Set<string>();
    const list = selectedMes === 0 ? allRegistros : allRegistros.filter(r => r.mes === selectedMes);
    list.forEach(r => setC.add(r.cuentaAuxiliar));
    return Array.from(setC).sort();
  }, [allRegistros, selectedMes]);

  // Filtered records
  const registrosFiltrados = useMemo(() => {
    return allRegistros.filter(r => {
      const matchMes = selectedMes === 0 || r.mes === selectedMes;
      const matchSem = selectedSemana === 0 || r.semana === selectedSemana;
      const matchFec = selectedFecha === 'todas' || r.fecha === selectedFecha;
      const matchCta = selectedCuenta === 'todas' || r.cuentaAuxiliar === selectedCuenta;
      const matchSearch = !searchTerm || 
        r.trabajador.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.cedula.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.cargo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.proyectoCorto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.sourceFile.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchMes && matchSem && matchFec && matchCta && matchSearch;
    });
  }, [allRegistros, selectedMes, selectedSemana, selectedFecha, selectedCuenta, searchTerm]);

  // Summary Metrics
  const totalMonto = useMemo(() => {
    return registrosFiltrados.reduce((sum, r) => sum + r.totalPagarUsd, 0);
  }, [registrosFiltrados]);

  const totalHoras = useMemo(() => {
    return registrosFiltrados.reduce((sum, r) => sum + r.totalHoras, 0);
  }, [registrosFiltrados]);

  const totalHorasExtras = useMemo(() => {
    return registrosFiltrados.reduce((sum, r) => sum + r.horasExtras, 0);
  }, [registrosFiltrados]);

  // Count distinct worker names across all attendance sheets
  const trabajadoresUnicos = useMemo(() => {
    return new Set(registrosFiltrados.map(r => r.trabajador.trim().toUpperCase())).size;
  }, [registrosFiltrados]);

  // Export to Excel
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    const dataExcel = registrosFiltrados.map(r => ({
      'Fecha': r.fecha,
      'Día': r.diaSemana,
      'Semana': `Semana ${r.semana}`,
      'Cédula': r.cedula,
      'Trabajador': r.trabajador,
      'Cargo / Especialidad': r.cargo,
      'Cuenta Auxiliar': r.cuentaAuxiliar,
      'Proyecto': r.proyectoCorto,
      'Horas Normales': r.horasNormales,
      'Horas Extras': r.horasExtras,
      'Total Horas': r.totalHoras,
      'Tarifa USD/Hora': r.tarifaHoraUsd,
      'Monto Normal (USD)': r.montoNormalUsd,
      'Monto Extra (USD)': r.montoExtraUsd,
      'Total a Pagar (USD)': r.totalPagarUsd,
      'Archivo Nómina RRHH': r.sourceFile
    }));

    const ws = XLSX.utils.json_to_sheet(dataExcel);
    XLSX.utils.book_append_sheet(wb, ws, 'Mano_de_Obra_Diaria');
    XLSX.writeFile(wb, `TIMACA_Mano_de_Obra_Diaria_Agosto_2026.xlsx`);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onVolver && (
            <button
              onClick={onVolver}
              className="flex items-center gap-1.5 font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200/90 px-2.5 py-1.5 rounded-lg transition-colors text-xs shadow-2xs shrink-0 self-center"
              title="Volver al Resumen General"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver</span>
            </button>
          )}
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900 tracking-tight">
                Auditoría Diaria de Mano de Obra Directa (MOD)
              </h2>
              <p className="text-xs text-neutral-500">
                {selectedMes === 9
                  ? 'Nómina Devengada de Septiembre 2026 ($351.891 USD) · Prorrateo diario por días hábiles trabajados · Semanas 35 a 39'
                  : selectedMes === 8
                  ? 'Calendario diario completo de Agosto 2026 (del 01 al 31 de Agosto) · Trabajador, horas ordinarias, extras y monto a pagar'
                  : 'Consolidado de Mano de Obra Directa 2026 · Trabajador, horas ordinarias y monto a pagar'}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleExportExcel}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 rounded-xl hover:bg-emerald-100 transition-colors shadow-xs"
        >
          <Download className="w-4 h-4 text-emerald-700" />
          <span>Exportar Planilla Diaria (.xlsx)</span>
        </button>
      </div>

      {downloadSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-fade-in font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>¡Planilla diaria de mano de obra exportada con éxito en formato Excel!</span>
        </div>
      )}

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
              Total a Pagar (USD)
            </span>
            {(selectedSemana !== 0 || selectedFecha !== 'todas' || selectedCuenta !== 'todas' || searchTerm) ? (
              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                Corte Filtrado
              </span>
            ) : (
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                {selectedMes === 9 ? 'Septiembre Devengado' : selectedMes === 8 ? 'Agosto Completo' : 'Mes Completo'}
              </span>
            )}
          </div>
          <span className="text-2xl font-black font-mono tabular-nums text-neutral-900 block mt-1">
            ${Math.round(totalMonto).toLocaleString('de-DE')} USD
          </span>
          <span className="text-[11px] text-neutral-500 mt-1 block">
            {selectedMes === 9 && selectedSemana === 0 && selectedFecha === 'todas' && selectedCuenta === 'todas' && !searchTerm
              ? 'Nómina devengada en días de Septiembre ($351.891 USD: Cuadrillas $226.891 + Staff $125.000 · Sem 35 a 5/6 y Sem 39 a 3/6)'
              : selectedMes === 8 && selectedSemana === 0 && selectedFecha === 'todas' && selectedCuenta === 'todas' && !searchTerm
              ? 'Consolidado oficial de los 31 días de Agosto ($221.353 USD)'
              : selectedMes === 0 
                ? 'Total acumulado 2026'
                : `Corte seleccionado · ${registrosFiltrados.length} registros`}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
          <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
            Total Horas Trabajadas
          </span>
          <span className="text-2xl font-black font-mono tabular-nums text-neutral-900 block mt-1">
            {Math.round(totalHoras).toLocaleString('de-DE')} hrs
          </span>
          <span className="text-[11px] text-neutral-500 mt-1 block">
            Horas ordinarias + extras
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
          <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
            Horas Extras Auditadas
          </span>
          <span className="text-2xl font-black font-mono tabular-nums text-amber-600 block mt-1">
            {Math.round(totalHorasExtras).toLocaleString('de-DE')} hrs
          </span>
          <span className="text-[11px] text-neutral-500 mt-1 block">
            Remuneradas con recargo 1.5x
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
          <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
            Personal Activo en Cuadrillas
          </span>
          <span className="text-2xl font-black font-mono tabular-nums text-blue-700 block mt-1">
            {trabajadoresUnicos} Trabajadores
          </span>
          <span className="text-[11px] text-neutral-500 mt-1 block">
            {selectedMes === 9 && selectedSemana === 0
              ? `${trabajadoresUnicos} trabajadores únicos (en 1.986 partes semanales de Septiembre)`
              : selectedMes === 8 && selectedSemana === 0
              ? '398 trabajadores reales únicos (en 1.188 partes semanales de Agosto)'
              : `${trabajadoresUnicos} trabajadores únicos (${registrosFiltrados.length} partes)`}
          </span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por cédula, nombre, cargo o proyecto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Mes Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-neutral-600">Mes:</span>
          <select
            value={selectedMes}
            onChange={(e) => {
              setSelectedMes(Number(e.target.value));
              setSelectedSemana(0);
              setSelectedFecha('todas');
            }}
            className="text-xs font-bold text-neutral-900 bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500"
          >
            <option value={9}>Septiembre 2026 (Auditoría Detallada - Semanas 35-39)</option>
            <option value={8}>Agosto 2026</option>
            <option value={7}>Julio 2026</option>
            <option value={6}>Junio 2026</option>
            <option value={5}>Mayo 2026</option>
            <option value={4}>Abril 2026</option>
            <option value={3}>Marzo 2026</option>
            <option value={2}>Febrero 2026</option>
            <option value={1}>Enero 2026</option>
            <option value={0}>Todos los Meses (Ene - Sep 2026)</option>
          </select>
        </div>

        {/* Semana Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-neutral-600">Semana:</span>
          <select
            value={selectedSemana}
            onChange={(e) => {
              setSelectedSemana(Number(e.target.value));
              setSelectedFecha('todas');
            }}
            className="text-xs font-bold text-neutral-900 bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500"
          >
            <option value={0}>
              {semanasDisponibles.length > 0 
                ? `Todas las Semanas (${semanasDisponibles[0]} a ${semanasDisponibles[semanasDisponibles.length - 1]})`
                : 'Todas las Semanas'}
            </option>
            {semanasDisponibles.map(sem => {
              let label = `Semana ${sem}`;
              if (selectedMes === 9) {
                if (sem === 35) label = 'Semana 35 (31 Ago - 06 Sep)';
                else if (sem === 36) label = 'Semana 36 (07 - 13 Sep)';
                else if (sem === 37) label = 'Semana 37 (14 - 20 Sep)';
                else if (sem === 38) label = 'Semana 38 (21 - 27 Sep)';
                else if (sem === 39) label = 'Semana 39 (28 Sep - 04 Oct)';
              } else if (selectedMes === 8) {
                if (sem === 31) label = 'Semana 31 (01 - 09 Ago)';
                else if (sem === 32) label = 'Semana 32 (10 - 16 Ago)';
                else if (sem === 33) label = 'Semana 33 (17 - 23 Ago)';
                else if (sem === 34) label = 'Semana 34 (24 - 31 Ago)';
              }
              return (
                <option key={sem} value={sem}>{label}</option>
              );
            })}
          </select>
        </div>

        {/* Día Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-neutral-600">Día:</span>
          <select
            value={selectedFecha}
            onChange={(e) => setSelectedFecha(e.target.value)}
            className="text-xs font-bold text-neutral-900 bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500"
          >
            <option value="todas">
              {selectedMes === 9 ? 'Todos los Días de Septiembre' : selectedMes === 8 ? 'Todos los Días de Agosto' : 'Todos los Días'}
            </option>
            {fechasDisponibles.map(f => (
              <option key={f.fecha} value={f.fecha}>{f.label}</option>
            ))}
          </select>
        </div>

        {/* Cuenta Auxiliar Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-neutral-600">Cuenta / Proyecto:</span>
          <select
            value={selectedCuenta}
            onChange={(e) => setSelectedCuenta(e.target.value)}
            className="text-xs font-bold text-neutral-900 bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 max-w-[200px]"
          >
            <option value="todas">Todas las Cuentas Auxiliares</option>
            {cuentasDisponibles.map(c => (
              <option key={c} value={c}>{c} ({CUENTAS_CORTAS_MAP[c] || c})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Selectors & Clarifying Notice */}
      {selectedMes === 9 ? (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-blue-900">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              <strong>Devengado Diario por Días Hábiles:</strong> Se prorratea la Semana 35 (5 de 6 días en Sep = 83.3%) y Semana 39 (3 de 6 días en Sep = 50.0%). Cuadrillas: $226.891 USD + Staff Pellas: $125.000 USD.
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
            <button
              onClick={() => { setSelectedSemana(35); setSelectedFecha('todas'); }}
              className={`px-2.5 py-1 rounded-lg font-bold border transition-colors ${
                selectedSemana === 35 ? 'bg-blue-600 text-white border-blue-700 shadow-xs' : 'bg-white text-blue-800 border-blue-300 hover:bg-blue-100'
              }`}
            >
              Sem 35 (31 Ago-06 Sep)
            </button>
            <button
              onClick={() => { setSelectedSemana(36); setSelectedFecha('todas'); }}
              className={`px-2.5 py-1 rounded-lg font-bold border transition-colors ${
                selectedSemana === 36 ? 'bg-blue-600 text-white border-blue-700 shadow-xs' : 'bg-white text-blue-800 border-blue-300 hover:bg-blue-100'
              }`}
            >
              Sem 36
            </button>
            <button
              onClick={() => { setSelectedSemana(37); setSelectedFecha('todas'); }}
              className={`px-2.5 py-1 rounded-lg font-bold border transition-colors ${
                selectedSemana === 37 ? 'bg-blue-600 text-white border-blue-700 shadow-xs' : 'bg-white text-blue-800 border-blue-300 hover:bg-blue-100'
              }`}
            >
              Sem 37
            </button>
            <button
              onClick={() => { setSelectedSemana(38); setSelectedFecha('todas'); }}
              className={`px-2.5 py-1 rounded-lg font-bold border transition-colors ${
                selectedSemana === 38 ? 'bg-blue-600 text-white border-blue-700 shadow-xs' : 'bg-white text-blue-800 border-blue-300 hover:bg-blue-100'
              }`}
            >
              Sem 38
            </button>
            <button
              onClick={() => { setSelectedSemana(39); setSelectedFecha('todas'); }}
              className={`px-2.5 py-1 rounded-lg font-bold border transition-colors ${
                selectedSemana === 39 ? 'bg-blue-600 text-white border-blue-700 shadow-xs' : 'bg-white text-blue-800 border-blue-300 hover:bg-blue-100'
              }`}
            >
              Sem 39 (Pellas + BG)
            </button>
            <button
              onClick={() => { setSelectedSemana(0); setSelectedFecha('todas'); setSelectedCuenta('todas'); setSearchTerm(''); }}
              className="px-2.5 py-1 rounded-lg font-bold bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-300 transition-colors"
            >
              Restablecer Todo
            </button>
          </div>
        </div>
      ) : selectedMes === 8 ? (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-blue-900">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              <strong>Primeros días de Agosto verificados:</strong> La Semana 31 cubre desde el <strong>Sábado 01 de Agosto</strong> y <strong>Domingo 02 de Agosto</strong> (guardias operativas) hasta el cierre de semana del 03 al 09 de Agosto. Todos los 31 días están presentes.
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
            <button
              onClick={() => { setSelectedSemana(31); setSelectedFecha('2026-08-01'); }}
              className={`px-2.5 py-1 rounded-lg font-bold border transition-colors ${
                selectedFecha === '2026-08-01' ? 'bg-blue-600 text-white border-blue-700 shadow-xs' : 'bg-white text-blue-800 border-blue-300 hover:bg-blue-100'
              }`}
            >
              01 Ago (Sáb)
            </button>
            <button
              onClick={() => { setSelectedSemana(31); setSelectedFecha('2026-08-02'); }}
              className={`px-2.5 py-1 rounded-lg font-bold border transition-colors ${
                selectedFecha === '2026-08-02' ? 'bg-blue-600 text-white border-blue-700 shadow-xs' : 'bg-white text-blue-800 border-blue-300 hover:bg-blue-100'
              }`}
            >
              02 Ago (Dom)
            </button>
            <button
              onClick={() => { setSelectedSemana(31); setSelectedFecha('todas'); }}
              className={`px-2.5 py-1 rounded-lg font-bold border transition-colors ${
                selectedSemana === 31 && selectedFecha === 'todas' ? 'bg-blue-600 text-white border-blue-700 shadow-xs' : 'bg-white text-blue-800 border-blue-300 hover:bg-blue-100'
              }`}
            >
              Sem 31 (01-09 Ago)
            </button>
            <button
              onClick={() => { setSelectedSemana(0); setSelectedFecha('todas'); setSelectedCuenta('todas'); setSearchTerm(''); }}
              className="px-2.5 py-1 rounded-lg font-bold bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-300 transition-colors"
            >
              Restablecer Todo
            </button>
          </div>
        </div>
      ) : null}

      {/* Main Table: Granular Day by Day */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto max-h-[640px] overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 z-10 bg-[#0b2545] text-white font-bold">
              <tr>
                <th className="py-2.5 px-3 min-w-[110px]">Fecha / Día</th>
                <th className="py-2.5 px-3 min-w-[100px]">Cédula</th>
                <th className="py-2.5 px-3 min-w-[180px]">Trabajador</th>
                <th className="py-2.5 px-3 min-w-[180px]">Cargo / Especialidad</th>
                <th className="py-2.5 px-3 min-w-[160px]">Cuenta Auxiliar (Proyecto)</th>
                <th className="py-2.5 px-3 text-center">Horas Norm.</th>
                <th className="py-2.5 px-3 text-center">Horas Ext.</th>
                <th className="py-2.5 px-3 text-center bg-[#081c33]">Total Horas</th>
                <th className="py-2.5 px-3 text-right">Tarifa $/hr</th>
                <th className="py-2.5 px-3 text-right bg-[#081c33]">Total a Pagar</th>
                <th className="py-2.5 px-3 min-w-[170px]">Archivo Nómina RRHH</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {registrosFiltrados.map((r) => (
                <tr key={r.id} className="hover:bg-neutral-50 transition-colors">
                  {/* Fecha y Día */}
                  <td className="py-2 px-3 whitespace-nowrap">
                    <span className="font-mono font-bold text-neutral-900 block">{r.fecha}</span>
                    <span className="text-[10px] text-neutral-500 font-semibold">{r.diaSemana} · S{r.semana}</span>
                  </td>

                  {/* Cédula */}
                  <td className="py-2 px-3 font-mono font-bold text-blue-900 whitespace-nowrap">
                    {r.cedula}
                  </td>

                  {/* Trabajador */}
                  <td className="py-2 px-3 font-bold text-neutral-900 whitespace-nowrap">
                    {r.trabajador}
                  </td>

                  {/* Cargo */}
                  <td className="py-2 px-3 text-neutral-700 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded bg-neutral-100 font-medium text-[11px] text-neutral-800 border border-neutral-200">
                      {r.cargo}
                    </span>
                  </td>

                  {/* Cuenta Auxiliar & Proyecto Corto */}
                  <td className="py-2 px-3 whitespace-nowrap">
                    <span className="font-mono font-bold text-neutral-900 block text-[11px]">{r.cuentaAuxiliar}</span>
                    <span className="text-[10px] text-neutral-500 font-semibold">{r.proyectoCorto}</span>
                  </td>

                  {/* Horas Normales */}
                  <td className="py-2 px-3 text-center font-mono tabular-nums text-neutral-700 whitespace-nowrap">
                    {Math.round(r.horasNormales)} h
                  </td>

                  {/* Horas Extras */}
                  <td className="py-2 px-3 text-center font-mono tabular-nums font-semibold whitespace-nowrap">
                    <span className={r.horasExtras > 0 ? 'text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded' : 'text-neutral-400'}>
                      {r.horasExtras > 0 ? `+${Math.round(r.horasExtras)} h` : '-'}
                    </span>
                  </td>

                  {/* Total Horas */}
                  <td className="py-2 px-3 text-center font-mono tabular-nums font-bold text-neutral-900 bg-neutral-50/60 whitespace-nowrap">
                    {Math.round(r.totalHoras)} h
                  </td>

                  {/* Tarifa */}
                  <td className="py-2 px-3 text-right font-mono tabular-nums text-neutral-600 whitespace-nowrap">
                    ${r.tarifaHoraUsd.toFixed(2)}
                  </td>

                  {/* Total Pagar */}
                  <td className="py-2 px-3 text-right font-mono tabular-nums font-bold text-neutral-900 bg-emerald-50/30 whitespace-nowrap">
                    ${Math.round(r.totalPagarUsd).toLocaleString('de-DE')}
                  </td>

                  {/* Archivo Source */}
                  <td className="py-2 px-3 text-[10px] font-mono text-neutral-500 whitespace-nowrap truncate max-w-[200px]" title={r.sourceFile}>
                    {r.sourceFile}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="sticky bottom-0 z-10 bg-neutral-100 font-black border-t-2 border-neutral-300 text-neutral-900 text-xs">
              <tr>
                <td colSpan={5} className="py-2.5 px-3 uppercase tracking-wider whitespace-nowrap">
                  TOTAL CONSOLIDADO ({registrosFiltrados.length} REGISTROS DIARIOS AUDITADOS):
                </td>
                <td className="py-2.5 px-3 text-center font-mono whitespace-nowrap">
                  {Math.round(registrosFiltrados.reduce((s, r) => s + r.horasNormales, 0)).toLocaleString('de-DE')} h
                </td>
                <td className="py-2.5 px-3 text-center font-mono text-amber-700 whitespace-nowrap">
                  +{Math.round(totalHorasExtras).toLocaleString('de-DE')} h
                </td>
                <td className="py-2.5 px-3 text-center font-mono text-sm bg-neutral-200 whitespace-nowrap font-black">
                  {Math.round(totalHoras).toLocaleString('de-DE')} h
                </td>
                <td></td>
                <td className="py-2.5 px-3 text-right font-mono text-sm text-emerald-800 bg-emerald-100/60 whitespace-nowrap min-w-[140px] font-black">
                  ${Math.round(totalMonto).toLocaleString('de-DE')} USD
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
