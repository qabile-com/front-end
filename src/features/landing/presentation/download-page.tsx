'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { BackgroundField, Button, Container, GlassCard, Icon, MotionPage, Reveal } from '@/shared/ui';
import { cn } from '@/core/lib/cn';
import { SiteNav } from './sections/site-nav';
import { SiteFooter } from './sections/site-footer';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const DOWNLOAD_ASSETS = {
  heroPhoenix: '/assets/download/download-hero-phoenix.webp',
  heroMobile: '/assets/download/download-hero-mobile.webp',
  installGuide: '/assets/download/download-how-to-install.webp',
} as const;

const FAQS = [
  {
    q: 'قبیله ققنوس دقیقاً چه چیزی است؟',
    a: 'یک اکوسیستم یادگیری گیمیفای‌شده برای رشد فردی و توسعه مهارت است؛ جایی که با نقشه‌راه‌ها، تمرین‌ها، محفل، آتش، دستاوردها و منتور هوشمند مسیر رشدت را منظم‌تر جلو می‌بری.',
  },
  {
    q: 'آیا برای شروع باید هزینه‌ای بپردازم؟',
    a: 'نه. شروع مسیر رایگان است و می‌توانی اپلیکیشن PWA را نصب کنی، وارد قبیله شوی و قدم‌های اولیه مسیر رشدت را برداری.',
  },
  {
    q: 'منتور هوش مصنوعی چطور به من کمک می‌کند؟',
    a: 'آدم به تو کمک می‌کند مسیرت را بهتر بفهمی، سؤال‌هایت را بپرسی، تمرکزت را برگردانی و قدم بعدی مناسب را پیدا کنی.',
  },
  {
    q: 'گیمیفیکیشن واقعاً به یادگیری کمک می‌کند؟',
    a: 'وقتی پیشرفت دیده شود، پاداش روشن باشد و مسیر به قدم‌های کوچک تقسیم شود، ادامه دادن ساده‌تر می‌شود. آتش، streak و دستاوردها دقیقاً برای همین طراحی شده‌اند.',
  },
  {
    q: 'روی موبایل هم در دسترس است؟',
    a: 'بله. قبیله به‌صورت PWA نصب می‌شود؛ یعنی بدون App Store یا Google Play می‌توانی آن را مثل یک اپلیکیشن روی صفحه اصلی موبایلت داشته باشی.',
  },
];

const INSTALL_STEPS_ANDROID = [
  'با مرورگر Chrome وارد سایت qabile.com شو.',
  'از منوی مرورگر گزینه Install app یا Add to Home Screen را انتخاب کن.',
  'نصب را تأیید کن تا آیکن قبیله روی صفحه اصلی موبایلت اضافه شود.',
];

const INSTALL_STEPS_IOS = [
  'با مرورگر Safari وارد سایت qabile.com شو.',
  'روی دکمه Share پایین صفحه بزن.',
  'گزینه Add to Home Screen را انتخاب کن و سپس Add را بزن.',
];

export function DownloadPage() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installHint, setInstallHint] = useState<string | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const scrollToGuide = useCallback(() => {
    document
      .getElementById('install-guide')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handleInstall = useCallback(async () => {
    if (!installPrompt) {
      setInstallHint('اگر پنجره نصب باز نشد، از راهنمای نصب پایین همین صفحه استفاده کن.');
      scrollToGuide();
      return;
    }

    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === 'dismissed') {
      setInstallHint(
        'اگر نصب را رد کردی، هر زمان خواستی از منوی مرورگر دوباره Add to Home Screen را بزن.',
      );
    }
    setInstallPrompt(null);
  }, [installPrompt, scrollToGuide]);

  return (
    <MotionPage>
      <BackgroundField />
      <SiteNav />
      <main className="relative w-full overflow-x-clip pt-[72px]">
        <DownloadHero
          onInstall={() => void handleInstall()}
          onGuide={scrollToGuide}
          hint={installHint}
        />
        <InstallGuide />
        <DownloadFaq />
        <DownloadCta />
      </main>
      <SiteFooter />
    </MotionPage>
  );
}

function DownloadHero({
  onInstall,
  onGuide,
  hint,
}: {
  onInstall: () => void;
  onGuide: () => void;
  hint: string | null;
}) {
  return (
    <section className="relative min-h-[calc(100dvh-72px)] overflow-hidden py-12 sm:py-16 lg:py-0">
      <Container className="grid min-h-[620px] items-center gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <Reveal delay={1} className="relative z-10 text-center lg:text-right">
          <span className="border-hair text-gold mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-black [background:var(--glass)]">
            <span className="bg-ember size-1.5 rounded-full shadow-[0_0_10px_var(--color-ember)]" />
            نسخه PWA قبیله
          </span>
          <h1 className="text-[clamp(34px,5vw,64px)] leading-[1.15] font-black text-white">
            دانلود اپلیکیشن <span className="text-gradient-fire">قبیله ققنوس</span>
          </h1>
          <p className="text-ink-2 mx-auto mt-5 max-w-[560px] text-[15px] leading-8 lg:mx-0">
            در قبیله ققنوس، یادگیری به یک مسیر جذاب و هدفمند تبدیل می‌شود. با همراهی منتور هوش
            مصنوعی، مسیرهای ساختاریافته و چالش‌های متنوع، هر روز قدمی به سمت بهترین نسخه خودت بردار.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={onInstall}
              className="min-h-13 rounded-[14px]"
            >
              <Icon name="flame" size={18} />
              نصب اپلیکیشن
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={onGuide}
              className="min-h-13 rounded-[14px]"
            >
              راهنمای نصب PWA
            </Button>
          </div>

          {hint && <p className="text-gold mt-4 text-sm leading-7">{hint}</p>}
        </Reveal>

        <Reveal
          delay={2}
          className="relative mx-auto grid min-h-[360px] w-full max-w-[620px] place-items-center lg:min-h-[520px]"
        >
          <div className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(255,98,0,.22),transparent_62%)] blur-2xl" />
          <div className="relative z-10 aspect-[1.18] w-full max-w-[660px]">
            {/* eslint-disable-next-line @next/next/no-img-element -- landing hero uses prepared static art */}
            <img
              src={DOWNLOAD_ASSETS.heroPhoenix}
              alt=""
              className="absolute inset-0 size-full object-contain drop-shadow-[0_32px_80px_rgba(255,98,0,.18)]"
            />
            {/* eslint-disable-next-line @next/next/no-img-element -- landing hero uses prepared static art */}
            <img
              src={DOWNLOAD_ASSETS.heroMobile}
              alt="نمایی از اپلیکیشن قبیله ققنوس روی موبایل"
              className="absolute top-[32%] left-3/7 z-20 w-[35%] max-w-[210px] -translate-x-1/2 rotate-[3deg] object-contain drop-shadow-[0_28px_52px_rgba(0,0,0,.72)] sm:top-[33%] sm:w-[33%] lg:top-[33%] lg:left-3/7 lg:w-[31%]"
            />
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

function InstallGuide() {
  return (
    <section id="install-guide" className="scroll-mt-24 py-18 md:py-24">
      <Container>
        <Reveal className="mb-10 text-center">
          <h2 className="text-[clamp(28px,4vw,48px)] leading-tight font-black">
            نحوه نصب <span className="text-gradient-fire">اپلیکیشن قبیله</span>
          </h2>
          <p className="text-ink-2 mx-auto mt-4 max-w-[620px] leading-8">
            قبیله فعلاً به‌صورت PWA نصب می‌شود؛ سبک، سریع و بدون نیاز به اپ‌استور.
          </p>
        </Reveal>

        <div className="grid items-center gap-10 lg:grid-cols-[minmax(280px,0.9fr)_minmax(0,1.1fr)]">
          <Reveal delay={1} className="relative mx-auto w-full max-w-[430px]">
            <div className="pointer-events-none absolute inset-8 rounded-full bg-[radial-gradient(circle,rgba(255,98,0,.28),transparent_68%)] blur-3xl" />
            {/* eslint-disable-next-line @next/next/no-img-element -- landing illustration uses prepared static art */}
            <img
              src={DOWNLOAD_ASSETS.installGuide}
              alt="راهنمای بصری نصب اپلیکیشن قبیله"
              className="relative z-10 mx-auto w-full object-contain"
              loading="lazy"
            />
          </Reveal>

          <div className="grid gap-5">
            <InstallCard
              icon="android"
              title="نصب PWA در اندروید"
              description="اگر با Chrome یا مرورگرهای مشابه وارد سایت شوی، می‌توانی قبیله را مثل اپلیکیشن روی موبایل نصب کنی."
              steps={INSTALL_STEPS_ANDROID}
            />
            <InstallCard
              icon="apple"
              title="نصب PWA در iOS"
              description="در آیفون نصب از طریق Safari انجام می‌شود و بعد از آن آیکن قبیله روی Home Screen قرار می‌گیرد."
              steps={INSTALL_STEPS_IOS}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}

function InstallCard({
  icon,
  title,
  description,
  steps,
}: {
  icon: 'android' | 'apple';
  title: string;
  description: string;
  steps: string[];
}) {
  const isAndroid = icon === 'android';

  return (
    <Reveal>
      <GlassCard className="group relative overflow-hidden rounded-[26px] p-0 transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-[rgba(255,98,0,.42)] hover:shadow-[0_26px_80px_-48px_var(--glow)]">
        <div
          className={cn(
            'pointer-events-none absolute inset-0 opacity-80',
            isAndroid
              ? '[background:radial-gradient(circle_at_12%_18%,rgba(255,98,0,.18),transparent_36%)]'
              : '[background:radial-gradient(circle_at_12%_18%,rgba(243,186,99,.14),transparent_36%)]',
          )}
        />
        <div className="relative p-5 sm:p-6">
          <div className="mb-5 flex items-start gap-4">
            <span className="relative grid size-13 shrink-0 place-items-center rounded-[16px] text-[#1a0a00] shadow-[0_16px_42px_-18px_var(--glow)] [background:var(--fire-grad)]">
              <span className="absolute inset-0 rounded-[16px] bg-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <Icon name={icon} size={26} className="relative z-10" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-black text-white sm:text-2xl">{title}</h3>
                <span className="text-gold rounded-full border border-[rgba(243,186,99,.18)] px-2.5 py-1 text-[11px] font-black [background:rgba(243,186,99,.08)]">
                  بدون اپ‌استور
                </span>
              </div>
              <p className="text-ink-2 text-sm leading-8">{description}</p>
            </div>
          </div>

          <ol className="relative space-y-3">
            <span className="absolute top-4 right-[15px] bottom-4 w-px bg-[linear-gradient(180deg,rgba(255,98,0,.65),rgba(255,98,0,.08))]" />
            {steps.map((step, index) => (
              <li
                key={step}
                className="relative flex items-start gap-3 rounded-[15px] border border-[rgba(255,98,0,.12)] bg-black/20 p-3 text-sm leading-7 transition-colors duration-300 group-hover:border-[rgba(255,98,0,.22)]"
              >
                <span className="bg-ember relative z-10 mt-0.5 grid size-7 shrink-0 place-items-center rounded-[9px] text-xs font-black text-[#1a0a00] shadow-[0_10px_26px_-14px_var(--glow)]">
                  {index + 1}
                </span>
                <span className="text-ink-2 flex-1">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </GlassCard>
    </Reveal>
  );
}

function DownloadFaq() {
  const [open, setOpen] = useState(0);

  return (
    <section id="download-faq" className="py-18 md:py-24">
      <Container>
        <Reveal className="mb-10 text-center">
          <span className="border-hair text-gold mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-black [background:var(--glass)]">
            <span className="bg-ember size-1.5 rounded-full" />
            سوالات پرتکرار
          </span>
          <h2 className="text-[clamp(28px,4vw,48px)] leading-tight font-black">
            هرچه باید <span className="text-gradient-fire">بدانی</span>
          </h2>
        </Reveal>

        <div className="mx-auto flex max-w-[800px] flex-col gap-3">
          {FAQS.map((item, index) => {
            const isOpen = open === index;
            return (
              <GlassCard
                key={item.q}
                className={cn(
                  'overflow-hidden rounded-[16px]',
                  isOpen &&
                    'border-s-2 border-s-[#ff6220] shadow-[0_8px_32px_-16px_var(--glow)] [background:var(--glass-2)]',
                )}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? -1 : index)}
                  aria-expanded={isOpen}
                  className="hover:text-gold flex w-full items-center gap-4 px-5 py-5 text-start text-sm font-black transition-colors sm:text-base"
                >
                  {item.q}
                  <span
                    className={cn(
                      'ms-auto grid size-7 shrink-0 place-items-center rounded-[8px] transition-[transform,background] duration-300',
                      isOpen
                        ? 'rotate-45 text-[#1a0a00] [background:var(--fire-grad)]'
                        : 'text-gold [background:var(--glass-2)]',
                    )}
                  >
                    <Icon name="plus" size={15} />
                  </span>
                </button>
                <div
                  className={cn(
                    'grid transition-[grid-template-rows] duration-300 ease-[var(--ease-out-soft)]',
                    isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="border-hair text-ink-2 border-t px-5 pt-4 pb-5 text-sm leading-8">
                      {item.a}
                    </p>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

function DownloadCta() {
  return (
    <section className="py-18 md:py-24">
      <Container>
        <Reveal>
          <GlassCard className="mx-auto max-w-[980px] rounded-[26px] p-8 text-center sm:p-12">
            <h2 className="text-[clamp(28px,4vw,46px)] leading-tight font-black">
              همین امروز، شعله‌ات را <span className="text-gradient-fire">روشن کن</span>
            </h2>
            <p className="text-ink-2 mx-auto mt-4 max-w-[560px] leading-8">
              به قبیله‌ای از انسان‌هایی در حال رشد بپیوند. نسخه رایگان است؛ تنها چیزی که لازم داری،
              تصمیم امروز است.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/auth"
                className="inline-flex min-h-13 items-center justify-center gap-[9px] rounded-[14px] border border-transparent px-8 py-[15px] text-[15px] font-extrabold whitespace-nowrap text-[#1a0a00] shadow-[0_8px_28px_-6px_var(--glow),inset_0_1px_0_rgba(255,255,255,.38)] transition-[transform,box-shadow,opacity] duration-[350ms] ease-[var(--ease-out-soft)] [background:var(--fire-grad)] hover:-translate-y-0.5 hover:opacity-[.94]"
              >
                عضویت رایگان در قبیله
                <Icon name="flame" size={18} />
              </Link>
              <Link
                href="/#faq"
                className="text-ink border-hair hover:border-hair-2 inline-flex min-h-13 items-center justify-center gap-[9px] rounded-[14px] px-8 py-[15px] text-[15px] font-bold whitespace-nowrap [backdrop-filter:blur(var(--glass-blur))] transition-[transform,box-shadow,background,border-color,opacity] duration-[350ms] ease-[var(--ease-out-soft)] [background:var(--glass-2)] hover:-translate-y-0.5 hover:shadow-[0_10px_28px_-12px_var(--glow)]"
              >
                گفت‌وگو با تیم
              </Link>
            </div>
          </GlassCard>
        </Reveal>
      </Container>
    </section>
  );
}
