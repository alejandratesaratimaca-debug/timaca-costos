# Integración de Dotación en SIGMA

Qué cambia en SIGMA:

- **Inicio de sesión con Supabase Auth.** Cada persona entra con su correo y su contraseña. Ya no hay contraseñas
  dentro del código ni claves maestras (`src/lib/auth.ts`, `LoginPortadaView.tsx`, `App.tsx`).
- **Usuarios en Supabase.** Roles y permisos viven en la tabla `sigma_perfiles`. La pantalla de usuarios los lee y los
  guarda ahí. Las altas se hacen invitando a la persona desde Supabase. Se quitó «entrar como otro usuario».
- **Módulo de Dotación real.** `DotacionModuleView.tsx` muestra la aplicación de dotación, publicada bajo `/dotacion` en
  el mismo dominio (`vercel.json`), con la misma sesión.
- **Tablas cerradas.** Las tablas de herramientas y seguridad pasan de «permitir todo» a «solo usuarios con sesión».

## Pasos, en este orden

1. **Supabase, SQL Editor:** ejecuta `supabase/migrations/20261008_sigma_acceso_y_dotacion.sql`.
2. **Supabase, Authentication, Sign In / Providers:** deja activo el correo y **desactiva** «Allow new users to sign
   up». Así solo entran las personas invitadas.
3. **Supabase, Authentication, Users:** crea a cada persona con «Invite user» (le llega un correo para poner su
   contraseña) o con «Add user» y una contraseña temporal. Usa los correos de `supabase/perfiles_iniciales.sql`;
   si alguno no es real, cámbialo en los dos lados.
4. **Supabase, SQL Editor:** ejecuta `supabase/perfiles_iniciales.sql` para darles su rol, sus permisos y su rol en
   Dotación (`rol_dotacion`).
5. **Supabase, Storage:** crea un bucket **privado** llamado `dotacion`.
6. **Dotación en Vercel:** publica el proyecto de dotación siguiendo su `docs/SIGMA_VERCEL_SUPABASE.md`. Si su dirección
   no es `https://sigma-dotacion.vercel.app`, cámbiala en `vercel.json` de SIGMA (dos reglas).
7. **SIGMA en Vercel:** sube estos cambios y vuelve a publicar.

## Prueba de aceptación

- Entrar con un correo y su contraseña funciona; con una contraseña equivocada, no.
- Recargar la página mantiene la sesión; «Cerrar sesión» la termina también en Dotación.
- Un usuario «Observador» no puede guardar cambios en la pantalla de usuarios.
- Dotación abre dentro de SIGMA sin pedir contraseña para quien tenga `rol_dotacion`; quien no lo tenga ve el aviso de
  que no tiene acceso.

## Pendiente de seguridad (siguiente fase)

Los datos de costos, mano de obra y certificados siguen dentro del código, en `src/data`, unos 27 MB. Mientras estén
ahí, cualquiera que tenga el enlace puede descargarlos aunque no inicie sesión, porque viajan con la página. La
solución es pasarlos a tablas de Supabase con permisos por rol y que la página los pida después de iniciar sesión.
Hasta entonces, conviene no compartir el enlace fuera de la empresa.
