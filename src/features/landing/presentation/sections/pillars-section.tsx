import { Container, GlassCard, Icon, Reveal, SectionHead, type IconName } from '@/shared/ui';
import { PILLAR_FEATURES } from '@/features/landing/domain/landing.data';

export function PillarsSection() {
  return (
    <Container>
      <SectionHead
        center
        eyebrow="ستون‌های قبیله"
        title={
          <>
            یک اکوسیستم کامل برای <span className="text-gradient-fire">رشدِ تو</span>
          </>
        }
        sub="یادگیری، انگیزه و انجمن در یک‌جا. قبیله ققنوس همه‌ی چیزهایی را که برای ساختن نسخه‌ی بهتری از خودت لازم داری، در یک تجربه‌ی یکپارچه کنار هم می‌گذارد."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4 lg:grid-cols-6">
        <Reveal as="div" className="lg:col-span-3 lg:row-span-2">
          <BentoCell icon="route" title="نقشه‌راه‌های یادگیری">
            مسیرهای مرحله‌به‌مرحله که تو را از مبانی تا تسلط می‌برند؛ از رشد فردی و توسعه‌ی مهارت تا
            سواد مالی و ترید — هر گام، یک قدم نزدیک‌تر به هدف.
            <ul className="mt-5 flex flex-col gap-2.5">
              {PILLAR_FEATURES.map((f) => (
                <li
                  key={f.step}
                  className={`border-hair flex items-center gap-3 rounded-xl border px-3.5 py-3 [background:var(--glass)] ${f.locked ? 'opacity-45' : ''}`}
                >
                  <span
                    className={`grid size-7 shrink-0 place-items-center rounded-lg text-xs font-extrabold ${f.locked ? 'text-ink-3 [background:var(--glass-2)]' : 'text-[#1a0a00] [background:var(--fire-grad)]'}`}
                  >
                    {f.step}
                  </span>
                  <span className="leading-tight">
                    <b className="text-sm font-bold">{f.title}</b>
                    <small className="text-ink-3 block text-[12.5px]">{f.sub}</small>
                  </span>
                  {!f.locked && <Icon name="check" size={18} className="text-gold ms-auto" />}
                </li>
              ))}
            </ul>
          </BentoCell>
        </Reveal>

        <Reveal as="div" delay={1} className="lg:col-span-3">
          <BentoCell icon="ai" title="منتور هوش مصنوعی">
            یک همراه هوشمند که ۲۴ ساعته کنارت است؛ سؤال‌هایت را پاسخ می‌دهد، مسیرت را شخصی‌سازی
            می‌کند و در لحظه‌های سخت، انگیزه‌ات را زنده نگه می‌دارد.
            <div className="mt-5 flex flex-col gap-2.5">
              <div className="max-w-[82%] self-end rounded-[15px] rounded-es-[4px] px-3.5 py-3 text-sm font-semibold text-[#1a0a00] [background:var(--fire-grad)]">
                چطور انضباطم را در یادگیری حفظ کنم؟
              </div>
              <div className="border-hair max-w-[82%] self-start rounded-[15px] rounded-ee-[4px] border px-3.5 py-3 text-sm [background:var(--glass-2)]">
                <span className="mb-1.5 flex items-center gap-2">
                  <span className="text-gold grid size-5 place-items-center rounded-[6px] text-[#1a0a00] [background:var(--fire-grad)]">
                    <Icon name="flame" size={12} />
                  </span>
                  <b className="text-xs">منتور ققنوس</b>
                </span>
                بیا با یک زنجیره‌ی ۷ روزه شروع کنیم؛ هر روز فقط ۲۰ دقیقه. من یادآوری‌ها و امتیازهایت
                را مدیریت می‌کنم. 🔥
              </div>
              <div className="border-hair inline-flex gap-1 self-start rounded-[15px] rounded-ee-[4px] border px-4 py-3 [background:var(--glass-2)]">
                <i className="typing-dot bg-gold size-1.5 rounded-full" />
                <i className="typing-dot bg-gold size-1.5 rounded-full [animation-delay:.2s]" />
                <i className="typing-dot bg-gold size-1.5 rounded-full [animation-delay:.4s]" />
              </div>
            </div>
          </BentoCell>
        </Reveal>

        <Reveal as="div" delay={2} className="md:col-span-3">
          <BentoCell icon="bolt" title="گیمیفیکیشن">
            امتیاز، نشان، سطح و زنجیره؛ هر تلاش پاداش می‌گیرد و یادگیری به یک بازی اعتیادآور تبدیل
            می‌شود.
          </BentoCell>
        </Reveal>
        <Reveal as="div" delay={3} className="md:col-span-2">
          <BentoCell icon="trophy" title="رقابت سالم">
            در لیگ‌های فصلی با هم‌قبیله‌ای‌ها رقابت کن، در لیدربورد بالا بیا و انگیزه‌ات را دوچندان
            کن.
          </BentoCell>
        </Reveal>
        <Reveal as="div" delay={4} className="md:col-span-4">
          <BentoCell icon="users" title="انجمن و رشد جمعی">
            تنها رشد نکن. در چالش‌های گروهی شرکت کن، تجربه به اشتراک بگذار و در دلِ یک قبیله‌ی واقعی
            پیش برو.
          </BentoCell>
        </Reveal>
      </div>
    </Container>
  );
}

function BentoCell({
  icon,
  title,
  children,
}: {
  icon: IconName;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <GlassCard className="hover:border-hair-2 h-full rounded-lg p-7 transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_22px_52px_-26px_var(--glow)]">
      <span className="border-hair text-gold mb-4 grid size-[46px] place-items-center rounded-[13px] border [background:var(--glass-2)]">
        <Icon name={icon} size={24} />
      </span>
      <h3 className="text-xl font-extrabold">{title}</h3>
      <div className="text-ink-2 mt-2 text-[14.5px] leading-[1.85]">{children}</div>
    </GlassCard>
  );
}
