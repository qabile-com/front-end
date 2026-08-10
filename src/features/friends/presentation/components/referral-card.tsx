import { showError, showSuccess } from '@/shared/lib/toast';
import { CopyButton, Icon } from '@/shared/ui';
import type { FriendsProgram } from '../../domain/friends.types';

export function ReferralCard({ program }: { program: FriendsProgram | null }) {
  const inviteCode = program?.inviteCode ?? program?.referralCode ?? '';
  const referralLink = program?.referralLink ?? '';

  const shareReferral = async () => {
    if (!referralLink) return;
    const text = 'به قبیله بپیوند و مسیر رشدت را با من شروع کن.';

    try {
      if (navigator.share) {
        await navigator.share({ title: 'دعوت به قبیله', text, url: referralLink });
        return;
      }
      await navigator.clipboard.writeText(referralLink);
      showSuccess('لینک دعوت کپی شد.');
    } catch {
      showError('اشتراک گذاری انجام نشد.');
    }
  };

  return (
    <section className="rounded-[24px] border border-[rgba(43,212,168,.20)] p-4 [background:linear-gradient(135deg,rgba(43,212,168,.08),rgba(255,98,0,.06),rgba(0,0,0,.18))] sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-black text-white">لینک اختصاصی ثبت نام</h2>
          <p className="text-ink-3 mt-1 text-sm">این لینک را برای دوستانت بفرست.</p>
        </div>
        <button
          type="button"
          onClick={() => void shareReferral()}
          className="text-gold grid size-11 shrink-0 place-items-center rounded-2xl border border-[rgba(243,186,99,.24)] bg-black/28"
          aria-label="اشتراک گذاری لینک دعوت"
        >
          <Icon name="share" size={18} />
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-[220px_minmax(0,1fr)]">
        <ReadonlyCopyField label="کد معرف" value={inviteCode} />
        <ReadonlyCopyField label="لینک معرف" value={referralLink} />
      </div>
    </section>
  );
}

function ReadonlyCopyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[16px] border border-[rgba(255,98,0,.14)] bg-black/24 p-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-ink-3 text-xs font-bold">{label}</span>
        <CopyButton value={value} idleLabel="کپی" className="text-gold min-h-8 text-xs" iconSize={15} />
      </div>
      <p className="text-ink truncate text-left text-sm font-black" dir="ltr">
        {value || 'در حال ساخت'}
      </p>
    </div>
  );
}
