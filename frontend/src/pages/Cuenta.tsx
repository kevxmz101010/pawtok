import React, { useState, useEffect } from 'react';
import { useConfirm } from '../context/ConfirmContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import FullscreenToast from '../components/FullscreenToast';
import { BlurFade } from '../components/ui/blur-fade';

interface SolicitudDTO {
  adopcionId: number;
  mascota: string;
  refugio: string;
  estado: string;
  fotoMascota: string;
  mascotaTipo?: string;
  mascotaRaza?: string;
}

interface MensajeDTO {
  remitente: string;
  mensaje: string;
  fecha: string;
}

interface DashboardDTO {
  totalSolicitudes: number;
  totalFavoritos: number;
  totalAdoptadas: number;
  recientes: SolicitudDTO[];
  mensajes: MensajeDTO[];
}

export default function Cuenta() {
  const confirm = useConfirm();
  const { user, isAuthenticated, checkAuth, setUser } = useAuth();
  const navigate = useNavigate();

  const [nombre, setNombre] = useState(user?.nombre || '');
  const [email, setEmail] = useState(user?.email || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [foto, setFoto] = useState<File | null>(null);

  useEffect(() => {
    if (user) {
      setNombre(user.nombre || '');
      setEmail(user.email || '');
      setBio(user.bio || '');
    }
  }, [user]);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [toastMsg, setToastMsg] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  
  const [dashboard, setDashboard] = useState<DashboardDTO | null>(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);

  // Dashboard Tabs State
  const [activeTab, setActiveTab] = useState<'solicitudes' | 'favoritos' | 'adoptadas'>('solicitudes');
  const [favoritosData, setFavoritosData] = useState<any[]>([]);

  // Chat State
  const [selectedAdopcionId, setSelectedAdopcionId] = useState<number | null>(null);
  const [mensajesChat, setMensajesChat] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [newFile, setNewFile] = useState<File | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedAdopcionId) {
      fetchMensajesChat(selectedAdopcionId);
    } else {
      setMensajesChat([]);
    }
  }, [selectedAdopcionId]);

  const fetchMensajesChat = async (adopcionId: number) => {
    try {
      const res = await fetch(`/api/mensajes/adopcion/${adopcionId}`, { credentials: 'include' });
      if (res.ok) {
        setMensajesChat(await res.json());
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !newFile) || !selectedAdopcionId) return;
    try {
      const formData = new FormData();
      if (newMessage.trim()) {
        formData.append('contenido', newMessage);
      } else if (newFile) {
        formData.append('contenido', '[Archivo adjunto]');
      }
      if (newFile) formData.append('archivo', newFile);

      const res = await fetch(`/api/mensajes/adopcion/${selectedAdopcionId}`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (res.ok) {
        const msg = await res.json();
        setMensajesChat(prev => [...prev, msg]);
        setNewMessage('');
        setNewFile(null);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    } catch (err) {
      showToast('Error al enviar mensaje', 'error');
    }
  };

  const deleteAdopcion = async (adopcionId: number) => {
    if (!await confirm("¿Seguro que deseas eliminar este registro del historial?")) return;
    try {
      const res = await fetch(`/api/adopciones/${adopcionId}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) {
        setDashboard(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            recientes: prev.recientes.filter(r => r.adopcionId !== adopcionId)
          };
        });
        showToast('Registro eliminado del historial', 'success');
        if (selectedAdopcionId === adopcionId) setSelectedAdopcionId(null);
      } else {
        showToast('Error al eliminar registro', 'error');
      }
    } catch (err) {
      showToast('Error de conexión', 'error');
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !user || user.rol === 'ADMIN' || user.rol === 'REFUGIO') {
      return; // Only normal users see this dashboard
    }
    const fetchDashboard = async () => {
      try {
        const res = await fetch('/api/dashboard/usuario', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setDashboard(data);
        }
        const favRes = await fetch('/api/favoritos', { credentials: 'include' });
        if (favRes.ok) {
          setFavoritosData(await favRes.json());
        }
      } catch (err) {
        console.error('Error fetching dashboard', err);
      } finally {
        setLoadingDashboard(false);
      }
    };
    fetchDashboard();
  }, [isAuthenticated, user]);

  const getStatusStyle = (estado: string) => {
    switch(estado.toLowerCase()) {
      case 'aprobada': return 'bg-green-100 text-green-700';
      case 'rechazada': return 'bg-red-100 text-red-700';
      default: return 'bg-yellow-100 text-yellow-700';
    }
  };

  const getStatusText = (estado: string) => {
    switch(estado.toLowerCase()) {
      case 'aprobada': return 'Aprobada';
      case 'rechazada': return 'Rechazada';
      default: return 'En Revisión';
    }
  };

  if (!isAuthenticated || !user) {
    navigate('/login');
    return null;
  }

  if (user.rol === 'PENDIENTE_REFUGIO') {
    return (
      <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-[#3f92ff] selection:text-black flex flex-col justify-center items-center relative py-12">
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <img src="/fondo.png" alt="" className="w-full h-full object-cover opacity-70" />
          <div className="absolute inset-0 backdrop-blur-2xl bg-white/40" />
        </div>
        <div className="relative z-10 w-full max-w-md bg-white/80 backdrop-blur-xl p-10 rounded-3xl text-center border border-white shadow-xl">
          <div className="w-20 h-20 mx-auto bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Solicitud en revisión</h1>
          <p className="text-gray-600 mb-6 font-medium">Hemos recibido los datos y fotos de tu refugio. Un administrador revisará la información pronto. Tu cuenta se activará cuando sea aprobada.</p>
          <Link to="/" className="w-full inline-block px-6 py-3 bg-[#0B84FF] hover:bg-blue-600 text-white font-bold rounded-xl shadow-md transition-colors">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToastMsg({ msg, type });
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('nombre', nombre);
      formData.append('email', email);
      formData.append('bio', bio);
      if (foto) formData.append('foto', foto);

      const res = await fetch('/api/usuarios/me/perfil', {
        method: 'PUT',
        credentials: 'include',
        body: formData,
      });

      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
        showToast('¡Perfil actualizado correctamente!', 'success');
      } else {
        const errData = await res.json().catch(() => null);
        showToast(errData?.message || 'Error al guardar en base de datos', 'error');
      }
    } catch (err) {
      showToast('Error de conexión', 'error');
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('Las nuevas contraseñas no coinciden.', 'error');
      return;
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&.])[A-Za-z\d@$!%*#?&.]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      showToast('La nueva contraseña debe tener mínimo 8 caracteres, 1 número, 1 letra y 1 símbolo especial.', 'error');
      return;
    }
    
    try {
      const res = await fetch('/api/usuarios/me/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword
        })
      });

      if (res.ok) {
        showToast('¡Contraseña cambiada exitosamente!', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const errData = await res.json().catch(() => null);
        showToast(errData?.message || 'Error al cambiar contraseña.', 'error');
      }
    } catch (err) {
      showToast('Error de conexión', 'error');
    }
  };

  const getProfileImage = () => {
    if (foto) return URL.createObjectURL(foto);
    if (user.foto) {
      if (user.foto.startsWith('http')) return user.foto;
      return `http://localhost:8080/uploads/${user.foto.split('/').pop()}`;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nombre)}&background=0B84FF&color=fff`;
  };

  return (
    <div className="min-h-screen font-inter text-gray-800 bg-gray-50/50">

      <div className="relative z-10">
        <Header
          onShowToast={(msg, type) => showToast(msg, type as 'success' | 'error')}
          onSelectDrop={() => {}}
          searchQuery=""
          setSearchQuery={() => {}}
        />

        <FullscreenToast toast={toastMsg} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-28">
        
        {/* Profile Header (Centered without card background) */}
        <BlurFade delay={0.1} inView>
          <div className="flex flex-col items-center text-center mb-12">
            <div className="relative w-32 h-32 mb-5 group">
              <img src={getProfileImage()} alt="Perfil" className="w-full h-full rounded-full object-cover border-4 border-white shadow-xl" />
              <label className="absolute bottom-0 right-0 bg-[#ffffff4b] backdrop-blur-md hover:bg-white/50 p-2.5 rounded-full text-white shadow-xl border-2 border-white cursor-pointer transition-transform hover:scale-105 active:scale-95">
                <input type="file" accept="image/*" onChange={e => setFoto(e.target.files?.[0] || null)} className="hidden" />
                <svg className="w-5 h-5 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              </label>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{user.nombre}</h1>
            <p className="text-gray-500 font-medium mt-1">{user.email}</p>
          </div>
        </BlurFade>

        <div className="space-y-8">
          
          {/* DASHBOARD SECTION */}
          {user.rol === 'USUARIO' && (
            <BlurFade delay={0.2} inView>
              <div className="space-y-6">
              {loadingDashboard ? (
                <div className="flex justify-center p-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0B84FF]"></div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div 
                      onClick={() => setActiveTab('solicitudes')}
                      className={`bg-blue-100/50 backdrop-blur-xl border p-6 rounded-3xl cursor-pointer transition-all ${activeTab === 'solicitudes' ? 'border-[#0B84FF] shadow-lg ring-2 ring-[#0B84FF]/20 scale-[1.02]' : 'border-white/60 shadow-sm hover:scale-[1.01]'} flex items-center gap-4`}>
                      <div className="w-14 h-14 rounded-2xl bg-white/70 shadow-sm border border-white text-[#0B84FF] flex items-center justify-center">
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm font-semibold">Solicitudes</p>
                        <h3 className="text-3xl font-bold text-gray-900">{dashboard?.totalSolicitudes || 0}</h3>
                      </div>
                    </div>
                    <div 
                      onClick={() => setActiveTab('favoritos')}
                      className={`bg-pink-100/50 backdrop-blur-xl border p-6 rounded-3xl cursor-pointer transition-all ${activeTab === 'favoritos' ? 'border-pink-500 shadow-lg ring-2 ring-pink-500/20 scale-[1.02]' : 'border-white/60 shadow-sm hover:scale-[1.01]'} flex items-center gap-4`}>
                      <div className="w-14 h-14 rounded-2xl bg-white/70 shadow-sm border border-white text-pink-500 flex items-center justify-center">
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm font-semibold">Favoritos</p>
                        <h3 className="text-3xl font-bold text-gray-900">{dashboard?.totalFavoritos || 0}</h3>
                      </div>
                    </div>
                    <div 
                      onClick={() => setActiveTab('adoptadas')}
                      className={`bg-emerald-100/50 backdrop-blur-xl border p-6 rounded-3xl cursor-pointer transition-all ${activeTab === 'adoptadas' ? 'border-emerald-500 shadow-lg ring-2 ring-emerald-500/20 scale-[1.02]' : 'border-white/60 shadow-sm hover:scale-[1.01]'} flex items-center gap-4`}>
                      <div className="w-14 h-14 rounded-2xl bg-white/70 shadow-sm border border-white text-emerald-500 flex items-center justify-center">
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm font-semibold">Adoptadas</p>
                        <h3 className="text-3xl font-bold text-gray-900">{dashboard?.totalAdoptadas || 0}</h3>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                    <div className="bg-gray-100/30 backdrop-blur-xl border border-white/60 p-8 rounded-3xl shadow-[0px_15px_35px_-10px_rgba(0,0,0,0.05),inset_0px_0px_15px_rgba(255,255,255,1)]">
                      <h3 className="text-xl font-bold text-gray-900 mb-6 capitalize">Mis {activeTab}</h3>
                      <div className="space-y-6">
                        {activeTab === 'solicitudes' && (
                          dashboard?.recientes && dashboard.recientes.length > 0 ? (
                            dashboard.recientes.map((sol, idx) => (
                              <div key={idx} className="flex items-center gap-4 pb-4 border-b border-white/40 last:border-0 last:pb-0 cursor-pointer hover:bg-white/40 p-2 rounded-xl transition">
                                <img onClick={() => setSelectedAdopcionId(sol.adopcionId)} src={sol.fotoMascota ? (sol.fotoMascota.startsWith('http') ? sol.fotoMascota : `http://localhost:8080/uploads/${sol.fotoMascota.split('/').pop()}`) : "https://via.placeholder.com/100"} className="w-14 h-14 rounded-xl object-cover" alt="Mascota" />
                                <div className="flex-1" onClick={() => setSelectedAdopcionId(sol.adopcionId)}>
                                  <h4 className="font-bold text-gray-800">Adopción de {sol.mascota}</h4>
                                  <p className="text-xs text-gray-500 capitalize">{sol.mascotaTipo?.toLowerCase()} • {sol.mascotaRaza} | Refugio "{sol.refugio}"</p>
                                </div>
                                <span onClick={() => setSelectedAdopcionId(sol.adopcionId)} className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${getStatusStyle(sol.estado)}`}>
                                  {getStatusText(sol.estado)}
                                </span>
                                <button onClick={(e) => { e.stopPropagation(); deleteAdopcion(sol.adopcionId); }} className="text-red-500 hover:text-red-600 font-bold p-2 transition ml-2" title="Eliminar registro">
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                </button>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-4">
                              <p className="text-gray-400 text-sm">No tienes solicitudes activas.</p>
                              <Link to="/" className="text-[#0B84FF] text-sm font-bold hover:underline">Buscar mascota</Link>
                            </div>
                          )
                        )}

                        {activeTab === 'favoritos' && (
                          favoritosData.length > 0 ? (
                            favoritosData.map((mascota, idx) => (
                              <Link to={`/adoptar/${mascota.id}`} key={idx} className="flex items-center gap-4 pb-4 border-b border-white/40 last:border-0 last:pb-0 cursor-pointer hover:bg-white/40 p-2 rounded-xl transition">
                                <img src={mascota.imagenUrl ? (mascota.imagenUrl.startsWith('http') ? mascota.imagenUrl : `http://localhost:8080/uploads/${mascota.imagenUrl.split('/').pop()}`) : "https://via.placeholder.com/100"} className="w-14 h-14 rounded-xl object-cover" alt="Mascota" />
                                <div className="flex-1">
                                  <h4 className="font-bold text-gray-800">{mascota.nombre}</h4>
                                  <p className="text-xs text-gray-500 capitalize">{mascota.categoria} • {mascota.raza}</p>
                                </div>
                                <span className="text-[#0B84FF]">
                                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                                </span>
                              </Link>
                            ))
                          ) : (
                            <div className="text-center py-4">
                              <p className="text-gray-400 text-sm">Aún no tienes mascotas favoritas.</p>
                              <Link to="/" className="text-[#0B84FF] text-sm font-bold hover:underline">Descubrir mascotas</Link>
                            </div>
                          )
                        )}

                        {activeTab === 'adoptadas' && (
                          dashboard?.recientes && dashboard.recientes.filter(sol => sol.estado.toLowerCase() === 'aprobada').length > 0 ? (
                            dashboard.recientes.filter(sol => sol.estado.toLowerCase() === 'aprobada').map((sol, idx) => (
                              <div key={idx} onClick={() => setSelectedAdopcionId(sol.adopcionId)} className="flex items-center gap-4 pb-4 border-b border-white/40 last:border-0 last:pb-0 cursor-pointer hover:bg-white/40 p-2 rounded-xl transition">
                                <img src={sol.fotoMascota ? (sol.fotoMascota.startsWith('http') ? sol.fotoMascota : `http://localhost:8080/uploads/${sol.fotoMascota.split('/').pop()}`) : "https://via.placeholder.com/100"} className="w-14 h-14 rounded-xl object-cover" alt="Mascota" />
                                <div className="flex-1">
                                  <h4 className="font-bold text-gray-800">{sol.mascota}</h4>
                                  <p className="text-xs text-green-600 font-semibold">¡Adoptada con éxito!</p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-4">
                              <p className="text-gray-400 text-sm">Aún no has adoptado ninguna mascota.</p>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    <div className="bg-gray-100/30 backdrop-blur-xl border border-white/60 p-8 rounded-3xl shadow-[0px_15px_35px_-10px_rgba(0,0,0,0.05),inset_0px_0px_15px_rgba(255,255,255,1)] flex flex-col h-[500px]">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-900">{selectedAdopcionId ? 'Chat de Adopción' : 'Buzón de Mensajes'}</h3>
                        {selectedAdopcionId && (
                           <button onClick={() => setSelectedAdopcionId(null)} className="text-sm text-[#0B84FF] font-semibold hover:underline">Volver</button>
                        )}
                      </div>
                      
                      {selectedAdopcionId ? (
                        <div className="flex flex-col h-full">
                          <div className="flex-1 bg-white/50 rounded-2xl p-4 border border-white overflow-y-auto flex flex-col space-y-3 mb-4">
                            {mensajesChat.map((msg, idx) => (
                              <div key={idx} className={`max-w-[85%] p-3 rounded-2xl shadow-sm ${msg.remitenteId === user.id ? 'self-end bg-[#0B84FF] text-white rounded-tr-sm' : 'self-start bg-white border border-gray-200 text-gray-800 rounded-tl-sm'}`}>
                                <p className={`text-[10px] font-bold mb-1 ${msg.remitenteId === user.id ? 'text-blue-100' : 'text-gray-500'}`}>{msg.remitenteNombre}</p>
                                {msg.contenido && <p className="text-sm whitespace-pre-wrap">{msg.contenido}</p>}
                                {msg.archivoUrl && (
                                  <div className="mt-2">
                                    {msg.archivoUrl.match(/\.(jpeg|jpg|gif|png|webp)$/) != null ? (
                                      <img src={msg.archivoUrl.startsWith('http') ? msg.archivoUrl : `http://localhost:8080${msg.archivoUrl}`} alt="Archivo adjunto" className="w-full max-w-[200px] rounded-lg" />
                                    ) : (
                                      <a href={msg.archivoUrl.startsWith('http') ? msg.archivoUrl : `http://localhost:8080${msg.archivoUrl}`} target="_blank" rel="noopener noreferrer" className={`text-sm underline ${msg.remitenteId === user.id ? 'text-white' : 'text-[#0B84FF]'}`}>
                                        Ver Archivo
                                      </a>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                            <div ref={messagesEndRef} />
                            {mensajesChat.length === 0 && <p className="text-center text-xs text-gray-400 font-medium my-auto">No hay mensajes en este chat.</p>}
                          </div>

                          <div className="flex flex-col gap-2 mt-auto">
                            {newFile && (
                              <div className="flex items-center gap-2 text-xs text-[#0B84FF] bg-blue-50 p-2 rounded-xl">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/></svg>
                                {newFile.name}
                                <button onClick={() => setNewFile(null)} className="ml-auto text-red-500 font-bold">&times;</button>
                              </div>
                            )}
                            <div className="flex gap-2 relative">
                              <input type="text" value={newMessage} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} onChange={e => setNewMessage(e.target.value)} placeholder="Escribe un mensaje..." className="flex-1 bg-white border border-gray-200 rounded-full px-4 py-2 pr-10 text-sm outline-none focus:border-[#0B84FF] transition-colors" />
                              <label className="absolute right-12 top-2 text-gray-400 hover:text-[#0B84FF] cursor-pointer">
                                <input type="file" className="hidden" onChange={e => e.target.files && setNewFile(e.target.files[0])} />
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/></svg>
                              </label>
                              <button onClick={handleSendMessage} className="bg-[#0B84FF] hover:bg-blue-600 text-white rounded-full p-2.5 transition-colors shadow-md">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path></svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4 overflow-y-auto flex-1">
                          {dashboard?.mensajes && dashboard.mensajes.length > 0 ? (
                            dashboard.mensajes.map((msg, idx) => (
                              <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-white/50 border border-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#0B84FF] font-bold flex-shrink-0 shadow-sm border border-white/60">
                                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                                </div>
                                <div className="flex-1">
                                  <div className="flex justify-between items-center mb-1">
                                    <p className="font-bold text-gray-900 text-sm">{msg.remitente}</p>
                                    <span className="text-gray-400 font-normal text-xs">{new Date(msg.fecha).toLocaleDateString()}</span>
                                  </div>
                                  <p className="text-gray-600 text-sm leading-relaxed">{msg.mensaje}</p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-center text-gray-400 py-4 text-sm">Selecciona una solicitud para abrir el chat de coordinación.</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
              </div>
            </BlurFade>
          )}

          {/* Personal Information Form */}
          <BlurFade delay={0.4} inView>
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sm:p-10">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Información Personal</h3>

              <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-600 text-sm font-semibold mb-2">Nombre completo</label>
                  <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} required className="w-full px-4 py-3 rounded-2xl bg-gray-50/50 border border-gray-200 focus:bg-white focus:border-[#0B84FF] focus:ring-4 focus:ring-[#0B84FF]/10 outline-none transition-all" />
                </div>

                <div>
                  <label className="block text-gray-600 text-sm font-semibold mb-2">Correo electrónico</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-3 rounded-2xl bg-gray-50/50 border border-gray-200 focus:bg-white focus:border-[#0B84FF] focus:ring-4 focus:ring-[#0B84FF]/10 outline-none transition-all" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-gray-600 text-sm font-semibold mb-2">Sobre mí (Bio)</label>
                  <textarea rows={4} value={bio} onChange={e => setBio(e.target.value)} placeholder="Cuéntanos un poco sobre ti..." className="w-full px-4 py-3 rounded-2xl bg-gray-50/50 border border-gray-200 focus:bg-white focus:border-[#0B84FF] focus:ring-4 focus:ring-[#0B84FF]/10 outline-none transition-all text-gray-700 resize-none" />
                </div>

                <div className="md:col-span-2 flex justify-end pt-4">
                   <button type="submit" className="text-sm text-white bg-[#0B84FF] px-8 py-3 rounded-full font-semibold hover:bg-blue-600 active:scale-95 transition-all shadow-[0_8px_15px_rgba(11,132,255,0.2)]">Guardar cambios</button>
                </div>
              </form>
            </div>
          </BlurFade>

          {/* Security Form */}
          <BlurFade delay={0.6} inView>
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sm:p-10">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Seguridad</h3>
              <form onSubmit={handleUpdatePassword} className="space-y-5">
                <div>
                  <label className="block text-gray-600 text-sm font-semibold mb-2">Contraseña actual</label>
                  <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required className="w-full max-w-md px-4 py-3 rounded-2xl bg-gray-50/50 border border-gray-200 focus:bg-white focus:border-gray-400 focus:ring-4 focus:ring-gray-100 outline-none transition-all" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl">
                  <div>
                    <label className="block text-gray-600 text-sm font-semibold mb-2">Nueva contraseña</label>
                    <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="w-full px-4 py-3 rounded-2xl bg-gray-50/50 border border-gray-200 focus:bg-white focus:border-gray-400 focus:ring-4 focus:ring-gray-100 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-gray-600 text-sm font-semibold mb-2">Confirmar nueva</label>
                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full px-4 py-3 rounded-2xl bg-gray-50/50 border border-gray-200 focus:bg-white focus:border-gray-400 focus:ring-4 focus:ring-gray-100 outline-none transition-all" />
                  </div>
                </div>
                <div className="pt-4">
                  <button type="submit" className="bg-gray-800 text-white px-8 py-3 rounded-full text-sm font-semibold hover:bg-gray-900 active:scale-95 transition-all shadow-md">Actualizar Contraseña</button>
                </div>
              </form>
            </div>
          </BlurFade>
        </div>
      </main>
      </div>
    </div>
  );
}
