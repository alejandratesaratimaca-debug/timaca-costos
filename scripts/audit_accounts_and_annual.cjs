const fs = require('fs');

const octData = JSON.parse(fs.readFileSync('./public/data/sip/unificada_octubre.json', 'utf8')).items || [];
const sepData = JSON.parse(fs.readFileSync('./public/data/sip/unificada_septiembre.json', 'utf8')).items || [];
const agoData = JSON.parse(fs.readFileSync('./public/data/sip/unificada_agosto.json', 'utf8')).items || [];
const histData = JSON.parse(fs.readFileSync('./public/data/sip/ajustes_historicos_2026.json', 'utf8')).items || [];
const matrizData = JSON.parse(fs.readFileSync('./public/data/sip/matriz.json', 'utf8'));
const proyectosList = JSON.parse(fs.readFileSync('./public/data/sip/proyectos.json', 'utf8'));

const pMap = new Map();
proyectosList.forEach(p => pMap.set(p.codigo.trim().toUpperCase(), p));

const CUENTAS_CORTAS = {
  'TTE-C-0706': 'Planta de Pellas',
  'TTE-C-0671': '2da Línea PMH',
  'TTE-C-0653': 'Rueda de Cangilones',
  'TTE-C-0668': 'Fase 2 Briquetas',
  'TTE-C-0655': 'Interconexión Transporte',
  'TTE-C-0678': 'Pila HA y HB',
  'TTE-C-0680': 'Mantenimiento BG II',
  'TTE-C-0640': 'Parrilla Móvil 610TG1',
  'TTE-C-0694': 'Caldera BF-6002',
  'TTE-C-0656': 'Bandas Transportadoras',
  'TTE-C-0708': 'Muelle Boca Grande II',
  'TTE-C-0720': 'Oficinas IMPSA',
  'TTE-C-0719': 'Polea Desviadora PMH',
  'TTE-C-0697': 'Generador Eléctrico Pellas',
  'TTE-C-0687': 'Poleas Motriz y Quiebre',
  'TTE-C-0672': 'Extensión Banda JD 8016A',
  'TTE-C-0676': '2da Línea Pellas',
  'TTE-C-0695': 'Proyectos Especiales',
  'TTE-C-0662': 'Servicios Metalmecánicos',
  'TTE-C-0646': 'Mantenimiento Mecánico'
};

console.log('========================================================================');
console.log('1. AUDITORÍA EXHAUSTIVA OCTUBRE 2026 (SIP EN VIVO)');
console.log('========================================================================');

const ctaOct = new Map();
let totalOct = 0;
let totalOctCount = 0;
octData.forEach(r => {
  const c = (r.cuenta_aux || '').trim().toUpperCase();
  if (c.startsWith('TTE-')) {
    const val = Number(r.total_usd) || 0;
    totalOct += val;
    totalOctCount++;
    if (!ctaOct.has(c)) {
      const p = pMap.get(c);
      ctaOct.set(c, {
        codigo: c,
        nombre: p ? p.nombre : (r.datos_descripcion || c),
        corto: CUENTAS_CORTAS[c] || (p ? p.nombre : c),
        cliente: p ? p.cliente : 'VISCO ORINOCO',
        total: 0,
        count: 0,
        mat: 0,
        serv: 0,
        mdo: 0,
        hm: 0,
        cif: 0
      });
    }
    const acc = ctaOct.get(c);
    acc.total += val;
    acc.count++;
    const t = (r.tipo || '').toLowerCase();
    if (t.includes('serv')) acc.serv += val;
    else if (t.includes('mano') || t.includes('mdo')) acc.mdo += val;
    else if (t.includes('hora') || t.includes('maquina')) acc.hm += val;
    else if (t.includes('indirect')) acc.cif += val;
    else acc.mat += val;
  }
});

console.log('Total Octubre Externo: $' + totalOct.toFixed(2) + ' USD (' + totalOctCount + ' movimientos en 16 cuentas)');
const octSorted = Array.from(ctaOct.values()).sort((a,b) => b.total - a.total);
octSorted.forEach((c, idx) => {
  const pct = ((c.total / totalOct) * 100).toFixed(1);
  console.log(
    '#' + (idx + 1).toString().padStart(2, ' ') + ' ' + 
    c.codigo.padEnd(11, ' ') + ' | ' + 
    c.corto.padEnd(26, ' ') + ' | $' + 
    Math.round(c.total).toLocaleString('de-DE').padStart(10, ' ') + ' USD | ' + 
    pct.padStart(5, ' ') + '% | ' + 
    c.count.toString().padStart(4, ' ') + ' mov. | Mat: $' + 
    Math.round(c.mat).toLocaleString('de-DE') + ' | Serv: $' + 
    Math.round(c.serv).toLocaleString('de-DE')
  );
});

console.log('\n========================================================================');
console.log('2. AUDITORÍA EXHAUSTIVA ANUAL 2026 (ENERO A OCTUBRE 2026 - SIP)');
console.log('========================================================================');

const allMonthsData = [
  ...histData,
  ...agoData,
  ...sepData,
  ...octData
];

const ctaAnual = new Map();
let totalAnual = 0;
let totalAnualCount = 0;

allMonthsData.forEach(r => {
  const c = (r.cuenta_aux || '').trim().toUpperCase();
  if (c.startsWith('TTE-')) {
    const val = Number(r.total_usd) || 0;
    totalAnual += val;
    totalAnualCount++;
    if (!ctaAnual.has(c)) {
      const p = pMap.get(c);
      ctaAnual.set(c, {
        codigo: c,
        nombre: p ? p.nombre : (r.datos_descripcion || c),
        corto: CUENTAS_CORTAS[c] || (p ? p.nombre : c),
        cliente: p ? p.cliente : 'VISCO ORINOCO',
        total: 0,
        count: 0,
        mat: 0,
        serv: 0,
        mdo: 0,
        hm: 0,
        cif: 0,
        meses: { 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0, 10:0 }
      });
    }
    const acc = ctaAnual.get(c);
    acc.total += val;
    acc.count++;

    // Asignar al mes
    let mesNum = 0;
    const nm = (r.nombre_mes || '').toLowerCase();
    if (nm === 'enero' || r.mes === 1) mesNum = 1;
    else if (nm === 'febrero' || r.mes === 2) mesNum = 2;
    else if (nm === 'marzo' || r.mes === 3) mesNum = 3;
    else if (nm === 'abril' || r.mes === 4) mesNum = 4;
    else if (nm === 'mayo' || r.mes === 5) mesNum = 5;
    else if (nm === 'junio' || r.mes === 6) mesNum = 6;
    else if (nm === 'julio' || r.mes === 7) mesNum = 7;
    else if (nm === 'agosto' || r.mes === 8) mesNum = 8;
    else if (nm === 'septiembre' || r.mes === 9) mesNum = 9;
    else if (nm === 'octubre' || r.mes === 10) mesNum = 10;
    else {
      // Intentar por fecha
      const f = r.fecha || '';
      if (f.includes('-08-') || f.includes('/08/')) mesNum = 8;
      else if (f.includes('-09-') || f.includes('/09/')) mesNum = 9;
      else if (f.includes('-10-') || f.includes('/10/')) mesNum = 10;
    }
    if (mesNum > 0 && acc.meses[mesNum] !== undefined) {
      acc.meses[mesNum] += val;
    }

    const t = (r.tipo || '').toLowerCase();
    if (t.includes('serv')) acc.serv += val;
    else if (t.includes('mano') || t.includes('mdo')) acc.mdo += val;
    else if (t.includes('hora') || t.includes('maquina')) acc.hm += val;
    else if (t.includes('indirect')) acc.cif += val;
    else acc.mat += val;
  }
});

console.log('Total Anual Externo SIP: $' + totalAnual.toFixed(2) + ' USD (' + totalAnualCount + ' movimientos en ' + ctaAnual.size + ' cuentas)');
const anualSorted = Array.from(ctaAnual.values()).sort((a,b) => b.total - a.total);
anualSorted.forEach((c, idx) => {
  const pct = ((c.total / totalAnual) * 100).toFixed(1);
  console.log(
    '#' + (idx + 1).toString().padStart(2, ' ') + ' ' + 
    c.codigo.padEnd(11, ' ') + ' | ' + 
    c.corto.padEnd(26, ' ') + ' | $' + 
    Math.round(c.total).toLocaleString('de-DE').padStart(11, ' ') + ' USD | ' + 
    pct.padStart(5, ' ') + '% | ' + 
    c.count.toString().padStart(5, ' ') + ' mov.'
  );
});

console.log('\n========================================================================');
console.log('3. EVOLUCIÓN MENSUAL DEL CONSOLIDADO EXTERNO (ENERO A OCTUBRE)');
console.log('========================================================================');
const mesesTotales = { 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0, 10:0 };
anualSorted.forEach(c => {
  for (let m = 1; m <= 10; m++) {
    mesesTotales[m] += c.meses[m];
  }
});
const mesesNombres = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre'];
for (let m = 1; m <= 10; m++) {
  console.log(mesesNombres[m].padEnd(12, ' ') + ': $' + Math.round(mesesTotales[m]).toLocaleString('de-DE').padStart(10, ' ') + ' USD');
}

console.log('\n========================================================================');
console.log('4. COMPARATIVA CON MATRIZ.JSON CONSOLIDADA DANIELA');
console.log('========================================================================');
const extMatriz = matrizData.proyectos.filter(p => p.tipoCosto === 'Externo' || p.codigo.startsWith('TTE-'));
console.log('Total proyectos en matriz.json:', extMatriz.length);
extMatriz.sort((a,b) => b.totalUSD - a.totalUSD).slice(0, 15).forEach((p, idx) => {
  console.log(
    '#' + (idx + 1).toString().padStart(2, ' ') + ' ' + 
    p.codigo.padEnd(11, ' ') + ' | $' + 
    Math.round(p.totalUSD).toLocaleString('de-DE').padStart(10, ' ') + ' USD | Mat: $' + 
    Math.round(p.materialesDirectos).toLocaleString('de-DE') + ' | Serv: $' + 
    Math.round(p.servicios).toLocaleString('de-DE') + ' | ' + 
    p.nombre.slice(0, 35)
  );
});
