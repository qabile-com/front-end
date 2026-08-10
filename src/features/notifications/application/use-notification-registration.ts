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

const TOKEN_STORAGE_KEY = 'qabile:fcm-token';
const TOKEN_USER_STORAGE_KEY = 'qabile:fcm-token-user-id';
const DEVICE_ID_STORAGE_KEY = 'qabile:notification-device-id';
const PROMPT_DISMISSED_UNTIL_KEY = 'qabile:notification-prompt-dismissed-until';
const DISMISS_DAYS = 7;

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
      window.localStorage.removeItem(PROMPT_DISMISSED_UNTIL_KEY);
      setShouldShowPrompt(false);
      showSuccess('اعلان‌های قبیله فعال شد.');
      return token;
    } catch {
      showError('فعال‌سازی اعلان‌ها انجام نشد.');
      return null;
    } finally {
      setIsRegistering(false);
    }
  }, [isSupported]);

  useEffect(() => {
    let cancelled = false;
    void isFirebaseMessagingAvailable().then((available) => {
      if (!cancelled) setIsSupported(available);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const dismissPrompt = useCallback(() => {
    if (typeof window !== 'undefined') {
      const dismissedUntil = Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000;
      window.localStorage.setItem(PROMPT_DISMISSED_UNTIL_KEY, String(dismissedUntil));
    }
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

    const tokenUserId = window.localStorage.getItem(TOKEN_USER_STORAGE_KEY);
    if (registeredForUserRef.current === auth.user?.id || tokenUserId === auth.user?.id) {
      registeredForUserRef.current = auth.user?.id ?? null;
      return;
    }
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    if (!isSupported) return;

    if (Notification.permission === 'default') {
      const dismissedUntil = Number(window.localStorage.getItem(PROMPT_DISMISSED_UNTIL_KEY) ?? 0);
      queueMicrotask(() => setShouldShowPrompt(Date.now() > dismissedUntil));
      return;
    }

    if (Notification.permission !== 'granted') return;

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
