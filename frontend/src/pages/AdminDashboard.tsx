import React, { useState, useEffect } from 'react';
import { useConfirm } from '../context/ConfirmContext';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BarChart, Users, Heart, PawPrint, CheckCircle, Clock, Mail } from 'lucide-react';
import { BlurFade } from '../components/ui/blur-fade';

const AdminDashboard = () => {
  const confirm = useConfirm();
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    usuarios: 0, adoptantes: 0, refugios: 0,
    mascotas: 0, disponibles: 0, solicitudes: 0
  });
  
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [refugios, setRefugios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || user?.rol !== 'ADMIN') {
      navigate('/');
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
      if (res.ok) setUsuarios(usuarios.filter(u => u.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteRefugio = async (id: number) => {
    if (!await confirm("¿Seguro que deseas eliminar este refugio?")) return;
    try {
      const res = await fetch(`/api/admin/refugios/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) setRefugios(refugios.filter(r => r.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center">Cargando...</div>;

  return (
    <div className="flex h-screen bg-[#F4F7FE] font-sans selection:bg-[#0B84FF] selection:text-white overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white/80 backdrop-blur-2xl border-r border-white/50 flex flex-col shadow-[15px_0_30px_-15px_rgba(0,0,0,0.05)] relative z-20 h-full">
        <div className="p-8 pb-4">
          <Link to="/" className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-[#0B84FF] to-[#005bb5] drop-shadow-sm flex items-center gap-2">
            Pawtok <span className="text-[#0B84FF]">.</span>
          </Link>
          <div className="mt-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Admin Panel</div>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto pt-4">
          <div className="flex items-center gap-3 px-4 py-3 bg-[#0B84FF] text-white rounded-2xl shadow-md font-semibold">
            <BarChart size={22} />
            <span>Resumen</span>
          </div>
          
          <div className="px-4 py-2 mt-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Gestión</div>
          <Link to="/admin" className="flex items-center gap-3 px-4 py-3 text-[#0B84FF] bg-blue-50 rounded-2xl hover:bg-gray-50 hover:text-[#0B84FF] transition font-semibold">
            <Users size={22} />
            <span>Usuarios & Refugios</span>
          </Link>
          <Link to="/admin/mascotas" className="flex items-center gap-3 px-4 py-3 text-gray-500 rounded-2xl hover:bg-gray-50 hover:text-[#0B84FF] transition font-semibold">
            <PawPrint size={22} />
            <span>Mascotas</span>
          </Link>
          <Link to="/admin/solicitudes-refugio" className="flex items-center gap-3 px-4 py-3 text-gray-500 rounded-2xl hover:bg-gray-50 hover:text-[#0B84FF] transition font-semibold">
            <CheckCircle size={22} />
            <span>Solicitudes</span>
          </Link>
          <Link to="/admin/mensajes" className="flex items-center gap-3 px-4 py-3 text-gray-500 rounded-2xl hover:bg-gray-50 hover:text-[#0B84FF] transition font-semibold">
            <Mail size={22} />
            <span>Mensajes</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="bg-gray-50 p-4 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0B84FF] to-blue-600 flex items-center justify-center text-white font-bold shadow-md">
              A
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-gray-900 truncate">Admin</div>
              <div className="text-xs text-gray-500 truncate">{user?.email}</div>
            </div>
            <button onClick={logout} className="text-gray-400 hover:text-red-500 transition cursor-pointer">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto relative z-10 p-8 lg:p-12">
        <BlurFade delay={0.1} inView>
          <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">Panel de Control</h1>
              <p className="text-gray-500 mt-2 font-medium">Estadísticas y gestión global de Pawtok.</p>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
            <div className="bg-white/80 backdrop-blur-xl border border-white p-6 rounded-3xl shadow-[0px_10px_25px_-5px_rgba(0,0,0,0.05)]">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-[#0B84FF]">
                  <Users size={24} />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-400 uppercase tracking-wider">Total Usuarios</div>
                  <div className="text-3xl font-black text-gray-900">{stats.usuarios}</div>
                </div>
              </div>
              <div className="text-sm font-medium text-gray-500 bg-gray-50 px-3 py-2 rounded-xl inline-block">
                Adoptantes: <span className="font-bold text-gray-900">{stats.adoptantes}</span> | Refugios: <span className="font-bold text-gray-900">{stats.refugios}</span>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl border border-white p-6 rounded-3xl shadow-[0px_10px_25px_-5px_rgba(0,0,0,0.05)]">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500">
                  <PawPrint size={24} />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-400 uppercase tracking-wider">Mascotas</div>
                  <div className="text-3xl font-black text-gray-900">{stats.mascotas}</div>
                </div>
              </div>
              <div className="text-sm font-medium text-gray-500 bg-gray-50 px-3 py-2 rounded-xl inline-block">
                Disponibles: <span className="font-bold text-gray-900">{stats.disponibles}</span>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl border border-white p-6 rounded-3xl shadow-[0px_10px_25px_-5px_rgba(0,0,0,0.05)]">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-500">
                  <CheckCircle size={24} />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-400 uppercase tracking-wider">Solicitudes</div>
                  <div className="text-3xl font-black text-gray-900">{stats.solicitudes}</div>
                </div>
              </div>
              <div className="text-sm font-medium text-gray-500 bg-gray-50 px-3 py-2 rounded-xl inline-block">
                Total Adopciones Procesadas
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl shadow-[0px_10px_25px_-5px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col h-[500px]">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
                <h3 className="font-bold text-xl text-gray-900">Usuarios</h3>
              </div>
              <div className="overflow-y-auto p-2 flex-1">
                <table className="w-full text-left border-separate border-spacing-y-2">
                  <thead className="text-gray-400 text-xs font-bold uppercase px-4 sticky top-0 bg-white/80 backdrop-blur-sm z-10">
                    <tr>
                      <th className="px-6 py-3">Nombre</th>
                      <th className="px-6 py-3">Email</th>
                      <th className="px-6 py-3">Rol</th>
                      <th className="px-6 py-3 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map(u => (
                      <tr key={u.id} className="bg-gray-50/50 hover:bg-white transition rounded-2xl">
                        <td className="px-6 py-4 font-bold text-gray-900 rounded-l-2xl">{u.nombre}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{u.email}</td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-700">{u.rol}</td>
                        <td className="px-6 py-4 text-right rounded-r-2xl">
                          <button onClick={() => deleteUser(u.id)} className="text-red-500 hover:text-red-600 font-bold text-sm bg-red-50 px-3 py-1.5 rounded-xl border border-red-100">Eliminar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl shadow-[0px_10px_25px_-5px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col h-[500px]">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
                <h3 className="font-bold text-xl text-gray-900">Refugios</h3>
              </div>
              <div className="overflow-y-auto p-2 flex-1">
                <table className="w-full text-left border-separate border-spacing-y-2">
                  <thead className="text-gray-400 text-xs font-bold uppercase px-4 sticky top-0 bg-white/80 backdrop-blur-sm z-10">
                    <tr>
                      <th className="px-6 py-3">Nombre</th>
                      <th className="px-6 py-3">Teléfono</th>
                      <th className="px-6 py-3 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {refugios.map(r => (
                      <tr key={r.id} className="bg-gray-50/50 hover:bg-white transition rounded-2xl">
                        <td className="px-6 py-4 font-bold text-gray-900 rounded-l-2xl">{r.nombre}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{r.telefono}</td>
                        <td className="px-6 py-4 text-right rounded-r-2xl">
                          <button onClick={() => deleteRefugio(r.id)} className="text-red-500 hover:text-red-600 font-bold text-sm bg-red-50 px-3 py-1.5 rounded-xl border border-red-100">Eliminar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </BlurFade>
      </main>
    </div>
  );
};

export default AdminDashboard;
