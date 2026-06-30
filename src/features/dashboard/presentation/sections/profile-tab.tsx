import { Icon, type IconName } from '@/shared/ui';
import { cn } from '@/core/lib/cn';
import {
  ACHIEVEMENTS,
  PROFILE_STATS,
  SETTINGS,
  USER,
} from '@/features/dashboard/domain/dashboard.data';
import { toPersianDigits } from '@/core/lib/persian';
import { Panel } from '../components/panel';
import { PhoenixIcon } from './dashboard-sidebar';

export function ProfileTab() {
  const xpPct = Math.round((USER.xp / USER.xpMax) * 100);

  return (
    <div className="flex flex-col gap-6">
      <div className="relative overflow-hidden rounded-[26px] border border-[rgba(255,130,50,.18)] px-8 py-9 [background:linear-gradient(135deg,rgba(255,98,0,.15),rgba(243,186,99,.07))]">
        <div className="flex flex-wrap items-center gap-7">
          <span
            className="relative grid size-24 shrink-0 place-items-center rounded-full text-[34px] font-black text-[#1a0a00] [background:var(--fire-grad)]"
            style={{ background: USER.avatar }}
          >
            {USER.initial}
            <span className="absolute -end-1 -bottom-1 grid size-8 place-items-center rounded-full border-2 border-[#0e0806] text-xs font-extrabold text-[#1a0a00] [background:var(--fire-grad)]">
              {toPersianDigits(USER.level)}
            </span>
          </span>
          <div className="flex-1">
            <h2 className="text-[26px] font-black">{USER.name}</h2>
            <p className="text-gold">
              {USER.title} · سطح {toPersianDigits(USER.level)}
            </p>
            <div className="mt-4 flex flex-wrap gap-6">
              {PROFILE_STATS.map((s) => (
                <div key={s.label}>
                  <b className="text-gradient-fire block text-xl font-black">{s.value}</b>
                  <small className="text-ink-3 text-[12px]">{s.label}</small>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-6 max-w-[400px]">
          <div className="mb-1.5 flex items-center justify-between text-[12px]">
            <span className="text-ink-2 flex items-center gap-1.5">
              <PhoenixIcon className="size-3.5 rounded-full" />
              تجربه (XP) · {USER.title}
            </span>
            <span className="text-gold font-bold tabular-nums">
              {toPersianDigits(USER.xp.toLocaleString('en-US').replace(/,/g, '٬'))} /{' '}
              {toPersianDigits(USER.xpMax.toLocaleString('en-US').replace(/,/g, '٬'))}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full [background:var(--glass-2)]">
            <div className="h-full [background:var(--fire-grad)]" style={{ width: `${xpPct}%` }} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel
          title="نقشه‌راه رشد فردی"
          action={<span className="text-gold text-[13px] font-bold">۸ از ۱۲</span>}
        >
          <div className="flex gap-1.5">
            {Array.from({ length: 12 }, (_, i) => (
              <span
                key={i}
                className={cn(
                  'h-2 flex-1 rounded-full',
                  i < 8
                    ? '[background:var(--fire-grad)]'
                    : i === 8
                      ? '[background:linear-gradient(90deg,var(--color-ember),var(--color-gold))]'
                      : '[background:var(--glass-2)]',
                )}
              />
            ))}
          </div>
          <p className="text-ink-3 mt-4 text-[13px] leading-[1.8]">
            ۸ مرحله از مسیر رشد فردی‌ات را کامل کرده‌ای. برای آزادسازی مرحله‌ی بعد، تمرین تمرکز عمیق
            را تمام کن.
          </p>
        </Panel>

        <Panel title="تنظیمات">
          <div className="grid grid-cols-2 gap-3">
            {SETTINGS.map((s) => (
              <button
                key={s.label}
                type="button"
                className="border-hair hover:border-hair-2 flex items-center gap-3 rounded-[14px] border px-3.5 py-3 text-start transition-[transform,border-color] [background:var(--glass-2)] hover:-translate-x-[3px]"
              >
                <span className="text-gold grid size-9 shrink-0 place-items-center rounded-[10px] [background:var(--glass)]">
                  <Icon name={s.icon as IconName} size={18} />
                </span>
                <b className="flex-1 text-[13.5px] font-bold">{s.label}</b>
                <Icon name="arrow-left" size={16} className="text-ink-3" />
              </button>
            ))}
          </div>
        </Panel>
      </div>

      <Panel
        title="دستاوردها"
        action={<a className="text-gold cursor-pointer text-[13px] font-bold">مشاهده همه</a>}
      >
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-6">
          {ACHIEVEMENTS.map((a) => (
            <div key={a.label} className="flex flex-col items-center gap-2 text-center">
              <span
                className={cn(
                  'grid size-[60px] place-items-center rounded-[18px]',
                  a.unlocked
                    ? 'text-gold [background:linear-gradient(135deg,rgba(243,186,99,.2),rgba(204,67,8,.12))]'
                    : 'text-ink-4 [background:var(--glass-2)]',
                )}
              >
                <Icon name={a.icon as IconName} size={26} />
              </span>
              <span className={cn('text-[11px]', a.unlocked ? 'text-ink-2' : 'text-ink-4')}>
                {a.label}
              </span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
