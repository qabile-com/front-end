'use client';

import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { Button, CopyButton, DashboardPageShell, Icon, MotionPage } from '@/shared/ui';
import { cn } from '@/core/lib/cn';
import { formatPersianNumber, toPersianDigits } from '@/core/lib/persian';
import { useActiveRoadmap } from '../../application/use-active-roadmap';
import { useCompleteRoadmapStep } from '../../application/use-complete-roadmap-step';
import {
  getRoadmapStepBackendId,
  mergeStaticStepWithProgress,
} from '../../application/roadmap-progress';
import { roadmapRepo } from '../../infrastructure/repository-factory';
import { useActionRewardQueue } from '@/features/dashboard/application/use-action-reward-queue';
import { ActionRewardModals } from '@/features/dashboard/presentation/components/action-reward-modals';
import type { StaticRoadmapStep } from '../../domain/static-roadmap-steps';

interface RoadmapStepPageProps {
  step: StaticRoadmapStep;
}

export function RoadmapStepPage({ step }: RoadmapStepPageProps) {
  const router = useRouter();
  const activeRoadmap = useActiveRoadmap(roadmapRepo);
  const stepWithProgress = useMemo(
    () => mergeStaticStepWithProgress(step, activeRoadmap.roadmap),
    [activeRoadmap.roadmap, step],
  );
  const completeStep = useCompleteRoadmapStep(roadmapRepo);
  const { currentReward, enqueueReward, dismissCurrentReward } = useActionRewardQueue();

  const handleComplete = async () => {
    const reward = await completeStep.mutateAsync({
      roadmapId: activeRoadmap.roadmap?.id,
      stepId: getRoadmapStepBackendId(stepWithProgress, activeRoadmap.roadmap),
      num: stepWithProgress.id,
    });
    enqueueReward(reward, {
      xpDescription: `آتش مرحله ${toPersianDigits(stepWithProgress.id)} به حساب قبیله‌ات اضافه شد.`,
    });
  };

  return (
    <MotionPage>
      <DashboardPageShell
        size="narrow"
        className="h-[calc(100dvh-7.5rem)] min-h-[520px] sm:h-[calc(100dvh-9rem)] lg:h-[calc(100dvh-7.5rem)]"
      >
        <article className="roadmap-step-card relative mx-auto flex h-full min-h-0 w-full max-w-[820px] flex-col overflow-hidden rounded-none border border-transparent bg-black shadow-[0_28px_90px_-54px_var(--glow)] sm:rounded-[24px] sm:border-[rgba(255,98,0,.24)] lg:max-w-[860px]">
          <StepTopBar step={stepWithProgress} onBack={() => router.back()} />

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="min-h-0 flex-1 [scrollbar-gutter:stable] overflow-y-auto overscroll-contain px-3.5 py-4 pb-38 sm:px-5 sm:pb-8 lg:px-6 lg:py-5">
              <div className="space-y-5">
                <StepIntro step={stepWithProgress} />
                <StepBody step={stepWithProgress} />
              </div>
            </div>

            <CompleteFooter
              xp={stepWithProgress.xp}
              status={stepWithProgress.status}
              isCompleting={completeStep.isPending}
              isLoadingProgress={activeRoadmap.loading}
              onComplete={handleComplete}
            />
          </div>
        </article>
      </DashboardPageShell>

      <ActionRewardModals reward={currentReward} onClose={dismissCurrentReward} />
    </MotionPage>
  );
}

function StepTopBar({ step, onBack }: { step: StaticRoadmapStep; onBack: () => void }) {
  return (
    <header className="border-hair sticky top-0 z-20 flex min-h-13 shrink-0 items-center justify-between border-b bg-black/95 px-3.5 py-2.5 backdrop-blur-xl sm:px-5">
      <button
        type="button"
        onClick={onBack}
        className="text-gold hover:text-ember inline-flex min-h-10 items-center gap-2 rounded-xl px-1 text-[13px] font-black transition-colors"
      >
        <Icon name="arrow-right" size={17} />
        بازگشت
      </button>

      <h1 className="text-center text-sm font-black text-white sm:text-base">{step.title}</h1>

      <span className="text-gold border-ember inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-sm font-black">
        {formatPersianNumber(step.xp)}
        <Icon name="flame" size={18} className="text-ember" />
      </span>
    </header>
  );
}

function StepIntro({ step }: { step: StaticRoadmapStep }) {
  return (
    <section className="space-y-3 text-right">
      <span className="text-ember inline-flex min-h-8 items-center rounded-[9px] border border-[rgba(255,98,0,.28)] bg-[rgba(255,98,0,.13)] px-3 text-xs font-black">
        {step.category}
      </span>
      <div className="space-y-2">
        <h2 className="text-base font-black text-white sm:text-lg">{step.title}</h2>
        <p className="text-ink-2 max-w-[72ch] text-[13px] leading-7 sm:text-sm sm:leading-8 md:max-w-full">
          {step.description}
        </p>
      </div>
    </section>
  );
}

function StepBody({ step }: { step: StaticRoadmapStep }) {
  switch (step.kind) {
    case 'video':
      return <VideoStep step={step} />;
    case 'audio':
      return <AudioStep step={step} />;
    case 'article':
      return <ArticleStep step={step} />;
    case 'social-follow':
      return <SocialFollowStep step={step} />;
    case 'social-compose':
    case 'social-profile':
      return <InstructionImageStep step={step} />;
    case 'social-connect':
      return <ConnectStep step={step} />;
    case 'checklist':
      return <ChecklistStep step={step} />;
    default:
      return null;
  }
}

function VideoStep({ step }: { step: StaticRoadmapStep }) {
  return (
    <section className="overflow-hidden rounded-[18px] border border-[rgba(255,98,0,.12)] bg-[radial-gradient(circle_at_50%_35%,rgba(255,98,0,.18),transparent_34%),rgba(16,8,5,.82)]">
      <div className="grid aspect-video min-h-[178px] place-items-center">
        <button
          type="button"
          className="bg-ember grid size-14 place-items-center rounded-full text-[#1a0a00] shadow-[0_0_42px_-6px_var(--glow)] transition-transform duration-300 hover:scale-105 active:scale-95 sm:size-16"
          aria-label="پخش ویدیو"
        >
          <Icon name="play" size={24} />
        </button>
      </div>
      <div className="flex items-center justify-end px-4 pb-3 text-xs font-black text-white">
        <span>{toPersianDigits(step.duration ?? '۰:۰۰')}</span>
      </div>
    </section>
  );
}

function InstructionImageStep({ step }: { step: StaticRoadmapStep }) {
  return (
    <section className="rounded-[18px] border border-[rgba(255,98,0,.16)] bg-[rgba(36,13,5,.72)] p-3 sm:p-4">
      <h3 className="border-b border-[rgba(255,98,0,.22)] pb-3 text-right text-sm font-black">
        نحوه انجام
      </h3>
      <div className="space-y-4 pt-3">
        {step.instructions?.map((instruction, index) => (
          <div key={`${instruction.title}-${index}`} className="space-y-3">
            <p className="text-ink-2 text-right text-[13px] leading-7">
              <b className="text-gold">{instruction.title}: </b>
              <span className="lg:hidden">{instruction.mobile}</span>
              <span className="hidden lg:inline">{instruction.desktop}</span>
            </p>
            {step.imageSlots?.[index] && (
              <RoadmapImage
                slot={step.imageSlots[index]}
                index={index}
                wide={step.imageSlots[index].size === 'wide'}
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function ArticleStep({ step }: { step: StaticRoadmapStep }) {
  return (
    <section className="rounded-[18px] border border-[rgba(255,98,0,.16)] bg-[rgba(36,13,5,.76)] p-4 pe-3 sm:p-5 sm:pe-4">
      <div className="space-y-4">
        {step.content?.map((paragraph) => (
          <p
            key={paragraph}
            className="text-ink-2 text-right text-[13px] leading-8 whitespace-pre-line sm:text-sm"
          >
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  );
}

function AudioStep({ step }: { step: StaticRoadmapStep }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const hasAudio = Boolean(step.audioSrc);
  const progress = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  const bars = useMemo(
    () =>
      Array.from({ length: 38 }, (_, index) => ({
        id: index,
        height: 18 + ((index * 17) % 42),
        progressPoint: ((index + 1) / 38) * 100,
      })),
    [],
  );

  const syncAudioTime = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setCurrentTime(audio.currentTime);
  };

  const syncAudioDuration = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
  };

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio || !hasAudio) return;

    if (audio.paused) {
      await audio.play();
      setIsPlaying(true);
      return;
    }

    audio.pause();
    setIsPlaying(false);
  };

  const seekBy = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio || !hasAudio) return;
    const nextTime = Math.min(
      Math.max(audio.currentTime + seconds, 0),
      duration || audio.duration || 0,
    );
    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const seekToProgress = (value: string) => {
    const audio = audioRef.current;
    if (!audio || !hasAudio || !duration) return;
    const nextTime = (Number(value) / 100) * duration;
    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  return (
    <section className="rounded-[18px] border border-[rgba(255,98,0,.18)] bg-[rgba(36,13,5,.82)] p-4 sm:p-5">
      {step.audioSrc && (
        <audio
          ref={audioRef}
          src={step.audioSrc}
          preload="metadata"
          onLoadedMetadata={syncAudioDuration}
          onDurationChange={syncAudioDuration}
          onTimeUpdate={syncAudioTime}
          onPause={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
          onEnded={() => {
            setIsPlaying(false);
            setCurrentTime(0);
          }}
        />
      )}

      <div className="flex h-28 items-center justify-center gap-2 sm:h-32">
        {bars.map((bar) => (
          <span
            key={bar.id}
            className={cn(
              'w-1.5 rounded-full transition-colors duration-200 sm:w-2',
              progress >= bar.progressPoint
                ? 'bg-ember shadow-[0_0_18px_-5px_var(--glow)]'
                : 'bg-white/30',
            )}
            style={{ height: bar.height }}
          />
        ))}
      </div>

      <div className="mt-1 flex items-center justify-between gap-3 text-[11px] font-bold text-white/70">
        <span>{formatAudioTime(currentTime)}</span>
        <input
          type="range"
          min={0}
          max={100}
          step={0.1}
          value={progress}
          disabled={!hasAudio || !duration}
          onChange={(event) => seekToProgress(event.currentTarget.value)}
          aria-label="پیشرفت صوت"
          className="accent-ember h-2 min-w-0 flex-1 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        />
        <span>{formatAudioTime(duration)}</span>
      </div>

      {!hasAudio && (
        <p className="text-ink-3 mt-3 text-center text-xs leading-6">
          لینک فایل صوتی هنوز برای این مرحله تنظیم نشده است.
        </p>
      )}

      <div className="mt-4 flex items-center justify-center gap-7 text-sm font-black text-white sm:gap-8">
        <button
          type="button"
          onClick={() => seekBy(-10)}
          disabled={!hasAudio}
          className="inline-flex min-h-11 items-center gap-2 disabled:cursor-not-allowed disabled:opacity-45"
        >
          <Icon name="arrow-right" size={16} />
          ۱۰ ثانیه
        </button>
        <button
          type="button"
          onClick={() => void togglePlayback()}
          disabled={!hasAudio}
          className="bg-ember grid size-14 place-items-center rounded-full text-[#1a0a00] shadow-[0_0_38px_-8px_var(--glow)] transition-transform duration-250 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:scale-100"
          aria-label={isPlaying ? 'توقف صوت' : 'پخش صوت'}
        >
          {isPlaying ? (
            <span className="flex items-center gap-1">
              <span className="h-5 w-1.5 rounded-full bg-current" />
              <span className="h-5 w-1.5 rounded-full bg-current" />
            </span>
          ) : (
            <Icon name="play" size={22} />
          )}
        </button>
        <button
          type="button"
          onClick={() => seekBy(10)}
          disabled={!hasAudio}
          className="inline-flex min-h-11 items-center gap-2 disabled:cursor-not-allowed disabled:opacity-45"
        >
          ۱۰ ثانیه
          <Icon name="arrow-left" size={16} />
        </button>
      </div>
    </section>
  );
}

function formatAudioTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return '۰:۰۰';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');
  return toPersianDigits(`${minutes}:${remainingSeconds}`);
}

function SocialFollowStep({ step }: { step: StaticRoadmapStep }) {
  const socialLinks = step.socialLinks?.length
    ? step.socialLinks
    : [
        { label: 'Sample', value: 'Sample' },
        { label: 'Sample', value: 'Sample' },
      ];

  return (
    <section className="space-y-3 rounded-[18px] border border-[rgba(255,98,0,.16)] bg-[rgba(36,13,5,.72)] p-3 sm:p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {socialLinks.map((link, index) => (
          <div
            key={`${link.label}-${index}`}
            className="flex items-center gap-3 rounded-[12px] border border-[rgba(255,98,0,.22)] bg-black/25 px-3 py-2.5"
          >
            <CopyButton
              value={link.value}
              idleLabel={null}
              aria-label={`کپی ${link.label}`}
              className="hover:text-gold text-white/80"
            />
            <span className="min-w-0 flex-1 truncate text-left text-sm font-bold text-white">
              {link.label}
            </span>
            <span className="h-6 border-s border-[rgba(255,98,0,.35)]" />
            <Icon name="ig" size={18} className="text-white" />
          </div>
        ))}
      </div>
      {step.imageSlots?.[0] && <RoadmapImage slot={step.imageSlots[0]} index={0} wide />}
    </section>
  );
}

function ConnectStep({ step }: { step: StaticRoadmapStep }) {
  return (
    <section className="rounded-[18px] border border-[rgba(255,98,0,.16)] bg-[rgba(36,13,5,.72)] p-4 sm:p-5">
      <h3 className="border-b border-[rgba(255,98,0,.22)] pb-3 text-right text-sm font-black">
        نحوه انجام
      </h3>
      <div className="divide-y divide-[rgba(255,98,0,.18)]">
        {step.instructions?.map((instruction, index) => (
          <p
            key={`${instruction.title}-${index}`}
            className="text-ink-2 py-4 text-right text-[13px] leading-8"
          >
            <b className="text-gold">{instruction.title}: </b>
            <span className="lg:hidden">{instruction.mobile}</span>
            <span className="hidden lg:inline">{instruction.desktop}</span>
          </p>
        ))}
      </div>
    </section>
  );
}

function ChecklistStep({ step }: { step: StaticRoadmapStep }) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  return (
    <section className="space-y-3">
      {step.checklist?.map((item) => {
        const isChecked = Boolean(checked[item]);
        return (
          <button
            key={item}
            type="button"
            onClick={() => setChecked((prev) => ({ ...prev, [item]: !prev[item] }))}
            className="flex w-full items-center gap-3 rounded-[14px] border border-[rgba(255,98,0,.18)] bg-[rgba(36,13,5,.72)] p-3.5 text-right transition-colors hover:border-[rgba(255,98,0,.42)]"
          >
            <span
              className={cn(
                'grid size-6 shrink-0 place-items-center rounded-[7px] border transition-colors',
                isChecked
                  ? 'border-ember bg-ember text-[#1a0a00]'
                  : 'border-white/70 bg-transparent text-transparent',
              )}
            >
              <Icon name="check" size={15} />
            </span>
            <span className="text-ink-2 flex-1 text-[13px] leading-7">{item}</span>
          </button>
        );
      })}
    </section>
  );
}

function RoadmapImage({
  slot,
  index,
  wide = false,
}: {
  slot: { src: string; alt: string; size?: 'default' | 'wide'; fit?: 'cover' | 'contain' };
  index: number;
  wide?: boolean;
}) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-[14px] border border-[rgba(255,98,0,.18)] bg-black/45',
        wide ? 'aspect-[4.2] min-h-18' : 'mx-auto aspect-[2.15] w-full max-w-[430px]',
      )}
    >
      {!imageFailed && (
        // eslint-disable-next-line @next/next/no-img-element -- optional local asset, no optimizer required
        <img
          src={slot.src}
          alt={slot.alt}
          className={cn('absolute inset-0 size-full', slot.fit === 'contain' ? 'object-contain' : 'object-cover')}
          loading="lazy"
          onError={() => setImageFailed(true)}
        />
      )}
      {imageFailed && (
        <div className="absolute inset-0 grid place-items-center p-5 text-center">
          <div className="rounded-2xl border border-[rgba(255,98,0,.22)] bg-black/45 px-5 py-4 backdrop-blur-sm">
            <Icon
              name={index % 2 ? 'msg' : 'community'}
              size={24}
              className="text-ember mx-auto mb-2"
            />
            <p className="text-ink-2 text-xs leading-6">
              تصویر این بخش را در مسیر
              <br />
              <code className="text-gold mt-1 inline-block rounded bg-black/40 px-2 py-1" dir="ltr">
                {slot.src}
              </code>
              <br />
              قرار بده.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function CompleteFooter({
  xp,
  status,
  isCompleting,
  isLoadingProgress,
  onComplete,
}: {
  xp: number;
  status: StaticRoadmapStep['status'];
  isCompleting: boolean;
  isLoadingProgress: boolean;
  onComplete: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const isDone = status === 'done';
  const isLocked = status === 'next';

  return (
    <footer className="fixed inset-x-0 bottom-0 z-80 mt-auto shrink-0 border-t border-[rgba(255,98,0,.08)] bg-black/95 px-3.5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur-xl sm:static sm:inset-auto sm:z-20 sm:px-5 lg:flex lg:items-center lg:justify-between lg:px-6 lg:pb-4">
      <p className="text-ink-3 mb-4 text-center text-[12px] leading-6 lg:order-1 lg:mb-0 lg:text-right">
        با تکمیل این مرحله
        <b className="text-gold mx-1"> {formatPersianNumber(xp) + ' آتش '} </b>
        دریافت می‌کنی
      </p>
      <motion.div
        className="lg:order-2 lg:w-40"
        whileTap={reduceMotion ? undefined : { scale: 0.98 }}
      >
        <Button
          type="button"
          variant="primary"
          block
          disabled={isCompleting || isLoadingProgress || isDone || isLocked}
          onClick={onComplete}
          className="rounded-full text-white"
        >
          {isCompleting
            ? 'در حال بررسی...'
            : isDone
              ? 'قبلاً تکمیل شده'
              : isLocked
                ? 'مرحله قفل است'
                : 'تکمیل شد'}
          <Icon name="check" size={18} />
        </Button>
      </motion.div>
    </footer>
  );
}
