const XLSX = require('xlsx');
const fs = require('fs');

const wb = XLSX.readFile('C:/Users/danielarivero/Downloads/Horas Hombres Mantto Equipos Septiembre.xlsx');
const ws = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(ws);

const cuentasMap = {};
const sinCuentaList = [];
const trabajadoresMap = {};
const tiposMap = {};

let totalHoras = 0;
let totalHorasConCta = 0;
let totalHorasSinCta = 0;

data.forEach((r, idx) => {
  const cta = (r['Cuenta Auxiliar'] || '').toString().trim();
  const horas = Number(r['Horas Trabajadas']) || 0;
  const trabajador = (r['Apellidos y Nombres'] || '').toString().trim();
  const equipo = (r['Datos.Descripcion'] || '').toString().trim();
  const motivo = (r['Motivo'] || '').toString().trim();
  const tipo = (r['Tipo de Equipo'] || 'Otros').toString().trim();
  const fechaExcel = r['Fecha'];
  const paquete = Number(r['Paquete Semanal']) || 130;
  
  let fechaStr = '';
  if (typeof fechaExcel === 'number') {
    const d = new Date((fechaExcel - 25569) * 86400 * 1000);
    fechaStr = d.toISOString().split('T')[0];
  } else {
    fechaStr = String(fechaExcel || '2026-09');
  }

  totalHoras += horas;

  if (cta && cta !== '-' && cta !== 'N/A' && cta !== 'SIN ASIGNAR') {
    totalHorasConCta += horas;
    if (!cuentasMap[cta]) {
      cuentasMap[cta] = {
        cuenta: cta,
        equipo: equipo || cta,
        tipo,
        totalHoras: 0,
        registros: 0,
        trabajadores: new Set(),
        labores: []
      };
    }
    cuentasMap[cta].totalHoras += horas;
    cuentasMap[cta].registros++;
    cuentasMap[cta].trabajadores.add(trabajador);
    if (motivo && !cuentasMap[cta].labores.includes(motivo) && cuentasMap[cta].labores.length < 4) {
      cuentasMap[cta].labores.push(motivo);
    }
  } else {
    totalHorasSinCta += horas;
    sinCuentaList.push({
      id: 'MOD-SEP-PEND-' + (idx + 1),
      fecha: fechaStr,
      trabajador,
      tipoEquipo: tipo || 'Sin clasificar',
      equipoReferencia: equipo || 'Sin equipo asignado',
      motivoLabor: motivo || 'Labor operativa sin cuenta auxiliar asignada',
      horasTrabajadas: horas,
      paqueteSemanal: paquete,
      estadoConciliacion: 'PENDIENTE_CONCILIAR'
    });
  }

  if (tipo) {
    if (!tiposMap[tipo]) tiposMap[tipo] = { tipo, totalHoras: 0, registros: 0 };
    tiposMap[tipo].totalHoras += horas;
    tiposMap[tipo].registros++;
  }

  if (trabajador) {
    if (!trabajadoresMap[trabajador]) {
      trabajadoresMap[trabajador] = { trabajador, totalHoras: 0, registros: 0, paquete };
    }
    trabajadoresMap[trabajador].totalHoras += horas;
    trabajadoresMap[trabajador].registros++;
  }
});

const cuentasList = Object.values(cuentasMap).map(c => ({
  cuenta: c.cuenta,
  equipo: c.equipo,
  tipo: c.tipo,
  totalHoras: c.totalHoras,
  registros: c.registros,
  cantTrabajadores: c.trabajadores.size,
  trabajadores: Array.from(c.trabajadores),
  principalesLabores: c.labores.join(' • ')
})).sort((a,b) => b.totalHoras - a.totalHoras);

const tiposList = Object.values(tiposMap).sort((a,b) => b.totalHoras - a.totalHoras);
const trabajadoresList = Object.values(trabajadoresMap).sort((a,b) => b.totalHoras - a.totalHoras);

const ts = `/**
 * Mano de Obra Directa (MOD) - Mantenimiento de Equipos ECO Septiembre 2026
 * Extraído directamente de: Horas Hombres Mantto Equipos Septiembre.xlsx
 */

export interface HorasHombreCuentaSep {
  cuenta: string;
  equipo: string;
  tipo: string;
  totalHoras: number;
  registros: number;
  cantTrabajadores: number;
  trabajadores: string[];
  principalesLabores: string;
}

export interface HorasHombrePendienteConciliacion {
  id: string;
  fecha: string;
  trabajador: string;
  tipoEquipo: string;
  equipoReferencia: string;
  motivoLabor: string;
  horasTrabajadas: number;
  paqueteSemanal: number;
  estadoConciliacion: 'PENDIENTE_CONCILIAR' | 'CONCILIADO' | 'RECHAZADO';
}

export interface ResumenMODFamilia {
  tipo: string;
  totalHoras: number;
  registros: number;
}

export interface ResumenMODTrabajador {
  trabajador: string;
  totalHoras: number;
  registros: number;
  paquete: number;
}

export const TOTALES_MOD_SEPTIEMBRE_2026 = {
  totalHorasHombre: ${totalHoras},
  horasConCuentaAuxiliar: ${totalHorasConCta},
  horasSinCuentaAuxiliar: ${totalHorasSinCta},
  totalRegistros: ${data.length},
  registrosConCuenta: ${data.length - sinCuentaList.length},
  registrosSinCuenta: ${sinCuentaList.length},
  cuentasAuxiliaresImpactadas: ${cuentasList.length},
  totalTecnicosPlanta: ${trabajadoresList.length},
  tarifaPromedioEstimadaHora: 2.05,
  costoEstimadoTotalUSD: Math.round(${totalHoras} * 2.05)
};

export const HORAS_HOMBRE_POR_CUENTA_SEPTIEMBRE: HorasHombreCuentaSep[] = ${JSON.stringify(cuentasList, null, 2)};

export const HORAS_HOMBRE_SIN_CUENTA_SEPTIEMBRE: HorasHombrePendienteConciliacion[] = ${JSON.stringify(sinCuentaList, null, 2)};

export const HORAS_HOMBRE_POR_FAMILIA_SEPTIEMBRE: ResumenMODFamilia[] = ${JSON.stringify(tiposList, null, 2)};

export const HORAS_HOMBRE_POR_TRABAJADOR_SEPTIEMBRE: ResumenMODTrabajador[] = ${JSON.stringify(trabajadoresList, null, 2)};
`;

fs.writeFileSync('C:/Users/danielarivero/.gemini/antigravity/scratch/timaca-costos/src/data/horasHombreSeptiembreData.ts', ts, 'utf8');
console.log('Successfully wrote src/data/horasHombreSeptiembreData.ts');
