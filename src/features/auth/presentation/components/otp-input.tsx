'use client';

import { useEffect, useRef, type ChangeEvent, type ClipboardEvent, type KeyboardEvent } from 'react';
import { cn } from '@/core/lib/cn';
import { OTP_LENGTH } from '@/features/auth/domain/validation';

interface OtpInputProps {
  value: string;
  onChange: (code: string) => void;
  error?: boolean;
  ok?: boolean;
  autoFocus?: boolean;
}

export function OtpInput({ value, onChange, error, ok, autoFocus = false }: OtpInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length: OTP_LENGTH }, (_, i) => value[i] ?? '');

  useEffect(() => {
    if (!autoFocus) return;
    refs.current[0]?.focus();
  }, [autoFocus]);

  const setDigit = (idx: number, digit: string) => {
    const next = digits.slice();
    next[idx] = digit;
    onChange(next.join(''));
  };

  const handleChange = (idx: number, e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    const digit = raw ? raw[raw.length - 1]! : '';
    setDigit(idx, digit);
    if (digit && idx < OTP_LENGTH - 1) refs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      setDigit(idx - 1, '');
      refs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!text) return;
    onChange(text.padEnd(OTP_LENGTH, '').slice(0, OTP_LENGTH).replace(/\0/g, ''));
    const last = Math.min(text.length, OTP_LENGTH - 1);
    refs.current[last]?.focus();
  };

  return (
    <div
      className={cn('mb-[18px] flex justify-center gap-2.5', error && 'animate-[shake_.38s]')}
      dir="ltr"
    >
      {digits.map((digit, idx) => (
        <input
          key={idx}
          ref={(el) => {
            refs.current[idx] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(idx, e)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onPaste={handlePaste}
          autoComplete="one-time-code"
          className={cn(
            'text-ink caret-ember size-[48px] rounded-xl border-[1.5px] text-center text-[22px]! font-extrabold outline-none [background:var(--glass-2)] max-[400px]:size-[42px] max-[400px]:text-[18px]!',
            'transition-[border-color,box-shadow,transform] duration-300',
            'focus:scale-[1.06] focus:border-[rgba(255,98,0,.55)] focus:shadow-[0_0_0_3px_rgba(255,98,0,.14)]',
            error && 'border-[rgba(255,90,90,.5)]',
            ok && 'border-[rgba(43,212,168,.5)]',
            !error && !ok && digit && 'border-[rgba(255,98,0,.36)]',
            !error && !ok && !digit && 'border-hair',
          )}
        />
      ))}
    </div>
  );
}
