-- SIGMA: acceso con Supabase Auth, perfiles por rol, cierre de las tablas abiertas y espacio para Dotación.
-- Ejecutar una vez en Supabase, SQL Editor. Se puede repetir sin duplicar.

-- 1. Perfiles de usuario (rol y permisos de SIGMA, y rol en Dotación)
create table if not exists public.sigma_perfiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  correo text not null unique,
  nombre text,
  usuario text,
  cargo text,
  departamento text,
  rol text not null default 'Observador',
  estado text not null default 'Activo' check (estado in ('Activo', 'Inactivo')),
  permisos jsonb not null default '{}'::jsonb,
  avatar_color text,
  cuentas_asignadas text[],
  proyectos_nombres text[],
  rol_dotacion text check (rol_dotacion in ('administrador', 'rrhh', 'almacen', 'consulta')),
  ultimo_acceso timestamptz,
  creado_en timestamptz not null default now()
);
alter table public.sigma_perfiles enable row level security;

create or replace function public.sigma_es_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.sigma_perfiles
                 where user_id = auth.uid() and rol = 'Administrador' and estado = 'Activo');
$$;

drop policy if exists "Perfil propio o administración" on public.sigma_perfiles;
create policy "Perfil propio o administración" on public.sigma_perfiles
  for select to authenticated using (user_id = auth.uid() or public.sigma_es_admin());
drop policy if exists "Solo administración modifica perfiles" on public.sigma_perfiles;
create policy "Solo administración modifica perfiles" on public.sigma_perfiles
  for update to authenticated using (public.sigma_es_admin()) with check (public.sigma_es_admin());

-- Último acceso: cada usuario marca el suyo sin poder tocar su rol.
create or replace function public.sigma_marcar_acceso()
returns void language sql security definer set search_path = public as $$
  update public.sigma_perfiles set ultimo_acceso = now() where user_id = auth.uid();
$$;
grant execute on function public.sigma_marcar_acceso() to authenticated;

-- Cada usuario nuevo de Supabase Auth recibe un perfil sin permisos; la administración le asigna rol.
create or replace function public.sigma_crear_perfil()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.sigma_perfiles (user_id, correo, nombre)
  values (new.id, lower(new.email), coalesce(new.raw_user_meta_data ->> 'nombre', split_part(new.email, '@', 1)))
  on conflict (user_id) do nothing;
  return new;
end;
$$;
drop trigger if exists sigma_crear_perfil on auth.users;
create trigger sigma_crear_perfil after insert on auth.users
  for each row execute function public.sigma_crear_perfil();

-- Perfiles para usuarios que ya existían en Auth antes de esta migración.
insert into public.sigma_perfiles (user_id, correo, nombre)
select id, lower(email), split_part(email, '@', 1) from auth.users
on conflict (user_id) do nothing;

-- 2. Las tablas de herramientas y seguridad dejan de estar abiertas al público: solo usuarios con sesión.
do $$
declare t text;
begin
  foreach t in array array['herramientas_almacenes', 'herramientas_catalogo', 'herramientas_existencias',
                           'herramientas_vales', 'herramientas_movimientos', 'hse_cursos_trabajadores',
                           'hse_certificados', 'hse_matriz_iper', 'hse_planes_control'] loop
    if to_regclass('public.' || t) is not null then
      execute format('drop policy if exists %I on public.%I', 'Permitir todo ' || t, t);
      execute format('drop policy if exists %I on public.%I', 'Usuarios con sesión', t);
      execute format('create policy %I on public.%I for all to authenticated using (true) with check (true)',
                     'Usuarios con sesión', t);
    end if;
  end loop;
end;
$$;

-- 3. Dotación guarda sus tablas en su propio esquema; la clave pública no lo alcanza.
create schema if not exists dotacion;
revoke all on schema dotacion from anon, authenticated;
