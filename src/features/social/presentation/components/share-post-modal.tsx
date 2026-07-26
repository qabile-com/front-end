'use client';

import { GlassCard, Icon, Button } from '@/shared/ui';
import { useScrollLock } from '@/shared/hooks/use-scroll-lock';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function SharePostModal({ isOpen, onClose }: Props) {
  useScrollLock(isOpen);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
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
    </div>
  );
}
