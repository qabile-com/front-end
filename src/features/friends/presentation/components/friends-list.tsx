import { cn } from '@/core/lib/cn';
import { toPersianDigits } from '@/core/lib/persian';
import { Icon, Skeleton, UserAvatar } from '@/shared/ui';
import type { Friend, FriendStatus } from '../../domain/friends.types';

const STATUS_CONFIG: Record<FriendStatus, { label: string; cls: string; dot: string }> = {
  verified: {
    label: 'تأیید شده',
    cls: 'border-[#2bd4a8]/30 bg-[#2bd4a8]/10 text-[#2bd4a8]',
    dot: 'bg-[#2bd4a8]',
  },
  registered: {
    label: 'ثبت نام شده',
    cls: 'border-sky-300/30 bg-sky-300/10 text-sky-200',
    dot: 'bg-sky-300',
  },
  pending: {
    label: 'در انتظار',
    cls: 'border-[rgba(243,186,99,.34)] bg-[rgba(243,186,99,.10)] text-gold',
    dot: 'bg-gold',
  },
  not_registered: {
    label: 'ثبت نام صرافی ناقص',
    cls: 'border-white/12 bg-white/5 text-ink-3',
    dot: 'bg-ink-3',
  },
};

export function FriendsList({ friends, loading }: { friends: Friend[]; loading: boolean }) {
  return (
    <section className="rounded-[24px] border border-[rgba(255,98,0,.16)] p-4 [background:var(--glass)] sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-black text-white">دوستان شما</h2>
        <span className="text-gold rounded-full border border-[rgba(243,186,99,.22)] bg-black/24 px-3 py-1 text-xs font-black">
          {toPersianDigits(friends.length)} نفر
        </span>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-18 rounded-[16px]" />
          ))}
        </div>
      ) : friends.length === 0 ? (
        <div className="rounded-[18px] border border-dashed border-[rgba(255,98,0,.24)] bg-black/20 p-6 text-center">
          <Icon name="users" size={30} className="text-ember mx-auto" />
          <p className="text-ink mt-3 font-black">هنوز کسی را دعوت نکردی.</p>
          <p className="text-ink-3 mt-1 text-sm">لینک اختصاصی را بفرست تا این لیست پر شود.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {friends.map((friend) => (
            <FriendRow key={friend.id} friend={friend} />
          ))}
        </div>
      )}
    </section>
  );
}

function FriendRow({ friend }: { friend: Friend }) {
  const status = STATUS_CONFIG[friend.status];
  const profile = friend.profile;

  return (
    <article className="flex min-w-0 items-center gap-3 rounded-[16px] border border-[rgba(255,98,0,.12)] bg-black/24 p-3">
      <UserAvatar name={profile.name || '؟'} avatar={profile.avatar} className="size-12 rounded-[16px] text-sm text-[#1a0a00]" />
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <h3 className="truncate text-sm font-black text-white">{profile.name}</h3>
          {profile.level ? (
            <span className="text-ink-3 text-[11px] font-bold">
              سطح {toPersianDigits(profile.level)}
            </span>
          ) : null}
        </div>
        <p className="text-ink-3 mt-1 truncate text-xs">
          {profile.username ? `@${profile.username}` : profile.email || profile.title || 'کاربر قبیله'}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        <span
          className={cn(
            'inline-flex min-h-7 items-center gap-1.5 rounded-full border px-2.5 text-[11px] font-black',
            status.cls,
          )}
        >
          <span className={cn('size-1.5 rounded-full', status.dot)} />
          {status.label}
        </span>
        <time className="text-ink-4 text-[11px]" dateTime={friend.joinedAt}>
          {formatFriendDate(friend.joinedAt)}
        </time>
      </div>
    </article>
  );
}

function formatFriendDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('fa-IR', { month: 'short', day: 'numeric' }).format(date);
}
