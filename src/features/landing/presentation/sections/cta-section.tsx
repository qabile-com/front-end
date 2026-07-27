import { Button, Container, Icon } from '@/shared/ui';
import { AuthEntryLink } from '../components/auth-entry-link';

export function CtaSection() {
  return (
    <Container>
      <div className="border-hair relative overflow-hidden rounded-xl border px-6 py-16 text-center [background:radial-gradient(ellipse_80%_120%_at_50%_-10%,rgba(255,98,0,.16),transparent_60%)] sm:px-10 sm:py-19">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px [background:linear-gradient(90deg,transparent,var(--color-ember),transparent)]" />
        <h2 className="text-[clamp(28px,4vw,46px)] leading-[1.15] font-black">
          همین امروز، <span className="text-gradient-fire">شعله‌ات را روشن کن</span>
        </h2>
        <p className="text-ink-2 mx-auto mt-4 max-w-130 leading-[1.9]">
          به قبیله‌ای از انسان‌های در حالِ رشد بپیوند. شروع رایگان است؛ تنها چیزی که لازم داری،
          تصمیمِ امروز است.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3.5">
          <AuthEntryLink className="w-full sm:w-auto">
            <Button variant="primary" size="lg" block>
              عضویت رایگان در قبیله
              <Icon name="flame" />
            </Button>
          </AuthEntryLink>
          <Button variant="ghost" size="lg" className="w-full sm:w-auto">
            گفت‌وگو با تیم
          </Button>
        </div>
      </div>
    </Container>
  );
}
