import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BarChart, Users, PawPrint, CheckCircle, Search, Calendar, MapPin, Edit, Trash2, Mail } from 'lucide-react';
import { BlurFade } from '../components/ui/blur-fade';

const AdminMascotas = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mascotas, setMascotas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || user?.rol !== 'ADMIN') {
      navigate('/');
      return;
    }
    fetchMascotas();
  }, [isAuthenticated, user, navigate]);

  const fetchMascotas = async () => {
    try {
      const res = await fetch('/api/mascotas', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setMascotas(data);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const deleteMascota = async (id: number) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta mascota?")) return;
    try {
      const res = await fetch(`/api/mascotas/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) {
        setMascotas(mascotas.filter(m => m.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleEstado = async (id: number, estadoActual: string) => {
    const nuevoEstado = estadoActual === 'DISPONIBLE' ? 'ADOPTADO' : 'DISPONIBLE';
    try {
      const res = await fetch(`/api/mascotas/${id}/estado?estado=${nuevoEstado}`, { method: 'PUT', credentials: 'include' });
      if (res.ok) {
        setMascotas(mascotas.map(m => m.id === id ? { ...m, estado: nuevoEstado } : m));
      }
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
          <Link to="/admin" className="flex items-center gap-3 px-4 py-3 text-gray-500 rounded-2xl hover:bg-gray-50 hover:text-[#0B84FF] transition font-semibold">
            <BarChart size={22} />
            <span>Resumen</span>
          </Link>
          
          <div className="px-4 py-2 mt-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Gestión</div>
          <Link to="/admin" className="flex items-center gap-3 px-4 py-3 text-gray-500 rounded-2xl hover:bg-gray-50 hover:text-[#0B84FF] transition font-semibold">
            <Users size={22} />
            <span>Usuarios & Refugios</span>
          </Link>
          <div className="flex items-center gap-3 px-4 py-3 bg-[#0B84FF] text-white rounded-2xl shadow-md font-semibold">
            <PawPrint size={22} />
            <span>Mascotas</span>
          </div>
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
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">Gestión de Mascotas</h1>
              <p className="text-gray-500 mt-2 font-medium">Administra todas las mascotas de la plataforma.</p>
            </div>
          </header>

          <div className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl shadow-[0px_10px_25px_-5px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="overflow-x-auto p-4">
              <table className="w-full text-left border-separate border-spacing-y-2">
                <thead className="text-gray-400 text-xs font-bold uppercase px-4">
                  <tr>
                    <th className="px-6 py-3">Mascota</th>
                    <th className="px-6 py-3">Raza</th>
                    <th className="px-6 py-3">Refugio</th>
                    <th className="px-6 py-3">Estado</th>
                    <th className="px-6 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {mascotas.map(m => (
                    <tr key={m.id} className="bg-gray-50/50 hover:bg-white transition rounded-2xl">
                      <td className="px-6 py-4 rounded-l-2xl">
                        <div className="flex items-center gap-3">
                          <img src={m.imagenUrl?.startsWith('http') ? m.imagenUrl : `http://localhost:8080/uploads/${m.imagenUrl}`} alt={m.nombre} className="w-10 h-10 rounded-full object-cover shadow-sm bg-gray-200" />
                          <div className="font-bold text-gray-900">{m.nombre}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{m.raza}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{m.refugioNombre || 'Refugio Central'}</td>
                      <td className="px-6 py-4">
                        <button onClick={() => toggleEstado(m.id, m.estado)} className={`px-3 py-1 text-xs font-bold rounded-xl transition shadow-sm border ${m.estado === 'DISPONIBLE' ? 'bg-green-50 text-green-600 border-green-100 hover:bg-green-100' : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'}`}>
                          {m.estado}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right rounded-r-2xl">
                        <Link to={`/dashboard/edit-pet/${m.id}`} className="px-3 py-1.5 text-xs font-bold text-[#0B84FF] bg-blue-50 border border-blue-100 hover:bg-blue-100 rounded-xl mr-2">Editar</Link>
                        <button onClick={() => deleteMascota(m.id)} className="px-3 py-1.5 text-xs font-bold text-red-500 bg-red-50 border border-red-100 hover:bg-red-100 rounded-xl">Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </BlurFade>
      </main>
    </div>
  );
};

export default AdminMascotas;
