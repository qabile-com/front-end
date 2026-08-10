import { formatPersianNumber } from '@/core/lib/persian';
import { Icon, type IconName } from '@/shared/ui';
import type { FriendsProgram } from '../../domain/friends.types';

interface FriendsHeroProps {
  program: FriendsProgram | null;
  hasReferralAccess: boolean;
  stats: Array<{ label: string; value: number; icon: IconName }>;
}

export function FriendsHero({ program, hasReferralAccess, stats }: FriendsHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-[rgba(255,98,0,.20)] p-5 [background:linear-gradient(145deg,rgba(25,11,5,.96),rgba(7,4,2,.98))] sm:p-6">
      <span className="pointer-events-none absolute inset-x-8 top-0 h-px [background:linear-gradient(90deg,transparent,rgba(255,98,0,.7),transparent)]" />
      <div className="relative grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="min-w-0">
          <span className="text-ember mb-3 inline-flex min-h-8 items-center gap-2 rounded-full border border-[rgba(255,98,0,.26)] bg-black/24 px-3 text-xs font-black">
            <Icon name="users" size={15} />
            برنامه دعوت دوستان
          </span>
          <h1 className="text-2xl leading-10 font-black text-white sm:text-3xl">
            دوستات رو به قبیله دعوت کن
          </h1>
          <p className="text-ink-3 mt-3 max-w-2xl text-sm leading-7">
            برای فعال شدن لینک اختصاصی ثبت نام، اطلاعات صرافی و شناسه کاربری خودت را ثبت کن.
            بعد از آن هر کاربر با لینک تو وارد شود، اینجا وضعیتش را می‌بینی.
          </p>
          {hasReferralAccess ? (
            <p className="text-gold mt-3 text-xs font-black">
              کد فعال: {program?.inviteCode ?? program?.referralCode}
            </p>
          ) : null}
        </div>

        <div className="grid grid-cols-3 gap-2 lg:w-[360px]">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="min-w-0 rounded-[18px] border border-[rgba(255,98,0,.14)] bg-black/26 p-3 text-center"
            >
              <Icon name={stat.icon} size={18} className="text-ember mx-auto" />
              <b className="text-gold mt-2 block text-lg font-black">
                {formatPersianNumber(stat.value)}
              </b>
              <span className="text-ink-3 mt-1 block truncate text-[11px] font-bold">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
