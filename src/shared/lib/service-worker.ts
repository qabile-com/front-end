const SERVICE_WORKER_URL = '/sw.js';
const SERVICE_WORKER_SCOPE = '/';
const READY_TIMEOUT_MS = 15_000;
const UPDATE_TIMEOUT_MS = 5_000;

export function isServiceWorkerSupported() {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator;
}

export async function ensureServiceWorkerRegistration(): Promise<ServiceWorkerRegistration> {
  if (!isServiceWorkerSupported()) {
    throw new Error('service worker is not supported in this browser');
  }

  const existing = await navigator.serviceWorker.getRegistration(SERVICE_WORKER_SCOPE);
  if (!existing) {
    await navigator.serviceWorker.register(SERVICE_WORKER_URL, {
      scope: SERVICE_WORKER_SCOPE,
      updateViaCache: 'none',
    });
  }

  const registration = await withTimeout(
    navigator.serviceWorker.ready,
    READY_TIMEOUT_MS,
    'service worker did not become ready in time',
  );

  try {
    await withTimeout(registration.update(), UPDATE_TIMEOUT_MS, 'service worker update timed out');
  } catch {}

  return withTimeout(
    navigator.serviceWorker.ready,
    READY_TIMEOUT_MS,
    'service worker did not become ready in time',
  );
}

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}
