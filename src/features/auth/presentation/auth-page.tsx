import Link from 'next/link';
import { EmberCanvas, GradText, Icon, PhoenixArt } from '@/shared/ui';
import { AuthCard } from './components/auth-card';

export function AuthPage() {
  return (
    <>
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            'radial-gradient(52% 44% at 28% -2%,rgba(255,98,0,.11),transparent 58%),radial-gradient(42% 34% at 82% 4%,rgba(243,186,99,.06),transparent 58%),radial-gradient(60% 50% at 50% 110%,rgba(204,67,8,.09),transparent 58%)',
        }}
      />
      <EmberCanvas />

      <div className="relative z-[1] flex min-h-screen">
        <aside className="relative hidden flex-col overflow-hidden px-12 py-11 lg:flex lg:basis-[46%]">
          <PhoenixArt className="pointer-events-none absolute inset-0 size-full scale-125 object-contain [object-position:center_40%] opacity-[0.18] blur-[28px]" />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'linear-gradient(to left, rgba(5,3,2,.9) 0%, rgba(5,3,2,.2) 100%), linear-gradient(to top, rgba(5,3,2,.8) 0%, transparent 50%)',
            }}
          />
          <div className="relative z-[1] flex flex-1 flex-col">
            <Link href="/" className="flex items-center gap-3 text-[19px] font-extrabold">
              <span className="grid size-[42px] place-items-center rounded-[13px] text-[#1a0a00] shadow-[0_0_20px_-2px_var(--glow),inset_0_1px_0_rgba(255,255,255,.42)] [background:var(--fire-grad)]">
                <Icon name="flame" size={22} />
              </span>
              <span className="leading-tight">
                قبیله ققنوس
                <small className="text-ink-3 block text-[10.5px] font-medium tracking-[0.1em]">
                  PHOENIX TRIBE
                </small>
              </span>
            </Link>

            <div className="my-auto py-8">
              <h2 className="text-[clamp(28px,2.8vw,38px)] leading-[1.15] font-black tracking-[-0.015em]">
                از خاکستر،
                <br />
                <GradText>برخیز.</GradText>
              </h2>
              <p className="text-ink-2 mt-3.5 max-w-[320px] text-[16px] leading-[1.85]">
                به اکوسیستمی بپیوند که هر روز نسخه‌ی قوی‌تری از تو می‌سازد.
              </p>
            </div>

            <div className="border-hair flex flex-wrap gap-5 border-t pt-8">
              {[
                { b: '۵۲ هزار+', s: 'عضو فعال' },
                { b: '۴٫۹ ★', s: 'رضایت کاربران' },
                { b: 'رایگان', s: 'شروع بدون هزینه' },
              ].map((t) => (
                <div key={t.s} className="flex flex-col gap-[3px]">
                  <b className="text-gradient-fire text-[18px] font-black">{t.b}</b>
                  <small className="text-ink-3 text-[12px]">{t.s}</small>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <div className="relative flex min-h-screen flex-1 flex-col items-center justify-center px-5 py-10 max-lg:justify-start max-lg:px-5 max-lg:pt-7 max-lg:pb-10">
          <Link
            href="/"
            className="mb-7 flex items-center gap-2.5 text-[17px] font-extrabold lg:hidden"
          >
            <span className="grid size-[38px] place-items-center rounded-[11px] text-[#1a0a00] shadow-[0_0_14px_-2px_var(--glow)] [background:var(--fire-grad)]">
              <Icon name="flame" size={20} />
            </span>
            <span className="leading-tight">
              قبیله ققنوس
              <small className="text-ink-3 block text-[10px] tracking-[0.1em]">PHOENIX TRIBE</small>
            </span>
          </Link>

          <AuthCard />

          <Link
            href="/"
            className="text-ink-3 hover:text-gold mt-5 flex items-center gap-1.5 text-[13px] transition-colors"
          >
            <Icon name="arrow-left" size={14} />
            بازگشت به صفحه اصلی
          </Link>
        </div>
      </div>
    </>
  );
}
