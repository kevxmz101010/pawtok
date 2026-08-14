import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Sparkles } from 'lucide-react';

interface DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minDate?: string;
  maxDate?: string;
  disabled?: boolean;
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DAY_NAMES = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'];

export function DatePicker({
  value,
  onChange,
  placeholder = 'Seleccionar fecha',
  className = '',
  minDate,
  maxDate,
  disabled = false
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial selected date or default to current date for view
  const parseDate = (valStr: string) => {
    if (!valStr) return new Date();
    const [y, m, d] = valStr.split('-').map(Number);
    if (!y || !m || !d) return new Date();
    return new Date(y, m - 1, d);
  };

  const selectedDate = value ? parseDate(value) : null;
  const [viewDate, setViewDate] = useState(() => (selectedDate ? new Date(selectedDate) : new Date()));

  // Keep viewDate in sync when value changes externally
  useEffect(() => {
    if (value) {
      setViewDate(parseDate(value));
    }
  }, [value]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();

  const handlePrevMonth = () => {
    setViewDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleSelectDay = (day: number, monthOffset: number = 0) => {
    const targetDate = new Date(currentYear, currentMonth + monthOffset, day);
    const yyyy = targetDate.getFullYear();
    const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
    const dd = String(targetDate.getDate()).padStart(2, '0');
    const formatted = `${yyyy}-${mm}-${dd}`;
    onChange(formatted);
    setIsOpen(false);
  };

  const handleSelectToday = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const formatted = `${yyyy}-${mm}-${dd}`;
    onChange(formatted);
    setViewDate(today);
    setIsOpen(false);
  };

  // Generate matrix of days
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  const prevMonthDays: number[] = [];
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    prevMonthDays.push(daysInPrevMonth - i);
  }

  const currentMonthDays: number[] = [];
  for (let i = 1; i <= daysInCurrentMonth; i++) {
    currentMonthDays.push(i);
  }

  const totalCellsSoFar = prevMonthDays.length + currentMonthDays.length;
  const nextMonthDaysCount = totalCellsSoFar <= 35 ? 35 - totalCellsSoFar : 42 - totalCellsSoFar;
  const nextMonthDays: number[] = [];
  for (let i = 1; i <= nextMonthDaysCount; i++) {
    nextMonthDays.push(i);
  }

  // Format trigger display text
  const formatDisplay = (valStr: string) => {
    if (!valStr) return placeholder;
    const [y, m, d] = valStr.split('-').map(Number);
    if (!y || !m || !d) return valStr;
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const today = new Date();
  const isToday = (day: number) => {
    return (
      today.getDate() === day &&
      today.getMonth() === currentMonth &&
      today.getFullYear() === currentYear
    );
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentMonth &&
      selectedDate.getFullYear() === currentYear
    );
  };

  return (
    <div ref={containerRef} className={`relative inline-block w-full ${className}`}>
      {/* TRIGGER BUTTON */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 rounded-2xl bg-white border border-gray-200 hover:border-[#0B84FF] transition-all flex items-center justify-between text-sm shadow-sm group focus:outline-none focus:ring-2 focus:ring-[#0B84FF]/20 focus:border-[#0B84FF] ${
          disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'cursor-pointer'
        } ${isOpen ? 'border-[#0B84FF] ring-2 ring-[#0B84FF]/20' : ''}`}
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
            value ? 'bg-blue-50 text-[#0B84FF]' : 'bg-gray-50 text-gray-400 group-hover:text-[#0B84FF] group-hover:bg-blue-50'
          }`}>
            <CalendarIcon className="w-4 h-4" />
          </div>
          <span className={`font-semibold truncate ${value ? 'text-gray-900' : 'text-gray-400'}`}>
            {formatDisplay(value)}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0 text-gray-400 group-hover:text-[#0B84FF] transition-colors">
          {value && !disabled && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition"
              title="Limpiar fecha"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
        </div>
      </button>

      {/* POPOVER CALENDAR */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute z-50 mt-2 left-0 w-72 sm:w-80 bg-white/95 backdrop-blur-2xl rounded-[2rem] border border-gray-100 shadow-[0_20px_60px_rgba(11,132,255,0.18)] p-5 select-none"
          >
            {/* CALENDAR HEADER */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-base font-bold text-gray-900 capitalize tracking-tight">
                  {MONTH_NAMES[currentMonth]}
                </h4>
                <p className="text-xs font-semibold text-gray-400">{currentYear}</p>
              </div>

              <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-100">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1.5 hover:bg-white hover:text-[#0B84FF] text-gray-500 rounded-lg transition shadow-none hover:shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1.5 hover:bg-white hover:text-[#0B84FF] text-gray-500 rounded-lg transition shadow-none hover:shadow-sm"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* DAY NAMES HEADER */}
            <div className="grid grid-cols-7 gap-1 mb-2 text-center">
              {DAY_NAMES.map((dayName, idx) => (
                <span key={idx} className="text-[11px] font-bold text-gray-400 uppercase py-1">
                  {dayName}
                </span>
              ))}
            </div>

            {/* DAYS GRID */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {/* PREVIOUS MONTH DAYS */}
              {prevMonthDays.map((d, idx) => (
                <button
                  type="button"
                  key={`prev-${idx}`}
                  onClick={() => handleSelectDay(d, -1)}
                  className="h-9 w-9 mx-auto rounded-xl flex items-center justify-center text-xs text-gray-300 hover:text-gray-500 hover:bg-gray-50 transition"
                >
                  {d}
                </button>
              ))}

              {/* CURRENT MONTH DAYS */}
              {currentMonthDays.map((d) => {
                const active = isSelected(d);
                const current = isToday(d);
                return (
                  <button
                    type="button"
                    key={`curr-${d}`}
                    onClick={() => handleSelectDay(d, 0)}
                    className={`h-9 w-9 mx-auto rounded-xl flex items-center justify-center text-xs font-bold transition-all relative ${
                      active
                        ? 'bg-[#0B84FF] text-white shadow-[0_4px_14px_rgba(11,132,255,0.4)] scale-105 z-10'
                        : current
                        ? 'bg-blue-50 text-[#0B84FF] border border-blue-200 hover:bg-blue-100'
                        : 'text-gray-700 hover:bg-blue-50 hover:text-[#0B84FF]'
                    }`}
                  >
                    {d}
                    {current && !active && (
                      <span className="absolute bottom-1 w-1 h-1 bg-[#0B84FF] rounded-full"></span>
                    )}
                  </button>
                );
              })}

              {/* NEXT MONTH DAYS */}
              {nextMonthDays.map((d, idx) => (
                <button
                  type="button"
                  key={`next-${idx}`}
                  onClick={() => handleSelectDay(d, 1)}
                  className="h-9 w-9 mx-auto rounded-xl flex items-center justify-center text-xs text-gray-300 hover:text-gray-500 hover:bg-gray-50 transition"
                >
                  {d}
                </button>
              ))}
            </div>

            {/* FOOTER ACTIONS */}
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
              <button
                type="button"
                onClick={handleSelectToday}
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#0B84FF] text-xs font-bold rounded-xl transition flex items-center gap-1.5"
              >
                <Sparkles className="w-3 h-3" /> Hoy
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-xs text-gray-400 hover:text-gray-600 font-semibold px-2 py-1"
              >
                Cerrar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
