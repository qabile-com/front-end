'use client';

import { BaseModal, Icon, Toggle } from '@/shared/ui';
import { cn } from '@/core/lib/cn';
import { showError } from '@/shared/lib/toast';
import { getApiErrorMessage } from '@/core/api/api-error-message';
import {
  clearStoredNotificationToken,
  getStoredNotificationToken,
  useNotificationRegistration,
} from '../application/use-notification-registration';
import {
  useMyPushTokenDevice,
  useRemovePushTokenDevice,
  useUpdatePushTokenMode,
} from '../application/use-push-notification-mode';
import type { PushNotificationMode } from '@/core/api/users.api';

const NOTIFICATION_MODE_OPTIONS: { mode: PushNotificationMode; label: string; description: string }[] = [
  { mode: 'all', label: 'همه', description: 'دریافت تمام اعلان‌ها' },
  { mode: 'medium', label: 'متوسط', description: 'دریافت اعلان‌های مهم‌تر' },
  { mode: 'weak', label: 'کم', description: 'فقط اعلان‌های ضروری' },
];

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationSettingsModal({ isOpen, onClose }: NotificationSettingsModalProps) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="تنظیمات اعلان‌ها"
      zIndexClassName="z-[1000]"
      className="p-3 sm:p-5"
      panelClassName="border-hair w-full max-w-md overflow-hidden rounded-[10px] border bg-[#080402] p-3 shadow-[0_34px_100px_-42px_var(--glow)] sm:p-7"
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <h3 className="text-[15px] font-black">تنظیمات اعلان‌ها</h3>
        <button
          type="button"
          onClick={onClose}
          aria-label="بستن"
          className="text-ink-3 hover:text-ink grid size-9 place-items-center rounded-full transition-colors hover:bg-white/5"
        >
          <Icon name="plus" size={18} className="rotate-45" />
        </button>
      </div>

      <NotificationsSection />
    </BaseModal>
  );
}

function NotificationsSection() {
  const notifications = useNotificationRegistration();
  // The device-list fetch is async and can lag behind a register/disable action, so the
  // toggle itself reflects the two synchronous signals we already have: browser permission
  // and whether this browser holds a registered token. The device fetch only feeds the
  // mode selector below, not the toggle's on/off state.
  const hasStoredToken = Boolean(getStoredNotificationToken());
  const isEnabled = notifications.isSupported && notifications.permission === 'granted' && hasStoredToken;
  const deviceQuery = useMyPushTokenDevice({ enabled: isEnabled });
  const updateMode = useUpdatePushTokenMode();
  const removeDevice = useRemovePushTokenDevice();
  const device = deviceQuery.data;
  const isToggling = notifications.isRegistering || removeDevice.isPending;

  const handleToggle = async (checked: boolean) => {
    if (checked) {
      await notifications.register();
      return;
    }

    try {
      if (device) {
        await removeDevice.mutateAsync(device.id);
      } else {
        await notifications.unregister();
      }
      clearStoredNotificationToken();
    } catch (error) {
      showError(getApiErrorMessage(error, 'غیرفعال‌سازی اعلان‌ها انجام نشد.'));
    }
  };

  const handleModeChange = (mode: PushNotificationMode) => {
    if (!device || device.notificationMode === mode) return;
    updateMode.mutate({ tokenId: device.id, mode });
  };

  if (!notifications.isSupported) {
    return (
      <p className="text-ink-3 px-1 py-2 text-[11.5px] leading-6">
        {notifications.availability === 'requires-install'
          ? 'برای فعال‌سازی اعلان‌ها، ابتدا قبیله را روی صفحه اصلی گوشی نصب کن.'
          : 'اعلان‌ها روی این مرورگر یا دستگاه پشتیبانی نمی‌شود.'}
      </p>
    );
  }

  return (
    <div className="grid gap-2">
      <div className="grid min-h-13 w-full min-w-0 grid-cols-[32px_minmax(0,1fr)] items-start gap-x-2 gap-y-2 rounded-[9px] border border-[rgba(255,98,0,.12)] bg-[rgba(255,98,0,.08)] px-2.5 py-2.5 sm:grid-cols-[36px_minmax(0,1fr)_44px] sm:items-center sm:gap-3 sm:px-3 sm:py-2">
        <span className="text-gold grid size-8 shrink-0 place-items-center rounded-[8px] bg-[rgba(243,186,99,.08)] sm:size-9">
          <Icon name="bell" size={17} />
        </span>
        <div className="min-w-0 flex-1 text-right">
          <b className="block text-[12.5px] font-black">اعلان‌ها</b>
          <span className="text-ink-3 mt-1 block text-[10.5px] leading-5 sm:truncate">
            یادآوری کورس‌ها، پاداش‌ها و خبرهای مهم قبیله
          </span>
        </div>
        <div className="col-span-2 flex justify-end sm:col-span-1 sm:block">
          <Toggle checked={isEnabled} disabled={isToggling} onChange={handleToggle} />
        </div>
      </div>

      {isEnabled && device && (
        <div className="rounded-[9px] border border-[rgba(255,98,0,.12)] bg-[rgba(255,98,0,.08)] px-2.5 py-2.5 sm:px-3">
          <b className="block text-right text-[12px] font-black">میزان دریافت اعلان</b>
          <div className="mt-2.5 grid grid-cols-3 gap-1.5">
            {NOTIFICATION_MODE_OPTIONS.map((option) => (
              <button
                key={option.mode}
                type="button"
                disabled={updateMode.isPending}
                onClick={() => handleModeChange(option.mode)}
                className={cn(
                  'rounded-[7px] border px-1.5 py-2 text-center text-[11px] font-black transition-colors disabled:cursor-not-allowed disabled:opacity-60',
                  device.notificationMode === option.mode
                    ? 'border-ember text-[#1a0a00] [background:var(--fire-grad)]'
                    : 'border-hair text-ink-2 hover:border-hair-2',
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
          <p className="text-ink-3 mt-2 text-right text-[10.5px] leading-5">
            {NOTIFICATION_MODE_OPTIONS.find((option) => option.mode === device.notificationMode)
              ?.description ?? ''}
          </p>
        </div>
      )}
    </div>
  );
}
