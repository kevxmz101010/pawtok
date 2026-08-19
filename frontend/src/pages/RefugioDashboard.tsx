import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useConfirm } from '../context/ConfirmContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import FullscreenToast from '../components/FullscreenToast';
import { BlurFade } from '../components/ui/blur-fade';
import { PetStatusToggle } from '../components/ui/pet-status-toggle';
import { Plus, Eye, Trash2, Calendar, Phone, PawPrint, Clock, User, Check, X, Edit3, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * 🎛️ CONFIGURACIÓN DE LA BURBUJA LIQUID GLASS
 * Puedes cambiar estos valores para ajustar el nivel de blur, brillo y sensibilidad de giro:
 */
const GLASS_CONFIG = {
  blurLevel: '30px',        // 👈 Desenfoque del fondo (ej: '15px', '30px', '50px')
  innerBlurLevel: '16px',   // 👈 Desenfoque de las fichas internas
  saturate: '200%',         // 👈 Saturación de los colores detrás (ej: '150%', '200%', '250%')
  opacityMax: 0.45,         // 👈 Opacidad superior del cristal (0.1 a 0.9)
  opacityMin: 0.20,         // 👈 Opacidad inferior del cristal
  wheelSensitivity: 80,     // 👈 Cantidad de giro de rueda para cerrar intencionalmente
};

/**
 * Ícono animado de papelera cuya tapa se levanta al pasar el mouse por encima
 */
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

/**
 * Ícono animado de ojo con mirada curiosa, parpadeo tierno y brillo que reacciona en hover
 */
const AnimatedEyeIcon = ({ className = "w-4 h-4" }: { className?: string }) => {
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
      {/* Contorno del ojo */}
      <path 
        d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" 
        className="transition-transform duration-300 ease-out group-hover:scale-y-90 origin-center"
      />
      {/* Pupila e iris animados con mirada y brillo */}
      <g className="transition-all duration-300 ease-out group-hover:translate-x-1 group-hover:-translate-y-0.5 origin-center">
        <circle cx="12" cy="12" r="3.5" className="stroke-current fill-white/20 transition-all duration-300 group-hover:fill-white/35" />
        <circle cx="12" cy="12" r="1.8" className="fill-current" />
        {/* Destello de brillo tierno */}
        <circle cx="13.2" cy="10.8" r="0.7" className="fill-white stroke-none" />
      </g>
    </svg>
  );
};

/**
 * Ícono animado de lápiz que se inclina y raya rápidamente al hacer hover
 */
const AnimatedPencilIcon = ({ className = "w-4 h-4" }: { className?: string }) => {
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
      {/* Cuerpo del lápiz con animación continua de rayado */}
      <g className="origin-[3px_21px] transition-transform duration-200 group-hover:animate-scribble">
        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
        <path d="m15 5 4 4" />
      </g>
      {/* Trazo que se dibuja en la punta */}
      <path 
        d="M2 22h5" 
        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 stroke-current stroke-[2.5]" 
      />
    </svg>
  );
};

/**
 * Dashboard del Refugio (RefugioDashboard.tsx)
 * Este es el Panel de Control para las fundaciones y refugios.
 * Desde aquí pueden ver estadísticas, aceptar solicitudes de adopción, chatear con adoptantes,
 * y gestionar las mascotas que tienen publicadas.
 */
export default function RefugioDashboard() {
  const confirm = useConfirm();
  const { user, isAuthenticated, isLoading: authLoading, logout, checkAuth, setUser } = useAuth();
  const navigate = useNavigate();

  // Control de Acceso Estricto por Rol (Solo REFUGIO y ADMIN)
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        navigate('/login', { replace: true });
      } else if (user?.rol !== 'REFUGIO' && user?.rol !== 'ADMIN') {
        navigate('/mascotas', { replace: true });
      }
    }
  }, [authLoading, isAuthenticated, user, navigate]);

  const [nombre, setNombre] = useState(user?.nombre || '');
  const [email, setEmail] = useState(user?.email || '');

  useEffect(() => {
    if (user) {
      setNombre(user.nombre || '');
      setEmail(user.email || '');
    }
  }, [user]);
  const [foto, setFoto] = useState<File | null>(null);

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

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [toastMsg, setToastMsg] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const [publicaciones, setPublicaciones] = useState<any[]>([]);
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [selectedSolicitud, setSelectedSolicitud] = useState<any>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [citas, setCitas] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [activePetBubble, setActivePetBubble] = useState<{
    id: string;
    tipo: string;
    raza: string;
    isCita?: boolean;
    x: number;
    y: number;
  } | null>(null);
  const lastBubbleOpenRef = React.useRef<number>(0);
  const [hasScrolled, setHasScrolled] = useState(false);

  const openPetBubble = (data: { id: string; tipo: string; raza: string; isCita?: boolean; x: number; y: number }) => {
    lastBubbleOpenRef.current = Date.now();
    setActivePetBubble(data);
  };

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
    let accumulatedWheel = 0;
    let wheelTimer: any;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedSolicitud(null);
        setActivePetBubble(null);
        setPreviewImage(null);
      }
    };

    // Detecta giro real de la rueda del ratón
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY > 4 || window.scrollY > 8) {
        setHasScrolled(true);
      }

      // Ignorar micro-giros durante los primeros 250ms de apertura
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
      if (window.scrollY > 8) {
        setHasScrolled(true);
      }
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

  /**
   * Carga inicial de datos: Trae las mascotas publicadas por este refugio y las solicitudes pendientes.
   */
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
        
        try {
          const allCitas = [];
          for (const m of currentMascotas) {
            const resCita = await fetch(`/api/citas/mascota/${m.id}`, { credentials: 'include' });
            if (resCita.ok) {
              const data = await resCita.json();
              allCitas.push(...data.map((c: any) => ({ ...c, mascotaNombre: m.nombre })));
            }
          }
          setCitas(allCitas);
        } catch (err) { console.error('Error fetching citas', err); }

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

  // Seguimiento state for approved adoptions
  const [seguimientoList, setSeguimientoList] = useState<any[]>([]);

  useEffect(() => {
    if (selectedSolicitud) {
      fetchMensajes(selectedSolicitud.id);
      fetchSeguimiento(selectedSolicitud.id);
    } else {
      setMensajes([]);
      setSeguimientoList([]);
    }
  }, [selectedSolicitud]);

  const fetchSeguimiento = async (adopcionId: number) => {
    try {
      const res = await fetch(`/api/adopciones/${adopcionId}/seguimiento`, { credentials: 'include' });
      if (res.ok) {
        setSeguimientoList(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

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

  /**
   * Lógica del Chat: Enviar un mensaje (texto o archivo) a un adoptante específico.
   */
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

  /**
   * Aprueba o Rechaza una solicitud de adopción.
   */
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
        const errorData = await res.json().catch(() => null);
        const errMsg = (errorData?.message && errorData.message !== 'Ha ocurrido un error inesperado') 
          ? errorData.message 
          : 'No se puede eliminar la mascota porque tiene un proceso de adopción aprobado o en seguimiento activo';
        showToast(errMsg, 'error');
      }
    } catch (err) {
      showToast('Error de conexión', 'error');
    }
  };

  const handleChangeStatus = async (id: number, targetStatus: string) => {
    // Actualización optimista instantánea sin alertas
    setPublicaciones(prev => prev.map(m => m.id === id ? { ...m, estado: targetStatus } : m));
    try {
      const res = await fetch(`/api/mascotas/${id}/estado?estado=${targetStatus}`, {
        method: 'PUT',
        credentials: 'include',
      });
      if (res.ok) {
        fetchStats();
      }
    } catch (err) {
      console.error('Error al actualizar estado:', err);
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
        method: 'POST',
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

  if (authLoading || !isAuthenticated || !user) {
    return null;
  }

  if (user.rol !== 'REFUGIO' && user.rol !== 'ADMIN' && user.rol !== 'PENDIENTE_REFUGIO') {
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
          <BlurFade delay={0.05} inView={false}>
            <div className="flex flex-col items-center text-center mb-10">
              <div className="relative w-32 h-32 mb-4 group">
                <img src={getProfileImage()} alt="Perfil" className="w-full h-full rounded-full object-cover border-4 border-white shadow-xl" />
                <label className="absolute bottom-0 right-0 bg-[#ffffff4b] backdrop-blur-md hover:bg-white/50 p-2.5 rounded-full text-white shadow-xl border-2 border-white cursor-pointer transition-transform hover:scale-105 active:scale-95">
                  <input type="file" accept="image/*" onChange={handleFotoChange} className="hidden" />
                  <svg className="w-5 h-5 drop-shadow-md text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                </label>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{user.nombre || 'Mi Refugio'}</h1>
              <p className="text-gray-500 font-medium mt-1">{user.email}</p>
              <span className="inline-flex items-center gap-1 mt-2.5 px-3 py-1 rounded-full bg-blue-100/0 text-[#94a6b8] text-sm font-semibold">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M3 10l9-7 9 7v9a2 2 0 01-2 2h-4v-6H9v6H5a2 2 0 01-2-2v-9z"/></svg>
                Cuenta de Refugio
              </span>
            </div>
          </BlurFade>

          <div className="space-y-8">
            
            {/* Action Buttons Top */}
            <BlurFade delay={0.12} inView={false}>
              <div className="flex justify-center items-center">
                <div className="relative group inline-flex items-center justify-center">
                  {/* Aura brillante inferior animada estilo Rainbow */}
                  <div className="absolute -bottom-2 left-1/2 h-4 w-3/4 -translate-x-1/2 animate-rainbow bg-[linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))] bg-[length:200%] blur-md opacity-70 group-hover:opacity-100 transition-opacity" />

                  <Link
                    to="/dashboard/add-pet"
                    className="relative z-10 inline-flex h-12 animate-rainbow cursor-pointer items-center justify-center gap-2.5 rounded-full bg-[linear-gradient(#121213,#121213),linear-gradient(#121213_50%,rgba(18,18,19,0.6)_80%,rgba(18,18,19,0)),linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))] bg-[length:200%] px-7 py-2.5 text-sm font-semibold text-white transition-all duration-300 [background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.08*1rem)_solid_transparent] hover:scale-[1.03] active:scale-95 shadow-2xl overflow-hidden"
                  >
                    {/* Haz de luz que recorre el botón al pasar el cursor */}
                    <div className="absolute -inset-full top-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/35 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-[350%] transition-transform duration-1000 ease-in-out pointer-events-none" />

                    {/* Icono Plus con cápsula translúcida y rotación suave */}
                    <span className="w-6 h-6 rounded-full bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center text-white transition-transform duration-300 group-hover:rotate-90 group-hover:bg-white group-hover:text-black shadow-inner">
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    </span>

                    <span className="relative z-10 font-bold tracking-tight">Nueva Mascota</span>
                  </Link>
                </div>
              </div>
            </BlurFade>

            {/* ESTADÍSTICAS */}
            <BlurFade delay={0.18} inView={false}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div onClick={() => setFilterBy('TODOS')} className="cursor-pointer hover:scale-[1.02] transition-transform bg-blue-100/50 backdrop-blur-xl border border-white/60 p-6 rounded-3xl shadow-[0px_15px_35px_-10px_rgba(0,0,0,0.05),inset_0px_0px_15px_rgba(255,255,255,1)] flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/70 shadow-sm border border-white text-[#0B84FF] flex items-center justify-center">
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm font-semibold">En Adopción</p>
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

            {/* SOLICITUDES ENTRANTES (Aparece únicamente cuando el usuario empieza a bajar/scrollear) */}
            <motion.div
              initial={{ opacity: 0, y: 35, filter: "blur(10px)" }}
              animate={hasScrolled ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 35, filter: "blur(10px)" }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="bg-gray-100/30 backdrop-blur-xl border border-white/60 rounded-3xl shadow-[0px_15px_35px_-10px_rgba(0,0,0,0.05),inset_0px_0px_15px_rgba(255,255,255,1)] relative">
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
                  <div className="p-2 overflow-x-auto md:overflow-visible">
                    <table className="w-full text-left border-separate border-spacing-y-2">
                      <thead className="text-gray-500 text-xs px-4">
                        <tr>
                          <th className="px-6 py-3 font-semibold">Adoptante</th>
                          <th className="px-6 py-3 font-semibold">Mascota</th>
                          <th className="px-6 py-3 font-semibold text-center">Estado</th>
                          <th className="px-6 py-3 font-semibold text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredSolicitudes.map((sol: any) => (
                          <tr key={sol.id} className="bg-white/40 hover:bg-white/70 transition rounded-2xl shadow-sm relative">
                            <td className="px-6 py-4 rounded-l-2xl">
                              <span className="font-bold text-gray-900 block">{sol.usuarioNombre}</span>
                              <span className="text-xs text-gray-500">{sol.telefono}</span>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  if (activePetBubble?.id === `sol-${sol.id}`) {
                                    setActivePetBubble(null);
                                  } else {
                                    openPetBubble({
                                      id: `sol-${sol.id}`,
                                      tipo: sol.mascotaTipo?.toLowerCase() || 'mascota',
                                      raza: sol.mascotaRaza || 'Mestizo / Común',
                                      x: rect.left,
                                      y: rect.bottom + 8
                                    });
                                  }
                                }}
                                className="group inline-flex items-center gap-1.5 font-bold text-gray-900 hover:text-[#0B84FF] transition-colors cursor-pointer text-sm"
                                title="Clic para ver detalles de la mascota"
                              >
                                <span>{sol.mascotaNombre}</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-[#0B84FF] transition-colors" />
                              </button>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-bold ${sol.estado === 'APROBADA' ? 'bg-green-50 text-green-600 border-green-200' : sol.estado === 'RECHAZADA' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-yellow-50 text-yellow-600 border-yellow-200'}`}>
                                <span className={`w-2 h-2 rounded-full ${sol.estado === 'APROBADA' ? 'bg-green-500' : sol.estado === 'RECHAZADA' ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'}`}></span>
                                {sol.estado === 'PENDIENTE' ? 'Pendiente' : sol.estado}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right rounded-r-2xl">
                              <div className="flex items-center justify-end gap-2.5">
                                <button 
                                  onClick={() => setSelectedSolicitud(sol)} 
                                  className="group flex items-center justify-center w-8.5 h-8.5 rounded-full bg-[#0B84FF] hover:bg-blue-600 text-white shadow-xs hover:shadow-md hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
                                  title="Revisar solicitud"
                                >
                                  <AnimatedEyeIcon className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => deleteAdopcion(sol.id)} 
                                  className="group flex items-center justify-center w-8.5 h-8.5 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-xs hover:shadow-md hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer" 
                                  title="Eliminar del historial"
                                >
                                  <AnimatedTrashIcon className="w-4 h-4" />
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
            </motion.div>

            {/* CITAS PROGRAMADAS */}
            <BlurFade delay={0.05} inView={true}>
              <div className="bg-gray-100/30 backdrop-blur-xl border border-white/60 rounded-3xl shadow-[0px_15px_35px_-10px_rgba(0,0,0,0.05),inset_0px_0px_15px_rgba(255,255,255,1)] relative mt-6 mb-6">
                <div className="p-6 border-b border-white/50 flex items-center justify-between">
                  <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z"/></svg>
                    </span>
                    Citas Programadas
                  </h3>
                  <span className="text-sm bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full font-bold">{citas.length} Citas</span>
                </div>
                
                {citas.length > 0 ? (
                  <div className="p-2 overflow-x-auto md:overflow-visible">
                    <table className="w-full text-left border-separate border-spacing-y-2">
                      <thead className="text-gray-500 text-xs px-4">
                        <tr>
                          <th className="px-6 py-3 font-semibold">Fecha y Hora</th>
                          <th className="px-6 py-3 font-semibold">Solicitante</th>
                          <th className="px-6 py-3 font-semibold">Mascota</th>
                          <th className="px-6 py-3 font-semibold text-center">Estado</th>
                          <th className="px-6 py-3 font-semibold text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {citas.map((cita: any) => (
                          <tr key={cita.id} className="bg-white/40 hover:bg-white/70 transition rounded-2xl shadow-sm relative">
                            <td className="px-6 py-4 rounded-l-2xl font-medium text-gray-900">
                              {cita.fecha} a las {cita.hora}
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-bold text-gray-900 block">{cita.nombreSolicitante}</span>
                              <span className="text-xs text-gray-500">{cita.telefono}</span>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  if (activePetBubble?.id === `cita-${cita.id}`) {
                                    setActivePetBubble(null);
                                  } else {
                                    openPetBubble({
                                      id: `cita-${cita.id}`,
                                      tipo: `${cita.fecha} • ${cita.hora}`,
                                      raza: cita.tipoVivienda || 'Vivienda estándar',
                                      isCita: true,
                                      x: rect.left,
                                      y: rect.bottom + 8
                                    });
                                  }
                                }}
                                className="group inline-flex items-center gap-1.5 font-bold text-gray-900 hover:text-[#0B84FF] transition-colors cursor-pointer text-sm"
                                title="Clic para ver detalles de la mascota"
                              >
                                <span>{cita.mascotaNombre}</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-[#0B84FF] transition-colors" />
                              </button>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`inline-flex py-1 px-3 rounded-full text-xs font-bold ${cita.estado === 'aprobada' ? 'bg-green-50 text-green-600' : cita.estado === 'rechazada' ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-600'}`}>
                                {cita.estado}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right rounded-r-2xl">
                              <div className="flex justify-end gap-2">
                                {cita.estado === 'pendiente' && (
                                  <>
                                    <button onClick={async () => {
                                      const res = await fetch(`/api/citas/${cita.id}/estado?estado=aprobada`, { method: 'PUT', credentials: 'include' });
                                      if (res.ok) setCitas(citas.map(c => c.id === cita.id ? {...c, estado: 'aprobada'} : c));
                                    }} className="px-3 py-1.5 rounded-lg bg-green-50 text-green-600 text-xs font-bold hover:bg-green-100 transition">Aprobar</button>
                                    <button onClick={async () => {
                                      const res = await fetch(`/api/citas/${cita.id}/estado?estado=rechazada`, { method: 'PUT', credentials: 'include' });
                                      if (res.ok) setCitas(citas.map(c => c.id === cita.id ? {...c, estado: 'rechazada'} : c));
                                    }} className="px-3 py-1.5 rounded-lg bg-red-50 text-red-500 text-xs font-bold hover:bg-red-100 transition">Rechazar</button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500 text-sm">No hay citas programadas.</div>
                )}
              </div>
            </BlurFade>

            {/* TABLA DE PUBLICACIONES */}
            <BlurFade delay={0.05} inView={true}>
              <div className="bg-gray-100/30 backdrop-blur-xl border border-white/60 rounded-3xl shadow-[0px_15px_35px_-10px_rgba(0,0,0,0.05),inset_0px_0px_15px_rgba(255,255,255,1)] overflow-hidden">
                <div className="p-6 border-b border-white/50 flex items-center justify-between">
                  <h3 className="font-bold text-xl text-gray-900">Mis Publicaciones</h3>
                  <span className="text-sm bg-gray-200/50 text-gray-600 px-3 py-1.5 rounded-full font-semibold">{publicaciones.length} Mascotas</span>
                </div>
                
                {publicaciones.length > 0 ? (
                  <>
                    <div className="overflow-x-auto p-4 border-b border-gray-100">
                      <table className="w-full text-left border-separate border-spacing-y-2">
                        <thead className="text-gray-500 text-xs px-4">
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
                                <PetStatusToggle
                                  status={pet.estado}
                                  onChangeStatus={(newStatus) => handleChangeStatus(pet.id, newStatus)}
                                />
                              </td>

                              <td className="px-6 py-4 text-right rounded-r-2xl">
                                <div className="flex items-center justify-end gap-2">
                                  <Link 
                                    to={`/dashboard/edit-pet/${pet.id}`} 
                                    className="group flex items-center justify-center w-8 h-8 rounded-full bg-amber-500 hover:bg-amber-600 text-white shadow-xs hover:shadow-md hover:scale-110 active:scale-95 transition-all duration-200"
                                    title="Editar publicación"
                                  >
                                    <AnimatedPencilIcon className="w-3.5 h-3.5" />
                                  </Link>
                                  <button 
                                    onClick={() => handleDeleteMascota(pet.id)} 
                                    className="group flex items-center justify-center w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-xs hover:shadow-md hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
                                    title="Eliminar publicación"
                                  >
                                    <AnimatedTrashIcon className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Pagination Controls with Fish-eye Circular Numbers */}
                    {totalPages > 1 && (
                      <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/40 backdrop-blur-md rounded-b-3xl border-t border-white/60">
                        <span className="text-xs sm:text-sm text-gray-600 font-semibold">
                          Página <strong className="text-gray-900">{page + 1}</strong> de {totalPages} ({totalMascotas} mascotas)
                        </span>

                        <div className="flex items-center gap-1.5">
                          {/* Botón Anterior */}
                          <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.92 }}
                            type="button"
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0}
                            className="px-3 py-1.5 rounded-full text-xs font-bold bg-white/90 border border-gray-200 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-50 hover:text-[#0c8aff] hover:border-blue-200 transition shadow-2xs flex items-center gap-1 cursor-pointer"
                            title="Página anterior"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Anterior</span>
                          </motion.button>

                          {/* Numeración Circular Dinámica (Efecto Ojo de Pez / Fish-eye) */}
                          <div className="flex items-center gap-1.5 px-1">
                            {(() => {
                              const maxButtons = 7;
                              let startPage = Math.max(0, page - 3);
                              let endPage = Math.min(totalPages - 1, page + 3);

                              if (endPage - startPage + 1 < maxButtons) {
                                if (startPage === 0) {
                                  endPage = Math.min(totalPages - 1, startPage + maxButtons - 1);
                                } else if (endPage === totalPages - 1) {
                                  startPage = Math.max(0, endPage - maxButtons + 1);
                                }
                              }

                              const pagesArray = [];
                              for (let i = startPage; i <= endPage; i++) {
                                pagesArray.push(i);
                              }

                              return pagesArray.map((pIndex) => {
                                const isCurrent = pIndex === page;
                                const distance = Math.abs(pIndex - page);

                                // Escala y opacidad calculadas exactamente según distancia
                                const scale = isCurrent ? 1.15 : distance === 1 ? 0.94 : distance === 2 ? 0.80 : 0.66;
                                const opacity = isCurrent ? 1 : distance === 1 ? 0.88 : distance === 2 ? 0.65 : 0.40;

                                return (
                                  <motion.button
                                    key={`page-num-${pIndex}`}
                                    type="button"
                                    onClick={() => setPage(pIndex)}
                                    initial={{ scale, opacity }}
                                    animate={{ scale, opacity }}
                                    whileHover={{ scale: isCurrent ? 1.18 : scale * 1.15, opacity: 1 }}
                                    whileTap={{ scale: 0.88 }}
                                    transition={{
                                      type: 'spring',
                                      stiffness: 480,
                                      damping: 26,
                                      mass: 0.7
                                    }}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-colors cursor-pointer shrink-0 ${
                                      isCurrent
                                        ? 'bg-white text-gray-900 border-2 border-gray-400 shadow-[0_4px_14px_rgba(0,0,0,0.1)] font-extrabold z-10'
                                        : 'bg-white/80 text-gray-500 hover:bg-white hover:text-gray-900 border border-gray-200/90 font-bold shadow-2xs'
                                    }`}
                                    title={`Página ${pIndex + 1}`}
                                  >
                                    {pIndex + 1}
                                  </motion.button>
                                );
                              });
                            })()}
                          </div>

                          {/* Botón Siguiente */}
                          <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.92 }}
                            type="button"
                            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={page >= totalPages - 1}
                            className="px-3 py-1.5 rounded-full text-xs font-bold bg-white/90 border border-gray-200 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-50 hover:text-[#0B84FF] hover:border-blue-200 transition shadow-2xs flex items-center gap-1 cursor-pointer"
                            title="Página siguiente"
                          >
                            <span className="hidden sm:inline">Siguiente</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </motion.button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                <div className="p-12 text-center bg-white/20">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                  </div>
                  <div className="relative group inline-flex items-center justify-center">
                    <div className="absolute -bottom-2 left-1/2 h-4 w-3/4 -translate-x-1/2 animate-rainbow bg-[linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))] bg-[length:200%] blur-md opacity-70 group-hover:opacity-100 transition-opacity" />
                    <Link
                      to="/dashboard/add-pet"
                      className="relative z-10 inline-flex h-12 animate-rainbow cursor-pointer items-center justify-center gap-2.5 rounded-full bg-[linear-gradient(#121213,#121213),linear-gradient(#121213_50%,rgba(18,18,19,0.6)_80%,rgba(18,18,19,0)),linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))] bg-[length:200%] px-7 py-2.5 text-sm font-semibold text-white transition-all duration-300 [background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.08*1rem)_solid_transparent] hover:scale-[1.03] active:scale-95 shadow-2xl overflow-hidden"
                    >
                      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                      <div className="absolute -inset-full top-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/35 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-[350%] transition-transform duration-1000 ease-in-out pointer-events-none" />
                      <span className="w-6 h-6 rounded-full bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center text-white transition-transform duration-300 group-hover:rotate-90 group-hover:bg-white group-hover:text-black shadow-inner">
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      </span>
                      <span className="relative z-10 font-bold tracking-tight">Publicar primera mascota</span>
                    </Link>
                  </div>
                </div>
              )}
              </div>
            </BlurFade>

            {/* CONFIGURACIÓN */}
            <BlurFade delay={0.05} inView={true}>
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
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={() => setSelectedSolicitud(null)}
        >
          <div 
            className="bg-white rounded-[2rem] w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh] relative animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Solicitud de Adopción</h3>
                <p className="text-sm text-gray-500 font-medium">{selectedSolicitud.mascotaNombre} - {selectedSolicitud.usuarioNombre}</p>
              </div>
              <button 
                onClick={() => setSelectedSolicitud(null)} 
                className="text-gray-400 hover:text-gray-700 transition-colors bg-white hover:bg-gray-100 rounded-full p-2.5 shadow-sm border border-gray-100 cursor-pointer"
                title="Cerrar modal (Esc)"
              >
                <X className="w-5 h-5" />
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

              {/* REPORTES DE SEGUIMIENTO POST-ADOPCIÓN */}
              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                    Reportes de Seguimiento Post-Adopción
                  </span>
                  <span className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-bold">
                    {seguimientoList.length} Reportes
                  </span>
                </h4>
                {seguimientoList.length > 0 ? (
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                    {seguimientoList.map((seg, sIdx) => (
                      <div key={sIdx} className="p-3 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col gap-2">
                        <div className="flex justify-between items-center text-xs text-gray-500 font-semibold">
                          <span>📅 {new Date(seg.fecha).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-gray-700">{seg.comentario}</p>
                        {(seg.fotoOpcional || seg.foto_opcional) && (
                          <img
                            src={
                              (seg.fotoOpcional || seg.foto_opcional).startsWith('http')
                                ? (seg.fotoOpcional || seg.foto_opcional)
                                : (seg.fotoOpcional || seg.foto_opcional).startsWith('/')
                                ? `http://localhost:8080${seg.fotoOpcional || seg.foto_opcional}`
                                : `http://localhost:8080/uploads/${seg.fotoOpcional || seg.foto_opcional}`
                            }
                            alt="Foto de seguimiento"
                            onClick={() => setPreviewImage(
                              (seg.fotoOpcional || seg.foto_opcional).startsWith('http')
                                ? (seg.fotoOpcional || seg.foto_opcional)
                                : (seg.fotoOpcional || seg.foto_opcional).startsWith('/')
                                ? `http://localhost:8080${seg.fotoOpcional || seg.foto_opcional}`
                                : `http://localhost:8080/uploads/${seg.fotoOpcional || seg.foto_opcional}`
                            )}
                            className="w-full max-h-48 object-cover rounded-xl mt-1 shadow-sm cursor-pointer hover:opacity-90 transition hover:scale-[1.01]"
                            title="Haz clic para agrandar la foto"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center bg-gray-50 rounded-2xl text-xs text-gray-400 font-medium">
                    El adoptante aún no ha subido reportes de seguimiento.
                  </div>
                )}
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
            
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <button 
                onClick={() => setSelectedSolicitud(null)} 
                className="px-5 py-2 rounded-full bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 font-bold transition-colors text-sm cursor-pointer shadow-xs"
              >
                Cerrar
              </button>
              <div className="flex gap-2">
                {selectedSolicitud.estado !== 'RECHAZADA' && (
                  <button onClick={() => handleResolveAdopcion(selectedSolicitud.id, 'RECHAZADA')} className="px-5 py-2 rounded-full text-red-600 font-bold hover:bg-red-50 transition-colors text-sm cursor-pointer">Rechazar</button>
                )}
                {selectedSolicitud.estado !== 'APROBADA' && (
                  <button onClick={() => handleResolveAdopcion(selectedSolicitud.id, 'APROBADA')} className="px-5 py-2 rounded-full bg-[#0B84FF] hover:bg-blue-600 text-white font-bold transition-colors shadow-md text-sm cursor-pointer">Aprobar Adopción</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* PORTAL DE BURBUJA FLOTANTE LIQUID GLASS */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {activePetBubble && (
            <>
              <div 
                className="fixed inset-0 z-[9998]" 
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
                  <span className="text-gray-600 font-medium">{activePetBubble.isCita ? 'Fecha y hora' : 'Especie / Tipo'}</span>
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
                  <span className="text-gray-600 font-medium">{activePetBubble.isCita ? 'Vivienda' : 'Raza'}</span>
                  <span className="font-bold text-gray-950">{activePetBubble.raza}</span>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
