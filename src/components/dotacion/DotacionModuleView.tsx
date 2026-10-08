import React, { useState } from 'react';
import { ExternalLink, RotateCw, Shirt } from 'lucide-react';
import { UsuarioSistema } from '../../types/usuarios';

interface DotacionModuleViewProps {
  currentUser: UsuarioSistema;
  onVolver?: () => void;
}

/**
 * Dotación es una aplicación aparte (Python) publicada bajo /dotacion en el mismo dominio de SIGMA
 * (ver la reescritura en vercel.json). Toma la sesión de Supabase de SIGMA: no pide otra contraseña.
 */
const RUTA_DOTACION = (import.meta.env.VITE_DOTACION_RUTA as string | undefined) || '/dotacion/';

export const DotacionModuleView: React.FC<DotacionModuleViewProps> = () => {
  const [cargando, setCargando] = useState(true);
  const [version, setVersion] = useState(0);

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] min-h-[560px] bg-white border border-[var(--borde)] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-2 border-b border-[var(--borde)] bg-[var(--fondo-menu)]">
        <div className="flex items-center gap-2 font-semibold text-[var(--navy)]">
          <Shirt className="w-4 h-4" /> Dotación de personal
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => { setCargando(true); setVersion((v) => v + 1); }}
            className="flex items-center gap-1 px-2.5 py-1 rounded border border-[var(--borde)] bg-white hover:bg-slate-50 text-[var(--texto-2)]"
          >
            <RotateCw className="w-3.5 h-3.5" /> Recargar
          </button>
          <a
            href={RUTA_DOTACION}
            target="_blank"
            rel="noopener"
            className="flex items-center gap-1 px-2.5 py-1 rounded border border-[var(--borde)] bg-white hover:bg-slate-50 text-[var(--texto-2)]"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Abrir en otra pestaña
          </a>
        </div>
      </div>
      {cargando && <div className="px-4 py-3 text-[var(--texto-3)]">Cargando dotación…</div>}
      <iframe
        key={version}
        title="Dotación de personal"
        src={`${RUTA_DOTACION}?embebido=1`}
        className="flex-1 w-full border-0"
        onLoad={() => setCargando(false)}
      />
    </div>
  );
};
