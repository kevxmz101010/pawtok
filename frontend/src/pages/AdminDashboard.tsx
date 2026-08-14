import React, { useState, useEffect } from 'react';
import { useConfirm } from '../context/ConfirmContext';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, PawPrint, CheckCircle2, Trash2, ArrowUpRight, Shield, Activity } from 'lucide-react';
import { BlurFade } from '../components/ui/blur-fade';
import Header from '../components/Header';
import AdminHeaderNav from '../components/AdminHeaderNav';
import Notification from '../components/Notification';
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
  const [actividad, setActividad] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      
      const resAct = await fetch('/api/admin/actividad', { credentials: 'include' });
      if (resAct.ok) setActividad(await resAct.json());
      
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
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
            {/* CARD 1: USUARIOS */}
            <div className="bg-white/90 backdrop-blur-xl border border-gray-100/80 p-6 rounded-[2rem] shadow-[0_16px_36px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0B84FF] flex items-center justify-center shadow-sm">
                  <Users size={24} />
                </div>
                <span className="px-2.5 py-1 text-xs font-bold bg-blue-50 text-[#0B84FF] rounded-full">
                  +Global
                </span>
              </div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Usuarios</div>
              <div className="text-4xl font-black text-gray-900 tracking-tight mt-1">{stats.usuarios}</div>
              <div className="mt-4 pt-3 border-t border-gray-100 text-xs font-semibold text-gray-500 flex items-center justify-between">
                <span>Adoptantes: <strong className="text-gray-900 font-bold">{stats.adoptantes}</strong></span>
                <span>Refugios: <strong className="text-[#0B84FF] font-bold">{stats.refugios}</strong></span>
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
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-extrabold rounded-full">
                  {usuarios.length}
                </span>
              </div>
              
              <div className="overflow-y-auto p-4 flex-1">
                <table className="w-full text-left border-separate border-spacing-y-2">
                  <thead className="text-gray-400 text-[11px] font-bold uppercase tracking-wider px-4 sticky top-0 bg-white/90 backdrop-blur-md z-10">
                    <tr>
                      <th className="px-4 py-2">Usuario</th>
                      <th className="px-4 py-2">Email</th>
                      <th className="px-4 py-2">Rol</th>
                      <th className="px-4 py-2 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map(u => (
                      <tr key={u.id} className="bg-gray-50/60 hover:bg-blue-50/30 transition-colors rounded-2xl group">
                        <td className="px-4 py-3 font-bold text-gray-900 rounded-l-2xl text-sm">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0B84FF] to-blue-400 text-white font-bold text-xs flex items-center justify-center shrink-0">
                              {u.nombre ? u.nombre.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <span className="truncate max-w-[120px]">{u.nombre}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 truncate max-w-[140px]">{u.email}</td>
                        <td className="px-4 py-3 text-xs font-bold">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-extrabold ${
                            u.rol === 'ADMIN' ? 'bg-purple-50 text-purple-600 border border-purple-100' :
                            u.rol === 'REFUGIO' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                            'bg-blue-50 text-blue-600 border border-blue-100'
                          }`}>
                            {u.rol}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right rounded-r-2xl">
                          <button
                            onClick={() => deleteUser(u.id)}
                            className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                            title="Eliminar usuario"
                          >
                            <Trash2 size={16} />
                          </button>
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
                  <thead className="text-gray-400 text-[11px] font-bold uppercase tracking-wider px-4 sticky top-0 bg-white/90 backdrop-blur-md z-10">
                    <tr>
                      <th className="px-4 py-2">Refugio</th>
                      <th className="px-4 py-2">Teléfono</th>
                      <th className="px-4 py-2 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {refugios.map(r => (
                      <tr key={r.id} className="bg-gray-50/60 hover:bg-orange-50/30 transition-colors rounded-2xl group">
                        <td className="px-4 py-3 font-bold text-gray-900 rounded-l-2xl text-sm">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-bold text-xs flex items-center justify-center shrink-0">
                              {r.nombre ? r.nombre.charAt(0).toUpperCase() : 'R'}
                            </div>
                            <span className="truncate max-w-[150px]">{r.nombre}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">{r.telefono || 'Sin teléfono'}</td>
                        <td className="px-4 py-3 text-right rounded-r-2xl">
                          <button
                            onClick={() => deleteRefugio(r.id)}
                            className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                            title="Eliminar refugio"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* ACTIVIDAD RECIENTE */}
          <div className="bg-white/90 backdrop-blur-xl border border-gray-100/80 rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0B84FF] flex items-center justify-center font-bold">
                  <Activity size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">Actividad Reciente</h3>
                  <p className="text-xs text-gray-400 font-medium">Registro de acciones y movimientos del sistema</p>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="text-gray-400 text-xs font-bold uppercase bg-gray-50/50">
                  <tr>
                    <th className="px-6 py-3.5">Fecha</th>
                    <th className="px-6 py-3.5">Usuario</th>
                    <th className="px-6 py-3.5">Acción</th>
                    <th className="px-6 py-3.5">Detalles</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {actividad.slice(0, 15).map((act, idx) => (
                    <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-3.5 text-xs text-gray-500 whitespace-nowrap">
                        {new Date(act.fecha).toLocaleString()}
                      </td>
                      <td className="px-6 py-3.5 font-bold text-gray-900 text-xs">
                        {act.nombreUsuario}
                      </td>
                      <td className="px-6 py-3.5 text-xs">
                        <span className="px-2.5 py-1 rounded-full bg-blue-50 text-[#0B84FF] font-bold border border-blue-100">
                          {act.accion}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-xs text-gray-600">
                        {act.detalles}
                      </td>
                    </tr>
                  ))}
                  {actividad.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-400 text-sm">
                        No hay registros de actividad reciente
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </BlurFade>

      </main>

      <Notification toasts={toasts} onDismiss={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
    </div>
  );
};

export default AdminDashboard;
