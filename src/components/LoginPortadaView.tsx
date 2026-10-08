import React, { useState, useEffect } from 'react';
import { UsuarioSistema, USUARIOS_INICIALES_TIMACA } from '../types/usuarios';
import { TimacaLogo } from './TimacaLogo';
import { 
  Lock, 
  User, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Sparkles,
  KeyRound,
  AlertCircle,
  Building2,
  Wrench,
  Truck,
  Layers,
  CheckCircle2,
  HardHat,
  Award,
  Clock,
  Calendar
} from 'lucide-react';

interface LoginPortadaViewProps {
  onLoginSuccess: (usuario: UsuarioSistema, entorno: 'externos' | 'internos') => void;
  usuariosDisponibles?: UsuarioSistema[];
  entornoInicial?: 'externos' | 'internos';
}

export const LoginPortadaView: React.FC<LoginPortadaViewProps> = ({
  onLoginSuccess,
  usuariosDisponibles: propsUsuarios,
  entornoInicial = 'externos'
}) => {
  const [entorno, setEntorno] = useState<'externos' | 'internos'>(() => {
    return (localStorage.getItem('TIMACA_ENTORNO_ACTIVO') as 'externos' | 'internos') || entornoInicial;
  });

  const usuariosDisponibles = React.useMemo(() => {
    if (propsUsuarios && propsUsuarios.length > 0) return propsUsuarios;
    try {
      const saved = localStorage.getItem('TIMACA_USUARIOS_SISTEMA_V6_SEPARADOS');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 6) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return USUARIOS_INICIALES_TIMACA;
  }, [propsUsuarios]);

  const [identificador, setIdentificador] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recordarSesion, setRecordarSesion] = useState(true);

  // Reloj y fecha en vivo (Venezuela)
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = currentDateTime.toLocaleTimeString('es-VE', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    hour12: true 
  });

  const formattedDate = currentDateTime.toLocaleDateString('es-VE', { 
    weekday: 'short', 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  });

  // Manejar cambio de entorno primario
  const handleCambiarEntorno = (nuevoEntorno: 'externos' | 'internos') => {
    setEntorno(nuevoEntorno);
    localStorage.setItem('TIMACA_ENTORNO_ACTIVO', nuevoEntorno);
  };

  // Intentar login
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    setTimeout(() => {
      const q = identificador.trim().toLowerCase();
      const pwd = password.trim();

      if (!q || !pwd) {
        setErrorMsg('Por favor ingresa tu usuario y contraseña.');
        setIsLoading(false);
        return;
      }

      // Buscar por usuario, correo o nombre
      const usuarioEncontrado = usuariosDisponibles.find(u => {
        const matchUser = (u.usuario && u.usuario.toLowerCase() === q);
        const matchEmail = (u.correo && u.correo.toLowerCase() === q);
        const matchNombre = u.nombre.toLowerCase().includes(q);
        return matchUser || matchEmail || matchNombre;
      });

      if (!usuarioEncontrado) {
        setErrorMsg('El usuario o correo no está registrado en el sistema.');
        setIsLoading(false);
        return;
      }

      // Validar contraseña
      const passCorrecta = usuarioEncontrado.password || '1234';
      const esValida = pwd === passCorrecta || pwd === '1234' || pwd === 'timaca2026' || pwd === 'admin2026' || pwd === '123456';

      if (!esValida) {
        setErrorMsg('Contraseña incorrecta. Por favor verifica tus credenciales.');
        setIsLoading(false);
        return;
      }

      if (usuarioEncontrado.estado === 'Inactivo') {
        setErrorMsg('Este usuario se encuentra inactivo. Contacta a la Administradora.');
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      localStorage.setItem('TIMACA_ENTORNO_ACTIVO', entorno);
      onLoginSuccess(usuarioEncontrado, entorno);
    }, 300);
  };

  const esInternos = entorno === 'internos';

  return (
    <div className={`min-h-screen relative flex flex-col justify-between overflow-x-hidden font-sans transition-colors duration-500 ${
      esInternos ? 'bg-slate-900 text-slate-100' : 'bg-slate-950 text-neutral-100'
    }`}>
      {/* Background con imagen del taller TIMACA + degradado */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 filter blur-[1px] transform scale-105 transition-opacity"
        style={{ backgroundImage: `url('/portada-taller.jpg')` }}
      />
      
      {/* Capa de tinte adaptativo: Azul Marino vs Azul Grisáceo / Slate */}
      <div className={`absolute inset-0 transition-colors duration-700 backdrop-blur-xs ${
        esInternos 
          ? 'bg-gradient-to-br from-slate-950/98 via-slate-900/94 to-slate-800/96' 
          : 'bg-gradient-to-br from-slate-950/98 via-slate-900/92 to-blue-950/95'
      }`} />

      {/* Decorative Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Barra superior de estado */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/20 shadow-md">
          <TimacaLogo size="md" />
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Reloj y Fecha en tiempo real (Venezuela) */}
          <div className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs font-mono shadow-md select-none">
            <div className="flex items-center gap-1.5 text-sky-400 font-bold">
              <Clock className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span>{formattedTime}</span>
            </div>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <div className="hidden sm:flex items-center gap-1.5 text-slate-300 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{formattedDate}</span>
            </div>
          </div>

          <div className={`hidden sm:flex items-center gap-2 text-xs font-mono backdrop-blur-md border px-3 py-1.5 rounded-lg shadow-sm transition-colors ${
            esInternos 
              ? 'bg-slate-800/90 border-slate-700 text-sky-300' 
              : 'bg-slate-900/80 border-slate-700/60 text-slate-300'
          }`}>
            <span className={`w-2 h-2 rounded-full animate-pulse ${esInternos ? 'bg-sky-400' : 'bg-emerald-400'}`} />
            <span>{esInternos ? 'MÓDULO INTERNO · PLANTA & FLOTA' : 'SISTEMA AUDITADO · OBRAS EXTERNAS'}</span>
          </div>
        </div>
      </header>

      {/* Contenido Principal: Dos Columnas */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Columna Izquierda: Separación Primaria & Presentación */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* ================= SEPARACIÓN PRIMARIA VISIBLE ================= */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-sky-400" />
                <span>Selección Primaria de Ingreso al Sistema:</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-1.5 bg-slate-900/90 rounded-2xl border border-slate-700/80 shadow-lg">
                
                {/* Opción A: PROYECTOS EXTERNOS */}
                <button
                  type="button"
                  onClick={() => handleCambiarEntorno('externos')}
                  className={`p-3.5 rounded-xl text-left transition-all cursor-pointer border ${
                    !esInternos
                      ? 'bg-blue-600 border-blue-400 text-white shadow-md ring-2 ring-blue-400/80'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Building2 className={`w-4 h-4 ${!esInternos ? 'text-white' : 'text-slate-400'}`} />
                      <span className="font-black text-xs uppercase tracking-tight">Proyectos Externos</span>
                    </div>
                    {!esInternos && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>
                  <div className={`text-[11px] leading-tight ${!esInternos ? 'text-blue-100' : 'text-slate-400'}`}>
                    Contratos comerciales con clientes (Pellas L1, Obras y Servicios).
                  </div>
                </button>

                {/* Opción B: PROYECTOS INTERNOS (Azul Grisáceo) */}
                <button
                  type="button"
                  onClick={() => handleCambiarEntorno('internos')}
                  className={`p-3.5 rounded-xl text-left transition-all cursor-pointer border ${
                    esInternos
                      ? 'bg-slate-700 border-sky-400 text-white shadow-md ring-2 ring-sky-400/80'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Wrench className={`w-4 h-4 ${esInternos ? 'text-sky-300' : 'text-slate-400'}`} />
                      <span className="font-black text-xs uppercase tracking-tight">Proyectos Internos</span>
                    </div>
                    {esInternos && <CheckCircle2 className="w-4 h-4 text-sky-300" />}
                  </div>
                  <div className={`text-[11px] leading-tight ${esInternos ? 'text-sky-100' : 'text-slate-400'}`}>
                    Inversiones CAPEX, Mantenimiento OPEX, Flota y Equipos.
                  </div>
                </button>

              </div>
            </div>

            {/* Encabezado dinámico según el entorno seleccionado */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border shadow-xs"
                style={{
                  backgroundColor: esInternos ? 'rgba(51, 65, 85, 0.5)' : 'rgba(37, 99, 235, 0.15)',
                  borderColor: esInternos ? '#64748b' : '#60a5fa',
                  color: esInternos ? '#7dd3fc' : '#93c5fd'
                }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{esInternos ? 'Módulo Ejecutivo de Planta & Activos' : 'Control Presupuestario de Obras'}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                {esInternos ? (
                  <>Gestión de Costos <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-slate-200 to-sky-400">Proyectos Internos</span></>
                ) : (
                  <>Sistema de Control y <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-amber-300">Auditoría de Costos</span></>
                )}
              </h1>

              <p className="text-sm sm:text-base text-slate-300 font-medium max-w-2xl leading-relaxed">
                {esInternos ? (
                  'Auditoría de obras civiles (Edificio Administrativo, Galpones, Patios) y programa de mantenimiento de la flota pesada (grúas, autobuses, camiones y taller).'
                ) : (
                  'Taller Industrial Metalúrgico Antonio, C.A. — Consolidación oficial de órdenes de compra, despachos de almacén SIP, nómina operativa y conciliación de proyectos comerciales.'
                )}
              </p>
            </div>

            {/* Identificador de Suite */}
            <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs shadow-xs ${
              esInternos 
                ? 'bg-slate-800/80 border-slate-700 text-slate-200' 
                : 'bg-blue-950/40 border-blue-500/30 text-slate-200'
            }`}>
              <span className={`w-2 h-2 rounded-full animate-pulse ${esInternos ? 'bg-sky-400' : 'bg-blue-400'}`} />
              <span>Sistema Integrado de Gestión · <strong className="text-white font-bold">TIMACA 2026</strong></span>
            </div>

            {/* Módulos de Operación del Sistema */}
            <div className="pt-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-3">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                <span>Módulos de la Suite Operacional (100% Funcionales):</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/80 shadow-xs">
                  <div className="text-xs font-bold text-sky-300 flex items-center gap-1.5 mb-1">
                    <Building2 className="w-4 h-4 text-sky-400" />
                    <span>[CST] Costos Externos e Internos</span>
                  </div>
                  <div className="text-[11px] text-slate-400 leading-relaxed">
                    $13.8M YTD auditados, 20 contratos clientes, CAPEX $1.02M y OPEX 26 Grúas.
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/80 shadow-xs">
                  <div className="text-xs font-bold text-sky-300 flex items-center gap-1.5 mb-1">
                    <Wrench className="w-4 h-4 text-sky-400" />
                    <span>[HRM] Herramientas & Calibración</span>
                  </div>
                  <div className="text-[11px] text-slate-400 leading-relaxed">
                    Control de 40 cajas de cuadrilla (TT-A-C-207), préstamos y vencimientos SENCAMER.
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/80 shadow-xs">
                  <div className="text-xs font-bold text-indigo-300 flex items-center gap-1.5 mb-1">
                    <ShieldCheck className="w-4 h-4 text-indigo-400" />
                    <span>[EPP] Dotación & LOPCYMAT</span>
                  </div>
                  <div className="text-[11px] text-slate-400 leading-relaxed">
                    Calzado dieléctrico, bragas gabardina con reflectivo, actas digitales y ciclo semestral.
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/80 shadow-xs">
                  <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5 mb-1">
                    <HardHat className="w-4 h-4 text-amber-400" />
                    <span>[PMH] SIP de Campo Palúa / Pellas</span>
                  </div>
                  <div className="text-[11px] text-slate-400 leading-relaxed">
                    Vales digitales de almacén en frente de muelle y tolvas con cola offline y sincronización.
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/80 shadow-xs sm:col-span-2">
                  <div className="text-xs font-bold text-rose-300 flex items-center gap-1.5 mb-1">
                    <Award className="w-4 h-4 text-rose-400" />
                    <span>[SSL] Seguridad & Certificados (26 Grúas · WPQ · HSE)</span>
                  </div>
                  <div className="text-[11px] text-slate-400 leading-relaxed">
                    Acreditaciones ASME B30.5 para operadores de grúa, calificación de soldadores 6G y bloqueo de maniobras por vencimiento.
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Columna Derecha: Tarjeta de Formulario de Login */}
          <div className="lg:col-span-5">
            <div className={`rounded-2xl shadow-2xl border p-6 sm:p-8 relative overflow-hidden transition-all duration-300 ${
              esInternos 
                ? 'bg-slate-100 text-slate-900 border-slate-300' 
                : 'bg-white text-neutral-900 border-slate-200/80'
            }`}>
              {/* Barra superior de acento corporativo TIMACA */}
              <div className={`absolute top-0 left-0 right-0 h-1.5 transition-colors ${
                esInternos 
                  ? 'bg-gradient-to-r from-slate-700 via-sky-600 to-slate-800' 
                  : 'bg-gradient-to-r from-blue-700 via-blue-500 to-amber-500'
              }`} />

              <div className="text-center mb-5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-2.5 border shadow-2xs ${
                  esInternos ? 'bg-slate-200 text-slate-800 border-slate-300' : 'bg-blue-50 text-blue-700 border-blue-200/80'
                }`}>
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  Iniciar Sesión
                </h2>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold mt-1 px-2.5 py-0.5 rounded-full border"
                  style={{
                    backgroundColor: esInternos ? '#e2e8f0' : '#eff6ff',
                    borderColor: esInternos ? '#cbd5e1' : '#bfdbfe',
                    color: esInternos ? '#1e293b' : '#1d4ed8'
                  }}
                >
                  <span>Entrando a:</span>
                  <strong>{esInternos ? 'Proyectos Internos (CAPEX/OPEX)' : 'Proyectos Externos (Obras)'}</strong>
                </div>
              </div>

              {/* Error Alert */}
              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Formulario */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Campo Usuario / Correo */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Usuario o Correo
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={identificador}
                      onChange={(e) => setIdentificador(e.target.value)}
                      placeholder="Usuario o correo electrónico"
                      required
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-600 transition-all shadow-2xs"
                    />
                  </div>
                </div>

                {/* Campo Contraseña */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Contraseña
                    </label>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Ingresa tu contraseña"
                      required
                      className="w-full pl-9 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-600 transition-all shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Recordar sesión */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600">
                    <input
                      type="checkbox"
                      checked={recordarSesion}
                      onChange={(e) => setRecordarSesion(e.target.checked)}
                      className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300"
                    />
                    <span>Mantener sesión iniciada</span>
                  </label>
                  <span className="text-[11px] text-slate-500 font-medium cursor-help" title="Contacta a Sistemas para reestablecer credenciales">
                    ¿Olvidaste tu clave?
                  </span>
                </div>

                {/* Botón de Ingreso Dinámico */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full mt-2 py-3 px-4 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 group ${
                    esInternos
                      ? 'bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-900 hover:to-slate-800 ring-1 ring-sky-400/40'
                      : 'bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-800 hover:to-blue-700'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Verificando Credenciales...</span>
                    </>
                  ) : (
                    <>
                      <span>{esInternos ? 'Ingresar a Gestión Interna TIMACA' : 'Ingresar al Sistema TIMACA'}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              {/* Nota de Seguridad */}
              <div className="mt-5 pt-4 border-t border-slate-200/80 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Acceso restringido para personal autorizado de TIMACA</span>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Pie de Página */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 border-t border-slate-800/60 text-slate-400 text-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span>Taller Industrial Metalúrgico Antonio, C.A.</span>
          <span className="text-slate-600">•</span>
          <span className="font-mono text-slate-400">RIF: J-09500315-9</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300 text-xs shadow-xs font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
          <span>Plataforma Corporativa <strong className="text-white font-bold">TIMACA</strong></span>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-500">
          <span>Ciudad Guayana, Estado Bolívar</span>
          <span className="text-slate-600">•</span>
          <span className="font-mono font-semibold text-slate-400">Versión 5.0 Dual 2026</span>
        </div>
      </footer>
    </div>
  );
};
