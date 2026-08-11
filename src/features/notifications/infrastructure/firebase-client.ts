'use client';

import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getMessaging,
  getToken,
  isSupported,
  onMessage,
  type MessagePayload,
  type Messaging,
} from 'firebase/messaging';

interface FirebaseMessagingConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  vapidKey: string;
}

const buildTimeConfig: FirebaseMessagingConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? '',
  vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ?? '',
};

let configPromise: Promise<FirebaseMessagingConfig | null> | null = null;

function isComplete(config: Partial<FirebaseMessagingConfig>): config is FirebaseMessagingConfig {
  return Boolean(
    config.apiKey &&
      config.authDomain &&
      config.projectId &&
      config.messagingSenderId &&
      config.appId &&
      config.vapidKey,
  );
}

/**
 * Resolves the Firebase messaging config, preferring the build-time values and falling back to
 * the server route when they're missing (i.e. env vars were set in the host without a rebuild).
 */
export function getFirebaseMessagingConfig(): Promise<FirebaseMessagingConfig | null> {
  configPromise ??= (async () => {
    if (isComplete(buildTimeConfig)) return buildTimeConfig;

    try {
      const response = await fetch('/api/firebase-config', { cache: 'no-store' });
      if (!response.ok) throw new Error(`config request failed: ${response.status}`);

      const runtimeConfig = (await response.json()) as Partial<FirebaseMessagingConfig>;
      if (isComplete(runtimeConfig)) return runtimeConfig;

      console.error(
        '[notifications] firebase config is incomplete — set the NEXT_PUBLIC_FIREBASE_* env vars (including NEXT_PUBLIC_FIREBASE_VAPID_KEY) in the deployment environment.',
      );
      return null;
    } catch (error) {
      console.error('[notifications] failed to resolve firebase config', error);
      return null;
    }
  })();

  // Don't cache a failed lookup: a later attempt (e.g. after the env is fixed) should retry.
  return configPromise.then((config) => {
    if (!config) configPromise = null;
    return config;
  });
}

export async function isFirebaseMessagingAvailable() {
  const config = await getFirebaseMessagingConfig();
  if (!config) return false;
  return isSupported();
}

function getFirebaseApp(config: FirebaseMessagingConfig): FirebaseApp {
  return getApps().length ? getApp() : initializeApp(config);
}

async function getFirebaseMessaging(): Promise<Messaging | null> {
  const config = await getFirebaseMessagingConfig();
  if (!config) return null;
  if (!(await isSupported())) return null;
  return getMessaging(getFirebaseApp(config));
}

export async function getFirebaseNotificationToken(
  serviceWorkerRegistration: ServiceWorkerRegistration,
) {
  const [messaging, config] = await Promise.all([
    getFirebaseMessaging(),
    getFirebaseMessagingConfig(),
  ]);
  if (!messaging || !config) return null;

  return getToken(messaging, {
    vapidKey: config.vapidKey,
    serviceWorkerRegistration,
  });
}

export async function listenForForegroundMessages(handler: (payload: MessagePayload) => void) {
  const messaging = await getFirebaseMessaging();
  if (!messaging) return () => undefined;

  return onMessage(messaging, handler);
}
