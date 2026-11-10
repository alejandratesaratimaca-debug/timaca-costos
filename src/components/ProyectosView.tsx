import React, { useState, useMemo, useEffect } from 'react';
import { 
  getSipPeriodoData, 
  getSipEvolutivoMensual, 
  getAuditCincoRubrosPeriodoData, 
  getAuditCincoRubrosEvolutivo, 
  getMacroCategoriaSip, 
  invalidateSipCache, 
  SipCuentaSummary, 
  SipItem, 
  SipPeriodoData, 
  MesEvolutivoData 
} from '../services/sipDataService';
import * as XLSX from 'xlsx';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { safeFormatUSD } from '../utils/numericHelpers';

// Subcomponents
import { ProyectosHeader } from './proyectos/ProyectosHeader';
import { ProyectosKpiGrid } from './proyectos/ProyectosKpiGrid';
import { ProyectosEvolutivoChart } from './proyectos/ProyectosEvolutivoChart';
import { ProyectosCategoriasBreakdown } from './proyectos/ProyectosCategoriasBreakdown';
import { ProyectosDataTable } from './proyectos/ProyectosDataTable';
import { ProyectosItemModal } from './proyectos/ProyectosItemModal';
import { ProyectosSkeleton } from './proyectos/ProyectosSkeleton';
import { EvolutivoSummary, MacroCategoryBreakdown } from './proyectos/proyectosTypes';

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
  // Período activo (por defecto Octubre 2026, corte oficial)
  const [selectedMesNum, setSelectedMesNum] = useState<number>(initialMesNum !== undefined ? initialMesNum : 10);
  
  // Cuenta seleccionada (por defecto TTE-C-0671)
  const [selectedCuentaCodigo, setSelectedCuentaCodigo] = useState<string>(initialCuentaCodigo || 'TTE-C-0671');
  
  // Filtro por categoría dentro del proyecto ('todas' o específica)
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>(initialCategoria || 'todas');
  
  // Modal de auditoría de ítem individual
  const [selectedItemModal, setSelectedItemModal] = useState<SipItem | null>(null);

  // Estados de datos y control de red
  const [sipData, setSipData] = useState<SipPeriodoData | null>(null);
  const [evolutivoData, setEvolutivoData] = useState<EvolutivoSummary | null>(null);
  const [isLoadingSip, setIsLoadingSip] = useState<boolean>(true);
  const [isLoadingEvolutivo, setIsLoadingEvolutivo] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorSip, setErrorSip] = useState<string | null>(null);
  const [refreshSuccess, setRefreshSuccess] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  // Modo de visualización: 5 Rubros Auditados ($12.05M) vs Compras y Consumos SIP ($4.95M)
  const [dataMode, setDataMode] = useState<'cinco_rubros' | 'sip_compras'>('cinco_rubros');

  // Sincronizar cuenta inicial si cambia por navegación externa
  useEffect(() => {
    if (initialCuentaCodigo) {
      setSelectedCuentaCodigo(initialCuentaCodigo);
    }
  }, [initialCuentaCodigo]);

  // Cargar datos del período seleccionado con revalidación y captura de errores
  useEffect(() => {
    let isMounted = true;
    setIsLoadingSip(true);
    setErrorSip(null);
    const fetcher = dataMode === 'cinco_rubros'
      ? getAuditCincoRubrosPeriodoData(selectedMesNum)
      : getSipPeriodoData(selectedMesNum);

    fetcher
      .then(data => {
        if (isMounted) {
          setSipData(data);
          setIsLoadingSip(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          setErrorSip(err?.message || 'Error al conectar con la base de datos SIP');
          setIsLoadingSip(false);
        }
      });
    return () => { isMounted = false; };
  }, [selectedMesNum, dataMode]);

  // Cargar evolución mensual histórica de la cuenta seleccionada
  useEffect(() => {
    let isMounted = true;
    setIsLoadingEvolutivo(true);
    const fetcher = dataMode === 'cinco_rubros'
      ? getAuditCincoRubrosEvolutivo(selectedCuentaCodigo)
      : getSipEvolutivoMensual(selectedCuentaCodigo);

    fetcher
      .then(data => {
        if (isMounted) {
          setEvolutivoData(data as EvolutivoSummary);
          setIsLoadingEvolutivo(false);
        }
      })
      .catch(() => {
        if (isMounted) setIsLoadingEvolutivo(false);
      });
    return () => { isMounted = false; };
  }, [selectedCuentaCodigo, dataMode]);

  // Revalidación bajo demanda sin caché (Cache Busting Directo)
  const handleForceRefresh = async () => {
    setIsRefreshing(true);
    setErrorSip(null);
    invalidateSipCache();
    try {
      const data = dataMode === 'cinco_rubros'
        ? await getAuditCincoRubrosPeriodoData(selectedMesNum, true)
        : await getSipPeriodoData(selectedMesNum, true);
      setSipData(data);

      const evol = dataMode === 'cinco_rubros'
        ? await getAuditCincoRubrosEvolutivo(selectedCuentaCodigo)
        : await getSipEvolutivoMensual(selectedCuentaCodigo, true);
      setEvolutivoData(evol as EvolutivoSummary);

      setRefreshSuccess(true);
      setTimeout(() => setRefreshSuccess(false), 3000);
    } catch (err: any) {
      setErrorSip(err?.message || 'Error al revalidar datos desde el SIP');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Lista de cuentas para el selector unificado
  const cuentasRanking = useMemo(() => {
    if (!sipData) return [];
    const list = sipData.cuentas || [];
    return sipData.consolidado ? [sipData.consolidado, ...list] : list;
  }, [sipData]);

  // Cuenta activa actualmente visualizada
  const activeCuenta = useMemo(() => {
    if (cuentasRanking.length === 0) return null;
    const found = cuentasRanking.find(c => c?.codigo === selectedCuentaCodigo);
    return found || cuentasRanking[0] || null;
  }, [cuentasRanking, selectedCuentaCodigo]);

  // Sincronizar cuenta activa si cambia el ranking o período para evitar estados huérfanos
  useEffect(() => {
    if (cuentasRanking.length > 0 && !cuentasRanking.some(c => c?.codigo === selectedCuentaCodigo)) {
      setSelectedCuentaCodigo(cuentasRanking[0]?.codigo || 'TTE-C-0671');
      setSelectedCategoryFilter('todas');
    }
  }, [cuentasRanking, selectedCuentaCodigo]);

  // Categorías de gasto calculadas directamente de las líneas SIP
  const categoriasDesglose: MacroCategoryBreakdown[] = useMemo(() => {
    if (!activeCuenta) return [];
    const totalCuenta = activeCuenta.totalMonto > 0 ? activeCuenta.totalMonto : 1;
    const cats = ['Materiales Directos', 'Servicios', 'Mano de Obra Directa', 'Horas Maquina', 'Costos Indirectos'];
    const porCat = activeCuenta.porCategoria || {};
    const itemsList = activeCuenta.items || [];
    return cats.map(categoria => {
      const tot = porCat[categoria] || 0;
      const salidasCat = itemsList.filter(it => getMacroCategoriaSip(it) === categoria);
      return {
        categoria,
        total: tot,
        count: salidasCat.length,
        porcentaje: Math.round((tot / totalCuenta) * 1000) / 10,
        items: salidasCat
      };
    }).sort((a, b) => b.total - a.total);
  }, [activeCuenta]);

  // Líneas de movimientos para la auditoría profunda
  const lineasProfundas = useMemo(() => {
    if (!activeCuenta) return [];
    let list = activeCuenta.items || [];
    if (selectedCategoryFilter !== 'todas') {
      list = list.filter(it => getMacroCategoriaSip(it) === selectedCategoryFilter);
    }
    return list;
  }, [activeCuenta, selectedCategoryFilter]);

  // Exportar auditoría completa a Excel (.xlsx) desde las líneas SIP reales
  const handleExportProyectos = () => {
    if (!sipData || !activeCuenta) return;
    const wb = XLSX.utils.book_new();

    // Hoja 1: Ranking Cuentas Auxiliares
    const rankingData = cuentasRanking.map((c, idx) => ({
      'Ranking': idx + 1,
      'Cuenta Auxiliar': c.codigo,
      'Proyecto Corto': c.proyectoCorto,
      'Cliente': c.cliente,
      'Nombre Oficial': c.nombre,
      [`Total ${sipData.mesLabel} (USD)`]: c.totalMonto,
      '% Participación': `${c.porcentaje}%`,
      'Total Movimientos SIP': c.salidasCount
    }));
    const wsRanking = XLSX.utils.json_to_sheet(rankingData);
    XLSX.utils.book_append_sheet(wb, wsRanking, 'Ranking Cuentas');

    // Hoja 2: Categorías de la Cuenta Activa
    const catData = categoriasDesglose.map(cd => ({
      'Cuenta Auxiliar': activeCuenta.codigo,
      'Proyecto Corto': activeCuenta.proyectoCorto,
      'Categoría de Costo': cd.categoria,
      'Total Asignado (USD)': cd.total,
      '% en Proyecto': `${cd.porcentaje}%`,
      'N° Registros SIP': cd.count
    }));
    const wsCat = XLSX.utils.json_to_sheet(catData);
    XLSX.utils.book_append_sheet(wb, wsCat, `Categorias_${activeCuenta.codigo.replace(/[^a-zA-Z0-9]/g, '_')}`);

    // Hoja 3: Detalle Línea a Línea Real
    const detData = activeCuenta.items.map((it, idx) => ({
      'N°': idx + 1,
      'Comprobante / Salida': it.numero || `SIP-${it.id}`,
      'Fecha': it.fecha || '-',
      'Código Artículo': it.codigo || '-',
      'Descripción Material / Insumo': it.descripcion || '-',
      'Categoría Macro': getMacroCategoriaSip(it),
      'Cantidad': it.cantidad != null ? Number(it.cantidad) : 1,
      'Unidad': it.unidad || 'UND',
      'Precio Unitario (USD)': it.precio_final || (it.cantidad ? (it.total_usd / it.cantidad) : 0),
      'Total USD': it.total_usd,
      'Solicitante / Origen': it.solicitante || '-',
      'Almacén / Destino': it.almacen || '-',
      'Motivo': it.motivo || '-'
    }));
    const wsDet = XLSX.utils.json_to_sheet(detData);
    XLSX.utils.book_append_sheet(wb, wsDet, `Auditoria_Lineas_${activeCuenta.codigo.replace(/[^a-zA-Z0-9]/g, '_')}`);

    XLSX.writeFile(wb, `TIMACA_Auditoria_SIP_${activeCuenta.codigo}_${sipData.mesNombre}.xlsx`);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* 1. Encabezado Ejecutivo con Breadcrumb y Selector Pro */}
      <ProyectosHeader
        onVolver={onVolver}
        dataMode={dataMode}
        setDataMode={setDataMode}
        selectedMesNum={selectedMesNum}
        setSelectedMesNum={setSelectedMesNum}
        selectedCuentaCodigo={selectedCuentaCodigo}
        setSelectedCuentaCodigo={setSelectedCuentaCodigo}
        cuentasRanking={cuentasRanking}
        activeCuenta={activeCuenta}
        onRefresh={handleForceRefresh}
        isRefreshing={isRefreshing}
        onExportExcel={handleExportProyectos}
        mesLabel={sipData?.mesLabel}
      />

      {/* Alerta de Error de Red */}
      {errorSip && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-center justify-between font-medium">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorSip}</span>
          </div>
          <button
            onClick={handleForceRefresh}
            className="px-3 py-1.5 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-colors text-xs cursor-pointer"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Alerta de Sincronización Exitosa */}
      {refreshSuccess && (
        <div className="p-3.5 bg-blue-50 border border-blue-200 text-blue-800 text-xs rounded-2xl flex items-center gap-2 animate-fade-in font-medium">
          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            <strong>¡Datos Sincronizados!</strong> Se han revalidado los registros en vivo sin almacenamiento en caché.
          </span>
        </div>
      )}

      {/* Alerta de Descarga Exitosa */}
      {downloadSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2 animate-fade-in font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>¡Auditoría Descargada!</strong> Se ha generado el archivo Excel con las líneas reales de <strong>{activeCuenta?.codigo} ({activeCuenta?.proyectoCorto})</strong>.
          </span>
        </div>
      )}

      {/* Si está cargando datos del período, mostramos el Skeleton con cero CLS */}
      {isLoadingSip ? (
        <ProyectosSkeleton />
      ) : activeCuenta ? (
        <>
          {/* 2. Ribbon de 4 Métricas Clave Ejecutivas (KPIs con acento semántico) */}
          <ProyectosKpiGrid
            activeCuenta={activeCuenta}
            totalCorporativoPeriodo={sipData?.totalMonto || 0}
            mesLabel={sipData?.mesLabel}
          />

          {/* 3. Sección Analítica Balanceada (Grid 60/40) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Columna Izquierda (60%): Evolutivo Mensual */}
            <div className="lg:col-span-7">
              <ProyectosEvolutivoChart
                evolutivoData={evolutivoData}
                selectedMesNum={selectedMesNum}
                setSelectedMesNum={setSelectedMesNum}
                activeCuentaCodigo={activeCuenta.codigo}
                activeCuentaNombre={activeCuenta.proyectoCorto}
              />
            </div>

            {/* Columna Derecha (40%): Desglose por las 5 Macro-Categorías */}
            <div className="lg:col-span-5">
              <ProyectosCategoriasBreakdown
                categorias={categoriasDesglose}
                selectedCategoryFilter={selectedCategoryFilter}
                onSelectCategory={setSelectedCategoryFilter}
                totalProyecto={activeCuenta.totalMonto}
                totalLineas={activeCuenta.salidasCount}
                proyectoCorto={activeCuenta.proyectoCorto}
              />
            </div>
          </div>

          {/* 4. Data Grid de Auditoría Línea a Línea (Estilo Linear) */}
          <ProyectosDataTable
            items={lineasProfundas}
            selectedCategoryFilter={selectedCategoryFilter}
            onClearCategoryFilter={() => setSelectedCategoryFilter('todas')}
            onSelectItem={setSelectedItemModal}
            cuentaCodigo={activeCuenta.codigo}
            proyectoCorto={activeCuenta.proyectoCorto}
            onExportExcel={handleExportProyectos}
          />
        </>
      ) : (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <p className="text-sm font-bold text-slate-800">No se encontraron datos para la cuenta seleccionada</p>
          <p className="text-xs text-slate-500">Selecciona otro proyecto o cambia el período de análisis.</p>
        </div>
      )}

      {/* 5. Modal de Ficha Técnica / Auditoría Individual */}
      <ProyectosItemModal
        item={selectedItemModal}
        onClose={() => setSelectedItemModal(null)}
      />
    </div>
  );
};
