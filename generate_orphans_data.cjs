const fs = require('fs');
const xlsx = require('./node_modules/xlsx');

const wb = xlsx.readFile('C:/Users/alejandratesara/Desktop/Alejandra T/Costos Alejandra/1 Informe/4 Master Unificado.xlsx');
const sheet = wb.Sheets['Unificada'];
const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });
const headers = rows[0];

const colTipo = headers.indexOf('Tipo');
const colAlmacen = headers.indexOf('Almacen');
const colFecha = headers.indexOf('Fecha');
const colNumero = headers.indexOf('Numero');
const colPedido = headers.indexOf('Pedido');
const colCuentaAux = headers.indexOf('Cuenta-Aux');
const colCeco = headers.indexOf('Ceco');
const colCodigo = headers.indexOf('Codigo');
const colDesc = headers.indexOf('Descripcion');
const colCantidad = headers.indexOf('Cantidad');
const colUnidad = headers.indexOf('Unidad');
const colSolicitante = headers.indexOf('solicitante');
const colMotivo = headers.indexOf('motivo');
const colCategoria = headers.indexOf('Categoria');
const colMonto = headers.indexOf('Total USD');
const colPrecio = headers.indexOf('Precio$');
const colPryDesc = headers.indexOf('Datos.Descripción');
const colTipoCosto = headers.indexOf('Datos.Tipo Costo');

const { SALIDAS_REALES_SEPTIEMBRE_2026 } = require('./src/data/realSalidasSeptiembre2026.ts');
const existingIds = new Set(SALIDAS_REALES_SEPTIEMBRE_2026.map(s => s.codigoSalida));

const newSalidas = [];

function extractDate(motivo, sc) {
  // Buscar fechas como DD/MM/2026 o DD/MM/26
  const match = motivo.match(/(\d{1,2})\/0?9\/(2026|26)/);
  if (match) {
    const day = match[1].padStart(2, '0');
    return `2026-09-${day}`;
  }
  const matchGen = motivo.match(/(\d{1,2})\/(\d{1,2})\/(2026|26)/);
  if (matchGen && parseInt(matchGen[2]) === 9) {
    const day = matchGen[1].padStart(2, '0');
    return `2026-09-${day}`;
  }
  // Si tiene SC alta, asignar fecha por defecto razonable
  const scNumMatch = sc.match(/sc(\d+)/i);
  const scNum = scNumMatch ? parseInt(scNumMatch[1]) : 0;
  if (scNum >= 26200) return '2026-09-22';
  if (scNum >= 26000) return '2026-09-15';
  return '2026-09-08';
}

let extraIdx = 1;

for (let i = 1; i < rows.length; i++) {
  const row = rows[i];
  if (!row) continue;
  
  const f = row[colFecha];
  const m = row[headers.indexOf('Nombre del mes')];
  const a = row[headers.indexOf('Año')];
  const monto = Number(row[colMonto]) || 0;

  if ((!f || !m || !a) && monto > 0) {
    const sc = String(row[colNumero] || '').trim();
    const oc = String(row[colPedido] || '').trim();
    const desc = String(row[colDesc] || '').trim();
    const motivo = String(row[colMotivo] || '').trim();
    const cta = String(row[colCuentaAux] || '').trim();
    const tipo = String(row[colTipo] || '').trim();
    
    const combined = `${sc} ${oc} ${desc} ${motivo}`.toLowerCase();
    
    const hasSepDate = combined.includes('/09/2026') || combined.includes('/09/26') || combined.includes('septiembre') || combined.includes(' 09/26');
    const scMatch = sc.match(/sc(\d+)/i);
    const scNum = scMatch ? parseInt(scMatch[1]) : 0;
    const isRecentSC = scNum >= 25800 && !combined.includes('/08/26') && !combined.includes('/08/2026') && !combined.includes('/07/26');

    if (hasSepDate || isRecentSC) {
      if (!existingIds.has(sc)) {
        const fechaStr = extractDate(motivo, sc);
        const day = parseInt(fechaStr.split('-')[2]);
        const week = day <= 7 ? 36 : day <= 14 ? 37 : day <= 21 ? 38 : day <= 28 ? 39 : 40;

        newSalidas.push({
          id: `REAL-SEP-ORPHAN-${extraIdx++}`,
          fecha: fechaStr,
          semana: week,
          semanaLabel: `Semana ${week}`,
          mes: 9,
          mesLabel: 'Septiembre 2026',
          ano: 2026,
          codigoSalida: sc,
          cuentaAuxiliarCodigo: cta || 'TTE-C-0706',
          cuentaAuxiliarNombre: String(row[colPryDesc] || cta).trim(),
          proyecto: String(row[colPryDesc] || cta).trim(),
          tipo: tipo || 'Servicios',
          categoria: String(row[colCategoria] || tipo || 'SERVICIOS').toUpperCase().trim(),
          subcategoria: String(row[colCategoria] || tipo || 'SERVICIOS').toUpperCase().trim(),
          itemDescripcion: desc || 'SERVICIO / COMPRA NO ESPECIFICADA',
          cantidad: Number(row[colCantidad]) || 1,
          unidadMedida: String(row[colUnidad] || 'UND').trim(),
          montoUnitario: Number(row[colPrecio]) || monto,
          montoTotal: monto,
          moneda: 'USD',
          responsable: 'Operaciones & Procura',
          solicitante: String(row[colSolicitante] || 'Operaciones').trim(),
          motivo: `${motivo} (OC: ${oc})`.trim(),
          centroCosto: String(row[colCeco] || 'MON-3').trim(),
          tipoCosto: String(row[colTipoCosto] || 'Externo').trim(),
          estado: 'Procesado'
        });
      }
    }
  }
}

console.log(`Generados ${newSalidas.length} objetos de salida rescatados.`);
fs.writeFileSync('new_september_orphans.json', JSON.stringify(newSalidas, null, 2), 'utf8');
console.log('Guardado en new_september_orphans.json con éxito.');
