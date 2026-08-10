'use client';

import { BaseModal, Button, Icon, InlineSpinner } from '@/shared/ui';

interface DeletePostConfirmModalProps {
  isOpen: boolean;
  isDeleting?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeletePostConfirmModal({
  isOpen,
  isDeleting = false,
  onClose,
  onConfirm,
}: DeletePostConfirmModalProps) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={isDeleting ? () => undefined : onClose}
      title="حذف پست"
      panelClassName="w-full max-w-sm"
      className="bg-black/75"
      closeOnOutsideClick={!isDeleting}
      closeOnEscape={!isDeleting}
    >
      <section className="rounded-[18px] border border-danger/25 bg-[rgba(13,5,2,.96)] p-5 text-right shadow-[0_24px_70px_-44px_rgba(255,60,60,.55)]">
        <span className="text-danger grid size-11 place-items-center rounded-2xl border border-danger/25 bg-danger/10">
          <Icon name="trash" size={20} />
        </span>
        <h2 className="mt-4 text-base font-black text-white">این پست حذف شود؟</h2>
        <p className="text-ink-3 mt-2 text-sm leading-7">
          بعد از حذف، پست از محفل و پروفایل تو برداشته می‌شود.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="ghost"
            disabled={isDeleting}
            className="border border-[rgba(255,255,255,.12)]"
            onClick={onClose}
          >
            انصراف
          </Button>
          <Button
            type="button"
            disabled={isDeleting}
            className="bg-danger text-white hover:bg-red-500"
            onClick={onConfirm}
          >
            {isDeleting && <InlineSpinner className="size-4" />}
            حذف
          </Button>
        </div>
      </section>
    </BaseModal>
  );
}
