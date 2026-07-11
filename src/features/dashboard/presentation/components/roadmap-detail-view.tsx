// src/features/dashboard/presentation/components/roadmap-detail-view.tsx
'use client';

import { cn } from '@/core/lib/cn';
import { toPersianDigits } from '@/core/lib/persian';
import { GlassCard, Button, Icon } from '@/shared/ui';
import type { CurrentUser, RoadmapItem } from '../../domain/dashboard.types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user: CurrentUser;
  roadmap: RoadmapItem[];
}

export function RoadmapDetailView({ isOpen, onClose, user, roadmap }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <GlassCard className="border-hair flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden [background:var(--color-panel)]">
        {/* Header */}
        <div className="border-hair flex items-center justify-between border-b p-4">
          <span className="text-lg font-bold">نقشه راه من</span>
          <button onClick={onClose} className="text-ink-2 hover:text-ink transition-colors">
            <Icon name="arrow" size={24} />
          </button>
        </div>

        {/* User Status Header */}
        <div className="flex flex-col items-center p-6">
          <div
            className="mb-4 flex h-20 w-20 items-center justify-center rounded-full text-3xl font-bold text-white"
            style={{ background: user.avatar }}
          >
            {user.initial}
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <p className="text-ink-3 mt-1 text-sm">
              {user.title} ، سطح {toPersianDigits(user.level)}
            </p>
          </div>
        </div>

        {/* Progress Stats */}
        <div className="border-hair grid grid-cols-4 gap-2 border-t border-b px-4 py-2 text-center">
          <div>
            <div className="text-gold text-lg font-bold">{toPersianDigits(user.xp)}</div>
            <div className="text-ink-3 mt-1 text-[10px]">امتیاز</div>
          </div>
          <div>
            <div className="text-ember text-lg font-bold">۳۱</div>
            <div className="text-ink-3 mt-1 text-[10px]">روز زنجیره</div>
          </div>
          <div>
            <div className="text-ink text-lg font-bold">۱۲۰</div>
            <div className="text-ink-3 mt-1 text-[10px]">هم پرواز</div>
          </div>
          <div>
            <div className="text-ink text-lg font-bold">۸۵</div>
            <div className="text-ink-3 mt-1 text-[10px]">هم پرواز شده</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-3 p-4">
          <Button variant="primary" size="sm">
            هم پرواز شدن
          </Button>
          <Button variant="ghost" size="sm" className="border-danger text-danger border">
            بلاک
          </Button>
        </div>

        {/* Roadmap Steps List */}
        <div className="flex-1 space-y-3 overflow-y-auto p-4 pt-0">
          <h3 className="text-md text-ink-2 mt-2 mb-4 font-bold">مراحل پیش رو</h3>
          {roadmap.map((step, index) => {
            const isActive = step.status === 'current' || step.status === 'next';
            return (
              <div
                key={step.num}
                className={cn(
                  'flex items-center justify-between rounded-xl border-r-4 bg-[var(--glass-2)] p-4',
                  isActive ? 'border-ember' : 'border-transparent opacity-60',
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold',
                      step.status === 'done'
                        ? 'bg-gold text-black'
                        : isActive
                          ? 'bg-ember text-white'
                          : 'text-ink-4 bg-[var(--glass)]',
                    )}
                  >
                    {step.status === 'done' ? (
                      <Icon name="check" size={16} />
                    ) : (
                      toPersianDigits(index + 1)
                    )}
                  </div>
                  <span className="text-ink-2 text-sm">{step.title}</span>
                </div>
                <div className="text-ink-4 flex items-center text-xs">
                  {step.status === 'done' && '✔ تکمیل شده'}
                  {isActive && <span className="text-gold">+{toPersianDigits(step.xp)} XP</span>}
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
}
