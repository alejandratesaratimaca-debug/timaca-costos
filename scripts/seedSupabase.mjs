const SUPABASE_URL = 'https://whbicbjvasvjufgjexxa.supabase.co';
const SUPABASE_KEY = 'sb_publishable_IVbzFr2TLWjMHKLogd4qzw_WU2ZwbNv';

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'resolution=merge-duplicates'
};

const CATALOGO_HERRAMIENTAS = [
  { codigo: 'HE000101', descripcion: 'Llave combinada 3/4"', modulo: 'HERRAMIENTA', categoria: 'Llaves', marca: 'STANLEY', modelo: '87-076', serial: '', tipo_a: false, calibracion_requerida: false },
  { codigo: 'HE000102', descripcion: 'Llave combinada 1/2"', modulo: 'HERRAMIENTA', categoria: 'Llaves', marca: 'STANLEY', modelo: '87-072', serial: '', tipo_a: false, calibracion_requerida: false },
  { codigo: 'HE000110', descripcion: 'Señorita de cadena 1 ton', modulo: 'HERRAMIENTA', categoria: 'Izaje', marca: 'TRUPER', modelo: 'POLI-1', serial: '', tipo_a: false, calibracion_requerida: true },
  { codigo: 'HE000120', descripcion: 'Alicate universal 8"', modulo: 'HERRAMIENTA', categoria: 'Alicates', marca: 'TRUPER', modelo: 'T201-8', serial: '', tipo_a: false, calibracion_requerida: false },
  { codigo: 'HE000130', descripcion: 'Llave ajustable 12"', modulo: 'HERRAMIENTA', categoria: 'Llaves', marca: 'TOTAL', modelo: 'THT101126', serial: '', tipo_a: false, calibracion_requerida: false },
  { codigo: 'HE000140', descripcion: 'Martillo de bola 2 lb', modulo: 'HERRAMIENTA', categoria: 'Golpe', marca: 'TRUPER', modelo: 'MB-32F', serial: '', tipo_a: false, calibracion_requerida: false },
  { codigo: 'HE000150', descripcion: 'Juego de destornilladores 6 piezas', modulo: 'HERRAMIENTA', categoria: 'Destornilladores', marca: 'STANLEY', modelo: 'STHT65199', serial: '', tipo_a: false, calibracion_requerida: false },
  { codigo: 'HE000160', descripcion: 'Arco de segueta 12"', modulo: 'HERRAMIENTA', categoria: 'Corte', marca: 'TRUPER', modelo: 'AS-12', serial: '', tipo_a: false, calibracion_requerida: false },
  { codigo: 'HE000170', descripcion: 'Nivel de aluminio 24"', modulo: 'HERRAMIENTA', categoria: 'Medición', marca: 'STANLEY', modelo: '42-468', serial: '', tipo_a: false, calibracion_requerida: true },
  { codigo: 'HE000180', descripcion: 'Cinta métrica 8 m', modulo: 'HERRAMIENTA', categoria: 'Medición', marca: 'STANLEY', modelo: '33-428', serial: '', tipo_a: false, calibracion_requerida: false },
  { codigo: 'HE000521-1', descripcion: 'Esmeril angular 7" (Serial 1)', modulo: 'HERRAMIENTA', categoria: 'Eléctricas', marca: 'BOSCH', modelo: 'GWS 7-115', serial: 'SN-4482190', tipo_a: false, calibracion_requerida: false },
  { codigo: 'HE000521-2', descripcion: 'Esmeril angular 7" (Serial 2)', modulo: 'HERRAMIENTA', categoria: 'Eléctricas', marca: 'BOSCH', modelo: 'GWS 7-115', serial: 'SN-4482191', tipo_a: false, calibracion_requerida: false },
  { codigo: 'HE000600', descripcion: 'Taladro percutor 1/2"', modulo: 'HERRAMIENTA', categoria: 'Eléctricas', marca: 'DEWALT', modelo: 'DWD024', serial: 'SN-7781001', tipo_a: false, calibracion_requerida: false },
  { codigo: 'HE000700', descripcion: 'Máquina de soldar inverter 250 A', modulo: 'HERRAMIENTA', categoria: 'Soldadura', marca: 'LINCOLN', modelo: 'Invertec V275', serial: 'LN-250-0091', tipo_a: true, calibracion_requerida: true },
  { codigo: 'HE000710', descripcion: 'Equipo de oxicorte completo', modulo: 'HERRAMIENTA', categoria: 'Soldadura', marca: 'HARRIS', modelo: 'Ironworker', serial: 'HR-3301', tipo_a: true, calibracion_requerida: true },
  { codigo: 'CI000101-1', descripcion: 'Cilindro de oxígeno industrial 6 m³', modulo: 'CILINDRO', categoria: 'Oxígeno', marca: 'AGA', modelo: '6 m³', serial: 'OX-0001', tipo_a: false, calibracion_requerida: false },
  { codigo: 'CI000101-2', descripcion: 'Cilindro de oxígeno industrial 6 m³', modulo: 'CILINDRO', categoria: 'Oxígeno', marca: 'AGA', modelo: '6 m³', serial: 'OX-0002', tipo_a: false, calibracion_requerida: false },
  { codigo: 'CI000201', descripcion: 'Cilindro de acetileno 4 m³', modulo: 'CILINDRO', categoria: 'Acetileno', marca: 'AGA', modelo: '4 m³', serial: 'AC-0001', tipo_a: false, calibracion_requerida: false },
  { codigo: 'CI000301', descripcion: 'Cilindro de argón 10 m³', modulo: 'CILINDRO', categoria: 'Argón', marca: 'PRAXAIR', modelo: '10 m³', serial: 'AR-0001', tipo_a: false, calibracion_requerida: false },
  { codigo: 'EP000101', descripcion: 'Casco de seguridad V-Gard', modulo: 'EPP', categoria: 'Protección de cabeza', marca: 'MSA', modelo: 'V-Gard', serial: '', tipo_a: false, calibracion_requerida: false },
  { codigo: 'EP000201', descripcion: 'Botas de seguridad punta de acero T-42', modulo: 'EPP', categoria: 'Calzado', marca: 'WESTLAND', modelo: 'Industrial', serial: '', tipo_a: false, calibracion_requerida: false },
  { codigo: 'EP000202', descripcion: 'Botas de seguridad punta de acero T-40', modulo: 'EPP', categoria: 'Calzado', marca: 'WESTLAND', modelo: 'Industrial', serial: '', tipo_a: false, calibracion_requerida: false },
  { codigo: 'EP000301', descripcion: 'Lentes de seguridad claros Virtua', modulo: 'EPP', categoria: 'Protección visual', marca: '3M', modelo: 'Virtua', serial: '', tipo_a: false, calibracion_requerida: false },
  { codigo: 'EP000401', descripcion: 'Guantes de carnaza 16"', modulo: 'EPP', categoria: 'Protección de manos', marca: 'STEELPRO', modelo: 'Carnaza', serial: '', tipo_a: false, calibracion_requerida: false }
];

async function seed() {
  console.log('🚀 Iniciando sembrado vía REST en Supabase TIMACA...');

  // 1. Catálogo
  const resCat = await fetch(`${SUPABASE_URL}/rest/v1/herramientas_catalogo?on_conflict=codigo`, {
    method: 'POST',
    headers,
    body: JSON.stringify(CATALOGO_HERRAMIENTAS)
  });
  if (!resCat.ok) {
    console.error('Error catálogo:', await resCat.text());
  } else {
    console.log('Catálogo status:', resCat.status, resCat.statusText);
  }

  // Obtener IDs
  const resGet = await fetch(`${SUPABASE_URL}/rest/v1/herramientas_catalogo?select=id,codigo`, { headers });
  const catalogo = await resGet.json();
  console.log(`✅ ${catalogo.length} ítems en catálogo.`);

  // 2. Existencias
  const existencias = [];
  for (const it of catalogo) {
    existencias.push({
      almacen_codigo: 'TALLER',
      item_id: it.id,
      disponible: 10,
      prestado: 2,
      asignado: 1
    });
    existencias.push({
      almacen_codigo: 'PALUA',
      item_id: it.id,
      disponible: 5,
      prestado: 1,
      asignado: 0
    });
  }

  const resExi = await fetch(`${SUPABASE_URL}/rest/v1/herramientas_existencias?on_conflict=almacen_codigo,item_id`, {
    method: 'POST',
    headers,
    body: JSON.stringify(existencias)
  });
  console.log('Existencias status:', resExi.status, resExi.statusText);

  // 3. Vale inicial
  const vale = {
    numero: 'PRH-2026-0001',
    tipo: 'PRH',
    origen: 'TALLER',
    destino: 'Frente Palúa PMH - Muelle',
    responsable_nombre: 'Jesús Marcano',
    responsable_cedula: 'V-19.555.666',
    responsable_cargo: 'Mecánico de Equipo Pesado',
    supervisor: 'Roberto Salazar',
    proyecto: 'OT-402 Planta Pellas',
    cuenta: 'TTE-C-0681',
    fecha_requerida: '2026-10-01',
    fecha_devolucion: '2026-10-31',
    estatus: 'VIGENTE',
    observaciones: 'Herramientas para overhaul de línea 2',
    lineas: [
      { codigo: 'HE000101', descripcion: 'Llave combinada 3/4"', cantidad: 2 },
      { codigo: 'HE000521-1', descripcion: 'Esmeril angular 7"', cantidad: 1 }
    ]
  };

  const resVale = await fetch(`${SUPABASE_URL}/rest/v1/herramientas_vales?on_conflict=numero`, {
    method: 'POST',
    headers,
    body: JSON.stringify(vale)
  });
  console.log('Vale inicial status:', resVale.status, resVale.statusText);

  console.log('🎉 ¡Base de datos poblada exitosamente en Supabase!');
}

seed();
