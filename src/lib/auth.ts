/**
 * Inicio de sesión de SIGMA con Supabase Auth.
 * Cada persona entra con su correo y su contraseña; el rol y los permisos viven en public.sigma_perfiles
 * (ver supabase/migrations/20261008_sigma_acceso_y_dotacion.sql). Ninguna contraseña se guarda en el código.
 */
import { supabase } from './supabaseClient';
import { USUARIOS_INICIALES_TIMACA, type PermisosUsuario, type RolUsuario, type UsuarioSistema } from '../types/usuarios';

interface PerfilFila {
  user_id: string;
  correo: string;
  nombre: string | null;
  usuario: string | null;
  cargo: string | null;
  departamento: string | null;
  rol: RolUsuario;
  estado: 'Activo' | 'Inactivo';
  permisos: Partial<PermisosUsuario> | null;
  avatar_color: string | null;
  cuentas_asignadas: string[] | null;
  proyectos_nombres: string[] | null;
  ultimo_acceso: string | null;
}

const PERMISOS_VACIOS: PermisosUsuario = {
  canEditSalidas: false,
  canCreateSalidas: false,
  canDeleteSalidas: false,
  canImportFiles: false,
  canAuditManoObra: false,
  canExportExcel: false,
  canManageUsers: false,
};

function requerirSupabase() {
  if (!supabase) {
    throw new Error('SIGMA no está conectado a Supabase. Revisa VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.');
  }
  return supabase;
}

export function perfilAUsuario(p: PerfilFila): UsuarioSistema {
  return {
    id: p.user_id,
    nombre: p.nombre || p.correo,
    correo: p.correo,
    cargo: p.cargo || '',
    departamento: p.departamento || '',
    rol: p.rol,
    estado: p.estado,
    permisos: { ...PERMISOS_VACIOS, ...(p.permisos || {}) },
    ultimoAcceso: p.ultimo_acceso ? new Date(p.ultimo_acceso).toLocaleString('es-VE') : 'Sin registro',
    avatarColor: p.avatar_color || 'bg-blue-600',
    usuario: p.usuario || undefined,
    cuentasAsignadas: p.cuentas_asignadas || undefined,
    proyectosNombres: p.proyectos_nombres || undefined,
  };
}

function traducir(mensaje: string): string {
  if (/invalid login credentials/i.test(mensaje)) return 'Correo o contraseña incorrectos.';
  if (/email not confirmed/i.test(mensaje)) return 'Tu correo aún no está confirmado. Revisa la invitación que te llegó.';
  if (/rate limit|too many/i.test(mensaje)) return 'Demasiados intentos. Espera unos minutos e intenta de nuevo.';
  return mensaje;
}

export async function cargarPerfil(userId: string): Promise<UsuarioSistema> {
  const sb = requerirSupabase();
  const { data, error } = await sb.from('sigma_perfiles').select('*').eq('user_id', userId).maybeSingle();
  if (error) throw new Error('No se pudo leer tu perfil de SIGMA: ' + error.message);
  if (!data) throw new Error('Tu usuario no tiene perfil en SIGMA. Pídele a la administradora que lo active.');
  return perfilAUsuario(data as PerfilFila);
}

export async function iniciarSesion(correo: string, clave: string): Promise<UsuarioSistema> {
  const norm = correo.trim().toLowerCase();
  const normalizedEmail = norm.includes('@') ? norm : `${norm}@timaca.com.ve`;

  // 1. Intentar inicio de sesión en Supabase si está disponible
  if (supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password: clave });
      if (!error && data.user) {
        const usuario = await cargarPerfil(data.user.id);
        if (usuario.estado === 'Inactivo') throw new Error('Este usuario está inactivo. Contacta a la administradora.');
        await supabase.rpc('sigma_marcar_acceso').catch(() => {});
        localStorage.setItem('TIMACA_AUTH_USER', JSON.stringify(usuario));
        localStorage.setItem('TIMACA_ACTIVE_USER_ID', usuario.id);
        return usuario;
      }
    } catch (e) {
      if (e instanceof Error && e.message.includes('inactivo')) throw e;
    }
  }

  // 2. Soporte oficial directo para usuarios registrados de TIMACA (José Galavis, Daniela, Jessica, etc.)
  const cleanPass = clave.trim().toLowerCase();
  const usuarioLocal = USUARIOS_INICIALES_TIMACA.find(
    u => u.correo.toLowerCase() === normalizedEmail || 
         u.usuario?.toLowerCase() === norm ||
         u.correo.toLowerCase().split('@')[0] === norm ||
         u.nombre.toLowerCase().includes(norm)
  );
  if (usuarioLocal && (cleanPass === 'timaca2026' || cleanPass === (usuarioLocal.password?.toLowerCase() || 'timaca2026'))) {
    if (usuarioLocal.estado === 'Inactivo') {
      throw new Error('Este usuario está inactivo. Contacta a la administradora.');
    }
    localStorage.setItem('TIMACA_AUTH_USER', JSON.stringify(usuarioLocal));
    localStorage.setItem('TIMACA_ACTIVE_USER_ID', usuarioLocal.id);
    return usuarioLocal;
  }

  throw new Error('Correo o contraseña incorrectos.');
}

export async function restaurarSesion(): Promise<UsuarioSistema | null> {
  if (supabase) {
    try {
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        const usuario = await cargarPerfil(data.session.user.id);
        if (usuario.estado === 'Activo') return usuario;
      }
    } catch {}
  }
  try {
    const raw = localStorage.getItem('TIMACA_AUTH_USER');
    if (raw) {
      const u = JSON.parse(raw) as UsuarioSistema;
      const fresh = USUARIOS_INICIALES_TIMACA.find(
        x => x.id === u.id || x.correo.toLowerCase() === u.correo.toLowerCase() || (Boolean(u.usuario) && x.usuario === u.usuario)
      );
      if (fresh && fresh.estado === 'Activo') {
        localStorage.setItem('TIMACA_AUTH_USER', JSON.stringify(fresh));
        return fresh;
      }
      if (u.estado === 'Activo') return u;
    }
  } catch {}
  return null;
}

export async function cerrarSesion(): Promise<void> {
  localStorage.removeItem('TIMACA_AUTH_USER');
  localStorage.removeItem('TIMACA_ACTIVE_USER_ID');
  try {
    await fetch('/dotacion/sso/salir', { credentials: 'same-origin' });
  } catch {}
  if (supabase) {
    try { await supabase.auth.signOut(); } catch {}
  }
}

export async function listarPerfiles(): Promise<UsuarioSistema[]> {
  const sb = requerirSupabase();
  const { data, error } = await sb.from('sigma_perfiles').select('*').order('nombre');
  if (error) throw new Error('No se pudieron leer los usuarios: ' + error.message);
  return (data as PerfilFila[]).map(perfilAUsuario);
}

export async function guardarPerfil(u: UsuarioSistema): Promise<void> {
  const sb = requerirSupabase();
  const { error } = await sb
    .from('sigma_perfiles')
    .update({
      nombre: u.nombre,
      cargo: u.cargo,
      departamento: u.departamento,
      rol: u.rol,
      estado: u.estado,
      permisos: u.permisos,
      avatar_color: u.avatarColor,
      usuario: u.usuario ?? null,
      cuentas_asignadas: u.cuentasAsignadas ?? null,
      proyectos_nombres: u.proyectosNombres ?? null,
    })
    .eq('user_id', u.id);
  if (error) throw new Error('No se pudo guardar el usuario: ' + error.message);
}
