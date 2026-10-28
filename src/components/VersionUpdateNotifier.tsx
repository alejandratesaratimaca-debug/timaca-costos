import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Sparkles, X } from 'lucide-react';

interface VersionInfo {
  version: number;
  timestamp: string;
  buildDate?: string;
}

export const VersionUpdateNotifier: React.FC = () => {
  const [initialVersion, setInitialVersion] = useState<number | null>(null);
  const [hasNewVersion, setHasNewVersion] = useState<boolean>(false);
  const [nuevaFecha, setNuevaFecha] = useState<string>('');
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Check version against server
  const checkVersion = useCallback(async () => {
    try {
      const response = await fetch(`/version.json?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
      });
      if (!response.ok) return;

      const data: VersionInfo = await response.json();
      if (!data || !data.version) return;

      setInitialVersion((prev) => {
        if (prev === null) {
          return data.version;
        }
        if (data.version > prev) {
          setHasNewVersion(true);
          setNuevaFecha(data.buildDate || 'Hace un momento');
        }
        return prev;
      });
    } catch {
      // Ignorar errores de red temporales
    }
  }, []);

  useEffect(() => {
    // Primera comprobación al montar
    checkVersion();

    // Comprobar cada 45 segundos
    const interval = setInterval(checkVersion, 45000);

    // Comprobar también al volver a la pestaña (focus)
    const onFocus = () => checkVersion();
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [checkVersion]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Forzar recarga completa evitando caché del navegador
    window.location.href = window.location.pathname + '?_v=' + Date.now();
  };

  if (!hasNewVersion || isDismissed) return null;

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-3 sm:p-3.5 rounded-2xl shadow-2xl border border-blue-400/40 flex items-center justify-between gap-3 backdrop-blur-md">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 bg-blue-500/20 text-sky-300 rounded-xl shrink-0 border border-blue-400/30">
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white tracking-tight leading-snug truncate">
              ¡Nueva actualización del equipo disponible!
            </p>
            <p className="text-[11px] text-blue-200/90 leading-tight">
              Se publicaron cambios recientes {nuevaFecha ? `(${nuevaFecha})` : ''}.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-75"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Actualizando...' : 'Actualizar ahora'}</span>
          </button>
          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            title="Cerrar aviso temporalmente"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
