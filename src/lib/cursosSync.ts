import * as XLSX from 'xlsx';
import {
  TRABAJADORES_CURSOS_TIMACA,
  CERTIFICADOS_VERIFICADOS_DRIVE,
  CATALOGO_CURSOS_NOMBRES,
  CATALOGO_CURSOS_DETALLE,
  STATS_CURSOS_TOTALES,
  DEPARTAMENTOS_LISTA,
  AREAS_FISICAS_LISTA,
  TrabajadorCursosHSE,
  CertificadoVerificadoHSE,
  ItemCatalogoCurso,
  CursoEstadoTrabajador
} from '../data/realCertificadosData';

export const GOOGLE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1HLg7w29tI9XGVxwLtCE-OHQmF-JnnwoaF3OF4o_7kS8/edit?gid=1730870257#gid=1730870257';
export const GOOGLE_SHEET_EXPORT_URL = 'https://docs.google.com/spreadsheets/d/1HLg7w29tI9XGVxwLtCE-OHQmF-JnnwoaF3OF4o_7kS8/export?format=xlsx';
const CACHE_STORAGE_KEY = 'TIMACA_CURSOS_LIVE_CACHE_V2';

export interface CursosSyncResult {
  trabajadores: TrabajadorCursosHSE[];
  certificados: CertificadoVerificadoHSE[];
  catalogoNombres: string[];
  catalogoDetalle: ItemCatalogoCurso[];
  statsCursos: Record<string, { aplican: number; completados: number; pendientes: number; noAplica: number }>;
  departamentos: string[];
  areasFisicas: string[];
  lastSync: string;
  source: 'live' | 'cache' | 'default';
}

export function getInitialCursosData(): CursosSyncResult {
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(CACHE_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && Array.isArray(parsed.trabajadores) && parsed.trabajadores.length > 0) {
          return {
            ...parsed,
            source: 'cache'
          };
        }
      }
    } catch (e) {
      console.warn('[CursosSync] Error leyendo caché local:', e);
    }
  }

  return {
    trabajadores: TRABAJADORES_CURSOS_TIMACA,
    certificados: CERTIFICADOS_VERIFICADOS_DRIVE,
    catalogoNombres: CATALOGO_CURSOS_NOMBRES,
    catalogoDetalle: CATALOGO_CURSOS_DETALLE,
    statsCursos: STATS_CURSOS_TOTALES,
    departamentos: DEPARTAMENTOS_LISTA,
    areasFisicas: AREAS_FISICAS_LISTA,
    lastSync: 'Instalación base (13/10/2026)',
    source: 'default'
  };
}

export async function fetchLiveCursosData(): Promise<CursosSyncResult> {
  const resp = await fetch(GOOGLE_SHEET_EXPORT_URL);
  if (!resp.ok) {
    throw new Error(`Error HTTP al descargar Google Sheet (${resp.status} ${resp.statusText})`);
  }

  const arrayBuffer = await resp.arrayBuffer();
  const wb = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });

  // 1. Catálogo
  const wsCat = wb.Sheets['CATALOGO_CURSOS'];
  if (!wsCat) throw new Error('No se encontró la pestaña CATALOGO_CURSOS en el Google Sheet');
  
  const catRaw = XLSX.utils.sheet_to_json<string[]>(wsCat, { header: 1 });
  const catalogoDetalle: ItemCatalogoCurso[] = [];

  for (let i = 1; i < catRaw.length; i++) {
    const row = catRaw[i];
    if (!row || !row[0]) continue;
    const nombre = String(row[0]).trim();
    if (nombre.toLowerCase() === 'otro') continue;

    catalogoDetalle.push({
      nombre,
      tecnicosAplica: Boolean(row[1] && String(row[1]).includes('✅')),
      supervisoresAplica: Boolean(row[2] && String(row[2]).includes('✅')),
      cargosOperativos: String(row[3] || '').trim()
    });
  }

  const catalogoNombres = catalogoDetalle.map(c => c.nombre);

  // 2. Cursos
  const wsCursos = wb.Sheets['CURSOS'];
  if (!wsCursos) throw new Error('No se encontró la pestaña CURSOS en el Google Sheet');
  
  const cursosRows = XLSX.utils.sheet_to_json<any[]>(wsCursos, { header: 1 });
  const headerRow0 = cursosRows[0] || [];

  const detectedCourses: { nombre: string; startCol: number }[] = [];
  for (let c = 6; c < headerRow0.length; c += 5) {
    const cName = headerRow0[c] ? String(headerRow0[c]).trim() : '';
    if (cName) {
      detectedCourses.push({
        nombre: cName,
        startCol: c
      });
    }
  }

  const statsCursos: Record<string, { aplican: number; completados: number; pendientes: number; noAplica: number }> = {};
  catalogoDetalle.forEach(c => {
    statsCursos[c.nombre] = { aplican: 0, completados: 0, pendientes: 0, noAplica: 0 };
  });

  const trabajadores: TrabajadorCursosHSE[] = [];

  for (let i = 2; i < cursosRows.length; i++) {
    const row = cursosRows[i];
    if (!row || !row[0]) continue;

    const cedula = String(row[0]).trim();
    const nombre = String(row[1] || '').trim();
    const cargo = String(row[2] || '').trim();
    const departamento = String(row[3] || '').trim();
    const areaFisica = String(row[4] || '').trim();
    const estatusPersonal = String(row[5] || 'ACTIVO').trim();

    const cursosTrabajador: CursoEstadoTrabajador[] = [];

    detectedCourses.forEach(dc => {
      const matchedCat = catalogoDetalle.find(cat => 
        cat.nombre.localeCompare(dc.nombre, 'es', { sensitivity: 'base' }) === 0
      );
      const courseName = matchedCat ? matchedCat.nombre : dc.nombre;
      if (!statsCursos[courseName]) {
        statsCursos[courseName] = { aplican: 0, completados: 0, pendientes: 0, noAplica: 0 };
      }

      const baseCol = dc.startCol;
      const aplicaRaw = String(row[baseCol] || 'NO').toUpperCase();
      const completadoRaw = String(row[baseCol + 1] || '').toUpperCase();
      const fechaRaw = row[baseCol + 2];
      const certRaw = row[baseCol + 3];
      const estadoRaw = String(row[baseCol + 4] || '');

      const aplica = aplicaRaw.includes('SÍ') || aplicaRaw.includes('SI');
      const completado = completadoRaw.includes('SÍ') || completadoRaw.includes('SI') || estadoRaw.includes('Completado');

      let fecha = '';
      if (fechaRaw) {
        if (typeof fechaRaw === 'number') {
          const d = XLSX.SSF.parse_date_code(fechaRaw);
          if (d) {
            fecha = `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`;
          }
        } else {
          fecha = String(fechaRaw).trim();
        }
      }

      const certificadoUrl = certRaw ? String(certRaw).trim() : null;

      let estado: 'Completado' | 'Pendiente' | 'No aplica' = 'No aplica';
      if (aplica) {
        statsCursos[courseName].aplican++;
        if (completado) {
          estado = 'Completado';
          statsCursos[courseName].completados++;
        } else {
          estado = 'Pendiente';
          statsCursos[courseName].pendientes++;
        }
      } else {
        statsCursos[courseName].noAplica++;
        if (completado) {
          estado = 'Completado';
          statsCursos[courseName].completados++;
        }
      }

      cursosTrabajador.push({
        curso: courseName,
        aplica,
        completado,
        fecha,
        certificadoUrl,
        estado
      });
    });

    // Cursos del catálogo pendientes de columnas
    catalogoDetalle.forEach(cat => {
      if (!detectedCourses.some(dc => cat.nombre.localeCompare(dc.nombre, 'es', { sensitivity: 'base' }) === 0)) {
        if (!statsCursos[cat.nombre]) {
          statsCursos[cat.nombre] = { aplican: 0, completados: 0, pendientes: 0, noAplica: 0 };
        }
        let aplicaAuto = false;
        const cargoLower = cargo.toLowerCase();
        if (cat.tecnicosAplica && (cargoLower.includes('seguridad') || cargoLower.includes('sha') || cargoLower.includes('hse'))) {
          aplicaAuto = true;
        } else if (cat.supervisoresAplica && cargoLower.includes('supervisor')) {
          aplicaAuto = true;
        } else if (cat.cargosOperativos) {
          const palabras = cat.cargosOperativos.toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
          if (palabras.some(p => p && cargoLower.includes(p))) {
            aplicaAuto = true;
          }
        }

        if (aplicaAuto) {
          statsCursos[cat.nombre].aplican++;
          statsCursos[cat.nombre].pendientes++;
        } else {
          statsCursos[cat.nombre].noAplica++;
        }

        cursosTrabajador.push({
          curso: cat.nombre,
          aplica: aplicaAuto,
          completado: false,
          fecha: '',
          certificadoUrl: null,
          estado: aplicaAuto ? 'Pendiente' : 'No aplica'
        });
      }
    });

    trabajadores.push({
      cedula,
      nombre,
      cargo,
      departamento,
      areaFisica,
      estatusPersonal,
      cursos: cursosTrabajador,
      totalCursosAplica: cursosTrabajador.filter(c => c.aplica).length,
      totalCursosCompletados: cursosTrabajador.filter(c => c.completado).length
    });
  }

  const certificados: CertificadoVerificadoHSE[] = trabajadores.flatMap(t => 
    t.cursos
      .filter(c => c.certificadoUrl)
      .map((c, idx) => ({
        id: `cert-${t.cedula}-${idx}`,
        cedula: t.cedula,
        nombre: t.nombre,
        cargo: t.cargo,
        departamento: t.departamento,
        areaFisica: t.areaFisica,
        curso: c.curso,
        fechaEmision: c.fecha,
        certificadoUrl: c.certificadoUrl!,
        estado: 'Completado' as const
      }))
  );

  const departamentos = [...new Set(trabajadores.map(t => t.departamento))].sort().filter(Boolean);
  const areasFisicas = [...new Set(trabajadores.map(t => t.areaFisica))].sort().filter(Boolean);
  const nowStr = new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const result: CursosSyncResult = {
    trabajadores,
    certificados,
    catalogoNombres,
    catalogoDetalle,
    statsCursos,
    departamentos,
    areasFisicas,
    lastSync: `Hoy a las ${nowStr}`,
    source: 'live'
  };

  try {
    localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(result));
  } catch (e) {
    console.warn('[CursosSync] No se pudo guardar caché local completo:', e);
  }

  return result;
}
