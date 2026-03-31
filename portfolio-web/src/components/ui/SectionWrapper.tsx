'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'left' | 'right' | 'none';
}

export default function SectionWrapper({
  children,
  className = '',
  delay = 0,
  direction = 'up',
}: SectionWrapperProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const initialOffset = {
    up: { y: 48, x: 0 },
    left: { y: 0, x: -48 },
    right: { y: 0, x: 48 },
    none: { y: 0, x: 0 },
  }[direction];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...initialOffset }}
      animate={isInView ? { opacity: 1, y: 0, x: 0 } : { opacity: 0, ...initialOffset }}
      transition={{ duration: 0.6, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
