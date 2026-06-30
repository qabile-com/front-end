import Link from 'next/link';
import { Button, Container, Icon, PhoenixArt } from '@/shared/ui';

export function CtaSection() {
  return (
    <Container>
      <div className="border-hair relative overflow-hidden rounded-xl border px-6 py-16 text-center [background:radial-gradient(ellipse_80%_120%_at_50%_-10%,rgba(255,98,0,.16),transparent_60%)] sm:px-10 sm:py-19">
        <PhoenixArt className="pointer-events-none absolute start-1/2 -bottom-1/4 size-105 max-w-none -translate-x-1/2 opacity-[0.06] mix-blend-screen blur-[2px] max-sm:hidden" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px [background:linear-gradient(90deg,transparent,var(--color-ember),transparent)]" />
        <h2 className="text-[clamp(28px,4vw,46px)] leading-[1.15] font-black">
          همین امروز، <span className="text-gradient-fire">شعله‌ات را روشن کن</span>
        </h2>
        <p className="text-ink-2 mx-auto mt-4 max-w-130 leading-[1.9]">
          به قبیله‌ای از انسان‌های در حالِ رشد بپیوند. شروع رایگان است؛ تنها چیزی که لازم داری،
          تصمیمِ امروز است.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3.5">
          <Link href="/auth">
            <Button variant="primary" size="lg">
              عضویت رایگان در قبیله
              <Icon name="flame" />
            </Button>
          </Link>
          <Button variant="ghost" size="lg">
            گفت‌وگو با تیم
          </Button>
        </div>
      </div>
    </Container>
  );
}
