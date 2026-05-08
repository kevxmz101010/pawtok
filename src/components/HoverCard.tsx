import React, { useRef, useState } from 'react';
import { Cursor } from './ui/cursor';
import { AnimatePresence, motion } from 'framer-motion';
import { PlusIcon } from 'lucide-react';

interface HoverCardProps {
  title: string;
  description: string;
  delay: number;
}

export function HoverCard({ title, description, delay }: HoverCardProps) {
  const [isHovering, setIsHovering] = useState(false);
  const targetRef = useRef<HTMLDivElement>(null);

  const handlePositionChange = (x: number, y: number) => {
    if (targetRef.current) {
      const rect = targetRef.current.getBoundingClientRect();
      const isInside =
        x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
      setIsHovering(isInside);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className="relative group cursor-none bg-gray-50/80 backdrop-blur-xl border border-gray-200/60 p-8 sm:p-10 rounded-3xl shadow-[0px_15px_35px_-10px_rgba(0,0,0,0.05)] text-left flex flex-col hover:bg-gray-100 transition-colors"
    >
      <Cursor
        attachToParent
        variants={{
          initial: { scale: 0.3, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          exit: { scale: 0.3, opacity: 0 },
        }}
        springConfig={{
          bounce: 0.001,
        }}
        transition={{
          ease: 'easeInOut',
          duration: 0.15,
        }}
        onPositionChange={handlePositionChange}
      >
        <motion.div
          animate={{
            width: isHovering ? 80 : 16,
            height: isHovering ? 32 : 16,
          }}
          className='flex items-center justify-center rounded-[24px] bg-[#0B84FF]/80 backdrop-blur-md shadow-sm'
        >
          <AnimatePresence>
            {isHovering ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                className='inline-flex w-full items-center justify-center'
              >
                <div className='inline-flex items-center text-sm text-white'>
                  More <PlusIcon className='ml-1 h-4 w-4' />
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      </Cursor>
      
      {/* Target for the cursor expansion */}
      <div ref={targetRef} className="flex flex-col items-center justify-center gap-3 sm:gap-4 flex-1">
        <h3 className="text-2xl sm:text-4xl font-normal text-gray-900 tracking-tight text-center">{title}</h3>
        <p className="text-sm sm:text-base text-gray-700 leading-relaxed font-normal text-center">
          {description}
        </p>
      </div>
    </motion.div>
  );
}
