/**
 * Inicio de sesión de SIGMA con Supabase Auth.
 * Cada persona entra con su correo y su contraseña; el rol y los permisos viven en public.sigma_perfiles
 * (ver supabase/migrations/20261008_sigma_acceso_y_dotacion.sql). Ninguna contraseña se guarda en el código.
 */
import { supabase } from './supabaseClient';
import type { PermisosUsuario, RolUsuario, UsuarioSistema } from '../types/usuarios';

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
  const sb = requerirSupabase();
  const { data, error } = await sb.auth.signInWithPassword({ email: correo.trim().toLowerCase(), password: clave });
  if (error || !data.user) throw new Error(traducir(error?.message || 'No se pudo iniciar sesión.'));
  try {
    const usuario = await cargarPerfil(data.user.id);
    if (usuario.estado === 'Inactivo') throw new Error('Este usuario está inactivo. Contacta a la administradora.');
    await sb.rpc('sigma_marcar_acceso');
    return usuario;
  } catch (e) {
    await sb.auth.signOut();
    throw e;
  }
}

export async function restaurarSesion(): Promise<UsuarioSistema | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  if (!data.session) return null;
  try {
    const usuario = await cargarPerfil(data.session.user.id);
    return usuario.estado === 'Activo' ? usuario : null;
  } catch {
    return null;
  }
}

export async function cerrarSesion(): Promise<void> {
  try {
    await fetch('/dotacion/sso/salir', { credentials: 'same-origin' });
  } catch {
    // Dotación puede no estar disponible; la sesión de SIGMA se cierra igual.
  }
  if (supabase) await supabase.auth.signOut();
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
