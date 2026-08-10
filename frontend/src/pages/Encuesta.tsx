import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Dog, Cat, Home, TreePine, Building2, Baby, Briefcase, Heart, Search, 
  Activity, Shield, Trophy, Coffee, Footprints, Zap, Sparkles, Clock, 
  CheckCircle2, Moon, Smile, Maximize2, Calendar
} from 'lucide-react';
import Header from '../components/Header';
import { useState } from 'react';
import Notification from '../components/Notification';
import { ToastMessage } from '../types';
import { RainbowButton } from '../components/ui/rainbow-button';
import { useAuth } from '../context/AuthContext';

const BlurInText = ({ text, highlight = '', delay = 30, startDelay = 0, className = '' }: { text: string, highlight?: string, delay?: number, startDelay?: number, className?: string }) => {
  const words = text.split(/\s+/);
  const hlWords = highlight ? highlight.split(/\s+/) : [];
  
  return (
    <span className={`inline-block ${className}`}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, filter: 'blur(8px)', y: 10 }}
          whileInView={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: (startDelay + i * delay) / 1000, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="inline-block mr-[0.3em]"
        >
          {word}
        </motion.span>
      ))}
      {hlWords.map((word, i) => (
        <motion.span
          key={`hl-${i}`}
          initial={{ opacity: 0, filter: 'blur(8px)', y: 10 }}
          whileInView={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: (startDelay + (words.length + i) * delay) / 1000, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="inline-block mr-[0.3em] text-[#0B84FF]"
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
};

const FadeUp = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.8, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.div>
);

export default function Encuesta() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // La encuesta de compatibilidad está reservada exclusivamente para adoptantes
  if (user && user.rol !== 'USUARIO') {
    if (user.rol === 'ADMIN') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/refugio" replace />;
  }

  const handleShowToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToasts((prev) => [...prev, { id: Math.random().toString(36).substring(2, 9), type, message }]);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const surveyAnswers = {
      tipo: formData.get('tipo') as string,
      vivienda: formData.get('vivienda') as string,
      actividad: formData.get('actividad') as string,
      tamano_preferido: formData.get('tamano_preferido') as string,
      etapa_vida: formData.get('etapa_vida') as string,
      personalidad_deseada: formData.get('personalidad_deseada') as string,
      tiene_ninos: formData.get('tiene_ninos') === 'on',
      tiene_mascotas: formData.get('tiene_mascotas') === 'on',
      trabaja_fuera: formData.get('trabaja_fuera') === 'on',
      es_principiante: formData.get('es_principiante') === 'on',
      tiempo_solo: formData.get('tiempo_solo') as string,
      experiencia: formData.get('experiencia') as string,
    };
    
    try {
      sessionStorage.setItem('pawtok_survey', JSON.stringify(surveyAnswers));
      sessionStorage.setItem('pawtok_survey_user_id', user ? String(user.id) : 'guest');
    } catch (e) {
      console.error('Error saving survey in sessionStorage:', e);
    }
    
    handleShowToast('¡Respuestas guardadas! Analizando todas las características de las mascotas...', 'success');
    setTimeout(() => {
      navigate('/mascotas', { state: { surveyAnswers } });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 text-gray-800 font-sans selection:bg-[#3f92ff] selection:text-white pb-20 relative">
      {/* Clean Gradient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/50 via-gray-50/50 to-white" />

      <div className="relative z-10">
        <Header
          onShowToast={handleShowToast}
          onSelectDrop={() => {}}
          searchQuery=""
          setSearchQuery={() => {}}
        />
        
        <main className="max-w-4xl mx-auto px-6 pt-32">
          <div className="text-center mb-12">
            <FadeUp>
              <span className="bg-blue-100 text-[#0B84FF] px-4 py-1 rounded-full text-xs font-bold tracking-wider uppercase">Test de Compatibilidad Avanzado</span>
            </FadeUp>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mt-5 mb-4">
              <BlurInText text="Encontremos a tu compañero" highlight="ideal" delay={40} />
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              <BlurInText text="Responde estas preguntas para que nuestro algoritmo evalúe el nivel de energía, tamaño, edad y personalidad de cada mascota." delay={25} />
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">

            {/* PASO 1: TIPO DE MASCOTA */}
            <FadeUp className="bg-white/60 backdrop-blur-md p-8 md:p-10 rounded-3xl border border-gray-100/80 shadow-sm flex flex-col items-center w-full">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center justify-center gap-3 w-full text-center">
                <span className="w-8 h-8 bg-blue-100 text-[#0B84FF] rounded-full flex items-center justify-center text-sm font-bold shadow-inner shrink-0">1</span>
                <BlurInText text="¿Qué compañero estás buscando?" />
              </h2>
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="cursor-pointer group">
                  <input type="radio" name="tipo" className="peer hidden" value="perro" required />
                  <div className="border-2 border-white/60 rounded-2xl p-5 flex items-center gap-4 hover:border-blue-300 transition bg-white/60 peer-checked:border-[#0B84FF] peer-checked:bg-[#EBF5FF] peer-checked:shadow-[0_4px_6px_rgba(11,132,255,0.1)]">
                    <div className="bg-blue-100 p-3 rounded-xl transition shrink-0">
                      <Dog className="w-8 h-8 text-[#0B84FF] transition group-hover:scale-110 block" />
                    </div>
                    <div>
                      <span className="font-bold text-gray-800 block text-base">Perro</span>
                      <span className="text-xs text-gray-500">Amigo fiel, enérgico y compañero de paseos</span>
                    </div>
                  </div>
                </label>
                <label className="cursor-pointer group">
                  <input type="radio" name="tipo" className="peer hidden" value="gato" />
                  <div className="border-2 border-white/60 rounded-2xl p-5 flex items-center gap-4 hover:border-blue-300 transition bg-white/60 peer-checked:border-[#0B84FF] peer-checked:bg-[#EBF5FF] peer-checked:shadow-[0_4px_6px_rgba(11,132,255,0.1)]">
                    <div className="bg-purple-100 p-3 rounded-xl transition shrink-0">
                      <Cat className="w-8 h-8 text-purple-600 transition group-hover:scale-110 block" />
                    </div>
                    <div>
                      <span className="font-bold text-gray-800 block text-base">Gato</span>
                      <span className="text-xs text-gray-500">Independiente, silencioso y cariñoso en casa</span>
                    </div>
                  </div>
                </label>
              </div>
            </FadeUp>

            {/* PASO 2: TIPO DE VIVIENDA (DIBUJO DE CASA Y APARTAMENTO COHERENTES) */}
            <FadeUp className="bg-white/60 backdrop-blur-md p-8 md:p-10 rounded-3xl border border-gray-100/80 shadow-sm flex flex-col items-center w-full">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center justify-center gap-3 w-full text-center">
                <span className="w-8 h-8 bg-blue-100 text-[#0B84FF] rounded-full flex items-center justify-center text-sm font-bold shadow-inner shrink-0">2</span>
                <BlurInText text="Tu Hogar y Espacio" />
              </h2>
              <div className="w-full">
                <label className="block text-gray-700 font-medium mb-4 text-center w-full">
                  <BlurInText text="¿En qué tipo de vivienda resides?" />
                </label>
                <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Apartamento con icono de Edificio */}
                  <label className="cursor-pointer group h-full">
                    <input type="radio" name="vivienda" className="peer hidden" value="apartamento" required />
                    <div className="h-full border-2 border-white/60 rounded-2xl p-6 hover:border-blue-300 transition flex flex-col items-center text-center bg-white/60 peer-checked:border-[#0B84FF] peer-checked:bg-[#EBF5FF] peer-checked:shadow-[0_4px_6px_rgba(11,132,255,0.1)]">
                      <Building2 className="w-10 h-10 text-gray-400 mb-3 transition group-hover:scale-110 peer-checked:text-[#0B84FF]" strokeWidth={1.5} />
                      <span className="font-semibold text-gray-800 text-sm">Apartamento</span>
                      <span className="text-xs text-gray-500 mt-1">Espacio compacto / interior</span>
                    </div>
                  </label>
                  {/* Casa con icono de Casa real */}
                  <label className="cursor-pointer group h-full">
                    <input type="radio" name="vivienda" className="peer hidden" value="casa" />
                    <div className="h-full border-2 border-white/60 rounded-2xl p-6 hover:border-blue-300 transition flex flex-col items-center text-center bg-white/60 peer-checked:border-[#0B84FF] peer-checked:bg-[#EBF5FF] peer-checked:shadow-[0_4px_6px_rgba(11,132,255,0.1)]">
                      <Home className="w-10 h-10 text-gray-400 mb-3 transition group-hover:scale-110 peer-checked:text-[#0B84FF]" strokeWidth={1.5} />
                      <span className="font-semibold text-gray-800 text-sm">Casa</span>
                      <span className="text-xs text-gray-500 mt-1">Con patio, jardín o terraza</span>
                    </div>
                  </label>
                  {/* Finca con pino / campo */}
                  <label className="cursor-pointer group h-full">
                    <input type="radio" name="vivienda" className="peer hidden" value="finca" />
                    <div className="h-full border-2 border-white/60 rounded-2xl p-6 hover:border-blue-300 transition flex flex-col items-center text-center bg-white/60 peer-checked:border-[#0B84FF] peer-checked:bg-[#EBF5FF] peer-checked:shadow-[0_4px_6px_rgba(11,132,255,0.1)]">
                      <TreePine className="w-10 h-10 text-gray-400 mb-3 transition group-hover:scale-110 peer-checked:text-[#0B84FF]" strokeWidth={1.5} />
                      <span className="font-semibold text-gray-800 text-sm">Finca / Campo</span>
                      <span className="text-xs text-gray-500 mt-1">Espacio amplio y al aire libre</span>
                    </div>
                  </label>
                </div>
              </div>
            </FadeUp>

            {/* PASO 3: NIVEL DE ACTIVIDAD DIARIA (NUEVA PREGUNTA) */}
            <FadeUp className="bg-white/60 backdrop-blur-md p-8 md:p-10 rounded-3xl border border-gray-100/80 shadow-sm flex flex-col items-center w-full">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center justify-center gap-3 w-full text-center">
                <span className="w-8 h-8 bg-blue-100 text-[#0B84FF] rounded-full flex items-center justify-center text-sm font-bold shadow-inner shrink-0">3</span>
                <BlurInText text="Tu Nivel de Actividad y Rutina" />
              </h2>
              <div className="w-full">
                <label className="block text-gray-700 font-medium mb-4 text-center w-full">
                  <BlurInText text="¿Cómo describirías tu ritmo de actividad física diaria?" />
                </label>
                <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="cursor-pointer group h-full">
                    <input type="radio" name="actividad" className="peer hidden" value="tranquilo" required />
                    <div className="h-full border-2 border-white/60 rounded-2xl p-6 hover:border-blue-300 transition flex flex-col items-center text-center bg-white/60 peer-checked:border-[#0B84FF] peer-checked:bg-[#EBF5FF] peer-checked:shadow-[0_4px_6px_rgba(11,132,255,0.1)]">
                      <Coffee className="w-10 h-10 text-amber-500 mb-3 transition group-hover:scale-110" strokeWidth={1.5} />
                      <span className="font-semibold text-gray-800 text-sm">Tranquilo / Relajado</span>
                      <span className="text-xs text-gray-500 mt-1">Paseos cortos y descanso en casa</span>
                    </div>
                  </label>
                  <label className="cursor-pointer group h-full">
                    <input type="radio" name="actividad" className="peer hidden" value="moderado" />
                    <div className="h-full border-2 border-white/60 rounded-2xl p-6 hover:border-blue-300 transition flex flex-col items-center text-center bg-white/60 peer-checked:border-[#0B84FF] peer-checked:bg-[#EBF5FF] peer-checked:shadow-[0_4px_6px_rgba(11,132,255,0.1)]">
                      <Footprints className="w-10 h-10 text-blue-500 mb-3 transition group-hover:scale-110" strokeWidth={1.5} />
                      <span className="font-semibold text-gray-800 text-sm">Moderado</span>
                      <span className="text-xs text-gray-500 mt-1">Paseos diarios habituales y juego</span>
                    </div>
                  </label>
                  <label className="cursor-pointer group h-full">
                    <input type="radio" name="actividad" className="peer hidden" value="activo" />
                    <div className="h-full border-2 border-white/60 rounded-2xl p-6 hover:border-blue-300 transition flex flex-col items-center text-center bg-white/60 peer-checked:border-[#0B84FF] peer-checked:bg-[#EBF5FF] peer-checked:shadow-[0_4px_6px_rgba(11,132,255,0.1)]">
                      <Zap className="w-10 h-10 text-orange-500 mb-3 transition group-hover:scale-110" strokeWidth={1.5} />
                      <span className="font-semibold text-gray-800 text-sm">Muy Activo / Atlético</span>
                      <span className="text-xs text-gray-500 mt-1">Correr, senderismo y ejercicio intenso</span>
                    </div>
                  </label>
                </div>
              </div>
            </FadeUp>

            {/* PASO 4: TAMAÑO PREFERIDO (NUEVA PREGUNTA) */}
            <FadeUp className="bg-white/60 backdrop-blur-md p-8 md:p-10 rounded-3xl border border-gray-100/80 shadow-sm flex flex-col items-center w-full">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center justify-center gap-3 w-full text-center">
                <span className="w-8 h-8 bg-blue-100 text-[#0B84FF] rounded-full flex items-center justify-center text-sm font-bold shadow-inner shrink-0">4</span>
                <BlurInText text="Tamaño de la Mascota" />
              </h2>
              <div className="w-full">
                <label className="block text-gray-700 font-medium mb-4 text-center w-full">
                  <BlurInText text="¿Qué tamaño de mascota prefieres o puedes albergar cómodamente?" />
                </label>
                <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4">
                  <label className="cursor-pointer group h-full">
                    <input type="radio" name="tamano_preferido" className="peer hidden" value="pequeno" required />
                    <div className="h-full border-2 border-white/60 rounded-2xl p-5 hover:border-blue-300 transition flex flex-col items-center text-center bg-white/60 peer-checked:border-[#0B84FF] peer-checked:bg-[#EBF5FF] peer-checked:shadow-[0_4px_6px_rgba(11,132,255,0.1)]">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 mb-2">Hasta 10 kg</span>
                      <span className="font-semibold text-gray-800 text-sm">Pequeño</span>
                      <span className="text-[11px] text-gray-500 mt-1">Fácil de transportar</span>
                    </div>
                  </label>

                  <label className="cursor-pointer group h-full">
                    <input type="radio" name="tamano_preferido" className="peer hidden" value="mediano" />
                    <div className="h-full border-2 border-white/60 rounded-2xl p-5 hover:border-blue-300 transition flex flex-col items-center text-center bg-white/60 peer-checked:border-[#0B84FF] peer-checked:bg-[#EBF5FF] peer-checked:shadow-[0_4px_6px_rgba(11,132,255,0.1)]">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#0B84FF] mb-2">10 a 25 kg</span>
                      <span className="font-semibold text-gray-800 text-sm">Mediano</span>
                      <span className="text-[11px] text-gray-500 mt-1">Equilibrio perfecto</span>
                    </div>
                  </label>

                  <label className="cursor-pointer group h-full">
                    <input type="radio" name="tamano_preferido" className="peer hidden" value="grande" />
                    <div className="h-full border-2 border-white/60 rounded-2xl p-5 hover:border-blue-300 transition flex flex-col items-center text-center bg-white/60 peer-checked:border-[#0B84FF] peer-checked:bg-[#EBF5FF] peer-checked:shadow-[0_4px_6px_rgba(11,132,255,0.1)]">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 mb-2">+ 25 kg</span>
                      <span className="font-semibold text-gray-800 text-sm">Grande</span>
                      <span className="text-[11px] text-gray-500 mt-1">Imponente y noble</span>
                    </div>
                  </label>

                  <label className="cursor-pointer group h-full">
                    <input type="radio" name="tamano_preferido" className="peer hidden" value="cualquiera" />
                    <div className="h-full border-2 border-white/60 rounded-2xl p-5 hover:border-blue-300 transition flex flex-col items-center text-center bg-white/60 peer-checked:border-[#0B84FF] peer-checked:bg-[#EBF5FF] peer-checked:shadow-[0_4px_6px_rgba(11,132,255,0.1)]">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 mb-2">Sin límites</span>
                      <span className="font-semibold text-gray-800 text-sm">Cualquiera</span>
                      <span className="text-[11px] text-gray-500 mt-1">Me adapto a cualquier tamaño</span>
                    </div>
                  </label>
                </div>
              </div>
            </FadeUp>

            {/* PASO 5: ETAPA DE VIDA / EDAD (NUEVA PREGUNTA) */}
            <FadeUp className="bg-white/60 backdrop-blur-md p-8 md:p-10 rounded-3xl border border-gray-100/80 shadow-sm flex flex-col items-center w-full">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center justify-center gap-3 w-full text-center">
                <span className="w-8 h-8 bg-blue-100 text-[#0B84FF] rounded-full flex items-center justify-center text-sm font-bold shadow-inner shrink-0">5</span>
                <BlurInText text="Etapa de Vida y Edad" />
              </h2>
              <div className="w-full">
                <label className="block text-gray-700 font-medium mb-4 text-center w-full">
                  <BlurInText text="¿En qué momento de su vida te gustaría acoger a tu mascota?" />
                </label>
                <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4">
                  <label className="cursor-pointer group h-full">
                    <input type="radio" name="etapa_vida" className="peer hidden" value="cachorro" required />
                    <div className="h-full border-2 border-white/60 rounded-2xl p-5 hover:border-blue-300 transition flex flex-col items-center text-center bg-white/60 peer-checked:border-[#0B84FF] peer-checked:bg-[#EBF5FF] peer-checked:shadow-[0_4px_6px_rgba(11,132,255,0.1)]">
                      <Baby className="w-8 h-8 text-pink-500 mb-2 transition group-hover:scale-110" />
                      <span className="font-semibold text-gray-800 text-sm">Cachorro / Joven</span>
                      <span className="text-[11px] text-gray-500 mt-1">Deseo educarlo desde pequeño</span>
                    </div>
                  </label>

                  <label className="cursor-pointer group h-full">
                    <input type="radio" name="etapa_vida" className="peer hidden" value="adulto" />
                    <div className="h-full border-2 border-white/60 rounded-2xl p-5 hover:border-blue-300 transition flex flex-col items-center text-center bg-white/60 peer-checked:border-[#0B84FF] peer-checked:bg-[#EBF5FF] peer-checked:shadow-[0_4px_6px_rgba(11,132,255,0.1)]">
                      <Activity className="w-8 h-8 text-blue-500 mb-2 transition group-hover:scale-110" />
                      <span className="font-semibold text-gray-800 text-sm">Adulto</span>
                      <span className="text-[11px] text-gray-500 mt-1">Carácter y tamaño definidos</span>
                    </div>
                  </label>

                  <label className="cursor-pointer group h-full">
                    <input type="radio" name="etapa_vida" className="peer hidden" value="senior" />
                    <div className="h-full border-2 border-white/60 rounded-2xl p-5 hover:border-blue-300 transition flex flex-col items-center text-center bg-white/60 peer-checked:border-[#0B84FF] peer-checked:bg-[#EBF5FF] peer-checked:shadow-[0_4px_6px_rgba(11,132,255,0.1)]">
                      <Clock className="w-8 h-8 text-purple-500 mb-2 transition group-hover:scale-110" />
                      <span className="font-semibold text-gray-800 text-sm">Senior / Maduro</span>
                      <span className="text-[11px] text-gray-500 mt-1">Paz, calma y amor sereno</span>
                    </div>
                  </label>

                  <label className="cursor-pointer group h-full">
                    <input type="radio" name="etapa_vida" className="peer hidden" value="cualquiera" />
                    <div className="h-full border-2 border-white/60 rounded-2xl p-5 hover:border-blue-300 transition flex flex-col items-center text-center bg-white/60 peer-checked:border-[#0B84FF] peer-checked:bg-[#EBF5FF] peer-checked:shadow-[0_4px_6px_rgba(11,132,255,0.1)]">
                      <Sparkles className="w-8 h-8 text-teal-500 mb-2 transition group-hover:scale-110" />
                      <span className="font-semibold text-gray-800 text-sm">Cualquier Edad</span>
                      <span className="text-[11px] text-gray-500 mt-1">Abierto a la conexión mutua</span>
                    </div>
                  </label>
                </div>
              </div>
            </FadeUp>

            {/* PASO 6: PERSONALIDAD DESEADA (NUEVA PREGUNTA) */}
            <FadeUp className="bg-white/60 backdrop-blur-md p-8 md:p-10 rounded-3xl border border-gray-100/80 shadow-sm flex flex-col items-center w-full">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center justify-center gap-3 w-full text-center">
                <span className="w-8 h-8 bg-blue-100 text-[#0B84FF] rounded-full flex items-center justify-center text-sm font-bold shadow-inner shrink-0">6</span>
                <BlurInText text="Personalidad Deseada" />
              </h2>
              <div className="w-full">
                <label className="block text-gray-700 font-medium mb-4 text-center w-full">
                  <BlurInText text="¿Qué temperamento valoras más en tu futuro compañero?" />
                </label>
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <label className="cursor-pointer group h-full">
                    <input type="radio" name="personalidad_deseada" className="peer hidden" value="carinoso" required />
                    <div className="h-full border-2 border-white/60 rounded-2xl p-4 hover:border-blue-300 transition flex items-center gap-3 bg-white/60 peer-checked:border-[#0B84FF] peer-checked:bg-[#EBF5FF] peer-checked:shadow-[0_4px_6px_rgba(11,132,255,0.1)]">
                      <div className="w-11 h-11 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                        <Heart className="w-6 h-6 text-rose-500" />
                      </div>
                      <div className="text-left">
                        <span className="font-semibold text-gray-800 text-sm block">Cariñoso y Apegado</span>
                        <span className="text-[11px] text-gray-500">Mimos, caricias y compañía cercana</span>
                      </div>
                    </div>
                  </label>

                  <label className="cursor-pointer group h-full">
                    <input type="radio" name="personalidad_deseada" className="peer hidden" value="tranquilo" />
                    <div className="h-full border-2 border-white/60 rounded-2xl p-4 hover:border-blue-300 transition flex items-center gap-3 bg-white/60 peer-checked:border-[#0B84FF] peer-checked:bg-[#EBF5FF] peer-checked:shadow-[0_4px_6px_rgba(11,132,255,0.1)]">
                      <div className="w-11 h-11 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                        <Moon className="w-6 h-6 text-indigo-500" />
                      </div>
                      <div className="text-left">
                        <span className="font-semibold text-gray-800 text-sm block">Tranquilo y Paciente</span>
                        <span className="text-[11px] text-gray-500">Silencioso, apacible y reposado</span>
                      </div>
                    </div>
                  </label>

                  <label className="cursor-pointer group h-full">
                    <input type="radio" name="personalidad_deseada" className="peer hidden" value="jugueton" />
                    <div className="h-full border-2 border-white/60 rounded-2xl p-4 hover:border-blue-300 transition flex items-center gap-3 bg-white/60 peer-checked:border-[#0B84FF] peer-checked:bg-[#EBF5FF] peer-checked:shadow-[0_4px_6px_rgba(11,132,255,0.1)]">
                      <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                        <Smile className="w-6 h-6 text-amber-500" />
                      </div>
                      <div className="text-left">
                        <span className="font-semibold text-gray-800 text-sm block">Juguetón y Alegre</span>
                        <span className="text-[11px] text-gray-500">Curioso, divertido y dinámico</span>
                      </div>
                    </div>
                  </label>

                  <label className="cursor-pointer group h-full">
                    <input type="radio" name="personalidad_deseada" className="peer hidden" value="protector" />
                    <div className="h-full border-2 border-white/60 rounded-2xl p-4 hover:border-blue-300 transition flex items-center gap-3 bg-white/60 peer-checked:border-[#0B84FF] peer-checked:bg-[#EBF5FF] peer-checked:shadow-[0_4px_6px_rgba(11,132,255,0.1)]">
                      <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                        <Shield className="w-6 h-6 text-[#0B84FF]" />
                      </div>
                      <div className="text-left">
                        <span className="font-semibold text-gray-800 text-sm block">Protector y Leal</span>
                        <span className="text-[11px] text-gray-500">Atento, fiel y guardián del hogar</span>
                      </div>
                    </div>
                  </label>

                  <label className="cursor-pointer group h-full sm:col-span-2 lg:col-span-1">
                    <input type="radio" name="personalidad_deseada" className="peer hidden" value="cualquiera" />
                    <div className="h-full border-2 border-white/60 rounded-2xl p-4 hover:border-blue-300 transition flex items-center gap-3 bg-white/60 peer-checked:border-[#0B84FF] peer-checked:bg-[#EBF5FF] peer-checked:shadow-[0_4px_6px_rgba(11,132,255,0.1)]">
                      <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div className="text-left">
                        <span className="font-semibold text-gray-800 text-sm block">Cualquier Personalidad</span>
                        <span className="text-[11px] text-gray-500">Aprecio cualquier rasgo especial</span>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </FadeUp>

            {/* PASO 7: ENTORNO FAMILIAR */}
            <FadeUp className="bg-white/60 backdrop-blur-md p-8 md:p-10 rounded-3xl border border-gray-100/80 shadow-sm flex flex-col items-center w-full">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center justify-center gap-3 w-full text-center">
                <span className="w-8 h-8 bg-blue-100 text-[#0B84FF] rounded-full flex items-center justify-center text-sm font-bold shadow-inner shrink-0">7</span>
                <BlurInText text="Entorno Familiar y Convivencia" />
              </h2>
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="cursor-pointer group h-full block">
                  <input type="checkbox" name="tiene_ninos" className="peer hidden" />
                  <div className="h-full border-2 border-white/60 rounded-2xl p-5 hover:border-blue-300 transition flex items-center gap-4 bg-white/60 peer-checked:border-[#0B84FF] peer-checked:bg-[#EBF5FF] peer-checked:shadow-[0_4px_6px_rgba(11,132,255,0.1)]">
                    <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition">
                      <Baby className="w-6 h-6 text-orange-500" />
                    </div>
                    <div>
                      <span className="font-semibold text-gray-800 block text-sm">Tengo niños pequeños</span>
                      <span className="text-xs text-gray-500">Filtrará mascotas sociables y dóciles con niños</span>
                    </div>
                  </div>
                </label>

                <label className="cursor-pointer group h-full block">
                  <input type="checkbox" name="tiene_mascotas" className="peer hidden" />
                  <div className="h-full border-2 border-white/60 rounded-2xl p-5 hover:border-blue-300 transition flex items-center gap-4 bg-white/60 peer-checked:border-[#0B84FF] peer-checked:bg-[#EBF5FF] peer-checked:shadow-[0_4px_6px_rgba(11,132,255,0.1)]">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition">
                      <Dog className="w-6 h-6 text-purple-500" />
                    </div>
                    <div>
                      <span className="font-semibold text-gray-800 block text-sm">Tengo otras mascotas en casa</span>
                      <span className="text-xs text-gray-500">Prioriza mascotas sociables con otros animales</span>
                    </div>
                  </div>
                </label>

                <label className="cursor-pointer group h-full block">
                  <input type="checkbox" name="trabaja_fuera" className="peer hidden" />
                  <div className="h-full border-2 border-white/60 rounded-2xl p-5 hover:border-blue-300 transition flex items-center gap-4 bg-white/60 peer-checked:border-[#0B84FF] peer-checked:bg-[#EBF5FF] peer-checked:shadow-[0_4px_6px_rgba(11,132,255,0.1)]">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition">
                      <Briefcase className="w-6 h-6 text-[#0B84FF]" />
                    </div>
                    <div>
                      <span className="font-semibold text-gray-800 block text-sm">Trabajo fuera de casa</span>
                      <span className="text-xs text-gray-500">Busca mascotas tolerantes y autónomas</span>
                    </div>
                  </div>
                </label>

                <label className="cursor-pointer group h-full block">
                  <input type="checkbox" name="es_principiante" className="peer hidden" />
                  <div className="h-full border-2 border-white/60 rounded-2xl p-5 hover:border-blue-300 transition flex items-center gap-4 bg-white/60 peer-checked:border-[#0B84FF] peer-checked:bg-[#EBF5FF] peer-checked:shadow-[0_4px_6px_rgba(11,132,255,0.1)]">
                    <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition">
                      <Shield className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <span className="font-semibold text-gray-800 block text-sm">Es mi primera mascota</span>
                      <span className="text-xs text-gray-500">Prioriza mascotas fáciles de educar y nobles</span>
                    </div>
                  </div>
                </label>
              </div>
            </FadeUp>

            {/* PASO 8: TIEMPO A SOLAS */}
            <FadeUp className="bg-white/60 backdrop-blur-md p-8 md:p-10 rounded-3xl border border-gray-100/80 shadow-sm flex flex-col items-center w-full">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center justify-center gap-3 w-full text-center">
                <span className="w-8 h-8 bg-blue-100 text-[#0B84FF] rounded-full flex items-center justify-center text-sm font-bold shadow-inner shrink-0">8</span>
                <BlurInText text="Tiempo y Horarios" />
              </h2>
              <label className="block text-gray-700 font-medium mb-4 text-center w-full">
                <BlurInText text="¿Cuántas horas al día pasará sola la mascota?" />
              </label>
              <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="cursor-pointer group">
                  <input type="radio" name="tiempo_solo" className="peer hidden" value="poco" required />
                  <div className="border-2 border-white/60 rounded-2xl p-5 hover:border-blue-300 transition text-center h-full flex flex-col justify-center items-center bg-white/60 peer-checked:border-[#0B84FF] peer-checked:bg-[#EBF5FF] peer-checked:shadow-[0_4px_6px_rgba(11,132,255,0.1)]">
                    <span className="font-semibold text-gray-800 text-sm">Menos de 4 horas</span>
                    <span className="text-xs text-gray-500 mt-1">Compañía casi continua</span>
                  </div>
                </label>
                <label className="cursor-pointer group">
                  <input type="radio" name="tiempo_solo" className="peer hidden" value="medio" />
                  <div className="border-2 border-white/60 rounded-2xl p-5 hover:border-blue-300 transition text-center h-full flex flex-col justify-center items-center bg-white/60 peer-checked:border-[#0B84FF] peer-checked:bg-[#EBF5FF] peer-checked:shadow-[0_4px_6px_rgba(11,132,255,0.1)]">
                    <span className="font-semibold text-gray-800 text-sm">4 a 8 horas</span>
                    <span className="text-xs text-gray-500 mt-1">Jornada media estándar</span>
                  </div>
                </label>
                <label className="cursor-pointer group">
                  <input type="radio" name="tiempo_solo" className="peer hidden" value="mucho" />
                  <div className="border-2 border-white/60 rounded-2xl p-5 hover:border-blue-300 transition text-center h-full flex flex-col justify-center items-center bg-white/60 peer-checked:border-[#0B84FF] peer-checked:bg-[#EBF5FF] peer-checked:shadow-[0_4px_6px_rgba(11,132,255,0.1)]">
                    <span className="font-semibold text-gray-800 text-sm">Más de 8 horas</span>
                    <span className="text-xs text-gray-500 mt-1">Jornada extendida</span>
                  </div>
                </label>
              </div>
            </FadeUp>

            {/* PASO 9: NIVEL DE EXPERIENCIA */}
            <FadeUp className="bg-white/60 backdrop-blur-md p-8 md:p-10 rounded-3xl border border-gray-100/80 shadow-sm flex flex-col items-center w-full">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center justify-center gap-3 w-full text-center">
                <span className="w-8 h-8 bg-blue-100 text-[#0B84FF] rounded-full flex items-center justify-center text-sm font-bold shadow-inner shrink-0">9</span>
                <BlurInText text="Tu Experiencia Previa" />
              </h2>
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
                <label className="cursor-pointer group">
                  <input type="radio" name="experiencia" className="peer hidden" value="principiante" required />
                  <div className="border-2 border-white/60 rounded-2xl p-5 flex items-center gap-4 hover:border-blue-300 transition bg-white/60 peer-checked:border-[#0B84FF] peer-checked:bg-[#EBF5FF] peer-checked:shadow-[0_4px_6px_rgba(11,132,255,0.1)]">
                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center shrink-0">
                      <Baby className="w-6 h-6 transition" />
                    </div>
                    <div>
                      <span className="font-bold text-gray-800 block text-sm">Soy Principiante</span>
                      <span className="text-xs text-gray-500">Busco una mascota noble y fácil de educar</span>
                    </div>
                  </div>
                </label>
                <label className="cursor-pointer group">
                  <input type="radio" name="experiencia" className="peer hidden" value="experto" />
                  <div className="border-2 border-white/60 rounded-2xl p-5 flex items-center gap-4 hover:border-blue-300 transition bg-white/60 peer-checked:border-[#0B84FF] peer-checked:bg-[#EBF5FF] peer-checked:shadow-[0_4px_6px_rgba(11,132,255,0.1)]">
                    <div className="w-12 h-12 bg-blue-100 text-[#0B84FF] rounded-2xl flex items-center justify-center shrink-0">
                      <Trophy className="w-6 h-6 transition" />
                    </div>
                    <div>
                      <span className="font-bold text-gray-800 block text-sm">Tengo Experiencia</span>
                      <span className="text-xs text-gray-500">Puedo manejar mascotas enérgicas o con carácter</span>
                    </div>
                  </div>
                </label>
              </div>
            </FadeUp>

            {/* BOTÓN DE ENVIAR */}
            <div className="text-center pt-4 pb-12">
              <FadeUp>
                <RainbowButton 
                  type="submit"
                  className="w-auto text-base font-bold px-8 py-3.5 h-auto flex items-center justify-center gap-2.5 mx-auto shadow-lg hover:scale-105 transition-transform"
                >
                  <Search className="w-5 h-5" />
                  <span>Calcular Mis Matches Ideales</span>
                </RainbowButton>
              </FadeUp>
            </div>

          </form>
        </main>
      </div>
      <Notification toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}
