'use client';

import { BaseModal, Button, Icon } from '@/shared/ui';
import { useNotificationRegistration } from '../application/use-notification-registration';

const IOS_INSTALL_STEPS = [
  'در سافاری روی دکمه Share (مربع با فلش رو به بالا) بزن.',
  'گزینه «Add to Home Screen» را انتخاب کن و Add را بزن.',
  'اپ قبیله را از صفحه اصلی باز کن و دوباره وارد شو تا اعلان‌ها فعال شود.',
];

export function NotificationProvider() {
  const notifications = useNotificationRegistration();
  const { availability, permission } = notifications;

  // Nothing actionable to show while we're still detecting support, on platforms that simply
  // can't do web push, or once the user already granted permission.
  if (availability === 'loading' || availability === 'unsupported') return null;
  if (availability === 'insecure-context') return null;
  if (availability === 'available' && permission === 'granted') return null;

  const needsInstall = availability === 'requires-install';
  const isBlocked = availability === 'available' && permission === 'denied';

  return (
    <BaseModal
      isOpen={notifications.shouldShowPrompt}
      onClose={notifications.dismissPrompt}
      title="فعال‌سازی اعلان‌ها"
      panelClassName="w-full max-w-sm"
      contentClassName="rounded-[24px] border border-[var(--color-hair)] bg-[var(--color-panel)] p-5 shadow-[0_28px_80px_-48px_var(--glow)]"
    >
      <div className="text-center">
        <span className="text-gold mx-auto grid size-12 place-items-center rounded-2xl border border-[rgba(243,186,99,.24)] bg-black/25">
          <Icon name={needsInstall ? 'download' : 'bell'} size={22} />
        </span>

        <h2 className="text-ink mt-4 text-lg font-black">
          {needsInstall
            ? 'برای دریافت اعلان‌ها، اپ را نصب کن'
            : isBlocked
              ? 'اعلان‌ها در مرورگر مسدود شده'
              : 'اعلان‌های قبیله رو فعال کن'}
        </h2>

        <p className="text-ink-3 mt-2 text-sm leading-7">
          {needsInstall
            ? 'در آیفون، اعلان‌ها فقط وقتی کار می‌کند که قبیله را به صفحه اصلی اضافه کرده باشی.'
            : isBlocked
              ? 'قبلاً اجازه اعلان رد شده است. برای فعال‌سازی، از تنظیمات سایت در مرورگر اجازه اعلان را روشن کن.'
              : 'یادآوری دوره‌ها، پاداش‌ها و خبرهای مهم مسیرت را به موقع دریافت کن.'}
        </p>

        {needsInstall && (
          <ol className="text-ink-2 mt-4 space-y-2 text-right text-[13px] leading-7">
            {IOS_INSTALL_STEPS.map((step, index) => (
              <li key={step} className="flex items-start gap-2">
                <span className="text-gold mt-[2px] font-black">{index + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        )}

        <div className="mt-5 grid gap-2">
          {!needsInstall && !isBlocked && (
            <Button
              type="button"
              disabled={notifications.isRegistering}
              onClick={() => void notifications.register()}
              className="min-h-12"
            >
              <Icon name="bell" size={17} />
              {notifications.isRegistering ? 'در حال فعال‌سازی...' : 'فعال‌سازی اعلان‌ها'}
            </Button>
          )}
          <button
            type="button"
            onClick={notifications.dismissPrompt}
            className="text-ink-3 hover:text-ink inline-flex min-h-11 items-center justify-center rounded-xl text-sm font-bold transition-colors"
          >
            {needsInstall || isBlocked ? 'باشه' : 'فعلاً نه'}
          </button>
        </div>
      </div>
    </BaseModal>
  );
}
