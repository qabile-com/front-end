import { NextResponse } from 'next/server';
import { getFirebaseConfig } from '@/core/config/public-env';

// Serves the messaging config from the server at request time, so overriding it via env vars
// takes effect without a rebuild. Firebase web config and the VAPID *public* key are safe to
// expose — they ship in the client bundle by design and are not secrets.
export const dynamic = 'force-dynamic';

const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
  'NEXT_PUBLIC_FIREBASE_VAPID_KEY',
];

export function GET() {
  const config = getFirebaseConfig();

  return NextResponse.json(
    {
      ...config,
      // Names only (never values) so this is safe to open in a browser while debugging a deploy.
      // These are informational now that defaults exist — the config is still complete without them.
      unsetEnvVars: REQUIRED_ENV_VARS.filter((name) => !(process.env[name] ?? '').trim()),
      // Lets you spot a truncated/padded VAPID key without exposing it (expected: 87).
      vapidKeyLength: config.vapidKey.length,
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
