'use client';

import { BaseModal, Icon, OptionalImage } from '@/shared/ui';
import type { IProfileRepository } from '../../domain/profile-repository';
import { RebirthPanel } from './rebirth-panel';

interface RebirthModalProps {
  isOpen: boolean;
  onClose: () => void;
  repo: IProfileRepository;
}

export function RebirthModal({ isOpen, onClose, repo }: RebirthModalProps) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="تولد دوباره"
      zIndexClassName="z-[1000]"
      className="p-3 sm:p-5"
      panelClassName="border-hair w-full max-w-[560px] overflow-hidden rounded-[16px] border bg-[#080402] shadow-[0_34px_100px_-42px_var(--glow)]"
    >
      <div className="relative px-4 pt-4 sm:px-7 sm:pt-6">
        <button
          type="button"
          onClick={onClose}
          aria-label="بستن"
          className="absolute top-3 left-3 z-10 grid size-9 place-items-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60 sm:top-5 sm:left-6"
        >
          <Icon name="plus" size={18} className="rotate-45" />
        </button>

        <div className="pointer-events-none relative mx-auto -mb-6 h-[190px] w-full max-w-[300px] sm:h-[230px] sm:max-w-[340px]">
          <OptionalImage
            src="/assets/hero-phoenix.webp"
            alt=""
            aria-hidden="true"
            className="object-contain drop-shadow-[0_26px_45px_rgba(255,98,0,.35)]"
          />
        </div>
      </div>

      <div className="px-4 pb-5 sm:px-7 sm:pb-7">
        <RebirthPanel repo={repo} />
      </div>
    </BaseModal>
  );
}
