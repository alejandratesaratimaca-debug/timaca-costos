import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import {
  Search,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Download,
  Edit3,
  RotateCcw,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  Layers,
  ArrowUpDown,
  History,
  X,
  Sparkles,
  ShieldCheck,
  Check,
  FileText,
  Eye
} from 'lucide-react';
import { UsuarioSistema } from '../types/usuarios';

export interface CompraItem {
  id?: string | number;
  almacen?: string;
  solicitudCompra?: string;
  ordenCompra?: string;
  fechaSolicitud?: string;
  fechaOC?: string;
  nombre_mes?: string;
  codigo: string;
  descripcion: string;
  motivo?: string;
  categoria?: string;
  cantidadSolicitada?: number;
  cantidadOC?: number;
  cantidadRecepcionada?: number;
  unidad?: string;
  cuentaAuxiliar?: string;
  proveedor?: string;
  comprador?: string;
  precioUnitario: number;
  totalUSD: number;
  tipo?: string;
}

export interface ConsumoItem {
  id?: string | number;
  almacen?: string;
  numero?: string;
  pedido?: string;
  fecha?: string;
  nombre_mes?: string;
  codigo: string;
  descripcion: string;
  cantidad: number;
  unidad?: string;
  cuentaAuxiliar?: string;
  solicitante?: string;
  motivo?: string;
  categoria?: string;
  costoUnitario: number;
  totalUSD: number;
}

export interface ArticuloPrecioAuditoria {
  codigo: string;
  descripcion: string;
  unidad: string;
  categoria: string;
  esServicio: boolean;
  precioGlobalContrato?: boolean;
  totalConsumos: number;
  cantidadConsumida: number;
  totalMontoConsumosUSD: number;
  costoPromedioDespacho: number; // Costo que reportó SIP en salidas
  ultimaCompra?: CompraItem;
  precioUltimaCompra: number;
  fechaUltimaCompra: string;
  ordenUltimaCompra: string;
  proveedorUltimaCompra: string;
  cuentaAuxiliarUltima?: string;
  motivoUltima?: string;
  solicitanteUltima?: string;
  compradorUltima?: string;
  precioPromedioCompras: number;
  totalComprasRegistradas: number;
  comprasHistorial: CompraItem[];
  ultimoRegistroCompras?: CompraItem;
  precioManual?: number;
  motivoAjuste?: string;
  fechaAjuste?: string;
  precioOficial: number; // Precio efectivo final
  fuentePrecio: 'Sistema' | 'Ultima Compra' | 'Precio Promedio' | 'Manual' | 'Critico';
  variacionPorcentaje: number; // vs ultima compra o promedio
  estado: 'conforme' | 'desfase' | 'critico' | 'ajustado';
}

// Helper para calcular precio unitario efectivo de una orden de compra en SIP
export const getPrecioCompraUnitario = (c: CompraItem): { precio: number; esGlobal: boolean } => {
  if (typeof c.precioUnitario === 'number' && c.precioUnitario > 0) {
    return { precio: c.precioUnitario, esGlobal: false };
  }
  const cant = c.cantidadOC || c.cantidadRecepcionada || 1;
  if (typeof c.totalUSD === 'number' && c.totalUSD > 0 && cant > 0) {
    return { precio: c.totalUSD / cant, esGlobal: true };
  }
  return { precio: 0, esGlobal: false };
};

// Helper para calcular costo unitario efectivo de una salida/consumo en SIP
export const getCostoConsumoUnitario = (c: ConsumoItem): number => {
  if (typeof c.costoUnitario === 'number' && c.costoUnitario > 0) {
    return c.costoUnitario;
  }
  const cant = c.cantidad || 1;
  if (typeof c.totalUSD === 'number' && c.totalUSD > 0 && cant > 0) {
    return c.totalUSD / cant;
  }
  return 0;
};

// Helper para clasificar conceptos de servicios de obra y fletes (código SE... o unidad USE)
export const esServicioConcepto = (codigo: string, unidad?: string, categoria?: string): boolean => {
  const cod = (codigo || '').toUpperCase().trim();
  const uni = (unidad || '').toUpperCase().trim();

  // En la codificación de TIMACA, los prefijos de almacén e inventario físico NUNCA son servicios:
  // RP (Repuestos), AC (Aceros/Planchas), MA (Materiales), CO (Consumibles), 
  // HE (Herramientas), EQ (Equipos), SI (Seguridad Ind/EPP), TM (Taller Mecánico)
  if (
    cod.startsWith('RP') ||
    cod.startsWith('AC') ||
    cod.startsWith('MA') ||
    cod.startsWith('CO') ||
    cod.startsWith('HE') ||
    cod.startsWith('EQ') ||
    cod.startsWith('SI') ||
    cod.startsWith('TM')
  ) {
    return false;
  }

  // Servicios oficiales de TIMACA: el código comienza con 'SE' o la unidad es 'USE'
  if (cod.startsWith('SE') || uni === 'USE') {
    return true;
  }

  // Para cualquier otro código no estándar, si su categoría es explícitamente SERVICIOS y no tiene unidad física de almacén
  const cat = (categoria || '').toUpperCase().trim();
  const esUnidadFisica = ['JG', 'KG', 'MTR', 'LTS', 'PZA', 'M2', 'M3', 'TON', 'PL', 'ROLLO', 'CAJA', 'SACO', 'PAR'].includes(uni);
  return !esUnidadFisica && (cat.includes('SERVICIO') || cat.includes('FLETE'));
};

// Helper para normalizar categorías erróneas cargadas en SIP (ej. repuestos físicos con categoría SERVICIOS)
export const normalizarCategoria = (codigo: string, categoriaOriginal?: string): string => {
  const cod = (codigo || '').toUpperCase().trim();
  const cat = (categoriaOriginal || '').trim();

  // Si el código es RP... (Repuestos) pero en SIP fue registrado como "SERVICIOS", corregir a "Repuestos Mecánicos"
  if (cod.startsWith('RP') && cat.toUpperCase().includes('SERVICIO')) {
    return 'Repuestos Mecánicos';
  }
  // Si no tiene categoría o es genérica, inferir del prefijo estándar
  if (!cat || cat === 'Compras Directas' || cat === 'Materiales Directos') {
    if (cod.startsWith('RP')) return 'Repuestos Mecánicos';
    if (cod.startsWith('AC')) return 'Materiales Acero Al Carbono';
    if (cod.startsWith('CO')) return 'Consumibles';
    if (cod.startsWith('HE')) return 'Herramientas';
    if (cod.startsWith('EQ')) return 'Equipos';
    if (cod.startsWith('SI')) return 'Seguridad Industrial';
    if (cod.startsWith('SE')) return 'SERVICIOS';
  }
  return cat || 'Materiales Directos';
};

interface CatalogoPreciosViewProps {
  currentUser?: UsuarioSistema;
  onVolver?: () => void;
}

export const CatalogoPreciosView: React.FC<CatalogoPreciosViewProps> = ({
  currentUser,
  onVolver
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [compras, setCompras] = useState<CompraItem[]>([]);
  const [consumos, setConsumos] = useState<ConsumoItem[]>([]);
  const [preciosManuales, setPreciosManuales] = useState<Record<string, { precio: number; motivo: string; fecha: string }>>({});
  
  // Segmentación Tipo de Insumo (Materiales vs Servicios vs Todos)
  const [tipoInsumo, setTipoInsumo] = useState<'materiales' | 'servicios' | 'todos'>('materiales');

  // Filtros
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'critico' | 'desfase' | 'conforme' | 'ajustado'>('todos');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('TODAS');
  const [sortBy, setSortBy] = useState<'impacto' | 'desfase' | 'consumo' | 'codigo' | 'reciente' | 'precio'>('reciente');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleSort = (col: 'impacto' | 'desfase' | 'consumo' | 'codigo' | 'reciente' | 'precio') => {
    if (sortBy === col) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortOrder(col === 'codigo' ? 'asc' : 'desc');
    }
    setCurrentPage(1);
  };
  
  // Paginación
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 40;

  // Estado de Edición
  const [editandoCodigo, setEditandoCodigo] = useState<string | null>(null);
  const [valorEdicion, setValorEdicion] = useState<string>('');
  const [motivoEdicion, setMotivoEdicion] = useState<string>('');
  const [guardandoAjuste, setGuardandoAjuste] = useState<boolean>(false);

  // Modal de Historial de Compras
  const [articuloSeleccionado, setArticuloSeleccionado] = useState<ArticuloPrecioAuditoria | null>(null);

  // Notificaciones flash
  const [notificacion, setNotificacion] = useState<{ tipo: 'success' | 'info'; texto: string } | null>(null);

  const showFlash = (texto: string, tipo: 'success' | 'info' = 'success') => {
    setNotificacion({ tipo, texto });
    setTimeout(() => setNotificacion(null), 3500);
  };

  // 1. Cargar Precios Manuales desde localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('timaca_precios_manuales_v1');
      if (saved) {
        setPreciosManuales(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Error cargando precios manuales:', e);
    }
  }, []);

  // 2. Cargar Compras y Consumos desde API local o datos estáticos
  const fetchData = async () => {
    setLoading(true);
    try {
      let rawCompras: CompraItem[] = [];
      let rawConsumos: ConsumoItem[] = [];

      // A. Intentar endpoint compras
      try {
        const resComp = await fetch('http://192.168.13.193:3005/api/compras?limit=10000', {
          signal: AbortSignal.timeout(3000)
        });
        if (resComp.ok) {
          const data = await resComp.json();
          rawCompras = Array.isArray(data) ? data : (data.items || []);
        }
      } catch (err) {
        // Fallback a compras.json estático
        const resStatic = await fetch('/data/sip/compras.json');
        if (resStatic.ok) {
          const data = await resStatic.json();
          rawCompras = Array.isArray(data) ? data : (data.items || []);
        }
      }

      // B. Intentar endpoint consumos
      try {
        const resCons = await fetch('http://192.168.13.193:3005/api/consumos?limit=50000', {
          signal: AbortSignal.timeout(3000)
        });
        if (resCons.ok) {
          const data = await resCons.json();
          rawConsumos = Array.isArray(data) ? data : (data.items || []);
        }
      } catch (err) {
        // Fallback a consumos.json estático
        const resStatic = await fetch('/data/sip/consumos.json');
        if (resStatic.ok) {
          const data = await resStatic.json();
          rawConsumos = Array.isArray(data) ? data : (data.items || []);
        }
      }

      setCompras(rawCompras);
      setConsumos(rawConsumos);
      showFlash(`Cargados ${rawConsumos.length.toLocaleString()} consumos y ${rawCompras.length.toLocaleString()} compras del SIP.`, 'info');
    } catch (error) {
      console.error('Error al obtener datos de compras/consumos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 3. Procesar y Triangular Precios por Artículo
  const catalogoArticulos = useMemo(() => {
    const mapaArticulos = new Map<string, {
      codigo: string;
      descripcion: string;
      unidad: string;
      categoria: string;
      totalConsumos: number;
      cantidadConsumida: number;
      totalMontoConsumosUSD: number;
      costoSum: number;
      costoCount: number;
      compras: CompraItem[];
    }>();

    // A. Agregar Consumos
    for (const c of consumos) {
      const cod = (c.codigo || '').trim().toUpperCase();
      if (!cod) continue;

      if (!mapaArticulos.has(cod)) {
        mapaArticulos.set(cod, {
          codigo: cod,
          descripcion: (c.descripcion || '').trim(),
          unidad: (c.unidad || 'UND').trim(),
          categoria: normalizarCategoria(cod, c.categoria),
          totalConsumos: 0,
          cantidadConsumida: 0,
          totalMontoConsumosUSD: 0,
          costoSum: 0,
          costoCount: 0,
          compras: []
        });
      }

      const art = mapaArticulos.get(cod)!;
      art.totalConsumos += 1;
      art.cantidadConsumida += (c.cantidad || 0);
      art.totalMontoConsumosUSD += (c.totalUSD || 0);
      
      const costoUnit = getCostoConsumoUnitario(c);
      if (costoUnit > 0) {
        art.costoSum += costoUnit;
        art.costoCount += 1;
      }
    }

    // B. Agregar Compras
    for (const comp of compras) {
      const cod = (comp.codigo || '').trim().toUpperCase();
      if (!cod) continue;

      if (!mapaArticulos.has(cod)) {
        mapaArticulos.set(cod, {
          codigo: cod,
          descripcion: (comp.descripcion || '').trim(),
          unidad: (comp.unidad || 'UND').trim(),
          categoria: normalizarCategoria(cod, comp.categoria),
          totalConsumos: 0,
          cantidadConsumida: 0,
          totalMontoConsumosUSD: 0,
          costoSum: 0,
          costoCount: 0,
          compras: []
        });
      }

      mapaArticulos.get(cod)!.compras.push(comp);
    }

    // C. Calcular Triangulación y Estado
    const resultado: ArticuloPrecioAuditoria[] = [];

    mapaArticulos.forEach((art, cod) => {
      // Ordenar compras por fecha descendente
      const historial = [...art.compras].sort((a, b) => {
        const fa = a.fechaOC || a.fechaSolicitud || '';
        const fb = b.fechaOC || b.fechaSolicitud || '';
        return fb.localeCompare(fa);
      });

      // Última compra válida (con precio > 0 o totalUSD / cantidad > 0)
      const ultimaValida = historial.find(c => getPrecioCompraUnitario(c).precio > 0);
      const infoUltima = ultimaValida ? getPrecioCompraUnitario(ultimaValida) : { precio: 0, esGlobal: false };
      const precioUltima = infoUltima.precio;
      const fechaUltima = ultimaValida ? (ultimaValida.fechaOC || ultimaValida.fechaSolicitud || '-') : '-';
      const ordenUltima = ultimaValida ? (ultimaValida.ordenCompra || ultimaValida.solicitudCompra || '-') : '-';
      const provUltima = ultimaValida ? (ultimaValida.proveedor || '-') : '-';
      const ctaAuxUltima = ultimaValida ? (ultimaValida.cuentaAuxiliar || '') : (historial[0]?.cuentaAuxiliar || '');
      const motivoUltima = ultimaValida ? (ultimaValida.motivo || '') : (historial[0]?.motivo || '');
      const solicitanteUltima = ultimaValida ? (ultimaValida.solicitante || '') : (historial[0]?.solicitante || '');
      const compradorUltima = ultimaValida ? (ultimaValida.comprador || '') : (historial[0]?.comprador || '');

      // Promedio ponderado de compras
      let sumProd = 0;
      let sumCant = 0;
      for (const c of historial) {
        const { precio: pu } = getPrecioCompraUnitario(c);
        if (pu > 0) {
          const cant = c.cantidadOC || c.cantidadRecepcionada || 1;
          sumProd += pu * cant;
          sumCant += cant;
        }
      }
      const precioPromedio = sumCant > 0 ? (sumProd / sumCant) : 0;

      // Costo del despacho reportado por SIP
      const costoDespachoProm = art.costoCount > 0 ? (art.costoSum / art.costoCount) : 0;

      // Determinar si es servicio o flete
      const esServicio = esServicioConcepto(cod, art.unidad, art.categoria);

      // Verificar si hay precio manual fijado
      const ajusteManual = preciosManuales[cod];
      const tieneManual = !!(ajusteManual && typeof ajusteManual.precio === 'number');

      // Determinar Precio Oficial, Fuente, Variación y Estado
      let precioOficial = costoDespachoProm;
      let fuente: ArticuloPrecioAuditoria['fuentePrecio'] = 'Sistema';
      let varPorc = 0;
      let estado: ArticuloPrecioAuditoria['estado'] = 'conforme';

      if (esServicio) {
        // SERVICIOS Y FLETES:
        // No pasan por estantes ni tienen costo de reposición fijo. Cada OC responde a un alcance, proveedor y obra específico.
        // Si hay una OC con precio/monto, ese es el valor oficial de referencia y se clasifica como conforme según OC.
        if (tieneManual) {
          precioOficial = ajusteManual.precio;
          fuente = 'Manual';
          estado = 'ajustado';
        } else if (precioUltima > 0) {
          precioOficial = precioUltima;
          fuente = 'Ultima Compra';
          estado = 'conforme';
        } else if (costoDespachoProm > 0) {
          precioOficial = costoDespachoProm;
          fuente = 'Sistema';
          estado = 'conforme';
        } else {
          precioOficial = 0;
          fuente = 'Critico';
          estado = 'critico';
        }
        varPorc = 0;
      } else {
        // MATERIALES DE ALMACÉN FÍSICO:
        if (tieneManual) {
          precioOficial = ajusteManual.precio;
          fuente = 'Manual';
          estado = 'ajustado';
        } else if (costoDespachoProm === 0 && precioUltima > 0) {
          precioOficial = precioUltima;
          fuente = 'Ultima Compra';
          estado = art.totalConsumos === 0 ? 'conforme' : 'desfase';
        } else if (precioUltima > 0 && Math.abs(costoDespachoProm - precioUltima) / precioUltima > 0.05) {
          precioOficial = precioUltima;
          fuente = 'Ultima Compra';
          estado = 'desfase';
        } else if (costoDespachoProm > 0) {
          precioOficial = costoDespachoProm;
          fuente = 'Sistema';
          estado = 'conforme';
        } else if (precioPromedio > 0) {
          precioOficial = precioPromedio;
          fuente = 'Precio Promedio';
          estado = 'conforme';
        } else {
          precioOficial = 0;
          fuente = 'Critico';
          estado = 'critico';
        }

        if (precioUltima > 0 && costoDespachoProm > 0) {
          varPorc = Math.round(((costoDespachoProm - precioUltima) / precioUltima) * 1000) / 10;
        }

        if (!tieneManual && costoDespachoProm > 0 && precioUltima > 0 && Math.abs(varPorc) > 5) {
          estado = 'desfase';
        }
      }

      resultado.push({
        codigo: cod,
        descripcion: art.descripcion,
        unidad: art.unidad,
        categoria: art.categoria,
        esServicio,
        precioGlobalContrato: infoUltima.esGlobal,
        totalConsumos: art.totalConsumos,
        cantidadConsumida: Math.round(art.cantidadConsumida * 100) / 100,
        totalMontoConsumosUSD: Math.round(art.totalMontoConsumosUSD * 100) / 100,
        costoPromedioDespacho: Math.round(costoDespachoProm * 100) / 100,
        ultimaCompra: ultimaValida,
        precioUltimaCompra: Math.round(precioUltima * 100) / 100,
        fechaUltimaCompra: fechaUltima,
        ordenUltimaCompra: ordenUltima,
        proveedorUltimaCompra: provUltima,
        cuentaAuxiliarUltima: ctaAuxUltima,
        motivoUltima: motivoUltima,
        solicitanteUltima: solicitanteUltima,
        compradorUltima: compradorUltima,
        precioPromedioCompras: Math.round(precioPromedio * 100) / 100,
        totalComprasRegistradas: historial.length,
        comprasHistorial: historial,
        ultimoRegistroCompras: historial.length > 0 ? historial[0] : undefined,
        precioManual: tieneManual ? ajusteManual.precio : undefined,
        motivoAjuste: tieneManual ? ajusteManual.motivo : undefined,
        fechaAjuste: tieneManual ? ajusteManual.fecha : undefined,
        precioOficial: Math.round(precioOficial * 100) / 100,
        fuentePrecio: fuente,
        variacionPorcentaje: varPorc,
        estado
      });
    });

    return resultado;
  }, [compras, consumos, preciosManuales]);

  // Conteo de Materiales y Servicios
  const conteoMateriales = useMemo(() => catalogoArticulos.filter(a => !a.esServicio).length, [catalogoArticulos]);
  const conteoServicios = useMemo(() => catalogoArticulos.filter(a => a.esServicio).length, [catalogoArticulos]);

  // Artículos según el tipo de insumo seleccionado
  const articulosActivosPorTipo = useMemo(() => {
    if (tipoInsumo === 'materiales') return catalogoArticulos.filter(a => !a.esServicio);
    if (tipoInsumo === 'servicios') return catalogoArticulos.filter(a => a.esServicio);
    return catalogoArticulos;
  }, [catalogoArticulos, tipoInsumo]);

  // 4. Métricas / KPIs Globales según tipo de insumo activo
  const metricas = useMemo(() => {
    let criticos = 0;
    let desfasados = 0;
    let conformes = 0;
    let ajustados = 0;
    let impactoDesfaseUSD = 0;

    for (const a of articulosActivosPorTipo) {
      if (a.estado === 'critico') criticos++;
      else if (a.estado === 'desfase') {
        desfasados++;
        const diff = Math.abs(a.costoPromedioDespacho - a.precioOficial);
        impactoDesfaseUSD += diff * a.cantidadConsumida;
      } else if (a.estado === 'ajustado') ajustados++;
      else conformes++;
    }

    return {
      totalArticulos: articulosActivosPorTipo.length,
      criticos,
      desfasados,
      conformes,
      ajustados,
      impactoDesfaseUSD: Math.round(impactoDesfaseUSD * 100) / 100
    };
  }, [articulosActivosPorTipo]);

  // Categorías Únicas del subconjunto activo
  const categoriasDisponibles = useMemo(() => {
    const s = new Set<string>();
    articulosActivosPorTipo.forEach(a => {
      if (a.categoria) s.add(a.categoria);
    });
    return Array.from(s).sort();
  }, [articulosActivosPorTipo]);

  // 5. Filtros y Ordenamiento
  const articulosFiltrados = useMemo(() => {
    let list = [...articulosActivosPorTipo];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter(a => 
        a.codigo.toLowerCase().includes(q) ||
        a.descripcion.toLowerCase().includes(q) ||
        a.proveedorUltimaCompra.toLowerCase().includes(q) ||
        a.ordenUltimaCompra.toLowerCase().includes(q) ||
        (a.cuentaAuxiliarUltima && a.cuentaAuxiliarUltima.toLowerCase().includes(q)) ||
        (a.motivoUltima && a.motivoUltima.toLowerCase().includes(q))
      );
    }

    if (filtroEstado !== 'todos') {
      list = list.filter(a => a.estado === filtroEstado);
    }

    if (filtroCategoria !== 'TODAS') {
      list = list.filter(a => a.categoria === filtroCategoria);
    }

    list.sort((a, b) => {
      let valA = 0;
      let valB = 0;

      switch (sortBy) {
        case 'impacto':
          valA = Math.abs(a.costoPromedioDespacho - a.precioOficial) * a.cantidadConsumida;
          valB = Math.abs(b.costoPromedioDespacho - b.precioOficial) * b.cantidadConsumida;
          break;
        case 'desfase':
          valA = Math.abs(a.variacionPorcentaje);
          valB = Math.abs(b.variacionPorcentaje);
          break;
        case 'consumo':
          valA = a.totalMontoConsumosUSD;
          valB = b.totalMontoConsumosUSD;
          break;
        case 'precio':
          valA = a.precioOficial;
          valB = b.precioOficial;
          break;
        case 'reciente': {
          const fa = a.fechaUltimaCompra && a.fechaUltimaCompra !== '-' ? a.fechaUltimaCompra : '0000-00-00';
          const fb = b.fechaUltimaCompra && b.fechaUltimaCompra !== '-' ? b.fechaUltimaCompra : '0000-00-00';
          return sortOrder === 'asc' ? fa.localeCompare(fb) : fb.localeCompare(fa);
        }
        case 'codigo':
        default:
          return sortOrder === 'asc'
            ? a.codigo.localeCompare(b.codigo)
            : b.codigo.localeCompare(a.codigo);
      }

      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });

    return list;
  }, [catalogoArticulos, searchTerm, filtroEstado, filtroCategoria, sortBy, sortOrder]);

  // Paginación
  const totalPages = Math.ceil(articulosFiltrados.length / itemsPerPage) || 1;
  const articulosPaginados = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return articulosFiltrados.slice(start, start + itemsPerPage);
  }, [articulosFiltrados, currentPage]);

  // 6. Acciones: Fijar Precio Manual
  const guardarPrecioManual = (codigo: string, precio: number, motivo: string = 'Ajuste manual de costos') => {
    setGuardandoAjuste(true);
    const updated = {
      ...preciosManuales,
      [codigo]: {
        precio: Math.round(precio * 100) / 100,
        motivo,
        fecha: new Date().toLocaleDateString('es-VE')
      }
    };
    setPreciosManuales(updated);
    localStorage.setItem('timaca_precios_manuales_v1', JSON.stringify(updated));

    try {
      fetch('http://192.168.13.193:3005/api/precios-manuales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigo,
          precioManual: precio,
          motivo,
          usuario: currentUser?.nombre || 'Alejandra Tesara'
        })
      }).catch(() => {});
    } catch (e) {}

    setEditandoCodigo(null);
    setValorEdicion('');
    setMotivoEdicion('');
    setGuardandoAjuste(false);
    showFlash(`Precio oficial fijado para ${codigo}: $${precio.toFixed(2)} USD`);
  };

  const revertirPrecioManual = (codigo: string) => {
    const updated = { ...preciosManuales };
    delete updated[codigo];
    setPreciosManuales(updated);
    localStorage.setItem('timaca_precios_manuales_v1', JSON.stringify(updated));

    try {
      fetch(`http://192.168.13.193:3005/api/precios-manuales/${encodeURIComponent(codigo)}`, {
        method: 'DELETE'
      }).catch(() => {});
    } catch (e) {}

    showFlash(`Ajuste manual revertido para ${codigo}. Retorna al cálculo SIP.`, 'info');
  };

  const adoptarUltimaCompra = (item: ArticuloPrecioAuditoria) => {
    if (item.precioUltimaCompra > 0) {
      guardarPrecioManual(item.codigo, item.precioUltimaCompra, `Adoptada última OC (${item.ordenUltimaCompra}) del proveedor ${item.proveedorUltimaCompra}`);
    }
  };

  // 7. Revalorización Masiva Automática
  const aplicarTodosDesfasados = () => {
    const itemsDesfase = articulosActivosPorTipo.filter(a => a.estado === 'desfase' && a.precioUltimaCompra > 0);
    if (itemsDesfase.length === 0) {
      showFlash('No hay artículos desfasados pendientes con órdenes de compra en la vista activa.', 'info');
      return;
    }

    const updated = { ...preciosManuales };
    let count = 0;
    for (const a of itemsDesfase) {
      updated[a.codigo] = {
        precio: a.precioUltimaCompra,
        motivo: `Corrección automática por última compra (${a.ordenUltimaCompra})`,
        fecha: new Date().toLocaleDateString('es-VE')
      };
      count++;
    }

    setPreciosManuales(updated);
    localStorage.setItem('timaca_precios_manuales_v1', JSON.stringify(updated));
    showFlash(`Se adoptó la última compra para ${count} artículos desfasados exitosamente.`);
  };

  // 8. Exportar a Excel
  const exportarExcel = () => {
    const exportRows = articulosFiltrados.map((a, idx) => ({
      'N°': idx + 1,
      'Código': a.codigo,
      'Tipo de Concepto': a.esServicio ? 'Servicio / Flete' : 'Material de Almacén',
      'Descripción': a.descripcion,
      'Categoría': a.categoria,
      'Unidad': a.unidad,
      'Cantidad Consumida': a.cantidadConsumida,
      'Costo Despacho SIP ($)': a.costoPromedioDespacho,
      'Última Compra SIP ($)': a.precioUltimaCompra,
      'Fecha Última Compra': a.fechaUltimaCompra,
      'Orden de Compra': a.ordenUltimaCompra,
      'Proveedor': a.proveedorUltimaCompra,
      'Precio Promedio SIP ($)': a.precioPromedioCompras,
      'Variación % vs Compra': `${a.variacionPorcentaje > 0 ? '+' : ''}${a.variacionPorcentaje}%`,
      'Precio Oficial Vigente ($)': a.precioOficial,
      'Fuente Aplicada': a.fuentePrecio,
      'Estado Auditoría': a.estado.toUpperCase(),
      'Total Consumo Valorado ($)': Math.round(a.precioOficial * a.cantidadConsumida * 100) / 100
    }));

    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    const tituloSheet = tipoInsumo === 'materiales' ? 'Materiales Almacén' : tipoInsumo === 'servicios' ? 'Servicios Obra' : 'Catálogo Completo';
    XLSX.utils.book_append_sheet(wb, ws, tituloSheet);
    XLSX.writeFile(wb, `TIMACA_Catalogo_${tipoInsumo}_${new Date().toISOString().split('T')[0]}.xlsx`);
    showFlash(`Catálogo de ${tipoInsumo} exportado exitosamente a Excel.`);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Toast Notification */}
      {notificacion && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl border text-xs font-semibold transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 ${
          notificacion.tipo === 'success' 
            ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
            : 'bg-blue-50 border-blue-300 text-blue-900'
        }`}>
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{notificacion.texto}</span>
        </div>
      )}

      {/* HEADER SUPERIOR LIMPIO */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-2xs sticky top-0 z-30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 shadow-2xs">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">Catálogo & Auditoría de Precios SIP</h1>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300 uppercase">
                  Auditoría en Vivo
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Triangulación de órdenes de compra vs salidas de almacén. Corrección de desfases y costos en cero sin archivos Excel.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={aplicarTodosDesfasados}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition-all shadow-xs active:scale-95 cursor-pointer"
              title="Aplica la última compra a todos los ítems con desfase"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Corregir Desfases con Última OC</span>
            </button>

            <button
              onClick={exportarExcel}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-2xs transition-all active:scale-95 cursor-pointer"
              title="Exportar a Excel (.xlsx)"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Exportar Excel</span>
            </button>

            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-2xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              title="Recargar datos del SIP"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-600 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Sincronizando...' : 'Refrescar SIP'}</span>
            </button>

            {onVolver && (
              <button
                onClick={onVolver}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-300 transition-all cursor-pointer"
              >
                Volver
              </button>
            )}
          </div>
        </div>

        {/* SELECTOR SEGMENTADO: MATERIALES vs SERVICIOS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-200">
          <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 shadow-2xs">
            <button
              onClick={() => { setTipoInsumo('materiales'); setCurrentPage(1); }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                tipoInsumo === 'materiales'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>📦 Materiales de Almacén</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                tipoInsumo === 'materiales' ? 'bg-blue-100 text-blue-800 font-bold' : 'bg-slate-200 text-slate-600'
              }`}>
                {conteoMateriales.toLocaleString()}
              </span>
            </button>

            <button
              onClick={() => { setTipoInsumo('servicios'); setCurrentPage(1); }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                tipoInsumo === 'servicios'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🚚 Servicios de Obra & Fletes (USE)</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                tipoInsumo === 'servicios' ? 'bg-amber-100 text-amber-800 font-bold' : 'bg-slate-200 text-slate-600'
              }`}>
                {conteoServicios.toLocaleString()}
              </span>
            </button>

            <button
              onClick={() => { setTipoInsumo('todos'); setCurrentPage(1); }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                tipoInsumo === 'todos'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🌐 Todos los Conceptos</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-slate-200 text-slate-600">
                {catalogoArticulos.length.toLocaleString()}
              </span>
            </button>
          </div>

          {tipoInsumo === 'servicios' ? (
            <div className="text-xs text-blue-900 bg-blue-50/90 px-3 py-2 rounded-xl border border-blue-200 flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-blue-600" />
              <span>
                <strong>Servicios & Fletes:</strong> Al ser contrataciones puntuales por proveedor y obra (sin inventario físico), su tarifa de costo proviene de la Orden de Compra/Contrato aprobada en SIP imputada a cada proyecto.
              </span>
            </div>
          ) : (
            <div className="text-xs text-slate-500 hidden md:block">
              {tipoInsumo === 'materiales' ? 'Mostrando ítems físicos con salidas de almacén (excluye servicios USE como en el Excel Maestro original)' : 'Visualizando todos los códigos del catálogo SIP'}
            </div>
          )}
        </div>

        {/* TARJETAS DE MÉTRICAS (KPIs EN TEMA CLARO) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-3 pt-3 border-t border-slate-100">
          {/* Total Artículos */}
          <div 
            onClick={() => setFiltroEstado('todos')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              filtroEstado === 'todos' 
                ? 'bg-blue-50/60 border-blue-500 shadow-xs ring-2 ring-blue-500/20' 
                : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold uppercase">
              <span>Artículos en Catálogo</span>
              <Layers className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
              {metricas.totalArticulos.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Base activa de materiales</div>
          </div>

          {/* Desfasados */}
          <div 
            onClick={() => setFiltroEstado('desfase')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              filtroEstado === 'desfase' 
                ? 'bg-amber-50/80 border-amber-500 shadow-xs ring-2 ring-amber-500/20' 
                : 'bg-white border-slate-200 hover:border-amber-300 hover:bg-amber-50/30 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between text-amber-800 text-[11px] font-semibold uppercase">
              <span>Desfase &gt; 5%</span>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold font-mono text-amber-700 mt-1">
              {metricas.desfasados.toLocaleString()}
            </div>
            <div className="text-[11px] text-amber-700/80 mt-0.5">Diferencia vs última OC</div>
          </div>

          {/* Costo Cero / Críticos */}
          <div 
            onClick={() => setFiltroEstado('critico')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              filtroEstado === 'critico' 
                ? 'bg-rose-50/80 border-rose-500 shadow-xs ring-2 ring-rose-500/20' 
                : 'bg-white border-slate-200 hover:border-rose-300 hover:bg-rose-50/30 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between text-rose-800 text-[11px] font-semibold uppercase">
              <span>Costo $0 / Sin Compra</span>
              <AlertCircle className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-2xl font-bold font-mono text-rose-700 mt-1">
              {metricas.criticos.toLocaleString()}
            </div>
            <div className="text-[11px] text-rose-700/80 mt-0.5">Requieren asignación de precio</div>
          </div>

          {/* Conformes */}
          <div 
            onClick={() => setFiltroEstado('conforme')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              filtroEstado === 'conforme' 
                ? 'bg-emerald-50/80 border-emerald-500 shadow-xs ring-2 ring-emerald-500/20' 
                : 'bg-white border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between text-emerald-800 text-[11px] font-semibold uppercase">
              <span>Precios Conformes</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">
              {metricas.conformes.toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-700/80 mt-0.5">Variación dentro de ±5%</div>
          </div>

          {/* Ajustes Manuales */}
          <div 
            onClick={() => setFiltroEstado('ajustado')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              filtroEstado === 'ajustado' 
                ? 'bg-cyan-50/80 border-cyan-500 shadow-xs ring-2 ring-cyan-500/20' 
                : 'bg-white border-slate-200 hover:border-cyan-300 hover:bg-cyan-50/30 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between text-cyan-800 text-[11px] font-semibold uppercase">
              <span>Ajustes Manuales</span>
              <ShieldCheck className="w-4 h-4 text-cyan-600" />
            </div>
            <div className="text-2xl font-bold font-mono text-cyan-700 mt-1">
              {metricas.ajustados.toLocaleString()}
            </div>
            <div className="text-[11px] text-cyan-700/80 mt-0.5">Precios fijados en pantalla</div>
          </div>
        </div>
      </div>

      {/* BARRA DE BÚSQUEDA Y CONTROLES */}
      <div className="px-6 py-3.5 bg-white border-b border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Input Buscador */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por código, descripción, proveedor, OC, cuenta/proyecto o motivo..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-amber-600 focus:ring-1 focus:ring-amber-500 transition-all font-mono shadow-2xs"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-800 text-xs font-bold"
            >
              ×
            </button>
          )}
        </div>

        {/* Filtros Dropdown */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Filtro Categoría */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs shadow-2xs">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={filtroCategoria}
              onChange={(e) => {
                setFiltroCategoria(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-slate-700 font-medium focus:outline-none cursor-pointer max-w-[160px] truncate"
            >
              <option value="TODAS">Todas las Familias</option>
              {categoriasDisponibles.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Ordenar por */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs shadow-2xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-slate-700 font-medium focus:outline-none cursor-pointer"
            >
              <option value="reciente">📅 Mes / Fecha Más Reciente (OC)</option>
              <option value="precio">💲 Mayor Tarifa / Precio ($)</option>
              <option value="impacto">💥 Mayor Impacto Desfase ($)</option>
              <option value="consumo">📦 Mayor Monto Consumido ($)</option>
              <option value="desfase">📊 Mayor % Desfase</option>
              <option value="codigo">🔤 Código (A - Z)</option>
            </select>
            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="ml-1 text-slate-500 hover:text-slate-900 font-mono font-bold cursor-pointer"
              title="Cambiar orden ascendente/descendente"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>

          <div className="text-xs text-slate-500 font-mono pl-2">
            Mostrando <span className="text-slate-900 font-bold">{articulosFiltrados.length.toLocaleString()}</span> de {catalogoArticulos.length.toLocaleString()} artículos
          </div>
        </div>
      </div>

      {/* TABLA PRINCIPAL DE PRECIOS */}
      <div className="flex-1 overflow-x-auto px-6 py-4">
        <div className="bg-white border border-slate-200 rounded-2xl overflow-x-auto shadow-xs">
          <table className="w-full min-w-[1280px] text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/90 text-slate-700 border-b border-slate-200 font-bold uppercase text-[11px] tracking-wider select-none">
                <th className="py-3 px-3 w-10 text-center">#</th>
                <th 
                  onClick={() => handleSort('codigo')}
                  className="py-3 px-3 w-28 cursor-pointer hover:bg-slate-200/80 transition-colors"
                  title="Ordenar por Código"
                >
                  <div className="flex items-center gap-1">
                    <span>Código</span>
                    {sortBy === 'codigo' && <span className="text-blue-600 font-bold">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                  </div>
                </th>
                <th className="py-3 px-4">Descripción & Familia</th>
                <th 
                  onClick={() => handleSort('consumo')}
                  className="py-3 px-3 text-right w-28 cursor-pointer hover:bg-slate-200/80 transition-colors"
                  title="Ordenar por mayor consumo ($)"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Consumo 2026</span>
                    {sortBy === 'consumo' && <span className="text-blue-600 font-bold">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                  </div>
                </th>
                <th className="py-3 px-3 text-right w-28">Costo Despacho (SIP)</th>
                <th 
                  onClick={() => handleSort('reciente')}
                  className="py-3 px-4 w-48 cursor-pointer hover:bg-slate-200/80 transition-colors"
                  title="Ordenar por Mes / Fecha de Compra"
                >
                  <div className="flex items-center gap-1">
                    <span>Última Compra (SIP)</span>
                    {sortBy === 'reciente' && <span className="text-blue-600 font-bold">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                  </div>
                </th>
                <th className="py-3 px-3 text-right w-24">Promedio OC</th>
                <th 
                  onClick={() => handleSort('desfase')}
                  className="py-3 px-3 text-center w-28 cursor-pointer hover:bg-slate-200/80 transition-colors"
                  title="Ordenar por % de Variación"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Variación %</span>
                    {sortBy === 'desfase' && <span className="text-blue-600 font-bold">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('precio')}
                  className="py-3 px-4 w-44 cursor-pointer hover:bg-slate-200/80 transition-colors"
                  title="Ordenar por Precio Oficial / Tarifa"
                >
                  <div className="flex items-center gap-1">
                    <span>Precio Oficial Vigente</span>
                    {sortBy === 'precio' && <span className="text-blue-600 font-bold">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                  </div>
                </th>
                <th className="py-3 px-4 text-center w-48">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center text-slate-500 font-mono">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-cyan-600" />
                    Cargando y triangulando precios del SIP...
                  </td>
                </tr>
              ) : articulosPaginados.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center text-slate-500">
                    No se encontraron artículos con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                articulosPaginados.map((item, idx) => {
                  const globalIdx = (currentPage - 1) * itemsPerPage + idx + 1;
                  const isEditing = editandoCodigo === item.codigo;
                  const isAjustado = item.estado === 'ajustado';
                  const isCritico = item.estado === 'critico';
                  const isDesfase = item.estado === 'desfase';

                  return (
                    <tr 
                      key={item.codigo} 
                      className={`hover:bg-slate-50 transition-colors ${
                        isCritico ? 'bg-rose-50/40' :
                        isDesfase ? 'bg-amber-50/40' :
                        isAjustado ? 'bg-cyan-50/30' : ''
                      }`}
                    >
                      {/* Índice */}
                      <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[11px]">
                        {globalIdx}
                      </td>

                      {/* Código */}
                      <td className="py-2.5 px-3 font-mono font-bold whitespace-nowrap">
                        <button
                          onClick={() => setArticuloSeleccionado(item)}
                          className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 hover:underline group cursor-pointer"
                          title="Ver historial de órdenes de compra"
                        >
                          <span>{item.codigo}</span>
                          <History className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
                        </button>
                      </td>

                      {/* Descripción */}
                      <td className="py-2.5 px-4 max-w-md">
                        <div className="font-semibold text-slate-900 truncate flex items-center gap-2" title={item.descripcion}>
                          <span className="truncate">{item.descripcion || 'Sin descripción'}</span>
                          {item.esServicio && (
                            <span className="shrink-0 px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold border border-amber-300 text-[9px] uppercase tracking-wider">
                              Servicio
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500">
                          <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-mono font-bold border border-slate-200">
                            {item.unidad}
                          </span>
                          <span className="truncate max-w-[200px]" title={item.categoria}>
                            {item.categoria}
                          </span>
                        </div>
                        {/* Imputación / Motivo visible */}
                        {(item.cuentaAuxiliarUltima || item.motivoUltima) && (
                          <div className="mt-1 flex items-start gap-1.5 text-[11px] text-slate-600 bg-slate-50 p-1.5 rounded-lg border border-slate-200" title={`Cuenta Auxiliar / Proyecto: ${item.cuentaAuxiliarUltima || 'S/N'}\nMotivo: ${item.motivoUltima || 'Sin motivo'}`}>
                            {item.cuentaAuxiliarUltima && (
                              <span className="shrink-0 font-mono font-bold text-amber-900 bg-amber-100/90 px-1.5 py-0.2 rounded text-[10px] border border-amber-300">
                                {item.cuentaAuxiliarUltima}
                              </span>
                            )}
                            <span className="truncate italic text-slate-700">
                              {item.motivoUltima || 'Sin motivo registrado'}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Consumo */}
                      <td className="py-2.5 px-3 text-right font-mono whitespace-nowrap">
                        {item.esServicio && item.cantidadConsumida === 0 ? (
                          <div>
                            <span className="text-slate-400 font-sans text-[11px] italic" title="En SIP, los servicios no generan salidas de almacén físico. Su costo se registra contra la orden de compra.">
                              0 {item.unidad || 'USE'} (Sin despacho físico)
                            </span>
                            <div className="text-[10px] text-slate-400 font-sans">
                              Imputación directa OC
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="font-bold text-slate-900">
                              {item.cantidadConsumida.toLocaleString()} {item.unidad}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {item.totalConsumos} salidas (${item.totalMontoConsumosUSD.toLocaleString()})
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Costo Despacho SIP */}
                      <td className="py-2.5 px-3 text-right font-mono whitespace-nowrap">
                        {item.esServicio ? (
                          <div className="text-right">
                            <span className="text-slate-500 font-sans text-[11px] italic" title="Los servicios se imputan directamente a la obra por OC, no pasan por inventario de almacén">
                              Imputación directa
                            </span>
                            <div className="text-[10px] text-slate-400 font-sans">
                              (Sin almacén)
                            </div>
                          </div>
                        ) : item.totalConsumos === 0 ? (
                          <span className="text-slate-400 font-sans text-[11px] italic" title="No registra salidas de almacén en el período">
                            - (Sin salidas)
                          </span>
                        ) : (
                          <span className={`font-bold ${
                            item.costoPromedioDespacho === 0 
                              ? 'text-rose-700 bg-rose-100 px-2 py-0.5 rounded border border-rose-300' 
                              : 'text-slate-900'
                          }`}>
                            ${item.costoPromedioDespacho.toFixed(2)}
                          </span>
                        )}
                      </td>

                      {/* Última Compra SIP */}
                      <td className="py-2.5 px-4 whitespace-nowrap">
                        {item.precioUltimaCompra > 0 ? (
                          <div>
                            <div className="font-mono font-bold text-emerald-700 flex items-center gap-1.5 flex-wrap">
                              <span>${item.precioUltimaCompra.toFixed(2)}</span>
                              <span className="text-[10px] text-slate-500 font-normal">
                                ({item.fechaUltimaCompra})
                              </span>
                              {item.precioGlobalContrato && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 border border-blue-200 font-sans font-bold" title="Tarifa contractual calculada dividiendo monto total del contrato entre la cantidad">
                                  Contrato SIP
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500 truncate max-w-[200px]" title={`OC: ${item.ordenUltimaCompra} - ${item.proveedorUltimaCompra}`}>
                              <span className="text-blue-700 font-mono font-semibold">{item.ordenUltimaCompra}</span> · {item.proveedorUltimaCompra}
                            </div>
                            {item.cuentaAuxiliarUltima && (
                              <div className="text-[10px] text-amber-900 font-mono font-semibold mt-0.5">
                                Cta: {item.cuentaAuxiliarUltima}
                              </div>
                            )}
                          </div>
                        ) : item.ultimoRegistroCompras ? (
                          <div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              {item.ultimoRegistroCompras.solicitudCompra || 'Solicitud'} (Sin OC en SIP)
                            </span>
                            <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[180px]" title={item.ultimoRegistroCompras.motivo || ''}>
                              {item.ultimoRegistroCompras.solicitante ? `Sol: ${item.ultimoRegistroCompras.solicitante}` : 'Sin OC emitida'}
                            </div>
                            {item.cuentaAuxiliarUltima && (
                              <div className="text-[10px] text-amber-900 font-mono font-semibold mt-0.5">
                                Cta: {item.cuentaAuxiliarUltima}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 font-mono text-[11px] italic">Sin registro en compras</span>
                        )}
                      </td>

                      {/* Promedio Compras */}
                      <td className="py-2.5 px-3 text-right font-mono text-slate-700 whitespace-nowrap">
                        {item.precioPromedioCompras > 0 ? (
                          <span className="font-semibold">${item.precioPromedioCompras.toFixed(2)}</span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* Variación % */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        {item.esServicio ? (
                          item.precioUltimaCompra > 0 ? (
                            <div>
                              <span className="px-2 py-0.5 rounded text-[10px] font-sans font-bold bg-blue-50 text-blue-800 border border-blue-300" title="Tarifa contractual asignada según la OC y proveedor para este requerimiento">
                                Tarifa según OC
                              </span>
                              <div className="text-[9px] text-slate-400 font-sans mt-0.5">
                                Por requerimiento
                              </div>
                            </div>
                          ) : (
                            <div>
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-100 text-rose-800 border border-rose-300">
                                Costo $0
                              </span>
                              <div className="text-[9px] text-amber-700 font-sans mt-0.5">
                                Sin OC en SIP
                              </div>
                            </div>
                          )
                        ) : item.totalConsumos === 0 && item.precioUltimaCompra > 0 ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            Precio OC OK
                          </span>
                        ) : item.costoPromedioDespacho === 0 && item.precioUltimaCompra === 0 ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-100 text-rose-800 border border-rose-300">
                            Costo $0
                          </span>
                        ) : item.costoPromedioDespacho === 0 && item.precioUltimaCompra > 0 ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            Desfase $0 vs OC
                          </span>
                        ) : Math.abs(item.variacionPorcentaje) <= 5 ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            ±{Math.abs(item.variacionPorcentaje)}% OK
                          </span>
                        ) : (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                            item.variacionPorcentaje > 0 
                              ? 'bg-rose-100 text-rose-800 border-rose-300' 
                              : 'bg-amber-100 text-amber-900 border-amber-300'
                          }`}>
                            {item.variacionPorcentaje > 0 ? '+' : ''}{item.variacionPorcentaje}%
                          </span>
                        )}
                      </td>

                      {/* Precio Oficial Vigente */}
                      <td className="py-2.5 px-4 whitespace-nowrap">
                        {isEditing ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-500 font-mono font-bold">$</span>
                            <input
                              type="number"
                              step="0.01"
                              autoFocus
                              value={valorEdicion}
                              onChange={(e) => setValorEdicion(e.target.value)}
                              placeholder="0.00"
                              className="w-20 bg-white border border-amber-500 rounded px-1.5 py-0.5 text-xs text-slate-900 font-mono font-bold focus:outline-none ring-1 ring-amber-400"
                            />
                            <button
                              onClick={() => {
                                const p = parseFloat(valorEdicion);
                                if (!isNaN(p) && p >= 0) {
                                  guardarPrecioManual(item.codigo, p, motivoEdicion || 'Ajuste manual directo');
                                }
                              }}
                              className="p-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                              title="Guardar"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => {
                                setEditandoCodigo(null);
                                setValorEdicion('');
                              }}
                              className="p-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 cursor-pointer"
                              title="Cancelar"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <div className="font-mono font-bold text-sm text-slate-900 flex items-center gap-1.5">
                                <span>${item.precioOficial.toFixed(2)}</span>
                                {isAjustado && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-100 text-cyan-800 border border-cyan-300 font-sans font-bold uppercase">
                                    Manual
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono">
                                Fuente: {item.fuentePrecio}
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                setEditandoCodigo(item.codigo);
                                setValorEdicion(item.precioOficial.toString());
                                setMotivoEdicion(item.motivoAjuste || '');
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                              title="Editar precio oficial"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="py-2.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          {/* Botón Adoptar Última Compra */}
                          {item.precioUltimaCompra > 0 && item.precioOficial !== item.precioUltimaCompra && !isAjustado && (
                            <button
                              onClick={() => adoptarUltimaCompra(item)}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                              title="Fijar como precio oficial el de la última orden de compra registrada en SIP"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Usar Última OC</span>
                            </button>
                          )}

                          {/* Revertir / Deshacer si tiene ajuste manual */}
                          {isAjustado && (
                            <button
                              onClick={() => revertirPrecioManual(item.codigo)}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                              title="Deshacer ajuste manual y volver al cálculo original del SIP"
                            >
                              <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                              <span>Deshacer Ajuste</span>
                            </button>
                          )}

                          {/* Historial / Trazabilidad */}
                          <button
                            onClick={() => setArticuloSeleccionado(item)}
                            className="px-2 py-1 rounded-lg text-slate-600 hover:text-blue-700 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition-all cursor-pointer flex items-center gap-1 text-[11px] font-medium"
                            title="Ver trazabilidad de órdenes de compra, proyecto/cuenta y motivos"
                          >
                            <Eye className="w-3.5 h-3.5 text-blue-600" />
                            <span className="hidden xl:inline">Ver OCs</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* CONTROLES DE PAGINACIÓN */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between gap-4 mt-4 text-xs text-slate-600 px-2 select-none">
            <div>
              Página <span className="text-slate-900 font-bold">{currentPage}</span> de <span className="text-slate-900 font-bold">{totalPages}</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs cursor-pointer"
                title="Primera página"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs cursor-pointer"
                title="Página anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-3 font-mono font-bold text-slate-900">
                {currentPage}
              </span>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs cursor-pointer"
                title="Página siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs cursor-pointer"
                title="Última página"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: HISTORIAL DE ÓRDENES DE COMPRA (TRAZABILIDAD SIP EN TEMA CLARO) */}
      {articuloSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Header Modal */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/10 text-cyan-300">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-base text-cyan-300">{articuloSeleccionado.codigo}</span>
                    <span className="text-xs text-slate-300">· {articuloSeleccionado.unidad}</span>
                  </div>
                  <div className="text-xs text-slate-200 font-medium truncate max-w-lg">
                    {articuloSeleccionado.descripcion}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setArticuloSeleccionado(null)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Resumen Superior */}
            <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">
                  {articuloSeleccionado.esServicio ? 'Tipo de Concepto:' : 'Costo Despacho SIP:'}
                </span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {articuloSeleccionado.esServicio 
                    ? 'Servicio de Obra / USE' 
                    : `$${articuloSeleccionado.costoPromedioDespacho.toFixed(2)}`}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Última OC / Tarifa:</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-mono font-bold text-emerald-700 text-sm">
                    ${articuloSeleccionado.precioUltimaCompra.toFixed(2)}
                  </span>
                  {articuloSeleccionado.precioGlobalContrato && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 border border-blue-200 font-sans font-bold" title="Tarifa contractual calculada a partir del monto total de la OC">
                      Contrato SIP
                    </span>
                  )}
                </div>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Proyecto / Imputación:</span>
                <span className="font-mono font-bold text-amber-800 text-sm">
                  {articuloSeleccionado.cuentaAuxiliarUltima || 'S/N'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Precio Oficial Vigente:</span>
                <span className="font-mono font-bold text-amber-700 text-sm">
                  ${articuloSeleccionado.precioOficial.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Banner de Motivo / Justificación */}
            {articuloSeleccionado.motivoUltima && (
              <div className="px-6 py-2.5 bg-amber-50/70 border-b border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
                <FileText className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-bold text-[11px] text-amber-900 uppercase tracking-wider">
                    Motivo / Requerimiento en SIP ({articuloSeleccionado.ordenUltimaCompra}):
                  </div>
                  <div className="text-slate-800 text-xs mt-0.5 leading-relaxed font-sans">
                    {articuloSeleccionado.motivoUltima}
                  </div>
                  {(articuloSeleccionado.solicitanteUltima || articuloSeleccionado.proveedorUltimaCompra) && (
                    <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-3 flex-wrap">
                      {articuloSeleccionado.solicitanteUltima && (
                        <span>Solicitante: <strong className="text-slate-700">{articuloSeleccionado.solicitanteUltima}</strong></span>
                      )}
                      {articuloSeleccionado.proveedorUltimaCompra && (
                        <span>Proveedor: <strong className="text-slate-700">{articuloSeleccionado.proveedorUltimaCompra}</strong></span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Contenido: Tabla de Compras */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center justify-between">
                <span>Historial de Órdenes de Compra ({articuloSeleccionado.comprasHistorial.length})</span>
                {articuloSeleccionado.precioUltimaCompra > 0 && (
                  <button
                    onClick={() => {
                      adoptarUltimaCompra(articuloSeleccionado);
                      setArticuloSeleccionado(null);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Fijar Última Compra (${articuloSeleccionado.precioUltimaCompra.toFixed(2)})</span>
                  </button>
                )}
              </h3>

              {articuloSeleccionado.precioUltimaCompra === 0 && articuloSeleccionado.comprasHistorial.length > 0 && (
                <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Solicitudes de compra sin Orden de Compra (OC) valorada en SIP:</span>
                    <span className="text-[11px] text-amber-800">
                      Este código posee Solicitudes de Compra registradas, pero compras aún no ha cargado la Orden de Compra formal con precio en dólares en el SIP ($0.00). Si conoces la tarifa pactada o el monto del contrato, puedes asignarle su precio oficial con el botón ✏️ en la tabla.
                    </span>
                  </div>
                </div>
              )}

              {articuloSeleccionado.comprasHistorial.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs italic bg-white rounded-xl border border-slate-200">
                  No se encontraron órdenes de compra registradas en el SIP para este código.
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 text-[11px] font-bold uppercase border-b border-slate-200">
                        <th className="py-2.5 px-3">Fecha</th>
                        <th className="py-2.5 px-3">Nro. OC</th>
                        <th className="py-2.5 px-3">Proveedor</th>
                        <th className="py-2.5 px-3 text-right">Cantidad</th>
                        <th className="py-2.5 px-3 text-right">Precio Unit. ($)</th>
                        <th className="py-2.5 px-3 text-right">Total USD</th>
                        <th className="py-2.5 px-4">Motivo / Imputación</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono text-slate-800">
                      {articuloSeleccionado.comprasHistorial.map((c, i) => {
                        const { precio: pu, esGlobal } = getPrecioCompraUnitario(c);
                        return (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="py-2 px-3 text-slate-600">{c.fechaOC || c.fechaSolicitud || '-'}</td>
                            <td className="py-2 px-3 whitespace-nowrap">
                              {c.ordenCompra ? (
                                <span className="font-bold text-blue-700 font-mono">{c.ordenCompra}</span>
                              ) : (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                  {c.solicitudCompra || 'SC'} (Sin OC)
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-3 text-slate-800 font-sans truncate max-w-xs" title={c.proveedor}>
                              {c.proveedor || '-'}
                            </td>
                            <td className="py-2 px-3 text-right text-slate-700">
                              {(c.cantidadOC || c.cantidadRecepcionada || 1).toLocaleString()} {c.unidad || articuloSeleccionado.unidad}
                            </td>
                            <td className="py-2 px-3 text-right font-bold text-emerald-700">
                              ${pu.toFixed(2)}
                              {esGlobal && (
                                <span className="block text-[9px] text-blue-600 font-sans font-normal">
                                  (Contrato SIP)
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-3 text-right text-slate-900 font-semibold">
                              ${(c.totalUSD || 0).toLocaleString()}
                            </td>
                            <td className="py-2.5 px-4 text-xs font-sans max-w-sm">
                              {c.cuentaAuxiliar && (
                                <span className="inline-block bg-amber-100 text-amber-900 border border-amber-300 font-mono font-bold text-[10px] px-1.5 py-0.5 rounded mr-1.5 mb-1" title="Cuenta Auxiliar / Proyecto">
                                  {c.cuentaAuxiliar}
                                </span>
                              )}
                              <span className="text-slate-700 leading-snug">
                                {c.motivo || '-'}
                              </span>
                              {c.solicitante && (
                                <div className="text-[10px] text-slate-500 mt-0.5">
                                  Sol: <span className="font-medium text-slate-600">{c.solicitante}</span>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Footer Modal */}
            <div className="px-6 py-3 bg-white border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setArticuloSeleccionado(null)}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 cursor-pointer"
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
