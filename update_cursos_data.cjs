const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'Cursos_Completo.xlsx');
if (!fs.existsSync(filePath)) {
  console.error('No se encontró Cursos_Completo.xlsx');
  process.exit(1);
}

const wb = XLSX.readFile(filePath);

// 1. Extraer Catálogo de Cursos
const wsCat = wb.Sheets['CATALOGO_CURSOS'];
const catRaw = XLSX.utils.sheet_to_json(wsCat, { header: 1 });
const catalogoCursos = [];

for (let i = 1; i < catRaw.length; i++) {
  const row = catRaw[i];
  if (!row || !row[0]) continue;
  const nombre = String(row[0]).trim();
  if (nombre.toLowerCase() === 'otro') continue; // omitir placeholders vacíos

  const tecnicosAplica = Boolean(row[1] && String(row[1]).includes('✅'));
  const supervisoresAplica = Boolean(row[2] && String(row[2]).includes('✅'));
  const cargosOperativos = String(row[3] || '').trim();

  catalogoCursos.push({
    nombre,
    tecnicosAplica,
    supervisoresAplica,
    cargosOperativos
  });
}

console.log('Catálogo de Cursos extraído (Total ' + catalogoCursos.length + ' cursos):');
console.table(catalogoCursos.map(c => ({
  Curso: c.nombre,
  Tecnicos: c.tecnicosAplica ? '✅' : '❌',
  Supervisores: c.supervisoresAplica ? '✅' : '❌',
  Operativos: c.cargosOperativos.slice(0, 40) + '...'
})));

// 2. Extraer Cursos de los Trabajadores
const wsCursos = wb.Sheets['CURSOS'];
const cursosRows = XLSX.utils.sheet_to_json(wsCursos, { header: 1 });

// Detección dinámica de cursos por las columnas de la fila 1 y 2
const headerRow0 = cursosRows[0] || [];
const headerRow1 = cursosRows[1] || [];

// Identificar los cursos en las columnas (inician desde col 6)
const detectedCourses = [];
for (let c = 6; c < headerRow0.length; c += 5) {
  const cName = headerRow0[c] ? String(headerRow0[c]).trim() : '';
  if (cName) {
    detectedCourses.push({
      nombre: cName,
      startCol: c
    });
  }
}

console.log('\nCursos detectados con columnas en la matriz (Total ' + detectedCourses.length + '):');
detectedCourses.forEach((dc, idx) => console.log(` ${idx + 1}. ${dc.nombre} (Col ${dc.startCol})`));

const courseNamesList = catalogoCursos.map(c => c.nombre);

const trabajadores = [];
const statsCursos = {};
catalogoCursos.forEach(c => {
  statsCursos[c.nombre] = { aplican: 0, completados: 0, pendientes: 0, noAplica: 0 };
});

for (let i = 2; i < cursosRows.length; i++) {
  const row = cursosRows[i];
  if (!row || !row[0]) continue;

  const cedula = String(row[0]).trim();
  const nombre = String(row[1] || '').trim();
  const cargo = String(row[2] || '').trim();
  const departamento = String(row[3] || '').trim();
  const areaFisica = String(row[4] || '').trim();
  const estatusPersonal = String(row[5] || 'ACTIVO').trim();

  const cursosTrabajador = [];

  // Recorrer los cursos que tienen columnas en la hoja
  detectedCourses.forEach(dc => {
    // Buscar la clave correspondiente en catalogo
    const matchedCat = catalogoCursos.find(cat => 
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

    let estado = 'No aplica';
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

  // Para los cursos del catálogo que aún no tienen columnas en la matriz, añadirlos con estado base
  catalogoCursos.forEach(cat => {
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

console.log(`\nTotal trabajadores procesados: ${trabajadores.length}`);
console.log('Estadísticas finales por curso:');
console.table(statsCursos);

const depts = [...new Set(trabajadores.map(t => t.departamento))].sort();
const areas = [...new Set(trabajadores.map(t => t.areaFisica))].sort();

// Guardar JSON
const outJsonPath = path.join(__dirname, 'src', 'data', 'realCursosData.json');
fs.writeFileSync(outJsonPath, JSON.stringify({
  cursosCatalogo: courseNamesList,
  catalogoCompleto: catalogoCursos,
  statsCursos,
  departamentos: depts,
  areasFisicas: areas,
  trabajadores
}, null, 2));
console.log(`Guardado ${outJsonPath} con éxito!`);

// Generar realCertificadosData.ts
const tsContent = `/**
 * Sistema de Control de Cursos de Seguridad Industrial — TIMACA
 * Google Sheet Oficial: https://docs.google.com/spreadsheets/d/1HLg7w29tI9XGVxwLtCE-OHQmF-JnnwoaF3OF4o_7kS8/edit?gid=1730870257
 * Última sincronización automática: ${new Date().toISOString()}
 */

export interface ItemCatalogoCurso {
  nombre: string;
  tecnicosAplica: boolean;
  supervisoresAplica: boolean;
  cargosOperativos: string;
}

export interface CursoEstadoTrabajador {
  curso: string;
  aplica: boolean;
  completado: boolean;
  fecha: string;
  certificadoUrl: string | null;
  estado: 'Completado' | 'Pendiente' | 'No aplica';
}

export interface TrabajadorCursosHSE {
  cedula: string;
  nombre: string;
  cargo: string;
  departamento: string;
  areaFisica: string;
  estatusPersonal: string;
  cursos: CursoEstadoTrabajador[];
  totalCursosAplica: number;
  totalCursosCompletados: number;
}

export interface CertificadoVerificadoHSE {
  id: string;
  cedula: string;
  nombre: string;
  cargo: string;
  departamento: string;
  areaFisica: string;
  curso: string;
  fechaEmision: string;
  certificadoUrl: string;
  estado: 'Completado' | 'Vigente';
}

export const CATALOGO_CURSOS_NOMBRES: string[] = ${JSON.stringify(courseNamesList, null, 2)};

export const CATALOGO_CURSOS_DETALLE: ItemCatalogoCurso[] = ${JSON.stringify(catalogoCursos, null, 2)};

export const STATS_CURSOS_TOTALES: Record<string, { aplican: number; completados: number; pendientes: number; noAplica: number }> = ${JSON.stringify(statsCursos, null, 2)};

export const DEPARTAMENTOS_LISTA: string[] = ${JSON.stringify(depts.filter(Boolean), null, 2)};

export const AREAS_FISICAS_LISTA: string[] = ${JSON.stringify(areas.filter(Boolean), null, 2)};

export const TRABAJADORES_CURSOS_TIMACA: TrabajadorCursosHSE[] = ${JSON.stringify(trabajadores, null, 2)};

export const CERTIFICADOS_VERIFICADOS_DRIVE: CertificadoVerificadoHSE[] = TRABAJADORES_CURSOS_TIMACA.flatMap(t => 
  t.cursos
    .filter(c => c.certificadoUrl)
    .map((c, idx) => ({
      id: \`cert-\${t.cedula}-\${idx}\`,
      cedula: t.cedula,
      nombre: t.nombre,
      cargo: t.cargo,
      departamento: t.departamento,
      areaFisica: t.areaFisica,
      curso: c.curso,
      fechaEmision: c.fecha,
      certificadoUrl: c.certificadoUrl,
      estado: 'Completado' as const
    }))
);
`;

const outTsPath = path.join(__dirname, 'src', 'data', 'realCertificadosData.ts');
fs.writeFileSync(outTsPath, tsContent);
console.log(`Guardado ${outTsPath} con éxito!`);
