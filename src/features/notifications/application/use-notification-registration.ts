'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { deleteNotificationDevice, registerNotificationDevice } from '@/core/api/notifications.api';
import {
  getFirebaseMessagingConfig,
  getFirebaseNotificationToken,
  isFirebaseMessagingAvailable,
  listenForForegroundMessages,
} from '../infrastructure/firebase-client';
import { useAuthSession } from '@/providers/auth-provider';
import { showError, showSuccess } from '@/shared/lib/toast';
import { isIosDevice, isStandalonePwa } from '@/shared/lib/pwa-platform';
import { ensureServiceWorkerRegistration } from '@/shared/lib/service-worker';

const TOKEN_STORAGE_KEY = 'qabile:fcm-token';
const TOKEN_USER_STORAGE_KEY = 'qabile:fcm-token-user-id';
const DEVICE_ID_STORAGE_KEY = 'qabile:notification-device-id';

export type NotificationAvailability =
  /** Still resolving browser/Firebase support. */
  | 'loading'
  /** iOS outside a home-screen PWA: web push is impossible until the app is installed. */
  | 'requires-install'
  /** Page isn't a secure context (http on a LAN IP), so push APIs don't exist. */
  | 'insecure-context'
  /** Browser genuinely can't do web push, or Firebase env config is missing. */
  | 'unsupported'
  /** Everything is in place; permission state decides what to do next. */
  | 'available';

export function useNotificationRegistration() {
  const auth = useAuthSession();
  const [isRegistering, setIsRegistering] = useState(false);
  const [shouldShowPrompt, setShouldShowPrompt] = useState(false);
  const [availability, setAvailability] = useState<NotificationAvailability>('loading');
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const registeredForUserRef = useRef<string | null>(null);
  const authRef = useRef(auth);

  const isSupported = availability === 'available';

  useEffect(() => {
    authRef.current = auth;
  }, [auth]);

  const register = useCallback(async () => {
    const currentAuth = authRef.current;
    if (!currentAuth.isLoggedIn || !currentAuth.user?.id) return null;
    if (!isSupported) return null;

    setIsRegistering(true);
    try {
      // Stays inside the click's task so the browser still treats this as a user gesture —
      // iOS in particular refuses to show the native dialog otherwise.
      const nextPermission =
        Notification.permission === 'default'
          ? await Notification.requestPermission()
          : Notification.permission;

      setPermission(nextPermission);

      if (nextPermission !== 'granted') {
        setShouldShowPrompt(false);
        if (nextPermission === 'denied') {
          showError('اجازه نمایش اعلان رد شد. برای فعال‌سازی، از تنظیمات مرورگر اجازه بده.');
        }
        return null;
      }

      // Each step fails for a genuinely different reason, so they're reported separately —
      // a single catch-all makes "فعال‌سازی انجام نشد" impossible to act on.
      let registration: ServiceWorkerRegistration;
      try {
        registration = await ensureServiceWorkerRegistration();
      } catch (error) {
        console.error('[notifications] service worker never became ready', error);
        showError('سرویس‌ورکر آماده نشد. اپ را کامل ببند و دوباره باز کن.');
        return null;
      }

      let token: string | null;
      try {
        token = await getFirebaseNotificationToken(registration);
      } catch (error) {
        // Typically an invalid/mismatched VAPID key, or the push service rejecting the
        // subscription. Surfaced in the toast too because on iOS there's no reachable console
        // without plugging into a Mac, and the Firebase error code is what identifies the cause.
        console.error(
          '[notifications] getToken() failed — check NEXT_PUBLIC_FIREBASE_VAPID_KEY',
          error,
        );
        showError(getSubscribeErrorMessage(error));
        return null;
      }

      if (!token) {
        console.error('[notifications] getToken() returned no token (firebase config incomplete)');
        showError('تنظیمات اعلان کامل نیست. کمی بعد دوباره تلاش کن.');
        return null;
      }

      try {
        await registerNotificationDevice({ token, platform: 'web', deviceId: getDeviceId() });
      } catch (error) {
        console.error('[notifications] backend device registration failed', error);
        showError('ثبت دستگاه روی سرور انجام نشد. دوباره تلاش کن.');
        return null;
      }

      window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
      window.localStorage.setItem(TOKEN_USER_STORAGE_KEY, currentAuth.user.id);
      registeredForUserRef.current = currentAuth.user.id;
      setShouldShowPrompt(false);
      showSuccess('اعلان‌های قبیله فعال شد.');
      return token;
    } catch (error) {
      console.error('[notifications] registration failed', error);
      showError('فعال‌سازی اعلان‌ها انجام نشد.');
      return null;
    } finally {
      setIsRegistering(false);
    }
  }, [isSupported]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const result = await resolveAvailability();
      if (cancelled) return;

      void logDiagnostics(result);
      setAvailability(result);
      if ('Notification' in window) setPermission(Notification.permission);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Deliberately not persisted: while permission isn't granted the login effect below re-prompts
  // on every subsequent login, so dismissing only hides it for the current session.
  const dismissPrompt = useCallback(() => {
    setShouldShowPrompt(false);
  }, []);

  const unregister = useCallback(async () => {
    if (typeof window === 'undefined') return;
    const token = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) return;

    try {
      await deleteNotificationDevice(token);
    } finally {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
      window.localStorage.removeItem(TOKEN_USER_STORAGE_KEY);
      registeredForUserRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!auth.isReady) return;
    if (!auth.isLoggedIn) {
      queueMicrotask(() => setShouldShowPrompt(false));
      void unregister();
      return;
    }
    if (availability === 'loading') return;
    if (availability !== 'available') return;

    // Once denied, browsers never re-show the native dialog, so keep surfacing our own prompt
    // with instructions for re-enabling it from browser settings.
    if (Notification.permission !== 'granted') {
      queueMicrotask(() => setShouldShowPrompt(true));
      return;
    }

    // Granted — only (re)register the device token when we haven't already for this user.
    const tokenUserId = window.localStorage.getItem(TOKEN_USER_STORAGE_KEY);
    if (registeredForUserRef.current === auth.user?.id || tokenUserId === auth.user?.id) {
      registeredForUserRef.current = auth.user?.id ?? null;
      return;
    }

    queueMicrotask(() => void register());
  }, [auth.isLoggedIn, auth.isReady, auth.user?.id, availability, register, unregister]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    if (!isSupported) return undefined;

    void listenForForegroundMessages((payload) => {
      const title = payload.notification?.title ?? 'قبیله';
      const body = payload.notification?.body;
      showSuccess(body ? `${title}: ${body}` : title);
    }).then((nextUnsubscribe) => {
      unsubscribe = nextUnsubscribe;
    });

    return () => unsubscribe?.();
  }, [isSupported]);

  return {
    isRegistering,
    shouldShowPrompt,
    register,
    unregister,
    dismissPrompt,
    isSupported,
    availability,
    permission,
  };
}

async function resolveAvailability(): Promise<NotificationAvailability> {
  if (typeof window === 'undefined') return 'unsupported';

  // Service workers and the Notification API only exist in secure contexts. Reaching a dev
  // server from a phone over http://<lan-ip> is the common way to trip this.
  if (!window.isSecureContext) return 'insecure-context';

  // iOS exposes no Notification API at all in a normal Safari tab; web push works only from a
  // home-screen install (iOS 16.4+). Detect that first so we can tell the user to install.
  if (isIosDevice() && !isStandalonePwa()) return 'requires-install';

  if (
    !('Notification' in window) ||
    !('serviceWorker' in navigator) ||
    !('PushManager' in window)
  ) {
    return isIosDevice() ? 'requires-install' : 'unsupported';
  }

  return (await isFirebaseMessagingAvailable()) ? 'available' : 'unsupported';
}

async function logDiagnostics(availability: NotificationAvailability) {
  if (availability === 'available') return;

  const config = await getFirebaseMessagingConfig();

  console.warn(
    `[notifications] unavailable (${availability}).`,
    JSON.stringify(
      {
        availability,
        isSecureContext: typeof window !== 'undefined' && window.isSecureContext,
        isIos: isIosDevice(),
        isStandalonePwa: isStandalonePwa(),
        hasNotificationApi: typeof window !== 'undefined' && 'Notification' in window,
        hasServiceWorker: typeof navigator !== 'undefined' && 'serviceWorker' in navigator,
        hasPushManager: typeof window !== 'undefined' && 'PushManager' in window,
        hasFirebaseConfig: Boolean(config),
      },
      null,
      2,
    ),
  );
}

/**
 * Turns push-subscription failures into something the user can act on. Raw text like
 * "push service initialization failed" (WebKit) means nothing to them, and on iOS there's no
 * console to read, so the guidance has to live in the toast itself.
 */
function getSubscribeErrorMessage(error: unknown): string {
  const raw = [
    error instanceof Error ? error.message : '',
    typeof error === 'object' && error && 'code' in error
      ? String((error as { code?: unknown }).code ?? '')
      : '',
  ]
    .join(' ')
    .toLowerCase();

  // WebKit throws this when the Home Screen app predates push support, which a reinstall fixes.
  if (raw.includes('push service') || raw.includes('aborterror')) {
    return 'اعلان‌ها فعال نشد. اپ را از صفحه اصلی حذف کن، دوباره اضافه کن و مطمئن شو iOS نسخه ۱۶.۴ یا بالاتر است.';
  }

  if (raw.includes('token-subscribe-failed') || raw.includes('applicationserverkey')) {
    return 'اعلان‌ها فعال نشد. تنظیمات سرویس پیام‌رسان معتبر نیست.';
  }

  if (raw.includes('permission')) {
    return 'اجازه اعلان داده نشد. از تنظیمات دستگاه اعلان‌های قبیله را روشن کن.';
  }

  return 'دریافت مجوز اعلان انجام نشد. کمی بعد دوباره تلاش کن.';
}

function getDeviceId() {
  const existing = window.localStorage.getItem(DEVICE_ID_STORAGE_KEY);
  if (existing) return existing;

  const next =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `browser-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  window.localStorage.setItem(DEVICE_ID_STORAGE_KEY, next);
  return next;
}
