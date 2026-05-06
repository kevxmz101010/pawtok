/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Mail, CheckCircle2, Users, ArrowRight, X } from 'lucide-react';
import { RainbowButton } from './ui/rainbow-button';
import { BorderTrail } from './ui/border-trail';
import { useNavigate } from 'react-router-dom';

interface HeroProps {
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  registeredEmails: string[];
  onRegisterEmail: (email: string) => void;
}

export default function Hero({ onShowToast, registeredEmails, onRegisterEmail }: HeroProps) {
  const navigate = useNavigate();

  const scrollToPets = () => {
    navigate('/mascotas');
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
            onClick={scrollToPets}
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


    </section>
  );
}
