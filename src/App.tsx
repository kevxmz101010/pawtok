/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Eye } from 'lucide-react';
import Header from './components/Header';
import Hero from './components/Hero';
import DropsGrid from './components/DropsGrid';
import Notification from './components/Notification';
import AboutSection from './components/AboutSection';
import WaveTransition from './components/WaveTransition';
import { WalletState, ToastMessage } from './types';

export default function App() {
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
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-[#3f92ff] selection:text-black flex flex-col justify-between">

      <div className="relative w-full">
        {/* Background Image Layer with Blur and Fade at the bottom */}
        <div className="absolute top-0 left-0 w-full z-0 pointer-events-none">
          <img src="/fondo.png" alt="" className="w-full h-auto" />

          {/* Blur overlay for the bottom part of the image */}
          <div
            className="absolute inset-0"
            style={{
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              maskImage: "linear-gradient(to top, black 5%, transparent 35%)",
              WebkitMaskImage: "linear-gradient(to top, black 5%, transparent 35%)"
            }}
          />

          {/* White fade overlay for the bottom part of the image */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to top, white 5%, rgba(255,255,255,0) 35%)"
            }}
          />
        </div>

        {/* Foreground Content */}
        <div className="relative z-10">
          {/* Navigation Header */}
          <Header
            wallet={wallet}
            onConnectWallet={handleConnectWallet}
            onDisconnectWallet={handleDisconnectWallet}
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

          <div className="relative overflow-hidden bg-[#0b8cff]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.28),transparent_28%),linear-gradient(180deg,rgba(11,140,255,1)_0%,rgba(0,103,218,1)_100%)]" />
            <WaveTransition />
            <div className="relative z-10 h-24 sm:h-32" />
          </div>
        </div>
      </div>

      {/* Footer Details */}
      <footer className="border-t border-gray-100/80 bg-white py-12 px-6 select-none mt-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo container */}
          <div className="flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
            <div
              className="w-4 h-4 bg-black"
              style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
            />
            <div className="w-4 h-4 bg-black rounded-full" />
            <div className="w-4 h-4 bg-black" />
            <span className="text-xs font-bold text-gray-800 ml-2 font-mono uppercase tracking-widest">AOM DROPS</span>
          </div>

          {/* Copyright description */}
          <p className="text-[11px] text-gray-400 font-medium text-center md:text-right font-mono">
            © 2026 Drops Pilot Sandbox. Synthesized in fidelity from the design reference.
          </p>

          <div className="flex gap-4">
            <button
              onClick={() => handleShowToast('Privacy policy details are in sandbox test mode.', 'info')}
              className="text-[11px] font-bold text-gray-400 hover:text-black tracking-wide cursor-pointer"
            >
              Privacy Policy
            </button>
            <span className="text-gray-200">|</span>
            <button
              onClick={() => handleShowToast('Terms of service is in mock sandbox status.', 'info')}
              className="text-[11px] font-bold text-gray-400 hover:text-black tracking-wide cursor-pointer"
            >
              Terms of Use
            </button>
          </div>
        </div>
      </footer>

      {/* Floating Notifications Toasts Feed */}
      <Notification toasts={toasts} onDismiss={handleDismissToast} />

    </div>
  );
}
