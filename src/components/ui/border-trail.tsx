import { motion, Transition } from 'framer-motion';

interface BorderTrailProps {
  className?: string;
  size?: number;
  transition?: Transition;
  style?: React.CSSProperties;
}

export function BorderTrail({
  className,
  size = 60,
  transition,
  style,
}: BorderTrailProps) {
  return (
    <div className="pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)]">
      <motion.div
        className={`absolute aspect-square bg-zinc-500 rounded-full ${className}`}
        style={{
          width: size,
          offsetPath: `rect(0 auto auto 0 round 100px)`,
          ...style,
        }}
        animate={{
          offsetDistance: ['0%', '100%'],
        }}
        transition={{
          duration: 4,
          ease: 'linear',
          repeat: Infinity,
          ...transition,
        }}
      />
    </div>
  );
}
