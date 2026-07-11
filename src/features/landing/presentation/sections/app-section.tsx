import { Container, GlassCard, Icon } from '@/shared/ui';

export function AppSection() {
  return (
    <Container>
      <GlassCard className="relative grid items-center gap-11 overflow-hidden rounded-xl p-8 md:p-13 lg:grid-cols-2">
        <div className="pointer-events-none absolute start-1/4 -top-20 size-[280px] rounded-full opacity-50 [background:radial-gradient(circle,var(--glow),transparent_70%)]" />
        <div className="relative">
          <span className="border-hair text-gold mb-5 inline-flex items-center gap-[7px] rounded-full border py-1.5 ps-3 pe-3.5 text-xs font-bold [background:var(--glass)]">
            <span className="bg-ember inline-block size-1.5 rounded-full shadow-[0_0_8px_var(--color-ember)]" />
            اپلیکیشن موبایل
          </span>
          <h2 className="text-[clamp(26px,3.6vw,44px)] leading-[1.18] font-black">
            قبیله، همیشه <span className="text-gradient-fire">در جیب تو</span>
          </h2>
          <p className="text-ink-2 mt-4 max-w-[440px] leading-[1.9]">
            یادگیری، زنجیره‌ها و رقابت را همه‌جا با خودت ببر. حتی آفلاین پیش برو و به‌محض اتصال،
            پیشرفتت همگام می‌شود.
          </p>

          <ul className="mt-6 flex flex-col gap-3">
            {[
              { icon: 'flame', b: 'یادآور زنجیره', t: 'هیچ روزی از مسیر عقب نمان.' },
              { icon: 'bolt', b: 'درس‌های آفلاین', t: 'هر زمان، هر کجا یاد بگیر.' },
              { icon: 'ai', b: 'منتور همراه', t: 'گفت‌وگوی هوشمند فقط یک لمس فاصله دارد.' },
            ].map((item) => (
              <li key={item.b} className="flex items-center gap-3 text-[14.5px]">
                <span className="text-gold grid size-9 shrink-0 place-items-center rounded-[10px] [background:var(--glass-2)]">
                  <Icon name={item.icon as 'flame'} size={18} />
                </span>
                <span>
                  <b>{item.b}</b> — <span className="text-ink-2">{item.t}</span>
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-7 flex flex-wrap gap-3">
            {[
              { icon: 'apple', small: 'دریافت از', big: 'App Store' },
              { icon: 'android', small: 'دریافت از', big: 'Google Play' },
            ].map((store) => (
              <a
                key={store.big}
                href="#"
                className="flex items-center gap-2.5 rounded-sm bg-[#fdf6ef] px-5 py-3 text-[#160805] transition-transform hover:-translate-y-0.5"
              >
                <Icon name={store.icon as 'apple'} size={24} />
                <span className="leading-tight">
                  <small className="block text-[10.5px] opacity-65">{store.small}</small>
                  <b className="block text-[15px] font-extrabold">{store.big}</b>
                </span>
              </a>
            ))}
          </div>
        </div>

        <div className="relative grid min-h-[400px] place-items-center">
          <PhoneBack />
          <PhoneFront />
        </div>
      </GlassCard>
    </Container>
  );
}

function PhoneFront() {
  return (
    <div className="border-hair-2 relative z-10 [aspect-ratio:234/482] w-[234px] rounded-[38px] border p-2.5 shadow-[0_36px_80px_-28px_rgba(0,0,0,.88)] [background:linear-gradient(160deg,#1e1008,#0a0503)]">
      <span className="absolute start-1/2 top-3 z-10 h-5 w-20 translate-x-1/2 rounded-full bg-black" />
      <div className="size-full overflow-hidden rounded-[30px] p-4 pt-9 [background:var(--color-bg-2)]">
        <p className="text-sm font-bold">سلام، آرش 🔥</p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full [background:var(--glass-2)]">
          <div className="h-full w-[68%] [background:var(--fire-grad)]" />
        </div>
        <div className="mt-4 flex flex-col gap-2.5">
          {[
            { t: 'امتیاز امروز', s: 'زنجیره‌ی ۳۱ روزه', v: '۲٬۴۸۰', icon: 'bolt' },
            { t: 'درس بعدی', s: 'تمرکز عمیق', v: '▶', icon: 'play' },
            { t: 'دستاورد جدید', s: '۳۰ روز پیوسته!', v: '✦', icon: 'sparkle' },
            { t: 'منتور ققنوس', s: '۱ پیام جدید', v: '•', icon: 'ai' },
          ].map((c) => (
            <div
              key={c.t}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 [background:var(--glass-2)]"
            >
              <span className="grid size-[30px] shrink-0 place-items-center rounded-lg text-[#1a0a00] [background:var(--fire-grad)]">
                <Icon name={c.icon as 'bolt'} size={15} />
              </span>
              <span className="leading-tight">
                <b className="block text-[11px]">{c.t}</b>
                <small className="text-ink-3 text-[10px]">{c.s}</small>
              </span>
              <span className="text-gold ms-auto text-sm font-black">{c.v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PhoneBack() {
  return (
    <div className="border-hair-2 absolute end-0 [aspect-ratio:234/482] w-[208px] rotate-[-8deg] rounded-[38px] border p-2.5 opacity-80 [background:linear-gradient(160deg,#1e1008,#0a0503)]">
      <div className="size-full overflow-hidden rounded-[30px] p-4 [background:var(--color-bg-2)]">
        <div className="mx-auto grid size-[88px] place-items-center rounded-full [background:conic-gradient(var(--color-ember)_0_72%,var(--glass-2)_0)]">
          <span className="text-gold grid size-[68px] place-items-center rounded-full text-sm font-black [background:var(--color-bg-2)]">
            ۷۲٪
          </span>
        </div>
        <div className="mt-4 flex flex-col gap-2.5">
          <div className="rounded-xl px-3 py-2.5 text-[11px] [background:var(--glass-2)]">
            <b className="block">نقشه راه رشد فردی</b>
            <small className="text-ink-3">۸ از ۱۲ درس</small>
          </div>
          <div className="rounded-xl px-3 py-2.5 text-[11px] [background:var(--glass-2)]">
            <b className="block">لیگ طلایی</b>
            <small className="text-ink-3">رتبه‌ی ۵ · ▲۲</small>
          </div>
        </div>
      </div>
    </div>
  );
}
