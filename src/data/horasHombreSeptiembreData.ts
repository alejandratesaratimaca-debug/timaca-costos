/**
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
  totalHorasHombre: 2212,
  horasConCuentaAuxiliar: 2121,
  horasSinCuentaAuxiliar: 91,
  totalRegistros: 473,
  registrosConCuenta: 453,
  registrosSinCuenta: 20,
  cuentasAuxiliaresImpactadas: 89,
  totalTecnicosPlanta: 30,
  tarifaPromedioEstimadaHora: 2.05,
  costoEstimadoTotalUSD: Math.round(2212 * 2.05)
};

export const HORAS_HOMBRE_POR_CUENTA_SEPTIEMBRE: HorasHombreCuentaSep[] = [
  {
    "cuenta": "EEI-C-GR17",
    "equipo": "Grua Grove TM 890 - 90TN Serial 68473",
    "tipo": "Grúas",
    "totalHoras": 196,
    "registros": 30,
    "cantTrabajadores": 5,
    "trabajadores": [
      "JOSUÉ SOLORZANO",
      "ARQUIMEDES GUERRA",
      "RICARDO GONZALEZ",
      "LUIS FERNANDO",
      "EDUARDO BASTARDO"
    ],
    "principalesLabores": "CONTINUACION ARMADO CAUCHOS • INSTALACION DE 18 CAUHCOS 14.00R20 NUEVOS • INSTALACION DE MANOMETROS PRESION ACEITE, VOLTAJE, TEMPERATURA CAMION NUEVOS, MANOMETROS PRESION ACEITE, TEMPERATURA, VOLTAJE CABINA GRUA, INSTALACION DE CORNETAS NUEVAS, CEPILLOS LIMPIA PARABRISAS NUEVO • ARMADO CILINDRO EXTENSIONES CON KIT SELLOS NUEVOS"
  },
  {
    "cuenta": "EEE-C-CA06",
    "equipo": "Camion Lubricador Ford Cargo 815 - Placa: A11AL1F",
    "tipo": "Camiones",
    "totalHoras": 164,
    "registros": 40,
    "cantTrabajadores": 2,
    "trabajadores": [
      "PABLO LEÓN",
      "LINO GARCÍA"
    ],
    "principalesLabores": "SURTIDO GASOIL EQUIPOS PELLAS • SURTIDO GASOIL EQUIPOS TIMACA • SURTIDO GASOIL EQUIPOS FMO • DESMONTAJE MOTOR ARRANQUE REPARADO COMPRESOR, INSTALACION DE MOTOR ARRANQUE USADO DE HIDROJET"
  },
  {
    "cuenta": "EE-G-C-016",
    "equipo": "Mantto y Adecuaciones Galpones - Mantto",
    "tipo": "Mantenimiento y Adecuaciones",
    "totalHoras": 89,
    "registros": 10,
    "cantTrabajadores": 2,
    "trabajadores": [
      "ANGELA NUÑEZ",
      "FRANCISCO SISO"
    ],
    "principalesLabores": "MANTENIMIENTO Y LIMPIEZA DE OFICINAS, COMEDOR, BAÑOS, VESTUARIOS, PASILLOS • LIMPIEZA Y LAVADO AREA TALLER SISO, PINTADO AREA • LIMPIEZA AREA SOLDADURA, PINTADO DE MESA"
  },
  {
    "cuenta": "TT-A-C-208",
    "equipo": "Mantto y Adecuaciones Galpones -  Almacén",
    "tipo": "Mantenimiento y Adecuaciones",
    "totalHoras": 87,
    "registros": 10,
    "cantTrabajadores": 2,
    "trabajadores": [
      "MARÍA FERMÍN",
      "LISMIL ACOSTA"
    ],
    "principalesLabores": "MANTENIMIENTO Y LIMPIEZA DE OFICINAS, COMEDOR, BAÑOS, VESTUARIOS, PASILLOS • MANTENIMIENTO Y LIMPIEZA DE FILTROS Y BANDEJA DE DREANJE DEL AIRE ACONDICIONADO DE ALMACEN CENTRAL • MANTENIMIENTO Y LIMPIEZA DE OFICINAS, COMEDOR, BAÑOS, VESTUARIOS"
  },
  {
    "cuenta": "TT-G-C-032",
    "equipo": "Mantto y Adecuaciones Galpones - Fab",
    "tipo": "Mantenimiento y Adecuaciones",
    "totalHoras": 80,
    "registros": 9,
    "cantTrabajadores": 2,
    "trabajadores": [
      "BIRMANIA GAZCÓN",
      "LISMIL ACOSTA"
    ],
    "principalesLabores": "MANTENIMIENTO Y LIMPIEZA DE OFICINAS, COMEDOR, BAÑOS, VESTUARIOS, PASILLOS • REPARACIÓN Y CAMBIO DE BAJANTE DE LOS BAÑOS DE FABRICACIÓN"
  },
  {
    "cuenta": "EEE-C-VH45",
    "equipo": "Pick Up Mazda BT-50 2WD 2.2 - Placa A46BT6V",
    "tipo": "Vehículos",
    "totalHoras": 74,
    "registros": 10,
    "cantTrabajadores": 2,
    "trabajadores": [
      "OSWALDO LOPEZ",
      "DAVID GARATE"
    ],
    "principalesLabores": "CONTINUACION ARMADO MOTOR, KIT CORREA TIEMPO NUEVA, CORREA DIRECCION 17325 NUEVA, CORREA COMPRESOR 17370 NUEVA, CORREA ALTERNADOR 17370 NUEVA • CONTINUACION ARMADO MOTOR, DESMONTAJE CAMARA MOTOR • INSTALACION CAMARA CON SERVICIO, TAQUETES NUEVOS, ARBOL DE LEVAS NUEVO • CONTINUACION INSTALACION DE CAMARA MOTOR, PUESTA EN TIEMPO"
  },
  {
    "cuenta": "EEE-C-VH52",
    "equipo": "Pick Up Mazda BT-50 2WD - Placa 04XFAJ",
    "tipo": "Vehículos",
    "totalHoras": 70,
    "registros": 11,
    "cantTrabajadores": 5,
    "trabajadores": [
      "OSWALDO LOPEZ",
      "DAVID GARATE",
      "JULIO HERNADEZ",
      "JESÚS AREYAN",
      "ENDERSON VERA"
    ],
    "principalesLabores": "REEMPLAZO ACEITE MOTOR, FILTRO ACEITE MOTOR, FILTRO GASOLINA, ESTOPERA DELANTERA CIGUEÑAL NUEVA, CORREA TIEMPO NUEVA, CORREA COMPRESOR, DIRECCION Y ALTERNADOR NEVAS, CABLES DE BUJIAS NUEVOS • DRENAJE DE RADIADOR, SUMINISTRO REFRIGERANTE, DESMOMTAJE Y MANTENIMIENTO CUERPO ACELERACION • CALIBRACION DE MOTOR, REEMPLAZO CUÑA DAMPER MOTOR, PUESTA EN TIEMPO MOTOR, REEMPLAZO TAPA DISTRIBUIDOR • DESMONTAJE TANQUE GASOLINA, REEMPLAZO PILA BOMBA GASOLINA NUEVA Y CONECTORES ENCHUFE BOMBA GASOLINA NUEVA, REEMPLAZO ACEITE DIFERENCIAL"
  },
  {
    "cuenta": "EEI-C-GR20",
    "equipo": "Grua Demag  AC-200  - 200TN Serial 74599126",
    "tipo": "Grúas",
    "totalHoras": 67,
    "registros": 7,
    "cantTrabajadores": 1,
    "trabajadores": [
      "OMAR MARÍN"
    ],
    "principalesLabores": "TRABAJO EN GRUA"
  },
  {
    "cuenta": "EEE-C-RE02",
    "equipo": "Retroexcavadora Case 580M  - Serial: N6C411548",
    "tipo": "Equipos Especiales",
    "totalHoras": 64,
    "registros": 11,
    "cantTrabajadores": 3,
    "trabajadores": [
      "CALIX LOPEZ",
      "TOMAS GUEVARA",
      "FRANCISCO SISO"
    ],
    "principalesLabores": "LAVADO DE EQUIPO, DESMONTAJE DE TURBO, INSTALACION HOLSET HX25W NUEVO • DESMONTAJE DE TORNILLOS TUNEL TRASERO, DESMONTAJE DE BOMBA HIDRAULICA • DESMONTAJE Y DESARMADO DE CILINDRO HIDRAULICO ESTABILIZADOR IZQUIERDO, DESARMADO BOMBA HIDRAULICA • ARMADO CILINDRO HIDRAULICO ESTABILZADOR IZQUIERDO CON KIT SELLOS NUEVOS, INSTALACION DE CILINDRO ESTABILIZADOR IZQUIERDO REPARADO, INSTALACION DE TORNILLOS SOPORTES TUNEL TRASERO, REPARADO E INSTLACION CAPOT MOTOR, REEMPLAZO FILTRO AIRE 1°"
  },
  {
    "cuenta": "EEE-C-VH48",
    "equipo": "Pick Up Mazda BT-50 2WD 2.6 - Placa A46AT6B",
    "tipo": "Vehículos",
    "totalHoras": 62,
    "registros": 11,
    "cantTrabajadores": 4,
    "trabajadores": [
      "PEDRO AVENDAÑO",
      "ENDERSON VERA",
      "JESÚS AREYAN",
      "JOSUÉ SOLORZANO"
    ],
    "principalesLabores": "INSTALACION DE CAMARA MOTOR CON SERVICIO, GOMAS DE VALVULAS NUEVA, TAQUETES NUEVOS • PUESTA EN TIEMPO MOTOR, REEMPLAZO KIT CADENA TIEMPO, ESTOPERA DELANTERA CIGUEÑAL NUEVA, ROTOR DISTRIBUIDOR  NUEVO, MANGUERA ASPIRACION NUEVA, ACEITE MOTOR NUEVO • CONTINUACION ARMADO MOTOR, CORREA COMPRESOR, ALTERNADOR, DIRECCION NUEVAS, INSTALACION RADIADOR, SUMINISTROS REFRIGERANTE, PRUEBAS DE EQUIPO • DESMONTAJE DE RADIADOR, INSTALACION DE TERMOSTATO NUEVO, INSTALACION DE RADIADOR CON SERVICIO, SUMINISTRO REFRIGERANTE"
  },
  {
    "cuenta": "SS-H-C-035",
    "equipo": "TO04 Torno Paralelo BREDA 300",
    "tipo": "Torno",
    "totalHoras": 61,
    "registros": 9,
    "cantTrabajadores": 1,
    "trabajadores": [
      "CARLOS MATA"
    ],
    "principalesLabores": "MANTENIMIENTO Y SERVICIO • MANTENIMIENTO TORNO TO04 • MANTENIMIENTO Y SERVICIO, PROCESO DE ARMADO DEL TORNO"
  },
  {
    "cuenta": "TT-I-C-033",
    "equipo": "Adecuaciones y/o mejoras TIMACA",
    "tipo": "Mantenimiento y Adecuaciones",
    "totalHoras": 58,
    "registros": 14,
    "cantTrabajadores": 3,
    "trabajadores": [
      "LISMIL ACOSTA",
      "MARCOS NARVAEZ",
      "ALEXANDER MÉRIDA"
    ],
    "principalesLabores": "CAMBIO DE LÁMPARAS DAÑADAS EN OFICINA DE ADMINISTRACIÓN • CAMBIO DE CONTACTOR DAÑADO • CAMBIO DE PALANCA DEL HERRAJE DE LA POCETA DEL BAÑO DE MUJERES • ADECUACIÓN DE CAJAS DE DISTRIBUCIÓN ELÉCTRICA"
  },
  {
    "cuenta": "EEI-C-GR25",
    "equipo": "Grua Grove RT750 50TN Serial: 87167",
    "tipo": "Grúas",
    "totalHoras": 50,
    "registros": 5,
    "cantTrabajadores": 5,
    "trabajadores": [
      "PEDRO SANTANA",
      "LUIS GUZMAN",
      "LUIS FERNANDO",
      "RICARDO GONZALEZ",
      "ARQUIMEDES GUERRA"
    ],
    "principalesLabores": "CONTINUACION ARMADO CILINDROS ESTABILIZADORES • DESMONTAJE DE CILINDRO EXTENSION"
  },
  {
    "cuenta": "EEE-C-MC01",
    "equipo": "Montacargas Caterpillar  DP50K - 5TN Serial: AT28B51453",
    "tipo": "Montacargas",
    "totalHoras": 49,
    "registros": 11,
    "cantTrabajadores": 6,
    "trabajadores": [
      "JULIO HERNADEZ",
      "JESÚS AREYAN",
      "PEDRO SANTANA",
      "LUIS GUZMAN",
      "EDUARDO BASTARDO",
      "JOSUÉ SOLORZANO"
    ],
    "principalesLabores": "REEMPLAZO 2 BATERIAS DUNCAN  24MR SER: 5947438 / 5947447 NUEVAS, BORNES DE BATERIAS NUEVOS, SWITCH PULSADOR APAGADO NUEVO • REEMPLAZO FILTRO GASOIL, ESPURGUE SISTEMA GASOIL, REPARACION FUSIBLERA • AJUSTE CORREAS • DESMONTAJE DE CORREA Y POLEA TENSORA VENTILADOR, REEMPLAZO DE RODAMIENTO 6301-2RS POLEA TENSORA VENTILADOR, INSTALACION DE POLEA TENSORA Y CORREA VENTILADOR 17530 NUEVA"
  },
  {
    "cuenta": "EEA-C-BS01",
    "equipo": "Autobus  Encava ENT-3300 - PLaca: A83AH9B",
    "tipo": "Autobuses",
    "totalHoras": 48,
    "registros": 7,
    "cantTrabajadores": 5,
    "trabajadores": [
      "FRANCISCO SISO",
      "EDUARDO BASTARDO",
      "HECTOR SANCHEZ",
      "JESÚS SANCHEZ",
      "ENDERSON VERA"
    ],
    "principalesLabores": "DESMONTAJE MOTOR DE ARRANQUE, INSTALACION DE MOTOR DE ARRANQUE REPARADO, ESPURGUE SISTEMA DE GASOIL, ENCENDIDO, PRUEBAS DE EQUIPO • REEMPLAZO DE MANGUERA AFTER COOLER NUEVA, REVISION DE FUGA AGUA RADIADOR • REVISION DE FUGA AGUA, DESMONTAJE DE PARACHOQUE DELANTERO. AFTER COOLER, RADIADOR, INSTALACION DE RADIADOR REPARADO, AFTER COOLER"
  },
  {
    "cuenta": "EEM-C-CA04",
    "equipo": "Camion Plataforma Ford Cargo 815 - Placa: A11AI5B",
    "tipo": "Camiones",
    "totalHoras": 47,
    "registros": 10,
    "cantTrabajadores": 8,
    "trabajadores": [
      "CALIX LOPEZ",
      "TOMAS GUEVARA",
      "HECTOR SANCHEZ",
      "JESÚS SANCHEZ",
      "JOSUÉ SOLORZANO",
      "FRANCISCO SISO",
      "ENDERSON VERA",
      "REPARACION REALIZADA POR EXTERNO"
    ],
    "principalesLabores": "LAVADO DE EQUIPO • REVISION DE TREN DELANTERO • EEMPLAZO 2 CAUCHOS DELANTEROS NUEVOS, 215/75R17.5, SERVICIO DE ALINEACION • REPARACION DE TREN DELANTERO, DESMONTAJE DE CAUCHOS DELANTEROS, REEMPLAZO DE TERMINALES BARRA LARGA DIRECCION NUEVOS, ESTOPERA PUNTA EJE DELANTERA DERECHA NUEVA, REVISION PASADORES DE RUEDAS, AJUSTE DE RODAMIENTOS DELANTEROS, INSTALACION DE 2 CAUCHOS 215/75R17.5 NUEVOS POS#1 #2"
  },
  {
    "cuenta": "EEA-C-BS02",
    "equipo": "Autobus  Encava ENT-3100 - PLaca: 613XLK",
    "tipo": "Autobuses",
    "totalHoras": 45,
    "registros": 6,
    "cantTrabajadores": 4,
    "trabajadores": [
      "FRANCISCO SISO",
      "HECTOR SANCHEZ",
      "JESÚS SANCHEZ",
      "JULIO HERNADEZ"
    ],
    "principalesLabores": "REVISION FUGA GASOIL POR TUBERIAS INYECCION, REEMPLAZO DE TUBERIAS DE INYECCION USADAS • REVISION DE FRENOS, DESMONTAJE DE CAUCHOS Y TAMBOR DE FRENOS TRASERO IZQUIERDO, USADO DESMONTADO DE BS03, ESTOPERA PUNTA EJE TRASERA IZQUIERDA NUEVA 370003A, REEMPLAZO AMORTIGUADOR TRASERO DERECHO NUEVO • REEMPLAZO ACEITE MOTOR, FILTRO CEITE MOTOR, FILTRO GASOIL 1° 2°, LAVADO EQUIPO, ENGRASE EQUIPO, AJUSTE DE SUSPENSION, AJUSTE DE COMPRESOR Y BOMBA DIRECCION"
  },
  {
    "cuenta": "EEE-C-EX03",
    "equipo": "Excavadora Caterpillar 302.5 Serial: 4AZ00621",
    "tipo": "Equipos Especiales",
    "totalHoras": 45,
    "registros": 9,
    "cantTrabajadores": 5,
    "trabajadores": [
      "FRANCISCO SISO",
      "TOMAS GUEVARA",
      "CALIX LOPEZ",
      "JESÚS AREYAN",
      "ENDERSON VERA"
    ],
    "principalesLabores": "DESMONTAJE Y DESARMADO CILINDRO HIDRAULICO PLUMA, INSTALACION DE SELLOS PISTON CILINDRO HIDRAULICO DE PLUMA NUEVA, INSTALACION CILINDRO HIDRAULICO PLUMA REPARADO • REEMPLAZO SENSOR PRESION DE ACEITE MOTOR • DESMONTAJE Y DESARMADO DE CILINDRO DE PLUMA • INSTALACION CILINDRO HIDRAULICO PLUMA REPARADO CON SELLOS NUEVOS, COMPLETADO NIVEL ACEITE HIDRAULICO, REPARACION DE SOPORTES MOTOR"
  },
  {
    "cuenta": "TT-H-C-031",
    "equipo": "Mantto herramientas y accesorios - Fab",
    "tipo": "Mantenimiento y Adecuaciones",
    "totalHoras": 42,
    "registros": 12,
    "cantTrabajadores": 2,
    "trabajadores": [
      "LISMIL ACOSTA",
      "MARCOS NARVAEZ"
    ],
    "principalesLabores": "REPARACIÓN DE ESMERILES ELÉCTRICOS • ADECUACIÓN DE DISTRIBUIDORES ELÉCTRICOS • FABRICACIÓN DE EXTENSIONES ELÉCTRICAS • MANTENIMIENTO Y REPARACIÓN DE ESMERILES ELÉCTRICOS, CAMBIO DE CARBONES"
  },
  {
    "cuenta": "EEA-C-BS15",
    "equipo": "Autobus Encava ENT-3300 - Placa: 6036A1Y",
    "tipo": "Autobuses",
    "totalHoras": 37,
    "registros": 7,
    "cantTrabajadores": 5,
    "trabajadores": [
      "CALIX LOPEZ",
      "TOMAS GUEVARA",
      "EDUARDO BASTARDO",
      "HECTOR SANCHEZ",
      "JESÚS SANCHEZ"
    ],
    "principalesLabores": "DESMONTAJE DE PARACHOQUE DELANTERO, AFTER COOLER Y RADIADOR, REEMPLAZO DE TURBO COMPRESOR HX40 NUEVO, LAVADO DE AFTER COOLER, REEMPLAZO CORREA 8PK1550 NUEVA • INSTALACION DE AFTER COOLER CON SERVICIO, RADIADOR REPARADO, REEMPLAZO ASPA VENTILADOR USADA DE BS03, CORNETA DE AIRE NUEVA, SUMINISTRO REFRIGERANTE RADIADOR • ADECUACION DE TANQUE GASOIL"
  },
  {
    "cuenta": "EEM-C-CH08",
    "equipo": "Chuto Mack Granite - Placa A74DC4K",
    "tipo": "Chutos",
    "totalHoras": 34,
    "registros": 5,
    "cantTrabajadores": 4,
    "trabajadores": [
      "JULIO HERNADEZ",
      "DAVID GARATE",
      "FRANCISCO SISO",
      "LUIS GUZMAN"
    ],
    "principalesLabores": "REEMPLAZO ACEITE MOTOR, FILTRO ACEITE MOTOR, FILTRO GASOIL 1° 2° 3°, LAVADO EQUIPO • DESMONTAJE DE CAUCHOS POS#3 #4 #7 #8, REEMPLAZO DE BANDAS DE FRENOS NUEVAS POS#3 #5, INSTALACION DE CAUCHOS"
  },
  {
    "cuenta": "EEM-C-CH06",
    "equipo": "Chuto Mack CH613 - Placa: A25AB2E",
    "tipo": "Chutos",
    "totalHoras": 33,
    "registros": 8,
    "cantTrabajadores": 6,
    "trabajadores": [
      "ARQUIMEDES GUERRA",
      "RICARDO GONZALEZ",
      "LUIS FERNANDO",
      "JULIO HERNADEZ",
      "PEDRO SANTANA",
      "LUIS GUZMAN"
    ],
    "principalesLabores": "DESMONTAJE RESERVORIO DE REFRIGERANTE, REPARACION DE RESERVORIO REFRIGERANTE • REEMPLAZO ACEITE MOTOR FILTRO ACEITE MOTOR. FILTRO GASOIL 1° 2° 3°, LAVADO EQUIPO, ENGRASE EQUIPO, INSTALACION DE RESERVORIO REFRIGERANTE REPARADO • LAVADO EQUIPO"
  },
  {
    "cuenta": "EEA-C-BS14",
    "equipo": "Autobus Encava ENT-3300 - Placa: 6199A3P",
    "tipo": "Autobuses",
    "totalHoras": 30,
    "registros": 3,
    "cantTrabajadores": 3,
    "trabajadores": [
      "HECTOR SANCHEZ",
      "JESÚS SANCHEZ",
      "ENDERSON VERA"
    ],
    "principalesLabores": "REVISION DE FUGA RADIADOR, DESMONTAJE DE RADIADOR, AFTER COOLER, PARACHOQUE DELANTERO, LAVADO DE AFTER COOLER , REEMPLAZO TURBOCOMPRESOR HX40 NUEVO, INSTALACION DE RADIADOR CON SERVICIO, AFTER COOLER Y PARACHOQUES DELANTERO,"
  },
  {
    "cuenta": "TTI-C-0105",
    "equipo": "Adecuación Patio Externo Timaca",
    "tipo": "Otros",
    "totalHoras": 27,
    "registros": 9,
    "cantTrabajadores": 2,
    "trabajadores": [
      "MARCOS NARVAEZ",
      "LISMIL ACOSTA"
    ],
    "principalesLabores": "ADECUACIÓN DE TORRES DE ALUMBRADO DEL PATIO EXTERNO DE ALMACEN CENTRAL • ADECUACIÓN DE TORRES DE ALUMBRADO DE ALMACÉN CENTRAL • INSTALACIÓN DE TUBERIAS ELÉCTRICAS EEN EL TERRENO DE AMPLIACIÓN DE GALPONES • INSTALACIÓN DE SISTEMA DE CONTROL PARA LA ILUMINACIÓN DE LAS TORRES DEL PATIO EXTERNO"
  },
  {
    "cuenta": "EEE-C-RE03",
    "equipo": "Retroexcavadora John Deere 310G Serial: T0310GX963029",
    "tipo": "Equipos Especiales",
    "totalHoras": 26,
    "registros": 10,
    "cantTrabajadores": 4,
    "trabajadores": [
      "PEDRO SANTANA",
      "LUIZ GÚZMAN",
      "LUIS GUZMAN",
      "EDUARDO BASTARDO"
    ],
    "principalesLabores": "REEMPLAZO ACEITE MOTOR, FILTRO ACEITE MOTOR, FILTRO GASOIL, FILTRO AIRE, ENGRASE EQUIPO, COMPLETADO NIVEL ACEITE TRANSMISION • ENGRASE EQUIPO, AJUSTE TERMINALES Y ROTULAS DIRECCION • ENGRASE EQUIPO, COMPLETADO NIVELES FLUIDOS • ENGRASE EQUIPO, COMPLETACION NIVELES FLUIDOS"
  },
  {
    "cuenta": "EEA-C-BS10",
    "equipo": "Autobus Encava ENT-330063 - Placa: A26DP8K",
    "tipo": "Autobuses",
    "totalHoras": 26,
    "registros": 8,
    "cantTrabajadores": 8,
    "trabajadores": [
      "JOSUÉ SOLORZANO",
      "JULIO HERNADEZ",
      "HECTOR SANCHEZ",
      "JESÚS SANCHEZ",
      "ARQUIMEDES GUERRA",
      "RICARDO GONZALEZ",
      "EDUARDO BASTARDO",
      "LUIS FERNANDO"
    ],
    "principalesLabores": "REEMPLAZO ACEITE MOTOR, FILTRO ACEITE MOTOR, FILTRO GASOIL 1° 2° 3°, ENGRASE EQUIPO, LAVADO EQUIPO, REVISION Y COMPLETACION NIVELES FLUIDOS • REEMPLAZO VALVULA DE AIRE PEDAL Y VALVULA IRE MOTOR • REVISION DE FUGA ACEITE FRONTAL MOTOR"
  },
  {
    "cuenta": "EEM-C-CH10",
    "equipo": "Chuto Mack Granite - Placa A18DH7A",
    "tipo": "Chutos",
    "totalHoras": 25,
    "registros": 4,
    "cantTrabajadores": 3,
    "trabajadores": [
      "ARQUIMEDES GUERRA",
      "RICARDO GONZALEZ",
      "LUIS FERNANDO"
    ],
    "principalesLabores": "REVISION SISTEMA NEUMATICO, DESMONTAJE MANGUERA DE AIRE • DESMONTAJE, FABRICACION E INSTALACION DE MANGUERA GASOIL, CORRECCION DE SISTEMA NEUMATICO DE FRENOS"
  },
  {
    "cuenta": "EEI-C-GR21",
    "equipo": "Grua Liebherr LR1400 - 140TN Serial W09646000",
    "tipo": "Grúas",
    "totalHoras": 24,
    "registros": 5,
    "cantTrabajadores": 4,
    "trabajadores": [
      "OMAR MARÍN",
      "JULIO HERNADEZ",
      "JOSUÉ SOLORZANO",
      "FRANCISCO SISO"
    ],
    "principalesLabores": "TRABAJO EN GRUA • INSTALACION DE CAUCHO 16.00R25 NUEVO POS#11 DESMONTADO DE GR22 • FABRICACION DE 2 MNGUERAS HIDRAULICAS"
  },
  {
    "cuenta": "EEM-C-CA13",
    "equipo": "Camion Pickman Iveco Eurocargo 170E22 - Placa: A32AA5S",
    "tipo": "Camiones",
    "totalHoras": 24,
    "registros": 4,
    "cantTrabajadores": 2,
    "trabajadores": [
      "LUIS GUZMAN",
      "PEDRO SANTANA"
    ],
    "principalesLabores": "LAVADO BRAZO HIDRAULICO, REVISION DE FUGA ACEITE HIDRAULICO, REEMPLAZO DE SELLOS ADAPTADORES HIDRAULICOS, REEMPLAZO ACEITE MOTOR, FILTRO ACEITE MOTOR, FILTRO GASOIL 1° 2° 3°, ENGRASE EQUIPO • LAVADO EQUIPO, ENGRASE EQUIPO"
  },
  {
    "cuenta": "EEI-C-GR06",
    "equipo": "Grua P&H R200 - 20TN Serial 31192",
    "tipo": "Grúas",
    "totalHoras": 21,
    "registros": 4,
    "cantTrabajadores": 2,
    "trabajadores": [
      "JOSUÉ SOLORZANO",
      "FRANCISCO SISO"
    ],
    "principalesLabores": "ARMADO DE CAUCHO 16.00R24 NUEVO EN RIN, INSTALACION DE CAUCHO POS#3 NUEVO • REPARACION DE CAUCHO 16.00R24 POS#3 • REEMPLAZO GUAYA APAGADO MOTOR"
  },
  {
    "cuenta": "EEE-C-VH15",
    "equipo": "Ambulancia Chevrolet Cargo Van - Placa: A06AI2I",
    "tipo": "Vehículos",
    "totalHoras": 21,
    "registros": 6,
    "cantTrabajadores": 4,
    "trabajadores": [
      "JESÚS AREYAN",
      "JOSUÉ SOLORZANO",
      "TOMAS GUEVARA",
      "CALIX LOPEZ"
    ],
    "principalesLabores": "REVISION DE FALLA, DESMONTAJE DE TAPA Y ROTOR DISTRIBUIDOR, DESMONTAJE DE BUJIAS Y CABLE DE BUJIAS • LAVADO DE EQUIPO • REEMPLAZO TAPA DISTRIBUIDOR, ROTOR DISTRIBUIDOR, BUJIAS, CABLE BUJIAS NUEVOS"
  },
  {
    "cuenta": "EEI-C-GR22",
    "equipo": "Grua Liebherr LTM1400 - 400TN Serial W09858000NEL05061",
    "tipo": "Grúas",
    "totalHoras": 20,
    "registros": 2,
    "cantTrabajadores": 2,
    "trabajadores": [
      "ARQUIMEDES GUERRA",
      "RICARDO GONZALEZ"
    ],
    "principalesLabores": "TORQUEADO DE BANCADA Y BIELAS, INSTALACION DE INYECTORES DE ACEITES NUEVOS, SEPARADORES DE INYECTORES DE ACEITE NUEVOS"
  },
  {
    "cuenta": "EEA-C-BS05",
    "equipo": "Autobus HINO 500 Fortier - PLaca: A2082AG",
    "tipo": "Autobuses",
    "totalHoras": 20,
    "registros": 4,
    "cantTrabajadores": 2,
    "trabajadores": [
      "HECTOR SANCHEZ",
      "JESÚS SANCHEZ"
    ],
    "principalesLabores": "GRADUACION DE FRENOS DELANTEROS, REEMPLAZO DE BARRA CORTA DIRECCION NUEVA • AJUSTE DE BARRA LARGA Y CORTA DE DIRECCION"
  },
  {
    "cuenta": "EEA-C-BS13",
    "equipo": "Autobus Encava ENT-900 - Placa: 03AA4WA",
    "tipo": "Autobuses",
    "totalHoras": 20,
    "registros": 2,
    "cantTrabajadores": 2,
    "trabajadores": [
      "PEDRO AVENDAÑO",
      "ENDERSON VERA"
    ],
    "principalesLabores": "REEMPLAZO BOMBA DE AGUA NUEVA, ESTOPERA DELANTERA CIGUEÑAL NUEVA, DESMONTAJE DE TAPA VALVULAS, DESMONTAJE ESTOPERA TRASERA CIGUEÑAL"
  },
  {
    "cuenta": "EEE-C-MC08",
    "equipo": "Montacargas Caterpillar  V300B - 14TN Serial: 86Y625",
    "tipo": "Montacargas",
    "totalHoras": 17,
    "registros": 6,
    "cantTrabajadores": 4,
    "trabajadores": [
      "CALIX LOPEZ",
      "TOMAS GUEVARA",
      "EDUARDO BASTARDO",
      "FRANCISCO SISO"
    ],
    "principalesLabores": "DESMONTAJE DE GUAYA DE ACELERACION • INSTALACION DE GUAYA ACELERACION NUEVA • REVISION FUGAS ACEITE, FABRICACION E INSTALACION DE 2 MANGUERAS HIDRAULICASM, COMPLETADAS NIVELES FLUIDOS, LAVADO DE EQUIPO"
  },
  {
    "cuenta": "EEI-C-GR11",
    "equipo": "Grua P&H R200 - 20TN Serial 44434",
    "tipo": "Grúas",
    "totalHoras": 15,
    "registros": 6,
    "cantTrabajadores": 4,
    "trabajadores": [
      "FRANCISCO SISO",
      "JESÚS AREYAN",
      "PEDRO SANTANA",
      "LUIS GUZMAN"
    ],
    "principalesLabores": "DESMONTAJE DE MANGUERA HIDRAULICA TELESCOPICO • FABRICACION DE MANGUERA HIDRAULICA DE TELESCOPICO SAE100R2 1\" X 185 CM, INSTALACION DE MANGUERA HIDRAULICA • REEMPLAZO SWITCH DE ENCENDIDO CTP NUEVO, CORECCION DE CORTO CIRCUITO CABLEADO ELECTRICO"
  },
  {
    "cuenta": "EEE-C-VH10",
    "equipo": "Pick up Mazda BT-50 2WD - Placa: A18AR8F",
    "tipo": "Vehículos",
    "totalHoras": 14,
    "registros": 4,
    "cantTrabajadores": 4,
    "trabajadores": [
      "PEDRO AVENDAÑO",
      "ENDERSON VERA",
      "JULIO HERNADEZ",
      "JESÚS AREYAN"
    ],
    "principalesLabores": "REVISION DE FRENOS, DESMONTAJE DE HIDROVAC Y BOMBA DE FRENOS, INSTALACION DE HIDROVAC DE FRENOS USADO, BOMBA DE FRENO NUEVA • CORRECCION DE LUCES DE FRENOS"
  },
  {
    "cuenta": "TT-S-C-854",
    "equipo": "Payloader Hyndai HL760-7",
    "tipo": "Equipos Especiales",
    "totalHoras": 14,
    "registros": 4,
    "cantTrabajadores": 4,
    "trabajadores": [
      "ENDERSON VERA",
      "JESÚS AREYAN",
      "JULIO HERNADEZ",
      "DAVID GARATE"
    ],
    "principalesLabores": "REVISION DE PROBLEMA ELECTRICO TRANSMISION, DESMONTAJE Y MANTENIMIENTO DE RELE AUTOMATICO, REPARACION DE CABLEADO ELECTRICO • COMPLETACION DE FLUIDOS, ENGRASE DE EQUIPO, LAVADO DE EQUIPO"
  },
  {
    "cuenta": "EEE-C-EX01",
    "equipo": "Excavadora Caterpillar 3200D Serial: CAT032DHBWZ00282",
    "tipo": "Equipos Especiales",
    "totalHoras": 14,
    "registros": 7,
    "cantTrabajadores": 6,
    "trabajadores": [
      "HECTOR SANCHEZ",
      "JESÚS SANCHEZ",
      "FRANCISCO SISO",
      "JULIO HERNADEZ",
      "TOMAS GUEVARA",
      "CALIX LOPEZ"
    ],
    "principalesLabores": "REPARACION E INSTALACION DE MANGUERA DE AGUA • REEMPLAZO MANGUERA DE AGUA NUEVA • CORRECCION DE FUGA ACEITE POR MANGUERA DE MOTOR"
  },
  {
    "cuenta": "EEI-C-GR26",
    "equipo": "Grua Grove RT750 50TN Serial: 87669",
    "tipo": "Grúas",
    "totalHoras": 12,
    "registros": 4,
    "cantTrabajadores": 4,
    "trabajadores": [
      "JESÚS AREYAN",
      "JULIO HERNADEZ",
      "PEDRO SANTANA",
      "LUIS GUZMAN"
    ],
    "principalesLabores": "DESMONTAJE MOTOR DE ARRANQUE, INSTALACION DE MOTOR DE ARRANQUE REPARADO • REVISION Y COMPLETACION FLUIDOS, REVISION ACEITE TRANSMISION"
  },
  {
    "cuenta": "EEI-C-GR12",
    "equipo": "Grua Grove RT 740B - 40TN Serial 84688",
    "tipo": "Grúas",
    "totalHoras": 12,
    "registros": 9,
    "cantTrabajadores": 3,
    "trabajadores": [
      "PEDRO SANTANA",
      "LUIS GUZMAN",
      "EDUARDO BASTARDO"
    ],
    "principalesLabores": "REPARACION DE HOROMETRO, REVISION SISTEMA DE COMBUSTIBLE • COMPLETADO NIVELES DE FLUIDOS, REPARADO LUCES LATERALES • REVISION Y COMPLETACION FLUIDOS, MANTENIMENTO SOLENOIDES"
  },
  {
    "cuenta": "EE-H-C-015",
    "equipo": "Mantto herramientas y accesorios - Mantto",
    "tipo": "Mantenimiento y Adecuaciones",
    "totalHoras": 11,
    "registros": 3,
    "cantTrabajadores": 2,
    "trabajadores": [
      "CARLOS MATA",
      "MARCOS NARVAEZ"
    ],
    "principalesLabores": "MANTENIMIENTO Y REPARACIÓN DE BOMBAS HIDRAÚLICAS • REVISIÓN DE COMPRESORES EN EL TALLER DE ECO"
  },
  {
    "cuenta": "EEM-C-RM11",
    "equipo": "Semirremolque Lowboy - Placa: A55CM4S",
    "tipo": "Semirremolques",
    "totalHoras": 11,
    "registros": 4,
    "cantTrabajadores": 4,
    "trabajadores": [
      "JOSUÉ SOLORZANO",
      "HECTOR SANCHEZ",
      "JESÚS SANCHEZ",
      "ENDERSON VERA"
    ],
    "principalesLabores": "DESMONTAJE, REPARACION E INSTALACION DE CAUCHO POS#5 • GRADUACION DE FRENOS"
  },
  {
    "cuenta": "SS-E-C-023",
    "equipo": "Maquina ECM Horizontal 2",
    "tipo": "ECM",
    "totalHoras": 10,
    "registros": 3,
    "cantTrabajadores": 2,
    "trabajadores": [
      "ALEXANDER MÉRIDA",
      "MARCOS NARVAEZ"
    ],
    "principalesLabores": "REVISIÓN Y PRUEBA DE SENSORES DE LA MÁQUINA ECM 2 • REVISIÓN Y PRUEBA DE FUNCIONAMIENTO • PRUEBA DE FUNCIONAMIENTO"
  },
  {
    "cuenta": "EEE-C-MC06",
    "equipo": "Montacargas  Hyster H50XL - 2.5TN Serial: C177B02252L",
    "tipo": "Montacargas",
    "totalHoras": 10,
    "registros": 5,
    "cantTrabajadores": 3,
    "trabajadores": [
      "CALIX LOPEZ",
      "TOMAS GUEVARA",
      "FRANCISCO SISO"
    ],
    "principalesLabores": "DESMONTAJE CAUCHOS TRASEROS • ARMADO CAUCHOS TRASEROS 6.00-9 MACIZOS NUEVOS, INSTALACION DE 2 CAUCHOS 6.00-9 TRASEOS NUEVOS • DESMONTAJE CILINDRO DIRECCION"
  },
  {
    "cuenta": "GP15",
    "equipo": "GP15",
    "tipo": "Grúas Puente",
    "totalHoras": 10,
    "registros": 2,
    "cantTrabajadores": 1,
    "trabajadores": [
      "ALEXANDER MÉRIDA"
    ],
    "principalesLabores": "REPARACIÓN DE CONTROL DE MANDO ELÉCTRICO DE GRÚA PUENTE GP15 • REPARACIÓN DE CONTROL DE MANDO, CAMBIO DE PULSADORES"
  },
  {
    "cuenta": "EEI-C-GR24",
    "equipo": "Grua Liebherr LTM1100/1 - 100TN Serial W09555000VEL05279",
    "tipo": "Grúas",
    "totalHoras": 9,
    "registros": 3,
    "cantTrabajadores": 3,
    "trabajadores": [
      "FRANCISCO SISO",
      "JESÚS AREYAN",
      "JOSUÉ SOLORZANO"
    ],
    "principalesLabores": "REVISION DE FALLA ACELERACION MOTOR CAMION, CORRECCION DE PROBLEMA ACELERACION CAMION • ARMADO DE CAUCHO 385/90R25 USADO EN RIN"
  },
  {
    "cuenta": "TT-F-MS01",
    "equipo": "Maquina de Soldar Combustible - Serial: 5308782",
    "tipo": "Maquinas de soldar",
    "totalHoras": 9,
    "registros": 6,
    "cantTrabajadores": 3,
    "trabajadores": [
      "PEDRO SANTANA",
      "LUIS GUZMAN",
      "EDUARDO BASTARDO"
    ],
    "principalesLabores": "REVISION Y COMPLETACION DE FLUIDOS, REPARACION DE ALTERNADOR Y CABLEADO • REVISION Y COMPLETACION DE FLUIDOS"
  },
  {
    "cuenta": "EEM-C-CA10",
    "equipo": "Camion Pickman Chevrolet Kodiak - Placa: A21AM1U",
    "tipo": "Camiones",
    "totalHoras": 9,
    "registros": 3,
    "cantTrabajadores": 3,
    "trabajadores": [
      "JOSUÉ SOLORZANO",
      "PEDRO SANTANA",
      "LUIS GUZMAN"
    ],
    "principalesLabores": "DESMONTAJE DE CAUCHO POS#1, INSTALACION DE CAUCHO 295/80R22.5 POS#1 NUEVO"
  },
  {
    "cuenta": "EEM-C-CA01",
    "equipo": "Camion Plataforma Ford Cargo 815 - Placa:  A11AI4B",
    "tipo": "Camiones",
    "totalHoras": 8,
    "registros": 2,
    "cantTrabajadores": 2,
    "trabajadores": [
      "CALIX LOPEZ",
      "TOMAS GUEVARA"
    ],
    "principalesLabores": "REEMPLAZO ACEITE MOTOR, FILTRO ACEITE MOTOR, FILTRO GASOIL 1° 2°, CORREA UNICA 8PK1450 NUEVA, ENGRASE EQUIPO"
  },
  {
    "cuenta": "EEE-C-VH51",
    "equipo": "Pick Up Mazda BT-50 2WD - Placa A11BK0M",
    "tipo": "Vehículos",
    "totalHoras": 8,
    "registros": 2,
    "cantTrabajadores": 2,
    "trabajadores": [
      "OSWALDO LOPEZ",
      "DAVID GARATE"
    ],
    "principalesLabores": "REEMPLAZO DE BOMBIN INFERIOR DE EMBRAGUE NUEVO, SUMINISTRO FLUIDOS EMBRAGUE, ESPURGUE, ESPURGUE SISTEMA DE EMBRAGUE"
  },
  {
    "cuenta": "EEI-C-ML01",
    "equipo": "Manlift  Terex TB85",
    "tipo": "Equipos Especiales",
    "totalHoras": 8,
    "registros": 3,
    "cantTrabajadores": 2,
    "trabajadores": [
      "JESÚS AREYAN",
      "JULIO HERNADEZ"
    ],
    "principalesLabores": "REVISION SISTEMA ELECTRICO • REVISION CABLEADO ELECTRICO CESTA/TELESCOPICO"
  },
  {
    "cuenta": "EEI-C-GR01",
    "equipo": "Grua P&H R150 - 15TN Serial 37406",
    "tipo": "Grúas",
    "totalHoras": 8,
    "registros": 2,
    "cantTrabajadores": 2,
    "trabajadores": [
      "PEDRO SANTANA",
      "LUIS GUZMAN"
    ],
    "principalesLabores": "REEMPLAZO ACEITE MOTOR, FILTRO ACEITE MOTOR, LIMPIEZA FILTROS GASOIL"
  },
  {
    "cuenta": "EEE-C-TH01",
    "equipo": "Telehandler Genie GTH-4013 Serial: 17593",
    "tipo": "Equipos Especiales",
    "totalHoras": 6,
    "registros": 2,
    "cantTrabajadores": 2,
    "trabajadores": [
      "PABLO LEÓN",
      "LINO GARCÍA"
    ],
    "principalesLabores": "REEMPLAZO ACEITE MOTOR, FILTRO GASOIL, FABRICACION DE MANGUERA SAE100R7 1/2\" X 4.7 MTS NUEVA"
  },
  {
    "cuenta": "EEE-C-MC02",
    "equipo": "Montacargas  Caterpillar  DP50K - 5TN Serial: AT28B51445",
    "tipo": "Montacargas",
    "totalHoras": 6,
    "registros": 2,
    "cantTrabajadores": 2,
    "trabajadores": [
      "CALIX LOPEZ",
      "TOMAS GUEVARA"
    ],
    "principalesLabores": "REEMPLAZO ACEITE MOTOR, FILTRO ACEITE MOTOR, FILTRO GASOIL, ENGRASE EQUIPO, LAVADO EQUIPO"
  },
  {
    "cuenta": "TL04",
    "equipo": "TALADRO RADIAL SICMAT K284   4552-66",
    "tipo": "Otros",
    "totalHoras": 6,
    "registros": 2,
    "cantTrabajadores": 2,
    "trabajadores": [
      "ALEXANDER MÉRIDA",
      "MARCOS NARVAEZ"
    ],
    "principalesLabores": "REVISIÓN Y CORRECCIÓN DE CORTOCIRCUITO"
  },
  {
    "cuenta": "EEE-C-CA03",
    "equipo": "Camion Plataforma Ford Cargo 815 - Placa: A12AI1B",
    "tipo": "Camiones",
    "totalHoras": 6,
    "registros": 2,
    "cantTrabajadores": 2,
    "trabajadores": [
      "FRANCISCO SISO",
      "DAVID GARATE"
    ],
    "principalesLabores": "REEMPLAZO DE SEGUROS CAPOT DELANTEROS NUEVOS"
  },
  {
    "cuenta": "EEE-C-MN01",
    "equipo": "Motoniveladora John Deere 670G SERIAL: 1DW670GXHCC642696",
    "tipo": "Equipos Especiales",
    "totalHoras": 6,
    "registros": 2,
    "cantTrabajadores": 2,
    "trabajadores": [
      "JESÚS AREYAN",
      "JOSUÉ SOLORZANO"
    ],
    "principalesLabores": "REVISION DE FALLA SWITCH, DESMONTAJE Y REPARACION DE CAUCHO POS#2"
  },
  {
    "cuenta": "EEE-C-VH08",
    "equipo": "Pick up Mazda BT-50 2WD - Placa: A86BY0G",
    "tipo": "Vehículos",
    "totalHoras": 6,
    "registros": 2,
    "cantTrabajadores": 2,
    "trabajadores": [
      "JESÚS AREYAN",
      "OSWALDO LOPEZ"
    ],
    "principalesLabores": "AUXILIADO DE EQUIPO, DESMONTAJE TANQUE GASOLINA, REEMPLAZO PILA BOMBA GASOLINA NUEVA"
  },
  {
    "cuenta": "TT-F-C-023",
    "equipo": "SI03 Sierra de cinta continua TCM EAGLE 320",
    "tipo": "Sierras",
    "totalHoras": 5,
    "registros": 1,
    "cantTrabajadores": 1,
    "trabajadores": [
      "CARLOS MATA"
    ],
    "principalesLabores": "PRUEBA DE FUNCIONAMIENTO"
  },
  {
    "cuenta": "TT-F-C-014",
    "equipo": "CZ04 Cortadora Universal N° 4 / Verrina Serial: 12013",
    "tipo": "Cortadoras",
    "totalHoras": 5,
    "registros": 2,
    "cantTrabajadores": 2,
    "trabajadores": [
      "ALEXANDER MÉRIDA",
      "MARCOS NARVAEZ"
    ],
    "principalesLabores": "FALLA EN EL CIRCUITO DE CONTROL,"
  },
  {
    "cuenta": "EEI-C-GR19",
    "equipo": "Grua Terex RT 665 - 65TN Serial 13762",
    "tipo": "Grúas",
    "totalHoras": 5,
    "registros": 5,
    "cantTrabajadores": 3,
    "trabajadores": [
      "PEDRO SANTANA",
      "LUIS GUZMAN",
      "EDUARDO BASTARDO"
    ],
    "principalesLabores": "REVISION Y COMPLETACION FLUIDOS"
  },
  {
    "cuenta": "EEE-C-VH49",
    "equipo": "Pick Up Mazda BT-50 2WD - Placa A58AA3F",
    "tipo": "Vehículos",
    "totalHoras": 5,
    "registros": 2,
    "cantTrabajadores": 2,
    "trabajadores": [
      "EDUARDO BASTARDO",
      "JOSUÉ SOLORZANO"
    ],
    "principalesLabores": "REEMPLAZO BATERIA DUNCAN 24MR SER: 5695329 NUEVA, REEMPLAZO BUJIAS NUEVAS, CORREA ALTERNADOR NUEVA 17370, COMPLETADO NIVEL ACEITE"
  },
  {
    "cuenta": "TT-F-C-005",
    "equipo": "Prensa N° 2 Mebusa. Capacidad 400 Tn",
    "tipo": "Prensa",
    "totalHoras": 4,
    "registros": 1,
    "cantTrabajadores": 1,
    "trabajadores": [
      "CARLOS MATA"
    ],
    "principalesLabores": "CORRECCIÓN DE FUGA DE ACEITE"
  },
  {
    "cuenta": "TT-F-MS16",
    "equipo": "Maquina de Soldar Combustible – Serial: C1061000157",
    "tipo": "Maquinas de soldar",
    "totalHoras": 4,
    "registros": 2,
    "cantTrabajadores": 2,
    "trabajadores": [
      "FRANCISCO SISO",
      "JULIO HERNADEZ"
    ],
    "principalesLabores": "FABRICACION E INSTALACION DE TAPA SALIDA DE ESCAPE"
  },
  {
    "cuenta": "EEM-C-CH07",
    "equipo": "Chuto Mack Granite - Placa A20EC3G",
    "tipo": "Chutos",
    "totalHoras": 4,
    "registros": 2,
    "cantTrabajadores": 2,
    "trabajadores": [
      "JOSUÉ SOLORZANO",
      "JULIO HERNADEZ"
    ],
    "principalesLabores": "DESMONTAJE, REPARACION E INSTALACION CAUCHO POS#7"
  },
  {
    "cuenta": "EEE-C-MC10",
    "equipo": "Montacargas Heli H7- 7TN Serial: 130944182",
    "tipo": "Montacargas",
    "totalHoras": 4,
    "registros": 2,
    "cantTrabajadores": 2,
    "trabajadores": [
      "TOMAS GUEVARA",
      "CALIX LOPEZ"
    ],
    "principalesLabores": "DESMONTAJE DE FILTRO HIDRAULICO"
  },
  {
    "cuenta": "EEE-C-VH09",
    "equipo": "Pick up Mazda BT-50 2WD - Placa: A51BO4M",
    "tipo": "Vehículos",
    "totalHoras": 4,
    "registros": 2,
    "cantTrabajadores": 2,
    "trabajadores": [
      "JULIO HERNADEZ",
      "JOSUÉ SOLORZANO"
    ],
    "principalesLabores": "LAVADO EQUIPO"
  },
  {
    "cuenta": "EEE-C-RE01",
    "equipo": "Retroexcavadora Case 580M Serie 2 Turbo - Serial: N6C400672",
    "tipo": "Equipos Especiales",
    "totalHoras": 3,
    "registros": 1,
    "cantTrabajadores": 1,
    "trabajadores": [
      "JOSUÉ SOLORZANO"
    ],
    "principalesLabores": "REEMPLAZO DE CAUCHO 12-16.5 POS#1 NUEVO"
  },
  {
    "cuenta": "GP07",
    "equipo": "GP07",
    "tipo": "Grúas Puente",
    "totalHoras": 3,
    "registros": 1,
    "cantTrabajadores": 1,
    "trabajadores": [
      "ALEXANDER MÉRIDA"
    ],
    "principalesLabores": "CORRECCIÓN DE FALLA ELÉCTRICA DISPARO DE PROTECCIONES"
  },
  {
    "cuenta": "TT-F-MS07",
    "equipo": "Maquina de Soldar Combustible - Serial: U1081002856",
    "tipo": "Maquinas de soldar",
    "totalHoras": 3,
    "registros": 3,
    "cantTrabajadores": 3,
    "trabajadores": [
      "PEDRO SANTANA",
      "LUIS GUZMAN",
      "EDUARDO BASTARDO"
    ],
    "principalesLabores": "REVISION Y COMPLETACION DE FLUIDOS"
  },
  {
    "cuenta": "EEI-C-GR13",
    "equipo": "Grua Grove RT 75S - 50TN Serial 39750",
    "tipo": "Grúas",
    "totalHoras": 3,
    "registros": 1,
    "cantTrabajadores": 1,
    "trabajadores": [
      "JOSUÉ SOLORZANO"
    ],
    "principalesLabores": "ARMADO DE CAUCHO EN RIN 29.5R25 NUEVO"
  },
  {
    "cuenta": "GP02",
    "equipo": "GP02",
    "tipo": "Grúas Puente",
    "totalHoras": 3,
    "registros": 1,
    "cantTrabajadores": 1,
    "trabajadores": [
      "LISMIL ACOSTA"
    ],
    "principalesLabores": "CAMBIO DE GUAYA DAÑADA"
  },
  {
    "cuenta": "TT-G-C-034",
    "equipo": "Mantto y Adecuaciones Galpones -  Sandblasting",
    "tipo": "Mantenimiento y Adecuaciones",
    "totalHoras": 3,
    "registros": 1,
    "cantTrabajadores": 1,
    "trabajadores": [
      "MARCOS NARVAEZ"
    ],
    "principalesLabores": "ADECUACIÓN DE BAÑOS DEL AREA DE SANDBLASTING"
  },
  {
    "cuenta": "EEE-C-EX02",
    "equipo": "JUMBO CAT 374 DL",
    "tipo": "Equipos Especiales",
    "totalHoras": 3,
    "registros": 3,
    "cantTrabajadores": 3,
    "trabajadores": [
      "PEDRO SANTANA",
      "LUIS GUZMAN",
      "EDUARDO BASTARDO"
    ],
    "principalesLabores": "ENGRASE EQUIPO, REVISION Y COMPLETACION FLUIDOS"
  },
  {
    "cuenta": "TT-F-CO04",
    "equipo": "Compresor Sullair 225H 225 CFM Serial 200705170121",
    "tipo": "Compresores",
    "totalHoras": 3,
    "registros": 3,
    "cantTrabajadores": 3,
    "trabajadores": [
      "PEDRO SANTANA",
      "LUIS GUZMAN",
      "EDUARDO BASTARDO"
    ],
    "principalesLabores": "REVISION Y COMPLETACION FLUIDOS"
  },
  {
    "cuenta": "TT-F-CO05",
    "equipo": "Compresor Sullair 185 45,5 KW 185 CFM Serial 201005120100",
    "tipo": "Compresores",
    "totalHoras": 3,
    "registros": 3,
    "cantTrabajadores": 3,
    "trabajadores": [
      "PEDRO SANTANA",
      "LUIS GUZMAN",
      "EDUARDO BASTARDO"
    ],
    "principalesLabores": "REVISION Y COMPLETACION DE FLUIDOS"
  },
  {
    "cuenta": "TT-F-MS06",
    "equipo": "Maquina de Soldar Combustible - Serial: U1081002849",
    "tipo": "Maquinas de soldar",
    "totalHoras": 3,
    "registros": 3,
    "cantTrabajadores": 3,
    "trabajadores": [
      "PEDRO SANTANA",
      "LUIS GUZMAN",
      "EDUARDO BASTARDO"
    ],
    "principalesLabores": "REVISION Y COMPLETACION DE FLUIDOS"
  },
  {
    "cuenta": "EEM-C-CA07",
    "equipo": "Camion Plataforma Iveco Eurocargo 170E22 - Placa: A73BD2G",
    "tipo": "Camiones",
    "totalHoras": 2,
    "registros": 1,
    "cantTrabajadores": 1,
    "trabajadores": [
      "JOSUÉ SOLORZANO"
    ],
    "principalesLabores": "DESMONTAJE, REPARACION E INSTALACION DE CAUCHO POS#6"
  },
  {
    "cuenta": "GP19",
    "equipo": "GP19",
    "tipo": "Grúas Puente",
    "totalHoras": 2,
    "registros": 1,
    "cantTrabajadores": 1,
    "trabajadores": [
      "ALEXANDER MÉRIDA"
    ],
    "principalesLabores": "REVISIÓN DE GRÚA PUENTE CABLE VIAJERO DESPRENDIDO SE NORMALIZO, SE REARMO PROTECCIONES"
  },
  {
    "cuenta": "GP18",
    "equipo": "GP18",
    "tipo": "Grúas Puente",
    "totalHoras": 2,
    "registros": 1,
    "cantTrabajadores": 1,
    "trabajadores": [
      "ALEXANDER MÉRIDA"
    ],
    "principalesLabores": "REVISIÓN Y REARMADO DE PROTECCIONES"
  },
  {
    "cuenta": "GP01",
    "equipo": "GP01",
    "tipo": "Grúas Puente",
    "totalHoras": 2,
    "registros": 1,
    "cantTrabajadores": 1,
    "trabajadores": [
      "ALEXANDER MÉRIDA"
    ],
    "principalesLabores": "REVISIÓN Y PRUEBA"
  },
  {
    "cuenta": "EES-C-VH36",
    "equipo": "Pick Up Mitsubishi  L200 Serial  MMBNL45K6XH052939",
    "tipo": "Vehículos",
    "totalHoras": 2,
    "registros": 1,
    "cantTrabajadores": 1,
    "trabajadores": [
      "JULIO HERNADEZ"
    ],
    "principalesLabores": "LAVADO DE EQUIPO"
  },
  {
    "cuenta": "EEE-C-VH39",
    "equipo": "Pick Up Mazda BT-50 2WD - Placa: A21CV6A",
    "tipo": "Vehículos",
    "totalHoras": 2,
    "registros": 1,
    "cantTrabajadores": 1,
    "trabajadores": [
      "JOSUÉ SOLORZANO"
    ],
    "principalesLabores": "DESMONTAJE, REPARACION E INSTALACION DE CAUCHO POS#4"
  },
  {
    "cuenta": "SS-H-C-030",
    "equipo": "TO03 Torno Grande zerbt",
    "tipo": "Torno",
    "totalHoras": 2,
    "registros": 1,
    "cantTrabajadores": 1,
    "trabajadores": [
      "ALEXANDER MÉRIDA"
    ],
    "principalesLabores": "CORRECCIÓN DE FALLA ELÉCTRICA, PROTECCIONES DISPARADAS"
  },
  {
    "cuenta": "EEE-C-VH43",
    "equipo": "Pick Up Mazda BT-50 2WD 2.2 - Placa: A32AL4O",
    "tipo": "Vehículos",
    "totalHoras": 2,
    "registros": 1,
    "cantTrabajadores": 1,
    "trabajadores": [
      "JULIO HERNADEZ"
    ],
    "principalesLabores": "LAVADO DE EQUIPO, ASPIRADO DE EQUIPO"
  },
  {
    "cuenta": "GP12",
    "equipo": "GP12",
    "tipo": "Grúas Puente",
    "totalHoras": 2,
    "registros": 1,
    "cantTrabajadores": 1,
    "trabajadores": [
      "MARCOS NARVAEZ"
    ],
    "principalesLabores": "CAMBIO DE PULSADORES DEL CONTROL DE MANDO"
  },
  {
    "cuenta": "TT-F-MS08",
    "equipo": "Maquina de Soldar Combustible - Serial: U1120600787",
    "tipo": "Maquinas de soldar",
    "totalHoras": 1,
    "registros": 1,
    "cantTrabajadores": 1,
    "trabajadores": [
      "ALEXANDER MÉRIDA"
    ],
    "principalesLabores": "PRUEBA DE FUNCIONAMIENTO EN EMINCA,"
  },
  {
    "cuenta": "TT-F-MS09",
    "equipo": "Maquina de Soldar Combustible - Serial: U1120511370",
    "tipo": "Maquinas de soldar",
    "totalHoras": 1,
    "registros": 1,
    "cantTrabajadores": 1,
    "trabajadores": [
      "ALEXANDER MÉRIDA"
    ],
    "principalesLabores": "PRUEBA DE FUNCIONAMIENTO EN EMINCA, PRUEBA DE SOLDADURA"
  }
];

export const HORAS_HOMBRE_SIN_CUENTA_SEPTIEMBRE: HorasHombrePendienteConciliacion[] = [
  {
    "id": "MOD-SEP-PEND-46",
    "fecha": "2026-09-01",
    "trabajador": "ALEXANDER MÉRIDA",
    "tipoEquipo": "Equipos Varios",
    "equipoReferencia": "Sin equipo asignado",
    "motivoLabor": "MANTENIMIENTO Y REPARACIÓN DE MÁQUINAS DE SOLDAR ELÉCTRICAS",
    "horasTrabajadas": 7,
    "paqueteSemanal": 130,
    "estadoConciliacion": "PENDIENTE_CONCILIAR"
  },
  {
    "id": "MOD-SEP-PEND-84",
    "fecha": "2026-09-02",
    "trabajador": "FRANCISCO SISO",
    "tipoEquipo": "Equipos Externos",
    "equipoReferencia": "Sin equipo asignado",
    "motivoLabor": "FABRICACION DE 2 MANGUERAS HIDRAULICAS BOCA GRANDE",
    "horasTrabajadas": 2,
    "paqueteSemanal": 130,
    "estadoConciliacion": "PENDIENTE_CONCILIAR"
  },
  {
    "id": "MOD-SEP-PEND-94",
    "fecha": "2026-09-02",
    "trabajador": "MARCOS NARVAEZ",
    "tipoEquipo": "Equipos Varios",
    "equipoReferencia": "Sin equipo asignado",
    "motivoLabor": "REVISIÓN DE FUNTE DE PODER DE 24 VOLTIOS",
    "horasTrabajadas": 2,
    "paqueteSemanal": 130,
    "estadoConciliacion": "PENDIENTE_CONCILIAR"
  },
  {
    "id": "MOD-SEP-PEND-95",
    "fecha": "2026-09-02",
    "trabajador": "ALEXANDER MÉRIDA",
    "tipoEquipo": "Equipos Varios",
    "equipoReferencia": "Sin equipo asignado",
    "motivoLabor": "MANTENIMIENTO Y REPARACIÓN DE MÁQUINAS DE SOLDAR ELÉCTRICAS",
    "horasTrabajadas": 4,
    "paqueteSemanal": 130,
    "estadoConciliacion": "PENDIENTE_CONCILIAR"
  },
  {
    "id": "MOD-SEP-PEND-113",
    "fecha": "2026-09-03",
    "trabajador": "OSWALDO LOPEZ",
    "tipoEquipo": "Equipos Externos",
    "equipoReferencia": "Sin equipo asignado",
    "motivoLabor": "REPARACION TREN DELANTERO, BUJES MESETAS SUPERIORES, BUJES MESETAS INFERIORES, MUÑONES DE MESETAS SUPERIORES, MUÑONES MESETAS INFERIORES, TERMINALES Y ROTULAS DIRECCION NUEVOS, GUARDA POLVO DE ROTUTAS, GEMELOS NUEVOS, GOMAS INTERNAS Y EXTERNAS TRIPOIDES",
    "horasTrabajadas": 10,
    "paqueteSemanal": 130,
    "estadoConciliacion": "PENDIENTE_CONCILIAR"
  },
  {
    "id": "MOD-SEP-PEND-114",
    "fecha": "2026-09-03",
    "trabajador": "DAVID GARATE",
    "tipoEquipo": "Equipos Externos",
    "equipoReferencia": "Sin equipo asignado",
    "motivoLabor": "REPARACION TREN DELANTERO, BUJES MESETAS SUPERIORES, BUJES MESETAS INFERIORES, MUÑONES DE MESETAS SUPERIORES, MUÑONES MESETAS INFERIORES, TERMINALES Y ROTULAS DIRECCION NUEVOS, GUARDA POLVO DE ROTUTAS, GEMELOS NUEVOS, GOMAS INTERNAS Y EXTERNAS TRIPOIDES",
    "horasTrabajadas": 10,
    "paqueteSemanal": 130,
    "estadoConciliacion": "PENDIENTE_CONCILIAR"
  },
  {
    "id": "MOD-SEP-PEND-115",
    "fecha": "2026-09-03",
    "trabajador": "JULIO HERNADEZ",
    "tipoEquipo": "Equipos Externos",
    "equipoReferencia": "Sin equipo asignado",
    "motivoLabor": "REPARACION TREN DELANTERO, BUJES MESETAS SUPERIORES, BUJES MESETAS INFERIORES, MUÑONES DE MESETAS SUPERIORES, MUÑONES MESETAS INFERIORES, TERMINALES Y ROTULAS DIRECCION NUEVOS, GUARDA POLVO DE ROTUTAS, GEMELOS NUEVOS, GOMAS INTERNAS Y EXTERNAS TRIPOIDES",
    "horasTrabajadas": 10,
    "paqueteSemanal": 130,
    "estadoConciliacion": "PENDIENTE_CONCILIAR"
  },
  {
    "id": "MOD-SEP-PEND-162",
    "fecha": "2026-09-04",
    "trabajador": "JULIO HERNADEZ",
    "tipoEquipo": "GASOLINA",
    "equipoReferencia": "Sin equipo asignado",
    "motivoLabor": "SURTIDO DE GASOLINA E/S SALTO ANGEL",
    "horasTrabajadas": 2,
    "paqueteSemanal": 130,
    "estadoConciliacion": "PENDIENTE_CONCILIAR"
  },
  {
    "id": "MOD-SEP-PEND-163",
    "fecha": "2026-09-04",
    "trabajador": "JOSUÉ SOLORZANO",
    "tipoEquipo": "GASOLINA",
    "equipoReferencia": "Sin equipo asignado",
    "motivoLabor": "SURTIDO DE GASOLINA E/S SALTO ANGEL",
    "horasTrabajadas": 2,
    "paqueteSemanal": 130,
    "estadoConciliacion": "PENDIENTE_CONCILIAR"
  },
  {
    "id": "MOD-SEP-PEND-192",
    "fecha": "2026-09-04",
    "trabajador": "PEDRO SANTANA",
    "tipoEquipo": "Equipos Externos",
    "equipoReferencia": "Sin equipo asignado",
    "motivoLabor": "DESMONTAJE DE MANGUERA HIDRAULICA DIRECCION, FABRICACION E INSTALACION DE MANGUERA HIDRAULICA DIRECCION AVEO MAILITH",
    "horasTrabajadas": 2,
    "paqueteSemanal": 130,
    "estadoConciliacion": "PENDIENTE_CONCILIAR"
  },
  {
    "id": "MOD-SEP-PEND-193",
    "fecha": "2026-09-04",
    "trabajador": "LUIS GUZMAN",
    "tipoEquipo": "Equipos Externos",
    "equipoReferencia": "Sin equipo asignado",
    "motivoLabor": "DESMONTAJE DE MANGUERA HIDRAULICA DIRECCION, FABRICACION E INSTALACION DE MANGUERA HIDRAULICA DIRECCION AVEO MAILITH",
    "horasTrabajadas": 2,
    "paqueteSemanal": 130,
    "estadoConciliacion": "PENDIENTE_CONCILIAR"
  },
  {
    "id": "MOD-SEP-PEND-194",
    "fecha": "2026-09-04",
    "trabajador": "EDUARDO BASTARDO",
    "tipoEquipo": "Equipos Externos",
    "equipoReferencia": "Sin equipo asignado",
    "motivoLabor": "DESMONTAJE DE MANGUERA HIDRAULICA DIRECCION, FABRICACION E INSTALACION DE MANGUERA HIDRAULICA DIRECCION AVEO MAILITH",
    "horasTrabajadas": 2,
    "paqueteSemanal": 130,
    "estadoConciliacion": "PENDIENTE_CONCILIAR"
  },
  {
    "id": "MOD-SEP-PEND-208",
    "fecha": "2026-09-04",
    "trabajador": "ALEXANDER MÉRIDA",
    "tipoEquipo": "Equipos Varios",
    "equipoReferencia": "Sin equipo asignado",
    "motivoLabor": "MANTENIMIENTO Y REPARACIÓN DE MÁQUINAS DE SOLDAR ELÉCTRICAS",
    "horasTrabajadas": 8,
    "paqueteSemanal": 130,
    "estadoConciliacion": "PENDIENTE_CONCILIAR"
  },
  {
    "id": "MOD-SEP-PEND-229",
    "fecha": "2026-09-05",
    "trabajador": "OSWALDO LOPEZ",
    "tipoEquipo": "Equipos Varios",
    "equipoReferencia": "Sin equipo asignado",
    "motivoLabor": "FABRICACION DE MANGUERA HIDRAULICA NUEVA, INSTALACION DE MANGUERA, SUMINISTRO ACEITE DIRECCION, PRUEBAS DE SISTEMA DIRECCION AVEO MAILITH",
    "horasTrabajadas": 7,
    "paqueteSemanal": 130,
    "estadoConciliacion": "PENDIENTE_CONCILIAR"
  },
  {
    "id": "MOD-SEP-PEND-230",
    "fecha": "2026-09-05",
    "trabajador": "DAVID GARATE",
    "tipoEquipo": "Equipos Varios",
    "equipoReferencia": "Sin equipo asignado",
    "motivoLabor": "FABRICACION DE MANGUERA HIDRAULICA NUEVA, INSTALACION DE MANGUERA, SUMINISTRO ACEITE DIRECCION, PRUEBAS DE SISTEMA DIRECCION AVEO MAILITH",
    "horasTrabajadas": 7,
    "paqueteSemanal": 130,
    "estadoConciliacion": "PENDIENTE_CONCILIAR"
  },
  {
    "id": "MOD-SEP-PEND-256",
    "fecha": "2026-09-07",
    "trabajador": "JULIO HERNADEZ",
    "tipoEquipo": "GASOLINA",
    "equipoReferencia": "Sin equipo asignado",
    "motivoLabor": "SURTIDO GASOLINA E/S SALTO ANGEL",
    "horasTrabajadas": 2,
    "paqueteSemanal": 130,
    "estadoConciliacion": "PENDIENTE_CONCILIAR"
  },
  {
    "id": "MOD-SEP-PEND-295",
    "fecha": "2026-09-07",
    "trabajador": "MARCOS NARVAEZ",
    "tipoEquipo": "Equipos Varios",
    "equipoReferencia": "Sin equipo asignado",
    "motivoLabor": "REVISIÓN Y REPARACIÓN DE MAQUINA DE SOLDAR",
    "horasTrabajadas": 2,
    "paqueteSemanal": 130,
    "estadoConciliacion": "PENDIENTE_CONCILIAR"
  },
  {
    "id": "MOD-SEP-PEND-354",
    "fecha": "2026-09-08",
    "trabajador": "CARLOS MATA",
    "tipoEquipo": "Equipos Varios",
    "equipoReferencia": "Sin equipo asignado",
    "motivoLabor": "REPARACIÓN DE PLOGAS",
    "horasTrabajadas": 5,
    "paqueteSemanal": 130,
    "estadoConciliacion": "PENDIENTE_CONCILIAR"
  },
  {
    "id": "MOD-SEP-PEND-364",
    "fecha": "2026-09-09",
    "trabajador": "JOSUÉ SOLORZANO",
    "tipoEquipo": "GASOLINA",
    "equipoReferencia": "Sin equipo asignado",
    "motivoLabor": "SURTIDO GASOLINA E/S SALTO ANGEL",
    "horasTrabajadas": 2,
    "paqueteSemanal": 130,
    "estadoConciliacion": "PENDIENTE_CONCILIAR"
  },
  {
    "id": "MOD-SEP-PEND-473",
    "fecha": "2026-09-10",
    "trabajador": "MARCOS NARVAEZ",
    "tipoEquipo": "Equipos Varios",
    "equipoReferencia": "Sin equipo asignado",
    "motivoLabor": "MANTENIMIENTO Y REPARACIÓN DE MÁQUINA DE SOLDAR DC600",
    "horasTrabajadas": 3,
    "paqueteSemanal": 130,
    "estadoConciliacion": "PENDIENTE_CONCILIAR"
  }
];

export const HORAS_HOMBRE_POR_FAMILIA_SEPTIEMBRE: ResumenMODFamilia[] = [
  {
    "tipo": "Grúas",
    "totalHoras": 442,
    "registros": 83
  },
  {
    "tipo": "Mantenimiento y Adecuaciones",
    "totalHoras": 370,
    "registros": 59
  },
  {
    "tipo": "Vehículos",
    "totalHoras": 270,
    "registros": 53
  },
  {
    "tipo": "Camiones",
    "totalHoras": 260,
    "registros": 62
  },
  {
    "tipo": "Autobuses",
    "totalHoras": 226,
    "registros": 37
  },
  {
    "tipo": "Equipos Especiales",
    "totalHoras": 189,
    "registros": 52
  },
  {
    "tipo": "Chutos",
    "totalHoras": 96,
    "registros": 19
  },
  {
    "tipo": "Montacargas",
    "totalHoras": 86,
    "registros": 26
  },
  {
    "tipo": "Torno",
    "totalHoras": 63,
    "registros": 10
  },
  {
    "tipo": "Equipos Varios",
    "totalHoras": 45,
    "registros": 9
  },
  {
    "tipo": "Equipos Externos",
    "totalHoras": 38,
    "registros": 7
  },
  {
    "tipo": "Otros",
    "totalHoras": 33,
    "registros": 11
  },
  {
    "tipo": "Grúas Puente",
    "totalHoras": 24,
    "registros": 8
  },
  {
    "tipo": "Maquinas de soldar",
    "totalHoras": 21,
    "registros": 16
  },
  {
    "tipo": "Semirremolques",
    "totalHoras": 11,
    "registros": 4
  },
  {
    "tipo": "ECM",
    "totalHoras": 10,
    "registros": 3
  },
  {
    "tipo": "GASOLINA",
    "totalHoras": 8,
    "registros": 4
  },
  {
    "tipo": "Compresores",
    "totalHoras": 6,
    "registros": 6
  },
  {
    "tipo": "Sierras",
    "totalHoras": 5,
    "registros": 1
  },
  {
    "tipo": "Cortadoras",
    "totalHoras": 5,
    "registros": 2
  },
  {
    "tipo": "Prensa",
    "totalHoras": 4,
    "registros": 1
  }
];

export const HORAS_HOMBRE_POR_TRABAJADOR_SEPTIEMBRE: ResumenMODTrabajador[] = [
  {
    "trabajador": "CALIX LOPEZ",
    "totalHoras": 85,
    "registros": 20,
    "paquete": 130
  },
  {
    "trabajador": "TOMAS GUEVARA",
    "totalHoras": 85,
    "registros": 20,
    "paquete": 130
  },
  {
    "trabajador": "FRANCISCO SISO",
    "totalHoras": 85,
    "registros": 20,
    "paquete": 130
  },
  {
    "trabajador": "OSWALDO LOPEZ",
    "totalHoras": 85,
    "registros": 12,
    "paquete": 130
  },
  {
    "trabajador": "DAVID GARATE",
    "totalHoras": 85,
    "registros": 14,
    "paquete": 130
  },
  {
    "trabajador": "ENDERSON VERA",
    "totalHoras": 85,
    "registros": 14,
    "paquete": 130
  },
  {
    "trabajador": "PABLO LEÓN",
    "totalHoras": 85,
    "registros": 21,
    "paquete": 130
  },
  {
    "trabajador": "LINO GARCÍA",
    "totalHoras": 85,
    "registros": 21,
    "paquete": 130
  },
  {
    "trabajador": "JULIO HERNADEZ",
    "totalHoras": 85,
    "registros": 22,
    "paquete": 130
  },
  {
    "trabajador": "JESÚS AREYAN",
    "totalHoras": 85,
    "registros": 20,
    "paquete": 130
  },
  {
    "trabajador": "JOSUÉ SOLORZANO",
    "totalHoras": 85,
    "registros": 25,
    "paquete": 130
  },
  {
    "trabajador": "ARQUIMEDES GUERRA",
    "totalHoras": 85,
    "registros": 13,
    "paquete": 130
  },
  {
    "trabajador": "RICARDO GONZALEZ",
    "totalHoras": 85,
    "registros": 13,
    "paquete": 130
  },
  {
    "trabajador": "OMAR MARÍN",
    "totalHoras": 85,
    "registros": 9,
    "paquete": 130
  },
  {
    "trabajador": "MARÍA FERMÍN",
    "totalHoras": 85,
    "registros": 9,
    "paquete": 112
  },
  {
    "trabajador": "CARLOS MATA",
    "totalHoras": 85,
    "registros": 14,
    "paquete": 130
  },
  {
    "trabajador": "LUIS GUZMAN",
    "totalHoras": 79,
    "registros": 28,
    "paquete": 130
  },
  {
    "trabajador": "BIRMANIA GAZCÓN",
    "totalHoras": 78,
    "registros": 8,
    "paquete": 112
  },
  {
    "trabajador": "ANGELA NUÑEZ",
    "totalHoras": 78,
    "registros": 8,
    "paquete": 112
  },
  {
    "trabajador": "LISMIL ACOSTA",
    "totalHoras": 78,
    "registros": 22,
    "paquete": 130
  },
  {
    "trabajador": "PEDRO SANTANA",
    "totalHoras": 75,
    "registros": 28,
    "paquete": 130
  },
  {
    "trabajador": "LUIS FERNANDO",
    "totalHoras": 75,
    "registros": 12,
    "paquete": 130
  },
  {
    "trabajador": "EDUARDO BASTARDO",
    "totalHoras": 75,
    "registros": 27,
    "paquete": 130
  },
  {
    "trabajador": "MARCOS NARVAEZ",
    "totalHoras": 74,
    "registros": 25,
    "paquete": 130
  },
  {
    "trabajador": "HECTOR SANCHEZ",
    "totalHoras": 72,
    "registros": 13,
    "paquete": 130
  },
  {
    "trabajador": "JESÚS SANCHEZ",
    "totalHoras": 72,
    "registros": 13,
    "paquete": 130
  },
  {
    "trabajador": "ALEXANDER MÉRIDA",
    "totalHoras": 58,
    "registros": 16,
    "paquete": 130
  },
  {
    "trabajador": "PEDRO AVENDAÑO",
    "totalHoras": 30,
    "registros": 4,
    "paquete": 130
  },
  {
    "trabajador": "LUIZ GÚZMAN",
    "totalHoras": 6,
    "registros": 1,
    "paquete": 130
  },
  {
    "trabajador": "REPARACION REALIZADA POR EXTERNO",
    "totalHoras": 2,
    "registros": 1,
    "paquete": 130
  }
];
