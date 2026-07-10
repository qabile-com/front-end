import { Container, GlassCard, Icon, Reveal, SectionHead, type IconName } from '@/shared/ui';
import type { RoadmapStep } from '../../domain/landing.types';

interface RoadmapSectionProps {
  roadmapSteps: RoadmapStep[];
}

export function RoadmapSection({ roadmapSteps }: RoadmapSectionProps) {
  return (
    <Container>
      <SectionHead
        eyebrow="سفر تحول"
        center
        title={
          <>
            از جرقه تا <span className="text-gradient-fire">شعله</span>
          </>
        }
        sub="هر ققنوس مسیر خودش را دارد. ما این مسیر را به مراحلِ روشن، قابل‌اندازه‌گیری و پاداش‌دار تبدیل کرده‌ایم."
      />

      <Reveal as="div">
        <GlassCard className="rounded-lg p-7">
          <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-4">
            {roadmapSteps.map((step) => (
              <div key={step.title}>
                <span className="border-hair text-gold mb-4 grid size-[46px] place-items-center rounded-[13px] border [background:var(--glass-2)]">
                  <Icon name={step.icon as IconName} size={24} />
                </span>
                <h3 className="text-lg font-extrabold">{step.title}</h3>
                <p className="text-ink-2 mt-2 text-sm leading-[1.85]">{step.text}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </Reveal>
    </Container>
  );
}
