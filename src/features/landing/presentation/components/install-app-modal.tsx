'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { BaseModal, Button, Icon, OptionalImage, type IconName } from '@/shared/ui';

const DISMISS_KEY = 'qabile-install-modal-dismissed-at';
export const DISMISS_USER_KEY = 'qabile-install-modal-dismissed-user-id';
export const FIRST_LOGIN_INSTALL_PROMPT_SEEN_KEY = 'qabile-first-login-install-prompt-seen';
const DISMISS_DAYS = 7;

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const INSTALL_STEPS_ANDROID = [
  'از منوی مرورگر (⋮) گزینه Install app یا Add to Home Screen را بزن.',
  'نصب را تأیید کن تا آیکون قبیله به صفحه اصلی اضافه شود.',
];

const INSTALL_STEPS_IOS = [
  'روی دکمه Share پایین صفحه بزن.',
  'کمی پایین برو و Add to Home Screen را انتخاب کن.',
  'دکمه Add را بزن و قبیله را از صفحه اصلی باز کن.',
];

const PERKS: { icon: IconName; label: string }[] = [
  { icon: 'bell', label: 'دریافت اعلان‌ها' },
  { icon: 'bolt', label: 'باز شدن سریع‌تر' },
  { icon: 'phone', label: 'تجربه تمام‌صفحه' },
];

interface InstallAppModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  openOnEligibleVisit?: boolean;
  markFirstLoginPromptAsSeen?: boolean;
  currentUserId?: string | null;
}

function getInstallPlatform() {
  if (typeof window === 'undefined') return 'unknown';
  const ua = window.navigator.userAgent || '';
  const platform = window.navigator.platform || '';
  const isAndroid = /Android/i.test(ua);
  const isIOS =
    /iPhone|iPad|iPod/i.test(ua) || (platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (isAndroid) return 'android';
  if (isIOS) return 'ios';
  return 'unknown';
}

export function InstallAppModal({
  isOpen: controlledOpen,
  onClose,
  openOnEligibleVisit = false,
  markFirstLoginPromptAsSeen = false,
  currentUserId,
}: InstallAppModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const isOpen = controlledOpen ?? internalOpen;
  const platform = useMemo(() => getInstallPlatform(), []);
  const isAndroid = platform === 'android';
  const isIOS = platform === 'ios';
  const steps = isAndroid ? INSTALL_STEPS_ANDROID : isIOS ? INSTALL_STEPS_IOS : [];

  // Chrome fires this when the app is installable; capturing it lets us offer a real one-tap
  // install button instead of only telling the user to dig through the browser menu.
  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  useEffect(() => {
    if (!openOnEligibleVisit) return;
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      ('standalone' in window.navigator && window.navigator.standalone === true);
    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    if (isStandalone || !isMobile) return;

    const dismissedAt = Number(window.localStorage.getItem(DISMISS_KEY) ?? 0);
    const dismissWindow = DISMISS_DAYS * 24 * 60 * 60 * 1000;
    if (dismissedAt && Date.now() - dismissedAt < dismissWindow) {
      const dismissedUserId = window.localStorage.getItem(DISMISS_USER_KEY) ?? '';
      const stillEligible = Boolean(
        dismissedUserId && currentUserId && dismissedUserId !== currentUserId,
      );
      if (!stillEligible) return;
    }

    const timer = window.setTimeout(() => setInternalOpen(true), 1400);
    return () => window.clearTimeout(timer);
  }, [openOnEligibleVisit, currentUserId]);

  const closeModal = useCallback(() => {
    window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    if (currentUserId) {
      window.localStorage.setItem(DISMISS_USER_KEY, currentUserId);
    }
    if (markFirstLoginPromptAsSeen) {
      window.localStorage.setItem(FIRST_LOGIN_INSTALL_PROMPT_SEEN_KEY, '1');
    }
    setInternalOpen(false);
    onClose?.();
  }, [currentUserId, markFirstLoginPromptAsSeen, onClose]);

  const handleInstallClick = useCallback(async () => {
    if (!installPrompt) return;

    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    setInstallPrompt(null);
    if (choice.outcome === 'accepted') closeModal();
  }, [closeModal, installPrompt]);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={closeModal}
      title={isAndroid ? 'نصب روی Android' : isIOS ? 'نصب روی iPhone' : 'نصب اپلیکیشن'}
      zIndexClassName="z-[1200]"
      className="p-2 sm:p-4"
      panelClassName="border-hair relative w-full max-w-[330px] overflow-hidden rounded-[22px] border bg-[#050302] p-3 shadow-[0_32px_110px_-38px_var(--glow)]"
    >
      <button
        type="button"
        aria-label="بستن"
        onClick={closeModal}
        className="text-ember absolute top-4 left-4 z-20 grid size-9 place-items-center rounded-[10px] border border-[rgba(255,98,0,.48)] transition-[transform,background] duration-200 hover:scale-105 hover:[background:rgba(255,98,0,.12)]"
      >
        <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden="true">
          <path
            d="M6 6l12 12M18 6 6 18"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <div className="relative h-[150px] overflow-hidden rounded-[16px]">
        <OptionalImage
          src="/assets/install-phoenix.webp"
          alt=""
          className="object-cover object-center"
          loading="lazy"
        />
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#050302] via-[#050302]/70 to-transparent" />
      </div>

      <div className="-mt-6 px-1 pb-1">
        <h2 className="text-ink relative text-center text-[17px] font-black">
          قبیله را روی گوشی‌ات نصب کن
        </h2>
        <p className="text-ink-3 mt-1.5 text-center text-[13px] leading-6">
          {isIOS
            ? 'با افزودن به صفحه اصلی، اعلان‌ها هم برایت فعال می‌شود.'
            : 'در چند ثانیه، بدون اشغال فضای گوشی.'}
        </p>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {PERKS.map((perk) => (
            <div
              key={perk.label}
              className="border-hair flex flex-col items-center gap-1.5 rounded-[14px] border bg-[var(--glass-2)] px-1.5 py-2.5 text-center"
            >
              <Icon name={perk.icon} size={17} className="text-gold" />
              <span className="text-ink-2 text-[10.5px] leading-4 font-bold">{perk.label}</span>
            </div>
          ))}
        </div>

        {steps.length > 0 && (
          <ol className="mt-4 space-y-2.5">
            {steps.map((step, idx) => (
              <li key={step} className="flex items-start gap-2.5 text-right">
                <span className="text-gold border-hair mt-px grid size-5 shrink-0 place-items-center rounded-full border bg-[rgba(255,98,0,.1)] text-[10.5px] font-black tabular-nums">
                  {idx + 1}
                </span>
                <span className="text-ink-2 text-[12.5px] leading-6">{step}</span>
              </li>
            ))}
          </ol>
        )}

        <div className="mt-5 grid gap-2">
          {installPrompt && (
            <Button type="button" onClick={() => void handleInstallClick()} className="min-h-12">
              <Icon name="download" size={17} />
              نصب اپلیکیشن
            </Button>
          )}
          <button
            type="button"
            onClick={closeModal}
            className="text-ink-3 hover:text-ink inline-flex min-h-11 items-center justify-center rounded-xl text-[13px] font-bold transition-colors"
          >
            {installPrompt ? 'بعداً' : 'متوجه شدم'}
          </button>
        </div>
      </div>
    </BaseModal>
  );
}
