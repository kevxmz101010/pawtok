import React, { useState, useEffect } from 'react';
import { useConfirm } from '../context/ConfirmContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Trash2, Check, ExternalLink, Inbox, Clock, User } from 'lucide-react';
import { BlurFade } from '../components/ui/blur-fade';
import Header from '../components/Header';
import AdminHeaderNav from '../components/AdminHeaderNav';
import Notification from '../components/Notification';
import { ToastMessage } from '../types';

const AdminMensajes = () => {
  const confirm = useConfirm();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [mensajes, setMensajes] = useState<any[]>([]);
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
        handleShowToast('Mensaje marcado como leído', 'success');
      }
    } catch (err) {
      handleShowToast('Error al actualizar mensaje', 'error');
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
        handleShowToast('Mensaje eliminado', 'success');
      }
    } catch (err) {
      handleShowToast('Error al eliminar mensaje', 'error');
    }
  };

  const sinLeerCount = mensajes.filter(m => !m.leido).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-3 border-[#0B84FF] border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-semibold text-gray-400">Cargando mensajes...</span>
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
        <AdminHeaderNav activeTab="mensajes" title="Mensajes de Contacto" subtitle="Bandeja de mensajes recibidos de usuarios" />

        <BlurFade delay={0.15} inView>
          <div className="bg-white/90 backdrop-blur-xl border border-gray-100/80 p-8 rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#0B84FF] flex items-center justify-center font-bold">
                  <Inbox size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-gray-900">
                    Mensajes Recibidos
                  </h2>
                  <p className="text-xs text-gray-400 font-medium">Lista de mensajes de usuarios</p>
                </div>
              </div>
              
              <span className={`text-xs px-3.5 py-1 rounded-full font-extrabold border ${
                sinLeerCount > 0
                  ? 'bg-blue-50 text-[#0B84FF] border-blue-200'
                  : 'bg-gray-100 text-gray-600 border-gray-200'
              }`}>
                {sinLeerCount} Sin Leer
              </span>
            </div>
            
            {mensajes.length > 0 ? (
              <div className="space-y-4">
                {mensajes.map((m: any) => (
                  <div
                    key={m.id}
                    className={`p-6 rounded-2xl border transition-all ${
                      m.leido
                        ? 'bg-gray-50/50 border-gray-100/80 hover:bg-white hover:shadow-md'
                        : 'bg-white border-blue-200/80 shadow-[0_8px_30px_rgba(11,132,255,0.08)]'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-bold ${
                            m.leido
                              ? 'bg-gray-100 text-gray-400'
                              : 'bg-gradient-to-tr from-[#0B84FF] to-blue-500 text-white shadow-lg shadow-blue-500/25'
                          }`}
                        >
                          <User size={20} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className={`text-base font-bold ${m.leido ? 'text-gray-800' : 'text-gray-900'}`}>
                              {m.nombre}
                            </h3>
                            <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                              <Clock size={12} /> {new Date(m.fechaEnvio).toLocaleString()}
                            </span>
                            {!m.leido && (
                              <span className="px-2 py-0.5 rounded-full bg-[#0B84FF] text-white text-[10px] font-extrabold uppercase tracking-wider">
                                Nuevo
                              </span>
                            )}
                          </div>
                          <a
                            href={`mailto:${m.email}`}
                            className="text-xs font-semibold text-[#0B84FF] hover:underline mb-3 inline-block"
                          >
                            {m.email}
                          </a>
                          <p className={`text-sm leading-relaxed ${m.leido ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                            {m.mensaje}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 md:mt-0 mt-4 self-end md:self-start shrink-0">
                        {!m.leido && (
                          <button
                            onClick={() => marcarLeido(m.id)}
                            className="px-3 py-1.5 bg-green-50 text-green-600 border border-green-200 hover:bg-green-100 rounded-xl transition text-xs font-bold flex items-center gap-1 cursor-pointer"
                            title="Marcar como leído"
                          >
                            <Check size={14} /> Leído
                          </button>
                        )}
                        <a
                          href={`mailto:${m.email}`}
                          className="p-2 text-[#0B84FF] bg-blue-50 border border-blue-100 hover:bg-blue-100 rounded-xl transition cursor-pointer"
                          title="Responder por Email"
                        >
                          <ExternalLink size={16} />
                        </a>
                        <button
                          onClick={() => eliminarMensaje(m.id)}
                          className="p-2 text-red-500 bg-red-50 border border-red-100 hover:bg-red-100 rounded-xl transition cursor-pointer"
                          title="Eliminar mensaje"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-gray-500 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                <Inbox size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="font-bold text-lg text-gray-800">Bandeja Vacía</p>
                <p className="text-sm text-gray-400 mt-1">Aún no has recibido mensajes de contacto.</p>
              </div>
            )}
          </div>
        </BlurFade>

      </main>

      <Notification toasts={toasts} onDismiss={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
    </div>
  );
};

export default AdminMensajes;
