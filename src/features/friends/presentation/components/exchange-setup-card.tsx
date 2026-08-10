import type { FormEvent, HTMLAttributes } from 'react';
import { cn } from '@/core/lib/cn';
import { Button, Icon, Input } from '@/shared/ui';
import { getIdentityType } from '../../domain/validation';

interface ExchangeSetupCardProps {
  exchangeReferralUrl: string;
  identity: string;
  exchangeInvalid: boolean;
  identityInvalid: boolean;
  isSubmitting: boolean;
  onExchangeChange: (value: string) => void;
  onIdentityChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function ExchangeSetupCard({
  exchangeReferralUrl,
  identity,
  exchangeInvalid,
  identityInvalid,
  isSubmitting,
  onExchangeChange,
  onIdentityChange,
  onSubmit,
}: ExchangeSetupCardProps) {
  const identityType = getIdentityType(identity);
  const identityHint =
    identity && identityType !== 'unknown'
      ? `نوع شناسه: ${identityType === 'email' ? 'ایمیل' : identityType === 'uid' ? 'UID' : 'کیف پول'}`
      : 'شناسه صرافی، ایمیل یا هر اطلاعاتی که برای اتصال حساب لازم است.';

  return (
    <section className="rounded-[24px] border border-[rgba(255,98,0,.18)] p-4 [background:var(--glass)] sm:p-5">
      <div className="mb-5 flex items-start gap-3">
        <span className="text-gold grid size-11 shrink-0 place-items-center rounded-2xl border border-[rgba(243,186,99,.24)] bg-black/24">
          <Icon name="lock" size={19} />
        </span>
        <div>
          <h2 className="text-base font-black text-white">فعال سازی لینک اختصاصی</h2>
          <p className="text-ink-3 mt-1 text-sm leading-7">
            لینک معرفی صرافی و شناسه خودت را وارد کن تا صفحه دوستان و لینک ثبت نام اختصاصی فعال شود.
          </p>
        </div>
      </div>

      <form noValidate onSubmit={onSubmit} className="grid gap-4">
        <LabeledField
          label="لینک معرفی صرافی"
          value={exchangeReferralUrl}
          placeholder="https://thetruetrade.io/r/ABC123"
          inputMode="url"
          invalid={exchangeInvalid}
          helper={
            exchangeInvalid
              ? 'لینک باید با فرمت thetruetrade.io/r/code باشد.'
              : 'لینک معرفی TrueTrade که دوستانت با آن ثبت نام می‌کنند.'
          }
          onChange={onExchangeChange}
        />
        <LabeledField
          label="اطلاعات شناسایی"
          value={identity}
          placeholder="ایمیل، UID یا آدرس کیف پول"
          invalid={identityInvalid}
          helper={
            identityInvalid ? 'شناسه را وارد کن.' : identityHint
          }
          onChange={onIdentityChange}
        />
        <Button type="submit" block disabled={isSubmitting}>
          {isSubmitting ? 'در حال ثبت...' : 'ثبت و فعال سازی'}
          <Icon name="check" size={17} />
        </Button>
      </form>
    </section>
  );
}

interface LabeledFieldProps {
  label: string;
  value: string;
  placeholder: string;
  helper: string;
  invalid?: boolean;
  inputMode?: HTMLAttributes<HTMLInputElement>['inputMode'];
  onChange: (value: string) => void;
}

function LabeledField({
  label,
  value,
  placeholder,
  helper,
  invalid,
  inputMode,
  onChange,
}: LabeledFieldProps) {
  return (
    <label className="block">
      <span className="text-ink mb-2 block text-sm font-black">{label}</span>
      <Input
        value={value}
        placeholder={placeholder}
        invalid={invalid}
        inputMode={inputMode}
        dir="ltr"
        className="text-left"
        onChange={(event) => onChange(event.target.value)}
      />
      <span className={cn('mt-2 block text-xs leading-6', invalid ? 'text-danger' : 'text-ink-3')}>
        {helper}
      </span>
    </label>
  );
}
