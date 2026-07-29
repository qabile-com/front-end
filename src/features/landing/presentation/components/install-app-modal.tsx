'use client';

import { useCallback, useEffect, useState } from 'react';
import { BaseModal, Button, Icon, OptionalImage } from '@/shared/ui';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const DISMISS_KEY = 'qabile-install-modal-dismissed-at';
export const FIRST_LOGIN_INSTALL_PROMPT_SEEN_KEY = 'qabile-first-login-install-prompt-seen';
const DISMISS_DAYS = 7;

interface InstallAppModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  openOnEligibleVisit?: boolean;
  markFirstLoginPromptAsSeen?: boolean;
}

export function InstallAppModal({
  isOpen: controlledOpen,
  onClose,
  openOnEligibleVisit = false,
  markFirstLoginPromptAsSeen = false,
}: InstallAppModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const isOpen = controlledOpen ?? internalOpen;

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      ('standalone' in window.navigator && window.navigator.standalone === true);
    const isMobile = window.matchMedia('(max-width: 767px)').matches;

    if (!openOnEligibleVisit || isStandalone || !isMobile) return;

    const dismissedAt = Number(window.localStorage.getItem(DISMISS_KEY) ?? 0);
    const dismissWindow = DISMISS_DAYS * 24 * 60 * 60 * 1000;
    if (dismissedAt && Date.now() - dismissedAt < dismissWindow) return;

    const timer = window.setTimeout(() => setInternalOpen(true), 1400);
    return () => window.clearTimeout(timer);
  }, [openOnEligibleVisit]);

  const closeModal = useCallback(() => {
    window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    if (markFirstLoginPromptAsSeen) {
      window.localStorage.setItem(FIRST_LOGIN_INSTALL_PROMPT_SEEN_KEY, '1');
    }
    setInternalOpen(false);
    onClose?.();
  }, [markFirstLoginPromptAsSeen, onClose]);

  const handleInstall = useCallback(async () => {
    if (!installPrompt) {
      setHint('اگر پنجره نصب باز نشد، از منوی مرورگر گزینه Add to Home Screen یا نصب برنامه را انتخاب کن.');
      return;
    }

    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
      if (markFirstLoginPromptAsSeen) {
        window.localStorage.setItem(FIRST_LOGIN_INSTALL_PROMPT_SEEN_KEY, '1');
      }
      setInternalOpen(false);
      onClose?.();
    }
    setInstallPrompt(null);
  }, [installPrompt, markFirstLoginPromptAsSeen, onClose]);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={closeModal}
      title="دانلود اپلیکیشن قبیله"
      zIndexClassName="z-[1200]"
      className="p-2 sm:p-4"
      panelClassName="border-hair relative w-full max-w-[330px] overflow-hidden rounded-[22px] border bg-[#050302] p-3 shadow-[0_32px_110px_-38px_var(--glow)]"
    >
      <button
        type="button"
        aria-label="بستن"
        onClick={closeModal}
        className="absolute top-4 left-4 z-20 grid size-9 place-items-center rounded-[10px] border border-[rgba(255,98,0,.48)] text-ember transition-[transform,background] duration-200 hover:scale-105 hover:[background:rgba(255,98,0,.12)]"
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

      <div className="relative h-[344px] overflow-hidden rounded-[16px]">
        <OptionalImage
          src="/assets/install-phoenix.webp"
          alt=""
          className="object-cover object-center"
          loading="lazy"
        />
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#050302] to-transparent" />
      </div>

      <div className="-mt-1 px-1 pb-1 text-center">
        <p className="text-ink text-[14px] leading-8">
          اپلیکیشن قبیله ققنوس را نصب کن و هر روز با آموزش، تمرین، تعامل و همراهی
          هم‌قبیله‌ای‌هایت، یک نسخه قدرتمندتر از خودت بساز.
        </p>

        {hint && <p className="text-gold mt-3 text-[12px] leading-6">{hint}</p>}

        <Button
          type="button"
          variant="primary"
          size="lg"
          block
          onClick={() => void handleInstall()}
          className="mt-5 min-h-13 rounded-[14px] text-[16px]"
        >
          <Icon name="flame" size={18} />
          دانلود اپلیکیشن
        </Button>
      </div>
    </BaseModal>
  );
}
