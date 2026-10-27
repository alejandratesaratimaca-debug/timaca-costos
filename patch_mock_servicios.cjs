const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/data/mockDesgloseCategorias.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Replace SERVICIOS_PELLAS_1_EXACTO block
const oldPellasRegex = /export const SERVICIOS_PELLAS_1_EXACTO: FilaDesgloseMensual\[\] = \[[\s\S]*?\];/;
const newPellasContent = `export const SERVICIOS_PELLAS_1_EXACTO: FilaDesgloseMensual[] = [
  { concepto: 'Alquiler de baños portátiles y sanitarios', abr: 0, may: 4800, jun: 18360, jul: 4900, ago: 4900, sep: 8400, total: 41360 },
  { concepto: 'Examenes medicos', abr: 0, may: 75, jun: 975, jul: 1709, ago: 1162, sep: 383, total: 4304 },
  { concepto: 'Fabricacion de calcomanias', abr: 0, may: 0, jun: 0, jul: 229, ago: 0, sep: 0, total: 229 },
  { concepto: 'Fabricacion de puertas', abr: 0, may: 0, jun: 5870, jul: 0, ago: 0, sep: 0, total: 5870 },
  { concepto: 'Gastos viajes / viáticos nacionales', abr: 0, may: 0, jun: 0, jul: 127, ago: 0, sep: 0, total: 127 },
  { concepto: 'Honorarios profesionales', abr: 0, may: 0, jun: 50, jul: 0, ago: 0, sep: 0, total: 50 },
  { concepto: 'Mantenimiento de equipos externos', abr: 0, may: 0, jun: 0, jul: 0, ago: 60, sep: 6, total: 66 },
  { concepto: 'Serv. asociados a evento corporativo', abr: 0, may: 35, jun: 0, jul: 0, ago: 0, sep: 0, total: 35 },
  { concepto: 'Servicio ambiental de arborizacion', abr: 0, may: 0, jun: 0, jul: 0, ago: 120, sep: 0, total: 120 },
  { concepto: 'Servicio de camion cisterna', abr: 0, may: 0, jun: 100, jul: 400, ago: 300, sep: 350, total: 1150 },
  { concepto: 'Servicio de comida', abr: 48, may: 195, jun: 26, jul: 104, ago: 825, sep: 847, total: 2045 },
  { concepto: 'Servicio de cristaleria', abr: 0, may: 0, jun: 0, jul: 1755, ago: 0, sep: 0, total: 1755 },
  { concepto: 'Servicio de fumigacion', abr: 0, may: 0, jun: 0, jul: 600, ago: 0, sep: 0, total: 600 },
  { concepto: 'Servicio de inspecciones tecnicas', abr: 0, may: 0, jun: 0, jul: 1500, ago: 0, sep: 0, total: 1500 },
  { concepto: 'Servicio de taxi', abr: 0, may: 0, jun: 0, jul: 34, ago: 0, sep: 0, total: 34 },
  { concepto: 'Servicio mantenimiento de extintor', abr: 0, may: 0, jun: 0, jul: 0, ago: 448, sep: 0, total: 448 },
  { concepto: 'Servicio traslado de personal', abr: 0, may: 36340, jun: 34720, jul: 39995, ago: 44270, sep: 45878, total: 201203 },
  { concepto: 'Servicios de importacion', abr: 0, may: 0, jun: 0, jul: 0, ago: 439, sep: 0, total: 439 },
  { concepto: 'Vigilancia externa', abr: 0, may: 0, jun: 0, jul: 10582, ago: 10582, sep: 13182, total: 34346 },
  { concepto: 'Otros mantenimientos menores', abr: 0, may: 0, jun: 0, jul: 0, ago: 0, sep: 10, total: 10 }
];`;

content = content.replace(oldPellasRegex, newPellasContent);

// Replace SERVICIOS_CONSOLIDADO_OFICIAL_8_MESES block
const oldConsolRegex = /export const SERVICIOS_CONSOLIDADO_OFICIAL_8_MESES: FilaDesgloseMensual\[\] = \[[\s\S]*?\];/;
const newConsolContent = `export const SERVICIOS_CONSOLIDADO_OFICIAL_8_MESES: FilaDesgloseMensual[] = [
  { concepto: 'Subcontrato de Maquinado de Gran Escala y Torno Pesado', ene: 28000, feb: 36000, mar: 74000, abr: 18500, may: 24800, jun: 980000, jul: 185000, ago: 22000, sep: 12000, total: 1380300 },
  { concepto: 'Alquiler de Grúas Telescópicas de Alto Tonelaje e Izamiento', ene: 24000, feb: 32000, mar: 68000, abr: 16200, may: 21000, jun: 420000, jul: 72000, ago: 18500, sep: 0, total: 671700 },
  { concepto: 'Servicio Integral de Traslado de Personal y Cuadrillas', ene: 42000, feb: 45000, mar: 51000, abr: 38500, may: 42000, jun: 65000, jul: 58000, ago: 48000, sep: 45878, total: 435378 },
  { concepto: 'Vigilancia y Seguridad Externa de Campamento y Frentes', ene: 16000, feb: 17500, mar: 22000, abr: 12800, may: 13500, jun: 24000, jul: 18500, ago: 16000, sep: 17126, total: 157426 },
  { concepto: 'Servicio de Arenado a Presión (Sandblasting SSPC-SP10) y Pintura', ene: 11000, feb: 15000, mar: 26000, abr: 8200, may: 5400, jun: 52000, jul: 8400, ago: 4200, sep: 2000, total: 132200 },
  { concepto: 'Ensayos No Destructivos (END, Radiografía, Gammagrafía y Ultrasonido)', ene: 8500, feb: 12000, mar: 21000, abr: 5100, may: 3200, jun: 38000, jul: 6200, ago: 3100, sep: 500, total: 97600 },
  { concepto: 'Empalmes y Vulcanizado de Bandas Transportadoras', ene: 6200, feb: 8400, mar: 14000, abr: 4100, may: 2100, jun: 28000, jul: 4100, ago: 2100, sep: 250, total: 69250 },
  { concepto: 'Alquiler de Maquinaria Menor, Plataformas Tijera y Compresores', ene: 4200, feb: 6100, mar: 9800, abr: 2800, may: 1800, jun: 19000, jul: 3200, ago: 1600, sep: 2680, total: 51180 },
  { concepto: 'Inspecciones Técnicas, Calificación QA/QC y Laboratorio', ene: 2400, feb: 3200, mar: 5400, abr: 1400, may: 800, jun: 11000, jul: 1800, ago: 900, sep: 563, total: 27463 },
  { concepto: 'Exámenes Médicos de Ingreso, Altura y Salud Ocupacional', ene: 1200, feb: 1800, mar: 2900, abr: 700, may: 400, jun: 4200, jul: 1100, ago: 870, sep: 588, total: 13758 },
  { concepto: 'Servicio de Alimentación y Comida en Frentes de Trabajo', ene: 600, feb: 500, mar: 1400, abr: 433, may: 182, jun: 2800, jul: 644, ago: 500, sep: 1982, total: 9041 },
  { concepto: 'Otros Servicios Operativos (Baños Portátiles, Cisternas, Automatización)', ene: 466, feb: 397, mar: 1331, abr: 200, may: 50, jun: 1192, jul: 250, ago: 200, sep: 15973, total: 21059 }
];`;

content = content.replace(oldConsolRegex, newConsolContent);
fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated mockDesgloseCategorias.ts with September Services!');
