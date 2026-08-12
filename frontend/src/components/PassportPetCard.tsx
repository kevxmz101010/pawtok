import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Heart } from 'lucide-react';
import { MascotaDTO } from '../types';

interface PassportPetCardProps {
  pet: MascotaDTO;
  fotoUrl: string;
  fallbackImg: string;
  isFav: boolean;
  onToggleFavorite: (id: number, e: React.MouseEvent) => void;
  onClick: () => void;
}

/**
 * PassportPetCard
 * Sombra 3D en GPU + Liquid Glass & Inner Shadow (Passportdex Style Ultra-Fluid):
 * - Borde de bisel cristalino superior (Liquid Glass Specular Rim).
 * - Sombra interna envolvente (Inner Shadow inset) que da profundidad física de cristal líquido.
 * - Reflejo curvo de vidrio líquido en la parte superior.
 * - Físicas GPU Spring para 120 FPS sin re-renders de React.
 * - Entrada con scale instantáneo "de golpe" y difuminado micro-flash de 2px a los 150ms.
 */
export default function PassportPetCard({
  pet,
  fotoUrl,
  fallbackImg,
  isFav,
  onToggleFavorite,
  onClick,
}: PassportPetCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const blurTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [isHovered, setIsHovered] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const [isBlurring, setIsBlurring] = useState(false);

  // Motion Values (Normalizadas de -0.5 a 0.5)
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  // Resorte Framer Motion ultra-fluido (Sin jank de React)
  const springX = useSpring(rawX, { stiffness: 260, damping: 22 });
  const springY = useSpring(rawY, { stiffness: 260, damping: 22 });

  // Transformaciones 3D derivadas de los resortes
  const rotateX = useTransform(springY, [-0.5, 0.5], [14, -14]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-14, 14]);

  // Proyección de Sombra 3D en Capa GPU (Desplazamiento invertido realista de luz)
  const shadowX = useTransform(springX, [-0.5, 0.5], [30, -30]);
  const shadowY = useTransform(springY, [-0.5, 0.5], [36, -6]);

  // Haz de luz (Glare spotlight)
  const glareX = useTransform(springX, [-0.5, 0.5], [0, 100]);
  const glareY = useTransform(springY, [-0.5, 0.5], [0, 100]);

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (blurTimerRef.current) clearTimeout(blurTimerRef.current);

    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const normX = (e.clientX - rect.left) / rect.width - 0.5;
      const normY = (e.clientY - rect.top) / rect.height - 0.5;
      rawX.set(normX);
      rawY.set(normY);
    }

    setIsHovered(true);
    setIsEntering(true);
    setIsBlurring(true);

    // Permitir interpolación fluida tras la entrada instantánea
    setTimeout(() => {
      setIsEntering(false);
    }, 40);

    // El desenfoque micro-flash de 2px desaparece en 150ms
    blurTimerRef.current = setTimeout(() => {
      setIsBlurring(false);
    }, 150);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const normX = (e.clientX - rect.left) / rect.width - 0.5;
    const normY = (e.clientY - rect.top) / rect.height - 0.5;

    // Actualizar los motion values (No desencadena re-renderizados de React)
    rawX.set(normX);
    rawY.set(normY);
  };

  const handleMouseLeave = () => {
    if (blurTimerRef.current) clearTimeout(blurTimerRef.current);

    setIsHovered(false);
    setIsEntering(false);
    setIsBlurring(false);

    // Retorno suave del resorte a cero
    rawX.set(0);
    rawY.set(0);
  };

  return (
    <div className="w-full h-[340px] select-none relative" style={{ perspective: '1000px' }}>
      {/* ================= CAPA DE SOMBRA 3D DINÁMICA GPU (Passportdex Ambient Glow) ================= */}
      <motion.div
        style={{
          x: shadowX,
          y: shadowY,
          opacity: isHovered ? 0.85 : 0,
          scale: isHovered ? 1.04 : 0.96,
        }}
        transition={{
          opacity: { duration: 0.25 },
          scale: { duration: 0.25 },
        }}
        className="absolute inset-1 rounded-[2rem] bg-gradient-to-tr from-[#0B84FF]/45 via-blue-600/25 to-black/70 blur-xl pointer-events-none z-0"
      />

      {/* Sombra de oclusión oscura profunda adicional */}
      <motion.div
        style={{
          x: shadowX,
          y: shadowY,
          opacity: isHovered ? 0.6 : 0,
        }}
        transition={{ opacity: { duration: 0.25 } }}
        className="absolute inset-4 rounded-[2rem] bg-black/80 blur-2xl pointer-events-none z-0"
      />

      {/* ================= TARJETA PRINCIPAL ================= */}
      <motion.article
        ref={cardRef}
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          scale: isHovered ? 1.06 : 1.0,
          transformStyle: 'preserve-3d',
        }}
        transition={{
          scale: isEntering ? { duration: 0 } : { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
        }}
        className="relative z-10 rounded-[2rem] overflow-hidden group h-full flex flex-col justify-end cursor-pointer bg-slate-950 transition-colors duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
      >
        {/* ================= Capa 1: Imagen de Fondo (Z = 0) ================= */}
        <div
          className="absolute inset-0 z-0 overflow-hidden"
          style={{ transform: 'translateZ(0px)' }}
        >
          <img
            src={fotoUrl}
            alt={pet.nombre}
            className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-110"
            onError={(e) => {
              e.currentTarget.src = fallbackImg;
            }}
          />

          {/* Gradiente sutil inferior para legibilidad del texto */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* ================= CAPA LIQUID GLASS: ÚNICAMENTE EL BISEL BLANCO BRILLANTE ARRIBA ================= */}
        <div
          className="absolute inset-0 pointer-events-none z-20 rounded-[2rem]"
          style={{
            transform: 'translateZ(18px)',
            boxShadow: 'inset 0 2px 2px 0 rgba(255, 255, 255, 0.75)',
          }}
        />

        {/* ================= Capa INSTANTÁNEA: Difuminado micro-flash 2px ================= */}
        <div
          className="absolute inset-0 pointer-events-none z-15 rounded-[2rem]"
          style={{
            transform: 'translateZ(12px)',
            backdropFilter: isBlurring ? 'blur(2px) brightness(1.1)' : 'blur(0px) brightness(1.0)',
            WebkitBackdropFilter: isBlurring ? 'blur(2px) brightness(1.1)' : 'blur(0px) brightness(1.0)',
            opacity: isBlurring ? 1 : 0,
            transition: isBlurring ? 'none' : 'backdrop-filter 0.15s ease-out, opacity 0.15s ease-out',
          }}
        />

        {/* ================= Capa 2: Brillo / Haz de luz dinámico Passport (Z = 10px) ================= */}
        <motion.div
          className="absolute inset-0 pointer-events-none z-10 rounded-[2rem]"
          style={{
            transform: 'translateZ(10px)',
            opacity: isHovered ? 1 : 0,
            background: useTransform(
              [glareX, glareY],
              ([gx, gy]) =>
                `radial-gradient(circle at ${gx}% ${gy}%, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.08) 40%, transparent 70%)`
            ),
            mixBlendMode: 'overlay',
          }}
          transition={{ opacity: { duration: 0.2 } }}
        />

        {/* ================= Capa 3: Badges Superiores (Match % y Corazón) (Z = 25px) ================= */}
        {pet.matchScore && (
          <div
            className="absolute top-4 left-4 z-30 pointer-events-none"
            style={{ transform: 'translateZ(25px)' }}
          >
            <div className="px-3 py-1.5 bg-green-500/90 backdrop-blur-md border border-white/20 text-white text-sm font-bold rounded-full shadow-lg flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              {pet.matchScore}% Match
            </div>
          </div>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(pet.id, e);
          }}
          style={{ transform: 'translateZ(25px)' }}
          className="absolute top-4 right-4 p-2 transition-all z-30 cursor-pointer drop-shadow-md hover:scale-110 active:scale-95"
        >
          <Heart
            className={`w-6 h-6 transition-colors ${
              isFav ? 'text-red-500 fill-red-500' : 'text-white hover:text-red-400'
            }`}
          />
        </button>

        {/* ================= Capa 4: Texto de Información Original (Z = 20px) ================= */}
        <div
          className="relative z-10 p-5 flex flex-col gap-1 text-left w-full transition-transform duration-300 pb-6 pointer-events-none"
          style={{ transform: 'translateZ(20px)' }}
        >
          <h3 className="text-[22px] font-semibold text-white leading-tight truncate drop-shadow-md group-hover:text-[#57abff] transition-colors">
            {pet.nombre}
          </h3>
          <p className="text-[14px] text-gray-300 font-medium drop-shadow-sm">
            {pet.raza || pet.categoria}
          </p>
        </div>
      </motion.article>
    </div>
  );
}
