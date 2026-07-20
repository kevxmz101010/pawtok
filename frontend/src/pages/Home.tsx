/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Eye } from 'lucide-react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Notification from '../components/Notification';
import AboutSection from '../components/AboutSection';
import { WalletState, ToastMessage } from '../types';

export default function Home() {
  // Read initial states from sandbox localStorage
  const [wallet, setWallet] = useState<WalletState>(() => {
    const saved = localStorage.getItem('drops_wallet_testnet');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return { address: null, balance: null, provider: null, isConnected: false };
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const [registeredEmails, setRegisteredEmails] = useState<string[]>(() => {
    const saved = localStorage.getItem('drops_registered_emails');
    return saved ? JSON.parse(saved) : [];
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryOrId, setSelectedCategoryOrId] = useState<string | null>(null);

  // Sync wallet state to localStorage
  useEffect(() => {
    localStorage.setItem('drops_wallet_testnet', JSON.stringify(wallet));
  }, [wallet]);

  // Sync waitlisted emails to localStorage
  useEffect(() => {
    localStorage.setItem('drops_registered_emails', JSON.stringify(registeredEmails));
  }, [registeredEmails]);

  // Toast notifier helper
  const handleShowToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const nextToast: ToastMessage = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      message,
    };
    setToasts((prev) => [...prev, nextToast]);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Wallet actions
  const handleConnectWallet = (provider: string) => {
    // Generate a beautiful mock wallet address
    const hex = '0123456789abcdef';
    let mockAddr = '0x';
    for (let i = 0; i < 40; i++) {
      mockAddr += hex[Math.floor(Math.random() * 16)];
    }

    // Set simulated balance
    const randomBalance = (Math.random() * (5.5 - 1.2) + 1.2).toFixed(2);

    setWallet({
      address: mockAddr,
      balance: randomBalance,
      provider,
      isConnected: true,
    });

    handleShowToast(`Successfully connected testnet via ${provider}`, 'success');
  };

  const handleDisconnectWallet = () => {
    setWallet({ address: null, balance: null, provider: null, isConnected: false });
    handleShowToast('Wallet disconnected from the sandbox.', 'info');
  };

  const handleUpdateBalance = (newBalance: string) => {
    setWallet((prev) => ({ ...prev, balance: newBalance }));
  };

  const handleRegisterEmail = (email: string) => {
    setRegisteredEmails((prev) => [...prev, email]);
  };

  return (
    <div 
      className="min-h-screen text-gray-900 font-sans selection:bg-[#3f92ff] selection:text-black flex flex-col justify-between"
      style={{
        backgroundImage: "url('/fondo.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed"
      }}
    >
      <div className="relative w-full">
        {/* Foreground Content */}
        <div className="relative z-10">
          {/* Navigation Header */}
          <Header
            onShowToast={handleShowToast}
            onSelectDrop={setSelectedCategoryOrId}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          {/* Hero Section */}
          <Hero
            onShowToast={handleShowToast}
            registeredEmails={registeredEmails}
            onRegisterEmail={handleRegisterEmail}
          />

          <div className="w-full mt-0 sm:mt-52 pt-6 pb-20 px-6 flex flex-col justify-center items-center text-center">
            <h2 className="font-display font-normal text-4xl sm:text-5xl md:text-3xl lg:text-5xl tracking-tight leading-[1.1] mb-1">
              <span className="font-semibold text-gray-700 inline-block">
                {"Nuestra Comunidad".split("").map((char, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, y: 15, filter: "blur(8px)" }}
                    whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.03,
                      ease: "easeOut"
                    }}
                    className="inline-block"
                  >
                    {char === " " ? "\u00A0" : char}
                  </motion.span>
                ))}
              </span>
            </h2>

            <p className="text-base sm:text-lg text-gray-500 max-w-3xl mx-auto mb-16 leading-relaxed flex flex-wrap justify-center gap-x-[0.25em]">
              {"En Pawtok trabajamos con el propósito de facilitar la adopción responsable de mascotas, conectando refugios con personas que desean brindar un hogar lleno de cuidado y amor. Nuestra misión y visión reflejan el compromiso de crear una comunidad más consciente, solidaria y comprometida con el bienestar animal.".split(" ").map((word, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: 15, filter: "blur(8px)" }}
                  whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{
                    duration: 0.4,
                    delay: 0.1 + index * 0.03, // Start after title, fast stagger
                    ease: "easeOut"
                  }}
                  className="inline-block"
                >
                  {word}
                </motion.span>
              ))}
            </p>

            <div className="max-w-5xl w-full relative mt-8 px-4">
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Card Misión */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                  className="bg-gray-100/30 backdrop-blur-xl border border-white/60 p-8 sm:p-10 rounded-3xl shadow-[0px_15px_35px_-10px_rgba(0,0,0,0.05),inset_0px_0px_15px_rgba(255,255,255,1)] text-left flex flex-col gap-3 sm:gap-4 hover:bg-gray-100 transition-colors"
                >
                  <h3 className="text-2xl sm:text-4xl font-semibold text-gray-700 tracking-tight text-center ">Misión</h3>
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed font-normal text-center">
                    Facilitar la adopción responsable conectando refugios con personas dispuestas a brindar amor y cuidado en un hogar seguro.
                  </p>
                </motion.div>

                {/* Card Visión */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20, filter: "blur(8px)" }}
                  whileInView={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                  className="bg-gray-100/30 backdrop-blur-xl border border-white/60 p-8 sm:p-10 rounded-3xl shadow-[0px_15px_35px_-10px_rgba(0,0,0,0.05),inset_0px_0px_15px_rgba(255,255,255,1)] text-left flex flex-col gap-3 sm:gap-4 hover:bg-gray-100 transition-colors"
                >
                  <h3 className="text-2xl sm:text-4xl font-semibold text-gray-700 tracking-tight text-center ">Visión</h3>
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed font-normal text-center">
                    Crear una comunidad global más consciente, solidaria y profundamente comprometida con el bienestar animal y su futuro.
                  </p>
                </motion.div>
              </div>
            </div>
          </div>

          <AboutSection />

          <div className="relative overflow-hidden pt-16 sm:pt-24">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0b8cff] to-[#0067da] via-20% md:via-15%" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.28),transparent_28%)]" />
            <div className="relative z-10 h-8 sm:h-12" />
            
            {/* Contactanos Section */}
            <div className="relative z-10 px-6 pb-24 max-w-4xl mx-auto text-white">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-5xl font-display font-bold tracking-tight mb-4 drop-shadow-sm">Contáctanos</h2>
                <p className="text-blue-100 text-lg max-w-2xl mx-auto leading-relaxed">
                  ¿Tienes alguna pregunta, sugerencia o deseas colaborar con nosotros? Estamos aquí para ayudarte a transformar la vida de más mascotas.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 sm:p-10 rounded-3xl shadow-[0_15px_35px_-10px_rgba(0,0,0,0.1)] flex flex-col md:flex-row gap-10">
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold mb-6">Ponte en contacto</h3>
                  <div className="flex items-center gap-4 mb-4 text-blue-50">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                    </div>
                    <div>
                      <p className="text-sm text-blue-200">Email</p>
                      <p className="font-medium">hola@pawtok.com</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mb-4 text-blue-50">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                    </div>
                    <div>
                      <p className="text-sm text-blue-200">Teléfono</p>
                      <p className="font-medium">+1 (555) 123-4567</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-blue-50">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    </div>
                    <div>
                      <p className="text-sm text-blue-200">Ubicación</p>
                      <p className="font-medium">Ciudad de Mascotas, CP 12345</p>
                    </div>
                  </div>
                </div>
                
                
                <form className="flex-1 flex flex-col gap-4" onSubmit={async (e) => { 
                  e.preventDefault(); 
                  const target = e.target as typeof e.target & {
                    nombre: { value: string };
                    email: { value: string };
                    mensaje: { value: string };
                  };
                  try {
                    const res = await fetch('/api/contacto', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        nombre: target.nombre.value,
                        email: target.email.value,
                        mensaje: target.mensaje.value
                      })
                    });
                    if (res.ok) {
                      handleShowToast('Mensaje enviado. ¡Nos pondremos en contacto pronto!', 'success');
                      (e.target as HTMLFormElement).reset();
                    } else {
                      handleShowToast('Error al enviar el mensaje', 'error');
                    }
                  } catch (err) {
                    handleShowToast('Error de conexión', 'error');
                  }
                }}>
                  <input name="nombre" type="text" placeholder="Tu nombre" required className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all" />
                  <input name="email" type="email" placeholder="Tu correo" required className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all" />
                  <textarea name="mensaje" placeholder="Tu mensaje..." rows={4} required className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all resize-none"></textarea>
                  <button type="submit" className="w-full py-3 bg-white text-[#0b8cff] font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-lg">Enviar Mensaje</button>
                </form>
              </div>
            </div>

            {/* Footer Details */}
            <footer className="border-t border-white/20 bg-transparent py-12 px-6 select-none relative z-10">
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-2 opacity-90 hover:opacity-100 transition-opacity">
                  <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                    <svg className="w-4 h-4 text-[#0b8cff]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C8.686 2 6 4.686 6 8c0 3.866 6 14 6 14s6-10.134 6-14c0-3.314-2.686-6-6-6zm0 8.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                  </div>
                  <span className="text-lg font-black text-white tracking-tight">Pawtok <span className="text-blue-200">.</span></span>
                </div>

                <p className="text-[13px] text-blue-100 font-medium text-center md:text-right">
                  © {new Date().getFullYear()} Pawtok. Todos los derechos reservados.
                </p>

                <div className="flex gap-6">
                  <button onClick={() => handleShowToast('Políticas de privacidad en construcción.', 'info')} className="text-[13px] font-semibold text-blue-100 hover:text-white tracking-wide cursor-pointer transition-colors">
                    Privacidad
                  </button>
                  <button onClick={() => handleShowToast('Términos de servicio en construcción.', 'info')} className="text-[13px] font-semibold text-blue-100 hover:text-white tracking-wide cursor-pointer transition-colors">
                    Términos
                  </button>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>

      {/* Floating Notifications Toasts Feed */}
      <Notification toasts={toasts} onDismiss={handleDismissToast} />

    </div>
  );
}
