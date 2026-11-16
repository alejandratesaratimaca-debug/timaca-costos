import { ValeSIPPmh } from '../types/suite';

export const MOCK_VALES_SIP_PMH: ValeSIPPmh[] = [
  {
    id: 'sip-001',
    numeroVale: 'VALE-PMH-2026-0412',
    fechaHora: '2026-10-05 08:30',
    frenteTrabajo: 'Muelle de Carga PMH (Ship Loader)',
    cuentaAuxiliarCodigo: 'TTE-C-0671',
    cuentaAuxiliarNombre: 'Segunda Línea PMH - Despacho Internacional',
    equipoIntervenido: 'Cinta Transportadora Pluma Ship Loader CV-03',
    solicitadoPor: 'Alexander Guanipa',
    cargoSolicitante: 'Supervisor de Frente de Obra',
    supervisorAprobador: 'Ing. Carlos Silva',
    despachadoPor: 'Almacén de Campo Caseta Muelle (TIMACA)',
    estado: 'Sincronizado Central',
    esOffline: false,
    items: [
      {
        codigoMaterial: 'MAT-EST-041',
        descripcion: 'Plancha Antidesgaste Hardox 400 1/2" x 1.5m x 3.0m',
        unidad: 'PZA',
        cantidad: 2,
        costoUnitarioUsd: 1240,
        totalUsd: 2480,
        partidaImputacion: 'Materiales Directos'
      },
      {
        codigoMaterial: 'CON-SLD-019',
        descripcion: 'Electrodo Revestido E7018 1/8" (Caja 20 Kg)',
        unidad: 'CJA',
        cantidad: 4,
        costoUnitarioUsd: 65,
        totalUsd: 260,
        partidaImputacion: 'Consumibles de Taller'
      },
      {
        codigoMaterial: 'TOR-GRA-088',
        descripcion: 'Pernos Estructurales ASTM A325 3/4" x 2.1/2" con Tuerca y Arandela',
        unidad: 'JGO',
        cantidad: 48,
        costoUnitarioUsd: 4.8,
        totalUsd: 230.4,
        partidaImputacion: 'Tornillería'
      }
    ],
    montoTotalUsd: 2970.4,
    observaciones: 'Reemplazo de blindaje de tolva de descarga directa a bodega del buque granelero.'
  },
  {
    id: 'sip-002',
    numeroVale: 'VALE-PMH-2026-0413',
    fechaHora: '2026-10-05 11:15',
    frenteTrabajo: 'Torre de Transferencia TT-201',
    cuentaAuxiliarCodigo: 'TTE-C-0656',
    cuentaAuxiliarNombre: 'Reparación Estructural Chutes y Tolvas PMH',
    equipoIntervenido: 'Chute de Caída Libre Torre TT-201',
    solicitadoPor: 'Miguelángel López',
    cargoSolicitante: 'Líder Montador Estructural',
    supervisorAprobador: 'Ing. Carlos Mendoza',
    despachadoPor: 'Almacén de Campo Caseta Muelle (TIMACA)',
    estado: 'Sincronizado Central',
    esOffline: false,
    items: [
      {
        codigoMaterial: 'MEC-ROD-102',
        descripcion: 'Rodillos de Retorno Autocentrantes 6" CEMA C (Banda 48")',
        unidad: 'UND',
        cantidad: 6,
        costoUnitarioUsd: 145,
        totalUsd: 870,
        partidaImputacion: 'Repuestos Mecánicos'
      },
      {
        codigoMaterial: 'LUB-IND-004',
        descripcion: 'Grasa Sintética para Altas Cargas Mobilith SHC 220 (Paila 16 Kg)',
        unidad: 'PLA',
        cantidad: 2,
        costoUnitarioUsd: 195,
        totalUsd: 390,
        partidaImputacion: 'Lubricantes & Químicos'
      },
      {
        codigoMaterial: 'CON-DIS-012',
        descripcion: 'Discos de Corte Fino Tyrolit 7" x 1.6mm (Caja 25 Und)',
        unidad: 'CJA',
        cantidad: 2,
        costoUnitarioUsd: 42,
        totalUsd: 84,
        partidaImputacion: 'Consumibles de Taller'
      }
    ],
    montoTotalUsd: 1344,
    observaciones: 'Cambio de rodillos dañados detectados en inspección por alta vibración.'
  },
  {
    id: 'sip-003',
    numeroVale: 'VALE-PMH-2026-0414',
    fechaHora: '2026-10-05 15:40',
    frenteTrabajo: 'Área de Recuperación PMH (Dravo PA-9020)',
    cuentaAuxiliarCodigo: 'TTE-C-0653',
    cuentaAuxiliarNombre: 'Repotenciación Recuperador Rueda Cangilones (DRAVO) PMH',
    equipoIntervenido: 'Ventilador de Tiro Inducido 21-FN-102',
    solicitadoPor: 'Pedro Rivas',
    cargoSolicitante: 'Técnico Mecánico de Campo',
    supervisorAprobador: 'Ing. Roberto Valdivieso',
    despachadoPor: 'Caseta Móvil TIMACA PMH',
    estado: 'Despachado en Campo',
    esOffline: false,
    items: [
      {
        codigoMaterial: 'MEC-CHM-055',
        descripcion: 'Chumaceras Bipartidas SKF SNL 518-615 con Rodamientos de Rodillos',
        unidad: 'JGO',
        cantidad: 2,
        costoUnitarioUsd: 1850,
        totalUsd: 3700,
        partidaImputacion: 'Repuestos Mecánicos'
      },
      {
        codigoMaterial: 'SEL-HID-031',
        descripcion: 'Sellos Laberínticos de Aceite de Alta Temperatura Viton',
        unidad: 'JGO',
        cantidad: 4,
        costoUnitarioUsd: 78,
        totalUsd: 312,
        partidaImputacion: 'Empacaduras & Sellos'
      }
    ],
    montoTotalUsd: 4012,
    observaciones: 'Despacho de emergencia para montaje en rueda de cangilones DRAVO PA-9020.'
  },
  {
    id: 'sip-004',
    numeroVale: 'VALE-PMH-2026-0415',
    fechaHora: '2026-10-06 09:10',
    frenteTrabajo: 'Muelle de Carga PMH (Ship Loader)',
    cuentaAuxiliarCodigo: 'TTE-C-0671',
    cuentaAuxiliarNombre: 'Segunda Línea PMH - Cargador de Barcos',
    equipoIntervenido: 'Sistema de Winche y Polipasto de Pluma',
    solicitadoPor: 'Luis Morillo',
    cargoSolicitante: 'Soldador Calificado 6G',
    supervisorAprobador: 'Alexander Guanipa',
    despachadoPor: 'Caseta Muelle PMH (Registro Offline)',
    estado: 'Pendiente Sincronización',
    esOffline: true,
    items: [
      {
        codigoMaterial: 'TUB-EST-019',
        descripcion: 'Tubo Estructural ASTM A500 Grado B 4" x 4" x 1/4" (Tramo 6m)',
        unidad: 'TRM',
        cantidad: 3,
        costoUnitarioUsd: 210,
        totalUsd: 630,
        partidaImputacion: 'Materiales Directos'
      },
      {
        codigoMaterial: 'CON-OXI-005',
        descripcion: 'Oxígeno Industrial Cilindro 6m³ (Recarga en Campo)',
        unidad: 'CIL',
        cantidad: 2,
        costoUnitarioUsd: 38,
        totalUsd: 76,
        partidaImputacion: 'Gases Industriales'
      }
    ],
    montoTotalUsd: 706,
    observaciones: 'VALE REGISTRADO SIN CONEXIÓN A INTERNET EN EL MUELLE. Pendiente sincronización con Almacén Central TIMACA.'
  },
  {
    id: 'sip-005',
    numeroVale: 'VALE-PMH-2026-0416',
    fechaHora: '2026-10-06 11:20',
    frenteTrabajo: 'Sistema de Tolvas & Chutes',
    cuentaAuxiliarCodigo: 'TTE-C-0656',
    cuentaAuxiliarNombre: 'Reparación Estructural Chutes y Tolvas PMH',
    equipoIntervenido: 'Tolva Pulmón TP-02',
    solicitadoPor: 'Enrique Vargas',
    cargoSolicitante: 'Pailero / Esmerilador',
    supervisorAprobador: 'Ing. Carlos Silva',
    despachadoPor: 'Caseta Muelle PMH (Registro Offline)',
    estado: 'Pendiente Sincronización',
    esOffline: true,
    items: [
      {
        codigoMaterial: 'CON-DIS-014',
        descripcion: 'Discos de Desbaste Grueso 9" x 1/4" Tyrolit Extra',
        unidad: 'CJA',
        cantidad: 3,
        costoUnitarioUsd: 52,
        totalUsd: 156,
        partidaImputacion: 'Consumibles de Taller'
      },
      {
        codigoMaterial: 'PNT-IND-001',
        descripcion: 'Fondo Epóxico Rico en Zinc Alto Sólidos (Kit Galón)',
        unidad: 'GLN',
        cantidad: 2,
        costoUnitarioUsd: 85,
        totalUsd: 170,
        partidaImputacion: 'Pinturas & Revestimientos'
      }
    ],
    montoTotalUsd: 326,
    observaciones: 'Registrado en dispositivo de campo en tolva. En cola local para sincronización.'
  }
];

export const CUENTAS_CAMPO_PMH = [
  { codigo: 'TTE-C-0671', nombre: 'Segunda Línea PMH - Despacho Internacional FMO', responsable: 'Ing. Carlos Mendoza', presupuestoUsd: 1250000 },
  { codigo: 'TTE-C-0656', nombre: 'Rehabilitación Bandas Transportadoras Torre #3 a Banda JD-8012 PMH', responsable: 'Ing. Roberto Valdivieso', presupuestoUsd: 480000 },
  { codigo: 'TTE-C-0653', nombre: 'Repotenciación Recuperador Rueda Cangilones (DRAVO) PA-9020 PMH', responsable: 'Ing. Alexander Guanipa', presupuestoUsd: 620000 },
  { codigo: 'TTE-C-0654', nombre: 'Rehabilitación y Extensión Cinta JD-9021 y Carro PA-54108 PMH', responsable: 'Ing. Carlos Silva', presupuestoUsd: 310000 },
  { codigo: 'TTE-C-0655', nombre: 'Interconexión Tolva Multipropósito a Carga Barcos PMH', responsable: 'Ing. Miguelángel López', presupuestoUsd: 295000 },
  { codigo: 'TTE-C-0660', nombre: 'Construcción Cabinas para Operadores de Equipos Planta PMH', responsable: 'Ing. Carlos Silva', presupuestoUsd: 145000 },
  { codigo: 'TTE-C-0662', nombre: 'Suministro y Fabricación Anillo Desgaste Triturador Primario PMH', responsable: 'Ing. Roberto Valdivieso', presupuestoUsd: 185000 },
  { codigo: 'TTE-C-0666', nombre: 'Reparación Pista/Canales Guaya Empujador de Vagones PMH', responsable: 'Ing. Alexander Guanipa', presupuestoUsd: 175000 },
  { codigo: 'TTE-C-0672', nombre: 'Extensión Banda Transportadora JD 8016A y JD 8016B PMH', responsable: 'Ing. Carlos Mendoza', presupuestoUsd: 380000 },
  { codigo: 'TTE-C-0677', nombre: 'Fabricación de 20 Gamelas FMO-PMH', responsable: 'Ing. Roberto Valdivieso', presupuestoUsd: 210000 },
  { codigo: 'TTE-C-0678', nombre: 'Proyecto Pila HA y HB (Apilador y Recuperador Cangilones PMH)', responsable: 'Ing. Alexander Guanipa', presupuestoUsd: 540000 },
  { codigo: 'TTE-C-0679', nombre: 'Levantamiento y Reparación Apilador PA-9016 PMH', responsable: 'Ing. Carlos Silva', presupuestoUsd: 260000 },
  { codigo: 'TTE-C-0684', nombre: 'Fabricación de Gamelas FMO-PMH', responsable: 'Ing. Miguelángel López', presupuestoUsd: 190000 },
  { codigo: 'TTE-C-0687', nombre: 'Reparación Poleas Motriz y Quiebre Cola Cinta JD-8016 PMH', responsable: 'Ing. Roberto Valdivieso', presupuestoUsd: 165000 },
  { codigo: 'TTE-C-0702', nombre: 'Modificación de Alcance INT-003 FMO-PMH', responsable: 'Ing. Carlos Mendoza', presupuestoUsd: 220000 },
  { codigo: 'TTE-C-0711', nombre: 'Retirada e Instalación Módulos Eléctricos TH4 PMH', responsable: 'Ing. Alexander Guanipa', presupuestoUsd: 340000 }
];
