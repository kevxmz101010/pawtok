import React, { useState, useEffect } from 'react';
import { useConfirm } from '../context/ConfirmContext';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Users, PawPrint, CheckCircle2, Trash2, ArrowUpRight, Shield, Activity,
  Pencil, Eye, X, Phone, Mail, MapPin, Clock, Share2, FileText, Heart,
  Calendar, Home, Briefcase, DollarSign, Building2, RotateCcw, SlidersHorizontal,
  UserPlus
} from 'lucide-react';
import { BlurFade } from '../components/ui/blur-fade';
import Header from '../components/Header';
import AdminHeaderNav from '../components/AdminHeaderNav';
import Notification from '../components/Notification';
import AdminAnalyticsChart from '../components/AdminAnalyticsChart';
import AddUserModal from '../components/AddUserModal';
import { ToastMessage } from '../types';

const AdminDashboard = () => {
  const confirm = useConfirm();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [stats, setStats] = useState({
    usuarios: 0, adoptantes: 0, refugios: 0,
    mascotas: 0, disponibles: 0, solicitudes: 0
  });
  
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [refugios, setRefugios] = useState<any[]>([]);
  const [mascotas, setMascotas] = useState<any[]>([]);
  const [actividad, setActividad] = useState<any[]>([]);
  const [auditoriaHistorial, setAuditoriaHistorial] = useState<any[]>([]);
  const [logTab, setLogTab] = useState<'actividad' | 'auditoria'>('actividad');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  
  // Filtros de fecha y rango de horas para actividad y auditoría
  const [filterDate, setFilterDate] = useState<string>('');
  const [filterStartTime, setFilterStartTime] = useState<string>('');
  const [filterEndTime, setFilterEndTime] = useState<string>('');
  const [showFilterPanel, setShowFilterPanel] = useState<boolean>(false);
  
  const [loading, setLoading] = useState(true);

  // Estados de visualización y edición para USUARIOS / ADOPTANTES
  const [viewingUser, setViewingUser] = useState<any | null>(null);
  const [userAdopciones, setUserAdopciones] = useState<any[]>([]);
  const [userAdopcionesLoading, setUserAdopcionesLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [userForm, setUserForm] = useState({ nombre: '', email: '', telefono: '', bio: '' });
  const [userSaving, setUserSaving] = useState(false);

  // Estados de visualización y edición para REFUGIOS
  const [viewingRefugio, setViewingRefugio] = useState<any | null>(null);
  const [refugioAdopciones, setRefugioAdopciones] = useState<any[]>([]);
  const [refugioMascotas, setRefugioMascotas] = useState<any[]>([]);
  const [refugioDetailsLoading, setRefugioDetailsLoading] = useState(false);
  const [refugioTab, setRefugioTab] = useState<'adopciones' | 'mascotas'>('adopciones');
  const [editingRefugio, setEditingRefugio] = useState<any | null>(null);
  const [refugioForm, setRefugioForm] = useState({
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
    horario: '',
    redesSociales: '',
    descripcion: ''
  });
  const [refugioSaving, setRefugioSaving] = useState(false);

  const handleShowToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToasts((prev) => [...prev, { id: Math.random().toString(36).substring(2, 9), type, message }]);
  };

  useEffect(() => {
    if (!isAuthenticated || user?.rol !== 'ADMIN') {
      navigate('/login');
      return;
    }
    fetchData();
  }, [isAuthenticated, user, navigate]);

  const fetchData = async () => {
    try {
      const resStats = await fetch('/api/admin/stats', { credentials: 'include' });
      if (resStats.ok) setStats(await resStats.json());

      const resUsuarios = await fetch('/api/admin/usuarios', { credentials: 'include' });
      if (resUsuarios.ok) setUsuarios(await resUsuarios.json());

      const resRefugios = await fetch('/api/admin/refugios', { credentials: 'include' });
      if (resRefugios.ok) setRefugios(await resRefugios.json());

      const resMascotas = await fetch('/api/mascotas', { credentials: 'include' });
      if (resMascotas.ok) setMascotas(await resMascotas.json());
      
      const resAct = await fetch('/api/admin/actividad', { credentials: 'include' });
      if (resAct.ok) setActividad(await resAct.json());

      const resAud = await fetch('/api/admin/auditoria-historial', { credentials: 'include' });
      if (resAud.ok) setAuditoriaHistorial(await resAud.json());
      
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleUserAdded = (newUser: any) => {
    setUsuarios(prev => [newUser, ...prev]);
    setStats(prev => ({
      ...prev,
      usuarios: prev.usuarios + 1,
      adoptantes: prev.adoptantes + 1,
    }));
  };

  const deleteUser = async (id: number) => {
    if (!await confirm("¿Seguro que deseas eliminar este usuario?")) return;
    try {
      const res = await fetch(`/api/admin/usuarios/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) {
        setUsuarios(usuarios.filter(u => u.id !== id));
        handleShowToast('Usuario eliminado correctamente', 'success');
      }
    } catch (err) {
      handleShowToast('Error al eliminar usuario', 'error');
    }
  };

  const deleteRefugio = async (id: number) => {
    if (!await confirm("¿Seguro que deseas eliminar este refugio?")) return;
    try {
      const res = await fetch(`/api/admin/refugios/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) {
        setRefugios(refugios.filter(r => r.id !== id));
        handleShowToast('Refugio eliminado correctamente', 'success');
      }
    } catch (err) {
      handleShowToast('Error al eliminar refugio', 'error');
    }
  };

  const getFileUrl = (path?: string | null): string => {
    if (!path) return '';
    const trimmed = path.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
    let clean = trimmed.replace(/^\/?api\/files\/?/, '');
    clean = clean.replace(/\/+/g, '/');
    if (!clean.startsWith('/')) clean = '/' + clean;
    return clean;
  };

  // Handlers para Usuario / Adoptante
  const handleOpenViewUser = async (u: any) => {
    setViewingUser(u);
    setUserAdopcionesLoading(true);
    try {
      const res = await fetch(`/api/admin/usuarios/${u.id}/adopciones`, { credentials: 'include' });
      if (res.ok) {
        setUserAdopciones(await res.json());
      } else {
        setUserAdopciones([]);
      }
    } catch (err) {
      console.error(err);
      setUserAdopciones([]);
    }
    setUserAdopcionesLoading(false);
  };

  const handleOpenEditUser = (u: any) => {
    setEditingUser(u);
    setUserForm({
      nombre: u.nombre || '',
      email: u.email || '',
      telefono: u.telefono || '',
      bio: u.bio || ''
    });
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.nombre.trim() || !userForm.email.trim()) {
      handleShowToast('Nombre y correo son obligatorios', 'error');
      return;
    }
    setUserSaving(true);
    try {
      const res = await fetch(`/api/admin/usuarios/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(userForm)
      });
      if (res.ok) {
        const updated = await res.json();
        setUsuarios(prev => prev.map(u => u.id === updated.id ? { ...u, ...updated } : u));
        if (viewingUser?.id === updated.id) {
          setViewingUser((prev: any) => ({ ...prev, ...updated }));
        }
        setEditingUser(null);
        handleShowToast('Usuario actualizado exitosamente', 'success');
      } else {
        const errData = await res.json().catch(() => null);
        handleShowToast(errData?.message || 'Error al actualizar usuario', 'error');
      }
    } catch (err) {
      handleShowToast('Error de red al actualizar usuario', 'error');
    }
    setUserSaving(false);
  };

  // Handlers para Refugio
  const handleOpenViewRefugio = async (r: any) => {
    setViewingRefugio(r);
    setRefugioTab('adopciones');
    setRefugioDetailsLoading(true);
    try {
      const [resAdop, resMasc] = await Promise.all([
        fetch(`/api/admin/refugios/${r.id}/adopciones`, { credentials: 'include' }),
        fetch(`/api/admin/refugios/${r.id}/mascotas`, { credentials: 'include' })
      ]);
      if (resAdop.ok) setRefugioAdopciones(await resAdop.json());
      else setRefugioAdopciones([]);
      if (resMasc.ok) setRefugioMascotas(await resMasc.json());
      else setRefugioMascotas([]);
    } catch (err) {
      console.error(err);
      setRefugioAdopciones([]);
      setRefugioMascotas([]);
    }
    setRefugioDetailsLoading(false);
  };

  const handleOpenEditRefugio = (r: any) => {
    setEditingRefugio(r);
    setRefugioForm({
      nombre: r.nombre || '',
      email: r.email || '',
      telefono: r.telefono || '',
      direccion: r.direccion || '',
      horario: r.horario || '',
      redesSociales: r.redesSociales || '',
      descripcion: r.descripcion || ''
    });
  };

  const handleSaveRefugio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refugioForm.nombre.trim()) {
      handleShowToast('El nombre del refugio es obligatorio', 'error');
      return;
    }
    setRefugioSaving(true);
    try {
      const res = await fetch(`/api/admin/refugios/${editingRefugio.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(refugioForm)
      });
      if (res.ok) {
        const updated = await res.json();
        setRefugios(prev => prev.map(r => r.id === updated.id ? { ...r, ...updated } : r));
        if (viewingRefugio?.id === updated.id) {
          setViewingRefugio((prev: any) => ({ ...prev, ...updated }));
        }
        setEditingRefugio(null);
        handleShowToast('Refugio actualizado exitosamente', 'success');
      } else {
        const errData = await res.json().catch(() => null);
        handleShowToast(errData?.message || 'Error al actualizar refugio', 'error');
      }
    } catch (err) {
      handleShowToast('Error de conexión al actualizar refugio', 'error');
    }
    setRefugioSaving(false);
  };

  const isWithinTimeFilter = (isoDateStr?: string | null) => {
    if (!isoDateStr) return false;
    if (!filterDate && !filterStartTime && !filterEndTime) return true;

    const date = new Date(isoDateStr);
    if (isNaN(date.getTime())) return true;

    if (filterDate) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const itemDateOnly = `${year}-${month}-${day}`;
      if (itemDateOnly !== filterDate) return false;
    }

    const itemMinutes = date.getHours() * 60 + date.getMinutes();

    if (filterStartTime) {
      const [sh, sm] = filterStartTime.split(':').map(Number);
      const startMinutes = (sh || 0) * 60 + (sm || 0);
      if (itemMinutes < startMinutes) return false;
    }

    if (filterEndTime) {
      const [eh, em] = filterEndTime.split(':').map(Number);
      const endMinutes = (eh || 0) * 60 + (em || 0);
      if (itemMinutes > endMinutes) return false;
    }

    return true;
  };

  const filteredActividad = actividad.filter(act => isWithinTimeFilter(act.fecha));
  const filteredAuditoria = auditoriaHistorial.filter(aud => isWithinTimeFilter(aud.fechaAccion));

  const formatAuditoriaAccion = (accion?: string) => {
    if (!accion) return { label: 'Auditado', color: 'bg-blue-50 text-[#0B84FF] border-blue-200' };
    const lower = accion.toLowerCase();
    if (lower.includes('aprobada')) {
      return { label: 'Solicitud Aprobada', color: 'bg-green-50 text-green-700 border-green-200' };
    }
    if (lower.includes('rechazada')) {
      return { label: 'Solicitud Rechazada', color: 'bg-red-50 text-red-700 border-red-200' };
    }
    if (lower.includes('inactivado_usuario')) {
      return { label: 'Inactivado Usuario', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    }
    if (lower.includes('eliminado_por_admin')) {
      return { label: 'Eliminado por Admin', color: 'bg-purple-50 text-purple-700 border-purple-200' };
    }
    if (lower.includes('actualizado_historial_medico')) {
      return { label: 'Historial Médico Editado', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
    }
    if (lower.includes('eliminado_historial_medico')) {
      return { label: 'Historial Médico Eliminado', color: 'bg-rose-50 text-rose-700 border-rose-200' };
    }
    return { label: accion, color: 'bg-blue-50 text-[#0B84FF] border-blue-200' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-3 border-[#0B84FF] border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-semibold text-gray-400">Cargando panel Pawtok...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans text-gray-800 bg-gray-50/50 selection:bg-[#0B84FF] selection:text-white pb-20 relative">
      
      {/* GLOBAL HEADER */}
      <Header
        onShowToast={handleShowToast}
        onSelectDrop={() => {}}
        searchQuery=""
        setSearchQuery={() => {}}
      />

      {/* MAIN CONTAINER */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28">
        
        {/* ADMIN PROFILE & TAB NAV HEADER */}
        <AdminHeaderNav activeTab="resumen" />

        {/* STAT METRICS GRID */}
        <BlurFade delay={0.15} inView>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {/* CARD 1: ADOPTANTES REGISTRADOS */}
            <div className="bg-white/90 backdrop-blur-xl border border-gray-100/80 p-6 rounded-[2rem] shadow-[0_16px_36px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0B84FF] flex items-center justify-center shadow-sm">
                  <Heart size={24} className="text-[#0B84FF] fill-[#0B84FF]/20" />
                </div>
                <span className="px-2.5 py-1 text-xs font-bold bg-blue-50 text-[#0B84FF] rounded-full whitespace-nowrap">
                  +Adoptantes
                </span>
              </div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Adoptantes Registrados</div>
              <div className="text-4xl font-black text-gray-900 tracking-tight mt-1">{stats.adoptantes}</div>
              <div className="mt-4 pt-3 border-t border-gray-100 text-xs font-semibold text-gray-500 flex items-center justify-between gap-2 whitespace-nowrap">
                <span className="whitespace-nowrap">Total cuentas: <strong className="text-gray-900 font-bold">{stats.usuarios}</strong></span>
                <span className="whitespace-nowrap">Refugios: <strong className="text-[#0B84FF] font-bold">{refugios.length}</strong></span>
              </div>
            </div>

            {/* CARD 2: MASCOTAS */}
            <div className="bg-white/90 backdrop-blur-xl border border-gray-100/80 p-6 rounded-[2rem] shadow-[0_16px_36px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center shadow-sm">
                  <PawPrint size={24} />
                </div>
                <span className="px-2.5 py-1 text-xs font-bold bg-orange-50 text-orange-600 rounded-full">
                  Registradas
                </span>
              </div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mascotas</div>
              <div className="text-4xl font-black text-gray-900 tracking-tight mt-1">{stats.mascotas}</div>
              <div className="mt-4 pt-3 border-t border-gray-100 text-xs font-semibold text-gray-500 flex items-center justify-between">
                <span>Disponibles: <strong className="text-green-600 font-bold">{stats.disponibles}</strong></span>
                <Link to="/admin/mascotas" className="text-[#0B84FF] hover:underline flex items-center gap-0.5">
                  Ver todas <ArrowUpRight size={12} />
                </Link>
              </div>
            </div>

            {/* CARD 3: SOLICITUDES */}
            <div className="bg-white/90 backdrop-blur-xl border border-gray-100/80 p-6 rounded-[2rem] shadow-[0_16px_36px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-500 flex items-center justify-center shadow-sm">
                  <CheckCircle2 size={24} />
                </div>
                <span className="px-2.5 py-1 text-xs font-bold bg-green-50 text-green-600 rounded-full">
                  Procesadas
                </span>
              </div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Solicitudes</div>
              <div className="text-4xl font-black text-gray-900 tracking-tight mt-1">{stats.solicitudes}</div>
              <div className="mt-4 pt-3 border-t border-gray-100 text-xs font-semibold text-gray-500 flex items-center justify-between">
                <span>Adopciones coordinadas</span>
                <Link to="/admin/solicitudes-refugio" className="text-[#0B84FF] hover:underline flex items-center gap-0.5">
                  Solicitudes <ArrowUpRight size={12} />
                </Link>
              </div>
            </div>
          </div>

          {/* DASHBOARDS CON GRÁFICAS INTERACTIVAS (DÍA / SEMANA / MES) */}
          <AdminAnalyticsChart
            usuarios={usuarios}
            mascotas={mascotas}
            refugios={refugios}
          />

          {/* TABLES GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            
            {/* USUARIOS TABLE */}
            <div className="bg-white/90 backdrop-blur-xl border border-gray-100/80 rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col h-[480px]">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0B84FF] flex items-center justify-center font-bold">
                    <Users size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">Usuarios Registrados</h3>
                    <p className="text-xs text-gray-400 font-medium">Lista de usuarios en la plataforma</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddUserModalOpen(true)}
                    className="px-3.5 py-1.5 bg-[#0B84FF] hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-[#0B84FF]/20 cursor-pointer active:scale-95"
                    title="Registrar nuevo adoptante en la plataforma"
                  >
                    <UserPlus size={14} />
                    <span>Agregar Adoptante</span>
                  </button>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-extrabold rounded-full">
                    {usuarios.length}
                  </span>
                </div>
              </div>
              
              <div className="overflow-y-auto p-4 flex-1">
                <table className="w-full text-left border-separate border-spacing-y-2">
                  <thead className="text-gray-400 text-xs font-semibold px-4 sticky top-0 bg-white/95 backdrop-blur-md z-10">
                    <tr>
                      <th className="px-3.5 py-2.5 font-medium whitespace-nowrap">Usuario</th>
                      <th className="px-3.5 py-2.5 font-medium whitespace-nowrap">Email</th>
                      <th className="px-3.5 py-2.5 font-medium whitespace-nowrap text-center">Rol</th>
                      <th className="px-3.5 py-2.5 font-medium whitespace-nowrap text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map(u => (
                      <tr key={u.id} className="bg-gray-50/60 hover:bg-blue-50/30 transition-colors rounded-2xl group">
                        <td className="px-3.5 py-3 font-bold text-gray-900 rounded-l-2xl text-sm whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0B84FF] to-blue-400 text-white font-bold text-xs flex items-center justify-center shrink-0">
                              {u.nombre ? u.nombre.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <span className="truncate max-w-[95px] sm:max-w-[120px]" title={u.nombre}>{u.nombre}</span>
                          </div>
                        </td>
                        <td className="px-3.5 py-3 text-xs text-gray-500 whitespace-nowrap">
                          <span className="truncate max-w-[105px] sm:max-w-[130px] block" title={u.email}>{u.email}</span>
                        </td>
                        <td className="px-3.5 py-3 text-xs font-bold whitespace-nowrap text-center">
                          <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[10px] uppercase font-extrabold whitespace-nowrap tracking-wide ${
                            u.rol === 'ADMIN' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                            u.rol === 'REFUGIO' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                            'bg-blue-50 text-[#0B84FF] border border-blue-200'
                          }`}>
                            {u.rol}
                          </span>
                        </td>
                        <td className="px-3.5 py-3 text-right rounded-r-2xl whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenViewUser(u)}
                              className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition cursor-pointer"
                              title="Ver expediente y solicitudes de adopción"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              onClick={() => handleOpenEditUser(u)}
                              className="p-1.5 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-xl transition cursor-pointer"
                              title="Editar datos del usuario"
                            >
                              <Pencil size={15} />
                            </button>
                            {u.rol !== 'ADMIN' && (
                              <button
                                onClick={() => deleteUser(u.id)}
                                className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                                title="Eliminar usuario"
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* REFUGIOS TABLE */}
            <div className="bg-white/90 backdrop-blur-xl border border-gray-100/80 rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col h-[480px]">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center font-bold">
                    <Shield size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">Refugios Aliados</h3>
                    <p className="text-xs text-gray-400 font-medium">Organizaciones registradas</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-orange-50 text-orange-600 text-xs font-extrabold rounded-full">
                  {refugios.length}
                </span>
              </div>
              
              <div className="overflow-y-auto p-4 flex-1">
                <table className="w-full text-left border-separate border-spacing-y-2">
                  <thead className="text-gray-400 text-xs font-semibold px-4 sticky top-0 bg-white/95 backdrop-blur-md z-10">
                    <tr>
                      <th className="px-3.5 py-2.5 font-medium whitespace-nowrap">Refugio</th>
                      <th className="px-3.5 py-2.5 font-medium whitespace-nowrap">Teléfono</th>
                      <th className="px-3.5 py-2.5 font-medium whitespace-nowrap text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {refugios.map(r => (
                      <tr key={r.id} className="bg-gray-50/60 hover:bg-orange-50/30 transition-colors rounded-2xl group">
                        <td className="px-3.5 py-3 font-bold text-gray-900 rounded-l-2xl text-sm whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-bold text-xs flex items-center justify-center shrink-0">
                              {r.nombre ? r.nombre.charAt(0).toUpperCase() : 'R'}
                            </div>
                            <span className="truncate max-w-[120px] sm:max-w-[150px]" title={r.nombre}>{r.nombre}</span>
                          </div>
                        </td>
                        <td className="px-3.5 py-3 text-xs text-gray-500 whitespace-nowrap truncate max-w-[110px] sm:max-w-[130px]">{r.telefono || 'Sin teléfono'}</td>
                        <td className="px-3.5 py-3 text-right rounded-r-2xl whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenViewRefugio(r)}
                              className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition cursor-pointer"
                              title="Ver expediente, mascotas y adopciones recibidas"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              onClick={() => handleOpenEditRefugio(r)}
                              className="p-1.5 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-xl transition cursor-pointer"
                              title="Editar información del refugio"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={() => deleteRefugio(r.id)}
                              className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                              title="Eliminar refugio"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* ACTIVIDAD Y AUDITORÍA */}
          <div className="bg-white/90 backdrop-blur-xl border border-gray-100/80 rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#0B84FF] flex items-center justify-center font-bold shadow-2xs shrink-0">
                  <Activity size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">
                    {logTab === 'actividad' ? 'Actividad Reciente' : 'Auditoría de Historial'}
                  </h3>
                  <p className="text-xs text-gray-400 font-medium">
                    {logTab === 'actividad' 
                      ? 'Registro general de inicios de sesión y movimientos del sistema' 
                      : 'Auditoría inmutable de resoluciones, bajas y cambios en adopciones (tabla auditoria_historial)'}
                  </p>
                </div>
              </div>

              {/* Controles de Cabecera: Botón Filtro + Alternar Pestañas */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Botón para desplegar filtro de fecha y rango de horas */}
                <button
                  type="button"
                  onClick={() => setShowFilterPanel(!showFilterPanel)}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border ${
                    filterDate || filterStartTime || filterEndTime
                      ? 'bg-[#0B84FF] text-white border-[#0B84FF] shadow-sm'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 shadow-2xs'
                  }`}
                  title="Filtrar registros por fecha y rango de hora"
                >
                  <Calendar size={14} className={filterDate || filterStartTime || filterEndTime ? 'text-white' : 'text-[#0B84FF]'} />
                  <span>Filtrar por fecha y hora</span>
                  {(filterDate || filterStartTime || filterEndTime) && (
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  )}
                </button>

                {/* Botones de alternar */}
                <div className="flex items-center bg-gray-100/90 p-1 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setLogTab('actividad')}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      logTab === 'actividad'
                        ? 'bg-white text-gray-900 shadow-xs'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    Actividad ({filteredActividad.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogTab('auditoria')}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      logTab === 'auditoria'
                        ? 'bg-white text-[#0B84FF] shadow-xs'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    Auditoría Historial ({filteredAuditoria.length})
                  </button>
                </div>
              </div>
            </div>

            {/* BARRA DE FILTRADO POR FECHA Y RANGO DE HORAS (DE QUÉ HORA A QUÉ HORA) */}
            {showFilterPanel && (
              <div className="px-6 py-4 bg-gradient-to-r from-blue-50/70 via-gray-50/60 to-blue-50/50 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4 animate-in fade-in duration-200">
                <div className="flex flex-wrap items-center gap-3">
                  {/* Selector de Fecha */}
                  <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-2xl px-3.5 py-2 shadow-2xs">
                    <Calendar size={15} className="text-[#0B84FF] shrink-0" />
                    <span className="text-xs font-semibold text-gray-500">Fecha:</span>
                    <input
                      type="date"
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                      className="text-xs font-bold text-gray-800 focus:outline-none bg-transparent cursor-pointer"
                    />
                    {filterDate && (
                      <button 
                        type="button"
                        onClick={() => setFilterDate('')} 
                        className="text-gray-400 hover:text-gray-700 cursor-pointer"
                        title="Quitar fecha"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>

                  {/* Selector de Hora Desde */}
                  <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-2xl px-3.5 py-2 shadow-2xs">
                    <Clock size={15} className="text-[#0B84FF] shrink-0" />
                    <span className="text-xs font-semibold text-gray-500">De hora:</span>
                    <input
                      type="time"
                      value={filterStartTime}
                      onChange={(e) => setFilterStartTime(e.target.value)}
                      className="text-xs font-bold text-gray-800 focus:outline-none bg-transparent cursor-pointer"
                    />
                    {filterStartTime && (
                      <button 
                        type="button"
                        onClick={() => setFilterStartTime('')} 
                        className="text-gray-400 hover:text-gray-700 cursor-pointer"
                        title="Quitar hora inicio"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>

                  {/* Selector de Hora Hasta */}
                  <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-2xl px-3.5 py-2 shadow-2xs">
                    <Clock size={15} className="text-[#0B84FF] shrink-0" />
                    <span className="text-xs font-semibold text-gray-500">A hora:</span>
                    <input
                      type="time"
                      value={filterEndTime}
                      onChange={(e) => setFilterEndTime(e.target.value)}
                      className="text-xs font-bold text-gray-800 focus:outline-none bg-transparent cursor-pointer"
                    />
                    {filterEndTime && (
                      <button 
                        type="button"
                        onClick={() => setFilterEndTime('')} 
                        className="text-gray-400 hover:text-gray-700 cursor-pointer"
                        title="Quitar hora fin"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>

                  {/* Botón Rápido "Hoy" */}
                  <button
                    type="button"
                    onClick={() => {
                      const now = new Date();
                      const y = now.getFullYear();
                      const m = String(now.getMonth() + 1).padStart(2, '0');
                      const d = String(now.getDate()).padStart(2, '0');
                      setFilterDate(`${y}-${m}-${d}`);
                    }}
                    className="px-3.5 py-2 bg-blue-50 text-[#0B84FF] hover:bg-blue-100 font-bold text-xs rounded-2xl transition cursor-pointer border border-blue-200/60"
                  >
                    Hoy
                  </button>

                  {/* Botón Limpiar Todo */}
                  {(filterDate || filterStartTime || filterEndTime) && (
                    <button
                      type="button"
                      onClick={() => {
                        setFilterDate('');
                        setFilterStartTime('');
                        setFilterEndTime('');
                      }}
                      className="px-3.5 py-2 bg-gray-200/80 hover:bg-gray-300 text-gray-700 font-bold text-xs rounded-2xl transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw size={13} />
                      <span>Limpiar filtros</span>
                    </button>
                  )}
                </div>

                <div className="text-xs text-gray-500 font-medium">
                  Coincidencias: <strong className="text-gray-900 font-bold">{logTab === 'actividad' ? filteredActividad.length : filteredAuditoria.length}</strong> registros
                </div>
              </div>
            )}
            
            <div className="overflow-x-auto">
              {logTab === 'actividad' ? (
                <table className="w-full min-w-[720px] text-left border-collapse">
                  <thead className="text-gray-400 text-xs font-semibold bg-gray-50/70 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-3.5 font-medium whitespace-nowrap">Fecha y Hora</th>
                      <th className="px-6 py-3.5 font-medium whitespace-nowrap">Usuario</th>
                      <th className="px-6 py-3.5 font-medium whitespace-nowrap text-center">Acción</th>
                      <th className="px-6 py-3.5 font-medium whitespace-nowrap">Detalles</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {filteredActividad.slice(0, 30).map((act, idx) => (
                      <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                        <td className="px-6 py-3.5 text-xs text-gray-500 whitespace-nowrap font-medium">
                          {new Date(act.fecha).toLocaleString()}
                        </td>
                        <td className="px-6 py-3.5 font-bold text-gray-900 text-xs sm:text-sm whitespace-nowrap">
                          {act.nombreUsuario}
                        </td>
                        <td className="px-6 py-3.5 text-xs whitespace-nowrap text-center">
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-[#0B84FF] font-extrabold border border-blue-100 text-[11px] whitespace-nowrap">
                            {act.accion}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-xs text-gray-600 font-medium">
                          {act.detalles}
                        </td>
                      </tr>
                    ))}
                    {filteredActividad.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-14 text-center text-gray-400 text-sm">
                          {filterDate || filterStartTime || filterEndTime 
                            ? 'No se encontraron registros de actividad en el rango seleccionado' 
                            : 'No hay registros de actividad reciente'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              ) : (
                <table className="w-full min-w-[950px] text-left border-collapse">
                  <thead className="text-gray-400 text-xs font-semibold bg-gray-50/70 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-3.5 font-medium whitespace-nowrap">Fecha y Hora</th>
                      <th className="px-6 py-3.5 font-medium whitespace-nowrap">Adoptante</th>
                      <th className="px-6 py-3.5 font-medium whitespace-nowrap">Mascota</th>
                      <th className="px-6 py-3.5 font-medium whitespace-nowrap text-center">Estado Previo</th>
                      <th className="px-6 py-3.5 font-medium whitespace-nowrap text-center">Acción Realizada</th>
                      <th className="px-6 py-3.5 font-medium whitespace-nowrap">Motivo / Detalle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {filteredAuditoria.slice(0, 30).map((aud, idx) => {
                      const badge = formatAuditoriaAccion(aud.accion);
                      return (
                        <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                          <td className="px-6 py-3.5 text-xs text-gray-500 whitespace-nowrap font-medium">
                            {aud.fechaAccion ? new Date(aud.fechaAccion).toLocaleString() : 'N/A'}
                          </td>
                          <td className="px-6 py-3.5 font-bold text-gray-900 text-xs sm:text-sm whitespace-nowrap">
                            {aud.nombreAdoptante || 'N/A'}
                          </td>
                          <td className="px-6 py-3.5 text-xs sm:text-sm font-bold text-gray-800 whitespace-nowrap">
                            {aud.nombreMascota || 'Mascota'}
                          </td>
                          <td className="px-6 py-3.5 text-xs whitespace-nowrap text-center">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 font-extrabold text-[11px] whitespace-nowrap uppercase tracking-wider">
                              {aud.estadoPrevio || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 text-xs whitespace-nowrap text-center">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full font-extrabold text-[11px] border whitespace-nowrap tracking-wide ${badge.color}`}>
                              {badge.label}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 text-xs text-gray-600 font-medium min-w-[250px]">
                            {aud.motivo || 'Sin detalles'}
                          </td>
                        </tr>
                      );
                    })}
                    {filteredAuditoria.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-14 text-center text-gray-400 text-sm">
                          {filterDate || filterStartTime || filterEndTime 
                            ? 'No se encontraron registros de auditoría en el rango seleccionado' 
                            : 'No hay registros en la tabla auditoria_historial'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </BlurFade>

        {/* MODAL 1: EXPEDIENTE Y ADOPCIONES DEL USUARIO / ADOPTANTE */}
        {viewingUser && (
          <div 
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={() => setViewingUser(null)}
          >
            <div 
              className="relative max-w-3xl w-full max-h-[90vh] bg-white rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header del modal */}
              <div className="px-6 py-5 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0B84FF] to-blue-400 text-white font-black text-lg flex items-center justify-center shadow-sm shrink-0">
                    {viewingUser.nombre ? viewingUser.nombre.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                        {viewingUser.nombre}
                      </h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        viewingUser.rol === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                        viewingUser.rol === 'REFUGIO' ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-[#0B84FF]'
                      }`}>
                        {viewingUser.rol}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 font-medium">Expediente del usuario e historial de adopciones</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleOpenEditUser(viewingUser)}
                    className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Pencil size={13} /> Editar datos
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewingUser(null)}
                    className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition cursor-pointer"
                    title="Cerrar"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Contenido con scroll */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1">
                {/* Tarjeta de Información General */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs bg-slate-50/60 p-4 rounded-2xl border border-gray-100">
                  <div className="space-y-1 min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                      <Mail size={12} /> Correo Electrónico
                    </span>
                    <p className="font-semibold text-gray-800 text-sm break-all">{viewingUser.email || 'No registrado'}</p>
                  </div>
                  <div className="space-y-1 min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                      <Phone size={12} /> Teléfono
                    </span>
                    <p className="font-semibold text-gray-800 text-sm break-all">{viewingUser.telefono || 'Sin teléfono'}</p>
                  </div>
                  {viewingUser.creadoEn && (
                    <div className="space-y-1 min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                        <Calendar size={12} /> Fecha de Registro
                      </span>
                      <p className="font-semibold text-gray-700">{new Date(viewingUser.creadoEn).toLocaleDateString()}</p>
                    </div>
                  )}
                  {viewingUser.bio && (
                    <div className="space-y-1 sm:col-span-2 pt-1 border-t border-gray-200/50 min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Biografía / Presentación</span>
                      <p className="font-medium text-gray-700 text-sm leading-relaxed break-words break-all [overflow-wrap:anywhere]">{viewingUser.bio}</p>
                    </div>
                  )}
                </div>

                {/* Historial de Adopciones Solicitadas */}
                <div>
                  <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                    <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
                      <Heart size={14} className="text-red-500" />
                      Solicitudes de Adopción Realizadas ({userAdopciones.length})
                    </h4>
                    <span className="text-[11px] text-gray-400">Postulaciones enviadas por este usuario</span>
                  </div>

                  {userAdopcionesLoading ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-2 text-gray-400">
                      <div className="w-8 h-8 border-2 border-[#0B84FF] border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-medium">Cargando solicitudes de adopción...</span>
                    </div>
                  ) : userAdopciones.length === 0 ? (
                    <div className="py-10 text-center bg-gray-50/70 rounded-2xl border border-dashed border-gray-200">
                      <Heart size={30} className="mx-auto text-gray-300 mb-2" />
                      <p className="text-xs font-bold text-gray-600">No tiene solicitudes de adopción registradas</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">El usuario no se ha postulado para adoptar ninguna mascota aún.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {userAdopciones.map((adop: any) => (
                        <div 
                          key={adop.id}
                          className="p-4 rounded-2xl border border-gray-100 bg-white hover:border-blue-200 transition shadow-xs space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-2.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-xs shrink-0">
                                <PawPrint size={18} />
                              </div>
                              <div>
                                <h5 className="font-bold text-gray-900 text-sm">{adop.mascotaNombre}</h5>
                                <p className="text-[11px] text-gray-500">
                                  {adop.mascotaTipo} • {adop.mascotaRaza || 'Mestizo'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase ${
                                adop.estado === 'APROBADA' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                adop.estado === 'RECHAZADA' ? 'bg-red-50 text-red-700 border border-red-200' :
                                'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}>
                                {adop.estado}
                              </span>
                              {adop.solicitadoEn && (
                                <span className="text-[10px] text-gray-400">
                                  {new Date(adop.solicitadoEn).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Mensaje */}
                          {adop.mensaje && (
                            <div className="p-2.5 bg-gray-50 rounded-xl text-xs text-gray-700 italic border-l-2 border-[#0B84FF] break-words break-all [overflow-wrap:anywhere]">
                              "{adop.mensaje}"
                            </div>
                          )}

                          {/* Detalles del formulario de adopción */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-gray-600 pt-1">
                            {adop.ocupacion && (
                              <div className="p-2 bg-gray-50/60 rounded-lg">
                                <span className="text-[10px] font-bold text-gray-400 block">Ocupación</span>
                                <span className="font-semibold text-gray-800">{adop.ocupacion}</span>
                              </div>
                            )}
                            {adop.tipoVivienda && (
                              <div className="p-2 bg-gray-50/60 rounded-lg">
                                <span className="text-[10px] font-bold text-gray-400 block">Vivienda</span>
                                <span className="font-semibold text-gray-800">{adop.tipoVivienda}</span>
                              </div>
                            )}
                            {adop.ingresosAprox && (
                              <div className="p-2 bg-gray-50/60 rounded-lg">
                                <span className="text-[10px] font-bold text-gray-400 block">Ingresos Aprox.</span>
                                <span className="font-semibold text-gray-800">{adop.ingresosAprox}</span>
                              </div>
                            )}
                            {adop.tieneMascotas && (
                              <div className="p-2 bg-gray-50/60 rounded-lg">
                                <span className="text-[10px] font-bold text-gray-400 block">Otras Mascotas</span>
                                <span className="font-semibold text-gray-800">{adop.tieneMascotas}</span>
                              </div>
                            )}
                          </div>

                          {(adop.fechaVisita || adop.horaVisita) && (
                            <div className="text-[11px] text-blue-700 bg-blue-50/50 p-2 rounded-xl flex items-center gap-1.5 font-medium">
                              <Clock size={12} /> Fecha propuesta de visita: {adop.fechaVisita || ''} {adop.horaVisita || ''}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setViewingUser(null)}
                  className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Cerrar Expediente
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 2: EDITAR DATOS DEL USUARIO / ADOPTANTE */}
        {editingUser && (
          <div 
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={() => !userSaving && setEditingUser(null)}
          >
            <div 
              className="relative max-w-lg w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-200 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-6 py-5 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <Pencil size={17} className="text-amber-600" />
                    Editar Información del Usuario
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">Modifica los datos personales sin alterar el rol</p>
                </div>
                <button
                  type="button"
                  disabled={userSaving}
                  onClick={() => setEditingUser(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSaveUser}>
                <div className="p-6 space-y-4 text-xs">
                  {/* Indicador de Rol (Inmutable) */}
                  <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-2xl flex items-center justify-between">
                    <span className="font-bold text-blue-900 flex items-center gap-1.5">
                      <Shield size={14} className="text-[#0B84FF]" /> Rol en la plataforma:
                    </span>
                    <span className="px-2.5 py-1 bg-[#0B84FF] text-white font-extrabold text-[11px] rounded-full uppercase">
                      {editingUser.rol}
                    </span>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Nombre Completo *</label>
                    <input
                      type="text"
                      required
                      value={userForm.nombre}
                      onChange={(e) => setUserForm({ ...userForm, nombre: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B84FF] transition"
                      placeholder="Ej. Juan Pérez"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Correo Electrónico *</label>
                    <input
                      type="email"
                      required
                      value={userForm.email}
                      onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B84FF] transition"
                      placeholder="juan@ejemplo.com"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Teléfono de Contacto</label>
                    <input
                      type="tel"
                      value={userForm.telefono}
                      onChange={(e) => setUserForm({ ...userForm, telefono: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B84FF] transition"
                      placeholder="+57 300 123 4567"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Biografía / Presentación</label>
                    <textarea
                      rows={3}
                      value={userForm.bio}
                      onChange={(e) => setUserForm({ ...userForm, bio: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B84FF] transition resize-none"
                      placeholder="Breve descripción del usuario o perfil..."
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    disabled={userSaving}
                    onClick={() => setEditingUser(null)}
                    className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-200/70 rounded-xl transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={userSaving}
                    className="px-5 py-2 bg-[#0B84FF] hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {userSaving ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 3: EXPEDIENTE, MASCOTAS Y ADOPCIONES DEL REFUGIO */}
        {viewingRefugio && (
          <div 
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={() => setViewingRefugio(null)}
          >
            <div 
              className="relative max-w-4xl w-full max-h-[90vh] bg-white rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header del modal */}
              <div className="px-6 py-5 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 border border-orange-200 overflow-hidden flex items-center justify-center shrink-0">
                    {viewingRefugio.logoUrl ? (
                      <img src={getFileUrl(viewingRefugio.logoUrl)} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <Building2 size={24} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                        {viewingRefugio.nombre}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-700">
                        {viewingRefugio.estadoVerificacion || 'Refugio Aliado'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 font-medium">Información, mascotas registradas y solicitudes recibidas</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleOpenEditRefugio(viewingRefugio)}
                    className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Pencil size={13} /> Editar datos
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewingRefugio(null)}
                    className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition cursor-pointer"
                    title="Cerrar"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Ficha rápida de contacto */}
              <div className="px-6 py-3.5 bg-slate-50 border-b border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="flex items-center gap-2 text-gray-700 truncate">
                  <Mail size={13} className="text-gray-400 shrink-0" />
                  <span className="truncate">{viewingRefugio.email || 'Sin correo registrado'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700 truncate">
                  <Phone size={13} className="text-gray-400 shrink-0" />
                  <span className="truncate">{viewingRefugio.telefono || 'Sin teléfono'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700 truncate">
                  <MapPin size={13} className="text-gray-400 shrink-0" />
                  <span className="truncate">{viewingRefugio.direccion || 'Sin dirección'}</span>
                </div>
              </div>

              {/* Pestañas de navegación interna */}
              <div className="px-6 pt-3 border-b border-gray-100 flex items-center gap-4 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setRefugioTab('adopciones')}
                  className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition cursor-pointer ${
                    refugioTab === 'adopciones'
                      ? 'border-[#0B84FF] text-[#0B84FF]'
                      : 'border-transparent text-gray-400 hover:text-gray-700'
                  }`}
                >
                  <Heart size={14} /> Solicitudes de Adopción ({refugioAdopciones.length})
                </button>
                <button
                  type="button"
                  onClick={() => setRefugioTab('mascotas')}
                  className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition cursor-pointer ${
                    refugioTab === 'mascotas'
                      ? 'border-[#0B84FF] text-[#0B84FF]'
                      : 'border-transparent text-gray-400 hover:text-gray-700'
                  }`}
                >
                  <PawPrint size={14} /> Mascotas del Refugio ({refugioMascotas.length})
                </button>
              </div>

              {/* Contenido con scroll */}
              <div className="p-6 overflow-y-auto space-y-4 flex-1">
                {refugioDetailsLoading ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-2 text-gray-400">
                    <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-medium">Cargando datos del refugio...</span>
                  </div>
                ) : refugioTab === 'adopciones' ? (
                  /* TAB: ADOPCIONES RECIBIDAS */
                  refugioAdopciones.length === 0 ? (
                    <div className="py-10 text-center bg-gray-50/70 rounded-2xl border border-dashed border-gray-200">
                      <Heart size={30} className="mx-auto text-gray-300 mb-2" />
                      <p className="text-xs font-bold text-gray-600">No hay solicitudes de adopción recibidas</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">Ningún usuario ha enviado solicitudes para mascotas de este refugio.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {refugioAdopciones.map((adop: any) => (
                        <div 
                          key={adop.id}
                          className="p-4 rounded-2xl border border-gray-100 bg-white hover:border-orange-200 transition shadow-xs space-y-2.5"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-gray-900">
                                  Mascota: {adop.mascotaNombre}
                                </span>
                                <span className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 font-semibold">
                                  {adop.mascotaTipo}
                                </span>
                              </div>
                              <p className="text-[11px] text-gray-500 mt-0.5">
                                Adoptante solicitante: <strong className="text-gray-800 font-bold">{adop.usuarioNombre}</strong>
                                {adop.telefono ? ` • Tel: ${adop.telefono}` : ''}
                              </p>
                            </div>

                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase self-start sm:self-auto ${
                              adop.estado === 'APROBADA' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                              adop.estado === 'RECHAZADA' ? 'bg-red-50 text-red-700 border border-red-200' :
                              'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {adop.estado}
                            </span>
                          </div>

                          {adop.mensaje && (
                            <p className="text-xs text-gray-700 italic bg-gray-50/80 p-2.5 rounded-xl break-words break-all [overflow-wrap:anywhere]">
                              "{adop.mensaje}"
                            </p>
                          )}

                          <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
                            <span>Fecha: {adop.solicitadoEn ? new Date(adop.solicitadoEn).toLocaleDateString() : 'Reciente'}</span>
                            {adop.fechaVisita && <span>Visita propuesta: {adop.fechaVisita} {adop.horaVisita || ''}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  /* TAB: MASCOTAS DEL REFUGIO */
                  refugioMascotas.length === 0 ? (
                    <div className="py-10 text-center bg-gray-50/70 rounded-2xl border border-dashed border-gray-200">
                      <PawPrint size={30} className="mx-auto text-gray-300 mb-2" />
                      <p className="text-xs font-bold text-gray-600">No hay mascotas publicadas</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">Este refugio no tiene animales registrados en catálogo.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {refugioMascotas.map((m: any) => (
                        <div 
                          key={m.id}
                          className="p-3 bg-gray-50/70 rounded-2xl border border-gray-100 flex items-center gap-3"
                        >
                          <div className="w-14 h-14 rounded-xl bg-gray-200 overflow-hidden shrink-0">
                            {m.imagenUrl ? (
                              <img src={getFileUrl(m.imagenUrl)} alt={m.nombre} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <PawPrint size={20} />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h5 className="font-bold text-gray-900 text-xs truncate">{m.nombre}</h5>
                            <p className="text-[10px] text-gray-500 truncate">{m.categoria} • {m.raza || 'Mestizo'}</p>
                            <span className={`inline-block mt-1 text-[9px] font-extrabold px-2 py-0.5 rounded-md ${
                              m.estado === 'ADOPTADO' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {m.estado}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setViewingRefugio(null)}
                  className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Cerrar Expediente
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 4: EDITAR INFORMACIÓN DEL REFUGIO */}
        {editingRefugio && (
          <div 
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={() => !refugioSaving && setEditingRefugio(null)}
          >
            <div 
              className="relative max-w-xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-200 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-6 py-5 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <Pencil size={17} className="text-amber-600" />
                    Editar Información del Refugio
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">Actualiza datos de la organización y canales de atención</p>
                </div>
                <button
                  type="button"
                  disabled={refugioSaving}
                  onClick={() => setEditingRefugio(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSaveRefugio}>
                <div className="p-6 space-y-4 text-xs max-h-[70vh] overflow-y-auto">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Nombre de la Organización *</label>
                    <input
                      type="text"
                      required
                      value={refugioForm.nombre}
                      onChange={(e) => setRefugioForm({ ...refugioForm, nombre: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                      placeholder="Ej. Fundación Huellitas"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Correo Electrónico</label>
                      <input
                        type="email"
                        value={refugioForm.email}
                        onChange={(e) => setRefugioForm({ ...refugioForm, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                        placeholder="contacto@refugio.org"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Teléfono de Contacto</label>
                      <input
                        type="tel"
                        value={refugioForm.telefono}
                        onChange={(e) => setRefugioForm({ ...refugioForm, telefono: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                        placeholder="+57 300 987 6543"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Dirección Completa</label>
                    <input
                      type="text"
                      value={refugioForm.direccion}
                      onChange={(e) => setRefugioForm({ ...refugioForm, direccion: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                      placeholder="Calle 10 # 43-20, Medellín"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Horario de Atención</label>
                      <input
                        type="text"
                        value={refugioForm.horario}
                        onChange={(e) => setRefugioForm({ ...refugioForm, horario: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                        placeholder="Lun - Sáb: 8:00 AM - 5:00 PM"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Redes Sociales</label>
                      <input
                        type="text"
                        value={refugioForm.redesSociales}
                        onChange={(e) => setRefugioForm({ ...refugioForm, redesSociales: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                        placeholder="@refugio_oficial"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Descripción / Misión del Refugio</label>
                    <textarea
                      rows={3}
                      value={refugioForm.descripcion}
                      onChange={(e) => setRefugioForm({ ...refugioForm, descripcion: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition resize-none"
                      placeholder="Describe la labor, albergue y misión de la organización..."
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    disabled={refugioSaving}
                    onClick={() => setEditingRefugio(null)}
                    className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-200/70 rounded-xl transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={refugioSaving}
                    className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-md shadow-orange-600/20 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {refugioSaving ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL PARA AGREGAR NUEVO USUARIO */}
        <AddUserModal
          isOpen={isAddUserModalOpen}
          onClose={() => setIsAddUserModalOpen(false)}
          onUserAdded={handleUserAdded}
          onShowToast={handleShowToast}
        />

      </main>

      <Notification toasts={toasts} onDismiss={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
    </div>
  );
};

export default AdminDashboard;
