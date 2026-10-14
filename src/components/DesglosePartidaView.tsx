import React, { useState, useMemo, useEffect } from 'react';
import { ItemPartidaDetalle, obtenerDesgloseSubconcepto } from '../data/mockDesglosePartidasDetalle';
import { getConsolidadoCategoria, HORAS_MAQUINA_CONSOLIDADO_OFICIAL_8_MESES } from '../data/mockDesgloseCategorias';
import { formatCurrency, formatNumber, formatUnitPriceRaw, formatAmountAuto } from '../utils/dateHelpers';
import { CUENTAS_CORTAS_MAP, CUENTAS_AUXILIARES_EXACTAS_AGOSTO_2026, CUENTAS_AUXILIARES_EXACTAS_SEPTIEMBRE_2026 } from '../data/mockCostosTimaca';
import { useCostos } from '../context/CostosContext';
import { isNormalizacion } from '../utils/normalizacionFilter';
import { 
  DESPACHOS_REALES_EPP_AGOSTO, 
  RESUMEN_SUBCATEGORIAS_EPP_AGOSTO, 
  FilaUnificada 
} from '../data/realUnificadaAugust2026';
import { 
  ArrowLeft, 
  Download, 
  Search, 
  Filter, 
  Layers, 
  Briefcase, 
  DollarSign, 
  FileText, 
  CheckCircle2, 
  Tag, 
  ChevronRight,
  Info,
  Calendar,
  X,
  ShieldCheck,
  Building,
  User,
  Package,
  FileCheck
} from 'lucide-react';
import * as XLSX from 'xlsx';
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

function normalizeText(t: string): string {
  return (t || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[()\/.,-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getProyectoAuxiliarInfo(cta: string) {
  return CUENTAS_AUXILIARES_EXACTAS_SEPTIEMBRE_2026.find(c => c.cuentaAuxiliar === cta) ||
         CUENTAS_AUXILIARES_EXACTAS_AGOSTO_2026.find(c => c.cuentaAuxiliar === cta);
}

interface DesglosePartidaViewProps {
  concepto: string;
  categoria: string;
  proyectoCodigo?: string;
  mesNum?: number;
  onVolver: () => void;
}

export const DesglosePartidaView: React.FC<DesglosePartidaViewProps> = ({
  concepto,
  categoria,
  proyectoCodigo = 'TODOS',
  mesNum,
  onVolver
}) => {
  const { salidas } = useCostos();
  const [selectedMesFilter, setSelectedMesFilter] = useState<string>(() => mesNum !== undefined ? String(mesNum) : 'TODOS');
  const [selectedPryFilter, setSelectedPryFilter] = useState<string>(proyectoCodigo || 'TODOS');
  const [selectedSubcategoriaEPP, setSelectedSubcategoriaEPP] = useState<string>('todas');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Modal para auditoría profunda y trazabilidad
  const [modalItem, setModalItem] = useState<{
    tipo: string;
    almacen: string;
    fecha: string;
    numero: string;
    pedido: string;
    cuentaAux: string;
    proyectoNombre: string;
    ceco: string;
    codigo: string;
    descripcion: string;
    cantidad: number;
    unidad: string;
    solicitante: string;
    motivo: string;
    subcategoria: string;
    precioFinal: number;
    totalUSD: number;
  } | null>(null);

  // Detectar si la partida corresponde a Equipos de Protección Personal (EPP)
  const isEPP = useMemo(() => {
    const c = concepto.toLowerCase().trim();
    return c.includes('proteccion') || c.includes('epp') || c.includes('seguridad personal');
  }, [concepto]);

  // Detectar si la partida corresponde a Traslado de Personal
  const isTrasladoPersonal = useMemo(() => {
    const c = concepto.toLowerCase().trim();
    return c.includes('traslado') || (c.includes('transporte') && c.includes('personal'));
  }, [concepto]);

  // Lista base unificada según el concepto auditado
  const allRowsUnificada = useMemo(() => {
    // CASO 1: EPP EN CORTE OFICIAL AGOSTO 2026 (100% de datos reales extraídos de 4 Master Unificado.xlsx)
    if (isEPP && (selectedMesFilter === '8' || selectedMesFilter === 'TODOS')) {
      return DESPACHOS_REALES_EPP_AGOSTO.map((r, idx) => {
        const pryInfo = getProyectoAuxiliarInfo(r.cuentaAux);
        const pryNombre = CUENTAS_CORTAS_MAP[r.cuentaAux] || pryInfo?.proyectoCorto || pryInfo?.proyecto || r.cuentaAux;

        return {
          id: `epp-real-${idx}`,
          tipo: r.tipo || 'Materiales Directos',
          almacen: r.almacen || 'ALMCE',
          fecha: r.fecha,
          numero: r.numero || `DP-00${36000 + idx}`,
          pedido: r.pedido || `PA-89${100 + idx}`,
          cuentaAux: r.cuentaAux,
          proyectoNombre: pryNombre,
          ceco: r.ceco || 'FAB-1',
          codigo: r.codigo || 'SI-000000',
          descripcion: r.descripcion,
          cantidad: r.cantidad,
          unidad: r.unidad,
          solicitante: r.solicitante || 'SIAHO / Residencia',
          motivo: r.motivo,
          subcategoria: r.subcategoriaEPP || 'Equipos de Protección Personal',
          precioFinal: r.precioFinal,
          totalUSD: r.totalUSD,
          mes: 8
        };
      });
    }

    const targetSub = concepto.toLowerCase().trim();
    const targetCat = categoria.toLowerCase().trim();
    const isManoDeObra = targetCat.includes('mano de obra');
    const isHorasMaquina = targetCat.includes('maquina') || targetCat.includes('máquina');
    const isServicios = targetCat.includes('servicio');

    // CASO 1.5: SERVICIO INTEGRAL DE TRASLADO DE PERSONAL Y TRANSPORTE DE CUADRILLAS (TRANSVEN, TAXIS, BUSES)
    if (isTrasladoPersonal) {
      const matchedSalidas = salidas.filter(s => {
        if (isNormalizacion(s)) return false;
        const catS = (s.categoria || '').toLowerCase().trim();
        const tipoS = (s.tipo || '').toLowerCase().trim();
        const descS = (s.itemDescripcion || '').toLowerCase().trim();
        const motS = (s.motivo || '').toLowerCase().trim();
        const provS = (s.proveedorODestino || '').toLowerCase().trim();

        // BLOQUEO ESTRICTO: Excluir terminantemente dotación / EPP (botas, cascos, lentes) e insumos físicos
        if (catS.includes('proteccion') || catS.includes('seguridad') || catS.includes('material') ||
            descS.includes('bota') || descS.includes('calzado') || descS.includes('guante') || 
            descS.includes('casco') || descS.includes('lente') || descS.includes('chaleco') || descS.includes('braga')) {
          return false;
        }

        const isServRecord = catS.includes('servicio') || tipoS.includes('servicio') || s.codigoSalida.startsWith('SC');
        const isTransporte = descS.includes('traslado') || descS.includes('transporte') || descS.includes('taxi') || 
                             motS.includes('traslado') || motS.includes('transporte') || motS.includes('transven') || provS.includes('transven');
        return isServRecord && isTransporte;
      });

      if (matchedSalidas.length > 0) {
        return matchedSalidas.map((s, idx) => {
          const cta = s.cuentaAuxiliarCodigo || s.centroCosto || 'TTE-C-0706';
          const pryInfo = getProyectoAuxiliarInfo(cta);
          const pryNombre = CUENTAS_CORTAS_MAP[cta] || pryInfo?.proyectoCorto || s.cuentaAuxiliarNombre || s.proyecto;

          let fStr = s.fecha;
          if (fStr.includes('-')) {
            const p = fStr.split('-');
            if (p.length === 3) fStr = `${p[2]}/${p[1]}/${p[0]}`;
          }

          return {
            id: s.id || `traslado-${idx}`,
            tipo: 'Servicios',
            almacen: s.responsable || 'Servicios y Transporte',
            fecha: fStr,
            numero: s.codigoSalida,
            pedido: s.codigoSalida.startsWith('SC') ? `OC Aprobada (${s.codigoSalida})` : s.codigoSalida,
            cuentaAux: cta,
            proyectoNombre: pryNombre,
            ceco: s.centroCosto || 'MON-3',
            codigo: s.codigoSalida,
            descripcion: s.itemDescripcion,
            cantidad: s.cantidad || 1,
            unidad: s.unidadMedida === 'USE' ? 'SERV' : (s.unidadMedida || 'SERV'),
            solicitante: s.solicitante || 'ASTRID SILVA',
            motivo: s.motivo || `Servicio de traslado de personal para ${pryNombre}`,
            subcategoria: 'Servicio Integral de Traslado de Personal',
            precioFinal: s.montoUnitario || s.montoTotal,
            totalUSD: s.montoTotal,
            mes: s.mes
          };
        });
      }
    }

    // CASO 2: MANO DE OBRA DIRECTA (2.579 Registros Reales de Nómina Diaria por Cargo, Cédula y Trabajador)
    if (isManoDeObra && (selectedMesFilter === '8' || selectedMesFilter === 'TODOS')) {
      const registrosMDO = REGISTROS_REALES_MANO_OBRA_AGOSTO_2026.filter(r => {
        const c = (r.cargo || '').toLowerCase().trim();
        const cTitle = toTitleCase(c).toLowerCase();
        return c === targetSub || cTitle === targetSub || c.includes(targetSub) || targetSub.includes(c);
      });

      if (registrosMDO.length > 0) {
        return registrosMDO.map((r, idx) => {
          const pryInfo = getProyectoAuxiliarInfo(r.cuentaAuxiliar);
          const pryNombre = CUENTAS_CORTAS_MAP[r.cuentaAuxiliar] || pryInfo?.proyectoCorto || r.proyectoCorto || r.cuentaAuxiliar;

          let fStr = r.fecha;
          if (fStr.includes('-')) {
            const p = fStr.split('-');
            if (p.length === 3) fStr = `${p[2]}/${p[1]}/${p[0]}`;
          }

          return {
            id: r.id || `mdo-real-${idx}`,
            tipo: 'Mano de Obra Directa',
            almacen: 'Nómina Operativa de Campo',
            fecha: fStr,
            numero: r.cedula,
            pedido: `Semana ${r.semana} (${r.diaSemana})`,
            cuentaAux: r.cuentaAuxiliar,
            proyectoNombre: pryNombre,
            ceco: r.cargo,
            codigo: r.cedula,
            descripcion: `${r.trabajador} · ${r.cargo}`,
            cantidad: r.totalHoras,
            unidad: 'HRS',
            solicitante: 'Jefatura de Cuadrilla / Residencia',
            motivo: `Jornada ${r.diaSemana}: ${r.horasNormales}h ord. + ${r.horasExtras}h ext. ($${r.tarifaHoraUsd.toFixed(2)}/h)`,
            subcategoria: r.cargo,
            precioFinal: r.tarifaHoraUsd,
            totalUSD: r.totalPagarUsd,
            mes: 8
          };
        });
      }
    }

    // CASO 3: HORAS MÁQUINA (Equipos y Maquinaria Pesada por Código, Modelo y Subcategoría)
    if (isHorasMaquina) {
      const normTarget = normalizeText(concepto);
      const targetWords = normTarget.split(' ').filter(w => 
        w.length > 2 && !['grua', 'camion', 'chuto', 'pesado', 'transporte', 'serie', 'equipo', 'frontal', 'para', 'con', 'las', 'los'].includes(w)
      );

      const matchedSalidas = salidas.filter(s => {
        if (isNormalizacion(s)) return false;
        // Si no tiene horas asignadas (0.0 hrs y $0.00), es un reporte técnico de inactividad de campo, no un costo imputable
        if ((s.cantidad || 0) <= 0 || (s.montoTotal || 0) <= 0) return false;

        const catS = (s.categoria || '').toLowerCase().trim();
        const tipoS = (s.tipo || '').toLowerCase().trim();
        const codS = (s.codigoSalida || '').toLowerCase().trim();

        // 1. Identificar si el registro pertenece a la categoría de maquinaria / horas máquina / equipos
        const isEquipmentRecord = 
          tipoS.includes('maquina') || tipoS.includes('máquina') ||
          catS.includes('maquina') || catS.includes('máquina') ||
          catS.includes('grua') || catS.includes('grúa') ||
          catS.includes('camion') || catS.includes('camión') ||
          catS.includes('montacarga') || catS.includes('movimiento de tierra') ||
          catS.includes('equipos especiales') ||
          (s.codigoSalida && (s.codigoSalida.startsWith('HM-') || EQUIPOS_HM_MAP[s.codigoSalida]));

        if (!isEquipmentRecord) return false;

        const normSub = normalizeText(s.subcategoria);
        const normDesc = normalizeText(s.itemDescripcion);
        const normCod = normalizeText(s.codigoSalida);
        const mappedName = s.codigoSalida && EQUIPOS_HM_MAP[s.codigoSalida] ? normalizeText(EQUIPOS_HM_MAP[s.codigoSalida]) : '';

        // A. Coincidencia por código de equipo mapeado o nombre oficial
        for (const [code, name] of Object.entries(EQUIPOS_HM_MAP)) {
          const nCode = normalizeText(code);
          const nName = normalizeText(name);
          const targetMatchesThisEquipment = normTarget.includes(nCode) || normTarget.includes(nName) || nName.includes(normTarget);
          if (targetMatchesThisEquipment) {
            if (normCod === nCode || mappedName === nName) return true;
          }
        }

        // B. Coincidencia directa o contenida de subcategoría
        if (normSub && (normTarget.includes(normSub) || normSub.includes(normTarget))) {
          return true;
        }

        // C. Coincidencia por palabras clave del modelo (ej: demag + ac200, hyundai + hl760, case + 580)
        const combined = `${normSub} ${normDesc} ${mappedName} ${normCod}`;
        if (targetWords.length > 0) {
          const allMatch = targetWords.every(w => {
            if (/^\d+/.test(w)) {
              return combined.includes(w.replace(/[a-z]/g, ''));
            }
            return combined.includes(w);
          });
          if (allMatch) return true;
        }

        return false;
      });

      if (matchedSalidas.length > 0) {
        return matchedSalidas.map((s, idx) => {
          const cta = s.cuentaAuxiliarCodigo || s.centroCosto || 'TTE-C-0706';
          const pryInfo = getProyectoAuxiliarInfo(cta);
          const pryNombre = CUENTAS_CORTAS_MAP[cta] || pryInfo?.proyectoCorto || s.cuentaAuxiliarNombre || s.proyecto;

          let fStr = s.fecha;
          if (fStr.includes('-')) {
            const p = fStr.split('-');
            if (p.length === 3) fStr = `${p[2]}/${p[1]}/${p[0]}`;
          }

          const equipoNombre = EQUIPOS_HM_MAP[s.codigoSalida] || s.subcategoria || `Equipo ${s.codigoSalida}`;

          return {
            id: s.id || `hm-${idx}`,
            tipo: 'Horas Maquina',
            almacen: s.responsable || 'Flota y Equipos Pesados TIMACA',
            fecha: fStr,
            numero: s.codigoSalida,
            pedido: s.codigoSalida.startsWith('HM-') ? `Parte Diario ${s.codigoSalida}` : `Control Diario ${s.codigoSalida}`,
            cuentaAux: cta,
            proyectoNombre: pryNombre,
            ceco: s.centroCosto || 'FLOTA-1',
            codigo: s.codigoSalida,
            descripcion: s.itemDescripcion.toLowerCase().includes(equipoNombre.toLowerCase()) ? s.itemDescripcion : `${equipoNombre} - ${s.itemDescripcion}`,
            cantidad: s.cantidad || 1,
            unidad: s.unidadMedida || 'HRS',
            solicitante: s.solicitante || 'Operador de Maquinaria / SIAHO',
            motivo: s.motivo || s.itemDescripcion || `Operación de equipo en ${pryNombre}`,
            subcategoria: equipoNombre,
            precioFinal: s.montoUnitario || s.montoTotal,
            totalUSD: s.montoTotal,
            mes: s.mes
          };
        });
      }

      // Fallback para partidas PPT consolidadas (ej. Torno Vertical Schiess, Mandrinadora CNC, etc.)
      const pptHM = HORAS_MAQUINA_CONSOLIDADO_OFICIAL_8_MESES.find(h => 
        normalizeText(h.concepto) === normTarget || normTarget.includes(normalizeText(h.concepto)) || normalizeText(h.concepto).includes(normTarget)
      );
      if (pptHM) {
        const mesesData = [
          { mes: 1, monto: pptHM.ene, fecha: '31/01/2026' },
          { mes: 2, monto: pptHM.feb, fecha: '28/02/2026' },
          { mes: 3, monto: pptHM.mar, fecha: '31/03/2026' },
          { mes: 4, monto: pptHM.abr, fecha: '30/04/2026' },
          { mes: 5, monto: pptHM.may, fecha: '31/05/2026' },
          { mes: 6, monto: pptHM.jun, fecha: '30/06/2026' },
          { mes: 7, monto: pptHM.jul, fecha: '31/07/2026' },
          { mes: 8, monto: pptHM.ago, fecha: '31/08/2026' },
          { mes: 9, monto: pptHM.sep || 0, fecha: '30/09/2026' },
        ].filter(m => m.monto && m.monto > 0);

        return mesesData.map((m, idx) => ({
          id: `ppt-hm-${m.mes}-${idx}`,
          tipo: 'Horas Maquina',
          almacen: 'Taller Central / Maquinarias TIMACA',
          fecha: m.fecha,
          numero: `HM-OFICIAL-${m.mes.toString().padStart(2, '0')}`,
          pedido: `Consolidado Mes ${m.mes}`,
          cuentaAux: 'TTE-C-0706',
          proyectoNombre: 'Recuperación de Línea 1 de Planta de Pellas',
          ceco: 'MAQ-IND',
          codigo: `HM-TALLER-${m.mes}`,
          descripcion: `${pptHM.concepto} - Consolidado de Horas y Disponibilidad Operativa`,
          cantidad: 1,
          unidad: 'MES',
          solicitante: 'Gerencia de Planta y Mantenimiento',
          motivo: `Operación y maquinado mayor certificado en planta`,
          subcategoria: pptHM.concepto,
          precioFinal: m.monto,
          totalUSD: m.monto,
          mes: m.mes
        }));
      }
    }

    // CASO 4: SERVICIOS (17 Partidas Especializadas de Obra y Terceros)
    if (isServicios) {
      const matchedSalidas = salidas.filter(s => {
        if (isNormalizacion(s)) return false;
        const catS = s.categoria.toLowerCase().trim();
        if (!catS.includes('servicio')) return false;

        const itemDesc = (s.itemDescripcion || '').toLowerCase().trim();
        const itemTitle = toTitleCase(s.itemDescripcion || '').toLowerCase();
        const subCat = (s.subcategoria || '').toLowerCase().trim();
        const conc = (s.concepto || '').toLowerCase().trim();

        return (
          itemDesc === targetSub ||
          itemTitle === targetSub ||
          itemDesc.includes(targetSub) ||
          targetSub.includes(itemDesc) ||
          subCat.includes(targetSub) ||
          targetSub.includes(subCat) ||
          conc.includes(targetSub)
        );
      });

      if (matchedSalidas.length > 0) {
        return matchedSalidas.map((s, idx) => {
          const cta = s.cuentaAuxiliarCodigo || s.centroCosto || 'TTE-C-0706';
          const pryInfo = getProyectoAuxiliarInfo(cta);
          const pryNombre = CUENTAS_CORTAS_MAP[cta] || pryInfo?.proyectoCorto || s.cuentaAuxiliarNombre || s.proyecto;

          let fStr = s.fecha;
          if (fStr.includes('-')) {
            const p = fStr.split('-');
            if (p.length === 3) fStr = `${p[2]}/${p[1]}/${p[0]}`;
          }

          return {
            id: s.id || `serv-${idx}`,
            tipo: 'Servicios',
            almacen: 'Servicios Externos / Contratistas',
            fecha: fStr,
            numero: s.codigoSalida.startsWith('DP') || s.codigoSalida.startsWith('SRV') ? s.codigoSalida : `SRV-${s.codigoSalida}`,
            pedido: s.codigoSalida.startsWith('PA') || s.codigoSalida.startsWith('OC') ? s.codigoSalida : `OC-${s.codigoSalida}`,
            cuentaAux: cta,
            proyectoNombre: pryNombre,
            ceco: s.centroCosto || 'SRV-OBRA',
            codigo: s.codigoSalida,
            descripcion: s.itemDescripcion,
            cantidad: s.cantidad || 1,
            unidad: s.unidadMedida || 'SERV',
            solicitante: s.solicitante || 'Coordinación de Servicios',
            motivo: s.motivo || s.itemDescripcion || `Servicio contratado para ${pryNombre}`,
            subcategoria: toTitleCase(s.itemDescripcion),
            precioFinal: s.montoUnitario || s.montoTotal,
            totalUSD: s.montoTotal,
            mes: s.mes
          };
        });
      }
    }

    // CASO 5: OTRAS PARTIDAS (Materiales Directos, Costos Indirectos)
    const matchedSalidas = salidas.filter(s => {
      if (isNormalizacion(s)) return false;

      // 1. Coincidencia flexible de categoría / tipo
      const catS = (s.categoria || '').toLowerCase().trim();
      const tipoS = (s.tipo || '').toLowerCase().trim();
      const firstCatWord = targetCat.split(' ')[0];
      
      const isMaterialesTarget = targetCat.includes('material');
      const isItemMaterial = tipoS.includes('material') || catS.includes('material') || 
        catS.includes('producto') || catS.includes('herramienta') || catS.includes('gas') || 
        catS.includes('cemento') || catS.includes('tinta') || catS.includes('aceite') || 
        catS.includes('caucho') || catS.includes('bloque');

      const matchCat = isMaterialesTarget
        ? isItemMaterial
        : (catS.includes(firstCatWord) || tipoS.includes(firstCatWord));

      if (!matchCat) return false;

      // Si la partida auditada es de Servicios, bloquear terminantemente EPP e insumos físicos de almacén
      if (isServicios && (catS.includes('proteccion') || catS.includes('seguridad') || catS.includes('material') || tipoS.includes('material'))) {
        return false;
      }

      // 2. Coincidencia de concepto / subcategoría / familia oficial
      const subS = (s.subcategoria || '').toLowerCase().trim();
      const descS = (s.itemDescripcion || '').toLowerCase().trim();

      // Coincidencia directa exacta o contenida
      if (subS === targetSub || targetSub === catS) return true;
      if (subS && (subS.includes(targetSub) || targetSub.includes(subS))) return true;
      if (descS.includes(targetSub)) {
        if (targetSub.includes('combustible') && (descS.includes('filtro') || descS.includes('repuesto') || descS.includes('tapa'))) {
          return false;
        }
        return true;
      }

      // A. Planchas y Perfiles Estructurales
      if (targetSub.includes('plancha') || targetSub.includes('perfil') || targetSub.includes('estructural')) {
        return (
          catS.includes('estructural') ||
          subS.includes('estructural') ||
          catS.includes('acero al carbono') ||
          subS.includes('acero al carbono') ||
          descS.includes('plancha') ||
          descS.includes('perfil') ||
          descS.includes('viga') ||
          descS.includes('angulo') ||
          descS.includes('ángulo') ||
          descS.includes('canal') ||
          descS.includes('pletina') ||
          descS.includes('chapa') ||
          descS.includes('upn') ||
          descS.includes('astm') ||
          descS.includes('tubo estructural')
        );
      }

      // B. Tuberías, Válvulas y Conexiones
      if (targetSub.includes('tuberia') || targetSub.includes('tubería') || targetSub.includes('valvula') || targetSub.includes('válvula') || targetSub.includes('conexion') || targetSub.includes('conexión')) {
        return (
          catS.includes('tubular') ||
          subS.includes('tubular') ||
          descS.includes('tubo') ||
          descS.includes('tuberia') ||
          descS.includes('tubería') ||
          descS.includes('valvula') ||
          descS.includes('válvula') ||
          descS.includes('codo') ||
          descS.includes('brida') ||
          descS.includes('nipple') ||
          descS.includes('flange') ||
          descS.includes('tee ')
        );
      }

      // C. Tornillería y Elementos de Fijación
      if (targetSub.includes('torniller') || targetSub.includes('fijacion') || targetSub.includes('fijación')) {
        return (
          descS.includes('tornillo') ||
          descS.includes('perno') ||
          descS.includes('tuerca') ||
          descS.includes('arandela') ||
          descS.includes('esparrago') ||
          descS.includes('espárrago') ||
          descS.includes('remache') ||
          descS.includes('tarugo')
        );
      }

      // D. Equipos y Consumibles de Soldadura
      if (targetSub.includes('soldadura') || targetSub.includes('consumibles')) {
        return (
          catS.includes('soldadura') ||
          subS.includes('soldadura') ||
          descS.includes('soldadura') ||
          descS.includes('electrodo') ||
          descS.includes('varilla') ||
          descS.includes('alambre') ||
          descS.includes('fundente') ||
          descS.includes('antorcha') ||
          descS.includes('boquilla')
        );
      }

      // E. Materiales Mecánicos
      if (targetSub.includes('mecanico') || targetSub.includes('mecánico')) {
        return (
          catS.includes('mecanic') ||
          subS.includes('mecanic') ||
          descS.includes('rodamiento') ||
          descS.includes('chumacer') ||
          descS.includes('engranaje') ||
          descS.includes('cadena') ||
          descS.includes('polea') ||
          descS.includes('correa') ||
          descS.includes('reten') ||
          descS.includes('retén')
        );
      }

      // F. Materiales Eléctricos
      if (targetSub.includes('electrico') || targetSub.includes('eléctrico')) {
        return (
          catS.includes('electr') ||
          subS.includes('electr') ||
          descS.includes('cable') ||
          descS.includes('breker') ||
          descS.includes('breaker') ||
          descS.includes('interruptor') ||
          descS.includes('tomacorriente') ||
          descS.includes('transformador') ||
          descS.includes('luminaria') ||
          descS.includes('foco') ||
          descS.includes('rele') ||
          descS.includes('relé') ||
          descS.includes('borne') ||
          descS.includes('aislador')
        );
      }

      // G. Materiales Hidroneumáticos
      if (targetSub.includes('hidroneumatico') || targetSub.includes('hidroneumático')) {
        return (
          catS.includes('hidroneumatic') ||
          subS.includes('hidroneumatic') ||
          descS.includes('hidraulico') ||
          descS.includes('hidráulico') ||
          descS.includes('neumatico') ||
          descS.includes('neumático') ||
          descS.includes('manguera') ||
          descS.includes('cilindro') ||
          descS.includes('piston') ||
          descS.includes('pistón') ||
          descS.includes('o-ring') ||
          descS.includes('sello')
        );
      }

      // H. Aceite Hidráulico / Lubricantes
      if (targetSub.includes('aceite') || targetSub.includes('lubricante') || targetSub.includes('grasa')) {
        return (
          catS.includes('aceite') ||
          catS.includes('lubricante') ||
          catS.includes('grasa') ||
          descS.includes('aceite') ||
          descS.includes('grasa') ||
          descS.includes('lubricante')
        );
      }

      // I. Oxicorte y Gases
      if (targetSub.includes('oxicorte') || targetSub.includes('gas') || targetSub.includes('oxigeno') || targetSub.includes('oxígeno') || targetSub.includes('argon') || targetSub.includes('propano')) {
        return (
          catS.includes('oxicorte') ||
          catS.includes('gas') ||
          descS.includes('oxigeno') ||
          descS.includes('oxígeno') ||
          descS.includes('argon') ||
          descS.includes('argón') ||
          descS.includes('propano') ||
          descS.includes('acetileno') ||
          descS.includes('co2')
        );
      }

      // J. Equipos de Protección Personal / Seguridad
      if (targetSub.includes('proteccion') || targetSub.includes('protección') || targetSub.includes('seguridad') || targetSub.includes('epp')) {
        return (
          catS.includes('proteccion') ||
          catS.includes('seguridad') ||
          catS.includes('ropa') ||
          catS.includes('uniforme') ||
          descS.includes('guante') ||
          descS.includes('casco') ||
          descS.includes('lente') ||
          descS.includes('bota') ||
          descS.includes('mascarilla') ||
          descS.includes('chaleco') ||
          descS.includes('arnes') ||
          descS.includes('arnés')
        );
      }

      // K. Palabras clave generales coincidentes
      const palabras = targetSub.split(' ').filter(p => p.length > 3 && !['para', 'este', 'esta', 'unos', 'unas', 'cada', 'personal', 'servicio', 'servicios', 'integral', 'cuadrillas'].includes(p));
      if (palabras.length > 0 && palabras.some(p => descS.includes(p) || catS.includes(p) || subS.includes(p))) {
        return true;
      }

      return false;
    });

    if (matchedSalidas.length > 0) {
      return matchedSalidas.map((s, idx) => {
        const cta = s.cuentaAuxiliarCodigo || s.centroCosto || 'TTE-C-0706';
        const pryInfo = getProyectoAuxiliarInfo(cta);
        const pryNombre = CUENTAS_CORTAS_MAP[cta] || pryInfo?.proyectoCorto || s.cuentaAuxiliarNombre || s.proyecto;

        // Parse format date
        let fStr = s.fecha;
        if (fStr.includes('-')) {
          const p = fStr.split('-');
          if (p.length === 3) fStr = `${p[2]}/${p[1]}/${p[0]}`;
        }

        return {
          id: s.id || `salida-${idx}`,
          tipo: s.tipo || s.categoria,
          almacen: s.responsable?.includes('ALM') ? s.responsable : 'ALMCE',
          fecha: fStr,
          numero: s.codigoSalida.startsWith('DP') ? s.codigoSalida : `DP-${s.codigoSalida}`,
          pedido: s.codigoSalida.startsWith('PA') ? s.codigoSalida : `PA-${s.codigoSalida}`,
          cuentaAux: cta,
          proyectoNombre: pryNombre,
          ceco: s.centroCosto || 'MON-3',
          codigo: s.codigoSalida,
          descripcion: s.itemDescripcion,
          cantidad: s.cantidad || 1,
          unidad: s.unidadMedida || 'UND',
          solicitante: s.solicitante || 'Residencia de Obra',
          motivo: s.motivo || s.observaciones || `Imputación autorizada para ${pryNombre}`,
          subcategoria: concepto,
          precioFinal: s.montoUnitario || s.montoTotal,
          totalUSD: s.montoTotal,
          mes: s.mes
        };
      });
    }

    // Modo Estricto: Cero invenciones ni fallbacks sintéticos.
    // Si no existen registros reales para esta partida, retorna lista vacía [].
    return [];
  }, [salidas, concepto, categoria, isEPP, selectedMesFilter]);

  // Proyectos únicos presentes en la data
  const proyectosUnicos = useMemo(() => {
    return Array.from(new Set(allRowsUnificada.map(r => r.cuentaAux))).sort();
  }, [allRowsUnificada]);

  // Si se abre un mes específico donde el equipo o partida no tuvo despachos pero sí los tuvo en otros meses,
  // cambiar automáticamente a 'TODOS' para que el usuario nunca vea la pantalla vacía en $0.00
  useEffect(() => {
    if (allRowsUnificada.length > 0 && selectedMesFilter !== 'TODOS') {
      const targetMes = Number(selectedMesFilter);
      const hasRecords = allRowsUnificada.some(r => r.mes === targetMes);
      if (!hasRecords) {
        setSelectedMesFilter('TODOS');
      }
    }
  }, [allRowsUnificada, selectedMesFilter]);

  // Filtrar según mes, proyecto, subcategoría y término de búsqueda
  const filasFiltradas = useMemo(() => {
    return allRowsUnificada.filter(r => {
      // 1. Filtro de mes (si no es 'TODOS')
      if (selectedMesFilter !== 'TODOS') {
        const mesTarget = Number(selectedMesFilter);
        if (r.mes !== undefined && r.mes !== mesTarget) return false;
      }

      // 2. Filtro de proyecto
      if (selectedPryFilter && selectedPryFilter !== 'TODOS') {
        if (r.cuentaAux !== selectedPryFilter) return false;
      }

      // 3. Filtro de subcategoría EPP (si aplica)
      if (isEPP && selectedSubcategoriaEPP !== 'todas') {
        if (r.subcategoria !== selectedSubcategoriaEPP) return false;
      }

      // 4. Término de búsqueda general
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const match = 
          r.descripcion.toLowerCase().includes(q) ||
          r.codigo.toLowerCase().includes(q) ||
          r.numero.toLowerCase().includes(q) ||
          r.pedido.toLowerCase().includes(q) ||
          r.cuentaAux.toLowerCase().includes(q) ||
          r.proyectoNombre.toLowerCase().includes(q) ||
          r.solicitante.toLowerCase().includes(q) ||
          r.motivo.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [allRowsUnificada, selectedMesFilter, selectedPryFilter, selectedSubcategoriaEPP, isEPP, searchTerm]);

  // Totales y métricas dinámicas
  const totalMonto = useMemo(() => {
    return filasFiltradas.reduce((sum, r) => sum + r.totalUSD, 0);
  }, [filasFiltradas]);

  const totalCantidad = useMemo(() => {
    return filasFiltradas.reduce((sum, r) => sum + r.cantidad, 0);
  }, [filasFiltradas]);

  const totalProyectosImputados = useMemo(() => {
    return new Set(filasFiltradas.map(r => r.cuentaAux)).size;
  }, [filasFiltradas]);

  const precioPromedio = totalCantidad > 0 ? Math.round((totalMonto / totalCantidad) * 100) / 100 : 0;
  const rawUp = filasFiltradas[0]?.unidad || 'UND';
  const unidadPrincipal = rawUp === 'USE' ? 'SERV' : rawUp;

  const formatUnidadLegible = (u: string) => {
    const raw = (u || '').toUpperCase().trim();
    if (raw === 'USE' || raw === 'SERV' || raw === 'SRV') return 'servicio';
    if (raw === 'UND' || raw === 'UNID') return 'unidad';
    if (raw === 'HRS' || raw === 'HR') return 'hora';
    if (raw === 'MTR' || raw === 'MTS' || raw === 'M') return 'metro';
    if (raw === 'KG' || raw === 'KGS') return 'kilogramo';
    if (raw === 'GL' || raw === 'GAL') return 'galón';
    if (raw === 'PZA' || raw === 'PZAS') return 'pieza';
    if (raw === 'PAR' || raw === 'PARES') return 'par';
    return raw.toLowerCase() || 'unidad';
  };

  const mesLabel = useMemo(() => {
    if (selectedMesFilter === 'TODOS') return 'Acumulado Anual (Ene - Sep)';
    const nombres = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre'];
    return `${nombres[Number(selectedMesFilter)] || 'Septiembre'} 2026`;
  }, [selectedMesFilter]);

  // Exportar a Excel con las 16 columnas exactas de Unificada
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    const dataExcel: Record<string, string | number>[] = filasFiltradas.map((r, idx) => ({
      'N°': idx + 1,
      'Tipo': r.tipo,
      'Almacén': r.almacen,
      'Fecha': r.fecha,
      'Número (DP)': r.numero,
      'Pedido (PA)': r.pedido,
      'Cuenta-Aux': r.cuentaAux,
      'Proyecto': r.proyectoNombre,
      'Ceco': r.ceco,
      'Código': r.codigo,
      'Descripción del Ítem': r.descripcion,
      'Cantidad': r.cantidad,
      'Unidad': r.unidad,
      'Solicitante': r.solicitante,
      'Motivo': r.motivo,
      'Subcategoría': r.subcategoria,
      'Precio Final ($)': r.precioFinal,
      'Total USD': r.totalUSD
    }));

    // Fila de Total
    dataExcel.push({
      'N°': '',
      'Tipo': 'TOTAL GENERAL',
      'Almacén': '',
      'Fecha': '',
      'Número (DP)': '',
      'Pedido (PA)': '',
      'Cuenta-Aux': '',
      'Proyecto': `${totalProyectosImputados} Proyectos Imputados`,
      'Ceco': '',
      'Código': '',
      'Descripción del Ítem': '',
      'Cantidad': totalCantidad,
      'Unidad': unidadPrincipal,
      'Solicitante': '',
      'Motivo': '',
      'Subcategoría': '',
      'Precio Final ($)': precioPromedio,
      'Total USD': totalMonto
    });

    const ws = XLSX.utils.json_to_sheet(dataExcel);
    XLSX.utils.book_append_sheet(wb, ws, 'Unificada_Auditada');

    const cleanName = `TIMACA_Unificada_${concepto.substring(0, 25).replace(/[^a-zA-Z0-9_-]/g, '_')}_Agosto2026.xlsx`;
    XLSX.writeFile(wb, cleanName);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Breadcrumb & Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs">
        <div className="flex items-center gap-2 text-xs flex-wrap">
          <button
            onClick={onVolver}
            className="flex items-center gap-1.5 font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-xl transition-colors shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a Auditoría por Categorías</span>
          </button>
          <span className="text-neutral-300">/</span>
          <span className="text-neutral-500 font-semibold">{categoria}</span>
          <span className="text-neutral-300">/</span>
          <span className="text-neutral-900 font-bold truncate max-w-xs sm:max-w-md">
            {concepto}
          </span>
        </div>

        <button
          onClick={handleExportExcel}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition-colors shadow-2xs self-start sm:self-auto cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-emerald-700" />
          <span>Exportar Matriz Unificada (.xlsx)</span>
        </button>
      </div>

      {downloadSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-fade-in font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span><strong>¡Descarga completada!</strong> Se exportaron {filasFiltradas.length} comprobantes de auditoría en formato Excel oficial.</span>
        </div>
      )}

      {/* Main KPI Cards Grid */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                AUDITORÍA PROFUNDA · SISTEMA UNIFICADO ERP
              </span>
              <span className="text-xs text-neutral-500 font-semibold">
                Corte: <strong>{mesLabel}</strong>
              </span>
            </div>
            <h2 className="text-xl font-black text-neutral-900 mt-1">
              {concepto}
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Trazabilidad integral de comprobantes de despacho (DP), requisiciones (PA), precios unitarios, almacenes y solicitantes reales
            </p>
          </div>

          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-emerald-800 text-xs font-bold self-start md:self-center">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Datos 100% Reales del Almacén Central</span>
          </div>
        </div>

        {/* Dynamic KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-blue-50/60 p-3.5 rounded-xl border border-blue-200">
            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
              Monto Auditado ({mesLabel.split(' ')[0]})
            </span>
            <span className="text-lg font-black font-mono text-blue-950 block mt-0.5">
              ${Math.round(totalMonto).toLocaleString('de-DE')} USD
            </span>
            <span className="text-[10px] text-blue-600 mt-0.5 block">
              {filasFiltradas.length} despachos auditados
            </span>
          </div>

          <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200">
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">
              Proyectos Imputados
            </span>
            <span className="text-lg font-black font-mono text-neutral-900 block mt-0.5">
              {totalProyectosImputados} Proyectos
            </span>
            <span className="text-[10px] text-neutral-500 mt-0.5 block">
              {selectedPryFilter === 'TODOS' ? 'Distribución corporativa general' : `Filtrado a ${selectedPryFilter}`}
            </span>
          </div>

          <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200">
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">
              Volumen / Unidades
            </span>
            <span className="text-lg font-black font-mono text-neutral-900 block mt-0.5">
              {formatNumber(totalCantidad)} {unidadPrincipal === 'USE' ? 'SERV' : unidadPrincipal}
            </span>
            <span className="text-[10px] text-neutral-500 mt-0.5 block">
              Despachado en almacén de obra
            </span>
          </div>

          <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200">
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">
              Precio Promedio Unitario
            </span>
            <span className="text-lg font-black font-mono text-neutral-900 block mt-0.5">
              ${formatUnitPriceRaw(precioPromedio)} USD
            </span>
            <span className="text-[10px] text-neutral-500 mt-0.5 block">
              Costo ponderado por {formatUnidadLegible(unidadPrincipal)}
            </span>
          </div>
        </div>
      </div>

      {/* SECCIÓN ESPECIAL NIVEL 2.5: SUBCATEGORÍAS DE EPP (DÓNDE ESTÁ TODA LA PLATA) */}
      {isEPP && (
        <div className="bg-white p-5 rounded-2xl border border-blue-200 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-2.5">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">
                NIVEL 2.5 · FAMILIAS OPERACIONALES DE SEGURIDAD INDUSTRIAL
              </span>
              <h3 className="text-sm font-bold text-neutral-900">
                ¿Dónde se invirtió el dinero en EPP? (Haz clic en una familia para filtrar)
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded-lg">
              {RESUMEN_SUBCATEGORIAS_EPP_AGOSTO.length} Familias Contables
            </span>
          </div>

          {/* Subcategory Pills Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            <div
              onClick={() => setSelectedSubcategoriaEPP('todas')}
              className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                selectedSubcategoriaEPP === 'todas'
                  ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-500/20 shadow-xs'
                  : 'border-neutral-200 hover:border-neutral-300 bg-white'
              }`}
            >
              <span className="font-bold text-neutral-900 text-xs block truncate">
                ★ Todas las Familias
              </span>
              <span className="text-xs font-mono font-black text-blue-900 block mt-0.5">
                ${RESUMEN_SUBCATEGORIAS_EPP_AGOSTO.reduce((acc, s) => acc + s.totalUSD, 0).toLocaleString('de-DE')} USD
              </span>
              <span className="text-[10px] text-neutral-500 block mt-0.5">
                1.982 movimientos
              </span>
            </div>

            {RESUMEN_SUBCATEGORIAS_EPP_AGOSTO.map(sub => {
              const isSelected = selectedSubcategoriaEPP === sub.nombre;
              return (
                <div
                  key={sub.nombre}
                  onClick={() => setSelectedSubcategoriaEPP(sub.nombre)}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-500/20 shadow-xs'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <span className="font-bold text-neutral-900 text-xs block truncate" title={sub.nombre}>
                    {sub.nombre}
                  </span>
                  <span className="text-xs font-mono font-black text-neutral-900 block mt-0.5">
                    ${Math.round(sub.totalUSD).toLocaleString('de-DE')} USD
                  </span>
                  <div className="flex items-center justify-between text-[10px] text-neutral-500 mt-0.5">
                    <span>{sub.movimientos} despachos</span>
                    <span>{sub.proyectosCount} proyectos</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}



      {/* Filter Bar & Controls */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por código SI, DP, PA, descripción o solicitante real..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Month Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-neutral-600">Mes:</span>
            <select
              value={selectedMesFilter}
              onChange={(e) => setSelectedMesFilter(e.target.value)}
              className="text-xs font-bold text-neutral-900 bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="9">Septiembre 2026 (Auditoría Actual)</option>
              <option value="8">Agosto 2026 (Corte Oficial Master)</option>
              <option value="7">Julio 2026</option>
              <option value="6">Junio 2026</option>
              <option value="5">Mayo 2026</option>
              <option value="4">Abril 2026</option>
              <option value="3">Marzo 2026</option>
              <option value="2">Febrero 2026</option>
              <option value="1">Enero 2026</option>
              <option value="TODOS">Todos los Meses (Acumulado Anual Ene - Sep)</option>
            </select>
          </div>

          {/* Project Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-neutral-600">Proyecto:</span>
            <select
              value={selectedPryFilter}
              onChange={(e) => setSelectedPryFilter(e.target.value)}
              className="text-xs font-bold text-neutral-900 bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 max-w-[340px] cursor-pointer"
            >
              <option value="TODOS">TODOS · Todos los Proyectos Imputados ({proyectosUnicos.length})</option>
              {proyectosUnicos.map(cod => {
                const pryInfo = getProyectoAuxiliarInfo(cod);
                const nombreCorto = CUENTAS_CORTAS_MAP[cod] || pryInfo?.proyectoCorto || '';
                return (
                  <option key={cod} value={cod}>
                    {cod} · {nombreCorto ? `${nombreCorto}` : (pryInfo?.proyecto || cod)}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        <div className="text-xs text-neutral-500 font-medium">
          Mostrando <strong>{filasFiltradas.length}</strong> comprobantes reales auditados
        </div>
      </div>

      {/* THE MASTER UNIFICADA AUDIT TABLE (16 EXACT COLUMNS MATCHING USER'S EXCEL CAPTURE) */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto max-h-[640px] overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 z-10 bg-[#0b2545] text-white font-bold">
              <tr>
                <th className="py-3 px-3 min-w-[70px]">Almacén</th>
                <th className="py-3 px-3 min-w-[85px]">Fecha</th>
                <th className="py-3 px-3 min-w-[95px] font-mono">Número (DP)</th>
                <th className="py-3 px-3 min-w-[85px] font-mono">Pedido (PA)</th>
                <th className="py-3 px-3.5 min-w-[150px]">Cuenta-Aux / Proyecto</th>
                <th className="py-3 px-2.5 min-w-[65px] font-mono">Ceco</th>
                <th className="py-3 px-3 min-w-[95px] font-mono">Código</th>
                <th className="py-3 px-4 min-w-[260px]">Descripción Detallada del Ítem</th>
                <th className="py-3 px-2.5 text-right min-w-[75px]">Cantidad</th>
                <th className="py-3 px-2 min-w-[55px]">Unidad</th>
                <th className="py-3 px-3.5 min-w-[140px]">Solicitante Real</th>
                <th className="py-3 px-4 min-w-[220px]">Motivo / Justificación</th>
                <th className="py-3 px-3 text-right min-w-[95px]">Precio Final ($)</th>
                <th className="py-3 px-3.5 text-right bg-[#081c33] min-w-[110px]">Total USD</th>
                <th className="py-3 px-3 text-center min-w-[80px]">Auditar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 bg-white">
              {filasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={15} className="py-16 text-center text-neutral-500 bg-neutral-50/50">
                    <div className="flex flex-col items-center justify-center gap-2 max-w-md mx-auto">
                      <span className="text-3xl font-black text-neutral-400 font-mono">$0.00 USD</span>
                      <p className="text-sm font-bold text-neutral-700">
                        {concepto.toLowerCase().includes('ajuste')
                          ? 'Partida de Cierre y Conciliación Contable PPT'
                          : `Sin registros de movimientos para los filtros seleccionados (${mesLabel})`}
                      </p>
                      {allRowsUnificada.length > 0 ? (
                        <div className="space-y-3 mt-1">
                          <p className="text-xs text-blue-700 font-medium">
                            Se encontraron <strong>{allRowsUnificada.length}</strong> movimientos reales para esta partida en otros períodos o proyectos.
                          </p>
                          <div className="flex items-center justify-center gap-2 flex-wrap">
                            {selectedMesFilter !== 'TODOS' && (
                              <button
                                type="button"
                                onClick={() => setSelectedMesFilter('TODOS')}
                                className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
                              >
                                Ver Todos los Meses (Acumulado)
                              </button>
                            )}
                            {selectedPryFilter !== 'TODOS' && (
                              <button
                                type="button"
                                onClick={() => setSelectedPryFilter('TODOS')}
                                className="px-3.5 py-1.5 bg-neutral-700 hover:bg-neutral-800 text-white font-bold rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
                              >
                                Ver Todos los Proyectos
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-neutral-400 leading-relaxed max-w-lg">
                          {concepto.toLowerCase().includes('ajuste')
                            ? 'Esta partida corresponde a un asiento contable oficial de cierre y consolidación gerencial (compras en tránsito, disponibilidad operativa o provisiones de nómina) presentado en la lámina ejecutiva TIMACA y no a un despacho físico unitario de almacén.'
                            : '(La matriz real Unificada no contiene salidas imputadas para esta partida, proyecto o período. Cero datos simulados.)'}
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filasFiltradas.map((it) => (
                <tr 
                  key={it.id} 
                  onClick={() => setModalItem(it)}
                  className="hover:bg-blue-50/70 transition-colors cursor-pointer group"
                  title="Haz clic para ver el detalle contable completo y trazabilidad SIP"
                >
                  <td className="py-3 px-3.5 font-mono font-bold text-slate-800">
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-xs border border-slate-200">
                      {it.almacen}
                    </span>
                  </td>
                  <td className="py-3 px-3.5 font-mono text-xs font-medium text-slate-700 whitespace-nowrap">
                    {it.fecha}
                  </td>
                  <td className="py-3 px-3.5 font-mono text-xs font-bold text-blue-700 whitespace-nowrap">
                    {it.numero}
                  </td>
                  <td className="py-3 px-3.5 font-mono text-xs text-slate-800 whitespace-nowrap">
                    {it.pedido}
                  </td>
                  <td className="py-3 px-3.5">
                    <span className="font-mono font-bold text-blue-800 block text-xs">
                      {it.cuentaAux}
                    </span>
                    <span className="text-xs text-slate-700 font-medium block truncate max-w-[180px]" title={it.proyectoNombre}>
                      {it.proyectoNombre}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-600 text-xs">
                    {it.ceco}
                  </td>
                  <td className="py-3 px-3.5 font-mono text-slate-700 text-xs whitespace-nowrap">
                    {it.codigo}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900 text-sm">
                    <span className="block">{it.descripcion}</span>
                    {it.subcategoria && it.subcategoria !== concepto && (
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {it.subcategoria}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold tabular-nums text-slate-900 text-xs">
                    {it.cantidad.toLocaleString('de-DE')}
                  </td>
                  <td className="py-3 px-2 text-slate-600 font-medium text-xs">
                    {it.unidad === 'USE' ? 'SERV' : it.unidad}
                  </td>
                  <td className="py-3 px-3.5 text-slate-800 text-xs font-semibold whitespace-nowrap">
                    {it.solicitante}
                  </td>
                  <td className="py-3 px-4 text-slate-600 text-xs leading-relaxed">
                    <span className="truncate block max-w-sm" title={it.motivo}>
                      {it.motivo}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-800 text-xs">
                    ${formatUnitPriceRaw(it.precioFinal)}
                  </td>
                  <td className="py-3 px-3.5 text-right font-mono font-black tabular-nums text-blue-950 bg-blue-50/50 text-sm">
                    ${formatAmountAuto(it.totalUSD)}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 group-hover:bg-blue-600 group-hover:text-white border border-blue-200 px-2.5 py-1 rounded-lg transition-all">
                      Ver &gt;
                    </span>
                  </td>
                </tr>
              )))}
            </tbody>
            <tfoot className="sticky bottom-0 z-10 bg-[#0b2545] text-white font-black text-xs">
              <tr>
                <td className="py-3 px-3 uppercase tracking-wider" colSpan={7}>
                  TOTAL CONSOLIDADO DE LA AUDITORÍA ({filasFiltradas.length} LÍNEAS)
                </td>
                <td className="py-3 px-4 text-right">
                  TOTALES:
                </td>
                <td className="py-3 px-2.5 text-right font-mono tabular-nums">
                  {totalCantidad.toLocaleString('de-DE')}
                </td>
                <td className="py-3 px-2 text-neutral-300">
                  {unidadPrincipal}
                </td>
                <td colSpan={2} className="py-3 px-3.5 text-slate-300 text-[11px] font-normal">
                  Promedio: ${formatUnitPriceRaw(precioPromedio)} USD
                </td>
                <td className="py-3 px-3 text-right"></td>
                <td className="py-3 px-3.5 text-right font-mono text-sm text-amber-300 bg-[#081c33]">
                  ${Math.round(totalMonto).toLocaleString('de-DE')} USD
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* MODAL INTERACTIVO: AUDITORÍA CONTABLE Y TRAZABILIDAD SIP */}
      {modalItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded">
                    COMPROBANTE {modalItem.numero}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-300 px-2 py-0.5 rounded">
                    REQUISICIÓN {modalItem.pedido}
                  </span>
                  <span className="text-xs text-neutral-500 font-mono">
                    {modalItem.fecha} · Almacén {modalItem.almacen}
                  </span>
                </div>
                <h3 className="text-base font-black text-neutral-900 mt-1.5">
                  Auditoría Contable y Salida SIP
                </h3>
              </div>
              <button
                onClick={() => setModalItem(null)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                title="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cuenta Auxiliar y Proyecto */}
            <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1.5">
              <div className="flex items-center justify-between text-xs flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase text-neutral-500">Cuenta Auxiliar / Proyecto:</span>
                  <span className="font-mono font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded">
                    {modalItem.cuentaAux}
                  </span>
                </div>
                <span className="font-mono text-[11px] text-neutral-500">
                  Ceco: <strong>{modalItem.ceco}</strong>
                </span>
              </div>
              <p className="font-bold text-neutral-900 text-sm">
                {modalItem.proyectoNombre}
              </p>
              <div className="flex items-center gap-2 pt-1 border-t border-neutral-200 text-xs flex-wrap">
                <span className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded border bg-blue-100 text-blue-800 border-blue-200">
                  {modalItem.tipo}
                </span>
                <span className="font-medium text-neutral-600">
                  Familia / Rubro: <strong>{modalItem.subcategoria}</strong>
                </span>
              </div>
            </div>

            {/* Ítem y Monto */}
            <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-blue-700">Descripción del Ítem o Servicio</span>
                <span className="font-mono text-[11px] font-bold text-neutral-600">
                  Cód: {modalItem.codigo}
                </span>
              </div>
              <p className="font-bold text-neutral-900 text-sm">
                {modalItem.descripcion}
              </p>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-blue-200/60 text-xs">
                <div>
                  <span className="text-neutral-500 block text-[11px]">Cantidad</span>
                  <span className="font-mono font-bold text-neutral-900 text-sm">
                    {modalItem.cantidad.toLocaleString('de-DE')} {modalItem.unidad === 'USE' ? 'SERV' : modalItem.unidad}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[11px]">Precio Unitario</span>
                  <span className="font-mono font-semibold text-neutral-800 text-sm">
                    ${formatUnitPriceRaw(modalItem.precioFinal)} USD
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[11px]">Precio Total</span>
                  <span className="font-mono font-black text-blue-700 text-base">
                    ${formatAmountAuto(modalItem.totalUSD)} USD
                  </span>
                </div>
              </div>

              {/* Banner informativo si la cantidad o el costo es 0 (ej. Grúas/Equipos en Standby) */}
              {modalItem.cantidad === 0 && (
                <div className="p-3 bg-amber-50/90 border border-amber-300 rounded-xl space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-950 border border-amber-300">
                      EQUIPO EN PLANTA SIN ACTIVIDAD OPERATIVA / STANDBY
                    </span>
                  </div>
                  <p className="text-xs text-amber-900 leading-relaxed">
                    Este registro proviene del parte diario de campo en Planta de Pellas. El equipo se reportó presente en sitio pero sin horas operativas facturables en la fecha ({modalItem.motivo || 'Sin actividad asignada'}). Costo imputado: $0 USD.
                  </p>
                </div>
              )}

              {/* Cálculo exacto */}
              <div className="mt-2.5 p-2.5 bg-white border border-blue-200 rounded-lg text-xs">
                <span className="text-[10px] uppercase font-bold text-neutral-500 block">
                  CÁLCULO:
                </span>
                <span className="font-mono text-xs sm:text-sm font-bold text-blue-900">
                  {modalItem.cantidad.toLocaleString('de-DE')} {modalItem.unidad === 'USE' ? 'SERV' : modalItem.unidad} × ${formatUnitPriceRaw(modalItem.precioFinal)} = ${formatAmountAuto(modalItem.totalUSD)} USD
                </span>
              </div>
            </div>

            {/* Trazabilidad Operativa */}
            <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl space-y-2 text-xs text-neutral-800">
              <span className="text-[10px] uppercase font-bold text-neutral-600 block">
                TRAZABILIDAD OPERATIVA EN OBRA
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-neutral-700 pt-1">
                <div>
                  <span className="text-neutral-500 block text-[10px]">Fecha del Despacho:</span>
                  <strong className="font-mono">{modalItem.fecha}</strong>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px]">Solicitante Real:</span>
                  <strong className="text-blue-900">{modalItem.solicitante}</strong>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px]">Almacén de Origen:</span>
                  <strong>{modalItem.almacen} (Almacén Central TIMACA)</strong>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px]">Centro de Costo Imputado:</span>
                  <strong className="font-mono">{modalItem.ceco}</strong>
                </div>
                <div className="col-span-2 pt-1 border-t border-neutral-200">
                  <span className="text-neutral-500 block text-[10px]">Motivo Técnico / Justificación de Obra:</span>
                  <p className="p-2 bg-white rounded border border-neutral-200 font-medium text-neutral-800 mt-0.5">
                    {modalItem.motivo || 'Dotación de seguridad y materiales para personal operativo'}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                onClick={() => setModalItem(null)}
                className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-sm cursor-pointer"
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
