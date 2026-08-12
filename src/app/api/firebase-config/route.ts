import { NextResponse } from 'next/server';
import { getFirebaseConfig } from '@/core/config/public-env';

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
      unsetEnvVars: REQUIRED_ENV_VARS.filter((name) => !(process.env[name] ?? '').trim()),
      vapidKeyLength: config.vapidKey.length,
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
