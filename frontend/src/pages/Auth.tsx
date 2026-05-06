import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Auth({ initialMode }: { initialMode: 'login' | 'register' }) {
  const location = useLocation();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  
  // Sync mode with route changes if needed
  useEffect(() => {
    if (location.pathname === '/login') setMode('login');
    else if (location.pathname === '/register') setMode('register');
  }, [location.pathname]);

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const toggleMode = () => {
    setError('');
    const newMode = mode === 'login' ? 'register' : 'login';
    setMode(newMode);
    // Optionally update URL without reloading
    window.history.replaceState(null, '', `/${newMode}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (mode === 'login') {
        await login({ email, contrasena });
        const returnUrl = location.state?.returnUrl || '/';
        navigate(returnUrl);
      } else {
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&.])[A-Za-z\d@$!%*#?&.]{8,}$/;
        if (!passwordRegex.test(contrasena)) {
          setError('La contraseña debe tener mínimo 8 caracteres, 1 número, 1 letra y 1 símbolo especial.');
          setLoading(false);
          return;
        }
        await register({ nombre, email, contrasena });
        navigate('/onboarding');
      }
    } catch (err: any) {
      setError(err.message || (mode === 'login' ? 'Error al iniciar sesión' : 'Error al registrarse'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-[#3f92ff] selection:text-black flex items-center justify-center relative py-12">
      {/* Background Image Layer with Blur */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <img src="/fondo.png" alt="" className="w-full h-full object-cover opacity-70" />
        <div
          className="absolute inset-0"
          style={{
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
          }}
        />
        <div className="absolute inset-0 bg-white/40" />
      </div>

      <div className="relative z-10 w-full max-w-md px-6 flex flex-col items-center">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 mb-8 group active:scale-95 transition-transform self-start"
        >
          <svg className="w-6 h-6 text-[#0B84FF] group-hover:-translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          <span className="text-sm font-medium text-gray-700 group-hover:text-black transition-colors">Volver al inicio</span>
        </Link>

        {/* 
          Removed the 'in' animation (initial/animate) as requested.
          Added layout prop and spring transition for the bouncy size adaptation.
        */}
        <motion.div
          layout
          transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
          className="bg-gray-100/30 backdrop-blur-xl border border-white/60 p-8 sm:p-10 rounded-3xl shadow-[0px_15px_35px_-10px_rgba(0,0,0,0.05),inset_0px_0px_15px_rgba(255,255,255,1)] w-full overflow-hidden"
        >
          <motion.div layout className="text-center mb-8">
            <motion.h1 layout className="text-3xl font-semibold text-gray-800 tracking-tight mb-2">
              {mode === 'login' ? 'Bienvenido' : 'Crear Cuenta'}
            </motion.h1>
            <motion.p layout className="text-sm text-gray-500">
              {mode === 'login' ? 'Inicia sesión para continuar en Pawtok' : 'Únete a la comunidad de Pawtok'}
            </motion.p>
          </motion.div>

          <AnimatePresence mode="popLayout">
            {error && (
              <motion.div 
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="mb-6 p-3 bg-red-50/50 border border-red-200 text-red-600 text-sm rounded-xl text-center"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.form layout onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="popLayout">
              {mode === 'register' && (
                <motion.div
                  initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                  animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
                  exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                  transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
                >
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Nombre Completo</label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                    className="w-full bg-white/50 border border-white focus:border-[#0B84FF] focus:ring-4 focus:ring-[#0B84FF]/10 outline-none rounded-2xl px-4 py-3 text-sm transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
                    placeholder="Juan Pérez"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div layout>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Correo Electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white/50 border border-white focus:border-[#0B84FF] focus:ring-4 focus:ring-[#0B84FF]/10 outline-none rounded-2xl px-4 py-3 text-sm transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
                placeholder="tu@email.com"
              />
            </motion.div>

            <motion.div layout>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Contraseña</label>
              <input
                type="password"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                required
                minLength={mode === 'register' ? 6 : undefined}
                className="w-full bg-white/50 border border-white focus:border-[#0B84FF] focus:ring-4 focus:ring-[#0B84FF]/10 outline-none rounded-2xl px-4 py-3 text-sm transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
                placeholder={mode === 'register' ? "Mínimo 6 caracteres" : "••••••••"}
              />
            </motion.div>

            <motion.button
              layout
              type="submit"
              disabled={loading}
              className="w-full relative mt-4 bg-[#0B84FF] text-white hover:bg-[#157def] active:scale-[0.98] py-3.5 rounded-2xl text-sm font-semibold transition-all cursor-pointer shadow-[inset_0px_2px_7px_#81c5ff,inset_0px_-3px_11px_#0048a8,0px_8px_15px_rgba(11,132,255,0.3)] hover:shadow-[inset_0px_2px_4px_#81c5ff,inset_0px_-3px_4px_#0053c2,0px_12px_20px_rgba(11,132,255,0.4)] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-x-0 h-[2px] w-1/2 mx-auto -top-px shadow-2xl bg-gradient-to-r from-transparent via-white to-transparent opacity-80" />
              <span className="relative z-20">
                {loading 
                  ? (mode === 'login' ? 'Ingresando...' : 'Creando cuenta...') 
                  : (mode === 'login' ? 'Iniciar Sesión' : 'Registrarse')}
              </span>
            </motion.button>
          </motion.form>

          <motion.p layout className="mt-8 text-center text-sm text-gray-500">
            {mode === 'login' ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
            <button 
              type="button"
              onClick={toggleMode} 
              className="text-[#0B84FF] font-semibold hover:underline cursor-pointer"
            >
              {mode === 'login' ? 'Regístrate' : 'Inicia Sesión'}
            </button>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
