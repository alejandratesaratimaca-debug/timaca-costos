const fs = require('fs');
const path = require('path');

function getSipDataDir() {
  const possible = [
    path.join(__dirname, 'public', 'data', 'sip'),
    path.join(__dirname, '..', 'public', 'data', 'sip'),
    path.join(process.cwd(), 'public', 'data', 'sip')
  ];
  for (const p of possible) {
    if (fs.existsSync(p)) return p;
  }
  return path.join(__dirname, 'public', 'data', 'sip');
}

function syncCorreccionesBatch(correcciones) {
  if (!Array.isArray(correcciones) || correcciones.length === 0) {
    return { success: false, message: 'No hay correcciones para sincronizar', count: 0 };
  }

  const sipDir = getSipDataDir();
  const reclasifPath = path.join(sipDir, 'reclasificaciones.json');
  const historicasPath = path.join(sipDir, 'correcciones_historicas.json');

  let existingReclasif = [];
  if (fs.existsSync(reclasifPath)) {
    try {
      existingReclasif = JSON.parse(fs.readFileSync(reclasifPath, 'utf-8'));
    } catch (e) {
      existingReclasif = [];
    }
  }

  try {
    const backupDate = new Date().toISOString().replace(/[:.]/g, '-');
    fs.copyFileSync(reclasifPath, `${reclasifPath}.bak_${backupDate}`);
  } catch (e) {}

  const reclasifMap = new Map();
  for (const r of existingReclasif) {
    const k = r.recordId || `${r.documento || ''}-${r.codigo || ''}`;
    reclasifMap.set(String(k).toUpperCase(), r);
  }

  const porMes = new Map();

  for (const c of correcciones) {
    const key = String(c.recordId || `${c.documento || ''}-${c.codigo || ''}`).toUpperCase();
    const entry = {
      recordId: c.recordId || key,
      tipoItem: c.tipoItem || c.tipo || 'consumo',
      documento: c.documento || c.numero || c.dp || c.sc || '',
      solicitud: c.solicitud || c.sc || '',
      codigo: c.codigo || '',
      descripcion: c.descripcion || '',
      cantidad: Number(c.cantidad) || 1,
      costoUnitario: Number(c.costoUnitario || c.precio_final || 0),
      precio_final: Number(c.costoUnitario || c.precio_final || 0),
      totalUSD: Number(c.totalUSD || 0),
      fechaMovimiento: c.fechaMovimiento || c.fecha || '',
      cuentaAnterior: c.cuentaAnterior || '',
      proyectoAnterior: c.proyectoAnterior || '',
      nuevaCuenta: String(c.nuevaCuenta || '').trim().toUpperCase(),
      nuevoProyecto: c.nuevoProyecto || '',
      nuevoMes: c.nuevoMes || '',
      mesOrigen: c.mesOrigen || '',
      solicitante: c.solicitante || '',
      proveedor: c.proveedor || '',
      comprador: c.comprador || '',
      motivo: c.motivo || 'Reclasificación por auditoría',
      fecha: c.fecha || new Date().toISOString(),
      usuario: c.usuario || 'Auditoría SIGMA (Alejandra T)',
      almacen: c.almacen || '',
      ceco: c.ceco || '',
      categoria: c.categoria || '',
      datos_tipo_costo: c.datos_tipo_costo || 'Externo'
    };
    reclasifMap.set(key, entry);

    let targetMes = (c.nuevoMes || c.mesOrigen || '').toLowerCase();
    if (!targetMes || targetMes === 'todos') {
      const fecha = c.fechaMovimiento || c.fecha || '';
      if (fecha.includes('/10/') || fecha.includes('-10-')) targetMes = 'octubre';
      else if (fecha.includes('/09/') || fecha.includes('-09-')) targetMes = 'septiembre';
      else if (fecha.includes('/11/') || fecha.includes('-11-')) targetMes = 'noviembre';
      else targetMes = 'octubre';
    }

    if (!porMes.has(targetMes)) porMes.set(targetMes, []);
    porMes.get(targetMes).push(entry);
  }

  const updatedReclasifList = Array.from(reclasifMap.values());
  fs.writeFileSync(reclasifPath, JSON.stringify(updatedReclasifList, null, 2), 'utf-8');

  if (fs.existsSync(historicasPath)) {
    try {
      fs.writeFileSync(historicasPath, JSON.stringify(updatedReclasifList, null, 2), 'utf-8');
    } catch (e) {}
  }

  const mesesActualizados = [];
  for (const [mes, list] of porMes.entries()) {
    const unificadaPath = path.join(sipDir, `unificada_${mes}.json`);
    if (fs.existsSync(unificadaPath)) {
      try {
        const rawContent = JSON.parse(fs.readFileSync(unificadaPath, 'utf-8'));
        const isDict = !Array.isArray(rawContent) && rawContent.items;
        const items = isDict ? rawContent.items : rawContent;

        const updateMap = new Map();
        for (const item of list) {
          if (item.recordId) updateMap.set(String(item.recordId).toUpperCase(), item);
          const docCod = `${item.documento || ''}-${item.codigo || ''}`.toUpperCase();
          updateMap.set(docCod, item);
          if (item.documento) updateMap.set(String(item.documento).toUpperCase(), item);
        }

        let modifiedInMonth = 0;
        for (const it of items) {
          const itId = it.id != null ? String(it.id).toUpperCase() : null;
          const itDoc = String(it.numero || it.ordenCompra || it.dp || it.sc || '').trim().toUpperCase();
          const itCod = String(it.codigo || '').trim().toUpperCase();
          const itDocCod = `${itDoc}-${itCod}`;

          const match = (itId && updateMap.get(itId)) || updateMap.get(itDocCod) || (itDoc && updateMap.get(itDoc));
          if (match) {
            it.cuenta_aux_original = it.cuenta_aux_original || it.cuenta_aux;
            it.cuenta_aux = match.nuevaCuenta;
            it.datos_descripcion = match.nuevoProyecto || it.datos_descripcion;
            it.datos_tipo_costo = match.datos_tipo_costo || it.datos_tipo_costo;
            it.ajuste = `CORREGIDO AUDITORIA: ${match.motivo}`;
            it.esReclasificado = true;
            it.infoReclasificacion = match;
            modifiedInMonth++;
          }
        }

        fs.writeFileSync(unificadaPath, JSON.stringify(rawContent, null, 2), 'utf-8');
        mesesActualizados.push({ mes, modifiedCount: modifiedInMonth });
      } catch (e) {
        console.error(`Error actualizando unificada_${mes}.json:`, e);
      }
    }
  }

  return {
    success: true,
    totalReclasificaciones: updatedReclasifList.length,
    nuevasAplicadas: correcciones.length,
    mesesActualizados
  };
}

module.exports = {
  syncCorreccionesBatch,
  getSipDataDir
};
