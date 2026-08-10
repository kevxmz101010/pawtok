import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  isDateDisabled?: (date: Date) => boolean;
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
  disabled = false,
  isDateDisabled: customIsDateDisabled
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'days' | 'months' | 'years'>('days');
  const [hoveredSegment, setHoveredSegment] = useState<'months' | 'years' | null>(null);
  
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const [isPlacementTop, setIsPlacementTop] = useState(false);

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

  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const popoverHeight = 350;
    const popoverWidth = 290;

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    let top = rect.bottom + 6;
    let isTop = false;

    if (spaceBelow < popoverHeight && spaceAbove > spaceBelow) {
      top = Math.max(10, rect.top - popoverHeight - 6);
      isTop = true;
    }

    let left = rect.left;
    if (left + popoverWidth > window.innerWidth - 12) {
      left = window.innerWidth - popoverWidth - 12;
    }
    left = Math.max(12, left);

    setCoords({ top, left });
    setIsPlacementTop(isTop);
  };

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      const handleScrollOrResize = () => updatePosition();
      window.addEventListener('scroll', handleScrollOrResize, { passive: true, capture: true });
      window.addEventListener('resize', handleScrollOrResize);
      return () => {
        window.removeEventListener('scroll', handleScrollOrResize, { capture: true });
        window.removeEventListener('resize', handleScrollOrResize);
      };
    }
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current && !triggerRef.current.contains(target) &&
        popoverRef.current && !popoverRef.current.contains(target)
      ) {
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

  const isDateDisabled = (year: number, month: number, day: number) => {
    const target = new Date(year, month, day);
    target.setHours(0, 0, 0, 0);

    if (minDate) {
      const [minY, minM, minD] = minDate.split('-').map(Number);
      const min = new Date(minY, minM - 1, minD);
      min.setHours(0, 0, 0, 0);
      if (target < min) return true;
    }

    if (maxDate) {
      const [maxY, maxM, maxD] = maxDate.split('-').map(Number);
      const max = new Date(maxY, maxM - 1, maxD);
      max.setHours(0, 0, 0, 0);
      if (target > max) return true;
    }

    if (customIsDateDisabled && customIsDateDisabled(target)) {
      return true;
    }

    return false;
  };

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
    <div className={`relative inline-block w-full ${className}`}>
      {/* TRIGGER BUTTON */}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!isOpen) {
            updatePosition();
          }
          setIsOpen(!isOpen);
          setViewMode('days');
          setHoveredSegment(null);
        }}
        className={`w-full px-4 py-3 rounded-2xl bg-white border border-gray-200 hover:border-[#0B84FF] transition-all flex items-center justify-between text-sm shadow-xs group focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-[#0B84FF] ${
          disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'cursor-pointer'
        } ${isOpen ? 'border-[#0B84FF] ring-4 ring-blue-50' : ''}`}
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

      {/* POPOVER CALENDAR IN PORTAL - SOLVES ALL STACKING CONTEXT & CLIPPING ISSUES */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isOpen && coords && (
            <motion.div
              ref={popoverRef}
              initial={{ opacity: 0, y: isPlacementTop ? -6 : 6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: isPlacementTop ? -6 : 6, scale: 0.98 }}
              transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: 'fixed',
                top: coords.top,
                left: coords.left,
                width: 290,
                zIndex: 99999,
              }}
              className="bg-white rounded-2xl border border-gray-200/90 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.22),0_0_1px_1px_rgba(0,0,0,0.05)] p-3.5 select-none"
              onClick={(e) => e.stopPropagation()}
            >
              {/* CALENDAR HEADER CON SELECTORES DE MES Y AÑO */}
              <div className="flex items-center justify-between mb-2.5">
                <div 
                  onMouseLeave={() => setHoveredSegment(null)}
                  className="flex items-center bg-gray-100/80 p-0.5 rounded-xl relative"
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
                        className="absolute inset-0 bg-[#0B84FF] rounded-lg shadow-xs -z-10"
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
                        className="absolute inset-0 bg-[#0B84FF] rounded-lg shadow-xs -z-10"
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
                    className="p-1 hover:bg-white hover:text-[#0B84FF] text-gray-500 rounded-md transition shadow-none hover:shadow-2xs cursor-pointer"
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
                    className="p-1 hover:bg-white hover:text-[#0B84FF] text-gray-500 rounded-md transition shadow-none hover:shadow-2xs cursor-pointer"
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
                        {prevMonthDays.map((d, idx) => {
                          const disabledDay = isDateDisabled(currentYear, currentMonth - 1, d);
                          return (
                            <button
                              type="button"
                              key={`prev-${idx}`}
                              disabled={disabledDay}
                              onClick={() => !disabledDay && handleSelectDay(d, -1)}
                              className={`h-7 w-7 mx-auto rounded-lg flex items-center justify-center text-[11px] transition ${
                                disabledDay
                                  ? 'text-gray-200 cursor-not-allowed opacity-30'
                                  : 'text-gray-300 hover:text-gray-500 hover:bg-gray-50 cursor-pointer'
                              }`}
                            >
                              {d}
                            </button>
                          );
                        })}

                        {/* CURRENT MONTH DAYS */}
                        {currentMonthDays.map((d) => {
                          const active = isSelected(d);
                          const current = isToday(d);
                          const disabledDay = isDateDisabled(currentYear, currentMonth, d);
                          return (
                            <motion.button
                              whileHover={disabledDay ? {} : { scale: 1.15 }}
                              whileTap={disabledDay ? {} : { scale: 0.88 }}
                              transition={{ type: "spring", stiffness: 450, damping: 18 }}
                              type="button"
                              key={`curr-${d}`}
                              disabled={disabledDay}
                              onClick={() => !disabledDay && handleSelectDay(d, 0)}
                              className={`h-7 w-7 mx-auto rounded-lg flex items-center justify-center text-[11px] font-bold transition-colors ${
                                disabledDay
                                  ? 'text-gray-300 cursor-not-allowed opacity-35 bg-gray-50/50'
                                  : active
                                  ? 'bg-[#0B84FF] text-white shadow-[0_2px_8px_rgba(11,132,255,0.4)] z-10 cursor-pointer'
                                  : current
                                  ? 'bg-blue-50 text-[#0B84FF] border border-blue-200 hover:bg-blue-100 cursor-pointer'
                                  : 'text-gray-700 hover:bg-blue-50 hover:text-[#0B84FF] cursor-pointer'
                              }`}
                            >
                              {d}
                            </motion.button>
                          );
                        })}

                        {/* NEXT MONTH DAYS */}
                        {nextMonthDays.map((d, idx) => {
                          const disabledDay = isDateDisabled(currentYear, currentMonth + 1, d);
                          return (
                            <button
                              type="button"
                              key={`next-${idx}`}
                              disabled={disabledDay}
                              onClick={() => !disabledDay && handleSelectDay(d, 1)}
                              className={`h-7 w-7 mx-auto rounded-lg flex items-center justify-center text-[11px] transition ${
                                disabledDay
                                  ? 'text-gray-200 cursor-not-allowed opacity-30'
                                  : 'text-gray-300 hover:text-gray-500 hover:bg-gray-50 cursor-pointer'
                              }`}
                            >
                              {d}
                            </button>
                          );
                        })}
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
                                ? 'bg-[#0B84FF] text-white shadow-xs ring-2 ring-[#0B84FF]/20'
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
                                  ? 'bg-[#0B84FF] text-white shadow-xs ring-2 ring-[#0B84FF]/20'
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
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
