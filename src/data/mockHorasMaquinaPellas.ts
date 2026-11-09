// Matriz Oficial de Horas Máquina para el Proyecto Pellas Línea 1 (TTE-C-0706)
// Coincidencia exacta con la lámina oficial de la Presentación de PowerPoint de Costos TIMACA
// (Slide: PROYECTO PELLAS 1: HORAS MÁQUINA)

export interface FilaHorasMaquinaPellas {
  cuentaAux: string;
  codigo: string;
  equipo: string;
  tarifa: number;
  totalHM: number;
  costoTotalHM: number;
  subcategoria: string;
  motivoTipico: string;
}

export const TABLA_HORAS_MAQUINA_PELLAS_OFICIAL: FilaHorasMaquinaPellas[] = [
  {
    cuentaAux: 'TTE-C-0706',
    codigo: 'GR20',
    equipo: 'Grúa Demag AC200',
    tarifa: 190.21,
    totalHM: 163.5,
    costoTotalHM: 31099,
    subcategoria: 'Grúas Industriales y Alto Tonelaje',
    motivoTipico: 'Izaje pesado de vigas y montaje estructural de hornos (equipo principal de la flota)'
  },
  {
    cuentaAux: 'TTE-C-0706',
    codigo: 'PA01',
    equipo: 'Payloader Hyundai HL760',
    tarifa: 80.00,
    totalHM: 112.7,
    costoTotalHM: 9016,
    subcategoria: 'Movimiento de Tierra y Carga Pesada',
    motivoTipico: 'Carga y desalojo de escombros, tierra y material a granel'
  },
  {
    cuentaAux: 'TTE-C-0706',
    codigo: 'RE02',
    equipo: 'Retroexcavadora Case 580SM',
    tarifa: 62.00,
    totalHM: 133.0,
    costoTotalHM: 8246,
    subcategoria: 'Movimiento de Tierra y Excavación',
    motivoTipico: 'Excavación de zanjas y adecuación de fundaciones'
  },
  {
    cuentaAux: 'TTE-C-0706',
    codigo: 'CH09',
    equipo: 'Chuto Mack Granite',
    tarifa: 100.00,
    totalHM: 50.5,
    costoTotalHM: 5050,
    subcategoria: 'Transporte Pesado y Chutos',
    motivoTipico: 'Flete y traslado de bateas con piezas estructurales pesadas a planta'
  },
  {
    cuentaAux: 'TTE-C-0706',
    codigo: 'CA09',
    equipo: 'Camión Pickman Ford Cargo 1721',
    tarifa: 36.20,
    totalHM: 136.4,
    costoTotalHM: 4938,
    subcategoria: 'Transporte y Distribución en Obra',
    motivoTipico: 'Apoyo logístico, acarreo de insumos y movilización de cuadrillas'
  },
  {
    cuentaAux: 'TTE-C-0706',
    codigo: 'MC09',
    equipo: 'Montacarga Hyster H16.00XM',
    tarifa: 44.10,
    totalHM: 110.2,
    costoTotalHM: 4860,
    subcategoria: 'Equipos de Levante y Maniobra',
    motivoTipico: 'Descarga y estibado de perfiles y planchas en patio de acopio'
  },
  {
    cuentaAux: 'TTE-C-0706',
    codigo: 'TH01',
    equipo: 'Telehandler Genie GTH',
    tarifa: 39.56,
    totalHM: 99.2,
    costoTotalHM: 3924,
    subcategoria: 'Manipulación Telescópica y Levante',
    motivoTipico: 'Elevación y posicionado de materiales en alturas intermedias'
  },
  {
    cuentaAux: 'TTE-C-0706',
    codigo: 'CA04',
    equipo: 'Camión Plataforma Ford Cargo 815',
    tarifa: 27.90,
    totalHM: 135.2,
    costoTotalHM: 3772,
    subcategoria: 'Transporte y Plataformas',
    motivoTipico: 'Despacho interno de herramientas y materiales livianos a frentes de obra'
  },
  {
    cuentaAux: 'TTE-C-0706',
    codigo: 'CA14',
    equipo: 'Camión Plataforma Ford Cargo 1721',
    tarifa: 34.10,
    totalHM: 88.9,
    costoTotalHM: 3031,
    subcategoria: 'Transporte y Plataformas',
    motivoTipico: 'Movilización de componentes estructurales menores y ductos'
  },
  {
    cuentaAux: 'TTE-C-0706',
    codigo: 'GR10',
    equipo: 'Grúa Móvil P&H R200',
    tarifa: 46.75,
    totalHM: 59.2,
    costoTotalHM: 2768,
    subcategoria: 'Grúas Móviles y Telescópicas',
    motivoTipico: 'Izaje en frentes secundarios de tolvas y galerías'
  },
  {
    cuentaAux: 'TTE-C-0706',
    codigo: 'GR21',
    equipo: 'Camión Liebherr LTM1400',
    tarifa: 174.20,
    totalHM: 10.0,
    costoTotalHM: 1742,
    subcategoria: 'Grúas Industriales y Alto Tonelaje',
    motivoTipico: 'Posicionamiento puntual de vigas maestras'
  },
  {
    cuentaAux: 'TTE-C-0706',
    codigo: 'ML04',
    equipo: 'Manlift JLG 660SJ',
    tarifa: 34.95,
    totalHM: 49.0,
    costoTotalHM: 1713,
    subcategoria: 'Equipos de Acceso en Altura',
    motivoTipico: 'Trabajos en altura para soldadores y montadores de estructuras'
  },
  {
    cuentaAux: 'TTE-C-0706',
    codigo: 'GR21',
    equipo: 'Grúa Liebherr LTM1140',
    tarifa: 174.20,
    totalHM: 9.8,
    costoTotalHM: 1707,
    subcategoria: 'Grúas Industriales y Alto Tonelaje',
    motivoTipico: 'Montaje de tramos superiores de chimenea y quemadores'
  },
  {
    cuentaAux: 'TTE-C-0706',
    codigo: 'CH08',
    equipo: 'Chuto Mack Granite',
    tarifa: 100.00,
    totalHM: 15.9,
    costoTotalHM: 1590,
    subcategoria: 'Transporte Pesado y Chutos',
    motivoTipico: 'Traslado de gandolas con refractarios y vigas carril'
  },
  {
    cuentaAux: 'TTE-C-0706',
    codigo: 'GR20',
    equipo: 'Camión Demag LTM1400',
    tarifa: 190.21,
    totalHM: 7.9,
    costoTotalHM: 1503,
    subcategoria: 'Grúas Industriales y Alto Tonelaje',
    motivoTipico: 'Asistencia y soporte en maniobra de izaje crítico'
  },
  {
    cuentaAux: 'TTE-C-0706',
    codigo: 'MN01',
    equipo: 'Motoniveladora John Deere 670G',
    tarifa: 45.00,
    totalHM: 30.9,
    costoTotalHM: 1391,
    subcategoria: 'Movimiento de Tierra y Vías',
    motivoTipico: 'Nivelación y adecuación de patios de maniobras y accesos de planta'
  },
  {
    cuentaAux: 'TTE-C-0706',
    codigo: 'CH05',
    equipo: 'Chuto Mack CH613',
    tarifa: 11.02,
    totalHM: 100.0,
    costoTotalHM: 1102,
    subcategoria: 'Transporte Pesado y Chutos',
    motivoTipico: 'Traslados internos de campamento a frente de obra'
  },
  {
    cuentaAux: 'TTE-C-0706',
    codigo: 'MC11',
    equipo: 'Montacarga Heli 7.0T Serie H',
    tarifa: 23.57,
    totalHM: 32.6,
    costoTotalHM: 768,
    subcategoria: 'Equipos de Levante y Maniobra',
    motivoTipico: 'Movilización de pallets de electrodos, consumibles y cajas de pernos'
  },
  {
    cuentaAux: 'TTE-C-0706',
    codigo: 'GR13',
    equipo: 'Grúa Móvil Grove RT 75S',
    tarifa: 78.50,
    totalHM: 8.3,
    costoTotalHM: 652,
    subcategoria: 'Grúas Móviles de Terreno Difícil',
    motivoTipico: 'Izaje en terreno no pavimentado de área de pellas'
  },
  {
    cuentaAux: 'TTE-C-0706',
    codigo: 'GR03',
    equipo: 'Grúa Móvil P&H R180',
    tarifa: 40.35,
    totalHM: 9.1,
    costoTotalHM: 367,
    subcategoria: 'Grúas Móviles y Telescópicas',
    motivoTipico: 'Montaje de ductos menores y soportería'
  },
  {
    cuentaAux: 'TTE-C-0706',
    codigo: 'PA02',
    equipo: 'Minicargador Bobcat 843',
    tarifa: 10.00,
    totalHM: 31.1,
    costoTotalHM: 311,
    subcategoria: 'Equipos Menores de Limpieza y Carga',
    motivoTipico: 'Limpieza de áreas confinadas bajo tolvas y cintas transportadoras'
  },
  {
    cuentaAux: 'TTE-C-0706',
    codigo: 'CH06',
    equipo: 'Chuto Mack Granite',
    tarifa: 100.00,
    totalHM: 2.4,
    costoTotalHM: 240,
    subcategoria: 'Transporte Pesado y Chutos',
    motivoTipico: 'Movilización rápida de plataforma de herramientas y equipos menores'
  }
];

export const TOTALES_HORAS_MAQUINA_PELLAS = {
  totalHoras: 1396,
  totalCosto: 89789
};

export const NOTAS_HORAS_MAQUINA_PELLAS = [
  {
    titulo: 'Volumen de Operación',
    descripcion: 'Se totalizaron 1.396 horas de uso de maquinaria asociadas a la cuenta auxiliar TTE-C-0706 en agosto.'
  },
  {
    titulo: 'Grúa Demag AC200 (Equipo Principal)',
    descripcion: 'Encabeza los costos no solo por su intensidad de uso (163,5 horas), sino también por tener la tarifa hora/máquina más elevada de la flota ($190,21/h).'
  },
  {
    titulo: 'Distribución de la Flota',
    descripcion: 'La operación requirió una combinación de equipos pesados de izaje (grúas móviles y telescópicas), movimiento de tierra (retroexcavadoras, payloader, motoniveladora) y logística/transporte (chutos y camiones plataforma).'
  }
];

// TABLA OFICIAL EXACTA DE HORAS MÁQUINA PELLAS LÍNEA 1 - SEPTIEMBRE 2026 ($55.578 USD · 812 H/M)
// Depurada: Excluidos todos los equipos con horas en cero por solicitud de Gerencia de Costos
export const TABLA_HORAS_MAQUINA_PELLAS_SEPTIEMBRE_OFICIAL: FilaHorasMaquinaPellas[] = [
  {
    cuentaAux: 'TTE-C-0706',
    codigo: 'GR20',
    equipo: 'Grúa Demag AC200 - 200TN',
    tarifa: 190.21,
    totalHM: 130.6,
    costoTotalHM: 24841,
    subcategoria: 'Grúas Industriales y Alto Tonelaje',
    motivoTipico: 'Izaje pesado de vigas y montaje estructural de hornos (equipo principal de la flota)'
  },
  {
    cuentaAux: 'TTE-C-0706',
    codigo: 'CH09',
    equipo: 'Chuto Mack Granite',
    tarifa: 100.00,
    totalHM: 68.6,
    costoTotalHM: 6860,
    subcategoria: 'Transporte Pesado y Chutos',
    motivoTipico: 'Flete y traslado de piezas estructurales pesadas a planta'
  },
  {
    cuentaAux: 'TTE-C-0706',
    codigo: 'RE02',
    equipo: 'Retroexcavadora Case 580M Serie 2 Turbo',
    tarifa: 62.00,
    totalHM: 61.7,
    costoTotalHM: 3825,
    subcategoria: 'Movimiento de Tierra y Excavación',
    motivoTipico: 'Excavación de zanjas y adecuación de fundaciones'
  },
  {
    cuentaAux: 'TTE-C-0706',
    codigo: 'CA03',
    equipo: 'Camión Plataforma Ford Cargo 815',
    tarifa: 27.90,
    totalHM: 130.0,
    costoTotalHM: 3627,
    subcategoria: 'Transporte Liviano y Logística',
    motivoTipico: 'Distribución interna de repuestos y materiales de taller'
  },
  {
    cuentaAux: 'TTE-C-0706',
    codigo: 'CA09',
    equipo: 'Camión Pickman Ford Cargo 1721',
    tarifa: 36.20,
    totalHM: 94.8,
    costoTotalHM: 3432,
    subcategoria: 'Transporte Mediano y Maniobras',
    motivoTipico: 'Traslado de suministros y cuadrillas a frentes de trabajo'
  },
  {
    cuentaAux: 'TTE-C-0706',
    codigo: 'MC09',
    equipo: 'Montacarga Hyster H16.00XM-6 - 16TN',
    tarifa: 44.10,
    totalHM: 66.8,
    costoTotalHM: 2946,
    subcategoria: 'Equipos de Izaje y Carga en Patio',
    motivoTipico: 'Movilización de paquetes de perfiles y aceros pesados en patio'
  },
  {
    cuentaAux: 'TTE-C-0706',
    codigo: 'TH01',
    equipo: 'Telehandler Genie GTH-4013',
    tarifa: 39.56,
    totalHM: 65.8,
    costoTotalHM: 2603,
    subcategoria: 'Manipuladores Telescópicos',
    motivoTipico: 'Posicionamiento en altura de componentes mecánicos y tuberías'
  },
  {
    cuentaAux: 'TTE-C-0706',
    codigo: 'CA08',
    equipo: 'Camión Plataforma Ford Cargo 1721',
    tarifa: 34.10,
    totalHM: 65.3,
    costoTotalHM: 2227,
    subcategoria: 'Transporte Mediano y Maniobras',
    motivoTipico: 'Logística de despacho de materiales de almacén a frentes de montaje'
  },
  {
    cuentaAux: 'TTE-C-0706',
    codigo: 'GR14',
    equipo: 'Grúa Liebherr LTM1140 - 140TN',
    tarifa: 174.20,
    totalHM: 8.0,
    costoTotalHM: 1394,
    subcategoria: 'Grúas Industriales y Alto Tonelaje',
    motivoTipico: 'Maniobras complejas de izaje en altura'
  },
  {
    cuentaAux: 'TTE-C-0706',
    codigo: 'GR02',
    equipo: 'Grúa Móvil P&H R200 - 20TN',
    tarifa: 46.75,
    totalHM: 25.7,
    costoTotalHM: 1201,
    subcategoria: 'Grúas Móviles y Telescópicas',
    motivoTipico: 'Izaje ligero y posicionamiento de estructuras auxiliares'
  },
  {
    cuentaAux: 'TTE-C-0706',
    codigo: 'MC07',
    equipo: 'Montacarga Heli 7.0T Serie H - 7TN',
    tarifa: 23.57,
    totalHM: 32.8,
    costoTotalHM: 773,
    subcategoria: 'Equipos de Izaje y Carga en Patio',
    motivoTipico: 'Descarga y estibado de materiales en almacenes temporales de obra'
  },
  {
    cuentaAux: 'TTE-C-0706',
    codigo: 'PA01',
    equipo: 'Payloader Hyundai HL760-7',
    tarifa: 80.00,
    totalHM: 8.8,
    costoTotalHM: 704,
    subcategoria: 'Movimiento de Tierra y Carga Pesada',
    motivoTipico: 'Carga y desalojo de escombros y material a granel'
  },
  {
    cuentaAux: 'TTE-C-0706',
    codigo: 'CH06',
    equipo: 'Chuto Mack CH613',
    tarifa: 11.02,
    totalHM: 47.1,
    costoTotalHM: 519,
    subcategoria: 'Transporte Pesado y Chutos',
    motivoTipico: 'Apoyo en traslado de bateas y equipos menores'
  },
  {
    cuentaAux: 'TTE-C-0706',
    codigo: 'GR07',
    equipo: 'Grúa Móvil Grove RT 75S - 50TN',
    tarifa: 78.50,
    totalHM: 4.0,
    costoTotalHM: 314,
    subcategoria: 'Grúas Móviles de Terreno Difícil',
    motivoTipico: 'Izaje en terreno no pavimentado de área de pellas'
  },
  {
    cuentaAux: 'TTE-C-0706',
    codigo: 'GR10',
    equipo: 'Grúa Liebherr LTM1100/1 - 100TN',
    tarifa: 181.00,
    totalHM: 1.3,
    costoTotalHM: 235,
    subcategoria: 'Grúas Industriales y Alto Tonelaje',
    motivoTipico: 'Montaje de precisión en estructuras críticas'
  },
  {
    cuentaAux: 'TTE-C-0706',
    codigo: 'CA20',
    equipo: 'Camión Demag LTM1400 - 200TN',
    tarifa: 190.21,
    totalHM: 0.4,
    costoTotalHM: 76,
    subcategoria: 'Transporte y Soporte de Grúas Mayores',
    motivoTipico: 'Soporte y traslado de contrapesos de grúa Demag'
  }
];

export const TOTALES_HORAS_MAQUINA_PELLAS_SEPTIEMBRE = {
  totalHoras: 812,
  totalCosto: 55578
};

export const NOTAS_HORAS_MAQUINA_PELLAS_SEPTIEMBRE = [
  {
    titulo: 'Optimización de Maquinaria Propia',
    descripcion: 'Se totalizaron 811,7 horas de uso de maquinaria pesada en septiembre ($55.578 USD), asignadas 100% a Pellas Línea 1 con una flota activa y eficiente de 16 equipos (depuradas todas las máquinas en cero).'
  },
  {
    titulo: 'Grúa Demag AC200 (Pilar de Izaje)',
    descripcion: 'Representa el 44,7% del costo total ($24.841 USD) con 130,6 horas acumuladas en maniobras críticas de izaje mecánico y posicionamiento de módulos.'
  },
  {
    titulo: 'Flota Pesada y Transporte Terrestre',
    descripcion: 'Los camiones plataforma (Ford Cargo 815 y 1721), chutos Mack Granite y retroexcavadoras Case garantizaron el suministro continuo de componentes de calderería y movimiento de tierra.'
  }
];

// TABLA DE HORAS MÁQUINA PELLAS LÍNEA 1 - OCTUBRE 2026 (PROVISIÓN TEMPORAL · $58.500 USD · 821 H/M)
// Provisión técnica estimada por continuidad de maniobras pesadas sujeta a reconciliación con horómetros finales
export const TABLA_HORAS_MAQUINA_PELLAS_OCTUBRE_OFICIAL: FilaHorasMaquinaPellas[] = [
  {
    cuentaAux: 'TTE-C-0706',
    codigo: 'GR20',
    equipo: 'Grúa Demag AC200 - 200TN (Provisión Temporal)',
    tarifa: 190.21,
    totalHM: 137.5,
    costoTotalHM: 26154,
    subcategoria: 'Grúas Industriales y Alto Tonelaje',
    motivoTipico: 'Izaje pesado de virolas y ensamble mecánico de hornos de calcinación'
  },
  {
    cuentaAux: 'TTE-C-0706',
    codigo: 'CH09',
    equipo: 'Chuto Mack Granite (Provisión Temporal)',
    tarifa: 100.00,
    totalHM: 72.2,
    costoTotalHM: 7220,
    subcategoria: 'Transporte Pesado y Chutos',
    motivoTipico: 'Flete y traslado de bateas y piezas estructurales pesadas a planta'
  },
  {
    cuentaAux: 'TTE-C-0706',
    codigo: 'RE02',
    equipo: 'Retroexcavadora Case 580M Serie 2 Turbo',
    tarifa: 62.00,
    totalHM: 65.0,
    costoTotalHM: 4030,
    subcategoria: 'Movimiento de Tierra y Excavación',
    motivoTipico: 'Excavación, canalizaciones y adecuación de fundaciones de soporte'
  },
  {
    cuentaAux: 'TTE-C-0706',
    codigo: 'CA03',
    equipo: 'Camión Plataforma Ford Cargo 815',
    tarifa: 27.90,
    totalHM: 136.8,
    costoTotalHM: 3817,
    subcategoria: 'Transporte Liviano y Logística',
    motivoTipico: 'Distribución interna de repuestos, electrodos y materiales de taller'
  },
  {
    cuentaAux: 'TTE-C-0706',
    codigo: 'CA09',
    equipo: 'Camión Pickman Ford Cargo 1721',
    tarifa: 36.20,
    totalHM: 99.8,
    costoTotalHM: 3613,
    subcategoria: 'Transporte Mediano y Maniobras',
    motivoTipico: 'Traslado continuo de suministros y cuadrillas a frentes de trabajo'
  },
  {
    cuentaAux: 'TTE-C-0706',
    codigo: 'MC09',
    equipo: 'Montacarga Hyster H16.00XM-6 - 16TN',
    tarifa: 44.10,
    totalHM: 70.3,
    costoTotalHM: 3100,
    subcategoria: 'Equipos de Izaje y Carga en Patio',
    motivoTipico: 'Movilización y estiba de perfiles estructurales en patio de acopio'
  },
  {
    cuentaAux: 'TTE-C-0706',
    codigo: 'TH01',
    equipo: 'Telehandler Genie GTH-4013',
    tarifa: 39.56,
    totalHM: 69.3,
    costoTotalHM: 2742,
    subcategoria: 'Manipuladores Telescópicos',
    motivoTipico: 'Posicionamiento y elevación de componentes mecánicos y ductos'
  },
  {
    cuentaAux: 'TTE-C-0706',
    codigo: 'CA08',
    equipo: 'Camión Plataforma Ford Cargo 1721',
    tarifa: 34.10,
    totalHM: 68.7,
    costoTotalHM: 2343,
    subcategoria: 'Transporte Mediano y Maniobras',
    motivoTipico: 'Despacho y logística de insumos de almacén a frentes de montaje'
  },
  {
    cuentaAux: 'TTE-C-0706',
    codigo: 'MN01',
    equipo: 'Motoniveladora John Deere 670G',
    tarifa: 45.00,
    totalHM: 31.0,
    costoTotalHM: 1395,
    subcategoria: 'Movimiento de Tierra y Vías',
    motivoTipico: 'Mantenimiento y nivelación de vías de circulación de grúas de 200TN'
  },
  {
    cuentaAux: 'TTE-C-0706',
    codigo: 'CH08',
    equipo: 'Chuto Mack Granite',
    tarifa: 100.00,
    totalHM: 12.0,
    costoTotalHM: 1200,
    subcategoria: 'Transporte Pesado y Chutos',
    motivoTipico: 'Traslado de gandolas con refractarios y vigas carril'
  },
  {
    cuentaAux: 'TTE-C-0706',
    codigo: 'GR21',
    equipo: 'Grúa Liebherr LTM1140 - 140TN',
    tarifa: 174.20,
    totalHM: 6.0,
    costoTotalHM: 1045,
    subcategoria: 'Grúas Industriales y Alto Tonelaje',
    motivoTipico: 'Montaje de tramos intermedios de chimeneas y conductos'
  },
  {
    cuentaAux: 'TTE-C-0706',
    codigo: 'MC11',
    equipo: 'Montacarga Heli 7.0T Serie H',
    tarifa: 23.57,
    totalHM: 32.0,
    costoTotalHM: 754,
    subcategoria: 'Equipos de Levante y Maniobra',
    motivoTipico: 'Acarreo de pallets de materiales consumibles y soldadura'
  },
  {
    cuentaAux: 'TTE-C-0706',
    codigo: 'MA01',
    equipo: 'Manlift JLG 660SJ',
    tarifa: 34.95,
    totalHM: 14.5,
    costoTotalHM: 507,
    subcategoria: 'Equipos de Acceso en Altura',
    motivoTipico: 'Trabajos de soldadura y torqueo en altura'
  },
  {
    cuentaAux: 'TTE-C-0706',
    codigo: 'GR07',
    equipo: 'Grúa Móvil Grove RT 75S - 50TN',
    tarifa: 78.50,
    totalHM: 4.0,
    costoTotalHM: 314,
    subcategoria: 'Grúas Móviles de Terreno Difícil',
    motivoTipico: 'Izaje en terreno no pavimentado de área de pellas'
  },
  {
    cuentaAux: 'TTE-C-0706',
    codigo: 'GR10',
    equipo: 'Grúa Liebherr LTM1100/1 - 100TN',
    tarifa: 181.00,
    totalHM: 1.0,
    costoTotalHM: 181,
    subcategoria: 'Grúas Industriales y Alto Tonelaje',
    motivoTipico: 'Montaje de precisión en estructuras críticas'
  },
  {
    cuentaAux: 'TTE-C-0706',
    codigo: 'CA20',
    equipo: 'Camión Demag LTM1400 - 200TN',
    tarifa: 190.21,
    totalHM: 0.4,
    costoTotalHM: 85,
    subcategoria: 'Transporte y Soporte de Grúas Mayores',
    motivoTipico: 'Soporte y traslado de contrapesos de grúa Demag'
  }
];

export const TOTALES_HORAS_MAQUINA_PELLAS_OCTUBRE = {
  totalHoras: 821,
  totalCosto: 58500
};

export const NOTAS_HORAS_MAQUINA_PELLAS_OCTUBRE = [
  {
    titulo: 'Provisión Técnica Temporal (Octubre)',
    descripcion: 'Se incorpora una provisión técnica estimada de $58.500 USD (820,5 H/M, +5,3% vs septiembre) por solicitud de Gerencia de Costos mientras se recibe el reporte oficial consolidado de horómetros de maquinaria pesada.'
  },
  {
    titulo: 'Grúa Demag AC200 (Equipo Principal)',
    descripcion: 'Concentra el 44,7% del costo estimado ($26.154 USD con 137,5 h) en izajes mecánicos pesados de virolas y hornos de Pellas.'
  },
  {
    titulo: 'Regularización sin Impacto Presupuestario',
    descripcion: 'El rubro está debidamente identificado como PROVISIÓN TEMPORAL y será ajustado al centavo contra los partes definitivos de campo en la conciliación del próximo corte mensual.'
  }
];


