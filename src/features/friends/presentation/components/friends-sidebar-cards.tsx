import { toPersianDigits } from '@/core/lib/persian';

export function GuideCard() {
  return (
    <section className="rounded-[22px] border border-[rgba(255,98,0,.16)] p-4 [background:var(--glass)]">
      <h2 className="text-sm font-black text-white">چطور کار می‌کند؟</h2>
      <div className="mt-4 space-y-3">
        {[
          'اطلاعات صرافی و UID یا شناسه خودت را ثبت می‌کنی.',
          'سیستم برای تو لینک اختصاصی ثبت نام می‌سازد.',
          'دوستانت با آن لینک وارد می‌شوند و وضعیتشان اینجا نمایش داده می‌شود.',
        ].map((item, index) => (
          <div key={item} className="flex gap-3">
            <span className="text-gold grid size-7 shrink-0 place-items-center rounded-lg border border-[rgba(243,186,99,.22)] bg-black/24 text-xs font-black">
              {toPersianDigits(index + 1)}
            </span>
            <p className="text-ink-3 text-sm leading-7">{item}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ProgramCard() {
  return (
    <section className="rounded-[22px] border border-[rgba(255,98,0,.16)] p-4 [background:var(--glass)]">
      <h2 className="text-sm font-black text-white">BD Program</h2>
      <p className="text-ink-3 mt-2 text-sm leading-7">
        این نسخه فعلا سمت کاربر را با mock data آماده می‌کند. وقتی API پنل ادمین و برنامه BD
        آماده شد، همین مدل به endpoint واقعی وصل می‌شود.
      </p>
    </section>
  );
}
