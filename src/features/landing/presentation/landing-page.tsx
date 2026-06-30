import { BackgroundField } from '@/shared/ui';
import { SiteNav } from './sections/site-nav';
import { HeroSection } from './sections/hero-section';
import { StatsSection } from './sections/stats-section';
import { PillarsSection } from './sections/pillars-section';
import { RoadmapSection } from './sections/roadmap-section';
import { LeaderboardSection } from './sections/leaderboard-section';
import { TestimonialsSection } from './sections/testimonials-section';
import { AppSection } from './sections/app-section';
import { FaqSection } from './sections/faq-section';
import { CtaSection } from './sections/cta-section';
import { SiteFooter } from './sections/site-footer';

export function LandingPage() {
  return (
    <>
      <BackgroundField />
      <SiteNav />
      <main className="relative">
        <HeroSection />
        <div className="py-14 md:py-20">
          <StatsSection />
        </div>
        <Section id="pillars">
          <PillarsSection />
        </Section>
        <Section id="roadmap">
          <RoadmapSection />
        </Section>
        <Section id="leaderboard">
          <LeaderboardSection />
        </Section>
        <Section id="voices">
          <TestimonialsSection />
        </Section>
        <Section id="app">
          <AppSection />
        </Section>
        <Section id="faq">
          <FaqSection />
        </Section>
        <Section id="cta">
          <CtaSection />
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}

function Section({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 py-20 md:py-[110px]">
      {children}
    </section>
  );
}
