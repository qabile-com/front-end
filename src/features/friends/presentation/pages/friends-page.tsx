'use client';

import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import Image from 'next/image';
import { BaseModal, Button, CopyButton, DashboardPageShell, Icon } from '@/shared/ui';
import { cn } from '@/core/lib/cn';
import { toPersianDigits } from '@/core/lib/persian';
import { showError, showSuccess } from '@/shared/lib/toast';
import { isValidExchangeReferralUrl, isValidIdentity } from '../../domain/validation';
import { friendsRepo } from '../../infrastructure/repository-factory';
import {
  useFriends,
  useFriendsProgram,
  useSubmitExchangeData,
} from '../../application/use-friends';
import { ExchangeSetupCard } from '../components/exchange-setup-card';
import { FriendsPageSkeleton } from '../components/friends-page-skeleton';
import type { Friend, FriendsProgram } from '../../domain/friends.types';

const REWARD_STEPS = [
  { step: 1, label: 'دوستت رو دعوت کن' },
  { step: 2, label: 'دوستت با ما هم پرواز میشه' },
  { step: 3, label: '5 آتش پاداش میگیری' },
];

export function FriendsPage() {
  const program = useFriendsProgram(friendsRepo);
  const friends = useFriends(friendsRepo, { limit: 12, page: 1 });
  const submitExchange = useSubmitExchangeData(friendsRepo);
  const [exchangeReferralUrl, setExchangeReferralUrl] = useState('');
  const [identity, setIdentity] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [userClosedSetupModal, setUserClosedSetupModal] = useState(false);
  const autoOpenPerformed = useRef(false);

  const currentProgram = program.program;
  const hasActivatedFriendsProgram = Boolean(
    currentProgram?.referralCode || currentProgram?.inviteCode,
  );
  const totalReward = useMemo(
    () => Math.max(currentProgram?.totalFriends ?? friends.friends.length, 0) * 50,
    [currentProgram?.totalFriends, friends.friends.length],
  );

  const exchangeInvalid = submitted && !isValidExchangeReferralUrl(exchangeReferralUrl);
  const identityInvalid = submitted && !isValidIdentity(identity);

  useEffect(() => {
    if (
      program.loading ||
      hasActivatedFriendsProgram ||
      userClosedSetupModal ||
      autoOpenPerformed.current
    ) {
      return;
    }

    setIsSetupModalOpen(true);
    autoOpenPerformed.current = true;
  }, [hasActivatedFriendsProgram, program.loading, userClosedSetupModal]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);

    if (!isValidExchangeReferralUrl(exchangeReferralUrl)) {
      showError('لینک معرفی صرافی معتبر نیست.');
      return;
    }

    if (!isValidIdentity(identity)) {
      showError('شناسه را وارد کن.');
      return;
    }

    try {
      await submitExchange.mutateAsync({
        exchangeReferralUrl: exchangeReferralUrl.trim(),
        identity: identity.trim(),
      });
      showSuccess('اطلاعات صرافی ثبت شد و لینک دعوت اختصاصی فعال شد.');
      setSubmitted(false);
      setIsSetupModalOpen(false);
      setUserClosedSetupModal(false);
    } catch (error) {
      showError(error instanceof Error ? error.message : 'ثبت اطلاعات صرافی انجام نشد.');
    }
  };

  const openSetupModal = () => {
    setUserClosedSetupModal(false);
    setIsSetupModalOpen(true);
  };

  const closeSetupModal = () => {
    setIsSetupModalOpen(false);
    setUserClosedSetupModal(true);
  };

  if (program.loading) return <FriendsPageSkeleton />;

  return (
    <DashboardPageShell size="wide">
      <div className="mx-auto max-w-[1216px] space-y-5 pb-4">
        <FriendsHero />

        {hasActivatedFriendsProgram ? (
          <>
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(360px,1.16fr)] lg:items-stretch">
              <RewardPath />
              <ReferralPanel program={currentProgram} />
            </div>

            <FriendsRewardList
              friends={friends.friends}
              loading={friends.loading}
              totalReward={totalReward}
            />
          </>
        ) : (
          <FriendsProgramLockedState onActivate={openSetupModal} />
        )}
      </div>

      <BaseModal
        isOpen={isSetupModalOpen}
        onClose={closeSetupModal}
        title="فعال سازی لینک دعوت دوستان"
        panelClassName="w-full max-w-lg"
        className="bg-black/75"
      >
        <ExchangeSetupCard
          exchangeReferralUrl={exchangeReferralUrl}
          identity={identity}
          exchangeInvalid={exchangeInvalid}
          identityInvalid={identityInvalid}
          isSubmitting={submitExchange.isPending}
          onExchangeChange={setExchangeReferralUrl}
          onIdentityChange={setIdentity}
          onSubmit={handleSubmit}
        />
      </BaseModal>
    </DashboardPageShell>
  );
}

function FriendsHero() {
  return (
    <section className="overflow-hidden rounded-[18px] border border-[rgba(255,98,0,.22)] bg-[linear-gradient(115deg,rgba(255,98,0,.18),rgba(18,7,2,.92)_40%,rgba(6,3,2,.96))] px-4 py-5 shadow-[0_26px_80px_-58px_var(--glow)] sm:rounded-[28px] sm:px-8 lg:px-14 lg:py-8">
      <div className="grid items-center gap-3 lg:grid-cols-[minmax(0,1fr)_300px]">
        <h1 className="order-2 text-center text-[19px] leading-9 font-black text-white sm:text-3xl lg:order-1 lg:text-center lg:text-[34px]">
          دوستات رو دعوت کن و 5 آتش جایزه بگیر
        </h1>
        <Image
          src="/assets/friends.webp"
          alt=""
          width={600}
          height={360}
          className="order-1 mx-auto h-auto w-full max-w-[280px] object-contain lg:order-2 lg:max-w-[300px]"
          priority
        />
      </div>
    </section>
  );
}

function ReferralPanel({ program }: { program: FriendsProgram | null }) {
  const referralLink = program?.referralLink ?? '';

  const shareText = 'به قبیله بپیوند و 5 آتش هدیه بگیر.';
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${referralLink}`)}`;

  const nativeShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: 'دعوت به قبیله', text: shareText, url: referralLink });
        return;
      }
      await navigator.clipboard.writeText(referralLink);
      showSuccess('لینک دعوت کپی شد.');
    } catch {
      showError('اشتراک گذاری انجام نشد.');
    }
  };

  return (
    <section className="rounded-[18px] border border-[rgba(255,98,0,.16)] bg-[rgba(13,5,2,.82)] p-3.5 sm:rounded-[22px] sm:p-4">
      <h2 className="mb-3 text-right text-sm font-black text-white">لینک دعوت شما</h2>

      <div className="flex min-h-14 items-center gap-2 rounded-[10px] border border-[rgba(255,98,0,.22)] bg-[rgba(255,98,0,.12)] px-3">
        <CopyButton
          value={referralLink}
          idleLabel="کپی"
          copiedLabel="کپی شد"
          iconSize={18}
          className="text-gold min-w-21 flex-row-reverse rounded-[8px] bg-[rgba(243,186,99,.08)] px-3 text-xs"
        />
        <p className="text-ink-2 min-w-0 flex-1 truncate text-left text-xs font-medium" dir="ltr">
          {referralLink.replace(/^https?:\/\//, '')}
        </p>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <ShareTile label="اشتراک" tone="gold" onClick={() => void nativeShare()}>
          <Icon name="share" size={19} />
        </ShareTile>
        <ShareTile label="واتساپ" tone="whatsapp" href={whatsappUrl}>
          <Icon name="whatsapp" size={19} />
        </ShareTile>
        <ShareTile label="تلگرام" tone="telegram" href={telegramUrl}>
          <Icon name="telegram" size={19} />
        </ShareTile>
        {/* <ShareTile label="بیشتر" tone="more" onClick={() => void nativeShare()}>
          <span className="text-xl leading-none">⋮</span>
        </ShareTile> */}
      </div>
    </section>
  );
}

function FriendsProgramLockedState({ onActivate }: { onActivate: () => void }) {
  return (
    <section className="rounded-[18px] border border-[rgba(255,98,0,.18)] bg-[rgba(13,5,2,.84)] px-4 py-6 text-center sm:rounded-[22px] sm:px-6">
      <span className="text-gold mx-auto grid size-12 place-items-center rounded-2xl border border-[rgba(243,186,99,.22)] bg-black/24">
        <Icon name="lock" size={20} />
      </span>
      <h2 className="mt-4 text-base font-black text-white">فعال سازی صفحه دوستان</h2>
      <p className="text-ink-3 mx-auto mt-2 max-w-xl text-sm leading-7">
        برای دیدن لیست دوستان و ساخت لینک اختصاصی دعوت، لینک معرفی صرافی و شناسه‌ات را ثبت کن.
      </p>
      <Button type="button" className="mt-5 min-w-44" onClick={onActivate}>
        ثبت اطلاعات صرافی
        <Icon name="arrow-left" size={17} />
      </Button>
    </section>
  );
}

function ShareTile({
  label,
  tone,
  href,
  onClick,
  children,
}: {
  label: string;
  tone: 'gold' | 'whatsapp' | 'telegram' | 'more';
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  const cls = cn(
    'flex min-h-16 flex-col items-center justify-center gap-1 rounded-[8px] border text-[11px] font-bold transition-[transform,opacity,border-color] hover:-translate-y-0.5',
    tone === 'gold' && 'border-[rgba(243,186,99,.28)] bg-[rgba(243,186,99,.10)] text-gold',
    tone === 'whatsapp' && 'border-emerald-500/30 bg-emerald-500/12 text-emerald-400',
    tone === 'telegram' && 'border-sky-400/30 bg-sky-400/12 text-sky-300',
    tone === 'more' && 'border-[rgba(243,186,99,.28)] bg-[rgba(243,186,99,.10)] text-gold',
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={cls}>
        {children}
        <span>{label}</span>
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={cls}>
      {children}
      <span>{label}</span>
    </button>
  );
}

function RewardPath() {
  return (
    <section className="rounded-[18px] border border-[rgba(255,98,0,.12)] bg-[rgba(13,5,2,.72)] p-4 sm:rounded-[22px] sm:p-5">
      <h2 className="mb-5 text-center text-sm font-black text-white lg:text-right">مسیر پاداش</h2>
      <div className="grid grid-cols-3 gap-2">
        {REWARD_STEPS.map((item) => (
          <div key={item.step} className="flex flex-col items-center text-center">
            <span className="border-ember grid size-18 place-items-center rounded-full border border-dashed bg-[rgba(255,98,0,.08)] p-2 sm:size-22">
              <span className="text-ember grid size-full place-items-center rounded-full border border-[rgba(255,98,0,.36)] bg-[radial-gradient(circle,rgba(255,98,0,.30),rgba(64,24,8,.92))] text-sm font-bold">
                {toPersianDigits(item.step)}
              </span>
            </span>
            <p className="text-ink mt-3 max-w-24 text-[11px] leading-5 font-bold">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function FriendsRewardList({
  friends,
  loading,
  totalReward,
}: {
  friends: Friend[];
  loading: boolean;
  totalReward: number;
}) {
  const rows = friends.length ? friends : [];

  return (
    <section className="overflow-hidden rounded-[18px] border border-[rgba(255,98,0,.16)] bg-[rgba(13,5,2,.86)] sm:rounded-[22px]">
      <header className="border-b border-[rgba(255,98,0,.13)] px-4 py-3 text-right">
        <h2 className="text-sm font-black text-white">لیست دوستان دعوت شده</h2>
      </header>
      <div className="space-y-2.5 p-3.5 sm:p-4">
        <RewardSummary totalReward={totalReward} />

        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-13 rounded-[10px] bg-[rgba(255,255,255,.045)]" />
          ))
        ) : rows.length ? (
          rows.map((friend) => <FriendRewardRow key={friend.id} friend={friend} />)
        ) : (
          <p className="text-ink-3 rounded-[10px] border border-dashed border-[rgba(255,98,0,.22)] p-5 text-center text-sm">
            هنوز کسی را دعوت نکردی.
          </p>
        )}
      </div>
    </section>
  );
}

function RewardSummary({ totalReward }: { totalReward: number }) {
  return (
    <div className="border-ember flex min-h-14 items-center justify-between rounded-[8px] border bg-black/20 px-3">
      <span className="text-ember rounded-full bg-[rgba(255,98,0,.10)] px-4 py-2 text-xs font-black">
        <Icon name="flame" size={12} className="me-1 inline-block align-[-2px]" />
        {toPersianDigits(totalReward)}
      </span>
      <span className="text-ink-3 text-right text-xs sm:text-sm">
        مجموع آتش های دریافتی از دعوت دوستان
      </span>
    </div>
  );
}

function FriendRewardRow({ friend }: { friend: Friend }) {
  return (
    <article className="flex min-h-13 items-center gap-3 rounded-[10px] border border-[rgba(255,98,0,.10)] bg-[rgba(255,98,0,.08)] px-3">
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-violet-500 text-xs font-black text-white">
        س
      </span>
      <b className="min-w-0 flex-1 truncate text-right text-sm font-black text-white">
        {friend.profile.name || 'سایار.س'}
      </b>
      <span className="text-ember rounded-full bg-[rgba(255,98,0,.10)] px-3 py-1.5 text-xs font-black">
        <Icon name="flame" size={12} className="me-1 inline-block align-[-2px]" />
        {toPersianDigits(friend.profile.xp ? 5 : 5)}
      </span>
    </article>
  );
}
