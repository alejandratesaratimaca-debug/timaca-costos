import * as XLSX from 'xlsx';
import { SalidaCosto, ResumenSemanal, ResumenMensual, ProyectoResumen } from '../types/costos';
import { parseFechaToDetails, formatCurrency } from './dateHelpers';
import { isNormalizacion } from './normalizacionFilter';
import { COSTOS_INDIRECTOS_POR_CATEGORIAS } from '../data/mockDesgloseCategorias';

export interface ParseResult {
  success: boolean;
  data: SalidaCosto[];
  errors: string[];
  totalRows: number;
  sheetNames: string[];
}

// Helper to parse numbers robustly across different Excel and language formats (Latin dot-thousand, comma-decimal, currency signs)
export function cleanNumber(val: any): number {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (!val) return 0;
  let str = String(val).trim();
  
  // Remove currency signs, spaces, non-breaking spaces, quotes
  str = str.replace(/[$Bs€\s\u00a0]/g, '');

  // Handle negative numbers with parentheses like (500.00)
  const isNegative = /^\(.*\)$/.test(str) || str.startsWith('-');
  str = str.replace(/[()]/g, '');

  // Format like "228.113,00" or "1.454.773,50" (dot thousands, comma decimals)
  if (/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(str)) {
    str = str.replace(/\./g, '').replace(',', '.');
  } 
  // Format like "228,113.00" (comma thousands, dot decimals)
  else if (/^\d{1,3}(,\d{3})+(\.\d+)?$/.test(str)) {
    str = str.replace(/,/g, '');
  } 
  // Integer with dot thousand separator like "228.113" or "1.454.773"
  else if (/^\d{1,3}(\.\d{3})+$/.test(str)) {
    str = str.replace(/\./g, '');
  }
  // Decimal with comma only like "1250,50"
  else if (str.includes(',') && !str.includes('.')) {
    str = str.replace(',', '.');
  } 
  else {
    str = str.replace(/[^0-9.-]/g, '');
  }
  
  let num = parseFloat(str);
  if (isNaN(num)) return 0;
  return isNegative && num > 0 ? -num : num;
}

// Normalized column matching with prioritization and anti-collision for count columns
function findKey(row: Record<string, any>, candidateKeys: string[]): any {
  const rowKeys = Object.keys(row);

  // Pass 1: Exact match (case and trim normalized)
  for (const candidate of candidateKeys) {
    const candNorm = candidate.toLowerCase().trim();
    const found = rowKeys.find(k => k.trim().toLowerCase() === candNorm);
    if (found && row[found] !== undefined && row[found] !== null && String(row[found]).trim() !== '') {
      return row[found];
    }
  }

  // Pass 2: Substring match (guarding against count columns like "Total Salidas Cuenta" when searching for "total")
  for (const candidate of candidateKeys) {
    const candNorm = candidate.toLowerCase().trim();
    const found = rowKeys.find(k => {
      const kNorm = k.trim().toLowerCase();
      // If looking for a monetary word, do not match count/percentage columns
      if ((candNorm === 'total' || candNorm === 'monto') && /salida|registro|item|cant|piezas|horas|hh|filas|count|%|porcent/i.test(kNorm)) {
        return false;
      }
      return kNorm.includes(candNorm);
    });
    if (found && row[found] !== undefined && row[found] !== null && String(row[found]).trim() !== '') {
      return row[found];
    }
  }
  return undefined;
}

// Dynamically detects the header row in case row 0 is a title or metadata
function getSheetJsonWithHeaderDetection(worksheet: XLSX.WorkSheet): { rows: Record<string, any>[]; headerRow: number } {
  const rawMatrix = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1, defval: '' });
  if (!rawMatrix || rawMatrix.length === 0) return { rows: [], headerRow: 0 };

  let bestHeaderIndex = 0;
  let maxScore = -1;

  const headerKeywords = [
    'proyecto', 'cuenta', 'categoria', 'monto', 'total', 'fecha', 'descripcion', 
    'codigo', 'concepto', 'cliente', 'costo', 'semana', 'salida', 'partida', 
    'unitario', 'cantidad', 'responsable', 'proveedor'
  ];

  for (let r = 0; r < Math.min(rawMatrix.length, 15); r++) {
    const row = rawMatrix[r];
    if (Array.isArray(row)) {
      const rowStr = row.map(c => String(c).toLowerCase().trim()).join(' ');
      const score = headerKeywords.filter(k => rowStr.includes(k)).length;
      if (score > maxScore) {
        maxScore = score;
        bestHeaderIndex = r;
      }
    }
  }

  // If we found a confident header row, use that row offset
  const startRow = maxScore >= 2 ? bestHeaderIndex : 0;
  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
    range: startRow,
    defval: ''
  });

  return { rows, headerRow: startRow };
}

export function parseExcelFile(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        const workbook = XLSX.read(buffer, { type: 'binary', cellDates: true });
        const sheetNames = workbook.SheetNames;
        
        if (sheetNames.length === 0) {
          return resolve({
            success: false,
            data: [],
            errors: ['El archivo no contiene hojas de cálculo.'],
            totalRows: 0,
            sheetNames: []
          });
        }

        // Search best sheet across all sheets in workbook
        let targetSheetName = sheetNames[0];
        let bestRows: Record<string, any>[] = [];
        let bestScore = -1;

        for (const sName of sheetNames) {
          const ws = workbook.Sheets[sName];
          if (!ws) continue;
          const { rows } = getSheetJsonWithHeaderDetection(ws);
          if (rows.length === 0) continue;

          // Check how many recognizable cost columns exist in this sheet
          const firstRow = rows[0] || {};
          const rowKeys = Object.keys(firstRow).map(k => k.toLowerCase().trim());
          const hasMonto = !!findKey(firstRow, ['monto total', 'total', 'monto', 'costo total', 'importe', 'valor', 'total usd', 'total general', 'total $', 'monto $']);
          const hasProyecto = !!findKey(firstRow, ['proyecto', 'obra', 'ot', 'orden', 'centro de costo', 'cliente']);
          const hasFecha = !!findKey(firstRow, ['fecha', 'date', 'fec', 'dia', 'mes', 'periodo', 'período', 'registro', 'fecha desde', 'desde']);
          const hasMonthCols = rowKeys.some(k => /^(enero|febrero|marzo|abril|mayo|junio|julio|agosto|ene|feb|mar|abr|may|jun|jul|ago)$/.test(k));

          let sScore = rows.length;
          if (hasFecha) sScore += 2500;
          if (hasMonto) sScore += 600;
          if (hasProyecto) sScore += 400;
          if (hasMonthCols) sScore += 1800;
          if (/detalle|salida|salidas|movimiento|diario|costo|costos|base|data|transaccion|modelo.*estrella/i.test(sName)) sScore += 2000;
          if (/resumen.*semana|grafic|chart|portada/i.test(sName)) sScore -= 500;

          if (sScore > bestScore) {
            bestScore = sScore;
            targetSheetName = sName;
            bestRows = rows;
          }
        }

        if (bestRows.length === 0) {
          return resolve({
            success: false,
            data: [],
            errors: [`Las hojas de cálculo del archivo están vacías o no contienen filas de datos.`],
            totalRows: 0,
            sheetNames
          });
        }

        const jsonData = bestRows;
        const parsedList: SalidaCosto[] = [];

        // Detectar si la hoja es una matriz mensual (ej: columnas Ene, Feb, Mar, etc.)
        const firstRow = jsonData[0] || {};
        const firstRowKeys = Object.keys(firstRow);
        
        const monthSpecs = [
          { names: ['enero', 'ene', '01'], mes: 1, fecha: '2026-01-15', sem: 2, label: 'Enero 2026' },
          { names: ['febrero', 'feb', '02'], mes: 2, fecha: '2026-02-15', sem: 6, label: 'Febrero 2026' },
          { names: ['marzo', 'mar', '03'], mes: 3, fecha: '2026-03-15', sem: 10, label: 'Marzo 2026' },
          { names: ['abril', 'abr', '04'], mes: 4, fecha: '2026-04-15', sem: 15, label: 'Abril 2026' },
          { names: ['mayo', 'may', '05'], mes: 5, fecha: '2026-05-15', sem: 19, label: 'Mayo 2026' },
          { names: ['junio', 'jun', '06'], mes: 6, fecha: '2026-06-15', sem: 23, label: 'Junio 2026' },
          { names: ['julio', 'jul', '07'], mes: 7, fecha: '2026-07-15', sem: 28, label: 'Julio 2026' },
          { names: ['agosto', 'ago', '08'], mes: 8, fecha: '2026-08-15', sem: 32, label: 'Agosto 2026' },
        ];

        const matchedMonths = monthSpecs.map(m => {
          const colKey = firstRowKeys.find(k => {
            const clean = k.toLowerCase().trim();
            return m.names.some(n => clean === n || clean.startsWith(n + ' ') || clean.endsWith(' ' + n));
          });
          return colKey ? { ...m, colKey } : null;
        }).filter(Boolean) as { names: string[]; mes: number; fecha: string; sem: number; label: string; colKey: string }[];

        const isMatrixFormat = matchedMonths.length >= 3;

        if (isMatrixFormat) {
          // Desempaquetar matriz mensual en salidas transaccionales
          jsonData.forEach((row, rIdx) => {
            const rowLabel = String(findKey(row, ['proyecto', 'cuenta', 'concepto', 'rubro', 'descripcion', 'partida']) || Object.values(row)[0] || `Partida ${rIdx + 1}`).trim();
            if (/total|resumen/i.test(rowLabel)) return;

            const rawAjusteMatriz = findKey(row, ['ajuste', 'tipo de ajuste', 'tipo ajuste', 'ajustes']);
            const rawMotivoMatriz = findKey(row, ['motivo', 'justificacion', 'justificación']);
            if (isNormalizacion({ ajuste: rawAjusteMatriz, motivo: rawMotivoMatriz || rowLabel, ...row })) {
              return;
            }

            matchedMonths.forEach((m, mIdx) => {
              const val = cleanNumber(row[m.colKey]);
              if (val > 0) {
                parsedList.push({
                  id: `imported-matriz-${Date.now()}-${rIdx}-${mIdx}`,
                  codigoSalida: `MOD-EST-${m.mes.toString().padStart(2, '0')}-${rIdx + 1}`,
                  fecha: m.fecha,
                  semana: m.sem,
                  semanaLabel: `Semana ${m.sem.toString().padStart(2, '0')}`,
                  mes: m.mes,
                  mesLabel: m.label,
                  ano: 2026,
                  proyecto: rowLabel.startsWith('TTE-C-') ? rowLabel : 'General TIMACA',
                  cuentaAuxiliarCodigo: rowLabel.startsWith('TTE-C-') ? rowLabel.split(' ')[0] : 'CTA-101',
                  cuentaAuxiliarNombre: rowLabel,
                  centroCosto: rowLabel,
                  categoria: 'Costos Generales',
                  itemDescripcion: `Costo Consolidado Mensual: ${rowLabel}`,
                  proveedorODestino: 'Planta TIMACA',
                  cantidad: 1,
                  unidadMedida: 'lote',
                  montoUnitario: val,
                  montoTotal: val,
                  moneda: 'USD',
                  responsable: 'Ing. Civil Alejandra Tesara',
                  motivo: rawMotivoMatriz ? String(rawMotivoMatriz).trim() : `Costo Consolidado Mensual: ${rowLabel}`,
                  ajuste: rawAjusteMatriz ? String(rawAjusteMatriz).trim() : 'Operativo',
                  estado: 'Procesado',
                  observaciones: `Importado de Matriz Mensual "${targetSheetName}" (fila ${rIdx + 2})`
                });
              }
            });
          });
        } else {
          // Procesamiento transaccional estándar
          jsonData.forEach((row, index) => {
            // Detect fields
            const rawFecha = findKey(row, ['fecha', 'date', 'fec', 'dia', 'mes', 'periodo', 'período', 'registro', 'fecha desde', 'desde']);
            const rawCodigo = findKey(row, ['codigo', 'código', 'salida', 'doc', 'nro', 'num', 'id', 'comprobante']) || `SAL-${Date.now().toString().slice(-4)}-${index + 1}`;
            
            // Detección de Ajuste y Motivo (para regla obligatoria de filtro de Normalización)
            const rawAjuste = findKey(row, ['ajuste', 'tipo de ajuste', 'tipo ajuste', 'ajustes', 'clasificacion ajuste', 'tipo de movimiento', 'movimiento', 'tipo transaccion']);
            const rawMotivo = findKey(row, ['motivo', 'justificacion', 'justificación', 'motivo ajuste', 'concepto de ajuste', 'concepto ajuste', 'causa', 'razon', 'razón', 'motivo / justificacion']);

            // Regla obligatoria: Excluir registros donde 'Ajuste' (o 'Motivo') sea igual a 'Normalizacion' o contenga la palabra 'Normaliz' (case-insensitive y sin tildes)
            if (isNormalizacion({ ajuste: rawAjuste, motivo: rawMotivo, ...row })) {
              return; // Excluir este registro patrimonial
            }

            // Detección inteligente de archivos de Nómina / Recursos Humanos (Inputs de Mano de Obra)
            const rawSemana = findKey(row, ['semana', 'sem', 'semana_num', 'semana nro', 'semana no', 'semana (año)']);
            const rawTotalAPagar = findKey(row, ['suma de total a pagar $', 'total a pagar $', 'total a pagar', 'total pagar', 'neto $', 'sueldo $', 'nomina $', 'total a pagar usd']);
            const rawSourceFile = findKey(row, ['source.name', 'sourcename', 'source name', 'archivo', 'origen']) || file.name;

            let parsedSemanaNum: number | undefined = undefined;
            if (rawSemana !== undefined && rawSemana !== null && rawSemana !== '') {
              const num = parseInt(String(rawSemana).replace(/[^0-9]/g, ''));
              if (!isNaN(num) && num >= 1 && num <= 53) {
                parsedSemanaNum = num;
              }
            }

            // Si el nombre del archivo contiene "sem 31", etc.
            if (!parsedSemanaNum && rawSourceFile) {
              const matchSem = String(rawSourceFile).match(/sem\s*(\d{1,2})/i);
              if (matchSem && matchSem[1]) {
                const num = parseInt(matchSem[1]);
                if (num >= 1 && num <= 53) {
                  parsedSemanaNum = num;
                }
              }
            }

            // Proyecto / OT
            let rawProyecto = findKey(row, ['proyecto', 'obra', 'ot', 'orden de trabajo', 'centro de costo', 'centro costo', 'c.costo', 'cc', 'cliente']) || 'General TIMACA';
            
            // Cuentas Auxiliares
            const rawCtaCod = findKey(row, ['cuenta auxiliar', 'codigo auxiliar', 'cod auxiliar', 'cta auxiliar', 'cuenta auxiliar codigo', 'codigo cta', 'subcuenta codigo', 'partida', 'cod cuenta', 'cta']) || 'CTA-101';
            let rawCtaNom = findKey(row, ['nombre auxiliar', 'descripcion cuenta', 'cta auxiliar nombre', 'subcuenta', 'nombre cuenta', 'rubro contable']);

            // Si es un archivo de nómina de RRHH
            const isNominaRRHH = !!rawTotalAPagar || String(rawSourceFile).toLowerCase().includes('sem') || String(rawSourceFile).toLowerCase().includes('nomina');
            let rawCat = findKey(row, ['categoria', 'categoría', 'rubro', 'tipo', 'familia', 'concepto']) || (isNominaRRHH ? 'Mano de Obra Directa' : 'Materiales Directos');

            if (!rawCtaNom && rawCtaCod) {
              rawCtaNom = String(rawProyecto).trim();
            }

            const rawDesc = findKey(row, ['descripcion', 'descripción', 'item', 'ítem', 'concepto', 'material', 'detalle', 'repuesto', 'trabajador', 'cargo']) || 
              (isNominaRRHH ? `Nómina RRHH ${parsedSemanaNum ? `Semana ${parsedSemanaNum}` : ''} (${rawSourceFile})` : (rawCat ? `${rawCat} - Salida #${index + 1}` : `Salida de material fila #${index + 1}`));
            const rawProv = findKey(row, ['proveedor', 'destino', 'receptor', 'solicitante', 'almacen', 'ubicacion', 'cedula']) || 'Planta TIMACA';
            const rawCant = cleanNumber(findKey(row, ['cantidad', 'cant', 'qty', 'unidades'])) || 1;
            const rawUm = String(findKey(row, ['unidad', 'medida', 'um', 'u.m', 'presentacion']) || (isNominaRRHH ? 'nómina' : 'und')).trim();
            
            let rawMontoTotal = cleanNumber(
              rawTotalAPagar || 
              findKey(row, [
                'monto total cuenta (usd)',
                'monto total (usd)',
                'total proyecto (usd)',
                'monto total cuenta',
                'total proyecto',
                'monto total',
                'total usd',
                'total general',
                'costo total',
                'monto $',
                'total $',
                'precio final',
                'precio final usd',
                'precio final $',
                'precio$',
                'importe total',
                'monto',
                'importe',
                'valor',
                'total'
              ])
            );
            let rawPUnit = cleanNumber(findKey(row, ['monto unitario', 'unitario', 'precio unitario', 'costo unitario', 'p.unit', 'precio', 'precio final', 'precio$']));

            if (rawMontoTotal === 0 && rawPUnit > 0) {
              rawMontoTotal = Math.round(rawCant * rawPUnit * 100) / 100;
            } else if (rawPUnit === 0 && rawMontoTotal > 0 && rawCant > 0) {
              rawPUnit = Math.round((rawMontoTotal / rawCant) * 100) / 100;
            }

            // Clasificación de la categoría de alto nivel y subcategoría
            let finalCategoria = 'Materiales Directos';
            let finalSubcategoria = String(rawCat || 'General').trim();
            const rawCatLower = finalSubcategoria.toLowerCase();

            if (isNominaRRHH || rawCatLower.includes('mano de obra') || rawCatLower.includes('nomina') || rawCatLower.includes('sueldo')) {
              finalCategoria = 'Mano de Obra Directa';
            } else if (rawCatLower.includes('servicio') || rawCatLower.includes('flete') || rawCatLower.includes('alquiler') || rawCatLower.includes('examen') || rawCatLower.includes('honorarios') || rawCatLower.includes('vigilancia')) {
              finalCategoria = 'Servicios';
            } else if (rawCatLower.includes('hora maquina') || rawCatLower.includes('horas maquina') || rawCatLower.includes('torno') || rawCatLower.includes('grua') || rawCatLower.includes('mandrinadora')) {
              finalCategoria = 'Horas Maquina';
            } else if (rawCatLower.includes('costos indirectos') || rawCatLower.includes('indirecto')) {
              finalCategoria = 'Costos Indirectos';
            } else {
              // Categorías de inventario del almacén (Accesorios de Carrocería, Aceite, Soldadura, etc.)
              finalCategoria = 'Materiales Directos';
            }

            const rawResp = findKey(row, ['responsable', 'solicito', 'autorizo', 'encargado', 'persona', 'ingeniero', 'usuario']) || 'Ing. Civil Alejandra Tesara';

            // Format Date con corrección antidesfase para semanas de nómina
            let dateStr = '2026-08-15'; // Default a Agosto 2026 (mes de cierre activo) para evitar desfases a meses futuros
            if (rawFecha) {
              if (rawFecha instanceof Date) {
                const y = rawFecha.getFullYear();
                const m = String(rawFecha.getMonth() + 1).padStart(2, '0');
                const d = String(rawFecha.getDate()).padStart(2, '0');
                dateStr = `${y}-${m}-${d}`;
              } else {
                const strVal = String(rawFecha).trim();
                dateStr = strVal;
              }
            }

            // Se pasa la semana explícita si existe para neutralizar desfases como 28-31 Jul perteneciendo a Agosto
            const details = parseFechaToDetails(dateStr, parsedSemanaNum);

            parsedList.push({
              id: `imported-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 7)}`,
              codigoSalida: String(rawCodigo).trim(),
              fecha: details.fechaStandard,
              semana: details.semana,
              semanaLabel: details.semanaLabel,
              mes: details.mes,
              mesLabel: details.mesLabel,
              ano: details.ano,
              proyecto: String(rawProyecto).trim(),
              cuentaAuxiliarCodigo: String(rawCtaCod).trim(),
              cuentaAuxiliarNombre: String(rawCtaNom).trim(),
              centroCosto: String(rawProyecto).trim(),
              categoria: finalCategoria,
              tipo: finalCategoria,
              subcategoria: finalSubcategoria,
              itemDescripcion: String(rawDesc).trim(),
              proveedorODestino: String(rawProv).trim(),
              cantidad: rawCant,
              unidadMedida: String(rawUm).trim().toUpperCase() === 'USE' ? 'SERV' : rawUm,
              montoUnitario: rawPUnit,
              montoTotal: rawMontoTotal,
              moneda: 'USD',
              responsable: String(rawResp).trim(),
              motivo: rawMotivo ? String(rawMotivo).trim() : String(rawDesc).trim(),
              ajuste: rawAjuste ? String(rawAjuste).trim() : 'Operativo',
              estado: 'Procesado',
              observaciones: `Importado de "${targetSheetName}" (fila ${index + 2})`
            });
          });
        }

        // Guard against zero-total files: do not accept a file where all parsed records total $0
        const totalImportAmount = parsedList.reduce((acc, c) => acc + (c.montoTotal || 0), 0);
        if (totalImportAmount <= 0) {
          return resolve({
            success: false,
            data: [],
            errors: [`Las filas leídas de "${targetSheetName}" totalizan $0 USD. Verifique los nombres y formatos de las columnas de monto en su archivo Excel.`],
            totalRows: parsedList.length,
            sheetNames
          });
        }

        resolve({
          success: true,
          data: parsedList,
          errors: [],
          totalRows: parsedList.length,
          sheetNames
        });
      } catch (err: any) {
        resolve({
          success: false,
          data: [],
          errors: [`Error al procesar archivo: ${err.message || 'Formato no soportado'}`],
          totalRows: 0,
          sheetNames: []
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        data: [],
        errors: ['No se pudo leer el archivo seleccionado.'],
        totalRows: 0,
        sheetNames: []
      });
    };

    reader.readAsBinaryString(file);
  });
}

export function exportSalidasToExcel(
  salidas: SalidaCosto[], 
  resumenSemanas: ResumenSemanal[], 
  resumenMeses: ResumenMensual[],
  resumenProyectos?: ProyectoResumen[]
) {
  const wb = XLSX.utils.book_new();

  // 1. Sheet Proyectos y Cuentas Auxiliares
  if (resumenProyectos && resumenProyectos.length > 0) {
    const dataPry: any[] = [];
    resumenProyectos.forEach(p => {
      p.cuentasAuxiliares.forEach(c => {
        dataPry.push({
          'Proyecto / OT': p.nombre,
          'Total Proyecto (USD)': p.totalMonto,
          'Código Cuenta Auxiliar': c.codigo,
          'Nombre Cuenta Auxiliar': c.nombre,
          'Total Salidas Cuenta': c.totalSalidas,
          'Monto Total Cuenta (USD)': c.totalMonto,
          '% del Proyecto': `${c.porcentaje}%`,
        });
      });
    });
    const wsPry = XLSX.utils.json_to_sheet(dataPry);
    XLSX.utils.book_append_sheet(wb, wsPry, 'Proyectos y Ctas Auxiliares');
  }

  // 2. Sheet Salidas Detalladas
  const dataDetalle = salidas.map(s => ({
    'Código Salida': s.codigoSalida,
    'Fecha': s.fecha,
    'Semana': s.semanaLabel,
    'Mes': s.mesLabel,
    'Proyecto / OT': s.proyecto,
    'Código Cta Auxiliar': s.cuentaAuxiliarCodigo,
    'Cuenta Auxiliar': s.cuentaAuxiliarNombre,
    'Categoría': s.categoria,
    'Ajuste': s.ajuste || 'Operativo',
    'Motivo': s.motivo || '',
    'Descripción del Ítem': s.itemDescripcion,
    'Proveedor / Destino': s.proveedorODestino,
    'Cantidad': s.cantidad,
    'U.M.': s.unidadMedida === 'USE' ? 'SERV' : s.unidadMedida,
    'Precio Unitario (USD)': s.montoUnitario,
    'Monto Total (USD)': s.montoTotal,
    'Responsable': s.responsable,
    'Estado': s.estado,
    'Observaciones': s.observaciones || ''
  }));
  const wsDetalle = XLSX.utils.json_to_sheet(dataDetalle);
  XLSX.utils.book_append_sheet(wb, wsDetalle, 'Salidas Detalladas');

  // 3. Sheet Semana a Semana
  const dataSemanas = resumenSemanas.map(w => ({
    'Semana': w.semanaLabel,
    'Mes': w.mesLabel,
    'Año': w.ano,
    'Total Salidas': w.totalSalidas,
    'Monto Total (USD)': w.totalMonto,
    'Variación vs Semana Previa (%)': w.porcentajeVariacion !== undefined ? `${w.porcentajeVariacion > 0 ? '+' : ''}${w.porcentajeVariacion.toFixed(1)}%` : 'N/A'
  }));
  const wsSemanas = XLSX.utils.json_to_sheet(dataSemanas);
  XLSX.utils.book_append_sheet(wb, wsSemanas, 'Resumen Semana a Semana');

  // 4. Sheet Mes a Mes
  const dataMeses = resumenMeses.map(m => ({
    'Mes': m.mesLabel,
    'Año': m.ano,
    'Total Salidas': m.totalSalidas,
    'Monto Total (USD)': m.totalMonto,
    'Promedio Semanal (USD)': m.promedioSemanal,
    'Variación vs Mes Previo (%)': m.porcentajeVariacion !== undefined ? `${m.porcentajeVariacion > 0 ? '+' : ''}${m.porcentajeVariacion.toFixed(1)}%` : 'N/A'
  }));
  const wsMeses = XLSX.utils.json_to_sheet(dataMeses);
  XLSX.utils.book_append_sheet(wb, wsMeses, 'Resumen Mes a Mes');

  // Generate binary and trigger download
  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `Modelo_Estrella_Costos_TIMACA_Proyectos_${dateStr}.xlsx`);
}

export function downloadTemplateExcel() {
  const wb = XLSX.utils.book_new();

  const plantillaData = [
    {
      'Fecha': '2026-03-25',
      'Código Salida': 'SAL-2026-0001',
      'Proyecto / OT': 'OT-409: Fabricación Tanques API 650',
      'Código Cuenta Auxiliar': 'CTA-101',
      'Nombre Cuenta Auxiliar': 'Materiales Directos & Aceros Estructurales',
      'Categoría': 'Materiales & Aceros',
      'Descripción': 'Lámina de Acero ASTM A-36 12mm x 2.44m',
      'Proveedor / Destino': 'Siderúrgica del Turbio',
      'Cantidad': 10,
      'Unidad': 'planchas',
      'Monto Unitario': 680.00,
      'Monto Total': 6800.00,
      'Responsable': 'Ing. Carlos Mendoza',
      'Observaciones': 'Para fondo de tanque TK-01'
    },
    {
      'Fecha': '2026-03-26',
      'Código Salida': 'SAL-2026-0002',
      'Proyecto / OT': 'OT-410: Estructuras Metálicas Naves Industriales',
      'Código Cuenta Auxiliar': 'CTA-102',
      'Nombre Cuenta Auxiliar': 'Consumibles de Soldadura, Gases & Fundentes',
      'Categoría': 'Consumibles de Soldadura',
      'Descripción': 'Alambre Tubular E71T-1 rollo 15kg',
      'Proveedor / Destino': 'Soldaduras Industriales C.A.',
      'Cantidad': 8,
      'Unidad': 'rollos',
      'Monto Unitario': 78.50,
      'Monto Total': 628.00,
      'Responsable': 'Téc. Luis Rondón',
      'Observaciones': 'Soldadura de columnas principales'
    },
    {
      'Fecha': '2026-03-27',
      'Código Salida': 'SAL-2026-0003',
      'Proyecto / OT': 'OT-411: Mecanizado Ejes y Coronas de Molino',
      'Código Cuenta Auxiliar': 'CTA-103',
      'Nombre Cuenta Auxiliar': 'Herramientas de Corte, Insertos & Repuestos',
      'Categoría': 'Herramientas & Repuestos',
      'Descripción': 'Insertos de Carburo Sandvik CNMG 120408',
      'Proveedor / Destino': 'Herramientas de Precisión C.A.',
      'Cantidad': 25,
      'Unidad': 'und',
      'Monto Unitario': 14.50,
      'Monto Total': 362.50,
      'Responsable': 'Maestro Pedro Silva',
      'Observaciones': 'Mecanizado de bridas en torno pesado'
    }
  ];

  const ws = XLSX.utils.json_to_sheet(plantillaData);
  XLSX.utils.book_append_sheet(wb, ws, 'Modelo_Estrella_Costos_TIMACA');
  XLSX.writeFile(wb, 'Plantilla_Modelo_Estrella_Costos_TIMACA.xlsx');
}

export function exportCategoriaToExcel(
  categoriaNombre: string,
  mesActualLabel: string,
  mesAnteriorLabel: string,
  montoActual: number,
  montoAnterior: number,
  variacionPct: number,
  proyectosData: {
    nombre: string;
    cliente: string;
    montoActual: number;
    montoAnterior: number;
    variacionPct: number;
    porcentajeCategoria: number;
    salidasCount: number;
  }[],
  salidasDetalle: SalidaCosto[]
) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Resumen de Comparativa
  const resumenData = [
    {
      'Categoría de Costo': categoriaNombre,
      'Mes Actual': mesActualLabel,
      'Monto Mes Actual (USD)': montoActual,
      'Mes Anterior': mesAnteriorLabel,
      'Monto Mes Anterior (USD)': montoAnterior,
      'Diferencia (USD)': montoActual - montoAnterior,
      'Variación (%)': `${variacionPct > 0 ? '+' : ''}${variacionPct.toFixed(1)}%`,
      'Total Proyectos Activos': proyectosData.length,
      'Total Salidas Imputadas': salidasDetalle.length
    }
  ];
  const wsResumen = XLSX.utils.json_to_sheet(resumenData);
  XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen Comparativo');

  // Sheet 2: Imputación por Proyecto
  const pryData = proyectosData.map((p, idx) => ({
    '#': idx + 1,
    'Proyecto / OT': p.nombre,
    'Cliente / Destino': p.cliente,
    [`Monto ${mesActualLabel} (USD)`]: p.montoActual,
    [`Monto ${mesAnteriorLabel} (USD)`]: p.montoAnterior,
    'Diferencia (USD)': p.montoActual - p.montoAnterior,
    'Variación (%)': p.variacionPct === 0 ? '0.0%' : `${p.variacionPct > 0 ? '+' : ''}${p.variacionPct.toFixed(1)}%`,
    '% Participación en Categoría': `${p.porcentajeCategoria.toFixed(1)}%`,
    'N° Salidas': p.salidasCount
  }));
  const wsPry = XLSX.utils.json_to_sheet(pryData);
  XLSX.utils.book_append_sheet(wb, wsPry, 'Imputación por Proyectos');

  // Sheet 3: Detalle de Movimientos (Materiales/Servicios) o Rubros Contables Oficiales (Costos Indirectos)
  if (categoriaNombre === 'Costos Indirectos') {
    const rubrosData = COSTOS_INDIRECTOS_POR_CATEGORIAS.map((r, i) => ({
      '#': i + 1,
      'Rubro Contable / Cuenta': r.concepto,
      'Enero (USD)': r.ene || 0,
      'Febrero (USD)': r.feb || 0,
      'Marzo (USD)': r.mar || 0,
      'Abril (USD)': r.abr || 0,
      'Mayo (USD)': r.may || 0,
      'Junio (USD)': r.jun || 0,
      'Julio (USD)': r.jul || 0,
      'Agosto (USD)': r.ago || 0,
      'Septiembre (USD)': r.sep || 0,
      'Total Acumulado (USD)': r.total,
      'Naturaleza': 'Prorrateo Costos Indirectos Corporativos (Sin vales SIP)'
    }));
    const wsRubros = XLSX.utils.json_to_sheet(rubrosData);
    XLSX.utils.book_append_sheet(wb, wsRubros, 'Rubros Contables Oficiales');
  } else {
    const detData = salidasDetalle.map(s => ({
      'Código Salida': s.codigoSalida,
      'Fecha': s.fecha,
      'Proyecto / OT': s.proyecto,
      'Cuenta Auxiliar': s.cuentaAuxiliarCodigo,
      'Descripción Material / Servicio': s.itemDescripcion,
      'Proveedor / Destino': s.proveedorODestino,
      'Cantidad': s.cantidad,
      'Unidad': s.unidadMedida === 'USE' ? 'SERV' : s.unidadMedida,
      'Monto Total (USD)': s.montoTotal,
      'Responsable': s.responsable
    }));
    const wsDet = XLSX.utils.json_to_sheet(detData);
    XLSX.utils.book_append_sheet(wb, wsDet, 'Detalle de Movimientos');
  }

  // Sheet 4: Auditoría de Motivos, Solicitantes y Cuentas Auxiliares (Revisión detallada de motivos requerida por usuario)
  if (salidasDetalle && salidasDetalle.length > 0) {
    const motivosData = salidasDetalle.map(s => ({
      'Cuenta Auxiliar': s.cuentaAuxiliarCodigo || '',
      'Nombre de Cuenta': s.cuentaAuxiliarNombre || s.proyecto || '',
      'Categoría': s.categoria || categoriaNombre,
      'Descripción / Partida': s.itemDescripcion || '',
      'Cantidad': s.cantidad || 0,
      'Unidad': s.unidadMedida === 'USE' ? 'SERV' : s.unidadMedida || 'und',
      'Precio Unitario (USD)': s.montoUnitario || (s.cantidad && s.cantidad > 0 ? Number((s.montoTotal / s.cantidad).toFixed(2)) : s.montoTotal),
      'Monto Total (USD)': s.montoTotal || 0,
      'Solicitante': (s as any).solicitante || s.responsable || 'No especificado',
      'Motivo / Justificación': s.motivo || 'Operativo',
      'Fecha': s.fecha || '',
      'Código Salida': s.codigoSalida || ''
    }));
    const wsMotivos = XLSX.utils.json_to_sheet(motivosData);
    XLSX.utils.book_append_sheet(wb, wsMotivos, 'Auditoría de Motivos');
  }

  const cleanCatName = categoriaNombre.replace(/\s+/g, '_');
  XLSX.writeFile(wb, `TIMACA_Categoria_${cleanCatName}_${mesActualLabel.replace(/\s+/g, '_')}.xlsx`);
}
