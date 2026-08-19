import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useConfirm } from '../context/ConfirmContext';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import FullscreenToast from '../components/FullscreenToast';
import { BlurFade } from '../components/ui/blur-fade';
import { DatePicker } from '../components/ui/date-picker';
import { Search, X, Sparkles, Filter, Calendar, Clock, UserCheck, ShieldCheck } from 'lucide-react';

const GLASS_CONFIG = {
  blurLevel: '30px',
  innerBlurLevel: '16px',
  saturate: '200%',
  opacityMax: 0.45,
  opacityMin: 0.20,
  wheelSensitivity: 80,
};

const AnimatedTrashIcon = ({ className = "w-4 h-4" }: { className?: string }) => {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={`${className} overflow-visible`}
    >
      <g className="transition-transform duration-250 ease-out origin-[4px_6px] group-hover:-translate-y-1.5 group-hover:-rotate-[28deg]">
        <path d="M3 6h18" />
        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      </g>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
};

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
  adopcionId?: number;
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
  const [telefono, setTelefono] = useState(user?.telefono || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [foto, setFoto] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [activePetBubble, setActivePetBubble] = useState<{
    id: string;
    tipo: string;
    raza: string;
    refugio?: string;
    x: number;
    y: number;
  } | null>(null);
  const lastBubbleOpenRef = React.useRef<number>(0);

  const openPetBubble = (data: { id: string; tipo: string; raza: string; refugio?: string; x: number; y: number }) => {
    lastBubbleOpenRef.current = Date.now();
    setActivePetBubble(data);
  };

  useEffect(() => {
    let accumulatedWheel = 0;
    let wheelTimer: any;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActivePetBubble(null);
        setPreviewImage(null);
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (Date.now() - lastBubbleOpenRef.current < 250) return;

      const delta = Math.abs(e.deltaY) + Math.abs(e.deltaX);
      if (delta > 0) {
        accumulatedWheel += delta;
        clearTimeout(wheelTimer);
        wheelTimer = setTimeout(() => {
          accumulatedWheel = 0;
        }, 200);

        if (accumulatedWheel >= GLASS_CONFIG.wheelSensitivity) {
          setActivePetBubble(null);
          accumulatedWheel = 0;
        }
      }
    };

    const handleScroll = () => {
      if (Date.now() - lastBubbleOpenRef.current < 250) return;
      setActivePetBubble(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(wheelTimer);
    };
  }, []);

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf') || !file.type.startsWith('image/')) {
      showToast('No se permiten archivos PDF. Solo imágenes (JPG, PNG, WEBP).', 'error');
      e.target.value = '';
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      showToast('La foto de perfil supera el límite de 3MB.', 'error');
      e.target.value = '';
      return;
    }
    setFoto(file);
  };

  useEffect(() => {
    if (user) {
      setNombre(user.nombre || '');
      setEmail(user.email || '');
      setTelefono(user.telefono || '');
      setBio(user.bio || '');
    }
  }, [user]);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [toastMsg, setToastMsg] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [dashboard, setDashboard] = useState<DashboardDTO | null>(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [activeTab, setActiveTab] = useState<'solicitudes' | 'favoritos' | 'adoptadas'>('solicitudes');
  const [solicitudSearch, setSolicitudSearch] = useState('');
  const [solicitudFilter, setSolicitudFilter] = useState<'TODAS' | 'PENDIENTES' | 'APROBADAS' | 'RECHAZADAS'>('TODAS');

  const filteredSolicitudes = React.useMemo(() => {
    if (!dashboard?.recientes) return [];
    return dashboard.recientes.filter(sol => {
      const q = solicitudSearch.toLowerCase().trim();
      const matchesQuery = !q || 
        (sol.mascota && sol.mascota.toLowerCase().includes(q)) ||
        (sol.mascotaTipo && sol.mascotaTipo.toLowerCase().includes(q)) ||
        (sol.mascotaRaza && sol.mascotaRaza.toLowerCase().includes(q)) ||
        (sol.refugio && sol.refugio.toLowerCase().includes(q));

      const estado = (sol.estado || '').toUpperCase();
      let matchesEstado = true;
      if (solicitudFilter === 'PENDIENTES') matchesEstado = estado.includes('PENDIENTE') || estado.includes('REVISI');
      else if (solicitudFilter === 'APROBADAS') matchesEstado = estado.includes('APROBADA');
      else if (solicitudFilter === 'RECHAZADAS') matchesEstado = estado.includes('RECHAZADA');

      return matchesQuery && matchesEstado;
    });
  }, [dashboard?.recientes, solicitudSearch, solicitudFilter]);

  const [favoritosData, setFavoritosData] = useState<any[]>([]);
  const [selectedAdopcionId, setSelectedAdopcionId] = useState<number | null>(null);
  const [mensajesChat, setMensajesChat] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [newFile, setNewFile] = useState<File | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const [expandedSeguimiento, setExpandedSeguimiento] = useState<number | null>(null);
  const [seguimientoRecords, setSeguimientoRecords] = useState<any[]>([]);
  const [newSegFecha, setNewSegFecha] = useState('');
  const [newSegComentario, setNewSegComentario] = useState('');
  const [newSegFoto, setNewSegFoto] = useState<File | null>(null);

  const toggleSeguimiento = async (adopcionId: number) => {
    if (expandedSeguimiento === adopcionId) {
      setExpandedSeguimiento(null);
    } else {
      setExpandedSeguimiento(adopcionId);
      try {
        const res = await fetch(`/api/adopciones/${adopcionId}/seguimiento`, { credentials: 'include' });
        if (res.ok) setSeguimientoRecords(await res.json());
      } catch (err) {}
    }
  };

  const handleAddSeguimiento = async (e: React.FormEvent, adopcionId: number) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append('fecha', newSegFecha);
      fd.append('comentario', newSegComentario);
      if (newSegFoto) fd.append('foto', newSegFoto);
      const res = await fetch(`/api/adopciones/${adopcionId}/seguimiento`, { method: 'POST', credentials: 'include', body: fd });
      if (res.ok) {
        showToast('Seguimiento añadido', 'success');
        setNewSegFecha(''); setNewSegComentario(''); setNewSegFoto(null);
        const resList = await fetch(`/api/adopciones/${adopcionId}/seguimiento`, { credentials: 'include' });
        if (resList.ok) setSeguimientoRecords(await resList.json());
      } else showToast('Error al añadir', 'error');
    } catch (err) { showToast('Error al añadir', 'error'); }
  };

  useEffect(() => {
    if (selectedAdopcionId) fetchMensajesChat(selectedAdopcionId);
    else setMensajesChat([]);
  }, [selectedAdopcionId]);

  const fetchMensajesChat = async (adopcionId: number) => {
    try {
      const res = await fetch(`/api/mensajes/adopcion/${adopcionId}`, { credentials: 'include' });
      if (res.ok) {
        setMensajesChat(await res.json());
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    } catch (err) { console.error(err); }
  };

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !newFile) || !selectedAdopcionId) return;
    try {
      const formData = new FormData();
      if (newMessage.trim()) formData.append('contenido', newMessage);
      else if (newFile) formData.append('contenido', '[Archivo adjunto]');
      if (newFile) formData.append('archivo', newFile);
      const res = await fetch(`/api/mensajes/adopcion/${selectedAdopcionId}`, { method: 'POST', credentials: 'include', body: formData });
      if (res.ok) {
        const msg = await res.json();
        setMensajesChat(prev => [...prev, msg]);
        setNewMessage(''); setNewFile(null);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    } catch (err) { showToast('Error al enviar mensaje', 'error'); }
  };

  const deleteAdopcion = async (adopcionId: number) => {
    if (!await confirm("¿Seguro que deseas eliminar este registro del historial?")) return;
    try {
      const res = await fetch(`/api/adopciones/${adopcionId}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) {
        setDashboard(prev => prev ? ({ ...prev, recientes: prev.recientes.filter(r => r.adopcionId !== adopcionId) }) : prev);
        showToast('Registro eliminado del historial', 'success');
        if (selectedAdopcionId === adopcionId) setSelectedAdopcionId(null);
      } else showToast('Error al eliminar registro', 'error');
    } catch (err) { showToast('Error de conexión', 'error'); }
  };

  useEffect(() => {
    if (!isAuthenticated || !user || user.rol === 'ADMIN' || user.rol === 'REFUGIO') return;
    const fetchDashboard = async () => {
      try {
        const res = await fetch('/api/dashboard/usuario', { credentials: 'include' });
        if (res.ok) setDashboard(await res.json());
        const favRes = await fetch('/api/favoritos', { credentials: 'include' });
        if (favRes.ok) setFavoritosData(await favRes.json());
      } catch (err) { console.error('Error fetching dashboard', err); } finally { setLoadingDashboard(false); }
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

  if (!isAuthenticated || !user) { navigate('/login'); return null; }

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToastMsg({ msg, type });
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!telefono.trim()) {
      showToast('El teléfono es obligatorio para procesar solicitudes de adopción.', 'error');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('nombre', nombre);
      formData.append('email', email);
      formData.append('telefono', telefono);
      formData.append('bio', bio);
      if (foto) formData.append('foto', foto);
      const res = await fetch('/api/usuarios/me/perfil', { method: 'POST', credentials: 'include', body: formData });
      if (res.ok) { setUser(await res.json()); showToast('¡Perfil actualizado!', 'success'); }
      else showToast('Error al guardar', 'error');
    } catch (err) { showToast('Error de conexión', 'error'); }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('Las contraseñas no coinciden', 'error');
      return;
    }
    try {
      const res = await fetch('/api/usuarios/me/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
      });
      if (res.ok) { showToast('¡Contraseña actualizada!', 'success'); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); }
      else showToast('Error al cambiar contraseña', 'error');
    } catch (err) { showToast('Error de conexión', 'error'); }
  };

  const getProfileImage = () => {
    if (foto) return URL.createObjectURL(foto);
    if (user.foto) return user.foto.startsWith('http') ? user.foto : `http://localhost:8080/uploads/${user.foto.split('/').pop()}`;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nombre)}&background=0B84FF&color=fff`;
  };

  const getAntiguedad = (fechaIso?: string) => {
    if (!fechaIso) return { fechaStr: 'Reciente', tiempoStr: 'Miembro activo' };
    try {
      const d = new Date(fechaIso);
      if (isNaN(d.getTime())) return { fechaStr: 'Reciente', tiempoStr: 'Miembro activo' };
      
      const fechaStr = d.toLocaleDateString('es-CO', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      const diffMs = Math.max(0, Date.now() - d.getTime());
      const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffMeses = Math.floor(diffDias / 30);
      const diffAnios = Math.floor(diffDias / 365);

      let tiempoStr = 'Nuevo miembro';
      if (diffDias === 0) tiempoStr = 'Se unió hoy';
      else if (diffDias === 1) tiempoStr = '1 día en la comunidad';
      else if (diffDias < 30) tiempoStr = `${diffDias} días en la comunidad`;
      else if (diffMeses === 1) tiempoStr = '1 mes en la comunidad';
      else if (diffMeses < 12) tiempoStr = `${diffMeses} meses en la comunidad`;
      else if (diffAnios === 1) tiempoStr = '1 año en la comunidad';
      else tiempoStr = `${diffAnios} años en la comunidad`;

      return { fechaStr, tiempoStr };
    } catch (e) {
      return { fechaStr: 'Reciente', tiempoStr: 'Miembro activo' };
    }
  };

  return (
    <div className="min-h-screen font-inter text-gray-800 bg-gray-50/50">
      <Header onShowToast={showToast} onSelectDrop={() => {}} searchQuery="" setSearchQuery={() => {}} />
      <FullscreenToast toast={toastMsg} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-28">
        <BlurFade delay={0.05} inView={false}>
          <div className="flex flex-col items-center text-center mb-10">
            <div className="relative w-32 h-32 mb-4 group">
              <img src={getProfileImage()} alt="Perfil" className="w-full h-full rounded-full object-cover border-4 border-white shadow-xl" />
              <label className="absolute bottom-0 right-0 bg-[#ffffff4b] backdrop-blur-md hover:bg-white/50 p-2.5 rounded-full text-white shadow-xl border-2 border-white cursor-pointer transition-transform hover:scale-105 active:scale-95">
                <input type="file" accept="image/*" onChange={handleFotoChange} className="hidden" />
                <svg className="w-5 h-5 drop-shadow-md text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              </label>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{user.nombre}</h1>
            <p className="text-gray-500 font-medium mt-1">{user.email}</p>
          </div>
        </BlurFade>

        <div className="space-y-8">
          {/* DASHBOARD SECTION */}
          {user.rol === 'USUARIO' && (
            <BlurFade delay={0.12} inView={false}>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div 
                    onClick={() => setActiveTab('solicitudes')}
                    className={`bg-blue-100/50 backdrop-blur-xl border p-6 rounded-3xl cursor-pointer transition-all ${activeTab === 'solicitudes' ? 'border-[#0B84FF] shadow-lg ring-2 ring-[#0B84FF]/20 scale-[1.02]' : 'border-white/60 shadow-sm hover:scale-[1.01]'} flex items-center gap-4`}>
                    <div className="w-14 h-14 rounded-2xl bg-white/70 shadow-sm border border-white text-[#0B84FF] flex items-center justify-center">
                      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm font-semibold">Solicitudes</p>
                      <h3 className="text-3xl font-bold text-gray-900">{loadingDashboard ? '-' : (dashboard?.totalSolicitudes || 0)}</h3>
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
                      <h3 className="text-3xl font-bold text-gray-900">{loadingDashboard ? '-' : (dashboard?.totalFavoritos || 0)}</h3>
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
                      <h3 className="text-3xl font-bold text-gray-900">{loadingDashboard ? '-' : (dashboard?.totalAdoptadas || 0)}</h3>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                  <div className="bg-gray-100/30 backdrop-blur-xl border border-white/60 p-6 md:p-8 rounded-3xl shadow-[0px_15px_35px_-10px_rgba(0,0,0,0.05),inset_0px_0px_15px_rgba(255,255,255,1)]">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      {activeTab === 'solicitudes' ? 'Mis solicitudes' : activeTab === 'favoritos' ? 'Mis favoritos' : 'Mis adoptadas'}
                    </h3>
                    <div className="space-y-4">
                      {activeTab === 'solicitudes' && (
                        <>
                          {/* CP-HU-05: Buscador y Filtro Dinámico del Historial de Solicitudes */}
                          {dashboard?.recientes && dashboard.recientes.length > 0 && (
                            <div className="mb-4 space-y-2.5">
                              {/* Barra de búsqueda */}
                              <div className="relative flex items-center">
                                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 pointer-events-none" />
                                <input
                                  type="text"
                                  value={solicitudSearch}
                                  onChange={(e) => setSolicitudSearch(e.target.value)}
                                  placeholder="Buscar por nombre de mascota, raza o refugio..."
                                  className="w-full pl-9 pr-8 py-2 rounded-2xl bg-white/80 border border-gray-200/80 text-xs font-semibold placeholder:text-gray-400 focus:bg-white focus:border-[#0B84FF] outline-none transition shadow-2xs"
                                />
                                {solicitudSearch && (
                                  <button
                                    type="button"
                                    onClick={() => setSolicitudSearch('')}
                                    className="absolute right-2.5 p-0.5 text-gray-400 hover:text-gray-600 rounded-full cursor-pointer"
                                    title="Limpiar búsqueda"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>

                              {/* Chips de filtro rápido por estado */}
                              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-bold">
                                {(['TODAS', 'PENDIENTES', 'APROBADAS', 'RECHAZADAS'] as const).map((filtro) => {
                                  const isSel = solicitudFilter === filtro;
                                  return (
                                    <button
                                      key={filtro}
                                      type="button"
                                      onClick={() => setSolicitudFilter(filtro)}
                                      className={`px-2.5 py-1 rounded-full border transition-all cursor-pointer whitespace-nowrap ${
                                        isSel
                                          ? 'bg-[#0B84FF] text-white border-[#0B84FF] shadow-xs'
                                          : 'bg-white/70 text-gray-600 border-gray-200 hover:bg-white hover:text-gray-900'
                                      }`}
                                    >
                                      {filtro === 'TODAS'
                                        ? 'Todas'
                                        : filtro === 'PENDIENTES'
                                        ? 'En Revisión'
                                        : filtro === 'APROBADAS'
                                        ? 'Aprobadas'
                                        : 'Rechazadas'}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Listado filtrado de solicitudes */}
                          {filteredSolicitudes.length > 0 ? (
                            filteredSolicitudes.map((sol, idx) => (
                              <div key={idx} className="flex items-center gap-3.5 pb-4 border-b border-white/40 last:border-0 last:pb-0 hover:bg-white/40 p-2.5 rounded-2xl transition">
                                <img 
                                  src={sol.fotoMascota ? (sol.fotoMascota.startsWith('http') ? sol.fotoMascota : `http://localhost:8080/uploads/${sol.fotoMascota.split('/').pop()}`) : "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=300"} 
                                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=300"; }}
                                  className="w-13 h-13 rounded-2xl object-cover shadow-xs border border-white shrink-0 cursor-pointer" 
                                  alt="Mascota" 
                                  onClick={() => setSelectedAdopcionId(sol.adopcionId)}
                                />
                                <div className="flex-1 min-w-0">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const rect = e.currentTarget.getBoundingClientRect();
                                      if (activePetBubble?.id === `sol-${sol.adopcionId}`) {
                                        setActivePetBubble(null);
                                      } else {
                                        openPetBubble({
                                          id: `sol-${sol.adopcionId}`,
                                          tipo: sol.mascotaTipo?.toLowerCase() || 'mascota',
                                          raza: sol.mascotaRaza || 'Mestizo / Común',
                                          refugio: sol.refugio || 'Refugio',
                                          x: rect.left,
                                          y: rect.bottom + 8
                                        });
                                      }
                                    }}
                                    className="group inline-flex items-center gap-1.5 font-bold text-gray-900 hover:text-[#0B84FF] transition-colors cursor-pointer text-sm truncate max-w-full"
                                    title="Clic para ver detalles de la mascota"
                                  >
                                    <span className="truncate">{sol.mascota}</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-[#0B84FF] transition-colors shrink-0" />
                                  </button>
                                </div>
                                <span onClick={() => setSelectedAdopcionId(sol.adopcionId)} className={`px-3 py-1 rounded-full text-xs font-bold capitalize cursor-pointer shrink-0 ${getStatusStyle(sol.estado)}`}>
                                  {getStatusText(sol.estado)}
                                </span>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); deleteAdopcion(sol.adopcionId); }} 
                                  className="group flex items-center justify-center w-8.5 h-8.5 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-xs hover:shadow-md hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer shrink-0 ml-1" 
                                  title="Eliminar del historial"
                                >
                                  <AnimatedTrashIcon className="w-4 h-4" />
                                </button>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-6">
                              {solicitudSearch || solicitudFilter !== 'TODAS' ? (
                                <div className="space-y-2">
                                  <p className="text-gray-500 text-xs font-semibold">
                                    No se encontraron solicitudes que coincidan con la búsqueda.
                                  </p>
                                  <button
                                    type="button"
                                    onClick={() => { setSolicitudSearch(''); setSolicitudFilter('TODAS'); }}
                                    className="text-[#0B84FF] text-xs font-bold hover:underline cursor-pointer"
                                  >
                                    Limpiar filtros
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <p className="text-gray-400 text-sm">No tienes solicitudes activas.</p>
                                  <Link to="/" className="text-[#0B84FF] text-sm font-bold hover:underline mt-1 inline-block">Buscar mascota</Link>
                                </>
                              )}
                            </div>
                          )}
                        </>
                      )}

                      {activeTab === 'favoritos' && (
                        favoritosData.length > 0 ? (
                          favoritosData.map((mascota, idx) => (
                            <Link to={`/adoptar/${mascota.id}`} key={idx} className="flex items-center gap-3.5 pb-4 border-b border-white/40 last:border-0 last:pb-0 cursor-pointer hover:bg-white/40 p-2.5 rounded-2xl transition">
                              <img 
                                src={mascota.imagenUrl ? (mascota.imagenUrl.startsWith('http') ? mascota.imagenUrl : `http://localhost:8080/uploads/${mascota.imagenUrl.split('/').pop()}`) : "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=300"} 
                                onError={(e) => { (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=300"; }}
                                className="w-13 h-13 rounded-2xl object-cover shadow-xs border border-white shrink-0" 
                                alt="Mascota" 
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-gray-800 text-base truncate">{mascota.nombre}</h4>
                                <p className="text-xs text-gray-500 capitalize">{mascota.categoria} • {mascota.raza}</p>
                              </div>
                              <span className="text-[#0B84FF] shrink-0">
                                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                              </span>
                            </Link>
                          ))
                        ) : (
                          <div className="text-center py-6">
                            <p className="text-gray-400 text-sm">Aún no tienes mascotas favoritas.</p>
                            <Link to="/" className="text-[#0B84FF] text-sm font-bold hover:underline mt-1 inline-block">Descubrir mascotas</Link>
                          </div>
                        )
                      )}

                      {activeTab === 'adoptadas' && (
                        dashboard?.recientes && dashboard.recientes.filter(sol => sol.estado.toLowerCase() === 'aprobada').length > 0 ? (
                          dashboard.recientes.filter(sol => sol.estado.toLowerCase() === 'aprobada').map((sol, idx) => (
                            <div key={idx} className="flex flex-col gap-2 pb-4 border-b border-white/40 last:border-0 last:pb-0 transition">
                              <div className="flex items-center gap-3.5 hover:bg-white/40 p-2.5 rounded-2xl cursor-pointer" onClick={() => setSelectedAdopcionId(sol.adopcionId)}>
                                <img 
                                  src={sol.fotoMascota ? (sol.fotoMascota.startsWith('http') ? sol.fotoMascota : `http://localhost:8080/uploads/${sol.fotoMascota.split('/').pop()}`) : "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=300"} 
                                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=300"; }}
                                  className="w-13 h-13 rounded-2xl object-cover shadow-xs border border-white shrink-0" 
                                  alt="Mascota" 
                                />
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-gray-800 text-base">{sol.mascota}</h4>
                                  <p className="text-xs text-green-600 font-semibold">¡Adoptada con éxito!</p>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); toggleSeguimiento(sol.adopcionId); }} className="px-3 py-1.5 bg-blue-50 text-[#0B84FF] rounded-xl text-xs font-bold hover:bg-blue-100 transition shrink-0">
                                  {expandedSeguimiento === sol.adopcionId ? 'Ocultar Seguimiento' : 'Ver Seguimiento'}
                                </button>
                              </div>
                              {expandedSeguimiento === sol.adopcionId && (
                                <div className="bg-white/60 p-4 rounded-xl shadow-inner mt-2">
                                  <h5 className="font-bold text-sm text-gray-800 mb-3">Registros de Seguimiento</h5>
                                  <div className="space-y-3 mb-4 max-h-48 overflow-y-auto pr-2">
                                    {seguimientoRecords.length > 0 ? seguimientoRecords.map((seg, i) => (
                                      <div key={i} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex gap-3">
                                        {(seg.fotoOpcional || seg.foto_opcional) && (
                                          <img
                                            src={
                                              (seg.fotoOpcional || seg.foto_opcional).startsWith('http')
                                                ? (seg.fotoOpcional || seg.foto_opcional)
                                                : (seg.fotoOpcional || seg.foto_opcional).startsWith('/')
                                                ? `http://localhost:8080${seg.fotoOpcional || seg.foto_opcional}`
                                                : `http://localhost:8080/uploads/${seg.fotoOpcional || seg.foto_opcional}`
                                            }
                                            onClick={() => setPreviewImage(
                                              (seg.fotoOpcional || seg.foto_opcional).startsWith('http')
                                                ? (seg.fotoOpcional || seg.foto_opcional)
                                                : (seg.fotoOpcional || seg.foto_opcional).startsWith('/')
                                                ? `http://localhost:8080${seg.fotoOpcional || seg.foto_opcional}`
                                                : `http://localhost:8080/uploads/${seg.fotoOpcional || seg.foto_opcional}`
                                            )}
                                            alt="Seguimiento"
                                            className="w-16 h-16 rounded-md object-cover cursor-pointer hover:opacity-80 transition hover:scale-105"
                                            title="Haz clic para agrandar"
                                          />
                                        )}
                                        <div>
                                          <p className="text-xs font-bold text-gray-500 mb-1">{seg.fecha}</p>
                                          <p className="text-sm text-gray-800">{seg.comentario}</p>
                                        </div>
                                      </div>
                                    )) : (
                                      <p className="text-xs text-gray-500 italic">No hay registros aún.</p>
                                    )}
                                  </div>

                                  <form onSubmit={(e) => handleAddSeguimiento(e, sol.adopcionId)} className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                                    <h6 className="text-xs font-bold text-[#0B84FF] mb-2">Añadir Nuevo Registro</h6>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2 items-center">
                                      <DatePicker value={newSegFecha} onChange={setNewSegFecha} placeholder="Fecha del seguimiento" />
                                      <input type="file" accept="image/*" onChange={e => setNewSegFoto(e.target.files?.[0] || null)} className="text-xs" />
                                    </div>
                                    <textarea value={newSegComentario} onChange={e => setNewSegComentario(e.target.value)} required placeholder="Comentario..." rows={2} className="w-full text-xs px-2 py-1.5 rounded-md border border-gray-200 outline-none focus:border-[#0B84FF] mb-2 resize-none" />
                                    <button type="submit" className="px-3 py-1.5 bg-[#0B84FF] text-white text-xs font-bold rounded-md hover:bg-blue-600 transition">Guardar</button>
                                  </form>
                                </div>
                              )}
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
                            <div key={idx} 
                                 onClick={() => { if (msg.adopcionId) setSelectedAdopcionId(msg.adopcionId); }}
                                 className={`flex items-start gap-4 p-4 rounded-2xl bg-white/50 border border-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] ${msg.adopcionId ? 'cursor-pointer hover:bg-white transition' : ''}`}>
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
              </div>
            </BlurFade>
          )}

          {/* Personal Information Form */}
          <BlurFade delay={0.4} inView>
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sm:p-10">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Información personal</h3>

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
                  <label className="block text-gray-600 text-sm font-semibold mb-2">Teléfono de contacto</label>
                  <input type="tel" value={telefono} onChange={e => setTelefono(e.target.value)} required placeholder="Ej. +57 300 123 4567" className="w-full px-4 py-3 rounded-2xl bg-gray-50/50 border border-gray-200 focus:bg-white focus:border-[#0B84FF] focus:ring-4 focus:ring-[#0B84FF]/10 outline-none transition-all" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-gray-600 text-sm font-semibold mb-2">Sobre mí (bio)</label>
                  <textarea rows={4} value={bio} onChange={e => setBio(e.target.value)} placeholder="Cuéntanos un poco sobre ti..." className="w-full px-4 py-3 rounded-2xl bg-gray-50/50 border border-gray-200 focus:bg-white focus:border-[#0B84FF] focus:ring-4 focus:ring-[#0B84FF]/10 outline-none transition-all text-gray-700 resize-none" />
                </div>

                {/* CP-HU-07: Badges de rol, fecha de registro y antigüedad debajo de Sobre mí */}
                <div className="md:col-span-2 flex flex-wrap items-center gap-2 pt-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#0B84FF] border border-blue-100/80 text-xs font-bold shadow-2xs">
                    <UserCheck className="w-3.5 h-3.5" />
                    {user.rol === 'ADMIN' ? 'Administrador' : user.rol === 'REFUGIO' ? 'Refugio verificado' : 'Adoptante'}
                  </span>

                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 text-gray-700 border border-gray-200 text-xs font-medium shadow-2xs">
                    <Calendar className="w-3.5 h-3.5 text-gray-500" />
                    Miembro desde {getAntiguedad(user.creadoEn).fechaStr}
                  </span>

                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100/80 text-xs font-semibold shadow-2xs">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    {getAntiguedad(user.creadoEn).tiempoStr}
                  </span>
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
              <form onSubmit={handleChangePassword} className="space-y-5">
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
                    <label className="block text-gray-600 text-sm font-semibold mb-2">Confirmar nueva contraseña</label>
                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full px-4 py-3 rounded-2xl bg-gray-50/50 border border-gray-200 focus:bg-white focus:border-gray-400 focus:ring-4 focus:ring-gray-100 outline-none transition-all" />
                  </div>
                </div>
                <div className="pt-4">
                  <button type="submit" className="bg-gray-800 text-white px-8 py-3 rounded-full text-sm font-semibold hover:bg-gray-900 active:scale-95 transition-all shadow-md">Actualizar contraseña</button>
                </div>
              </form>
            </div>
          </BlurFade>
        </div>
      </main>
      {/* MODAL DE IMAGEN AMPLIADA */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] p-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center">
            <img
              src={previewImage}
              alt="Vista ampliada"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl"
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 bg-black/60 text-white rounded-full p-2.5 hover:bg-black transition-colors shadow-lg"
              title="Cerrar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* BURBUJA FLOTANTE LIQUID GLASS (PORTAL) */}
      {createPortal(
        <AnimatePresence>
          {activePetBubble && (
            <>
              {/* Capa invisible para cerrar al hacer clic afuera */}
              <div 
                className="fixed inset-0 z-[9998] bg-transparent" 
                onClick={() => setActivePetBubble(null)} 
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.85, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 4 }}
                transition={{ 
                  type: "spring",
                  stiffness: 420,
                  damping: 24,
                  mass: 0.75
                }}
                style={{
                  position: 'fixed',
                  top: activePetBubble.y,
                  left: activePetBubble.x,
                  backdropFilter: `blur(${GLASS_CONFIG.blurLevel}) saturate(${GLASS_CONFIG.saturate})`,
                  WebkitBackdropFilter: `blur(${GLASS_CONFIG.blurLevel}) saturate(${GLASS_CONFIG.saturate})`,
                  background: `linear-gradient(135deg, rgba(255, 255, 255, ${GLASS_CONFIG.opacityMax}) 0%, rgba(255, 255, 255, ${GLASS_CONFIG.opacityMin}) 100%)`,
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.22), 0 0 25px rgba(255, 255, 255, 0.5), inset 0 1px 2px rgba(255, 255, 255, 1)'
                }}
                className="w-64 border border-white/80 rounded-2xl p-2.5 z-[9999] pointer-events-auto space-y-1.5 overflow-hidden"
              >
                <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none" />
                <div 
                  style={{
                    backdropFilter: `blur(${GLASS_CONFIG.innerBlurLevel})`,
                    WebkitBackdropFilter: `blur(${GLASS_CONFIG.innerBlurLevel})`,
                    background: 'rgba(255, 255, 255, 0.4)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 1px rgba(255, 255, 255, 0.9)'
                  }}
                  className="flex items-center justify-between py-2 px-3 rounded-xl border border-white/70 text-xs"
                >
                  <span className="text-gray-600 font-medium">Especie / Tipo</span>
                  <span className="font-bold text-gray-950 capitalize">{activePetBubble.tipo}</span>
                </div>
                <div 
                  style={{
                    backdropFilter: `blur(${GLASS_CONFIG.innerBlurLevel})`,
                    WebkitBackdropFilter: `blur(${GLASS_CONFIG.innerBlurLevel})`,
                    background: 'rgba(255, 255, 255, 0.4)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 1px rgba(255, 255, 255, 0.9)'
                  }}
                  className="flex items-center justify-between py-2 px-3 rounded-xl border border-white/70 text-xs"
                >
                  <span className="text-gray-600 font-medium">Raza</span>
                  <span className="font-bold text-gray-950">{activePetBubble.raza}</span>
                </div>
                {activePetBubble.refugio && (
                  <div 
                    style={{
                      backdropFilter: `blur(${GLASS_CONFIG.innerBlurLevel})`,
                      WebkitBackdropFilter: `blur(${GLASS_CONFIG.innerBlurLevel})`,
                      background: 'rgba(255, 255, 255, 0.4)',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 1px rgba(255, 255, 255, 0.9)'
                    }}
                    className="flex items-center justify-between py-2 px-3 rounded-xl border border-white/70 text-xs"
                  >
                    <span className="text-gray-600 font-medium">Refugio</span>
                    <span className="font-bold text-gray-950 truncate max-w-[120px]">{activePetBubble.refugio}</span>
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
