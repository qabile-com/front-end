'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { Button, CopyButton, DashboardPageShell, Icon, MotionPage } from '@/shared/ui';
import { cn } from '@/core/lib/cn';
import { formatPersianNumber, toPersianDigits } from '@/core/lib/persian';
import { useActiveRoadmap } from '../../application/use-active-roadmap';
import { useCompleteRoadmapStep } from '../../application/use-complete-roadmap-step';
import { useStepCondition } from '../../application/use-step-condition';
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
  const condition = useStepCondition(stepWithProgress);

  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [timerFinished, setTimerFinished] = useState(false);

  const isDone = stepWithProgress.status === 'done';
  const isLocked = stepWithProgress.status === 'next';
  const conditionType = stepWithProgress.condition?.type;

  const isConditionSatisfied = useMemo(() => {
    if (isDone) return true;
    if (!stepWithProgress.condition) return true;

    switch (stepWithProgress.condition.type) {
      case 'posts':
      case 'engagement':
      case 'follows':
        return condition.satisfied;
      case 'timer':
        return timerFinished;
      case 'checklist':
        if (!stepWithProgress.checklist?.length) return true;
        return stepWithProgress.checklist.every((item) => Boolean(checkedItems[item]));
      default:
        return true;
    }
  }, [isDone, stepWithProgress, condition.satisfied, timerFinished, checkedItems]);

  const canComplete = !completeStep.isPending && !activeRoadmap.loading && !isDone && !isLocked && isConditionSatisfied;

  const handleComplete = useCallback(async () => {
    if (!canComplete) return;

    const reward = await completeStep.mutateAsync({
      roadmapId: activeRoadmap.roadmap?.id,
      stepId: getRoadmapStepBackendId(stepWithProgress, activeRoadmap.roadmap),
      num: stepWithProgress.id,
    });
    enqueueReward(reward, {
      xpDescription: `آتش مرحله ${toPersianDigits(stepWithProgress.id)} به حساب قبیله‌ات اضافه شد.`,
    });
  }, [canComplete, completeStep, activeRoadmap.roadmap, stepWithProgress, enqueueReward]);

  const conditionMessage = useMemo(() => {
    if (isDone) return null;
    if (condition.message) return condition.message;
    if (conditionType === 'timer' && !timerFinished) {
      return `برای تکمیل این مرحله باید ${toPersianDigits(stepWithProgress.condition?.seconds ?? 0)} ثانیه در این صفحه بمانید.`;
    }
    if (conditionType === 'checklist' && stepWithProgress.checklist) {
      const total = stepWithProgress.checklist.length;
      const checked = stepWithProgress.checklist.filter((item) => Boolean(checkedItems[item])).length;
      if (checked < total) {
        return `برای تکمیل این مرحله ${toPersianDigits(total - checked)} مورد دیگر را تیک بزن.`;
      }
    }
    return null;
  }, [isDone, condition.message, conditionType, timerFinished, stepWithProgress.checklist, stepWithProgress.condition, checkedItems]);

  return (
    <MotionPage>
      <DashboardPageShell
        size="narrow"
        className="min-h-[520px] sm:h-[calc(100dvh-9rem)] lg:h-[calc(100dvh-7.5rem)]"
      >
        <article className="roadmap-step-card relative mx-auto flex w-full max-w-[820px] flex-col overflow-hidden rounded-none border border-transparent bg-black shadow-[0_28px_90px_-54px_var(--glow)] sm:rounded-[24px] sm:border-[rgba(255,98,0,.24)] sm:h-full lg:max-w-[860px]">
          <StepTopBar step={stepWithProgress} onBack={() => router.back()} />

          <div className="flex min-h-0 flex-col sm:flex-1 sm:overflow-hidden">
            <div className="min-h-0 px-3.5 py-4 pb-38 sm:flex-1 sm:[scrollbar-gutter:stable] sm:overflow-y-auto sm:overscroll-contain sm:px-5 sm:pb-8 lg:px-6 lg:py-5">
              <div className="space-y-5">
                <StepIntro step={stepWithProgress} />
                <StepBody
                  step={stepWithProgress}
                  checkedItems={checkedItems}
                  onCheckedChange={setCheckedItems}
                />
              </div>

              {conditionMessage && (
                <div className="border-hair mt-5 rounded-[14px] border bg-black/30 p-4 text-center">
                  <p className="text-ink-3 text-[13px] font-bold leading-7">{conditionMessage}</p>
                </div>
              )}

              {conditionType === 'timer' && stepWithProgress.condition?.type === 'timer' && (
                <TimerDisplay
                  key={stepWithProgress.id}
                  seconds={stepWithProgress.condition.seconds}
                  onComplete={() => {
                    setTimerFinished(true);
                  }}
                />
              )}
            </div>

            <CompleteFooter
              xp={stepWithProgress.xp}
              status={stepWithProgress.status}
              isCompleting={completeStep.isPending}
              isLoadingProgress={activeRoadmap.loading}
              canComplete={canComplete}
              onComplete={handleComplete}
            />
          </div>
        </article>
      </DashboardPageShell>

      <ActionRewardModals reward={currentReward} onClose={dismissCurrentReward} />
    </MotionPage>
  );
}

function TimerDisplay({ seconds, onComplete }: { seconds: number; onComplete: () => void }) {
  const [remaining, setRemaining] = useState(seconds);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (remaining <= 0) {
      onComplete();
      return;
    }

    intervalRef.current = window.setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [remaining, onComplete]);

  return (
    <div className="border-hair mt-5 rounded-[14px] border bg-black/30 p-4 text-center">
      <p className="text-ink-3 text-[13px] font-bold leading-7">
        برای تکمیل این مرحله باید در این صفحه بمانید.
      </p>
      {remaining > 0 && (
        <p className="text-gold mt-2 text-lg font-black">
          {toPersianDigits(remaining)} ثانیه
        </p>
      )}
    </div>
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

function StepBody({
  step,
  checkedItems,
  onCheckedChange,
}: {
  step: StaticRoadmapStep;
  checkedItems: Record<string, boolean>;
  onCheckedChange: (checked: Record<string, boolean>) => void;
}) {
  switch (step.kind) {
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
      return <ChecklistStep step={step} checkedItems={checkedItems} onCheckedChange={onCheckedChange} />;
    default:
      return null;
  }
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

function ChecklistStep({
  step,
  checkedItems,
  onCheckedChange,
}: {
  step: StaticRoadmapStep;
  checkedItems: Record<string, boolean>;
  onCheckedChange: (checked: Record<string, boolean>) => void;
}) {
  return (
    <section className="space-y-3">
      {step.checklist?.map((item) => {
        const isChecked = Boolean(checkedItems[item]);
        return (
          <button
            key={item}
            type="button"
            onClick={() => {
              const next: Record<string, boolean> = { ...checkedItems, [item]: !checkedItems[item] };
              onCheckedChange(next);
            }}
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
  canComplete,
  onComplete,
}: {
  xp: number;
  status: StaticRoadmapStep['status'];
  isCompleting: boolean;
  isLoadingProgress: boolean;
  canComplete: boolean;
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
          disabled={isCompleting || isLoadingProgress || isDone || isLocked || !canComplete}
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
