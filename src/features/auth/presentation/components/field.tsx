import type { ReactNode } from 'react';
import { Input } from '@/shared/ui';
import type { ComponentProps } from 'react';

interface FieldProps extends ComponentProps<'input'> {
  label: ReactNode;
  error?: string;

  adornment?: ReactNode;
  hasToggle?: boolean;
}

export function Field({ label, error, adornment, hasToggle, ...inputProps }: FieldProps) {
  return (
    <div className="mb-4 flex flex-col gap-[7px]">
      <label className="text-ink-2 text-[13px] font-bold">{label}</label>
      <div className="relative">
        <Input invalid={!!error} hasToggle={hasToggle} {...inputProps} />
        {adornment}
      </div>
      {error ? <span className="text-danger text-[12px]">{error}</span> : null}
    </div>
  );
}
