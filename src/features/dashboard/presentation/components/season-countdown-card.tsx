// src/features/dashboard/presentation/components/season-countdown-card.tsx
'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/core/lib/cn';
import { toPersianDigits } from '@/core/lib/persian';
import { OptionalImage, PhoenixArt } from '@/shared/ui';

interface SeasonCountdownCardProps {
  targetDate: Date;
  pointsNeeded?: number;
  seasonName?: string;
  className?: string;
}

export function SeasonCountdownCard({
  targetDate,
  pointsNeeded = 56465,
  seasonName = 'فصل هفت',
  className,
}: SeasonCountdownCardProps) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(targetDate));

  useEffect(() => {
    const timerId = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(timerId);
  }, [targetDate]);

  if (timeLeft.total <= 0) {
    return <div className="text-ink-2 p-8 text-center">فصل به پایان رسیده است</div>;
  }

  return (
    <div
      className={cn(
        'border-hair/40 flex w-full flex-col items-center rounded-[32px] border p-8 shadow-lg backdrop-blur-xl [background:var(--glass)]',
        className,
      )}
    >
      <h3 className="text-ink mb-6 text-center text-xl font-bold md:text-2xl">
        تا پایان {seasonName}
      </h3>

      <div className="mb-8 flex w-full flex-row-reverse justify-center gap-3">
        <TimerBox value={timeLeft.days} label="روز" />
        <TimerBox value={timeLeft.hours} label="ساعت" />
        <TimerBox value={timeLeft.minutes} label="دقیقه" />
        <TimerBox value={timeLeft.seconds} label="ثانیه" />
      </div>

      <div className="flex w-full items-center justify-center gap-6">
        <div className="text-ink flex flex-col text-center text-lg leading-[1.9]">
          <span>برای رسیدن به رتبه</span>
          <span>چهار فقط</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-ember text-4xl font-extrabold">
              {toPersianDigits(pointsNeeded)}
            </span>
            <span className="text-ember text-xl">امتیاز</span>
          </div>
          <span>نیاز داری</span>
        </div>
        <div className="relative h-28 w-28 flex-shrink-0">
          <OptionalImage
            src="/assets/leaderboard-phoenix.webp"
            alt="ققنوس"
            className="object-contain"
          />
        </div>
      </div>
    </div>
  );
}

// ── Helpers ──

interface TimeLeft {
  total: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateTimeLeft(target: Date): TimeLeft {
  const now = Date.now();
  const diff = Math.max(0, target.getTime() - now);
  return {
    total: diff,
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

const TimerBox = ({ value, label }: { value: number; label: string }) => (
  <div className="flex h-[104px] w-[78px] flex-col items-center justify-center gap-1 rounded-[16px] border-2 border-[#F3BA632E] bg-[#FDEEE233] p-3 shadow-inner">
    <span className="text-gold text-3xl font-extrabold">
      {toPersianDigits(String(value).padStart(2, '0'))}
    </span>
    <span className="text-ember text-sm font-medium">{label}</span>
  </div>
);
