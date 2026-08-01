'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { BaseModal, OptionalImage } from '@/shared/ui';

const DISMISS_KEY = 'qabile-install-modal-dismissed-at';
export const DISMISS_USER_KEY = 'qabile-install-modal-dismissed-user-id';
export const FIRST_LOGIN_INSTALL_PROMPT_SEEN_KEY = 'qabile-first-login-install-prompt-seen';
const DISMISS_DAYS = 7;

const INSTALL_STEPS_ANDROID = [
  'با مرورگر Chrome وارد سایت qabile.com شو.',
  'از منوی مرورگر گزینه Install app یا Add to Home Screen را انتخاب کن.',
  'نصب را تأیید کن تا آیکون قبیله روی صفحه اصلی موبایلت اضافه شود.',
];

const INSTALL_STEPS_IOS = [
  'با مرورگر Safari وارد سایت qabile.com شو.',
  'روی دکمه Share پایین صفحه بزن.',
  'گزینه Add to Home Screen را انتخاب کن و سپس Add را بزن.',
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
  const isOpen = controlledOpen ?? internalOpen;
  const platform = useMemo(() => getInstallPlatform(), []);
  const isAndroid = platform === 'android';
  const isIOS = platform === 'ios';
  const steps = isAndroid ? INSTALL_STEPS_ANDROID : isIOS ? INSTALL_STEPS_IOS : [];

  const shouldShow = useMemo(() => {
    if (!openOnEligibleVisit) return false;
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      ('standalone' in window.navigator && window.navigator.standalone === true);
    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    if (isStandalone || !isMobile) return false;

    const dismissedAt = Number(window.localStorage.getItem(DISMISS_KEY) ?? 0);
    const dismissWindow = DISMISS_DAYS * 24 * 60 * 60 * 1000;
    if (dismissedAt && Date.now() - dismissedAt < dismissWindow) {
      const dismissedUserId = window.localStorage.getItem(DISMISS_USER_KEY) ?? '';
      if (dismissedUserId && currentUserId && dismissedUserId !== currentUserId) {
        return true;
      }
      return false;
    }

    return true;
  }, [openOnEligibleVisit, currentUserId]);

  useEffect(() => {
    if (!shouldShow) return;
    const timer = window.setTimeout(() => setInternalOpen(true), 1400);
    return () => window.clearTimeout(timer);
  }, [shouldShow]);

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

      <div className="relative h-[260px] overflow-hidden rounded-[16px]">
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
          {isAndroid
            ? 'قبیله رو مثل اپلیکیشن روی صفحه اصلی اندرویدت نصب کن.'
            : isIOS
              ? 'قبیله رو مثل اپلیکیشن روی صفحه اصلی آیفونت اضافه کن.'
              : 'اپلیکیشن قبیله ققنوس را نصب کن و هر روز با آموزش، تمرین، تعامل و همراهی هم‌قبیله‌ای‌هایت، یک نسخه قدرتمندتر از خودت بساز.'}
        </p>

        {steps.length > 0 && (
          <ol className="text-ink-2 mt-4 space-y-2 text-right text-[13px] leading-7">
            {steps.map((step, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-gold mt-[2px] font-black">{idx + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </BaseModal>
  );
}
