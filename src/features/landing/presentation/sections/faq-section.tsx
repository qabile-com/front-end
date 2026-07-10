'use client';

import { useState } from 'react';
import { Container, GlassCard, Icon, SectionHead } from '@/shared/ui';
import { cn } from '@/core/lib/cn';
import type { FaqItem } from '../../domain/landing.types';

interface FaqSectionProps {
  faqs: FaqItem[];
}

export function FaqSection({ faqs }: FaqSectionProps) {
  const [open, setOpen] = useState(0);

  return (
    <Container>
      <SectionHead
        center
        eyebrow="سؤالات پرتکرار"
        title={
          <>
            هرچه باید <span className="text-gradient-fire">بدانی</span>
          </>
        }
      />

      <div className="mx-auto flex max-w-[800px] flex-col gap-3">
        {faqs.map((item, i) => {
          const isOpen = open === i;
          return (
            <GlassCard
              key={item.q}
              className={cn(
                'overflow-hidden rounded',
                isOpen &&
                  'border-s-2 border-[rgba(255,98,0,.28)] border-s-[#ff6220] shadow-[0_8px_32px_-16px_var(--glow)] [background:var(--glass-2)]',
              )}
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? -1 : i)}
                aria-expanded={isOpen}
                className="hover:text-gold flex w-full items-center gap-4 px-[22px] py-5 text-start text-base font-bold transition-colors"
              >
                {item.q}
                <span
                  className={cn(
                    'ms-auto grid size-7 shrink-0 place-items-center rounded-xs transition-[transform,background] duration-300',
                    isOpen
                      ? 'rotate-45 border-[0.8px_1.6px_0.8px_0.8px] border-solid text-[#1a0a00] [background:var(--fire-grad)] [border-image-slice:1]'
                      : 'text-gold [background:var(--glass-2)]',
                  )}
                >
                  <Icon name="plus" size={16} />
                </span>
              </button>
              <div
                className={cn(
                  'grid transition-[grid-template-rows] duration-[450ms] ease-[cubic-bezier(.4,0,.2,1)]',
                  isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                )}
              >
                <div className="overflow-hidden">
                  <p className="border-hair text-ink-2 mt-1 border-t px-[22px] pt-4 pb-[22px] leading-[1.95]">
                    {item.a}
                  </p>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </Container>
  );
}
