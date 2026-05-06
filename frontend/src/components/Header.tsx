/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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

  // Handle scroll listener for the bouncing header animation
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      onShowToast('Sesión cerrada correctamente', 'success');
      navigate('/');
    } catch (error) {
      onShowToast('Error al cerrar sesión', 'error');
    }
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

          {/* Right Side: Auth / User info */}
          <div className="relative">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-4">
                {user.rol === 'REFUGIO' && (
                  <Link 
                    to="/dashboard/add-pet" 
                    className="hidden sm:flex items-center gap-1.5 text-sm font-normal text-gray-900 hover:text-black transition-colors"
                  >
                    Agregar Mascota
                  </Link>
                )}
                {user.rol === 'ADMIN' && (
                  <Link 
                    to="/admin" 
                    className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-[#0B84FF] hover:text-blue-700 transition-colors"
                  >
                    Panel Admin
                  </Link>
                )}

                <Link 
                  to={user.rol === 'REFUGIO' ? '/refugio' : user.rol === 'ADMIN' ? '/admin' : '/cuenta'} 
                  className="text-xs font-medium text-gray-700 hover:text-[#0B84FF] bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200/60 shadow-sm transition-colors cursor-pointer"
                >
                  Hola, {user.nombre}
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
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-sm font-medium text-gray-900 hover:text-[#0B84FF] transition-colors block cursor-pointer">
                  Iniciar Sesión
                </Link>
                <Link
                  to="/register"
                  className="relative bg-[#0B84FF] text-white hover:bg-[#157def] active:scale-95 px-5 py-2 md:px-6 md:py-2.5 rounded-full text-xs md:text-sm font-medium transition-all cursor-pointer shadow-[inset_0px_2px_7px_#81c5ff,inset_0px_-3px_11px_#0048a8,0px_8px_15px_rgba(11,132,255,0.3)] hover:shadow-[inset_0px_2px_4px_#81c5ff,inset_0px_-3px_4px_#0053c2,0px_12px_20px_rgba(11,132,255,0.4)] inline-flex items-center justify-center"
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
