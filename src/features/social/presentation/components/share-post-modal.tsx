'use client';

import { BaseModal, GlassCard, Icon, Button } from '@/shared/ui';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function SharePostModal({ isOpen, onClose }: Props) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="اشتراک‌گذاری"
      panelClassName="w-full max-w-sm"
    >
      <GlassCard className="border-hair w-full max-w-sm p-6 text-center [background:var(--color-panel)]">
        <button onClick={onClose} className="text-ink-3 hover:text-ink absolute end-4 top-4">
          <Icon name="plus" size={20} className="rotate-45" />
        </button>
        <h3 className="mb-4 text-lg font-bold">اشتراک‌گذاری</h3>
        <p className="text-ink-2 mb-6 text-sm">این ویژگی به‌زودی در دسترس قرار می‌گیرد.</p>
        <Button variant="primary" onClick={onClose}>
          باشه
        </Button>
      </GlassCard>
    </BaseModal>
  );
}
