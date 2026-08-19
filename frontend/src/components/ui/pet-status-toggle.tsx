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

      {/* EYE BUTTON WITH ANIMATED CLOSING / OPENING (NO YELLOW) */}
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
        title={isInhabilitado ? 'Mascota inhabilitada (Clic para habilitar)' : 'Mascota visible (Clic para inhabilitar)'}
      >
        <svg
          viewBox="0 0 24 24"
          className="w-3.5 h-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Eyelid curves (morph smoothly from open almond to closed line) */}
          <motion.path
            animate={{
              d: isInhabilitado
                ? "M2 12s4-1 10-1 10 1 10 1-4 1-10 1-10-1-10-1Z"
                : "M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"
            }}
            transition={{ type: "spring", stiffness: 480, damping: 26 }}
          />
          {/* Pupil / Iris */}
          <motion.circle
            cx="12"
            cy="12"
            r="3"
            animate={{
              scale: isInhabilitado ? 0 : 1,
              opacity: isInhabilitado ? 0 : 1
            }}
            transition={{ duration: 0.14 }}
          />
          {/* Diagonal Lash when closed */}
          {isInhabilitado && (
            <motion.path
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              exit={{ pathLength: 0, opacity: 0 }}
              transition={{ duration: 0.18 }}
              d="m3 3 18 18"
            />
          )}
        </svg>
      </motion.button>
    </div>
  );
}
