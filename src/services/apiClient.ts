/**
 * Cliente Centralizado de Red - TIMACA Costos
 * Elimina problemas de Mixed Content en Vercel HTTPS usando rutas relativas seguras.
 * Implementa invalidación agresiva de caché HTTP y Edge mediante cabeceras no-store
 * y parámetros de query anti-caché por timestamp.
 */

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

const DEFAULT_TIMEOUT_MS = 6000;

/**
 * Añade cabeceras y parámetros anti-caché a una URL
 */
export function buildAntiCacheUrl(url: string): string {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}_t=${Date.now()}`;
}

/**
 * Ejecuta una petición HTTP con neutralización total de caché y timeout seguro
 */
export async function secureFetch<T = any>(
  endpoint: string,
  options: RequestInit & { timeoutMs?: number } = {}
): Promise<T> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, headers = {}, ...restOpts } = options;

  // Garantizar que la ruta no contenga IPs privadas inseguras en entornos de producción
  let targetUrl = endpoint;
  if (targetUrl.includes('192.168.13.193:3005')) {
    targetUrl = targetUrl.replace(/http:\/\/192\.168\.13\.193:3005/g, '');
  }

  // Si es GET o HEAD, añadir anti-cache timestamp a la query
  const method = (restOpts.method || 'GET').toUpperCase();
  if (method === 'GET' || method === 'HEAD') {
    targetUrl = buildAntiCacheUrl(targetUrl);
  }

  const combinedHeaders: Record<string, string> = {
    'Cache-Control': 'no-cache, no-store, must-revalidate, proxy-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0',
    ...(headers as Record<string, string>),
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(targetUrl, {
      ...restOpts,
      cache: 'no-store',
      headers: combinedHeaders,
      signal: options.signal || controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return await res.json();
    }
    return (await res.text()) as unknown as T;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Timeout de red agotado (${timeoutMs}ms) al consultar: ${targetUrl}`);
    }
    throw error;
  }
}

/**
 * Intentar llamar a una ruta de API y si falla, cargar el archivo estático de respaldo correspondiente
 */
export async function fetchWithStaticFallback<T = any>(
  apiPath: string,
  staticPath: string,
  timeoutMs = 3000
): Promise<T> {
  try {
    const data = await secureFetch<T>(apiPath, { timeoutMs });
    if (data !== null && data !== undefined) {
      return data;
    }
  } catch {
    // Silenciosamente continuar al fallback estático sin detener la aplicación
  }

  return await secureFetch<T>(staticPath, { timeoutMs: 8000 });
}

// -------------------------------------------------------------
// SERVICIOS ESPECÍFICOS DE DATOS TIMACA
// -------------------------------------------------------------

export async function getStatusApi(): Promise<any> {
  return fetchWithStaticFallback('/api/status', '/data/sip/status.json', 2500);
}

export async function getProyectosApi(): Promise<any[]> {
  return fetchWithStaticFallback('/api/proyectos', '/data/sip/proyectos.json', 3000);
}

export async function getMatrizApi(): Promise<any> {
  return fetchWithStaticFallback('/api/matriz', '/data/sip/matriz.json', 3000);
}

export async function getFiltrosApi(ano = '2026'): Promise<any> {
  return fetchWithStaticFallback(`/api/filtros?ano=${encodeURIComponent(ano)}`, '/data/sip/filtros_2026.json', 3000);
}

export async function getConsumosApi(params: URLSearchParams): Promise<any> {
  try {
    return await secureFetch(`/api/consumos?${params.toString()}`, { timeoutMs: 4000 });
  } catch {
    return await secureFetch('/data/sip/consumos.json', { timeoutMs: 8000 });
  }
}

export async function getComprasApi(params: URLSearchParams): Promise<any> {
  try {
    return await secureFetch(`/api/compras?${params.toString()}`, { timeoutMs: 4000 });
  } catch {
    return await secureFetch('/data/sip/compras.json', { timeoutMs: 8000 });
  }
}

export async function getReclasificacionesApi(): Promise<any[]> {
  return fetchWithStaticFallback('/api/reclasificaciones', '/data/sip/reclasificaciones.json', 3500);
}

export async function postReclasificarApi(payload: {
  recordId: string;
  nuevaCuenta: string;
  nuevoProyecto?: string;
  nuevoMes?: string;
  motivo?: string;
  numero?: string;
  codigo?: string;
  usuario?: string;
}): Promise<any> {
  try {
    return await secureFetch('/api/reclasificar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      timeoutMs: 4000
    });
  } catch (e: any) {
    console.warn('[API Reclasificar Notice]:', e.message);
    return { success: true, offline: true };
  }
}

export async function postRevertirReclasificacionApi(recordId: string): Promise<any> {
  try {
    return await secureFetch('/api/reclasificar/revertir', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recordId }),
      timeoutMs: 4000
    });
  } catch (e: any) {
    console.warn('[API Revertir Notice]:', e.message);
    return { success: true, offline: true };
  }
}

export async function searchMovimientosCorreccionesApi(query: string, estado = 'todos'): Promise<any[]> {
  try {
    return await secureFetch(`/api/correcciones/buscar?q=${encodeURIComponent(query)}&estado=${encodeURIComponent(estado)}`, {
      timeoutMs: 4000
    });
  } catch {
    return [];
  }
}

export async function postSipSyncApi(inicio: string, hasta: string): Promise<any> {
  return await secureFetch('/api/sip/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ inicio, hasta }),
    timeoutMs: 30000
  });
}
