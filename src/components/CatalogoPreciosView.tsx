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
  Save,
  RotateCcw,
  ShoppingBag,
  ExternalLink,
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
  Check
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
  totalConsumos: number;
  cantidadConsumida: number;
  totalMontoConsumosUSD: number;
  costoPromedioDespacho: number; // Costo que reportó SIP en salidas
  ultimaCompra?: CompraItem;
  precioUltimaCompra: number;
  fechaUltimaCompra: string;
  ordenUltimaCompra: string;
  proveedorUltimaCompra: string;
  precioPromedioCompras: number;
  totalComprasRegistradas: number;
  comprasHistorial: CompraItem[];
  precioManual?: number;
  motivoAjuste?: string;
  fechaAjuste?: string;
  precioOficial: number; // Precio efectivo final
  fuentePrecio: 'Sistema' | 'Ultima Compra' | 'Precio Promedio' | 'Manual' | 'Critico';
  variacionPorcentaje: number; // vs ultima compra o promedio
  estado: 'conforme' | 'desfase' | 'critico' | 'ajustado';
}

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
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'critico' | 'desfase' | 'conforme' | 'ajustado'>('todos');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('TODAS');
  const [sortBy, setSortBy] = useState<'impacto' | 'desfase' | 'consumo' | 'codigo' | 'reciente'>('impacto');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
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
          categoria: (c.categoria || 'Materiales Directos').trim(),
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
      if (c.costoUnitario > 0) {
        art.costoSum += c.costoUnitario;
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
          categoria: (comp.categoria || 'Compras Directas').trim(),
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

      // Última compra válida (con precio > 0)
      const ultimaValida = historial.find(c => c.precioUnitario > 0);
      const precioUltima = ultimaValida ? ultimaValida.precioUnitario : 0;
      const fechaUltima = ultimaValida ? (ultimaValida.fechaOC || ultimaValida.fechaSolicitud || '-') : '-';
      const ordenUltima = ultimaValida ? (ultimaValida.ordenCompra || ultimaValida.solicitudCompra || '-') : '-';
      const provUltima = ultimaValida ? (ultimaValida.proveedor || '-') : '-';

      // Promedio ponderado de compras
      let sumProd = 0;
      let sumCant = 0;
      for (const c of historial) {
        if (c.precioUnitario > 0 && (c.cantidadOC || c.cantidadRecepcionada || 1) > 0) {
          const cant = c.cantidadOC || c.cantidadRecepcionada || 1;
          sumProd += c.precioUnitario * cant;
          sumCant += cant;
        }
      }
      const precioPromedio = sumCant > 0 ? (sumProd / sumCant) : 0;

      // Costo del despacho reportado por SIP
      const costoDespachoProm = art.costoCount > 0 ? (art.costoSum / art.costoCount) : 0;

      // Verificar si hay precio manual fijado
      const ajusteManual = preciosManuales[cod];
      const tieneManual = !!(ajusteManual && typeof ajusteManual.precio === 'number');

      // Determinar Precio Oficial y Fuente
      let precioOficial = costoDespachoProm;
      let fuente: ArticuloPrecioAuditoria['fuentePrecio'] = 'Sistema';

      if (tieneManual) {
        precioOficial = ajusteManual.precio;
        fuente = 'Manual';
      } else if (costoDespachoProm === 0 && precioUltima > 0) {
        precioOficial = precioUltima;
        fuente = 'Ultima Compra';
      } else if (precioUltima > 0 && Math.abs(costoDespachoProm - precioUltima) / precioUltima > 0.05) {
        precioOficial = precioUltima;
        fuente = 'Ultima Compra';
      } else if (costoDespachoProm > 0) {
        precioOficial = costoDespachoProm;
        fuente = 'Sistema';
      } else if (precioPromedio > 0) {
        precioOficial = precioPromedio;
        fuente = 'Precio Promedio';
      } else {
        precioOficial = 0;
        fuente = 'Critico';
      }

      // Calcular % de variación
      let varPorc = 0;
      if (precioUltima > 0 && costoDespachoProm > 0) {
        varPorc = Math.round(((costoDespachoProm - precioUltima) / precioUltima) * 1000) / 10;
      }

      // Clasificación de Estado
      let estado: ArticuloPrecioAuditoria['estado'] = 'conforme';
      if (tieneManual) {
        estado = 'ajustado';
      } else if (costoDespachoProm === 0 && precioUltima === 0) {
        estado = 'critico';
      } else if (costoDespachoProm === 0 && precioUltima > 0) {
        estado = 'desfase'; // Corregible por última compra
      } else if (Math.abs(varPorc) > 5) {
        estado = 'desfase';
      } else {
        estado = 'conforme';
      }

      resultado.push({
        codigo: cod,
        descripcion: art.descripcion,
        unidad: art.unidad,
        categoria: art.categoria,
        totalConsumos: art.totalConsumos,
        cantidadConsumida: Math.round(art.cantidadConsumida * 100) / 100,
        totalMontoConsumosUSD: Math.round(art.totalMontoConsumosUSD * 100) / 100,
        costoPromedioDespacho: Math.round(costoDespachoProm * 100) / 100,
        ultimaCompra: ultimaValida,
        precioUltimaCompra: Math.round(precioUltima * 100) / 100,
        fechaUltimaCompra: fechaUltima,
        ordenUltimaCompra: ordenUltima,
        proveedorUltimaCompra: provUltima,
        precioPromedioCompras: Math.round(precioPromedio * 100) / 100,
        totalComprasRegistradas: historial.length,
        comprasHistorial: historial,
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

  // 4. Métricas / KPIs Globales
  const metricas = useMemo(() => {
    let criticos = 0;
    let desfasados = 0;
    let conformes = 0;
    let ajustados = 0;
    let impactoDesfaseUSD = 0;

    for (const a of catalogoArticulos) {
      if (a.estado === 'critico') criticos++;
      else if (a.estado === 'desfase') {
        desfasados++;
        // Impacto monetario estimado = cantidad consumida * |costoDespacho - precioOficial|
        const diff = Math.abs(a.costoPromedioDespacho - a.precioOficial);
        impactoDesfaseUSD += diff * a.cantidadConsumida;
      } else if (a.estado === 'ajustado') ajustados++;
      else conformes++;
    }

    return {
      totalArticulos: catalogoArticulos.length,
      criticos,
      desfasados,
      conformes,
      ajustados,
      impactoDesfaseUSD: Math.round(impactoDesfaseUSD * 100) / 100
    };
  }, [catalogoArticulos]);

  // Categorías Únicas
  const categoriasDisponibles = useMemo(() => {
    const s = new Set<string>();
    catalogoArticulos.forEach(a => {
      if (a.categoria) s.add(a.categoria);
    });
    return Array.from(s).sort();
  }, [catalogoArticulos]);

  // 5. Filtros y Ordenamiento
  const articulosFiltrados = useMemo(() => {
    let list = [...catalogoArticulos];

    // Filtro de texto
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter(a => 
        a.codigo.toLowerCase().includes(q) ||
        a.descripcion.toLowerCase().includes(q) ||
        a.proveedorUltimaCompra.toLowerCase().includes(q) ||
        a.ordenUltimaCompra.toLowerCase().includes(q)
      );
    }

    // Filtro de Estado
    if (filtroEstado !== 'todos') {
      list = list.filter(a => a.estado === filtroEstado);
    }

    // Filtro de Categoría
    if (filtroCategoria !== 'TODAS') {
      list = list.filter(a => a.categoria === filtroCategoria);
    }

    // Ordenamiento
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
        case 'reciente':
          return sortOrder === 'asc' 
            ? a.fechaUltimaCompra.localeCompare(b.fechaUltimaCompra)
            : b.fechaUltimaCompra.localeCompare(a.fechaUltimaCompra);
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

    // Si el backend responde, guardar en servidor
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

  // 7. Revalorización Masiva Automática (Aplicar a todos los ítems desfasados)
  const aplicarTodosDesfasados = () => {
    const itemsDesfase = catalogoArticulos.filter(a => a.estado === 'desfase' && a.precioUltimaCompra > 0);
    if (itemsDesfase.length === 0) {
      showFlash('No hay artículos desfasados pendientes con órdenes de compra.', 'info');
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
    XLSX.utils.book_append_sheet(wb, ws, 'Catálogo de Precios SIP');
    XLSX.writeFile(wb, `TIMACA_Catalogo_Precios_SIP_${new Date().toISOString().split('T')[0]}.xlsx`);
    showFlash('Catálogo exportado exitosamente a Excel.');
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-900 text-slate-100">
      {/* Toast Notification */}
      {notificacion && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-2xl border text-sm font-semibold transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 ${
          notificacion.tipo === 'success' 
            ? 'bg-emerald-950/95 border-emerald-500 text-emerald-200' 
            : 'bg-blue-950/95 border-blue-500 text-blue-200'
        }`}>
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{notificacion.texto}</span>
        </div>
      )}

      {/* HEADER PRINCIPAL */}
      <div className="bg-[#112238] border-b border-slate-700/80 px-6 py-4 shadow-lg sticky top-0 z-30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-inner">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">Catálogo & Auditoría de Precios SIP</h1>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-600/60 uppercase">
                  Auditoría en Vivo
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Triangulación de órdenes de compra vs salidas de almacén. Control de desfases de precios y costos cero.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={aplicarTodosDesfasados}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white transition-all shadow-md active:scale-95"
              title="Aplica la última compra a todos los ítems con desfase"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Corregir Desfases con Última OC</span>
            </button>

            <button
              onClick={exportarExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 transition-all active:scale-95"
              title="Exportar a Excel (.xlsx)"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Exportar Excel</span>
            </button>

            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 transition-all active:scale-95 disabled:opacity-50"
              title="Recargar datos del SIP"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Sincronizando...' : 'Refrescar SIP'}</span>
            </button>

            {onVolver && (
              <button
                onClick={onVolver}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 transition-all"
              >
                Volver
              </button>
            )}
          </div>
        </div>

        {/* TARJETAS DE MÉTRICAS (KPIs) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-4 pt-3 border-t border-slate-700/60">
          {/* Total Artículos */}
          <div 
            onClick={() => setFiltroEstado('todos')}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              filtroEstado === 'todos' 
                ? 'bg-slate-800/90 border-blue-500 shadow-md shadow-blue-500/10' 
                : 'bg-slate-800/40 border-slate-700/80 hover:bg-slate-800/70'
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 text-[11px] font-medium">
              <span>Artículos en Catálogo</span>
              <Layers className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-xl font-bold font-mono text-white mt-1">
              {metricas.totalArticulos.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Base activa de materiales</div>
          </div>

          {/* Desfasados */}
          <div 
            onClick={() => setFiltroEstado('desfase')}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              filtroEstado === 'desfase' 
                ? 'bg-amber-950/40 border-amber-500 shadow-md shadow-amber-500/10' 
                : 'bg-slate-800/40 border-slate-700/80 hover:bg-slate-800/70'
            }`}
          >
            <div className="flex items-center justify-between text-amber-300 text-[11px] font-medium">
              <span>Desfase &gt; 5%</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl font-bold font-mono text-amber-400 mt-1">
              {metricas.desfasados.toLocaleString()}
            </div>
            <div className="text-[10px] text-amber-200/70 mt-0.5">Diferencia con última OC</div>
          </div>

          {/* Costo Cero / Críticos */}
          <div 
            onClick={() => setFiltroEstado('critico')}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              filtroEstado === 'critico' 
                ? 'bg-rose-950/40 border-rose-500 shadow-md shadow-rose-500/10' 
                : 'bg-slate-800/40 border-slate-700/80 hover:bg-slate-800/70'
            }`}
          >
            <div className="flex items-center justify-between text-rose-300 text-[11px] font-medium">
              <span>Costo $0 / Sin Compra</span>
              <AlertCircle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-xl font-bold font-mono text-rose-400 mt-1">
              {metricas.criticos.toLocaleString()}
            </div>
            <div className="text-[10px] text-rose-200/70 mt-0.5">Requieren asignación de precio</div>
          </div>

          {/* Conformes */}
          <div 
            onClick={() => setFiltroEstado('conforme')}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              filtroEstado === 'conforme' 
                ? 'bg-emerald-950/40 border-emerald-500 shadow-md shadow-emerald-500/10' 
                : 'bg-slate-800/40 border-slate-700/80 hover:bg-slate-800/70'
            }`}
          >
            <div className="flex items-center justify-between text-emerald-300 text-[11px] font-medium">
              <span>Precios Conformes</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
              {metricas.conformes.toLocaleString()}
            </div>
            <div className="text-[10px] text-emerald-200/70 mt-0.5">Variación dentro del ±5%</div>
          </div>

          {/* Ajustes Manuales */}
          <div 
            onClick={() => setFiltroEstado('ajustado')}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              filtroEstado === 'ajustado' 
                ? 'bg-blue-950/40 border-blue-500 shadow-md shadow-blue-500/10' 
                : 'bg-slate-800/40 border-slate-700/80 hover:bg-slate-800/70'
            }`}
          >
            <div className="flex items-center justify-between text-cyan-300 text-[11px] font-medium">
              <span>Ajustes Manuales</span>
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-xl font-bold font-mono text-cyan-400 mt-1">
              {metricas.ajustados.toLocaleString()}
            </div>
            <div className="text-[10px] text-cyan-200/70 mt-0.5">Fijados por el usuario</div>
          </div>
        </div>
      </div>

      {/* BARRA DE BÚSQUEDA Y CONTROLES */}
      <div className="px-6 py-4 bg-slate-900/90 border-b border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Input Buscador */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por código (ej. AC..., RP...), descripción, proveedor u OC..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-mono"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-bold"
            >
              ×
            </button>
          )}
        </div>

        {/* Filtros Dropdown */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Filtro Categoría */}
          <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filtroCategoria}
              onChange={(e) => {
                setFiltroCategoria(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer max-w-[150px] truncate"
            >
              <option value="TODAS" className="bg-slate-800">Todas las Familias</option>
              {categoriasDisponibles.map(c => (
                <option key={c} value={c} className="bg-slate-800">{c}</option>
              ))}
            </select>
          </div>

          {/* Ordenar por */}
          <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="impacto" className="bg-slate-800">Mayor Impacto Desfase</option>
              <option value="desfase" className="bg-slate-800">Mayor % Variación</option>
              <option value="consumo" className="bg-slate-800">Mayor Monto Consumido</option>
              <option value="reciente" className="bg-slate-800">Última Compra Más Reciente</option>
              <option value="codigo" className="bg-slate-800">Código A-Z</option>
            </select>
            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="ml-1 text-slate-400 hover:text-white font-mono font-bold"
              title="Cambiar orden ascendente/descendente"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>

          <div className="text-xs text-slate-400 font-mono pl-2">
            Mostrando <span className="text-white font-bold">{articulosFiltrados.length.toLocaleString()}</span> de {catalogoArticulos.length.toLocaleString()} artículos
          </div>
        </div>
      </div>

      {/* TABLA PRINCIPAL DE PRECIOS */}
      <div className="flex-1 overflow-x-auto px-6 py-4">
        <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl overflow-hidden shadow-2xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/90 text-slate-300 border-b border-slate-700 font-semibold uppercase text-[11px] tracking-wider select-none">
                <th className="py-3 px-3 w-10 text-center">#</th>
                <th className="py-3 px-3">Código</th>
                <th className="py-3 px-4">Descripción & Categoría</th>
                <th className="py-3 px-3 text-right">Consumo 2026</th>
                <th className="py-3 px-3 text-right">Costo Despacho (SIP)</th>
                <th className="py-3 px-4">Última Compra (SIP)</th>
                <th className="py-3 px-3 text-right">Promedio OC</th>
                <th className="py-3 px-3 text-center">Variación %</th>
                <th className="py-3 px-4">Precio Oficial Vigente</th>
                <th className="py-3 px-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 font-mono">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-cyan-400" />
                    Cargando y triangulando precios del SIP...
                  </td>
                </tr>
              ) : articulosPaginados.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
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
                      className={`hover:bg-slate-700/40 transition-colors ${
                        isCritico ? 'bg-rose-950/10' :
                        isDesfase ? 'bg-amber-950/10' :
                        isAjustado ? 'bg-cyan-950/10' : ''
                      }`}
                    >
                      {/* Índice */}
                      <td className="py-2.5 px-3 text-center text-slate-500 font-mono text-[11px]">
                        {globalIdx}
                      </td>

                      {/* Código */}
                      <td className="py-2.5 px-3 font-mono font-bold whitespace-nowrap">
                        <button
                          onClick={() => setArticuloSeleccionado(item)}
                          className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 hover:underline group"
                          title="Ver historial de órdenes de compra"
                        >
                          <span>{item.codigo}</span>
                          <History className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      </td>

                      {/* Descripción */}
                      <td className="py-2.5 px-4 max-w-sm">
                        <div className="font-medium text-slate-100 truncate" title={item.descripcion}>
                          {item.descripcion || 'Sin descripción'}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                          <span className="px-1.5 py-0.2 rounded bg-slate-700 text-slate-300 font-mono">
                            {item.unidad}
                          </span>
                          <span className="truncate max-w-[200px]" title={item.categoria}>
                            {item.categoria}
                          </span>
                        </div>
                      </td>

                      {/* Consumo */}
                      <td className="py-2.5 px-3 text-right font-mono whitespace-nowrap">
                        <div className="font-semibold text-slate-200">
                          {item.cantidadConsumida.toLocaleString()} {item.unidad}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {item.totalConsumos} salidas (${item.totalMontoConsumosUSD.toLocaleString()})
                        </div>
                      </td>

                      {/* Costo Despacho SIP */}
                      <td className="py-2.5 px-3 text-right font-mono whitespace-nowrap">
                        <span className={`font-bold ${
                          item.costoPromedioDespacho === 0 ? 'text-rose-400 bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-800/80' : 'text-slate-200'
                        }`}>
                          ${item.costoPromedioDespacho.toFixed(2)}
                        </span>
                      </td>

                      {/* Última Compra SIP */}
                      <td className="py-2.5 px-4 whitespace-nowrap">
                        {item.precioUltimaCompra > 0 ? (
                          <div>
                            <div className="font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                              <span>${item.precioUltimaCompra.toFixed(2)}</span>
                              <span className="text-[10px] text-slate-400 font-normal">
                                ({item.fechaUltimaCompra})
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 truncate max-w-[180px]" title={`OC: ${item.ordenUltimaCompra} - ${item.proveedorUltimaCompra}`}>
                              <span className="text-cyan-300 font-mono">{item.ordenUltimaCompra}</span> · {item.proveedorUltimaCompra}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-500 font-mono text-[11px] italic">Sin compras</span>
                        )}
                      </td>

                      {/* Promedio Compras */}
                      <td className="py-2.5 px-3 text-right font-mono text-slate-300 whitespace-nowrap">
                        {item.precioPromedioCompras > 0 ? (
                          <span>${item.precioPromedioCompras.toFixed(2)}</span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>

                      {/* Variación % */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        {item.costoPromedioDespacho === 0 && item.precioUltimaCompra === 0 ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800">
                            Costo $0
                          </span>
                        ) : item.costoPromedioDespacho === 0 && item.precioUltimaCompra > 0 ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800 animate-pulse">
                            Desfase $0 vs OC
                          </span>
                        ) : Math.abs(item.variacionPorcentaje) <= 5 ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                            ±{Math.abs(item.variacionPorcentaje)}% OK
                          </span>
                        ) : (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                            item.variacionPorcentaje > 0 
                              ? 'bg-rose-950 text-rose-300 border-rose-800' 
                              : 'bg-amber-950 text-amber-300 border-amber-800'
                          }`}>
                            {item.variacionPorcentaje > 0 ? '+' : ''}{item.variacionPorcentaje}%
                          </span>
                        )}
                      </td>

                      {/* Precio Oficial Vigente */}
                      <td className="py-2.5 px-4 whitespace-nowrap">
                        {isEditing ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400 font-mono">$</span>
                            <input
                              type="number"
                              step="0.01"
                              autoFocus
                              value={valorEdicion}
                              onChange={(e) => setValorEdicion(e.target.value)}
                              placeholder="0.00"
                              className="w-20 bg-slate-900 border border-amber-500 rounded px-1.5 py-0.5 text-xs text-white font-mono focus:outline-none"
                            />
                            <button
                              onClick={() => {
                                const p = parseFloat(valorEdicion);
                                if (!isNaN(p) && p >= 0) {
                                  guardarPrecioManual(item.codigo, p, motivoEdicion || 'Ajuste manual directo');
                                }
                              }}
                              className="p-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white"
                              title="Guardar"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => {
                                setEditandoCodigo(null);
                                setValorEdicion('');
                              }}
                              className="p-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-300"
                              title="Cancelar"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <div className="font-mono font-bold text-sm text-white flex items-center gap-1.5">
                                <span>${item.precioOficial.toFixed(2)}</span>
                                {isAjustado && (
                                  <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-900 text-cyan-200 border border-cyan-700 font-sans uppercase">
                                    Manual
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                Fuente: {item.fuentePrecio}
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                setEditandoCodigo(item.codigo);
                                setValorEdicion(item.precioOficial.toString());
                                setMotivoEdicion(item.motivoAjuste || '');
                              }}
                              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                              title="Editar precio oficial"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          {/* Botón Adoptar Última Compra */}
                          {item.precioUltimaCompra > 0 && item.costoPromedioDespacho !== item.precioUltimaCompra && (
                            <button
                              onClick={() => adoptarUltimaCompra(item)}
                              className="px-2 py-1 rounded text-[10px] font-bold bg-amber-600/80 hover:bg-amber-500 text-white transition-all shadow-xs flex items-center gap-1"
                              title="Fijar como precio oficial el de la última orden de compra"
                            >
                              <Sparkles className="w-2.5 h-2.5" />
                              <span>Usar Última OC</span>
                            </button>
                          )}

                          {/* Revertir si tiene ajuste manual */}
                          {isAjustado && (
                            <button
                              onClick={() => revertirPrecioManual(item.codigo)}
                              className="p-1 rounded text-rose-400 hover:text-rose-300 hover:bg-rose-950/60"
                              title="Eliminar ajuste manual y volver a SIP"
                            >
                              <RotateCcw className="w-3 h-3" />
                            </button>
                          )}

                          {/* Historial */}
                          <button
                            onClick={() => setArticuloSeleccionado(item)}
                            className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-700"
                            title="Ver historial de compras"
                          >
                            <History className="w-3.5 h-3.5" />
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
          <div className="flex items-center justify-between gap-4 mt-4 text-xs text-slate-400 px-2 select-none">
            <div>
              Página <span className="text-white font-bold">{currentPage}</span> de <span className="text-white font-bold">{totalPages}</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
                title="Primera página"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
                title="Página anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-3 font-mono font-bold text-white">
                {currentPage}
              </span>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
                title="Página siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
                title="Última página"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: HISTORIAL DE ÓRDENES DE COMPRA (TRAZABILIDAD SIP) */}
      {articuloSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Header Modal */}
            <div className="px-6 py-4 bg-[#112238] border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-base text-cyan-300">{articuloSeleccionado.codigo}</span>
                    <span className="text-xs text-slate-400">· {articuloSeleccionado.unidad}</span>
                  </div>
                  <div className="text-xs text-slate-200 font-medium truncate max-w-lg">
                    {articuloSeleccionado.descripcion}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setArticuloSeleccionado(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Resumen Superior */}
            <div className="px-6 py-3 bg-slate-800/50 border-b border-slate-700/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Costo Despacho SIP:</span>
                <span className="font-mono font-bold text-slate-100 text-sm">
                  ${articuloSeleccionado.costoPromedioDespacho.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Última Compra SIP:</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  ${articuloSeleccionado.precioUltimaCompra.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Promedio Compras:</span>
                <span className="font-mono font-bold text-slate-200 text-sm">
                  ${articuloSeleccionado.precioPromedioCompras.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Precio Oficial Vigente:</span>
                <span className="font-mono font-bold text-amber-300 text-sm">
                  ${articuloSeleccionado.precioOficial.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Contenido: Tabla de Compras */}
            <div className="flex-1 overflow-y-auto p-6">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center justify-between">
                <span>Historial de Órdenes de Compra ({articuloSeleccionado.comprasHistorial.length})</span>
                {articuloSeleccionado.precioUltimaCompra > 0 && (
                  <button
                    onClick={() => {
                      adoptarUltimaCompra(articuloSeleccionado);
                      setArticuloSeleccionado(null);
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Fijar Última Compra (${articuloSeleccionado.precioUltimaCompra.toFixed(2)})</span>
                  </button>
                )}
              </h3>

              {articuloSeleccionado.comprasHistorial.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs italic">
                  No se encontraron órdenes de compra registradas en el SIP para este código.
                </div>
              ) : (
                <div className="border border-slate-700 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-800 text-slate-400 text-[11px] uppercase border-b border-slate-700">
                        <th className="py-2.5 px-3">Fecha</th>
                        <th className="py-2.5 px-3">Nro. OC</th>
                        <th className="py-2.5 px-3">Proveedor</th>
                        <th className="py-2.5 px-3 text-right">Cantidad</th>
                        <th className="py-2.5 px-3 text-right">Precio Unit. ($)</th>
                        <th className="py-2.5 px-3 text-right">Total USD</th>
                        <th className="py-2.5 px-4">Motivo / Imputación</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 font-mono">
                      {articuloSeleccionado.comprasHistorial.map((c, i) => (
                        <tr key={i} className="hover:bg-slate-800/40">
                          <td className="py-2 px-3 text-slate-300">{c.fechaOC || c.fechaSolicitud || '-'}</td>
                          <td className="py-2 px-3 font-bold text-cyan-400">{c.ordenCompra || c.solicitudCompra || '-'}</td>
                          <td className="py-2 px-3 text-slate-200 font-sans truncate max-w-xs" title={c.proveedor}>
                            {c.proveedor || '-'}
                          </td>
                          <td className="py-2 px-3 text-right text-slate-300">
                            {(c.cantidadOC || c.cantidadRecepcionada || 1).toLocaleString()} {c.unidad || articuloSeleccionado.unidad}
                          </td>
                          <td className="py-2 px-3 text-right font-bold text-emerald-400">
                            ${(c.precioUnitario || 0).toFixed(2)}
                          </td>
                          <td className="py-2 px-3 text-right text-slate-200">
                            ${(c.totalUSD || 0).toLocaleString()}
                          </td>
                          <td className="py-2 px-4 text-[10px] text-slate-400 font-sans truncate max-w-xs" title={c.motivo}>
                            <span className="text-amber-300 font-mono font-bold mr-1">{c.cuentaAuxiliar}</span>
                            {c.motivo || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Footer Modal */}
            <div className="px-6 py-3 bg-slate-800/80 border-t border-slate-700 flex justify-end">
              <button
                onClick={() => setArticuloSeleccionado(null)}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-white"
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
