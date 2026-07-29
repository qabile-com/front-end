import { notFound } from 'next/navigation';
import { getStaticRoadmapStep } from '@/features/roadmap/domain/static-roadmap-steps';
import { RoadmapStepPage } from '@/features/roadmap/presentation/components/roadmap-step-page';

export default async function RoadmapStepRoutePage({
  params,
}: {
  params: Promise<{ stepId: string }>;
}) {
  const { stepId } = await params;
  const step = getStaticRoadmapStep(Number(stepId));

  if (!step) notFound();

  return <RoadmapStepPage step={step} />;
}
