import React, { useState, useEffect } from 'react';
import { useConfirm } from '../context/ConfirmContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import FullscreenToast from '../components/FullscreenToast';
import { BlurFade } from '../components/ui/blur-fade';

export default function RefugioDashboard() {
  const confirm = useConfirm();
  const { user, isAuthenticated, logout, checkAuth, setUser } = useAuth();
  const navigate = useNavigate();

  const [nombre, setNombre] = useState(user?.nombre || '');
  const [email, setEmail] = useState(user?.email || '');

  useEffect(() => {
    if (user) {
      setNombre(user.nombre || '');
      setEmail(user.email || '');
    }
  }, [user]);
  const [foto, setFoto] = useState<File | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [toastMsg, setToastMsg] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const [publicaciones, setPublicaciones] = useState<any[]>([]);
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [selectedSolicitud, setSelectedSolicitud] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Chat state
  const [mensajes, setMensajes] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [newFile, setNewFile] = useState<File | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Filter state
  const [filterBy, setFilterBy] = useState<'TODOS' | 'ADOPTADAS' | 'PENDIENTES'>('TODOS');

  const [stats, setStats] = useState({
    enAdopcion: 0,
    solicitudes: 0,
    adoptadas: 0
  });

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMascotas, setTotalMascotas] = useState(0);
  const [size] = useState(5); // Show 5 per page

  const getProfileImage = () => {
    if (foto) return URL.createObjectURL(foto);
    if (user?.foto) {
      if (user.foto.startsWith('http')) return user.foto;
      return `http://localhost:8080/uploads/${user.foto.split('/').pop()}`;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.nombre || 'Refugio')}&background=0B84FF&color=fff`;
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
    try {
      const resMascotas = await fetch(`/api/mascotas/mis-publicaciones?page=${page}&size=${size}`, { credentials: 'include' });
      const mascotasData = await resMascotas.ok ? await resMascotas.json() : { content: [], totalPages: 1, totalElements: 0 };
      
      setPublicaciones(mascotasData.content || []);
      setTotalPages(mascotasData.totalPages || 1);
      setTotalMascotas(mascotasData.totalElements || 0);

        const resAdop = await fetch('/api/adopciones/solicitudes', { credentials: 'include' });
        const adopData = await resAdop.ok ? await resAdop.json() : [];
        setSolicitudes(adopData);

        const currentMascotas = mascotasData.content || [];
        setStats({
          enAdopcion: currentMascotas.filter((m: any) => m.estado === 'DISPONIBLE').length,
          adoptadas: currentMascotas.filter((m: any) => m.estado === 'ADOPTADO').length,
          solicitudes: adopData.length
        });
      } catch (err) {
        console.error("Error fetching dashboard data", err);
      } finally {
        setLoadingStats(false);
      }
    };
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated, page, size]);

  useEffect(() => {
    if (selectedSolicitud) {
      fetchMensajes(selectedSolicitud.id);
    } else {
      setMensajes([]);
    }
  }, [selectedSolicitud]);

  const fetchMensajes = async (adopcionId: number) => {
    try {
      const res = await fetch(`/api/mensajes/adopcion/${adopcionId}`, { credentials: 'include' });
      if (res.ok) {
        setMensajes(await res.json());
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !newFile) return;
    try {
      const formData = new FormData();
      if (newMessage.trim()) {
        formData.append('contenido', newMessage);
      } else if (newFile) {
        formData.append('contenido', '[Archivo adjunto]');
      }
      if (newFile) formData.append('archivo', newFile);

      const res = await fetch(`/api/mensajes/adopcion/${selectedSolicitud.id}`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (res.ok) {
        const msg = await res.json();
        setMensajes(prev => [...prev, msg]);
        setNewMessage('');
        setNewFile(null);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    } catch (err) {
      showToast('Error al enviar mensaje', 'error');
    }
  };

  const handleResolveAdopcion = async (id: number, estado: string) => {
    try {
      const res = await fetch(`/api/adopciones/${id}/resolver?estado=${estado}`, { method: 'PUT', credentials: 'include' });
      if (res.ok) {
        showToast(`Solicitud ${estado}`, 'success');
        setSolicitudes(prev => prev.map(s => s.id === id ? { ...s, estado } : s));
        setSelectedSolicitud(null);
        // Update stats
        if (estado === 'APROBADA') {
            setStats(prev => ({...prev, adoptadas: prev.adoptadas + 1, enAdopcion: prev.enAdopcion - 1}));
            setPublicaciones(prev => prev.map(p => p.id === selectedSolicitud.mascotaId ? {...p, estado: 'ADOPTADO'} : p));
        }
      } else {
        showToast('Error al resolver solicitud', 'error');
      }
    } catch (err) {
      showToast('Error de red', 'error');
    }
  };

  const deleteAdopcion = async (adopcionId: number) => {
    if (!await confirm("¿Seguro que deseas eliminar este registro del historial?")) return;
    try {
      const res = await fetch(`/api/adopciones/${adopcionId}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) {
        setSolicitudes(prev => prev.filter(s => s.id !== adopcionId));
        showToast('Registro eliminado del historial', 'success');
        if (selectedSolicitud?.id === adopcionId) setSelectedSolicitud(null);
      } else {
        showToast('Error al eliminar registro', 'error');
      }
    } catch (err) {
      showToast('Error de conexión', 'error');
    }
  };

  const filteredSolicitudes = solicitudes.filter(sol => {
    if (filterBy === 'ADOPTADAS') return sol.estado === 'APROBADA';
    if (filterBy === 'PENDIENTES') return sol.estado === 'PENDIENTE';
    return true;
  });

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToastMsg({ msg, type });
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleDeleteMascota = async (id: number) => {
    if (!await confirm("¿Estás seguro de que deseas eliminar esta mascota?")) return;
    try {
      const res = await fetch(`/api/mascotas/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        setPublicaciones(prev => prev.filter(m => m.id !== id));
        showToast('Mascota eliminada correctamente', 'success');
      } else {
        showToast('Error al eliminar la mascota', 'error');
      }
    } catch (err) {
      showToast('Error de conexión', 'error');
    }
  };

  const handleChangeStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'DISPONIBLE' ? 'ADOPTADO' : 'DISPONIBLE';
    try {
      const res = await fetch(`/api/mascotas/${id}/estado?estado=${newStatus}`, {
        method: 'PUT',
        credentials: 'include',
      });
      if (res.ok) {
        setPublicaciones(prev => prev.map(m => m.id === id ? { ...m, estado: newStatus } : m));
        showToast(`Estado actualizado a ${newStatus}`, 'success');
      } else {
        showToast('Error al actualizar estado', 'error');
      }
    } catch (err) {
      showToast('Error al actualizar estado', 'error');
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('nombre', nombre);
      formData.append('email', email);
      if (foto) formData.append('foto', foto);

      const res = await fetch('/api/usuarios/me/perfil', {
        method: 'PUT',
        credentials: 'include',
        body: formData,
      });

      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
        showToast('¡Perfil del refugio actualizado correctamente!', 'success');
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
      showToast('Las nuevas contraseñas no coinciden', 'error');
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
        showToast(errData?.message || 'La contraseña actual es incorrecta', 'error');
      }
    } catch (err) {
      showToast('Error de conexión', 'error');
    }
  };

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    await logout();
    navigate('/');
  };

  const fadeUpVariant = {
    hidden: { opacity: 0, y: 25 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }
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
          <button onClick={() => { logout(); navigate('/'); }} className="w-full px-6 py-3 bg-[#0B84FF] hover:bg-blue-600 text-white font-bold rounded-xl shadow-md transition-colors">
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

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
                  <svg className="w-5 h-5 drop-shadow-md text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                </label>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{user.nombre || 'Mi Refugio'}</h1>
              <p className="text-gray-500 font-medium mt-1">{user.email}</p>
              <span className="inline-flex items-center gap-1 mt-3 px-3 py-1 rounded-full bg-blue-100/50 border border-blue-200 text-[#0B84FF] text-xs font-bold shadow-sm">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M3 10l9-7 9 7v9a2 2 0 01-2 2h-4v-6H9v6H5a2 2 0 01-2-2v-9z"/></svg>
                Cuenta de Refugio
              </span>
            </div>
          </BlurFade>

          <div className="space-y-8">
            
            {/* Action Buttons Top */}
            <BlurFade delay={0.15} inView>
              <div className="flex justify-center md:justify-end">
                <Link to="/dashboard/add-pet" className="flex items-center gap-2 bg-[#0B84FF] text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-[#0B84FF]/20 hover:bg-blue-600 transition hover:scale-105">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                  Nueva Mascota
                </Link>
              </div>
            </BlurFade>

            {/* ESTADÍSTICAS */}
            <BlurFade delay={0.2} inView>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div onClick={() => setFilterBy('TODOS')} className="cursor-pointer hover:scale-[1.02] transition-transform bg-blue-100/50 backdrop-blur-xl border border-white/60 p-6 rounded-3xl shadow-[0px_15px_35px_-10px_rgba(0,0,0,0.05),inset_0px_0px_15px_rgba(255,255,255,1)] flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/70 shadow-sm border border-white text-[#0B84FF] flex items-center justify-center">
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm font-semibold">En Adopción (Ver Todos)</p>
                    <h3 className="text-3xl font-bold text-gray-900">{loadingStats ? '-' : stats.enAdopcion}</h3>
                  </div>
                </div>

                <div onClick={() => setFilterBy('PENDIENTES')} className="cursor-pointer hover:scale-[1.02] transition-transform bg-yellow-100/50 backdrop-blur-xl border border-white/60 p-6 rounded-3xl shadow-[0px_15px_35px_-10px_rgba(0,0,0,0.05),inset_0px_0px_15px_rgba(255,255,255,1)] flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/70 shadow-sm border border-white text-yellow-500 flex items-center justify-center">
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm font-semibold">Pendientes</p>
                    <h3 className="text-3xl font-bold text-gray-900">{loadingStats ? '-' : stats.solicitudes}</h3>
                  </div>
                </div>

                <div onClick={() => setFilterBy('ADOPTADAS')} className="cursor-pointer hover:scale-[1.02] transition-transform bg-emerald-100/50 backdrop-blur-xl border border-white/60 p-6 rounded-3xl shadow-[0px_15px_35px_-10px_rgba(0,0,0,0.05),inset_0px_0px_15px_rgba(255,255,255,1)] flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/70 shadow-sm border border-white text-emerald-500 flex items-center justify-center">
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm font-semibold">Adoptadas</p>
                    <h3 className="text-3xl font-bold text-gray-900">{loadingStats ? '-' : stats.adoptadas}</h3>
                  </div>
                </div>
              </div>
            </BlurFade>

            {/* SOLICITUDES ENTRANTES */}
            <BlurFade delay={0.25} inView>
              <div className="bg-gray-100/30 backdrop-blur-xl border border-white/60 rounded-3xl shadow-[0px_15px_35px_-10px_rgba(0,0,0,0.05),inset_0px_0px_15px_rgba(255,255,255,1)] overflow-hidden">
                <div className="p-6 border-b border-white/50 flex items-center justify-between">
                  <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    </span>
                    Solicitudes Entrantes
                  </h3>
                  <span className="text-sm bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-full font-bold">{solicitudes.length} Nuevas</span>
                </div>
                
                {filteredSolicitudes.length > 0 ? (
                  <div className="overflow-x-auto p-2">
                    <table className="w-full text-left border-separate border-spacing-y-2">
                      <thead className="text-gray-500 text-xs uppercase px-4">
                        <tr>
                          <th className="px-6 py-3 font-semibold">Adoptante</th>
                          <th className="px-6 py-3 font-semibold">Mascota</th>
                          <th className="px-6 py-3 font-semibold">Cita</th>
                          <th className="px-6 py-3 font-semibold text-center">Estado</th>
                          <th className="px-6 py-3 font-semibold text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredSolicitudes.map((sol: any) => (
                          <tr key={sol.id} className="bg-white/40 hover:bg-white/70 transition rounded-2xl shadow-sm">
                            <td className="px-6 py-4 rounded-l-2xl">
                              <span className="font-bold text-gray-900 block">{sol.usuarioNombre}</span>
                              <span className="text-xs text-gray-500">{sol.telefono}</span>
                            </td>
                            <td className="px-6 py-4">
                                <span className="font-semibold text-[#0B84FF] block">{sol.mascotaNombre}</span>
                                <span className="text-xs text-gray-500 capitalize">{sol.mascotaTipo?.toLowerCase()} • {sol.mascotaRaza}</span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {/* Date information is now inside the message detail */}
                              <span className="text-xs text-gray-500 italic">Ver detalles</span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-bold ${sol.estado === 'APROBADA' ? 'bg-green-50 text-green-600 border-green-200' : sol.estado === 'RECHAZADA' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-yellow-50 text-yellow-600 border-yellow-200'}`}>
                                <span className={`w-2 h-2 rounded-full ${sol.estado === 'APROBADA' ? 'bg-green-500' : sol.estado === 'RECHAZADA' ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'}`}></span>
                                {sol.estado === 'PENDIENTE' ? 'Pendiente' : sol.estado}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right rounded-r-2xl">
                              <div className="flex justify-end gap-2">
                                <button onClick={() => setSelectedSolicitud(sol)} className="px-4 py-2 rounded-xl bg-[#0B84FF] text-white text-xs font-bold hover:bg-blue-600 transition shadow-md">Revisar</button>
                                <button onClick={() => deleteAdopcion(sol.id)} className="px-3 py-2 rounded-xl bg-red-50 text-red-500 text-xs font-bold hover:bg-red-100 border border-red-100 transition shadow-md" title="Eliminar del historial">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-12 text-center bg-white/20">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2-2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/></svg>
                    </div>
                    <p className="text-gray-500 font-medium">No hay solicitudes pendientes</p>
                  </div>
                )}
              </div>
            </BlurFade>

            {/* TABLA DE PUBLICACIONES */}
            <BlurFade delay={0.3} inView>
              <div className="bg-gray-100/30 backdrop-blur-xl border border-white/60 rounded-3xl shadow-[0px_15px_35px_-10px_rgba(0,0,0,0.05),inset_0px_0px_15px_rgba(255,255,255,1)] overflow-hidden">
                <div className="p-6 border-b border-white/50 flex items-center justify-between">
                  <h3 className="font-bold text-xl text-gray-900">Mis Publicaciones</h3>
                  <span className="text-sm bg-gray-200/50 text-gray-600 px-3 py-1.5 rounded-full font-semibold">{publicaciones.length} Mascotas</span>
                </div>
                
                {publicaciones.length > 0 ? (
                  <>
                    <div className="overflow-x-auto p-4 border-b border-gray-100">
                      <table className="w-full text-left border-separate border-spacing-y-2">
                        <thead className="text-gray-500 text-xs uppercase px-4">
                          <tr>
                            <th className="px-6 py-3 font-semibold">Mascota</th>
                            <th className="px-6 py-3 font-semibold">Tipo</th>
                            <th className="px-6 py-3 font-semibold text-center">Estado</th>
                            <th className="px-6 py-3 font-semibold text-right">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {publicaciones.map((pet) => (
                            <tr key={pet.id} className="bg-white/40 hover:bg-white/70 transition rounded-2xl shadow-sm">
                              <td className="px-6 py-4 rounded-l-2xl flex items-center gap-4">
                                <img src={pet.imagenUrl ? (pet.imagenUrl.startsWith('http') ? pet.imagenUrl : `http://localhost:8080/uploads/${pet.imagenUrl}`) : "https://images.unsplash.com/photo-1543466835-00a7907e9de1"} className="w-12 h-12 rounded-2xl object-cover shadow-sm" alt={pet.nombre} />
                                <span className="font-bold text-gray-900">{pet.nombre}</span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600 capitalize font-medium">{pet.categoria}</td>
                              
                              <td className="px-6 py-4 text-center">
                                {pet.estado === 'ADOPTADO' ? (
                                  <button className="inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-full text-xs font-bold bg-blue-50 text-[#0B84FF] border border-[#0B84FF]/20 cursor-not-allowed">
                                    <span className="w-2 h-2 rounded-full bg-[#0B84FF]"></span>
                                    Adoptado
                                  </button>
                                ) : pet.estado === 'DISPONIBLE' ? (
                                  <button onClick={() => handleChangeStatus(pet.id, pet.estado)} className="inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-full text-xs font-bold bg-green-50 text-green-600 border border-green-100 hover:bg-green-100 transition cursor-pointer">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                    Disponible
                                  </button>
                                ) : (
                                  <button onClick={() => handleChangeStatus(pet.id, pet.estado)} className="inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-full text-xs font-bold bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200 transition cursor-pointer">
                                    <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                                    No Disponible
                                  </button>
                                )}
                              </td>

                              <td className="px-6 py-4 text-right rounded-r-2xl">
                                <div className="flex items-center justify-end gap-2">
                                  <button onClick={() => handleDeleteMascota(pet.id)} className="px-3 py-1.5 rounded-xl bg-red-50 text-red-500 text-xs font-bold hover:bg-red-100 border border-red-100 transition shadow-sm">Eliminar</button>
                                  <Link to={`/dashboard/edit-pet/${pet.id}`} className="px-3 py-1.5 rounded-xl bg-white text-[#0B84FF] text-xs font-bold hover:bg-blue-50 border border-blue-100 transition shadow-sm">Editar</Link>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="p-4 flex items-center justify-between bg-white/30 rounded-b-3xl">
                        <span className="text-sm text-gray-600 font-medium">
                          Página {page + 1} de {totalPages} ({totalMascotas} mascotas)
                        </span>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0}
                            className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-white border border-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                          >
                            Anterior
                          </button>
                          <button 
                            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={page >= totalPages - 1}
                            className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-white border border-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                          >
                            Siguiente
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                <div className="p-12 text-center bg-white/20">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                  </div>
                  <p className="text-gray-500 font-medium mb-4">Aún no has publicado mascotas</p>
                  <Link to="/dashboard/add-pet" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0B84FF] text-white rounded-xl text-sm font-bold shadow-md hover:bg-blue-600 transition">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                    Publicar primera mascota
                  </Link>
                </div>
              )}
              </div>
            </BlurFade>

            {/* CONFIGURACIÓN */}
            <BlurFade delay={0.4} inView>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              <div className="bg-gray-100/30 backdrop-blur-xl border border-white/60 p-8 rounded-3xl shadow-[0px_15px_35px_-10px_rgba(0,0,0,0.05),inset_0px_0px_15px_rgba(255,255,255,1)]">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#0B84FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                  Editar Perfil
                </h3>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block text-gray-600 text-sm font-semibold mb-2">Nombre del refugio</label>
                    <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} required
                           className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white focus:bg-white focus:border-[#0B84FF] focus:ring-2 focus:ring-[#0B84FF]/20 outline-none transition shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-gray-600 text-sm font-semibold mb-2">Correo electrónico</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                           className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white focus:bg-white focus:border-[#0B84FF] focus:ring-2 focus:ring-[#0B84FF]/20 outline-none transition shadow-sm" />
                  </div>
                  <div className="pt-2">
                    <button type="submit" className="w-full px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition shadow-lg">
                      Guardar Cambios
                    </button>
                  </div>
                </form>
              </div>

              <div className="bg-gray-100/30 backdrop-blur-xl border border-white/60 p-8 rounded-3xl shadow-[0px_15px_35px_-10px_rgba(0,0,0,0.05),inset_0px_0px_15px_rgba(255,255,255,1)]">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                  Seguridad
                </h3>
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div>
                    <label className="block text-gray-600 text-sm font-semibold mb-2">Contraseña actual</label>
                    <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required
                           className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white focus:bg-white focus:border-[#0B84FF] outline-none transition shadow-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-600 text-sm font-semibold mb-2">Nueva</label>
                      <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required
                             className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white focus:bg-white focus:border-[#0B84FF] outline-none transition shadow-sm" />
                    </div>
                    <div>
                      <label className="block text-gray-600 text-sm font-semibold mb-2">Confirmar</label>
                      <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required
                             className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white focus:bg-white focus:border-[#0B84FF] outline-none transition shadow-sm" />
                    </div>
                  </div>
                  <div className="pt-2 flex justify-between items-center">
                    <button type="submit" className="px-6 py-3 bg-gray-200 text-gray-800 rounded-xl font-bold hover:bg-gray-300 transition shadow-sm">
                      Actualizar Clave
                    </button>
                    <button onClick={handleLogout} type="button" className="text-red-500 font-semibold text-sm hover:text-red-700 transition">
                      Cerrar Sesión
                    </button>
                  </div>
                </form>
              </div>
              </div>
            </BlurFade>

          </div>
        </main>
      </div>

      {selectedSolicitud && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Solicitud de Adopción</h3>
                <p className="text-sm text-gray-500 font-medium">{selectedSolicitud.mascotaNombre} - {selectedSolicitud.usuarioNombre}</p>
              </div>
              <button onClick={() => setSelectedSolicitud(null)} className="text-gray-400 hover:text-red-500 transition-colors bg-white rounded-full p-2 shadow-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100 grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <h4 className="text-xs font-bold text-[#0B84FF] uppercase tracking-wider mb-2">Mensaje del Solicitante</h4>
                    <p className="text-gray-700 font-medium text-sm whitespace-pre-wrap">{selectedSolicitud.mensaje || 'No dejó mensaje inicial.'}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Cita Propuesta</h4>
                    <p className="text-sm font-medium text-gray-900">{selectedSolicitud.fechaVisita} a las {selectedSolicitud.horaVisita}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Dirección</h4>
                    <p className="text-sm font-medium text-gray-900">{selectedSolicitud.direccion}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Vivienda & Ingresos</h4>
                    <p className="text-sm font-medium text-gray-900">{selectedSolicitud.tipoVivienda} / {selectedSolicitud.ingresosAprox}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Ocupación / Teléfono</h4>
                    <p className="text-sm font-medium text-gray-900">{selectedSolicitud.ocupacion} / {selectedSolicitud.telefono}</p>
                  </div>
                </div>

              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  Chat de Coordinación
                </h4>
                <div className="bg-gray-50 rounded-2xl p-4 h-64 border border-gray-100 flex flex-col space-y-3 overflow-y-auto">
                  {mensajes.map((msg, idx) => (
                    <div key={idx} className={`max-w-[80%] p-3 rounded-2xl shadow-sm ${msg.remitenteId === user.id ? 'self-end bg-[#0B84FF] text-white rounded-tr-sm' : 'self-start bg-white border border-gray-200 text-gray-800 rounded-tl-sm'}`}>
                      <p className={`text-[10px] font-bold mb-1 ${msg.remitenteId === user.id ? 'text-blue-100' : 'text-gray-500'}`}>{msg.remitenteNombre}</p>
                      {msg.contenido && <p className="text-sm whitespace-pre-wrap">{msg.contenido}</p>}
                      {msg.archivoUrl && (
                        <div className="mt-2">
                          {msg.archivoUrl.match(/\.(jpeg|jpg|gif|png|webp)$/) != null ? (
                            <img src={msg.archivoUrl.startsWith('http') ? msg.archivoUrl : `http://localhost:8080${msg.archivoUrl}`} alt="Archivo adjunto" className="w-full max-w-[200px] rounded-lg" />
                          ) : (
                            <a href={msg.archivoUrl.startsWith('http') ? msg.archivoUrl : `http://localhost:8080${msg.archivoUrl}`} target="_blank" rel="noopener noreferrer" className={`text-sm underline ${msg.remitenteId === user.id ? 'text-white' : 'text-[#0B84FF]'}`}>
                              Ver Archivo Adjunto
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                  {mensajes.length === 0 && <p className="text-center text-xs text-gray-400 font-medium my-auto">No hay mensajes aún.</p>}
                </div>
              </div>
            </div>

            <div className="p-4 bg-white border-t border-gray-100 flex flex-col gap-2">
              {newFile && (
                <div className="flex items-center gap-2 text-sm text-[#0B84FF] bg-blue-50 p-2 rounded-xl">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/></svg>
                   {newFile.name}
                   <button onClick={() => setNewFile(null)} className="ml-auto text-red-500">&times;</button>
                </div>
              )}
              <div className="flex gap-2 relative">
                <input type="text" value={newMessage} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} onChange={e => setNewMessage(e.target.value)} placeholder="Escribe un mensaje..." className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 pr-10 text-sm outline-none focus:border-[#0B84FF] transition-colors" />
                <label className="absolute right-12 top-2 text-gray-400 hover:text-[#0B84FF] cursor-pointer">
                  <input type="file" className="hidden" onChange={e => e.target.files && setNewFile(e.target.files[0])} />
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/></svg>
                </label>
                <button onClick={handleSendMessage} className="bg-[#0B84FF] hover:bg-blue-600 text-white rounded-full p-2.5 transition-colors shadow-md">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path></svg>
                </button>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
               {selectedSolicitud.estado !== 'RECHAZADA' && (
                  <button onClick={() => handleResolveAdopcion(selectedSolicitud.id, 'RECHAZADA')} className="px-5 py-2 rounded-full text-red-600 font-bold hover:bg-red-50 transition-colors text-sm">Rechazar</button>
               )}
               {selectedSolicitud.estado !== 'APROBADA' && (
                  <button onClick={() => handleResolveAdopcion(selectedSolicitud.id, 'APROBADA')} className="px-5 py-2 rounded-full bg-[#0B84FF] hover:bg-blue-600 text-white font-bold transition-colors shadow-md text-sm">Aprobar Adopción</button>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
