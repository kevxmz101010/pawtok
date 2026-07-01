import React, { useState, useEffect } from 'react';
import { useConfirm } from '../context/ConfirmContext';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BarChart, Users, PawPrint, CheckCircle, Mail, Trash2, Check, ExternalLink } from 'lucide-react';
import { BlurFade } from '../components/ui/blur-fade';

const AdminMensajes = () => {
  const confirm = useConfirm();
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mensajes, setMensajes] = useState<any[]>([]);
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
      const res = await fetch('/api/contacto', { credentials: 'include' });
      if (res.ok) setMensajes(await res.json());
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const marcarLeido = async (id: number) => {
    try {
      const res = await fetch(`/api/contacto/${id}/leido`, { 
        method: 'PUT', 
        credentials: 'include' 
      });
      if (res.ok) {
        setMensajes(mensajes.map(m => m.id === id ? { ...m, leido: true } : m));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const eliminarMensaje = async (id: number) => {
    if (!await confirm(`¿Seguro que deseas eliminar este mensaje?`)) return;
    try {
      const res = await fetch(`/api/contacto/${id}`, { 
        method: 'DELETE', 
        credentials: 'include' 
      });
      if (res.ok) {
        setMensajes(mensajes.filter(m => m.id !== id));
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
          <Link to="/admin/mascotas" className="flex items-center gap-3 px-4 py-3 text-gray-500 rounded-2xl hover:bg-gray-50 hover:text-[#0B84FF] transition font-semibold">
            <PawPrint size={22} />
            <span>Mascotas</span>
          </Link>
          <Link to="/admin/solicitudes-refugio" className="flex items-center gap-3 px-4 py-3 text-gray-500 rounded-2xl hover:bg-gray-50 hover:text-[#0B84FF] transition font-semibold">
            <CheckCircle size={22} />
            <span>Solicitudes</span>
          </Link>
          <div className="flex items-center gap-3 px-4 py-3 bg-[#0B84FF] text-white rounded-2xl shadow-md font-semibold mt-1.5">
            <Mail size={22} />
            <span>Mensajes</span>
          </div>
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
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">Mensajes de Contacto</h1>
              <p className="text-gray-500 mt-2 font-medium">Bandeja de entrada de la sección "Contáctanos" del sitio web.</p>
            </div>
          </header>

          <div className="bg-white/80 backdrop-blur-xl border border-white p-8 rounded-3xl shadow-[0px_10px_25px_-5px_rgba(0,0,0,0.05)]">
            <h2 className="text-xl font-black tracking-tight text-gray-900 mb-6 flex items-center gap-2">
              Bandeja de Entrada
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-bold ml-2">
                {mensajes.filter(m => !m.leido).length} Nuevos
              </span>
            </h2>
            
            {mensajes.length > 0 ? (
              <div className="space-y-4">
                {mensajes.map((m: any) => (
                  <div key={m.id} className={`p-5 rounded-2xl border transition-all ${m.leido ? 'bg-gray-50/50 border-gray-100' : 'bg-white border-[#0B84FF]/20 shadow-[0_4px_20px_-5px_rgba(11,132,255,0.15)]'}`}>
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${m.leido ? 'bg-gray-200 text-gray-500' : 'bg-[#0B84FF] text-white shadow-lg'}`}>
                          <Mail size={20} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`text-base font-bold ${m.leido ? 'text-gray-700' : 'text-gray-900'}`}>{m.nombre}</h3>
                            <span className="text-xs text-gray-400 font-medium">• {new Date(m.fechaEnvio).toLocaleString()}</span>
                            {!m.leido && <span className="px-2 py-0.5 rounded-md bg-[#0B84FF] text-white text-[10px] font-bold uppercase tracking-wider">Nuevo</span>}
                          </div>
                          <a href={`mailto:${m.email}`} className="text-sm text-[#0B84FF] hover:underline font-medium mb-3 inline-block">
                            {m.email}
                          </a>
                          <div className={`text-sm leading-relaxed ${m.leido ? 'text-gray-600' : 'text-gray-800 font-medium'}`}>
                            {m.mensaje}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 md:mt-0 mt-4 self-end md:self-start">
                        {!m.leido && (
                          <button onClick={() => marcarLeido(m.id)} className="p-2 text-green-500 bg-green-50 hover:bg-green-100 rounded-xl transition flex items-center gap-1 text-xs font-bold" title="Marcar como leído">
                            <Check size={16} /> Leído
                          </button>
                        )}
                        <a href={`mailto:${m.email}`} className="p-2 text-blue-500 bg-blue-50 hover:bg-blue-100 rounded-xl transition" title="Responder">
                          <ExternalLink size={18} />
                        </a>
                        <button onClick={() => eliminarMensaje(m.id)} className="p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition" title="Eliminar mensaje">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <Mail size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="font-medium text-lg">Tu bandeja está vacía</p>
                <p className="text-sm text-gray-400 mt-1">Aún no has recibido mensajes de contacto.</p>
              </div>
            )}
          </div>
        </BlurFade>
      </main>
    </div>
  );
};

export default AdminMensajes;
