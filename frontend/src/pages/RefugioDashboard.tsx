import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useConfirm } from '../context/ConfirmContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Header from '../components/Header';
import { BlurFade } from '../components/ui/blur-fade';
import { PetStatusToggle } from '../components/ui/pet-status-toggle';
import { Plus, Eye, EyeOff, Trash2, Calendar, Phone, PawPrint, Clock, Hourglass, User, Check, X, Edit3, Sparkles, ChevronLeft, ChevronRight, Building2, MapPin, Mail, FileText, AlertTriangle, AlertCircle, ExternalLink, ShieldCheck, Camera, LogOut, ArrowRight, CheckCircle2, Instagram, Facebook, Globe, Lock } from 'lucide-react';
import { DatePicker } from '../components/ui/date-picker';
import { HeadlessListbox } from '../components/ui/headless-listbox';
import { formatPetImageUrl } from '../utils/imageUtils';

function TikTokIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3 15.25a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.05a8.27 8.27 0 0 0 4.91 1.6V7.2a4.83 4.83 0 0 1-1-.51z" />
    </svg>
  );
}

const DIAS_SEMANA = [
  { id: 'Lun', label: 'Lunes', short: 'Lun' },
  { id: 'Mar', label: 'Martes', short: 'Mar' },
  { id: 'Mié', label: 'Miércoles', short: 'Mié' },
  { id: 'Jue', label: 'Jueves', short: 'Jue' },
  { id: 'Vie', label: 'Viernes', short: 'Vie' },
  { id: 'Sáb', label: 'Sábado', short: 'Sáb' },
  { id: 'Dom', label: 'Domingo', short: 'Dom' },
];

function formatHora12(h: string): string {
  if (!h) return '';
  const [hhStr, mmStr] = h.split(':');
  const hh = parseInt(hhStr, 10);
  const mm = parseInt(mmStr, 10);
  const ampm = hh >= 12 ? 'PM' : 'AM';
  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${h12}:${mm < 10 ? '0' + mm : mm} ${ampm}`;
}

function calcularHorarioString(dias: string[], apertura: string, cierre: string, manual: string, esManual: boolean): string {
  if (esManual) return manual.trim();
  if (!dias || dias.length === 0) return 'Cerrado temporalmente';

  const rangoHoras = `${formatHora12(apertura)} - ${formatHora12(cierre)}`;
  const todosLosDias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const laborables = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'];

  const tieneTodos = todosLosDias.every(d => dias.includes(d));
  if (tieneTodos) {
    return `Todos los días: ${rangoHoras}`;
  }

  const tieneLaborables = laborables.every(d => dias.includes(d));
  const tieneSab = dias.includes('Sáb');
  const tieneDom = dias.includes('Dom');

  if (tieneLaborables && tieneSab && !tieneDom) {
    return `Lun a Sáb: ${rangoHoras} (Dom: Cerrado)`;
  }
  if (tieneLaborables && !tieneSab && !tieneDom) {
    return `Lun a Vie: ${rangoHoras} (Sáb y Dom: Cerrado)`;
  }

  return `${dias.join(', ')}: ${rangoHoras}`;
}

function formatRedesString(socials: { instagram: string; tiktok: string; facebook: string }): string {
  const parts: string[] = [];
  if (socials.instagram.trim()) {
    const handle = socials.instagram.trim().replace(/^@/, '');
    parts.push(`Instagram: @${handle}`);
  }
  if (socials.tiktok.trim()) {
    const handle = socials.tiktok.trim().replace(/^@/, '');
    parts.push(`TikTok: @${handle}`);
  }
  if (socials.facebook.trim()) {
    const fb = socials.facebook.trim();
    parts.push(`Facebook: ${fb}`);
  }
  return parts.join(' • ');
}

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
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

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
  const [telefono, setTelefono] = useState(user?.telefono || '');
  const [direccion, setDireccion] = useState('');
  const [descripcion, setDescripcion] = useState(user?.bio || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Redes sociales
  const [socials, setSocials] = useState({
    instagram: '',
    tiktok: '',
    facebook: '',
  });
  const [activeSocial, setActiveSocial] = useState({
    instagram: false,
    tiktok: false,
    facebook: false,
  });

  // Horario interactivo
  const [diasSeleccionados, setDiasSeleccionados] = useState<string[]>(['Lun', 'Mar', 'Mié', 'Jue', 'Vie']);
  const [horaApertura, setHoraApertura] = useState('08:00');
  const [horaCierre, setHoraCierre] = useState('17:00');
  const [modoManualHorario, setModoManualHorario] = useState(false);
  const [horarioManual, setHorarioManual] = useState('');

  useEffect(() => {
    if (user) {
      setNombre(user.nombre || '');
      setEmail(user.email || '');
      if (user.telefono) setTelefono(user.telefono);
      if (user.bio) setDescripcion(user.bio);
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
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
  const chatScrollRef = React.useRef<HTMLDivElement>(null);

  const scrollToChatBottom = () => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  };

  const handleCloseChat = () => {
    setSelectedSolicitud(null);
    const url = new URL(window.location.href);
    if (url.searchParams.has('chat')) {
      url.searchParams.delete('chat');
      window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
    }
  };

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

  // Perfil del refugio propio (para estado pendiente, rechazado o verificado)
  const [refugioProfile, setRefugioProfile] = useState<any | null>(null);

  useEffect(() => {
    if (user && user.rol === 'REFUGIO') {
      fetch('/api/refugios/me', { credentials: 'include' })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) setRefugioProfile(data);
        })
        .catch(err => console.error("Error fetching refugio profile:", err));
    }
  }, [user]);

  useEffect(() => {
    if (refugioProfile) {
      if (refugioProfile.nombre) setNombre(refugioProfile.nombre);
      if (refugioProfile.email) setEmail(refugioProfile.email);
      if (refugioProfile.telefono) setTelefono(refugioProfile.telefono);
      if (refugioProfile.direccion) setDireccion(refugioProfile.direccion);
      if (refugioProfile.descripcion) setDescripcion(refugioProfile.descripcion);

      // Redes sociales
      if (refugioProfile.redesSociales) {
        const raw = refugioProfile.redesSociales;
        let insta = '';
        let tik = '';
        let fb = '';
        const mInsta = raw.match(/Instagram:\s*@?([^\s•,]+)/i);
        if (mInsta) insta = mInsta[1];
        const mTik = raw.match(/TikTok:\s*@?([^\s•,]+)/i);
        if (mTik) tik = mTik[1];
        const mFb = raw.match(/Facebook:\s*([^\s•,]+)/i);
        if (mFb) fb = mFb[1];
        try {
          const parsed = JSON.parse(raw);
          if (parsed.instagram) insta = parsed.instagram;
          if (parsed.tiktok) tik = parsed.tiktok;
          if (parsed.facebook) fb = parsed.facebook;
        } catch (e) {}

        setSocials({ instagram: insta, tiktok: tik, facebook: fb });
        setActiveSocial({ instagram: !!insta, tiktok: !!tik, facebook: !!fb });
      }

      // Horario
      if (refugioProfile.horario) {
        setHorarioManual(refugioProfile.horario);
        setModoManualHorario(true);
      }
    }
  }, [refugioProfile]);

  const getFileUrl = (path?: string | null): string => {
    if (!path) return '';
    const trimmed = path.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    let clean = trimmed.replace(/^\/?api\/files\/?/, '');
    clean = clean.replace(/\/+/g, '/');
    if (!clean.startsWith('/')) {
      clean = '/' + clean;
    }
    return clean;
  };

  const parseFotosLugar = (fotosStr?: string | null): string[] => {
    if (!fotosStr) return [];
    try {
      if (fotosStr.startsWith('[')) {
        const parsed = JSON.parse(fotosStr);
        if (Array.isArray(parsed)) return parsed.map(f => getFileUrl(f)).filter(Boolean);
      }
    } catch (e) {}
    return fotosStr.split(',').map(s => s.trim()).filter(Boolean).map(f => getFileUrl(f));
  };

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

  useEffect(() => {
    if (selectedSolicitud) {
      fetchMensajes(selectedSolicitud.id, false);
      const interval = setInterval(() => {
        fetchMensajes(selectedSolicitud.id, true);
      }, 3000);
      return () => clearInterval(interval);
    } else {
      setMensajes([]);
    }
  }, [selectedSolicitud]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const chatId = params.get('chat');
    if (chatId && solicitudes.length > 0) {
      const target = solicitudes.find((s) => s.id === Number(chatId));
      if (target) {
        setSelectedSolicitud(target);
      }
    }
  }, [location.search, solicitudes]);

  // Edit Cita state and handlers
  const [editingCita, setEditingCita] = useState<any | null>(null);
  const [editCitaFecha, setEditCitaFecha] = useState('');
  const [editCitaHora, setEditCitaHora] = useState('10:00');
  const [editCitaEstado, setEditCitaEstado] = useState('confirmada');
  const [editCitaMensaje, setEditCitaMensaje] = useState('');
  const [editCitaTelefono, setEditCitaTelefono] = useState('');
  const [savingCita, setSavingCita] = useState(false);

  const handleOpenEditCita = (c: any) => {
    setEditingCita(c);
    setEditCitaFecha(c.fecha || '');
    setEditCitaHora(c.hora ? c.hora.slice(0, 5) : '10:00');
    setEditCitaEstado(c.estado || 'confirmada');
    setEditCitaMensaje(c.mensaje || '');
    setEditCitaTelefono(c.telefono || '');
  };

  const handleSaveEditCita = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCita) return;
    setSavingCita(true);
    try {
      const res = await fetch(`/api/citas/${editingCita.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          fecha: editCitaFecha,
          hora: editCitaHora.length === 5 ? `${editCitaHora}:00` : editCitaHora,
          estado: editCitaEstado,
          mensaje: editCitaMensaje,
          telefono: editCitaTelefono,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setCitas(prev => prev.map(c => c.id === editingCita.id ? { ...c, ...updated, mascotaNombre: c.mascotaNombre } : c));
        showToast('Cita actualizada exitosamente', 'success');
        setEditingCita(null);
      } else {
        showToast('Error al actualizar la cita', 'error');
      }
    } catch (err) {
      showToast('Error de conexión', 'error');
    } finally {
      setSavingCita(false);
    }
  };

  const handleDeleteCita = async (id: number) => {
    if (!await confirm("¿Estás seguro de que deseas eliminar esta cita de visita?")) return;
    try {
      const res = await fetch(`/api/citas/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        setCitas(prev => prev.filter(c => c.id !== id));
        showToast('Cita eliminada correctamente', 'success');
      } else {
        showToast('Error al eliminar la cita', 'error');
      }
    } catch (err) {
      showToast('Error de conexión', 'error');
    }
  };

  const fetchMensajes = async (adopcionId: number, isPolling = false) => {
    try {
      const res = await fetch(`/api/mensajes/adopcion/${adopcionId}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setMensajes(prev => {
          const hasChanged = prev.length !== data.length ||
            (data.length > 0 && prev.length > 0 && prev[prev.length - 1]?.id !== data[data.length - 1]?.id);
          if (!hasChanged) return prev;
          setTimeout(scrollToChatBottom, 80);
          window.dispatchEvent(new CustomEvent('pawtok:refresh-notifications'));
          return data;
        });
        if (!isPolling) {
          setTimeout(scrollToChatBottom, 80);
        }
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
        setTimeout(scrollToChatBottom, 80);
        window.dispatchEvent(new CustomEvent('pawtok:refresh-notifications'));
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
    setPublicaciones(prev => {
      const updated = prev.map(m => m.id === id ? { ...m, estado: targetStatus } : m);
      setStats(s => ({
        ...s,
        enAdopcion: updated.filter((m: any) => m.estado === 'DISPONIBLE').length,
        adoptadas: updated.filter((m: any) => m.estado === 'ADOPTADO').length,
      }));
      return updated;
    });
    try {
      await fetch(`/api/mascotas/${id}/estado?estado=${targetStatus}`, {
        method: 'PUT',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Error al actualizar estado:', err);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || nombre.trim().length < 2) {
      showToast('El nombre debe tener al menos 2 caracteres.', 'error');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      showToast('Por favor, ingresa un correo electrónico válido.', 'error');
      return;
    }
    const cleanTel = telefono.replace(/\D/g, '');
    if (cleanTel && cleanTel.length !== 10) {
      showToast('El teléfono debe tener exactamente 10 dígitos numéricos (ej: 3001234567).', 'error');
      return;
    }
    if (!direccion.trim()) {
      showToast('Por favor, ingresa la dirección de ubicación del refugio.', 'error');
      return;
    }

    const finalHorario = calcularHorarioString(diasSeleccionados, horaApertura, horaCierre, horarioManual, modoManualHorario);
    const finalRedes = formatRedesString(socials);

    setSavingProfile(true);
    try {
      // 1. Guardar cambios en el Refugio (/api/refugios/me)
      const resRefugio = await fetch('/api/refugios/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          nombre: nombre.trim(),
          telefono: cleanTel,
          direccion: direccion.trim(),
          descripcion: descripcion.trim(),
          redesSociales: finalRedes,
          horario: finalHorario,
        }),
      });

      // 2. Si se cambió foto o email, actualizar en /api/usuarios/me/perfil
      const formData = new FormData();
      formData.append('nombre', nombre.trim());
      formData.append('email', email.trim());
      if (cleanTel) formData.append('telefono', cleanTel);
      if (descripcion.trim()) formData.append('bio', descripcion.trim());
      if (foto) formData.append('foto', foto);

      const resUser = await fetch('/api/usuarios/me/perfil', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (resRefugio.ok) {
        const updatedRefugio = await resRefugio.json();
        setRefugioProfile(updatedRefugio);
        if (resUser.ok) {
          const updatedUser = await resUser.json();
          setUser(updatedUser);
        }
        showToast('¡Perfil del refugio actualizado exitosamente!', 'success');
      } else {
        const errData = await resRefugio.json().catch(() => null);
        showToast(errData?.message || 'Error al actualizar perfil del refugio', 'error');
      }
    } catch (err) {
      showToast('Error de conexión al guardar cambios', 'error');
    } finally {
      setSavingProfile(false);
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

  if (user.rol !== 'REFUGIO' && user.rol !== 'ADMIN') {
    return null;
  }

  const estadoRefugio = refugioProfile?.estadoVerificacion || user.estadoRefugio;
  const isPendingOrRejected = user.rol === 'REFUGIO' && (estadoRefugio === 'Pendiente' || estadoRefugio === 'Rechazado');

  if (isPendingOrRejected) {
    const isRechazado = estadoRefugio === 'Rechazado';
    const fotosLugarList = parseFotosLugar(refugioProfile?.fotosLugarUrl);

    return (
      <div className="min-h-screen bg-slate-50/50 text-gray-900 font-sans selection:bg-[#3f92ff] selection:text-white relative pb-16">
        {/* Background Layer */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <img src="/fondo.png" alt="" className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 backdrop-blur-3xl bg-white/60" />
        </div>

        {/* Dedicated Clean Header for Pending/Rejected Shelter */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/80 shadow-xs px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/refugio" className="flex items-center gap-2">
              <img src="/logo.png" alt="Pawtok Logo" className="w-8 h-8 drop-shadow-sm" />
              <span className="text-lg font-bold text-gray-900 tracking-tight">Pawtok</span>
            </Link>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
              isRechazado 
                ? 'bg-red-50 text-red-600 border-red-200' 
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isRechazado ? 'bg-red-500' : 'bg-amber-500 animate-pulse'}`} />
              {isRechazado ? 'Solicitud Rechazada' : 'Solicitud en Revisión'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-gray-600 hidden sm:inline-block">
              Hola, <span className="font-bold text-gray-900">{refugioProfile?.nombre || user.nombre}</span>
            </span>
            <button
              onClick={handleLogout}
              className="px-3.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-red-100"
            >
              <LogOut size={14} /> Cerrar Sesión
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
          
          {/* Card 1: Banner de Estado */}
          {isRechazado ? (
            <div className="bg-gradient-to-br from-red-50 via-rose-50 to-red-100/40 border-2 border-red-200 rounded-3xl p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0 shadow-inner">
                  <AlertTriangle size={28} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-100/80 text-red-700 text-[11px] font-extrabold uppercase tracking-wider mb-1">
                    Atención Requerida
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Solicitud de Refugio no Aprobada</h2>
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                    Un administrador ha revisado la información enviada y ha determinado que no cumple con los requerimientos necesarios para registrar el refugio.
                  </p>
                </div>
              </div>

              {/* Caja destacada con el motivo exacto ingresado por el admin */}
              <div className="mt-6 bg-white/95 rounded-2xl p-5 border border-red-200/90 shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-red-700 uppercase tracking-wide">
                  <span>Motivo del Administrador:</span>
                </div>
                <p className="text-sm font-semibold text-gray-800 bg-red-50/50 p-3.5 rounded-xl border border-red-100 whitespace-pre-wrap leading-relaxed">
                  {refugioProfile?.motivoRechazo || 'No se especificó un motivo en particular. Por favor revisa que los certificados sean oficiales, legibles y vigentes.'}
                </p>
                <p className="text-xs text-gray-500 pt-1">
                  Puedes corregir la información y adjuntar nuevamente los documentos legales para una nueva evaluación.
                </p>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => navigate('/onboarding')}
                  className="px-6 py-3 bg-[#0B84FF] hover:bg-blue-600 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                  <ArrowRight size={16} /> Corregir y Reenviar Solicitud
                </button>
                <button
                  onClick={handleLogout}
                  className="px-5 py-3 bg-white hover:bg-gray-100 text-gray-700 font-bold text-xs sm:text-sm rounded-xl border border-gray-200 transition cursor-pointer"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-blue-50/90 via-sky-50/70 to-indigo-50/50 border border-blue-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#0B84FF] text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
                  <Clock size={28} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 text-[#0B84FF] text-[11px] font-bold uppercase tracking-wider mb-1">
                    En Proceso de Evaluación
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Tu solicitud está en revisión</h2>
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                    Hemos recibido la documentación legal y fotografías de tu refugio. Un administrador del equipo validará los archivos para verificar tu organización.
                  </p>
                </div>
              </div>

              {/* Indicador de pasos del trámite */}
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-blue-100 shadow-xs">
                <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-4">Progreso de la verificación:</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                    <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-emerald-900">Solicitud Enviada</p>
                      <p className="text-[10px] text-emerald-700 font-medium">Formulario completado</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-300 ring-2 ring-blue-100">
                    <div className="w-7 h-7 rounded-full bg-[#0B84FF] text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Hourglass className="w-3.5 h-3.5 animate-pulse" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-blue-900">Validación Legal</p>
                      <p className="text-[10px] text-blue-700 font-medium">Revisión de PDFs y fotos</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-200 opacity-60">
                    <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center shrink-0 shadow-2xs">
                      <Building2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-700">Activación de Refugio</p>
                      <p className="text-[10px] text-gray-500 font-medium">Panel de publicación</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center text-xs text-gray-500 pt-1">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span>Tiempo estimado de respuesta: 24 a 48 horas hábiles.</span>
                </span>
              </div>
            </div>
          )}

          {/* Card 2: Ficha del Refugio */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 overflow-hidden flex items-center justify-center shrink-0">
                  {refugioProfile?.logoUrl ? (
                    <img src={getFileUrl(refugioProfile.logoUrl)} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="w-6 h-6 text-[#0B84FF]" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {refugioProfile?.nombre || user.nombre || 'Mi Refugio'}
                  </h3>
                  <p className="text-xs text-gray-500">Datos registrados para la solicitud</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50/70 rounded-2xl border border-gray-100 space-y-1">
                <span className="font-bold text-gray-400 uppercase tracking-wider text-[10px]">Correo Electrónico</span>
                <p className="font-semibold text-gray-800 text-sm">{refugioProfile?.email || user.email || 'No registrado'}</p>
              </div>

              <div className="p-3.5 bg-slate-50/70 rounded-2xl border border-gray-100 space-y-1">
                <span className="font-bold text-gray-400 uppercase tracking-wider text-[10px]">Teléfono de Contacto</span>
                <p className="font-semibold text-gray-800 text-sm">{refugioProfile?.telefono || user.telefono || 'No registrado'}</p>
              </div>

              <div className="p-3.5 bg-slate-50/70 rounded-2xl border border-gray-100 space-y-1 sm:col-span-2">
                <span className="font-bold text-gray-400 uppercase tracking-wider text-[10px]">Dirección y Ubicación</span>
                <p className="font-semibold text-gray-800 text-sm">{refugioProfile?.direccion || 'No especificada'}</p>
              </div>

              {refugioProfile?.horario && (
                <div className="p-3.5 bg-slate-50/70 rounded-2xl border border-gray-100 space-y-1">
                  <span className="font-bold text-gray-400 uppercase tracking-wider text-[10px]">Horario de Atención</span>
                  <p className="font-semibold text-gray-800 text-sm">{refugioProfile.horario}</p>
                </div>
              )}

              {refugioProfile?.redesSociales && (
                <div className="p-3.5 bg-slate-50/70 rounded-2xl border border-gray-100 space-y-1">
                  <span className="font-bold text-gray-400 uppercase tracking-wider text-[10px]">Redes Sociales</span>
                  <p className="font-semibold text-gray-800 text-sm truncate">{refugioProfile.redesSociales}</p>
                </div>
              )}

              {refugioProfile?.descripcion && (
                <div className="p-3.5 bg-slate-50/70 rounded-2xl border border-gray-100 space-y-1 sm:col-span-2">
                  <span className="font-bold text-gray-400 uppercase tracking-wider text-[10px]">Descripción / Biografía</span>
                  <p className="font-medium text-gray-700 text-sm leading-relaxed">{refugioProfile.descripcion}</p>
                </div>
              )}
            </div>
          </div>

          {/* Card 3: Expediente de Documentos */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <FileText size={18} className="text-[#0B84FF]" />
                Documentos Legales y Fotografías Adjuntadas
              </h3>
              <p className="text-xs text-gray-500">Archivos enviados para la validación por parte del administrador.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Certificado legal */}
              <div className="p-4 rounded-2xl border border-red-100 bg-red-50/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-red-700 uppercase tracking-wider">Certificado Legal</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">PDF</span>
                </div>
                <p className="text-xs text-gray-600">Registro oficial de personería jurídica o constitución.</p>
                {refugioProfile?.certificadoUrl ? (
                  <a
                    href={getFileUrl(refugioProfile.certificadoUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-800 hover:underline pt-1"
                  >
                    <ExternalLink size={13} /> Ver Certificado PDF
                  </a>
                ) : (
                  <span className="text-xs text-gray-400 italic">No disponible</span>
                )}
              </div>

              {/* Documento del representante */}
              <div className="p-4 rounded-2xl border border-blue-100 bg-blue-50/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Doc. Representante</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">PDF</span>
                </div>
                <p className="text-xs text-gray-600">Identificación oficial del representante legal.</p>
                {refugioProfile?.documentoRepresentanteUrl ? (
                  <a
                    href={getFileUrl(refugioProfile.documentoRepresentanteUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B84FF] hover:text-blue-800 hover:underline pt-1"
                  >
                    <ExternalLink size={13} /> Ver Documento de Identidad PDF
                  </a>
                ) : (
                  <span className="text-xs text-gray-400 italic">No disponible</span>
                )}
              </div>
            </div>

            {/* Fotos del lugar */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Fotos de las Instalaciones ({fotosLugarList.length})
                </span>
              </div>
              {fotosLugarList.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {fotosLugarList.map((fotoUrl, idx) => (
                    <a
                      key={idx}
                      href={fotoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="group relative aspect-square rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 shadow-xs block"
                    >
                      <img src={fotoUrl} alt={`Instalación ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <ExternalLink size={16} />
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic p-3 bg-gray-50 rounded-xl">Sin fotos de instalaciones registradas.</p>
              )}
            </div>
          </div>

        </main>
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
                              <div>{cita.fecha} a las {cita.hora}</div>
                              {cita.novedad && (
                                <div className="mt-1.5 p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-1.5 shadow-2xs max-w-xs">
                                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                                  <div>
                                    <span className="font-bold text-amber-800">Novedad:</span>
                                    <p className="italic text-gray-700">{cita.novedad}</p>
                                  </div>
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-bold text-gray-900 block">{cita.nombreSolicitante || cita.nombreUsuario}</span>
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
                              <div className="flex justify-end items-center gap-2">
                                <button 
                                  type="button"
                                  onClick={() => handleOpenEditCita(cita)} 
                                  className="group flex items-center justify-center w-8.5 h-8.5 rounded-full bg-blue-50 hover:bg-[#0B84FF] text-[#0B84FF] hover:text-white shadow-xs hover:shadow-md hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
                                  title="Editar cita"
                                >
                                  <AnimatedPencilIcon className="w-4 h-4" />
                                </button>
                                <button 
                                  type="button"
                                  onClick={() => handleDeleteCita(cita.id)} 
                                  className="group flex items-center justify-center w-8.5 h-8.5 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-xs hover:shadow-md hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer" 
                                  title="Eliminar cita"
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
                                <img src={formatPetImageUrl(pet.imagenUrl)} className="w-12 h-12 rounded-2xl object-cover shadow-sm" alt={pet.nombre} />
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
            <div className="space-y-8">
              {/* EDITAR PERFIL COMPLETO */}
              <BlurFade delay={0.05} inView={true}>
                <div className="w-full bg-gray-100/30 backdrop-blur-xl border border-white/60 p-6 sm:p-8 rounded-3xl shadow-[0px_15px_35px_-10px_rgba(0,0,0,0.05),inset_0px_0px_15px_rgba(255,255,255,1)]">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200/60">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-[#0B84FF]" />
                      Editar Perfil del Refugio
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Configura la información pública, ubicación en Google Maps, teléfono, redes y horario
                    </p>
                  </div>
                  {refugioProfile?.estadoVerificacion === 'Aprobado' && (
                    <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verificado
                    </span>
                  )}
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  {/* Datos Básicos */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 text-xs font-bold mb-1.5">Nombre del refugio</label>
                      <input 
                        type="text" 
                        value={nombre} 
                        onChange={e => setNombre(e.target.value)} 
                        required
                        placeholder="Ej. Fundación Huellitas de Amor"
                        className="w-full px-4 py-2.5 rounded-2xl bg-white/70 border border-white focus:bg-white focus:border-[#0B84FF] focus:ring-2 focus:ring-[#0B84FF]/20 outline-none text-sm font-medium transition shadow-xs" 
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-xs font-bold mb-1.5">Correo electrónico</label>
                      <input 
                        type="email" 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        required
                        placeholder="contacto@refugio.org"
                        className="w-full px-4 py-2.5 rounded-2xl bg-white/70 border border-white focus:bg-white focus:border-[#0B84FF] focus:ring-2 focus:ring-[#0B84FF]/20 outline-none text-sm font-medium transition shadow-xs" 
                      />
                    </div>
                  </div>

                  {/* Teléfono de Contacto (10 Dígitos) */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-gray-700 text-xs font-bold">Teléfono de contacto</label>
                      <span className="text-[11px] font-semibold text-[#0B84FF]">
                        {telefono.replace(/\D/g, '').length}/10 dígitos
                      </span>
                    </div>
                    <div className="relative flex items-center">
                      <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
                      <input 
                        type="tel" 
                        maxLength={10}
                        value={telefono} 
                        onChange={e => setTelefono(e.target.value.replace(/\D/g, '').slice(0, 10))} 
                        placeholder="Ej. 3001234567"
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/70 border border-white focus:bg-white focus:border-[#0B84FF] focus:ring-2 focus:ring-[#0B84FF]/20 outline-none text-sm font-medium transition shadow-xs" 
                      />
                    </div>
                  </div>

                  {/* Dirección con API Google Maps Embed */}
                  <div className="pt-2 border-t border-gray-200/50">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-gray-700 text-xs font-bold">Dirección de ubicación</label>
                      <span className="text-[11px] text-gray-400">Visible en el perfil para visitas de adopción</span>
                    </div>
                    <div className="relative flex items-center">
                      <MapPin className="w-4 h-4 text-[#0B84FF] absolute left-3.5 pointer-events-none" />
                      <input 
                        type="text" 
                        value={direccion} 
                        onChange={e => setDireccion(e.target.value)} 
                        required
                        placeholder="Ej. Carrera 15 # 45-20, Bogotá, Colombia"
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/70 border border-white focus:bg-white focus:border-[#0B84FF] focus:ring-2 focus:ring-[#0B84FF]/20 outline-none text-sm font-medium transition shadow-xs" 
                      />
                    </div>

                    {/* Previsualización del mapa de Google Maps */}
                    {direccion.trim() ? (
                      <div className="mt-3 rounded-2xl overflow-hidden border border-gray-200/80 shadow-xs h-56 relative bg-gray-100">
                        <iframe
                          src={`https://www.google.com/maps?q=${encodeURIComponent(direccion.trim())}&output=embed`}
                          className="w-full h-full border-0"
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          title="Ubicación en Google Maps"
                        />
                        <div className="absolute bottom-2.5 left-2.5 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-700 shadow-md border border-gray-200/80 flex items-center gap-1.5 pointer-events-none">
                          <MapPin className="w-3.5 h-3.5 text-[#0B84FF] shrink-0" />
                          <span className="truncate max-w-[260px] sm:max-w-[380px]">{direccion.trim()}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2.5 rounded-2xl border border-dashed border-gray-200 bg-white/40 p-4 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-300 shrink-0" />
                        <span>Escribe la dirección física para visualizarla en Google Maps</span>
                      </div>
                    )}
                  </div>

                  {/* Redes Sociales */}
                  <div className="pt-2 border-t border-gray-200/50">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <label className="block text-gray-700 text-xs font-bold">Redes Sociales</label>
                        <p className="text-[11px] text-gray-400">Toca los botones para agregar las cuentas oficiales del refugio</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <button
                        type="button"
                        onClick={() => setActiveSocial(prev => ({ ...prev, instagram: !prev.instagram }))}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          activeSocial.instagram
                            ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white shadow-xs scale-[1.02]'
                            : 'bg-white/80 hover:bg-white text-gray-700 border border-gray-200 hover:border-pink-300'
                        }`}
                      >
                        <Instagram className="w-3.5 h-3.5" />
                        Instagram
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveSocial(prev => ({ ...prev, tiktok: !prev.tiktok }))}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          activeSocial.tiktok
                            ? 'bg-gray-900 text-white shadow-xs scale-[1.02]'
                            : 'bg-white/80 hover:bg-white text-gray-700 border border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        <TikTokIcon className="w-3.5 h-3.5" />
                        TikTok
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveSocial(prev => ({ ...prev, facebook: !prev.facebook }))}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          activeSocial.facebook
                            ? 'bg-[#1877F2] text-white shadow-xs scale-[1.02]'
                            : 'bg-white/80 hover:bg-white text-gray-700 border border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <Facebook className="w-3.5 h-3.5" />
                        Facebook
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {activeSocial.instagram && (
                        <div className="flex items-center gap-2 bg-white/70 border border-pink-200/70 p-1.5 px-3 rounded-2xl">
                          <Instagram className="w-4 h-4 text-pink-500 shrink-0" />
                          <span className="text-xs font-medium text-gray-400">@</span>
                          <input
                            type="text"
                            className="w-full bg-transparent text-xs sm:text-sm text-gray-800 outline-none"
                            placeholder="usuario_en_instagram"
                            value={socials.instagram}
                            onChange={e => setSocials(prev => ({ ...prev, instagram: e.target.value }))}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setActiveSocial(prev => ({ ...prev, instagram: false }));
                              setSocials(prev => ({ ...prev, instagram: '' }));
                            }}
                            className="text-gray-400 hover:text-red-500 p-1 cursor-pointer"
                            title="Quitar Instagram"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {activeSocial.tiktok && (
                        <div className="flex items-center gap-2 bg-white/70 border border-gray-300 p-1.5 px-3 rounded-2xl">
                          <TikTokIcon className="w-4 h-4 text-gray-900 shrink-0" />
                          <span className="text-xs font-medium text-gray-400">@</span>
                          <input
                            type="text"
                            className="w-full bg-transparent text-xs sm:text-sm text-gray-800 outline-none"
                            placeholder="usuario_en_tiktok"
                            value={socials.tiktok}
                            onChange={e => setSocials(prev => ({ ...prev, tiktok: e.target.value }))}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setActiveSocial(prev => ({ ...prev, tiktok: false }));
                              setSocials(prev => ({ ...prev, tiktok: '' }));
                            }}
                            className="text-gray-400 hover:text-red-500 p-1 cursor-pointer"
                            title="Quitar TikTok"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {activeSocial.facebook && (
                        <div className="flex items-center gap-2 bg-white/70 border border-blue-200/70 p-1.5 px-3 rounded-2xl">
                          <Facebook className="w-4 h-4 text-[#1877F2] shrink-0" />
                          <span className="text-xs font-medium text-gray-400">facebook.com/</span>
                          <input
                            type="text"
                            className="w-full bg-transparent text-xs sm:text-sm text-gray-800 outline-none"
                            placeholder="pagina_o_refugio"
                            value={socials.facebook}
                            onChange={e => setSocials(prev => ({ ...prev, facebook: e.target.value }))}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setActiveSocial(prev => ({ ...prev, facebook: false }));
                              setSocials(prev => ({ ...prev, facebook: '' }));
                            }}
                            className="text-gray-400 hover:text-red-500 p-1 cursor-pointer"
                            title="Quitar Facebook"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {!activeSocial.instagram && !activeSocial.tiktok && !activeSocial.facebook && (
                        <p className="text-xs text-gray-400 italic bg-white/40 border border-dashed border-gray-200 p-2.5 rounded-xl text-center">
                          Ninguna red social seleccionada. Usa los botones de arriba para vincularlas.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Horario de Atención */}
                  <div className="pt-2 border-t border-gray-200/50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#0B84FF]" />
                        <label className="block text-gray-700 text-xs font-bold">Horario de Atención</label>
                      </div>
                      <button
                        type="button"
                        onClick={() => setModoManualHorario(!modoManualHorario)}
                        className="text-xs text-[#0B84FF] hover:underline font-medium cursor-pointer"
                      >
                        {modoManualHorario ? 'Usar Calendario' : 'Modo texto libre'}
                      </button>
                    </div>

                    {!modoManualHorario ? (
                      <div className="space-y-3">
                        {/* Preajustes Rápidos */}
                        <div className="flex flex-wrap gap-1.5 items-center">
                          <span className="text-[11px] text-gray-400 mr-1">Preajustes:</span>
                          <button
                            type="button"
                            onClick={() => {
                              setDiasSeleccionados(['Lun', 'Mar', 'Mié', 'Jue', 'Vie']);
                              setHoraApertura('08:00');
                              setHoraCierre('17:00');
                            }}
                            className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-white border border-gray-200 hover:border-[#0B84FF] text-gray-600 hover:text-[#0B84FF] transition cursor-pointer"
                          >
                            Lun - Vie (8am-5pm)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setDiasSeleccionados(['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']);
                              setHoraApertura('08:00');
                              setHoraCierre('16:00');
                            }}
                            className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-white border border-gray-200 hover:border-[#0B84FF] text-gray-600 hover:text-[#0B84FF] transition cursor-pointer"
                          >
                            Lun - Sáb (8am-4pm)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setDiasSeleccionados(['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']);
                              setHoraApertura('08:00');
                              setHoraCierre('18:00');
                            }}
                            className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-white border border-gray-200 hover:border-[#0B84FF] text-gray-600 hover:text-[#0B84FF] transition cursor-pointer"
                          >
                            Toda la semana
                          </button>
                        </div>

                        {/* Selector de Días */}
                        <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                          {DIAS_SEMANA.map((dia) => {
                            const isSelected = diasSeleccionados.includes(dia.id);
                            return (
                              <button
                                key={dia.id}
                                type="button"
                                onClick={() => {
                                  if (isSelected) {
                                    setDiasSeleccionados(prev => prev.filter(d => d !== dia.id));
                                  } else {
                                    setDiasSeleccionados(prev => [...prev, dia.id]);
                                  }
                                }}
                                className={`py-1.5 px-1 rounded-xl text-center text-xs font-bold transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-[#0B84FF] text-white shadow-xs scale-[1.02]'
                                    : 'bg-white/80 hover:bg-white text-gray-600 border border-gray-200'
                                }`}
                              >
                                {dia.short}
                              </button>
                            );
                          })}
                        </div>

                        {/* Rango de Horas */}
                        <div className="grid grid-cols-2 gap-3 pt-1">
                          <div>
                            <label className="block text-[11px] font-semibold text-gray-500 mb-1">Apertura</label>
                            <input
                              type="time"
                              value={horaApertura}
                              onChange={e => setHoraApertura(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs font-semibold outline-none focus:border-[#0B84FF]"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-gray-500 mb-1">Cierre</label>
                            <input
                              type="time"
                              value={horaCierre}
                              onChange={e => setHoraCierre(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs font-semibold outline-none focus:border-[#0B84FF]"
                            />
                          </div>
                        </div>

                        {/* Vista previa del horario */}
                        <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-2.5 text-xs text-blue-900 font-medium flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-[#0B84FF] shrink-0" />
                          <span>
                            Vista previa: <strong>{calcularHorarioString(diasSeleccionados, horaApertura, horaCierre, '', false)}</strong>
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <input
                          type="text"
                          value={horarioManual}
                          onChange={e => setHorarioManual(e.target.value)}
                          placeholder="Ej. Lunes a Viernes de 8:00 AM a 5:00 PM"
                          className="w-full px-4 py-2.5 rounded-2xl bg-white/70 border border-white focus:bg-white focus:border-[#0B84FF] focus:ring-2 focus:ring-[#0B84FF]/20 outline-none text-sm font-medium transition shadow-xs"
                        />
                      </div>
                    )}
                  </div>

                  {/* Descripción del Refugio */}
                  <div className="pt-2 border-t border-gray-200/50">
                    <label className="block text-gray-700 text-xs font-bold mb-1.5">Descripción o Misión del Refugio</label>
                    <textarea 
                      rows={3} 
                      value={descripcion} 
                      onChange={e => setDescripcion(e.target.value)} 
                      placeholder="Misión, historia del refugio, cuántos animales rescatan, etc."
                      className="w-full px-4 py-2.5 rounded-2xl bg-white/70 border border-white focus:bg-white focus:border-[#0B84FF] focus:ring-2 focus:ring-[#0B84FF]/20 outline-none text-sm font-medium transition shadow-xs resize-none" 
                    />
                  </div>

                  <div className="pt-3">
                    <button 
                      type="submit" 
                      disabled={savingProfile}
                      className="w-full px-6 py-3.5 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition shadow-lg disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                    >
                      {savingProfile ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Guardando información...
                        </>
                      ) : (
                        'Guardar Cambios del Refugio'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </BlurFade>

            {/* SEGURIDAD (Se ubica abajo de perfil para que no se apeñuzque) */}
            <BlurFade delay={0.1} inView={true}>
              <div className="w-full bg-gray-100/30 backdrop-blur-xl border border-white/60 p-6 sm:p-8 rounded-3xl shadow-[0px_15px_35px_-10px_rgba(0,0,0,0.05),inset_0px_0px_15px_rgba(255,255,255,1)]">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200/60">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <Lock className="w-5 h-5 text-gray-700" />
                      Seguridad y Contraseña
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Actualiza la contraseña de acceso para proteger la cuenta y publicaciones de tu refugio
                    </p>
                  </div>
                </div>

                <form onSubmit={handleUpdatePassword} className="space-y-5 max-w-2xl">
                  <div>
                    <label className="block text-gray-700 text-xs font-bold mb-1.5">Contraseña actual</label>
                    <div className="relative flex items-center">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                        required
                        placeholder="Ingresa tu clave actual"
                        className="w-full pl-4 pr-12 py-2.5 rounded-2xl bg-white/70 border border-white focus:bg-white focus:border-[#0B84FF] focus:ring-2 focus:ring-[#0B84FF]/20 outline-none text-sm font-medium transition shadow-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 p-1.5 rounded-lg text-gray-400 hover:text-[#0B84FF] hover:bg-blue-50/60 active:scale-90 transition-all cursor-pointer flex items-center justify-center"
                        aria-label={showCurrentPassword ? "Ocultar contraseña" : "Ver contraseña"}
                        title={showCurrentPassword ? "Ocultar contraseña" : "Ver contraseña"}
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 text-xs font-bold mb-1.5">Nueva contraseña</label>
                      <div className="relative flex items-center">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          minLength={8}
                          placeholder="Mínimo 8 caracteres"
                          onChange={e => setNewPassword(e.target.value)}
                          required
                          className="w-full pl-4 pr-12 py-2.5 rounded-2xl bg-white/70 border border-white focus:bg-white focus:border-[#0B84FF] focus:ring-2 focus:ring-[#0B84FF]/20 outline-none text-sm font-medium transition shadow-xs"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 p-1.5 rounded-lg text-gray-400 hover:text-[#0B84FF] hover:bg-blue-50/60 active:scale-90 transition-all cursor-pointer flex items-center justify-center"
                          aria-label={showNewPassword ? "Ocultar contraseña" : "Ver contraseña"}
                          title={showNewPassword ? "Ocultar contraseña" : "Ver contraseña"}
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-700 text-xs font-bold mb-1.5">Confirmar nueva contraseña</label>
                      <div className="relative flex items-center">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          minLength={8}
                          placeholder="Repite la nueva clave"
                          onChange={e => setConfirmPassword(e.target.value)}
                          required
                          className="w-full pl-4 pr-12 py-2.5 rounded-2xl bg-white/70 border border-white focus:bg-white focus:border-[#0B84FF] focus:ring-2 focus:ring-[#0B84FF]/20 outline-none text-sm font-medium transition shadow-xs"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 p-1.5 rounded-lg text-gray-400 hover:text-[#0B84FF] hover:bg-blue-50/60 active:scale-90 transition-all cursor-pointer flex items-center justify-center"
                          aria-label={showConfirmPassword ? "Ocultar contraseña" : "Ver contraseña"}
                          title={showConfirmPassword ? "Ocultar contraseña" : "Ver contraseña"}
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 flex flex-wrap items-center justify-between gap-4">
                    <button 
                      type="submit" 
                      className="px-6 py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl font-bold transition shadow-sm cursor-pointer text-sm"
                    >
                      Actualizar Clave
                    </button>
                    <button 
                      onClick={handleLogout} 
                      type="button" 
                      className="text-red-500 font-semibold text-sm hover:text-red-700 transition cursor-pointer px-4 py-2 rounded-xl hover:bg-red-50 flex items-center gap-1.5"
                    >
                      <LogOut className="w-4 h-4" />
                      Cerrar Sesión
                    </button>
                  </div>
                </form>
              </div>
            </BlurFade>
          </div>

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
              {(() => {
                const parseDetails = (sol: any) => {
                  if (!sol) return null;
                  let motivo = sol.mensaje || '';
                  let fecha = sol.fechaVisita || '';
                  let hora = sol.horaVisita || '';
                  let tel = sol.telefono || '';
                  let dir = sol.direccion || '';
                  let viv = sol.tipoVivienda || '';
                  let masc = sol.tieneMascotas || '';
                  let ocu = sol.ocupacion || '';
                  let ing = sol.ingresosAprox || '';

                  if (typeof motivo === 'string' && (motivo.includes('Motivo:') || motivo.includes('Fecha Visita:'))) {
                    const extractField = (key: string) => {
                      const regex = new RegExp(`(?:^|\\n)${key}:\\s*(.*?)(?=\\n(?:Motivo|Fecha Visita|Hora Visita|Teléfono|Dirección|Vivienda|Otras mascotas|Ocupación|Ingresos):|$)`, 's');
                      const match = motivo.match(regex);
                      return match ? match[1].trim() : '';
                    };
                    if (!fecha) fecha = extractField('Fecha Visita');
                    if (!hora) hora = extractField('Hora Visita');
                    if (!tel) tel = extractField('Teléfono');
                    if (!dir) dir = extractField('Dirección');
                    if (!viv) viv = extractField('Vivienda');
                    if (!masc) masc = extractField('Otras mascotas');
                    if (!ocu) ocu = extractField('Ocupación');
                    if (!ing) ing = extractField('Ingresos');

                    const cleanMotivo = extractField('Motivo');
                    if (cleanMotivo) motivo = cleanMotivo;
                  }

                  return { motivo, fecha, hora, tel, dir, viv, masc, ocu, ing };
                };

                const details = parseDetails(selectedSolicitud);

                return (
                  <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100 grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-hidden">
                    <div className="sm:col-span-2 min-w-0">
                      <h4 className="text-xs font-bold text-[#0B84FF] uppercase tracking-wider mb-2">Mensaje / Motivo</h4>
                      <p className="text-gray-800 font-medium text-sm whitespace-pre-wrap break-words break-all [overflow-wrap:anywhere] bg-white/80 p-3.5 rounded-xl border border-blue-100/60">
                        {details?.motivo || 'No dejó mensaje inicial.'}
                      </p>
                    </div>

                    <div className="min-w-0 bg-white/80 p-3.5 rounded-xl border border-blue-100/60">
                      <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Cita Propuesta</h4>
                      <p className="text-sm font-semibold text-gray-900 break-words [overflow-wrap:anywhere]">
                        {details?.fecha ? `${details.fecha}${details.hora ? ` a las ${details.hora}` : ''}` : 'No especificada'}
                      </p>
                    </div>

                    <div className="min-w-0 bg-white/80 p-3.5 rounded-xl border border-blue-100/60">
                      <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Dirección</h4>
                      <p className="text-sm font-semibold text-gray-900 break-words break-all [overflow-wrap:anywhere]">
                        {details?.dir || 'No especificada'}
                      </p>
                    </div>

                    <div className="min-w-0 bg-white/80 p-3.5 rounded-xl border border-blue-100/60">
                      <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Vivienda & Ingresos</h4>
                      <p className="text-sm font-semibold text-gray-900 break-words [overflow-wrap:anywhere]">
                        {[details?.viv, details?.ing].filter(Boolean).join(' / ') || 'No especificado'}
                      </p>
                    </div>

                    <div className="min-w-0 bg-white/80 p-3.5 rounded-xl border border-blue-100/60">
                      <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Ocupación / Teléfono</h4>
                      <p className="text-sm font-semibold text-gray-900 break-words break-all [overflow-wrap:anywhere]">
                        {[details?.ocu, details?.tel].filter(Boolean).join(' / ') || 'No especificado'}
                      </p>
                    </div>

                    {details?.masc && (
                      <div className="sm:col-span-2 min-w-0 bg-white/80 p-3.5 rounded-xl border border-blue-100/60">
                        <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Otras Mascotas en Casa</h4>
                        <p className="text-sm font-semibold text-gray-900 break-words break-all [overflow-wrap:anywhere]">
                          {details.masc}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })()}



              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  Chat de Coordinación
                </h4>
                <div ref={chatScrollRef} className="bg-gray-50 rounded-2xl p-4 h-64 border border-gray-100 flex flex-col space-y-3 overflow-y-auto">
                  {mensajes.map((msg, idx) => (
                    <div key={idx} className={`max-w-[80%] p-3 rounded-2xl shadow-sm min-w-0 break-words break-all [overflow-wrap:anywhere] ${msg.remitenteId === user.id ? 'self-end bg-[#0B84FF] text-white rounded-tr-sm' : 'self-start bg-white border border-gray-200 text-gray-800 rounded-tl-sm'}`}>
                      <p className={`text-[10px] font-bold mb-1 break-words break-all [overflow-wrap:anywhere] ${msg.remitenteId === user.id ? 'text-blue-100' : 'text-gray-500'}`}>{msg.remitenteNombre}</p>
                      {msg.contenido && <p className="text-sm whitespace-pre-wrap break-words break-all [overflow-wrap:anywhere]">{msg.contenido}</p>}
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
                onClick={handleCloseChat} 
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

      {/* MODAL PARA EDITAR CITA DE VISITA */}
      {editingCita && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 relative">
            <button
              onClick={() => setEditingCita(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#0B84FF]" />
              Gestionar Cita de Visita
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Mascota: <strong>{editingCita.mascotaNombre}</strong> • Solicitante: <strong>{editingCita.nombreSolicitante || editingCita.nombreUsuario}</strong>
            </p>

            {editingCita.novedad && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs mb-4">
                <div className="flex items-center gap-1.5 font-bold text-amber-800 mb-1">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Novedad reportada por el adoptante:</span>
                </div>
                <p className="italic bg-white/70 p-2.5 rounded-xl border border-amber-100/70 text-gray-800 font-medium">
                  "{editingCita.novedad}"
                </p>
                <p className="text-[11px] text-amber-700/80 mt-1">
                  Puedes ajustar la fecha u hora abajo conforme a lo solicitado.
                </p>
              </div>
            )}

            <form onSubmit={handleSaveEditCita} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Fecha de la visita</label>
                <DatePicker 
                  value={editCitaFecha} 
                  onChange={setEditCitaFecha} 
                  placeholder="Seleccionar fecha"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Hora</label>
                  <input 
                    type="time" 
                    value={editCitaHora} 
                    onChange={e => setEditCitaHora(e.target.value)} 
                    required 
                    className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-sm font-semibold outline-none focus:border-[#0B84FF] transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Estado</label>
                  <HeadlessListbox 
                    options={[
                      { value: 'confirmada', label: 'Confirmada' },
                      { value: 'pendiente', label: 'Pendiente' },
                      { value: 'reprogramada', label: 'Reprogramada' },
                      { value: 'completada', label: 'Completada' },
                      { value: 'cancelada', label: 'Cancelada' },
                    ]}
                    value={editCitaEstado} 
                    onChange={setEditCitaEstado}
                    buttonClassName="px-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-sm font-semibold outline-none focus:border-[#0B84FF] transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Teléfono de contacto</label>
                <input 
                  type="tel"
                  maxLength={10}
                  value={editCitaTelefono} 
                  onChange={e => setEditCitaTelefono(e.target.value.replace(/\D/g, '').slice(0, 10))} 
                  className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-sm font-medium outline-none focus:border-[#0B84FF] transition"
                  placeholder="Ej. 3001234567"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Notas o mensaje para el adoptante</label>
                <textarea 
                  rows={3} 
                  value={editCitaMensaje} 
                  onChange={e => setEditCitaMensaje(e.target.value)} 
                  placeholder="Indicaciones para la visita, requisitos o información importante..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-sm font-medium outline-none focus:border-[#0B84FF] transition resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCita(null)}
                  className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-700 font-bold text-xs sm:text-sm hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingCita}
                  className="flex-1 py-3 rounded-2xl bg-[#0B84FF] hover:bg-blue-600 text-white font-bold text-xs sm:text-sm shadow-md transition disabled:opacity-50 cursor-pointer"
                >
                  {savingCita ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
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
