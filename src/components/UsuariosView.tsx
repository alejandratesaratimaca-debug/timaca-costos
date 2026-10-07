import React, { useState, useEffect } from 'react';
import { UsuarioSistema, USUARIOS_INICIALES_TIMACA, RolUsuario } from '../types/usuarios';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Check, 
  X, 
  Edit3, 
  Trash2, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle,
  Key,
  LogIn,
  Sliders,
  Sparkles,
  ArrowLeft
} from 'lucide-react';

const USERS_STORAGE_KEY = 'TIMACA_USUARIOS_SISTEMA_V7_PERMISOS_HSE';
const ACTIVE_USER_STORAGE_KEY = 'TIMACA_ACTIVE_USER_ID_V7_PERMISOS_HSE';

interface UsuariosViewProps {
  currentUser: UsuarioSistema;
  setCurrentUser: (user: UsuarioSistema) => void;
  onVolver?: () => void;
}

export const UsuariosView: React.FC<UsuariosViewProps> = ({
  currentUser,
  setCurrentUser,
  onVolver
}) => {
  const [usuarios, setUsuarios] = useState<UsuarioSistema[]>(() => {
    const saved = localStorage.getItem(USERS_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 6) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return USUARIOS_INICIALES_TIMACA;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UsuarioSistema | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<Omit<UsuarioSistema, 'id' | 'ultimoAcceso'>>({
    nombre: '',
    correo: '',
    cargo: '',
    departamento: 'Control de Costos',
    rol: 'Analista de Costos',
    estado: 'Activo',
    avatarColor: 'bg-blue-600',
    permisos: {
      canEditSalidas: true,
      canCreateSalidas: true,
      canDeleteSalidas: false,
      canImportFiles: true,
      canAuditManoObra: true,
      canExportExcel: true,
      canManageUsers: false
    }
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(usuarios));
  }, [usuarios]);

  const filteredUsuarios = usuarios.filter((u) => {
    const matchSearch = u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.cargo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.departamento.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = selectedRole === 'todos' || u.rol === selectedRole;
    return matchSearch && matchRole;
  });

  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormData({
      nombre: '',
      correo: '',
      cargo: '',
      departamento: 'Operaciones TIMACA',
      rol: 'Analista de Costos',
      estado: 'Activo',
      avatarColor: 'bg-blue-600',
      permisos: {
        canEditSalidas: true,
        canCreateSalidas: true,
        canDeleteSalidas: false,
        canImportFiles: true,
        canAuditManoObra: true,
        canExportExcel: true,
        canManageUsers: false
      }
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: UsuarioSistema) => {
    setEditingUser(user);
    setFormData({
      nombre: user.nombre,
      correo: user.correo,
      cargo: user.cargo,
      departamento: user.departamento,
      rol: user.rol,
      estado: user.estado,
      avatarColor: user.avatarColor,
      permisos: { ...user.permisos }
    });
    setIsModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre || !formData.correo) return;

    if (editingUser) {
      // Update
      const updated = usuarios.map(u => u.id === editingUser.id ? {
        ...u,
        ...formData
      } : u);
      setUsuarios(updated);
      if (currentUser.id === editingUser.id) {
        setCurrentUser({ ...currentUser, ...formData });
      }
      setSuccessMsg(`Usuario ${formData.nombre} actualizado con éxito.`);
    } else {
      // Create
      const newUser: UsuarioSistema = {
        id: `usr-${Date.now().toString().slice(-4)}`,
        ...formData,
        ultimoAcceso: 'Recién creado'
      };
      setUsuarios([newUser, ...usuarios]);
      setSuccessMsg(`Nuevo usuario ${formData.nombre} registrado con éxito.`);
    }

    setIsModalOpen(false);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const handleToggleEstado = (userId: string) => {
    const updated = usuarios.map(u => {
      if (u.id === userId) {
        const nuevoEstado = u.estado === 'Activo' ? 'Inactivo' : 'Activo';
        return { ...u, estado: nuevoEstado as 'Activo' | 'Inactivo' };
      }
      return u;
    });
    setUsuarios(updated);
  };

  const handleSimularUsuario = (user: UsuarioSistema) => {
    setCurrentUser(user);
    localStorage.setItem(ACTIVE_USER_STORAGE_KEY, user.id);
    setSuccessMsg(`Has cambiado de sesión activa a: ${user.nombre} (${user.rol})`);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const applyRolePreset = (role: RolUsuario) => {
    let p = { ...formData.permisos };
    if (role === 'Administrador') {
      p = {
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
        ambitoEdicion: 'todo'
      };
    } else if (role === 'Analista de Costos Internos') {
      p = {
        canEditSalidas: false,
        canCreateSalidas: false,
        canDeleteSalidas: false,
        canImportFiles: false,
        canAuditManoObra: false,
        canExportExcel: true,
        canManageUsers: false,
        canValidarImputaciones: false,
        canEditInternos: true,
        canEditExternos: false,
        ambitoEdicion: 'internos'
      };
    } else if (role === 'Analista de Costos') {
      p = {
        canEditSalidas: true,
        canCreateSalidas: true,
        canDeleteSalidas: false,
        canImportFiles: true,
        canAuditManoObra: true,
        canExportExcel: true,
        canManageUsers: false,
        canValidarImputaciones: false,
        canEditInternos: false,
        canEditExternos: true,
        ambitoEdicion: 'externos'
      };
    } else if (role === 'Auditor SIP') {
      p = {
        canEditSalidas: true,
        canCreateSalidas: true,
        canDeleteSalidas: false,
        canImportFiles: true,
        canAuditManoObra: false,
        canExportExcel: true,
        canManageUsers: false,
        canValidarImputaciones: false,
        canEditInternos: false,
        canEditExternos: true,
        ambitoEdicion: 'externos'
      };
    } else if (role === 'Planificador') {
      p = {
        canEditSalidas: false,
        canCreateSalidas: false,
        canDeleteSalidas: false,
        canImportFiles: false,
        canAuditManoObra: true,
        canExportExcel: true,
        canManageUsers: false,
        canValidarImputaciones: false,
        canEditInternos: false,
        canEditExternos: false,
        ambitoEdicion: 'ninguno'
      };
    } else if (role === 'Observador') {
      p = {
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
      };
    } else {
      // Visualizador / Otros
      p = {
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
      };
    }
    setFormData({ ...formData, rol: role, permisos: p });
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onVolver && (
            <button
              onClick={onVolver}
              className="flex items-center gap-1.5 font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200/90 px-2.5 py-1.5 rounded-lg transition-colors text-xs shadow-2xs shrink-0 self-center"
              title="Volver al Resumen General"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver</span>
            </button>
          )}
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900 tracking-tight">
                Gestión de Usuarios & Control de Permisos TIMACA
              </h2>
              <p className="text-xs text-neutral-500">
                Administración de accesos para el equipo de costos, observadores y auditoría ({usuarios.length} usuarios)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Active User Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-100 rounded-xl border border-neutral-200 text-xs">
            <span className="text-neutral-500">Sesión Actual:</span>
            <span className="font-bold text-neutral-900">{currentUser.nombre}</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
              {currentUser.rol}
            </span>
          </div>

          {currentUser.permisos.canManageUsers && (
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs"
            >
              <UserPlus className="w-4 h-4" />
              <span>Nuevo Usuario</span>
            </button>
          )}
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-fade-in font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, correo, cargo o departamento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-neutral-600">Filtrar por Rol:</span>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="text-xs font-bold text-neutral-900 bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500"
          >
            <option value="todos">Todos los Roles</option>
            <option value="Administrador">Administrador</option>
            <option value="Observador">Observador (Solo Lectura)</option>
            <option value="Analista de Costos">Analista de Costos</option>
            <option value="Auditor SIP">Auditor SIP</option>
            <option value="Planificador">Planificador</option>
            <option value="Visualizador">Visualizador</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0b2545] text-white font-bold">
              <tr>
                <th className="py-3 px-4">Usuario / Correo</th>
                <th className="py-3 px-4">Cargo & Departamento</th>
                <th className="py-3 px-4">Rol</th>
                <th className="py-3 px-4">Matriz de Permisos</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredUsuarios.map((u) => {
                const isCurrentActive = currentUser.id === u.id;

                return (
                  <tr key={u.id} className={`hover:bg-neutral-50/80 transition-colors ${isCurrentActive ? 'bg-blue-50/40' : ''}`}>
                    {/* User info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full ${u.avatarColor} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs`}>
                          {u.nombre.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-neutral-900 text-xs block">
                              {u.nombre}
                            </span>
                            {isCurrentActive && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 bg-blue-600 text-white rounded">
                                TU USUARIO
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-neutral-500 font-mono block">
                            {u.correo}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Cargo */}
                    <td className="py-3 px-4">
                      <span className="font-semibold text-neutral-800 block truncate max-w-xs" title={u.cargo}>
                        {u.cargo}
                      </span>
                      <span className="text-[11px] text-neutral-500 block truncate max-w-xs">
                        {u.departamento}
                      </span>
                    </td>

                    {/* Rol */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-md text-[11px] font-bold border ${
                        u.rol === 'Administrador'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : u.rol === 'Analista de Costos Internos'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : u.rol === 'Observador'
                          ? 'bg-slate-100 text-slate-700 border-slate-300'
                          : u.rol === 'Analista de Costos'
                          ? 'bg-sky-50 text-sky-700 border-sky-200'
                          : u.rol === 'Auditor SIP'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-neutral-100 text-neutral-700 border-neutral-200'
                      }`}>
                        {u.rol}
                      </span>
                    </td>

                    {/* Permisos badges */}
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {u.permisos.ambitoEdicion === 'todo' && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                            Edición Total
                          </span>
                        )}
                        {u.permisos.ambitoEdicion === 'internos' && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300">
                            Solo Internos
                          </span>
                        )}
                        {u.permisos.ambitoEdicion === 'ninguno' && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
                            Observador
                          </span>
                        )}
                        {u.permisos.canImportFiles && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            Importar SIP
                          </span>
                        )}
                        {u.permisos.canManageUsers && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                            Gestionar Usuarios
                          </span>
                        )}
                        {u.permisos.canExportExcel && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-neutral-100 text-neutral-700 border border-neutral-200">
                            Excel
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Estado */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => currentUser.permisos.canManageUsers && handleToggleEstado(u.id)}
                        disabled={!currentUser.permisos.canManageUsers}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                          u.estado === 'Activo'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                        } ${!currentUser.permisos.canManageUsers ? 'cursor-default' : 'cursor-pointer'}`}
                      >
                        {u.estado}
                      </button>
                    </td>

                    {/* Acciones */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleSimularUsuario(u)}
                          title="Simular sesión como este usuario"
                          className="p-1.5 rounded-lg border border-neutral-200 text-neutral-700 hover:bg-neutral-100 transition-colors"
                        >
                          <LogIn className="w-3.5 h-3.5" />
                        </button>
                        {currentUser.permisos.canManageUsers && (
                          <button
                            onClick={() => handleOpenEdit(u)}
                            title="Editar usuario y permisos"
                            className="p-1.5 rounded-lg border border-neutral-200 text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Crear / Editar Usuario */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-neutral-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-neutral-900">
                  {editingUser ? 'Modificar Permisos y Usuario' : 'Registrar Nuevo Usuario'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">Nombre Completo:</label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej. Ing. Carlos Mendoza"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Correo Electrónico:</label>
                  <input
                    type="email"
                    required
                    value={formData.correo}
                    onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
                    placeholder="carlos.mendoza@timaca.com.ve"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Cargo:</label>
                  <input
                    type="text"
                    required
                    value={formData.cargo}
                    onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej. Ingeniero Residente"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Departamento:</label>
                  <input
                    type="text"
                    required
                    value={formData.departamento}
                    onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Rol / Perfil:</label>
                  <select
                    value={formData.rol}
                    onChange={(e) => applyRolePreset(e.target.value as RolUsuario)}
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-bold focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Administrador">Administrador (Total)</option>
                    <option value="Observador">Observador (Solo Lectura)</option>
                    <option value="Analista de Costos">Analista de Costos</option>
                    <option value="Auditor SIP">Auditor SIP</option>
                    <option value="Planificador">Planificador</option>
                    <option value="Visualizador">Visualizador (Solo Lectura)</option>
                  </select>
                </div>
              </div>

              {/* Granular Permissions Checkboxes */}
              <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 space-y-2">
                <span className="font-bold text-neutral-800 uppercase tracking-wider text-[11px] block">
                  Permisos Específicos Asignados:
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.permisos.canEditSalidas}
                      onChange={(e) => setFormData({
                        ...formData,
                        permisos: { ...formData.permisos, canEditSalidas: e.target.checked }
                      })}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Editar salidas y partidas</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.permisos.canCreateSalidas}
                      onChange={(e) => setFormData({
                        ...formData,
                        permisos: { ...formData.permisos, canCreateSalidas: e.target.checked }
                      })}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Crear nuevas salidas</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.permisos.canImportFiles}
                      onChange={(e) => setFormData({
                        ...formData,
                        permisos: { ...formData.permisos, canImportFiles: e.target.checked }
                      })}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Cargar archivos SIP / Nómina</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.permisos.canAuditManoObra}
                      onChange={(e) => setFormData({
                        ...formData,
                        permisos: { ...formData.permisos, canAuditManoObra: e.target.checked }
                      })}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Auditar Nómina y MOD</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.permisos.canExportExcel}
                      onChange={(e) => setFormData({
                        ...formData,
                        permisos: { ...formData.permisos, canExportExcel: e.target.checked }
                      })}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Descargar Excel y reportes</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.permisos.canManageUsers}
                      onChange={(e) => setFormData({
                        ...formData,
                        permisos: { ...formData.permisos, canManageUsers: e.target.checked }
                      })}
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span className="font-semibold text-purple-900">Administrar usuarios</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.permisos.canEditHerramientas ?? false}
                      onChange={(e) => setFormData({
                        ...formData,
                        permisos: { ...formData.permisos, canEditHerramientas: e.target.checked }
                      })}
                      className="rounded text-sky-600 focus:ring-sky-500"
                    />
                    <span className="font-semibold text-sky-900">Módulo Herramientas [HRM]</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.permisos.canEditDotacion ?? false}
                      onChange={(e) => setFormData({
                        ...formData,
                        permisos: { ...formData.permisos, canEditDotacion: e.target.checked }
                      })}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="font-semibold text-indigo-900">Módulo Dotación [EPP]</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.permisos.canEditSeguridad ?? false}
                      onChange={(e) => setFormData({
                        ...formData,
                        permisos: { ...formData.permisos, canEditSeguridad: e.target.checked }
                      })}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="font-semibold text-emerald-900">Módulo Seguridad [SEG/IPER]</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.permisos.canEditCertificados ?? false}
                      onChange={(e) => setFormData({
                        ...formData,
                        permisos: { ...formData.permisos, canEditCertificados: e.target.checked }
                      })}
                      className="rounded text-rose-600 focus:ring-rose-500"
                    />
                    <span className="font-semibold text-rose-900">Módulo Cursos & Certificados [CRT]</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-bold text-neutral-600 hover:bg-neutral-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
                >
                  {editingUser ? 'Guardar Cambios' : 'Registrar Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
