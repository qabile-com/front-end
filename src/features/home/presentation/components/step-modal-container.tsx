// src/features/dashboard/presentation/components/step-modal-container.tsx

import { useRoadmapStepDetail } from '../../application/use-roadmap-step-detail';
import type { IRoadmapStepRepository } from '../../domain/roadmap-repository';
import { ErrorState, ModalSkeleton } from '@/shared/ui';
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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <ModalSkeleton />
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <ErrorState
          compact
          title="جزئیات مرحله آماده نشد"
          message={error ?? 'اطلاعات این مرحله دریافت نشد.'}
          action={{ label: 'بستن', onClick: onClose, icon: 'arrow-left' }}
        />
      </div>
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
