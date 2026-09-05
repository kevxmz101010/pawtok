import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PetStatusToggleProps {
  status: string; // 'DISPONIBLE' | 'ADOPTADO' | 'INHABILITADO' (or lowercase)
  onChangeStatus: (newStatus: 'DISPONIBLE' | 'ADOPTADO' | 'INHABILITADO') => void;
  disabled?: boolean;
  className?: string;
}

export function PetStatusToggle({
  status,
  onChangeStatus,
  disabled = false,
  className = ''
}: PetStatusToggleProps) {
  const normStatus = (status || '').toUpperCase();
  const isDisponible = normStatus === 'DISPONIBLE';
  const isAdoptado = normStatus === 'ADOPTADO';
  const isInhabilitado = normStatus === 'INHABILITADO' || normStatus === 'NO DISPONIBLE';

  const handleTogglePill = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    if (isInhabilitado) {
      onChangeStatus('DISPONIBLE');
    } else if (isDisponible) {
      onChangeStatus('ADOPTADO');
    } else {
      onChangeStatus('DISPONIBLE');
    }
  };

  const handleToggleEye = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    if (isInhabilitado) {
      onChangeStatus('DISPONIBLE');
    } else {
      onChangeStatus('INHABILITADO');
    }
  };

  return (
    <div className={`inline-flex items-center gap-1.5 select-none ${className}`}>
      {/* CAPSULE BUTTON: SELF-CONTAINED BOUNCING DOT & SLIDING TEXT */}
      <motion.button
        type="button"
        disabled={disabled}
        onClick={handleTogglePill}
        whileTap={{ scale: 0.94 }}
        className={`relative inline-flex items-center w-[114px] h-[30px] px-2.5 rounded-full text-xs font-bold transition-colors duration-200 cursor-pointer border shadow-2xs overflow-hidden ${
          isDisponible
            ? 'bg-emerald-50/90 text-emerald-600 border-emerald-200/90 hover:bg-emerald-100/90'
            : isAdoptado
            ? 'bg-blue-50/90 text-[#0B84FF] border-blue-200/90 hover:bg-blue-100/90'
            : 'bg-gray-100/90 text-gray-500 border-gray-200/90 hover:bg-gray-200/90'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={
          isDisponible
            ? 'Clic para cambiar a Adoptado'
            : isAdoptado
            ? 'Clic para cambiar a Disponible'
            : 'Clic para habilitar a Disponible'
        }
      >
        {/* BOUNCING DOT (Translates across the width with spring bounce) */}
        {!isInhabilitado && (
          <motion.span
            animate={{
              x: isDisponible ? 0 : 86,
              backgroundColor: isDisponible ? '#10b981' : '#0B84FF'
            }}
            transition={{
              type: 'spring',
              stiffness: 520,
              damping: 26,
              mass: 0.75
            }}
            className="absolute left-2.5 w-2 h-2 rounded-full shadow-xs shrink-0 z-10 pointer-events-none"
          />
        )}

        {/* SLIDING TEXT LABEL (Slides in opposite direction with spring physics) */}
        <motion.div
          animate={{
            x: isInhabilitado ? 0 : isDisponible ? 6 : -6
          }}
          transition={{
            type: 'spring',
            stiffness: 520,
            damping: 26,
            mass: 0.75
          }}
          className="w-full text-center flex items-center justify-center font-bold tracking-tight"
        >
          <AnimatePresence mode="wait" initial={false}>
            {isDisponible && (
              <motion.span
                key="label-disponible"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
                className="block"
              >
                Disponible
              </motion.span>
            )}

            {isAdoptado && (
              <motion.span
                key="label-adoptado"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
                className="block"
              >
                Adoptado
              </motion.span>
            )}

            {isInhabilitado && (
              <motion.span
                key="label-inhabilitado"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.12 }}
                className="block text-gray-500"
              >
                Inhabilitado
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.button>

      {/* EYE BUTTON WITH REAL ANIMATED EYE CLOSING / OPENING */}
      <motion.button
        type="button"
        disabled={disabled}
        onClick={handleToggleEye}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.85 }}
        transition={{ type: 'spring', stiffness: 450, damping: 20 }}
        className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all cursor-pointer shadow-2xs ${
          isInhabilitado
            ? 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200 hover:text-gray-800'
            : 'bg-white/90 text-gray-400 border-gray-200 hover:text-[#0B84FF] hover:border-blue-200 hover:bg-blue-50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={isInhabilitado ? 'Mascota inhabilitada (Clic para abrir el ojo y habilitar)' : 'Mascota visible (Clic para cerrar el ojo e inhabilitar)'}
      >
        <svg
          viewBox="0 0 24 24"
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Párpado superior: desciende suavemente al cerrarse */}
          <motion.path
            initial={false}
            animate={{
              d: isInhabilitado
                ? "M 2 12 C 6 15.5, 18 15.5, 22 12"
                : "M 2 12 C 6 4.5, 18 4.5, 22 12"
            }}
            transition={{ type: "spring", stiffness: 400, damping: 24 }}
          />

          {/* Párpado inferior: sube al centro para unirse con el párpado superior */}
          <motion.path
            initial={false}
            animate={{
              d: isInhabilitado
                ? "M 2 12 C 6 15.5, 18 15.5, 22 12"
                : "M 2 12 C 6 19.5, 18 19.5, 22 12"
            }}
            transition={{ type: "spring", stiffness: 400, damping: 24 }}
          />

          {/* Pupila / Iris: se encoge hacia abajo y se oculta cuando el ojo se cierra */}
          <motion.circle
            cx="12"
            r="3"
            initial={false}
            animate={{
              cy: isInhabilitado ? 15.5 : 12,
              scaleY: isInhabilitado ? 0 : 1,
              scaleX: isInhabilitado ? 0.3 : 1,
              opacity: isInhabilitado ? 0 : 1
            }}
            transition={{ type: "spring", stiffness: 420, damping: 24 }}
          />

          {/* Pestañas hacia abajo cuando el ojo está cerrado */}
          <motion.path
            d="M 6.5 14.8 L 4.5 18"
            initial={false}
            animate={{
              pathLength: isInhabilitado ? 1 : 0,
              opacity: isInhabilitado ? 1 : 0
            }}
            transition={{
              duration: 0.18,
              delay: isInhabilitado ? 0.05 : 0
            }}
          />
          <motion.path
            d="M 12 15.5 L 12 19.5"
            initial={false}
            animate={{
              pathLength: isInhabilitado ? 1 : 0,
              opacity: isInhabilitado ? 1 : 0
            }}
            transition={{
              duration: 0.18,
              delay: isInhabilitado ? 0.08 : 0
            }}
          />
          <motion.path
            d="M 17.5 14.8 L 19.5 18"
            initial={false}
            animate={{
              pathLength: isInhabilitado ? 1 : 0,
              opacity: isInhabilitado ? 1 : 0
            }}
            transition={{
              duration: 0.18,
              delay: isInhabilitado ? 0.11 : 0
            }}
          />
        </svg>
      </motion.button>
    </div>
  );
}
