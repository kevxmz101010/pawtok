import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function CurveCarousel({ images }: { images: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div 
      className="relative w-full max-w-4xl mx-auto h-[400px] flex items-center justify-center overflow-hidden"
      style={{ perspective: '1200px' }}
    >
      <div className="absolute inset-0 flex items-center justify-center preserve-3d">
        {images.map((img, idx) => {
          let diff = idx - currentIndex;
          
          // Smooth wrap-around math for small arrays
          const half = Math.floor(images.length / 2);
          if (diff > half) diff -= images.length;
          if (diff < -half) diff += images.length;

          const isActive = diff === 0;
          const rotateY = diff * -35; // Curve angle
          const translateZ = Math.abs(diff) * -150; // Depth push back
          const xOffset = diff * 180; // Horizontal spread
          const scale = isActive ? 1 : 0.85;
          const opacity = Math.abs(diff) > 2 ? 0 : 1;

          return (
            <motion.div
              key={idx}
              className={`absolute w-72 h-[350px] md:w-80 md:h-[400px] rounded-[2rem] overflow-hidden shadow-2xl cursor-pointer bg-gray-100 ${isActive ? 'ring-4 ring-white/50 shadow-[0_30px_60px_rgba(0,0,0,0.3)]' : 'shadow-[0_10px_30px_rgba(0,0,0,0.2)]'}`}
              initial={false}
              animate={{
                rotateY,
                z: translateZ,
                x: xOffset,
                scale,
                opacity,
                zIndex: 100 - Math.abs(diff)
              }}
              transition={{ type: "spring", stiffness: 150, damping: 20, mass: 1 }}
              onClick={() => setCurrentIndex(idx)}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = offset.x;
                if (swipe < -50) next();
                else if (swipe > 50) prev();
              }}
            >
              <img src={img} alt={`Slide ${idx}`} className="w-full h-full object-cover select-none pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
            </motion.div>
          );
        })}
      </div>

      {/* Nav Buttons */}
      <button 
        onClick={prev} 
        className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 z-50 p-4 bg-white/30 backdrop-blur-xl border border-white/40 rounded-full text-white hover:bg-white/50 transition shadow-lg active:scale-95 cursor-pointer"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button 
        onClick={next} 
        className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 z-50 p-4 bg-white/30 backdrop-blur-xl border border-white/40 rounded-full text-white hover:bg-white/50 transition shadow-lg active:scale-95 cursor-pointer"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  );
}
