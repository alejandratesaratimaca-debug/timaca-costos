import React, { useState, useEffect } from 'react';
import { useCostos } from '../context/CostosContext';
import { SalidaCosto } from '../types/costos';
import { CATEGORIAS_DEFAULT, PROYECTOS_DEFAULT, CUENTAS_AUXILIARES_DEFAULT } from '../data/mockCostosTimaca';
import { parseFechaToDetails, formatCurrency } from '../utils/dateHelpers';
import { Plus, Check, X, Calendar, Briefcase, Layers } from 'lucide-react';

interface SalidaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  salidaToEdit?: SalidaCosto | null;
}

export const SalidaFormModal: React.FC<SalidaFormModalProps> = ({
  isOpen,
  onClose,
  salidaToEdit,
}) => {
  const { addSalida, updateSalida, salidas } = useCostos();

  const isEditing = !!salidaToEdit;

  const [fecha, setFecha] = useState<string>(new Date().toISOString().split('T')[0]);
  const [codigoSalida, setCodigoSalida] = useState<string>('');
  
  // Proyecto / OT
  const [proyecto, setProyecto] = useState<string>(PROYECTOS_DEFAULT[0]);
  const [customProyecto, setCustomProyecto] = useState<string>('');

  // Cuenta Auxiliar
  const [cuentaAuxiliarCodigo, setCuentaAuxiliarCodigo] = useState<string>(CUENTAS_AUXILIARES_DEFAULT[0].codigo);
  const [cuentaAuxiliarNombre, setCuentaAuxiliarNombre] = useState<string>(CUENTAS_AUXILIARES_DEFAULT[0].nombre);
  const [isCustomCuenta, setIsCustomCuenta] = useState(false);

  const [categoria, setCategoria] = useState<string>(CATEGORIAS_DEFAULT[0]);
  const [itemDescripcion, setItemDescripcion] = useState<string>('');
  const [proveedorODestino, setProveedorODestino] = useState<string>('');
  const [cantidad, setCantidad] = useState<number>(1);
  const [unidadMedida, setUnidadMedida] = useState<string>('und');
  const [montoUnitario, setMontoUnitario] = useState<number>(0);
  const [responsable, setResponsable] = useState<string>('Ing. Civil Alejandra Tesara');
  const [observaciones, setObservaciones] = useState<string>('');

  useEffect(() => {
    if (salidaToEdit) {
      setFecha(salidaToEdit.fecha);
      setCodigoSalida(salidaToEdit.codigoSalida);

      // Proyecto
      if (PROYECTOS_DEFAULT.includes(salidaToEdit.proyecto)) {
        setProyecto(salidaToEdit.proyecto);
        setCustomProyecto('');
      } else {
        setProyecto('OTRO');
        setCustomProyecto(salidaToEdit.proyecto);
      }

      // Cuenta auxiliar
      const foundCuenta = CUENTAS_AUXILIARES_DEFAULT.find(c => c.codigo === salidaToEdit.cuentaAuxiliarCodigo);
      if (foundCuenta) {
        setCuentaAuxiliarCodigo(foundCuenta.codigo);
        setCuentaAuxiliarNombre(foundCuenta.nombre);
        setIsCustomCuenta(false);
      } else {
        setCuentaAuxiliarCodigo(salidaToEdit.cuentaAuxiliarCodigo || 'CTA-OTRO');
        setCuentaAuxiliarNombre(salidaToEdit.cuentaAuxiliarNombre || 'Partida Auxiliar');
        setIsCustomCuenta(true);
      }

      setCategoria(salidaToEdit.categoria);
      setItemDescripcion(salidaToEdit.itemDescripcion);
      setProveedorODestino(salidaToEdit.proveedorODestino);
      setCantidad(salidaToEdit.cantidad);
      setUnidadMedida(salidaToEdit.unidadMedida);
      setMontoUnitario(salidaToEdit.montoUnitario);
      setResponsable(salidaToEdit.responsable);
      setObservaciones(salidaToEdit.observaciones || '');
    } else {
      const today = new Date().toISOString().split('T')[0];
      setFecha(today);
      const nextNum = (salidas.length + 1).toString().padStart(4, '0');
      setCodigoSalida(`SAL-${new Date().getFullYear()}-${nextNum}`);
      setProyecto(PROYECTOS_DEFAULT[0]);
      setCustomProyecto('');
      setCuentaAuxiliarCodigo(CUENTAS_AUXILIARES_DEFAULT[0].codigo);
      setCuentaAuxiliarNombre(CUENTAS_AUXILIARES_DEFAULT[0].nombre);
      setIsCustomCuenta(false);
      setCategoria(CATEGORIAS_DEFAULT[0]);
      setItemDescripcion('');
      setProveedorODestino('');
      setCantidad(1);
      setUnidadMedida('und');
      setMontoUnitario(0);
      setResponsable('Ing. Civil Alejandra Tesara');
      setObservaciones('');
    }
  }, [salidaToEdit, isOpen, salidas.length]);

  if (!isOpen) return null;

  const dateDetails = parseFechaToDetails(fecha);
  const montoTotalCalc = Math.round(cantidad * montoUnitario * 100) / 100;

  const handleCuentaSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'CUSTOM') {
      setIsCustomCuenta(true);
    } else {
      setIsCustomCuenta(false);
      const selected = CUENTAS_AUXILIARES_DEFAULT.find(c => c.codigo === val);
      if (selected) {
        setCuentaAuxiliarCodigo(selected.codigo);
        setCuentaAuxiliarNombre(selected.nombre);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalProyecto = proyecto === 'OTRO' ? (customProyecto.trim() || 'General TIMACA') : proyecto;

    if (isEditing && salidaToEdit) {
      updateSalida(salidaToEdit.id, {
        fecha,
        codigoSalida: codigoSalida.trim(),
        proyecto: finalProyecto,
        centroCosto: finalProyecto,
        cuentaAuxiliarCodigo: cuentaAuxiliarCodigo.trim(),
        cuentaAuxiliarNombre: cuentaAuxiliarNombre.trim(),
        categoria,
        itemDescripcion: itemDescripcion.trim(),
        proveedorODestino: proveedorODestino.trim(),
        cantidad: Number(cantidad) || 1,
        unidadMedida: unidadMedida.trim(),
        montoUnitario: Number(montoUnitario) || 0,
        montoTotal: montoTotalCalc,
        responsable: responsable.trim(),
        observaciones: observaciones.trim(),
      });
    } else {
      addSalida({
        codigoSalida: codigoSalida.trim() || `SAL-${Date.now().toString().slice(-4)}`,
        fecha,
        proyecto: finalProyecto,
        centroCosto: finalProyecto,
        cuentaAuxiliarCodigo: cuentaAuxiliarCodigo.trim() || 'CTA-101',
        cuentaAuxiliarNombre: cuentaAuxiliarNombre.trim() || 'Materiales Directos',
        categoria,
        itemDescripcion: itemDescripcion.trim() || 'Salida de material',
        proveedorODestino: proveedorODestino.trim() || 'Almacén Central',
        cantidad: Number(cantidad) || 1,
        unidadMedida: unidadMedida.trim() || 'und',
        montoUnitario: Number(montoUnitario) || 0,
        montoTotal: montoTotalCalc,
        moneda: 'USD',
        responsable: responsable.trim() || 'TIMACA Operaciones',
        estado: 'Procesado',
        observaciones: observaciones.trim(),
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-neutral-900 tracking-tight">
              {isEditing ? 'Editar Salida de Costo' : 'Registrar Nueva Salida de Costo'}
            </h3>
            <p className="text-xs text-neutral-500">
              Imputación directa a Proyecto, Cuenta Auxiliar, Semana y Mes
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Row 1: Fecha & Código */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-neutral-700 block mb-1">
                Fecha del Movimiento *
              </label>
              <input
                type="date"
                required
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full p-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-neutral-50/50"
              />
              <div className="mt-1 text-[11px] text-blue-700 flex items-center gap-1 font-medium">
                <Calendar className="w-3 h-3" />
                <span>Asignado a: <strong>{dateDetails.semanaLabel}</strong> ({dateDetails.mesLabel})</span>
              </div>
            </div>

            <div>
              <label className="font-semibold text-neutral-700 block mb-1">
                Código de Salida / N° Doc *
              </label>
              <input
                type="text"
                required
                value={codigoSalida}
                onChange={(e) => setCodigoSalida(e.target.value)}
                placeholder="SAL-2026-0001"
                className="w-full p-2 border border-neutral-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Row 2: Proyecto / OT */}
          <div>
            <label className="font-semibold text-neutral-700 block mb-1 flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 text-blue-600" />
              Proyecto / Orden de Trabajo (OT) *
            </label>
            <select
              value={proyecto}
              onChange={(e) => setProyecto(e.target.value)}
              className="w-full p-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium"
            >
              {PROYECTOS_DEFAULT.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
              <option value="OTRO">Otro Proyecto / OT personalizada...</option>
            </select>

            {proyecto === 'OTRO' && (
              <input
                type="text"
                required
                placeholder="Escribe el nombre del Proyecto u OT..."
                value={customProyecto}
                onChange={(e) => setCustomProyecto(e.target.value)}
                className="mt-2 w-full p-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>

          {/* Row 3: Cuenta Auxiliar */}
          <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 space-y-2">
            <label className="font-semibold text-neutral-800 block flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              Cuenta Auxiliar Contable *
            </label>
            <select
              value={isCustomCuenta ? 'CUSTOM' : cuentaAuxiliarCodigo}
              onChange={handleCuentaSelect}
              className="w-full p-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium bg-white"
            >
              {CUENTAS_AUXILIARES_DEFAULT.map((cta) => (
                <option key={cta.codigo} value={cta.codigo}>
                  {cta.codigo} — {cta.nombre}
                </option>
              ))}
              <option value="CUSTOM">Otra Cuenta Auxiliar manual...</option>
            </select>

            {isCustomCuenta && (
              <div className="grid grid-cols-3 gap-2 pt-1">
                <input
                  type="text"
                  required
                  placeholder="Código (ej. CTA-110)"
                  value={cuentaAuxiliarCodigo}
                  onChange={(e) => setCuentaAuxiliarCodigo(e.target.value)}
                  className="p-2 border border-neutral-300 rounded-lg bg-white font-mono"
                />
                <input
                  type="text"
                  required
                  placeholder="Nombre de Cuenta Auxiliar..."
                  value={cuentaAuxiliarNombre}
                  onChange={(e) => setCuentaAuxiliarNombre(e.target.value)}
                  className="col-span-2 p-2 border border-neutral-300 rounded-lg bg-white"
                />
              </div>
            )}
          </div>

          {/* Row 4: Categoría y Descripción */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-neutral-700 block mb-1">
                Categoría *
              </label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full p-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium"
              >
                {CATEGORIAS_DEFAULT.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="font-semibold text-neutral-700 block mb-1">
                Descripción del Material o Servicio *
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Lámina de Acero ASTM A-36, Electrodos E7018..."
                value={itemDescripcion}
                onChange={(e) => setItemDescripcion(e.target.value)}
                className="w-full p-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Row 5: Cantidad, UM, P. Unitario, Total */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-neutral-50 p-3 rounded-xl border border-neutral-200">
            <div>
              <label className="font-semibold text-neutral-700 block mb-1">
                Cantidad *
              </label>
              <input
                type="number"
                step="any"
                min="0.01"
                required
                value={cantidad}
                onChange={(e) => setCantidad(parseFloat(e.target.value) || 0)}
                className="w-full p-2 border border-neutral-300 rounded-lg bg-white font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-neutral-700 block mb-1">
                U.M. (Unidad)
              </label>
              <input
                type="text"
                value={unidadMedida}
                onChange={(e) => setUnidadMedida(e.target.value)}
                placeholder="und, kg, ton..."
                className="w-full p-2 border border-neutral-300 rounded-lg bg-white"
              />
            </div>

            <div>
              <label className="font-semibold text-neutral-700 block mb-1">
                P. Unitario ($) *
              </label>
              <input
                type="number"
                step="any"
                min="0"
                required
                value={montoUnitario}
                onChange={(e) => setMontoUnitario(parseFloat(e.target.value) || 0)}
                className="w-full p-2 border border-neutral-300 rounded-lg bg-white font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-neutral-700 block mb-1">
                Monto Total ($)
              </label>
              <div className="w-full p-2 bg-neutral-200/70 border border-neutral-300 rounded-lg font-mono font-bold text-neutral-900 tabular-nums">
                {formatCurrency(montoTotalCalc)}
              </div>
            </div>
          </div>

          {/* Row 6: Destino y Responsable */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-neutral-700 block mb-1">
                Destino / Proveedor / Taller
              </label>
              <input
                type="text"
                placeholder="Ej: Taller de Calderería, Torno N°3"
                value={proveedorODestino}
                onChange={(e) => setProveedorODestino(e.target.value)}
                className="w-full p-2 border border-neutral-300 rounded-lg"
              />
            </div>

            <div>
              <label className="font-semibold text-neutral-700 block mb-1">
                Responsable / Solicitante
              </label>
              <input
                type="text"
                placeholder="Ej: Lic. Alejandra Tesara"
                value={responsable}
                onChange={(e) => setResponsable(e.target.value)}
                className="w-full p-2 border border-neutral-300 rounded-lg"
              />
            </div>
          </div>

          {/* Row 7: Observaciones */}
          <div>
            <label className="font-semibold text-neutral-700 block mb-1">
              Observaciones adicionales
            </label>
            <input
              type="text"
              placeholder="Notas, justificación de salida..."
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="w-full p-2 border border-neutral-300 rounded-lg"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors shadow-xs"
            >
              {isEditing ? 'Guardar Cambios' : 'Registrar Salida'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
