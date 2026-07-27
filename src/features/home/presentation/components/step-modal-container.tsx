// src/features/dashboard/presentation/components/step-modal-container.tsx

import { useRoadmapStepDetail } from '../../application/use-roadmap-step-detail';
import type { IRoadmapStepRepository } from '../../domain/roadmap-repository';
import { BaseModal, ErrorState, ModalSkeleton } from '@/shared/ui';
import { StepModal } from './step-modal';

interface Props {
  stepId: number | null;
  onClose: () => void;
  onComplete: () => void;
  isCompleting?: boolean;
  repository: IRoadmapStepRepository;
}

export function StepModalContainer({
  stepId,
  onClose,
  onComplete,
  isCompleting = false,
  repository,
}: Props) {
  if (stepId === null) return null;

  return (
    <StepLoader
      key={stepId}
      stepId={stepId}
      onClose={onClose}
      onComplete={onComplete}
      isCompleting={isCompleting}
      repository={repository}
    />
  );
}

function StepLoader({
  stepId,
  onClose,
  onComplete,
  isCompleting,
  repository,
}: {
  stepId: number;
  onClose: () => void;
  onComplete: () => void;
  isCompleting: boolean;
  repository: IRoadmapStepRepository;
}) {
  const { detail, loading, error } = useRoadmapStepDetail(repository, stepId);

  if (loading) {
    return (
      <BaseModal isOpen onClose={onClose} title="در حال دریافت مرحله" className="bg-black/60" panelClassName="w-full max-w-md">
        <ModalSkeleton />
      </BaseModal>
    );
  }

  if (error || !detail) {
    return (
      <BaseModal isOpen onClose={onClose} title="خطای مرحله" className="bg-black/60" panelClassName="w-full max-w-md">
        <ErrorState
          compact
          title="جزئیات مرحله آماده نشد"
          message={error ?? 'اطلاعات این مرحله دریافت نشد.'}
          action={{ label: 'بستن', onClick: onClose, icon: 'arrow-left' }}
        />
      </BaseModal>
    );
  }

  return (
    <StepModal
      isOpen
      onClose={onClose}
      onComplete={onComplete}
      isCompleting={isCompleting}
      detail={detail}
    />
  );
}
