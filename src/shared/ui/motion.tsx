'use client';

import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/core/lib/cn';

interface MotionPageProps {
  children: ReactNode;
  className?: string;
}

export function MotionPage({ children, className }: MotionPageProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 14, scale: 0.995 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={reduceMotion ? undefined : { opacity: 0, y: -8, scale: 0.995 }}
      transition={{ duration: reduceMotion ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

interface MotionListProps {
  children: ReactNode;
  className?: string;
}

export function MotionList({ children, className }: MotionListProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: {
          transition: reduceMotion ? { staggerChildren: 0 } : { staggerChildren: 0.045 },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

interface MotionItemProps {
  children: ReactNode;
  className?: string;
}

export function MotionItem({ children, className }: MotionItemProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      variants={{
        hidden: reduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 },
        show: { opacity: 1, y: 0 },
      }}
      transition={{ duration: reduceMotion ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

interface MotionPressProps {
  children: ReactNode;
  className?: string;
}

export function MotionPress({ children, className }: MotionPressProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={cn('will-change-transform', className)}
      whileTap={reduceMotion ? undefined : { scale: 0.985 }}
      transition={{ duration: 0.12 }}
    >
      {children}
    </motion.div>
  );
}
