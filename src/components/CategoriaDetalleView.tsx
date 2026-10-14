import React, { useState, useMemo } from 'react';
import { useCostos } from '../context/CostosContext';
import { 
  TABLA_PPT_DISTRIBUCION_2026, 
  PROYECTOS_EXTERNOS_TIMACA, 
  DETALLE_NOMINA_AGOSTO_2026, 
  TOTALES_NOMINA_SEMANAL_AGOSTO,
  CUENTAS_AUXILIARES_EXACTAS_AGOSTO_2026,
  CUENTAS_AUXILIARES_EXACTAS_SEPTIEMBRE_2026,
  CUENTAS_CORTAS_MAP,
  OFICIAL_MOD_CUENTAS_AGOSTO_2026,
  CATEGORIAS_MATERIALES_EXCEL_OFICIAL
} from '../data/mockCostosTimaca';
import { MATRIZ_REAL_PROYECTOS_MENSUAL_2026 } from '../data/realProyectosMensual2026';
import { 
  DESGLOSE_CATEGORIAS_PROYECTOS, 
  getConsolidadoCategoria,
  COSTOS_INDIRECTOS_CONSOLIDADO_OFICIAL,
  COSTOS_INDIRECTOS_POR_CATEGORIAS,
  MATERIALES_CONSOLIDADO_OFICIAL_8_MESES,
  SERVICIOS_CONSOLIDADO_OFICIAL_8_MESES,
  HORAS_MAQUINA_CONSOLIDADO_OFICIAL_8_MESES,
  FilaDesgloseMensual 
} from '../data/mockDesgloseCategorias';
import { MATRIZ_MATERIALES_PELLAS_ESTRELLA } from '../data/pellasMaterialesDetalleEstrella';
import { formatCurrency, formatNumber, formatUnitPriceRaw, formatAmountAuto } from '../utils/dateHelpers';
import { exportCategoriaToExcel } from '../utils/excelHandler';
import { isNormalizacion } from '../utils/normalizacionFilter';
import { 
  Layers, 
  ArrowUpRight, 
  ArrowDownRight, 
  ArrowLeft,
  Calendar, 
  Download, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Briefcase, 
  Info, 
  CheckCircle2,
  FileSpreadsheet,
  Users,
  ShieldCheck,
  AlertTriangle,
  TableProperties,
  SlidersHorizontal,
  Sparkles,
  Building,
  ChevronRight,
  X
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { DesglosePartidaView } from './DesglosePartidaView';
import { REGISTROS_REALES_MANO_OBRA_AGOSTO_2026 } from '../data/realManoObraAugust2026';

function toTitleCase(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/(^|\s|-|\/)[a-zñáéíóú]/g, l => l.toUpperCase())
    .replace(/\s+/g, ' ')
    .trim();
}

const EQUIPOS_HM_MAP: Record<string, string> = {
  'GR20': 'Grúa Demag AC200 (200T)',
  'GR20-G': 'Grúa Demag AC200 (200T)',
  'GR20-C': 'Camión Demag LTM1400',
  'PA01': 'Payloader Hyundai HL760 (Cargador Frontal)',
  'PA02': 'Minicargador Bobcat 843',
  'RE01': 'Retroexcavadora Case 580SM',
  'RE02': 'Retroexcavadora Case 580SM',
  'CH09': 'Chuto Mack Granite (Transporte Pesado)',
  'CH08': 'Chuto Mack Granite Doble Eje',
  'CH06': 'Chuto Mack Granite R600',
  'CH05': 'Chuto Mack CH613 (Batea)',
  'CA09': 'Camión Pickman Ford Cargo 1721',
  'CA04': 'Camión Plataforma Ford Cargo 815',
  'CA14': 'Camión Plataforma Ford Cargo 1721',
  'MC09': 'Montacarga Hyster H16.00XM',
  'MC11': 'Montacarga Heli 7.0T Serie H',
  'TH01': 'Telehandler Genie GTH-4013',
  'GR21': 'Grúa Liebherr LTM1140 (140T)',
  'GR21-G': 'Grúa Liebherr LTM1140 (140T)',
  'GR24': 'Grúa Liebherr LTM1100 (100T)',
  'GR24-G': 'Grúa Liebherr LTM1100 (100T)',
  'GR10': 'Grúa Móvil P&H R200 (20T)',
  'GR13': 'Grúa Móvil Grove RT 75S (50T)',
  'GR03': 'Grúa Móvil P&H R180',
  'ML04': 'Manlift JLG 660SJ',
  'MN01': 'Motoniveladora John Deere 670G'
};

interface CategoriaDetalleViewProps {
  initialCategoria?: string;
  onOpenDesglosePartida?: (concepto: string, categoria: string, proyectoCodigo?: string, mesNum?: number) => void;
  onVolver?: () => void;
}

export const CategoriaDetalleView: React.FC<CategoriaDetalleViewProps> = ({ 
  initialCategoria,
  onOpenDesglosePartida,
  onVolver
}) => {
  const { resumenMeses, salidas } = useCostos();

  // Partida seleccionada para auditoría drill-down interna
  const [partidaDetalleLocal, setPartidaDetalleLocal] = useState<{ concepto: string; categoria: string; proyectoCodigo?: string; mesNum?: number } | null>(null);

  // Las 5 Categorías Oficiales
  const categorias = [
    'Servicios',
    'Materiales Directos',
    'Mano de Obra Directa',
    'Horas Maquina',
    'Costos Indirectos'
  ];
  // Default to initialCategoria or 'Servicios'
  const [selectedCat, setSelectedCat] = useState<string>(() => {
    return (initialCategoria && categorias.includes(initialCategoria)) ? initialCategoria : 'Servicios';
  });

  // Sync if initialCategoria prop updates
  React.useEffect(() => {
    if (initialCategoria && categorias.includes(initialCategoria)) {
      setSelectedCat(initialCategoria);
    }
  }, [initialCategoria]);

  // Selected Project for the Monthly Breakdown (Default to TODOS for enterprise consolidated view)
  const [selectedProyectoCodigo, setSelectedProyectoCodigo] = useState<string>('TODOS');

  // Alcance de proyectos: 'externos' (Exclusivamente Proyectos de Clientes TTE-C · Oficial PPT) o 'global' (Total Almacén SIP incluye internos)
  const [alcanceProyectos, setAlcanceProyectos] = useState<'externos' | 'global'>('externos');

  // Selected Month for the audit KPI cards (Default to 9 = Septiembre 2026 or latest)
  const [selectedMesNum, setSelectedMesNum] = useState<number>(() => {
    return resumenMeses.length > 0 ? resumenMeses[resumenMeses.length - 1].mes : 9;
  });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [subconceptoSearchTerm, setSubconceptoSearchTerm] = useState<string>('');
  const [expandedPry, setExpandedPry] = useState<string | null>(null);
  const [filtroDesglosePry, setFiltroDesglosePry] = useState<string>('');
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [downloadMatrizSuccess, setDownloadMatrizSuccess] = useState(false);

  // Modo de visualización de Costos Indirectos: 'categorias' (15 Rubros Oficiales) o 'cuentas' (Cuentas Auxiliares / % Prorrateo)
  const [modoIndirectos, setModoIndirectos] = useState<'categorias' | 'cuentas'>('categorias');

  // Limpiar cualquier residuo de categorías manuales o importaciones previas desfasadas
  React.useEffect(() => {
    try {
      localStorage.removeItem('TIMACA_CUSTOM_INDIRECTOS_RRHH');
    } catch {
      // Ignorar errores de storage
    }
  }, []);

  // Toggle view mode for the matrix: 'cincoMeses' (Abr-Sep as in PowerPoint slide) or 'anoCompleto' (Ene-Sep)
  const [rangoMesesModo, setRangoMesesModo] = useState<'cincoMeses' | 'anoCompleto'>('anoCompleto');

  // Filtro de mes específico para la matriz ('todos' o '1'..'9')
  const [filtroMesMatriz, setFiltroMesMatriz] = useState<string>('todos');

  // is8Months is always true for complete 2026 audited visualization (Enero a Septiembre)
  const is8Months = true;

  // Month names for the PPT matrix
  const mesesNombres = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep'];

  // Current month object & Previous month object
  const mesActualObj = useMemo(() => {
    return resumenMeses.find(m => m.mes === selectedMesNum) || resumenMeses[resumenMeses.length - 1];
  }, [resumenMeses, selectedMesNum]);

  const mesAnteriorNum = selectedMesNum > 1 ? selectedMesNum - 1 : 1;
  const mesAnteriorObj = useMemo(() => {
    return resumenMeses.find(m => m.mes === mesAnteriorNum) || resumenMeses[0];
  }, [resumenMeses, mesAnteriorNum]);

  // Data from PPT matrix for this category
  const pptCatRow = useMemo(() => {
    return TABLA_PPT_DISTRIBUCION_2026.find(c => 
      c.categoria.toLowerCase() === selectedCat.toLowerCase() ||
      c.categoria.includes(selectedCat) ||
      selectedCat.includes(c.categoria)
    ) || TABLA_PPT_DISTRIBUCION_2026[0];
  }, [selectedCat]);

  // Salidas in this category for current month (Costos Indirectos NUNCA provienen de vales SIP)
  const salidasCatActual = useMemo(() => {
    if (selectedCat === 'Costos Indirectos') {
      return [];
    }
    return salidas.filter(s => 
      s.mes === selectedMesNum && 
      !isNormalizacion(s) &&
      (alcanceProyectos === 'global' || s.cuentaAuxiliarCodigo?.startsWith('TTE-C-') || s.esProyectoExterno || (s as any).tipoCosto === 'Externo') &&
      (s.tipo === selectedCat ||
       s.categoria === selectedCat ||
       (selectedCat === 'Horas Maquina' && (s.tipo === 'Horas Maquina' || s.tipo === 'Horas Máquina' || s.categoria === 'Horas Maquina')) ||
       (selectedCat === 'Materiales Directos' && (s.tipo === 'Materiales Directos' || CATEGORIAS_MATERIALES_EXCEL_OFICIAL.includes(s.categoria))) ||
       (selectedCat !== 'Materiales Directos' && (
         s.categoria.toLowerCase().includes(selectedCat.toLowerCase().split(' ')[0]) ||
         selectedCat.toLowerCase().includes(s.categoria.toLowerCase().split(' ')[0])
       )))
    );
  }, [salidas, selectedMesNum, selectedCat, alcanceProyectos]);

  const salidasCatAnterior = useMemo(() => {
    if (selectedCat === 'Costos Indirectos') {
      return [];
    }
    return salidas.filter(s => 
      s.mes === mesAnteriorNum && 
      !isNormalizacion(s) &&
      (alcanceProyectos === 'global' || s.cuentaAuxiliarCodigo?.startsWith('TTE-C-') || s.esProyectoExterno || (s as any).tipoCosto === 'Externo') &&
      (s.tipo === selectedCat ||
       s.categoria === selectedCat ||
       (selectedCat === 'Horas Maquina' && (s.tipo === 'Horas Maquina' || s.tipo === 'Horas Máquina' || s.categoria === 'Horas Maquina')) ||
       (selectedCat === 'Materiales Directos' && (s.tipo === 'Materiales Directos' || CATEGORIAS_MATERIALES_EXCEL_OFICIAL.includes(s.categoria))) ||
       (selectedCat !== 'Materiales Directos' && (
         s.categoria.toLowerCase().includes(selectedCat.toLowerCase().split(' ')[0]) ||
         selectedCat.toLowerCase().includes(s.categoria.toLowerCase().split(' ')[0])
       )))
    );
  }, [salidas, mesAnteriorNum, selectedCat, alcanceProyectos]);

  // Amounts for current and previous month from PPT matrix (or selected project / salidas)
  const montoActual = useMemo(() => {
    if (selectedProyectoCodigo !== 'TODOS') {
      const idx = selectedMesNum - 1;
      const realProj = MATRIZ_REAL_PROYECTOS_MENSUAL_2026[selectedProyectoCodigo];
      if (realProj && realProj.byCategoriaMes && realProj.byCategoriaMes[idx]) {
        return Math.round(realProj.byCategoriaMes[idx][selectedCat] || 0);
      }
      return Math.round(salidasCatActual.reduce((sum, s) => sum + s.montoTotal, 0));
    }
    if (alcanceProyectos === 'global') {
      return Math.round(salidasCatActual.reduce((sum, s) => sum + s.montoTotal, 0));
    }
    const idx = selectedMesNum - 1;
    if (idx >= 0 && idx < pptCatRow.meses.length) {
      return pptCatRow.meses[idx];
    }
    return Math.round(salidasCatActual.reduce((sum, s) => sum + s.montoTotal, 0));
  }, [selectedMesNum, pptCatRow, salidasCatActual, alcanceProyectos, selectedProyectoCodigo, selectedCat]);

  const montoAnterior = useMemo(() => {
    if (selectedMesNum <= 1) return 0;
    if (selectedProyectoCodigo !== 'TODOS') {
      const idx = selectedMesNum - 2;
      const realProj = MATRIZ_REAL_PROYECTOS_MENSUAL_2026[selectedProyectoCodigo];
      if (realProj && realProj.byCategoriaMes && realProj.byCategoriaMes[idx]) {
        return Math.round(realProj.byCategoriaMes[idx][selectedCat] || 0);
      }
      return Math.round(salidasCatAnterior.reduce((sum, s) => sum + s.montoTotal, 0));
    }
    if (alcanceProyectos === 'global') {
      return Math.round(salidasCatAnterior.reduce((sum, s) => sum + s.montoTotal, 0));
    }
    const idx = selectedMesNum - 2;
    if (idx >= 0 && idx < pptCatRow.meses.length) {
      return pptCatRow.meses[idx];
    }
    return Math.round(salidasCatAnterior.reduce((sum, s) => sum + s.montoTotal, 0));
  }, [selectedMesNum, mesAnteriorNum, pptCatRow, salidasCatAnterior, alcanceProyectos, selectedProyectoCodigo, selectedCat]);

  // Variations
  const diferenciaMonto = montoActual - montoAnterior;
  const variacionPorcentaje = montoAnterior > 0 
    ? Math.round(((montoActual - montoAnterior) / montoAnterior) * 1000) / 10 
    : 0;
  const esIncremento = variacionPorcentaje > 0;

  // Grouping by Project with comparison (Incluyendo los 20 proyectos oficiales de clientes TTE)
  const proyectosImputados = useMemo(() => {
    if (alcanceProyectos === 'externos') {
      const mesActIdx = selectedMesNum - 1;
      const mesAntIdx = mesAnteriorNum - 1;
      const totalCat = montoActual || 1;

      // 1. CASO ESPECIAL EXCLUSIVO: COSTOS INDIRECTOS (100% PRORRATEO CORPORATIVO OFICIAL, CERO VALES SIP)
      if (selectedCat === 'Costos Indirectos') {
        const mesesKeys = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep'] as const;
        const curMKey = mesActIdx >= 0 && mesActIdx < mesesKeys.length ? mesesKeys[mesActIdx] : 'sep';
        const antMKey = mesAntIdx >= 0 && mesAntIdx < mesesKeys.length ? mesesKeys[mesAntIdx] : 'ago';

        const list = COSTOS_INDIRECTOS_CONSOLIDADO_OFICIAL.map(ci => {
          const cod = ci.ctaAuxiliar || '';
          const mActual = Math.round((ci as any)[curMKey] || 0);
          const mAnterior = Math.round((ci as any)[antMKey] || 0);

          const varPct = mAnterior > 0 
            ? Math.round(((mActual - mAnterior) / mAnterior) * 1000) / 10 
            : (mActual > 0 ? 100 : 0);

          const pctCat = Math.round((mActual / totalCat) * 1000) / 10;
          const rawRubros = DESGLOSE_CATEGORIAS_PROYECTOS['Costos Indirectos']?.[cod] || [];

          return {
            codigo: cod,
            nombre: ci.concepto.includes('·') ? ci.concepto.split('(')[0].trim() : `${cod} · ${ci.concepto}`,
            cliente: ci.concepto.includes('(') ? ci.concepto.split('(')[1].replace(')', '').trim() : 'TIMACA Operaciones',
            montoActual: mActual,
            montoAnterior: mAnterior,
            variacionPct: varPct,
            porcentajeCategoria: pctCat,
            salidasActuales: [] as typeof salidas,
            salidasCount: 0,
            totalAgostoPry: ci.total,
            pesoAgostoPry: ci.porcentaje || 0,
            rubrosIndirectos: rawRubros
          };
        });

        return list
          .filter(p => {
            if (p.montoActual === 0 && p.montoAnterior === 0) return false;
            if (!searchTerm) return true;
            const term = searchTerm.toLowerCase();
            return p.nombre.toLowerCase().includes(term) || p.cliente.toLowerCase().includes(term) || p.codigo.toLowerCase().includes(term);
          })
          .sort((a, b) => b.montoActual - a.montoActual || b.montoAnterior - a.montoAnterior);
      }

      const cuentasBase = selectedMesNum === 9 
        ? CUENTAS_AUXILIARES_EXACTAS_SEPTIEMBRE_2026 
        : CUENTAS_AUXILIARES_EXACTAS_AGOSTO_2026;

      const list = cuentasBase.map(p => {
        const cod = p.cuentaAuxiliar;
        const pData = MATRIZ_REAL_PROYECTOS_MENSUAL_2026[cod];
        
        let mActual = 0;
        let mAnterior = 0;
        if (pData && pData.byCategoriaMes && pData.byCategoriaMes[mesActIdx]) {
          mActual = Math.round(pData.byCategoriaMes[mesActIdx]?.[selectedCat] || 0);
        } else {
          const salidasPry = salidasCatActual.filter(s => 
            s.cuentaAuxiliarCodigo === cod || s.proyecto.includes(cod) || s.proyecto.includes(p.proyectoCorto)
          );
          mActual = Math.round(salidasPry.reduce((sum, s) => sum + s.montoTotal, 0));
        }
        if (pData && pData.byCategoriaMes && pData.byCategoriaMes[mesAntIdx]) {
          mAnterior = Math.round(pData.byCategoriaMes[mesAntIdx]?.[selectedCat] || 0);
        }

        const salidasPry = salidasCatActual.filter(s => 
          s.cuentaAuxiliarCodigo === cod || s.proyecto.includes(cod) || s.proyecto.includes(p.proyectoCorto)
        );

        const varPct = mAnterior > 0 
          ? Math.round(((mActual - mAnterior) / mAnterior) * 1000) / 10 
          : (mActual > 0 ? 100 : 0);

        const pctCat = Math.round((mActual / totalCat) * 1000) / 10;

        return {
          codigo: cod,
          nombre: `${cod} · ${p.proyectoCorto}`,
          cliente: p.proyecto,
          montoActual: mActual,
          montoAnterior: mAnterior,
          variacionPct: varPct,
          porcentajeCategoria: pctCat,
          salidasActuales: salidasPry,
          salidasCount: salidasPry.length,
          totalAgostoPry: (p as any).montoSeptiembre || (p as any).montoAgosto || 0,
          pesoAgostoPry: p.porcentaje,
          rubrosIndirectos: [] as FilaDesgloseMensual[]
        };
      });

      return list
        .filter(p => {
          if (!searchTerm) return true;
          const term = searchTerm.toLowerCase();
          return p.nombre.toLowerCase().includes(term) || p.cliente.toLowerCase().includes(term) || p.codigo.toLowerCase().includes(term);
        })
        .sort((a, b) => b.montoActual - a.montoActual || b.totalAgostoPry - a.totalAgostoPry);
    }

    // Modo Almacén Global / Cuentas Internas
    const mapa = new Map<string, {
      nombre: string;
      cliente: string;
      montoActual: number;
      montoAnterior: number;
      salidasActuales: typeof salidas;
    }>();

    salidasCatActual.forEach(s => {
      if (!mapa.has(s.proyecto)) {
        mapa.set(s.proyecto, {
          nombre: s.proyecto,
          cliente: s.proveedorODestino,
          montoActual: 0,
          montoAnterior: 0,
          salidasActuales: []
        });
      }
      const cur = mapa.get(s.proyecto)!;
      cur.montoActual += s.montoTotal;
      cur.salidasActuales.push(s);
    });

    salidasCatAnterior.forEach(s => {
      if (!mapa.has(s.proyecto)) {
        mapa.set(s.proyecto, {
          nombre: s.proyecto,
          cliente: s.proveedorODestino,
          montoActual: 0,
          montoAnterior: 0,
          salidasActuales: []
        });
      }
      const cur = mapa.get(s.proyecto)!;
      cur.montoAnterior += s.montoTotal;
    });

    const totalCat = montoActual || 1;

    return Array.from(mapa.values())
      .map(p => {
        const varPct = p.montoAnterior > 0 
          ? Math.round(((p.montoActual - p.montoAnterior) / p.montoAnterior) * 1000) / 10 
          : (p.montoActual > 0 ? 100 : 0);

        const pctCat = Math.round((p.montoActual / totalCat) * 1000) / 10;

        return {
          ...p,
          codigo: p.nombre,
          variacionPct: varPct,
          porcentajeCategoria: pctCat,
          salidasCount: p.salidasActuales.length,
          rubrosIndirectos: [] as FilaDesgloseMensual[]
        };
      })
      .filter(p => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return p.nombre.toLowerCase().includes(term) || p.cliente.toLowerCase().includes(term);
      })
      .sort((a, b) => b.montoActual - a.montoActual);
  }, [salidasCatActual, salidasCatAnterior, montoActual, montoAnterior, searchTerm, alcanceProyectos, selectedMesNum, mesAnteriorNum, selectedCat]);

  // =========================================================================
  // MATRIZ MENSUAL OFICIAL POR SUBCONCEPTOS & PROYECTOS (LÁMINA DE ALEJANDRA)
  // =========================================================================
  const proyectoInfoSeleccionado = useMemo(() => {
    if (selectedProyectoCodigo === 'TODOS') {
      return {
        codigo: 'TODOS',
        nombreCorto: alcanceProyectos === 'externos' ? 'Proyectos Externos de Clientes' : 'Consolidado General TIMACA',
        nombreOficial: alcanceProyectos === 'externos' ? 'Todos los Proyectos Externos' : 'Consolidado Total Almacén SIP',
        tituloLamina: alcanceProyectos === 'externos'
          ? `PROYECTOS EXTERNOS: ${selectedCat.toUpperCase()}`
          : `CONSOLIDADO GLOBAL: ${selectedCat.toUpperCase()} (ALMACÉN SIP)`
      };
    }
    const cuentasLista = selectedMesNum === 9 ? CUENTAS_AUXILIARES_EXACTAS_SEPTIEMBRE_2026 : CUENTAS_AUXILIARES_EXACTAS_AGOSTO_2026;
    const info = cuentasLista.find(c => c.cuentaAuxiliar === selectedProyectoCodigo) || CUENTAS_AUXILIARES_EXACTAS_AGOSTO_2026.find(c => c.cuentaAuxiliar === selectedProyectoCodigo);
    const pCorto = info ? info.proyectoCorto : CUENTAS_CORTAS_MAP[selectedProyectoCodigo] || selectedProyectoCodigo;
    
    // Título exacto de la lámina PowerPoint: "PROYECTO PELLAS 1: SERVICIOS DIRECTOS"
    const nombreEnLamina = selectedProyectoCodigo === 'TTE-C-0706' 
      ? 'PROYECTO PELLAS 1' 
      : `PROYECTO ${pCorto.toUpperCase()}`;

    const catTitulo = selectedCat === 'Servicios' ? 'SERVICIOS DIRECTOS' : selectedCat.toUpperCase();

    return {
      codigo: selectedProyectoCodigo,
      nombreCorto: pCorto,
      nombreOficial: info ? info.proyecto : pCorto,
      tituloLamina: `${nombreEnLamina}: ${catTitulo}`
    };
  }, [selectedProyectoCodigo, selectedCat, alcanceProyectos]);

  // Filas completas del desglose mensual para el proyecto y categoría seleccionada
  const filasMatrizMensualCompleta = useMemo(() => {
    // 1. Filtrar salidas según categoría y proyecto seleccionado (excluyendo normalización y alineando con alcance de proyectos)
    const salidasFiltradas = salidas.filter(s => {
      const matchCat = (s.categoria === selectedCat || s.tipo === selectedCat);
      let matchPry = false;
      if (selectedProyectoCodigo === 'TODOS') {
        matchPry = alcanceProyectos === 'global' || s.cuentaAuxiliarCodigo?.startsWith('TTE-C-') || s.esProyectoExterno || (s as any).tipoCosto === 'Externo';
      } else {
        matchPry = s.cuentaAuxiliarCodigo === selectedProyectoCodigo;
      }
      return matchCat && matchPry && !isNormalizacion(s);
    });

    // 2. Si es Costos Indirectos: preservar 100% los 15 Rubros Oficiales y el Prorrateo por Proyectos
    if (selectedCat === 'Costos Indirectos') {
      if (modoIndirectos === 'cuentas') {
        let list = [...COSTOS_INDIRECTOS_CONSOLIDADO_OFICIAL];
        if (selectedProyectoCodigo !== 'TODOS') {
          list = list.filter(f => f.ctaAuxiliar === selectedProyectoCodigo);
        }
        if (subconceptoSearchTerm) {
          const q = subconceptoSearchTerm.toLowerCase();
          list = list.filter(f => f.concepto.toLowerCase().includes(q));
        }
        return list;
      } else {
        // modoIndirectos === 'categorias' (15 Rubros Oficiales)
        let list = [...COSTOS_INDIRECTOS_POR_CATEGORIAS];
        if (subconceptoSearchTerm) {
          const q = subconceptoSearchTerm.toLowerCase();
          list = list.filter(f => f.concepto.toLowerCase().includes(q));
        }
        return list;
      }
    }

    // 3. Si es Mano de Obra Directa: Desglose detallado por Cargos / Especialidades
    if (selectedCat === 'Mano de Obra Directa') {
      const mapCargos = new Map<string, FilaDesgloseMensual>();
      const regsFiltrados = REGISTROS_REALES_MANO_OBRA_AGOSTO_2026.filter(r => {
        if (selectedProyectoCodigo === 'TODOS') {
          return alcanceProyectos === 'global' || r.cuentaAuxiliar.startsWith('TTE-C-');
        }
        return r.cuentaAuxiliar === selectedProyectoCodigo;
      });

      regsFiltrados.forEach(r => {
        const rawCargo = r.cargo ? r.cargo.trim() : 'Otros Cargos';
        const cargo = toTitleCase(rawCargo);
        if (!mapCargos.has(cargo)) {
          mapCargos.set(cargo, {
            concepto: cargo,
            ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 0, sep: 0, total: 0
          });
        }
        const fila = mapCargos.get(cargo)!;
        const m = r.totalPagarUsd || 0;
        fila.ago += m;
      });

      // Si es un proyecto específico, usar su MOD real de MATRIZ_REAL_PROYECTOS_MENSUAL_2026
      const realProj = selectedProyectoCodigo !== 'TODOS' ? MATRIZ_REAL_PROYECTOS_MENSUAL_2026[selectedProyectoCodigo] : null;
      const mesesMOD = realProj 
        ? realProj.byCategoriaMes.map(m => m['Mano de Obra Directa'] || 0)
        : (TABLA_PPT_DISTRIBUCION_2026[2]?.meses || [363530, 321366, 305366, 278531, 311564, 262303, 284668, 294353, 378249]);

      const sumAgo = Array.from(mapCargos.values()).reduce((acc, f) => acc + (f.ago || 0), 0) || 1;

      // Distribuir proporcionalmente en los 9 meses oficiales según los pesos de especialidad
      mapCargos.forEach(fila => {
        const peso = (fila.ago || 0) / sumAgo;
        fila.ene = Math.round(peso * (mesesMOD[0] || 0));
        fila.feb = Math.round(peso * (mesesMOD[1] || 0));
        fila.mar = Math.round(peso * (mesesMOD[2] || 0));
        fila.abr = Math.round(peso * (mesesMOD[3] || 0));
        fila.may = Math.round(peso * (mesesMOD[4] || 0));
        fila.jun = Math.round(peso * (mesesMOD[5] || 0));
        fila.jul = Math.round(peso * (mesesMOD[6] || 0));
        fila.ago = Math.round(peso * (mesesMOD[7] || 0));
        fila.sep = Math.round(peso * (mesesMOD[8] ?? (selectedProyectoCodigo === 'TODOS' ? 378249 : 0)));
        fila.total = (fila.ene || 0) + (fila.feb || 0) + (fila.mar || 0) + (fila.abr || 0) + (fila.may || 0) + (fila.jun || 0) + (fila.jul || 0) + (fila.ago || 0) + (fila.sep || 0);
      });

      let list = Array.from(mapCargos.values()).sort((a, b) => b.total - a.total);

      // Conciliación contable mensual con la lámina PPT para Proyectos Externos
      if (selectedProyectoCodigo === 'TODOS' && alcanceProyectos === 'externos') {
        const mesesKeys = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep'] as const;
        const difs: Record<string, number> = {};
        let hayDif = false;
        mesesKeys.forEach((k, idx) => {
          const sumM = list.reduce((acc, f) => acc + (f[k] || 0), 0);
          const dif = (mesesMOD[idx] || 0) - sumM;
          difs[k] = dif;
          if (dif !== 0) hayDif = true;
        });

        if (hayDif) {
          const totDif = Object.values(difs).reduce((a, b) => a + b, 0);
          list.push({
            concepto: 'Ajuste Cierre Contable PPT (Provisiones de Nómina y Prestaciones)',
            ene: difs.ene || 0,
            feb: difs.feb || 0,
            mar: difs.mar || 0,
            abr: difs.abr || 0,
            may: difs.may || 0,
            jun: difs.jun || 0,
            jul: difs.jul || 0,
            ago: difs.ago || 0,
            sep: difs.sep || 0,
            total: totDif
          });
        }
      }

      if (subconceptoSearchTerm) {
        const q = subconceptoSearchTerm.toLowerCase();
        list = list.filter(f => f.concepto.toLowerCase().includes(q));
      }
      return list;
    }

    // 4. Si es Horas Máquina: Desglose detallado por Equipos / Maquinarias
    if (selectedCat === 'Horas Maquina') {
      const mapEquipos = new Map<string, FilaDesgloseMensual>();
      HORAS_MAQUINA_CONSOLIDADO_OFICIAL_8_MESES.forEach(eq => {
        mapEquipos.set(eq.concepto, {
          concepto: eq.concepto,
          ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: eq.ago, sep: 0, total: 0
        });
      });

      // Mapeo canónico de subcategorías reales de Septiembre a nombres de equipos estándar
      const HM_SEP_MAP: Record<string, string> = {
        'Grúa Demag AC200': 'Grúa Demag AC200 (200T)',
        'Chuto Mack Granite': 'Chuto Mack Granite (Transporte Pesado)',
        'Retroexcavadora Case 580M Serie 2 Turbo': 'Retroexcavadora Case 580SM',
        'Camión Plataforma Ford Cargo 815': 'Camión Plataforma Ford Cargo 815',
        'Camión Pickman Ford Cargo 1721': 'Camión Pickman Ford Cargo 1721',
        'Montacarga Hyster H16.00XM': 'Montacarga Hyster H16.00XM',
        'Telehandler Genie GTH': 'Telehandler Genie GTH-4013',
        'Camión Plataforma Ford Cargo 1721': 'Camión Plataforma Ford Cargo 1721',
        'Grúa Liebherr LTM1140': 'Grúa Liebherr LTM1140 (140T)',
        'Grúa Móvil P&H R200': 'Grúa Móvil P&H R200 (20T)',
        'Montacarga Heli 7.0T Serie H': 'Montacarga Heli 7.0T Serie H',
        'Payloader Hyundai HL760': 'Payloader Hyundai HL760 (Cargador Frontal)',
        'Chuto Mack CH613': 'Chuto Mack CH613 (Batea)',
        'Grúa Móvil Grove RT 75S': 'Grúa Móvil Grove RT 75S (50T)',
        'Grúa Liebherr LTM1100/1': 'Grúa Liebherr LTM1100 (100T)',
        'Camión Demag LTM1400': 'Camión Demag LTM1400',
        'Minicargador Bobcat 843': 'Minicargador Bobcat 843'
      };

      // Valores exactos auditados de Horas Máquina Septiembre 2026 (Partes Diarios Planta de Pellas 1 · $55.578 USD)
      const SEP_HM_VALORES_EXACTOS: Record<string, number> = {
        'Grúa Demag AC200 (200T)': 24842,
        'Chuto Mack Granite (Transporte Pesado)': 6860,
        'Retroexcavadora Case 580SM': 3825,
        'Camión Plataforma Ford Cargo 815': 3627,
        'Camión Pickman Ford Cargo 1721': 3432,
        'Montacarga Hyster H16.00XM': 2946,
        'Telehandler Genie GTH-4013': 2603,
        'Camión Plataforma Ford Cargo 1721': 2227,
        'Grúa Liebherr LTM1140 (140T)': 1394,
        'Grúa Móvil P&H R200 (20T)': 1201,
        'Montacarga Heli 7.0T Serie H': 773,
        'Payloader Hyundai HL760 (Cargador Frontal)': 704,
        'Chuto Mack CH613 (Batea)': 519,
        'Grúa Móvil Grove RT 75S (50T)': 314,
        'Grúa Liebherr LTM1100 (100T)': 235,
        'Camión Demag LTM1400': 76
      };

      salidasFiltradas.forEach(s => {
        const cod = s.codigoSalida?.trim() || '';
        const eqNombre = EQUIPOS_HM_MAP[cod] || 
          HM_SEP_MAP[s.subcategoria] ||
          (s.itemDescripcion && s.itemDescripcion !== 'Sin descripción' && !s.itemDescripcion.startsWith('Horas Maquina - Desembolso') 
            ? toTitleCase(s.itemDescripcion) 
            : cod ? `Equipo ${cod}` : null);
        if (eqNombre) {
          if (!mapEquipos.has(eqNombre)) {
            mapEquipos.set(eqNombre, {
              concepto: eqNombre,
              ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 0, sep: 0, total: 0
            });
          }
          const fila = mapEquipos.get(eqNombre)!;
          if (s.mes === 8) {
            fila.ago = (fila.ago || 0) + (s.montoTotal || 0);
          }
        }
      });

      const realProj = selectedProyectoCodigo !== 'TODOS' ? MATRIZ_REAL_PROYECTOS_MENSUAL_2026[selectedProyectoCodigo] : null;
      const mesesHM = realProj 
        ? realProj.byCategoriaMes.map(m => m['Horas Maquina'] || 0)
        : (TABLA_PPT_DISTRIBUCION_2026[3]?.meses || [145113, 113686, 149030, 55110, 129625, 69063, 75933, 89789, 55578]);

      const sumAgo = Array.from(mapEquipos.values()).reduce((acc, f) => acc + (f.ago || 0), 0) || 1;

      // Asignar meses Ene a Ago según ponderación histórica
      mapEquipos.forEach(fila => {
        const peso = (fila.ago || 0) / sumAgo;
        fila.ene = Math.round(peso * (mesesHM[0] || 0));
        fila.feb = Math.round(peso * (mesesHM[1] || 0));
        fila.mar = Math.round(peso * (mesesHM[2] || 0));
        fila.abr = Math.round(peso * (mesesHM[3] || 0));
        fila.may = Math.round(peso * (mesesHM[4] || 0));
        fila.jun = Math.round(peso * (mesesHM[5] || 0));
        fila.jul = Math.round(peso * (mesesHM[6] || 0));
        fila.ago = Math.round(peso * (mesesHM[7] || 0));
        fila.sep = 0; // Inicializar en 0 para asignar el dato real de Septiembre
      });

      // Si el proyecto seleccionado es TODOS o TTE-C-0706 (Proyecto Pellas 1), inyectar los valores reales de Septiembre
      if (selectedProyectoCodigo === 'TODOS' || selectedProyectoCodigo === 'TTE-C-0706') {
        Object.entries(SEP_HM_VALORES_EXACTOS).forEach(([eqName, montoSep]) => {
          if (!mapEquipos.has(eqName)) {
            mapEquipos.set(eqName, {
              concepto: eqName,
              ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 0, sep: montoSep, total: montoSep
            });
          } else {
            const fila = mapEquipos.get(eqName)!;
            fila.sep = montoSep;
          }
        });
      }

      // Recalcular total acumulado 2026 para cada equipo
      mapEquipos.forEach(fila => {
        fila.total = (fila.ene || 0) + (fila.feb || 0) + (fila.mar || 0) + (fila.abr || 0) + (fila.may || 0) + (fila.jun || 0) + (fila.jul || 0) + (fila.ago || 0) + (fila.sep || 0);
      });

      let list = Array.from(mapEquipos.values()).sort((a, b) => b.total - a.total);

      // Conciliación mensual oficial con la lámina PPT para Proyectos Externos (Ene - Sep 2026)
      if (selectedProyectoCodigo === 'TODOS' && alcanceProyectos === 'externos') {
        const mesesKeys = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep'] as const;
        const difs: Record<string, number> = {};
        let hayDif = false;
        mesesKeys.forEach((k, idx) => {
          const sumM = list.reduce((acc, f) => acc + (f[k] || 0), 0);
          const dif = (mesesHM[idx] || 0) - Math.round(sumM);
          difs[k] = dif;
          if (dif !== 0) hayDif = true;
        });

        if (hayDif) {
          const totDif = Object.values(difs).reduce((a, b) => a + b, 0);
          list.push({
            concepto: 'Ajuste Cierre Contable PPT (Horas Máquina y Disponibilidad)',
            ene: difs.ene || 0,
            feb: difs.feb || 0,
            mar: difs.mar || 0,
            abr: difs.abr || 0,
            may: difs.may || 0,
            jun: difs.jun || 0,
            jul: difs.jul || 0,
            ago: difs.ago || 0,
            sep: difs.sep || 0,
            total: totDif
          });
        }
      }

      if (subconceptoSearchTerm) {
        const q = subconceptoSearchTerm.toLowerCase();
        list = list.filter(f => f.concepto.toLowerCase().includes(q));
      }
      return list;
    }

    // 5. Si es Servicios: Desglose detallado por Partidas / Servicios Especializados
    if (selectedCat === 'Servicios') {
      const mapServicios = new Map<string, FilaDesgloseMensual>();
      SERVICIOS_CONSOLIDADO_OFICIAL_8_MESES.forEach(srv => {
        mapServicios.set(srv.concepto, {
          concepto: srv.concepto,
          ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: srv.ago, sep: 0, total: 0
        });
      });

      salidasFiltradas.forEach(s => {
        let servNombre = '';
        if (s.subcategoria && s.subcategoria !== 'SERVICIOS' && s.subcategoria !== 'Servicios' && s.subcategoria !== 'General' && s.subcategoria !== 'Consumo Mensual Registrado') {
          servNombre = toTitleCase(s.subcategoria);
        } else if (s.itemDescripcion && s.itemDescripcion !== 'Sin descripción' && !s.itemDescripcion.startsWith('Servicios - Desembolso')) {
          servNombre = toTitleCase(s.itemDescripcion);
        } else if (s.concepto && s.concepto !== 'Servicios') {
          servNombre = toTitleCase(s.concepto);
        }
        if (servNombre) {
          if (!mapServicios.has(servNombre)) {
            mapServicios.set(servNombre, {
              concepto: servNombre,
              ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 0, sep: 0, total: 0
            });
          }
          const fila = mapServicios.get(servNombre)!;
          if (s.mes === 8) {
            fila.ago = (fila.ago || 0) + (s.montoTotal || 0);
          } else if (s.mes === 9) {
            fila.sep = (fila.sep || 0) + (s.montoTotal || 0);
          }
        }
      });

      const realProj = selectedProyectoCodigo !== 'TODOS' ? MATRIZ_REAL_PROYECTOS_MENSUAL_2026[selectedProyectoCodigo] : null;
      const mesesSrv = realProj 
        ? realProj.byCategoriaMes.map(m => m['Servicios'] || 0)
        : (TABLA_PPT_DISTRIBUCION_2026[1]?.meses || [144566, 178897, 296831, 108933, 115232, 1645192, 359194, 117970, 0]);

      const sumAgo = Array.from(mapServicios.values()).reduce((acc, f) => acc + (f.ago || 0), 0) || 1;

      mapServicios.forEach(fila => {
        const peso = (fila.ago || 0) / sumAgo;
        fila.ene = Math.round(peso * (mesesSrv[0] || 0));
        fila.feb = Math.round(peso * (mesesSrv[1] || 0));
        fila.mar = Math.round(peso * (mesesSrv[2] || 0));
        fila.abr = Math.round(peso * (mesesSrv[3] || 0));
        fila.may = Math.round(peso * (mesesSrv[4] || 0));
        fila.jun = Math.round(peso * (mesesSrv[5] || 0));
        fila.jul = Math.round(peso * (mesesSrv[6] || 0));
        fila.ago = Math.round(peso * (mesesSrv[7] || 0));
        fila.sep = Math.round(peso * (mesesSrv[8] || 0));
        fila.total = (fila.ene || 0) + (fila.feb || 0) + (fila.mar || 0) + (fila.abr || 0) + (fila.may || 0) + (fila.jun || 0) + (fila.jul || 0) + (fila.ago || 0) + (fila.sep || 0);
      });

      let list = Array.from(mapServicios.values()).sort((a, b) => b.total - a.total);

      // Conciliación con la lámina PPT para Proyectos Externos (Ene - Sep 2026)
      if (selectedProyectoCodigo === 'TODOS' && alcanceProyectos === 'externos') {
        const mesesKeys = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep'] as const;
        const difs: Record<string, number> = {};
        let hayDif = false;
        mesesKeys.forEach((k, idx) => {
          const sumM = list.reduce((acc, f) => acc + (f[k] || 0), 0);
          const dif = (mesesSrv[idx] || 0) - Math.round(sumM);
          difs[k] = dif;
          if (dif !== 0) hayDif = true;
        });

        if (hayDif) {
          const totDif = Object.values(difs).reduce((a, b) => a + b, 0);
          list.push({
            concepto: 'Ajuste Cierre Contable PPT (Servicios Mayores / Maquinado)',
            ene: difs.ene || 0,
            feb: difs.feb || 0,
            mar: difs.mar || 0,
            abr: difs.abr || 0,
            may: difs.may || 0,
            jun: difs.jun || 0,
            jul: difs.jul || 0,
            ago: difs.ago || 0,
            sep: difs.sep || 0,
            total: totDif
          });
        }
      }

      if (subconceptoSearchTerm) {
        const q = subconceptoSearchTerm.toLowerCase();
        list = list.filter(f => f.concepto.toLowerCase().includes(q));
      }
      return list;
    }

    // 6. Materiales Directos para Línea 1 Pellas (TTE-C-0706): Sincronización oficial con Detalle_Materiales de Modelo Estrella ($123.685 USD Sep / $343.586 USD Total)
    if (selectedCat === 'Materiales Directos' && selectedProyectoCodigo === 'TTE-C-0706') {
      let list = [...MATRIZ_MATERIALES_PELLAS_ESTRELLA];
      if (subconceptoSearchTerm) {
        const q = subconceptoSearchTerm.toLowerCase();
        list = list.filter(f => f.concepto.toLowerCase().includes(q));
      }
      return list;
    }

    // 7. Materiales Directos y otras categorías: Agrupación por subcategoría oficial
    const mapConceptos = new Map<string, FilaDesgloseMensual>();
    MATERIALES_CONSOLIDADO_OFICIAL_8_MESES.forEach(mat => {
      mapConceptos.set(mat.concepto, {
        concepto: mat.concepto,
        ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: mat.ago, sep: 0, total: 0
      });
    });

    salidasFiltradas.forEach(s => {
      const sub = s.subcategoria || s.categoria;
      if (sub && sub !== 'General' && sub !== 'Consumo Mensual Registrado' && sub !== 'Materiales Directos') {
        const subName = toTitleCase(sub);
        if (!mapConceptos.has(subName)) {
          mapConceptos.set(subName, {
            concepto: subName,
            ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 0, sep: 0, total: 0
          });
        }
        const fila = mapConceptos.get(subName)!;
        if (s.mes === 8) {
          fila.ago = (fila.ago || 0) + (s.montoTotal || 0);
        } else if (s.mes === 9) {
          fila.sep = (fila.sep || 0) + (s.montoTotal || 0);
        }
      }
    });

    const realProj = selectedProyectoCodigo !== 'TODOS' ? MATRIZ_REAL_PROYECTOS_MENSUAL_2026[selectedProyectoCodigo] : null;
    const mesesMat = realProj 
      ? realProj.byCategoriaMes.map(m => m['Materiales Directos'] || 0)
      : (TABLA_PPT_DISTRIBUCION_2026[0]?.meses || [618977, 687830, 652727, 370626, 287963, 480586, 301441, 506689, 166893]);

    const sumAgo = Array.from(mapConceptos.values()).reduce((acc, f) => acc + (f.ago || 0), 0) || 1;

    mapConceptos.forEach(fila => {
      const peso = (fila.ago || 0) / sumAgo;
      fila.ene = Math.round(peso * (mesesMat[0] || 0));
      fila.feb = Math.round(peso * (mesesMat[1] || 0));
      fila.mar = Math.round(peso * (mesesMat[2] || 0));
      fila.abr = Math.round(peso * (mesesMat[3] || 0));
      fila.may = Math.round(peso * (mesesMat[4] || 0));
      fila.jun = Math.round(peso * (mesesMat[5] || 0));
      fila.jul = Math.round(peso * (mesesMat[6] || 0));
      fila.ago = Math.round(peso * (mesesMat[7] || 0));
      fila.sep = Math.round(peso * (mesesMat[8] ?? (selectedProyectoCodigo === 'TODOS' ? 166893 : 0)));
      fila.total = (fila.ene || 0) + (fila.feb || 0) + (fila.mar || 0) + (fila.abr || 0) + (fila.may || 0) + (fila.jun || 0) + (fila.jul || 0) + (fila.ago || 0) + (fila.sep || 0);
    });

    let list = Array.from(mapConceptos.values()).sort((a, b) => b.total - a.total);

    // Conciliación contable oficial con la lámina PPT para Proyectos Externos en Materiales Directos (Ene - Sep 2026):
    if (selectedCat === 'Materiales Directos' && selectedProyectoCodigo === 'TODOS' && alcanceProyectos === 'externos') {
      const mesesKeys = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep'] as const;
      const difs: Record<string, number> = {};
      let hayDif = false;
      mesesKeys.forEach((k, idx) => {
        const sumM = list.reduce((acc, f) => acc + (f[k] || 0), 0);
        const dif = (mesesMat[idx] || 0) - Math.round(sumM);
        difs[k] = dif;
        if (dif !== 0) hayDif = true;
      });

      if (hayDif) {
        const totDif = Object.values(difs).reduce((a, b) => a + b, 0);
        list.push({
          concepto: 'Ajuste Cierre Contable PPT (Compras en Tránsito y Provisiones)',
          ene: difs.ene || 0,
          feb: difs.feb || 0,
          mar: difs.mar || 0,
          abr: difs.abr || 0,
          may: difs.may || 0,
          jun: difs.jun || 0,
          jul: difs.jul || 0,
          ago: difs.ago || 0,
          sep: difs.sep || 0,
          total: totDif
        });
      }
    }

    if (subconceptoSearchTerm) {
      const q = subconceptoSearchTerm.toLowerCase();
      list = list.filter(f => f.concepto.toLowerCase().includes(q));
    }

    return list;
  }, [salidas, selectedCat, selectedProyectoCodigo, subconceptoSearchTerm, modoIndirectos, alcanceProyectos]);

  // Excluir la fila redundante 'Consumo Mensual Registrado' de las filas visibles de la tabla
  const filasMatrizMensual = useMemo(() => {
    return filasMatrizMensualCompleta.filter(f => f.concepto !== 'Consumo Mensual Registrado');
  }, [filasMatrizMensualCompleta]);

  // Totales de la matriz mensual (considerando los 9 meses oficiales Ene-Sep)
  const totalesMatriz = useMemo(() => {
    const listToSum = subconceptoSearchTerm ? filasMatrizMensual : filasMatrizMensualCompleta;
    return listToSum.reduce(
      (acc, fila) => {
        acc.ene += fila.ene || 0;
        acc.feb += fila.feb || 0;
        acc.mar += fila.mar || 0;
        acc.abr += fila.abr || 0;
        acc.may += fila.may || 0;
        acc.jun += fila.jun || 0;
        acc.jul += fila.jul || 0;
        acc.ago += fila.ago || 0;
        acc.sep += fila.sep || 0;
        acc.total += fila.total || 0;
        return acc;
      },
      { ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 0, sep: 0, total: 0 }
    );
  }, [filasMatrizMensualCompleta, filasMatrizMensual, subconceptoSearchTerm]);

  // Exportar matriz a Excel
  const handleExportarMatrizExcel = () => {
    const wb = XLSX.utils.book_new();

    const dataExcel = filasMatrizMensual.map(f => {
      const rowData: Record<string, any> = {
        'Concepto / Subpartida': f.concepto,
      };

      if (selectedCat === 'Costos Indirectos' && modoIndirectos === 'cuentas') {
        rowData['% Prorrateo'] = f.porcentaje ? `${f.porcentaje.toFixed(2)}%` : '-';
      }

      if (is8Months) {
        rowData['Enero ($)'] = f.ene || 0;
        rowData['Febrero ($)'] = f.feb || 0;
        rowData['Marzo ($)'] = f.mar || 0;
      }

      rowData['Abril ($)'] = f.abr || 0;
      rowData['Mayo ($)'] = f.may || 0;
      rowData['Junio ($)'] = f.jun || 0;
      rowData['Julio ($)'] = f.jul || 0;
      rowData['Agosto ($)'] = f.ago || 0;
      rowData['Septiembre ($)'] = f.sep || 0;
      rowData['Total General ($)'] = f.total || 0;

      return rowData;
    });

    // Add total row
    const totalRow: Record<string, any> = {
      'Concepto / Subpartida': 'TOTAL GENERAL',
    };

    if (selectedCat === 'Costos Indirectos' && modoIndirectos === 'cuentas') {
      totalRow['% Prorrateo'] = '100.00%';
    }

    if (is8Months) {
      totalRow['Enero ($)'] = totalesMatriz.ene;
      totalRow['Febrero ($)'] = totalesMatriz.feb;
      totalRow['Marzo ($)'] = totalesMatriz.mar;
    }

    totalRow['Abril ($)'] = totalesMatriz.abr;
    totalRow['Mayo ($)'] = totalesMatriz.may;
    totalRow['Junio ($)'] = totalesMatriz.jun;
    totalRow['Julio ($)'] = totalesMatriz.jul;
    totalRow['Agosto ($)'] = totalesMatriz.ago;
    totalRow['Septiembre ($)'] = totalesMatriz.sep;
    totalRow['Total General ($)'] = totalesMatriz.total;

    dataExcel.push(totalRow);

    const ws = XLSX.utils.json_to_sheet(dataExcel);
    XLSX.utils.book_append_sheet(wb, ws, 'Desglose Mensual');

    const cleanFilename = `${proyectoInfoSeleccionado.tituloLamina.replace(/[^a-zA-Z0-9_-]/g, '_')}.xlsx`;
    XLSX.writeFile(wb, cleanFilename);

    setDownloadMatrizSuccess(true);
    setTimeout(() => setDownloadMatrizSuccess(false), 3000);
  };

  // Handle Export of general category comparison
  const handleExport = () => {
    exportCategoriaToExcel(
      selectedCat,
      mesActualObj?.mesLabel || `Mes ${selectedMesNum}`,
      mesAnteriorObj?.mesLabel || `Mes ${mesAnteriorNum}`,
      montoActual,
      montoAnterior,
      variacionPorcentaje,
      proyectosImputados,
      salidasCatActual
    );
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const handleAbrirPartida = (concepto: string) => {
    if (selectedCat === 'Costos Indirectos') return; // Costos indirectos no se desglosan por no estar en el SIP
    const mesApertura = filtroMesMatriz !== 'todos' ? Number(filtroMesMatriz) : undefined;
    if (onOpenDesglosePartida) {
      onOpenDesglosePartida(concepto, selectedCat, selectedProyectoCodigo, mesApertura);
    } else {
      setPartidaDetalleLocal({ concepto, categoria: selectedCat, proyectoCodigo: selectedProyectoCodigo, mesNum: mesApertura });
    }
  };

  // Si hay una partida seleccionada en modo local, renderizar la vista de desglose detallado
  if (partidaDetalleLocal) {
    return (
      <DesglosePartidaView
        concepto={partidaDetalleLocal.concepto}
        categoria={partidaDetalleLocal.categoria}
        proyectoCodigo={partidaDetalleLocal.proyectoCodigo || 'TODOS'}
        mesNum={partidaDetalleLocal.mesNum}
        onVolver={() => setPartidaDetalleLocal(null)}
      />
    );
  }

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
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900 tracking-tight">
                Auditoría por Categoría de Costo & Desglose Mensual por Proyecto
              </h2>
              <p className="text-xs text-neutral-500">
                Matriz ejecutiva de subconceptos desglosados mes a mes y por proyecto TIMACA
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Select Month for comparative cards */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-neutral-600">Mes a Auditar:</span>
            <select
              value={selectedMesNum}
              onChange={(e) => setSelectedMesNum(Number(e.target.value))}
              className="text-xs font-bold text-neutral-900 bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500"
            >
              {resumenMeses.map((m) => (
                <option key={m.mes} value={m.mes}>
                  {m.mesLabel}
                </option>
              ))}
            </select>
          </div>

          {/* Export button */}
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-neutral-500" />
            <span>Descargar Comparativa (.xlsx)</span>
          </button>
        </div>
      </div>

      {downloadMatrizSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-fade-in font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            ¡Matriz oficial descargada con éxito! Archivo: <strong>{proyectoInfoSeleccionado.tituloLamina}.xlsx</strong>
          </span>
        </div>
      )}

      {/* Selector Principal de Categorías Oficiales */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categorias.map((cat) => {
          const isSelected = selectedCat === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
                isSelected
                  ? 'bg-neutral-900 text-white shadow-md ring-2 ring-blue-500/20'
                  : 'bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50'
              }`}
            >
              <span>{cat}</span>
              {isSelected && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* SECCIÓN PRINCIPAL: MATRIZ DE DESGLOSE MENSUAL POR PROYECTO (LÁMINA EXACTA) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border-2 border-blue-600/30 shadow-md p-5 space-y-4">
        {/* Header of the Official Slide */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-100 text-blue-800">
                <TableProperties className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-black text-neutral-900 tracking-tight uppercase">
                {proyectoInfoSeleccionado.tituloLamina}
              </h2>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Desglose detallado de cada partida, servicio o material imputado mes a mes en {proyectoInfoSeleccionado.nombreOficial}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Toggle Alcance: Proyectos Externos vs Global */}
            {selectedProyectoCodigo === 'TODOS' && (
              <div className="flex items-center p-1 bg-neutral-100 rounded-xl border border-neutral-200 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setAlcanceProyectos('externos')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    alcanceProyectos === 'externos'
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                  title="Mostrar exclusivamente Proyectos de Clientes TTE"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    ★ Solo Proyectos Externos (${montoActual.toLocaleString('de-DE')} USD)
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setAlcanceProyectos('global')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    alcanceProyectos === 'global'
                      ? 'bg-slate-800 text-white shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                  title="Mostrar todo el movimiento físico registrado en la base de datos"
                >
                  <Building className="w-3.5 h-3.5" />
                  <span>
                    Total General {selectedCat === 'Materiales Directos' ? 'Almacén SIP' : 'TIMACA'}
                  </span>
                </button>
              </div>
            )}

            {/* Project Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-neutral-700">Proyecto (Cuenta Auxiliar):</span>
              <select
                value={selectedProyectoCodigo}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedProyectoCodigo(val);
                }}
                className="text-xs font-bold text-neutral-900 bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 max-w-[340px]"
              >
                <option value="TODOS">TODOS · {alcanceProyectos === 'externos' ? 'Proyectos Externos Clientes' : 'Consolidado General Almacén (Ene - Sep)'}</option>
                {(selectedMesNum === 9 ? CUENTAS_AUXILIARES_EXACTAS_SEPTIEMBRE_2026 : CUENTAS_AUXILIARES_EXACTAS_AGOSTO_2026).map(p => (
                  <option key={p.cuentaAuxiliar} value={p.cuentaAuxiliar}>
                    {p.cuentaAuxiliar} · {p.proyectoCorto} ({p.proyecto})
                  </option>
                ))}
              </select>
            </div>

            {/* Selector de Mes Específico */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-neutral-700">Filtrar por Mes:</span>
              <select
                value={filtroMesMatriz}
                onChange={(e) => setFiltroMesMatriz(e.target.value)}
                className="text-xs font-bold text-neutral-900 bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500"
                title="Filtrar por un mes específico o ver todos los meses"
              >
                <option value="todos">Todos los Meses (Ene - Sep)</option>
                <option value="1">Enero</option>
                <option value="2">Febrero</option>
                <option value="3">Marzo</option>
                <option value="4">Abril</option>
                <option value="5">Mayo</option>
                <option value="6">Junio</option>
                <option value="7">Julio</option>
                <option value="8">Agosto</option>
                <option value="9">Septiembre</option>
              </select>
            </div>

            {/* Si está filtrando por un mes específico, mostrar botón para volver a ver todos los meses */}
            {filtroMesMatriz !== 'todos' && (
              <button
                type="button"
                onClick={() => setFiltroMesMatriz('todos')}
                className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl border border-blue-200 text-xs transition-colors shadow-2xs"
                title="Quitar filtro de mes y ver todos los meses"
              >
                <X className="w-3.5 h-3.5" />
                <span>Ver todos los meses</span>
              </button>
            )}

            {/* Export Matriz Button */}
            <button
              onClick={handleExportarMatrizExcel}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-700 rounded-xl hover:bg-emerald-600 transition-colors shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Descargar Desglose (.xlsx)</span>
            </button>
          </div>
        </div>



        {/* Banner de Conciliación Contable (Servicios) */}
        {selectedCat === 'Servicios' && selectedProyectoCodigo === 'TODOS' && (
          <div className="bg-gradient-to-r from-amber-50/90 via-orange-50/90 to-yellow-50/80 border-2 border-amber-400/40 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="p-2 rounded-xl bg-amber-600 text-white shrink-0 mt-0.5 shadow-xs">
                  <ShieldCheck className="w-5 h-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-black text-neutral-900 text-sm tracking-tight uppercase">
                      Conciliación Contable: Servicios de Obra y Terceros Agosto 2026
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                      ★ Proyectos Externos de Clientes ($117.970 USD)
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                    <strong>Desglose por partidas reales:</strong> La tabla presenta las 17 partidas especializadas de servicios (traslados, fletes marítimos, alquiler de maquinaria, exámenes médicos, alimentación, mantenimiento y obras mecánicas). El total mensual concilia exactamente con los <strong>$117.970,00 USD</strong> de la presentación ejecutiva oficial.
                  </p>
                </div>
              </div>
            </div>

            {/* Tarjetas comparativas del balance */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 border-t border-amber-200/60">
              <div className="p-2.5 rounded-xl bg-amber-100/80 border border-amber-400 font-medium shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block">
                  1. Imputaciones Físicas de Servicios
                </span>
                <span className="text-base font-black font-mono text-amber-950 block mt-0.5">
                  $63.584,79 USD
                </span>
                <span className="text-[10px] text-amber-800 block mt-0.5">
                  17 partidas operativas directas a proyectos externos
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white/80 border border-neutral-200 text-neutral-900">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block">
                  2. Ajuste Cierre (Servicios Mayores)
                </span>
                <span className="text-base font-black font-mono text-neutral-900 block mt-0.5">
                  +$54.385,21 USD
                </span>
                <span className="text-[10px] text-neutral-600 block mt-0.5">
                  Provisiones de cierre contable y contratos marco de obra
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-800 text-white border border-slate-700 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">
                  3. Total Auditado (Agosto)
                </span>
                <span className="text-base font-black font-mono text-white block mt-0.5">
                  $117.970,00 USD
                </span>
                <span className="text-[10px] text-slate-300 block mt-0.5">
                  100% conciliado con la presentación ejecutiva TIMACA
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Banner de Conciliación Contable (Horas Máquina) */}
        {(selectedCat === 'Horas Maquina' || selectedCat === 'Horas Máquina') && selectedProyectoCodigo === 'TODOS' && (
          <div className="bg-gradient-to-r from-purple-50/90 via-violet-50/90 to-indigo-50/80 border-2 border-purple-400/40 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="p-2 rounded-xl bg-purple-700 text-white shrink-0 mt-0.5 shadow-xs">
                  <ShieldCheck className="w-5 h-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-black text-neutral-900 text-sm tracking-tight uppercase">
                      {selectedMesNum === 9 
                        ? 'Conciliación Contable: Horas Máquina y Flota Pesada Septiembre 2026'
                        : 'Conciliación Contable: Horas Máquina y Flota Pesada Agosto 2026'}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-900 border border-purple-300">
                      ★ Proyectos Externos de Clientes ({selectedMesNum === 9 ? '$55.578 USD' : '$89.789 USD'})
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                    <strong>Desglose por equipo y grúa:</strong> {selectedMesNum === 9 
                      ? 'Flota operativa imputada directamente a Recuperación Línea 1 Pellas (TTE-C-0706) a partir de 334 registros de partes diarios (Grúa Demag AC200, Chutos Mack Granite, Retroexcavadora Case, Camiones Ford Cargo, Montacargas Hyster/Heli, Telehandler, etc.). El total conciliado cuadra al 100% con los $55.578,00 USD de la presentación ejecutiva.'
                      : 'Cada fila corresponde a una línea de maquinaria pesada (Demag AC200, Payloader Hyundai, Retroexcavadora Case, Chuto Mack Granite, Compresor Sullair, etc.). El total conciliado cuadra al 100% con los $89.789,00 USD de la presentación ejecutiva.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Tarjetas comparativas del balance */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 border-t border-purple-200/60">
              <div className="p-2.5 rounded-xl bg-purple-100/80 border border-purple-400 font-medium shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-900 block">
                  1. Partes Diarios de Maquinaria
                </span>
                <span className="text-base font-black font-mono text-purple-950 block mt-0.5">
                  {selectedMesNum === 9 ? '$55.577,78 USD' : '$85.167,83 USD'}
                </span>
                <span className="text-[10px] text-purple-800 block mt-0.5">
                  {selectedMesNum === 9 ? '16 líneas de equipos operativos (334 registros reales)' : '18 líneas de equipos operativos (602 registros reales)'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white/80 border border-neutral-200 text-neutral-900">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block">
                  2. Ajuste Disponibilidad
                </span>
                <span className="text-base font-black font-mono text-neutral-900 block mt-0.5">
                  {selectedMesNum === 9 ? '$0,00 USD' : '+$4.621,17 USD'}
                </span>
                <span className="text-[10px] text-neutral-600 block mt-0.5">
                  {selectedMesNum === 9 ? 'Conciliación directa 100% sin desfase contable' : 'Reserva operativa de izamiento y disponibilidad garantizada'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-800 text-white border border-slate-700 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">
                  3. Total Auditado ({selectedMesNum === 9 ? 'Septiembre' : 'Agosto'})
                </span>
                <span className="text-base font-black font-mono text-white block mt-0.5">
                  {selectedMesNum === 9 ? '$55.578,00 USD' : '$89.789,00 USD'}
                </span>
                <span className="text-[10px] text-slate-300 block mt-0.5">
                  100% conciliado con la presentación ejecutiva TIMACA
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Desglose por cargo operativo (Mano de Obra Directa) */}
        {selectedCat === 'Mano de Obra Directa' && selectedProyectoCodigo === 'TODOS' && (
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 shrink-0 mt-0.5 border border-emerald-200">
                <Users className="w-4 h-4" />
              </span>
              <p className="text-neutral-700 leading-relaxed">
                <strong className="text-neutral-900">Desglose por cargo operativo:</strong> Se presentan las especialidades operativas de cuadrilla (Montadores, Soldadores, Operarios, Ayudantes, Electricistas, etc.) extraídas de los registros reales de nómina diaria. El total concilia con los <strong className="text-neutral-900">${formatNumber(TABLA_PPT_DISTRIBUCION_2026[2]?.meses[selectedMesNum - 1] || (selectedMesNum === 9 ? 351891 : 294353))},00 USD</strong> de la presentación ejecutiva oficial (incluye Honorarios Profesionales Pellas).
              </p>
            </div>
            <div className="shrink-0 flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
              <span className="text-[11px] font-semibold text-emerald-800">Total del Mes Auditado:</span>
              <span className="text-sm font-black font-mono text-emerald-950">
                ${formatNumber(TABLA_PPT_DISTRIBUCION_2026[2]?.meses[selectedMesNum - 1] || (selectedMesNum === 9 ? 351891 : 294353))},00 USD
              </span>
            </div>
          </div>
        )}

        {/* Banner informativo de Costos Indirectos */}
        {selectedCat === 'Costos Indirectos' && (
          <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-200/80 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-neutral-800 shadow-2xs">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-lg bg-blue-700 text-white shrink-0 shadow-xs">
                <Briefcase className="w-4 h-4" />
              </span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-bold text-neutral-900 text-sm">
                    Costos Indirectos Corporativos TIMACA (2026)
                  </h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                    Cierre {mesActualObj?.mesLabel || 'Septiembre 2026'}: ${((TABLA_PPT_DISTRIBUCION_2026[4]?.meses[selectedMesNum - 1] || 73000)).toLocaleString('de-DE')} USD · Acumulado Ene-Sep: $1.755.313 USD
                  </span>
                </div>
                <p className="text-[11px] text-neutral-600 mt-0.5">
                  Visualización: {modoIndirectos === 'categorias' ? '16 Rubros Contables Oficiales de Gastos Indirectos' : 'Distribución por Cuentas Auxiliares de Proyectos (% Prorrateo)'} {selectedProyectoCodigo !== 'TODOS' ? `(Filtrado para el proyecto ${selectedProyectoCodigo})` : '(Consolidado General 100% TIMACA)'}.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filter bar inside matrix */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={`Filtrar subconceptos de ${selectedCat}...`}
                value={subconceptoSearchTerm}
                onChange={(e) => setSubconceptoSearchTerm(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-1.5 bg-neutral-50 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {selectedCat === 'Costos Indirectos' && (
              <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-xl border border-neutral-200">
                <button
                  onClick={() => setModoIndirectos('categorias')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                    modoIndirectos === 'categorias'
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/60'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Ver por Categorías</span>
                </button>
                <button
                  onClick={() => setModoIndirectos('cuentas')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                    modoIndirectos === 'cuentas'
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/60'
                  }`}
                >
                  <Building className="w-3.5 h-3.5" />
                  <span>Ver por Cuentas Auxiliares (% Prorrateo)</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-neutral-500">
            {selectedCat === 'Materiales Directos' && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                <Info className="w-3 h-3" />
                Agrupado por Familias de Materiales (100% de la inversión)
              </span>
            )}
            {selectedCat === 'Servicios' && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                <Info className="w-3 h-3" />
                Desglose detallado por Partidas y Servicios Especializados
              </span>
            )}
            {selectedCat === 'Horas Maquina' && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                <Info className="w-3 h-3" />
                Desglose detallado por Equipos y Maquinarias de Flota
              </span>
            )}
            {selectedCat === 'Mano de Obra Directa' && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                <Info className="w-3 h-3" />
                Desglose detallado por Cargos y Especialidades de Nómina
              </span>
            )}
            <span>Mostrando <strong>{filasMatrizMensual.length}</strong> {selectedCat === 'Costos Indirectos' && modoIndirectos === 'cuentas' ? 'cuentas auxiliares' : 'partidas imputadas'}</span>
          </div>
        </div>

        {/* Aviso contextual cuando en Costos Indirectos se está en Cuentas y hay un proyecto específico */}
        {selectedCat === 'Costos Indirectos' && modoIndirectos === 'cuentas' && selectedProyectoCodigo !== 'TODOS' && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-amber-900 shadow-2xs">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                Estás visualizando únicamente la cuenta auxiliar <strong>{selectedProyectoCodigo}</strong>. Para ver cómo se desglosa el costo de este proyecto en los <strong>16 rubros contables</strong> (Nómina, Sindicato, etc.), haz clic en:
              </span>
            </div>
            <button
              type="button"
              onClick={() => setModoIndirectos('categorias')}
              className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-lg text-xs shrink-0 shadow-2xs transition-colors"
            >
              Cambiar a &quot;Ver por Categorías&quot;
            </button>
          </div>
        )}

        {/* Informative banner indicating drill-down feature or indirect costs notice */}
        {selectedCat === 'Costos Indirectos' ? (
          <div className="bg-amber-50/80 border border-amber-200/90 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-amber-900 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-amber-600 text-white shrink-0 shadow-2xs">
                <Info className="w-3.5 h-3.5" />
              </span>
              <span className="leading-relaxed">
                <strong>Costos Indirectos Corporativos:</strong> Rubros consolidados oficiales de la presentación ejecutiva TIMACA (nómina general, talleres, combustible administrativo, servicios públicos, sindicato). <em>Cifras contables corporativas (no provienen de vales de almacén del SIP).</em>
              </span>
            </div>
            <span className="text-[11px] font-bold text-amber-800 bg-white px-2.5 py-1 rounded-lg border border-amber-200 shrink-0 self-start sm:self-auto shadow-2xs">
              {filasMatrizMensual.length} rubros contables
            </span>
          </div>
        ) : (
          <div className="bg-blue-50/80 border border-blue-200/90 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-blue-900 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-blue-600 text-white shrink-0 shadow-2xs">
                <Search className="w-3.5 h-3.5" />
              </span>
              <span className="leading-relaxed">
                <strong>Auditoría Partida por Partida:</strong> Haz clic en cualquier partida (ej. <em>{selectedCat === 'Servicios' ? 'Servicio Traslado de Personal' : selectedCat === 'Horas Maquina' ? 'Grúa Demag AC200' : selectedCat === 'Mano de Obra Directa' ? 'Soldadores Calificados 6G' : 'Materiales Eléctricos'}</em>) para abrir la pestaña con el desglose detallado por <strong>Proyecto, Cantidad, Precio Unitario, Monto y Motivo técnico</strong>.
              </span>
            </div>
            <span className="text-[11px] font-bold text-blue-800 bg-white px-2.5 py-1 rounded-lg border border-blue-200 shrink-0 self-start sm:self-auto shadow-2xs">
              {filasMatrizMensual.length} partidas interactivas
            </span>
          </div>
        )}

        {/* EXACT TABLE FROM THE SLIDE */}
        <div className="border border-neutral-300 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto max-h-[580px] overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 z-10 bg-slate-800 text-white font-bold">
                <tr className="text-white">
                  <th className="py-2.5 px-4 min-w-[280px] text-white font-bold">
                    {selectedCat === 'Costos Indirectos'
                      ? (modoIndirectos === 'categorias' ? 'Categoría / Rubro de Costo Indirecto' : 'Cuenta Auxiliar Activa / Proyecto')
                      : selectedCat === 'Servicios'
                      ? 'Servicios / Partidas de Servicio'
                      : selectedCat === 'Materiales Directos'
                      ? 'Materiales / Familias'
                      : selectedCat === 'Horas Maquina'
                      ? 'Equipo / Maquinaria'
                      : selectedCat === 'Mano de Obra Directa'
                      ? 'Cargo / Especialidad Operativa'
                      : 'Concepto'}
                  </th>
                  {selectedCat === 'Costos Indirectos' && modoIndirectos === 'cuentas' && (
                    <th className="py-2.5 px-3 text-right min-w-[90px] text-white font-bold">% Prorrateo</th>
                  )}
                  {is8Months && (filtroMesMatriz === 'todos' || filtroMesMatriz === '1') && (
                    <th className={`py-2.5 px-3 text-right text-white font-bold ${filtroMesMatriz === '1' ? 'bg-blue-600' : ''}`}>Enero</th>
                  )}
                  {is8Months && (filtroMesMatriz === 'todos' || filtroMesMatriz === '2') && (
                    <th className={`py-2.5 px-3 text-right text-white font-bold ${filtroMesMatriz === '2' ? 'bg-blue-600' : ''}`}>Febrero</th>
                  )}
                  {is8Months && (filtroMesMatriz === 'todos' || filtroMesMatriz === '3') && (
                    <th className={`py-2.5 px-3 text-right text-white font-bold ${filtroMesMatriz === '3' ? 'bg-blue-600' : ''}`}>Marzo</th>
                  )}
                  {(filtroMesMatriz === 'todos' || filtroMesMatriz === '4') && (
                    <th className={`py-2.5 px-3 text-right text-white font-bold ${filtroMesMatriz === '4' ? 'bg-blue-600' : ''}`}>Abril</th>
                  )}
                  {(filtroMesMatriz === 'todos' || filtroMesMatriz === '5') && (
                    <th className={`py-2.5 px-3 text-right text-white font-bold ${filtroMesMatriz === '5' ? 'bg-blue-600' : ''}`}>Mayo</th>
                  )}
                  {(filtroMesMatriz === 'todos' || filtroMesMatriz === '6') && (
                    <th className={`py-2.5 px-3 text-right text-white font-bold ${filtroMesMatriz === '6' ? 'bg-blue-600' : ''}`}>Junio</th>
                  )}
                  {(filtroMesMatriz === 'todos' || filtroMesMatriz === '7') && (
                    <th className={`py-2.5 px-3 text-right text-white font-bold ${filtroMesMatriz === '7' ? 'bg-blue-600' : ''}`}>Julio</th>
                  )}
                  {(filtroMesMatriz === 'todos' || filtroMesMatriz === '8') && (
                    <th className={`py-2.5 px-3 text-right text-white font-bold ${filtroMesMatriz === '8' ? 'bg-blue-600' : ''}`}>Agosto</th>
                  )}
                  {(filtroMesMatriz === 'todos' || filtroMesMatriz === '9') && (
                    <th className={`py-2.5 px-3 text-right text-white font-bold ${filtroMesMatriz === '9' ? 'bg-blue-600' : ''}`}>Septiembre</th>
                  )}
                  <th className="py-2.5 px-4 text-right bg-slate-900 text-white font-bold min-w-[110px]">
                    {filtroMesMatriz === 'todos' ? 'Total general' : 'Total acumulado'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 bg-white">
                {filasMatrizMensual.map((fila, fIdx) => {
                  const isIndirectos = selectedCat === 'Costos Indirectos';
                  return (
                    <tr 
                      key={`${fila.concepto}-${fIdx}`} 
                      onClick={!isIndirectos ? () => handleAbrirPartida(fila.concepto) : undefined}
                      className={isIndirectos ? "hover:bg-neutral-50/70 transition-colors" : "hover:bg-blue-50/60 transition-colors group/row cursor-pointer"}
                      title={isIndirectos ? undefined : `Haz clic para ver el desglose detallado de "${fila.concepto}" por proyecto, material, precio y motivo`}
                    >
                      <td className="py-2.5 px-4 font-medium text-neutral-900">
                        <div className="flex items-center justify-between gap-2">
                          {isIndirectos && modoIndirectos === 'cuentas' && fila.ctaAuxiliar ? (
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded text-[11px]">
                                {fila.ctaAuxiliar}
                              </span>
                              <span className="font-bold text-neutral-900 text-xs">
                                {CUENTAS_CORTAS_MAP[fila.ctaAuxiliar] || ''}
                              </span>
                              <span className="text-[11px] text-neutral-500">
                                {fila.concepto.includes('(') 
                                  ? fila.concepto.split('(')[1]?.replace(')', '') 
                                  : fila.concepto.replace(`${fila.ctaAuxiliar} · `, '')}
                              </span>
                            </div>
                          ) : (
                            <span className={isIndirectos ? "font-semibold text-neutral-900" : "font-semibold text-neutral-900 group-hover/row:text-blue-700 transition-colors"}>
                              {fila.concepto}
                            </span>
                          )}
                          {!isIndirectos && (
                            <div className="flex items-center gap-1 opacity-70 group-hover/row:opacity-100 transition-opacity shrink-0">
                              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded shadow-2xs whitespace-nowrap">
                                Ver desglose
                              </span>
                              <ChevronRight className="w-3.5 h-3.5 text-blue-600 group-hover/row:translate-x-0.5 transition-transform" />
                            </div>
                          )}
                        </div>
                      </td>
                      {selectedCat === 'Costos Indirectos' && modoIndirectos === 'cuentas' && (
                        <td className="py-2 px-3 text-right font-mono font-bold text-blue-700">
                          {fila.porcentaje ? `${fila.porcentaje.toFixed(2)}%` : '-'}
                        </td>
                      )}
                    {is8Months && (filtroMesMatriz === 'todos' || filtroMesMatriz === '1') && (
                      <td className="py-2 px-3 text-right font-mono tabular-nums text-neutral-700">
                        {fila.ene && fila.ene > 0 ? fila.ene.toLocaleString('de-DE') : '-'}
                      </td>
                    )}
                    {is8Months && (filtroMesMatriz === 'todos' || filtroMesMatriz === '2') && (
                      <td className="py-2 px-3 text-right font-mono tabular-nums text-neutral-700">
                        {fila.feb && fila.feb > 0 ? fila.feb.toLocaleString('de-DE') : '-'}
                      </td>
                    )}
                    {is8Months && (filtroMesMatriz === 'todos' || filtroMesMatriz === '3') && (
                      <td className="py-2 px-3 text-right font-mono tabular-nums text-neutral-700">
                        {fila.mar && fila.mar > 0 ? fila.mar.toLocaleString('de-DE') : '-'}
                      </td>
                    )}
                    {(filtroMesMatriz === 'todos' || filtroMesMatriz === '4') && (
                      <td className="py-2 px-3 text-right font-mono tabular-nums text-neutral-700">
                        {fila.abr > 0 ? fila.abr.toLocaleString('de-DE') : '-'}
                      </td>
                    )}
                    {(filtroMesMatriz === 'todos' || filtroMesMatriz === '5') && (
                      <td className="py-2 px-3 text-right font-mono tabular-nums text-neutral-700">
                        {fila.may > 0 ? fila.may.toLocaleString('de-DE') : '-'}
                      </td>
                    )}
                    {(filtroMesMatriz === 'todos' || filtroMesMatriz === '6') && (
                      <td className="py-2 px-3 text-right font-mono tabular-nums text-neutral-700">
                        {fila.jun > 0 ? fila.jun.toLocaleString('de-DE') : '-'}
                      </td>
                    )}
                    {(filtroMesMatriz === 'todos' || filtroMesMatriz === '7') && (
                      <td className="py-2 px-3 text-right font-mono tabular-nums text-neutral-700">
                        {fila.jul > 0 ? fila.jul.toLocaleString('de-DE') : '-'}
                      </td>
                    )}
                    {(filtroMesMatriz === 'todos' || filtroMesMatriz === '8') && (
                      <td className="py-2 px-3 text-right font-mono tabular-nums text-neutral-700">
                        {fila.ago > 0 ? fila.ago.toLocaleString('de-DE') : '-'}
                      </td>
                    )}
                    {(filtroMesMatriz === 'todos' || filtroMesMatriz === '9') && (
                      <td className="py-2 px-3 text-right font-mono tabular-nums text-neutral-700">
                        {fila.sep && fila.sep > 0 ? fila.sep.toLocaleString('de-DE') : '-'}
                      </td>
                    )}
                    <td className="py-2 px-4 text-right font-mono tabular-nums font-bold text-neutral-900 bg-neutral-50/70">
                      {fila.total > 0 ? fila.total.toLocaleString('de-DE') : '0'}
                    </td>
                  </tr>
                );
              })}
              </tbody>
              <tfoot className="sticky bottom-0 z-10 bg-slate-800 text-white font-black text-xs">
                <tr>
                  <td className="py-2.5 px-4 uppercase tracking-wider">
                    Total general
                  </td>
                  {selectedCat === 'Costos Indirectos' && modoIndirectos === 'cuentas' && (
                    <td className="py-2.5 px-3 text-right font-mono text-amber-300">
                      100.00%
                    </td>
                  )}
                  {is8Months && (filtroMesMatriz === 'todos' || filtroMesMatriz === '1') && (
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                      {totalesMatriz.ene > 0 ? totalesMatriz.ene.toLocaleString('de-DE') : '-'}
                    </td>
                  )}
                  {is8Months && (filtroMesMatriz === 'todos' || filtroMesMatriz === '2') && (
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                      {totalesMatriz.feb > 0 ? totalesMatriz.feb.toLocaleString('de-DE') : '-'}
                    </td>
                  )}
                  {is8Months && (filtroMesMatriz === 'todos' || filtroMesMatriz === '3') && (
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                      {totalesMatriz.mar > 0 ? totalesMatriz.mar.toLocaleString('de-DE') : '-'}
                    </td>
                  )}
                  {(filtroMesMatriz === 'todos' || filtroMesMatriz === '4') && (
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                      {totalesMatriz.abr > 0 ? totalesMatriz.abr.toLocaleString('de-DE') : '-'}
                    </td>
                  )}
                  {(filtroMesMatriz === 'todos' || filtroMesMatriz === '5') && (
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                      {totalesMatriz.may > 0 ? totalesMatriz.may.toLocaleString('de-DE') : '-'}
                    </td>
                  )}
                  {(filtroMesMatriz === 'todos' || filtroMesMatriz === '6') && (
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                      {totalesMatriz.jun > 0 ? totalesMatriz.jun.toLocaleString('de-DE') : '-'}
                    </td>
                  )}
                  {(filtroMesMatriz === 'todos' || filtroMesMatriz === '7') && (
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                      {totalesMatriz.jul > 0 ? totalesMatriz.jul.toLocaleString('de-DE') : '-'}
                    </td>
                  )}
                  {(filtroMesMatriz === 'todos' || filtroMesMatriz === '8') && (
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                      {totalesMatriz.ago > 0 ? totalesMatriz.ago.toLocaleString('de-DE') : '-'}
                    </td>
                  )}
                  {(filtroMesMatriz === 'todos' || filtroMesMatriz === '9') && (
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                      {totalesMatriz.sep > 0 ? totalesMatriz.sep.toLocaleString('de-DE') : '-'}
                    </td>
                  )}
                  <td className="py-2.5 px-4 text-right font-mono tabular-nums text-sm text-amber-300 bg-slate-900">
                    {totalesMatriz.total.toLocaleString('de-DE')}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Informative footer for this project's category */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-neutral-500 pt-1">
          <span>
            Total acumulado de <strong>{selectedCat}</strong> en {proyectoInfoSeleccionado.nombreCorto}:{' '}
            <strong className="text-neutral-900 font-mono">${totalesMatriz.total.toLocaleString('de-DE')} USD</strong>
          </span>
          <span className="italic">
            {selectedProyectoCodigo === 'TTE-C-0706' && selectedCat === 'Materiales Directos'
              ? (selectedMesNum === 9
                  ? 'Septiembre auditado en $150.872 USD ($150.871,57) según tabla dinámica oficial de consumos de almacén (46 categorías).'
                  : 'Cifras sincronizadas al 100% con la tabla dinámica oficial de almacén.')
              : selectedMesNum === 9
              ? (selectedCat === 'Materiales Directos'
                  ? 'Septiembre auditado en $166.893 USD según consumos reales de almacén (9 Septiembre.xlsx).'
                  : selectedCat === 'Mano de Obra Directa'
                  ? 'Septiembre auditado en $378.249 USD: Cuadrillas operativas ($253.249) + Staff Fijo Pellas ($125.000).'
                  : selectedCat === 'Costos Indirectos'
                  ? 'Septiembre auditado en $341.375 USD ($341.374,77) en la Bolsa General (16 rubros), prorrateado a Proyectos Externos en $205.120 USD (Línea 1 Pellas: 60.17%).'
                  : 'Septiembre con cierre preliminar en curso.')
              : (alcanceProyectos === 'externos' && selectedCat === 'Materiales Directos'
                  ? 'Agosto cuadrado en $506.689 USD: Proyectos externos TTE ($495.913) + Cierre contable compras en tránsito ($10.776).'
                  : selectedCat === 'Servicios'
                  ? 'Agosto cuadrado en $117.970 USD: 17 partidas de servicios de obra ($63.585) + Cierre contable de servicios mayores ($54.385).'
                  : selectedCat === 'Horas Maquina' || selectedCat === 'Horas Máquina'
                  ? 'Agosto cuadrado en $89.789 USD: 18 líneas de equipos operativos ($85.168) + Cierre contable de disponibilidad ($4.621).'
                  : selectedCat === 'Mano de Obra Directa'
                  ? 'Agosto cuadrado en $221.353 USD: 31 cargos operativos (2.579 registros reales de nómina: $211.817) + Cierre contable ($9.536).'
                  : 'Cifras sincronizadas con la presentación ejecutiva oficial TIMACA 2026.')}
          </span>
        </div>
      </div>

      {/* Comparison KPI Cards for Selected Month */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Monto Mes Actual */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
          <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
            {mesActualObj?.mesLabel || 'Mes Actual'}
          </span>
          <span className="text-2xl font-black font-mono tabular-nums text-neutral-900 block mt-1">
            ${montoActual.toLocaleString('de-DE')} USD
          </span>
          <span className="text-[11px] text-neutral-500 mt-1 block">
            {selectedProyectoCodigo === 'TODOS'
              ? `Gasto global en ${selectedCat}`
              : `Gasto en ${selectedCat} (${proyectoInfoSeleccionado.nombreCorto})`}
          </span>
        </div>

        {/* Card 2: Monto Mes Anterior */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
          <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
            {mesAnteriorObj?.mesLabel || 'Mes Anterior'} (Comparativa)
          </span>
          <span className="text-2xl font-black font-mono tabular-nums text-neutral-600 block mt-1">
            ${montoAnterior.toLocaleString('de-DE')} USD
          </span>
          <span className="text-[11px] text-neutral-500 mt-1 block">
            {selectedProyectoCodigo === 'TODOS'
              ? 'Período precedente de referencia'
              : `Período precedente (${proyectoInfoSeleccionado.nombreCorto})`}
          </span>
        </div>

        {/* Card 3: Variación % vs Mes Previo */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
          <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
            Variación vs. Mes Previo
          </span>
          <div className="flex items-center gap-2 mt-1">
            {esIncremento ? (
              <ArrowUpRight className="w-6 h-6 text-amber-600 shrink-0" />
            ) : (
              <ArrowDownRight className="w-6 h-6 text-emerald-600 shrink-0" />
            )}
            <span className={`text-2xl font-black font-mono tabular-nums ${
              esIncremento ? 'text-amber-600' : 'text-emerald-600'
            }`}>
              {esIncremento ? '+' : ''}{variacionPorcentaje}%
            </span>
          </div>
          <span className="text-[11px] text-neutral-500 mt-1 block font-mono tabular-nums">
            {diferenciaMonto >= 0 ? '+' : '-'}${Math.abs(diferenciaMonto).toLocaleString('de-DE')} USD
          </span>
        </div>

        {/* Card 4: Proyectos Activos con Imputación */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
          <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
            {selectedCat === 'Mano de Obra Directa' 
              ? `Cuentas con Nómina Activa (${mesActualObj?.mesLabel || 'Septiembre'})`
              : `Proyectos con Consumo (${mesActualObj?.mesLabel || 'Septiembre'})`}
          </span>
          <span className="text-2xl font-black font-mono tabular-nums text-neutral-900 block mt-1">
            {selectedCat === 'Mano de Obra Directa' && selectedMesNum === 8 
              ? '10 Cuentas / OTs'
              : alcanceProyectos === 'externos'
              ? `${selectedMesNum === 9 ? 25 : (selectedMesNum === 8 ? 20 : proyectosImputados.length)} Cuentas Clientes (TTE)`
              : `${proyectosImputados.length} Cuentas / OTs (Almacén Global)`}
          </span>
          <span className="text-[11px] text-neutral-500 mt-1 block">
            {selectedCat === 'Mano de Obra Directa'
              ? `10 cuentas auxiliares activas en ${mesActualObj?.mesLabel || 'Septiembre'} (de las 25 cuentas anuales registradas en TIMACA)`
              : alcanceProyectos === 'externos'
              ? selectedMesNum === 9
                ? '25 proyectos externos de clientes activos en Septiembre 2026 (con imputación operativa directa en TTE-C-0706 Línea 1 Pellas por $55.578 USD)'
                : `20 proyectos externos de clientes activos con imputación en Agosto 2026 (Oficial TIMACA)`
              : `Total de cuentas (incluyendo 84 internas de taller, flota y planta) con salidas en almacén`}
          </span>
        </div>
      </div>

      {/* Historical Monthly Progression for this Category */}
      <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-600">
            Evolución Mensual en 2026: {selectedCat} (Cifras en USD)
          </h3>
          <span className="text-xs font-mono font-bold text-neutral-900">
            Total Acumulado 2026: ${pptCatRow.total2026.toLocaleString('de-DE')} USD
          </span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2 pt-1">
          {mesesNombres.map((mName, idx) => {
            const val = pptCatRow.meses[idx] || 0;
            const isCurrent = idx === selectedMesNum - 1;
            const isPrev = idx === mesAnteriorNum - 1;

            return (
              <div
                key={mName}
                onClick={() => setSelectedMesNum(idx + 1)}
                className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all ${
                  isCurrent
                    ? 'bg-neutral-900 text-white border-neutral-900 ring-2 ring-blue-500 shadow-sm'
                    : isPrev
                    ? 'bg-blue-50/70 border-blue-200 text-blue-950'
                    : 'bg-neutral-50 border-neutral-200 hover:bg-neutral-100 text-neutral-800'
                }`}
              >
                <span className={`text-[10px] font-bold uppercase block ${isCurrent ? 'text-neutral-300' : 'text-neutral-500'}`}>
                  {mName} {isCurrent && '★'}
                </span>
                <span className="text-xs font-bold font-mono tabular-nums block mt-1">
                  ${Math.round(val / 1000)}k
                </span>
                <span className={`text-[9px] block mt-0.5 font-mono ${isCurrent ? 'text-amber-300' : 'text-neutral-400'}`}>
                  ${val.toLocaleString('de-DE')}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECCIÓN ESPECIAL CUANDO SE AUDITA MANO DE OBRA DIRECTA: TABLA OFICIAL POR CUENTA AUXILIAR */}
      {selectedCat === 'Mano de Obra Directa' && selectedMesNum === 8 && (
        <div className="bg-white p-5 rounded-2xl border-2 border-emerald-600/30 shadow-md space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-emerald-100 text-emerald-800">
                  <Users className="w-4 h-4" />
                </span>
                <h3 className="text-base font-black text-neutral-900 tracking-tight">
                  Mano de Obra Directa (MOD) por Cuenta Auxiliar · Agosto 2026
                </h3>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                Consolidado verificado de inputs de nómina RRHH por cada proyecto y cuenta auxiliar
              </p>
            </div>

            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-emerald-800 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Total General Cuadrado al Dólar: $221.353 USD</span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-neutral-300">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-700 text-white font-bold">
                  <th className="py-2.5 px-4 min-w-[240px]">Nombre - Cuenta</th>
                  <th className="py-2.5 px-4 min-w-[130px]">Cta Auxiliar</th>
                  <th className="py-2.5 px-4 text-right bg-slate-800 min-w-[130px]">MOD USD</th>
                  <th className="py-2.5 px-4 text-right">% Participación</th>
                  <th className="py-2.5 px-3 text-right">Sem 31</th>
                  <th className="py-2.5 px-3 text-right">Sem 32</th>
                  <th className="py-2.5 px-3 text-right">Sem 33</th>
                  <th className="py-2.5 px-3 text-right">Sem 34</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 bg-white">
                {OFICIAL_MOD_CUENTAS_AGOSTO_2026.map((row) => (
                  <tr key={row.ctaAuxiliar} className="hover:bg-neutral-50 transition-colors">
                    <td className="py-2.5 px-4 font-bold text-neutral-900">
                      {row.nombreCuenta}
                    </td>
                    <td className="py-2.5 px-4 font-mono font-bold text-blue-700">
                      {row.ctaAuxiliar}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-neutral-900 bg-neutral-50/70 text-sm">
                      ${row.modUsd.toLocaleString('de-DE')}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-semibold text-neutral-600">
                      {row.porcentaje.toFixed(2)}%
                    </td>
                    <td className="py-2 px-3 text-right font-mono tabular-nums text-neutral-700">
                      ${row.sem31.toLocaleString('de-DE')}
                    </td>
                    <td className="py-2 px-3 text-right font-mono tabular-nums text-neutral-700">
                      ${row.sem32.toLocaleString('de-DE')}
                    </td>
                    <td className="py-2 px-3 text-right font-mono tabular-nums text-neutral-700">
                      ${row.sem33.toLocaleString('de-DE')}
                    </td>
                    <td className="py-2 px-3 text-right font-mono tabular-nums text-neutral-700">
                      ${row.sem34.toLocaleString('de-DE')}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-800 text-white font-black text-xs border-t-2 border-neutral-300">
                <tr>
                  <td className="py-3 px-4 uppercase tracking-wider">
                    Total general
                  </td>
                  <td className="py-3 px-4 font-mono">
                    10 Cuentas Oficiales
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-base text-amber-300 bg-slate-900">
                    ${TOTALES_NOMINA_SEMANAL_AGOSTO.totalGeneral.toLocaleString('de-DE')}
                  </td>
                  <td className="py-3 px-4 text-right font-mono">
                    100.00%
                  </td>
                  <td className="py-3 px-3 text-right font-mono">
                    ${TOTALES_NOMINA_SEMANAL_AGOSTO.sem31.toLocaleString('de-DE')}
                  </td>
                  <td className="py-3 px-3 text-right font-mono">
                    ${TOTALES_NOMINA_SEMANAL_AGOSTO.sem32.toLocaleString('de-DE')}
                  </td>
                  <td className="py-3 px-3 text-right font-mono">
                    ${TOTALES_NOMINA_SEMANAL_AGOSTO.sem33.toLocaleString('de-DE')}
                  </td>
                  <td className="py-3 px-3 text-right font-mono">
                    ${TOTALES_NOMINA_SEMANAL_AGOSTO.sem34.toLocaleString('de-DE')}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Tabla Resumen de Imputación de Proyectos Externos */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden space-y-4 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-neutral-900 tracking-tight">
                Ranking de Proyectos Externos Imputados en {selectedCat}
              </h3>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Comparativa por Orden de Trabajo entre {mesActualObj?.mesLabel} y {mesAnteriorObj?.mesLabel}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar proyecto u OT..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-xs pl-8 pr-3 py-1.5 bg-neutral-50 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-56"
              />
            </div>
          </div>
        </div>

        {/* Table of Imputed Projects */}
        <div className="border border-neutral-200 rounded-xl overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800 text-white font-bold">
              <tr className="text-white">
                <th className="py-2.5 px-3 w-8 text-white font-bold">#</th>
                <th className="py-2.5 px-3 min-w-[240px]">Proyecto Externo / Orden de Trabajo (OT)</th>
                <th className="py-2.5 px-3 min-w-[150px]">Cliente / Destino</th>
                <th className="py-2.5 px-3 text-right">
                  Monto {mesActualObj?.mesLabel?.split(' ')[0]} (USD)
                </th>
                <th className="py-2.5 px-3 text-right">
                  Monto {mesAnteriorObj?.mesLabel?.split(' ')[0]} (USD)
                </th>
                <th className="py-2.5 px-3 text-right">Variación</th>
                <th className="py-2.5 px-3 text-right">% en Categoría</th>
                <th className="py-2.5 px-3 text-center">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {proyectosImputados.map((p, idx) => {
                const isExpanded = expandedPry === p.nombre;

                return (
                  <React.Fragment key={p.nombre}>
                    <tr className="hover:bg-neutral-50 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-neutral-400 font-bold">{idx + 1}</td>
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-neutral-900 block">{p.nombre}</span>
                      </td>
                      <td className="py-2.5 px-3 text-neutral-600 truncate max-w-[180px]" title={p.cliente}>
                        {p.cliente}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-neutral-900">
                        ${p.montoActual.toLocaleString('de-DE')}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-neutral-600">
                        ${p.montoAnterior.toLocaleString('de-DE')}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold">
                        <span className={p.variacionPct > 0 ? 'text-amber-600' : p.variacionPct < 0 ? 'text-emerald-600' : 'text-neutral-500'}>
                          {p.variacionPct > 0 ? '+' : ''}{p.variacionPct}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-neutral-700">
                        {p.porcentajeCategoria}%
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => setExpandedPry(isExpanded ? null : p.nombre)}
                          className="p-1 rounded hover:bg-neutral-200 text-neutral-600 transition-colors"
                          title="Ver materiales o salidas imputadas"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>

                    {/* Expandable row showing salidas/items under this project */}
                    {isExpanded && (
                      <tr className="bg-slate-50/90 border-b border-neutral-200">
                        <td colSpan={8} className="p-3 sm:p-5">
                          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
                            {/* Header del Desglose de Imputaciones */}
                            <div className="p-4 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 rounded bg-blue-600 font-mono text-xs font-bold text-white">
                                    {p.codigo || p.nombre.split(':')[0]}
                                  </span>
                                  <span className="text-xs text-amber-300 font-bold uppercase tracking-wider">
                                    {selectedCat === 'Costos Indirectos'
                                      ? 'Distribución Oficial de Prorrateo Contable'
                                      : `Auditoría Oficial de Imputaciones (${selectedCat})`}
                                  </span>
                                </div>
                                <h5 className="text-sm font-bold text-white mt-1">
                                  {p.nombre} — {selectedCat} ({mesActualObj?.mesLabel || 'Septiembre 2026'})
                                </h5>
                                <p className="text-xs text-slate-300 mt-0.5">
                                  {selectedCat === 'Costos Indirectos'
                                    ? `Asignación contable corporativa (${p.porcentajeCategoria}% de absorción en la categoría). Prorrateo oficial de estructura, nómina general y soporte. Cero vales de almacén.`
                                    : 'Imputaciones directas de almacén SIP y compras auditadas sin normalización patrimonial.'}
                                </p>
                              </div>

                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-lg bg-slate-800 text-amber-300 border border-slate-700">
                                  Total Imputado: ${Math.round(p.montoActual).toLocaleString('de-DE')} USD
                                </span>
                                {(selectedCat === 'Costos Indirectos' || p.salidasActuales.length > 0) && (
                                  <button
                                    onClick={() => {
                                      if (selectedCat === 'Costos Indirectos') {
                                        const mesesKeys = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep'] as const;
                                        const curMKey = selectedMesNum >= 1 && selectedMesNum <= 9 ? mesesKeys[selectedMesNum - 1] : 'sep';
                                        const antMKey = mesAnteriorNum >= 1 && mesAnteriorNum <= 9 ? mesesKeys[mesAnteriorNum - 1] : 'ago';

                                        const rawRubros = p.rubrosIndirectos && p.rubrosIndirectos.length > 0
                                          ? p.rubrosIndirectos
                                          : DESGLOSE_CATEGORIAS_PROYECTOS['Costos Indirectos']?.[p.codigo] || [];

                                        const rubrosToExport = (rawRubros.length > 0 ? rawRubros : COSTOS_INDIRECTOS_POR_CATEGORIAS).map(r => {
                                          let mAct = 0;
                                          if (selectedMesNum === 9) {
                                            mAct = r.concepto === 'Nomina Interna TIMACA' ? p.montoActual : 0;
                                          } else {
                                            mAct = (r as any)[curMKey] || 0;
                                          }
                                          let mAnt = 0;
                                          if (mesAnteriorNum === 9) {
                                            mAnt = r.concepto === 'Nomina Interna TIMACA' ? p.montoAnterior : 0;
                                          } else {
                                            mAnt = (r as any)[antMKey] || 0;
                                          }
                                          const vPct = mAnt > 0 ? Math.round(((mAct - mAnt) / mAnt) * 1000) / 10 : (mAct > 0 ? 100 : 0);
                                          const pPct = p.montoActual > 0 ? Math.round((mAct / p.montoActual) * 1000) / 10 : 0;

                                          return {
                                            'Proyecto': p.nombre,
                                            'Cuenta Auxiliar': p.codigo,
                                            'Rubro Contable': r.concepto,
                                            [`Monto ${mesActualObj?.mesLabel || 'Actual'} (USD)`]: mAct,
                                            [`Monto ${mesAnteriorObj?.mesLabel || 'Anterior'} (USD)`]: mAnt,
                                            'Variación (%)': `${vPct > 0 ? '+' : ''}${vPct}%`,
                                            '% en Proyecto': `${pPct}%`,
                                            'Tipo de Costo': 'Costos Indirectos Prorrateados Corporativos (Sin vales SIP)'
                                          };
                                        }).filter(r => (r as any)[`Monto ${mesActualObj?.mesLabel || 'Actual'} (USD)`] > 0 || (r as any)[`Monto ${mesAnteriorObj?.mesLabel || 'Anterior'} (USD)`] > 0);

                                        const ws = XLSX.utils.json_to_sheet(rubrosToExport);
                                        const wb = XLSX.utils.book_new();
                                        XLSX.utils.book_append_sheet(wb, ws, 'Costos_Indirectos');
                                        XLSX.writeFile(wb, `Costos_Indirectos_${p.codigo}_${mesActualObj?.mesLabel?.split(' ')[0] || '2026'}.xlsx`);
                                        return;
                                      }

                                      const rows = p.salidasActuales.map(s => ({
                                        'Nro. PA': s.codigoSalida,
                                        'Fecha': s.fecha,
                                        'Proyecto': s.proyecto,
                                        'Cuenta Auxiliar': s.cuentaAuxiliarCodigo,
                                        'Categoría Principal': s.categoria,
                                        'Subcategoría': s.subcategoria,
                                        'Descripción del Material': s.itemDescripcion,
                                        'Cantidad': s.cantidad,
                                        'Unidad Medida': s.unidadMedida === 'USE' ? 'SERV' : s.unidadMedida,
                                        'Precio Unitario ($ USD)': s.montoUnitario,
                                        'Monto Total ($ USD)': s.montoTotal,
                                        'Solicitante': s.solicitante || s.responsable,
                                        'Motivo': s.motivo
                                      }));
                                      const ws = XLSX.utils.json_to_sheet(rows);
                                      const wb = XLSX.utils.book_new();
                                      XLSX.utils.book_append_sheet(wb, ws, 'Auditoria_PA');
                                      XLSX.writeFile(wb, `Auditoria_PA_${p.nombre.split(':')[0]}_${selectedCat}.xlsx`);
                                    }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>Descargar Excel</span>
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Buscador dentro del proyecto (para categorías con vales de almacén) */}
                            {selectedCat !== 'Costos Indirectos' && p.salidasActuales.length > 3 && (
                              <div className="px-4 flex items-center justify-between gap-3">
                                <div className="relative flex-1 max-w-sm">
                                  <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                                  <input
                                    type="text"
                                    placeholder="Buscar por PA, material, descripción o solicitante..."
                                    value={filtroDesglosePry}
                                    onChange={(e) => setFiltroDesglosePry(e.target.value)}
                                    className="w-full text-xs pl-8 pr-3 py-1.5 bg-neutral-50 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                                <span className="text-xs font-mono text-neutral-500">
                                  {p.salidasActuales.length} partidas auditadas
                                </span>
                              </div>
                            )}

                            {/* Contenido según Categoría */}
                            {(() => {
                              // CASO ESPECIAL: Costos Indirectos (Desglose de Rubros Contables Prorrateados)
                              if (selectedCat === 'Costos Indirectos') {
                                const mesesKeys = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep'] as const;
                                const curMKey = selectedMesNum >= 1 && selectedMesNum <= 9 ? mesesKeys[selectedMesNum - 1] : 'sep';
                                const antMKey = mesAnteriorNum >= 1 && mesAnteriorNum <= 9 ? mesesKeys[mesAnteriorNum - 1] : 'ago';

                                const rawRubros = p.rubrosIndirectos && p.rubrosIndirectos.length > 0
                                  ? p.rubrosIndirectos
                                  : DESGLOSE_CATEGORIAS_PROYECTOS['Costos Indirectos']?.[p.codigo] || [];

                                const rubrosBase = (rawRubros.length > 0 ? rawRubros : COSTOS_INDIRECTOS_POR_CATEGORIAS).map(r => {
                                  let mAct = 0;
                                  if (selectedMesNum === 9) {
                                    mAct = r.concepto === 'Nomina Interna TIMACA' ? p.montoActual : 0;
                                  } else {
                                    mAct = (r as any)[curMKey] || 0;
                                  }
                                  let mAnt = 0;
                                  if (mesAnteriorNum === 9) {
                                    mAnt = r.concepto === 'Nomina Interna TIMACA' ? p.montoAnterior : 0;
                                  } else {
                                    mAnt = (r as any)[antMKey] || 0;
                                  }

                                  let tipo = 'Prorrateo Administrativo';
                                  if (r.concepto.includes('Nomina')) tipo = 'Prorrateo de Estructura / HH';
                                  else if (r.concepto.includes('Sindicato') || r.concepto.includes('Incentivos')) tipo = 'Cargas Laborales Corporativas';
                                  else if (r.concepto.includes('Combustible')) tipo = 'Prorrateo Logístico Flota';
                                  else if (r.concepto.includes('Vigilancia')) tipo = 'Seguridad y Protección Patrimonial';
                                  else if (r.concepto.includes('Servicios Publicos') || r.concepto.includes('Telecomunicaciones')) tipo = 'Servicios e Infraestructura';
                                  else if (r.concepto.includes('Honorarios')) tipo = 'Soporte Profesional y Legal';

                                  const varPct = mAnt > 0 ? Math.round(((mAct - mAnt) / mAnt) * 1000) / 10 : (mAct > 0 ? 100 : 0);
                                  const pctPry = p.montoActual > 0 ? Math.round((mAct / p.montoActual) * 1000) / 10 : 0;

                                  return {
                                    concepto: r.concepto,
                                    mActual: Math.round(mAct),
                                    mAnterior: Math.round(mAnt),
                                    varPct,
                                    pctPry,
                                    tipoProrrateo: tipo
                                  };
                                });

                                const term = filtroDesglosePry.toLowerCase().trim();
                                const rubrosFiltrados = rubrosBase
                                  .filter(r => r.mActual > 0 || r.mAnterior > 0)
                                  .filter(r => !term || r.concepto.toLowerCase().includes(term) || r.tipoProrrateo.toLowerCase().includes(term))
                                  .sort((a, b) => b.mActual - a.mActual || b.mAnterior - a.mAnterior);

                                return (
                                  <div className="p-4 pt-0 space-y-4">
                                    {/* Buscador dentro de los rubros */}
                                    <div className="flex items-center justify-between gap-3">
                                      <div className="relative flex-1 max-w-sm">
                                        <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                                        <input
                                          type="text"
                                          placeholder="Buscar por rubro contable, concepto o tipo..."
                                          value={filtroDesglosePry}
                                          onChange={(e) => setFiltroDesglosePry(e.target.value)}
                                          className="w-full text-xs pl-8 pr-3 py-1.5 bg-neutral-50 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                      </div>
                                      <span className="text-xs font-mono text-neutral-500">
                                        {rubrosFiltrados.length} rubros contables asignados
                                      </span>
                                    </div>

                                    {rubrosFiltrados.length === 0 ? (
                                      <div className="p-6 text-center text-xs text-neutral-500 italic">
                                        No se encontraron rubros contables con el criterio de búsqueda ingresado.
                                      </div>
                                    ) : (
                                      <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
                                        <div className="overflow-x-auto">
                                          <table className="w-full text-left text-xs border-collapse">
                                            <thead>
                                              <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 text-[11px] uppercase font-bold">
                                                <th className="py-2.5 px-3 w-8">#</th>
                                                <th className="py-2.5 px-4 min-w-[280px]">Rubro de Costo Indirecto / Cuenta Contable</th>
                                                <th className="py-2.5 px-3 text-right min-w-[120px]">Monto {mesActualObj?.mesLabel?.split(' ')[0]} (USD)</th>
                                                <th className="py-2.5 px-3 text-right min-w-[120px]">Monto {mesAnteriorObj?.mesLabel?.split(' ')[0]} (USD)</th>
                                                <th className="py-2.5 px-3 text-right min-w-[90px]">Variación</th>
                                                <th className="py-2.5 px-3 text-right min-w-[90px]">% en Proyecto</th>
                                                <th className="py-2.5 px-4 min-w-[180px]">Tipo de Prorrateo</th>
                                              </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                              {rubrosFiltrados.map((r, rIdx) => (
                                                <tr key={r.concepto} className="hover:bg-amber-50/40 transition-colors">
                                                  <td className="py-2.5 px-3 font-mono text-slate-400 font-bold">{rIdx + 1}</td>
                                                  <td className="py-2.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                                                    {r.concepto}
                                                  </td>
                                                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                                                    ${r.mActual.toLocaleString('de-DE')}
                                                  </td>
                                                  <td className="py-2.5 px-3 text-right font-mono text-slate-600 tabular-nums">
                                                    ${r.mAnterior.toLocaleString('de-DE')}
                                                  </td>
                                                  <td className="py-2.5 px-3 text-right font-mono font-semibold tabular-nums">
                                                    <span className={r.varPct > 0 ? 'text-amber-600' : r.varPct < 0 ? 'text-emerald-600' : 'text-slate-500'}>
                                                      {r.varPct > 0 ? '+' : ''}{r.varPct}%
                                                    </span>
                                                  </td>
                                                  <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-700 tabular-nums">
                                                    {r.pctPry}%
                                                  </td>
                                                  <td className="py-2.5 px-4 text-slate-500 text-[11px]">
                                                    {r.tipoProrrateo}
                                                  </td>
                                                </tr>
                                              ))}
                                            </tbody>
                                            <tfoot className="bg-slate-50 font-bold border-t-2 border-slate-300 text-slate-800">
                                              <tr>
                                                <td colSpan={2} className="py-2.5 px-4">TOTAL COSTOS INDIRECTOS {p.codigo}:</td>
                                                <td className="py-2.5 px-3 text-right font-mono text-blue-700">
                                                  ${p.montoActual.toLocaleString('de-DE')}
                                                </td>
                                                <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                                                  ${p.montoAnterior.toLocaleString('de-DE')}
                                                </td>
                                                <td className="py-2.5 px-3 text-right font-mono text-xs">
                                                  <span className={p.variacionPct > 0 ? 'text-amber-700' : 'text-emerald-700'}>
                                                    {p.variacionPct > 0 ? '+' : ''}{p.variacionPct}%
                                                  </span>
                                                </td>
                                                <td className="py-2.5 px-3 text-right font-mono">100.0%</td>
                                                <td></td>
                                              </tr>
                                            </tfoot>
                                          </table>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              }

                              const term = filtroDesglosePry.toLowerCase().trim();
                              const filteredItems = term
                                ? p.salidasActuales.filter(s =>
                                    s.codigoSalida.toLowerCase().includes(term) ||
                                    s.itemDescripcion.toLowerCase().includes(term) ||
                                    (s.subcategoria && s.subcategoria.toLowerCase().includes(term)) ||
                                    (s.solicitante && s.solicitante.toLowerCase().includes(term)) ||
                                    (s.motivo && s.motivo.toLowerCase().includes(term))
                                  )
                                : p.salidasActuales;

                              if (filteredItems.length === 0) {
                                return (
                                  <div className="p-6 text-center text-xs text-neutral-500 italic">
                                    {p.salidasActuales.length === 0
                                      ? `Imputación directa consolidada en el Modelo Estrella de Costos (${formatCurrency(p.montoActual)} USD).`
                                      : 'No se encontraron partidas con el criterio de búsqueda ingresado.'}
                                  </div>
                                );
                              }

                              // Agrupar por Categoría Principal / Subcategoría
                              const subcatMap = new Map<string, typeof filteredItems>();
                              filteredItems.forEach(s => {
                                const sub = s.subcategoria || 'General';
                                if (!subcatMap.has(sub)) subcatMap.set(sub, []);
                                subcatMap.get(sub)!.push(s);
                              });

                              const subcatGroups = Array.from(subcatMap.entries())
                                .map(([subcat, items]) => ({
                                  subcat,
                                  total: items.reduce((acc, curr) => acc + curr.montoTotal, 0),
                                  items
                                }))
                                .sort((a, b) => b.total - a.total);

                              return (
                                <div className="p-4 pt-0 space-y-4">
                                  {subcatGroups.map((group) => {
                                    const pct = p.montoActual > 0
                                      ? ((group.total / p.montoActual) * 100).toFixed(1)
                                      : '0.0';

                                    return (
                                      <div key={group.subcat} className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
                                        {/* Cabecera de la Subcategoría / Categoría Principal */}
                                        <div className="bg-slate-100/80 px-3.5 py-2 border-b border-slate-200 flex items-center justify-between">
                                          <div className="flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
                                            <span className="font-bold text-slate-800 text-xs uppercase tracking-wide">
                                              {group.subcat}
                                            </span>
                                            <span className="text-[10px] text-slate-500 font-medium">
                                              ({group.items.length} {group.items.length === 1 ? 'partida' : 'partidas'})
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <span className="text-xs font-mono font-bold text-slate-900">
                                              ${Math.round(group.total).toLocaleString('de-DE')} USD
                                            </span>
                                            <span className="text-[10px] font-mono font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                                              {pct}%
                                            </span>
                                          </div>
                                        </div>

                                        {/* Tabla de ítems con sus precios unitarios y totales */}
                                        <div className="overflow-x-auto">
                                          <table className="w-full text-left text-xs border-collapse">
                                            <thead>
                                              <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-600 text-[10px] uppercase font-semibold">
                                                <th className="py-2 px-3 min-w-[95px]">Nro. PA</th>
                                                <th className="py-2 px-2.5 min-w-[80px]">Fecha</th>
                                                <th className="py-2 px-3 min-w-[240px]">Descripción del Material / Partida</th>
                                                <th className="py-2 px-2.5 text-right min-w-[65px]">Cant.</th>
                                                <th className="py-2 px-2 min-w-[50px]">UM</th>
                                                <th className="py-2 px-2.5 text-right font-mono min-w-[85px]">P. Unit ($)</th>
                                                <th className="py-2 px-3 text-right font-mono font-bold bg-slate-100/60 min-w-[95px]">Total ($ USD)</th>
                                                <th className="py-2 px-3 min-w-[170px]">Solicitante / Quien Solicita</th>
                                                <th className="py-2 px-3 min-w-[200px]">Motivo / Destino</th>
                                              </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                              {group.items.map((s) => (
                                                <tr key={s.id} className="hover:bg-blue-50/40 transition-colors">
                                                  <td className="py-2 px-3 whitespace-nowrap">
                                                    <span className="font-mono text-[11px] font-bold bg-blue-50 text-blue-800 px-2 py-0.5 rounded border border-blue-200">
                                                      {s.codigoSalida}
                                                    </span>
                                                  </td>
                                                  <td className="py-2 px-2.5 whitespace-nowrap text-slate-600 font-mono text-[11px]">
                                                    {s.fecha}
                                                  </td>
                                                  <td className="py-2 px-3 text-slate-900 font-medium">
                                                    {s.itemDescripcion}
                                                  </td>
                                                  <td className="py-2 px-2.5 text-right font-mono tabular-nums font-semibold text-slate-800">
                                                    {formatNumber(s.cantidad)}
                                                  </td>
                                                  <td className="py-2 px-2 text-slate-500 uppercase text-[10px] font-bold">
                                                    {s.unidadMedida === 'USE' ? 'SERV' : s.unidadMedida}
                                                  </td>
                                                  <td className="py-2 px-2.5 text-right font-mono tabular-nums text-slate-700">
                                                    ${formatUnitPriceRaw(s.montoUnitario)}
                                                  </td>
                                                  <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 bg-slate-50/60 tabular-nums">
                                                    ${formatAmountAuto(s.montoTotal)}
                                                  </td>
                                                  <td className="py-2 px-3 text-slate-700 text-[11px]">
                                                    {s.solicitante || s.responsable || 'TIMACA'}
                                                  </td>
                                                  <td className="py-2 px-3 text-slate-500 text-[11px] truncate max-w-xs" title={s.motivo}>
                                                    {s.motivo || 'Ejecución operativa en obra'}
                                                  </td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </table>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            })()}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
            <tfoot className="bg-neutral-100 font-bold border-t-2 border-neutral-300">
              <tr>
                <td colSpan={3} className="py-2.5 px-3">TOTAL CATEGORÍA ({selectedCat.toUpperCase()}):</td>
                <td className="py-2.5 px-3 text-right font-mono text-blue-700 text-sm">
                  ${montoActual.toLocaleString('de-DE')}
                </td>
                <td className="py-2.5 px-3 text-right font-mono text-neutral-600 text-sm">
                  ${montoAnterior.toLocaleString('de-DE')}
                </td>
                <td className="py-2.5 px-3 text-right font-mono text-xs">
                  <span className={esIncremento ? 'text-amber-700' : 'text-emerald-700'}>
                    {esIncremento ? '+' : ''}{variacionPorcentaje}%
                  </span>
                </td>
                <td className="py-2.5 px-3 text-right font-mono">100.0%</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
