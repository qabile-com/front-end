'use client';

import { useEffect, useId, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/core/lib/cn';
import { useScrollLock } from '@/shared/hooks/use-scroll-lock';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  className?: string;
  panelClassName?: string;
  contentClassName?: string;
  zIndexClassName?: string;
  closeOnOutsideClick?: boolean;
  closeOnEscape?: boolean;
}

export function BaseModal({
  isOpen,
  onClose,
  children,
  title,
  className,
  panelClassName,
  contentClassName,
  zIndexClassName = 'z-50',
  closeOnOutsideClick = true,
  closeOnEscape = true,
}: BaseModalProps) {
  const titleId = useId();
  const reduceMotion = useReducedMotion();

  useScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeOnEscape, isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={cn(
            'fixed inset-0 flex items-center justify-center overflow-hidden overscroll-contain bg-black/70 p-4 backdrop-blur-sm',
            zIndexClassName,
            className,
          )}
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.18 }}
          onMouseDown={(event) => {
            if (closeOnOutsideClick && event.target === event.currentTarget) onClose();
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            className={cn('max-h-[calc(100dvh-2rem)] overflow-hidden', panelClassName)}
            initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 10, scale: 0.985 }}
            transition={{ duration: reduceMotion ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            {title && <span id={titleId} className="sr-only">{title}</span>}
            <div
              className={cn(
                'max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain',
                contentClassName,
              )}
            >
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
