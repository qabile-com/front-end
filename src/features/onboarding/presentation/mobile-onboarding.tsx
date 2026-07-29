'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { BaseModal, Button, Icon } from '@/shared/ui';
import { cn } from '@/core/lib/cn';
import { ONBOARDING_SLIDES } from '../domain/onboarding.data';

const MOBILE_QUERY = '(max-width: 767px)';

interface MobileOnboardingProps {
  isComplete?: boolean;
  onComplete: () => Promise<void> | void;
}

export function MobileOnboarding({ isComplete = false, onComplete }: MobileOnboardingProps) {
  const [isReady, setIsReady] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const reduceMotion = useReducedMotion();

  const isLastSlide = activeIndex === ONBOARDING_SLIDES.length - 1;
  const activeSlide = ONBOARDING_SLIDES[activeIndex];

  const completeOnboarding = useCallback(async () => {
    if (isSaving) return;

    setIsSaving(true);
    try {
      await onComplete();
      setIsOpen(false);
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, onComplete]);

  const goNext = useCallback(() => {
    if (isLastSlide) {
      void completeOnboarding();
      return;
    }

    setActiveIndex((current) => Math.min(current + 1, ONBOARDING_SLIDES.length - 1));
  }, [completeOnboarding, isLastSlide]);

  const goPrevious = useCallback(() => {
    setActiveIndex((current) => Math.max(current - 1, 0));
  }, []);

  useEffect(() => {
    const media = window.matchMedia(MOBILE_QUERY);

    const updateVisibility = () => {
      const shouldOpen = media.matches && !isComplete;

      setIsReady(media.matches);
      setIsOpen(shouldOpen);
    };

    updateVisibility();
    media.addEventListener('change', updateVisibility);

    return () => media.removeEventListener('change', updateVisibility);
  }, [isComplete]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === 'ArrowRight') void goNext();
      if (event.key === 'ArrowLeft') goPrevious();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goPrevious, isOpen]);

  const dots = useMemo(
    () =>
      ONBOARDING_SLIDES.map((slide, index) => (
        <button
          key={slide.id}
          type="button"
          aria-label={`رفتن به اسلاید ${index + 1}`}
          aria-current={index === activeIndex ? 'step' : undefined}
          onClick={() => setActiveIndex(index)}
          className={cn(
            'h-1.5 rounded-full transition-all duration-300',
            index === activeIndex
              ? 'w-9 bg-gradient-to-r shadow-[0_0_16px_rgba(255,98,0,.35)]'
              : 'w-3 bg-[#7a5a37]/70',
            index === activeIndex && activeSlide.accentClassName,
          )}
        />
      )),
    [activeIndex, activeSlide.accentClassName],
  );

  if (!isReady) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={() => void completeOnboarding()}
      title="آشنایی با قبیله"
      closeOnOutsideClick={false}
      zIndexClassName="z-[1200]"
      className="h-[100dvh] p-0 md:hidden"
      panelClassName="h-[100dvh] max-h-[100dvh] w-full"
      contentClassName="h-[100dvh] max-h-[100dvh] overflow-hidden"
    >
      <section
        dir="ltr"
        className="relative flex h-[100dvh] w-full touch-pan-y flex-col overflow-hidden bg-black text-white"
        onTouchStart={(event) => {
          touchStartX.current = event.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(event) => {
          if (touchStartX.current === null) return;
          const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
          const deltaX = endX - touchStartX.current;
          touchStartX.current = null;

          if (Math.abs(deltaX) < 48) return;
          if (deltaX > 0) void goNext();
          if (deltaX < 0) goPrevious();
        }}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-24 bg-gradient-to-b from-black via-black/50 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[44%] bg-gradient-to-t from-black via-black/90 to-transparent" />

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeSlide.id}
            role="img"
            aria-label={activeSlide.imageAlt}
            className="absolute inset-x-0 top-0 h-[76dvh] w-full bg-cover bg-center bg-no-repeat min-[480px]:[background-position:center_28%]"
            style={{
              backgroundImage: `url(${activeSlide.imageSrc})`,
              WebkitMaskImage:
                'linear-gradient(to bottom, black 0%, black 62%, rgba(0,0,0,.78) 72%, transparent 100%)',
              maskImage:
                'linear-gradient(to bottom, black 0%, black 62%, rgba(0,0,0,.78) 72%, transparent 100%)',
            }}
            initial={reduceMotion ? false : { opacity: 0, x: 28, scale: 1.02 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, x: -22, scale: 0.99 }}
            transition={{ duration: reduceMotion ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
          />
        </AnimatePresence>

        <div className="relative z-30 flex min-h-0 flex-1 flex-col justify-end px-5 pt-[calc(env(safe-area-inset-top)+14px)] pb-[calc(env(safe-area-inset-bottom)+16px)]">
          <div className="flex shrink-0 items-center justify-between">
            {activeIndex > 0 ? (
              <button
                type="button"
                onClick={() => goPrevious()}
                aria-label="اسلاید قبلی"
                className="grid size-11 place-items-center rounded-full border border-white/10 bg-black/30 text-white/85 backdrop-blur-md transition-colors hover:bg-white/10"
              >
                <Icon name="arrow" size={20} />
              </button>
            ) : (
              <span className="size-11" />
            )}

            <button
              type="button"
              onClick={() => void completeOnboarding()}
              disabled={isSaving}
              className="min-h-11 rounded-full border border-white/10 bg-black/30 px-4 text-xs font-black text-white/75 backdrop-blur-md transition-colors hover:bg-white/10 hover:text-white"
            >
              رد کردن
            </button>
          </div>

          <div className="min-h-0 flex-1" />

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${activeSlide.id}-content`}
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
              transition={{ duration: reduceMotion ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto w-full max-w-[370px] text-center"
              dir="rtl"
            >
              <h2 className="text-[23px] leading-9 font-black text-white drop-shadow-[0_2px_18px_rgba(0,0,0,.65)]">
                {activeSlide.title}
              </h2>
              <p className="mx-auto mt-3 max-w-[320px] text-[13px] leading-7 font-medium text-white/78">
                {activeSlide.description}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="mt-4 flex items-center justify-center gap-2">{dots}</div>

          <Button
            type="button"
            variant="primary"
            block
            className={cn(
              'mt-4 min-h-12 rounded-xl text-[13px] shadow-[0_18px_45px_-20px_rgba(255,98,0,.9)]',
              activeSlide.accentClassName,
            )}
            style={{ background: activeSlide.accentGradient }}
            onClick={() => void goNext()}
            disabled={isSaving}
          >
            {isLastSlide ? 'شروع پرواز' : 'بعدی'}
            <Icon name={isLastSlide ? 'flame' : 'arrow-right'} size={17} />
          </Button>
        </div>
      </section>
    </BaseModal>
  );
}
