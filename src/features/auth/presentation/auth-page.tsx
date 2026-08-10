'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleOAuthProvider } from '@react-oauth/google';
import {
  EmberCanvas,
  GradText,
  Icon,
  LandingPhoenix,
  MotionItem,
  MotionList,
  MotionPage,
  PhoenixArt,
  Skeleton,
} from '@/shared/ui';
import { toPersianDigits } from '@/core/lib/persian';
import { useLandingPublicData } from '@/features/landing/application/use-landing-public-data';
import { landingPublicRepo } from '@/features/landing/infrastructure/repository-factory';
import { resolveAuthEntryTarget } from '@/core/auth/resolve-auth-entry';
import { getSafeRedirectPath } from '@/core/auth/redirect';
import { authRepo } from '../infrastructure/repository-factory';
import { AuthCard } from './components/auth-card';

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'missing-google-client-id';
const shouldMockGoogleAuth =
  process.env.NEXT_PUBLIC_MOCK_GOOGLE_AUTH === 'true' ||
  !process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export function AuthPage() {
  const router = useRouter();
  const [authCheckPending, setAuthCheckPending] = useState(true);
  const [initialReferralCode] = useState(() => {
    if (typeof window === 'undefined') return '';
    const params = new URLSearchParams(window.location.search);
    return params.get('ref') ?? params.get('referralCode') ?? '';
  });
  const { stats } = useLandingPublicData(landingPublicRepo);
  const totalMembers = stats.data?.totalMembers ?? 52000;
  const rating = stats.data?.rating ?? 4.9;

  const getRedirectTo = useCallback(() => {
    return getSafeRedirectPath(new URLSearchParams(window.location.search).get('next'), '/home');
  }, []);

  useEffect(() => {
    let cancelled = false;
    const next = getRedirectTo();

    void resolveAuthEntryTarget().then((target) => {
      if (cancelled) return;
      if (target === '/home') {
        router.replace(next);
        return;
      }
      setAuthCheckPending(false);
    });
    return () => {
      cancelled = true;
    };
  }, [getRedirectTo, router]);

  if (authCheckPending) {
    return <AuthGateLoader />;
  }

  return (
    <>
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            'radial-gradient(52% 44% at 28% -2%,rgba(255,98,0,.11),transparent 58%),radial-gradient(42% 34% at 82% 4%,rgba(243,186,99,.06),transparent 58%),radial-gradient(60% 50% at 50% 110%,rgba(204,67,8,.09),transparent 58%)',
        }}
      />
      <EmberCanvas />

      <MotionPage className="relative z-1 flex min-h-screen">
        <aside className="relative hidden flex-col overflow-hidden px-12 py-11 lg:flex lg:basis-[46%]">
          <PhoenixArt className="pointer-events-none absolute inset-0 size-full scale-125 object-contain object-[center_40%] opacity-[0.18] blur-[28px]" />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'linear-gradient(to left, rgba(5,3,2,.9) 0%, rgba(5,3,2,.2) 100%), linear-gradient(to top, rgba(5,3,2,.8) 0%, transparent 50%)',
            }}
          />
          <div className="relative z-1 flex flex-1 flex-col">
            <div className="my-auto py-8">
              <h2 className="text-[clamp(28px,2.8vw,38px)] leading-[1.15] font-black tracking-[-0.015em]">
                ققنوس از آتش نمی‌ترسد؛ &nbsp;<GradText>از سکون می‌ترسد.</GradText>
              </h2>
              <p className="text-ink-2 mt-3.5 max-w-125 text-[16px] leading-[1.85]">
                ققنوس از دل آتش متولد می‌شود؛ تو هم با هر قدم، به نسخه‌ای بهتر از خودت نزدیک‌تر
                می‌شوی.
              </p>
            </div>

            <MotionList className="border-hair flex max-w-125 flex-wrap justify-between gap-5 border-t pt-8">
              {stats.isLoading
                ? Array.from({ length: 3 }).map((_, index) => (
                    <MotionItem key={index} className="flex min-w-22 flex-col gap-2">
                      <Skeleton className="h-5 w-18" />
                      <Skeleton className="h-3 w-24" />
                    </MotionItem>
                  ))
                : [
                    { b: `${toPersianDigits(totalMembers)}+`, s: 'عضو فعال' },
                    { b: `${rating} ★`, s: 'رضایت کاربران' },
                    { b: 'رایگان', s: 'شروع بدون هزینه' },
                  ].map((t) => (
                    <MotionItem key={t.s} className="flex flex-col gap-0.75">
                      <b className="text-gradient-fire text-[18px] font-black">{t.b}</b>
                      <small className="text-ink-3 text-[12px]">{t.s}</small>
                    </MotionItem>
                  ))}
            </MotionList>
          </div>
        </aside>

        <div className="relative flex min-h-screen flex-1 flex-col items-center justify-center px-5 py-10 lg:px-5 lg:pb-10">
          <MotionItem className="w-full max-w-[420px]">
            <GoogleOAuthProvider clientId={googleClientId}>
              <AuthCard
                repository={authRepo}
                getRedirectTo={getRedirectTo}
                googleEnabled={Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID)}
                googleMockEnabled={shouldMockGoogleAuth}
                initialReferralCode={initialReferralCode}
              />
            </GoogleOAuthProvider>
          </MotionItem>

          <Link
            href="/"
            className="text-ink-3 hover:text-gold mt-5 flex items-center gap-1.5 text-[13px] transition-colors"
          >
            <Icon name="arrow-right" size={14} />
            بازگشت به صفحه اصلی
          </Link>
        </div>
      </MotionPage>
    </>
  );
}

function AuthGateLoader() {
  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden px-5 [background:var(--color-bg)]">
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            'radial-gradient(52% 44% at 50% -2%,rgba(255,98,0,.14),transparent 58%),radial-gradient(60% 50% at 50% 110%,rgba(204,67,8,.1),transparent 58%)',
        }}
      />
      <EmberCanvas />
      <div className="relative z-1 flex flex-col items-center gap-5 text-center">
        <div className="relative size-28">
          <span className="border-ember/30 absolute inset-0 animate-ping rounded-full border" />
          <span className="from-ember/25 via-gold/15 absolute inset-1 animate-pulse rounded-full bg-linear-to-br to-transparent blur-md" />
          <LandingPhoenix className="absolute inset-2 drop-shadow-[0_0_24px_rgba(255,98,0,.45)]" />
        </div>
        <div>
          <p className="text-ink text-base font-black">در حال بررسی ورود...</p>
          <p className="text-ink-4 mt-1 text-xs">اگر قبلاً وارد شده باشی، مستقیم به خانه می‌روی.</p>
        </div>
      </div>
    </main>
  );
}
