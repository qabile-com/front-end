'use client';

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
import { MockLandingRepository } from '../domain/mock-landing-repository';
import { useLandingData } from '../application/use-landing-data';

const repository = new MockLandingRepository();

export function LandingPage() {
  const { data, loading, error } = useLandingData(repository);

  if (loading) {
    return (
      <>
        <BackgroundField />
        <SiteNav />
        <main className="relative flex min-h-screen items-center justify-center">
          <div className="text-ink-3 text-lg">در حال بارگذاری…</div>
        </main>
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <BackgroundField />
        <SiteNav />
        <main className="relative flex min-h-screen items-center justify-center">
          <div className="text-danger text-lg">{error ?? 'داده‌ای دریافت نشد'}</div>
        </main>
      </>
    );
  }

  return (
    <>
      <BackgroundField />
      <SiteNav />
      <main className="relative overflow-x-hidden">
        <HeroSection />
        <div className="py-14 md:py-20">
          <StatsSection stats={data.stats} />
        </div>
        <Section id="pillars">
          <PillarsSection pillarFeatures={data.pillarFeatures} />
        </Section>
        <Section id="roadmap">
          <RoadmapSection roadmapSteps={data.roadmapSteps} />
        </Section>
        <Section id="leaderboard">
          <LeaderboardSection podium={data.podium} leaderboard={data.leaderboard} />
        </Section>
        <Section id="voices">
          <TestimonialsSection testimonials={data.testimonials} />
        </Section>
        <Section id="app">
          <AppSection />
        </Section>
        <Section id="faq">
          <FaqSection faqs={data.faqs} />
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
