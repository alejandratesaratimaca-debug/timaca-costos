/**
 * Mano de Obra Directa (MOD) - Mantenimiento de Equipos ECO Septiembre 2026
 * Extraído y conciliado 100% directamente de:
 * C:\Users\danielarivero\Downloads\horas hombres eco septiembre.xlsx
 * Total Auditado: 5.963 Horas Hombre (1.336 registros de intervención)
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

export interface EvolutivoSemanaMOD {
  semana: string;
  periodo: string;
  horas: number;
  intervenciones: number;
  detalle: string;
}

export const EVOLUTIVO_SEMANAL_MOD_SEPTIEMBRE_2026: EvolutivoSemanaMOD[] = [
  {
    "semana": "Semana 36",
    "periodo": "Del 01 Al 05",
    "horas": 1164,
    "intervenciones": 147,
    "detalle": "Arranque de mes regular de 5 días: Grúas (248H, GR17 con 68H en cauchos y cilindros), mantenimiento de áreas y galpones (209H) y lubricador CA06 (84H en surtido)."
  },
  {
    "semana": "Semana 37",
    "periodo": "Del 07 al 12",
    "horas": 1441,
    "intervenciones": 186,
    "detalle": "Pico máximo del mes: Grúas (280H, GR17 con 128H en mangueras de extensiones y estabilizadores) y Camiones (201H, CA06 con 108H en surtido gasoil TIMACA/FMO/Pellas)."
  },
  {
    "semana": "Semana 38",
    "periodo": "Del 14 al 19",
    "horas": 1401,
    "intervenciones": 173,
    "detalle": "Segundo pico de carga: Grúas (249H, GR15 con 87H en winche y fugas), Equipos Especiales (224H, PA03 con 96H y tractor TR01 con 77H en radiador y tejas) y Camiones (209H)."
  },
  {
    "semana": "Semana 39",
    "periodo": "Del 21 al 26",
    "horas": 1232,
    "intervenciones": 151,
    "detalle": "Alta intensidad técnica en Autobuses (253H, armado e instalación de motor y transmisión en BS03 con 107H y BS13 con 91H) y Grúas (253H en GR15 y GR20)."
  },
  {
    "semana": "Semana 40",
    "periodo": "Del 28 al 30",
    "horas": 725,
    "intervenciones": 79,
    "detalle": "Menor volumen por cierre de mes de solo 3 días laborables (lunes a miércoles); destacaron GR25 (90H en cilindros y vástago) y pruebas finales de motor/transmisión en autobuses (197H)."
  }
];

export const TOTALES_MOD_SEPTIEMBRE_2026 = {
  totalHorasHombre: 5963,
  horasConCuentaAuxiliar: 5963,
  horasSinCuentaAuxiliar: 0,
  totalRegistros: 1336,
  registrosConCuenta: 1336,
  registrosSinCuenta: 0,
  cuentasAuxiliaresImpactadas: 162,
  totalTecnicosPlanta: 32,
  tarifaPromedioEstimadaHora: 2.05,
  costoEstimadoTotalUSD: 11835.1
};

export const HORAS_HOMBRE_POR_CUENTA_SEPTIEMBRE: HorasHombreCuentaSep[] = [
  {
    "cuenta": "EEE-C-CA06",
    "equipo": "Camion Lubricador Ford Cargo 815 - Placa: A11AL1F",
    "tipo": "Camiones",
    "totalHoras": 458.0,
    "registros": 110,
    "cantTrabajadores": 5,
    "trabajadores": [
      "Josué Solorzano",
      "Julio Hernández",
      "Luis Guzmán",
      "Líno García",
      "Pablo León"
    ],
    "principalesLabores": "SURTIDO GASOIL EQUIPOS PELLAS • SURTIDO GASOIL EQUIPOS TIMACA • SURTIDO GASOIL EQUIPOS FMO • SURTIDO GASOIL PELLAS"
  },
  {
    "cuenta": "EEI-C-GR17",
    "equipo": "Grua Grove TM 890 - 90TN Serial 68473",
    "tipo": "Grúas",
    "totalHoras": 268.0,
    "registros": 43,
    "cantTrabajadores": 5,
    "trabajadores": [
      "Arquimedes Guerra",
      "Eduardo Bastardo",
      "Josué Solorzano",
      "LUIS FERNANDO",
      "RICARDO GONZALEZ"
    ],
    "principalesLabores": "DESMONTAJE DE CILINDROS ESTABILIZADOR DELANTERO DERECHO IZQUIERDO, DESMONTAJE, FABRICACION E INSTALACION DE MANGUERA CILINDRO ESTABILIZADOR DELANTERO IZQUIERDO (2), COMPLETADO NIVELES DE FLUIDOS • DESMONTAJE DE MANGUERAS HIDRAULICAS DE CILINDROS EXTENSION Y CORRECCION DE LONGITUD • ADAPTACION DE BOMBIN SUPERIOR DE EMBRAGUE NUEVO, ESPURGUE SISTEMA EMBRAGUE • REVISION FALLA EMBRAGUE"
  },
  {
    "cuenta": "EEA-C-BS13",
    "equipo": "Autobus Encava ENT-900 - Placa: 03AA4WA",
    "tipo": "Autobuses",
    "totalHoras": 242.0,
    "registros": 33,
    "cantTrabajadores": 9,
    "trabajadores": [
      "Eduardo Bastardo",
      "Enderson Vera",
      "Francisco Siso",
      "Hector Sánchez",
      "Jesús Areyan",
      "Jesús Sánchez",
      "Josué Solorzano",
      "LUIS DIAZ",
      "Pedro Avendaño"
    ],
    "principalesLabores": "DESMONTAJE DE CARTER TRANSMISION, REVISION DE SOLENOIDES DE TRANSMISION, DESMONTAJE DE SOLENOIDE DAÑADO • PRUEBAS DE EQUIPO, REVISION DE FALLA CAMBIOS TRANSMISION • SUMINISTRO ACEITE TRANSMISION, REFRIGERANTE, ACEITE DIRECCION, ENCENDIDO Y PRUEBAS, ESPURGUE SISTEMA DE DIRECCION, REVISION CABLEADO ELECTRICO DE CAJA, INSTALACION DE PARACHOQUE DELNATERO  Y LUCES DELANTERAS • REPARACION DE CABLAEDO ELECTRICO LUCES DELANTERAS, INSTALACION DE ALTERNADOR, CORREAS ALTERNADOR NUEVAS, REPARACION DE LUCES TRASERAS, ENCENDIDO DE EQUIPO"
  },
  {
    "cuenta": "EEA-C-BS03",
    "equipo": "Autobus  Encava - PLaca: FA160P",
    "tipo": "Autobuses",
    "totalHoras": 230.0,
    "registros": 33,
    "cantTrabajadores": 7,
    "trabajadores": [
      "Enderson Vera",
      "Hector Sánchez",
      "JUAN GONZALEZ",
      "Jesús Areyan",
      "Jesús Sánchez",
      "LUIS DIAZ",
      "Pedro Avendaño"
    ],
    "principalesLabores": "INSTALACION DE PARACHOQUE DELANTERO • CONTINUACION DE FIJACION DE MOTOR Y TRANSMISION, FABRICACION E INSTALACION DE MANGUERA PRINCIPAL AIRE COMPRESOR NUEVA • CONTINUACION DE INSTALACION MOTOR Y TRANSMISION • CULMINADO ARMADO DE ALTERADOR 22SI 12V, ARMADO DE MOTOR DE ARRANQUE"
  },
  {
    "cuenta": "EEI-C-GR20",
    "equipo": "Grua Demag  AC-200  - 200TN Serial 74599126",
    "tipo": "Grúas",
    "totalHoras": 213.0,
    "registros": 24,
    "cantTrabajadores": 1,
    "trabajadores": [
      "Omar Marín"
    ],
    "principalesLabores": "TRABAJO EN GRUA • trabajo en grua"
  },
  {
    "cuenta": "EEI-C-GR25",
    "equipo": "Grua Grove RT750 50TN Serial: 87167",
    "tipo": "Grúas",
    "totalHoras": 206.0,
    "registros": 26,
    "cantTrabajadores": 5,
    "trabajadores": [
      "Arquimedes Guerra",
      "LUIS FERNANDO",
      "Luis Guzmán",
      "Pedro Santana",
      "RICARDO GONZALEZ"
    ],
    "principalesLabores": "PULIDO DE VASTAGO CILINDRO BOOM POS#1 • DESMONTAJE DE 2 CILINDROS HIDRAULICOS DIRECCION TRASEROS, DESARMADO DE 4 CILINDROS HIDRAULICOS DIRECCION • DESMONTAJE, DESARMADO DE CILINDRO HIDRAULICO BOOM #2, REEMPLAZO DE KIT SELLOS NUEVOS E INSTALACION CILINDRO HIDRAULICO BOOM #2, DESMONTAJE DE CILINDROS DE DIRECCION • LAVADO DE EQUIPO, CULMINADO INSTALACION DE CILINDROS HIDRAULICOS ESTABILIZADORES REPARADOS CON KIT SELLOS NUEVOS"
  },
  {
    "cuenta": "TT-G-C-032",
    "equipo": "Mantto y Adecuaciones Galpones - Fab",
    "tipo": "Mantenimiento y Adecuaciones",
    "totalHoras": 165.0,
    "registros": 21,
    "cantTrabajadores": 3,
    "trabajadores": [
      "Angela Nuñez",
      "Marcos Narváez",
      "María Fermín"
    ],
    "principalesLabores": "LIMPIEZA DE OFICINAS, COMEDOR, VESTUARIO, DE FABRICACIÓN, OFICINAD DE OPERACIONES • LIMPIEZA DE OFICINAS, COMEDOR, BAÑOS, VESTUARIOS DE FABRICACIÓN, • LIMPIEZA DE OFICINAS, COMEDOR, VESTUARIOS DE FABRICACIÓN • REPARACIÓN DE DISTRIBUIDORES ELÉCTRICOS CAMBIOS DE TOMACORRIENTE DE 63 AMPERIOS Y TOMACORRIENTES DE 110 V, 20 AMPERIOS"
  },
  {
    "cuenta": "EE-G-C-016",
    "equipo": "Mantto y Adecuaciones Galpones - Mantto",
    "tipo": "Mantenimiento y Adecuaciones",
    "totalHoras": 162.0,
    "registros": 22,
    "cantTrabajadores": 7,
    "trabajadores": [
      "Angela Nuñez",
      "Birmania Gazcón",
      "CRISTIAN GARCIA",
      "DAVID GARATE",
      "Francisco Siso",
      "Jesús Areyan",
      "LUIS DIAZ"
    ],
    "principalesLabores": "TALLER ECO, AREA TALLER ELECTRICO • LIMPIEZA TALLER ECO • LIMPIEZA DE OFICINAS, COMEDOR, BAÑOS, VESTUARIOS EDIFICIO ADMINISTRATIVO ECO, TALLER ECO • LIMPIEZA DE OFICINAS, COMEDOR, BAÑOS, VESTUARIOS, PASILLOS EDIFICIO ADMINISTRATIVO ECO Y TALLER ECO"
  },
  {
    "cuenta": "EEI-C-GR15",
    "equipo": "Grua Grove AT 865(N) - 65TN Serial 46105",
    "tipo": "Grúas",
    "totalHoras": 159.0,
    "registros": 33,
    "cantTrabajadores": 6,
    "trabajadores": [
      "Arquimedes Guerra",
      "CALIX LOPEZ",
      "Eduardo Bastardo",
      "Josué Solorzano",
      "LUIS FERNANDO",
      "RICARDO GONZALEZ"
    ],
    "principalesLabores": "REPARACION DE LUCES DELANTERAS • DESMONTAJE, FABRICACION E INSTALACION DE 2 MANGUERAS HIDRAULICAS ESTABILIZADOR TRASERO DERECHO, COMPLETADO NIVEL ACEITE HIDRAULICO • INSTALACION DE BOMBA HIDRAULICA REPARADA CON KIT SELLOS NUEVOS • CONTINUACION REPARACION CABLEADO ELECTRICO CABINA"
  },
  {
    "cuenta": "TT-A-C-208",
    "equipo": "Mantto y Adecuaciones Galpones -  Almacén",
    "tipo": "Mantenimiento y Adecuaciones",
    "totalHoras": 143.0,
    "registros": 15,
    "cantTrabajadores": 3,
    "trabajadores": [
      "Angela Nuñez",
      "Birmania Gazcón",
      "María Fermín"
    ],
    "principalesLabores": "LIMPIEZA DE OFICINAS, COMEDOR, BAÑOS, PASILLOS, ANTIGUO EDIFICIO ADMINISTRATIVO • LIMPIEZA DE OFICINAS, COMEDOR, BAÑOS, VESTUARIOS, PASILLOS DE ANTIGUO EDIFICIO ADMINISTRATIVO, ALMACEN CENTRAL. • LIMPIEZA DE OFICINAS, COMEDOR, BAÑOS DEL ANTIGUO EDIFICIO ADMINISTRATIVO • LIMPIEZA DE OFICINAS, BAÑOS,COMEDOR, EDIFICIO ADMINISTRATIVO"
  },
  {
    "cuenta": "TT-S-C-854",
    "equipo": "Payloader Hyndai HL760-7",
    "tipo": "Equipos Especiales",
    "totalHoras": 126.0,
    "registros": 37,
    "cantTrabajadores": 15,
    "trabajadores": [
      "CALIX LOPEZ",
      "CRISTIAN GARCIA",
      "DAVID GARATE",
      "Enderson Vera",
      "Francisco Siso",
      "Hector Sánchez",
      "Jesús Areyan",
      "Jesús Sánchez",
      "Josué Solorzano",
      "Julio Hernández",
      "Luis Guzmán",
      "Oswaldo López",
      "Pedro Avendaño",
      "Pedro Santana",
      "TOMAS GUEVARA"
    ],
    "principalesLabores": "MANTENIMIENTO CUERPO VALVULAS, INSTALACION Y CALIBRACION DE PRESIONES CUERPO DE VALVULAS • DESMONTAJE DE CUERPO VALVULAS • INSTALACION DE BOMBA HIDRAULICA REPARADA, ENCENDIDO Y PRUEBAS DE PRESIONES • CONTINUACION DESMONTAJE DE BOMBA HIDRAULICA, DESARMADO DE BOMBA HIDRAULICO, LIMPIEZA Y ARMADO BOMBA HIDRAULICA,"
  },
  {
    "cuenta": "EEE-C-TR01",
    "equipo": "Traktor Caterpillar D6R-XL2",
    "tipo": "TRACKTOR",
    "totalHoras": 125.0,
    "registros": 24,
    "cantTrabajadores": 15,
    "trabajadores": [
      "Arquimedes Guerra",
      "CALIX LOPEZ",
      "DAVID GARATE",
      "Francisco Siso",
      "Hector Sánchez",
      "Jesús Areyan",
      "Jesús Sánchez",
      "Josué Solorzano",
      "LUIS FERNANDO",
      "Luis Guzmán",
      "Líno García",
      "Pablo León",
      "Pedro Santana",
      "RICARDO GONZALEZ",
      "TOMAS GUEVARA"
    ],
    "principalesLabores": "DESMONTAJE DE SILENCIADOR DE ESCAPE • TENSADO DE ORUGA • CULMINADO INSTALACION DE RADIADORES, SUMINISTRO REFRIGERANTE, INSTALACION DE SISTEMA ESCAPE REPARADO, CORREAS VENTILADOR B-75 (3), RODAMIENTOS POLEAS VENTILADOR NUEVOS • REVISION DE TRANSMISION, REEMPLAZO ACEITE TRANSMISION"
  },
  {
    "cuenta": "EEE-C-PA03",
    "equipo": "Payloader Caterpillar 962G",
    "tipo": "Equipos Especiales",
    "totalHoras": 122.0,
    "registros": 29,
    "cantTrabajadores": 9,
    "trabajadores": [
      "CALIX LOPEZ",
      "CRISTIAN GARCIA",
      "Eduardo Bastardo",
      "Francisco Siso",
      "Jesús Areyan",
      "Julio Hernández",
      "Luis Guzmán",
      "Pedro Santana",
      "TOMAS GUEVARA"
    ],
    "principalesLabores": "LAVADO DE EQUIPO • REVISION DE ENTRADA DE AGUA EN SISTEMA GASOIL • COMPLETADO NIVELES DE FLUIDOS, LIMPIEZA DE RADIADOR • ENGRASE DE EQUIPO"
  },
  {
    "cuenta": "EEE-C-VH52",
    "equipo": "Pick Up Mazda BT-50 2WD - Placa 04XFAJ",
    "tipo": "Vehiculos livianos",
    "totalHoras": 116.0,
    "registros": 22,
    "cantTrabajadores": 7,
    "trabajadores": [
      "DAVID GARATE",
      "Enderson Vera",
      "Jesús Areyan",
      "Julio Hernández",
      "LUIS DIAZ",
      "Oswaldo López",
      "Pedro Avendaño"
    ],
    "principalesLabores": "INSTALACION DE SENSOR MAF NUEVO, INSTALACION DE RADIADOR REPARADO CON TANQUE SUPERIOR NUEVO • DESMONTAJE DE RADIADOR • REEMPLAZO DE CREMALLERA ELEVAVIDRIOS PUERTA DELANTERA IZQUIERDA NUEVA • INSTALACION DE BUJIAS NUEVAS NGK, CALIBRACION DE CUERPO ACELERACION, INSTALACION DE SENSOR MAF DE VH19, PRUEBAS DE EQUIPO"
  },
  {
    "cuenta": "EEE-C-EX01",
    "equipo": "Excavadora Caterpillar 3200D Serial: CAT032DHBWZ00282",
    "tipo": "Equipos Especiales",
    "totalHoras": 107.0,
    "registros": 30,
    "cantTrabajadores": 14,
    "trabajadores": [
      "CALIX LOPEZ",
      "Eduardo Bastardo",
      "Francisco Siso",
      "Hector Sánchez",
      "Jesús Sánchez",
      "Josué Solorzano",
      "Julio Hernández",
      "Luis Guzmán",
      "Líno García",
      "Oswaldo López",
      "Pablo León",
      "Pedro Santana",
      "REPARACIÓN REALIZADA POR EXTERNO",
      "TOMAS GUEVARA"
    ],
    "principalesLabores": "INSTALACION DE BALDE BOCINA FABRICADA LADO DERECHO, ENGRASE PASADORES BALDE • LAVADO DE RADIADOR • AJUSTE DE CORREA UNICA, ENGRASE EQUIPO • INSTALACION DE VIDRIO DELANTERO CABINA NUEVO"
  },
  {
    "cuenta": "EEE-C-VH45",
    "equipo": "Pick Up Mazda BT-50 2WD 2.2 - Placa A46BT6V",
    "tipo": "Vehiculos livianos",
    "totalHoras": 106.0,
    "registros": 20,
    "cantTrabajadores": 4,
    "trabajadores": [
      "DAVID GARATE",
      "Jesús Areyan",
      "Oswaldo López",
      "Pedro Avendaño"
    ],
    "principalesLabores": "PRUEBAS DE EQUIPO • REVISION DE ELEVACION DE TEMPERATURA MOTOR, ELIMINADO TERMOSTATO, PREBAS DE EQUIPO • REEMPLAZO TAPA RADIADOR USADA DE VH46 • REPARACION DE LUCES TRASERAS"
  },
  {
    "cuenta": "EEE-C-VH48",
    "equipo": "Pick Up Mazda BT-50 2WD 2.6 - Placa A46AT6B",
    "tipo": "Vehiculos livianos",
    "totalHoras": 88.0,
    "registros": 16,
    "cantTrabajadores": 7,
    "trabajadores": [
      "DAVID GARATE",
      "Enderson Vera",
      "Jesús Areyan",
      "Josué Solorzano",
      "Omar Marín",
      "Oswaldo López",
      "Pedro Avendaño"
    ],
    "principalesLabores": "INSTALACION DE PILA BOMBA GASOLINA NUEVA, CONECTOR PILA GASOLINA NUEVO • DESMONTAJE TANQUE GASOLINA, DESMONTAJE BOMBA GASOLINA DAÑADA, REEMPLAZO PILA BOMBA NUEVA, INSTALACION TANQUE • REEMPLAZO DE BOMBIN SUPERIOR E INFERIOR DE EMBRAGUE NUEVOS • LAVADO EQUIPO, ARPIRADO EQUIPO, INSTALACION DE ALFOMBRAS NUEVAS"
  },
  {
    "cuenta": "EEE-C-RE02",
    "equipo": "Retroexcavadora Case 580M  - Serial: N6C411548",
    "tipo": "Equipos Especiales",
    "totalHoras": 78.0,
    "registros": 17,
    "cantTrabajadores": 5,
    "trabajadores": [
      "CALIX LOPEZ",
      "Francisco Siso",
      "Luis Guzmán",
      "Pedro Santana",
      "TOMAS GUEVARA"
    ],
    "principalesLabores": "DESARMADO DE BOMBA HIDRAULICA PRINCIPAL • DESMONTAJE DE BOMBA HIDRAULICA PRINCIPAL • DESMONTAJE DE GUAYA DE ACELERACION TRASERA • CONTINUACION ARMADO BOMBA HIDRAULICA PRINCIPAL CON SELLOS Y ESTOPERAS NUEVAS, INSTALACIOND DE BOMBA HIDRAULICA PRINCIPAL REPARADA, SUMINISTRO ACEITE HIDRAULICO, INSTALACION DE CAUCHOS TRASEROS, LAVADO EQUIPO, ENGRASE EQUIPO"
  },
  {
    "cuenta": "SS-H-C-035",
    "equipo": "TO04 Torno Paralelo BREDA 300",
    "tipo": "TORNO",
    "totalHoras": 76.0,
    "registros": 11,
    "cantTrabajadores": 1,
    "trabajadores": [
      "Carlos Mata"
    ],
    "principalesLabores": "MANTENIMIENTO Y SERVICIO • MANTENIMIENTO Y SERVICIO DE LA PARTE MECÁNICA DEL TORNO 4 • MANTENIMIENTO Y SERVICIO, PROCESO DE ARMADO DEL TORNO • MANTENIMIENTO TORNO TO04"
  },
  {
    "cuenta": "EEE-C-MC01",
    "equipo": "Montacargas Caterpillar  DP50K - 5TN Serial: AT28B51453",
    "tipo": "Montacargas",
    "totalHoras": 71.0,
    "registros": 20,
    "cantTrabajadores": 7,
    "trabajadores": [
      "Eduardo Bastardo",
      "Francisco Siso",
      "Jesús Areyan",
      "Josué Solorzano",
      "Julio Hernández",
      "Luis Guzmán",
      "Pedro Santana"
    ],
    "principalesLabores": "REVISION Y COMPLETACION DE FLUIDOS • REVISION Y COMPLETACION FLUIDOS • DESMONTAJE DE MANGUERAS HIDRAULICAS, FABRICACION E INSTALACION DE 2 MANGUERAS HIDRAULICAS NUEVAS • DESMONTAJE DE CORREA Y POLEA TENSORA VENTILADOR, REEMPLAZO DE RODAMIENTO 6301-2RS POLEA TENSORA VENTILADOR, INSTALACION DE POLEA TENSORA Y CORREA VENTILADOR 17530 NUEVA"
  },
  {
    "cuenta": "MOVILIZACIONES",
    "equipo": "MOVILIZACIONES DE CHOFERES",
    "tipo": "Otros",
    "totalHoras": 71.0,
    "registros": 9,
    "cantTrabajadores": 4,
    "trabajadores": [
      "Eduardo Bastardo",
      "Enderson Vera",
      "Líno García",
      "Pablo León"
    ],
    "principalesLabores": "ASISTENCIA CURSO DE EXTINTORES • VIAJE A BARCELONA PARA TRASLADO DE EQUIPOS LOW BOY • ASISTENCIA A CURSO OPERADOR MONTACARGA"
  },
  {
    "cuenta": "TT-A-C-207",
    "equipo": "Mantto herramientas y accesorios - Almacén",
    "tipo": "Mantenimiento y Adecuaciones",
    "totalHoras": 69.0,
    "registros": 21,
    "cantTrabajadores": 4,
    "trabajadores": [
      "Alexander Mérida",
      "Carlos Mata",
      "Lismil Acosta",
      "Marcos Narváez"
    ],
    "principalesLabores": "MANTENIMIENTO Y REPARACIÓN DE ESMERILES ELÉCTRICOS, CAMBIO DE CARBONES • REPARACIÓN DE MÁQIONA DE SOLDAR DC600, REPARACIÓN DE CABLEADO • MANTENIMIENTO Y REPARACIÓN DE MÁQUINAS DE SOLDAR • REPARACIÓN DE ESMERILES ELÉCTRICOS"
  },
  {
    "cuenta": "EEI-C-GR26",
    "equipo": "Grua Grove RT750 50TN Serial: 87669",
    "tipo": "Grúas",
    "totalHoras": 67.0,
    "registros": 25,
    "cantTrabajadores": 7,
    "trabajadores": [
      "CRISTIAN GARCIA",
      "Eduardo Bastardo",
      "Francisco Siso",
      "Jesús Areyan",
      "Julio Hernández",
      "Luis Guzmán",
      "Pedro Santana"
    ],
    "principalesLabores": "REVISION Y COMPLETACION DE FLUIDOS • LAVADO DE EQUIPO • REVISION Y COMPLETACION FLUIDOS • INSTALACION DE MANGUERA HIDRAULICA NUEVA"
  },
  {
    "cuenta": "EEA-C-BS02",
    "equipo": "Autobus  Encava ENT-3100 - PLaca: 613XLK",
    "tipo": "Autobuses",
    "totalHoras": 66.0,
    "registros": 11,
    "cantTrabajadores": 7,
    "trabajadores": [
      "Francisco Siso",
      "Hector Sánchez",
      "Jesús Sánchez",
      "Josué Solorzano",
      "Julio Hernández",
      "Líno García",
      "REPARACIÓN REALIZADA POR EXTERNO"
    ],
    "principalesLabores": "INSTALACION DE VIDRIO PUERTA TRASERA • DESMONTAJE DE TAMBOR DE FRENO Y ARTILLERIA DELANTERO IZQUIERDO, INSTALACION DE TAMBOR Y ARTILLERIA DELANTERA IZQUIRDA USADA DEL BS03, DESMONTAJE DE BARRA LARGA DIRECCION, REEMPLAZO DE TERMINALES BARRA LARGA DIRECCION NUEVOS • REEMPLAZO DE 2 CAUCHOS 11.00R20 DELANTEROS NUEVOS • REEMPLAZO ACEITE MOTOR, FILTRO CEITE MOTOR, FILTRO GASOIL 1° 2°, LAVADO EQUIPO, ENGRASE EQUIPO, AJUSTE DE SUSPENSION, AJUSTE DE COMPRESOR Y BOMBA DIRECCION"
  },
  {
    "cuenta": "EEE-C-MC06",
    "equipo": "Montacargas  Hyster H50XL - 2.5TN Serial: C177B02252L",
    "tipo": "Montacargas",
    "totalHoras": 63.0,
    "registros": 17,
    "cantTrabajadores": 8,
    "trabajadores": [
      "CALIX LOPEZ",
      "CRISTIAN GARCIA",
      "Francisco Siso",
      "Hector Sánchez",
      "Jesús Sánchez",
      "Josué Solorzano",
      "LUIS DIAZ",
      "TOMAS GUEVARA"
    ],
    "principalesLabores": "DESMONTAJE DE CILINDRO HIDRAULICO DIRECCION • INSTALACION DE CILINDRO HIDRAULICO DIRECCION REPARADO (NO FUNCIONO) • RECTIFICACION DE TAPA CILINDRO DIRECCION • RELLENADO DE TAPA CILINDRO DE DIRECCION"
  },
  {
    "cuenta": "EEE-C-VH19",
    "equipo": "Pick up Mazda BT-50 2WD - Placa: A50BO4M",
    "tipo": "Vehiculos livianos",
    "totalHoras": 63.0,
    "registros": 13,
    "cantTrabajadores": 7,
    "trabajadores": [
      "DAVID GARATE",
      "Josué Solorzano",
      "Julio Hernández",
      "Oswaldo López",
      "Pedro Avendaño",
      "REPARACIÓN REALIZADA POR EXTERNO",
      "TOMAS GUEVARA"
    ],
    "principalesLabores": "ENDEREZADO DE GUARDAFANGO DELANTERO DERECHO • CULMINADO DE TREN DELANTERO, MUÑONES MESETAS SUPERIORES E INFERIORES NUEVOS, TERMINALES INTERNOS Y EXTERNOS NUEVOS, BRAZO LOCO NUEVO, BRAZO PITMAN NUEVO, GOMAS GUARDAPOLVOS TRIPOIDES INTERNOS Y EXTERNOS NUEVOS, INSTALACION DE AMORTIGUADORES DELANTEROS NUEVOS • CONTINUACION DE REPARACION DE TREN DELANTERO • REEMPLAZO DE TERMINALES INTERNOS Y EXTERNOS DE DIRECCION NUEVOS, BRAZO PITMAN NUEVO"
  },
  {
    "cuenta": "EEI-C-GR12",
    "equipo": "Grua Grove RT 740B - 40TN Serial 84688",
    "tipo": "Grúas",
    "totalHoras": 61.0,
    "registros": 20,
    "cantTrabajadores": 4,
    "trabajadores": [
      "Eduardo Bastardo",
      "Francisco Siso",
      "Luis Guzmán",
      "Pedro Santana"
    ],
    "principalesLabores": "REVISION Y REPARACION DE FLUIDOS, REPARACION DE GUAYA WINCHE • REPARACION DE SOPORTE TENSOR CORREA, INSTALACION DE SOPORTE Y TENSOR DE CORREA, INSTALACION DE CORREA UNICA 8PK1525 NUEVA • REEMPLAZO DE BOMBA DE AGUA NUEVA, CORREA UNICA NUEVA 8PK1525, DESMONTAJE DE TUBERIA DE ESCAPE, REPARACION TUBERIA ESCAPE, INSTALACION DE TUBERIA ESCAPE REPARACION, INSTALACION DE TUBERIA ESCAPE REPARADA • REVISION FUGA AGUA, DESMONTAJE DE CORREA UNICA"
  },
  {
    "cuenta": "EEI-C-GR01",
    "equipo": "Grua P&H R150 - 15TN Serial 37406",
    "tipo": "Grúas",
    "totalHoras": 58.0,
    "registros": 17,
    "cantTrabajadores": 4,
    "trabajadores": [
      "Francisco Siso",
      "Julio Hernández",
      "Luis Guzmán",
      "Pedro Santana"
    ],
    "principalesLabores": "FABRICACION E INSTALACION DE MANGUERA HIDRAULICA • DESMONTAJE DE 1 MANGUERA HIDRAULICA DAÑADA • DESARMADO DE 2 CILINDROS HIDRAULICOS DIRECCION, ARMADO DE 2 CILINDROS DIRECCION CON KIT SELLOS NUEVOS, INSTALACION DE 2 CILINDROS HIDRAULICOS DE DIRECCION REPARADOS CON KIT SELLOS NUEVOS • LAVADO DE EQUIPO"
  },
  {
    "cuenta": "EEI-C-ML01",
    "equipo": "Manlift  Terex TB85",
    "tipo": "Equipos Especiales",
    "totalHoras": 57.0,
    "registros": 12,
    "cantTrabajadores": 4,
    "trabajadores": [
      "Eduardo Bastardo",
      "Jesús Areyan",
      "Julio Hernández",
      "LUIS DIAZ"
    ],
    "principalesLabores": "DESMONTAJE DE VALVULA SWIVEL ROTACION, RECTIFICACION DE ROSCA VALVULA SWIVEL ROTACION CESTA, INSTALACION DE VALVULA SWIVEL ROTACION CESTA, ESTAÑADO DE CABLEADO ELECTRICO • CONEXION DE CABLEADO ELECTRICO CESTA, PRUEBAS DE MOVIMIENTOS • CONEXION DE CABLEADO ELECTRICO CESTA/CUERPO VALVULAS • DESMONTAJE DE CABLEADO ELECTRICO CESTA/TELESCOPICO, INSTALACION DE CABLEADO 1X25 NUEVO TELESCOPICO CESTA MANDOS"
  },
  {
    "cuenta": "EEM-C-CA04",
    "equipo": "Camion Plataforma Ford Cargo 815 - Placa: A11AI5B",
    "tipo": "Camiones",
    "totalHoras": 54.0,
    "registros": 12,
    "cantTrabajadores": 8,
    "trabajadores": [
      "CALIX LOPEZ",
      "Enderson Vera",
      "Francisco Siso",
      "Hector Sánchez",
      "Jesús Sánchez",
      "Josué Solorzano",
      "REPARACIÓN REALIZADA POR EXTERNO",
      "TOMAS GUEVARA"
    ],
    "principalesLabores": "REPARACION DE PULMON DE FRENOS 16/24 • REPARACION DE TREN DELANTERO, DESMONTAJE DE CAUCHOS DELANTEROS, REEMPLAZO DE TERMINALES BARRA LARGA DIRECCION NUEVOS, ESTOPERA PUNTA EJE DELANTERA DERECHA NUEVA, REVISION PASADORES DE RUEDAS, AJUSTE DE RODAMIENTOS DELANTEROS, INSTALACION DE 2 CAUCHOS 215/75R17.5 NUEVOS POS#1 #2 • SERVICIO DE ALINEACION • REEMPLAZO 2 CAUCHOS DELANTEROS NUEVOS, 215/75R17.5, SERVICIO DE ALINEACION"
  },
  {
    "cuenta": "EEE-C-CA05",
    "equipo": "Camion Furgon Ford Cargo 815 - Placa: A11AI8B",
    "tipo": "Camiones",
    "totalHoras": 53.0,
    "registros": 14,
    "cantTrabajadores": 10,
    "trabajadores": [
      "CRISTIAN GARCIA",
      "Eduardo Bastardo",
      "Enderson Vera",
      "Francisco Siso",
      "Hector Sánchez",
      "JUAN GONZALEZ",
      "Jesús Areyan",
      "Jesús Sánchez",
      "LUIS DIAZ",
      "Pedro Avendaño"
    ],
    "principalesLabores": "INSTALACION DE TURBO COMPRESOR HX30N NUEVO, CALIBRACION DE VALVULAS, VARILLA DE ACEITE, FABRICACION E INSTALACION DE MANGUERA AGUA COMPRESOR, SENSOR TEMPETARATURA NUEVO • DESARMADO Y REPARACION DE ALTERNADOR CON RODAMIENTOS NUEVOS • REVISION DE FALLA SISTEMA NEUMATICO, DRENAJE TANQUE AIRE, REEMPLAZO DE GOBERNADOR DE AIRE NUEVO • REVISION DE FALLA SISTEMA NEUMATICO, REEMPLAZO VALVULA DE ALIVIO 1/4\" NPT NUEVA"
  },
  {
    "cuenta": "EEE-C-MC07",
    "equipo": "Montacargas Hyster H18.00XM-12 - 18TN Serial: A236E016353F",
    "tipo": "Montacargas",
    "totalHoras": 52.0,
    "registros": 11,
    "cantTrabajadores": 5,
    "trabajadores": [
      "CALIX LOPEZ",
      "CRISTIAN GARCIA",
      "Francisco Siso",
      "Julio Hernández",
      "TOMAS GUEVARA"
    ],
    "principalesLabores": "INSTALACION DE PASADOR DE DIRECCION REPARADO, INSTALACION DE CAUCHOS TRASEROS, INSTALACION DE ALFORMBRA DE PISO CABINA • ARMADO DE VALVULA HIDRAULICA DE FRENOS CON KIT SELLOS NUEVOS, INSTALACION DE VALVULA HIDRAULICA DE FRENOS, RELLENADO / MAQUINADO E INSTALACION DE PASADOR DIRECCION LADO DERECHO • DESMONTAJE DE PASADORES DE CILINDRO DE DIRECCION • DESMONTAJE DE VALVULA DE FRENOS HIDRAULICOS"
  },
  {
    "cuenta": "EQUIPOS EXTERNOS",
    "equipo": "Sin descripción",
    "tipo": "Otros",
    "totalHoras": 52.0,
    "registros": 9,
    "cantTrabajadores": 7,
    "trabajadores": [
      "DAVID GARATE",
      "Eduardo Bastardo",
      "Francisco Siso",
      "Julio Hernández",
      "Luis Guzmán",
      "Oswaldo López",
      "Pedro Santana"
    ],
    "principalesLabores": "FABRICACION DE MANGUERA HIDRAULICA NUEVA, INSTALACION DE MANGUERA, SUMINISTRO ACEITE DIRECCION, PRUEBAS DE SISTEMA DIRECCION • DESMONTAJE DE MANGUERA HIDRAULICA DIRECCION, FABRICACION E INSTALACION DE MANGUERA HIDRAULICA DIRECCION • REPARACION TREN DELANTERO, BUJES MESETAS SUPERIORES, BUJES MESETAS INFERIORES, MUÑONES DE MESETAS SUPERIORES, MUÑONES MESETAS INFERIORES, TERMINALES Y ROTULAS DIRECCION NUEVOS, GUARDA POLVO DE ROTUTAS, GEMELOS NUEVOS, GOMAS INTERNAS Y EXTERNAS TRIPOIDES • FABRICACION DE 2 MANGUERAS HIDRAULICAS"
  },
  {
    "cuenta": "EEA-C-BS15",
    "equipo": "Autobus Encava ENT-3300 - Placa: 6036A1Y",
    "tipo": "Autobuses",
    "totalHoras": 51.0,
    "registros": 10,
    "cantTrabajadores": 8,
    "trabajadores": [
      "CALIX LOPEZ",
      "DAVID GARATE",
      "Eduardo Bastardo",
      "Hector Sánchez",
      "Jesús Sánchez",
      "Josué Solorzano",
      "Oswaldo López",
      "TOMAS GUEVARA"
    ],
    "principalesLabores": "REEMPLAZO DE CAUCHOS 315/80R22.5 DELANTEROS Y TRASEROS NUEVOS MARCA EVERTON • DESMONTAJE PUNTA EJE TRASERA IZQUIERDA, CORRECCION DE FUGA ACEITE PUNTA EJE TRASERA IZQUIERDA • ADECUACION DE TANQUE GASOIL • INSTALACION DE AFTER COOLER CON SERVICIO, RADIADOR REPARADO, REEMPLAZO ASPA VENTILADOR USADA DE BS03, CORNETA DE AIRE NUEVA, SUMINISTRO REFRIGERANTE RADIADOR"
  },
  {
    "cuenta": "EEE-C-MN01",
    "equipo": "Motoniveladora John Deere 670G SERIAL: 1DW670GXHCC642696",
    "tipo": "Equipos Especiales",
    "totalHoras": 50.0,
    "registros": 16,
    "cantTrabajadores": 7,
    "trabajadores": [
      "CALIX LOPEZ",
      "CRISTIAN GARCIA",
      "DAVID GARATE",
      "Jesús Areyan",
      "Josué Solorzano",
      "Julio Hernández",
      "TOMAS GUEVARA"
    ],
    "principalesLabores": "ENGRASE DE EQUIPO, LAVADO • DESMONTAJE DE CAUCHO, REPARACION E INSTALACION DE CAUCHO POS#1 • DESMONTAJE, REPARACION E INSTALACION DE CAUCHO POS#4 • DESMONTAJE, REPARACION E INSTALACION DE CAUCHO POS#4 #5"
  },
  {
    "cuenta": "EEA-C-BS01",
    "equipo": "Autobus  Encava ENT-3300 - PLaca: A83AH9B",
    "tipo": "Autobuses",
    "totalHoras": 48.0,
    "registros": 7,
    "cantTrabajadores": 5,
    "trabajadores": [
      "Eduardo Bastardo",
      "Enderson Vera",
      "Francisco Siso",
      "Hector Sánchez",
      "Jesús Sánchez"
    ],
    "principalesLabores": "REVISION DE FUGA AGUA, DESMONTAJE DE PARACHOQUE DELANTERO. AFTER COOLER, RADIADOR, INSTALACION DE RADIADOR REPARADO, AFTER COOLER • REEMPLAZO DE MANGUERA AFTER COOLER NUEVA, REVISION DE FUGA AGUA RADIADOR • DESMONTAJE MOTOR DE ARRANQUE, INSTALACION DE MOTOR DE ARRANQUE REPARADO, ESPURGUE SISTEMA DE GASOIL, ENCENDIDO, PRUEBAS DE EQUIPO"
  },
  {
    "cuenta": "EEA-C-BS05",
    "equipo": "Autobus HINO 500 Fortier - PLaca: A2082AG",
    "tipo": "Autobuses",
    "totalHoras": 47.0,
    "registros": 9,
    "cantTrabajadores": 5,
    "trabajadores": [
      "CRISTIAN GARCIA",
      "Francisco Siso",
      "Hector Sánchez",
      "Jesús Sánchez",
      "Josué Solorzano"
    ],
    "principalesLabores": "DESARMADO DE FRENOS DELANTEROS LADO DERECHO, REEMPLAZO DE BANDAS DE FRENOS DELANTERA DERECHA NUEVAS, REEMPLAZO DE SELLOS CILINDROS DE FRENOS DELANTEROS DERECHO NUEVOS, ESPURGUE DE FRENOS • REVISION DE FRENOS, GRADUACION DE FRENOS DELANTEROS Y TRASEROS, REPARACION DE SOPORTES PORTA EQUIPAJE • AJUSTE DE BARRA LARGA Y CORTA DE DIRECCION • GRADUACION DE FRENOS DELANTEROS, REEMPLAZO DE BARRA CORTA DIRECCION NUEVA"
  },
  {
    "cuenta": "EEE-C-EX03",
    "equipo": "Excavadora Caterpillar 302.5 Serial: 4AZ00621",
    "tipo": "Equipos Especiales",
    "totalHoras": 47.0,
    "registros": 11,
    "cantTrabajadores": 5,
    "trabajadores": [
      "CALIX LOPEZ",
      "Enderson Vera",
      "Francisco Siso",
      "Jesús Areyan",
      "TOMAS GUEVARA"
    ],
    "principalesLabores": "REVISION Y COMPLETACION DE FLUIDOS • INSTALACION CILINDRO HIDRAULICO PLUMA REPARADO CON SELLOS NUEVOS, COMPLETADO NIVEL ACEITE HIDRAULICO, REPARACION DE SOPORTES MOTOR • DESMONTAJE Y DESARMADO DE CILINDRO DE PLUMA • REEMPLAZO SENSOR PRESION DE ACEITE MOTOR"
  },
  {
    "cuenta": "EEM-C-CA13",
    "equipo": "Camion Pickman Iveco Eurocargo 170E22 - Placa: A32AA5S",
    "tipo": "Camiones",
    "totalHoras": 46.0,
    "registros": 10,
    "cantTrabajadores": 4,
    "trabajadores": [
      "Eduardo Bastardo",
      "Francisco Siso",
      "Luis Guzmán",
      "Pedro Santana"
    ],
    "principalesLabores": "REEMPLAZO DE SWITCH DE ENCENDIDO NUEVO • REVISION DE FALLA EN SWITCH ENCENDIDO • REEMPLAZO 2 RETROVISORES NUEVOS • DESMONTAJE DE MANGUERAS HIDRAULICAS BRAZO PITCMAN (2), FABRICACION E INSTALACION DE 2 MANGUERAS HIDRAULICAS BRAZO PITCMAN"
  },
  {
    "cuenta": "EEM-C-RM28",
    "equipo": "Semirremolque Plataforma - Placa 56FSAR",
    "tipo": "Semirremolques",
    "totalHoras": 45.0,
    "registros": 7,
    "cantTrabajadores": 7,
    "trabajadores": [
      "Arquimedes Guerra",
      "CRISTIAN GARCIA",
      "Francisco Siso",
      "Josué Solorzano",
      "Julio Hernández",
      "LUIS FERNANDO",
      "RICARDO GONZALEZ"
    ],
    "principalesLabores": "DESARMADO DE CILINDRO HIDRAULICO TELESCOPICO DE LEVANTE VOLQUETA • DESMONTAJE CILINDRO TELESCOPICO DE LEVANTE"
  },
  {
    "cuenta": "EEE-C-RE03",
    "equipo": "Retroexcavadora John Deere 310G Serial: T0310GX963029",
    "tipo": "Equipos Especiales",
    "totalHoras": 42.0,
    "registros": 18,
    "cantTrabajadores": 3,
    "trabajadores": [
      "Eduardo Bastardo",
      "Luis Guzmán",
      "Pedro Santana"
    ],
    "principalesLabores": "REVISION Y REPARACION DE FLUIDOS • REVISION Y COMPLETACION DE FLUIDOS, ENGARSE EQUIPO • CORRECCION DE FUGA ACEITE HIDRAULICO POR MARTILLO HIDRAULICO, COMPLETADO DE NIVELES FLUIDOS • REVISION Y COMPLETACION FLUIDOS, ENGRASE EQUIPO"
  },
  {
    "cuenta": "EEA-C-BS14",
    "equipo": "Autobus Encava ENT-3300 - Placa: 6199A3P",
    "tipo": "Autobuses",
    "totalHoras": 42.0,
    "registros": 6,
    "cantTrabajadores": 4,
    "trabajadores": [
      "Eduardo Bastardo",
      "Enderson Vera",
      "Hector Sánchez",
      "Jesús Sánchez"
    ],
    "principalesLabores": "REVISION DE FRENOS, REEMPLAZO DE BANDAS DE FRENOS DELANTERO IZQUIERDO NUEVOS • REPARACION DE SISTEMA ELECTRICO MOTOR PUERTA TRASERA • REVISION DE FUGA RADIADOR, DESMONTAJE DE RADIADOR, AFTER COOLER, PARACHOQUE DELANTERO, LAVADO DE AFTER COOLER , REEMPLAZO TURBOCOMPRESOR HX40 NUEVO, INSTALACION DE RADIADOR CON SERVICIO, AFTER COOLER Y PARACHOQUES DELANTERO,"
  },
  {
    "cuenta": "EEE-C-MC08",
    "equipo": "Montacargas Caterpillar  V300B - 14TN Serial: 86Y625",
    "tipo": "Montacargas",
    "totalHoras": 37.0,
    "registros": 10,
    "cantTrabajadores": 6,
    "trabajadores": [
      "CALIX LOPEZ",
      "CRISTIAN GARCIA",
      "Eduardo Bastardo",
      "Francisco Siso",
      "Julio Hernández",
      "TOMAS GUEVARA"
    ],
    "principalesLabores": "REEMPLAZO ACEITE MOTOR, FILTRO ACEITE MOTOR (2), FILTRO GASOIL, ENGRASE DE EQUIPO, COMPLETADO NIVELES FLUIDOS, REEMPLAZO FILTRO TRANSMISION, ACEITE TRANSMISION • DESMONTAJE DE MANGUERA HIDRAULICA, FABRICACION E INSTALACION DE MANGUERA HIDRAULICA NUEVA, SUMINISTRO ACEITE HIDRAULICO • REVISION FUGAS ACEITE, FABRICACION E INSTALACION DE 2 MANGUERAS HIDRAULICASM, COMPLETADAS NIVELES FLUIDOS, LAVADO DE EQUIPO • INSTALACION DE GUAYA ACELERACION NUEVA"
  },
  {
    "cuenta": "EEM-C-CH06",
    "equipo": "Chuto Mack CH613 - Placa: A25AB2E",
    "tipo": "Chutos",
    "totalHoras": 36.0,
    "registros": 9,
    "cantTrabajadores": 7,
    "trabajadores": [
      "Arquimedes Guerra",
      "Eduardo Bastardo",
      "Julio Hernández",
      "LUIS FERNANDO",
      "Luis Guzmán",
      "Pedro Santana",
      "RICARDO GONZALEZ"
    ],
    "principalesLabores": "REEMPLAZO DE RESERVORIO SUPERIOR DE REFRIGERANTE NUEVO • LAVADO EQUIPO • REEMPLAZO ACEITE MOTOR FILTRO ACEITE MOTOR. FILTRO GASOIL 1° 2° 3°, LAVADO EQUIPO, ENGRASE EQUIPO, INSTALACION DE RESERVORIO REFRIGERANTE REPARADO • DESMONTAJE RESERVORIO DE REFRIGERANTE, REPARACION DE RESERVORIO REFRIGERANTE"
  },
  {
    "cuenta": "TT-I-C-033",
    "equipo": "Adecuaciones y/o mejoras TIMACA",
    "tipo": "Mantenimiento y Adecuaciones",
    "totalHoras": 36.0,
    "registros": 14,
    "cantTrabajadores": 2,
    "trabajadores": [
      "Lismil Acosta",
      "Marcos Narváez"
    ],
    "principalesLabores": "CAMBIO DE LÁMPARAS DAÑADAS • REVISIÓN DEL SISTEMA DE ENCENDIDO DEL CALENTADOR DE ARENA • REVISIÓN Y REPARACIÓN DE FUENTE DE PODER DEL DEPARTAMENTO DE TECNOLOGIA • ADECUACIÓN DE VIDRIOS DE LA FACHADA DEL EDIFICIO ADMINISTRATIVO"
  },
  {
    "cuenta": "EEE-C-VH15",
    "equipo": "Ambulancia Chevrolet Cargo Van - Placa: A06AI2I",
    "tipo": "Vehiculos livianos",
    "totalHoras": 35.0,
    "registros": 12,
    "cantTrabajadores": 6,
    "trabajadores": [
      "CALIX LOPEZ",
      "Jesús Areyan",
      "Josué Solorzano",
      "LUIS DIAZ",
      "REPARACIÓN REALIZADA POR EXTERNO",
      "TOMAS GUEVARA"
    ],
    "principalesLabores": "SERVICIO LAVADO • SERVICIO AIRE ACONDICIONADO (GARANTIA) • REEMPLAZO MANILLA EXTERNA PUERTA IZQUIERDA NUEVA • SERVICIO DE AIRE ACONDICIONADO"
  },
  {
    "cuenta": "TTI-C-0105",
    "equipo": "Adecuación Patio Externo Timaca",
    "tipo": "Otros",
    "totalHoras": 35.0,
    "registros": 11,
    "cantTrabajadores": 2,
    "trabajadores": [
      "Lismil Acosta",
      "Marcos Narváez"
    ],
    "principalesLabores": "REPARACIÓN DE GUAYA DE ALIMIENTACIÓN DE LAS TORRES DE ALUMBRADO • ADECUACIÓN DE CRUCETA PARA EL POSTE DEL BANCO DE TRANSFORMADORES DEL PATIO EXTERNO • INSTALACIÓN DE CONTACTOR Y FOTOCELDA PARA EL CONTROL DE LA ILUMINACIÓN DEL PATIO EXTERNO • ADECUACIÓN DE TORRES DE ALUMBRADO DE ALMACÉN CENTRAL"
  },
  {
    "cuenta": "EEA-C-BS10",
    "equipo": "Autobus Encava ENT-330063 - Placa: A26DP8K",
    "tipo": "Autobuses",
    "totalHoras": 34.0,
    "registros": 12,
    "cantTrabajadores": 8,
    "trabajadores": [
      "Arquimedes Guerra",
      "Eduardo Bastardo",
      "Hector Sánchez",
      "Jesús Sánchez",
      "Josué Solorzano",
      "Julio Hernández",
      "LUIS FERNANDO",
      "RICARDO GONZALEZ"
    ],
    "principalesLabores": "ALINEACION DE CARDAN • REVISION DE FUGA ACEITE FRONTAL MOTOR • REEMPLAZO VALVULA DE AIRE PEDAL Y VALVULA IRE MOTOR • REEMPLAZO ACEITE MOTOR, FILTRO ACEITE MOTOR, FILTRO GASOIL 1° 2° 3°, ENGRASE EQUIPO, LAVADO EQUIPO, REVISION Y COMPLETACION NIVELES FLUIDOS"
  },
  {
    "cuenta": "EEE-C-VH09",
    "equipo": "Pick up Mazda BT-50 2WD - Placa: A51BO4M",
    "tipo": "Vehiculos livianos",
    "totalHoras": 34.0,
    "registros": 6,
    "cantTrabajadores": 5,
    "trabajadores": [
      "DAVID GARATE",
      "Jesús Areyan",
      "Josué Solorzano",
      "Julio Hernández",
      "Oswaldo López"
    ],
    "principalesLabores": "REEMPLAZOA CEITE MOTOR, FILTRO ACEITE MOTOR, FILTRO GASOLINA, COMPLETACION FLUIDOS, INSTALACION DE FAROS TRASEROS STOP NUEVOS, REEMPLAZO BORNE BATERIA, ARMADO DE CAUCHO DE REPUESTO USADO • LAVADO EQUIPO"
  },
  {
    "cuenta": "EEM-C-CH08",
    "equipo": "Chuto Mack Granite - Placa A74DC4K",
    "tipo": "Chutos",
    "totalHoras": 34.0,
    "registros": 5,
    "cantTrabajadores": 4,
    "trabajadores": [
      "DAVID GARATE",
      "Francisco Siso",
      "Julio Hernández",
      "Luis Guzmán"
    ],
    "principalesLabores": "DESMONTAJE DE CAUCHOS POS#3 #4 #7 #8, REEMPLAZO DE BANDAS DE FRENOS NUEVAS POS#3 #5, INSTALACION DE CAUCHOS • REEMPLAZO ACEITE MOTOR, FILTRO ACEITE MOTOR, FILTRO GASOIL 1° 2° 3°, LAVADO EQUIPO"
  },
  {
    "cuenta": "EEA-C-BS06",
    "equipo": "Autobus  Encava ENT-3300 - PLaca: 07ZGAY",
    "tipo": "Autobuses",
    "totalHoras": 33.0,
    "registros": 9,
    "cantTrabajadores": 5,
    "trabajadores": [
      "Eduardo Bastardo",
      "Hector Sánchez",
      "Jesús Areyan",
      "Jesús Sánchez",
      "LUIS DIAZ"
    ],
    "principalesLabores": "DESMONTAJE MOTOR DE ARRANQUE, INSTALACION DE MOTOR DE ARRANQUE REPARADO • DESMONTAJE DE TANQUE RESERVORIO REFIGERANTE, INSTALACION DE RESERVORIO  REPARADO, SUMINISTRO DE REFRIGERANTE RADIADOR • GRADUACION DE FRENOS, REVISION Y COMPLETACION DE FLUIDOS • REPARACION DE LUCES DELANTERAS Y LUCES CRUCE"
  },
  {
    "cuenta": "EEA-C-BS09",
    "equipo": "Autobus Encava ENT-330063 - Placa: 05PGAX",
    "tipo": "Autobuses",
    "totalHoras": 33.0,
    "registros": 11,
    "cantTrabajadores": 8,
    "trabajadores": [
      "CRISTIAN GARCIA",
      "Eduardo Bastardo",
      "Francisco Siso",
      "Hector Sánchez",
      "Jesús Areyan",
      "Jesús Sánchez",
      "Julio Hernández",
      "LUIS DIAZ"
    ],
    "principalesLabores": "REEMPLAZO ACEITE MOTOR, FILTRO GASOIL 1° 2°, REVISION Y REPARACION DE LUCES, SOLDADURA DE ASIENTO PASAJERO • REVISION DE SISTEMA ELECTRICO DE TRANSMISION, LIMPIEZA Y MANTENIMIENTO SISTEMA ELECTRICO TRANSMISION • AUXILIADO DE EQUIPO, REEMPLAZO DE CORREA UNICA MOTOR 8PK1550 NUEVA • LAVADO DE EQUIPO, LAVADO MOTOR, REVISION FUGA ACEITE"
  },
  {
    "cuenta": "EEE-C-VH06",
    "equipo": "Pick up Mazda BT-50 2WD - Placa: A50BO9M",
    "tipo": "Vehiculos livianos",
    "totalHoras": 31.0,
    "registros": 6,
    "cantTrabajadores": 5,
    "trabajadores": [
      "DAVID GARATE",
      "Jesús Areyan",
      "Josué Solorzano",
      "Oswaldo López",
      "REPARACIÓN REALIZADA POR EXTERNO"
    ],
    "principalesLabores": "REEMPLAZO DE MANILLA EXTERNA DELANTERA IZQUIERDA NUEVA • SERVICIO DE A/C • DESMONTAJE, REPARACION E INSTALACION DE CAUCHO POS#3 • COMPLETACION DE NIVELES FLUIDOS, INSTALACION DE FAROS STOP TRASEROS NUEVOS, REVISION DE CERRADURAS Y MANILLAS, LAVADO DE EQUIPO, ASPIRADO EQUIPO, AJUSTE DE RODAMIENTOS, REVISION TREN DELANTERO"
  },
  {
    "cuenta": "GASOLINA",
    "equipo": "Sin descripción",
    "tipo": "Otros",
    "totalHoras": 28.0,
    "registros": 14,
    "cantTrabajadores": 2,
    "trabajadores": [
      "Josué Solorzano",
      "Julio Hernández"
    ],
    "principalesLabores": "SURTIDO GASOLINA E/S VH03/VH04/VH05/VH09/VH15/VH51 • SURTIDO GASOLINA E/S VH03/VH04/VH05/VH09/VH15/VH47/VH50/VH51 • SURTIDO GASOLINA E/S VH03/VH04/VH05/VH09/VH15/VH50/VH51 • SURTIDO GASOLINA E/S VH03/VH04/VH05/VH09/VH50/VH51/VH15"
  },
  {
    "cuenta": "TT-F-CO19",
    "equipo": "Compresor SULLAIR 185 45,5 KW 185 CFM Serial: 201012180072",
    "tipo": "Compresores",
    "totalHoras": 28.0,
    "registros": 8,
    "cantTrabajadores": 5,
    "trabajadores": [
      "Enderson Vera",
      "Francisco Siso",
      "Jesús Areyan",
      "Julio Hernández",
      "Pedro Avendaño"
    ],
    "principalesLabores": "REVISION DE FALLA DE APAGADO, REEMPLAZO FILTRO AIRE PRIMARIO COMPRESOR • INSTALACION DE TUBERIAS DE SALIDAS DE AIRE, FABRICACION E INSTALACION DE SEGURO BATERIAS • INSTALACION DE TIRO REMOLQUE, INSTALACION VALVULA Y SALIDA DE AIRE • REVISION FLUIDOS, ENCENDIDO EQUIPO"
  },
  {
    "cuenta": "AACO24",
    "equipo": "MIDEA 5TN SERIAL C705012870218127400011",
    "tipo": "AIRE ACONDICIONADO",
    "totalHoras": 28.0,
    "registros": 5,
    "cantTrabajadores": 1,
    "trabajadores": [
      "Lismil Acosta"
    ],
    "principalesLabores": "MANTENIMIENTO AIRE ACONDICIONADO DEL AREA VIP DEL CTE, CAMBIO DE RODAMIENTO MOTOR DEL SOPLADOR • MANTENIMIENTO DE AIRE ACONDICIONADO • CAMBIO DE RODAMIENTOS A MOTOR DEL SOPLADOR DEL AIRE ACONDICIONADO DE LA SALA VIP • CAMBIO DE COMPRESOR DE LA SALA VIP DEL CTE"
  },
  {
    "cuenta": "EEM-C-CA09",
    "equipo": "Camion Pickman Ford Cargo 1721 - Placa: A19AC7B",
    "tipo": "Camiones",
    "totalHoras": 27.0,
    "registros": 6,
    "cantTrabajadores": 4,
    "trabajadores": [
      "Francisco Siso",
      "Hector Sánchez",
      "Jesús Areyan",
      "Jesús Sánchez"
    ],
    "principalesLabores": "DESMONTAJE DE VALVULA DE DESCARGA, REPRACION E INSTALACION DE PLACA TRASERA, REPARACION DE VALVULA DESCARGA CON DIAFRAGMA  NUEVO, ENDEREZADO DE TUBERIAS CILINDROS BRAZO PITMAN, REEMPLAZO SOLENOIDE DE APAGADO DE MOTOR NUEVO • REEMPLAZO ACEITE MOTOR, FILTRO ACEITE MOTOR, FILTRO GASOIL 1° 2°, FILTRO REFRIGERANTE, LAVADO DE EQUIPO"
  },
  {
    "cuenta": "TT-F-C-033",
    "equipo": "Prensa N° 4  Verrina - Matricula 11913. Capacidad 400 TN",
    "tipo": "Equipos Taller Fabricacion",
    "totalHoras": 27.0,
    "registros": 4,
    "cantTrabajadores": 1,
    "trabajadores": [
      "Carlos Mata"
    ],
    "principalesLabores": "REALIZANDO FLUCHING • CORRECCION E FUGAS DE ACEITE HIDRAULICO, • CORRECCIÓN DE FUGA DE ACEITE"
  },
  {
    "cuenta": "EEM-C-CA17",
    "equipo": "Camion Pickman Ford Cargo 815 - Placa: A31CE9A",
    "tipo": "Camiones",
    "totalHoras": 26.0,
    "registros": 9,
    "cantTrabajadores": 5,
    "trabajadores": [
      "Francisco Siso",
      "Jesús Areyan",
      "Josué Solorzano",
      "Julio Hernández",
      "LUIS DIAZ"
    ],
    "principalesLabores": "REEMPLAZO DE CORNETA NUEVA, ALARMA RETROCESO NUEVA, INTERRUPTOR RETROCESO USADO • REPARACION Y AJUSTE DE BARRA CORTA DE DIRECCION • INSTALACION DE SENSOR TEMPERATURA , REEMPLAZO DE REFRIGERANTE RADIADOR, PRUEBAS DE EQUIPO • REPARACION DE LUCES"
  },
  {
    "cuenta": "EEM-C-CH10",
    "equipo": "Chuto Mack Granite - Placa A18DH7A",
    "tipo": "Chutos",
    "totalHoras": 25.0,
    "registros": 4,
    "cantTrabajadores": 3,
    "trabajadores": [
      "Arquimedes Guerra",
      "LUIS FERNANDO",
      "RICARDO GONZALEZ"
    ],
    "principalesLabores": "DESMONTAJE, FABRICACION E INSTALACION DE MANGUERA GASOIL, CORRECCION DE SISTEMA NEUMATICO DE FRENOS • REVISION SISTEMA NEUMATICO, DESMONTAJE MANGUERA DE AIRE"
  },
  {
    "cuenta": "EEI-C-GR21",
    "equipo": "Grua Liebherr LR1400 - 140TN Serial W09646000",
    "tipo": "Grúas",
    "totalHoras": 24.0,
    "registros": 5,
    "cantTrabajadores": 4,
    "trabajadores": [
      "Francisco Siso",
      "Josué Solorzano",
      "Julio Hernández",
      "Omar Marín"
    ],
    "principalesLabores": "TRABAJO EN GRUA • FABRICACION DE 2 MNGUERAS HIDRAULICAS • INSTALACION DE CAUCHO 16.00R25 NUEVO POS#11 DESMONTADO DE GR22"
  },
  {
    "cuenta": "EEM-C-CH07",
    "equipo": "Chuto Mack Granite - Placa A20EC3G",
    "tipo": "Chutos",
    "totalHoras": 23.0,
    "registros": 10,
    "cantTrabajadores": 8,
    "trabajadores": [
      "CALIX LOPEZ",
      "CRISTIAN GARCIA",
      "Jesús Areyan",
      "Josué Solorzano",
      "Julio Hernández",
      "LUIS DIAZ",
      "REPARACIÓN REALIZADA POR EXTERNO",
      "TOMAS GUEVARA"
    ],
    "principalesLabores": "REVISION DE TACOMETRO TABLERO • REEMPLAZO DE CORREA UNICA 10PK1660 NUEVA, REVISIONDE FUNCIONAMIENTO MANOMETRO TEMPERATURA • SERVICIO DE A/C • REEMPLAZO DE ACEITE MOTOR, FILTRO ACEITE MOTOR (2), FILTRO ACEITE CENTRIFUGO, FILTRO GASOIL 1° 2° 3°, ENGRASE EQUIPO"
  },
  {
    "cuenta": "EEE-C-CA03",
    "equipo": "Camion Plataforma Ford Cargo 815 - Placa: A12AI1B",
    "tipo": "Camiones",
    "totalHoras": 22.0,
    "registros": 6,
    "cantTrabajadores": 3,
    "trabajadores": [
      "DAVID GARATE",
      "Francisco Siso",
      "Jesús Sánchez"
    ],
    "principalesLabores": "DESMONTAJE DE BALLESTA DELANTERA DERECHA, INSTALACIONDE JUEGO DE BALLESTA DELANTERA DERECHA NUEVA • REVISION Y COMPLETACION FLUIDOS • REVISION DE SUSPENSION • REEMPLAZO DE SEGUROS CAPOT DELANTEROS NUEVOS"
  },
  {
    "cuenta": "EEM-C-CA11",
    "equipo": "Camion Plataforma Ford Cargo 815 - Placa: 78TGBC",
    "tipo": "Camiones",
    "totalHoras": 22.0,
    "registros": 5,
    "cantTrabajadores": 5,
    "trabajadores": [
      "CALIX LOPEZ",
      "CRISTIAN GARCIA",
      "Hector Sánchez",
      "Jesús Sánchez",
      "TOMAS GUEVARA"
    ],
    "principalesLabores": "DESMONTAJE DE FAN CLUTCH, INSTALACION DE FAN CLUTCH NUEVO • REEMPLAZO ACEITE MOTOR, FILTRO ACEITE MOTOR, FILTRO GASOIL 1° 2°, COMPLETADO NIVELES DE FLUIDOS, ENGRASE DE EQUIPO, REEMPLAZO GOMAS BARRA ESTABILIZADORA TRASERA NUEVAS"
  },
  {
    "cuenta": "EEE-C-MC10",
    "equipo": "Montacargas Heli H7- 7TN Serial: 130944182",
    "tipo": "Montacargas",
    "totalHoras": 21.0,
    "registros": 8,
    "cantTrabajadores": 3,
    "trabajadores": [
      "CALIX LOPEZ",
      "Francisco Siso",
      "TOMAS GUEVARA"
    ],
    "principalesLabores": "INSTALACION DE GUAYA DE ACELERACION NUEVA • DESMONTAJE DE GUAYA ACELERACION • REEMPLAZO FILTRO HIDRAULICO NUEVO, ADAPTADO • DESMONTAJE DE FILTRO HIDRAULICO"
  },
  {
    "cuenta": "EEI-C-GR06",
    "equipo": "Grua P&H R200 - 20TN Serial 31192",
    "tipo": "Grúas",
    "totalHoras": 21.0,
    "registros": 4,
    "cantTrabajadores": 2,
    "trabajadores": [
      "Francisco Siso",
      "Josué Solorzano"
    ],
    "principalesLabores": "REEMPLAZO GUAYA APAGADO MOTOR • REPARACION DE CAUCHO 16.00R24 POS#3 • ARMADO DE CAUCHO 16.00R24 NUEVO EN RIN, INSTALACION DE CAUCHO POS#3 NUEVO"
  },
  {
    "cuenta": "EEE-C-VH44",
    "equipo": "Pick Up Mazda BT-50 2WD 2.2 - Placa A51AT7B",
    "tipo": "Vehiculos livianos",
    "totalHoras": 20.0,
    "registros": 2,
    "cantTrabajadores": 2,
    "trabajadores": [
      "DAVID GARATE",
      "Oswaldo López"
    ],
    "principalesLabores": "REEMPLAZO ACEITE MOTOR, FILTRO ACEITE MOTOR, FILTRO GASOLINA, COMPLETADO NICELES DE FLUIDOS, REVISION DE FRENOS"
  },
  {
    "cuenta": "EEA-C-BS11",
    "equipo": "Autobus Encava ENT-330063S - Placa: 48MGAV",
    "tipo": "Autobuses",
    "totalHoras": 20.0,
    "registros": 6,
    "cantTrabajadores": 5,
    "trabajadores": [
      "CRISTIAN GARCIA",
      "Hector Sánchez",
      "Jesús Sánchez",
      "Julio Hernández",
      "LUIS DIAZ"
    ],
    "principalesLabores": "REEMPLAZO ACEITE MOTOR, FILTRO ACEITE MOTOR, FILTRO GASOIL 1° 2°,3°, ENGRASE EQUIPO • REVISION Y REPARACION DE LCES, REVISION MANOMETROS EN TABLERO • ENGRASE DE EQUIPO, AJUSTE SUSPENSION, LAVADO EQUIPO"
  },
  {
    "cuenta": "EEI-C-GR22",
    "equipo": "Grua Liebherr LTM1400 - 400TN Serial W09858000NEL05061",
    "tipo": "Grúas",
    "totalHoras": 20.0,
    "registros": 2,
    "cantTrabajadores": 2,
    "trabajadores": [
      "Arquimedes Guerra",
      "RICARDO GONZALEZ"
    ],
    "principalesLabores": "TORQUEADO DE BANCADA Y BIELAS, INSTALACION DE INYECTORES DE ACEITES NUEVOS, SEPARADORES DE INYECTORES DE ACEITE NUEVOS"
  },
  {
    "cuenta": "EEI-C-GR11",
    "equipo": "Grua P&H R200 - 20TN Serial 44434",
    "tipo": "Grúas",
    "totalHoras": 19.0,
    "registros": 8,
    "cantTrabajadores": 5,
    "trabajadores": [
      "Francisco Siso",
      "Jesús Areyan",
      "Julio Hernández",
      "Luis Guzmán",
      "Pedro Santana"
    ],
    "principalesLabores": "LAVADO GENERAL DE EQUIPO • REEMPLAZO SWITCH DE ENCENDIDO CTP NUEVO, CORECCION DE CORTO CIRCUITO CABLEADO ELECTRICO • FABRICACION DE MANGUERA HIDRAULICA DE TELESCOPICO SAE100R2 1\" X 185 CM, INSTALACION DE MANGUERA HIDRAULICA • DESMONTAJE DE MANGUERA HIDRAULICA TELESCOPICO"
  },
  {
    "cuenta": "EEE-C-VH04",
    "equipo": "Pick Up Mazda BT50 2WD - Placa: A09AU7F",
    "tipo": "Vehiculos livianos",
    "totalHoras": 19.0,
    "registros": 6,
    "cantTrabajadores": 4,
    "trabajadores": [
      "DAVID GARATE",
      "Eduardo Bastardo",
      "Josué Solorzano",
      "Oswaldo López"
    ],
    "principalesLabores": "REEMPLAZO DE MANGUERA DE ADMISION NUEVA • DESMONTAJE DE MESETA DELANTERA IZQUIERDA, REEMPLAZO DE BUJES DE MESETAS DELANTERAS IZQUIERDA SUPERIR NUEVOS, FILTRO DE AIRE NUEVO • REEMPLAZO CEPILLO LIMPIAPARABRISAS 18\" NUEVO • REPARACION DE CAUCHO"
  },
  {
    "cuenta": "EEI-C-GR19",
    "equipo": "Grua Terex RT 665 - 65TN Serial 13762",
    "tipo": "Grúas",
    "totalHoras": 19.0,
    "registros": 10,
    "cantTrabajadores": 3,
    "trabajadores": [
      "Eduardo Bastardo",
      "Luis Guzmán",
      "Pedro Santana"
    ],
    "principalesLabores": "REVISION Y COMPLETACION FLUIDOS • REVISION DE FALLA ENCENDIDO, REEMPLAZO FILTRO GASOIL 1° 2° 3° NUEVOS"
  },
  {
    "cuenta": "AACO26",
    "equipo": "MIDEA 5TN SERIAL C705012870218127400004",
    "tipo": "AIRE ACONDICIONADO",
    "totalHoras": 19.0,
    "registros": 3,
    "cantTrabajadores": 1,
    "trabajadores": [
      "Lismil Acosta"
    ],
    "principalesLabores": "MANTENIMIENTO Y REPARACIÓN, CAMBIO DE COMPRESOR • CAMBIO DE COMPRESOR DE AIRE ACONDICIONADO DE LA PARTE ALTA DEL GIMNASIO • CAMBIO DE COMPRESOR AIRE ACONDICIONADO PARTE ALTA DE"
  },
  {
    "cuenta": "EES-C-MB04",
    "equipo": "MOTOBOMBA DEUZ 12,5 HP 673CM3 SERIAL 6490471",
    "tipo": "MOTOBOMBA",
    "totalHoras": 18.0,
    "registros": 6,
    "cantTrabajadores": 6,
    "trabajadores": [
      "CRISTIAN GARCIA",
      "Enderson Vera",
      "Francisco Siso",
      "JUAN GONZALEZ",
      "Julio Hernández",
      "Pedro Avendaño"
    ],
    "principalesLabores": "REVISION DE FUGA ACEITE MOTOR, COMPLETADO NIVEL DE ACEITE MOTOR • LAVADO DE EQUIPO, REEMPLAZO DE ACEITE MOTOR, FILTRO ACEITE MOTOR, FILTRO GASOIL, REPARACION DE COLA ESCAPE, FABRICACION TAPA ESCAPE COLA"
  },
  {
    "cuenta": "TT-F-CO20",
    "equipo": "Compresor SULLAIR 185 45,5 KW 185 CFM Serial: 201112120050",
    "tipo": "Compresores",
    "totalHoras": 17.0,
    "registros": 6,
    "cantTrabajadores": 5,
    "trabajadores": [
      "CRISTIAN GARCIA",
      "Enderson Vera",
      "Jesús Areyan",
      "Julio Hernández",
      "Pedro Avendaño"
    ],
    "principalesLabores": "REEMPLAZO ACEITE MOTOR, FILTRO ACEITE MOTOR, FILTRO GASOIL 1° 2°, FILTRO HIDRAULICO, ACEITE CORENA S NUEVO • INSTALACION DE TUBERIAS DE SALIDA DE AIRE • REVISION DE FLUIDOS"
  },
  {
    "cuenta": "EEM-C-RM10",
    "equipo": "Semirremolque Lowboy - Placa: A10BJ0S",
    "tipo": "Semirremolques",
    "totalHoras": 17.0,
    "registros": 7,
    "cantTrabajadores": 4,
    "trabajadores": [
      "Eduardo Bastardo",
      "Francisco Siso",
      "Jesús Areyan",
      "Julio Hernández"
    ],
    "principalesLabores": "CONTINUACION REPARACION DE LUCES, INSTALACION DE LUCES TRASERAS NUEVAS, LUCES LATERALES NUEVAS • REEMPLAZO MADERAS DE PISO LOW BOY • INSTALACION DE PLACA DE SERIAL Y MODELO • REEMPLAZO LUCES STOP TRASEROS LED NUEVAS"
  },
  {
    "cuenta": "EEM-C-CA16",
    "equipo": "Camion Pickman Ford Cargo 815 - Placa:  A53BF8G",
    "tipo": "Camiones",
    "totalHoras": 16.0,
    "registros": 3,
    "cantTrabajadores": 3,
    "trabajadores": [
      "CRISTIAN GARCIA",
      "Francisco Siso",
      "Pedro Avendaño"
    ],
    "principalesLabores": "REEMPLAZO DE GUAYA DE ACELERACION (FABRICADA), COMPLETADO DE NIVEL DE FLUIDOS • INSTALACION DE TANQUE HIDRAULICO REPARADO, INSTALACION FILTRO SEPARADOR HIDRAULICO NUEVO, SUMINISTRO ACEITE CORENA S"
  },
  {
    "cuenta": "EEM-C-CA01",
    "equipo": "Camion Plataforma Ford Cargo 815 - Placa:  A11AI4B",
    "tipo": "Camiones",
    "totalHoras": 16.0,
    "registros": 7,
    "cantTrabajadores": 5,
    "trabajadores": [
      "CALIX LOPEZ",
      "Eduardo Bastardo",
      "Líno García",
      "Pablo León",
      "TOMAS GUEVARA"
    ],
    "principalesLabores": "ENGRASE DE EQUIPO • REEMPLAZO MANGUERA SUPERIOR RADIADOR NUEVA, COMPLETADO NIVEL REFRIGERANTE • REVISION DE MOTOR DE MOTOR DE ARRANQUE, REEMPLAZO AUTOMATICO TIPO COCHINITO 12V NUEVO • REEMPLAZO ACEITE MOTOR, FILTRO ACEITE MOTOR, FILTRO GASOIL 1° 2°, CORREA UNICA 8PK1450 NUEVA, ENGRASE EQUIPO"
  },
  {
    "cuenta": "EEA-C-BS12",
    "equipo": "Autobus Encava ENT-330063 - Placa: 93MGAV",
    "tipo": "Autobuses",
    "totalHoras": 16.0,
    "registros": 7,
    "cantTrabajadores": 4,
    "trabajadores": [
      "Hector Sánchez",
      "Jesús Sánchez",
      "Josué Solorzano",
      "Pablo León"
    ],
    "principalesLabores": "DESMONTAJE, REPARACION E INSTALACION DE CAUCHO#4 • GRADUACION DE EMBRAGUE • CALIBRACION DE EMBRAGUE • DESMONTAJE DE CAUCHO, REPARACION E INSTALACION DE CAUCHO"
  },
  {
    "cuenta": "EEM-C-CH02",
    "equipo": "Chuto Ford Cargo 4532E - Placa: A45AL5F",
    "tipo": "Chutos",
    "totalHoras": 15.0,
    "registros": 4,
    "cantTrabajadores": 3,
    "trabajadores": [
      "CRISTIAN GARCIA",
      "Francisco Siso",
      "Julio Hernández"
    ],
    "principalesLabores": "CONTINUACION DE REOARACION SILENCIADOR DE ESCAPE, INSTALACION DE SILENCIADOR DE ESCAPE REPARADO • DESMONTAJE DE SLENCIADOR DE ESCAPE, REPARACION DE TUBO SILENCIADOR DE ESCAPE"
  },
  {
    "cuenta": "EES-C-VH36",
    "equipo": "Pick Up Mitsubishi  L200 Serial  MMBNL45K6XH052939",
    "tipo": "Vehiculos livianos",
    "totalHoras": 15.0,
    "registros": 4,
    "cantTrabajadores": 4,
    "trabajadores": [
      "Julio Hernández",
      "LUIS DIAZ",
      "Oswaldo López",
      "REPARACIÓN REALIZADA POR EXTERNO"
    ],
    "principalesLabores": "REEMPLAZO DE 4 CAUCHOS 285/75R16 KUMHO NUEVOS, SERVICIO DE ALINEACION • REEMPLAZO ACEITE MOTOR, FILTRO ACEITE MOTOR, FILTRO GASOIL • LAVADO DE EQUIPO"
  },
  {
    "cuenta": "EEE-C-RE01",
    "equipo": "Retroexcavadora Case 580M Serie 2 Turbo - Serial: N6C400672",
    "tipo": "Equipos Especiales",
    "totalHoras": 15.0,
    "registros": 4,
    "cantTrabajadores": 2,
    "trabajadores": [
      "Josué Solorzano",
      "Omar Marín"
    ],
    "principalesLabores": "REEMPLAZO DE GOMAS TORNILLOS TAPA VALVULAS, TURBO HX25W NUEVO • REEMPLAZO TURBO HX25W NUEVO, CORREA UNICA 8PK1455 NUEVA • REPARACION DE CAUCHO TRASERO • REEMPLAZO DE CAUCHO 12-16.5 POS#1 NUEVO"
  },
  {
    "cuenta": "EEM-C-CA12",
    "equipo": "Camion Plataforma Iveco Eurocargo 170E22 - Placa: 22UGBH",
    "tipo": "Camiones",
    "totalHoras": 15.0,
    "registros": 3,
    "cantTrabajadores": 3,
    "trabajadores": [
      "Arquimedes Guerra",
      "LUIS FERNANDO",
      "RICARDO GONZALEZ"
    ],
    "principalesLabores": "DESMONTAJE DE BASE FILTRO SECADOR DE AIRE, INSTALACION DE BASE FILTRO SECADOR DE AIRE NUEVO, INSTALACION FILTRO SECADOR AIRE NUEVO"
  },
  {
    "cuenta": "EEI-C-GR16",
    "equipo": "Grua Grove RT 865B - 65TN Serial 82898",
    "tipo": "Grúas",
    "totalHoras": 15.0,
    "registros": 4,
    "cantTrabajadores": 4,
    "trabajadores": [
      "Arquimedes Guerra",
      "LUIS FERNANDO",
      "Luis Guzmán",
      "RICARDO GONZALEZ"
    ],
    "principalesLabores": "DESMONTAJE, FABRICACION E INSTALACION DE MANGUERA HIDRAULICA NUEVA"
  },
  {
    "cuenta": "EEE-C-VH51",
    "equipo": "Pick Up Mazda BT-50 2WD - Placa A11BK0M",
    "tipo": "Vehiculos livianos",
    "totalHoras": 14.0,
    "registros": 4,
    "cantTrabajadores": 2,
    "trabajadores": [
      "DAVID GARATE",
      "Oswaldo López"
    ],
    "principalesLabores": "REEMPLAZO DE EMBRAGUE SUPERIOR E INFERIOR DE EMBRAGUE NUEVO • REEMPLAZO DE BOMBIN INFERIOR DE EMBRAGUE NUEVO, SUMINISTRO FLUIDOS EMBRAGUE, ESPURGUE, ESPURGUE SISTEMA DE EMBRAGUE"
  },
  {
    "cuenta": "EEE-C-VH39",
    "equipo": "Pick Up Mazda BT-50 2WD - Placa: A21CV6A",
    "tipo": "Vehiculos livianos",
    "totalHoras": 14.0,
    "registros": 4,
    "cantTrabajadores": 3,
    "trabajadores": [
      "DAVID GARATE",
      "Josué Solorzano",
      "Oswaldo López"
    ],
    "principalesLabores": "REEMPLAZO ACEITE MOTOR, FILTRO ACEITE MOTOR, FILTRO GASOLINA, AMORTIGUADORES TRASEROS NUEVOS, PULIDO DE FAROS DELANTEROS, ASPIRADO, LAVADO, REVISION DE LUCES • DESMONTAJE, REPARACION E INSTALACION DE CAUCHO POS#4"
  },
  {
    "cuenta": "EEE-C-VH10",
    "equipo": "Pick up Mazda BT-50 2WD - Placa: A18AR8F",
    "tipo": "Vehiculos livianos",
    "totalHoras": 14.0,
    "registros": 4,
    "cantTrabajadores": 4,
    "trabajadores": [
      "Enderson Vera",
      "Jesús Areyan",
      "Julio Hernández",
      "Pedro Avendaño"
    ],
    "principalesLabores": "CORRECCION DE LUCES DE FRENOS • REVISION DE FRENOS, DESMONTAJE DE HIDROVAC Y BOMBA DE FRENOS, INSTALACION DE HIDROVAC DE FRENOS USADO, BOMBA DE FRENO NUEVA"
  },
  {
    "cuenta": "EEI-C-GR13",
    "equipo": "Grua Grove RT 75S - 50TN Serial 39750",
    "tipo": "Grúas",
    "totalHoras": 13.0,
    "registros": 5,
    "cantTrabajadores": 4,
    "trabajadores": [
      "Jesús Areyan",
      "Josué Solorzano",
      "Julio Hernández",
      "LUIS DIAZ"
    ],
    "principalesLabores": "REPARACION DE ALTERNADOR CON DIODERA NUEVA, REGULADOR NUEVO, CARBONERA NUEVA, RODAMIENTOS 6305 NUEVO, TRIDIODO NUEVO • INSTALACION DE ALTERNADOR 12V NUEVO, DESARMADO ALTERNADOR DAÑADO • ARMADO DE CAUCHO EN RIN 29.5R25 NUEVO"
  },
  {
    "cuenta": "EEE-C-TH01",
    "equipo": "Telehandler Genie GTH-4013 Serial: 17593",
    "tipo": "Equipos Especiales",
    "totalHoras": 13.0,
    "registros": 4,
    "cantTrabajadores": 4,
    "trabajadores": [
      "Francisco Siso",
      "Líno García",
      "Omar Marín",
      "Pablo León"
    ],
    "principalesLabores": "FABRICACION DE 2 MANGUERAS HIDRAULICAS  NUEVAS 1/2\" • REEMPLAZO DE FILTROS DE AIRE NUEVOS 1° 2° • REEMPLAZO ACEITE MOTOR, FILTRO GASOIL, FABRICACION DE MANGUERA SAE100R7 1/2\" X 4.7 MTS NUEVA"
  },
  {
    "cuenta": "EEI-C-GR24",
    "equipo": "Grua Liebherr LTM1100/1 - 100TN Serial W09555000VEL05279",
    "tipo": "Grúas",
    "totalHoras": 13.0,
    "registros": 4,
    "cantTrabajadores": 3,
    "trabajadores": [
      "Francisco Siso",
      "Jesús Areyan",
      "Josué Solorzano"
    ],
    "principalesLabores": "ARMADO DE 2 CAUCHOS 16.00R25 NUEVOS • ARMADO DE CAUCHO 385/90R25 USADO EN RIN • REVISION DE FALLA ACELERACION MOTOR CAMION, CORRECCION DE PROBLEMA ACELERACION CAMION"
  },
  {
    "cuenta": "EEM-C-CH05",
    "equipo": "Chuto Mack CH613 - Placa: A25AB2E",
    "tipo": "Chutos",
    "totalHoras": 13.0,
    "registros": 4,
    "cantTrabajadores": 4,
    "trabajadores": [
      "CRISTIAN GARCIA",
      "Jesús Areyan",
      "Julio Hernández",
      "LUIS DIAZ"
    ],
    "principalesLabores": "REEMPLAZO ACEITE MOTOR, FILTRO ACEITE MOTOR (2), FILTRO GASOIL 1° 2°, REEMPLAZO DE VALVULA DDE ALIVIO, REVISION Y REPARACION DE LUCES, ENGRASE DE EQUIPO"
  },
  {
    "cuenta": "EEI-C-GR07",
    "equipo": "Grua P&H R200 - 20TN Serial 35021",
    "tipo": "Grúas",
    "totalHoras": 12.0,
    "registros": 4,
    "cantTrabajadores": 3,
    "trabajadores": [
      "Francisco Siso",
      "Jesús Areyan",
      "Josué Solorzano"
    ],
    "principalesLabores": "REPARACION DE MOTOR DE ARRANQUE CON CARBONERA NUEVA • ARMADO DE 2 CILINDROS HIDRAULICOS DE DIRECCION CON KIT SELLOS NUEVOS • DESARMADO DE CILINDRO HIDRAULICO DIRECCION"
  },
  {
    "cuenta": "EEE-C-VH41",
    "equipo": "Pick Up Mazda BT-50 2WD 2.2- Placa: A10BK2M",
    "tipo": "Vehiculos livianos",
    "totalHoras": 12.0,
    "registros": 4,
    "cantTrabajadores": 4,
    "trabajadores": [
      "CRISTIAN GARCIA",
      "DAVID GARATE",
      "Josué Solorzano",
      "Oswaldo López"
    ],
    "principalesLabores": "LAVADO DE EQUIPO • REVISION PRESION DE GASOLINA, DESMONTAJE DE TANQUE GASOLINA, REEMPLAZO DE PILA BOMBA GASOLINA NUEVA"
  },
  {
    "cuenta": "TT-F-CO05",
    "equipo": "Compresor Sullair 185 45,5 KW 185 CFM Serial 201005120100",
    "tipo": "Compresores",
    "totalHoras": 11.0,
    "registros": 7,
    "cantTrabajadores": 5,
    "trabajadores": [
      "CRISTIAN GARCIA",
      "Eduardo Bastardo",
      "Jesús Areyan",
      "Luis Guzmán",
      "Pedro Santana"
    ],
    "principalesLabores": "REVISION Y COMPLETACION DE FLUIDOS • REPARACION DE ALTENADOR CON REGULADOR NUEVO STOCK"
  },
  {
    "cuenta": "EEM-C-CA14",
    "equipo": "Camion Pickman Ford Cargo 1721 - Placa: A00BR8M",
    "tipo": "Camiones",
    "totalHoras": 11.0,
    "registros": 3,
    "cantTrabajadores": 2,
    "trabajadores": [
      "Francisco Siso",
      "Josué Solorzano"
    ],
    "principalesLabores": "REPARACION DE VALVULA DE DESCARGA RAPIDA CON KIT SELLOS NUEVOS • DESMONTAJE DE CAUCHOS ´POS#5 #6, REPARACION E INSTALACION CAUCHOS"
  },
  {
    "cuenta": "EE-H-C-015",
    "equipo": "Mantto herramientas y accesorios - Mantto",
    "tipo": "Mantenimiento y Adecuaciones",
    "totalHoras": 11.0,
    "registros": 3,
    "cantTrabajadores": 2,
    "trabajadores": [
      "Carlos Mata",
      "Marcos Narváez"
    ],
    "principalesLabores": "MANTENIMIENTO Y REPARACIÓN DE BOMBAS HIDRAÚLICAS • REVISIÓN DE COMPRESORES EN EL TALLER DE ECO"
  },
  {
    "cuenta": "EEM-C-RM11",
    "equipo": "Semirremolque Lowboy - Placa: A55CM4S",
    "tipo": "Semirremolques",
    "totalHoras": 11.0,
    "registros": 4,
    "cantTrabajadores": 4,
    "trabajadores": [
      "Enderson Vera",
      "Hector Sánchez",
      "Jesús Sánchez",
      "Josué Solorzano"
    ],
    "principalesLabores": "GRADUACION DE FRENOS • DESMONTAJE, REPARACION E INSTALACION DE CAUCHO POS#5"
  },
  {
    "cuenta": "TT-F-CO17",
    "equipo": "Compresor Eléctrico QUINCY 740 CFM",
    "tipo": "Compresores",
    "totalHoras": 10.0,
    "registros": 2,
    "cantTrabajadores": 2,
    "trabajadores": [
      "CALIX LOPEZ",
      "TOMAS GUEVARA"
    ],
    "principalesLabores": "REEMPLAZO DE FILTRO HIDRAULICOS NUEVOS (2)"
  },
  {
    "cuenta": "EEE-C-VH46",
    "equipo": "Pick Up Mazda BT-50 2WD 2.2 - Placa A94CJ7G",
    "tipo": "Vehiculos livianos",
    "totalHoras": 10.0,
    "registros": 2,
    "cantTrabajadores": 2,
    "trabajadores": [
      "Luis Guzmán",
      "Oswaldo López"
    ],
    "principalesLabores": "INSTALACION DE BOMBA DE FRENOS NUEVA, INSTALACIONCAJA REPARADA, ESTOPERA COLA DE CAJA NUEVA, KIT GRADUADORES DE FRENOS TRASEROS NUEVOS"
  },
  {
    "cuenta": "SS-E-C-023",
    "equipo": "Maquina ECM Horizontal 2",
    "tipo": "MAQUINA ECM",
    "totalHoras": 10.0,
    "registros": 3,
    "cantTrabajadores": 2,
    "trabajadores": [
      "Alexander Mérida",
      "Marcos Narváez"
    ],
    "principalesLabores": "PRUEBA DE FUNCIONAMIENTO • REVISIÓN Y PRUEBA DE FUNCIONAMIENTO • REVISIÓN Y PRUEBA DE SENSORES DE LA MÁQUINA ECM 2"
  },
  {
    "cuenta": "TS-I-C-GP15",
    "equipo": "Grua Puente SMB 10TN",
    "tipo": "Gruas Puente",
    "totalHoras": 10.0,
    "registros": 2,
    "cantTrabajadores": 1,
    "trabajadores": [
      "Alexander Mérida"
    ],
    "principalesLabores": "REPARACIÓN DE CONTROL DE MANDO, CAMBIO DE PULSADORES • REPARACIÓN DE CONTROL DE MANDO ELÉCTRICO DE GRÚA PUENTE GP15"
  },
  {
    "cuenta": "EEM-C-CH03",
    "equipo": "Chuto Mack Granite - Placa: A67BC0K",
    "tipo": "Chutos",
    "totalHoras": 9.0,
    "registros": 3,
    "cantTrabajadores": 3,
    "trabajadores": [
      "Arquimedes Guerra",
      "LUIS FERNANDO",
      "RICARDO GONZALEZ"
    ],
    "principalesLabores": "CORRECCION DE FUGAS DE AIRE LINEAS NEUMATICAS DE FRENOS"
  },
  {
    "cuenta": "TT-F-MS07",
    "equipo": "Maquina de Soldar Combustible - Serial: U1081002856",
    "tipo": "Maquinas de Soldar",
    "totalHoras": 9.0,
    "registros": 7,
    "cantTrabajadores": 4,
    "trabajadores": [
      "Eduardo Bastardo",
      "Luis Guzmán",
      "Marcos Narváez",
      "Pedro Santana"
    ],
    "principalesLabores": "REEMPLAZO DE BATERIA DUNCAN 36MR SER: 5974089 • REVISION Y COMPLETACION DE FLUIDOS • DESMONTAJE DE RELES DIFERENCIALES"
  },
  {
    "cuenta": "EEM-C-RM07",
    "equipo": "Semirremolque Lowboy - Placa: 17SBAO",
    "tipo": "Semirremolques",
    "totalHoras": 9.0,
    "registros": 2,
    "cantTrabajadores": 2,
    "trabajadores": [
      "CRISTIAN GARCIA",
      "Jesús Areyan"
    ],
    "principalesLabores": "REPARACION DE LUCES TRASERAS, INSTALACION FAROS LED TRASEROS NUEVOS"
  },
  {
    "cuenta": "EEM-C-RM29",
    "equipo": "Semirremolque Plataforma - Placa 59FSAR",
    "tipo": "Semirremolques",
    "totalHoras": 9.0,
    "registros": 3,
    "cantTrabajadores": 3,
    "trabajadores": [
      "Francisco Siso",
      "Hector Sánchez",
      "Jesús Sánchez"
    ],
    "principalesLabores": "DESMONTAJE DE COMPUERTA TRASERA DE VOLQUETA"
  },
  {
    "cuenta": "TT-F-MS01",
    "equipo": "Maquina de Soldar Combustible - Serial: 5308782",
    "tipo": "Maquinas de Soldar",
    "totalHoras": 9.0,
    "registros": 6,
    "cantTrabajadores": 3,
    "trabajadores": [
      "Eduardo Bastardo",
      "Luis Guzmán",
      "Pedro Santana"
    ],
    "principalesLabores": "REVISION Y COMPLETACION DE FLUIDOS • REVISION Y COMPLETACION DE FLUIDOS, REPARACION DE ALTERNADOR Y CABLEADO"
  },
  {
    "cuenta": "EEM-C-CA10",
    "equipo": "Camion Pickman Chevrolet Kodiak - Placa: A21AM1U",
    "tipo": "Camiones",
    "totalHoras": 9.0,
    "registros": 3,
    "cantTrabajadores": 3,
    "trabajadores": [
      "Josué Solorzano",
      "Luis Guzmán",
      "Pedro Santana"
    ],
    "principalesLabores": "DESMONTAJE DE CAUCHO POS#1, INSTALACION DE CAUCHO 295/80R22.5 POS#1 NUEVO"
  },
  {
    "cuenta": "EEM-C-RM12",
    "equipo": "Semirremolque Lowboy - Placa: A96CE1M",
    "tipo": "Semirremolques",
    "totalHoras": 8.0,
    "registros": 2,
    "cantTrabajadores": 2,
    "trabajadores": [
      "CRISTIAN GARCIA",
      "Josué Solorzano"
    ],
    "principalesLabores": "REEMPLAZO DE 2 CAUCHOS 10.00R15 POS#1 #2 NUEVOS, REPARACION DE CAUCHOS 10.00R15 POS#3 #6"
  },
  {
    "cuenta": "EEI-C-ML04",
    "equipo": "Manlift  JLG 660SJ Serial 0300123815",
    "tipo": "Equipos Especiales",
    "totalHoras": 8.0,
    "registros": 2,
    "cantTrabajadores": 2,
    "trabajadores": [
      "CRISTIAN GARCIA",
      "Pedro Avendaño"
    ],
    "principalesLabores": "PUESTA EN TIEMPO MOTOR, ENCENDIDO DE MOTOR"
  },
  {
    "cuenta": "EEE-C-VH49",
    "equipo": "Pick Up Mazda BT-50 2WD - Placa A58AA3F",
    "tipo": "Vehiculos livianos",
    "totalHoras": 7.0,
    "registros": 3,
    "cantTrabajadores": 3,
    "trabajadores": [
      "Eduardo Bastardo",
      "Josué Solorzano",
      "REPARACIÓN REALIZADA POR EXTERNO"
    ],
    "principalesLabores": "INSTALACION DE PARRILLA DELANTERA NUEVA, PLATINA CAPOT NUEVA, MANILLA EXTERNA COMPUERTA TRASERA NUEVA • REEMPLAZO BATERIA DUNCAN 24MR SER: 5695329 NUEVA, REEMPLAZO BUJIAS NUEVAS, CORREA ALTERNADOR NUEVA 17370, COMPLETADO NIVEL ACEITE"
  },
  {
    "cuenta": "EEE-C-VH08",
    "equipo": "Pick up Mazda BT-50 2WD - Placa: A86BY0G",
    "tipo": "Vehiculos livianos",
    "totalHoras": 7.0,
    "registros": 3,
    "cantTrabajadores": 3,
    "trabajadores": [
      "Jesús Areyan",
      "Oswaldo López",
      "REPARACIÓN REALIZADA POR EXTERNO"
    ],
    "principalesLabores": "INSTLACION DE JUEGO DE ALFOMBRAS NUEVAS • AUXILIADO DE EQUIPO, DESMONTAJE TANQUE GASOLINA, REEMPLAZO PILA BOMBA GASOLINA NUEVA"
  },
  {
    "cuenta": "EEM-C-CA07",
    "equipo": "Camion Plataforma Iveco Eurocargo 170E22 - Placa: A73BD2G",
    "tipo": "Camiones",
    "totalHoras": 7.0,
    "registros": 2,
    "cantTrabajadores": 2,
    "trabajadores": [
      "Josué Solorzano",
      "Líno García"
    ],
    "principalesLabores": "SURTIDO GASOIL FMO 3000 LT • DESMONTAJE, REPARACION E INSTALACION DE CAUCHO POS#6"
  },
  {
    "cuenta": "TT-F-C-TL04",
    "equipo": "Taladro Radial SICMAT K284 4552-66",
    "tipo": "TALADROS",
    "totalHoras": 7.0,
    "registros": 3,
    "cantTrabajadores": 2,
    "trabajadores": [
      "Alexander Mérida",
      "Marcos Narváez"
    ],
    "principalesLabores": "CAMBIO DE TOMACORRIENTE INDUSTRIAL • REVISIÓN Y CORRECCIÓN DE CORTOCIRCUITO"
  },
  {
    "cuenta": "TT-F-MS15",
    "equipo": "Maquina de Soldar Combustible – Serial: C1060900511",
    "tipo": "Maquinas de Soldar",
    "totalHoras": 7.0,
    "registros": 2,
    "cantTrabajadores": 2,
    "trabajadores": [
      "Francisco Siso",
      "Jesús Areyan"
    ],
    "principalesLabores": "MANTENIMIENTO SOLENOIDE DE APAGADO, REVISION Y PRUEBAS DE MOTOR"
  },
  {
    "cuenta": "TT-H-C-031",
    "equipo": "Mantto herramientas y accesorios - Fab",
    "tipo": "Mantenimiento y Adecuaciones",
    "totalHoras": 7.0,
    "registros": 3,
    "cantTrabajadores": 3,
    "trabajadores": [
      "Alexander Mérida",
      "Lismil Acosta",
      "Marcos Narváez"
    ],
    "principalesLabores": "CAMBIO DE TOMACORRIENTE DAÑADO DE MAQUINA DE SOLDAR ELÉCTRICA EN EL GALPÓN DE FABRICACIÓN GL14 • FABRICACIÓN DE EXTENSIONES ELÉCTRICAS • REPARACIÓN DE LAMPARAS DAÑADAS DE 1000 VATIOS"
  },
  {
    "cuenta": "EEE-C-VH38",
    "equipo": "Pick Up Mazda BT-50 2WD - Placa: 641FA0",
    "tipo": "Vehiculos livianos",
    "totalHoras": 6.0,
    "registros": 2,
    "cantTrabajadores": 2,
    "trabajadores": [
      "Luis Guzmán",
      "Pedro Santana"
    ],
    "principalesLabores": "DESMONAJE DE CAUCHO POS#4, INSTALCION DE CAUCHO REPUESTO"
  },
  {
    "cuenta": "EES-C-MB01",
    "equipo": "MOTOBOMBA EUROPOWER EM20DH SER: DTAE23A",
    "tipo": "MOTOBOMBA",
    "totalHoras": 6.0,
    "registros": 3,
    "cantTrabajadores": 3,
    "trabajadores": [
      "Francisco Siso",
      "Líno García",
      "Pablo León"
    ],
    "principalesLabores": "REEMPLAZO DE SOPORTES DE MOTOR NUEVOS (4), REEMPLAZO DE ACEITE MOTOR"
  },
  {
    "cuenta": "EEM-C-RM04",
    "equipo": "Semirremolque Portacontenedor - Placa: A55AL3F",
    "tipo": "Semirremolques",
    "totalHoras": 6.0,
    "registros": 1,
    "cantTrabajadores": 1,
    "trabajadores": [
      "Josué Solorzano"
    ],
    "principalesLabores": "REEMPLAZO DE CAUCHOS POS#1 #2 #3 USADOS"
  },
  {
    "cuenta": "EEE-C-VH05",
    "equipo": "Pick up Mazda BT-50 2WD - Placa: A51BO1M",
    "tipo": "Vehiculos livianos",
    "totalHoras": 6.0,
    "registros": 2,
    "cantTrabajadores": 2,
    "trabajadores": [
      "Julio Hernández",
      "Oswaldo López"
    ],
    "principalesLabores": "REEMPLAZO DE BOMBIN INFERIOR DE EMBRAGUE NUEVO"
  },
  {
    "cuenta": "EEE-C-VH47",
    "equipo": "Pick Up Mazda BT-50 2WD 2.2 - Placa AA40AS7F",
    "tipo": "Vehiculos livianos",
    "totalHoras": 6.0,
    "registros": 2,
    "cantTrabajadores": 2,
    "trabajadores": [
      "DAVID GARATE",
      "Oswaldo López"
    ],
    "principalesLabores": "REEMPLAZO BOMBIN SUPERIOR E INFERIOR DE EMBRAGUE NUEVOS"
  },
  {
    "cuenta": "EEE-C-VH37",
    "equipo": "Pick Up Mazda BT-50 2WD - Placa: A91CF2A",
    "tipo": "Vehiculos livianos",
    "totalHoras": 6.0,
    "registros": 2,
    "cantTrabajadores": 2,
    "trabajadores": [
      "DAVID GARATE",
      "Oswaldo López"
    ],
    "principalesLabores": "REEMPLAZO ACEITE MOTOR, FILTRO ACEITE MOTOR, FILTRO GASOLINA, BOMBA DE FRENOS NUEVA, AMORTIGUADORES DELANTEROS Y TRASEROS NUEVOS, REVISION DE FRENOS, COMPLETADO NIVELES DE FLUIDOS"
  },
  {
    "cuenta": "EEE-C-MC13",
    "equipo": "Montacarga Heli 7.0T Serie H 7TN Serial: 130944132",
    "tipo": "Montacargas",
    "totalHoras": 6.0,
    "registros": 2,
    "cantTrabajadores": 2,
    "trabajadores": [
      "Luis Guzmán",
      "Pedro Santana"
    ],
    "principalesLabores": "REEMPLAZO ACEITE MOTOR, FILTRO ACIETE MOTOR, FILTRO GASOIL 1° 2°, FILTRO AIRE, LAVADO EQUIPO"
  },
  {
    "cuenta": "TS-I-C-GP12",
    "equipo": "Grua Puente Birriel P&H 20TN. Serial: 0012",
    "tipo": "Gruas Puente",
    "totalHoras": 6.0,
    "registros": 3,
    "cantTrabajadores": 1,
    "trabajadores": [
      "Marcos Narváez"
    ],
    "principalesLabores": "REVISIÓN DEL POLIPASTO, GUAYA Y PROTECCIONES • CORRECCION DE FALLA ELÉCTRICA, FALSO CONTACTO EN BOTONERA • CAMBIO DE PULSADORES DEL CONTROL DE MANDO"
  },
  {
    "cuenta": "EEE-C-MC02",
    "equipo": "Montacargas  Caterpillar  DP50K - 5TN Serial: AT28B51445",
    "tipo": "Montacargas",
    "totalHoras": 6.0,
    "registros": 2,
    "cantTrabajadores": 2,
    "trabajadores": [
      "CALIX LOPEZ",
      "TOMAS GUEVARA"
    ],
    "principalesLabores": "REEMPLAZO ACEITE MOTOR, FILTRO ACEITE MOTOR, FILTRO GASOIL, ENGRASE EQUIPO, LAVADO EQUIPO"
  },
  {
    "cuenta": "EEI-C-GR03",
    "equipo": "Grua P&H R180 - 18TN Serial 37815",
    "tipo": "Grúas",
    "totalHoras": 5.0,
    "registros": 1,
    "cantTrabajadores": 1,
    "trabajadores": [
      "Omar Marín"
    ],
    "principalesLabores": "REEMPLAZO SWITCH DE ENCENDIDO CTP NUEVO"
  },
  {
    "cuenta": "EEE-C-EX02",
    "equipo": "JUMBO CAT 374 DL",
    "tipo": "Equipos Especiales",
    "totalHoras": 5.0,
    "registros": 5,
    "cantTrabajadores": 3,
    "trabajadores": [
      "Eduardo Bastardo",
      "Luis Guzmán",
      "Pedro Santana"
    ],
    "principalesLabores": "REVISION Y COMPLETACION FLUIDOS • ENGRASE EQUIPO, REVISION Y COMPLETACION FLUIDOS"
  },
  {
    "cuenta": "EEM-C-RM31",
    "equipo": "Semirremolque Plataforma - Placa: 75LMBF",
    "tipo": "Semirremolques",
    "totalHoras": 5.0,
    "registros": 2,
    "cantTrabajadores": 2,
    "trabajadores": [
      "DAVID GARATE",
      "Josué Solorzano"
    ],
    "principalesLabores": "DESMONTAJE, REPARACION E INSTALACION DE CAUCHO POS#4"
  },
  {
    "cuenta": "TT-F-C-026",
    "equipo": "GE03 Generador Eléctrico Cummins C12D6-15 KVA - SERIAL: K11I069371",
    "tipo": "Generadores",
    "totalHoras": 5.0,
    "registros": 2,
    "cantTrabajadores": 2,
    "trabajadores": [
      "DAVID GARATE",
      "Julio Hernández"
    ],
    "principalesLabores": "REEMPLAZO ACEITE MOTOR, FILTRO ACIETE MOTOR, FILTRO GASOIL, FILTRO AIRE, LAVADO"
  },
  {
    "cuenta": "SS-H-C-006",
    "equipo": "AL02 Mandrinadora Grande JUARISTTI",
    "tipo": "MANDRINADORA",
    "totalHoras": 5.0,
    "registros": 1,
    "cantTrabajadores": 1,
    "trabajadores": [
      "Carlos Mata"
    ],
    "principalesLabores": "MANTENIMIENTO, AJUSTE Y CALIBRACIÓN"
  },
  {
    "cuenta": "AACO27",
    "equipo": "MIDEA 5TN SERIAL C705012870218127400009",
    "tipo": "AIRE ACONDICIONADO",
    "totalHoras": 5.0,
    "registros": 1,
    "cantTrabajadores": 1,
    "trabajadores": [
      "Lismil Acosta"
    ],
    "principalesLabores": "CAMBIO DE COMPRESOR DE LA PARTE ALTA DEL GIMNASIO, REALIZANDO VACIO Y CARGA DE GAS"
  },
  {
    "cuenta": "TT-G-C-034",
    "equipo": "Mantto y Adecuaciones Galpones -  Sandblasting",
    "tipo": "Mantenimiento y Adecuaciones",
    "totalHoras": 5.0,
    "registros": 2,
    "cantTrabajadores": 1,
    "trabajadores": [
      "Marcos Narváez"
    ],
    "principalesLabores": "ADECUACIÓN DE BAÑOS DE SANDBLASTIG • ADECUACIÓN DE BAÑOS DEL AREA DE SANDBLASTING"
  },
  {
    "cuenta": "TT-F-C-023",
    "equipo": "SI03 Sierra de cinta continua TCM EAGLE 320",
    "tipo": "Sierras",
    "totalHoras": 5.0,
    "registros": 1,
    "cantTrabajadores": 1,
    "trabajadores": [
      "Carlos Mata"
    ],
    "principalesLabores": "PRUEBA DE FUNCIONAMIENTO"
  },
  {
    "cuenta": "TT-F-C-014",
    "equipo": "CZ04 Cortadora Universal N° 4 / Verrina Serial: 12013",
    "tipo": "CORTADORA",
    "totalHoras": 5.0,
    "registros": 2,
    "cantTrabajadores": 2,
    "trabajadores": [
      "Alexander Mérida",
      "Marcos Narváez"
    ],
    "principalesLabores": "FALLA EN EL CIRCUITO DE CONTROL,"
  },
  {
    "cuenta": "EES-C-HL05",
    "equipo": "HIDROLAVADORA KARCHER HD3600DH SER: 281176",
    "tipo": "Hidrolavadora",
    "totalHoras": 4.0,
    "registros": 2,
    "cantTrabajadores": 2,
    "trabajadores": [
      "CRISTIAN GARCIA",
      "Julio Hernández"
    ],
    "principalesLabores": "REEMPLAZO ACEITE MOTOR, LIMPIEZA FILTRO AIRE"
  },
  {
    "cuenta": "SS-G-C-025",
    "equipo": "Mantto y Adecuaciones Galpones - SMB",
    "tipo": "Mantenimiento y Adecuaciones",
    "totalHoras": 4.0,
    "registros": 1,
    "cantTrabajadores": 1,
    "trabajadores": [
      "María Fermín"
    ],
    "principalesLabores": "LIMPIEZA DE OFICINAS, COMEDOR, VESTUARIOS DE TALLER DE SMB"
  },
  {
    "cuenta": "TF-I-C-GP01",
    "equipo": "Grua Puente Monorriel ABUS 5TN",
    "tipo": "Gruas Puente",
    "totalHoras": 4.0,
    "registros": 2,
    "cantTrabajadores": 2,
    "trabajadores": [
      "Alexander Mérida",
      "Marcos Narváez"
    ],
    "principalesLabores": "CORRECCIÓN DE FALLA ELECTRICA, DISPARO DE PROTECCIONES • REVISIÓN Y PRUEBA"
  },
  {
    "cuenta": "EEM-C-CH11",
    "equipo": "Chuto Mack Granite - Placa A61BT7S",
    "tipo": "Chutos",
    "totalHoras": 4.0,
    "registros": 2,
    "cantTrabajadores": 2,
    "trabajadores": [
      "Francisco Siso",
      "Julio Hernández"
    ],
    "principalesLabores": "REEMPLAZO DE GOMA PUENTE CENTRAL HB88512 NUEVA"
  },
  {
    "cuenta": "TT-F-MS16",
    "equipo": "Maquina de Soldar Combustible – Serial: C1061000157",
    "tipo": "Maquinas de Soldar",
    "totalHoras": 4.0,
    "registros": 2,
    "cantTrabajadores": 2,
    "trabajadores": [
      "Francisco Siso",
      "Julio Hernández"
    ],
    "principalesLabores": "FABRICACION E INSTALACION DE TAPA SALIDA DE ESCAPE"
  },
  {
    "cuenta": "EEA-C-BS04",
    "equipo": "Autobus HINO 500 Fortier - PLaca: A1397AA",
    "tipo": "Autobuses",
    "totalHoras": 3.0,
    "registros": 1,
    "cantTrabajadores": 1,
    "trabajadores": [
      "Francisco Siso"
    ],
    "principalesLabores": "DESMONTAJE DE BARRA ESTABILIZADORA DELANTERA, REPARACION BARRA ESTABILIZADORA DELANTERA, INSTALACION DE BARRA ESTABILIZADORA DELANTERA REPARADA"
  },
  {
    "cuenta": "AACO22",
    "equipo": "HYUNDAY 12000 BTU SIN SERIAL OFICINA",
    "tipo": "AIRE ACONDICIONADO",
    "totalHoras": 3.0,
    "registros": 1,
    "cantTrabajadores": 1,
    "trabajadores": [
      "Lismil Acosta"
    ],
    "principalesLabores": "MANTENIMIENTO DE UNIDAD EVAPORADORA Y UNIDAD CONDESADORA"
  },
  {
    "cuenta": "TT-F-C-001",
    "equipo": "Gruas Puente 20 tn",
    "tipo": "Gruas Puente",
    "totalHoras": 3.0,
    "registros": 1,
    "cantTrabajadores": 1,
    "trabajadores": [
      "Marcos Narváez"
    ],
    "principalesLabores": "CAMBIO DE GUAYA DEL TROLEY DE LA GRÚA"
  },
  {
    "cuenta": "EEE-C-VH42",
    "equipo": "Pick Up Mazda BT-50 2WD 2.6 - Placa: A99AS0B",
    "tipo": "Vehiculos livianos",
    "totalHoras": 3.0,
    "registros": 1,
    "cantTrabajadores": 1,
    "trabajadores": [
      "REPARACIÓN REALIZADA POR EXTERNO"
    ],
    "principalesLabores": "SERVICIO DE AIRE ACONDICIONADO"
  },
  {
    "cuenta": "AACO19",
    "equipo": "STARGREEN 10TN SERIAL 540P817470447120100015",
    "tipo": "AIRE ACONDICIONADO",
    "totalHoras": 3.0,
    "registros": 1,
    "cantTrabajadores": 1,
    "trabajadores": [
      "Lismil Acosta"
    ],
    "principalesLabores": "LIMPIEZA DE BANDEJA DE DRENAJE DEL AIRE ACONDICIONADO DEL ANTIGUO EDIFICIO ADMINISTRATIVO"
  },
  {
    "cuenta": "TT-F-CO04",
    "equipo": "Compresor Sullair 225H 225 CFM Serial 200705170121",
    "tipo": "Compresores",
    "totalHoras": 3.0,
    "registros": 3,
    "cantTrabajadores": 3,
    "trabajadores": [
      "Eduardo Bastardo",
      "Luis Guzmán",
      "Pedro Santana"
    ],
    "principalesLabores": "REVISION Y COMPLETACION FLUIDOS"
  },
  {
    "cuenta": "TT-F-MS06",
    "equipo": "Maquina de Soldar Combustible - Serial: U1081002849",
    "tipo": "Maquinas de Soldar",
    "totalHoras": 3.0,
    "registros": 3,
    "cantTrabajadores": 3,
    "trabajadores": [
      "Eduardo Bastardo",
      "Luis Guzmán",
      "Pedro Santana"
    ],
    "principalesLabores": "REVISION Y COMPLETACION DE FLUIDOS"
  },
  {
    "cuenta": "SS-H-C-013",
    "equipo": "Grua Puente",
    "tipo": "Gruas Puente",
    "totalHoras": 3.0,
    "registros": 1,
    "cantTrabajadores": 1,
    "trabajadores": [
      "Lismil Acosta"
    ],
    "principalesLabores": "CAMBIO DE GUAYA DAÑADA"
  },
  {
    "cuenta": "TF-I-C-GP07",
    "equipo": "Grua Puente Birriel STAHL AS306 2TN. Serial: 7302405",
    "tipo": "Gruas Puente",
    "totalHoras": 3.0,
    "registros": 1,
    "cantTrabajadores": 1,
    "trabajadores": [
      "Alexander Mérida"
    ],
    "principalesLabores": "CORRECCIÓN DE FALLA ELÉCTRICA DISPARO DE PROTECCIONES"
  },
  {
    "cuenta": "EEE-C-VH11",
    "equipo": "Pick up Mazda BT-50 2WD - Placa: A53BO6M",
    "tipo": "Vehiculos livianos",
    "totalHoras": 2.0,
    "registros": 1,
    "cantTrabajadores": 1,
    "trabajadores": [
      "Josué Solorzano"
    ],
    "principalesLabores": "REPARACION DE CAUCHO POS#3"
  },
  {
    "cuenta": "EEE-C-VH50",
    "equipo": "Pick Up Mazda BT-50 2WD - Placa A79CN0M",
    "tipo": "Vehiculos livianos",
    "totalHoras": 2.0,
    "registros": 1,
    "cantTrabajadores": 1,
    "trabajadores": [
      "Josué Solorzano"
    ],
    "principalesLabores": "DESMONTAJE, REPARACION E INSTALACION DE CAUCHO POS#1"
  },
  {
    "cuenta": "EEM-C-RM20",
    "equipo": "Semirremolque  Volqueta - Placa: A53AA0A Serial: 9AA02093G7C069651",
    "tipo": "Semirremolques",
    "totalHoras": 2.0,
    "registros": 1,
    "cantTrabajadores": 1,
    "trabajadores": [
      "Josué Solorzano"
    ],
    "principalesLabores": "DESMONTAJE, REPARACION E INSTALACION DE CAUCHO POS#6"
  },
  {
    "cuenta": "EEM-C-CH09",
    "equipo": "Chuto Mack Granite - Placa A74BG3K",
    "tipo": "Chutos",
    "totalHoras": 2.0,
    "registros": 1,
    "cantTrabajadores": 1,
    "trabajadores": [
      "Jesús Areyan"
    ],
    "principalesLabores": "REEMPLAZO DE 3 BATERIAS DUNCAN TIPO 31 SER: 5828943 / 5880877 / 5828956 NUEVAS"
  },
  {
    "cuenta": "EEM-C-CA02",
    "equipo": "Camion Plataforma Ford Cargo 815 - Placa: A56AL1F",
    "tipo": "Camiones",
    "totalHoras": 2.0,
    "registros": 1,
    "cantTrabajadores": 1,
    "trabajadores": [
      "REPARACIÓN REALIZADA POR EXTERNO"
    ],
    "principalesLabores": "REPARACION DE SISTEMA ESCAPE, INSTALACION SILENCIADOR ESCAPE"
  },
  {
    "cuenta": "AACO25",
    "equipo": "MIDEA 5TN SERIAL C705012870218127400002",
    "tipo": "AIRE ACONDICIONADO",
    "totalHoras": 2.0,
    "registros": 1,
    "cantTrabajadores": 1,
    "trabajadores": [
      "Lismil Acosta"
    ],
    "principalesLabores": "REVISIÓN Y MANTENIMIENTO"
  },
  {
    "cuenta": "SS-H-C-039",
    "equipo": "TO10 Torno Frontal TOS SP10",
    "tipo": "TORNO",
    "totalHoras": 2.0,
    "registros": 1,
    "cantTrabajadores": 1,
    "trabajadores": [
      "Carlos Mata"
    ],
    "principalesLabores": "CORRIGIENDO VIBRACIÓN, SE CORRIGIO QUEDO OPERATIVO"
  },
  {
    "cuenta": "EEE-C-VH43",
    "equipo": "Pick Up Mazda BT-50 2WD 2.2 - Placa: A32AL4O",
    "tipo": "Vehiculos livianos",
    "totalHoras": 2.0,
    "registros": 1,
    "cantTrabajadores": 1,
    "trabajadores": [
      "Julio Hernández"
    ],
    "principalesLabores": "LAVADO DE EQUIPO, ASPIRADO DE EQUIPO"
  },
  {
    "cuenta": "SS-H-C-030",
    "equipo": "TO03 Torno Grande zerbt",
    "tipo": "TORNO",
    "totalHoras": 2.0,
    "registros": 1,
    "cantTrabajadores": 1,
    "trabajadores": [
      "Alexander Mérida"
    ],
    "principalesLabores": "CORRECCIÓN DE FALLA ELÉCTRICA, PROTECCIONES DISPARADAS"
  },
  {
    "cuenta": "TF-I-C-GP18",
    "equipo": "Grua Puente Monorriel ABUS 5TN. Sin serial-G2",
    "tipo": "Gruas Puente",
    "totalHoras": 2.0,
    "registros": 1,
    "cantTrabajadores": 1,
    "trabajadores": [
      "Alexander Mérida"
    ],
    "principalesLabores": "REVISIÓN Y REARMADO DE PROTECCIONES"
  },
  {
    "cuenta": "TF-I-C-GP19",
    "equipo": "Grua Puente Monorriel KONEGRANS XN 4TN. Serial: 1134326047 G2",
    "tipo": "Gruas Puente",
    "totalHoras": 2.0,
    "registros": 1,
    "cantTrabajadores": 1,
    "trabajadores": [
      "Alexander Mérida"
    ],
    "principalesLabores": "REVISIÓN DE GRÚA PUENTE CABLE VIAJERO DESPRENDIDO SE NORMALIZO, SE REARMO PROTECCIONES"
  },
  {
    "cuenta": "AACO17",
    "equipo": "HAIER 12000 BTU SIN SERIAL",
    "tipo": "AIRE ACONDICIONADO",
    "totalHoras": 2.0,
    "registros": 1,
    "cantTrabajadores": 1,
    "trabajadores": [
      "Lismil Acosta"
    ],
    "principalesLabores": "MANTENIMIENTO Y LIMPIEZA DE FILTROS Y BANDEJA DE DREANJE DEL AIRE ACONDICIONADO DE ALMACEN CENTRAL"
  },
  {
    "cuenta": "EEM-C-CH01",
    "equipo": "Chuto Mack RD822SX - Placa: A23CR4M",
    "tipo": "Chutos",
    "totalHoras": 1.0,
    "registros": 1,
    "cantTrabajadores": 1,
    "trabajadores": [
      "Eduardo Bastardo"
    ],
    "principalesLabores": "REEMPLAZO DE BATERIA DUNCAN 4D NUEVA"
  },
  {
    "cuenta": "TT-F-MS08",
    "equipo": "Maquina de Soldar Combustible - Serial: U1120600787",
    "tipo": "Maquinas de Soldar",
    "totalHoras": 1.0,
    "registros": 1,
    "cantTrabajadores": 1,
    "trabajadores": [
      "Alexander Mérida"
    ],
    "principalesLabores": "PRUEBA DE FUNCIONAMIENTO EN EMINCA,"
  },
  {
    "cuenta": "TT-F-MS09",
    "equipo": "Maquina de Soldar Combustible - Serial: U1120511370",
    "tipo": "Maquinas de Soldar",
    "totalHoras": 1.0,
    "registros": 1,
    "cantTrabajadores": 1,
    "trabajadores": [
      "Alexander Mérida"
    ],
    "principalesLabores": "PRUEBA DE FUNCIONAMIENTO EN EMINCA, PRUEBA DE SOLDADURA"
  }
];

export const HORAS_HOMBRE_SIN_CUENTA_SEPTIEMBRE: HorasHombrePendienteConciliacion[] = [];

export const HORAS_HOMBRE_POR_FAMILIA_SEPTIEMBRE: ResumenMODFamilia[] = [
  {
    "tipo": "Grúas",
    "totalHoras": 1193.0,
    "registros": 235
  },
  {
    "tipo": "Autobuses",
    "totalHoras": 865.0,
    "registros": 155
  },
  {
    "tipo": "Camiones",
    "totalHoras": 784.0,
    "registros": 194
  },
  {
    "tipo": "Equipos Especiales",
    "totalHoras": 670.0,
    "registros": 185
  },
  {
    "tipo": "Vehiculos livianos",
    "totalHoras": 638.0,
    "registros": 143
  },
  {
    "tipo": "Mantenimiento y Adecuaciones",
    "totalHoras": 602.0,
    "registros": 102
  },
  {
    "tipo": "Montacargas",
    "totalHoras": 256.0,
    "registros": 70
  },
  {
    "tipo": "Otros",
    "totalHoras": 186.0,
    "registros": 43
  },
  {
    "tipo": "Chutos",
    "totalHoras": 162.0,
    "registros": 43
  },
  {
    "tipo": "TRACKTOR",
    "totalHoras": 125.0,
    "registros": 24
  },
  {
    "tipo": "Semirremolques",
    "totalHoras": 112.0,
    "registros": 29
  },
  {
    "tipo": "TORNO",
    "totalHoras": 80.0,
    "registros": 13
  },
  {
    "tipo": "Compresores",
    "totalHoras": 69.0,
    "registros": 26
  },
  {
    "tipo": "AIRE ACONDICIONADO",
    "totalHoras": 62.0,
    "registros": 13
  },
  {
    "tipo": "Maquinas de Soldar",
    "totalHoras": 34.0,
    "registros": 22
  },
  {
    "tipo": "Gruas Puente",
    "totalHoras": 33.0,
    "registros": 12
  },
  {
    "tipo": "Equipos Taller Fabricacion",
    "totalHoras": 27.0,
    "registros": 4
  },
  {
    "tipo": "MOTOBOMBA",
    "totalHoras": 24.0,
    "registros": 9
  },
  {
    "tipo": "MAQUINA ECM",
    "totalHoras": 10.0,
    "registros": 3
  },
  {
    "tipo": "TALADROS",
    "totalHoras": 7.0,
    "registros": 3
  },
  {
    "tipo": "Generadores",
    "totalHoras": 5.0,
    "registros": 2
  },
  {
    "tipo": "MANDRINADORA",
    "totalHoras": 5.0,
    "registros": 1
  },
  {
    "tipo": "Sierras",
    "totalHoras": 5.0,
    "registros": 1
  },
  {
    "tipo": "CORTADORA",
    "totalHoras": 5.0,
    "registros": 2
  },
  {
    "tipo": "Hidrolavadora",
    "totalHoras": 4.0,
    "registros": 2
  }
];

export const HORAS_HOMBRE_POR_TRABAJADOR_SEPTIEMBRE: ResumenMODTrabajador[] = [
  {
    "trabajador": "Omar Marín",
    "totalHoras": 255.0,
    "registros": 31,
    "paquete": 130.0
  },
  {
    "trabajador": "CALIX LOPEZ",
    "totalHoras": 247.0,
    "registros": 56,
    "paquete": 130.0
  },
  {
    "trabajador": "Francisco Siso",
    "totalHoras": 243.0,
    "registros": 65,
    "paquete": 130.0
  },
  {
    "trabajador": "Josué Solorzano",
    "totalHoras": 240.0,
    "registros": 72,
    "paquete": 130.0
  },
  {
    "trabajador": "Pablo León",
    "totalHoras": 240.0,
    "registros": 61,
    "paquete": 130.0
  },
  {
    "trabajador": "Oswaldo López",
    "totalHoras": 235.0,
    "registros": 43,
    "paquete": 130.0
  },
  {
    "trabajador": "TOMAS GUEVARA",
    "totalHoras": 235.0,
    "registros": 55,
    "paquete": 130.0
  },
  {
    "trabajador": "Luis Guzmán",
    "totalHoras": 233.0,
    "registros": 75,
    "paquete": 130.0
  },
  {
    "trabajador": "Jesús Areyan",
    "totalHoras": 233.0,
    "registros": 60,
    "paquete": 130.0
  },
  {
    "trabajador": "Pedro Santana",
    "totalHoras": 230.0,
    "registros": 76,
    "paquete": 130.0
  },
  {
    "trabajador": "Eduardo Bastardo",
    "totalHoras": 230.0,
    "registros": 63,
    "paquete": 130.0
  },
  {
    "trabajador": "Arquimedes Guerra",
    "totalHoras": 230.0,
    "registros": 40,
    "paquete": 130.0
  },
  {
    "trabajador": "RICARDO GONZALEZ",
    "totalHoras": 230.0,
    "registros": 40,
    "paquete": 130.0
  },
  {
    "trabajador": "Líno García",
    "totalHoras": 230.0,
    "registros": 58,
    "paquete": 130.0
  },
  {
    "trabajador": "Jesús Sánchez",
    "totalHoras": 229.0,
    "registros": 46,
    "paquete": 130.0
  },
  {
    "trabajador": "Hector Sánchez",
    "totalHoras": 227.0,
    "registros": 45,
    "paquete": 130.0
  },
  {
    "trabajador": "Julio Hernández",
    "totalHoras": 223.0,
    "registros": 64,
    "paquete": 130.0
  },
  {
    "trabajador": "Enderson Vera",
    "totalHoras": 220.0,
    "registros": 35,
    "paquete": 130.0
  },
  {
    "trabajador": "DAVID GARATE",
    "totalHoras": 213.0,
    "registros": 41,
    "paquete": 130.0
  },
  {
    "trabajador": "LUIS FERNANDO",
    "totalHoras": 213.0,
    "registros": 38,
    "paquete": 130.0
  },
  {
    "trabajador": "Pedro Avendaño",
    "totalHoras": 175.0,
    "registros": 29,
    "paquete": 130.0
  },
  {
    "trabajador": "CRISTIAN GARCIA",
    "totalHoras": 140.0,
    "registros": 38,
    "paquete": 130.0
  },
  {
    "trabajador": "María Fermín",
    "totalHoras": 140.0,
    "registros": 16,
    "paquete": 112.0
  },
  {
    "trabajador": "Birmania Gazcón",
    "totalHoras": 133.0,
    "registros": 14,
    "paquete": 112.0
  },
  {
    "trabajador": "Angela Nuñez",
    "totalHoras": 133.0,
    "registros": 14,
    "paquete": 112.0
  },
  {
    "trabajador": "Carlos Mata",
    "totalHoras": 130.0,
    "registros": 21,
    "paquete": 130.0
  },
  {
    "trabajador": "Lismil Acosta",
    "totalHoras": 123.0,
    "registros": 36,
    "paquete": 130.0
  },
  {
    "trabajador": "Marcos Narváez",
    "totalHoras": 119.0,
    "registros": 42,
    "paquete": 130.0
  },
  {
    "trabajador": "LUIS DIAZ",
    "totalHoras": 85.0,
    "registros": 23,
    "paquete": 130.0
  },
  {
    "trabajador": "Alexander Mérida",
    "totalHoras": 58.0,
    "registros": 16,
    "paquete": 130.0
  },
  {
    "trabajador": "JUAN GONZALEZ",
    "totalHoras": 55.0,
    "registros": 8,
    "paquete": 130.0
  },
  {
    "trabajador": "REPARACIÓN REALIZADA POR EXTERNO",
    "totalHoras": 36.0,
    "registros": 15,
    "paquete": 130.0
  }
];
