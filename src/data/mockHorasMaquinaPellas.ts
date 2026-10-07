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
    descripcion: 'Se totalizaron 1.396 horas de uso de maquinaria asociadas a la cuenta auxiliar TTE-C-0706.'
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
