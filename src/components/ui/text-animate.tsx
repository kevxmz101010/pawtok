"use client";

import { motion, Variants } from "motion/react";

interface TextAnimateProps {
  children: string;
  animation?: "blurInUp" | "blurIn";
  by?: "character" | "word";
  once?: boolean;
  delay?: number;
  className?: string;
}

export function TextAnimate({
  children,
  animation = "blurInUp",
  by = "character",
  once = true,
  delay = 0,
  className = "",
}: TextAnimateProps) {
  // Split by character or word.
  // When splitting by character, newline \n is preserved as an individual character.
  const items = by === "character" ? children.split("") : children.split(" ");

  const container: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: by === "character" ? 0.03 : 0.08,
        delayChildren: delay,
      },
    },
  };

  const item: Variants = {
    hidden: { 
      opacity: 0, 
      y: animation === "blurInUp" ? 15 : 0, 
      filter: "blur(8px)" 
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  return (
    <motion.span
      className={`inline-block ${className}`}
      variants={container}
      initial="hidden"
      animate="visible"
      viewport={{ once }}
    >
      {items.map((segment, i) => {
        if (segment === "\n") {
          return <br key={i} />;
        }
        return (
          <motion.span
            key={i}
            variants={item}
            className={`inline-block ${segment === " " ? "w-[0.3em]" : ""}`}
          >
            {segment === " " ? "\u00A0" : segment}
          </motion.span>
        );
      })}
    </motion.span>
  );
}
