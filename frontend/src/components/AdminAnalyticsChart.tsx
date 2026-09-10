import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, Users, PawPrint, Building2, Calendar, 
  Sparkles, ArrowUpRight, BarChart3, Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminAnalyticsChartProps {
  usuarios: any[];
  mascotas: any[];
  refugios: any[];
}

type Timeframe = 'dia' | 'semana' | 'mes';
type SeriesType = 'todos' | 'usuarios' | 'mascotas' | 'refugios';

interface DataPoint {
  label: string;
  fullDate: string;
  usuarios: number;
  mascotas: number;
  refugios: number;
  total: number;
}

export default function AdminAnalyticsChart({
  usuarios,
  mascotas,
  refugios,
}: AdminAnalyticsChartProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>('dia');
  const [activeSeries, setActiveSeries] = useState<SeriesType>('todos');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Helper para extraer fecha válida (YYYY-MM-DD)
  const parseDateStr = (dateVal: any): string | null => {
    if (!dateVal) return null;
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return null;
      return d.toISOString().split('T')[0];
    } catch {
      return null;
    }
  };

  // Agrupación reactiva según temporalidad
  const chartData = useMemo<DataPoint[]>(() => {
    const today = new Date();
    const result: DataPoint[] = [];

    if (timeframe === 'dia') {
      // Últimos 14 días
      for (let i = 13; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const iso = d.toISOString().split('T')[0];
        const dayNum = d.getDate();
        const monthShort = d.toLocaleDateString('es-ES', { month: 'short' });
        const label = i === 0 ? 'Hoy' : `${dayNum} ${monthShort}`;

        // Contar específicamente adoptantes (rol USUARIO o por defecto)
        const uCount = usuarios.filter(u => parseDateStr(u.creadoEn || u.fechaRegistro) === iso && (u.rol === 'USUARIO' || !u.rol)).length;
        const mCount = mascotas.filter(m => parseDateStr(m.creadoEn || m.fechaPublicacion) === iso).length;
        const rCount = refugios.filter(r => parseDateStr(r.creadoEn) === iso).length;

        result.push({
          label,
          fullDate: d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'long' }),
          usuarios: uCount,
          mascotas: mCount,
          refugios: rCount,
          total: uCount + mCount + rCount,
        });
      }
    } else if (timeframe === 'semana') {
      // Últimas 8 semanas
      for (let i = 7; i >= 0; i--) {
        const endDay = new Date(today);
        endDay.setDate(today.getDate() - i * 7);
        const startDay = new Date(endDay);
        startDay.setDate(endDay.getDate() - 6);

        const startIso = startDay.toISOString().split('T')[0];
        const endIso = endDay.toISOString().split('T')[0];

        const label = i === 0 ? 'Esta Sem' : `Sem -${i}`;
        const fullDate = `${startDay.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} - ${endDay.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}`;

        const inRange = (dStr: any) => {
          const iso = parseDateStr(dStr);
          return iso && iso >= startIso && iso <= endIso;
        };

        const uCount = usuarios.filter(u => inRange(u.creadoEn || u.fechaRegistro) && (u.rol === 'USUARIO' || !u.rol)).length;
        const mCount = mascotas.filter(m => inRange(m.creadoEn || m.fechaPublicacion)).length;
        const rCount = refugios.filter(r => inRange(r.creadoEn)).length;

        result.push({
          label,
          fullDate,
          usuarios: uCount,
          mascotas: mCount,
          refugios: rCount,
          total: uCount + mCount + rCount,
        });
      }
    } else {
      // Últimos 6 meses
      for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const prefix = `${year}-${month}`;
        const monthName = d.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });

        const inMonth = (dStr: any) => {
          const iso = parseDateStr(dStr);
          return iso && iso.startsWith(prefix);
        };

        const uCount = usuarios.filter(u => inMonth(u.creadoEn || u.fechaRegistro) && (u.rol === 'USUARIO' || !u.rol)).length;
        const mCount = mascotas.filter(m => inMonth(m.creadoEn || m.fechaPublicacion)).length;
        const rCount = refugios.filter(r => inMonth(r.creadoEn)).length;

        result.push({
          label: monthName,
          fullDate: d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
          usuarios: uCount,
          mascotas: mCount,
          refugios: rCount,
          total: uCount + mCount + rCount,
        });
      }
    }

    return result;
  }, [timeframe, usuarios, mascotas, refugios]);

  // Totales en el rango visible
  const totals = useMemo(() => {
    return chartData.reduce(
      (acc, item) => ({
        adoptantes: acc.adoptantes + item.usuarios,
        mascotas: acc.mascotas + item.mascotas,
        refugios: acc.refugios + item.refugios,
        total: acc.total + item.total,
      }),
      { adoptantes: 0, mascotas: 0, refugios: 0, total: 0 }
    );
  }, [chartData]);

  // Dimensiones del gráfico SVG
  const width = 800;
  const height = 260;
  const padLeft = 45;
  const padRight = 25;
  const padTop = 30;
  const padBottom = 40;
  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  // Valor máximo dinámico para la escala Y
  const maxVal = useMemo(() => {
    let max = 1;
    chartData.forEach(d => {
      if (activeSeries === 'todos') {
        max = Math.max(max, d.usuarios, d.mascotas, d.refugios, d.total);
      } else if (activeSeries === 'usuarios') {
        max = Math.max(max, d.usuarios);
      } else if (activeSeries === 'mascotas') {
        max = Math.max(max, d.mascotas);
      } else if (activeSeries === 'refugios') {
        max = Math.max(max, d.refugios);
      }
    });
    return Math.max(5, Math.ceil(max * 1.25));
  }, [chartData, activeSeries]);

  const getCoordinates = (seriesKey: 'usuarios' | 'mascotas' | 'refugios' | 'total') => {
    return chartData.map((d, i) => {
      const x = padLeft + (i / (chartData.length - 1 || 1)) * chartW;
      const val = d[seriesKey];
      const y = height - padBottom - (val / maxVal) * chartH;
      return { x, y, val };
    });
  };

  // Construir curvatura suave (Spline Bezier)
  const buildSmoothPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      const controlX = (current.x + next.x) / 2;
      path += ` C ${controlX} ${current.y}, ${controlX} ${next.y}, ${next.x} ${next.y}`;
    }
    return path;
  };

  const buildAreaPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return '';
    const linePath = buildSmoothPath(points);
    const last = points[points.length - 1];
    const first = points[0];
    const baselineY = height - padBottom;
    return `${linePath} L ${last.x} ${baselineY} L ${first.x} ${baselineY} Z`;
  };

  const ptsUsuarios = useMemo(() => getCoordinates('usuarios'), [chartData, maxVal]);
  const ptsMascotas = useMemo(() => getCoordinates('mascotas'), [chartData, maxVal]);
  const ptsRefugios = useMemo(() => getCoordinates('refugios'), [chartData, maxVal]);

  const yTicks = [0, Math.round(maxVal / 2), maxVal];

  const baselineY = height - padBottom;
  const baselinePts = useMemo(() => {
    return chartData.map((_, i) => {
      const x = padLeft + (i / (chartData.length - 1 || 1)) * chartW;
      return { x, y: baselineY, val: 0 };
    });
  }, [chartData, baselineY, chartW, padLeft]);

  const baselineLinePath = useMemo(() => buildSmoothPath(baselinePts), [baselinePts]);
  const baselineAreaPath = useMemo(() => buildAreaPath(baselinePts), [baselinePts]);

  const isUsuariosUp = activeSeries === 'todos' || activeSeries === 'usuarios';
  const isMascotasUp = activeSeries === 'todos' || activeSeries === 'mascotas';
  const isRefugiosUp = activeSeries === 'todos' || activeSeries === 'refugios';

  const mountainTransition = {
    type: 'spring' as const,
    stiffness: 220,
    damping: 22,
    bounce: 0.38,
  };

  const seriesOptions: { id: SeriesType; label: string; dot: string }[] = [
    { id: 'todos', label: 'General', dot: '' },
    { id: 'usuarios', label: 'Adoptantes', dot: 'bg-[#0B84FF]' },
    { id: 'mascotas', label: 'Mascotas', dot: 'bg-orange-500' },
    { id: 'refugios', label: 'Refugios', dot: 'bg-purple-500' },
  ];

  const timeframeOptions: { id: Timeframe; label: string }[] = [
    { id: 'dia', label: 'Día' },
    { id: 'semana', label: 'Semana' },
    { id: 'mes', label: 'Mes' },
  ];

  return (
    <div className="bg-white/90 backdrop-blur-xl border border-gray-100/80 rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.04)] overflow-hidden mb-10">
      {/* CABECERA DEL DASHBOARD DE ANALÍTICA */}
      <div className="p-6 sm:p-8 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0B84FF] to-blue-400 text-white flex items-center justify-center shadow-md shadow-[#0B84FF]/20 shrink-0">
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-xl text-gray-900 tracking-tight">Analítica y Crecimiento</h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-[#0B84FF] uppercase tracking-wider">
                En Vivo
              </span>
            </div>
            <p className="text-xs text-gray-400 font-medium mt-0.5">
              Visualiza el ritmo de ingresos de adoptantes, registro de mascotas y refugios
            </p>
          </div>
        </div>

        {/* SELECTORES: SERIE + TEMPORALIDAD CON SLIDER BOUNCY */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Selector de Serie con Layout animado */}
          <div className="flex items-center bg-gray-100/80 p-1 rounded-2xl gap-0.5 relative">
            {seriesOptions.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveSeries(s.id)}
                className={`relative z-10 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 select-none ${
                  activeSeries === s.id ? 'text-gray-900 font-extrabold' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {activeSeries === s.id && (
                  <motion.div
                    layoutId="activeSeriesPill"
                    className="absolute inset-0 bg-white rounded-xl shadow-xs -z-10"
                    transition={{ type: 'spring', stiffness: 420, damping: 26, bounce: 0.35 }}
                  />
                )}
                {s.dot && <span className={`w-2 h-2 rounded-full ${s.dot}`} />}
                <span>{s.label}</span>
              </button>
            ))}
          </div>

          {/* Selector de Granularidad Temporal: Día / Semana / Mes */}
          <div className="flex items-center bg-gray-100/80 p-1 rounded-2xl gap-0.5 border border-gray-200/50 relative">
            {timeframeOptions.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTimeframe(t.id)}
                className={`relative z-10 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-colors cursor-pointer select-none ${
                  timeframe === t.id ? 'text-white font-black' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {timeframe === t.id && (
                  <motion.div
                    layoutId="activeTimeframePill"
                    className="absolute inset-0 bg-[#0B84FF] rounded-xl shadow-sm shadow-[#0B84FF]/25 -z-10"
                    transition={{ type: 'spring', stiffness: 420, damping: 26, bounce: 0.35 }}
                  />
                )}
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CUADRÍCULA FLUIDA ADAPTABLE CON BOUNCE FLUIDO HERMOSO */}
      <motion.div 
        layout
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 24,
          bounce: 0.38
        }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 p-6 sm:px-8 bg-gray-50/50 border-b border-gray-100"
      >
        {/* CARD 1: ADOPTANTES */}
        <motion.div
          layout
          key="card-adoptantes"
          transition={{ type: "spring", stiffness: 300, damping: 24, bounce: 0.38 }}
          onClick={() => setActiveSeries(activeSeries === 'usuarios' ? 'todos' : 'usuarios')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden select-none ${
            activeSeries === 'usuarios'
              ? 'sm:col-span-2 bg-gradient-to-br from-blue-50/90 via-white to-white border-blue-200 shadow-md shadow-blue-500/10 ring-2 ring-[#0B84FF]/40'
              : 'bg-white border-gray-100 shadow-2xs hover:border-blue-200 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0B84FF] shadow-xs" />
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                {activeSeries === 'usuarios' ? `Adoptantes en Foco (${timeframe})` : `Adoptantes (${timeframe})`}
              </span>
            </div>
            {activeSeries === 'usuarios' ? (
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-[#0B84FF] text-[10px] font-extrabold uppercase">
                Activo
              </span>
            ) : (
              <span className="text-[10px] text-gray-400 font-medium">Ver serie</span>
            )}
          </div>

          <div className="flex items-baseline gap-3 mt-2">
            <motion.div 
              key={`val-u-${totals.adoptantes}`}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 450, damping: 20 }}
              className="text-3xl font-black text-gray-900 tracking-tight"
            >
              +{totals.adoptantes}
            </motion.div>
            {activeSeries === 'usuarios' && (
              <span className="text-xs font-bold text-[#0B84FF]">
                {totals.adoptantes === 0 
                  ? 'Sin registros recientes' 
                  : `${(totals.adoptantes / (timeframe === 'dia' ? 14 : timeframe === 'semana' ? 8 : 6)).toFixed(1)} prom/${timeframe === 'dia' ? 'día' : timeframe === 'semana' ? 'sem' : 'mes'}`}
              </span>
            )}
          </div>

          <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 font-medium">
            <span>Cuentas particulares</span>
            <span className="text-gray-400 text-[10px]">
              Total: {usuarios.filter(u => u.rol === 'USUARIO' || !u.rol).length}
            </span>
          </div>
        </motion.div>

        {/* CARD 2: MASCOTAS */}
        <motion.div
          layout
          key="card-mascotas"
          transition={{ type: "spring", stiffness: 300, damping: 24, bounce: 0.38 }}
          onClick={() => setActiveSeries(activeSeries === 'mascotas' ? 'todos' : 'mascotas')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden select-none ${
            activeSeries === 'mascotas'
              ? 'sm:col-span-2 bg-gradient-to-br from-orange-50/90 via-white to-white border-orange-200 shadow-md shadow-orange-500/10 ring-2 ring-orange-500/40'
              : 'bg-white border-gray-100 shadow-2xs hover:border-orange-200 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-xs" />
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                {activeSeries === 'mascotas' ? `Mascotas en Foco (${timeframe})` : `Mascotas (${timeframe})`}
              </span>
            </div>
            {activeSeries === 'mascotas' ? (
              <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 text-[10px] font-extrabold uppercase">
                Activo
              </span>
            ) : (
              <span className="text-[10px] text-gray-400 font-medium">Ver serie</span>
            )}
          </div>

          <div className="flex items-baseline gap-3 mt-2">
            <motion.div 
              key={`val-m-${totals.mascotas}`}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 450, damping: 20 }}
              className="text-3xl font-black text-gray-900 tracking-tight"
            >
              +{totals.mascotas}
            </motion.div>
            {activeSeries === 'mascotas' && (
              <span className="text-xs font-bold text-orange-600">
                {totals.mascotas === 0 
                  ? 'Sin registros recientes' 
                  : `${(totals.mascotas / (timeframe === 'dia' ? 14 : timeframe === 'semana' ? 8 : 6)).toFixed(1)} prom/${timeframe === 'dia' ? 'día' : timeframe === 'semana' ? 'sem' : 'mes'}`}
              </span>
            )}
          </div>

          <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 font-medium">
            <span>Publicadas por refugios</span>
            <span className="text-gray-400 text-[10px]">
              Total: {mascotas.length}
            </span>
          </div>
        </motion.div>

        {/* CARD 3: REFUGIOS */}
        <motion.div
          layout
          key="card-refugios"
          transition={{ type: "spring", stiffness: 300, damping: 24, bounce: 0.38 }}
          onClick={() => setActiveSeries(activeSeries === 'refugios' ? 'todos' : 'refugios')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden select-none ${
            activeSeries === 'refugios'
              ? 'sm:col-span-2 bg-gradient-to-br from-purple-50/90 via-white to-white border-purple-200 shadow-md shadow-purple-500/10 ring-2 ring-purple-500/40'
              : 'bg-white border-gray-100 shadow-2xs hover:border-purple-200 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-xs" />
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                {activeSeries === 'refugios' ? `Refugios en Foco (${timeframe})` : `Refugios (${timeframe})`}
              </span>
            </div>
            {activeSeries === 'refugios' ? (
              <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-extrabold uppercase">
                Activo
              </span>
            ) : (
              <span className="text-[10px] text-gray-400 font-medium">Ver serie</span>
            )}
          </div>

          <div className="flex items-baseline gap-3 mt-2">
            <motion.div 
              key={`val-r-${totals.refugios}`}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 450, damping: 20 }}
              className="text-3xl font-black text-gray-900 tracking-tight"
            >
              +{totals.refugios}
            </motion.div>
            {activeSeries === 'refugios' && (
              <span className="text-xs font-bold text-purple-600">
                {totals.refugios === 0 
                  ? 'Sin registros recientes' 
                  : `${(totals.refugios / (timeframe === 'dia' ? 14 : timeframe === 'semana' ? 8 : 6)).toFixed(1)} prom/${timeframe === 'dia' ? 'día' : timeframe === 'semana' ? 'sem' : 'mes'}`}
              </span>
            )}
          </div>

          <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 font-medium">
            <span>Organizaciones aliadas</span>
            <span className="text-gray-400 text-[10px]">
              Total: {refugios.length}
            </span>
          </div>
        </motion.div>

        {/* CARD 4: PICO DE ACTIVIDAD */}
        <motion.div
          layout
          key="card-pico"
          transition={{ type: "spring", stiffness: 300, damping: 24, bounce: 0.38 }}
          className="p-4 rounded-2xl bg-white border border-gray-100 shadow-2xs select-none"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Pico Actividad</span>
            <ArrowUpRight size={15} className="text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-emerald-600 mt-2">
            {Math.max(0, ...chartData.map(d => (
              activeSeries === 'usuarios' ? d.usuarios :
              activeSeries === 'mascotas' ? d.mascotas :
              activeSeries === 'refugios' ? d.refugios :
              d.total
            )))}
          </div>
          <div className="mt-2 pt-2 border-t border-gray-100 text-[11px] text-gray-400 font-medium truncate">
            {activeSeries === 'todos' ? 'Máx movimientos combinados' : `Máx registros de ${activeSeries === 'usuarios' ? 'adoptantes' : activeSeries}`}
          </div>
        </motion.div>
      </motion.div>

      {/* ÁREA DE GRÁFICA SVG */}
      <div className="p-6 sm:p-8 relative">
        {/* Tooltip Dinámico Flotante */}
        {hoveredIdx !== null && chartData[hoveredIdx] && (
          <div 
            className="absolute z-20 pointer-events-none bg-gray-900/95 backdrop-blur-md text-white p-3 rounded-2xl shadow-xl border border-gray-800 text-xs min-w-[170px] transform -translate-x-1/2 -translate-y-full transition-all duration-75"
            style={{
              left: `${(ptsUsuarios[hoveredIdx]?.x / width) * 100}%`,
              top: '40px',
            }}
          >
            <div className="font-bold text-gray-300 text-[11px] pb-1.5 border-b border-gray-800 mb-1.5">
              {chartData[hoveredIdx].fullDate}
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-1.5 text-blue-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#0B84FF]" /> Adoptantes:
                </span>
                <strong className="font-extrabold">{chartData[hoveredIdx].usuarios}</strong>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-1.5 text-orange-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-orange-500" /> Mascotas:
                </span>
                <strong className="font-extrabold">{chartData[hoveredIdx].mascotas}</strong>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-1.5 text-purple-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-purple-500" /> Refugios:
                </span>
                <strong className="font-extrabold">{chartData[hoveredIdx].refugios}</strong>
              </div>
            </div>
          </div>
        )}

        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto min-w-[650px] overflow-visible"
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <defs>
              {/* Degradados para el área bajo la curva */}
              <linearGradient id="gradientUsuarios" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0B84FF" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#0B84FF" stopOpacity="0.0" />
              </linearGradient>

              <linearGradient id="gradientMascotas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF9500" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#FF9500" stopOpacity="0.0" />
              </linearGradient>

              <linearGradient id="gradientRefugios" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#AF52DE" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#AF52DE" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Líneas Guía Horizontales */}
            {yTicks.map((tick, i) => {
              const y = height - padBottom - (tick / maxVal) * chartH;
              return (
                <g key={i}>
                  <line
                    x1={padLeft}
                    y1={y}
                    x2={width - padRight}
                    y2={y}
                    stroke="#E5E7EB"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                  <text
                    x={padLeft - 10}
                    y={y + 4}
                    textAnchor="end"
                    className="text-[10px] fill-gray-400 font-semibold"
                  >
                    {tick}
                  </text>
                </g>
              );
            })}

            {/* Línea vertical de tracking hover */}
            {hoveredIdx !== null && ptsUsuarios[hoveredIdx] && (
              <line
                x1={ptsUsuarios[hoveredIdx].x}
                y1={padTop}
                x2={ptsUsuarios[hoveredIdx].x}
                y2={height - padBottom}
                stroke="#94A3B8"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
            )}

            {/* SERIE: ADOPTANTES (Azul) - MONTAÑA ANIMADA QUE SUBE Y BAJA */}
            <g key={`group-usuarios-${timeframe}`}>
              <motion.path
                key={`area-u-${timeframe}`}
                animate={{
                  d: isUsuariosUp ? buildAreaPath(ptsUsuarios) : baselineAreaPath,
                  opacity: isUsuariosUp ? (activeSeries === 'usuarios' ? 0.95 : 0.75) : 0,
                }}
                transition={mountainTransition}
                fill="url(#gradientUsuarios)"
                className="pointer-events-none"
              />
              <motion.path
                key={`line-u-${timeframe}`}
                animate={{
                  d: isUsuariosUp ? buildSmoothPath(ptsUsuarios) : baselineLinePath,
                  opacity: isUsuariosUp ? 1 : 0,
                  strokeWidth: activeSeries === 'usuarios' ? 3.8 : 2.4,
                }}
                transition={mountainTransition}
                fill="none"
                stroke="#0B84FF"
                strokeLinecap="round"
                style={{
                  filter: activeSeries === 'usuarios' ? 'drop-shadow(0 4px 10px rgba(11,132,255,0.4))' : 'none',
                }}
                className="pointer-events-none"
              />
              {ptsUsuarios.map((pt, i) => {
                const isHovered = hoveredIdx === i;
                return (
                  <motion.circle
                    key={`u-dot-${i}-${timeframe}`}
                    animate={{
                      cx: pt.x,
                      cy: isUsuariosUp ? pt.y : baselineY,
                      opacity: isUsuariosUp ? 1 : 0,
                      r: isHovered ? 6.5 : activeSeries === 'usuarios' ? 4.5 : 3.5,
                    }}
                    transition={mountainTransition}
                    fill="#FFFFFF"
                    stroke="#0B84FF"
                    strokeWidth={isHovered ? 3.5 : 2}
                    className="pointer-events-none"
                  />
                );
              })}
            </g>

            {/* SERIE: MASCOTAS (Naranja) - MONTAÑA ANIMADA QUE SUBE Y BAJA */}
            <g key={`group-mascotas-${timeframe}`}>
              <motion.path
                key={`area-m-${timeframe}`}
                animate={{
                  d: isMascotasUp ? buildAreaPath(ptsMascotas) : baselineAreaPath,
                  opacity: isMascotasUp ? (activeSeries === 'mascotas' ? 0.95 : 0.75) : 0,
                }}
                transition={mountainTransition}
                fill="url(#gradientMascotas)"
                className="pointer-events-none"
              />
              <motion.path
                key={`line-m-${timeframe}`}
                animate={{
                  d: isMascotasUp ? buildSmoothPath(ptsMascotas) : baselineLinePath,
                  opacity: isMascotasUp ? 1 : 0,
                  strokeWidth: activeSeries === 'mascotas' ? 3.8 : 2.4,
                }}
                transition={mountainTransition}
                fill="none"
                stroke="#FF9500"
                strokeLinecap="round"
                style={{
                  filter: activeSeries === 'mascotas' ? 'drop-shadow(0 4px 10px rgba(255,149,0,0.4))' : 'none',
                }}
                className="pointer-events-none"
              />
              {ptsMascotas.map((pt, i) => {
                const isHovered = hoveredIdx === i;
                return (
                  <motion.circle
                    key={`m-dot-${i}-${timeframe}`}
                    animate={{
                      cx: pt.x,
                      cy: isMascotasUp ? pt.y : baselineY,
                      opacity: isMascotasUp ? 1 : 0,
                      r: isHovered ? 6.5 : activeSeries === 'mascotas' ? 4.5 : 3.5,
                    }}
                    transition={mountainTransition}
                    fill="#FFFFFF"
                    stroke="#FF9500"
                    strokeWidth={isHovered ? 3.5 : 2}
                    className="pointer-events-none"
                  />
                );
              })}
            </g>

            {/* SERIE: REFUGIOS (Púrpura) - MONTAÑA ANIMADA QUE SUBE Y BAJA */}
            <g key={`group-refugios-${timeframe}`}>
              <motion.path
                key={`area-r-${timeframe}`}
                animate={{
                  d: isRefugiosUp ? buildAreaPath(ptsRefugios) : baselineAreaPath,
                  opacity: isRefugiosUp ? (activeSeries === 'refugios' ? 0.95 : 0.75) : 0,
                }}
                transition={mountainTransition}
                fill="url(#gradientRefugios)"
                className="pointer-events-none"
              />
              <motion.path
                key={`line-r-${timeframe}`}
                animate={{
                  d: isRefugiosUp ? buildSmoothPath(ptsRefugios) : baselineLinePath,
                  opacity: isRefugiosUp ? 1 : 0,
                  strokeWidth: activeSeries === 'refugios' ? 3.8 : 2.4,
                }}
                transition={mountainTransition}
                fill="none"
                stroke="#AF52DE"
                strokeLinecap="round"
                style={{
                  filter: activeSeries === 'refugios' ? 'drop-shadow(0 4px 10px rgba(175,82,222,0.4))' : 'none',
                }}
                className="pointer-events-none"
              />
              {ptsRefugios.map((pt, i) => {
                const isHovered = hoveredIdx === i;
                return (
                  <motion.circle
                    key={`r-dot-${i}-${timeframe}`}
                    animate={{
                      cx: pt.x,
                      cy: isRefugiosUp ? pt.y : baselineY,
                      opacity: isRefugiosUp ? 1 : 0,
                      r: isHovered ? 6.5 : activeSeries === 'refugios' ? 4.5 : 3.5,
                    }}
                    transition={mountainTransition}
                    fill="#FFFFFF"
                    stroke="#AF52DE"
                    strokeWidth={isHovered ? 3.5 : 2}
                    className="pointer-events-none"
                  />
                );
              })}
            </g>


            {/* Capturadores de interacción invisible por cada intervalo X */}
            {chartData.map((_, i) => {
              const xCenter = padLeft + (i / (chartData.length - 1 || 1)) * chartW;
              const step = chartW / (chartData.length - 1 || 1);
              return (
                <rect
                  key={`hover-col-${i}`}
                  x={xCenter - step / 2}
                  y={padTop}
                  width={step}
                  height={chartH}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(i)}
                />
              );
            })}

            {/* Etiquetas del Eje X */}
            {chartData.map((d, i) => {
              const x = padLeft + (i / (chartData.length - 1 || 1)) * chartW;
              const isHovered = hoveredIdx === i;
              return (
                <text
                  key={`lbl-${i}`}
                  x={x}
                  y={height - 12}
                  textAnchor="middle"
                  className={`text-[10px] transition-all font-semibold ${
                    isHovered ? 'fill-gray-900 font-extrabold text-[11px]' : 'fill-gray-400'
                  }`}
                >
                  {d.label}
                </text>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}
