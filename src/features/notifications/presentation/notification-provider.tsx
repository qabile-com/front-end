'use client';

import { BaseModal, Button, Icon } from '@/shared/ui';
import { useNotificationRegistration } from '../application/use-notification-registration';

export function NotificationProvider() {
  const notifications = useNotificationRegistration();
  const { availability, permission } = notifications;

  // Only prompt where enabling notifications is actually possible. In particular iOS outside a
  // home-screen install gets nothing: web push can't work there, so a modal would just be noise.
  if (availability !== 'available') return null;
  if (permission === 'granted') return null;

  const isBlocked = permission === 'denied';

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
          <Icon name="bell" size={22} />
        </span>

        <h2 className="text-ink mt-4 text-lg font-black">
          {isBlocked ? 'اعلان‌ها در مرورگر مسدود شده' : 'اعلان‌های قبیله رو فعال کن'}
        </h2>

        <p className="text-ink-3 mt-2 text-sm leading-7">
          {isBlocked
            ? 'قبلاً اجازه اعلان رد شده است. برای فعال‌سازی، از تنظیمات سایت در مرورگر اجازه اعلان را روشن کن.'
            : 'یادآوری دوره‌ها، پاداش‌ها و خبرهای مهم مسیرت را به موقع دریافت کن.'}
        </p>

        <div className="mt-5 grid gap-2">
          {!isBlocked && (
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
            {isBlocked ? 'باشه' : 'فعلاً نه'}
          </button>
        </div>
      </div>
    </BaseModal>
  );
}
