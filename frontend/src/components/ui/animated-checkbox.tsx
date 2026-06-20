import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';

interface AnimatedCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  icon?: React.ReactNode;
  activeColor?: 'blue' | 'purple' | 'emerald';
  className?: string;
}

export function AnimatedCheckbox({
  checked,
  onChange,
  label,
  icon,
  activeColor = 'blue',
  className = ''
}: AnimatedCheckboxProps) {
  const colorMap = {
    blue: {
      checkedBg: 'bg-[#0B84FF] text-white border-[#0B84FF] shadow-[0_6px_18px_rgba(11,132,255,0.32)]',
      checkSquare: 'bg-white text-[#0B84FF]',
      uncheckedSquare: 'border-gray-300 bg-white group-hover:border-[#0B84FF]'
    },
    purple: {
      checkedBg: 'bg-purple-600 text-white border-purple-600 shadow-[0_6px_18px_rgba(147,51,234,0.32)]',
      checkSquare: 'bg-white text-purple-600',
      uncheckedSquare: 'border-gray-300 bg-white group-hover:border-purple-500'
    },
    emerald: {
      checkedBg: 'bg-emerald-600 text-white border-emerald-600 shadow-[0_6px_18px_rgba(16,185,129,0.32)]',
      checkSquare: 'bg-white text-emerald-600',
      uncheckedSquare: 'border-gray-300 bg-white group-hover:border-emerald-500'
    }
  };

  const currentTheme = colorMap[activeColor];

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.94 }}
      whileHover={{ y: -1, scale: 1.01 }}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer select-none group ${
        checked
          ? currentTheme.checkedBg
          : 'bg-white text-gray-700 border-gray-200/90 hover:border-gray-300 hover:bg-gray-50/80 shadow-xs'
      } ${className}`}
    >
      {/* Animated Checkbox Container */}
      <div
        className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all duration-200 shrink-0 ${
          checked
            ? `${currentTheme.checkSquare} border-transparent shadow-xs`
            : `${currentTheme.uncheckedSquare}`
        }`}
      >
        <AnimatePresence>
          {checked && (
            <motion.div
              initial={{ scale: 0, rotate: -45, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0, rotate: 45, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 28 }}
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Optional leading icon */}
      {icon && <span className="shrink-0 transition-transform group-hover:scale-110">{icon}</span>}

      {/* Label */}
      <span className="tracking-tight">{label}</span>
    </motion.button>
  );
}
