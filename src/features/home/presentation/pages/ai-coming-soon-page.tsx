'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { Icon, MotionPage } from '@/shared/ui';
import { AdamAvatar } from '@/features/dashboard/presentation/sections/dashboard-sidebar';

export function AiComingSoonPage() {
  const reduceMotion = useReducedMotion();

  return (
    <MotionPage className="mx-auto flex w-full max-w-3xl items-center justify-center">
      <section className="border-hair relative w-full overflow-hidden rounded-[28px] border p-6 text-center [background:radial-gradient(circle_at_50%_0%,rgba(255,98,0,.2),transparent_38%),var(--glass)] sm:p-10">
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,98,0,.8),transparent)]" />

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: reduceMotion ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mb-6 grid size-28 place-items-center rounded-full border border-[rgba(255,98,0,.28)] [background:rgba(255,98,0,.08)]"
        >
          <AdamAvatar className="size-20" />
        </motion.div>

        <span className="text-ember mb-3 inline-flex items-center gap-2 rounded-full border border-[rgba(255,98,0,.22)] px-3 py-1 text-xs font-extrabold [background:rgba(255,98,0,.1)]">
          <Icon name="ai" size={15} />
          آدم در حال آماده شدن است
        </span>

        <h1 className="text-3xl leading-tight font-black text-balance sm:text-4xl">
          پنل هوش مصنوعی قبیله به‌زودی فعال می‌شود
        </h1>
        {/* <p className="text-ink-2 mx-auto mt-4 max-w-xl text-sm leading-8 sm:text-base">
          این بخش را از خانه جدا کردیم تا بعداً مثل یک feature مستقل توسعه پیدا کند؛ با
          conversation history، پیشنهاد مسیر، و پاسخ‌های هوشمندتر.
        </p> */}

        <div className="mt-8 flex flex-col-reverse items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/home"
            className="text-ink border-hair inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border px-5 text-sm font-bold transition-[transform,border-color] duration-300 [background:var(--glass-2)] hover:-translate-y-0.5 hover:border-[rgba(255,98,0,.45)]"
          >
            برگشت به خانه
          </Link>
          <Link
            href="/courses"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-6 text-sm font-extrabold text-[#1a0a00] transition-[transform,box-shadow] duration-300 [background:var(--fire-grad)] hover:-translate-y-0.5 hover:shadow-[0_14px_40px_-12px_var(--glow)]"
          >
            ادامه یادگیری
            <Icon name="arrow-left" size={18} />
          </Link>
        </div>
      </section>
    </MotionPage>
  );
}
