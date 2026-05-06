import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Dog, Cat, ArrowLeft, Home, TreePine, Map, Baby, Users, Briefcase, Heart, Search, Activity, Shield, Trophy } from 'lucide-react';
import Header from '../components/Header';
import { useState } from 'react';
import Notification from '../components/Notification';
import { ToastMessage } from '../types';

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
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

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
      vivienda: formData.get('vivienda') as string,
      tipo: formData.get('tipo') as string,
      tiene_ninos: formData.get('tiene_ninos') === 'on',
      tiene_mascotas: formData.get('tiene_mascotas') === 'on',
      trabaja_fuera: formData.get('trabaja_fuera') === 'on',
      es_principiante: formData.get('es_principiante') === 'on',
      tiempo_solo: formData.get('tiempo_solo') as string,
      experiencia: formData.get('experiencia') as string,
    };
    
    handleShowToast('¡Respuestas guardadas! Analizando tu perfil...', 'success');
    setTimeout(() => {
      navigate('/mascotas', { state: { surveyAnswers } });
    }, 2000);
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
            <span className="bg-blue-100 text-[#0B84FF] px-4 py-1 rounded-full text-xs font-bold tracking-wider uppercase">Encuesta de Adopción</span>
          </FadeUp>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mt-5 mb-4">
            <BlurInText text="Encontremos a tu compañero" highlight="ideal" delay={40} />
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            <BlurInText text="Responde estas preguntas para que nuestro algoritmo encuentre la mascota perfecta para tu estilo de vida." delay={30} />
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">

          <FadeUp className="bg-transparent p-8 md:p-10 rounded-3xl flex flex-col items-center w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center justify-center gap-3 w-full text-center">
              <span className="w-8 h-8 bg-blue-100 text-[#0B84FF] rounded-full flex items-center justify-center text-sm font-bold shadow-inner shrink-0">1</span>
              <BlurInText text="Tu Hogar y Actividad" />
            </h2>
            <div className="w-full space-y-8">
              <div>
                <label className="block text-gray-700 font-medium mb-4 text-center w-full">
                  <BlurInText text="¿En qué tipo de vivienda resides?" />
                </label>
                <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="cursor-pointer group h-full">
                    <input type="radio" name="vivienda" className="peer hidden" value="apartamento" required />
                    <div className="h-full border-2 border-white/60 rounded-2xl p-6 hover:border-blue-300 transition flex flex-col items-center text-center bg-white/40 peer-checked:border-[#0B84FF] peer-checked:bg-[#EBF5FF] peer-checked:shadow-[0_4px_6px_rgba(11,132,255,0.1)]">
                      <Home className="w-10 h-10 text-gray-400 mb-3 transition group-hover:scale-110 peer-checked:text-[#0B84FF]" strokeWidth={1.5} />
                      <span className="font-semibold text-gray-700">Apartamento</span>
                      <span className="text-xs text-gray-500 mt-1">Espacio limitado</span>
                    </div>
                  </label>
                  <label className="cursor-pointer group h-full">
                    <input type="radio" name="vivienda" className="peer hidden" value="casa" />
                    <div className="h-full border-2 border-white/60 rounded-2xl p-6 hover:border-blue-300 transition flex flex-col items-center text-center bg-white/40 peer-checked:border-[#0B84FF] peer-checked:bg-[#EBF5FF] peer-checked:shadow-[0_4px_6px_rgba(11,132,255,0.1)]">
                      <Map className="w-10 h-10 text-gray-400 mb-3 transition group-hover:scale-110 peer-checked:text-[#0B84FF]" strokeWidth={1.5} />
                      <span className="font-semibold text-gray-700">Casa</span>
                      <span className="text-xs text-gray-500 mt-1">Con patio o jardín</span>
                    </div>
                  </label>
                  <label className="cursor-pointer group h-full">
                    <input type="radio" name="vivienda" className="peer hidden" value="finca" />
                    <div className="h-full border-2 border-white/60 rounded-2xl p-6 hover:border-blue-300 transition flex flex-col items-center text-center bg-white/40 peer-checked:border-[#0B84FF] peer-checked:bg-[#EBF5FF] peer-checked:shadow-[0_4px_6px_rgba(11,132,255,0.1)]">
                      <TreePine className="w-10 h-10 text-gray-400 mb-3 transition group-hover:scale-110 peer-checked:text-[#0B84FF]" strokeWidth={1.5} />
                      <span className="font-semibold text-gray-700">Finca / Campo</span>
                      <span className="text-xs text-gray-500 mt-1">Espacio muy amplio</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </FadeUp>

          <FadeUp className="bg-transparent p-8 md:p-10 rounded-3xl flex flex-col items-center w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center justify-center gap-3 w-full text-center">
              <span className="w-8 h-8 bg-blue-100 text-[#0B84FF] rounded-full flex items-center justify-center text-sm font-bold shadow-inner shrink-0">2</span>
              <BlurInText text="Preferencias de Mascota" />
            </h2>
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="cursor-pointer group">
                <input type="radio" name="tipo" className="peer hidden" value="perro" required />
                <div className="border-2 border-white/60 rounded-2xl p-4 flex items-center gap-4 hover:border-blue-300 transition bg-white/40 peer-checked:border-[#0B84FF] peer-checked:bg-[#EBF5FF] peer-checked:shadow-[0_4px_6px_rgba(11,132,255,0.1)]">
                  <div className="bg-orange-100 p-3 rounded-xl transition">
                    <Dog className="w-8 h-8 text-orange-500 transition group-hover:scale-110 block" />
                  </div>
                  <div>
                    <span className="font-bold text-gray-800 block">Perro</span>
                    <span className="text-sm text-gray-500">Amigo fiel y energético</span>
                  </div>
                </div>
              </label>
              <label className="cursor-pointer group">
                <input type="radio" name="tipo" className="peer hidden" value="gato" />
                <div className="border-2 border-white/60 rounded-2xl p-4 flex items-center gap-4 hover:border-blue-300 transition bg-white/40 peer-checked:border-[#0B84FF] peer-checked:bg-[#EBF5FF] peer-checked:shadow-[0_4px_6px_rgba(11,132,255,0.1)]">
                  <div className="bg-purple-100 p-3 rounded-xl transition">
                     <Cat className="w-8 h-8 text-purple-500 transition group-hover:scale-110 block" />
                  </div>
                  <div>
                    <span className="font-bold text-gray-800 block">Gato</span>
                    <span className="text-sm text-gray-500">Independiente y cariñoso</span>
                  </div>
                </div>
              </label>
            </div>
          </FadeUp>

          <FadeUp className="bg-transparent p-8 md:p-10 rounded-3xl flex flex-col items-center w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center justify-center gap-3 w-full text-center">
              <span className="w-8 h-8 bg-blue-100 text-[#0B84FF] rounded-full flex items-center justify-center text-sm font-bold shadow-inner shrink-0">3</span>
              <BlurInText text="Entorno Familiar" />
            </h2>
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="cursor-pointer group h-full block">
                <input type="checkbox" name="tiene_ninos" className="peer hidden" />
                <div className="h-full border-2 border-white/60 rounded-2xl p-5 hover:border-blue-300 transition flex items-center gap-4 bg-white/40 peer-checked:border-[#0B84FF] peer-checked:bg-[#EBF5FF] peer-checked:shadow-[0_4px_6px_rgba(11,132,255,0.1)]">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition">
                    <Baby className="w-6 h-6 text-orange-500" />
                  </div>
                  <span className="font-semibold text-gray-700">Tengo niños pequeños</span>
                </div>
              </label>

              <label className="cursor-pointer group h-full block">
                <input type="checkbox" name="tiene_mascotas" className="peer hidden" />
                <div className="h-full border-2 border-white/60 rounded-2xl p-5 hover:border-blue-300 transition flex items-center gap-4 bg-white/40 peer-checked:border-[#0B84FF] peer-checked:bg-[#EBF5FF] peer-checked:shadow-[0_4px_6px_rgba(11,132,255,0.1)]">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition">
                    <Dog className="w-6 h-6 text-purple-500" />
                  </div>
                  <span className="font-semibold text-gray-700">Tengo otras mascotas</span>
                </div>
              </label>

              <label className="cursor-pointer group h-full block">
                <input type="checkbox" name="trabaja_fuera" className="peer hidden" />
                <div className="h-full border-2 border-white/60 rounded-2xl p-5 hover:border-blue-300 transition flex items-center gap-4 bg-white/40 peer-checked:border-[#0B84FF] peer-checked:bg-[#EBF5FF] peer-checked:shadow-[0_4px_6px_rgba(11,132,255,0.1)]">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition">
                    <Briefcase className="w-6 h-6 text-blue-500" />
                  </div>
                  <span className="font-semibold text-gray-700">Trabajo fuera todo el día</span>
                </div>
              </label>

              <label className="cursor-pointer group h-full block">
                <input type="checkbox" name="es_principiante" className="peer hidden" />
                <div className="h-full border-2 border-white/60 rounded-2xl p-5 hover:border-blue-300 transition flex items-center gap-4 bg-white/40 peer-checked:border-[#0B84FF] peer-checked:bg-[#EBF5FF] peer-checked:shadow-[0_4px_6px_rgba(11,132,255,0.1)]">
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition">
                    <Shield className="w-6 h-6 text-green-500" />
                  </div>
                  <span className="font-semibold text-gray-700">Es mi primera mascota</span>
                </div>
              </label>
            </div>
          </FadeUp>

          <FadeUp className="bg-transparent p-8 md:p-10 rounded-3xl flex flex-col items-center w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center justify-center gap-3 w-full text-center">
              <span className="w-8 h-8 bg-blue-100 text-[#0B84FF] rounded-full flex items-center justify-center text-sm font-bold shadow-inner shrink-0">4</span>
              <BlurInText text="Tiempo y Dedicación" />
            </h2>
            <label className="block text-gray-700 font-medium mb-4 text-center w-full">
              <BlurInText text="¿Cuántas horas al día pasará sola la mascota?" />
            </label>
            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="cursor-pointer group">
                <input type="radio" name="tiempo_solo" className="peer hidden" value="poco" required />
                <div className="border-2 border-white/60 rounded-2xl p-5 hover:border-blue-300 transition text-center h-full flex flex-col justify-center items-center bg-white/40 peer-checked:border-[#0B84FF] peer-checked:bg-[#EBF5FF] peer-checked:shadow-[0_4px_6px_rgba(11,132,255,0.1)]">
                  <span className="font-semibold text-gray-700">Menos de 4h</span>
                </div>
              </label>
              <label className="cursor-pointer group">
                <input type="radio" name="tiempo_solo" className="peer hidden" value="medio" />
                <div className="border-2 border-white/60 rounded-2xl p-5 hover:border-blue-300 transition text-center h-full flex flex-col justify-center items-center bg-white/40 peer-checked:border-[#0B84FF] peer-checked:bg-[#EBF5FF] peer-checked:shadow-[0_4px_6px_rgba(11,132,255,0.1)]">
                  <span className="font-semibold text-gray-700">4 a 8 horas</span>
                </div>
              </label>
              <label className="cursor-pointer group">
                <input type="radio" name="tiempo_solo" className="peer hidden" value="mucho" />
                <div className="border-2 border-white/60 rounded-2xl p-5 hover:border-blue-300 transition text-center h-full flex flex-col justify-center items-center bg-white/40 peer-checked:border-[#0B84FF] peer-checked:bg-[#EBF5FF] peer-checked:shadow-[0_4px_6px_rgba(11,132,255,0.1)]">
                  <span className="font-semibold text-gray-700">Más de 8h</span>
                </div>
              </label>
            </div>
          </FadeUp>

          <FadeUp className="bg-transparent p-8 md:p-10 rounded-3xl flex flex-col items-center w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center justify-center gap-3 w-full text-center">
              <span className="w-8 h-8 bg-blue-100 text-[#0B84FF] rounded-full flex items-center justify-center text-sm font-bold shadow-inner shrink-0">5</span>
              <BlurInText text="Tu Experiencia" />
            </h2>
            <div className="w-full grid grid-cols-1 gap-4 max-w-xl mx-auto">
              <label className="cursor-pointer group">
                <input type="radio" name="experiencia" className="peer hidden" value="principiante" required />
                <div className="border-2 border-white/60 rounded-2xl p-4 flex items-center gap-4 hover:border-blue-300 transition bg-white/40 peer-checked:border-[#0B84FF] peer-checked:bg-[#EBF5FF] peer-checked:shadow-[0_4px_6px_rgba(11,132,255,0.1)]">
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    <Baby className="w-6 h-6 transition" />
                  </div>
                  <div>
                    <span className="font-bold text-gray-800 block">Soy Principiante</span>
                    <span className="text-sm text-gray-500">Busco una mascota fácil de educar.</span>
                  </div>
                </div>
              </label>
              <label className="cursor-pointer group">
                <input type="radio" name="experiencia" className="peer hidden" value="experto" />
                <div className="border-2 border-white/60 rounded-2xl p-4 flex items-center gap-4 hover:border-blue-300 transition bg-white/40 peer-checked:border-[#0B84FF] peer-checked:bg-[#EBF5FF] peer-checked:shadow-[0_4px_6px_rgba(11,132,255,0.1)]">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                    <Trophy className="w-6 h-6 transition" />
                  </div>
                  <div>
                    <span className="font-bold text-gray-800 block">Tengo Experiencia</span>
                    <span className="text-sm text-gray-500">Puedo manejar razas con carácter.</span>
                  </div>
                </div>
              </label>
            </div>
          </FadeUp>

          <div className="text-center pt-8 pb-12">
            <FadeUp>
              <button type="submit"
                className="w-full md:w-auto bg-[#0B84FF] text-white text-xl font-bold px-12 py-4 rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 hover:scale-105 transition transform duration-200 flex items-center justify-center gap-2 mx-auto">
                <Search className="w-6 h-6" />
                Ver Resultados
              </button>
            </FadeUp>
            <p className="text-gray-400 text-sm mt-4">
              <BlurInText text="Analizaremos cientos de perfiles en segundos." />
            </p>
          </div>

        </form>
      </main>

      </div>
      <Notification toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}
