import { PROYECTOS_CATEGORIAS_ANUAL_2026, PROYECTOS_CATEGORIAS_AGOSTO_2026 } from './src/data/mockProyectosCategoriasPPT.js';
import { 
  TABLA_PPT_DISTRIBUCION_2026, 
  CUENTAS_AUXILIARES_EXACTAS_AGOSTO_2026, 
  TOTALES_MESES_PPT,
  CATEGORIAS_MATERIALES_EXCEL_OFICIAL,
  OFICIAL_MOD_CUENTAS_AGOSTO_2026,
  DETALLE_NOMINA_AGOSTO_2026
} from './src/data/mockCostosTimaca.js';

export function testRefinedMockCostos() {
  const salidas = [];
  let idCounter = 1;

  const CATALOGO_SIP_MATERIALES = [
    { desc: 'Plancha Acero Estructural ASTM A36 12mm x 2400 x 6000mm', subcat: 'Chapas / Planchas', um: 'plancha', pUnit: 1420.00, resp: 'Almacén Central SIP - Roberto Benítez' },
    { desc: 'Electrodo Soldadura Lincoln Excalibur E7018 1/8" (Caja 20kg)', subcat: 'Consumibles de Soldadura', um: 'caja', pUnit: 92.00, resp: 'Almacén Central SIP - Pedro Infante' },
    { desc: 'Viga Estructural IPE 300 x 12 metros Acero Estructural', subcat: 'Perfiles / Estructura', um: 'barra', pUnit: 890.00, resp: 'Almacén de Perfiles SIP' },
    { desc: 'Rodamiento de rodillos esféricos SKF 22220 EK/C3', subcat: 'Repuestos Mecánicos', um: 'und', pUnit: 640.00, resp: 'Almacén de Repuestos Mecánicos SIP' },
    { desc: 'Pintura Epóxica Poliamida Anticorrosiva Gris (Cuñete 5 Gal)', subcat: 'Pinturas y Recubrimientos', um: 'cuñete', pUnit: 185.00, resp: 'Almacén Central SIP' },
    { desc: 'Tubería Acero Carbón Sin Costura ASTM A106 Gr. B 6" Sch 40', subcat: 'Tuberías y Accesorios', um: 'tubo', pUnit: 430.00, resp: 'Almacén de Tuberías SIP' },
    { desc: 'Pernos Hexagonales ASTM A325 3/4" x 3" con tuerca 2H', subcat: 'Pernos / Fijaciones', um: 'und', pUnit: 3.75, resp: 'Almacén de Pernos SIP' },
    { desc: 'Plancha Antidesgaste Hardox 400 1/2" x 1500 x 3000mm', subcat: 'Chapas / Planchas', um: 'plancha', pUnit: 1980.00, resp: 'Almacén Central SIP' }
  ];

  const CATALOGO_SERVICIOS = [
    { desc: 'Servicio de Supervisión Técnica e Inspección Residente de Obra', um: 'semana', pUnit: 850.00, resp: 'Gerencia de Operaciones', subcat: 'Supervisión e Inspección Técnica' },
    { desc: 'Servicio de Ensayo No Destructivo Radiografía Industrial (Gammagrafía)', um: 'servicio', pUnit: 1920.00, resp: 'QA/QC Inspección - Elena Salazar', subcat: 'Ensayos No Destructivos (END)' },
    { desc: 'Servicio Especializado de Recarga de Gases Industriales: Gas Argón 99.99% TIG', um: 'cilindro', pUnit: 65.00, resp: 'Almacén Central SIP', subcat: 'Gases Industriales / Recargas' },
    { desc: 'Servicio de Torno Pesado Schiess Maquinado de Corona Dentada', um: 'servicio', pUnit: 4850.00, resp: 'Jefatura de Taller - Javier Narváez', subcat: 'Maquinado Externo' },
    { desc: 'Servicio de Transporte Pesado Cama Baja Lowboy Planta-FMO', um: 'viaje', pUnit: 1250.00, resp: 'Logística & Fletes TIMACA', subcat: 'Transporte / Flete' },
    { desc: 'Servicio de Arenado Sandblasting SSPC-SP10 Estructura Metálica', um: 'lote', pUnit: 2100.00, resp: 'Taller de Pintura TIMACA', subcat: 'Tratamiento Superficial' },
    { desc: 'Calificación de Procedimiento de Soldadura WPS/PQR según ASME IX', um: 'informe', pUnit: 1450.00, resp: 'QA/QC Inspección - Elena Salazar', subcat: 'Supervisión e Inspección Técnica' }
  ];

  const CATALOGO_HORAS_MAQUINA = [
    { desc: 'Operación Torno Vertical Schiess (Maquinado de Pista de Rodadura)', um: 'horas', pUnit: 180.00, resp: 'Coordinación Horas Máquina - Andrés Morales' },
    { desc: 'Servicio de Grúa Telescópica Liebherr 80 Ton en Izamiento de Tolva', um: 'horas', pUnit: 240.00, resp: 'Coordinación Horas Máquina - Andrés Morales' },
    { desc: 'Operación Mandrinadora CNC Horas Operativas de Mecanizado', um: 'horas', pUnit: 160.00, resp: 'Jefatura de Taller - Javier Narváez' },
    { desc: 'Prensa Hidráulica 500T Conformado de Planchas y Virolas', um: 'horas', pUnit: 135.00, resp: 'Jefatura de Taller - Javier Narváez' }
  ];

  const CATALOGO_INDIRECTOS = [
    { desc: 'Consumibles de Taller: Discos de Corte Tyrolit 7" x 1/8" (Paq. 50 und)', um: 'paquete', pUnit: 210.00, resp: 'Almacén de Consumibles SIP', subcat: 'Consumibles de Taller' },
    { desc: 'Dotación EPP Cuadrillas de Obra (Caretas, Guantes de Carnaza, Botas)', um: 'kit', pUnit: 120.00, resp: 'Seguridad Industrial - Nelson Guédez', subcat: 'Seguridad Industrial (SIAHO)' },
    { desc: 'Materiales Auxiliares de Montaje: Lijas, Cepillos Circulares y Solventes', um: 'lote', pUnit: 175.00, resp: 'Almacén Central SIP', subcat: 'Consumibles de Taller' },
    { desc: 'Soporte Logístico y Mantenimiento Menor de Instalaciones de Campamento', um: 'lote', pUnit: 420.00, resp: 'Servicios Generales TIMACA', subcat: 'Facilidades de Obra' },
    { desc: 'Materiales Auxiliares y Consumibles Operativos de Taller', um: 'lote', pUnit: 140.00, resp: 'Almacén Central SIP', subcat: 'Consumibles Operativos' }
  ];

  // Helper function to push a salida with STRICT Cantidad * Precio Unitario === Monto Total
  function pushSalida(data) {
    // Round to 2 decimals
    const cant = typeof data.cantidad === 'number' ? Math.round(data.cantidad * 100) / 100 : 1;
    let pUnit = typeof data.montoUnitario === 'number' ? Math.round(data.montoUnitario * 100) / 100 : data.montoTotal;
    let total = typeof data.montoTotal === 'number' ? Math.round(data.montoTotal * 100) / 100 : Math.round(cant * pUnit * 100) / 100;
    
    // Invariant enforcement: total must equal cant * pUnit
    // If not, adjust pUnit = Math.round((total / cant) * 100) / 100, and if diff, total = cant * pUnit
    if (cant > 0) {
      const calcTotal = Math.round(cant * pUnit * 100) / 100;
      if (Math.abs(calcTotal - total) > 0.001) {
        pUnit = Math.round((total / cant) * 100) / 100;
        total = Math.round(cant * pUnit * 100) / 100;
      }
    }

    salidas.push({
      ...data,
      cantidad: cant,
      montoUnitario: pUnit,
      montoTotal: total
    });
  }

  return { salidas, pushSalida };
}

console.log('Test template ready.');
