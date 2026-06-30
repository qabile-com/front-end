import { Container, GlassCard, SectionHead } from '@/shared/ui';
import { TESTIMONIALS } from '@/features/landing/domain/landing.data';

export function TestimonialsSection() {
  const loop = [...TESTIMONIALS, ...TESTIMONIALS];
  return (
    <>
      <Container>
        <SectionHead
          center
          eyebrow="صدای قبیله"
          title={
            <>
              آن‌ها از <span className="text-gradient-fire">خاکستر برخاستند</span>
            </>
          }
          sub="هزاران عضو، مسیر تحولشان را با قبیله ققنوس آغاز کرده‌اند. این چند روایت از آن‌هاست."
        />
      </Container>

      <div className="marquee-mask flex gap-4">
        <div className="marquee-track flex gap-4">
          {loop.map((t, i) => (
            <GlassCard key={i} className="w-[300px] shrink-0 rounded-lg p-[22px]">
              <div className="text-hair-2 text-[44px] leading-none font-black">”</div>
              <div className="text-gold text-[13.5px] tracking-[2px]">★★★★★</div>
              <p className="text-ink mt-2 text-[14.5px] leading-[1.85]">{t.quote}</p>
              <div className="border-hair mt-4 flex items-center gap-3 border-t pt-4">
                <span className="size-10 shrink-0 rounded-full" style={{ background: t.avatar }} />
                <span className="leading-tight">
                  <b className="block text-sm font-bold">{t.name}</b>
                  <small className="text-ink-3 text-[12px]">{t.role}</small>
                </span>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </>
  );
}
