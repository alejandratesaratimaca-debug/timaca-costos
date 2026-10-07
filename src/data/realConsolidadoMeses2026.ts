import { SalidaCosto } from '../types/costos';
import { MATRIZ_REAL_PROYECTOS_MENSUAL_2026 } from './realProyectosMensual2026';
import { CUENTAS_CORTAS_MAP } from './mockManoObraDiaria';

const MESES_INFO = [
  { num: 1, label: 'Enero 2026', corto: 'Ene', fecha: '2026-01-31', semana: 4 },
  { num: 2, label: 'Febrero 2026', corto: 'Feb', fecha: '2026-02-28', semana: 8 },
  { num: 3, label: 'Marzo 2026', corto: 'Mar', fecha: '2026-03-31', semana: 13 },
  { num: 4, label: 'Abril 2026', corto: 'Abr', fecha: '2026-04-30', semana: 17 },
  { num: 5, label: 'Mayo 2026', corto: 'May', fecha: '2026-05-31', semana: 22 },
  { num: 6, label: 'Junio 2026', corto: 'Jun', fecha: '2026-06-30', semana: 26 },
  { num: 7, label: 'Julio 2026', corto: 'Jul', fecha: '2026-07-31', semana: 30 }
];

export const REGISTROS_REALES_MESES_1_A_7: SalidaCosto[] = [];

Object.entries(MATRIZ_REAL_PROYECTOS_MENSUAL_2026).forEach(([cuentaCodigo, projData]) => {
  const nombreCorto = CUENTAS_CORTAS_MAP[cuentaCodigo] || projData.descripcion;
  
  MESES_INFO.forEach((mesInfo, mesIdx) => {
    const catsDesglose = projData.byCategoriaMes?.[mesIdx];
    if (!catsDesglose) return;
    
    Object.entries(catsDesglose).forEach(([catNombre, monto]) => {
      if (monto > 0) {
        REGISTROS_REALES_MESES_1_A_7.push({
          id: `REAL-M${mesInfo.num}-${cuentaCodigo}-${catNombre.replace(/\s+/g, '_')}`,
          fecha: mesInfo.fecha,
          semana: mesInfo.semana,
          semanaLabel: `Semana ${mesInfo.semana}`,
          mes: mesInfo.num,
          mesLabel: mesInfo.label,
          ano: 2026,
          codigoSalida: `M${mesInfo.num}-${cuentaCodigo.replace('TTE-C-', '')}`,
          cuentaAuxiliarCodigo: cuentaCodigo,
          cuentaAuxiliarNombre: projData.descripcion,
          proyecto: nombreCorto,
          tipo: catNombre,
          categoria: catNombre,
          subcategoria: 'Consumo Mensual Registrado',
          itemDescripcion: `${catNombre} - Desembolso de ${mesInfo.label} (${nombreCorto})`,
          cantidad: 1,
          unidadMedida: 'GLOBAL',
          montoUnitario: Math.round(monto * 100) / 100,
          montoTotal: Math.round(monto * 100) / 100,
          motivo: `Cierre contable mensual oficial ${mesInfo.label}`,
          solicitante: 'Control de Gestión TIMACA',
          centroCosto: 'Proyectos de Producción',
          responsable: 'Gerencia de Costos',
          esProyectoExterno: true
        });
      }
    });
  });
});
