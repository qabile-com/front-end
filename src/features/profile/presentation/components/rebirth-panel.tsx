'use client';

import { useState } from 'react';
import { Icon, InlineSpinner } from '@/shared/ui';
import { cn } from '@/core/lib/cn';
import { toPersianDigits } from '@/core/lib/persian';
import { getApiErrorMessage } from '@/core/api/api-error-message';
import { showError, showSuccess } from '@/shared/lib/toast';
import type { IProfileRepository, RebirthResult } from '../../domain/profile-repository';
import { usePerformRebirth, useRebirthStatus } from '../../application/use-profile-settings';

const LOSS_ROWS = [
  { label: 'تمام آتش‌ها', description: 'تمام آتش موجود در حساب صفر می‌شود' },
  { label: 'تمام دستاوردها', description: 'همه دستاوردهای معمولی و مخفی پاک می‌شوند' },
  { label: 'تمام بج‌ها', description: 'تمام بج‌ها و مدال‌ها حذف می‌شوند' },
  { label: 'پیشرفت‌ها', description: 'پیشرفت دوره‌ها و عادت‌ها ریست می‌شود' },
];

const GAIN_ROWS = [
  { label: 'تیک تأیید هویت', description: 'هویت به‌صورت دائمی روی پروفایل نمایش داده می‌شود' },
];

interface RebirthPanelProps {
  repo: IProfileRepository;
}

export function RebirthPanel({ repo }: RebirthPanelProps) {
  const statusQuery = useRebirthStatus(repo);
  const performRebirth = usePerformRebirth(repo);
  const [isConfirming, setIsConfirming] = useState(false);
  const [hasAcknowledged, setHasAcknowledged] = useState(false);
  const [result, setResult] = useState<RebirthResult | null>(null);

  const handleConfirmRebirth = async () => {
    const confirmedAgain = window.confirm(
      'این آخرین هشدار است. با تایید، تولد دوباره برای همیشه انجام می‌شود و امکان بازگشت وجود ندارد. ادامه می‌دهی؟',
    );
    if (!confirmedAgain) return;

    try {
      const data = await performRebirth.mutateAsync();
      setResult(data);
      setIsConfirming(false);
      showSuccess('تولد دوباره با موفقیت انجام شد.');
    } catch (error) {
      showError(getApiErrorMessage(error, 'تولد دوباره انجام نشد. دوباره تلاش کن.'));
    }
  };

  if (result) {
    return <RebirthSuccessView result={result} />;
  }

  if (statusQuery.isLoading) {
    return (
      <div className="flex min-h-40 items-center justify-center">
        <InlineSpinner className="text-ember size-6" />
      </div>
    );
  }

  if (statusQuery.isError || !statusQuery.data) {
    return (
      <div className="text-ink-3 rounded-2xl border border-[var(--color-hair)] bg-black/20 p-5 text-center text-sm">
        وضعیت تولد دوباره دریافت نشد.
      </div>
    );
  }

  const status = statusQuery.data;

  if (status.maxReached) {
    const hasRebirthedBefore = status.rebirthCount > 0;

    return (
      <div className="mx-auto max-w-[560px] py-2 text-center">
        <h3 className="text-ink mt-6 text-[16px] font-black">
          {hasRebirthedBefore ? 'به حداکثر سطح تولد دوباره رسیدی' : 'تولد دوباره فعلاً در دسترس نیست'}
        </h3>
        <p className="text-ink-3 mt-2 text-[13px] leading-7">
          {hasRebirthedBefore
            ? `هویت تو با سطح تولد دوباره ${toPersianDigits(status.rebirthCount)} به‌صورت دائمی تأیید شده است.`
            : 'در حال حاضر هیچ سطح فعالی برای تولد دوباره تعریف نشده است. کمی بعد دوباره سر بزن.'}
        </p>
      </div>
    );
  }

  if (isConfirming) {
    return (
      <RebirthConfirmView
        status={status}
        hasAcknowledged={hasAcknowledged}
        onToggleAcknowledge={() => setHasAcknowledged((v) => !v)}
        onCancel={() => {
          setIsConfirming(false);
          setHasAcknowledged(false);
        }}
        onConfirm={() => void handleConfirmRebirth()}
        isPending={performRebirth.isPending}
      />
    );
  }

  const requiredXp = status.requiredXp ?? status.nextRule?.requiredXp ?? 0;
  const xpProgress = requiredXp > 0 ? Math.min(100, (status.currentXp / requiredXp) * 100) : 0;

  return (
    <div className="mx-auto max-w-[560px] py-2 text-right">
      <h3 className="text-ink text-center text-[19px] font-black">تولد دوباره</h3>
      <p className="text-ink-2 mt-2 text-center text-[13px] leading-7">
        این سیستم برای کسانی طراحی شده که می‌خواهند هویت واقعی و تأییدشده‌ای در قبیله داشته باشند.
        با فدا کردن پیشرفت فعلی‌ات، برای همیشه هویت تأییدشده دریافت می‌کنی.
      </p>

      <RebirthTable
        title="هزینه ریبرث"
        valueHeader="مقدار"
        rows={[
          {
            label: `هزینه انجام ریبرث${status.nextRule ? ` (تولد دوباره #${toPersianDigits(status.nextRule.rebirthNumber)})` : ''}`,
            description: `${toPersianDigits(requiredXp)} آتش`,
          },
        ]}
        tone="gold"
      />

      <div className="mt-3 rounded-2xl border border-[rgba(255,98,0,.18)] bg-[rgba(255,98,0,.06)] p-4">
        <div className="h-2 overflow-hidden rounded-full bg-black/30">
          <div
            className="h-full [background:var(--fire-grad)]"
            style={{ width: `${xpProgress}%` }}
          />
        </div>
        <div className="text-ink-3 mt-2 flex items-center justify-between text-[11px] font-bold">
          <span>آتش فعلی: {toPersianDigits(status.currentXp)}</span>
          {!status.canRebirth && status.xpShortage ? (
            <span className="text-danger">
              {toPersianDigits(status.xpShortage)} آتش دیگر لازم داری
            </span>
          ) : null}
        </div>
      </div>

      <RebirthTable
        title="چیزی که از دست می‌دهید"
        valueHeader="توضیح"
        rows={LOSS_ROWS}
        tone="danger"
      />
      <RebirthTable
        title="چیزی که به دست می‌آورید"
        valueHeader="توضیح"
        rows={GAIN_ROWS}
        tone="gold"
      />

      <div className="border-danger/30 mt-4 rounded-xl border bg-[rgba(255,60,60,.06)] px-4 py-3">
        <p className="text-danger text-[12.5px] leading-6 font-extrabold">
          این یک تصمیم سنگین و غیرقابل بازگشت است. پیش از ادامه مطمئن شو.
        </p>
      </div>

      <button
        type="button"
        disabled={!status.canRebirth}
        onClick={() => setIsConfirming(true)}
        className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-[8px] bg-gradient-to-l from-[#cc4308] to-[#ff6200] text-[13.5px] font-black text-white shadow-[0_18px_40px_-22px_var(--glow)] transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Icon name="flame" size={16} />
        شروع تولد دوباره
      </button>
    </div>
  );
}

function RebirthTable({
  title,
  valueHeader,
  rows,
  tone,
}: {
  title: string;
  valueHeader: string;
  rows: { label: string; description: string }[];
  tone: 'danger' | 'gold';
}) {
  const toneText = tone === 'danger' ? 'text-danger' : 'text-gold';

  return (
    <div className="mt-5">
      <h4 className={cn('mb-2 text-[13px] font-black', toneText)}>{title}</h4>
      <div className="overflow-hidden rounded-xl border border-[rgba(255,98,0,.18)]">
        <div className="flex [background:var(--fire-grad)]">
          <div className="flex-[1.6] px-3 py-2 text-[11px] font-black text-[#1a0a00]">
            {valueHeader}
          </div>
          <div className="flex-1 border-l border-black/15 px-3 py-2 text-[11px] font-black text-[#1a0a00]">
            مورد
          </div>
        </div>
        {rows.map((row, index) => (
          <div
            key={row.label}
            className={cn('flex bg-black/30', index > 0 && 'border-t border-white/5')}
          >
            <div className="text-ink-2 flex-[1.6] px-3 py-2.5 text-[11.5px] leading-6">
              {row.description}
            </div>
            <div
              className={cn(
                'flex-1 border-l border-white/5 px-3 py-2.5 text-[11.5px] font-bold',
                toneText,
              )}
            >
              {row.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RebirthConfirmView({
  status,
  hasAcknowledged,
  onToggleAcknowledge,
  onCancel,
  onConfirm,
  isPending,
}: {
  status: {
    currentXp: number;
    requiredXp?: number | null;
    nextRule?: { requiredXp: number } | null;
  };
  hasAcknowledged: boolean;
  onToggleAcknowledge: () => void;
  onCancel: () => void;
  onConfirm: () => void;
  isPending: boolean;
}) {
  const requiredXp = status.requiredXp ?? status.nextRule?.requiredXp ?? 0;

  return (
    <div className="mx-auto max-w-[560px] py-2 text-right">
      <div className="text-center">
        <span className="text-danger mx-auto grid size-14 place-items-center rounded-2xl border border-red-500/25 bg-red-500/10">
          <Icon name="flame" size={26} />
        </span>
        <h3 className="text-ink mt-4 text-[16px] font-black">آیا مطمئن هستی؟</h3>
        <p className="text-ink-3 mt-2 text-[13px] leading-7">
          با تأیید این عمل، {toPersianDigits(requiredXp)} آتش سوزانده می‌شود و تمام آتش، دستاوردها،
          بج‌ها و پیشرفت دوره‌ها و عادت‌هایت برای همیشه از بین می‌رود. این عمل غیرقابل بازگشت است.
        </p>
      </div>

      <button
        type="button"
        onClick={onToggleAcknowledge}
        className="border-danger/25 mt-5 flex w-full items-start gap-3 rounded-xl border bg-[rgba(255,60,60,.06)] p-3.5 text-right"
      >
        <span
          className={cn(
            'mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border-2 transition-colors',
            hasAcknowledged ? 'border-danger bg-danger' : 'border-danger/40',
          )}
        >
          {hasAcknowledged && <Icon name="check" size={12} className="text-white" />}
        </span>
        <span className="text-ink-2 text-[12.5px] leading-6">
          متوجه هستم که این تصمیم غیرقابل بازگشت است و تمام پیشرفتم از بین می‌رود.
        </span>
      </button>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={isPending}
          onClick={onCancel}
          className="border-hair text-ink-2 flex h-12 items-center justify-center rounded-[8px] border text-[13px] font-black disabled:opacity-60"
        >
          انصراف
        </button>
        <button
          type="button"
          disabled={!hasAcknowledged || isPending}
          onClick={onConfirm}
          className="bg-danger flex h-12 items-center justify-center gap-1.5 rounded-[8px] px-2 text-[13px] font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending && <InlineSpinner className="size-3.5 shrink-0" />}
          <span className="truncate">تایید نهایی</span>
        </button>
      </div>
    </div>
  );
}

function RebirthSuccessView({ result }: { result: RebirthResult }) {
  return (
    <div className="mx-auto max-w-[560px] py-4 text-center">
      <span className="text-gold mx-auto grid size-16 place-items-center rounded-2xl border border-[rgba(243,186,99,.3)] [background:linear-gradient(135deg,rgba(255,98,0,.16),rgba(243,186,99,.08))]">
        <Icon name="shield" size={28} />
      </span>
      <h3 className="text-ink mt-4 text-[17px] font-black">تبریک! تیک تأیید هویت دریافت شد</h3>
      <p className="text-ink-3 mt-2 text-[13px] leading-7">
        تولد دوباره شماره {toPersianDigits(result.completedRebirthNumber)} با سوزاندن{' '}
        {toPersianDigits(result.burnedXp)} آتش انجام شد. هویت تو از این پس به‌صورت دائمی تأیید شده
        نمایش داده می‌شود.
      </p>
    </div>
  );
}
