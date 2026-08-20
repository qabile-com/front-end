'use client';

import { useState } from 'react';
import { Icon, InlineSpinner } from '@/shared/ui';
import { cn } from '@/core/lib/cn';
import { toPersianDigits } from '@/core/lib/persian';
import { getApiErrorMessage } from '@/core/api/api-error-message';
import { showError, showSuccess } from '@/shared/lib/toast';
import type { IProfileRepository, RebirthResult } from '../../domain/profile-repository';
import { usePerformRebirth, useRebirthStatus } from '../../application/use-profile-settings';

const LOSS_ITEMS = [
  'تمام آتش‌های موجود در حساب صفر می‌شود',
  'همه دستاوردهای معمولی و مخفی پاک می‌شوند',
  'تمام بج‌ها و مدال‌ها حذف می‌شوند',
  'پیشرفت دوره‌ها و عادت‌ها ریست می‌شود',
];

const GAIN_ITEMS = ['تیک تأیید هویت به‌صورت دائمی روی پروفایل نمایش داده می‌شود'];

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
    return (
      <div className="mx-auto max-w-[560px] py-2 text-center">
        <span className="text-gold mx-auto grid size-14 place-items-center rounded-2xl border border-[rgba(243,186,99,.24)] bg-black/25">
          <Icon name="shield" size={26} />
        </span>
        <h3 className="text-ink mt-4 text-[16px] font-black">به حداکثر سطح تولد دوباره رسیدی</h3>
        <p className="text-ink-3 mt-2 text-[13px] leading-7">
          هویت تو با سطح تولد دوباره {toPersianDigits(status.rebirthCount)} به‌صورت دائمی تأیید شده
          است.
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
      <div className="flex items-center gap-3">
        <span className="text-gold grid size-12 shrink-0 place-items-center rounded-2xl border border-[rgba(243,186,99,.24)] bg-black/25">
          <Icon name="flame" size={22} />
        </span>
        <div>
          <h3 className="text-ink text-[16px] font-black">تولد دوباره</h3>
          <p className="text-ink-3 mt-0.5 text-[12.5px]">دریافت هویت واقعی و تأییدشده در قبیله</p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-[rgba(255,98,0,.18)] bg-[rgba(255,98,0,.06)] p-4">
        <div className="flex items-center justify-between">
          <span className="text-ink-2 text-[12.5px] font-bold">
            هزینه تولد دوباره {status.nextRule ? `#${toPersianDigits(status.nextRule.rebirthNumber)}` : ''}
          </span>
          <span className="text-gold text-[14px] font-black">
            {toPersianDigits(requiredXp)} آتش
          </span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/30">
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

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <RebirthList
          title="چیزی که از دست می‌دهی"
          items={LOSS_ITEMS}
          icon="trash"
          tone="danger"
        />
        <RebirthList title="چیزی که به دست می‌آوری" items={GAIN_ITEMS} icon="shield" tone="gold" />
      </div>

      <div className="border-danger/30 mt-4 rounded-xl border bg-[rgba(255,60,60,.06)] px-4 py-3">
        <p className="text-danger text-[12.5px] font-extrabold leading-6">
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

function RebirthList({
  title,
  items,
  icon,
  tone,
}: {
  title: string;
  items: string[];
  icon: 'trash' | 'shield';
  tone: 'danger' | 'gold';
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border p-4',
        tone === 'danger'
          ? 'border-danger/25 bg-[rgba(255,60,60,.05)]'
          : 'border-[rgba(243,186,99,.24)] bg-[rgba(243,186,99,.06)]',
      )}
    >
      <div className="flex items-center gap-2">
        <Icon name={icon} size={15} className={tone === 'danger' ? 'text-danger' : 'text-gold'} />
        <b className={cn('text-[12.5px] font-black', tone === 'danger' ? 'text-danger' : 'text-gold')}>
          {title}
        </b>
      </div>
      <ul className="text-ink-2 mt-3 space-y-2 text-[12px] leading-6">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-1.5">
            <span className={cn('mt-2 size-1 shrink-0 rounded-full', tone === 'danger' ? 'bg-danger' : 'bg-gold')} />
            {item}
          </li>
        ))}
      </ul>
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
  status: { currentXp: number; requiredXp?: number | null; nextRule?: { requiredXp: number } | null };
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
