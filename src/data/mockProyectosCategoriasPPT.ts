// Matriz Oficial de Proyectos Externos con sus 5 Categorías de Costo
// Sincronizada directamente con MATRIZ_REAL_PROYECTOS_MENSUAL_2026, 4 Master Unificado y Modelo Estrella TIMACA
// Filtros estrictos: Proyectos Externos (TTE-C), Sin Ajuste (excluye Normalización y MANUAL)
// Totales Oficiales: Agosto = $1.290.177 USD | Anual 2026 = $11.809.472 USD

import { MATRIZ_REAL_PROYECTOS_MENSUAL_2026 } from './realProyectosMensual2026';
import { CUENTAS_CORTAS_MAP } from './mockManoObraDiaria';

export interface FilaProyectoCategoriasPPT {
  ranking: number;
  cuentaAuxiliar: string;
  proyecto: string;
  proyectoCorto: string;
  materiales: number;
  servicios: number;
  manoDeObra: number;
  horasMaquina: number;
  indirectos: number;
  totalProyecto: number;
  porcentaje: number;
}

const proyectosList = Object.values(MATRIZ_REAL_PROYECTOS_MENSUAL_2026);

// 1. Matriz Oficial de Agosto 2026 ($1.345.010 USD)
const totalAgostoGeneral = 1345010;

export const PROYECTOS_CATEGORIAS_AGOSTO_2026: FilaProyectoCategoriasPPT[] = proyectosList
  .filter(p => (p.meses[7] || 0) > 0)
  .sort((a, b) => (b.meses[7] || 0) - (a.meses[7] || 0))
  .map((p, idx) => {
    const cat = p.byCategoriaMes[7] || {};
    const tot = Math.round(p.meses[7] || 0);
    return {
      ranking: idx + 1,
      cuentaAuxiliar: p.cuentaAuxiliar,
      proyecto: p.descripcion,
      proyectoCorto: CUENTAS_CORTAS_MAP[p.cuentaAuxiliar] || p.descripcion,
      materiales: Math.round(cat['Materiales Directos'] || 0),
      servicios: Math.round(cat['Servicios'] || 0),
      manoDeObra: Math.round(cat['Mano de Obra Directa'] || 0),
      horasMaquina: Math.round(cat['Horas Maquina'] || 0),
      indirectos: Math.round(cat['Costos Indirectos'] || 0),
      totalProyecto: tot,
      porcentaje: Math.round((tot / totalAgostoGeneral) * 10000) / 100
    };
  });

// 2. Matriz Oficial de Total Acumulado Anual 2026 ($11.804.998 USD)
const totalAnualGeneral = 11804998;

export const PROYECTOS_CATEGORIAS_ANUAL_2026: FilaProyectoCategoriasPPT[] = proyectosList
  .sort((a, b) => b.totalAnual - a.totalAnual)
  .map((p, idx) => {
    const cat = { 'Materiales Directos': 0, 'Servicios': 0, 'Mano de Obra Directa': 0, 'Horas Maquina': 0, 'Costos Indirectos': 0 };
    for (let m = 0; m < 8; m++) {
      for (const [c, val] of Object.entries(p.byCategoriaMes[m] || {})) {
        if (cat[c as keyof typeof cat] !== undefined) {
          cat[c as keyof typeof cat] += val;
        }
      }
    }
    const tot = Math.round(p.totalAnual);
    return {
      ranking: idx + 1,
      cuentaAuxiliar: p.cuentaAuxiliar,
      proyecto: p.descripcion,
      proyectoCorto: CUENTAS_CORTAS_MAP[p.cuentaAuxiliar] || p.descripcion,
      materiales: Math.round(cat['Materiales Directos']),
      servicios: Math.round(cat['Servicios']),
      manoDeObra: Math.round(cat['Mano de Obra Directa']),
      horasMaquina: Math.round(cat['Horas Maquina']),
      indirectos: Math.round(cat['Costos Indirectos']),
      totalProyecto: tot,
      porcentaje: Math.round((tot / totalAnualGeneral) * 10000) / 100
    };
  });

// 3. Matriz Oficial de Septiembre 2026 (.215.432 USD)
const totalSeptiembreGeneral = 1215432;

export const PROYECTOS_CATEGORIAS_SEPTIEMBRE_2026: FilaProyectoCategoriasPPT[] = [
  {
    ranking: 1,
    cuentaAuxiliar: "TTE-C-0706",
    proyecto: "Recuperación de Línea 1 de Planta de Pellas",
    proyectoCorto: "Línea 1 Pellas",
    materiales: 150588,
    servicios: 56338,
    manoDeObra: 125000,
    horasMaquina: 55578,
    indirectos: 49713,
    totalProyecto: 412928,
    porcentaje: 33.97
  },
  {
    ranking: 2,
    cuentaAuxiliar: "TTE-C-0671",
    proyecto: "Segunda línea PMH - Ingeniería, diseño y suministro",
    proyectoCorto: "2da Línea PMH",
    materiales: 178460,
    servicios: 5032,
    manoDeObra: 38050,
    horasMaquina: 0,
    indirectos: 2518,
    totalProyecto: 227250,
    porcentaje: 18.69
  },
  {
    ranking: 3,
    cuentaAuxiliar: "TTE-C-0653",
    proyecto: "Repotenciación de rueda de cangilones (DRAVO) PMH",
    proyectoCorto: "Rueda Cangilones PMH",
    materiales: 141692,
    servicios: 15552,
    manoDeObra: 0,
    horasMaquina: 0,
    indirectos: 0,
    totalProyecto: 157554,
    porcentaje: 12.96
  },
  {
    ranking: 4,
    cuentaAuxiliar: "TTE-C-0676",
    proyecto: "Segunda linea de Planta de Pellas",
    proyectoCorto: "2da Línea Pellas",
    materiales: 444,
    servicios: 0,
    manoDeObra: 140763,
    horasMaquina: 0,
    indirectos: 9315,
    totalProyecto: 141207,
    porcentaje: 11.62
  },
  {
    ranking: 5,
    cuentaAuxiliar: "TTE-C-0668",
    proyecto: "Fase 2 Planta de briquetas - FMO",
    proyectoCorto: "Briquetas Fase 2",
    materiales: 70081,
    servicios: 2898,
    manoDeObra: 10721,
    horasMaquina: 0,
    indirectos: 709,
    totalProyecto: 82418,
    porcentaje: 6.78
  },
  {
    ranking: 6,
    cuentaAuxiliar: "TTE-C-0694",
    proyecto: "Suministro e Instalación de la Caldera BF-6002",
    proyectoCorto: "Caldera Briquetas",
    materiales: 35558,
    servicios: 5619,
    manoDeObra: 4412,
    horasMaquina: 0,
    indirectos: 292,
    totalProyecto: 45589,
    porcentaje: 3.75
  },
  {
    ranking: 7,
    cuentaAuxiliar: "TTE-C-0680",
    proyecto: "Servicio de mantenimiento de BG II",
    proyectoCorto: "Mantenimiento BG II",
    materiales: 4226,
    servicios: 26269,
    manoDeObra: 13393,
    horasMaquina: 0,
    indirectos: 886,
    totalProyecto: 43888,
    porcentaje: 3.61
  },
  {
    ranking: 8,
    cuentaAuxiliar: "TTE-C-0655",
    proyecto: "Interconexión del sist. de transporte desde tolva PMH",
    proyectoCorto: "Tolva PMH",
    materiales: 24174,
    servicios: 340,
    manoDeObra: 2516,
    horasMaquina: 0,
    indirectos: 166,
    totalProyecto: 27030,
    porcentaje: 2.22
  },
  {
    ranking: 9,
    cuentaAuxiliar: "TTE-C-0656",
    proyecto: "Rehabilitación de bandas transportadoras PMH",
    proyectoCorto: "Bandas Transp. PMH",
    materiales: 11087,
    servicios: 9574,
    manoDeObra: 4593,
    horasMaquina: 0,
    indirectos: 304,
    totalProyecto: 25255,
    porcentaje: 2.08
  },
  {
    ranking: 10,
    cuentaAuxiliar: "TTE-C-0678",
    proyecto: "Proyecto Pila HA y HB, suministro e instalación PMH",
    proyectoCorto: "Pila HA y HB PMH",
    materiales: 13874,
    servicios: 248,
    manoDeObra: 350,
    horasMaquina: 0,
    indirectos: 23,
    totalProyecto: 14472,
    porcentaje: 1.19
  },
  {
    ranking: 11,
    cuentaAuxiliar: "TTE-C-0640",
    proyecto: "Rehabilitación de la Parrilla Móvil 610TG1 / Pellas",
    proyectoCorto: "Parrilla Móvil Pellas",
    materiales: 13900,
    servicios: 56,
    manoDeObra: 0,
    horasMaquina: 0,
    indirectos: 0,
    totalProyecto: 13956,
    porcentaje: 1.15
  },
  {
    ranking: 12,
    cuentaAuxiliar: "TTE-C-0669",
    proyecto: "Servicio de mantenimiento de Dravo y Shiploader",
    proyectoCorto: "Mtto Dravo / Shiploader",
    materiales: 4,
    servicios: 0,
    manoDeObra: 7498,
    horasMaquina: 0,
    indirectos: 496,
    totalProyecto: 7502,
    porcentaje: 0.62
  },
  {
    ranking: 13,
    cuentaAuxiliar: "TTE-C-0670",
    proyecto: "Servicio de mtto. Maquinas Briqueteras",
    proyectoCorto: "Mtto Briqueteras",
    materiales: 0,
    servicios: 0,
    manoDeObra: 4595,
    horasMaquina: 0,
    indirectos: 304,
    totalProyecto: 4595,
    porcentaje: 0.38
  },
  {
    ranking: 14,
    cuentaAuxiliar: "TTE-C-0654",
    proyecto: "Proyecto 5B: Rehabilitación de cinta JD-9021 PMH",
    proyectoCorto: "Cinta JD-9021",
    materiales: 3671,
    servicios: 148,
    manoDeObra: 0,
    horasMaquina: 0,
    indirectos: 0,
    totalProyecto: 3818,
    porcentaje: 0.31
  },
  {
    ranking: 15,
    cuentaAuxiliar: "TTE-C-0688",
    proyecto: "Desmantelamiento del Carga Barcos Wellman",
    proyectoCorto: "Carga Barcos Wellman",
    materiales: 0,
    servicios: 2060,
    manoDeObra: 0,
    horasMaquina: 0,
    indirectos: 0,
    totalProyecto: 2060,
    porcentaje: 0.17
  },
  {
    ranking: 16,
    cuentaAuxiliar: "TTE-C-0718",
    proyecto: "Arandela de presión M20 DIN-127 Pavonada",
    proyectoCorto: "Arandelas M20",
    materiales: 1495,
    servicios: 38,
    manoDeObra: 0,
    horasMaquina: 0,
    indirectos: 0,
    totalProyecto: 1533,
    porcentaje: 0.13
  },
  {
    ranking: 17,
    cuentaAuxiliar: "TTE-C-0672",
    proyecto: "Extensión de banda transportadora JD 8016A/B PMH",
    proyectoCorto: "Banda JD 8016A/B",
    materiales: 1237,
    servicios: 0,
    manoDeObra: 0,
    horasMaquina: 0,
    indirectos: 0,
    totalProyecto: 1237,
    porcentaje: 0.1
  },
  {
    ranking: 18,
    cuentaAuxiliar: "TTE-C-0711",
    proyecto: "Servicio de retirada e instalación módulos eléctricos TH4",
    proyectoCorto: "Módulos Eléctricos TH4",
    materiales: 1201,
    servicios: 0,
    manoDeObra: 0,
    horasMaquina: 0,
    indirectos: 0,
    totalProyecto: 1201,
    porcentaje: 0.1
  },
  {
    ranking: 19,
    cuentaAuxiliar: "TTE-C-0697",
    proyecto: "Reparación de Generador Eléctrico (Briquetas)",
    proyectoCorto: "Generador Briquetas",
    materiales: 695,
    servicios: 160,
    manoDeObra: 0,
    horasMaquina: 0,
    indirectos: 0,
    totalProyecto: 855,
    porcentaje: 0.07
  },
  {
    ranking: 20,
    cuentaAuxiliar: "TTE-C-0578",
    proyecto: "Reconstrucción de aspas de agitadores del área 41 (Bauxilum)",
    proyectoCorto: "Aspas Agitadores Bauxilum",
    materiales: 14,
    servicios: 0,
    manoDeObra: 0,
    horasMaquina: 0,
    indirectos: 0,
    totalProyecto: 614,
    porcentaje: 0.05
  },
  {
    ranking: 21,
    cuentaAuxiliar: "TTE-C-0663",
    proyecto: "Reacondicionamiento etapa III en Boca Grande 2",
    proyectoCorto: "Boca Grande 2 Etapa III",
    materiales: 169,
    servicios: 0,
    manoDeObra: 0,
    horasMaquina: 0,
    indirectos: 0,
    totalProyecto: 169,
    porcentaje: 0.01
  },
  {
    ranking: 22,
    cuentaAuxiliar: "TTE-C-0704",
    proyecto: "Segundo Lote - Fabricación de placas y anclajes",
    proyectoCorto: "Placas y Anclajes",
    materiales: 140,
    servicios: 0,
    manoDeObra: 0,
    horasMaquina: 0,
    indirectos: 0,
    totalProyecto: 140,
    porcentaje: 0.01
  },
  {
    ranking: 23,
    cuentaAuxiliar: "TTE-C-0641",
    proyecto: "HIB PLANT / Rehabilitación de las Máquinas Briqueteadoras FMO",
    proyectoCorto: "Rehab. Briqueteadoras",
    materiales: 75,
    servicios: 0,
    manoDeObra: 0,
    horasMaquina: 0,
    indirectos: 0,
    totalProyecto: 75,
    porcentaje: 0.01
  },
  {
    ranking: 24,
    cuentaAuxiliar: "TTE-C-0667",
    proyecto: "Reparaciones principales en Top Gas Scrubber - Planta de Briquetas",
    proyectoCorto: "Top Gas Scrubber",
    materiales: 59,
    servicios: 0,
    manoDeObra: 0,
    horasMaquina: 0,
    indirectos: 0,
    totalProyecto: 59,
    porcentaje: 0
  },
  {
    ranking: 25,
    cuentaAuxiliar: "TTE-C-0681",
    proyecto: "Adicionales Proyecto 2da línea de Planta de Pellas",
    proyectoCorto: "Adicionales 2da Línea Pellas",
    materiales: 0,
    servicios: 26,
    manoDeObra: 0,
    horasMaquina: 0,
    indirectos: 0,
    totalProyecto: 26,
    porcentaje: 0
  },
  {
    ranking: 26,
    cuentaAuxiliar: "TTE-C-0675",
    proyecto: "Reparación motor / reductor boom conveyor BG II",
    proyectoCorto: "Motor Boom BG II",
    materiales: 3,
    servicios: 0,
    manoDeObra: 0,
    horasMaquina: 0,
    indirectos: 0,
    totalProyecto: 3,
    porcentaje: 0
  }
];
