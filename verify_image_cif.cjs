const fs = require('fs');

// Exact values from Alejandra's image
const CIF_RUBROS_2026 = [
  { concepto: 'Servicios Publicos', ene: 3389, feb: 3257, mar: 2450, abr: 2611, may: 2491, jun: 2485, jul: 2182, ago: 2393, sep: 2556 },
  { concepto: 'Nomina TIMACA', ene: 88000, feb: 87000, mar: 104000, abr: 95000, may: 153000, jun: 132000, jul: 128000, ago: 128000, sep: 125000 },
  { concepto: 'Nomina -TALLERES', ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 120000, sep: 122000 },
  { concepto: 'Incentivos Laborales (Bonos)', ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 4000, sep: 6700 },
  { concepto: 'Servicios Telecomunicaciones', ene: 554, feb: 586, mar: 596, abr: 717, may: 589, jun: 614, jul: 570, ago: 598, sep: 570 },
  { concepto: 'Combustible', ene: 22074, feb: 28475, mar: 32224, abr: 7424, may: 6392, jun: 12136, jul: 13959, ago: 24651, sep: 50413 },
  { concepto: 'Sindicato', ene: 57000, feb: 58840, mar: 58314, abr: 77076, may: 64858, jun: 57916, jul: 72018, ago: 49630, sep: 58952 },
  { concepto: 'Vigilancia', ene: 3521, feb: 3521, mar: 3880, abr: 4214, may: 4235, jun: 4803, jul: 4803, ago: 4803, sep: 4803 },
  { concepto: 'Gastos de asociación/Subscripción', ene: 56, feb: 106, mar: 123, abr: 116, may: 56, jun: 86, jul: 55, ago: 116, sep: 56 },
  { concepto: 'Gastos de Servicios Bancarios', ene: 35, feb: 42, mar: 120, abr: 36, may: 46, jun: 48, jul: 49, ago: 50, sep: 49 },
  { concepto: 'Gastos de Seguro', ene: 0, feb: 95, mar: 0, abr: 165, may: 30, jun: 318, jul: 386, ago: 436, sep: 277 },
  { concepto: 'Honorarios Profesionales', ene: 870, feb: 650, mar: 240, abr: 120, may: 435, jun: 420, jul: 1322, ago: 120, sep: 250 },
  { concepto: 'Gastos Funebres', ene: 0, feb: 0, mar: 0, abr: 2176, may: 0, jun: 0, jul: 0, ago: 0, sep: 0 },
  { concepto: 'Timbres Fiscales / Notarias / Registros', ene: 1219, feb: 500, mar: 70, abr: 1070, may: 890, jun: 726, jul: 1843, ago: 3445, sep: 7634 },
  { concepto: 'Gastos de viajes/viáticos nacionales', ene: 351, feb: 393, mar: 2353, abr: 3964, may: 1940, jun: 1523, jul: 2267, ago: 1259, sep: 4124 },
  { concepto: 'Otros Servicios Contratados de Admón.', ene: 4930, feb: 571, mar: 1523, abr: 2503, may: 2504, jun: 217, jul: 0, ago: 478, sep: 9991 }
];

const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep'];

console.log('--- MONTHLY TOTALS CALCULATED ---');
meses.forEach(m => {
  const sum = CIF_RUBROS_2026.reduce((acc, r) => acc + (r[m] || 0), 0);
  console.log(`${m.toUpperCase()}: ${sum}`);
});
