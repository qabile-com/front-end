'use client';

import { useState } from 'react';
import { BaseModal, Button, Icon } from '@/shared/ui';
import { cn } from '@/core/lib/cn';

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

export function ComingSoonModal({
  isOpen,
  onClose,
  title = 'در حال آماده‌سازی',
  description = 'این قابلیت به‌زودی در دسترس قرار می‌گیره. ما در حال کار روی آن هستیم.',
}: ComingSoonModalProps) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      zIndexClassName="z-[1200]"
      className="p-2 sm:p-4"
    >
      <div className="border-hair w-full max-w-[360px] overflow-hidden rounded-[22px] border bg-[#050302] p-5 shadow-[0_32px_110px_-38px_var(--glow)]">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="border-hair text-gold inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-extrabold [background:rgba(255,98,0,.1)]">
            <Icon name="flame" size={14} />
            به‌زودی
          </span>
          <p className="text-ink-2 text-[13px] leading-7">{description}</p>
          <Button
            type="button"
            variant="primary"
            size="md"
            block
            onClick={onClose}
            className="mt-2 min-h-12 rounded-[14px] text-[15px]"
          >
            باشه
          </Button>
        </div>
      </div>
    </BaseModal>
  );
}
