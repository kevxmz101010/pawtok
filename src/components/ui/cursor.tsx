import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'motion/react';

interface CursorProps {
  children: React.ReactNode;
  attachToParent?: boolean;
  variants?: any;
  springConfig?: any;
  transition?: any;
  onPositionChange?: (x: number, y: number) => void;
}

export function Cursor({
  children,
  attachToParent,
  variants,
  springConfig,
  transition,
  onPositionChange,
}: CursorProps) {
  const cursorX = useMotionValue(typeof window !== 'undefined' ? window.innerWidth / 2 : 0);
  const cursorY = useMotionValue(typeof window !== 'undefined' ? window.innerHeight / 2 : 0);
  
  const springX = useSpring(cursorX, springConfig || { damping: 20, stiffness: 300, mass: 0.5 });
  const springY = useSpring(cursorY, springConfig || { damping: 20, stiffness: 300, mass: 0.5 });
  const [isVisible, setIsVisible] = useState(!attachToParent);
  const [isMounted, setIsMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (onPositionChange) {
        onPositionChange(e.clientX, e.clientY);
      }
    };

    if (attachToParent && containerRef.current && containerRef.current.parentElement) {
      const parent = containerRef.current.parentElement;
      
      const onEnter = (e: MouseEvent) => {
        cursorX.set(e.clientX);
        cursorY.set(e.clientY);
        setIsVisible(true);
      };
      const onLeave = () => setIsVisible(false);
      
      parent.addEventListener('mousemove', handleMouseMove);
      parent.addEventListener('mouseenter', onEnter);
      parent.addEventListener('mouseleave', onLeave);
      
      // Initialize if mouse is already over
      if (parent.matches(':hover')) {
        setIsVisible(true);
      }
      
      return () => {
        parent.removeEventListener('mousemove', handleMouseMove);
        parent.removeEventListener('mouseenter', onEnter);
        parent.removeEventListener('mouseleave', onLeave);
      };
    } else {
      window.addEventListener('mousemove', handleMouseMove);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
      };
    }
  }, [attachToParent, cursorX, cursorY, onPositionChange]);

  return (
    <>
      <div ref={containerRef} className="hidden" />
      {isMounted && createPortal(
        <AnimatePresence>
          {isVisible && (
            <motion.div
              className="pointer-events-none fixed left-0 top-0 z-[9999] flex items-center justify-center"
              style={{
                x: springX,
                y: springY,
                translateX: '-50%',
                translateY: '-50%',
              }}
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={transition}
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
