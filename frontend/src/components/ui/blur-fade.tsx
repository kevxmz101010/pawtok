"use client";

import { motion, Variants } from "framer-motion";

interface BlurFadeProps {
  children: React.ReactNode;
  className?: string;
  variant?: Variants;
  duration?: number;
  delay?: number;
  yOffset?: number;
  inView?: boolean;
  inViewMargin?: string;
  blur?: string;
}

export function BlurFade({
  children,
  className,
  variant,
  duration = 0.65,
  delay = 0,
  yOffset = 36,
  inView = false,
  inViewMargin = "-50px",
  blur = "12px",
}: BlurFadeProps) {
  const defaultVariants: Variants = {
    hidden: { y: yOffset, opacity: 0, filter: `blur(${blur})` },
    visible: { 
      y: 0, 
      opacity: 1, 
      filter: "blur(0px)",
      transition: {
        delay,
        duration,
        ease: [0.16, 1, 0.3, 1],
      }
    },
  };
  const combinedVariants = variant || defaultVariants;

  if (inView) {
    return (
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: inViewMargin as any, amount: 0.15 }}
        variants={combinedVariants}
        className={className}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={combinedVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

