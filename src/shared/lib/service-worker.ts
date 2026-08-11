const SERVICE_WORKER_URL = '/sw.js';
const SERVICE_WORKER_SCOPE = '/';
const READY_TIMEOUT_MS = 15_000;

export function isServiceWorkerSupported() {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator;
}

/**
 * Returns an *active* service worker registration, registering one first if needed.
 *
 * Push notifications must not depend on PwaProvider having already registered the worker:
 * that registration is gated behind NODE_ENV/NEXT_PUBLIC_ENABLE_SW, so on local dev there is
 * no worker at all and a bare `navigator.serviceWorker.ready` would hang forever, leaving the
 * enable-notifications flow stuck with no error. Registering on demand here makes the flow work
 * in every environment, and the timeout guarantees we fail loudly instead of hanging.
 */
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
