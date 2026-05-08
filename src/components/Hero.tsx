/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Mail, CheckCircle2, Users, ArrowRight, X } from 'lucide-react';
import { RainbowButton } from './ui/rainbow-button';
import { BorderTrail } from './ui/border-trail';

interface HeroProps {
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  registeredEmails: string[];
  onRegisterEmail: (email: string) => void;
}

export default function Hero({ onShowToast, registeredEmails, onRegisterEmail }: HeroProps) {
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [queueNumber, setQueueNumber] = useState(0);

  const handleJoinWaitlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailAddress.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      onShowToast('Please enter a valid email address.', 'error');
      return;
    }

    if (registeredEmails.includes(emailAddress)) {
      onShowToast('You are already registered on the waitlist!', 'info');
      setQueueNumber(registeredEmails.indexOf(emailAddress) + 1421);
      setSubmitted(true);
      return;
    }

    setLoading(true);
    // Simulate API registration delay
    setTimeout(() => {
      onRegisterEmail(emailAddress);
      const position = registeredEmails.length + 1421;
      setQueueNumber(position);
      setLoading(false);
      setSubmitted(true);
      onShowToast('Welcome to the Drops queue!', 'success');
    }, 1200);
  };

  const closeWaitlist = () => {
    setIsWaitlistOpen(false);
    // don't immediately clear submitted state so they can open and see their position
  };

  return (
    <section className="relative overflow-visible pt-36 pb-20 md:pt-44 md:pb-32 px-6 flex flex-col items-center text-center">
      {/* Giant Main Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 20, filter: "blur(12px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ type: "spring", stiffness: 150, damping: 25, delay: 0.1 }}
        className="font-display font-normal text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight leading-[1.1] text-gray-900 max-w-5xl mx-auto flex flex-col justify-center items-center select-none mb-10"
      >
        <div className="relative inline-block">
          {/* Hueso difuminado detrás de "Encuentra" */}
          <motion.img
            src="/hueso.png"
            alt="Hueso Azul Fondo"
            className="hidden sm:block absolute -top-10 -left-6 sm:-top-12 sm:-left-12 md:-top-20 md:-left-12 w-20 h-20 sm:w-28 sm:h-28 md:w-72 md:h-72 object-contain blur-sm z-0 pointer-events-none"
            initial={{ opacity: 0, scaleX: -1, y: 0 }}
            animate={{ opacity: 0.7,  scaleX: -1, y: 15}}
            transition={{ type: "spring", stiffness: 150, damping: 25, delay: 0.3 }}
          />

          <span className="font-normal bg-gradient-to-r from-[#0e0e0e] via-gray-500 to-gray-900 text-transparent bg-clip-text relative z-10 px-2 sm:px-0 block leading-tight sm:leading-[1.1]">
            Encuentra a tu <br /> compañero perfecto
          </span>


          {/* Hueso principal sobre "perfecto" */}
          <motion.img
            src="/hueso.png"
            alt="Hueso Azul"
            className="hidden sm:block absolute -bottom-8 -right-4 sm:-bottom-12 sm:-right-12 md:-bottom-49 md:-right-28 w-24 h-24 sm:w-32 sm:h-32 md:w-96 md:h-96 object-contain drop-shadow-2xl z-20 pointer-events-none"
            initial={{ opacity: 0, y: 0, filter: "blur(12px)" }}
            animate={{ opacity: 1, y: 15, filter: "blur(0px)" }}
            transition={{ type: "spring", stiffness: 150, damping: 25, delay: 0.3 }}
          />
        </div>
      </motion.h1>

      {/* Primary Action Button */}
      <motion.div
        initial={{ opacity: 0, y: 15, filter: "blur(12px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ type: "spring", stiffness: 150, damping: 25, delay: 0.4 }}
        className="relative z-10"
      >
        <motion.div
          whileHover={{ rotate: 5, scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <RainbowButton
            onClick={() => setIsWaitlistOpen(true)}
            className="text-sm md:text-base font-base flex items-center gap-2 group cursor-pointer"
          >
            <span>Comenzar</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-4" />
          </RainbowButton>
        </motion.div>
      </motion.div>

      {/* Secondary stats below the button to add depth */}
      <motion.p
        initial={{ opacity: 0, y: 10, filter: "blur(12px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ type: "spring", stiffness: 150, damping: 25, delay: 0.4 }}
        className="text-base text-gray-400 mt-9 flex items-center gap-1.5 justify-center font-normal select-none"
      >
        <span>Conectamos personas con mascotas que <br /> necesitan un hogar lleno de cariño.</span>
      </motion.p>

      {/* Early Access Queue Dialog Modal */}
      <AnimatePresence>
        {isWaitlistOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeWaitlist}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Waitlist Modal Container */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative w-full max-w-md bg-white border border-gray-100 rounded-3xl shadow-2xl p-6 md:p-8 z-10 overflow-hidden"
            >
              <button
                onClick={closeWaitlist}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-black transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <AnimatePresence mode="wait">
                {!submitted ? (
                  /* Form State */
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="text-center"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
                      <Mail className="w-6 h-6" />
                    </div>

                    <h3 className="text-xl font-bold text-gray-900">Get Early Access</h3>
                    <p className="text-xs text-gray-500 mt-2">
                      Join our private pilot testnet waitlist to mint curated creators keys and limited-edition design drops.
                    </p>

                    <form onSubmit={handleJoinWaitlist} className="mt-6 text-left space-y-4">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5 ml-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          required
                          value={emailAddress}
                          onChange={(e) => setEmailAddress(e.target.value)}
                          placeholder="you@domain.com"
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200/80 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white hover:bg-black/90 disabled:bg-gray-400 py-3 rounded-xl text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {loading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Securing Your Spot...</span>
                          </>
                        ) : (
                          <>
                            <span>Join Waitlist</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </form>
                  </motion.div>
                ) : (
                  /* Success/Queued State */
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="text-center"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-4 animate-bounce">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>

                    <h3 className="text-xl font-bold text-gray-900">You're on the list!</h3>
                    <p className="text-xs text-gray-500 mt-2">
                      Successfully reserved access for <span className="text-gray-900 font-bold">{emailAddress}</span>.
                    </p>

                    <div className="bg-gray-50 rounded-2xl p-4.5 mt-6 border border-gray-100">
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider font-mono">
                        Your Queue Position
                      </div>
                      <div className="text-3xl font-extrabold text-gray-900 tracking-tight font-sans mt-1">
                        #{queueNumber}
                      </div>
                      <div className="text-[10px] text-indigo-600 mt-1 font-semibold">
                        A verification code was sent to your email.
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSubmitted(false);
                        setEmailAddress('');
                      }}
                      className="mt-6 text-xs text-gray-400 hover:text-black font-semibold underline underline-offset-4"
                    >
                      Register another email
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
