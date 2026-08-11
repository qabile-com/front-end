import { NextResponse } from 'next/server';

// NEXT_PUBLIC_* values are inlined at build time, so a deployment that sets them only in the
// hosting environment (without rebuilding) ships a bundle with an empty Firebase config and
// notifications silently disable themselves. Serving the same values from the server at request
// time removes that trap: setting the env vars is enough, no rebuild required.
//
// Firebase web config and the VAPID *public* key are safe to expose — they ship in the client
// bundle by design and are not secrets.
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
  return NextResponse.json(
    {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? '',
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? '',
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? '',
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ?? '',
      // Names only (never values) so this is safe to open in a browser while debugging a deploy.
      missingEnvVars: REQUIRED_ENV_VARS.filter((name) => !process.env[name]),
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
