'use client';

import { BackgroundField, MotionPage } from '@/shared/ui';
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
import { useLandingPublicData } from '../application/use-landing-public-data';
import { useLandingUserData } from '../application/use-landing-user-data';
import { landingPublicRepo, landingUserRepo } from '../infrastructure/repository-factory';
import { PILLAR_FEATURES, ROADMAP_STEPS, FAQS } from '../domain/landing.data';

export function LandingPage() {
  const { stats, testimonials, leaderboard } = useLandingPublicData(landingPublicRepo);
  const { data: userData } = useLandingUserData(landingUserRepo);

  return (
    <MotionPage>
      <BackgroundField />
      <SiteNav />
      <main className="landing-page relative w-full overflow-x-clip">
        {/* Hero section receives dynamic stats and chips */}
        <HeroSection
          totalMembers={stats.data?.totalMembers}
          rating={stats.data?.rating}
          chips={userData?.chips}
        />

        {/* Stats section - can show skeleton while loading */}
        <div className="py-14 md:py-20">
          {stats.isLoading ? (
            <StatsSkeleton />
          ) : stats.data ? (
            <StatsSection
              stats={[
                {
                  icon: 'users',
                  count: 52000,
                  suffix: ' هزار+',
                  label: 'عضو فعال قبیله',
                },
                { icon: 'book', count: 890, suffix: ' هزار', label: 'درس و دوره‌ی کامل‌شده' },
                {
                  icon: 'ai',
                  count: 4.5,
                  decimals: 1,
                  suffix: ' میلیون',
                  label: 'گفت‌وگو با منتور هوش مصنوعی',
                },
                {
                  icon: 'target',
                  count: 98,
                  decimals: 1,
                  suffix: '٪',
                  label: 'نرخ رضایت اعضا',
                },
              ]}
            /> // need to adjust: StatsSection expects array of StatItem, but we only have totalMembers/rating. I'll explain below.
          ) : null}
        </div>

        {/* Static sections */}
        <Section id="pillars">
          <PillarsSection pillarFeatures={PILLAR_FEATURES} />
        </Section>
        <Section id="roadmap">
          <RoadmapSection roadmapSteps={ROADMAP_STEPS} />
        </Section>

        {/* Leaderboard */}
        <Section id="leaderboard">
          {leaderboard.isLoading ? (
            <div className="text-ink-3 text-center">در حال بارگذاری...</div>
          ) : leaderboard.data ? (
            <LeaderboardSection
              podium={leaderboard.data.podium}
              leaderboard={leaderboard.data.leaderboard}
            />
          ) : (
            <div className="text-ink-3 text-center">داده‌ای موجود نیست</div>
          )}
        </Section>

        {/* Testimonials */}
        <Section id="voices">
          {testimonials.isLoading ? (
            <TestimonialsSkeleton />
          ) : testimonials.data ? (
            <TestimonialsSection testimonials={testimonials.data} />
          ) : null}
        </Section>

        <Section id="app">
          <AppSection />
        </Section>
        <Section id="faq">
          <FaqSection faqs={FAQS} />
        </Section>
        <Section id="cta">
          <CtaSection />
        </Section>
      </main>
      <SiteFooter />
    </MotionPage>
  );
}

function Section({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 py-20 md:py-[110px]">
      {children}
    </section>
  );
}

// Simple skeleton components
function StatsSkeleton() {
  return (
    <div className="max-w-site mx-auto px-5 sm:px-8">
      <div className="border-hair grid grid-cols-2 gap-px overflow-hidden rounded-lg border md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex animate-pulse flex-col items-center gap-2 px-5 py-8">
            <div className="size-9 rounded-sm bg-[var(--glass-2)]" />
            <div className="h-8 w-20 rounded bg-[var(--glass-2)]" />
            <div className="h-4 w-12 rounded bg-[var(--glass-2)]" />
          </div>
        ))}
      </div>
    </div>
  );
}

function TestimonialsSkeleton() {
  return (
    <div className="marquee-mask flex gap-4 overflow-hidden">
      <div className="marquee-track flex gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="glass w-[300px] shrink-0 animate-pulse rounded-lg p-[22px]">
            <div className="mb-2 h-4 w-24 rounded bg-[var(--glass-2)]" />
            <div className="space-y-2">
              <div className="h-3 w-full rounded bg-[var(--glass-2)]" />
              <div className="h-3 w-3/4 rounded bg-[var(--glass-2)]" />
            </div>
            <div className="border-hair mt-4 flex items-center gap-3 border-t pt-4">
              <div className="size-10 rounded-full bg-[var(--glass-2)]" />
              <div>
                <div className="mb-1 h-3 w-16 rounded bg-[var(--glass-2)]" />
                <div className="h-2 w-10 rounded bg-[var(--glass-2)]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
