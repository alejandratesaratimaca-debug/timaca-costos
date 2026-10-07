import { PLANES_CONTROL_INICIALES, MATRIZ_IPER_INICIAL } from '../src/data/realSeguridadData.ts';
import { TRABAJADORES_CURSOS_TIMACA } from '../src/data/realCertificadosData.ts';

const SUPABASE_URL = 'https://whbicbjvasvjufgjexxa.supabase.co';
const SUPABASE_KEY = 'sb_publishable_IVbzFr2TLWjMHKLogd4qzw_WU2ZwbNv';

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'resolution=merge-duplicates'
};

async function seedHse() {
  console.log('🚀 Sembrando datos de Seguridad HSE y Certificados en Supabase...');

  // 1. Planes de Control de Riesgos
  const planes = PLANES_CONTROL_INICIALES.map(p => ({
    codigo: p.idPlan,
    area: p.area,
    medida_control: p.medidaControl,
    jerarquia: p.nivelJerarquia,
    responsable: p.responsable,
    fecha_meta: p.fechaCompromiso && p.fechaCompromiso.includes('/') 
      ? p.fechaCompromiso.split('/').reverse().join('-') 
      : '2026-12-31',
    estado: p.estado === 'Ejecutado' || p.estado === 'Verificado' ? 'COMPLETADO' : 'EN PROCESO'
  }));

  const resPlanes = await fetch(`${SUPABASE_URL}/rest/v1/hse_planes_control?on_conflict=codigo`, {
    method: 'POST',
    headers,
    body: JSON.stringify(planes)
  });
  console.log(`Planes de control: ${resPlanes.status} (${planes.length} registros)`);

  // 2. Matriz IPER
  const iper = MATRIZ_IPER_INICIAL.map(m => ({
    codigo: m.id,
    area: m.area,
    proceso_actividad: m.puestoActividad,
    peligro: m.peligroIdentificado,
    riesgo_consecuencia: m.consecuenciaRiesgo || 'Lesión o daño ocupacional',
    probabilidad_inicial: m.np || 1,
    severidad_inicial: m.nc || 10,
    nivel_riesgo_inicial: m.ni || 'II',
    medidas_control_existentes: m.controlesExistentes || 'Uso de EPP y procedimiento seguro',
    jerarquia_control: m.nivelJerarquia || '4 · Control administrativo',
    probabilidad_residual: m.npResidual || 1,
    severidad_residual: m.ncResidual || 10,
    nivel_riesgo_residual: m.niResidual || 'III',
    estado: 'CONTROLADO'
  }));

  const resIper = await fetch(`${SUPABASE_URL}/rest/v1/hse_matriz_iper?on_conflict=codigo`, {
    method: 'POST',
    headers,
    body: JSON.stringify(iper)
  });
  console.log(`Matriz IPER: ${resIper.status} (${iper.length} evaluaciones)`);

  // 3. Trabajadores Cursos (muestra de 50 trabajadores clave)
  const trabajadoresMuestra = TRABAJADORES_CURSOS_TIMACA.slice(0, 50).map(t => ({
    cedula: t.cedula,
    nombre: t.nombre,
    cargo: t.cargo,
    departamento: t.departamento,
    area_fisica: t.areaFisica,
    cursos: t.cursos || [],
    estado_general: t.totalCursosCompletados >= t.totalCursosAplica && t.totalCursosAplica > 0 ? 'EN REGLA' : 'PENDIENTE'
  }));

  const resTrabajadores = await fetch(`${SUPABASE_URL}/rest/v1/hse_cursos_trabajadores?on_conflict=cedula`, {
    method: 'POST',
    headers,
    body: JSON.stringify(trabajadoresMuestra)
  });
  console.log(`Trabajadores cursos: ${resTrabajadores.status} (${trabajadoresMuestra.length} expedientes)`);

  console.log('🎉 ¡Datos oficiales de HSE y Certificados sincronizados en Supabase!');
}

seedHse();
