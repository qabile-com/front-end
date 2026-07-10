import { Container, GlassCard, Icon, OptionalImage, Reveal, SectionHead } from '@/shared/ui';
import { toPersianDigits } from '@/core/lib/persian';
import { cn } from '@/core/lib/cn';
import type { PodiumPlace, LeaderboardRow } from '../../domain/landing.types';
import Image from 'next/image';

interface LeaderboardSectionProps {
  podium: PodiumPlace[];
  leaderboard: LeaderboardRow[];
}

export function LeaderboardSection({ podium, leaderboard }: LeaderboardSectionProps) {
  return (
    <Container>
      <SectionHead
        eyebrow="میدان رقابت"
        title={
          <>
            بهترین‌های قبیله، <span className="text-gradient-fire">این فصل</span>
          </>
        }
        sub="رقابتِ سالم، سوختِ رشد است. ببین کجای میدان ایستاده‌ای و برای صدرنشینی بجنگ."
      />

      <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr]">
        <Reveal as="div" className="grid grid-cols-3 items-end gap-3">
          {podium.map((place) => {
            const first = place.rank === 1;
            return (
              <GlassCard
                key={place.rank}
                className={cn(
                  'relative rounded-lg px-3.5 pt-6 pb-5 text-center',
                  first &&
                    'border-[rgba(243,186,99,.44)] shadow-[0_24px_60px_-24px_rgba(243,186,99,.35)]',
                )}
              >
                {first && (
                  <Icon
                    name="crown"
                    size={24}
                    className="text-gold absolute start-1/2 -top-0 translate-x-1/2"
                  />
                )}
                <span
                  className={`absolute start-3 top-3 grid size-7 place-items-center rounded-sm border text-xs font-extrabold ${place.rank === 1 ? 'text-[#1a0a00] [background:var(--fire-grad)]' : 'border-hair text-gold [background:var(--glass-2)]'}`}
                >
                  {toPersianDigits(place.rank)}
                </span>
                <span
                  className={cn(
                    'mx-auto block rounded-full',
                    first
                      ? 'size-[78px] border-2 border-[rgba(243,186,99,.6)]'
                      : 'border-hair-2 size-16 border',
                  )}
                  style={{ background: place.avatar }}
                />
                <p className="mt-3 text-[15px] font-extrabold">{place.name}</p>
                <div className="flex items-center justify-center gap-1">
                  <p className="text-gold text-xl font-black">
                    {toPersianDigits(place.score.toLocaleString('en-US').replace(/,/g, '٬'))}
                  </p>
                  <Image
                    src="/assets/phoenix_badge.webp"
                    alt="phoenix badge"
                    width={16}
                    height={16}
                    className="size-5 shrink-0 rounded-full object-cover"
                  />
                </div>
                <p className="text-ink-3 text-[11.5px]">{place.tag}</p>
              </GlassCard>
            );
          })}
        </Reveal>

        <Reveal as="div" delay={1}>
          <div className="mb-4 flex items-center justify-between">
            <span className="border-hair inline-flex items-center gap-2.25 rounded-full border px-3.25 py-[7px] text-[12.5px] font-bold [background:var(--glass-2)]">
              <span className="grid size-5 place-items-center rounded-[6px] text-[#1a0a00] [background:var(--fire-grad)]">
                <Icon name="trophy" size={12} />
              </span>
              لیگ ققنوس طلایی · فصل ۷
            </span>
            <span className="text-ink-3 text-[12.5px]">۶ روز تا پایان فصل</span>
          </div>

          <div className="flex flex-col gap-2.5">
            {leaderboard.map((row) => (
              <div
                key={row.rank}
                className={cn(
                  'flex items-center gap-3 rounded-[14px] border px-4 py-3 transition-[transform,border-color,background,box-shadow] duration-300',
                  row.isYou
                    ? 'border-none text-[#1a0a00] shadow-[0_8px_24px_-10px_var(--glow)] [background:var(--fire-grad)]'
                    : 'border-hair hover:border-hair-2 [background:var(--glass)] hover:[background:var(--glass-2)]',
                )}
              >
                <span
                  className={cn(
                    'w-6 text-center font-black tabular-nums',
                    !row.isYou && 'text-ink-3',
                  )}
                >
                  {toPersianDigits(row.rank)}
                </span>
                <span
                  className="size-[38px] shrink-0 rounded-full"
                  style={{ background: row.avatar }}
                />
                <span className="leading-tight">
                  <b className="text-sm font-bold">{row.name}</b>
                  <small
                    className={cn('block text-[11.5px]', row.isYou ? 'opacity-70' : 'text-ink-3')}
                  >
                    {row.tag}
                  </small>
                </span>
                <span
                  className={cn(
                    'ms-auto rounded-[7px] px-2 py-0.5 text-[11px] font-bold',
                    row.isYou
                      ? '[background:rgba(0,0,0,.14)]'
                      : 'border-hair text-gold border [background:var(--glass-2)]',
                  )}
                >
                  L{toPersianDigits(row.level)}
                </span>
                <span className="font-black tabular-nums">
                  {toPersianDigits(row.points.replace(/,/g, '٬'))}
                </span>

                <Image
                  src="/assets/phoenix_badge.webp"
                  alt="phoenix badge"
                  width={16}
                  height={16}
                  className="size-5 shrink-0 rounded-full object-cover"
                />
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </Container>
  );
}
