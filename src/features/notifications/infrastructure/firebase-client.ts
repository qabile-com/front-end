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
import { getFirebaseConfig, type FirebaseMessagingConfig } from '@/core/config/public-env';

const buildTimeConfig: FirebaseMessagingConfig = getFirebaseConfig();

let configPromise: Promise<FirebaseMessagingConfig | null> | null = null;

const REQUIRED_KEYS = [
  'apiKey',
  'authDomain',
  'projectId',
  'messagingSenderId',
  'appId',
  'vapidKey',
] as const satisfies readonly (keyof FirebaseMessagingConfig)[];

const ENV_VAR_BY_KEY: Record<(typeof REQUIRED_KEYS)[number], string> = {
  apiKey: 'NEXT_PUBLIC_FIREBASE_API_KEY',
  authDomain: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  projectId: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  messagingSenderId: 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  appId: 'NEXT_PUBLIC_FIREBASE_APP_ID',
  vapidKey: 'NEXT_PUBLIC_FIREBASE_VAPID_KEY',
};

export function getMissingConfigEnvVars(config: Partial<FirebaseMessagingConfig>): string[] {
  return REQUIRED_KEYS.filter((key) => !config[key]).map((key) => ENV_VAR_BY_KEY[key]);
}

function isComplete(config: Partial<FirebaseMessagingConfig>): config is FirebaseMessagingConfig {
  return getMissingConfigEnvVars(config).length === 0;
}

export function getFirebaseMessagingConfig(): Promise<FirebaseMessagingConfig | null> {
  configPromise ??= (async () => {
    if (isComplete(buildTimeConfig)) return buildTimeConfig;

    try {
      const response = await fetch('/api/firebase-config', { cache: 'no-store' });
      if (!response.ok) throw new Error(`config request failed: ${response.status}`);

      const runtimeConfig = (await response.json()) as Partial<FirebaseMessagingConfig>;
      if (isComplete(runtimeConfig)) return runtimeConfig;

      console.error(
        '[notifications] firebase config incomplete. Missing env vars in this deployment: ' +
          `${getMissingConfigEnvVars(runtimeConfig).join(', ')}. ` +
          'Note: NEXT_PUBLIC_FIREBASE_VAPID_KEY is NOT part of the Firebase config snippet — ' +
          'copy it from Project Settings > Cloud Messaging > Web Push certificates.',
      );
      return null;
    } catch (error) {
      console.error('[notifications] failed to resolve firebase config', error);
      return null;
    }
  })();

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
