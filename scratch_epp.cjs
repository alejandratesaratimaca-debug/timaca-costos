const XLSX = require('xlsx');

console.log('Reading 4 Master Unificado.xlsx...');
const wb = XLSX.readFile('C:/Users/alejandratesara/Downloads/4 Master Unificado.xlsx', {sheets: ['Unificada']});
const ws = wb.Sheets['Unificada'];
const rows = XLSX.utils.sheet_to_json(ws);

const eppAgo = rows.filter(r => {
  const anio = String(r['Año'] || '');
  const mes = String(r['Nombre del mes'] || '').toLowerCase();
  const tipo = String(r['Tipo'] || '');
  const cat = String(r['Categoria'] || '').toLowerCase();
  const cod = String(r['Codigo'] || '');
  return anio.includes('2026') && mes.includes('agosto') && tipo.includes('Materiales') && 
         (cat.includes('proteccion') || cat.includes('epp') || cod.startsWith('SI'));
});

console.log('Total EPP rows in August 2026:', eppAgo.length);

const itemsMap = new Map();
eppAgo.forEach(r => {
  const desc = r['Descripcion'] || 'Sin Descripcion';
  const cta = r['Cuenta-Aux'] || 'Sin Cuenta';
  const totalUSD = Number(r['Total USD']) || 0;
  const qty = Number(r['Cantidad']) || 0;
  const unit = r['Unidad'] || 'UND';
  const cod = r['Codigo'] || '';

  if (!itemsMap.has(desc)) {
    itemsMap.set(desc, {
      codigo: cod,
      descripcion: desc,
      unidad: unit,
      totalUSD: 0,
      totalQty: 0,
      count: 0,
      proyectos: new Set()
    });
  }
  const item = itemsMap.get(desc);
  item.totalUSD += totalUSD;
  item.totalQty += qty;
  item.count += 1;
  item.proyectos.add(cta);
});

console.log('Distinct EPP Items count:', itemsMap.size);
const sortedItems = Array.from(itemsMap.values()).sort((a,b) => b.totalUSD - a.totalUSD);
sortedItems.slice(0, 30).forEach((it, idx) => {
  console.log(`${idx+1}. [${it.codigo}] ${it.descripcion} - $${it.totalUSD.toFixed(2)} USD (${it.count} movs, ${it.proyectos.size} proyectos: ${Array.from(it.proyectos).slice(0, 5).join(', ')})`);
});
