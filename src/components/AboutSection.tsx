import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'motion/react';
import { Marquee } from "./ui/marquee";

const items = [
  {
    name: "Emma Wilson",
    title: "Adoptante feliz",
    image: "https://cdn.badtz-ui.com/images/components/avatar-proof/avatar-2.webp",
    body: "Pawtok hizo que el proceso de adopción fuera increíblemente fácil. Ahora tenemos a nuestro mejor amigo en casa.",
  },
  {
    name: "Lucas Chen",
    title: "Voluntario",
    image: "https://cdn.badtz-ui.com/images/components/avatar-proof/avatar-1.webp",
    body: "Me encanta cómo la plataforma conecta a los refugios con las personas. Ha reducido significativamente el tiempo de espera.",
  },
  {
    name: "Sophia Martinez",
    title: "Refugio Animal Feliz",
    image: "https://cdn.badtz-ui.com/images/components/avatar-proof/avatar-5.webp",
    body: "Una herramienta brillante. Cada componente se siente pensado para ayudar a las mascotas. Es nuestra plataforma principal.",
  },
  {
    name: "Oliver Thompson",
    title: "Donante activo",
    image: "https://cdn.badtz-ui.com/images/components/avatar-proof/avatar-4.webp",
    body: "La transparencia y la eficiencia de Pawtok me dan mucha confianza para seguir apoyando la causa animal.",
  },
];

function TestimonialCard({ item }: { item: (typeof items)[number] }) {
  return (
    <div className="relative flex h-full w-[20rem] flex-col items-start justify-between rounded-xl border border-gray-100 bg-white/60 backdrop-blur-sm p-4 shadow-sm transition-colors hover:bg-gray-50/80">
      <div className="mb-4 text-sm text-gray-500 text-left">
        {item.body}
      </div>
      <div className="mt-auto flex items-center gap-4">
        <div className="relative h-10 w-10 overflow-hidden rounded-full">
          <img
            src={item.image}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex flex-col text-left">
          <div className="text-sm font-medium text-gray-900">
            {item.name}
          </div>
          <div className="text-xs text-gray-500">
            {item.title}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AboutSection() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { margin: "-35% 0px -35% 0px" });

  useEffect(() => {
    setIsOpen(isInView);
  }, [isInView]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div ref={sectionRef} className="w-full mt-0 pt-0 pb-28 px-6 flex flex-col justify-center items-center text-center overflow-hidden">
      <div 
        className={`relative w-full max-w-4xl mx-auto mt-0 pt-3 rounded-3xl transition-all duration-500 flex items-center justify-center ${isOpen ? '' : ''}`}
        style={{ minHeight: '350px' }}
      >
        {/* Animated Paw Print Button */}
        <motion.div
          className="absolute z-20 cursor-pointer"
          initial={{ opacity: 0, filter: "blur(10px)", y:12 }}
          whileInView={{ opacity: 1, filter: "blur(0px)", y:0 }}
          viewport={{ once: true, margin: "-50px" }}
          animate={{
            x: isOpen ? (isMobile ? 0 : -270) : 0,
            y: isOpen ? (isMobile ? -120 : 0) : 0,
            rotate: isOpen ? 0 : 0,
            scale: isOpen ? (isMobile ? 0.8 : 1) : 1
          }}
          transition={{ 
            type: "spring", stiffness: 200, damping: 20,
            delay: isOpen ? 0.4 : 0,
            opacity: { duration: 0.8, ease: "easeOut", delay: 0 },
            filter: { duration: 0.8, ease: "easeOut", }
          }}
          whileHover={{ scale: isOpen ? (isMobile ? 0.8 : 1) : 1, rotate: isOpen ? -15 : 5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="w-40 h-40 sm:w-56 sm:h-56 md:w-72 md:h-72 flex items-center justify-center relative transition-colors">
            <img 
              src="/huella.png" 
              alt="Huella" 
              className="w-full h-full object-contain transition-all hover:-translate-y-2 hover:drop-shadow-2xl" 
            />

          </div>
        </motion.div>

        {/* Text Container sliding from right */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, x: isMobile ? 0 : 150, y: isMobile ? 50 : 0, filter: "blur(12px)" }}
              animate={{ opacity: 1, x: isMobile ? 0 : 100, y: isMobile ? 80 : 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: isMobile ? 0 : 150, y: isMobile ? 50 : 0, filter: "blur(12px)", transition: { delay: 0 } }}
              transition={{ delay: 0.4, duration: 0.5, type: "spring", stiffness: 200, damping: 20 }}
              className="absolute max-w-sm md:max-w-md lg:max-w-lg text-center md:text-left px-4"
            >
              <h2 className="font-display font-semibold pt-3 text-3xl sm:text-4xl text-gray-800 tracking-tight mb-4">
                Acerca de Pawtok
              </h2>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                Pawtok nace como un proyecto dedicado a transformar vidas, tanto de animales como de personas. Creemos que cada mascota tiene una historia y merece un hogar donde pueda ser feliz.
              </p>
              
              <motion.div
                initial={{ opacity: 0, filter: "blur(12px)", y: 10 }}
                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                exit={{ opacity: 0, filter: "blur(12px)", transition: { delay: 0 } }}
                transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
                className="relative w-full max-w-[700px] overflow-hidden mt-6"
              >
                <div className="absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white to-transparent" />
                <div className="absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white to-transparent" />
                <Marquee className="py-2" direction="left" duration={40}>
                  {[...items, ...items].map((item, index) => (
                    <TestimonialCard key={index} item={item} />
                  ))}
                </Marquee>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
