'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  deleteNotificationDevice,
  registerNotificationDevice,
} from '@/core/api/notifications.api';
import {
  getFirebaseNotificationToken,
  isFirebaseMessagingAvailable,
  listenForForegroundMessages,
} from '../infrastructure/firebase-client';
import { useAuthSession } from '@/providers/auth-provider';
import { showError, showSuccess } from '@/shared/lib/toast';
import { isIosDevice, isStandalonePwa } from '@/shared/lib/pwa-platform';

const TOKEN_STORAGE_KEY = 'qabile:fcm-token';
const TOKEN_USER_STORAGE_KEY = 'qabile:fcm-token-user-id';
const DEVICE_ID_STORAGE_KEY = 'qabile:notification-device-id';

export function useNotificationRegistration() {
  const auth = useAuthSession();
  const [isRegistering, setIsRegistering] = useState(false);
  const [shouldShowPrompt, setShouldShowPrompt] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const registeredForUserRef = useRef<string | null>(null);
  const authRef = useRef(auth);

  useEffect(() => {
    authRef.current = auth;
  }, [auth]);

  const register = useCallback(async () => {
    const currentAuth = authRef.current;
    if (!currentAuth.isLoggedIn || !currentAuth.user?.id) return null;
    if (!isSupported) return null;
    if (
      typeof window === 'undefined' ||
      !('Notification' in window) ||
      !('serviceWorker' in navigator)
    ) {
      return null;
    }

    setIsRegistering(true);
    try {
      const permission =
        Notification.permission === 'default'
          ? await Notification.requestPermission()
          : Notification.permission;

      if (permission !== 'granted') return null;

      const registration = await navigator.serviceWorker.ready;
      const token = await getFirebaseNotificationToken(registration);
      if (!token) return null;

      await registerNotificationDevice({ token, platform: 'web', deviceId: getDeviceId() });
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
    // iOS only supports web push for a PWA added to the home screen (16.4+); the underlying
    // APIs (Notification/PushManager) are present in a regular Safari/Chrome-iOS tab too, so
    // isFirebaseMessagingAvailable() alone would report "supported" there and burn the
    // permission prompt on a request that can never actually deliver a push.
    if (isIosDevice() && !isStandalonePwa()) {
      queueMicrotask(() => setIsSupported(false));
      return undefined;
    }

    void isFirebaseMessagingAvailable().then((available) => {
      if (!cancelled) setIsSupported(available);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // Intentionally doesn't persist a "dismissed" cooldown: as long as permission isn't granted,
  // the login effect below re-prompts on every subsequent login.
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
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (!isSupported) return;

    // Browsers never re-show the native prompt once denied; requestPermission() would just
    // resolve to 'denied' silently, so there's nothing useful our own modal can do here.
    if (Notification.permission === 'denied') return;

    // Not yet decided by the user — ask on every login (not gated by any prior dismissal),
    // per product requirement: keep asking until they actually grant or deny it.
    if (Notification.permission === 'default') {
      queueMicrotask(() => setShouldShowPrompt(true));
      return;
    }

    // Permission is already 'granted' here — only (re)register the device token if we haven't
    // already done so for this user, to avoid redundant calls on every render.
    const tokenUserId = window.localStorage.getItem(TOKEN_USER_STORAGE_KEY);
    if (registeredForUserRef.current === auth.user?.id || tokenUserId === auth.user?.id) {
      registeredForUserRef.current = auth.user?.id ?? null;
      return;
    }

    queueMicrotask(() => void register());
  }, [auth.isLoggedIn, auth.isReady, auth.user?.id, isSupported, register, unregister]);

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
  };
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
