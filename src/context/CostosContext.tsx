import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  SalidaCosto, 
  ResumenSemanal, 
  ResumenMensual, 
  CategoriaResumen, 
  CentroCostoResumen,
  ProyectoResumen,
  CuentaAuxiliarDetalle 
} from '../types/costos';
import { generateInitialMockCostos, TOTALES_MESES_PPT, TABLA_PPT_DISTRIBUCION_2026, CUENTAS_CORTAS_MAP } from '../data/mockCostosTimaca';
import { MATRIZ_REAL_PROYECTOS_MENSUAL_2026 } from '../data/realProyectosMensual2026';
import { parseFechaToDetails } from '../utils/dateHelpers';
import { isNormalizacion } from '../utils/normalizacionFilter';

interface CostosContextType {
  salidas: SalidaCosto[];
  filteredSalidas: SalidaCosto[];
  resumenSemanas: ResumenSemanal[];
  resumenMeses: ResumenMensual[];
  resumenCategorias: CategoriaResumen[];
  resumenCentrosCosto: CentroCostoResumen[];
  resumenProyectos: ProyectoResumen[];
  
  // Totales
  totalMontoGlobal: number;
  totalSalidasGlobal: number;
  totalMontoFiltrado: number;
  totalSalidasFiltrado: number;
  promedioSemanal: number;

  // Filtros activos
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  selectedMes: string;
  setSelectedMes: (m: string) => void;
  selectedSemana: string;
  setSelectedSemana: (w: string) => void;
  selectedProyecto: string;
  setSelectedProyecto: (p: string) => void;
  selectedCuentaAuxiliar: string;
  setSelectedCuentaAuxiliar: (ca: string) => void;
  selectedCentroCosto: string;
  setSelectedCentroCosto: (cc: string) => void;
  selectedCategoria: string;
  setSelectedCategoria: (c: string) => void;
  fechaInicio: string;
  setFechaInicio: (f: string) => void;
  fechaFin: string;
  setFechaFin: (f: string) => void;
  resetFiltros: () => void;

  // Acciones
  addSalida: (salidaData: Omit<SalidaCosto, 'id' | 'semana' | 'semanaLabel' | 'mes' | 'mesLabel' | 'ano'>) => void;
  updateSalida: (id: string, updated: Partial<SalidaCosto>) => void;
  validarSalida: (id: string, estadoValidacion: 'Conforme' | 'Observado' | 'Pendiente', observacionGerente?: string, validadoPor?: string) => void;
  deleteSalida: (id: string) => void;
  importSalidas: (nuevas: SalidaCosto[], replace: boolean) => void;
  resetToMockData: () => void;
  clearAllData: () => void;
}

const CostosContext = createContext<CostosContextType | undefined>(undefined);

const CATEGORY_COLORS = [
  '#2563EB', // Blue
  '#059669', // Emerald
  '#D97706', // Amber
  '#7C3AED', // Violet
  '#DC2626', // Red
  '#0891B2', // Cyan
  '#4F46E5', // Indigo
  '#475569', // Slate
];

const VALIDACIONES_STORAGE_KEY = 'TIMACA_VALIDACIONES_GERENTES_V2';

const DEFAULT_VALIDACIONES: Record<string, {
  estadoValidacion: 'Conforme' | 'Observado' | 'Pendiente';
  observacionGerente?: string;
  fechaValidacion: string;
  validadoPor: string;
}> = {
  'DP0037159': {
    estadoValidacion: 'Observado',
    observacionGerente: 'MALA IMPUTACIÓN: Este material (2.783 kg de plancha ASTM A-36, $3.924,69 USD) fue despachado para la 2da Línea PMH (TTE-C-0671) según motivo textual del almacén. No pertenece a Planta de Pellas.',
    fechaValidacion: '2026-10-05 09:30',
    validadoPor: 'Ing. Carlos Mendoza (Gerente Pellas)'
  },
  'REAL-AGO-2026-5148': {
    estadoValidacion: 'Observado',
    observacionGerente: 'MALA IMPUTACIÓN: Este material (2.783 kg de plancha ASTM A-36, $3.924,69 USD) fue despachado para la 2da Línea PMH (TTE-C-0671) según motivo textual del almacén. No pertenece a Planta de Pellas.',
    fechaValidacion: '2026-10-05 09:30',
    validadoPor: 'Ing. Carlos Mendoza (Gerente Pellas)'
  },
  'DP0037617': {
    estadoValidacion: 'Conforme',
    observacionGerente: 'Material verificado en taller mecánico de Pellas.',
    fechaValidacion: '2026-10-05 09:15',
    validadoPor: 'Ing. Carlos Mendoza (Gerente Pellas)'
  }
};

export const CostosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [salidas, setSalidas] = useState<SalidaCosto[]>(() => {
    // Limpieza proactiva de cualquier almacenamiento local obsoleto de datos de costos
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        Object.keys(localStorage).forEach((k) => {
          if (k.startsWith('TIMACA_COSTOS_')) {
            localStorage.removeItem(k);
          }
        });
      }
    } catch (e) {
      console.error('Error limpiando almacenamiento previo de costos', e);
    }

    // Carga directa y fresca de la base oficial auditada (CERO dependencia de caché de navegador)
    const initialList: SalidaCosto[] = generateInitialMockCostos();

    // Aplicar validaciones almacenadas de gerentes o semilla inicial
    try {
      let valMap = DEFAULT_VALIDACIONES;
      const savedVal = localStorage.getItem(VALIDACIONES_STORAGE_KEY);
      if (savedVal) {
        valMap = { ...DEFAULT_VALIDACIONES, ...JSON.parse(savedVal) };
      } else {
        localStorage.setItem(VALIDACIONES_STORAGE_KEY, JSON.stringify(DEFAULT_VALIDACIONES));
      }
      return initialList.map(s => {
        const u = (s.unidadMedida || '').trim().toUpperCase();
        const normalizedUm = u === 'USE' ? 'SERV' : (s.unidadMedida || 'UND');
        const val = valMap[s.codigoSalida] || valMap[s.id];
        if (val) {
          return {
            ...s,
            unidadMedida: normalizedUm,
            estadoValidacion: val.estadoValidacion,
            observacionGerente: val.observacionGerente,
            fechaValidacion: val.fechaValidacion,
            validadoPor: val.validadoPor
          };
        }
        return {
          ...s,
          unidadMedida: normalizedUm
        };
      });
    } catch {
      return initialList.map(s => {
        const u = (s.unidadMedida || '').trim().toUpperCase();
        return {
          ...s,
          unidadMedida: u === 'USE' ? 'SERV' : (s.unidadMedida || 'UND')
        };
      });
    }
  });

  // Los datos oficiales se mantienen siempre frescos desde la fuente de código en memoria,
  // eliminando la necesidad de que el usuario limpie la caché para ver actualizaciones.

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMes, setSelectedMes] = useState('all');
  const [selectedSemana, setSelectedSemana] = useState('all');
  const [selectedProyecto, setSelectedProyecto] = useState('all');
  const [selectedCuentaAuxiliar, setSelectedCuentaAuxiliar] = useState('all');
  const [selectedCentroCosto, setSelectedCentroCosto] = useState('all');
  const [selectedCategoria, setSelectedCategoria] = useState('all');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const resetFiltros = () => {
    setSearchTerm('');
    setSelectedMes('all');
    setSelectedSemana('all');
    setSelectedProyecto('all');
    setSelectedCuentaAuxiliar('all');
    setSelectedCentroCosto('all');
    setSelectedCategoria('all');
    setFechaInicio('');
    setFechaFin('');
  };

  // Filtrado reactivo
  const filteredSalidas = useMemo(() => {
    return salidas.filter(s => {
      // Regla obligatoria: Excluir registros de Normalización patrimonial / reclasificación
      if (isNormalizacion(s)) {
        return false;
      }

      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const match =
          s.codigoSalida.toLowerCase().includes(q) ||
          s.itemDescripcion.toLowerCase().includes(q) ||
          s.proyecto.toLowerCase().includes(q) ||
          s.cuentaAuxiliarCodigo.toLowerCase().includes(q) ||
          s.cuentaAuxiliarNombre.toLowerCase().includes(q) ||
          s.centroCosto.toLowerCase().includes(q) ||
          s.categoria.toLowerCase().includes(q) ||
          s.proveedorODestino.toLowerCase().includes(q) ||
          s.responsable.toLowerCase().includes(q);
        if (!match) return false;
      }

      if (selectedMes !== 'all' && String(s.mes) !== selectedMes) {
        return false;
      }

      if (selectedSemana !== 'all' && String(s.semana) !== selectedSemana) {
        return false;
      }

      if (selectedProyecto !== 'all' && s.proyecto !== selectedProyecto) {
        return false;
      }

      if (selectedCuentaAuxiliar !== 'all' && 
         (s.cuentaAuxiliarCodigo !== selectedCuentaAuxiliar && s.cuentaAuxiliarNombre !== selectedCuentaAuxiliar)) {
        return false;
      }

      if (selectedCentroCosto !== 'all' && s.centroCosto !== selectedCentroCosto) {
        return false;
      }

      if (selectedCategoria !== 'all') {
        const selNorm = selectedCategoria.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const catNorm = (s.categoria || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const tipoNorm = (s.tipo || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const matchCat = s.categoria === selectedCategoria || 
                         s.tipo === selectedCategoria || 
                         catNorm === selNorm || 
                         tipoNorm === selNorm ||
                         (selNorm.includes('maquina') && (catNorm.includes('maquina') || tipoNorm.includes('maquina'))) ||
                         (selNorm.includes('servicio') && (catNorm.includes('servicio') || tipoNorm.includes('servicio')));
        if (!matchCat) return false;
      }

      if (fechaInicio && s.fecha < fechaInicio) {
        return false;
      }

      if (fechaFin && s.fecha > fechaFin) {
        return false;
      }

      return true;
    }).sort((a, b) => b.fecha.localeCompare(a.fecha));
  }, [
    salidas, 
    searchTerm, 
    selectedMes, 
    selectedSemana, 
    selectedProyecto, 
    selectedCuentaAuxiliar, 
    selectedCentroCosto, 
    selectedCategoria, 
    fechaInicio, 
    fechaFin
  ]);

  // Totales Globales Oficiales 2026 (9 Meses Consolidados: Enero - Septiembre: $13.020.430 USD)
  const totalMontoGlobal = useMemo(() => {
    return TOTALES_MESES_PPT.reduce((acc, curr) => acc + curr.total, 0); // $13.020.430 USD consolidado
  }, []);

  const totalSalidasGlobal = 48553; // 48.553 despachos reales de proyectos externos en 2026

  const totalMontoFiltrado = useMemo(() => {
    if (selectedMes === 'all' && selectedSemana === 'all' && !searchTerm && !selectedProyecto && !selectedCuentaAuxiliar && !selectedCentroCosto && !selectedCategoria) {
      return totalMontoGlobal;
    }
    if (selectedMes !== 'all' && !searchTerm && !selectedProyecto && !selectedCuentaAuxiliar && !selectedCentroCosto && !selectedCategoria) {
      const mNum = Number(selectedMes) || (selectedMes.toLowerCase().includes('agosto') ? 8 : 0);
      const mIdx = mNum - 1;
      if (mIdx >= 0 && mIdx < TOTALES_MESES_PPT.length) {
        return TOTALES_MESES_PPT[mIdx].total;
      }
    }
    return filteredSalidas.filter(s => !isNormalizacion(s)).reduce((acc, curr) => acc + curr.montoTotal, 0);
  }, [filteredSalidas, totalMontoGlobal, selectedMes, selectedSemana, searchTerm, selectedProyecto, selectedCuentaAuxiliar, selectedCentroCosto, selectedCategoria]);

  const totalSalidasFiltrado = useMemo(() => {
    if (selectedMes === 'all' && selectedSemana === 'all' && !searchTerm && !selectedProyecto && !selectedCuentaAuxiliar && !selectedCentroCosto && !selectedCategoria) {
      return totalSalidasGlobal;
    }
    return filteredSalidas.length;
  }, [filteredSalidas, totalSalidasGlobal, selectedMes, selectedSemana, searchTerm, selectedProyecto, selectedCuentaAuxiliar, selectedCentroCosto, selectedCategoria]);

  // Agrupación de Proyectos y Cuentas Auxiliares
  const resumenProyectos = useMemo<ProyectoResumen[]>(() => {
    const mapaProyectos = new Map<string, {
      nombre: string;
      totalMonto: number;
      totalSalidas: number;
      cuentasMap: Map<string, {
        codigo: string;
        nombre: string;
        totalMonto: number;
        totalSalidas: number;
        salidas: SalidaCosto[];
      }>;
      semanasMap: Map<number, number>;
      mesesMap: Map<number, number>;
    }>();

    salidas.forEach(s => {
      const pryNombre = s.proyecto || s.centroCosto || 'General TIMACA';
      if (!mapaProyectos.has(pryNombre)) {
        mapaProyectos.set(pryNombre, {
          nombre: pryNombre,
          totalMonto: 0,
          totalSalidas: 0,
          cuentasMap: new Map(),
          semanasMap: new Map(),
          mesesMap: new Map(),
        });
      }

      const pryEntry = mapaProyectos.get(pryNombre)!;
      pryEntry.totalMonto += s.montoTotal;
      pryEntry.totalSalidas += 1;

      // Semanas y Meses del proyecto
      pryEntry.semanasMap.set(s.semana, (pryEntry.semanasMap.get(s.semana) || 0) + s.montoTotal);
      pryEntry.mesesMap.set(s.mes, (pryEntry.mesesMap.get(s.mes) || 0) + s.montoTotal);

      // Cuenta Auxiliar
      const ctaKey = s.cuentaAuxiliarCodigo || s.categoria || 'CTA-OTRO';
      const ctaNom = s.cuentaAuxiliarNombre || s.categoria || 'Costos Operativos';

      if (!pryEntry.cuentasMap.has(ctaKey)) {
        pryEntry.cuentasMap.set(ctaKey, {
          codigo: ctaKey,
          nombre: ctaNom,
          totalMonto: 0,
          totalSalidas: 0,
          salidas: [],
        });
      }

      const ctaEntry = pryEntry.cuentasMap.get(ctaKey)!;
      ctaEntry.totalMonto += s.montoTotal;
      ctaEntry.totalSalidas += 1;
      ctaEntry.salidas.push(s);
    });

    const totalGeneral = totalMontoGlobal || 1;

    return Array.from(mapaProyectos.values())
      .map(p => {
        const pMonto = p.totalMonto || 1;
        const cuentasAuxiliares: CuentaAuxiliarDetalle[] = Array.from(p.cuentasMap.values())
          .map(c => ({
            codigo: c.codigo,
            nombre: c.nombre,
            totalMonto: c.totalMonto,
            totalSalidas: c.totalSalidas,
            porcentaje: Math.round((c.totalMonto / pMonto) * 1000) / 10,
            salidas: c.salidas.sort((a, b) => b.fecha.localeCompare(a.fecha)),
          }))
          .sort((a, b) => b.totalMonto - a.totalMonto);

        const totalSemanasObj: Record<number, number> = {};
        p.semanasMap.forEach((v, k) => { totalSemanasObj[k] = v; });

        const totalMesesObj: Record<number, number> = {};
        p.mesesMap.forEach((v, k) => { totalMesesObj[k] = v; });

        return {
          nombre: p.nombre,
          totalMonto: p.totalMonto,
          totalSalidas: p.totalSalidas,
          porcentajeDelTotal: Math.round((p.totalMonto / totalGeneral) * 1000) / 10,
          cuentasAuxiliares,
          totalSemanas: totalSemanasObj,
          totalMeses: totalMesesObj,
        };
      })
      .sort((a, b) => b.totalMonto - a.totalMonto);
  }, [salidas, totalMontoGlobal]);

  // Agrupación Semana a Semana
  const resumenSemanas = useMemo(() => {
    const mapa = new Map<number, {
      semana: number;
      semanaLabel: string;
      ano: number;
      mesLabel: string;
      totalMonto: number;
      totalSalidas: number;
      porCategoria: Record<string, number>;
      porCentroCosto: Record<string, number>;
      porProyecto: Record<string, number>;
    }>();

    salidas.forEach(s => {
      const sem = s.semana;
      if (!mapa.has(sem)) {
        mapa.set(sem, {
          semana: sem,
          semanaLabel: s.semanaLabel,
          ano: s.ano,
          mesLabel: s.mesLabel,
          totalMonto: 0,
          totalSalidas: 0,
          porCategoria: {},
          porCentroCosto: {},
          porProyecto: {},
        });
      }
      const entry = mapa.get(sem)!;
      entry.totalMonto += s.montoTotal;
      entry.totalSalidas += 1;
      entry.porCategoria[s.categoria] = (entry.porCategoria[s.categoria] || 0) + s.montoTotal;
      entry.porCentroCosto[s.centroCosto] = (entry.porCentroCosto[s.centroCosto] || 0) + s.montoTotal;
      entry.porProyecto[s.proyecto] = (entry.porProyecto[s.proyecto] || 0) + s.montoTotal;
    });

    const lista = Array.from(mapa.values()).sort((a, b) => a.semana - b.semana);

    return lista.map((item, idx) => {
      if (idx === 0) {
        return { ...item, diferenciaPrevia: 0, porcentajeVariacion: 0 };
      }
      const prev = lista[idx - 1];
      const diff = item.totalMonto - prev.totalMonto;
      const pct = prev.totalMonto > 0 ? (diff / prev.totalMonto) * 100 : 0;
      return {
        ...item,
        diferenciaPrevia: Math.round(diff * 100) / 100,
        porcentajeVariacion: Math.round(pct * 10) / 10,
      };
    });
  }, [salidas]);

  // Agrupación Mes a Mes Oficial 2026 (Enero a Septiembre - Consolidado Corporativo TIMACA)
  const resumenMeses = useMemo<ResumenMensual[]>(() => {
    const mesesSalidasCount = [6080, 5188, 6044, 4972, 5216, 4445, 6282, 5812, 11514];
    const semanasPorMes = [4, 4, 5, 4, 5, 4, 5, 4, 5];

    // Salidas reales cargadas de agosto y septiembre
    const agostoSalidasFiltradas = salidas.filter(s => s.mes === 8 && !isNormalizacion(s));
    const agostoSalidasCount = agostoSalidasFiltradas.length > 0 ? agostoSalidasFiltradas.length : 5812;

    const sepSalidasFiltradas = salidas.filter(s => s.mes === 9 && !isNormalizacion(s));
    const sepSalidasCount = sepSalidasFiltradas.length > 0 ? sepSalidasFiltradas.length : 11514;

    const lista = TOTALES_MESES_PPT.map((ppt, idx) => {
      const mesNum = ppt.mesNum;
      const isAgosto = mesNum === 8;
      const isSeptiembre = mesNum === 9;
      const totalMonto = ppt.total; // Consolidado oficial auditado PPT
      const totalSalidas = isAgosto ? agostoSalidasCount : isSeptiembre ? sepSalidasCount : (mesesSalidasCount[idx] || 0);
      const numSemanas = semanasPorMes[idx] || 4;
      const promedioSemanal = Math.round((totalMonto / numSemanas) * 100) / 100;

      // Desglose oficial de las 5 categorías
      const porCategoria: Record<string, number> = {
        'Materiales Directos': TABLA_PPT_DISTRIBUCION_2026[0]?.meses[idx] || 0,
        'Servicios': TABLA_PPT_DISTRIBUCION_2026[1]?.meses[idx] || 0,
        'Mano de Obra Directa': TABLA_PPT_DISTRIBUCION_2026[2]?.meses[idx] || 0,
        'Horas Maquina': TABLA_PPT_DISTRIBUCION_2026[3]?.meses[idx] || 0,
        'Costos Indirectos': TABLA_PPT_DISTRIBUCION_2026[4]?.meses[idx] || 0,
      };

      const porCentroCosto: Record<string, number> = {};
      const porProyecto: Record<string, number> = {};
      Object.entries(MATRIZ_REAL_PROYECTOS_MENSUAL_2026).forEach(([cod, pData]) => {
        let val = Math.round((pData.meses[idx] || 0) * 100) / 100;
        if (idx === 8 && val === 0) {
          const prySalidas = sepSalidasFiltradas.filter(s => s.cuentaAuxiliarCodigo === cod);
          val = Math.round(prySalidas.reduce((sum, s) => sum + s.montoTotal, 0) * 100) / 100;
        }
        const short = CUENTAS_CORTAS_MAP[cod] || pData.descripcion;
        const compositeKey = `${cod} · ${short}`;
        porCentroCosto[cod] = val;
        porCentroCosto[compositeKey] = val;
        porCentroCosto[pData.descripcion] = val;
        porProyecto[cod] = val;
        porProyecto[compositeKey] = val;
        porProyecto[pData.descripcion] = val;
      });

      return {
        mes: mesNum,
        mesLabel: ppt.mesNombre,
        ano: 2026,
        totalMonto,
        totalSalidas,
        porCategoria,
        porCentroCosto,
        porProyecto,
        promedioSemanal,
      };
    });

    return lista.map((item, idx) => {
      if (idx === 0) return { ...item, porcentajeVariacion: 0 };
      const prev = lista[idx - 1];
      const diff = item.totalMonto - prev.totalMonto;
      const pct = prev.totalMonto > 0 ? (diff / prev.totalMonto) * 100 : 0;
      return {
        ...item,
        porcentajeVariacion: Math.round(pct * 10) / 10,
      };
    });
  }, [salidas]);

  // Resumen por Categoría
  const resumenCategorias = useMemo(() => {
    const mapa = new Map<string, { totalMonto: number; totalSalidas: number }>();
    filteredSalidas.forEach(s => {
      const cur = mapa.get(s.categoria) || { totalMonto: 0, totalSalidas: 0 };
      cur.totalMonto += s.montoTotal;
      cur.totalSalidas += 1;
      mapa.set(s.categoria, cur);
    });

    const total = totalMontoFiltrado || 1;
    return Array.from(mapa.entries())
      .map(([nombre, data], index) => ({
        nombre,
        totalMonto: data.totalMonto,
        totalSalidas: data.totalSalidas,
        porcentaje: Math.round((data.totalMonto / total) * 1000) / 10,
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length]
      }))
      .sort((a, b) => b.totalMonto - a.totalMonto);
  }, [filteredSalidas, totalMontoFiltrado]);

  // Resumen por Centro de Costo
  const resumenCentrosCosto = useMemo(() => {
    const mapa = new Map<string, { totalMonto: number; totalSalidas: number }>();
    filteredSalidas.forEach(s => {
      const cur = mapa.get(s.centroCosto) || { totalMonto: 0, totalSalidas: 0 };
      cur.totalMonto += s.montoTotal;
      cur.totalSalidas += 1;
      mapa.set(s.centroCosto, cur);
    });

    const total = totalMontoFiltrado || 1;
    return Array.from(mapa.entries())
      .map(([nombre, data]) => ({
        nombre,
        totalMonto: data.totalMonto,
        totalSalidas: data.totalSalidas,
        porcentaje: Math.round((data.totalMonto / total) * 1000) / 10,
      }))
      .sort((a, b) => b.totalMonto - a.totalMonto);
  }, [filteredSalidas, totalMontoFiltrado]);

  const promedioSemanal = useMemo(() => {
    if (selectedSemana !== 'all') {
      return totalMontoFiltrado;
    }
    if (selectedMes !== 'all') {
      const mesNum = parseInt(selectedMes, 10);
      const mesData = resumenMeses.find(m => m.mes === mesNum);
      if (mesData) {
        return mesData.promedioSemanal;
      }
    }
    // Consolidado Anual Enero a Septiembre 2026: 39 semanas operativas oficiales (35 previas + 4 de Septiembre)
    const totalSemanasEneSep = 39;
    return Math.round((totalMontoGlobal / totalSemanasEneSep) * 100) / 100;
  }, [totalMontoGlobal, totalMontoFiltrado, selectedMes, selectedSemana, resumenMeses]);

  // Acciones CRUD
  const addSalida = (salidaData: Omit<SalidaCosto, 'id' | 'semana' | 'semanaLabel' | 'mes' | 'mesLabel' | 'ano'>) => {
    const details = parseFechaToDetails(salidaData.fecha);
    const newSalida: SalidaCosto = {
      ...salidaData,
      id: `salida-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      semana: details.semana,
      semanaLabel: details.semanaLabel,
      mes: details.mes,
      mesLabel: details.mesLabel,
      ano: details.ano,
      fecha: details.fechaStandard,
      montoTotal: Math.round(salidaData.cantidad * salidaData.montoUnitario * 100) / 100,
    };
    setSalidas(prev => [newSalida, ...prev]);
  };

  const updateSalida = (id: string, updated: Partial<SalidaCosto>) => {
    setSalidas(prev => prev.map(item => {
      if (item.id !== id) return item;
      const merged = { ...item, ...updated };
      if (updated.fecha && updated.fecha !== item.fecha) {
        const details = parseFechaToDetails(updated.fecha);
        merged.semana = details.semana;
        merged.semanaLabel = details.semanaLabel;
        merged.mes = details.mes;
        merged.mesLabel = details.mesLabel;
        merged.ano = details.ano;
        merged.fecha = details.fechaStandard;
      }
      if (updated.cantidad !== undefined || updated.montoUnitario !== undefined) {
        merged.montoTotal = Math.round(merged.cantidad * merged.montoUnitario * 100) / 100;
      }
      return merged;
    }));
  };

  const validarSalida = (
    id: string, 
    estadoValidacion: 'Conforme' | 'Observado' | 'Pendiente', 
    observacionGerente?: string, 
    validadoPor?: string
  ) => {
    const fechaHora = new Date().toISOString().replace('T', ' ').substring(0, 16);
    try {
      let valMap: Record<string, any> = {};
      const savedVal = localStorage.getItem(VALIDACIONES_STORAGE_KEY);
      if (savedVal) {
        try { valMap = JSON.parse(savedVal); } catch {}
      }
      valMap[id] = {
        estadoValidacion,
        observacionGerente: observacionGerente || '',
        fechaValidacion: fechaHora,
        validadoPor: validadoPor || 'Gerente de Proyecto'
      };
      localStorage.setItem(VALIDACIONES_STORAGE_KEY, JSON.stringify(valMap));
    } catch (e) {
      console.error(e);
    }

    setSalidas(prev => prev.map(s => {
      if (s.id === id || s.codigoSalida === id) {
        return {
          ...s,
          estadoValidacion,
          observacionGerente,
          fechaValidacion: fechaHora,
          validadoPor: validadoPor || 'Gerente de Proyecto'
        };
      }
      return s;
    }));
  };

  const deleteSalida = (id: string) => {
    setSalidas(prev => prev.filter(s => s.id !== id));
  };

  const importSalidas = (nuevas: SalidaCosto[], replace: boolean) => {
    if (!nuevas || nuevas.length === 0) return;
    const totalMonto = nuevas.reduce((acc, s) => acc + (s.montoTotal || 0), 0);
    if (totalMonto <= 0) {
      console.warn('Se rechazó la importación porque la suma total de los montos es 0.');
      return;
    }
    if (replace) {
      setSalidas(nuevas);
    } else {
      setSalidas(prev => [...nuevas, ...prev]);
    }
  };

  const resetToMockData = () => {
    setSalidas(generateInitialMockCostos());
    resetFiltros();
  };

  const clearAllData = () => {
    setSalidas([]);
    resetFiltros();
  };

  return (
    <CostosContext.Provider
      value={{
        salidas,
        filteredSalidas,
        resumenSemanas,
        resumenMeses,
        resumenCategorias,
        resumenCentrosCosto,
        resumenProyectos,
        totalMontoGlobal,
        totalSalidasGlobal,
        totalMontoFiltrado,
        totalSalidasFiltrado,
        promedioSemanal,
        searchTerm,
        setSearchTerm,
        selectedMes,
        setSelectedMes,
        selectedSemana,
        setSelectedSemana,
        selectedProyecto,
        setSelectedProyecto,
        selectedCuentaAuxiliar,
        setSelectedCuentaAuxiliar,
        selectedCentroCosto,
        setSelectedCentroCosto,
        selectedCategoria,
        setSelectedCategoria,
        fechaInicio,
        setFechaInicio,
        fechaFin,
        setFechaFin,
        resetFiltros,
        addSalida,
        updateSalida,
        validarSalida,
        deleteSalida,
        importSalidas,
        resetToMockData,
        clearAllData,
      }}
    >
      {children}
    </CostosContext.Provider>
  );
};

export const useCostos = () => {
  const context = useContext(CostosContext);
  if (!context) {
    throw new Error('useCostos debe ser utilizado dentro de un CostosProvider');
  }
  return context;
};
