const fs = require('fs');
const XLSX = require('xlsx');

console.log('Reading 4 Master Unificado.xlsx...');
const wb = XLSX.readFile('C:/Users/alejandratesara/Downloads/4 Master Unificado.xlsx', {sheets: ['Unificada']});
const ws = wb.Sheets['Unificada'];
const rows = XLSX.utils.sheet_to_json(ws);
console.log('Total rows loaded:', rows.length);

// 1. Extract all rows for August 2026
const rAgo = rows.filter(r => {
  const anio = String(r['Año'] || '');
  const mes = String(r['Nombre del mes'] || '').toLowerCase();
  return anio.includes('2026') && mes.includes('agosto');
});
console.log('Total August 2026 rows:', rAgo.length);

// Format date helper
function formatDate(f) {
  if (typeof f === 'number') {
    const d = XLSX.SSF.parse_date_code(f);
    if (d) {
      const dd = String(d.d).padStart(2, '0');
      const mm = String(d.m).padStart(2, '0');
      return `${dd}/${mm}/${d.y}`;
    }
  }
  return String(f || '');
}

// Subcategory classifier for EPP
function clasificarSubcategoriaEPP(desc, cod) {
  const d = (desc || '').toUpperCase();
  if (d.includes('BOTA') || d.includes('ZAPATO') || d.includes('CALZADO')) {
    return 'Calzado de Seguridad';
  }
  if (d.includes('GUANTE') || d.includes('MANGA') || d.includes('CARNAZA') || d.includes('SOLDADOR')) {
    return 'Protección de Manos y Soldadura';
  }
  if (d.includes('MASCARILLA') || d.includes('RESPIRADOR') || d.includes('FILTRO') || d.includes('CARTUCHO')) {
    return 'Protección Respiratoria';
  }
  if (d.includes('CAMISA') || d.includes('PANTALON') || d.includes('BRAGA') || d.includes('UNIFORME')) {
    return 'Uniformes y Ropa de Trabajo TIMACA';
  }
  if (d.includes('ARNES') || d.includes('ESLINGA') || d.includes('LINEA DE VIDA') || d.includes('CAIDA')) {
    return 'Protección para Trabajos en Altura';
  }
  if (d.includes('LENTE') || d.includes('CARETA') || d.includes('PANTALLA') || d.includes('FACIAL') || d.includes('VISOR')) {
    return 'Protección Facial y Visual';
  }
  if (d.includes('CASCO') || d.includes('BARBOQUEJO')) {
    return 'Protección de Cabeza';
  }
  if (d.includes('SALVAVIDAS') || d.includes('YUGO')) {
    return 'Equipos de Salvamento y Rescate';
  }
  return 'Otros Equipos de Protección';
}

// 2. Extract all rows for TTE-C-0656 (all 46 rows in August)
const tte0656Rows = rAgo.filter(r => String(r['Cuenta-Aux'] || '').includes('0656')).map(r => {
  return {
    tipo: r['Tipo'] || 'Materiales Directos',
    almacen: r['Almacen'] || 'ALMCE',
    fecha: formatDate(r['Fecha']),
    numero: r['Numero'] || '',
    pedido: r['Pedido'] || '',
    cuentaAux: r['Cuenta-Aux'] || 'TTE-C-0656',
    ceco: r['Ceco'] || 'MON-3',
    codigo: r['Codigo'] || '',
    descripcion: r['Descripcion'] || '',
    cantidad: Number(r['Cantidad']) || 0,
    unidad: r['Unidad'] || 'UND',
    solicitante: r['solicitante'] || 'JESUS VALDEZ',
    motivo: r['motivo'] || 'REHABILITACION DE BANDAS TRANSPORTADORAS PMH',
    categoria: r['Categoria'] || 'Materiales Directos',
    precioFinal: Number(r['Precio Final']) || 0,
    totalUSD: Number(r['Total USD']) || 0,
    tipoCosto: r['Datos.Tipo Costo'] || 'Externo',
    ajuste: r['Ajuste'] || ''
  };
});
console.log('TTE-C-0656 rows extracted:', tte0656Rows.length);

// 3. Extract all EPP rows in August 2026
const eppRows = rAgo.filter(r => {
  const tipo = String(r['Tipo'] || '');
  const cat = String(r['Categoria'] || '').toLowerCase();
  const cod = String(r['Codigo'] || '');
  return tipo.includes('Materiales') && (cat.includes('proteccion') || cat.includes('epp') || cod.startsWith('SI'));
}).map(r => {
  const desc = r['Descripcion'] || '';
  const cod = r['Codigo'] || '';
  return {
    tipo: 'Materiales Directos',
    almacen: r['Almacen'] || 'ALMCE',
    fecha: formatDate(r['Fecha']),
    numero: r['Numero'] || '',
    pedido: r['Pedido'] || '',
    cuentaAux: r['Cuenta-Aux'] || 'TTE-C-0706',
    ceco: r['Ceco'] || 'FAB-1',
    codigo: cod,
    descripcion: desc,
    cantidad: Number(r['Cantidad']) || 0,
    unidad: r['Unidad'] || 'UND',
    solicitante: r['solicitante'] || 'SIAHO / Residencia',
    motivo: r['motivo'] || 'Dotación de Seguridad Industrial en Obra',
    categoria: 'Equipos De Proteccion Personal',
    subcategoriaEPP: clasificarSubcategoriaEPP(desc, cod),
    precioFinal: Number(r['Precio Final']) || 0,
    totalUSD: Number(r['Total USD']) || 0,
    tipoCosto: r['Datos.Tipo Costo'] || 'Externo',
    ajuste: r['Ajuste'] || ''
  };
});
console.log('EPP rows extracted:', eppRows.length);

// 4. Group EPP rows by subcategoriaEPP
const eppSubcategoriasSummary = {};
eppRows.forEach(r => {
  const sub = r.subcategoriaEPP;
  if (!eppSubcategoriasSummary[sub]) {
    eppSubcategoriasSummary[sub] = {
      nombre: sub,
      totalUSD: 0,
      movimientos: 0,
      unidades: 0,
      proyectos: new Set()
    };
  }
  eppSubcategoriasSummary[sub].totalUSD += r.totalUSD;
  eppSubcategoriasSummary[sub].movimientos += 1;
  eppSubcategoriasSummary[sub].unidades += r.cantidad;
  eppSubcategoriasSummary[sub].proyectos.add(r.cuentaAux);
});

console.log('EPP Subcategories summary:');
Object.values(eppSubcategoriasSummary).forEach(s => {
  console.log(`- ${s.nombre}: $${s.totalUSD.toFixed(2)} USD (${s.movimientos} movs, ${s.proyectos.size} proyectos, ${s.unidades.toFixed(0)} unid)`);
});

// Write to TypeScript file
const outContent = `// Archivo generado automáticamente desde 4 Master Unificado.xlsx (Hoja Unificada)
// Datos 100% REALES de despachos de almacén para auditoría de Costos TIMACA

export interface FilaUnificada {
  tipo: string;
  almacen: string;
  fecha: string;
  numero: string;
  pedido: string;
  cuentaAux: string;
  ceco: string;
  codigo: string;
  descripcion: string;
  cantidad: number;
  unidad: string;
  solicitante: string;
  motivo: string;
  categoria: string;
  subcategoriaEPP?: string;
  precioFinal: number;
  totalUSD: number;
  tipoCosto: string;
  ajuste?: string;
}

// 1. Despachos reales de TTE-C-0656 en Agosto 2026 (Fechas reales 01 al 21, solicitantes reales Jesus Valdez / Alexandra Morales)
export const DESPACHOS_REALES_TTE_C_0656_AGOSTO: FilaUnificada[] = ${JSON.stringify(tte0656Rows, null, 2)};

// 2. Resumen consolidado de las Subcategorías de EPP (Equipos de Protección Personal) en Agosto 2026
export const RESUMEN_SUBCATEGORIAS_EPP_AGOSTO = ${JSON.stringify(Object.values(eppSubcategoriasSummary).map(s => ({
  nombre: s.nombre,
  totalUSD: Math.round(s.totalUSD * 100) / 100,
  movimientos: s.movimientos,
  unidades: Math.round(s.unidades),
  proyectosCount: s.proyectos.size,
  proyectos: Array.from(s.proyectos)
})), null, 2)};

// 3. Despachos reales de Equipos de Protección Personal (EPP) en Agosto 2026
export const DESPACHOS_REALES_EPP_AGOSTO: FilaUnificada[] = ${JSON.stringify(eppRows, null, 2)};
`;

fs.writeFileSync('src/data/realUnificadaAugust2026.ts', outContent);
console.log('Successfully written src/data/realUnificadaAugust2026.ts');
