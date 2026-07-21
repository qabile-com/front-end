// src/features/dashboard/presentation/components/step-modal.tsx
'use client';

import { useState } from 'react';
import { cn } from '@/core/lib/cn';
import { toPersianDigits } from '@/core/lib/persian';
import { GlassCard, Button, Icon } from '@/shared/ui';
import type { RoadmapStepDetail } from '../../domain/roadmap.types';

interface StepModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  isCompleting?: boolean;
  detail: RoadmapStepDetail;
}

export function StepModal({
  isOpen,
  onClose,
  onComplete,
  isCompleting = false,
  detail,
}: StepModalProps) {
  const [checkedStepIds, setCheckedStepIds] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleToggleStep = (id: string) => {
    setCheckedStepIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const isAllChecked =
    detail.type === 'exercise' && detail.steps
      ? detail.steps.every((s) => checkedStepIds.includes(s.id))
      : true;

  const handleComplete = () => {
    if (detail.type === 'exercise' && !isAllChecked) return;
    onComplete();
  };

  const typeLabel = detail.type === 'lesson' ? 'درس' : 'مهارت';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <GlassCard className="bg-panel border-hair text-ink flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl shadow-2xl">
        {/* Header */}
        <div className="border-hair flex shrink-0 items-center justify-between border-b p-5">
          <button
            onClick={onClose}
            className="text-gold hover:text-ink group flex items-center gap-1.5 text-[14px] font-medium transition-colors"
          >
            <Icon
              name="arrow-right"
              size={20}
              className="transition-transform group-hover:-translate-x-1"
            />
            بازگشت
          </button>
          <h2 className="flex-1 px-4 text-center text-lg font-bold">{detail.title}</h2>
          <div className="bg-bg-2 border-hair flex items-center gap-1.5 rounded-full border px-3 py-1.5">
            <span className="text-gold text-[14px] font-bold">
              +{toPersianDigits(detail.xpReward)}
            </span>
            <span className="text-gold text-[12px]">آتش</span>
            <span className="bg-gold inline-block size-1.5 rounded-full shadow-[0_0_8px_var(--color-gold)]" />
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
          {/* Type Badge */}
          <div className="flex justify-start">
            <span className="bg-ember/10 text-ember border-ember rounded-sm border px-4 py-1.5 text-[12px] font-bold shadow-[0_4px_12px_-4px_rgba(255,98,0,0.3)]">
              {typeLabel}
            </span>
          </div>

          <p className="text-ink-2 text-right text-[15px] leading-[1.8]">{detail.introText}</p>

          {detail.type === 'lesson' ? (
            <div className="border-hair text-ink-2 rounded-[20px] border bg-[rgba(255,98,0,0.1)] p-6 text-right text-[14.5px] leading-[1.9] whitespace-pre-line">
              {detail.contentText}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-ink-3 mb-1 text-right text-[14px]">
                مراحل زیر را به ترتیب کامل کن:
              </p>
              {detail.steps?.map((step) => {
                const isChecked = checkedStepIds.includes(step.id);
                return (
                  <div
                    key={step.id}
                    onClick={() => handleToggleStep(step.id)}
                    className={cn(
                      'flex cursor-pointer items-start gap-4 rounded-[16px] p-4 transition-all duration-200',
                      'bg-bg-2 border-hair hover:border-ember/50 hover:bg-bg border',
                      isChecked && 'border-ember/60 ring-ember/20 ring-1',
                    )}
                  >
                    <div
                      className={cn(
                        'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border-2 transition-all duration-200',
                        isChecked
                          ? 'bg-ember border-ember text-[#1a0a00]'
                          : 'border-hair text-transparent',
                      )}
                    >
                      {isChecked && <Icon name="check" size={16} />}
                    </div>
                    <span
                      className={cn(
                        'text-right text-[14.5px] leading-relaxed',
                        isChecked ? 'text-ink font-medium' : 'text-ink-2',
                      )}
                    >
                      {step.text}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-hair bg-bg flex shrink-0 items-center justify-between rounded-b-3xl border-t p-5">
          <div className="text-ink-3 text-[13px]">
            با تکمیل این مرحله{' '}
            <span className="text-gold font-extrabold">
              +{toPersianDigits(detail.xpReward)} آتش
            </span>{' '}
            دریافت می‌کنی
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={handleComplete}
            disabled={isCompleting || (detail.type === 'exercise' && !isAllChecked)}
            className="text-white"
          >
            {isCompleting ? 'در حال ثبت...' : 'تکمیل شد'}
            <Icon name="check" size={20} />
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}
