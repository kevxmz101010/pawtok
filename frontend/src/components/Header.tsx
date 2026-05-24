/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Bell, CheckCheck, CheckCircle2, XCircle, Calendar, PawPrint, MessageSquare } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { NotificacionDTO } from '../types';

/**
 * Barra de Navegación Principal (Header.tsx)
 * Aparece en la parte superior de casi todas las pantallas.
 * Su diseño cambia si haces scroll hacia abajo (efecto cristal).
 * Muestra diferentes opciones si estás logueado como Usuario, Refugio o Admin.
 */
interface HeaderProps {
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onSelectDrop: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function Header({
  onShowToast,
}: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // Estados para notificaciones
  const [notificaciones, setNotificaciones] = useState<NotificacionDTO[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showNotis, setShowNotis] = useState(false);
  const notisRef = useRef<HTMLDivElement>(null);

  const fetchNotificaciones = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await fetch('/api/notificaciones', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setNotificaciones(data);
        const unread = data.filter((n: NotificacionDTO) => !n.leida).length;
        setUnreadCount(unread);
      }
    } catch (err) {
      console.error('Error cargando notificaciones:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotificaciones();
      const interval = setInterval(fetchNotificaciones, 3000);
      const handleRefresh = () => fetchNotificaciones();
      window.addEventListener('pawtok:refresh-notifications', handleRefresh);
      return () => {
        clearInterval(interval);
        window.removeEventListener('pawtok:refresh-notifications', handleRefresh);
      };
    } else {
      setNotificaciones([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notisRef.current && !notisRef.current.contains(e.target as Node)) {
        setShowNotis(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarcarLeida = async (n: NotificacionDTO) => {
    if (!n.leida) {
      try {
        await fetch(`/api/notificaciones/${n.id}/leer`, {
          method: 'PUT',
          credentials: 'include',
        });
        setNotificaciones((prev) =>
          prev.map((item) => (item.id === n.id ? { ...item, leida: true } : item))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (e) {
        console.error(e);
      }
    }
    setShowNotis(false);
    if (n.enlace) {
      navigate(n.enlace);
    }
  };

  const handleMarcarTodasLeidas = async () => {
    try {
      await fetch('/api/notificaciones/marcar-todas', {
        method: 'PUT',
        credentials: 'include',
      });
      setNotificaciones((prev) => prev.map((item) => ({ ...item, leida: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  const getNotificationIcon = (tipo: string) => {
    switch (tipo) {
      case 'MENSAJE_NUEVO':
        return <MessageSquare className="w-5 h-5 text-sky-500 shrink-0" />;
      case 'SOLICITUD_APROBADA':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />;
      case 'SOLICITUD_RECHAZADA':
        return <XCircle className="w-5 h-5 text-rose-500 shrink-0" />;
      case 'CITA_ACTUALIZADA':
        return <Calendar className="w-5 h-5 text-indigo-500 shrink-0" />;
      case 'SOLICITUD_NUEVA':
      default:
        return <PawPrint className="w-5 h-5 text-blue-500 shrink-0" />;
    }
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diffSec < 60) return 'Hace un momento';
    if (diffSec < 3600) return `Hace ${Math.floor(diffSec / 60)} min`;
    if (diffSec < 86400) return `Hace ${Math.floor(diffSec / 3600)} h`;
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  /**
   * Efecto visual: Cuando el usuario hace scroll hacia abajo, 
   * la barra de navegación se encoge y se vuelve de cristal borroso (glassmorphism).
   */
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /**
   * Manejador del botón "Salir"
   */
  const handleLogout = async () => {
    try {
      await logout();
      onShowToast('Sesión cerrada correctamente', 'success');
      navigate('/');
    } catch (error) {
      onShowToast('Error al cerrar sesión', 'error');
    }
  };

  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [user?.foto]);

  const displayName = user
    ? (user.rol === 'ADMIN'
        ? (user.nombre && user.nombre.toLowerCase() !== 'admin' && user.nombre.toLowerCase() !== 'administrador' ? user.nombre : 'kj')
        : user.nombre)
    : '';

  const getProfileImage = () => {
    if (imgError || !user?.foto) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || 'Usuario')}&background=0B84FF&color=fff&bold=true`;
    }
    if (user.foto.startsWith('http')) return user.foto;
    return `http://localhost:8080/uploads/${user.foto.split('/').pop()}`;
  };

  return (
    <>
      <header className="fixed top-0 z-50 w-full h-[76px] flex items-start justify-center pointer-events-none">
        <motion.div 
          className="pointer-events-auto flex items-center justify-between mx-auto backdrop-blur-xl px-4 sm:px-12"
          layout
          initial={false}
          animate={{
            width: isScrolled ? 'min(750px, calc(100vw - 32px))' : '100%',
            maxWidth: '1280px',
            paddingTop: isScrolled ? '10px' : '16px',
            paddingBottom: isScrolled ? '10px' : '16px',
            borderRadius: isScrolled ? '999px' : '0px',
            backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0)',
            boxShadow: isScrolled ? '0px 15px 35px -10px rgba(0,0,0,0.05)' : '0px 0px 0px rgba(0,0,0,0.0)',
            borderBottom: isScrolled ? '1px solid transparent' : '0px solid rgba(255, 255, 255, 0.2)',
            y: isScrolled ? 20 : 0,
          }}
          transition={{
            type: 'spring',
            stiffness: 350,
            damping: 25,
            mass: 0.8,
          }}
        >
          
          {/* Left Side: Logo & Main Navigation Links */}
          <div className="flex items-center gap-6 md:gap-10">
            {/* Pawtok Logo */}
            <Link to="/" className="flex items-center gap-2 group active:scale-95 transition-transform" title="Pawtok Home">
              <img src="/logo.png" alt="Pawtok Logo" className="w-8 h-8 group-hover:scale-110 transition-transform duration-300 drop-shadow-sm" />
              <span className="text-lg font-bold text-gray-900 tracking-tight">Pawtok</span>
            </Link>

            {/* Navigation Items */}
            <nav className="hidden sm:flex items-center gap-6">
              <Link 
                to="/mascotas"
                className="text-sm font-medium text-gray-900 hover:text-black transition-colors"
              >
                Mascotas
              </Link>
              {(!user || user.rol === 'USUARIO') && (
                <Link 
                  to="/encuesta"
                  className="text-sm font-medium text-gray-900 hover:text-black transition-colors"
                >
                  Test de Compatibilidad
                </Link>
              )}
            </nav>
          </div>

          {/* Lado Derecho: Autenticación / Opciones de Usuario */}
          <div className="relative">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-4">
                
                {/* Si eres un refugio verificado, ves este botón rápido para publicar */}
                {user.rol === 'REFUGIO' && user.estadoRefugio === 'Aprobado' && (
                  <Link 
                    to="/dashboard/add-pet" 
                    className="hidden sm:flex items-center gap-1.5 text-sm font-normal text-gray-900 hover:text-black transition-colors"
                  >
                    Agregar Mascota
                  </Link>
                )}
                
                {/* Si eres Admin, ves tu panel secreto */}
                {user.rol === 'ADMIN' && (
                  <Link 
                    to="/admin" 
                    className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-[#0B84FF] hover:text-blue-700 transition-colors"
                  >
                    Panel Admin
                  </Link>
                )}

                {/* Campanita de Notificaciones */}
                <div className="relative" ref={notisRef}>
                  <button
                    type="button"
                    onClick={() => setShowNotis((prev) => !prev)}
                    className="relative p-2 rounded-full hover:bg-gray-100/70 transition-colors text-gray-700 hover:text-black cursor-pointer border border-transparent hover:border-gray-200/50 flex items-center justify-center"
                    title="Notificaciones"
                    aria-label="Notificaciones"
                  >
                    <motion.div
                      animate={
                        unreadCount > 0
                          ? {
                              rotate: [0, -14, 14, -12, 12, -7, 7, -3, 3, 0],
                              x: [0, -1, 1, -1, 1, -0.5, 0.5, 0],
                            }
                          : { rotate: 0, x: 0 }
                      }
                      transition={
                        unreadCount > 0
                          ? {
                              duration: 0.65,
                              repeat: Infinity,
                              repeatDelay: 2.2,
                              ease: "easeInOut",
                            }
                          : { duration: 0.2 }
                      }
                      style={{ transformOrigin: "top center" }}
                      className="relative flex items-center justify-center"
                    >
                      <Bell className="w-5 h-5" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[13px] h-[13px] px-0.5 text-[8.5px] font-bold text-white bg-red-500 rounded-full ring-1.5 ring-white shadow-xs">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </motion.div>
                  </button>

                  {/* Popover flotante de notificaciones */}
                  <AnimatePresence>
                    {showNotis && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white/95 backdrop-blur-2xl border border-gray-200/90 rounded-2xl shadow-2xl overflow-hidden z-50 text-left"
                      >
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/80">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-900">Notificaciones</span>
                            {unreadCount > 0 && (
                              <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                {unreadCount} nueva{unreadCount > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                          {unreadCount > 0 && (
                            <button
                              type="button"
                              onClick={handleMarcarTodasLeidas}
                              className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 hover:underline cursor-pointer"
                            >
                              <CheckCheck className="w-3.5 h-3.5" />
                              Marcar leídas
                            </button>
                          )}
                        </div>

                        <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                          {notificaciones.length === 0 ? (
                            <div className="py-8 text-center text-gray-500 flex flex-col items-center justify-center gap-2">
                              <Bell className="w-8 h-8 text-gray-300 stroke-[1.5]" />
                              <p className="text-xs">No tienes notificaciones por el momento</p>
                            </div>
                          ) : (
                            notificaciones.map((n) => (
                              <div
                                key={n.id}
                                onClick={() => handleMarcarLeida(n)}
                                className={`flex items-start gap-3 p-3.5 transition-colors cursor-pointer hover:bg-gray-50 ${
                                  !n.leida ? 'bg-blue-50/40' : ''
                                }`}
                              >
                                <div className="mt-0.5 p-2 rounded-xl bg-gray-100 shrink-0">
                                  {getNotificationIcon(n.tipo)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-1 mb-0.5">
                                    <p className={`text-xs font-semibold truncate ${!n.leida ? 'text-gray-900' : 'text-gray-700'}`}>
                                      {n.titulo}
                                    </p>
                                    <span className="text-[10px] text-gray-400 shrink-0">
                                      {formatTime(n.fechaCreacion)}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                                    {n.mensaje}
                                  </p>
                                </div>
                                {!n.leida && (
                                  <span className="w-2 h-2 rounded-full bg-[#0B84FF] shrink-0 mt-2" />
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Saludo personalizado con avatar: al hacer scroll se cierra el texto con animación y queda solo la foto */}
                <Link 
                  to={user.rol === 'REFUGIO' ? '/refugio' : user.rol === 'ADMIN' ? '/admin' : '/cuenta'} 
                  className="flex items-center gap-2 group p-1 pr-3 rounded-full hover:bg-gray-100/50 transition-all cursor-pointer border border-transparent hover:border-gray-200/50"
                >
                  <motion.div
                    layout
                    className={`group relative flex items-center rounded-full transition-all duration-300 ${
                      isScrolled
                        ? 'bg-transparent border-transparent shadow-none p-0'
                        : 'bg-white/90 hover:bg-white border border-gray-200/80 hover:border-blue-300 shadow-sm hover:shadow-md pl-1.5 pr-3.5 py-1'
                    }`}
                    transition={{
                      type: 'spring',
                      stiffness: 350,
                      damping: 25,
                      mass: 0.8,
                    }}
                  >
                    {/* Foto de perfil */}
                    <div className="w-8 h-8 rounded-full ring-2 ring-white shadow-md overflow-hidden bg-gray-100 flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105">
                      <img 
                        src={getProfileImage()} 
                        alt={displayName} 
                        className="w-full h-full object-cover"
                        onError={() => setImgError(true)}
                      />
                    </div>

                    {/* Texto animado que se cierra suavemente dejando solo la foto */}
                    <AnimatePresence initial={false}>
                      {!isScrolled && (
                        <motion.div
                          key="user-greeting-pill"
                          initial={{ opacity: 0, width: 0, marginLeft: 0 }}
                          animate={{ opacity: 1, width: 'auto', marginLeft: 8 }}
                          exit={{ opacity: 0, width: 0, marginLeft: 0 }}
                          transition={{
                            type: 'spring',
                            stiffness: 350,
                            damping: 25,
                            mass: 0.8,
                          }}
                          className="overflow-hidden whitespace-nowrap text-xs font-semibold tracking-tight text-gray-700"
                        >
                          Hola, <span className="text-gray-900 group-hover:text-[#012f73] transition-colors">{displayName}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </Link>

                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white active:scale-95 px-5 py-2 rounded-full text-xs md:text-sm font-medium transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5 hidden md:block" />
                  Salir
                </button>
              </div>
            ) : (
              // Si NO estás logueado, muestra esto:
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-sm font-medium text-gray-900 hover:text-[#0B84FF] transition-colors block cursor-pointer">
                  Iniciar Sesión
                </Link>
                <Link
                  to="/register"
                  className="relative bg-[#0B84FF] text-white hover:bg-[#157def] active:scale-95 px-5 py-2 md:px-6 md:py-2.5 rounded-full text-xs md:text-sm font-medium transition-all cursor-pointer shadow-[inset_0px_2px_7px_#81c5ff,inset_0px_-3px_11px_#0048a8] hover:shadow-[inset_0px_2px_4px_#81c5ff,inset_0px_-3px_4px_#0053c2] inline-flex items-center justify-center"
                >
                  <div className="absolute inset-x-0 h-[2px] w-1/2 mx-auto -top-px shadow-2xl bg-gradient-to-r from-transparent via-white to-transparent opacity-80" />
                  <span className="relative z-20">Registrarse</span>
                </Link>
              </div>
            )}
          </div>

        </motion.div>
      </header>
    </>
  );
}
