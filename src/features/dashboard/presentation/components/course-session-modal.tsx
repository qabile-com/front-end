// src/features/dashboard/presentation/components/course-session-modal.tsx
'use client';

import { cn } from '@/core/lib/cn';
import { GlassCard, Button, Icon } from '@/shared/ui';
import type { CoursePart } from '../../domain/courses.data';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  session: CoursePart;
  onMarkComplete: () => void;
}

export function CourseSessionModal({ isOpen, onClose, session, onMarkComplete }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <GlassCard className="border-hair flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden [background:var(--color-panel)]">
        {/* Header */}
        <div className="border-hair flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-bold">{session.title}</h2>
          <button onClick={onClose} className="text-ink-2 hover:text-ink p-2 transition-colors">
            <Icon name="plus" size={24} className="rotate-45" />
          </button>
        </div>

        {/* Video Player Placeholder */}
        <div className="relative flex aspect-video w-full items-center justify-center bg-black">
          <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent" />
          <button className="bg-ember hover:bg-ember-deep group z-10 flex h-16 w-16 items-center justify-center rounded-full shadow-lg transition-colors">
            <Icon
              name="play"
              size={24}
              className="text-white transition-transform group-hover:scale-110"
            />
          </button>
          <div className="absolute right-4 bottom-4 rounded-full bg-black/60 px-3 py-1 text-xs text-white/80">
            {session.duration}
          </div>
        </div>

        {/* Info & Steps */}
        <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
          <div className="border-hair flex items-center justify-between border-b pb-4">
            <div className="text-ink-3 flex items-center gap-6 text-sm">
              <span className="flex items-center gap-2">
                <Icon name="clock" size={16} /> {session.duration}
              </span>
              <span className="flex items-center gap-2">
                <Icon name="eye" size={16} /> ۱,۲۳۴ بازدید
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="check" size={20} className="text-gold" />
              <span className="text-ink-3 text-xs">مرحله ۱ از ۳</span>
            </div>
          </div>

          {/* Exercise Steps */}
          {session.steps && session.steps.length > 0 && (
            <div className="space-y-3 rounded-xl bg-(--glass-2) p-4">
              <h3 className="text-ink-2 mb-2 font-bold">مراحل تمرین:</h3>
              {session.steps.map((step) => (
                <label
                  key={step.id}
                  className="group bg-panel flex cursor-pointer items-start gap-3 rounded-lg p-3 transition-colors hover:bg-(--glass)"
                >
                  <div
                    className={cn(
                      'flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-colors',
                      step.isCompleted
                        ? 'bg-ember border-ember text-white'
                        : 'border-hair group-hover:border-ink-4 text-transparent',
                    )}
                  >
                    {step.isCompleted && <Icon name="check" size={16} />}
                  </div>
                  <span className="text-ink-2 text-right text-sm leading-relaxed">{step.text}</span>
                </label>
              ))}
            </div>
          )}

          {/* Comments Section */}
          <div className="rounded-xl bg-(--glass-2) p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-ink-2 text-sm font-bold">نظرات کاربران (۳)</h3>
            </div>
            <div className="space-y-4">
              {/* Placeholder comment */}
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500 text-xs font-bold text-white">
                  س
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-ink text-sm font-bold">سارا محمدی</span>
                    <span className="text-ink-4 text-xs">۲ روز پیش</span>
                  </div>
                  <p className="text-ink-3 mt-1 text-sm">خیلی مفید بود!</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-hair flex justify-end border-t p-4">
          <Button variant="primary" size="md" onClick={onMarkComplete}>
            <Icon name="check" size={20} />
            تکمیل شد
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}
