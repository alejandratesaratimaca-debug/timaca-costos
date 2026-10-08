export type RolUsuario = 
  | 'Administrador' 
  | 'Analista de Costos Internos'
  | 'Analista de Costos' 
  | 'Auditor SIP' 
  | 'Planificador' 
  | 'Visualizador'
  | 'Observador'
  | 'Coordinador HSE & Seguridad'
  | 'Gerente de Proyecto';

export interface PermisosUsuario {
  canEditSalidas: boolean;
  canCreateSalidas: boolean;
  canDeleteSalidas: boolean;
  canImportFiles: boolean;
  canAuditManoObra: boolean;
  canExportExcel: boolean;
  canManageUsers: boolean;
  canValidarImputaciones?: boolean;
  canEditInternos?: boolean;
  canEditExternos?: boolean;
  canEditHerramientas?: boolean;
  canEditDotacion?: boolean;
  canEditSIPPmh?: boolean;
  canEditSeguridad?: boolean;
  canEditCertificados?: boolean;
  ambitoEdicion?: 'todo' | 'internos' | 'externos' | 'ninguno';
}

export interface UsuarioSistema {
  id: string;
  nombre: string;
  correo: string;
  cargo: string;
  departamento: string;
  rol: RolUsuario;
  estado: 'Activo' | 'Inactivo';
  permisos: PermisosUsuario;
  ultimoAcceso: string;
  avatarColor: string;
  usuario?: string;
  password?: string;
  cuentasAsignadas?: string[];
  proyectosNombres?: string[];
}

export const USUARIOS_INICIALES_TIMACA: UsuarioSistema[] = [
  {
    id: 'usr-001',
    nombre: 'Alejandra Tesara',
    correo: 'alejandratesara.timaca@gmail.com',
    usuario: 'atesara',
    cargo: 'Analista de Costos / Control Total',
    departamento: 'Control de Costos & Planificación',
    rol: 'Administrador',
    estado: 'Activo',
    permisos: {
      canEditSalidas: true,
      canCreateSalidas: true,
      canDeleteSalidas: true,
      canImportFiles: true,
      canAuditManoObra: true,
      canExportExcel: true,
      canManageUsers: true,
      canValidarImputaciones: true,
      canEditInternos: true,
      canEditExternos: true,
      canEditHerramientas: true,
      canEditDotacion: true,
      canEditSIPPmh: true,
      canEditSeguridad: true,
      canEditCertificados: true,
      ambitoEdicion: 'todo'
    },
    ultimoAcceso: '2026-10-06 13:10',
    avatarColor: 'bg-blue-600'
  },
  {
    id: 'usr-002',
    nombre: 'Daniela Riveros',
    correo: 'drivero@timaca.com.ve',
    usuario: 'drivero',
    cargo: 'Supervisora de Herramientas & Analista de Costos Internos',
    departamento: 'Control de Costos - Proyectos Internos',
    rol: 'Analista de Costos Internos',
    estado: 'Activo',
    permisos: {
      canEditSalidas: true,
      canCreateSalidas: true,
      canDeleteSalidas: true,
      canImportFiles: true,
      canAuditManoObra: true,
      canExportExcel: true,
      canManageUsers: true,
      canValidarImputaciones: true,
      canEditInternos: true,
      canEditExternos: true,
      canEditHerramientas: true,
      canEditDotacion: true,
      canEditSIPPmh: true,
      canEditSeguridad: true,
      canEditCertificados: true,
      ambitoEdicion: 'todo'
    },
    ultimoAcceso: '2026-10-06 17:40',
    avatarColor: 'bg-purple-600'
  },
  {
    id: 'usr-003',
    nombre: 'Jessica Navarro',
    correo: 'jnavarro@timaca.com.ve',
    usuario: 'jnavarro',
    cargo: 'Coordinadora de Seguridad Industrial, Certificaciones & Dotación',
    departamento: 'Seguridad Industrial, Ambiente & Dotación (HSE)',
    rol: 'Coordinador HSE & Seguridad',
    estado: 'Activo',
    permisos: {
      canEditSalidas: false,
      canCreateSalidas: false,
      canDeleteSalidas: false,
      canImportFiles: false,
      canAuditManoObra: false,
      canExportExcel: true,
      canManageUsers: false,
      canValidarImputaciones: false,
      canEditInternos: false,
      canEditExternos: false,
      canEditHerramientas: true,
      canEditDotacion: true,
      canEditSIPPmh: false,
      canEditSeguridad: true,
      canEditCertificados: true,
      ambitoEdicion: 'todo'
    },
    ultimoAcceso: '2026-10-06 17:40',
    avatarColor: 'bg-emerald-600'
  },
  {
    id: 'usr-004',
    nombre: 'Jose Galavis',
    correo: 'jgalavis@timaca.com.ve',
    usuario: 'jgalavis',
    cargo: 'Observador de Costos / Control de Campo',
    departamento: 'Auditoría & Operaciones',
    rol: 'Observador',
    estado: 'Activo',
    permisos: {
      canEditSalidas: false,
      canCreateSalidas: false,
      canDeleteSalidas: false,
      canImportFiles: false,
      canAuditManoObra: false,
      canExportExcel: true,
      canManageUsers: false,
      canValidarImputaciones: false,
      canEditInternos: false,
      canEditExternos: false,
      ambitoEdicion: 'ninguno'
    },
    ultimoAcceso: '2026-10-06 10:20',
    avatarColor: 'bg-amber-600'
  },
  {
    id: 'usr-005',
    nombre: 'Ing. Carlos Mendoza',
    correo: 'cmendoza@timaca.com.ve',
    usuario: 'cmendoza',
    cargo: 'Ingeniero de Pruebas - Planta de Pellas (Observador)',
    departamento: 'Gerencia de Operaciones & Proyectos',
    rol: 'Observador',
    cuentasAsignadas: ['TTE-C-0706', 'TTE-C-0676', 'TTE-C-0640'],
    proyectosNombres: ['Línea 1 Pellas (Lectura)', '2da Línea Pellas', 'Parrilla Móvil Pellas'],
    estado: 'Activo',
    permisos: {
      canEditSalidas: false,
      canCreateSalidas: false,
      canDeleteSalidas: false,
      canImportFiles: false,
      canAuditManoObra: false,
      canExportExcel: true,
      canManageUsers: false,
      canValidarImputaciones: false,
      canEditInternos: false,
      canEditExternos: false,
      ambitoEdicion: 'ninguno'
    },
    ultimoAcceso: '2026-10-06 09:30',
    avatarColor: 'bg-indigo-600'
  },
  {
    id: 'usr-006',
    nombre: 'Ing. Roberto Valdivieso',
    correo: 'rvaldivieso@timaca.com.ve',
    usuario: 'rvaldivieso',
    cargo: 'Ingeniero de Pruebas - Manejo Mineral PMH Palúa (Observador)',
    departamento: 'Gerencia de Operaciones & Proyectos',
    rol: 'Observador',
    cuentasAsignadas: ['TTE-C-0671', 'TTE-C-0656'],
    proyectosNombres: ['Segunda Línea PMH Palúa (Lectura)', 'Rehabilitación Bandas PMH'],
    estado: 'Activo',
    permisos: {
      canEditSalidas: false,
      canCreateSalidas: false,
      canDeleteSalidas: false,
      canImportFiles: false,
      canAuditManoObra: false,
      canExportExcel: true,
      canManageUsers: false,
      canValidarImputaciones: false,
      canEditInternos: false,
      canEditExternos: false,
      ambitoEdicion: 'ninguno'
    },
    ultimoAcceso: '2026-10-06 09:15',
    avatarColor: 'bg-teal-600'
  }
];
