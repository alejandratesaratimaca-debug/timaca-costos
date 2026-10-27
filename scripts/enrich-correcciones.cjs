const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

console.log('--- INICIANDO ENRIQUECIMIENTO Y CARGA DE CORRECCIONES.XLSX ---');

// 1. Cargar proyectos
const proyectosList = JSON.parse(fs.readFileSync('public/data/sip/proyectos.json', 'utf8'));
const projMap = new Map();
proyectosList.forEach(p => {
  if (p.codigo) {
    projMap.set(p.codigo.toUpperCase().trim(), p.nombre);
  }
});

function getProjectName(code) {
  if (!code) return 'Sin Proyecto';
  const c = code.toUpperCase().trim();
  return projMap.get(c) || c;
}

function parseExcelDate(val) {
  if (!val) return '';
  if (typeof val === 'number') {
    const d = new Date(Math.round((val - 25569) * 86400 * 1000));
    const day = String(d.getUTCDate()).padStart(2, '0');
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const year = d.getUTCFullYear();
    return `${day}/${month}/${year}`;
  }
  const s = String(val).trim();
  if (s.includes('/')) {
    const parts = s.split('/');
    if (parts.length === 3) {
      if (parts[2].length === 4) return `${String(parts[0]).padStart(2, '0')}/${String(parts[1]).padStart(2, '0')}/${parts[2]}`;
      if (parts[0].length === 4) return `${String(parts[2]).padStart(2, '0')}/${String(parts[1]).padStart(2, '0')}/${parts[0]}`;
    }
  }
  if (s.includes('-')) {
    const parts = s.split('-');
    if (parts.length === 3) {
      if (parts[0].length === 4) return `${String(parts[2]).padStart(2, '0')}/${String(parts[1]).padStart(2, '0')}/${parts[0]}`;
      if (parts[2].length === 4) return `${String(parts[0]).padStart(2, '0')}/${String(parts[1]).padStart(2, '0')}/${parts[2]}`;
    }
  }
  return s;
}

// 2. Indexar consumos mensuales 2026 y 2025
console.log('Indexando archivos de Consumos...');
const consumosIndex = new Map();
const consumosDir = 'Y:\\Costos Master\\3 Inputs\\1 Consumos';
const monthlyFiles = fs.readdirSync(consumosDir).filter(f => f.endsWith('.xlsx') && !f.startsWith('~$'));

for (const file of monthlyFiles) {
  try {
    const wb = xlsx.readFile(path.join(consumosDir, file));
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);
    for (const r of rows) {
      const num = String(r['Numero'] || r['NUMERO'] || r['Documento'] || '').toUpperCase().trim();
      const cod = String(r['Codigo'] || r['CODIGO'] || '').toUpperCase().trim();
      if (num && cod) {
        const k = `${num}::${cod}`;
        if (!consumosIndex.has(k)) {
          consumosIndex.set(k, { ...r, _source: file });
        }
      }
    }
  } catch (err) {
    console.warn(`Aviso leyendo ${file}: ${err.message}`);
  }
}

// Cargar 2025 para consumos que no estén en 2026
const hist2025File = 'Y:\\Costos Master\\2 Data Fija\\Historico Consumos 2025.xlsx';
if (fs.existsSync(hist2025File)) {
  try {
    const wb25 = xlsx.readFile(hist2025File);
    const rows25 = xlsx.utils.sheet_to_json(wb25.Sheets[wb25.SheetNames[0]]);
    for (const r of rows25) {
      const num = String(r['Numero'] || r['NUMERO'] || '').toUpperCase().trim();
      const cod = String(r['Codigo'] || r['CODIGO'] || '').toUpperCase().trim();
      if (num && cod) {
        const k = `${num}::${cod}`;
        if (!consumosIndex.has(k)) {
          consumosIndex.set(k, { ...r, _source: 'Historico 2025.xlsx' });
        }
      }
    }
  } catch (err) {
    console.warn(`Aviso leyendo 2025: ${err.message}`);
  }
}
console.log(`Consumos indexados: ${consumosIndex.size}`);

// 3. Indexar compras 2026 y 2025
console.log('Indexando archivos de Compras...');
const comprasIndex = new Map();
const comprasByOcOnly = new Map();

['Y:\\Costos Master\\3 Inputs\\2 Compras\\2026.xlsx', 'Y:\\Costos Master\\3 Inputs\\2 Compras\\2025.xlsx'].forEach(fPath => {
  if (fs.existsSync(fPath)) {
    try {
      const wb = xlsx.readFile(fPath);
      const rows = xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
      for (const r of rows) {
        const oc = String(r['Nro-OC'] || '').toUpperCase().trim();
        const cod = String(r['Codigo'] || '').toUpperCase().trim();
        if (oc) {
          if (!comprasByOcOnly.has(oc)) {
            comprasByOcOnly.set(oc, r);
          }
          if (cod) {
            const k = `${oc}::${cod}`;
            if (!comprasIndex.has(k)) {
              comprasIndex.set(k, r);
            }
          }
        }
      }
    } catch (err) {
      console.warn(`Aviso leyendo compras ${fPath}: ${err.message}`);
    }
  }
});
console.log(`Compras indexadas: ${comprasIndex.size} (por OC+Cod), ${comprasByOcOnly.size} (por OC)`);

// 4. Leer Correcciones.xlsx
const corrWb = xlsx.readFile('Y:\\Costos Master\\2 Data Fija\\Correcciones.xlsx');
const rawConsumos = xlsx.utils.sheet_to_json(corrWb.Sheets['Consumos']);
const rawServicios = xlsx.utils.sheet_to_json(corrWb.Sheets['Servicios']);

console.log(`Filas leídas de Correcciones.xlsx: ${rawConsumos.length} Consumos, ${rawServicios.length} Servicios (Total: ${rawConsumos.length + rawServicios.length})`);

// 5. Procesar Consumos
const enrichedCorrecciones = [];

rawConsumos.forEach((r, idx) => {
  const num = String(r['Numero'] || '').toUpperCase().trim();
  const cod = String(r['Codigo'] || '').toUpperCase().trim();
  const k = `${num}::${cod}`;
  const orig = consumosIndex.get(k);

  const desc = r['Descripcion'] || (orig && orig['Descripcion']) || 'Sin Descripción';
  const targetCuenta = String(r['Cuenta-Aux'] || '').toUpperCase().trim();
  const origCuenta = orig ? String(orig['Cuenta-Aux'] || orig['Cuenta'] || '').toUpperCase().trim() : 'Original SIP';
  
  let cant = orig ? Number(orig['Cantidad'] || 1) : 1;
  let precioUnit = orig ? Number(orig['Costo-$'] || orig['Precio Final'] || orig['Precio Unitario Final'] || 0) : 0;
  let totalUSD = orig && orig['Total USD'] ? Number(orig['Total USD']) : (cant * precioUnit);
  totalUSD = Math.round(totalUSD * 100) / 100;

  const fechaMov = parseExcelDate(r['Fecha'] || (orig && orig['Fecha']));
  const solicitante = orig ? (orig['solicitante'] || orig['Solicitante'] || '') : '';
  const obs = r['Observaciones'] || (orig && orig['motivo']) || 'Reclasificación Contable Histórica';

  enrichedCorrecciones.push({
    recordId: `HIST-CONS-${num}-${cod}-${idx}`,
    tipoItem: 'consumo',
    documento: num,
    pedido: r['Pedido'] || (orig && orig['Pedido']) || '',
    codigo: cod,
    descripcion: desc,
    cantidad: cant,
    precioUnitario: precioUnit,
    totalUSD: totalUSD,
    fechaMovimiento: fechaMov,
    cuentaAnterior: origCuenta,
    proyectoAnterior: getProjectName(origCuenta),
    nuevaCuenta: targetCuenta,
    nuevoProyecto: getProjectName(targetCuenta),
    solicitante: solicitante,
    motivo: obs,
    fecha: 'Histórico 2026',
    usuario: 'Histórico Costos (Correcciones.xlsx - Elizabeth)'
  });
});

// 6. Procesar Servicios
rawServicios.forEach((s, idx) => {
  const oc = String(s['Nro-OC'] || '').toUpperCase().trim();
  const cod = String(s['Codigo'] || '').toUpperCase().trim();
  const k = `${oc}::${cod}`;
  const orig = comprasIndex.get(k) || comprasByOcOnly.get(oc);

  const desc = s['Descripcion'] || (orig && orig['Descripcion']) || 'Servicio';
  const targetCuenta = String(s['Cuenta-Aux'] || '').toUpperCase().trim();
  const origCuenta = orig ? String(orig['Cuenta-Aux'] || '').toUpperCase().trim() : (targetCuenta || 'Original SIP');
  
  let totalUSD = Number(s['Total USD'] || 0);
  if (!totalUSD && s['Precio$']) {
    totalUSD = Number(s['Precio$']) * Number(s['Cant-OC'] || 1);
  }
  if (!totalUSD && orig) {
    totalUSD = Number(orig['Total$'] || (Number(orig['Precio$'] || 0) * Number(orig['Cant-OC'] || 1)));
  }
  totalUSD = Math.round(totalUSD * 100) / 100;

  const fechaMov = parseExcelDate(s['Fecha Real'] || s['Fecha-Sol'] || s['Fecha-OC'] || (orig && (orig['Fecha-Sol'] || orig['Fecha-OC'])));
  const solicitante = s['Solicitado-Por'] || (orig && orig['Solicitado-Por']) || '';
  const proveedor = s['Proveedor'] || (orig && orig['Proveedor']) || '';
  const motivo = s['Motivo'] || (orig && orig['Motivo']) || 'Reclasificación Servicio';

  enrichedCorrecciones.push({
    recordId: `HIST-SERV-${oc}-${cod || 'GEN'}-${idx}`,
    tipoItem: 'compra',
    documento: oc,
    solicitud: (orig && orig['Nro-Sol']) || '',
    codigo: cod,
    descripcion: desc,
    cantidad: Number(s['Cant-OC'] || 1),
    totalUSD: totalUSD,
    fechaMovimiento: fechaMov,
    cuentaAnterior: origCuenta,
    proyectoAnterior: getProjectName(origCuenta),
    nuevaCuenta: targetCuenta,
    nuevoProyecto: getProjectName(targetCuenta),
    solicitante: solicitante,
    proveedor: proveedor,
    motivo: motivo,
    fecha: 'Histórico 2026',
    usuario: 'Histórico Costos (Correcciones.xlsx - Elizabeth)'
  });
});

console.log(`Total correcciones enriquecidas desde Excel: ${enrichedCorrecciones.length}`);

// 7. Leer correcciones previas para preservarlas intactas
const currentJsonPath = 'public/data/sip/reclasificaciones.json';
let driveroEntries = [];
if (fs.existsSync(currentJsonPath)) {
  const current = JSON.parse(fs.readFileSync(currentJsonPath, 'utf8'));
  driveroEntries = current.filter(x => !x.usuario?.includes('Correcciones.xlsx'));
  console.log(`Preservando ${driveroEntries.length} correcciones registradas en vivo por el usuario.`);
}

// 8. Combinar: primero las de drivero (más recientes), luego las 456 de Daniela
const finalReclasificaciones = [...driveroEntries, ...enrichedCorrecciones];
console.log(`Total reclasificaciones finales a guardar: ${finalReclasificaciones.length}`);

// Validar estadísticas
const totalUSDConsumos = finalReclasificaciones.filter(x => x.tipoItem === 'consumo').reduce((a, b) => a + (b.totalUSD || 0), 0);
const totalUSDServicios = finalReclasificaciones.filter(x => x.tipoItem === 'compra').reduce((a, b) => a + (b.totalUSD || 0), 0);
console.log(`Monto total Consumos: $${totalUSDConsumos.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
console.log(`Monto total Compras/Servicios: $${totalUSDServicios.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
console.log(`Monto total Reclasificado: $${(totalUSDConsumos + totalUSDServicios).toLocaleString('en-US', { minimumFractionDigits: 2 })}`);

// 9. Guardar archivos
fs.writeFileSync(currentJsonPath, JSON.stringify(finalReclasificaciones, null, 2), 'utf8');
console.log(`Guardado exitoso en ${currentJsonPath}`);

// Guardar también correcciones_historicas.json
fs.writeFileSync('public/data/sip/correcciones_historicas.json', JSON.stringify(enrichedCorrecciones, null, 2), 'utf8');
console.log('Guardado exitoso en public/data/sip/correcciones_historicas.json');

// Actualizar status.json
const statusPath = 'public/data/sip/status.json';
if (fs.existsSync(statusPath)) {
  const st = JSON.parse(fs.readFileSync(statusPath, 'utf8'));
  st.totalReclasificaciones = finalReclasificaciones.length;
  fs.writeFileSync(statusPath, JSON.stringify(st, null, 2), 'utf8');
  console.log('Actualizado public/data/sip/status.json con totalReclasificaciones:', st.totalReclasificaciones);
}

console.log('--- FINALIZADO CON ÉXITO ---');
