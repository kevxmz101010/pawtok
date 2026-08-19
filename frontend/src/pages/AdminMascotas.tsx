import React, { useState, useEffect } from 'react';
import { useConfirm } from '../context/ConfirmContext';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PawPrint, Plus, Search, Edit3, Trash2, Home } from 'lucide-react';
import { BlurFade } from '../components/ui/blur-fade';
import Header from '../components/Header';
import AdminHeaderNav from '../components/AdminHeaderNav';
import Notification from '../components/Notification';
import { ToastMessage } from '../types';
import { PetStatusToggle } from '../components/ui/pet-status-toggle';

const AdminMascotas = () => {
  const confirm = useConfirm();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [mascotas, setMascotas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEstado, setFilterEstado] = useState<'TODOS' | 'DISPONIBLE' | 'ADOPTADO'>('TODOS');

  const handleShowToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToasts((prev) => [...prev, { id: Math.random().toString(36).substring(2, 9), type, message }]);
  };

  useEffect(() => {
    if (!isAuthenticated || user?.rol !== 'ADMIN') {
      navigate('/login');
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
    if (!await confirm("¿Seguro que deseas eliminar esta mascota?")) return;
    try {
      const res = await fetch(`/api/mascotas/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) {
        setMascotas(mascotas.filter(m => m.id !== id));
        handleShowToast('Mascota eliminada correctamente', 'success');
      } else {
        const errorData = await res.json().catch(() => null);
        const errMsg = (errorData?.message && errorData.message !== 'Ha ocurrido un error inesperado') 
          ? errorData.message 
          : 'No se puede eliminar la mascota porque tiene un proceso de adopción aprobado o en seguimiento activo';
        handleShowToast(errMsg, 'error');
      }
    } catch (err) {
      handleShowToast('Error al eliminar mascota', 'error');
    }
  };

  const toggleEstado = async (id: number, nuevoEstado: string) => {
    // Actualización optimista instantánea sin alertas
    setMascotas(prev => prev.map(m => m.id === id ? { ...m, estado: nuevoEstado } : m));
    try {
      await fetch(`/api/mascotas/${id}/estado?estado=${nuevoEstado}`, { method: 'PUT', credentials: 'include' });
    } catch (err) {
      console.error('Error al cambiar estado:', err);
    }
  };

  const filteredMascotas = mascotas.filter(m => {
    const matchesSearch = m.nombre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.raza?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.refugioNombre?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesEstado = filterEstado === 'TODOS' || m.estado === filterEstado;
    return matchesSearch && matchesEstado;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-3 border-[#0B84FF] border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-semibold text-gray-400">Cargando mascotas...</span>
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
        <AdminHeaderNav activeTab="mascotas" title="Gestión de Mascotas" subtitle="Administra las publicaciones de la plataforma" />

        <BlurFade delay={0.15} inView>
          {/* SEARCH & ACTION BAR */}
          <div className="bg-white/90 backdrop-blur-xl border border-gray-100/80 p-4 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.03)] mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por nombre, raza o refugio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200/80 rounded-xl pl-10 pr-4 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0B84FF]/20 focus:border-[#0B84FF] transition"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {(['TODOS', 'DISPONIBLE', 'ADOPTADO'] as const).map((estado) => (
                  <button
                    key={estado}
                    onClick={() => setFilterEstado(estado)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      filterEstado === estado
                        ? 'bg-[#0B84FF] text-white shadow-md shadow-blue-500/20'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200/70'
                    }`}
                  >
                    {estado === 'TODOS' ? 'Todas' : estado}
                  </button>
                ))}
              </div>

              <Link
                to="/dashboard/add-pet"
                className="px-4 py-2 bg-[#0B84FF] text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 hover:bg-blue-600 transition flex items-center gap-1.5 shrink-0"
              >
                <Plus size={16} /> Publicar
              </Link>
            </div>
          </div>

          {/* MASCOTAS TABLE */}
          <div className="bg-white/90 backdrop-blur-xl border border-gray-100/80 rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="overflow-x-auto p-4">
              <table className="w-full text-left border-separate border-spacing-y-2">
                <thead className="text-gray-400 text-xs font-semibold px-4 tracking-normal">
                  <tr>
                    <th className="px-6 py-3 font-medium">Mascota</th>
                    <th className="px-6 py-3 font-medium">Categoría & Raza</th>
                    <th className="px-6 py-3 font-medium">Refugio</th>
                    <th className="px-6 py-3 font-medium">Estado</th>
                    <th className="px-6 py-3 font-medium text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMascotas.map((m) => {
                    const fallbackImg = m.categoria?.toLowerCase() === 'gato'
                      ? "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=300"
                      : "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=300";
                    const fotoUrl = m.imagenUrl?.startsWith('http')
                      ? m.imagenUrl
                      : (m.imagenUrl ? `http://localhost:8080/uploads/${m.imagenUrl}` : fallbackImg);

                    return (
                      <tr key={m.id} className="bg-gray-50/60 hover:bg-blue-50/30 transition-colors rounded-2xl group">
                        <td className="px-6 py-4 rounded-l-2xl">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-sm border border-gray-100 shrink-0 bg-gray-100">
                              <img
                                src={fotoUrl}
                                alt={m.nombre}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => { e.currentTarget.src = fallbackImg; }}
                              />
                            </div>
                            <div>
                              <Link to={`/mascotas/${m.id}`} className="font-bold text-gray-900 hover:text-[#0B84FF] transition text-base block">
                                {m.nombre}
                              </Link>
                              <span className="text-xs text-gray-400 font-medium">ID #{m.id}</span>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-gray-800">{m.raza || 'Mestizo'}</div>
                          <span className="inline-block mt-0.5 px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-gray-100 text-gray-600">
                            {m.categoria || 'Mascota'}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-xs text-gray-600 font-semibold">
                            <Home size={14} className="text-[#0B84FF]" />
                            <span>{m.refugioNombre || `Refugio #${m.idRefugio || 'Pawtok'}`}</span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <PetStatusToggle
                            status={m.estado}
                            onChangeStatus={(nuevoEstado) => toggleEstado(m.id, nuevoEstado)}
                          />
                        </td>

                        <td className="px-6 py-4 text-right rounded-r-2xl">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/dashboard/edit-pet/${m.id}`}
                              className="p-2 text-[#0B84FF] bg-blue-50 border border-blue-100 hover:bg-blue-100 rounded-xl transition"
                              title="Editar Mascota"
                            >
                              <Edit3 size={16} />
                            </Link>
                            <button
                              onClick={() => deleteMascota(m.id)}
                              className="p-2 text-red-500 bg-red-50 border border-red-100 hover:bg-red-100 rounded-xl transition cursor-pointer"
                              title="Eliminar Mascota"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredMascotas.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-400 text-sm">
                        <PawPrint size={40} className="mx-auto mb-3 text-gray-300" />
                        No se encontraron mascotas registradas
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

export default AdminMascotas;
