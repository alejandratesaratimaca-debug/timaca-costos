const XLSX = require('xlsx');
const fs = require('fs');

// Table data extracted directly from the user's slide image
const slideData = [
  { cta: 'TTE-C-0706', ago: 636352, acum: 2024563, pres: 29720235, av: 0.07 },
  { cta: 'TTE-C-0671', ago: 187959, acum: 841142, pres: 3262940, av: 0.26 },
  { cta: 'TTE-C-0668', ago: 169771, acum: 1185597, pres: 6433507, av: 0.18 },
  { cta: 'TTE-C-0656', ago: 109519, acum: 1353163, pres: 3266569, av: 0.41 },
  { cta: 'TTE-C-0653', ago: 64981, acum: 434899, pres: 2216080, av: 0.20 },
  { cta: 'TTE-C-0680', ago: 51180, acum: 494655, pres: null, av: null },
  { cta: 'TTE-C-0655', ago: 32170, acum: 529556, pres: 3210201, av: 0.16 },
  { cta: 'TTE-C-0678', ago: 31448, acum: 289825, pres: 12187421, av: 0.02 },
  { cta: 'TTE-C-0670', ago: 15180, acum: 87037, pres: null, av: null },
  { cta: 'TTE-C-0640', ago: 13705, acum: 82853, pres: null, av: null },
  { cta: 'TTE-C-0694', ago: 13140, acum: 1457214, pres: null, av: null },
  { cta: 'TTE-C-0669', ago: 9992, acum: 54148, pres: null, av: null },
  { cta: 'TTE-C-0676', ago: 4018, acum: 1938770, pres: null, av: null },
  { cta: 'TTE-C-0684', ago: 2143, acum: 4038, pres: null, av: null },
  { cta: 'TTE-C-0697', ago: 1045, acum: 29799, pres: 32034, av: 0.93 },
  { cta: 'TTE-C-0688', ago: 759, acum: 29244, pres: 147731, av: 0.20 },
  { cta: 'TTE-C-0663', ago: 665, acum: 795, pres: null, av: null },
  { cta: 'TTE-C-0642', ago: 359, acum: 1021, pres: null, av: null },
  { cta: 'TTE-C-0711', ago: 334, acum: 6558, pres: 17092, av: 0.38 },
  { cta: 'TTE-C-0654', ago: 290, acum: 205486, pres: 1614051, av: 0.13 }
];

console.log('--- 1. CHECK AGAINST WEB APP (realProyectosMensual2026.ts) ---');
const contentTs = fs.readFileSync('src/data/realProyectosMensual2026.ts', 'utf8');

// Parse JSON inside ts
const jsonMatch = contentTs.match(/export const REAL_PROYECTOS_MENSUAL_2026[^=]*=\s*({[\s\S]*});/);
let appData = {};
if (jsonMatch) {
  try {
    appData = eval('(' + jsonMatch[1] + ')');
    console.log('App data parsed successfully! Total projects in app:', Object.keys(appData).length);
  } catch(e) {
    console.log('Error parsing app data:', e.message);
  }
}

const appComparison = [];
slideData.forEach(item => {
  const p = appData[item.cta];
  if (!p) {
    appComparison.push({ cta: item.cta, status: 'NOT FOUND IN APP' });
    return;
  }
  const appAgo = p.meses[7]; // index 7 is agosto
  const appAcum = p.totalAnual;
  appComparison.push({
    cta: item.cta,
    slideAgo: item.ago,
    appAgo: Math.round(appAgo),
    diffAgo: Math.round(appAgo) - item.ago,
    slideAcum: item.acum,
    appAcum: Math.round(appAcum),
    diffAcum: Math.round(appAcum) - item.acum
  });
});
console.table(appComparison);

console.log('\n--- 2. CHECK AGAINST NUEVAS TABLAS (Externos 2026 / Proyectos 2026 / Filtro por C.Aux) ---');
const pathNuevas = 'C:/Users/alejandratesara/Desktop/Alejandra T/Costos Alejandra/1 Informe/Nuevas Tablas Informesssssssssssss.xlsx';
const wbNuevas = XLSX.readFile(pathNuevas);
const wsProyNuevas = wbNuevas.Sheets['Proyectos 2026'];
const rowsProyNuevas = XLSX.utils.sheet_to_json(wsProyNuevas, { header: 1 });
const nuevasAcumMap = {};
rowsProyNuevas.slice(6).forEach(r => {
  if (r && r[0]) nuevasAcumMap[String(r[0]).trim()] = Number(r[2] || 0);
});

// Let's also check Externos 2026 total for Agosto
const wsExt = wbNuevas.Sheets['Externos 2026'];
const rowsExt = XLSX.utils.sheet_to_json(wsExt, { header: 1 });
console.log('Nuevas Tablas Externos 2026 Agosto Total General:', rowsExt[13][8]);

slideData.forEach(item => {
  const nAcum = nuevasAcumMap[item.cta];
  console.log(`${item.cta} -> Slide Acum: ${item.acum}, NuevasTablas Acum: ${nAcum ? Math.round(nAcum) : 'N/A'}`);
});
