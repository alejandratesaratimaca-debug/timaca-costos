import React, { useState, useEffect } from 'react';
import { UsuarioSistema, USUARIOS_INICIALES_TIMACA } from '../types/usuarios';
import { SuiteModulo } from '../types/suite';
import { TimacaLogo } from './TimacaLogo';
import { iniciarSesion } from '../lib/auth';
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
  Calendar,
  FileCheck2,
  Users,
  Check,
  ChevronRight
} from 'lucide-react';

interface DepartamentoConfig {
  id: string;
  nombre: string;
  modulo: SuiteModulo;
  entorno: 'externos' | 'internos';
  targetTab?: string;
  badge: string;
  descripcion: string;
  icono: React.ElementType;
  colorBg: string;
  colorBorder: string;
  colorText: string;
  colorIcon: string;
  btnGrad: string;
}

const DEPARTAMENTOS_SIGMA: DepartamentoConfig[] = [
  {
    id: 'costos-externos',
    nombre: 'Costos de Proyectos Externos',
    modulo: 'costos',
    entorno: 'externos',
    badge: 'Obras & Clientes',
    descripcion: '77 proyectos con presupuesto aprobado (Ferrominera, Briquetera, Sidor y clientes privados).',
    icono: Building2,
    colorBg: 'bg-blue-900/30',
    colorBorder: 'border-blue-500/50',
    colorText: 'text-blue-300',
    colorIcon: 'text-blue-400',
    btnGrad: 'from-blue-700 to-blue-600 hover:from-blue-800 hover:to-blue-700'
  },
  {
    id: 'validacion-gerente',
    nombre: 'Validación Gerencial (Sesión Gerentes)',
    modulo: 'costos',
    entorno: 'externos',
    targetTab: 'validacion-gerente',
    badge: 'Auditoría Gerentes',
    descripcion: 'Revisión, objeción y conformación de imputaciones contables por frente de obra.',
    icono: FileCheck2,
    colorBg: 'bg-amber-900/30',
    colorBorder: 'border-amber-500/60',
    colorText: 'text-amber-300',
    colorIcon: 'text-amber-400',
    btnGrad: 'from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800'
  },
  {
    id: 'costos-internos',
    nombre: 'Costos de Proyectos Internos',
    modulo: 'costos',
    entorno: 'internos',
    badge: 'Planta & Flota',
    descripcion: 'Inversiones CAPEX, Mantenimiento OPEX, 26 Grúas, flota pesada y Línea 1 Pellas.',
    icono: Layers,
    colorBg: 'bg-slate-800/40',
    colorBorder: 'border-sky-500/50',
    colorText: 'text-sky-300',
    colorIcon: 'text-sky-400',
    btnGrad: 'from-slate-800 to-slate-700 hover:from-slate-900 hover:to-slate-800 ring-1 ring-sky-400/40'
  },
  {
    id: 'dotacion',
    nombre: 'Dotación de Personal & EPP',
    modulo: 'dotacion',
    entorno: 'externos',
    badge: 'Uniformes & Botas',
    descripcion: 'Entregas cuatrimestrales por trabajador, stock SIP, actas digitales, deterioro y LOPCYMAT.',
    icono: ShieldCheck,
    colorBg: 'bg-emerald-900/30',
    colorBorder: 'border-emerald-500/50',
    colorText: 'text-emerald-300',
    colorIcon: 'text-emerald-400',
    btnGrad: 'from-emerald-700 to-emerald-600 hover:from-emerald-800 hover:to-emerald-700'
  },
  {
    id: 'herramientas',
    nombre: 'Herramientas & Trazabilidad',
    modulo: 'herramientas',
    entorno: 'externos',
    badge: 'Vales & 40 Cajas',
    descripcion: 'Sistema de trazabilidad, 40 cajas TT-A-C-207, cronómetro 12h y calibración SENCAMER.',
    icono: Wrench,
    colorBg: 'bg-cyan-900/30',
    colorBorder: 'border-cyan-500/50',
    colorText: 'text-cyan-300',
    colorIcon: 'text-cyan-400',
    btnGrad: 'from-cyan-700 to-cyan-600 hover:from-cyan-800 hover:to-cyan-700'
  },
  {
    id: 'rrhh',
    nombre: 'Recursos Humanos (RRHH)',
    modulo: 'rrhh',
    entorno: 'externos',
    badge: 'Talento TIMACA',
    descripcion: 'Expedientes del personal, control de cuadrillas, asistencia y nómina semanal de MOD.',
    icono: Users,
    colorBg: 'bg-indigo-900/30',
    colorBorder: 'border-indigo-500/50',
    colorText: 'text-indigo-300',
    colorIcon: 'text-indigo-400',
    btnGrad: 'from-indigo-700 to-indigo-600 hover:from-indigo-800 hover:to-indigo-700'
  },
  {
    id: 'seguridad',
    nombre: 'Seguridad Laboral (HSE)',
    modulo: 'seguridad',
    entorno: 'externos',
    badge: 'Matriz IPER & HSE',
    descripcion: 'Matriz IPER, planes de control de riesgos, inspecciones de campo y salud ocupacional.',
    icono: HardHat,
    colorBg: 'bg-rose-900/30',
    colorBorder: 'border-rose-500/50',
    colorText: 'text-rose-300',
    colorIcon: 'text-rose-400',
    btnGrad: 'from-rose-700 to-rose-600 hover:from-rose-800 hover:to-rose-700'
  },
  {
    id: 'certificados',
    nombre: 'Certificados & Habilitaciones',
    modulo: 'certificados',
    entorno: 'externos',
    badge: '26 Grúas · ASME · WPQ',
    descripcion: 'Acreditaciones ASME B30.5 para operadores de grúa, soldadores 6G y bloqueo de maniobras.',
    icono: Award,
    colorBg: 'bg-purple-900/30',
    colorBorder: 'border-purple-500/50',
    colorText: 'text-purple-300',
    colorIcon: 'text-purple-400',
    btnGrad: 'from-purple-700 to-purple-600 hover:from-purple-800 hover:to-purple-700'
  },
  {
    id: 'sip-pmh',
    nombre: 'SIP de Campo PMH',
    modulo: 'sip-pmh',
    entorno: 'externos',
    badge: 'Muelle & Tolvas PMH',
    descripcion: 'Vales digitales de almacén en frente de muelle y tolvas con cola offline y sincronización.',
    icono: Truck,
    colorBg: 'bg-orange-900/30',
    colorBorder: 'border-orange-500/50',
    colorText: 'text-orange-300',
    colorIcon: 'text-orange-400',
    btnGrad: 'from-orange-700 to-orange-600 hover:from-orange-800 hover:to-orange-700'
  }
];

interface LoginPortadaViewProps {
  onLoginSuccess: (
    usuario: UsuarioSistema, 
    entorno: 'externos' | 'internos', 
    modulo?: SuiteModulo,
    targetTab?: string
  ) => void;
  usuariosDisponibles?: UsuarioSistema[];
  entornoInicial?: 'externos' | 'internos';
  moduloInicial?: SuiteModulo;
}

export const LoginPortadaView: React.FC<LoginPortadaViewProps> = ({
  onLoginSuccess,
  usuariosDisponibles: propsUsuarios,
  entornoInicial = 'externos',
  moduloInicial = 'costos'
}) => {
  // Departamento seleccionado para ingresar
  const [selectedDeptId, setSelectedDeptId] = useState<string>(() => {
    if (entornoInicial === 'internos') return 'costos-internos';
    if (moduloInicial && moduloInicial !== 'costos') {
      const match = DEPARTAMENTOS_SIGMA.find(d => d.modulo === moduloInicial);
      if (match) return match.id;
    }
    return 'costos-externos';
  });

  const selectedDept = React.useMemo(() => {
    return DEPARTAMENTOS_SIGMA.find(d => d.id === selectedDeptId) || DEPARTAMENTOS_SIGMA[0];
  }, [selectedDeptId]);

  const [identificador, setIdentificador] = useState('alejandratesara.timaca@gmail.com');
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

  // Manejar envío de login
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    const correo = identificador.trim().toLowerCase();
    if (!correo || !password) {
      setErrorMsg('Por favor ingresa tu correo y contraseña.');
      return;
    }
    if (!correo.includes('@')) {
      setErrorMsg('Ingresa un correo electrónico corporativo válido.');
      return;
    }
    setIsLoading(true);
    try {
      const usuario = await iniciarSesion(correo, password);
      localStorage.setItem('TIMACA_ENTORNO_ACTIVO', selectedDept.entorno);
      localStorage.setItem('TIMACA_MODULO_SUITE_ACTIVO', selectedDept.modulo);
      onLoginSuccess(usuario, selectedDept.entorno, selectedDept.modulo, selectedDept.targetTab);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'No se pudo iniciar sesión.');
    } finally {
      setIsLoading(false);
    }
  };

  const SelectedIcon = selectedDept.icono;

  return (
    <div className="min-h-screen relative flex flex-col justify-between overflow-x-hidden font-sans bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Background con imagen del taller TIMACA + degradado corporativo */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 filter blur-[1px] transform scale-105 pointer-events-none"
        style={{ backgroundImage: `url('/portada-taller.jpg')` }}
      />
      
      {/* Capa de degradado corporativo de alta profundidad */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/98 via-[#06112c]/95 to-[#0b1b4f]/92 backdrop-blur-xs pointer-events-none" />

      {/* Trazado decorativo sutil */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#38bdf80a_1px,transparent_1px),linear-gradient(to_bottom,#38bdf80a_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* ========================================================================= */}
      {/* 1. BARRA SUPERIOR DE ESTADO & IDENTIDAD CORPORATIVA                       */}
      {/* ========================================================================= */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 shadow-lg">
          <TimacaLogo size="md" />
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Reloj y Fecha en tiempo real (Venezuela) */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs font-mono shadow-md select-none">
            <div className="flex items-center gap-1.5 text-sky-400 font-bold">
              <Clock className="w-4 h-4 text-sky-400 shrink-0" />
              <span>{formattedTime}</span>
            </div>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <div className="hidden sm:flex items-center gap-1.5 text-slate-300 font-medium">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{formattedDate}</span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-mono backdrop-blur-md border border-emerald-500/40 bg-emerald-950/40 px-3.5 py-2 rounded-xl text-emerald-300 shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold">SIGMA OPERACIONAL · PLATAFORMA INTEGRAL</span>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. CONTENIDO PRINCIPAL: DOS COLUMNAS                                      */}
      {/* ========================================================================= */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* ===================================================================== */}
          {/* COLUMNA IZQUIERDA: HERO + SELECCIÓN DE DEPARTAMENTOS                  */}
          {/* ===================================================================== */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Encabezado Principal Oficial (Según archivo PPTX) */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-950/70 border border-blue-400/50 text-sky-300 shadow-xs">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>SIGMA · Sistema Integrado de Gestión TIMACA</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                <span className="text-white block drop-shadow-sm" style={{ color: '#ffffff' }}>
                  Sistema Integrado de Gestión de
                </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-sky-200 to-amber-300 font-extrabold block mt-1 drop-shadow-sm">
                  Materiales y Activos
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-200 font-medium max-w-2xl leading-relaxed mt-2" style={{ color: '#e2e8f0' }}>
                Costos, dotación, herramientas y seguridad de TIMACA en un solo sistema interactivo. Una plataforma integral para controlar lo que cuesta operar TIMACA y los recursos que lo generan.
              </p>
            </div>

            {/* SELECCIÓN DE DEPARTAMENTO O MÓDULO PARA INICIAR SESIÓN */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-sky-400" />
                  <span>Selecciona el Departamento para Iniciar Sesión:</span>
                </label>
                <span className="text-xs text-sky-400 font-semibold">
                  (Haz clic en un departamento)
                </span>
              </div>

              {/* Grid Interactivo de 9 Departamentos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {DEPARTAMENTOS_SIGMA.map((dept) => {
                  const isSelected = selectedDeptId === dept.id;
                  const DeptIcon = dept.icono;
                  return (
                    <button
                      key={dept.id}
                      type="button"
                      onClick={() => setSelectedDeptId(dept.id)}
                      className={`p-3.5 rounded-2xl text-left transition-all cursor-pointer border relative overflow-hidden group shadow-xs ${
                        isSelected
                          ? `${dept.colorBg} ${dept.colorBorder} border-2 shadow-lg ring-2 ring-sky-400/60 transform scale-[1.01]`
                          : 'bg-slate-900/80 border-slate-700/70 text-slate-300 hover:text-white hover:bg-slate-800/90 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className={`p-1.5 rounded-lg border ${
                            isSelected ? 'bg-white/10 border-white/20' : 'bg-slate-800 border-slate-700'
                          }`}>
                            <DeptIcon className={`w-4 h-4 ${dept.colorIcon}`} />
                          </span>
                          <span className={`font-black text-xs uppercase tracking-tight truncate ${
                            isSelected ? 'text-white' : 'text-slate-200 group-hover:text-white'
                          }`}>
                            {dept.nombre}
                          </span>
                        </div>
                        {isSelected ? (
                          <span className="w-5 h-5 rounded-full bg-sky-400 text-slate-950 flex items-center justify-center shrink-0 shadow-xs">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 shrink-0">
                            {dept.badge}
                          </span>
                        )}
                      </div>
                      <p className={`text-xs leading-relaxed line-clamp-2 ${
                        isSelected ? 'text-slate-200' : 'text-slate-400 group-hover:text-slate-300'
                      }`}>
                        {dept.descripcion}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* ===================================================================== */}
          {/* COLUMNA DERECHA: TARJETA DE FORMULARIO DE INICIO DE SESIÓN             */}
          {/* ===================================================================== */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <div className="rounded-3xl shadow-2xl border border-slate-700/80 bg-white text-slate-900 p-6 sm:p-8 relative overflow-hidden transition-all duration-300">
              {/* Barra superior de acento corporativo TIMACA según departamento */}
              <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${selectedDept.btnGrad}`} />

              <div className="text-center mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 border shadow-sm ${
                  selectedDept.colorBg
                } ${selectedDept.colorBorder}`}>
                  <SelectedIcon className={`w-7 h-7 ${selectedDept.colorIcon}`} />
                </div>
                
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Iniciar Sesión en SIGMA
                </h2>
                
                {/* Badge Dinámico del Departamento Seleccionado */}
                <div className="inline-flex items-center gap-1.5 text-xs font-bold mt-2 px-3 py-1 rounded-full border shadow-2xs max-w-full truncate bg-slate-100 border-slate-300 text-slate-800">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse shrink-0"></span>
                  <span className="text-slate-500 font-medium">Entrando a:</span>
                  <strong className="text-blue-900 truncate">{selectedDept.nombre}</strong>
                </div>
              </div>

              {/* Alerta de Error */}
              {errorMsg && (
                <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span className="font-medium">{errorMsg}</span>
                </div>
              )}

              {/* Formulario de Login */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Campo Usuario / Correo */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Correo Electrónico Corporativo
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={identificador}
                      onChange={(e) => setIdentificador(e.target.value)}
                      placeholder="ejemplo@timaca.com.ve"
                      required
                      className="w-full pl-10 pr-3.5 py-3 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-sky-600 transition-all shadow-2xs"
                    />
                  </div>
                </div>

                {/* Campo Contraseña */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Contraseña Personal
                    </label>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Ingresa tu contraseña"
                      required
                      className="w-full pl-10 pr-11 py-3 bg-white border border-slate-300 rounded-xl text-sm font-mono font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-sky-600 transition-all shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
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
                      className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300 cursor-pointer"
                    />
                    <span>Mantener sesión iniciada</span>
                  </label>
                  <span className="text-xs text-slate-500 font-medium cursor-help hover:text-blue-600" title="Contacta a Sistemas para restablecer credenciales">
                    ¿Olvidaste tu clave?
                  </span>
                </div>

                {/* Botón de Ingreso Dinámico según Departamento */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full mt-3 py-3.5 px-4 text-white font-bold text-sm rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 group bg-gradient-to-r ${selectedDept.btnGrad}`}
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Autenticando en Supabase...</span>
                    </>
                  ) : (
                    <>
                      <span>Ingresar a {selectedDept.nombre}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              {/* Nota de Seguridad & Créditos */}
              <div className="mt-6 pt-4 border-t border-slate-200 flex flex-col items-center justify-center gap-1.5 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Acceso protegido con permisos por rol y departamento</span>
                </div>
                <div className="text-[11px] font-medium text-slate-600 pt-1">
                  Sistema creado por: <strong className="text-slate-900 font-bold">Alejandra Tesara</strong> · <strong className="text-slate-900 font-bold">Daniela Riveros</strong> · <strong className="text-slate-900 font-bold">Jessica Navarro</strong>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* ========================================================================= */}
      {/* 3. PIE DE PÁGINA CORPORATIVO                                              */}
      {/* ========================================================================= */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 border-t border-slate-800/60 text-slate-400 text-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span>Taller Industrial Metalúrgico Antonio, C.A.</span>
          <span className="text-slate-600">•</span>
          <span className="font-mono text-slate-300 font-semibold">RIF: J-09500315-9</span>
          <span className="text-slate-600">•</span>
          <span>Ciudad Guayana, Estado Bolívar</span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300 text-xs shadow-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>SIGMA TIMACA · <strong className="text-white font-bold">Gestión de Materiales y Activos</strong></span>
          </div>

          <div className="text-[11px] font-medium text-slate-300">
            Sistema creado por: <strong className="text-white font-bold">Alejandra Tesara</strong> · <strong className="text-white font-bold">Daniela Riveros</strong> · <strong className="text-white font-bold">Jessica Navarro</strong>
          </div>
        </div>
      </footer>
    </div>
  );
};
