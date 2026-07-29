'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/core/lib/cn';
import { useCopyToClipboard } from '@/shared/hooks/use-copy-to-clipboard';
import { Icon } from './icon';

interface CopyButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  value: string;
  copiedLabel?: ReactNode;
  failedLabel?: ReactNode;
  idleLabel?: ReactNode;
  iconSize?: number;
  onCopied?: (copied: boolean) => void;
}

export function CopyButton({
  value,
  copiedLabel = 'کپی شد',
  failedLabel = 'کپی نشد',
  idleLabel,
  iconSize = 18,
  className,
  disabled,
  onCopied,
  ...props
}: CopyButtonProps) {
  const { copy, copied, failed } = useCopyToClipboard();

  const label = copied ? copiedLabel : failed ? failedLabel : idleLabel;

  return (
    <button
      type="button"
      {...props}
      disabled={disabled || !value}
      onClick={async () => {
        const result = await copy(value);
        onCopied?.(result);
      }}
      className={cn(
        'inline-flex min-h-10 items-center justify-center gap-2 rounded-[10px] text-sm font-bold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-45',
        copied && 'text-emerald-300',
        failed && 'text-red-300',
        className,
      )}
    >
      {label && <span>{label}</span>}
      <Icon name={copied ? 'check' : 'copy'} size={iconSize} />
    </button>
  );
}
