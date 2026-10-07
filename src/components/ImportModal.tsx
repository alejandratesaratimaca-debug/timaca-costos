import React, { useState } from 'react';
import { useCostos } from '../context/CostosContext';
import { parseExcelFile, downloadTemplateExcel } from '../utils/excelHandler';
import { SalidaCosto } from '../types/costos';
import { formatCurrency, formatNumber } from '../utils/dateHelpers';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  FolderOpen, 
  Download, 
  RotateCcw,
  Layers,
  HelpCircle
} from 'lucide-react';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose }) => {
  const { importSalidas, resetToMockData, salidas } = useCostos();

  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{
    fileName: string;
    totalRows: number;
    totalAmount: number;
    parsedData: SalidaCosto[];
  } | null>(null);
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');

  if (!isOpen) return null;

  const handleFileProcess = async (file: File) => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessInfo(null);

    try {
      const result = await parseExcelFile(file);
      if (!result.success || result.data.length === 0) {
        setErrorMsg(result.errors.join(' ') || 'No se pudieron extraer datos válidos del archivo.');
      } else {
        const total = result.data.reduce((acc, c) => acc + c.montoTotal, 0);
        setSuccessInfo({
          fileName: file.name,
          totalRows: result.data.length,
          totalAmount: total,
          parsedData: result.data,
        });
      }
    } catch (err: any) {
      setErrorMsg(`Error al procesar el archivo: ${err.message || 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileProcess(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      handleFileProcess(file);
    }
  };

  const handleConfirmImport = () => {
    if (!successInfo) return;
    importSalidas(successInfo.parsedData, importMode === 'replace');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-neutral-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold text-neutral-900 tracking-tight">
                Importar y Actualizar Archivos de Costos TIMACA
              </h3>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Carga tus libros de Excel (.xlsx, .xls) o CSV de tu carpeta local
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 text-lg font-semibold p-1"
          >
            ✕
          </button>
        </div>

        {/* Local Folder Sync Guide */}
        <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-4 text-xs text-blue-900 space-y-2">
          <div className="flex items-center gap-2 font-bold text-blue-950">
            <FolderOpen className="w-4 h-4 text-blue-600" />
            <span>¿Cómo sincronizar con tu carpeta local?</span>
          </div>
          <p className="text-neutral-700 leading-relaxed">
            Tu carpeta actual está en:{' '}
            <code className="bg-white px-2 py-0.5 rounded border border-blue-200 text-blue-800 font-mono text-[11px] select-all">
              C:\Users\alejandratesara\Desktop\Alejandra T\Costos Alejandra\Modelo_Estrella_Costos_TIMACA
            </code>
          </p>
          <p className="text-neutral-600">
            Por seguridad del navegador web, simplemente arrastra los archivos Excel que guardes en esa carpeta a la zona de abajo, o pulsa en <strong>"Seleccionar Archivo"</strong>. La aplicación leerá automáticamente las fechas, semanas, meses, centros de costo y totales.
          </p>
        </div>

        {/* Drop Zone */}
        {!successInfo && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              isDragging
                ? 'border-blue-500 bg-blue-50/50'
                : 'border-neutral-300 hover:border-neutral-400 bg-neutral-50/50'
            }`}
          >
            <FileSpreadsheet className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
            <p className="text-sm font-bold text-neutral-800 mb-1">
              Arrastra aquí tus archivos Excel o CSV
            </p>
            <p className="text-xs text-neutral-500 mb-4">
              Soporta formatos .xlsx, .xls, .csv de Modelo Estrella
            </p>

            <label className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-lg cursor-pointer hover:bg-neutral-800 transition-colors shadow-xs">
              <FolderOpen className="w-4 h-4" />
              <span>Seleccionar Archivo desde la Carpeta</span>
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileInput}
                className="hidden"
              />
            </label>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="py-8 text-center space-y-2">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-medium text-neutral-600">
              Analizando hojas de cálculo y calculando semanas y meses...
            </p>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Preview */}
        {successInfo && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Archivo procesado con éxito: {successInfo.fileName}</span>
              </div>
              <button
                onClick={() => setSuccessInfo(null)}
                className="text-xs text-neutral-500 hover:text-neutral-700 underline"
              >
                Cambiar archivo
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs pt-2 border-t border-emerald-200/60">
              <div>
                <span className="text-emerald-700 block">Salidas detectadas:</span>
                <span className="text-base font-bold font-mono tabular-nums text-emerald-950">
                  {formatNumber(successInfo.totalRows)} registros
                </span>
              </div>
              <div>
                <span className="text-emerald-700 block">Monto total detectado:</span>
                <span className="text-base font-bold font-mono tabular-nums text-emerald-950">
                  {formatCurrency(successInfo.totalAmount)}
                </span>
              </div>
            </div>

            {/* Mode selector */}
            <div className="pt-2 border-t border-emerald-200/60 space-y-2">
              <span className="text-xs font-bold text-neutral-800 block">
                ¿Cómo deseas aplicar esta actualización?
              </span>
              <div className="grid grid-cols-2 gap-2">
                <label className={`p-3 rounded-lg border text-xs cursor-pointer flex items-center gap-2 ${
                  importMode === 'replace'
                    ? 'border-blue-600 bg-white ring-2 ring-blue-500/20'
                    : 'border-neutral-200 bg-white/50'
                }`}>
                  <input
                    type="radio"
                    name="importMode"
                    value="replace"
                    checked={importMode === 'replace'}
                    onChange={() => setImportMode('replace')}
                    className="text-blue-600"
                  />
                  <div>
                    <span className="font-bold text-neutral-900 block">Reemplazar Todo</span>
                    <span className="text-[10px] text-neutral-500">Actualiza toda la base con el archivo nuevo</span>
                  </div>
                </label>

                <label className={`p-3 rounded-lg border text-xs cursor-pointer flex items-center gap-2 ${
                  importMode === 'append'
                    ? 'border-blue-600 bg-white ring-2 ring-blue-500/20'
                    : 'border-neutral-200 bg-white/50'
                }`}>
                  <input
                    type="radio"
                    name="importMode"
                    value="append"
                    checked={importMode === 'append'}
                    onChange={() => setImportMode('append')}
                    className="text-blue-600"
                  />
                  <div>
                    <span className="font-bold text-neutral-900 block">Agregar al Final</span>
                    <span className="text-[10px] text-neutral-500">Conserva las salidas actuales y suma las nuevas</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Template and Tools Section */}
        <div className="pt-3 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={downloadTemplateExcel}
              className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-semibold"
            >
              <Download className="w-4 h-4" />
              <span>Descargar Plantilla Excel Modelo Estrella</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (window.confirm('¿Deseas restaurar el conjunto de datos de prueba de TIMACA?')) {
                  resetToMockData();
                  onClose();
                }
              }}
              className="flex items-center gap-1 text-neutral-500 hover:text-neutral-800"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar Datos de Prueba TIMACA</span>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
          >
            Cerrar
          </button>
          {successInfo && (
            <button
              onClick={handleConfirmImport}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
            >
              Confirmar y Cargar {formatNumber(successInfo.totalRows)} Salidas
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
