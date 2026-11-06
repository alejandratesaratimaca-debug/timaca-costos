import React, { useState, useMemo, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { 
  Building2, 
  Truck, 
  Wrench, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Layers, 
  FileText, 
  DollarSign, 
  ShieldCheck, 
  ChevronRight, 
  ChevronDown,
  ChevronUp,
  Calendar, 
  Info,
  CheckCircle2,
  Cpu,
  Sparkles,
  ArrowRight,
  Eye,
  Download,
  X,
  Briefcase,
  AlertCircle,
  SlidersHorizontal,
  BarChart2,
  FolderDown,
  Search,
  Filter,
  Check,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';
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
  MANTTO_INFRAESTRUCTURA_2026,
  FLOTA_GRUAS_TIMACA_2026,
  EQUIPOS_NUEVOS_SEPTIEMBRE_2026,
  INTERVENCIONES_VIDA_UTIL_SEPTIEMBRE_2026,
  ACTIVOS_PRODUCTIVOS_CAPEX_NIC16_SEPTIEMBRE
} from '../data/proyectosInternosData';
import { 
  TOTALES_MOD_SEPTIEMBRE_2026,
  HORAS_HOMBRE_POR_CUENTA_SEPTIEMBRE,
  HORAS_HOMBRE_SIN_CUENTA_SEPTIEMBRE,
  HORAS_HOMBRE_POR_FAMILIA_SEPTIEMBRE,
  HORAS_HOMBRE_POR_TRABAJADOR_SEPTIEMBRE,
  EVOLUTIVO_SEMANAL_MOD_SEPTIEMBRE_2026,
  HorasHombreCuentaSep,
  HorasHombrePendienteConciliacion
} from '../data/horasHombreSeptiembreData';
import { 
  getDesgloseInterno, 
  DetalleCuentaOActivo, 
  ItemDesgloseInterno 
} from '../data/desgloseDetalleInternos';
import { SALIDAS_REALES_SEPTIEMBRE_2026 } from '../data/realSalidasSeptiembre2026';
import { formatCurrency, formatNumber } from '../utils/dateHelpers';
import { UsuarioSistema } from '../types/usuarios';

export type SubTabInternos = 'resumen' | 'mod' | 'capex' | 'flota' | 'infra' | 'reclasificacion' | 'gruas';

interface DashboardInternosViewProps {
  onGoToPPT?: () => void;
  currentUser?: UsuarioSistema;
  activeSubTab?: 'resumen' | 'capex' | 'flota' | 'gruas' | 'mod' | 'infra';
  onSelectSubTab?: (tab: 'resumen' | 'capex' | 'flota' | 'gruas' | 'mod' | 'infra') => void;
}

export const DashboardInternosView: React.FC<DashboardInternosViewProps> = ({ 
  onGoToPPT,
  currentUser,
  activeSubTab,
  onSelectSubTab
}) => {
  const [subTab, setSubTab] = useState<SubTabInternos>(activeSubTab || 'resumen');
  const [selectedMesIdx, setSelectedMesIdx] = useState<number>(9); // Octubre por defecto (index 9)
  const [modoReclasificadoSep, setModoReclasificadoSep] = useState<boolean>(true);
  const [incluirEquiposNuevosCapex, setIncluirEquiposNuevosCapex] = useState<boolean>(true);
  
  // Reclasificación contable oficial NIC 16: 10 Activos Productivos capitalizados en Septiembre ($28.328,84 USD).
  const [idsVidaUtilActivos, setIdsVidaUtilActivos] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    INTERVENCIONES_VIDA_UTIL_SEPTIEMBRE_2026.forEach(item => {
      map[item.id] = true;
    });
    return map;
  });

  // Filtros de búsqueda en tablas
  const [busquedaMOD, setBusquedaMOD] = useState<string>('');
  const [filtroFamiliaMOD, setFiltroFamiliaMOD] = useState<string>('todos');
  const [busquedaConciliacion, setBusquedaConciliacion] = useState<string>('');
  const [selectedActivoParaDesglose, setSelectedActivoParaDesglose] = useState<DetalleCuentaOActivo | null>(null);

  // Estados para el Tablero Ejecutivo (Igual a Proyectos Externos)
  const [periodoDetalleBloques, setPeriodoDetalleBloques] = useState<'anual' | number>(10);
  const [filtroBloqueAuditoria, setFiltroBloqueAuditoria] = useState<'todos' | 'capex' | 'activos' | 'flota' | 'infra' | 'admon'>('todos');
  const [filtroCategoriaAuditoria, setFiltroCategoriaAuditoria] = useState<'todos' | 'Materiales Directos' | 'Servicios' | 'MOD'>('todos');
  const [filtroMesAuditoria, setFiltroMesAuditoria] = useState<number | 'todos'>(10);
  const [selectedCuentasAuditoria, setSelectedCuentasAuditoria] = useState<string[]>([]);
  const [busquedaAuditoria, setBusquedaAuditoria] = useState<string>('');
  const [filasAMostrarAuditoria, setFilasAMostrarAuditoria] = useState<number | 'todas'>(50);
  const [downloadExcelSuccessAuditoria, setDownloadExcelSuccessAuditoria] = useState<boolean>(false);
  const [mostrarMatrizHistorica, setMostrarMatrizHistorica] = useState<boolean>(false);

  // Datos mensuales consolidados oficiales Enero a Octubre 2026
  const MESES_INTERNOS_DATA = useMemo(() => [
    { num: 1, label: 'Enero 2026', corto: 'Ene', salidas: 382, capex: 162467.00, flota: 143580.59, infra: 145196.50, total: 451244.09, promSem: 112811 },
    { num: 2, label: 'Febrero 2026', corto: 'Feb', salidas: 415, capex: 326380.08, flota: 102274.05, infra: 50329.09, total: 478983.22, promSem: 119746 },
    { num: 3, label: 'Marzo 2026', corto: 'Mar', salidas: 290, capex: 149039.20, flota: 83193.99, infra: 20148.88, total: 252382.07, promSem: 63096 },
    { num: 4, label: 'Abril 2026', corto: 'Abr', salidas: 245, capex: 92864.54, flota: 59542.59, infra: 25926.42, total: 178333.54, promSem: 44583 },
    { num: 5, label: 'Mayo 2026', corto: 'May', salidas: 220, capex: 77900.75, flota: 68409.09, infra: 20031.25, total: 166341.09, promSem: 41585 },
    { num: 6, label: 'Junio 2026', corto: 'Jun', salidas: 198, capex: 32585.22, flota: 72213.23, infra: 15747.60, total: 120546.05, promSem: 30137 },
    { num: 7, label: 'Julio 2026', corto: 'Jul', salidas: 260, capex: 45087.13, flota: 97727.42, infra: 41897.82, total: 184712.37, promSem: 46178 },
    { num: 8, label: 'Agosto 2026', corto: 'Ago', salidas: 310, capex: 29017.30, flota: 113450.01, infra: 40545.39, total: 183012.70, promSem: 45753 },
    { num: 9, label: 'Septiembre 2026', corto: 'Sep', salidas: 1884, capex: 63323.92, flota: 65757.04, infra: 42818.77, total: 171899.73, promSem: 42975 },
    { num: 10, label: 'Octubre 2026', corto: 'Oct', salidas: 1683, capex: 30225.95, flota: 40344.07, infra: 66612.49, total: 137182.51, promSem: 34296 }
  ], []);

  const maxMesMontoInternos = Math.max(...MESES_INTERNOS_DATA.map(m => m.total), 1);

  const CUENTAS_INTERNAS_LABELS: Record<string, string> = {
    'TTI-C-0105': 'Adecuación Patio Externo Timaca',
    'TSI-T-0108': 'Construcción Galpones TIMACA Cant. 04',
    'TTI-C-0095': 'Obra Civil Edificio Administrativo',
    'TTI-C-0108': 'Adecuación Banco Pruebas Motores 440V',
    'TTI-C-0104': 'Reacondicionamiento Grúas Torres Liebherr',
    'TTI-C-0102': 'Renovación Garita de Acceso Timaca',
    'TTI-C-0111': 'Montaje Bancos de Prueba Motores/Bombas',
    'TTI-C-0107': 'Fabricación Zona Resguardo Equipos Móviles',
    'TTI-C-0099': 'Pantógrafos Taller',
    'TTI-C-0098': 'Grúas Puente Taller',
    'TTI-C-0101': 'Máquinas Vulcanizadoras',
    'TTI-C-0106': 'Área de Lavado Equipos Móviles',
    'TT-I-C-033': 'Adecuación y Mantenimiento de Galpones',
    'EEI-C-GR23': 'Grúa Link Belt LS918 400TN',
    'EEA-C-BS03': 'Autobús Encava FA160P (Motor Cummins)',
    'EEA-C-BS15': 'Autobús Encava 6036A1Y (Nuevo)',
    'TT-S-C-854': 'Payloader Hyundai HL760-7 (PA01)',
    'EEI-C-GR22': 'Grúa Liebherr LTM1400 400TN',
    'EEE-C-VH52': 'Pick Up Mazda BT-50 2WD',
    'EEE-C-PA03': 'Payloader Caterpillar 962G',
    'EEE-C-TR01': 'Tractor Caterpillar D6R-XL2',
    'TT-F-CO19': 'Compresor SULLAIR 185 (CO19)',
    'TT-F-CO20': 'Compresor SULLAIR 185 (CO20)',
    'EEI-C-GR17': 'Grúa Grove TM 890 - 90TN',
    'EEI-C-GR25': 'Grúa Grove RT750 - 50TN',
    'EEI-C-GR13': 'Grúa Grove RT 75S - 50TN',
    'EEI-C-GR24': 'Grúa Liebherr ITM1100/1 - 100TN',
    'EEE-C-RE01': 'Retroexcavadora Case 580M'
  };

  // Cuentas internas disponibles con totales para el filtro dropdown
  const cuentasInternasDisponibles = useMemo(() => {
    const map = new Map<string, { codigo: string; nombre: string; total: number; count: number }>();
    SALIDAS_REALES_SEPTIEMBRE_2026
      .filter(s => !s.cuentaAuxiliarCodigo.startsWith('TTE-C-'))
      .forEach(s => {
        const cod = s.cuentaAuxiliarCodigo;
        const nom = CUENTAS_INTERNAS_LABELS[cod] || s.cuentaAuxiliarNombre || s.proyecto || cod;
        if (!map.has(cod)) {
          map.set(cod, { codigo: cod, nombre: nom, total: 0, count: 0 });
        }
        const it = map.get(cod)!;
        it.total += (s.montoTotal || 0);
        it.count += 1;
      });
    return Array.from(map.values()).sort((a, b) => (b.total || 0) - (a.total || 0));
  }, []);

  // Salidas internas de Septiembre clasificadas con bloque y categoría
  const salidasInternasSeptiembre = useMemo(() => {
    return SALIDAS_REALES_SEPTIEMBRE_2026
      .filter(s => !s.cuentaAuxiliarCodigo.startsWith('TTE-C-'))
      .map((s, idx) => {
        const cod = s.cuentaAuxiliarCodigo;
        const isActivoProductivo = 
          cod.includes('GR23') || cod.includes('BS03') || cod.includes('BS15') || 
          cod.includes('PA01') || cod.includes('854') || cod.includes('GR22') || 
          cod.includes('VH52') || cod.includes('PA03') || cod.includes('TR01') || 
          cod.includes('CO19') || cod.includes('CO20');

        const CUENTAS_INFRA_OFICIALES = [
          'TT-I-C-033', 'TT-G-C-032', 'TT-G-C-034', 'EE-G-C-016', 'SS-G-C-025',
          'TT-A-C-207', 'TT-A-C-208', 'TT-H-C-031', 'TT-H-C-033', 'EE-H-C-015',
          'SS-H-C-024', 'TT-A-C-512', 'TT-A-C-513', 'TT-A-C-514', 'TT-A-C-900'
        ];

        let bloque: 'CAPEX Obras' | 'Activos Productivos (CAPEX)' | 'Mantto. Flota (OPEX)' | 'Infraestructura (OPEX)' | 'Gastos Administrativos (ADMON)';
        if (isActivoProductivo) {
          bloque = 'Activos Productivos (CAPEX)';
        } else if (cod.startsWith('TTI-') || cod.startsWith('TSI-') || cod.startsWith('STI-') || cod.startsWith('ESI-')) {
          bloque = 'CAPEX Obras';
        } else if (CUENTAS_INFRA_OFICIALES.includes(cod) || cod.startsWith('TT-G-') || cod.startsWith('EE-G-') || cod.startsWith('SS-G-') || cod.startsWith('TT-I-') || cod.startsWith('TT-H-') || cod.startsWith('EE-H-') || cod.startsWith('SS-H-')) {
          bloque = 'Infraestructura (OPEX)';
        } else if (cod.startsWith('TT-A-') || cod.startsWith('EE-A-') || cod.startsWith('SS-A-') || cod.startsWith('AE-A-') || cod.startsWith('AEA-')) {
          bloque = 'Gastos Administrativos (ADMON)';
        } else {
          bloque = 'Mantto. Flota (OPEX)';
        }

        let catGasto: 'Materiales Directos' | 'Servicios' | 'MOD' = 'Materiales Directos';
        const tipo = (s.tipo || '').toLowerCase();
        const desc = (s.itemDescripcion || '').toLowerCase();
        const rubro = (s.categoria || '').toLowerCase();
        if (tipo.includes('servicio') || desc.includes('servicio') || desc.includes('mecanizado') || desc.includes('reparacion') || rubro.includes('servicio')) {
          catGasto = 'Servicios';
        } else if (tipo.includes('mano de obra') || tipo.includes('mod') || desc.includes('horas hombre') || rubro.includes('mano de obra')) {
          catGasto = 'MOD';
        }

        return {
          id: s.id || `INT-SEP-${idx}`,
          fecha: s.fecha,
          codigoSalida: s.codigoSalida,
          cuentaAuxiliarCodigo: s.cuentaAuxiliarCodigo,
          cuentaAuxiliarNombre: CUENTAS_INTERNAS_LABELS[cod] || s.cuentaAuxiliarNombre || s.proyecto || cod,
          proyecto: CUENTAS_INTERNAS_LABELS[cod] || s.proyecto || s.cuentaAuxiliarNombre || cod,
          itemDescripcion: s.itemDescripcion,
          categoria: s.categoria,
          subcategoria: s.subcategoria,
          cantidad: s.cantidad ?? 0,
          unidadMedida: s.unidadMedida ?? 'UND',
          precioUnitario: s.montoUnitario ?? (s.cantidad && s.cantidad > 0 ? (s.montoTotal / s.cantidad) : 0),
          montoTotal: s.montoTotal ?? 0,
          solicitante: s.solicitante,
          observaciones: s.observaciones,
          bloque,
          isActivoProductivo,
          catGasto
        };
      });
  }, []);

  // Salidas internas filtradas interactivamente para la tabla de auditoría
  const salidasInternasAuditadas = useMemo(() => {
    let list = salidasInternasSeptiembre;

    // Filtro por Bloque / Proyecto
    if (filtroBloqueAuditoria === 'capex') {
      list = list.filter(s => s.bloque === 'CAPEX Obras' || s.isActivoProductivo);
    } else if (filtroBloqueAuditoria === 'activos') {
      list = list.filter(s => s.isActivoProductivo);
    } else if (filtroBloqueAuditoria === 'flota') {
      list = list.filter(s => s.bloque === 'Mantto. Flota (OPEX)');
    } else if (filtroBloqueAuditoria === 'infra') {
      list = list.filter(s => s.bloque === 'Infraestructura (OPEX)');
    } else if (filtroBloqueAuditoria === 'admon') {
      list = list.filter(s => s.bloque === 'Gastos Administrativos (ADMON)');
    }

    // Filtro por Categoría / Voz de Gasto
    if (filtroCategoriaAuditoria !== 'todos') {
      list = list.filter(s => s.catGasto === filtroCategoriaAuditoria);
    }

    // Filtro por Cuentas Auxiliares seleccionadas
    if (selectedCuentasAuditoria.length > 0) {
      list = list.filter(s => selectedCuentasAuditoria.some(c => s.cuentaAuxiliarCodigo.includes(c)));
    }

    if (busquedaAuditoria.trim() !== '') {
      const q = busquedaAuditoria.toLowerCase().trim();
      list = list.filter(s => 
        String(s.codigoSalida || '').toLowerCase().includes(q) ||
        String(s.cuentaAuxiliarCodigo || '').toLowerCase().includes(q) ||
        String(s.cuentaAuxiliarNombre || '').toLowerCase().includes(q) ||
        String(s.itemDescripcion || '').toLowerCase().includes(q) ||
        String(s.solicitante || '').toLowerCase().includes(q) ||
        String(s.observaciones || '').toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => (b.montoTotal || 0) - (a.montoTotal || 0));
  }, [salidasInternasSeptiembre, filtroBloqueAuditoria, filtroCategoriaAuditoria, selectedCuentasAuditoria, busquedaAuditoria]);

  const salidasInternasMostradas = useMemo(() => {
    if (filasAMostrarAuditoria === 'todas') return salidasInternasAuditadas;
    return salidasInternasAuditadas.slice(0, filasAMostrarAuditoria);
  }, [salidasInternasAuditadas, filasAMostrarAuditoria]);

  const totalMontoAuditado = useMemo(() => {
    return salidasInternasAuditadas.reduce((acc, s) => acc + (s.montoTotal || 0), 0);
  }, [salidasInternasAuditadas]);

  const toggleCuentaAuditoria = (cod: string) => {
    setSelectedCuentasAuditoria(prev => {
      if (prev.includes(cod)) {
        return prev.filter(c => c !== cod);
      } else {
        return [...prev, cod];
      }
    });
  };

  const handleExportarExcelAuditoria = () => {
    const dataExcel = salidasInternasAuditadas.map(s => ({
      'Fecha': s.fecha,
      'Comprobante SIP': s.codigoSalida,
      'Cuenta Auxiliar': s.cuentaAuxiliarCodigo,
      'Proyecto / Activo': s.proyecto,
      'Bloque Contable': s.bloque,
      'Categoría': s.catGasto,
      'Descripción del Ítem': s.itemDescripcion,
      'Cantidad': s.cantidad,
      'Unidad': s.unidadMedida === 'USE' ? 'SERV' : s.unidadMedida,
      'Precio Unitario ($)': s.precioUnitario,
      'Monto Total ($)': s.montoTotal,
      'Solicitante': s.solicitante || '-',
      'Observaciones': s.observaciones || '-'
    }));

    const ws = XLSX.utils.json_to_sheet(dataExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Auditoria_Costos_Internos');
    XLSX.writeFile(wb, `TIMACA_Auditoria_Internos_Flota_${filtroBloqueAuditoria}.xlsx`);
    setDownloadExcelSuccessAuditoria(true);
    setTimeout(() => setDownloadExcelSuccessAuditoria(false), 3000);
  };

  useEffect(() => {
    if (activeSubTab && activeSubTab !== subTab) {
      setSubTab(activeSubTab as SubTabInternos);
    }
  }, [activeSubTab]);

  const handleTabChange = (newTab: SubTabInternos) => {
    setSubTab(newTab);
    if (newTab === 'resumen' || newTab === 'capex' || newTab === 'flota' || newTab === 'gruas' || newTab === 'mod' || newTab === 'infra') {
      onSelectSubTab?.(newTab);
    }
  };

  // Cálculos dinámicos de las 5 Cards Oficiales (según periodoDetalleBloques)
  const info5Bloques = useMemo(() => {
    if (periodoDetalleBloques === 'anual') {
      const tot = 2187454.85;
      return {
        totalBase: tot,
        periodoLabel: 'Acumulado Anual Oficial 2026 (Enero a Septiembre)',
        capex: {
          monto: 950336.30,
          pct: ((950336.30 / tot) * 100).toFixed(1),
          secundario: 'Cierre Septiembre: $34.995,08 USD',
          anual: 950336.30
        },
        activos: {
          monto: 28328.84,
          pct: ((28328.84 / tot) * 100).toFixed(1),
          secundario: '10 Equipos Capitalizados NIC-16',
          anual: 28328.84
        },
        flota: {
          monto: 806147.99,
          pct: ((806147.99 / tot) * 100).toFixed(1),
          secundario: 'Cierre Septiembre: $65.757,04 USD',
          anual: 806147.99
        },
        infra: {
          monto: 402641.72,
          pct: ((402641.72 / tot) * 100).toFixed(1),
          secundario: 'Cierre Septiembre: $42.818,77 USD',
          anual: 402641.72
        },
        mod: {
          monto: '5.963 HH',
          pct: '100%',
          secundario: '32 Mecánicos · 1.336 Vales',
          anual: '5.963 HH'
        }
      };
    } else if (periodoDetalleBloques === 9) {
      const tot = 171899.73;
      return {
        totalBase: tot,
        periodoLabel: 'Cierre Oficial de Septiembre 2026',
        capex: {
          monto: 34995.08,
          pct: ((34995.08 / tot) * 100).toFixed(1),
          secundario: 'Acumulado Anual: $950.336,30 USD',
          anual: 950336.30
        },
        activos: {
          monto: 28328.84,
          pct: ((28328.84 / tot) * 100).toFixed(1),
          secundario: 'Acumulado Anual: $28.328,84 USD',
          anual: 28328.84
        },
        flota: {
          monto: 65757.04,
          pct: ((65757.04 / tot) * 100).toFixed(1),
          secundario: 'Acumulado Anual: $806.147,99 USD',
          anual: 806147.99
        },
        infra: {
          monto: 42818.77,
          pct: ((42818.77 / tot) * 100).toFixed(1),
          secundario: 'Acumulado Anual: $402.641,72 USD',
          anual: 402641.72
        },
        mod: {
          monto: '5.963 HH',
          pct: '100%',
          secundario: '1.336 Vales de Mantenimiento ECO',
          anual: '5.963 HH'
        }
      };
    } else {
      const mesData = MESES_INTERNOS_DATA.find(m => m.num === periodoDetalleBloques) || MESES_INTERNOS_DATA[0];
      const tot = mesData.total;
      return {
        totalBase: tot,
        periodoLabel: `Cierre Oficial de ${mesData.label}`,
        capex: {
          monto: mesData.capex,
          pct: ((mesData.capex / tot) * 100).toFixed(1),
          secundario: 'Acumulado Anual: $950.336,30 USD',
          anual: 950336.30
        },
        activos: {
          monto: 0,
          pct: '0.0',
          secundario: 'Reclasificado en Septiembre ($28.328,84)',
          anual: 28328.84
        },
        flota: {
          monto: mesData.flota,
          pct: ((mesData.flota / tot) * 100).toFixed(1),
          secundario: 'Acumulado Anual: $806.147,99 USD',
          anual: 806147.99
        },
        infra: {
          monto: mesData.infra,
          pct: ((mesData.infra / tot) * 100).toFixed(1),
          secundario: 'Acumulado Anual: $402.641,72 USD',
          anual: 402641.72
        },
        mod: {
          monto: `${Math.round(5963 * (tot / 171899.73))} HH`,
          pct: 'Promedio',
          secundario: 'MOD Flota y Talleres',
          anual: '5.963 HH'
        }
      };
    }
  }, [periodoDetalleBloques, MESES_INTERNOS_DATA]);

  // Cálculo dinámico de la reclasificación OPEX Flota -> CAPEX en Septiembre 2026
  const totalEquiposNuevosSep = useMemo(() => {
    if (!incluirEquiposNuevosCapex) return 0;
    return EQUIPOS_NUEVOS_SEPTIEMBRE_2026.reduce((acc, eq) => acc + eq.totalSepUsd, 0);
  }, [incluirEquiposNuevosCapex]);

  const totalVidaUtilSep = useMemo(() => {
    return INTERVENCIONES_VIDA_UTIL_SEPTIEMBRE_2026.reduce((acc, item) => {
      return acc + (idsVidaUtilActivos[item.id] ? item.montoItemUsd : 0);
    }, 0);
  }, [idsVidaUtilActivos]);

  const montoReclasificadoSep = (selectedMesIdx === 8 && modoReclasificadoSep)
    ? (totalEquiposNuevosSep + totalVidaUtilSep)
    : 0;

  const toggleItemVidaUtil = (id: string) => {
    setIdsVidaUtilActivos(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const mesActivoRaw = EVOLUTIVO_INTERNOS_2026[selectedMesIdx] || EVOLUTIVO_INTERNOS_2026[8];
  const esSeptiembre = selectedMesIdx === 8;

  // Montos oficiales de la presentación ejecutiva y tablas dinámicas de TIMACA
  const capexEfectivoMes = esSeptiembre ? 63323.92 : mesActivoRaw.capex;
  const opexFlotaEfectivoMes = esSeptiembre ? 65757.04 : mesActivoRaw.opexActivos;
  const opexInfraEfectivoMes = esSeptiembre ? 42818.77 : mesActivoRaw.opexInfraestructura;
  const totalOpexEfectivoMes = opexFlotaEfectivoMes + opexInfraEfectivoMes;
  const totalGeneralMes = esSeptiembre ? 171899.73 : (capexEfectivoMes + totalOpexEfectivoMes);

  const formatExact = (val: number | undefined | null) => {
    if (val === undefined || val === null || isNaN(val)) return '$0';
    return '$' + val.toLocaleString('de-DE', { minimumFractionDigits: val % 1 !== 0 ? 2 : 0, maximumFractionDigits: 2 });
  };

  // Filtrado de cuentas de Horas Hombre Septiembre
  const cuentasMODFiltradas = useMemo(() => {
    return HORAS_HOMBRE_POR_CUENTA_SEPTIEMBRE.filter(item => {
      const q = busquedaMOD.toLowerCase().trim();
      const matchBusqueda = !q || 
        String(item.cuenta || '').toLowerCase().includes(q) ||
        String(item.equipo || '').toLowerCase().includes(q) ||
        String(item.tipo || '').toLowerCase().includes(q) ||
        String(item.principalesLabores || '').toLowerCase().includes(q);
      
      const matchFamilia = filtroFamiliaMOD === 'todos' || item.tipo === filtroFamiliaMOD;
      return matchBusqueda && matchFamilia;
    });
  }, [busquedaMOD, filtroFamiliaMOD]);

  // Filtrado de ítems sin cuenta auxiliar para conciliación
  const sinCuentaMODFiltrados = useMemo(() => {
    return HORAS_HOMBRE_SIN_CUENTA_SEPTIEMBRE.filter(item => {
      const q = busquedaConciliacion.toLowerCase().trim();
      return !q ||
        String(item.trabajador || '').toLowerCase().includes(q) ||
        String(item.motivoLabor || '').toLowerCase().includes(q) ||
        String(item.tipoEquipo || '').toLowerCase().includes(q);
    });
  }, [busquedaConciliacion]);

  // Apertura de desglose con lectura directa de datos
  const handleAbrirDesglose = (codigo: string, tituloFallback?: string, montoFallback?: number) => {
    if (esSeptiembre) {
      const registrosSep = SALIDAS_REALES_SEPTIEMBRE_2026.filter(r => 
        r.cuentaAuxiliarCodigo === codigo || 
        r.cuentaAuxiliarCodigo.endsWith(`-${codigo}`) ||
        (codigo === 'GR23' && r.cuentaAuxiliarCodigo.includes('GR23')) ||
        (codigo === 'BS03' && r.cuentaAuxiliarCodigo.includes('BS03')) ||
        (codigo === 'BS15' && r.cuentaAuxiliarCodigo.includes('BS15'))
      );
      if (registrosSep.length > 0) {
        const itemsSep: ItemDesgloseInterno[] = registrosSep
          .sort((a, b) => b.montoTotal - a.montoTotal)
          .map((r, i) => ({
            id: r.id || `SEP-${codigo}-${i}`,
            codigo: r.codigoSalida || `SEP-${i + 1}`,
            descripcion: r.itemDescripcion,
            especificacion: `${r.proyecto || r.cuentaAuxiliarNombre}`,
            categoria: (r.tipo as ItemDesgloseInterno['categoria']) || 'Materiales Directos',
            rubro: r.categoria || r.subcategoria,
            cantidad: r.cantidad,
            unidadMedida: r.unidad,
            montoUnitario: r.precioUnitario,
            montoTotal: r.montoTotal,
            comprobanteSIP: r.codigoSalida,
            fecha: r.fecha,
            solicitante: r.solicitante,
            motivo: r.observaciones
          }));

        setSelectedActivoParaDesglose({
          codigo,
          titulo: tituloFallback || `Cuenta ${codigo} - Septiembre 2026`,
          descripcionGeneral: `Desglose de compras y despachos de almacén registrados en Septiembre 2026.`,
          responsableArea: 'Auditoría Almacén & Proyectos',
          montoAgosto: itemsSep.reduce((acc, it) => acc + it.montoTotal, 0),
          items: itemsSep
        });
        return;
      }
    }

    const detalle = getDesgloseInterno(codigo);
    if (detalle) {
      setSelectedActivoParaDesglose(detalle);
    } else {
      setSelectedActivoParaDesglose({
        codigo,
        titulo: tituloFallback || `Detalle ${codigo}`,
        tipo: 'CAPEX',
        descripcionGeneral: `Información de auditoría contable para ${codigo}.`,
        responsableArea: 'Gestión de Costos TIMACA',
        montoAgosto: montoFallback || 0,
        items: []
      });
    }
  };

  const handleDescargarExcelConciliacion = () => {
    const dataExcel = HORAS_HOMBRE_POR_CUENTA_SEPTIEMBRE.map((item, idx) => ({
      '#': idx + 1,
      'Cuenta Auxiliar': item.cuenta,
      'Equipo / Activo': item.equipo,
      'Familia / Tipo': item.tipo,
      'Total Horas Hombre (HH)': item.totalHoras,
      'Órdenes / Registros': item.registros,
      'N° Técnicos': item.cantTrabajadores,
      'Técnicos Intervinientes': item.trabajadores.join(', '),
      'Principales Labores / Motivos': item.principalesLabores
    }));

    const ws = XLSX.utils.json_to_sheet(dataExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'MOD_Septiembre_5963_HH');
    XLSX.writeFile(wb, 'TIMACA_MOD_Mantenimiento_ECO_Septiembre_2026_5963HH.xlsx');
  };

  const pctCapex = totalGeneralMes > 0 ? Math.round((capexEfectivoMes / totalGeneralMes) * 1000) / 10 : 0;
  const pctFlota = totalGeneralMes > 0 ? Math.round((opexFlotaEfectivoMes / totalGeneralMes) * 1000) / 10 : 0;
  const pctInfra = totalGeneralMes > 0 ? Math.round((opexInfraEfectivoMes / totalGeneralMes) * 1000) / 10 : 0;

  return (
    <div className="space-y-6">
      
      {/* ========================================================================= */}
      {/* 1. TOP INFORMATION BANNER (IDÉNTICO A PROYECTOS EXTERNOS)                 */}
      {/* ========================================================================= */}
      <div className="bg-slate-50 border border-slate-200 text-slate-800 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl shadow-2xs transition-all">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Control de Gestión & Costos Industriales TIMACA
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  Proyectos Internos & Flota
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Consolidación oficial (CAPEX · Mantto. Flota OPEX · Infraestructura · MOD ECO).
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => handleTabChange('mod')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors shadow-2xs cursor-pointer"
              title="Ver Horas Hombre de Mantenimiento Equipos Septiembre"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>MOD Septiembre (5.963 HH)</span>
            </button>

            <button
              onClick={() => handleTabChange('reclasificacion')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-950 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-lg transition-colors shadow-2xs cursor-pointer"
              title="Separación contable CAPEX vs OPEX"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-700" />
              <span>Simulador Reclasificación</span>
            </button>

            {onGoToPPT && (
              <button
                onClick={onGoToPPT}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap shadow-2xs cursor-pointer"
                title="Dossier Ejecutivo de Internos"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Informe PPT</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. KPI HEADER DE INTERNOS (MISMA ESTRUCTURA Y ESTÉTICA DE EXTERNOS)       */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* KPI 1: CAPEX Proyectos Internos */}
        <div 
          onClick={() => handleTabChange('capex')}
          className="bg-white p-4.5 rounded-xl border border-neutral-200/90 shadow-2xs hover:shadow-md hover:border-indigo-500 transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between h-full min-h-[148px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              1. Inversiones CAPEX
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="my-1.5">
            <div className="text-2xl font-black text-neutral-900 font-mono tracking-tight">
              {formatExact(capexEfectivoMes)}
            </div>
            <div className="text-[11px] text-neutral-500 mt-0.5 truncate">
              {esSeptiembre 
                ? 'Proyectos $34.995 + Activos $28.329' 
                : 'Obras civiles, galpones y patios'}
            </div>
          </div>
          <div className="flex items-center justify-between text-xs pt-2 border-t border-neutral-100">
            <span className="text-emerald-700 font-bold flex items-center gap-0.5 text-[11px]">
              {esSeptiembre ? '▲ +118% vs Ago ($29.017)' : '▼ 36% vs Jul'}
            </span>
            <span className="font-bold text-neutral-500 text-[11px]">{pctCapex}% del total</span>
          </div>
        </div>

        {/* KPI 2: Mantto. Flota (OPEX) */}
        <div 
          onClick={() => handleTabChange('flota')}
          className="bg-white p-4.5 rounded-xl border border-neutral-200/90 shadow-2xs hover:shadow-md hover:border-blue-500 transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between h-full min-h-[148px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              2. Mantto. Flota (OPEX)
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="my-1.5">
            <div className="text-2xl font-black text-neutral-900 font-mono tracking-tight">
              {formatExact(opexFlotaEfectivoMes)}
            </div>
            <div className="text-[11px] text-neutral-500 mt-0.5 truncate">
              {esSeptiembre 
                ? 'Equipos móviles y activos productivos' 
                : 'Flota pesada, grúas y livianos'}
            </div>
          </div>
          <div className="flex items-center justify-between text-xs pt-2 border-t border-neutral-100">
            <span className="text-blue-700 font-bold flex items-center gap-0.5 text-[11px]">
              {esSeptiembre ? '▼ 42% vs Ago ($113.450)' : '▲ 16% vs Jul'}
            </span>
            <span className="font-bold text-neutral-500 text-[11px]">{pctFlota}% del total</span>
          </div>
        </div>

        {/* KPI 3: Mantto. Infraestructura (OPEX) */}
        <div 
          onClick={() => handleTabChange('infra')}
          className="bg-white p-4.5 rounded-xl border border-neutral-200/90 shadow-2xs hover:shadow-md hover:border-emerald-500 transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between h-full min-h-[148px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              3. Infraestructura (OPEX)
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Wrench className="w-5 h-5" />
            </div>
          </div>
          <div className="my-1.5">
            <div className="text-2xl font-black text-neutral-900 font-mono tracking-tight">
              {formatExact(opexInfraEfectivoMes)}
            </div>
            <div className="text-[11px] text-neutral-500 mt-0.5 truncate">
              TT-I-C-033 Adecuaciones: $29.172
            </div>
          </div>
          <div className="flex items-center justify-between text-xs pt-2 border-t border-neutral-100">
            <span className="text-emerald-700 font-bold flex items-center gap-0.5 text-[11px]">
              {esSeptiembre ? '▲ +6% vs Ago ($40.545)' : '▼ 3% vs Jul'}
            </span>
            <span className="font-bold text-neutral-500 text-[11px]">{pctInfra}% del total</span>
          </div>
        </div>

        {/* KPI 4: Mano de Obra Directa (MOD ECO) */}
        <div 
          onClick={() => handleTabChange('mod')}
          className="bg-white p-4.5 rounded-xl border border-neutral-200/90 shadow-2xs hover:shadow-md hover:border-purple-500 transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between h-full min-h-[148px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              4. Mano de Obra (MOD)
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="my-1.5">
            <div className="text-2xl font-black text-purple-950 font-mono tracking-tight">
              {TOTALES_MOD_SEPTIEMBRE_2026.totalHorasHombre.toLocaleString('de-DE')} HH
            </div>
            <div className="text-[11px] text-neutral-500 mt-0.5 truncate">
              1.336 registros de trabajo · 162 cuentas auxiliares
            </div>
          </div>
          <div className="flex items-center justify-between text-xs pt-2 border-t border-neutral-100">
            <span className="text-purple-700 font-bold flex items-center gap-0.5 text-[11px]">
              30 Mecánicos ECO
            </span>
            <span className="font-mono text-neutral-600 font-bold text-[11px]">
              ~${TOTALES_MOD_SEPTIEMBRE_2026.costoEstimadoTotalUSD.toLocaleString('de-DE')} USD
            </span>
          </div>
        </div>

        {/* KPI 5: Total General Consolidado */}
        <div className="bg-white p-4.5 rounded-xl border border-amber-300/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between h-full min-h-[148px] bg-gradient-to-br from-white to-amber-50/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
              Total {mesActivoRaw.mesLabel}
            </span>
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="my-1.5">
            <div className="text-2xl font-black text-neutral-900 font-mono tracking-tight">
              {formatExact(totalGeneralMes)}
            </div>
            <div className="text-[11px] text-neutral-600 mt-0.5 truncate">
              CAPEX ($63.324) + OPEX ($108.576)
            </div>
          </div>
          <div className="flex items-center justify-between text-xs pt-2 border-t border-neutral-200">
            <span className="text-amber-800 font-bold text-[11px]">
              OPEX: {formatExact(totalOpexEfectivoMes)}
            </span>
            <span className="font-mono text-neutral-600 font-bold text-[11px]">
              {esSeptiembre ? 'Acum. $2.187.455' : 'Conciliado'}
            </span>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. BARRA DE CONTROL: SELECTOR DE MES Y SUB-PESTAÑAS (ESTILO SAAS)         */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-neutral-200 shadow-2xs">
        
        {/* Selector de Meses */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-700 mr-1">
            <Calendar className="w-4 h-4 text-neutral-500" />
            <span>Mes:</span>
          </div>
          {EVOLUTIVO_INTERNOS_2026.map((m, idx) => {
            const isSelected = selectedMesIdx === idx;
            return (
              <button
                key={m.mesCorto}
                onClick={() => setSelectedMesIdx(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900'
                }`}
              >
                {m.mesCorto}
                {idx === 8 && <span className="ml-1 text-[9px] bg-amber-400 text-slate-950 px-1 rounded font-black">NUEVO</span>}
              </button>
            );
          })}
        </div>

        {/* Sub-Pestañas en Estilo Pill de Proyectos Externos */}
        <div className="flex items-center bg-neutral-100 p-1 rounded-xl text-xs font-bold overflow-x-auto">
          {[
            { id: 'resumen', label: 'Tablero General' },
            { id: 'reclasificacion', label: 'Activos Productivos CAPEX ($28,3k)' },
            { id: 'capex', label: 'Proyectos Internos CAPEX ($35k)' },
            { id: 'flota', label: 'Mantto. Flota (OPEX) ($65,8k)' },
            { id: 'infra', label: 'Infraestructura ($42,8k)' },
            { id: 'gruas', label: 'Grúas TIMACA ($22,8k)' },
            { id: 'mod', label: 'Mano de Obra (5.963 HH)' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => handleTabChange(t.id as SubTabInternos)}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                subTab === t.id
                  ? 'bg-white text-neutral-900 shadow-2xs font-bold'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

      </div>

      {/* ========================================================================= */}
      {/* VISTA 1: TABLERO GENERAL (TABLERO EJECUTIVO IDÉNTICO A PROYECTOS EXTERNOS) */}
      {/* ========================================================================= */}
      {subTab === 'resumen' && (
        <div className="space-y-6">

          {/* ======================================================================= */}
          {/* SECCIÓN 1: EVOLUCIÓN MENSUAL EN BARRAS HORIZONTALES APILADAS (IMAGE 2) */}
          {/* ======================================================================= */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
            
            {/* Header del Gráfico con Toggle de Matriz */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-blue-600" />
                  <h3 className="text-base font-bold text-neutral-900 tracking-tight">
                    Evolución Mensual de Costos Internos (Cifras en USD)
                  </h3>
                </div>
                <p className="text-xs text-neutral-500 mt-0.5 flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs">
                    Acumulado del año 2026: $2.187.455 USD
                  </span>
                  <span>Distribución consolidada de Inversiones CAPEX, Activos Productivos, Flota OPEX e Infraestructura.</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMostrarMatrizHistorica(!mostrarMatrizHistorica)}
                  className="flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100/80 border border-blue-200 px-3 py-1.5 rounded-xl transition-all shadow-2xs cursor-pointer"
                  title="Ver matriz comparativa histórica de 9 meses conciliada con Hoja General (Filas 23-28)"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>{mostrarMatrizHistorica ? 'Ocultar Matriz Histórica' : 'Ver Matriz Comparativa (Filas 23-28)'}</span>
                  {mostrarMatrizHistorica ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Leyenda interactiva de 5 Bloques (Botones rápidos de auditoría) */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mr-1">
                Bloques (Haz clic para auditar):
              </span>
              <button
                type="button"
                onClick={() => {
                  setFiltroBloqueAuditoria('capex');
                  document.getElementById('tabla-auditoria-internos')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-2xs group ${
                  filtroBloqueAuditoria === 'capex'
                    ? 'bg-indigo-50 border-indigo-400 text-indigo-900 ring-2 ring-indigo-500/20'
                    : 'bg-neutral-50 hover:bg-indigo-50/50 border-neutral-200 text-neutral-800 hover:border-indigo-300'
                }`}
                title="Filtrar comprobantes de Inversiones CAPEX"
              >
                <span className="w-3 h-3 rounded-sm shrink-0 bg-indigo-600" />
                <span className="font-bold group-hover:text-indigo-700">1. Inversiones CAPEX ($63,3k)</span>
                <ArrowRight className="w-3 h-3 text-neutral-400 group-hover:text-indigo-600 transition-transform group-hover:translate-x-0.5" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setFiltroBloqueAuditoria('activos');
                  document.getElementById('tabla-auditoria-internos')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-2xs group ${
                  filtroBloqueAuditoria === 'activos'
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-900 ring-2 ring-emerald-500/20'
                    : 'bg-neutral-50 hover:bg-emerald-50/50 border-neutral-200 text-neutral-800 hover:border-emerald-300'
                }`}
                title="Filtrar los 10 Activos Productivos Reclasificados a CAPEX según NIC-16"
              >
                <span className="w-3 h-3 rounded-sm shrink-0 bg-emerald-600" />
                <span className="font-bold group-hover:text-emerald-700">2. Activos Productivos CAPEX ($28,3k)</span>
                <ArrowRight className="w-3 h-3 text-neutral-400 group-hover:text-emerald-600 transition-transform group-hover:translate-x-0.5" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setFiltroBloqueAuditoria('flota');
                  document.getElementById('tabla-auditoria-internos')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-2xs group ${
                  filtroBloqueAuditoria === 'flota'
                    ? 'bg-blue-50 border-blue-400 text-blue-900 ring-2 ring-blue-500/20'
                    : 'bg-neutral-50 hover:bg-blue-50/50 border-neutral-200 text-neutral-800 hover:border-blue-300'
                }`}
                title="Filtrar comprobantes de Mantenimiento de Flota (OPEX)"
              >
                <span className="w-3 h-3 rounded-sm shrink-0 bg-blue-600" />
                <span className="font-bold group-hover:text-blue-700">3. Mantto. Flota OPEX ($65,8k)</span>
                <ArrowRight className="w-3 h-3 text-neutral-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setFiltroBloqueAuditoria('infra');
                  document.getElementById('tabla-auditoria-internos')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-2xs group ${
                  filtroBloqueAuditoria === 'infra'
                    ? 'bg-teal-50 border-teal-400 text-teal-900 ring-2 ring-teal-500/20'
                    : 'bg-neutral-50 hover:bg-teal-50/50 border-neutral-200 text-neutral-800 hover:border-teal-300'
                }`}
                title="Filtrar comprobantes de Mantto. Infraestructura (OPEX)"
              >
                <span className="w-3 h-3 rounded-sm shrink-0 bg-teal-600" />
                <span className="font-bold group-hover:text-teal-700">4. Mantto. Infraestructura ($42,8k)</span>
                <ArrowRight className="w-3 h-3 text-neutral-400 group-hover:text-teal-600 transition-transform group-hover:translate-x-0.5" />
              </button>

                <button
                type="button"
                onClick={() => {
                  setFiltroBloqueAuditoria('admon');
                  document.getElementById('tabla-auditoria-internos')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-2xs group ${
                  filtroBloqueAuditoria === 'admon'
                    ? 'bg-amber-50 border-amber-400 text-amber-900 ring-2 ring-amber-500/20'
                    : 'bg-neutral-50 hover:bg-amber-50/50 border-neutral-200 text-neutral-800 hover:border-amber-300'
                }`}
                title="Filtrar comprobantes de Gastos Administrativos y Departamentos de Soporte"
              >
                <span className="w-3 h-3 rounded-sm shrink-0 bg-amber-600" />
                <span className="font-bold group-hover:text-amber-700">5. Gastos Admon ($42,9k)</span>
                <ArrowRight className="w-3 h-3 text-neutral-400 group-hover:text-amber-600 transition-transform group-hover:translate-x-0.5" />
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('mod')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-2xs group bg-neutral-50 hover:bg-purple-50/50 border-neutral-200 text-neutral-800 hover:border-purple-300"
                title="Ir directamente a la auditoría de Mano de Obra Directa (MOD ECO 5.963 HH)"
              >
                <span className="w-3 h-3 rounded-sm shrink-0 bg-purple-600" />
                <span className="font-bold group-hover:text-purple-700">6. MOD ECO (5.963 HH)</span>
                <ArrowRight className="w-3 h-3 text-neutral-400 group-hover:text-purple-600 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>

            {/* Lista Unificada de Barras Horizontales Apiladas (Idéntica a Proyectos Externos - Image 2) */}
            <div className="space-y-3 pt-2">
              <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3 text-xs text-slate-700 flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Consolidación mensual oficial de Costos Internos:</strong> Inversiones CAPEX ($63,3k en Sep), Mantto. Flota OPEX ($65,8k en Sep) y Mantto. Infraestructura ($42,8k en Sep). Pasa el cursor por las barras apiladas para ver montos y porcentajes, o haz clic en cualquier mes para seleccionarlo.
                </span>
              </div>

              <div className="bg-white rounded-xl border border-neutral-200/90 divide-y divide-neutral-100 overflow-hidden shadow-2xs">
                {/* Encabezado de columnas idéntico a Proyectos Externos */}
                <div className="hidden md:flex items-center px-4 py-2 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-neutral-200/80">
                  <span className="w-56 lg:w-60 shrink-0">Mes / Período</span>
                  <span className="flex-1 px-2">Distribución de Bloques (CAPEX / Activos / Flota / Infra)</span>
                  <span className="w-36 shrink-0 text-right">Promedio Semanal</span>
                  <span className="w-36 shrink-0 text-right">Total Mes (USD)</span>
                </div>

                {MESES_INTERNOS_DATA.map((m) => {
                  const widthPct = Math.max((m.total / maxMesMontoInternos) * 100, 3);
                  
                  // En Septiembre se desglosa el CAPEX Obras ($34.995,08) y Activos Productivos ($28.328,84)
                  const isSep = m.num === 9;
                  const capexObrasVal = isSep ? 34995.08 : m.capex;
                  const activosVal = isSep ? 28328.84 : 0;
                  const flotaVal = m.flota;
                  const infraVal = m.infra;

                  const capexObrasPct = capexObrasVal / m.total;
                  const activosPct = activosVal / m.total;
                  const flotaPct = flotaVal / m.total;
                  const infraPct = infraVal / m.total;
                  
                  const isSelected = selectedMesIdx === (m.num - 1);

                  return (
                    <div 
                      key={m.num}
                      onClick={() => {
                        setSelectedMesIdx(m.num - 1);
                        setPeriodoDetalleBloques(m.num);
                        setFiltroMesAuditoria(m.num);
                      }}
                      className={`p-3.5 sm:px-4 sm:py-2.5 transition-colors flex flex-col md:flex-row md:items-center gap-2 md:gap-4 cursor-pointer group ${
                        isSelected ? 'bg-blue-50/80 ring-1 ring-blue-500' : 'hover:bg-blue-50/60'
                      }`}
                      title={`Haz clic para ver el desglose oficial de ${m.label}`}
                    >
                      {/* Col 1: Mes y salidas */}
                      <div className="w-full md:w-56 lg:w-60 shrink-0 flex items-center justify-between md:justify-start gap-2.5">
                        <span className={`text-xs sm:text-sm whitespace-nowrap ${isSelected ? 'font-black text-blue-900' : 'font-bold text-neutral-900'}`}>
                          {m.label}
                        </span>
                        <span className="text-[10px] font-mono font-medium bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full border border-neutral-200/60 shrink-0 whitespace-nowrap">
                          {m.salidas} salidas
                        </span>
                      </div>

                      {/* Col 2: Barra apilada delgada (8-10px) con esquinas redondeadas y tooltips al pasar el cursor */}
                      <div className="flex-1 min-w-[140px] py-1">
                        <div className="h-2.5 w-full bg-neutral-100 rounded-full overflow-hidden flex shadow-2xs">
                          {/* CAPEX Obras: Indigo */}
                          <div 
                            style={{ width: `${widthPct * capexObrasPct}%` }}
                            className="bg-indigo-600 hover:opacity-80 transition-opacity cursor-pointer"
                            title={`CAPEX Obras: ${formatExact(capexObrasVal)} (${Math.round(capexObrasPct * 100)}%)`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setFiltroBloqueAuditoria('capex');
                              document.getElementById('tabla-auditoria-internos')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                          />
                          {/* Activos Productivos Reclasificados: Emerald */}
                          {activosVal > 0 && (
                            <div 
                              style={{ width: `${widthPct * activosPct}%` }}
                              className="bg-emerald-500 hover:opacity-80 transition-opacity cursor-pointer"
                              title={`Activos Productivos (CAPEX Reclasificado): ${formatExact(activosVal)} (${Math.round(activosPct * 100)}%)`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setFiltroBloqueAuditoria('activos');
                                document.getElementById('tabla-auditoria-internos')?.scrollIntoView({ behavior: 'smooth' });
                              }}
                            />
                          )}
                          {/* Mantto. Flota (OPEX): Blue */}
                          <div 
                            style={{ width: `${widthPct * flotaPct}%` }}
                            className="bg-blue-600 hover:opacity-80 transition-opacity cursor-pointer"
                            title={`Mantto. Flota (OPEX): ${formatExact(flotaVal)} (${Math.round(flotaPct * 100)}%)`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setFiltroBloqueAuditoria('flota');
                              document.getElementById('tabla-auditoria-internos')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                          />
                          {/* Infraestructura (OPEX): Teal */}
                          <div 
                            style={{ width: `${widthPct * infraPct}%` }}
                            className="bg-teal-500 hover:opacity-80 transition-opacity cursor-pointer"
                            title={`Infraestructura (OPEX): ${formatExact(infraVal)} (${Math.round(infraPct * 100)}%)`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setFiltroBloqueAuditoria('infra');
                              document.getElementById('tabla-auditoria-internos')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                          />
                        </div>
                      </div>

                      {/* Col 3: Promedio semanal */}
                      <div className="w-full md:w-36 shrink-0 text-left md:text-right">
                        <span className="text-[10px] text-neutral-400 block md:hidden">Promedio semanal:</span>
                        <span className="font-mono tabular-nums text-neutral-600 text-xs">
                          ${Math.round(m.promSem).toLocaleString('de-DE')} <span className="text-[10px] text-neutral-400 font-sans">/sem</span>
                        </span>
                      </div>

                      {/* Col 4: Total Mes */}
                      <div className="w-full md:w-36 shrink-0 text-left md:text-right">
                        <span className="text-[10px] text-neutral-400 block md:hidden">Total mes:</span>
                        <span className="font-mono tabular-nums font-bold text-neutral-900 text-sm block">
                          ${Math.round(m.total).toLocaleString('de-DE')} <span className="text-[10px] font-sans font-medium text-neutral-500">USD</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ======================================================================= */}
          {/* MATRIZ COMPARATIVA MENSUAL (COLLAPSIBLE / DESPLEGABLE)                 */}
          {/* ======================================================================= */}
          {mostrarMatrizHistorica && (
            <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs overflow-x-auto animate-fade-in space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-neutral-900 tracking-tight flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>Matriz Comparativa Mensual Enero a Septiembre 2026 ($ USD)</span>
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Conciliación 100% oficial con Hoja "General" del Dashboard (Filas 23 a 28).
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-blue-800 bg-blue-50 border border-blue-200 px-3 py-1 rounded-lg font-mono">
                    Septiembre Conciliado: CAPEX $63.323,92 · OPEX $108.575,81 · Total $171.899,73
                  </span>
                  <button
                    onClick={() => setMostrarMatrizHistorica(false)}
                    className="text-neutral-400 hover:text-neutral-700 p-1"
                    title="Cerrar matriz histórica"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-neutral-50 text-neutral-700 font-bold border-b border-neutral-200">
                    <th className="py-2.5 px-3 rounded-l-lg">Descripción del Bloque</th>
                    <th className="py-2.5 px-2 text-right">Ene</th>
                    <th className="py-2.5 px-2 text-right">Feb</th>
                    <th className="py-2.5 px-2 text-right">Mar</th>
                    <th className="py-2.5 px-2 text-right">Abr</th>
                    <th className="py-2.5 px-2 text-right">May</th>
                    <th className="py-2.5 px-2 text-right">Jun</th>
                    <th className="py-2.5 px-2 text-right">Jul</th>
                    <th className="py-2.5 px-2 text-right">Ago</th>
                    <th className="py-2.5 px-3 text-right bg-blue-50 text-blue-900 font-bold">Sep 2026</th>
                    <th className="py-2.5 px-3 text-right rounded-r-lg font-mono font-bold text-neutral-900">Acumulado 2026 ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-medium">
                  {/* 1. Proyectos Internos (CAPEX) */}
                  <tr className="hover:bg-neutral-50/80">
                    <td className="py-2.5 px-3 font-semibold text-neutral-800 flex items-center gap-2 pl-4">
                      <span className="w-2 h-2 rounded-full bg-indigo-500" />
                      <span>Proyectos Internos (CAPEX Obras)</span>
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono text-neutral-600">$162.467</td>
                    <td className="py-2.5 px-2 text-right font-mono text-neutral-600">$326.380</td>
                    <td className="py-2.5 px-2 text-right font-mono text-neutral-600">$149.039</td>
                    <td className="py-2.5 px-2 text-right font-mono text-neutral-600">$92.865</td>
                    <td className="py-2.5 px-2 text-right font-mono text-neutral-600">$77.901</td>
                    <td className="py-2.5 px-2 text-right font-mono text-neutral-600">$32.585</td>
                    <td className="py-2.5 px-2 text-right font-mono text-neutral-600">$45.087</td>
                    <td className="py-2.5 px-2 text-right font-mono text-neutral-600">$29.017</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold bg-blue-50/60 text-blue-900">
                      $34.995,08
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-neutral-900">
                      $950.336,30
                    </td>
                  </tr>

                  {/* 2. Activos Productivos (CAPEX) */}
                  <tr className="hover:bg-neutral-50/80 bg-emerald-50/30">
                    <td className="py-2.5 px-3 font-semibold text-emerald-900 flex items-center gap-2 pl-4">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>Activos Productivos (CAPEX Reclasificado NIC-16)</span>
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono text-neutral-400">$0</td>
                    <td className="py-2.5 px-2 text-right font-mono text-neutral-400">$0</td>
                    <td className="py-2.5 px-2 text-right font-mono text-neutral-400">$0</td>
                    <td className="py-2.5 px-2 text-right font-mono text-neutral-400">$0</td>
                    <td className="py-2.5 px-2 text-right font-mono text-neutral-400">$0</td>
                    <td className="py-2.5 px-2 text-right font-mono text-neutral-400">$0</td>
                    <td className="py-2.5 px-2 text-right font-mono text-neutral-400">$0</td>
                    <td className="py-2.5 px-2 text-right font-mono text-neutral-400">$0</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold bg-emerald-100 text-emerald-950">
                      $28.328,84
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-950">
                      $28.328,84
                    </td>
                  </tr>

                  {/* SUBTOTAL INVERSIONES CAPEX */}
                  <tr className="bg-indigo-50/50 font-bold text-indigo-950 border-t border-indigo-200">
                    <td className="py-2.5 px-3 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-sm bg-indigo-600" />
                      <span>TOTAL CAPEX (PROYECTOS + ACTIVOS PRODUCTIVOS)</span>
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono">$162.467</td>
                    <td className="py-2.5 px-2 text-right font-mono">$326.380</td>
                    <td className="py-2.5 px-2 text-right font-mono">$149.039</td>
                    <td className="py-2.5 px-2 text-right font-mono">$92.865</td>
                    <td className="py-2.5 px-2 text-right font-mono">$77.901</td>
                    <td className="py-2.5 px-2 text-right font-mono">$32.585</td>
                    <td className="py-2.5 px-2 text-right font-mono">$45.087</td>
                    <td className="py-2.5 px-2 text-right font-mono">$29.017</td>
                    <td className="py-2.5 px-3 text-right font-mono font-black bg-indigo-100 text-indigo-950">
                      $63.323,92
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-black text-indigo-950">
                      $978.665,14
                    </td>
                  </tr>

                  {/* 3. Mantto. Activos Productivos (OPEX Flota) */}
                  <tr className="hover:bg-neutral-50/80">
                    <td className="py-2.5 px-3 font-semibold text-neutral-800 flex items-center gap-2 pl-4">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      <span>Mantto. Activos Productivos (OPEX Flota)</span>
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono text-neutral-600">$143.581</td>
                    <td className="py-2.5 px-2 text-right font-mono text-neutral-600">$102.274</td>
                    <td className="py-2.5 px-2 text-right font-mono text-neutral-600">$83.194</td>
                    <td className="py-2.5 px-2 text-right font-mono text-neutral-600">$59.543</td>
                    <td className="py-2.5 px-2 text-right font-mono text-neutral-600">$68.409</td>
                    <td className="py-2.5 px-2 text-right font-mono text-neutral-600">$72.213</td>
                    <td className="py-2.5 px-2 text-right font-mono text-neutral-600">$97.727</td>
                    <td className="py-2.5 px-2 text-right font-mono text-neutral-600">$113.450</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold bg-blue-50/60 text-blue-900">
                      $65.757,04
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-neutral-900">
                      $806.147,99
                    </td>
                  </tr>

                  {/* 4. Mantto. Infraestructura (OPEX Planta) */}
                  <tr className="hover:bg-neutral-50/80">
                    <td className="py-2.5 px-3 font-semibold text-neutral-800 flex items-center gap-2 pl-4">
                      <span className="w-2 h-2 rounded-full bg-teal-500" />
                      <span>Mantto. Infraestructura (OPEX Planta)</span>
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono text-neutral-600">$145.197</td>
                    <td className="py-2.5 px-2 text-right font-mono text-neutral-600">$50.329</td>
                    <td className="py-2.5 px-2 text-right font-mono text-neutral-600">$20.149</td>
                    <td className="py-2.5 px-2 text-right font-mono text-neutral-600">$25.926</td>
                    <td className="py-2.5 px-2 text-right font-mono text-neutral-600">$20.031</td>
                    <td className="py-2.5 px-2 text-right font-mono text-neutral-600">$15.748</td>
                    <td className="py-2.5 px-2 text-right font-mono text-neutral-600">$41.898</td>
                    <td className="py-2.5 px-2 text-right font-mono text-neutral-600">$40.545</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold bg-blue-50/60 text-blue-900">
                      $42.818,77
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-neutral-900">
                      $402.641,72
                    </td>
                  </tr>

                  {/* SUBTOTAL OPEX */}
                  <tr className="bg-blue-50/40 font-bold text-blue-950 border-t border-blue-200">
                    <td className="py-2.5 px-3 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-sm bg-blue-600" />
                      <span>TOTAL OPEX (FLOTA + INFRAESTRUCTURA)</span>
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono">$288.777</td>
                    <td className="py-2.5 px-2 text-right font-mono">$152.603</td>
                    <td className="py-2.5 px-2 text-right font-mono">$103.343</td>
                    <td className="py-2.5 px-2 text-right font-mono">$85.469</td>
                    <td className="py-2.5 px-2 text-right font-mono">$88.440</td>
                    <td className="py-2.5 px-2 text-right font-mono">$87.961</td>
                    <td className="py-2.5 px-2 text-right font-mono">$139.625</td>
                    <td className="py-2.5 px-2 text-right font-mono">$153.995</td>
                    <td className="py-2.5 px-3 text-right font-mono font-black bg-blue-100 text-blue-950">
                      $108.575,81
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-black text-blue-950">
                      $1.208.789,71
                    </td>
                  </tr>

                  {/* TOTAL GENERAL CONCILIADO */}
                  <tr className="bg-neutral-900 font-black text-white border-t-2 border-neutral-950">
                    <td className="py-3 px-3 uppercase tracking-wider text-amber-300">
                      TOTAL GENERAL CONCILIADO (CAPEX + OPEX)
                    </td>
                    <td className="py-3 px-2 text-right font-mono text-neutral-200">$451.244</td>
                    <td className="py-3 px-2 text-right font-mono text-neutral-200">$478.983</td>
                    <td className="py-3 px-2 text-right font-mono text-neutral-200">$252.382</td>
                    <td className="py-3 px-2 text-right font-mono text-neutral-200">$178.334</td>
                    <td className="py-3 px-2 text-right font-mono text-neutral-200">$166.341</td>
                    <td className="py-3 px-2 text-right font-mono text-neutral-200">$120.546</td>
                    <td className="py-3 px-2 text-right font-mono text-neutral-200">$184.712</td>
                    <td className="py-3 px-2 text-right font-mono text-neutral-200">$183.013</td>
                    <td className="py-3 px-3 text-right font-mono bg-amber-400 text-slate-950 font-black text-sm">
                      $171.899,73
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-amber-300 font-black text-sm">
                      $2.187.454,85
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* ======================================================================= */}
          {/* SECCIÓN 2: DETALLE TÉCNICO DE LOS 5 BLOQUES OFICIALES (IMAGE 3)         */}
          {/* ======================================================================= */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <Layers className="w-5 h-5 text-blue-600" />
                  <h3 className="text-base font-bold text-neutral-900 tracking-tight">
                    Detalle Técnico de los Bloques y Partidas Oficiales
                  </h3>
                </div>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {info5Bloques.periodoLabel} — Total: {formatExact(info5Bloques.totalBase)} USD
                </p>
              </div>

              {/* Selector de período idéntico a Proyectos Externos */}
              <div className="flex flex-wrap items-center p-1 bg-neutral-100 rounded-xl border border-neutral-200 text-xs font-bold shrink-0 shadow-2xs gap-1">
                <button
                  type="button"
                  onClick={() => setPeriodoDetalleBloques('anual')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    periodoDetalleBloques === 'anual'
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
                  }`}
                  title="Ver acumulado de los 9 meses oficiales (Enero a Septiembre: $2.187.455 USD)"
                >
                  ★ Acumulado Anual ($2.187.455)
                </button>
                {MESES_INTERNOS_DATA.map((m) => (
                  <button
                    key={m.num}
                    type="button"
                    onClick={() => setPeriodoDetalleBloques(m.num)}
                    className={`px-2.5 py-1.5 rounded-lg transition-all ${
                      periodoDetalleBloques === m.num
                        ? 'bg-slate-800 text-white shadow-xs'
                        : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
                    }`}
                    title={`Ver distribución oficial de ${m.label}`}
                  >
                    {m.corto}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid de 5 Cards Técnicas idéntico a Proyectos Externos */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">

              {/* Card 1: Inversiones CAPEX Obras */}
              <div className="bg-neutral-50/70 p-4 rounded-xl border border-neutral-200/90 flex flex-col justify-between hover:border-neutral-300 hover:shadow-2xs transition-all space-y-3">
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs bg-indigo-600" />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Bloque</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-xs font-mono font-extrabold border shadow-2xs bg-indigo-50 text-indigo-700 border-indigo-200">
                      {info5Bloques.capex.pct}%
                    </span>
                  </div>

                  <h4 className="font-bold text-neutral-900 text-xs sm:text-sm">Inversiones CAPEX Obras</h4>
                  <p className="text-[11px] text-neutral-500 line-clamp-2 mt-1 leading-snug">
                    Obras civiles y montajes de capital en talleres, bancos de prueba y patio.
                  </p>
                </div>

                <div className="pt-2 border-t border-neutral-200/70 space-y-2.5">
                  <div>
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">
                      {periodoDetalleBloques === 'anual' ? 'Acumulado 2026 (Ene - Sep):' : 'Cierre Mensual:'}
                    </span>
                    <span className="text-sm font-black font-mono text-neutral-900 block tabular-nums mt-0.5">
                      {formatExact(info5Bloques.capex.monto)} USD
                    </span>
                    <span className="text-[10px] text-neutral-500 block mt-0.5">
                      {info5Bloques.capex.secundario}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-wider block">
                      Subpartidas Clave:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      <span className="inline-block text-[10px] font-medium bg-white border border-neutral-200 text-neutral-700 px-1.5 py-0.5 rounded-md shadow-2xs" title="Adecuación Patio Externo: Materiales $9.000,80 + Serv $50 + MOD $65 = $9.115,80">
                        TTI-C-0105 Patio ($9.116)
                      </span>
                      <span className="inline-block text-[10px] font-medium bg-white border border-neutral-200 text-neutral-700 px-1.5 py-0.5 rounded-md shadow-2xs" title="Construcción Galpones Cant. 04">
                        TSI-T-0108 Galpones ($19.017)
                      </span>
                      <span className="inline-block text-[10px] font-medium bg-white border border-neutral-200 text-neutral-700 px-1.5 py-0.5 rounded-md shadow-2xs" title="Edificio Administrativo">
                        TTI-C-0095 ($3.542)
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setFiltroBloqueAuditoria('capex');
                      document.getElementById('tabla-auditoria-internos')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full text-left text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center justify-between pt-1.5 border-t border-neutral-200/70 group transition-colors cursor-pointer"
                  >
                    <span>Auditar partida</span>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-indigo-600 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>

              {/* Card 2: Activos Productivos CAPEX (NIC-16) */}
              <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200/90 flex flex-col justify-between hover:border-emerald-300 hover:shadow-2xs transition-all space-y-3">
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs bg-emerald-600" />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Reclasificado NIC-16</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-xs font-mono font-extrabold border shadow-2xs bg-emerald-100 text-emerald-900 border-emerald-300">
                      {info5Bloques.activos.pct}%
                    </span>
                  </div>

                  <h4 className="font-bold text-emerald-950 text-xs sm:text-sm">Activos Productivos (CAPEX)</h4>
                  <p className="text-[11px] text-emerald-800 line-clamp-2 mt-1 leading-snug">
                    Reclasificación oficial de 10 equipos estratégicos según NIC-16 ($28.328,84 USD).
                  </p>
                </div>

                <div className="pt-2 border-t border-emerald-200/70 space-y-2.5">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                      {periodoDetalleBloques === 'anual' ? 'Capitalizado 2026:' : 'Cierre Septiembre:'}
                    </span>
                    <span className="text-sm font-black font-mono text-emerald-950 block tabular-nums mt-0.5">
                      {formatExact(info5Bloques.activos.monto)} USD
                    </span>
                    <span className="text-[10px] text-emerald-700 block mt-0.5">
                      {info5Bloques.activos.secundario}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                      Equipos Destacados:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      <span className="inline-block text-[10px] font-medium bg-white border border-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded-md shadow-2xs" title="Grúa Link Belt LS918 400TN">
                        GR23 ($10.871)
                      </span>
                      <span className="inline-block text-[10px] font-medium bg-white border border-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded-md shadow-2xs" title="Autobús Encava FA160P">
                        BS03 ($6.945)
                      </span>
                      <span className="inline-block text-[10px] font-medium bg-white border border-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded-md shadow-2xs" title="Autobús Encava 6036A1Y">
                        BS15 ($4.195)
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setFiltroBloqueAuditoria('activos');
                      document.getElementById('tabla-auditoria-internos')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full text-left text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center justify-between pt-1.5 border-t border-emerald-200/70 group transition-colors cursor-pointer"
                  >
                    <span>Auditar 10 activos</span>
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-500 group-hover:text-emerald-800 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>

              {/* Card 3: Mantenimiento Flota (OPEX) */}
              <div className="bg-neutral-50/70 p-4 rounded-xl border border-neutral-200/90 flex flex-col justify-between hover:border-neutral-300 hover:shadow-2xs transition-all space-y-3">
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs bg-blue-600" />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Bloque</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-xs font-mono font-extrabold border shadow-2xs bg-blue-50 text-blue-700 border-blue-200">
                      {info5Bloques.flota.pct}%
                    </span>
                  </div>

                  <h4 className="font-bold text-neutral-900 text-xs sm:text-sm">Mantto. Flota (OPEX)</h4>
                  <p className="text-[11px] text-neutral-500 line-clamp-2 mt-1 leading-snug">
                    Costos operativos de mantenimiento preventivo y correctivo para grúas y camiones.
                  </p>
                </div>

                <div className="pt-2 border-t border-neutral-200/70 space-y-2.5">
                  <div>
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">
                      {periodoDetalleBloques === 'anual' ? 'Acumulado 2026 (Ene - Sep):' : 'Cierre Mensual:'}
                    </span>
                    <span className="text-sm font-black font-mono text-neutral-900 block tabular-nums mt-0.5">
                      {formatExact(info5Bloques.flota.monto)} USD
                    </span>
                    <span className="text-[10px] text-neutral-500 block mt-0.5">
                      {info5Bloques.flota.secundario}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-wider block">
                      Familias de Equipos:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      <span className="inline-block text-[10px] font-medium bg-white border border-neutral-200 text-neutral-700 px-1.5 py-0.5 rounded-md shadow-2xs">
                        Grúas Telescópicas
                      </span>
                      <span className="inline-block text-[10px] font-medium bg-white border border-neutral-200 text-neutral-700 px-1.5 py-0.5 rounded-md shadow-2xs">
                        Camiones Chasis
                      </span>
                      <span className="inline-block text-[10px] font-medium bg-white border border-neutral-200 text-neutral-700 px-1.5 py-0.5 rounded-md shadow-2xs">
                        Autobuses Personal
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setFiltroBloqueAuditoria('flota');
                      document.getElementById('tabla-auditoria-internos')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full text-left text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center justify-between pt-1.5 border-t border-neutral-200/70 group transition-colors cursor-pointer"
                  >
                    <span>Auditar partida</span>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>

              {/* Card 4: Infraestructura y Planta (OPEX) */}
              <div className="bg-neutral-50/70 p-4 rounded-xl border border-neutral-200/90 flex flex-col justify-between hover:border-neutral-300 hover:shadow-2xs transition-all space-y-3">
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs bg-teal-600" />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Bloque</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-xs font-mono font-extrabold border shadow-2xs bg-teal-50 text-teal-700 border-teal-200">
                      {info5Bloques.infra.pct}%
                    </span>
                  </div>

                  <h4 className="font-bold text-neutral-900 text-xs sm:text-sm">Infraestructura y Planta</h4>
                  <p className="text-[11px] text-neutral-500 line-clamp-2 mt-1 leading-snug">
                    Mantenimiento de servicios industriales, planta física y subestaciones eléctricas.
                  </p>
                </div>

                <div className="pt-2 border-t border-neutral-200/70 space-y-2.5">
                  <div>
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">
                      {periodoDetalleBloques === 'anual' ? 'Acumulado 2026 (Ene - Sep):' : 'Cierre Mensual:'}
                    </span>
                    <span className="text-sm font-black font-mono text-neutral-900 block tabular-nums mt-0.5">
                      {formatExact(info5Bloques.infra.monto)} USD
                    </span>
                    <span className="text-[10px] text-neutral-500 block mt-0.5">
                      {info5Bloques.infra.secundario}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-wider block">
                      Subpartidas:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      <span className="inline-block text-[10px] font-medium bg-white border border-neutral-200 text-neutral-700 px-1.5 py-0.5 rounded-md shadow-2xs">
                        TT-I-C-033 Galpones
                      </span>
                      <span className="inline-block text-[10px] font-medium bg-white border border-neutral-200 text-neutral-700 px-1.5 py-0.5 rounded-md shadow-2xs">
                        TTI-C-0104 Grúas Torres
                      </span>
                      <span className="inline-block text-[10px] font-medium bg-white border border-neutral-200 text-neutral-700 px-1.5 py-0.5 rounded-md shadow-2xs">
                        Servicios Generales
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setFiltroBloqueAuditoria('infra');
                      document.getElementById('tabla-auditoria-internos')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full text-left text-xs font-bold text-teal-600 hover:text-teal-800 flex items-center justify-between pt-1.5 border-t border-neutral-200/70 group transition-colors cursor-pointer"
                  >
                    <span>Auditar partida</span>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-teal-600 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>

              {/* Card 5: Mano de Obra Directa (MOD ECO) */}
              <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-200/90 flex flex-col justify-between hover:border-purple-300 hover:shadow-2xs transition-all space-y-3">
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs bg-purple-600" />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700">MOD ECO</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-xs font-mono font-extrabold border shadow-2xs bg-purple-100 text-purple-900 border-purple-300">
                      {info5Bloques.mod.pct}
                    </span>
                  </div>

                  <h4 className="font-bold text-purple-950 text-xs sm:text-sm">Mano de Obra Directa (MOD)</h4>
                  <p className="text-[11px] text-purple-800 line-clamp-2 mt-1 leading-snug">
                    5.963 Horas Hombre registradas en 1.336 vales y 32 mecánicos en flota y equipos.
                  </p>
                </div>

                <div className="pt-2 border-t border-purple-200/70 space-y-2.5">
                  <div>
                    <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider block">
                      Horas Hombre Verificadas:
                    </span>
                    <span className="text-sm font-black font-mono text-purple-950 block tabular-nums mt-0.5">
                      {info5Bloques.mod.monto}
                    </span>
                    <span className="text-[10px] text-purple-700 block mt-0.5">
                      {info5Bloques.mod.secundario}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider block">
                      Imputaciones MOD:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      <span className="inline-block text-[10px] font-medium bg-white border border-purple-200 text-purple-900 px-1.5 py-0.5 rounded-md shadow-2xs">
                        32 Mecánicos
                      </span>
                      <span className="inline-block text-[10px] font-medium bg-white border border-purple-200 text-purple-900 px-1.5 py-0.5 rounded-md shadow-2xs">
                        162 Cuentas Aux.
                      </span>
                      <span className="inline-block text-[10px] font-medium bg-white border border-purple-200 text-purple-900 px-1.5 py-0.5 rounded-md shadow-2xs" title="Horas hombre sumadas a adecuación patio TTI-C-0105">
                        +$65 Patio
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleTabChange('mod')}
                    className="w-full text-left text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center justify-between pt-1.5 border-t border-purple-200/70 group transition-colors cursor-pointer"
                  >
                    <span>Ver Registro HH ECO</span>
                    <ArrowRight className="w-3.5 h-3.5 text-purple-500 group-hover:text-purple-800 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* ======================================================================= */}
          {/* SECCIÓN 3: TABLA INTERACTIVA DE AUDITORÍA COMPROBANTE POR COMPROBANTE  */}
          {/* ======================================================================= */}
          <div id="tabla-auditoria-internos" className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden scroll-mt-6">
            
            {/* Header de la Tabla de Auditoría */}
            <div className="p-4 sm:p-5 border-b border-neutral-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-neutral-50/50">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="text-base font-bold text-neutral-900 tracking-tight">
                    Auditoría Detallada de Comprobantes Internos (Almacén SIP, Servicios y Talleres)
                  </h3>
                  <span className="text-[11px] font-bold text-blue-800 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                    Corte Contable: Septiembre 2026 ({salidasInternasAuditadas.length.toLocaleString('de-DE')} comprobantes)
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Auditoría comprobante por comprobante clasificada por Bloque Contable, Categoría de Gasto y Cuenta Auxiliar.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Selector de cantidad de filas visibles */}
                <div className="inline-flex p-1 bg-white rounded-xl border border-slate-300 text-xs font-semibold shadow-2xs">
                  {[25, 50, 100].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setFilasAMostrarAuditoria(num)}
                      className={`px-2.5 py-1.5 rounded-lg transition-all ${
                        filasAMostrarAuditoria === num 
                          ? 'bg-blue-50 text-blue-800 font-bold border border-blue-200' 
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                      title={`Mostrar ${num} comprobantes`}
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setFilasAMostrarAuditoria('todas')}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                      filasAMostrarAuditoria === 'todas' 
                        ? 'bg-blue-600 text-white font-bold shadow-xs' 
                        : 'text-slate-700 hover:text-blue-700 hover:bg-slate-50'
                    }`}
                    title="Explorar todas las salidas del mes en esta misma tabla"
                  >
                    <span>Ver Todas ({salidasInternasAuditadas.length})</span>
                    {filasAMostrarAuditoria === 'todas' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </div>

                {/* Botón Descargar en Excel */}
                <button
                  type="button"
                  onClick={handleExportarExcelAuditoria}
                  className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-3.5 py-2 rounded-xl transition-all shadow-2xs hover:shadow-xs cursor-pointer"
                  title="Descargar estos comprobantes directamente en un archivo de Excel (.xlsx)"
                >
                  {downloadExcelSuccessAuditoria ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>¡Excel Descargado!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 text-emerald-600" />
                      <span>Descargar en Excel</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Barra de Filtro por Bloque Contable */}
            <div className="px-4 py-3 bg-slate-100/90 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1 flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                  Filtrar por Bloque:
                </span>
                <button
                  type="button"
                  onClick={() => setFiltroBloqueAuditoria('todos')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    filtroBloqueAuditoria === 'todos'
                      ? 'bg-slate-900 text-white shadow-2xs font-bold'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 shadow-2xs'
                  }`}
                >
                  Todos los Bloques ({salidasInternasSeptiembre.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroBloqueAuditoria('capex')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    filtroBloqueAuditoria === 'capex'
                      ? 'bg-indigo-600 text-white shadow-2xs font-bold'
                      : 'bg-white text-indigo-900 hover:bg-indigo-50 border border-indigo-200 shadow-2xs'
                  }`}
                >
                  CAPEX Obras
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroBloqueAuditoria('activos')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                    filtroBloqueAuditoria === 'activos'
                      ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                      : 'bg-white text-emerald-900 hover:bg-emerald-50 border border-emerald-300 shadow-2xs'
                  }`}
                  title="10 Activos Productivos Reclasificados según NIC-16 ($28.328,84 USD)"
                >
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>Activos Productivos CAPEX ($28,3k)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroBloqueAuditoria('flota')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    filtroBloqueAuditoria === 'flota'
                      ? 'bg-blue-600 text-white shadow-2xs font-bold'
                      : 'bg-white text-blue-900 hover:bg-blue-50 border border-blue-200 shadow-2xs'
                  }`}
                >
                  Mantto. Flota (OPEX)
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroBloqueAuditoria('infra')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    filtroBloqueAuditoria === 'infra'
                      ? 'bg-teal-600 text-white shadow-2xs font-bold'
                      : 'bg-white text-teal-900 hover:bg-teal-50 border border-teal-200 shadow-2xs'
                  }`}
                >
                  Infraestructura (OPEX)
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroBloqueAuditoria('admon')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    filtroBloqueAuditoria === 'admon'
                      ? 'bg-amber-600 text-white shadow-2xs font-bold'
                      : 'bg-white text-amber-900 hover:bg-amber-50 border border-amber-200 shadow-2xs'
                  }`}
                >
                  Gastos Administrativos (ADMON)
                </button>
              </div>

              {/* Muestra Destacada del Total */}
              <div className="flex items-center gap-2.5 bg-blue-50/90 border border-blue-200/90 px-3.5 py-1.5 rounded-xl shadow-2xs self-start md:self-auto">
                <span className="text-slate-600 font-medium text-xs">
                  Total Filtrado ({salidasInternasAuditadas.length} vales):
                </span>
                <span className="font-mono text-sm font-extrabold text-blue-900 tabular-nums">
                  {formatExact(totalMontoAuditado)} <span className="text-[11px] font-bold text-blue-700">USD</span>
                </span>
              </div>
            </div>

            {/* Barra de Filtro por Categoría / Voz de Gasto */}
            <div className="px-4 py-2.5 bg-slate-50/90 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-2.5 text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1 flex items-center gap-1">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
                  Categoría / Voz de Gasto:
                </span>
                <button
                  type="button"
                  onClick={() => setFiltroCategoriaAuditoria('todos')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    filtroCategoriaAuditoria === 'todos'
                      ? 'bg-blue-600 text-white shadow-2xs font-bold'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300 shadow-2xs'
                  }`}
                >
                  Todas las Categorías
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroCategoriaAuditoria('Materiales Directos')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    filtroCategoriaAuditoria === 'Materiales Directos'
                      ? 'bg-blue-700 text-white shadow-2xs font-bold'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300 shadow-2xs'
                  }`}
                >
                  Materiales Directos
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroCategoriaAuditoria('Servicios')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    filtroCategoriaAuditoria === 'Servicios'
                      ? 'bg-orange-600 text-white shadow-2xs font-bold'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300 shadow-2xs'
                  }`}
                >
                  Servicios y Reparaciones
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroCategoriaAuditoria('MOD')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    filtroCategoriaAuditoria === 'MOD'
                      ? 'bg-purple-600 text-white shadow-2xs font-bold'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300 shadow-2xs'
                  }`}
                >
                  MOD (Mano de Obra)
                </button>
              </div>

              {/* Buscador en tiempo real */}
              <div className="relative w-full md:w-72">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={busquedaAuditoria}
                  onChange={(e) => setBusquedaAuditoria(e.target.value)}
                  placeholder="Buscar vale, ítem, cuenta, solicitante..."
                  className="w-full pl-8 pr-7 py-1 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
                />
                {busquedaAuditoria && (
                  <button
                    onClick={() => setBusquedaAuditoria('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Barra de Filtro por Cuentas Auxiliares */}
            <div className="px-4 py-2.5 bg-slate-50/70 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-2.5 text-xs">
              <div className="flex flex-wrap items-center gap-1.5 flex-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1 flex items-center gap-1 shrink-0">
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  Cuentas Auxiliares:
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedCuentasAuditoria([])}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    selectedCuentasAuditoria.length === 0
                      ? 'bg-blue-600 text-white shadow-2xs font-bold'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300 shadow-2xs'
                  }`}
                >
                  Todas las Cuentas
                </button>
                {[
                  { cod: 'TTI-C-0105', label: '0105 Adecuación Patio' },
                  { cod: 'TSI-T-0108', label: '0108 Galpones Cant. 04' },
                  { cod: 'GR23', label: 'GR23 Link Belt 400TN' },
                  { cod: 'BS03', label: 'BS03 Búfalo Encava' },
                  { cod: 'BS15', label: 'BS15 Encava Nuevo' },
                  { cod: '854', label: 'PA01 Payloader 854' },
                  { cod: 'TT-I-C-033', label: '033 Galpones Infra' }
                ].map((p) => {
                  const isActive = selectedCuentasAuditoria.includes(p.cod);
                  return (
                    <button
                      key={p.cod}
                      type="button"
                      onClick={() => toggleCuentaAuditoria(p.cod)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                        isActive
                          ? 'bg-blue-700 text-white shadow-2xs font-bold ring-2 ring-blue-400'
                          : 'bg-white text-slate-700 hover:bg-blue-50 hover:text-blue-700 border border-slate-300 shadow-2xs'
                      }`}
                      title={`Filtrar por cuenta ${p.label}`}
                    >
                      <span>{p.label}</span>
                      {isActive && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </button>
                  );
                })}

                {/* Selector Dropdown para elegir cualquier Cuenta Auxiliar */}
                <div className="relative inline-block">
                  <select
                    value=""
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val) return;
                      if (val === '__todas__') {
                        setSelectedCuentasAuditoria([]);
                      } else if (!selectedCuentasAuditoria.includes(val)) {
                        setSelectedCuentasAuditoria([...selectedCuentasAuditoria, val]);
                      }
                    }}
                    className="text-xs bg-white text-slate-700 border border-slate-300 rounded-lg px-2.5 py-1 font-medium hover:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-2xs"
                  >
                    <option value="">+ Seleccionar otra cuenta ({cuentasInternasDisponibles.length} disponibles)...</option>
                    <option value="__todas__">Limpiar selección (Ver todas las cuentas)</option>
                    <optgroup label="Cuentas Auxiliares Internas (Mayor a Menor Monto)">
                      {cuentasInternasDisponibles.map(c => (
                        <option key={c.codigo} value={c.codigo}>
                          {c.codigo} — {c.nombre} (${Math.round(c.total).toLocaleString('de-DE')} USD · {c.count} salidas)
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              </div>

              {/* Chips de cuentas activas */}
              {selectedCuentasAuditoria.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 self-start md:self-auto">
                  <span className="text-[10px] text-slate-500 font-semibold">Filtro activo ({selectedCuentasAuditoria.length}):</span>
                  {selectedCuentasAuditoria.map(cod => (
                    <span
                      key={cod}
                      className="inline-flex items-center gap-1 bg-blue-100 text-blue-900 border border-blue-300 text-[11px] font-bold px-2 py-0.5 rounded-md shadow-2xs"
                    >
                      <span>{cod}</span>
                      <button
                        onClick={() => toggleCuentaAuditoria(cod)}
                        className="hover:text-red-600 transition-colors p-0.5"
                        title={`Quitar filtro ${cod}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <button
                    onClick={() => setSelectedCuentasAuditoria([])}
                    className="text-[11px] font-bold text-red-600 hover:text-red-700 hover:underline px-1"
                    title="Limpiar filtro de cuentas"
                  >
                    Limpiar
                  </button>
                </div>
              )}
            </div>

            {/* Tabla de Vales de Salidas Internas */}
            <div className={`overflow-x-auto ${filasAMostrarAuditoria === 'todas' || (typeof filasAMostrarAuditoria === 'number' && filasAMostrarAuditoria > 15) ? 'max-h-[640px] overflow-y-auto' : ''}`}>
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100/95 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider whitespace-nowrap sticky top-0 z-10 shadow-2xs">
                  <tr>
                    <th className="py-3 px-3">Fecha</th>
                    <th className="py-3 px-3">Comprobante SIP</th>
                    <th className="py-3 px-3">Cuenta Auxiliar</th>
                    <th className="py-3 px-3 min-w-[150px]">Proyecto / Activo</th>
                    <th className="py-3 px-3 min-w-[140px]">Bloque Contable</th>
                    <th className="py-3 px-3 min-w-[130px]">Categoría</th>
                    <th className="py-3 px-4 min-w-[220px]">Descripción del Ítem</th>
                    <th className="py-3 px-3 text-right">Cantidad</th>
                    <th className="py-3 px-3">Unidad</th>
                    <th className="py-3 px-3 text-right">P. Unitario ($)</th>
                    <th className="py-3 px-3 text-right">Monto Total ($ USD)</th>
                    <th className="py-3 px-3 min-w-[130px]">Solicitante</th>
                    <th className="py-3 px-3 min-w-[170px]">Observaciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 bg-white">
                  {salidasInternasMostradas.length === 0 ? (
                    <tr>
                      <td colSpan={13} className="py-12 text-center text-neutral-400">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2 text-neutral-300" />
                        <p className="font-semibold text-neutral-600">No se encontraron comprobantes con los filtros seleccionados</p>
                        <p className="text-xs text-neutral-400 mt-1">Prueba cambiando el bloque, la categoría o limpiando los filtros de búsqueda</p>
                      </td>
                    </tr>
                  ) : (
                    salidasInternasMostradas.map((s) => {
                      let badgeBloqueColor = 'bg-blue-100 text-blue-800 border-blue-200';
                      if (s.bloque === 'CAPEX Obras') {
                        badgeBloqueColor = 'bg-indigo-100 text-indigo-800 border-indigo-200';
                      } else if (s.isActivoProductivo || s.bloque === 'Activos Productivos (CAPEX)') {
                        badgeBloqueColor = 'bg-emerald-100 text-emerald-900 border-emerald-300 font-extrabold';
                      } else if (s.bloque === 'Infraestructura (OPEX)') {
                        badgeBloqueColor = 'bg-teal-100 text-teal-800 border-teal-200';
                      } else if (s.bloque === 'Gastos Administrativos (ADMON)') {
                        badgeBloqueColor = 'bg-amber-100 text-amber-800 border-amber-200';
                      }

                      let badgeCatColor = 'bg-slate-100 text-slate-800 border-slate-200';
                      if (s.catGasto === 'Materiales Directos') badgeCatColor = 'bg-blue-50 text-blue-700 border-blue-200';
                      if (s.catGasto === 'Servicios') badgeCatColor = 'bg-orange-50 text-orange-700 border-orange-200';
                      if (s.catGasto === 'MOD') badgeCatColor = 'bg-purple-50 text-purple-700 border-purple-200';

                      return (
                        <tr 
                          key={s.id}
                          className={`hover:bg-blue-50/60 transition-colors ${
                            s.isActivoProductivo ? 'bg-emerald-50/20' : ''
                          }`}
                        >
                          <td className="py-2.5 px-3 font-mono text-[11px] text-neutral-600 whitespace-nowrap">
                            {s.fecha}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-blue-900 whitespace-nowrap">
                            {s.codigoSalida}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-neutral-800 whitespace-nowrap">
                            {s.cuentaAuxiliarCodigo}
                          </td>
                          <td className="py-2.5 px-3 font-medium text-neutral-900 max-w-[180px] truncate" title={s.proyecto}>
                            {s.proyecto}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] border shadow-2xs ${badgeBloqueColor}`}>
                              {s.bloque}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] border shadow-2xs font-semibold ${badgeCatColor}`}>
                              {s.catGasto}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-neutral-900 max-w-[280px] truncate" title={s.itemDescripcion}>
                            {s.itemDescripcion}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-semibold text-neutral-800 whitespace-nowrap">
                            {(s.cantidad ?? 0).toLocaleString('de-DE')}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-neutral-500 whitespace-nowrap">
                            {s.unidadMedida === 'USE' ? 'SERV' : s.unidadMedida}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-neutral-600 whitespace-nowrap">
                            ${(s.precioUnitario ?? 0).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-black text-neutral-900 whitespace-nowrap bg-neutral-50/50">
                            ${(s.montoTotal ?? 0).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-2.5 px-3 text-neutral-600 max-w-[140px] truncate" title={s.solicitante}>
                            {s.solicitante || '-'}
                          </td>
                          <td className="py-2.5 px-3 text-neutral-500 max-w-[180px] truncate text-[11px]" title={s.observaciones}>
                            {s.observaciones || '-'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer de la tabla con total y paginación sutil */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <span>Mostrando <strong>{salidasInternasMostradas.length}</strong> de <strong>{salidasInternasAuditadas.length}</strong> comprobantes auditados.</span>
              </div>
              <div className="flex items-center gap-3 font-mono">
                <span>Monto mostrado: <strong>${Math.round(salidasInternasMostradas.reduce((acc, s) => acc + s.montoTotal, 0)).toLocaleString('de-DE')} USD</strong></span>
                <span className="text-slate-300">|</span>
                <span>Total filtro: <strong className="text-blue-900">{formatExact(totalMontoAuditado)} USD</strong></span>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 2: MANO DE OBRA DIRECTA (MOD ECO) - HORAS HOMBRES SEPTIEMBRE        */}
      {/* ========================================================================= */}
      {subTab === 'mod' && (
        <div className="space-y-6">
          
          {/* Banner de Sincronización del Archivo */}
          <div className="bg-purple-50/80 border border-purple-200 p-4.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-purple-950 shadow-2xs">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-sm block text-purple-950">
                  Mano de Obra Directa (MOD) — Mantenimiento de Flota & Equipos ECO (Septiembre 2026)
                </span>
                <p className="text-purple-900/90 mt-0.5 leading-relaxed">
                  Consolidado directamente desde <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-purple-200 font-bold">horas hombres eco septiembre.xlsx</code>.
                  Total verificado: <strong>5.963 Horas Hombre</strong> distribuidas en <strong>1.336 registros de intervención</strong>, <strong>32 mecánicos y técnicos</strong> de planta y <strong>162 cuentas auxiliares</strong> de activos y talleres.
                </p>
              </div>
            </div>
            <button
              onClick={handleDescargarExcelConciliacion}
              className="shrink-0 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Download className="w-4 h-4" />
              <span>Exportar 162 Cuentas MOD (Excel)</span>
            </button>
          </div>

          {/* 4 Métricas Clave de MOD */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4.5 rounded-xl border border-purple-200 shadow-2xs">
              <div className="text-xs font-bold text-purple-700 uppercase tracking-wider">Total Horas Hombre Septiembre</div>
              <div className="text-2xl font-black text-purple-950 font-mono mt-1">
                {TOTALES_MOD_SEPTIEMBRE_2026.totalHorasHombre.toLocaleString('de-DE')} HH
              </div>
              <div className="text-xs text-neutral-500 mt-1">
                1.336 registros de órdenes de trabajo
              </div>
            </div>

            <div className="bg-white p-4.5 rounded-xl border border-neutral-200 shadow-2xs">
              <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Técnicos & Mecánicos Planta</div>
              <div className="text-2xl font-black text-neutral-900 font-mono mt-1">
                {TOTALES_MOD_SEPTIEMBRE_2026.totalTecnicosPlanta} Técnicos
              </div>
              <div className="text-xs text-neutral-500 mt-1">
                Personal operativo de mantenimiento ECO
              </div>
            </div>

            <div className="bg-white p-4.5 rounded-xl border border-neutral-200 shadow-2xs">
              <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Cuentas Auxiliares Atendidas</div>
              <div className="text-2xl font-black text-neutral-900 font-mono mt-1">
                {TOTALES_MOD_SEPTIEMBRE_2026.cuentasAuxiliaresImpactadas} Activos
              </div>
              <div className="text-xs text-neutral-500 mt-1">
                Grúas, camiones, autobuses, galpones y equipos
              </div>
            </div>

            <div className="bg-white p-4.5 rounded-xl border border-emerald-200 bg-emerald-50/30 shadow-2xs">
              <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Costo Estimado MOD Septiembre</div>
              <div className="text-2xl font-black text-emerald-700 font-mono mt-1">
                ${TOTALES_MOD_SEPTIEMBRE_2026.costoEstimadoTotalUSD.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-emerald-800 mt-1">
                Tarifa promedio estimada: ~${TOTALES_MOD_SEPTIEMBRE_2026.tarifaPromedioEstimadaHora} / HH
              </div>
            </div>
          </div>

          {/* EVOLUCIÓN SEMANAL MOD (5 SEMANAS - ANÁLISIS DE PICOS Y CIERRE) */}
          <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs space-y-4">
            <div className="border-b border-neutral-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-neutral-900 tracking-tight flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  <span>Evolución Semanal de Horas Hombre — Septiembre 2026 (5 Semanas)</span>
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Comportamiento técnico por semana laborable según análisis de la hoja de costos ECO.
                </p>
              </div>
              <div className="text-xs font-bold px-3 py-1 bg-purple-100 text-purple-900 rounded-lg shrink-0">
                Total Acumulado: 5.963 HH
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5">
              {EVOLUTIVO_SEMANAL_MOD_SEPTIEMBRE_2026.map((s, idx) => {
                const esPicoMax = idx === 1;
                const esSegundoPico = idx === 2;
                const esCierre = idx === 4;

                return (
                  <div 
                    key={s.semana}
                    className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                      esPicoMax 
                        ? 'bg-purple-50/70 border-purple-300 shadow-2xs' 
                        : esSegundoPico
                        ? 'bg-blue-50/60 border-blue-200'
                        : esCierre
                        ? 'bg-amber-50/50 border-amber-200'
                        : 'bg-neutral-50/80 border-neutral-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-neutral-900">{s.semana}</span>
                        {esPicoMax && (
                          <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-purple-600 text-white">
                            Pico Máx
                          </span>
                        )}
                        {esSegundoPico && (
                          <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-blue-600 text-white">
                            Pico 2
                          </span>
                        )}
                        {esCierre && (
                          <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-600 text-white">
                            3 Días
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-neutral-500">{s.periodo}</div>
                      <div className="text-2xl font-black font-mono text-neutral-900 mt-2">
                        {s.horas.toLocaleString('de-DE')} <span className="text-xs font-normal text-neutral-500">HH</span>
                      </div>
                      <div className="text-[11px] font-semibold text-neutral-600 mt-0.5">
                        {s.intervenciones} intervenciones
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-neutral-200/80 text-[11px] text-neutral-700 leading-relaxed italic">
                      "{s.detalle}"
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* DISTRIBUCIÓN POR FAMILIA & TOP TÉCNICOS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* Familias de Equipos */}
            <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-neutral-900 tracking-tight flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>Horas Hombre por Familia de Activo</span>
              </h3>
              <div className="space-y-2">
                {HORAS_HOMBRE_POR_FAMILIA_SEPTIEMBRE.slice(0, 7).map((f) => {
                  const pct = Math.round((f.totalHoras / TOTALES_MOD_SEPTIEMBRE_2026.totalHorasHombre) * 100);
                  return (
                    <div key={f.tipo} className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-neutral-800">{f.tipo}</span>
                        <span className="font-mono font-black text-purple-950">{f.totalHoras.toLocaleString('de-DE')} HH ({pct}%)</span>
                      </div>
                      <div className="w-full bg-neutral-200 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-purple-600 h-1.5 rounded-full" 
                          style={{ width: `${Math.min(100, Math.max(5, pct * 2.5))}%` }}
                        ></div>
                      </div>
                      <div className="text-[10px] text-neutral-500 mt-1 font-mono">
                        {f.registros} órdenes registradas
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Técnicos / Mecánicos */}
            <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-neutral-900 tracking-tight flex items-center gap-2">
                <Wrench className="w-4 h-4 text-emerald-600" />
                <span>Top Técnicos & Mecánicos con Mayor Carga Horaria</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {HORAS_HOMBRE_POR_TRABAJADOR_SEPTIEMBRE.slice(0, 8).map((t, idx) => (
                  <div key={t.trabajador} className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                        <span className="text-[10px] font-mono text-neutral-400">#{idx + 1}</span>
                        <span>{t.trabajador}</span>
                      </div>
                      <div className="text-[11px] text-neutral-500 font-mono mt-0.5">{t.registros} intervenciones</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black font-mono text-emerald-800">{t.totalHoras} HH</div>
                      <div className="text-[10px] font-bold text-neutral-400">Paquete ${t.paquete}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* TABLA PRINCIPAL DE 162 CUENTAS AUXILIARES */}
          <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-neutral-900 tracking-tight flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600" />
                  <span>Distribución de Horas Hombre por Cuenta Auxiliar (162 Cuentas — 5.963 HH)</span>
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Horas de trabajo vinculadas a cada activo, grúa, vehículo y galpón en Septiembre 2026.
                </p>
              </div>

              {/* Filtros */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar cuenta o equipo..."
                    value={busquedaMOD}
                    onChange={(e) => setBusquedaMOD(e.target.value)}
                    className="pl-8 pr-3 py-1.5 rounded-lg border border-neutral-200 text-xs focus:ring-1 focus:ring-purple-500 w-44 sm:w-56"
                  />
                </div>

                <select
                  value={filtroFamiliaMOD}
                  onChange={(e) => setFiltroFamiliaMOD(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-neutral-200 text-xs bg-white text-neutral-700 font-medium"
                >
                  <option value="todos">Todas las Familias ({cuentasMODFiltradas.length})</option>
                  <option value="Grúas">Grúas</option>
                  <option value="Camiones">Camiones</option>
                  <option value="Autobuses">Autobuses</option>
                  <option value="Vehículos">Vehículos</option>
                  <option value="Equipos Especiales">Equipos Especiales</option>
                  <option value="Mantenimiento y Adecuaciones">Adecuaciones & Galpones</option>
                  <option value="Montacargas">Montacargas</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full text-xs text-left">
                <thead className="sticky top-0 bg-neutral-100 z-10 shadow-2xs">
                  <tr className="text-neutral-700 font-bold border-b border-neutral-200">
                    <th className="py-2.5 px-3">Cuenta Auxiliar</th>
                    <th className="py-2.5 px-3">Equipo / Obra</th>
                    <th className="py-2.5 px-2">Familia</th>
                    <th className="py-2.5 px-2 text-center">Registros</th>
                    <th className="py-2.5 px-2 text-center">Técnicos</th>
                    <th className="py-2.5 px-3 text-right bg-purple-100 text-purple-950 font-bold font-mono">Total Horas (HH)</th>
                    <th className="py-2.5 px-3">Principales Labores / Motivos</th>
                    <th className="py-2.5 px-2 text-center">Auditar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-medium">
                  {cuentasMODFiltradas.map((c) => (
                    <tr key={c.cuenta} className="hover:bg-neutral-50/80">
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{c.cuenta}</td>
                      <td className="py-2.5 px-3 font-semibold text-neutral-900">{c.equipo}</td>
                      <td className="py-2.5 px-2">
                        <span className="px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 text-[10px] font-semibold">
                          {c.tipo}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono text-neutral-600">{c.registros}</td>
                      <td className="py-2.5 px-2 text-center font-mono text-neutral-600">{c.cantTrabajadores}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-purple-950 bg-purple-50/60">
                        {c.totalHoras.toLocaleString('de-DE')} HH
                      </td>
                      <td className="py-2.5 px-3 text-[11px] text-neutral-500 max-w-md truncate" title={c.principalesLabores}>
                        {c.principalesLabores || 'Mantenimiento preventivo / correctivo'}
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <button
                          onClick={() => handleAbrirDesglose(c.cuenta, c.equipo)}
                          className="px-2 py-1 rounded bg-neutral-100 hover:bg-blue-100 text-blue-700 font-bold text-[11px] cursor-pointer"
                        >
                          Ver 🔍
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="text-center text-xs text-neutral-500 pt-2 border-t border-neutral-100 font-mono">
              Mostrando {cuentasMODFiltradas.length} cuentas auxiliares auditadas (Total: {cuentasMODFiltradas.reduce((a, b) => a + b.totalHoras, 0).toLocaleString('de-DE')} HH).
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 3: INVERSIONES CAPEX (OBRAS CIVILES & PLANTA)                       */}
      {/* ========================================================================= */}
      {subTab === 'capex' && (
        <div className="space-y-6">
          
          {/* Tarjetas de Resumen por Componentes (Voces de Gasto CAPEX Septiembre) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4.5 rounded-xl border border-indigo-200 shadow-2xs">
              <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
                Total Proyectos Internos (CAPEX)
              </span>
              <div className="text-2xl font-black text-indigo-950 font-mono mt-1">
                $34.995,08
              </div>
              <div className="text-xs text-neutral-500 mt-1">
                Obras civiles, galpones y adecuaciones de planta
              </div>
            </div>

            <div className="bg-white p-4.5 rounded-xl border border-neutral-200 shadow-2xs">
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                1. Materiales Directos
              </span>
              <div className="text-2xl font-black text-neutral-900 font-mono mt-1">
                $33.450,08
              </div>
              <div className="text-xs text-neutral-500 mt-1">
                95,6% del total (perfiles, cemento, cableado, agregados)
              </div>
            </div>

            <div className="bg-white p-4.5 rounded-xl border border-neutral-200 shadow-2xs">
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                2. Servicios Especializados
              </span>
              <div className="text-2xl font-black text-neutral-900 font-mono mt-1">
                $1.480,00
              </div>
              <div className="text-xs text-neutral-500 mt-1">
                4,2% (mantenimiento grúas torres $1.030, pruebas $360, fletes $50)
              </div>
            </div>

            <div className="bg-white p-4.5 rounded-xl border border-purple-200 bg-purple-50/30 shadow-2xs">
              <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider">
                3. Mano de Obra (MOD ECO)
              </span>
              <div className="text-2xl font-black text-purple-950 font-mono mt-1">
                $65,00 <span className="text-xs font-normal text-purple-700">(65 HH)</span>
              </div>
              <div className="text-xs text-purple-800 mt-1">
                Sumado al proyecto TTI-C-0105 Adecuación Patio
              </div>
            </div>
          </div>

          {/* BANNER DESTACADO: CONCILIACIÓN EXACTA TTI-C-0105 ADECUACIÓN PATIO EXTERNO */}
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50/60 to-purple-50/50 border border-blue-200 p-4.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs shadow-2xs">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-blue-600 text-white shrink-0 shadow-2xs">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold bg-white px-2 py-0.5 rounded text-blue-800 border border-blue-300">
                    TTI-C-0105
                  </span>
                  <span className="font-bold text-sm text-neutral-900">
                    Adecuación Patio Externo TIMACA — Conciliación de Componentes
                  </span>
                </div>
                <p className="text-neutral-700 mt-1 leading-relaxed">
                  Total oficial Septiembre: <strong>$9.115,80 USD</strong>. Compuesto exactamente por:
                  <strong className="text-blue-900 ml-1">Materiales Directos ($9.000,80)</strong> + 
                  <strong className="text-indigo-900 ml-1">Servicios ($50,00)</strong> + 
                  <strong className="text-purple-900 ml-1">MOD ($65,00 por las 65 Horas Hombre)</strong>.
                </p>
                <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                  Acumulado 2026 de la cuenta: $504.377,87 USD (Mayor inversión en infraestructura de patio).
                </div>
              </div>
            </div>

            <div className="shrink-0 text-right bg-white p-3 rounded-xl border border-blue-200 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-neutral-400 block">Total Conciliado Sep</span>
              <span className="text-xl font-black font-mono text-blue-900">$9.115,80</span>
            </div>
          </div>

          {/* Tarjetas de Variaciones Clave */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-neutral-900 tracking-tight">
                  Proyectos Clave CAPEX ({mesActivoRaw.mesLabel} 2026)
                </h3>
                <p className="text-xs text-neutral-500">
                  Variaciones más relevantes en obras civiles, galpones y adecuaciones de planta.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {(esSeptiembre ? VARIACIONES_CAPEX_AGO_SEP : VARIACIONES_CAPEX_JUL_AGO.map(v => ({
                cuenta: v.cuenta,
                proyecto: v.proyecto,
                anterior: v.julio,
                actual: v.agosto,
                porcentaje: v.porcentaje,
                esSubida: v.esSubida,
                explicacion: v.explicacion
              }))).map((v) => (
                <div 
                  key={v.cuenta} 
                  onClick={() => handleAbrirDesglose(v.cuenta, v.proyecto, v.actual)}
                  className="bg-neutral-50/70 rounded-xl p-3.5 border border-neutral-200 hover:border-blue-400 hover:shadow-xs cursor-pointer transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[10px] text-neutral-500 font-bold bg-white px-1.5 py-0.5 rounded border border-neutral-200">
                        {v.cuenta}
                      </span>
                      <span className={`text-xs font-bold flex items-center gap-0.5 ${v.esSubida ? 'text-emerald-700' : 'text-neutral-700'}`}>
                        {v.esSubida ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        {v.porcentaje}
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-neutral-900 mt-1 line-clamp-2">
                      {v.proyecto}
                    </h4>
                    <div className="text-base font-black text-neutral-900 font-mono mt-1">
                      {formatExact(v.actual)}
                    </div>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-neutral-200 text-[11px] text-neutral-600 italic line-clamp-3">
                    "{v.explicacion}"
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* TABLA INTEGRAL DE COMPONENTES CAPEX (MATERIALES, SERVICIOS, MOD) */}
          <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs overflow-x-auto space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-neutral-900 tracking-tight">
                  Desglose de Componentes por Proyecto CAPEX — Septiembre 2026 ($ USD)
                </h3>
                <p className="text-xs text-neutral-500">
                  Separación analítica de Materiales Directos, Servicios y Mano de Obra (MOD).
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-neutral-100 px-3 py-1 rounded-lg text-neutral-700 border border-neutral-200">
                Total Proyectos Internos: $34.995,08
              </span>
            </div>

            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-neutral-100/80 text-neutral-700 font-bold border-b border-neutral-200">
                  <th className="py-2.5 px-3">Cuenta</th>
                  <th className="py-2.5 px-3">Proyecto / Obra</th>
                  <th className="py-2.5 px-2.5 text-right font-mono">Materiales ($)</th>
                  <th className="py-2.5 px-2.5 text-right font-mono">Servicios ($)</th>
                  <th className="py-2.5 px-2.5 text-right font-mono text-purple-900">MOD ($)</th>
                  <th className="py-2.5 px-3 text-right bg-indigo-50 text-indigo-950 font-bold font-mono">Total Sep ($)</th>
                  <th className="py-2.5 px-3 text-right font-mono font-bold text-neutral-900">Acumulado 2026 ($)</th>
                  <th className="py-2.5 px-3">Detalle / Conciliación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-medium">
                {CUENTAS_CAPEX_INTERNOS.map((c) => (
                  <tr 
                    key={c.cuentaAuxiliar} 
                    onClick={() => handleAbrirDesglose(c.cuentaAuxiliar, c.proyecto, esSeptiembre ? c.sep : c.ago)}
                    className="hover:bg-neutral-50/80 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-700 whitespace-nowrap">{c.cuentaAuxiliar}</td>
                    <td className="py-2.5 px-3 font-semibold text-neutral-800 whitespace-nowrap">{c.proyecto}</td>
                    <td className="py-2.5 px-2.5 text-right font-mono text-neutral-700">
                      {(c.materialesSep ?? 0) > 0 ? formatExact(c.materialesSep!) : '-'}
                    </td>
                    <td className="py-2.5 px-2.5 text-right font-mono text-neutral-700">
                      {(c.serviciosSep ?? 0) > 0 ? formatExact(c.serviciosSep!) : '-'}
                    </td>
                    <td className="py-2.5 px-2.5 text-right font-mono text-purple-800 font-bold">
                      {(c.modUsdSep ?? 0) > 0 ? (
                        <span>{formatExact(c.modUsdSep!)} <span className="text-[10px] text-purple-600 font-normal">({c.modHorasSep}H)</span></span>
                      ) : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold bg-indigo-50/60 text-indigo-950">
                      {c.sep > 0 ? formatExact(c.sep) : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-neutral-900">
                      {formatExact(c.total2026)}
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-neutral-500 max-w-xs truncate" title={c.notaAuditoria}>
                      {c.notaAuditoria || '-'}
                    </td>
                  </tr>
                ))}

                {/* Totales */}
                <tr className="bg-indigo-100/70 font-black text-neutral-900 border-t-2 border-indigo-300">
                  <td colSpan={2} className="py-3 px-3 uppercase tracking-wider text-indigo-950">
                    Total Proyectos Internos (CAPEX Obras)
                  </td>
                  <td className="py-3 px-2.5 text-right font-mono text-neutral-900">$33.450,08</td>
                  <td className="py-3 px-2.5 text-right font-mono text-neutral-900">$1.480,00</td>
                  <td className="py-3 px-2.5 text-right font-mono text-purple-900">$65,00 (65 HH)</td>
                  <td className="py-3 px-3 text-right font-mono text-sm text-indigo-950 bg-indigo-200/80">$34.995,08</td>
                  <td className="py-3 px-3 text-right font-mono text-sm text-indigo-950">$950.336,30</td>
                  <td className="py-3 px-3 text-[11px] text-indigo-950 font-bold">100% Conciliado con Dashboard</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Tabla Histórica Mensual Enero a Septiembre 2026 */}
          <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs overflow-x-auto">
            <h3 className="text-base font-bold text-neutral-900 tracking-tight mb-3">
              Histórico Mensual Cuentas Auxiliares CAPEX (Enero – Septiembre 2026)
            </h3>
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-neutral-50 text-neutral-700 font-bold border-b border-neutral-200">
                  <th className="py-2.5 px-3">Cuenta Auxiliar</th>
                  <th className="py-2.5 px-3">Proyecto / Obra</th>
                  <th className="py-2.5 px-2 text-right">Ene</th>
                  <th className="py-2.5 px-2 text-right">Feb</th>
                  <th className="py-2.5 px-2 text-right">Mar</th>
                  <th className="py-2.5 px-2 text-right">Abr</th>
                  <th className="py-2.5 px-2 text-right">May</th>
                  <th className="py-2.5 px-2 text-right">Jun</th>
                  <th className="py-2.5 px-2 text-right">Jul</th>
                  <th className="py-2.5 px-2 text-right">Ago</th>
                  <th className="py-2.5 px-2.5 text-right bg-blue-50 text-blue-900 font-bold">Sep</th>
                  <th className="py-2.5 px-3 text-right font-mono font-bold text-neutral-900">Total 2026 ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-medium">
                {CUENTAS_CAPEX_INTERNOS.map((c) => (
                  <tr 
                    key={c.cuentaAuxiliar} 
                    onClick={() => handleAbrirDesglose(c.cuentaAuxiliar, c.proyecto, esSeptiembre ? c.sep : c.ago)}
                    className="hover:bg-neutral-50/80 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{c.cuentaAuxiliar}</td>
                    <td className="py-2.5 px-3 font-semibold text-neutral-800">{c.proyecto}</td>
                    <td className="py-2.5 px-2 text-right font-mono text-neutral-600">{c.ene > 0 ? formatNumber(c.ene) : '-'}</td>
                    <td className="py-2.5 px-2 text-right font-mono text-neutral-600">{c.feb > 0 ? formatNumber(c.feb) : '-'}</td>
                    <td className="py-2.5 px-2 text-right font-mono text-neutral-600">{c.mar > 0 ? formatNumber(c.mar) : '-'}</td>
                    <td className="py-2.5 px-2 text-right font-mono text-neutral-600">{c.abr > 0 ? formatNumber(c.abr) : '-'}</td>
                    <td className="py-2.5 px-2 text-right font-mono text-neutral-600">{c.may > 0 ? formatNumber(c.may) : '-'}</td>
                    <td className="py-2.5 px-2 text-right font-mono text-neutral-600">{c.jun > 0 ? formatNumber(c.jun) : '-'}</td>
                    <td className="py-2.5 px-2 text-right font-mono text-neutral-600">{c.jul > 0 ? formatNumber(c.jul) : '-'}</td>
                    <td className="py-2.5 px-2 text-right font-mono text-neutral-600">{c.ago > 0 ? formatNumber(c.ago) : '-'}</td>
                    <td className="py-2.5 px-2.5 text-right font-mono font-bold bg-blue-50/50 text-blue-900">{c.sep > 0 ? formatExact(c.sep) : '-'}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-neutral-900">{formatExact(c.total2026)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 4: MANTTO. FLOTA (OPEX ACTIVOS PRODUCTIVOS)                         */}
      {/* ========================================================================= */}
      {subTab === 'flota' && (
        <div className="space-y-6">
          
          {/* Top 10 Equipos Móviles con Mayor Gasto */}
          <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-neutral-900 tracking-tight">
                  Top 10 Equipos Móviles con Mayor Gasto ({mesActivoRaw.mesLabel} 2026)
                </h3>
                <p className="text-xs text-neutral-500">
                  {esSeptiembre 
                    ? 'Total de los 10 equipos en Master Septiembre: $44.957,33 USD (53,7% del total de flota).'
                    : 'Total de los 10 equipos en Agosto: $64.839 USD (57% de todo el gasto de flota).'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {(esSeptiembre ? TOP_10_EQUIPOS_OPEX_SEPTIEMBRE : TOP_10_EQUIPOS_OPEX_AGOSTO).map((eq, idx) => (
                <div 
                  key={eq.codigo} 
                  onClick={() => handleAbrirDesglose((eq as any).cuentaCompleta || eq.codigo, eq.nombre, (eq as any).montoSeptiembre || (eq as any).montoAgosto)}
                  className="p-3.5 rounded-xl bg-neutral-50/80 border border-neutral-200 hover:border-blue-400 hover:shadow-xs cursor-pointer transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-neutral-200">
                        #{idx + 1} · {eq.codigo}
                      </span>
                      <span className="text-[10px] font-semibold text-neutral-500">{eq.tipo}</span>
                    </div>
                    <h4 className="font-bold text-xs text-neutral-900 mt-1 line-clamp-1" title={eq.nombre}>
                      {eq.nombre}
                    </h4>
                    <div className="text-base font-black text-neutral-900 font-mono mt-1">
                      {formatExact((eq as any).montoSeptiembre || (eq as any).montoAgosto)}
                    </div>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-neutral-200 text-[10px] text-neutral-600 line-clamp-2">
                    {eq.detalle}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tabla Mensual por Tipo de Activo Productivo */}
          <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs overflow-x-auto">
            <h3 className="text-base font-bold text-neutral-900 tracking-tight mb-3">
              Evolución Mensual por Familia de Activos Móviles (Enero – Septiembre 2026)
            </h3>
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-neutral-50 text-neutral-700 font-bold border-b border-neutral-200">
                  <th className="py-2.5 px-3">Tipo de Equipo</th>
                  <th className="py-2.5 px-2 text-right">Ene</th>
                  <th className="py-2.5 px-2 text-right">Feb</th>
                  <th className="py-2.5 px-2 text-right">Mar</th>
                  <th className="py-2.5 px-2 text-right">Abr</th>
                  <th className="py-2.5 px-2 text-right">May</th>
                  <th className="py-2.5 px-2 text-right">Jun</th>
                  <th className="py-2.5 px-2 text-right">Jul</th>
                  <th className="py-2.5 px-2 text-right">Ago</th>
                  <th className="py-2.5 px-2.5 text-right bg-blue-50 text-blue-900 font-bold">Sep</th>
                  <th className="py-2.5 px-3 text-right font-mono font-bold text-neutral-900">Total 2026 ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-medium">
                {TIPOS_EQUIPOS_OPEX_MENSUAL.map((t) => (
                  <tr key={t.tipo} className="hover:bg-neutral-50/80">
                    <td className="py-2 px-3 font-semibold text-neutral-800">{t.tipo}</td>
                    <td className="py-2 px-2 text-right font-mono text-neutral-600">{t.ene > 0 ? formatNumber(t.ene) : '-'}</td>
                    <td className="py-2 px-2 text-right font-mono text-neutral-600">{t.feb > 0 ? formatNumber(t.feb) : '-'}</td>
                    <td className="py-2 px-2 text-right font-mono text-neutral-600">{t.mar > 0 ? formatNumber(t.mar) : '-'}</td>
                    <td className="py-2 px-2 text-right font-mono text-neutral-600">{t.abr > 0 ? formatNumber(t.abr) : '-'}</td>
                    <td className="py-2 px-2 text-right font-mono text-neutral-600">{t.may > 0 ? formatNumber(t.may) : '-'}</td>
                    <td className="py-2 px-2 text-right font-mono text-neutral-600">{t.jun > 0 ? formatNumber(t.jun) : '-'}</td>
                    <td className="py-2 px-2 text-right font-mono text-neutral-600">{t.jul > 0 ? formatNumber(t.jul) : '-'}</td>
                    <td className="py-2 px-2 text-right font-mono text-neutral-600">{t.ago > 0 ? formatNumber(t.ago) : '-'}</td>
                    <td className="py-2 px-2.5 text-right font-mono font-bold bg-blue-50/50 text-blue-900">{t.sep > 0 ? formatExact(t.sep) : '-'}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-neutral-900">{formatExact(t.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Voces de Gasto & Componentes de Mantto. Flota (Materiales, Servicios, MOD) */}
          <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-neutral-900 tracking-tight">
                  Desglose de Componentes & Voces de Gasto — Flota ({mesActivoRaw.mesLabel} 2026)
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Separación por Materiales Directos, Servicios Especializados y Mano de Obra Directa (MOD).
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-blue-50 text-blue-900 px-3 py-1 rounded-lg border border-blue-200">
                Total Flota Conciliado: {formatExact(opexFlotaEfectivoMes)}
              </span>
            </div>

            {/* 3 Tarjetas de Macro Componentes */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200">
                <span className="text-[10px] font-bold text-blue-700 uppercase">1. Materiales Directos</span>
                <div className="text-xl font-black text-blue-950 font-mono mt-0.5">
                  {esSeptiembre ? '$45.042,60' : '$49.336,00'}
                </div>
                <div className="text-[11px] text-blue-800 mt-1">
                  Cauchería, aceites, lubricantes, tren motriz, repuestos eléctricos
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200">
                <span className="text-[10px] font-bold text-indigo-700 uppercase">2. Servicios Especializados</span>
                <div className="text-xl font-black text-indigo-950 font-mono mt-0.5">
                  {esSeptiembre ? '$12.035,00' : '$19.843,00'}
                </div>
                <div className="text-[11px] text-indigo-800 mt-1">
                  Sellos hidráulicos, soldadura, cromado vástagos, radiadores
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200">
                <span className="text-[10px] font-bold text-purple-700 uppercase">3. Mano de Obra (MOD Flota)</span>
                <div className="text-xl font-black text-purple-950 font-mono mt-0.5">
                  {esSeptiembre ? '$8.679,44' : '$9.644,00'}
                </div>
                <div className="text-[11px] text-purple-800 mt-1">
                  Horas Hombre directas imputadas a mantenimiento de flota
                </div>
              </div>
            </div>

            {/* Tabla de Voces de Gasto */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-neutral-100/80 text-neutral-700 font-bold border-b border-neutral-200">
                    <th className="py-2.5 px-3">Rubro / Concepto Técnico</th>
                    <th className="py-2.5 px-2.5">Grupo / Componente</th>
                    <th className="py-2.5 px-3 text-right font-mono">Monto Total ($)</th>
                    <th className="py-2.5 px-3">Detalle e Impacto en Activos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-medium">
                  {(esSeptiembre ? VOCES_GASTO_OPEX_FLOTA_SEPTIEMBRE : VOCES_GASTO_OPEX_FLOTA_AGOSTO).map((v) => (
                    <tr key={v.rubro} className="hover:bg-neutral-50/80">
                      <td className="py-2.5 px-3 font-semibold text-neutral-900">{v.rubro}</td>
                      <td className="py-2.5 px-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          v.grupo === 'Materiales Directos'
                            ? 'bg-blue-100 text-blue-800'
                            : v.grupo === 'Servicios'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {v.grupo}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-neutral-900">
                        {formatExact(v.monto)}
                      </td>
                      <td className="py-2.5 px-3 text-[11px] text-neutral-600">
                        {v.detalle}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 5: MANTTO. INFRAESTRUCTURA (OPEX)                                  */}
      {/* ========================================================================= */}
      {subTab === 'infra' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs overflow-x-auto">
            <h3 className="text-base font-bold text-neutral-900 tracking-tight mb-3">
              Mantenimiento de Infraestructura & Galpones (Enero – Septiembre 2026)
            </h3>
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-neutral-50 text-neutral-700 font-bold border-b border-neutral-200">
                  <th className="py-2.5 px-3">Cuenta Auxiliar</th>
                  <th className="py-2.5 px-3">Proyecto / Galpón</th>
                  <th className="py-2.5 px-2 text-right">Ene</th>
                  <th className="py-2.5 px-2 text-right">Feb</th>
                  <th className="py-2.5 px-2 text-right">Mar</th>
                  <th className="py-2.5 px-2 text-right">Abr</th>
                  <th className="py-2.5 px-2 text-right">May</th>
                  <th className="py-2.5 px-2 text-right">Jun</th>
                  <th className="py-2.5 px-2 text-right">Jul</th>
                  <th className="py-2.5 px-2 text-right">Ago</th>
                  <th className="py-2.5 px-2.5 text-right bg-blue-50 text-blue-900 font-bold">Sep</th>
                  <th className="py-2.5 px-3 text-right font-mono font-bold text-neutral-900">Total 2026 ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-medium">
                {MANTTO_INFRAESTRUCTURA_2026.cuentas.map((c) => (
                  <tr 
                    key={c.cuenta} 
                    onClick={() => handleAbrirDesglose(c.cuenta, c.descripcion, esSeptiembre ? c.sep : c.ago)}
                    className="hover:bg-neutral-50/80 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">{c.cuenta}</td>
                    <td className="py-2.5 px-3 font-semibold text-neutral-800">{c.descripcion}</td>
                    <td className="py-2 px-2 text-right font-mono text-neutral-600">{c.ene > 0 ? formatNumber(c.ene) : '-'}</td>
                    <td className="py-2 px-2 text-right font-mono text-neutral-600">{c.feb > 0 ? formatNumber(c.feb) : '-'}</td>
                    <td className="py-2 px-2 text-right font-mono text-neutral-600">{c.mar > 0 ? formatNumber(c.mar) : '-'}</td>
                    <td className="py-2 px-2 text-right font-mono text-neutral-600">{c.abr > 0 ? formatNumber(c.abr) : '-'}</td>
                    <td className="py-2 px-2 text-right font-mono text-neutral-600">{c.may > 0 ? formatNumber(c.may) : '-'}</td>
                    <td className="py-2 px-2 text-right font-mono text-neutral-600">{c.jun > 0 ? formatNumber(c.jun) : '-'}</td>
                    <td className="py-2 px-2 text-right font-mono text-neutral-600">{c.jul > 0 ? formatNumber(c.jul) : '-'}</td>
                    <td className="py-2 px-2 text-right font-mono text-neutral-600">{formatNumber(c.ago)}</td>
                    <td className="py-2 px-2.5 text-right font-mono font-bold bg-blue-50/50 text-blue-900">{formatExact(c.sep)}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-neutral-900">{formatExact(c.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 6: SEPARACIÓN CONTABLE (CAPEX vs OPEX EN SEPTIEMBRE 2026)           */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* VISTA 6: RECLASIFICACIÓN ACTIVOS PRODUCTIVOS CAPEX ($28.328,84 USD)       */}
      {/* ========================================================================= */}
      {subTab === 'reclasificacion' && (
        <div className="space-y-6">
          
          {/* Header Banner de Reclasificación */}
          <div className="bg-white rounded-2xl p-5 border border-emerald-300 shadow-xs space-y-4 bg-gradient-to-br from-white via-white to-emerald-50/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-neutral-900 tracking-tight flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-emerald-600" />
                  <span>Reclasificación a CAPEX — Activos Productivos ($28.328,84 USD)</span>
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Conforme a la norma NIC 16 (Propiedad, Planta y Equipo) y la matriz oficial de Costos TIMACA: 10 equipos reclasificados de OPEX Flota a Inversiones de Capital.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-900 font-mono font-black text-xs border border-emerald-300">
                  Total Acumulado 2026: $28.328,84
                </span>
              </div>
            </div>

            {/* 4 Tarjetas de Resumen por Voces y Categorías */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
              <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 flex flex-col justify-between">
                <div>
                  <span className="font-bold text-emerald-800 uppercase text-[10px]">1. Extensión de Vida Útil</span>
                  <div className="text-xl font-black text-emerald-950 font-mono mt-1">$24.317,30</div>
                </div>
                <div className="text-[11px] text-emerald-700 mt-2 font-medium">
                  4 Activos mayores: GR23, BS03, HL760 y GR22.
                </div>
              </div>

              <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200 flex flex-col justify-between">
                <div>
                  <span className="font-bold text-blue-800 uppercase text-[10px]">2. Nuevas Adquisiciones</span>
                  <div className="text-xl font-black text-blue-950 font-mono mt-1">$4.011,54</div>
                </div>
                <div className="text-[11px] text-blue-700 mt-2 font-medium">
                  6 Activos: BS15, VH52, PA03, TR01, CO19 y CO20.
                </div>
              </div>

              <div className="p-4 rounded-xl bg-purple-50/80 border border-purple-200 flex flex-col justify-between">
                <div>
                  <span className="font-bold text-purple-800 uppercase text-[10px]">3. Desglose Voces de Gasto</span>
                  <div className="text-xl font-black text-purple-950 font-mono mt-1">$28.328,84</div>
                </div>
                <div className="text-[11px] text-purple-700 mt-2 font-mono">
                  Mat: $17.489 · Serv: $10.638 · MOD: $202
                </div>
              </div>

              <div className="p-4 rounded-xl bg-neutral-900 text-white border border-neutral-800 flex flex-col justify-between">
                <div>
                  <span className="font-bold text-amber-300 uppercase text-[10px]">4. Impacto en CAPEX Total</span>
                  <div className="text-xl font-black text-emerald-300 font-mono mt-1">$63.323,92</div>
                </div>
                <div className="text-[11px] text-neutral-300 mt-2">
                  $34.995 Obras Civiles + $28.329 Activos
                </div>
              </div>
            </div>

            {/* TABLA DETALLADA CON TODOS LOS COMPONENTES: MATERIALES, SERVICIOS, MOD */}
            <div className="overflow-x-auto pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                  Matriz Integral de Componentes por Activo Reclasificado
                </span>
                <span className="text-[11px] text-neutral-500 font-mono">
                  10 de 10 equipos capitalizados al 100%
                </span>
              </div>
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-neutral-100/80 text-neutral-700 font-bold border-b border-neutral-200">
                    <th className="py-2.5 px-3">Código</th>
                    <th className="py-2.5 px-3">Activo / Equipo</th>
                    <th className="py-2.5 px-2">Categoría Contable</th>
                    <th className="py-2.5 px-2.5 text-right font-mono">Materiales ($)</th>
                    <th className="py-2.5 px-2.5 text-right font-mono">Servicios ($)</th>
                    <th className="py-2.5 px-2.5 text-right font-mono">MOD ($)</th>
                    <th className="py-2.5 px-3 text-right font-mono font-bold bg-emerald-100 text-emerald-950">Total CAPEX ($)</th>
                    <th className="py-2.5 px-3">Componentes & Labores Realizadas</th>
                    <th className="py-2.5 px-3">Criterio NIC 16</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-medium">
                  {ACTIVOS_PRODUCTIVOS_CAPEX_NIC16_SEPTIEMBRE.equipos.map((it) => (
                    <tr key={it.codigo} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-700 whitespace-nowrap">
                        {it.codigo}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-neutral-900 whitespace-nowrap">
                        {it.nombre}
                      </td>
                      <td className="py-2.5 px-2 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          it.categoriaReclasificacion === 'Extensión de Vida Útil'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}>
                          {it.categoriaReclasificacion}
                        </span>
                      </td>
                      <td className="py-2.5 px-2.5 text-right font-mono text-neutral-700">
                        {formatExact(it.materialesUsd)}
                      </td>
                      <td className="py-2.5 px-2.5 text-right font-mono text-neutral-700">
                        {formatExact(it.serviciosUsd)}
                      </td>
                      <td className="py-2.5 px-2.5 text-right font-mono text-purple-700 font-bold">
                        {it.modUsd > 0 ? formatExact(it.modUsd) : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-black text-emerald-950 bg-emerald-50/60 whitespace-nowrap">
                        {formatExact(it.montoUsd)}
                      </td>
                      <td className="py-2.5 px-3 text-[11px] text-neutral-600 max-w-xs">
                        <div className="font-semibold text-neutral-800">{it.intervencionMayor}</div>
                        <ul className="list-disc pl-3 mt-1 space-y-0.5 text-[10px] text-neutral-500">
                          {it.componentes.map((c, i) => (
                            <li key={i}>{c}</li>
                          ))}
                        </ul>
                      </td>
                      <td className="py-2.5 px-3 text-[11px] text-neutral-500 italic max-w-xs">
                        {it.criterioNIC16}
                      </td>
                    </tr>
                  ))}
                  
                  {/* Fila de Totales de la Reclasificación */}
                  <tr className="bg-emerald-100/70 font-black text-neutral-900 border-t-2 border-emerald-300">
                    <td colSpan={3} className="py-3 px-3 uppercase tracking-wider text-emerald-950">
                      Total Activos Productivos Reclasificados (CAPEX Septiembre)
                    </td>
                    <td className="py-3 px-2.5 text-right font-mono text-neutral-900">
                      {formatExact(ACTIVOS_PRODUCTIVOS_CAPEX_NIC16_SEPTIEMBRE.totalesPorVozGasto.materiales)}
                    </td>
                    <td className="py-3 px-2.5 text-right font-mono text-neutral-900">
                      {formatExact(ACTIVOS_PRODUCTIVOS_CAPEX_NIC16_SEPTIEMBRE.totalesPorVozGasto.servicios)}
                    </td>
                    <td className="py-3 px-2.5 text-right font-mono text-purple-900">
                      {formatExact(ACTIVOS_PRODUCTIVOS_CAPEX_NIC16_SEPTIEMBRE.totalesPorVozGasto.mod)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-base text-emerald-950 bg-emerald-200/80">
                      {formatExact(ACTIVOS_PRODUCTIVOS_CAPEX_NIC16_SEPTIEMBRE.totalCapitalizado)}
                    </td>
                    <td colSpan={2} className="py-3 px-3 text-xs text-emerald-950 font-bold">
                      10 Activos Productivos · Conciliación 100% con Hoja "Proyectos Internos (CAPEX)"
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 8: FLOTA 26 GRÚAS                                                   */}
      {/* ========================================================================= */}
      {subTab === 'gruas' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-neutral-900 tracking-tight">
              Control de Flota: 26 Grúas TIMACA (Enero – Septiembre 2026)
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
              {(esSeptiembre ? FLOTA_GRUAS_TIMACA_2026.top5GruasSeptiembre : FLOTA_GRUAS_TIMACA_2026.top5GruasAgosto).map((g) => (
                <div key={g.codigo} className="p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                  <div className="text-[10px] font-mono font-bold text-neutral-500">{g.codigo}</div>
                  <div className="text-base font-black text-neutral-900 font-mono mt-0.5">{formatExact(g.monto)}</div>
                  <div className="text-[11px] text-neutral-600 truncate mt-1" title={g.descripcion}>{g.descripcion}</div>
                  <div className="text-[10px] font-bold text-blue-700 mt-1">{g.variacion}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DE AUDITORÍA Y DESGLOSE                                             */}
      {/* ========================================================================= */}
      {selectedActivoParaDesglose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-neutral-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-scale-up">
            
            <div className="bg-slate-900 text-white p-5 flex items-start justify-between gap-4 border-b border-slate-800">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="font-mono text-xs font-black bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2.5 py-0.5 rounded-lg">
                    {selectedActivoParaDesglose.codigo}
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 bg-slate-800 px-2.5 py-0.5 rounded-lg border border-slate-700">
                    {selectedActivoParaDesglose.responsableArea}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {selectedActivoParaDesglose.titulo}
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  {selectedActivoParaDesglose.descripcionGeneral}
                </p>
              </div>

              <button
                onClick={() => setSelectedActivoParaDesglose(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-neutral-50 border-b border-neutral-200 text-xs">
              <div className="bg-white p-3 rounded-xl border border-neutral-200 shadow-2xs">
                <div className="text-[10px] uppercase font-bold text-neutral-400">Total Auditado ({mesActivoRaw.mesLabel})</div>
                <div className="text-lg font-black text-neutral-900 font-mono mt-0.5">
                  {formatExact(selectedActivoParaDesglose.montoAgosto)}
                </div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-neutral-200 shadow-2xs">
                <div className="text-[10px] uppercase font-bold text-neutral-400">Registros Auditados</div>
                <div className="text-lg font-black text-blue-900 font-mono mt-0.5">
                  {selectedActivoParaDesglose.items.length} Ítems
                </div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-neutral-200 shadow-2xs">
                <div className="text-[10px] uppercase font-bold text-neutral-400">Bloque Contable</div>
                <div className="text-xs font-bold text-neutral-800 mt-1">
                  {selectedActivoParaDesglose.responsableArea}
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
              {selectedActivoParaDesglose.items.length > 0 ? (
                <div className="overflow-x-auto border border-neutral-200 rounded-2xl shadow-2xs">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-neutral-50 text-neutral-700 font-bold border-b border-neutral-200">
                        <th className="py-2.5 px-3">Comprobante</th>
                        <th className="py-2.5 px-3">Descripción e Ítem Técnico</th>
                        <th className="py-2.5 px-2">Categoría / Rubro</th>
                        <th className="py-2.5 px-2 text-right">Cant.</th>
                        <th className="py-2.5 px-2 text-right">P. Unit ($)</th>
                        <th className="py-2.5 px-3 text-right bg-blue-50 text-blue-900 font-mono">Monto Total ($)</th>
                        <th className="py-2.5 px-3">Fecha / Solicitante</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 font-medium bg-white">
                      {selectedActivoParaDesglose.items.map((item) => (
                        <tr key={item.id} className="hover:bg-neutral-50/60">
                          <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{item.comprobanteSIP || item.codigo}</td>
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-neutral-900">{item.descripcion}</div>
                            {item.motivo && (
                              <div className="text-[10px] text-blue-800 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded mt-1 inline-block">
                                Motivo: {item.motivo}
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-2">
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-100 text-neutral-700">
                              {item.rubro || item.categoria}
                            </span>
                          </td>
                          <td className="py-2.5 px-2 text-right font-mono text-neutral-700">
                            {item.cantidad ? `${formatNumber(item.cantidad)} ${item.unidadMedida === 'USE' ? 'SERV' : (item.unidadMedida || '')}` : '-'}
                          </td>
                          <td className="py-2.5 px-2 text-right font-mono text-neutral-600">
                            {item.montoUnitario ? formatExact(item.montoUnitario) : '-'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-black text-neutral-900 bg-blue-50/40">
                            {formatExact(item.montoTotal)}
                          </td>
                          <td className="py-2.5 px-3 text-[11px] text-neutral-600">
                            <div>{item.fecha || '-'}</div>
                            {item.solicitante && <div className="text-[10px] text-neutral-400">Sol: {item.solicitante}</div>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center bg-neutral-50 rounded-2xl border border-dashed border-neutral-200 text-neutral-500">
                  <Info className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold">
                    Sin despachos facturados bajo este código en el corte actual.
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between text-xs">
              <span className="text-neutral-500 font-mono text-[11px]">
                Auditoría Contable TIMACA · Conciliado con Almacén SIP y Master Unificado
              </span>
              <button
                onClick={() => setSelectedActivoParaDesglose(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-colors cursor-pointer"
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
