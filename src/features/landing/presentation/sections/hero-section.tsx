'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button, Container, Icon, OptionalImage, PhoenixArt } from '@/shared/ui';

const TRUST_AVATARS = [
  'linear-gradient(135deg,#ff8a3d,#cc4308)',
  'linear-gradient(135deg,#f3ba63,#cc7a08)',
  'linear-gradient(135deg,#5b7cfa,#9b6bff)',
  'linear-gradient(135deg,#2bd4a8,#1f8a5b)',
  'linear-gradient(135deg,#ff5a5a,#c01616)',
];

const CHIPS = [
  { cls: 'top-[10%] start-0', icon: 'bolt', value: '۲٬۴۸۰', label: 'امتیاز امروز' },
  { cls: 'bottom-[16%] start-[-4%]', icon: 'flame', value: '۳۱ روز', label: 'زنجیره‌ی پیوسته' },
  { cls: 'bottom-[8%] end-[4%]', icon: 'medal', value: 'سطح ۲۴', label: 'ققنوس طلایی' },
] as const;

export function HeroSection() {
  const imgRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let ticking = false;
    const onMove = (e: MouseEvent) => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const dx = (e.clientX / window.innerWidth - 0.5) * 2;
        const dy = (e.clientY / window.innerHeight - 0.5) * 2;
        if (imgRef.current) {
          imgRef.current.style.transform = `rotate(${dx * 2}deg) translateX(${dx * 5}px) translateY(${dy * 4}px)`;
        }
        if (glowRef.current) {
          glowRef.current.style.transform = `scale(${1 + Math.abs(dx) * 0.06}) translateX(${dx * 9}px)`;
        }
        ticking = false;
      });
    };
    const onLeave = () => {
      const ease = 'transform 1.2s cubic-bezier(.2,.7,.3,1)';
      if (imgRef.current) {
        imgRef.current.style.transition = ease;
        imgRef.current.style.transform = '';
      }
      if (glowRef.current) {
        glowRef.current.style.transition = ease;
        glowRef.current.style.transform = '';
      }
      setTimeout(() => {
        if (imgRef.current) imgRef.current.style.transition = '';
        if (glowRef.current) glowRef.current.style.transition = '';
      }, 1200);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <section className="relative flex min-h-screen items-center pt-[160px] pb-[90px]">
      <Container>
        <div className="grid items-center gap-11 lg:grid-cols-[1.1fr_.9fr]">
          <div>
            <span className="border-hair text-ink-2 mb-6 inline-flex items-center gap-2.25 rounded-full border py-1.5 ps-2 pe-3.5 text-[13px] font-semibold [backdrop-filter:blur(var(--glass-blur))] [background:var(--glass)]">
              <span className="rounded-full px-2.25 py-0.75 text-[10.5px] font-extrabold text-[#1a0a00] [background:var(--gold-grad)]">
                نسخه ۲٫۰
              </span>
              بیش از ۵۲٬۰۰۰ ققنوس در حال پرواز
            </span>

            <h1 className="text-[clamp(34px,6vw,58px)] leading-[1.08] font-black tracking-[-0.02em]">
              از خاکستر،
              <br />
              <span className="text-gradient-fire">برخیز.</span>
            </h1>

            <p className="text-ink-2 mt-5 max-w-[520px] text-[clamp(15px,1.5vw,18px)] leading-[1.9]">
              قبیله ققنوس یک اکوسیستم یادگیریِ گیمیفای‌شده است؛ با نقشه‌راه‌های ساختاریافته، منتور
              هوش مصنوعی، رقابتِ سالم و دستاوردهای واقعی — هر روز نسخه‌ای قوی‌تر از خودت بساز.
            </p>

            <div className="mt-8 flex flex-wrap gap-3.5">
              <Link href="/auth" className="max-sm:flex-1">
                <Button variant="primary" size="lg" block>
                  شروع رایگان سفر
                  <Icon name="flame" />
                </Button>
              </Link>
              <Link href="/dashboard" className="max-sm:flex-1">
                <Button variant="ghost" size="lg" block>
                  تماشای دمو
                  <Icon name="play" />
                </Button>
              </Link>
            </div>

            <div className="mt-9 flex items-center gap-4">
              <div className="flex">
                {TRUST_AVATARS.map((bg, i) => (
                  <span
                    key={i}
                    className="border-bg -ms-2.5 size-9 rounded-full border-2 shadow-[0_2px_8px_rgba(0,0,0,.5)] first:ms-0"
                    style={{ background: bg }}
                  />
                ))}
              </div>
              <div className="text-[13px] leading-tight">
                <p className="text-ink-2">
                  <b className="text-ink">۵۲٬۰۰۰+</b> عضو فعال قبیله
                </p>
                <p className="text-gold">★★★★★ امتیاز ۴٫۹ از ۵</p>
              </div>
            </div>
          </div>

          <div className="relative mx-auto grid w-full max-w-[580px] place-items-center max-lg:max-w-[380px]">
            <div
              ref={glowRef}
              className="phoenix-glow pointer-events-none absolute inset-[-15%] z-0 rounded-full [background:radial-gradient(ellipse_70%_60%_at_50%_42%,rgba(255,98,0,.22),rgba(204,67,8,.08)_45%,transparent_70%)]"
            />
            <div ref={imgRef} className="phoenix-img relative z-[1] w-full max-w-[520px]">
              <PhoenixVisual />
            </div>

            {CHIPS.map((chip) => (
              <div
                key={chip.label}
                className={`chip-float border-hair absolute z-[3] flex items-center gap-2.25 rounded-[13px] border px-3.25 py-2.25 shadow-[0_10px_28px_-10px_rgba(0,0,0,.7)] backdrop-blur-lg [background:rgba(15,9,5,.72)] ${chip.cls}`}
              >
                <span className="text-gold grid size-8 place-items-center rounded-[9px] [background:var(--glass-2)]">
                  <Icon name={chip.icon} size={16} />
                </span>
                <span className="leading-tight">
                  <b className="block text-sm font-extrabold">{chip.value}</b>
                  <span className="text-ink-3 text-[11px]">{chip.label}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

function PhoenixVisual() {
  return (
    <div className="relative aspect-square w-full">
      <PhoenixArt className="size-full" />
      <OptionalImage src="/assets/phoenix.png" alt="ققنوس" className="object-contain" />
    </div>
  );
}
