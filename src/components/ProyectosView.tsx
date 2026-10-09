import React, { useState, useMemo, useEffect } from 'react';
import { useCostos } from '../context/CostosContext';
import { formatCurrency, formatNumber } from '../utils/dateHelpers';
import { CUENTAS_AUXILIARES_EXACTAS_AGOSTO_2026, CATEGORIAS_PPT_2026, CUENTAS_CORTAS_MAP, TABLA_PPT_DISTRIBUCION_2026, TOTALES_MESES_PPT } from '../data/mockCostosTimaca';
import { MATRIZ_REAL_PROYECTOS_MENSUAL_2026 } from '../data/realProyectosMensual2026';
import { DESGLOSE_CATEGORIAS_PROYECTOS, COSTOS_INDIRECTOS_POR_CATEGORIAS, COSTOS_INDIRECTOS_CONSOLIDADO_OFICIAL } from '../data/mockDesgloseCategorias';
import { calcularUsoPresupuesto, getPresupuestoPorCuenta } from '../data/presupuestosOficiales';
import { isNormalizacion } from '../utils/normalizacionFilter';
import { SalidaCosto } from '../types/costos';

// Asigna de forma estricta cualquier salida a una de las 5 Macro-Categorías Oficiales TIMACA
const getMacroCategory = (s: SalidaCosto): string => {
  const tipo = (s.tipo || '').toLowerCase();
  const cat = (s.categoria || '').toLowerCase();

  if (tipo.includes('servicio') || cat.includes('servicio')) return 'Servicios';
  if (tipo.includes('mano de obra') || tipo.includes('mdo') || cat.includes('mano de obra')) return 'Mano de Obra Directa';
  if (tipo.includes('horas') || tipo.includes('maquina') || cat.includes('horas maquina')) return 'Horas Maquina';
  if (tipo.includes('indirect') || cat.includes('indirect')) return 'Costos Indirectos';
  return 'Materiales Directos';
};
import { 
  Briefcase, 
  Layers, 
  ChevronDown, 
  ChevronRight, 
  Search, 
  Calendar, 
  Download, 
  ArrowUpDown, 
  ChevronUp, 
  FileSpreadsheet,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Tag,
  Filter,
  Eye,
  AlertCircle,
  ArrowLeft,
  BarChart3,
  PieChart,
  Info,
  CalendarDays,
  X,
  Truck,
  Shield,
  Building
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { 
  TABLA_SERVICIOS_DIRECTOS_PELLAS_OFICIAL, 
  TOTALES_SERVICIOS_DIRECTOS_PELLAS, 
  ANALISIS_SERVICIOS_DIRECTOS_PELLAS 
} from '../data/mockServiciosDirectosPellas';
import { 
  TABLA_HORAS_MAQUINA_PELLAS_OFICIAL, 
  TOTALES_HORAS_MAQUINA_PELLAS, 
  NOTAS_HORAS_MAQUINA_PELLAS 
} from '../data/mockHorasMaquinaPellas';
import { 
  TABLA_COSTOS_INDIRECTOS_OFICIAL, 
  TOTALES_COSTOS_INDIRECTOS_OFICIAL 
} from '../data/mockCostosIndirectosOficial';

interface ProyectosViewProps {
  onVolver?: () => void;
  initialCuentaCodigo?: string;
  initialMesNum?: number;
  initialCategoria?: string;
}

export const ProyectosView: React.FC<ProyectosViewProps> = ({ 
  onVolver,
  initialCuentaCodigo,
  initialMesNum,
  initialCategoria
}) => {
  const {
    salidas,
    resumenMeses,
    totalMontoGlobal
  } = useCostos();

  // Selected Month filter (Defaults to initialMesNum, or latest month = 9)
  const [selectedMesNum, setSelectedMesNum] = useState<number>(initialMesNum !== undefined ? initialMesNum : (resumenMeses.length > 0 ? resumenMeses[resumenMeses.length - 1].mes : 9));
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Selected project for deep inspection (Default to initialCuentaCodigo or top project #1 TTE-C-0706)
  const [selectedCuentaCodigo, setSelectedCuentaCodigo] = useState<string>(initialCuentaCodigo || 'TTE-C-0706');
  
  // Deep dive: category filter inside the selected project ('todas' or specific category)
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>(initialCategoria || 'Materiales Directos');
  const [itemSearchTerm, setItemSearchTerm] = useState<string>('');
  const [selectedSubcategoriaFilter, setSelectedSubcategoriaFilter] = useState<string>('todas');
  const [showMatrizOficialServicios, setShowMatrizOficialServicios] = useState<boolean>(true);
  const [showMatrizOficialHorasMaquina, setShowMatrizOficialHorasMaquina] = useState<boolean>(true);
  const [showMatrizOficialIndirectos, setShowMatrizOficialIndirectos] = useState<boolean>(true);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [selectedEvolutivoMes, setSelectedEvolutivoMes] = useState<number | null>(null);
  const [hoveredMesIndex, setHoveredMesIndex] = useState<number | null>(null);
  const [salidaAuditoria, setSalidaAuditoria] = useState<SalidaCosto | null>(null);

  useEffect(() => {
    if (initialCuentaCodigo) {
      setSelectedCuentaCodigo(initialCuentaCodigo);
    }
  }, [initialCuentaCodigo]);

  useEffect(() => {
    if (initialCategoria) {
      setSelectedCategoryFilter(initialCategoria);
    }
  }, [initialCategoria]);

  useEffect(() => {
    setSelectedSubcategoriaFilter('todas');
  }, [selectedCategoryFilter, selectedCuentaCodigo]);

  // Month label
  const mesLabel = useMemo(() => {
    if (selectedMesNum === 0) return 'Todo el Año 2026';
    const m = resumenMeses.find(rm => rm.mes === selectedMesNum);
    return m ? m.mesLabel : `Mes ${selectedMesNum} 2026`;
  }, [selectedMesNum, resumenMeses]);

  // Salidas filtered by selected month (purified from normalización y exclusivamente Proyectos Externos TTE-C)
  const salidasFiltradasMes = useMemo(() => {
    return salidas.filter(s => 
      !isNormalizacion(s) && 
      (s.cuentaAuxiliarCodigo?.startsWith('TTE-C-') || s.esProyectoExterno || (s as any).tipoCosto === 'Externo') &&
      (selectedMesNum === 0 || s.mes === selectedMesNum)
    );
  }, [salidas, selectedMesNum]);

  // Total gasto in the selected period (Oficial TIMACA 2026)
  const totalGastoPeriodo = useMemo(() => {
    if (selectedMesNum === 0) {
      return TOTALES_MESES_PPT.reduce((a, b) => a + b.total, 0); // Total consolidado 9 meses oficiales 2026 (Ene-Sep: $13.020.430 USD)
    }
    if (selectedMesNum >= 1 && selectedMesNum <= 9) {
      return TOTALES_MESES_PPT[selectedMesNum - 1]?.total || 1215432;
    }
    return salidasFiltradasMes.reduce((sum, s) => sum + s.montoTotal, 0);
  }, [salidasFiltradasMes, selectedMesNum]);

  // NIVEL 1: Agrupación y Ranking de Cuentas Auxiliares (Exclusivamente Proyectos Externos / Clientes)
  // Ordenados estrictamente de mayor a menor gasto, con Consolidado General Corporativo al inicio
  const cuentasRanking = useMemo(() => {
    const mapa = new Map<string, {
      codigo: string;
      nombre: string;
      proyectoCorto: string;
      totalMonto: number;
      salidasCount: number;
      salidas: typeof salidas;
    }>();

    // 1. Poblamos según el período seleccionado
    if (selectedMesNum === 8) {
      // En Agosto 2026 usamos las 20 cuentas oficiales con sus montos exactos de presentación ($1.163.915 USD)
      CUENTAS_AUXILIARES_EXACTAS_AGOSTO_2026.forEach(item => {
        mapa.set(item.cuentaAuxiliar, {
          codigo: item.cuentaAuxiliar,
          nombre: item.proyecto,
          proyectoCorto: item.proyectoCorto,
          totalMonto: item.montoAgosto,
          salidasCount: 0,
          salidas: []
        });
      });
    } else if (selectedMesNum === 9) {
      // En Septiembre 2026 acumulamos todas las salidas auditadas del mes 9
      salidasFiltradasMes.forEach(s => {
        const cod = s.cuentaAuxiliarCodigo;
        if (!cod || !cod.startsWith('TTE-C-')) return;
        const pCorto = CUENTAS_CORTAS_MAP[cod] || s.cuentaAuxiliarNombre || s.proyecto;
        if (!mapa.has(cod)) {
          mapa.set(cod, {
            codigo: cod,
            nombre: s.cuentaAuxiliarNombre || s.proyecto,
            proyectoCorto: pCorto,
            totalMonto: s.montoTotal,
            salidasCount: 1,
            salidas: [s]
          });
        } else {
          const cur = mapa.get(cod)!;
          cur.salidasCount += 1;
          cur.totalMonto += s.montoTotal;
          cur.salidas.push(s);
        }
      });

      // Sumamos la cuota oficial de Costos Indirectos de Septiembre a cada proyecto externo
      mapa.forEach((item, cod) => {
        const rowCif = COSTOS_INDIRECTOS_CONSOLIDADO_OFICIAL.find(r => r.ctaAuxiliar === cod);
        let cifSep = 0;
        if (rowCif && rowCif.sep !== undefined && rowCif.sep > 0) {
          cifSep = rowCif.sep;
        } else {
          const modPry = item.salidas
            .filter(s => getMacroCategory(s) === 'Mano de Obra Directa')
            .reduce((acc, s) => acc + s.montoTotal, 0);
          cifSep = modPry > 0 ? Math.round(73000 * (modPry / 351891)) : 0;
        }
        item.totalMonto += cifSep;
      });
    } else {
      // Para otros meses o Todo el Año (selectedMesNum === 0), poblamos desde la matriz real de proyectos externos
      Object.entries(MATRIZ_REAL_PROYECTOS_MENSUAL_2026).forEach(([cod, data]) => {
        if (!cod.startsWith('TTE-C-')) return; // Exclusivamente proyectos externos de clientes
        let montoPeriodo = 0;
        if (selectedMesNum === 0) {
          montoPeriodo = data.totalAnual;
        } else if (selectedMesNum >= 1 && selectedMesNum <= 8) {
          montoPeriodo = data.meses[selectedMesNum - 1] || 0;
        }

        if (montoPeriodo > 0) {
          const pCorto = CUENTAS_CORTAS_MAP[cod] || data.descripcion;
          mapa.set(cod, {
            codigo: cod,
            nombre: data.descripcion,
            proyectoCorto: pCorto,
            totalMonto: montoPeriodo,
            salidasCount: 0,
            salidas: []
          });
        }
      });
    }

    // 2. Asociamos salidas reales de almacén SIP para auditoría línea a línea (para meses distintos de 9 que ya se procesaron)
    if (selectedMesNum !== 9) {
      salidasFiltradasMes.forEach(s => {
        const cod = s.cuentaAuxiliarCodigo;
        if (!cod || !cod.startsWith('TTE-C-')) return;
        if (!mapa.has(cod)) {
          const pCorto = CUENTAS_CORTAS_MAP[cod] || s.cuentaAuxiliarNombre || s.proyecto;
          mapa.set(cod, {
            codigo: cod,
            nombre: s.cuentaAuxiliarNombre || s.proyecto,
            proyectoCorto: pCorto,
            totalMonto: s.montoTotal,
            salidasCount: 1,
            salidas: [s]
          });
        } else {
          const cur = mapa.get(cod)!;
          cur.salidasCount += 1;
          cur.salidas.push(s);
          // Si no tenía monto asignado, sumamos el de las salidas
          if (cur.totalMonto === 0) {
            cur.totalMonto += s.montoTotal;
          }
        }
      });
    }

    const total = totalGastoPeriodo || 1;

    const rawList = Array.from(mapa.values())
      .map(item => ({
        ...item,
        porcentaje: Math.round((item.totalMonto / total) * 1000) / 10
      }))
      .filter(item => {
        if (!searchTerm) return true;
        const q = searchTerm.toLowerCase();
        return item.codigo.toLowerCase().includes(q) || 
          item.nombre.toLowerCase().includes(q) ||
          item.proyectoCorto.toLowerCase().includes(q);
      })
      .sort((a, b) => b.totalMonto - a.totalMonto);

    // Entrada #0: Consolidado General TIMACA (Permite ver el total global corporativo: Jul $1.193.087, Ago $1.163.915)
    const consolidadoItem = {
      codigo: 'CONSOLIDADO-TIMACA',
      nombre: 'Consolidado General TIMACA (Todos los Proyectos Corporativos)',
      proyectoCorto: '★ Consolidado General TIMACA',
      totalMonto: totalGastoPeriodo,
      salidasCount: salidasFiltradasMes.length,
      salidas: salidasFiltradasMes,
      porcentaje: 100.0,
      esConsolidado: true
    };

    if (!searchTerm || 'consolidado general timaca todos los proyectos'.includes(searchTerm.toLowerCase())) {
      return [consolidadoItem, ...rawList];
    }
    return rawList;
  }, [salidasFiltradasMes, totalGastoPeriodo, searchTerm, selectedMesNum]);

  // Active Cuenta Auxiliar
  const activeCuenta = useMemo(() => {
    const found = cuentasRanking.find(c => c.codigo === selectedCuentaCodigo);
    return found || cuentasRanking[0] || null;
  }, [cuentasRanking, selectedCuentaCodigo]);

  // NIVEL 2: Desglose de las 5 Categorías de Costo dentro de la Cuenta Auxiliar seleccionada
  const categoriasDesglose = useMemo(() => {
    if (!activeCuenta) return [];

    const effectiveMes = selectedEvolutivoMes !== null ? selectedEvolutivoMes : selectedMesNum;

    const mapCat = new Map<string, { total: number; count: number; salidas: typeof salidas }>();
    
    // Inicializar estrictamente las 5 macro-categorías oficiales TIMACA
    CATEGORIAS_PPT_2026.forEach(cat => {
      mapCat.set(cat, { total: 0, count: 0, salidas: [] });
    });

    if (activeCuenta.codigo === 'CONSOLIDADO-TIMACA') {
      if (effectiveMes === 0) {
        CATEGORIAS_PPT_2026.forEach((cat, idx) => {
          const totCat = TABLA_PPT_DISTRIBUCION_2026[idx]?.total2026 || 0;
          const salidasCat = activeCuenta.salidas.filter(s => getMacroCategory(s) === cat);
          mapCat.set(cat, { 
            total: totCat, 
            count: salidasCat.length, 
            salidas: salidasCat 
          });
        });
      } else if (effectiveMes >= 1 && effectiveMes <= 9) {
        CATEGORIAS_PPT_2026.forEach((cat, idx) => {
          const mCat = TABLA_PPT_DISTRIBUCION_2026[idx]?.meses[effectiveMes - 1] || 0;
          const salidasCat = activeCuenta.salidas.filter(s => s.mes === effectiveMes && getMacroCategory(s) === cat);
          mapCat.set(cat, { 
            total: mCat, 
            count: salidasCat.length, 
            salidas: salidasCat 
          });
        });
      }
    } else {
      // Proyecto específico:
      // Agrupamos las salidas reales que pertenecen al proyecto y al período evaluado
      const salidasPeriodo = effectiveMes === 0 
        ? activeCuenta.salidas 
        : activeCuenta.salidas.filter(s => s.mes === effectiveMes);

      salidasPeriodo.forEach(s => {
        const macroCat = getMacroCategory(s);
        const cur = mapCat.get(macroCat);
        if (cur) {
          cur.count += 1;
          cur.salidas.push(s);
        }
      });

      const realProj = MATRIZ_REAL_PROYECTOS_MENSUAL_2026[activeCuenta.codigo];
      CATEGORIAS_PPT_2026.forEach(cat => {
        const cur = mapCat.get(cat)!;
        if (effectiveMes === 0) {
          // Todo el Año: suma de los 8 meses oficiales de matriz + salidas auditadas de septiembre
          if (realProj) {
            let sumAnual = 0;
            realProj.byCategoriaMes.forEach(mesCat => {
              sumAnual += (mesCat[cat] || 0);
            });
            if (cat === 'Costos Indirectos') {
              const rowCif = COSTOS_INDIRECTOS_CONSOLIDADO_OFICIAL.find(r => r.ctaAuxiliar === activeCuenta.codigo);
              const cifSep = rowCif?.sep || 0;
              cur.total = sumAnual + cifSep;
              cur.count = (cur.total > 0 ? 1 : 0) + cur.count;
            } else {
              const salidasSepCat = activeCuenta.salidas.filter(s => s.mes === 9 && getMacroCategory(s) === cat);
              const sepSum = salidasSepCat.reduce((acc, s) => acc + s.montoTotal, 0);
              cur.total = sumAnual + sepSum;
            }
          } else {
            cur.total = cur.salidas.reduce((acc, s) => acc + s.montoTotal, 0);
          }
        } else if (effectiveMes >= 1 && effectiveMes <= 8) {
          // Meses 1 a 8: matriz oficial PPT
          if (realProj && realProj.byCategoriaMes && realProj.byCategoriaMes[effectiveMes - 1]) {
            cur.total = realProj.byCategoriaMes[effectiveMes - 1][cat] || 0;
          } else {
            cur.total = cur.salidas.reduce((acc, s) => acc + s.montoTotal, 0);
          }
        } else if (effectiveMes === 9) {
          if (cat === 'Costos Indirectos') {
            const rowCif = COSTOS_INDIRECTOS_CONSOLIDADO_OFICIAL.find(r => r.ctaAuxiliar === activeCuenta.codigo);
            if (rowCif && rowCif.sep !== undefined && rowCif.sep > 0) {
              cur.total = rowCif.sep;
            } else {
              const modBolsaSep = 351891;
              const modPrySep = activeCuenta.salidas
                .filter(s => s.mes === 9 && getMacroCategory(s) === 'Mano de Obra Directa')
                .reduce((acc, s) => acc + s.montoTotal, 0);
              cur.total = modBolsaSep > 0 && modPrySep > 0 ? Math.round(73000 * (modPrySep / modBolsaSep)) : 0;
            }
            cur.count = cur.total > 0 ? 1 : 0;
          } else {
            // Mes 9 (Septiembre): suma exacta de todas las salidas auditadas del mes 9 para esta categoría
            cur.total = cur.salidas.reduce((acc, s) => acc + s.montoTotal, 0);
          }
        }
      });
    }

    const totalCuenta = Array.from(mapCat.values()).reduce((sum, d) => sum + d.total, 0) || activeCuenta.totalMonto || 1;

    return Array.from(mapCat.entries())
      .map(([categoria, data]) => ({
        categoria,
        total: data.total,
        count: data.count,
        porcentaje: Math.round((data.total / totalCuenta) * 1000) / 10,
        salidas: data.salidas
      }))
      .sort((a, b) => b.total - a.total);
  }, [activeCuenta, selectedMesNum, selectedEvolutivoMes]);

  // Evolutivo mensual (Ene a Ago 2026) para la Cuenta Auxiliar seleccionada (o Consolidado TIMACA)
  const evolutivoCuenta = useMemo(() => {
    if (!activeCuenta) return null;

    const MESES_INFO = [
      { num: 1, nombre: 'Ene', label: 'Enero 2026' },
      { num: 2, nombre: 'Feb', label: 'Febrero 2026' },
      { num: 3, nombre: 'Mar', label: 'Marzo 2026' },
      { num: 4, nombre: 'Abr', label: 'Abril 2026' },
      { num: 5, nombre: 'May', label: 'Mayo 2026' },
      { num: 6, nombre: 'Jun', label: 'Junio 2026' },
      { num: 7, nombre: 'Jul', label: 'Julio 2026' },
      { num: 8, nombre: 'Ago', label: 'Agosto 2026' },
      { num: 9, nombre: 'Sep', label: 'Septiembre 2026' },
    ];

    const isConsolidado = activeCuenta.codigo === 'CONSOLIDADO-TIMACA';

    // Filter all salidas for this activeCuenta across the whole year (purified from normalización)
    const salidasCuentaTotal = isConsolidado
      ? salidas.filter(s => !isNormalizacion(s))
      : salidas.filter(s => s.cuentaAuxiliarCodigo === activeCuenta.codigo && !isNormalizacion(s));

    const mesesData = MESES_INFO.map((m, mIdx) => {
      let porCategoria: Record<string, number> = {
        'Materiales Directos': 0,
        'Servicios': 0,
        'Mano de Obra Directa': 0,
        'Horas Maquina': 0,
        'Costos Indirectos': 0,
      };

      let totalMes = 0;

      if (isConsolidado) {
        porCategoria = {
          'Materiales Directos': TABLA_PPT_DISTRIBUCION_2026[0]?.meses[mIdx] || 0,
          'Servicios': TABLA_PPT_DISTRIBUCION_2026[1]?.meses[mIdx] || 0,
          'Mano de Obra Directa': TABLA_PPT_DISTRIBUCION_2026[2]?.meses[mIdx] || 0,
          'Horas Maquina': TABLA_PPT_DISTRIBUCION_2026[3]?.meses[mIdx] || 0,
          'Costos Indirectos': TABLA_PPT_DISTRIBUCION_2026[4]?.meses[mIdx] || 0,
        };
        totalMes = Object.values(porCategoria).reduce((acc, v) => acc + v, 0);
      } else {
        const realProj = MATRIZ_REAL_PROYECTOS_MENSUAL_2026[activeCuenta.codigo];
        if (realProj && realProj.meses && realProj.meses[mIdx] !== undefined) {
          totalMes = realProj.meses[mIdx];
          porCategoria = { ...realProj.byCategoriaMes[mIdx] };
        } else {
          const salidasMes = salidasCuentaTotal.filter(s => s.mes === m.num);
          totalMes = salidasMes.reduce((acc, s) => acc + s.montoTotal, 0);

          salidasMes.forEach(s => {
            const catKey = getMacroCategory(s);
            porCategoria[catKey] = (porCategoria[catKey] || 0) + s.montoTotal;
          });

          // Si es Septiembre (mes 9), cargar los Costos Indirectos asignados al proyecto
          if (m.num === 9) {
            const rowCif = COSTOS_INDIRECTOS_CONSOLIDADO_OFICIAL.find(r => r.ctaAuxiliar === activeCuenta.codigo);
            let cifMonto = 0;
            if (rowCif && rowCif.sep !== undefined && rowCif.sep > 0) {
              cifMonto = rowCif.sep;
            } else {
              const modBolsaSep = 351891;
              const modPry = porCategoria['Mano de Obra Directa'] || 0;
              cifMonto = modBolsaSep > 0 && modPry > 0 ? Math.round(73000 * (modPry / modBolsaSep)) : 0;
            }
            porCategoria['Costos Indirectos'] = cifMonto;
            totalMes += cifMonto;
          }
        }
      }

      return {
        mesNum: m.num,
        mesNombre: m.nombre,
        mesLabel: m.label,
        total: totalMes,
        porCategoria,
        movimientosCount: isConsolidado
          ? salidas.filter(s => s.mes === m.num && !isNormalizacion(s)).length
          : salidasCuentaTotal.filter(s => s.mes === m.num).length
      };
    });

    const totalAnualCuenta = isConsolidado
      ? TOTALES_MESES_PPT.reduce((a, b) => a + b.total, 0)
      : mesesData.reduce((acc, m) => acc + m.total, 0);
    const maxMesMonto = Math.max(...mesesData.map(m => m.total), 1);
    const mesPico = [...mesesData].sort((a, b) => b.total - a.total)[0];
    const promedioMensual = Math.round(totalAnualCuenta / 9);

    // Sum by category for the whole year
    const resumenCategoriasAnual: Record<string, number> = {
      'Materiales Directos': 0,
      'Servicios': 0,
      'Mano de Obra Directa': 0,
      'Horas Maquina': 0,
      'Costos Indirectos': 0,
    };

    if (isConsolidado) {
      resumenCategoriasAnual['Materiales Directos'] = TABLA_PPT_DISTRIBUCION_2026[0]?.total2026 || 4431179;
      resumenCategoriasAnual['Servicios'] = TABLA_PPT_DISTRIBUCION_2026[1]?.total2026 || 3059088;
      resumenCategoriasAnual['Mano de Obra Directa'] = TABLA_PPT_DISTRIBUCION_2026[2]?.total2026 || 2773572;
      resumenCategoriasAnual['Horas Maquina'] = TABLA_PPT_DISTRIBUCION_2026[3]?.total2026 || 882928;
      resumenCategoriasAnual['Costos Indirectos'] = TABLA_PPT_DISTRIBUCION_2026[4]?.total2026 || 1755313;
    } else {
      mesesData.forEach(m => {
        Object.entries(m.porCategoria).forEach(([cat, val]) => {
          resumenCategoriasAnual[cat] += val;
        });
      });
    }

    return {
      mesesData,
      totalAnualCuenta,
      maxMesMonto,
      mesPico,
      promedioMensual,
      resumenCategoriasAnual,
      isConsolidado
    };
  }, [activeCuenta, salidas]);

  // Métricas de Presupuesto Oficial TIMACA para la Cuenta Auxiliar activa
  const presupuestoActivo = useMemo(() => {
    if (!activeCuenta || activeCuenta.codigo === 'CONSOLIDADO-TIMACA') return null;
    const realProj = MATRIZ_REAL_PROYECTOS_MENSUAL_2026[activeCuenta.codigo];
    const totalEjecutado = realProj ? realProj.totalAnual : (evolutivoCuenta?.totalAnualCuenta || activeCuenta.totalMonto);
    const metricas = calcularUsoPresupuesto(activeCuenta.codigo, totalEjecutado);
    const presupuestoRaw = getPresupuestoPorCuenta(activeCuenta.codigo);
    return {
      ...metricas,
      detalle: presupuestoRaw
    };
  }, [activeCuenta, evolutivoCuenta]);

  // Subcategorías de la categoría seleccionada (ej. Materiales Directos -> EPP, Soldadura, Pinturas, Oxígeno, etc.)
  const subcategoriasDesglose = useMemo(() => {
    if (!activeCuenta || selectedCategoryFilter === 'todas') return [];

    // Subconceptos oficiales para Costos Indirectos (dinámico para cualquier mes y proyecto externo)
    if (selectedCategoryFilter === 'Costos Indirectos') {
      const mesTarget = selectedEvolutivoMes || (selectedMesNum > 0 ? selectedMesNum : 8);
      const isAnual = selectedMesNum === 0 && !selectedEvolutivoMes;
      const mesesKeys = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep'] as const;
      const mKey = !isAnual && mesTarget >= 1 && mesTarget <= 9 ? mesesKeys[mesTarget - 1] : null;

      const indProjectRows = DESGLOSE_CATEGORIAS_PROYECTOS['Costos Indirectos']?.[activeCuenta.codigo];

      if (indProjectRows && indProjectRows.length > 0 && mesTarget !== 9) {
        const rowsWithMonto = indProjectRows.map(r => {
          const mVal = isAnual ? r.total : (mKey ? (r[mKey] || 0) : 0);
          return {
            subcategoria: r.concepto,
            total: Math.round(mVal),
            count: 1,
            responsable: 'Contabilidad de Costos'
          };
        }).filter(r => r.total > 0);

        const sumTot = rowsWithMonto.reduce((a, b) => a + b.total, 0) || 1;
        return rowsWithMonto
          .map(r => ({
            ...r,
            porcentaje: Math.round((r.total / sumTot) * 1000) / 10
          }))
          .sort((a, b) => b.total - a.total);
      }

      // Si no tiene desglose explícito por rubro, derivar de su alícuota en la bolsa oficial TIMACA
      const realProj = MATRIZ_REAL_PROYECTOS_MENSUAL_2026[activeCuenta.codigo];
      let indTotalPry = 0;
      if (realProj) {
        if (isAnual) {
          const sum8 = realProj.byCategoriaMes.reduce((acc, m) => acc + (m['Costos Indirectos'] || 0), 0);
          const sepInd = COSTOS_INDIRECTOS_CONSOLIDADO_OFICIAL.find(r => r.ctaAuxiliar === activeCuenta.codigo)?.sep || 0;
          indTotalPry = sum8 + sepInd;
        } else if (mesTarget >= 1 && mesTarget <= 8) {
          indTotalPry = realProj.byCategoriaMes[mesTarget - 1]['Costos Indirectos'] || 0;
        } else if (mesTarget === 9) {
          const rowCif = COSTOS_INDIRECTOS_CONSOLIDADO_OFICIAL.find(r => r.ctaAuxiliar === activeCuenta.codigo);
          if (rowCif && rowCif.sep !== undefined && rowCif.sep > 0) {
            indTotalPry = rowCif.sep;
          } else {
            const modBolsaSep = 351891;
            const modPrySep = activeCuenta.salidas
              .filter(s => s.mes === 9 && getMacroCategory(s) === 'Mano de Obra Directa')
              .reduce((acc, s) => acc + s.montoTotal, 0);
            indTotalPry = modBolsaSep > 0 && modPrySep > 0 ? Math.round(73000 * (modPrySep / modBolsaSep)) : 0;
          }
        }
      } else {
        const rowCif = COSTOS_INDIRECTOS_CONSOLIDADO_OFICIAL.find(r => r.ctaAuxiliar === activeCuenta.codigo);
        if (rowCif && rowCif.sep !== undefined && rowCif.sep > 0) {
          indTotalPry = rowCif.sep;
        }
      }

      if (indTotalPry <= 0) return [];

      const bolsaMesTotal = isAnual 
        ? 1755313 
        : (mesTarget >= 1 && mesTarget <= 9 ? (TABLA_PPT_DISTRIBUCION_2026[4]?.meses[mesTarget - 1] || 73000) : 73000);
      
      const factorPry = bolsaMesTotal > 0 ? indTotalPry / bolsaMesTotal : 0;

      return COSTOS_INDIRECTOS_POR_CATEGORIAS.map(cat => {
        const catVal = isAnual ? cat.total : (mKey ? (cat[mKey] || 0) : 0);
        const asignadoCat = Math.round(catVal * factorPry);
        return {
          subcategoria: cat.concepto,
          total: asignadoCat,
          count: 1,
          responsable: 'Contabilidad Corporativa',
          porcentaje: indTotalPry > 0 ? Math.round((asignadoCat / indTotalPry) * 1000) / 10 : 0
        };
      }).filter(r => r.total > 0).sort((a, b) => b.total - a.total);
    }

    if (selectedCategoryFilter === 'Servicios' && activeCuenta.codigo === 'TTE-C-0706' && selectedMesNum !== 9 && selectedEvolutivoMes !== 9) {
      const isAgo = selectedMesNum === 8;
      return TABLA_SERVICIOS_DIRECTOS_PELLAS_OFICIAL
        .map(srv => ({
          subcategoria: srv.servicio,
          total: isAgo ? srv.agosto : srv.total,
          count: 1,
          responsable: srv.responsable,
          porcentaje: Math.round(((isAgo ? srv.agosto : srv.total) / (isAgo ? 63106 : 226634)) * 1000) / 10
        }))
        .filter(s => s.total > 0)
        .sort((a, b) => b.total - a.total);
    }

    if (selectedCategoryFilter === 'Horas Maquina' && activeCuenta.codigo === 'TTE-C-0706' && selectedMesNum !== 9 && selectedEvolutivoMes !== 9) {
      const mapHM = new Map<string, { total: number; count: number }>();
      TABLA_HORAS_MAQUINA_PELLAS_OFICIAL.forEach(eq => {
        const sub = eq.subcategoria;
        const cur = mapHM.get(sub) || { total: 0, count: 0 };
        cur.total += eq.costoTotalHM;
        cur.count += 1;
        mapHM.set(sub, cur);
      });
      return Array.from(mapHM.entries()).map(([sub, data]) => ({
        subcategoria: sub,
        total: data.total,
        count: data.count,
        responsable: 'Jefatura de Equipos Pesados',
        porcentaje: Math.round((data.total / 89789) * 1000) / 10
      })).sort((a, b) => b.total - a.total);
    }

    let salidasCat = activeCuenta.salidas.filter(s => getMacroCategory(s) === selectedCategoryFilter);

    if (selectedEvolutivoMes) {
      salidasCat = salidasCat.filter(s => s.mes === selectedEvolutivoMes);
    }

    const mapSub = new Map<string, {
      subcategoria: string;
      total: number;
      count: number;
      responsable: string;
    }>();

    salidasCat.forEach(s => {
      // En Materiales Directos, la subcategoría real de almacén SIP es s.categoria
      const sub = s.categoria || s.subcategoria || 'General';
      if (!mapSub.has(sub)) {
        mapSub.set(sub, {
          subcategoria: sub,
          total: 0,
          count: 0,
          responsable: s.responsable || s.solicitante || 'TIMACA'
        });
      }
      const cur = mapSub.get(sub)!;
      cur.total += s.montoTotal;
      cur.count += 1;
    });

    const totalCat = salidasCat.reduce((acc, s) => acc + s.montoTotal, 0) || 1;

    return Array.from(mapSub.values())
      .map(item => ({
        ...item,
        porcentaje: Math.round((item.total / totalCat) * 1000) / 10
      }))
      .sort((a, b) => b.total - a.total);
  }, [activeCuenta, selectedCategoryFilter, selectedEvolutivoMes, selectedMesNum]);

  // Datos consolidados y dinámicos para el Mecanismo de Asignación Corporativa de Costos Indirectos
  const datosProrrateoProyecto = useMemo(() => {
    if (!activeCuenta) return null;
    const mesTarget = selectedEvolutivoMes || (selectedMesNum > 0 ? selectedMesNum : 0);
    const isAnual = mesTarget === 0;
    const realProj = MATRIZ_REAL_PROYECTOS_MENSUAL_2026[activeCuenta.codigo];

    const bolsaTotal = isAnual
      ? 1755313
      : (mesTarget >= 1 && mesTarget <= 9 ? (TABLA_PPT_DISTRIBUCION_2026[4]?.meses[mesTarget - 1] || 73000) : 73000);

    const modTotalBolsa = isAnual
      ? 2773572
      : (mesTarget >= 1 && mesTarget <= 9 ? (TABLA_PPT_DISTRIBUCION_2026[2]?.meses[mesTarget - 1] || 351891) : 351891);

    let indirectoProyecto = 0;
    let modProyecto = 0;

    if (realProj) {
      if (isAnual) {
        const sum8Ind = realProj.byCategoriaMes.reduce((acc, m) => acc + (m['Costos Indirectos'] || 0), 0);
        const sepInd = COSTOS_INDIRECTOS_CONSOLIDADO_OFICIAL.find(r => r.ctaAuxiliar === activeCuenta.codigo)?.sep || 0;
        indirectoProyecto = Math.round(sum8Ind + sepInd);

        const sum8Mod = realProj.byCategoriaMes.reduce((acc, m) => acc + (m['Mano de Obra Directa'] || 0), 0);
        const sepMod = activeCuenta.salidas
          .filter(s => s.mes === 9 && getMacroCategory(s) === 'Mano de Obra Directa')
          .reduce((acc, s) => acc + s.montoTotal, 0);
        modProyecto = Math.round(sum8Mod + sepMod);
      } else if (mesTarget >= 1 && mesTarget <= 8) {
        const catMes = realProj.byCategoriaMes[mesTarget - 1];
        indirectoProyecto = Math.round(catMes?.['Costos Indirectos'] || 0);
        modProyecto = Math.round(catMes?.['Mano de Obra Directa'] || 0);
      } else if (mesTarget === 9) {
        const rowCif = COSTOS_INDIRECTOS_CONSOLIDADO_OFICIAL.find(r => r.ctaAuxiliar === activeCuenta.codigo);
        modProyecto = activeCuenta.salidas
          .filter(s => s.mes === 9 && getMacroCategory(s) === 'Mano de Obra Directa')
          .reduce((acc, s) => acc + s.montoTotal, 0);

        if (rowCif && rowCif.sep !== undefined && rowCif.sep > 0) {
          indirectoProyecto = rowCif.sep;
        } else {
          indirectoProyecto = modTotalBolsa > 0 && modProyecto > 0 ? Math.round(bolsaTotal * (modProyecto / modTotalBolsa)) : 0;
        }
      }
    } else {
      const rowCif = COSTOS_INDIRECTOS_CONSOLIDADO_OFICIAL.find(r => r.ctaAuxiliar === activeCuenta.codigo);
      if (rowCif && rowCif.sep !== undefined) {
        indirectoProyecto = rowCif.sep;
      } else {
        indirectoProyecto = Math.round(activeCuenta.totalMonto * 0.25);
      }
      modProyecto = activeCuenta.salidas
        .filter(s => (mesTarget === 0 || s.mes === mesTarget) && getMacroCategory(s) === 'Mano de Obra Directa')
        .reduce((acc, s) => acc + s.montoTotal, 0);
    }

    const pctAbsorcion = bolsaTotal > 0 ? (Math.round((indirectoProyecto / bolsaTotal) * 1000) / 10) : 0;
    const pctMOD = modTotalBolsa > 0 ? (Math.round((modProyecto / modTotalBolsa) * 1000) / 10) : 0;
    const restoProyectos = Math.max(0, bolsaTotal - indirectoProyecto);

    return {
      bolsaTotal,
      modTotalBolsa,
      indirectoProyecto,
      modProyecto,
      pctAbsorcion,
      pctMOD,
      restoProyectos,
      isAnual,
      mesTarget
    };
  }, [activeCuenta, selectedMesNum, selectedEvolutivoMes]);

  // NIVEL 3: Salidas profundas línea a línea para auditoría (Almacén SIP)
  const lineasProfundas = useMemo(() => {
    if (!activeCuenta) return [];

    let list = activeCuenta.salidas;

    if (selectedEvolutivoMes) {
      list = list.filter(s => s.mes === selectedEvolutivoMes);
    }

    if (selectedCategoryFilter !== 'todas') {
      list = list.filter(s => getMacroCategory(s) === selectedCategoryFilter);
    }

    if (selectedSubcategoriaFilter !== 'todas') {
      list = list.filter(s => (s.categoria === selectedSubcategoriaFilter || s.subcategoria === selectedSubcategoriaFilter));
    }

    if (itemSearchTerm) {
      const q = itemSearchTerm.toLowerCase();
      list = list.filter(s => 
        s.codigoSalida.toLowerCase().includes(q) ||
        s.itemDescripcion.toLowerCase().includes(q) ||
        (s.subcategoria && s.subcategoria.toLowerCase().includes(q)) ||
        s.proveedorODestino.toLowerCase().includes(q) ||
        s.responsable.toLowerCase().includes(q) ||
        (s.observaciones && s.observaciones.toLowerCase().includes(q))
      );
    }

    return list.sort((a, b) => b.fecha.localeCompare(a.fecha));
  }, [activeCuenta, selectedCategoryFilter, selectedSubcategoriaFilter, itemSearchTerm, selectedEvolutivoMes]);

  // Líneas detalladas de auditoría para Costos Indirectos (imputación contable, staff y soporte operativo)
  const lineasCostosIndirectos = useMemo<SalidaCosto[]>(() => {
    if (selectedCategoryFilter !== 'Costos Indirectos' || !activeCuenta) return [];
    const mesNumVal = selectedEvolutivoMes || (selectedMesNum > 0 ? selectedMesNum : 8);

    const mesLabels: Record<number, string> = {
      1: 'Enero 2026', 2: 'Febrero 2026', 3: 'Marzo 2026', 4: 'Abril 2026',
      5: 'Mayo 2026', 6: 'Junio 2026', 7: 'Julio 2026', 8: 'Agosto 2026',
      9: 'Septiembre 2026'
    };

    const mesStr = mesNumVal < 10 ? `0${mesNumVal}` : `${mesNumVal}`;

    let rows: SalidaCosto[] = subcategoriasDesglose.map((sub, idx) => {
      const idNum = String(idx + 1).padStart(2, '0');
      return {
        id: `IND-${activeCuenta.codigo}-${idNum}`,
        codigoSalida: `AS-IND-${activeCuenta.codigo}-${idNum}`,
        fecha: `2026-${mesStr}-28`,
        semana: Math.min(mesNumVal * 4, 35),
        semanaLabel: `Semana ${Math.min(mesNumVal * 4, 35)}`,
        mes: mesNumVal,
        mesLabel: mesLabels[mesNumVal] || 'Agosto 2026',
        ano: 2026,
        proyecto: activeCuenta.nombre,
        cuentaAuxiliarCodigo: activeCuenta.codigo,
        cuentaAuxiliarNombre: activeCuenta.proyectoCorto,
        centroCosto: 'IND-CORP',
        categoria: 'Costos Indirectos',
        subcategoria: sub.subcategoria,
        itemDescripcion: `Asignación Corporativa de Costos Indirectos: ${sub.subcategoria} (${activeCuenta.proyectoCorto})`,
        proveedorODestino: 'TIMACA Corporativo -> Proyecto',
        cantidad: 1,
        unidadMedida: 'MES',
        montoUnitario: sub.total,
        montoTotal: sub.total,
        moneda: 'USD',
        responsable: sub.responsable || 'Contabilidad Corporativa',
        solicitante: 'Control de Costos / Administración',
        motivo: `Prorrateo Costos Indirectos (${sub.porcentaje}% del indirecto del proyecto)`,
        estado: 'Verificado',
        observaciones: `Imputación verificada según Matriz de Costos Indirectos Hoja 1 y Prorrateo Presupuestario Oficial 2026`
      };
    });

    if (selectedSubcategoriaFilter !== 'todas') {
      rows = rows.filter(r => r.subcategoria === selectedSubcategoriaFilter);
    }
    if (itemSearchTerm) {
      const q = itemSearchTerm.toLowerCase();
      rows = rows.filter(r => 
        r.codigoSalida.toLowerCase().includes(q) ||
        (r.subcategoria && r.subcategoria.toLowerCase().includes(q)) ||
        r.itemDescripcion.toLowerCase().includes(q) ||
        (r.solicitante && r.solicitante.toLowerCase().includes(q)) ||
        r.responsable.toLowerCase().includes(q) ||
        (r.motivo && r.motivo.toLowerCase().includes(q))
      );
    }
    return rows;
  }, [selectedCategoryFilter, activeCuenta, selectedMesNum, selectedEvolutivoMes, selectedSubcategoriaFilter, itemSearchTerm, subcategoriasDesglose]);

  // Líneas definitivas a mostrar en el Nivel 3 (resuelve Costos Indirectos sin líneas de almacén)
  const lineasParaMostrar = useMemo(() => {
    if (selectedCategoryFilter === 'Costos Indirectos') {
      return lineasCostosIndirectos;
    }
    return lineasProfundas;
  }, [selectedCategoryFilter, lineasCostosIndirectos, lineasProfundas]);

  // Exportar la estructura completa a Excel
  const handleExportProyectos = () => {
    const wb = XLSX.utils.book_new();

    // Hoja 1: Ranking Cuentas Auxiliares
    const rankingData = cuentasRanking.map((c, idx) => ({
      'Ranking': idx + 1,
      'Cuenta Auxiliar': c.codigo,
      'Proyecto Corto': c.proyectoCorto,
      'Nombre Oficial Proyecto': c.nombre,
      [`Total ${mesLabel} (USD)`]: c.totalMonto,
      '% Participación': `${c.porcentaje}%`,
      'Total Movimientos': c.salidasCount
    }));
    const wsRanking = XLSX.utils.json_to_sheet(rankingData);
    XLSX.utils.book_append_sheet(wb, wsRanking, 'Ranking Cuentas Auxiliares');

    // Hoja 2: Desglose por Categorías de la Cuenta Activa
    if (activeCuenta) {
      const catData = categoriasDesglose.map(cd => ({
        'Cuenta Auxiliar': activeCuenta.codigo,
        'Proyecto Corto': activeCuenta.proyectoCorto,
        'Categoría de Costo': cd.categoria,
        'Monto Asignado (USD)`': cd.total,
        '% en Proyecto': `${cd.porcentaje}%`,
        'N° Movimientos': cd.count
      }));
      const wsCat = XLSX.utils.json_to_sheet(catData);
      XLSX.utils.book_append_sheet(wb, wsCat, `Categorias_${activeCuenta.codigo}`);

      // Hoja 3: Detalle Línea por Línea
      const detData = activeCuenta.salidas.map(s => ({
        'Comprobante / Código': s.codigoSalida,
        'Fecha': s.fecha,
        'Semana': s.semanaLabel,
        'Cuenta Auxiliar': s.cuentaAuxiliarCodigo,
        'Proyecto': activeCuenta.proyectoCorto,
        'Categoría': s.categoria,
        'Descripción Material / Servicio': s.itemDescripcion,
        'Destino / Proveedor': s.proveedorODestino,
        'Cantidad': s.cantidad,
        'Unidad': s.unidadMedida,
        'Precio Unitario (USD)': s.montoUnitario,
        'Monto Total (USD)': s.montoTotal,
        'Responsable / Origen': s.responsable,
        'Observaciones': s.observaciones || ''
      }));
      const wsDet = XLSX.utils.json_to_sheet(detData);
      XLSX.utils.book_append_sheet(wb, wsDet, `Auditoria_Lineas_${activeCuenta.codigo}`);
    }

    XLSX.writeFile(wb, `TIMACA_Auditoria_${activeCuenta?.codigo || 'Cuentas'}_${mesLabel.replace(/\s+/g, '_')}.xlsx`);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Controls */}
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
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900 tracking-tight">
                Cuentas Auxiliares & Proyectos Externos TIMACA
              </h2>
              <p className="text-xs text-neutral-500">
                Ranking de clientes por gasto · Categorías contables y auditoría exhaustiva línea por línea
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Selector directo de cuenta auxiliar */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-neutral-600">Cuenta:</span>
            <select
              value={selectedCuentaCodigo}
              onChange={(e) => setSelectedCuentaCodigo(e.target.value)}
              className="text-xs font-bold text-neutral-900 bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 max-w-[260px]"
            >
              {cuentasRanking.map((c, idx) => (
                <option key={c.codigo} value={c.codigo}>
                  #{idx + 1} {c.codigo} · {c.proyectoCorto} (${c.totalMonto.toLocaleString('de-DE')})
                </option>
              ))}
            </select>
          </div>

          {/* Month selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-neutral-600">Período:</span>
            <select
              value={selectedMesNum}
              onChange={(e) => setSelectedMesNum(Number(e.target.value))}
              className="text-xs font-bold text-neutral-900 bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500"
            >
              <option value={9}>Septiembre 2026 (Cierre Operativo Actual)</option>
              <option value={8}>Agosto 2026 (20 Cuentas Activas)</option>
              <option value={0}>Todo el Año 2026 (Ene - Sep)</option>
              {resumenMeses.filter(m => m.mes !== 8 && m.mes !== 9).map((m) => (
                <option key={m.mes} value={m.mes}>
                  {m.mesLabel}
                </option>
              ))}
            </select>
          </div>

          {/* Export to Excel */}
          <button
            onClick={handleExportProyectos}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 rounded-lg hover:bg-emerald-100 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-emerald-700" />
            <span>Descargar Auditoría (.xlsx)</span>
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-fade-in font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>¡Descarga completada!</strong> Se ha generado el archivo Excel con el desglose de categorías y todas las líneas auditadas de <strong>{activeCuenta?.codigo} ({activeCuenta?.proyectoCorto})</strong>.
          </span>
        </div>
      )}

      {/* Main 2-Column Split: Level 1 (Ranking) vs Levels 2 & 3 (Categories & Deep Line Audit) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: NIVEL 1 - RANKING DE CUENTAS AUXILIARES CON NOMBRES CORTOS */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 border-b border-neutral-100 bg-neutral-50/60 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
                  PILAR FUNDAMENTAL TIMACA
                </span>
                <h3 className="text-sm font-bold text-neutral-900">
                  Cuentas Auxiliares (Clientes)
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {formatCurrency(totalGastoPeriodo)}
              </span>
            </div>

            {/* Quick Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar código o proyecto corto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-1.5 bg-white border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Ranking list strictly ordered by total gasto */}
          <div className="divide-y divide-neutral-100 max-h-[720px] overflow-y-auto">
            {cuentasRanking.map((cuenta, idx) => {
              const isSelected = activeCuenta?.codigo === cuenta.codigo;

              return (
                <div
                  key={cuenta.codigo}
                  onClick={() => {
                    setSelectedCuentaCodigo(cuenta.codigo);
                    setSelectedCategoryFilter('Materiales Directos');
                  }}
                  className={`p-3 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-50/80 border-l-4 border-blue-600'
                      : 'hover:bg-neutral-50 border-l-4 border-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 min-w-0">
                      {cuenta.codigo === 'CONSOLIDADO-TIMACA' ? (
                        <span className="w-5 h-5 rounded-md flex items-center justify-center font-mono text-[11px] font-bold shrink-0 mt-0.5 bg-blue-100 text-blue-900 border border-blue-300" title="Consolidado General Corporativo">
                          ★
                        </span>
                      ) : (
                        <span className={`w-5 h-5 rounded-md flex items-center justify-center font-mono text-[10px] font-bold shrink-0 mt-0.5 ${
                          cuenta.codigo === 'TTE-C-0706' || idx === 1
                            ? 'bg-amber-100 text-amber-900 border border-amber-300 font-extrabold'
                            : idx < 4
                            ? 'bg-neutral-200 text-neutral-800'
                            : 'bg-neutral-100 text-neutral-600'
                        }`}>
                          {cuentasRanking[0]?.codigo === 'CONSOLIDADO-TIMACA' ? idx : idx + 1}
                        </span>
                      )}
                      <div className="min-w-0">
                        {/* Short project name prominently displayed */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-extrabold text-neutral-900 text-xs truncate">
                            {cuenta.proyectoCorto}
                          </span>
                          {cuenta.codigo === 'CONSOLIDADO-TIMACA' ? (
                            <span className="text-[8px] font-bold px-1.5 py-0.5 bg-slate-800 text-white rounded shrink-0">
                              MES ACTUAL IMPUTADO GENERAL
                            </span>
                          ) : (cuenta.codigo === 'TTE-C-0706' || (idx === 1 && cuentasRanking[0]?.codigo === 'CONSOLIDADO-TIMACA')) ? (
                            <span className="text-[8px] font-bold px-1.5 py-0.5 bg-amber-500 text-white rounded shrink-0">
                              MAYOR GASTO
                            </span>
                          ) : null}
                        </div>
                        <span className="font-mono text-[11px] font-bold text-blue-700 block">
                          {cuenta.codigo}
                        </span>
                        {(() => {
                          const p = getPresupuestoPorCuenta(cuenta.codigo);
                          if (!p || p.totalPresupuesto === 0) return null;
                          const realData = MATRIZ_REAL_PROYECTOS_MENSUAL_2026[cuenta.codigo];
                          const totalEj = realData ? realData.totalAnual : cuenta.totalMonto;
                          const met = calcularUsoPresupuesto(cuenta.codigo, totalEj);
                          return (
                            <div className="flex items-center gap-1 my-0.5">
                              <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${
                                met.estadoAlerta === 'critico' || met.estadoAlerta === 'excedido'
                                  ? 'bg-red-50 text-red-700 border-red-200'
                                  : met.estadoAlerta === 'alerta'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}>
                                Presup: ${(p.totalPresupuesto / 1000).toLocaleString('de-DE', { maximumFractionDigits: 0 })}k · Uso: {met.porcentajeUso}%
                              </span>
                            </div>
                          );
                        })()}
                        <p className="text-[10px] text-neutral-500 truncate" title={cuenta.nombre}>
                          {cuenta.nombre}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-black font-mono tabular-nums text-neutral-900 block">
                        ${cuenta.totalMonto.toLocaleString('de-DE')}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-500">
                        {cuenta.porcentaje}% ({cuenta.salidasCount} mov.)
                      </span>
                    </div>
                  </div>

                  {/* Horizontal progress relative to total */}
                  <div className="w-full bg-neutral-200/70 h-1.5 rounded-full overflow-hidden mt-1.5">
                    <div
                      style={{ width: `${Math.min(cuenta.porcentaje * 2.2, 100)}%` }}
                      className={`h-full rounded-full ${isSelected ? 'bg-blue-600' : 'bg-neutral-600'}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: NIVEL 2 (CATEGORÍAS DE LA CUENTA) & NIVEL 3 (AUDITORÍA LÍNEA POR LÍNEA) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Active Cuenta Auxiliar Card */}
          {activeCuenta && (
            <div className="bg-slate-700 text-white p-5 rounded-2xl shadow-md border border-slate-600 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-600 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded bg-blue-600 text-white font-mono text-xs font-bold">
                    {activeCuenta.codigo}
                  </span>
                  <span className="text-xs text-amber-300 font-bold uppercase tracking-wider">
                    {activeCuenta.proyectoCorto}
                  </span>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-[10px] text-slate-300 uppercase tracking-wider block">Gasto Total ({mesLabel}):</span>
                  <span className="text-2xl font-black font-mono text-amber-300 tabular-nums">
                    ${activeCuenta.totalMonto.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  {activeCuenta.nombre}
                </h3>
                <p className="text-xs text-slate-200 mt-0.5">
                  Representa el <strong>{activeCuenta.porcentaje}%</strong> del total despachado por TIMACA en {mesLabel}.
                </p>
              </div>

              {/* Bloque de Presupuesto Oficial & Control de Contrato */}
              {presupuestoActivo && presupuestoActivo.tienePresupuesto && (
                <div className="pt-3 border-t border-slate-600 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-800/80 p-3.5 rounded-xl border border-slate-600/60">
                  <div>
                    <span className="text-[10px] text-slate-300 block font-semibold uppercase">Presupuesto Contratado:</span>
                    <span className="text-sm font-bold font-mono text-emerald-300 block">
                      ${presupuestoActivo.totalPresupuesto.toLocaleString('de-DE', { maximumFractionDigits: 0 })} USD
                    </span>
                    {presupuestoActivo.oc && (
                      <span className="text-[9px] text-slate-300 block font-mono mt-0.5">OC: {presupuestoActivo.oc}</span>
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-300 block font-semibold uppercase">Ejecutado Acumulado 2026:</span>
                    <span className="text-sm font-bold font-mono text-white block">
                      ${presupuestoActivo.totalEjecutado.toLocaleString('de-DE', { maximumFractionDigits: 0 })} USD
                    </span>
                    <span className="text-[9px] text-slate-300 block mt-0.5">Enero - Septiembre 2026</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-300 block font-semibold uppercase">Saldo Disponible:</span>
                    <span className={`text-sm font-bold font-mono block ${presupuestoActivo.saldoDisponible >= 0 ? 'text-blue-300' : 'text-red-300'}`}>
                      ${presupuestoActivo.saldoDisponible.toLocaleString('de-DE', { maximumFractionDigits: 0 })} USD
                    </span>
                    <span className="text-[9px] text-slate-300 block mt-0.5">Remanente de Contrato</span>
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-300 font-semibold uppercase">% Uso Presupuesto:</span>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-extrabold border ${
                        presupuestoActivo.estadoAlerta === 'critico' || presupuestoActivo.estadoAlerta === 'excedido'
                          ? 'bg-red-900/60 text-red-200 border-red-700'
                          : presupuestoActivo.estadoAlerta === 'alerta'
                          ? 'bg-amber-900/60 text-amber-200 border-amber-700'
                          : 'bg-emerald-900/60 text-emerald-200 border-emerald-700'
                      }`}>
                        {presupuestoActivo.porcentajeUso}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-900/60 h-2 rounded-full overflow-hidden mt-1.5 border border-slate-600">
                      <div 
                        style={{ width: `${Math.min(presupuestoActivo.porcentajeUso, 100)}%` }}
                        className={`h-full rounded-full transition-all ${
                          presupuestoActivo.estadoAlerta === 'critico' || presupuestoActivo.estadoAlerta === 'excedido'
                            ? 'bg-red-500'
                            : presupuestoActivo.estadoAlerta === 'alerta'
                            ? 'bg-amber-400'
                            : 'bg-emerald-500'
                        }`}
                      />
                    </div>
                    <span className="text-[9px] text-slate-300 block mt-0.5 text-right font-mono">
                      {presupuestoActivo.estadoAlerta === 'critico' ? '⚠️ Alerta: Cierre o Adenda' : 'Avance financiero'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* EVOLUTIVO MENSUAL 2026 CON GRÁFICA DE BARRAS DINÁMICA (REQUERIDO AL SELECCIONAR TODOS LOS MESES O AUDITAR PROYECTO) */}
          {evolutivoCuenta && (
            <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-5">
              {/* Cabecera del Evolutivo */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                      <BarChart3 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-neutral-900">
                        Evolutivo Mensual 2026: {activeCuenta?.codigo} — {activeCuenta?.proyectoCorto}
                      </h4>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        Curva de desembolsos mes a mes (Enero a Septiembre 2026) y distribución por las 5 categorías oficiales
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-neutral-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 tabular-nums">
                    Total Anual: ${evolutivoCuenta.totalAnualCuenta.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                  </span>
                </div>
              </div>

              {/* KPI Highlights for this Account */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Total Acumulado 2026
                  </span>
                  <span className="text-base font-bold font-mono text-slate-900 tabular-nums block mt-0.5">
                    ${evolutivoCuenta.totalAnualCuenta.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">8 meses oficiales</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Mes de Mayor Desembolso
                  </span>
                  <span className="text-base font-bold font-mono text-blue-700 tabular-nums block mt-0.5">
                    ${evolutivoCuenta.mesPico?.total.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    {evolutivoCuenta.mesPico?.mesLabel} ({((evolutivoCuenta.mesPico?.total / (evolutivoCuenta.totalAnualCuenta || 1)) * 100).toFixed(1)}%)
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Promedio Mensual
                  </span>
                  <span className="text-base font-bold font-mono text-slate-900 tabular-nums block mt-0.5">
                    ${evolutivoCuenta.promedioMensual.toLocaleString('de-DE')} USD
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Media mensual</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Mayor Categoría de Costo
                  </span>
                  <span className="text-base font-bold font-mono text-emerald-700 tabular-nums block mt-0.5">
                    ${Math.max(...Object.values(evolutivoCuenta.resumenCategoriasAnual)).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5 block truncate">
                    {Object.entries(evolutivoCuenta.resumenCategoriasAnual).sort((a,b) => b[1] - a[1])[0]?.[0]}
                  </span>
                </div>
              </div>

              {/* GRÁFICA DE BARRAS INTERACTIVA */}
              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <span>Curva Mensual de Desembolsos</span>
                    <span className="text-[11px] font-normal text-slate-500">(Pasa el cursor o haz clic en un mes para auditarlo)</span>
                  </span>
                  {selectedEvolutivoMes && (
                    <button
                      onClick={() => setSelectedEvolutivoMes(null)}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800 underline"
                    >
                      Mostrar todos los meses
                    </button>
                  )}
                </div>

                {/* Visual Bars Container */}
                <div className="h-52 flex items-end justify-between gap-2 pt-6 pb-2 px-2">
                  {evolutivoCuenta.mesesData.map((m, idx) => {
                    const pctHeight = Math.max(12, Math.round((m.total / evolutivoCuenta.maxMesMonto) * 100));
                    const isSelected = selectedEvolutivoMes === m.mesNum;
                    const isHovered = hoveredMesIndex === idx;

                    // Proporciones de categorías
                    const totalMes = m.total || 1;
                    const matH = (m.porCategoria['Materiales Directos'] / totalMes) * 100;
                    const srvH = (m.porCategoria['Servicios'] / totalMes) * 100;
                    const modH = (m.porCategoria['Mano de Obra Directa'] / totalMes) * 100;
                    const hmH  = (m.porCategoria['Horas Maquina'] / totalMes) * 100;
                    const indH = (m.porCategoria['Costos Indirectos'] / totalMes) * 100;

                    return (
                      <div
                        key={m.mesNum}
                        onMouseEnter={() => setHoveredMesIndex(idx)}
                        onMouseLeave={() => setHoveredMesIndex(null)}
                        onClick={() => setSelectedEvolutivoMes(selectedEvolutivoMes === m.mesNum ? null : m.mesNum)}
                        className="flex-1 flex flex-col items-center h-full justify-end cursor-pointer group"
                      >
                        {/* Barra segmentada con los colores de las 5 categorías */}
                        <div 
                          style={{ height: `${pctHeight}%` }}
                          className={`w-full max-w-[50px] rounded-t-lg overflow-hidden flex flex-col justify-end transition-all shadow-2xs ${
                            isSelected 
                              ? 'ring-2 ring-blue-600 ring-offset-1 brightness-105 shadow-md' 
                              : isHovered 
                              ? 'brightness-105 shadow-sm' 
                              : ''
                          }`}
                        >
                          <div style={{ height: `${indH}%` }} className="w-full bg-amber-500" title={`Indirectos: $${Math.round(m.porCategoria['Costos Indirectos']).toLocaleString('de-DE')}`} />
                          <div style={{ height: `${hmH}%` }} className="w-full bg-purple-600" title={`Horas Máquina: $${Math.round(m.porCategoria['Horas Maquina']).toLocaleString('de-DE')}`} />
                          <div style={{ height: `${modH}%` }} className="w-full bg-emerald-600" title={`Mano de Obra: $${Math.round(m.porCategoria['Mano de Obra Directa']).toLocaleString('de-DE')}`} />
                          <div style={{ height: `${srvH}%` }} className="w-full bg-orange-500" title={`Servicios: $${Math.round(m.porCategoria['Servicios']).toLocaleString('de-DE')}`} />
                          <div style={{ height: `${matH}%` }} className="w-full bg-blue-600" title={`Materiales: $${Math.round(m.porCategoria['Materiales Directos']).toLocaleString('de-DE')}`} />
                        </div>

                        {/* Nombre del mes */}
                        <span className={`text-xs font-bold mt-2 transition-colors ${
                          isSelected ? 'text-blue-700 underline font-black' : 'text-slate-600 group-hover:text-slate-900'
                        }`}>
                          {m.mesNombre}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Leyenda de Categorías */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2 border-t border-slate-200/80 text-[11px] text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
                    <span>Materiales Directos</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0" />
                    <span>Servicios</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
                    <span>Mano de Obra Directa</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-600 shrink-0" />
                    <span>Horas Máquina</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                    <span>Costos Indirectos</span>
                  </span>
                </div>

                {/* Mes Activo Detallado (si se seleccionó un mes) */}
                {selectedEvolutivoMes && (
                  <div className="bg-white p-3.5 rounded-xl border border-blue-200 mt-2 animate-fade-in text-xs space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-blue-100 pb-2">
                      <div>
                        <span className="font-bold text-blue-900 text-sm block">
                          Desglose de {evolutivoCuenta.mesesData.find(m => m.mesNum === selectedEvolutivoMes)?.mesLabel}:
                          {evolutivoCuenta.isConsolidado ? ' Consolidado General TIMACA' : ` ${activeCuenta?.codigo} (${activeCuenta?.proyectoCorto})`}
                        </span>
                        {!evolutivoCuenta.isConsolidado && (
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] text-slate-500">
                              Aporte del proyecto: <strong>{((evolutivoCuenta.mesesData.find(m => m.mesNum === selectedEvolutivoMes)?.total || 0) / (TABLA_PPT_DISTRIBUCION_2026.reduce((acc, c) => acc + (c.meses[selectedEvolutivoMes - 1] || 0), 0) || 1) * 100).toFixed(2)}%</strong> del Consolidado TIMACA (${TABLA_PPT_DISTRIBUCION_2026.reduce((acc, c) => acc + (c.meses[selectedEvolutivoMes - 1] || 0), 0).toLocaleString('de-DE')} USD)
                            </span>
                            <button
                              onClick={() => setSelectedCuentaCodigo('CONSOLIDADO-TIMACA')}
                              className="text-[11px] font-bold text-blue-600 hover:text-blue-800 underline cursor-pointer"
                            >
                              Ver Consolidado
                            </button>
                          </div>
                        )}
                      </div>
                      <span className="font-mono font-bold text-neutral-900 text-base">
                        ${evolutivoCuenta.mesesData.find(m => m.mesNum === selectedEvolutivoMes)?.total.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                      {CATEGORIAS_PPT_2026.map(cat => {
                        const val = evolutivoCuenta.mesesData.find(m => m.mesNum === selectedEvolutivoMes)?.porCategoria[cat] || 0;
                        return (
                          <div key={cat} className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                            <span className="text-[10px] text-slate-500 block truncate">{cat}</span>
                            <span className="font-mono font-bold text-slate-800 text-xs tabular-nums block mt-0.5">
                              ${val.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* TABLA: DETALLE DE COSTOS POR PROYECTO 2026 (REPLICA EXACTA DE LA HOJA ESTRELLA) */}
              <div className="bg-white rounded-xl border border-neutral-200 shadow-2xs overflow-hidden space-y-2">
                <div className="p-3 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/70">
                  <div>
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">
                      ESTRUCTURA OFICIAL DEL ARCHIVO ESTRELLA
                    </span>
                    <h5 className="text-xs font-bold text-neutral-900">
                      Detalle de Costos por Proyecto 2026 ({activeCuenta?.codigo} · {activeCuenta?.proyectoCorto})
                    </h5>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-neutral-600 bg-white px-2 py-0.5 rounded border border-neutral-200">
                    {selectedMesNum === 0 || selectedMesNum === 9 ? '9 Meses Oficiales (Ene - Sep 2026)' : '8 Meses Oficiales (Ene - Ago 2026)'}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                        <th className="py-2.5 px-3 min-w-[160px] text-slate-700 font-bold">Categoría de Costo</th>
                        {evolutivoCuenta.mesesData.map(m => (
                          <th key={m.mesNum} className="py-2.5 px-2 text-right font-mono text-slate-600 font-semibold">
                            {m.mesNombre}
                          </th>
                        ))}
                        <th className="py-2.5 px-3 text-right font-mono font-bold text-slate-800 bg-slate-100/80">
                          Total 2026
                        </th>
                        <th className="py-2.5 px-2.5 text-right font-mono font-semibold text-slate-600">
                          % Part.
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 bg-white">
                      {CATEGORIAS_PPT_2026.map(cat => {
                        const totalCatAnual = evolutivoCuenta.resumenCategoriasAnual[cat] || 0;
                        const pctCat = ((totalCatAnual / (evolutivoCuenta.totalAnualCuenta || 1)) * 100).toFixed(2);
                        return (
                          <tr key={cat} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-2 px-3 font-semibold text-neutral-800">
                              <span className="flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full shrink-0 ${
                                  cat === 'Materiales Directos' ? 'bg-blue-600'
                                  : cat === 'Servicios' ? 'bg-orange-500'
                                  : cat === 'Mano de Obra Directa' ? 'bg-emerald-600'
                                  : cat === 'Horas Maquina' ? 'bg-purple-600'
                                  : 'bg-amber-500'
                                }`} />
                                <span>{cat}</span>
                              </span>
                            </td>
                            {evolutivoCuenta.mesesData.map(m => {
                              const val = m.porCategoria[cat] || 0;
                              return (
                                <td key={m.mesNum} className="py-2 px-2 text-right font-mono tabular-nums text-neutral-700">
                                  {val > 0 ? `$${Math.round(val).toLocaleString('de-DE')}` : '-'}
                                </td>
                              );
                            })}
                            <td className="py-2 px-3 text-right font-mono font-bold tabular-nums text-neutral-900 bg-slate-50/70">
                              ${totalCatAnual.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="py-2 px-2.5 text-right font-mono font-semibold tabular-nums text-neutral-600 text-[11px]">
                              {pctCat}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-slate-100 border-t-2 border-slate-300 text-slate-900 font-bold text-xs">
                      <tr>
                        <td className="py-2.5 px-3 uppercase tracking-wider font-extrabold text-slate-900">
                          COSTO TOTAL 2026
                        </td>
                        {evolutivoCuenta.mesesData.map(m => (
                          <td key={m.mesNum} className="py-2.5 px-2 text-right font-mono tabular-nums font-bold text-slate-900">
                            ${Math.round(m.total).toLocaleString('de-DE')}
                          </td>
                        ))}
                        <td className="py-2.5 px-3 text-right font-mono text-xs font-black text-slate-900 bg-slate-200/70 tabular-nums">
                          ${evolutivoCuenta.totalAnualCuenta.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-2.5 text-right font-mono text-slate-800 font-bold text-[11px]">
                          100.00%
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* NIVEL 2: CATEGORÍAS DE LA CUENTA AUXILIAR */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
                  NIVEL 2 · CATEGORIZACIÓN DEL GASTO
                </span>
                <h4 className="text-sm font-bold text-neutral-900">
                  Distribución en las 5 Categorías para {activeCuenta?.codigo} ({activeCuenta?.proyectoCorto})
                </h4>
              </div>
              <span className="text-xs text-neutral-500">
                Haz clic en una categoría para auditar sus líneas abajo
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {categoriasDesglose.map((cat) => {
                const isCatSelected = selectedCategoryFilter === cat.categoria;

                return (
                  <div
                    key={cat.categoria}
                    onClick={() => setSelectedCategoryFilter(cat.categoria)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isCatSelected
                        ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20 shadow-xs'
                        : 'border-neutral-200 hover:border-neutral-300 bg-white'
                    }`}
                  >
                    <span className="font-bold text-neutral-900 text-xs block truncate" title={cat.categoria}>
                      {cat.categoria}
                    </span>
                    <span className="text-xs font-mono font-bold text-neutral-900 block mt-1">
                      ${Math.round(cat.total).toLocaleString('de-DE')}
                    </span>
                    <div className="flex items-center justify-between text-[10px] text-neutral-500 mt-1">
                      <span>{cat.porcentaje}%</span>
                      <span>{cat.count} líneas</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* NIVEL 2.5: SUBCATEGORÍAS DE LA CATEGORÍA SELECCIONADA */}
          {selectedCategoryFilter !== 'todas' && (
            <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-4 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${
                    selectedCategoryFilter === 'Servicios' ? 'bg-orange-50 text-orange-600' :
                    selectedCategoryFilter === 'Materiales Directos' ? 'bg-blue-50 text-blue-600' :
                    selectedCategoryFilter === 'Mano de Obra Directa' ? 'bg-emerald-50 text-emerald-600' :
                    selectedCategoryFilter === 'Horas Maquina' ? 'bg-purple-50 text-purple-600' :
                    'bg-amber-50 text-amber-600'
                  }`}>
                    {selectedCategoryFilter === 'Servicios' ? <Truck className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
                      NIVEL 2.5 · DESGLOSE DETALLADO POR SUBCATEGORÍAS
                    </span>
                    <h4 className="text-sm font-bold text-neutral-900">
                      Subconceptos de {selectedCategoryFilter}: {activeCuenta?.codigo} ({activeCuenta?.proyectoCorto})
                    </h4>
                  </div>
                </div>

                {/* Botón para alternar matriz oficial de Servicios */}
                {selectedCategoryFilter === 'Servicios' && activeCuenta?.codigo === 'TTE-C-0706' && selectedMesNum !== 9 && selectedEvolutivoMes !== 9 && (
                  <button
                    onClick={() => setShowMatrizOficialServicios(!showMatrizOficialServicios)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all text-blue-800 bg-blue-50 border-blue-200 hover:bg-blue-100 shadow-2xs self-start sm:self-auto cursor-pointer"
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-blue-700" />
                    <span>{showMatrizOficialServicios ? 'Ocultar Matriz PPT' : 'Ver Matriz Oficial PPT (Servicios $226.635 USD)'}</span>
                  </button>
                )}

                {/* Botón para alternar matriz oficial de Horas Máquina */}
                {selectedCategoryFilter === 'Horas Maquina' && activeCuenta?.codigo === 'TTE-C-0706' && selectedMesNum !== 9 && selectedEvolutivoMes !== 9 && (
                  <button
                    onClick={() => setShowMatrizOficialHorasMaquina(!showMatrizOficialHorasMaquina)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all text-purple-800 bg-purple-50 border-purple-200 hover:bg-purple-100 shadow-2xs self-start sm:self-auto cursor-pointer"
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-purple-700" />
                    <span>{showMatrizOficialHorasMaquina ? 'Ocultar Matriz PPT' : 'Ver Matriz Oficial PPT (Horas Máquina 1.396h · $89.789 USD)'}</span>
                  </button>
                )}

                {/* Botón para alternar matriz oficial de Costos Indirectos (Imagen 5) */}
                {selectedCategoryFilter === 'Costos Indirectos' && (
                  <button
                    onClick={() => setShowMatrizOficialIndirectos(!showMatrizOficialIndirectos)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all text-amber-800 bg-amber-50 border-amber-200 hover:bg-amber-100 shadow-2xs self-start sm:self-auto cursor-pointer"
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-amber-700" />
                    <span>{showMatrizOficialIndirectos ? 'Ocultar Matriz PPT' : 'Ver Matriz Oficial PPT (Costos Indirectos $1.682.313 USD)'}</span>
                  </button>
                )}
              </div>

              {/* Subcategory Pills / Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
                {/* Botón Ver Todas solo cuando hay más de una subcategoría (evita tarjeta redundante en Mano de Obra) */}
                {subcategoriasDesglose.length > 1 && (
                  <div
                    onClick={() => setSelectedSubcategoriaFilter('todas')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedSubcategoriaFilter === 'todas'
                        ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-500/20 shadow-xs'
                        : 'border-neutral-200 hover:border-neutral-300 bg-white'
                    }`}
                  >
                    <span className="font-bold text-neutral-900 text-xs block truncate">
                      Todas las Subcategorías
                    </span>
                    <span className="text-xs font-mono font-bold text-neutral-900 block mt-1">
                      ${Math.round(subcategoriasDesglose.reduce((sum, s) => sum + s.total, 0)).toLocaleString('de-DE')}
                    </span>
                    <div className="text-[10px] text-neutral-500 mt-1">
                      100% ({subcategoriasDesglose.reduce((sum, s) => sum + s.count, 0)} líneas)
                    </div>
                  </div>
                )}

                {/* Cada Subcategoría */}
                {subcategoriasDesglose.map((sub) => {
                  const isSelected = selectedSubcategoriaFilter === sub.subcategoria;
                  return (
                    <div
                      key={sub.subcategoria}
                      onClick={() => setSelectedSubcategoriaFilter(isSelected ? 'todas' : sub.subcategoria)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? selectedCategoryFilter === 'Servicios'
                            ? 'border-orange-600 bg-orange-50/90 ring-2 ring-orange-500/20 shadow-xs'
                            : selectedCategoryFilter === 'Horas Maquina'
                            ? 'border-purple-600 bg-purple-50/90 ring-2 ring-purple-500/20 shadow-xs'
                            : selectedCategoryFilter === 'Costos Indirectos'
                            ? 'border-amber-600 bg-amber-50/90 ring-2 ring-amber-500/20 shadow-xs'
                            : 'border-blue-600 bg-blue-50/90 ring-2 ring-blue-500/20 shadow-xs'
                          : 'border-neutral-200 hover:border-neutral-300 bg-white'
                      }`}
                      title={sub.subcategoria}
                    >
                      <span className="font-bold text-neutral-900 text-xs block truncate">
                        {sub.subcategoria}
                      </span>
                      <span className="text-xs font-mono font-bold text-neutral-900 block mt-1">
                        ${Math.round(sub.total).toLocaleString('de-DE')}
                      </span>
                      <div className="flex items-center justify-between text-[10px] text-neutral-500 mt-1">
                        <span>{sub.porcentaje}%</span>
                        <span>{sub.count} {sub.count === 1 ? 'línea' : 'líneas'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* TARJETA DEDICADA DE PRORRATEO Y ANCLA MOD (SOLO EN COSTOS INDIRECTOS) */}
              {selectedCategoryFilter === 'Costos Indirectos' && datosProrrateoProyecto && (
                <div className="mt-4 pt-4 border-t border-neutral-200 space-y-4 animate-fade-in">
                  <div className="bg-gradient-to-br from-amber-50/90 via-white to-amber-50/40 p-5 rounded-2xl border-2 border-amber-300/80 shadow-xs space-y-4">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/80 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-amber-600 text-white rounded-xl shadow-xs">
                          <Layers className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-black text-amber-800 uppercase tracking-wider block">
                            MECANISMO DE ASIGNACIÓN CORPORATIVA · {datosProrrateoProyecto.isAnual ? 'TODO EL AÑO 2026' : (datosProrrateoProyecto.mesTarget === 8 ? 'AGOSTO 2026' : mesLabel.toUpperCase())}
                          </span>
                          <h4 className="text-sm sm:text-base font-black text-neutral-900">
                            Dinámica Oficial de Prorrateo y Ancla MOD ({activeCuenta?.codigo} · {activeCuenta?.proyectoCorto})
                          </h4>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-black px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-lg self-start sm:self-auto shadow-2xs">
                        Total Asignado a {activeCuenta?.proyectoCorto}: ${Math.round(datosProrrateoProyecto.indirectoProyecto).toLocaleString('de-DE')} USD
                      </span>
                    </div>

                    {/* 4 Métricas de Distribución */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-2xs">
                        <span className="text-[10px] font-bold text-neutral-500 uppercase block">1. Bolsa Total a Prorratear</span>
                        <span className="text-base font-mono font-black text-neutral-900 block mt-0.5">
                          ${Math.round(datosProrrateoProyecto.bolsaTotal).toLocaleString('de-DE')} USD
                        </span>
                        <span className="text-[11px] text-neutral-600 mt-1 block">14 rubros contables corporativos TIMACA</span>
                      </div>
                      <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-2xs">
                        <span className="text-[10px] font-bold text-amber-700 uppercase block">2. MOD Proyecto (Ancla)</span>
                        <span className="text-base font-mono font-black text-amber-900 block mt-0.5">
                          ${Math.round(datosProrrateoProyecto.modProyecto).toLocaleString('de-DE')} USD
                        </span>
                        <span className="text-[11px] text-neutral-600 mt-1 block">Esfuerzo operativo ({datosProrrateoProyecto.pctMOD}% del total)</span>
                      </div>
                      <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-2xs">
                        <span className="text-[10px] font-bold text-emerald-700 uppercase block">3. Cuota Asignada (Indirectos)</span>
                        <span className="text-base font-mono font-black text-emerald-900 block mt-0.5">
                          ${Math.round(datosProrrateoProyecto.indirectoProyecto).toLocaleString('de-DE')} USD
                        </span>
                        <span className="text-[11px] text-neutral-600 mt-1 block">Distribución según matriz oficial TIMACA</span>
                      </div>
                      <div className="bg-amber-600 text-white p-3.5 rounded-xl shadow-xs">
                        <span className="text-[10px] font-bold uppercase text-amber-100 block">4. Absorción del Proyecto</span>
                        <span className="text-base font-mono font-black block mt-0.5">
                          {datosProrrateoProyecto.pctAbsorcion}% de la Bolsa Total
                        </span>
                        <span className="text-[11px] text-amber-100 mt-1 block">
                          Resto Proyectos: ${Math.round(datosProrrateoProyecto.restoProyectos).toLocaleString('de-DE')} USD
                        </span>
                      </div>
                    </div>

                    {/* Barra Visual de Absorción */}
                    <div className="space-y-1.5 bg-white p-3.5 rounded-xl border border-amber-200 shadow-2xs">
                      <div className="flex justify-between text-xs font-bold text-neutral-700">
                        <span>Distribución de la Bolsa (${Math.round(datosProrrateoProyecto.bolsaTotal).toLocaleString('de-DE')} USD)</span>
                        <span>{activeCuenta?.proyectoCorto}: {datosProrrateoProyecto.pctAbsorcion}% vs Demás Proyectos</span>
                      </div>
                      <div className="w-full h-3 bg-neutral-200 rounded-full overflow-hidden flex">
                        <div 
                          className="bg-amber-600 h-full transition-all duration-500" 
                          style={{ width: `${Math.min(100, Math.max(0, datosProrrateoProyecto.pctAbsorcion))}%` }} 
                          title={activeCuenta?.proyectoCorto}
                        />
                        <div 
                          className="bg-slate-400 h-full transition-all duration-500" 
                          style={{ width: `${Math.min(100, Math.max(0, 100 - datosProrrateoProyecto.pctAbsorcion))}%` }} 
                          title="Demás Proyectos"
                        />
                      </div>
                    </div>

                    {/* Explicación Técnica de la Dinámica de Prorrateo */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-neutral-700 pt-1">
                      <div className="p-3 bg-white rounded-xl border border-amber-200/80 space-y-1">
                        <strong className="text-amber-900 block flex items-center gap-1.5 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                          La Mano de Obra Directa (MOD) como Ancla de Reparto:
                        </strong>
                        <p className="text-[11px] text-neutral-600 leading-relaxed">
                          El modelo oficial TIMACA no asigna gastos corporativos de manera lineal o arbitraria. Utiliza el costo y esfuerzo de Mano de Obra Directa de cada proyecto como ponderador técnico. Para este período, {activeCuenta?.proyectoCorto} acumula ${Math.round(datosProrrateoProyecto.modProyecto).toLocaleString('de-DE')} USD en MOD ({datosProrrateoProyecto.pctMOD}% del esfuerzo general de planta y campo).
                        </p>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-amber-200/80 space-y-1">
                        <strong className="text-amber-900 block flex items-center gap-1.5 font-bold">
                          <Shield className="w-3.5 h-3.5 text-amber-600" />
                          Criterio de Imputación y Conciliación Contable:
                        </strong>
                        <p className="text-[11px] text-neutral-600 leading-relaxed">
                          Los <strong>${Math.round(datosProrrateoProyecto.indirectoProyecto).toLocaleString('de-DE')} USD</strong> asignados a este proyecto se desglosan en las 14 categorías corporativas (nómina de planta, talleres, sindicato, combustible, vigilancia y servicios), garantizando trazabilidad contable total según la matriz oficial 2026.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* MATRIZ EVOLUTIVA OFICIAL PPT DE SERVICIOS (DESPLEGABLE / EXPANDIBLE) */}
              {selectedCategoryFilter === 'Servicios' && showMatrizOficialServicios && activeCuenta?.codigo === 'TTE-C-0706' && selectedMesNum !== 9 && selectedEvolutivoMes !== 9 && (
                <div className="mt-4 pt-4 border-t border-neutral-200 space-y-4 animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                        LÁMINA OFICIAL DE LA PRESENTACIÓN DE COSTOS
                      </span>
                      <h5 className="text-xs font-black text-neutral-900 uppercase">
                        PROYECTO PELLAS 1: SERVICIOS DIRECTOS (ABRIL - AGOSTO 2026)
                      </h5>
                    </div>
                    <span className="text-xs font-mono font-bold px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-300 rounded-lg">
                      Total Acumulado: ${TOTALES_SERVICIOS_DIRECTOS_PELLAS.total.toLocaleString('de-DE')} USD
                    </span>
                  </div>

                  {/* Tabla de 19 filas oficial */}
                  <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs bg-white max-h-[360px] overflow-y-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="sticky top-0 z-10 bg-[#0b2545] text-white font-bold">
                        <tr>
                          <th className="py-2.5 px-3">Servicios</th>
                          <th className="py-2.5 px-2.5 text-right font-mono">abril</th>
                          <th className="py-2.5 px-2.5 text-right font-mono">mayo</th>
                          <th className="py-2.5 px-2.5 text-right font-mono">junio</th>
                          <th className="py-2.5 px-2.5 text-right font-mono">julio</th>
                          <th className={`py-2.5 px-2.5 text-right font-mono ${selectedMesNum === 8 ? 'bg-amber-600/70 font-black text-white' : ''}`}>agosto</th>
                          <th className="py-2.5 px-3 text-right font-mono bg-slate-900">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {TABLA_SERVICIOS_DIRECTOS_PELLAS_OFICIAL.map((srv, idx) => (
                          <tr key={srv.id} className={idx % 2 === 0 ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/50 hover:bg-slate-50'}>
                            <td className="py-2 px-3 text-slate-800 font-semibold">{srv.servicio}</td>
                            <td className="py-2 px-2.5 text-right font-mono text-slate-600">{srv.abril > 0 ? `$${srv.abril.toLocaleString('de-DE')}` : '-'}</td>
                            <td className="py-2 px-2.5 text-right font-mono text-slate-600">{srv.mayo > 0 ? `$${srv.mayo.toLocaleString('de-DE')}` : '-'}</td>
                            <td className="py-2 px-2.5 text-right font-mono text-slate-600">{srv.junio > 0 ? `$${srv.junio.toLocaleString('de-DE')}` : '-'}</td>
                            <td className="py-2 px-2.5 text-right font-mono text-slate-600">{srv.julio > 0 ? `$${srv.julio.toLocaleString('de-DE')}` : '-'}</td>
                            <td className={`py-2 px-2.5 text-right font-mono font-bold ${selectedMesNum === 8 ? 'text-amber-900 bg-amber-50/70' : 'text-slate-700'}`}>{srv.agosto > 0 ? `$${srv.agosto.toLocaleString('de-DE')}` : '-'}</td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 bg-slate-100/70">${srv.total.toLocaleString('de-DE')}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="sticky bottom-0 z-10 bg-slate-100 font-black border-t-2 border-slate-300 text-slate-900">
                        <tr>
                          <td className="py-2 px-3 uppercase tracking-wider">Total general</td>
                          <td className="py-2 px-2.5 text-right font-mono">${TOTALES_SERVICIOS_DIRECTOS_PELLAS.abril.toLocaleString('de-DE')}</td>
                          <td className="py-2 px-2.5 text-right font-mono">${TOTALES_SERVICIOS_DIRECTOS_PELLAS.mayo.toLocaleString('de-DE')}</td>
                          <td className="py-2 px-2.5 text-right font-mono">${TOTALES_SERVICIOS_DIRECTOS_PELLAS.junio.toLocaleString('de-DE')}</td>
                          <td className="py-2 px-2.5 text-right font-mono">${TOTALES_SERVICIOS_DIRECTOS_PELLAS.julio.toLocaleString('de-DE')}</td>
                          <td className={`py-2 px-2.5 text-right font-mono ${selectedMesNum === 8 ? 'text-amber-900 bg-amber-200/80 font-black' : ''}`}>${TOTALES_SERVICIOS_DIRECTOS_PELLAS.agosto.toLocaleString('de-DE')}</td>
                          <td className="py-2 px-3 text-right font-mono text-blue-900 bg-slate-200">${TOTALES_SERVICIOS_DIRECTOS_PELLAS.total.toLocaleString('de-DE')}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Bullets de Análisis de la lámina oficial */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                    {ANALISIS_SERVICIOS_DIRECTOS_PELLAS.map((a, i) => (
                      <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                        <strong className="text-xs font-bold text-[#0b2545] block">{a.titulo}</strong>
                        <p className="text-[11px] text-slate-600 leading-relaxed">{a.descripcion}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MATRIZ OFICIAL PPT DE HORAS MÁQUINA (22 EQUIPOS - TTE-C-0706) */}
              {selectedCategoryFilter === 'Horas Maquina' && showMatrizOficialHorasMaquina && activeCuenta?.codigo === 'TTE-C-0706' && selectedMesNum !== 9 && selectedEvolutivoMes !== 9 && (
                <div className="mt-4 pt-4 border-t border-neutral-200 space-y-4 animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block">
                        LÁMINA OFICIAL DE LA PRESENTACIÓN DE COSTOS
                      </span>
                      <h5 className="text-xs font-black text-neutral-900 uppercase">
                        PROYECTO PELLAS 1: HORAS MÁQUINA (DESGLOSE DE 22 EQUIPOS)
                      </h5>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2.5 py-1 bg-purple-50 text-purple-900 border border-purple-300 rounded-lg">
                        Total Horas: {TOTALES_HORAS_MAQUINA_PELLAS.totalHoras.toLocaleString('de-DE')} H/M
                      </span>
                      <span className="text-xs font-mono font-bold px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-300 rounded-lg">
                        Costo Total: ${TOTALES_HORAS_MAQUINA_PELLAS.totalCosto.toLocaleString('de-DE')} USD
                      </span>
                    </div>
                  </div>

                  {/* Tabla de 22 equipos oficial */}
                  <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs bg-white max-h-[380px] overflow-y-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="sticky top-0 z-10 bg-[#0b2545] text-white font-bold">
                        <tr>
                          <th className="py-2.5 px-3 min-w-[70px]">Cuenta-Aux</th>
                          <th className="py-2.5 px-2.5 min-w-[65px] font-mono">Codigo</th>
                          <th className="py-2.5 px-3 min-w-[200px]">EQUIPO</th>
                          <th className="py-2.5 px-3 min-w-[180px]">Subcategoría Operacional</th>
                          <th className="py-2.5 px-2.5 text-right font-mono min-w-[90px]">Tarifa ($/h)</th>
                          <th className="py-2.5 px-2.5 text-right font-mono min-w-[85px]">Total H/M</th>
                          <th className="py-2.5 px-3 text-right font-mono bg-slate-900 min-w-[110px]">Costo Total H/M ($)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {TABLA_HORAS_MAQUINA_PELLAS_OFICIAL.map((eq, idx) => (
                          <tr key={idx} className={idx % 2 === 0 ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/50 hover:bg-slate-50'}>
                            <td className="py-2 px-3 font-mono text-slate-600">{eq.cuentaAux}</td>
                            <td className="py-2 px-2.5 font-mono font-bold text-blue-700">{eq.codigo}</td>
                            <td className="py-2 px-3 text-slate-900 font-semibold">{eq.equipo}</td>
                            <td className="py-2 px-3 text-slate-600 text-[11px]">{eq.subcategoria}</td>
                            <td className="py-2 px-2.5 text-right font-mono text-slate-700">${eq.tarifa.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            <td className="py-2 px-2.5 text-right font-mono font-bold text-slate-800">{eq.totalHM.toLocaleString('de-DE', { minimumFractionDigits: 1 })}</td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-purple-900 bg-purple-50/40">${eq.costoTotalHM.toLocaleString('de-DE')}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="sticky bottom-0 z-10 bg-slate-100 font-black border-t-2 border-slate-300 text-slate-900">
                        <tr>
                          <td colSpan={5} className="py-2.5 px-3 uppercase tracking-wider">Total General</td>
                          <td className="py-2.5 px-2.5 text-right font-mono text-slate-900">{TOTALES_HORAS_MAQUINA_PELLAS.totalHoras.toLocaleString('de-DE')} h</td>
                          <td className="py-2.5 px-3 text-right font-mono text-purple-900 bg-slate-200 text-sm">${TOTALES_HORAS_MAQUINA_PELLAS.totalCosto.toLocaleString('de-DE')} USD</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Notas de la lámina oficial */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                    {NOTAS_HORAS_MAQUINA_PELLAS.map((n, i) => (
                      <div key={i} className="p-3 rounded-xl bg-purple-50/50 border border-purple-200/80 space-y-1">
                        <strong className="text-xs font-bold text-purple-950 block">{n.titulo}</strong>
                        <p className="text-[11px] text-slate-600 leading-relaxed">{n.descripcion}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MATRIZ EVOLUTIVA OFICIAL PPT DE COSTOS INDIRECTOS (DESPLEGABLE / EXPANDIBLE - IMAGEN 5) */}
              {selectedCategoryFilter === 'Costos Indirectos' && showMatrizOficialIndirectos && (
                <div className="mt-4 pt-4 border-t border-neutral-200 space-y-4 animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">
                        MATRIZ DE DISTRIBUCIÓN Y PRORRATEO CORPORATIVO
                      </span>
                      <h5 className="text-xs font-black text-neutral-900 uppercase">
                        COSTOS INDIRECTOS A PRORRATEAR (ENERO - SEPTIEMBRE 2026)
                      </h5>
                    </div>
                    <span className="text-xs font-mono font-bold px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-300 rounded-lg">
                      Bolsa Total 2026: ${TOTALES_COSTOS_INDIRECTOS_OFICIAL.total.toLocaleString('de-DE')} USD
                    </span>
                  </div>

                  {/* Tabla de 15 filas oficial de Costos Indirectos */}
                  <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs bg-white max-h-[360px] overflow-y-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="sticky top-0 z-10 bg-[#1e293b] text-white font-bold">
                        <tr>
                          <th className="py-2.5 px-3">Costos Indirectos a Prorratear</th>
                          <th className="py-2.5 px-2 text-right font-mono">Ene</th>
                          <th className="py-2.5 px-2 text-right font-mono">Feb</th>
                          <th className="py-2.5 px-2 text-right font-mono">Mar</th>
                          <th className="py-2.5 px-2 text-right font-mono">Abr</th>
                          <th className="py-2.5 px-2 text-right font-mono">May</th>
                          <th className="py-2.5 px-2 text-right font-mono">Jun</th>
                          <th className="py-2.5 px-2 text-right font-mono">Jul</th>
                          <th className={`py-2.5 px-2.5 text-right font-mono ${selectedMesNum === 8 ? 'bg-amber-600 font-black text-white' : ''}`}>Ago</th>
                          <th className={`py-2.5 px-2.5 text-right font-mono ${selectedMesNum === 9 ? 'bg-amber-600 font-black text-white' : ''}`}>Sep</th>
                          <th className="py-2.5 px-3 text-right font-mono bg-slate-900">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {TABLA_COSTOS_INDIRECTOS_OFICIAL.map((ind, idx) => (
                          <tr key={ind.id} className={ind.esDirectoPellas ? 'bg-amber-50/80 font-bold hover:bg-amber-100' : idx % 2 === 0 ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/50 hover:bg-slate-50'}>
                            <td className="py-2 px-3 text-slate-800 font-semibold flex items-center gap-1.5">
                              {ind.esDirectoPellas && <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500 text-white font-bold">Pellas</span>}
                              <span>{ind.concepto}</span>
                            </td>
                            <td className="py-2 px-2 text-right font-mono text-slate-600">{ind.ene > 0 ? `$${ind.ene.toLocaleString('de-DE')}` : '-'}</td>
                            <td className="py-2 px-2 text-right font-mono text-slate-600">{ind.feb > 0 ? `$${ind.feb.toLocaleString('de-DE')}` : '-'}</td>
                            <td className="py-2 px-2 text-right font-mono text-slate-600">{ind.mar > 0 ? `$${ind.mar.toLocaleString('de-DE')}` : '-'}</td>
                            <td className="py-2 px-2 text-right font-mono text-slate-600">{ind.abr > 0 ? `$${ind.abr.toLocaleString('de-DE')}` : '-'}</td>
                            <td className="py-2 px-2 text-right font-mono text-slate-600">{ind.may > 0 ? `$${ind.may.toLocaleString('de-DE')}` : '-'}</td>
                            <td className="py-2 px-2 text-right font-mono text-slate-600">{ind.jun > 0 ? `$${ind.jun.toLocaleString('de-DE')}` : '-'}</td>
                            <td className="py-2 px-2 text-right font-mono text-slate-600">{ind.jul > 0 ? `$${ind.jul.toLocaleString('de-DE')}` : '-'}</td>
                            <td className={`py-2 px-2.5 text-right font-mono font-bold ${selectedMesNum === 8 ? 'text-amber-900 bg-amber-100/80' : 'text-slate-700'}`}>{ind.ago > 0 ? `$${ind.ago.toLocaleString('de-DE')}` : '-'}</td>
                            <td className={`py-2 px-2.5 text-right font-mono font-bold ${selectedMesNum === 9 ? 'text-amber-900 bg-amber-100/80' : 'text-slate-700'}`}>{ind.sep && ind.sep > 0 ? `$${ind.sep.toLocaleString('de-DE')}` : '-'}</td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 bg-slate-100/70">${ind.total.toLocaleString('de-DE')}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="sticky bottom-0 z-10 bg-slate-100 font-black border-t-2 border-slate-300 text-slate-900">
                        <tr>
                          <td className="py-2 px-3 uppercase tracking-wider">Total General</td>
                          <td className="py-2 px-2 text-right font-mono">${TOTALES_COSTOS_INDIRECTOS_OFICIAL.ene.toLocaleString('de-DE')}</td>
                          <td className="py-2 px-2 text-right font-mono">${TOTALES_COSTOS_INDIRECTOS_OFICIAL.feb.toLocaleString('de-DE')}</td>
                          <td className="py-2 px-2 text-right font-mono">${TOTALES_COSTOS_INDIRECTOS_OFICIAL.mar.toLocaleString('de-DE')}</td>
                          <td className="py-2 px-2 text-right font-mono">${TOTALES_COSTOS_INDIRECTOS_OFICIAL.abr.toLocaleString('de-DE')}</td>
                          <td className="py-2 px-2 text-right font-mono">${TOTALES_COSTOS_INDIRECTOS_OFICIAL.may.toLocaleString('de-DE')}</td>
                          <td className="py-2 px-2 text-right font-mono">${TOTALES_COSTOS_INDIRECTOS_OFICIAL.jun.toLocaleString('de-DE')}</td>
                          <td className="py-2 px-2 text-right font-mono">${TOTALES_COSTOS_INDIRECTOS_OFICIAL.jul.toLocaleString('de-DE')}</td>
                          <td className={`py-2 px-2.5 text-right font-mono ${selectedMesNum === 8 ? 'text-amber-900 bg-amber-200/80 font-black' : ''}`}>${TOTALES_COSTOS_INDIRECTOS_OFICIAL.ago.toLocaleString('de-DE')}</td>
                          <td className={`py-2 px-2.5 text-right font-mono ${selectedMesNum === 9 ? 'text-amber-900 bg-amber-200/80 font-black' : ''}`}>${TOTALES_COSTOS_INDIRECTOS_OFICIAL.sep.toLocaleString('de-DE')}</td>
                          <td className="py-2 px-3 text-right font-mono text-amber-900 bg-amber-100 font-black">${TOTALES_COSTOS_INDIRECTOS_OFICIAL.total.toLocaleString('de-DE')}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-amber-700" />
                      <span>Metodología Oficial de Imputación de Costos Indirectos:</span>
                    </p>
                    <p className="text-[11px] text-amber-800">
                      En Septiembre 2026, la bolsa total oficial de Costos Indirectos a prorratear es de <strong>$73.000 USD</strong> (acumulado anual de <strong>$1.755.313 USD</strong>), correspondiente a la <em>Nómina Interna TIMACA / Operaciones</em>, distribuida entre los proyectos externos mediante el ponderador técnico de Mano de Obra Directa (MOD) según sus coeficientes de absorción contable.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* NIVEL 3: AUDITORÍA EXHAUSTIVA LÍNEA POR LÍNEA (NO MÁS TABLAS VACÍAS) */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-600" />
                  <h4 className="text-sm font-bold text-neutral-900">
                    Auditoría Línea por Línea: "{selectedCategoryFilter}" en {activeCuenta?.codigo}
                  </h4>
                </div>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Verificación de comprobantes SIP, vales de almacén, cantidades y precios para detectar malas imputaciones
                </p>
              </div>

              {/* Category filter buttons inside the table */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedCategoryFilter('todas')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                    selectedCategoryFilter === 'todas'
                      ? 'bg-neutral-900 text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  Ver Todas ({activeCuenta?.salidas.length})
                </button>
              </div>
            </div>

            {/* In-table Search */}
            <div className="flex items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filtrar por código SIP, descripción de material o servicio..."
                  value={itemSearchTerm}
                  onChange={(e) => setItemSearchTerm(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-1.5 bg-neutral-50 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <span className="text-xs font-mono font-bold text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded-lg">
                {lineasParaMostrar.length} movimientos auditados
              </span>
            </div>

            {/* Line by Line Detailed Table */}
            {lineasParaMostrar.length > 0 ? (
              <div className="border border-neutral-200 rounded-xl overflow-x-auto max-h-[480px] overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 z-10 bg-slate-800 text-white font-semibold border-b border-slate-700">
                    <tr>
                      <th className="py-2.5 px-2.5 min-w-[70px]">Almacén / Tipo</th>
                      <th className="py-2.5 px-3 min-w-[85px]">Fecha</th>
                      <th className="py-2.5 px-3 min-w-[95px] font-mono">Número (DP)</th>
                      <th className="py-2.5 px-3 min-w-[85px] font-mono">Pedido (PA)</th>
                      <th className="py-2.5 px-2.5 min-w-[65px] font-mono">Ceco</th>
                      <th className="py-2.5 px-3 min-w-[150px]">Subcategoría</th>
                      <th className="py-2.5 px-4 min-w-[240px]">Descripción Detallada</th>
                      <th className="py-2.5 px-2.5 text-right min-w-[70px]">Cantidad</th>
                      <th className="py-2.5 px-2 min-w-[50px]">Unidad</th>
                      <th className="py-2.5 px-3 min-w-[130px]">Solicitante</th>
                      <th className="py-2.5 px-4 min-w-[200px]">Motivo de Obra</th>
                      <th className="py-2.5 px-3 text-right min-w-[90px]">Precio Final ($)</th>
                      <th className="py-2.5 px-3 text-right bg-slate-900 min-w-[110px]">Total USD</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 bg-white">
                    {lineasParaMostrar.map((s) => {
                      const dpNum = s.observaciones?.includes('Comprobante ')
                        ? s.observaciones.split('Comprobante ')[1]?.split(' ·')[0]
                        : (s.codigoSalida.startsWith('DP') ? s.codigoSalida : s.codigoSalida);
                      const paNum = s.observaciones?.includes('Pedido ')
                        ? s.observaciones.split('Pedido ')[1]?.split(' ·')[0]
                        : (s.codigoSalida.startsWith('PA') ? s.codigoSalida : s.codigoSalida);
                      const alm = s.observaciones?.includes('Almacén ')
                        ? s.observaciones.split('Almacén ')[1]?.split(' ·')[0]
                        : (s.responsable?.includes('ALM') ? s.responsable : (selectedCategoryFilter === 'Costos Indirectos' ? 'CORPORATIVO' : 'ALMCE'));
                      const ceco = s.observaciones?.includes('Ceco ')
                        ? s.observaciones.split('Ceco ')[1]?.trim()
                        : (s.centroCosto || 'MON-3');

                      return (
                        <tr 
                          key={s.id} 
                          onClick={() => setSalidaAuditoria(s)}
                          className="hover:bg-blue-50/70 transition-colors cursor-pointer group"
                          title="Haz clic para auditar la imputación contable de esta partida"
                        >
                          <td className="py-2.5 px-2.5 font-mono font-bold text-neutral-700">
                            <span className="bg-neutral-100 px-1.5 py-0.5 rounded text-[11px] border border-neutral-200">
                              {alm}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap font-mono text-neutral-600">
                            {s.fecha}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap font-mono font-bold text-blue-700">
                            {dpNum}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap font-mono text-neutral-800">
                            {paNum}
                          </td>
                          <td className="py-2.5 px-2.5 font-mono text-neutral-500 text-[11px]">
                            {ceco}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold border bg-blue-50 text-blue-800 border-blue-200">
                              {s.subcategoria || s.categoria}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 font-semibold text-neutral-900">
                            <span className="block">{s.itemDescripcion}</span>
                          </td>
                          <td className="py-2.5 px-2.5 text-right font-mono font-bold tabular-nums text-neutral-800">
                            {s.cantidad.toLocaleString('de-DE')}
                          </td>
                          <td className="py-2.5 px-2 text-neutral-500 font-medium text-[11px]">
                            {s.unidadMedida}
                          </td>
                          <td className="py-2.5 px-3 text-neutral-800 text-[11px] font-semibold whitespace-nowrap">
                            {s.solicitante || 'Jesús Valdez'}
                          </td>
                          <td className="py-2.5 px-4 text-neutral-600 text-[11px] leading-relaxed">
                            <span className="truncate block max-w-xs" title={s.motivo}>
                              {s.motivo || 'Operativo'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums text-neutral-700">
                            ${s.montoUnitario.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums font-black text-blue-950 bg-blue-50/50">
                            ${s.montoTotal.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="sticky bottom-0 z-10 bg-slate-800 text-white font-bold border-t border-slate-700">
                    <tr>
                      <td colSpan={7} className="py-2.5 px-3 uppercase text-xs">
                        TOTAL DE PARTIDAS AUDITADAS EN ESTA VISTA ({lineasParaMostrar.length} MOVIMIENTOS):
                      </td>
                      <td className="py-2.5 px-2.5 text-right font-mono">
                        {lineasParaMostrar.reduce((sum, s) => sum + s.cantidad, 0).toLocaleString('de-DE')}
                      </td>
                      <td colSpan={3}></td>
                      <td className="py-2.5 px-3 text-right text-xs">TOTAL:</td>
                      <td className="py-2.5 px-3 text-right font-mono text-amber-300 text-sm bg-slate-900">
                        ${lineasParaMostrar.reduce((sum, s) => sum + s.montoTotal, 0).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="p-6 bg-neutral-50 rounded-xl text-center text-xs text-neutral-500 space-y-1">
                <AlertCircle className="w-6 h-6 text-neutral-400 mx-auto" />
                <p className="font-bold text-neutral-700">No se encontraron líneas de costo para los filtros seleccionados.</p>
                <p>Prueba seleccionando "Ver Todas" o limpiando el texto del buscador.</p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* AUDIT MODAL DE SALIDA */}
      {salidaAuditoria && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded">
                    {salidaAuditoria.codigoSalida}
                  </span>
                  <span className="text-xs text-neutral-500 font-mono">
                    {salidaAuditoria.fecha} ({salidaAuditoria.semanaLabel || `Semana ${salidaAuditoria.semana}`})
                  </span>
                </div>
                <h3 className="text-base font-black text-neutral-900 mt-1">
                  Auditoría Contable y Salida SIP
                </h3>
              </div>
              <button
                onClick={() => setSalidaAuditoria(null)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
                title="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Proyecto y Cuenta */}
            <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded">
                  {salidaAuditoria.cuentaAuxiliarCodigo}
                </span>
                <span className="font-bold text-neutral-800">
                  {salidaAuditoria.cuentaAuxiliarNombre || salidaAuditoria.proyecto}
                </span>
              </div>
              <div className="flex items-center gap-2 pt-1 border-t border-neutral-200 text-xs">
                <span className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded border bg-blue-100 text-blue-800 border-blue-200">
                  {salidaAuditoria.tipo || salidaAuditoria.categoria}
                </span>
                <span className="font-medium text-neutral-600">
                  Subcategoría: <strong>{salidaAuditoria.subcategoria || 'General'}</strong>
                </span>
              </div>
            </div>

            {/* Ítem y Monto */}
            <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200 space-y-2.5">
              <span className="text-[10px] uppercase font-bold text-blue-700 block">Descripción del Ítem o Servicio</span>
              <p className="font-bold text-neutral-900 text-sm">
                {salidaAuditoria.itemDescripcion}
              </p>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-blue-200/60 text-xs">
                <div>
                  <span className="text-neutral-500 block text-[11px]">Cantidad</span>
                  <span className="font-mono font-bold text-neutral-900 text-sm">
                    {formatNumber(salidaAuditoria.cantidad)} {salidaAuditoria.unidadMedida}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[11px]">Precio Unitario</span>
                  <span className="font-mono font-semibold text-neutral-800 text-sm">
                    ${salidaAuditoria.montoUnitario.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[11px]">Monto Total</span>
                  <span className="font-mono font-black text-blue-700 text-base">
                    ${salidaAuditoria.montoTotal.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Cálculo */}
              <div className="mt-2.5 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Cálculo:
                </span>
                <span className="font-mono text-xs sm:text-sm font-semibold text-slate-800">
                  {formatNumber(salidaAuditoria.cantidad)} {salidaAuditoria.unidadMedida} × ${salidaAuditoria.montoUnitario.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} = ${salidaAuditoria.montoTotal.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                </span>
              </div>
            </div>

            {/* Trazabilidad */}
            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl space-y-1.5 text-xs text-neutral-800">
              <span className="text-[10px] uppercase font-bold text-neutral-600 block">
                Trazabilidad Operativa
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-neutral-600 pt-1">
                <div><strong>Solicitante:</strong> {salidaAuditoria.solicitante || 'Residencia de Obra'}</div>
                <div><strong>Responsable:</strong> {salidaAuditoria.responsable || 'Almacén Central SIP'}</div>
                <div className="col-span-2"><strong>Motivo:</strong> {salidaAuditoria.motivo || salidaAuditoria.observaciones || 'Despacho operativo'}</div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                onClick={() => setSalidaAuditoria(null)}
                className="px-4 py-1.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
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
