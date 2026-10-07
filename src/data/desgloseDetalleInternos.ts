/**
 * Detalle Exhaustivo y Trazabilidad de Costos - Proyectos Internos (CAPEX / OPEX)
 * Conciliado con el informe oficial de Agosto 2026 de Alejandra Tesara (TIMACA)
 * y con Nuevo Dashboard - Proyectos Internos.xlsx
 */

export interface ItemDesgloseInterno {
  id: string;
  codigo: string;
  descripcion: string;
  especificacion?: string;
  categoria: 'Materiales Directos' | 'Servicios' | 'Mano de Obra Directa' | 'Horas Maquina' | 'Costos Indirectos';
  rubro?: string;
  cantidad?: number;
  unidadMedida?: string;
  montoUnitario?: number;
  montoTotal: number;
  proveedor?: string;
  solicitante?: string;
  motivo?: string;
  comprobanteSIP?: string;
  fecha?: string;
}

export interface DetalleCuentaOActivo {
  codigo: string;
  titulo: string;
  tipo: 'CAPEX' | 'OPEX_FLOTA' | 'OPEX_INFRA' | 'OPEX_MOD' | 'GRUA';
  montoAgosto: number;
  montoAcumulado2026?: number;
  variacionJulio?: string;
  responsableArea: string;
  descripcionGeneral: string;
  items: ItemDesgloseInterno[];
}

export const DESGLOSE_DETALLE_INTERNOS: Record<string, DetalleCuentaOActivo> = {
  // ====================== 1. INVERSIONES CAPEX ======================
  'TTI-C-0095': {
    codigo: 'TTI-C-0095',
    titulo: 'Obra Civil Edificio Administrativo',
    tipo: 'CAPEX',
    montoAgosto: 13164,
    montoAcumulado2026: 54276,
    variacionJulio: '-38%',
    responsableArea: 'Ingeniería & Proyectos Civiles TIMACA',
    descripcionGeneral: 'Construcción y adecuación integral de las nuevas oficinas administrativas de TIMACA. En agosto se ejecutó la estructura de perfiles HEA e instalación de fachadas de piedra sinterizada.',
    items: [
      {
        id: 'TTI-C-0095-01',
        codigo: 'HEA-200-S275',
        descripcion: 'Perfil Estructural HEA 200 S275JR (120 Metros)',
        especificacion: 'Vigas estructurales de soporte para mezanina y techos segundo piso',
        categoria: 'Materiales Directos',
        rubro: 'MATERIALES ACERO AL CARBONO',
        cantidad: 120,
        unidadMedida: 'M',
        montoUnitario: 54.33,
        montoTotal: 6520.00,
        proveedor: 'Siderúrgica del Turbio / Almacén Central',
        solicitante: 'Residencia de Obra Civil',
        motivo: 'Estructura portante segundo nivel edificio administrativo',
        comprobanteSIP: 'SIP-AGO-88214',
        fecha: '2026-08-11'
      },
      {
        id: 'TTI-C-0095-02',
        codigo: 'PIEDRA-SINT-3216',
        descripcion: 'Láminas de Piedra Sinterizada 3200 x 1600 x 12 mm (11 Láminas)',
        especificacion: 'Revestimiento arquitectónico de alta resistencia para fachada frontal e interiores',
        categoria: 'Materiales Directos',
        rubro: 'OTROS MATERIALES DE CONSTRUCCION',
        cantidad: 11,
        unidadMedida: 'PZA',
        montoUnitario: 458.65,
        montoTotal: 5045.20,
        proveedor: 'Importadora Granitos & Porcelanatos C.A.',
        solicitante: 'Arq. Jefe de Proyecto',
        motivo: 'Acabados y revestimientos arquitectónicos fachada principal',
        comprobanteSIP: 'SIP-AGO-88390',
        fecha: '2026-08-18'
      },
      {
        id: 'TTI-C-0095-03',
        codigo: 'IPN-200-ESTR',
        descripcion: 'Perfil IPN 200 Acero Estructural',
        especificacion: 'Refuerzos laterales y dinteles de ventanas piso 2',
        categoria: 'Materiales Directos',
        rubro: 'MATERIALES ACERO AL CARBONO',
        cantidad: 12,
        unidadMedida: 'M',
        montoUnitario: 43.97,
        montoTotal: 527.60,
        proveedor: 'Distribuidora Siderúrgica C.A.',
        solicitante: 'Residencia de Obra Civil',
        motivo: 'Dinteles y vanos de ventanas',
        comprobanteSIP: 'SIP-AGO-88412',
        fecha: '2026-08-19'
      },
      {
        id: 'TTI-C-0095-04',
        codigo: 'ALB-PEGO-ESP',
        descripcion: 'Pego Blanco Especial & Mortero Aditivo Flex',
        especificacion: 'Mortero adhesivo de alta adherencia para pegado de porcelanatos y piedra',
        categoria: 'Materiales Directos',
        rubro: 'OTROS MATERIALES DIRECTOS',
        cantidad: 45,
        unidadMedida: 'SACO',
        montoUnitario: 13.00,
        montoTotal: 585.00,
        proveedor: 'Ferretería Industrial del Sur',
        solicitante: 'Cuadrilla de Acabados',
        motivo: 'Instalación de revestimientos de piso y pared',
        comprobanteSIP: 'SIP-AGO-88501',
        fecha: '2026-08-22'
      },
      {
        id: 'TTI-C-0095-05',
        codigo: 'ALIV-PISO-AGR',
        descripcion: 'Alivén a Granel & Aditivos de Sobrepiso Liviano',
        especificacion: 'Relleno liviano para vaciado de nivelación de entrepiso',
        categoria: 'Materiales Directos',
        rubro: 'OTROS MATERIALES DIRECTOS',
        cantidad: 1,
        unidadMedida: 'VIAJE',
        montoUnitario: 485.76,
        montoTotal: 485.76,
        proveedor: 'Canteras & Agregados Guayana',
        solicitante: 'Residencia de Obra Civil',
        motivo: 'Nivelación de losa alivianada',
        comprobanteSIP: 'SIP-AGO-88620',
        fecha: '2026-08-26'
      }
    ]
  },

  'TSI-T-0108': {
    codigo: 'TSI-T-0108',
    titulo: 'Construcción Galpones TIMACA Cant. 04',
    tipo: 'CAPEX',
    montoAgosto: 5596,
    montoAcumulado2026: 43226,
    variacionJulio: '+244%',
    responsableArea: 'División de Infraestructura & Obras Industriales',
    descripcionGeneral: 'Desarrollo de cuatro nuevos galpones de resguardo y fabricación en planta TIMACA. En agosto se concentró la compra e instalación de 1.560 metros de cabilla estriada 3/4" para armadura de fundaciones.',
    items: [
      {
        id: 'TSI-T-0108-01',
        codigo: 'CAB-3/4-ESTR',
        descripcion: 'Cabilla Estriada 3/4" Grado 60 (1.560 Metros Lineales)',
        especificacion: 'Acero de refuerzo para fundaciones, pedestales y vigas de riostra',
        categoria: 'Materiales Directos',
        rubro: 'MATERIALES ACERO AL CARBONO',
        cantidad: 1560,
        unidadMedida: 'M',
        montoUnitario: 3.33,
        montoTotal: 5194.80,
        proveedor: 'SIDOR / Siderúrgica Nacional',
        solicitante: 'Ing. Inspector de Estructuras',
        motivo: 'Armadura de zapatas y vigas de fundación Galpón 3 y 4',
        comprobanteSIP: 'SIP-AGO-88192',
        fecha: '2026-08-07'
      },
      {
        id: 'TSI-T-0108-02',
        codigo: 'ALAM-AMARRE-16',
        descripcion: 'Alambre Dulce Calibre 16 & Separadores de Concreto',
        especificacion: 'Amarre de enfierrado y calzas de recubrimiento',
        categoria: 'Materiales Directos',
        rubro: 'OTROS MATERIALES DIRECTOS',
        cantidad: 120,
        unidadMedida: 'KG',
        montoUnitario: 2.23,
        montoTotal: 268.10,
        proveedor: 'Almacén Central TIMACA',
        solicitante: 'Cuadrilla de Cabilleros',
        motivo: 'Atado de armaduras de refuerzo',
        comprobanteSIP: 'SIP-AGO-88204',
        fecha: '2026-08-08'
      },
      {
        id: 'TSI-T-0108-03',
        codigo: 'ELECT-7018-SOL',
        descripcion: 'Electrodos E-7018 & Discos de Corte 7"',
        especificacion: 'Soldadura de anclajes metálicos y pernos de fundación',
        categoria: 'Materiales Directos',
        rubro: 'OTROS MATERIALES DIRECTOS',
        cantidad: 1,
        unidadMedida: 'KIT',
        montoUnitario: 133.10,
        montoTotal: 133.10,
        proveedor: 'Soldaduras & Gases Industriales',
        solicitante: 'Taller de Calderería',
        motivo: 'Fabricación de canastillos y placas de anclaje',
        comprobanteSIP: 'SIP-AGO-88310',
        fecha: '2026-08-14'
      }
    ]
  },

  'TTI-C-0105': {
    codigo: 'TTI-C-0105',
    titulo: 'Adecuación Patio Externo Timaca',
    tipo: 'CAPEX',
    montoAgosto: 5371,
    montoAcumulado2026: 495262,
    variacionJulio: '-62%',
    responsableArea: 'Superintendencia de Planta & Servicios Generales',
    descripcionGeneral: 'Pavimentación, cerramiento perimetral e iluminación de patio de maniobras de 12.000 m². En agosto se instaló cable THWN 4 AWG y se vaciaron brocales perimetrales.',
    items: [
      {
        id: 'TTI-C-0105-01',
        codigo: 'CBL-THWN-4AWG',
        descripcion: 'Cable Eléctrico Cobre THWN 4 AWG (388 Metros)',
        especificacion: 'Alimentación subterránea para 6 torres de reflectores LED lado sur',
        categoria: 'Materiales Directos',
        rubro: 'MATERIALES ELÉCTRICOS',
        cantidad: 388,
        unidadMedida: 'M',
        montoUnitario: 6.20,
        montoTotal: 2405.60,
        proveedor: 'Conductores de Aluminio y Cobre C.A.',
        solicitante: 'Dpto. Electricidad & Mantenimiento',
        motivo: 'Tendido subterráneo para torres de iluminación patio sur',
        comprobanteSIP: 'SIP-AGO-88334',
        fecha: '2026-08-15'
      },
      {
        id: 'TTI-C-0105-02',
        codigo: 'CEM-PORT-T1',
        descripcion: 'Cemento Gris Portland Tipo I & Agregados (Arena/Piedra)',
        especificacion: 'Concreto premezclado para vaciado de brocales perimetrales',
        categoria: 'Materiales Directos',
        rubro: 'OTROS MATERIALES DIRECTOS',
        cantidad: 1,
        unidadMedida: 'LOTE',
        montoUnitario: 2283.69,
        montoTotal: 2283.69,
        proveedor: 'Concretera Guayana S.A.',
        solicitante: 'Residencia de Obra Civil',
        motivo: 'Vaciado de brocales y bases de postes perimetrales',
        comprobanteSIP: 'SIP-AGO-88450',
        fecha: '2026-08-20'
      },
      {
        id: 'TTI-C-0105-03',
        codigo: 'TUB-PVC-CONDUIT',
        descripcion: 'Tubería PVC Conduit 2" & Curvas Subterráneas',
        especificacion: 'Canalización para cableado de fuerza y control',
        categoria: 'Materiales Directos',
        rubro: 'MATERIALES ELÉCTRICOS',
        cantidad: 45,
        unidadMedida: 'TUBO',
        montoUnitario: 15.15,
        montoTotal: 681.71,
        proveedor: 'Tubos y Conexiones C.A.',
        solicitante: 'Dpto. Electricidad',
        motivo: 'Canalización subterránea entre registros',
        comprobanteSIP: 'SIP-AGO-88480',
        fecha: '2026-08-21'
      }
    ]
  },

  'TTI-C-0108': {
    codigo: 'TTI-C-0108',
    titulo: 'Adecuación Banco de Pruebas Motores 440V',
    tipo: 'CAPEX',
    montoAgosto: 3289,
    montoAcumulado2026: 9005,
    variacionJulio: '-41%',
    responsableArea: 'Taller Eléctrico & Automatización',
    descripcionGeneral: 'Instalación de banco de pruebas de carga dinámica para motores eléctricos de 440V hasta 300 HP. En agosto se incorporó transformador de mando, gabinete estanco y motor ventilador.',
    items: [
      {
        id: 'TTI-C-0108-01',
        codigo: 'TRF-MDO-440-220',
        descripcion: 'Transformador de Mando Seco 440V / 220V / 110V 15 kVA',
        especificacion: 'Alimentación de circuitos de control y seguridad del banco de pruebas',
        categoria: 'Materiales Directos',
        rubro: 'MATERIALES ELÉCTRICOS',
        cantidad: 1,
        unidadMedida: 'UND',
        montoUnitario: 1450.00,
        montoTotal: 1450.00,
        proveedor: 'Transformadores del Centro C.A.',
        solicitante: 'Ing. Jefe de Taller Eléctrico',
        motivo: 'Alimentación de control del sistema de pruebas dinámicas',
        comprobanteSIP: 'SIP-AGO-88155',
        fecha: '2026-08-05'
      },
      {
        id: 'TTI-C-0108-02',
        codigo: 'GAB-NEMA-4X',
        descripcion: 'Gabinete Metálico Estanco NEMA 4X con Llave',
        especificacion: 'Alojamiento de botoneras, PLC y relés de protección térmica',
        categoria: 'Materiales Directos',
        rubro: 'MATERIALES ELÉCTRICOS',
        cantidad: 1,
        unidadMedida: 'UND',
        montoUnitario: 1120.00,
        montoTotal: 1120.00,
        proveedor: 'Tableros & Automatización Industrial',
        solicitante: 'Especialista en Automatización',
        motivo: 'Protección intemperie de componentes electrónicos',
        comprobanteSIP: 'SIP-AGO-88240',
        fecha: '2026-08-11'
      },
      {
        id: 'TTI-C-0108-03',
        codigo: 'MOT-VENT-IND',
        descripcion: 'Motor Ventilador Centrífugo Industrial 440V 5 HP',
        especificacion: 'Extracción y enfriamiento forzado del túnel de carga de motores',
        categoria: 'Materiales Directos',
        rubro: 'MATERIALES ELÉCTRICOS',
        cantidad: 1,
        unidadMedida: 'UND',
        montoUnitario: 667.64,
        montoTotal: 667.64,
        proveedor: 'Equipos de Ventilación Guayana',
        solicitante: 'Mantenimiento Eléctrico',
        motivo: 'Sistema de ventilación del banco de carga',
        comprobanteSIP: 'SIP-AGO-88360',
        fecha: '2026-08-16'
      },
      {
        id: 'TTI-C-0108-04',
        codigo: 'FIJ-TORN-INOX',
        descripcion: 'Tornillería Inoxidable A2-70 & Rieles DIN',
        especificacion: 'Fijación de contactores y canaletas ranuradas',
        categoria: 'Materiales Directos',
        rubro: 'OTROS MATERIALES DIRECTOS',
        cantidad: 1,
        unidadMedida: 'KIT',
        montoUnitario: 51.11,
        montoTotal: 51.11,
        proveedor: 'Ferretería Industrial',
        solicitante: 'Taller Eléctrico',
        motivo: 'Ensamblaje del panel de pruebas',
        comprobanteSIP: 'SIP-AGO-88402',
        fecha: '2026-08-19'
      }
    ]
  },

  'TTI-C-0104': {
    codigo: 'TTI-C-0104',
    titulo: 'Reacondicionamiento Grúas Torres Liebherr (Pellas 2)',
    tipo: 'CAPEX',
    montoAgosto: 1528,
    montoAcumulado2026: 181380,
    variacionJulio: '-19%',
    responsableArea: 'Superintendencia de Maquinaria Pesada & Grúas',
    descripcionGeneral: 'Overhaul mayor y puesta a punto de grúas torres para el proyecto Planta de Pellas 2. En agosto se ejecutó el flete marítimo y nacional para traslado de repuestos Mercurius desde Europa.',
    items: [
      {
        id: 'TTI-C-0104-01',
        codigo: 'FLT-INT-EUROPA',
        descripcion: 'Flete Internacional Traslado Repuestos Grúa Mercurius desde Europa',
        especificacion: 'Transporte aéreo/marítimo urgente de repuestos críticos certificados Liebherr (OC TI-MER-011 y 012)',
        categoria: 'Servicios',
        rubro: 'FLETE INTERNACIONAL',
        cantidad: 1,
        unidadMedida: 'SERV',
        montoUnitario: 1235.00,
        montoTotal: 1235.00,
        proveedor: 'Kuehne + Nagel Logistics / TIMACA Aduanas',
        solicitante: 'Gerencia de Importaciones & Compras',
        motivo: 'Nacionalización repuestos originales para grúa torre Liebherr',
        comprobanteSIP: 'SIP-AGO-88099',
        fecha: '2026-08-04'
      },
      {
        id: 'TTI-C-0104-02',
        codigo: 'PAS-BUL-ALTA',
        descripcion: 'Pasadores Maquinados de Alta Resistencia & Bocinas de Bronce',
        especificacion: 'Componentes de giro de pluma y carro móvil',
        categoria: 'Materiales Directos',
        rubro: 'OTROS MATERIALES DIRECTOS',
        cantidad: 4,
        unidadMedida: 'PZA',
        montoUnitario: 68.54,
        montoTotal: 274.16,
        proveedor: 'Taller de Mecanizado TIMACA',
        solicitante: 'Técnico Especialista en Grúas Torre',
        motivo: 'Ajuste de holgura en pivote central de pluma',
        comprobanteSIP: 'SIP-AGO-88490',
        fecha: '2026-08-22'
      },
      {
        id: 'TTI-C-0104-03',
        codigo: 'TERM-ELEC-440',
        descripcion: 'Terminales Eléctricos Bimetálicos & Aisladores',
        especificacion: 'Conexión del motor de elevación principal 75 kW',
        categoria: 'Materiales Directos',
        rubro: 'MATERIALES ELÉCTRICOS',
        cantidad: 12,
        unidadMedida: 'PZA',
        montoUnitario: 0.89,
        montoTotal: 10.71,
        proveedor: 'Almacén Central',
        solicitante: 'Taller Eléctrico',
        motivo: 'Reemplazo de terminales sulfatados en bornera',
        comprobanteSIP: 'SIP-AGO-88540',
        fecha: '2026-08-25'
      },
      {
        id: 'TTI-C-0104-04',
        codigo: 'FLT-NAC-PTO',
        descripcion: 'Flete Nacional Puerto La Cruz – TIMACA Puerto Ordaz',
        especificacion: 'Traslado terrestre de paquete de aduana',
        categoria: 'Servicios',
        rubro: 'FLETE NACIONAL',
        cantidad: 1,
        unidadMedida: 'SERV',
        montoUnitario: 8.13,
        montoTotal: 8.13,
        proveedor: 'Transportes Expresos Guayana',
        solicitante: 'Dpto. Tráfico',
        motivo: 'Entrega en planta TIMACA',
        comprobanteSIP: 'SIP-AGO-88560',
        fecha: '2026-08-26'
      }
    ]
  },

  // ====================== 2. FLOTA OPEX (TOP 10 EQUIPOS) ======================
  'GR17': {
    codigo: 'GR17',
    titulo: 'Grúa Grove TM 890 - 90TN (Serial 68473)',
    tipo: 'GRUA',
    montoAgosto: 23206,
    montoAcumulado2026: 28290,
    variacionJulio: '+1777%',
    responsableArea: 'División de Mantenimiento de Grúas & Equipos Pesados',
    descripcionGeneral: 'La grúa de mayor capacidad operativa en taller. En agosto tuvo una intervención mayor preventiva y correctiva que incluyó recambio completo de neumáticos de alta carga y fabricación de sellos hidráulicos.',
    items: [
      {
        id: 'GR17-01',
        codigo: 'CAU-14.00R20-GROVE',
        descripcion: 'Juego de Neumáticos Radiales 14.00R20 de Alta Carga (6 Unidades)',
        especificacion: 'Neumáticos de 22 lonas para soporte de carga máxima en estabilizadores y carretera',
        categoria: 'Materiales Directos',
        rubro: 'CAUCHOS Y TRIPAS PARA VEHÍCULOS',
        cantidad: 6,
        unidadMedida: 'UND',
        montoUnitario: 2102.67,
        montoTotal: 12616.00,
        proveedor: 'Distribuidora Bridgestone / Firestone Industrial',
        solicitante: 'Jefe de Taller Automotriz',
        motivo: 'Vencimiento y desgaste severo en tren de rodaje principal',
        comprobanteSIP: 'SIP-AGO-88112',
        fecha: '2026-08-06'
      },
      {
        id: 'GR17-02',
        codigo: 'SRV-SELLO-HIDR-GR17',
        descripcion: 'Fabricación y Maquinado de Kit de Sello Hidráulico Pistón Elevación',
        especificacion: 'Empaquetaduras en poliuretano mecanizado y teflón con bronce para cilindro telescópico',
        categoria: 'Servicios',
        rubro: 'FABRICACIÓN SELLO HIDRÁULICO',
        cantidad: 1,
        unidadMedida: 'SERV',
        montoUnitario: 7320.00,
        montoTotal: 7320.00,
        proveedor: 'Sellos Hidráulicos & Mecanizados Especiales C.A.',
        solicitante: 'Especialista en Hidráulica Móvil',
        motivo: 'Fuga interna en pistón de levante de pluma principal',
        comprobanteSIP: 'SIP-AGO-88280',
        fecha: '2026-08-13'
      },
      {
        id: 'GR17-03',
        codigo: 'ACE-ISO-68-TAMBOR',
        descripcion: 'Aceite Hidráulico ISO VG 68 Antidesgaste (2 Tambores 208L)',
        especificacion: 'Fluido hidráulico premium para circuitos de alta presión 350 bar',
        categoria: 'Materiales Directos',
        rubro: 'ACEITE HIDRÁULICO',
        cantidad: 416,
        unidadMedida: 'L',
        montoUnitario: 2.59,
        montoTotal: 1079.00,
        proveedor: 'PDVSA Deltaven / Almacén Lubricantes',
        solicitante: 'Mecánico Líder Grúas',
        motivo: 'Reposición y purga tras desmontaje de cilindro hidráulico',
        comprobanteSIP: 'SIP-AGO-88350',
        fecha: '2026-08-16'
      },
      {
        id: 'GR17-04',
        codigo: 'FIL-ENG-CUMMINS',
        descripcion: 'Kit de Filtros de Aire Primario/Secundario, Aceite y Combustible',
        especificacion: 'Filtros originales Donaldson para motor Cummins N14',
        categoria: 'Materiales Directos',
        rubro: 'REP. Y ACC TREN MOTRIZ AUTOMOTOR',
        cantidad: 1,
        unidadMedida: 'KIT',
        montoUnitario: 965.33,
        montoTotal: 965.33,
        proveedor: 'Filtros & Repuestos Diesel C.A.',
        solicitante: 'Cuadrilla Preventiva',
        motivo: 'Mantenimiento preventivo 500 horas de operación',
        comprobanteSIP: 'SIP-AGO-88410',
        fecha: '2026-08-19'
      },
      {
        id: 'GR17-05',
        codigo: 'MOD-TALLER-108HH',
        descripcion: 'Mano de Obra Directa de Taller Especializado (108 Horas Hombre)',
        especificacion: 'Mecánicos, torneros y ayudantes de taller dedicados a montaje y calibración',
        categoria: 'Mano de Obra Directa',
        rubro: 'MANO DE OBRA DIRECTA (MOD FLOTA)',
        cantidad: 108,
        unidadMedida: 'HH',
        montoUnitario: 2.09,
        montoTotal: 225.67,
        proveedor: 'Nómina Propia Taller Mecánico TIMACA',
        solicitante: 'Supervisor de Planta',
        motivo: 'Desmontaje de cilindro, montaje de cauchos y pruebas operativas',
        comprobanteSIP: 'SIP-AGO-MOD-GR17',
        fecha: '2026-08-29'
      },
      {
        id: 'GR17-06',
        codigo: 'REP-VARIOS-GR17',
        descripcion: 'Mangueras Hidráulicas 4 Mallas 1" y Racores Alta Presión',
        especificacion: 'Líneas flexibles del sistema de giro de tornamesa',
        categoria: 'Materiales Directos',
        rubro: 'OTROS MATERIALES DIRECTOS',
        cantidad: 1,
        unidadMedida: 'KIT',
        montoUnitario: 1000.00,
        montoTotal: 1000.00,
        proveedor: 'Mangueras & Conexiones Guayana',
        solicitante: 'Mecánico Hidráulico',
        motivo: 'Reemplazo de mangueras agrietadas',
        comprobanteSIP: 'SIP-AGO-88510',
        fecha: '2026-08-24'
      }
    ]
  },

  'BS13': {
    codigo: 'BS13',
    titulo: 'Autobús Encava ENT-900 (Flota Transporte)',
    tipo: 'OPEX_FLOTA',
    montoAgosto: 8102,
    montoAcumulado2026: 18450,
    variacionJulio: '+250%',
    responsableArea: 'Coordinación de Transporte de Personal TIMACA',
    descripcionGeneral: 'Autobús asignado a la ruta interurbana de trabajadores Ciudad Bolívar – Puerto Ordaz. En agosto requirió una reparación mayor de motor diésel Isuzu.',
    items: [
      {
        id: 'BS13-01',
        codigo: 'MOT-ISUZU-REP',
        descripcion: 'Kit Mayor de Reparación Motor Diésel Isuzu 6BG1',
        especificacion: 'Camisas cromadas, pistones, anillos, conchas de biela y bancada, kit de empacaduras completo',
        categoria: 'Materiales Directos',
        rubro: 'REP. Y ACC TREN MOTRIZ AUTOMOTOR',
        cantidad: 1,
        unidadMedida: 'KIT',
        montoUnitario: 6800.00,
        montoTotal: 6800.00,
        proveedor: 'Motores Diesel del Sur C.A.',
        solicitante: 'Jefe de Transporte',
        motivo: 'Desgaste severo por compresión baja y consumo excesivo de aceite',
        comprobanteSIP: 'SIP-AGO-88145',
        fecha: '2026-08-07'
      },
      {
        id: 'BS13-02',
        codigo: 'SRV-RECTIF-ISUZU',
        descripcion: 'Servicio Externo de Rectificación de Cigüeñal y Bloque de Motor',
        especificacion: 'Alineación de bancada, rectificación a 0.25 y prueba hidrostática de cámara',
        categoria: 'Servicios',
        rubro: 'OTROS SERVICIOS DIRECTOS',
        cantidad: 1,
        unidadMedida: 'SERV',
        montoUnitario: 1220.00,
        montoTotal: 1220.00,
        proveedor: 'Rectificadora Industrial Orinoco',
        solicitante: 'Mecánico Jefe Diesel',
        motivo: 'Acondicionamiento mecánico previo al armado de motor',
        comprobanteSIP: 'SIP-AGO-88210',
        fecha: '2026-08-11'
      },
      {
        id: 'BS13-03',
        codigo: 'ACE-LUB-15W40',
        descripcion: 'Aceite Mineral 15W40 Diésel & Filtro de Aceite',
        especificacion: 'Fluido de asentamiento de motor recién armado',
        categoria: 'Materiales Directos',
        rubro: 'GRASA Y ACEITES LUBRICANTES',
        cantidad: 24,
        unidadMedida: 'L',
        montoUnitario: 3.42,
        montoTotal: 82.00,
        proveedor: 'Almacén Central',
        solicitante: 'Taller Mecánico',
        motivo: 'Primer llenado y rodaje de motor',
        comprobanteSIP: 'SIP-AGO-88515',
        fecha: '2026-08-25'
      }
    ]
  },

  'BS10': {
    codigo: 'BS10',
    titulo: 'Autobús Encava ENT-330063 (Flota Transporte)',
    tipo: 'OPEX_FLOTA',
    montoAgosto: 7217,
    montoAcumulado2026: 14600,
    variacionJulio: '+190%',
    responsableArea: 'Coordinación de Transporte de Personal TIMACA',
    descripcionGeneral: 'Autobús troncal de personal de taller y calderería. Presentó fractura en la caja sincrónica requiriendo reemplazo por transmisión Eaton Fuller.',
    items: [
      {
        id: 'BS10-01',
        codigo: 'TRA-EATON-FULLER',
        descripcion: 'Transmisión Sincrónica Eaton Fuller FS-5205A Reacondicionada',
        especificacion: 'Caja de 5 velocidades para servicio pesado con garantía de banco de prueba',
        categoria: 'Materiales Directos',
        rubro: 'REP. Y ACC TREN MOTRIZ AUTOMOTOR',
        cantidad: 1,
        unidadMedida: 'UND',
        montoUnitario: 6700.00,
        montoTotal: 6700.00,
        proveedor: 'Transmisiones & Diferenciales Venezuela',
        solicitante: 'Mecánico Líder Transmisiones',
        motivo: 'Rotura de piñón de tercera y carcasa fisurada',
        comprobanteSIP: 'SIP-AGO-88180',
        fecha: '2026-08-09'
      },
      {
        id: 'BS10-02',
        codigo: 'KIT-CLUTCH-ENCAVA',
        descripcion: 'Kit de Embrague Reforzado 14" & Collarín Hidráulico',
        especificacion: 'Prensa, disco con pastillas cerámicas y rodamiento de empuje',
        categoria: 'Materiales Directos',
        rubro: 'REP. Y ACC TREN MOTRIZ AUTOMOTOR',
        cantidad: 1,
        unidadMedida: 'KIT',
        montoUnitario: 517.00,
        montoTotal: 517.00,
        proveedor: 'Repuestos Automotrices del Este',
        solicitante: 'Taller Automotriz',
        motivo: 'Reemplazo preventivo en montaje de nueva transmisión',
        comprobanteSIP: 'SIP-AGO-88235',
        fecha: '2026-08-12'
      }
    ]
  },

  'ML03': {
    codigo: 'ML03',
    titulo: 'Manlift JLG 860SJ (Plataforma Elevadora Telescópica)',
    tipo: 'OPEX_FLOTA',
    montoAgosto: 5740,
    montoAcumulado2026: 22100,
    variacionJulio: '+45%',
    responsableArea: 'Superintendencia de Maquinaria Móvil',
    descripcionGeneral: 'Equipo indispensable para trabajos de montaje en altura hasta 26 metros en talleres y obras. Reemplazo de cauchos de alta flotación.',
    items: [
      {
        id: 'ML03-01',
        codigo: 'CAU-18-625-ESTAB',
        descripcion: 'Cauchos Especiales Rellenos de Poliuretano 18-625 (4 Unidades)',
        especificacion: 'Neumáticos antipinchazo de alta estabilidad para terrenos irregulares',
        categoria: 'Materiales Directos',
        rubro: 'CAUCHOS Y TRIPAS PARA VEHÍCULOS',
        cantidad: 4,
        unidadMedida: 'UND',
        montoUnitario: 1435.00,
        montoTotal: 5740.00,
        proveedor: 'Maquinarias & Neumáticos Industriales C.A.',
        solicitante: 'Supervisor de Seguridad Industrial & Equipos',
        motivo: 'Desprendimiento de banda de rodamiento y vibración en traslación',
        comprobanteSIP: 'SIP-AGO-88305',
        fecha: '2026-08-14'
      }
    ]
  },

  'CA15': {
    codigo: 'CA15',
    titulo: 'Camión Pickman Ford Cargo 1721 (Camión Plataforma)',
    tipo: 'OPEX_FLOTA',
    montoAgosto: 5735,
    montoAcumulado2026: 18900,
    variacionJulio: '+30%',
    responsableArea: 'Taller de Calderería & Mantenimiento Vehicular',
    descripcionGeneral: 'Camión plataforma para despacho de perfiles y piezas de calderería. En agosto se ejecutó el servicio integral de fabricación de plataforma metalmecánica.',
    items: [
      {
        id: 'CA15-01',
        codigo: 'SRV-PLATAF-CA15',
        descripcion: 'Fabricación e Instalación de Plataforma Metalmecánica Reforzada',
        especificacion: 'Piso de lámina estriada 4 mm, vigas transversales IPN 120, barandas abatibles y sistema de anclaje de carga pesada',
        categoria: 'Servicios',
        rubro: 'SERVICIO DE FABRICACIÓN METALMECÁNICA',
        cantidad: 1,
        unidadMedida: 'SERV',
        montoUnitario: 5735.00,
        montoTotal: 5735.00,
        proveedor: 'Metalmecánica & Carrocerías Guayana C.A.',
        solicitante: 'Jefe de Operaciones de Transporte',
        motivo: 'Deterioro de la plataforma anterior por corrosión y carga de bobinas',
        comprobanteSIP: 'SIP-AGO-88270',
        fecha: '2026-08-13'
      }
    ]
  },

  'CA14': {
    codigo: 'CA14',
    titulo: 'Camión Pickman Ford Cargo 1721 (Camión Plataforma)',
    tipo: 'OPEX_FLOTA',
    montoAgosto: 5218,
    montoAcumulado2026: 16400,
    variacionJulio: '+25%',
    responsableArea: 'Taller de Calderería & Mantenimiento Vehicular',
    descripcionGeneral: 'Camión gemelo asignado a acarreo de tuberías y estructuras. Fabricación de plataforma y adecuación de tren de frenos.',
    items: [
      {
        id: 'CA14-01',
        codigo: 'SRV-PLATAF-CA14',
        descripcion: 'Fabricación de Plataforma Metalmecánica en Chasis Ford',
        especificacion: 'Estructura tubular y láminas antiderrapantes para transporte de perfiles',
        categoria: 'Servicios',
        rubro: 'SERVICIO DE FABRICACIÓN METALMECÁNICA',
        cantidad: 1,
        unidadMedida: 'SERV',
        montoUnitario: 4665.00,
        montoTotal: 4665.00,
        proveedor: 'Metalmecánica & Carrocerías Guayana C.A.',
        solicitante: 'Jefe de Transporte',
        motivo: 'Renovación de plataforma de acarreo interno',
        comprobanteSIP: 'SIP-AGO-88295',
        fecha: '2026-08-14'
      },
      {
        id: 'CA14-02',
        codigo: 'REP-FRENOS-CA14',
        descripcion: 'Bandas de Freno de Aire, Pulmones y Válvula Relé',
        especificacion: 'Repuestos de seguridad para sistema de frenado neumático Bendix',
        categoria: 'Materiales Directos',
        rubro: 'REP. Y ACC TREN MOTRIZ AUTOMOTOR',
        cantidad: 1,
        unidadMedida: 'KIT',
        montoUnitario: 553.00,
        montoTotal: 553.00,
        proveedor: 'Frenos Industriales Guayana',
        solicitante: 'Taller Mecánico',
        motivo: 'Desgaste en zapatas de eje trasero',
        comprobanteSIP: 'SIP-AGO-88398',
        fecha: '2026-08-18'
      }
    ]
  },

  'CH02': {
    codigo: 'CH02',
    titulo: 'Chuto Ford Cargo 4532E (Tractor de Transporte)',
    tipo: 'OPEX_FLOTA',
    montoAgosto: 2612,
    montoAcumulado2026: 12850,
    variacionJulio: '-10%',
    responsableArea: 'Mantenimiento de Flota Pesada',
    descripcionGeneral: 'Chuto de arrastre para bateas y remolques pesados de TIMACA. En agosto se sustituyeron los 6 inyectores electrónicos diésel.',
    items: [
      {
        id: 'CH02-01',
        codigo: 'INY-DIESEL-CH02',
        descripcion: 'Suministro y Calibración en Banco de 6 Inyectores Electrónicos Common Rail',
        especificacion: 'Inyectores Bosch originales para motor Cummins ISC 8.3L',
        categoria: 'Servicios',
        rubro: 'MANTENIMIENTO DE INYECTORES',
        cantidad: 6,
        unidadMedida: 'UND',
        montoUnitario: 433.33,
        montoTotal: 2600.00,
        proveedor: 'Laboratorio Diesel Inyección Electrónica',
        solicitante: 'Mecánico Especialista Diésel',
        motivo: 'Falla de encendido, pérdida de potencia y emisión de humo negro',
        comprobanteSIP: 'SIP-AGO-88340',
        fecha: '2026-08-15'
      },
      {
        id: 'CH02-02',
        codigo: 'EMP-INY-CH02',
        descripcion: 'Sellos O-Ring de Cobre & Empacaduras de Inyector',
        especificacion: 'Kit de estanqueidad para toberas',
        categoria: 'Materiales Directos',
        rubro: 'REP. Y ACC TREN MOTRIZ AUTOMOTOR',
        cantidad: 1,
        unidadMedida: 'KIT',
        montoUnitario: 12.00,
        montoTotal: 12.00,
        proveedor: 'Almacén Central',
        solicitante: 'Taller Mecánico',
        motivo: 'Reemplazo en instalación',
        comprobanteSIP: 'SIP-AGO-88341',
        fecha: '2026-08-15'
      }
    ]
  },

  // ====================== 3. INFRAESTRUCTURA (OPEX) ======================
  'TT-I-C-033': {
    codigo: 'TT-I-C-033',
    titulo: 'Adecuaciones y/o Mejoras (Pellas 1 / Hangares)',
    tipo: 'OPEX_INFRA',
    montoAgosto: 31297,
    montoAcumulado2026: 115758,
    variacionJulio: '+59%',
    responsableArea: 'Mantenimiento de Instalaciones & Obras Civiles Planta',
    descripcionGeneral: 'La mayor cuenta de mantenimiento de infraestructura en agosto. Se ejecutó la transformación y adecuación de contenedores marítimos en oficinas de supervisión y resguardo para Planta de Pellas 1.',
    items: [
      {
        id: 'TT-I-C-033-01',
        codigo: 'ACR-CONT-PELLAS',
        descripcion: 'Perfiles de Acero al Carbono, Tubos Estructurales & Láminas de Cerramiento',
        especificacion: 'Modificación estructural de 4 contenedores de 40 pies (puertas, ventanas, tabiquería y techos a dos aguas)',
        categoria: 'Materiales Directos',
        rubro: 'MATERIALES ACERO AL CARBONO',
        cantidad: 1,
        unidadMedida: 'LOTE',
        montoUnitario: 22450.00,
        montoTotal: 22450.00,
        proveedor: 'Almacén Central TIMACA / Aceros Guayana',
        solicitante: 'Ing. Residente Proyecto Pellas 1',
        motivo: 'Adecuación de módulos habitables de oficina de campo',
        comprobanteSIP: 'SIP-AGO-88160',
        fecha: '2026-08-08'
      },
      {
        id: 'TT-I-C-033-02',
        codigo: 'PIN-ANTICORR-IND',
        descripcion: 'Pintura Fondo Epóxico Anticorrosivo & Acabado Poliuretano Industrial',
        especificacion: 'Tratamiento anticorrosivo para ambiente salino / intemperie industrial',
        categoria: 'Materiales Directos',
        rubro: 'OTROS MATERIALES DIRECTOS',
        cantidad: 1,
        unidadMedida: 'LOTE',
        montoUnitario: 4200.00,
        montoTotal: 4200.00,
        proveedor: 'Pinturas Montana / Industrial Guayana',
        solicitante: 'Cuadrilla de Sandblasting & Pintura',
        motivo: 'Protección superficial interna y externa de contenedores',
        comprobanteSIP: 'SIP-AGO-88265',
        fecha: '2026-08-12'
      },
      {
        id: 'TT-I-C-033-03',
        codigo: 'MAT-ELEC-CONT',
        descripcion: 'Materiales Eléctricos: Luminarias LED, Tableros, Cableado y Tomacorrientes',
        especificacion: 'Instalación eléctrica completa de 110V/220V para 4 oficinas moduladas',
        categoria: 'Materiales Directos',
        rubro: 'MATERIALES ELÉCTRICOS',
        cantidad: 1,
        unidadMedida: 'LOTE',
        montoUnitario: 2450.00,
        montoTotal: 2450.00,
        proveedor: 'Materiales Eléctricos del Sur',
        solicitante: 'Cuadrilla de Electricidad Planta',
        motivo: 'Acometida e iluminación de oficinas modulares',
        comprobanteSIP: 'SIP-AGO-88385',
        fecha: '2026-08-17'
      },
      {
        id: 'TT-I-C-033-04',
        codigo: 'MOD-CUAD-INFRA',
        descripcion: 'Mano de Obra Cuadrilla de Mantenimiento e Infraestructura (780 Horas Hombre)',
        especificacion: 'Herreros, soldadores, albañiles y electricistas de mantenimiento de planta',
        categoria: 'Mano de Obra Directa',
        rubro: 'MANO DE OBRA DIRECTA',
        cantidad: 780,
        unidadMedida: 'HH',
        montoUnitario: 2.81,
        montoTotal: 2197.00,
        proveedor: 'Nómina Cuadrilla Infraestructura TIMACA',
        solicitante: 'Coordinador de Infraestructura',
        motivo: 'Fabricación, corte, soldadura y montaje de módulos habitables',
        comprobanteSIP: 'SIP-AGO-MOD-INFRA',
        fecha: '2026-08-28'
      }
    ]
  },

  'TT-G-C-032': {
    codigo: 'TT-G-C-032',
    titulo: 'Mantto y Adecuaciones Galpones - Fabricación',
    tipo: 'OPEX_INFRA',
    montoAgosto: 1809,
    montoAcumulado2026: 29814,
    variacionJulio: '+2387%',
    responsableArea: 'Superintendencia de Fabricación & Calderería',
    descripcionGeneral: 'Mejoras en el ambiente de trabajo del personal de planta: suministro eléctrico para máquinas y confort del comedor de operarios.',
    items: [
      {
        id: 'TT-G-C-032-01',
        codigo: 'CAJ-DIST-ELEC',
        descripcion: 'Cajas de Distribución Eléctrica Industrial & Disyuntores Termomagnéticos',
        especificacion: 'Tableros de fuerza auxiliares para conexión de soldadoras inverter en nave principal',
        categoria: 'Materiales Directos',
        rubro: 'MATERIALES ELÉCTRICOS',
        cantidad: 4,
        unidadMedida: 'UND',
        montoUnitario: 190.25,
        montoTotal: 761.00,
        proveedor: 'Materiales Eléctricos Guayana',
        solicitante: 'Jefe de Calderería',
        motivo: 'Puntos de conexión seguros para puestos de soldadura',
        comprobanteSIP: 'SIP-AGO-88190',
        fecha: '2026-08-09'
      },
      {
        id: 'TT-G-C-032-02',
        codigo: 'AIR-SPLIT-COMEDOR',
        descripcion: 'Unidad de Aire Acondicionado Split 24.000 BTU',
        especificacion: 'Equipo de climatización para comedor de operarios de fabricación',
        categoria: 'Materiales Directos',
        rubro: 'OTROS MATERIALES DIRECTOS',
        cantidad: 1,
        unidadMedida: 'UND',
        montoUnitario: 550.00,
        montoTotal: 550.00,
        proveedor: 'Refrigeración Industrial Caroní',
        solicitante: 'Comité de Seguridad y Salud Laboral',
        motivo: 'Condiciones de descanso y confort de 65 trabajadores',
        comprobanteSIP: 'SIP-AGO-88285',
        fecha: '2026-08-13'
      },
      {
        id: 'TT-G-C-032-03',
        codigo: 'LUM-LED-CAMPANA',
        descripcion: 'Luminarias LED Campana Industrial 150W & Cables Vulcanizados',
        especificacion: 'Reposición de iluminación cenital en zona de armado de estructuras',
        categoria: 'Materiales Directos',
        rubro: 'MATERIALES ELÉCTRICOS',
        cantidad: 6,
        unidadMedida: 'UND',
        montoUnitario: 83.00,
        montoTotal: 498.00,
        proveedor: 'Almacén Central',
        solicitante: 'Mantenimiento Eléctrico',
        motivo: 'Seguridad y visibilidad en turno nocturno',
        comprobanteSIP: 'SIP-AGO-88430',
        fecha: '2026-08-20'
      }
    ]
  },

  'TT-A-C-207': {
    codigo: 'TT-A-C-207',
    titulo: 'Mantto Herramientas y Accesorios - Almacén',
    tipo: 'OPEX_INFRA',
    montoAgosto: 444,
    montoAcumulado2026: 91763,
    variacionJulio: '-97%',
    responsableArea: 'Superintendencia de Almacenes & Seguridad Integral',
    descripcionGeneral: 'Disminución marcada tras la culminación de fabricación de 40 cajas de herramientas en julio ($14,1K). En agosto solo se ejecutó mantenimiento de extintores y señalización de seguridad.',
    items: [
      {
        id: 'TT-A-C-207-01',
        codigo: 'SRV-RECARGA-EXT',
        descripcion: 'Recarga, Prueba Hidrostática y Certificación de 18 Extintores PQS 20 Lbs',
        especificacion: 'Inspección técnica anual conforme a norma COVENIN 1040',
        categoria: 'Servicios',
        rubro: 'OTROS SERVICIOS DIRECTOS',
        cantidad: 18,
        unidadMedida: 'UND',
        montoUnitario: 15.55,
        montoTotal: 279.89,
        proveedor: 'Seguridad & Protección contra Incendios C.A.',
        solicitante: 'Jefe de Seguridad e Higiene Industrial',
        motivo: 'Certificación vigente de seguridad en almacén central',
        comprobanteSIP: 'SIP-AGO-88220',
        fecha: '2026-08-11'
      },
      {
        id: 'TT-A-C-207-02',
        codigo: 'SEN-LOTO-CAND',
        descripcion: 'Candados Dieléctricos de Bloqueo LOTO & Tarjetas de Seguridad',
        especificacion: 'Equipos de consignación para mantenimiento seguro',
        categoria: 'Materiales Directos',
        rubro: 'OTROS MATERIALES DIRECTOS',
        cantidad: 1,
        unidadMedida: 'KIT',
        montoUnitario: 164.11,
        montoTotal: 164.11,
        proveedor: 'Ferretería Industrial',
        solicitante: 'Seguridad Industrial',
        motivo: 'Protocolo de bloqueo y etiquetado',
        comprobanteSIP: 'SIP-AGO-88370',
        fecha: '2026-08-16'
      }
    ]
  }
};

/**
 * Función de utilidad para obtener el desglose por código de cuenta o equipo
 */
export function getDesgloseInterno(codigo: string): DetalleCuentaOActivo | null {
  // Limpieza de prefijo o búsqueda directa
  if (DESGLOSE_DETALLE_INTERNOS[codigo]) {
    return DESGLOSE_DETALLE_INTERNOS[codigo];
  }

  // Si viene con EEI-C-GR17 -> buscar GR17
  const cleanCode = codigo.replace('EEI-C-', '').trim();
  if (DESGLOSE_DETALLE_INTERNOS[cleanCode]) {
    return DESGLOSE_DETALLE_INTERNOS[cleanCode];
  }

  return null;
}
