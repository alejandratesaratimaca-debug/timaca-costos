// Matriz Oficial Real 2026 de Desembolsos Mensuales por Proyecto Externo (Enero a Agosto 2026)
// Extraída directamente de 4 Master Unificado.xlsx y Modelo Estrella TIMACA
// Cero datos inventados. Filtros estrictos: Proyectos Externos (TTE-C), Sin Ajuste (excluye Normalización y MANUAL)
// Total Consolidado Oficial: $11.809.472 USD

export interface ProyectoEvolutivoMensual {
  cuentaAuxiliar: string;
  descripcion: string;
  meses: number[]; // 8 posiciones (Ene a Ago)
  byCategoriaMes: Array<Record<string, number>>; // 8 posiciones con desglose por las 5 categorías
  totalAnual: number;
}

export const MATRIZ_REAL_PROYECTOS_MENSUAL_2026: Record<string, ProyectoEvolutivoMensual> = {
  "TTE-C-0676": {
    "cuentaAuxiliar": "TTE-C-0676",
    "descripcion": "Segunda linea de Planta de Pellas (VISCO ORINOCO)",
    "meses": [
      614837.67,
      486668.06,
      387356.95,
      378139.39,
      34927.78,
      24049.08,
      12822.6,
      4018.44,
      58483.7
    ],
    "byCategoriaMes": [
      {
        "Materiales Directos": 63394.13,
        "Servicios": 49753.32,
        "Mano de Obra Directa": 248884.41,
        "Horas Maquina": 143016.16,
        "Costos Indirectos": 109789.65
      },
      {
        "Materiales Directos": 39771.05,
        "Servicios": 73186.54,
        "Mano de Obra Directa": 187511.41,
        "Horas Maquina": 97341.46,
        "Costos Indirectos": 88857.6
      },
      {
        "Materiales Directos": 21458.41,
        "Servicios": 54952.07,
        "Mano de Obra Directa": 159974.66,
        "Horas Maquina": 65147.96,
        "Costos Indirectos": 85823.85
      },
      {
        "Materiales Directos": 48875.71,
        "Servicios": 42241.24,
        "Mano de Obra Directa": 157878.58,
        "Horas Maquina": 38935.19,
        "Costos Indirectos": 90208.67
      },
      {
        "Materiales Directos": 8788.75,
        "Servicios": 1372.75,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 24766.28,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": -352.21,
        "Servicios": 20600,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 3801.29,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 15,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 12807.6,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 4018.44,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 58483.7,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      }
    ],
    "totalAnual": 2001303.67
  },
  "TTE-C-0668": {
    "cuentaAuxiliar": "TTE-C-0668",
    "descripcion": "Fase 2 Planta de briquetas - FMO  (VISCO ORINOCO)",
    "meses": [
      191559.33,
      103494.58,
      192267.8,
      169650.56,
      90009.33,
      103800.8,
      165044.18,
      169770.8,
      235538.78
    ],
    "byCategoriaMes": [
      {
        "Materiales Directos": 147032.22,
        "Servicios": 6259.96,
        "Mano de Obra Directa": 24612,
        "Horas Maquina": 0,
        "Costos Indirectos": 13655.15
      },
      {
        "Materiales Directos": 69434.99,
        "Servicios": 4051.33,
        "Mano de Obra Directa": 17333.04,
        "Horas Maquina": 0,
        "Costos Indirectos": 12675.22
      },
      {
        "Materiales Directos": 144177.87,
        "Servicios": 12129.49,
        "Mano de Obra Directa": 18098.4,
        "Horas Maquina": 0,
        "Costos Indirectos": 17862.04
      },
      {
        "Materiales Directos": 92914.21,
        "Servicios": 8902.48,
        "Mano de Obra Directa": 41157.5,
        "Horas Maquina": 0,
        "Costos Indirectos": 26676.37
      },
      {
        "Materiales Directos": 52045.85,
        "Servicios": 2850,
        "Mano de Obra Directa": 20238.03,
        "Horas Maquina": 0,
        "Costos Indirectos": 14875.45
      },
      {
        "Materiales Directos": 63944.45,
        "Servicios": 15336.84,
        "Mano de Obra Directa": 13061.61,
        "Horas Maquina": 0,
        "Costos Indirectos": 11457.9
      },
      {
        "Materiales Directos": 51252.97,
        "Servicios": 80289.39,
        "Mano de Obra Directa": 15221.69,
        "Horas Maquina": 0,
        "Costos Indirectos": 18280.13
      },
      {
        "Materiales Directos": 105046.51,
        "Servicios": 30770.46,
        "Mano de Obra Directa": 10835,
        "Horas Maquina": 0,
        "Costos Indirectos": 23118.83
      },
      {
        "Materiales Directos": 191492.24,
        "Servicios": 3330.97,
        "Mano de Obra Directa": 8391.6,
        "Horas Maquina": 0,
        "Costos Indirectos": 32323.97
      }
    ],
    "totalAnual": 1421136.16
  },
  "TTE-C-0641": {
    "cuentaAuxiliar": "TTE-C-0641",
    "descripcion": "HIB PLANT/ Rehabilitación de las Máquinas Briqueteadoras FMO (VISCO ORINOCO)",
    "meses": [
      4505.42,
      2407.84,
      39.61,
      0,
      0,
      0,
      8357.85,
      0,
      37406.8
    ],
    "byCategoriaMes": [
      {
        "Materiales Directos": 4505.42,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 2407.84,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 19.11,
        "Servicios": 20.5,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 677.85,
        "Servicios": 7680,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 37406.8,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      }
    ],
    "totalAnual": 52717.52
  },
  "TTE-C-0697": {
    "cuentaAuxiliar": "TTE-C-0697",
    "descripcion": "Reparación de Generador Eléctrico para Planta de Briquetas FMO (VISCO ORINOCO)",
    "meses": [
      10.28,
      0,
      0,
      10354.9,
      0,
      16069.76,
      2318.94,
      1045.4,
      1541.2
    ],
    "byCategoriaMes": [
      {
        "Materiales Directos": 10.28,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 698.9,
        "Servicios": 9656,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 1069.76,
        "Servicios": 15000,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 518.94,
        "Servicios": 1800,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 1045.4,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 1381.2,
        "Servicios": 160,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      }
    ],
    "totalAnual": 31340.48
  },
  "TTE-C-0656": {
    "cuentaAuxiliar": "TTE-C-0656",
    "descripcion": "Rehabilitación de bandas transportadoras de finos y gruesos de la torre #3 a banda JD-8012  PMH - FMO (VISCO ORINOCO)",
    "meses": [
      177170.64,
      354467.87,
      358299.28,
      103738.96,
      107989.87,
      76235.06,
      65742.31,
      109519.27,
      85260.74
    ],
    "byCategoriaMes": [
      {
        "Materiales Directos": 101887.64,
        "Servicios": 16092.78,
        "Mano de Obra Directa": 38068.92,
        "Horas Maquina": 0,
        "Costos Indirectos": 21121.3
      },
      {
        "Materiales Directos": 279065.36,
        "Servicios": 2082.56,
        "Mano de Obra Directa": 41180,
        "Horas Maquina": 6903.31,
        "Costos Indirectos": 25236.64
      },
      {
        "Materiales Directos": 158521.82,
        "Servicios": 107731.03,
        "Mano de Obra Directa": 44600,
        "Horas Maquina": 12640.76,
        "Costos Indirectos": 34805.67
      },
      {
        "Materiales Directos": 26147.8,
        "Servicios": 6483.13,
        "Mano de Obra Directa": 42270,
        "Horas Maquina": 1440.56,
        "Costos Indirectos": 27397.47
      },
      {
        "Materiales Directos": 33149.96,
        "Servicios": 4004.48,
        "Mano de Obra Directa": 32720.56,
        "Horas Maquina": 19347.99,
        "Costos Indirectos": 18766.87
      },
      {
        "Materiales Directos": 35936.02,
        "Servicios": 1197.51,
        "Mano de Obra Directa": 22978.35,
        "Horas Maquina": 1994.62,
        "Costos Indirectos": 14128.56
      },
      {
        "Materiales Directos": 9297.11,
        "Servicios": 5274.61,
        "Mano de Obra Directa": 25116.03,
        "Horas Maquina": 0,
        "Costos Indirectos": 26054.56
      },
      {
        "Materiales Directos": 63701.73,
        "Servicios": 130,
        "Mano de Obra Directa": 2943.29,
        "Horas Maquina": 0,
        "Costos Indirectos": 42744.25
      },
      {
        "Materiales Directos": 19686.87,
        "Servicios": 2048.4,
        "Mano de Obra Directa": 3761.9,
        "Horas Maquina": 0,
        "Costos Indirectos": 59763.57
      }
    ],
    "totalAnual": 1438424
  },
  "TTE-C-0655": {
    "cuentaAuxiliar": "TTE-C-0655",
    "descripcion": "Interconexión del sistema de transporte de mineral desde la tolva multipropósito hasta carga barcos de despacho internacional PMH - FMO (VISCO ORINOCO)",
    "meses": [
      209910.6,
      85410.31,
      61744.29,
      4788.18,
      78885.24,
      47750.14,
      8896.93,
      32170.01,
      253925.43
    ],
    "byCategoriaMes": [
      {
        "Materiales Directos": 191608.84,
        "Servicios": 4894.02,
        "Mano de Obra Directa": 8623.37,
        "Horas Maquina": 0,
        "Costos Indirectos": 4784.37
      },
      {
        "Materiales Directos": 52288.88,
        "Servicios": 31175.5,
        "Mano de Obra Directa": 990,
        "Horas Maquina": 0,
        "Costos Indirectos": 955.93
      },
      {
        "Materiales Directos": 13698.38,
        "Servicios": 48045.91,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 2003.19,
        "Servicios": 2784.99,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 77427.24,
        "Servicios": 1458,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 6463.26,
        "Servicios": 41286.88,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 8062.47,
        "Servicios": 538.98,
        "Mano de Obra Directa": 145,
        "Horas Maquina": 0,
        "Costos Indirectos": 150.48
      },
      {
        "Materiales Directos": 30304.52,
        "Servicios": 1182,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 683.49
      },
      {
        "Materiales Directos": 250996.6,
        "Servicios": 205,
        "Mano de Obra Directa": 1768.27,
        "Horas Maquina": 0,
        "Costos Indirectos": 955.56
      }
    ],
    "totalAnual": 783481.13
  },
  "TTE-C-0669": {
    "cuentaAuxiliar": "TTE-C-0669",
    "descripcion": "Servicio de mantenimiento de  Dravo, Shiploader Agrico, Cinta JD-8012, Cinta JD-8016 y Cinta de TH4 (VISCO ORINOCO)",
    "meses": [
      17126.93,
      12562.76,
      14412.59,
      0,
      54.1,
      0,
      0,
      9991.69,
      6773.01
    ],
    "byCategoriaMes": [
      {
        "Materiales Directos": 4853.92,
        "Servicios": 295.92,
        "Mano de Obra Directa": 7703.2,
        "Horas Maquina": 0,
        "Costos Indirectos": 4273.89
      },
      {
        "Materiales Directos": 1207.19,
        "Servicios": 0,
        "Mano de Obra Directa": 6540,
        "Horas Maquina": 0,
        "Costos Indirectos": 4815.57
      },
      {
        "Materiales Directos": 2067.89,
        "Servicios": 0,
        "Mano de Obra Directa": 6933.7,
        "Horas Maquina": 0,
        "Costos Indirectos": 5411
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 54.1,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 9991.69,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 1554.71,
        "Servicios": 0,
        "Mano de Obra Directa": 5218.3,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      }
    ],
    "totalAnual": 60921.08
  },
  "TTE-C-0706": {
    "cuentaAuxiliar": "TTE-C-0706",
    "descripcion": "Recuperación de Línea 1 de Planta de Pellas (VISCO ORINOCO)",
    "meses": [
      1836.68,
      1416.27,
      684.36,
      5611.15,
      392976.21,
      465168.36,
      520518.54,
      636351.52,
      805700.19
    ],
    "byCategoriaMes": [
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 1836.68,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 1416.27,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 684.36,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 810.32,
        "Servicios": 48,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 4752.83,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 10779.34,
        "Servicios": 41445.35,
        "Mano de Obra Directa": 171093.49,
        "Horas Maquina": 53268.8,
        "Costos Indirectos": 116389.23
      },
      {
        "Materiales Directos": 39061.82,
        "Servicios": 60100.5,
        "Mano de Obra Directa": 169549.67,
        "Horas Maquina": 61309,
        "Costos Indirectos": 135147.37
      },
      {
        "Materiales Directos": 94269.97,
        "Servicios": 57034.46,
        "Mano de Obra Directa": 198976.67,
        "Horas Maquina": 63125.68,
        "Costos Indirectos": 107484.91
      },
      {
        "Materiales Directos": 74979.83,
        "Servicios": 63106.4,
        "Mano de Obra Directa": 206184.43,
        "Horas Maquina": 89789.22,
        "Costos Indirectos": 202291.64
      },
      {
        "Materiales Directos": 292788.14,
        "Servicios": 46335.86,
        "Mano de Obra Directa": 128160.97,
        "Horas Maquina": 55577.78,
        "Costos Indirectos": 282837.43
      }
    ],
    "totalAnual": 2830263.28
  },
  "TTE-C-0653": {
    "cuentaAuxiliar": "TTE-C-0653",
    "descripcion": "Repotenciación de recuperador de rueda de cangilones (DRAVO) equipo de recuperación PA-9020 – PMH (VISCO ORINOCO)",
    "meses": [
      11537.93,
      15203.22,
      76237.63,
      37343.42,
      155180.08,
      38949.5,
      35466.01,
      64981.41,
      200526.5
    ],
    "byCategoriaMes": [
      {
        "Materiales Directos": 11537.93,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 2203.22,
        "Servicios": 13000,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 74638.88,
        "Servicios": 1598.75,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 36486.48,
        "Servicios": 856.94,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 40913.04,
        "Servicios": 3586.42,
        "Mano de Obra Directa": 39952.79,
        "Horas Maquina": 29137.96,
        "Costos Indirectos": 41589.87
      },
      {
        "Materiales Directos": 14799.82,
        "Servicios": 15035.95,
        "Mano de Obra Directa": 4380,
        "Horas Maquina": 0,
        "Costos Indirectos": 4733.73
      },
      {
        "Materiales Directos": 25127.09,
        "Servicios": 10338.92,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 63946.51,
        "Servicios": 1034.9,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 184054.97,
        "Servicios": 16471.53,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      }
    ],
    "totalAnual": 635425.7
  },
  "TTE-C-0671": {
    "cuentaAuxiliar": "TTE-C-0671",
    "descripcion": "Segunda línea PMH - Ingenieria, diseño y suministro, para incremento de capacidad del despacho internacional PMH-FMO (VISCO ORINOCO)",
    "meses": [
      189.38,
      2004.65,
      81075.05,
      17081.29,
      23011.38,
      418728.73,
      111542.9,
      187932.56,
      312572.45
    ],
    "byCategoriaMes": [
      {
        "Materiales Directos": 114.38,
        "Servicios": 75,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 1997.65,
        "Servicios": 7,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 75133.53,
        "Servicios": 5941.52,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 15565.25,
        "Servicios": 693.92,
        "Mano de Obra Directa": 305,
        "Horas Maquina": 319.44,
        "Costos Indirectos": 197.68
      },
      {
        "Materiales Directos": 15862.55,
        "Servicios": 1647.1,
        "Mano de Obra Directa": 3020,
        "Horas Maquina": 74.42,
        "Costos Indirectos": 2407.31
      },
      {
        "Materiales Directos": 76707.3,
        "Servicios": 320186.37,
        "Mano de Obra Directa": 11794.87,
        "Horas Maquina": 0,
        "Costos Indirectos": 10040.19
      },
      {
        "Materiales Directos": 73535.77,
        "Servicios": 4885.58,
        "Mano de Obra Directa": 16257,
        "Horas Maquina": 0,
        "Costos Indirectos": 16864.55
      },
      {
        "Materiales Directos": 132373.65,
        "Servicios": 5168.94,
        "Mano de Obra Directa": 27883.25,
        "Horas Maquina": 0,
        "Costos Indirectos": 22506.72
      },
      {
        "Materiales Directos": 249497.2,
        "Servicios": 1302.52,
        "Mano de Obra Directa": 30304.58,
        "Horas Maquina": 0,
        "Costos Indirectos": 31468.15
      }
    ],
    "totalAnual": 1154138.39
  },
  "TTE-C-0682": {
    "cuentaAuxiliar": "TTE-C-0682",
    "descripcion": "Suministro de personal para zona 6000 de Planta de Briquetas - FMO (VISCO ORINOCO)",
    "meses": [
      13875.68,
      20077.41,
      47006.35,
      8832.9,
      16228.17,
      11438.42,
      0,
      0,
      0
    ],
    "byCategoriaMes": [
      {
        "Materiales Directos": 1510.78,
        "Servicios": 0,
        "Mano de Obra Directa": 7952.63,
        "Horas Maquina": 0,
        "Costos Indirectos": 4412.27
      },
      {
        "Materiales Directos": 1109.87,
        "Servicios": 0,
        "Mano de Obra Directa": 6692.28,
        "Horas Maquina": 7365.46,
        "Costos Indirectos": 4909.8
      },
      {
        "Materiales Directos": 1293.86,
        "Servicios": 0,
        "Mano de Obra Directa": 6460,
        "Horas Maquina": 34211.14,
        "Costos Indirectos": 5041.35
      },
      {
        "Materiales Directos": 1136.05,
        "Servicios": 0,
        "Mano de Obra Directa": 4670,
        "Horas Maquina": 0,
        "Costos Indirectos": 3026.85
      },
      {
        "Materiales Directos": 460.23,
        "Servicios": 0,
        "Mano de Obra Directa": 7860,
        "Horas Maquina": 1902.1,
        "Costos Indirectos": 6005.84
      },
      {
        "Materiales Directos": 134.51,
        "Servicios": 0,
        "Mano de Obra Directa": 4518.4,
        "Horas Maquina": 1902.1,
        "Costos Indirectos": 4883.41
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      }
    ],
    "totalAnual": 117458.93
  },
  "TTE-C-0680": {
    "cuentaAuxiliar": "TTE-C-0680",
    "descripcion": "Servicio de mantenimiento de BG II (VISCO ORINOCO)",
    "meses": [
      112347.98,
      61031.44,
      46630.04,
      41545.63,
      80673.73,
      50113.55,
      51132.92,
      51179.5,
      39678.09
    ],
    "byCategoriaMes": [
      {
        "Materiales Directos": 40905.96,
        "Servicios": 47451.19,
        "Mano de Obra Directa": 15430,
        "Horas Maquina": 0,
        "Costos Indirectos": 8560.83
      },
      {
        "Materiales Directos": 7984.07,
        "Servicios": 28561.81,
        "Mano de Obra Directa": 17845,
        "Horas Maquina": 0,
        "Costos Indirectos": 6640.56
      },
      {
        "Materiales Directos": 15150.67,
        "Servicios": 4991.5,
        "Mano de Obra Directa": 14877.5,
        "Horas Maquina": 0,
        "Costos Indirectos": 11610.37
      },
      {
        "Materiales Directos": 8245.68,
        "Servicios": 13002.88,
        "Mano de Obra Directa": 12315,
        "Horas Maquina": 0,
        "Costos Indirectos": 7982.07
      },
      {
        "Materiales Directos": 8990.6,
        "Servicios": 31488.25,
        "Mano de Obra Directa": 24634.55,
        "Horas Maquina": 0,
        "Costos Indirectos": 15560.33
      },
      {
        "Materiales Directos": 6497.66,
        "Servicios": 21110.17,
        "Mano de Obra Directa": 14255.26,
        "Horas Maquina": 0,
        "Costos Indirectos": 8250.46
      },
      {
        "Materiales Directos": 7269.19,
        "Servicios": 25108,
        "Mano de Obra Directa": 9205.88,
        "Horas Maquina": 0,
        "Costos Indirectos": 9549.85
      },
      {
        "Materiales Directos": 10028.3,
        "Servicios": 15060,
        "Mano de Obra Directa": 11955,
        "Horas Maquina": 0,
        "Costos Indirectos": 14136.2
      },
      {
        "Materiales Directos": 5363.3,
        "Servicios": 2680,
        "Mano de Obra Directa": 11870.03,
        "Horas Maquina": 0,
        "Costos Indirectos": 19764.76
      }
    ],
    "totalAnual": 534332.88
  },
  "TTE-C-0674": {
    "cuentaAuxiliar": "TTE-C-0674",
    "descripcion": "Renovación de tolvas de cubierta – Boca Grande II (VISCO ORINOCO)",
    "meses": [
      13465.33,
      3123.02,
      51.28,
      6,
      0,
      0,
      0,
      0,
      18999.09
    ],
    "byCategoriaMes": [
      {
        "Materiales Directos": 13465.33,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 3123.02,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 51.28,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 6,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 18999.09,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      }
    ],
    "totalAnual": 35644.72
  },
  "TTE-C-0688": {
    "cuentaAuxiliar": "TTE-C-0688",
    "descripcion": "Desmantelamiento del Carga Barcos Wellman (VISCO ORINOCO)",
    "meses": [
      2808.98,
      20127.29,
      4790,
      0,
      0,
      0,
      758.99,
      758.99,
      0
    ],
    "byCategoriaMes": [
      {
        "Materiales Directos": 0,
        "Servicios": 507.85,
        "Mano de Obra Directa": 1480,
        "Horas Maquina": 0,
        "Costos Indirectos": 821.13
      },
      {
        "Materiales Directos": 2868.88,
        "Servicios": 1242.73,
        "Mano de Obra Directa": 9310,
        "Horas Maquina": 0,
        "Costos Indirectos": 6705.68
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 4790,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 758.99,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 758.99,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      }
    ],
    "totalAnual": 29244.25
  },
  "TTE-C-0640": {
    "cuentaAuxiliar": "TTE-C-0640",
    "descripcion": "Rehabilitación de la Parrilla Móvil 610TG1/ Planta de Pellas FMO (VISCO ORINOCO)",
    "meses": [
      9102.33,
      9515.89,
      25000.2,
      8683.67,
      9438.12,
      1212.14,
      6196.18,
      13704.63,
      47684.07
    ],
    "byCategoriaMes": [
      {
        "Materiales Directos": 9102.33,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 9515.89,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 24800.2,
        "Servicios": 200,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 8583.67,
        "Servicios": 100,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 9288.12,
        "Servicios": 150,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 1212.14,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 6196.18,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 13704.63,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 47682.07,
        "Servicios": 2,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      }
    ],
    "totalAnual": 130537.23
  },
  "TTE-C-0696": {
    "cuentaAuxiliar": "TTE-C-0696",
    "descripcion": "Reparación de Reductor OPCO de Planta de Briquetas FMO (VISCO ORINOCO)",
    "meses": [
      0,
      0,
      0,
      0,
      23591.52,
      0,
      110.81,
      0,
      0
    ],
    "byCategoriaMes": [
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 351.52,
        "Servicios": 23240,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 110.81,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      }
    ],
    "totalAnual": 23702.33
  },
  "TTE-C-0693": {
    "cuentaAuxiliar": "TTE-C-0693",
    "descripcion": "Trabajos para parada de Planta de Briquetas FMO (VISCO ORINOCO)",
    "meses": [
      5009.54,
      138745.15,
      119077.69,
      3120.27,
      9.16,
      0,
      0,
      0,
      0
    ],
    "byCategoriaMes": [
      {
        "Materiales Directos": 127.4,
        "Servicios": 0,
        "Mano de Obra Directa": 3140,
        "Horas Maquina": 0,
        "Costos Indirectos": 1742.14
      },
      {
        "Materiales Directos": 103206.87,
        "Servicios": 0,
        "Mano de Obra Directa": 22584.9,
        "Horas Maquina": 0,
        "Costos Indirectos": 12953.38
      },
      {
        "Materiales Directos": 22187.45,
        "Servicios": 40000,
        "Mano de Obra Directa": 31953.7,
        "Horas Maquina": 0,
        "Costos Indirectos": 24936.54
      },
      {
        "Materiales Directos": 656.33,
        "Servicios": 0,
        "Mano de Obra Directa": 1495,
        "Horas Maquina": 0,
        "Costos Indirectos": 968.94
      },
      {
        "Materiales Directos": 9.16,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      }
    ],
    "totalAnual": 265961.81
  },
  "TTE-C-0687": {
    "cuentaAuxiliar": "TTE-C-0687",
    "descripcion": "Reparación de las poleas motriz y de quiebre en la cola de la cinta JD-8016 FMO - PMH (VISCO ORINOCO)",
    "meses": [
      2195.51,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ],
    "byCategoriaMes": [
      {
        "Materiales Directos": 2115.51,
        "Servicios": 80,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      }
    ],
    "totalAnual": 2195.51
  },
  "TTE-C-0654": {
    "cuentaAuxiliar": "TTE-C-0654",
    "descripcion": "Proyecto 5B: Rehabilitación y extensión de cinta JD-9021 y rehabilitación del carro PA-54108 para conexión de JD-1809 con JD-8012 PMH - FMO (VISCO ORINOCO)",
    "meses": [
      19319.66,
      102788.06,
      4258.21,
      78830,
      0,
      0,
      0,
      290,
      134354.59
    ],
    "byCategoriaMes": [
      {
        "Materiales Directos": 17800.89,
        "Servicios": 1518.77,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 99374.42,
        "Servicios": 115.02,
        "Mano de Obra Directa": 250,
        "Horas Maquina": 0,
        "Costos Indirectos": 3048.62
      },
      {
        "Materiales Directos": 4258.21,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 78830,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 290,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 134206.78,
        "Servicios": 147.81,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      }
    ],
    "totalAnual": 339840.52
  },
  "TTE-C-0699": {
    "cuentaAuxiliar": "TTE-C-0699",
    "descripcion": "Fabricación e Instalación de 120 Pigtails del Reformador 3 de Planta de Briquetas FMO (VISCO ORINOCO)",
    "meses": [
      0,
      72,
      38764.83,
      22800,
      3610,
      0,
      0,
      0,
      0
    ],
    "byCategoriaMes": [
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 72,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 37664.83,
        "Servicios": 1100,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 22800,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 3610,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      }
    ],
    "totalAnual": 65246.83
  },
  "TTE-C-0657": {
    "cuentaAuxiliar": "TTE-C-0657",
    "descripcion": "Reparación estructural de cribas TYCAN M990 T-Class para planta de trituración los barrancos (PTLB)  CR-009 y  CR-010. – Ciudad Piar (VISCO ORINOCO)",
    "meses": [
      0,
      0,
      0.28,
      0,
      0,
      0,
      0,
      0,
      0
    ],
    "byCategoriaMes": [
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0.28,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      }
    ],
    "totalAnual": 0.28
  },
  "TTE-C-0678": {
    "cuentaAuxiliar": "TTE-C-0678",
    "descripcion": "Proyecto Pila HA y HB, suministro e instalación de apilador y recuperador de cangilones FMO-PMH (VISCO ORINOCO)",
    "meses": [
      1670.54,
      13002.73,
      101178.14,
      46648.46,
      23043.79,
      37364.23,
      35468.66,
      31448.24,
      44533.03
    ],
    "byCategoriaMes": [
      {
        "Materiales Directos": 0,
        "Servicios": 37.98,
        "Mano de Obra Directa": 1050,
        "Horas Maquina": 0,
        "Costos Indirectos": 582.56
      },
      {
        "Materiales Directos": 3826.06,
        "Servicios": 54.5,
        "Mano de Obra Directa": 5475,
        "Horas Maquina": 660,
        "Costos Indirectos": 2987.17
      },
      {
        "Materiales Directos": 42495.56,
        "Servicios": 0,
        "Mano de Obra Directa": 12546,
        "Horas Maquina": 36345.75,
        "Costos Indirectos": 9790.83
      },
      {
        "Materiales Directos": 12815.99,
        "Servicios": 66,
        "Mano de Obra Directa": 14625,
        "Horas Maquina": 9662.25,
        "Costos Indirectos": 9479.22
      },
      {
        "Materiales Directos": 9623.69,
        "Servicios": 6,
        "Mano de Obra Directa": 7564.18,
        "Horas Maquina": 1127.91,
        "Costos Indirectos": 4722.01
      },
      {
        "Materiales Directos": 6586.25,
        "Servicios": 22,
        "Mano de Obra Directa": 15821.61,
        "Horas Maquina": 55.82,
        "Costos Indirectos": 14878.55
      },
      {
        "Materiales Directos": 14081.63,
        "Servicios": 1268,
        "Mano de Obra Directa": 9875,
        "Horas Maquina": 0,
        "Costos Indirectos": 10244.03
      },
      {
        "Materiales Directos": 1645.68,
        "Servicios": 102.5,
        "Mano de Obra Directa": 15345.16,
        "Horas Maquina": 0,
        "Costos Indirectos": 14354.9
      },
      {
        "Materiales Directos": 23864.03,
        "Servicios": 248.45,
        "Mano de Obra Directa": 350,
        "Horas Maquina": 0,
        "Costos Indirectos": 20070.55
      }
    ],
    "totalAnual": 334357.82
  },
  "TTE-C-0694": {
    "cuentaAuxiliar": "TTE-C-0694",
    "descripcion": "Suministro e Instalación de la Caldera BF-6002 para el Area 6000 de Planta de Briquetas FMO (VISCO ORINICO)",
    "meses": [
      0,
      0,
      0,
      17.69,
      803.14,
      1340369.04,
      102884.75,
      13139.63,
      70427.77
    ],
    "byCategoriaMes": [
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 17.69,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 789.14,
        "Servicios": 14,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 200344.04,
        "Servicios": 1139000,
        "Mano de Obra Directa": 1025,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 8457.29,
        "Servicios": 85051.72,
        "Mano de Obra Directa": 4080,
        "Horas Maquina": 0,
        "Costos Indirectos": 5295.74
      },
      {
        "Materiales Directos": 4876.17,
        "Servicios": 0,
        "Mano de Obra Directa": 4445,
        "Horas Maquina": 0,
        "Costos Indirectos": 3818.46
      },
      {
        "Materiales Directos": 57819.34,
        "Servicios": 3849.59,
        "Mano de Obra Directa": 3420,
        "Horas Maquina": 0,
        "Costos Indirectos": 5338.84
      }
    ],
    "totalAnual": 1527642.02
  },
  "TTE-C-0711": {
    "cuentaAuxiliar": "TTE-C-0711",
    "descripcion": "Servicio de retirada de modulos electricos actuales e instalacion de nuevos modulos suministrados por VISCO - TH4 - PMH - FMO (VISCO ORINOCO)",
    "meses": [
      0,
      0,
      0,
      0,
      829.39,
      3291.62,
      2103.2,
      334.06,
      2313.2
    ],
    "byCategoriaMes": [
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 829.39,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 232.81,
        "Servicios": 0,
        "Mano de Obra Directa": 1470,
        "Horas Maquina": 0,
        "Costos Indirectos": 1588.81
      },
      {
        "Materiales Directos": 2103.2,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 334.06,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 2313.2,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      }
    ],
    "totalAnual": 8871.47
  },
  "TTE-C-0670": {
    "cuentaAuxiliar": "TTE-C-0670",
    "descripcion": "Servicio de mantenimiento Maquinas Briqueteras - Planta de Briquetas (VISCO ORINOCO)",
    "meses": [
      17030.81,
      11128.86,
      10827.99,
      7774.96,
      8673.34,
      5304.22,
      11116.18,
      15180.38,
      24712.32
    ],
    "byCategoriaMes": [
      {
        "Materiales Directos": 6707.11,
        "Servicios": 84.5,
        "Mano de Obra Directa": 6585.47,
        "Horas Maquina": 0,
        "Costos Indirectos": 3653.73
      },
      {
        "Materiales Directos": 2310.15,
        "Servicios": 0,
        "Mano de Obra Directa": 5129.1,
        "Horas Maquina": 0,
        "Costos Indirectos": 3689.61
      },
      {
        "Materiales Directos": 1690.14,
        "Servicios": 0,
        "Mano de Obra Directa": 5132.5,
        "Horas Maquina": 0,
        "Costos Indirectos": 4005.35
      },
      {
        "Materiales Directos": 1487.23,
        "Servicios": 0,
        "Mano de Obra Directa": 3815,
        "Horas Maquina": 0,
        "Costos Indirectos": 2472.73
      },
      {
        "Materiales Directos": 874.13,
        "Servicios": 0,
        "Mano de Obra Directa": 4480,
        "Horas Maquina": 0,
        "Costos Indirectos": 3319.21
      },
      {
        "Materiales Directos": 210.16,
        "Servicios": 0,
        "Mano de Obra Directa": 3448.41,
        "Horas Maquina": 0,
        "Costos Indirectos": 1645.65
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 4860.4,
        "Horas Maquina": 0,
        "Costos Indirectos": 6255.78
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 4770,
        "Horas Maquina": 0,
        "Costos Indirectos": 10410.38
      },
      {
        "Materiales Directos": 6736.86,
        "Servicios": 0,
        "Mano de Obra Directa": 3420,
        "Horas Maquina": 0,
        "Costos Indirectos": 14555.46
      }
    ],
    "totalAnual": 111749.06
  },
  "TTE-C-0663": {
    "cuentaAuxiliar": "TTE-C-0663",
    "descripcion": "Reacondicionamiento etapa III en Boca Grande 2  / Refurbish stage III - in BCII (Generators AGG) (VISCO ORINOCO)",
    "meses": [
      0,
      0,
      0,
      0,
      120,
      0,
      10,
      665,
      753.7
    ],
    "byCategoriaMes": [
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 120,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 10,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 35,
        "Servicios": 630,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 753.7,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      }
    ],
    "totalAnual": 1548.7
  },
  "TTE-C-0700": {
    "cuentaAuxiliar": "TTE-C-0700",
    "descripcion": "Fabricación de placas y ancajes (ORINOCO)",
    "meses": [
      0,
      0,
      614.86,
      20501.11,
      726.69,
      245.22,
      0,
      0,
      0
    ],
    "byCategoriaMes": [
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 614.86,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 20426.11,
        "Servicios": 75,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 726.69,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 245.22,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      }
    ],
    "totalAnual": 22087.88
  },
  "TTE-C-0704": {
    "cuentaAuxiliar": "TTE-C-0704",
    "descripcion": "Segundo Lote - Fabricación de placas y ancajes (ORINOCO)",
    "meses": [
      0,
      0,
      0,
      1428.72,
      12496.62,
      23420.76,
      291.02,
      0,
      280
    ],
    "byCategoriaMes": [
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 1428.72,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 12496.62,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 23420.76,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 291.02,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 280,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      }
    ],
    "totalAnual": 37917.12
  },
  "TTE-C-0681": {
    "cuentaAuxiliar": "TTE-C-0681",
    "descripcion": "Adicionales Proyecto 2da linea de Planta de Pellas (VISCO ORINOCO)",
    "meses": [
      1541.46,
      2896.35,
      13.7,
      4.28,
      244.21,
      0,
      34.99,
      0,
      0
    ],
    "byCategoriaMes": [
      {
        "Materiales Directos": 1281.5,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 259.96,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 2896.35,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 13.7,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 4.28,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 4.21,
        "Servicios": 240,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 34.99,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      }
    ],
    "totalAnual": 4734.99
  },
  "TTE-C-0642": {
    "cuentaAuxiliar": "TTE-C-0642",
    "descripcion": "Rehabilitation of ship loader / Rehabilitación de Carga Barco FMO (VISCO ORINOCO)",
    "meses": [
      171.44,
      0.8,
      0,
      246.44,
      0,
      0,
      243.59,
      358.91,
      216.12
    ],
    "byCategoriaMes": [
      {
        "Materiales Directos": 171.44,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0.8,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 246.44,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 243.59,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 358.91,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 216.12,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      }
    ],
    "totalAnual": 1237.3
  },
  "TTE-C-0672": {
    "cuentaAuxiliar": "TTE-C-0672",
    "descripcion": "Extensión de banda transportadora JD 8016A y JD 8016B PMH – FMO (VISCO ORINOCO)",
    "meses": [
      148.56,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      2920.3
    ],
    "byCategoriaMes": [
      {
        "Materiales Directos": 148.56,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 2920.3,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      }
    ],
    "totalAnual": 3068.86
  },
  "TTE-C-0707": {
    "cuentaAuxiliar": "TTE-C-0707",
    "descripcion": "Lote 4 - Proyecto cerro redondo - Componentes empotrados para la parte de construcción civil del sistema de procesamiento de minerales (ORINOCO)",
    "meses": [
      0,
      0,
      0,
      0,
      4236.54,
      4139.29,
      34.99,
      0,
      0
    ],
    "byCategoriaMes": [
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 4236.54,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 4072.33,
        "Servicios": 66.96,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 34.99,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      }
    ],
    "totalAnual": 8410.82
  },
  "TTE-C-0666": {
    "cuentaAuxiliar": "TTE-C-0666",
    "descripcion": "Reparacion de pista o canales para enrrollar la guaya del eje del empujador de vagones FMO-PMH (VISCO ORINOCO)",
    "meses": [
      0,
      0,
      0,
      0,
      0,
      298.91,
      74.07,
      0,
      0
    ],
    "byCategoriaMes": [
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 298.91,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 74.07,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      }
    ],
    "totalAnual": 372.98
  },
  "TTE-C-0692": {
    "cuentaAuxiliar": "TTE-C-0692",
    "descripcion": "Adicionales Mantenimiento BG",
    "meses": [
      0,
      8000,
      17508.73,
      0,
      0,
      0,
      0,
      0,
      0
    ],
    "byCategoriaMes": [
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 8000,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 33.73,
        "Servicios": 17475,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      }
    ],
    "totalAnual": 25508.73
  },
  "TTE-C-0649": {
    "cuentaAuxiliar": "TTE-C-0649",
    "descripcion": "Rehabilitación de -Boca Grande 2 (VISCO ORINOCO)",
    "meses": [
      0,
      1164,
      430.72,
      0,
      0,
      0,
      0,
      0,
      163146.75
    ],
    "byCategoriaMes": [
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 1164,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 430.72,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 163146.75,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      }
    ],
    "totalAnual": 164741.47
  },
  "TTE-C-0691": {
    "cuentaAuxiliar": "TTE-C-0691",
    "descripcion": "Reparacion de la Grua #1 en la estacion de transferencia de Boca Grande II (VISCO ORINOCO)",
    "meses": [
      17996.1,
      19943.75,
      10105.25,
      0,
      0,
      0,
      0,
      0,
      0
    ],
    "byCategoriaMes": [
      {
        "Materiales Directos": 496.1,
        "Servicios": 17500,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 1998.75,
        "Servicios": 17420,
        "Mano de Obra Directa": 525,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 10105.25,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      }
    ],
    "totalAnual": 48045.1
  },
  "TTE-C-0603": {
    "cuentaAuxiliar": "TTE-C-0603",
    "descripcion": "Mantenimiento / Reparación de 08 Motores Hidráulicos Flender 515 (Venprecar)",
    "meses": [
      0,
      0,
      0,
      0,
      0,
      0,
      19.61,
      0,
      0
    ],
    "byCategoriaMes": [
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 19.61,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      }
    ],
    "totalAnual": 19.61
  },
  "TTE-C-0679": {
    "cuentaAuxiliar": "TTE-C-0679",
    "descripcion": "Levantamiento y reparación de apilador PA-9016 FMO-PMH (VISCO ORINOCO)",
    "meses": [
      0,
      0,
      2202,
      0,
      0,
      0,
      0,
      0,
      0
    ],
    "byCategoriaMes": [
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 2202,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      }
    ],
    "totalAnual": 2202
  },
  "TTE-C-0689": {
    "cuentaAuxiliar": "TTE-C-0689",
    "descripcion": "Rehabilitación de eje y conjunto de rodamientos (DELL’ ACQUA)",
    "meses": [
      193.71,
      0,
      17.9,
      0,
      0,
      0,
      0,
      0,
      0
    ],
    "byCategoriaMes": [
      {
        "Materiales Directos": 193.71,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 17.9,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      }
    ],
    "totalAnual": 211.61
  },
  "TTE-C-0705": {
    "cuentaAuxiliar": "TTE-C-0705",
    "descripcion": "Pieza adicional MA - Fabricación de placas y anclajes (ORINOCO)",
    "meses": [
      0,
      0,
      0,
      13089.89,
      261.93,
      0,
      0,
      0,
      0
    ],
    "byCategoriaMes": [
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 13089.89,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 261.93,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      }
    ],
    "totalAnual": 13351.82
  },
  "TTE-C-0713": {
    "cuentaAuxiliar": "TTE-C-0713",
    "descripcion": "Lote 5 - Proyecto cerro redondo componente empotrados para la parte de construcción civil del sistema de procesamiento de minerales (ORINOCO)",
    "meses": [
      0,
      0,
      0,
      0,
      0,
      0,
      145.24,
      0,
      0
    ],
    "byCategoriaMes": [
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 145.24,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      }
    ],
    "totalAnual": 145.24
  },
  "TTE-C-0684": {
    "cuentaAuxiliar": "TTE-C-0684",
    "descripcion": "Fabricación de Gamelas FMO-PMH (VISCO ORINOCO)",
    "meses": [
      0,
      0,
      0,
      0,
      0,
      0,
      1894.72,
      2143.13,
      2996.48
    ],
    "byCategoriaMes": [
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 930,
        "Horas Maquina": 0,
        "Costos Indirectos": 964.72
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 2143.13
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 2996.48
      }
    ],
    "totalAnual": 7034.33
  },
  "TTE-C-0675": {
    "cuentaAuxiliar": "TTE-C-0675",
    "descripcion": "Reparación motor / reductor de polea motriz boom conveyor - BG II (VISCO ORINOCO)",
    "meses": [
      0,
      2.47,
      0,
      0,
      0,
      0,
      0,
      0,
      5.04
    ],
    "byCategoriaMes": [
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 2.47,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 5.04,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      }
    ],
    "totalAnual": 7.51
  },
  "TTE-C-0683": {
    "cuentaAuxiliar": "TTE-C-0683",
    "descripcion": "Fase 3 Planta de Briquetas - FMO (VISCO ORINOCO)",
    "meses": [
      5,
      0,
      45,
      0,
      0,
      0,
      0,
      0,
      0
    ],
    "byCategoriaMes": [
      {
        "Materiales Directos": -10,
        "Servicios": 15,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 45,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      }
    ],
    "totalAnual": 50
  },
  "TTE-C-0698": {
    "cuentaAuxiliar": "TTE-C-0698",
    "descripcion": "Reentubado de un (1) Generador de Vapor de Planta de Briquetas FMO (VISCO ORINOCO)",
    "meses": [
      0,
      0,
      2600,
      162,
      0,
      0,
      0,
      0,
      0
    ],
    "byCategoriaMes": [
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 2600,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 150,
        "Servicios": 12,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      }
    ],
    "totalAnual": 2762
  },
  "TTE-C-0673": {
    "cuentaAuxiliar": "TTE-C-0673",
    "descripcion": "Reparación de polea de izaje grúa #3 BOCA GRANDE E/T (VISCO ORINOCO)",
    "meses": [
      16,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      95.36
    ],
    "byCategoriaMes": [
      {
        "Materiales Directos": 16,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 95.36,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      }
    ],
    "totalAnual": 111.36
  },
  "TTE-C-0710": {
    "cuentaAuxiliar": "TTE-C-0710",
    "descripcion": "Tratamiento y Análisis del Aceite de los Transformadores de Planta de Briquetas FMO (VISCO ORINOCO)",
    "meses": [
      0,
      0,
      0,
      0,
      0,
      0,
      79600,
      0,
      0
    ],
    "byCategoriaMes": [
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 79600,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      }
    ],
    "totalAnual": 79600
  },
  "TTE-C-0703": {
    "cuentaAuxiliar": "TTE-C-0703",
    "descripcion": "Servicio reparación moto vibradores tolvas BGII (VISCO ORINOCO)",
    "meses": [
      0,
      0,
      0,
      1210,
      0,
      0,
      0,
      0,
      0
    ],
    "byCategoriaMes": [
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 1210,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      }
    ],
    "totalAnual": 1210
  },
  "TTE-C-0578": {
    "cuentaAuxiliar": "TTE-C-0578",
    "descripcion": "Reconstrucción de aspas de agitadores del área 41 (Bauxilum)",
    "meses": [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      34.2
    ],
    "byCategoriaMes": [
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 34.2,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      }
    ],
    "totalAnual": 34.2
  },
  "TTE-C-0667": {
    "cuentaAuxiliar": "TTE-C-0667",
    "descripcion": "Reparaciones principales en Top Gas Scrubber - Planta de Briquetas",
    "meses": [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      112.44
    ],
    "byCategoriaMes": [
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 112.44,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      }
    ],
    "totalAnual": 112.44
  },
  "TTE-C-0702": {
    "cuentaAuxiliar": "TTE-C-0702",
    "descripcion": "Suministro y reemplazo de elementos mecánicos",
    "meses": [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      1869.66
    ],
    "byCategoriaMes": [
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 1869.66,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      }
    ],
    "totalAnual": 1869.66
  },
  "TTE-C-0677": {
    "cuentaAuxiliar": "TTE-C-0677",
    "descripcion": "Mantenimiento y Reparaciones Estructurales",
    "meses": [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      45606.53
    ],
    "byCategoriaMes": [
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 45606.53,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      }
    ],
    "totalAnual": 45606.53
  },
  "TTE-C-0718": {
    "cuentaAuxiliar": "TTE-C-0718",
    "descripcion": "Arandela de presión M20 DIN-127 Pavonada",
    "meses": [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      1533.2
    ],
    "byCategoriaMes": [
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 1495.2,
        "Servicios": 38,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      }
    ],
    "totalAnual": 1533.2
  },
  "TTE-C-0651": {
    "cuentaAuxiliar": "TTE-C-0651",
    "descripcion": "Mantenimiento preventivo y correctivo PMH",
    "meses": [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      5662.69
    ],
    "byCategoriaMes": [
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 5662.69,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      }
    ],
    "totalAnual": 5662.69
  },
  "TTE-C-0638": {
    "cuentaAuxiliar": "TTE-C-0638",
    "descripcion": "Mantenimiento de tuberías y conexiones de vapor",
    "meses": [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      38.17
    ],
    "byCategoriaMes": [
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 38.17,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      }
    ],
    "totalAnual": 38.17
  },
  "TTE-C-0624": {
    "cuentaAuxiliar": "TTE-C-0624",
    "descripcion": "Servicio de inspección y calibración de instrumentación",
    "meses": [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      12.49
    ],
    "byCategoriaMes": [
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 0,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      },
      {
        "Materiales Directos": 12.49,
        "Servicios": 0,
        "Mano de Obra Directa": 0,
        "Horas Maquina": 0,
        "Costos Indirectos": 0
      }
    ],
    "totalAnual": 12.49
  }
};
