import Link from 'next/link';
import { Icon } from '@/shared/ui';

export default function OfflinePage() {
  return (
    <main className="grid min-h-dvh place-items-center px-5 [background:var(--color-bg)]">
      <section className="border-hair w-full max-w-md rounded-[28px] border p-6 text-center shadow-[0_28px_90px_-48px_var(--glow)] [background:var(--glass)]">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl text-[#1a0a00] [background:var(--fire-grad)]">
          <Icon name="flame" size={24} />
        </span>
        <h1 className="mt-5 text-xl font-black">فعلاً آفلاینی</h1>
        <p className="text-ink-2 mt-3 text-sm leading-7">
          اتصال اینترنتت قطع شده. بعضی بخش‌هایی که قبلاً دیده‌ای ممکن است باز شوند، اما برای
          دریافت داده‌های جدید باید دوباره آنلاین شوی.
        </p>
        <Link
          href="/home"
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl px-5 text-sm font-black text-[#1a0a00] [background:var(--fire-grad)]"
        >
          تلاش دوباره
        </Link>
      </section>
    </main>
  );
}
