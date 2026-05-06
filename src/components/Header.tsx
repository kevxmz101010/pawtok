/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wallet, LogOut, Copy, Check, Star, ChevronDown } from 'lucide-react';
import { WalletState } from '../types';

interface HeaderProps {
  wallet: WalletState;
  onConnectWallet: (provider: string) => void;
  onDisconnectWallet: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onSelectDrop: (id: string) => void;
  // Kept for prop signature compatibility
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function Header({
  wallet,
  onConnectWallet,
  onDisconnectWallet,
  onShowToast,
}: HeaderProps) {
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll listener for the bouncing header animation
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCopyAddress = () => {
    if (wallet.address) {
      navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      onShowToast('Wallet address copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleConnectProvider = (provider: string) => {
    onConnectWallet(provider);
    setIsWalletModalOpen(false);
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
            <a href="/" className="flex items-center gap-2 group active:scale-95 transition-transform" title="Pawtok Home">
              <svg className="w-6 h-6 text-[#0B84FF] group-hover:rotate-12 transition-transform duration-300" viewBox="0 0 24 24" fill="none">
                <path fill="currentColor" d="M6 2l2 5 5 .5L9 10l2 5-5-3-4 3 1.5-6L1 6l5-.5L6 2z" />
              </svg>
              <span className="text-lg font-bold text-gray-900 tracking-tight">Pawtok</span>
            </a>

            {/* Navigation Items */}
            <nav className="hidden sm:flex items-center gap-6">
              <a 
                href="./encuentas.html"
                className="text-sm font-medium text-gray-900 hover:text-black transition-colors"
              >
                Encuesta
              </a>
            </nav>
          </div>

          {/* Right Side: Wallet Connection */}
          <div className="relative">
            {wallet.isConnected ? (
              <div className="flex items-center gap-4">
                <span className="text-xs font-medium text-gray-700 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200/60 shadow-sm">
                  Hola, {wallet.address ? wallet.address.slice(0, 6) : 'Usuario'}
                </span>

                <a href="dashboard.php" className="text-sm font-medium text-gray-800 hover:text-[#0B84FF] transition-colors hidden md:block">
                  Mi Panel
                </a>

                <button
                  onClick={onDisconnectWallet}
                  className="bg-red-500 hover:bg-red-600 text-white active:scale-95 px-5 py-2 rounded-full text-xs md:text-sm font-medium transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5 hidden md:block" />
                  Salir
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <a href="./login.html" className="text-sm font-medium text-gray-900 hover:text-gray-900 transition-colors hidden md:block">
                  Iniciar Sesión
                </a>
                <button
                  onClick={() => setIsWalletModalOpen(true)}
                  className="relative bg-[#0B84FF] text-white hover:bg-[#157def] active:scale-95 px-5 py-2 md:px-6 md:py-2.5 rounded-full text-xs md:text-sm font-medium transition-all cursor-pointer shadow-[inset_0px_2px_7px_#81c5ff,inset_0px_-3px_11px_#0048a8,0px_8px_15px_rgba(11,132,255,0.3)] hover:shadow-[inset_0px_2px_4px_#81c5ff,inset_0px_-3px_4px_#0053c2,0px_12px_20px_rgba(11,132,255,0.4)]"
                >
                  <div className="absolute inset-x-0 h-[2px] w-1/2 mx-auto -top-px shadow-2xl bg-gradient-to-r from-transparent via-white to-transparent opacity-80" />
                  <span className="relative z-20">Registrarse</span>
                </button>
              </div>
            )}
          </div>

        </motion.div>
      </header>

      {/* Wallet Selector Modal (Animated modal slide-up) */}
      <AnimatePresence>
        {isWalletModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsWalletModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative w-full max-w-sm bg-white border border-gray-100 rounded-3xl shadow-2xl p-6 z-10 overflow-hidden"
            >
              <div className="text-center pb-5 border-b border-gray-50">
                <h4 className="text-lg font-bold text-gray-900">Iniciar Sesión Simulada</h4>
                <p className="text-xs text-gray-500 mt-1">Conecta una wallet para simular la sesión de Pawtok.</p>
              </div>

              <div className="grid gap-2.5 mt-5">
                <button
                  onClick={() => handleConnectProvider('MetaMask')}
                  className="flex items-center justify-between p-3.5 border border-gray-100 hover:border-gray-300 rounded-2xl hover:bg-gray-50 active:scale-[0.98] transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <img referrerPolicy="no-referrer" src="https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=60&auto=format&fit=crop&q=60" className="w-7 h-7 rounded-lg object-cover bg-amber-50" alt="" />
                    <div>
                      <p className="text-xs font-bold text-gray-900">MetaMask</p>
                      <p className="text-[10px] text-gray-500">Conectar mediante extensión</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">Popular</span>
                </button>
              </div>

              <div className="mt-5 text-center">
                <button
                  onClick={() => setIsWalletModalOpen(false)}
                  className="text-xs font-bold text-gray-400 hover:text-black py-1 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
