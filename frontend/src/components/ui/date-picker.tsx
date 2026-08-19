import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';

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
  const [viewMode, setViewMode] = useState<'days' | 'months' | 'years'>('days');
  const [hoveredSegment, setHoveredSegment] = useState<'months' | 'years' | null>(null);
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

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();

  // Decade base for years view (12 years grid)
  const [decadeStart, setDecadeStart] = useState(() => Math.floor(currentYear / 12) * 12);

  // Keep viewDate in sync when value changes externally
  useEffect(() => {
    if (value) {
      const d = parseDate(value);
      setViewDate(d);
      setDecadeStart(Math.floor(d.getFullYear() / 12) * 12);
    }
  }, [value]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setViewMode('days');
        setHoveredSegment(null);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handlePrev = () => {
    if (viewMode === 'days') {
      setViewDate(new Date(currentYear, currentMonth - 1, 1));
    } else if (viewMode === 'months') {
      setViewDate(new Date(currentYear - 1, currentMonth, 1));
    } else if (viewMode === 'years') {
      setDecadeStart(prev => prev - 12);
    }
  };

  const handleNext = () => {
    if (viewMode === 'days') {
      setViewDate(new Date(currentYear, currentMonth + 1, 1));
    } else if (viewMode === 'months') {
      setViewDate(new Date(currentYear + 1, currentMonth, 1));
    } else if (viewMode === 'years') {
      setDecadeStart(prev => prev + 12);
    }
  };

  const handleSelectDay = (day: number, monthOffset: number = 0) => {
    const targetDate = new Date(currentYear, currentMonth + monthOffset, day);
    const yyyy = targetDate.getFullYear();
    const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
    const dd = String(targetDate.getDate()).padStart(2, '0');
    const formatted = `${yyyy}-${mm}-${dd}`;
    onChange(formatted);
    setIsOpen(false);
    setViewMode('days');
    setHoveredSegment(null);
  };

  const handleSelectMonth = (monthIndex: number) => {
    setViewDate(new Date(currentYear, monthIndex, 1));
    setViewMode('days');
    setHoveredSegment(null);
  };

  const handleSelectYear = (year: number) => {
    setViewDate(new Date(year, currentMonth, 1));
    setViewMode('months');
    setHoveredSegment(null);
  };

  const handleSelectToday = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const formatted = `${yyyy}-${mm}-${dd}`;
    onChange(formatted);
    setViewDate(today);
    setDecadeStart(Math.floor(yyyy / 12) * 12);
    setIsOpen(false);
    setViewMode('days');
    setHoveredSegment(null);
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

  // Active segment for pill highlight (hover takes dynamic priority)
  const activeSegment = hoveredSegment || (viewMode === 'months' ? 'months' : viewMode === 'years' ? 'years' : null);

  // Years array for decade view (12 years)
  const yearsList = Array.from({ length: 12 }, (_, i) => decadeStart + i);

  return (
    <div ref={containerRef} className={`relative inline-block w-full ${className}`}>
      {/* TRIGGER BUTTON */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          setIsOpen(!isOpen);
          setViewMode('days');
          setHoveredSegment(null);
        }}
        className={`w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-200 hover:border-[#0B84FF] transition-all flex items-center justify-between text-sm shadow-sm group focus:outline-none focus:ring-2 focus:ring-[#0B84FF]/20 focus:border-[#0B84FF] ${
          disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'cursor-pointer'
        } ${isOpen ? 'border-[#0B84FF] ring-2 ring-[#0B84FF]/20' : ''}`}
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
            value ? 'bg-blue-50 text-[#0B84FF]' : 'bg-gray-50 text-gray-400 group-hover:text-[#0B84FF] group-hover:bg-blue-50'
          }`}>
            <CalendarIcon className="w-3.5 h-3.5" />
          </div>
          <span className={`font-semibold text-xs sm:text-sm truncate ${value ? 'text-gray-900' : 'text-gray-400'}`}>
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
              className="p-1 hover:bg-gray-100 rounded-md text-gray-400 hover:text-gray-600 transition"
              title="Limpiar fecha"
            >
              <X className="w-3 h-3" />
            </span>
          )}
        </div>
      </button>

      {/* POPOVER CALENDAR (COMPACT & CHIC WITH ROCK-SOLID HEIGHT & BOUNCY SEGMENTS) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: 'top left' }}
            className="absolute z-50 mt-1.5 left-0 w-[280px] bg-white/95 backdrop-blur-2xl rounded-[1.5rem] border border-gray-100 shadow-[0_16px_40px_rgba(11,132,255,0.14)] p-3.5 select-none"
          >
            {/* CALENDAR HEADER CON SELECTORES DE MES Y AÑO */}
            <div className="flex items-center justify-between mb-2.5">
              <div 
                onMouseLeave={() => setHoveredSegment(null)}
                className="flex items-center bg-gray-100/70 p-0.5 rounded-xl relative"
              >
                {/* Botón Mes Interactivo */}
                <button
                  type="button"
                  onMouseEnter={() => setHoveredSegment('months')}
                  onClick={() => setViewMode(viewMode === 'months' ? 'days' : 'months')}
                  className="relative z-10 px-2.5 py-1 text-xs font-bold transition-colors cursor-pointer"
                  title="Cambiar mes rápidamente"
                >
                  <span className={`transition-colors duration-150 ${
                    activeSegment === 'months' ? 'text-white' : 'text-gray-800 hover:text-[#0B84FF]'
                  }`}>
                    {MONTH_NAMES[currentMonth]}
                  </span>
                  {activeSegment === 'months' && (
                    <motion.div
                      layoutId="activePickerSegment"
                      transition={{
                        type: "spring",
                        stiffness: 550,
                        damping: 30,
                        mass: 0.7
                      }}
                      className="absolute inset-0 bg-[#0B84FF] rounded-lg shadow-sm -z-10"
                    />
                  )}
                </button>

                {/* Botón Año Interactivo */}
                <button
                  type="button"
                  onMouseEnter={() => setHoveredSegment('years')}
                  onClick={() => {
                    setDecadeStart(Math.floor(currentYear / 12) * 12);
                    setViewMode(viewMode === 'years' ? 'days' : 'years');
                  }}
                  className="relative z-10 px-2.5 py-1 text-xs font-bold transition-colors cursor-pointer"
                  title="Cambiar año rápidamente"
                >
                  <span className={`transition-colors duration-150 ${
                    activeSegment === 'years' ? 'text-white' : 'text-gray-600 hover:text-[#0B84FF]'
                  }`}>
                    {viewMode === 'years' ? `${decadeStart} - ${decadeStart + 11}` : currentYear}
                  </span>
                  {activeSegment === 'years' && (
                    <motion.div
                      layoutId="activePickerSegment"
                      transition={{
                        type: "spring",
                        stiffness: 550,
                        damping: 30,
                        mass: 0.7
                      }}
                      className="absolute inset-0 bg-[#0B84FF] rounded-lg shadow-sm -z-10"
                    />
                  )}
                </button>
              </div>

              {/* Botones Prev / Next */}
              <div className="flex items-center gap-0.5 bg-gray-50 p-0.5 rounded-lg border border-gray-100">
                <motion.button
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.88 }}
                  transition={{ type: "spring", stiffness: 450, damping: 18 }}
                  type="button"
                  onClick={handlePrev}
                  className="p-1 hover:bg-white hover:text-[#0B84FF] text-gray-500 rounded-md transition shadow-none hover:shadow-xs cursor-pointer"
                  title={viewMode === 'years' ? 'Década anterior' : viewMode === 'months' ? 'Año anterior' : 'Mes anterior'}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.88 }}
                  transition={{ type: "spring", stiffness: 450, damping: 18 }}
                  type="button"
                  onClick={handleNext}
                  className="p-1 hover:bg-white hover:text-[#0B84FF] text-gray-500 rounded-md transition shadow-none hover:shadow-xs cursor-pointer"
                  title={viewMode === 'years' ? 'Década siguiente' : viewMode === 'months' ? 'Año siguiente' : 'Mes siguiente'}
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            </div>

            {/* CONTENEDOR ESTABLE DE VISTAS (ALTURA FIJA PARA EVITAR DESPLAZAMIENTOS) */}
            <div className="min-h-[212px] flex flex-col justify-start">
              <AnimatePresence mode="wait">
                {/* VISTA 1: DÍAS (DEFAULT) */}
                {viewMode === 'days' && (
                  <motion.div
                    key="days-view"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.12 }}
                  >
                    {/* DAY NAMES HEADER */}
                    <div className="grid grid-cols-7 gap-0.5 mb-1.5 text-center">
                      {DAY_NAMES.map((dayName, idx) => (
                        <span key={idx} className="text-[10px] font-bold text-gray-400 uppercase py-0.5">
                          {dayName}
                        </span>
                      ))}
                    </div>

                    {/* DAYS GRID */}
                    <div className="grid grid-cols-7 gap-0.5 text-center">
                      {/* PREVIOUS MONTH DAYS */}
                      {prevMonthDays.map((d, idx) => (
                        <motion.button
                          whileTap={{ scale: 0.90 }}
                          type="button"
                          key={`prev-${idx}`}
                          onClick={() => handleSelectDay(d, -1)}
                          className="h-7 w-7 mx-auto rounded-lg flex items-center justify-center text-[11px] text-gray-300 hover:text-gray-500 hover:bg-gray-50 transition cursor-pointer"
                        >
                          {d}
                        </motion.button>
                      ))}

                      {/* CURRENT MONTH DAYS */}
                      {currentMonthDays.map((d) => {
                        const active = isSelected(d);
                        const current = isToday(d);
                        return (
                          <motion.button
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.88 }}
                            transition={{ type: "spring", stiffness: 450, damping: 18 }}
                            type="button"
                            key={`curr-${d}`}
                            onClick={() => handleSelectDay(d, 0)}
                            className={`h-7 w-7 mx-auto rounded-lg flex items-center justify-center text-[11px] font-bold cursor-pointer transition-colors ${
                              active
                                ? 'bg-[#0B84FF] text-white shadow-[0_2px_8px_rgba(11,132,255,0.4)] z-10'
                                : current
                                ? 'bg-blue-50 text-[#0B84FF] border border-blue-200 hover:bg-blue-100'
                                : 'text-gray-700 hover:bg-blue-50 hover:text-[#0B84FF]'
                            }`}
                          >
                            {d}
                          </motion.button>
                        );
                      })}

                      {/* NEXT MONTH DAYS */}
                      {nextMonthDays.map((d, idx) => (
                        <motion.button
                          whileTap={{ scale: 0.90 }}
                          type="button"
                          key={`next-${idx}`}
                          onClick={() => handleSelectDay(d, 1)}
                          className="h-7 w-7 mx-auto rounded-lg flex items-center justify-center text-[11px] text-gray-300 hover:text-gray-500 hover:bg-gray-50 transition cursor-pointer"
                        >
                          {d}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* VISTA 2: MESES (SELECCIÓN RÁPIDA DE 12 MESES) */}
                {viewMode === 'months' && (
                  <motion.div
                    key="months-view"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.12 }}
                    className="grid grid-cols-3 gap-2 py-2"
                  >
                    {MONTH_NAMES.map((mName, mIdx) => {
                      const isCurrentMonth = mIdx === currentMonth;
                      return (
                        <motion.button
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.90 }}
                          transition={{ type: "spring", stiffness: 400, damping: 18 }}
                          type="button"
                          key={mName}
                          onClick={() => handleSelectMonth(mIdx)}
                          className={`py-2.5 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isCurrentMonth
                              ? 'bg-[#0B84FF] text-white shadow-sm ring-2 ring-[#0B84FF]/20'
                              : 'bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-[#0B84FF]'
                          }`}
                        >
                          {mName.slice(0, 3)}
                        </motion.button>
                      );
                    })}
                  </motion.div>
                )}

                {/* VISTA 3: AÑOS (SELECCIÓN RÁPIDA DE AÑOS POR DÉCADA) */}
                {viewMode === 'years' && (
                  <motion.div
                    key={`years-view-${decadeStart}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.12 }}
                    className="space-y-2 py-1"
                  >
                    <div className="grid grid-cols-3 gap-2">
                      {yearsList.map((yr) => {
                        const isCurrentYear = yr === currentYear;
                        return (
                          <motion.button
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.90 }}
                            transition={{ type: "spring", stiffness: 400, damping: 18 }}
                            type="button"
                            key={yr}
                            onClick={() => handleSelectYear(yr)}
                            className={`py-2.5 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              isCurrentYear
                                ? 'bg-[#0B84FF] text-white shadow-sm ring-2 ring-[#0B84FF]/20'
                                : 'bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-[#0B84FF]'
                            }`}
                          >
                            {yr}
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* FOOTER ACTIONS */}
            <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                type="button"
                onClick={handleSelectToday}
                className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-[#0B84FF] text-[11px] font-bold rounded-lg transition cursor-pointer"
              >
                Hoy
              </motion.button>

              <button
                type="button"
                onClick={() => {
                  if (viewMode !== 'days') {
                    setViewMode('days');
                    setHoveredSegment(null);
                  } else {
                    setIsOpen(false);
                  }
                }}
                className="text-[11px] text-gray-400 hover:text-gray-600 font-semibold px-2 py-0.5 cursor-pointer"
              >
                {viewMode !== 'days' ? 'Volver a días' : 'Cerrar'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
