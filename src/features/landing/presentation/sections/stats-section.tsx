import { Container, CountUp, Icon, Reveal, type IconName } from '@/shared/ui';
import type { StatItem } from '../../domain/landing.types';

interface StatsSectionProps {
  stats: StatItem[];
}

export function StatsSection({ stats }: StatsSectionProps) {
  return (
    <Container>
      <Reveal className="border-hair grid grid-cols-2 gap-px overflow-hidden rounded-lg border md:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col items-center gap-2 px-5 py-8 text-center [background:linear-gradient(180deg,var(--color-panel),var(--color-bg-2))]"
          >
            <span className="text-ember grid size-9 place-items-center rounded-sm [background:var(--glass-2)]">
              <Icon name={stat.icon as IconName} size={18} />
            </span>
            <span className="min-w-[5ch] text-[clamp(28px,3.2vw,40px)] leading-none font-black tabular-nums">
              <CountUp to={stat.count} decimals={stat.decimals} suffix={stat.suffix} />
            </span>
            <span className="text-ink-3 text-[13px]">{stat.label}</span>
          </div>
        ))}
      </Reveal>
    </Container>
  );
}
