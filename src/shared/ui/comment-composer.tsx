'use client';

import { forwardRef } from 'react';
import { cn } from '@/core/lib/cn';
import { toPersianDigits } from '@/core/lib/persian';
import { Button } from './button';
import { Icon } from './icon';
import { Input } from './input';
import { UserAvatar } from './user-avatar';

interface CommentComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  submittingLabel?: string;
  userName?: string;
  userAvatar?: string | null;
  charLimit: number;
  className?: string;
  rowClassName?: string;
}

export const CommentComposer = forwardRef<HTMLInputElement, CommentComposerProps>(
  function CommentComposer(
    {
      value,
      onChange,
      onSubmit,
      isSubmitting = false,
      submitLabel = 'ارسال',
      submittingLabel = '...',
      userName,
      userAvatar,
      charLimit,
      className,
      rowClassName,
    },
    ref,
  ) {
    const isNearLimit = value.length >= charLimit * 0.9;

    return (
      <div className={className}>
        <div className={cn('flex min-w-0 items-center gap-2 sm:gap-3', rowClassName)}>
          <UserAvatar name={userName ?? '?'} avatar={userAvatar ?? undefined} className="size-9 text-xs" />
          <Input
            ref={ref}
            placeholder="نظرت رو بنویس..."
            value={value}
            onChange={(event) => onChange(event.target.value)}
            maxLength={charLimit}
            className="min-w-0 flex-1"
            onKeyDown={(event) => event.key === 'Enter' && onSubmit()}
          />
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onSubmit}
            disabled={!value.trim() || isSubmitting}
            className="min-h-11 shrink-0 px-3 sm:px-4"
          >
            {isSubmitting ? submittingLabel : submitLabel}
            <Icon name="send" size={15} />
          </Button>
        </div>
        <div
          className={cn(
            'mt-1 text-left text-[11px] font-bold tabular-nums',
            isNearLimit ? 'text-danger' : 'text-ink-4',
          )}
        >
          {toPersianDigits(value.length)}/{toPersianDigits(charLimit)}
        </div>
      </div>
    );
  },
);
