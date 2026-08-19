/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
              {(!user || user.rol !== 'REFUGIO') && (
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
                
                {/* Si eres un refugio, ves este botón rápido para publicar un perrito */}
                {user.rol === 'REFUGIO' && (
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

                {/* Saludo personalizado con avatar sobresaliendo entre el interior y el exterior */}
                <Link 
                  to={user.rol === 'REFUGIO' ? '/refugio' : user.rol === 'ADMIN' ? '/admin' : '/cuenta'} 
                  className="group relative inline-flex items-center pl-8 pr-3.5 py-1.5 ml-3 bg-white/90 hover:bg-white text-gray-700 hover:text-[#0B84FF] rounded-full border border-gray-200/80 hover:border-blue-300 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                  title="Ir a mi perfil"
                >
                  {/* Foto de perfil sobresaliendo mitad dentro y mitad fuera */}
                  <div className="absolute -left-3.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full ring-2 ring-white shadow-md overflow-hidden bg-gray-100 flex items-center justify-center transition-transform duration-200 group-hover:scale-105 group-hover:rotate-9">
                    <img 
                      src={getProfileImage()} 
                      alt={displayName} 
                      className="w-full h-full object-cover"
                      onError={() => setImgError(true)}
                    />
                  </div>

                  <span className="text-xs font-semibold tracking-tight whitespace-nowrap">
                    Hola, <span className="text-gray-900 group-hover:text-[#012f73] transition-colors">{displayName}</span>
                  </span>
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
